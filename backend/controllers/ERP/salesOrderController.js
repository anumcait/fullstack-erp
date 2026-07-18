const db = require('../../models/ERP');
const { Op } = require('sequelize');
const { SalesOrder, SalesOrderItem, CustomerMaster, Quotation } = db;

exports.list = async (req, res) => {
  try {
    const where = {};
    if (req.query.status) where.status = req.query.status;
    if (req.query.customer_id) where.customer_id = req.query.customer_id;
    const rows = await SalesOrder.findAll({
      where,
      include: [
        { model: CustomerMaster, as: 'customer', attributes: ['id', 'customer_code', 'customer_name'] },
        { model: SalesOrderItem, as: 'items' },
      ],
      order: [['order_date', 'DESC']],
    });
    res.json(rows);
  } catch (err) { console.error('so.list', err); res.status(500).json({ error: 'Failed to fetch orders' }); }
};

exports.get = async (req, res) => {
  try {
    const row = await SalesOrder.findByPk(req.params.id, {
      include: [
        { model: CustomerMaster, as: 'customer' },
        { model: Quotation, as: 'quotation', attributes: ['id', 'quote_no'] },
        { model: SalesOrderItem, as: 'items' },
      ],
    });
    if (!row) return res.status(404).json({ error: 'Not found' });
    res.json(row);
  } catch (err) { console.error('so.get', err); res.status(500).json({ error: 'Failed to fetch order' }); }
};

exports.create = async (req, res) => {
  const t = await db.sequelize.transaction();
  try {
    const { customer_id, order_date, delivery_date, items, tax_rate, discount_percent, shipping_charges, payment_terms, delivery_terms, notes } = req.body;
    if (!customer_id || !order_date || !items?.length) return res.status(400).json({ error: 'customer_id, order_date, and items are required' });
    const count = await SalesOrder.count({ transaction: t });
    const order_no = `SO-${String(count + 1).padStart(5, '0')}`;
    let subtotal = 0;
    const itemRows = items.map(it => {
      const qty = parseFloat(it.quantity || 1);
      const price = parseFloat(it.unit_price || 0);
      const disc = parseFloat(it.discount_percent || 0);
      const net = price - (price * disc / 100);
      const total = qty * net;
      subtotal += total;
      return { item_description: it.item_description, quantity: qty, unit: it.unit, unit_price: price, discount_percent: disc, net_price: net, total_price: total };
    });
    const discAmt = subtotal * (parseFloat(discount_percent || 0) / 100);
    const taxable = subtotal - discAmt;
    const taxAmt = taxable * (parseFloat(tax_rate || 0) / 100);
    const total = taxable + taxAmt + parseFloat(shipping_charges || 0);
    const order = await SalesOrder.create({
      order_no, customer_id, order_date, delivery_date, subtotal,
      discount_percent: parseFloat(discount_percent || 0), discount_amount: discAmt,
      tax_rate: parseFloat(tax_rate || 0), tax_amount: taxAmt,
      shipping_charges: parseFloat(shipping_charges || 0), total_amount: total,
      payment_terms, delivery_terms, notes, status: 'Confirmed',
    }, { transaction: t });
    for (const ir of itemRows) {
      await SalesOrderItem.create({ ...ir, sales_order_id: order.id }, { transaction: t });
    }
    await t.commit();
    const created = await SalesOrder.findByPk(order.id, { include: [{ model: SalesOrderItem, as: 'items' }, { model: CustomerMaster, as: 'customer' }] });
    res.status(201).json(created);
  } catch (err) { await t.rollback(); console.error('so.create', err); res.status(500).json({ error: 'Failed to create order' }); }
};

exports.update = async (req, res) => {
  const t = await db.sequelize.transaction();
  try {
    const order = await SalesOrder.findByPk(req.params.id, { transaction: t });
    if (!order) return res.status(404).json({ error: 'Not found' });
    const { customer_id, order_date, delivery_date, items, tax_rate, discount_percent, shipping_charges, payment_terms, delivery_terms, notes, status } = req.body;
    let subtotal = 0;
    if (items) {
      const itemRows = items.map(it => {
        const qty = parseFloat(it.quantity || 1);
        const price = parseFloat(it.unit_price || 0);
        const disc = parseFloat(it.discount_percent || 0);
        const net = price - (price * disc / 100);
        const total = qty * net;
        subtotal += total;
        return { ...it, total_price: total };
      });
      const discAmt = subtotal * (parseFloat(discount_percent || 0) / 100);
      const taxable = subtotal - discAmt;
      const taxAmt = taxable * (parseFloat(tax_rate || 0) / 100);
      const total = taxable + taxAmt + parseFloat(shipping_charges || 0);
      await order.update({ customer_id, order_date, delivery_date, subtotal, discount_percent, discount_amount: discAmt, tax_rate, tax_amount: taxAmt, shipping_charges, total_amount: total, payment_terms, delivery_terms, notes, status }, { transaction: t });
      await SalesOrderItem.destroy({ where: { sales_order_id: order.id }, transaction: t });
      for (const ir of itemRows) {
        await SalesOrderItem.create({ ...ir, sales_order_id: order.id }, { transaction: t });
      }
    } else {
      await order.update({ customer_id, order_date, delivery_date, payment_terms, delivery_terms, notes, status }, { transaction: t });
    }
    await t.commit();
    const updated = await SalesOrder.findByPk(order.id, { include: [{ model: SalesOrderItem, as: 'items' }, { model: CustomerMaster, as: 'customer' }] });
    res.json(updated);
  } catch (err) { await t.rollback(); console.error('so.update', err); res.status(500).json({ error: 'Failed to update order' }); }
};

exports.remove = async (req, res) => {
  try {
    const order = await SalesOrder.findByPk(req.params.id);
    if (!order) return res.status(404).json({ error: 'Not found' });
    await SalesOrderItem.destroy({ where: { sales_order_id: order.id } });
    await order.destroy();
    res.json({ message: 'Deleted' });
  } catch (err) { console.error('so.delete', err); res.status(500).json({ error: 'Failed to delete order' }); }
};
