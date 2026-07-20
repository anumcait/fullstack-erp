const db = require('../../models/ERP');
const { Op } = require('sequelize');
const { SubcontractReceipt, SubcontractReceiptItem, SubcontractOrder } = db;

exports.list = async (req, res) => {
  try {
    const where = {};
    if (req.query.search) {
      where[Op.or] = [
        { receipt_no: { [Op.iLike]: `%${req.query.search}%` } },
        { vendor_name: { [Op.iLike]: `%${req.query.search}%` } },
      ];
    }
    if (req.query.status) where.status = req.query.status;
    if (req.query.vendor) where.vendor_name = { [Op.iLike]: `%${req.query.vendor}%` };
    const rows = await SubcontractReceipt.findAll({
      where,
      include: [
        { model: SubcontractReceiptItem, as: 'items' },
        { model: SubcontractOrder, as: 'order', attributes: ['order_no'] },
      ],
      order: [['created_date', 'DESC']],
    });
    res.json(rows);
  } catch (err) { console.error('subReceipt.list', err); res.status(500).json({ error: 'Failed' }); }
};

exports.get = async (req, res) => {
  try {
    const row = await SubcontractReceipt.findByPk(req.params.id, {
      include: [
        { model: SubcontractReceiptItem, as: 'items' },
        { model: SubcontractOrder, as: 'order', attributes: ['order_no'] },
      ],
    });
    if (!row) return res.status(404).json({ error: 'Not found' });
    res.json(row);
  } catch (err) { console.error('subReceipt.get', err); res.status(500).json({ error: 'Failed' }); }
};

exports.create = async (req, res) => {
  try {
    const count = await SubcontractReceipt.count();
    const year = new Date().getFullYear();
    const receiptNo = req.body.receipt_no || `SUB-REC-${year}-${String(count + 1).padStart(4, '0')}`;
    const { items, ...header } = req.body;
    const doc = await SubcontractReceipt.create({ ...header, receipt_no: receiptNo });
    if (items && items.length > 0) {
      const receiptItems = items.map((it) => ({ ...it, receipt_id: doc.id }));
      await SubcontractReceiptItem.bulkCreate(receiptItems);
    }
    const result = await SubcontractReceipt.findByPk(doc.id, {
      include: [{ model: SubcontractReceiptItem, as: 'items' }],
    });
    res.status(201).json(result);
  } catch (err) { console.error('subReceipt.create', err); res.status(500).json({ error: 'Failed' }); }
};

exports.update = async (req, res) => {
  try {
    const doc = await SubcontractReceipt.findByPk(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Not found' });
    const { items, ...header } = req.body;
    await doc.update(header);
    if (items) {
      await SubcontractReceiptItem.destroy({ where: { receipt_id: doc.id } });
      const receiptItems = items.map((it) => ({ ...it, receipt_id: doc.id }));
      await SubcontractReceiptItem.bulkCreate(receiptItems);
    }
    const result = await SubcontractReceipt.findByPk(doc.id, {
      include: [{ model: SubcontractReceiptItem, as: 'items' }],
    });
    res.json(result);
  } catch (err) { console.error('subReceipt.update', err); res.status(500).json({ error: 'Failed' }); }
};

exports.remove = async (req, res) => {
  try {
    await SubcontractReceiptItem.destroy({ where: { receipt_id: req.params.id } });
    await SubcontractReceipt.destroy({ where: { id: req.params.id } });
    res.json({ message: 'Deleted' });
  } catch (err) { console.error('subReceipt.remove', err); res.status(500).json({ error: 'Failed' }); }
};
