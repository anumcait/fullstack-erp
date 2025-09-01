const { LeaveApplication, LeaveDetails, LeaveMaster, LeaveApproval, LeavePosition } = require('../models');

const { Sequelize } = require('sequelize');


exports.applyLeave = async (req, res) => {
  const { application, leaveDetails } = req.body;
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
  where: { empid: application.empid }
  });

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

    res.json(reports);
  } catch (err) {
    console.error("❌ Error in getLeaveReport:", err);
    res.status(500).json({ message: 'Failed to fetch leave report.' });
  }
};

exports.getPendingLeaveApplications = async (req, res) => {
  try {
    const applications = await LeaveApplication.findAll({
      include: [
        {
          model: LeaveDetails,
          as: "leaveDetails",
        },
      ],
      order: [["lno", "DESC"]],
    });

    // Flatten rows
    const result = applications.flatMap((app) =>
      app.leaveDetails.map((d) => ({
        id: app.lno,
        empId: app.empid,
        empName: app.ename,
        unit: app.c_unit,
        dept: app.department,
        desg: app.designation,
        purpose: app.pofl,
        address: app.address,
        phone: app.phno,

        clBal: 0,
        elBal: 0,
        status: "Pending",
        entry: app.ldate || null,

        from: d.frmdt,
        to: d.todate,
        nod: d.nod,
        dayType: d.daydt,
        remarks: d.remarks,
        cl: d.c_cl_sanction,
        el: d.c_el_sanction,
      }))
    );
  console.log(res.json(result));
    res.json(result);
  
  } catch (err) {
    console.error("Error fetching leave applications:", err);
    res
      .status(500)
      .json({ success: false, message: "Error fetching leave applications" });
  }
};


exports.saveLeaveMaster = async (req, res) => {
  console.log('Leave Master saving...', req.body);

  const leavemaster = req.body;
  const { empid } = leavemaster;

  const t = await LeaveMaster.sequelize.transaction();

  try {
    const existing = await LeaveMaster.findOne({ where: { empid }, transaction: t });

    if (existing) {
      await LeaveMaster.update(leavemaster, { where: { empid }, transaction: t });
      await t.commit();
      return res.status(200).json({ message: 'Leave Master updated.', empid });
    } else {
      await LeaveMaster.create(leavemaster, { transaction: t });
      await t.commit();
      return res.status(201).json({ message: 'Leave Master saved.', empid });
    }
  } catch (err) {
    await t.rollback();
    console.error("❌ Error in Save LeaveMaster:", err);

    // Send detailed error response for debugging (remove in production)
    return res.status(500).json({
      message: 'Failed to save leave master data',
      error: err.message || err,
      stack: err.stack || ''
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
    let leaveMaster = await LeaveMaster.findOne({ where: { empid, unit } });

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
      app_remarks,
      unit,
      final_status: 1,
      app_date: new Date()
    }, { transaction: t });

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
    const newClsBalance  = Number(master.cls_balance || 0) - Number(cl_sanction || 0);

    const newElsUtilised = Number(master.els_utilised || 0) + Number(el_sanction || 0);
    const newElsBalance  = Number(master.els_balance || 0) - Number(el_sanction || 0);

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