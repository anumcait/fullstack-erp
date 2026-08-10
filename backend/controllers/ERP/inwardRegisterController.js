const { Op } = require('sequelize');
const db = require('../../models/ERP');
const GRN = db.GRN;
const GRNItem = db.GRNItem;
const DeliveryChallan = db.DeliveryChallan;
const DeliveryChallanItem = db.DeliveryChallanItem;
const ItemMaster = db.ItemMaster;
const SupplierMaster = db.SupplierMaster;
const { postMovement, reverseMovements, getDefaultWarehouse, lockStock, negativeStockAllowed, getStoresSettings, REF_TYPES } = require('../../utils/stockService');
const { nextDocNumber } = require('../../utils/docNumber');

const round2 = (v) => Number(Number(v || 0).toFixed(2));

async function generateIrNo() {
  const settings = await getStoresSettings();
  return nextDocNumber(GRN, 'ir_no', Number(settings?.ir_start_no) || 1, settings?.ir_prefix);
}

async function getPendingDCs(req, res) {
  try {
    const { search, party_id, dc_type, date_from, date_to } = req.query;
    // Non Returnable DCs (N) never come back, so they are never pending for an IR receipt.
    const where = { status: 'Approved', dc_type: { [Op.ne]: 'N' } };
    if (dc_type) where.dc_type = dc_type;
    if (party_id) where.party_id = party_id;
    if (search) where[Op.or] = [{ dc_no: { [Op.iLike]: `%${search}%` } }, { party_name: { [Op.iLike]: `%${search}%` } }];
    if (date_from && date_to) {
      const toEnd = new Date(new Date(date_to).getTime() + 86400000).toISOString().slice(0, 10);
      where.dc_date = { [Op.between]: [date_from, toEnd] };
    } else if (date_from) {
      where.dc_date = { [Op.gte]: date_from };
    } else if (date_to) {
      where.dc_date = { [Op.lte]: date_to };
    }

    const dcs = await DeliveryChallan.findAll({
      where,
      include: [{
        model: DeliveryChallanItem,
        as: 'items',
        include: [{
          model: ItemMaster,
          as: 'item',
          attributes: ['id', 'item_code', 'item_name'],
          include: [{ model: db.Unit, as: 'unit', attributes: ['id', 'name', 'short_name'] }],
        }],
      }],
      order: [['dc_date', 'DESC']],
    });

    for (const dc of dcs) {
      const receivedMap = {};
      const inwardItems = await GRNItem.findAll({
        where: { dc_id: dc.id },
        attributes: ['dc_item_id', [db.sequelize.fn('SUM', db.sequelize.col('qty_supplied')), 'total_received']],
        group: ['dc_item_id'],
      });
      inwardItems.forEach((it) => { receivedMap[it.dc_item_id] = Number(it.dataValues.total_received || 0); });

      dc.items.forEach((item) => {
        const received = receivedMap[item.id] || 0;
        item.dataValues.qty_received = received;
        item.dataValues.qty_pending = Number(item.quantity) - received;
      });

      const hasPending = dc.items.some((it) => it.dataValues.qty_pending > 0);
      dc.dataValues.has_pending = hasPending;
    }

    res.json(dcs.filter((dc) => dc.dataValues.has_pending));
  } catch (err) {
    console.error('Error fetching pending DCs:', err);
    res.status(500).json({ error: 'Failed to fetch pending DCs' });
  }
}

exports.getPendingDCs = getPendingDCs;

