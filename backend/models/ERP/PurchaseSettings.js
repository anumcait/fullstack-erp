const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const PurchaseSettings = sequelize.define(
    'PurchaseSettings',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        defaultValue: 1,
      },
      pr_prefix: { type: DataTypes.STRING(10), defaultValue: 'PR' },
      po_prefix: { type: DataTypes.STRING(10), defaultValue: 'PO' },
      rfq_prefix: { type: DataTypes.STRING(10), defaultValue: 'RFQ' },
      grn_prefix: { type: DataTypes.STRING(10), defaultValue: 'GRN' },
      fin_year_format: { type: DataTypes.STRING(20), defaultValue: 'FY-{YYYY}-{YY}' },
      default_payment_terms: { type: DataTypes.STRING(100), defaultValue: '30 Days' },
      default_delivery_terms: { type: DataTypes.TEXT, defaultValue: 'Ex Works' },
      default_currency: { type: DataTypes.STRING(10), defaultValue: 'INR' },
      default_gst_rate: { type: DataTypes.DECIMAL(5, 2), defaultValue: 18.00 },
      req_approval_required: { type: DataTypes.BOOLEAN, defaultValue: true },
      po_approval_required: { type: DataTypes.BOOLEAN, defaultValue: true },
      req_approval_limit: { type: DataTypes.DECIMAL(14, 2), defaultValue: 0 },
      po_approval_limit: { type: DataTypes.DECIMAL(14, 2), defaultValue: 0 },
      auto_generate_pr: { type: DataTypes.BOOLEAN, defaultValue: false },
      auto_generate_po: { type: DataTypes.BOOLEAN, defaultValue: false },
      auto_generate_rfq: { type: DataTypes.BOOLEAN, defaultValue: false },
      auto_generate_grn: { type: DataTypes.BOOLEAN, defaultValue: false },
      created_date: { type: DataTypes.DATEONLY, defaultValue: DataTypes.NOW },
      updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    },
    {
      tableName: 'm_purchase_settings',
      timestamps: false,
      underscored: true,
    }
  );
  return PurchaseSettings;
};
