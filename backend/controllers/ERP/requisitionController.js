const db = require('../../models/ERP');
const { Op } = require('sequelize');
const { generateDocNumber } = require('../../utils/docNumber');

const PurchaseRequisition = db.PurchaseRequisition;
const PurchaseRequisitionItem = db.PurchaseRequisitionItem;
const PurchaseSettings = db.PurchaseSettings;
const PRAmendment = db.PRAmendment;

// Strip volatile/identity columns before snapshotting a record for audit.
function sanitize(obj) {
  const o = { ...obj };
  ['id', 'created_date', 'updated_at', 'requisition_id'].forEach((k) => delete o[k]);
  return o;
}

// Produce a short, human-readable list of what changed between two snapshots.
function diffSummary(oldV, newV) {
  const changes = [];
  const oh = oldV.header || {};
  const nh = newV.header || {};
  for (const k of Object.keys(nh)) {
    if (JSON.stringify(oh[k]) !== JSON.stringify(nh[k])) {
      changes.push(`${k}: ${JSON.stringify(oh[k] ?? null)} → ${JSON.stringify(nh[k] ?? null)}`);
    }
  }
  if (JSON.stringify(oldV.items) !== JSON.stringify(newV.items)) {
    changes.push(`Items: ${oldV.items.length} → ${newV.items.length} line(s)`);
  }
  return changes;
}

exports.getRequisitions = async (req, res) => {
  try {
    const { search, status, department } = req.query;
    const where = {};
    if (status) where.status = status;
    if (department) where.department = { [Op.iLike]: `%${department}%` };
    if (search) {
      where[Op.or] = [
        { req_no: { [Op.iLike]: `%${search}%` } },
        { requested_by: { [Op.iLike]: `%${search}%` } },
      ];
    }
    const requisitions = await PurchaseRequisition.findAll({
      where,
      include: [{ model: PurchaseRequisitionItem, as: 'items' }],
      order: [['created_date', 'DESC']],
    });
    res.json(requisitions);
  } catch (err) {
    console.error('Error fetching requisitions:', err);
    res.status(500).json({ error: 'Failed to fetch requisitions' });
  }
};

exports.getRequisition = async (req, res) => {
  try {
    const requisition = await PurchaseRequisition.findByPk(req.params.id, {
      include: [{ model: PurchaseRequisitionItem, as: 'items' }],
    });
    if (!requisition) return res.status(404).json({ error: 'Requisition not found' });
    res.json(requisition);
  } catch (err) {
    console.error('Error fetching requisition:', err);
    res.status(500).json({ error: 'Failed to fetch requisition' });
  }
};

exports.createRequisition = async (req, res) => {
  try {
    let { items, ...header } = req.body;

    if (!header.req_no) {
      const settings = await PurchaseSettings.findByPk(1);
      if (settings?.auto_generate_pr) {
        header.req_no = await generateDocNumber('PurchaseRequisition', 'pr_prefix', 'req_no', settings);
      } else {
        return res.status(400).json({ error: 'Requisition number is required. Enable auto-generation in Settings.' });
      }
    }

    const existing = await PurchaseRequisition.findOne({ where: { req_no: header.req_no } });
    if (existing) return res.status(409).json({ error: `Requisition '${header.req_no}' already exists` });

    const requisition = await PurchaseRequisition.create(header);
    if (items && items.length > 0) {
      const itemRows = items.map((it) => ({ ...it, requisition_id: requisition.id }));
      await PurchaseRequisitionItem.bulkCreate(itemRows);
    }
    const result = await PurchaseRequisition.findByPk(requisition.id, {
      include: [{ model: PurchaseRequisitionItem, as: 'items' }],
    });
    res.status(201).json(result);
  } catch (err) {
    console.error('Error creating requisition:', err);
    res.status(500).json({ error: 'Failed to create requisition' });
  }
};

exports.updateRequisition = async (req, res) => {
  try {
    const { id } = req.params;
    const requisition = await PurchaseRequisition.findByPk(id);
    if (!requisition) return res.status(404).json({ error: 'Requisition not found' });

    const { items, ...header } = req.body;

    const oldValue = {
      header: sanitize(requisition.toJSON()),
      items: (requisition.items || []).map((i) => sanitize(i.toJSON())),
    };

    await requisition.update(header);

    if (items) {
      await PurchaseRequisitionItem.destroy({ where: { requisition_id: id } });
      const itemRows = items.map((it) => ({ ...it, requisition_id: id }));
      await PurchaseRequisitionItem.bulkCreate(itemRows);
    }

    const newValue = {
      header: sanitize(requisition.toJSON()),
      items: items ? items.map((it) => sanitize(it)) : oldValue.items,
    };
    const summary = diffSummary(oldValue, newValue);
    if (summary.length) {
      await PRAmendment.create({
        requisition_id: id,
        amended_by: req.body.amended_by || req.session?.user?.name || 'System',
        amendment_date: new Date(),
        change_summary: summary.join('; '),
        old_value: oldValue,
        new_value: newValue,
      });
    }

    const result = await PurchaseRequisition.findByPk(id, {
      include: [{ model: PurchaseRequisitionItem, as: 'items' }],
    });
    res.json(result);
  } catch (err) {
    console.error('Error updating requisition:', err);
    res.status(500).json({ error: 'Failed to update requisition' });
  }
};

exports.approveRequisition = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, approved_by, remarks } = req.body;
    const requisition = await PurchaseRequisition.findByPk(id);
    if (!requisition) return res.status(404).json({ error: 'Requisition not found' });

    await requisition.update({
      status: status || 'Approved',
      approved_by: approved_by || req.session?.user?.name || 'System',
      approved_date: new Date(),
      notes: remarks || requisition.notes,
    });
    res.json(requisition);
  } catch (err) {
    console.error('Error approving requisition:', err);
    res.status(500).json({ error: 'Failed to approve requisition' });
  }
};

exports.deleteRequisition = async (req, res) => {
  try {
    const { id } = req.params;
    const requisition = await PurchaseRequisition.findByPk(id);
    if (!requisition) return res.status(404).json({ error: 'Requisition not found' });
    await PurchaseRequisitionItem.destroy({ where: { requisition_id: id } });
    await requisition.destroy();
    res.json({ message: 'Requisition deleted' });
  } catch (err) {
    console.error('Error deleting requisition:', err);
    res.status(500).json({ error: 'Failed to delete requisition' });
  }
};
