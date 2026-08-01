const db = require('../../models/ERP');
const { Op } = require('sequelize');

const round2 = (v) => Number(Number(v || 0).toFixed(2));
const today = () => new Date().toISOString().slice(0, 10);

// ── Stock Statement (bank-account style) ──────────────────────────────
// Opening Stock + Inward - Outward = Closing Stock, with running balance.
exports.getStockStatement = async (req, res) => {
  try {
    const { item_id, warehouse_id, as_of, from, to } = req.query;
    if (!item_id) return res.status(400).json({ error: 'item_id is required' });

    const fromDate = from || '1900-01-01';
    const toDate = to || as_of || today();
    const whereClause = ['l.item_id = :item_id'];
    if (warehouse_id) whereClause.push('l.warehouse_id = :warehouse_id');

    const [opening] = await db.sequelize.query(
      `SELECT COALESCE(SUM(qty_in) - SUM(qty_out), 0) AS opening_qty,
              COALESCE(SUM(stock_value), 0) AS opening_value
       FROM t_stock_ledger l
       WHERE ${whereClause.join(' AND ')} AND l.ledger_date < :start`,
      { replacements: { item_id, warehouse_id, start: `${fromDate} 00:00:00` }, type: db.Sequelize.QueryTypes.SELECT }
    );

    const rows = await db.sequelize.query(
      `SELECT l.id, l.ledger_date, TO_CHAR(l.ledger_date, 'HH24:MI') AS ledger_time,
              l.doc_no, l.ref_type, l.ref_no, l.reference,
              l.warehouse_id, w.warehouse_name,
              l.item_id, i.item_code, i.item_name,
              l.batch_id, b.batch_no, l.serial_no,
              l.qty_in, l.qty_out, l.unit_cost, l.selling_price,
              l.stock_value, l.remarks, l.created_by, l.reversal_of
       FROM t_stock_ledger l
       LEFT JOIN m_item_master i ON i.id = l.item_id
       LEFT JOIN m_warehouse w ON w.id = l.warehouse_id
       LEFT JOIN m_item_batch b ON b.id = l.batch_id
       WHERE ${whereClause.join(' AND ')}
         AND l.ledger_date BETWEEN :start AND :end
       ORDER BY l.ledger_date, l.id`,
      {
        replacements: { item_id, warehouse_id, start: `${fromDate} 00:00:00`, end: `${toDate} 23:59:59` },
        type: db.Sequelize.QueryTypes.SELECT,
      }
    );

    let running = round2(opening?.opening_qty);
    let runningValue = round2(opening?.opening_value);
    const ledger = rows.map((r) => {
      const qtyIn = Number(r.qty_in || 0);
      const qtyOut = Number(r.qty_out || 0);
      running += qtyIn - qtyOut;
      runningValue += Number(r.stock_value || 0);
      return { ...r, qty_in: qtyIn, qty_out: qtyOut, balance_qty: round2(running), balance_value: round2(runningValue) };
    });

    const closing = round2(running);
    const totalIn = round2(rows.reduce((s, r) => s + Number(r.qty_in || 0), 0));
    const totalOut = round2(rows.reduce((s, r) => s + Number(r.qty_out || 0), 0));

    res.json({
      item_id,
      from_date: fromDate,
      to_date: toDate,
      opening_qty: round2(opening?.opening_qty),
      opening_value: round2(opening?.opening_value),
      total_inward: totalIn,
      total_outward: totalOut,
      closing_qty: closing,
      ledger,
    });
  } catch (err) {
    console.error('Error stock statement:', err);
    res.status(500).json({ error: 'Failed to fetch stock statement' });
  }
};

