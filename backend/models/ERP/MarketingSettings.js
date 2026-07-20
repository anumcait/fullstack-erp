const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const MarketingSettings = sequelize.define('MarketingSettings', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    key: { type: DataTypes.STRING(100), allowNull: false, unique: true },
    value: { type: DataTypes.TEXT },
  }, {
    tableName: 'm_marketing_settings',

    timestamps: true,

    createdAt: 'created_date',

    updatedAt: 'updated_at',
  });

  return MarketingSettings;
};
