const { JobRequisition, Candidate, Interview, OfferLetter } = require('../../models/HR/recruitment');
const { Sequelize, Op } = require('sequelize');

// ===== JOB REQUISITION =====
exports.getAllRequisitions = async (req, res) => {
  try {
    const { status } = req.query;
    const where = {};
    if (status) where.status = status;
    const data = await JobRequisition.findAll({ where, order: [['created_at', 'DESC']] });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch requisitions', error: error.message });
  }
};

exports.getRequisition = async (req, res) => {
  try {
    const data = await JobRequisition.findByPk(req.params.id);
    if (!data) return res.status(404).json({ message: 'Not found' });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Failed', error: error.message });
  }
};

exports.saveRequisition = async (req, res) => {
  try {
    const { id } = req.body;
    if (id) {
      await JobRequisition.update(req.body, { where: { id } });
      res.json({ message: 'Updated', id });
    } else {
      const max = await JobRequisition.findOne({ attributes: [[Sequelize.fn('MAX', Sequelize.col('id')), 'maxId']], raw: true });
      const nextId = (Number(max.maxId) || 0) + 1;
      req.body.req_no = `REQ-${String(nextId).padStart(4, '0')}`;
      const created = await JobRequisition.create(req.body);
      res.status(201).json({ message: 'Saved', id: created.id });
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed to save', error: error.message });
  }
};

exports.approveRequisition = async (req, res) => {
  try {
    const { id, status, approved_by } = req.body;
    const record = await JobRequisition.findByPk(id);
    if (!record) return res.status(404).json({ message: 'Not found' });
    record.status = status === 'Reject' ? 'Closed' : status || 'Open';
    record.approved_by = approved_by || record.approved_by;
    if (status !== 'Reject') record.approved_date = new Date().toISOString().slice(0, 10);
    await record.save();
    res.json({ success: true, message: `Requisition ${record.status.toLowerCase()}` });
  } catch (error) {
    res.status(500).json({ message: 'Failed', error: error.message });
  }
};

// ===== CANDIDATE =====
exports.getAllCandidates = async (req, res) => {
  try {
    const { requisition_id, status } = req.query;
    const where = {};
    if (requisition_id) where.requisition_id = requisition_id;
    if (status) where.status = status;
    const data = await Candidate.findAll({ where, order: [['created_at', 'DESC']] });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Failed', error: error.message });
  }
};

exports.saveCandidate = async (req, res) => {
  try {
    const { id } = req.body;
    if (id) {
      await Candidate.update(req.body, { where: { id } });
      res.json({ message: 'Updated', id });
    } else {
      const created = await Candidate.create(req.body);
      res.status(201).json({ message: 'Saved', id: created.id });
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed to save candidate', error: error.message });
  }
};

exports.updateCandidateStatus = async (req, res) => {
  try {
    const { id, status } = req.body;
    await Candidate.update({ status }, { where: { id } });
    res.json({ success: true, message: `Candidate ${status.toLowerCase()}` });
  } catch (error) {
    res.status(500).json({ message: 'Failed', error: error.message });
  }
};

// ===== INTERVIEW =====
exports.getInterviews = async (req, res) => {
  try {
    const { candidate_id } = req.query;
    const where = {};
    if (candidate_id) where.candidate_id = candidate_id;
    const data = await Interview.findAll({ where, order: [['round', 'ASC']] });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Failed', error: error.message });
  }
};

exports.saveInterview = async (req, res) => {
  try {
    const { id } = req.body;
    if (id) {
      await Interview.update(req.body, { where: { id } });
      res.json({ message: 'Updated', id });
    } else {
      const created = await Interview.create(req.body);
      if (created) {
        await Candidate.update({ status: 'Interview Scheduled' }, { where: { id: req.body.candidate_id } });
      }
      res.status(201).json({ message: 'Saved', id: created.id });
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed to save interview', error: error.message });
  }
};

// ===== OFFER LETTER =====
exports.getAllOffers = async (req, res) => {
  try {
    const { status } = req.query;
    const where = {};
    if (status) where.status = status;
    const data = await OfferLetter.findAll({ where, order: [['created_at', 'DESC']] });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Failed', error: error.message });
  }
};

exports.saveOffer = async (req, res) => {
  try {
    const { id } = req.body;
    if (id) {
      await OfferLetter.update(req.body, { where: { id } });
      res.json({ message: 'Updated', id });
    } else {
      const max = await OfferLetter.findOne({ attributes: [[Sequelize.fn('MAX', Sequelize.col('id')), 'maxId']], raw: true });
      const nextId = (Number(max.maxId) || 0) + 1;
      req.body.offer_no = `OFF-${String(nextId).padStart(4, '0')}`;
      const created = await OfferLetter.create(req.body);
      if (created) {
        await Candidate.update({ status: 'Offered' }, { where: { id: req.body.candidate_id } });
      }
      res.status(201).json({ message: 'Saved', id: created.id });
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed to save offer', error: error.message });
  }
};

exports.updateOfferStatus = async (req, res) => {
  try {
    const { id, status } = req.body;
    const updateData = { status };
    if (status === 'Accepted') updateData.accepted_date = new Date().toISOString().slice(0, 10);
    await OfferLetter.update(updateData, { where: { id } });
    const offer = await OfferLetter.findByPk(id);
    if (offer && (status === 'Accepted' || status === 'Declined')) {
      const candidateStatus = status === 'Accepted' ? 'Joined' : 'Rejected';
      await Candidate.update({ status: candidateStatus }, { where: { id: offer.candidate_id } });
    }
    res.json({ success: true, message: `Offer ${status.toLowerCase()}` });
  } catch (error) {
    res.status(500).json({ message: 'Failed', error: error.message });
  }
};

// ===== DASHBOARD DATA =====
exports.getDashboard = async (req, res) => {
  try {
    const openReqs = await JobRequisition.count({ where: { status: 'Open' } });
    const totalCandidates = await Candidate.count();
    const pendingInterviews = await Interview.count({ where: { status: 'Scheduled' } });
    const pendingOffers = await OfferLetter.count({ where: { status: { [Op.in]: ['Draft', 'Sent'] } } });
    const recentRequisitions = await JobRequisition.findAll({ order: [['created_at', 'DESC']], limit: 5 });
    res.json({ openReqs, totalCandidates, pendingInterviews, pendingOffers, recentRequisitions });
  } catch (error) {
    res.status(500).json({ message: 'Failed', error: error.message });
  }
};
