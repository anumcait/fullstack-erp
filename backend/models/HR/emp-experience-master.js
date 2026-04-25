const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Experience = sequelize.define('EmpExperience', {
    empid: {
      type: DataTypes.INTEGER,
      allowNull: false,
        references: {
        model: 'employee_master',
        key: 'empid',
        }
    },
    name: {
      type: DataTypes.STRING(100)
    },
    address: {
      type: DataTypes.STRING(100)
    },
    ffrom: {
      type: DataTypes.DATE,
      allowNull: true,
      validate: {
        isDate: true
      }
    },
    tto: {
      type: DataTypes.DATE,
      allowNull: true,
      validate: {
        isDate: true
      }
    },
    duration: {
      type: DataTypes.STRING(10)
    },
    onj: {
      type: DataTypes.STRING(10)
    },
    onl: {
      type: DataTypes.STRING(10)
    },
    salary: {
      type: DataTypes.INTEGER
    },
    nod: {
      type: DataTypes.STRING(10)
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
    tableName: 'm_emp_experience',
    timestamps: false,
    underscored: true
  });

Experience.associate = (models) => {
  Experience.belongsTo(models.EmployeeMaster, { foreignKey: 'empid', as: 'employee' });
};
  return Experience;
};



