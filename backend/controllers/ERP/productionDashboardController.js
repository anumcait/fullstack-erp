const db = require('../../models/ERP');
const { Op, Sequelize } = require('sequelize');
const { JobOrder, ProductionDailyEntry, ProductionDowntime, ProductionMachine } = db;

const todayStr = () => new Date().toISOString().split('T')[0];
const ORDER_ATTRS = ['id', 'order_no', 'product_code', 'product_name', 'planned_quantity', 'produced_quantity', 'status', 'department'];

exports.stats = async (req, res) => {
  try {
    const totalOrders = await JobOrder.count();
    const activeOrders = await JobOrder.count({ where: { status: { [Op.notIn]: ['Completed', 'Cancelled'] } } });
    const completedOrders = await JobOrder.count({ where: { status: 'Completed' } });

    const orderAgg = await JobOrder.findAll({
      attributes: [
        [Sequelize.fn('COALESCE', Sequelize.fn('SUM', Sequelize.col('planned_quantity')), 0), 'planned'],
        [Sequelize.fn('COALESCE', Sequelize.fn('SUM', Sequelize.col('produced_quantity')), 0), 'produced'],
      ],
      raw: true,
    });
    const plannedQty = parseFloat(orderAgg[0]?.planned || 0);
    const producedQty = parseFloat(orderAgg[0]?.produced || 0);

    const totalMachines = await ProductionMachine.count();
    const activeMachines = await ProductionMachine.count({ where: { status: 'Active', is_active: true } });

    const today = todayStr();
    const todayEntries = await ProductionDailyEntry.count({ where: { entry_date: today } });
    const todayAgg = await ProductionDailyEntry.findAll({
      where: { entry_date: today },
      attributes: [
        [Sequelize.fn('COALESCE', Sequelize.fn('SUM', Sequelize.col('produced_qty')), 0), 'prod'],
        [Sequelize.fn('COALESCE', Sequelize.fn('SUM', Sequelize.col('rejected_qty')), 0), 'rej'],
      ],
      raw: true,
    });
    const todayProduced = parseFloat(todayAgg[0]?.prod || 0);
    const todayRejected = parseFloat(todayAgg[0]?.rej || 0);

    const totalDowntime = await ProductionDowntime.sum('duration_minutes') || 0;
    const openDowntime = await ProductionDowntime.count({ where: { status: 'Open' } });

    const ordersByStatus = await JobOrder.findAll({
      attributes: ['status', [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']],
      group: ['status'],
    });

    const recentOrders = await JobOrder.findAll({
      attributes: ORDER_ATTRS,
      order: [['id', 'DESC']],
      limit: 8,
    });

    const todayEntriesList = await ProductionDailyEntry.findAll({
      attributes: ['id', 'entry_date', 'shift', 'machine_code', 'order_no', 'product_name', 'produced_qty', 'rejected_qty', 'status'],
      where: { entry_date: today },
      order: [['id', 'DESC']],
      limit: 8,
    });

    const recentDowntime = await ProductionDowntime.findAll({
      attributes: ['id', 'machine_code', 'downtime_date', 'category', 'duration_minutes', 'status'],
      order: [['downtime_date', 'DESC'], ['id', 'DESC']],
      limit: 8,
    });

    res.json({
      total_orders: totalOrders,
      active_orders: activeOrders,
      completed_orders: completedOrders,
      planned_qty: plannedQty,
      produced_qty: producedQty,
      total_machines: totalMachines,
      active_machines: activeMachines,
      today_entries: todayEntries,
      today_produced: todayProduced,
      today_rejected: todayRejected,
      total_downtime_min: totalDowntime,
      open_downtime: openDowntime,
      ordersByStatus: ordersByStatus.reduce((acc, r) => ({ ...acc, [r.status]: parseInt(r.getDataValue('count')) }), {}),
      recentOrders,
      todayEntriesList,
      recentDowntime,
    });
  } catch (err) { console.error('prodDashboard', err); res.status(500).json({ error: 'Failed' }); }
};
