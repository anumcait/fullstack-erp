const db = require('../../models/ERP');
const { Op } = require('sequelize');
const { generateDocNumber } = require('../../utils/docNumber');

const PurchaseOrder = db.PurchaseOrder;
const PurchaseOrderItem = db.PurchaseOrderItem;
const SupplierMaster = db.SupplierMaster;
const PurchaseSettings = db.PurchaseSettings;

exports.getPurchaseOrders = async (req, res) => {
  try {
    const { search, status, supplier_id, date_from, date_to, year } = req.query;
    const where = {};
    if (status) where.status = status;
    if (supplier_id) where.supplier_id = supplier_id;
    if (date_from || date_to || year) {
      const dateWhere = {};
      if (date_from) dateWhere[Op.gte] = date_from;
      if (date_to) dateWhere[Op.lte] = date_to;
      if (year) {
        dateWhere[Op.gte] = `${year}-01-01`;
        dateWhere[Op.lte] = `${year}-12-31`;
      }
      where.po_date = dateWhere;
    }
    if (search) {
      where[Op.or] = [
        { po_no: { [Op.iLike]: `%${search}%` } },
        { '$supplier.supplier_name$': { [Op.iLike]: `%${search}%` } },
      ];
    }
    const orders = await PurchaseOrder.findAll({
      where,
      include: [
        { model: PurchaseOrderItem, as: 'items' },
        { model: SupplierMaster, as: 'supplier', attributes: ['id', 'supplier_code', 'supplier_name'] },
      ],
      order: [['created_date', 'DESC']],
    });
    res.json(orders);
  } catch (err) {
    console.error('Error fetching POs:', err);
    res.status(500).json({ error: 'Failed to fetch purchase orders' });
  }
};

exports.getPurchaseOrder = async (req, res) => {
  try {
    const order = await PurchaseOrder.findByPk(req.params.id, {
      include: [
        { model: PurchaseOrderItem, as: 'items' },
        { model: SupplierMaster, as: 'supplier' },
      ],
    });
    if (!order) return res.status(404).json({ error: 'Purchase order not found' });
    res.json(order);
  } catch (err) {
    console.error('Error fetching PO:', err);
    res.status(500).json({ error: 'Failed to fetch purchase order' });
  }
};

function recalcPO(header, items) {
  const computedItems = (items || []).map((it) => {
    const qty = parseFloat(it.quantity) || 0;
    const rate = parseFloat(it.rate) || 0;
    const amount = qty * rate;
    const discPercent = parseFloat(it.disc_percent) || 0;
    const discInr = parseFloat(it.disc_inr) || (amount * discPercent) / 100;
    const afterDisc = amount - discInr;
    const pfPercent = parseFloat(it.pf_percent) || 0;
    const pfInr = (afterDisc * pfPercent) / 100;
    const taxable = afterDisc + pfInr;
    const sgstRate = parseFloat(it.sgst_rate) || 0;
    const cgstRate = parseFloat(it.cgst_rate) || 0;
    const igstRate = parseFloat(it.igst_rate) || 0;
    const sgstInr = (taxable * sgstRate) / 100;
    const cgstInr = (taxable * cgstRate) / 100;
    const igstInr = (taxable * igstRate) / 100;
    const totalValue = taxable + sgstInr + cgstInr + igstInr;
    return { ...it, amount, disc_percent: discPercent, disc_inr: discInr, after_disc: afterDisc,
             pf_inr: pfInr, taxable_value: taxable, sgst_inr: sgstInr, cgst_inr: cgstInr,
             igst_inr: igstInr, total_value: totalValue };
  });
  const subtotal = computedItems.reduce((s, i) => s + (parseFloat(i.amount) || 0), 0);
  const discAmt = computedItems.reduce((s, i) => s + (parseFloat(i.disc_inr) || 0), 0);
  const pfAmt = computedItems.reduce((s, i) => s + (parseFloat(i.pf_inr) || 0), 0);
  const sgstAmt = computedItems.reduce((s, i) => s + (parseFloat(i.sgst_inr) || 0), 0);
  const cgstAmt = computedItems.reduce((s, i) => s + (parseFloat(i.cgst_inr) || 0), 0);
  const igstAmt = computedItems.reduce((s, i) => s + (parseFloat(i.igst_inr) || 0), 0);
  return {
    header: {
      ...header,
      subtotal: subtotal.toFixed(2),
      discount_amount: discAmt.toFixed(2),
      pf_amount: pfAmt.toFixed(2),
      sgst_amount: sgstAmt.toFixed(2),
      cgst_amount: cgstAmt.toFixed(2),
      igst_amount: igstAmt.toFixed(2),
      tax_amount: (sgstAmt + cgstAmt + igstAmt).toFixed(2),
      grand_total: computedItems.reduce((s, i) => s + (parseFloat(i.total_value) || 0), 0).toFixed(2),
    },
    items: computedItems,
  };
}

