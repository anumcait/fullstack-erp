const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const VendorPriceList = sequelize.define(
    'VendorPriceList',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      supplier_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      item_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      rate: {
        type: DataTypes.DECIMAL(14, 2),
        allowNull: false,
      },
      gst_rate: {
        type: DataTypes.DECIMAL(5, 2),
        defaultValue: 0,
      },
      currency: {
        type: DataTypes.STRING(10),
        defaultValue: 'INR',
      },
      effective_from: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      effective_to: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      moq: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: true,
      },
      lead_days: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
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
      tableName: 'm_vendor_price_list',
      timestamps: false,
      underscored: true,
    }
  );

  VendorPriceList.associate = (models) => {
    VendorPriceList.belongsTo(models.SupplierMaster, { foreignKey: 'supplier_id', as: 'supplier' });
    VendorPriceList.belongsTo(models.ItemMaster, { foreignKey: 'item_id', as: 'item' });
  };

  return VendorPriceList;
};
