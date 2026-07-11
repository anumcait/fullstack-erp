const { Payslip } = require('../models');
Payslip.findAll({ where: { C_MONTH: 'JUN', C_YEAR: 2026 } }).then(r => {
  console.log('Found:', r.length);
  r.forEach(p => console.log(p.C_EMPID, p.C_DAYS_PRESENT));
}).catch(e => console.error(e.message));