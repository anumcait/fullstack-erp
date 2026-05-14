const { ShiftChange, ShiftMaster, ShiftSchedule, EmployeeMaster, Attendance, Holiday, EmpSalary, WoffApplication, Payslip } = require('../../models');
const { Sequelize, Op } = require('sequelize');

exports.saveSChange = async (req, res) => {
  const application = req.body;
  const { empid, schange_from, act_shift, change_shift } = application;
  
  if (!empid || !schange_from || !act_shift || !change_shift) {
    return res.status(400).json({ message: 'Missing required fields: Emp ID, Date, Actual Shift, and Change Shift are mandatory.' });
  }

  try {
    // 🛑 Check if any payslip is already generated for this employee (Find Max Month/Year)
    const [y, m, d] = schange_from.split('-').map(Number);
    const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    const monthMap = {};
    monthNames.forEach((name, idx) => { monthMap[name] = idx + 1; });

    const monthOrder = `CASE 
      WHEN "C_MONTH" IN ('JAN','JANUARY','01','1') THEN 1
      WHEN "C_MONTH" IN ('FEB','FEBRUARY','02','2') THEN 2
      WHEN "C_MONTH" IN ('MAR','MARCH','03','3') THEN 3
      WHEN "C_MONTH" IN ('APR','APRIL','04','4') THEN 4
      WHEN "C_MONTH" IN ('MAY','MAY','05','5') THEN 5
      WHEN "C_MONTH" IN ('JUN','JUNE','06','6') THEN 6
      WHEN "C_MONTH" IN ('JUL','JULY','07','7') THEN 7
      WHEN "C_MONTH" IN ('AUG','AUGUST','08','8') THEN 8
      WHEN "C_MONTH" IN ('SEP','SEPTEMBER','09','9') THEN 9
      WHEN "C_MONTH" IN ('OCT','OCTOBER','10','10') THEN 10
      WHEN "C_MONTH" IN ('NOV','NOVEMBER','11','11') THEN 11
      WHEN "C_MONTH" IN ('DEC','DECEMBER','12','12') THEN 12
      ELSE 0 END`;

    const latestPayslip = await Payslip.findOne({
      attributes: ['C_MONTH', 'C_YEAR'],
      order: [['C_YEAR', 'DESC'], [Sequelize.literal(monthOrder), 'DESC']],
      raw: true
    });

    if (latestPayslip) {
      const finalMonthStr = (latestPayslip.C_MONTH || "").trim().toUpperCase();
      const latestMonthNum = monthMap[finalMonthStr] || 0;
      const latestYearNum = Number(latestPayslip.C_YEAR);
      const isClosed = (y < latestYearNum) || (y === latestYearNum && m <= latestMonthNum);

      if (isClosed) {
        return res.status(400).json({ 
          message: `Cannot apply for Shift Change. Payroll already processed up to ${finalMonthStr} ${latestYearNum}.` 
        });
      }
    }
    const existing = await ShiftChange.findOne({
      where: {
        empid,
        schange_from,
        app_status: ['Pending', 'Approved']
      }
    });

    if (existing) {
      return res.status(400).json({ message: `A shift change application already exists for ${schange_from}.` });
    }

    const t = await ShiftChange.sequelize.transaction();
    try {
      const maxIdResult = await ShiftChange.findOne({
        attributes: [
          [Sequelize.fn('COALESCE', Sequelize.fn('MAX', Sequelize.col('schange_no')), 0), 'maxId']
        ],
        raw: true
      });

      const nextSchangeId = Number(maxIdResult.maxId) + 1;
      application.schange_no = nextSchangeId;
      application.app_status = 'Pending';

      await ShiftChange.create(application, { transaction: t });
      await t.commit();

      res.status(201).json({ message: 'Shift change application saved.', movement_id: nextSchangeId });
    } catch (innerError) {
      await t.rollback();
      throw innerError;
    }
  } catch (error) {
    console.error('❌ Error saving Shiftchange application:', error);
    res.status(500).json({ message: 'Failed to save Shift change application.', error: error.message });
  }
};

