const db = require('../../models/ERP');
const { Op } = require('sequelize');
const { PlanningCapacity } = db;

exports.list = async (req, res) => {
  try {
    const where = {};
    if (req.query.search) {
      where[Op.or] = [
        { plan_no: { [Op.iLike]: `%${req.query.search}%` } },
        { work_center: { [Op.iLike]: `%${req.query.search}%` } },
      ];
    }
    if (req.query.status) where.status = req.query.status;
    const rows = await PlanningCapacity.findAll({ where, order: [['date', 'ASC']] });
    res.json(rows);
  } catch (err) { console.error('planCap.list', err); res.status(500).json({ error: 'Failed' }); }
};

exports.get = async (req, res) => {
  try {
    const row = await PlanningCapacity.findByPk(req.params.id);
    if (!row) return res.status(404).json({ error: 'Not found' });
    res.json(row);
  } catch (err) { console.error('planCap.get', err); res.status(500).json({ error: 'Failed' }); }
};

exports.create = async (req, res) => {
  try {
    const count = await PlanningCapacity.count();
    const year = new Date().getFullYear();
    const planNo = req.body.plan_no || `CAP-${year}-${String(count + 1).padStart(4, '0')}`;
    const loadPct = req.body.used_capacity && req.body.available_capacity
      ? (parseFloat(req.body.used_capacity) / parseFloat(req.body.available_capacity)) * 100 : 0;
    const row = await PlanningCapacity.create({ ...req.body, plan_no: planNo, load_percentage: loadPct });
    res.status(201).json(row);
  } catch (err) { console.error('planCap.create', err); res.status(500).json({ error: 'Failed' }); }
};

exports.update = async (req, res) => {
  try {
    const row = await PlanningCapacity.findByPk(req.params.id);
    if (!row) return res.status(404).json({ error: 'Not found' });
    const data = { ...req.body };
    const avail = data.available_capacity || row.available_capacity;
    const used = data.used_capacity || row.used_capacity;
    data.load_percentage = avail > 0 ? (parseFloat(used) / parseFloat(avail)) * 100 : 0;
    await row.update(data);
    res.json(row);
  } catch (err) { console.error('planCap.update', err); res.status(500).json({ error: 'Failed' }); }
};

exports.remove = async (req, res) => {
  try {
    await PlanningCapacity.destroy({ where: { id: req.params.id } });
    res.json({ message: 'Deleted' });
  } catch (err) { console.error('planCap.delete', err); res.status(500).json({ error: 'Failed' }); }
};
