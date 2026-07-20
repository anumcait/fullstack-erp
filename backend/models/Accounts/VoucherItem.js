const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const VoucherItem = sequelize.define('VoucherItem', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    voucher_id: { type: DataTypes.INTEGER, allowNull: false },
    account_id: { type: DataTypes.INTEGER, allowNull: false },
    debit: { type: DataTypes.DECIMAL(16, 2), defaultValue: 0 },
    credit: { type: DataTypes.DECIMAL(16, 2), defaultValue: 0 },
    against_account_id: { type: DataTypes.INTEGER, allowNull: true },
    reference_no: { type: DataTypes.STRING(50), allowNull: true },
    narration: { type: DataTypes.TEXT, allowNull: true },
    cost_center_id: { type: DataTypes.INTEGER, allowNull: true },
  }, {
    tableName: 'voucher_items',

    timestamps: true,

    createdAt: 'created_date',

    updatedAt: 'updated_at',
  });

  VoucherItem.associate = (models) => {
    VoucherItem.belongsTo(models.Voucher, { as: 'voucher', foreignKey: 'voucher_id' });
    VoucherItem.belongsTo(models.ChartOfAccount, { as: 'account', foreignKey: 'account_id' });
    VoucherItem.belongsTo(models.ChartOfAccount, { as: 'againstAccount', foreignKey: 'against_account_id' });
  };

  return VoucherItem;
};
