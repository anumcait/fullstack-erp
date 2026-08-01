const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const InwardRegister = sequelize.define(
    'InwardRegister',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      ir_no: { type: DataTypes.STRING(30), allowNull: true, unique: true },
      ir_date: { type: DataTypes.DATE, allowNull: false },
      party_id: { type: DataTypes.INTEGER, allowNull: true },
      party_name: { type: DataTypes.STRING(200), allowNull: true },
      vehicle_no: { type: DataTypes.STRING(30), allowNull: true },
      driver_name: { type: DataTypes.STRING(100), allowNull: true },
      department: { type: DataTypes.STRING(100), allowNull: true },
      requested_by: { type: DataTypes.STRING(100), allowNull: true },
      prepared_by: { type: DataTypes.STRING(50), allowNull: true },
      approved_by: { type: DataTypes.STRING(50), allowNull: true },
      approved_date: { type: DataTypes.DATE, allowNull: true },
      cancel_remarks: { type: DataTypes.TEXT, allowNull: true },
      cancel_by: { type: DataTypes.STRING(50), allowNull: true },
      cancel_date: { type: DataTypes.DATE, allowNull: true },
      remarks: { type: DataTypes.TEXT, allowNull: true },
      status: {
        type: DataTypes.STRING(20),
        defaultValue: 'Draft',
        validate: { isIn: [['Draft', 'Approved', 'Cancelled']] },
      },
      created_date: { type: DataTypes.DATEONLY, defaultValue: DataTypes.NOW },
      updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    },
    {
      tableName: 't_inward_register',
      timestamps: false,
      underscored: true,
    }
  );

  InwardRegister.associate = (models) => {
    InwardRegister.hasMany(models.InwardRegisterItem, { foreignKey: 'ir_id', as: 'items' });
    InwardRegister.belongsTo(models.SupplierMaster, { foreignKey: 'party_id', as: 'supplier' });
    InwardRegister.belongsToMany(models.DeliveryChallan, {
      through: 't_inward_register_dc',
      foreignKey: 'ir_id',
      otherKey: 'dc_id',
      as: 'deliveryChallans',
    });
  };

  return InwardRegister;
};