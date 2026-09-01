// Legacy ERP item data sourced from Oracle (parallel to Postgres ERP DB).
module.exports = (sequelize, DataTypes) => {
  const LegacyErpItem = sequelize.define('LegacyErpItem', {
    item_id:   { type: DataTypes.INTEGER, primaryKey: true },
    item_code: { type: DataTypes.STRING(50) },
    item_name: { type: DataTypes.STRING(150) },
    uom:       { type: DataTypes.STRING(10) },
    unit_cost: { type: DataTypes.DECIMAL(14, 2) },
  }, {
    tableName: 'LEGACY_ERP_ITEMS',
    schema: 'ERP',
    timestamps: false,
  });

  return LegacyErpItem;
};
