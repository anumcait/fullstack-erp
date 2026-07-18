const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const SubcontractIssueItem = sequelize.define('SubcontractIssueItem', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    issue_id: { type: DataTypes.INTEGER, allowNull: false },
    item_id: { type: DataTypes.INTEGER },
    item_code: { type: DataTypes.STRING(50) },
    item_name: { type: DataTypes.STRING(200), allowNull: false },
    quantity: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
    uom: { type: DataTypes.STRING(20) },
    notes: { type: DataTypes.TEXT },
  }, {
    tableName: 't_subcontract_issue_item',
    timestamps: true,
    underscored: true,
  });

  SubcontractIssueItem.associate = (models) => {
    SubcontractIssueItem.belongsTo(models.SubcontractIssue, { foreignKey: 'issue_id', as: 'issue' });
  };

  return SubcontractIssueItem;
};
