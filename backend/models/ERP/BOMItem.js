const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const BOMItem = sequelize.define('BOMItem', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    bom_id: { type: DataTypes.INTEGER, allowNull: false },
    parent_item_id: { type: DataTypes.INTEGER, allowNull: true },
    sub_bom_id: { type: DataTypes.INTEGER, allowNull: true },
    sort_order: { type: DataTypes.INTEGER, defaultValue: 0 },
    section_name: { type: DataTypes.STRING(100), allowNull: true },
    is_phantom: { type: DataTypes.BOOLEAN, defaultValue: false },
    item_id: { type: DataTypes.INTEGER, allowNull: true },
    item_code: { type: DataTypes.STRING(50), allowNull: true },
    item_name: { type: DataTypes.STRING(200), allowNull: false },
    quantity: { type: DataTypes.DECIMAL(12, 4), allowNull: false },
    lot_quantity: { type: DataTypes.DECIMAL(12, 2), defaultValue: 1 },
    unit_id: { type: DataTypes.INTEGER, allowNull: true },
    wastage_percent: { type: DataTypes.DECIMAL(5, 2), defaultValue: 0 },
    color: { type: DataTypes.STRING(100), allowNull: true },
    remarks: { type: DataTypes.TEXT, allowNull: true },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  }, {
    tableName: 't_bom_item',
    timestamps: false,
    underscored: true,
  });

  BOMItem.associate = (models) => {
    BOMItem.belongsTo(models.BOM, { foreignKey: 'bom_id', as: 'bom' });
    BOMItem.belongsTo(models.BOMItem, { foreignKey: 'parent_item_id', as: 'parent' });
    BOMItem.hasMany(models.BOMItem, { foreignKey: 'parent_item_id', as: 'children' });
    BOMItem.belongsTo(models.BOM, { foreignKey: 'sub_bom_id', as: 'subBom' });
  };

  return BOMItem;
};
