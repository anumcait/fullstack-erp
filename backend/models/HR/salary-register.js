module.exports = (sequelize, DataTypes) => {
  const SalaryRegister = sequelize.define('SalaryRegister', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    empid: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    year: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    month: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    working_days: DataTypes.INTEGER,
    present_days: DataTypes.INTEGER,
    absent_days: DataTypes.INTEGER,
    leave_days: DataTypes.INTEGER,
    od_days: DataTypes.INTEGER,
    basic: DataTypes.DECIMAL(10, 2),
    hra: DataTypes.DECIMAL(10, 2),
    conveyance: DataTypes.DECIMAL(10, 2),
    others: DataTypes.DECIMAL(10, 2),
    gross_salary: DataTypes.DECIMAL(10, 2),
    pf: DataTypes.DECIMAL(10, 2),
    esi: DataTypes.DECIMAL(10, 2),
    tds: DataTypes.DECIMAL(10, 2),
    lic: DataTypes.DECIMAL(10, 2),
    other_deductions: DataTypes.DECIMAL(10, 2),
    total_deductions: DataTypes.DECIMAL(10, 2),
    net_salary: DataTypes.DECIMAL(10, 2),
    overtime_hrs: DataTypes.DECIMAL(5, 2),
    overtime_amount: DataTypes.DECIMAL(10, 2),
    ot_rate: DataTypes.DECIMAL(10, 2),
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    status: {
      type: DataTypes.STRING(20),
      defaultValue: 'Pending'
    }
  }, {
    tableName: 'salary_register',
    timestamps: false,
    indexes: [
      { unique: true, fields: ['empid', 'year', 'month'] }
    ]
  });

  return SalaryRegister;
};