import React, { useEffect, useState } from "react";
import { Box, Table, TableHead, TableRow, TableCell, TableBody, Button, Chip, Typography, CircularProgress, TextField, Checkbox, Paper, ToggleButtonGroup, ToggleButton, Avatar } from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import axios from "axios";
import { useToast } from "../../../context/ToastContext";
import { getErrorMessage } from "../../../utils/errorUtils";

function EmpAvatar({ empid }) {
  const [src, setSrc] = React.useState(null);
  React.useEffect(() => { if (!empid) return; axios.get(`${import.meta.env.VITE_API_URL}/api/employees/${empid}/photo`, { withCredentials: true }).then(r => { if (r.data?.photo) setSrc(`data:${r.data.mimeType || "image/jpeg"};base64,${r.data.photo}`); }).catch(()=>{}); }, [empid]);
  return <Avatar src={src} sx={{ width: 26, height: 26, bgcolor: "#e3f2fd", border: "1px solid #bbdefb", fontSize: 12 }}>{!src && <PersonIcon sx={{ fontSize: 14, color: "#1976d2" }} />}</Avatar>;
}

const REQ_COLOR = { Pending: "#ef6c00", Approved: "#2e7d32", Rejected: "#c62828", Cancelled: "#616161" };

export default function AttendanceRequestApproval() {
  const { showToast } = useToast();
  const [rows, setRows] = useState([]);
  const [all, setAll] = useState([]);
  const [filter, setFilter] = useState("Pending");
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(new Set());
  const [remarks, setRemarks] = useState("");

  const fetchData = async (f = filter) => {
    setLoading(true);
    try {
      const [pendRes, allRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/api/attendance-requests/pending`, { withCredentials: true }),
        axios.get(`${import.meta.env.VITE_API_URL}/api/attendance-requests/all`, { withCredentials: true }),
      ]);
      setAll(allRes.data || []);
      if (f === "Pending") setRows(pendRes.data || []);
      else if (f === "All") setRows(allRes.data || []);
      else setRows((allRes.data || []).filter(r => r.request_status === f));
    } catch {} setLoading(false);
  };
  useEffect(() => { fetchData(filter); }, [filter]);

  const toggle = (id) => { const n = new Set(selected); n.has(id) ? n.delete(id) : n.add(id); setSelected(n); };
  const approve = async (id) => { try { await axios.post(`${import.meta.env.VITE_API_URL}/api/attendance-requests/approve`, { id, remarks }, { withCredentials: true }); showToast("Approved", "success"); fetchData(); } catch (e) { showToast(getErrorMessage(e, "Failed"), "error"); } };
  const reject = async (id) => { try { await axios.post(`${import.meta.env.VITE_API_URL}/api/attendance-requests/reject`, { id, remarks }, { withCredentials: true }); showToast("Rejected", "success"); fetchData(); } catch (e) { showToast(getErrorMessage(e, "Failed"), "error"); } };
  const bulkApprove = async () => { if (selected.size === 0) return showToast("Select rows", "warning"); try { await axios.post(`${import.meta.env.VITE_API_URL}/api/attendance-requests/bulk-approve`, { ids: [...selected], remarks }, { withCredentials: true }); showToast(`Approved ${selected.size}`, "success"); setSelected(new Set()); fetchData(); } catch (e) { showToast(getErrorMessage(e, "Failed"), "error"); } };

  const counts = { total: all.length, pending: all.filter(r => r.request_status === "Pending").length, approved: all.filter(r => r.request_status === "Approved").length, rejected: all.filter(r => r.request_status === "Rejected").length };

  if (loading) return <Box sx={{ p: 4, textAlign: "center" }}><CircularProgress size={24} /></Box>;
  return (
    <Box>
      <Paper elevation={0} sx={{ p: 1.2, mb: 1.5, border: "1px solid #e0e0e0", borderRadius: 1, display: "flex", gap: 0.8, flexWrap: "wrap", alignItems: "center" }}>
        <Typography fontWeight={600} fontSize={13} color="#202124">HR Overview</Typography>
        <Chip size="small" label={`Total ${counts.total}`} sx={{ bgcolor: "#e3f2fd", color: "#1565c0", fontWeight: 600, height: 20 }} />
        <Chip size="small" label={`Pending ${counts.pending}`} sx={{ bgcolor: "#fff8e1", color: "#ef6c00", fontWeight: 600, height: 20, border: "1px solid #ffe082" }} />
        <Chip size="small" label={`Approved ${counts.approved}`} sx={{ bgcolor: "#e8f5e9", color: "#2e7d32", fontWeight: 600, height: 20 }} />
        <Chip size="small" label={`Rejected ${counts.rejected}`} sx={{ bgcolor: "#ffebee", color: "#c62828", fontWeight: 600, height: 20 }} />
      </Paper>

      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5, flexWrap: "wrap", gap: 1 }}>
        <ToggleButtonGroup size="small" value={filter} exclusive onChange={(_, v) => v && setFilter(v)} sx={{ bgcolor: "#fff", border: "1px solid #e0e0e0" }}>
          <ToggleButton value="Pending" sx={{ fontWeight: 600, fontSize: 11, px: 1.5 }}>Pending ({counts.pending})</ToggleButton>
          <ToggleButton value="Approved" sx={{ fontWeight: 600, fontSize: 11, px: 1.5 }}>Approved ({counts.approved})</ToggleButton>
          <ToggleButton value="Rejected" sx={{ fontWeight: 600, fontSize: 11, px: 1.5 }}>Rejected ({counts.rejected})</ToggleButton>
          <ToggleButton value="All" sx={{ fontWeight: 600, fontSize: 11, px: 1.5 }}>All ({counts.total})</ToggleButton>
        </ToggleButtonGroup>
        {filter === "Pending" && (
          <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            <TextField size="small" placeholder="Remarks for bulk" value={remarks} onChange={e => setRemarks(e.target.value)} sx={{ width: 200 }} />
            <Button variant="contained" color="success" onClick={bulkApprove} disabled={selected.size === 0} sx={{ fontWeight: 600 }}>Approve Selected ({selected.size})</Button>
            <Button size="small" variant="outlined" onClick={() => fetchData(filter)}>Refresh</Button>
          </Box>
        )}
        {filter !== "Pending" && <Button size="small" variant="outlined" onClick={() => fetchData(filter)}>Refresh</Button>}
      </Box>

      <Paper elevation={0} sx={{ border: "1px solid #e0e0e0", borderRadius: 1, overflow: "hidden" }}>
        <Table size="small"><TableHead><TableRow sx={{ bgcolor: "#f4f6f8" }}>
          {filter === "Pending" && <TableCell><Checkbox size="small" checked={selected.size === rows.length && rows.length > 0} onChange={e => { if (e.target.checked) setSelected(new Set(rows.map(r => r.id))); else setSelected(new Set()); }} /></TableCell>}
          <TableCell sx={{ fontWeight: 600, fontSize: 11 }}>Date</TableCell>
          <TableCell sx={{ fontWeight: 600, fontSize: 11 }}>Employee</TableCell>
          <TableCell sx={{ fontWeight: 600, fontSize: 11 }}>Status</TableCell>
          <TableCell sx={{ fontWeight: 600, fontSize: 11 }}>In</TableCell>
          <TableCell sx={{ fontWeight: 600, fontSize: 11 }}>Out</TableCell>
          <TableCell sx={{ fontWeight: 600, fontSize: 11 }}>Reason</TableCell>
          <TableCell sx={{ fontWeight: 600, fontSize: 11 }}>{filter === "Pending" ? "Action" : "HR Status"}</TableCell>
        </TableRow></TableHead>
          <TableBody>{rows.length === 0 ? <TableRow><TableCell colSpan={8} align="center" sx={{ py: 3, color: "#9e9e9e", fontSize: 12 }}>{filter} — no records</TableCell></TableRow> : rows.map(r => (
            <TableRow key={r.id} hover>
              {filter === "Pending" && <TableCell><Checkbox size="small" checked={selected.has(r.id)} onChange={() => toggle(r.id)} /></TableCell>}
              <TableCell sx={{ fontSize: 12 }}>{r.att_date ? r.att_date.slice(0, 10).split("-").reverse().join("-") : ""}</TableCell>
              <TableCell><Box sx={{ display: "flex", alignItems: "center", gap: 1 }}><EmpAvatar empid={r.empid} /><Box><Typography fontSize={12} fontWeight={600}>{r.empid} - {r.employee?.ename || ""}</Typography><Typography variant="caption" display="block" color="text.secondary">{r.employee?.deptname || ""}</Typography></Box></Box></TableCell>
              <TableCell><Chip size="small" label={r.status} sx={{ height: 18, fontSize: 10, fontWeight: 600 }} /></TableCell>
              <TableCell sx={{ fontSize: 12 }}>{r.in_time ? r.in_time.slice(0, 5) : "-"}</TableCell>
              <TableCell sx={{ fontSize: 12 }}>{r.out_time ? r.out_time.slice(0, 5) : "-"}</TableCell>
              <TableCell sx={{ maxWidth: 180, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", fontSize: 12 }}>{r.reason || <i style={{ color: "#9e9e9e" }}>—</i>}{r.approver_remarks && <Typography variant="caption" display="block" color={r.request_status === "Approved" ? "#2e7d32" : "#c62828"}>HR: {r.approver_remarks}</Typography>}</TableCell>
              <TableCell>
                {filter === "Pending" ? (
                  <><Button size="small" color="success" variant="contained" sx={{ mr: 0.5, fontWeight: 600, fontSize: 11 }} onClick={() => approve(r.id)}>Approve</Button><Button size="small" color="error" variant="outlined" sx={{ fontWeight: 600, fontSize: 11 }} onClick={() => reject(r.id)}>Reject</Button></>
                ) : (
                  <Chip size="small" label={r.request_status} sx={{ bgcolor: REQ_COLOR[r.request_status], color: "#fff", fontWeight: 600, height: 18, fontSize: 10 }} />
                )}
              </TableCell>
            </TableRow>
          ))}</TableBody></Table>
      </Paper>
      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>Approved/Rejected are read-only history. New corrections come as fresh Pending.</Typography>
    </Box>
  );
}
