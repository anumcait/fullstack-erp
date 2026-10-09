const { WoffApplication, Payslip } = require('../../models');
const { Sequelize, Op } = require('sequelize');
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

exports.getAllWoffs = async (req, res) => {
  try {
    const { startDate, endDate, status } = req.query;
    const where = {};
    if (status) where.status = status;
    if (startDate && endDate) {
      where[Op.or] = [
        { woff_to_date: { [Op.between]: [startDate, endDate] } },
        { woff_from_date: { [Op.between]: [startDate, endDate] } }
      ];
    }
    const woffs = await WoffApplication.findAll({
      where,
      order: [['woff_id', 'DESC']]
    });
    res.json(woffs);
  } catch (err) {
    console.error('Error fetching woffs:', err);
    res.status(500).json({ message: 'Error fetching woff applications' });
  }
};

exports.getWoffById = async (req, res) => {
  try {
    const woff = await WoffApplication.findByPk(req.params.id);
    if (!woff) {
      return res.status(404).json({ message: 'Woff not found' });
    }
    res.json(woff);
  } catch (err) {
    console.error('Error fetching woff:', err);
    res.status(500).json({ message: 'Error fetching woff application' });
  }
};

exports.getNextWoffId = async (req, res) => {
  try {
    const maxId = await WoffApplication.max('woff_id') || 0;
    res.json({ nextWoffId: maxId + 1 });
  } catch (err) {
    console.error('Error getting next woff ID:', err);
    res.status(500).json({ message: 'Error getting next woff ID' });
  }
};

exports.createWoff = async (req, res) => {
  try {
    const { empid, woff_from_date, woff_to_date, ename } = req.body;

    if (!empid || !woff_from_date || !woff_to_date) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    if (woff_from_date && await isPayrollFinalized(woff_from_date)) return res.status(400).json({ message: `Payslip finalized for ${String(woff_from_date).slice(0,7)} — cannot apply Woff.` });
    if (woff_to_date && await isPayrollFinalized(woff_to_date)) return res.status(400).json({ message: `Payslip finalized for ${String(woff_to_date).slice(0,7)} — cannot apply Woff.` });

    if (woff_from_date === woff_to_date) {
      return res.status(400).json({ message: 'Existing date and Changed date cannot be the same.' });
    }

    // 1. Check if application already exists for this Existing Date
    const existingFrom = await WoffApplication.findOne({
      where: {
        empid,
        woff_from_date: woff_from_date,
        status: ['Pending', 'Approved']
      }
    });

    if (existingFrom) {
      return res.status(400).json({ message: `A Woff change application already exists for ${woff_from_date}.` });
    }

    // 2. Check if changed date is already a Woff date in another application
    const existingTo = await WoffApplication.findOne({
      where: {
        empid,
        woff_to_date: woff_to_date,
        status: ['Pending', 'Approved']
      }
    });

    if (existingTo) {
      return res.status(400).json({ message: `A Woff change is already requested for ${woff_to_date}.` });
    }

    // 3. Check for overlaps with other modules (OnDuty, Leave, etc.) - Placeholder logic
    // In a real scenario, we would check OD, Leave, and Tour tables here.

    const t = await WoffApplication.sequelize.transaction();
    let newWoffId;
    try {
      newWoffId = await nextSequenceNumber(WoffApplication, 'woff_id', t, LOCK_KEYS.WOFF_APPLICATION);
      const woff = await WoffApplication.create({
        ...req.body,
        woff_id: newWoffId,
        woff_date: new Date(),
        created_by: ename,
        status: 'Pending'
      }, { transaction: t });
      await t.commit();
      res.status(201).json({ message: 'Woff application created', data: woff });
    } catch (txErr) { await t.rollback(); throw txErr; }
  } catch (err) {
    console.error('Error creating woff:', err);
    res.status(500).json({ message: 'Error creating woff application', error: err.message });
  }
};

