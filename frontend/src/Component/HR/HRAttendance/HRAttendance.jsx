import React, { useState, useEffect, useRef } from "react";
import {
  Box, Card, CardContent, Typography, Grid, TextField, Select, MenuItem,
  Button, Table, TableHead, TableBody, TableRow, TableCell,
  IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Chip,
  FormControl, InputLabel, CircularProgress, TablePagination, Alert, Tooltip
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import FilterListIcon from "@mui/icons-material/FilterList";
import ClearIcon from "@mui/icons-material/Clear";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PersonOffIcon from "@mui/icons-material/PersonOff";
import RefreshIcon from "@mui/icons-material/Refresh";
import BlockIcon from "@mui/icons-material/Block";
import axios from "axios";
import { useToast } from "../../../context/ToastContext";
import { getErrorMessage } from "../../../utils/errorUtils";

// General shift defaults — must match backend attendanceController.js fallbacks
const DEFAULT_IN_TIME = "09:00";
const DEFAULT_OUT_TIME = "17:30";

// A weekly off is either the day's status or the shift; mirrors the backend check.
const isWeeklyOffRow = (row) => {
  const s = String(row.status || "").toUpperCase();
  const sh = String(row.shift || "").toUpperCase();
  return s === "W" || s === "WOFF" || s === "W-OFF" || sh === "W";
};

const HRAttendance = () => {
  const { showToast } = useToast();

  const [filterType, setFilterType] = useState("month");
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [dataDate, setDataDate] = useState(new Date().toISOString().split("T")[0]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [attendanceData, setAttendanceData] = useState([]);
  const [employeeList, setEmployeeList] = useState([]);
  const [bulkDialog, setBulkDialog] = useState(false);
  const [editDialog, setEditDialog] = useState(false);
  const [editRow, setEditRow] = useState(null);
  const [bulkRows, setBulkRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [payrollFinalized, setPayrollFinalized] = useState(false);
  const [bulkFilterType, setBulkFilterType] = useState("month");
  const [bulkDataDate, setBulkDataDate] = useState(new Date().toISOString().split("T")[0]);
  const [bulkFromDate, setBulkFromDate] = useState("");
  const [bulkToDate, setBulkToDate] = useState("");
  const [bulkMonth, setBulkMonth] = useState(new Date().getMonth() + 1);
  const [bulkYear, setBulkYear] = useState(new Date().getFullYear());
  // bulkEmployeeFilter removed — filtering is done via bulkEmployeeId and bulkDepartmentFilter
  const [bulkDepartmentFilter, setBulkDepartmentFilter] = useState("");
  const [bulkEmployeeId, setBulkEmployeeId] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const [saving, setSaving] = useState(false);
  const [savingIdx, setSavingIdx] = useState(null);
  const [quickInTime, setQuickInTime] = useState("");
  const [quickOutTime, setQuickOutTime] = useState("");
  const [mainFiltersDirty, setMainFiltersDirty] = useState(false);
  const bulkDialogRef = useRef(false);
  const [woffTarget, setWoffTarget] = useState(null);
  const [revokeTarget, setRevokeTarget] = useState(null);
  const [woffForm, setWoffForm] = useState({ reason: "" });
  const [woffSaving, setWoffSaving] = useState(false);

  const markMainFiltersDirty = () => setMainFiltersDirty(true);

  useEffect(() => {
    fetchEmployees();
    // Mount-only: re-runs are handled by openBulkEntry when the list came back empty.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredAttendanceData = attendanceData.filter(row => row.status !== 'W' && row.status !== 'H');
  const dirtyCount = bulkRows.filter(r => r.dirty).length;

  useEffect(() => {
    // Auto-refresh when employee / month / year change (also covers initial load).
    // Date and range changes still wait for the Apply Filter button.
    if (filterType === "range" && (!fromDate || !toDate)) return;
    fetchData();
  }, [selectedEmployee, month, year]);

  const fetchData = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const params = {};
      if (filterType === "date") {
        params.startDate = dataDate;
        params.endDate = dataDate;
      } else if (filterType === "range") {
        params.startDate = fromDate;
        params.endDate = toDate;
      } else if (filterType === "month") {
        params.month = month;
        params.year = year;
      }
      if (selectedEmployee) {
        params.empid = selectedEmployee;
      }
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/attendance`, {
        params
      });
      const body = res.data;
      setAttendanceData(body.records || body);
      setPayrollFinalized(body._payrollFinalized || false);
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      // Fetch only active employees (default filterType in backend)
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/employees`);
      setEmployeeList(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching employees:", err);
      showToast("Could not load employees — check the server connection", "error");
    }
  };

  const loadBulkRows = async () => {
    setLoading(true);
    setPage(0);
    try {
      let dates = [];
      if (bulkFilterType === "date") {
        dates = [bulkDataDate];
      } else if (bulkFilterType === "range") {
        if (!bulkFromDate || !bulkToDate) {
          showToast("Please select date range", "warning");
          setLoading(false);
          return;
        }
        let curr = new Date(bulkFromDate);
        const end = new Date(bulkToDate);
        while (curr <= end) {
          dates.push(curr.toISOString().split("T")[0]);
          curr.setDate(curr.getDate() + 1);
        }
      } else if (bulkFilterType === "month") {
        const lastDay = new Date(bulkYear, bulkMonth, 0).getDate();
        for (let i = 1; i <= lastDay; i++) {
          dates.push(`${bulkYear}-${String(bulkMonth).padStart(2, "0")}-${String(i).padStart(2, "0")}`);
        }
      }

      const params = {
        startDate: dates[0],
        endDate: dates[dates.length - 1]
      };
      if (bulkEmployeeId) params.empid = bulkEmployeeId;

      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/attendance`, { params });
      const existingData = res.data.records || res.data;
      setPayrollFinalized(res.data._payrollFinalized || false);
      const existingMap = {};
      existingData.forEach(a => {
        existingMap[`${a.empid}_${a.att_date}`] = a;
      });

      let filteredEmployees = employeeList;
      if (bulkDepartmentFilter) {
        filteredEmployees = filteredEmployees.filter(e => (e.deptname || e.department) === bulkDepartmentFilter);
      }
      if (bulkEmployeeId) {
        filteredEmployees = filteredEmployees.filter(e => e.empid == bulkEmployeeId);
      }

      const rows = [];
      dates.forEach(date => {
        filteredEmployees.forEach(emp => {
          const existing = existingMap[`${emp.empid}_${date}`];
          let raw = existing?.status || "";
          if (raw === "Present") raw = "P";
          if (raw === "Absent") raw = "A";
          if (raw === "Weekly Off") raw = "W";
          if (raw === "Holiday") raw = "H";
          let derivedStatus = raw;
          const shiftTmp = existing?.shift || "G";
          // A cancelled weekly off must show as Absent, not slip back to W
          // just because the shift is still tagged W.
          if (existing?.cancel_status === "C") derivedStatus = "A";
          else if (["W","H"].includes(shiftTmp)) derivedStatus = shiftTmp;
          else if (!existing?.in_time || !existing?.out_time) derivedStatus = "A";
          else if (derivedStatus === "P" && (!existing?.in_time || !existing?.out_time)) derivedStatus = "A";
          if (!existing) derivedStatus = ["W","H"].includes(shiftTmp) ? shiftTmp : "A";
          rows.push({
            empid: emp.empid,
            ename: emp.ename,
            department: emp.deptname || emp.department,
            att_date: date,
            shift: existing?.shift || "G",
            status: derivedStatus,
            in_time: existing?.in_time || "",
            out_time: existing?.out_time || "",
            late_hrs: existing?.late_hrs || 0,
            ot_hrs: existing?.ot_hrs || 0,
            hasExisting: !!existing,
            cancel_status: existing?.cancel_status || null,
            cancel_remarks: existing?.cancel_remarks || null,
            dirty: false
          });
        });
      });

      setBulkRows(rows);
    } catch (err) {
      console.error("Error generating bulk rows:", err);
      showToast("Error generating bulk rows", "error");
    } finally {
      setLoading(false);
    }
  };

  const openBulkEntry = async () => {
    bulkDialogRef.current = true;
    // fetchEmployees only runs on mount and swallows its error, so a list that
    // came back empty (backend restarting, expired session) would stay empty and
    // the matrix would silently render zero rows. Retry once before building it.
    if (employeeList.length === 0) await fetchEmployees();
    await loadBulkRows();
    setBulkDialog(true);
  };

  // Bulk filters refresh the matrix automatically while the dialog is open.
  // bulkDialog is read through a ref so opening the dialog never double-fetches.
  useEffect(() => {
    if (!bulkDialogRef.current) return;
    loadBulkRows();
  }, [bulkFilterType, bulkDataDate, bulkFromDate, bulkToDate, bulkMonth, bulkYear, bulkEmployeeId, bulkDepartmentFilter]);

  const closeBulkDialog = () => {
    bulkDialogRef.current = false;
    setBulkDialog(false);
    setBulkRows([]);
    fetchData(true);
  };

  const patchRow = (row, patch) => {
    setBulkRows(prev => prev.map(r =>
      r.empid === row.empid && r.att_date === row.att_date ? { ...r, ...patch } : r
    ));
  };

  const openWoffCancelDialog = (row) => {
    setWoffTarget(row);
    setWoffForm({ reason: "" });
  };

  const closeWoffCancelDialog = () => {
    if (woffSaving) return;
    setWoffTarget(null);
    setWoffForm({ reason: "" });
  };

  const submitWoffCancel = async () => {
    if (!woffTarget) return;
    if (!woffForm.reason.trim()) {
      showToast("Cancel remarks are mandatory", "error");
      return;
    }
    setWoffSaving(true);
    try {
      const { empid, att_date } = woffTarget;
      const _res = await axios.post(`${import.meta.env.VITE_API_URL}/api/attendance/cancel-woff-day`, {
        empid,
        att_date,
        reason: woffForm.reason.trim()
      });
      patchRow(woffTarget, {
        cancel_status: "C",
        cancel_remarks: woffForm.reason.trim(),
        status: "A"
      });
      showToast(`Weekly off for ${empid} on ${att_date} cancelled — day counted Absent`, "success");
      setWoffTarget(null);
      setWoffForm({ reason: "" });
    } catch (err) {
      showToast(getErrorMessage(err, "Error cancelling weekly off"), "error");
    } finally {
      setWoffSaving(false);
    }
  };

  const confirmRevokeWoff = () => {
    if (!revokeTarget) return;
    revokeWoffCancellation(revokeTarget);
    setRevokeTarget(null);
  };

  const revokeWoffCancellation = async (row) => {
    if (row.cancel_status !== "C") return;
    try {
      const { empid, att_date } = row;
      const _res = await axios.post(`${import.meta.env.VITE_API_URL}/api/attendance/revoke-woff-cancel`, { empid, att_date });
      patchRow(row, { cancel_status: null, cancel_remarks: null, status: "W" });
      showToast(`Weekly off restored for ${empid} on ${att_date}`, "success");
    } catch (err) {
      showToast(getErrorMessage(err, "Error revoking cancellation"), "error");
    }
  };

  const openEditDialog = (row) => {
    setEditRow({ ...row });
    setEditDialog(true);
  };

  const saveEdit = async () => {
    try {
      if ((editRow.status === "P" || editRow.status === "Present") && (!editRow.in_time || !editRow.out_time)) {
        showToast("Present (P) requires both In Time and Out Time.", "error");
        return;
      }
      await axios.put(`${import.meta.env.VITE_API_URL}/api/attendance/${editRow.id}`, {
        empid: editRow.empid,
        att_date: editRow.att_date,
        shift: editRow.shift,
        status: editRow.status,
        in_time: editRow.in_time || null,
        out_time: editRow.out_time || null,
        late_hrs: editRow.status === 'A' ? 0 : (editRow.late_hrs || 0),
        ot_hrs: editRow.status === 'A' ? 0 : (editRow.ot_hrs || 0)
      });
      showToast("Attendance updated successfully", "success");
      setEditDialog(false);
      fetchData();
    } catch (err) {
      showToast(getErrorMessage(err, "Error updating attendance"), "error");
    }
  };

  const deriveStatus = (row) => {
    if (["W","H"].includes(row.shift)) return row.shift;
    if (row.in_time && row.out_time) return "P";
    if (!row.in_time && !row.out_time) return "";
    return "A";
  };
  const updateRow = (idx, field, val) => {
    const rows = [...bulkRows];
    rows[idx][field] = val;
    rows[idx].dirty = true;
    if (["in_time","out_time","shift"].includes(field)) {
      const r = rows[idx];
      if (["W","H"].includes(r.shift)) r.status = r.shift;
      else if (r.in_time && r.out_time) r.status = "P";
      else if (!r.in_time && !r.out_time) r.status = "";
      else r.status = "A";
    }
    setBulkRows(rows);
  };
  const markRowAbsent = (idx) => {
    const row = bulkRows[idx];
    if (["W", "H"].includes(row.shift)) {
      showToast(`Shift ${row.shift} cannot be marked Absent`, "warning");
      return;
    }
    const rows = [...bulkRows];
    rows[idx] = { ...row, status: "A", in_time: "", out_time: "", late_hrs: 0, ot_hrs: 0, dirty: true };
    setBulkRows(rows);
  };

  const setAllStatus = (status) => {
    if (status === "P") {
      setBulkRows(prev => prev.map(r => {
        if (["W","H"].includes(r.shift) || ["W","H"].includes(r.status)) return r;
        return { ...r, in_time: r.in_time || DEFAULT_IN_TIME, out_time: r.out_time || DEFAULT_OUT_TIME, status: "P", dirty: true };
      }));
      showToast(`All rows set to Present with default times ${DEFAULT_IN_TIME}-${DEFAULT_OUT_TIME} (W/H skipped)`, "info");
    } else {
      setBulkRows(prev => prev.map(r => (["W","H","Weekly Off","Holiday","W-Off"].includes(r.status) || ["W","H"].includes(r.shift) ? r : { ...r, in_time: "", out_time: "", status: "A", dirty: true })));
      showToast(`All rows set to Absent (times cleared, W/H skipped)`, "info");
    }
  };

  const applyQuickInTime = () => {
    if (!quickInTime) { showToast("Enter In Time first", "warning"); return; }
    setBulkRows(prev => prev.map(r => {
      if (["W","H"].includes(r.shift)) return r;
      const nr = { ...r, in_time: quickInTime, dirty: true };
      nr.status = (nr.in_time && nr.out_time) ? "P" : (!nr.in_time && !nr.out_time ? "" : "A");
      if (["W","H"].includes(nr.shift)) nr.status = nr.shift;
      return nr;
    }));
    showToast(`In Time ${quickInTime} applied (status auto)`, "info");
  };
  const applyQuickOutTime = () => {
    if (!quickOutTime) { showToast("Enter Out Time first", "warning"); return; }
    setBulkRows(prev => prev.map(r => {
      if (["W","H"].includes(r.shift)) return r;
      const nr = { ...r, out_time: quickOutTime, dirty: true };
      nr.status = (nr.in_time && nr.out_time) ? "P" : (!nr.in_time && !nr.out_time ? "" : "A");
      if (["W","H"].includes(nr.shift)) nr.status = nr.shift;
      return nr;
    }));
    showToast(`Out Time ${quickOutTime} applied (status auto)`, "info");
  };

  const saveSingleRow = async (idx) => {
    const r = bulkRows[idx];
    if ((r.status === "P" || r.status === "Present") && (!r.in_time || !r.out_time)) {
      showToast("Present requires In/Out times", "error");
      return;
    }
    setSavingIdx(idx);
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/attendance/save-bulk`, [{
        empid: r.empid, att_date: r.att_date, shift: r.shift, status: r.status,
        in_time: r.in_time || null, out_time: r.out_time || null, late_hrs: r.late_hrs || 0, ot_hrs: r.ot_hrs || 0
      }]);
      showToast(`Saved ${r.empid} ${r.att_date}`, "success");
      setBulkRows(prev => { const c = [...prev]; c[idx] = { ...c[idx], hasExisting: true, dirty: false }; return c; });
      fetchData(true);
    } catch (err) {
      showToast(getErrorMessage(err, "Error saving row"), "error");
    } finally {
      setSavingIdx(null);
    }
  };

  const saveBulk = async () => {
    setSaving(true);
    try {
      const list = bulkRows
        .filter(r => r.dirty)
        .map(r => ({
          empid: r.empid,
          att_date: r.att_date,
          shift: r.shift,
          status: r.status,
          in_time: r.in_time || null,
          out_time: r.out_time || null,
          late_hrs: r.late_hrs || 0,
          ot_hrs: r.ot_hrs || 0
        }));

      if (list.length === 0) {
        showToast("No changes to save", "info");
        setSaving(false);
        return;
      }

      const invalid = list.filter(r => (r.status === "P" || r.status === "Present") && (!r.in_time || !r.out_time));
      if (invalid.length > 0) {
        showToast("Present (P) requires both In Time and Out Time. Enter punches for all Present rows.", "error");
        setSaving(false);
        return;
      }

      await axios.post(`${import.meta.env.VITE_API_URL}/api/attendance/save-bulk`, list);
      showToast(`${list.length} records saved successfully`, "success");

      // Dialog stays open and the rows are marked clean, so a second Save All
      // cannot re-write anything until the user edits a row again.
      const savedKeys = new Set(list.map(r => `${r.empid}_${r.att_date}`));
      setBulkRows(prev => prev.map(r =>
        savedKeys.has(`${r.empid}_${r.att_date}`) ? { ...r, hasExisting: true, dirty: false } : r
      ));
      fetchData(true);
    } catch (err) {
      showToast(getErrorMessage(err, "Error saving attendance"), "error");
    } finally {
      setSaving(false);
    }
  };

  const deleteRecord = async (id) => {
    if (!window.confirm("Delete this record?")) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/attendance/${id}`);
      showToast("Deleted", "success");
      fetchData();
    } catch (err) {
      showToast(getErrorMessage(err, "Error deleting record"), "error");
    }
  };

  const applyMainFilter = () => {
    if (filterType === "range" && (!fromDate || !toDate)) {
      showToast("Please select both From Date and To Date", "warning");
      return;
    }
    setMainFiltersDirty(false);
    fetchData();
  };

  const clearFilters = () => {
    setSelectedEmployee("");
    setDataDate(new Date().toISOString().split("T")[0]);
    setFromDate("");
    setToDate("");
    setMonth(new Date().getMonth() + 1);
    setYear(new Date().getFullYear());
    setMainFiltersDirty(false);
  };

  const getEffectiveStatus = (row) => {
    const s = row.status || '';
    const shift = row.shift || '';
    if (["W","H"].includes(shift) || ["W","H"].includes(s)) return shift || s;
    if (!row.in_time || !row.out_time) return 'A';
    if (s === 'P' || s === 'Present') return 'P';
    return s || 'A';
  };

  const getStatusColor = (status) => {
    const colors = {
      P: "success",
      A: "error",
      W: "warning",
      H: "info",
      L: "secondary",
      Present: "success",
      Absent: "error",
      "Weekly Off": "warning",
      Holiday: "info",
      Leave: "secondary"
    };
    return colors[status] || "default";
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);
  const months = [
    { value: 1, label: "January" },
    { value: 2, label: "February" },
    { value: 3, label: "March" },
    { value: 4, label: "April" },
    { value: 5, label: "May" },
    { value: 6, label: "June" },
    { value: 7, label: "July" },
    { value: 8, label: "August" },
    { value: 9, label: "September" },
    { value: 10, label: "October" },
    { value: 11, label: "November" },
    { value: 12, label: "December" }
  ];

  return (
    <Card sx={{ m: 2, p: 2 }}>
      <Box sx={{ mb: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="h5" sx={{ fontWeight: "bold", color: "var(--heading-color)", borderLeft: "4px solid", borderColor: "primary.main", pl: 1.5, lineHeight: 1.2 }}>HR Attendance</Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            variant={filterType === "date" ? "contained" : "outlined"}
            color={filterType === "date" ? "secondary" : "inherit"}
            size="small"
            onClick={() => { setFilterType("date"); markMainFiltersDirty(); }}
            startIcon={<CalendarMonthIcon />}
          >
            Date
          </Button>
          <Button
            variant={filterType === "range" ? "contained" : "outlined"}
            color={filterType === "range" ? "secondary" : "inherit"}
            size="small"
            onClick={() => { setFilterType("range"); markMainFiltersDirty(); }}
            startIcon={<FilterListIcon />}
          >
            Range
          </Button>
          <Button
            variant={filterType === "month" ? "contained" : "outlined"}
            color={filterType === "month" ? "secondary" : "inherit"}
            size="small"
            onClick={() => { setFilterType("month"); markMainFiltersDirty(); }}
          >
            Month
          </Button>
          <Button variant="contained" color="secondary" startIcon={<AddIcon />} onClick={openBulkEntry} sx={{ ml: 2 }}>
            Bulk Entry
          </Button>
        </Box>
      </Box>

      <CardContent>
        <Box sx={{ mb: 3, p: 2, bgcolor: "#f8f9fa", borderRadius: 1, display: "flex", flexWrap: "wrap", gap: 2, alignItems: "center" }}>
          <FormControl size="small" sx={{ width: 150, flex: "0 0 auto" }}>
            <InputLabel>Filter Type</InputLabel>
            <Select
              fullWidth
              value={filterType}
              label="Filter Type"
              onChange={(e) => setFilterType(e.target.value)}
            >
              <MenuItem value="date">Single Date</MenuItem>
              <MenuItem value="range">Date Range</MenuItem>
              <MenuItem value="month">Month/Year</MenuItem>
            </Select>
          </FormControl>

          {filterType === "date" && (
            <TextField
              size="small"
              type="date"
              label="Select Date"
              InputLabelProps={{ shrink: true }}
              value={dataDate}
              onChange={(e) => { setDataDate(e.target.value); markMainFiltersDirty(); }}
              sx={{ width: 170, flex: "0 0 auto" }}
            />
          )}

          {filterType === "range" && (
            <>
              <TextField
                size="small"
                type="date"
                label="From Date"
                InputLabelProps={{ shrink: true }}
                value={fromDate}
                onChange={(e) => { setFromDate(e.target.value); markMainFiltersDirty(); }}
                sx={{ width: 170, flex: "0 0 auto" }}
              />
              <TextField
                size="small"
                type="date"
                label="To Date"
                InputLabelProps={{ shrink: true }}
                value={toDate}
                onChange={(e) => { setToDate(e.target.value); markMainFiltersDirty(); }}
                sx={{ width: 170, flex: "0 0 auto" }}
              />
            </>
          )}

          {filterType === "month" && (
            <>
              <FormControl size="small" sx={{ width: 150, flex: "0 0 auto" }}>
                <InputLabel>Month</InputLabel>
                <Select
                  fullWidth
                  value={month}
                  label="Month"
                  onChange={(e) => setMonth(e.target.value)}
                >
                  {months.map((m) => (
                    <MenuItem key={m.value} value={m.value}>{m.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ width: 120, flex: "0 0 auto" }}>
                <InputLabel>Year</InputLabel>
                <Select
                  fullWidth
                  value={year}
                  label="Year"
                  onChange={(e) => setYear(e.target.value)}
                >
                  {years.map((y) => (
                    <MenuItem key={y} value={y}>{y}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </>
          )}

          <FormControl size="small" sx={{ flex: "1 1 240px", minWidth: 240 }}>
            <InputLabel>Employee</InputLabel>
            <Select
              fullWidth
              value={selectedEmployee}
              label="Employee"
              onChange={(e) => setSelectedEmployee(e.target.value)}
            >
              <MenuItem value="">All Employees</MenuItem>
              {employeeList.map((emp) => (
                <MenuItem key={emp.empid} value={emp.empid}>
                  {emp.empid} - {emp.ename}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button
            variant={mainFiltersDirty ? "contained" : "outlined"}
            color="primary"
            size="small"
            startIcon={<FilterListIcon />}
            onClick={applyMainFilter}
            disabled={loading}
            sx={{ flex: "0 0 auto", minWidth: 130 }}
          >
            {mainFiltersDirty ? "Apply Filter" : "Refresh"}
          </Button>

          <Button
            variant="outlined"
            size="small"
            startIcon={<ClearIcon />}
            onClick={clearFilters}
            sx={{ flex: "0 0 auto", minWidth: 100 }}
          >
            Clear
          </Button>
        </Box>

        {payrollFinalized && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            Salary for this month is already finalized. Attendance records are locked and cannot be edited or deleted.
          </Alert>
        )}

        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
          <Typography variant="subtitle1" fontWeight="bold">
            Records: {filteredAttendanceData.length}
          </Typography>
          {selectedEmployee && (
            <Typography variant="body2" color="text.secondary">
              Showing attendance for: {employeeList.find(e => e.empid == selectedEmployee)?.ename || selectedEmployee}
            </Typography>
          )}
        </Box>

        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: "rgba(25, 118, 210, 0.08)", color: "primary.dark" }}>
              <TableCell sx={{ color: "primary.dark", fontWeight: "bold" }}>Date</TableCell>
              <TableCell sx={{ color: "primary.dark", fontWeight: "bold" }}>Emp ID</TableCell>
              <TableCell sx={{ color: "primary.dark", fontWeight: "bold" }}>Name</TableCell>
              <TableCell sx={{ color: "primary.dark", fontWeight: "bold" }}>Shift</TableCell>
              <TableCell sx={{ color: "primary.dark", fontWeight: "bold" }}>Status</TableCell>
              <TableCell sx={{ color: "primary.dark", fontWeight: "bold" }}>In Time</TableCell>
              <TableCell sx={{ color: "primary.dark", fontWeight: "bold" }}>Out Time</TableCell>
              <TableCell sx={{ color: "primary.dark", fontWeight: "bold" }}>Late Hrs</TableCell>
              <TableCell sx={{ color: "primary.dark", fontWeight: "bold" }}>OT Hrs</TableCell>
              <TableCell sx={{ color: "primary.dark", fontWeight: "bold" }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={10} align="center" sx={{ py: 3 }}>
                  Loading...
                </TableCell>
              </TableRow>
            ) : attendanceData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} align="center" sx={{ py: 3, color: "#777" }}>
                  No attendance records found
                </TableCell>
              </TableRow>
            ) : (
              filteredAttendanceData.map((row) => (
                <TableRow key={row.id} sx={{ "&:nth-of-type(odd)": { bgcolor: "#fafafa" } }}>
                  <TableCell>{row.att_date}</TableCell>
                  <TableCell>{row.empid}</TableCell>
                  <TableCell>{row.employee?.ename || "-"}</TableCell>
                  <TableCell>
                    <Chip size="small" label={row.shift} variant="outlined" />
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={getEffectiveStatus(row)}
                      color={getStatusColor(getEffectiveStatus(row))}
                      title={
                        (row.status === 'P' || row.status === 'Present') && (!row.in_time || !row.out_time)
                          ? "Stored as P but missing proper in/out times — displayed as Absent"
                          : undefined
                      }
                    />
                  </TableCell>
                  <TableCell sx={{ fontFamily: "monospace" }}>{row.in_time || "-"}</TableCell>
                  <TableCell sx={{ fontFamily: "monospace" }}>{row.out_time || "-"}</TableCell>
                   <TableCell>
                     {row.late_hrs > 0 && getEffectiveStatus(row) !== 'A' ? (
                       <Chip
                         size="small"
                         label={row.late_hrs < 1
                          ? `${Math.round(row.late_hrs * 100)} mins`
                          : parseFloat(row.late_hrs).toFixed(2)
                        }
                         color={row.late_exempt ? "success" : "warning"}
                         variant={row.late_exempt ? "outlined" : "filled"}
                       />
                     ) : '-'}
                  </TableCell>
                   <TableCell sx={{ fontFamily: "monospace" }}>
                     {row.ot_hrs > 0 && getEffectiveStatus(row) !== 'A' ? parseFloat(row.ot_hrs).toFixed(2) : '-'}
                   </TableCell>
                  <TableCell>
                    <IconButton size="small" color="primary" onClick={() => openEditDialog(row)} disabled={payrollFinalized}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => deleteRecord(row.id)} disabled={payrollFinalized}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>

      <Dialog open={bulkDialog} onClose={closeBulkDialog} maxWidth="lg" fullWidth>
        <DialogTitle sx={{ bgcolor: "primary.main", color: "primary.contrastText", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>Bulk Attendance Entry</span>
          {bulkRows.length > 0 && (
            <Chip label={`${bulkRows.length} rows`} size="small" sx={{ bgcolor: "rgba(255,255,255,0.2)", color: "white", fontWeight: "bold" }} />
          )}
        </DialogTitle>
        <DialogContent sx={{ p: 2, overflow: "hidden", display: "flex", flexDirection: "column" }}>
          <Box sx={{ mb: 2, p: 2, bgcolor: "#f8f9fa", borderRadius: 1, display: "flex", flexWrap: "wrap", gap: 2, alignItems: "center" }}>
            <FormControl size="small" sx={{ width: 150, flex: "0 0 auto" }}>
              <InputLabel>Filter Type</InputLabel>
              <Select
                value={bulkFilterType}
                label="Filter Type"
                onChange={(e) => setBulkFilterType(e.target.value)}
                disabled={loading}
              >
                <MenuItem value="date">Single Date</MenuItem>
                <MenuItem value="range">Date Range</MenuItem>
                <MenuItem value="month">Month/Year</MenuItem>
              </Select>
            </FormControl>

            {bulkFilterType === "date" && (
              <TextField
                size="small"
                type="date"
                label="Select Date"
                InputLabelProps={{ shrink: true }}
                value={bulkDataDate}
                onChange={(e) => setBulkDataDate(e.target.value)}
                disabled={loading}
              />
            )}

            {bulkFilterType === "range" && (
              <>
                <TextField
                  size="small"
                  type="date"
                  label="From"
                  InputLabelProps={{ shrink: true }}
                  value={bulkFromDate}
                  onChange={(e) => setBulkFromDate(e.target.value)}
                  disabled={loading}
                />
                <TextField
                  size="small"
                  type="date"
                  label="To"
                  InputLabelProps={{ shrink: true }}
                  value={bulkToDate}
                  onChange={(e) => setBulkToDate(e.target.value)}
                  disabled={loading}
                />
              </>
            )}

            {bulkFilterType === "month" && (
              <>
<FormControl size="small" sx={{ width: 150, flex: "0 0 auto" }}>
                <InputLabel>Month</InputLabel>
                  <Select
                    value={bulkMonth}
                    label="Month"
                    onChange={(e) => setBulkMonth(e.target.value)}
                    disabled={loading}
                  >
                    {months.map((m) => (
                      <MenuItem key={m.value} value={m.value}>{m.label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
<FormControl size="small" sx={{ width: 120, flex: "0 0 auto" }}>
                <InputLabel>Year</InputLabel>
                  <Select
                    value={bulkYear}
                    label="Year"
                    onChange={(e) => setBulkYear(e.target.value)}
                    disabled={loading}
                  >
                    {years.map((y) => (
                      <MenuItem key={y} value={y}>{y}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </>
            )}

            <FormControl size="small" sx={{ flex: "1 1 240px", minWidth: 240 }}>
              <InputLabel>Employee</InputLabel>
              <Select
                fullWidth
                value={bulkEmployeeId}
                label="Employee"
                onChange={(e) => setBulkEmployeeId(e.target.value)}
                disabled={loading}
              >
                <MenuItem value="">All Employees</MenuItem>
                {employeeList.map((emp) => (
                  <MenuItem key={emp.empid} value={emp.empid}>
                    {emp.empid} - {emp.ename}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ flex: "1 1 240px", minWidth: 240 }}>
              <InputLabel>Department</InputLabel>
              <Select
                fullWidth
                value={bulkDepartmentFilter}
                label="Department"
                onChange={(e) => setBulkDepartmentFilter(e.target.value)}
                disabled={loading}
              >
                <MenuItem value="">All Departments</MenuItem>
                {[...new Set(employeeList.map(e => e.deptname || e.department).filter(Boolean))].map(dept => (
                  <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <Button
              variant="contained"
              size="small"
              startIcon={<FilterListIcon />}
              onClick={openBulkEntry}
              disabled={loading}
            >
              {loading ? "Applying..." : "Apply Filter"}
            </Button>
          </Box>

          {/* Quick Actions Toolbar */}
          {!loading && bulkRows.length > 0 && (
            <Box sx={{ mb: 2, p: 1.5, bgcolor: "#e3f2fd", borderRadius: 1, display: "flex", flexWrap: "wrap", gap: 1.5, alignItems: "center" }}>
              <Typography variant="caption" sx={{ fontWeight: "bold", color: "var(--primary-dark, #1565c0)", mr: 1 }}>⚡ Quick Actions:</Typography>
              <Button size="small" variant="outlined" color="success" startIcon={<CheckCircleIcon />} onClick={() => setAllStatus("P")}>
                All Present
              </Button>
              <Button size="small" variant="outlined" color="error" onClick={() => setAllStatus("A")}>
                All Absent
              </Button>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, ml: 1, borderLeft: "1px solid #90caf9", pl: 1.5 }}>
                <AccessTimeIcon fontSize="small" color="primary" />
                <TextField size="small" type="time" label="In Time" InputLabelProps={{ shrink: true }} value={quickInTime} onChange={(e) => setQuickInTime(e.target.value)} sx={{ width: 130 }} />
                <Button size="small" variant="contained" color="primary" onClick={applyQuickInTime} disabled={!quickInTime}>
                  Apply
                </Button>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, borderLeft: "1px solid #90caf9", pl: 1.5 }}>
                <AccessTimeIcon fontSize="small" color="primary" />
                <TextField size="small" type="time" label="Out Time" InputLabelProps={{ shrink: true }} value={quickOutTime} onChange={(e) => setQuickOutTime(e.target.value)} sx={{ width: 130 }} />
                <Button size="small" variant="contained" color="primary" onClick={applyQuickOutTime} disabled={!quickOutTime}>
                  Apply
                </Button>
              </Box>
            </Box>
          )}

          <Box sx={{ maxHeight: "60vh", overflowY: "auto", overflowX: "auto", flex: 1, minHeight: 0 }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow sx={{ bgcolor: "#f5f5f5" }}>
                  <TableCell><strong>Date</strong></TableCell>
                  <TableCell><strong>Emp ID</strong></TableCell>
                  <TableCell><strong>Name</strong></TableCell>
                  <TableCell><strong>Shift</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                  <TableCell><strong>In Time</strong></TableCell>
                  <TableCell><strong>Out Time</strong></TableCell>
                  <TableCell align="center"><strong>Mark Absent / Cancel Woff</strong></TableCell>
                  <TableCell><strong>Save</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center" sx={{ py: 6 }}>
                      <CircularProgress size={40} sx={{ mb: 2 }} />
                      <Typography variant="body1" color="text.secondary">
                        Loading bulk data, please wait...
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : bulkRows.length === 0 ? (
                  <TableRow>
<TableCell colSpan={9} align="center" sx={{ py: 3, color: "#777" }}>
                      No matching records found.
                    </TableCell>
                  </TableRow>
                ) : (
                  bulkRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, localIdx) => {
                    const globalIdx = page * rowsPerPage + localIdx;
                    return (
                      <TableRow key={globalIdx} sx={{ bgcolor: row.dirty ? "#fff8e1" : row.hasExisting ? "#e8f5e9" : "#fff" }}>
                        <TableCell>{row.att_date}</TableCell>
                        <TableCell>{row.empid}</TableCell>
                        <TableCell>{row.ename}</TableCell>
                        <TableCell>
                          <Select size="small" value={row.shift} onChange={(e) => updateRow(globalIdx, "shift", e.target.value)} sx={{ width: 130 }}>
                            <MenuItem value="G">G (General)</MenuItem>
                            <MenuItem value="A">A (Morning)</MenuItem>
                            <MenuItem value="B">B (Afternoon)</MenuItem>
                            <MenuItem value="W">W (Weekly Off)</MenuItem>
                            <MenuItem value="H">H (Holiday)</MenuItem>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Chip size="small" label={row.status || '-'} color={row.status==='P' ? 'success' : row.status==='A' ? 'error' : row.status==='W' ? 'default' : row.status==='H' ? 'warning' : 'default'} sx={{ minWidth: 32, fontWeight: 700 }} />
                        </TableCell>
                        <TableCell>
                          <TextField size="small" type="time" value={row.in_time} onChange={(e) => updateRow(globalIdx, "in_time", e.target.value)} />
                        </TableCell>
                        <TableCell>
                          <TextField size="small" type="time" value={row.out_time} onChange={(e) => updateRow(globalIdx, "out_time", e.target.value)} />
                        </TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0.5 }}>
                            <Tooltip title={["W", "H"].includes(row.shift) ? `Shift ${row.shift} cannot be marked Absent` : "Mark Absent (clears In/Out times)"}>
                              <span>
                                <IconButton
                                  size="small"
                                  color="error"
                                  disabled={row.status === "A" || ["W", "H"].includes(row.shift)}
                                  onClick={() => markRowAbsent(globalIdx)}
                                >
                                  <PersonOffIcon fontSize="small" />
                                </IconButton>
                              </span>
                            </Tooltip>
                            {isWeeklyOffRow(row) && (
                              <Tooltip
                                title={
                                  row.cancel_status === "C"
                                    ? `Weekly off cancelled: ${row.cancel_remarks || "-"} — click to restore`
                                    : payrollFinalized
                                      ? "Payslip is finalized for this month"
                                      : "Cancel this weekly off (day counts Absent)"
                                }
                              >
                                <span>
                                  <IconButton
                                    size="small"
                                    color={row.cancel_status === "C" ? "success" : "warning"}
                                    disabled={payrollFinalized && row.cancel_status !== "C"}
                                    onClick={() => row.cancel_status === "C" ? setRevokeTarget(row) : openWoffCancelDialog(row)}
                                  >
                                    <BlockIcon fontSize="small" />
                                  </IconButton>
                                </span>
                              </Tooltip>
                            )}
</Box>
                        </TableCell>
                        <TableCell>
                          <IconButton size="small" color="success" onClick={() => saveSingleRow(globalIdx)} disabled={savingIdx===globalIdx}>
                            {savingIdx===globalIdx ? <CircularProgress size={16} /> : <SaveIcon fontSize="small" />}
                          </IconButton>
                        </TableCell>
                        <TableCell>
                          <IconButton size="small" color="success" onClick={() => saveSingleRow(globalIdx)} disabled={savingIdx===globalIdx}>
                            {savingIdx===globalIdx ? <CircularProgress size={16} /> : <SaveIcon fontSize="small" />}
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </Box>

          {!loading && bulkRows.length > 0 && (
            <TablePagination
              component="div"
              count={bulkRows.length}
              page={page}
              onPageChange={(e, newPage) => setPage(newPage)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
              rowsPerPageOptions={[25, 50, 100, 200]}
            />
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, justifyContent: "space-between" }}>
          <Typography variant="body2" color="text.secondary">
            {bulkRows.length > 0 ? `${bulkRows.filter(r => (r.status === "P" || r.status === "Present") && r.in_time && r.out_time).length} Present, ${bulkRows.filter(r => r.status === "A" || ((r.status === "P" || r.status === "Present") && (!r.in_time || !r.out_time))).length} Absent, ${bulkRows.filter(r => ["W", "H", "L"].includes(r.status)).length} Other` : ""}
          </Typography>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button onClick={closeBulkDialog} disabled={loading || saving}>Cancel</Button>
            <Button variant="contained" startIcon={saving ? <CircularProgress size={18} color="inherit" /> : <SaveIcon />} onClick={saveBulk} disabled={loading || saving || dirtyCount === 0}>
              {saving ? `Saving...` : dirtyCount > 0 ? `Save All (${dirtyCount})` : "Save All"}
            </Button>
          </Box>
        </DialogActions>
      </Dialog>

      <Dialog open={!!woffTarget} onClose={closeWoffCancelDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: "warning.main", color: "warning.contrastText" }}>
          Cancel Weekly Off
        </DialogTitle>
        <DialogContent sx={{ p: 2 }}>
          {woffTarget && (
            <>
              <Alert severity="warning" sx={{ mb: 2 }}>
                The weekly off granted on {woffTarget.att_date} will no longer be honoured.
                That day is counted as <strong>Absent</strong> regardless of punches,
                leave or on-duty.
              </Alert>
              <Typography variant="subtitle2" sx={{ mb: 2 }}>
                {woffTarget.empid} - {woffTarget.ename}
              </Typography>
              <TextField
                fullWidth
                multiline
                minRows={3}
                required
                label="Cancel Remarks *"
                placeholder="e.g. Worked without authorisation on weekly off"
                value={woffForm.reason}
                error={woffForm.reason.length > 0 && !woffForm.reason.trim()}
                helperText="Remarks are mandatory and are stored as cancel_remarks on the Woff record."
                onChange={(e) => setWoffForm({ reason: e.target.value })}
              />
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 2, pb: 2 }}>
          <Button onClick={closeWoffCancelDialog} disabled={woffSaving}>Cancel</Button>
          <Button
            variant="contained"
            color="warning"
            startIcon={woffSaving ? <CircularProgress size={16} color="inherit" /> : <BlockIcon />}
            onClick={submitWoffCancel}
            disabled={woffSaving || !woffForm.reason.trim()}
          >
            {woffSaving ? "Saving..." : "Cancel Woff"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!revokeTarget} onClose={() => setRevokeTarget(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ bgcolor: "success.main", color: "success.contrastText" }}>
          Restore Weekly Off
        </DialogTitle>
        <DialogContent sx={{ p: 2 }}>
          <Alert severity="warning" sx={{ mb: 2 }}>
            This revokes the cancellation and puts the weekly off back.
          </Alert>
          <Typography variant="body2" color="text.secondary">
            Employee: <strong>{revokeTarget?.empid} - {revokeTarget?.ename}</strong>
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Date: <strong>{revokeTarget?.att_date}</strong>
          </Typography>
          {revokeTarget?.cancel_remarks && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Cancelled because: <em>{revokeTarget.cancel_remarks}</em>
            </Typography>
          )}
          <Typography variant="body2" sx={{ mt: 2 }}>
            The day will count as a weekly off again instead of Absent. Continue?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 2, pb: 2 }}>
          <Button onClick={() => setRevokeTarget(null)}>Keep Cancelled</Button>
          <Button variant="contained" color="success" startIcon={<RefreshIcon />} onClick={confirmRevokeWoff}>
            Revoke Cancellation
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={editDialog} onClose={() => setEditDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: "primary.main", color: "primary.contrastText" }}>
          Edit Attendance
        </DialogTitle>
        <DialogContent sx={{ p: 2 }}>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="text.secondary">
                Employee: {editRow?.employee?.ename || editRow?.empid}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Date: {editRow?.att_date}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Shift</InputLabel>
                <Select
                  value={editRow?.shift || "G"}
                  label="Shift"
                  onChange={(e) => setEditRow({ ...editRow, shift: e.target.value })}
                >
                  <MenuItem value="G">G (General)</MenuItem>
                  <MenuItem value="A">A (Morning)</MenuItem>
                  <MenuItem value="B">B (Afternoon)</MenuItem>
                  <MenuItem value="W">W (Weekly Off)</MenuItem>
                  <MenuItem value="H">H (Holiday)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  value={editRow?.status || "P"}
                  label="Status"
           onChange={(e) => setEditRow({ ...editRow, status: e.target.value, ...(e.target.value === 'A' ? { in_time: "", out_time: "", late_hrs: 0, ot_hrs: 0 } : {}) })}
                 >
                  <MenuItem value="P">Present</MenuItem>
                  <MenuItem value="A">Absent</MenuItem>
                  <MenuItem value="W">Weekly Off</MenuItem>
                  <MenuItem value="H">Holiday</MenuItem>
                  <MenuItem value="L">Leave</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                type="time"
                label="In Time"
                InputLabelProps={{ shrink: true }}
                value={editRow?.in_time || ""}
                onChange={(e) => setEditRow({ ...editRow, in_time: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                type="time"
                label="Out Time"
                InputLabelProps={{ shrink: true }}
                value={editRow?.out_time || ""}
                onChange={(e) => setEditRow({ ...editRow, out_time: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                type="number"
                label="Late Hours"
                value={editRow?.late_hrs || 0}
                onChange={(e) => setEditRow({ ...editRow, late_hrs: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                type="number"
                label="OT Hours"
                value={editRow?.ot_hrs || 0}
                onChange={(e) => setEditRow({ ...editRow, ot_hrs: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setEditDialog(false)}>Cancel</Button>
          <Button variant="contained" startIcon={<SaveIcon />} onClick={saveEdit}>
            Update
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default HRAttendance;
