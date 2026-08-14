const { Attendance, EmployeeMaster, LeaveApplication, LeaveDetails, LeaveApproval, WoffApplication, OnDutyApplication, ShiftSchedule, Holiday, LeaveMaster, EmpSalary, ExtOt, EmpOfficial, MusterRollSummary, Payslip, ShiftMaster } = require('../../models');
const { Sequelize, Op } = require('sequelize');

const MONTH_NAMES = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

async function isPayrollFinalized(dateStr) {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return false;
  const month = MONTH_NAMES[d.getMonth()];
  const year = d.getFullYear();
  const count = await Payslip.count({
    where: { C_MONTH: month, C_YEAR: year, C_FINAL_STATUS: 2 }
  });
  return count > 0;
}

const formatDateForQuery = (dateStr) => {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return d.toISOString().split('T')[0];
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

exports.saveAttendance = async (req, res) => {
  try {
    let attendanceData = req.body;
    const attDate = formatDateForQuery(attendanceData.att_date);

    // Safety Check: Verify employee is active
    if (attendanceData.empid) {
      const emp = await EmployeeMaster.findByPk(attendanceData.empid);
      if (!emp || !emp.is_active) {
        return res.status(403).json({ message: 'Cannot record attendance for an inactive or departed employee' });
      }
    }

    // Block edits if salary already finalized for this month
    if (await isPayrollFinalized(attendanceData.att_date)) {
      return res.status(400).json({ message: 'Cannot modify attendance — salary already finalized for this month.' });
    }

    // Absent status: no in/out times, no late/OT hours
    if (attendanceData.status === 'A') {
      attendanceData.in_time = null;
      attendanceData.out_time = null;
      attendanceData.late_hrs = 0;
      attendanceData.late_exempt = false;
      attendanceData.ot_hrs = 0;
    }

    if (attendanceData.in_time && attendanceData.empid && attDate) {
      const shiftSchedule = await ShiftSchedule.findOne({
        where: {
          empid: attendanceData.empid,
          shift_date: attDate
        }
      });
      const shiftStart = shiftSchedule?.shift_start_time || '09:00:00';
      const graceMins = 0;
      const calculatedLate = calculateLateHrs(attendanceData.in_time, shiftStart, graceMins);

      if (calculatedLate > 0) {
        const attDate = new Date(attendanceData.att_date);
        const month = attDate.getMonth() + 1;
        const year = attDate.getFullYear();
        const startOfMonth = `${year}-${String(month).padStart(2, '0')}-01`;
        const lastDay = new Date(year, month, 0).getDate();
        const endOfMonth = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

        const existingLate = await Attendance.findAll({
          where: {
            empid: attendanceData.empid,
            att_date: { [Sequelize.Op.between]: [startOfMonth, endOfMonth] },
            late_hrs: { [Sequelize.Op.gt]: 0 }
          }
        });

        attendanceData.late_hrs = calculatedLate;
        attendanceData.late_exempt = existingLate.length === 0;
      } else {
        attendanceData.late_hrs = 0;
        attendanceData.late_exempt = false;
      }
    } else {
      attendanceData.late_hrs = 0;
      attendanceData.late_exempt = false;
    }

    if (attendanceData.out_time && attendanceData.empid && attDate) {
      const shiftSchedule = await ShiftSchedule.findOne({
        where: {
          empid: attendanceData.empid,
          shift_date: attDate
        }
      });
      if (shiftSchedule?.shift_end_time) {
        let shiftEndTime = shiftSchedule.shift_end_time;
        // Auto-fix legacy 18:00 records to 17:30
        if (getTimeMins(shiftEndTime) === 1080) shiftEndTime = '17:30';

        const shiftStart = shiftSchedule.shift_start_time || '09:00:00';
        attendanceData.ot_hrs = calculateOTHrs(attendanceData.out_time, shiftEndTime, shiftStart, attendanceData.in_time);
      } else {
        // Fallback to 17:30 if no schedule end time
        attendanceData.ot_hrs = calculateOTHrs(attendanceData.out_time, '17:30', '09:00:00', attendanceData.in_time);
      }
    } else {
      attendanceData.ot_hrs = 0;
    }
    await Attendance.upsert(attendanceData);
    res.json({ message: 'Attendance saved successfully' });
  } catch (error) {
    console.error('Error saving attendance:', error);
    res.status(500).json({ message: 'Error saving attendance' });
  }
};

exports.updateAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    let attendanceData = req.body;
    const existing = await Attendance.findByPk(id);
    const empId = attendanceData.empid || existing?.empid;
    const attDate = attendanceData.att_date || existing?.att_date;

    if (existing && (await isPayrollFinalized(attDate))) {
      return res.status(400).json({ message: 'Cannot modify attendance — salary already finalized for this month.' });
    }

    // Absent status: no in/out times, no late/OT hours
    if (attendanceData.status === 'A') {
      attendanceData.in_time = null;
      attendanceData.out_time = null;
      attendanceData.late_hrs = 0;
      attendanceData.late_exempt = false;
      attendanceData.ot_hrs = 0;
    }

    if (existing && attendanceData.in_time) {
      const attDateFormatted = formatDateForQuery(attDate);
      const shiftSchedule = await ShiftSchedule.findOne({
        where: {
          empid: empId,
          shift_date: attDateFormatted
        }
      });
      const shiftStart = shiftSchedule?.shift_start_time || '09:00:00';
      const graceMins = 0;
      const calculatedLate = calculateLateHrs(attendanceData.in_time, shiftStart, graceMins);

      if (calculatedLate > 0) {
        const dateObj = new Date(attDate);
        const month = dateObj.getMonth() + 1;
        const year = dateObj.getFullYear();
        const startOfMonth = `${year}-${String(month).padStart(2, '0')}-01`;
        const lastDay = new Date(year, month, 0).getDate();
        const endOfMonth = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

        const existingLate = await Attendance.findAll({
          where: {
            empid: empId,
            att_date: { [Sequelize.Op.between]: [startOfMonth, endOfMonth] },
            late_hrs: { [Sequelize.Op.gt]: 0 }
          }
        });

        attendanceData.late_hrs = calculatedLate;
        attendanceData.late_exempt = existingLate.length === 0;
      } else {
        attendanceData.late_hrs = 0;
        attendanceData.late_exempt = false;
      }
    } else {
      attendanceData.late_hrs = 0;
      attendanceData.late_exempt = false;
    }

    if (attendanceData.out_time) {
      const attDateFormatted = formatDateForQuery(attDate);
      const shiftSchedule = await ShiftSchedule.findOne({
        where: {
          empid: empId,
          shift_date: attDateFormatted
        }
      });
      if (shiftSchedule?.shift_end_time) {
        let shiftEndTime = shiftSchedule.shift_end_time;
        // Auto-fix legacy 18:00 records to 17:30
        if (getTimeMins(shiftEndTime) === 1080) shiftEndTime = '17:30';

        const shiftStart = shiftSchedule.shift_start_time || '09:00:00';
        attendanceData.ot_hrs = calculateOTHrs(attendanceData.out_time, shiftEndTime, shiftStart, attendanceData.in_time);
      } else {
        attendanceData.ot_hrs = calculateOTHrs(attendanceData.out_time, '17:30', '09:00:00', attendanceData.in_time);
      }
    } else {
      attendanceData.ot_hrs = 0;
    }
    await Attendance.update(attendanceData, { where: { id } });
    res.json({ message: 'Attendance updated successfully' });
  } catch (error) {
    console.error('Error updating attendance:', error);
    res.status(500).json({ message: 'Error updating attendance' });
  }
};

exports.deleteAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const rec = await Attendance.findByPk(id);
    if (!rec) return res.status(404).json({ message: 'Attendance record not found' });
    if (await isPayrollFinalized(rec.att_date)) {
      return res.status(400).json({ message: 'Cannot delete attendance — salary already finalized for this month.' });
    }
    await Attendance.destroy({ where: { id } });
    res.json({ message: 'Attendance deleted successfully' });
  } catch (error) {
    console.error('Error deleting attendance:', error);
    res.status(500).json({ message: 'Error deleting attendance' });
  }
};

