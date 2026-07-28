const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const MaterialRequisitionItem = sequelize.define(
    'MaterialRequisitionItem',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      req_id: { type: DataTypes.INTEGER, allowNull: false },
      item_id: { type: DataTypes.INTEGER, allowNull: true },
      item_code: { type: DataTypes.STRING(50), allowNull: true },
      item_name: { type: DataTypes.STRING(200), allowNull: false },
      quantity: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
      issued_quantity: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
      pending_quantity: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
      unit_id: { type: DataTypes.INTEGER, allowNull: true },
      uom: { type: DataTypes.STRING(20), allowNull: true },
      remarks: { type: DataTypes.TEXT, allowNull: true },
      item_status: { type: DataTypes.STRING(20), defaultValue: 'Draft' },
    },
    {
      tableName: 't_material_requisition_item',
      timestamps: false,
      underscored: true,
    }
  );

  return MaterialRequisitionItem;
};
