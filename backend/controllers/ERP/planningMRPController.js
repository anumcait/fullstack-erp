const db = require('../../models/ERP');
const { Op } = require('sequelize');
const { PlanningMRP } = db;

exports.list = async (req, res) => {
  try {
    const where = {};
    if (req.query.search) {
      where[Op.or] = [
        { run_no: { [Op.iLike]: `%${req.query.search}%` } },
        { item_name: { [Op.iLike]: `%${req.query.search}%` } },
      ];
    }
    const rows = await PlanningMRP.findAll({ where, order: [['run_date', 'DESC']] });
    res.json(rows);
  } catch (err) { console.error('planMRP.list', err); res.status(500).json({ error: 'Failed' }); }
};

exports.get = async (req, res) => {
  try {
    const row = await PlanningMRP.findByPk(req.params.id);
    if (!row) return res.status(404).json({ error: 'Not found' });
    res.json(row);
  } catch (err) { console.error('planMRP.get', err); res.status(500).json({ error: 'Failed' }); }
};

exports.create = async (req, res) => {
  try {
    const count = await PlanningMRP.count();
    const year = new Date().getFullYear();
    const runNo = req.body.run_no || `MRP-${year}-${String(count + 1).padStart(4, '0')}`;
    const row = await PlanningMRP.create({ ...req.body, run_no: runNo });
    res.status(201).json(row);
  } catch (err) { console.error('planMRP.create', err); res.status(500).json({ error: 'Failed' }); }
};

exports.update = async (req, res) => {
  try {
    const row = await PlanningMRP.findByPk(req.params.id);
    if (!row) return res.status(404).json({ error: 'Not found' });
    await row.update(req.body);
    res.json(row);
  } catch (err) { console.error('planMRP.update', err); res.status(500).json({ error: 'Failed' }); }
};

exports.remove = async (req, res) => {
  try {
    await PlanningMRP.destroy({ where: { id: req.params.id } });
    res.json({ message: 'Deleted' });
  } catch (err) { console.error('planMRP.delete', err); res.status(500).json({ error: 'Failed' }); }
};
