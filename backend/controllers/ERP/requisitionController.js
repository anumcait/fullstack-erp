const db = require('../../models/ERP');
const { Op } = require('sequelize');
const { generateDocNumber } = require('../../utils/docNumber');

const PurchaseRequisition = db.PurchaseRequisition;
const PurchaseRequisitionItem = db.PurchaseRequisitionItem;
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
  const oldItems = oldV.items || [];
  const newItems = newV.items || [];
  if (JSON.stringify(oldItems) !== JSON.stringify(newItems)) {
    if (oldItems.length !== newItems.length) {
      changes.push(`Items: ${oldItems.length} → ${newItems.length} line(s)`);
    }
    const maxLen = Math.max(oldItems.length, newItems.length);
    for (let i = 0; i < maxLen; i++) {
      const oi = oldItems[i] || {};
      const ni = newItems[i] || {};
      if (i >= oldItems.length) {
        changes.push(`Item ${i + 1}: Added — ${ni.item_name || ni.item_code || 'new item'}`);
      } else if (i >= newItems.length) {
        changes.push(`Item ${i + 1}: Removed — ${oi.item_name || oi.item_code || 'item'}`);
      } else {
        for (const f of ['quantity', 'item_name', 'uom', 'est_cost', 'purpose', 'kg', 'len', 'mat_code', 'mat_desc']) {
          const ov = oi[f]; const nv = ni[f];
          if (JSON.stringify(ov) !== JSON.stringify(nv)) {
            changes.push(`Item ${i + 1} ${f}: ${ov ?? '—'} → ${nv ?? '—'}`);
          }
        }
      }
    }
  }
  return changes;
}

exports.getRequisitions = async (req, res) => {
  try {
    const { search, status, department, date_from, date_to, year } = req.query;
    const where = {};
    if (status) where.status = status;
    if (department) where.department = { [Op.iLike]: `%${department}%` };
    if (date_from || date_to || year) {
      const dateWhere = {};
      if (date_from) dateWhere[Op.gte] = date_from;
      if (date_to) dateWhere[Op.lte] = date_to;
      if (year) {
        dateWhere[Op.gte] = `${year}-01-01`;
        dateWhere[Op.lte] = `${year}-12-31`;
      }
      where.req_date = dateWhere;
    }
    if (search) {
      where[Op.or] = [
        { req_no: { [Op.iLike]: `%${search}%` } },
        { requested_by: { [Op.iLike]: `%${search}%` } },
        { department: { [Op.iLike]: `%${search}%` } },
        { indent_type: { [Op.iLike]: `%${search}%` } },
        { notes: { [Op.iLike]: `%${search}%` } },
        { sub_department: { [Op.iLike]: `%${search}%` } },
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

exports.getAmendmentHistory = async (req, res) => {
  try {
    const { id } = req.params;
    const amendments = await PRAmendment.findAll({
      where: { requisition_id: id },
      order: [['amendment_date', 'DESC']],
    });
    res.json(amendments);
  } catch (err) {
    console.error('Error fetching amendment history:', err);
    res.status(500).json({ error: 'Failed to fetch amendment history' });
  }
};

exports.createRequisition = async (req, res) => {
  try {
    let { items, ...header } = req.body;

    if (!header.req_no) {
      return res.status(400).json({ error: 'Requisition number is required.' });
    }

    header.status = header.status || 'Draft';

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
    const requisition = await PurchaseRequisition.findByPk(id, {
      include: [{ model: PurchaseRequisitionItem, as: 'items' }],
    });
    if (!requisition) return res.status(404).json({ error: 'Requisition not found' });

    const { items, ...header } = req.body;
    const originalStatus = requisition.status;

    const oldValue = {
      header: sanitize(requisition.toJSON()),
      items: (requisition.items || []).map((i) => sanitize(i.toJSON())),
    };

    await requisition.update(header);

    if (items) {
      const oldItems = requisition.items || [];
      const PurchaseRequisitionSanction = db.PurchaseRequisitionSanction;
      const dateFields = ['expected_date'];

      for (let i = 0; i < items.length; i++) {
        const incoming = { ...items[i], requisition_id: id, quantity: parseFloat(items[i].quantity) || 0 };
        dateFields.forEach((f) => { if (incoming[f] === '' || incoming[f] === undefined) incoming[f] = null; });
        if (i < oldItems.length) {
          await PurchaseRequisitionItem.update(incoming, { where: { id: oldItems[i].id } });
        } else {
          await PurchaseRequisitionItem.create(incoming);
        }
      }

      if (oldItems.length > items.length) {
        const removeIds = oldItems.slice(items.length).map((o) => o.id);
        const sanctionedIds = await PurchaseRequisitionSanction.findAll({
          where: { pr_item_id: { [Op.in]: removeIds } },
          attributes: ['pr_item_id'],
        });
        const safeIds = removeIds.filter((rid) => !sanctionedIds.some((s) => s.pr_item_id === rid));
        if (safeIds.length) await PurchaseRequisitionItem.destroy({ where: { id: { [Op.in]: safeIds } } });
      }
    }

    const newValue = {
      header: sanitize(requisition.toJSON()),
      items: items ? items.map((it) => sanitize(it)) : oldValue.items,
    };
    const summary = diffSummary(oldValue, newValue);
    if (summary.length && originalStatus === 'Approved') {
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

    const newStatus = status || 'Approved';

    // Draft → Pending: submit for authorization, assign sequential number
    if (newStatus === 'Pending' && requisition.status === 'Draft') {
      const allApproved = await PurchaseRequisition.findAll({
        where: { status: 'Approved' },
        attributes: ['req_no'],
      });
      let maxSeq = 0;
      allApproved.forEach((r) => {
        const match = r.req_no?.match(/^(\d+)$/);
        if (match) {
          const num = parseInt(match[1], 10);
          if (num > maxSeq) maxSeq = num;
        }
      });
      // Also check existing Pending/other non-draft for next seq
      const allNonDraft = await PurchaseRequisition.findAll({
        where: { status: { [Op.ne]: 'Draft' } },
        attributes: ['req_no'],
      });
      allNonDraft.forEach((r) => {
        const match = r.req_no?.match(/^(\d+)$/);
        if (match) {
          const num = parseInt(match[1], 10);
          if (num > maxSeq) maxSeq = num;
        }
      });
      await requisition.update({
        status: 'Pending',
        req_no: String(maxSeq + 1),
      });
      const result = await PurchaseRequisition.findByPk(id, {
        include: [{ model: PurchaseRequisitionItem, as: 'items' }],
      });
      return res.json(result);
    }

    // Pending → Approved: approve, no renumbering (already assigned at submit)
    if (newStatus === 'Approved' && requisition.status === 'Pending') {
      await requisition.update({
        status: 'Approved',
        approved_by: approved_by || req.session?.user?.name || 'System',
        approved_date: new Date(),
        notes: remarks || requisition.notes,
      });
      const result = await PurchaseRequisition.findByPk(id, {
        include: [{ model: PurchaseRequisitionItem, as: 'items' }],
      });
      return res.json(result);
    }

    return res.status(400).json({ error: `Cannot change status from ${requisition.status} to ${newStatus}` });
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
