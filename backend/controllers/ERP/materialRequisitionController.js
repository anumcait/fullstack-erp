const db = require('../../models/ERP');
const { Op } = require('sequelize');
const { generateDocNumber } = require('../../utils/docNumber');

const MaterialRequisition = db.MaterialRequisition;
const MaterialRequisitionItem = db.MaterialRequisitionItem;
const ItemMaster = db.ItemMaster;
const PurchaseRequisition = db.PurchaseRequisition;
const PurchaseRequisitionItem = db.PurchaseRequisitionItem;
const PurchaseSettings = db.PurchaseSettings;

exports.getList = async (req, res) => {
  try {
    const { search, status } = req.query;
    const where = {};
    if (status) where.status = status;
    if (search) {
      where[Op.or] = [
        { req_no: { [Op.iLike]: `%${search}%` } },
        { requested_by: { [Op.iLike]: `%${search}%` } },
      ];
    }
    const data = await MaterialRequisition.findAll({
      where,
      include: [{ model: MaterialRequisitionItem, as: 'items' }],
      order: [['created_date', 'DESC']],
    });
    res.json(data);
  } catch (err) {
    console.error('Error fetching material requisitions:', err);
    res.status(500).json({ error: 'Failed to fetch' });
  }
};

exports.getOne = async (req, res) => {
  try {
    const doc = await MaterialRequisition.findByPk(req.params.id, {
      include: [{ model: MaterialRequisitionItem, as: 'items' }],
    });
    if (!doc) return res.status(404).json({ error: 'Not found' });
    res.json(doc);
  } catch (err) {
    console.error('Error fetching material requisition:', err);
    res.status(500).json({ error: 'Failed to fetch' });
  }
};

exports.create = async (req, res) => {
  try {
    let { items, ...header } = req.body;
    if (!header.req_no) {
      const seq = await MaterialRequisition.count() + 1;
      header.req_no = String(seq);
    }
    const doc = await MaterialRequisition.create(header);
    if (items && items.length > 0) {
      const rows = items.map((it) => ({
        ...it,
        req_id: doc.id,
        pending_quantity: it.quantity || 0,
      }));
      await MaterialRequisitionItem.bulkCreate(rows);
    }
    const result = await MaterialRequisition.findByPk(doc.id, {
      include: [{ model: MaterialRequisitionItem, as: 'items' }],
    });
    res.status(201).json(result);
  } catch (err) {
    console.error('Error creating material requisition:', err);
    res.status(500).json({ error: 'Failed to create' });
  }
};

exports.update = async (req, res) => {
  try {
    const doc = await MaterialRequisition.findByPk(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Not found' });
    if (doc.status !== 'Draft') return res.status(400).json({ error: 'Only Draft can be edited' });
    const { items, ...header } = req.body;
    await doc.update(header);
    if (items) {
      await MaterialRequisitionItem.destroy({ where: { req_id: doc.id } });
      const rows = items.map((it) => ({ ...it, req_id: doc.id, pending_quantity: it.quantity || 0 }));
      await MaterialRequisitionItem.bulkCreate(rows);
    }
    const result = await MaterialRequisition.findByPk(doc.id, {
      include: [{ model: MaterialRequisitionItem, as: 'items' }],
    });
    res.json(result);
  } catch (err) {
    console.error('Error updating material requisition:', err);
    res.status(500).json({ error: 'Failed to update' });
  }
};

exports.approve = async (req, res) => {
  try {
    const doc = await MaterialRequisition.findByPk(req.params.id, {
      include: [{ model: MaterialRequisitionItem, as: 'items' }],
    });
    if (!doc) return res.status(404).json({ error: 'Not found' });
    if (doc.status !== 'Pending') return res.status(400).json({ error: 'Only Pending can be approved' });

    await doc.update({
      status: 'Approved',
      approved_by: req.body.approved_by || 'System',
      approved_date: new Date(),
    });

    res.json(doc);
  } catch (err) {
    console.error('Error approving material requisition:', err);
    res.status(500).json({ error: 'Failed to approve' });
  }
};

exports.convertToPR = async (req, res) => {
  try {
    const doc = await MaterialRequisition.findByPk(req.params.id, {
      include: [{ model: MaterialRequisitionItem, as: 'items' }],
    });
    if (!doc) return res.status(404).json({ error: 'Not found' });

    // Check stock for each item
    const itemIds = doc.items.map((it) => it.item_id).filter(Boolean);
    const stockMap = {};
    if (itemIds.length > 0) {
      const stockItems = await ItemMaster.findAll({ where: { id: itemIds } });
      stockItems.forEach((it) => { stockMap[it.id] = Number(it.current_stock || 0); });
    }

    // Only convert items where stock < requested quantity
    const itemsToPurchase = doc.items.filter((it) => {
      const available = stockMap[it.item_id] || 0;
      const requested = Number(it.pending_quantity > 0 ? it.pending_quantity : it.quantity || 0);
      return requested > available;
    });

    if (itemsToPurchase.length === 0) {
      return res.status(400).json({ error: 'All items have sufficient stock. No purchase needed.' });
    }

    const settings = await PurchaseSettings.findByPk(1);
    const prNo = await generateDocNumber('PurchaseRequisition', 'pr_prefix', 'req_no', settings || {});

    const pr = await PurchaseRequisition.create({
      req_no: prNo,
      req_date: new Date(),
      status: 'Pending',
      remarks: `Auto-converted from MR #${doc.req_no} (insufficient stock items)`,
    });

    const prItems = itemsToPurchase.map((it) => {
      const available = stockMap[it.item_id] || 0;
      const requested = Number(it.pending_quantity > 0 ? it.pending_quantity : it.quantity || 0);
      const toPurchase = requested - available;
      return {
        req_id: pr.id,
        item_id: it.item_id,
        item_code: it.item_code,
        item_name: it.item_name,
        quantity: toPurchase,
        unit_id: it.unit_id,
        remarks: `From MR #${doc.req_no} (stock: ${available}, need: ${toPurchase})`,
      };
    });
    await PurchaseRequisitionItem.bulkCreate(prItems);

    await doc.update({ status: 'Closed', remarks: `${doc.remarks || ''} | PR #${prNo} created for ${itemsToPurchase.length} item(s)` });

    const skippedCount = doc.items.length - itemsToPurchase.length;
    let message = `PR #${prNo} created for ${itemsToPurchase.length} item(s)`;
    if (skippedCount > 0) message += `. ${skippedCount} item(s) had sufficient stock and were skipped.`;

    res.status(201).json({ pr_id: pr.id, pr_no: prNo, message, skippedCount });
  } catch (err) {
    console.error('Error converting MR to PR:', err);
    res.status(500).json({ error: 'Failed to convert' });
  }
};

exports.delete = async (req, res) => {
  try {
    const doc = await MaterialRequisition.findByPk(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Not found' });
    await MaterialRequisitionItem.destroy({ where: { req_id: doc.id } });
    await doc.destroy();
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error('Error deleting material requisition:', err);
    res.status(500).json({ error: 'Failed to delete' });
  }
};
