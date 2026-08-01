const db = require('../../models/ERP');
const { Op } = require('sequelize');

const Batch = db.Batch;

exports.getList = async (req, res) => {
  try {
    const { item_id, search } = req.query;
    const where = {};
    if (item_id) where.item_id = item_id;
    if (search) {
      where[Op.or] = [{ batch_no: { [Op.iLike]: `%${search}%` } }];
    }
    const rows = await Batch.findAll({
      where,
      include: [{ model: db.ItemMaster, as: 'item', attributes: ['id', 'item_code', 'item_name'], include: [{ model: db.Unit, as: 'unit', attributes: ['short_name'] }] }],
      order: [['batch_no', 'ASC']],
    });
    res.json(rows);
  } catch (err) {
    console.error('Error fetching batches:', err);
    res.status(500).json({ error: 'Failed to fetch batches' });
  }
};

exports.create = async (req, res) => {
  try {
    const { item_id, batch_no, quantity, mfg_date, exp_date } = req.body;
    if (!item_id || !batch_no) return res.status(400).json({ error: 'Item and batch number are required' });
    const existing = await Batch.findOne({ where: { item_id, batch_no } });
    if (existing) return res.status(409).json({ error: `Batch '${batch_no}' already exists for this item` });
    const row = await Batch.create({ item_id, batch_no, quantity: quantity || 0, mfg_date: mfg_date || null, exp_date: exp_date || null });
    res.status(201).json(row);
  } catch (err) {
    console.error('Error creating batch:', err);
    res.status(500).json({ error: 'Failed to create batch' });
  }
};

exports.update = async (req, res) => {
  try {
    const row = await Batch.findByPk(req.params.id);
    if (!row) return res.status(404).json({ error: 'Batch not found' });
    await row.update(req.body);
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update batch' });
  }
};

exports.remove = async (req, res) => {
  try {
    const row = await Batch.findByPk(req.params.id);
    if (!row) return res.status(404).json({ error: 'Batch not found' });
    await row.update({ is_active: false });
    res.json({ message: 'Batch deactivated' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to deactivate batch' });
  }
};
