const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'backend', '.env') });
const { EmployeeMaster, Attendance, sequelize } = require('./backend/models');
const { Op } = require('sequelize');

async function checkAndSaveAttendance() {
  try {
    const empIds = [1002, 1003, 1005, 1009, 1006, 1010, 1015, 1019, 1021, 1022, 1024, 1025, 1026, 1027];
    const employees = await EmployeeMaster.findAll({
      where: { empid: empIds }
    });

    console.log(`Found ${employees.length} employees out of ${empIds.length}`);

    if (employees.length === 0) {
      console.log('No employees found. Skipping attendance save.');
      return;
    }

    const attendanceRecords = [];
    const year = 2026;
    const month = 3; // March

    const holidays = [1, 8, 15, 19, 22, 29];

    for (const emp of employees) {
      let presentDaysNeeded = 0;
      let otHrsTotal = 0;
      let leaves = [];

      switch (emp.empid) {
        case 1002: presentDaysNeeded = 24; leaves = [{ day: 28, type: 'CL' }]; break;
        case 1003: presentDaysNeeded = 25; otHrsTotal = 92; break;
        case 1005: presentDaysNeeded = 25; otHrsTotal = 147; break;
        case 1009: presentDaysNeeded = 23.5; otHrsTotal = 70; leaves = [{ day: 11, type: 'CL' }]; break;
        case 1006: presentDaysNeeded = 25; otHrsTotal = 99; break;
        case 1010: presentDaysNeeded = 25; break;
        case 1015: presentDaysNeeded = 25; break;
        case 1019: presentDaysNeeded = 24; leaves = [{ day: 15, type: 'CL' }]; break;
        case 1021: presentDaysNeeded = 24; leaves = [{ day: 16, type: 'Leave' }]; break;
        case 1022: presentDaysNeeded = 22; leaves = [{ day: 9, type: 'CL' }, { day: 10, type: 'Leave' }, { day: 11, type: 'Leave' }]; break;
        case 1024: presentDaysNeeded = 5.5; break;
        case 1025: presentDaysNeeded = 25; otHrsTotal = 103; break;
        case 1026: presentDaysNeeded = 25; otHrsTotal = 96; break;
        case 1027: presentDaysNeeded = 22.5; leaves = [{ day: 14, type: 'Leave' }, { day: 15, type: 'CL' }, { day: 16, type: 'CL' }, { day: 28, type: 'EL' }]; break;
      }

      let otDistributed = 0;

      for (let day = 1; day <= 31; day++) {
        const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const isHoliday = holidays.includes(day);

        let status = 'Present';
        let leaveType = null;
        let isHol = false;
        let woff = 0;

        const leave = leaves.find(l => l.day === day);
        if (leave) {
          status = 'Leave';
          leaveType = leave.type;
        } else if (isHoliday) {
          status = 'Holiday';
          isHol = true;
          woff = 1;
        } else {
          if (emp.empid === 1024 && ![2, 3, 4, 5, 6].includes(day)) {
            status = 'Absent';
          }
        }

        let otHrs = 0;
        if (status === 'Present' && otHrsTotal > 0) {
          otHrs = Math.round((otHrsTotal / presentDaysNeeded) * 100) / 100;
          otDistributed += otHrs;
        }

        attendanceRecords.push({
          empid: emp.empid,
          att_date: dateStr,
          status: status,
          leave_type: leaveType,
          holiday: isHol,
          woff_day: woff,
          ot_hrs: otHrs,
          shift: 'General',
          in_time: '09:00:00',
          out_time: '18:00:00',
        });
      }
    }

    console.log(`Prepared ${attendanceRecords.length} records. Inserting...`);

    await sequelize.transaction(async (t) => {
      for (const record of attendanceRecords) {
        await Attendance.upsert(record, { transaction: t });
      }
    });

    console.log('✅ Attendance saved successfully for Mar-2026');

  } catch (error) {
    console.error('Error in script:', error);
  } finally {
    process.exit();
  }
}

checkAndSaveAttendance();
