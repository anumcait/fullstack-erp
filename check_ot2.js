require('dotenv').config({ path: './backend/.env' });
const { sequelize, Attendance, ExtOt } = require('./backend/models');

async function check1003() {
  try {
    const startDate = '2026-03-01';
    const endDate = '2026-03-31';

    const attendance = await Attendance.findAll({
      where: {
        empid: 1003,
        att_date: { [sequelize.Sequelize.Op.between]: [startDate, endDate] }
      }
    });

    let regOtAll = 0;
    let regOtApproved = 0;

    for (const a of attendance) {
      const hStr = a.ot_hrs;
      if (hStr) regOtAll += parseFloat(hStr) || 0;

      if (a.hr_app_status === 1) {
        const val = a.hr_app_ot;
        if (!val) continue;
        const str = String(val);
        if (str.includes(':')) {
          const parts = str.split(':');
          const h = parseInt(parts[0]) || 0;
          const m = parseInt(parts[1]) || 0;
          regOtApproved += h + (m / 60);
        } else {
          regOtApproved += parseFloat(str) || 0;
        }
      }
    }

    const extOtData = await ExtOt.findAll({
      where: {
        empid: 1003,
        ot_date: { [sequelize.Sequelize.Op.between]: [startDate, endDate] }
      }
    });

    let extOtAll = 0;
    let extOtApproved = 0;

    for (const a of extOtData) {
      if (a.ot_hrs) extOtAll += parseFloat(a.ot_hrs) || 0;
      if (a.app_status === 2) {
        extOtApproved += parseFloat(a.ot_hrs) || 0;
      }
    }

    console.log("--- EMP 1003 OT ---");
    console.log("Reg OT (All):", regOtAll);
    console.log("Reg OT (HR Approved):", regOtApproved);
    console.log("Ext OT (All):", extOtAll);
    console.log("Ext OT (HR Approved):", extOtApproved);
    console.log("Total (All):", regOtAll + extOtAll);
    console.log("Total (HR Approved):", regOtApproved + extOtApproved);
    
  } catch(e) {
    console.error(e);
  } finally {
    process.exit();
  }
}

check1003();