// ── Inventory Valuation as of any date (ledger-driven, never current stock) ──
exports.getValuation = async (req, res) => {
  try {
    const { as_of, group_id, zero_stock } = req.query;
    const end = as_of ? `${as_of} 23:59:59` : `${today()} 23:59:59`;
    const sql = `
      WITH bal AS (
        SELECT l.item_id, COALESCE(SUM(l.qty_in), 0) - COALESCE(SUM(l.qty_out), 0) AS on_hand
        FROM t_stock_ledger l
        WHERE l.ledger_date <= :end
        GROUP BY l.item_id
      )
      SELECT i.id, i.item_code, i.item_name, g.name AS group_name, sg.name AS subgroup_name,
             u.short_name AS unit, i.min_stock, i.reorder_level, i.max_stock,
             COALESCE(bal.on_hand, 0) AS on_hand,
             COALESCE(NULLIF(i.moving_average_cost, 0), i.standard_cost, 0) AS unit_cost,
             COALESCE(bal.on_hand, 0) * COALESCE(NULLIF(i.moving_average_cost, 0), i.standard_cost, 0) AS stock_value
      FROM m_item_master i
      LEFT JOIN bal ON bal.item_id = i.id
      LEFT JOIN m_item_group g ON g.id = i.group_id
      LEFT JOIN m_item_subgroup sg ON sg.id = i.subgroup_id
      LEFT JOIN m_unit u ON u.id = i.unit_id
      WHERE i.is_active = true
        ${group_id ? 'AND i.group_id = :group_id' : ''}
        ${zero_stock !== '1' ? 'AND COALESCE(bal.on_hand, 0) > 0' : ''}
      ORDER BY stock_value DESC
    `;
    const rows = await db.sequelize.query(sql, { replacements: { end, group_id }, type: db.Sequelize.QueryTypes.SELECT });
    const totalValue = rows.reduce((s, r) => s + Number(r.stock_value || 0), 0);
    res.json({ as_of: as_of || today(), items: rows, total_value: round2(totalValue) });
  } catch (err) {
    console.error('Error valuation as-of:', err);
    res.status(500).json({ error: 'Failed to fetch inventory valuation' });
  }
};

// ── Full Stock Ledger (all required columns + running balance) ────────
exports.getStockLedger = async (req, res) => {
  try {
    const { item_id, warehouse_id, from, to } = req.query;
    const whereClause = ['1=1'];
    const repl = {};
    if (item_id) { whereClause.push('l.item_id = :item_id'); repl.item_id = item_id; }
    if (warehouse_id) { whereClause.push('l.warehouse_id = :warehouse_id'); repl.warehouse_id = warehouse_id; }
    if (from) { whereClause.push('l.ledger_date >= :from'); repl.from = `${from} 00:00:00`; }
    if (to) { whereClause.push('l.ledger_date <= :to'); repl.to = `${to} 23:59:59`; }

    const rows = await db.sequelize.query(
      `SELECT l.id, l.ledger_date, TO_CHAR(l.ledger_date, 'HH24:MI') AS ledger_time,
              l.doc_no, l.ref_type, l.ref_no, l.reference,
              l.warehouse_id, w.warehouse_name,
              l.item_id, i.item_code, i.item_name, u.short_name AS unit,
              l.batch_id, b.batch_no, l.serial_no,
              l.qty_in, l.qty_out, l.unit_cost, l.selling_price, l.stock_value,
              l.remarks, l.created_by, l.reversal_of, l.created_date
       FROM t_stock_ledger l
       LEFT JOIN m_item_master i ON i.id = l.item_id
       LEFT JOIN m_unit u ON u.id = i.unit_id
       LEFT JOIN m_warehouse w ON w.id = l.warehouse_id
       LEFT JOIN m_item_batch b ON b.id = l.batch_id
       WHERE ${whereClause.join(' AND ')}
       ORDER BY l.ledger_date, l.id`,
      { replacements: repl, type: db.Sequelize.QueryTypes.SELECT }
    );

    // Opening balance (before the window) for accurate running balance
    let opening = 0;
    if (item_id) {
      const preClauses = ['item_id = :item_id'];
      const preRepl = { item_id, start: (from ? `${from} 00:00:00` : '1900-01-01 00:00:00') };
      if (warehouse_id) { preClauses.push('warehouse_id = :warehouse_id'); preRepl.warehouse_id = warehouse_id; }
      const [o] = await db.sequelize.query(
        `SELECT COALESCE(SUM(qty_in) - SUM(qty_out), 0) AS op FROM t_stock_ledger
         WHERE ${preClauses.join(' AND ')} AND ledger_date < :start`,
        { replacements: preRepl, type: db.Sequelize.QueryTypes.SELECT }
      );
      opening = round2(o?.op || 0);
    }

    let running = opening;
    const ledger = rows.map((r) => {
      running += Number(r.qty_in || 0) - Number(r.qty_out || 0);
      return { ...r, qty_in: Number(r.qty_in || 0), qty_out: Number(r.qty_out || 0), balance_qty: round2(running) };
    });

    const items = await db.ItemMaster.findAll({
      attributes: ['id', 'item_code', 'item_name'],
      include: [{ model: db.Unit, as: 'unit', attributes: ['name', 'short_name'] }],
      order: [['item_code', 'ASC']],
    });
    const warehouses = await db.Warehouse.findAll({ where: { is_active: true }, order: [['warehouse_code', 'ASC']] });

    res.json({ ledger, items, warehouses, opening_balance: opening });
  } catch (err) {
    console.error('Error full stock ledger:', err);
    res.status(500).json({ error: 'Failed to fetch stock ledger' });
  }
};

