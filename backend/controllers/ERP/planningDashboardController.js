const db = require('../../models/ERP');
const { Op, Sequelize } = require('sequelize');
const { PlanningSchedule, PlanningMRP, PlanningCapacity } = db;

const SCHED_ATTRS = [
  'id', 'schedule_no', 'order_id', 'machine_id', 'scheduled_date',
  'shift', 'planned_qty', 'status', 'start_time', 'end_time',
];

exports.stats = async (req, res) => {
  try {
    const plannedSchedules = await PlanningSchedule.count({ where: { status: 'Planned' } });
    const inProgressSchedules = await PlanningSchedule.count({ where: { status: 'InProgress' } });
    const completedSchedules = await PlanningSchedule.count({ where: { status: 'Completed' } });
    const activeSchedules = await PlanningSchedule.count({ where: { status: { [Op.notIn]: ['Completed', 'Cancelled'] } } });

    const totalMRPRuns = await PlanningMRP.count();
    const mrpAgg = await PlanningMRP.findAll({
      attributes: [
        [Sequelize.fn('COALESCE', Sequelize.fn('SUM', Sequelize.col('net_requirement')), 0), 'net'],
        [Sequelize.fn('COALESCE', Sequelize.fn('SUM', Sequelize.col('planned_orders')), 0), 'planned'],
      ],
      raw: true,
    });
    const totalMRPNet = parseFloat(mrpAgg[0]?.net || 0);
    const totalMRPPlanned = parseFloat(mrpAgg[0]?.planned || 0);

    const capacityPlans = await PlanningCapacity.count({ where: { status: 'Active' } });
    const capacityAgg = await PlanningCapacity.findAll({
      attributes: [[Sequelize.fn('COALESCE', Sequelize.fn('AVG', Sequelize.col('load_percentage')), 0), 'avgLoad']],
      raw: true,
    });
    const avgLoad = parseFloat(capacityAgg[0]?.avgLoad || 0);

    const scheduleByStatus = await PlanningSchedule.findAll({
      attributes: ['status', [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']],
      group: ['status'],
    });

    const recentSchedules = await PlanningSchedule.findAll({
      attributes: SCHED_ATTRS,
      include: [
        { model: db.ProductionMachine, as: 'machine', attributes: ['id', 'machine_code', 'machine_name'] },
        { model: db.ProductionOrder, as: 'order', attributes: ['id', 'order_no', 'product_name'] },
      ],
      order: [['scheduled_date', 'DESC'], ['id', 'DESC']],
      limit: 8,
    });

    const recentMRP = await PlanningMRP.findAll({
      attributes: ['id', 'run_no', 'run_date', 'item_name', 'net_requirement', 'planned_orders', 'status'],
      order: [['run_date', 'DESC'], ['id', 'DESC']],
      limit: 8,
    });

    const recentCapacity = await PlanningCapacity.findAll({
      attributes: ['id', 'plan_no', 'work_center', 'date', 'available_capacity', 'used_capacity', 'load_percentage', 'status'],
      order: [['date', 'DESC'], ['id', 'DESC']],
      limit: 8,
    });

    res.json({
      plannedSchedules,
      inProgressSchedules,
      completedSchedules,
      activeSchedules,
      totalMRPRuns,
      totalMRPNet,
      totalMRPPlanned,
      capacityPlans,
      avgLoad,
      scheduleByStatus: scheduleByStatus.reduce((acc, r) => ({ ...acc, [r.status]: parseInt(r.getDataValue('count')) }), {}),
      recentSchedules,
      recentMRP,
      recentCapacity,
    });
  } catch (err) { console.error('planDash.stats', err); res.status(500).json({ error: 'Failed' }); }
};
