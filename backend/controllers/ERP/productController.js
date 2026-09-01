const db = require('../../models/ERP');
const { Op, Sequelize } = require('sequelize');

const ProductMaster = db.ProductMaster;
const ProductItemMaster = db.ProductItemMaster;
const ProductCategory = db.ProductCategory;
const ItemMaster = db.ItemMaster;
const BOM = db.BOM;
const BOMItem = db.BOMItem;

const NODE_TYPES = ['ROOT', 'ASSEMBLY', 'SUB_ASSEMBLY', 'PHANTOM', 'SKU'];
const ASSEMBLY_NODES = ['ASSEMBLY', 'SUB_ASSEMBLY', 'PHANTOM'];

// Persist a product's component tree. `items` are client rows that may carry a
// transient `tempId`/`parentTempId` to express sub-assembly nesting. We strip the
// transient fields, create the rows, then wire `parent_item_id` using the tempId map.
async function saveProductItems(items, productId, transaction) {
  if (!items || items.length === 0) return;
  const clean = (it) => ({
    product_id: productId,
    item_id: it.item_id ? Number(it.item_id) : null,
    item_code: it.item_code || null,
    item_name: it.item_name || '',
    quantity: it.quantity != null ? it.quantity : 1,
    unit_id: it.unit_id ? Number(it.unit_id) : null,
    wastage_percent: it.wastage_percent || 0,
    is_subassembly: !!it.is_subassembly,
    sort_order: it.sort_order || 0,
    serial_no: it.serial_no != null ? Number(it.serial_no) : null,
    remark: it.remark || null,
    color: it.color || null,
    item_description: it.item_description || null,
    parent_item_id: null,
    component_product_id: it.component_product_id ? Number(it.component_product_id) : null,
  });
  const toCreate = items.map(clean);
  const created = await ProductItemMaster.bulkCreate(toCreate, { transaction, returning: true });
  const idByTemp = {};
  items.forEach((it, i) => { if (it.tempId) idByTemp[it.tempId] = created[i].id; });
  for (let i = 0; i < items.length; i++) {
    const pTemp = items[i].parentTempId;
    if (pTemp && idByTemp[pTemp] && idByTemp[pTemp] !== created[i].id) {
      created[i].parent_item_id = idByTemp[pTemp];
      await created[i].save({ transaction });
    }
  }
}

// Walk up the parent chain to compute the depth (level) of a node.
async function computeLevel(parentId) {
  let lvl = 0;
  let cur = parentId ? await ProductMaster.findByPk(parentId) : null;
  let depth = 0;
  while (cur && cur.parent_id) {
    lvl += 1;
    cur = await ProductMaster.findByPk(cur.parent_id);
    if (++depth > 50) break; // safety stop against corrupted cycles
  }
  return parentId ? lvl + 1 : 0;
}

// True if `maybeAncestorId` is somewhere in the ancestor chain of `nodeId`
// (used to reject a parent change that would create a cycle).
async function isAncestor(maybeAncestorId, nodeId) {
  let cur = await ProductMaster.findByPk(maybeAncestorId);
  let depth = 0;
  while (cur && cur.parent_id) {
    if (cur.parent_id === nodeId) return true;
    cur = await ProductMaster.findByPk(cur.parent_id);
    if (++depth > 50) return true;
  }
  return false;
}

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
      attributes: {
        include: [
          [Sequelize.literal('(SELECT COUNT(*) FROM m_product_item_master WHERE m_product_item_master.product_id = "ProductMaster"."id")'), 'componentsCount'],
        ],
      },
      include: [
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
      include: [
        {
          model: ProductItemMaster, as: 'items',
          include: [{ model: ItemMaster, as: 'item', attributes: ['item_code', 'item_name', 'item_description', 'barcode', 'hsn_code', 'make_buy'] }],
        },
        { model: ProductCategory, as: 'category', include: [{ model: ProductCategory, as: 'parent' }] },
      ],
    });
    if (!doc) return res.status(404).json({ error: 'Not found' });
    res.json(doc);
  } catch (err) {
    console.error('Error fetching product:', err);
    res.status(500).json({ error: 'Failed to fetch' });
  }
};

