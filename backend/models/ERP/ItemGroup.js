const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ItemGroup = sequelize.define(
    'ItemGroup',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      code: { type: DataTypes.STRING(20), allowNull: true },
      name: { type: DataTypes.STRING(100), allowNull: false, unique: true },
      description: { type: DataTypes.TEXT, allowNull: true },
      is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
    },
    { tableName: 'm_item_group', timestamps: false, underscored: true }
  );

  ItemGroup.associate = (models) => {
    ItemGroup.hasMany(models.ItemSubGroup, { foreignKey: 'group_id', as: 'subGroups' });
  };

  return ItemGroup;
};
