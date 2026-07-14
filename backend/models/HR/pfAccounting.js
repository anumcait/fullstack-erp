const { DataTypes } = require('sequelize');

module.exports = (sequelize) => ({
  PfLedger: sequelize.define('PfLedger', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    empid: { type: DataTypes.INTEGER, allowNull: false },
    financial_year: { type: DataTypes.STRING(20) },
    month: { type: DataTypes.INTEGER },
    pf_wages: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
    employee_share: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
    employer_share: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
    eps_share: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
    epf_share: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
    status: { type: DataTypes.STRING(20), defaultValue: 'Active' },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  }, { tableName: 't_pf_ledger', timestamps: false, underscored: true }),

  PfChallan: sequelize.define('PfChallan', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    challan_no: { type: DataTypes.STRING(30), unique: true },
    financial_year: { type: DataTypes.STRING(20) },
    month: { type: DataTypes.INTEGER },
    total_employees: { type: DataTypes.INTEGER, defaultValue: 0 },
    total_wages: { type: DataTypes.DECIMAL(14, 2), defaultValue: 0 },
    total_employee_share: { type: DataTypes.DECIMAL(14, 2), defaultValue: 0 },
    total_employer_share: { type: DataTypes.DECIMAL(14, 2), defaultValue: 0 },
    total_eps: { type: DataTypes.DECIMAL(14, 2), defaultValue: 0 },
    total_epf: { type: DataTypes.DECIMAL(14, 2), defaultValue: 0 },
    grand_total: { type: DataTypes.DECIMAL(14, 2), defaultValue: 0 },
    remitted_date: { type: DataTypes.DATEONLY },
    status: { type: DataTypes.STRING(20), defaultValue: 'Draft' },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  }, { tableName: 't_pf_challan', timestamps: false, underscored: true }),
});
