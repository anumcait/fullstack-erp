const db = require('../../models/ERP');
const { Op, fn, col, literal } = require('sequelize');
const { Lead, Quotation, SalesOrder, CustomerMaster } = db;

exports.leadPipeline = async (req, res) => {
  try {
    const stageCounts = await Lead.findAll({
      attributes: ['status', [fn('COUNT', col('id')), 'count'], [fn('SUM', col('expected_value')), 'value']],
      group: ['status'], raw: true,
    });
    res.json(stageCounts);
  } catch (err) { console.error('mkt.pipeline', err); res.status(500).json({ error: 'Failed' }); }
};

exports.quoteConversion = async (req, res) => {
  try {
    const { from, to } = req.query;
    const where = {};
    if (from && to) where.date = { [Op.between]: [from, to] };
    const data = await Quotation.findAll({ where, attributes: ['status', [fn('COUNT', col('id')), 'count']], group: ['status'], raw: true });
    res.json(data);
  } catch (err) { console.error('mkt.conversion', err); res.status(500).json({ error: 'Failed' }); }
};

exports.orderSummary = async (req, res) => {
  try {
    const { from, to } = req.query;
    const where = {};
    if (from && to) where.order_date = { [Op.between]: [from, to] };
    const monthly = await SalesOrder.findAll({
      where, attributes: [[fn('TO_CHAR', col('order_date'), 'Mon YYYY'), 'month'], [fn('COUNT', col('id')), 'count'], [fn('SUM', col('total_amount')), 'revenue']],
      group: [fn('TO_CHAR', col('order_date'), 'Mon YYYY')], order: [[fn('MIN', col('order_date')), 'ASC']], raw: true,
    });
    const total = await SalesOrder.sum('total_amount', { where: { ...where, status: { [Op.not]: 'Cancelled' } } });
    res.json({ monthly, total_revenue: total || 0 });
  } catch (err) { console.error('mkt.orders', err); res.status(500).json({ error: 'Failed' }); }
};
