const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ProductionDowntime = sequelize.define('ProductionDowntime', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    machine_id: { type: DataTypes.INTEGER, allowNull: false },
    machine_code: { type: DataTypes.STRING(50) },
    machine_name: { type: DataTypes.STRING(200) },
    downtime_date: { type: DataTypes.DATEONLY, allowNull: false },
    start_time: { type: DataTypes.TIME },
    end_time: { type: DataTypes.TIME },
    duration_minutes: { type: DataTypes.INTEGER, defaultValue: 0 },
    category: { type: DataTypes.ENUM('Breakdown', 'Setup', 'Maintenance', 'No Material', 'No Operator', 'Power Failure', 'Other'), defaultValue: 'Breakdown' },
    reason: { type: DataTypes.TEXT },
    action_taken: { type: DataTypes.TEXT },
    reported_by: { type: DataTypes.STRING(100) },
    resolved_by: { type: DataTypes.STRING(100) },
    status: { type: DataTypes.ENUM('Open', 'Resolved', 'Closed'), defaultValue: 'Open' },
  }, {
    tableName: 't_production_downtime',
    timestamps: true,
  });

  return ProductionDowntime;
};
