const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const JobOrder = sequelize.define('JobOrder', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    order_no: { type: DataTypes.STRING(50), allowNull: false, unique: true },
    bom_id: { type: DataTypes.INTEGER, allowNull: true },
    product_item_id: { type: DataTypes.INTEGER, allowNull: true },
    product_code: { type: DataTypes.STRING(50), allowNull: true },
    product_name: { type: DataTypes.STRING(200), allowNull: true },
    party_id: { type: DataTypes.INTEGER, allowNull: true },
    party_name: { type: DataTypes.STRING(200), allowNull: true },
    planned_quantity: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
    produced_quantity: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
    status: { type: DataTypes.STRING(20), defaultValue: 'Planning' },
    order_type: { type: DataTypes.STRING(20), defaultValue: 'Job Order' },
    start_date: { type: DataTypes.DATEONLY, allowNull: true },
    end_date: { type: DataTypes.DATEONLY, allowNull: true },
    req_date: { type: DataTypes.DATEONLY, allowNull: true },
    jo_date: { type: DataTypes.DATEONLY, allowNull: true },
    department: { type: DataTypes.STRING(100), allowNull: true },
    remarks: { type: DataTypes.TEXT, allowNull: true },
    subject: { type: DataTypes.STRING(300), allowNull: true },
    reference: { type: DataTypes.STRING(200), allowNull: true },
    qtn_no: { type: DataTypes.STRING(100), allowNull: true },
    ref_date: { type: DataTypes.DATEONLY, allowNull: true },
    payment_terms: { type: DataTypes.STRING(100), allowNull: true },
    delivery_terms: { type: DataTypes.TEXT, allowNull: true },
    insurance: { type: DataTypes.STRING(200), allowNull: true },
    inspection: { type: DataTypes.STRING(200), allowNull: true },
    freight: { type: DataTypes.STRING(200), allowNull: true },
    freight_forward: { type: DataTypes.STRING(200), allowNull: true },
    old_jo_no: { type: DataTypes.STRING(50), allowNull: true },
    jo_year: { type: DataTypes.STRING(10), allowNull: true },
    delivery_period: { type: DataTypes.STRING(100), allowNull: true },
    desp_to: { type: DataTypes.STRING(300), allowNull: true },
    any_other_terms: { type: DataTypes.TEXT, allowNull: true },
    notes: { type: DataTypes.TEXT, allowNull: true },
    created_date: { type: DataTypes.DATEONLY, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  }, {
    tableName: 't_production_order',
    timestamps: false,
    underscored: true,
  });

  JobOrder.associate = (models) => {
    JobOrder.hasMany(models.JobOrderItem, { foreignKey: 'order_id', as: 'items' });
  };

  return JobOrder;
};
