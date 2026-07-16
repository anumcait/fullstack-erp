const db = require('../../models/ERP');
const { Op } = require('sequelize');

const { ItemGroup, ItemSubGroup, ItemType, ItemSubType, ItemMaster, Unit } = db;

// ──────────────────────────────── Item Group (Level 1) ────────────────────────────────
exports.getGroups = async (req, res) => {
  try {
    const rows = await ItemGroup.findAll({ where: { is_active: true }, order: [['name', 'ASC']] });
    res.json(rows);
  } catch (err) {
    console.error('getGroups', err); res.status(500).json({ error: 'Failed to fetch groups' });
  }
};
exports.createGroup = async (req, res) => {
  try {
    const { code, name, description } = req.body;
    if (!name) return res.status(400).json({ error: 'Group name is required' });
    if (await ItemGroup.findOne({ where: { name } })) return res.status(409).json({ error: 'Group already exists' });
    res.status(201).json(await ItemGroup.create({ code, name, description }));
  } catch (err) { console.error('createGroup', err); res.status(500).json({ error: 'Failed to create group' }); }
};
exports.updateGroup = async (req, res) => {
  try {
    const g = await ItemGroup.findByPk(req.params.id);
    if (!g) return res.status(404).json({ error: 'Not found' });
    await g.update(req.body);
    res.json(g);
  } catch (err) { console.error('updateGroup', err); res.status(500).json({ error: 'Failed to update group' }); }
};
exports.deleteGroup = async (req, res) => {
  try {
    const g = await ItemGroup.findByPk(req.params.id);
    if (!g) return res.status(404).json({ error: 'Not found' });
    if (await ItemSubGroup.count({ where: { group_id: g.id } })) return res.status(409).json({ error: 'Delete sub groups first' });
    await g.destroy();
    res.json({ message: 'Deleted' });
  } catch (err) { console.error('deleteGroup', err); res.status(500).json({ error: 'Failed to delete group' }); }
};

// ──────────────────────────────── Item Sub Group (Level 2) ────────────────────────────────
exports.getSubGroups = async (req, res) => {
  try {
    const where = { is_active: true };
    if (req.query.group_id) where.group_id = req.query.group_id;
    const rows = await ItemSubGroup.findAll({
      where,
      include: [{ model: ItemGroup, as: 'group', attributes: ['id', 'name'] }],
      order: [['name', 'ASC']],
    });
    res.json(rows);
  } catch (err) { console.error('getSubGroups', err); res.status(500).json({ error: 'Failed to fetch sub groups' }); }
};
exports.createSubGroup = async (req, res) => {
  try {
    const { group_id, code, name, description } = req.body;
    if (!group_id || !name) return res.status(400).json({ error: 'Group and name are required' });
    if (await ItemSubGroup.findOne({ where: { name, group_id } })) return res.status(409).json({ error: 'Sub group already exists' });
    res.status(201).json(await ItemSubGroup.create({ group_id, code, name, description }));
  } catch (err) { console.error('createSubGroup', err); res.status(500).json({ error: 'Failed to create sub group' }); }
};
exports.updateSubGroup = async (req, res) => {
  try {
    const sg = await ItemSubGroup.findByPk(req.params.id);
    if (!sg) return res.status(404).json({ error: 'Not found' });
    await sg.update(req.body);
    res.json(sg);
  } catch (err) { console.error('updateSubGroup', err); res.status(500).json({ error: 'Failed to update sub group' }); }
};
exports.deleteSubGroup = async (req, res) => {
  try {
    const sg = await ItemSubGroup.findByPk(req.params.id);
    if (!sg) return res.status(404).json({ error: 'Not found' });
    if (await ItemType.count({ where: { subgroup_id: sg.id } })) return res.status(409).json({ error: 'Delete types first' });
    await sg.destroy();
    res.json({ message: 'Deleted' });
  } catch (err) { console.error('deleteSubGroup', err); res.status(500).json({ error: 'Failed to delete sub group' }); }
};

