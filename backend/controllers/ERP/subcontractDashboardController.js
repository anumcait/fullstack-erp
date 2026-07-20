const db = require('../../models/ERP');
const { Op } = require('sequelize');
const { SubcontractOrder, SubcontractIssue, SubcontractReceipt } = db;

exports.stats = async (req, res) => {
  try {
    const activeOrders = await SubcontractOrder.count({ where: { status: { [Op.ne]: 'Closed' } } });
    const totalOrders = await SubcontractOrder.count();
    const totalIssues = await SubcontractIssue.count();
    const totalReceipts = await SubcontractReceipt.count();
    const pendingIssues = await SubcontractIssue.count({ where: { status: { [Op.ne]: 'Completed' } } });
    const pendingReceipts = await SubcontractReceipt.count({ where: { status: { [Op.ne]: 'Completed' } } });
    
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);
    const thisMonthOrders = await SubcontractOrder.count({
      where: { created_date: { [Op.gte]: monthStart } },
    });

    res.json({
      activeOrders,
      totalOrders,
      totalIssues,
      totalReceipts,
      pendingIssues,
      pendingReceipts,
      thisMonthOrders,
    });
  } catch (err) { console.error('subDash.stats', err); res.status(500).json({ error: 'Failed' }); }
};
