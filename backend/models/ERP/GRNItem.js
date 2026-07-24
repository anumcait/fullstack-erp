const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const GRNItem = sequelize.define(
    'GRNItem',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      grn_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      po_item_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      pr_item_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
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
      uom: { type: DataTypes.STRING(20), allowNull: true },
      rep: { type: DataTypes.STRING(30), allowNull: true },
      dia: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
      len: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
      wid: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
      thk: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
      kg: { type: DataTypes.DECIMAL(12, 3), defaultValue: 0 },
      recv_kg: { type: DataTypes.DECIMAL(12, 3), defaultValue: 0 },
      accp: { type: DataTypes.DECIMAL(12, 3), defaultValue: 0 },
      phy: { type: DataTypes.DECIMAL(12, 3), defaultValue: 0 },
      weight: { type: DataTypes.DECIMAL(12, 3), defaultValue: 0 },
      pr_no: { type: DataTypes.STRING(50), allowNull: true },
      po_no: { type: DataTypes.STRING(50), allowNull: true },
      supp_qty: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
      ordered_qty: {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0,
      },
      received_qty: {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0,
      },
      accepted_qty: {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0,
      },
      rejected_qty: {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0,
      },
      reject_reason: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      rate: {
        type: DataTypes.DECIMAL(14, 2),
        defaultValue: 0,
      },
      gst_rate: {
        type: DataTypes.DECIMAL(5, 2),
        defaultValue: 0,
      },
      gst_amount: {
        type: DataTypes.DECIMAL(14, 2),
        defaultValue: 0,
      },
      amount: {
        type: DataTypes.DECIMAL(14, 2),
        defaultValue: 0,
      },
    },
    {
      tableName: 't_ir_item',
      timestamps: false,
      underscored: true,
    }
  );

  GRNItem.associate = (models) => {
    GRNItem.belongsTo(models.GRN, { foreignKey: 'grn_id', as: 'grn' });
  };

  return GRNItem;
};
