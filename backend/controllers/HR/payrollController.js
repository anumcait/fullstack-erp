const { Payslip, EmployeeMaster, EmpSalary, EmpOfficial, Attendance, LeaveApplication, LeaveDetails, LeaveApproval, TourApplication, WoffApplication, OnDutyApplication, AdvanceApplication, ExtOt, MusterRollSummary, PayrollAdjustment } = require('../../models');
const { getEffectiveSalary } = require('../../services/effectiveSalary');
const { LATE_HALF_DAY_MIN, lateDeductionForMins } = require('../../constants/attendanceRules');
const { Sequelize, Op } = require('sequelize');

function getMonthName(month) {
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  return months[month - 1];
}

function getOverlappingDays(startDate, endDate, monthStart, monthEnd) {
  if (!startDate || !endDate) return 0;
  const from = new Date(startDate);
  const to = new Date(endDate);
  if (isNaN(from.getTime()) || isNaN(to.getTime())) return 0;
  const mStart = new Date(monthStart);
  const mEnd = new Date(monthEnd);

  const overlapStart = from < mStart ? mStart : from;
  const overlapEnd = to > mEnd ? mEnd : to;

  if (overlapEnd < overlapStart) return 0;

  const diffTime = overlapEnd - overlapStart;
  return Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1;
}

function parseOTToHours(val) {
  if (!val) return 0;
  const str = String(val);
  if (str.includes(':')) {
    const parts = str.split(':');
    return (parseInt(parts[0]) || 0) + (parseInt(parts[1]) || 0) / 60;
  }
  return parseFloat(str) || 0;
}

function parseLateToHours(val) {
  if (!val) return 0;
  const str = String(val);
  if (str.includes(':')) {
    const parts = str.split(':');
    return (parseInt(parts[0]) || 0) * 60 + (parseInt(parts[1]) || 0);
  }
  const num = parseFloat(str) || 0;
  const hours = Math.floor(num);
  const mins = Math.round((num - hours) * 100);
  return hours * 60 + mins;
}

// Deduction lines that a payroll adjustment is allowed to override, mapped to
// their emp_payslip column. Keep this list and ADJUSTABLE_COMPONENTS in step.
const ADJUSTABLE_COLUMNS = {
  PF: 'C_DED_PF',
  ESI: 'C_DED_ESI',
  PT: 'C_DED_PT',
  LIC: 'C_DED_LIC',
  TAX: 'C_DED_TAX',
  ADV: 'C_DED_ADV',
  OTH: 'C_DED_OTH',
  LATE_DED: 'C_LATE_DED_AMT'
};
const ADJUSTABLE_COMPONENTS = Object.keys(ADJUSTABLE_COLUMNS);

/**
 * Corrections saved for one employee-month, as { PF: 1682, ... }.
 * Fetched in one query per payroll run so a regenerated payslip keeps a manual
 * correction instead of reverting to the computed figure.
 */
const getAdjustments = async (empid, monthStr, yearNum, options = {}) => {
  const rows = await PayrollAdjustment.findAll({
    where: { empid, C_MONTH: monthStr, C_YEAR: yearNum },
    ...options
  });
  const map = {};
  rows.forEach(r => { map[r.component] = Number(r.amount) || 0; });
  return map;
};

