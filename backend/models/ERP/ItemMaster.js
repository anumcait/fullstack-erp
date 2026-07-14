const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ItemMaster = sequelize.define(
    'ItemMaster',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      item_code: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
      },
      item_name: {
        type: DataTypes.STRING(200),
        allowNull: false,
      },
      item_description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      category_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      unit_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      opening_stock: {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0,
      },
      current_stock: {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0,
      },
      min_stock: {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0,
      },
      max_stock: {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0,
      },
      reorder_level: {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0,
      },
      rate: {
        type: DataTypes.DECIMAL(14, 2),
        defaultValue: 0,
      },
      gst_rate: {
        type: DataTypes.DECIMAL(5, 2),
        defaultValue: 0,
      },
      hsn_code: {
        type: DataTypes.STRING(20),
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
      tableName: 'm_item_master',
      timestamps: false,
      underscored: true,
    }
  );

  ItemMaster.associate = (models) => {
    ItemMaster.belongsTo(models.ItemCategory, {
      foreignKey: 'category_id',
      as: 'category',
    });
    ItemMaster.belongsTo(models.Unit, {
      foreignKey: 'unit_id',
      as: 'unit',
    });
  };

  return ItemMaster;
};