exports.updateWoff = async (req, res) => {
  try {
    const { id } = req.params;
    const woff = await WoffApplication.findByPk(id);
    
    if (!woff) {
      return res.status(404).json({ message: 'Woff not found' });
    }
    const cd = woff.woff_from_date || woff.woff_date;
    if (cd && await isPayrollFinalized(cd)) return res.status(400).json({ message: `Payslip finalized for ${String(cd).slice(0,7)} — cannot update.` });
    if (req.body.woff_from_date && await isPayrollFinalized(req.body.woff_from_date)) return res.status(400).json({ message: `Payslip finalized for ${String(req.body.woff_from_date).slice(0,7)} — cannot update.` });
    if (req.body.woff_to_date && await isPayrollFinalized(req.body.woff_to_date)) return res.status(400).json({ message: `Payslip finalized for ${String(req.body.woff_to_date).slice(0,7)} — cannot update.` });

    await woff.update(req.body);
    res.json({ message: 'Woff updated', data: woff });
  } catch (err) {
    console.error('Error updating woff:', err);
    res.status(500).json({ message: 'Error updating woff' });
  }
};

exports.deleteWoff = async (req, res) => {
  try {
    const { id } = req.params;
    const woff = await WoffApplication.findByPk(id);
    
    if (!woff) {
      return res.status(404).json({ message: 'Woff not found' });
    }
    const cd2 = woff.woff_from_date || woff.woff_date;
    if (cd2 && await isPayrollFinalized(cd2)) return res.status(400).json({ message: `Payslip finalized for ${String(cd2).slice(0,7)} — cannot delete.` });

    await woff.destroy();
    res.json({ message: 'Woff deleted' });
  } catch (err) {
    console.error('Error deleting woff:', err);
    res.status(500).json({ message: 'Error deleting woff' });
  }
};

exports.approveWoff = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, approval_remark } = req.body;
    
    const woff = await WoffApplication.findByPk(id);
    if (!woff) {
      return res.status(404).json({ message: 'Woff not found' });
    }
    const chk = woff.woff_from_date || woff.woff_date;
    if (chk && await isPayrollFinalized(chk)) return res.status(400).json({ message: `Payslip finalized for ${String(chk).slice(0,7)} — cannot approve.` });
    
    await woff.update({
      status,
      approval_remark,
      approved_by: req.session.user?.username || 'Admin',
      approved_date: new Date()
    });
    
    res.json({ message: `Woff ${status}` });
  } catch (err) {
    console.error('Error approving woff:', err);
    res.status(500).json({ message: 'Error approving woff' });
  }
};

exports.getPendingWoffChanges = async (req, res) => {
  try {
    const data = await WoffApplication.findAll({
      where: { status: 'Pending' },
      order: [['woff_id', 'DESC']]
    });

    res.json(data);
  } catch (err) {
    console.error('Error fetching pending woff applications:', err);
    res.status(500).json({ message: 'Error fetching pending woff applications' });
  }
};

exports.approveWoffChange = async (req, res) => {
  const { woff_id, status, remarks } = req.body;
  
  try {
    const application = await WoffApplication.findOne({
      where: { woff_id }
    });

    if (!application) {
      return res.status(404).json({ message: 'Woff application not found.' });
    }
    const chkW = application.woff_from_date || application.woff_date;
    if (chkW && await isPayrollFinalized(chkW)) return res.status(400).json({ message: `Payslip finalized for ${String(chkW).slice(0,7)} — cannot approve.` });
    if (application.woff_to_date && await isPayrollFinalized(application.woff_to_date)) return res.status(400).json({ message: `Payslip finalized for ${String(application.woff_to_date).slice(0,7)} — cannot approve.` });

    application.status = status === 'Reject' ? 'Rejected' : status || 'Approved';
    if (remarks) application.remarks = remarks;
    await application.save();

    res.json({ success: true, message: `Woff application ${application.status.toLowerCase()}d successfully.` });
  } catch (error) {
    console.error('❌ Error approving Woff application:', error);
    res.status(500).json({ success: false, message: 'Failed to approve Woff application.', error });
  }
};

