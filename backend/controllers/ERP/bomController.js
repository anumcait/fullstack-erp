const db = require('../../models/ERP');
const { Op } = require('sequelize');

const BOM = db.BOM;
const BOMItem = db.BOMItem;
const ItemMaster = db.ItemMaster;
const ProductMaster = db.ProductMaster;

function sanitizeHeader(header) {
  return {
    ...header,
    labour_cost: Number(header.labour_cost || 0),
    overhead_cost: Number(header.overhead_cost || 0),
    overhead_is_percent: !!header.overhead_is_percent,
    margin_percent: Number(header.margin_percent || 0),
    selling_price: Number(header.selling_price || 0),
  };
}

async function resolveProduct(header) {
  if (header.product_id) {
    const product = await ProductMaster.findByPk(header.product_id);
    if (product) {
      header.product_code = product.product_code || header.product_code || '';
      header.product_name = product.part_name || header.product_name || '';
      if (!header.product_item_id && product.item_id) header.product_item_id = product.item_id;
    }
  }
  return header;
}

async function buildTree(bomId) {
  const bom = await BOM.findByPk(bomId, {
    include: [
      {
        model: BOMItem,
        as: 'items',
        include: [
          { model: BOMItem, as: 'children' },
          { model: BOM, as: 'subBom', attributes: ['id', 'bom_no', 'bom_name', 'product_name'] },
          { model: ItemMaster, as: 'item', attributes: ['id', 'item_code', 'rate', 'gst_rate'] },
        ],
        order: [['sort_order', 'ASC'], ['id', 'ASC']],
      },
      { model: ProductMaster, as: 'product', attributes: ['id', 'product_uid', 'part_name', 'product_code', 'item_id'] },
    ],
  });
  if (!bom) return null;

  const topItems = bom.items.filter((it) => !it.parent_item_id);
  const itemMap = {};
  bom.items.forEach((it) => { itemMap[it.id] = it; });

  function attachChildren(item) {
    if (item.children && item.children.length > 0) {
      item.children = item.children.map((child) => {
        const fullChild = itemMap[child.id];
        return attachChildren(fullChild || child);
      });
    }
    return item;
  }

  return {
    ...bom.toJSON(),
    items: topItems.map(attachChildren),
  };
}

async function explodeBOMRecursive(bomId, multiplier = 1, visited = new Set()) {
  if (visited.has(bomId)) return [];
  visited.add(bomId);

  const bom = await BOM.findByPk(bomId, {
    include: [{
      model: BOMItem,
      as: 'items',
      include: [
        { model: BOMItem, as: 'children' },
        { model: BOM, as: 'subBom', attributes: ['id', 'bom_no', 'bom_name'] },
        { model: ItemMaster, as: 'item', attributes: ['id', 'item_code', 'rate', 'gst_rate'] },
      ],
    }],
  });
  if (!bom) return [];

  const bomOutputQty = Number(bom.output_quantity || 1);
  const effectiveMultiplier = multiplier / bomOutputQty;
  const materials = [];

  for (const item of bom.items) {
    if (item.is_phantom && item.children && item.children.length > 0) {
      for (const child of item.children) {
        const childQty = Number(child.quantity || 0) * effectiveMultiplier;
        if (child.sub_bom_id) {
          const sub = await explodeBOMRecursive(child.sub_bom_id, childQty, visited);
          materials.push(...sub);
        } else {
          materials.push(calculateMaterialRow(child, childQty));
        }
      }
    } else if (item.sub_bom_id) {
      const itemQty = Number(item.quantity || 0) * effectiveMultiplier;
      const sub = await explodeBOMRecursive(item.sub_bom_id, itemQty, visited);
      materials.push(...sub);
    } else if (!item.is_phantom) {
      const itemQty = Number(item.quantity || 0) * effectiveMultiplier;
      materials.push(calculateMaterialRow(item, itemQty));
    }
  }

  return materials;
}

