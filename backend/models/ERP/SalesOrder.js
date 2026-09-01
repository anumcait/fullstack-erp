const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const SalesOrder = sequelize.define('SalesOrder', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    order_no: { type: DataTypes.STRING(50), allowNull: false, unique: true },
    customer_id: { type: DataTypes.INTEGER, allowNull: false },
    quotation_id: { type: DataTypes.INTEGER },
    order_date: { type: DataTypes.DATEONLY, allowNull: false },
    delivery_date: { type: DataTypes.DATEONLY },
    subtotal: { type: DataTypes.DECIMAL(14, 2), defaultValue: 0 },
    discount_percent: { type: DataTypes.DECIMAL(5, 2), defaultValue: 0 },
    discount_amount: { type: DataTypes.DECIMAL(14, 2), defaultValue: 0 },
    tax_rate: { type: DataTypes.DECIMAL(5, 2), defaultValue: 0 },
    tax_amount: { type: DataTypes.DECIMAL(14, 2), defaultValue: 0 },
    shipping_charges: { type: DataTypes.DECIMAL(14, 2), defaultValue: 0 },
    total_amount: { type: DataTypes.DECIMAL(14, 2), defaultValue: 0 },
    status: { type: DataTypes.STRING(30), defaultValue: 'Confirmed' },
    payment_terms: { type: DataTypes.STRING(100) },
    delivery_terms: { type: DataTypes.TEXT },
    notes: { type: DataTypes.TEXT },
    created_by: { type: DataTypes.INTEGER },
  }, {
    tableName: 't_sales_orders',

    timestamps: true,

    createdAt: 'created_date',

    updatedAt: 'updated_at',
  });

  SalesOrder.associate = (models) => {
    SalesOrder.belongsTo(models.CustomerMaster, { as: 'customer', foreignKey: 'customer_id' });
    SalesOrder.belongsTo(models.Quotation, { as: 'quotation', foreignKey: 'quotation_id' });
    SalesOrder.hasMany(models.SalesOrderItem, { as: 'items', foreignKey: 'sales_order_id' });
  };

  return SalesOrder;
};
