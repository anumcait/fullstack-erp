const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ProfileUpdateRequest = sequelize.define(
    'ProfileUpdateRequest',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      empid: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      request_type: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
      old_comm_address: { type: DataTypes.STRING(500) },
      new_comm_address: { type: DataTypes.STRING(500) },
      old_comm_phone: { type: DataTypes.STRING(50) },
      new_comm_phone: { type: DataTypes.STRING(50) },
      old_comm_mobile: { type: DataTypes.STRING(50) },
      new_comm_mobile: { type: DataTypes.STRING(50) },
      old_perm_address: { type: DataTypes.STRING(500) },
      new_perm_address: { type: DataTypes.STRING(500) },
      old_perm_phone: { type: DataTypes.STRING(50) },
      new_perm_phone: { type: DataTypes.STRING(50) },
      old_perm_mobile: { type: DataTypes.STRING(50) },
      new_perm_mobile: { type: DataTypes.STRING(50) },
      status: {
        type: DataTypes.STRING(20)
      },
      hr_remarks: { type: DataTypes.STRING(500) },
      reviewed_by: { type: DataTypes.INTEGER },
      reviewed_at: { type: DataTypes.DATE },
      created: {
        type: DataTypes.DATE,
        allowNull: true
      },
      updated: {
        type: DataTypes.DATE,
        allowNull: true
      }
    },
    {
      tableName: 'profile_update_requests',
      underscored: true,
      timestamps: true,
      createdAt: 'created',
      updatedAt: 'updated',
    }
  );

  return ProfileUpdateRequest;
};