
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Qualification = sequelize.define('EmpQualification', {
    empid: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'employee_master',
        key: 'empid'
      }
    },
    course: {
      type: DataTypes.STRING(150)
    },
    noi: {
      type: DataTypes.STRING(150)
    },
    per: {
      type: DataTypes.STRING(30)
    },
    year: {
      type: DataTypes.STRING(30)
    },
    c_last_update: {
      type: DataTypes.DATE,
      allowNull: true
    },
    c_upd_userid: {
      type: DataTypes.INTEGER
    },
    c_sno: {
      type: DataTypes.INTEGER
    },
    c_gempid: {
      type: DataTypes.STRING(40)
    }
  }, {
    tableName: 'm_emp_qualification',
    timestamps: false,
    underscored: true
  });

Qualification.associate = (models) => {
  Qualification.belongsTo(models.EmployeeMaster, { foreignKey: 'empid', as: 'employee' });
};
  return Qualification;
};