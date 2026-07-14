const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ProductionOrder = sequelize.define('ProductionOrder', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    order_no: { type: DataTypes.STRING(50), allowNull: false, unique: true },
    bom_id: { type: DataTypes.INTEGER, allowNull: false },
    product_item_id: { type: DataTypes.INTEGER, allowNull: false },
    product_code: { type: DataTypes.STRING(50), allowNull: false },
    product_name: { type: DataTypes.STRING(200), allowNull: false },
    planned_quantity: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
    produced_quantity: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
    status: { type: DataTypes.STRING(20), defaultValue: 'Planning' },
    start_date: { type: DataTypes.DATEONLY, allowNull: true },
    end_date: { type: DataTypes.DATEONLY, allowNull: true },
    department: { type: DataTypes.STRING(100), allowNull: true },
    remarks: { type: DataTypes.TEXT, allowNull: true },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  }, {
    tableName: 't_production_order',
    timestamps: false,
    underscored: true,
  });

  ProductionOrder.associate = (models) => {
    ProductionOrder.hasMany(models.ProductionOrderItem, { foreignKey: 'order_id', as: 'items' });
  };

  return ProductionOrder;
};