exports.processMonthlySalary = async (req, res) => {
  const { year, month } = req.body;
  const t = await Payslip.sequelize.transaction();

  console.log(`Processing salary for ${month}/${year}...`);

  // Only allow processing for the immediately preceding month
  const now = new Date();
  const curMonth = now.getMonth() + 1;
  const curYear = now.getFullYear();
  const prevMonthNum = curMonth === 1 ? 12 : curMonth - 1;
  const prevYearNum = curMonth === 1 ? curYear - 1 : curYear;
  if (parseInt(year) !== prevYearNum || parseInt(month) !== prevMonthNum) {
    await t.rollback();
    return res.status(400).json({ message: 'Payslip can only be processed for the immediately preceding month' });
  }

  // Check if already finalized
  const monthStr = getMonthName(parseInt(month));
  const finalizedCount = await Payslip.count({
    where: { C_MONTH: monthStr, C_YEAR: parseInt(year), C_FINAL_STATUS: 2 }
  });
  if (finalizedCount > 0) {
    await t.rollback();
    return res.status(400).json({ message: 'Salary already finalized for this month. Cannot reprocess.' });
  }

  try {
    const employees = await EmployeeMaster.findAll({
      where: { is_active: true },
      include: [
        { model: EmpSalary, as: 'salary' },
        { model: EmpOfficial, as: 'official' },
      ],
    });

    console.log(`Found ${employees.length} active employees`);

    const monthStr = getMonthName(month);
    const monthStart = `${year}-${String(month).padStart(2, '0')}-01`;
    const daysInMonth = new Date(year, month, 0).getDate();
    const endDate = `${year}-${String(month).padStart(2, '0')}-${String(daysInMonth).padStart(2, '0')}`;

    let processedCount = 0;
    let errorCount = 0;

    for (const emp of employees) {
      try {
        // Increments are effective-dated, so resolve the salary in force for
        // this payslip month rather than always reading the current master.
        const salary = await getEffectiveSalary(emp.empid, month, year);
        if (!salary) {
          console.log(`No salary for emp ${emp.empid}, skipping`);
          continue;
        }

        // Adjust working days for mid-month joiners
        const doj = emp.official?.doj ? new Date(emp.official.doj).toISOString().split('T')[0] : null;
        const empStartDate = doj && doj > monthStart ? doj : monthStart;

        const adjustedStart = new Date(empStartDate);
        const workingDays = Math.max(0, Math.round((new Date(endDate) - adjustedStart) / (1000 * 60 * 60 * 24)) + 1);

        // Try muster roll summary first (source of truth)
        const musterSummary = await MusterRollSummary.findOne({
          where: { empid: emp.empid, year: year, month: month }
        });

        // Always fetch raw attendance for late deduction calculation
        const attendanceData = await Attendance.findAll({
          where: {
            empid: emp.empid,
            att_date: { [Sequelize.Op.between]: [empStartDate, endDate] }
          }
        });

        let presentDays, leaveDays, lopDays, absentDays, woffDays, holidays;
        let lateHrs, totalOtHrs;

        if (musterSummary) {
          presentDays = parseFloat(musterSummary.present_days) || 0;
          leaveDays = (parseFloat(musterSummary.cl_days) || 0) + (parseFloat(musterSummary.el_days) || 0);
          lopDays = parseFloat(musterSummary.lop_days) || 0;
          absentDays = parseFloat(musterSummary.absent_days) || 0;
          woffDays = parseFloat(musterSummary.woff_days) || 0;
          holidays = parseFloat(musterSummary.holiday_days) || 0;
          lateHrs = parseFloat(musterSummary.late_hours) || 0;
          totalOtHrs = parseFloat(musterSummary.ot_hours) || 0;
        } else {
          // Fallback: recalculate from raw tables
          const approvedLeaves = await LeaveApproval.findAll({
            where: { empid: emp.empid, frmdt: { [Sequelize.Op.between]: [empStartDate, endDate] } }
          });
          leaveDays = approvedLeaves.reduce((sum, l) => sum + (parseFloat(l.nod) || 1), 0);
          lopDays = approvedLeaves.reduce((sum, l) => {
            if (l.leave_type === 'LOP') {
              const days = parseFloat(l.nod) || 1;
              return sum + (l.daydt === 'HALF DAY' ? days * 0.5 : days);
            }
            return sum;
          }, 0);

          presentDays = attendanceData ? attendanceData.filter(a => a.in_time).length : 0;
          absentDays = Math.max(0, workingDays - presentDays - leaveDays);
          woffDays = attendanceData ? attendanceData.reduce((sum, a) => sum + (parseFloat(a.woff_day) || 0), 0) : 0;
          holidays = attendanceData ? attendanceData.filter(a => a.holiday).length : 0;
          lateHrs = attendanceData ? attendanceData.reduce((sum, a) => sum + (parseFloat(a.late_hrs) || 0), 0) : 0;

          const otEligibleAttendance = attendanceData ? attendanceData.filter(a => {
            if (a.holiday || parseFloat(a.woff_day) > 0) {
              return a.hr_app_status === 1 || a.app_status === 1;
            }
            return parseFloat(a.ot_hrs) > 0;
          }) : [];
          const otHrs = (salary.IS_ot === 'Y' && otEligibleAttendance) ? otEligibleAttendance.reduce((sum, a) => {
            return sum + parseOTToHours(a.hr_app_ot || a.app_ot || a.ot_hrs);
          }, 0) : 0;

          const extOtData = await ExtOt.findAll({
            where: { empid: emp.empid, app_status: '2', ot_date: { [Sequelize.Op.between]: [monthStart, endDate] } }
          });
          const extOtHrs = extOtData.reduce((sum, a) => sum + parseOTToHours(a.ot_hrs), 0);
          totalOtHrs = otHrs + extOtHrs;
        }

        // Pending leaves check
        const pendingLeaves = await LeaveDetails.findAll({
          where: {
            empno: emp.empid,
            c_hr_app_status: 'Pending',
            frmdt: { [Sequelize.Op.lte]: endDate },
            todate: { [Sequelize.Op.gte]: monthStart }
          }
        });
        const hasPendingLeave = pendingLeaves && pendingLeaves.length > 0;

        const approvedTours = await TourApplication.findAll({
          where: {
            empid: emp.empid,
            status: 'Approved',
            [Sequelize.Op.or]: [
              { tour_from_date: { [Sequelize.Op.between]: [monthStart, endDate] } },
              { tour_to_date: { [Sequelize.Op.between]: [monthStart, endDate] } },
            ]
          }
        });

        const monthStartDate = new Date(`${year}-${String(month).padStart(2, '0')}-01`);
        const monthEnd = new Date(year, month, 0);

        let tourDays = 0;
        for (const tour of approvedTours) {
            tourDays += getOverlappingDays(tour.tour_from_date, tour.tour_to_date, monthStartDate, monthEnd);
        }

        // Paid days from muster summary total_days when available (excludes absent), else use old formula
        const paidDays = musterSummary
          ? (parseFloat(musterSummary.total_days) || 0)
          : Math.min(workingDays, Math.max(0, workingDays - lopDays));

        console.log(`Emp ${emp.empid}: ${presentDays} present, ${leaveDays} leave (${lopDays} LOP), ${woffDays} woff, ${holidays} holiday, ${tourDays} tour, ${absentDays} absent = ${paidDays} paid days, ${totalOtHrs} OT`);

        const approvedAdvances = await AdvanceApplication.findAll({
          where: { empid: emp.empid, status: 'Approved' }
        });

        // Get total already deducted from past payslips
        const pastAdvDed = await Payslip.findOne({
          attributes: [[Sequelize.fn('COALESCE', Sequelize.fn('SUM', Sequelize.col('C_DED_ADV')), 0), 'total']],
          where: {
            C_EMPID: emp.empid,
            [Op.or]: [
              { C_YEAR: { [Op.lt]: year } },
              { [Op.and]: [{ C_YEAR: year }, { C_MONTH: { [Op.lt]: getMonthName(month) } }] }
            ]
          },
          raw: true
        });
        const totalAdvDeducted = parseFloat(pastAdvDed?.total) || 0;

        // Filter advances within their deduction window
        let totalMonthly = 0;
        let totalAdvApproved = 0;
        for (const adv of approvedAdvances) {
          totalAdvApproved += parseFloat(adv.advance_amount) || 0;
          let found = false;
          if (adv.deduction_schedule) {
            try {
              const schedule = JSON.parse(adv.deduction_schedule);
              const match = schedule.find(e => parseInt(e.month) === month && parseInt(e.year) === year);
              if (match) { totalMonthly += parseFloat(match.amount) || 0; found = true; }
            } catch (e) { /* invalid JSON, fall through */ }
          }
          if (!found) {
            const fromYear = parseInt(adv.deduct_from_year) || 0;
            const fromMonth = parseInt(adv.deduct_from_month) || 0;
            const installments = parseInt(adv.no_of_installments) || 0;
            if (fromYear === 0 || fromMonth === 0) {
              totalMonthly += parseFloat(adv.monthly_installment) || 0;
            } else if (year > fromYear || (year === fromYear && month >= fromMonth)) {
              const monthsElapsed = (year - fromYear) * 12 + (month - fromMonth) + 1;
              if (monthsElapsed <= installments) {
                totalMonthly += parseFloat(adv.monthly_installment) || 0;
              }
            }
          }
        }

        const basic = parseFloat(salary.basic) || 0;
        const hra = parseFloat(salary.hra) || 0;
        const conv = parseFloat(salary.conveyance) || 0;
        const washingAllowance = parseFloat(salary.washing_allowance) || 0;
        const totSal = basic + hra + conv + washingAllowance;

        const totalMonthDays = new Date(year, month, 0).getDate();
        const perDayBasic = basic / workingDays;
        // Late-coming deductions are charged on gross pay, not basic alone.
        const perDayGross = workingDays > 0 ? totSal / workingDays : 0;
        const perHourGross = perDayGross / 8;
        const earnedBasic = Math.round(paidDays * (basic / totalMonthDays));
        const earnedHra = Math.round(paidDays * (hra / totalMonthDays));
        const earnedConv = Math.round(paidDays * (conv / totalMonthDays));
        const earnedWA = Math.round(paidDays * (washingAllowance / totalMonthDays));

        const otRate = (totSal / totalMonthDays) / 8;
        const earnedOt = Math.round(totalOtHrs * otRate);

        let lateDed = 0;
        let lateTimesCount = 0;
        let lateHalfDaysCount = 0;
        let lateHalfHoursCount = 0;

        const lateRecordsSorted = attendanceData.filter(a => {
          const hrs = parseFloat(a.late_hrs);
          // Exclude half-day arrivals (>=4h late = came in the afternoon) - not a late
          return hrs > 0 && parseLateToHours(a.late_hrs) < 240;
        })
          .sort((a, b) => new Date(a.att_date) - new Date(b.att_date));

        lateRecordsSorted.forEach((record, index) => {
          lateTimesCount++;
          const minsLate = parseLateToHours(record.late_hrs);
          lateHalfHoursCount += minsLate;
          if (index === 0) return; // First late occurrence always exempt

lateDed += lateDeductionForMins(minsLate, false, perHourGross, perDayGross);
          if (minsLate > LATE_HALF_DAY_MIN) lateHalfDaysCount++;
        });

        const bonusEligible = musterSummary
          ? String(musterSummary.att_bonus).trim().toUpperCase() === 'Y'
          : (leaveDays + absentDays + lopDays) === 0;
        const attendanceBonus = (paidDays >= 25 && bonusEligible && !hasPendingLeave) ? 500 : 0;
        const lopAmount = lopDays * perDayBasic;
        const earnedGross = earnedBasic + earnedHra + earnedConv + earnedWA + earnedOt + attendanceBonus;

        let dedPf = 0, dedEsi = 0, dedPt = 0;
        if (salary.IS_pf === 'Y') {
          dedPf = Math.round(Math.min(earnedBasic * 0.12, 1800));
        }
        if (salary.IS_esi === 'Y') {
          dedEsi = Math.ceil(earnedBasic * 0.0075);
        }
        if (earnedGross < 15000) {
          dedPt = 0;
        } else if (earnedGross < 20000) {
          dedPt = 150;
        } else {
          dedPt = 200;
        }

        let dedTax = parseFloat(salary.tds_amount) || 0;
        let dedLic = parseFloat(salary.lic_amount) || 0;

        let dedAdv = 0;
        if (totalAdvDeducted < totalAdvApproved) {
          dedAdv = Math.min(totalMonthly, totalAdvApproved - totalAdvDeducted);
        }

        // Manual corrections win over the computed figures. OTH is derived at
        // write time from lopDays + lateDed, so it is carried separately.
        const adj = await getAdjustments(emp.empid, monthStr, parseInt(year));
        const adjusted = [];
        const use = (key, apply) => {
          if (adj[key] === undefined) return;
          apply(adj[key]);
          adjusted.push(key);
        };
        use('PF', v => { dedPf = v; });
        use('ESI', v => { dedEsi = v; });
        use('PT', v => { dedPt = v; });
        use('LIC', v => { dedLic = v; });
        use('TAX', v => { dedTax = v; });
        use('ADV', v => { dedAdv = v; });
        use('LATE_DED', v => { lateDed = v; });
        if (adjusted.length) {
          console.log(`Emp ${emp.empid}: applied payroll adjustment for ${adjusted.join(', ')}`);
        }
        const dedOth = adj.OTH !== undefined ? adj.OTH : Math.ceil(lopDays + lateDed);

        const totDed = dedPf + dedEsi + dedPt + dedTax + dedLic + dedAdv + lateDed;
        const netAmt = earnedGross - totDed;

        await Payslip.upsert({
          C_MONTH: monthStr,
          C_YEAR: year,
          C_EMPID: emp.empid,
          C_ENAME: emp.ename,
          C_DESIG: emp.deptname || 'Employee',
          C_DEPT: emp.deptname,
          C_TOT_DAYS: workingDays,
          C_DAYS_PRESENT: paidDays,
          C_LEAVES_ALLOWED: leaveDays,
          C_WOFF_HOL: woffDays + holidays,
          C_ABSENT_DAYS: absentDays,
          C_LATE_COMING: lateHrs,
          C_BASIC: basic,
          C_HRA: hra,
          C_CONV: conv,
          C_OTHERS: washingAllowance,
          C_TOT_SAL: totSal,
          C_EARNED_BASIC: earnedBasic.toFixed(2),
          C_EARNED_HRA: earnedHra.toFixed(2),
          C_EARNED_CONV: earnedConv.toFixed(2),
          C_EARNED_OTHERS: earnedWA.toFixed(2),
          C_EARNED_AB: attendanceBonus,
          C_LOP_AMT: lopAmount.toFixed(2),
          C_EARNED_OT: earnedOt.toFixed(2),
          C_OT_HRS: totalOtHrs.toFixed(2),
          C_EARNED_BONUS: attendanceBonus,
          C_EARNED_LUNCH: 0,
          C_EARNED_GROSS: earnedGross.toFixed(2),
          C_DED_PF: dedPf.toFixed(2),
          C_DED_ESI: dedEsi.toFixed(2),
          C_DED_PT: dedPt,
          C_DED_LIC: dedLic,
          C_DED_TAX: dedTax,
          C_DED_ADV: dedAdv,
          C_DED_OTH: dedOth.toFixed(2),
          C_LATE_TIMES: lateTimesCount,
          C_LATE_HALF_DAYS: lateHalfDaysCount,
          C_LATE_HALF_HOURS: lateHalfHoursCount,
          C_LATE_DED_AMT: Math.round(lateDed).toFixed(2),
          C_TOT_DED: Math.round(totDed).toFixed(2),
          C_NET_AMT: Math.round(netAmt).toFixed(2),
          C_PAY_TYPE: salary.pay_mode || 'Bank',
          C_PF_EXIST: salary.IS_pf || 'N',
          C_ESI_EXIST: salary.IS_esi || 'N',
          C_OT_EXIST: salary.IS_ot || 'N',
          C_LIC_EXIST: salary.IS_lic || 'N',
          C_UNIT: emp.uname,
          C_DIVISION: emp.divname,
          C_FINAL_STATUS: 1
        }, { transaction: t });

        processedCount++;
      } catch (empError) {
        console.error(`Error processing employee ${emp.empid}:`, empError.message);
        errorCount++;
      }
    }

    await t.commit();
    res.json({ message: 'Payslip processed', processed: processedCount, errors: errorCount });
  } catch (error) {
    await t.rollback();
    console.error('Error processing payslip:', error);
    res.status(500).json({ message: 'Error processing payslip', error: error.message });
  }
};

