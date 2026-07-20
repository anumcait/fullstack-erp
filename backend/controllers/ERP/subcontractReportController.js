const db = require('../../models/ERP');
const { Op, fn, col, literal } = require('sequelize');
const { SubcontractOrder, SubcontractOrderItem } = db;

exports.orderStatus = async (req, res) => {
  try {
    const statusCounts = await SubcontractOrder.findAll({
      attributes: ['status', [fn('COUNT', col('id')), 'count']],
      group: ['status'],
    });
    res.json(statusCounts);
  } catch (err) { console.error('subReport.orderStatus', err); res.status(500).json({ error: 'Failed' }); }
};

exports.vendorSummary = async (req, res) => {
  try {
    const summary = await SubcontractOrder.findAll({
      attributes: ['vendor_name', [fn('COUNT', col('id')), 'order_count'], [fn('SUM', col('total_amount')), 'total_amount']],
      group: ['vendor_name'],
    });
    res.json(summary);
  } catch (err) { console.error('subReport.vendorSummary', err); res.status(500).json({ error: 'Failed' }); }
};

exports.monthlyTrend = async (req, res) => {
  try {
    const trend = await SubcontractOrder.findAll({
      attributes: [[fn('to_char', col('created_date'), 'YYYY-MM'), 'month'], [fn('COUNT', col('id')), 'count']],
      group: [fn('to_char', col('created_date'), 'YYYY-MM')],
      order: [[fn('to_char', col('created_date'), 'YYYY-MM'), 'ASC']],
      limit: 12,
    });
    res.json(trend);
  } catch (err) { console.error('subReport.monthlyTrend', err); res.status(500).json({ error: 'Failed' }); }
};
