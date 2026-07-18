const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ProductionSettings = sequelize.define('ProductionSettings', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    key: { type: DataTypes.STRING(100), allowNull: false, unique: true },
    value: { type: DataTypes.TEXT },
  }, {
    tableName: 'm_production_settings',
    timestamps: true,
  });

  return ProductionSettings;
};