exports.getPendingBilling = async (req, res) => {
  try {
    const { dc_type, year, billed, search, date_from, date_to } = req.query;
    const where = {
      status: 'Approved',
      dc_type: dc_type ? dc_type : { [Op.in]: ['R', 'M'] },
    };
    if (billed === 'true' || billed === '1') {
      where.bill_no = { [Op.ne]: null };
    } else {
      where.bill_no = { [Op.is]: null };
    }
    if (year) {
      where[Op.and] = [
        db.sequelize.where(db.sequelize.fn('EXTRACT', db.sequelize.literal('YEAR FROM "ir_date"')), year),
      ];
    }
    if (search) {
      where[Op.or] = [
        { ir_no: { [Op.iLike]: `%${search}%` } },
        { party_name: { [Op.iLike]: `%${search}%` } },
        { bill_no: { [Op.iLike]: `%${search}%` } },
      ];
    }
    if (date_from && date_to) {
      const toEnd = new Date(new Date(date_to).getTime() + 86400000).toISOString().slice(0, 10);
      where.ir_date = { [Op.between]: [date_from, toEnd] };
    } else if (date_from) {
      where.ir_date = { [Op.gte]: date_from };
    } else if (date_to) {
      where.ir_date = { [Op.lte]: date_to };
    }
    const rows = await GRN.findAll({
      where,
      include: [
        { model: GRNItem, as: 'items', include: [{ model: ItemMaster, as: 'item', attributes: ['id', 'item_code', 'item_name'] }] },
        { model: SupplierMaster, as: 'supplier', attributes: ['id', 'supplier_code', 'supplier_name', 'gstin'] },
        { model: DeliveryChallan, as: 'deliveryChallans' },
      ],
      order: [['ir_date', 'DESC']],
    });
    res.json(rows);
  } catch (err) {
    console.error('Error fetching IR billing:', err);
    res.status(500).json({ error: 'Failed to fetch IR billing' });
  }
};

exports.billIr = async (req, res) => {
  try {
    const { ids, bill_no, bill_date, invoice_no, invoice_date, remarks } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) return res.status(400).json({ error: 'IR IDs required' });
    if (!bill_no) return res.status(400).json({ error: 'Bill number required' });
    const bDate = bill_date || new Date().toISOString().split('T')[0];

    const docs = await GRN.findAll({ where: { id: { [Op.in]: ids } } });
    if (docs.length !== ids.length) return res.status(404).json({ error: 'One or more IRs not found' });
    const alreadyBilled = docs.filter((d) => d.bill_no);
    if (alreadyBilled.length > 0) {
      return res.status(400).json({ error: 'IR(s) already billed: ' + alreadyBilled.map((d) => d.ir_no).join(', ') });
    }

    for (const doc of docs) {
      await doc.update({
        invoice_no: invoice_no || doc.invoice_no,
        invoice_date: invoice_date || doc.invoice_date,
        bill_no,
        bill_date: bDate,
        notes: remarks ? `${doc.notes || ''} | Billing: ${remarks}`.trim() : doc.notes,
      });
    }
    res.json({ message: `Billed ${docs.length} IR(s)` });
  } catch (err) {
    console.error('Error billing IRs:', err);
    res.status(500).json({ error: 'Failed to bill IRs' });
  }
};

exports.getNextNumber = async (req, res) => {
  try {
    const settings = await getStoresSettings();
    const next = await nextDocNumber(GRN, 'ir_no', Number(settings?.ir_start_no) || 1, settings?.ir_prefix);
    res.json({ ir_no: next, last_number: next });
  } catch (err) {
    console.error('Error generating IR number:', err);
    res.status(500).json({ error: 'Failed to generate IR number' });
  }
};

