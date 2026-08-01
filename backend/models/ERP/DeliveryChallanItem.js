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
      item_grp: { type: DataTypes.STRING(100), allowNull: true },
      wo_no: { type: DataTypes.STRING(50), allowNull: true },
      hs_code: { type: DataTypes.STRING(30), allowNull: true },
      tag: { type: DataTypes.STRING(50), allowNull: true },
      opn1: { type: DataTypes.STRING(50), allowNull: true },
      opn2: { type: DataTypes.STRING(50), allowNull: true },
      opn3: { type: DataTypes.STRING(50), allowNull: true },
      quantity: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
      rate: { type: DataTypes.DECIMAL(12, 2), allowNull: true },
      unit_id: { type: DataTypes.INTEGER, allowNull: true },
      unit: { type: DataTypes.STRING(20), allowNull: true },
      req_date: { type: DataTypes.DATEONLY, allowNull: true },
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
    DeliveryChallanItem.belongsTo(models.ItemMaster, { foreignKey: 'item_id', as: 'item' });
  };

  return DeliveryChallanItem;
};
