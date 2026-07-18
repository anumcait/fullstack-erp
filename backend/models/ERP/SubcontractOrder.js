const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const SubcontractOrder = sequelize.define('SubcontractOrder', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    order_no: { type: DataTypes.STRING(50), allowNull: false, unique: true },
    vendor_id: { type: DataTypes.INTEGER, allowNull: false },
    vendor_name: { type: DataTypes.STRING(200) },
    order_date: { type: DataTypes.DATEONLY, allowNull: false },
    expected_date: { type: DataTypes.DATEONLY },
    status: { type: DataTypes.STRING(30), defaultValue: 'Draft' },
    total_qty: { type: DataTypes.DECIMAL(14, 2), defaultValue: 0 },
    total_amount: { type: DataTypes.DECIMAL(14, 2), defaultValue: 0 },
    notes: { type: DataTypes.TEXT },
    created_by: { type: DataTypes.STRING(100) },
  }, {
    tableName: 't_subcontract_order',
    timestamps: true,
    underscored: true,
  });

  SubcontractOrder.associate = (models) => {
    SubcontractOrder.hasMany(models.SubcontractOrderItem, { foreignKey: 'order_id', as: 'items' });
  };

  return SubcontractOrder;
};
