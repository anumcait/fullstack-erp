const { DataTypes } = require('sequelize');

module.exports = (sequelize) => ({
  TrainingCourse: sequelize.define('TrainingCourse', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    course_code: { type: DataTypes.STRING(30), unique: true },
    course_name: { type: DataTypes.STRING(300), allowNull: false },
    category: { type: DataTypes.STRING(100) },
    duration_hours: { type: DataTypes.INTEGER },
    vendor: { type: DataTypes.STRING(200) },
    description: { type: DataTypes.TEXT },
    is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  }, { tableName: 't_training_course', timestamps: false, underscored: true }),

  TrainingSession: sequelize.define('TrainingSession', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    course_id: { type: DataTypes.INTEGER, allowNull: false },
    session_code: { type: DataTypes.STRING(30), unique: true },
    trainer: { type: DataTypes.STRING(200) },
    mode: { type: DataTypes.STRING(30), defaultValue: 'Classroom' },
    location: { type: DataTypes.STRING(200) },
    start_date: { type: DataTypes.DATEONLY },
    end_date: { type: DataTypes.DATEONLY },
    start_time: { type: DataTypes.TIME },
    end_time: { type: DataTypes.TIME },
    status: { type: DataTypes.STRING(20), defaultValue: 'Planned' },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  }, { tableName: 't_training_session', timestamps: false, underscored: true }),

  TrainingParticipant: sequelize.define('TrainingParticipant', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    session_id: { type: DataTypes.INTEGER, allowNull: false },
    empid: { type: DataTypes.INTEGER, allowNull: false },
    attendance: { type: DataTypes.STRING(20), defaultValue: 'Pending' },
    score: { type: DataTypes.INTEGER },
    feedback: { type: DataTypes.TEXT },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  }, { tableName: 't_training_participant', timestamps: false, underscored: true }),

  Certification: sequelize.define('Certification', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    empid: { type: DataTypes.INTEGER, allowNull: false },
    certification_name: { type: DataTypes.STRING(300), allowNull: false },
    issued_by: { type: DataTypes.STRING(200) },
    issued_date: { type: DataTypes.DATEONLY },
    expiry_date: { type: DataTypes.DATEONLY },
    credential_url: { type: DataTypes.TEXT },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  }, { tableName: 't_certification', timestamps: false, underscored: true }),

  SkillMatrix: sequelize.define('SkillMatrix', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    empid: { type: DataTypes.INTEGER, allowNull: false },
    skill_name: { type: DataTypes.STRING(100), allowNull: false },
    category: { type: DataTypes.STRING(100) },
    proficiency: { type: DataTypes.INTEGER, defaultValue: 1 },
    years_experience: { type: DataTypes.DECIMAL(4, 1) },
    last_used: { type: DataTypes.DATEONLY },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  }, { tableName: 't_skill_matrix', timestamps: false, underscored: true }),
});