exports.getSalaryRegister = async (req, res) => {
  try {
    const { year, month, empid } = req.query;
    const where = {};
    if (year) where.C_YEAR = parseInt(year);
    if (month) where.C_MONTH = getMonthName(parseInt(month));
    if (empid) where.C_EMPID = parseInt(empid);

    const data = await Payslip.findAll({
      where,
      include: [{
        model: EmployeeMaster,
        as: 'employee',
        attributes: ['ename', 'empid', 'employment_status'],
        include: [{
          model: EmpOfficial,
          as: 'official',
          attributes: ['doj', 'c_uan_no', 'esiacno', 'pfacno']
        }]
      }],
      order: [['C_EMPID', 'ASC']]
    });

    res.json(data);
  } catch (error) {
    console.error('Error fetching salary register:', error);
    res.status(500).json({ message: 'Error fetching salary register' });
  }
};

exports.getEmployeePayslip = async (req, res) => {
  try {
    const { empid, year, month } = req.query;
    const monthStr = getMonthName(parseInt(month));

    const payslip = await Payslip.findOne({
      where: {
        C_EMPID: parseInt(empid),
        C_YEAR: parseInt(year),
        C_MONTH: monthStr
      }
    });

    if (!payslip) {
      return res.status(404).json({ message: 'Payslip not found' });
    }

    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const endDate = `${year}-${String(month).padStart(2, '0')}-31`;

    const attendance = await Attendance.findAll({
      where: {
        empid: parseInt(empid),
        att_date: { [Sequelize.Op.between]: [startDate, endDate] }
      }
    });

    const leaves = await LeaveApplication.findAll({
      where: {
        empid: parseInt(empid),
        leave_from_date: { [Sequelize.Op.between]: [startDate, endDate] }
      }
    });

    res.json({
      ...payslip.toJSON(),
      attendance,
      leaves
    });
  } catch (error) {
    console.error('Error fetching payslip:', error);
    res.status(500).json({ message: 'Error fetching payslip' });
  }
};

exports.getYearsWithSalary = async (req, res) => {
  try {
    const years = await Payslip.findAll({
      attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('C_YEAR')), 'year']],
      order: [['C_YEAR', 'DESC']]
    });
    res.json(years.map(y => y.C_YEAR));
  } catch (error) {
    res.status(500).json({ message: 'Error fetching years' });
  }
};

