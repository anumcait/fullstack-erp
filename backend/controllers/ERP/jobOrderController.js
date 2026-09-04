const db = require('../../models/ERP');
const { Op } = require('sequelize');
const { nextDocNumber } = require('../../utils/docNumber');
const { postMovement, getDefaultWarehouse, lockStock, negativeStockAllowed, REF_TYPES } = require('../../utils/stockService');

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
      include: [{ model: JobOrderItem, as: 'items' }, { model: db.ProductionMachine, as: 'machine', attributes: ['id', 'machine_code', 'machine_name'] }],
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
      include: [{ model: JobOrderItem, as: 'items' }, { model: db.ProductionMachine, as: 'machine', attributes: ['id', 'machine_code', 'machine_name'] }],
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

    const orderNo = await nextDocNumber(JobOrder, 'order_no', 1, 'JO');

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
      const valid = bodyItems.filter(it => it.item_id && !String(it.item_id).startsWith('ASM-') && Number(it.quantity || it.required_quantity || 0) > 0);
      if (!valid.length) console.warn('Create JO: bodyItems filtered to 0 — raw:', bodyItems);
      orderItems = valid.map((it) => ({
        order_id: doc.id,
        item_id: Number(it.item_id),
        item_code: it.item_code || '',
        item_name: it.item_name || '',
        required_quantity: Number(it.quantity || it.required_quantity || 0),
        issued_quantity: 0,
        unit_id: it.unit_id || null,
        remarks: it.remarks || it.item_description || '',
      }));
      if (!orderItems.length && bodyItems.length) {
        orderItems = bodyItems.filter(it => it.item_id && !String(it.item_id).startsWith('ASM-')).map(it => ({
          order_id: doc.id,
          item_id: Number(it.item_id),
          item_code: it.item_code || '',
          item_name: it.item_name || '',
          required_quantity: Number(it.quantity || it.required_quantity || it.total_need || 0),
          issued_quantity: 0,
          unit_id: it.unit_id || null,
          remarks: it.remarks || it.item_description || '',
        }));
      }
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
      include: [{ model: JobOrderItem, as: 'items' }, { model: db.ProductionMachine, as: 'machine', attributes: ['id', 'machine_code', 'machine_name'] }],
    });
    res.status(201).json(result);
  } catch (err) {
    console.error('Error creating production order:', err);
    res.status(500).json({ error: err.message || 'Failed to create', details: err.errors?.map(e=>e.message).join(', ') || undefined });
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
      product_code: rest.product_code || doc.product_code,
      product_name: rest.product_name || doc.product_name,
      planned_quantity: rest.planned_quantity || doc.planned_quantity,
      bom_id: rest.bom_id ?? doc.bom_id,
      order_type: rest.order_type || doc.order_type,
      machine_id: rest.machine_id ?? doc.machine_id,
      work_center: rest.work_center ?? doc.work_center,
      shift: rest.shift ?? doc.shift,
      priority: rest.priority ?? doc.priority,
      scheduled_start: rest.scheduled_start || doc.scheduled_start,
      scheduled_end: rest.scheduled_end || doc.scheduled_end,
      start_date: rest.start_date || doc.start_date,
      end_date: rest.end_date || doc.end_date,
      estimated_hours: rest.estimated_hours ?? doc.estimated_hours,
      instructions: rest.instructions ?? doc.instructions,
      operations: Array.isArray(rest.operations) ? rest.operations : doc.operations,
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
  const t = await db.sequelize.transaction();
  try {
    const doc = await JobOrder.findByPk(req.params.id, {
      include: [{ model: JobOrderItem, as: 'items' }],
      transaction: t,
    });
    if (!doc) return res.status(404).json({ error: 'Not found' });

    const { status, produced_quantity } = req.body;

    if (status === 'Completed') {
      const product = await ItemMaster.findByPk(doc.product_item_id, { transaction: t });
      if (product) {
        const qty = Number(produced_quantity || doc.produced_quantity || doc.planned_quantity);
        const wh = await getDefaultWarehouse();
        await postMovement(
          {
            item_id: doc.product_item_id,
            warehouse_id: wh?.id || null,
            ledger_date: new Date(),
            ref_type: REF_TYPES.PRODUCTION_IN,
            doc_no: doc.order_no,
            ref_no: doc.order_no,
            qty_in: qty,
            qty_out: 0,
            unit_cost: Number(product.moving_average_cost || 0) || Number(product.standard_cost || 0),
            remarks: `Production completed - ${doc.order_no}`,
            user: req.session?.user?.name || 'System',
          },
          t
        );
      }
      await doc.update({ status, produced_quantity: produced_quantity || doc.planned_quantity, end_date: new Date() }, { transaction: t });
    } else if (status === 'Released') {
      await doc.update({ status, start_date: new Date() }, { transaction: t });
    } else {
      await doc.update({ status, ...(produced_quantity ? { produced_quantity } : {}) }, { transaction: t });
    }

    await t.commit();
    const result = await JobOrder.findByPk(doc.id, {
      include: [{ model: JobOrderItem, as: 'items' }],
    });
    res.json(result);
  } catch (err) {
    await t.rollback();
    console.error('Error updating production order:', err);
    res.status(500).json({ error: 'Failed to update' });
  }
};

