const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Salary = sequelize.define('EmpSalary', {
    empid: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    basic: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    hra: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    conveyance: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    washing_allowance: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    others1: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
     others2: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    others3: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    others4: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
     others5: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
     others6: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
     others7: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
     others8: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
     others9: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    deduct_others1: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
     deduct_others2: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    deduct_others3: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
     deduct_others4: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    IS_esi: {
      type: DataTypes.CHAR(1),
      allowNull: true,
    },

     IS_pf: {
      type: DataTypes.CHAR(1),
      allowNull: true,
    },

     IS_lic: {
      type: DataTypes.CHAR(1),
      allowNull: true,
    },
     IS_ot: {
      type: DataTypes.CHAR(1),
      allowNull: true,
    },
    tds_amount: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    lic_amount: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    pay_mode: {
      type: DataTypes.STRING(10),
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
   
 }, {
    tableName: 'm_emp_salary',
    timestamps: false,
    underscored: true
  });


  Salary.associate = (models) => {
  Salary.belongsTo(models.EmployeeMaster, { foreignKey: 'empid', as: 'employee' });
};

  return Salary;
};

