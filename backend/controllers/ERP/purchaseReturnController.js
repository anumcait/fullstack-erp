const db = require('../../models/ERP');
const { Op } = require('sequelize');
const { generateDocNumber } = require('../../utils/docNumber');
const { getStoresSettings } = require('../../utils/stockService');

const PurchaseReturn = db.PurchaseReturn;
const PurchaseReturnItem = db.PurchaseReturnItem;
const PurchaseOrder = db.PurchaseOrder;
const PurchaseOrderItem = db.PurchaseOrderItem;
const GRN = db.GRN;
const GRNItem = db.GRNItem;
const SupplierMaster = db.SupplierMaster;
const ItemMaster = db.ItemMaster;
const Warehouse = db.Warehouse;
const StockLedger = db.StockLedger;

function recalcReturn(header, items) {
  const computedItems = (items || []).map((it) => {
    const qty = parseFloat(it.quantity) || 0;
    const rate = parseFloat(it.rate) || 0;
    const amount = qty * rate;
    const discPercent = parseFloat(it.discount_percent) || 0;
    const discInr = parseFloat(it.discount_amount) || (amount * discPercent) / 100;
    const afterDisc = amount - discInr;
    const taxable = afterDisc;
    const cgstRate = parseFloat(it.cgst_rate) || 0;
    const sgstRate = parseFloat(it.sgst_rate) || 0;
    const igstRate = parseFloat(it.igst_rate) || 0;
    const cgstInr = (taxable * cgstRate) / 100;
    const sgstInr = (taxable * sgstRate) / 100;
    const igstInr = (taxable * igstRate) / 100;
    const totalGst = cgstInr + sgstInr + igstInr;
    const totalValue = taxable + totalGst;
    return {
      ...it,
      amount: amount.toFixed(2),
      discount_percent: discPercent.toFixed(2),
      discount_amount: discInr.toFixed(2),
      taxable_amount: taxable.toFixed(2),
      cgst_rate: cgstRate.toFixed(2),
      sgst_rate: sgstRate.toFixed(2),
      igst_rate: igstRate.toFixed(2),
      cgst_amount: cgstInr.toFixed(2),
      sgst_amount: sgstInr.toFixed(2),
      igst_amount: igstInr.toFixed(2),
      total_gst: totalGst.toFixed(2),
      amount_with_tax: totalValue.toFixed(2),
    };
  });

  const subtotal = computedItems.reduce((s, i) => s + parseFloat(i.amount), 0);
  const discount_amount = computedItems.reduce((s, i) => s + parseFloat(i.discount_amount), 0);
  const taxable_amount = computedItems.reduce((s, i) => s + parseFloat(i.taxable_amount), 0);
  const cgst_amount = computedItems.reduce((s, i) => s + parseFloat(i.cgst_amount), 0);
  const sgst_amount = computedItems.reduce((s, i) => s + parseFloat(i.sgst_amount), 0);
  const igst_amount = computedItems.reduce((s, i) => s + parseFloat(i.igst_amount), 0);
  const total_gst = cgst_amount + sgst_amount + igst_amount;
  const grand_total = taxable_amount + total_gst;

  return {
    header: {
      ...header,
      subtotal: subtotal.toFixed(2),
      discount_amount: discount_amount.toFixed(2),
      taxable_amount: taxable_amount.toFixed(2),
      cgst_amount: cgst_amount.toFixed(2),
      sgst_amount: sgst_amount.toFixed(2),
      igst_amount: igst_amount.toFixed(2),
      total_gst: total_gst.toFixed(2),
      grand_total: grand_total.toFixed(2),
    },
    items: computedItems,
  };
}