exports.create = async (req, res) => {
  const t = await db.sequelize.transaction();
  try {
    let { items, main_category_name, sub_category_name, ...header } = req.body;
    if (header.item_id === '') header.item_id = null;
    if (header.parent_id === '') header.parent_id = null;
    if (header.default_bom_id === '') header.default_bom_id = null;
    if (header.category_id === '') header.category_id = null;
    if (!header.product_uid) {
      const count = await ProductMaster.count();
      header.product_uid = `PROD${String(count + 1).padStart(4, '0')}`;
    }
    if (header.node_type && !NODE_TYPES.includes(header.node_type)) {
      await t.rollback(); return res.status(400).json({ error: 'Invalid node_type' });
    }
    if (header.parent_id) {
      const parent = await ProductMaster.findByPk(header.parent_id);
      if (!parent) { await t.rollback(); return res.status(400).json({ error: 'Parent product not found' }); }
    }
    if (!header.category_id && (main_category_name || sub_category_name)) {
      header.category_id = await resolveCategory(main_category_name, sub_category_name);
    }
    if (!header.product_code) {
      const subName = sub_category_name || (header.category_id ? (await ProductCategory.findByPk(header.category_id))?.name : '') || '';
      const seq = (await ProductMaster.count({ where: { category_id: header.category_id } })) + 1;
      header.product_code = buildProductCode(subName, header.color, seq);
    }
    header.tree_level = await computeLevel(header.parent_id);
    if (header.node_type && ASSEMBLY_NODES.includes(header.node_type)) header.is_subassembly = true;
    const doc = await ProductMaster.create(header, { transaction: t });
    if (items && items.length > 0) {
      await saveProductItems(items, doc.id, t);
    }
    await t.commit();
    const result = await ProductMaster.findByPk(doc.id, {
      include: [{ model: ProductItemMaster, as: 'items' }, { model: ProductCategory, as: 'category', include: [{ model: ProductCategory, as: 'parent' }] }],
    });
    res.status(201).json(result);
  } catch (err) {
    await t.rollback();
    console.error('Error creating product:', err);
    res.status(500).json({ error: 'Failed to create' });
  }
};

exports.update = async (req, res) => {
  const t = await db.sequelize.transaction();
  try {
    const doc = await ProductMaster.findByPk(req.params.id);
    if (!doc) { await t.rollback(); return res.status(404).json({ error: 'Not found' }); }
    const { items, main_category_name, sub_category_name, ...header } = req.body;
    if (header.item_id === '') header.item_id = null;
    if (header.parent_id === '') header.parent_id = null;
    if (header.default_bom_id === '') header.default_bom_id = null;
    if (header.category_id === '') header.category_id = null;
    if (header.node_type && !NODE_TYPES.includes(header.node_type)) {
      await t.rollback(); return res.status(400).json({ error: 'Invalid node_type' });
    }
    if (header.parent_id !== undefined && header.parent_id && header.parent_id !== doc.parent_id) {
      if (header.parent_id === doc.id) { await t.rollback(); return res.status(400).json({ error: 'A product cannot be its own parent' }); }
      const parent = await ProductMaster.findByPk(header.parent_id);
      if (!parent) { await t.rollback(); return res.status(400).json({ error: 'Parent product not found' }); }
      if (await isAncestor(header.parent_id, doc.id)) { await t.rollback(); return res.status(400).json({ error: 'Invalid parent: would create a cycle' }); }
    }
    if (!header.category_id && (main_category_name || sub_category_name)) {
      header.category_id = await resolveCategory(main_category_name, sub_category_name);
    }
    const parentId = header.parent_id !== undefined ? header.parent_id : doc.parent_id;
    header.tree_level = await computeLevel(parentId);
    if (header.node_type !== undefined) {
      header.is_subassembly = ASSEMBLY_NODES.includes(header.node_type);
    }
    await doc.update(header, { transaction: t });
    if (items) {
      await ProductItemMaster.destroy({ where: { product_id: doc.id }, transaction: t });
      await saveProductItems(items, doc.id, t);
    }
    await t.commit();
    const result = await ProductMaster.findByPk(doc.id, {
      include: [{ model: ProductItemMaster, as: 'items' }, { model: ProductCategory, as: 'category', include: [{ model: ProductCategory, as: 'parent' }] }],
    });
    res.json(result);
  } catch (err) {
    await t.rollback();
    console.error('Error updating product:', err);
    res.status(500).json({ error: 'Failed to update' });
  }
};