// ──────────────────────────────── Item Type (Level 3) ────────────────────────────────
exports.getItemTypes = async (req, res) => {
  try {
    const where = { is_active: true };
    if (req.query.subgroup_id) where.subgroup_id = req.query.subgroup_id;
    const rows = await ItemType.findAll({
      where,
      include: [{ model: ItemSubGroup, as: 'subGroup', attributes: ['id', 'name'] }],
      order: [['name', 'ASC']],
    });
    res.json(rows);
  } catch (err) { console.error('getItemTypes', err); res.status(500).json({ error: 'Failed to fetch types' }); }
};
exports.createItemType = async (req, res) => {
  try {
    const { subgroup_id, code, name, description } = req.body;
    if (!subgroup_id || !name) return res.status(400).json({ error: 'Sub group and name are required' });
    if (await ItemType.findOne({ where: { name, subgroup_id } })) return res.status(409).json({ error: 'Type already exists' });
    res.status(201).json(await ItemType.create({ subgroup_id, code, name, description }));
  } catch (err) { console.error('createItemType', err); res.status(500).json({ error: 'Failed to create type' }); }
};
exports.updateItemType = async (req, res) => {
  try {
    const t = await ItemType.findByPk(req.params.id);
    if (!t) return res.status(404).json({ error: 'Not found' });
    await t.update(req.body);
    res.json(t);
  } catch (err) { console.error('updateItemType', err); res.status(500).json({ error: 'Failed to update type' }); }
};
exports.deleteItemType = async (req, res) => {
  try {
    const t = await ItemType.findByPk(req.params.id);
    if (!t) return res.status(404).json({ error: 'Not found' });
    if (await ItemSubType.count({ where: { type_id: t.id } })) return res.status(409).json({ error: 'Delete sub types first' });
    await t.destroy();
    res.json({ message: 'Deleted' });
  } catch (err) { console.error('deleteItemType', err); res.status(500).json({ error: 'Failed to delete type' }); }
};

// ──────────────────────────────── Item Sub Type (Level 4) ────────────────────────────────
exports.getSubTypes = async (req, res) => {
  try {
    const where = { is_active: true };
    const typeWhere = {};
    if (req.query.type_id) typeWhere.id = req.query.type_id;
    if (req.query.subgroup_id) typeWhere.subgroup_id = req.query.subgroup_id;
    const include = [{ model: ItemType, as: 'type', attributes: ['id', 'name', 'subgroup_id'] }];
    if (Object.keys(typeWhere).length) include[0].where = typeWhere;
    const rows = await ItemSubType.findAll({
      where,
      include,
      order: [['name', 'ASC']],
    });
    res.json(rows);
  } catch (err) { console.error('getSubTypes', err); res.status(500).json({ error: 'Failed to fetch sub types' }); }
};
exports.createSubType = async (req, res) => {
  try {
    const { type_id, code, name, description } = req.body;
    if (!type_id || !name) return res.status(400).json({ error: 'Type and name are required' });
    if (await ItemSubType.findOne({ where: { name, type_id } })) return res.status(409).json({ error: 'Sub type already exists' });
    res.status(201).json(await ItemSubType.create({ type_id, code, name, description }));
  } catch (err) { console.error('createSubType', err); res.status(500).json({ error: 'Failed to create sub type' }); }
};
exports.updateSubType = async (req, res) => {
  try {
    const st = await ItemSubType.findByPk(req.params.id);
    if (!st) return res.status(404).json({ error: 'Not found' });
    await st.update(req.body);
    res.json(st);
  } catch (err) { console.error('updateSubType', err); res.status(500).json({ error: 'Failed to update sub type' }); }
};
exports.deleteSubType = async (req, res) => {
  try {
    const st = await ItemSubType.findByPk(req.params.id);
    if (!st) return res.status(404).json({ error: 'Not found' });
    const used = await ItemMaster.count({ where: { subtype_id: st.id } });
    if (used) return res.status(409).json({ error: `Cannot delete: ${used} item(s) use this sub type` });
    await st.destroy();
    res.json({ message: 'Deleted' });
  } catch (err) { console.error('deleteSubType', err); res.status(500).json({ error: 'Failed to delete sub type' }); }
};