exports.getLatestProcessedDate = async (req, res) => {
  try {
    const monthOrder = `CASE 
      WHEN "C_MONTH" IN ('JAN','JANUARY','01','1') THEN 1
      WHEN "C_MONTH" IN ('FEB','FEBRUARY','02','2') THEN 2
      WHEN "C_MONTH" IN ('MAR','MARCH','03','3') THEN 3
      WHEN "C_MONTH" IN ('APR','APRIL','04','4') THEN 4
      WHEN "C_MONTH" IN ('MAY','MAY','05','5') THEN 5
      WHEN "C_MONTH" IN ('JUN','JUNE','06','6') THEN 6
      WHEN "C_MONTH" IN ('JUL','JULY','07','7') THEN 7
      WHEN "C_MONTH" IN ('AUG','AUGUST','08','8') THEN 8
      WHEN "C_MONTH" IN ('SEP','SEPTEMBER','09','9') THEN 9
      WHEN "C_MONTH" IN ('OCT','OCTOBER','10','10') THEN 10
      WHEN "C_MONTH" IN ('NOV','NOVEMBER','11','11') THEN 11
      WHEN "C_MONTH" IN ('DEC','DECEMBER','12','12') THEN 12
      ELSE 0 END`;

    const latest = await Payslip.findOne({
      attributes: ['C_MONTH', 'C_YEAR'],
      order: [['C_YEAR', 'DESC'], [Sequelize.literal(monthOrder), 'DESC']],
      raw: true
    });

    if (!latest) {
      // If no payroll has ever been processed, default to start of previous year dynamically
      const prevYear = new Date().getFullYear() - 1;
      return res.json({ year: prevYear, month: 1 }); 
    }

    const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    const monthFull = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];
    
    let m = 0;
    const finalMonthStr = (latest.C_MONTH || "").trim().toUpperCase();
    monthNames.forEach((name, idx) => { if (name === finalMonthStr) m = idx + 1; });
    if (m === 0) monthFull.forEach((name, idx) => { if (name === finalMonthStr) m = idx + 1; });

    res.json({ year: Number(latest.C_YEAR), month: m, monthName: finalMonthStr });
  } catch (error) {
    console.error('Error fetching latest processed date:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getAllEmployees = async (req, res) => {
  try {
    const employees = await EmployeeMaster.findAll({
      where: { is_active: true },
      attributes: ['empid', 'ename', 'deptname', 'uname', 'divname']
    });
    res.json(employees);
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ message: 'Error fetching employees', error: error.message });
  }
};

