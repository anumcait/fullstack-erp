const db = require('../../models/ERP');
const { Op, fn, col } = require('sequelize');
const { JobOrder, ProductionDailyEntry, ProductionDowntime, ProductionMachine } = db;

exports.orderStatus = async (req, res) => {
  try {
    const data = await JobOrder.findAll({
      attributes: ['status', [fn('COUNT', col('id')), 'count']],
      group: ['status'], raw: true,
    });
    res.json(data);
  } catch (err) { console.error('prodRep.orderStatus', err); res.status(500).json({ error: 'Failed' }); }
};

exports.dailySummary = async (req, res) => {
  try {
    const { from, to } = req.query;
    const where = {};
    if (from && to) where.entry_date = { [Op.between]: [from, to] };
    const data = await ProductionDailyEntry.findAll({
      where,
      attributes: ['entry_date', [fn('SUM', col('produced_qty')), 'total_produced'],
        [fn('SUM', col('rejected_qty')), 'total_rejected'],
        [fn('SUM', col('downtime_minutes')), 'total_downtime']],
      group: ['entry_date'], order: [['entry_date', 'ASC']], raw: true,
    });
    res.json(data);
  } catch (err) { console.error('prodRep.daily', err); res.status(500).json({ error: 'Failed' }); }
};

exports.downtimeAnalysis = async (req, res) => {
  try {
    const { from, to } = req.query;
    const where = {};
    if (from && to) where.downtime_date = { [Op.between]: [from, to] };
    const data = await ProductionDowntime.findAll({
      where,
      attributes: ['category', [fn('SUM', col('duration_minutes')), 'total_minutes'],
        [fn('COUNT', col('id')), 'count']],
      group: ['category'], raw: true, order: [[fn('SUM', col('duration_minutes')), 'DESC']],
    });
    res.json(data);
  } catch (err) { console.error('prodRep.downtime', err); res.status(500).json({ error: 'Failed' }); }
};
