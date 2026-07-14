const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ProductMaster = sequelize.define('ProductMaster', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    product_uid: { type: DataTypes.STRING(10), allowNull: false, unique: true },
    product_type: { type: DataTypes.STRING(50), allowNull: true },
    product_code: { type: DataTypes.STRING(50), allowNull: true },
    part_name: { type: DataTypes.STRING(50), allowNull: true },
    description: { type: DataTypes.STRING(500), allowNull: true },
    finish_type: { type: DataTypes.STRING(20), allowNull: true },
    assembly_qty: { type: DataTypes.DECIMAL(20, 3), defaultValue: 0, allowNull: false },
    qty_per_pallet: { type: DataTypes.DECIMAL(12, 3), allowNull: true },
    created_by: { type: DataTypes.INTEGER, allowNull: true },
    is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  }, {
    tableName: 'm_product_master',
    timestamps: false,
    underscored: true,
  });

  ProductMaster.associate = (models) => {
    ProductMaster.hasMany(models.ProductItemMaster, { foreignKey: 'product_id', as: 'items' });
  };

  return ProductMaster;
};
