const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ItemSubGroup = sequelize.define(
    'ItemSubGroup',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      group_id: { type: DataTypes.INTEGER, allowNull: false },
      code: { type: DataTypes.STRING(20), allowNull: true },
      name: { type: DataTypes.STRING(255), allowNull: false },
      description: { type: DataTypes.TEXT, allowNull: true },
      is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
    },
    { tableName: 'm_item_subgroup', timestamps: false, underscored: true }
  );

  ItemSubGroup.associate = (models) => {
    ItemSubGroup.belongsTo(models.ItemGroup, { foreignKey: 'group_id', as: 'group' });
    ItemSubGroup.hasMany(models.ItemType, { foreignKey: 'subgroup_id', as: 'types' });
  };

  return ItemSubGroup;
};
