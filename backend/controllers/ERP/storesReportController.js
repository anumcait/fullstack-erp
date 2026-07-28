const { Sequelize } = require('sequelize');
const db = require('../../models/ERP');

function buildWhere(clauses) {
  return clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
}

function addFilter(clauses, field, value, operator = '=') {
  if (value === undefined || value === null || value === '') return;
  clauses.push(`${field} ${operator} ${value}`);
}

// ── Inventory Valuation (stock * cost) ───────────────────────────────
exports.getInventoryValuation = async (req, res) => {
  try {
    const { group_id, subgroup_id, zero_stock } = req.query;
    const clauses = ["i.is_active = true"];
    if (group_id) addFilter(clauses, 'i.group_id', group_id);
    if (subgroup_id) addFilter(clauses, 'i.subgroup_id', subgroup_id);
    if (zero_stock !== '1') clauses.push('i.current_stock > 0');
    const where = buildWhere(clauses);

    const sql = `
      SELECT i.id, i.item_code, i.item_name, i.current_stock,
             i.min_stock, i.reorder_level, i.max_stock,
             i.moving_average_cost, i.standard_cost, i.last_purchase_cost,
             COALESCE(NULLIF(i.moving_average_cost, 0), i.standard_cost, 0) AS unit_cost,
             (i.current_stock * COALESCE(NULLIF(i.moving_average_cost, 0), i.standard_cost, 0)) AS stock_value,
             g.name AS group_name, sg.name AS subgroup_name, u.short_name AS unit
      FROM m_item_master i
      LEFT JOIN m_item_group g ON g.id = i.group_id
      LEFT JOIN m_item_subgroup sg ON sg.id = i.subgroup_id
      LEFT JOIN m_unit u ON u.id = i.unit_id
      ${where}
      ORDER BY stock_value DESC
    `;
    const rows = await db.sequelize.query(sql, { type: Sequelize.QueryTypes.SELECT });
    const totalValue = rows.reduce((s, r) => s + parseFloat(r.stock_value || 0), 0);
    res.json({ items: rows, total_value: Number(totalValue.toFixed(2)) });
  } catch (err) {
    console.error('Error inventory valuation:', err);
    res.status(500).json({ error: 'Failed to fetch inventory valuation' });
  }
};

// ── Low Stock / Shortage Analysis ────────────────────────────────────
exports.getLowStock = async (req, res) => {
  try {
    const { level } = req.query; // 'reorder' | 'min'
    const threshold = level === 'min' ? 'i.min_stock' : 'i.reorder_level';
    const sql = `
      SELECT i.id, i.item_code, i.item_name, i.current_stock,
             i.min_stock, i.reorder_level, i.max_stock,
             (i.reorder_level - i.current_stock) AS shortfall,
             g.name AS group_name, u.short_name AS unit
      FROM m_item_master i
      LEFT JOIN m_item_group g ON g.id = i.group_id
      LEFT JOIN m_unit u ON u.id = i.unit_id
      WHERE i.is_active = true
        AND i.current_stock <= ${threshold}
      ORDER BY shortfall DESC
    `;
    const rows = await db.sequelize.query(sql, { type: Sequelize.QueryTypes.SELECT });
    res.json(rows);
  } catch (err) {
    console.error('Error low stock:', err);
    res.status(500).json({ error: 'Failed to fetch low stock report' });
  }
};

