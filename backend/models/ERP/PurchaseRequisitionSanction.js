const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const PurchaseRequisitionSanction = sequelize.define(
    'PurchaseRequisitionSanction',
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
      pr_item_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      supplier_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      sanctioned_qty: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0,
      },
      rate: {
        type: DataTypes.DECIMAL(14, 2),
        allowNull: true,
      },
      status: {
        type: DataTypes.STRING(30),
        defaultValue: 'Sanctioned',
      },
      remarks: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      sanctioned_by: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      sanctioned_date: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      created_date: {
        type: DataTypes.DATEONLY,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: 't_pr_sanction',
      timestamps: false,
      underscored: true,
    }
  );

  PurchaseRequisitionSanction.associate = (models) => {
    PurchaseRequisitionSanction.belongsTo(models.PurchaseRequisition, {
      foreignKey: 'requisition_id',
      as: 'requisition',
    });
    PurchaseRequisitionSanction.belongsTo(models.PurchaseRequisitionItem, {
      foreignKey: 'pr_item_id',
      as: 'prItem',
    });
    PurchaseRequisitionSanction.belongsTo(models.SupplierMaster, {
      foreignKey: 'supplier_id',
      as: 'supplier',
    });
  };

  return PurchaseRequisitionSanction;
};
