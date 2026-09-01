const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ProductMaster = sequelize.define('ProductMaster', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    product_uid: { type: DataTypes.STRING(10), allowNull: false, unique: true },
    product_type: { type: DataTypes.STRING(50), allowNull: true },
    // ── Node role in the product/assembly tree ──
    // ROOT          = top-level finished product
    // ASSEMBLY      = manufactured assembly (has a BOM, is stocked)
    // SUB_ASSEMBLY  = manufactured sub-assembly (has a BOM, may be stocked)
    // PHANTOM       = non-stocked sub-assembly; components roll up into the parent
    // SKU           = leaf/saleable unit (no further BOM)
    node_type: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'SKU',
      validate: { isIn: [['ROOT', 'ASSEMBLY', 'SUB_ASSEMBLY', 'PHANTOM', 'SKU']] },
    },
    parent_id: { type: DataTypes.INTEGER, allowNull: true },
    tree_level: { type: DataTypes.INTEGER, allowNull: true },
    sort_order: { type: DataTypes.INTEGER, defaultValue: 0 },
    product_code: { type: DataTypes.STRING(100), allowNull: true },
    part_name: { type: DataTypes.STRING(255), allowNull: true },
    color: { type: DataTypes.STRING(100), allowNull: true },
    category_id: { type: DataTypes.INTEGER, allowNull: true },
    item_id: { type: DataTypes.INTEGER, allowNull: true },
    description: { type: DataTypes.STRING(500), allowNull: true },
    finish_type: { type: DataTypes.STRING(50), allowNull: true },
    assembly_qty: { type: DataTypes.DECIMAL(20, 3), defaultValue: 0, allowNull: false },
    qty_per_pallet: { type: DataTypes.DECIMAL(12, 3), allowNull: true },
    // ── Engineering references ──
    drawing_no: { type: DataTypes.STRING(100), allowNull: true },
    revision: { type: DataTypes.STRING(50), allowNull: true },
    // Pin the active BOM version for this node (defaults to latest active BOM).
    default_bom_id: { type: DataTypes.INTEGER, allowNull: true },
    is_subassembly: { type: DataTypes.BOOLEAN, defaultValue: false },
    created_by: { type: DataTypes.INTEGER, allowNull: true },
    is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
    created_date: { type: DataTypes.DATEONLY, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  }, {
    tableName: 'm_product_master',
    timestamps: false,
    underscored: true,
    indexes: [
      { name: 'idx_product_parent', fields: ['parent_id'] },
      { name: 'idx_product_node_type', fields: ['node_type'] },
      { name: 'idx_product_item', fields: ['item_id'] },
    ],
  });

  ProductMaster.associate = (models) => {
    ProductMaster.hasMany(models.ProductItemMaster, { foreignKey: 'product_id', as: 'items' });
    ProductMaster.belongsTo(models.ItemMaster, { foreignKey: 'item_id', as: 'item' });
    ProductMaster.belongsTo(models.ProductCategory, { foreignKey: 'category_id', as: 'category' });
    ProductMaster.belongsTo(models.ProductMaster, { foreignKey: 'parent_id', as: 'parent' });
    ProductMaster.hasMany(models.ProductMaster, { foreignKey: 'parent_id', as: 'children' });
    ProductMaster.hasMany(models.BOM, { foreignKey: 'product_id', as: 'boms' });
    ProductMaster.belongsTo(models.BOM, { foreignKey: 'default_bom_id', as: 'defaultBom' });
  };

  return ProductMaster;
};
