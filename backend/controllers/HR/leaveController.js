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

// const formatDateTime24 = (isoString) => {
//   if (!isoString) return "";
//   const date = new Date(isoString);

//   const day = String(date.getDate()).padStart(2, "0");
//   const month = String(date.getMonth() + 1).padStart(2, "0"); // month is 0-indexed
//   const year = date.getFullYear();

//   const hours = String(date.getHours()).padStart(2, "0");
//   const minutes = String(date.getMinutes()).padStart(2, "0");

//   return `${day}-${month}-${year} ${hours}:${minutes}`;
// };

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
  }).replace(",", "");
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
  }).replace(",", "");
};

const formatNumber = (num) => {
  if (num === null || num === undefined) return 0;
  return parseFloat(num); // removes unnecessary trailing zeros
};


exports.applyLeave = async (req, res) => {
  const { application, leaveDetails } = req.body;
  console.log(req.body);
  const t = await LeaveApplication.sequelize.transaction();


  try {
    // ✅ Step 1: Get MAX(lno) without lock
    const maxLnoResult = await LeaveApplication.findOne({
      attributes: [
        [Sequelize.fn('COALESCE', Sequelize.fn('MAX', Sequelize.col('lno')), 0), 'maxLno']
      ],
      raw: true // 🟢 ensures plain object
    });

    const nextLno = Number(maxLnoResult.maxLno) + 1;

    // ✅ Step 2: Set lno manually
    application.lno = nextLno;

    // ✅ Step 3: Create master record
    const newApp = await LeaveApplication.create(application, { transaction: t });

    // ✅ Step 4: Insert details
    const detailsWithLno = leaveDetails.map(d => ({ ...d, lno: nextLno }));
    await LeaveDetails.bulkCreate(detailsWithLno, { transaction: t });

    // ✅ Step 4: Insert into LeavePosition

    const leaveMaster = await LeaveMaster.findOne({
      where: { empid: application.empid },
      transaction: t // consistency
    });

    if (!leaveMaster) {
      await t.rollback();
      return res.status(400).json({ message: `Leave Balance record not found for Employee ID ${application.empid}. Please contact HR to initialize leave balance.` });
    }

    await LeavePosition.create({
      lno: nextLno,
      ldate: application.ldate,          // Assuming ldate is in application
      empid: application.empid,
      leaves_applied: leaveDetails.reduce((sum, d) => sum + Number(d.no_of_days || 0), 0),
      cls_eligible: leaveMaster.cls_eligible,
      cls_utilized: leaveMaster.cls_utilised,
      cls_balance: leaveMaster.cls_balance,
      els_eligible: leaveMaster.els_eligible,
      els_utilized: leaveMaster.els_utilised,
      els_balance: leaveMaster.els_balance,
      previous_lop_days: 0,
      present_lop_days: 0,
      tot_lop_days: 0,
      unit: application.unit,
      remarks: application.remarks,
      gempid: application.gempid || null
    }, { transaction: t });

    // ✅ Step 5: Commit transaction
    await t.commit();
    res.status(201).json({ message: 'Leave application submitted successfully.', lno: nextLno });
  } catch (error) {
    await t.rollback();
    console.error("❌ Error in /api/leave/apply:", error);
    res.status(500).json({ message: 'Failed to submit leave application.', error });
  }
};


// Get next available leave application number
exports.getNextLeaveNumber = async (req, res) => {
  try {
    const maxLno = await LeaveApplication.max('lno');
    const nextLno = (maxLno || 0) + 1;

    res.json({ nextLno });  // Sends the response correctly

  } catch (error) {
    console.error('Failed to fetch next leave number:', error);
    res.status(500).json({ message: 'Failed to get next leave application number.' });
  }
};
// exports.getAllLeaves = async (req, res) => {
//   try {
//     const data = await LeaveApplication.findAll({
//       include: [{
//         model: LeaveDetails,
//         as: 'leaveDetails',
//         required: true
//       }],
//       order: [['lno', 'DESC']]
//     });

