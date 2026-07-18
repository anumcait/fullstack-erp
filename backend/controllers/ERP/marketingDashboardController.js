const db = require('../../models/ERP');
const { Op } = require('sequelize');
const { Lead, Quotation, SalesOrder, CustomerMaster } = db;

exports.stats = async (req, res) => {
  try {
    const [totalLeads, newLeads, wonLeads, totalQuotes, acceptedQuotes, totalOrders, totalCustomers] = await Promise.all([
      Lead.count(),
      Lead.count({ where: { status: 'New' } }),
      Lead.count({ where: { status: 'Won' } }),
      Quotation.count(),
      Quotation.count({ where: { status: 'Accepted' } }),
      SalesOrder.count(),
      CustomerMaster.count({ where: { is_active: true } }),
    ]);
    const revenue = await SalesOrder.sum('total_amount', { where: { status: { [Op.not]: 'Cancelled' } } });
    const recentLeads = await Lead.findAll({
      include: [{ model: CustomerMaster, as: 'customer', attributes: ['id', 'customer_name'] }],
      order: [['createdAt', 'DESC']], limit: 10,
    });
    const recentQuotes = await Quotation.findAll({
      include: [{ model: CustomerMaster, as: 'customer', attributes: ['id', 'customer_name'] }],
      order: [['date', 'DESC']], limit: 10,
    });
    const pipelineValue = await Lead.sum('expected_value', { where: { status: { [Op.notIn]: ['Won', 'Lost'] } } });
    res.json({
      total_leads: totalLeads, new_leads: newLeads, won_leads: wonLeads,
      total_quotes: totalQuotes, accepted_quotes: acceptedQuotes,
      total_orders: totalOrders, total_customers: totalCustomers,
      total_revenue: revenue || 0, pipeline_value: pipelineValue || 0,
      recent_leads: recentLeads, recent_quotes: recentQuotes,
    });
  } catch (err) { console.error('mkt.dashboard', err); res.status(500).json({ error: 'Failed to fetch dashboard stats' }); }
};
