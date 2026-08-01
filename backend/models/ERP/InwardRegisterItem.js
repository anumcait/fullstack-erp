const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const InwardRegisterItem = sequelize.define(
    'InwardRegisterItem',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      ir_id: { type: DataTypes.INTEGER, allowNull: false },
      dc_id: { type: DataTypes.INTEGER, allowNull: true },
      dc_item_id: { type: DataTypes.INTEGER, allowNull: true },
      item_id: { type: DataTypes.INTEGER, allowNull: true },
      item_code: { type: DataTypes.STRING(50), allowNull: true },
      item_name: { type: DataTypes.STRING(200), allowNull: false },
      uom: { type: DataTypes.STRING(20), allowNull: true },
      unit_id: { type: DataTypes.INTEGER, allowNull: true },
      dc_qty: { type: DataTypes.DECIMAL(18, 4), defaultValue: 0 },
      qty_supplied: { type: DataTypes.DECIMAL(18, 4), defaultValue: 0 },
      rate: { type: DataTypes.DECIMAL(18, 4), defaultValue: 0 },
      remarks: { type: DataTypes.TEXT, allowNull: true },
    },
    {
      tableName: 't_inward_register_item',
      timestamps: false,
      underscored: true,
    }
  );

  InwardRegisterItem.associate = (models) => {
    InwardRegisterItem.belongsTo(models.InwardRegister, { foreignKey: 'ir_id', as: 'inwardRegister' });
    InwardRegisterItem.belongsTo(models.DeliveryChallan, { foreignKey: 'dc_id', as: 'deliveryChallan' });
    InwardRegisterItem.belongsTo(models.DeliveryChallanItem, { foreignKey: 'dc_item_id', as: 'dcItem' });
    InwardRegisterItem.belongsTo(models.ItemMaster, { foreignKey: 'item_id', as: 'item' });
    InwardRegisterItem.belongsTo(models.Unit, { foreignKey: 'unit_id', as: 'unit' });
  };

  return InwardRegisterItem;
};