const { sequelize, Attendance, ExtOt } = require('./backend/models');

async function check1003() {
  try {
    const attendance = await Attendance.findAll({
      where: {
        empid: 1003,
        hr_app_status: 1
      }
    });

    let regOt = 0;
    for (const a of attendance) {
      const val = a.hr_app_ot;
      if (!val) continue;
      const str = String(val);
      if (str.includes(':')) {
        const parts = str.split(':');
        const h = parseInt(parts[0]) || 0;
        const m = parseInt(parts[1]) || 0;
        regOt += h + (m / 60);
      } else {
        regOt += parseFloat(str) || 0;
      }
    }

    const extOtData = await ExtOt.findAll({
      where: {
        empid: 1003,
        app_status: 2
      }
    });

    let extOt = 0;
    for (const a of extOtData) {
      extOt += parseFloat(a.ot_hrs) || 0;
    }

    console.log("Reg OT (HR Approved):", regOt);
    console.log("Ext OT (HR Approved):", extOt);
    console.log("Total OT:", regOt + extOt);
    
    // Let's also check non-approved ones
    const allAtt = await Attendance.findAll({ where: { empid: 1003, ot_hrs: { [sequelize.Sequelize.Op.gt]: 0 } }});
    let allRegOt = 0;
    for (const a of allAtt) {
      allRegOt += parseFloat(a.ot_hrs) || 0;
    }
    console.log("All Reg OT_HRS (Actual):", allRegOt);
    
  } catch(e) {
    console.error(e);
  } finally {
    process.exit();
  }
}

check1003();
