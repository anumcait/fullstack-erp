const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const RFQItem = sequelize.define(
    'RFQItem',
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
      quantity: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
      },
      unit_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      gst_rate: {
        type: DataTypes.DECIMAL(5, 2),
        defaultValue: 0,
      },
    },
    {
      tableName: 't_rfq_item',
      timestamps: false,
      underscored: true,
    }
  );

  RFQItem.associate = (models) => {
    RFQItem.belongsTo(models.RFQ, { foreignKey: 'rfq_id', as: 'rfq' });
  };

  return RFQItem;
};
