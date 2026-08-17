const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const PurchaseReturnItem = sequelize.define(
    'PurchaseReturnItem',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      return_id: { type: DataTypes.INTEGER, allowNull: false },
      item_id: { type: DataTypes.INTEGER, allowNull: true },
      po_item_id: { type: DataTypes.INTEGER, allowNull: true },
      grn_item_id: { type: DataTypes.INTEGER, allowNull: true },
      item_code: { type: DataTypes.STRING(50), allowNull: true },
      item_name: { type: DataTypes.STRING(200), allowNull: false },
      description: { type: DataTypes.TEXT, allowNull: true },
      quantity: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
      unit_id: { type: DataTypes.INTEGER, allowNull: true },
      rate: { type: DataTypes.DECIMAL(14, 2), defaultValue: 0 },
      amount: { type: DataTypes.DECIMAL(14, 2), defaultValue: 0 },
      discount_percent: { type: DataTypes.DECIMAL(5, 2), defaultValue: 0 },
      discount_amount: { type: DataTypes.DECIMAL(14, 2), defaultValue: 0 },
      taxable_amount: { type: DataTypes.DECIMAL(14, 2), defaultValue: 0 },
      gst_rate: { type: DataTypes.DECIMAL(5, 2), defaultValue: 0 },
      cgst_rate: { type: DataTypes.DECIMAL(5, 2), defaultValue: 0 },
      sgst_rate: { type: DataTypes.DECIMAL(5, 2), defaultValue: 0 },
      igst_rate: { type: DataTypes.DECIMAL(5, 2), defaultValue: 0 },
      cgst_amount: { type: DataTypes.DECIMAL(14, 2), defaultValue: 0 },
      sgst_amount: { type: DataTypes.DECIMAL(14, 2), defaultValue: 0 },
      igst_amount: { type: DataTypes.DECIMAL(14, 2), defaultValue: 0 },
      total_gst: { type: DataTypes.DECIMAL(14, 2), defaultValue: 0 },
      batch_no: { type: DataTypes.STRING(50), allowNull: true },
      serial_no: { type: DataTypes.STRING(100), allowNull: true },
      hsn_code: { type: DataTypes.STRING(20), allowNull: true },
      received_qty: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
      returned_qty: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
      pending_qty: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
      remarks: { type: DataTypes.TEXT, allowNull: true },
    },
    {
      tableName: 't_purchase_return_item',
      timestamps: false,
      underscored: true,
    }
  );

  PurchaseReturnItem.associate = (models) => {
    PurchaseReturnItem.belongsTo(models.PurchaseReturn, {
      foreignKey: 'return_id', as: 'returnRef',
    });
    PurchaseReturnItem.belongsTo(models.ItemMaster, {
      foreignKey: 'item_id', as: 'item',
    });
    PurchaseReturnItem.belongsTo(models.PurchaseOrderItem, {
      foreignKey: 'po_item_id', as: 'poItem',
    });
    PurchaseReturnItem.belongsTo(models.GRNItem, {
      foreignKey: 'grn_item_id', as: 'grnItem',
    });
    PurchaseReturnItem.belongsTo(models.Unit, {
      foreignKey: 'unit_id', as: 'unit',
    });
  };

  return PurchaseReturnItem;
};