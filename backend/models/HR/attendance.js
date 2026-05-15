module.exports = (sequelize, DataTypes) => {
  const Attendance = sequelize.define('Attendance', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    empid: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    att_date: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    shift: DataTypes.STRING(10),
    shift_start: DataTypes.TIME,
    shift_end: DataTypes.TIME,
    in_time: DataTypes.TIME,
    out_time: DataTypes.TIME,
    lunch_out: DataTypes.TIME,
    lunch_in: DataTypes.TIME,
    late_hrs: DataTypes.DECIMAL(5, 2),
    late_mins: DataTypes.DECIMAL(5, 2),
    late_exempt: DataTypes.BOOLEAN,
    ot_hrs: DataTypes.DECIMAL(5, 2),
    ot_mins: DataTypes.DECIMAL(5, 2),
    status: DataTypes.STRING(20),
    leave_type: DataTypes.STRING(20),
    lop_days: DataTypes.DECIMAL(5, 2),
    woff_day: DataTypes.DECIMAL(5, 2),
    holiday: DataTypes.BOOLEAN,
    tour_days: DataTypes.DECIMAL(5, 2),
    remarks: DataTypes.STRING(1000),
    out_status: DataTypes.STRING(10),
    att_flag: DataTypes.INTEGER,
    unit: DataTypes.STRING(40),
    division: DataTypes.STRING(40),
    department: DataTypes.STRING(40),
    app_ot: DataTypes.STRING(10),
    app_status: {
      type: DataTypes.STRING(20),
      defaultValue: '0'
    },
    app_remarks: DataTypes.STRING(150),
    hr_app_ot: DataTypes.STRING(10),
    hr_app_status: {
      type: DataTypes.STRING(20),
      defaultValue: '0'
    },
    hr_remarks: DataTypes.STRING(150),
    final_status: {
      type: DataTypes.STRING(20),
      defaultValue: '0'
    },
    last_upd_id: DataTypes.INTEGER,
    last_upd_dt: DataTypes.DATE,
    gempid: DataTypes.STRING(40),
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'emp_attendance',
    timestamps: false,
    indexes: [
      { unique: true, fields: ['empid', 'att_date'] }
    ]
  });

  Attendance.associate = (models) => {
    Attendance.belongsTo(models.EmployeeMaster, { foreignKey: 'empid', as: 'employee' });
    Attendance.belongsTo(models.EmpSalary, { foreignKey: 'empid', as: 'salary' });
  };

  return Attendance;
};