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
      cost_center: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      uom: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      purpose: {
        type: DataTypes.STRING(200),
        allowNull: true,
      },
      len: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      item_no: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      kg: {
        type: DataTypes.DECIMAL(12, 3),
        allowNull: true,
      },
      mat_code: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      mat_desc: {
        type: DataTypes.STRING(200),
        allowNull: true,
      },
      est_cost: {
        type: DataTypes.DECIMAL(14, 2),
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