exports.getNextSchangeNumber = async (req, res) => {
  try {
    const maxId = await ShiftChange.max('schange_no');
    const nextId = (maxId || 0) + 1;
    console.log('nextId:',nextId);
    res.json({ nextSchangeId: nextId });
  } catch (error) {
    console.error('❌ Error fetching next schange_no:', error);
    res.status(500).json({ message: 'Failed to get next Shift Change ID.' });
  }
};

exports.getAllSchangeApplications = async (req, res) => {
  try {
    const { empid, schange_from, schange_to } = req.query;
    const where = {};

    if (empid) where.empid = empid;
    if (schange_from && schange_to) where.schange_date = { [Sequelize.Op.between]: [schange_from, schange_to] };

    const data = await ShiftChange.findAll({
      where,
      order: [['schange_no', 'DESC']]
    });

    res.json(data);
  } catch (error) {
    console.error('❌ Error fetching Schange applications:', error);
    res.status(500).json({ message: 'Failed to fetch Schange data.' });
  }
};

// ==================== Shift Master CRUD ====================
exports.getAllShifts = async (req, res) => {
  try {
    const shifts = await ShiftMaster.findAll({ order: [['shift_id', 'ASC']] });
    res.json(shifts);
  } catch (error) {
    console.error('Error fetching shifts:', error);
    res.status(500).json({ message: 'Error fetching shifts' });
  }
};

exports.saveShift = async (req, res) => {
  try {
    const shiftData = req.body;
    await ShiftMaster.upsert(shiftData);
    res.json({ message: 'Shift saved successfully' });
  } catch (error) {
    console.error('Error saving shift:', error);
    res.status(500).json({ message: 'Error saving shift' });
  }
};

exports.deleteShift = async (req, res) => {
  try {
    const { shift_id } = req.params;
    await ShiftMaster.destroy({ where: { shift_id } });
    res.json({ message: 'Shift deleted successfully' });
  } catch (error) {
    console.error('Error deleting shift:', error);
    res.status(500).json({ message: 'Error deleting shift' });
  }
};

exports.getNextShiftId = async (req, res) => {
  try {
    const maxResult = await ShiftMaster.findOne({
      attributes: [[Sequelize.fn('MAX', Sequelize.col('shift_id')), 'maxId']],
      raw: true
    });
    const nextId = (maxResult && maxResult.maxId) ? parseInt(maxResult.maxId) + 1 : 1;
    res.json({ shift_id: nextId });
  } catch (error) {
    console.error('Error getting next shift_id:', error);
    res.status(500).json({ message: 'Error getting next shift ID' });
  }
};

// ==================== Shift Schedule CRUD ====================
exports.getAllSchedules = async (req, res) => {
  try {
    const { empid, startDate, endDate } = req.query;
    console.log('getAllSchedules called with:', { empid, startDate, endDate });
    
    let where = {};
    if (empid && empid !== "") where.empid = parseInt(empid);
    
    // Add date range filtering to the where clause instead of filtering in memory
    if (startDate && endDate) {
      where.shift_date = {
        [Op.between]: [startDate, endDate]
      };
    }
    
    console.log('Where clause:', JSON.stringify(where));
    
    const schedules = await ShiftSchedule.findAll({
      where,
      include: [{ model: EmployeeMaster, as: 'employee', attributes: ['ename'], required: false }],
      order: [['shift_date', 'ASC'], ['empid', 'ASC']],
      raw: false
    });
    
    console.log('Found schedules:', schedules.length);
    res.json(schedules);
  } catch (error) {
    console.error('Error fetching schedules:', error);
    res.status(500).json({ message: 'Error fetching schedules', error: error.message });
  }
};