async function validateReturnQuantities(items, po_id, grn_id) {
  const errors = [];
  for (const item of items) {
    let maxReturnable = 0;
    if (grn_id && item.grn_item_id) {
      const grnItem = await GRNItem.findByPk(item.grn_item_id);
      if (grnItem) {
        const alreadyReturned = await PurchaseReturnItem.sum('quantity', {
          where: { grn_item_id: item.grn_item_id },
        }) || 0;
        maxReturnable = parseFloat(grnItem.quantity) - parseFloat(alreadyReturned);
      }
    } else if (po_id && item.po_item_id) {
      const poItem = await PurchaseOrderItem.findByPk(item.po_item_id);
      if (poItem) {
        const grnItems = await GRNItem.findAll({ where: { po_item_id: item.po_item_id } });
        const totalReceived = grnItems.reduce((sum, gi) => sum + parseFloat(gi.quantity), 0);
        const alreadyReturned = await PurchaseReturnItem.sum('quantity', {
          where: { po_item_id: item.po_item_id },
        }) || 0;
        maxReturnable = totalReceived - alreadyReturned;
      }
    }
    if (parseFloat(item.quantity) > maxReturnable + 0.01) {
      errors.push(`Item ${item.item_code || item.item_name}: Cannot return ${item.quantity}. Max returnable: ${maxReturnable.toFixed(2)}`);
    }
  }
  return errors;
}

async function updateStockOnReturn(returnDoc, items, transaction) {
  for (const item of items) {
    if (!item.item_id) continue;
    const qty = parseFloat(item.quantity);
    await StockLedger.create({
      item_id: item.item_id,
      warehouse_id: returnDoc.warehouse_id,
      tran_type: 'Purchase Return',
      tran_ref_id: returnDoc.id,
      tran_ref_no: returnDoc.return_no,
      tran_date: returnDoc.return_date,
      in_qty: 0,
      out_qty: qty,
      rate: item.rate,
      amount: item.amount_with_tax,
      batch_no: item.batch_no,
      serial_no: item.serial_no,
      remarks: `Purchase Return: ${returnDoc.return_no}`,
      created_by: returnDoc.prepared_by,
    }, { transaction });

    await ItemMaster.decrement('current_stock', {
      by: qty,
      where: { id: item.item_id },
      transaction,
    });
  }
}

async function reverseStockOnReturn(returnDoc, items, transaction) {
  for (const item of items) {
    if (!item.item_id) continue;
    const qty = parseFloat(item.quantity);
    await StockLedger.destroy({
      where: {
        tran_type: 'Purchase Return',
        tran_ref_id: returnDoc.id,
        item_id: item.item_id,
      },
      transaction,
    });
    await ItemMaster.increment('current_stock', {
      by: qty,
      where: { id: item.item_id },
      transaction,
    });
  }
}

exports.getPurchaseReturns = async (req, res) => {
  try {
    const { search, status, supplier_id, date_from, date_to, return_type } = req.query;
    const where = {};
    if (status) where.status = status;
    if (supplier_id) where.supplier_id = supplier_id;
    if (return_type) where.return_type = return_type;
    if (date_from || date_to) {
      const dateWhere = {};
      if (date_from) dateWhere[Op.gte] = date_from;
      if (date_to) dateWhere[Op.lte] = date_to;
      where.return_date = dateWhere;
    }
    if (search) {
      where[Op.or] = [
        { return_no: { [Op.iLike]: `%${search}%` } },
        { debit_note_no: { [Op.iLike]: `%${search}%` } },
        { '$supplier.supplier_name$': { [Op.iLike]: `%${search}%` } },
      ];
    }
    const returns = await PurchaseReturn.findAll({
      where,
      include: [
        { model: PurchaseReturnItem, as: 'items' },
        { model: SupplierMaster, as: 'supplier', attributes: ['id', 'supplier_code', 'supplier_name'] },
        { model: PurchaseOrder, as: 'purchaseOrder', attributes: ['id', 'po_no'] },
        { model: GRN, as: 'grn', attributes: ['id', 'ir_no'] },
        { model: Warehouse, as: 'warehouse', attributes: ['id', 'warehouse_code', 'warehouse_name'] },
      ],
      order: [['created_date', 'DESC']],
    });
    res.json(returns);
  } catch (err) {
    console.error('Error fetching Purchase Returns:', err);
    res.status(500).json({ error: 'Failed to fetch purchase returns' });
  }
};

exports.getPurchaseReturn = async (req, res) => {
  try {
    const returnDoc = await PurchaseReturn.findByPk(req.params.id, {
      include: [
        { model: PurchaseReturnItem, as: 'items' },
        { model: SupplierMaster, as: 'supplier' },
        { model: PurchaseOrder, as: 'purchaseOrder' },
        { model: GRN, as: 'grn' },
        { model: Warehouse, as: 'warehouse' },
      ],
    });
    if (!returnDoc) return res.status(404).json({ error: 'Purchase return not found' });
    res.json(returnDoc);
  } catch (err) {
    console.error('Error fetching Purchase Return:', err);
    res.status(500).json({ error: 'Failed to fetch purchase return' });
  }
};

