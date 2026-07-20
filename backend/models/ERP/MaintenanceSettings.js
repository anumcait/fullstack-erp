const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const MaintenanceSettings = sequelize.define('MaintenanceSettings', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    setting_key: { type: DataTypes.STRING(100), allowNull: false, unique: true },
    setting_value: { type: DataTypes.TEXT },
    category: { type: DataTypes.STRING(100) },
  }, {
    tableName: 'm_maintenance_settings',

    timestamps: true,

    createdAt: 'created_date',

    updatedAt: 'updated_at',
    underscored: true,
  });

  return MaintenanceSettings;
};
