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

      // ── Item nature (drives planning, MRP & BOM explosion) ──
      // Buy    = purchased, not manufactured (raw material, component, packing)
      // Make   = manufactured in-house (assembly / sub-assembly / finished good)
      // Phantom= non-stocked sub-assembly; its components are pulled straight into the parent
      make_buy: {
        type: DataTypes.STRING(10),
        allowNull: false,
        defaultValue: 'Buy',
        validate: { isIn: [['Buy', 'Make', 'Phantom']] },
      },
      is_purchase_item: { type: DataTypes.BOOLEAN, defaultValue: true },
      is_sales_item: { type: DataTypes.BOOLEAN, defaultValue: false },
      is_stock_item: { type: DataTypes.BOOLEAN, defaultValue: true },

      unit_id: { type: DataTypes.INTEGER, allowNull: true },

      // ── Engineering references ──
      drawing_no: { type: DataTypes.STRING(50), allowNull: true },
      revision: { type: DataTypes.STRING(20), allowNull: true },
      default_warehouse_id: { type: DataTypes.INTEGER, allowNull: true },

      // ── Alternate UOM (purchase/stock conversion) ──
      alt_unit_id: { type: DataTypes.INTEGER, allowNull: true },
      conversion_factor: { type: DataTypes.DECIMAL(14, 4), defaultValue: 1 },

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
    {
      tableName: 'm_item_master',
      timestamps: false,
      underscored: true,
      indexes: [
        { name: 'idx_item_group_active', fields: ['group_id', 'is_active'] },
        { name: 'idx_item_make_buy', fields: ['make_buy'] },
        { name: 'idx_item_subtype', fields: ['subtype_id'] },
      ],
    }
  );

  // Derive the stock/purchase flags deterministically from the item's nature so
  // downstream modules (GRN, MRP, sales, stock ledger) can rely on them without
  // re-deriving the make/buy rule every time.
  ItemMaster.beforeValidate((item) => {
    if (item.make_buy === 'Make') {
      item.is_purchase_item = false;
      item.is_stock_item = true;
    } else if (item.make_buy === 'Phantom') {
      item.is_purchase_item = false;
      item.is_stock_item = false;
    } else {
      item.is_purchase_item = true;
      item.is_stock_item = true;
    }
  });
  ItemMaster.beforeUpdate(async (item) => {
    if (item.changed('item_code')) {
      const c = await sequelize.models.StockLedger ? await sequelize.query('SELECT COUNT(*)::int as c FROM t_stock_ledger WHERE item_id=:id', { replacements: { id: item.id }, type: sequelize.QueryTypes.SELECT }) : [];
      if (c[0] && c[0].c > 0) throw new Error('Item code is frozen after transactions — create new code instead');
    }
  });

  ItemMaster.associate = (models) => {
    ItemMaster.belongsTo(models.ItemGroup, { foreignKey: 'group_id', as: 'group' });
    ItemMaster.belongsTo(models.ItemSubGroup, { foreignKey: 'subgroup_id', as: 'subGroup' });
    ItemMaster.belongsTo(models.ItemType, { foreignKey: 'type_id', as: 'type' });
    ItemMaster.belongsTo(models.ItemSubType, { foreignKey: 'subtype_id', as: 'subType' });
    ItemMaster.belongsTo(models.Unit, { foreignKey: 'unit_id', as: 'unit' });
    ItemMaster.belongsTo(models.Unit, { foreignKey: 'alt_unit_id', as: 'altUnit' });
    ItemMaster.belongsTo(models.Warehouse, { foreignKey: 'default_warehouse_id', as: 'defaultWarehouse' });
  };

  return ItemMaster;
};
