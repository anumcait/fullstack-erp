const { sequelize, Attendance, LeaveDetails, LeaveApplication } = require('./models');

async function checkLeaves() {
  try {
    const startDate = '2026-03-01';
    const endDate = '2026-03-31';

    // Find anyone who has a leave in March
    const attWithLeave = await Attendance.findAll({
      where: {
        att_date: { [sequelize.Sequelize.Op.between]: [startDate, endDate] }
      }
    });

    const leaveStatuses = new Set();
    const leaveTypes = new Set();
    for (const a of attWithLeave) {
      if (a.status !== 'P' && a.status !== 'Present') {
        leaveStatuses.add(a.status);
      }
      if (a.leave_type) {
        leaveTypes.add(a.leave_type);
      }
    }

    console.log("Distinct non-present statuses:", Array.from(leaveStatuses));
    console.log("Distinct leave types:", Array.from(leaveTypes));

    const leaves = await LeaveDetails.findAll({
      where: {
        daydt: { [sequelize.Sequelize.Op.between]: [startDate, endDate] }
      }
    });

    console.log("LeaveDetails in March:", leaves.length);
    if (leaves.length > 0) {
       console.log("Sample LeaveDetails:");
       console.log(leaves[0].toJSON());
    }

    const leaveApps = await LeaveApplication.findAll({
      where: {
        from_date: { [sequelize.Sequelize.Op.lte]: endDate },
        to_date: { [sequelize.Sequelize.Op.gte]: startDate }
      }
    });
    console.log("LeaveApplications in March:", leaveApps.length);
    if (leaveApps.length > 0) {
       console.log("Sample LeaveApplication:");
       console.log(leaveApps[0].toJSON());
    }

  } catch(e) {
    console.error(e);
  } finally {
    process.exit();
  }
}

checkLeaves();