exports.delete = async (req, res) => {
  try {
    const doc = await ProductMaster.findByPk(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Not found' });
    const childCount = await ProductMaster.count({ where: { parent_id: doc.id } });
    if (childCount > 0) return res.status(409).json({ error: 'Delete child nodes first' });
    await ProductItemMaster.destroy({ where: { product_id: doc.id } });
    await doc.destroy();
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error('Error deleting product:', err);
    res.status(500).json({ error: 'Failed to delete' });
  }
};

// ──────────────────────────────── Assembly / BOM helpers ────────────────────────────────

// Recursively build the product/assembly tree (parent → children) including each
// node's flattened component list (ProductItemMaster) and its BOM(s). This is the
// single reliable view used by MRP, cost roll-up and the product structure screen.
async function buildProductTree(id, seen = new Set()) {
  if (seen.has(id)) return null; // cycle guard
  seen.add(id);
  const node = await ProductMaster.findByPk(id, {
    include: [
      { model: ItemMaster, as: 'item', attributes: ['id', 'item_code', 'item_name', 'make_buy', 'unit_id'] },
      { model: ProductItemMaster, as: 'items' },
      { model: BOM, as: 'boms', include: [{ model: BOMItem, as: 'items' }] },
    ],
  });
  if (!node) return null;
  const kids = await ProductMaster.findAll({
    where: { parent_id: id, is_active: true },
    order: [['sort_order', 'ASC'], ['id', 'ASC']],
  });
  node.dataValues.children = [];
  for (const k of kids) {
    const child = await buildProductTree(k.id, seen);
    if (child) node.dataValues.children.push(child);
  }
  return node;
}

exports.getAssemblyTree = async (req, res) => {
  try {
    const root = await buildProductTree(Number(req.params.id));
    if (!root) return res.status(404).json({ error: 'Product not found' });
    res.json(root);
  } catch (err) {
    console.error('Error building assembly tree:', err);
    res.status(500).json({ error: 'Failed to build assembly tree' });
  }
};

// Explode a product's component tree into a flat, quantity-rolled list, recursing
// through any `component_product_id` links so sub-assembly masters are expanded.
async function explodeProductItems(productId, mult = 1, level = 0, seen = new Set()) {
  if (seen.has(productId)) return [];
  seen.add(productId);
  const items = await ProductItemMaster.findAll({
    where: { product_id: productId },
    order: [['sort_order', 'ASC'], ['id', 'ASC']],
  });
  const out = [];
  for (const it of items) {
    const qty = Number(it.quantity) * mult;
    out.push({ ...it.toJSON(), level, effective_quantity: qty });
    if (it.component_product_id) {
      out.push(...await explodeProductItems(it.component_product_id, qty, level + 1, seen));
    }
  }
  return out;
}

// Return the effective BOM for a product: the pinned default BOM if set, otherwise
// the latest active BOM. Returns null BOM for leaf (SKU) products that have none.
exports.getProductBOM = async (req, res) => {
  try {
    const product = await ProductMaster.findByPk(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    let bom = null;
    if (product.default_bom_id) {
      bom = await BOM.findByPk(product.default_bom_id, { include: [{ model: BOMItem, as: 'items' }] });
    }
    if (!bom) {
      bom = await BOM.findOne({
        where: { product_id: product.id, status: 'Active' },
        order: [['id', 'DESC']],
        include: [{ model: BOMItem, as: 'items' }],
      });
    }
    const exploded_items = await explodeProductItems(product.id);
    res.json({
      product: {
        id: product.id,
        product_uid: product.product_uid,
        product_code: product.product_code,
        node_type: product.node_type,
        item_id: product.item_id,
        default_bom_id: product.default_bom_id,
      },
      bom,
      exploded_items,
    });
  } catch (err) {
    console.error('Error fetching product BOM:', err);
    res.status(500).json({ error: 'Failed to fetch BOM' });
  }
};

// Build a hierarchical BOM view for the editor. Each node is a component line
// (ProductItemMaster). A node's children come from EITHER:
//   - inline child lines (parent_item_id) when it is an inline sub-assembly group, OR
//   - the referenced product's own component lines when component_product_id is set
//     (a reusable sub-assembly). Both nest arbitrarily; `seen` guards against cycles.
async function buildBomNode(line, depth = 0, seen = new Set()) {
  const base = line.toJSON ? line.toJSON() : { ...line };
  const node = { ...base, depth, children: [], isLinked: false, linkedProduct: null };
  if (line.component_product_id) {
    if (seen.has(line.component_product_id)) return node; // cycle guard
    seen.add(line.component_product_id);
    const sa = await ProductMaster.findByPk(line.component_product_id, {
      attributes: ['id', 'product_code', 'product_uid', 'part_name', 'node_type', 'item_id'],
    });
    node.isLinked = true;
    node.linkedProduct = sa ? sa.toJSON() : null;
    const saItems = await ProductItemMaster.findAll({
      where: { product_id: line.component_product_id },
      order: [['sort_order', 'ASC'], ['id', 'ASC']],
    });
    node.children = [];
    for (const c of saItems) node.children.push(await buildBomNode(c, depth + 1, seen));
    seen.delete(line.component_product_id);
  } else {
    const kids = await ProductItemMaster.findAll({
      where: { parent_item_id: line.id },
      order: [['sort_order', 'ASC'], ['id', 'ASC']],
    });
    node.children = [];
    for (const k of kids) node.children.push(await buildBomNode(k, depth + 1, seen));
  }
  return node;
}

// Return the full recursive component tree for a product (used by the BOM editor
// to render sub-assemblies of sub-assemblies inline).
exports.getBomTree = async (req, res) => {
  try {
    const productId = Number(req.params.id);
    const roots = await ProductItemMaster.findAll({
      where: { product_id: productId, parent_item_id: null },
      order: [['sort_order', 'ASC'], ['id', 'ASC']],
    });
    const tree = [];
    for (const r of roots) tree.push(await buildBomNode(r, 0));
    res.json(tree);
  } catch (err) {
    console.error('Error building BOM tree:', err);
    res.status(500).json({ error: 'Failed to build BOM tree' });
  }
};

// Return the products that reference this one as a linked sub-assembly
// (via ProductItemMaster.component_product_id). Used by the sub-assembly form
// to show "where this reusable sub-assembly is used".
exports.getUsedIn = async (req, res) => {
  try {
    const rows = await ProductItemMaster.findAll({
      where: { component_product_id: Number(req.params.id) },
      attributes: ['product_id'],
      group: ['product_id'],
    });
    const ids = rows.map((r) => r.product_id).filter(Boolean);
    if (ids.length === 0) return res.json([]);
    const products = await ProductMaster.findAll({
      where: { id: { [Op.in]: ids } },
      attributes: ['id', 'product_code', 'product_uid', 'part_name', 'node_type'],
    });
    res.json(products);
  } catch (err) {
    console.error('Error fetching used-in:', err);
    res.status(500).json({ error: 'Failed to fetch usage' });
  }
};
