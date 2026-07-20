const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const SubcontractIssue = sequelize.define('SubcontractIssue', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    issue_no: { type: DataTypes.STRING(50), allowNull: false, unique: true },
    order_id: { type: DataTypes.INTEGER, allowNull: false },
    issue_date: { type: DataTypes.DATEONLY, allowNull: false },
    vendor_id: { type: DataTypes.INTEGER },
    vendor_name: { type: DataTypes.STRING(200) },
    status: { type: DataTypes.STRING(30), defaultValue: 'Draft' },
    notes: { type: DataTypes.TEXT },
    created_by: { type: DataTypes.STRING(100) },
  }, {
    tableName: 't_subcontract_issue',
    timestamps: true,
    createdAt: 'created_date',
    updatedAt: 'updated_at',
    underscored: true,
  });

  SubcontractIssue.associate = (models) => {
    SubcontractIssue.belongsTo(models.SubcontractOrder, { foreignKey: 'order_id', as: 'order' });
    SubcontractIssue.hasMany(models.SubcontractIssueItem, { foreignKey: 'issue_id', as: 'items' });
  };

  return SubcontractIssue;
};
