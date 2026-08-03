const db = require('../../models/ERP');
const { Op } = require('sequelize');
const { generateDocNumber } = require('../../utils/docNumber');
const { postMovement, reverseMovements, getDefaultWarehouse, REF_TYPES } = require('../../utils/stockService');

const GRN = db.GRN;
const GRNItem = db.GRNItem;
const PurchaseOrder = db.PurchaseOrder;
const PurchaseOrderItem = db.PurchaseOrderItem;
const PurchaseRequisition = db.PurchaseRequisition;
const SupplierMaster = db.SupplierMaster;
const PurchaseSettings = db.PurchaseSettings;
const ItemMaster = db.ItemMaster;

// Post purchase cost (moving average) and receipt into stock for a GRN.
// Runs once per GRN (guarded by cost_posted) so it is safe to call on both
// GRN entry and later GRN billing without double-counting.
async function postGRNCost(grnId, user) {
  const t = await db.sequelize.transaction();
  try {
    const grn = await GRN.findByPk(grnId, { include: [{ model: GRNItem, as: 'items' }], transaction: t });
    if (!grn || grn.cost_posted) {
      await t.rollback();
      return;
    }
    const wh = await getDefaultWarehouse();
    for (const it of grn.items) {
      if (!it.item_id || !(Number(it.accepted_qty) > 0)) continue;
      const item = await ItemMaster.findByPk(it.item_id, { transaction: t });
      if (!item) continue;
      const stock = Number(item.current_stock || 0);
      const oldRate = Number(item.rate || 0);
      const qty = Number(it.accepted_qty);
      const newRate = Number(it.rate);
      const totalStock = stock + qty;
      const avg = totalStock > 0 ? (stock * oldRate + qty * newRate) / totalStock : newRate;
      await item.update({ rate: Number(avg.toFixed(2)) }, { transaction: t });
      await postMovement(
        {
          item_id: it.item_id,
          warehouse_id: wh?.id || null,
          ledger_date: grn.ir_date || new Date(),
          ref_type: REF_TYPES.PURCHASE,
          doc_no: grn.ir_no,
          ref_no: grn.ir_no,
          reference: grn.invoice_no || null,
          qty_in: qty,
          qty_out: 0,
          unit_cost: newRate,
          remarks: it.remarks || `GRR ${grn.ir_no}`,
          user,
        },
        t
      );
    }
    await grn.update({ cost_posted: true }, { transaction: t });
    await t.commit();
  } catch (err) {
    await t.rollback();
    throw err;
  }
}

exports.getGRNs = async (req, res) => {
  try {
    const { search, status, po_id, supplier_id, date_from, date_to, year } = req.query;
    const where = {};
    if (status) where.status = status;
    if (po_id) where.po_id = po_id;
    if (supplier_id) where.supplier_id = supplier_id;
    if (date_from || date_to || year) {
      const dateWhere = {};
      if (date_from) dateWhere[Op.gte] = date_from;
      if (date_to) dateWhere[Op.lte] = date_to;
      if (year) {
        dateWhere[Op.gte] = `${year}-01-01`;
        dateWhere[Op.lte] = `${year}-12-31`;
      }
      where.ir_date = dateWhere;
    }
    if (search) {
      where[Op.or] = [
        { ir_no: { [Op.iLike]: `%${search}%` } },
        { invoice_no: { [Op.iLike]: `%${search}%` } },
      ];
    }
    const grns = await GRN.findAll({
      where,
      include: [
        { model: GRNItem, as: 'items' },
        { model: PurchaseOrder, as: 'purchaseOrder', attributes: ['id', 'po_no', 'po_date'] },
        { model: PurchaseRequisition, as: 'purchaseRequisition', attributes: ['id', 'req_no', 'req_date'] },
        { model: SupplierMaster, as: 'supplier', attributes: ['id', 'supplier_code', 'supplier_name'] },
      ],
      order: [['created_date', 'DESC']],
    });
    res.json(grns);
  } catch (err) {
    console.error('Error fetching GRNs:', err);
    res.status(500).json({ error: 'Failed to fetch GRNs' });
  }
};

exports.getNextGRNNumber = async (req, res) => {
  try {
    const count = await GRN.count();
    const nextNumber = String(count + 1);
    res.json({ ir_no: nextNumber, sequence: count + 1 });
  } catch (err) {
    console.error('Error getting next GRN number:', err);
    res.status(500).json({ error: 'Failed to get next GRN number' });
  }
};

