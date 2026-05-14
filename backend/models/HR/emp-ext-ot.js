module.exports = (sequelize, DataTypes) => {
  const ExtOt = sequelize.define('ExtOt', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    empid: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    ename: DataTypes.STRING(100),
    ot_date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    in_time: DataTypes.TIME,
    out_time: DataTypes.TIME,
    ot_hrs: DataTypes.DECIMAL(5, 2),
    ot_type: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    app_status: {
      type: DataTypes.STRING(20),
      defaultValue: 'Pending'
    },
    emp_remarks: DataTypes.STRING(200),
    manager_remarks: DataTypes.STRING(200),
    hr_remarks: DataTypes.STRING(200),
    created_by: DataTypes.INTEGER,
    created_dt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    manager_approved_by: DataTypes.INTEGER,
    manager_approved_dt: DataTypes.DATE,
    hr_approved_by: DataTypes.INTEGER,
    hr_approved_dt: DataTypes.DATE
  }, {
    tableName: 'emp_ext_ot',
    timestamps: false,
    freezeTableName: true
  });

  return ExtOt;
};