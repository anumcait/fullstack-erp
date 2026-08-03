const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const IrDc = sequelize.define('IrDc', {}, {
    tableName: 't_ir_dc',
    timestamps: false,
  });

  const GRN = sequelize.define(
    'GRN',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      ir_no: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
      },
      ir_date: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      po_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      pr_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
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
      approval_status: {
        type: DataTypes.STRING(20),
        defaultValue: 'Pending',
        validate: { isIn: [['Pending', 'Approved', 'Rejected']] },
      },
      approved_by: { type: DataTypes.STRING(100), allowNull: true },
      approved_date: { type: DataTypes.DATE, allowNull: true },
      approval_remarks: { type: DataTypes.TEXT, allowNull: true },
      cancel_remarks: { type: DataTypes.TEXT, allowNull: true },
      cancel_by: { type: DataTypes.STRING(100), allowNull: true },
      cancel_date: { type: DataTypes.DATE, allowNull: true },
      qa_status: {
        type: DataTypes.STRING(20),
        defaultValue: 'Pending',
        validate: { isIn: [['Pending', 'Passed', 'Rejected', 'Partial']] },
      },
      qa_by: { type: DataTypes.STRING(100), allowNull: true },
      qa_date: { type: DataTypes.DATEONLY, allowNull: true },
      qa_remarks: { type: DataTypes.TEXT, allowNull: true },
      bill_no: { type: DataTypes.STRING(20), allowNull: true },
      bill_date: { type: DataTypes.DATEONLY, allowNull: true },
      ir_type: {
        type: DataTypes.STRING(20),
        defaultValue: 'GRR',
        validate: { isIn: [['GRR', 'Jobwork', 'Resharpening', 'Loan', 'Maintenance']] },
      },
      dc_type: {
        type: DataTypes.STRING(20),
        defaultValue: 'S',
        validate: { isIn: [['L', 'R', 'M', 'J', 'S', 'G']] },
      },
      dept_cd: { type: DataTypes.STRING(50), allowNull: true },
      year: { type: DataTypes.STRING(4), allowNull: true },
      inward_date: { type: DataTypes.DATEONLY, allowNull: true },
      received_by: { type: DataTypes.STRING(100), allowNull: true },
      cost_posted: { type: DataTypes.BOOLEAN, defaultValue: false },
      notes: {
        type: DataTypes.TEXT,
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
      tableName: 'ir',
      timestamps: false,
      underscored: true,
    }
  );

GRN.associate = (models) => {
  GRN.hasMany(models.GRNItem, { foreignKey: 'grn_id', as: 'items' });
  GRN.belongsTo(models.PurchaseOrder, { foreignKey: 'po_id', as: 'purchaseOrder' });
  GRN.belongsTo(models.PurchaseRequisition, { foreignKey: 'pr_id', as: 'purchaseRequisition' });
  GRN.belongsTo(models.SupplierMaster, { foreignKey: 'supplier_id', as: 'supplier' });
  GRN.belongsToMany(models.DeliveryChallan, {
    through: IrDc,
    foreignKey: 'ir_id',
    otherKey: 'dc_id',
    as: 'deliveryChallans',
  });
};

  return GRN;
};
