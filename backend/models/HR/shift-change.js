module.exports = (sequelize, DataTypes) => {
  const ShiftChange = sequelize.define('ShiftChange', {
    schange_no: {
      type: DataTypes.INTEGER,
      primaryKey: true
    },
    schange_date: DataTypes.DATE,
    empid: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    empname: DataTypes.STRING(100),
    designation: DataTypes.STRING(100),
    department: DataTypes.STRING(50),
    act_shift: DataTypes.STRING(2),
    act_sstart_time: DataTypes.STRING(10),
    act_send_time: DataTypes.STRING(10),
    change_shift: DataTypes.STRING(2),
    cha_sstart_time: DataTypes.STRING(10),
    cha_send_time: DataTypes.STRING(10),
    purpose: DataTypes.STRING(150),
    remarks: DataTypes.STRING(150),
    schange_from: DataTypes.DATE,
    schange_to: DataTypes.DATE,
    app_status: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    cancel_status: DataTypes.STRING(20),
    cancel_empid: DataTypes.BIGINT,
    cancel_date: DataTypes.DATE,
    unit: DataTypes.STRING(40),
    final_status: {
      type: DataTypes.STRING(20),
      defaultValue: '0',
      allowNull: false
    },
    gempid: DataTypes.STRING(40)
  }, {
    tableName: 'shift_change',
    freezeTableName: true,
    timestamps: false,
  });

  return ShiftChange;
};
