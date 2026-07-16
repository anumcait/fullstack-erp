const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const DeliveryChallanItem = sequelize.define(
    'DeliveryChallanItem',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      dc_id: { type: DataTypes.INTEGER, allowNull: false },
      item_id: { type: DataTypes.INTEGER, allowNull: true },
      item_code: { type: DataTypes.STRING(50), allowNull: true },
      item_name: { type: DataTypes.STRING(200), allowNull: false },
      quantity: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
      unit_id: { type: DataTypes.INTEGER, allowNull: true },
      returned_qty: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
      remarks: { type: DataTypes.TEXT, allowNull: true },
    },
    {
      tableName: 't_delivery_challan_item',
      timestamps: false,
      underscored: true,
    }
  );

  DeliveryChallanItem.associate = (models) => {
    DeliveryChallanItem.belongsTo(models.DeliveryChallan, { foreignKey: 'dc_id', as: 'dc' });
  };

  return DeliveryChallanItem;
};
