module.exports = (sequelize, DataTypes) => {
  const AdvanceApplication = sequelize.define('AdvanceApplication', {
    advance_id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: false
    },
    advance_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    empid: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    ename: DataTypes.STRING(100),
    unit: DataTypes.STRING(50),
    division: DataTypes.STRING(50),
    designation: DataTypes.STRING(50),
    advance_type: DataTypes.STRING(50),
    advance_amount: DataTypes.DECIMAL(10, 2),
    gross_salary: DataTypes.DECIMAL(10, 2),
    reason: DataTypes.TEXT,
    no_of_installments: DataTypes.INTEGER,
    monthly_installment: DataTypes.DECIMAL(10, 2),
    deduct_from_month: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    deduct_from_year: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    deduction_schedule: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    created_by: DataTypes.STRING(50),
    created_date: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    status: {
      type: DataTypes.STRING(20)
    }
  }, {
    tableName: 'advance_permission',
    timestamps: false
  });

  return AdvanceApplication;
};