// ── Stock Aging ────────────────────────────────────────────────────────
exports.getStockAging = async (req, res) => {
  try {
    const { bucket_days } = req.query;
    const bucket = Number(bucket_days) || 30;
    const rows = await db.sequelize.query(
      `WITH last_in AS (
         SELECT l.item_id, MAX(l.ledger_date) AS last_inward
         FROM t_stock_ledger l WHERE l.reversal_of IS NULL AND l.qty_in > 0
         GROUP BY l.item_id
       ),
       bal AS (
         SELECT l.item_id, COALESCE(SUM(l.qty_in), 0) - COALESCE(SUM(l.qty_out), 0) AS on_hand
         FROM t_stock_ledger l GROUP BY l.item_id
       )
       SELECT i.id, i.item_code, i.item_name, g.name AS group_name, u.short_name AS unit,
              COALESCE(bal.on_hand, 0) AS on_hand,
              li.last_inward,
              COALESCE(EXTRACT(DAY FROM NOW() - li.last_inward), 99999)::int AS age_days
       FROM m_item_master i
       LEFT JOIN last_in li ON li.item_id = i.id
       LEFT JOIN bal ON bal.item_id = i.id
       LEFT JOIN m_item_group g ON g.id = i.group_id
       LEFT JOIN m_unit u ON u.id = i.unit_id
       WHERE i.is_active = true AND COALESCE(bal.on_hand, 0) > 0
       ORDER BY age_days DESC`,
      { type: db.Sequelize.QueryTypes.SELECT }
    );

    const buckets = {};
    const ages = [0, bucket, 2 * bucket, 3 * bucket, 6 * bucket, Infinity];
    const labels = ['0-30', '31-60', '61-90', '91-180', '180+'];
    rows.forEach((r) => {
      const d = Number(r.age_days);
      let idx = ages.findIndex((a) => d < a);
      if (idx === -1) idx = ages.length - 1;
      const label = idx < labels.length ? labels[idx] : labels[labels.length - 1];
      if (!buckets[label]) buckets[label] = { label, items: 0, qty: 0, value: 0 };
      buckets[label].items += 1;
      buckets[label].qty += Number(r.on_hand || 0);
    });

    res.json({ bucket_days: bucket, buckets: Object.values(buckets), items: rows });
  } catch (err) {
    console.error('Error stock aging:', err);
    res.status(500).json({ error: 'Failed to fetch stock aging' });
  }
};