exports.saveSchedule = async (req, res) => {
  const t = await ShiftSchedule.sequelize.transaction();
  try {
    const scheduleData = { ...req.body };
    if (scheduleData.shift_start_time && typeof scheduleData.shift_start_time === 'string' && scheduleData.shift_start_time.includes(':')) {
      const [h, m] = scheduleData.shift_start_time.split(':');
      scheduleData.shift_start_time = new Date(2000, 0, 1, h, m);
    }
    if (scheduleData.shift_end_time && typeof scheduleData.shift_end_time === 'string' && scheduleData.shift_end_time.includes(':')) {
      const [h, m] = scheduleData.shift_end_time.split(':');
      scheduleData.shift_end_time = new Date(2000, 0, 1, h, m);
    }

    // Prevent duplicates: find by empid and shift_date
    const existing = await ShiftSchedule.findOne({
      where: { empid: scheduleData.empid, shift_date: scheduleData.shift_date },
      transaction: t
    });

    if (existing) {
      await existing.update(scheduleData, { transaction: t });
    } else {
      await ShiftSchedule.create(scheduleData, { transaction: t });
    }

    // Sync with Attendance table
    const attData = {
      empid: scheduleData.empid,
      att_date: scheduleData.shift_date,
      shift: scheduleData.shift_cd,
      shift_start: scheduleData.shift_start_time ? 
                   `${scheduleData.shift_start_time.getHours()}:${scheduleData.shift_start_time.getMinutes()}` : null,
      shift_end: scheduleData.shift_end_time ? 
                 `${scheduleData.shift_end_time.getHours()}:${scheduleData.shift_end_time.getMinutes()}` : null,
      status: scheduleData.shift_cd === 'W' ? 'W' : (scheduleData.shift_cd === 'H' ? 'H' : 'P'),
      woff_day: scheduleData.shift_cd === 'W' ? 1.0 : 0.0,
      holiday: scheduleData.shift_cd === 'H'
    };

    const existingAtt = await Attendance.findOne({
      where: { empid: attData.empid, att_date: attData.att_date },
      transaction: t
    });

    if (existingAtt) {
      await existingAtt.update(attData, { transaction: t });
    } else {
      await Attendance.create(attData, { transaction: t });
    }

    await t.commit();
    res.json({ message: 'Schedule saved and synced with attendance successfully' });
  } catch (error) {
    if (t) await t.rollback();
    console.error('Error saving schedule:', error);
    res.status(500).json({ message: 'Error saving schedule', error: error.message });
  }
};

exports.saveBulkSchedules = async (req, res) => {
  const t = await ShiftSchedule.sequelize.transaction();
  try {
    const rawSchedules = req.body;
    for (const s of rawSchedules) {
      const scheduleData = { ...s };
      if (scheduleData.shift_start_time && typeof scheduleData.shift_start_time === 'string' && scheduleData.shift_start_time.includes(':')) {
        const [h, m] = scheduleData.shift_start_time.split(':');
        scheduleData.shift_start_time = new Date(2000, 0, 1, h, m);
      }
      if (scheduleData.shift_end_time && typeof scheduleData.shift_end_time === 'string' && scheduleData.shift_end_time.includes(':')) {
        const [h, m] = scheduleData.shift_end_time.split(':');
        scheduleData.shift_end_time = new Date(2000, 0, 1, h, m);
      }

      // 1. Save/Update ShiftSchedule
      const existing = await ShiftSchedule.findOne({
        where: { empid: scheduleData.empid, shift_date: scheduleData.shift_date },
        transaction: t
      });

      if (existing) {
        await existing.update(scheduleData, { transaction: t });
      } else {
        await ShiftSchedule.create(scheduleData, { transaction: t });
      }

      // 2. Sync with Attendance
      const attData = {
        empid: scheduleData.empid,
        att_date: scheduleData.shift_date,
        shift: scheduleData.shift_cd,
        shift_start: scheduleData.shift_start_time && typeof scheduleData.shift_start_time.getHours === 'function' ? 
                     `${String(scheduleData.shift_start_time.getHours()).padStart(2,'0')}:${String(scheduleData.shift_start_time.getMinutes()).padStart(2,'0')}` : null,
        shift_end: scheduleData.shift_end_time && typeof scheduleData.shift_end_time.getHours === 'function' ? 
                   `${String(scheduleData.shift_end_time.getHours()).padStart(2,'0')}:${String(scheduleData.shift_end_time.getMinutes()).padStart(2,'0')}` : null,
        status: scheduleData.shift_cd === 'W' ? 'W' : (scheduleData.shift_cd === 'H' ? 'H' : 'P'),
        woff_day: scheduleData.shift_cd === 'W' ? 1.0 : 0.0,
        holiday: scheduleData.shift_cd === 'H'
      };

      const existingAtt = await Attendance.findOne({
        where: { empid: attData.empid, att_date: attData.att_date },
        transaction: t
      });

      if (existingAtt) {
        await existingAtt.update(attData, { transaction: t });
      } else {
        await Attendance.create(attData, { transaction: t });
      }
    }

    await t.commit();
    res.json({ message: 'Bulk schedules saved and synced successfully', count: rawSchedules.length });
  } catch (error) {
    if (t) await t.rollback();
    console.error('Error saving bulk schedules:', error);
    res.status(500).json({ message: 'Error saving bulk schedules', error: error.message });
  }
};

