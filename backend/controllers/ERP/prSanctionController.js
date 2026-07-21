const db = require('../../models/ERP');
const { Op } = require('sequelize');

const PurchaseRequisitionSanction = db.PurchaseRequisitionSanction;
const PurchaseRequisition = db.PurchaseRequisition;
const PurchaseRequisitionItem = db.PurchaseRequisitionItem;

exports.getSanctions = async (req, res) => {
  try {
    const { supplier_id, requisition_id, status } = req.query;
    const where = {};
    if (supplier_id) where.supplier_id = supplier_id;
    if (requisition_id) where.requisition_id = requisition_id;
    if (status) where.status = status;

    const rows = await PurchaseRequisitionSanction.findAll({
      where,
      include: [
        { model: PurchaseRequisition, as: 'requisition', attributes: ['id', 'req_no', 'req_date', 'department', 'requested_by'] },
        { model: PurchaseRequisitionItem, as: 'prItem' },
      ],
      order: [['id', 'ASC']],
    });
    res.json(rows);
  } catch (err) {
    console.error('Error fetching sanctions:', err);
    res.status(500).json({ error: 'Failed to fetch sanctions' });
  }
};

exports.createSanctions = async (req, res) => {
  try {
    const { requisition_id, lines } = req.body;
    if (!requisition_id || !Array.isArray(lines) || lines.length === 0) {
      return res.status(400).json({ error: 'requisition_id and lines are required' });
    }
    const rows = lines.map((l) => ({
      requisition_id,
      pr_item_id: l.pr_item_id,
      supplier_id: l.supplier_id,
      sanctioned_qty: l.sanctioned_qty || 0,
      rate: l.rate || null,
      status: l.status || 'Sanctioned',
      remarks: l.remarks || null,
      sanctioned_by: l.sanctioned_by || 'System',
      sanctioned_date: new Date(),
    }));
    await PurchaseRequisitionSanction.destroy({ where: { requisition_id } });
    const created = await PurchaseRequisitionSanction.bulkCreate(rows);
    res.status(201).json(created);
  } catch (err) {
    console.error('Error creating sanctions:', err);
    res.status(500).json({ error: 'Failed to create sanctions' });
  }
};
