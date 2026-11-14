const { WoffApplication, Payslip, Attendance, ShiftSchedule, ShiftMaster, EmployeeMaster } = require('../../models');
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

const toLocalDateStr = (val) => {
  if (!val) return null;
  const d = new Date(val);
  if (isNaN(d.getTime())) return null;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const getTimeMins = (timeStr) => {
  if (!timeStr) return null;
  const parts = String(timeStr).trim().split(':');
  if (parts.length < 2) return null;
  const h = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  if (isNaN(h) || isNaN(m)) return null;
  return h * 60 + m;
};

const calculateOTHrs = (outTime, shiftEnd, shiftStart, inTime) => {
  if (!outTime || !shiftEnd) return 0;
  try {
    const outMins = getTimeMins(outTime);
    const shiftEndMins = getTimeMins(shiftEnd);
    if (outMins === null || shiftEndMins === null) return 0;

    let extraMins = outMins - shiftEndMins;
    if (extraMins < 0 && outMins < 600) {
      extraMins = (outMins + 1440) - shiftEndMins;
    }
    if (extraMins > 0) {
      return extraMins / 60;
    }
    return 0;
  } catch (e) {
    return 0;
  }
};

const decimalToHHMM = (decimalHours) => {
  if (!decimalHours && decimalHours !== 0) return '';
  const h = Math.floor(decimalHours);
  const m = Math.round((decimalHours - h) * 60);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};

const makeShiftDate = (timeStr) => {
  if (!timeStr) return null;
  const parts = String(timeStr).split(':');
  const h = parseInt(parts[0], 10) || 0;
  const m = parseInt(parts[1], 10) || 0;
  return new Date(Date.UTC(2000, 0, 1, h, m));
};

/**
 * Synchronize an approved / cancelled Woff application to Attendance & ShiftSchedule.
 * - fromDate: Original weekly off given up -> becomes working shift (default 'G'), W-off cancelled,
 *             punches evaluated for Present and OT calculated.
 * - toDate:   Compensatory day off -> becomes Weekly Off ('W'), woff_day = 1.00.
 */
const syncWoffToAttendanceAndSchedule = async (woff, isApproved, transaction = null) => {
  try {
    const opt = transaction ? { transaction } : {};
    const empid = woff.empid;
    const fromDate = toLocalDateStr(woff.woff_from_date);
    const toDate = toLocalDateStr(woff.woff_to_date);
    if (!empid || !fromDate || !toDate) return;

    const shiftCd = woff.shift_cd || 'G';
    const shiftMaster = await ShiftMaster.findOne({ where: { shift_cd: shiftCd } });
    const shiftStart = shiftMaster?.start_time ? `${shiftMaster.start_time}:00`.slice(0, 8) : '09:00:00';
    let shiftEnd = shiftMaster?.end_time ? `${shiftMaster.end_time}:00`.slice(0, 8) : '17:30:00';
    if (getTimeMins(shiftEnd) === 1080) shiftEnd = '17:30:00';
    const schedStart = makeShiftDate(shiftStart);
    const schedEnd = makeShiftDate(shiftEnd);

    if (isApproved) {
      // 1. FROM DATE (Original W-Off given up to work)
      const existingSchedFrom = await ShiftSchedule.findOne({
        where: {
          empid,
          shift_date: {
            [Op.between]: [new Date(`${fromDate}T00:00:00.000Z`), new Date(`${fromDate}T23:59:59.999Z`)]
          }
        }
      });
      if (existingSchedFrom) {
        await existingSchedFrom.update({ shift_cd: shiftCd, shift_start_time: schedStart, shift_end_time: schedEnd }, opt);
      } else {
        await ShiftSchedule.create({ empid, shift_date: new Date(`${fromDate}T00:00:00.000Z`), shift_cd: shiftCd, shift_start_time: schedStart, shift_end_time: schedEnd }, opt);
      }

      const attFrom = await Attendance.findOne({ where: { empid, att_date: fromDate } });
      if (attFrom) {
        const updateData = {
          shift: shiftCd,
          shift_start: shiftStart,
          shift_end: shiftEnd,
          woff_day: 0.00,
        };
        if (attFrom.in_time && attFrom.out_time) {
          updateData.status = 'P';
          const ot = calculateOTHrs(attFrom.out_time, shiftEnd.slice(0, 5), shiftStart, attFrom.in_time);
          updateData.ot_hrs = Math.round(ot * 100) / 100;
          if (ot > 0) {
            const otHHMM = decimalToHHMM(ot);
            updateData.app_ot = otHHMM;
            updateData.app_status = 1;
            updateData.hr_app_ot = otHHMM;
            updateData.hr_app_status = 1;
            updateData.app_remarks = updateData.app_remarks || `Woff change to Shift ${shiftCd}`;
            updateData.hr_remarks = updateData.hr_remarks || `Woff change to Shift ${shiftCd}`;
          }
        } else if (!attFrom.in_time && !attFrom.out_time) {
          const isPast = new Date(fromDate) < new Date(new Date().toISOString().slice(0, 10));
          updateData.status = 'A';
          updateData.lop_days = isPast ? 1 : 0;
        }
        await attFrom.update(updateData, opt);
      }

      // 2. TO DATE (Compensatory weekly off granted)
      const existingSchedTo = await ShiftSchedule.findOne({
        where: {
          empid,
          shift_date: {
            [Op.between]: [new Date(`${toDate}T00:00:00.000Z`), new Date(`${toDate}T23:59:59.999Z`)]
          }
        }
      });
      if (existingSchedTo) {
        await existingSchedTo.update({ shift_cd: 'W', shift_start_time: null, shift_end_time: null }, opt);
      } else {
        await ShiftSchedule.create({ empid, shift_date: new Date(`${toDate}T00:00:00.000Z`), shift_cd: 'W', shift_start_time: null, shift_end_time: null }, opt);
      }

      const attTo = await Attendance.findOne({ where: { empid, att_date: toDate } });
      if (attTo) {
        const updateDataTo = {
          shift: 'W',
          shift_start: null,
          shift_end: null,
          woff_day: 1.00,
          lop_days: 0.00,
        };
        if (!attTo.in_time && !attTo.out_time) {
          updateDataTo.status = 'W';
          updateDataTo.ot_hrs = 0.00;
        }
        await attTo.update(updateDataTo, opt);
      }
    } else {
      // Revert if Cancelled / Rejected / Reopened
      const attFrom = await Attendance.findOne({ where: { empid, att_date: fromDate } });
      if (attFrom) {
        const revertFrom = {
          shift: 'W',
          shift_start: null,
          shift_end: null,
          woff_day: 1.00,
        };
        if (!attFrom.in_time && !attFrom.out_time) {
          revertFrom.status = 'W';
          revertFrom.ot_hrs = 0.00;
          revertFrom.app_status = 0;
          revertFrom.hr_app_status = 0;
        }
        await attFrom.update(revertFrom, opt);
      }
      const schedFrom = await ShiftSchedule.findOne({
        where: {
          empid,
          shift_date: {
            [Op.between]: [new Date(`${fromDate}T00:00:00.000Z`), new Date(`${fromDate}T23:59:59.999Z`)]
          }
        }
      });
      if (schedFrom) {
        await schedFrom.update({ shift_cd: 'W', shift_start_time: null, shift_end_time: null }, opt);
      }

      const attTo = await Attendance.findOne({ where: { empid, att_date: toDate } });
      if (attTo) {
        const revertTo = {
          shift: 'G',
          woff_day: 0.00,
        };
        if (!attTo.in_time && !attTo.out_time) {
          revertTo.status = 'A';
        }
        await attTo.update(revertTo, opt);
      }
      const schedTo = await ShiftSchedule.findOne({
        where: {
          empid,
          shift_date: {
            [Op.between]: [new Date(`${toDate}T00:00:00.000Z`), new Date(`${toDate}T23:59:59.999Z`)]
          }
        }
      });
      if (schedTo) {
        await schedTo.update({ shift_cd: 'G', shift_start_time: makeShiftDate('09:00:00'), shift_end_time: makeShiftDate('17:30:00') }, opt);
      }
    }
  } catch (err) {
    console.error('Error syncing Woff to Attendance/Schedule:', err);
  }
};

exports.syncWoffToAttendanceAndSchedule = syncWoffToAttendanceAndSchedule;

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
    
    await syncWoffToAttendanceAndSchedule(woff, status === 'Approved');
    
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

    await syncWoffToAttendanceAndSchedule(application, application.status === 'Approved');

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
    await syncWoffToAttendanceAndSchedule(app, false);
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
    await syncWoffToAttendanceAndSchedule(app, false);
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

