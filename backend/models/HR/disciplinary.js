const { DataTypes } = require('sequelize');

module.exports = (sequelize) => ({
  DisciplinaryCase: sequelize.define('DisciplinaryCase', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    case_no: { type: DataTypes.STRING(30), unique: true },
    empid: { type: DataTypes.INTEGER, allowNull: false },
    incident_date: { type: DataTypes.DATEONLY },
    reported_date: { type: DataTypes.DATEONLY },
    nature: { type: DataTypes.STRING(100) },
    description: { type: DataTypes.TEXT },
    severity: { type: DataTypes.STRING(20), defaultValue: 'Medium' },
    status: { type: DataTypes.STRING(20), defaultValue: 'Open' },
    reported_by: { type: DataTypes.STRING(100) },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  }, { tableName: 't_disciplinary_case', timestamps: false, underscored: true }),

  ShowCause: sequelize.define('ShowCause', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    case_id: { type: DataTypes.INTEGER, allowNull: false },
    notice_no: { type: DataTypes.STRING(30), unique: true },
    issued_date: { type: DataTypes.DATEONLY },
    response_deadline: { type: DataTypes.DATEONLY },
    charges: { type: DataTypes.TEXT },
    employee_response: { type: DataTypes.TEXT },
    response_date: { type: DataTypes.DATEONLY },
    status: { type: DataTypes.STRING(20), defaultValue: 'Issued' },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  }, { tableName: 't_show_cause', timestamps: false, underscored: true }),

  DisciplinaryAction: sequelize.define('DisciplinaryAction', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    case_id: { type: DataTypes.INTEGER, allowNull: false },
    action_type: { type: DataTypes.STRING(50) },
    action_date: { type: DataTypes.DATEONLY },
    description: { type: DataTypes.TEXT },
    effective_from: { type: DataTypes.DATEONLY },
    effective_to: { type: DataTypes.DATEONLY },
    approved_by: { type: DataTypes.STRING(100) },
    remarks: { type: DataTypes.TEXT },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  }, { tableName: 't_disciplinary_action', timestamps: false, underscored: true }),
});
