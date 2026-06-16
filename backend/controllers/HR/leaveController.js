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
    // --- Overlap Validation ---
    for (const d of leaveDetails) {
      const overlap = await LeaveDetails.findOne({
        where: {
          empno: application.empid,
          [Sequelize.Op.or]: [
            {
              frmdt: { [Sequelize.Op.lte]: new Date(d.todate) },
              todate: { [Sequelize.Op.gte]: new Date(d.frmdt) }
            }
          ]
        },
        include: [{
          model: LeaveApplication,
          as: 'application',
          where: { status: { [Sequelize.Op.in]: ["Pending", "Approved"] } }
        }],
        transaction: t
      });

      if (overlap) {
        await t.rollback();
        const oDate = new Date(overlap.frmdt).toLocaleDateString('en-GB').replace(/\//g, '-');
        return res.status(400).json({ message: `⚠️ Overlap detected! Leave already exists for: ${oDate} (Application #${overlap.lno})` });
      }
    }

    const maxLnoResult = await LeaveApplication.findOne({
      attributes: [[Sequelize.fn('COALESCE', Sequelize.fn('MAX', Sequelize.col('lno')), 0), 'maxLno']],
      raw: true
    });

    const nextLno = Number(maxLnoResult.maxLno) + 1;
    application.lno = nextLno;

    application.status = "Pending";
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
      include: [{
        model: LeaveDetails,
        as: 'leaveDetails',
        attributes: ['frmdt', 'todate', 'nod', 'daydt', 'remarks']
      }],
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

    // Calculate leave balances
    const clsEligible = Number(app.leaveMaster?.cls_eligible || 0);
    const clsUtilised = Number(app.leaveMaster?.cls_utilised || 0);
    const clsBalance = clsEligible - clsUtilised;
    const elsEligible = Number(app.leaveMaster?.els_eligible || 0);
    const elsUtilised = Number(app.leaveMaster?.els_utilised || 0);
    const elsBalance = elsEligible - elsUtilised;

    // Calculate LOP: if applied leaves > available CL+EL balance, excess goes to LOP Present
    const leavesApplied = Number(pos?.leaves_applied || app.leaveDetails.reduce((sum, d) => sum + Number(d.nod || 0), 0));
    const totalAvailableBalance = Math.max(0, clsBalance) + Math.max(0, elsBalance);
    const lopPresentCalc = leavesApplied > totalAvailableBalance
      ? Number((leavesApplied - totalAvailableBalance).toFixed(2))
      : 0;

    // Read previous LOP from LeavePosition (carried forward from earlier months)
    const lopPrev = Number(pos?.previous_lop_days || 0);
    const lopPres = lopPresentCalc || Number(pos?.present_lop_days || 0);
    const lopTotal = Number((lopPrev + lopPres).toFixed(2));

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
      clsEligible,
      clsUtilised,
      clsBalance,
      elsEligible,
      elsUtilised,
      elsBalance,
      lopOthersPrev: lopPrev,
      lopOthersPres: lopPres,
      lopOthersTotal: lopTotal,
      lopEsi: Number(pos?.tot_lop_days || 0),
      leavesApplied,
      companyDays: today.getDate(), // Working days till today
      presentDays: stats.present || 0,
      absentDays: stats.absent || 0,
      reportDate: formatDateTime24(new Date()),
      ldateRaw: app.ldate,
      firstFromDate: app.leaveDetails?.[0]?.frmdt,
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

const formatLeaveApp = (app) => {
  try {
    const details = app.leaveDetails || [];
    const fromDates = details.map(d => d.frmdt ? new Date(d.frmdt) : null).filter(d => d && !isNaN(d.getTime()));
    const toDates = details.map(d => d.todate ? new Date(d.todate) : null).filter(d => d && !isNaN(d.getTime()));

    let from = null;
    let to = null;

    if (fromDates.length > 0) {
      const minDate = new Date(Math.min(...fromDates.map(d => d.getTime())));
      if (!isNaN(minDate.getTime())) from = minDate.toISOString().split('T')[0];
    }
    if (toDates.length > 0) {
      const maxDate = new Date(Math.max(...toDates.map(d => d.getTime())));
      if (!isNaN(maxDate.getTime())) to = maxDate.toISOString().split('T')[0];
    }

    let statusStr = app.status || "Pending";

    return {
      id: app.lno,
      ldate: app.ldate,
      empId: app.empid,
      empName: app.ename,
      desg: app.designation,
      dept: app.department,
      purpose: app.pofl,
      address: app.address,
      phone: app.phno,
      from: from,
      to: to,
      clBal: app.leaveMaster?.cls_balance || 0,
      elBal: app.leaveMaster?.els_balance || 0,
      status: statusStr,
      remarks: app.remarks || "",
      entry: app.ldate,
      nod: details.length,
      days: details.map(d => ({
        date: d.frmdt,
        dayType: d.daydt || "FULL DAY",
        type: d.leave_type || "",
        remarks: d.remarks || ""
      }))
    };
  } catch (err) {
    console.error("Error formatting leave app:", app.lno, err);
    return { id: app.lno, status: "Error", empName: "Error loading data" };
  }
};

exports.getPendingLeaveApplications = async (req, res) => {
  try {
    const apps = await LeaveApplication.findAll({
      where: { status: 'Pending' },
      include: [
        { model: LeaveDetails, as: 'leaveDetails', attributes: ['frmdt', 'todate', 'daydt', 'remarks', 'leave_type'] },
        { model: LeaveMaster, as: 'leaveMaster', attributes: ['cls_balance', 'els_balance'] }
      ],
      order: [['lno', 'DESC']]
    });
    res.json(apps.map(formatLeaveApp));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching pending leaves' });
  }
};

exports.getAllLeaveApplications = async (req, res) => {
  try {
    const apps = await LeaveApplication.findAll({
      include: [
        { model: LeaveDetails, as: 'leaveDetails', attributes: ['frmdt', 'todate', 'daydt', 'remarks', 'leave_type'] },
        { model: LeaveMaster, as: 'leaveMaster', attributes: ['cls_balance', 'els_balance'] }
      ],
      order: [['lno', 'DESC']]
    });
    res.json(apps.map(formatLeaveApp));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching all leaves' });
  }
};

exports.approveLeave = async (req, res) => {
  const { lno, cl_sanction = 0, el_sanction = 0, days = [] } = req.body;
  const status = 'Approved'; // Default to Approved
  const t = await LeaveApplication.sequelize.transaction();
  try {
    const app = await LeaveApplication.findOne({ where: { lno }, transaction: t });
    if (!app) {
      await t.rollback();
      return res.status(404).json({ message: "Application not found" });
    }

    // Update Application Status
    await app.update({ status }, { transaction: t });

    // Update individual LeaveDetails with status and type
    for (const day of days) {
      await LeaveDetails.update(
        { c_hr_app_status: 'Approved', leave_type: day.type },
        { where: { lno, frmdt: day.date }, transaction: t }
      );
    }

    const master = await LeaveMaster.findOne({ where: { empid: app.empid }, transaction: t });
    if (!master) {
      await t.rollback();
      return res.status(404).json({ message: "Leave Master not found" });
    }

    const newClsUtilised = Number(master.cls_utilised || 0) + Number(cl_sanction || 0);
    const newClsBalance = Number(master.cls_eligible || 0) - newClsUtilised;
    const newElsUtilised = Number(master.els_utilised || 0) + Number(el_sanction || 0);
    const newElsBalance = Number(master.els_eligible || 0) - newElsUtilised;

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

exports.rejectLeave = async (req, res) => {
  const { lno, app_remarks } = req.body;
  const status = 'Rejected'; // Default to Rejected
  const t = await LeaveApplication.sequelize.transaction();
  try {
    const app = await LeaveApplication.findOne({ where: { lno }, transaction: t });
    if (!app) {
      await t.rollback();
      return res.status(404).json({ message: "Application not found" });
    }

    await app.update({ status, remarks: app_remarks }, { transaction: t });
    await LeaveDetails.update(
      { c_hr_app_status: 'Rejected', c_hr_app_remarks: app_remarks },
      { where: { lno }, transaction: t }
    );

    await t.commit();
    res.json({ success: true, message: "Leave rejected successfully" });
  } catch (err) {
    await t.rollback();
    console.error("Rejection error:", err);
    res.status(500).json({ success: false, message: "Rejection failed", error: err.message });
  }
};

exports.cancelApproval = async (req, res) => {
  const { lno } = req.body;
  const t = await LeaveApplication.sequelize.transaction();
  try {
    const app = await LeaveApplication.findOne({
      where: { lno },
      include: [{ model: LeaveDetails, as: 'leaveDetails' }],
      transaction: t
    });

    if (!app || app.status !== 'Approved') {
      await t.rollback();
      return res.status(400).json({ message: "Application not found or not in approved state" });
    }

    // Calculate how much to revert
    let clToRevert = 0;
    let elToRevert = 0;

    for (const d of app.leaveDetails) {
      const weight = (d.daydt === 'FULL DAY' ? 1 : 0.5);
      if (d.leave_type === 'CL') {
        clToRevert += weight;
      } else if (d.leave_type === 'EL') {
        elToRevert += weight;
      }
    }

    // Revert balances in Master
    const master = await LeaveMaster.findOne({ where: { empid: app.empid }, transaction: t });
    if (master) {
      await master.update({
        cls_utilised: Number(master.cls_utilised || 0) - clToRevert,
        cls_balance: Number(master.cls_balance || 0) + clToRevert,
        els_utilised: Number(master.els_utilised || 0) - elToRevert,
        els_balance: Number(master.els_balance || 0) + elToRevert
      }, { transaction: t });
    }

    // Set Application Status to Cancelled (2)
    await app.update({ status: 'Cancelled' }, { transaction: t });

    // Reset Details Status and type
    await LeaveDetails.update(
      { c_hr_app_status: 'Pending', leave_type: null },
      { where: { lno }, transaction: t }
    );

    await t.commit();
    res.json({ success: true, message: "Approval cancelled and balances reverted" });
  } catch (error) {
    await t.rollback();
    console.error("Cancel approval error:", error);
    res.status(500).json({ success: false, message: "Error cancelling approval", error: error.message });
  }
};

exports.cancelPartialApproval = async (req, res) => {
  const { lno, dates = [], remarks = "" } = req.body; // dates is array of dates to cancel
  const t = await LeaveApplication.sequelize.transaction();
  try {
    const app = await LeaveApplication.findOne({
      where: { lno },
      include: [{ model: LeaveDetails, as: 'leaveDetails' }],
      transaction: t
    });

    if (!app) {
      await t.rollback();
      return res.status(404).json({ message: "Application not found" });
    }

    // Filter details to those selected for cancellation (using date strings for comparison)
    const detailsToCancel = app.leaveDetails.filter(d => {
      if (!d.frmdt) return false;
      const dStr = new Date(d.frmdt).toISOString().split('T')[0];
      return dates.includes(dStr);
    });

    if (detailsToCancel.length === 0) {
      await t.rollback();
      return res.status(400).json({
        message: "No matching dates found for cancellation",
        receivedDates: dates,
        availableDates: app.leaveDetails.map(d => d.frmdt ? new Date(d.frmdt).toISOString().split('T')[0] : null)
      });
    }

    // Calculate how much to revert
    let clToRevert = 0;
    let elToRevert = 0;

    for (const d of detailsToCancel) {
      const weight = (d.daydt === 'FULL DAY' ? 1 : 0.5);
      if (d.leave_type === 'CL') {
        clToRevert += weight;
      } else if (d.leave_type === 'EL') {
        elToRevert += weight;
      }
    }

    // Revert balances in Master
    const master = await LeaveMaster.findOne({ where: { empid: app.empid }, transaction: t });
    if (master) {
      await master.update({
        cls_utilised: Number(master.cls_utilised || 0) - clToRevert,
        cls_balance: Number(master.cls_balance || 0) + clToRevert,
        els_utilised: Number(master.els_utilised || 0) - elToRevert,
        els_balance: Number(master.els_balance || 0) + elToRevert
      }, { transaction: t });
    }

    // Update individual Details back to pending (0)
    for (const d of detailsToCancel) {
      await d.update({
        c_hr_app_status: 'Pending',
        leave_type: null,
        c_hr_app_remarks: remarks
      }, { transaction: t });
    }

    // Set main application to Rejected/Cancelled (2) so it appears in the cancelled list
    console.log(`Updating LApp #${lno} status to 'Cancelled'`);
    await app.update({ status: 'Cancelled', remarks: remarks }, { transaction: t });

    await t.commit();
    console.log(`LApp #${lno} cancellation committed.`);
    res.json({ success: true, message: `Successfully cancelled ${detailsToCancel.length} days and reverted balances.` });
  } catch (error) {
    await t.rollback();
    console.error("Partial cancel error:", error);
    res.status(500).json({ success: false, message: "Error in partial cancellation", error: error.message });
  }
};

exports.reopenLeave = async (req, res) => {
  const { lno } = req.body;
  try {
    const app = await LeaveApplication.findOne({ where: { lno } });
    if (!app) return res.status(404).json({ message: "Application not found" });

    // Set status to 0 (Pending)
    await app.update({ status: 'Pending' });

    // Also reset details status to 'Pending'
    await LeaveDetails.update(
      { c_hr_app_status: 'Pending', leave_type: null },
      { where: { lno } }
    );

    res.json({ success: true, message: "Leave application reopened for approval" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error reopening leave" });
  }
};

exports.checkLeaveOverlap = async (req, res) => {
  const { empid, fromDate, toDate } = { ...req.query, ...req.body };
  try {
    if (!empid || !fromDate || !toDate) return res.status(400).json({ message: "Missing params" });

    const overlap = await LeaveDetails.findOne({
      where: {
        empno: empid,
        [Sequelize.Op.or]: [
          {
            frmdt: { [Sequelize.Op.lte]: new Date(toDate) },
            todate: { [Sequelize.Op.gte]: new Date(fromDate) }
          }
        ]
      },
      include: [{
        model: LeaveApplication,
        as: 'application',
        where: { status: { [Sequelize.Op.in]: ["Pending", "Approved"] } }
      }]
    });

    if (overlap) {
      return res.json({
        overlap: true,
        overlapDate: new Date(overlap.frmdt).toLocaleDateString('en-GB').replace(/\//g, '-'),
        lno: overlap.lno
      });
    }
    res.json({ overlap: false });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getLeaveStats = async (req, res) => {
  try {
    const today = new Date();
    const currentMonth = today.getMonth() + 1;

    const stats = await LeaveApplication.findAll({
      attributes: [
        [Sequelize.literal("COUNT(CASE WHEN status = 'Pending' THEN 1 END)"), 'pending'],
        [Sequelize.literal("COUNT(CASE WHEN status = 'Approved' THEN 1 END)"), 'approved'],
        [Sequelize.literal("COUNT(CASE WHEN status = 'Rejected' THEN 1 END)"), 'rejected'],
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
