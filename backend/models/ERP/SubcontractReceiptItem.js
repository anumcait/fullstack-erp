const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const SubcontractReceiptItem = sequelize.define('SubcontractReceiptItem', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    receipt_id: { type: DataTypes.INTEGER, allowNull: false },
    item_id: { type: DataTypes.INTEGER },
    item_code: { type: DataTypes.STRING(50) },
    item_name: { type: DataTypes.STRING(200), allowNull: false },
    quantity: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
    uom: { type: DataTypes.STRING(20) },
    notes: { type: DataTypes.TEXT },
  }, {
    tableName: 't_subcontract_receipt_item',
    timestamps: true,
    underscored: true,
  });

  SubcontractReceiptItem.associate = (models) => {
    SubcontractReceiptItem.belongsTo(models.SubcontractReceipt, { foreignKey: 'receipt_id', as: 'receipt' });
  };

  return SubcontractReceiptItem;
};
