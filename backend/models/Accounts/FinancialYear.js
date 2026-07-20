const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const FinancialYear = sequelize.define('FinancialYear', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING(20), allowNull: false, unique: true },
    start_date: { type: DataTypes.DATEONLY, allowNull: false },
    end_date: { type: DataTypes.DATEONLY, allowNull: false },
    is_active: { type: DataTypes.BOOLEAN, defaultValue: false },
    is_closed: { type: DataTypes.BOOLEAN, defaultValue: false },
  }, {
    tableName: 'financial_years',

    timestamps: true,

    createdAt: 'created_date',

    updatedAt: 'updated_at',
  });

  FinancialYear.associate = (models) => {
    FinancialYear.hasMany(models.Voucher, { foreignKey: 'financial_year_id' });
    FinancialYear.hasMany(models.Budget, { foreignKey: 'financial_year_id' });
  };

  return FinancialYear;
};
