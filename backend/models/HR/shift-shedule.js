module.exports = (sequelize, DataTypes) => {
  const ShiftSchedule = sequelize.define('ShiftSchedule', {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true
    },
    shift_date: DataTypes.DATE,
    gen_date: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    gen_user: DataTypes.BIGINT,
    unit: DataTypes.STRING(30),
    division: DataTypes.STRING(30),
    empid: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    shift_cd: {
      type: DataTypes.STRING(10),
      allowNull: false
    },
    machine_cd: DataTypes.STRING(10),
    remarks: DataTypes.STRING(100),
    shift_start_time: DataTypes.DATE,
    shift_end_time: DataTypes.DATE,
    shift_status: DataTypes.STRING(10),
    final_status: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false
    },
    gempid: DataTypes.STRING(40)
  }, {
    tableName: 'shift_schedule',
    freezeTableName: true,
    timestamps: false
  });

  ShiftSchedule.associate = (models) => {
    ShiftSchedule.belongsTo(models.EmployeeMaster, { foreignKey: 'empid', targetKey: 'empid', as: 'employee' });
  };

  return ShiftSchedule;
};
