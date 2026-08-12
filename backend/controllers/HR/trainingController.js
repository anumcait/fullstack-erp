const { TrainingCourse, TrainingSession, TrainingParticipant, Certification, SkillMatrix } = require('../../models');
const { Op, Sequelize } = require('sequelize');

// ===== COURSES =====
exports.getAllCourses = async (req, res) => {
  try {
    const data = await TrainingCourse.findAll({ where: { is_active: true }, order: [['course_name', 'ASC']] });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Failed', error: error.message });
  }
};

exports.saveCourse = async (req, res) => {
  try {
    const { id } = req.body;
    if (id) {
      await TrainingCourse.update(req.body, { where: { id } });
      res.json({ message: 'Updated', id });
    } else {
      const max = await TrainingCourse.findOne({ attributes: [[Sequelize.fn('MAX', Sequelize.col('id')), 'maxId']], raw: true });
      req.body.course_code = `TRC-${String((Number(max.maxId) || 0) + 1).padStart(4, '0')}`;
      const created = await TrainingCourse.create(req.body);
      res.status(201).json({ message: 'Saved', id: created.id });
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed', error: error.message });
  }
};

// ===== SESSIONS =====
exports.getAllSessions = async (req, res) => {
  try {
    const { course_id } = req.query;
    const where = {};
    if (course_id) where.course_id = course_id;
    const data = await TrainingSession.findAll({ where, order: [['start_date', 'DESC']] });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Failed', error: error.message });
  }
};

exports.saveSession = async (req, res) => {
  try {
    const { id } = req.body;
    if (id) {
      await TrainingSession.update(req.body, { where: { id } });
      res.json({ message: 'Updated', id });
    } else {
      const max = await TrainingSession.findOne({ attributes: [[Sequelize.fn('MAX', Sequelize.col('id')), 'maxId']], raw: true });
      req.body.session_code = `TRS-${String((Number(max.maxId) || 0) + 1).padStart(4, '0')}`;
      const created = await TrainingSession.create(req.body);
      res.status(201).json({ message: 'Saved', id: created.id });
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed', error: error.message });
  }
};

// ===== PARTICIPANTS =====
exports.getParticipants = async (req, res) => {
  try {
    const { session_id } = req.query;
    const where = {};
    if (session_id) where.session_id = session_id;
    const data = await TrainingParticipant.findAll({ where, order: [['id', 'ASC']] });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Failed', error: error.message });
  }
};

exports.saveParticipants = async (req, res) => {
  try {
    const { session_id, empids } = req.body;
    await TrainingParticipant.destroy({ where: { session_id } });
    if (empids?.length) {
      const records = empids.map((empid) => ({ session_id, empid }));
      await TrainingParticipant.bulkCreate(records);
    }
    res.json({ success: true, message: 'Participants saved' });
  } catch (error) {
    res.status(500).json({ message: 'Failed', error: error.message });
  }
};

exports.updateAttendance = async (req, res) => {
  try {
    const { id, attendance, score, feedback } = req.body;
    const update = {};
    if (attendance) update.attendance = attendance;
    if (score !== undefined) update.score = score;
    if (feedback) update.feedback = feedback;
    await TrainingParticipant.update(update, { where: { id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: 'Failed', error: error.message });
  }
};

// ===== CERTIFICATIONS =====
exports.getCertifications = async (req, res) => {
  try {
    const { empid } = req.query;
    const where = {};
    if (empid) where.empid = empid;
    const data = await Certification.findAll({ where, order: [['issued_date', 'DESC']] });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Failed', error: error.message });
  }
};

exports.saveCertification = async (req, res) => {
  try {
    const { id } = req.body;
    if (id) {
      await Certification.update(req.body, { where: { id } });
      res.json({ message: 'Updated', id });
    } else {
      const created = await Certification.create(req.body);
      res.status(201).json({ message: 'Saved', id: created.id });
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed', error: error.message });
  }
};

exports.deleteCertification = async (req, res) => {
  try {
    await Certification.destroy({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: 'Failed', error: error.message });
  }
};

// ===== SKILL MATRIX =====
exports.getSkills = async (req, res) => {
  try {
    const { empid } = req.query;
    const where = {};
    if (empid) where.empid = empid;
    const data = await SkillMatrix.findAll({ where, order: [['skill_name', 'ASC']] });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Failed', error: error.message });
  }
};

exports.saveSkill = async (req, res) => {
  try {
    const { id } = req.body;
    if (id) {
      await SkillMatrix.update(req.body, { where: { id } });
      res.json({ message: 'Updated', id });
    } else {
      const created = await SkillMatrix.create(req.body);
      res.status(201).json({ message: 'Saved', id: created.id });
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed', error: error.message });
  }
};

exports.deleteSkill = async (req, res) => {
  try {
    await SkillMatrix.destroy({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: 'Failed', error: error.message });
  }
};

// ===== DASHBOARD =====
exports.getTrainingDashboard = async (req, res) => {
  try {
    const totalCourses = await TrainingCourse.count({ where: { is_active: true } });
    const upcomingSessions = await TrainingSession.count({ where: { start_date: { [Op.gte]: new Date().toISOString().slice(0, 10) } } });
    const totalParticipants = await TrainingParticipant.count();
    const recentSessions = await TrainingSession.findAll({ order: [['start_date', 'DESC']], limit: 5 });
    res.json({ totalCourses, upcomingSessions, totalParticipants, recentSessions });
  } catch (error) {
    res.status(500).json({ message: 'Failed', error: error.message });
  }
};
