const db = require('../../models/ERP');
const { Op } = require('sequelize');

const MaterialReturn = db.MaterialReturn;
const MaterialReturnItem = db.MaterialReturnItem;
const ItemMaster = db.ItemMaster;

exports.getList = async (req, res) => {
  try {
    const { search, status, return_type } = req.query;
    const where = {};
    if (status) where.status = status;
    if (return_type) where.return_type = return_type;
    if (search) {
      where[Op.or] = [
        { return_no: { [Op.iLike]: `%${search}%` } },
        { party_name: { [Op.iLike]: `%${search}%` } },
      ];
    }
    const data = await MaterialReturn.findAll({
      where,
      order: [['created_date', 'DESC']],
    });
    res.json(data);
  } catch (err) {
    console.error('Error fetching material returns:', err);
    res.status(500).json({ error: 'Failed to fetch' });
  }
};

exports.getOne = async (req, res) => {
  try {
    const doc = await MaterialReturn.findByPk(req.params.id, {
      include: [{ model: MaterialReturnItem, as: 'items' }],
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
    if (!header.return_no) {
      const seq = await MaterialReturn.count() + 1;
      header.return_no = `MRN-${String(seq).padStart(4, '0')}`;
    }
    const doc = await MaterialReturn.create(header);
    if (items && items.length > 0) {
      const rows = items.map((it) => ({ ...it, return_id: doc.id }));
      await MaterialReturnItem.bulkCreate(rows);

      // Add stock back for returns to store
      if (header.return_type === 'To Store') {
        for (const it of items) {
          if (it.item_id) {
            const item = await ItemMaster.findByPk(it.item_id);
            if (item) {
              await item.update({
                current_stock: parseFloat(item.current_stock || 0) + parseFloat(it.quantity || 0),
              });
            }
          }
        }
      }
    }
    const result = await MaterialReturn.findByPk(doc.id, {
      include: [{ model: MaterialReturnItem, as: 'items' }],
    });
    res.status(201).json(result);
  } catch (err) {
    console.error('Error creating material return:', err);
    res.status(500).json({ error: 'Failed to create' });
  }
};

exports.delete = async (req, res) => {
  try {
    const doc = await MaterialReturn.findByPk(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Not found' });
    await MaterialReturnItem.destroy({ where: { return_id: doc.id } });
    await doc.destroy();
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete' });
  }
};
