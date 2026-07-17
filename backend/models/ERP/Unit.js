const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Unit = sequelize.define(
    'Unit',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
      },
      short_name: {
        type: DataTypes.STRING(10),
        allowNull: true,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      created_date: {
        type: DataTypes.DATEONLY,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: 'm_unit',
      timestamps: false,
      underscored: true,
    }
  );

  return Unit;
};
