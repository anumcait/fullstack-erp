const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ChartOfAccount = sequelize.define('ChartOfAccount', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    account_code: { type: DataTypes.STRING(20), allowNull: false, unique: true },
    account_name: { type: DataTypes.STRING(255), allowNull: false },
    account_type: { type: DataTypes.ENUM('Asset', 'Liability', 'Equity', 'Income', 'Expense'), allowNull: false },
    parent_id: { type: DataTypes.INTEGER, allowNull: true },
    is_group: { type: DataTypes.BOOLEAN, defaultValue: false },
    is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
    opening_balance: { type: DataTypes.DECIMAL(16, 2), defaultValue: 0 },
    opening_balance_type: { type: DataTypes.ENUM('Dr', 'Cr'), allowNull: true },
    notes: { type: DataTypes.TEXT, allowNull: true },
  }, {
    tableName: 'chart_of_accounts',

    timestamps: true,

    createdAt: 'created_date',

    updatedAt: 'updated_at',
  });

  ChartOfAccount.associate = (models) => {
    ChartOfAccount.belongsTo(models.ChartOfAccount, { as: 'parent', foreignKey: 'parent_id' });
    ChartOfAccount.hasMany(models.ChartOfAccount, { as: 'children', foreignKey: 'parent_id' });
    ChartOfAccount.hasMany(models.VoucherItem, { foreignKey: 'account_id' });
    ChartOfAccount.hasMany(models.Budget, { foreignKey: 'account_id' });
  };

  return ChartOfAccount;
};
