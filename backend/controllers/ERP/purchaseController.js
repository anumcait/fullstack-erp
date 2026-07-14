const db = require('../../models/ERP');
const { Op } = require('sequelize');

const PurchaseRequisition = db.PurchaseRequisition;
const PurchaseOrder = db.PurchaseOrder;
const SupplierMaster = db.SupplierMaster;
const GRN = db.GRN;

exports.getDashboardStats = async (req, res) => {
  try {
    const [
      openIndents,
      pendingPOs,
      approvedPOs,
      grnToday,
      activeVendors,
      totalPOsThisMonth,
      totalPRsThisMonth,
      rfqCount,
    ] = await Promise.all([
      PurchaseRequisition.count({ where: { status: { [Op.ne]: 'Approved' } } }),
      PurchaseOrder.count({ where: { status: { [Op.in]: ['Draft', 'Pending'] } } }),
      PurchaseOrder.count({ where: { status: 'Approved' } }),
      GRN.count({ where: { grn_date: new Date().toISOString().split('T')[0] } }),
      SupplierMaster.count({ where: { is_active: true } }),
      PurchaseOrder.count({ where: { created_at: { [Op.gte]: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } } }),
      PurchaseRequisition.count({ where: { created_at: { [Op.gte]: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } } }),
      (db.RFQ || {}).count ? await db.RFQ.count() : 0,
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
    });
  } catch (err) {
    console.error('Error fetching dashboard stats:', err);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
};
