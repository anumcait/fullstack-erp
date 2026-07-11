module.exports = (sequelize, DataTypes) => {
  const MusterRollSummary = sequelize.define('MusterRollSummary', {
    empid: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false
    },
    year: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false
    },
    month: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false
    },
    present_days: DataTypes.DECIMAL(5, 2),
    woff_days: DataTypes.DECIMAL(5, 2),
    holiday_days: DataTypes.DECIMAL(5, 2),
    cl_days: DataTypes.DECIMAL(5, 2),
    el_days: DataTypes.DECIMAL(5, 2),
    lop_days: DataTypes.DECIMAL(5, 2),
    absent_days: DataTypes.DECIMAL(5, 2),
    total_days: DataTypes.DECIMAL(5, 2),
    ot_hours: DataTypes.DECIMAL(8, 2),
    late_hours: DataTypes.DECIMAL(8, 2),
    att_bonus: {
      type: DataTypes.CHAR(1),
      defaultValue: 'N'
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'muster_roll_summary',
    timestamps: false
  });

  return MusterRollSummary;
};