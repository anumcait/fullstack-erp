module.exports = (sequelize, DataTypes) => {
  // One salary head revised by an increment entry. An entry can carry many
  // lines, e.g. Basic +10% and HRA +500 for the same employee.
  const EmpIncrementLine = sequelize.define('EmpIncrementLine', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    increment_id: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    component: {
      type: DataTypes.STRING(30),
      allowNull: false
    },
    // AMOUNT = flat rupees, PERCENT = percent of the current component
    inc_type: DataTypes.STRING(10),
    inc_value: DataTypes.DECIMAL(12, 2),
    old_value: DataTypes.DECIMAL(12, 2),
    new_value: DataTypes.DECIMAL(12, 2)
  }, {
    tableName: 'm_emp_increment_lines',
    timestamps: false,
    indexes: [
      { fields: ['increment_id'] }
    ]
  });

  EmpIncrementLine.associate = (models) => {
    EmpIncrementLine.belongsTo(models.EmpIncrement, { foreignKey: 'increment_id', as: 'increment' });
  };

  return EmpIncrementLine;
};