// ──────────────────────────────── Units ────────────────────────────────
exports.getUnits = async (req, res) => {
  try {
    const rows = await Unit.findAll({ where: { is_active: true }, order: [['name', 'ASC']] });
    res.json(rows);
  } catch (err) { console.error('getUnits', err); res.status(500).json({ error: 'Failed to fetch units' }); }
};
exports.createUnit = async (req, res) => {
  try {
    const { name, short_name } = req.body;
    if (!name) return res.status(400).json({ error: 'Unit name is required' });
    if (await Unit.findOne({ where: { name } })) return res.status(409).json({ error: 'Unit already exists' });
    res.status(201).json(await Unit.create({ name, short_name: (short_name || '').toUpperCase().slice(0, 3) }));
  } catch (err) { console.error('createUnit', err); res.status(500).json({ error: 'Failed to create unit' }); }
};
exports.updateUnit = async (req, res) => {
  try {
    const u = await Unit.findByPk(req.params.id);
    if (!u) return res.status(404).json({ error: 'Not found' });
    await u.update({ name: req.body.name, short_name: (req.body.short_name || '').toUpperCase().slice(0, 3), is_active: req.body.is_active });
    res.json(u);
  } catch (err) { console.error('updateUnit', err); res.status(500).json({ error: 'Failed to update unit' }); }
};
exports.deleteUnit = async (req, res) => {
  try {
    const u = await Unit.findByPk(req.params.id);
    if (!u) return res.status(404).json({ error: 'Not found' });
    if (await ItemMaster.count({ where: { unit_id: u.id } })) return res.status(409).json({ error: 'Unit in use by items' });
    await u.destroy();
    res.json({ message: 'Deleted' });
  } catch (err) { console.error('deleteUnit', err); res.status(500).json({ error: 'Failed to delete unit' }); }
};

// ──────────────────────────────── Item Master ────────────────────────────────
exports.getItems = async (req, res) => {
  try {
    const { search, group_id, subgroup_id, type_id, subtype_id, is_active } = req.query;
    const where = {};
    if (search) where[Op.or] = [
      { item_code: { [Op.iLike]: `%${search}%` } },
      { item_name: { [Op.iLike]: `%${search}%` } },
      { hsn_code: { [Op.iLike]: `%${search}%` } },
    ];
    if (group_id) where.group_id = group_id;
    if (subgroup_id) where.subgroup_id = subgroup_id;
    if (type_id) where.type_id = type_id;
    if (subtype_id) where.subtype_id = subtype_id;
    if (is_active !== undefined) where.is_active = is_active === 'true';

    const rows = await ItemMaster.findAll({
      where,
      include: [
        { model: ItemGroup, as: 'group', attributes: ['id', 'name'] },
        { model: ItemSubGroup, as: 'subGroup', attributes: ['id', 'name'] },
        { model: ItemType, as: 'type', attributes: ['id', 'name'] },
        { model: ItemSubType, as: 'subType', attributes: ['id', 'name'] },
        { model: Unit, as: 'unit', attributes: ['id', 'name', 'short_name'] },
      ],
      order: [['item_code', 'ASC']],
    });
    res.json(rows);
  } catch (err) { console.error('getItems', err); res.status(500).json({ error: 'Failed to fetch items' }); }
};

exports.getItem = async (req, res) => {
  try {
    const item = await ItemMaster.findByPk(req.params.id, {
      include: [
        { model: ItemGroup, as: 'group', attributes: ['id', 'name'] },
        { model: ItemSubGroup, as: 'subGroup', attributes: ['id', 'name'] },
        { model: ItemType, as: 'type', attributes: ['id', 'name'] },
        { model: ItemSubType, as: 'subType', attributes: ['id', 'name'] },
        { model: Unit, as: 'unit', attributes: ['id', 'name', 'short_name'] },
      ],
    });
    if (!item) return res.status(404).json({ error: 'Item not found' });
    res.json(item);
  } catch (err) { console.error('getItem', err); res.status(500).json({ error: 'Failed to fetch item' }); }
};

