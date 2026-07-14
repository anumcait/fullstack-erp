const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const PurchaseRequisitionItem = sequelize.define(
    'PurchaseRequisitionItem',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      requisition_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      item_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      item_code: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      item_name: {
        type: DataTypes.STRING(200),
        allowNull: false,
      },
      quantity: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
      },
      unit_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      expected_date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      remarks: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      tableName: 't_purchase_requisition_item',
      timestamps: false,
      underscored: true,
    }
  );

  PurchaseRequisitionItem.associate = (models) => {
    PurchaseRequisitionItem.belongsTo(models.PurchaseRequisition, {
      foreignKey: 'requisition_id',
      as: 'requisition',
    });
  };

  return PurchaseRequisitionItem;
};
