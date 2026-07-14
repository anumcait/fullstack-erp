const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const GateEntry = sequelize.define(
    'GateEntry',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      entry_no: { type: DataTypes.STRING(30), allowNull: false, unique: true },
      entry_date: { type: DataTypes.DATEONLY, allowNull: false },
      entry_type: {
        type: DataTypes.STRING(20),
        allowNull: false,
        validate: { isIn: [['Inward', 'Outward']] },
      },
      reference_type: { type: DataTypes.STRING(30), allowNull: true },
      reference_no: { type: DataTypes.STRING(50), allowNull: true },
      party_name: { type: DataTypes.STRING(200), allowNull: true },
      vehicle_no: { type: DataTypes.STRING(50), allowNull: true },
      driver_name: { type: DataTypes.STRING(100), allowNull: true },
      transporter: { type: DataTypes.STRING(100), allowNull: true },
      remarks: { type: DataTypes.TEXT, allowNull: true },
      status: {
        type: DataTypes.STRING(20),
        defaultValue: 'Open',
        validate: { isIn: [['Open', 'Closed', 'Cancelled']] },
      },
      created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
      updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    },
    {
      tableName: 't_gate_entry',
      timestamps: false,
      underscored: true,
    }
  );

  GateEntry.associate = (models) => {
    GateEntry.hasMany(models.GateEntryItem, {
      foreignKey: 'gate_entry_id', as: 'items',
    });
  };

  return GateEntry;
};
