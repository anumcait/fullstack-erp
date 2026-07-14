const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const StockAuditItem = sequelize.define(
    'StockAuditItem',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      audit_id: { type: DataTypes.INTEGER, allowNull: false },
      item_id: { type: DataTypes.INTEGER, allowNull: false },
      item_code: { type: DataTypes.STRING(50), allowNull: true },
      item_name: { type: DataTypes.STRING(200), allowNull: false },
      system_qty: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
      physical_qty: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
      variance_qty: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
      unit_id: { type: DataTypes.INTEGER, allowNull: true },
      remarks: { type: DataTypes.TEXT, allowNull: true },
    },
    {
      tableName: 't_stock_audit_item',
      timestamps: false,
      underscored: true,
    }
  );

  return StockAuditItem;
};
