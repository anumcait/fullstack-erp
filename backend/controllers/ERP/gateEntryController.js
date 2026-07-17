const db = require('../../models/ERP');
const { Op } = require('sequelize');

const GateEntry = db.GateEntry;
const GateEntryItem = db.GateEntryItem;

exports.getList = async (req, res) => {
  try {
    const { search, status, entry_type } = req.query;
    const where = {};
    if (status) where.status = status;
    if (entry_type) where.entry_type = entry_type;
    if (search) {
      where[Op.or] = [
        { entry_no: { [Op.iLike]: `%${search}%` } },
        { party_name: { [Op.iLike]: `%${search}%` } },
        { vehicle_no: { [Op.iLike]: `%${search}%` } },
      ];
    }
    const data = await GateEntry.findAll({
      where,
      order: [['created_date', 'DESC']],
    });
    res.json(data);
  } catch (err) {
    console.error('Error fetching gate entries:', err);
    res.status(500).json({ error: 'Failed to fetch' });
  }
};

exports.getOne = async (req, res) => {
  try {
    const doc = await GateEntry.findByPk(req.params.id, {
      include: [{ model: GateEntryItem, as: 'items' }],
    });
    if (!doc) return res.status(404).json({ error: 'Not found' });
    res.json(doc);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch' });
  }
};

exports.create = async (req, res) => {
  try {
    let { items, ...header } = req.body;
    if (!header.entry_no) {
      const prefix = header.entry_type === 'Outward' ? 'GE-OUT' : 'GE-IN';
      const seq = await GateEntry.count() + 1;
      header.entry_no = `${prefix}-${String(seq).padStart(4, '0')}`;
    }
    const doc = await GateEntry.create(header);
    if (items && items.length > 0) {
      const rows = items.map((it) => ({ ...it, gate_entry_id: doc.id }));
      await GateEntryItem.bulkCreate(rows);
    }
    const result = await GateEntry.findByPk(doc.id, {
      include: [{ model: GateEntryItem, as: 'items' }],
    });
    res.status(201).json(result);
  } catch (err) {
    console.error('Error creating gate entry:', err);
    res.status(500).json({ error: 'Failed to create' });
  }
};

exports.update = async (req, res) => {
  try {
    const doc = await GateEntry.findByPk(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Not found' });
    let { items, ...header } = req.body;
    await doc.update(header);
    await GateEntryItem.destroy({ where: { gate_entry_id: doc.id } });
    if (items && items.length > 0) {
      const rows = items.map((it) => ({ ...it, gate_entry_id: doc.id }));
      await GateEntryItem.bulkCreate(rows);
    }
    const result = await GateEntry.findByPk(doc.id, {
      include: [{ model: GateEntryItem, as: 'items' }],
    });
    res.json(result);
  } catch (err) {
    console.error('Error updating gate entry:', err);
    res.status(500).json({ error: 'Failed to update' });
  }
};

exports.delete = async (req, res) => {
  try {
    const doc = await GateEntry.findByPk(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Not found' });
    await GateEntryItem.destroy({ where: { gate_entry_id: doc.id } });
    await doc.destroy();
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete' });
  }
};
