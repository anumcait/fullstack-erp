process.chdir('/app');
const R = require('./constants/attendanceRules');

console.log('Testing lateDeductionForMins function:');
console.log('LATE_FIRST_EXEMPT_MIN:', R.LATE_FIRST_EXEMPT_MIN);
console.log('LATE_MIN_FOR_HOUR_DEDUCTION:', R.LATE_MIN_FOR_HOUR_DEDUCTION);
console.log('LATE_HALF_DAY_MIN:', R.LATE_HALF_DAY_MIN);
console.log('LATE_AFTERNOON_HRS:', R.LATE_AFTERNOON_HRS);

console.log('\nTest cases:');
console.log('First late, 5 min:', R.lateDeductionForMins(5, true, 75, 600), '(expected 0)');
console.log('First late, 15 min:', R.lateDeductionForMins(15, true, 75, 600), '(expected 300)');
console.log('Subsequent, 5 min:', R.lateDeductionForMins(5, false, 75, 600), '(expected 37.5)');
console.log('Subsequent, 15 min:', R.lateDeductionForMins(15, false, 75, 600), '(expected 37.5)');
console.log('Subsequent, 35 min:', R.lateDeductionForMins(35, false, 75, 600), '(expected 300)');
console.log('Subsequent, 90 min:', R.lateDeductionForMins(90, false, 75, 600), '(expected 300)');

console.log('\nlopForLateHrs tests:');
console.log('lop(0.1666):', R.lopForLateHrs(0.1666), '(expect 0)');
console.log('lop(0.17):', R.lopForLateHrs(0.17), '(expect 0.5)');
console.log('lop(4):', R.lopForLateHrs(4), '(expect 0.5)');
console.log('lop(4.5):', R.lopForLateHrs(4.5), '(expect 1)');

console.log('\nreportedLateHrs tests:');
console.log('reported(0.1667):', R.reportedLateHrs(0.1667), '(expect 0.17)');
console.log('reported(4):', R.reportedLateHrs(4), '(expect 0)');
console.log('reported(4.5):', R.reportedLateHrs(4.5), '(expect 0)');