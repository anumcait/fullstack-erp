const { LeaveApplication, LeaveDetails, LeaveMaster, LeaveApproval, LeavePosition, Attendance } = require('../../models');

const { Sequelize } = require('sequelize');

// Helper to format date as DD-MM-YY
const formatDate = (date) => {
  if (!date) return "";
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = String(d.getFullYear()).slice(2);
  return `${day}-${month}-${year}`;
};

const formatDateTime = (isoString) => {
  if (!isoString) return "";
  const date = new Date(isoString);

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0"); // month is 0-indexed
  const year = date.getFullYear();

  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12; // convert 0 to 12 for 12 AM

  return `${day}-${month}-${year} ${hours}:${minutes} ${ampm}`;
};

const formatDateTime24 = (dateInput) => {
  if (!dateInput) return "";
  const date = new Date(dateInput);
  return date.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  }).replace(",", "").toUpperCase();
};

// Date + 24-hour time in IST
const formatDateTime24IST = (dateInput) => {
  if (!dateInput) return "";
  const date = new Date(dateInput);
  return date.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }).replace(",", "").toUpperCase();
};

const formatNumber = (num) => {
  if (num === null || num === undefined) return 0;
  return parseFloat(num); // removes unnecessary trailing zeros
};


exports.applyLeave = async (req, res) => {
  const { application, leaveDetails } = req.body;
  if (!application || !leaveDetails || leaveDetails.length === 0) {
    return res.status(400).json({ message: 'Invalid request: missing application data or leave details.' });
  }

  const t = await LeaveApplication.sequelize.transaction();

  try {
    const maxLnoResult = await LeaveApplication.findOne({
      attributes: [[Sequelize.fn('COALESCE', Sequelize.fn('MAX', Sequelize.col('lno')), 0), 'maxLno']],
      raw: true
    });

    const nextLno = Number(maxLnoResult.maxLno) + 1;
    application.lno = nextLno;

    const newApp = await LeaveApplication.create(application, { transaction: t });

    const detailsWithLno = leaveDetails.map(d => ({ ...d, lno: nextLno }));
    await LeaveDetails.bulkCreate(detailsWithLno, { transaction: t });

    const leaveMaster = await LeaveMaster.findOne({
      where: { empid: application.empid },
      transaction: t
    });

    if (!leaveMaster) {
      await t.rollback();
      return res.status(400).json({ message: `Leave Balance record not found for Employee ID ${application.empid}. Please contact HR to initialize balance.` });
    }

    await LeavePosition.create({
      lno: nextLno,
      ldate: application.ldate || new Date(),
      empid: application.empid,
      leaves_applied: leaveDetails.reduce((sum, d) => sum + Number(d.nod || 0), 0),
      cls_eligible: leaveMaster.cls_eligible,
      cls_utilized: leaveMaster.cls_utilised,
      cls_balance: leaveMaster.cls_balance,
      els_eligible: leaveMaster.els_eligible,
      els_utilized: leaveMaster.els_utilised,
      els_balance: leaveMaster.els_balance,
      previous_lop_days: 0,
      present_lop_days: 0,
      tot_lop_days: 0,
      unit: application.c_unit || "UNIT1",
      remarks: application.address,
      gempid: application.c_gempid || "admin"
    }, { transaction: t });

    await t.commit();
    res.status(201).json({ message: 'Leave application submitted successfully.', lno: nextLno });
  } catch (error) {
    if (t) await t.rollback();
    console.error("❌ Error in /api/leave/apply:", error);
    
    let errMsg = 'Failed to submit leave application.';
    if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
      errMsg = error.errors.map(e => e.message).join(', ');
    } else if (error.message) {
      errMsg = error.message;
    }
    
    res.status(500).json({ message: errMsg });
  }
};

exports.getNextLeaveNumber = async (req, res) => {
  try {
    const maxLnoResult = await LeaveApplication.findOne({
      attributes: [[Sequelize.fn('COALESCE', Sequelize.fn('MAX', Sequelize.col('lno')), 0), 'maxLno']],
      raw: true
    });
    res.json({ nextLno: Number(maxLnoResult.maxLno) + 1 });
  } catch (error) {
    console.error("Error fetching next leave number:", error);
    res.status(500).json({ message: "Failed to fetch next leave number" });
  }
};

exports.getAllLeaves = async (req, res) => {
  try {
    const leaves = await LeaveApplication.findAll({
      order: [['lno', 'DESC']]
    });
    res.json(leaves);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching leave report' });
  }
};

exports.saveLeaveMaster = async (req, res) => {
  try {
    const { empid } = req.body;
    const [record, created] = await LeaveMaster.findOrCreate({
      where: { empid },
      defaults: req.body
    });
    if (!created) await record.update(req.body);
    res.json({ success: true, record });
  } catch (error) {
    res.status(500).json({ message: 'Error saving leave master' });
  }
};

exports.balanceLeaves = async (req, res) => {
  try {
    const balance = await LeaveMaster.findOne({ where: { empid: req.params.empid } });
    res.json(balance || {});
  } catch (error) {
    res.status(500).json({ message: 'Error fetching balance' });
  }
};

