const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const MaintenanceAsset = sequelize.define('MaintenanceAsset', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    asset_code: { type: DataTypes.STRING(50), allowNull: false, unique: true },
    asset_name: { type: DataTypes.STRING(200), allowNull: false },
    asset_type: { type: DataTypes.STRING(100) },
    department: { type: DataTypes.STRING(100) },
    location: { type: DataTypes.STRING(200) },
    purchase_date: { type: DataTypes.DATEONLY },
    purchase_cost: { type: DataTypes.DECIMAL(14, 2) },
    warranty_expiry: { type: DataTypes.DATEONLY },
    status: { type: DataTypes.ENUM('Active', 'Inactive', 'Disposed'), defaultValue: 'Active' },
    notes: { type: DataTypes.TEXT },
  }, {
    tableName: 'm_maintenance_asset',

    timestamps: true,

    createdAt: 'created_date',

    updatedAt: 'updated_at',
    underscored: true,
  });

  return MaintenanceAsset;
};