exports.createItem = async (req, res) => {
  try {
    const { item_code, item_name, group_id, subgroup_id, type_id, subtype_id, unit_id, category_id, ...rest } = req.body;
    if (!item_code || !item_name) return res.status(400).json({ error: 'Item code and name are required' });
    if (await ItemMaster.findOne({ where: { item_code } })) return res.status(409).json({ error: `Item code '${item_code}' already exists` });

    const item = await ItemMaster.create({
      item_code, item_name,
      group_id: group_id || category_id || null,
      subgroup_id: subgroup_id || null,
      type_id: type_id || null,
      subtype_id: subtype_id || null,
      unit_id: unit_id || null,
      ...rest,
    });
    res.status(201).json(item);
  } catch (err) { console.error('createItem', err); res.status(500).json({ error: 'Failed to create item' }); }
};

exports.updateItem = async (req, res) => {
  try {
    const item = await ItemMaster.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Item not found' });
    const { item_code } = req.body;
    if (item_code && item_code !== item.item_code) {
      if (await ItemMaster.findOne({ where: { item_code } })) return res.status(409).json({ error: `Item code '${item_code}' already exists` });
    }
    // Frontend sends the item group under `category_id`; map it to the model's `group_id`.
    const updateData = { ...req.body };
    if (updateData.category_id !== undefined) {
      updateData.group_id = updateData.category_id || null;
      delete updateData.category_id;
    }
    // Coerce empty strings to null for numeric columns so PostgreSQL does not
    // fail with "invalid input syntax for type integer: \"\"" (e.g. when a
    // classification picker is cleared on the edit form).
    Object.keys(updateData).forEach((k) => {
      const attr = ItemMaster.rawAttributes[k];
      if (updateData[k] === '' && attr) {
        const tk = attr.type && attr.type.key;
        if (['INTEGER', 'BIGINT', 'DECIMAL', 'FLOAT', 'DOUBLE', 'REAL', 'NUMERIC'].includes(tk)) {
          updateData[k] = null;
        }
      }
    });
    await item.update(updateData);
    res.json(item);
  } catch (err) { console.error('updateItem', err); res.status(500).json({ error: 'Failed to update item' }); }
};

exports.deleteItem = async (req, res) => {
  try {
    const item = await ItemMaster.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Item not found' });
    await item.update({ is_active: false });
    res.json({ message: 'Item deactivated' });
  } catch (err) { console.error('deleteItem', err); res.status(500).json({ error: 'Failed to deactivate item' }); }
};

exports.getNextItemCode = async (req, res) => {
  try {
    const { group_id, subgroup_id } = req.query;

    // Determine the code prefix from the selected classification.
    // Priority: Sub Group code -> Group code -> Sub Group name -> Group name -> "ITM".
    let prefix = "ITM";
    if (subgroup_id) {
      const sg = await ItemSubGroup.findByPk(subgroup_id);
      if (sg) {
        prefix = (sg.code && sg.code.trim())
          ? sg.code.trim().toUpperCase()
          : (sg.name || "ITM").replace(/[^A-Za-z0-9]/g, "").toUpperCase().slice(0, 4) || "ITM";
      }
    }
    if (prefix === "ITM" && group_id) {
      const g = await ItemGroup.findByPk(group_id);
      if (g) {
        prefix = (g.code && g.code.trim())
          ? g.code.trim().toUpperCase()
          : (g.name || "ITM").replace(/[^A-Za-z0-9]/g, "").toUpperCase().slice(0, 4) || "ITM";
      }
    }

    // Sequence is per series prefix (not per subgroup row), so we scan all items
    // and take the max numeric suffix that already uses this prefix.
    const items = await ItemMaster.findAll({ attributes: ['item_code'] });
    const escaped = prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // Match existing codes whether or not they contain a separator: PREFIX0001 or PREFIX-0001
    const re = new RegExp(`^${escaped}-?(\\d+)$`);
    let max = 0;
    items.forEach((it) => {
      const m = (it.item_code || '').match(re);
      if (m) max = Math.max(max, parseInt(m[1], 10));
    });
    res.json({ next_code: `${prefix}${String(max + 1).padStart(4, '0')}` });
  } catch (err) { console.error('getNextItemCode', err); res.status(500).json({ error: 'Failed to generate item code' }); }
};
