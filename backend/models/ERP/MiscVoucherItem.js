const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const MiscVoucherItem = sequelize.define(
    'MiscVoucherItem',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      voucher_id: { type: DataTypes.INTEGER, allowNull: false },
      description: { type: DataTypes.STRING(255), allowNull: false },
      amount: { type: DataTypes.DECIMAL(14, 2), defaultValue: 0 },
      remarks: { type: DataTypes.STRING(255), allowNull: true },
    },
    {
      tableName: 't_misc_voucher_item',
      timestamps: false,
      underscored: true,
    }
  );

  MiscVoucherItem.associate = (models) => {
    MiscVoucherItem.belongsTo(models.MiscVoucher, {
      foreignKey: 'voucher_id', as: 'voucher',
    });
  };

  return MiscVoucherItem;
};
