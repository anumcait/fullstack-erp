const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const BOM = sequelize.define('BOM', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    bom_no: { type: DataTypes.STRING(50), allowNull: false, unique: true },
    bom_name: { type: DataTypes.STRING(200), allowNull: false },
    product_item_id: { type: DataTypes.INTEGER, allowNull: true },
    product_code: { type: DataTypes.STRING(50), allowNull: false },
    product_name: { type: DataTypes.STRING(200), allowNull: false },
    product_id: { type: DataTypes.INTEGER, allowNull: true },
    output_quantity: { type: DataTypes.DECIMAL(12, 2), defaultValue: 1 },
    unit_id: { type: DataTypes.INTEGER, allowNull: true },
    status: { type: DataTypes.STRING(20), defaultValue: 'Active' },
    version: { type: DataTypes.STRING(20), defaultValue: '1.0' },
    // ── Costing (per output batch) ──
    labour_cost: { type: DataTypes.DECIMAL(14, 2), defaultValue: 0 },
    overhead_cost: { type: DataTypes.DECIMAL(14, 2), defaultValue: 0 },
    overhead_is_percent: { type: DataTypes.BOOLEAN, defaultValue: false },
    margin_percent: { type: DataTypes.DECIMAL(5, 2), defaultValue: 0 },
    selling_price: { type: DataTypes.DECIMAL(14, 2), defaultValue: 0 },
    remarks: { type: DataTypes.TEXT, allowNull: true },
    created_date: { type: DataTypes.DATEONLY, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  }, {
    tableName: 't_bom',
    timestamps: false,
    underscored: true,
  });

  BOM.associate = (models) => {
    BOM.hasMany(models.BOMItem, { foreignKey: 'bom_id', as: 'items' });
    BOM.hasMany(models.BOMItem, { foreignKey: 'sub_bom_id', as: 'referencedByItems' });
    BOM.belongsTo(models.ProductMaster, { foreignKey: 'product_id', as: 'product' });
  };

  return BOM;
};
