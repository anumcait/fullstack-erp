const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ProductItemMaster = sequelize.define('ProductItemMaster', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    product_id: { type: DataTypes.INTEGER, allowNull: false },
    parent_item_id: { type: DataTypes.INTEGER, allowNull: true },
    component_product_id: { type: DataTypes.INTEGER, allowNull: true },
    item_id: { type: DataTypes.INTEGER, allowNull: true },
    item_code: { type: DataTypes.STRING(50), allowNull: false },
    item_name: { type: DataTypes.STRING(200), allowNull: false },
    item_description: { type: DataTypes.TEXT, allowNull: true },
    quantity: { type: DataTypes.DECIMAL(12, 3), allowNull: false, defaultValue: 1 },
    unit_id: { type: DataTypes.INTEGER, allowNull: true },
    wastage_percent: { type: DataTypes.DECIMAL(5, 2), defaultValue: 0 },
    is_subassembly: { type: DataTypes.BOOLEAN, defaultValue: false },
    sort_order: { type: DataTypes.INTEGER, defaultValue: 0 },
    serial_no: { type: DataTypes.INTEGER, allowNull: true },
    remark: { type: DataTypes.STRING(200), allowNull: true },
    color: { type: DataTypes.STRING(50), allowNull: true },
    created_date: { type: DataTypes.DATEONLY, defaultValue: DataTypes.NOW },
  }, {
    tableName: 'm_product_item_master',
    timestamps: false,
    underscored: true,
  });

  ProductItemMaster.associate = (models) => {
    ProductItemMaster.belongsTo(models.ProductMaster, { foreignKey: 'product_id', as: 'product' });
    ProductItemMaster.belongsTo(models.ProductMaster, { foreignKey: 'component_product_id', as: 'componentProduct' });
    ProductItemMaster.belongsTo(models.ItemMaster, { foreignKey: 'item_id', as: 'item' });
    ProductItemMaster.belongsTo(models.ProductItemMaster, { foreignKey: 'parent_item_id', as: 'parent' });
    ProductItemMaster.hasMany(models.ProductItemMaster, { foreignKey: 'parent_item_id', as: 'children' });
  };

  return ProductItemMaster;
};
