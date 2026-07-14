const db = require('../../models/ERP');
const ItemMaster = db.ItemMaster;
const ItemCategory = db.ItemCategory;
const Unit = db.Unit;
const { Op } = require('sequelize');

// ──────────────────────────────── Item Categories ────────────────────────────────

exports.getCategories = async (req, res) => {
  try {
    const categories = await ItemCategory.findAll({
      where: { is_active: true },
      order: [['name', 'ASC']],
    });
    res.json(categories);
  } catch (err) {
    console.error('Error fetching categories:', err);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ error: 'Category name is required' });

    const existing = await ItemCategory.findOne({ where: { name } });
    if (existing) return res.status(409).json({ error: 'Category already exists' });

    const category = await ItemCategory.create({ name, description });
    res.status(201).json(category);
  } catch (err) {
    console.error('Error creating category:', err);
    res.status(500).json({ error: 'Failed to create category' });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, is_active } = req.body;
    const category = await ItemCategory.findByPk(id);
    if (!category) return res.status(404).json({ error: 'Category not found' });

    await category.update({ name, description, is_active });
    res.json(category);
  } catch (err) {
    console.error('Error updating category:', err);
    res.status(500).json({ error: 'Failed to update category' });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const count = await ItemMaster.count({ where: { category_id: id } });
    if (count > 0) return res.status(409).json({ error: `Cannot delete: ${count} item(s) use this category` });

    await ItemCategory.destroy({ where: { id } });
    res.json({ message: 'Category deleted' });
  } catch (err) {
    console.error('Error deleting category:', err);
    res.status(500).json({ error: 'Failed to delete category' });
  }
};

// ──────────────────────────────── Units ────────────────────────────────

exports.getUnits = async (req, res) => {
  try {
    const units = await Unit.findAll({
      where: { is_active: true },
      order: [['name', 'ASC']],
    });
    res.json(units);
  } catch (err) {
    console.error('Error fetching units:', err);
    res.status(500).json({ error: 'Failed to fetch units' });
  }
};

exports.createUnit = async (req, res) => {
  try {
    const { name, short_name } = req.body;
    if (!name) return res.status(400).json({ error: 'Unit name is required' });

    const existing = await Unit.findOne({ where: { name } });
    if (existing) return res.status(409).json({ error: 'Unit already exists' });

    const unit = await Unit.create({ name, short_name });
    res.status(201).json(unit);
  } catch (err) {
    console.error('Error creating unit:', err);
    res.status(500).json({ error: 'Failed to create unit' });
  }
};

exports.updateUnit = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, short_name, is_active } = req.body;
    const unit = await Unit.findByPk(id);
    if (!unit) return res.status(404).json({ error: 'Unit not found' });

    await unit.update({ name, short_name, is_active });
    res.json(unit);
  } catch (err) {
    console.error('Error updating unit:', err);
    res.status(500).json({ error: 'Failed to update unit' });
  }
};

exports.deleteUnit = async (req, res) => {
  try {
    const { id } = req.params;
    const count = await ItemMaster.count({ where: { unit_id: id } });
    if (count > 0) return res.status(409).json({ error: `Cannot delete: ${count} item(s) use this unit` });

    await Unit.destroy({ where: { id } });
    res.json({ message: 'Unit deleted' });
  } catch (err) {
    console.error('Error deleting unit:', err);
    res.status(500).json({ error: 'Failed to delete unit' });
  }
};

// ──────────────────────────────── Item Master ────────────────────────────────

exports.getItems = async (req, res) => {
  try {
    const { search, category_id, is_active } = req.query;
    const where = {};

    if (search) {
      where[Op.or] = [
        { item_code: { [Op.iLike]: `%${search}%` } },
        { item_name: { [Op.iLike]: `%${search}%` } },
        { hsn_code: { [Op.iLike]: `%${search}%` } },
      ];
    }
    if (category_id) where.category_id = category_id;
    if (is_active !== undefined) where.is_active = is_active === 'true';

    const items = await ItemMaster.findAll({
      where,
      include: [
        { model: ItemCategory, as: 'category', attributes: ['id', 'name'] },
        { model: Unit, as: 'unit', attributes: ['id', 'name', 'short_name'] },
      ],
      order: [['item_name', 'ASC']],
    });
    res.json(items);
  } catch (err) {
    console.error('Error fetching items:', err);
    res.status(500).json({ error: 'Failed to fetch items' });
  }
};

exports.getItem = async (req, res) => {
  try {
    const item = await ItemMaster.findByPk(req.params.id, {
      include: [
        { model: ItemCategory, as: 'category', attributes: ['id', 'name'] },
        { model: Unit, as: 'unit', attributes: ['id', 'name', 'short_name'] },
      ],
    });
    if (!item) return res.status(404).json({ error: 'Item not found' });
    res.json(item);
  } catch (err) {
    console.error('Error fetching item:', err);
    res.status(500).json({ error: 'Failed to fetch item' });
  }
};

exports.createItem = async (req, res) => {
  try {
    const { item_code, item_name, category_id, unit_id, ...rest } = req.body;
    if (!item_code || !item_name) {
      return res.status(400).json({ error: 'Item code and name are required' });
    }

    const existing = await ItemMaster.findOne({ where: { item_code } });
    if (existing) return res.status(409).json({ error: `Item code '${item_code}' already exists` });

    const item = await ItemMaster.create({
      item_code,
      item_name,
      category_id: category_id || null,
      unit_id: unit_id || null,
      current_stock: rest.opening_stock || 0,
      ...rest,
    });
    res.status(201).json(item);
  } catch (err) {
    console.error('Error creating item:', err);
    res.status(500).json({ error: 'Failed to create item' });
  }
};

exports.updateItem = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await ItemMaster.findByPk(id);
    if (!item) return res.status(404).json({ error: 'Item not found' });

    const { item_code } = req.body;
    if (item_code && item_code !== item.item_code) {
      const dup = await ItemMaster.findOne({ where: { item_code } });
      if (dup) return res.status(409).json({ error: `Item code '${item_code}' already exists` });
    }

    await item.update(req.body);
    res.json(item);
  } catch (err) {
    console.error('Error updating item:', err);
    res.status(500).json({ error: 'Failed to update item' });
  }
};

exports.deleteItem = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await ItemMaster.findByPk(id);
    if (!item) return res.status(404).json({ error: 'Item not found' });

    await item.update({ is_active: false });
    res.json({ message: 'Item deactivated' });
  } catch (err) {
    console.error('Error deleting item:', err);
    res.status(500).json({ error: 'Failed to delete item' });
  }
};
