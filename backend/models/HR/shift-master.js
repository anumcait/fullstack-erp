module.exports = (sequelize, DataTypes) => {
  const ShiftMaster = sequelize.define('ShiftMaster', {
    shift_id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      allowNull: false
    },
    shift_cd: DataTypes.STRING(10),
    start_time: DataTypes.STRING(10),
    end_time: DataTypes.STRING(10),
    lunch_start_time: DataTypes.STRING(10),
    lunch_end_time: DataTypes.STRING(10),
    u1: DataTypes.STRING(3),
    u2: DataTypes.STRING(3),
    u3: DataTypes.STRING(3),
    u4: DataTypes.STRING(3),
    u5: DataTypes.STRING(3),
    u6: DataTypes.STRING(3),
    c_eff_date: DataTypes.DATEONLY,
    c_status: DataTypes.CHAR(1),
    c_shift_status: DataTypes.CHAR(1),
    c_gen_user: DataTypes.BIGINT,
    c_gen_date: DataTypes.DATE
  }, {
    tableName: 'shift_master',
    freezeTableName: true,
    timestamps: false,
  });

  return ShiftMaster;
};
