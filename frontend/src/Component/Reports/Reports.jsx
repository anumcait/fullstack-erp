import React, { useState } from "react";
import {
  Box, Typography, Button, Stack,
  FormControl, InputLabel, Select, MenuItem, TextField,
  Table, TableHead, TableBody, TableRow, TableCell, TableContainer, Paper,
  Chip, Tabs, Tab, InputAdornment, CircularProgress, Card, CardContent, Popover, IconButton
} from "@mui/material";
import axios from "axios";
import { useToast } from "../../context/ToastContext";
import { formatDateTimeAMPM } from "../../utils/dateUtils";
import PrintIcon from "@mui/icons-material/Print";
import DownloadIcon from "@mui/icons-material/Download";
import RefreshIcon from "@mui/icons-material/Refresh";
import ClearIcon from "@mui/icons-material/Clear";
import SearchIcon from "@mui/icons-material/Search";
import AssessmentIcon from "@mui/icons-material/Assessment";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import CloseIcon from "@mui/icons-material/Close";


const leftReports = [
  { id: "shift-change", title: "Shift Change" },
  { id: "woff-change", title: "Weekly Off Change" },
  { id: "ot", title: "OT Reports" },
  { id: "tour", title: "Tour Reports" },
  { id: "late-coming", title: "Late Coming" },
  { id: "advance", title: "Advance" },
  { id: "leave", title: "Leave" }
];
const rightReports = [
  { id: "employee", title: "Employee" },
  { id: "attendance", title: "Attendance" },
  { id: "salary", title: "Salary" },
  { id: "appraisal", title: "Appraisal" },
  { id: "meals-coupon", title: "Meals Coupon" },
  { id: "other-earnings", title: "Other Earnings" },
  { id: "pt", title: "PT Report" },
  { id: "pf", title: "PF Reports" }
];

