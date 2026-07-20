const db = require('../../models/ERP');
const { Op } = require('sequelize');
const { ProductionDailyEntry, ProductionMachine, ProductionOrder } = db;

exports.list = async (req, res) => {
  try {
    const where = {};
    if (req.query.entry_date) where.entry_date = req.query.entry_date;
    if (req.query.machine_id) where.machine_id = req.query.machine_id;
    if (req.query.shift) where.shift = req.query.shift;
    if (req.query.status) where.status = req.query.status;
    const rows = await ProductionDailyEntry.findAll({ where, order: [['entry_date', 'DESC'], ['created_date', 'DESC']] });
    res.json(rows);
  } catch (err) { console.error('prodDaily.list', err); res.status(500).json({ error: 'Failed' }); }
};

exports.get = async (req, res) => {
  try {
    const row = await ProductionDailyEntry.findByPk(req.params.id);
    if (!row) return res.status(404).json({ error: 'Not found' });
    res.json(row);
  } catch (err) { console.error('prodDaily.get', err); res.status(500).json({ error: 'Failed' }); }
};

exports.create = async (req, res) => {
  try {
    const row = await ProductionDailyEntry.create(req.body);
    res.status(201).json(row);
  } catch (err) { console.error('prodDaily.create', err); res.status(500).json({ error: 'Failed to create' }); }
};

exports.update = async (req, res) => {
  try {
    const row = await ProductionDailyEntry.findByPk(req.params.id);
    if (!row) return res.status(404).json({ error: 'Not found' });
    await row.update(req.body);
    res.json(row);
  } catch (err) { console.error('prodDaily.update', err); res.status(500).json({ error: 'Failed' }); }
};

exports.remove = async (req, res) => {
  try {
    await ProductionDailyEntry.destroy({ where: { id: req.params.id } });
    res.json({ message: 'Deleted' });
  } catch (err) { console.error('prodDaily.delete', err); res.status(500).json({ error: 'Failed' }); }
};
