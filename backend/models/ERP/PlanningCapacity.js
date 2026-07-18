const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const PlanningCapacity = sequelize.define('PlanningCapacity', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    plan_no: { type: DataTypes.STRING(50), allowNull: false, unique: true },
    work_center: { type: DataTypes.STRING(100) },
    date: { type: DataTypes.DATEONLY },
    available_capacity: { type: DataTypes.DECIMAL(12, 2) },
    used_capacity: { type: DataTypes.DECIMAL(12, 2) },
    load_percentage: { type: DataTypes.DECIMAL(5, 2) },
    status: { type: DataTypes.STRING(30), defaultValue: 'Active' },
    notes: { type: DataTypes.TEXT },
  }, {
    tableName: 't_planning_capacity',
    timestamps: true,
    underscored: true,
  });

  return PlanningCapacity;
};
