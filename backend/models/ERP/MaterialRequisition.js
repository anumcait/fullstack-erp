const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const MaterialRequisition = sequelize.define(
    'MaterialRequisition',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      req_no: { type: DataTypes.STRING(30), allowNull: false, unique: true },
      req_date: { type: DataTypes.DATEONLY, allowNull: false },
      department: { type: DataTypes.STRING(100), allowNull: true },
      requested_by: { type: DataTypes.STRING(100), allowNull: true },
      status: {
        type: DataTypes.STRING(30),
        defaultValue: 'Draft',
        validate: {
          isIn: [['Draft', 'Pending', 'Approved', 'Partially Issued', 'Issued', 'Closed', 'Cancelled']],
        },
      },
      remarks: { type: DataTypes.TEXT, allowNull: true },
      approved_by: { type: DataTypes.STRING(100), allowNull: true },
      approved_date: { type: DataTypes.DATE, allowNull: true },
      created_date: { type: DataTypes.DATEONLY, defaultValue: DataTypes.NOW },
      updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    },
    {
      tableName: 't_material_requisition',
      timestamps: false,
      underscored: true,
    }
  );

  MaterialRequisition.associate = (models) => {
    MaterialRequisition.hasMany(models.MaterialRequisitionItem, {
      foreignKey: 'req_id', as: 'items',
    });
  };

  return MaterialRequisition;
};
