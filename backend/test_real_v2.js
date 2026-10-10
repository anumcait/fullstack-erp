// Calls the REAL getMusterRoll controller and prints late_cost for emp 1002.
process.chdir('/app');
const ctrl = require('./controllers/HR/attendanceController');

const mkRes = () => {
  const r = { _status: 200, _body: null };
  r.status = (c) => { r._status = c; return r; };
  r.json = (b) => { r._body = b; return r; };
  return r;
};
const mkReq = (extra = {}) => ({
  session: { user: { id: 24, username: 'erpadmin', role: 'ADMIN', permissions: ['*'] } },
  ...extra
});

(async () => {
  const r = mkRes();
  await ctrl.getMusterRoll(mkReq({ query: { month: '9', year: '2026', empid: '1002' } }), r);
  if (r._status !== 200) { console.log('status', r._status, JSON.stringify(r._body).slice(0, 300)); process.exit(1); }

  const body = r._body;
  const rows = body.employees || body.data || body;
  const arr = Array.isArray(rows) ? rows : [];
  console.log('employees returned:', arr.length);
  const emp = arr.find(x => String(x.empid) === '1002');
  if (!emp) { console.log('emp 1002 not found'); process.exit(1); }

  console.log('empid:', emp.empid, '| ename:', emp.ename);
  console.log('summary:', JSON.stringify(emp.summary));
  console.log('late_cost:', emp.late_cost);

  const lateDays = (emp.days || []).filter(d => Number(d.late_hrs) > 0);
  console.log('\nDays with late_hrs > 0:');
  lateDays.forEach(d => {
    console.log(`  ${d.date}  late_hrs=${d.late_hrs}  status=${d.status}  lop=${d.lop}`);
  });
  process.exit(0);
})().catch(e => { console.log('ERR:', e.message, '\n', e.stack?.split('\n').slice(1, 4).join('\n')); process.exit(1); });