exports.getNextReturnNumber = async (req, res) => {
  try {
    const settings = await getStoresSettings();
    if (settings?.auto_generate_return) {
      const nextNo = await generateDocNumber('PurchaseReturn', 'return_start_no', 'return_prefix', 'return_no', settings);
      res.json({ return_no: nextNo });
    } else {
      res.json({ return_no: '' });
    }
  } catch (err) {
    console.error('Error generating return number:', err);
    res.status(500).json({ error: 'Failed to generate return number' });
  }
};

exports.createPurchaseReturn = async (req, res) => {
  const transaction = await db.sequelize.transaction();
  try {
    let { items, ...header } = req.body;

    if (!header.supplier_id) return res.status(400).json({ error: 'Supplier is required' });
    if (!header.return_date) return res.status(400).json({ error: 'Return date is required' });
    if (!header.return_reason) return res.status(400).json({ error: 'Return reason is required' });
    if (!items || items.length === 0) return res.status(400).json({ error: 'At least one item is required' });

    const settings = await getStoresSettings();
    if (!header.return_no && settings?.auto_generate_return) {
      header.return_no = await generateDocNumber('PurchaseReturn', 'return_start_no', 'return_prefix', 'return_no', settings);
    }

    if (header.return_no) {
      const existing = await PurchaseReturn.findOne({ where: { return_no: header.return_no } });
      if (existing) return res.status(409).json({ error: `Return number '${header.return_no}' already exists` });
    }

    const validationErrors = await validateReturnQuantities(items, header.po_id, header.grn_id);
    if (validationErrors.length > 0) {
      await transaction.rollback();
      return res.status(400).json({ error: 'Validation failed', details: validationErrors });
    }

    const { header: recalcHeader, items: recalcItems } = recalcReturn(header, items);
    const returnDoc = await PurchaseReturn.create(recalcHeader, { transaction });

    if (recalcItems.length > 0) {
      const itemRows = recalcItems.map((it) => ({ ...it, return_id: returnDoc.id }));
      await PurchaseReturnItem.bulkCreate(itemRows, { transaction });
    }

    await transaction.commit();

    const result = await PurchaseReturn.findByPk(returnDoc.id, {
      include: [
        { model: PurchaseReturnItem, as: 'items' },
        { model: SupplierMaster, as: 'supplier' },
        { model: PurchaseOrder, as: 'purchaseOrder' },
        { model: GRN, as: 'grn' },
        { model: Warehouse, as: 'warehouse' },
      ],
    });
    res.status(201).json(result);
  } catch (err) {
    await transaction.rollback();
    console.error('Error creating Purchase Return:', err);
    res.status(500).json({ error: 'Failed to create purchase return' });
  }
};

exports.updatePurchaseReturn = async (req, res) => {
  const transaction = await db.sequelize.transaction();
  try {
    const { id } = req.params;
    const returnDoc = await PurchaseReturn.findByPk(id);
    if (!returnDoc) return res.status(404).json({ error: 'Purchase return not found' });

    if (!['Draft', 'Submitted'].includes(returnDoc.status)) {
      return res.status(400).json({ error: 'Only Draft/Submitted returns can be updated' });
    }

    const { items, ...header } = req.body;

    const validationErrors = await validateReturnQuantities(items, header.po_id, header.grn_id);
    if (validationErrors.length > 0) {
      await transaction.rollback();
      return res.status(400).json({ error: 'Validation failed', details: validationErrors });
    }

    const { header: recalcHeader, items: recalcItems } = recalcReturn(header, items);
    await returnDoc.update(recalcHeader, { transaction });

    if (recalcItems.length) {
      await PurchaseReturnItem.destroy({ where: { return_id: id }, transaction });
      const itemRows = recalcItems.map((it) => ({ ...it, return_id: id }));
      await PurchaseReturnItem.bulkCreate(itemRows, { transaction });
    }

    await transaction.commit();

    const result = await PurchaseReturn.findByPk(id, {
      include: [
        { model: PurchaseReturnItem, as: 'items' },
        { model: SupplierMaster, as: 'supplier' },
        { model: PurchaseOrder, as: 'purchaseOrder' },
        { model: GRN, as: 'grn' },
        { model: Warehouse, as: 'warehouse' },
      ],
    });
    res.json(result);
  } catch (err) {
    await transaction.rollback();
    console.error('Error updating Purchase Return:', err);
    res.status(500).json({ error: 'Failed to update purchase return' });
  }
};