exports.issueMaterial = async (req, res) => {
  const t = await db.sequelize.transaction();
  try {
    const doc = await JobOrder.findByPk(req.params.id, {
      include: [{ model: JobOrderItem, as: 'items' }],
      transaction: t,
    });
    if (!doc) return res.status(404).json({ error: 'Not found' });

    const { items } = req.body;
    const wh = await getDefaultWarehouse();
    const negAllowed = await negativeStockAllowed();

    for (const issued of items) {
      const orderItem = doc.items.find((i) => i.item_id === issued.item_id);
      if (!orderItem) continue;

      const qty = Number(issued.issued_quantity || 0);
      const newIssued = Number(orderItem.issued_quantity || 0) + qty;
      await orderItem.update({ issued_quantity: newIssued }, { transaction: t });

      if (qty > 0 && !negAllowed) {
        const locked = await lockStock(issued.item_id, t);
        if (Number(locked?.current_stock || 0) < qty) {
          throw new Error(`Insufficient stock for ${orderItem.item_code || orderItem.item_name}`);
        }
      }
      const stockItem = await ItemMaster.findByPk(issued.item_id, { transaction: t });
      if (stockItem) {
        await postMovement(
          {
            item_id: issued.item_id,
            warehouse_id: wh?.id || null,
            ledger_date: new Date(),
            ref_type: REF_TYPES.PRODUCTION_CONSUMPTION,
            doc_no: doc.order_no,
            ref_no: doc.order_no,
            qty_in: 0,
            qty_out: qty,
            unit_cost: Number(stockItem.moving_average_cost || 0),
            remarks: `Material issued to production - ${doc.order_no}`,
            user: req.session?.user?.name || 'System',
          },
          t
        );
      }
    }

    await t.commit();
    const result = await JobOrder.findByPk(doc.id, {
      include: [{ model: JobOrderItem, as: 'items' }],
    });
    res.json(result);
  } catch (err) {
    await t.rollback();
    console.error('Error issuing material:', err);
    res.status(500).json({ error: err.message || 'Failed to issue material' });
  }
};

