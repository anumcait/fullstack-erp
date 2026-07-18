const db = require('../../models/ERP');
const { Op, Sequelize } = require('sequelize');
const { MaintenanceMachine, MaintenanceAsset, MaintenanceSchedule } = db;

const SCHED_ATTRS = [
  'id', 'schedule_no', 'task_name', 'frequency', 'last_done_date',
  'next_due_date', 'assigned_to', 'status', 'machine_id', 'asset_id',
];
const MACHINE_ATTRS = ['id', 'machine_code', 'machine_name'];

exports.stats = async (req, res) => {
  try {
    const totalMachines = await MaintenanceMachine.count();
    const activeMachines = await MaintenanceMachine.count({ where: { status: 'Active' } });
    const underMaintenance = await MaintenanceMachine.count({ where: { status: 'Under Maintenance' } });
    const inactiveMachines = await MaintenanceMachine.count({ where: { status: 'Inactive' } });

    const totalAssets = await MaintenanceAsset.count();
    const activeAssets = await MaintenanceAsset.count({ where: { status: 'Active' } });

    const pendingPM = await MaintenanceSchedule.count({ where: { status: 'Pending' } });
    const overduePM = await MaintenanceSchedule.count({ where: { status: 'Overdue' } });
    const completedThisMonth = await MaintenanceSchedule.count({
      where: {
        status: 'Completed',
        last_done_date: { [Op.gte]: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10) },
      },
    });
    const totalSchedules = await MaintenanceSchedule.count();

    const machinesByStatus = await MaintenanceMachine.findAll({
      attributes: ['status', [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']],
      group: ['status'],
    });

    const schedulesByStatus = await MaintenanceSchedule.findAll({
      attributes: ['status', [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']],
      group: ['status'],
    });

    const upcomingSchedules = await MaintenanceSchedule.findAll({
      where: { status: { [Op.in]: ['Pending', 'Overdue'] } },
      attributes: SCHED_ATTRS,
      include: [{ model: MaintenanceMachine, as: 'machine', attributes: MACHINE_ATTRS }],
      order: [['next_due_date', 'ASC']],
      limit: 10,
    });

    const recentActivity = await MaintenanceSchedule.findAll({
      attributes: SCHED_ATTRS,
      include: [{ model: MaintenanceMachine, as: 'machine', attributes: MACHINE_ATTRS }],
      order: [['id', 'DESC']],
      limit: 10,
    });

    res.json({
      totalMachines,
      activeMachines,
      underMaintenance,
      inactiveMachines,
      totalAssets,
      activeAssets,
      pendingPM,
      overduePM,
      completedThisMonth,
      totalSchedules,
      machinesByStatus: machinesByStatus.reduce((acc, r) => ({ ...acc, [r.status]: parseInt(r.getDataValue('count')) }), {}),
      schedulesByStatus: schedulesByStatus.reduce((acc, r) => ({ ...acc, [r.status]: parseInt(r.getDataValue('count')) }), {}),
      upcomingSchedules,
      recentActivity,
    });
  } catch (err) { console.error('maintDash.stats', err); res.status(500).json({ error: 'Failed' }); }
};
