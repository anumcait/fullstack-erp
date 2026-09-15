// controllers/dashboardController.js
const { EmployeeMaster, Attendance, LeaveApplication, LeaveDetails, LeaveApproval, Holiday, Payslip, User, LeaveMaster, ProfileUpdateRequest } = require('../../models');
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
      deptStats,
      pendingProfileRequests,
      recentProfileApprovals
    ] = await Promise.all([
      EmployeeMaster.count(),
      EmployeeMaster.count({ where: { status: 'Active', is_active: true } }),
      Attendance.count({ where: { att_date: today, status: { [Op.in]: ['Present', 'P'] }, in_time: { [Op.ne]: null } } }),
      Attendance.count({
        where: {
          att_date: { [Op.between]: [last30Days, today] },
          [Op.or]: [{ late_hrs: { [Op.gt]: 0 } }, { late_mins: { [Op.gt]: 0 } }],
          late_exempt: { [Op.ne]: true },
        },
      }),
      LeaveDetails.count({ where: { c_hr_app_status: 'Pending' } }),
      LeaveDetails.count({ where: { c_hr_app_status: 'Approved' } }),
      LeaveApplication.findAll({
        where: {
          status: 'Approved',
          ldate: { [Op.gte]: new Date(last30Days) },
        },
        include: [{ model: LeaveDetails, as: 'leaveDetails', attributes: ['frmdt', 'todate'] }],
        limit: 20,
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
          created: { [Op.between]: [last60Days, today] },
        },
        attributes: ['empid', 'ename', 'deptname', 'created'],
        order: [['created', 'DESC']],
        limit: 5,
        raw: true,
      }),
      Attendance.findAll({
        attributes: ['empid', [fn('COUNT', col('status')), 'absentCount']],
        where: {
          status: { [Op.in]: ['Absent', 'A'] },
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
        attributes: ['att_date', 'status', 'in_time'],
        order: [['att_date', 'ASC']],
        raw: true,
      }),
      LeaveApproval.findAll({
        where: { app_status: 'Approved' },
        attributes: ['leave_type', [fn('COUNT', col('leave_type')), 'count']],
        group: ['leave_type'],
        raw: true,
      }),
      EmployeeMaster.findAll({
        where: { status: 'Active', is_active: true },
        attributes: [['deptname', 'type'], [fn('COUNT', col('empid')), 'count']],
        group: ['deptname'],
        raw: true,
      }),
      ProfileUpdateRequest.count({ where: { status: 'Pending' } }),
      ProfileUpdateRequest.findAll({
        where: { status: 'Approved' },
        order: [['reviewed_at', 'DESC']],
        limit: 5,
        include: [{ model: EmployeeMaster, attributes: ['ename'] }],
        raw: false,
      })
    ]);

    let effectivePresent = presentToday;
    let effectiveDate = today;
    if (presentToday === 0) {
      const latestP = await Attendance.findOne({ where: { status: { [Op.in]: ['Present', 'P'] }, in_time: { [Op.ne]: null } }, order: [['att_date', 'DESC']], attributes: ['att_date'], raw: true });
      const latestAny = await Attendance.findOne({ order: [['att_date', 'DESC']], attributes: ['att_date'], raw: true });
      const fallback = latestP || latestAny;
      if (fallback && fallback.att_date) {
        effectiveDate = fallback.att_date;
        effectivePresent = await Attendance.count({ where: { att_date: fallback.att_date, status: { [Op.in]: ['Present', 'P'] }, in_time: { [Op.ne]: null } } });
      }
    }
    const inactiveEmployees = totalEmployees - activeEmployees;
    let leftLast30Days = 0;
    try { leftLast30Days = await EmployeeMaster.count({ where: { status: { [Op.in]: ['Left', 'Resigned', 'Terminated'] } } }); } catch (e) { leftLast30Days = inactiveEmployees; }
    const absentToday = effectivePresent > 0 ? Math.max(0, activeEmployees - effectivePresent) : 0;
    const presentPct = activeEmployees > 0 ? ((effectivePresent / activeEmployees) * 100).toFixed(1) : 0;



    let totalLeaveDaysHR = 0;
    recentApprovedLeavesHR.forEach((app) => {
      const details = app.leaveDetails || [];
      if (!details.length) return;
      const from = Math.min(...details.map((d) => new Date(d.frmdt).getTime()));
      const to = Math.max(...details.map((d) => new Date(d.todate).getTime()));
      totalLeaveDaysHR += Math.max(1, Math.ceil((to - from) / (1000 * 60 * 60 * 24)) + 1);
    });
    const avgLeaveDuration =
      recentApprovedLeavesHR.length > 0
        ? (totalLeaveDaysHR / recentApprovedLeavesHR.length).toFixed(1)
        : 0;

    const trendMap = {};
    for (const a of attendanceTrendRaw) {
      if (!trendMap[a.att_date]) trendMap[a.att_date] = { present: 0, date: a.att_date };
      if (['Present','P'].includes(a.status) && a.in_time) trendMap[a.att_date].present++;
    }
    const attendanceTrend = Object.values(trendMap)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .map((t) => ({ date: t.date.slice(5), present: t.present }));

    const leaveByType = leaveByTypeRaw.map((l) => ({ type: l.leave_type, count: parseInt(l.count) }));
    const attritionRate = activeEmployees > 0 ? ((leftLast30Days / activeEmployees) * 100).toFixed(1) : 0;

    res.json({
      employeeStats: { totalEmployees, activeEmployees, inactiveEmployees, leftLast30Days },
      attendanceStats: { presentToday: effectivePresent, absentToday, lateComingCount, presentPct, effectiveDate },
      leaveStats: { pendingLeaves, approvedLeaves, avgLeaveDuration },
      attritionStats: { attritionRate, leftLast30Days },
      attendanceTrend,
      leaveByType,
      insights: {
        upcomingHolidays: holidays,
        upcomingBirthdays: birthdays,
        recentHires,
        topAbsentees,
        deptStats,
        recentProfileApprovals: recentProfileApprovals.map(r => ({
          label: r.EmployeeMaster?.ename || `Emp ${r.empid}`,
          value: r.reviewed_at ? new Date(r.reviewed_at).toLocaleDateString() : 'Approved',
        })),
      },
      pendingProfileRequests,
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
    let teamMembers = await EmployeeMaster.findAll({ where: { reporting_manager_id: managerId, status: 'Active', is_active: true }, attributes: ['empid'], raw: true });
    let isCompanyWide = false;
    let fallbackNote = null;
    if (teamMembers.length === 0) {
      try {
        const rows = await EmployeeMaster.sequelize.query("SELECT empid FROM m_emp_off_det WHERE rto = :mid", { replacements: { mid: String(managerId) }, type: EmployeeMaster.sequelize.QueryTypes.SELECT });
        if (rows.length) teamMembers = rows.map(r => ({ empid: Number(r.empid) }));
      } catch (e) {}
    }
    if (teamMembers.length === 0) {
      const mgr = await EmployeeMaster.findOne({ where: { empid: managerId }, attributes: ['deptname'], raw: true });
      if (mgr && mgr.deptname) {
        teamMembers = await EmployeeMaster.findAll({ where: { deptname: mgr.deptname, status: 'Active', is_active: true, empid: { [Op.ne]: managerId } }, attributes: ['empid'], raw: true });
        if (teamMembers.length) fallbackNote = 'Department team (' + mgr.deptname + ')';
      }
    }
    if (teamMembers.length === 0) {
      teamMembers = await EmployeeMaster.findAll({ where: { status: 'Active', is_active: true }, attributes: ['empid'], raw: true });
      isCompanyWide = true;
      fallbackNote = 'Company-wide (no direct reports assigned)';
    }
    const teamEmpIds = teamMembers.map(m => Number(m.empid)).filter(Boolean);
    const totalTeam = teamEmpIds.length;
    if (totalTeam === 0) {
      return res.json({ teamStats: { totalTeam: 0, presentToday: 0, presentPct: 0, isCompanyWide, fallbackNote }, leaveStats: { pendingLeaves: 0, avgLeaveDuration: 0, leaveByType: [] }, attendanceTrend: [], upcomingBirthdays: [], pendingApprovals: [], pendingCounts: { leaves: 0, onduty: 0, tours: 0, woffs: 0, advances: 0 } });
    }
    let presentToday = await Attendance.count({ where: { empid: { [Op.in]: teamEmpIds }, att_date: today, status: { [Op.in]: ['Present', 'P'] }, in_time: { [Op.ne]: null } } });
    let effectiveDate = today;
    if (presentToday === 0) {
      const latestP = await Attendance.findOne({ where: { empid: { [Op.in]: teamEmpIds }, status: { [Op.in]: ['Present', 'P'] }, in_time: { [Op.ne]: null } }, order: [['att_date', 'DESC']], attributes: ['att_date'], raw: true });
      if (latestP && latestP.att_date) { effectiveDate = latestP.att_date; presentToday = await Attendance.count({ where: { empid: { [Op.in]: teamEmpIds }, att_date: latestP.att_date, status: { [Op.in]: ['Present', 'P'] }, in_time: { [Op.ne]: null } } }); }
    }
    const presentPct = totalTeam > 0 ? ((presentToday / totalTeam) * 100).toFixed(1) : 0;
    const pendingLeavesQ = LeaveApplication.count({ where: { empid: { [Op.in]: teamEmpIds }, status: 'Pending' } }).catch(() => LeaveDetails.count({ where: { c_hr_app_status: 'Pending', empno: { [Op.in]: teamEmpIds } } }).catch(() => 0));
    const pendingOnDutyQ = (async () => { try { const { OnDutyApplication } = require('../../models'); return await OnDutyApplication.count({ where: { empid: { [Op.in]: teamEmpIds }, status: 'Pending' } }); } catch (e) { return 0; } })();
    const pendingToursQ = (async () => { try { const { TourApplication } = require('../../models'); return await TourApplication.count({ where: { empid: { [Op.in]: teamEmpIds }, status: 'Pending' } }); } catch (e) { return 0; } })();
    const pendingWoffsQ = (async () => { try { const { WoffApplication } = require('../../models'); return await WoffApplication.count({ where: { empid: { [Op.in]: teamEmpIds }, status: 'Pending' } }); } catch (e) { return 0; } })();
    const pendingAdvQ = (async () => { try { const { AdvanceApplication } = require('../../models'); return await AdvanceApplication.count({ where: { empid: { [Op.in]: teamEmpIds }, status: 'Pending' } }); } catch (e) { return 0; } })();
    const [pendingLeaves, pendingOnDuty, pendingTours, pendingWoffs, pendingAdvances, allTeamEmps, recentApprovedLeaves, leaveByTypeRaw, attendanceTrendRaw] = await Promise.all([
      pendingLeavesQ,
      pendingOnDutyQ,
      pendingToursQ,
      pendingWoffsQ,
      pendingAdvQ,
      EmployeeMaster.findAll({ where: { empid: { [Op.in]: teamEmpIds } }, attributes: ['empid', 'ename', 'dob'], raw: true }),
      LeaveApplication.findAll({ where: { empid: { [Op.in]: teamEmpIds }, status: 'Approved', ldate: { [Op.gte]: new Date(last30Days) } }, raw: true }).catch(() => []),
      LeaveApplication.findAll({ where: { empid: { [Op.in]: teamEmpIds } }, attributes: ['status', [fn('COUNT', col('status')), 'count']], group: ['status'], raw: true }).catch(() => []),
      Attendance.findAll({ where: { empid: { [Op.in]: teamEmpIds }, att_date: { [Op.gte]: last30Days } }, attributes: ['att_date', 'status', 'in_time'], order: [['att_date', 'ASC']], raw: true })
    ]);

    const empMap = {};
    allTeamEmps.forEach(emp => {
      empMap[emp.empid] = emp.ename;
    });

    let pendingLeaveApprovals = [];
    try { pendingLeaveApprovals = await LeaveApplication.findAll({ where: { empid: { [Op.in]: teamEmpIds }, status: 'Pending' }, attributes: ['lno', 'empid', 'ldate'], raw: true, limit: 10 }); } catch (e) {}
    const pendingApprovals = pendingLeaveApprovals.map((l) => ({ lno: l.lno, empName: empMap[l.empid] || String(l.empid), type: l.leave_type || 'Leave', days: 1, from: l.ldate || l.frmdt, to: l.todate }));
    let totalLeaveDays = 0;
    recentApprovedLeaves.forEach((l) => { const diff = new Date(l.todate || l.ldate) - new Date(l.frmdt || l.ldate); totalLeaveDays += Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1); });
    const avgLeaveDuration = recentApprovedLeaves.length > 0 ? (totalLeaveDays / recentApprovedLeaves.length).toFixed(1) : 0;
    const leaveByType = leaveByTypeRaw.map((l) => ({ type: l.status || l.leave_type, count: parseInt(l.count) }));
    const trendMap = {};
    for (const a of attendanceTrendRaw) { if (!trendMap[a.att_date]) trendMap[a.att_date] = { present: 0, date: a.att_date }; if (['Present', 'P'].includes(a.status)) trendMap[a.att_date].present++; }
    const attendanceTrend = Object.values(trendMap).sort((a, b) => new Date(a.date) - new Date(b.date)).map((t) => ({ date: t.date.slice(5), present: t.present }));
    const todayDateObj = new Date(); const todayMonth = todayDateObj.getMonth(); const todayDate = todayDateObj.getDate();
    const upcomingBirthdays = allTeamEmps.filter((b) => { if (!b.dob) return false; const dob = new Date(b.dob); const bMonth = dob.getMonth(); const bDate = dob.getDate(); if (bMonth > todayMonth) return true; if (bMonth === todayMonth && bDate >= todayDate) return true; return false; }).slice(0, 5).map((b) => ({ empName: b.ename, date: new Date(b.dob).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) }));
    const pendingCounts = { leaves: pendingLeaves, onduty: pendingOnDuty, tours: pendingTours, woffs: pendingWoffs, advances: pendingAdvances, total: pendingLeaves + pendingOnDuty + pendingTours + pendingWoffs + pendingAdvances };
    res.json({ teamStats: { totalTeam, presentToday, presentPct, effectiveDate, isCompanyWide, fallbackNote }, leaveStats: { pendingLeaves, avgLeaveDuration, leaveByType }, attendanceTrend, upcomingBirthdays, pendingApprovals, pendingCounts });
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
    const sessionUser = req.session?.user;
    if (!sessionUser) return res.status(401).json({ message: 'Not logged in' });
    const requestedEmpId = req.query.empid ? parseInt(req.query.empid, 10) : null;
    let empId = sessionUser.empid;
    if (requestedEmpId && requestedEmpId !== parseInt(sessionUser.empid, 10)) {
      const isAdmin = sessionUser.role === 'ADMIN';
      const isManager = sessionUser.permissions && sessionUser.permissions.includes('HR_ATTENDANCE_APPROVE');
      if (!isAdmin && !isManager) return res.status(403).json({ message: 'Forbidden. Cannot view other employee data.' });
      empId = requestedEmpId;
    }
    if (!empId) return res.status(400).json({ message: 'Employee ID required' });
    empId = parseInt(empId, 10);
    if (isNaN(empId)) return res.status(400).json({ message: 'Invalid Employee ID' });

    const today = new Date().toISOString().slice(0, 10);
    const last15Days = new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const last30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

    const results = await Promise.all([
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
        attributes: ['att_date', 'status', 'in_time'],
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
      User.findOne({ where: { empid: empId }, attributes: ['last_login', 'previous_login'], raw: true }).catch(() => null),
      ProfileUpdateRequest.count({ where: { empid: empId, status: 'Pending' } }).catch(() => 0),
      ProfileUpdateRequest.findAll({
        where: { empid: empId },
        limit: 5,
        order: [['created', 'DESC']],
        raw: true
      }).catch(() => [])
    ]);

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
      user,
      pendingProfileRequests,
      recentProfileRequests
    ] = results;



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
      notifications: pendingLeaves + pendingProfileRequests,
      lastLogin: user?.previous_login ? formatDateTimeDB(user.previous_login) : 'First Login',
      pendingProfileRequests,
      recentProfileRequests,
    });
  } catch (err) {
    console.error('Error fetching employee summary:', err);
    res.status(500).json({ message: err.message || 'Internal server error' });
  }
};
