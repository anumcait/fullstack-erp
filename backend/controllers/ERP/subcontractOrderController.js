const db = require('../../models/ERP');
const { Op } = require('sequelize');
const { SubcontractOrder, SubcontractOrderItem, SubcontractIssue, SubcontractReceipt } = db;
const { sequelize } = db;

exports.list = async (req, res) => {
  try {
    const where = {};
    if (req.query.search) {
      where[Op.or] = [
        { order_no: { [Op.iLike]: `%${req.query.search}%` } },
        { vendor_name: { [Op.iLike]: `%${req.query.search}%` } },
      ];
    }
    if (req.query.status) where.status = req.query.status;
    if (req.query.vendor) where.vendor_name = { [Op.iLike]: `%${req.query.vendor}%` };
    const rows = await SubcontractOrder.findAll({
      where,
      include: [{ model: SubcontractOrderItem, as: 'items' }],
      order: [['created_date', 'DESC']],
    });
    res.json(rows);
  } catch (err) { console.error('subOrder.list', err); res.status(500).json({ error: 'Failed' }); }
};

exports.get = async (req, res) => {
  try {
    const row = await SubcontractOrder.findByPk(req.params.id, {
      include: [{ model: SubcontractOrderItem, as: 'items' }],
    });
    if (!row) return res.status(404).json({ error: 'Not found' });
    res.json(row);
  } catch (err) { console.error('subOrder.get', err); res.status(500).json({ error: 'Failed' }); }
};

exports.create = async (req, res) => {
  try {
    const count = await SubcontractOrder.count();
    const year = new Date().getFullYear();
    const orderNo = req.body.order_no || `JWO-${year}-${String(count + 1).padStart(4, '0')}`;
    const { items, ...header } = req.body;
    const order = await SubcontractOrder.create({ ...header, order_no: orderNo });
    if (items && items.length > 0) {
      const orderItems = items.map((it) => ({ ...it, order_id: order.id }));
      await SubcontractOrderItem.bulkCreate(orderItems);
    }
    const result = await SubcontractOrder.findByPk(order.id, {
      include: [{ model: SubcontractOrderItem, as: 'items' }],
    });
    res.status(201).json(result);
  } catch (err) { console.error('subOrder.create', err); res.status(500).json({ error: 'Failed' }); }
};

exports.update = async (req, res) => {
  try {
    const order = await SubcontractOrder.findByPk(req.params.id);
    if (!order) return res.status(404).json({ error: 'Not found' });
    const { items, ...header } = req.body;
    await order.update(header);
    if (items) {
      await SubcontractOrderItem.destroy({ where: { order_id: order.id } });
      const orderItems = items.map((it) => ({ ...it, order_id: order.id }));
      await SubcontractOrderItem.bulkCreate(orderItems);
    }
    const result = await SubcontractOrder.findByPk(order.id, {
      include: [{ model: SubcontractOrderItem, as: 'items' }],
    });
    res.json(result);
  } catch (err) { console.error('subOrder.update', err); res.status(500).json({ error: 'Failed' }); }
};

exports.remove = async (req, res) => {
  try {
    await SubcontractOrderItem.destroy({ where: { order_id: req.params.id } });
    await SubcontractOrder.destroy({ where: { id: req.params.id } });
    res.json({ message: 'Deleted' });
  } catch (err) { console.error('subOrder.remove', err); res.status(500).json({ error: 'Failed' }); }
};

// Suggest next document numbers so the UI can pre-fill them (no manual entry).
exports.nextNumbers = async (req, res) => {
  try {
    const year = new Date().getFullYear();
    const [o, i, r] = await Promise.all([
      SubcontractOrder.count(), SubcontractIssue.count(), SubcontractReceipt.count(),
    ]);
    res.json({
      order_no: `JWO-${year}-${String(o + 1).padStart(4, '0')}`,
      issue_no: `SUB-ISS-${year}-${String(i + 1).padStart(4, '0')}`,
      receipt_no: `SUB-REC-${year}-${String(r + 1).padStart(4, '0')}`,
    });
  } catch (err) { console.error('subOrder.nextNumbers', err); res.status(500).json({ error: 'Failed' }); }
};
