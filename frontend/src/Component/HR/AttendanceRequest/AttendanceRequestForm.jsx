import React, { useState, useEffect } from "react";
import { Box, TextField, Button, Grid, Typography, MenuItem, FormControl, InputLabel, Select, Chip } from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import axios from "axios";
import { useToast } from "../../../context/ToastContext";
import { getErrorMessage } from "../../../utils/errorUtils";

function RequestCountBadge({ attDate }) {
  const empid = localStorage.getItem("empId");
  const [counts, setCounts] = React.useState(null);
  React.useEffect(() => { if (!empid) return; axios.get(`${import.meta.env.VITE_API_URL}/api/attendance-requests/my`, { params: { empid }, withCredentials: true }).then(r => { const d = r.data || []; const sameDayList = attDate ? d.filter(x=> x.att_date.slice(0,10)===attDate) : []; setCounts({ sameDay: sameDayList.length, pending: sameDayList.filter(x=>x.request_status==="Pending").length, approved: sameDayList.filter(x=>x.request_status==="Approved").length }); }).catch(()=>{}); }, [empid, attDate]);
  if (!counts) return null;
  return <Box sx={{ display: "flex", gap: 0.5, flexWrap:"wrap" }}>{attDate && <Chip size="small" label={`This day ${attDate.split("-").reverse().join("-")}: ${counts.sameDay}`} sx={{ height: 18, fontSize: 10, fontWeight: 600, bgcolor: "#f3f5f5", color: "#6a1b9a", border:"1px solid #e1bee7" }} />}<Chip size="small" label={`Pending ${counts.pending}`} sx={{ height: 18, fontSize: 10, fontWeight: 600, bgcolor: "#fff8e1", color: "#ef6c00" }} /><Chip size="small" label={`Approved ${counts.approved}`} sx={{ height: 18, fontSize: 10, fontWeight: 600, bgcolor: "#e8f5e9", color: "#2e7d32" }} /></Box>;
}

