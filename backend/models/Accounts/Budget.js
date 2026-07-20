const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Budget = sequelize.define('Budget', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    financial_year_id: { type: DataTypes.INTEGER, allowNull: false },
    account_id: { type: DataTypes.INTEGER, allowNull: false },
    jan: { type: DataTypes.DECIMAL(16, 2), defaultValue: 0 },
    feb: { type: DataTypes.DECIMAL(16, 2), defaultValue: 0 },
    mar: { type: DataTypes.DECIMAL(16, 2), defaultValue: 0 },
    apr: { type: DataTypes.DECIMAL(16, 2), defaultValue: 0 },
    may: { type: DataTypes.DECIMAL(16, 2), defaultValue: 0 },
    jun: { type: DataTypes.DECIMAL(16, 2), defaultValue: 0 },
    jul: { type: DataTypes.DECIMAL(16, 2), defaultValue: 0 },
    aug: { type: DataTypes.DECIMAL(16, 2), defaultValue: 0 },
    sep: { type: DataTypes.DECIMAL(16, 2), defaultValue: 0 },
    oct: { type: DataTypes.DECIMAL(16, 2), defaultValue: 0 },
    nov: { type: DataTypes.DECIMAL(16, 2), defaultValue: 0 },
    dec: { type: DataTypes.DECIMAL(16, 2), defaultValue: 0 },
  }, {
    tableName: 'budgets',

    timestamps: true,

    createdAt: 'created_date',

    updatedAt: 'updated_at',
  });

  Budget.associate = (models) => {
    Budget.belongsTo(models.FinancialYear, { as: 'financialYear', foreignKey: 'financial_year_id' });
    Budget.belongsTo(models.ChartOfAccount, { as: 'account', foreignKey: 'account_id' });
  };

  return Budget;
};
