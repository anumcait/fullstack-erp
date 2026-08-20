import React, { useState, useEffect } from "react";
import {
  Box, Card, CardContent, Typography, Grid, TextField, Select, MenuItem,
  Button, Table, TableHead, TableBody, TableRow, TableCell,
  IconButton, Chip, FormControl, InputLabel, RadioGroup, FormControlLabel, Radio
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import DeleteIcon from "@mui/icons-material/Delete";
import FilterListIcon from "@mui/icons-material/FilterList";
import ClearIcon from "@mui/icons-material/Clear";
import RefreshIcon from "@mui/icons-material/Refresh";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import axios from "axios";
import { useToast } from "../../../context/ToastContext";

const AttendanceModificationEntry = () => {
  const { showToast } = useToast();
  const [filterType, setFilterType] = useState("month");
  const [dataDate, setDataDate] = useState(new Date().toISOString().split("T")[0]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [modType, setModType] = useState("Manual Attendance");
  
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterEmpId, setFilterEmpId] = useState("");
  const [filterShift, setFilterShift] = useState("");
  const [employeeList, setEmployeeList] = useState([]);

  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);
  const months = [
    { value: 1, label: "January" }, { value: 2, label: "February" }, { value: 3, label: "March" },
    { value: 4, label: "April" }, { value: 5, label: "May" }, { value: 6, label: "June" },
    { value: 7, label: "July" }, { value: 8, label: "August" }, { value: 9, label: "September" },
    { value: 10, label: "October" }, { value: 11, label: "November" }, { value: 12, label: "December" }
  ];

  const modTypes = [
    "Manual Attendance",
    "Late Coming",
    "Onduty",
    "Early In Late Out",
    "Weekly off Change",
    "Shift Change",
    "No Attendance"
  ];

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    if (filterType === "range" && (!fromDate || !toDate)) return;
    fetchData();
  }, [filterType, dataDate, fromDate, toDate, month, year, filterShift]);

  const fetchEmployees = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/employees`);
      setEmployeeList(res.data);
    } catch (err) {
      console.error("Error fetching employees:", err);
    }
  };

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
      if (filterEmpId) params.empid = filterEmpId;

      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/attendance`, { params });
      
      let data = res.data.records || res.data || [];
      if (filterShift) {
        data = data.filter(d => d.shift === filterShift);
      }
      
      // Seed editable state
      data = data.map(row => {
        let currentMod = "None";
        if (row.remarks) {
          const match = row.remarks.match(/\[MOD: (.*?)\]/);
          if (match) currentMod = match[1];
        }
        return {
          ...row,
          modify_in_time: row.in_time || "",
          modify_out_time: row.out_time || "",
          modify_shift: row.shift || "G",
          modify_status: row.status || "P",
          modify_type: currentMod === "None" ? modType : currentMod
        };
      });
      
      setAttendanceData(data);
    } catch (err) {
      console.error("Error fetching attendance data:", err);
      showToast("Error loading attendance records", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (id, field, value) => {
    setAttendanceData(prev => 
      prev.map(row => (row.id === id ? { ...row, [field]: value } : row))
    );
  };

  const saveRow = async (row) => {
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/api/attendance/${row.id}`, {
        empid: row.empid,
        att_date: row.att_date,
        shift: row.modify_shift,
        status: row.modify_status,
        in_time: row.modify_in_time || null,
        out_time: row.modify_out_time || null,
        late_hrs: row.late_hrs || 0,
        ot_hrs: row.ot_hrs || 0,
        remarks: row.modify_type !== "None" 
          ? `[MOD: ${row.modify_type}] ${row.remarks ? row.remarks.replace(/\[MOD: .*?\]\s*/, '') : ''}`
          : row.remarks
      });
      showToast("Attendance successfully modified", "success");
      fetchData();
    } catch {
      showToast("Error saving modification", "error");
    }
  };

  const deleteRecord = async (id) => {
    if (!window.confirm("Are you sure you want to delete this record?")) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/attendance/${id}`);
      showToast("Record deleted", "success");
      fetchData();
    } catch {
      showToast("Error deleting", "error");
    }
  };

  const clearFilters = () => {
    setFilterEmpId("");
    setFilterShift("");
    setDataDate(new Date().toISOString().split("T")[0]);
    setFromDate("");
    setToDate("");
    setMonth(new Date().getMonth() + 1);
    setYear(new Date().getFullYear());
  };

  return (
    <Card sx={{ m: 2, p: 2 }}>
      {/* HEADER */}
      <Box sx={{ mb: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="h5" sx={{ fontWeight: "bold", color: "var(--heading-color)", borderLeft: "4px solid", borderColor: "primary.main", pl: 1.5, lineHeight: 1.2 }}>Attendance Modification</Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button 
            variant={filterType === "date" ? "contained" : "outlined"} 
            color={filterType === "date" ? "secondary" : "inherit"}
            size="small"
            onClick={() => setFilterType("date")}
            startIcon={<CalendarMonthIcon />}
          >
            By Date
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
            startIcon={<FilterListIcon />}
          >
            By Month
          </Button>
        </Box>
      </Box>

      <CardContent>
        {/* Mod Type Selection */}
        <Box sx={{ mb: 2 }}>
          <RadioGroup 
            row 
            value={modType} 
            onChange={(e) => {
              const newValue = e.target.value;
              setModType(newValue);
              // Update all rows to match the globally selected modification type
              setAttendanceData(prev => prev.map(row => ({
                ...row,
                modify_type: newValue
              })));
            }}
          >
            {modTypes.map((label) => (
              <FormControlLabel
                key={label}
                value={label}
                control={<Radio size="small" color="primary" />}
                label={<Typography variant="body2" fontWeight="bold">{label}</Typography>}
                sx={{ mr: 2 }}
              />
            ))}
          </RadioGroup>
        </Box>

        {/* FILTERS */}
        <Box sx={{ mb: 3, p: 2, bgcolor: "#f8f9fa", borderRadius: 1 }}>
          <Grid container spacing={2} alignItems="center">
            
            {filterType === "date" && (
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  size="small"
                  type="date"
                  label="Date"
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
                    <Select value={month} label="Month" onChange={(e) => setMonth(e.target.value)}>
                      {months.map((m) => (
                        <MenuItem key={m.value} value={m.value}>{m.label}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={2}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Year</InputLabel>
                    <Select value={year} label="Year" onChange={(e) => setYear(e.target.value)}>
                      {years.map((y) => (
                        <MenuItem key={y} value={y}>{y}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </>
            )}

            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Shift</InputLabel>
                <Select label="Shift" value={filterShift} onChange={(e) => setFilterShift(e.target.value)}>
                  <MenuItem value="">All Shifts</MenuItem>
                  <MenuItem value="G">General</MenuItem>
                  <MenuItem value="A">Morning</MenuItem>
                  <MenuItem value="B">Afternoon</MenuItem>
                  <MenuItem value="W">Weekly Off</MenuItem>
                  <MenuItem value="H">Holiday</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Employee</InputLabel>
                <Select
                  value={filterEmpId}
                  label="Employee"
                  onChange={(e) => setFilterEmpId(e.target.value)}
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
                Show
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
            Modification Records: {attendanceData.length}
          </Typography>
        </Box>

        {/* TABLE */}
        <Box sx={{ overflowX: "auto" }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: "rgba(25, 118, 210, 0.08)", color: "primary.dark" }}>
                <TableCell sx={{ color: "primary.dark", fontWeight: "bold" }}>Date</TableCell>
                <TableCell sx={{ color: "primary.dark", fontWeight: "bold" }}>Emp ID</TableCell>
                <TableCell sx={{ color: "primary.dark", fontWeight: "bold" }}>Name</TableCell>
                <TableCell sx={{ color: "primary.dark", fontWeight: "bold" }}>Mod Type</TableCell>
                <TableCell sx={{ color: "primary.dark", fontWeight: "bold" }}>New Shift</TableCell>
                <TableCell sx={{ color: "primary.dark", fontWeight: "bold" }}>New Status</TableCell>
                <TableCell sx={{ color: "primary.dark", fontWeight: "bold" }}>Actual In</TableCell>
                <TableCell sx={{ color: "primary.dark", fontWeight: "bold" }}>Actual Out</TableCell>
                <TableCell sx={{ color: "primary.dark", fontWeight: "bold" }}>Modify In</TableCell>
                <TableCell sx={{ color: "primary.dark", fontWeight: "bold" }}>Modify Out</TableCell>
                <TableCell sx={{ color: "primary.dark", fontWeight: "bold" }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={10} align="center" sx={{ py: 3 }}>Loading...</TableCell>
                </TableRow>
              ) : attendanceData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} align="center" sx={{ py: 3, color: "#777" }}>No attendance records found</TableCell>
                </TableRow>
              ) : (
                attendanceData.map((row) => (
                  <TableRow key={row.id} sx={{ "&:nth-of-type(odd)": { bgcolor: "#fafafa" } }}>
                    <TableCell>{row.att_date}</TableCell>
                    <TableCell>{row.empid}</TableCell>
                    <TableCell>{row.employee?.ename || "-"}</TableCell>
                    <TableCell>
                      <FormControl size="small" fullWidth sx={{ minWidth: 140 }}>
                        <Select 
                          value={row.modify_type || "None"} 
                          onChange={(e) => handleFieldChange(row.id, "modify_type", e.target.value)}
                        >
                          <MenuItem value="None">None</MenuItem>
                          {modTypes.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                        </Select>
                      </FormControl>
                    </TableCell>
                    <TableCell>
                      <FormControl size="small" fullWidth sx={{ minWidth: 80 }}>
                        <Select 
                          value={row.modify_shift} 
                          onChange={(e) => handleFieldChange(row.id, "modify_shift", e.target.value)}
                        >
                          <MenuItem value="G">G</MenuItem>
                          <MenuItem value="A">A</MenuItem>
                          <MenuItem value="B">B</MenuItem>
                          <MenuItem value="W">W</MenuItem>
                          <MenuItem value="H">H</MenuItem>
                        </Select>
                      </FormControl>
                    </TableCell>
                    <TableCell>
                      <FormControl size="small" fullWidth sx={{ minWidth: 100 }}>
                        <Select 
                          value={row.modify_status} 
                          onChange={(e) => handleFieldChange(row.id, "modify_status", e.target.value)}
                        >
                          <MenuItem value="P">Present</MenuItem>
                          <MenuItem value="A">Absent</MenuItem>
                          <MenuItem value="W">Weekly Off</MenuItem>
                          <MenuItem value="H">Holiday</MenuItem>
                          <MenuItem value="L">Leave</MenuItem>
                        </Select>
                      </FormControl>
                    </TableCell>
                    <TableCell sx={{ fontFamily: "monospace", color: "gray" }}>{row.in_time || "-"}</TableCell>
                    <TableCell sx={{ fontFamily: "monospace", color: "gray" }}>{row.out_time || "-"}</TableCell>
                    <TableCell>
                      <TextField 
                        type="time" 
                        size="small" 
                        value={row.modify_in_time}
                        onChange={(e) => handleFieldChange(row.id, "modify_in_time", e.target.value)}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField 
                        type="time" 
                        size="small" 
                        value={row.modify_out_time}
                        onChange={(e) => handleFieldChange(row.id, "modify_out_time", e.target.value)}
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton size="small" color="primary" onClick={() => saveRow(row)}>
                        <SaveIcon fontSize="small" />
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
        </Box>

      </CardContent>
    </Card>
  );
};

export default AttendanceModificationEntry;
