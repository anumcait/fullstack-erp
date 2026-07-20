const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const NonConformance = sequelize.define('NonConformance', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nc_no: { type: DataTypes.STRING(50), allowNull: false, unique: true },
    inspection_id: { type: DataTypes.INTEGER },
    nc_type: { type: DataTypes.ENUM('Critical', 'Major', 'Minor'), allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: false },
    root_cause: { type: DataTypes.TEXT },
    corrective_action: { type: DataTypes.TEXT },
    preventive_action: { type: DataTypes.TEXT },
    status: { type: DataTypes.ENUM('Open', 'In Progress', 'Resolved', 'Closed'), defaultValue: 'Open' },
    severity: { type: DataTypes.ENUM('Low', 'Medium', 'High', 'Critical'), defaultValue: 'Medium' },
    reported_by: { type: DataTypes.STRING(100) },
    assigned_to: { type: DataTypes.STRING(100) },
    resolution_date: { type: DataTypes.DATEONLY },
    remarks: { type: DataTypes.TEXT },
  }, {
    tableName: 't_non_conformance',

    timestamps: true,

    createdAt: 'created_date',

    updatedAt: 'updated_at',
  });

  NonConformance.associate = (models) => {
    NonConformance.belongsTo(models.QualityInspection, { as: 'inspection', foreignKey: 'inspection_id' });
  };

  return NonConformance;
};
