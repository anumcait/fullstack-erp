const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const StockLedger = sequelize.define(
    'StockLedger',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

      // Transaction timestamp (business date/time)
      ledger_date: { type: DataTypes.DATE, allowNull: false },
      ledger_time: { type: DataTypes.STRING(10), allowNull: true },

      // Document identity
      doc_no: { type: DataTypes.STRING(50), allowNull: true }, // GRR#/MI#/INV#...
      ref_type: { type: DataTypes.STRING(50), allowNull: false }, // Opening/Purchase/Purchase Return/Sales/Material Issue/Material Return/Production In/Production Consumption/Transfer/Stock Adjustment/Delivery Challan/DC Return/Damage/Wastage
      ref_no: { type: DataTypes.STRING(50), allowNull: true }, // source doc no (same as doc_no usually)
      reference: { type: DataTypes.STRING(200), allowNull: true }, // supplier/customer/notes reference

      // Dimensions
      warehouse_id: { type: DataTypes.INTEGER, allowNull: true },
      item_id: { type: DataTypes.INTEGER, allowNull: false },
      batch_id: { type: DataTypes.INTEGER, allowNull: true },
      serial_no: { type: DataTypes.STRING(100), allowNull: true },

      // Movement
      qty_in: { type: DataTypes.DECIMAL(14, 3), defaultValue: 0 },
      qty_out: { type: DataTypes.DECIMAL(14, 3), defaultValue: 0 },
      unit_cost: { type: DataTypes.DECIMAL(16, 4), allowNull: true },
      selling_price: { type: DataTypes.DECIMAL(16, 4), allowNull: true },
      stock_value: { type: DataTypes.DECIMAL(16, 2), defaultValue: 0 }, // value of this movement

      remarks: { type: DataTypes.TEXT, allowNull: true },

      // Audit trail
      created_by: { type: DataTypes.STRING(100), allowNull: true },
      // If set, this row reverses the ledger row with this id (cancellation/delete)
      reversal_of: { type: DataTypes.INTEGER, allowNull: true },

      created_date: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    },
    {
      tableName: 't_stock_ledger',
      timestamps: false,
      underscored: true,
      indexes: [
        { fields: ['item_id'] },
        { fields: ['ledger_date'] },
        { fields: ['warehouse_id'] },
        { fields: ['ref_type'] },
        { fields: ['item_id', 'ledger_date'] },
      ],
    }
  );

  StockLedger.associate = (models) => {
    StockLedger.belongsTo(models.ItemMaster, { foreignKey: 'item_id', as: 'item' });
    StockLedger.belongsTo(models.Warehouse, { foreignKey: 'warehouse_id', as: 'warehouse' });
    StockLedger.belongsTo(models.Batch, { foreignKey: 'batch_id', as: 'batch' });
  };

  return StockLedger;
};
