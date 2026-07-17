const db = require('../../models/ERP');
const { Op } = require('sequelize');

const ProductionOrder = db.ProductionOrder;
const ProductionOrderItem = db.ProductionOrderItem;
const BOM = db.BOM;
const BOMItem = db.BOMItem;
const ItemMaster = db.ItemMaster;

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

  return {
    item_id: item.item_id,
    item_code: item.item_code,
    item_name: item.item_name,
    quantity: calculatedQty,
    effective_quantity: effectiveQty,
    required_quantity: Math.ceil(withWastage * 100) / 100,
    unit_id: item.unit_id,
    wastage_percent: wastagePct,
    color: item.color,
    remarks: item.remarks,
    source: item.sub_bom_id ? `BOM:${item.subBom?.bom_no || ''}` : 'Raw',
  };
}

exports.getList = async (req, res) => {
  try {
    const { search, status, order_type, from, to } = req.query;
    const where = {};
    if (status) where.status = status;
    if (order_type) where.order_type = order_type;
    if (from || to) {
      where.created_date = {};
      if (from) where.created_date[Op.gte] = from;
      if (to) where.created_date[Op.lte] = to;
    }
    if (search) {
      where[Op.or] = [
        { order_no: { [Op.iLike]: `%${search}%` } },
        { product_name: { [Op.iLike]: `%${search}%` } },
      ];
    }
    const data = await ProductionOrder.findAll({
      where,
      include: [{ model: ProductionOrderItem, as: 'items' }],
      order: [['created_date', 'DESC']],
    });
    res.json(data);
  } catch (err) {
    console.error('Error fetching production orders:', err);
    res.status(500).json({ error: 'Failed to fetch' });
  }
};

exports.getOne = async (req, res) => {
  try {
    const doc = await ProductionOrder.findByPk(req.params.id, {
      include: [{ model: ProductionOrderItem, as: 'items' }],
    });
    if (!doc) return res.status(404).json({ error: 'Not found' });
    res.json(doc);
  } catch (err) {
    console.error('Error fetching production order:', err);
    res.status(500).json({ error: 'Failed to fetch' });
  }
};

exports.create = async (req, res) => {
  try {
    const { bom_id, planned_quantity, ...rest } = req.body;

    const bom = await BOM.findByPk(bom_id);
    if (!bom) return res.status(400).json({ error: 'BOM not found' });
    if (bom.status !== 'Active') return res.status(400).json({ error: 'BOM must be Active' });

    const count = await ProductionOrder.count();
    const orderNo = `PO-${String(count + 1).padStart(4, '0')}`;

    const doc = await ProductionOrder.create({
      order_no: orderNo,
      bom_id,
      product_item_id: bom.product_item_id,
      product_code: bom.product_code,
      product_name: bom.product_name,
      planned_quantity,
      produced_quantity: 0,
      status: 'Planning',
      order_type: rest.order_type || 'Job Order',
      ...rest,
    });

    const materials = await explodeBOMRecursive(bom_id, Number(planned_quantity));
    const grouped = {};
    for (const m of materials) {
      const key = m.item_id || m.item_code;
      if (grouped[key]) {
        grouped[key].required_quantity += m.required_quantity;
      } else {
        grouped[key] = { ...m };
      }
    }

    const items = Object.values(grouped).map((m) => ({
      order_id: doc.id,
      item_id: m.item_id,
      item_code: m.item_code || '',
      item_name: m.item_name || '',
      required_quantity: m.required_quantity || 0,
      issued_quantity: 0,
      unit_id: m.unit_id,
      color: m.color || null,
      remarks: [m.remarks, m.source].filter(Boolean).join(' | '),
    }));
    await ProductionOrderItem.bulkCreate(items);

    const result = await ProductionOrder.findByPk(doc.id, {
      include: [{ model: ProductionOrderItem, as: 'items' }],
    });
    res.status(201).json(result);
  } catch (err) {
    console.error('Error creating production order:', err);
    res.status(500).json({ error: 'Failed to create' });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const doc = await ProductionOrder.findByPk(req.params.id, {
      include: [{ model: ProductionOrderItem, as: 'items' }],
    });
    if (!doc) return res.status(404).json({ error: 'Not found' });

    const { status, produced_quantity } = req.body;

    if (status === 'Completed') {
      const product = await ItemMaster.findByPk(doc.product_item_id);
      if (product) {
        const qty = Number(produced_quantity || doc.produced_quantity || doc.planned_quantity);
        await product.update({ current_stock: Number(product.current_stock || 0) + qty });
      }
      await doc.update({ status, produced_quantity: produced_quantity || doc.planned_quantity, end_date: new Date() });
    } else if (status === 'Released') {
      await doc.update({ status, start_date: new Date() });
    } else {
      await doc.update({ status, ...(produced_quantity ? { produced_quantity } : {}) });
    }

    const result = await ProductionOrder.findByPk(doc.id, {
      include: [{ model: ProductionOrderItem, as: 'items' }],
    });
    res.json(result);
  } catch (err) {
    console.error('Error updating production order:', err);
    res.status(500).json({ error: 'Failed to update' });
  }
};

exports.issueMaterial = async (req, res) => {
  try {
    const doc = await ProductionOrder.findByPk(req.params.id, {
      include: [{ model: ProductionOrderItem, as: 'items' }],
    });
    if (!doc) return res.status(404).json({ error: 'Not found' });

    const { items } = req.body;

    for (const issued of items) {
      const orderItem = doc.items.find((i) => i.item_id === issued.item_id);
      if (!orderItem) continue;

      const newIssued = Number(orderItem.issued_quantity || 0) + Number(issued.issued_quantity || 0);
      await orderItem.update({ issued_quantity: newIssued });

      const stockItem = await ItemMaster.findByPk(issued.item_id);
      if (stockItem) {
        await stockItem.update({ current_stock: Math.max(0, Number(stockItem.current_stock || 0) - Number(issued.issued_quantity || 0)) });
      }
    }

    const result = await ProductionOrder.findByPk(doc.id, {
      include: [{ model: ProductionOrderItem, as: 'items' }],
    });
    res.json(result);
  } catch (err) {
    console.error('Error issuing material:', err);
    res.status(500).json({ error: 'Failed to issue material' });
  }
};

exports.delete = async (req, res) => {
  try {
    const doc = await ProductionOrder.findByPk(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Not found' });
    await ProductionOrderItem.destroy({ where: { order_id: doc.id } });
    await doc.destroy();
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error('Error deleting production order:', err);
    res.status(500).json({ error: 'Failed to delete' });
  }
};
