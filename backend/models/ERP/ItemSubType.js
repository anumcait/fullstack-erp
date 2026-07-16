const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ItemSubType = sequelize.define(
    'ItemSubType',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      type_id: { type: DataTypes.INTEGER, allowNull: false },
      code: { type: DataTypes.STRING(20), allowNull: true },
      name: { type: DataTypes.STRING(255), allowNull: false },
      description: { type: DataTypes.TEXT, allowNull: true },
      is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
    },
    { tableName: 'm_item_subtype', timestamps: false, underscored: true }
  );

  ItemSubType.associate = (models) => {
    ItemSubType.belongsTo(models.ItemType, { foreignKey: 'type_id', as: 'type' });
  };

  return ItemSubType;
};
