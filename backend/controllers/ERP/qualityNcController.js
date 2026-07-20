const db = require('../../models/ERP');
const { QualityInspection, NonConformance } = db;

exports.list = async (req, res) => {
  try {
    const where = {};
    if (req.query.status) where.status = req.query.status;
    if (req.query.nc_type) where.nc_type = req.query.nc_type;
    const rows = await NonConformance.findAll({
      where,
      include: [{ model: QualityInspection, as: 'inspection', attributes: ['id', 'inspection_no', 'inspection_type'] }],
      order: [['created_date', 'DESC']],
    });
    res.json(rows);
  } catch (err) { console.error('nc.list', err); res.status(500).json({ error: 'Failed to fetch NCs' }); }
};

exports.get = async (req, res) => {
  try {
    const row = await NonConformance.findByPk(req.params.id, {
      include: [{ model: QualityInspection, as: 'inspection' }],
    });
    if (!row) return res.status(404).json({ error: 'Not found' });
    res.json(row);
  } catch (err) { console.error('nc.get', err); res.status(500).json({ error: 'Failed to fetch NC' }); }
};

exports.create = async (req, res) => {
  try {
    const count = await NonConformance.count();
    const nc_no = `NC-${String(count + 1).padStart(4, '0')}`;
    const row = await NonConformance.create({ ...req.body, nc_no });
    res.status(201).json(row);
  } catch (err) { console.error('nc.create', err); res.status(500).json({ error: 'Failed to create NC' }); }
};

exports.update = async (req, res) => {
  try {
    const row = await NonConformance.findByPk(req.params.id);
    if (!row) return res.status(404).json({ error: 'Not found' });
    await row.update(req.body);
    res.json(row);
  } catch (err) { console.error('nc.update', err); res.status(500).json({ error: 'Failed to update NC' }); }
};

exports.remove = async (req, res) => {
  try {
    const row = await NonConformance.findByPk(req.params.id);
    if (!row) return res.status(404).json({ error: 'Not found' });
    await row.destroy();
    res.json({ message: 'Deleted' });
  } catch (err) { console.error('nc.delete', err); res.status(500).json({ error: 'Failed to delete NC' }); }
};
