module.exports = (sequelize, DataTypes) => {
  const AdvanceApplication = sequelize.define('AdvanceApplication', {
    advance_id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: false
    },
    advance_date: DataTypes.DATE,
    empid: {
      type: DataTypes.BIGINT,
      allowNull: false
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
    created_by: DataTypes.STRING(50),
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    status: {
      type: DataTypes.STRING(20),
      defaultValue: 'Pending'
    }
  }, {
    tableName: 'advance_permission',
    timestamps: false
  });

  return AdvanceApplication;
};