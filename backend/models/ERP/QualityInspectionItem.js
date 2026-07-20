const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const QualityInspectionItem = sequelize.define('QualityInspectionItem', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    inspection_id: { type: DataTypes.INTEGER, allowNull: false },
    parameter: { type: DataTypes.STRING(255), allowNull: false },
    specification: { type: DataTypes.STRING(255) },
    method: { type: DataTypes.STRING(100) },
    observed_value: { type: DataTypes.STRING(100) },
    result: { type: DataTypes.ENUM('Pass', 'Fail', 'N/A'), defaultValue: 'N/A' },
    remarks: { type: DataTypes.TEXT },
  }, {
    tableName: 't_quality_inspection_items',

    timestamps: true,

    createdAt: 'created_date',

    updatedAt: 'updated_at',
  });

  QualityInspectionItem.associate = (models) => {
    QualityInspectionItem.belongsTo(models.QualityInspection, { as: 'inspection', foreignKey: 'inspection_id' });
  };

  return QualityInspectionItem;
};