exports.submitPurchaseReturn = async (req, res) => {
  const transaction = await db.sequelize.transaction();
  try {
    const { id } = req.params;
    const returnDoc = await PurchaseReturn.findByPk(id);
    if (!returnDoc) return res.status(404).json({ error: 'Purchase return not found' });
    if (returnDoc.status !== 'Draft') {
      return res.status(400).json({ error: 'Only Draft returns can be submitted' });
    }
    await returnDoc.update({ status: 'Submitted' }, { transaction });
    await transaction.commit();
    res.json(returnDoc);
  } catch (err) {
    await transaction.rollback();
    console.error('Error submitting Purchase Return:', err);
    res.status(500).json({ error: 'Failed to submit purchase return' });
  }
};

exports.approvePurchaseReturn = async (req, res) => {
  const transaction = await db.sequelize.transaction();
  try {
    const { id } = req.params;
    const { approved_by, notes } = req.body;
    const returnDoc = await PurchaseReturn.findByPk(id, {
      include: [{ model: PurchaseReturnItem, as: 'items' }],
    });
    if (!returnDoc) return res.status(404).json({ error: 'Purchase return not found' });
    if (!['Draft', 'Submitted'].includes(returnDoc.status)) {
      return res.status(400).json({ error: 'Only Draft/Submitted returns can be approved' });
    }

    await returnDoc.update({
      status: 'Approved',
      approved_by: approved_by || 'System',
      approved_date: new Date(),
      notes: notes || returnDoc.notes,
    }, { transaction });

    await updateStockOnReturn(returnDoc, returnDoc.items, transaction);

    await transaction.commit();

    const result = await PurchaseReturn.findByPk(id, {
      include: [
        { model: PurchaseReturnItem, as: 'items' },
        { model: SupplierMaster, as: 'supplier' },
        { model: PurchaseOrder, as: 'purchaseOrder' },
        { model: GRN, as: 'grn' },
        { model: Warehouse, as: 'warehouse' },
      ],
    });
    res.json(result);
  } catch (err) {
    await transaction.rollback();
    console.error('Error approving Purchase Return:', err);
    res.status(500).json({ error: 'Failed to approve purchase return' });
  }
};

exports.rejectPurchaseReturn = async (req, res) => {
  try {
    const { id } = req.params;
    const { rejected_by, rejection_reason } = req.body;
    const returnDoc = await PurchaseReturn.findByPk(id);
    if (!returnDoc) return res.status(404).json({ error: 'Purchase return not found' });
    if (!['Draft', 'Submitted'].includes(returnDoc.status)) {
      return res.status(400).json({ error: 'Only Draft/Submitted returns can be rejected' });
    }
    await returnDoc.update({
      status: 'Rejected',
      rejected_by: rejected_by || 'System',
      rejected_date: new Date(),
      rejection_reason,
    });
    res.json(returnDoc);
  } catch (err) {
    console.error('Error rejecting Purchase Return:', err);
    res.status(500).json({ error: 'Failed to reject purchase return' });
  }
};

exports.cancelPurchaseReturn = async (req, res) => {
  const transaction = await db.sequelize.transaction();
  try {
    const { id } = req.params;
    const returnDoc = await PurchaseReturn.findByPk(id, {
      include: [{ model: PurchaseReturnItem, as: 'items' }],
    });
    if (!returnDoc) return res.status(404).json({ error: 'Purchase return not found' });
    if (returnDoc.status === 'Completed') {
      return res.status(400).json({ error: 'Completed returns cannot be cancelled' });
    }

    if (returnDoc.status === 'Approved') {
      await reverseStockOnReturn(returnDoc, returnDoc.items, transaction);
    }

    await returnDoc.update({ status: 'Cancelled' }, { transaction });
    await transaction.commit();
    res.json(returnDoc);
  } catch (err) {
    await transaction.rollback();
    console.error('Error cancelling Purchase Return:', err);
    res.status(500).json({ error: 'Failed to cancel purchase return' });
  }
};

