const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ProductCategory = sequelize.define('ProductCategory', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING(100), allowNull: false },
    type: { type: DataTypes.STRING(10), allowNull: false, defaultValue: 'Sub' },
    parent_id: { type: DataTypes.INTEGER, allowNull: true },
    description: { type: DataTypes.STRING(200), allowNull: true },
    is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
    created_date: { type: DataTypes.DATEONLY, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  }, {
    tableName: 'm_product_category',
    timestamps: false,
    underscored: true,
    indexes: [{ unique: true, fields: ['name', 'parent_id'] }],
  });

  ProductCategory.associate = (models) => {
    ProductCategory.belongsTo(models.ProductCategory, { foreignKey: 'parent_id', as: 'parent' });
    ProductCategory.hasMany(models.ProductCategory, { foreignKey: 'parent_id', as: 'children' });
  };

  return ProductCategory;
};
