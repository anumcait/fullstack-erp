const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Lead = sequelize.define('Lead', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    lead_no: { type: DataTypes.STRING(50), allowNull: false, unique: true },
    customer_id: { type: DataTypes.INTEGER },
    contact_name: { type: DataTypes.STRING(100) },
    company_name: { type: DataTypes.STRING(255) },
    email: { type: DataTypes.STRING(100) },
    phone: { type: DataTypes.STRING(20) },
    source: { type: DataTypes.STRING(50) },
    status: { type: DataTypes.ENUM('New', 'Contacted', 'Qualified', 'Proposal', 'Negotiation', 'Won', 'Lost'), defaultValue: 'New' },
    priority: { type: DataTypes.ENUM('Low', 'Medium', 'High', 'Critical'), defaultValue: 'Medium' },
    product_interest: { type: DataTypes.TEXT },
    notes: { type: DataTypes.TEXT },
    assigned_to: { type: DataTypes.INTEGER },
    expected_value: { type: DataTypes.DECIMAL(14, 2), defaultValue: 0 },
    closure_date: { type: DataTypes.DATEONLY },
    lost_reason: { type: DataTypes.TEXT },
  }, {
    tableName: 't_leads',
    timestamps: true,
  });

  Lead.associate = (models) => {
    Lead.belongsTo(models.CustomerMaster, { as: 'customer', foreignKey: 'customer_id' });
  };

  return Lead;
};
