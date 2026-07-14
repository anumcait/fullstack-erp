const { DisciplinaryCase, ShowCause, DisciplinaryAction } = require('../../models/HR/disciplinary');
const { Sequelize } = require('sequelize');

// ===== CASES =====
exports.getAllCases = async (req, res) => {
  try {
    const { status, empid } = req.query;
    const where = {};
    if (status) where.status = status;
    if (empid) where.empid = empid;
    const data = await DisciplinaryCase.findAll({ where, order: [['created_at', 'DESC']] });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Failed', error: error.message });
  }
};

exports.getCase = async (req, res) => {
  try {
    const c = await DisciplinaryCase.findByPk(req.params.id);
    if (!c) return res.status(404).json({ message: 'Not found' });
    const showCauses = await ShowCause.findAll({ where: { case_id: c.id } });
    const actions = await DisciplinaryAction.findAll({ where: { case_id: c.id } });
    res.json({ case: c, showCauses, actions });
  } catch (error) {
    res.status(500).json({ message: 'Failed', error: error.message });
  }
};

exports.saveCase = async (req, res) => {
  try {
    const { id } = req.body;
    if (id) {
      await DisciplinaryCase.update(req.body, { where: { id } });
      res.json({ message: 'Updated', id });
    } else {
      const max = await DisciplinaryCase.findOne({ attributes: [[Sequelize.fn('MAX', Sequelize.col('id')), 'maxId']], raw: true });
      req.body.case_no = `DC-${String((Number(max.maxId) || 0) + 1).padStart(4, '0')}`;
      const created = await DisciplinaryCase.create(req.body);
      res.status(201).json({ message: 'Saved', id: created.id });
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed', error: error.message });
  }
};

exports.updateCaseStatus = async (req, res) => {
  try {
    const { id, status } = req.body;
    await DisciplinaryCase.update({ status }, { where: { id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: 'Failed', error: error.message });
  }
};

// ===== SHOW CAUSE =====
exports.saveShowCause = async (req, res) => {
  try {
    const { id } = req.body;
    if (id) {
      await ShowCause.update(req.body, { where: { id } });
      res.json({ message: 'Updated', id });
    } else {
      const max = await ShowCause.findOne({ attributes: [[Sequelize.fn('MAX', Sequelize.col('id')), 'maxId']], raw: true });
      req.body.notice_no = `SC-${String((Number(max.maxId) || 0) + 1).padStart(4, '0')}`;
      const created = await ShowCause.create(req.body);
      await DisciplinaryCase.update({ status: 'Show Cause Issued' }, { where: { id: req.body.case_id } });
      res.status(201).json({ message: 'Saved', id: created.id });
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed', error: error.message });
  }
};

exports.respondShowCause = async (req, res) => {
  try {
    const { id, employee_response } = req.body;
    await ShowCause.update({ employee_response, response_date: new Date().toISOString().slice(0, 10), status: 'Responded' }, { where: { id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: 'Failed', error: error.message });
  }
};

// ===== ACTIONS =====
exports.saveAction = async (req, res) => {
  try {
    const { id } = req.body;
    if (id) {
      await DisciplinaryAction.update(req.body, { where: { id } });
      res.json({ message: 'Updated', id });
    } else {
      await DisciplinaryAction.create(req.body);
      await DisciplinaryCase.update({ status: 'Closed' }, { where: { id: req.body.case_id } });
      res.status(201).json({ message: 'Saved' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed', error: error.message });
  }
};

// ===== DASHBOARD =====
exports.getDashboard = async (req, res) => {
  try {
    const openCases = await DisciplinaryCase.count({ where: { status: 'Open' } });
    const totalCases = await DisciplinaryCase.count();
    const pendingResponses = await ShowCause.count({ where: { status: 'Issued' } });
    const recent = await DisciplinaryCase.findAll({ order: [['created_at', 'DESC']], limit: 5 });
    res.json({ openCases, totalCases, pendingResponses, recent });
  } catch (error) {
    res.status(500).json({ message: 'Failed', error: error.message });
  }
};
