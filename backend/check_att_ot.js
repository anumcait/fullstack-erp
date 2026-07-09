const { Attendance } = require('./models');
(async () => {
  const data = await Attendance.findAll({
    where: { 
      empid: 1003, 
      ot_hrs: { [require('sequelize').Op.gt]: 0 },
      att_date: { [require('sequelize').Op.between]: ['2026-06-01', '2026-06-30'] }
    }
  });
  for (const r of data) process.stdout.write(JSON.stringify({ date: r.att_date, ot: r.ot_hrs, app_status: r.app_status, hr_app_status: r.hr_app_status, status: r.status }) + '\n');
  process.exit();
})();
