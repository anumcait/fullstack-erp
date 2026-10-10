module.exports = (sequelize, DataTypes) => {
  // A manual correction to one deduction line of one employee's payslip for one
  // month, e.g. PF agreed with the challan at 2164 instead of the computed 1800.
  // The payroll run re-applies these after computing its own figures, so a
  // regenerated payslip keeps the correction instead of silently reverting it.
  const PayrollAdjustment = sequelize.define('PayrollAdjustment', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    empid: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    ename: DataTypes.STRING(100),
    // Matches emp_payslip.C_MONTH ('JAN'..'DEC') so it joins without conversion.
    C_MONTH: DataTypes.STRING(10),
    C_YEAR: DataTypes.INTEGER,

    // PF | ESI | PT | LIC | TAX | ADV | OTH | LATE_DED - the absolute amount the
    // line should carry, not a delta.
    component: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false
    },
    // The computed figure at the time of correction, kept for the audit trail.
    previous_amount: DataTypes.DECIMAL(12, 2),
    reason: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    created_by: DataTypes.STRING(50),
    created_date: DataTypes.DATE
  }, {
    tableName: 'm_payroll_adjustment',
    timestamps: false,
    indexes: [
      { fields: ['empid', 'C_YEAR', 'C_MONTH'] },
      // One correction per line per month; re-saving updates it in place.
      { unique: true, fields: ['empid', 'C_YEAR', 'C_MONTH', 'component'] }
    ]
  });

  PayrollAdjustment.associate = (models) => {
    PayrollAdjustment.belongsTo(models.EmployeeMaster, { foreignKey: 'empid', as: 'employee' });
  };

  return PayrollAdjustment;
};