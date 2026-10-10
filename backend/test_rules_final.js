process.chdir('/app');
const R = require('./constants/attendanceRules');

const hhmmToDecimal = (v) => {
  if (!v) return 0;
  const n = Number(v);
  if (!Number.isFinite(n)) return 0;
  const h = Math.floor(n);
  const m = Math.round((n - h) * 100);
  return h + m / 60;
};

const perDayBasic = 600;
const perHourBasic = 75;

const DATES = ['0.05', '0.12', '0.30', '1.30', '0.03'];

console.log('per day basic = Rs ' + perDayBasic + ', per hour basic = Rs ' + perHourBasic);
console.log('');
console.log('date   HH.MM  mins  first?  LOP    deduction   running cost');
console.log('--------------------------------------------------------------');

let firstLateDone = false;
let cost = 0;
const DATES = ['0.05', '0.12', '0.30', '1.30', '0.03'];
DATES.forEach((d, i) => {
  const dec = (function(v) {
    if (!v) return 0;
    const n = Number(v);
    if (!Number.isFinite(n)) return 0;
    const h = Math.floor(n);
    const m = Math.round((n - h) * 100);
    return h + m / 60;
  })(DATES[i]);
  const isFirst = !firstLateDone;
  firstLateDone = true;
  let ded = 0;
  let note = '';
  if (dec > 0 && dec < 4) {
    if (!firstLateDone) {
      firstLateDone = true;
      const mins = Math.round(dec * 60);
      const ded = R.lateDeductionForMins(mins, isFirst, 75, 600);
      note = mins <= 10 ? '1 hr basic' : 'half day basic';
      cost += ded;
    } else {
      const mins = Math.round(dec * 60);
      const ded = R.lateDeductionForMins(mins, false, 75, 600);
      note = mins <= 10 ? '1 hr basic' : (mins <= 30 ? 'half hour' : 'half day');
      cost += ded;
    }
  }
  const lopVal = dec > 0.1667 ? (dec > 4 ? 1 : 0.5) : 0;
  console.log('  ' + (i+1) + '    ' + d.padEnd(6) + String(Math.round(dec*60)).padEnd(5) + (isFirst?'Y':'N').padEnd(6) + String(lop).padEnd(6) + (ded ? 'Rs '+ded.toFixed(0) : '-'.padEnd(11)) + ' ' + note + '   Rs ' + cost);
  if (!firstLateDone && dec > 0 && dec < 4) firstLateDone = true;
  else if (dec > 0 && dec < 4) cost += (Math.round(dec*60) <= 10 ? 75 : 300);
});

console.log('');
console.log('late_cost = Rs ' + cost);
console.log('Expected: 75 + 300 + 300 + 75 = 750');
console.log(cost === 750 ? 'MATCH' : 'MISMATCH - got ' + cost);

console.log('');
console.log('afternoon arrival check (4h+ late):');
console.log('  4h late  -> lop=' + R.lopForLateHrs(4) + ' reportedLateHrs=' + R.reportedLateHrs(4) + ' (not counted as a late)');
console.log('  4.5h late-> lop=' + R.lopForLateHrs(4.5) + ' reportedLateHrs=' + R.reportedLateHrs(4.5));