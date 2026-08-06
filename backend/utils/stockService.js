const db = require('../models/ERP');
const { Op } = require('sequelize');

const round = (v, d = 3) => Number(Number(v || 0).toFixed(d));
const round2 = (v) => Number(Number(v || 0).toFixed(2));

// Canonical transaction types used across the inventory module.
const REF_TYPES = {
  OPENING: 'Opening Stock',
  PURCHASE: 'Purchase',
  PURCHASE_RETURN: 'Purchase Return',
  SALES: 'Sales',
  SALES_RETURN: 'Sales Return',
  MATERIAL_ISSUE: 'Material Issue',
  MATERIAL_RETURN: 'Material Return',
  PRODUCTION_IN: 'Production In',
  PRODUCTION_CONSUMPTION: 'Production Consumption',
  TRANSFER_IN: 'Transfer In',
  TRANSFER_OUT: 'Transfer Out',
  STOCK_ADJUSTMENT: 'Stock Adjustment',
  DELIVERY_CHALLAN: 'Delivery Challan',
  DC_RETURN: 'DC Return',
  INWARD_REGISTER: 'Inward Register',
  DAMAGE: 'Damage',
  WASTAGE: 'Wastage',
  SCRAP: 'Scrap',
  CSP: 'Customer Supplied Parts',
  SAMPLE: 'Sample',
  DONATION: 'Donation',
  WRITE_OFF: 'Write-off',
  INTERNAL_TRANSFER: 'Internal Transfer',
};

/**
 * Post one stock movement atomically inside the given transaction.
 *  - Updates ItemMaster.current_stock with an atomic SQL increment
 *  - Recomputes moving_average_cost for inward movements carrying a unit_cost
 *  - Appends an immutable row to t_stock_ledger
 *  - Adjusts the batch quantity when batch_id is provided
 */
async function postMovement(entry, t) {
  const qtyIn = round(entry.qty_in);
  const qtyOut = round(entry.qty_out);
  if (qtyIn === 0 && qtyOut === 0) {
    throw new Error('Movement must have a non-zero qty_in or qty_out');
  }
  const delta = qtyIn - qtyOut;
  const unitCost = entry.unit_cost != null && !isNaN(Number(entry.unit_cost)) ? Number(entry.unit_cost) : null;
  const itemId = entry.item_id;

  const item = await db.ItemMaster.findByPk(itemId, { transaction: t });
  if (!item) throw new Error(`Item ${itemId} not found`);

  let newAvg = null;
  if (delta > 0 && unitCost != null && unitCost > 0) {
    const curStock = round(item.current_stock, 2);
    const curCost = round(item.moving_average_cost, 4);
    const total = curStock + delta;
    newAvg = total > 0 ? (curStock * curCost + delta * unitCost) / total : unitCost;
  }

  const setClauses = ['current_stock = current_stock + :delta', 'updated_at = NOW()'];
  const repl = { delta, id: itemId };
  if (newAvg != null) {
    setClauses.push('moving_average_cost = :newAvg');
    repl.newAvg = round(newAvg, 4);
  }
  await db.sequelize.query(
    `UPDATE m_item_master SET ${setClauses.join(', ')} WHERE id = :id`,
    { replacements: repl, type: db.Sequelize.QueryTypes.UPDATE, transaction: t }
  );

  const stockValue = round2(delta * (unitCost || 0));

  const ledgerRow = await db.StockLedger.create(
    {
      ledger_date: entry.ledger_date || new Date(),
      ledger_time: entry.ledger_time || null,
      doc_no: entry.doc_no || entry.ref_no || null,
      ref_type: entry.ref_type,
      ref_no: entry.ref_no || null,
      reference: entry.reference || null,
      warehouse_id: entry.warehouse_id || null,
      item_id: itemId,
      batch_id: entry.batch_id || null,
      serial_no: entry.serial_no || null,
      qty_in: qtyIn,
      qty_out: qtyOut,
      unit_cost: unitCost,
      selling_price: entry.selling_price != null && !isNaN(Number(entry.selling_price)) ? Number(entry.selling_price) : null,
      stock_value: stockValue,
      remarks: entry.remarks || null,
      created_by: entry.user || null,
      reversal_of: entry.reversal_of || null,
    },
    { transaction: t }
  );

  if (entry.batch_id && Math.abs(delta) > 0) {
    await db.sequelize.query(
      'UPDATE m_item_batch SET quantity = GREATEST(0, quantity + :delta) WHERE id = :id',
      { replacements: { delta, id: entry.batch_id }, type: db.Sequelize.QueryTypes.UPDATE, transaction: t }
    );
  }

  return ledgerRow;
}

/**
 * Reverse every open (non-reversed) ledger row for a document, by writing
 * opposite entries. Used when a document is edited after posting or deleted.
 */
