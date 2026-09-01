const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const HSNMaster = sequelize.define('HSNMaster', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    hsn_code: { type: DataTypes.STRING(20), allowNull: false, unique: true },
    material: { type: DataTypes.TEXT, allowNull: true },
    sub_group: { type: DataTypes.STRING(200), allowNull: true },
    group: { type: DataTypes.STRING(100), allowNull: true },
    gst_rate: { type: DataTypes.DECIMAL(5, 2), defaultValue: 0 },
    cgst_rate: { type: DataTypes.DECIMAL(5, 2), defaultValue: 0 },
    sgst_rate: { type: DataTypes.DECIMAL(5, 2), defaultValue: 0 },
    igst_rate: { type: DataTypes.DECIMAL(5, 2), defaultValue: 0 },
    remarks: { type: DataTypes.TEXT, allowNull: true },
    status: { type: DataTypes.STRING(20), defaultValue: 'Active' },
    created_by: { type: DataTypes.INTEGER, allowNull: true },
    created_date: { type: DataTypes.DATEONLY, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  }, {
    tableName: 'm_hsn_master',
    timestamps: false,
    underscored: true,
  });

  return HSNMaster;
};
