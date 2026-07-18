const db = require('../../models/ERP');
const { Op } = require('sequelize');
const { CustomerMaster } = db;

exports.list = async (req, res) => {
  try {
    const where = { is_active: true };
    if (req.query.search) where.customer_name = { [Op.iLike]: `%${req.query.search}%` };
    const rows = await CustomerMaster.findAll({ where, order: [['customer_name', 'ASC']] });
    res.json(rows);
  } catch (err) { console.error('customer.list', err); res.status(500).json({ error: 'Failed to fetch customers' }); }
};

exports.get = async (req, res) => {
  try {
    const row = await CustomerMaster.findByPk(req.params.id);
    if (!row) return res.status(404).json({ error: 'Not found' });
    res.json(row);
  } catch (err) { console.error('customer.get', err); res.status(500).json({ error: 'Failed to fetch customer' }); }
};

exports.create = async (req, res) => {
  try {
    const { customer_code, customer_name, email, phone, gstin, pan, billing_address, shipping_address, city, state, pincode, contact_person, mobile, credit_limit, credit_days } = req.body;
    if (!customer_code || !customer_name) return res.status(400).json({ error: 'customer_code and customer_name are required' });
    const existing = await CustomerMaster.findOne({ where: { customer_code } });
    if (existing) return res.status(409).json({ error: 'Customer code already exists' });
    const row = await CustomerMaster.create({ customer_code, customer_name, email, phone, gstin, pan, billing_address, shipping_address, city, state, pincode, contact_person, mobile, credit_limit, credit_days });
    res.status(201).json(row);
  } catch (err) { console.error('customer.create', err); res.status(500).json({ error: 'Failed to create customer' }); }
};

exports.update = async (req, res) => {
  try {
    const row = await CustomerMaster.findByPk(req.params.id);
    if (!row) return res.status(404).json({ error: 'Not found' });
    await row.update(req.body);
    res.json(row);
  } catch (err) { console.error('customer.update', err); res.status(500).json({ error: 'Failed to update customer' }); }
};

exports.remove = async (req, res) => {
  try {
    const row = await CustomerMaster.findByPk(req.params.id);
    if (!row) return res.status(404).json({ error: 'Not found' });
    await row.update({ is_active: false });
    res.json({ message: 'Deactivated' });
  } catch (err) { console.error('customer.delete', err); res.status(500).json({ error: 'Failed to deactivate customer' }); }
};
