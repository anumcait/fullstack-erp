const { Op } = require('sequelize');
const db = require('../../models/ERP');
const ItemMaster = db.ItemMaster;
const { postMovement, reverseMovements, getDefaultWarehouse, lockStock, negativeStockAllowed, REF_TYPES, getStoresSettings } = require('../../utils/stockService');

const round2 = (v) => Number(Number(v || 0).toFixed(2));

// Every non-returnable DC sub-type posts a distinct stock-ledger entry at approval,
// so reports can tell exactly what discharged the stock. "Other" (and a missing type)
// falls back to the generic Delivery Challan entry.
const NON_RETURNABLE_REF = {
  Sale: REF_TYPES.SALES,
  Scrap: REF_TYPES.SCRAP,
  'Purchase Return': REF_TYPES.PURCHASE_RETURN,
  Sample: REF_TYPES.SAMPLE,
  Donation: REF_TYPES.DONATION,
  'Write-off': REF_TYPES.WRITE_OFF,
  'Internal Transfer': REF_TYPES.INTERNAL_TRANSFER,
  CSP: REF_TYPES.CSP,
  Jobwork: REF_TYPES.INTERNAL_TRANSFER,
};

// Resolve the stock-ledger reference type for a DC. Non-returnable DCs use their purpose;
// every other DC uses the generic Delivery Challan entry.
const dcRefType = (dc) =>
  dc?.dc_type === 'N' ? NON_RETURNABLE_REF[dc.non_returnable_type] : REF_TYPES.DELIVERY_CHALLAN;

// Prefix config for DC series, loaded from StoresSettings (cached via stockService).
// Only DC keeps configurable prefixes; all other docs use plain sequential numbers.
async function getDcPrefixConfig() {
  const settings = await getStoresSettings();
  return {
    S: settings?.dc_prefix_sale_approval || 'SA',  // Sale on Approval
    N: settings?.dc_prefix_nonreturn || 'DCN',      // Non-returnable
    L: settings?.dc_prefix_labour || 'DCL',         // Labour
    R: settings?.dc_prefix_repair || 'DCR',         // Repair
    M: settings?.dc_prefix_maintenance || 'DCM',    // Maintenance
    J: settings?.dc_prefix_jobwork || 'DCJ',        // Jobwork
    PLAIN: '', // default for other types
  };
}