exports.getGRN = async (req, res) => {
  try {
    const grn = await GRN.findByPk(req.params.id, {
      include: [
        { model: GRNItem, as: 'items' },
        { model: PurchaseOrder, as: 'purchaseOrder' },
        { model: PurchaseRequisition, as: 'purchaseRequisition' },
        { model: SupplierMaster, as: 'supplier' },
      ],
    });
    if (!grn) return res.status(404).json({ error: 'GRN not found' });
    res.json(grn);
  } catch (err) {
    console.error('Error fetching GRN:', err);
    res.status(500).json({ error: 'Failed to fetch GRN' });
  }
};

exports.createGRN = async (req, res) => {
  try {
    let { items, ...header } = req.body;

    // Empty strings for nullable date fields → null
    for (const field of ['approved_date', 'qa_date', 'bill_date', 'invoice_date']) {
      if (header[field] === '') header[field] = null;
    }

    if (!header.ir_no) {
      const settings = await PurchaseSettings.findByPk(1);
      if (settings?.auto_generate_grn) {
        header.ir_no = await generateDocNumber('GRN', 'grn_prefix', 'ir_no', settings);
      } else {
        return res.status(400).json({ error: 'GRN number is required. Enable auto-generation in Settings.' });
      }
    }

    const existing = await GRN.findOne({ where: { ir_no: header.ir_no } });
    if (existing) return res.status(409).json({ error: `GRN '${header.ir_no}' already exists` });

    // Default to Draft unless explicitly submitted
    if (!header.status || header.status === 'Received') {
      header.status = 'Draft';
    }

    const grn = await GRN.create(header);
    if (items && items.length > 0) {
      const itemRows = items.map((it) => ({ ...it, grn_id: grn.id }));
      await GRNItem.bulkCreate(itemRows);

      // Update PO item received quantities only when status is Received
      if (header.status !== 'Draft') {
        for (const it of items) {
          if (it.po_item_id) {
            const poItem = await PurchaseOrderItem.findByPk(it.po_item_id);
            if (poItem) {
              const newReceived = parseFloat(poItem.received_quantity || 0) + parseFloat(it.accepted_qty || 0);
              await poItem.update({ received_quantity: newReceived });
            }
          }
        }
      }
    }

    const result = await GRN.findByPk(grn.id, {
      include: [
        { model: GRNItem, as: 'items' },
        { model: PurchaseOrder, as: 'purchaseOrder', attributes: ['id', 'po_no'] },
        { model: PurchaseRequisition, as: 'purchaseRequisition', attributes: ['id', 'req_no'] },
        { model: SupplierMaster, as: 'supplier', attributes: ['id', 'supplier_code', 'supplier_name'] },
      ],
    });
    // Only post cost when status is not Draft
    if (header.status !== 'Draft') await postGRNCost(grn.id, req.session?.user?.name || 'System');
    res.status(201).json(result);
  } catch (err) {
    console.error('Error creating GRN:', err);
    res.status(500).json({ error: 'Failed to create GRN' });
  }
};

exports.updateGRN = async (req, res) => {
  try {
    const { id } = req.params;
    const grn = await GRN.findByPk(id, {
      include: [{ model: GRNItem, as: 'items' }],
    });
    if (!grn) return res.status(404).json({ error: 'GRN not found' });
    if (grn.status !== 'Draft') return res.status(400).json({ error: 'Only draft GRNs can be edited' });

    const { items, ...header } = req.body;
    for (const field of ['approved_date', 'qa_date', 'bill_date', 'invoice_date']) {
      if (header[field] === '') header[field] = null;
    }
    const wasDraft = grn.status === 'Draft';
    const becomingReceived = header.status === 'Received';

    await grn.update(header);

    if (items) {
      // Reverse old PO item received quantities
      if (grn.items) {
        for (const oldIt of grn.items) {
          if (oldIt.po_item_id) {
            const poItem = await PurchaseOrderItem.findByPk(oldIt.po_item_id);
            if (poItem) {
              const newReceived = Math.max(0, parseFloat(poItem.received_quantity || 0) - parseFloat(oldIt.accepted_qty || 0));
              await poItem.update({ received_quantity: newReceived });
            }
          }
        }
      }

      await GRNItem.destroy({ where: { grn_id: id } });
      const itemRows = items.map((it) => ({ ...it, grn_id: id }));
      await GRNItem.bulkCreate(itemRows);

      // Apply new PO item received quantities (only when becoming Received)
      if (becomingReceived) {
        for (const it of items) {
          if (it.po_item_id) {
            const poItem = await PurchaseOrderItem.findByPk(it.po_item_id);
            if (poItem) {
              const newReceived = parseFloat(poItem.received_quantity || 0) + parseFloat(it.accepted_qty || 0);
              await poItem.update({ received_quantity: newReceived });
            }
          }
        }
      }
    }

    const result = await GRN.findByPk(id, {
      include: [
        { model: GRNItem, as: 'items' },
        { model: PurchaseOrder, as: 'purchaseOrder' },
        { model: PurchaseRequisition, as: 'purchaseRequisition' },
        { model: SupplierMaster, as: 'supplier' },
      ],
    });
    // Post cost when becoming Received and not already posted
    if (becomingReceived && !grn.cost_posted) {
      await postGRNCost(id, req.session?.user?.name || 'System');
    }
    res.json(result);
  } catch (err) {
    console.error('Error updating GRN:', err);
    res.status(500).json({ error: 'Failed to update GRN' });
  }
};

