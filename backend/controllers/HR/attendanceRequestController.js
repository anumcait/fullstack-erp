const { AttendanceRequest, Attendance, EmployeeMaster, Payslip, ShiftSchedule } = require('../../models');
const { Op, Sequelize } = require('sequelize');

const MONTH_NAMES = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];

async function isPayrollFinalized(dateStr) {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return false;
  const month = MONTH_NAMES[d.getMonth()];
  const year = d.getFullYear();
  const cnt = await Payslip.count({ where: { C_MONTH: month, C_YEAR: year, C_FINAL_STATUS: 2 } });
  return cnt > 0;
}

exports.createRequest = async (req, res) => {
  try {
    let { empid, att_date, in_time, out_time, shift, status, reason } = req.body;
    const sessionUser = req.session?.user;
    if (!empid && sessionUser?.empid) empid = sessionUser.empid;
    if (!empid) return res.status(400).json({ message: 'empid required' });
    if (!att_date) return res.status(400).json({ message: 'att_date required' });
    empid = parseInt(empid);
    if (status === 'P' && (!in_time || !out_time)) return res.status(400).json({ message: 'Present requires in_time and out_time' });
    if (await isPayrollFinalized(att_date)) return res.status(400).json({ message: 'Salary already finalized for this month' });
    const emp = await EmployeeMaster.findOne({ where: { empid } });
    if (!emp || !emp.is_active) return res.status(403).json({ message: 'Inactive employee' });
    const existsPending = await AttendanceRequest.findOne({ where: { empid, att_date, request_status: 'Pending' } });
    if (existsPending) return res.status(400).json({ message: 'Pending request already exists for this date' });
    const prevApproved = await AttendanceRequest.findOne({ where: { empid, att_date, request_status: { [Op.in]: ['Approved','Rejected'] } } });
    if (prevApproved && (!reason || !reason.trim())) return res.status(400).json({ message: 'Reason is mandatory for re-request after HR approval' });
    if (status === 'A') { in_time = null; out_time = null; }
    const rec = await AttendanceRequest.create({ empid, att_date, in_time: in_time || null, out_time: out_time || null, shift: shift || 'G', status: status || 'P', reason, request_status: 'Pending' });
    res.status(201).json({ message: 'Attendance request submitted', id: rec.id });
  } catch (e) {
    console.error('createRequest', e);
    res.status(500).json({ message: 'Failed to create request' });
  }
};

exports.createBulkRequests = async (req, res) => {
  try {
    const list = Array.isArray(req.body) ? req.body : req.body.requests;
    if (!list || !list.length) return res.status(400).json({ message: 'Empty list' });
    const sessionUser = req.session?.user;
    const results = [];
    for (let r of list) {
      let { empid, att_date, in_time, out_time, shift, status, reason } = r;
      if (!empid && sessionUser?.empid) empid = sessionUser.empid;
      if (!empid || !att_date) { results.push({ att_date, error: 'missing fields' }); continue; }
      empid = parseInt(empid);
      if (status === 'P' && (!in_time || !out_time)) { results.push({ att_date, empid, error: 'Present needs punches' }); continue; }
      if (await isPayrollFinalized(att_date)) { results.push({ att_date, empid, error: 'payroll finalized' }); continue; }
      const dup = await AttendanceRequest.findOne({ where: { empid, att_date, request_status: 'Pending' } });
      if (dup) { results.push({ att_date, empid, error: 'pending exists' }); continue; }
      if (status === 'A') { in_time = null; out_time = null; }
      const rec = await AttendanceRequest.create({ empid, att_date, in_time: in_time || null, out_time: out_time || null, shift: shift || 'G', status: status || 'P', reason, request_status: 'Pending' });
      results.push({ att_date, empid, id: rec.id, ok: true });
    }
    res.json({ message: `Processed ${results.length}`, results });
  } catch (e) {
    console.error('bulk', e);
    res.status(500).json({ message: 'Bulk failed' });
  }
};