exports.createPayslipByEmployee = async (req, res) => {
  const { empid, year, month } = req.body;
  const t = await Payslip.sequelize.transaction();

  try {
    const emp = await EmployeeMaster.findOne({
      where: { empid: parseInt(empid), status: 'Active' },
      include: [{ model: EmpOfficial, as: 'official' }],
    });
    if (!emp) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    const salary = await getEffectiveSalary(emp.empid, parseInt(month, 10), year);
    if (!salary) {
      return res.status(400).json({ message: 'Salary not configured for this employee' });
    }

    const monthStr = getMonthName(month);
    const monthStartStr = `${year}-${String(month).padStart(2, '0')}-01`;
    const monthDays = new Date(year, month, 0).getDate();
    const endDate = `${year}-${String(month).padStart(2, '0')}-${String(monthDays).padStart(2, '0')}`;

    const doj = emp.official?.doj ? new Date(emp.official.doj).toISOString().split('T')[0] : null;
    const empStartDate = doj && doj > monthStartStr ? doj : monthStartStr;

    const adjustedStart = new Date(empStartDate);
    const workingDays = Math.max(0, Math.round((new Date(endDate) - adjustedStart) / (1000 * 60 * 60 * 24)) + 1);

    // Try muster roll summary first (source of truth)
    const musterSummary = await MusterRollSummary.findOne({
      where: { empid: emp.empid, year: year, month: month }
    });

    // Always fetch raw attendance for late deduction calculation
    const attendanceData = await Attendance.findAll({
      where: {
        empid: emp.empid,
        att_date: { [Sequelize.Op.between]: [empStartDate, endDate] }
      }
    });

    let presentDays, leaveDays, lopDays, absentDays, woffDays, holidays;
    let lateHrs, totalOtHrs;

    if (musterSummary) {
      lateHrs = parseFloat(musterSummary.late_hours) || 0;
      presentDays = parseFloat(musterSummary.present_days) || 0;
      leaveDays = (parseFloat(musterSummary.cl_days) || 0) + (parseFloat(musterSummary.el_days) || 0);
      lopDays = parseFloat(musterSummary.lop_days) || 0;
      absentDays = parseFloat(musterSummary.absent_days) || 0;
      woffDays = parseFloat(musterSummary.woff_days) || 0;
      holidays = parseFloat(musterSummary.holiday_days) || 0;
      totalOtHrs = parseFloat(musterSummary.ot_hours) || 0;
    } else {
      const approvedLeaves = await LeaveApproval.findAll({
        where: { empid: emp.empid, frmdt: { [Sequelize.Op.between]: [empStartDate, endDate] } }
      });
      leaveDays = approvedLeaves.reduce((sum, l) => sum + (parseFloat(l.nod) || 1), 0);
      lopDays = approvedLeaves.reduce((sum, l) => {
        if (l.leave_type === 'LOP') {
          const days = parseFloat(l.nod) || 1;
          return sum + (l.daydt === 'HALF DAY' ? days * 0.5 : days);
        }
        return sum;
      }, 0);

      presentDays = attendanceData.filter(a => a.in_time).length;
      absentDays = Math.max(0, workingDays - presentDays - leaveDays);
      woffDays = attendanceData.reduce((sum, a) => sum + (parseFloat(a.woff_day) || 0), 0);
      holidays = attendanceData.filter(a => a.holiday).length;
      lateHrs = attendanceData.reduce((sum, a) => sum + (parseFloat(a.late_hrs) || 0), 0);

      const otEligibleAttendance = attendanceData.filter(a => {
        if (a.holiday || parseFloat(a.woff_day) > 0) {
          return a.hr_app_status === 1 || a.app_status === 1;
        }
        return parseFloat(a.ot_hrs) > 0;
      });
      const otHrs = (salary.IS_ot === 'Y' && otEligibleAttendance) ? otEligibleAttendance.reduce((sum, a) => {
        return sum + parseOTToHours(a.hr_app_ot || a.app_ot || a.ot_hrs);
      }, 0) : 0;

      const extOtData = await ExtOt.findAll({
        where: { empid: emp.empid, app_status: '2', ot_date: { [Sequelize.Op.between]: [monthStartStr, endDate] } }
      });
      const extOtHrs = extOtData.reduce((sum, a) => sum + parseOTToHours(a.ot_hrs), 0);
      totalOtHrs = otHrs + extOtHrs;
    }

    const pendingLeaves = await LeaveDetails.findAll({
      where: {
        empno: emp.empid,
        c_hr_app_status: 'Pending',
        frmdt: { [Sequelize.Op.lte]: endDate },
        todate: { [Sequelize.Op.gte]: monthStartStr }
      }
    });
    const hasPendingLeave = pendingLeaves && pendingLeaves.length > 0;

    const approvedTours = await TourApplication.findAll({
      where: {
        empid: emp.empid,
        status: 'Approved',
        [Sequelize.Op.or]: [
          { tour_from_date: { [Sequelize.Op.between]: [monthStartStr, endDate] } },
          { tour_to_date: { [Sequelize.Op.between]: [monthStartStr, endDate] } },
        ]
      }
    });

    const monthStart = new Date(`${year}-${String(month).padStart(2, '0')}-01`);
    const monthEnd = new Date(year, month, 0);

    let tourDays = 0;
    for (const tour of approvedTours) {
      tourDays += getOverlappingDays(tour.tour_from_date, tour.tour_to_date, monthStart, monthEnd);
    }

    const paidDays = musterSummary
      ? (parseFloat(musterSummary.total_days) || 0)
      : Math.min(workingDays, Math.max(0, workingDays - lopDays));

    const basic = parseFloat(salary.basic) || 0;
    const hra = parseFloat(salary.hra) || 0;
    const conv = parseFloat(salary.conveyance) || 0;
    const washingAllowance = parseFloat(salary.washing_allowance) || 0;
    const totSal = basic + hra + conv + washingAllowance;

    const totalMonthDays = new Date(year, month, 0).getDate();
    const perDayBasic = workingDays > 0 ? basic / workingDays : 0;
    // Late-coming deductions are charged on gross pay, not basic alone.
    const perDayGross = workingDays > 0 ? totSal / workingDays : 0;
    const perHourGross = perDayGross / 8;
    const earnedBasic = Math.round(paidDays * (basic / totalMonthDays));
    const earnedHra = Math.round(paidDays * (hra / totalMonthDays));
    const earnedConv = Math.round(paidDays * (conv / totalMonthDays));
    const earnedWA = Math.round(paidDays * (washingAllowance / totalMonthDays));

    const otRate = (totSal / totalMonthDays) / 8;
    const earnedOt = Math.round(totalOtHrs * otRate);
    const bonusEligible = musterSummary
      ? String(musterSummary.att_bonus).trim().toUpperCase() === 'Y'
      : (leaveDays + absentDays + lopDays) === 0;
    const attendanceBonus = (paidDays >= 25 && bonusEligible && !hasPendingLeave) ? 500 : 0;
    const lopAmount = lopDays * perDayBasic;

    let lateDed = 0;
    let lateTimesCount = 0;
    let lateHalfDaysCount = 0;
    let lateHalfHoursCount = 0;

    const lateRecordsSorted = attendanceData.filter(a => {
      const hrs = parseFloat(a.late_hrs);
      // Exclude half-day arrivals (>=4h late = came in the afternoon) - not a late
      return hrs > 0 && parseLateToHours(a.late_hrs) < 240;
    })
      .sort((a, b) => new Date(a.att_date) - new Date(b.att_date));

    lateRecordsSorted.forEach((record, index) => {
      lateTimesCount++;
      const minsLate = parseLateToHours(record.late_hrs);
      lateHalfHoursCount += minsLate;
      if (index === 0) return; // First late occurrence always exempt

      lateDed += lateDeductionForMins(minsLate, false, perHourGross, perDayGross);
      if (minsLate > LATE_HALF_DAY_MIN) lateHalfDaysCount++;
    });

    const earnedGross = earnedBasic + earnedHra + earnedConv + earnedWA + earnedOt + attendanceBonus;

    let dedPf = 0, dedEsi = 0, dedPt = 0;
    if (salary.IS_pf === 'Y') dedPf = Math.round(Math.min(earnedBasic * 0.12, 1800));
    if (salary.IS_esi === 'Y') dedEsi = Math.ceil(earnedBasic * 0.0075);
    if (earnedGross < 15000) {
      dedPt = 0;
    } else if (earnedGross < 20000) {
      dedPt = 150;
    } else {
      dedPt = 200;
    }

    let dedTax = parseFloat(salary.tds_amount) || 0;
    let dedLic = parseFloat(salary.lic_amount) || 0;

    // Advance deduction
    const approvedAdvances = await AdvanceApplication.findAll({
      where: { empid: emp.empid, status: 'Approved' }
    });
    const pastAdvDed = await Payslip.findOne({
      attributes: [[Sequelize.fn('COALESCE', Sequelize.fn('SUM', Sequelize.col('C_DED_ADV')), 0), 'total']],
      where: {
        C_EMPID: emp.empid,
        [Op.or]: [
          { C_YEAR: { [Op.lt]: year } },
          { [Op.and]: [{ C_YEAR: year }, { C_MONTH: { [Op.lt]: getMonthName(month) } }] }
        ]
      },
      raw: true
    });
    const totalAdvDeducted = parseFloat(pastAdvDed?.total) || 0;
    let totalMonthly = 0;
    let totalAdvApproved = 0;
    for (const adv of approvedAdvances) {
      totalAdvApproved += parseFloat(adv.advance_amount) || 0;
      let found = false;
      if (adv.deduction_schedule) {
        try {
          const schedule = JSON.parse(adv.deduction_schedule);
          const match = schedule.find(e => parseInt(e.month) === month && parseInt(e.year) === year);
          if (match) { totalMonthly += parseFloat(match.amount) || 0; found = true; }
        } catch (e) { /* invalid JSON, fall through */ }
      }
      if (!found) {
        const fromYear = parseInt(adv.deduct_from_year) || 0;
        const fromMonth = parseInt(adv.deduct_from_month) || 0;
        const installments = parseInt(adv.no_of_installments) || 0;
        if (fromYear === 0 || fromMonth === 0) {
          totalMonthly += parseFloat(adv.monthly_installment) || 0;
        } else if (year > fromYear || (year === fromYear && month >= fromMonth)) {
          const monthsElapsed = (year - fromYear) * 12 + (month - fromMonth) + 1;
          if (monthsElapsed <= installments) {
            totalMonthly += parseFloat(adv.monthly_installment) || 0;
          }
        }
      }
    }
    let dedAdv = 0;
    if (totalAdvDeducted < totalAdvApproved) {
      dedAdv = Math.min(totalMonthly, totalAdvApproved - totalAdvDeducted);
    }

    // Manual corrections win over the computed figures.
    const adj = await getAdjustments(emp.empid, monthStr, year);
    const adjusted = [];
    const use = (key, apply) => {
      if (adj[key] === undefined) return;
      apply(adj[key]);
      adjusted.push(key);
    };
    use('PF', v => { dedPf = v; });
    use('ESI', v => { dedEsi = v; });
    use('PT', v => { dedPt = v; });
    use('LIC', v => { dedLic = v; });
    use('TAX', v => { dedTax = v; });
    use('ADV', v => { dedAdv = v; });
    use('LATE_DED', v => { lateDed = v; });
    if (adjusted.length) {
      console.log(`Emp ${emp.empid}: applied payroll adjustment for ${adjusted.join(', ')}`);
    }
    const dedOth = adj.OTH !== undefined ? adj.OTH : Math.ceil(lopDays + lateDed);

    const totDed = dedPf + dedEsi + dedPt + dedTax + dedLic + dedAdv + lateDed;
    const netAmt = earnedGross - totDed;

    const payslip = await Payslip.upsert({
      C_MONTH: monthStr,
      C_YEAR: year,
      C_EMPID: emp.empid,
      C_ENAME: emp.ename,
      C_DESIG: emp.deptname || 'Employee',
      C_DEPT: emp.deptname,
      C_TOT_DAYS: workingDays,
      C_DAYS_PRESENT: paidDays,
      C_LEAVES_ALLOWED: leaveDays,
      C_WOFF_HOL: woffDays + holidays,
      C_ABSENT_DAYS: absentDays,
      C_LATE_COMING: lateHrs,
      C_BASIC: basic,
      C_HRA: hra,
      C_CONV: conv,
      C_OTHERS: washingAllowance,
      C_TOT_SAL: totSal,
      C_EARNED_BASIC: earnedBasic.toFixed(2),
      C_EARNED_HRA: earnedHra.toFixed(2),
      C_EARNED_CONV: earnedConv.toFixed(2),
      C_EARNED_OTHERS: earnedWA.toFixed(2),
      C_EARNED_AB: attendanceBonus,
      C_LOP_AMT: lopAmount.toFixed(2),
      C_EARNED_OT: earnedOt.toFixed(2),
      C_OT_HRS: totalOtHrs.toFixed(2),
      C_EARNED_LUNCH: 0,
      C_EARNED_GROSS: earnedGross.toFixed(2),
      C_DED_PF: dedPf.toFixed(2),
      C_DED_ESI: dedEsi.toFixed(2),
      C_DED_PT: dedPt,
      C_DED_LIC: dedLic,
      C_DED_TAX: dedTax,
      C_DED_ADV: dedAdv,
      C_DED_OTH: dedOth.toFixed(2),
      C_LATE_TIMES: lateTimesCount,
      C_LATE_HALF_DAYS: lateHalfDaysCount,
      C_LATE_HALF_HOURS: lateHalfHoursCount,
      C_LATE_DED_AMT: Math.round(lateDed).toFixed(2),
      C_TOT_DED: Math.round(totDed).toFixed(2),
      C_NET_AMT: Math.round(netAmt).toFixed(2),
      C_PAY_TYPE: salary.pay_mode || 'Bank',
      C_PF_EXIST: salary.IS_pf || 'N',
      C_ESI_EXIST: salary.IS_esi || 'N',
      C_OT_EXIST: salary.IS_ot || 'N',
      C_LIC_EXIST: salary.IS_lic || 'N',
      C_UNIT: emp.uname,
      C_DIVISION: emp.divname,
      C_FINAL_STATUS: 1
    }, { transaction: t });

    await t.commit();
    res.json({ message: 'Payslip created successfully', payslip });
  } catch (error) {
    await t.rollback();
    console.error('Error creating payslip:', error);
    res.status(500).json({ message: 'Error creating payslip', error: error.message });
  }
};