exports.approveGRN = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, approved_by, remarks } = req.body;
    const grn = await GRN.findByPk(id);
    if (!grn) return res.status(404).json({ error: 'GRN not found' });
    const updates = {
      approval_status: 'Approved',
      approved_by: approved_by || req.session?.user?.name || 'System',
      approved_date: new Date(),
      approval_remarks: remarks || grn.approval_remarks,
    };
    // Also update the GRN status if provided (e.g. "Received")
    if (status) updates.status = status;
    await grn.update(updates);
    // Post cost on approval if not already posted
    if (!grn.cost_posted) {
      await postGRNCost(id, req.session?.user?.name || 'System');
    }
    res.json(grn);
  } catch (err) {
    console.error('Error approving GRN:', err);
    res.status(500).json({ error: 'Failed to approve GRN' });
  }
};

exports.getPendingBilling = async (req, res) => {
  try {
    const data = await GRN.findAll({
      where: {
        bill_no: { [Op.is]: null },
        status: 'Received',
        ir_type: 'GRR',
      },
      include: [
        { model: GRNItem, as: 'items' },
        { model: SupplierMaster, as: 'supplier', attributes: ['id', 'supplier_code', 'supplier_name', 'gstin'] },
        {
          model: PurchaseOrder, as: 'purchaseOrder',
          attributes: ['id', 'po_no', 'po_date'],
          include: [{ model: PurchaseOrderItem, as: 'items' }],
        },
        { model: PurchaseRequisition, as: 'purchaseRequisition', attributes: ['id', 'req_no', 'req_date'] },
      ],
      order: [['ir_no', 'ASC']],
    });
    res.json(data);
  } catch (err) {
    console.error('Error fetching pending billing:', err);
    res.status(500).json({ error: 'Failed to fetch pending billing' });
  }
};

exports.markGRRBilled = async (req, res) => {
  try {
    const doc = await GRN.findByPk(req.params.id, {
      include: [{ model: GRNItem, as: 'items' }],
    });
    if (!doc) return res.status(404).json({ error: 'Not found' });
    if (doc.bill_no) return res.status(400).json({ error: 'Already billed' });

    const { bill_no, bill_date, invoice_no, invoice_date, remarks, items } = req.body;
    if (!bill_no) return res.status(400).json({ error: 'Bill number required' });
    if (!bill_date) return res.status(400).json({ error: 'Bill date required' });

    await doc.update({
      invoice_no: invoice_no || doc.invoice_no,
      invoice_date: invoice_date || doc.invoice_date,
      bill_no,
      bill_date,
      notes: remarks ? `${doc.notes || ''} | Billing: ${remarks}`.trim() : doc.notes,
    });

    if (items && items.length > 0) {
      for (const it of items) {
        if (it.id) {
          await GRNItem.update(
            {
              rate: it.rate,
              gst_rate: it.gst_rate,
              gst_amount: it.gst_amount,
              amount: it.amount,
            },
            { where: { id: it.id, grn_id: doc.id } }
          );
        }
      }
    }

    const result = await GRN.findByPk(doc.id, {
      include: [
        { model: GRNItem, as: 'items' },
        { model: SupplierMaster, as: 'supplier', attributes: ['id', 'supplier_code', 'supplier_name', 'gstin'] },
      ],
    });
    res.json(result);
  } catch (err) {
    console.error('Error marking GRR billed:', err);
    res.status(500).json({ error: 'Failed to mark billed' });
  }
};