exports.saveBulkAttendance = async (req, res) => {
    const attendanceList = req.body;

    // Check if any record's month has payroll finalized
    const monthsToCheck = new Set();
    attendanceList.forEach(a => {
      if (a.att_date) {
        const d = new Date(a.att_date);
        if (!isNaN(d.getTime())) monthsToCheck.add(`${MONTH_NAMES[d.getMonth()]}-${d.getFullYear()}`);
      }
    });
    for (const key of monthsToCheck) {
      const [m, y] = key.split('-');
      const count = await Payslip.count({ where: { C_MONTH: m, C_YEAR: parseInt(y), C_FINAL_STATUS: 2 } });
      if (count > 0) {
        return res.status(400).json({ message: 'Cannot save bulk attendance — salary already finalized for one or more dates in this batch.' });
      }
    }

    const t = await Attendance.sequelize.transaction();
    try {
      const empLateCount = {};

      // Enforce: a Present (P) record must have both in_time and out_time
      const invalidPresent = attendanceList.filter(
        (a) => (a.status === 'P' || a.status === 'Present') && (!a.in_time || !a.out_time)
      );
      if (invalidPresent.length > 0) {
        await t.rollback();
        return res.status(400).json({
          message: 'Present (P) requires both In Time and Out Time. Please enter punches for all Present rows.'
        });
      }


    // Optimize database requests: Fetch all relevant shift schedules in a single query
    const empIds = [...new Set(attendanceList.map(a => a.empid).filter(Boolean))];
    const dates = [...new Set(attendanceList.map(a => formatDateForQuery(a.att_date)).filter(Boolean))];

    let shiftSchedules = [];
    if (empIds.length > 0 && dates.length > 0) {
      shiftSchedules = await ShiftSchedule.findAll({
        where: {
          empid: empIds,
          shift_date: dates
        }
      });
    }

    const scheduleMap = {};
    shiftSchedules.forEach(s => {
      const formattedDate = formatDateForQuery(s.shift_date);
      scheduleMap[`${s.empid}_${formattedDate}`] = s;
    });

    for (const att of attendanceList) {
      const attDateFormatted = formatDateForQuery(att.att_date);
      const shiftSchedule = scheduleMap[`${att.empid}_${attDateFormatted}`];

      if (att.in_time && att.empid && attDateFormatted) {
        const shiftStart = shiftSchedule?.shift_start_time || '09:00:00';
        const graceMins = 0;
        const calculatedLate = calculateLateHrs(att.in_time, shiftStart, graceMins);

        if (calculatedLate > 0) {
          const dateObj = new Date(att.att_date);
          const monthNum = dateObj.getMonth() + 1;
          const year = dateObj.getFullYear();
          const monthKey = `${att.empid}-${year}-${monthNum}`;

          if (!empLateCount.hasOwnProperty(monthKey)) {
            const startOfMonth = `${year}-${String(monthNum).padStart(2, '0')}-01`;
            const lastDay = new Date(year, monthNum, 0).getDate();
            const endOfMonth = `${year}-${String(monthNum).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

            const existingLate = await Attendance.findAll({
              where: {
                empid: att.empid,
                att_date: { [Sequelize.Op.between]: [startOfMonth, endOfMonth] },
                late_hrs: { [Sequelize.Op.gt]: 0 }
              }
            });
            empLateCount[monthKey] = existingLate.length;
          }

          att.late_hrs = calculatedLate;
          att.late_exempt = empLateCount[monthKey] === 0;
          empLateCount[monthKey]++;
        } else {
          att.late_hrs = 0;
          att.late_exempt = false;
        }

        if (att.out_time && shiftSchedule?.shift_end_time) {
          att.ot_hrs = calculateOTHrs(att.out_time, shiftSchedule.shift_end_time, shiftStart, att.in_time);
        } else {
          att.ot_hrs = 0;
        }
      } else if (att.out_time && att.empid && attDateFormatted) {
        let shiftEndTime = shiftSchedule?.shift_end_time || '17:30';
        if (getTimeMins(shiftEndTime) === 1080) shiftEndTime = '17:30';

        const shiftStartTime = shiftSchedule?.shift_start_time || '09:00:00';
        att.ot_hrs = calculateOTHrs(att.out_time, shiftEndTime, '09:00:00', null);
      } else {
        att.late_hrs = 0;
        att.late_exempt = false;
        att.ot_hrs = 0;
      }
      await Attendance.upsert(att, { transaction: t });
    }
    await t.commit();
    res.json({ message: 'Bulk attendance saved successfully', count: attendanceList.length });
  } catch (error) {
    await t.rollback();
    console.error('Error saving bulk attendance:', error);
    res.status(500).json({ message: 'Error saving bulk attendance' });
  }
};

exports.getAttendance = async (req, res) => {
  try {
    const { empid, month, year, startDate, endDate } = req.query;
    const where = {};

    if (empid) where.empid = parseInt(empid);

    if (startDate && endDate) {
      where.att_date = {
        [Sequelize.Op.gte]: startDate,
        [Sequelize.Op.lte]: endDate
      };
    } else if (month && year) {
      const monthNum = parseInt(month);
      const yearNum = parseInt(year);
      const startDt = `${yearNum}-${String(monthNum).padStart(2, '0')}-01`;
      const lastDay = new Date(yearNum, monthNum, 0).getDate();
      const endDt = `${yearNum}-${String(monthNum).padStart(2, '0')}-${lastDay}`;
      where.att_date = {
        [Sequelize.Op.gte]: startDt,
        [Sequelize.Op.lte]: endDt
      };
    }

    const data = await Attendance.findAll({
      where,
      include: [{
        model: EmployeeMaster,
        as: 'employee',
        attributes: ['empid', 'ename', 'deptname'],
        required: false
      }],
      order: [['att_date', 'ASC'], ['empid', 'ASC']]
    });

    // Check if the queried month has payroll finalized
    let finalized = false;
    if (month && year) {
      const m = MONTH_NAMES[parseInt(month) - 1];
      const cnt = await Payslip.count({ where: { C_MONTH: m, C_YEAR: parseInt(year), C_FINAL_STATUS: 2 } });
      finalized = cnt > 0;
    } else if (startDate) {
      finalized = await isPayrollFinalized(startDate);
    }

    res.json({ records: data, _payrollFinalized: finalized });
  } catch (error) {
    console.error('Error fetching attendance:', error);
    res.status(500).json({ message: 'Error fetching attendance', error: error.message });
  }
};

exports.getEmployeeAttendanceSummary = async (req, res) => {
  try {
    const { empid, month, year } = req.query;
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const endDate = `${year}-${String(month).padStart(2, '0')}-31`;

    const attendanceData = await Attendance.findAll({
      where: {
        empid: parseInt(empid),
        att_date: { [Sequelize.Op.between]: [startDate, endDate] }
      }
    });

    const summary = {
      totalDays: attendanceData.length,
      present: attendanceData.filter(a => a.status === 'Present').length,
      absent: attendanceData.filter(a => a.status === 'Absent').length,
      leave: attendanceData.filter(a => a.status === 'Leave').length,
      woff: attendanceData.filter(a => a.woff_day > 0).length,
      holiday: attendanceData.filter(a => a.holiday).length,
      lop: attendanceData.reduce((sum, a) => sum + (parseFloat(a.lop_days) || 0), 0),
      lateHrs: attendanceData.reduce((sum, a) => sum + (parseFloat(a.late_hrs) || 0), 0),
      otHrs: attendanceData.reduce((sum, a) => sum + otHrsToDecimal(a.ot_hrs, a.in_time, a.out_time), 0)
    };

    res.json(summary);
  } catch (error) {
    console.error('Error fetching attendance summary:', error);
    res.status(500).json({ message: 'Error fetching attendance summary' });
  }
};

exports.importAttendance = async (req, res) => {
  const t = await Attendance.sequelize.transaction();
  try {
    const { empid, month, year, attendanceData } = req.body;

    for (const att of attendanceData) {
      await Attendance.upsert({
        empid: parseInt(empid),
        att_date: att.date,
        shift: att.shift || 'General',
        in_time: att.inTime || null,
        out_time: att.outTime || null,
        late_hrs: att.lateHrs || 0,
        ot_hrs: att.otHrs || 0,
        status: att.status || 'Present',
        lop_days: att.lop || 0
      }, { transaction: t });
    }

    await t.commit();
    res.json({ message: 'Attendance imported successfully', count: attendanceData.length });
  } catch (error) {
    await t.rollback();
    console.error('Error importing attendance:', error);
    res.status(500).json({ message: 'Error importing attendance' });
  }
};

const calculateTimeDifference = (time1, time2) => {
  if (!time1 || !time2) return 0;
  try {
    const t1 = typeof time1 === 'string' ? time1 : time1.toString();
    const t2 = typeof time2 === 'string' ? time2 : time2.toString();
    const [h1, m1] = t1.split(':').map(Number);
    const [h2, m2] = t2.split(':').map(Number);
    const mins1 = h1 * 60 + m1;
    const mins2 = h2 * 60 + m2;
    return (mins2 - mins1) / 60;
  } catch (e) {
    return 0;
  }
};

exports.getShiftScheduleForAttendance = async (req, res) => {
  try {
    const { month, year } = req.query;
    const monthNum = parseInt(month);
    const yearNum = parseInt(year);
    const startDate = `${yearNum}-${String(monthNum).padStart(2, '0')}-01`;
    const endDate = `${yearNum}-${String(monthNum).padStart(2, '0')}-31`;

    const schedules = await ShiftSchedule.findAll({
      where: {
        shift_date: { [Sequelize.Op.between]: [startDate, endDate] }
      },
      attributes: ['empid', 'shift_date', 'shift_cd', 'shift_start_time', 'shift_end_time']
    });

    const scheduleMap = {};
    schedules.forEach(s => {
      const dateKey = toLocalDateStr(s.shift_date);
      if (!scheduleMap[s.empid]) scheduleMap[s.empid] = {};
      scheduleMap[s.empid][dateKey] = {
        shift_cd: s.shift_cd,
        shift_start_time: s.shift_start_time,
        shift_end_time: s.shift_end_time
      };
    });

    res.json(scheduleMap);
  } catch (error) {
    console.error('Error fetching shift schedules:', error);
    res.status(500).json({ message: 'Error fetching shift schedules' });
  }
};

const calculateLateHrs = (inTime, shiftStart, graceMins = 0) => {
  if (!inTime || !shiftStart) return 0;
  try {
    const inMins = getTimeMins(inTime);
    const shiftMins = getTimeMins(shiftStart);

    if (inMins === null || shiftMins === null) return 0;

    const targetMins = shiftMins + graceMins;
    if (inMins > targetMins) {
      const diff = inMins - targetMins;
      const h = Math.floor(diff / 60);
      const m = diff % 60;
      return h + m / 100; // HH.MM format
    }
    return 0;
  } catch (e) {
    console.error('Error in calculateLateHrs:', e);
    return 0;
  }
};

/**
 * Robustly get minutes from a time value (string, Date, or object)
 */
const getTimeMins = (time) => {
  if (!time) return null;
  const str = String(time).trim();

  // Try to match HH:mm or HH.mm or HH:mm:ss
  const timeMatch = str.match(/(\d{1,2})[:.](\d{2})/);
  if (timeMatch) {
    return parseInt(timeMatch[1], 10) * 60 + parseInt(timeMatch[2], 10);
  }

  // Handle Date objects or full date strings
  const dateParsed = new Date(time);
  if (!isNaN(dateParsed.getTime())) {
    return dateParsed.getHours() * 60 + dateParsed.getMinutes();
  }

  return null;
};

/**
 * Classify a swiped day by comparing in/out against shift start,
 * lunch start, lunch end and shift end times.
 *
 * Rules:
 *  - out_time <= lunch_end                  -> 'Half Day' (worked first half, left at/before lunch end)
 *  - in_time  >= lunch_start                -> 'Half Day' (worked second half, arrived at/after lunch start)
 *  - out_time <  shift_end (even 1 min before shift end) -> 'Half Day'
 *  - otherwise                              -> 'Present'
 */
const classifySwipedDay = (inTime, outTime, shiftStart, lunchStart, lunchEnd, shiftEnd) => {
  const inMins = getTimeMins(inTime);
  const outMins = getTimeMins(outTime);
  if (inMins === null || outMins === null) return 'Present';
  const lunchStartMins = getTimeMins(lunchStart);
  const lunchEndMins = getTimeMins(lunchEnd);
  const shiftEndMins = getTimeMins(shiftEnd);
  const shiftStartMins = getTimeMins(shiftStart);

  const isOvernightShift = shiftStartMins !== null && shiftEndMins !== null && shiftEndMins < shiftStartMins;

  if (lunchEndMins !== null && outMins <= lunchEndMins) return 'Half Day';
  if (lunchStartMins !== null && inMins >= lunchStartMins) return 'Half Day';

  // For overnight shifts: out_time is next day (early AM), so add 1440 for comparison
  let effectiveOutMins = outMins;
  if (isOvernightShift && outMins < 720) { // out before noon = next day
    effectiveOutMins += 1440;
  }
  const effectiveShiftEndMins = isOvernightShift ? shiftEndMins + 1440 : shiftEndMins;

  if (shiftEndMins !== null && effectiveOutMins < effectiveShiftEndMins) return 'Half Day';
  return 'Present';
};

const calculateOTHrs = (outTime, shiftEnd, shiftStart, inTime) => {
  if (!outTime || !shiftEnd) return 0;
  try {
    const outMins = getTimeMins(outTime);
    const shiftEndMins = getTimeMins(shiftEnd);

    if (outMins === null || shiftEndMins === null) return 0;

    let extraMins = outMins - shiftEndMins;

    // Handle overnight shifts (e.g., leaving at 01:30 AM after a 17:30 shift end)
    if (extraMins < 0 && outMins < 600) { // If out before 10 AM, assume it's next day
      extraMins = (outMins + 1440) - shiftEndMins;
    }

    if (extraMins > 0) {
      return extraMins / 60; // decimal hours for correct summing
    }
    return 0;
  } catch (e) {
    console.error('Error in calculateOTHrs:', e);
    return 0;
  }
};

/**
 * Convert HH.MM format (e.g. 1.15 = 1h15m) to decimal hours (1.25)
 */
const hhmmToDecimal = (val) => {
  if (!val || isNaN(val)) return 0;
  const n = Number(val);
  const h = Math.floor(n);
  const m = Math.round((n - h) * 100);
  return h + m / 60;
};

const decimalToHHMM = (decimalHours) => {
  if (!decimalHours && decimalHours !== 0) return '';
  const h = Math.floor(decimalHours);
  const m = Math.round((decimalHours - h) * 60);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};

/**
 * Parse stored ot_hrs to decimal hours, disambiguating HH.MM (4.30 = 4h30m)
 * vs decimal format (4.50 = 4.5h = 4h30m) by comparing with OT recalculated
 * from in_time/out_time.
 */
const otHrsToDecimal = (ot_hrs, inTime, outTime) => {
  if (!ot_hrs) return 0;
  const asDecimal = Number(ot_hrs);
  const asHHMM = hhmmToDecimal(ot_hrs);
  if (Math.abs(asDecimal - asHHMM) < 0.001) return asDecimal;

  // Recalculate OT from in/out times to find which interpretation matches
  if (inTime && outTime) {
    const shiftEnd = '17:30';
    const shiftStart = '09:00:00';
    const expectedOt = calculateOTHrs(outTime, shiftEnd, shiftStart, inTime);
    if (expectedOt > 0) {
      const diffDecimal = Math.abs(asDecimal - expectedOt);
      const diffHHMM = Math.abs(asHHMM - expectedOt);
      return diffDecimal <= diffHHMM ? asDecimal : asHHMM;
    }
  }
  // Fallback: HH.MM was the original system convention
  return asHHMM;
};

const parseOtValueToHHMM = (val, referenceOt) => {
  if (val === undefined || val === null || val === '') return null;
  const otStr = val.toString();
  if (otStr.includes(':')) return otStr.slice(0, 5);
  // Input is ambiguous: could be HH.MM (4.30 = 4h30m) or decimal (4.50 = 4.5h = 4h30m)
  // Use reference ot_hrs to pick the interpretation closest to it
  const refDecimal = referenceOt ? hhmmToDecimal(referenceOt) : null;
  const asDecimal = parseFloat(otStr);
  const asHHMM = hhmmToDecimal(otStr);
  if (refDecimal !== null) {
    const chosen = Math.abs(asDecimal - refDecimal) <= Math.abs(asHHMM - refDecimal) ? asDecimal : asHHMM;
    return decimalToHHMM(chosen);
  }
  // Without reference, HH.MM is the convention used in this system
  return decimalToHHMM(asHHMM);
};

const getMonthName = (month) => {
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  return months[month - 1];
};

exports.getMusterRoll = async (req, res) => {
  try {
    const { month, year, empid } = req.query;
    const monthNum = parseInt(month);
    const yearNum = parseInt(year);
    const daysInMonth = new Date(yearNum, monthNum, 0).getDate();
    const startDate = `${yearNum}-${String(monthNum).padStart(2, '0')}-01`;
    const endDate = `${yearNum}-${String(monthNum).padStart(2, '0')}-${String(daysInMonth).padStart(2, '0')}`;

    const whereEmployees = { is_active: true };
    if (empid && empid !== '') whereEmployees.empid = parseInt(empid);
    const employees = await EmployeeMaster.findAll({
      where: whereEmployees,
      order: [['empid', 'ASC']],
      include: [{ model: EmpSalary, as: 'salary', attributes: ['basic'] }]
    });

    const holidays = await Holiday.findAll({
      where: { yr: String(yearNum) }
    });
    const holidayDates = holidays.map(h => h.hdate);

    const woffApps = await WoffApplication.findAll({
      where: {
        status: 'Approved',
        [Op.or]: [
          { woff_to_date: { [Sequelize.Op.between]: [startDate, endDate] } },
          { woff_from_date: { [Sequelize.Op.between]: [startDate, endDate] } }
        ]
      }
    });
    const woffDatesByEmp = {};
    const woffExcludeByEmp = {};
    woffApps.forEach(w => {
      const toDate = toLocalDateStr(w.woff_to_date);
      const fromDate = toLocalDateStr(w.woff_from_date);
      if (toDate) {
        if (!woffDatesByEmp[w.empid]) woffDatesByEmp[w.empid] = [];
        woffDatesByEmp[w.empid].push(toDate);
      }
      if (fromDate) {
        if (!woffExcludeByEmp[w.empid]) woffExcludeByEmp[w.empid] = [];
        woffExcludeByEmp[w.empid].push(fromDate);
      }
    });

    const silenceCheck = async () => { };
    const attendanceData = await Attendance.findAll({
      where: {
        att_date: { [Sequelize.Op.between]: [startDate, endDate] }
      }
    });
    const attendanceMap = {};
    attendanceData.forEach(a => {
      if (!attendanceMap[a.empid]) attendanceMap[a.empid] = {};
      attendanceMap[a.empid][a.att_date] = a;
    });

    // Read approved leaves from leave_approval (primary source)
    const leaveApprovalList = await LeaveApproval.findAll({
      where: {
        frmdt: { [Sequelize.Op.between]: [startDate, endDate] },
        app_status: 'Approved'
      }
    });
    const leaveDatesByEmp = {};
    leaveApprovalList.forEach(l => {
      const empId = l.empid;
      if (!leaveDatesByEmp[empId]) leaveDatesByEmp[empId] = {};
      const ltype = l.leave_type || 'EL';
      const daydt = l.daydt || 'FULL DAY';
      const dateKey = new Date(l.frmdt).toISOString().split('T')[0];
      leaveDatesByEmp[empId][dateKey] = { type: ltype, daydt: daydt };
    });

    const shiftSchedules = await ShiftSchedule.findAll({
      where: {
        shift_date: { [Sequelize.Op.between]: [startDate, endDate] }
      }
    });
    const scheduleMap = {};
    shiftSchedules.forEach(s => {
      const dateKey = toLocalDateStr(s.shift_date);
      if (!scheduleMap[s.empid]) scheduleMap[s.empid] = {};
      scheduleMap[s.empid][dateKey] = s;
    });

    const shiftMasters = await ShiftMaster.findAll();
    const shiftLunchMap = {};
    shiftMasters.forEach(sm => {
      shiftLunchMap[sm.shift_cd] = { start: sm.lunch_start_time, end: sm.lunch_end_time };
    });

    const extOtDataList = await ExtOt.findAll({
      where: {
        ot_date: { [Sequelize.Op.between]: [startDate, endDate] }
      }
    });
    const extOtMap = {};
    extOtDataList.forEach(e => {
      if (!extOtMap[e.empid]) extOtMap[e.empid] = {};
      extOtMap[e.empid][e.ot_date] = e;
    });

    const musterData = [];

    for (const emp of employees) {
      const empId = emp.empid;
      const empSchedule = scheduleMap[empId] || {};
      const empAttendance = attendanceMap[empId] || {};
      const empWoffs = woffDatesByEmp[empId] || [];
      const empWoffExclude = woffExcludeByEmp[empId] || [];
      const empLeaves = leaveDatesByEmp[empId] || {};
      const empExtOt = extOtMap[empId] || {};

      const monthlyData = {
        empid: empId,
        ename: emp.ename,
        department: emp.deptname || emp.department || '-',
        days: [],
        late_cost: 0
      };

      let totalPresent = 0, totalAbsent = 0, totalLeave = 0, totalWoff = 0, totalHoliday = 0, totalLop = 0, totalLateHrs = 0, totalOTHrs = 0;

      // Fetch date of joining
      const empOfficial = empId ? await EmpOfficial.findOne({ where: { empid: empId }, attributes: ['doj'] }) : null;
      const doj = empOfficial?.doj ? new Date(empOfficial.doj).toISOString().split('T')[0] : null;

      for (let day = 1; day <= daysInMonth; day++) {
        const currentDate = `${yearNum}-${String(monthNum).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const dayOfWeek = new Date(yearNum, monthNum - 1, day).getDay();

        // Skip days before date of joining
        if (doj && currentDate < doj) {
          monthlyData.days.push({
            date: currentDate,
            dayOfWeek: dayOfWeek,
            day: day,
            status: '',
            shift: '-',
            in_time: null,
            out_time: null,
            late_hrs: 0,
            ot_hrs: 0,
            lop: 0,
          });
          continue;
        }

        const schedule = empSchedule[currentDate];
        const attendance = empAttendance[currentDate];
        const isHoliday = holidayDates.includes(currentDate);
        const isWoff = empWoffs.includes(currentDate) || (dayOfWeek === 0 && !empWoffExclude.includes(currentDate));

        const leaveInfo = empLeaves[currentDate];

        let dayStatus = 'Absent';
        let shiftCd = schedule?.shift_cd || '-';
        let inTime = attendance?.in_time || null;
        let outTime = attendance?.out_time || null;
        let lateHrs = 0;
        let otHrs = 0;
        let lopDays = 0;

        const extOt = empExtOt[currentDate];
        if (extOt) {
          if (!inTime && extOt.in_time) inTime = extOt.in_time;
          if (!outTime && extOt.out_time) outTime = extOt.out_time;
        }

        if (isHoliday) {
          if (inTime || outTime) {
            dayStatus = 'Holiday';
            totalHoliday++;
            if (extOt && Number(extOt.app_status) >= 1) {
              otHrs = hhmmToDecimal(extOt.ot_hrs);
            } else if (attendance && Number(attendance.hr_app_status) === 1 && attendance.ot_hrs) {
              otHrs = otHrsToDecimal(attendance.ot_hrs, attendance.in_time, attendance.out_time);
            }
            totalOTHrs += otHrs;
          } else {
            dayStatus = 'Holiday';
            totalHoliday++;
          }
        } else if (isWoff && !leaveInfo) {
          if (inTime || outTime) {
            dayStatus = 'W-Off';
            totalWoff++;
            if (extOt && Number(extOt.app_status) >= 1) {
              otHrs = hhmmToDecimal(extOt.ot_hrs);
            } else if (attendance && Number(attendance.hr_app_status) === 1 && attendance.ot_hrs) {
              otHrs = otHrsToDecimal(attendance.ot_hrs, attendance.in_time, attendance.out_time);
            }
            totalOTHrs += otHrs;
          } else {
            dayStatus = 'W-Off';
            totalWoff++;
          }
        } else if (extOt && extOt.ot_type === 'HalfDay' && Number(extOt.app_status) >= 1) {
          // Half Day OT via ext_ot — similar to Holiday OT pattern
          dayStatus = 'Half Day';
          totalPresent += 0.5;
          if (inTime) lateHrs = calculateLateHrs(inTime, schedule?.shift_start_time || '09:00');
          otHrs = hhmmToDecimal(extOt.ot_hrs);
          totalLateHrs += lateHrs;
          totalOTHrs += otHrs;
        } else if (leaveInfo || schedule || attendance) {
          const shiftStart = schedule?.shift_start_time || '09:00';
          let shiftEnd = schedule?.shift_end_time || '17:30';
          if (getTimeMins(shiftEnd) === 1080) shiftEnd = '17:30';

          const hasSwipes = !!(inTime || outTime);
          if (hasSwipes) {
            if (inTime) lateHrs = calculateLateHrs(inTime, shiftStart);
            if (extOt && Number(extOt.app_status) >= 1) {
              otHrs = hhmmToDecimal(extOt.ot_hrs);
            } else if (attendance && Number(attendance.hr_app_status) === 1 && attendance.ot_hrs) {
              otHrs = otHrsToDecimal(attendance.ot_hrs, attendance.in_time, attendance.out_time);
            }
            totalLateHrs += lateHrs;
            totalOTHrs += otHrs;
          }

          if (leaveInfo) {
            // Prefer leave_type from emp_attendance when available (more authoritative)
            const effectiveLeaveType = (attendance?.leave_type) || leaveInfo.type;
            const isHalfDayLeave = leaveInfo.daydt === 'HALF DAY' || leaveInfo.daydt === 'FIRST HALF' || leaveInfo.daydt === 'SECOND HALF';
            if (isHalfDayLeave) {
              if (hasSwipes) {
                // Half-day present + Half-day leave
                const suffix = effectiveLeaveType === 'CL' ? 'C' : effectiveLeaveType === 'EL' ? 'E' : 'L';
                dayStatus = 'F' + suffix; // e.g. FC, FE, FL based on actual leave_type
                totalPresent += 0.5;
                totalLeave += 0.5;
              } else {
                // Half-day leave but no swipes (Absent / LOP for the other half)
                dayStatus = effectiveLeaveType;
                totalLeave += 0.5;
                totalAbsent += 0.5;
                lopDays = 0.5;
              }
            } else {
              // Full-day leave
              dayStatus = effectiveLeaveType;
              totalLeave += 1;
            }
          } else {
            // No leave info
            if (hasSwipes) {
              if (inTime && outTime) {
                const lunch = schedule ? shiftLunchMap[schedule.shift_cd] : null;
                const swipedStatus = classifySwipedDay(inTime, outTime, shiftStart, lunch?.start, lunch?.end, shiftEnd);
                if (swipedStatus === 'Half Day') {
                  dayStatus = 'Half Day';
                  totalPresent += 0.5;
                  lopDays = 0.5;
                } else if (swipedStatus === 'Absent') {
                  dayStatus = 'Absent';
                  totalAbsent++;
                  lopDays = 1;
                } else {
                  dayStatus = 'Present';
                  totalPresent++;
                  if (lateHrs > 2) lopDays = lateHrs > 4 ? 1 : 0.5;
                }
              } else {
                dayStatus = 'Present';
                totalPresent++;
                if (lateHrs > 2) lopDays = lateHrs > 4 ? 1 : 0.5;
              }
            } else {
              dayStatus = 'Absent';
              totalAbsent++;
              lopDays = 1;
            }
          }
          totalLop += lopDays;
        }

        monthlyData.days.push({
          date: currentDate,
          dayOfWeek: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dayOfWeek],
          day: day,
          status: dayStatus,
          shift: shiftCd,
          in_time: inTime,
          out_time: outTime,
          // Exclude half-day arrivals (>=4h late = came in the afternoon) - not a late
          late_hrs: Math.round((lateHrs >= 4 ? 0 : lateHrs) * 100) / 100,
          ot_hrs: Math.round(otHrs * 100) / 100,
          lop: lopDays
        });
      }

      // Post-process the Weekly Off (W-Off) sandwich rule (match frontend: W-Off is absent unless adjacent to Present-like day)
      const presentLikeStatuses = ['Present', 'Half Day', 'FC', 'FE', 'FL'];
      for (let i = 0; i < monthlyData.days.length; i++) {
        if (monthlyData.days[i].status === 'W-Off') {
          let j = i;
          while (j + 1 < monthlyData.days.length && monthlyData.days[j + 1].status === 'W-Off') j++;
          const beforeDay = (i > 0) ? monthlyData.days[i - 1] : null;
          const beforeStatus = beforeDay ? beforeDay.status : 'Present';
          const afterDay = (j < monthlyData.days.length - 1) ? monthlyData.days[j + 1] : null;
          const afterStatus = afterDay ? afterDay.status : 'Present';
          const beforePresent = presentLikeStatuses.includes(beforeStatus);
          const afterPresent = presentLikeStatuses.includes(afterStatus);
          if (!beforePresent && !afterPresent) {
            for (let k = i; k <= j; k++) {
              monthlyData.days[k].status = 'Absent';
              monthlyData.days[k].lop = 1;
            }
          }
          i = j;
        }
      }

      // Re-sum the summary totals from post-processed daily status values
      totalPresent = 0;
      totalAbsent = 0;
      totalLeave = 0;
      totalWoff = 0;
      totalHoliday = 0;
      totalLop = 0;
      totalLateHrs = 0;
      totalOTHrs = 0;

      monthlyData.days.forEach(d => {
        const status = d.status;
        const lop = d.lop || 0;

        if (status === 'Present') {
          totalPresent++;
        } else if (status === 'Half Day') {
          totalPresent += 0.5;
        } else if (status === 'Absent') {
          totalAbsent++;
        } else if (status === 'W-Off') {
          totalWoff++;
        } else if (status === 'Holiday') {
          totalHoliday++;
        } else if (status === 'FC') {
          totalPresent += 0.5;
          totalLeave += 0.5;
        } else if (status === 'FE') {
          totalPresent += 0.5;
          totalLeave += 0.5;
        } else if (status === 'FL') {
          totalPresent += 0.5;
          totalLeave += 0.5;
        } else {
          // CL, EL, LOP, SL, etc.
          totalLeave += 1;
        }

        totalLop += lop;
        totalLateHrs += d.late_hrs || 0;
        totalOTHrs += d.ot_hrs || 0;
      });

      monthlyData.summary = {
        present: Math.round(totalPresent * 100) / 100,
        absent: Math.round(totalAbsent * 100) / 100,
        leave: Math.round(totalLeave * 100) / 100,
        woff: Math.round(totalWoff * 100) / 100,
        holiday: Math.round(totalHoliday * 100) / 100,
        lop: Math.round(totalLop * 100) / 100,
        late_hrs: Math.round(totalLateHrs * 100) / 100,
        ot_hrs: Math.round(totalOTHrs * 100) / 100,
        att_bonus: (totalLop === 0 && totalAbsent === 0 && totalLeave === 0) ? 'Yes' : 'No'
      };

      // Compute late coming deduction cost (mirrors payroll late-deduction rule)
      {
        const basic = parseFloat(emp.salary?.basic) || 0;
        const start = (doj && new Date(doj) > new Date(startDate)) ? new Date(doj) : new Date(startDate);
        const workingDays = Math.max(0, Math.round((new Date(endDate) - start) / (1000 * 60 * 60 * 24)) + 1);
        const perDayBasic = workingDays > 0 ? basic / workingDays : 0;
        const perHourBasic = perDayBasic / 8;
        let lateCost = 0;
        let firstLateDone = false;
        for (const d of monthlyData.days) {
          const decLate = hhmmToDecimal(d.late_hrs);
          // Exclude half-day arrivals (>=4h late = came in the afternoon) - not a late
          if (parseFloat(d.late_hrs) > 0 && decLate < 4) {
            if (!firstLateDone) { firstLateDone = true; continue; } // first late exempt
            const minsLate = Math.round(decLate * 60);
            if (minsLate <= 30) lateCost += perHourBasic; // within 30 min of shift start: 1-hour salary deduction
            else lateCost += perDayBasic / 2;
          }
        }
        monthlyData.late_cost = Math.round(lateCost);
      }

      musterData.push(monthlyData);
    }

    // Build category summary (Staff: 1-series empid, Trainee: 9-series empid)
    const categorySummary = [];
    const categories = [
      { label: 'Staff', prefix: '1' },
      { label: 'Trainee', prefix: '9' }
    ];
    for (const cat of categories) {
      const catEmployees = musterData.filter(e => String(e.empid).startsWith(cat.prefix));
      if (catEmployees.length === 0) continue;
      let totalDays = 0, totalOT = 0, bonusCount = 0;
      for (const emp of catEmployees) {
        const s = emp.summary || {};
        totalDays += (s.present || 0) + (s.absent || 0) + (s.leave || 0) + (s.woff || 0) + (s.holiday || 0);
        totalOT += s.ot_hrs || 0;
        if (s.att_bonus === 'Yes') bonusCount++;
      }
      categorySummary.push({
        category: cat.label,
        employeeCount: catEmployees.length,
        totalDays: Math.round(totalDays * 100) / 100,
        totalOT: Math.round(totalOT * 100) / 100,
        attendanceBonusCount: bonusCount
      });
    }

    res.json({ employees: musterData, categorySummary });
  } catch (error) {
    console.error('Error fetching muster roll:', error);
    res.status(500).json({ message: 'Error fetching muster roll', error: error.message });
  }
};

exports.saveMusterRollSummary = async (req, res) => {
  try {
    const { month, year, empid } = req.body;
    const monthNum = parseInt(month);
    const yearNum = parseInt(year);

    // Only allow saving for the immediately preceding month
    const curDate = new Date();
    const curMonth = curDate.getMonth() + 1;
    const curYear = curDate.getFullYear();
    const prevMonth = curMonth === 1 ? 12 : curMonth - 1;
    const prevYear = curMonth === 1 ? curYear - 1 : curYear;
    if (yearNum !== prevYear || monthNum !== prevMonth) {
      return res.status(400).json({ message: 'Muster roll summary can only be processed for the immediately preceding month' });
    }

    // Prevent overwriting the attendance summary once payroll is already processed/finalized
    const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    const monthStr = monthNames[monthNum - 1];
    const existingPayslip = await Payslip.count({
      where: { C_MONTH: monthStr, C_YEAR: yearNum }
    });
    if (existingPayslip > 0) {
      return res.status(400).json({ message: 'Salary already processed/finalized for this month. Attendance summary cannot be updated.' });
    }

    const daysInMonth = new Date(yearNum, monthNum, 0).getDate();
    const startDate = `${yearNum}-${String(monthNum).padStart(2, '0')}-01`;
    const endDate = `${yearNum}-${String(monthNum).padStart(2, '0')}-${String(daysInMonth).padStart(2, '0')}`;

    const whereEmployees = { is_active: true };
    if (empid && empid !== '') whereEmployees.empid = parseInt(empid);
    const employees = await EmployeeMaster.findAll({
      where: whereEmployees,
      order: [['empid', 'ASC']],
      include: [{ model: EmpSalary, as: 'salary', attributes: ['basic'] }]
    });

    const holidays = await Holiday.findAll({ where: { yr: String(yearNum) } });
    const holidayDates = holidays.map(h => h.hdate);

    const woffApps = await WoffApplication.findAll({
      where: {
        status: 'Approved',
        [Op.or]: [
          { woff_to_date: { [Sequelize.Op.between]: [startDate, endDate] } },
          { woff_from_date: { [Sequelize.Op.between]: [startDate, endDate] } }
        ]
      }
    });
    const woffDatesByEmp = {};
    const woffExcludeByEmp = {};
    woffApps.forEach(w => {
      const toDate = toLocalDateStr(w.woff_to_date);
      const fromDate = toLocalDateStr(w.woff_from_date);
      if (toDate) {
        if (!woffDatesByEmp[w.empid]) woffDatesByEmp[w.empid] = [];
        woffDatesByEmp[w.empid].push(toDate);
      }
      if (fromDate) {
        if (!woffExcludeByEmp[w.empid]) woffExcludeByEmp[w.empid] = [];
        woffExcludeByEmp[w.empid].push(fromDate);
      }
    });

    const attendanceData = await Attendance.findAll({
      where: { att_date: { [Sequelize.Op.between]: [startDate, endDate] } }
    });
    const attendanceMap = {};
    attendanceData.forEach(a => {
      if (!attendanceMap[a.empid]) attendanceMap[a.empid] = {};
      attendanceMap[a.empid][a.att_date] = a;
    });

    const leaveApprovalList = await LeaveApproval.findAll({
      where: {
        frmdt: { [Sequelize.Op.between]: [startDate, endDate] },
        app_status: 'Approved'
      }
    });
    const leaveDatesByEmp = {};
    leaveApprovalList.forEach(l => {
      const empId = l.empid;
      if (!leaveDatesByEmp[empId]) leaveDatesByEmp[empId] = {};
      const ltype = l.leave_type || 'EL';
      const daydt = l.daydt || 'FULL DAY';
      const dateKey = new Date(l.frmdt).toISOString().split('T')[0];
      leaveDatesByEmp[empId][dateKey] = { type: ltype, daydt: daydt };
    });

    const shiftSchedules = await ShiftSchedule.findAll({
      where: { shift_date: { [Sequelize.Op.between]: [startDate, endDate] } }
    });
    const scheduleMap = {};
    shiftSchedules.forEach(s => {
      const dateKey = toLocalDateStr(s.shift_date);
      if (!scheduleMap[s.empid]) scheduleMap[s.empid] = {};
      scheduleMap[s.empid][dateKey] = s;
    });

    const shiftMasters = await ShiftMaster.findAll();
    const shiftLunchMap = {};
    shiftMasters.forEach(sm => {
      shiftLunchMap[sm.shift_cd] = { start: sm.lunch_start_time, end: sm.lunch_end_time };
    });

    const extOtDataList = await ExtOt.findAll({
      where: { ot_date: { [Sequelize.Op.between]: [startDate, endDate] } }
    });
    const extOtMap = {};
    extOtDataList.forEach(e => {
      if (!extOtMap[e.empid]) extOtMap[e.empid] = {};
      extOtMap[e.empid][e.ot_date] = e;
    });

    let savedCount = 0;
    const now = new Date();

    for (const emp of employees) {
      const empId = emp.empid;
      const empOfficial = empId ? await EmpOfficial.findOne({ where: { empid: empId }, attributes: ['doj'] }) : null;
      const doj = empOfficial?.doj ? new Date(empOfficial.doj).toISOString().split('T')[0] : null;

      const data = computeSingleEmployeeMuster(
        empId, daysInMonth, yearNum, monthNum, startDate, endDate,
        scheduleMap[empId] || {}, attendanceMap[empId] || {},
        woffDatesByEmp[empId] || [], woffExcludeByEmp[empId] || [],
        leaveDatesByEmp[empId] || {},
        extOtMap[empId] || {}, holidayDates, doj, shiftLunchMap
      );

      let clDays = 0, elDays = 0;
      data.dayStatuses.forEach(s => {
        if (s === 'CL' || s === 'FC') clDays += s === 'FC' ? 0.5 : 1;
        else if (s === 'EL' || s === 'FE') elDays += s === 'FE' ? 0.5 : 1;
        else if (!['Present', 'Half Day', 'Absent', 'W-Off', 'Holiday', 'LOP', ''].includes(s)) {
          elDays += 1; // SL, ML, Leave, or any other paid leave → counted as EL
        }
      });

      await MusterRollSummary.upsert({
        empid: empId,
        year: yearNum,
        month: monthNum,
        present_days: data.summary.present,
        woff_days: data.summary.woff,
        holiday_days: data.summary.holiday,
        cl_days: clDays,
        el_days: elDays,
        lop_days: data.summary.lop,
        absent_days: data.summary.absent,
        total_days: data.summary.present + data.summary.woff + data.summary.holiday + clDays + elDays,
        ot_hours: data.summary.ot_hrs,
        late_hours: data.summary.late_hrs,
        att_bonus: data.summary.att_bonus === 'Yes' ? 'Y' : 'N',
        updated_at: now
      });

      savedCount++;
    }

    res.json({ message: `Muster roll summary saved for ${savedCount} employees`, count: savedCount });
  } catch (error) {
    console.error('Error saving muster roll summary:', error);
    res.status(500).json({ message: 'Error saving muster roll summary', error: error.message });
  }
};

function computeSingleEmployeeMuster(empId, daysInMonth, yearNum, monthNum, startDate, endDate, empSchedule, empAttendance, empWoffs, empWoffExclude, empLeaves, empExtOt, holidayDates, doj, shiftLunchMap = {}) {
  const monthlyData = { days: [] };
  let totalPresent = 0, totalAbsent = 0, totalLeave = 0, totalWoff = 0, totalHoliday = 0, totalLop = 0, totalLateHrs = 0, totalOTHrs = 0;

  const dayStatuses = [];

  for (let day = 1; day <= daysInMonth; day++) {
    const currentDate = `${yearNum}-${String(monthNum).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayOfWeek = new Date(yearNum, monthNum - 1, day).getDay();

    if (doj && currentDate < doj) {
      monthlyData.days.push({
        date: currentDate, dayOfWeek, day, status: '', shift: '-',
        in_time: null, out_time: null, late_hrs: 0, ot_hrs: 0, lop: 0
      });
      dayStatuses.push('');
      continue;
    }

    const schedule = empSchedule[currentDate];
    const attendance = empAttendance[currentDate];
    const isHoliday = holidayDates.includes(currentDate);
    const isWoff = empWoffs.includes(currentDate) || (dayOfWeek === 0 && !empWoffExclude.includes(currentDate));
    const leaveInfo = empLeaves[currentDate];

    let dayStatus = 'Absent';
    let lateHrs = 0, otHrs = 0, lopDays = 0;

    const extOt = empExtOt[currentDate];
    let inTime = attendance?.in_time || null;
    let outTime = attendance?.out_time || null;
    if (extOt) {
      if (!inTime && extOt.in_time) inTime = extOt.in_time;
      if (!outTime && extOt.out_time) outTime = extOt.out_time;
    }

    if (isHoliday) {
      if (inTime || outTime) {
        dayStatus = 'Holiday'; totalHoliday++;
        if (extOt && Number(extOt.app_status) >= 1) {
          otHrs = hhmmToDecimal(extOt.ot_hrs);
        } else if (attendance && Number(attendance.hr_app_status) === 1 && attendance.ot_hrs) {
          otHrs = otHrsToDecimal(attendance.ot_hrs, attendance.in_time, attendance.out_time);
        }
        totalOTHrs += otHrs;
      } else {
        dayStatus = 'Holiday'; totalHoliday++;
      }
    } else if (isWoff && !leaveInfo) {
      if (inTime || outTime) {
        dayStatus = 'W-Off'; totalWoff++;
        if (extOt && Number(extOt.app_status) >= 1) {
          otHrs = hhmmToDecimal(extOt.ot_hrs);
        } else if (attendance && Number(attendance.hr_app_status) === 1 && attendance.ot_hrs) {
          otHrs = otHrsToDecimal(attendance.ot_hrs, attendance.in_time, attendance.out_time);
        }
        totalOTHrs += otHrs;
      } else {
        dayStatus = 'W-Off'; totalWoff++;
      }
    } else if (extOt && extOt.ot_type === 'HalfDay' && Number(extOt.app_status) >= 1) {
      dayStatus = 'Half Day'; totalPresent += 0.5;
      if (inTime) lateHrs = calculateLateHrs(inTime, schedule?.shift_start_time || '09:00');
      otHrs = hhmmToDecimal(extOt.ot_hrs);
      totalLateHrs += lateHrs; totalOTHrs += otHrs;
    } else if (leaveInfo || schedule || attendance) {
      const shiftStart = schedule?.shift_start_time || '09:00';
      let shiftEnd = schedule?.shift_end_time || '17:30';
      if (getTimeMins(shiftEnd) === 1080) shiftEnd = '17:30';
      const hasSwipes = !!(inTime || outTime);
      if (hasSwipes) {
        if (inTime) lateHrs = calculateLateHrs(inTime, shiftStart);
        if (extOt && Number(extOt.app_status) >= 1) {
          otHrs = hhmmToDecimal(extOt.ot_hrs);
        } else if (attendance && Number(attendance.hr_app_status) === 1 && attendance.ot_hrs) {
          otHrs = otHrsToDecimal(attendance.ot_hrs, attendance.in_time, attendance.out_time);
        }
        totalLateHrs += lateHrs; totalOTHrs += otHrs;
      }

      if (leaveInfo) {
        const effectiveLeaveType = (attendance?.leave_type) || leaveInfo.type;
        const isHalfDayLeave = leaveInfo.daydt === 'HALF DAY' || leaveInfo.daydt === 'FIRST HALF' || leaveInfo.daydt === 'SECOND HALF';
        if (isHalfDayLeave) {
          if (hasSwipes) {
            const suffix = effectiveLeaveType === 'CL' ? 'C' : effectiveLeaveType === 'EL' ? 'E' : 'L';
            dayStatus = 'F' + suffix;
            totalPresent += 0.5; totalLeave += 0.5;
          } else {
            dayStatus = effectiveLeaveType; totalLeave += 0.5; totalAbsent += 0.5; lopDays = 0.5;
          }
        } else {
          dayStatus = effectiveLeaveType; totalLeave += 1;
        }
      } else {
        if (hasSwipes) {
          if (inTime && outTime) {
            const shiftEnd = schedule?.shift_end_time || '17:30';
            const shiftStart = schedule?.shift_start_time || '09:00';
            const lunch = schedule ? shiftLunchMap[schedule.shift_cd] : null;
            const swipedStatus = classifySwipedDay(inTime, outTime, shiftStart, lunch?.start, lunch?.end, shiftEnd);
            if (swipedStatus === 'Half Day') {
              dayStatus = 'Half Day'; totalPresent += 0.5; lopDays = 0.5;
            } else if (swipedStatus === 'Absent') {
              dayStatus = 'Absent'; totalAbsent++; lopDays = 1;
            } else {
              dayStatus = 'Present'; totalPresent++;
              if (lateHrs > 2) lopDays = lateHrs > 4 ? 1 : 0.5;
            }
          } else {
            dayStatus = 'Present'; totalPresent++;
            if (lateHrs > 2) lopDays = lateHrs > 4 ? 1 : 0.5;
          }
        } else {
          dayStatus = 'Absent'; totalAbsent++; lopDays = 1;
        }
      }
      totalLop += lopDays;
    }

    monthlyData.days.push({
      date: currentDate, dayOfWeek: ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][dayOfWeek],
      day, status: dayStatus, shift: schedule?.shift_cd || '-',
      in_time: inTime, out_time: outTime,
      // Exclude half-day arrivals (>=4h late = came in the afternoon) - not a late
      late_hrs: Math.round((lateHrs >= 4 ? 0 : lateHrs) * 100) / 100,
      ot_hrs: Math.round(otHrs * 100) / 100,
      lop: lopDays
    });
    dayStatuses.push(dayStatus);

    // Re-sum final status (same as getMusterRoll summary logic)
    // The dayStatuses are collected above; we'll recompute summary below
  }

  // W-Off sandwich rule (matches frontend logic: W-Off is absent unless adjacent to a Present-like day)
  const presentLikeStatuses = ['Present', 'Half Day', 'FC', 'FE', 'FL'];
  for (let i = 0; i < monthlyData.days.length; i++) {
    if (monthlyData.days[i].status === 'W-Off') {
      let j = i;
      while (j + 1 < monthlyData.days.length && monthlyData.days[j + 1].status === 'W-Off') j++;
      const beforeStatus = (i > 0) ? monthlyData.days[i - 1].status : 'Present';
      const afterStatus = (j < monthlyData.days.length - 1) ? monthlyData.days[j + 1].status : 'Present';
      const beforePresent = presentLikeStatuses.includes(beforeStatus);
      const afterPresent = presentLikeStatuses.includes(afterStatus);
      if (!beforePresent && !afterPresent) {
        for (let k = i; k <= j; k++) {
          monthlyData.days[k].status = 'Absent';
          monthlyData.days[k].lop = 1;
          dayStatuses[k] = 'Absent';
        }
      }
      i = j;
    }
  }

  // Re-summarize
  totalPresent = 0; totalAbsent = 0; totalLeave = 0; totalWoff = 0;
  totalHoliday = 0; totalLop = 0; totalLateHrs = 0; totalOTHrs = 0;

  monthlyData.days.forEach((d, idx) => {
    const status = d.status;
    const lop = d.lop || 0;
    if (status === 'Present') totalPresent++;
    else if (status === 'Half Day') totalPresent += 0.5;
    else if (status === 'Absent') totalAbsent++;
    else if (status === 'W-Off') totalWoff++;
    else if (status === 'Holiday') totalHoliday++;
    else if (status === 'FC') { totalPresent += 0.5; totalLeave += 0.5; }
    else if (status === 'FE') { totalPresent += 0.5; totalLeave += 0.5; }
    else if (status === 'FL') { totalPresent += 0.5; totalLeave += 0.5; }
    else totalLeave += 1; // CL, EL, SL, etc.
    totalLop += lop;
    totalLateHrs += d.late_hrs || 0;
    totalOTHrs += d.ot_hrs || 0;
    // Update dayStatuses to reflect post-processed statuses
    dayStatuses[idx] = status;
  });

  return {
    dayStatuses,
    summary: {
      present: Math.round(totalPresent * 100) / 100,
      absent: Math.round(totalAbsent * 100) / 100,
      leave: Math.round(totalLeave * 100) / 100,
      woff: Math.round(totalWoff * 100) / 100,
      holiday: Math.round(totalHoliday * 100) / 100,
      lop: Math.round(totalLop * 100) / 100,
      late_hrs: Math.round(totalLateHrs * 100) / 100,
      ot_hrs: Math.round(totalOTHrs * 100) / 100,
      att_bonus: (totalLop === 0 && totalAbsent === 0 && totalLeave === 0) ? 'Yes' : 'No'
    }
  };
}

exports.getOTForApproval = async (req, res) => {
  try {
    const { month, year, status, empid, startDate, endDate } = req.query;

    let fromDate, toDate;
    if (startDate && endDate) {
      fromDate = startDate;
      toDate = endDate;
    } else if (month && year) {
      const monthNum = parseInt(month);
      const yearNum = parseInt(year);
      fromDate = `${yearNum}-${String(monthNum).padStart(2, '0')}-01`;
      const lastDay = new Date(yearNum, monthNum, 0).getDate();
      toDate = `${yearNum}-${String(monthNum).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
    } else {
      const today = new Date().toISOString().slice(0, 10);
      fromDate = today;
      toDate = today;
    }

    const where = {
      att_date: { [Sequelize.Op.between]: [fromDate, toDate] },
      ot_hrs: { [Sequelize.Op.gt]: 0 }
    };

    if (empid) {
      where.empid = parseInt(empid);
    }

    // Show all OT records for approval (don't filter by status in query)
    // Frontend will show appropriate records based on status field

    if (status === 'pending') {
      where.app_status = { [Sequelize.Or]: [null, 0] };
    } else if (status === 'approved') {
      where.app_status = 1;
    } else if (status === 'hr-approved') {
      where.hr_app_status = 1;
    }

    const otData = await Attendance.findAll({
      where,
      include: [{
        model: EmployeeMaster,
        as: 'employee',
        required: true,
        attributes: ['empid', 'ename', 'deptname', 'secname']
      }],
      order: [['att_date', 'ASC'], ['empid', 'ASC']],
      subQuery: false
    });

    // Filter: Only show employees with OT applicable
    const otEmpIds = otData.map(a => a.empid);
    const salaries = await EmpSalary.findAll({
      where: { empid: otEmpIds, IS_ot: 'Y' },
      attributes: ['empid']
    });
    const otEligibleEmpIds = new Set(salaries.map(s => s.empid));

    const filteredData = otData.filter(a => otEligibleEmpIds.has(a.empid));

    const groupedData = filteredData.map(a => {
      const otDecimal = otHrsToDecimal(a.ot_hrs, a.in_time, a.out_time);
      const computedAppOt = decimalToHHMM(otDecimal);
      return {
        id: a.id,
        empid: a.empid,
        empName: a.employee?.ename || '',
        department: a.employee?.deptname || '',
        designation: a.employee?.secname || '',
        unit: a.employee?.unit_id || '',
        date: a.att_date,
        ot_hrs: otDecimal,
        app_ot: computedAppOt,
        app_status: a.app_status,
        app_remarks: a.app_remarks || '',
        hr_app_ot: computedAppOt,
        hr_app_status: a.hr_app_status,
        hr_remarks: a.hr_remarks || '',
        final_status: a.final_status,
        status: a.status
      };
    });

    res.json(groupedData);
  } catch (error) {
    console.error('Error fetching OT for approval:', error);
    res.status(500).json({ message: 'Error fetching OT for approval', error: error.message });
  }
};

exports.approveOT = async (req, res) => {
  try {
    const { id } = req.params;
    const { app_ot, app_status, app_remarks, hr_app_ot, hr_app_status, hr_remarks, auto_approve_hr } = req.body;

    console.log('Approve OT request:', { id, app_ot, app_status, hr_app_ot, hr_app_status, auto_approve_hr });

    const existing = await Attendance.findByPk(id);
    if (!existing) {
      return res.status(404).json({ message: 'Record not found' });
    }

    const isHolidayOt = existing.status === 'Holiday+OT' || existing.status === 'W-Off+OT' || existing.holiday === true;

    // If HR approval, manager must be approved first (unless auto_approve_hr flag for Holiday/W-off)
    if (hr_app_status === 1 && app_status !== 1 && !auto_approve_hr) {
      return res.status(400).json({ message: 'Manager must approve first before HR approval' });
    }

    const updateData = {};
    if (app_status !== undefined) updateData.app_status = app_status;
    if (app_remarks !== undefined) updateData.app_remarks = app_remarks;
    if (hr_app_status !== undefined) updateData.hr_app_status = hr_app_status;
    if (hr_remarks !== undefined) updateData.hr_remarks = hr_remarks;

    // Set Manager OT - convert hours to time format
    if (app_ot !== undefined && app_ot !== null && app_ot !== '') {
      updateData.app_ot = parseOtValueToHHMM(app_ot, existing.ot_hrs);
    } else if (app_status === 1 && existing.ot_hrs) {
      updateData.app_ot = decimalToHHMM(otHrsToDecimal(existing.ot_hrs, existing.in_time, existing.out_time));
    }

    // Set HR OT
    if (hr_app_ot !== undefined && hr_app_ot !== null && hr_app_ot !== '') {
      updateData.hr_app_ot = parseOtValueToHHMM(hr_app_ot, existing.ot_hrs);
    }

    // Auto-approve HR when manager approves Holiday/W-off OT
    if (auto_approve_hr && app_status === 1 && isHolidayOt) {
      updateData.hr_app_status = 1;
      const otVal = updateData.app_ot || existing.app_ot || existing.ot_hrs;
      if (otVal) {
        updateData.hr_app_ot = parseOtValueToHHMM(otVal, existing.ot_hrs);
      }
    }

    if (app_status === 1 && hr_app_status === 1) {
      updateData.final_status = 1;
    } else {
      updateData.final_status = 0;
    }

    await Attendance.update(updateData, { where: { id } });
    res.json({ message: 'OT approval updated successfully' });
  } catch (error) {
    console.error('Error updating OT approval:', error);
    res.status(500).json({ message: 'Error updating OT approval', error: error.message });
  }
};

exports.bulkApproveOT = async (req, res) => {
  const t = await Attendance.sequelize.transaction();
  try {
    const { records } = req.body;

    if (records && Array.isArray(records)) {
      let successCount = 0;
      for (const record of records) {
        try {
          const { id, app_ot: recAppOt, app_status: recAppStatus, app_remarks: recAppRemarks, hr_app_ot: recHrOt, hr_app_status: recHrStatus, hr_remarks: recHrRemarks, auto_approve_hr: recAutoApprove } = record;
          const existing = await Attendance.findByPk(id);
          if (!existing) continue;

          const isHolidayOt = existing.status === 'Holiday+OT' || existing.status === 'W-Off+OT' || existing.holiday === true;

          const updateData = {};
          if (recAppStatus !== undefined) updateData.app_status = recAppStatus;
          if (recAppRemarks !== undefined) updateData.app_remarks = recAppRemarks;
          if (recHrStatus !== undefined) updateData.hr_app_status = recHrStatus;
          if (recHrRemarks !== undefined) updateData.hr_remarks = recHrRemarks;

          if (recAppOt !== undefined && recAppOt !== null && recAppOt !== "") {
            updateData.app_ot = parseOtValueToHHMM(recAppOt, existing.ot_hrs);
          } else if (recAppStatus === 1 && existing.ot_hrs) {
            updateData.app_ot = decimalToHHMM(otHrsToDecimal(existing.ot_hrs, existing.in_time, existing.out_time));
          }

          if (recHrOt !== undefined && recHrOt !== null && recHrOt !== "") {
            updateData.hr_app_ot = parseOtValueToHHMM(recHrOt, existing.ot_hrs);
          }

          if (recAutoApprove && updateData.app_status === 1 && isHolidayOt) {
            updateData.hr_app_status = 1;
            const otVal = updateData.app_ot || existing.app_ot || existing.ot_hrs;
            if (otVal) {
              updateData.hr_app_ot = parseOtValueToHHMM(otVal, existing.ot_hrs);
            }
          }

          if (updateData.app_status === 1 && updateData.hr_app_status === 1) {
            updateData.final_status = 1;
          } else {
            updateData.final_status = 0;
          }

          await Attendance.update(updateData, { where: { id }, transaction: t });
          successCount++;
        } catch (err) {
          console.error("Error updating record:", err);
        }
      }
      await t.commit();
      return res.json({ message: `Bulk approval completed: ${successCount} records updated` });
    }

    return res.status(400).json({ message: 'Invalid request' });
  } catch (error) {
    await t.rollback();
    console.error('Error in bulk OT approval:', error);
    res.status(500).json({ message: 'Error in bulk OT approval', error: error.message });
  }
};

exports.getLateReport = async (req, res) => {
  try {
    const { month, year, lateOnly } = req.query;

    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const endDate = `${year}-${String(month).padStart(2, '0')}-31`;

    const where = {
      att_date: { [Op.between]: [startDate, endDate] }
    };

    if (lateOnly) {
      // Exclude half-day arrivals (>=4h late = came in the afternoon) - not a late
      where.late_hrs = { [Op.gt]: 0, [Op.lt]: 4 };
    }

    const attendanceData = await Attendance.findAll({
      where,
      include: [{ model: EmployeeMaster, as: 'employee', attributes: ['ename', 'deptname'] }],
      order: [['att_date', 'ASC'], ['empid', 'ASC']]
    });

    const result = attendanceData.map(r => ({
      att_date: r.att_date,
      empid: r.empid,
      ename: r.employee?.ename || '',
      deptname: r.employee?.deptname || '',
      in_time: r.in_time,
      out_time: r.out_time,
      shift_start: r.shift_start,
      shift_end: r.shift_end,
      late_hrs: r.late_hrs,
      late_ded: r.late_ded || 0
    }));

    res.json(result);
  } catch (error) {
    console.error('Error fetching late report:', error);
    res.status(500).json({ message: 'Error fetching late report' });
  }
};
