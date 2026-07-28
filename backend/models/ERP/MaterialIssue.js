const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const MaterialIssue = sequelize.define(
    'MaterialIssue',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      issue_no: { type: DataTypes.STRING(30), allowNull: false, unique: true },
      issue_date: { type: DataTypes.DATE, allowNull: false },
      req_id: { type: DataTypes.INTEGER, allowNull: true },
      issued_to: { type: DataTypes.STRING(100), allowNull: true },
      department: { type: DataTypes.STRING(100), allowNull: true },
      issued_by: { type: DataTypes.STRING(100), allowNull: true },
      received_by: { type: DataTypes.STRING(100), allowNull: true },
      status: {
        type: DataTypes.STRING(20),
        defaultValue: 'Draft',
        validate: {
          isIn: [['Draft', 'Issued', 'Cancelled']],
        },
      },
      remarks: { type: DataTypes.TEXT, allowNull: true },
      created_date: { type: DataTypes.DATEONLY, defaultValue: DataTypes.NOW },
      updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    },
    {
      tableName: 't_material_issue',
      timestamps: false,
      underscored: true,
    }
  );

  MaterialIssue.associate = (models) => {
    MaterialIssue.hasMany(models.MaterialIssueItem, {
      foreignKey: 'issue_id', as: 'items',
    });
    MaterialIssue.belongsTo(models.MaterialRequisition, {
      foreignKey: 'req_id', as: 'requisition',
    });
  };

  return MaterialIssue;
};