exports.deleteSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    await ShiftSchedule.destroy({ where: { id } });
    res.json({ message: 'Schedule deleted successfully' });
  } catch (error) {
    console.error('Error deleting schedule:', error);
    res.status(500).json({ message: 'Error deleting schedule' });
  }
};

exports.generateMonthlyData = async (req, res) => {
  const t = await ShiftSchedule.sequelize.transaction();
  
  try {
    const { year, month, regenerate = false } = req.body;
    
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const endDate = `${year}-${String(month).padStart(2, '0')}-${lastDay}`;
    
    const existingSchedules = await ShiftSchedule.findAll({
      where: {
        shift_date: { [Sequelize.Op.between]: [startDate, endDate] }
      },
      attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('empid')), 'empid']],
      raw: true
    });
    
    const existingEmps = existingSchedules.map(s => s.empid);
    
    if (existingEmps.length > 0 && !regenerate) {
      return res.status(400).json({ 
        message: `Data already exists for ${month}/${year}. Use regenerate=true to overwrite.`,
        existingCount: existingEmps.length
      });
    }
    
    if (regenerate) {
      await ShiftSchedule.destroy({
        where: { shift_date: { [Sequelize.Op.between]: [startDate, endDate] } },
        transaction: t
      });
      await Attendance.destroy({
        where: { att_date: { [Sequelize.Op.between]: [startDate, endDate] } },
        transaction: t
      });
    }
    
    const employees = await EmployeeMaster.findAll({
      where: { status: 'Active' }
    });
    
    const holidays = await Holiday.findAll({
      where: { yr: year }
    });
    const holidayDates = holidays.map(h => {
      const d = new Date(h.hdate);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    });
    
    const fixedSalaries = {
      1002: { basic: 13375, hra: 9338, ca: 2677, wa: 1360 },
      1005: { basic: 13000, hra: 9070, ca: 2602, wa: 1328 },
      1006: { basic: 9375, hra: 6543, ca: 1877, wa: 955 },
      1009: { basic: 5625, hra: 3938, ca: 1125, wa: 563 },
      1010: { basic: 7750, hra: 5425, ca: 1550, wa: 775 },
      1003: { basic: 17000, hra: 11870, ca: 3403, wa: 1727, ot: true },
      1016: { basic: 7500, hra: 5250, ca: 1500, wa: 750 },
      1019: { basic: 9000, hra: 6280, ca: 1800, wa: 920 },
      1021: { basic: 7500, hra: 5220, ca: 1500, wa: 780 },
      1022: { basic: 10000, hra: 6000, ca: 3000, wa: 1000 },
      1024: { basic: 13500, hra: 9425, ca: 2700, wa: 1375 },
      1025: { basic: 8000, hra: 5600, ca: 1600, wa: 800, ot: true },
      1026: { basic: 5000, hra: 3500, ca: 1000, wa: 500, ot: true },
      1027: { basic: 17200, hra: 15050, ca: 8600, wa: 2150 }
    };
    
    const otEmployees = [1003, 1005, 1006, 1009, 1025, 1026];
    const absentEmployees = { 1004: [10, 11, 17], 1013: [10, 11, 17], 1022: [10, 11, 17] };
    
    let shiftCount = 0;
    let attCount = 0;
    
    for (const emp of employees) {
      const empId = emp.empid;
      const salary = fixedSalaries[empId] || { basic: 7500, hra: 5250, conv: 1500, wa: 750 };
      const isOT = salary.ot === true;
      const absentDays = absentEmployees[empId] || [];
      
      const empSalary = await EmpSalary.findOne({ where: { empid: empId } });
      if (!empSalary) {
        await EmpSalary.upsert({
          empid: empId,
          basic: salary.basic,
          hra: salary.hra,
          conveyance: salary.conv,
          washing_allowance: salary.wa,
          IS_pf: empId >= 10000 ? 'Y' : 'N',
          IS_esi: salary.basic < 21000 ? 'Y' : 'N',
          IS_ot: isOT ? 'Y' : 'N',
          pay_mode: 'Bank'
        }, { transaction: t });
      }
      
      for (let day = 1; day <= lastDay; day++) {
        const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const dateObj = new Date(dateStr);
        const dayOfWeek = dateObj.getDay();
        
        const isSunday = dayOfWeek === 0;
        const isHoliday = holidayDates.includes(dateStr);
        const isAbsent = absentDays.includes(day);
        
        let shiftCd = 'G';
        let status = 'P';
        let otHrs = 0;
        let woffDay = 0;
        let isHolidayFlg = false;
        
        if (isSunday) {
          shiftCd = 'W';
          status = 'W';
          woffDay = 1;
        } else if (isHoliday) {
          shiftCd = 'H';
          status = 'H';
          isHolidayFlg = true;
        } else if (isAbsent) {
          status = 'A';
        } else if (isOT && day % 2 === 0) {
          otHrs = 2;
        } else if (isOT && day % 2 !== 0) {
          otHrs = 4;
        }
        
        await ShiftSchedule.upsert({
          empid: empId,
          shift_date: dateStr,
          shift_cd: shiftCd,
          shift_start_time: new Date(2000, 0, 1, 9, 0),
          shift_end_time: new Date(2000, 0, 1, 17, 30),
          shift_status: 'Active',
          final_status: 1,
          unit: emp.uname,
          division: emp.divname
        }, { transaction: t });
        
        shiftCount++;
        
        const calculateLate = (inT, shiftT) => {
          if (!inT || !shiftT) return 0;
          const [h1, m1] = inT.split(':').map(Number);
          const [h2, m2] = shiftT.split(':').map(Number);
          const diff = (h1 * 60 + m1) - (h2 * 60 + m2);
          return diff > 0 ? diff / 60 : 0;
        };

        const inTimeStr = ['A', 'W', 'H'].includes(status) ? null : '09:05';
        const lateHrs = inTimeStr ? calculateLate(inTimeStr, '09:00') : 0;

        await Attendance.upsert({
          empid: empId,
          att_date: dateStr,
          shift: shiftCd,
          shift_start: '09:00',
          shift_end: '17:30',
          in_time: inTimeStr,
          out_time: ['A', 'W', 'H'].includes(status) ? null : (otHrs > 0 ? '20:00' : '17:35'),
          status: status,
          late_hrs: lateHrs,
          ot_hrs: otHrs,
          lop_days: status === 'A' ? 1 : 0,
          woff_day: woffDay,
          holiday: isHolidayFlg,
          unit: emp.uname,
          division: emp.divname
        }, { transaction: t });
        
        attCount++;
      }
    }
    
    await t.commit();
    res.json({ 
      message: `${month}/${year} data generated successfully`,
      shiftsCreated: shiftCount,
      attendanceCreated: attCount,
      employees: employees.length,
      regenerated: regenerate
    });
  } catch (error) {
    await t.rollback();
    console.error('Error generating monthly data:', error);
    res.status(500).json({ message: 'Error generating data', error: error.message });
  }
};