function calculateMaterialRow(item, calculatedQty) {
  const lotQty = Number(item.lot_quantity || 1);
  const wastagePct = Number(item.wastage_percent || 0);
  const effectiveQty = Math.ceil(calculatedQty * 100) / 100;
  const withWastage = calculatedQty * (1 + wastagePct / 100);
  const unitCost = Number(item.unit_cost != null ? item.unit_cost : item.item?.rate || 0);
  const requiredQty = Math.ceil(withWastage * 100) / 100;
  const lineCost = Number((requiredQty * unitCost).toFixed(2));

  return {
    item_id: item.item_id,
    item_code: item.item_code,
    item_name: item.item_name,
    quantity: calculatedQty,
    lot_quantity: lotQty,
    effective_quantity: effectiveQty,
    required_quantity: requiredQty,
    unit_id: item.unit_id,
    color: item.color,
    wastage_percent: wastagePct,
    operation: item.operation || null,
    unit_cost: unitCost,
    line_cost: lineCost,
    cost_source: item.unit_cost != null ? 'override' : (item.item ? 'item_master' : 'missing'),
    remarks: item.remarks,
    source: item.sub_bom_id ? `BOM:${item.subBom?.bom_no || ''}` : 'Raw',
  };
}

exports.getList = async (req, res) => {
  try {
    const { search } = req.query;
    const where = {};
    if (search) {
      where[Op.or] = [
        { bom_no: { [Op.iLike]: `%${search}%` } },
        { bom_name: { [Op.iLike]: `%${search}%` } },
        { product_name: { [Op.iLike]: `%${search}%` } },
      ];
    }
    const data = await BOM.findAll({
      where,
      include: [
        { model: BOMItem, as: 'items', attributes: ['id'] },
        { model: ProductMaster, as: 'product', attributes: ['id', 'product_uid', 'part_name', 'product_code'] },
      ],
      order: [['created_date', 'DESC']],
    });
    res.json(data);
  } catch (err) {
    console.error('Error fetching BOMs:', err);
    res.status(500).json({ error: 'Failed to fetch BOMs' });
  }
};

exports.getOne = async (req, res) => {
  try {
    const tree = await buildTree(req.params.id);
    if (!tree) return res.status(404).json({ error: 'Not found' });
    res.json(tree);
  } catch (err) {
    console.error('Error fetching BOM:', err);
    res.status(500).json({ error: 'Failed to fetch BOM' });
  }
};

exports.explode = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.query;
    const multiplier = Number(quantity) || 1;
    const materials = await explodeBOMRecursive(id, multiplier);
    const grouped = {};
    for (const m of materials) {
      const key = m.item_id || m.item_code;
      if (grouped[key]) {
        grouped[key].quantity += m.quantity;
        grouped[key].effective_quantity += m.effective_quantity;
        grouped[key].required_quantity += m.required_quantity;
        grouped[key].line_cost = Number((grouped[key].line_cost + m.line_cost).toFixed(2));
        grouped[key].source = [].concat(grouped[key].source, m.source).join(', ');
      } else {
        grouped[key] = { ...m };
      }
    }
    res.json(Object.values(grouped));
  } catch (err) {
    console.error('Error exploding BOM:', err);
    res.status(500).json({ error: 'Failed to explode BOM' });
  }
};

exports.costing = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.query;
    const bom = await BOM.findByPk(id);
    if (!bom) return res.status(404).json({ error: 'Not found' });

    const outputQty = Number(bom.output_quantity || 1);
    const plannedQty = Number(quantity) || outputQty;
    const scale = plannedQty / outputQty;

    const materials = await explodeBOMRecursive(id, plannedQty);
    const byItem = {};
    for (const m of materials) {
      const key = m.item_id || m.item_code;
      if (byItem[key]) {
        byItem[key].required_quantity = Number((byItem[key].required_quantity + m.required_quantity).toFixed(4));
        byItem[key].line_cost = Number((byItem[key].line_cost + m.line_cost).toFixed(2));
      } else {
        byItem[key] = { ...m };
      }
    }
    const materialRows = Object.values(byItem).sort((a, b) => b.line_cost - a.line_cost);
    const materialCost = Number(materialRows.reduce((s, r) => s + r.line_cost, 0).toFixed(2));

    const labourCost = Number(bom.labour_cost || 0) * scale;
    let overheadCost;
    if (bom.overhead_is_percent) {
      overheadCost = materialCost * (Number(bom.overhead_cost || 0) / 100);
    } else {
      overheadCost = Number(bom.overhead_cost || 0) * scale;
    }
    overheadCost = Number(overheadCost.toFixed(2));

    const totalCost = Number((materialCost + labourCost + overheadCost).toFixed(2));
    const costPerUnit = plannedQty > 0 ? Number((totalCost / plannedQty).toFixed(2)) : 0;
    const marginPct = Number(bom.margin_percent || 0);
    const sellingPrice = Number(bom.selling_price || 0) > 0
      ? Number(bom.selling_price)
      : Number((costPerUnit * (1 + marginPct / 100)).toFixed(2));

    res.json({
      bom_no: bom.bom_no,
      bom_name: bom.bom_name,
      product_name: bom.product_name,
      output_quantity: outputQty,
      planned_quantity: plannedQty,
      material_rows: materialRows,
      summary: {
        material_cost: materialCost,
        labour_cost: Number(labourCost.toFixed(2)),
        overhead_cost: overheadCost,
        overhead_is_percent: !!bom.overhead_is_percent,
        total_cost: totalCost,
        cost_per_unit: costPerUnit,
        margin_percent: marginPct,
        selling_price: sellingPrice,
        profit_per_unit: Number((sellingPrice - costPerUnit).toFixed(2)),
      },
    });
  } catch (err) {
    console.error('Error computing BOM costing:', err);
    res.status(500).json({ error: 'Failed to compute costing' });
  }
};

