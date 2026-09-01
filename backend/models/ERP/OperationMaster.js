const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const OperationMaster = sequelize.define('OperationMaster', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    opn_code: { type: DataTypes.STRING(20), allowNull: false, unique: true },
    opn_no: { type: DataTypes.INTEGER, allowNull: true },
    opn_des: { type: DataTypes.STRING(200), allowNull: true },
    code: { type: DataTypes.STRING(20), allowNull: true },
    department: { type: DataTypes.STRING(100), allowNull: true },
    machine_type: { type: DataTypes.STRING(100), allowNull: true },
    is_inspection: { type: DataTypes.BOOLEAN, defaultValue: false },
    std_time_min: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
    status: { type: DataTypes.STRING(20), defaultValue: 'Active' },
    attributes: { type: DataTypes.JSON, allowNull: true },
  }, {
    tableName: 'm_operation_master',
    timestamps: false,
    underscored: true,
  });

  OperationMaster.associate = (models) => {
    OperationMaster.hasMany(models.ProductRouting, { foreignKey: 'operation_id', as: 'routings' });
  };

  return OperationMaster;
};
