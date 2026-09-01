// Legacy HR employee data sourced from Oracle (parallel to Postgres HR DB).
module.exports = (sequelize, DataTypes) => {
  const LegacyHrEmployee = sequelize.define('LegacyHrEmployee', {
    emp_id:    { type: DataTypes.INTEGER, primaryKey: true },
    full_name: { type: DataTypes.STRING(100) },
    dept:      { type: DataTypes.STRING(50) },
    email:     { type: DataTypes.STRING(100) },
    hire_date: { type: DataTypes.DATEONLY },
  }, {
    tableName: 'LEGACY_HR_EMPLOYEES', // Oracle stores unquoted names UPPERCASE
    schema: 'HR',
    timestamps: false,
  });

  return LegacyHrEmployee;
};
