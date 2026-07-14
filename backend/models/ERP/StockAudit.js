const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const StockAudit = sequelize.define(
    'StockAudit',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      audit_no: { type: DataTypes.STRING(30), allowNull: false, unique: true },
      audit_date: { type: DataTypes.DATEONLY, allowNull: false },
      warehouse: { type: DataTypes.STRING(100), allowNull: true },
      auditor: { type: DataTypes.STRING(100), allowNull: true },
      status: {
        type: DataTypes.STRING(20),
        defaultValue: 'Draft',
        validate: { isIn: [['Draft', 'Completed', 'Approved', 'Cancelled']] },
      },
      remarks: { type: DataTypes.TEXT, allowNull: true },
      created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
      updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    },
    {
      tableName: 't_stock_audit',
      timestamps: false,
      underscored: true,
    }
  );

  StockAudit.associate = (models) => {
    StockAudit.hasMany(models.StockAuditItem, {
      foreignKey: 'audit_id', as: 'items',
    });
  };

  return StockAudit;
};
