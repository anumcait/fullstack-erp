const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Batch = sequelize.define(
    'Batch',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      item_id: { type: DataTypes.INTEGER, allowNull: false },
      batch_no: { type: DataTypes.STRING(50), allowNull: false },
      quantity: { type: DataTypes.DECIMAL(14, 3), defaultValue: 0 },
      mfg_date: { type: DataTypes.DATEONLY, allowNull: true },
      exp_date: { type: DataTypes.DATEONLY, allowNull: true },
      is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
      created_date: { type: DataTypes.DATEONLY, defaultValue: DataTypes.NOW },
    },
    { tableName: 'm_item_batch', timestamps: false, underscored: true, indexes: [{ unique: true, fields: ['batch_no', 'item_id'] }] }
  );

  Batch.associate = (models) => {
    Batch.belongsTo(models.ItemMaster, { foreignKey: 'item_id', as: 'item' });
    Batch.hasMany(models.StockLedger, { foreignKey: 'batch_id', as: 'ledgerEntries' });
  };

  return Batch;
};
