const db = require('../../models/ERP');
const { Op, fn, col } = require('sequelize');
const { ProductionOrder, ProductionDailyEntry, ProductionDowntime, ProductionMachine } = db;

exports.stats = async (req, res) => {
  try {
    const [totalOrders, activeOrders, completedOrders, totalMachines, activeMachines,
      todayEntries, totalDowntime, openDowntime] = await Promise.all([
      ProductionOrder.count(),
      ProductionOrder.count({ where: { status: { [Op.notIn]: ['Completed', 'Cancelled'] } } }),
      ProductionOrder.count({ where: { status: 'Completed' } }),
      ProductionMachine.count(),
      ProductionMachine.count({ where: { status: 'Active', is_active: true } }),
      ProductionDailyEntry.count({ where: { entry_date: new Date().toISOString().split('T')[0] } }),
      ProductionDowntime.sum('duration_minutes'),
      ProductionDowntime.count({ where: { status: 'Open' } }),
    ]);
    res.json({
      total_orders: totalOrders, active_orders: activeOrders, completed_orders: completedOrders,
      total_machines: totalMachines, active_machines: activeMachines,
      today_entries: todayEntries, total_downtime_min: totalDowntime || 0, open_downtime: openDowntime,
    });
  } catch (err) { console.error('prodDashboard', err); res.status(500).json({ error: 'Failed' }); }
};
