const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ProductionDailyEntry = sequelize.define('ProductionDailyEntry', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    entry_date: { type: DataTypes.DATEONLY, allowNull: false },
    shift: { type: DataTypes.ENUM('General', 'A', 'B', 'C'), defaultValue: 'General' },
    machine_id: { type: DataTypes.INTEGER },
    machine_code: { type: DataTypes.STRING(50) },
    machine_name: { type: DataTypes.STRING(200) },
    order_id: { type: DataTypes.INTEGER },
    order_no: { type: DataTypes.STRING(50) },
    product_code: { type: DataTypes.STRING(50) },
    product_name: { type: DataTypes.STRING(200) },
    operator_name: { type: DataTypes.STRING(100) },
    planned_qty: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
    produced_qty: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
    rejected_qty: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
    downtime_minutes: { type: DataTypes.INTEGER, defaultValue: 0 },
    downtime_reason: { type: DataTypes.TEXT },
    notes: { type: DataTypes.TEXT },
    status: { type: DataTypes.ENUM('Pending', 'Completed', 'Approved'), defaultValue: 'Pending' },
    recorded_by: { type: DataTypes.STRING(100) },
  }, {
    tableName: 't_production_daily_entry',

    timestamps: true,

    createdAt: 'created_date',

    updatedAt: 'updated_at',
  });

  return ProductionDailyEntry;
};
