const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const PlanningSchedule = sequelize.define('PlanningSchedule', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    schedule_no: { type: DataTypes.STRING(50), allowNull: false, unique: true },
    order_id: { type: DataTypes.INTEGER },
    machine_id: { type: DataTypes.INTEGER },
    scheduled_date: { type: DataTypes.DATEONLY },
    shift: { type: DataTypes.STRING(20) },
    planned_qty: { type: DataTypes.DECIMAL(12, 2) },
    status: { type: DataTypes.ENUM('Planned', 'InProgress', 'Completed', 'Cancelled'), defaultValue: 'Planned' },
    notes: { type: DataTypes.TEXT },
  }, {
    tableName: 't_planning_schedule',

    timestamps: true,

    createdAt: 'created_date',

    updatedAt: 'updated_at',
    underscored: true,
  });

  PlanningSchedule.associate = (models) => {
    PlanningSchedule.belongsTo(models.ProductionMachine, { foreignKey: 'machine_id', as: 'machine' });
    PlanningSchedule.belongsTo(models.ProductionOrder, { foreignKey: 'order_id', as: 'order' });
  };

  return PlanningSchedule;
};
