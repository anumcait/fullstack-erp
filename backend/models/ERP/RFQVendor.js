const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const RFQVendor = sequelize.define(
    'RFQVendor',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      rfq_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      supplier_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      quoted_amount: {
        type: DataTypes.DECIMAL(14, 2),
        allowNull: true,
      },
      gst_rate: {
        type: DataTypes.DECIMAL(5, 2),
        defaultValue: 0,
      },
      gst_amount: {
        type: DataTypes.DECIMAL(14, 2),
        defaultValue: 0,
      },
      total_amount: {
        type: DataTypes.DECIMAL(14, 2),
        defaultValue: 0,
      },
      delivery_days: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      validity_days: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      remarks: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      is_selected: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      tableName: 't_rfq_vendor',
      timestamps: false,
      underscored: true,
    }
  );

  RFQVendor.associate = (models) => {
    RFQVendor.belongsTo(models.RFQ, { foreignKey: 'rfq_id', as: 'rfq' });
    RFQVendor.belongsTo(models.SupplierMaster, { foreignKey: 'supplier_id', as: 'supplier' });
  };

  return RFQVendor;
};
