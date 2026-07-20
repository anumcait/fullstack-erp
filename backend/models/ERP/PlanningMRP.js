const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const PlanningMRP = sequelize.define('PlanningMRP', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    run_no: { type: DataTypes.STRING(50), allowNull: false },
    run_date: { type: DataTypes.DATEONLY },
    item_id: { type: DataTypes.INTEGER },
    item_code: { type: DataTypes.STRING(50) },
    item_name: { type: DataTypes.STRING(200) },
    gross_requirement: { type: DataTypes.DECIMAL(14, 2) },
    scheduled_receipts: { type: DataTypes.DECIMAL(14, 2) },
    net_requirement: { type: DataTypes.DECIMAL(14, 2) },
    planned_orders: { type: DataTypes.DECIMAL(14, 2) },
    status: { type: DataTypes.STRING(30), defaultValue: 'Generated' },
  }, {
    tableName: 't_planning_mrp',

    timestamps: true,

    createdAt: 'created_date',

    updatedAt: 'updated_at',
    underscored: true,
  });

  return PlanningMRP;
};
