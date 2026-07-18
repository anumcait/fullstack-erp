const db = require('../../models/ERP');
const { Op } = require('sequelize');
const { ProductionDowntime, ProductionMachine } = db;

exports.list = async (req, res) => {
  try {
    const where = {};
    if (req.query.machine_id) where.machine_id = req.query.machine_id;
    if (req.query.category) where.category = req.query.category;
    if (req.query.status) where.status = req.query.status;
    if (req.query.from && req.query.to) {
      where.downtime_date = { [Op.between]: [req.query.from, req.query.to] };
    }
    const rows = await ProductionDowntime.findAll({ where, order: [['downtime_date', 'DESC'], ['createdAt', 'DESC']] });
    res.json(rows);
  } catch (err) { console.error('prodDowntime.list', err); res.status(500).json({ error: 'Failed' }); }
};

exports.get = async (req, res) => {
  try {
    const row = await ProductionDowntime.findByPk(req.params.id);
    if (!row) return res.status(404).json({ error: 'Not found' });
    res.json(row);
  } catch (err) { console.error('prodDowntime.get', err); res.status(500).json({ error: 'Failed' }); }
};

exports.create = async (req, res) => {
  try {
    const row = await ProductionDowntime.create(req.body);
    res.status(201).json(row);
  } catch (err) { console.error('prodDowntime.create', err); res.status(500).json({ error: 'Failed to create' }); }
};

exports.update = async (req, res) => {
  try {
    const row = await ProductionDowntime.findByPk(req.params.id);
    if (!row) return res.status(404).json({ error: 'Not found' });
    await row.update(req.body);
    res.json(row);
  } catch (err) { console.error('prodDowntime.update', err); res.status(500).json({ error: 'Failed' }); }
};

exports.remove = async (req, res) => {
  try {
    await ProductionDowntime.destroy({ where: { id: req.params.id } });
    res.json({ message: 'Deleted' });
  } catch (err) { console.error('prodDowntime.delete', err); res.status(500).json({ error: 'Failed' }); }
};
