const { WoffApplication, Attendance, ShiftSchedule, ShiftMaster } = require('../models');
const { syncWoffToAttendanceAndSchedule } = require('../controllers/HR/woffController');

async function run() {
  try {
    console.log('Finding approved Woff applications...');
    const approvedWoffs = await WoffApplication.findAll({
      where: { status: 'Approved' },
      order: [['woff_id', 'ASC']]
    });

    console.log(`Found ${approvedWoffs.length} approved Woff applications.`);
    for (const w of approvedWoffs) {
      console.log(`Syncing Woff #${w.woff_id}: empid ${w.empid} (${w.ename}), from ${w.woff_from_date} to ${w.woff_to_date}, shift ${w.shift_cd}...`);
      await syncWoffToAttendanceAndSchedule(w, true);
    }

    console.log('Sync completed successfully.');

    // Verify employee 1005 specifically
    const att1005_4 = await Attendance.findOne({ where: { empid: 1005, att_date: '2026-10-04' } });
    console.log('1005 Attendance on 2026-10-04:', att1005_4 ? {
      att_date: att1005_4.att_date,
      shift: att1005_4.shift,
      status: att1005_4.status,
      in_time: att1005_4.in_time,
      out_time: att1005_4.out_time,
      ot_hrs: att1005_4.ot_hrs,
      app_ot: att1005_4.app_ot,
      hr_app_ot: att1005_4.hr_app_ot,
      woff_day: att1005_4.woff_day
    } : 'Not found');

    const att1005_19 = await Attendance.findOne({ where: { empid: 1005, att_date: '2026-10-19' } });
    console.log('1005 Attendance on 2026-10-19:', att1005_19 ? {
      att_date: att1005_19.att_date,
      shift: att1005_19.shift,
      status: att1005_19.status,
      woff_day: att1005_19.woff_day,
      lop_days: att1005_19.lop_days
    } : 'Not found');

    process.exit(0);
  } catch (err) {
    console.error('Error syncing woffs:', err);
    process.exit(1);
  }
}

run();