export default function AttendanceRequestForm({ onSuccess, initialDate, editData, isResend }) {
  const { showToast } = useToast();
  const empid = localStorage.getItem("empId") || "";
  const ename = localStorage.getItem("empName") || "";
  const isEdit = !!editData;
  const [form, setForm] = useState({
    att_date: editData?.att_date?.slice(0, 10) || initialDate || new Date().toISOString().split("T")[0],
    shift: editData?.shift || "G",
    status: editData?.status || "P",
    in_time: editData?.in_time ? editData.in_time.slice(0, 5) : "09:00",
    out_time: editData?.out_time ? editData.out_time.slice(0, 5) : "17:30",
    reason: editData?.reason || ""
  });
  const [saving, setSaving] = useState(false);
  const [existsInfo, setExistsInfo] = useState(null);
  useEffect(() => { if (initialDate && !editData) setForm(f => ({ ...f, att_date: initialDate })); }, [initialDate]);
  useEffect(() => {
    if (editData || !form.att_date || !empid) return;
    axios.get(`${import.meta.env.VITE_API_URL}/api/attendance`, { params: { empid, startDate: form.att_date, endDate: form.att_date }, withCredentials: true }).then(r => {
      const rec = (r.data.records || r.data || [])[0] || r.data?.records?.[0];
      if (rec) {
        setExistsInfo(rec);
        setForm(f => ({ ...f, shift: rec.shift || f.shift, status: rec.status || f.status, in_time: rec.in_time ? rec.in_time.slice(0,5) : f.in_time, out_time: rec.out_time ? rec.out_time.slice(0,5) : f.out_time }));
      } else { setExistsInfo(null); }
    }).catch(()=>{});
  }, [form.att_date]);
  const punchNow = (field) => {
    const now = new Date();
    const t = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    setForm({ ...form, [field]: t });
  };
  const submit = async () => {
    if (!form.att_date) return showToast("Select date", "error");
    if (form.status === "P" && (!form.in_time || !form.out_time)) return showToast("Present needs In/Out", "error");
    if (isResend && !isEdit && !form.reason.trim()) return showToast("Reason is mandatory for re-request after HR approval", "error");
    setSaving(true);
    try {
      if (isEdit) {
        await axios.put(`${import.meta.env.VITE_API_URL}/api/attendance-requests/${editData.id}`, { ...form, in_time: form.status === "A" ? null : form.in_time, out_time: form.status === "A" ? null : form.out_time }, { withCredentials: true });
        showToast("Request updated - still Pending with HR", "success");
      } else {
        await axios.post(`${import.meta.env.VITE_API_URL}/api/attendance-requests/create`, { empid: parseInt(empid), ...form, in_time: form.status === "A" ? null : form.in_time, out_time: form.status === "A" ? null : form.out_time }, { withCredentials: true });
        showToast("Request sent to HR for approval", "success");
      }
      onSuccess && onSuccess();
    } catch (e) { showToast(getErrorMessage(e, "Failed"), "error"); }
    setSaving(false);
  };
  return (
    <Box>
      <Box sx={{ mb: 2, p: 1.2, bgcolor: "#f4f6f8", borderRadius: 1, border: "1px solid #e0e0e0", display: "flex", gap: 1, flexWrap: "wrap", alignItems: "center", justifyContent: "space-between" }}>
        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}><Chip label={`${empid} • ${ename}`} color="primary" size="small" sx={{ fontWeight: 600 }} /><Typography variant="caption" color="text.secondary">Will be sent to HR.</Typography></Box>
        <RequestCountBadge attDate={form.att_date} />
      </Box>
      {existsInfo && <Box sx={{ mb: 1.5, p: 1, bgcolor: "#e3f2fd", border: "1px solid #bbdefb", borderRadius: 1, fontSize: 11 }}><Typography fontSize={11} fontWeight={600} color="#1565c0">Existing: {existsInfo.status} • {existsInfo.in_time ? existsInfo.in_time.slice(0,5) : "--:--"}–{existsInfo.out_time ? existsInfo.out_time.slice(0,5) : "--:--"} {existsInfo.shift ? `• ${existsInfo.shift}` : ""}</Typography><Typography variant="caption" color="text.secondary">Prefilled from current attendance — edit to correct</Typography></Box>}
      <Grid container spacing={1.5}>
        <Grid item xs={6}><TextField fullWidth size="small" type="date" label="Attendance Date" InputLabelProps={{ shrink: true }} value={form.att_date} onChange={e => setForm({ ...form, att_date: e.target.value })} inputProps={{ max: new Date().toISOString().split("T")[0] }} /></Grid>
        <Grid item xs={3}><FormControl fullWidth size="small"><InputLabel>Shift</InputLabel><Select value={form.shift} label="Shift" onChange={e => setForm({ ...form, shift: e.target.value })}><MenuItem value="G">G-General (09:00-17:30)</MenuItem><MenuItem value="A">A-Morning</MenuItem><MenuItem value="B">B-Afternoon</MenuItem><MenuItem value="C">C-Night</MenuItem></Select></FormControl></Grid>
        <Grid item xs={3}><FormControl fullWidth size="small"><InputLabel>Day Status</InputLabel><Select value={form.status} label="Day Status" onChange={e => setForm({ ...form, status: e.target.value })}><MenuItem value="P">Present</MenuItem><MenuItem value="A">Absent (no punch)</MenuItem></Select></FormControl></Grid>
        <Grid item xs={6}>
          <TextField fullWidth size="small" type="time" label="In Time" InputLabelProps={{ shrink: true }} value={form.in_time} onChange={e => setForm({ ...form, in_time: e.target.value })} disabled={form.status === "A"} />
          <Button size="small" sx={{ mt: 0.5, fontSize: 10, textTransform: "none" }} startIcon={<AccessTimeIcon sx={{ fontSize: 12 }} />} onClick={() => punchNow("in_time")} disabled={form.status === "A"}>Punch In Now</Button>
        </Grid>
        <Grid item xs={6}>
          <TextField fullWidth size="small" type="time" label="Out Time" InputLabelProps={{ shrink: true }} value={form.out_time} onChange={e => setForm({ ...form, out_time: e.target.value })} disabled={form.status === "A"} />
          <Button size="small" sx={{ mt: 0.5, fontSize: 10, textTransform: "none" }} startIcon={<AccessTimeIcon sx={{ fontSize: 12 }} />} onClick={() => punchNow("out_time")} disabled={form.status === "A"}>Punch Out Now</Button>
        </Grid>
        <Grid item xs={12}><TextField fullWidth size="small" multiline rows={2} label={isResend && !isEdit ? "Reason / Remarks (mandatory for re-request) *" : "Reason / Remarks (optional)"} required={isResend && !isEdit} value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} placeholder={isResend && !isEdit ? "Reason mandatory for correction after HR approval" : "e.g. Biometric miss, field work, system issue... (optional)"} inputProps={{ maxLength: 300 }} helperText={`${form.reason.length}/300 ${isResend && !isEdit ? "• mandatory" : ""}`} error={isResend && !isEdit && !form.reason.trim()} /></Grid>
      </Grid>
      <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end", gap: 1 }}>
        <Button variant="contained" onClick={submit} disabled={saving || !empid}>{saving ? (isEdit ? "Updating..." : "Submitting...") : isEdit ? "Update (Still Pending)" : "Send to HR for Approval"}</Button>
      </Box>
      {!empid && <Typography color="error" variant="caption">No empId — please re-login.</Typography>}
    </Box>
  );
}
