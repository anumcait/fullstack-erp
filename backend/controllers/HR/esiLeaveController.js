const { ESILeaveApplication } = require('../../models');
const { Sequelize } = require('sequelize');

exports.saveESILeave = async (req, res) => {
  const application = req.body;
  const t = await ESILeaveApplication.sequelize.transaction();

  try {
    const maxIdResult = await ESILeaveApplication.findOne({
      attributes: [
        [Sequelize.fn('COALESCE', Sequelize.fn('MAX', Sequelize.col('esi_leave_id')), 0), 'maxId']
      ],
      raw: true
    });

    const nextESILeaveId = Number(maxIdResult.maxId) + 1;
    application.esi_leave_id = nextESILeaveId;

    await ESILeaveApplication.create(application, { transaction: t });
    await t.commit();

    res.status(201).json({ message: 'ESI Leave application saved.', esi_leave_id: nextESILeaveId });
  } catch (error) {
    await t.rollback();
    console.error('❌ Error saving ESI Leave application:', error);
    res.status(500).json({ message: 'Failed to save ESI Leave application.', error });
  }
};

exports.getNextESILeaveNumber = async (req, res) => {
  try {
    const maxId = await ESILeaveApplication.max('esi_leave_id');
    const nextId = (maxId || 0) + 1;
    res.json({ nextESILeaveId: nextId });
  } catch (error) {
    console.error('❌ Error fetching next esi_leave_id:', error);
    res.status(500).json({ message: 'Failed to get next ESI Leave ID.' });
  }
};

exports.getAllESILeaveApplications = async (req, res) => {
  try {
    const { empid, from, to } = req.query;
    const where = {};

    if (empid) where.empid = empid;
    if (from && to) where.esi_leave_date = { [Sequelize.Op.between]: [from, to] };

    const data = await ESILeaveApplication.findAll({
      where,
      order: [['esi_leave_id', 'DESC']]
    });

    res.json(data);
  } catch (error) {
    console.error('❌ Error fetching ESI Leave applications:', error);
    res.status(500).json({ message: 'Failed to fetch ESI Leave data.' });
  }
};

exports.getPendingESILeaves = async (req, res) => {
  try {
    const data = await ESILeaveApplication.findAll({
      where: { status: 'Pending' },
      order: [['esi_leave_id', 'DESC']]
    });

    res.json(data);
  } catch (error) {
    console.error('❌ Error fetching pending ESI Leave applications:', error);
    res.status(500).json({ message: 'Failed to fetch pending ESI Leave applications.' });
  }
};

exports.approveESILeave = async (req, res) => {
  const { esi_leave_id, status, remarks } = req.body;
  
  try {
    const application = await ESILeaveApplication.findOne({
      where: { esi_leave_id }
    });

    if (!application) {
      return res.status(404).json({ message: 'ESI Leave application not found.' });
    }

    application.status = status === 'Reject' ? 'Rejected' : status || 'Approved';
    if (remarks) application.remarks = remarks;
    await application.save();

    res.json({ success: true, message: `ESI Leave application ${application.status.toLowerCase()}d successfully.` });
  } catch (error) {
    console.error('❌ Error approving ESI Leave application:', error);
    res.status(500).json({ success: false, message: 'Failed to approve ESI Leave application.', error });
  }
};

exports.cancelESILeave = async (req, res) => {
  const { esi_leave_id, remarks = "" } = req.body;
  try {
    const app = await ESILeaveApplication.findOne({ where: { esi_leave_id } });
    if (!app) return res.status(404).json({ success: false, message: "Application not found" });

    await app.update({ status: 'Cancelled', remarks: remarks });
    res.json({ success: true, message: "ESI Leave approval cancelled" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error cancelling ESI Leave" });
  }
};

exports.reopenESILeave = async (req, res) => {
  const { esi_leave_id } = req.body;
  try {
    const app = await ESILeaveApplication.findOne({ where: { esi_leave_id } });
    if (!app) return res.status(404).json({ success: false, message: "Application not found" });

    await app.update({ status: 'Pending' });
    res.json({ success: true, message: "ESI Leave application reopened" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error reopening ESI Leave" });
  }
};