exports.getList = async (req, res) => {
  try {
    const { search, status, party_id, dc_type, date_from, date_to, year } = req.query;
    const where = {};
    if (status) where.status = status;
    if (dc_type) where.dc_type = dc_type;
    if (party_id) where.party_id = party_id;
    if (date_from && date_to) {
      const toEnd = new Date(new Date(date_to).getTime() + 86400000).toISOString().slice(0, 10);
      where.ir_date = { [Op.between]: [date_from, toEnd] };
    } else if (date_from) {
      where.ir_date = { [Op.gte]: date_from };
    } else if (date_to) {
      where.ir_date = { [Op.lte]: date_to };
    }
    if (year) {
      where[Op.and] = [db.sequelize.where(db.sequelize.fn('EXTRACT', db.sequelize.literal('YEAR FROM "ir_date"')), year)];
    }
    if (search) where[Op.or] = [{ ir_no: { [Op.iLike]: `%${search}%` } }, { party_name: { [Op.iLike]: `%${search}%` } }];

    const rows = await GRN.findAll({
      where,
      include: [
        { model: GRNItem, as: 'items' },
        { model: SupplierMaster, as: 'supplier', attributes: ['id', 'supplier_code', 'supplier_name'] },
        { model: DeliveryChallan, as: 'deliveryChallans' },
      ],
      order: [['ir_date', 'DESC']],
    });
    res.json(rows);
  } catch (err) {
    console.error('Error fetching IR list:', err);
    res.status(500).json({ error: 'Failed to fetch inward registers' });
  }
};

exports.getOne = async (req, res) => {
  try {
    const ir = await GRN.findByPk(req.params.id, {
      include: [
        { model: GRNItem, as: 'items', include: [{ model: ItemMaster, as: 'item' }] },
        { model: SupplierMaster, as: 'supplier' },
        { model: DeliveryChallan, as: 'deliveryChallans', include: [{ model: DeliveryChallanItem, as: 'items' }] },
      ],
    });
    if (!ir) return res.status(404).json({ error: 'Inward Register not found' });

    // Attach per-item pending qty to the linked DCs so the edit form can cap quantities.
    const dcs = ir.deliveryChallans || [];
    for (const dc of dcs) {
      const receivedMap = {};
      const inwardItems = await GRNItem.findAll({
        where: { dc_id: dc.id },
        attributes: ['dc_item_id', [db.sequelize.fn('SUM', db.sequelize.col('qty_supplied')), 'total_received']],
        group: ['dc_item_id'],
      });
      inwardItems.forEach((it) => { receivedMap[it.dc_item_id] = Number(it.dataValues.total_received || 0); });
      (dc.items || []).forEach((item) => {
        item.dataValues.qty_received = receivedMap[item.id] || 0;
        item.dataValues.qty_pending = Number(item.quantity) - (receivedMap[item.id] || 0);
      });
    }

    res.json(ir);
  } catch (err) {
    console.error('Error fetching IR:', err);
    res.status(500).json({ error: 'Failed to fetch inward register' });
  }
};

exports.create = async (req, res) => {
  const t = await db.sequelize.transaction();
  try {
    const body = req.body;
    const ir = await GRN.create({
      ir_no: await generateIrNo(),
      ir_date: body.ir_date || null,
      inward_date: body.inward_date || null,
      ir_type: 'GRR',
      dc_type: body.dc_type || 'S',
      dept_cd: body.dept_code || null,
      year: body.year || null,
      supplier_id: body.party_id || null,
      party_name: body.party_name || null,
      vehicle_no: body.vehicle_no || null,
      driver_name: body.driver_name || null,
      department: body.department || null,
      requested_by: body.requested_by || null,
      prepared_by: body.prepared_by || null,
      notes: body.remarks || null,
      status: 'Received',
      approval_status: 'Pending',
      cost_posted: false,
      received_by: body.prepared_by || null,
    }, { transaction: t });

    if (Array.isArray(body.items)) {
      for (const it of body.items) {
        await GRNItem.create({
          grn_id: ir.id,
          sl_no: it.sl_no || null,
          po_id: it.po_id || null,
          item_id: it.item_id || null,
          item_code: it.item_code || null,
          item_name: it.item_name,
          uom: it.uom || null,
          unit_id: it.unit_id || null,
          qty_supplied: it.qty_supplied || 0,
          dc_qty: it.dc_qty || 0,
          rate: it.rate || 0,
          dc_id: it.dc_id || null,
          dc_item_id: it.dc_item_id || null,
          remarks: it.remarks || null,
          work_order: it.work_order || null,
          opening: it.opening || 0,
          weight: it.weight || 0,
          accepted_qty: it.qty_accepted || it.qty_supplied || 0,
          received_qty: Number(it.qty_supplied) || 0,
          ordered_qty: Number(it.dc_qty) || 0,
        }, { transaction: t });
      }
    }

    if (Array.isArray(body.dc_ids)) {
      const dcs = await DeliveryChallan.findAll({ where: { id: { [Op.in]: body.dc_ids } }, transaction: t });
      await ir.setDeliveryChallans(dcs, { transaction: t });
    }

    await t.commit();
    const updated = await GRN.findByPk(ir.id, { include: [{ model: GRNItem, as: 'items' }] });
    res.json(updated);
  } catch (err) {
    await t.rollback();
    console.error('Error updating IR:', err);
    res.status(500).json({ error: 'Failed to update inward register' });
  }
};