exports.cancelWoff = async (req, res) => {
  const { woff_id, remarks = "" } = req.body;
  try {
    const app = await WoffApplication.findOne({ where: { woff_id } });
    if (!app) return res.status(404).json({ success: false, message: "Application not found" });
    const c1 = app.woff_from_date || app.woff_date;
    if (c1 && await isPayrollFinalized(c1)) return res.status(400).json({ success: false, message: `Payslip finalized for ${String(c1).slice(0,7)} — cannot cancel.` });
    if (app.woff_to_date && await isPayrollFinalized(app.woff_to_date)) return res.status(400).json({ success: false, message: `Payslip finalized for ${String(app.woff_to_date).slice(0,7)} — cannot cancel.` });

    await app.update({ status: 'Cancelled', remarks: remarks });
    res.json({ success: true, message: "Woff approval cancelled" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error cancelling Woff" });
  }
};

exports.reopenWoff = async (req, res) => {
  const { woff_id } = req.body;
  try {
    const app = await WoffApplication.findOne({ where: { woff_id } });
    if (!app) return res.status(404).json({ success: false, message: "Application not found" });
    const r1 = app.woff_from_date || app.woff_date;
    if (r1 && await isPayrollFinalized(r1)) return res.status(400).json({ success: false, message: `Payslip finalized for ${String(r1).slice(0,7)} — cannot reopen.` });
    if (app.woff_to_date && await isPayrollFinalized(app.woff_to_date)) return res.status(400).json({ success: false, message: `Payslip finalized for ${String(app.woff_to_date).slice(0,7)} — cannot reopen.` });

    await app.update({ status: 'Pending' });
    res.json({ success: true, message: "Woff application reopened" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error reopening Woff" });
  }
};

// An approved Woff whose benefit has been cancelled by HR: cancel_status = 'C'.
const CANCELLED = 'C';

const findApprovedWoffForDate = (empid, attDate) => WoffApplication.findOne({
  where: {
    empid,
    status: 'Approved',
    woff_to_date: {
      [Op.between]: [
        `${attDate} 00:00:00.000`,
        `${attDate} 23:59:59.999`
      ]
    }
  },
  order: [['woff_id', 'DESC']]
});

// Cancel an approved weekly-off so the granted day is not honoured in attendance.
// HR drives this from Bulk Attendance Entry, so the record is located by
// employee + date rather than by woff_id. Reason is mandatory.
exports.markWoffCancelled = async (req, res) => {
  const { empid, att_date, reason } = req.body;
  try {
    if (!empid || !att_date) {
      return res.status(400).json({ success: false, message: 'Employee and date are required.' });
    }
    if (!reason || !String(reason).trim()) {
      return res.status(400).json({ success: false, message: 'Reason is mandatory to cancel a Woff.' });
    }

    const woff = await findApprovedWoffForDate(empid, att_date);
    if (!woff) {
      return res.status(404).json({ success: false, message: `No approved Woff found for ${empid} on ${att_date}.` });
    }
    if (woff.cancel_status === CANCELLED) {
      return res.status(400).json({ success: false, message: `Woff #${woff.woff_id} is already cancelled.` });
    }
    const woffDay = woff.woff_to_date || woff.woff_date;
    if (await isPayrollFinalized(woffDay)) {
      return res.status(400).json({ success: false, message: `Payslip finalized for ${String(woffDay).slice(0, 7)} — cannot cancel Woff.` });
    }

    await woff.update({
      cancel_status: CANCELLED,
      cancel_date: new Date(),
      cancel_remarks: String(reason).trim(),
      cancelled_by: req.session.user?.username || 'Admin'
    });

    res.json({ success: true, message: `Woff #${woff.woff_id} cancelled for ${att_date}.`, data: woff });
  } catch (error) {
    console.error('Error cancelling Woff:', error);
    res.status(500).json({ success: false, message: 'Error cancelling Woff' });
  }
};

// Undo a cancellation — the weekly-off day is honoured again.
exports.revokeWoffCancellation = async (req, res) => {
  const { empid, att_date } = req.body;
  try {
    if (!empid || !att_date) {
      return res.status(400).json({ success: false, message: 'Employee and date are required.' });
    }

    const woff = await findApprovedWoffForDate(empid, att_date);
    if (!woff || woff.cancel_status !== CANCELLED) {
      return res.status(404).json({ success: false, message: `No cancelled Woff found for ${empid} on ${att_date}.` });
    }
    const woffDay = woff.woff_to_date || woff.woff_date;
    if (await isPayrollFinalized(woffDay)) {
      return res.status(400).json({ success: false, message: `Payslip finalized for ${String(woffDay).slice(0, 7)} — cannot revoke Woff cancellation.` });
    }

    await woff.update({
      cancel_status: null,
      cancel_date: null,
      cancel_remarks: null,
      cancelled_by: null
    });

    res.json({ success: true, message: `Cancellation removed from Woff #${woff.woff_id}.`, data: woff });
  } catch (error) {
    console.error('Error revoking Woff cancellation:', error);
    res.status(500).json({ success: false, message: 'Error revoking Woff cancellation' });
  }
};

