// Debug version - prints query params and where clause
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
  console.log('status:', r._status);
  console.log('body:', JSON.stringify(r._body).slice(0, 500));
  process.exit(0);
})().catch(e => { console.log('ERR:', e.message, '\n', e.stack?.split('\n').slice(1, 4).join('\n')); process.exit(1); });
