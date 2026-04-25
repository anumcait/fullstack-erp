import React, { useState, useEffect } from "react";
import {
  Box, Card, CardContent, Typography, Grid, TextField, Select, MenuItem,
  Button, Table, TableHead, TableBody, TableRow, TableCell,
  IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Chip,
  FormControl, InputLabel
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import FilterListIcon from "@mui/icons-material/FilterList";
import ClearIcon from "@mui/icons-material/Clear";
import RefreshIcon from "@mui/icons-material/Refresh";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import axios from "axios";
import { useToast } from "../../../context/ToastContext";

const HRAttendance = () => {
  const { showToast } = useToast();

  const [filterType, setFilterType] = useState("date");
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
  const [bulkFilterType, setBulkFilterType] = useState("date");
  const [bulkDataDate, setBulkDataDate] = useState(new Date().toISOString().split("T")[0]);
  const [bulkFromDate, setBulkFromDate] = useState("");
  const [bulkToDate, setBulkToDate] = useState("");
  const [bulkMonth, setBulkMonth] = useState(new Date().getMonth() + 1);
  const [bulkYear, setBulkYear] = useState(new Date().getFullYear());
  const [bulkEmployeeFilter, setBulkEmployeeFilter] = useState("");
  const [bulkDepartmentFilter, setBulkDepartmentFilter] = useState("");
  const [bulkEmployeeId, setBulkEmployeeId] = useState("");

  useEffect(() => {
    fetchEmployees();
  }, []);

  const filteredAttendanceData = attendanceData.filter(row => row.status !== 'W' && row.status !== 'H');

  useEffect(() => {
    fetchData();
  }, [filterType, selectedEmployee, dataDate, fromDate, toDate, month, year]);

  const fetchData = async () => {
    setLoading(true);
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
      setAttendanceData(res.data);
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/employees`);
      setEmployeeList(res.data);
    } catch (err) {
      console.error("Error:", err);
    }
  };

  const openBulkEntry = async () => {
    setLoading(true);
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
      const existingData = res.data;
      const existingMap = {};
      existingData.forEach(a => {
        existingMap[`${a.empid}_${a.att_date}`] = a;
      });

      let filteredEmployees = employeeList;
      if (bulkEmployeeFilter) {
        filteredEmployees = filteredEmployees.filter(e => 
          String(e.empid).includes(bulkEmployeeFilter) || 
          e.ename.toLowerCase().includes(bulkEmployeeFilter.toLowerCase())
        );
      }
      if (bulkDepartmentFilter) {
        filteredEmployees = filteredEmployees.filter(e => e.department === bulkDepartmentFilter);
      }
      if (bulkEmployeeId) {
        filteredEmployees = filteredEmployees.filter(e => e.empid == bulkEmployeeId);
      }

      const rows = [];
      dates.forEach(date => {
        filteredEmployees.forEach(emp => {
          const existing = existingMap[`${emp.empid}_${date}`];
          rows.push({
            empid: emp.empid,
            ename: emp.ename,
            department: emp.department,
            att_date: date,
            shift: existing?.shift || "G",
            status: existing?.status || "P",
            in_time: existing?.in_time || "",
            out_time: existing?.out_time || "",
            late_hrs: existing?.late_hrs || 0,
            ot_hrs: existing?.ot_hrs || 0,
            hasExisting: !!existing
          });
        });
      });

      setBulkRows(rows);
      setBulkDialog(true);
    } catch (err) {
      console.error("Error generating bulk rows:", err);
      showToast("Error generating bulk rows", "error");
    } finally {
      setLoading(false);
    }
  };

  const openEditDialog = (row) => {
    setEditRow({ ...row });
    setEditDialog(true);
  };

  const saveEdit = async () => {
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/api/attendance/${editRow.id}`, {
        empid: editRow.empid,
        att_date: editRow.att_date,
        shift: editRow.shift,
        status: editRow.status,
        in_time: editRow.in_time || null,
        out_time: editRow.out_time || null,
        late_hrs: editRow.late_hrs || 0,
        ot_hrs: editRow.ot_hrs || 0
      });
      showToast("Attendance updated successfully", "success");
      setEditDialog(false);
      fetchData();
    } catch (err) {
      showToast("Error updating attendance", "error");
    }
  };

  const updateRow = (idx, field, val) => {
    const rows = [...bulkRows];
    rows[idx][field] = val;
    setBulkRows(rows);
  };

  const saveBulk = async () => {
    try {
      const list = bulkRows.map(r => ({
        empid: r.empid,
        att_date: r.att_date,
        shift: r.shift,
        status: r.status,
        in_time: r.in_time || null,
        out_time: r.out_time || null,
        late_hrs: r.late_hrs || 0,
        ot_hrs: r.ot_hrs || 0
      }));

      await axios.post(`${import.meta.env.VITE_API_URL}/api/attendance/save-bulk`, list);
      showToast("Attendance saved successfully", "success");
      setBulkDialog(false);
      fetchData();
    } catch (err) {
      showToast("Error saving attendance", "error");
    }
  };

  const deleteRecord = async (id) => {
    if (!window.confirm("Delete this record?")) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/attendance/${id}`);
      showToast("Deleted", "success");
      fetchData();
    } catch (err) {
      showToast("Error deleting", "error");
    }
  };

  const clearFilters = () => {
    setSelectedEmployee("");
    setDataDate(new Date().toISOString().split("T")[0]);
    setFromDate("");
    setToDate("");
    setMonth(new Date().getMonth() + 1);
    setYear(new Date().getFullYear());
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
    <Card sx={{ m: 2 }}>
      <Box sx={{ bgcolor: "#1976d2", color: "white", p: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="h6">HR Attendance</Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button 
            variant={filterType === "date" ? "contained" : "outlined"} 
            color={filterType === "date" ? "secondary" : "inherit"}
            size="small"
            onClick={() => setFilterType("date")}
            startIcon={<CalendarMonthIcon />}
          >
            Date
          </Button>
          <Button 
            variant={filterType === "range" ? "contained" : "outlined"}
            color={filterType === "range" ? "secondary" : "inherit"}
            size="small"
            onClick={() => setFilterType("range")}
            startIcon={<FilterListIcon />}
          >
            Range
          </Button>
          <Button 
            variant={filterType === "month" ? "contained" : "outlined"}
            color={filterType === "month" ? "secondary" : "inherit"}
            size="small"
            onClick={() => setFilterType("month")}
          >
            Month
          </Button>
          <Button variant="contained" color="secondary" startIcon={<AddIcon />} onClick={openBulkEntry} sx={{ ml: 2 }}>
            Bulk Entry
          </Button>
        </Box>
      </Box>

      <CardContent>
        <Box sx={{ mb: 3, p: 2, bgcolor: "#f8f9fa", borderRadius: 1 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Filter Type</InputLabel>
                <Select
                  value={filterType}
                  label="Filter Type"
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <MenuItem value="date">Single Date</MenuItem>
                  <MenuItem value="range">Date Range</MenuItem>
                  <MenuItem value="month">Month/Year</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {filterType === "date" && (
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  size="small"
                  type="date"
                  label="Select Date"
                  InputLabelProps={{ shrink: true }}
                  value={dataDate}
                  onChange={(e) => setDataDate(e.target.value)}
                />
              </Grid>
            )}

            {filterType === "range" && (
              <>
                <Grid item xs={12} md={2}>
                  <TextField
                    fullWidth
                    size="small"
                    type="date"
                    label="From Date"
                    InputLabelProps={{ shrink: true }}
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} md={2}>
                  <TextField
                    fullWidth
                    size="small"
                    type="date"
                    label="To Date"
                    InputLabelProps={{ shrink: true }}
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                  />
                </Grid>
              </>
            )}

            {filterType === "month" && (
              <>
                <Grid item xs={12} md={2}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Month</InputLabel>
                    <Select
                      value={month}
                      label="Month"
                      onChange={(e) => setMonth(e.target.value)}
                    >
                      {months.map((m) => (
                        <MenuItem key={m.value} value={m.value}>{m.label}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={2}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Year</InputLabel>
                    <Select
                      value={year}
                      label="Year"
                      onChange={(e) => setYear(e.target.value)}
                    >
                      {years.map((y) => (
                        <MenuItem key={y} value={y}>{y}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </>
            )}

            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Employee</InputLabel>
                <Select
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
            </Grid>

            <Grid item xs={12} md={1}>
              <Button variant="outlined" fullWidth size="small" startIcon={<RefreshIcon />} onClick={fetchData}>
                Refresh
              </Button>
            </Grid>

            <Grid item xs={12} md={1}>
              <Button variant="outlined" fullWidth size="small" startIcon={<ClearIcon />} onClick={clearFilters}>
                Clear
              </Button>
            </Grid>
          </Grid>
        </Box>

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
            <TableRow sx={{ bgcolor: "#1976d2", color: "white" }}>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>Date</TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>Emp ID</TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>Name</TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>Shift</TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>Status</TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>In Time</TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>Out Time</TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>Late Hrs</TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>OT Hrs</TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>Actions</TableCell>
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
                      label={row.status} 
                      color={getStatusColor(row.status)} 
                    />
                  </TableCell>
                  <TableCell sx={{ fontFamily: "monospace" }}>{row.in_time || "-"}</TableCell>
                  <TableCell sx={{ fontFamily: "monospace" }}>{row.out_time || "-"}</TableCell>
                  <TableCell>
                    {row.late_hrs > 0 ? (
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
                    {row.ot_hrs > 0 ? parseFloat(row.ot_hrs).toFixed(2) : '-'}
                  </TableCell>
                  <TableCell>
                    <IconButton size="small" color="primary" onClick={() => openEditDialog(row)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => deleteRecord(row.id)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>

      <Dialog open={bulkDialog} onClose={() => setBulkDialog(false)} maxWidth="lg" fullWidth>
        <DialogTitle sx={{ bgcolor: "#1976d2", color: "white" }}>
          Bulk Attendance Entry - {dataDate}
        </DialogTitle>
        <DialogContent sx={{ p: 2 }}>
          <Box sx={{ mb: 2, p: 2, bgcolor: "#f8f9fa", borderRadius: 1, display: "flex", flexWrap: "wrap", gap: 2, alignItems: "center" }}>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Filter Type</InputLabel>
              <Select
                value={bulkFilterType}
                label="Filter Type"
                onChange={(e) => setBulkFilterType(e.target.value)}
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
                />
                <TextField
                  size="small"
                  type="date"
                  label="To"
                  InputLabelProps={{ shrink: true }}
                  value={bulkToDate}
                  onChange={(e) => setBulkToDate(e.target.value)}
                />
              </>
            )}

            {bulkFilterType === "month" && (
              <>
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>Month</InputLabel>
                  <Select
                    value={bulkMonth}
                    label="Month"
                    onChange={(e) => setBulkMonth(e.target.value)}
                  >
                    {months.map((m) => (
                      <MenuItem key={m.value} value={m.value}>{m.label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl size="small" sx={{ minWidth: 100 }}>
                  <InputLabel>Year</InputLabel>
                  <Select
                    value={bulkYear}
                    label="Year"
                    onChange={(e) => setBulkYear(e.target.value)}
                  >
                    {years.map((y) => (
                      <MenuItem key={y} value={y}>{y}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </>
            )}

            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Employee</InputLabel>
              <Select
                value={bulkEmployeeId}
                label="Employee"
                onChange={(e) => setBulkEmployeeId(e.target.value)}
              >
                <MenuItem value="">All Employees</MenuItem>
                {employeeList.map((emp) => (
                  <MenuItem key={emp.empid} value={emp.empid}>
                    {emp.empid} - {emp.ename}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Department</InputLabel>
              <Select
                value={bulkDepartmentFilter}
                label="Department"
                onChange={(e) => setBulkDepartmentFilter(e.target.value)}
              >
                <MenuItem value="">All Departments</MenuItem>
                {[...new Set(employeeList.map(e => e.department).filter(Boolean))].map(dept => (
                  <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <Button variant="contained" size="small" startIcon={<FilterListIcon />} onClick={openBulkEntry}>
              Apply Filter
            </Button>
          </Box>

          <Box sx={{ maxHeight: "60vh", overflow: "auto" }}>
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
                </TableRow>
              </TableHead>
              <TableBody>
                {bulkRows.map((row, idx) => (
                  <TableRow key={idx} sx={{ bgcolor: row.hasExisting ? "#e8f5e9" : "#fff" }}>
                    <TableCell>{row.att_date}</TableCell>
                    <TableCell>{row.empid}</TableCell>
                    <TableCell>{row.ename}</TableCell>
                    <TableCell>
                      <Select size="small" value={row.shift} onChange={(e) => updateRow(idx, "shift", e.target.value)}>
                        <MenuItem value="G">G (General)</MenuItem>
                        <MenuItem value="A">A (Morning)</MenuItem>
                        <MenuItem value="B">B (Afternoon)</MenuItem>
                        <MenuItem value="W">W (Weekly Off)</MenuItem>
                        <MenuItem value="H">H (Holiday)</MenuItem>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Select size="small" value={row.status} onChange={(e) => updateRow(idx, "status", e.target.value)}>
                        <MenuItem value="P">Present</MenuItem>
                        <MenuItem value="A">Absent</MenuItem>
                        <MenuItem value="W">Weekly Off</MenuItem>
                        <MenuItem value="H">Holiday</MenuItem>
                        <MenuItem value="L">Leave</MenuItem>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <TextField size="small" type="time" value={row.in_time} onChange={(e) => updateRow(idx, "in_time", e.target.value)} />
                    </TableCell>
                    <TableCell>
                      <TextField size="small" type="time" value={row.out_time} onChange={(e) => updateRow(idx, "out_time", e.target.value)} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setBulkDialog(false)}>Cancel</Button>
          <Button variant="contained" startIcon={<SaveIcon />} onClick={saveBulk}>
            Save All
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={editDialog} onClose={() => setEditDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: "#1976d2", color: "white" }}>
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
                  onChange={(e) => setEditRow({ ...editRow, status: e.target.value })}
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
