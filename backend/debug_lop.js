process.chdir('/app');
const R = require('./constants/attendanceRules');

console.log('LATE_HALF_DAY_HRS:', R.LATE_HALF_DAY_HRS);
console.log('LATE_AFTERNOON_HRS:', R.LATE_AFTERNOON_HRS);

console.log('\nDirect function test:');
console.log('0.17 > R.LATE_HALF_DAY_HRS:', 0.17 > R.LATE_HALF_DAY_HRS);
console.log('!(0.17 > R.LATE_HALF_DAY_HRS):', !(0.17 > R.LATE_HALF_DAY_HRS));

const testLop = (lateHrs) => {
  if (!(lateHrs > R.LATE_HALF_DAY_HRS)) return 'RETURN 0';
  return lateHrs > R.LATE_AFTERNOON_HRS ? 1 : 0.5;
};

console.log('\nDirect function test:');
console.log('lop(0.17) =', (() => { if (!(0.17 > R.LATE_HALF_DAY_HRS)) return 0; return 0.17 > R.LATE_AFTERNOON_HRS ? 1 : 0.5; })());
console.log('lop(0.17) via function:', (() => { if (!(0.17 > R.LATE_HALF_DAY_HRS)) return 0; return 0.17 > R.LATE_AFTERNOON_HRS ? 1 : 0.5; })());

console.log('\nDirect lopForLateHrs calls:');
console.log('R.lopForLateHrs(0.17):', R.lopForLateHrs(0.17));
console.log('R.lopForLateHrs(0.1666):', R.lopForLateHrs(0.1666));
console.log('R.lopForLateHrs(0.1667):', R.lopForLateHrs(0.1667));
console.log('R.lopForLateHrs(4):', R.lopForLateHrs(4));
console.log('R.lopForLateHrs(4.5):', R.lopForLateHrs(4.5));