exports.getMyRequests = async (req, res) => {
  try {
    const sessionUser = req.session?.user;
    const empid = parseInt(req.query.empid || sessionUser?.empid);
    if (!empid) return res.json([]);
    const where = { empid };
    if (req.query.status) where.request_status = req.query.status;
    const data = await AttendanceRequest.findAll({ where, order: [['att_date','DESC']], include: [{ model: EmployeeMaster, as: 'employee', attributes: ['ename','deptname'] }] });
    res.json(data);
  } catch (e) { res.status(500).json({ message: 'Fetch failed' }); }
};

exports.getAllRequests = async (req, res) => {
  try {
    const where = {};
    if (req.query.status) where.request_status = req.query.status;
    if (req.query.empid) where.empid = parseInt(req.query.empid);
    if (req.query.from && req.query.to) where.att_date = { [Op.between]: [req.query.from, req.query.to] };
    const data = await AttendanceRequest.findAll({ where, order: [['id','DESC']], include: [{ model: EmployeeMaster, as: 'employee', attributes: ['ename','deptname'] }] });
    res.json(data);
  } catch (e) { res.status(500).json({ message: 'Fetch failed' }); }
};

exports.getPending = async (req, res) => {
  try {
    const data = await AttendanceRequest.findAll({ where: { request_status: 'Pending' }, order: [['id','DESC']], include: [{ model: EmployeeMaster, as: 'employee', attributes: ['ename','deptname'] }] });
    res.json(data);
  } catch (e) { res.status(500).json({ message: 'Fetch failed' }); }
};

function getTimeMins(t) {
  if (!t) return null;
  const s = String(t).trim();
  const m = s.match(/(\d{1,2})[:.](\d{2})/);
  if (m) return parseInt(m[1])*60+parseInt(m[2]);
  const d = new Date(t);
  if (!isNaN(d.getTime())) return d.getHours()*60+d.getMinutes();
  return null;
}
function calcLate(inTime, shiftStart) {
  if (!inTime||!shiftStart) return 0;
  const a=getTimeMins(inTime), b=getTimeMins(shiftStart);
  if(a===null||b===null) return 0;
  if(a>b){ const d=a-b; return Math.floor(d/60)+ (d%60)/100; }
  return 0;
}
function calcOT(outTime, shiftEnd) {
  if(!outTime||!shiftEnd) return 0;
  const a=getTimeMins(outTime), b=getTimeMins(shiftEnd);
  if(a===null||b===null) return 0;
  let extra=a-b;
  if(extra<0 && a<600) extra=(a+1440)-b;
  if(extra>0){ const h=Math.floor(extra/60); const m=extra%60; return h + m/100; }
  return 0;
}

exports.approve = async (req, res) => {
  const { id, remarks } = req.body;
  const t = await AttendanceRequest.sequelize.transaction();
  try {
    const r = await AttendanceRequest.findByPk(id, { transaction: t });
    if (!r) { await t.rollback(); return res.status(404).json({ message: 'Not found' }); }
    if (r.request_status !== 'Pending') { await t.rollback(); return res.status(400).json({ message: 'Already processed' }); }
    if (await isPayrollFinalized(r.att_date)) { await t.rollback(); return res.status(400).json({ message: 'Salary finalized for this month' }); }
    r.request_status = 'Approved';
    r.approved_by = req.session?.user?.id || null;
    r.approved_at = new Date();
    r.approver_remarks = remarks || null;
    await r.save({ transaction: t });
    const sched = await ShiftSchedule.findOne({ where: { empid: r.empid, shift_date: r.att_date }, transaction: t });
    const shiftStart = sched?.shift_start_time || '09:00:00';
    let shiftEnd = sched?.shift_end_time || '17:30';
    if (getTimeMins(shiftEnd)===1080) shiftEnd='17:30';
    let late_hrs = 0, ot_hrs = 0;
    if (r.status !== 'A' && r.in_time) late_hrs = calcLate(r.in_time, shiftStart);
    if (r.status !== 'A' && r.out_time) ot_hrs = calcOT(r.out_time, shiftEnd);
    await Attendance.upsert({ empid: r.empid, att_date: r.att_date, shift: r.shift, status: r.status, in_time: r.in_time, out_time: r.out_time, late_hrs, ot_hrs, remarks: r.reason }, { transaction: t });
    await t.commit();
    res.json({ success: true, message: 'Approved and attendance updated' });
  } catch (e) { await t.rollback(); console.error(e); res.status(500).json({ message: 'Approve failed' }); }
};

