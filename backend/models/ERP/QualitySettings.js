const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const QualitySettings = sequelize.define('QualitySettings', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    key: { type: DataTypes.STRING(100), allowNull: false, unique: true },
    value: { type: DataTypes.TEXT },
  }, {
    tableName: 'm_quality_settings',
    timestamps: true,
  });

  return QualitySettings;
};
