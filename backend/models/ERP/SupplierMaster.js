const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const SupplierMaster = sequelize.define(
    'SupplierMaster',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      party_type: {
        type: DataTypes.STRING(20),
        defaultValue: 'Supplier',
        validate: {
          isIn: [['Supplier', 'Sub-Contractor', 'Customer']],
        },
      },
      supplier_code: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
      },
      supplier_name: {
        type: DataTypes.STRING(200),
        allowNull: false,
      },
      contact_person: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      email: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      phone: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      mobile: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      address_line1: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      address_line2: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      city: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      state: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      pincode: {
        type: DataTypes.STRING(10),
        allowNull: true,
      },
      gstin: {
        type: DataTypes.STRING(15),
        allowNull: true,
      },
      gst_registration_type: {
        type: DataTypes.STRING(20),
        allowNull: true,
        validate: {
          isIn: [['Regular', 'Composition', 'Unregistered', 'SEZ', 'Deemed Export']],
        },
      },
      pan_no: {
        type: DataTypes.STRING(10),
        allowNull: true,
      },
      msme_reg_no: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      msme_type: {
        type: DataTypes.STRING(20),
        allowNull: true,
        validate: {
          isIn: [['Micro', 'Small', 'Medium', '']],
        },
      },
      payment_terms: {
        type: DataTypes.STRING(50),
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
      tableName: 'm_party_master',
      timestamps: false,
      underscored: true,
    }
  );

  return SupplierMaster;
};
