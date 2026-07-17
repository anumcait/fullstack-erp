const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const MaterialReturn = sequelize.define(
    'MaterialReturn',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      return_no: { type: DataTypes.STRING(30), allowNull: false, unique: true },
      return_date: { type: DataTypes.DATEONLY, allowNull: false },
      return_type: {
        type: DataTypes.STRING(20),
        allowNull: false,
        validate: { isIn: [['To Supplier', 'To Store', 'To Production']] },
      },
      party_id: { type: DataTypes.INTEGER, allowNull: true },
      party_name: { type: DataTypes.STRING(200), allowNull: true },
      reference_type: { type: DataTypes.STRING(30), allowNull: true },
      reference_no: { type: DataTypes.STRING(50), allowNull: true },
      returned_by: { type: DataTypes.STRING(100), allowNull: true },
      received_by: { type: DataTypes.STRING(100), allowNull: true },
      status: {
        type: DataTypes.STRING(20),
        defaultValue: 'Draft',
        validate: { isIn: [['Draft', 'Returned', 'Cancelled']] },
      },
      remarks: { type: DataTypes.TEXT, allowNull: true },
      created_date: { type: DataTypes.DATEONLY, defaultValue: DataTypes.NOW },
      updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    },
    {
      tableName: 't_material_return',
      timestamps: false,
      underscored: true,
    }
  );

  MaterialReturn.associate = (models) => {
    MaterialReturn.hasMany(models.MaterialReturnItem, {
      foreignKey: 'return_id', as: 'items',
    });
  };

  return MaterialReturn;
};
