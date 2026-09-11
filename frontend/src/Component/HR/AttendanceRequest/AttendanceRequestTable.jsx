import React, { useEffect, useState, useMemo } from "react";
import { Box, Typography, Chip, Button, CircularProgress, Dialog, DialogTitle, DialogContent, IconButton, Tooltip, Paper, Avatar, alpha } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import CloseIcon from "@mui/icons-material/Close";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import EditIcon from "@mui/icons-material/Edit";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import PersonIcon from "@mui/icons-material/Person";
import axios from "axios";
import { useToast } from "../../../context/ToastContext";
import AttendanceRequestForm from "./AttendanceRequestForm";

const STATUS_META = {
  P: { label: "P", color: "#15803d", bg: "#dcfce7", border: "#22c55e" },
  Present: { label: "P", color: "#15803d", bg: "#dcfce7", border: "#22c55e" },
  F: { label: "HD", color: "#9c27b0", bg: "#f3e5f5", border: "#ce93d8" },
  "Half Day": { label: "HD", color: "#9c27b0", bg: "#f3e5f5", border: "#ce93d8" },
  HD: { label: "HD", color: "#9c27b0", bg: "#f3e5f5", border: "#ce93d8" },
  Half: { label: "HD", color: "#9c27b0", bg: "#f3e5f5", border: "#ce93d8" },
  A: { label: "A", color: "#b91c1c", bg: "#fee2e2", border: "#f87171" },
  Absent: { label: "A", color: "#b91c1c", bg: "#fee2e2", border: "#f87171" },
  L: { label: "L", color: "#a16207", bg: "#fef9c3", border: "#facc15" },
  LOP: { label: "LOP", color: "#b91c1c", bg: "#fee2e2", border: "#f87171" },
  "Loss of Pay": { label: "LOP", color: "#b91c1c", bg: "#fee2e2", border: "#f87171" },
  CL: { label: "CL", color: "#a16207", bg: "#fef9c3", border: "#facc15" },
  EL: { label: "EL", color: "#a16207", bg: "#fef9c3", border: "#facc15" },
  "W-Off": { label: "Weekly Off", color: "#475569", bg: "#f1f5f9", border: "#cbd5e1" },
  W: { label: "Weekly Off", color: "#475569", bg: "#f1f5f9", border: "#cbd5e1" },
  Holiday: { label: "H", color: "#1d4ed8", bg: "#dbeafe", border: "#60a5fa" },
  H: { label: "H", color: "#1d4ed8", bg: "#dbeafe", border: "#60a5fa" },
};
const REQ_LABEL = { Pending: "Pending • Sent to HR", Approved: "Approved by HR", Rejected: "Rejected by HR", Cancelled: "Cancelled" };
const REQ_COLOR = { Pending: "#d97706", Approved: "#15803d", Rejected: "#dc2626", Cancelled: "#64748b" };

