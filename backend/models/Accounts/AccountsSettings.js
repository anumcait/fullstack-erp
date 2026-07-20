const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const AccountsSettings = sequelize.define('AccountsSettings', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    key: { type: DataTypes.STRING(100), allowNull: false, unique: true },
    value: { type: DataTypes.TEXT, allowNull: true },
  }, {
    tableName: 'accounts_settings',

    timestamps: true,

    createdAt: 'created_date',

    updatedAt: 'updated_at',
  });

  return AccountsSettings;
};
