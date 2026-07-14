const { DataTypes } = require('sequelize');

module.exports = (sequelize) => ({
  KraTemplate: sequelize.define('KraTemplate', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    template_name: { type: DataTypes.STRING(200), allowNull: false },
    department: { type: DataTypes.STRING(100) },
    designation: { type: DataTypes.STRING(100) },
    financial_year: { type: DataTypes.STRING(20) },
    is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  }, { tableName: 't_kra_template', timestamps: false, underscored: true }),

  KraTemplateItem: sequelize.define('KraTemplateItem', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    template_id: { type: DataTypes.INTEGER, allowNull: false },
    kpi_name: { type: DataTypes.STRING(300), allowNull: false },
    weightage: { type: DataTypes.DECIMAL(5, 2), defaultValue: 0 },
    target: { type: DataTypes.STRING(200) },
    measurement_unit: { type: DataTypes.STRING(100) },
    description: { type: DataTypes.TEXT },
    sort_order: { type: DataTypes.INTEGER, defaultValue: 0 },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  }, { tableName: 't_kra_template_item', timestamps: false, underscored: true }),

  AppraisalCycle: sequelize.define('AppraisalCycle', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    cycle_name: { type: DataTypes.STRING(200), allowNull: false },
    cycle_type: { type: DataTypes.STRING(30), defaultValue: 'Annual' },
    financial_year: { type: DataTypes.STRING(20) },
    start_date: { type: DataTypes.DATEONLY },
    end_date: { type: DataTypes.DATEONLY },
    status: { type: DataTypes.STRING(20), defaultValue: 'Open' },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  }, { tableName: 't_appraisal_cycle', timestamps: false, underscored: true }),

  Appraisal: sequelize.define('Appraisal', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    cycle_id: { type: DataTypes.INTEGER, allowNull: false },
    empid: { type: DataTypes.INTEGER, allowNull: false },
    template_id: { type: DataTypes.INTEGER },
    self_final_score: { type: DataTypes.DECIMAL(5, 2) },
    manager_final_score: { type: DataTypes.DECIMAL(5, 2) },
    overall_rating: { type: DataTypes.DECIMAL(3, 1) },
    status: { type: DataTypes.STRING(20), defaultValue: 'Pending' },
    reviewer: { type: DataTypes.STRING(100) },
    review_date: { type: DataTypes.DATEONLY },
    comments: { type: DataTypes.TEXT },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  }, { tableName: 't_appraisal', timestamps: false, underscored: true }),

  AppraisalRating: sequelize.define('AppraisalRating', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    appraisal_id: { type: DataTypes.INTEGER, allowNull: false },
    template_item_id: { type: DataTypes.INTEGER, allowNull: false },
    self_score: { type: DataTypes.DECIMAL(5, 2) },
    manager_score: { type: DataTypes.DECIMAL(5, 2) },
    self_remarks: { type: DataTypes.TEXT },
    manager_remarks: { type: DataTypes.TEXT },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  }, { tableName: 't_appraisal_rating', timestamps: false, underscored: true }),
});
