const db = require('../../models/ERP');
const { fn, col } = require('sequelize');
const { PlanningSchedule, PlanningMRP } = db;

exports.scheduleStatus = async (req, res) => {
  try {
    const statusCounts = await PlanningSchedule.findAll({
      attributes: ['status', [fn('COUNT', col('id')), 'count']],
      group: ['status'],
    });
    res.json(statusCounts);
  } catch (err) { console.error('planReport.scheduleStatus', err); res.status(500).json({ error: 'Failed' }); }
};

exports.mrpSummary = async (req, res) => {
  try {
    const summary = await PlanningMRP.findAll({
      attributes: ['run_no', 'run_date', [fn('COUNT', col('id')), 'item_count']],
      group: ['run_no', 'run_date'],
      order: [['run_date', 'DESC']],
      limit: 10,
    });
    res.json(summary);
  } catch (err) { console.error('planReport.mrpSummary', err); res.status(500).json({ error: 'Failed' }); }
};
