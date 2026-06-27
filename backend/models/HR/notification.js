const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Notification = sequelize.define('Notification', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        empid: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        message: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        type: {
            type: DataTypes.STRING, // e.g., 'Leave', 'Profile', 'General'
            allowNull: false,
            defaultValue: 'General',
        },
        isRead: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        link: {
            type: DataTypes.STRING, // Optional link to redirect
            allowNull: true,
        }
    }, {
        tableName: 'notifications',
        timestamps: true,
    });

    return Notification;
};