// ── Slow / Fast moving items ──────────────────────────────────────────
async function movingItems(req, mode) {
  const { months } = req.query;
  const monthsNum = Number(months) || 3;
  const from = new Date();
  from.setMonth(from.getMonth() - monthsNum);
  const fromStr = from.toISOString().slice(0, 10);
  const days = Math.max(1, Math.round((Date.now() - new Date(fromStr).getTime()) / 864e5));

  const rows = await db.sequelize.query(
    `WITH out_mov AS (
       SELECT l.item_id, COALESCE(SUM(l.qty_out), 0) AS issued_qty
       FROM t_stock_ledger l
       WHERE l.reversal_of IS NULL AND l.ledger_date >= :from
       GROUP BY l.item_id
     ),
     bal AS (
       SELECT l.item_id, COALESCE(SUM(l.qty_in), 0) - COALESCE(SUM(l.qty_out), 0) AS on_hand
       FROM t_stock_ledger l GROUP BY l.item_id
     )
     SELECT i.id, i.item_code, i.item_name, g.name AS group_name, u.short_name AS unit,
            COALESCE(out_mov.issued_qty, 0) AS issued_qty,
            COALESCE(bal.on_hand, 0) AS on_hand,
            COALESCE(NULLIF(i.moving_average_cost,0), i.standard_cost, 0) AS unit_cost
     FROM m_item_master i
     LEFT JOIN out_mov ON out_mov.item_id = i.id
     LEFT JOIN bal ON bal.item_id = i.id
     LEFT JOIN m_item_group g ON g.id = i.group_id
     LEFT JOIN m_unit u ON u.id = i.unit_id
     WHERE i.is_active = true
     ORDER BY issued_qty DESC`,
    { replacements: { from: `${fromStr} 00:00:00` }, type: db.Sequelize.QueryTypes.SELECT }
  );

  const items = rows.map((r) => {
    const issued = Number(r.issued_qty || 0);
    const onHand = Number(r.on_hand || 0);
    const dailyUsage = issued / days;
    const daysOfSupply = dailyUsage > 0 ? Math.round(onHand / dailyUsage) : 99999;
    return { ...r, issued_qty: issued, on_hand: onHand, days_of_supply: daysOfSupply, daily_usage: round2(dailyUsage) };
  });

  if (mode === 'slow') {
    const result = items.filter((x) => x.on_hand > 0 && x.days_of_supply >= 60).sort((a, b) => b.days_of_supply - a.days_of_supply);
    return { months: monthsNum, days, items: result };
  }
  const result = items.filter((x) => x.issued_qty > 0).sort((a, b) => b.daily_usage - a.daily_usage).slice(0, 50);
  return { months: monthsNum, days, items: result };
}

exports.getSlowMoving = async (req, res) => {
  try {
    res.json(await movingItems(req, 'slow'));
  } catch (err) {
    console.error('Error slow moving:', err);
    res.status(500).json({ error: 'Failed to fetch slow moving items' });
  }
};

exports.getFastMoving = async (req, res) => {
  try {
    res.json(await movingItems(req, 'fast'));
  } catch (err) {
    console.error('Error fast moving:', err);
    res.status(500).json({ error: 'Failed to fetch fast moving items' });
  }
};

// ── Negative Stock Report ─────────────────────────────────────────────
exports.getNegativeStock = async (req, res) => {
  try {
    const rows = await db.sequelize.query(
      `WITH bal AS (
         SELECT l.item_id, COALESCE(SUM(l.qty_in), 0) - COALESCE(SUM(l.qty_out), 0) AS on_hand
         FROM t_stock_ledger l GROUP BY l.item_id
       )
       SELECT i.id, i.item_code, i.item_name, g.name AS group_name, u.short_name AS unit,
              COALESCE(bal.on_hand, 0) AS on_hand, i.current_stock, i.reorder_level
       FROM m_item_master i
       LEFT JOIN bal ON bal.item_id = i.id
       LEFT JOIN m_item_group g ON g.id = i.group_id
       LEFT JOIN m_unit u ON u.id = i.unit_id
       WHERE i.is_active = true AND COALESCE(bal.on_hand, 0) < 0
       ORDER BY on_hand ASC`,
      { type: db.Sequelize.QueryTypes.SELECT }
    );
    res.json(rows);
  } catch (err) {
    console.error('Error negative stock:', err);
    res.status(500).json({ error: 'Failed to fetch negative stock' });
  }
};

