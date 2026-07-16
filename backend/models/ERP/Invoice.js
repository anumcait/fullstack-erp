const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Invoice = sequelize.define(
    'Invoice',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      invoice_no: { type: DataTypes.STRING(30), allowNull: false, unique: true },
      invoice_date: { type: DataTypes.DATEONLY, allowNull: false },
      party_id: { type: DataTypes.INTEGER, allowNull: true },
      party_name: { type: DataTypes.STRING(200), allowNull: true },
      party_gstin: { type: DataTypes.STRING(20), allowNull: true },
      address: { type: DataTypes.TEXT, allowNull: true },
      place_of_supply: { type: DataTypes.STRING(50), allowNull: true },
      dc_id: { type: DataTypes.INTEGER, allowNull: true },
      dc_no: { type: DataTypes.STRING(30), allowNull: true },
      subtotal: { type: DataTypes.DECIMAL(14, 2), defaultValue: 0 },
      total_cgst: { type: DataTypes.DECIMAL(14, 2), defaultValue: 0 },
      total_sgst: { type: DataTypes.DECIMAL(14, 2), defaultValue: 0 },
      total_igst: { type: DataTypes.DECIMAL(14, 2), defaultValue: 0 },
      grand_total: { type: DataTypes.DECIMAL(14, 2), defaultValue: 0 },
      remarks: { type: DataTypes.TEXT, allowNull: true },
      paid_status: {
        type: DataTypes.STRING(20),
        defaultValue: 'Unpaid',
        validate: { isIn: [['Unpaid', 'Partially Paid', 'Paid']] },
      },
      status: {
        type: DataTypes.STRING(20),
        defaultValue: 'Draft',
        validate: { isIn: [['Draft', 'Billed', 'Cancelled']] },
      },
      created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
      updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    },
    {
      tableName: 't_invoice',
      timestamps: false,
      underscored: true,
    }
  );

  Invoice.associate = (models) => {
    Invoice.hasMany(models.InvoiceItem, { foreignKey: 'invoice_id', as: 'items' });
  };

  return Invoice;
};
