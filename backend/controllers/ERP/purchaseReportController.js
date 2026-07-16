const { Op, Sequelize } = require('sequelize');
const db = require('../../models/ERP');

const PO = db.PurchaseOrder;
const PR = db.PurchaseRequisition;
const GRN = db.GRN;
const Supplier = db.SupplierMaster;

// ── Small query helpers ───────────────────────────────────────────────
function buildWhere(clauses, replacements) {
  return clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
}

function addFilter(clauses, replacements, field, value, operator = '=') {
  if (value === undefined || value === null || value === '') return;
  const key = `f${Object.keys(replacements).length}`;
  clauses.push(`${field} ${operator} :${key}`);
  replacements[key] = value;
}

function addLike(clauses, replacements, field, value) {
  if (value === undefined || value === null || value === '') return;
  const key = `f${Object.keys(replacements).length}`;
  clauses.push(`${field} ILIKE :${key}`);
  replacements[key] = `%${value}%`;
}

function addDateRange(clauses, replacements, field, from, to) {
  if (from) {
    clauses.push(`${field} >= :from`);
    replacements.from = from;
  }
  if (to) {
    clauses.push(`${field} <= :to`);
    replacements.to = to;
  }
}

// ── Purchase Register (one row per PO) ────────────────────────────────
exports.getPurchaseRegister = async (req, res) => {
  try {
    const { from, to, supplier_id, status, search } = req.query;
    const clauses = [];
    const replacements = {};
    addDateRange(clauses, replacements, 'po.po_date', from, to);
    addFilter(clauses, replacements, 'po.supplier_id', supplier_id);
    addFilter(clauses, replacements, 'po.status', status);
    addLike(clauses, replacements, 'po.po_no', search);
    const where = buildWhere(clauses, replacements);

    const sql = `
      SELECT po.id, po.po_no, po.po_date, po.status, po.currency,
             po.grand_total, po.payment_terms,
             s.supplier_code, s.supplier_name, s.city,
             COUNT(poi.id) AS line_items,
             COALESCE(SUM(poi.received_quantity), 0) AS total_received,
             COALESCE(SUM(poi.quantity), 0) AS total_ordered
      FROM t_purchase_order po
      LEFT JOIN m_party_master s ON s.id = po.supplier_id
      LEFT JOIN t_purchase_order_item poi ON poi.po_id = po.id
      ${where}
      GROUP BY po.id, po.po_no, po.po_date, po.status, po.currency,
               po.grand_total, po.payment_terms, s.supplier_code,
               s.supplier_name, s.city
      ORDER BY po.po_date DESC
    `;
    const rows = await db.sequelize.query(sql, {
      replacements,
      type: Sequelize.QueryTypes.SELECT,
    });
    res.json(rows);
  } catch (err) {
    console.error('Error purchase register:', err);
    res.status(500).json({ error: 'Failed to fetch purchase register' });
  }
};

// ── Vendor Spend Analysis ─────────────────────────────────────────────
exports.getVendorSpend = async (req, res) => {
  try {
    const { from, to, limit } = req.query;
    const clauses = [];
    const replacements = {};
    addDateRange(clauses, replacements, 'po.po_date', from, to);
    const where = buildWhere(clauses, replacements);

    const sql = `
      SELECT s.id AS supplier_id, s.supplier_code, s.supplier_name, s.city, s.state,
             COUNT(DISTINCT po.id) AS po_count,
             COALESCE(SUM(po.grand_total), 0) AS po_value,
             COUNT(DISTINCT grn.id) AS grn_count,
             COALESCE(SUM(gi.amount), 0) AS received_value
      FROM m_party_master s
      LEFT JOIN t_purchase_order po ON po.supplier_id = s.id ${where.replace(/^WHERE/, 'AND')}
      LEFT JOIN t_ir grn ON grn.supplier_id = s.id
      LEFT JOIN t_ir_item gi ON gi.grn_id = grn.id
      WHERE s.party_type = 'Supplier'
      GROUP BY s.id, s.supplier_code, s.supplier_name, s.city, s.state
      ORDER BY po_value DESC
      ${limit ? 'LIMIT :limit' : ''}
    `;
    if (limit) replacements.limit = parseInt(limit, 10);
    const rows = await db.sequelize.query(sql, {
      replacements,
      type: Sequelize.QueryTypes.SELECT,
    });
    res.json(rows);
  } catch (err) {
    console.error('Error vendor spend:', err);
    res.status(500).json({ error: 'Failed to fetch vendor spend' });
  }
};

