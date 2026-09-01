const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ProductionMachine = sequelize.define('ProductionMachine', {
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
    capacity_per_hour: { type: DataTypes.DECIMAL(12, 2) },
    power_rating: { type: DataTypes.STRING(50) },
    status: { type: DataTypes.STRING(30), defaultValue: 'Active' },
    last_maintenance_date: { type: DataTypes.DATEONLY },
    next_maintenance_date: { type: DataTypes.DATEONLY },
    notes: { type: DataTypes.TEXT },
    is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
  }, {
    tableName: 'm_production_machine',

    timestamps: true,

    createdAt: 'created_date',

    updatedAt: 'updated_at',
  });

  return ProductionMachine;
};
