const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const MaterialIssueItem = sequelize.define(
    'MaterialIssueItem',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      issue_id: { type: DataTypes.INTEGER, allowNull: false },
      req_item_id: { type: DataTypes.INTEGER, allowNull: true },
      item_id: { type: DataTypes.INTEGER, allowNull: true },
      item_code: { type: DataTypes.STRING(50), allowNull: true },
      item_name: { type: DataTypes.STRING(200), allowNull: false },
      quantity: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
      unit_id: { type: DataTypes.INTEGER, allowNull: true },
      batch_no: { type: DataTypes.STRING(50), allowNull: true },
      rack_id: { type: DataTypes.INTEGER, allowNull: true },
      remarks: { type: DataTypes.TEXT, allowNull: true },
    },
    {
      tableName: 't_material_issue_item',
      timestamps: false,
      underscored: true,
    }
  );

  MaterialIssueItem.associate = (models) => {
    MaterialIssueItem.belongsTo(models.MaterialIssue, {
      foreignKey: 'issue_id', as: 'issue',
    });
  };

  return MaterialIssueItem;
};
