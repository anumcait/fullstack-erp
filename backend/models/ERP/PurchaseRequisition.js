const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const PurchaseRequisition = sequelize.define(
    'PurchaseRequisition',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      req_no: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
      },
      req_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      department: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      sub_department: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      requested_by: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      indent_type: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      status: {
        type: DataTypes.STRING(30),
        defaultValue: 'Draft',
      },
      priority: {
        type: DataTypes.STRING(20),
        defaultValue: 'Normal',
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      approved_by: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      approved_date: {
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
      tableName: 't_purchase_requisition',
      timestamps: false,
      underscored: true,
    }
  );

  PurchaseRequisition.associate = (models) => {
    PurchaseRequisition.hasMany(models.PurchaseRequisitionItem, {
      foreignKey: 'requisition_id',
      as: 'items',
    });
  };

  return PurchaseRequisition;
};