//      res.json(data);
//    } catch (error) {
//      console.error('❌ Error fetching leaves:', error);
//      res.status(500).json({ message: 'Failed to fetch leave data.', error });
//    }
//  };
exports.getAllLeaves = async (req, res) => {
  try {
    const { empid, from, to } = req.query;

    const where = {};
    if (empid) where.empid = empid;
    if (from && to) where.ldate = { [Op.between]: [from, to] };

    const reports = await LeaveApplication.findAll({
      where,
      include: [{ model: LeaveDetails, as: 'leaveDetails' }],
      order: [['lno', 'DESC']]
    });

    // Map to format ldate
    const formattedReports = reports.map(r => ({
      ...r.toJSON(),
      ldate: formatDateTime24IST(r.ldate)
    }));

    res.json(formattedReports);
  } catch (err) {
    console.error("❌ Error in getLeaveReport:", err);
    res.status(500).json({ message: 'Failed to fetch leave report.' });
  }
};


// Assumes you have associations:
// LeaveApplication.belongsTo(LeaveMaster, { as: "leaveMaster", foreignKey: "empid" });
// LeaveApplication.hasMany(LeaveDetails, { as: "leaveDetails", foreignKey: "lno" });

exports.getPendingLeaveApplications = async (req, res) => {
  try {
    // Find all leave applications with relevant associations
    const applications = await LeaveApplication.findAll({
      where: { status: 'Pending' }, // filter only pending, if you use a status field
      include: [
        {
          model: LeaveDetails,
          as: "leaveDetails",
        },
        {
          model: LeaveMaster,
          as: "leaveMaster",
          attributes: ['cls_balance', 'els_balance']
        }
      ],
      order: [["lno", "DESC"]],
    });

    // Map and flatten for frontend
    const rows = applications.map(app => ({
      id: app.lno,
      empId: app.empid,
      empName: app.empname,
      unit: app.unit,
      dept: app.department,
      desg: app.designation,
      purpose: app.purpose,
      address: app.address,
      phone: app.phone,
      from: app.fromdt,           // update as per your field name
      to: app.todt,               // update as per your field name
      nod: app.nod,
      status: app.status || "Pending", // or map your status value
      entry: app.entrydt,         // update as per your field name
      clBal: app.leaveMaster ? app.leaveMaster.cls_balance : 0,
      elBal: app.leaveMaster ? app.leaveMaster.els_balance : 0,
      days: app.leaveDetails || []
      // add any other fields needed for frontend
    }));

    res.json(rows);

  } catch (error) {
    console.error('Error fetching pending leave applications:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.getPendingLeaveApplications = async (req, res) => {
  try {
    const applications = await LeaveApplication.findAll({
      include: [
        {
          model: LeaveDetails,
          as: "leaveDetails",
          where: { c_hr_app_status: 0 },
        },
        { model: LeaveMaster, as: "leaveMaster", attributes: ['cls_balance', 'els_balance'] }
      ],
      order: [["lno", "DESC"]],
    });

    // Flatten rows
    // const result = applications.flatMap((app) =>
    //   app.leaveDetails.map((d) => ({
    //     id: app.lno,
    //     ldate:app.ldate,
    //     empId: app.empid,
    //     empName: app.ename,
    //     unit: app.c_unit,
    //     dept: app.department,
    //     desg: app.designation,
    //     purpose: app.pofl,
    //     address: app.address,
    //     phone: app.phno,

    //     clBal: 0,
    //     elBal: 0,
    //     status: "Pending",
    //     entry: app.ldate || null,

    //     from: d.frmdt,
    //     to: d.todate,
    //     nod: d.nod,
    //     dayType: d.daydt,
    //     remarks: d.remarks,
    //     cl: d.c_cl_sanction,
    //     el: d.c_el_sanction,
    //   }))
    // );


    const result = applications.map((app) => ({
      id: app.lno,
      ldate: formatDateTime24(app.ldate),
      empId: app.empid,
      empName: app.ename,
      unit: app.c_unit,
      dept: app.department,
      desg: app.designation,
      purpose: app.pofl,
      address: app.address,
      phone: app.phno,
      clBal: app.leaveMaster?.cls_balance || 0,
      elBal: app.leaveMaster?.els_balance || 0,
      status: "Pending",
      entry: app.ldate || null,
      from: app.leaveDetails[0]?.frmdt,
      to: app.leaveDetails[app.leaveDetails.length - 1]?.todate,
      nod: app.leaveDetails.reduce((sum, d) => sum + parseFloat(d.nod || 0), 0),
      days: app.leaveDetails.flatMap((d) => {
        const days = [];
        let current = new Date(d.frmdt);
        const end = new Date(d.todate);
        while (current <= end) {
          days.push({
            date: current.toISOString().split("T")[0],
            dayType: d.daydt,
            type: "",
            remarks: d.remarks,
            cl: d.c_cl_sanction,
            el: d.c_el_sanction,
          });
          current.setDate(current.getDate() + 1);
        }
        return days;
      }),
    }));

    console.log(result);
    res.json(result);

  } catch (err) {
    console.error("Error fetching leave applications:", err);
    res
      .status(500)
      .json({ success: false, message: "Error fetching leave applications" });
  }
};


// routes/leave.js


exports.getLeaveApp = async (req, res) => {
  try {
    const { lno } = req.params;

    const position = await LeavePosition.findOne({ where: { lno } });
    if (!position) return res.status(404).json({ error: "Leave not found" });

    const leaveapp = await LeaveApplication.findOne({ where: { lno } });

    const master = await LeaveMaster.findOne({ where: { empid: position.empid } });
    const details = await LeaveDetails.findAll({ where: { lno: position.lno } });


    // Map leaves
    const leaveRows = details.map(d => ({
      leaveFrom: d.frmdt,
      leaveTo: d.todate,
      leaveDay: d.daydt
    }));

    // Calculate total leave days
    let totalLeaves = 0;
    leaveRows.forEach(leave => {
      if (!leave.leaveFrom || !leave.leaveTo) return; // skip invalid
      const from = new Date(leave.leaveFrom);
      const to = new Date(leave.leaveTo);

      // inclusive difference in days
      let diffDays = (to - from) / (1000 * 3600 * 24) + 1;

      if (leave.leaveDay.toLowerCase() === "half day") diffDays = 0.5; // half day counts as 0.5
      totalLeaves += diffDays;
    });

    const formattedLeaveRows = details.map(d => ({
      leaveFrom: formatDate(d.frmdt),
      leaveTo: formatDate(d.todate),
      leaveDay: d.daydt
    }));

    const response = {
      leaveAppNo: leaveapp.lno,
      leaveDateShort: formatDate(leaveapp.ldate),
      leaveDate: formatDateTime24(leaveapp.ldate),
      empNo: leaveapp?.empid || "",
      empName: leaveapp?.ename || "",
      designation: leaveapp?.designation || "Jr. Executive",
      department: leaveapp?.department || "",
      section: leaveapp?.section || "",
      purpose: leaveapp?.pofl || "",
      addressReason: leaveapp?.address || "",
      phoneNo: leaveapp?.phno || "",
      clsEligible: formatNumber(position?.cls_eligible),
      clsUtilised: formatNumber(position?.cls_utilized),
      clsBalance: formatNumber(position?.cls_balance),
      elsEligible: formatNumber(position?.els_eligible),
      elsUtilised: formatNumber(position?.els_utilized),
      elsBalance: formatNumber(position?.els_balance),
      lopOthersPrev: formatNumber(position?.previous_lop_days),
      lopOthersPres: formatNumber(position?.present_lop_days),
      lopOthersTotal: formatNumber(position?.tot_lop_days),
      lopEsi: formatNumber(0),
      sanctionDays: "",
      reportingDutyOn: "",
      companyDays: "239",
      presentDays: "234",
      absentDays: "5",
      reportDate: formatDateTime24(new Date().toISOString()),
      leaves: formattedLeaveRows,
      leavesApplied: totalLeaves
    };

    res.json(response);
  } catch (err) {
    console.error("Error in getLeaveApp:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};




exports.saveLeaveMaster = async (req, res) => {
  console.log('Leave Master saving...', req.body);

  const leavemaster = req.body;
  const { empid } = leavemaster;

  // Defensive checks
  if (!empid) {
    return res.status(400).json({ message: 'empid is required.' });
  }

  const t = await LeaveMaster.sequelize.transaction();
  try {
    // Show all fields received for debugging
    console.log('leavemaster payload fields:', Object.keys(leavemaster));

    // Validate model matches incoming fields
    const modelFields = Object.keys(LeaveMaster.rawAttributes);
    const invalidFields = Object.keys(leavemaster).filter(field => !modelFields.includes(field));
    if (invalidFields.length > 0) {
      console.error('Invalid fields detected:', invalidFields);
      return res.status(400).json({
        message: 'Invalid fields in payload.',
        invalidFields
      });
    }

    // Find existing record by empid
    const existing = await LeaveMaster.findOne({ where: { empid }, transaction: t });

    if (existing) {
      // Update existing record (ensure only valid columns are passed!)
      await LeaveMaster.update(leavemaster, { where: { empid }, transaction: t });
      await t.commit();
      return res.status(200).json({ message: 'Leave Master updated.', empid });
    } else {
      // Create new record
      await LeaveMaster.create(leavemaster, { transaction: t });
      await t.commit();
      return res.status(201).json({ message: 'Leave Master saved.', empid });
    }
  } catch (err) {
    await t.rollback();
    console.error("❌ Error in Save LeaveMaster:", err);

    // Send detailed error response for debugging
    return res.status(500).json({
      message: 'Failed to save leave master data',
      error: err.message || err,
      stack: err.stack || '',
      empid
    });
  }
};

exports.balanceLeaves = async (req, res) => {

  const empId = parseInt(req.params.empid);

  if (!empId) {
    return res.status(400).json({ message: 'Invalid employee id' });
  }

  try {
    const leaveBalances = await LeaveMaster.findOne({
      where: { empid: empId }
    });

    if (!leaveBalances) {
      return res.json({
        clBalance: 0,
        elBalance: 0,
        clUsed: 0,
        elUsed: 0
      });
      return res.status(404).json({ message: 'Leave balances not found' });
    }

    res.json({
      clBalance: leaveBalances.cls_balance ?? 0,
      elBalance: leaveBalances.els_balance ?? 0,
      clUsed: leaveBalances.cls_utilised ?? 0,
      elUsed: leaveBalances.els_utilised ?? 0
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.approveLeave = async (req, res) => {
  const t = await LeaveApproval.sequelize.transaction(); // transaction for safety

  try {
    const {
      lno,
      empid,
      frmdt,
      todate,
      nod,
      cl_sanction,
      el_sanction,
      app_remarks,
      unit,
      days
    } = req.body;

    // check for existing LeaveMaster
    let leaveMaster = await LeaveMaster.findOne({ where: { empid } });//, unit

    //if (!leaveMaster) {
    //// Create default record if missing
    //leaveMaster = await LeaveMaster.create({
    // empid,
    // unit,
    // cl_balance: 0,
    // el_balance: 0,
    // add other default fields
    //});
    //}
    if (!leaveMaster) {
      return res.status(400).json({
        success: false,
        message: `No LeaveMaster record found for empid ${empid} in unit ${unit}`,
      });
    }

    // 1. Insert into leave_approval
    await LeaveApproval.create({
      lno,
      empid,
      frmdt,
      todate,
      nod,
      cl_sanction,
      el_sanction,
      app_status: 1, // Approved
      app_remarks: req.body.app_remarks || "Approved",
      unit,
      final_status: 1,
      app_date: new Date()
    }, { transaction: t });

    await LeaveDetails.update(
      {
        c_hr_app_status: 1, // approved
        c_hr_app_remarks: req.body.app_remarks || "Approved"
      },
      { where: { lno: req.body.lno } }
    );

    // 2. Update leave_master balances
    const master = await LeaveMaster.findOne({
      where: { empid },
      transaction: t
    });

    if (!master) {
      throw new Error(`LeaveMaster not found for empid ${empid}`);
    }

    // calculate new balances
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
