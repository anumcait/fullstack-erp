const { DataTypes } = require('sequelize');

module.exports = (sequelize) => ({
  TaxRegime: sequelize.define('TaxRegime', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    empid: { type: DataTypes.INTEGER, allowNull: false },
    financial_year: { type: DataTypes.STRING(20), allowNull: false },
    regime: { type: DataTypes.STRING(10), allowNull: false, defaultValue: 'new' },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  }, { tableName: 't_emp_tax_regime', timestamps: false, underscored: true }),

  TaxInvestment: sequelize.define('TaxInvestment', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    empid: { type: DataTypes.INTEGER, allowNull: false },
    financial_year: { type: DataTypes.STRING(20), allowNull: false },
    section: { type: DataTypes.STRING(20), allowNull: false },
    description: { type: DataTypes.STRING(200) },
    amount: { type: DataTypes.DECIMAL(14, 2), defaultValue: 0 },
    proof_attached: { type: DataTypes.BOOLEAN, defaultValue: false },
    declared_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  }, { tableName: 't_emp_tax_investment', timestamps: false, underscored: true }),

  TaxComputation: sequelize.define('TaxComputation', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    empid: { type: DataTypes.INTEGER, allowNull: false },
    financial_year: { type: DataTypes.STRING(20), allowNull: false },
    gross_income: { type: DataTypes.DECIMAL(14, 2), defaultValue: 0 },
    standard_deduction: { type: DataTypes.DECIMAL(14, 2), defaultValue: 0 },
    total_deductions: { type: DataTypes.DECIMAL(14, 2), defaultValue: 0 },
    taxable_income: { type: DataTypes.DECIMAL(14, 2), defaultValue: 0 },
    tax_before_cess: { type: DataTypes.DECIMAL(14, 2), defaultValue: 0 },
    rebate_87a: { type: DataTypes.DECIMAL(14, 2), defaultValue: 0 },
    education_cess: { type: DataTypes.DECIMAL(14, 2), defaultValue: 0 },
    total_tax: { type: DataTypes.DECIMAL(14, 2), defaultValue: 0 },
    tds_deducted: { type: DataTypes.DECIMAL(14, 2), defaultValue: 0 },
    tax_due: { type: DataTypes.DECIMAL(14, 2), defaultValue: 0 },
    status: { type: DataTypes.STRING(20), defaultValue: 'Draft' },
    computed_at: { type: DataTypes.DATE },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  }, { tableName: 't_emp_tax_computation', timestamps: false, underscored: true }),
});
