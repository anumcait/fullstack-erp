const db = require('../../models/ERP');
const { Op } = require('sequelize');
const { Lead, CustomerMaster } = db;

exports.list = async (req, res) => {
  try {
    const where = {};
    if (req.query.status) where.status = req.query.status;
    if (req.query.priority) where.priority = req.query.priority;
    const rows = await Lead.findAll({
      where,
      include: [{ model: CustomerMaster, as: 'customer', attributes: ['id', 'customer_code', 'customer_name'] }],
      order: [['created_date', 'DESC']],
    });
    res.json(rows);
  } catch (err) { console.error('lead.list', err); res.status(500).json({ error: 'Failed to fetch leads' }); }
};

exports.get = async (req, res) => {
  try {
    const row = await Lead.findByPk(req.params.id, {
      include: [{ model: CustomerMaster, as: 'customer' }],
    });
    if (!row) return res.status(404).json({ error: 'Not found' });
    res.json(row);
  } catch (err) { console.error('lead.get', err); res.status(500).json({ error: 'Failed to fetch lead' }); }
};

exports.create = async (req, res) => {
  try {
    const { contact_name, company_name, email, phone, source, priority, product_interest, notes, expected_value, customer_id } = req.body;
    const count = await Lead.count();
    const lead_no = `LD-${String(count + 1).padStart(4, '0')}`;
    const row = await Lead.create({ lead_no, contact_name, company_name, email, phone, source, priority, product_interest, notes, expected_value, customer_id, status: 'New' });
    res.status(201).json(row);
  } catch (err) { console.error('lead.create', err); res.status(500).json({ error: 'Failed to create lead' }); }
};

exports.update = async (req, res) => {
  try {
    const row = await Lead.findByPk(req.params.id);
    if (!row) return res.status(404).json({ error: 'Not found' });
    await row.update(req.body);
    res.json(row);
  } catch (err) { console.error('lead.update', err); res.status(500).json({ error: 'Failed to update lead' }); }
};

exports.remove = async (req, res) => {
  try {
    const row = await Lead.findByPk(req.params.id);
    if (!row) return res.status(404).json({ error: 'Not found' });
    await row.destroy();
    res.json({ message: 'Deleted' });
  } catch (err) { console.error('lead.delete', err); res.status(500).json({ error: 'Failed to delete lead' }); }
};
