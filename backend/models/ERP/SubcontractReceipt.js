const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const SubcontractReceipt = sequelize.define('SubcontractReceipt', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    receipt_no: { type: DataTypes.STRING(50), allowNull: false, unique: true },
    order_id: { type: DataTypes.INTEGER, allowNull: false },
    receipt_date: { type: DataTypes.DATEONLY, allowNull: false },
    vendor_id: { type: DataTypes.INTEGER },
    vendor_name: { type: DataTypes.STRING(200) },
    status: { type: DataTypes.STRING(30), defaultValue: 'Draft' },
    notes: { type: DataTypes.TEXT },
    created_by: { type: DataTypes.STRING(100) },
  }, {
    tableName: 't_subcontract_receipt',
    timestamps: true,
    createdAt: 'created_date',
    updatedAt: 'updated_at',
    underscored: true,
  });

  SubcontractReceipt.associate = (models) => {
    SubcontractReceipt.belongsTo(models.SubcontractOrder, { foreignKey: 'order_id', as: 'order' });
    SubcontractReceipt.hasMany(models.SubcontractReceiptItem, { foreignKey: 'receipt_id', as: 'items' });
  };

  return SubcontractReceipt;
};
