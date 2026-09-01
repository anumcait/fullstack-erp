const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ProductRouting = sequelize.define('ProductRouting', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    product_id: { type: DataTypes.INTEGER, allowNull: false },
    product_item_id: { type: DataTypes.INTEGER, allowNull: true },
    operation_id: { type: DataTypes.INTEGER, allowNull: false },
    sequence_no: { type: DataTypes.INTEGER, allowNull: false },
    station: { type: DataTypes.STRING(100), allowNull: true },
    is_inspection: { type: DataTypes.BOOLEAN, defaultValue: false },
    std_time_min: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
    routing_version: { type: DataTypes.STRING(20), defaultValue: '1.0' },
    is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
    remarks: { type: DataTypes.TEXT, allowNull: true },
  }, {
    tableName: 't_product_routing',
    timestamps: false,
    underscored: true,
  });

  ProductRouting.associate = (models) => {
    ProductRouting.belongsTo(models.ProductMaster, { foreignKey: 'product_id', as: 'product' });
    ProductRouting.belongsTo(models.ProductItemMaster, { foreignKey: 'product_item_id', as: 'productItem' });
    ProductRouting.belongsTo(models.OperationMaster, { foreignKey: 'operation_id', as: 'operation' });
  };

  return ProductRouting;
};
