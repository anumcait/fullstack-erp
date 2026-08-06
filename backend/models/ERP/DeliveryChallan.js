const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const DeliveryChallan = sequelize.define(
    'DeliveryChallan',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      dc_no: { type: DataTypes.STRING(30), allowNull: true, unique: true },
      draft_no: { type: DataTypes.STRING(30), allowNull: true },
      dc_date: { type: DataTypes.DATE, allowNull: false },
      party_id: { type: DataTypes.INTEGER, allowNull: true },
      party_name: { type: DataTypes.STRING(200), allowNull: true },
      returnable: { type: DataTypes.BOOLEAN, defaultValue: false },
      dc_type: {
        type: DataTypes.STRING(20),
        defaultValue: 'S',
        validate: { isIn: [['L', 'R', 'M', 'J', 'S', 'N']] },
      },
      non_returnable_type: { type: DataTypes.STRING(30), allowNull: true },
      expected_return_date: { type: DataTypes.DATEONLY, allowNull: true },
      reference_no: { type: DataTypes.STRING(50), allowNull: true },
      authorization_ref: { type: DataTypes.STRING(50), allowNull: true },
      transfer_location: { type: DataTypes.STRING(100), allowNull: true },
      maintenance_type: { type: DataTypes.STRING(50), allowNull: true },
      vehicle_no: { type: DataTypes.STRING(30), allowNull: true },
      driver_name: { type: DataTypes.STRING(100), allowNull: true },
      department: { type: DataTypes.STRING(100), allowNull: true },
      through: { type: DataTypes.STRING(100), allowNull: true },
      requested_by: { type: DataTypes.STRING(100), allowNull: true },
      prepared_by: { type: DataTypes.STRING(50), allowNull: true },
      approved_by: { type: DataTypes.STRING(50), allowNull: true },
      approved_date: { type: DataTypes.DATE, allowNull: true },
      cancel_remarks: { type: DataTypes.TEXT, allowNull: true },
      cancel_by: { type: DataTypes.STRING(50), allowNull: true },
      cancel_date: { type: DataTypes.DATE, allowNull: true },
      req_date: { type: DataTypes.DATEONLY, allowNull: true },
      bill_no: { type: DataTypes.STRING(20), allowNull: true },
      bill_date: { type: DataTypes.DATEONLY, allowNull: true },
      remarks: { type: DataTypes.TEXT, allowNull: true },
      status: {
        type: DataTypes.STRING(20),
        defaultValue: 'Draft',
        validate: { isIn: [['Draft', 'Approved', 'Returned', 'Cancelled', 'Billed']] },
      },
      created_date: { type: DataTypes.DATEONLY, defaultValue: DataTypes.NOW },
      updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    },
    {
      tableName: 't_delivery_challan',
      timestamps: false,
      underscored: true,
    }
  );

DeliveryChallan.associate = (models) => {
  DeliveryChallan.hasMany(models.DeliveryChallanItem, { foreignKey: 'dc_id', as: 'items' });
  DeliveryChallan.belongsTo(models.SupplierMaster, { foreignKey: 'party_id', as: 'supplier' });
};

  return DeliveryChallan;
};
