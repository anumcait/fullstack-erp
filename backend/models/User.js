// models/User.js
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    username: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
    },
    password_hash: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    empid: {
      type: DataTypes.INTEGER
    },
    ename: {
      type: DataTypes.STRING
    },
    role: {
      type: DataTypes.STRING
    },
    permissions: {
      type: DataTypes.JSONB,
      defaultValue: []
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    last_login: {
      type: DataTypes.DATE
    },
    login_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    failed_attempts: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    password_changed_at: {
      type: DataTypes.DATE
    },
    created_by: {
      type: DataTypes.INTEGER
    }
  }, {
    tableName: 'Users',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  },);

  //   // ✅ Add the association
  // User.associate = (models) => {
  //   User.belongsTo(models.employee_master, {
  //     foreignKey: 'empid',
  //     targetKey: 'empid',
  //     as: 'employee' // ✅ Use this in your includes
  //   });
  // };

  User.associate = (models) => {
    User.belongsTo(models.EmployeeMaster, { foreignKey: 'empid', as: 'employee' }); // Example
  };
  return User;
};
