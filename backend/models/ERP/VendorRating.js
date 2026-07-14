const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const VendorRating = sequelize.define(
    'VendorRating',
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
      po_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      quality_score: {
        type: DataTypes.DECIMAL(5, 2),
        defaultValue: 0,
      },
      delivery_score: {
        type: DataTypes.DECIMAL(5, 2),
        defaultValue: 0,
      },
      price_score: {
        type: DataTypes.DECIMAL(5, 2),
        defaultValue: 0,
      },
      service_score: {
        type: DataTypes.DECIMAL(5, 2),
        defaultValue: 0,
      },
      overall_score: {
        type: DataTypes.DECIMAL(5, 2),
        defaultValue: 0,
      },
      remarks: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      rated_by: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      rating_date: {
        type: DataTypes.DATEONLY,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: 't_vendor_rating',
      timestamps: false,
      underscored: true,
    }
  );

  VendorRating.associate = (models) => {
    VendorRating.belongsTo(models.SupplierMaster, { foreignKey: 'supplier_id', as: 'supplier' });
  };

  return VendorRating;
};
