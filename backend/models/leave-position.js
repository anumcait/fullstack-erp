// models/leave-position.js
module.exports = (sequelize, DataTypes) => {
  const LeavePosition = sequelize.define('LeavePosition', {
    lno: {
     // field: 'C_LNO',
      type: DataTypes.BIGINT,
       primaryKey: true,
    allowNull: false,
    autoIncrement: true,
    },
    ldate: {
     // field: 'C_LDATE',
      type: DataTypes.DATE,
      allowNull: false
    },
    empid: {
     // field: 'C_EMPID',
      type: DataTypes.BIGINT,
      allowNull: false
    },
    leaves_applied: {
      //field: 'C_LEAVES_APPLIED',
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    cls_eligible: {
      //field: 'C_CLS_ELIGIBLE',
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0
    },
    cls_utilized: {
      //field: 'C_CLS_UTILIZED',
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0
    },
    cls_balance: {
      //field: 'C_CLS_BALANCE',
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0
    },
    els_eligible: {
      //field: 'C_ELS_ELIGIBLE',
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0
    },
    els_utilized: {
     // field: 'C_ELS_UTILIZED',
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0
    },
    els_balance: {
      //field: 'C_ELS_BALANCE',
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0
    },
    previous_lop_days: {
      //field: 'C_PREVIOUS_LOP_DAYS',
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0
    },
    present_lop_days: {
     //field: 'C_PRESENT_LOP_DAYS',
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0
    },
    tot_lop_days: {
     // field: 'C_TOT_LOP_DAYS',
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0
    },
    last_lno: {
      //field: 'C_LAST_LNO',
      type: DataTypes.BIGINT
    },
    last_ldate: {
     // field: 'C_LAST_LDATE',
      type: DataTypes.DATE
    },
    unit: {
     // field: 'C_UNIT',
      type: DataTypes.STRING(40)
    },
    remarks: {
    //  field: 'C_REMARKS',
      type: DataTypes.STRING(100)
    },
    app_date: {
    //  field: 'C_APP_DT',
      type: DataTypes.DATE
    },
    app_user: {
    //  field: 'C_APP_USER',
      type: DataTypes.BIGINT
    },
    approved_cls: {
    //  field: 'C_LAPP_APPROVED_CLS',
      type: DataTypes.DECIMAL(10, 2)
    },
    approved_els: {
    //  field: 'C_LAPP_APPROVED_ELS',
      type: DataTypes.BIGINT
    },
    app_cls_utilised: {
     // field: 'C_APP_CLS_UTILISED',
      type: DataTypes.DECIMAL(10, 2)
    },
    app_cls_balance: {
    //  field: 'C_APP_CLS_BALANCE',
      type: DataTypes.DECIMAL(10, 2)
    },
    app_els_utilised: {
    //  field: 'C_APP_ELS_UTILISED',
      type: DataTypes.BIGINT
    },
    app_els_balance: {
    //  field: 'C_APP_ELS_BALANCE',
      type: DataTypes.BIGINT
    },
    gempid: {
     // field: 'C_GEMPID',
      type: DataTypes.STRING(40)
    }
  }, {
    tableName: 'leave_position',
    timestamps: false,
    
  });

//   LeavePosition.associate = (models) => {
//     LeavePosition.hasMany(models.LeaveApproval, {
//       foreignKey: 'Lno',
//       sourceKey: 'Lno',
//       as: 'leaveApproval'
//     });
//   };

  return LeavePosition;
};
