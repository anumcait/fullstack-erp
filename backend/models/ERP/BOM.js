const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const BOM = sequelize.define('BOM', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    bom_no: { type: DataTypes.STRING(50), allowNull: false, unique: true },
    bom_name: { type: DataTypes.STRING(200), allowNull: false },
    product_item_id: { type: DataTypes.INTEGER, allowNull: false },
    product_code: { type: DataTypes.STRING(50), allowNull: false },
    product_name: { type: DataTypes.STRING(200), allowNull: false },
    output_quantity: { type: DataTypes.DECIMAL(12, 2), defaultValue: 1 },
    unit_id: { type: DataTypes.INTEGER, allowNull: true },
    status: { type: DataTypes.STRING(20), defaultValue: 'Active' },
    version: { type: DataTypes.STRING(20), defaultValue: '1.0' },
    remarks: { type: DataTypes.TEXT, allowNull: true },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  }, {
    tableName: 't_bom',
    timestamps: false,
    underscored: true,
  });

  BOM.associate = (models) => {
    BOM.hasMany(models.BOMItem, { foreignKey: 'bom_id', as: 'items' });
    BOM.hasMany(models.BOMItem, { foreignKey: 'sub_bom_id', as: 'referencedByItems' });
  };

  return BOM;
};
