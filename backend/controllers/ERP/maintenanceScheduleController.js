const db = require('../../models/ERP');
const { Op } = require('sequelize');
const { MaintenanceSchedule } = db;

exports.list = async (req, res) => {
  try {
    const where = {};
    if (req.query.search) {
      where[Op.or] = [
        { schedule_no: { [Op.iLike]: `%${req.query.search}%` } },
        { task_name: { [Op.iLike]: `%${req.query.search}%` } },
      ];
    }
    if (req.query.status) where.status = req.query.status;
    const rows = await MaintenanceSchedule.findAll({ where, order: [['next_due_date', 'ASC']] });
    res.json(rows);
  } catch (err) { console.error('maintSched.list', err); res.status(500).json({ error: 'Failed' }); }
};

exports.get = async (req, res) => {
  try {
    const row = await MaintenanceSchedule.findByPk(req.params.id);
    if (!row) return res.status(404).json({ error: 'Not found' });
    res.json(row);
  } catch (err) { console.error('maintSched.get', err); res.status(500).json({ error: 'Failed' }); }
};

exports.create = async (req, res) => {
  try {
    const count = await MaintenanceSchedule.count();
    const year = new Date().getFullYear();
    const schedNo = req.body.schedule_no || `PM-${year}-${String(count + 1).padStart(4, '0')}`;
    const row = await MaintenanceSchedule.create({ ...req.body, schedule_no: schedNo });
    res.status(201).json(row);
  } catch (err) { console.error('maintSched.create', err); res.status(500).json({ error: 'Failed' }); }
};

exports.update = async (req, res) => {
  try {
    const row = await MaintenanceSchedule.findByPk(req.params.id);
    if (!row) return res.status(404).json({ error: 'Not found' });
    await row.update(req.body);
    res.json(row);
  } catch (err) { console.error('maintSched.update', err); res.status(500).json({ error: 'Failed' }); }
};

exports.remove = async (req, res) => {
  try {
    await MaintenanceSchedule.destroy({ where: { id: req.params.id } });
    res.json({ message: 'Deleted' });
  } catch (err) { console.error('maintSched.delete', err); res.status(500).json({ error: 'Failed' }); }
};