exports.getSalaryDetails = async (req, res) => {
  try {
    const employees = await EmployeeMaster.findAll({
      where: { is_active: true },
      order: [['empid', 'ASC']]
    });

    // Resolve against the current month so an increment dated for a future
    // month is not applied here early — this screen is what feeds the payroll run.
    const now = new Date();
    const curMonth = parseInt(req.query.month, 10) || now.getMonth() + 1;
    const curYear = parseInt(req.query.year, 10) || now.getFullYear();

    const employeeData = await Promise.all(employees.map(async (emp) => {
      const salary = await getEffectiveSalary(emp.empid, curMonth, curYear);
      return {
        ...emp.toJSON(),
        salary: salary ? salary.toJSON() : null
      };
    }));

    res.json(employeeData);
  } catch (error) {
    console.error('Error fetching salary details:', error);
    res.status(500).json({ message: 'Error fetching salary details' });
  }
};

exports.saveSalaryDetails = async (req, res) => {
  try {
    const data = req.body;

    await EmpSalary.upsert({
      empid: data.empid,
      basic: data.basic || 0,
      hra: data.hra || 0,
      conveyance: data.conveyance || 0,
      washing_allowance: data.washing_allowance || 0,
      others1: 0,
      others2: 0,
      others3: 0,
      IS_esi: data.IS_esi || 'N',
      IS_pf: data.IS_pf || 'N',
      IS_lic: data.IS_lic || 'N',
      IS_ot: data.IS_ot || 'N',
      tds_amount: data.tds_amount || 0,
      lic_amount: data.lic_amount || 0,
      pay_mode: data.pay_mode || 'Bank',
      c_last_update: new Date(),
      c_upd_userid: req.session?.userId || null
    });

    res.json({ message: 'Salary details saved successfully' });
  } catch (error) {
    console.error('Error saving salary details:', error);
    res.status(500).json({ message: 'Error saving salary details' });
  }
};

exports.checkPayslipStatus = async (req, res) => {
  try {
    const { empid, year, month } = req.query;
    const y = parseInt(year);
    const m = parseInt(month);

    const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    const monthFull = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];
    const monthMap = {};
    monthNames.forEach((name, idx) => { 
      monthMap[name] = idx + 1; 
      monthMap[monthFull[idx]] = idx + 1;
      monthMap[String(idx + 1)] = idx + 1;
      monthMap[String(idx + 1).padStart(2, '0')] = idx + 1;
    });
    
    const monthOrder = `CASE 
      WHEN "C_MONTH" IN ('JAN','JANUARY','01','1') THEN 1
      WHEN "C_MONTH" IN ('FEB','FEBRUARY','02','2') THEN 2
      WHEN "C_MONTH" IN ('MAR','MARCH','03','3') THEN 3
      WHEN "C_MONTH" IN ('APR','APRIL','04','4') THEN 4
      WHEN "C_MONTH" IN ('MAY','MAY','05','5') THEN 5
      WHEN "C_MONTH" IN ('JUN','JUNE','06','6') THEN 6
      WHEN "C_MONTH" IN ('JUL','JULY','07','7') THEN 7
      WHEN "C_MONTH" IN ('AUG','AUGUST','08','8') THEN 8
      WHEN "C_MONTH" IN ('SEP','SEPTEMBER','09','9') THEN 9
      WHEN "C_MONTH" IN ('OCT','OCTOBER','10','10') THEN 10
      WHEN "C_MONTH" IN ('NOV','NOVEMBER','11','11') THEN 11
      WHEN "C_MONTH" IN ('DEC','DECEMBER','12','12') THEN 12
      ELSE 0 END`;

    const latest = await Payslip.findOne({
      attributes: ['C_MONTH', 'C_YEAR'],
      order: [
        ['C_YEAR', 'DESC'],
        [Sequelize.literal(monthOrder), 'DESC']
      ],
      raw: true
    });

    if (!latest) {
      return res.json({ generated: false, count: 0 });
    }

    const finalMonthStr = (latest.C_MONTH || "").trim().toUpperCase();
    const latestMonthNum = monthMap[finalMonthStr] || 0;
    const latestYearNum = Number(latest.C_YEAR);
    
    const isClosed = (y < latestYearNum) || (y === latestYearNum && m <= latestMonthNum);

    res.json({ 
      generated: isClosed, 
      details: { C_MONTH: finalMonthStr, C_YEAR: latestYearNum }
    });
  } catch (error) {
    console.error('Error checking payslip status:', error);
    res.status(500).json({ message: 'Error checking status' });
  }
};

