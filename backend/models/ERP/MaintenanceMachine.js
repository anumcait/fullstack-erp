const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const MaintenanceMachine = sequelize.define('MaintenanceMachine', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    machine_code: { type: DataTypes.STRING(50), allowNull: false, unique: true },
    machine_name: { type: DataTypes.STRING(200), allowNull: false },
    machine_type: { type: DataTypes.STRING(100) },
    department: { type: DataTypes.STRING(100) },
    location: { type: DataTypes.STRING(200) },
    manufacturer: { type: DataTypes.STRING(200) },
    model_no: { type: DataTypes.STRING(100) },
    serial_no: { type: DataTypes.STRING(100) },
    installation_date: { type: DataTypes.DATEONLY },
    status: { type: DataTypes.ENUM('Active', 'Inactive', 'Under Maintenance', 'Retired'), defaultValue: 'Active' },
    notes: { type: DataTypes.TEXT },
  }, {
    tableName: 'm_maintenance_machine',
    timestamps: true,
    underscored: true,
  });

  return MaintenanceMachine;
};
