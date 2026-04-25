const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Family = sequelize.define('EmpFamily', {
    empid: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'employee_master',
        key: 'empid'
      }
    },
    fname: {
      type: DataTypes.STRING(40)
    },
    fage: {
      type: DataTypes.STRING(20)
    },
    frel: {
      type: DataTypes.STRING(30)
    },
    foccp: {
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
    tableName: 'm_emp_family',
    timestamps: false,
    underscored: true
  });

Family.associate = (models) => {
  Family.belongsTo(models.EmployeeMaster, { foreignKey: 'empid', as: 'employee' });
};
  return Family;
};