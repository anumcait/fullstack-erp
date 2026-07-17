const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ItemMaster = sequelize.define(
    'ItemMaster',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      item_code: { type: DataTypes.STRING(50), allowNull: false, unique: true },
      item_name: { type: DataTypes.STRING(255), allowNull: false },
      item_description: { type: DataTypes.TEXT, allowNull: true },

      group_id: { type: DataTypes.INTEGER, allowNull: true },
      subgroup_id: { type: DataTypes.INTEGER, allowNull: true },
      type_id: { type: DataTypes.INTEGER, allowNull: true },
      subtype_id: { type: DataTypes.INTEGER, allowNull: true },

      unit_id: { type: DataTypes.INTEGER, allowNull: true },

      hsn_code: { type: DataTypes.STRING(20), allowNull: true },
      gst_rate: { type: DataTypes.DECIMAL(5, 2), defaultValue: 0 },
      brand: { type: DataTypes.STRING(100), allowNull: true },

      // ── Stock ──
      opening_stock: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
      current_stock: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
      min_stock: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
      max_stock: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
      reorder_level: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
      min_order_qty: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
      reorder_qty: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
      lead_time_days: { type: DataTypes.INTEGER, allowNull: true },
      default_location: { type: DataTypes.STRING(100), allowNull: true },
      abc_class: { type: DataTypes.STRING(1), allowNull: true },

      // ── Costing (driven by billing / GRR invoices) ──
      valuation_method: { type: DataTypes.STRING(20), defaultValue: 'Moving Average' },
      standard_cost: { type: DataTypes.DECIMAL(14, 2), defaultValue: 0 },
      last_purchase_cost: { type: DataTypes.DECIMAL(14, 2), defaultValue: 0 },
      moving_average_cost: { type: DataTypes.DECIMAL(14, 2), defaultValue: 0 },
      mrp: { type: DataTypes.DECIMAL(14, 2), defaultValue: 0 },

      track_serial: { type: DataTypes.BOOLEAN, defaultValue: false },
      track_batch: { type: DataTypes.BOOLEAN, defaultValue: false },
      barcode: { type: DataTypes.STRING(50), allowNull: true },
      barcode_type: { type: DataTypes.STRING(20), allowNull: true },
      attributes: { type: DataTypes.JSON, allowNull: true },

      is_active: { type: DataTypes.BOOLEAN, defaultValue: true },

      // ── Audit trail ──
      created_by: { type: DataTypes.STRING(100), allowNull: true },
      updated_by: { type: DataTypes.STRING(100), allowNull: true },
      approved_by: { type: DataTypes.STRING(100), allowNull: true },
      approved_date: { type: DataTypes.DATE, allowNull: true },
      authorized_by: { type: DataTypes.STRING(100), allowNull: true },
      authorized_date: { type: DataTypes.DATE, allowNull: true },

      created_date: { type: DataTypes.DATEONLY, defaultValue: DataTypes.NOW },
      updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    },
    { tableName: 'm_item_master', timestamps: false, underscored: true }
  );

  ItemMaster.associate = (models) => {
    ItemMaster.belongsTo(models.ItemGroup, { foreignKey: 'group_id', as: 'group' });
    ItemMaster.belongsTo(models.ItemSubGroup, { foreignKey: 'subgroup_id', as: 'subGroup' });
    ItemMaster.belongsTo(models.ItemType, { foreignKey: 'type_id', as: 'type' });
    ItemMaster.belongsTo(models.ItemSubType, { foreignKey: 'subtype_id', as: 'subType' });
    ItemMaster.belongsTo(models.Unit, { foreignKey: 'unit_id', as: 'unit' });
  };

  return ItemMaster;
};
