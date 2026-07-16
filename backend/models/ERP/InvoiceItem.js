const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const InvoiceItem = sequelize.define(
    'InvoiceItem',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      invoice_id: { type: DataTypes.INTEGER, allowNull: false },
      item_id: { type: DataTypes.INTEGER, allowNull: true },
      item_code: { type: DataTypes.STRING(50), allowNull: true },
      item_name: { type: DataTypes.STRING(200), allowNull: false },
      hsn_code: { type: DataTypes.STRING(20), allowNull: true },
      quantity: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
      unit_id: { type: DataTypes.INTEGER, allowNull: true },
      rate: { type: DataTypes.DECIMAL(14, 2), defaultValue: 0 },
      discount_percent: { type: DataTypes.DECIMAL(5, 2), defaultValue: 0 },
      taxable_amount: { type: DataTypes.DECIMAL(14, 2), defaultValue: 0 },
      cgst_rate: { type: DataTypes.DECIMAL(5, 2), defaultValue: 0 },
      sgst_rate: { type: DataTypes.DECIMAL(5, 2), defaultValue: 0 },
      igst_rate: { type: DataTypes.DECIMAL(5, 2), defaultValue: 0 },
      cgst: { type: DataTypes.DECIMAL(14, 2), defaultValue: 0 },
      sgst: { type: DataTypes.DECIMAL(14, 2), defaultValue: 0 },
      igst: { type: DataTypes.DECIMAL(14, 2), defaultValue: 0 },
      amount: { type: DataTypes.DECIMAL(14, 2), defaultValue: 0 },
    },
    {
      tableName: 't_invoice_item',
      timestamps: false,
      underscored: true,
    }
  );

  InvoiceItem.associate = (models) => {
    InvoiceItem.belongsTo(models.Invoice, { foreignKey: 'invoice_id', as: 'invoice' });
  };

  return InvoiceItem;
};
