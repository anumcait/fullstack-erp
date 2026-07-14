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
      tableName: 't_grn_item',
      timestamps: false,
      underscored: true,
    }
  );

  GRNItem.associate = (models) => {
    GRNItem.belongsTo(models.GRN, { foreignKey: 'grn_id', as: 'grn' });
  };

  return GRNItem;
};
