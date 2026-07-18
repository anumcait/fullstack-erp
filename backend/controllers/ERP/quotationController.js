const db = require('../../models/ERP');
const { Op } = require('sequelize');
const { Quotation, QuotationItem, CustomerMaster, Lead } = db;

exports.list = async (req, res) => {
  try {
    const where = {};
    if (req.query.status) where.status = req.query.status;
    if (req.query.customer_id) where.customer_id = req.query.customer_id;
    const rows = await Quotation.findAll({
      where,
      include: [
        { model: CustomerMaster, as: 'customer', attributes: ['id', 'customer_code', 'customer_name'] },
        { model: QuotationItem, as: 'items' },
      ],
      order: [['date', 'DESC']],
    });
    res.json(rows);
  } catch (err) { console.error('quote.list', err); res.status(500).json({ error: 'Failed to fetch quotations' }); }
};

exports.get = async (req, res) => {
  try {
    const row = await Quotation.findByPk(req.params.id, {
      include: [
        { model: CustomerMaster, as: 'customer' },
        { model: Lead, as: 'lead' },
        { model: QuotationItem, as: 'items' },
      ],
    });
    if (!row) return res.status(404).json({ error: 'Not found' });
    res.json(row);
  } catch (err) { console.error('quote.get', err); res.status(500).json({ error: 'Failed to fetch quotation' }); }
};

exports.create = async (req, res) => {
  const t = await db.sequelize.transaction();
  try {
    const { customer_id, date, valid_until, subject, items, tax_rate, discount_percent, shipping_charges, terms, notes } = req.body;
    if (!customer_id || !date || !items?.length) return res.status(400).json({ error: 'customer_id, date, and items are required' });
    const count = await Quotation.count({ transaction: t });
    const quote_no = `QT-${String(count + 1).padStart(5, '0')}`;
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
    const quote = await Quotation.create({
      quote_no, customer_id, date, valid_until, subject, subtotal,
      discount_percent: parseFloat(discount_percent || 0), discount_amount: discAmt,
      tax_rate: parseFloat(tax_rate || 0), tax_amount: taxAmt,
      shipping_charges: parseFloat(shipping_charges || 0), total_amount: total,
      terms, notes, status: 'Draft',
    }, { transaction: t });
    for (const ir of itemRows) {
      await QuotationItem.create({ ...ir, quotation_id: quote.id }, { transaction: t });
    }
    await t.commit();
    const created = await Quotation.findByPk(quote.id, { include: [{ model: QuotationItem, as: 'items' }, { model: CustomerMaster, as: 'customer' }] });
    res.status(201).json(created);
  } catch (err) { await t.rollback(); console.error('quote.create', err); res.status(500).json({ error: 'Failed to create quotation' }); }
};

exports.update = async (req, res) => {
  const t = await db.sequelize.transaction();
  try {
    const quote = await Quotation.findByPk(req.params.id, { transaction: t });
    if (!quote) return res.status(404).json({ error: 'Not found' });
    const { customer_id, date, valid_until, subject, items, tax_rate, discount_percent, shipping_charges, terms, notes } = req.body;
    let subtotal = 0;
    if (items) {
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
      await quote.update({
        customer_id, date, valid_until, subject, subtotal,
        discount_percent: parseFloat(discount_percent || 0), discount_amount: discAmt,
        tax_rate: parseFloat(tax_rate || 0), tax_amount: taxAmt,
        shipping_charges: parseFloat(shipping_charges || 0), total_amount: total,
        terms, notes,
      }, { transaction: t });
      await QuotationItem.destroy({ where: { quotation_id: quote.id }, transaction: t });
      for (const ir of itemRows) {
        await QuotationItem.create({ ...ir, quotation_id: quote.id }, { transaction: t });
      }
    }
    await t.commit();
    const updated = await Quotation.findByPk(quote.id, { include: [{ model: QuotationItem, as: 'items' }, { model: CustomerMaster, as: 'customer' }] });
    res.json(updated);
  } catch (err) { await t.rollback(); console.error('quote.update', err); res.status(500).json({ error: 'Failed to update quotation' }); }
};

exports.remove = async (req, res) => {
  try {
    const quote = await Quotation.findByPk(req.params.id);
    if (!quote) return res.status(404).json({ error: 'Not found' });
    await QuotationItem.destroy({ where: { quotation_id: quote.id } });
    await quote.destroy();
    res.json({ message: 'Deleted' });
  } catch (err) { console.error('quote.delete', err); res.status(500).json({ error: 'Failed to delete quotation' }); }
};

exports.convertToOrder = async (req, res) => {
  const t = await db.sequelize.transaction();
  try {
    const quote = await Quotation.findByPk(req.params.id, { include: [{ model: QuotationItem, as: 'items' }], transaction: t });
    if (!quote) return res.status(404).json({ error: 'Not found' });
    const count = await require('../../models/ERP').SalesOrder.count({ transaction: t });
    const order_no = `SO-${String(count + 1).padStart(5, '0')}`;
    const SalesOrder = require('../../models/ERP').SalesOrder;
    const SalesOrderItem = require('../../models/ERP').SalesOrderItem;
    const order = await SalesOrder.create({
      order_no, customer_id: quote.customer_id, quotation_id: quote.id,
      order_date: new Date().toISOString().slice(0, 10), subtotal: quote.subtotal,
      discount_percent: quote.discount_percent, discount_amount: quote.discount_amount,
      tax_rate: quote.tax_rate, tax_amount: quote.tax_amount,
      shipping_charges: quote.shipping_charges, total_amount: quote.total_amount,
      status: 'Confirmed',
    }, { transaction: t });
    for (const item of quote.items) {
      await SalesOrderItem.create({
        sales_order_id: order.id, item_description: item.item_description,
        quantity: item.quantity, unit: item.unit, unit_price: item.unit_price,
        discount_percent: item.discount_percent, net_price: item.net_price, total_price: item.total_price,
      }, { transaction: t });
    }
    await quote.update({ status: 'Accepted' }, { transaction: t });
    await t.commit();
    const created = await SalesOrder.findByPk(order.id, { include: [{ model: require('../../models/ERP').SalesOrderItem, as: 'items' }] });
    res.status(201).json(created);
  } catch (err) { await t.rollback(); console.error('quote.convert', err); res.status(500).json({ error: 'Failed to convert to order' }); }
};