async function reverseMovements({ item_id, ref_type, ref_no, user, ledger_date }, t) {
  const rows = await db.StockLedger.findAll({
    where: { item_id, ref_type, ref_no, reversal_of: null },
    transaction: t,
  });
  const posted = [];
  for (const r of rows) {
    const qtyIn = round(r.qty_in);
    const qtyOut = round(r.qty_out);
    const rev = await postMovement(
      {
        item_id: r.item_id,
        warehouse_id: r.warehouse_id,
        batch_id: r.batch_id,
        serial_no: r.serial_no,
        ledger_date: ledger_date || r.ledger_date,
        ref_type: r.ref_type,
        doc_no: r.doc_no,
        ref_no: r.ref_no,
        reference: `Reversal of ${r.ref_type} ${r.ref_no || `#${r.id}`}`,
        qty_in: qtyOut,
        qty_out: qtyIn,
        unit_cost: r.unit_cost,
        selling_price: r.selling_price,
        remarks: r.remarks ? `CANCELLED: ${r.remarks}` : 'Reversed',
        user,
        reversal_of: r.id,
      },
      t
    );
    posted.push(rev);
  }
  return posted;
}

/**
 * Lock an item's stock row inside a transaction (SELECT ... FOR UPDATE).
 * Returns { id, current_stock } so callers can validate availability
 * without a lost-update race.
 */
async function lockStock(itemId, t) {
  const [rows] = await db.sequelize.query(
    'SELECT id, current_stock FROM m_item_master WHERE id = :id FOR UPDATE',
    { replacements: { id: itemId }, transaction: t }
  );
  return rows[0];
}

/** Whether negative stock is permitted for this company (StoresSettings). */
async function negativeStockAllowed() {
  try {
    const s = await db.StoresSettings.findByPk(1);
    return Boolean(s?.negative_stock_allowed);
  } catch (e) {
    return false;
  }
}

/** Fetch all open ledger rows for a document (used to know what to reverse). */
async function getDocRows({ item_id, ref_type, ref_no }, t) {
  return db.StockLedger.findAll({
    where: { item_id, ref_type, ref_no, reversal_of: null },
    transaction: t,
  });
}

/**
 * Compute on-hand stock quantity and valuation for an item as of a date.
 * Pure ledger query - never depends on the current ItemMaster.current_stock.
 * Returns { opening_qty, closing_qty, closing_value, avg_cost }.
 */
async function stockAsOf(itemId, asOfDate, warehouseId) {
  const endDate = asOfDate ? new Date(`${asOfDate}T23:59:59`) : new Date();
  const base = { item_id: itemId, reversal_of: null };
  if (warehouseId) base.warehouse_id = warehouseId;

  const openingRows = await db.StockLedger.findAll({
    where: { ...base, ledger_date: { [Op.lt]: startOfDay(asOfDate || today()) } },
    attributes: [
      [db.sequelize.fn('COALESCE', db.sequelize.fn('SUM', db.sequelize.col('qty_in')), 0), 'qty_in'],
      [db.sequelize.fn('COALESCE', db.sequelize.fn('SUM', db.sequelize.col('qty_out')), 0), 'qty_out'],
    ],
    raw: true,
  });

  const closingRows = await db.StockLedger.findAll({
    where: { ...base, ledger_date: { [Op.lte]: endDate } },
    attributes: [
      [db.sequelize.fn('COALESCE', db.sequelize.fn('SUM', db.sequelize.col('qty_in')), 0), 'qty_in'],
      [db.sequelize.fn('COALESCE', db.sequelize.fn('SUM', db.sequelize.col('qty_out')), 0), 'qty_out'],
      [db.sequelize.fn('COALESCE', db.sequelize.fn('SUM', db.sequelize.col('stock_value')), 0), 'stock_value'],
    ],
    raw: true,
  });

  const op = openingRows[0] || {};
  const cl = closingRows[0] || {};
  const openingQty = round(Number(op.qty_in) - Number(op.qty_out), 2);
  const closingQty = round(Number(cl.qty_in) - Number(cl.qty_out), 2);
  const closingValue = round2(Number(cl.stock_value));

  return {
    opening_qty: openingQty,
    closing_qty: closingQty,
    closing_value: closingValue,
    avg_cost: closingQty > 0 ? round2(closingValue / closingQty) : 0,
  };
}

/** Resolve the default warehouse (from StoresSettings, falling back to first active). */
async function getDefaultWarehouse() {
  try {
    const s = await db.StoresSettings.findByPk(1);
    const name = s?.default_warehouse || 'Main Store';
    let w = await db.Warehouse.findOne({ where: { warehouse_name: name } });
    if (!w) w = await db.Warehouse.findOne({ where: { is_active: true }, order: [['id', 'ASC']] });
    return w;
  } catch (e) {
    return null;
  }
}

const today = () => new Date().toISOString().slice(0, 10);
const startOfDay = (d) => new Date(`${d}T00:00:00`);

module.exports = {
  REF_TYPES,
  postMovement,
  reverseMovements,
  getDocRows,
  stockAsOf,
  getDefaultWarehouse,
  lockStock,
  negativeStockAllowed,
  round,
  round2,
};
