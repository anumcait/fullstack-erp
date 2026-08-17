const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const PurchaseReturn = sequelize.define(
    'PurchaseReturn',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      return_no: { type: DataTypes.STRING(30), allowNull: false, unique: true },
      return_date: { type: DataTypes.DATEONLY, allowNull: false },
      supplier_id: { type: DataTypes.INTEGER, allowNull: false },
      po_id: { type: DataTypes.INTEGER, allowNull: true },
      grn_id: { type: DataTypes.INTEGER, allowNull: true },
      debit_note_no: { type: DataTypes.STRING(30), allowNull: true, unique: true },
      debit_note_date: { type: DataTypes.DATEONLY, allowNull: true },
      return_reason: {
        type: DataTypes.STRING(30),
        allowNull: false,
        validate: { isIn: [['Quality Issue', 'Quantity Mismatch', 'Wrong Item', 'Damaged Goods', 'Excess Supply', 'Specification Mismatch', 'Other']] },
      },
      return_type: {
        type: DataTypes.STRING(20),
        defaultValue: 'Debit Note',
        validate: { isIn: [['Debit Note', 'Credit Note', 'Replacement']] },
      },
      status: {
        type: DataTypes.STRING(20),
        defaultValue: 'Draft',
        validate: { isIn: [['Draft', 'Submitted', 'Approved', 'Rejected', 'Cancelled', 'Completed']] },
      },
      subtotal: { type: DataTypes.DECIMAL(14, 2), defaultValue: 0 },
      discount_percent: { type: DataTypes.DECIMAL(5, 2), defaultValue: 0 },
      discount_amount: { type: DataTypes.DECIMAL(14, 2), defaultValue: 0 },
      taxable_amount: { type: DataTypes.DECIMAL(14, 2), defaultValue: 0 },
      cgst_amount: { type: DataTypes.DECIMAL(14, 2), defaultValue: 0 },
      sgst_amount: { type: DataTypes.DECIMAL(14, 2), defaultValue: 0 },
      igst_amount: { type: DataTypes.DECIMAL(14, 2), defaultValue: 0 },
      total_gst: { type: DataTypes.DECIMAL(14, 2), defaultValue: 0 },
      grand_total: { type: DataTypes.DECIMAL(14, 2), defaultValue: 0 },
      currency: { type: DataTypes.STRING(10), defaultValue: 'INR' },
      exchange_rate: { type: DataTypes.DECIMAL(10, 4), defaultValue: 1 },
      tds_applicable: { type: DataTypes.BOOLEAN, defaultValue: false },
      tds_section: { type: DataTypes.STRING(20), allowNull: true },
      tds_rate: { type: DataTypes.DECIMAL(5, 2), defaultValue: 0 },
      tds_amount: { type: DataTypes.DECIMAL(14, 2), defaultValue: 0 },
      tcs_applicable: { type: DataTypes.BOOLEAN, defaultValue: false },
      tcs_rate: { type: DataTypes.DECIMAL(5, 2), defaultValue: 0 },
      tcs_amount: { type: DataTypes.DECIMAL(14, 2), defaultValue: 0 },
      warehouse_id: { type: DataTypes.INTEGER, allowNull: true },
      remarks: { type: DataTypes.TEXT, allowNull: true },
      prepared_by: { type: DataTypes.STRING(100), allowNull: true },
      approved_by: { type: DataTypes.STRING(100), allowNull: true },
      approved_date: { type: DataTypes.DATE, allowNull: true },
      rejected_by: { type: DataTypes.STRING(100), allowNull: true },
      rejected_date: { type: DataTypes.DATE, allowNull: true },
      rejection_reason: { type: DataTypes.TEXT, allowNull: true },
      created_date: { type: DataTypes.DATEONLY, defaultValue: DataTypes.NOW },
      updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    },
    {
      tableName: 't_purchase_return',
      timestamps: false,
      underscored: true,
    }
  );

  PurchaseReturn.associate = (models) => {
    PurchaseReturn.hasMany(models.PurchaseReturnItem, {
      foreignKey: 'return_id', as: 'items',
    });
    PurchaseReturn.belongsTo(models.SupplierMaster, {
      foreignKey: 'supplier_id', as: 'supplier',
    });
    PurchaseReturn.belongsTo(models.PurchaseOrder, {
      foreignKey: 'po_id', as: 'purchaseOrder',
    });
    PurchaseReturn.belongsTo(models.GRN, {
      foreignKey: 'grn_id', as: 'grn',
    });
    PurchaseReturn.belongsTo(models.Warehouse, {
      foreignKey: 'warehouse_id', as: 'warehouse',
    });
  };

  return PurchaseReturn;
};