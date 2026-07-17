const db = require('../../models/ERP');
const { Op } = require('sequelize');

const ProductMaster = db.ProductMaster;
const ProductItemMaster = db.ProductItemMaster;
const ProductCategory = db.ProductCategory;

async function resolveCategory(mainName, subName) {
  if (!subName || !subName.toString().trim()) return null;
  let main = null;
  if (mainName && mainName.toString().trim()) {
    const mName = mainName.toString().trim();
    main = await ProductCategory.findOne({ where: { type: 'Main', name: mName } });
    if (!main) main = await ProductCategory.create({ name: mName, type: 'Main', is_active: true });
  }
  const sName = subName.toString().trim();
  let sub = await ProductCategory.findOne({ where: { type: 'Sub', name: sName, parent_id: main ? main.id : null } });
  if (!sub) sub = await ProductCategory.create({ name: sName, type: 'Sub', parent_id: main ? main.id : null, is_active: true });
  return sub.id;
}

const COLOR_CODES = { white: 'WT', black: 'BK', brown: 'BN', grey: 'GY', gray: 'GY', blue: 'BL', red: 'RD', green: 'GN', ivory: 'IV', silver: 'SV', gold: 'GD', golden: 'GD' };

function buildProductCode(subName, color, seq) {
  const prefix = (subName || 'PROD').toString().trim().split(/\s+/)[0].toUpperCase();
  const cc = color ? (COLOR_CODES[color.toString().toLowerCase()] || color.toString().slice(0, 2).toUpperCase()) : '';
  const num = String(seq).padStart(3, '0');
  return cc ? `${prefix}-${cc}-${num}` : `${prefix}-${num}`;
}
exports.buildProductCode = buildProductCode;

exports.getList = async (req, res) => {
  try {
    const { search, category_id } = req.query;
    const where = {};
    if (category_id) {
      const cat = await ProductCategory.findByPk(category_id);
      if (cat && cat.type === 'Main') {
        const subs = await ProductCategory.findAll({ where: { parent_id: category_id }, attributes: ['id'] });
        const ids = subs.map((s) => s.id);
        where.category_id = ids.length ? { [Op.in]: ids } : category_id;
      } else {
        where.category_id = category_id;
      }
    }
    if (search) {
      const like = { [Op.iLike]: `%${search}%` };
      const matchedByName = await ProductCategory.findAll({ where: { name: like }, attributes: ['id'] });
      const nameIds = matchedByName.map((c) => c.id);
      const matchedSubs = nameIds.length
        ? await ProductCategory.findAll({ where: { parent_id: { [Op.in]: nameIds } }, attributes: ['id'] })
        : [];
      const catIds = [...nameIds, ...matchedSubs.map((c) => c.id)];
      where[Op.or] = [
        { product_uid: like },
        { product_code: like },
        { part_name: like },
        { color: like },
        { description: like },
        ...(catIds.length ? [{ category_id: catIds }] : []),
      ];
    }
    const data = await ProductMaster.findAll({
      where,
      include: [
        { model: ProductItemMaster, as: 'items' },
        { model: ProductCategory, as: 'category', include: [{ model: ProductCategory, as: 'parent', attributes: ['id', 'name'] }] },
      ],
      order: [['created_date', 'DESC']],
    });
    res.json(data);
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ error: 'Failed to fetch' });
  }
};

exports.getCategories = async (req, res) => {
  try {
    const data = await ProductCategory.findAll({
      include: [{ model: ProductCategory, as: 'parent', attributes: ['id', 'name'] }],
      order: [['type', 'ASC'], ['name', 'ASC']],
    });
    res.json(data);
  } catch (err) {
    console.error('Error fetching categories:', err);
    res.status(500).json({ error: 'Failed to fetch' });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const { name, type, parent_id, description } = req.body;
    if (!name) return res.status(400).json({ error: 'Name required' });
    const doc = await ProductCategory.create({ name, type: type || 'Sub', parent_id: parent_id || null, description, is_active: true });
    res.status(201).json(doc);
  } catch (err) {
    console.error('Error creating category:', err);
    res.status(500).json({ error: 'Failed to create' });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const doc = await ProductCategory.findByPk(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Not found' });
    const { name, type, parent_id, description, is_active } = req.body;
    await doc.update({ name, type, parent_id: parent_id || null, description, is_active });
    res.json(doc);
  } catch (err) {
    console.error('Error updating category:', err);
    res.status(500).json({ error: 'Failed to update' });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const doc = await ProductCategory.findByPk(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Not found' });
    if (doc.type === 'Main') {
      const children = await ProductCategory.count({ where: { parent_id: doc.id } });
      if (children > 0) return res.status(400).json({ error: 'Delete sub-categories first' });
    }
    await doc.destroy();
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error('Error deleting category:', err);
    res.status(500).json({ error: 'Failed to delete' });
  }
};

exports.getOne = async (req, res) => {
  try {
    const doc = await ProductMaster.findByPk(req.params.id, {
      include: [{ model: ProductItemMaster, as: 'items' }, { model: ProductCategory, as: 'category', include: [{ model: ProductCategory, as: 'parent' }] }],
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
    let { items, main_category_name, sub_category_name, ...header } = req.body;
    if (!header.product_uid) {
      const count = await ProductMaster.count();
      header.product_uid = `PROD${String(count + 1).padStart(4, '0')}`;
    }
    if (!header.category_id && (main_category_name || sub_category_name)) {
      header.category_id = await resolveCategory(main_category_name, sub_category_name);
    }
    if (!header.product_code) {
      const subName = sub_category_name || (header.category_id ? (await ProductCategory.findByPk(header.category_id))?.name : '') || '';
      const seq = (await ProductMaster.count({ where: { category_id: header.category_id } })) + 1;
      header.product_code = buildProductCode(subName, header.color, seq);
    }
    const doc = await ProductMaster.create(header);
    if (items && items.length > 0) {
      const rows = items.map((it) => ({ ...it, product_id: doc.id }));
      await ProductItemMaster.bulkCreate(rows);
    }
    const result = await ProductMaster.findByPk(doc.id, {
      include: [{ model: ProductItemMaster, as: 'items' }, { model: ProductCategory, as: 'category', include: [{ model: ProductCategory, as: 'parent' }] }],
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
    const { items, main_category_name, sub_category_name, ...header } = req.body;
    if (!header.category_id && (main_category_name || sub_category_name)) {
      header.category_id = await resolveCategory(main_category_name, sub_category_name);
    }
    await doc.update(header);
    if (items) {
      await ProductItemMaster.destroy({ where: { product_id: doc.id } });
      const rows = items.map((it) => ({ ...it, product_id: doc.id }));
      await ProductItemMaster.bulkCreate(rows);
    }
    const result = await ProductMaster.findByPk(doc.id, {
      include: [{ model: ProductItemMaster, as: 'items' }, { model: ProductCategory, as: 'category', include: [{ model: ProductCategory, as: 'parent' }] }],
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
