process.chdir('/app');
const { Attendance, EmployeeMaster, EmpSalary } = require('./models');
const { Op } = require('sequelize');
const R = require('./constants/attendanceRules');

const hhmmToDecimal = (v) => {
  if (!v) return 0;
  const n = Number(v);
  if (!Number.isFinite(n)) return 0;
  const h = Math.floor(n);
  const m = Math.round((n - h) * 100);
  return h + m / 60;
};

(async () => {
  const emp = await EmployeeMaster.findByPk(1002, {
    include: [{ model: require('./models/HR/emp-salary-details').default, as: 'salary', attributes: ['basic'] }]
  });
  if (!emp) { console.log('Employee not found'); process.exit(1); }

  const basic = emp.salary?.basic || 0;
  const workingDays = 30;
  const perDayBasic = basic / 30;
  const perHourBasic = perDayBasic / 8;

  console.log('Employee:', emp.empid, emp.ename);
  console.log('Basic:', basic, 'perDayBasic:', perDayBasic.toFixed(2), 'perHourBasic:', perHourBasic.toFixed(2));

  const { Op } = require('sequelize');
  const atts = await Attendance.findAll({
    where: {
      empid: 1002,
      att_date: { [Op.between]: ['2026-09-01', '2026-09-30'] },
      late_hrs: { [Op.gt]: 0 }
    },
    order: [['att_date', 'ASC']]
  });

  const hhmmToDecimal = (v) => {
    if (!v) return 0;
    const n = Number(v);
    if (!Number.isFinite(n)) return 0;
    const h = Math.floor(n);
    const m = Math.round((n - h) * 100);
    return h + m / 60;
  };

  console.log('\nLate entries:');
  let firstLateSeen = false;
  let totalCost = 0;
  let idx = 0;
  for (const d of atts) {
    const decLate = (() => { const n = Number(d.late_hrs); if (!Number.isFinite(n)) return 0; const h = Math.floor(n); const m = Math.round((n - h) * 100); return h + m / 60; })(d.late_hrs);
    const minsLate = Math.round(decLate * 60);

    console.log(`DEBUG: Before check - firstLateSeen=${firstLateSeen}`);

    const isFirstLate = !firstLateSeen;
    firstLateSeen = true;

    let deduction = 0;
    let note = '';
    if (decLate > 0 && decLate < 4) {
      const isFirstLate = !firstLateSeen;
      firstLateSeen = true;
      const minsLate = Math.round(decLate * 60);
      const ded = R.lateDeductionForMins(minsLate, isFirstLate, perDayBasic/8, perDayBasic);
      
      if (isFirstLate) {
        note = minsLate <= 10 ? 'first late exempt' : 'first late >10min half day';
      } else {
        if (minsLate <= 10) note = 'half hour (1hr basic)';
        else if (minsLate <= 30) note = 'half hour (1hr basic)';
        else note = 'half day';
      }
      totalCost += ded;
      console.log('  ' + d.att_date + ' late_hrs=' + d.late_hrs + ' (' + minsLate + ' min) first=' + isFirstLate + ' -> ded=' + ded + ' (' + note + ')');
    } else {
      console.log('  ' + d.att_date + ' late_hrs=' + d.late_hrs + ' (decLate=' + decLate + ') - skipped (not a late)');
    }
  }
  console.log('\nTotal late_cost:', Math.round(totalCost));
  process.exit(0);
})().catch(e => { console.log('ERR:', e.message); process.exit(1); });