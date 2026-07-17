const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const PRAmendment = sequelize.define(
    'PRAmendment',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      requisition_id: { type: DataTypes.INTEGER, allowNull: false },
      amended_by: { type: DataTypes.STRING(100), allowNull: true },
      amendment_date: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
      change_summary: { type: DataTypes.TEXT, allowNull: true },
      old_value: { type: DataTypes.JSONB, allowNull: true },
      new_value: { type: DataTypes.JSONB, allowNull: true },
    },
    {
      tableName: 't_pr_amendment',
      timestamps: false,
      underscored: true,
    }
  );

  PRAmendment.associate = (models) => {
    PRAmendment.belongsTo(models.PurchaseRequisition, { foreignKey: 'requisition_id', as: 'requisition' });
  };

  return PRAmendment;
};
