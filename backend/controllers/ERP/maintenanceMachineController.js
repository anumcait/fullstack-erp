const db = require('../../models/ERP');
const { Op } = require('sequelize');
const { MaintenanceMachine } = db;

exports.list = async (req, res) => {
  try {
    const where = {};
    if (req.query.search) {
      where[Op.or] = [
        { machine_code: { [Op.iLike]: `%${req.query.search}%` } },
        { machine_name: { [Op.iLike]: `%${req.query.search}%` } },
      ];
    }
    if (req.query.status) where.status = req.query.status;
    const rows = await MaintenanceMachine.findAll({ where, order: [['machine_code', 'ASC']] });
    res.json(rows);
  } catch (err) { console.error('maintMachine.list', err); res.status(500).json({ error: 'Failed' }); }
};

exports.get = async (req, res) => {
  try {
    const row = await MaintenanceMachine.findByPk(req.params.id);
    if (!row) return res.status(404).json({ error: 'Not found' });
    res.json(row);
  } catch (err) { console.error('maintMachine.get', err); res.status(500).json({ error: 'Failed' }); }
};

exports.create = async (req, res) => {
  try {
    const count = await MaintenanceMachine.count();
    const code = req.body.machine_code || `MM-${String(count + 1).padStart(4, '0')}`;
    const row = await MaintenanceMachine.create({ ...req.body, machine_code: code });
    res.status(201).json(row);
  } catch (err) { console.error('maintMachine.create', err); res.status(500).json({ error: 'Failed' }); }
};

exports.update = async (req, res) => {
  try {
    const row = await MaintenanceMachine.findByPk(req.params.id);
    if (!row) return res.status(404).json({ error: 'Not found' });
    await row.update(req.body);
    res.json(row);
  } catch (err) { console.error('maintMachine.update', err); res.status(500).json({ error: 'Failed' }); }
};

exports.remove = async (req, res) => {
  try {
    await MaintenanceMachine.destroy({ where: { id: req.params.id } });
    res.json({ message: 'Deleted' });
  } catch (err) { console.error('maintMachine.delete', err); res.status(500).json({ error: 'Failed' }); }
};
