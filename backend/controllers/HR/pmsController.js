const { KraTemplate, KraTemplateItem, AppraisalCycle, Appraisal, AppraisalRating } = require('../../models/HR/pms');
const { Op, Sequelize } = require('sequelize');

// ===== KRA TEMPLATES =====
exports.getAllTemplates = async (req, res) => {
  try {
    const templates = await KraTemplate.findAll({ where: { is_active: true }, order: [['template_name', 'ASC']] });
    const result = [];
    for (const t of templates) {
      const items = await KraTemplateItem.findAll({ where: { template_id: t.id }, order: [['sort_order', 'ASC']] });
      result.push({ ...t.toJSON(), items });
    }
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Failed', error: error.message });
  }
};

exports.getTemplate = async (req, res) => {
  try {
    const template = await KraTemplate.findByPk(req.params.id);
    if (!template) return res.status(404).json({ message: 'Not found' });
    const items = await KraTemplateItem.findAll({ where: { template_id: template.id }, order: [['sort_order', 'ASC']] });
    res.json({ ...template.toJSON(), items });
  } catch (error) {
    res.status(500).json({ message: 'Failed', error: error.message });
  }
};

exports.saveTemplate = async (req, res) => {
  try {
    const { id, items, ...data } = req.body;
    if (id) {
      await KraTemplate.update(data, { where: { id } });
      await KraTemplateItem.destroy({ where: { template_id: id } });
      if (items?.length) {
        await KraTemplateItem.bulkCreate(items.map((item, i) => ({ ...item, template_id: id, sort_order: i })));
      }
      res.json({ message: 'Updated', id });
    } else {
      const created = await KraTemplate.create(data);
      if (items?.length) {
        await KraTemplateItem.bulkCreate(items.map((item, i) => ({ ...item, template_id: created.id, sort_order: i })));
      }
      res.status(201).json({ message: 'Saved', id: created.id });
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed', error: error.message });
  }
};

// ===== APPRAISAL CYCLES =====
exports.getAllCycles = async (req, res) => {
  try {
    const data = await AppraisalCycle.findAll({ order: [['start_date', 'DESC']] });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Failed', error: error.message });
  }
};

exports.saveCycle = async (req, res) => {
  try {
    const { id } = req.body;
    if (id) {
      await AppraisalCycle.update(req.body, { where: { id } });
      res.json({ message: 'Updated', id });
    } else {
      const created = await AppraisalCycle.create(req.body);
      res.status(201).json({ message: 'Saved', id: created.id });
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed', error: error.message });
  }
};

// ===== APPRAISALS =====
exports.getAllAppraisals = async (req, res) => {
  try {
    const { cycle_id, empid, status } = req.query;
    const where = {};
    if (cycle_id) where.cycle_id = cycle_id;
    if (empid) where.empid = empid;
    if (status) where.status = status;
    const data = await Appraisal.findAll({ where, order: [['created_at', 'DESC']] });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Failed', error: error.message });
  }
};

exports.getAppraisal = async (req, res) => {
  try {
    const appraisal = await Appraisal.findByPk(req.params.id);
    if (!appraisal) return res.status(404).json({ message: 'Not found' });
    const ratings = await AppraisalRating.findAll({ where: { appraisal_id: appraisal.id } });
    const template = appraisal.template_id ? await KraTemplate.findByPk(appraisal.template_id) : null;
    const items = template ? await KraTemplateItem.findAll({ where: { template_id: template.id }, order: [['sort_order', 'ASC']] }) : [];
    res.json({ appraisal, ratings, template: template ? { ...template.toJSON(), items } : null });
  } catch (error) {
    res.status(500).json({ message: 'Failed', error: error.message });
  }
};

exports.saveAppraisal = async (req, res) => {
  try {
    const { ratings, id, ...data } = req.body;
    if (id) {
      await Appraisal.update(data, { where: { id } });
      if (ratings) {
        for (const r of ratings) {
          if (r.id) await AppraisalRating.update(r, { where: { id: r.id } });
          else await AppraisalRating.create({ ...r, appraisal_id: id });
        }
      }
      res.json({ message: 'Updated', id });
    } else {
      const created = await Appraisal.create(data);
      if (ratings?.length) {
        await AppraisalRating.bulkCreate(ratings.map((r) => ({ ...r, appraisal_id: created.id })));
      }
      res.status(201).json({ message: 'Saved', id: created.id });
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed', error: error.message });
  }
};

exports.submitAppraisal = async (req, res) => {
  try {
    const { id, reviewer } = req.body;
    const appraisal = await Appraisal.findByPk(id);
    if (!appraisal) return res.status(404).json({ message: 'Not found' });

    // Calculate scores
    const ratings = await AppraisalRating.findAll({ where: { appraisal_id: id } });
    const selfScores = ratings.filter((r) => r.self_score).map((r) => Number(r.self_score));
    const managerScores = ratings.filter((r) => r.manager_score).map((r) => Number(r.manager_score));

    const selfAvg = selfScores.length ? selfScores.reduce((a, b) => a + b, 0) / selfScores.length : 0;
    const mgrAvg = managerScores.length ? managerScores.reduce((a, b) => a + b, 0) / managerScores.length : 0;

    const overallRating = Math.round(((selfAvg + mgrAvg) / 2) * 10) / 10;

    await appraisal.update({
      self_final_score: Math.round(selfAvg * 100) / 100,
      manager_final_score: Math.round(mgrAvg * 100) / 100,
      overall_rating: overallRating,
      status: 'Submitted',
      reviewer: reviewer || appraisal.reviewer,
      review_date: new Date().toISOString().slice(0, 10),
    });
    res.json({ success: true, overall_rating: overallRating });
  } catch (error) {
    res.status(500).json({ message: 'Failed', error: error.message });
  }
};

exports.approveAppraisal = async (req, res) => {
  try {
    const { id, status, comments } = req.body;
    const update = { status };
    if (comments) update.comments = comments;
    if (status === 'Approved') update.review_date = new Date().toISOString().slice(0, 10);
    await Appraisal.update(update, { where: { id } });
    res.json({ success: true, message: `Appraisal ${status.toLowerCase()}` });
  } catch (error) {
    res.status(500).json({ message: 'Failed', error: error.message });
  }
};

// ===== BULK INITIATE =====
exports.bulkInitiateAppraisals = async (req, res) => {
  try {
    const { cycle_id, template_id, empids } = req.body;
    const existing = await Appraisal.findAll({ where: { cycle_id, empid: { [Op.in]: empids } } });
    const existingEmpIds = new Set(existing.map((a) => a.empid));
    const newEmpIds = empids.filter((e) => !existingEmpIds.has(e));
    if (newEmpIds.length) {
      const records = newEmpIds.map((empid) => ({ cycle_id, empid, template_id, status: 'Pending' }));
      await Appraisal.bulkCreate(records);
    }
    res.json({ success: true, created: newEmpIds.length, skipped: existingEmpIds.size });
  } catch (error) {
    res.status(500).json({ message: 'Failed', error: error.message });
  }
};

// ===== DASHBOARD =====
exports.getPmsDashboard = async (req, res) => {
  try {
    const activeCycles = await AppraisalCycle.count({ where: { status: 'Open' } });
    const pendingAppraisals = await Appraisal.count({ where: { status: 'Pending' } });
    const submittedAppraisals = await Appraisal.count({ where: { status: 'Submitted' } });
    const approvedAppraisals = await Appraisal.count({ where: { status: 'Approved' } });
    const recentAppraisals = await Appraisal.findAll({ order: [['created_at', 'DESC']], limit: 5 });
    res.json({ activeCycles, pendingAppraisals, submittedAppraisals, approvedAppraisals, recentAppraisals });
  } catch (error) {
    res.status(500).json({ message: 'Failed', error: error.message });
  }
};