// ── Monthly PO Trend (value + count) ─────────────────────────────────
exports.getMonthlyTrend = async (req, res) => {
  try {
    const { from, to } = req.query;
    const clauses = [];
    const replacements = {};
    addDateRange(clauses, replacements, 'po_date', from, to);
    const where = buildWhere(clauses, replacements);

    const sql = `
      SELECT TO_CHAR(po_date, 'YYYY-MM') AS month,
             COUNT(*) AS po_count,
             COALESCE(SUM(grand_total), 0) AS po_value
      FROM t_purchase_order
      ${where}
      GROUP BY month
      ORDER BY month
    `;
    const rows = await db.sequelize.query(sql, {
      replacements,
      type: Sequelize.QueryTypes.SELECT,
    });
    res.json(rows);
  } catch (err) {
    console.error('Error monthly trend:', err);
    res.status(500).json({ error: 'Failed to fetch monthly trend' });
  }
};

// ── GRN Receipt Summary by Supplier ──────────────────────────────────
exports.getGrnSummary = async (req, res) => {
  try {
    const { from, to, supplier_id } = req.query;
    const clauses = [];
    const replacements = {};
    addDateRange(clauses, replacements, 'grn.grn_date', from, to);
    addFilter(clauses, replacements, 'grn.supplier_id', supplier_id);
    const where = buildWhere(clauses, replacements);

    const sql = `
      SELECT s.supplier_code, s.supplier_name,
             COUNT(DISTINCT grn.id) AS grn_count,
             COALESCE(SUM(gi.accepted_qty), 0) AS accepted_qty,
             COALESCE(SUM(gi.rejected_qty), 0) AS rejected_qty,
             COALESCE(SUM(gi.amount), 0) AS grn_value
      FROM t_ir grn
      LEFT JOIN m_party_master s ON s.id = grn.supplier_id
      LEFT JOIN t_ir_item gi ON gi.grn_id = grn.id
      ${where}
      GROUP BY s.supplier_code, s.supplier_name
      ORDER BY grn_value DESC
    `;
    const rows = await db.sequelize.query(sql, {
      replacements,
      type: Sequelize.QueryTypes.SELECT,
    });
    res.json(rows);
  } catch (err) {
    console.error('Error GRN summary:', err);
    res.status(500).json({ error: 'Failed to fetch GRN summary' });
  }
};

// ── Recent Activity for Dashboard ────────────────────────────────────
exports.getRecentActivity = async (req, res) => {
  try {
    const [pos, grns, prs] = await Promise.all([
      PO.findAll({
        limit: 6,
        order: [['created_at', 'DESC']],
        include: [{ model: Supplier, as: 'supplier', attributes: ['supplier_name'] }],
        attributes: ['id', 'po_no', 'po_date', 'status', 'grand_total'],
      }),
      GRN.findAll({
        limit: 6,
        order: [['created_at', 'DESC']],
        include: [{ model: Supplier, as: 'supplier', attributes: ['supplier_name'] }],
        attributes: ['id', 'grn_no', 'grn_date', 'status', 'ir_type'],
      }),
      PR.findAll({
        limit: 6,
        order: [['created_at', 'DESC']],
        attributes: ['id', 'req_no', 'req_date', 'status', 'priority'],
      }),
    ]);
    res.json({ purchase_orders: pos, grns: grns, requisitions: prs });
  } catch (err) {
    console.error('Error recent activity:', err);
    res.status(500).json({ error: 'Failed to fetch recent activity' });
  }
};
