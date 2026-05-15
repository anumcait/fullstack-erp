const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Empoffdetails = sequelize.define('EmpOfficial', {
    empid: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    doi: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    doj: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    jas: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    pp: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },
    tp: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },
    rto: {
      type: DataTypes.STRING(40),
      allowNull: true,
    },
    rto_dept: {
      type: DataTypes.STRING(40),
      allowNull: true,
    },
    designation: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    emp_status: {
      type: DataTypes.CHAR(1),
      allowNull: true,
    },
    pfacno: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    esiacno: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    bankacno: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    passport_no: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    validity: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    panno: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    oc: {
      type: DataTypes.CHAR(1),
      allowNull: true,
    },
    bond_exec: {
      type: DataTypes.CHAR(1),
      allowNull: true,
    },
    bond_yrs: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    bond_frmdt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    bond_todt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    doinc: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    inc_note: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },
    special_note: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },
    c_weekly_off: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },
    c_high_qual: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    c_aadhar_no: {
      type: DataTypes.BIGINT,
      allowNull: true,
    },
    c_last_update: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    c_upd_userid: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    c_default_shift: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },
    c_doj_inc_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    c_shift_disable: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    c_gempid: {
      type: DataTypes.STRING(40),
      allowNull: true,
    },
    c_uan_no: {
      type: DataTypes.BIGINT,
      allowNull: true,
    },
    bankname: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    branchname: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    ifsccode: {
      type: DataTypes.STRING(50),
      allowNull: true,
    }
  }, {
    tableName: 'm_emp_off_det',
    timestamps: false,
    underscored: true
  });

  return Empoffdetails;
};
