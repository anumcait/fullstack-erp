const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const VoucherType = sequelize.define('VoucherType', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    code: { type: DataTypes.STRING(10), allowNull: false, unique: true },
    name: { type: DataTypes.STRING(100), allowNull: false },
    is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
  }, {
    tableName: 'voucher_types',

    timestamps: true,

    createdAt: 'created_date',

    updatedAt: 'updated_at',
  });

  VoucherType.associate = (models) => {
    VoucherType.hasMany(models.Voucher, { foreignKey: 'voucher_type_id' });
  };

  return VoucherType;
};
