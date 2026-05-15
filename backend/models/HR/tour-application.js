module.exports = (sequelize, DataTypes) => {
  const TourApplication = sequelize.define('TourApplication', {
    tour_id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: false
    },
    tour_date: DataTypes.DATE,
    empid: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    ename: DataTypes.STRING(100),
    unit: DataTypes.STRING(50),
    division: DataTypes.STRING(50),
    designation: DataTypes.STRING(50),
    tour_from_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    tour_to_date: DataTypes.DATE,
    purpose: DataTypes.TEXT,
    destination: DataTypes.STRING(200),
    estimated_amount: DataTypes.DECIMAL(10, 2),
    created_by: DataTypes.STRING(50),
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    status: {
      type: DataTypes.STRING(20)
    },
    approval_remark: DataTypes.STRING(200),
    approved_by: DataTypes.STRING(50),
    approved_date: DataTypes.DATE
  }, {
    tableName: 'tour_application',
    timestamps: false
  });

  return TourApplication;
};