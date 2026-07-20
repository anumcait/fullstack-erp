const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Quotation = sequelize.define('Quotation', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    quote_no: { type: DataTypes.STRING(50), allowNull: false, unique: true },
    customer_id: { type: DataTypes.INTEGER, allowNull: false },
    lead_id: { type: DataTypes.INTEGER },
    date: { type: DataTypes.DATEONLY, allowNull: false },
    valid_until: { type: DataTypes.DATEONLY },
    subject: { type: DataTypes.STRING(255) },
    subtotal: { type: DataTypes.DECIMAL(14, 2), defaultValue: 0 },
    discount_percent: { type: DataTypes.DECIMAL(5, 2), defaultValue: 0 },
    discount_amount: { type: DataTypes.DECIMAL(14, 2), defaultValue: 0 },
    tax_rate: { type: DataTypes.DECIMAL(5, 2), defaultValue: 0 },
    tax_amount: { type: DataTypes.DECIMAL(14, 2), defaultValue: 0 },
    shipping_charges: { type: DataTypes.DECIMAL(14, 2), defaultValue: 0 },
    total_amount: { type: DataTypes.DECIMAL(14, 2), defaultValue: 0 },
    status: { type: DataTypes.ENUM('Draft', 'Sent', 'Accepted', 'Rejected', 'Expired'), defaultValue: 'Draft' },
    terms: { type: DataTypes.TEXT },
    notes: { type: DataTypes.TEXT },
    created_by: { type: DataTypes.INTEGER },
  }, {
    tableName: 't_quotations',

    timestamps: true,

    createdAt: 'created_date',

    updatedAt: 'updated_at',
  });

  Quotation.associate = (models) => {
    Quotation.belongsTo(models.CustomerMaster, { as: 'customer', foreignKey: 'customer_id' });
    Quotation.belongsTo(models.Lead, { as: 'lead', foreignKey: 'lead_id' });
    Quotation.hasMany(models.QuotationItem, { as: 'items', foreignKey: 'quotation_id' });
  };

  return Quotation;
};
