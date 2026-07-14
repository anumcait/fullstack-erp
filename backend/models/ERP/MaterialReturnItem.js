const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const MaterialReturnItem = sequelize.define(
    'MaterialReturnItem',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      return_id: { type: DataTypes.INTEGER, allowNull: false },
      item_id: { type: DataTypes.INTEGER, allowNull: true },
      item_code: { type: DataTypes.STRING(50), allowNull: true },
      item_name: { type: DataTypes.STRING(200), allowNull: false },
      quantity: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
      unit_id: { type: DataTypes.INTEGER, allowNull: true },
      batch_no: { type: DataTypes.STRING(50), allowNull: true },
      remarks: { type: DataTypes.TEXT, allowNull: true },
    },
    {
      tableName: 't_material_return_item',
      timestamps: false,
      underscored: true,
    }
  );

  MaterialReturnItem.associate = (models) => {
    MaterialReturnItem.belongsTo(models.MaterialReturn, {
      foreignKey: 'return_id', as: 'returnRef',
    });
  };

  return MaterialReturnItem;
};
