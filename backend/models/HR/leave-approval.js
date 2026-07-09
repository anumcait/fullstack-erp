// models/leave-approval.js
module.exports = (sequelize, DataTypes) => {
  const LeaveApproval = sequelize.define('LeaveApproval', {
    lno: {
     // field: 'C_LNO',
      type: DataTypes.BIGINT,
      allowNull: false,
    //   references: {
    //     model:'leave_application',
    //     key:'LNO'
    //   }
    },
    empid: {
      //field: 'C_EMPID',
      type: DataTypes.BIGINT,
      allowNull: false
    },
    frmdt: {
     // field: 'C_FRMDT',
      type: DataTypes.DATE
    },
    todate: {
     // field: 'C_TODATE',
      type: DataTypes.DATE
    },
    nod: {
    //  field: 'C_NOD',
      type: DataTypes.DECIMAL(10, 2)
    },
    daydt: {
     // field: 'C_DAYDT',
      type: DataTypes.STRING(10)
    },
    leave_type: {
      type: DataTypes.STRING(10)
    },
    remarks: {
     // field: 'C_REMARKS',
      type: DataTypes.STRING(150)
    },
    cl_sanction: {
    //  field: 'C_CL_SANCTION',
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0
    },
    el_sanction: {
     // field: 'C_EL_SANCTION',
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0
    },
    app_status: {
     // field: 'C_HR_APP_STATUS',
      type: DataTypes.STRING(20)
    },
    app_remarks: {
     // field: 'C_HR_APP_REMARKS',
      type: DataTypes.STRING(150)
    },
    cancel_status: {
     // field: 'C_CANCEL_STATUS',
      type: DataTypes.STRING(1),
      defaultValue: ''
    },
    unit: {
     // field: 'C_UNIT',
      type: DataTypes.STRING(40)
    },
    final_status: {
      //field: 'C_FINAL_STATUS',
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: '0'
    },
    gempid: {
      //field: 'C_GEMPID',
      type: DataTypes.STRING(40)
    },
    app_userid: {
      //field: 'C_APP_USERID',
      type: DataTypes.BIGINT
    },
    app_date: {
    //  field: 'C_APP_DATE',
      type: DataTypes.DATE
    }
  }, {
    tableName: 'leave_approval',
    timestamps: false
  });
  // LeaveApproval.associate = (models) => {
  // LeaveApproval.belongsTo(models.LeaveApplication, {   // ✅ link back
  //   foreignKey: 'lno',
  //   as: 'application'
  // });
//};

//   LeaveApproval.associate = (models) => {
//     LeaveApproval.belongsTo(models.LeavePosition, {
//       foreignKey: 'Lno',
//       targetKey: 'Lno',
//       as: 'leavePosition'
//     });
//   };

  return LeaveApproval;
};