// Build SERIES_SQL dynamically from the configured prefixes (regex-escaped, fixed SQL)
async function buildSeriesSQL() {
  const cfg = await getDcPrefixConfig();
  const esc = (p) => (p || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const series = {};

  const sP = esc(cfg.S || 'SA');
  series.S = `SELECT COALESCE(MAX(CAST(SUBSTRING(dc_no FROM '^${sP}([0-9]+)') AS INTEGER)), 0) AS max_no
        FROM t_delivery_challan WHERE dc_type = 'S' AND dc_no ~ '^${sP}[0-9]+$'`;

  const nP = esc(cfg.N || '');
  series.N = nP
    ? `SELECT COALESCE(MAX(CAST(SUBSTRING(dc_no FROM '^${nP}([0-9]+)') AS INTEGER)), 0) AS max_no
         FROM t_delivery_challan WHERE dc_type = 'N' AND dc_no ~ '^${nP}[0-9]+$'`
    : `SELECT COALESCE(MAX(CAST(dc_no AS INTEGER)), 0) AS max_no
         FROM t_delivery_challan WHERE dc_type = 'N' AND dc_no ~ '^[0-9]+$'`;

  series.PLAIN = `SELECT COALESCE(MAX(CAST(dc_no AS INTEGER)), 0) AS max_no
           FROM t_delivery_challan WHERE dc_type NOT IN ('S','N') AND dc_no ~ '^[0-9]+$'`;

  return { series, cfg };
}

// Resolve the next challan number and the last issued number for a given DC type.
async function nextDcNumber(dcType) {
  const { series, cfg } = await buildSeriesSQL();
  const sql = series[dcType] || series.PLAIN;
  const [rows] = await db.sequelize.query(sql);
  const last = Number(rows[0]?.max_no || 0);
  const prefix = cfg[dcType] || '';
  return { next: prefix + (last + 1), last };
}

async function generateDcNo(dcType) {
  const { next } = await nextDcNumber(dcType);
  return next;
}

// Return the first item that cannot be issued from available on-hand stock. Used to block
// saving a DC — even a draft — when an item's quantity exceeds its current stock.
async function firstInsufficientItem(itemRows) {
  for (const it of itemRows || []) {
    if (!it.item_id) continue;
    const qty = Number(it.quantity || 0);
    if (qty <= 0) continue;
    const item = await ItemMaster.findByPk(it.item_id);
    if (item && Number(item.current_stock || 0) < qty) {
      return it.item_code || item.item_code || item.item_name || `#${it.item_id}`;
    }
  }
  return null;
}

// Post DC dispatch (outward) or return (inward) to the stock ledger atomically.
const postDcStock = async (items, doc, refType, t, user) => {
  const wh = await getDefaultWarehouse();
  const negAllowed = await negativeStockAllowed();
  for (const it of items) {
    if (!it.item_id) continue;
    const qty = Number(it.quantity || 0);
    if (qty <= 0) continue;
    if (refType === REF_TYPES.DELIVERY_CHALLAN && !negAllowed) {
      const locked = await lockStock(it.item_id, t);
      if (Number(locked?.current_stock || 0) < qty) {
        throw new Error(`Insufficient stock for ${it.item_code || it.item_name || it.item_id}`);
      }
    }
    const item = await ItemMaster.findByPk(it.item_id, { transaction: t });
    if (!item) continue;
    await postMovement(
      {
        item_id: it.item_id,
        warehouse_id: it.warehouse_id || wh?.id || null,
        batch_id: it.batch_id || null,
        ledger_date: doc.dc_date || new Date(),
        ref_type: refType,
        doc_no: doc.dc_no,
        ref_no: doc.dc_no,
        reference: doc.party_name || doc.reference_no || null,
        qty_in: refType === REF_TYPES.DC_RETURN ? qty : 0,
        qty_out: refType === REF_TYPES.DC_RETURN ? 0 : qty,
        unit_cost: Number(item.moving_average_cost || 0),
        remarks: it.remarks || `${doc.dc_type || 'S'} challan ${doc.dc_no}`,
        user,
      },
      t
    );
  }
};

exports.getNextNumber = async (req, res) => {
  try {
    const { dc_type } = req.query;
    const { next, last } = await nextDcNumber(dc_type);
    res.json({ dc_no: next, last_number: String(last) });
  } catch (err) {
    console.error("Error generating DC number:", err);
    res.status(500).json({ error: "Failed to generate DC number" });
  }
};

exports.getList = async (req, res) => {
  try {
    const { search, status, returnable, dc_type, year, date_from, date_to } = req.query;
    const where = {};
    if (status) where.status = status;
    if (dc_type) where.dc_type = dc_type;
    if (returnable === 'true') where.returnable = true;
    if (returnable === 'false') where.returnable = false;
    if (date_from && date_to) {
      const toEnd = new Date(new Date(date_to).getTime() + 86400000).toISOString().slice(0, 10);
      where.dc_date = { [Op.between]: [date_from, toEnd] };
    } else if (date_from) {
      where.dc_date = { [Op.gte]: date_from };
    } else if (date_to) {
      where.dc_date = { [Op.lte]: date_to };
    }
    if (year) {
      where[Op.and] = [
        db.sequelize.where(db.sequelize.fn('EXTRACT', db.sequelize.literal('YEAR FROM "dc_date"')), year),
      ];
    }
    if (search) where[Op.or] = [{ dc_no: { [Op.iLike]: `%${search}%` } }, { party_name: { [Op.iLike]: `%${search}%` } }];
    const rows = await db.DeliveryChallan.findAll({ where, order: [['dc_date', 'DESC']] });
    // Drafts carry no real number; expose the last real number per series so the UI can
    // build a local-time draft reference (draft no = last real no + local HHMMSS of creation).
    const lastByType = {};
    const { series } = await buildSeriesSQL();
    for (const type of ['S', 'N', 'PLAIN']) {
      const [lastRow] = await db.sequelize.query(series[type]);
      lastByType[type] = Number(lastRow[0]?.max_no || 0);
    }
    const withRef = rows.map((r) => {
      const d = r.toJSON();
      if (!d.dc_no) d.last_number = String(lastByType[d.dc_type === 'S' || d.dc_type === 'N' ? d.dc_type : 'PLAIN']);
      return d;
    });
    res.json(withRef);
  } catch (err) {
    console.error('Error fetching DC list:', err);
    res.status(500).json({ error: 'Failed to fetch delivery challans' });
  }
};

exports.getPendingBilling = async (req, res) => {
  try {
    const { year } = req.query;
    const where = { status: 'Approved', bill_no: null };
    if (year) {
      where[Op.and] = [
        db.sequelize.where(db.sequelize.fn('EXTRACT', db.sequelize.literal('YEAR FROM "dc_date"')), year),
      ];
    }
    const rows = await db.DeliveryChallan.findAll({
      where,
      include: [{ model: db.DeliveryChallanItem, as: 'items' }],
      order: [['dc_date', 'DESC']],
    });
    res.json(rows);
  } catch (err) {
    console.error('Error fetching pending DC billing:', err);
    res.status(500).json({ error: 'Failed to fetch pending DC billing' });
  }
};

exports.billDc = async (req, res) => {
  try {
    const { ids, bill_no, bill_date } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) return res.status(400).json({ error: 'DC IDs required' });
    const bDate = bill_date || new Date().toISOString().split('T')[0];
    await db.DeliveryChallan.update(
      { bill_no, bill_date: bDate, status: 'Billed' },
      { where: { id: { [Op.in]: ids } } }
    );
    res.json({ message: `Billed ${ids.length} DC(s)` });
  } catch (err) {
    console.error('Error billing DCs:', err);
    res.status(500).json({ error: 'Failed to bill DCs' });
  }
};