// ── Dead Stock (no movement for N days) ───────────────────────────────
exports.getDeadStock = async (req, res) => {
  try {
    const { days } = req.query;
    const idle = Number(days) || 90;
    const rows = await db.sequelize.query(
      `WITH last_mov AS (
         SELECT l.item_id, MAX(l.ledger_date) AS last_move
         FROM t_stock_ledger l WHERE l.reversal_of IS NULL
         GROUP BY l.item_id
       ),
       bal AS (
         SELECT l.item_id, COALESCE(SUM(l.qty_in), 0) - COALESCE(SUM(l.qty_out), 0) AS on_hand
         FROM t_stock_ledger l GROUP BY l.item_id
       )
       SELECT i.id, i.item_code, i.item_name, g.name AS group_name, u.short_name AS unit,
              COALESCE(bal.on_hand, 0) AS on_hand,
              COALESCE(NULLIF(i.moving_average_cost,0), i.standard_cost, 0) AS unit_cost,
              COALESCE(bal.on_hand, 0) * COALESCE(NULLIF(i.moving_average_cost,0), i.standard_cost, 0) AS stock_value,
              lm.last_move,
              COALESCE(EXTRACT(DAY FROM NOW() - COALESCE(lm.last_move, i.created_date)), 99999)::int AS idle_days
       FROM m_item_master i
       LEFT JOIN last_mov lm ON lm.item_id = i.id
       LEFT JOIN bal ON bal.item_id = i.id
       LEFT JOIN m_item_group g ON g.id = i.group_id
       LEFT JOIN m_unit u ON u.id = i.unit_id
       WHERE i.is_active = true AND COALESCE(bal.on_hand, 0) > 0
         AND COALESCE(EXTRACT(DAY FROM NOW() - COALESCE(lm.last_move, i.created_date)), 99999)::int > :idle
       ORDER BY idle_days DESC`,
      { replacements: { idle }, type: db.Sequelize.QueryTypes.SELECT }
    );
    const totalValue = rows.reduce((s, r) => s + Number(r.stock_value || 0), 0);
    res.json({ days: idle, total_value: round2(totalValue), items: rows });
  } catch (err) {
    console.error('Error dead stock:', err);
    res.status(500).json({ error: 'Failed to fetch dead stock' });
  }
};

// ── Batch Report ──────────────────────────────────────────────────────
exports.getBatchReport = async (req, res) => {
  try {
    const { item_id, active_only } = req.query;
    const where = ['1=1'];
    const repl = {};
    if (item_id) { where.push('b.item_id = :item_id'); repl.item_id = item_id; }
    if (active_only !== '0') where.push('b.is_active = true');
    const rows = await db.sequelize.query(
      `SELECT b.id, b.item_id, b.batch_no, b.quantity, b.mfg_date, b.exp_date, b.is_active,
              i.item_code, i.item_name, u.short_name AS unit
       FROM m_item_batch b
       LEFT JOIN m_item_master i ON i.id = b.item_id
       LEFT JOIN m_unit u ON u.id = i.unit_id
       WHERE ${where.join(' AND ')}
       ORDER BY b.exp_date NULLS LAST, b.batch_no`,
      { replacements: repl, type: db.Sequelize.QueryTypes.SELECT }
    );
    res.json(rows);
  } catch (err) {
    console.error('Error batch report:', err);
    res.status(500).json({ error: 'Failed to fetch batch report' });
  }
};

