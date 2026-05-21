// models/leave-master.js
module.exports = (sequelize, DataTypes) => {
  const LeaveMaster = sequelize.define('LeaveMaster', {
    empid: { // C_EMPID
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    empname: { // C_EMPNAME
      type: DataTypes.STRING(100)
    },
    unit: { // C_UNIT
      type: DataTypes.STRING(40)
    },
    division: { // C_DIVISION
      type: DataTypes.STRING(40)
    },
    department: { // C_DEPARTMENT
      type: DataTypes.STRING(40)
    },
    section: { // C_SECTION
      type: DataTypes.STRING(40)
    },
    cls_utilised: { // C_CLS_UTILISED
      type: DataTypes.DECIMAL(10, 2)
    },
    cls_balance: { // C_CLS_BALANCE
      type: DataTypes.DECIMAL(10, 2)
    },
    els_utilised: { // C_ELS_UTILISED
      type: DataTypes.DECIMAL(10, 2)
    },
    els_balance: { // C_ELS_BALANCE
      type: DataTypes.DECIMAL(10, 2)
    },
    remarks: { // C_REMARKS
      type: DataTypes.STRING(150)
    },
    yr: { // C_YR
      type: DataTypes.DATE
    },
    cls_jan_status: { type: DataTypes.INTEGER }, // C_CLS_JAN_STATUS
    cls_feb_status: { type: DataTypes.INTEGER }, // C_CLS_FEB_STATUS
    cls_mar_status: { type: DataTypes.INTEGER }, // C_CLS_MAR_STATUS
    cls_apr_status: { type: DataTypes.INTEGER }, // C_CLS_APR_STATUS
    cls_may_status: { type: DataTypes.INTEGER }, // C_CLS_MAY_STATUS
    cls_jun_status: { type: DataTypes.INTEGER }, // C_CLS_JUN_STATUS
    cls_jul_status: { type: DataTypes.INTEGER }, // C_CLS_JUL_STATUS
    cls_aug_status: { type: DataTypes.INTEGER }, // C_CLS_AUG_STATUS
    cls_sep_status: { type: DataTypes.INTEGER }, // C_CLS_SEP_STATUS
    cls_oct_status: { type: DataTypes.INTEGER }, // C_CLS_OCT_STATUS
    cls_nov_status: { type: DataTypes.INTEGER }, // C_CLS_NOV_STATUS
    cls_dec_status: { type: DataTypes.INTEGER }, // C_CLS_DEC_STATUS
    cls_last_update: { // C_CLS_LAST_UPDATE
      type: DataTypes.DATE
    },
    final_status: { // C_FINAL_STATUS
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: '0'
    },
    gempid: { // C_GEMPID
      type: DataTypes.STRING(40)
    }
  }, {
    tableName: 'leave_master',
    timestamps: false
  });
  LeaveMaster.associate = (models) => {
    LeaveMaster.hasMany(models.LeaveApplication, {
      foreignKey: 'empid',
      sourceKey: 'empid',
      as: 'leaveApplications'
    });
  };

  return LeaveMaster;
};