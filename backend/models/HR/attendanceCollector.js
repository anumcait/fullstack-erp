const { DataTypes } = require('sequelize');

module.exports = (sequelize) => ({
  RawPunch: sequelize.define('RawPunch', {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    empid: { type: DataTypes.INTEGER, allowNull: false },
    punch_time: { type: DataTypes.DATE, allowNull: false },
    punch_date: { type: DataTypes.DATEONLY },
    direction: { type: DataTypes.STRING(10), defaultValue: 'IN' },
    device_id: { type: DataTypes.STRING(50) },
    device_name: { type: DataTypes.STRING(100) },
    mode: { type: DataTypes.STRING(20), defaultValue: 'Fingerprint' },
    source: { type: DataTypes.STRING(30), defaultValue: 'CSV' },
    batch_id: { type: DataTypes.STRING(50) },
    processed: { type: DataTypes.BOOLEAN, defaultValue: false },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  }, { tableName: 't_attendance_raw_punch', timestamps: false, underscored: true }),

  PunchBatch: sequelize.define('PunchBatch', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    batch_id: { type: DataTypes.STRING(50), unique: true },
    source: { type: DataTypes.STRING(30) },
    filename: { type: DataTypes.STRING(200) },
    total_records: { type: DataTypes.INTEGER, defaultValue: 0 },
    processed_records: { type: DataTypes.INTEGER, defaultValue: 0 },
    status: { type: DataTypes.STRING(20), defaultValue: 'Imported' },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  }, { tableName: 't_punch_batch', timestamps: false, underscored: true }),
});
