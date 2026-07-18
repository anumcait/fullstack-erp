const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const QuotationItem = sequelize.define('QuotationItem', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    quotation_id: { type: DataTypes.INTEGER, allowNull: false },
    item_description: { type: DataTypes.TEXT, allowNull: false },
    quantity: { type: DataTypes.DECIMAL(12, 2), defaultValue: 1 },
    unit: { type: DataTypes.STRING(20) },
    unit_price: { type: DataTypes.DECIMAL(14, 2), defaultValue: 0 },
    discount_percent: { type: DataTypes.DECIMAL(5, 2), defaultValue: 0 },
    net_price: { type: DataTypes.DECIMAL(14, 2), defaultValue: 0 },
    total_price: { type: DataTypes.DECIMAL(14, 2), defaultValue: 0 },
  }, {
    tableName: 't_quotation_items',
    timestamps: true,
  });

  QuotationItem.associate = (models) => {
    QuotationItem.belongsTo(models.Quotation, { as: 'quotation', foreignKey: 'quotation_id' });
  };

  return QuotationItem;
};
