const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const GateEntryItem = sequelize.define(
    'GateEntryItem',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      gate_entry_id: { type: DataTypes.INTEGER, allowNull: false },
      item_description: { type: DataTypes.STRING(200), allowNull: false },
      quantity: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
      unit: { type: DataTypes.STRING(30), allowNull: true },
      remarks: { type: DataTypes.TEXT, allowNull: true },
    },
    {
      tableName: 't_gate_entry_item',
      timestamps: false,
      underscored: true,
    }
  );

  return GateEntryItem;
};
