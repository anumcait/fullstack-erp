/**
 * One-time script to fix existing approved leaves that have NULL/incorrect
 * leave_type in leave_approval and emp_attendance.
 *
 * Usage: node scripts/fix-exiting-leave-attendance.js
 */
const { Attendance, LeaveApproval, LeaveDetails, sequelize } = require('../models');

async function fixExistingLeaveAttendance() {
  const t = await sequelize.transaction();
  try {
    const approvedDetails = await LeaveDetails.findAll({
      where: { c_hr_app_status: 'Approved' },
      transaction: t
    });

    let updated = 0;
    for (const detail of approvedDetails) {
      if (!detail.leave_type) continue;
      if (!detail.empno) continue;

      let curr = new Date(detail.frmdt);
      const end = new Date(detail.todate || detail.frmdt);
      while (curr <= end) {
        const attDate = curr.toISOString().split('T')[0];
        // Write to leave_approval (primary source for muster roll)
        await LeaveApproval.upsert({
          lno: detail.lno,
          empid: detail.empno,
          frmdt: attDate,
          todate: attDate,
          nod: 1,
          daydt: detail.daydt || 'FULL DAY',
          leave_type: detail.leave_type,
          cl_sanction: detail.leave_type === 'CL' ? 1 : 0,
          el_sanction: detail.leave_type === 'EL' ? 1 : 0,
          app_status: 'Approved',
          unit: detail.c_unit || null
        }, { transaction: t });
        // Also write to emp_attendance
        await Attendance.upsert({
          empid: detail.empno,
          att_date: attDate,
          status: detail.leave_type,
          leave_type: detail.leave_type,
          app_status: '1',
          unit: detail.c_unit || null
        }, { transaction: t });
        updated++;
        curr.setDate(curr.getDate() + 1);
      }
    }

    await t.commit();
    console.log(`Fixed ${updated} records for approved leaves.`);
    process.exit(0);
  } catch (err) {
    await t.rollback();
    console.error('Fix failed:', err);
    process.exit(1);
  }
}

fixExistingLeaveAttendance();