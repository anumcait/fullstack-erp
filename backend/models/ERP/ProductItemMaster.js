const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ProductItemMaster = sequelize.define('ProductItemMaster', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    product_id: { type: DataTypes.INTEGER, allowNull: false },
    item_id: { type: DataTypes.INTEGER, allowNull: false },
    item_code: { type: DataTypes.STRING(50), allowNull: false },
    item_name: { type: DataTypes.STRING(200), allowNull: false },
    quantity: { type: DataTypes.DECIMAL(12, 3), allowNull: false, defaultValue: 1 },
    unit_id: { type: DataTypes.INTEGER, allowNull: true },
    wastage_percent: { type: DataTypes.DECIMAL(5, 2), defaultValue: 0 },
    created_date: { type: DataTypes.DATEONLY, defaultValue: DataTypes.NOW },
  }, {
    tableName: 'm_product_item_master',
    timestamps: false,
    underscored: true,
  });

  ProductItemMaster.associate = (models) => {
    ProductItemMaster.belongsTo(models.ProductMaster, { foreignKey: 'product_id', as: 'product' });
  };

  return ProductItemMaster;
};
