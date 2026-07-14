const db = require('../../models/ERP');
const { Op } = require('sequelize');

const ProductMaster = db.ProductMaster;
const ProductItemMaster = db.ProductItemMaster;

exports.getList = async (req, res) => {
  try {
    const { search } = req.query;
    const where = {};
    if (search) {
      where[Op.or] = [
        { product_uid: { [Op.iLike]: `%${search}%` } },
        { product_code: { [Op.iLike]: `%${search}%` } },
        { part_name: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
      ];
    }
    const data = await ProductMaster.findAll({
      where,
      include: [{ model: ProductItemMaster, as: 'items' }],
      order: [['created_at', 'DESC']],
    });
    res.json(data);
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ error: 'Failed to fetch' });
  }
};

exports.getOne = async (req, res) => {
  try {
    const doc = await ProductMaster.findByPk(req.params.id, {
      include: [{ model: ProductItemMaster, as: 'items' }],
    });
    if (!doc) return res.status(404).json({ error: 'Not found' });
    res.json(doc);
  } catch (err) {
    console.error('Error fetching product:', err);
    res.status(500).json({ error: 'Failed to fetch' });
  }
};

exports.create = async (req, res) => {
  try {
    let { items, ...header } = req.body;
    if (!header.product_uid) {
      const count = await ProductMaster.count();
      header.product_uid = `FG-${String(count + 1).padStart(4, '0')}`;
    }
    const doc = await ProductMaster.create(header);
    if (items && items.length > 0) {
      const rows = items.map((it) => ({ ...it, product_id: doc.id }));
      await ProductItemMaster.bulkCreate(rows);
    }
    const result = await ProductMaster.findByPk(doc.id, {
      include: [{ model: ProductItemMaster, as: 'items' }],
    });
    res.status(201).json(result);
  } catch (err) {
    console.error('Error creating product:', err);
    res.status(500).json({ error: 'Failed to create' });
  }
};

exports.update = async (req, res) => {
  try {
    const doc = await ProductMaster.findByPk(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Not found' });
    const { items, ...header } = req.body;
    await doc.update(header);
    if (items) {
      await ProductItemMaster.destroy({ where: { product_id: doc.id } });
      const rows = items.map((it) => ({ ...it, product_id: doc.id }));
      await ProductItemMaster.bulkCreate(rows);
    }
    const result = await ProductMaster.findByPk(doc.id, {
      include: [{ model: ProductItemMaster, as: 'items' }],
    });
    res.json(result);
  } catch (err) {
    console.error('Error updating product:', err);
    res.status(500).json({ error: 'Failed to update' });
  }
};

exports.delete = async (req, res) => {
  try {
    const doc = await ProductMaster.findByPk(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Not found' });
    await ProductItemMaster.destroy({ where: { product_id: doc.id } });
    await doc.destroy();
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error('Error deleting product:', err);
    res.status(500).json({ error: 'Failed to delete' });
  }
};