exports.getLeaveApp = async (req, res) => {
  try {
    const app = await LeaveApplication.findOne({
      where: { lno: req.params.lno },
      include: [
        { model: LeaveDetails, as: 'leaveDetails' },
        { model: LeaveMaster, as: 'leaveMaster' }
      ]
    });

    if (!app) return res.status(404).json({ message: "Application not found" });

    // Fetch LeavePosition for additional office use data
    const pos = await LeavePosition.findOne({ where: { lno: app.lno } });

    // Fetch Attendance Stats for the current month
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    const attendanceStats = await Attendance.findAll({
      where: {
        empid: app.empid,
        att_date: { [Sequelize.Op.between]: [startOfMonth, endOfMonth] }
      },
      attributes: [
        [Sequelize.literal("COUNT(CASE WHEN status = 'P' THEN 1 END)"), 'present'],
        [Sequelize.literal("COUNT(CASE WHEN status = 'A' THEN 1 END)"), 'absent'],
        [Sequelize.literal("COUNT(*)"), 'total']
      ],
      raw: true
    });

    const stats = attendanceStats[0] || { present: 0, absent: 0, total: 0 };

    // Format for LeavePreview component
    const formatted = {
      leaveAppNo: app.lno,
      leaveDate: formatDateTime24(app.ldate), // Date with Time
      leaveDateShort: formatDate(app.ldate),
      empNo: app.empid,
      empName: app.ename,
      designation: app.designation,
      department: app.department,
      purpose: app.pofl,
      addressReason: app.address,
      phoneNo: app.phno,
      clsEligible: app.leaveMaster?.cls_eligible || 0,
      clsUtilised: app.leaveMaster?.cls_utilised || 0,
      clsBalance: app.leaveMaster?.cls_balance || 0,
      elsEligible: app.leaveMaster?.els_eligible || 0,
      elsUtilised: app.leaveMaster?.els_utilised || 0,
      elsBalance: app.leaveMaster?.els_balance || 0,
      leavesApplied: pos?.leaves_applied || app.leaveDetails.reduce((sum, d) => sum + Number(d.nod || 0), 0),
      companyDays: today.getDate(), // Working days till today
      presentDays: stats.present || 0,
      absentDays: stats.absent || 0,
      reportDate: formatDateTime24(new Date()),
      leaves: app.leaveDetails.map(d => ({
        leaveFrom: formatDate(d.frmdt),
        leaveTo: formatDate(d.todate),
        leaveDay: d.daydt
      }))
    };

    res.json(formatted);
  } catch (error) {
    console.error("Error fetching leave application:", error);
    res.status(500).json({ message: 'Error fetching application' });
  }
};

exports.getPendingLeaveApplications = async (req, res) => {
  try {
    const apps = await LeaveApplication.findAll({
      where: { status: 0 },
      order: [['lno', 'DESC']]
    });
    res.json(apps);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching pending leaves' });
  }
};

exports.approveLeave = async (req, res) => {
  const { lno, status, cl_sanction = 0, el_sanction = 0 } = req.body;
  const t = await LeaveApplication.sequelize.transaction();
  try {
    const app = await LeaveApplication.findOne({ where: { lno }, transaction: t });
    if (!app) {
      await t.rollback();
      return res.status(404).json({ message: "Application not found" });
    }
    await app.update({ status }, { transaction: t });

    const master = await LeaveMaster.findOne({ where: { empid: app.empid }, transaction: t });
    if (!master) {
      await t.rollback();
      return res.status(404).json({ message: "Leave Master not found" });
    }

    const newClsUtilised = Number(master.cls_utilised || 0) + Number(cl_sanction || 0);
    const newClsBalance = Number(master.cls_balance || 0) - Number(cl_sanction || 0);
    const newElsUtilised = Number(master.els_utilised || 0) + Number(el_sanction || 0);
    const newElsBalance = Number(master.els_balance || 0) - Number(el_sanction || 0);

    await master.update({
      cls_utilised: newClsUtilised,
      cls_balance: newClsBalance,
      els_utilised: newElsUtilised,
      els_balance: newElsBalance,
      cls_last_update: new Date()
    }, { transaction: t });

    await t.commit();
    res.json({ success: true, message: "Leave approved and balances updated" });
  } catch (err) {
    await t.rollback();
    console.error("Approval error:", err);
    res.status(500).json({ success: false, message: "Approval failed", error: err.message });
  }
};

exports.checkLeaveOverlap = async (req, res) => {
  try {
    const { empid, fromDate, toDate } = req.query;
    if (!empid || !fromDate || !toDate) return res.status(400).json({ message: "Missing params" });

    const { Op } = require('sequelize');
    const overlap = await LeaveDetails.findOne({
      where: {
        empno: empid,
        [Op.or]: [
          { frmdt: { [Op.between]: [fromDate, toDate] } },
          { todate: { [Op.between]: [fromDate, toDate] } },
          { [Op.and]: [{ frmdt: { [Op.lte]: fromDate } }, { todate: { [Op.gte]: toDate } }] }
        ]
      }
    });
    res.json({ overlapping: !!overlap });
  } catch (error) {
    console.error("Error checking overlap:", error);
    res.status(500).json({ message: "Internal error" });
  }
};

exports.getLeaveStats = async (req, res) => {
  try {
    const today = new Date();
    const currentMonth = today.getMonth() + 1;

    const stats = await LeaveApplication.findAll({
      attributes: [
        [Sequelize.literal("COUNT(CASE WHEN status = 0 THEN 1 END)"), 'pending'],
        [Sequelize.literal("COUNT(CASE WHEN status = 1 THEN 1 END)"), 'approved'],
        [Sequelize.literal("COUNT(CASE WHEN status = 2 THEN 1 END)"), 'rejected'],
        [Sequelize.literal("COUNT(*)"), 'total']
      ],
      where: Sequelize.where(Sequelize.fn('EXTRACT', Sequelize.literal('MONTH FROM ldate')), currentMonth),
      raw: true
    });

    res.json(stats[0]);
  } catch (error) {
    console.error("Error fetching leave stats:", error);
    res.status(500).json({ message: "Internal error" });
  }
};
