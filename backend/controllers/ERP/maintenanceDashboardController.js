const db = require('../../models/ERP');
const { Op } = require('sequelize');
const { MaintenanceMachine, MaintenanceAsset, MaintenanceSchedule } = db;

exports.stats = async (req, res) => {
  try {
    const totalMachines = await MaintenanceMachine.count();
    const activeAssets = await MaintenanceAsset.count({ where: { status: 'Active' } });
    const pendingPM = await MaintenanceSchedule.count({ where: { status: { [Op.ne]: 'Completed' } } });
    const overduePM = await MaintenanceSchedule.count({ where: { status: 'Overdue' } });
    const activeMachines = await MaintenanceMachine.count({ where: { status: 'Active' } });
    res.json({ totalMachines, activeMachines, activeAssets, pendingPM, overduePM });
  } catch (err) { console.error('maintDash.stats', err); res.status(500).json({ error: 'Failed' }); }
};
