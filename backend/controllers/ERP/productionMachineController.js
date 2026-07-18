const db = require('../../models/ERP');
const { Op } = require('sequelize');
const { ProductionMachine } = db;

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
    const rows = await ProductionMachine.findAll({ where, order: [['machine_code', 'ASC']] });
    res.json(rows);
  } catch (err) { console.error('prodMachine.list', err); res.status(500).json({ error: 'Failed' }); }
};

exports.get = async (req, res) => {
  try {
    const row = await ProductionMachine.findByPk(req.params.id);
    if (!row) return res.status(404).json({ error: 'Not found' });
    res.json(row);
  } catch (err) { console.error('prodMachine.get', err); res.status(500).json({ error: 'Failed' }); }
};

exports.create = async (req, res) => {
  try {
    const count = await ProductionMachine.count();
    const code = req.body.machine_code || `MCH-${String(count + 1).padStart(4, '0')}`;
    const row = await ProductionMachine.create({ ...req.body, machine_code: code });
    res.status(201).json(row);
  } catch (err) { console.error('prodMachine.create', err); res.status(500).json({ error: 'Failed to create' }); }
};

exports.update = async (req, res) => {
  try {
    const row = await ProductionMachine.findByPk(req.params.id);
    if (!row) return res.status(404).json({ error: 'Not found' });
    await row.update(req.body);
    res.json(row);
  } catch (err) { console.error('prodMachine.update', err); res.status(500).json({ error: 'Failed' }); }
};

exports.remove = async (req, res) => {
  try {
    await ProductionMachine.destroy({ where: { id: req.params.id } });
    res.json({ message: 'Deleted' });
  } catch (err) { console.error('prodMachine.delete', err); res.status(500).json({ error: 'Failed' }); }
};
