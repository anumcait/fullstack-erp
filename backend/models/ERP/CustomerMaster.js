const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const CustomerMaster = sequelize.define('CustomerMaster', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    customer_code: { type: DataTypes.STRING(50), allowNull: false, unique: true },
    customer_name: { type: DataTypes.STRING(255), allowNull: false },
    contact_person: { type: DataTypes.STRING(100) },
    email: { type: DataTypes.STRING(100) },
    phone: { type: DataTypes.STRING(20) },
    mobile: { type: DataTypes.STRING(20) },
    gstin: { type: DataTypes.STRING(20) },
    pan: { type: DataTypes.STRING(20) },
    billing_address: { type: DataTypes.TEXT },
    shipping_address: { type: DataTypes.TEXT },
    city: { type: DataTypes.STRING(100) },
    state: { type: DataTypes.STRING(100) },
    pincode: { type: DataTypes.STRING(10) },
    credit_limit: { type: DataTypes.DECIMAL(14, 2), defaultValue: 0 },
    credit_days: { type: DataTypes.INTEGER, defaultValue: 0 },
    is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
    attributes: { type: DataTypes.JSONB, allowNull: true },
  }, {
    tableName: 'm_customer_master',

    timestamps: true,

    createdAt: 'created_date',

    updatedAt: 'updated_at',
  });

  CustomerMaster.associate = (models) => {
    CustomerMaster.hasMany(models.Lead, { foreignKey: 'customer_id' });
    CustomerMaster.hasMany(models.Quotation, { foreignKey: 'customer_id' });
    CustomerMaster.hasMany(models.SalesOrder, { foreignKey: 'customer_id' });
  };

  return CustomerMaster;
};
