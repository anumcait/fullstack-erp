module.exports = (sequelize, DataTypes) => {
  // A versioned snapshot of m_emp_salary. Each approved increment appends a row
  // stamped with the month it takes effect from, so a payslip run for any month
  // can resolve the salary that was in force then.
  const EmpSalaryHistory = sequelize.define('EmpSalaryHistory', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    empid: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    effective_month: DataTypes.INTEGER,
    effective_year: DataTypes.INTEGER,

    basic: DataTypes.INTEGER,
    hra: DataTypes.INTEGER,
    conveyance: DataTypes.INTEGER,
    washing_allowance: DataTypes.INTEGER,
    others1: DataTypes.INTEGER,
    others2: DataTypes.INTEGER,
    others3: DataTypes.INTEGER,
    others4: DataTypes.INTEGER,
    others5: DataTypes.INTEGER,
    others6: DataTypes.INTEGER,
    others7: DataTypes.INTEGER,
    others8: DataTypes.INTEGER,
    others9: DataTypes.INTEGER,
    deduct_others1: DataTypes.INTEGER,
    deduct_others2: DataTypes.INTEGER,
    deduct_others3: DataTypes.INTEGER,
    deduct_others4: DataTypes.INTEGER,

    IS_esi: { type: DataTypes.CHAR(1), field: 'i_s_esi', allowNull: true },
    IS_pf: { type: DataTypes.CHAR(1), field: 'i_s_pf', allowNull: true },
    IS_lic: { type: DataTypes.CHAR(1), field: 'i_s_lic', allowNull: true },
    IS_ot: { type: DataTypes.CHAR(1), field: 'i_s_ot', allowNull: true },
    tds_amount: DataTypes.INTEGER,
    lic_amount: DataTypes.INTEGER,
    pay_mode: DataTypes.STRING(10),

    increment_id: DataTypes.BIGINT,
    created_by: DataTypes.STRING(50),
    created_date: DataTypes.DATE
  }, {
    tableName: 'm_emp_salary_history',
    timestamps: false,
    indexes: [
      { fields: ['empid', 'effective_year', 'effective_month'] }
    ]
  });

  EmpSalaryHistory.associate = (models) => {
    EmpSalaryHistory.belongsTo(models.EmployeeMaster, { foreignKey: 'empid', as: 'employee' });
  };

  return EmpSalaryHistory;
};