async function buildPlanFromBOM(bomId, orderQty, level, parentCode, visited) {
  if (visited.has(bomId)) return [];
  visited.add(bomId);
  const bom = await BOM.findByPk(bomId, {
    include: [{ model: BOMItem, as: 'items', include: [{ model: BOMItem, as: 'children' }, { model: BOM, as: 'subBom', attributes: ['id', 'bom_no', 'bom_name'] }] }],
  });
  if (!bom) { visited.delete(bomId); return []; }
  const bomOut = Number(bom.output_quantity || 1);
  const effMult = orderQty / bomOut;
  const out = [];
  for (const item of bom.items.filter(i => !i.parent_item_id)) {
    if (item.is_phantom && item.children && item.children.length) {
      for (const child of item.children) {
        const bomQty = Number(child.quantity || 0);
        const effective = bomQty * effMult;
        const wastage = Number(child.wastage_percent || 0);
        const totalNeed = effective * (1 + wastage / 100);
        if (child.sub_bom_id) {
          const subBom = await BOM.findByPk(child.sub_bom_id, { attributes: ['product_name', 'bom_no'] });
          const headerCode = child.item_code || subBom?.bom_no || `ASM-${child.sub_bom_id}`;
          const headerName = child.item_name || subBom?.product_name || 'Sub Assembly';
          out.push({ item_id: `ASM-${child.sub_bom_id}`, item_code: headerCode, item_name: headerName, item_description: child.remarks || headerName, product_description: headerName, group: 'Sub Assembly', make_buy: 'Make', is_purchase: false, is_stock: true, unit: '', level, parent_assembly: parentCode, is_subassembly_item: false, is_assembly_header: true, bom_qty: bomQty, effective_qty: Math.round(effective * 100) / 100, wastage_percent: wastage, total_need: Math.round(totalNeed * 100) / 100, current_stock: 0, short_qty: Math.round(totalNeed * 100) / 100, purchase_qty: 0, production_qty: Math.round(totalNeed * 100) / 100 });
          const sub = await buildPlanFromBOM(child.sub_bom_id, effective, level + 1, headerCode, visited);
          out.push(...sub);
        } else {
          if (!child.item_id) continue;
          const im = await ItemMaster.findByPk(child.item_id, { include: [{ model: db.ItemGroup, as: 'group' }, { model: db.Unit, as: 'unit' }] });
          if (!im) continue;
          const stock = Number(im.current_stock || 0);
          const short = Math.max(0, totalNeed - stock);
          out.push({ item_id: im.id, item_code: im.item_code, item_name: im.item_name, item_description: child.remarks || im.item_description || '', product_description: im.item_name, group: im.group?.name || '-', make_buy: im.make_buy, is_purchase: im.is_purchase_item, is_stock: im.is_stock_item, unit: im.unit?.short_name || im.unit?.name || '', level, parent_assembly: parentCode, is_subassembly_item: level > 0, bom_qty: bomQty, effective_qty: Math.round(effective * 100) / 100, wastage_percent: wastage, total_need: Math.round(totalNeed * 100) / 100, current_stock: stock, short_qty: Math.round(short * 100) / 100, purchase_qty: im.make_buy === 'Buy' ? Math.round(short * 100) / 100 : 0, production_qty: im.make_buy === 'Make' ? Math.round(short * 100) / 100 : 0 });
        }
      }
    } else if (item.sub_bom_id) {
      const bomQty = Number(item.quantity || 0);
      const effective = bomQty * effMult;
      const wastage = Number(item.wastage_percent || 0);
      const totalNeed = effective * (1 + wastage / 100);
      const subBom = await BOM.findByPk(item.sub_bom_id, { attributes: ['product_name', 'bom_no'] });
      const headerCode = item.item_code || subBom?.bom_no || `ASM-${item.sub_bom_id}`;
      const headerName = item.item_name || subBom?.product_name || 'Sub Assembly';
      out.push({ item_id: `ASM-${item.sub_bom_id}`, item_code: headerCode, item_name: headerName, item_description: item.remarks || headerName, product_description: headerName, group: 'Sub Assembly', make_buy: 'Make', is_purchase: false, is_stock: true, unit: '', level, parent_assembly: parentCode, is_subassembly_item: false, is_assembly_header: true, bom_qty: bomQty, effective_qty: Math.round(effective * 100) / 100, wastage_percent: wastage, total_need: Math.round(totalNeed * 100) / 100, current_stock: 0, short_qty: Math.round(totalNeed * 100) / 100, purchase_qty: 0, production_qty: Math.round(totalNeed * 100) / 100 });
      const sub = await buildPlanFromBOM(item.sub_bom_id, effective, level + 1, headerCode, visited);
      out.push(...sub);
    } else {
      if (!item.item_id) continue;
      const bomQty = Number(item.quantity || 0);
      const effective = bomQty * effMult;
      const wastage = Number(item.wastage_percent || 0);
      const totalNeed = effective * (1 + wastage / 100);
      const im = await ItemMaster.findByPk(item.item_id, { include: [{ model: db.ItemGroup, as: 'group' }, { model: db.Unit, as: 'unit' }] });
      if (!im) continue;
      const stock = Number(im.current_stock || 0);
      const short = Math.max(0, totalNeed - stock);
      out.push({ item_id: im.id, item_code: im.item_code, item_name: im.item_name, item_description: item.remarks || im.item_description || '', product_description: im.item_name, group: im.group?.name || '-', make_buy: im.make_buy, is_purchase: im.is_purchase_item, is_stock: im.is_stock_item, unit: im.unit?.short_name || im.unit?.name || '', level, parent_assembly: parentCode, is_subassembly_item: level > 0, bom_qty: bomQty, effective_qty: Math.round(effective * 100) / 100, wastage_percent: wastage, total_need: Math.round(totalNeed * 100) / 100, current_stock: stock, short_qty: Math.round(short * 100) / 100, purchase_qty: im.make_buy === 'Buy' ? Math.round(short * 100) / 100 : 0, production_qty: im.make_buy === 'Make' ? Math.round(short * 100) / 100 : 0 });
    }
  }
  visited.delete(bomId);
  return out;
}

