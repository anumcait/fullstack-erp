module.exports = (sequelize, DataTypes) => {
  const AttendanceRequest = sequelize.define('AttendanceRequest', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    empid: { type: DataTypes.INTEGER, allowNull: false },
    att_date: { type: DataTypes.DATEONLY, allowNull: false },
    in_time: DataTypes.TIME,
    out_time: DataTypes.TIME,
    shift: { type: DataTypes.STRING(10), defaultValue: 'G' },
    status: { type: DataTypes.STRING(20), defaultValue: 'P' },
    reason: DataTypes.TEXT,
    request_status: { type: DataTypes.STRING(20), defaultValue: 'Pending' },
    applied_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    approved_by: DataTypes.INTEGER,
    approved_at: DataTypes.DATE,
    approver_remarks: DataTypes.STRING(500),
  }, {
    tableName: 'attendance_requests',
    timestamps: false,
    indexes: [
      { fields: ['empid', 'att_date'] },
      { fields: ['request_status'] },
    ]
  });
  AttendanceRequest.associate = (models) => {
    AttendanceRequest.belongsTo(models.EmployeeMaster, { foreignKey: 'empid', targetKey: 'empid', as: 'employee' });
  };
  return AttendanceRequest;
};
