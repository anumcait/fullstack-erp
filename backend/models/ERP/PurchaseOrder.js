const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const PurchaseOrder = sequelize.define(
    'PurchaseOrder',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      po_no: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
      },
      po_date: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      req_date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      supplier_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      requisition_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      status: {
        type: DataTypes.STRING(30),
        defaultValue: 'Draft',
      },
      payment_terms: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      delivery_terms: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      subtotal: {
        type: DataTypes.DECIMAL(14, 2),
        defaultValue: 0,
      },
      discount_percent: {
        type: DataTypes.DECIMAL(5, 2),
        defaultValue: 0,
      },
      discount_amount: {
        type: DataTypes.DECIMAL(14, 2),
        defaultValue: 0,
      },
      tax_amount: {
        type: DataTypes.DECIMAL(14, 2),
        defaultValue: 0,
      },
      grand_total: {
        type: DataTypes.DECIMAL(14, 2),
        defaultValue: 0,
      },
      currency: {
        type: DataTypes.STRING(10),
        defaultValue: 'INR',
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      old_po_no: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      old_po_year: {
        type: DataTypes.STRING(10),
        allowNull: true,
      },
      subject: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      reference: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      qtn_no: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      ref_date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      qca_req: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      any_other_terms: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      delivery_period: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      desp_to: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      insurance: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      rem1: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      rem2: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      rem3: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      inspection: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      freight: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      freight_forward: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      currency_val: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      req_yn: {
        type: DataTypes.STRING(10),
        allowNull: true,
      },
      ven_code: {
        type: DataTypes.STRING(50),
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
      tableName: 't_purchase_order',
      timestamps: false,
      underscored: true,
    }
  );

  PurchaseOrder.associate = (models) => {
    PurchaseOrder.hasMany(models.PurchaseOrderItem, {
      foreignKey: 'po_id',
      as: 'items',
    });
    PurchaseOrder.belongsTo(models.SupplierMaster, {
      foreignKey: 'supplier_id',
      as: 'supplier',
    });
  };

  return PurchaseOrder;
};
