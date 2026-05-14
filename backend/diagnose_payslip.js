
const { Payslip } = require('./models');
const { Sequelize } = require('sequelize');
const fs = require('fs');

async function check() {
  try {
    const monthOrder = `CASE 
      WHEN "C_MONTH" IN ('JAN','JANUARY','01','1') OR "c_month" IN ('JAN','JANUARY','01','1') THEN 1
      WHEN "C_MONTH" IN ('FEB','FEBRUARY','02','2') OR "c_month" IN ('FEB','FEBRUARY','02','2') THEN 2
      WHEN "C_MONTH" IN ('MAR','MARCH','03','3') OR "c_month" IN ('MAR','MARCH','03','3') THEN 3
      WHEN "C_MONTH" IN ('APR','APRIL','04','4') OR "c_month" IN ('APR','APRIL','04','4') THEN 4
      WHEN "C_MONTH" IN ('MAY','MAY','05','5') OR "c_month" IN ('MAY','MAY','05','5') THEN 5
      WHEN "C_MONTH" IN ('JUN','JUNE','06','6') OR "c_month" IN ('JUN','JUNE','06','6') THEN 6
      WHEN "C_MONTH" IN ('JUL','JULY','07','7') OR "c_month" IN ('JUL','JULY','07','7') THEN 7
      WHEN "C_MONTH" IN ('AUG','AUGUST','08','8') OR "c_month" IN ('AUG','AUGUST','08','8') THEN 8
      WHEN "C_MONTH" IN ('SEP','SEPTEMBER','09','9') OR "c_month" IN ('SEP','SEPTEMBER','09','9') THEN 9
      WHEN "C_MONTH" IN ('OCT','OCTOBER','10','10') OR "c_month" IN ('OCT','OCTOBER','10','10') THEN 10
      WHEN "C_MONTH" IN ('NOV','NOVEMBER','11','11') OR "c_month" IN ('NOV','NOVEMBER','11','11') THEN 11
      WHEN "C_MONTH" IN ('DEC','DECEMBER','12','12') OR "c_month" IN ('DEC','DECEMBER','12','12') THEN 12
      ELSE 0 END`;

    const latest = await Payslip.findOne({
      attributes: ['C_MONTH', 'C_YEAR', 'c_month', 'c_year'],
      order: [
        ['C_YEAR', 'DESC'],
        [Sequelize.literal(monthOrder), 'DESC']
      ],
      raw: true
    });

    let output = '--- DATABASE CHECK ---\n';
    output += `Absolute Latest Payslip Found: ${JSON.stringify(latest, null, 2)}\n`;
    
    if (latest) {
        const monthMap = {
            'JAN':1, 'FEB':2, 'MAR':3, 'APR':4, 'MAY':5, 'JUN':6, 
            'JUL':7, 'AUG':8, 'SEP':9, 'OCT':10, 'NOV':11, 'DEC':12,
            'JANUARY':1, 'FEBRUARY':2, 'MARCH':3, 'APRIL':4, 'JUNE':6, 'JULY':7, 'AUGUST':8, 'SEPTEMBER':9, 'OCTOBER':10, 'NOVEMBER':11, 'DECEMBER':12
        };
        const mStr = (latest.C_MONTH || latest.c_month || "").trim().toUpperCase();
        const mNum = monthMap[mStr] || 0;
        const yNum = Number(latest.C_YEAR || latest.c_year);

        const testDate = "2026-05-03";
        const testY = 2026;
        const testM = 5;

        const isClosed = (testY < yNum) || (testY === yNum && testM <= mNum);
        output += `\nTesting Date: ${testDate} (Year ${testY}, Month ${testM})\n`;
        output += `Cutoff in DB: ${mStr} ${yNum} (Month Num: ${mNum})\n`;
        output += `Result: ${isClosed ? "CLOSED (ERROR)" : "OPEN (VALID)"}\n`;
    } else {
        output += 'No payslips found in database.\n';
    }
    
    fs.writeFileSync('diag_result.txt', output);
    console.log('Diagnostic finished. Result written to diag_result.txt');
  } catch (err) {
    fs.writeFileSync('diag_result.txt', 'Error: ' + err.message);
    console.error('Error during check:', err);
  } finally {
    process.exit();
  }
}

check();
