const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const SubcontractOrderItem = sequelize.define('SubcontractOrderItem', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    order_id: { type: DataTypes.INTEGER, allowNull: false },
    item_id: { type: DataTypes.INTEGER },
    item_code: { type: DataTypes.STRING(50) },
    item_name: { type: DataTypes.STRING(200), allowNull: false },
    quantity: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
    uom: { type: DataTypes.STRING(20) },
    rate: { type: DataTypes.DECIMAL(14, 2), defaultValue: 0 },
    amount: { type: DataTypes.DECIMAL(14, 2), defaultValue: 0 },
    notes: { type: DataTypes.TEXT },
  }, {
    tableName: 't_subcontract_order_item',
    timestamps: true,
    underscored: true,
  });

  SubcontractOrderItem.associate = (models) => {
    SubcontractOrderItem.belongsTo(models.SubcontractOrder, { foreignKey: 'order_id', as: 'order' });
  };

  return SubcontractOrderItem;
};
