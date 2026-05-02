const { AdvanceApplication } = require('../../models');
const { Sequelize, Op } = require('sequelize');

exports.saveAdvance = async (req, res) => {
  const application = req.body;
  const t = await AdvanceApplication.sequelize.transaction();

  try {
    const maxIdResult = await AdvanceApplication.findOne({
      attributes: [
        [Sequelize.fn('COALESCE', Sequelize.fn('MAX', Sequelize.col('advance_id')), 0), 'maxId']
      ],
      raw: true
    });

    const nextAdvanceId = Number(maxIdResult.maxId) + 1;
    application.advance_id = nextAdvanceId;

    await AdvanceApplication.create(application, { transaction: t });
    await t.commit();

    res.status(201).json({ message: 'Advance application saved.', advance_id: nextAdvanceId });
  } catch (error) {
    await t.rollback();
    console.error('❌ Error saving Advance application:', error);
    res.status(500).json({ message: 'Failed to save Advance application.', error });
  }
};

exports.getNextAdvanceNumber = async (req, res) => {
  try {
    const maxId = await AdvanceApplication.max('advance_id');
    const nextId = (maxId || 0) + 1;
    res.json({ nextAdvanceId: nextId });
  } catch (error) {
    console.error('❌ Error fetching next advance_id:', error);
    res.status(500).json({ message: 'Failed to get next Advance ID.' });
  }
};

exports.getAllAdvanceApplications = async (req, res) => {
  try {
    const { empid, from, to } = req.query;
    const where = {};

    if (empid) where.empid = empid;
    if (from && to) where.advance_date = { [Sequelize.Op.between]: [from, to] };

    const data = await AdvanceApplication.findAll({
      where,
      order: [['advance_id', 'DESC']]
    });

    res.json(data);
  } catch (error) {
    console.error('❌ Error fetching Advance applications:', error);
    res.status(500).json({ message: 'Failed to fetch Advance data.' });
  }
};

exports.getPendingAdvances = async (req, res) => {
  try {
    const data = await AdvanceApplication.findAll({
      where: { status: 'Pending' },
      order: [['advance_id', 'DESC']]
    });

    res.json(data);
  } catch (error) {
    console.error('❌ Error fetching pending Advance applications:', error);
    res.status(500).json({ message: 'Failed to fetch pending Advance applications.' });
  }
};

exports.approveAdvance = async (req, res) => {
  const { advance_id, status, remarks } = req.body;
  
  try {
    const application = await AdvanceApplication.findOne({
      where: { advance_id }
    });

    if (!application) {
      return res.status(404).json({ message: 'Advance application not found.' });
    }

    application.status = status === 'Reject' ? 'Rejected' : status || 'Approved';
    if (remarks) application.remarks = remarks;
    await application.save();

    res.json({ success: true, message: `Advance application ${application.status.toLowerCase()}d successfully.` });
  } catch (error) {
    console.error('❌ Error approving Advance application:', error);
    res.status(500).json({ success: false, message: 'Failed to approve Advance application.', error });
  }
};

exports.cancelAdvance = async (req, res) => {
  const { advance_id, remarks = "" } = req.body;
  try {
    const app = await AdvanceApplication.findOne({ where: { advance_id } });
    if (!app) return res.status(404).json({ success: false, message: "Application not found" });

    await app.update({ status: 'Cancelled', remarks: remarks });
    res.json({ success: true, message: "Advance approval cancelled" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error cancelling Advance" });
  }
};

exports.reopenAdvance = async (req, res) => {
  const { advance_id } = req.body;
  try {
    const app = await AdvanceApplication.findOne({ where: { advance_id } });
    if (!app) return res.status(404).json({ success: false, message: "Application not found" });

    await app.update({ status: 'Pending' });
    res.json({ success: true, message: "Advance application reopened" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error reopening Advance" });
  }
};

exports.getAdvanceReport = async (req, res) => {
  try {
    const { startDate, endDate, empid } = req.query;
    const where = {};
    
    if (startDate && endDate) {
      where.advance_date = { [Op.between]: [startDate, endDate] };
    }
    if (empid) {
      where.empid = empid;
    }
    
    const advances = await AdvanceApplication.findAll({
      where,
      order: [['advance_date', 'DESC']]
    });
    
    res.json(advances);
  } catch (error) {
    console.error('Error fetching advance report:', error);
    res.status(500).json({ message: 'Error fetching advance report' });
  }
};