exports.reject = async (req, res) => {
  try {
    const { id, remarks } = req.body;
    const r = await AttendanceRequest.findByPk(id);
    if (!r) return res.status(404).json({ message: 'Not found' });
    if (r.request_status !== 'Pending') return res.status(400).json({ message: 'Already processed' });
    r.request_status = 'Rejected';
    r.approver_remarks = remarks || null;
    r.approved_by = req.session?.user?.id || null;
    r.approved_at = new Date();
    await r.save();
    res.json({ success: true, message: 'Rejected' });
  } catch (e) { res.status(500).json({ message: 'Reject failed' }); }
};

exports.updateRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { in_time, out_time, shift, status, reason } = req.body;
    const r = await AttendanceRequest.findByPk(id);
    if (!r) return res.status(404).json({ message: 'Not found' });
    if (r.request_status !== 'Pending') return res.status(400).json({ message: 'Only Pending can be edited (already ' + r.request_status + ')' });
    const sessionUser = req.session?.user;
    if (sessionUser?.role !== 'ADMIN' && parseInt(sessionUser?.empid) !== r.empid) return res.status(403).json({ message: 'Not allowed' });
    if (await isPayrollFinalized(r.att_date)) return res.status(400).json({ message: 'Salary finalized' });
    if (status === 'P' && (!in_time || !out_time)) return res.status(400).json({ message: 'Present needs punches' });
    r.in_time = status === 'A' ? null : (in_time || r.in_time);
    r.out_time = status === 'A' ? null : (out_time || r.out_time);
    r.shift = shift || r.shift;
    r.status = status || r.status;
    r.reason = reason !== undefined ? reason : r.reason;
    await r.save();
    res.json({ success: true, message: 'Updated - still Pending with HR' });
  } catch (e) { console.error(e); res.status(500).json({ message: 'Update failed' }); }
};

exports.cancel = async (req, res) => {
  try {
    const { id } = req.body;
    const sessionUser = req.session?.user;
    const r = await AttendanceRequest.findByPk(id);
    if (!r) return res.status(404).json({ message: 'Not found' });
    if (r.request_status !== 'Pending') return res.status(400).json({ message: 'Only pending can be cancelled' });
    if (sessionUser?.role !== 'ADMIN' && parseInt(sessionUser?.empid) !== r.empid) return res.status(403).json({ message: 'Not allowed' });
    r.request_status = 'Cancelled';
    await r.save();
    res.json({ success: true });
  } catch (e) { res.status(500).json({ message: 'Cancel failed' }); }
};

exports.bulkApprove = async (req, res) => {
  try {
    const { ids, remarks } = req.body;
    let count = 0;
    for (let id of ids) {
      req.body = { id, remarks };
      const r = await AttendanceRequest.findByPk(id);
      if (!r || r.request_status !== 'Pending') continue;
      if (await isPayrollFinalized(r.att_date)) continue;
      r.request_status = 'Approved';
      r.approved_by = req.session?.user?.id || null;
      r.approved_at = new Date();
      r.approver_remarks = remarks || null;
      await r.save();
      const sched = await ShiftSchedule.findOne({ where: { empid: r.empid, shift_date: r.att_date } });
      const shiftStart = sched?.shift_start_time || '09:00:00';
      let shiftEnd = sched?.shift_end_time || '17:30';
      if (getTimeMins(shiftEnd)===1080) shiftEnd='17:30';
      let late_hrs = 0, ot_hrs = 0;
      if (r.status !== 'A' && r.in_time) late_hrs = calcLate(r.in_time, shiftStart);
      if (r.status !== 'A' && r.out_time) ot_hrs = calcOT(r.out_time, shiftEnd);
      await Attendance.upsert({ empid: r.empid, att_date: r.att_date, shift: r.shift, status: r.status, in_time: r.in_time, out_time: r.out_time, late_hrs, ot_hrs, remarks: r.reason });
      count++;
    }
    res.json({ success: true, count });
  } catch (e) { res.status(500).json({ message: 'Bulk approve failed' }); }
};