exports.getByParty = async (req, res) => {
  try {
    const rows = await db.DeliveryChallan.findAll({
      where: { party_id: req.params.partyId },
      include: [{ model: db.DeliveryChallanItem, as: 'items' }],
      order: [['dc_date', 'DESC']],
    });
    res.json(rows);
  } catch (err) {
    console.error('Error fetching DCs by party:', err);
    res.status(500).json({ error: 'Failed to fetch' });
  }
};

exports.getOne = async (req, res) => {
  try {
    const dc = await db.DeliveryChallan.findByPk(req.params.id, {
      include: [{
        model: db.DeliveryChallanItem, as: 'items',
        include: [{ model: ItemMaster, as: 'item', include: [{ model: db.Unit, as: 'unit' }] }],
      },
      {
        model: db.SupplierMaster, as: 'supplier',
      }],
    });
    if (!dc) return res.status(404).json({ error: 'Delivery Challan not found' });
    const d = dc.toJSON();
    // Drafts carry no real number; expose the last real number in the row's series so the
    // UI can build a local-time draft reference (draft no = last real no + local HHMMSS).
    if (!d.dc_no) {
      const { series } = await buildSeriesSQL();
      const type = d.dc_type === 'S' || d.dc_type === 'N' ? d.dc_type : 'PLAIN';
      const [lastRow] = await db.sequelize.query(series[type]);
      d.last_number = String(lastRow[0]?.max_no || 0);
    }
    res.json(d);
  } catch (err) {
    console.error('Error fetching DC:', err);
    res.status(500).json({ error: 'Failed to fetch delivery challan' });
  }
};

exports.create = async (req, res) => {
  try {
    const body = req.body;
    // Block saving the DC when any item exceeds available stock (unless negative stock is allowed).
    if (Array.isArray(body.items) && !(await negativeStockAllowed())) {
      const missing = await firstInsufficientItem(body.items);
      if (missing) return res.status(400).json({ error: `Insufficient stock for ${missing}` });
    }
    const dc = await db.DeliveryChallan.create({
      // DC number is assigned only when the challan is approved (sequential, at approval time).
      dc_no: null,
      // Draft reference is captured once at save time so it never changes when later DCs are approved.
      draft_no: body.draft_no || null,
      dc_date: body.dc_date,
      party_id: body.party_id || null,
      party_name: body.party_name || null,
      returnable: body.dc_type === 'S' ? Boolean(body.returnable) : false,
      dc_type: body.dc_type || 'S',
      non_returnable_type: body.non_returnable_type || null,
      expected_return_date: body.expected_return_date || null,
      reference_no: body.reference_no || null,
      maintenance_type: body.maintenance_type || null,
      vehicle_no: body.vehicle_no || null,
      driver_name: body.driver_name || null,
      department: body.department || null,
      through: body.through || null,
      requested_by: body.requested_by || null,
      prepared_by: body.prepared_by || null,
      req_date: body.req_date || null,
      remarks: body.remarks || null,
      status: 'Draft',
    });
    if (Array.isArray(body.items)) {
      for (const it of body.items) {
        await db.DeliveryChallanItem.create({
          dc_id: dc.id,
          item_id: it.item_id || null,
          item_code: it.item_code || null,
          item_name: it.item_name,
          item_grp: it.item_grp || null,
          wo_no: it.wo_no || null,
          hs_code: it.hs_code || null,
          tag: it.tag || null,
          opn1: it.opn1 || null,
          opn2: it.opn2 || null,
          opn3: it.opn3 || null,
          quantity: it.quantity || 0,
          order_prod_qty: it.order_prod_qty || null,
          rate: it.rate || null,
          unit_id: it.unit_id || null,
          unit: it.unit || null,
          returned_qty: 0,
          remarks: it.remarks || null,
          req_date: it.req_date || null,
        });
      }
    }
    res.status(201).json(dc);
  } catch (err) {
    console.error('Error creating DC:', err);
    res.status(500).json({ error: 'Failed to create delivery challan' });
  }
};

