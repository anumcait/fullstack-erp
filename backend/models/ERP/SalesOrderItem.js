const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const SalesOrderItem = sequelize.define('SalesOrderItem', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    sales_order_id: { type: DataTypes.INTEGER, allowNull: false },
    item_description: { type: DataTypes.TEXT, allowNull: false },
    quantity: { type: DataTypes.DECIMAL(12, 2), defaultValue: 1 },
    unit: { type: DataTypes.STRING(20) },
    unit_price: { type: DataTypes.DECIMAL(14, 2), defaultValue: 0 },
    discount_percent: { type: DataTypes.DECIMAL(5, 2), defaultValue: 0 },
    net_price: { type: DataTypes.DECIMAL(14, 2), defaultValue: 0 },
    total_price: { type: DataTypes.DECIMAL(14, 2), defaultValue: 0 },
  }, {
    tableName: 't_sales_order_items',

    timestamps: true,

    createdAt: 'created_date',

    updatedAt: 'updated_at',
  });

  SalesOrderItem.associate = (models) => {
    SalesOrderItem.belongsTo(models.SalesOrder, { as: 'salesOrder', foreignKey: 'sales_order_id' });
  };

  return SalesOrderItem;
};