exports.createPurchaseOrder = async (req, res) => {
  try {
    let { items, ...header } = req.body;

    // Auto-generate PO number if not provided or auto-generation is enabled
    if (!header.po_no) {
      const settings = await PurchaseSettings.findByPk(1);
      if (settings?.auto_generate_po) {
        header.po_no = await generateDocNumber('PurchaseOrder', 'po_prefix', 'po_no', settings);
      } else {
        return res.status(400).json({ error: 'PO number is required. Enable auto-generation in Settings.' });
      }
    }

    if (!header.supplier_id) return res.status(400).json({ error: 'Supplier is required' });

    const existing = await PurchaseOrder.findOne({ where: { po_no: header.po_no } });
    if (existing) return res.status(409).json({ error: `PO '${header.po_no}' already exists` });

    const { header: recalcHeader, items: recalcItems } = recalcPO(header, items);
    const order = await PurchaseOrder.create(recalcHeader);
    if (recalcItems.length > 0) {
      const itemRows = recalcItems.map((it) => ({ ...it, po_id: order.id }));
      await PurchaseOrderItem.bulkCreate(itemRows);
    }
    const result = await PurchaseOrder.findByPk(order.id, {
      include: [
        { model: PurchaseOrderItem, as: 'items' },
        { model: SupplierMaster, as: 'supplier' },
      ],
    });
    res.status(201).json(result);
  } catch (err) {
    console.error('Error creating PO:', err);
    res.status(500).json({ error: 'Failed to create purchase order' });
  }
};

exports.updatePurchaseOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await PurchaseOrder.findByPk(id);
    if (!order) return res.status(404).json({ error: 'Purchase order not found' });

    const { items, ...header } = req.body;
    const { header: recalcHeader, items: recalcItems } = recalcPO(header, items);
    await order.update(recalcHeader);

    if (recalcItems.length) {
      await PurchaseOrderItem.destroy({ where: { po_id: id } });
      const itemRows = recalcItems.map((it) => ({ ...it, po_id: id }));
      await PurchaseOrderItem.bulkCreate(itemRows);
    }

    const result = await PurchaseOrder.findByPk(id, {
      include: [
        { model: PurchaseOrderItem, as: 'items' },
        { model: SupplierMaster, as: 'supplier' },
      ],
    });
    res.json(result);
  } catch (err) {
    console.error('Error updating PO:', err);
    res.status(500).json({ error: 'Failed to update purchase order' });
  }
};

exports.approvePurchaseOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, approved_by, notes } = req.body;
    const order = await PurchaseOrder.findByPk(id);
    if (!order) return res.status(404).json({ error: 'Purchase order not found' });

    await order.update({
      status: status || 'Approved',
      approved_by: approved_by || 'System',
      approved_date: new Date(),
      notes: notes || order.notes,
    });
    res.json(order);
  } catch (err) {
    console.error('Error approving PO:', err);
    res.status(500).json({ error: 'Failed to approve purchase order' });
  }
};

exports.recalculatePO = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await PurchaseOrder.findByPk(id);
    if (!order) return res.status(404).json({ error: 'Purchase order not found' });

    const items = await PurchaseOrderItem.findAll({ where: { po_id: id }, raw: true });
    const { header: recalcHeader, items: recalcItems } = recalcPO(order.toJSON(), items);
    await order.update({
      subtotal: recalcHeader.subtotal,
      discount_amount: recalcHeader.discount_amount,
      pf_amount: recalcHeader.pf_amount,
      sgst_amount: recalcHeader.sgst_amount,
      cgst_amount: recalcHeader.cgst_amount,
      igst_amount: recalcHeader.igst_amount,
      tax_amount: recalcHeader.tax_amount,
      grand_total: recalcHeader.grand_total,
    });

    for (const item of recalcItems) {
      await PurchaseOrderItem.update(
        {
          amount: item.amount,
          disc_percent: item.disc_percent,
          disc_inr: item.disc_inr,
          after_disc: item.after_disc,
          pf_inr: item.pf_inr,
          taxable_value: item.taxable_value,
          sgst_inr: item.sgst_inr,
          cgst_inr: item.cgst_inr,
          igst_inr: item.igst_inr,
          total_value: item.total_value,
        },
        { where: { id: item.id } }
      );
    }

    const updated = await PurchaseOrder.findByPk(order.id, {
      include: [{ model: PurchaseOrderItem, as: 'items' }],
    });
    res.json(updated);
  } catch (err) {
    console.error('Error recalculating PO:', err);
    res.status(500).json({ error: 'Failed to recalculate PO' });
  }
};

exports.deletePurchaseOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await PurchaseOrder.findByPk(id);
    if (!order) return res.status(404).json({ error: 'Purchase order not found' });
    if (order.status !== 'Draft') {
      return res.status(400).json({ error: 'Only draft POs can be deleted' });
    }
    await PurchaseOrderItem.destroy({ where: { po_id: id } });
    await order.destroy();
    res.json({ message: 'Purchase order deleted' });
  } catch (err) {
    console.error('Error deleting PO:', err);
    res.status(500).json({ error: 'Failed to delete purchase order' });
  }
};

// ── Fetch terms & conditions from an old PO by PO number ──────────────
exports.getPOTermsByPoNo = async (req, res) => {
  try {
    const { po_no } = req.params;
    const order = await PurchaseOrder.findOne({
      where: { po_no },
      attributes: [
        'old_po_no', 'old_po_year', 'subject', 'reference', 'qtn_no', 'ref_date',
        'qca_req', 'any_other_terms', 'delivery_period', 'payment_terms', 'delivery_terms',
        'desp_to', 'insurance', 'rem1', 'rem2', 'rem3', 'inspection', 'freight',
        'freight_forward', 'currency_val', 'req_yn', 'ven_code', 'notes',
      ],
    });
    if (!order) return res.status(404).json({ error: 'Purchase order not found' });
    res.json(order);
  } catch (err) {
    console.error('Error fetching PO terms:', err);
    res.status(500).json({ error: 'Failed to fetch PO terms' });
  }
};
