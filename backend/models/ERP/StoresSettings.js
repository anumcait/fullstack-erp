const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const StoresSettings = sequelize.define(
    'StoresSettings',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, defaultValue: 1 },
      mr_prefix: { type: DataTypes.STRING(10), defaultValue: 'MR' },
      mi_prefix: { type: DataTypes.STRING(10), defaultValue: 'MI' },
      default_warehouse: { type: DataTypes.STRING(100), defaultValue: 'Main Store' },
      valuation_method: { type: DataTypes.STRING(20), defaultValue: 'FIFO' },
      bin_location_required: { type: DataTypes.BOOLEAN, defaultValue: true },
      batch_tracking_enabled: { type: DataTypes.BOOLEAN, defaultValue: false },
      auto_generate_mr: { type: DataTypes.BOOLEAN, defaultValue: false },
      auto_generate_mi: { type: DataTypes.BOOLEAN, defaultValue: false },
      grn_prefix: { type: DataTypes.STRING(10), defaultValue: 'GRR' },
      auto_generate_grn: { type: DataTypes.BOOLEAN, defaultValue: false },
      negative_stock_allowed: { type: DataTypes.BOOLEAN, defaultValue: false },
      low_stock_alert: { type: DataTypes.BOOLEAN, defaultValue: true },
      created_date: { type: DataTypes.DATEONLY, defaultValue: DataTypes.NOW },
      updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    },
    {
      tableName: 'm_stores_settings',
      timestamps: false,
      underscored: true,
    }
  );
  return StoresSettings;
};
