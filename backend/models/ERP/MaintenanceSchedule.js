const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const MaintenanceSchedule = sequelize.define('MaintenanceSchedule', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    schedule_no: { type: DataTypes.STRING(50), allowNull: false, unique: true },
    machine_id: { type: DataTypes.INTEGER },
    asset_id: { type: DataTypes.INTEGER },
    task_name: { type: DataTypes.STRING(200), allowNull: false },
    frequency: { type: DataTypes.STRING(30) },
    last_done_date: { type: DataTypes.DATEONLY },
    next_due_date: { type: DataTypes.DATEONLY },
    assigned_to: { type: DataTypes.STRING(100) },
    status: { type: DataTypes.ENUM('Pending', 'Overdue', 'Completed'), defaultValue: 'Pending' },
    notes: { type: DataTypes.TEXT },
  }, {
    tableName: 't_maintenance_schedule',
    timestamps: true,
    underscored: true,
  });

  return MaintenanceSchedule;
};
