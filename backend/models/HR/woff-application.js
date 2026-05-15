module.exports = (sequelize, DataTypes) => {
  const WoffApplication = sequelize.define('WoffApplication', {
    woff_id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: false
    },
    woff_date: DataTypes.DATE,
    empid: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    ename: DataTypes.STRING(100),
    unit: DataTypes.STRING(50),
    division: DataTypes.STRING(50),
    designation: DataTypes.STRING(50),
    department: DataTypes.STRING(100),
    section: DataTypes.STRING(100),
    current_woff_day: DataTypes.STRING(20),
    requested_woff_day: DataTypes.STRING(20),
    woff_from_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    woff_to_date: DataTypes.DATE,
    shift_cd: DataTypes.STRING(20),
    reason: DataTypes.TEXT,
    remarks: DataTypes.TEXT,
    created_by: DataTypes.STRING(50),
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    status: {
      type: DataTypes.STRING(20)
    },
    approval_remark: DataTypes.STRING(200),
    approved_by: DataTypes.STRING(50),
    approved_date: DataTypes.DATE
  }, {
    tableName: 'woff_application',
    timestamps: false
  });

  return WoffApplication;
};