const db = require('../../models/ERP');
const { Op } = require('sequelize');
const { QualityInspection, QualityInspectionItem, NonConformance } = db;

exports.list = async (req, res) => {
  try {
    const where = {};
    if (req.query.inspection_type) where.inspection_type = req.query.inspection_type;
    if (req.query.status) where.status = req.query.status;
    const rows = await QualityInspection.findAll({
      where,
      include: [{ model: QualityInspectionItem, as: 'items' }],
      order: [['created_date', 'DESC']],
    });
    res.json(rows);
  } catch (err) { console.error('qual.list', err); res.status(500).json({ error: 'Failed to fetch inspections' }); }
};

exports.get = async (req, res) => {
  try {
    const row = await QualityInspection.findByPk(req.params.id, {
      include: [
        { model: QualityInspectionItem, as: 'items' },
        { model: NonConformance, as: 'non_conformances' },
      ],
    });
    if (!row) return res.status(404).json({ error: 'Not found' });
    res.json(row);
  } catch (err) { console.error('qual.get', err); res.status(500).json({ error: 'Failed to fetch inspection' }); }
};

exports.create = async (req, res) => {
  try {
    const { items, ...header } = req.body;
    const count = await QualityInspection.count();
    const prefix = header.inspection_type === 'Incoming' ? 'IQC' : header.inspection_type === 'In-Process' ? 'IPC' : 'FQC';
    header.inspection_no = `${prefix}-${String(count + 1).padStart(4, '0')}`;
    const row = await QualityInspection.create(header);
    if (items && items.length > 0) {
      const inspectionItems = items.map(i => ({ ...i, inspection_id: row.id }));
      await QualityInspectionItem.bulkCreate(inspectionItems);
    }
    const result = await QualityInspection.findByPk(row.id, { include: [{ model: QualityInspectionItem, as: 'items' }] });
    res.status(201).json(result);
  } catch (err) { console.error('qual.create', err); res.status(500).json({ error: 'Failed to create inspection' }); }
};

exports.update = async (req, res) => {
  try {
    const row = await QualityInspection.findByPk(req.params.id);
    if (!row) return res.status(404).json({ error: 'Not found' });
    const { items, ...header } = req.body;
    await row.update(header);
    if (items) {
      await QualityInspectionItem.destroy({ where: { inspection_id: row.id } });
      const inspectionItems = items.map(i => ({ ...i, inspection_id: row.id }));
      await QualityInspectionItem.bulkCreate(inspectionItems);
    }
    const result = await QualityInspection.findByPk(row.id, { include: [{ model: QualityInspectionItem, as: 'items' }] });
    res.json(result);
  } catch (err) { console.error('qual.update', err); res.status(500).json({ error: 'Failed to update inspection' }); }
};

exports.remove = async (req, res) => {
  try {
    const row = await QualityInspection.findByPk(req.params.id);
    if (!row) return res.status(404).json({ error: 'Not found' });
    await QualityInspectionItem.destroy({ where: { inspection_id: row.id } });
    await row.destroy();
    res.json({ message: 'Deleted' });
  } catch (err) { console.error('qual.delete', err); res.status(500).json({ error: 'Failed to delete inspection' }); }
};
