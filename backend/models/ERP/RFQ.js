const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const RFQ = sequelize.define(
    'RFQ',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      rfq_no: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
      },
      rfq_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      subject: {
        type: DataTypes.STRING(300),
        allowNull: true,
      },
      status: {
        type: DataTypes.STRING(30),
        defaultValue: 'Open',
      },
      closing_date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      remarks: {
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
      tableName: 't_rfq',
      timestamps: false,
      underscored: true,
    }
  );

  RFQ.associate = (models) => {
    RFQ.hasMany(models.RFQItem, { foreignKey: 'rfq_id', as: 'items' });
    RFQ.hasMany(models.RFQVendor, { foreignKey: 'rfq_id', as: 'vendors' });
  };

  return RFQ;
};
