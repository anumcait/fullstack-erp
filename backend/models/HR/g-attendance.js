module.exports = (sequelize, DataTypes) => {
  const GAttendance = sequelize.define('GAttendance', {
    C_EMPID: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    C_DATE: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    C_SHIFT: DataTypes.STRING(10),
    C_SIN: DataTypes.TIME,
    C_SOUT: DataTypes.TIME,
    C_LIN: DataTypes.TIME,
    C_LOUT: DataTypes.TIME,
    C_LATE_HRS: DataTypes.DECIMAL(5, 2),
    C_LATE_MINS: DataTypes.DECIMAL(5, 2),
    C_OT_HRS: DataTypes.DECIMAL(5, 2),
    C_OT_MINS: DataTypes.DECIMAL(5, 2),
    C_STATUS: DataTypes.STRING(20),
    C_LEAVE_TYPE: DataTypes.STRING(20),
    C_LOP_DAYS: DataTypes.DECIMAL(5, 2),
    C_WOFF_DAYS: DataTypes.DECIMAL(5, 2),
    C_HOLIDAY: DataTypes.BOOLEAN,
    C_REMARKS: DataTypes.STRING(100),
    C_UNIT: DataTypes.STRING(40),
    C_DIVISION: DataTypes.STRING(40),
    C_FINAL_STATUS: {
      type: DataTypes.STRING(20),
      defaultValue: '0'
    },
    C_GEMPID: DataTypes.STRING(40),
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'EQ_EMP_GATT',
    timestamps: false,
    freezeTableName: true,
    indexes: [
      { unique: true, fields: ['C_EMPID', 'C_DATE'] }
    ]
  });

  return GAttendance;
};