exports.approve = async (req, res) => {
  const t = await db.sequelize.transaction();
  try {
    const ir = await GRN.findByPk(req.params.id, {
      include: [{ model: GRNItem, as: 'items' }],
      transaction: t,
    });
    if (!ir) return res.status(404).json({ error: 'Inward Register not found' });
    if (ir.status !== 'Received') return res.status(400).json({ error: 'IR already approved' });

    const user = req.session?.user?.name || 'System';
    ir.status = 'Approved';
    ir.approval_status = 'Approved';
    ir.approved_by = req.body.approved_by || null;
    if (!ir.ir_no) ir.ir_no = await generateIrNo();
    ir.approved_date = new Date();
    ir.cost_posted = true;

    const wh = await getDefaultWarehouse();
    const negAllowed = await negativeStockAllowed();
    for (const it of ir.items) {
      if (!it.item_id) continue;
      const qty = Number(it.qty_supplied || 0);
      if (qty <= 0) continue;
      if (!negAllowed) {
        const locked = await lockStock(it.item_id, t);
        if (Number(locked?.current_stock || 0) + qty < qty) {
          throw new Error(`Insufficient stock for ${it.item_code || it.item_name || it.item_id}`);
        }
      }
      const item = await ItemMaster.findByPk(it.item_id, { transaction: t });
      if (!item) continue;
      await postMovement({
        item_id: it.item_id,
        warehouse_id: wh?.id || null,
        batch_id: it.batch_id || null,
        ledger_date: ir.ir_date || new Date(),
        ref_type: REF_TYPES.INWARD_REGISTER,
        doc_no: ir.ir_no,
        ref_no: ir.ir_no,
        reference: ir.party_name || null,
        qty_in: qty,
        qty_out: 0,
        unit_cost: Number(item.moving_average_cost || 0),
        remarks: it.remarks || `IR ${ir.ir_no}`,
        user,
      }, t);
    }

    await ir.save({ transaction: t });
    await t.commit();
    res.json(ir);
  } catch (err) {
    await t.rollback();
    console.error('Error approving IR:', err);
    res.status(500).json({ error: err.message || 'Failed to approve inward register' });
  }
};

