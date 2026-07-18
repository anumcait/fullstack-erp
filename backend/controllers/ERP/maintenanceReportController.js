const db = require('../../models/ERP');
const { fn, col } = require('sequelize');
const { MaintenanceMachine, MaintenanceSchedule } = db;

exports.machineStatus = async (req, res) => {
  try {
    const statusCounts = await MaintenanceMachine.findAll({
      attributes: ['status', [fn('COUNT', col('id')), 'count']],
      group: ['status'],
    });
    res.json(statusCounts);
  } catch (err) { console.error('maintReport.machineStatus', err); res.status(500).json({ error: 'Failed' }); }
};

exports.scheduleStatus = async (req, res) => {
  try {
    const statusCounts = await MaintenanceSchedule.findAll({
      attributes: ['status', [fn('COUNT', col('id')), 'count']],
      group: ['status'],
    });
    res.json(statusCounts);
  } catch (err) { console.error('maintReport.scheduleStatus', err); res.status(500).json({ error: 'Failed' }); }
};