// ── Stock Adjustment Report (audits + manual adjustments) ─────────────
exports.getAdjustmentReport = async (req, res) => {
  try {
    const { from, to } = req.query;
    const rows = await db.sequelize.query(
      `SELECT l.id, l.ledger_date, l.doc_no, l.ref_type, l.ref_no, l.reference,
              l.item_id, i.item_code, i.item_name, w.warehouse_name,
              l.qty_in, l.qty_out, l.unit_cost, l.stock_value, l.remarks, l.created_by
       FROM t_stock_ledger l
       LEFT JOIN m_item_master i ON i.id = l.item_id
       LEFT JOIN m_warehouse w ON w.id = l.warehouse_id
       WHERE l.ref_type = 'Stock Adjustment'
         AND l.reversal_of IS NULL
         AND l.ledger_date BETWEEN :from AND :to
       ORDER BY l.ledger_date DESC, l.id`,
      {
        replacements: { from: `${from || '1900-01-01'} 00:00:00`, to: `${to || today()} 23:59:59` },
        type: db.Sequelize.QueryTypes.SELECT,
      }
    );
    res.json(rows);
  } catch (err) {
    console.error('Error adjustment report:', err);
    res.status(500).json({ error: 'Failed to fetch adjustment report' });
  }
};

// ── Item Profit / Loss (sales revenue - COGS per item) ────────────────
exports.getProfitLoss = async (req, res) => {
  try {
    const { from, to } = req.query;
    const fromDate = from || '1900-01-01';
    const toDate = to || today();
    const rows = await db.sequelize.query(
      `SELECT l.item_id, i.item_code, i.item_name, g.name AS group_name, u.short_name AS unit,
              SUM(l.qty_out) AS sold_qty,
              SUM(l.qty_out * l.selling_price) AS sales_value,
              SUM(l.qty_out * l.unit_cost) AS cogs_value
       FROM t_stock_ledger l
       LEFT JOIN m_item_master i ON i.id = l.item_id
       LEFT JOIN m_item_group g ON g.id = i.group_id
       LEFT JOIN m_unit u ON u.id = i.unit_id
       WHERE l.ref_type IN ('Sales', 'Delivery Challan', 'DC Return')
         AND l.reversal_of IS NULL
         AND l.ledger_date BETWEEN :from AND :to
       GROUP BY l.item_id, i.item_code, i.item_name, g.name, u.short_name
       ORDER BY (SUM(l.qty_out * l.selling_price) - SUM(l.qty_out * l.unit_cost)) DESC`,
      { replacements: { from: `${fromDate} 00:00:00`, to: `${toDate} 23:59:59` }, type: db.Sequelize.QueryTypes.SELECT }
    );
    const items = rows.map((r) => ({
      ...r,
      sold_qty: Number(r.sold_qty || 0),
      sales_value: round2(r.sales_value),
      cogs_value: round2(r.cogs_value),
      gross_profit: round2(Number(r.sales_value || 0) - Number(r.cogs_value || 0)),
    }));
    const totals = items.reduce(
      (t, r) => {
        t.sales_value += r.sales_value;
        t.cogs_value += r.cogs_value;
        t.gross_profit += r.gross_profit;
        return t;
      },
      { sales_value: 0, cogs_value: 0, gross_profit: 0 }
    );
    res.json({ from: fromDate, to: toDate, items, totals: { ...totals, sales_value: round2(totals.sales_value), cogs_value: round2(totals.cogs_value), gross_profit: round2(totals.gross_profit) } });
  } catch (err) {
    console.error('Error item profit/loss:', err);
    res.status(500).json({ error: 'Failed to fetch item profit/loss' });
  }
};