exports.getLatestProcessedDate = async (req, res) => {
  try {
    const monthOrder = `CASE 
      WHEN "C_MONTH" IN ('JAN','JANUARY','01','1') THEN 1
      WHEN "C_MONTH" IN ('FEB','FEBRUARY','02','2') THEN 2
      WHEN "C_MONTH" IN ('MAR','MARCH','03','3') THEN 3
      WHEN "C_MONTH" IN ('APR','APRIL','04','4') THEN 4
      WHEN "C_MONTH" IN ('MAY','MAY','05','5') THEN 5
      WHEN "C_MONTH" IN ('JUN','JUNE','06','6') THEN 6
      WHEN "C_MONTH" IN ('JUL','JULY','07','7') THEN 7
      WHEN "C_MONTH" IN ('AUG','AUGUST','08','8') THEN 8
      WHEN "C_MONTH" IN ('SEP','SEPTEMBER','09','9') THEN 9
      WHEN "C_MONTH" IN ('OCT','OCTOBER','10','10') THEN 10
      WHEN "C_MONTH" IN ('NOV','NOVEMBER','11','11') THEN 11
      WHEN "C_MONTH" IN ('DEC','DECEMBER','12','12') THEN 12
      ELSE 0 END`;

    const latest = await Payslip.findOne({
      attributes: ['C_MONTH', 'C_YEAR'],
      order: [['C_YEAR', 'DESC'], [Sequelize.literal(monthOrder), 'DESC']],
      raw: true
    });

    if (!latest) {
      const prevYear = new Date().getFullYear() - 1;
      return res.json({ year: prevYear, month: 1 });
    }

    const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    const monthFull = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];
    const monthMap = {};
    monthNames.forEach((name, idx) => { monthMap[name] = idx + 1; });
    monthFull.forEach((name, idx) => { monthMap[name] = idx + 1; });

    const finalMonthStr = (latest.C_MONTH || "").trim().toUpperCase();
    const m = monthMap[finalMonthStr] || 0;

    res.json({ year: Number(latest.C_YEAR), month: m, monthName: finalMonthStr });
  } catch (error) {
    console.error('Error fetching latest processed date:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.finalizeSalary = async (req, res) => {
  try {
    const { month, year } = req.body;
    if (!month || !year) {
      return res.status(400).json({ message: 'Month and year are required' });
    }

    const monthStr = getMonthName(parseInt(month));

    const count = await Payslip.count({
      where: { C_MONTH: monthStr, C_YEAR: parseInt(year) }
    });
    if (count === 0) {
      return res.status(400).json({ message: 'No payslips found for this month. Process payslips first.' });
    }

    const finalizedCount = await Payslip.count({
      where: { C_MONTH: monthStr, C_YEAR: parseInt(year), C_FINAL_STATUS: 2 }
    });
    if (finalizedCount > 0) {
      return res.status(400).json({ message: 'Salary already finalized for this month.' });
    }

    await Payslip.update(
      { C_FINAL_STATUS: 2 },
      { where: { C_MONTH: monthStr, C_YEAR: parseInt(year) } }
    );

    console.log(`Salary finalized for ${monthStr} ${year}`);
    res.json({ message: `Salary finalized for ${monthStr} ${year}`, finalized: true });
  } catch (error) {
    console.error('Error finalizing salary:', error);
    res.status(500).json({ message: 'Error finalizing salary', error: error.message });
  }
};

exports.getFinalizeStatus = async (req, res) => {
  try {
    const { month, year } = req.query;
    if (!month || !year) {
      return res.status(400).json({ message: 'Month and year are required' });
    }

    const monthStr = getMonthName(parseInt(month));

    const finalizedCount = await Payslip.count({
      where: { C_MONTH: monthStr, C_YEAR: parseInt(year), C_FINAL_STATUS: 2 }
    });

    res.json({ finalized: finalizedCount > 0 });
  } catch (error) {
    console.error('Error checking finalize status:', error);
    res.status(500).json({ message: 'Error checking finalize status' });
  }
};

exports.getAdjustableComponents = async (req, res) => {
  res.json({ components: ADJUSTABLE_COMPONENTS, columns: ADJUSTABLE_COLUMNS });
};

exports.getAdjustments = async (req, res) => {
  try {
    const { month, year, empid } = req.query;
    const where = {};
    if (year) where.C_YEAR = parseInt(year, 10);
    if (month) where.C_MONTH = getMonthName(parseInt(month, 10));
    if (empid) where.empid = parseInt(empid, 10);
    const rows = await PayrollAdjustment.findAll({ where, order: [['C_YEAR', 'DESC'], ['C_MONTH', 'ASC'], ['empid', 'ASC']] });
    res.json(rows);
  } catch (error) {
    console.error('Error fetching payroll adjustments:', error);
    res.status(500).json({ message: 'Error fetching payroll adjustments' });
  }
};

/**
 * Save a correction and apply it to the already-processed payslip straight away,
 * so the user sees the new figure without re-running the month. The stored row
 * is what makes it survive the next regeneration.
 */
exports.saveAdjustment = async (req, res) => {
  const t = await Payslip.sequelize.transaction();
  try {
    const empid = parseInt(req.body.empid, 10);
    const component = String(req.body.component || '').toUpperCase();
    const amount = parseFloat(req.body.amount);
    const reason = String(req.body.reason || '').trim();
    const month = parseInt(req.body.month, 10);
    const year = parseInt(req.body.year, 10);
    const monthStr = getMonthName(month);

    const errors = {};
    if (!empid) errors.empid = 'Employee is required';
    if (!ADJUSTABLE_COLUMNS[component]) errors.component = 'Choose a valid component';
    if (!Number.isFinite(amount) || amount < 0) errors.amount = 'Enter a valid amount';
    if (!reason) errors.reason = 'Reason is mandatory';
    if (!month || month < 1 || month > 12) errors.month = 'Select a valid month';
    if (!year || year < 2000 || year > 2100) errors.year = 'Select a valid year';
    if (Object.keys(errors).length) {
      await t.rollback();
      return res.status(400).json({ message: 'Please correct the highlighted fields', errors });
    }

    const slip = await Payslip.findOne({
      where: { C_EMPID: empid, C_MONTH: monthStr, C_YEAR: year },
      transaction: t
    });
    if (!slip) {
      await t.rollback();
      return res.status(400).json({ message: `No payslip generated for ${monthStr} ${year} - process the month first.` });
    }
    if (slip.C_FINAL_STATUS === 2) {
      await t.rollback();
      return res.status(400).json({ message: `${monthStr} ${year} is finalized and can no longer be adjusted.` });
    }

    const column = ADJUSTABLE_COLUMNS[component];
    const previous = parseFloat(slip[column]) || 0;

    await PayrollAdjustment.upsert({
      empid,
      ename: slip.C_ENAME,
      C_MONTH: monthStr,
      C_YEAR: year,
      component,
      amount,
      previous_amount: previous,
      reason,
      created_by: req.session?.user?.username || 'Admin',
      created_date: new Date()
    }, { transaction: t });

    // Move the payslip totals by the delta so untouched lines stay intact.
    const delta = amount - previous;
    await Payslip.update({
      [column]: amount.toFixed(2),
      C_TOT_DED: (parseFloat(slip.C_TOT_DED) + delta).toFixed(2),
      C_NET_AMT: (parseFloat(slip.C_NET_AMT) - delta).toFixed(2)
    }, { where: { C_EMPID: empid, C_MONTH: monthStr, C_YEAR: year }, transaction: t });

    await t.commit();

    const updated = await Payslip.findOne({ where: { C_EMPID: empid, C_MONTH: monthStr, C_YEAR: year } });
    res.json({
      message: `${component} for emp ${empid} set to ${amount} (was ${previous})`,
      data: updated
    });
  } catch (error) {
    await t.rollback();
    console.error('Error saving payroll adjustment:', error);
    res.status(500).json({ message: 'Error saving payroll adjustment' });
  }
};

exports.deleteAdjustment = async (req, res) => {
  const t = await Payslip.sequelize.transaction();
  try {
    const adj = await PayrollAdjustment.findByPk(req.params.id, { transaction: t });
    if (!adj) {
      await t.rollback();
      return res.status(404).json({ message: 'Adjustment not found' });
    }

    const slip = await Payslip.findOne({
      where: { C_EMPID: adj.empid, C_MONTH: adj.C_MONTH, C_YEAR: adj.C_YEAR },
      transaction: t
    });

    // Put the line back to whatever the run computes: re-running the month
    // restores it, and without an adjustment the stored value no longer has a
    // reason, so drop it back to zero rather than leave a stale correction.
    if (slip) {
      const column = ADJUSTABLE_COLUMNS[adj.component];
      const current = parseFloat(slip[column]) || 0;
      const delta = -current;
      await Payslip.update({
        [column]: 0,
        C_TOT_DED: (parseFloat(slip.C_TOT_DED) + delta).toFixed(2),
        C_NET_AMT: (parseFloat(slip.C_NET_AMT) - delta).toFixed(2)
      }, { where: { C_EMPID: adj.empid, C_MONTH: adj.C_MONTH, C_YEAR: adj.C_YEAR }, transaction: t });
    }

    await adj.destroy({ transaction: t });
    await t.commit();
    res.json({ message: 'Adjustment removed. Re-process the month to restore the computed figures.' });
  } catch (error) {
    await t.rollback();
    console.error('Error deleting payroll adjustment:', error);
    res.status(500).json({ message: 'Error deleting payroll adjustment' });
  }
};

exports.getPfReport = async (req, res) => {
  try {
    const { month, year } = req.query;
    const monthStr = getMonthName(parseInt(month));
    const where = {};
    if (year) where.C_YEAR = parseInt(year);
    if (month) where.C_MONTH = monthStr;

    const data = await Payslip.findAll({
      where,
      order: [['C_EMPID', 'ASC']]
    });

    const result = data.map(r => ({
      empid: r.C_EMPID,
      ename: r.C_ENAME,
      pf_no: r.C_PF_NUM || '',
      basic: Number(r.C_BASIC) || 0,
      pf_contribution: Number(r.C_DED_PF) || 0,
      emp_share: Number(r.C_DED_PF) || 0,
      employer_share: Number(r.C_DED_PF) || 0
    }));

    res.json(result);
  } catch (error) {
    console.error('Error fetching PF report:', error);
    res.status(500).json({ message: 'Error fetching PF report' });
  }
};

exports.getPtReport = async (req, res) => {
  try {
    const { month, year } = req.query;
    const monthStr = getMonthName(parseInt(month));
    const where = {};
    if (year) where.C_YEAR = parseInt(year);
    if (month) where.C_MONTH = monthStr;

    const data = await Payslip.findAll({
      where,
      include: [{
        model: EmployeeMaster,
        as: 'employee',
        attributes: ['empid', 'ename'],
        include: [{
          model: EmpOfficial,
          as: 'official',
          attributes: ['panno']
        }]
      }],
      order: [['C_EMPID', 'ASC']]
    });

    const result = data.map(r => ({
      empid: r.C_EMPID,
      ename: r.C_ENAME,
      pan_no: r.employee?.official?.panno || '',
      gross_salary: Number(r.C_TOT_SAL) || 0,
      pt_amount: Number(r.C_DED_PT) || 0
    }));

    res.json(result);
  } catch (error) {
    console.error('Error fetching PT report:', error);
    res.status(500).json({ message: 'Error fetching PT report' });
  }
};

exports.getEarningsDeductions = async (req, res) => {
  try {
    const { month, year } = req.query;
    const monthStr = getMonthName(parseInt(month));
    const where = {};
    if (year) where.C_YEAR = parseInt(year);
    if (month) where.C_MONTH = monthStr;

    const data = await Payslip.findAll({
      where,
      order: [['C_EMPID', 'ASC']]
    });

    const result = [];
    for (const r of data) {
      const earnings = [
        { type: 'Basic', amount: Number(r.C_EARNED_BASIC) },
        { type: 'HRA', amount: Number(r.C_EARNED_HRA) },
        { type: 'Conveyance', amount: Number(r.C_EARNED_CONV) },
        { type: 'Other', amount: Number(r.C_EARNED_OTHERS) },
        { type: 'OT', amount: Number(r.C_EARNED_OT) },
        { type: 'Bonus', amount: Number(r.C_EARNED_BONUS) },
        { type: 'Lunch', amount: Number(r.C_EARNED_LUNCH) }
      ].filter(e => e.amount > 0);
      const deductions = [
        { type: 'PF', amount: Number(r.C_DED_PF) },
        { type: 'ESI', amount: Number(r.C_DED_ESI) },
        { type: 'PT', amount: Number(r.C_DED_PT) },
        { type: 'LIC', amount: Number(r.C_DED_LIC) },
        { type: 'Tax', amount: Number(r.C_DED_TAX) },
        { type: 'Advance', amount: Number(r.C_DED_ADV) },
        { type: 'Other', amount: Number(r.C_DED_OTH) }
      ].filter(d => d.amount > 0);

      for (const e of earnings) {
        result.push({ empid: r.C_EMPID, ename: r.C_ENAME, earning_type: e.type, amount: e.amount, deduction_type: '', amount_ded: 0 });
      }
      for (const d of deductions) {
        result.push({ empid: r.C_EMPID, ename: r.C_ENAME, earning_type: '', amount: 0, deduction_type: d.type, amount_ded: d.amount });
      }
    }

    res.json(result);
  } catch (error) {
    console.error('Error fetching earnings/deductions report:', error);
    res.status(500).json({ message: 'Error fetching earnings/deductions report' });
  }
};

exports.getMyPayslips = async (req, res) => {
  try {
    const qEmpid = parseInt(req.query.empid);
    const empid = qEmpid || req.session?.user?.empid;
    if (!empid) return res.status(401).json({ message: 'Not authenticated' });
    const data = await Payslip.findAll({ where: { C_EMPID: empid }, order: [['C_YEAR','DESC'], [Sequelize.literal(`CASE WHEN "C_MONTH"='JAN' THEN 1 WHEN "C_MONTH"='FEB' THEN 2 WHEN "C_MONTH"='MAR' THEN 3 WHEN "C_MONTH"='APR' THEN 4 WHEN "C_MONTH"='MAY' THEN 5 WHEN "C_MONTH"='JUN' THEN 6 WHEN "C_MONTH"='JUL' THEN 7 WHEN "C_MONTH"='AUG' THEN 8 WHEN "C_MONTH"='SEP' THEN 9 WHEN "C_MONTH"='OCT' THEN 10 WHEN "C_MONTH"='NOV' THEN 11 WHEN "C_MONTH"='DEC' THEN 12 ELSE 13 END`), 'DESC']], include: [{ model: EmployeeMaster, as: 'employee', attributes: ['ename'] }] });
    res.json(data);
  } catch (error) { console.error('getMyPayslips', error); res.status(500).json({ message: 'Error fetching my payslips' }); }
};

exports.downloadMyPayslip = async (req, res) => {
  try {
    const sessionEmpid = req.session?.user?.empid;
    const qEmpid = parseInt(req.query.empid);
    const { month, year } = req.query;
    if (!sessionEmpid) return res.status(401).json({ message: 'Not authenticated' });
    if (qEmpid && qEmpid !== sessionEmpid && !['ADMIN','HR'].includes(req.session?.user?.role)) return res.status(403).json({ message: 'Can only download own payslip' });
    const empid = qEmpid || sessionEmpid;
    const y = parseInt(year); const m = parseInt(month);
    if (!y || !m) return res.status(400).json({ message: 'month and year required' });
    const monthStr = getMonthName(m);
    const payslip = await Payslip.findOne({ where: { C_EMPID: empid, C_YEAR: y, C_MONTH: monthStr } });
    if (!payslip) return res.status(404).json({ message: 'Payslip not found' });
    res.json(payslip);
  } catch (error) { console.error('downloadMyPayslip', error); res.status(500).json({ message: 'Error fetching payslip' }); }
};

exports.getMealsCoupon = async (req, res) => {
  try {
    const { month, year } = req.query;
    const monthStr = getMonthName(parseInt(month));
    const where = {};
    if (year) where.C_YEAR = parseInt(year);
    if (month) where.C_MONTH = monthStr;

    const data = await Payslip.findAll({
      where,
      order: [['C_EMPID', 'ASC']]
    });

    const result = data.map(r => ({
      empid: r.C_EMPID,
      ename: r.C_ENAME,
      deptname: r.C_DEPT || '',
      month: r.C_MONTH || '',
      coupons: Number(r.C_DED_MEALS) || 0,
      value: 0
    }));

    res.json(result);
  } catch (error) {
    console.error('Error fetching meals coupon report:', error);
    res.status(500).json({ message: 'Error fetching meals coupon report' });
  }
};
