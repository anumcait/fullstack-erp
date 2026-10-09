const { ESILeaveApplication, Payslip } = require('../../models');
const { Sequelize } = require('sequelize');
const { nextSequenceNumber, LOCK_KEYS } = require('../../utils/docNumber');
const MONTH_NAMES = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
const isPayrollFinalized = async (dateStr) => {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  if (isNaN(d)) return false;
  const m = MONTH_NAMES[d.getMonth()];
  const y = String(d.getFullYear());
  const cnt = await Payslip.count({ where: { C_MONTH: m, C_YEAR: y, C_FINAL_STATUS: 2 } });
  return cnt > 0;
};

exports.saveESILeave = async (req, res) => {
  const application = req.body;
  const t = await ESILeaveApplication.sequelize.transaction();

  try {
    const dateToCheck = application.act_date || application.esi_leave_date || application.from_date;
    if (dateToCheck && await isPayrollFinalized(dateToCheck)) {
      await t.rollback();
      return res.status(400).json({ message: `Payslip finalized for ${String(dateToCheck).slice(0,7)} — cannot apply ESI Leave.` });
    }
    if (application.to_date && await isPayrollFinalized(application.to_date)) {
      await t.rollback();
      return res.status(400).json({ message: `Payslip finalized for ${String(application.to_date).slice(0,7)} — cannot apply ESI Leave.` });
    }
    const nextESILeaveId = await nextSequenceNumber(ESILeaveApplication, 'esi_leave_id', t, LOCK_KEYS.ESI_LEAVE_APPLICATION);
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
    const chkE = application.esi_leave_date || application.act_date;
    if (chkE && await isPayrollFinalized(chkE)) return res.status(400).json({ message: `Payslip finalized for ${String(chkE).slice(0,7)} — cannot approve.` });

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
    const cE = app.esi_leave_date || app.act_date;
    if (cE && await isPayrollFinalized(cE)) return res.status(400).json({ success: false, message: `Payslip finalized for ${String(cE).slice(0,7)} — cannot cancel.` });

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
    const rE = app.esi_leave_date || app.act_date;
    if (rE && await isPayrollFinalized(rE)) return res.status(400).json({ success: false, message: `Payslip finalized for ${String(rE).slice(0,7)} — cannot reopen.` });

    await app.update({ status: 'Pending' });
    res.json({ success: true, message: "ESI Leave application reopened" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error reopening ESI Leave" });
  }
};