// ── Audit Trail (who changed stock) ───────────────────────────────────
exports.getAuditTrail = async (req, res) => {
  try {
    const { from, to, item_id, user } = req.query;
    const where = ['l.reversal_of IS NULL'];
    const repl = {};
    if (from) { where.push('l.ledger_date >= :from'); repl.from = `${from} 00:00:00`; }
    if (to) { where.push('l.ledger_date <= :to'); repl.to = `${to} 23:59:59`; }
    if (item_id) { where.push('l.item_id = :item_id'); repl.item_id = item_id; }
    if (user) { where.push('l.created_by ILIKE :user'); repl.user = `%${user}%`; }
    const rows = await db.sequelize.query(
      `SELECT l.id, l.ledger_date, l.ref_type, l.doc_no, l.ref_no, l.remarks,
              l.item_id, i.item_code, i.item_name, w.warehouse_name,
              l.qty_in, l.qty_out, l.unit_cost, l.stock_value, l.created_by, l.reversal_of
       FROM t_stock_ledger l
       LEFT JOIN m_item_master i ON i.id = l.item_id
       LEFT JOIN m_warehouse w ON w.id = l.warehouse_id
       WHERE ${where.join(' AND ')}
       ORDER BY l.ledger_date DESC, l.id DESC`,
      { replacements: repl, type: db.Sequelize.QueryTypes.SELECT }
    );
    res.json(rows);
  } catch (err) {
    console.error('Error audit trail:', err);
    res.status(500).json({ error: 'Failed to fetch audit trail' });
  }
};

// ── Reconciliation: ledger on-hand vs ItemMaster.current_stock ────────
exports.getReconciliation = async (req, res) => {
  try {
    const rows = await db.sequelize.query(
      `WITH bal AS (
         SELECT l.item_id, COALESCE(SUM(l.qty_in), 0) - COALESCE(SUM(l.qty_out), 0) AS on_hand
         FROM t_stock_ledger l GROUP BY l.item_id
       )
       SELECT i.id, i.item_code, i.item_name, g.name AS group_name, u.short_name AS unit,
              COALESCE(bal.on_hand, 0) AS ledger_qty, i.current_stock,
              COALESCE(bal.on_hand, 0) - i.current_stock AS variance
       FROM m_item_master i
       LEFT JOIN bal ON bal.item_id = i.id
       LEFT JOIN m_item_group g ON g.id = i.group_id
       LEFT JOIN m_unit u ON u.id = i.unit_id
       WHERE i.is_active = true
       ORDER BY ABS(COALESCE(bal.on_hand, 0) - i.current_stock) DESC`,
      { type: db.Sequelize.QueryTypes.SELECT }
    );
    const mismatched = rows.filter((r) => Math.abs(Number(r.variance || 0)) > 0.001);
    res.json({ total_items: rows.length, mismatched_count: mismatched.length, mismatched });
  } catch (err) {
    console.error('Error reconciliation:', err);
    res.status(500).json({ error: 'Failed to fetch reconciliation' });
  }
};

// ── Warehouse-wise stock summary ──────────────────────────────────────
exports.getWarehouseWise = async (req, res) => {
  try {
    const { as_of } = req.query;
    const end = as_of ? `${as_of} 23:59:59` : `${today()} 23:59:59`;
    const rows = await db.sequelize.query(
      `SELECT w.id AS warehouse_id, w.warehouse_code, w.warehouse_name, w.location,
              COALESCE(SUM(l.qty_in), 0) AS qty_in,
              COALESCE(SUM(l.qty_out), 0) AS qty_out,
              COALESCE(SUM(l.qty_in) - SUM(l.qty_out), 0) AS on_hand_qty,
              COALESCE(SUM(l.stock_value), 0) AS stock_value,
              COUNT(DISTINCT l.item_id) AS item_count
       FROM m_warehouse w
       LEFT JOIN t_stock_ledger l ON l.warehouse_id = w.id AND l.ledger_date <= :end::timestamp
       WHERE w.is_active = true
       GROUP BY w.id, w.warehouse_code, w.warehouse_name, w.location
       ORDER BY w.warehouse_code`,
      { replacements: { end }, type: db.Sequelize.QueryTypes.SELECT }
    );
    const total = rows.reduce(
      (t, r) => {
        t.on_hand_qty += Number(r.on_hand_qty || 0);
        t.stock_value += Number(r.stock_value || 0);
        return t;
      },
      { on_hand_qty: 0, stock_value: 0 }
    );
    res.json({ as_of: as_of || today(), rows, total });
  } catch (err) {
    console.error('Error warehouse-wise stock:', err);
    res.status(500).json({ error: 'Failed to fetch warehouse-wise stock' });
  }
};
