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

// ── Shared, source-of-truth validation for item create/update ──
// A naive user cannot save a malformed or ambiguous item: hard `errors` block
// the save; soft `warnings` are surfaced but allowed (the item is still usable).
const GST_SLABS = [0, 3, 5, 12, 18, 28];
const NAME_PLACEHOLDERS = new Set(['-', '.', 'na', 'n/a', 'none', 'general', 'box', 'boxes']);

function validateItemPayload(body, { isEdit = false } = {}) {
  const errors = [];
  const warnings = [];
  const code = body.item_code !== undefined ? String(body.item_code).trim() : '';
  const name = body.item_name !== undefined ? String(body.item_name).trim() : '';

  if (!isEdit && !code) errors.push('Item code is required');
  if (code && !/^[A-Z0-9][A-Z0-9-]*$/.test(code)) {
    errors.push('Item code must be uppercase letters/numbers with optional hyphens (no spaces)');
  }
  if (!isEdit && !name) errors.push('Item name is required');
  if (name) {
    if (name.length < 2) errors.push('Item name is too short');
    else if (NAME_PLACEHOLDERS.has(name.toLowerCase())) {
      errors.push(`Item name "${name}" is not meaningful — enter a real description`);
    }
  }

  const nonNegative = {
    standard_cost: body.standard_cost, mrp: body.mrp, rate: body.rate,
    purchase_price: body.purchase_price, discount_percent: body.discount_percent,
    gst_rate: body.gst_rate, lead_time_days: body.lead_time_days,
    opening_stock: body.opening_stock, min_stock: body.min_stock, max_stock: body.max_stock,
    reorder_level: body.reorder_level, min_order_qty: body.min_order_qty, reorder_qty: body.reorder_qty,
  };
  for (const [k, v] of Object.entries(nonNegative)) {
    if (v === undefined || v === '') continue;
    const n = Number(v);
    if (Number.isNaN(n)) errors.push(`${k.replace(/_/g, ' ')} must be a number`);
    else if (n < 0) errors.push(`${k.replace(/_/g, ' ')} cannot be negative`);
  }

  if (body.hsn_code) {
    const h = String(body.hsn_code).trim();
    if (!/^\d{4,8}$/.test(h)) errors.push('HSN code must be 4–8 digits');
  }
  if (body.gst_rate !== undefined && body.gst_rate !== '' && body.gst_rate !== null) {
    if (!GST_SLABS.includes(Number(body.gst_rate))) {
      warnings.push(`GST rate ${body.gst_rate}% is not a standard slab (common: 0, 5, 12, 18, 28)`);
    }
  }
  if (body.abc_class && !['A', 'B', 'C'].includes(String(body.abc_class).toUpperCase())) {
    errors.push('ABC class must be A, B or C');
  }

  if (body.make_buy !== undefined && body.make_buy !== null && body.make_buy !== '' &&
      !['Buy', 'Make', 'Phantom'].includes(body.make_buy)) {
    errors.push('make_buy must be Buy, Make or Phantom');
  }

  const group = body.group_id || body.category_id || null;
  if (!group) warnings.push('No item group selected — classification is required for reports & stock');
  if (!body.unit_id) warnings.push('No UOM (unit of measure) selected');
  if (body.max_stock !== undefined && body.min_stock !== undefined && body.max_stock !== '' && body.min_stock !== '') {
    const mx = Number(body.max_stock), mn = Number(body.min_stock);
    if (!Number.isNaN(mx) && !Number.isNaN(mn) && mx < mn) warnings.push('Max stock is lower than Min stock');
  }
  return { errors, warnings };
}

exports.checkItemDuplicate = async (req, res) => {
  try {
    const { name, group_id, exclude } = req.query;
    if (!name || String(name).trim().length < 3) return res.json({ matches: [] });
    const like = `%${String(name).trim()}%`;
    const where = { item_name: { [Op.iLike]: like } };
    if (group_id) where.group_id = Number(group_id);
    if (exclude) where.id = { [Op.ne]: Number(exclude) };
    const matches = await ItemMaster.findAll({
      where,
      attributes: ['id', 'item_code', 'item_name', 'group_id'],
      include: [{ model: ItemGroup, as: 'group', attributes: ['name'] }],
      limit: 10,
    });
    res.json({ matches });
  } catch (err) { console.error('checkItemDuplicate', err); res.status(500).json({ error: 'Failed to check duplicates' }); }
};

