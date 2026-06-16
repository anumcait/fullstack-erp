// controllers/dashboardController.js
const { EmployeeMaster, Attendance, LeaveDetails, Holiday, Payslip, User, LeaveMaster } = require('../../models');
const { Op, fn, col, literal } = require('sequelize');

const formatDateDB = (dateStr) => {
  if (!dateStr) return 'N/A';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return 'N/A';
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const day = String(date.getDate()).padStart(2, '0');
  return `${day}-${months[date.getMonth()]}-${date.getFullYear()}`;
};

const formatDateTimeDB = (dateStr) => {
  if (!dateStr) return 'N/A';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return 'N/A';
  // Convert to local timezone
  const localDate = new Date(date.getTime() + (5.5 * 60 * 60 * 1000)); // Add 5:30 hours for IST
  const day = String(localDate.getDate()).padStart(2, '0');
  const month = String(localDate.getMonth() + 1).padStart(2, '0');
  const year = localDate.getFullYear();
  const hours = String(localDate.getHours()).padStart(2, '0');
  const minutes = String(localDate.getMinutes()).padStart(2, '0');
  return `${day}-${month}-${year} ${hours}:${minutes}`;
};

// =========================================================
// === HR DASHBOARD ===
// =========================================================
exports.hrSummary = async (req, res) => {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const last30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const last60Days = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

    const [
      totalEmployees,
      activeEmployees,
      presentToday,
      lateComingCount,
      pendingLeaves,
      approvedLeaves,
      recentApprovedLeavesHR,
      holidays,
      birthdays,
      recentHires,
      topAbsentees,
      attendanceTrendRaw,
      leaveByTypeRaw,
      deptStats
    ] = await Promise.all([
      EmployeeMaster.count(),
      EmployeeMaster.count({ where: { status: 'Active' } }),
      Attendance.count({ where: { att_date: today, status: 'Present' } }),
      Attendance.count({
        where: {
          att_date: { [Op.between]: [last30Days, today] },
          late_hrs: { [Op.gt]: 0 },
          late_exempt: false,
        },
      }),
      LeaveDetails.count({ where: { c_hr_app_status: 'Pending' } }),
      LeaveDetails.count({ where: { c_hr_app_status: 'Approved' } }),
      LeaveDetails.findAll({
        where: {
          status: 'Approved',
          from_date: { [Op.gte]: new Date(last30Days) },
        },
        raw: true,
      }),
      Holiday.findAll({
        where: {
          hdate: {
            [Op.between]: [today, new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)],
          },
        },
        order: [['hdate', 'ASC']],
        limit: 5,
        raw: true,
      }),
      EmployeeMaster.findAll({
        where: literal(`
          TO_CHAR(dob, 'MM-DD') BETWEEN 
          TO_CHAR(CURRENT_DATE, 'MM-DD') AND 
          TO_CHAR(CURRENT_DATE + INTERVAL '30 DAY', 'MM-DD')
        `),
        attributes: ['empid', 'ename', 'dob', 'deptname'],
        order: [['dob', 'ASC']],
        raw: true,
      }),
      EmployeeMaster.findAll({
        where: {
          doj: { [Op.between]: [last60Days, today] },
        },
        attributes: ['empid', 'ename', 'deptname', 'doj'],
        order: [['doj', 'DESC']],
        limit: 5,
        raw: true,
      }),
      Attendance.findAll({
        attributes: ['empid', [fn('COUNT', col('status')), 'absentCount']],
        where: {
          status: 'Absent',
          att_date: { [Op.between]: [last30Days, today] },
        },
        group: ['empid'],
        order: [[fn('COUNT', col('status')), 'DESC']],
        limit: 5,
        raw: true,
      }),
      Attendance.findAll({
        where: {
          att_date: { [Op.gte]: last30Days },
        },
        attributes: ['att_date', 'status'],
        order: [['att_date', 'ASC']],
        raw: true,
      }),
      LeaveDetails.findAll({
        where: { status: { [Op.ne]: 'Pending' } },
        attributes: ['leave_type', [fn('COUNT', col('leave_type')), 'count']],
        group: ['leave_type'],
        raw: true,
      }),
      EmployeeMaster.findAll({
        attributes: [['deptname', 'type'], [fn('COUNT', col('empid')), 'count']],
        group: ['deptname'],
        raw: true,
      })
    ]);

    const inactiveEmployees = totalEmployees - activeEmployees;
    const absentToday = activeEmployees - presentToday;

    let totalLeaveDaysHR = 0;
    recentApprovedLeavesHR.forEach((l) => {
      const diff = new Date(l.to_date) - new Date(l.from_date);
      totalLeaveDaysHR += Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1);
    });
    const avgLeaveDuration =
      recentApprovedLeavesHR.length > 0
        ? (totalLeaveDaysHR / recentApprovedLeavesHR.length).toFixed(1)
        : 0;

    const trendMap = {};
    for (const a of attendanceTrendRaw) {
      if (!trendMap[a.att_date]) trendMap[a.att_date] = { present: 0, date: a.att_date };
      if (a.status === 'Present') trendMap[a.att_date].present++;
    }
    const attendanceTrend = Object.values(trendMap)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .map((t) => ({ date: t.date.slice(5), present: t.present }));

    const leaveByType = leaveByTypeRaw.map((l) => ({ type: l.leave_type, count: parseInt(l.count) }));
    const attritionRate = totalEmployees > 0 ? ((inactiveEmployees / totalEmployees) * 100).toFixed(1) : 0;

    res.json({
      employeeStats: { totalEmployees, activeEmployees, inactiveEmployees },
      attendanceStats: { presentToday, absentToday, lateComingCount },
      leaveStats: { pendingLeaves, approvedLeaves, avgLeaveDuration },
      attritionStats: { attritionRate },
      attendanceTrend,
      leaveByType,
      insights: {
        upcomingHolidays: holidays,
        upcomingBirthdays: birthdays,
        recentHires,
        topAbsentees,
        deptStats,
      },
    });
  } catch (err) {
    console.error('Error fetching HR summary:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// =========================================================
// === MANAGER DASHBOARD ===
// =========================================================
exports.managerSummary = async (req, res) => {
  try {
    const managerId = req.session?.user?.empid || req.query.managerId;
    if (!managerId) return res.status(400).json({ message: 'Manager ID required' });

    const today = new Date().toISOString().slice(0, 10);
    const last30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

    const teamMembers = await EmployeeMaster.findAll({
      where: { reporting_manager_id: managerId, status: 'Active' },
      attributes: ['empid'],
      raw: true,
    });
    const teamEmpIds = teamMembers.map((m) => m.empid);
    const totalTeam = teamEmpIds.length;

    if (totalTeam === 0) {
      return res.json({
        teamStats: { totalTeam: 0, presentToday: 0 },
        leaveStats: { pendingLeaves: 0, avgLeaveDuration: 0, leaveByType: [] },
        attendanceTrend: [],
        upcomingBirthdays: [],
        pendingApprovals: [],
      });
    }

    const [
      presentToday,
      pendingLeaves,
      pendingLeaveApprovals,
      allTeamEmps,
      recentApprovedLeaves,
      leaveByTypeRaw,
      attendanceTrendRaw
    ] = await Promise.all([
      Attendance.count({
        where: { empid: { [Op.in]: teamEmpIds }, att_date: today, status: 'Present' },
      }),
      LeaveDetails.count({
        where: { empid: { [Op.in]: teamEmpIds }, c_hr_app_status: 'Pending' },
      }),
      LeaveDetails.findAll({
        where: { empid: { [Op.in]: teamEmpIds }, c_hr_app_status: 'Pending' },
        attributes: ['empid', 'from_date', 'to_date', 'leave_type'],
        raw: true,
        limit: 10,
      }),
      EmployeeMaster.findAll({
        where: { empid: { [Op.in]: teamEmpIds } },
        attributes: ['empid', 'ename', 'dob'],
        raw: true,
      }),
      LeaveDetails.findAll({
        where: {
          empid: { [Op.in]: teamEmpIds },
          status: 'Approved',
          from_date: { [Op.gte]: new Date(last30Days) },
        },
        raw: true,
      }),
      LeaveDetails.findAll({
        where: { empid: { [Op.in]: teamEmpIds }, c_hr_app_status: { [Op.ne]: 'Pending' } },
        attributes: ['leave_type', [fn('COUNT', col('leave_type')), 'count']],
        group: ['leave_type'],
        raw: true,
      }),
      Attendance.findAll({
        where: {
          empid: { [Op.in]: teamEmpIds },
          att_date: { [Op.gte]: last30Days },
        },
        attributes: ['att_date', 'status'],
        order: [['att_date', 'ASC']],
        raw: true,
      })
    ]);

    const empMap = {};
    allTeamEmps.forEach(emp => {
      empMap[emp.empid] = emp.ename;
    });

    const pendingApprovals = pendingLeaveApprovals.map((l) => ({
      empName: empMap[l.empid] || l.empid,
      type: l.leave_type,
      days: Math.ceil((new Date(l.to_date) - new Date(l.from_date)) / (1000 * 60 * 60 * 24)) + 1,
      from: l.from_date,
      to: l.to_date,
    }));

    let totalLeaveDays = 0;
    recentApprovedLeaves.forEach((l) => {
      const diff = new Date(l.to_date) - new Date(l.from_date);
      totalLeaveDays += Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1);
    });
    const avgLeaveDuration =
      recentApprovedLeaves.length > 0 ? (totalLeaveDays / recentApprovedLeaves.length).toFixed(1) : 0;

    const leaveByType = leaveByTypeRaw.map((l) => ({ type: l.leave_type, count: parseInt(l.count) }));

    const trendMap = {};
    for (const a of attendanceTrendRaw) {
      if (!trendMap[a.att_date]) trendMap[a.att_date] = { present: 0, date: a.att_date };
      if (a.status === 'Present') trendMap[a.att_date].present++;
    }
    const attendanceTrend = Object.values(trendMap)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .map((t) => ({ date: t.date.slice(5), present: t.present }));

    const todayDateObj = new Date();
    const todayMonth = todayDateObj.getMonth();
    const todayDate = todayDateObj.getDate();
    const upcomingBirthdays = allTeamEmps
      .filter((b) => {
        if (!b.dob) return false;
        const dob = new Date(b.dob);
        const bMonth = dob.getMonth();
        const bDate = dob.getDate();
        if (bMonth > todayMonth) return true;
        if (bMonth === todayMonth && bDate >= todayDate) return true;
        return false;
      })
      .slice(0, 5)
      .map((b) => ({
        empName: b.ename,
        date: new Date(b.dob).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      }));

    res.json({
      teamStats: { totalTeam, presentToday },
      leaveStats: { pendingLeaves, avgLeaveDuration, leaveByType },
      attendanceTrend,
      upcomingBirthdays,
      pendingApprovals,
    });
  } catch (err) {
    console.error('Error fetching manager summary:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// =========================================================
// === EMPLOYEE DASHBOARD ===
// =========================================================
exports.employeeSummary = async (req, res) => {
  try {
    let empId = req.session?.user?.empid || req.query.empid;
    if (!empId) return res.status(400).json({ message: 'Employee ID required' });

    empId = parseInt(empId, 10);
    if (isNaN(empId)) return res.status(400).json({ message: 'Invalid Employee ID' });

    const today = new Date().toISOString().slice(0, 10);
    const last15Days = new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const last30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

    const [
      attendanceToday,
      pendingLeaves,
      approvedLeaves,
      leaveMasterData,
      recentLeavesRaw,
      latestPayslip,
      empData,
      upcomingHolidays,
      attendanceTrend,
      lateComingCount,
      user
    ] = await Promise.all([
      Attendance.findOne({ where: { empid: empId, att_date: today }, raw: true }).catch(() => null),
      LeaveDetails.count({ where: { empno: empId, c_hr_app_status: 'Pending' } }).catch(() => 0),
      LeaveDetails.count({ where: { empno: empId, c_hr_app_status: 'Approved' } }).catch(() => 0),
      LeaveMaster.findOne({ where: { empid: empId }, raw: true }).catch(() => null),
      LeaveDetails.findAll({
        where: { empno: empId },
        order: [['frmdt', 'DESC']],
        limit: 5,
        raw: true,
      }).catch(() => []),
      Payslip.findOne({
        where: { C_EMPID: empId },
        order: [
          ['C_YEAR', 'DESC'],
          [literal(`CASE 
            WHEN "C_MONTH" = 'JAN' THEN 1 
            WHEN "C_MONTH" = 'FEB' THEN 2 
            WHEN "C_MONTH" = 'MAR' THEN 3 
            WHEN "C_MONTH" = 'APR' THEN 4 
            WHEN "C_MONTH" = 'MAY' THEN 5 
            WHEN "C_MONTH" = 'JUN' THEN 6 
            WHEN "C_MONTH" = 'JUL' THEN 7 
            WHEN "C_MONTH" = 'AUG' THEN 8 
            WHEN "C_MONTH" = 'SEP' THEN 9 
            WHEN "C_MONTH" = 'OCT' THEN 10 
            WHEN "C_MONTH" = 'NOV' THEN 11 
            WHEN "C_MONTH" = 'DEC' THEN 12 
            ELSE 0 END`), 'DESC']
        ],
        raw: true,
      }).catch(() => null),
      EmployeeMaster.findOne({
        where: { empid: empId },
        attributes: ['ename', 'deptname', 'dob'],
        raw: true,
      }).catch(() => null),
      Holiday.findAll({
        where: { hdate: { [Op.gte]: today } },
        limit: 3,
        order: [['hdate', 'ASC']],
        raw: true,
      }).catch(() => []),
      Attendance.findAll({
        where: {
          empid: empId,
          att_date: { [Op.gte]: last15Days },
        },
        attributes: ['att_date', 'status'],
        order: [['att_date', 'ASC']],
        raw: true,
      }).catch(() => []),
      Attendance.count({
        where: {
          empid: empId,
          att_date: { [Op.between]: [last30Days, today] },
          late_hrs: { [Op.gt]: 0 },
          late_exempt: false,
        },
      }).catch(() => 0),
      User.findOne({ where: { empid: empId }, attributes: ['last_login', 'previous_login'], raw: true }).catch(() => null)
    ]);

    let leaveBalance = 0;
    if (leaveMasterData) {
      leaveBalance = Number(leaveMasterData.cls_balance || 0) + Number(leaveMasterData.els_balance || 0);
    }

    let upcomingBirthday = null;
    if (empData?.dob) {
      const dob = new Date(empData.dob);
      const nextBirthday = new Date(new Date().getFullYear(), dob.getMonth(), dob.getDate());
      if (nextBirthday < new Date(today)) nextBirthday.setFullYear(nextBirthday.getFullYear() + 1);
      const daysLeft = Math.ceil((nextBirthday - new Date(today)) / (1000 * 60 * 60 * 24));
      upcomingBirthday = { date: formatDateDB(nextBirthday.toISOString().slice(0, 10)), daysLeft };
    }

    const attendanceStats = {
      presentDays: attendanceTrend.filter((a) => a.status === 'Present' || a.status === 'P').length,
      absentDays: attendanceTrend.filter((a) => a.status !== 'Present' && a.status !== 'P').length,
      lateComingCount
    };

    res.json({
      profile: empData || {},
      attendanceToday: attendanceToday?.status || 'Absent',
      pendingLeaves,
      approvedLeaves,
      totalLeavesTaken: approvedLeaves,
      leaveBalance,
      recentLeaves: (recentLeavesRaw || []).map(l => ({
        from_date: l.frmdt,
        to_date: l.todate,
        leave_type: l.leave_type || 'Leave',
        status: l.c_hr_app_status || 'Pending',
        nod: l.nod
      })),
      latestPayslip:
        latestPayslip?.C_MONTH && latestPayslip?.C_YEAR
          ? `${latestPayslip.C_MONTH} ${latestPayslip.C_YEAR}`
          : 'No Record Found',
      attendanceTrend,
      attendanceStats,
      upcomingBirthday,
      upcomingHolidays,
      upcomingHoliday:
        upcomingHolidays.length > 0
          ? `${upcomingHolidays[0].hdesc} (${formatDateDB(upcomingHolidays[0].hdate)})`
          : 'None',
      notifications: pendingLeaves,
      lastLogin: user?.previous_login ? formatDateTimeDB(user.previous_login) : 'First Login',
    });
  } catch (err) {
    console.error('Error fetching employee summary:', err);
    res.status(500).json({ message: err.message || 'Internal server error' });
  }
};
