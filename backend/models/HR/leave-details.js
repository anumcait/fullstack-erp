// models/leave-details.js
module.exports = (sequelize, DataTypes) => {
  const LeaveDetails = sequelize.define('LeaveDetails', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    lno: DataTypes.BIGINT,
    empno: DataTypes.BIGINT,
    frmdt: DataTypes.DATE,
    todate: DataTypes.DATE,
    nod: DataTypes.DECIMAL(10, 2),
    remarks: DataTypes.STRING(150),
    daydt: {
      type: DataTypes.STRING(10),
      allowNull: false
    },
    c_hr_app_status: {
      type: DataTypes.STRING(20)
    },
    c_hr_app_remarks: DataTypes.STRING(150),
    c_cl_sanction: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0
    },
    c_el_sanction: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0
    },
    c_unit: DataTypes.STRING(40),
    c_gempid: DataTypes.STRING(40),
    leave_type: DataTypes.STRING(10) // CL, EL, LOP
  }, {
    tableName: 'leave_details',
    timestamps: false
  });

  LeaveDetails.associate = (models) => {
    LeaveDetails.belongsTo(models.LeaveApplication, {
      foreignKey: 'lno',
      as: 'application'
    });
  };

  return LeaveDetails;
};
