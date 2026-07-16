const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ItemType = sequelize.define(
    'ItemType',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      subgroup_id: { type: DataTypes.INTEGER, allowNull: false },
      code: { type: DataTypes.STRING(20), allowNull: true },
      name: { type: DataTypes.STRING(255), allowNull: false },
      description: { type: DataTypes.TEXT, allowNull: true },
      is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
    },
    { tableName: 'm_item_type', timestamps: false, underscored: true }
  );

  ItemType.associate = (models) => {
    ItemType.belongsTo(models.ItemSubGroup, { foreignKey: 'subgroup_id', as: 'subGroup' });
    ItemType.hasMany(models.ItemSubType, { foreignKey: 'type_id', as: 'subTypes' });
  };

  return ItemType;
};