exports.getPendingShiftChanges = async (req, res) => {
  try {
    const data = await ShiftChange.findAll({
      where: { app_status: 'Pending' },
      order: [['schange_no', 'DESC']]
    });

    res.json(data);
  } catch (error) {
    console.error('❌ Error fetching pending Shift Change applications:', error);
    res.status(500).json({ message: 'Failed to fetch pending Shift Change applications.' });
  }
};

exports.approveShiftChange = async (req, res) => {
  const { schange_no, app_status, final_status, remarks } = req.body;
  
  try {
    const application = await ShiftChange.findOne({
      where: { schange_no }
    });

    if (!application) {
      return res.status(404).json({ message: 'Shift Change application not found.' });
    }

    application.app_status = app_status === 'Reject' ? 'Rejected' : app_status || 'Approved';
    if (final_status) application.final_status = final_status;
    if (remarks) application.remarks = remarks;
    await application.save();

    res.json({ success: true, message: `Shift Change application ${application.app_status.toLowerCase()}d successfully.` });
  } catch (error) {
    console.error('❌ Error approving Shift Change application:', error);
    res.status(500).json({ success: false, message: 'Failed to approve Shift Change application.', error });
  }
};

exports.cancelShiftChange = async (req, res) => {
  const { schange_no, remarks = "" } = req.body;
  try {
    const app = await ShiftChange.findOne({ where: { schange_no } });
    if (!app) return res.status(404).json({ success: false, message: "Application not found" });

    await app.update({ app_status: 'Cancelled', remarks: remarks });
    res.json({ success: true, message: "Shift change approval cancelled" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error cancelling shift change" });
  }
};

exports.reopenShiftChange = async (req, res) => {
  const { schange_no } = req.body;
  try {
    const app = await ShiftChange.findOne({ where: { schange_no } });
    if (!app) return res.status(404).json({ success: false, message: "Application not found" });

    await app.update({ app_status: 'Pending' });
    res.json({ success: true, message: "Shift change application reopened" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error reopening shift change" });
  }
};

exports.getShiftChangeReport = async (req, res) => {
  try {
    const { startDate, endDate, empid } = req.query;
    const where = {};
    
    if (startDate && endDate) {
      where.schange_date = { [Op.between]: [startDate, endDate] };
    }
    if (empid) {
      where.empid = empid;
    }
    
    const data = await ShiftChange.findAll({
      where,
      include: [{ model: EmployeeMaster, as: 'employee', attributes: ['ename', 'deptname'] }],
      order: [['schange_date', 'DESC']]
    });
    
    const result = data.map(r => ({
      schange_no: r.schange_no,
      schange_date: r.schange_date,
      empid: r.empid,
      ename: r.employee?.ename || '',
      act_shift: r.act_shift,
      act_time: `${r.act_sstart_time || '--'} - ${r.act_send_time || '--'}`,
      change_shift: r.change_shift,
      cha_time: `${r.cha_sstart_time || '--'} - ${r.cha_send_time || '--'}`,
      reason: r.purpose || r.reason || '',
      status: r.app_status || 'Pending'
    }));
    
    res.json(result);
  } catch (error) {
    console.error('Error fetching shift change report:', error);
    res.status(500).json({ message: 'Error fetching report' });
  }
};

exports.getWoffChangeReport = async (req, res) => {
  try {
    const { startDate, endDate, empid } = req.query;
    const where = {};
    
    if (startDate && endDate) {
      where.woff_date = { [Op.between]: [startDate, endDate] };
    }
    if (empid) {
      where.empid = empid;
    }
    
    const data = await WoffApplication.findAll({
      where,
      include: [{ model: EmployeeMaster, as: 'employee', attributes: ['ename', 'deptname'] }],
      order: [['woff_date', 'DESC']]
    });
    
    const result = data.map(r => ({
      woff_id: r.woff_id,
      woff_date: r.woff_date,
      empid: r.empid,
      ename: r.employee?.ename || '',
      current_woff: r.current_woff,
      requested_woff: r.requested_woff,
      reason: r.reason,
      status: r.app_status || 'Pending'
    }));
    
    res.json(result);
  } catch (error) {
    console.error('Error fetching woff change report:', error);
    res.status(500).json({ message: 'Error fetching report' });
  }
};

exports.getShiftByEmpAndDate = async (req, res) => {
  try {
    const { empid, date } = req.query;
    if (!empid || !date) {
      return res.status(400).json({ message: 'EmpID and Date are required' });
    }

    const schedule = await ShiftSchedule.findOne({
      where: { empid, shift_date: date }
    });

    if (!schedule) {
      return res.status(404).json({ message: 'No shift scheduled for this date' });
    }

    const shiftMaster = await ShiftMaster.findOne({
      where: { shift_cd: schedule.shift_cd }
    });

    const formatTime = (date) => {
      if (!date) return '';
      const d = new Date(date);
      return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    };

    res.json({
      shift_cd: schedule.shift_cd,
      shift_name: shiftMaster ? shiftMaster.shift_name : schedule.shift_cd,
      start_time: formatTime(schedule.shift_start_time),
      end_time: formatTime(schedule.shift_end_time)
    });
  } catch (error) {
    console.error('Error fetching shift by date:', error);
    res.status(500).json({ message: 'Error fetching shift details' });
  }
};