// ── Stock Movement (inward vs outward) for a date range ──────────────
exports.getStockMovement = async (req, res) => {
  try {
    const { from, to, group_id } = req.query;
    const fromDate = from || new Date(Date.now() - 30 * 864e5).toISOString().slice(0, 10);
    const toDate = to || new Date().toISOString().slice(0, 10);

    const inwardSql = `
      SELECT gi.item_id, i.item_code, i.item_name,
             COALESCE(SUM(gi.accepted_qty), 0) AS inward_qty,
             COALESCE(SUM(gi.amount), 0) AS inward_value
      FROM t_ir grn
      JOIN t_ir_item gi ON gi.grn_id = grn.id
      LEFT JOIN m_item_master i ON i.id = gi.item_id
      WHERE grn.grn_date BETWEEN :from AND :to
        AND grn.status = 'Received'
      GROUP BY gi.item_id, i.item_code, i.item_name
    `;
    const outwardSql = `
      SELECT ii.item_id, i.item_code, i.item_name,
             mi.issue_no, mi.issue_date,
             ii.quantity AS outward_qty,
             mi.issued_to, mi.department
      FROM t_material_issue mi
      JOIN t_material_issue_item ii ON ii.issue_id = mi.id
      LEFT JOIN m_item_master i ON i.id = ii.item_id
      WHERE mi.status = 'Issued'
        AND mi.issue_date BETWEEN :from AND :to
      ORDER BY mi.issue_date DESC
    `;

    const [inward, outward] = await Promise.all([
      db.sequelize.query(inwardSql, { replacements: { from: fromDate, to: toDate }, type: Sequelize.QueryTypes.SELECT }),
      db.sequelize.query(outwardSql, { replacements: { from: fromDate, to: toDate }, type: Sequelize.QueryTypes.SELECT }),
    ]);

    const map = {};
    inward.forEach((r) => {
      map[r.item_id] = {
        item_id: r.item_id,
        item_code: r.item_code,
        item_name: r.item_name,
        inward_qty: parseFloat(r.inward_qty || 0),
        inward_value: parseFloat(r.inward_value || 0),
        outward_qty: 0,
        outward_rows: [],
      };
    });
    outward.forEach((r) => {
      if (!map[r.item_id]) {
        map[r.item_id] = { item_id: r.item_id, item_code: r.item_code || '', item_name: r.item_name || '', inward_qty: 0, inward_value: 0, outward_qty: 0, outward_rows: [] };
      }
      const qty = parseFloat(r.outward_qty || 0);
      map[r.item_id].outward_qty += qty;
      map[r.item_id].outward_rows.push({
        issue_no: r.issue_no,
        issue_date: r.issue_date,
        outward_qty: qty,
        issued_to: r.issued_to,
        department: r.department,
      });
    });

    const rows = Object.values(map).sort((a, b) => b.inward_value - a.inward_value);
    const totals = rows.reduce(
      (t, r) => {
        t.inward_qty += r.inward_qty;
        t.inward_value += r.inward_value;
        t.outward_qty += r.outward_qty;
        return t;
      },
      { inward_qty: 0, inward_value: 0, outward_qty: 0 }
    );
    res.json({ from: fromDate, to: toDate, rows, totals });
  } catch (err) {
    console.error('Error stock movement:', err);
    res.status(500).json({ error: 'Failed to fetch stock movement' });
  }
};

// ── ABC Classification summary ──────────────────────────────────────
exports.getAbcSummary = async (req, res) => {
  try {
    const sql = `
      WITH valued AS (
        SELECT i.id, i.item_code, i.item_name,
               (i.current_stock * COALESCE(NULLIF(i.moving_average_cost,0), i.standard_cost, 0)) AS value
        FROM m_item_master i
        WHERE i.is_active = true AND i.current_stock > 0
      ),
      ranked AS (
        SELECT *, SUM(value) OVER () AS total_value,
               SUM(value) OVER (ORDER BY value DESC) AS cumulative
        FROM valued
      )
      SELECT
        CASE
          WHEN cumulative <= total_value * 0.8 THEN 'A'
          WHEN cumulative <= total_value * 0.95 THEN 'B'
          ELSE 'C'
        END AS class,
        COUNT(*) AS item_count,
        COALESCE(SUM(value), 0) AS class_value
      FROM ranked
      GROUP BY 1
      ORDER BY 1
    `;
    const rows = await db.sequelize.query(sql, { type: Sequelize.QueryTypes.SELECT });
    res.json(rows);
  } catch (err) {
    console.error('Error ABC summary:', err);
    res.status(500).json({ error: 'Failed to fetch ABC summary' });
  }
};
