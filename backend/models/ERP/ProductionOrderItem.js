const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ProductionOrderItem = sequelize.define('ProductionOrderItem', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    order_id: { type: DataTypes.INTEGER, allowNull: false },
    item_id: { type: DataTypes.INTEGER, allowNull: false },
    item_code: { type: DataTypes.STRING(50), allowNull: false },
    item_name: { type: DataTypes.STRING(200), allowNull: false },
    required_quantity: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
    issued_quantity: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
    unit_id: { type: DataTypes.INTEGER, allowNull: true },
    remarks: { type: DataTypes.TEXT, allowNull: true },
    created_date: { type: DataTypes.DATEONLY, defaultValue: DataTypes.NOW },
  }, {
    tableName: 't_production_order_item',
    timestamps: false,
    underscored: true,
  });

  ProductionOrderItem.associate = (models) => {
    ProductionOrderItem.belongsTo(models.ProductionOrder, { foreignKey: 'order_id', as: 'order' });
  };

  return ProductionOrderItem;
};
