module.exports = (sequelize, DataTypes) => {
  const ESILeaveApplication = sequelize.define('ESILeaveApplication', {
    esi_leave_id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: false
    },
    esi_leave_date: DataTypes.DATE,
    empid: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    ename: DataTypes.STRING(100),
    unit: DataTypes.STRING(50),
    division: DataTypes.STRING(50),
    designation: DataTypes.STRING(50),
    esi_no: DataTypes.STRING(50),
    esi_dispencery: DataTypes.STRING(100),
    hospital_name: DataTypes.STRING(100),
    leave_from_date: DataTypes.DATE,
    leave_to_date: DataTypes.DATE,
    no_of_days: DataTypes.INTEGER,
    reason: DataTypes.TEXT,
    created_by: DataTypes.STRING(50),
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    status: {
      type: DataTypes.STRING(20)
    }
  }, {
    tableName: 'esi_leave_permission',
    timestamps: false
  });

  return ESILeaveApplication;
};