exports.createItem = async (req, res) => {
  const t = await db.sequelize.transaction();
  try {
    const {
      item_code, item_name, group_id, subgroup_id, type_id, subtype_id, unit_id, category_id, ...rest
    } = req.body;
    const { errors, warnings } = validateItemPayload(req.body, { isEdit: false });
    if (errors.length) { await t.rollback(); return res.status(400).json({ error: errors[0], errors }); }

    const code = String(item_code || '').trim().toUpperCase();
    const name = String(item_name || '').trim();
    const gid = group_id || category_id || null;
    const sgid = subgroup_id || null;
    const tid = type_id || null;
    const stid = subtype_id || null;
    const uid = unit_id || null;

    if (await ItemMaster.findOne({ where: { item_code: code } })) {
      await t.rollback(); return res.status(409).json({ error: `Item code '${code}' already exists` });
    }
    // Classification FK consistency: a child must belong to its parent.
    if (sgid) {
      const sg = await ItemSubGroup.findByPk(sgid);
      if (!sg) { await t.rollback(); return res.status(400).json({ error: 'Selected sub group does not exist' }); }
      if (gid && sg.group_id !== Number(gid)) { await t.rollback(); return res.status(400).json({ error: 'Sub group does not belong to the selected group' }); }
    }
    if (tid) {
      const ty = await ItemType.findByPk(tid);
      if (ty && sgid && ty.subgroup_id !== Number(sgid)) { await t.rollback(); return res.status(400).json({ error: 'Type does not belong to the selected sub group' }); }
    }
    // Group-specific guidance so the item is complete & usable downstream.
    if (gid) {
      const g = await ItemGroup.findByPk(gid);
      const gn = (g?.name || '').toLowerCase();
      if (gn.includes('finished') && (!rest.hsn_code || rest.gst_rate === undefined || rest.gst_rate === '' || rest.rate === undefined || rest.rate === '')) {
        warnings.push('Finished Goods usually need HSN, GST % and a selling rate for billing');
      }
      if ((gn.includes('raw') || gn.includes('sub assembly')) && (rest.standard_cost === undefined || rest.standard_cost === '' || Number(rest.standard_cost) === 0)) {
        warnings.push('Set a standard cost so valuation & MRP work correctly');
      }
      const mb = rest.make_buy;
      if (mb === 'Make' && !(gn.includes('finished') || gn.includes('sub assembly'))) {
        warnings.push('make_buy = Make is unusual for group "' + g?.name + '" — confirm it is manufactured, not purchased');
      }
      if ((gn.includes('finished') || gn.includes('sub assembly')) && mb === 'Buy') {
        warnings.push('A "' + g?.name + '" item is usually manufactured — set make_buy = Make so MRP/BOM can plan it');
      }
      if (gn.includes('raw') && mb === 'Make') {
        warnings.push('Raw Material is usually purchased — set make_buy = Buy unless it is produced in-house');
      }
    }

    const openingQty = Number(rest.opening_stock || (rest.current_stock ? rest.current_stock : 0) || 0);
    const item = await ItemMaster.create({
      item_code: code, item_name: name,
      group_id: gid, subgroup_id: sgid, type_id: tid, subtype_id: stid, unit_id: uid,
      ...rest,
      current_stock: 0,
    }, { transaction: t });

    // Post an opening-stock ledger entry so historical valuation works from day one.
    if (openingQty > 0) {
      const { postMovement, getDefaultWarehouse, REF_TYPES } = require('../../utils/stockService');
      const wh = await getDefaultWarehouse();
      await postMovement(
        {
          item_id: item.id,
          warehouse_id: rest.warehouse_id || wh?.id || null,
          ledger_date: new Date(),
          ref_type: REF_TYPES.OPENING,
          doc_no: `OPEN-${item.item_code}`,
          ref_no: `OPEN-${item.item_code}`,
          qty_in: openingQty,
          qty_out: 0,
          unit_cost: Number(rest.standard_cost || 0) || null,
          selling_price: Number(rest.rate || 0) || null,
          remarks: 'Opening stock on item creation',
          user: req.session?.user?.name || 'System',
        },
        t
      );
    }

    await t.commit();
    res.status(201).json({ ...item.toJSON(), warnings });
  } catch (err) {
    await t.rollback();
    console.error('createItem', err); res.status(500).json({ error: 'Failed to create item' });
  }
};

exports.updateItem = async (req, res) => {
  try {
    const item = await ItemMaster.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Item not found' });

    const { errors, warnings } = validateItemPayload(req.body, { isEdit: true });
    if (errors.length) return res.status(400).json({ error: errors[0], errors });

    const { item_code } = req.body;
    if (item_code && String(item_code).trim().toUpperCase() !== item.item_code) {
      if (await ItemMaster.findOne({ where: { item_code: String(item_code).trim().toUpperCase() } })) {
        return res.status(409).json({ error: `Item code '${item_code}' already exists` });
      }
    }

    const body = req.body;
    const gid = body.group_id !== undefined ? (body.group_id || null) : (body.category_id !== undefined ? (body.category_id || null) : item.group_id);
    const sgid = body.subgroup_id !== undefined ? (body.subgroup_id || null) : item.subgroup_id;
    const tid = body.type_id !== undefined ? (body.type_id || null) : item.type_id;
    const stid = body.subtype_id !== undefined ? (body.subtype_id || null) : item.subtype_id;
    if (sgid) {
      const sg = await ItemSubGroup.findByPk(sgid);
      if (!sg) return res.status(400).json({ error: 'Selected sub group does not exist' });
      if (gid && sg.group_id !== Number(gid)) return res.status(400).json({ error: `Sub group "${sg.name}" belongs to group "${(await ItemGroup.findByPk(sg.group_id))?.name}" — not the selected group` });
    }
    if (tid) {
      const ty = await ItemType.findByPk(tid);
      if (ty && sgid && ty.subgroup_id !== Number(sgid)) return res.status(400).json({ error: 'Type does not belong to the selected sub group' });
    }
    if (stid) {
      const st = await ItemSubType.findByPk(stid);
      if (st && tid && st.type_id !== Number(tid)) return res.status(400).json({ error: 'Section does not belong to the selected type' });
    }

    // Frontend sends the item group under `category_id`; map it to the model's `group_id`.
    const updateData = { ...req.body };
    if (updateData.item_code) updateData.item_code = String(updateData.item_code).trim().toUpperCase();
    if (updateData.item_name) updateData.item_name = String(updateData.item_name).trim();
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
    res.json({ ...item.toJSON(), warnings });
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
