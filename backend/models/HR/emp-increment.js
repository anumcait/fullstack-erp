module.exports = (sequelize, DataTypes) => {
  // One row per salary increment application. On approval the computed new
  // value is written to m_emp_salary and a version is appended to
  // m_emp_salary_history so payroll can resolve the salary in force for a month.
  const EmpIncrement = sequelize.define('EmpIncrement', {
    increment_id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: false
    },
    empid: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    ename: DataTypes.STRING(100),
    department: DataTypes.STRING(100),
    designation: DataTypes.STRING(50),

    applied_date: DataTypes.DATE,
    effective_month: DataTypes.INTEGER,
    effective_year: DataTypes.INTEGER,

    // The per-component figures (component, inc_type, inc_value, old_value,
    // new_value) live in EmpIncrementLine — one entry can revise several heads.

    // Arrears to be settled along with this increment. The month count is
    // derived on save; the amount is calculated in a later phase.
    has_arrears: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false
    },
    arrears_from_month: DataTypes.INTEGER,
    arrears_from_year: DataTypes.INTEGER,
    arrears_to_month: DataTypes.INTEGER,
    arrears_to_year: DataTypes.INTEGER,
    arrears_months: DataTypes.INTEGER,
    arrears_amount: DataTypes.DECIMAL(12, 2),

    reason: DataTypes.TEXT,
    status: {
      type: DataTypes.STRING(20),
      defaultValue: 'Pending'
    },
    approval_remark: DataTypes.STRING(200),
    approved_by: DataTypes.STRING(50),
    approved_date: DataTypes.DATE,
    created_by: DataTypes.STRING(50),
    // Set when the approval actually wrote m_emp_salary, so a re-approve
    // can never double-apply the increment.
    applied_to_salary: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false
    }
  }, {
    tableName: 'm_emp_increment',
    timestamps: false
  });

  EmpIncrement.associate = (models) => {
    EmpIncrement.belongsTo(models.EmployeeMaster, { foreignKey: 'empid', as: 'employee' });
    EmpIncrement.hasMany(models.EmpIncrementLine, { foreignKey: 'increment_id', as: 'lines' });
  };

  return EmpIncrement;
};