const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const PurchaseOrderItem = sequelize.define(
    'PurchaseOrderItem',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      po_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      item_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      item_code: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      item_name: {
        type: DataTypes.STRING(200),
        allowNull: false,
      },
      quantity: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
      },
      received_quantity: {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0,
      },
      unit_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      rate: {
        type: DataTypes.DECIMAL(14, 2),
        defaultValue: 0,
      },
      amount: {
        type: DataTypes.DECIMAL(14, 2),
        defaultValue: 0,
      },
      gst_rate: {
        type: DataTypes.DECIMAL(5, 2),
        defaultValue: 0,
      },
      gst_amount: {
        type: DataTypes.DECIMAL(14, 2),
        defaultValue: 0,
      },
      total: {
        type: DataTypes.DECIMAL(14, 2),
        defaultValue: 0,
      },
      delivery_date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
    },
    {
      tableName: 't_purchase_order_item',
      timestamps: false,
      underscored: true,
    }
  );

  PurchaseOrderItem.associate = (models) => {
    PurchaseOrderItem.belongsTo(models.PurchaseOrder, {
      foreignKey: 'po_id',
      as: 'purchaseOrder',
    });
  };

  return PurchaseOrderItem;
};