exports.deletePurchaseReturn = async (req, res) => {
  const transaction = await db.sequelize.transaction();
  try {
    const { id } = req.params;
    const returnDoc = await PurchaseReturn.findByPk(id);
    if (!returnDoc) return res.status(404).json({ error: 'Purchase return not found' });
    if (!['Draft', 'Cancelled'].includes(returnDoc.status)) {
      return res.status(400).json({ error: 'Only Draft/Cancelled returns can be deleted' });
    }
    await PurchaseReturnItem.destroy({ where: { return_id: id }, transaction });
    await returnDoc.destroy({ transaction });
    await transaction.commit();
    res.json({ message: 'Purchase return deleted' });
  } catch (err) {
    await transaction.rollback();
    console.error('Error deleting Purchase Return:', err);
    res.status(500).json({ error: 'Failed to delete purchase return' });
  }
};

exports.getReturnableItems = async (req, res) => {
  try {
    const { po_id, grn_id, supplier_id } = req.query;
    if (!po_id && !grn_id) {
      return res.status(400).json({ error: 'PO ID or GRN ID is required' });
    }

    let items = [];
    if (grn_id) {
      const grn = await GRN.findByPk(grn_id, {
        include: [
          { model: GRNItem, as: 'items', include: [{ model: ItemMaster, as: 'item' }] },
        ],
      });
      if (!grn) return res.status(404).json({ error: 'GRN not found' });
      items = grn.items;
    } else {
      const po = await PurchaseOrder.findByPk(po_id, {
        include: [
          { model: PurchaseOrderItem, as: 'items', include: [{ model: ItemMaster, as: 'item' }] },
        ],
      });
      if (!po) return res.status(404).json({ error: 'PO not found' });
      const grns = await GRN.findAll({ where: { po_id } });
      const grnItems = await GRNItem.findAll({
        where: { po_item_id: { [Op.in]: po.items.map(i => i.id) } },
        include: [{ model: ItemMaster, as: 'item' }],
      });
      items = po.items.map(poItem => {
        const received = grnItems
          .filter(gi => gi.po_item_id === poItem.id)
          .reduce((sum, gi) => sum + parseFloat(gi.quantity), 0);
        const returned = poItem.PurchaseReturnItems?.reduce((sum, ri) => sum + parseFloat(ri.quantity), 0) || 0;
        return {
          ...poItem.toJSON(),
          received_qty: received,
          returned_qty: returned,
          pending_qty: Math.max(0, received - returned),
        };
      });
    }

    const result = items.map(item => {
      const itemData = item.item || item;
      return {
        item_id: itemData.id,
        item_code: itemData.item_code,
        item_name: itemData.item_name,
        hsn_code: itemData.hsn_code,
        gst_rate: itemData.gst_rate,
        unit_id: itemData.unit_id,
        po_item_id: item.id,
        grn_item_id: item.id,
        quantity: item.pending_qty || item.quantity,
        rate: item.rate || itemData.last_purchase_cost || 0,
        received_qty: item.received_qty,
        returned_qty: item.returned_qty,
        pending_qty: item.pending_qty,
      };
    }).filter(i => i.pending_qty > 0);

    res.json(result);
  } catch (err) {
    console.error('Error fetching returnable items:', err);
    res.status(500).json({ error: 'Failed to fetch returnable items' });
  }
};

exports.getPendingReturnsForSupplier = async (req, res) => {
  try {
    const { supplier_id } = req.query;
    if (!supplier_id) return res.status(400).json({ error: 'Supplier ID required' });

    const returns = await PurchaseReturn.findAll({
      where: {
        supplier_id,
        status: { [Op.in]: ['Draft', 'Submitted', 'Approved'] },
      },
      include: [{ model: PurchaseReturnItem, as: 'items' }],
      order: [['return_date', 'DESC']],
    });
    res.json(returns);
  } catch (err) {
    console.error('Error fetching pending returns:', err);
    res.status(500).json({ error: 'Failed to fetch pending returns' });
  }
};