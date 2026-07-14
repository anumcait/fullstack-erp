const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const GRN = sequelize.define(
    'GRN',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      grn_no: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
      },
      grn_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      po_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      supplier_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      invoice_no: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      invoice_date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      gate_entry_no: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      status: {
        type: DataTypes.STRING(30),
        defaultValue: 'Received',
      },
      received_by: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: 't_grn',
      timestamps: false,
      underscored: true,
    }
  );

  GRN.associate = (models) => {
    GRN.hasMany(models.GRNItem, { foreignKey: 'grn_id', as: 'items' });
    GRN.belongsTo(models.PurchaseOrder, { foreignKey: 'po_id', as: 'purchaseOrder' });
    GRN.belongsTo(models.SupplierMaster, { foreignKey: 'supplier_id', as: 'supplier' });
  };

  return GRN;
};
