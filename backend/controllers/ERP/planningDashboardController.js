const db = require('../../models/ERP');
const { Op } = require('sequelize');
const { PlanningSchedule, PlanningMRP, PlanningCapacity } = db;

exports.stats = async (req, res) => {
  try {
    const plannedSchedules = await PlanningSchedule.count({ where: { status: 'Planned' } });
    const activeSchedules = await PlanningSchedule.count({ where: { status: { [Op.ne]: 'Completed' } } });
    const totalMRPRuns = await PlanningMRP.count();
    const capacityPlans = await PlanningCapacity.count({ where: { status: 'Active' } });
    res.json({ plannedSchedules, activeSchedules, totalMRPRuns, capacityPlans });
  } catch (err) { console.error('planDash.stats', err); res.status(500).json({ error: 'Failed' }); }
};