exports.update = async (req, res) => {
  try {
    const dc = await db.DeliveryChallan.findByPk(req.params.id);
    if (!dc) return res.status(404).json({ error: 'Delivery Challan not found' });
    if (dc.status !== 'Draft') return res.status(400).json({ error: 'Only draft challans can be edited' });
    const body = req.body;
    // Block saving the DC when any item exceeds available stock (unless negative stock is allowed).
    if (Array.isArray(body.items) && !(await negativeStockAllowed())) {
      const missing = await firstInsufficientItem(body.items);
      if (missing) return res.status(400).json({ error: `Insufficient stock for ${missing}` });
    }
    await dc.update({
      dc_date: body.dc_date,
      party_id: body.party_id || null,
      party_name: body.party_name || null,
      returnable: body.dc_type === 'S' ? Boolean(body.returnable) : false,
      dc_type: body.dc_type || dc.dc_type,
      non_returnable_type: body.non_returnable_type || null,
      expected_return_date: body.expected_return_date || null,
      reference_no: body.reference_no || null,
      maintenance_type: body.maintenance_type || null,
      vehicle_no: body.vehicle_no || null,
      driver_name: body.driver_name || null,
      department: body.department || null,
      through: body.through || null,
      requested_by: body.requested_by || null,
      prepared_by: body.prepared_by || dc.prepared_by || null,
      req_date: body.req_date || null,
      remarks: body.remarks || null,
    });
    // Keep the draft reference fixed once saved — it must not change when later DCs are approved.
    if (!dc.draft_no && body.draft_no) dc.draft_no = body.draft_no;
    await dc.save();
    await db.DeliveryChallanItem.destroy({ where: { dc_id: dc.id } });
    if (Array.isArray(body.items)) {
      for (const it of body.items) {
        await db.DeliveryChallanItem.create({
          dc_id: dc.id,
          item_id: it.item_id || null,
          item_code: it.item_code || null,
          item_name: it.item_name,
          item_grp: it.item_grp || null,
          wo_no: it.wo_no || null,
          hs_code: it.hs_code || null,
          tag: it.tag || null,
          opn1: it.opn1 || null,
          opn2: it.opn2 || null,
          opn3: it.opn3 || null,
          quantity: it.quantity || 0,
          order_prod_qty: it.order_prod_qty || null,
          rate: it.rate || null,
          unit_id: it.unit_id || null,
          unit: it.unit || null,
          returned_qty: 0,
          remarks: it.remarks || null,
          req_date: it.req_date || null,
        });
      }
    }
    res.json(dc);
  } catch (err) {
    console.error('Error updating DC:', err);
    res.status(500).json({ error: 'Failed to update delivery challan' });
  }
};

exports.approve = async (req, res) => {
  const t = await db.sequelize.transaction();
  try {
    const dc = await db.DeliveryChallan.findByPk(req.params.id, {
      include: [{ model: db.DeliveryChallanItem, as: 'items' }],
      transaction: t,
    });
    if (!dc) return res.status(404).json({ error: 'Delivery Challan not found' });
    if (dc.status !== 'Draft') return res.status(400).json({ error: 'Challan already approved' });
    const user = req.session?.user?.name || 'System';
    dc.status = 'Approved';
    dc.approved_by = req.body.approved_by || null;
    // DC number is issued at approval time so drafts never consume a number.
    if (dc.dc_no === null || dc.dc_no === undefined || dc.dc_no === '') {
      dc.dc_no = await generateDcNo(dc.dc_type);
    }
    // The challan is issued at the moment of approval — the DC date/time reflects the
    // actual dispatch (not the draft's creation time) and is used for the ledger date.
    dc.approved_date = new Date();
    dc.dc_date = new Date();
    await postDcStock(dc.items, dc, dcRefType(dc), t, user);
    await dc.save({ transaction: t });
    await t.commit();
    res.json(dc);
  } catch (err) {
    await t.rollback();
    console.error('Error approving DC:', err);
    res.status(500).json({ error: err.message || 'Failed to approve delivery challan' });
  }
};

