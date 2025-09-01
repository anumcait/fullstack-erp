module.exports = (sequelize, DataTypes) => {
  const LeaveApplication = sequelize.define(
    'LeaveApplication',
    {
      lno: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: false,
      },
      empid: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      ename: DataTypes.STRING(100),
      designation: DataTypes.STRING(50),
      department: DataTypes.STRING(50),
      pofl: DataTypes.STRING(100),
      address: DataTypes.STRING(100),
      phno: DataTypes.BIGINT,
      c_unit: DataTypes.STRING(40),
      c_gempid: {
        type: DataTypes.STRING(40),
        allowNull: false
      }
    },
    {
      tableName: 'leave_application',
      timestamps: false,
    }
  );

  // ✅ Associations
  LeaveApplication.associate = (models) => {
    LeaveApplication.hasMany(models.LeaveDetails, {
      foreignKey: 'lno',
      as: 'leaveDetails'
    });

    // LeaveApplication.hasOne(models.LeaveApproval, {  // must be inside associate
    //   foreignKey: 'lno',
    //   as: 'approval'
    // });
  };

  return LeaveApplication;
};
