const db = require('../../models/ERP');
const { Op } = require('sequelize');
const { getNextSequence } = require('../../utils/docNumber');

const JobOrder = db.JobOrder;
const JobOrderItem = db.JobOrderItem;
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
    const { search, status, order_type, date_from, date_to, year } = req.query;
    const where = {};
    if (status) where.status = status;
    if (order_type) where.order_type = order_type;
    if (date_from || date_to || year) {
      const dateWhere = {};
      if (date_from) dateWhere[Op.gte] = date_from;
      if (date_to) dateWhere[Op.lte] = date_to;
      if (year) {
        dateWhere[Op.gte] = `${year}-01-01`;
        dateWhere[Op.lte] = `${year}-12-31`;
      }
      where.jo_date = dateWhere;
    }
    if (search) {
      where[Op.or] = [
        { order_no: { [Op.iLike]: `%${search}%` } },
        { product_name: { [Op.iLike]: `%${search}%` } },
        { party_name: { [Op.iLike]: `%${search}%` } },
      ];
    }
    const data = await JobOrder.findAll({
      where,
      include: [{ model: JobOrderItem, as: 'items' }],
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
    const doc = await JobOrder.findByPk(req.params.id, {
      include: [{ model: JobOrderItem, as: 'items' }],
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
    const { bom_id, planned_quantity, items: bodyItems, ...rest } = req.body;

    const { orderNo } = await getNextSequence('t_production_order', 'JO');

    let bom = null;
    if (bom_id) {
      bom = await BOM.findByPk(bom_id);
      if (!bom) return res.status(400).json({ error: 'BOM not found' });
      if (bom.status !== 'Active') return res.status(400).json({ error: 'BOM must be Active' });
    }

    const doc = await JobOrder.create({
      order_no: orderNo,
      bom_id: bom_id || null,
      product_item_id: bom?.product_item_id || null,
      product_code: bom?.product_code || rest.product_code || '',
      product_name: bom?.product_name || rest.product_name || '',
      planned_quantity: planned_quantity || 1,
      produced_quantity: 0,
      status: 'Planning',
      order_type: rest.order_type || 'Job Order',
      ...rest,
    });

    let orderItems = [];
    if (Array.isArray(bodyItems) && bodyItems.length > 0) {
      orderItems = bodyItems.map((it) => ({
        order_id: doc.id,
        item_id: it.item_id || null,
        item_code: it.item_code || '',
        item_name: it.item_name || '',
        required_quantity: Number(it.quantity || it.required_quantity || 0),
        issued_quantity: 0,
        unit_id: it.unit_id || null,
        remarks: it.remarks || '',
      }));
    } else if (bom) {
      const materials = await explodeBOMRecursive(bom_id, Number(planned_quantity || 1));
      const grouped = {};
      for (const m of materials) {
        const key = m.item_id || m.item_code;
        if (grouped[key]) {
          grouped[key].required_quantity += m.required_quantity;
        } else {
          grouped[key] = { ...m };
        }
      }
      orderItems = Object.values(grouped).map((m) => ({
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
    }

    if (orderItems.length > 0) await JobOrderItem.bulkCreate(orderItems);

    const result = await JobOrder.findByPk(doc.id, {
      include: [{ model: JobOrderItem, as: 'items' }],
    });
    res.status(201).json(result);
  } catch (err) {
    console.error('Error creating production order:', err);
    res.status(500).json({ error: 'Failed to create' });
  }
};

exports.update = async (req, res) => {
  try {
    const doc = await JobOrder.findByPk(req.params.id, {
      include: [{ model: JobOrderItem, as: 'items' }],
    });
    if (!doc) return res.status(404).json({ error: 'Not found' });

    const { items: bodyItems, ...rest } = req.body;

    await doc.update({
      party_id: rest.party_id || null,
      party_name: rest.party_name || '',
      department: rest.department || '',
      req_date: rest.req_date || null,
      jo_date: rest.jo_date || null,
      payment_terms: rest.payment_terms || '',
      delivery_terms: rest.delivery_terms || '',
      currency: rest.currency || 'INR',
      notes: rest.notes || '',
      remarks: rest.remarks || '',
      subject: rest.subject || '',
      reference: rest.reference || '',
      qtn_no: rest.qtn_no || '',
      ref_date: rest.ref_date || null,
      insurance: rest.insurance || '',
      inspection: rest.inspection || '',
      freight: rest.freight || '',
      freight_forward: rest.freight_forward || '',
      old_jo_no: rest.old_jo_no || '',
      jo_year: rest.jo_year || '',
      delivery_period: rest.delivery_period || '',
      desp_to: rest.desp_to || '',
      any_other_terms: rest.any_other_terms || '',
    });

    if (Array.isArray(bodyItems) && bodyItems.length > 0) {
      await JobOrderItem.destroy({ where: { order_id: doc.id } });
      const orderItems = bodyItems.map((it) => ({
        order_id: doc.id,
        item_id: it.item_id || null,
        item_code: it.item_code || '',
        item_name: it.item_name || '',
        required_quantity: Number(it.quantity || it.required_quantity || 0),
        issued_quantity: 0,
        unit_id: it.unit_id || null,
        remarks: it.remarks || '',
      }));
      await JobOrderItem.bulkCreate(orderItems);
    }

    const result = await JobOrder.findByPk(doc.id, {
      include: [{ model: JobOrderItem, as: 'items' }],
    });
    res.json(result);
  } catch (err) {
    console.error('Error updating production order:', err);
    res.status(500).json({ error: 'Failed to update' });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const doc = await JobOrder.findByPk(req.params.id, {
      include: [{ model: JobOrderItem, as: 'items' }],
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

    const result = await JobOrder.findByPk(doc.id, {
      include: [{ model: JobOrderItem, as: 'items' }],
    });
    res.json(result);
  } catch (err) {
    console.error('Error updating production order:', err);
    res.status(500).json({ error: 'Failed to update' });
  }
};

exports.issueMaterial = async (req, res) => {
  try {
    const doc = await JobOrder.findByPk(req.params.id, {
      include: [{ model: JobOrderItem, as: 'items' }],
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

    const result = await JobOrder.findByPk(doc.id, {
      include: [{ model: JobOrderItem, as: 'items' }],
    });
    res.json(result);
  } catch (err) {
    console.error('Error issuing material:', err);
    res.status(500).json({ error: 'Failed to issue material' });
  }
};

exports.delete = async (req, res) => {
  try {
    const doc = await JobOrder.findByPk(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Not found' });
    await JobOrderItem.destroy({ where: { order_id: doc.id } });
    await doc.destroy();
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error('Error deleting production order:', err);
    res.status(500).json({ error: 'Failed to delete' });
  }
};
