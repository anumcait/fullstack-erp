// Late-coming rules, in one place.
//
// Late hours are stored per date in HH.MM form (0.05 = 5 min, 1.30 = 1h 30m).
// These thresholds were previously hardcoded in more than one controller and
// drifted apart, so they live here now.
//
//   First late of month:
//     <= 10 min -> exempt, no deduction
//     > 10 min  -> half day deduction (perDayBasis/2)
//
//   Subsequent lates:
//     <= 30 min -> half hour deduction (perHourBasis/2)
//     > 30 min  -> half day deduction (perDayBasis/2)
//   late >= 4 hrs -> afternoon arrival, not a late coming
//
// Total for the month is therefore:
//   (no. of half days * half day salary) + (no. of half hours * half hour salary)
//
// The basis is GROSS pay (basic + hra + conveyance + washing allowance). Every
// caller must derive perHourBasis/perDayBasis from gross, so the payslip and the
// muster roll charge the same amount.

// First late of month: exempt if <= this many minutes
const LATE_FIRST_EXEMPT_MIN = 10;

// Subsequent lates: at or below this many minutes -> half hour deduction
//                    above this many minutes -> half day deduction
const LATE_HALF_DAY_MIN = 30;

// This many hours late is treated as an afternoon arrival rather than a late coming.
const LATE_AFTERNOON_HRS = 4;

// Threshold for half-day LOP (loss of pay): 10 minutes in decimal hours
const LATE_HALF_DAY_HRS = 10 / 60;

const lopForLateHrs = (lateHrs) => {
  if (!(lateHrs > LATE_HALF_DAY_HRS)) return 0;
  return lateHrs > LATE_AFTERNOON_HRS ? 1 : 0.5;
};

const reportedLateHrs = (lateHrs) =>
  (lateHrs >= LATE_AFTERNOON_HRS ? 0 : Math.round(lateHrs * 100) / 100);

/**
 * Payroll deduction for one late occurrence, excluding the exempt first one.
 * @param {number} minsLate minutes late for that date
 * @param {boolean} isFirstLate whether this is the first late occurrence
 * @param {number} perHourBasis one hour of gross pay
 * @param {number} perDayBasis one day of gross pay
 * @returns {number} amount to deduct
 */
const lateDeductionForMins = (minsLate, isFirstLate, perHourBasis, perDayBasis) => {
  // First late of month
  if (isFirstLate) {
    return minsLate <= LATE_FIRST_EXEMPT_MIN ? 0 : perDayBasis / 2;
  }
  // Subsequent lates:
  if (minsLate <= LATE_HALF_DAY_MIN) {
    return perHourBasis / 2; // half an hour salary
  }
  return perDayBasis / 2; // >30 min: half day salary
};

module.exports = {
  LATE_FIRST_EXEMPT_MIN,
  LATE_HALF_DAY_MIN,
  LATE_HALF_DAY_HRS,
  LATE_AFTERNOON_HRS,
  LATE_FULL_DAY_HRS: LATE_AFTERNOON_HRS,
  lopForLateHrs,
  reportedLateHrs,
  lateDeductionForMins
};