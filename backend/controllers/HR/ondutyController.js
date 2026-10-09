const { OnDutyApplication, Payslip } = require('../../models');
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

exports.saveOnDuty = async (req, res) => {
  const application = req.body;
  const t = await OnDutyApplication.sequelize.transaction();

  try {
    const checkDate = application.act_date || application.movement_date;
    if (checkDate && await isPayrollFinalized(checkDate)) {
      await t.rollback();
      return res.status(400).json({ message: `Payslip finalized for ${String(checkDate).slice(0,7)} — cannot save On Duty.` });
    }
    const nextMovementId = await nextSequenceNumber(OnDutyApplication, 'movement_id', t, LOCK_KEYS.ON_DUTY_APPLICATION);
    application.movement_id = nextMovementId;
    await OnDutyApplication.create(application, { transaction: t });
    await t.commit();

    res.status(201).json({ message: 'On Duty application saved.', movement_id: nextMovementId });
  } catch (error) {
    await t.rollback();
    console.error('❌ Error saving On Duty application:', error);
    res.status(500).json({ message: 'Failed to save On Duty application.', error });
  }
};

exports.getNextOnDutyNumber = async (req, res) => {
  try {
    const maxId = await OnDutyApplication.max('movement_id');
    const nextId = (maxId || 0) + 1;
    console.log('nextId:', nextId);
    res.json({ nextMovementId: nextId });
  } catch (error) {
    console.error('❌ Error fetching next movement_id:', error);
    res.status(500).json({ message: 'Failed to get next On Duty ID.' });
  }
};

exports.getAllOnDutyApplications = async (req, res) => {
  try {
    const { empid, from, to } = req.query;
    const where = {};

    if (empid) where.empid = empid;
    if (from && to) where.movement_date = { [Sequelize.Op.between]: [from, to] };

    const data = await OnDutyApplication.findAll({
      where,
      order: [['movement_id', 'DESC']]
    });

    res.json(data);
  } catch (error) {
    console.error('❌ Error fetching On Duty applications:', error);
    res.status(500).json({ message: 'Failed to fetch On Duty data.' });
  }
};

exports.getPendingOnDuty = async (req, res) => {
  try {
    const data = await OnDutyApplication.findAll({
      where: { status: 'Pending' },
      order: [['movement_id', 'DESC']]
    });

    res.json(data);
  } catch (error) {
    console.error('❌ Error fetching pending On Duty applications:', error);
    res.status(500).json({ message: 'Failed to fetch pending On Duty applications.' });
  }
};

exports.approveOnDuty = async (req, res) => {
  const { movement_id, status, remarks } = req.body;

  try {
    const application = await OnDutyApplication.findOne({
      where: { movement_id }
    });

    if (!application) {
      return res.status(404).json({ message: 'On Duty application not found.' });
    }
    const chkD = application.act_date || application.movement_date;
    if (chkD && await isPayrollFinalized(chkD)) return res.status(400).json({ message: `Payslip finalized for ${String(chkD).slice(0,7)} — cannot approve.` });

    application.status = status === 'Reject' ? 'Rejected' : status || 'Approved';
    if (remarks) application.remarks = remarks;
    await application.save();

    res.json({ success: true, message: `On Duty application ${application.status.toLowerCase()}d successfully.` });
  } catch (error) {
    console.error('❌ Error approving On Duty application:', error);
    res.status(500).json({ success: false, message: 'Failed to approve On Duty application.', error });
  }
};

exports.cancelOnDuty = async (req, res) => {
  const { movement_id, remarks = "" } = req.body;
  try {
    const app = await OnDutyApplication.findOne({ where: { movement_id } });
    if (!app) return res.status(404).json({ success: false, message: "Application not found" });
    const cd = app.act_date || app.movement_date;
    if (cd && await isPayrollFinalized(cd)) return res.status(400).json({ success: false, message: `Payslip finalized for ${String(cd).slice(0,7)} — cannot cancel.` });

    // Set status to Cancelled (2 or string 'Cancelled')
    // Checking current model to see if it's string or int
    // Based on saveOnDuty, it seems to use strings.
    await app.update({ status: 'Cancelled', remarks: remarks });

    res.json({ success: true, message: "On Duty approval cancelled" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error cancelling On Duty" });
  }
};

exports.reopenOnDuty = async (req, res) => {
  const { movement_id } = req.body;
  try {
    const app = await OnDutyApplication.findOne({ where: { movement_id } });
    if (!app) return res.status(404).json({ success: false, message: "Application not found" });
    const rd = app.act_date || app.movement_date;
    if (rd && await isPayrollFinalized(rd)) return res.status(400).json({ success: false, message: `Payslip finalized for ${String(rd).slice(0,7)} — cannot reopen.` });

    await app.update({ status: 'Pending' });

    res.json({ success: true, message: "On Duty application reopened" });
  } catch (error) {
    console.error(error);
  }
};
