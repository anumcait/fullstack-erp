const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const CostCenter = sequelize.define(
    'CostCenter',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      name: { type: DataTypes.STRING(100), allowNull: false, unique: true },
      code: { type: DataTypes.STRING(20), allowNull: true },
      is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
      created_date: { type: DataTypes.DATEONLY, defaultValue: DataTypes.NOW },
      updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    },
    {
      tableName: 'm_cost_center',
      timestamps: false,
      underscored: true,
    }
  );
  return CostCenter;
};