exports.batchMarkGRRBilled = async (req, res) => {
  try {
    const { ids, bill_no, bill_date, invoice_no, invoice_date, remarks } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) return res.status(400).json({ error: 'GRR IDs required' });
    if (!bill_no) return res.status(400).json({ error: 'Bill number required' });
    if (!bill_date) return res.status(400).json({ error: 'Bill date required' });

    const docs = await GRN.findAll({ where: { id: ids } });
    if (docs.length !== ids.length) return res.status(404).json({ error: 'One or more GRRs not found' });

    const alreadyBilled = docs.filter(function (d) { return d.bill_no; });
    if (alreadyBilled.length > 0) return res.status(400).json({ error: 'GRR(s) already billed: ' + alreadyBilled.map(function (d) { return d.ir_no; }).join(', ') });

    const r2 = function (v) { return Number(Number(v || 0).toFixed(2)); };
    for (const doc of docs) {
      await doc.update({
        invoice_no: invoice_no || doc.invoice_no,
        invoice_date: invoice_date || doc.invoice_date,
        bill_no: bill_no,
        bill_date: bill_date,
        notes: remarks ? (doc.notes || '') + ' | Billing: ' + remarks : doc.notes,
      });
    }

    var items = req.body.items;
    if (items && items.length > 0) {
      for (const it of items) {
        if (!it.id) continue;
        var qty = Number(it.accepted_qty || 0);
        var rate = Number(it.rate || 0);
        var gross = r2(qty * rate);
        var discInr = Number(it.discount_inr || 0);
        var discPct = Number(it.discount_percent || 0);
        var discAmt = discInr > 0 ? discInr : r2(gross * discPct / 100);
        var afterDisc = r2(gross - discAmt);
        var pfInr = Number(it.pf_inr || 0);
        var pfPct = Number(it.pf_percent || 0);
        var pfAmt = pfInr > 0 ? pfInr : r2(afterDisc * pfPct / 100);
        var taxable = r2(afterDisc + pfAmt);
        var cgstRate = Number(it.cgst_rate || 0);
        var sgstRate = Number(it.sgst_rate || 0);
        var igstRate = Number(it.igst_rate || 0);
        var gstAmt = r2(taxable * (cgstRate + sgstRate + igstRate) / 100);
        var total = r2(taxable + gstAmt);
        var combinedGstRate = r2(cgstRate + sgstRate + igstRate);
        await GRNItem.update(
          { rate: rate, gst_rate: combinedGstRate, gst_amount: gstAmt, amount: total },
          { where: { id: it.id } }
        );
      }
    }

    res.json({ success: true, count: docs.length });
  } catch (err) {
    console.error('Error batch billing:', err);
    res.status(500).json({ error: 'Failed to batch bill' });
  }
};

exports.deleteGRN = async (req, res) => {
  try {
    const { id } = req.params;
    const grn = await GRN.findByPk(id, {
      include: [{ model: GRNItem, as: 'items' }],
    });
    if (!grn) return res.status(404).json({ error: 'GRN not found' });

    // Reverse PO item received quantities if status was Received
    if (grn.status === 'Received' && grn.items) {
      const t = await db.sequelize.transaction();
      try {
        for (const it of grn.items) {
          if (it.po_item_id) {
            const poItem = await PurchaseOrderItem.findByPk(it.po_item_id, { transaction: t });
            if (poItem) {
              const newReceived = Math.max(0, parseFloat(poItem.received_quantity || 0) - parseFloat(it.accepted_qty || 0));
              await poItem.update({ received_quantity: newReceived }, { transaction: t });
            }
          }
          // Reverse the stock posted into the ledger for this GRN item
          if (it.item_id && grn.cost_posted) {
            await reverseMovements(
              {
                item_id: it.item_id,
                ref_type: REF_TYPES.PURCHASE,
                ref_no: grn.ir_no,
                user: req.session?.user?.name || 'System',
              },
              t
            );
          }
        }
        await t.commit();
      } catch (err) {
        await t.rollback();
        throw err;
      }
    }

    await GRNItem.destroy({ where: { grn_id: id } });
    await grn.destroy();
    res.json({ message: 'GRN deleted' });
  } catch (err) {
    console.error('Error deleting GRN:', err);
    res.status(500).json({ error: 'Failed to delete GRN' });
  }
};
