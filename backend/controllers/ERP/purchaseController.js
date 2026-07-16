const db = require('../../models/ERP');
const { Op } = require('sequelize');

const PurchaseRequisition = db.PurchaseRequisition;
const PurchaseOrder = db.PurchaseOrder;
const SupplierMaster = db.SupplierMaster;
const GRN = db.GRN;

exports.getDashboardStats = async (req, res) => {
  try {
    const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const [
      openIndents,
      pendingPOs,
      approvedPOs,
      grnToday,
      activeVendors,
      totalPOsThisMonth,
      totalPRsThisMonth,
      rfqCount,
      pendingPOValue,
      approvedPOValue,
      grnValueThisMonth,
    ] = await Promise.all([
      PurchaseRequisition.count({ where: { status: { [Op.ne]: 'Approved' } } }),
      PurchaseOrder.count({ where: { status: { [Op.in]: ['Draft', 'Pending'] } } }),
      PurchaseOrder.count({ where: { status: 'Approved' } }),
      GRN.count({ where: { grn_date: new Date().toISOString().split('T')[0] } }),
      SupplierMaster.count({ where: { is_active: true } }),
      PurchaseOrder.count({ where: { created_at: { [Op.gte]: monthStart } } }),
      PurchaseRequisition.count({ where: { created_at: { [Op.gte]: monthStart } } }),
      (db.RFQ || {}).count ? await db.RFQ.count() : 0,
      PurchaseOrder.sum('grand_total', { where: { status: { [Op.in]: ['Draft', 'Pending'] } } }),
      PurchaseOrder.sum('grand_total', { where: { status: 'Approved' } }),
      db.sequelize.query(
        `SELECT COALESCE(SUM(gi.amount),0) AS v FROM t_ir grn JOIN t_ir_item gi ON gi.grn_id = grn.id WHERE grn.grn_date >= :m`,
        { replacements: { m: monthStart.toISOString().slice(0, 10) }, type: db.Sequelize.QueryTypes.SELECT }
      ).then((r) => r[0]?.v || 0),
    ]);

    res.json({
      open_indents: openIndents,
      pending_pos: pendingPOs,
      approved_pos: approvedPOs,
      grn_today: grnToday,
      active_vendors: activeVendors,
      po_this_month: totalPOsThisMonth,
      pr_this_month: totalPRsThisMonth,
      total_rfq: rfqCount,
      pending_po_value: Number(pendingPOValue || 0).toFixed(2),
      approved_po_value: Number(approvedPOValue || 0).toFixed(2),
      grn_value_this_month: Number(grnValueThisMonth || 0).toFixed(2),
    });
  } catch (err) {
    console.error('Error fetching dashboard stats:', err);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
};
