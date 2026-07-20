const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const QualityInspection = sequelize.define('QualityInspection', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    inspection_no: { type: DataTypes.STRING(50), allowNull: false, unique: true },
    inspection_type: { type: DataTypes.ENUM('Incoming', 'In-Process', 'Final'), allowNull: false },
    reference_type: { type: DataTypes.STRING(50) },
    reference_id: { type: DataTypes.INTEGER },
    reference_no: { type: DataTypes.STRING(50) },
    item_id: { type: DataTypes.INTEGER },
    item_code: { type: DataTypes.STRING(50) },
    item_name: { type: DataTypes.STRING(255) },
    supplier_id: { type: DataTypes.INTEGER },
    supplier_name: { type: DataTypes.STRING(255) },
    batch_no: { type: DataTypes.STRING(50) },
    inspected_qty: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
    accepted_qty: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
    rejected_qty: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
    status: { type: DataTypes.ENUM('Pending', 'In Progress', 'Passed', 'Partial', 'Rejected'), defaultValue: 'Pending' },
    inspector: { type: DataTypes.STRING(100) },
    inspection_date: { type: DataTypes.DATEONLY },
    result: { type: DataTypes.TEXT },
    remarks: { type: DataTypes.TEXT },
    created_by: { type: DataTypes.INTEGER },
  }, {
    tableName: 't_quality_inspection',

    timestamps: true,

    createdAt: 'created_date',

    updatedAt: 'updated_at',
  });

  QualityInspection.associate = (models) => {
    QualityInspection.hasMany(models.QualityInspectionItem, { as: 'items', foreignKey: 'inspection_id' });
    QualityInspection.hasMany(models.NonConformance, { as: 'non_conformances', foreignKey: 'inspection_id' });
  };

  return QualityInspection;
};
