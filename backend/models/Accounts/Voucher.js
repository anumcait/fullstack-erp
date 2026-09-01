const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Voucher = sequelize.define('Voucher', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    voucher_no: { type: DataTypes.STRING(50), allowNull: false, unique: true },
    voucher_type_id: { type: DataTypes.INTEGER, allowNull: false },
    financial_year_id: { type: DataTypes.INTEGER, allowNull: true },
    date: { type: DataTypes.DATEONLY, allowNull: false },
    reference_no: { type: DataTypes.STRING(50), allowNull: true },
    reference_date: { type: DataTypes.DATEONLY, allowNull: true },
    narration: { type: DataTypes.TEXT, allowNull: true },
    total_debit: { type: DataTypes.DECIMAL(16, 2), defaultValue: 0 },
    total_credit: { type: DataTypes.DECIMAL(16, 2), defaultValue: 0 },
    status: { type: DataTypes.STRING(30), defaultValue: 'Draft' },
    created_by: { type: DataTypes.INTEGER, allowNull: true },
    approved_by: { type: DataTypes.INTEGER, allowNull: true },
    approved_at: { type: DataTypes.DATE, allowNull: true },
  }, {
    tableName: 'vouchers',

    timestamps: true,

    createdAt: 'created_date',

    updatedAt: 'updated_at',
  });

  Voucher.associate = (models) => {
    Voucher.belongsTo(models.VoucherType, { as: 'voucherType', foreignKey: 'voucher_type_id' });
    Voucher.belongsTo(models.FinancialYear, { as: 'financialYear', foreignKey: 'financial_year_id' });
    Voucher.hasMany(models.VoucherItem, { as: 'items', foreignKey: 'voucher_id' });
  };

  return Voucher;
};