export default function AttendanceRequestTable() {
  const theme = useTheme();
  const { showToast } = useToast();
  const empid = localStorage.getItem("empId");
  const ename = localStorage.getItem("empName") || "Employee";
  const [month, setMonth] = useState(() => { const v = localStorage.getItem("att_sel_month"); return v ? parseInt(v) : new Date().getMonth() + 1; });
  const [year, setYear] = useState(() => { const v = localStorage.getItem("att_sel_year"); return v ? parseInt(v) : new Date().getFullYear(); });
  useEffect(() => { localStorage.setItem("att_sel_month", String(month)); }, [month]);
  useEffect(() => { localStorage.setItem("att_sel_year", String(year)); }, [year]);
  const [attendance, setAttendance] = useState([]);
  const [requests, setRequests] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [shiftSchedules, setShiftSchedules] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(false);
  const [liveTime, setLiveTime] = useState(new Date());
  const [dialogDate, setDialogDate] = useState(null);
  const [editReq, setEditReq] = useState(null);
  const [empPhoto, setEmpPhoto] = useState(null);
  useEffect(() => { const t = setInterval(() => setLiveTime(new Date()), 1000); return () => clearInterval(t); }, []);
  useEffect(() => { if (!empid) return; axios.get(`${import.meta.env.VITE_API_URL}/api/employees/${empid}/photo`, { withCredentials: true }).then(r => { if (r.data?.photo) setEmpPhoto(`data:${r.data.mimeType || "image/jpeg"};base64,${r.data.photo}`); }).catch(() => {}); }, [empid]);
  useEffect(() => { axios.get(`${import.meta.env.VITE_API_URL}/api/holidays`, { params: { year }, withCredentials: true }).then(r => setHolidays(r.data || [])).catch(()=>{}); }, [year]);
  const fetchAll = async () => {
    if (!empid) return;
    setLoading(true);
    const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
    const endDate = `${year}-${String(month).padStart(2, "0")}-${String(new Date(year, month, 0).getDate()).padStart(2, "0")}`;
    try {
      const [attRes, reqRes, shiftRes, leaveRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/api/attendance`, { params: { empid, month, year }, withCredentials: true }),
        axios.get(`${import.meta.env.VITE_API_URL}/api/attendance-requests/my`, { params: { empid }, withCredentials: true }),
        axios.get(`${import.meta.env.VITE_API_URL}/api/shift/schedule/all`, { params: { empid, startDate, endDate }, withCredentials: true }).catch(() => ({ data: [] })),
        axios.get(`${import.meta.env.VITE_API_URL}/api/leave/report`, { withCredentials: true }).catch(() => ({ data: [] })),
      ]);
      setAttendance(attRes.data.records || attRes.data || []);
      setRequests(reqRes.data || []);
      setShiftSchedules(Array.isArray(shiftRes.data) ? shiftRes.data : shiftRes.data.records || []);
      const rawLeaves = Array.isArray(leaveRes.data) ? leaveRes.data : [];
      const mine = rawLeaves.filter(a => String(a.empid) === String(empid) || String(a.empId) === String(empid));
      setLeaves(mine);
    } catch {}
    setLoading(false);
  };
  useEffect(() => { fetchAll(); }, [month, year]);

  const norm = (d) => (d || "").toString().slice(0, 10);
  const fmtDMY = (d) => { const s = norm(d); if (!s || !s.includes("-")) return s; const [y, m, day] = s.split("-"); return `${day}-${m}-${y}`; };
  const fmtTime = (t) => !t ? "--:--" : t.toString().slice(0, 5);
  const attMap = useMemo(() => { const m = {}; attendance.forEach(a => { m[norm(a.att_date)] = a; }); return m; }, [attendance]);
  const reqMap = useMemo(() => { const m = {}; requests.forEach(r => { const k = norm(r.att_date); if (!m[k] || r.id > m[k].id) m[k] = r; }); return m; }, [requests]);
  const holidayMap = useMemo(() => { const m = {}; holidays.forEach(h => { const k = norm(h.hdate); if (k) m[k] = h; }); return m; }, [holidays]);
  const shiftMap = useMemo(() => { const m = {}; shiftSchedules.forEach(s => { const k = norm(s.shift_date); if (k) m[k] = s; }); return m; }, [shiftSchedules]);
  const leaveMap = useMemo(() => {
    const m = {};
    leaves.forEach(app => {
      const det = app.leaveDetails || app.details || [];
      if (!det.length && app.from) det.push({ frmdt: app.from, todate: app.to, ltype: app.ltype, daydt: app.daydt });
      det.forEach(d => {
        let ltypeRaw = d.ltype || d.leave_type || d.leaveType || app.ltype;
        if (!ltypeRaw) {
          const cl = Number(d.c_cl_sanction || 0);
          const el = Number(d.c_el_sanction || 0);
          if (cl > 0) ltypeRaw = "CL";
          else if (el > 0) ltypeRaw = "EL";
          else if (String(d.c_hr_app_status||"").toLowerCase()==="approved" || String(app.status||"").toLowerCase()==="approved") {
            const nod = Number(d.nod || 0);
            ltypeRaw = nod > 0 ? "LOP" : "L";
          } else ltypeRaw = "L";
        }
        const ltype = String(ltypeRaw).toUpperCase();
        const daydt = (d.daydt || d.dayType || "FULL DAY").toString();
        const s = app.status || app.app_status || "";
        if (String(s).toLowerCase() !== "approved" && String(s).toLowerCase() !== "2") return;
        const start = new Date(d.frmdt || d.from); const end = new Date(d.todate || d.to || d.frmdt || d.from);
        if (isNaN(start) || isNaN(end)) return;
        for (let cur = new Date(start); cur <= end; cur.setDate(cur.getDate()+1)) {
          const k = cur.toISOString().slice(0,10);
          if (!m[k]) m[k] = { type: ltype, daydt, lno: app.lno || app.id };
          else if (m[k].daydt !== "FULL DAY" && daydt==="FULL DAY") m[k]= { type: ltype, daydt, lno: app.lno || app.id };
        }
      });
      if (app.leaveDetails) return;
      if (app.ldate && app.nod) {
        const d = new Date(app.ldate); if (!isNaN(d)) m[d.toISOString().slice(0,10)] = { type: String(app.ltype||"L").toUpperCase(), daydt: String(app.daydt||"FULL DAY"), lno: app.lno };
      }
    });
    return m;
  }, [leaves]);
  const todayStr = new Date().toISOString().split("T")[0];
  const getMins = (t) => { if (!t) return null; const mm = String(t).match(/(\d{1,2})[:.](\d{2})/); return mm ? parseInt(mm[1])*60+parseInt(mm[2]) : null; };
  const deriveStatus = (rec) => {
    if (!rec) return null;
    const noPunch = !rec.in_time && !rec.out_time;
    const sRaw = String(rec.status||"");
    const s = sRaw.toLowerCase();
    if (noPunch) {
      if (["w","w-off","h","holiday","cl","el","sl","l","lop","half day","hd","f"].some(k=>s.includes(k)) || rec.leave_type) return rec.status;
      const ds = norm(rec.att_date);
      if (ds && ds > todayStr) return rec.status;
      if (!rec.in_time && !rec.out_time && (sRaw==="P" || s==="present")) return "Absent";
      return rec.status;
    }
    if (s.includes("half") || s==="hd" || s==="f") return rec.status;
    if (["a","absent","l","cl","el","sl","h","holiday","w","w-off"].includes(s)) return rec.status;
    const dk = norm(rec.att_date); const sched = shiftMap[dk];
    const shiftEnd = sched?.shift_end_time || rec.shift_end || "17:30";
    const shiftStart = sched?.shift_start_time || rec.shift_start || "09:00";
    const outM = getMins(rec.out_time); const inM = getMins(rec.in_time);
    const endM = getMins(shiftEnd);
    if (outM !== null && endM !== null && outM < endM) return "Half Day";
    const lunchStart = getMins(sched?.lunch_start_time || "13:00"); const lunchEnd = getMins(sched?.lunch_end_time || "14:00");
    if (lunchEnd !== null && outM !== null && outM <= lunchEnd) return "Half Day";
    if (lunchStart !== null && inM !== null && inM >= lunchStart) return "Half Day";
    const worked = outM - inM; if (worked >0 && worked < 360) return "Half Day";
    return rec.status;
  };

  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDay = new Date(year, month - 1, 1).getDay();
  const monthReqs = requests.filter(r => { const d = new Date(r.att_date); return d.getMonth() + 1 === month && d.getFullYear() === year; });

  const stats = useMemo(() => {
    let p = 0, hd = 0, a = 0, l = 0, wo = 0, h = 0, late = 0, ot = 0;
    for (let d = 1; d <= daysInMonth; d++) {
      const ds = `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      if (ds > todayStr) continue;
      const rec = attMap[ds];
      const lv = leaveMap[ds];
      if (lv) { l++; if (rec) { late += parseFloat(rec.late_hrs)||0; ot+= parseFloat(rec.ot_hrs)||0; } continue; }
      if (!rec) { a++; continue; }
      const eff = deriveStatus(rec);
      const s = String(eff||"").trim();
      const sl = s.toLowerCase();
      if (sl==="half day" || sl==="hd" || sl==="f") hd++;
      else if (s === "P" || sl === "present") p++;
      else if (s === "A" || sl === "absent") a++;
      else if (["L", "CL", "EL", "SL"].includes(s)) l++;
      else if (s === "W" || s === "W-Off") wo++;
      else if (s === "H" || sl === "holiday") h++;
      else if (sl.includes("half")) hd++;
      late += parseFloat(rec.late_hrs) || 0;
      ot += parseFloat(rec.ot_hrs) || 0;
    }
    return { p, hd, a, l, wo, h, late: late.toFixed(2), ot: ot.toFixed(2), pending: monthReqs.filter(r => r.request_status === "Pending").length };
  }, [attMap, leaveMap, daysInMonth, month, year, monthReqs, shiftMap]);

  const cancelReq = async (id) => {
    if (!confirm("Cancel pending request?")) return;
    try { await axios.post(`${import.meta.env.VITE_API_URL}/api/attendance-requests/cancel`, { id }, { withCredentials: true }); showToast("Cancelled", "success"); fetchAll(); } catch (e) { showToast(e.response?.data?.message || "Failed", "error"); }
  };
  const canRegularize = (ds) => {
    if (new Date(ds) > new Date(todayStr)) return false;
    if (holidayMap[ds]) return false;
    const d = new Date(ds); if (d.getDay() === 0) return false;
    const req = reqMap[ds];
    if (req && req.request_status === "Pending") return false;
    return true;
  };
  const shiftMonth = (dir) => {
    let m = month + dir, y = year;
    if (m > 12) { m = 1; y++; }
    if (m < 1) { m = 12; y--; }
    setMonth(m); setYear(y);
  };

  if (loading) return <Box sx={{ p: 6, textAlign: "center" }}><CircularProgress size={28} /></Box>;
  if (!empid) return <Box sx={{ p: 3, color: "#dc2626", textAlign: "center" }}>No empId found. Please login as employee.</Box>;

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto" }}>
      <Paper elevation={0} sx={{ p: 1.8, mb: 2, borderRadius: 1, border: "1px solid #e0e0e0", borderLeft: `4px solid ${theme.palette.primary.main}`, bgcolor: "#fff", display: "flex", flexWrap: "wrap", gap: 2, alignItems: "center", justifyContent: "space-between" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Avatar variant="rounded" src={empPhoto} sx={{ width: 38, height: 38, borderRadius: 1, bgcolor: alpha(theme.palette.primary.main, 0.1), border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`, color: theme.palette.primary.main, fontWeight: 600, fontSize: 14 }}>{!empPhoto && (ename[0]?.toUpperCase() || <PersonIcon sx={{ fontSize: 18 }} />)}</Avatar>
          <Box>
            <Typography fontWeight={600} fontSize={14} color="#202124">{ename} • {empid}</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: "flex", alignItems: "center", gap: 0.6 }}><CalendarMonthIcon sx={{ fontSize: 12 }} />{liveTime.toLocaleString("en-GB", { weekday: "short", day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit" })} IST</Typography>
          </Box>
        </Box>
        <Paper elevation={0} sx={{ display: "flex", alignItems: "center", gap: 0.5, p: 0.4, borderRadius: 1, border: "1px solid #e0e0e0", bgcolor: "#f4f6f8" }}>
          <IconButton size="small" onClick={() => shiftMonth(-1)}><ChevronLeftIcon fontSize="small" /></IconButton>
          <Typography fontWeight={600} fontSize={13} sx={{ px: 1, minWidth: 140, textAlign: "center", color: "#202124" }}>{monthNames[month - 1]} {year}</Typography>
          <IconButton size="small" onClick={() => shiftMonth(1)}><ChevronRightIcon fontSize="small" /></IconButton>
          <Button size="small" variant="contained" onClick={() => { const d = new Date(); setMonth(d.getMonth() + 1); setYear(d.getFullYear()); }} sx={{ ml: 1, fontWeight: 600 }}>Today</Button>
        </Paper>
      </Paper>

      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 1.2, mb: 2 }}>
        {[
          { k: "Present", v: stats.p, c: "#2e7d32", bg: "#e8f5e9" },
          { k: "Half Day", v: stats.hd || 0, c: "#5f6368", bg: "#f1f5f9" },
          { k: "Absent", v: stats.a, c: "#c62828", bg: "#ffebee" },
          { k: "Leave / WO / H", v: `${stats.l} / ${stats.wo} / ${stats.h}`, c: "#5f6368", bg: "#f1f5f9" },
          { k: "Late Hours", v: stats.late, c: "#5f6368", bg: "#f1f5f9" },
          { k: "OT Hours", v: stats.ot, c: "#5f6368", bg: "#f1f5f9" },
          { k: "Pending HR", v: stats.pending, c: "#5f6368", bg: "#f1f5f9" },
        ].map(s => (
          <Paper key={s.k} elevation={0} sx={{ p: 1.4, borderRadius: 1.5, bgcolor: "#fff", border: "1px solid #e5e7eb", display: "flex", alignItems: "center", gap: 1.2 }}>
            <Box sx={{ width: 36, height: 36, borderRadius: 1.5, bgcolor: s.bg, color: s.c, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13, border: `1px solid ${s.c}20` }}>{s.v}</Box>
            <Box>
              <Typography fontSize={10.5} fontWeight={600} color="text.secondary" sx={{ lineHeight: 1 }}>{s.k}</Typography>
              <Typography fontWeight={700} fontSize={15} color="#111827" sx={{ lineHeight: 1.1 }}>{s.v}</Typography>
            </Box>
          </Paper>
        ))}
      </Box>

      <Paper elevation={0} sx={{ p: 1, mb: 1.5, borderRadius: 1, border: "1px solid #e0e0e0", bgcolor: "#fff", display: "flex", gap: 0.8, flexWrap: "wrap", alignItems: "center" }}>
        <Typography fontSize={11} fontWeight={600} color="text.secondary">Legend</Typography>
        {Object.entries({ P: "#2e7d32", HD: "#9c27b0", A: "#c62828", L: "#ef6c00", "Weekly Off": "#5f6368", H: "#1565c0", Pending: "#ef6c00" }).map(([k, c]) => (
          <Chip key={k} size="small" label={k} sx={{ bgcolor: c, color: "#fff", fontWeight: 600, height: 18, fontSize: k==="Weekly Off"?8:10 }} />
        ))}
        <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>Click date to add request • Orange = awaiting HR</Typography>
      </Paper>

      <Paper elevation={0} sx={{ border: "1px solid #e0e0e0", borderRadius: 1, overflow: "hidden", bgcolor: "#fff" }}>
        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", bgcolor: alpha(theme.palette.primary.main, 0.08), color: theme.palette.primary.dark, borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`, textAlign: "center", py: 0.9, fontWeight: 600, fontSize: 11 }}>
          {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map(d => <Box key={d}>{d}</Box>)}
        </Box>
        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: "1px", bgcolor: "#e0e0e0", p: "1px" }}>
          {Array.from({ length: firstDay }).map((_, i) => <Box key={`e-${i}`} sx={{ bgcolor: "#f8fafc", minHeight: 92 }} />)}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const ds = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const rec = attMap[ds];
            const req = reqMap[ds];
            const holiday = holidayMap[ds];
            const isWoff = new Date(year, month - 1, day).getDay() === 0;
            const isToday = ds === todayStr;
            const isFuture = new Date(ds) > new Date(todayStr);
            const getMeta = (s) => {
              if (!s) return null;
              const k = String(s).trim();
              if (STATUS_META[k]) return STATUS_META[k];
              const lk = k.toLowerCase();
              if (lk==="fc" || lk==="fe" || lk==="fl" || lk==="fs") return { ...STATUS_META["Half Day"], label: k.toUpperCase(), bg: "#fef9c3", color: "#a16207", border: "#facc15" };
              for (const key of Object.keys(STATUS_META)) if (key.toLowerCase() === lk) return STATUS_META[key];
              if (lk.includes("half") || lk === "hd" || lk === "f") return STATUS_META["Half Day"];
              if (lk.includes("present") || lk === "p") return STATUS_META.P;
              if (lk.includes("absent") || lk === "a") return STATUS_META.A;
              return STATUS_META.P;
            };
            const effStatus = rec ? deriveStatus(rec) : null;
            const lv = leaveMap[ds];
            const isHalfLeave = lv ? String(lv.daydt||"").toLowerCase().includes("half") : false;
            const lvLabel = lv ? (isHalfLeave ? (lv.type==="CL"?"FC":lv.type==="EL"?"FE":lv.type==="SL"?"FS":lv.type==="LOP"?"FL":`${lv.type}`) : lv.type) : null;
            let meta = rec ? getMeta(effStatus) : null;
            if (lv && !rec) meta = getMeta(lvLabel) || getMeta(lv.type);
            else if (lv && rec) {
              const isHalfAtt = String(effStatus||"").toLowerCase().includes("half");
              if (isHalfLeave && isHalfAtt) meta = getMeta(lvLabel) || getMeta(lv.type);
              else if (isHalfLeave) meta = getMeta(lvLabel) || getMeta(effStatus);
            }
            if (holiday) meta = STATUS_META.Holiday;
            else if (isWoff && !rec) meta = STATUS_META["W-Off"];
            const isPending = req?.request_status === "Pending";
            const isApproved = req?.request_status === "Approved";
            return (
              <Box key={ds} onClick={() => canRegularize(ds) && setDialogDate(ds)} sx={{ bgcolor: "#fff", minHeight: 88, p: 1, borderRadius: 0, cursor: canRegularize(ds) ? "pointer" : "default", opacity: isFuture ? 0.45 : 1, position: "relative", border: isPending ? "1.5px solid #ef6c00" : isApproved ? "1.5px solid #2e7d32" : "1px solid transparent", bgcolor: isPending ? "#fff8e1" : isApproved ? "#e8f5e9" : "#fff", "&:hover": canRegularize(ds) ? { bgcolor: "#f4f6f8" } : {} }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.4 }}>
                    <Typography fontSize={11} fontWeight={600} sx={{ width: 22, height: 22, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", bgcolor: isToday ? theme.palette.primary.main : theme.palette.background.default, color: isToday ? "#fff" : theme.palette.text.primary, border: "1px solid #e0e0e0" }}>{day}</Typography>
                    {shiftMap[ds] && !holiday && <Box sx={{ fontSize: 10, fontWeight: 700, color: theme.palette.primary.main, bgcolor: alpha(theme.palette.primary.main, 0.12), px: 0.7, py: 0.2, borderRadius: 1, border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`, lineHeight: 1 }}>{shiftMap[ds].shift_cd || shiftMap[ds].shiftCd || shiftMap[ds]}</Box>}
                  </Box>
                  {holiday ? <Tooltip title={holiday.hdesc}><Box sx={{ width: 20, height: 20, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "#dbeafe", color: "#1d4ed8", fontWeight: 600, fontSize: 8, border: "1px solid #60a5fa" }}>H</Box></Tooltip> : isWoff && !rec ? <Box sx={{ width: 20, height: 20, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "#f1f5f9", color: "#475569", fontWeight: 600, fontSize: 7, border: "1px solid #cbd5e1" }}>WO</Box> : rec ? <Box sx={{ width: 20, height: 20, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", bgcolor: meta.bg, color: meta.color, fontWeight: 600, fontSize: 9, border: `1px solid ${meta.border}` }}>{meta.label === "Weekly Off" ? "WO" : meta.label.slice(0, 2)}</Box> : lv ? <Box sx={{ width: 20, height: 20, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", bgcolor: (getMeta(lvLabel)||getMeta(lv.type)).bg, color: (getMeta(lvLabel)||getMeta(lv.type)).color, fontWeight: 600, fontSize: 8, border: `1px solid ${(getMeta(lvLabel)||getMeta(lv.type)).border}` }}>{(getMeta(lvLabel)||getMeta(lv.type)).label.slice(0,2)}</Box> : !isFuture ? <Box sx={{ width: 20, height: 20, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "#ffebee", color: "#c62828", fontWeight: 600, fontSize: 9, border: "1px solid #fecaca" }}>A</Box> : null}
                </Box>
                {holiday ? (
                  <Box sx={{ mt: 0.6 }}><Typography fontSize={9} fontWeight={600} color="#1d4ed8">{holiday.hdesc}</Typography>{rec && <Box sx={{ display: "flex", alignItems: "center", gap: 0.3, fontWeight: 500, color: "#5f6368", fontSize: 9 }}><AccessTimeIcon sx={{ fontSize: 10 }} /> {fmtTime(rec.in_time)}–{fmtTime(rec.out_time)}</Box>}</Box>
                ) : leaveMap[ds] && !rec ? (
                  <Box sx={{ mt: 0.6 }}><Chip size="small" label={`${leaveMap[ds].type} ${String(leaveMap[ds].daydt||"").toLowerCase().includes("half")?"(Half)":""}`.trim()} sx={{ height: 14, fontSize: 7, fontWeight: 700, bgcolor: STATUS_META[leaveMap[ds].type]?.bg || "#fef9c3", color: STATUS_META[leaveMap[ds].type]?.color || "#a16207", border: `1px solid ${STATUS_META[leaveMap[ds].type]?.border || "#facc15"}` }} /><Typography fontSize={8} color="#5f6368">LNo {leaveMap[ds].lno}</Typography></Box>
                ) : isWoff && !rec ? <Typography fontSize={9} color="#64748b" sx={{ mt: 0.6 }}>Weekly Off</Typography> : rec ? (
                  <Box sx={{ mt: 0.6, fontSize: 10, lineHeight: 1.3 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.3, fontWeight: 500, color: "#5f6368" }}><AccessTimeIcon sx={{ fontSize: 11, color: "#9e9e9e" }} /> {fmtTime(rec.in_time)} – {fmtTime(rec.out_time)}</Box>
                    {parseFloat(rec.late_hrs) > 0 && <Typography fontSize={9} fontWeight={500} color="#ef6c00">Late {parseFloat(rec.late_hrs).toFixed(2)}h</Typography>}
                    {parseFloat(rec.ot_hrs) > 0 && <Typography fontSize={9} fontWeight={500} color="#1565c0">OT {parseFloat(rec.ot_hrs).toFixed(2)}h</Typography>}
                    {leaveMap[ds] && <Chip size="small" label={`Leave: ${leaveMap[ds].type}${String(leaveMap[ds].daydt||"").toLowerCase().includes("half")?" Half":""}`} sx={{ height: 14, fontSize: 7, fontWeight: 700, bgcolor: STATUS_META[leaveMap[ds].type]?.bg || "#fef9c3", color: STATUS_META[leaveMap[ds].type]?.color || "#a16207", mt: 0.3 }} />}
                  </Box>
                ) : !isFuture ? <Typography fontSize={9} color="#9e9e9e" sx={{ mt: 0.6 }}>No punch</Typography> : <Typography fontSize={9} color="#bdbdbd">Upcoming</Typography>}
                {req && <Tooltip title={`${REQ_LABEL[req.request_status]}: ${req.status} ${fmtTime(req.in_time)}–${fmtTime(req.out_time)}`}><Chip size="small" label={REQ_LABEL[req.request_status]} sx={{ height: 14, fontSize: 7, fontWeight: 600, bgcolor: REQ_COLOR[req.request_status], color: "#fff", mt: 0.5 }} /></Tooltip>}
                {canRegularize(ds) && (!req || req.request_status !== "Pending") && <Typography fontSize={7} fontWeight={600} color={theme.palette.primary.main} sx={{ position: "absolute", bottom: 5, right: 6, bgcolor: alpha(theme.palette.primary.main, 0.1), px: 0.5, borderRadius: 0.5, border: `1px solid ${alpha(theme.palette.primary.main,0.2)}` }}>{!req ? "+ Request" : "+ New Request"}</Typography>}
              </Box>
            );
          })}
        </Box>
      </Paper>

      <Paper elevation={0} sx={{ mt: 2, p: 1.5, borderRadius: 1, border: "1px solid #e0e0e0", bgcolor: "#fff" }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1, flexWrap: "wrap", gap: 1 }}>
          <Typography fontWeight={600} fontSize={13} color="#202124" sx={{ display: "flex", alignItems: "center", gap: 1 }}><CheckCircleIcon fontSize="small" sx={{ color: "#1976d2" }} /> My Requests — {monthNames[month - 1]} {year} <Chip size="small" label={`${monthReqs.length}`} sx={{ height: 18, fontWeight: 600, bgcolor: "#e3f2fd", color: "#1565c0", border: "1px solid #bbdefb" }} /></Typography>
          <Box sx={{ display: "flex", gap: 0.6, flexWrap: "wrap" }}>
            <Chip size="small" label={`Total ${requests.length}`} sx={{ bgcolor: "#e3f2fd", color: "#1565c0", fontWeight: 600, height: 18, fontSize: 10 }} />
            <Chip size="small" label={`Pending ${requests.filter(r=>r.request_status==="Pending").length}`} sx={{ bgcolor: "#fff8e1", color: "#ef6c00", fontWeight: 600, height: 18, fontSize: 10, border: "1px solid #ffe082" }} />
            <Chip size="small" label={`Approved ${requests.filter(r=>r.request_status==="Approved").length}`} sx={{ bgcolor: "#e8f5e9", color: "#2e7d32", fontWeight: 600, height: 18, fontSize: 10 }} />
            <Chip size="small" label={`Rejected ${requests.filter(r=>r.request_status==="Rejected").length}`} sx={{ bgcolor: "#ffebee", color: "#c62828", fontWeight: 600, height: 18, fontSize: 10 }} />
          </Box>
        </Box>
        {monthReqs.length === 0 ? <Box sx={{ py: 2.5, textAlign: "center", bgcolor: "#f4f6f8", borderRadius: 1, border: "1px dashed #e0e0e0" }}><Typography variant="caption" color="text.secondary">No requests for this month.</Typography></Box> : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.6, maxHeight: 260, overflow: "auto", pr: 0.5 }}>
            {monthReqs.sort((a, b) => b.att_date.localeCompare(a.att_date)).map(r => (
              <Paper key={r.id} elevation={0} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", p: 1, borderRadius: 1, bgcolor: r.request_status === "Pending" ? "#fff8e1" : "#fff", border: `1px solid ${r.request_status === "Pending" ? "#ffe082" : "#e0e0e0"}` }}>
                <Box>
                  <Typography fontSize={12} fontWeight={500} color="#202124">{fmtDMY(r.att_date)} • <Chip size="small" label={r.status} sx={{ height: 16, fontSize: 9, fontWeight: 600, bgcolor: r.status === "P" ? "#e8f5e9" : "#ffebee", color: r.status === "P" ? "#2e7d32" : "#c62828" }} /> • {fmtTime(r.in_time)}–{fmtTime(r.out_time)}</Typography>
                  <Typography fontSize={11} color="text.secondary">{r.reason || <i style={{ color: "#9e9e9e" }}>no reason</i>}</Typography>
                  {r.approver_remarks && <Typography fontSize={10} color={r.request_status === "Rejected" ? "#c62828" : "#2e7d32"}>HR: {r.approver_remarks}</Typography>}
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
                  <Chip size="small" label={REQ_LABEL[r.request_status] || r.request_status} sx={{ bgcolor: REQ_COLOR[r.request_status], color: "#fff", fontWeight: 600, height: 18, fontSize: 9 }} />
                  {r.request_status === "Pending" && (
                    <>
                      <Button size="small" variant="outlined" onClick={() => setEditReq(r)} sx={{ minWidth: 0, px: 1, fontSize: 10, fontWeight: 600 }}><EditIcon sx={{ fontSize: 12, mr: 0.2 }} />Edit</Button>
                      <Button size="small" color="error" variant="outlined" onClick={() => cancelReq(r.id)} sx={{ minWidth: 0, px: 1, fontSize: 10, fontWeight: 600 }}><CancelIcon sx={{ fontSize: 12, mr: 0.2 }} />Cancel</Button>
                    </>
                  )}
                </Box>
              </Paper>
            ))}
          </Box>
        )}
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>Self-submit stays <b>Pending • Sent to HR</b> until HR Approves/Rejects. Shift G = 09:00–17:30.</Typography>
      </Paper>

      <Dialog open={!!dialogDate} onClose={() => setDialogDate(null)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 1 } }}>
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontWeight: 600, fontSize: 14 }}>{dialogDate ? fmtDMY(dialogDate) : ""} — Add Attendance <IconButton size="small" onClick={() => setDialogDate(null)}><CloseIcon fontSize="small" /></IconButton></DialogTitle>
        <DialogContent dividers sx={{ p: 2, bgcolor: "#fff" }}>
          {dialogDate && <AttendanceRequestForm initialDate={dialogDate} isResend={!!reqMap[norm(dialogDate)] && ["Approved","Rejected"].includes(reqMap[norm(dialogDate)]?.request_status)} onSuccess={() => { setDialogDate(null); fetchAll(); }} />}
        </DialogContent>
      </Dialog>

      <Dialog open={!!editReq} onClose={() => setEditReq(null)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 1 } }}>
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontWeight: 600, fontSize: 14 }}>Edit Pending • {editReq ? fmtDMY(editReq.att_date) : ""} <IconButton size="small" onClick={() => setEditReq(null)}><CloseIcon fontSize="small" /></IconButton></DialogTitle>
        <DialogContent dividers sx={{ p: 2, bgcolor: "#fff" }}>
          {editReq && <AttendanceRequestForm initialDate={norm(editReq.att_date)} editData={editReq} onSuccess={() => { setEditReq(null); fetchAll(); }} />}
        </DialogContent>
      </Dialog>
    </Box>
  );
}
