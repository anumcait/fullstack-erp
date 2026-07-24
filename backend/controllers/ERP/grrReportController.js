const { Op, Sequelize } = require('sequelize');
const db = require('../../models/ERP');

exports.getGRRRegister = async (req, res) => {
  try {
    const { from, to, supplier_id, status, approval_status, ir_type, search } = req.query;
    const where = {};
    if (status) where.status = status;
    if (approval_status) where.approval_status = approval_status;
    if (ir_type) where.ir_type = ir_type;
    if (supplier_id) where.supplier_id = supplier_id;
    if (from || to) {
      where.grn_date = {};
      if (from) where.grn_date[Op.gte] = from;
      if (to) where.grn_date[Op.lte] = to;
    }
    if (search) {
      where[Op.or] = [
        { grn_no: { [Op.iLike]: `%${search}%` } },
        { invoice_no: { [Op.iLike]: `%${search}%` } },
      ];
    }
    const rows = await db.GRN.findAll({
      where,
      include: [
        { model: db.SupplierMaster, as: 'supplier', attributes: ['supplier_code', 'supplier_name'] },
        { model: db.PurchaseOrder, as: 'purchaseOrder', attributes: ['po_no'] },
        { model: db.PurchaseRequisition, as: 'purchaseRequisition', attributes: ['req_no'] },
        { model: db.GRNItem, as: 'items' },
      ],
      order: [['grn_date', 'DESC']],
    });
    res.json(rows);
  } catch (err) {
    console.error('Error GRR register:', err);
    res.status(500).json({ error: 'Failed to fetch GRR register' });
  }
};

exports.getPendingGRRs = async (req, res) => {
  try {
    const rows = await db.GRN.findAll({
      where: { status: 'Draft' },
      include: [
        { model: db.SupplierMaster, as: 'supplier', attributes: ['supplier_code', 'supplier_name'] },
        { model: db.PurchaseOrder, as: 'purchaseOrder', attributes: ['po_no'] },
        { model: db.PurchaseRequisition, as: 'purchaseRequisition', attributes: ['req_no'] },
        { model: db.GRNItem, as: 'items' },
      ],
      order: [['created_date', 'DESC']],
    });
    res.json(rows);
  } catch (err) {
    console.error('Error pending GRRs:', err);
    res.status(500).json({ error: 'Failed to fetch pending GRRs' });
  }
};

exports.getGRRSummaryBySupplier = async (req, res) => {
  try {
    const { from, to } = req.query;
    const clauses = [];
    const replacements = {};
    if (from) { clauses.push('grn.grn_date >= :from'); replacements.from = from; }
    if (to) { clauses.push('grn.grn_date <= :to'); replacements.to = to; }
    const where = clauses.length ? 'WHERE ' + clauses.join(' AND ') : '';

    const sql = `
      SELECT s.supplier_code, s.supplier_name,
             COUNT(DISTINCT grn.id) AS grr_count,
             COALESCE(SUM(gi.accepted_qty), 0) AS total_accepted_qty,
             COALESCE(SUM(gi.rejected_qty), 0) AS total_rejected_qty,
             COALESCE(SUM(gi.amount), 0) AS total_value,
             COALESCE(SUM(gi.gst_amount), 0) AS total_gst
      FROM t_ir grn
      LEFT JOIN m_party_master s ON s.id = grn.supplier_id
      LEFT JOIN t_ir_item gi ON gi.grn_id = grn.id
      ${where}
      GROUP BY s.supplier_code, s.supplier_name
      ORDER BY total_value DESC
    `;
    const rows = await db.sequelize.query(sql, { replacements, type: Sequelize.QueryTypes.SELECT });
    res.json(rows);
  } catch (err) {
    console.error('Error GRR summary:', err);
    res.status(500).json({ error: 'Failed to fetch GRR summary' });
  }
};

exports.getGRRItemDetails = async (req, res) => {
  try {
    const { from, to, supplier_id } = req.query;
    const clauses = [];
    const replacements = {};
    if (from) { clauses.push('grn.grn_date >= :from'); replacements.from = from; }
    if (to) { clauses.push('grn.grn_date <= :to'); replacements.to = to; }
    if (supplier_id) { clauses.push('grn.supplier_id = :sid'); replacements.sid = supplier_id; }
    const where = clauses.length ? 'WHERE ' + clauses.join(' AND ') : '';

    const sql = `
      SELECT grn.grn_no, grn.grn_date, grn.ir_type, grn.status, grn.approval_status,
             grn.qa_status, grn.po_id, grn.pr_id,
             po.po_no, pr.req_no,
             s.supplier_code, s.supplier_name,
             gi.item_code, gi.item_name,
             gi.ordered_qty, gi.received_qty, gi.accepted_qty, gi.rejected_qty,
             gi.reject_reason, gi.rate, gi.gst_rate, gi.gst_amount, gi.amount,
             grn.invoice_no, grn.gate_entry_no
      FROM t_ir grn
      LEFT JOIN m_party_master s ON s.id = grn.supplier_id
      LEFT JOIN t_purchase_order po ON po.id = grn.po_id
      LEFT JOIN t_purchase_requisition pr ON pr.id = grn.pr_id
      LEFT JOIN t_ir_item gi ON gi.grn_id = grn.id
      ${where}
      ORDER BY grn.grn_date DESC, grn.grn_no
    `;
    const rows = await db.sequelize.query(sql, { replacements, type: Sequelize.QueryTypes.SELECT });
    res.json(rows);
  } catch (err) {
    console.error('Error GRR item details:', err);
    res.status(500).json({ error: 'Failed to fetch GRR item details' });
  }
};

exports.getGRRQASummary = async (req, res) => {
  try {
    const { from, to, qa_status } = req.query;
    const clauses = [];
    const replacements = {};
    if (from) { clauses.push('grn.grn_date >= :from'); replacements.from = from; }
    if (to) { clauses.push('grn.grn_date <= :to'); replacements.to = to; }
    if (qa_status) { clauses.push('grn.qa_status = :qa'); replacements.qa = qa_status; }
    const where = clauses.length ? 'WHERE ' + clauses.join(' AND ') : '';

    const sql = `
      SELECT grn.grn_no, grn.grn_date, grn.qa_status, grn.qa_by, grn.qa_date, grn.qa_remarks,
             s.supplier_name, po.po_no, pr.req_no,
             gi.item_code, gi.item_name, gi.accepted_qty, gi.rejected_qty, gi.reject_reason
      FROM t_ir grn
      LEFT JOIN m_party_master s ON s.id = grn.supplier_id
      LEFT JOIN t_purchase_order po ON po.id = grn.po_id
      LEFT JOIN t_purchase_requisition pr ON pr.id = grn.pr_id
      LEFT JOIN t_ir_item gi ON gi.grn_id = grn.id
      ${where}
      ORDER BY grn.grn_date DESC
    `;
    const rows = await db.sequelize.query(sql, { replacements, type: Sequelize.QueryTypes.SELECT });
    res.json(rows);
  } catch (err) {
    console.error('Error GRR QA summary:', err);
    res.status(500).json({ error: 'Failed to fetch GRR QA summary' });
  }
};