exports.getOrderPlan = async (req, res) => {
  try {
    const { product_id, sales_order_id, qty, quantity } = req.query;
    const orderQty = Number(qty || quantity || 0);
    if (!orderQty || orderQty <= 0) return res.status(400).json({ error: 'qty is required (e.g. 100)' });
    let pid = product_id ? Number(product_id) : null;
    let salesOrder = null;
    if (sales_order_id) {
      salesOrder = await db.SalesOrder.findByPk(sales_order_id, { include: [{ model: db.SalesOrderItem, as: 'items' }] });
      if (!salesOrder) return res.status(404).json({ error: 'Sales order not found' });
      if (!pid && salesOrder.items && salesOrder.items.length) {
        const first = salesOrder.items[0];
        const desc = String(first.item_description || '').trim();
        let prod = null;
        if (desc) prod = await db.ProductMaster.findOne({ where: { product_code: desc } });
        if (!prod && desc) prod = await db.ProductMaster.findOne({ where: { part_name: desc } });
        if (!prod && first.item_description) {
          const im = await ItemMaster.findOne({ where: { item_name: desc } });
          if (im) prod = await db.ProductMaster.findOne({ where: { item_id: im.id } });
        }
        if (prod) pid = prod.id;
      }
    }
    if (!pid) return res.status(400).json({ error: 'product_id is required — select Product or Sales Order linked to a Product/BOM' });
    const product = await db.ProductMaster.findByPk(pid);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    let plan = [];
    let bomId = product.default_bom_id || null;
    let bom = null;
    if (bomId) bom = await BOM.findOne({ where: { id: bomId, status: 'Active' } });
    if (!bom) bom = await BOM.findOne({ where: { product_id: pid, status: 'Active' }, order: [['created_date', 'DESC'], ['id', 'DESC']] });
    if (bom) {
      bomId = bom.id;
      plan = await buildPlanFromBOM(bom.id, orderQty, 0, null, new Set());
    } else {
      const ProductItemMaster = db.ProductItemMaster;
      async function collectFlat(productId, qtyMultiplier, level = 0, parentCode = null, visited = new Set()) {
        if (visited.has(productId)) return [];
        visited.add(productId);
        const rows = await ProductItemMaster.findAll({ where: { product_id: productId }, order: [['serial_no', 'ASC'], ['id', 'ASC']] });
        const out = [];
        for (const r of rows) {
          const bomQty = Number(r.quantity || 0);
          const effectiveQty = bomQty * qtyMultiplier;
          const wastage = Number(r.wastage_percent || 0);
          if (r.component_product_id) {
            const compProd = await db.ProductMaster.findByPk(r.component_product_id);
            const compWithWastage = effectiveQty * (1 + wastage / 100);
            out.push({ item_id: `ASM-${r.component_product_id}`, item_code: r.item_code || compProd?.product_code || `ASM-${r.component_product_id}`, item_name: r.item_name || compProd?.part_name || 'Sub Assembly', item_description: r.item_description || compProd?.description || r.item_name || '', product_description: r.item_description || r.item_name || compProd?.description || '', group: 'Sub Assembly', make_buy: 'Make', is_purchase: false, is_stock: true, unit: 'Nos', level, parent_assembly: parentCode, is_subassembly_item: false, is_assembly_header: true, bom_qty: bomQty, effective_qty: Math.round(effectiveQty * 100) / 100, wastage_percent: wastage, total_need: Math.round(compWithWastage * 100) / 100, current_stock: 0, short_qty: Math.round(compWithWastage * 100) / 100, purchase_qty: 0, production_qty: Math.round(compWithWastage * 100) / 100 });
            const sub = await collectFlat(r.component_product_id, effectiveQty, level + 1, r.item_code || r.item_name, visited);
            if (sub.length) out.push(...sub);
            continue;
          }
          if (!r.item_id) continue;
          const im = await ItemMaster.findByPk(r.item_id, { include: [{ model: db.ItemGroup, as: 'group' }, { model: db.Unit, as: 'unit' }] });
          if (!im) continue;
          const withWastage = effectiveQty * (1 + wastage / 100);
          const stock = Number(im.current_stock || 0);
          const short = Math.max(0, withWastage - stock);
          out.push({ item_id: im.id, item_code: im.item_code, item_name: im.item_name, item_description: r.item_description || im.item_description || '', product_description: r.item_description || r.item_name || im.item_name, group: im.group?.name || '-', make_buy: im.make_buy, is_purchase: im.is_purchase_item, is_stock: im.is_stock_item, unit: im.unit?.short_name || im.unit?.name || '', level, parent_assembly: parentCode, is_subassembly_item: level > 0, bom_qty: bomQty, effective_qty: Math.round(effectiveQty * 100) / 100, wastage_percent: wastage, total_need: Math.round(withWastage * 100) / 100, current_stock: stock, short_qty: Math.round(short * 100) / 100, purchase_qty: im.make_buy === 'Buy' ? Math.round(short * 100) / 100 : 0, production_qty: im.make_buy === 'Make' ? Math.round(short * 100) / 100 : 0 });
        }
        visited.delete(productId);
        return out;
      }
      plan = await collectFlat(pid, orderQty, 0, null, new Set());
    }
    if (!plan.length) return res.status(400).json({ error: 'No BOM found for this product — create BOM in Engineering > Product Assembly Master or add components in Product Master > BOM Tree' });
    const summary = { product: { id: product.id, code: product.product_code, name: product.part_name, description: product.description || '' }, sales_order: salesOrder ? { id: salesOrder.id, order_no: salesOrder.order_no } : null, bom_id: bomId, order_qty: orderQty, total_items: plan.length, total_purchase: Math.round(plan.filter((p) => p.make_buy === 'Buy').reduce((a, b) => a + b.short_qty, 0) * 100) / 100, total_production: Math.round(plan.filter((p) => p.make_buy === 'Make').reduce((a, b) => a + b.short_qty, 0) * 100) / 100, source: bom ? 'BOM' : 'ProductItemMaster' };
    res.json({ summary, items: plan });
  } catch (err) {
    console.error('getOrderPlan', err);
    res.status(500).json({ error: 'Failed to build plan: ' + (err.message || '') });
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
