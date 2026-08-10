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
      LEFT JOIN ir grn ON grn.supplier_id = s.id
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
    addDateRange(clauses, replacements, 'grn.ir_date', from, to);
    addFilter(clauses, replacements, 'grn.supplier_id', supplier_id);
    const where = buildWhere(clauses, replacements);

    const sql = `
      SELECT s.supplier_code, s.supplier_name,
             COUNT(DISTINCT grn.id) AS grn_count,
             COALESCE(SUM(gi.accepted_qty), 0) AS accepted_qty,
             COALESCE(SUM(gi.rejected_qty), 0) AS rejected_qty,
             COALESCE(SUM(gi.amount), 0) AS grn_value
      FROM ir grn
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
        order: [['created_date', 'DESC']],
        include: [{ model: Supplier, as: 'supplier', attributes: ['supplier_name'] }],
        attributes: ['id', 'po_no', 'po_date', 'status', 'grand_total'],
      }),
      GRN.findAll({
        limit: 6,
        order: [['created_date', 'DESC']],
        include: [{ model: Supplier, as: 'supplier', attributes: ['supplier_name'] }],
        attributes: ['id', 'ir_no', 'ir_date', 'status', 'ir_type'],
      }),
      PR.findAll({
        limit: 6,
        order: [['created_date', 'DESC']],
        attributes: ['id', 'req_no', 'req_date', 'status', 'priority'],
      }),
    ]);
    res.json({ purchase_orders: pos, grns: grns, requisitions: prs });
  } catch (err) {
    console.error('Error recent activity:', err);
    res.status(500).json({ error: 'Failed to fetch recent activity' });
  }
};

// ── Pending Purchase Requisitions (Approved, total received < total required) ──
exports.getPendingPRs = async (req, res) => {
  try {
    const rows = await db.sequelize.query(`
      SELECT pr.* FROM t_purchase_requisition pr
      WHERE pr.status = 'Approved'
      AND COALESCE((
        SELECT SUM(poi.received_quantity)
        FROM t_purchase_order po
        JOIN t_purchase_order_item poi ON poi.po_id = po.id
        WHERE po.requisition_id = pr.id
      ), 0) < (
        SELECT COALESCE(SUM(pri.quantity), 0)
        FROM t_purchase_requisition_item pri
        WHERE pri.requisition_id = pr.id
      )
      ORDER BY pr.req_date DESC
    `, { type: Sequelize.QueryTypes.SELECT });
    const ids = rows.map(r => r.id);
    if (ids.length) {
      const items = await db.PurchaseRequisitionItem.findAll({ where: { requisition_id: ids } });
      const grouped = {};
      items.forEach(it => { if (!grouped[it.requisition_id]) grouped[it.requisition_id] = []; grouped[it.requisition_id].push(it); });
      rows.forEach(r => r.items = grouped[r.id] || []);
    }
    res.json(rows);
  } catch (err) {
    console.error('Error pending PRs:', err);
    res.status(500).json({ error: 'Failed to fetch pending PRs' });
  }
};

// ── Pending Purchase Orders (Approved, material not yet received) ─────
exports.getPendingPOs = async (req, res) => {
  try {
    const clauses = ['po.status = :status'];
    const replacements = { status: 'Approved' };
    clauses.push(`EXISTS (
      SELECT 1 FROM t_purchase_order_item poi WHERE poi.po_id = po.id AND poi.received_quantity < poi.quantity
    )`);
    const where = clauses.length ? 'WHERE ' + clauses.join(' AND ') : '';
    const rows = await db.sequelize.query(`
      SELECT po.*, s.supplier_code, s.supplier_name
      FROM t_purchase_order po
      LEFT JOIN m_party_master s ON s.id = po.supplier_id
      ${where}
      ORDER BY po.po_date DESC
    `, { replacements, type: Sequelize.QueryTypes.SELECT });
    res.json(rows);
  } catch (err) {
    console.error('Error pending POs:', err);
    res.status(500).json({ error: 'Failed to fetch pending POs' });
  }
};

// ── Received Material Report (Goods Receipt lines, date-range) ───────
exports.getReceivedMaterial = async (req, res) => {
  try {
    const { from, to, supplier_id } = req.query;
    const clauses = [];
    const replacements = {};
    addDateRange(clauses, replacements, 'grn.ir_date', from, to);
    addFilter(clauses, replacements, 'grn.supplier_id', supplier_id);
    const where = buildWhere(clauses, replacements);

    const sql = `
      SELECT grn.ir_no, grn.ir_date, grn.ir_type, grn.approval_status,
             s.supplier_code, s.supplier_name,
              gi.item_code, im.item_name,
              gi.accepted_qty, gi.rejected_qty, gi.rate, gi.amount,
             grn.invoice_no
      FROM ir grn
      LEFT JOIN m_party_master s ON s.id = grn.supplier_id
      LEFT JOIN t_ir_item gi ON gi.grn_id = grn.id
      LEFT JOIN m_item_master im ON im.id = gi.item_id
      ${where}
      ORDER BY grn.ir_date DESC, grn.ir_no
    `;
    const rows = await db.sequelize.query(sql, { replacements, type: Sequelize.QueryTypes.SELECT });
    res.json(rows);
  } catch (err) {
    console.error('Error received material:', err);
    res.status(500).json({ error: 'Failed to fetch received material' });
  }
};

// ── PR Details Report (one PR with its lines) ────────────────────────
exports.getPRDetails = async (req, res) => {
  try {
    const { id } = req.query;
    const where = id ? { id } : {};
    const rows = await PR.findAll({
      where,
      order: [['req_date', 'DESC']],
      include: [{ model: db.PurchaseRequisitionItem, as: 'items' }],
    });
    res.json(rows);
  } catch (err) {
    console.error('Error PR details:', err);
    res.status(500).json({ error: 'Failed to fetch PR details' });
  }
};

// ── Raw Material Inspection Report (QA status of RM receipts) ────────
exports.getRawMaterialInspection = async (req, res) => {
  try {
    const { from, to } = req.query;
    const clauses = ['g.name = :rm'];
    const replacements = { rm: 'Raw Material' };
    addDateRange(clauses, replacements, 'grn.ir_date', from, to);
    const where = `WHERE ${clauses.join(' AND ')}`;

    const sql = `
      SELECT grn.ir_no, grn.ir_date, grn.qa_status, grn.qa_by, grn.qa_date,
             s.supplier_name, gi.item_code, im.item_name, gi.accepted_qty, gi.rejected_qty
      FROM ir grn
      JOIN t_ir_item gi ON gi.grn_id = grn.id
      JOIN m_item_master im ON im.id = gi.item_id
      JOIN m_item_group g ON g.id = im.group_id
      LEFT JOIN m_party_master s ON s.id = grn.supplier_id
      ${where}
      ORDER BY grn.ir_date DESC
    `;
    const rows = await db.sequelize.query(sql, { replacements, type: Sequelize.QueryTypes.SELECT });
    res.json(rows);
  } catch (err) {
    console.error('Error RM inspection:', err);
    res.status(500).json({ error: 'Failed to fetch RM inspection' });
  }
};

// ── Supplier Summary (with / without taxes) ──────────────────────────
// taxes=with  -> includes GST (po.grand_total)
// taxes=without -> excludes GST (sum of item amounts)
// raw=1 -> restrict to raw-material items only
exports.getSupplierSummary = async (req, res) => {
  try {
    const { taxes = 'with', raw = '0', from, to } = req.query;
    const clauses = ['po.po_date IS NOT NULL'];
    const replacements = {};
    addDateRange(clauses, replacements, 'po.po_date', from, to);
    if (raw === '1') clauses.push('g.name = :rm');
    if (raw === '1') replacements.rm = 'Raw Material';
    const where = `WHERE ${clauses.join(' AND ')}`;

    const valueExpr = taxes === 'without'
      ? 'COALESCE(SUM(poi.amount), 0)'
      : 'COALESCE(SUM(poi.total), 0)';

    const joinGroup = raw === '1'
      ? 'JOIN m_item_master im ON im.id = poi.item_id JOIN m_item_group g ON g.id = im.group_id'
      : '';

    const sql = `
      SELECT s.id AS supplier_id, s.supplier_code, s.supplier_name, s.city, s.state,
             COUNT(DISTINCT po.id) AS po_count,
             ${valueExpr} AS total_value
      FROM t_purchase_order po
      JOIN m_party_master s ON s.id = po.supplier_id
      LEFT JOIN t_purchase_order_item poi ON poi.po_id = po.id ${joinGroup}
      ${where}
      GROUP BY s.id, s.supplier_code, s.supplier_name, s.city, s.state
      ORDER BY total_value DESC
    `;
    const rows = await db.sequelize.query(sql, { replacements, type: Sequelize.QueryTypes.SELECT });
    res.json(rows);
  } catch (err) {
    console.error('Error supplier summary:', err);
    res.status(500).json({ error: 'Failed to fetch supplier summary' });
  }
};

// ── Raw Material Purchase Report (RM item receipts, date-range) ──────
exports.getRawMaterialPurchase = async (req, res) => {
  try {
    const { from, to, supplier_id } = req.query;
    const clauses = ['g.name = :rm'];
    const replacements = { rm: 'Raw Material' };
    addDateRange(clauses, replacements, 'grn.ir_date', from, to);
    addFilter(clauses, replacements, 'grn.supplier_id', supplier_id);
    const where = `WHERE ${clauses.join(' AND ')}`;

    const sql = `
      SELECT grn.ir_no, grn.ir_date, s.supplier_name,
              gi.item_code, im.item_name, gi.accepted_qty, gi.rate, gi.amount
      FROM ir grn
      JOIN t_ir_item gi ON gi.grn_id = grn.id
      JOIN m_item_master im ON im.id = gi.item_id
      JOIN m_item_group g ON g.id = im.group_id
      LEFT JOIN m_party_master s ON s.id = grn.supplier_id
      ${where}
      ORDER BY grn.ir_date DESC
    `;
    const rows = await db.sequelize.query(sql, { replacements, type: Sequelize.QueryTypes.SELECT });
    res.json(rows);
  } catch (err) {
    console.error('Error RM purchase:', err);
    res.status(500).json({ error: 'Failed to fetch RM purchase' });
  }
};

// ── Item Information Report ──────────────────────────────────────────
exports.getItemInformation = async (req, res) => {
  try {
    const { group_id, search } = req.query;
    const where = {};
    if (group_id) where.group_id = group_id;
    if (search) where[Op.or] = [{ item_code: { [Op.iLike]: `%${search}%` } }, { item_name: { [Op.iLike]: `%${search}%` } }];
    const rows = await db.ItemMaster.findAll({
      where,
      attributes: ['id', 'item_code', 'item_name', 'hsn_code', 'gst_rate', 'current_stock', 'standard_cost', 'moving_average_cost', 'valuation_method', 'abc_class'],
      include: [
        { model: db.ItemGroup, as: 'group', attributes: ['name'] },
        { model: db.Unit, as: 'unit', attributes: ['short_name'] },
      ],
      order: [['item_code', 'ASC']],
      limit: 500,
    });
    res.json(rows);
  } catch (err) {
    console.error('Error item information:', err);
    res.status(500).json({ error: 'Failed to fetch item information' });
  }
};

// ── Party (Vendor) Master Report ─────────────────────────────────────
exports.getPartyMaster = async (req, res) => {
  try {
    const rows = await Supplier.findAll({
      attributes: ['id', 'supplier_code', 'supplier_name', 'gstin', 'city', 'state', 'payment_terms', 'is_active'],
      order: [['supplier_name', 'ASC']],
    });
    res.json(rows);
  } catch (err) {
    console.error('Error party master:', err);
    res.status(500).json({ error: 'Failed to fetch party master' });
  }
};

// ── Supplier Rating Report ───────────────────────────────────────────
exports.getSupplierRatingReport = async (req, res) => {
  try {
    const sql = `
      SELECT s.supplier_code, s.supplier_name,
             COUNT(r.id) AS ratings,
             COALESCE(AVG(r.quality_score), 0) AS avg_quality,
             COALESCE(AVG(r.delivery_score), 0) AS avg_delivery,
             COALESCE(AVG(r.price_score), 0) AS avg_price,
             COALESCE(AVG((r.quality_score + r.delivery_score + r.price_score) / 3.0), 0) AS overall
       FROM m_party_master s
       LEFT JOIN t_vendor_rating r ON r.supplier_id = s.id
       WHERE s.party_type = 'Supplier'
       GROUP BY s.supplier_code, s.supplier_name
       ORDER BY overall DESC
    `;
    const rows = await db.sequelize.query(sql, { type: Sequelize.QueryTypes.SELECT });
    res.json(rows);
  } catch (err) {
    console.error('Error supplier rating report:', err);
    res.status(500).json({ error: 'Failed to fetch supplier rating report' });
  }
};

// ── PO Daily Matrix (supplier × date pivot) ──────────────────────────
exports.getPOMatrix = async (req, res) => {
  try {
    const { from, to, supplier_id } = req.query;
    const clauses = ["po.status NOT IN ('Draft', 'Cancelled')"];
    const replacements = {};
    const addRange = (field) => {
      if (from) { clauses.push(`${field} >= :from`); replacements.from = from; }
      if (to) { clauses.push(`${field} <= :to`); replacements.to = to; }
    };
    addRange('po.po_date');
    if (supplier_id) { clauses.push('po.supplier_id = :sid'); replacements.sid = supplier_id; }
    const where = `WHERE ${clauses.join(' AND ')}`;

    const sql = `
      SELECT s.id AS supplier_id, s.supplier_name, po.po_date, COALESCE(SUM(po.grand_total), 0) AS amount
      FROM t_purchase_order po
      JOIN m_party_master s ON s.id = po.supplier_id
      ${where}
      GROUP BY s.id, s.supplier_name, po.po_date
      ORDER BY s.supplier_name, po.po_date
    `;
    const rows = await db.sequelize.query(sql, {
      replacements,
      type: Sequelize.QueryTypes.SELECT,
    });
    res.json(rows);
  } catch (err) {
    console.error('Error PO matrix:', err);
    res.status(500).json({ error: 'Failed to fetch PO matrix' });
  }
};

exports.getPOMatrixDetail = async (req, res) => {
  try {
    const { supplier_id, date, from, to } = req.query;
    if (!supplier_id) return res.status(400).json({ error: 'supplier_id required' });

    let dateClause = '';
    const replacements = { supplier_id: Number(supplier_id) };
    if (date) {
      dateClause = 'AND po.po_date::date = :date';
      replacements.date = date.trim();
    } else if (from && to) {
      dateClause = 'AND po.po_date::date BETWEEN :from AND :to';
      replacements.from = from;
      replacements.to = to;
    }

    const poSql = `
      SELECT po.id, po.po_no, po.po_date, s.supplier_name, po.status,
             po.grand_total, po.currency, po.subtotal, po.discount_percent,
             po.discount_amount, po.tax_amount, po.payment_terms, po.delivery_terms,
             po.notes, po.req_date, po.created_date
      FROM t_purchase_order po
      JOIN m_party_master s ON s.id = po.supplier_id
      WHERE po.supplier_id = :supplier_id ${dateClause}
      ORDER BY po.po_no
    `;
    const pos = await db.sequelize.query(poSql, {
      replacements,
      type: Sequelize.QueryTypes.SELECT,
    });
    const poIds = pos.map((p) => p.id);
    let items = [];
    if (poIds.length > 0) {
      const itemSql = `
         SELECT poi.po_id, poi.item_code, poi.item_name, poi.quantity AS qty, poi.rate,
               poi.disc_percent, poi.disc_inr AS discount_amount,
               poi.gst_rate, poi.gst_amount AS item_tax,
               poi.sgst_rate, poi.sgst_inr,
               poi.cgst_rate, poi.cgst_inr,
               poi.igst_rate, poi.igst_inr,
               poi.pf_percent, poi.pf_inr,
               poi.after_disc, poi.total_value
        FROM t_purchase_order_item poi
        WHERE poi.po_id IN (${poIds.join(',')})
        ORDER BY poi.id
      `;
      items = await db.sequelize.query(itemSql, {
        type: Sequelize.QueryTypes.SELECT,
      });
    }

    const itemsByPo = {};
    items.forEach((it) => {
      if (!itemsByPo[it.po_id]) itemsByPo[it.po_id] = [];
      itemsByPo[it.po_id].push(it);
    });

    const result = pos.map((po) => {
      const poItems = itemsByPo[po.id] || [];
      const taxBreakdown = poItems.reduce(
        (acc, it) => ({
          total_sgst: acc.total_sgst + Number(it.sgst_inr || 0),
          total_cgst: acc.total_cgst + Number(it.cgst_inr || 0),
          total_igst: acc.total_igst + Number(it.igst_inr || 0),
        }),
        { total_sgst: 0, total_cgst: 0, total_igst: 0 }
      );
      return {
        ...po,
        items: poItems,
        ...taxBreakdown,
      };
    });

    res.json(result);
  } catch (err) {
    console.error('Error PO matrix detail:', err);
    res.status(500).json({ error: 'Failed to fetch PO details' });
  }
};

exports.getPOMatrixMonth = async (req, res) => {
  try {
    const { from, to, supplier_id } = req.query;
    const clauses = ["po.status NOT IN ('Draft', 'Cancelled')"];
    const replacements = {};
    if (from) { clauses.push('po.po_date >= :from'); replacements.from = from; }
    if (to) { clauses.push('po.po_date <= :to'); replacements.to = to; }
    if (supplier_id) { clauses.push('po.supplier_id = :sid'); replacements.sid = supplier_id; }
    const where = `WHERE ${clauses.join(' AND ')}`;

    const sql = `
      SELECT s.id AS supplier_id, s.supplier_name,
             TO_CHAR(po.po_date, 'YYYY-MM') AS month,
             COALESCE(SUM(po.grand_total), 0) AS amount
      FROM t_purchase_order po
      JOIN m_party_master s ON s.id = po.supplier_id
      ${where}
      GROUP BY s.id, s.supplier_name, month
      ORDER BY s.supplier_name, month
    `;
    const rows = await db.sequelize.query(sql, {
      replacements,
      type: Sequelize.QueryTypes.SELECT,
    });
    res.json(rows);
  } catch (err) {
    console.error('Error PO monthly matrix:', err);
    res.status(500).json({ error: 'Failed to fetch PO monthly matrix' });
  }
};

exports.getPOMatrixYear = async (req, res) => {
  try {
    const { from, to, supplier_id } = req.query;
    const clauses = ["po.status NOT IN ('Draft', 'Cancelled')"];
    const replacements = {};
    if (from) { clauses.push('po.po_date >= :from'); replacements.from = from; }
    if (to) { clauses.push('po.po_date <= :to'); replacements.to = to; }
    if (supplier_id) { clauses.push('po.supplier_id = :sid'); replacements.sid = supplier_id; }
    const where = `WHERE ${clauses.join(' AND ')}`;

    const sql = `
      SELECT s.id AS supplier_id, s.supplier_name,
             TO_CHAR(po.po_date, 'YYYY') AS year,
             COALESCE(SUM(po.grand_total), 0) AS amount
      FROM t_purchase_order po
      JOIN m_party_master s ON s.id = po.supplier_id
      ${where}
      GROUP BY s.id, s.supplier_name, year
      ORDER BY s.supplier_name, year
    `;
    const rows = await db.sequelize.query(sql, {
      replacements,
      type: Sequelize.QueryTypes.SELECT,
    });
    res.json(rows);
  } catch (err) {
    console.error('Error PO yearly matrix:', err);
    res.status(500).json({ error: 'Failed to fetch PO yearly matrix' });
  }
};

// ── Pending Material by Party (open PO line items still to be received) ─
exports.getPendingMaterialByParty = async (req, res) => {
  try {
    const { supplier_id } = req.query;
    const clauses = [`po.status IN ('Draft', 'Pending', 'Approved')`, `(poi.quantity - COALESCE(poi.received_quantity, 0)) > 0`];
    const replacements = {};
    if (supplier_id) { clauses.push('po.supplier_id = :sid'); replacements.sid = supplier_id; }
    const where = `WHERE ${clauses.join(' AND ')}`;

    const sql = `
      SELECT s.supplier_code, s.supplier_name, s.city,
             po.id AS po_id, po.po_no, po.status,
             poi.item_code, im.item_name,
             poi.quantity AS ordered_qty,
             COALESCE(poi.received_quantity, 0) AS received_qty,
             (poi.quantity - COALESCE(poi.received_quantity, 0)) AS pending_qty,
             ((poi.quantity - COALESCE(poi.received_quantity, 0)) * poi.rate) AS pending_value
      FROM t_purchase_order po
      JOIN m_party_master s ON s.id = po.supplier_id
      JOIN t_purchase_order_item poi ON poi.po_id = po.id
      LEFT JOIN m_item_master im ON im.id = poi.item_id
      ${where}
      ORDER BY s.supplier_name, po.po_no
    `;
    const rows = await db.sequelize.query(sql, { replacements, type: Sequelize.QueryTypes.SELECT });
    res.json(rows);
  } catch (err) {
    console.error('Error pending material by party:', err);
    res.status(500).json({ error: 'Failed to fetch pending material by party' });
  }
};

// ── Daily Reports (PR / PO / GRN activity for a single date) ──────────
exports.getDailyReport = async (req, res) => {
  try {
    const { from, to } = req.query;
    const rep = {};
    const prWhere = from && to ? 'pr.created_date BETWEEN :from AND :to' : 'DATE(pr.created_date) = :day';
    const poWhere = from && to ? 'po.created_date BETWEEN :from AND :to' : 'DATE(po.created_date) = :day';
    const joWhere = from && to ? 'jo.jo_date BETWEEN :from AND :to' : 'jo.jo_date = :day::DATE';
    const grnWhere = from && to ? 'grn.ir_date BETWEEN :from AND :to' : 'DATE(grn.ir_date) = :day';
    const replacements = from && to ? { from, to } : { day: req.query.date || new Date().toISOString().slice(0, 10) };

    const prSql = `
      SELECT pr.id AS req_id, pr.req_no, pr.requested_by, pr.department, pr.sub_department, pr.status, pr.priority, pr.req_date,
             pri.id AS item_id, pri.item_code, pri.item_name, pri.mat_code, pri.quantity, pri.uom, pri.cost_center, pri.expected_date, pri.remarks
      FROM t_purchase_requisition pr
      JOIN t_purchase_requisition_item pri ON pri.requisition_id = pr.id
      WHERE ${prWhere}
      ORDER BY pr.req_no, pri.id
    `;
    const poSql = `
      SELECT po.id AS po_id, po.po_no, po.po_date, s.supplier_name, po.status, po.grand_total, po.currency, po.payment_terms,
             poi.id AS item_id, poi.item_code, poi.item_name, poi.quantity, poi.received_quantity, poi.rate, poi.delivery_date, poi.remarks, poi.hs_code
      FROM t_purchase_order po
      LEFT JOIN m_party_master s ON s.id = po.supplier_id
      LEFT JOIN t_purchase_order_item poi ON poi.po_id = po.id
      WHERE ${poWhere}
      ORDER BY po.po_no, poi.id
    `;
    const joSql = `
      SELECT jo.id AS jo_id, jo.order_no, jo.jo_date, jo.party_name, jo.product_code, jo.product_name,
             jo.planned_quantity, jo.produced_quantity, jo.status, jo.order_type, jo.department,
             joi.id AS item_id, joi.item_code, joi.item_name, joi.required_quantity, joi.issued_quantity, joi.remarks
      FROM t_production_order jo
      LEFT JOIN t_production_order_item joi ON joi.order_id = jo.id
      WHERE ${joWhere}
      ORDER BY jo.order_no, joi.id
    `;
    const grnSql = `
      SELECT grn.id AS grn_id, grn.ir_no, grn.ir_date, grn.ir_type, grn.dc_type,
             grn.invoice_no, grn.invoice_date, grn.gate_entry_no,
             grn.qa_status, grn.approval_status, grn.status, grn.received_by,
             s.supplier_name,
             gi.id AS item_id, gi.item_code, im.item_name,
             gi.accepted_qty, gi.rejected_qty, gi.rate, gi.amount
      FROM ir grn
      LEFT JOIN m_party_master s ON s.id = grn.supplier_id
      LEFT JOIN t_ir_item gi ON gi.grn_id = grn.id
      LEFT JOIN m_item_master im ON im.id = gi.item_id
      WHERE ${grnWhere}
      ORDER BY grn.ir_no, gi.id
    `;

    const [prs, pos, jos, grns] = await Promise.all([
      db.sequelize.query(prSql, { replacements, type: Sequelize.QueryTypes.SELECT }),
      db.sequelize.query(poSql, { replacements, type: Sequelize.QueryTypes.SELECT }),
      db.sequelize.query(joSql, { replacements, type: Sequelize.QueryTypes.SELECT }),
      db.sequelize.query(grnSql, { replacements, type: Sequelize.QueryTypes.SELECT }),
    ]);

    rep.prs = prs;
    rep.pos = pos;
    rep.jos = jos;
    rep.grns = grns;
    rep.summary = {
      grn_count: new Set(grns.map((g) => g.grn_id)).size,
      pr_count: prs.length,
      po_count: pos.length,
      po_value: pos.reduce((a, p) => a + Number(p.grand_total || 0), 0),
    };
    res.json(rep);
  } catch (err) {
    console.error('Error daily report:', err);
    res.status(500).json({ error: 'Failed to fetch daily report' });
  }
};

// ── Overdue Items (PR + PO expected/delivery date passed, not fulfilled) ──
exports.getOverdueItems = async (req, res) => {
  try {
    const prSql = `
      SELECT 'PR' AS source, pri.id AS item_id, pri.item_code, pri.item_name, pri.quantity,
             pri.expected_date AS due_date,
             pr.id AS doc_id, pr.req_no AS doc_no, pr.department
      FROM t_purchase_requisition_item pri
      JOIN t_purchase_requisition pr ON pr.id = pri.requisition_id
      WHERE pri.expected_date IS NOT NULL AND pri.expected_date < CURRENT_DATE
        AND pr.status NOT IN ('Cancelled', 'Closed')
    `;
    const poSql = `
      SELECT 'PO' AS source, poi.id AS item_id, poi.item_code, poi.item_name, poi.quantity,
             poi.delivery_date AS due_date,
             po.id AS doc_id, po.po_no AS doc_no, s.supplier_name AS department
      FROM t_purchase_order_item poi
      JOIN t_purchase_order po ON po.id = poi.po_id
      LEFT JOIN m_party_master s ON s.id = po.supplier_id
      WHERE poi.delivery_date IS NOT NULL AND poi.delivery_date < CURRENT_DATE
        AND poi.received_quantity < poi.quantity
        AND po.status = 'Approved'
    `;
    const [prRows, poRows] = await Promise.all([
      db.sequelize.query(prSql, { type: Sequelize.QueryTypes.SELECT }),
      db.sequelize.query(poSql, { type: Sequelize.QueryTypes.SELECT }),
    ]);
    const rows = [...prRows, ...poRows].sort((a, b) => new Date(a.due_date) - new Date(b.due_date));
    res.json(rows);
  } catch (err) {
    console.error('Error overdue items:', err);
    res.status(500).json({ error: 'Failed to fetch overdue items' });
  }
};

// ── PR Amendment Details Report (audit trail of requisition edits) ────
exports.getPRAmendmentDetails = async (req, res) => {
  try {
    const { from, to, requisition_id } = req.query;
    const clauses = [];
    const replacements = {};
    if (from) { clauses.push('a.amendment_date >= :from'); replacements.from = `${from} 00:00:00`; }
    if (to) { clauses.push('a.amendment_date <= :to'); replacements.to = `${to} 23:59:59`; }
    if (requisition_id) { clauses.push('a.requisition_id = :rid'); replacements.rid = requisition_id; }
    const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';

    const sql = `
      SELECT a.id AS amd_id, a.requisition_id, a.amended_by, a.amendment_date, a.change_summary,
             a.old_value, a.new_value,
             pr.req_no, pr.req_date, pr.department, pr.sub_department, pr.requested_by, pr.indent_type, pr.priority, pr.status
      FROM t_pr_amendment a
      LEFT JOIN t_purchase_requisition pr ON pr.id = a.requisition_id
      ${where}
      ORDER BY a.amendment_date DESC
    `;
    const rows = await db.sequelize.query(sql, { replacements, type: Sequelize.QueryTypes.SELECT });
    res.json(rows);
  } catch (err) {
    console.error('Error PR amendment details:', err);
    res.status(500).json({ error: 'Failed to fetch PR amendment details' });
  }
};

// ── Overdue PR Items (expected_date passed or today) ──
exports.getOverduePRItems = async (req, res) => {
  try {
    const sql = `
      SELECT pri.id, pri.item_code, pri.item_name, pri.quantity, pri.expected_date,
             pr.id AS req_id, pr.req_no, pr.department, pr.req_date,
             pr.requested_by, pr.priority, pr.status
      FROM t_purchase_requisition_item pri
      JOIN t_purchase_requisition pr ON pr.id = pri.requisition_id
      WHERE pri.expected_date IS NOT NULL AND pri.expected_date <= CURRENT_DATE
        AND pr.status NOT IN ('Cancelled', 'Closed')
      ORDER BY pri.expected_date
    `;
    const rows = await db.sequelize.query(sql, { type: Sequelize.QueryTypes.SELECT });
    res.json(rows);
  } catch (err) {
    console.error('Error overdue PR items:', err);
    res.status(500).json({ error: 'Failed to fetch overdue PR items' });
  }
};

// ── Delayed POs (PO items with delivery_date passed, not fully received) ──
exports.getDelayedPOs = async (req, res) => {
  try {
    const sql = `
      SELECT poi.id, poi.item_code, poi.item_name, poi.quantity, poi.received_quantity,
             poi.delivery_date,
             po.id AS po_id, po.po_no, po.po_date, po.status,
             s.supplier_name,
             (CURRENT_DATE - poi.delivery_date) AS delay_days
      FROM t_purchase_order_item poi
      JOIN t_purchase_order po ON po.id = poi.po_id
      LEFT JOIN m_party_master s ON s.id = po.supplier_id
      WHERE poi.delivery_date IS NOT NULL
        AND poi.delivery_date <= CURRENT_DATE
        AND poi.received_quantity < poi.quantity
        AND po.status = 'Approved'
      ORDER BY poi.delivery_date
    `;
    const rows = await db.sequelize.query(sql, { type: Sequelize.QueryTypes.SELECT });
    res.json(rows);
  } catch (err) {
    console.error('Error delayed POs:', err);
    res.status(500).json({ error: 'Failed to fetch delayed POs' });
  }
};

// ── Delayed Job Orders (end_date / req_date passed, not completed) ──
exports.getDelayedJOs = async (req, res) => {
  try {
    const sql = `
      SELECT jo.id, jo.order_no, jo.jo_date, jo.req_date, jo.end_date, jo.product_code, jo.product_name,
             jo.party_name, jo.planned_quantity, jo.produced_quantity, jo.status, jo.department,
             (CURRENT_DATE - COALESCE(jo.end_date, jo.req_date, jo.jo_date)) AS delay_days
      FROM t_production_order jo
      WHERE (
        (jo.end_date IS NOT NULL AND jo.end_date <= CURRENT_DATE)
        OR (jo.req_date IS NOT NULL AND jo.req_date <= CURRENT_DATE)
      )
        AND jo.status NOT IN ('Completed', 'Cancelled')
      ORDER BY COALESCE(jo.end_date, jo.req_date, jo.jo_date)
    `;
    const rows = await db.sequelize.query(sql, { type: Sequelize.QueryTypes.SELECT });
    res.json(rows);
  } catch (err) {
    console.error('Error delayed JOs:', err);
    res.status(500).json({ error: 'Failed to fetch delayed JOs' });
  }
};
