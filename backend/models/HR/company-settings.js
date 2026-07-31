module.exports = (sequelize, DataTypes) => {
    const CompanySettings = sequelize.define('CompanySettings', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        company_name: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: ''
        },
        address: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        phone: {
            type: DataTypes.STRING,
            allowNull: true
        },
        email: {
            type: DataTypes.STRING,
            allowNull: true
        },
        website: {
            type: DataTypes.STRING,
            allowNull: true
        },
        gstin: {
            type: DataTypes.STRING,
            allowNull: true
        },
        cin: {
            type: DataTypes.STRING,
            allowNull: true
        },
        pan: {
            type: DataTypes.STRING,
            allowNull: true
        },
        show_format_no: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
        pf_number: {
            type: DataTypes.STRING,
            allowNull: true
        },
        esi_number: {
            type: DataTypes.STRING,
            allowNull: true
        },
        logo_url: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        // Add other settings fields as needed
        payroll_pt_rate: {
            type: DataTypes.DECIMAL(10, 2),
            defaultValue: 200
        },
        payroll_ot_multiplier: {
            type: DataTypes.DECIMAL(10, 2),
            defaultValue: 1.5
        },
        c_last_update: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        }
    }, {
        tableName: 'm_company_settings',
        timestamps: false
    });

    return CompanySettings;
};
