module.exports = (sequelize, DataTypes) => {
  const Payslip = sequelize.define('Payslip', {
    C_MONTH: {
      type: DataTypes.STRING(10),
      primaryKey: true
    },
    C_YEAR: {
      type: DataTypes.INTEGER,
      primaryKey: true
    },
    C_EMPID: {
      type: DataTypes.INTEGER,
      primaryKey: true
    },
    C_ENAME: DataTypes.STRING(100),
    C_DESIG: DataTypes.STRING(70),
    C_DEPT: DataTypes.STRING(40),
    C_TOT_DAYS: DataTypes.DECIMAL(5, 2),
    C_DAYS_PRESENT: DataTypes.DECIMAL(5, 2),
    C_LEAVES_ALLOWED: DataTypes.DECIMAL(5, 2),
    C_WOFF_HOL: DataTypes.DECIMAL(5, 2),
    C_ABSENT_DAYS: DataTypes.DECIMAL(5, 2),
    C_LATE_COMING: DataTypes.DECIMAL(5, 2),
    C_PF_NUM: DataTypes.STRING(50),
    C_ESI_NUM: DataTypes.STRING(50),
    C_BASIC: DataTypes.DECIMAL(10, 2),
    C_HRA: DataTypes.DECIMAL(10, 2),
    C_CONV: DataTypes.DECIMAL(10, 2),
    C_OTHERS: DataTypes.DECIMAL(10, 2),
    C_TOT_SAL: DataTypes.DECIMAL(10, 2),
    C_EARNED_BASIC: DataTypes.DECIMAL(10, 2),
    C_EARNED_HRA: DataTypes.DECIMAL(10, 2),
    C_EARNED_CONV: DataTypes.DECIMAL(10, 2),
    C_EARNED_OTHERS: DataTypes.DECIMAL(10, 2),
    C_EARNED_AB: DataTypes.DECIMAL(10, 2),
    C_LOP_AMT: DataTypes.DECIMAL(10, 2),
    C_EARNED_OT: DataTypes.DECIMAL(10, 2),
    C_OT_HRS: DataTypes.DECIMAL(5, 2),
    C_EARNED_BONUS: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0
    },
    C_EARNED_LUNCH: DataTypes.DECIMAL(10, 2),
    C_EARNED_GROSS: DataTypes.DECIMAL(10, 2),
    C_DED_PF: DataTypes.DECIMAL(10, 2),
    C_DED_ESI: DataTypes.DECIMAL(10, 2),
    C_DED_PT: DataTypes.DECIMAL(10, 2),
    C_DED_LIC: DataTypes.DECIMAL(10, 2),
    C_DED_TAX: DataTypes.DECIMAL(10, 2),
    C_DED_ADV: DataTypes.DECIMAL(10, 2),
    C_DED_OTH: DataTypes.DECIMAL(10, 2),
    C_TOT_DED: DataTypes.DECIMAL(10, 2),
    C_NET_AMT: DataTypes.DECIMAL(10, 2),
    C_PAY_TYPE: DataTypes.STRING(10),
    C_BANK_ACNO: DataTypes.STRING(20),
    C_DED_MEALS: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    C_FYEAR: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    C_UNIT: DataTypes.STRING(40),
    C_LATE_HOURS: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    C_FINAL_STATUS: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    C_DIVISION: DataTypes.STRING(40),
    C_SECTION: DataTypes.STRING(40),
    C_EMP_TYPE: DataTypes.STRING(20),
    C_EMP_STATUS: DataTypes.CHAR(1),
    C_PF_EXIST: {
      type: DataTypes.CHAR(1),
      defaultValue: 'N'
    },
    C_ESI_EXIST: {
      type: DataTypes.CHAR(1),
      defaultValue: 'N'
    },
    C_OT_EXIST: {
      type: DataTypes.CHAR(1),
      defaultValue: 'N'
    },
    C_LIC_EXIST: {
      type: DataTypes.CHAR(1),
      defaultValue: 'N'
    },
    C_GEMPID: DataTypes.STRING(40),
    BANKNAME: DataTypes.STRING(50),
    BRANCHNAME: DataTypes.STRING(50),
    IFSCCODE: DataTypes.STRING(50),
    C_LATE_TIMES: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    C_LATE_HALF_DAYS: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    C_LATE_HALF_HOURS: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    C_LATE_DED_AMT: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0
    }
  }, {
    tableName: 'emp_payslip',
    timestamps: false,
    freezeTableName: true
  });

  Payslip.associate = (models) => {
    Payslip.belongsTo(models.EmployeeMaster, {
      foreignKey: 'C_EMPID',
      targetKey: 'empid',
      as: 'employee'
    });
  };

  return Payslip;
};