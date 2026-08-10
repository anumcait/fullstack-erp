const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const MiscVoucher = sequelize.define(
    'MiscVoucher',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      voucher_no: { type: DataTypes.STRING(50), allowNull: false, unique: true },
      voucher_date: { type: DataTypes.DATEONLY, allowNull: false },
      voucher_type: {
        type: DataTypes.STRING(20),
        defaultValue: 'Miscellaneous',
        validate: { isIn: [['Miscellaneous', 'Petty Cash']] },
      },
      party_name: { type: DataTypes.STRING(200), allowNull: true },
      remarks: { type: DataTypes.TEXT, allowNull: true },
      total_amount: { type: DataTypes.DECIMAL(14, 2), defaultValue: 0 },
      status: {
        type: DataTypes.STRING(20),
        defaultValue: 'Draft',
        validate: { isIn: [['Draft', 'Approved', 'Cancelled']] },
      },
      approved_by: { type: DataTypes.STRING(100), allowNull: true },
      approved_date: { type: DataTypes.DATE, allowNull: true },
      cancel_remarks: { type: DataTypes.TEXT, allowNull: true },
      created_by: { type: DataTypes.STRING(100), allowNull: true },
      created_date: { type: DataTypes.DATEONLY, defaultValue: DataTypes.NOW },
      updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    },
    {
      tableName: 't_misc_voucher',
      timestamps: false,
      underscored: true,
    }
  );

  MiscVoucher.associate = (models) => {
    MiscVoucher.hasMany(models.MiscVoucherItem, {
      foreignKey: 'voucher_id', as: 'items',
    });
  };

  return MiscVoucher;
};