exports.cancel = async (req, res) => {
  const cancelRemarks = req.body.cancel_remarks;
  if (!cancelRemarks || !String(cancelRemarks).trim()) {
    return res.status(400).json({ error: 'Cancel remarks are required' });
  }
  const t = await db.sequelize.transaction();
  try {
    const dc = await db.DeliveryChallan.findByPk(req.params.id, {
      include: [{ model: db.DeliveryChallanItem, as: 'items' }],
      transaction: t,
    });
    if (!dc) return res.status(404).json({ error: 'Delivery Challan not found' });
    if (dc.status === 'Cancelled') return res.status(400).json({ error: 'Challan already cancelled' });
    if (!['Draft', 'Approved'].includes(dc.status)) return res.status(400).json({ error: 'Only draft or approved challans can be cancelled' });
    if (dc.status === 'Approved') {
      const user = req.session?.user?.name || 'System';
      const itemIds = [...new Set(dc.items.map((x) => x.item_id).filter(Boolean))];
      for (const itemId of itemIds) {
        await reverseMovements(
          { item_id: itemId, ref_type: dcRefType(dc), ref_no: dc.dc_no, user },
          t
        );
      }
    }
    dc.status = 'Cancelled';
    dc.cancel_remarks = req.body.cancel_remarks || null;
    dc.cancel_by = req.body.cancel_by || null;
    dc.cancel_date = req.body.cancel_date || new Date();
    await dc.save({ transaction: t });
    await t.commit();
    res.json(dc);
  } catch (err) {
    await t.rollback();
    console.error('Error cancelling DC:', err);
    res.status(500).json({ error: 'Failed to cancel delivery challan' });
  }
};

exports.returnDc = async (req, res) => {
  const t = await db.sequelize.transaction();
  try {
    const dc = await db.DeliveryChallan.findByPk(req.params.id, {
      include: [{ model: db.DeliveryChallanItem, as: 'items' }],
      transaction: t,
    });
    if (!dc) return res.status(404).json({ error: 'Delivery Challan not found' });
    if (dc.dc_type !== 'S') return res.status(400).json({ error: 'Only Sale on Approval challans can be returned' });
    if (dc.status !== 'Approved') return res.status(400).json({ error: 'Only approved challans can be returned' });
    const returns = req.body.items || [];
    const returnedRows = [];
    for (const r of returns) {
      const it = dc.items.find((x) => x.id === r.id);
      if (!it) continue;
      const returned = Math.min(parseFloat(r.returned_qty) || 0, parseFloat(it.quantity) - parseFloat(it.returned_qty || 0));
      if (returned > 0) {
        returnedRows.push({ ...it.toJSON(), quantity: returned });
        await it.update({ returned_qty: round2(parseFloat(it.returned_qty || 0) + returned) }, { transaction: t });
      }
    }
    if (returnedRows.length > 0) {
      await postDcStock(returnedRows, dc, REF_TYPES.DC_RETURN, t, req.session?.user?.name || 'System');
    }
    const allReturned = dc.items.every((x) => parseFloat(x.returned_qty || 0) >= parseFloat(x.quantity));
    dc.status = allReturned ? 'Returned' : 'Approved';
    await dc.save({ transaction: t });
    await t.commit();
    res.json(dc);
  } catch (err) {
    await t.rollback();
    console.error('Error returning DC:', err);
    res.status(500).json({ error: err.message || 'Failed to process return' });
  }
};

exports.remove = async (req, res) => {
  try {
    const dc = await db.DeliveryChallan.findByPk(req.params.id);
    if (!dc) return res.status(404).json({ error: 'Delivery Challan not found' });
    if (dc.status === 'Approved') return res.status(400).json({ error: 'Cannot delete an approved challan' });
    await db.DeliveryChallanItem.destroy({ where: { dc_id: dc.id } });
    await dc.destroy();
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error('Error deleting DC:', err);
    res.status(500).json({ error: 'Failed to delete delivery challan' });
  }
};