const todayStr = () => new Date().toISOString().slice(0, 10);
const oneMonthAgoStr = () => { const d = new Date(); d.setMonth(d.getMonth() - 1); return d.toISOString().slice(0, 10); };
const Reports = () => {
  const { showToast } = useToast();
  const [selectedReport, setSelectedReport] = useState(null);
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [tabValue, setTabValue] = useState(0);
  const [filters, setFilters] = useState({
    month: new Date().getMonth() + 1, year: new Date().getFullYear(), empid: "", department: "", status: "", fromDate: oneMonthAgoStr(), toDate: todayStr()
  });
  const months = [
    { value: 1, label: "Jan" }, { value: 2, label: "Feb" }, { value: 3, label: "Mar" }, { value: 4, label: "Apr" },
    { value: 5, label: "May" }, { value: 6, label: "Jun" }, { value: 7, label: "Jul" }, { value: 8, label: "Aug" },
    { value: 9, label: "Sep" }, { value: 10, label: "Oct" }, { value: 11, label: "Nov" }, { value: 12, label: "Dec" }
  ];
  const reports = tabValue === 0 ? leftReports : rightReports;

  const fetchReportData = async (reportId) => {
    setLoading(true);
    try {
      let url = ""; let params = {};
      const endDay = new Date(filters.year, filters.month, 0).getDate();
      const dateParams = { startDate: filters.fromDate || `${filters.year}-${String(filters.month).padStart(2, '0')}-01`, endDate: filters.toDate || `${filters.year}-${String(filters.month).padStart(2, '0')}-${String(endDay).padStart(2, '0')}` };
      switch (reportId) {
        case "employee": url = `${import.meta.env.VITE_API_URL}/api/employees`; break;
        case "leave": url = `${import.meta.env.VITE_API_URL}/api/leave/report`; params = dateParams; break;
        case "attendance": url = `${import.meta.env.VITE_API_URL}/api/attendance`; params = dateParams; break;
        case "ot": url = `${import.meta.env.VITE_API_URL}/api/attendance/ot-approval`; params = { month: filters.month, year: filters.year }; break;
        case "shift-change": url = `${import.meta.env.VITE_API_URL}/api/shift/change-report`; params = dateParams; break;
        case "woff-change": url = `${import.meta.env.VITE_API_URL}/api/shift/woff-report`; params = dateParams; break;
        case "tour": url = `${import.meta.env.VITE_API_URL}/api/tour/report`; params = dateParams; break;
        case "late-coming": url = `${import.meta.env.VITE_API_URL}/api/attendance/late-report`; params = { month: filters.month, year: filters.year, lateOnly: true }; break;
        case "advance": url = `${import.meta.env.VITE_API_URL}/api/advance/report`; params = dateParams; break;
        case "salary": url = `${import.meta.env.VITE_API_URL}/api/payroll/register`; params = { month: filters.month, year: filters.year }; break;
        case "pf": url = `${import.meta.env.VITE_API_URL}/api/payroll/pf-report`; params = { month: filters.month, year: filters.year }; break;
        case "pt": url = `${import.meta.env.VITE_API_URL}/api/payroll/pt-report`; params = { month: filters.month, year: filters.year }; break;
        case "meals-coupon": url = `${import.meta.env.VITE_API_URL}/api/payroll/meals-coupon`; params = { month: filters.month, year: filters.year }; break;
        case "appraisal": url = `${import.meta.env.VITE_API_URL}/api/pms/appraisals`; params = { year: filters.year }; break;
        case "other-earnings": url = `${import.meta.env.VITE_API_URL}/api/payroll/earnings-deductions`; params = { month: filters.month, year: filters.year }; break;
        default: url = `${import.meta.env.VITE_API_URL}/api/employees`;
      }
      const res = await axios.get(url, { params, withCredentials: true });
      setReportData(Array.isArray(res.data) ? res.data : (res.data.data || []));
    } catch (err) {
      console.error("Report fetch failed:", err?.response?.data || err.message);
      showToast(err?.response?.data?.message || err?.response?.data?.error || `Error fetching report (${err?.response?.status || "network"})`, "error");
      setReportData([]);
    } finally { setLoading(false); }
  };
  const exportToCSV = () => {
    if (reportData.length === 0) { showToast("No data to export", "warning"); return; }
    const headers = Object.keys(reportData[0]);
    const csvContent = [headers.join(","), ...reportData.map(row => headers.map(h => { const v = row[h]; if (v == null) return ""; const s = String(v); return s.includes(",") || s.includes('"') ? `"${s.replace(/"/g, '""')}"` : s; }).join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a"); link.href = URL.createObjectURL(blob);
    link.download = `${selectedReport?.title?.replace(/\s+/g, "_")}_${filters.year}_${filters.month}.csv`; link.click();
    showToast("Exported", "success");
  };
  const [expandedLno, setExpandedLno] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [detailRow, setDetailRow] = useState(null);
  const getColumns = (id) => {
    switch (id) {
      case "employee": return ["", "Emp ID", "Name", "Department", "Designation", "DOJ", "Status"];
      case "leave": return ["", "App No", "Date", "Employee", "Leave Type", "From", "To", "Days", "Status"];
      case "attendance": return ["Date", "Emp ID", "Name", "In", "Out", "Status", "Late", "OT"];
      case "ot": return ["Date", "Emp ID", "Name", "Actual OT", "Manager OT", "HR OT", "Status"];
      case "shift-change": return ["App No", "Entry Date", "Emp ID", "Name", "Actual", "Changed", "Reason", "Status"];
      case "woff-change": return ["App No", "Date", "Emp ID", "Name", "Current", "Requested", "Reason", "Status"];
      case "tour": return ["App No", "Date", "Emp ID", "Name", "From", "To", "Destination", "Purpose", "Status"];
      case "late-coming": return ["Date", "Emp ID", "Name", "In Time", "Shift Start", "Late", "Deduction"];
      case "advance": return ["App No", "Date", "Emp ID", "Name", "Amount", "Reason", "Status", "Approval"];
      case "salary": return ["Emp ID", "Name", "Basic", "HRA", "Gross", "Ded", "Net"];
      case "pf": return ["Emp ID", "Name", "PF No", "Basic", "PF", "Emp Share", "Empr Share"];
      case "pt": return ["Emp ID", "Name", "PAN", "Gross", "PT"];
      default: return reportData[0] ? Object.keys(reportData[0]).slice(0, 8) : [];
    }
  };
  const getColWidths = (id) => {
    switch (id) {
      case "employee": return [36, 75, 155, 110, 110, 88, 78];
      case "leave": return [36, 68, 92, 160, 78, 88, 88, 48, 88];
      case "attendance": return [88, 70, 150, 72, 72, 78, 58, 58];
      case "ot": return [88, 70, 150, 78, 88, 88, 78];
      case "shift-change": return [68, 92, 70, 150, 70, 70, 110, 78];
      case "woff-change": return [68, 88, 70, 150, 78, 88, 110, 78];
      case "tour": return [68, 88, 70, 150, 85, 85, 110, 110, 78];
      case "late-coming": return [88, 70, 150, 78, 88, 60, 78];
      case "advance": return [68, 88, 70, 150, 82, 130, 78, 78];
      case "salary": return [70, 155, 72, 72, 78, 70, 78];
      case "pf": return [70, 155, 95, 72, 72, 78, 78];
      case "pt": return [70, 155, 110, 78, 72];
      default: return getColumns(id).map(() => 110);
    }
  };
  const formatRowData = (id, row) => {
    switch (id) {
      case "employee": return ["", row.empid, row.ename, row.deptname, row.desgname, row.doj, row.is_active ? "Active" : "Inactive"];
      case "leave": {
        const dets = row.leaveDetails || row.LeaveDetails || [];
        const f = dets[0];
        const l = dets[dets.length - 1];
        const from = f ? (f.frmdt ? new Date(f.frmdt).toLocaleDateString('en-GB') : f.daydt) : (row.fromdate || "-");
        const to = l ? (l.todate ? new Date(l.todate).toLocaleDateString('en-GB') : l.daydt) : (row.todate || "-");
        const rawNod = dets.length ? dets.reduce((s, d) => s + parseFloat(d.nod || 0), 0) : (row.nod ?? "-");
        const nod = rawNod === "-" ? "-" : String(Number(parseFloat(rawNod)));
        const ltype = row.pofl || row.purpose || row.leave_type || row.ltype || "-";
        const ldateStr = row.ldate ? new Date(row.ldate).toLocaleDateString('en-GB') : "-";
        return ["", row.lno, ldateStr, `${row.empid} — ${row.ename}`, ltype, from, to, nod, row.status];
      }
      case "attendance": return [row.att_date, row.empid, row.ename, row.in_time, row.out_time, row.status, row.late_hrs, row.ot_hrs];
      case "ot": return [row.att_date, row.empid, row.ename, row.ot_hrs, row.app_ot, row.hr_app_ot, row.app_status];
      case "shift-change": return [row.schange_no, formatDateTimeAMPM(row.schange_date), row.empid, row.ename, row.act_shift, row.change_shift, row.reason, row.status];
      case "woff-change": return [row.woff_id || row.schange_no, formatDateTimeAMPM(row.woff_date), row.empid, row.ename, row.current_woff || row.current_woff_day, row.requested_woff || row.requested_woff_day, row.reason, row.status];
      case "tour": return [row.tour_id || row.schange_no, row.tour_date || row.schange_date, row.empid, row.ename, row.tour_from_date || "-", row.tour_to_date || "-", row.destination || "-", row.purpose || row.reason || "-", row.status || "Pending"];
      case "late-coming": return [row.att_date, row.empid, row.ename, row.in_time, row.shift_start, row.late_hrs, row.late_ded];
      case "advance": return [row.advance_id, row.advance_date, row.empid, row.ename, row.amount, row.reason, row.status, row.approval_date];
      case "salary": return [row.C_EMPID, row.C_ENAME, row.C_BASIC, row.C_HRA, row.C_TOT_SAL, row.C_TOT_DED, row.C_NET_AMT];
      case "pf": return [row.empid, row.ename, row.pf_no, row.basic, row.pf_contribution, row.emp_share, row.employer_share];
      case "pt": return [row.empid, row.ename, row.pan_no, row.gross_salary, row.pt_amount];
      default: return Object.values(row).slice(0, 8);
    }
  };
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [sortCol, setSortCol] = useState(-1);
  const [sortDir, setSortDir] = useState("asc");
  const [colFilters, setColFilters] = useState({});
  const clearFilters = () => { setFilters({ month: new Date().getMonth() + 1, year: new Date().getFullYear(), empid: "", department: "", status: "", fromDate: oneMonthAgoStr(), toDate: todayStr() }); setSearchText(""); setColFilters({}); setPage(1); };
  const refreshData = () => { setPage(1); selectedReport && fetchReportData(selectedReport.id); };
  const filteredData = reportData.filter(row => {
    if (searchText && !Object.values(row).some(v => String(v).toLowerCase().includes(searchText.toLowerCase()))) return false;
    if (!selectedReport || !colFilters || Object.keys(colFilters).length === 0) return true;
    try {
      const cells = formatRowData(selectedReport.id, row);
      for (const idx in colFilters) {
        const f = colFilters[idx];
        if (f && !String(cells[idx] ?? "").toLowerCase().includes(f.toLowerCase())) return false;
      }
    } catch (e) { return true; }
    return true;
  });
  const sortedData = (() => {
    if (sortCol < 0) return filteredData;
    return [...filteredData].sort((a, b) => {
      const av = formatRowData(selectedReport?.id, a)[sortCol];
      const bv = formatRowData(selectedReport?.id, b)[sortCol];
      const cmp = String(av ?? "").localeCompare(String(bv ?? ""), undefined, { numeric: true });
      return sortDir === "asc" ? cmp : -cmp;
    });
  })();
  const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize));
  const paginatedData = sortedData.slice((page - 1) * pageSize, page * pageSize);
  const handleSearch = (v) => { setSearchText(v); setPage(1); };
  const handleSort = (idx) => {
    if (sortCol === idx) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortCol(idx); setSortDir("asc"); }
  };
  const handleReportClick = (report) => {
    setSelectedReport(report);
    setReportData([]);
    setPage(1);
    setSortCol(-1);
    setColFilters({});
    fetchReportData(report.id);
  };

  return (
    <Box sx={{ p: 1, bgcolor: "#f4f6f8", minHeight: "calc(100vh - 48px)", display: "flex", flexDirection: "column", gap: 1 }}>
      <Paper sx={{ px: 1.5, py: 0.8, display: "flex", alignItems: "center", gap: 1.5, borderRadius: 1, boxShadow: "0 1px 2px rgba(0,0,0,0.06)", border: "1px solid #e0e0e0" }}>
        <AssessmentIcon sx={{ color: "#1976d2", fontSize: 22 }} />
        <Typography variant="subtitle2" fontWeight={700} sx={{ color: "#202124", fontSize: "1rem" }}>Reports</Typography>
        <Tabs value={tabValue} onChange={(e, v) => { setTabValue(v); setSelectedReport(null); setReportData([]); }} sx={{ ml: 1, minHeight: 30, "& .MuiTab-root": { minHeight: 30, py: 0, px: 1.6, fontSize: "0.82rem", fontWeight: 600, textTransform: "none", color: "#5f6368", minWidth: 100 }, "& .Mui-selected": { color: "#1976d2 !important" }, "& .MuiTabs-indicator": { height: 2.5, bgcolor: "#1976d2" } }}>
          <Tab label="Daily Reports" />
          <Tab label="Salary Reports" />
        </Tabs>
        <Box sx={{ flex: 1 }} />
        {selectedReport && <Chip label={selectedReport.title} size="small" sx={{ height: 20, fontSize: "0.65rem", fontWeight: 700, bgcolor: "#e3f2fd", color: "#1565c0", border: "1px solid #bbdefb" }} />}
      </Paper>

      <Paper sx={{ p: 1, borderRadius: 1, border: "1px solid #e0e0e0", boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }}>
        <Box sx={{ display: "flex", gap: 0.8 }}>
          {reports.map(r => {
            const active = selectedReport?.id === r.id;
            return (
              <Card key={r.id} onClick={() => handleReportClick(r)} sx={{ flex: "1 1 0", minWidth: 0, height: 68, cursor: "pointer", borderRadius: 1, border: active ? "1.5px solid #1976d2" : "1px solid #e0e0e0", bgcolor: active ? "#e3f2fd" : "#fff", boxShadow: active ? "0 2px 8px rgba(25,118,210,0.12)" : "0 1px 2px rgba(0,0,0,0.04)", transition: "all 0.15s", "&:hover": { borderColor: "#90caf9", bgcolor: active ? "#e3f2fd" : "#f8fafc" } }}>
                <CardContent sx={{ p: 1, "&:last-child": { pb: 1 }, height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center" }}>
                  <Typography variant="body2" fontWeight={active ? 700 : 600} sx={{ color: active ? "#1565c0" : "#202124", fontSize: "0.85rem", lineHeight: 1.2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", width: "100%" }}>{r.title}</Typography>
                  <Typography variant="caption" sx={{ color: active ? "#1976d2" : "#94a3b8", fontSize: "0.7rem", mt: 0.2 }}>{active ? "● Selected" : "View"}</Typography>
                </CardContent>
              </Card>
            );
          })}
        </Box>
      </Paper>

      <Paper id="report-table-anchor" sx={{ flex: 1, minHeight: 380, borderRadius: 1, border: "1px solid #e0e0e0", display: "flex", flexDirection: "column", overflow: "hidden", boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }}>
        {!selectedReport ? (
          <Box sx={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", p: 3, color: "#94a3b8" }}>
            <Typography variant="body2" fontWeight={600} sx={{ color: "#64748b", fontSize: "0.82rem" }}>Select a card above to view data</Typography>
            <Typography variant="caption" sx={{ color: "#94a3b8", fontSize: "0.68rem" }}>Filters and table will appear here — maximum space for data</Typography>
          </Box>
        ) : (
          <>
            <Box sx={{ px: 1.2, py: 0.8, bgcolor: "#fff", borderBottom: "1px solid #e0e0e0", display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
              <Typography variant="body2" fontWeight={700} sx={{ color: "#202124", fontSize: "0.9rem" }}>{selectedReport.title}</Typography>
              <Chip label={`${filteredData.length} rows`} size="small" sx={{ height: 20, fontSize: "0.7rem", fontWeight: 700, bgcolor: "#f1f5f9", color: "#475569" }} />
              <Box sx={{ flex: 1 }} />
              <Button size="small" variant="outlined" onClick={refreshData} sx={{ minWidth: 0, px: 1, height: 30, fontSize: "0.78rem", textTransform: "none" }}><RefreshIcon sx={{ fontSize: 15, mr: 0.3 }} />Refresh</Button>
              <Button size="small" variant="contained" onClick={exportToCSV} sx={{ height: 30, fontSize: "0.78rem", textTransform: "none", px: 1.2 }}><DownloadIcon sx={{ fontSize: 15, mr: 0.3 }} />CSV</Button>
              <Button size="small" variant="outlined" onClick={() => window.print()} sx={{ minWidth: 0, px: 1, height: 30, fontSize: "0.78rem", textTransform: "none" }}><PrintIcon sx={{ fontSize: 15 }} /></Button>
            </Box>
            <Box sx={{ px: 1, py: 0.8, bgcolor: "#fafafa", borderBottom: "1px solid #e0e0e0", display: "flex", gap: 0.8, flexWrap: "wrap", alignItems: "center" }}>
              <TextField type="date" size="small" label="From" value={filters.fromDate} onChange={e => setFilters({ ...filters, fromDate: e.target.value })} InputLabelProps={{ shrink: true, sx: { fontSize: "0.75rem" } }} inputProps={{ style: { padding: "5px 8px", fontSize: "0.82rem" } }} sx={{ width: 148, "& .MuiInputBase-root": { height: 32, bgcolor: "#fff", fontSize: "0.82rem" } }} />
              <TextField type="date" size="small" label="To" value={filters.toDate} onChange={e => setFilters({ ...filters, toDate: e.target.value })} InputLabelProps={{ shrink: true, sx: { fontSize: "0.75rem" } }} inputProps={{ style: { padding: "5px 8px", fontSize: "0.82rem" } }} sx={{ width: 148, "& .MuiInputBase-root": { height: 32, bgcolor: "#fff", fontSize: "0.82rem" } }} />
              <FormControl size="small" sx={{ minWidth: 95, "& .MuiInputBase-root": { height: 32, bgcolor: "#fff", fontSize: "0.82rem" } }}><InputLabel sx={{ fontSize: "0.75rem" }}>Month</InputLabel><Select value={filters.month} label="Month" onChange={e => setFilters({ ...filters, month: e.target.value })} sx={{ fontSize: "0.82rem" }}>{months.map(m => (<MenuItem key={m.value} value={m.value} sx={{ fontSize: "0.82rem" }}>{m.label}</MenuItem>))}</Select></FormControl>
              <FormControl size="small" sx={{ minWidth: 78, "& .MuiInputBase-root": { height: 32, bgcolor: "#fff", fontSize: "0.82rem" } }}><InputLabel sx={{ fontSize: "0.75rem" }}>Year</InputLabel><Select value={filters.year} label="Year" onChange={e => setFilters({ ...filters, year: e.target.value })}>{[2023, 2024, 2025, 2026, 2027].map(y => (<MenuItem key={y} value={y} sx={{ fontSize: "0.82rem" }}>{y}</MenuItem>))}</Select></FormControl>
              <Button variant="contained" size="small" onClick={refreshData} sx={{ height: 32, px: 1.6, fontSize: "0.78rem", textTransform: "none", fontWeight: 700 }}>Apply</Button>
              <Button variant="text" size="small" onClick={clearFilters} sx={{ height: 32, minWidth: 0, px: 1, fontSize: "0.78rem", textTransform: "none", color: "#64748b" }}><ClearIcon sx={{ fontSize: 14, mr: 0.2 }} />Clear</Button>
            </Box>
            <Box sx={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column", minHeight: 0 }}>
              {loading ? (
                <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 1, py: 2 }}><CircularProgress size={14} /><Typography variant="caption" color="text.secondary">Loading…</Typography></Box>
              ) : sortedData.length === 0 ? (
                <Box sx={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", py: 2 }}><Typography sx={{ fontSize: "1.1rem", mb: 0.5 }}>📭</Typography><Typography variant="caption" fontWeight={600} sx={{ color: "#64748b", fontSize: "0.72rem" }}>No data</Typography></Box>
              ) : (
                <TableContainer sx={{ flex: 1, overflow: "auto" }}>
                  <Table size="small" stickyHeader sx={{ tableLayout: "fixed", width: "100%", "& .MuiTableCell-root": { py: 0.4, px: 0.7 } }}>
                     <TableHead>
                      <TableRow>{getColumns(selectedReport.id).map((c, i) => { const w = getColWidths(selectedReport.id)[i] || 100; return (<TableCell key={i} onClick={() => c && handleSort(i)} sx={{ bgcolor: "#fff", color: sortCol === i ? "#1976d2" : "#334155", fontWeight: 700, fontSize: "0.78rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", borderBottom: "1px solid #e2e8f0", textTransform: "uppercase", letterSpacing: 0.3, py: 0.8, width: w, minWidth: w, maxWidth: w, cursor: c ? "pointer" : "default", userSelect: "none", "&:hover": { bgcolor: c ? "#f8fafc" : "#fff" } }}>{c} {c && sortCol === i ? (sortDir === "asc" ? "▲" : "▼") : ""}</TableCell>); })}</TableRow>
                      <TableRow>
                        {getColumns(selectedReport?.id).map((c, i) => {
                          const w = getColWidths(selectedReport?.id)[i] || 100;
                          return (
                            <TableCell key={`f-${i}`} sx={{ bgcolor: "#f8fafc", py: 0.3, px: 0.4, borderBottom: "1px solid #e2e8f0", width: w, minWidth: w, maxWidth: w }}>
                              {!c ? null : (
                                <TextField
                                  size="small"
                                  placeholder={`Filter`}
                                  value={colFilters[i] || ""}
                                  onChange={e => { setColFilters(prev => ({ ...prev, [i]: e.target.value })); setPage(1); }}
                                  sx={{ width: "100%", "& .MuiInputBase-root": { height: 24, bgcolor: "#fff", fontSize: "0.7rem" } }}
                                  inputProps={{ style: { padding: "2px 6px" } }}
                                />
                              )}
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {paginatedData.map((row, ri) => {
                        const cells = formatRowData(selectedReport.id, row);
                        const widths = getColWidths(selectedReport.id);
                        const isExpandable = selectedReport.id === "leave";
                        return (
                          <>
                            <TableRow key={ri} hover sx={{ "&:nth-of-type(even)": { bgcolor: "#f8fafc" }, height: 30 }}>
                              {cells.map((cell, ci) => {
                                const w = widths[ci] || 100;
                                if (ci === 0 && isExpandable) {
                                  return (
                                    <TableCell key={ci} sx={{ borderBottom: "1px solid #f1f5f9", textAlign: "center", p: 0, width: w, minWidth: w, maxWidth: w, overflow: "hidden" }}>
                                      <IconButton size="small" onClick={(e) => { setAnchorEl(e.currentTarget); setDetailRow(row); }} sx={{ width: 22, height: 22, color: "#64748b" }}>
                                        <ExpandMoreIcon sx={{ fontSize: 16 }} />
                                      </IconButton>
                                    </TableCell>
                                  );
                                }
                                return (
                                  <TableCell key={ci} sx={{ fontSize: "0.84rem", color: "#334155", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", borderBottom: "1px solid #f1f5f9", width: w, minWidth: w, maxWidth: w }}>
                                    {String(cell ?? "-").includes("Approved") ? <Chip label={cell} size="small" sx={{ height: 18, fontSize: "0.7rem", fontWeight: 700, bgcolor: "#dcfce7", color: "#166534" }} /> : String(cell ?? "-").includes("Pending") ? <Chip label={cell} size="small" sx={{ height: 18, fontSize: "0.7rem", fontWeight: 700, bgcolor: "#fef9c3", color: "#854d0e" }} /> : (String(cell ?? "-").includes("Cancelled") || String(cell ?? "-").includes("Rejected") || String(cell ?? "-").toLowerCase().includes("cancel")) ? <Chip label={cell} size="small" sx={{ height: 18, fontSize: "0.7rem", fontWeight: 700, bgcolor: "#fee2e2", color: "#991b1b" }} /> : String(cell ?? "-")}
                                  </TableCell>
                                );
                              })}
                            </TableRow>
                          </>
                        );
                      })}
                      </TableBody>
                    </Table>
                </TableContainer>
              )}
            </Box>
            {sortedData.length > 0 && (
              <Box sx={{ px: 1, py: 0.5, bgcolor: "#fafafa", borderTop: "1px solid #e0e0e0", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 1 }}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Typography variant="caption" sx={{ fontSize: "0.68rem", color: "#64748b" }}>Rows per page:</Typography>
                  <FormControl size="small" sx={{ minWidth: 60, "& .MuiInputBase-root": { height: 24, fontSize: "0.7rem", bgcolor: "#fff" } }}>
                    <Select value={pageSize} onChange={e => { setPageSize(parseInt(e.target.value)); setPage(1); }}>
                      {[10, 25, 50, 100].map(n => <MenuItem key={n} value={n} sx={{ fontSize: "0.7rem" }}>{n}</MenuItem>)}
                    </Select>
                  </FormControl>
                  <Typography variant="caption" sx={{ fontSize: "0.68rem", color: "#64748b" }}>
                    {sortedData.length === 0 ? 0 : (page - 1) * pageSize + 1}–{Math.min(page * pageSize, sortedData.length)} of {sortedData.length}
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <Button size="small" variant="outlined" disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))} sx={{ minWidth: 60, height: 24, fontSize: "0.68rem", textTransform: "none" }}>Prev</Button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, idx) => {
                    let pNum;
                    if (totalPages <= 5) pNum = idx + 1;
                    else if (page <= 3) pNum = idx + 1;
                    else if (page >= totalPages - 2) pNum = totalPages - 4 + idx;
                    else pNum = page - 2 + idx;
                    return (
                      <Button key={pNum} size="small" variant={pNum === page ? "contained" : "outlined"} onClick={() => setPage(pNum)} sx={{ minWidth: 28, height: 24, fontSize: "0.68rem", p: 0 }}>{pNum}</Button>
                    );
                  })}
                  <Button size="small" variant="outlined" disabled={page >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))} sx={{ minWidth: 60, height: 24, fontSize: "0.68rem", textTransform: "none" }}>Next</Button>
                </Stack>
              </Box>
            )}
          </>
        )}
      </Paper>
      <Popover open={Boolean(anchorEl)} anchorEl={anchorEl} onClose={() => { setAnchorEl(null); setDetailRow(null); }} anchorOrigin={{ vertical: "bottom", horizontal: "left" }} transformOrigin={{ vertical: "top", horizontal: "left" }} PaperProps={{ sx: { mt: 0.5, border: "1px solid #e0e0e0", borderRadius: 1, overflow: "hidden", minWidth: 560, maxWidth: 660, boxShadow: "0 4px 16px rgba(0,0,0,0.12)" } }}>
        {detailRow && (() => {
          const row = detailRow;
          const hr = row.hrDetails || [];
          const ld = row.leaveDetails || row.LeaveDetails || [];
          let dets0 = hr.length ? hr : ld;
          if (dets0.length === 1) {
            const single = dets0[0];
            const s = single.frmdt ? new Date(single.frmdt) : (single.daydt ? new Date(single.daydt.split("-").reverse().join("-")) : null);
            const e = single.todate ? new Date(single.todate) : s;
            if (s && e && (e - s) / 86400000 >= 1) {
              const out = [];
              for (let d = new Date(s); d <= e; d.setDate(d.getDate() + 1)) {
                const ds = `${String(d.getDate()).padStart(2, "0")}-${String(d.getMonth() + 1).padStart(2, "0")}-${d.getFullYear()}`;
                const isFirst = d.getTime() === s.getTime();
                out.push({ ...single, daydt: isFirst ? single.daydt : "FULL DAY", frmdt: new Date(d), nod: 1, c_cl_sanction: isFirst ? (single.c_cl_sanction ?? single.cl_sanction ?? 0) : 0, c_el_sanction: isFirst ? (single.c_el_sanction ?? single.el_sanction ?? 0) : 0, cl_sanction: isFirst ? (single.cl_sanction ?? single.c_cl_sanction ?? 0) : 0, el_sanction: isFirst ? (single.el_sanction ?? single.c_el_sanction ?? 0) : 0, app_status: isFirst ? single.app_status ?? single.c_hr_app_status : "Pending" });
              }
              dets0 = out;
            }
          }
          const ldMap = new Map(ld.map(x => [x.daydt || (x.frmdt ? new Date(x.frmdt).toLocaleDateString('en-GB') : ""), x]));
          const dets = dets0.map(d => {
            const dayKey = d.daydt || (d.frmdt ? new Date(d.frmdt).toLocaleDateString('en-GB') : "");
            const ldMatch = ldMap.get(dayKey);
            const clRaw = d.cl_sanction ?? d.c_cl_sanction ?? ldMatch?.c_cl_sanction ?? ldMatch?.cl_sanction ?? 0;
            const elRaw = d.el_sanction ?? d.c_el_sanction ?? ldMatch?.c_el_sanction ?? ldMatch?.el_sanction ?? 0;
            return { ...d, _cl: clRaw, _el: elRaw, _ldMatch: ldMatch };
          });
          const totCL = dets.reduce((s, d) => s + (parseFloat(d._cl) || 0), 0);
          const totEL = dets.reduce((s, d) => s + (parseFloat(d._el) || 0), 0);
          const totLOP = dets.filter(d => !parseFloat(d._cl) && !parseFloat(d._el)).length;
          return (
            <Box>
              <Box sx={{ px: 1.5, py: 1, bgcolor: "#1976d2", color: "#fff", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography fontWeight={700} fontSize={12}>Leave #{row.lno} — {row.empid} — {row.ename} • {row.pofl || "-"} • {dets.length} days</Typography>
                <IconButton size="small" onClick={() => { setAnchorEl(null); setDetailRow(null); }} sx={{ color: "#fff", p: 0.3 }}><CloseIcon fontSize="small" /></IconButton>
              </Box>
              <Box sx={{ display: "flex", bgcolor: "#f5f5f5", px: 1.5, py: 0.6, borderBottom: "1px solid #e0e0e0", fontWeight: 600, fontSize: 11, color: "#666" }}>
                <Box sx={{ width: 28 }}>#</Box><Box sx={{ flex: 1 }}>Day Date</Box><Box sx={{ width: 95 }}>Day Type</Box><Box sx={{ width: 40, textAlign: "center" }}>CL</Box><Box sx={{ width: 40, textAlign: "center" }}>EL</Box><Box sx={{ width: 40, textAlign: "center" }}>LOP</Box><Box sx={{ width: 90, textAlign: "center" }}>HR Status</Box>
              </Box>
              {dets.map((d, di) => {
                const isCL = parseFloat(d._cl) > 0; const isEL = parseFloat(d._el) > 0; const isLOP = !isCL && !isEL;
                const dayDate = d.frmdt ? new Date(d.frmdt).toLocaleDateString('en-GB') : (d.daydt && d.daydt.includes("-") && d.daydt.length > 5 ? d.daydt : "-");
                const dayType = d.daydt && (String(d.daydt).toUpperCase().includes("HALF") || String(d.daydt).toUpperCase().includes("FULL")) ? d.daydt : (d.nod == 0.5 ? "HALF DAY" : "FULL DAY");
                const hst = d.app_status ?? d.c_hr_app_status ?? d._ldMatch?.c_hr_app_status ?? "-";
                return (
                  <Box key={di} sx={{ display: "flex", px: 1.5, py: 0.6, bgcolor: isLOP ? "#fffbeb" : isCL ? "#eff6ff" : isEL ? "#f0fdf4" : (di % 2 === 0 ? "#fff" : "#fafafa"), borderBottom: di < dets.length - 1 ? "1px solid #f0f0f0" : "none", fontSize: 12, alignItems: "center" }}>
                    <Box sx={{ width: 28, color: "#94a3b8" }}>{di + 1}</Box>
                    <Box sx={{ flex: 1, fontWeight: 500 }}>{dayDate}</Box>
                    <Box sx={{ width: 95 }}><Chip label={dayType} size="small" sx={{ height: 16, fontSize: "0.6rem", fontWeight: 600, bgcolor: dayType.includes("HALF") ? "#fef9c3" : "#e0f2fe", color: dayType.includes("HALF") ? "#854d0e" : "#0c4a6e", maxWidth: 95, "& .MuiChip-label": { overflow: "visible" } }} /></Box>
                    <Box sx={{ width: 40, textAlign: "center", fontWeight: isCL ? 700 : 400, color: isCL ? "#1565c0" : "#cbd5e1" }}>{isCL ? String(Number(parseFloat(d._cl))) : "—"}</Box>
                    <Box sx={{ width: 40, textAlign: "center", fontWeight: isEL ? 700 : 400, color: isEL ? "#0e7a0e" : "#cbd5e1" }}>{isEL ? String(Number(parseFloat(d._el))) : "—"}</Box>
                    <Box sx={{ width: 40, textAlign: "center", fontWeight: isLOP ? 700 : 400, color: isLOP ? "#b45309" : "#cbd5e1" }}>{isLOP ? "1" : "—"}</Box>
                    <Box sx={{ width: 90, textAlign: "center" }}>{hst && hst !== "-" ? <Chip label={hst} size="small" sx={{ height: 16, fontSize: "0.6rem", fontWeight: 700, bgcolor: String(hst).includes("Approved") ? "#dcfce7" : String(hst).includes("Pending") ? "#fef9c3" : "#fee2e2", color: String(hst).includes("Approved") ? "#166534" : String(hst).includes("Pending") ? "#854d0e" : "#991b1b" }} /> : "—"}</Box>
                  </Box>
                );
              })}
              <Box sx={{ px: 1.5, py: 0.7, textAlign: "right", fontWeight: 700, fontSize: 12, bgcolor: "#fafafa", borderTop: "1px solid #e0e0e0", display: "flex", justifyContent: "space-between" }}>
                <span>Total: {dets.length} days</span><span style={{ color: "#1565c0" }}>CL {totCL || "—"}</span><span style={{ color: "#0e7a0e" }}>EL {totEL || "—"}</span><span style={{ color: "#b45309" }}>LOP {totLOP || "—"}</span>
              </Box>
            </Box>
          );
        })()}
      </Popover>
    </Box>
  );
};
export default Reports;
