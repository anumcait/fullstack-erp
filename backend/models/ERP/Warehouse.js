const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Warehouse = sequelize.define(
    'Warehouse',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      warehouse_code: { type: DataTypes.STRING(50), allowNull: false, unique: true },
      warehouse_name: { type: DataTypes.STRING(150), allowNull: false },
      location: { type: DataTypes.STRING(200), allowNull: true },
      is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
      created_date: { type: DataTypes.DATEONLY, defaultValue: DataTypes.NOW },
      updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    },
    { tableName: 'm_warehouse', timestamps: false, underscored: true }
  );

  Warehouse.associate = (models) => {
    Warehouse.hasMany(models.StockLedger, { foreignKey: 'warehouse_id', as: 'ledgerEntries' });
  };

  return Warehouse;
};
