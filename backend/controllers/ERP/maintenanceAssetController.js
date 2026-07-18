const db = require('../../models/ERP');
const { Op } = require('sequelize');
const { MaintenanceAsset } = db;

exports.list = async (req, res) => {
  try {
    const where = {};
    if (req.query.search) {
      where[Op.or] = [
        { asset_code: { [Op.iLike]: `%${req.query.search}%` } },
        { asset_name: { [Op.iLike]: `%${req.query.search}%` } },
      ];
    }
    if (req.query.status) where.status = req.query.status;
    const rows = await MaintenanceAsset.findAll({ where, order: [['asset_code', 'ASC']] });
    res.json(rows);
  } catch (err) { console.error('maintAsset.list', err); res.status(500).json({ error: 'Failed' }); }
};

exports.get = async (req, res) => {
  try {
    const row = await MaintenanceAsset.findByPk(req.params.id);
    if (!row) return res.status(404).json({ error: 'Not found' });
    res.json(row);
  } catch (err) { console.error('maintAsset.get', err); res.status(500).json({ error: 'Failed' }); }
};

exports.create = async (req, res) => {
  try {
    const count = await MaintenanceAsset.count();
    const code = req.body.asset_code || `AST-${String(count + 1).padStart(4, '0')}`;
    const row = await MaintenanceAsset.create({ ...req.body, asset_code: code });
    res.status(201).json(row);
  } catch (err) { console.error('maintAsset.create', err); res.status(500).json({ error: 'Failed' }); }
};

exports.update = async (req, res) => {
  try {
    const row = await MaintenanceAsset.findByPk(req.params.id);
    if (!row) return res.status(404).json({ error: 'Not found' });
    await row.update(req.body);
    res.json(row);
  } catch (err) { console.error('maintAsset.update', err); res.status(500).json({ error: 'Failed' }); }
};

exports.remove = async (req, res) => {
  try {
    await MaintenanceAsset.destroy({ where: { id: req.params.id } });
    res.json({ message: 'Deleted' });
  } catch (err) { console.error('maintAsset.delete', err); res.status(500).json({ error: 'Failed' }); }
};