exports.cancel = async (req, res) => {
  const cancelRemarks = req.body.cancel_remarks;
  if (!cancelRemarks || !String(cancelRemarks).trim()) {
    return res.status(400).json({ error: 'Cancel remarks are required' });
  }
  const t = await db.sequelize.transaction();
  try {
    const ir = await GRN.findByPk(req.params.id, {
      include: [{ model: GRNItem, as: 'items' }],
      transaction: t,
    });
    if (!ir) return res.status(404).json({ error: 'Inward Register not found' });
    if (ir.status === 'Cancelled') return res.status(400).json({ error: 'IR already cancelled' });
    if (!['Received', 'Approved'].includes(ir.status)) return res.status(400).json({ error: 'Only received or approved IRs can be cancelled' });

    if (ir.status === 'Approved' && ir.cost_posted) {
      const user = req.session?.user?.name || 'System';
      const itemIds = [...new Set(ir.items.map((x) => x.item_id).filter(Boolean))];
      for (const itemId of itemIds) {
        await reverseMovements(
          { item_id: itemId, ref_type: REF_TYPES.INWARD_REGISTER, ref_no: ir.ir_no, user },
          t
        );
      }
    }
    ir.status = 'Cancelled';
    ir.cancel_remarks = req.body.cancel_remarks || null;
    ir.cancel_by = req.body.cancel_by || null;
    ir.cancel_date = req.body.cancel_date || new Date();
    ir.cost_posted = false;
    await ir.save({ transaction: t });
    await t.commit();
    res.json(ir);
  } catch (err) {
    await t.rollback();
    console.error('Error cancelling IR:', err);
    res.status(500).json({ error: 'Failed to cancel inward register' });
  }
};

exports.update = async (req, res) => {
  const t = await db.sequelize.transaction();
  try {
    const ir = await GRN.findByPk(req.params.id, { transaction: t });
    if (!ir) return res.status(404).json({ error: 'Inward Register not found' });
    if (ir.status === 'Approved') return res.status(400).json({ error: 'Cannot update an approved IR' });

    const body = req.body;
    await ir.update({
      ir_date: body.ir_date || ir.ir_date,
      inward_date: body.inward_date || null,
      dc_type: body.dc_type || ir.dc_type,
      dept_cd: body.dept_code || null,
      year: body.year || null,
      supplier_id: body.party_id || null,
      party_name: body.party_name || null,
      prepared_by: body.prepared_by || null,
      requested_by: body.requested_by || null,
      notes: body.remarks || null,
    }, { transaction: t });

    if (Array.isArray(body.items)) {
      await GRNItem.destroy({ where: { grn_id: ir.id }, transaction: t });
      for (const it of body.items) {
        await GRNItem.create({
          grn_id: ir.id,
          sl_no: it.sl_no || null,
          po_id: it.po_id || null,
          item_id: it.item_id || null,
          item_code: it.item_code || null,
          item_name: it.item_name,
          uom: it.uom || null,
          unit_id: it.unit_id || null,
          qty_supplied: it.qty_supplied || 0,
          dc_qty: it.dc_qty || 0,
          rate: it.rate || 0,
          dc_id: it.dc_id || null,
          dc_item_id: it.dc_item_id || null,
          remarks: it.remarks || null,
          work_order: it.work_order || null,
          opening: it.opening || 0,
          weight: it.weight || 0,
          accepted_qty: it.qty_accepted || it.qty_supplied || 0,
          received_qty: Number(it.qty_supplied) || 0,
          ordered_qty: Number(it.dc_qty) || 0,
        }, { transaction: t });
      }
    }

    if (Array.isArray(body.dc_ids)) {
      const dcs = await DeliveryChallan.findAll({ where: { id: { [Op.in]: body.dc_ids } }, transaction: t });
      await ir.setDeliveryChallans(dcs, { transaction: t });
    }

    await t.commit();
    const updated = await GRN.findByPk(ir.id, { include: [{ model: GRNItem, as: 'items' }] });
    res.json(updated);
  } catch (err) {
    await t.rollback();
    console.error('Error updating IR:', err);
    res.status(500).json({ error: 'Failed to update inward register' });
  }
};

exports.remove = async (req, res) => {
  try {
    const ir = await GRN.findByPk(req.params.id);
    if (!ir) return res.status(404).json({ error: 'Inward Register not found' });
    if (ir.status === 'Approved') return res.status(400).json({ error: 'Cannot delete an approved IR' });
    await GRNItem.destroy({ where: { grn_id: ir.id } });
    await ir.destroy();
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error('Error deleting IR:', err);
    res.status(500).json({ error: 'Failed to delete inward register' });
  }
};