exports.create = async (req, res) => {
  try {
    let { items, ...header } = req.body;
    header = sanitizeHeader(header);
    header = await resolveProduct(header);
    if (!header.bom_no) {
      const count = await BOM.count();
      header.bom_no = `PROD-${String(count + 1).padStart(4, '0')}`;
    }
    const doc = await BOM.create(header);
    if (items && items.length > 0) {
      const rows = items.map((it, idx) => ({
        bom_id: doc.id,
        parent_item_id: it.parent_item_id || null,
        sub_bom_id: it.sub_bom_id || null,
        sort_order: it.sort_order ?? idx,
        section_name: it.section_name || null,
        is_phantom: !!it.is_phantom,
        item_id: it.item_id || null,
        item_code: it.item_code || '',
        item_name: it.item_name || '',
        quantity: it.quantity || 0,
        lot_quantity: it.lot_quantity || 1,
        unit_id: it.unit_id || null,
        wastage_percent: it.wastage_percent || 0,
        color: it.color || null,
        unit_cost: it.unit_cost != null ? it.unit_cost : null,
        operation: it.operation || null,
        remarks: it.remarks || '',
      }));
      await BOMItem.bulkCreate(rows);
    }
    const result = await buildTree(doc.id);
    res.status(201).json(result);
  } catch (err) {
    console.error('Error creating BOM:', err);
    res.status(500).json({ error: 'Failed to create BOM' });
  }
};

exports.update = async (req, res) => {
  try {
    const doc = await BOM.findByPk(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Not found' });
    const { items, ...header } = req.body;
    await doc.update(await resolveProduct(sanitizeHeader(header)));
    await BOMItem.destroy({ where: { bom_id: doc.id } });
    if (items && items.length > 0) {
      const rows = items.map((it, idx) => ({
        bom_id: doc.id,
        parent_item_id: it.parent_item_id || null,
        sub_bom_id: it.sub_bom_id || null,
        sort_order: it.sort_order ?? idx,
        section_name: it.section_name || null,
        is_phantom: !!it.is_phantom,
        item_id: it.item_id || null,
        item_code: it.item_code || '',
        item_name: it.item_name || '',
        quantity: it.quantity || 0,
        lot_quantity: it.lot_quantity || 1,
        unit_id: it.unit_id || null,
        wastage_percent: it.wastage_percent || 0,
        color: it.color || null,
        unit_cost: it.unit_cost != null ? it.unit_cost : null,
        operation: it.operation || null,
        remarks: it.remarks || '',
      }));
      await BOMItem.bulkCreate(rows);
    }
    const result = await buildTree(doc.id);
    res.json(result);
  } catch (err) {
    console.error('Error updating BOM:', err);
    res.status(500).json({ error: 'Failed to update BOM' });
  }
};

exports.delete = async (req, res) => {
  try {
    const doc = await BOM.findByPk(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Not found' });
    await BOMItem.destroy({ where: { bom_id: doc.id } });
    await doc.destroy();
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error('Error deleting BOM:', err);
    res.status(500).json({ error: 'Failed to delete' });
  }
};
