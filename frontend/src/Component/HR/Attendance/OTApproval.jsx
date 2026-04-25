import React, { useState, useEffect } from "react";
import {
  Box, Card, CardContent, Typography, TextField, Select, MenuItem,
  Button, Table, TableHead, TableBody, TableRow, TableCell, Chip,
  IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
  Grid, FormControl, InputLabel, Checkbox, TableFooter
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import CloseIcon from "@mui/icons-material/Close";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import WeekendIcon from "@mui/icons-material/Weekend";
import ClearIcon from "@mui/icons-material/Clear";
import RefreshIcon from "@mui/icons-material/Refresh";
import axios from "axios";
import { useToast } from "../../../context/ToastContext";

const OTApproval = () => {
  const { showToast } = useToast();
  const [filterType, setFilterType] = useState("month");
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [dataDate, setDataDate] = useState(new Date().toISOString().split("T")[0]);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editDialog, setEditDialog] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [employeeList, setEmployeeList] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);

  const [viewMode, setViewMode] = useState("attendance");
  const [extOtData, setExtOtData] = useState([]);
  const [extOtDialog, setExtOtDialog] = useState(false);
  const [selectedExtOt, setSelectedExtOt] = useState(null);
  const [extOtSelectedRows, setExtOtSelectedRows] = useState([]);
  const [extOtApprovalDialog, setExtOtApprovalDialog] = useState(false);
  const [selectedExtOtRow, setSelectedExtOtRow] = useState(null);

  const months = [
    { value: 1, label: "January" }, { value: 2, label: "February" },
    { value: 3, label: "March" }, { value: 4, label: "April" },
    { value: 5, label: "May" }, { value: 6, label: "June" },
    { value: 7, label: "July" }, { value: 8, label: "August" },
    { value: 9, label: "September" }, { value: 10, label: "October" },
    { value: 11, label: "November" }, { value: 12, label: "December" }
  ];

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    if (viewMode === "attendance") {
      fetchData();
    } else {
      fetchExtOtData();
    }
  }, [filterType, selectedEmployee, dataDate, month, year, viewMode]);

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
      } else if (filterType === "month") {
        params.month = month;
        params.year = year;
      }
      if (selectedEmployee) {
        params.empid = selectedEmployee;
      }
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/attendance/ot-approval`, { params });
      setData(res.data);
    } catch (err) {
      console.error("Error fetching OT data:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchExtOtData = async () => {
    setLoading(true);
    setExtOtData([]);
    try {
      const params = {};
      if (filterType === "month") {
        params.month = month;
        params.year = year;
      } else if (filterType === "date") {
        params.startDate = dataDate;
        params.endDate = dataDate;
      } else {
        params.month = month;
        params.year = year;
      }
      if (selectedEmployee) {
        params.empid = selectedEmployee;
      }
      console.log("Fetching ext OT with filterType:", filterType, "params:", params);
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/ext-ot/all`, { params });
      console.log("Ext OT response:", res.data);
      if (Array.isArray(res.data)) {
        setExtOtData(res.data);
      } else {
        console.error("Invalid response:", res.data);
        setExtOtData([]);
      }
    } catch (err) {
      console.error("Error fetching ext OT:", err);
      showToast("Error: " + (err.response?.data?.message || err.message), "error");
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setFilterType("month");
    setDataDate(new Date().toISOString().split("T")[0]);
    setMonth(new Date().getMonth() + 1);
    setYear(new Date().getFullYear());
    setSelectedEmployee("");
  };

  const openEditDialog = async (row) => {
    setSelectedRow({
      ...row,
      app_ot_edit: row.app_ot || row.ot_hrs || "",
      app_status_edit: row.app_status || 0,
      app_remarks_edit: row.app_remarks || "",
      hr_app_ot_edit: row.hr_app_ot || row.app_ot || row.ot_hrs || "",
      hr_app_status_edit: row.hr_app_status || 0,
      hr_remarks_edit: row.hr_remarks || ""
    });
    setEditDialog(true);
  };

  const saveApproval = async () => {
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/api/attendance/ot-approval/${selectedRow.id}`, {
        app_ot: selectedRow.app_ot_edit || null,
        app_status: selectedRow.app_status_edit,
        app_remarks: selectedRow.app_remarks_edit || null,
        hr_app_ot: selectedRow.hr_app_ot_edit || null,
        hr_app_status: selectedRow.hr_app_status_edit,
        hr_remarks: selectedRow.hr_remarks_edit || null
      });
      showToast("OT approval saved", "success");
      setEditDialog(false);
      fetchData();
    } catch (err) {
      showToast("Error: " + (err.response?.data?.message || err.message), "error");
    }
  };

  const handleSelectAll = () => {
    if (selectedRows.length === data.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(data.map(r => r.id));
    }
  };

  const handleSelectRow = (id) => {
    if (selectedRows.includes(id)) {
      setSelectedRows(selectedRows.filter(r => r !== id));
    } else {
      setSelectedRows([...selectedRows, id]);
    }
  };

  const getStatusChip = (appStatus, hrStatus) => {
    if (hrStatus === 1) return <Chip size="small" label="HR Approved" color="success" />;
    if (appStatus === 1) return <Chip size="small" label="Manager Approved" color="primary" />;
    return <Chip size="small" label="Pending" color="warning" />;
  };

  const getExtStatusChip = (status) => {
    if (status === 2) return <Chip size="small" label="HR Approved" color="success" />;
    if (status === 1) return <Chip size="small" label="Manager Approved" color="primary" />;
    return <Chip size="small" label="Pending" color="warning" />;
  };

  const handleExtSelectAll = () => {
    if (extOtSelectedRows.length === extOtData.length) {
      setExtOtSelectedRows([]);
    } else {
      setExtOtSelectedRows(extOtData.map(r => r.id));
    }
  };

  const handleExtSelectRow = (id) => {
    setExtOtSelectedRows(prev =>
      prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
    );
  };

  const parseOTToHours = (val) => {
    if (!val) return 0;
    const str = String(val);
    if (str.includes('.')) {
      const parts = str.split('.');
      const h = parseInt(parts[0]) || 0;
      const m = parseInt(parts[1]) || 0;
      return h + (m / 60);
    }
    if (str.includes(':')) {
      const parts = str.split(':');
      const h = parseInt(parts[0]) || 0;
      const m = parseInt(parts[1]) || 0;
      return h + (m / 60);
    }
    return parseFloat(str) || 0;
  };

  const formatHoursToOT = (totalHours) => {
    if (!totalHours) return "0.00";
    const h = Math.floor(totalHours);
    const m = Math.round((totalHours - h) * 60);
    return `${h}.${String(m).padStart(2, '0')}`;
  };

  const openExtOtApproval = (row) => {
    setSelectedExtOtRow({
      ...row,
      edit_ot_hrs: row.ot_hrs || "",
      edit_manager_remarks: row.manager_remarks || "",
      edit_hr_remarks: row.hr_remarks || ""
    });
    setExtOtApprovalDialog(true);
  };

  const saveExtOtApproval = async () => {
    try {
      const row = selectedExtOtRow;
      if (row.app_status === 0) {
        await axios.put(`${import.meta.env.VITE_API_URL}/api/ext-ot/manager-approve/${row.id}`, {
          manager_remarks: row.edit_manager_remarks || "Approved",
          ot_hrs: row.edit_ot_hrs || row.ot_hrs
        });
        showToast("Manager approved", "success");
      } else if (row.app_status === 1) {
        await axios.put(`${import.meta.env.VITE_API_URL}/api/ext-ot/hr-approve/${row.id}`, {
          hr_remarks: row.edit_hr_remarks || "HR Approved",
          ot_hrs: row.edit_ot_hrs || row.ot_hrs
        });
        showToast("HR approved", "success");
      }
      setExtOtApprovalDialog(false);
      fetchExtOtData();
    } catch (err) {
      showToast("Error: " + (err.response?.data?.message || err.message), "error");
    }
  };

  return (
    <Card sx={{ m: 2 }}>
      <CardContent>
        <Box sx={{ mb: 2, display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center" }}>
          <FormControl size="small" sx={{ minWidth: 120, bgcolor: "white", borderRadius: 1 }}>
            <InputLabel>Filter</InputLabel>
            <Select value={filterType} label="Filter" onChange={(e) => setFilterType(e.target.value)}>
              <MenuItem value="date">Date</MenuItem>
              <MenuItem value="month">Month</MenuItem>
            </Select>
          </FormControl>

          {filterType === "date" ? (
            <TextField type="date" size="small" value={dataDate} onChange={(e) => setDataDate(e.target.value)} sx={{ bgcolor: "white", borderRadius: 1 }} />
          ) : (
            <>
              <FormControl size="small" sx={{ minWidth: 100, bgcolor: "white", borderRadius: 1 }}>
                <InputLabel>Month</InputLabel>
                <Select value={month} label="Month" onChange={(e) => setMonth(e.target.value)}>
                  {months.map(m => <MenuItem key={m.value} value={m.value}>{m.label}</MenuItem>)}
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 80, bgcolor: "white", borderRadius: 1 }}>
                <InputLabel>Year</InputLabel>
                <Select value={year} label="Year" onChange={(e) => setYear(e.target.value)}>
                  {[2023, 2024, 2025, 2026].map(y => <MenuItem key={y} value={y}>{y}</MenuItem>)}
                </Select>
              </FormControl>
            </>
          )}

          <FormControl size="small" sx={{ minWidth: 200, bgcolor: "white", borderRadius: 1 }}>
            <InputLabel>Employee</InputLabel>
            <Select value={selectedEmployee} label="Employee" onChange={(e) => setSelectedEmployee(e.target.value)}>
              <MenuItem value="">All Employees</MenuItem>
              {employeeList.map((emp) => (
                <MenuItem key={emp.empid} value={emp.empid}>{emp.empid} - {emp.ename}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button variant="outlined" size="small" startIcon={<RefreshIcon />} onClick={viewMode === "attendance" ? fetchData : fetchExtOtData}>
            Refresh
          </Button>

          <Button variant="outlined" size="small" startIcon={<ClearIcon />} onClick={clearFilters}>
            Clear
          </Button>

          <Button
            variant={viewMode === "ext-ot" ? "contained" : "outlined"}
            size="small"
            color="warning"
            startIcon={<WeekendIcon />}
            onClick={() => setViewMode(viewMode === "attendance" ? "ext-ot" : "attendance")}
          >
            {viewMode === "attendance" ? "Weekly Off/Holiday OT" : "Regular Attendance OT"}
          </Button>
        </Box>

        {viewMode === "ext-ot" && (
          <Box sx={{ mb: 2 }}>
            <Button variant="contained" size="small" onClick={() => { setSelectedExtOt(null); setExtOtDialog(true); }}>
              + Add Weekly Off/Holiday OT
            </Button>
          </Box>
        )}

        {viewMode === "attendance" ? (
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: "#1976d2", color: "white" }}>
                <TableCell sx={{ color: "white" }}><Checkbox size="small" sx={{ color: "white" }} /></TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Date</TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Emp ID</TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Name</TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Dept</TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Actual OT</TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Manager OT</TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>HR OT</TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Status</TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={9} align="center">Loading...</TableCell></TableRow>
              ) : data.length === 0 ? (
                <TableRow><TableCell colSpan={9} align="center">No records found</TableCell></TableRow>
              ) : (
                data.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell><Checkbox size="small" /></TableCell>
                    <TableCell>{row.date}</TableCell>
                    <TableCell>{row.empid}</TableCell>
                    <TableCell>{row.empName}</TableCell>
                    <TableCell>{row.department}</TableCell>
                    <TableCell sx={{ fontFamily: "monospace", fontWeight: "bold" }}>{Number(row.ot_hrs || 0).toFixed(2)}</TableCell>
                    <TableCell>{row.app_ot || "-"}</TableCell>
                    <TableCell>{row.hr_app_ot || "-"}</TableCell>
                    <TableCell>{getStatusChip(row.app_status, row.hr_app_status)}</TableCell>
                    <TableCell>
                      <IconButton size="small" color="primary" onClick={() => openEditDialog(row)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
            {data.length > 0 && !loading && (
              <TableFooter>
                <TableRow sx={{ bgcolor: "#f5f5f5" }}>
                  <TableCell colSpan={5} sx={{ fontWeight: "bold", textAlign: "right" }}>Total (All):<br />Total (Approved):</TableCell>
                  <TableCell sx={{ fontFamily: "monospace", fontWeight: "bold" }}>
                    {formatHoursToOT(data.reduce((sum, r) => sum + parseOTToHours(r.ot_hrs), 0))}
                  </TableCell>
                  <TableCell sx={{ fontFamily: "monospace", fontWeight: "bold", color: "#1976d2" }}>
                    {formatHoursToOT(data.reduce((sum, r) => sum + parseOTToHours(r.app_ot), 0))}<br />
                    <span style={{ color: "green" }}>{formatHoursToOT(data.reduce((sum, r) => sum + (r.app_status === 1 || r.hr_app_status === 1 ? parseOTToHours(r.app_ot || r.ot_hrs) : 0), 0))}</span>
                  </TableCell>
                  <TableCell sx={{ fontFamily: "monospace", fontWeight: "bold", color: "#1976d2" }}>
                    {formatHoursToOT(data.reduce((sum, r) => sum + parseOTToHours(r.hr_app_ot), 0))}<br />
                    <span style={{ color: "green" }}>{formatHoursToOT(data.reduce((sum, r) => sum + (r.hr_app_status === 1 ? parseOTToHours(r.hr_app_ot || r.app_ot || r.ot_hrs) : 0), 0))}</span>
                  </TableCell>
                  <TableCell colSpan={2}></TableCell>
                </TableRow>
              </TableFooter>
            )}
          </Table>
        ) : (
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: "#e65100", color: "white" }}>
                <TableCell sx={{ color: "white" }}><Checkbox size="small" sx={{ color: "white" }} checked={extOtSelectedRows.length === extOtData.length && extOtData.length > 0} indeterminate={extOtSelectedRows.length > 0 && extOtSelectedRows.length < extOtData.length} onChange={handleExtSelectAll} /></TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Date</TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Emp ID</TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Name</TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>In</TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Out</TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>OT Hrs</TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Type</TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Status</TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={10} align="center">Loading...</TableCell></TableRow>
              ) : extOtData.length === 0 ? (
                <TableRow><TableCell colSpan={10} align="center">No Weekly Off/Holiday OT records</TableCell></TableRow>
              ) : (
                extOtData.map((row) => (
                  <TableRow key={row.id} sx={{ "&:nth-of-type(odd)": { bgcolor: "#fff3e0" } }}>
                    <TableCell><Checkbox size="small" checked={extOtSelectedRows.includes(row.id)} onChange={() => handleExtSelectRow(row.id)} /></TableCell>
                    <TableCell>{row.ot_date}</TableCell>
                    <TableCell>{row.empid}</TableCell>
                    <TableCell>{row.ename}</TableCell>
                    <TableCell>{row.in_time || "-"}</TableCell>
                    <TableCell>{row.out_time || "-"}</TableCell>
                    <TableCell sx={{ fontFamily: "monospace", fontWeight: "bold" }}>
                      {Number(row.ot_hrs || 0).toFixed(2)}
                    </TableCell>
                    <TableCell>{row.ot_type}</TableCell>
                    <TableCell>{getExtStatusChip(row.app_status)}</TableCell>
                    <TableCell>
                      <IconButton size="small" color="primary" onClick={() => openExtOtApproval(row)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
            {extOtData.length > 0 && !loading && (
              <TableFooter>
                <TableRow sx={{ bgcolor: "#f5f5f5" }}>
                  <TableCell colSpan={6} sx={{ fontWeight: "bold", textAlign: "right" }}>Total (All):<br />Total (HR Approved):</TableCell>
                  <TableCell sx={{ fontFamily: "monospace", fontWeight: "bold", color: "#1976d2" }}>
                    {formatHoursToOT(extOtData.reduce((sum, r) => sum + parseOTToHours(r.ot_hrs), 0))}<br />
                    <span style={{ color: "green" }}>{formatHoursToOT(extOtData.reduce((sum, r) => sum + (r.app_status === 2 ? parseOTToHours(r.ot_hrs) : 0), 0))}</span>
                  </TableCell>
                  <TableCell colSpan={3}></TableCell>
                </TableRow>
              </TableFooter>
            )}
          </Table>
        )}

        {viewMode === "ext-ot" && extOtSelectedRows.length > 0 && (
          <Box sx={{ p: 2, display: "flex", gap: 2, alignItems: "center", bgcolor: "#e3f2fd", borderTop: "2px solid #e65100" }}>
            <Typography variant="body2" sx={{ fontWeight: "bold" }}>{extOtSelectedRows.length} selected</Typography>
            <Button variant="contained" color="primary" size="small" onClick={async () => {
              const ids = extOtSelectedRows.filter(id => extOtData.find(r => r.id === id)?.app_status === 0);
              if (ids.length === 0) { showToast("No pending records in selection", "warning"); return; }
              try {
                await axios.post(`${import.meta.env.VITE_API_URL}/api/ext-ot/manager-bulk-approve`, { ids, manager_remarks: "Bulk Approved" });
                showToast(`Manager approved ${ids.length} records`, "success");
                setExtOtSelectedRows([]);
                fetchExtOtData();
              } catch (err) {
                showToast("Error: " + (err.response?.data?.message || err.message), "error");
              }
            }}>
              Manager Approve Selected
            </Button>
            <Button variant="contained" color="success" size="small" onClick={async () => {
              const ids = extOtSelectedRows.filter(id => extOtData.find(r => r.id === id)?.app_status === 1);
              if (ids.length === 0) { showToast("No manager-approved records in selection", "warning"); return; }
              try {
                await axios.post(`${import.meta.env.VITE_API_URL}/api/ext-ot/hr-bulk-approve`, { ids, hr_remarks: "Bulk HR Approved" });
                showToast(`HR approved ${ids.length} records`, "success");
                setExtOtSelectedRows([]);
                fetchExtOtData();
              } catch (err) {
                showToast("Error: " + (err.response?.data?.message || err.message), "error");
              }
            }}>
              HR Approve Selected
            </Button>
          </Box>
        )}
      </CardContent>

      <Dialog open={extOtDialog} onClose={() => setExtOtDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: "#e65100", color: "white", display: "flex", justifyContent: "space-between" }}>
          Add Weekly Off / Holiday OT
          <IconButton onClick={() => setExtOtDialog(false)} sx={{ color: "white" }}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth size="small">
                <InputLabel>Employee</InputLabel>
                <Select
                  value={selectedExtOt?.empid || ""}
                  label="Employee"
                  onChange={(e) => {
                    const emp = employeeList.find(em => em.empid === e.target.value);
                    setSelectedExtOt({ ...selectedExtOt, empid: e.target.value, ename: emp?.ename || "" });
                  }}
                >
                  {employeeList.map((emp) => (
                    <MenuItem key={emp.empid} value={emp.empid}>{emp.empid} - {emp.ename}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth type="date" label="Date" value={selectedExtOt?.ot_date || ""} onChange={(e) => setSelectedExtOt({ ...selectedExtOt, ot_date: e.target.value })} size="small" InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth type="time" label="In Time" value={selectedExtOt?.in_time || ""} onChange={(e) => setSelectedExtOt({ ...selectedExtOt, in_time: e.target.value })} size="small" InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth type="time" label="Out Time" value={selectedExtOt?.out_time || ""} onChange={(e) => setSelectedExtOt({ ...selectedExtOt, out_time: e.target.value })} size="small" InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth type="number" label="OT Hours" value={selectedExtOt?.ot_hrs || ""} onChange={(e) => setSelectedExtOt({ ...selectedExtOt, ot_hrs: e.target.value })} size="small" placeholder="Auto calculated" />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth size="small">
                <InputLabel>OT Type</InputLabel>
                <Select value={selectedExtOt?.ot_type || ""} label="OT Type" onChange={(e) => setSelectedExtOt({ ...selectedExtOt, ot_type: e.target.value })}>
                  <MenuItem value="WeeklyOff">Weekly Off</MenuItem>
                  <MenuItem value="Holiday">Holiday</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="OT Hours (override)" value={selectedExtOt?.ot_hrs || ""} onChange={(e) => setSelectedExtOt({ ...selectedExtOt, ot_hrs: e.target.value })} size="small" placeholder="Auto calculated" />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setExtOtDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={async () => {
            try {
              if (!selectedExtOt?.empid || !selectedExtOt?.ot_date || !selectedExtOt?.ot_type) {
                showToast("Please fill all required fields", "error");
                return;
              }
              const payload = {
                empid: selectedExtOt.empid,
                ename: selectedExtOt.ename,
                ot_date: selectedExtOt.ot_date,
                in_time: selectedExtOt.in_time,
                out_time: selectedExtOt.out_time,
                ot_type: selectedExtOt.ot_type,
                ot_hrs: selectedExtOt.ot_hrs
              };
              if (selectedExtOt?.id) {
                await axios.put(`${import.meta.env.VITE_API_URL}/api/ext-ot/${selectedExtOt.id}`, payload);
                showToast("Updated successfully", "success");
              } else {
                await axios.post(`${import.meta.env.VITE_API_URL}/api/ext-ot`, payload);
                showToast("Created successfully", "success");
              }
              setExtOtDialog(false);
              setTimeout(() => fetchExtOtData(), 300);
            } catch (err) {
              showToast("Error: " + (err.response?.data?.message || err.message), "error");
            }
          }}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={extOtApprovalDialog} onClose={() => setExtOtApprovalDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: "#e65100", color: "white", display: "flex", justifyContent: "space-between" }}>
          WeeklyOff/Holiday OT Approval - {selectedExtOtRow?.ename}
          <IconButton onClick={() => setExtOtApprovalDialog(false)} sx={{ color: "white" }}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={6}><Typography><strong>Emp ID:</strong> {selectedExtOtRow?.empid}</Typography></Grid>
            <Grid item xs={6}><Typography><strong>Date:</strong> {selectedExtOtRow?.ot_date}</Typography></Grid>
            <Grid item xs={6}><Typography><strong>Type:</strong> {selectedExtOtRow?.ot_type}</Typography></Grid>
            <Grid item xs={6}><Typography><strong>In/Out:</strong> {selectedExtOtRow?.in_time || "-"} / {selectedExtOtRow?.out_time || "-"}</Typography></Grid>
            <Grid item xs={6}>
              <TextField fullWidth label="Calculated OT" value={Number(selectedExtOtRow?.ot_hrs || 0).toFixed(2)} disabled size="small" />
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth type="number" label="Approved OT Hrs" value={selectedExtOtRow?.edit_ot_hrs || ""} onChange={(e) => setSelectedExtOtRow({ ...selectedExtOtRow, edit_ot_hrs: e.target.value })} size="small" />
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2"><strong>Status:</strong> {selectedExtOtRow?.app_status === 2 ? "HR Approved" : selectedExtOtRow?.app_status === 1 ? "Manager Approved" : "Pending"}</Typography>
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Manager Remarks" value={selectedExtOtRow?.edit_manager_remarks || ""} onChange={(e) => setSelectedExtOtRow({ ...selectedExtOtRow, edit_manager_remarks: e.target.value })} size="small" disabled={selectedExtOtRow?.app_status !== 0} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="HR Remarks" value={selectedExtOtRow?.edit_hr_remarks || ""} onChange={(e) => setSelectedExtOtRow({ ...selectedExtOtRow, edit_hr_remarks: e.target.value })} size="small" disabled={selectedExtOtRow?.app_status !== 1} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setExtOtApprovalDialog(false)}>Cancel</Button>
          {selectedExtOtRow?.app_status === 0 && (
            <Button variant="contained" color="primary" onClick={saveExtOtApproval}>Manager Approve</Button>
          )}
          {selectedExtOtRow?.app_status === 1 && (
            <Button variant="contained" color="success" onClick={saveExtOtApproval}>HR Approve</Button>
          )}
          {selectedExtOtRow?.app_status === 2 && (
            <Button variant="contained" color="info" onClick={async () => {
              try {
                await axios.put(`${import.meta.env.VITE_API_URL}/api/ext-ot/hr-update/${selectedExtOtRow.id}`, { ot_hrs: selectedExtOtRow.edit_ot_hrs });
                showToast("OT hours updated", "success");
                setExtOtApprovalDialog(false);
                fetchExtOtData();
              } catch (err) {
                showToast("Error: " + (err.response?.data?.message || err.message), "error");
              }
            }}>Update OT Hrs</Button>
          )}
        </DialogActions>
      </Dialog>

      <Dialog open={editDialog} onClose={() => setEditDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: "#1976d2", color: "white", display: "flex", justifyContent: "space-between" }}>
          OT Approval - {selectedRow?.empName}
          <IconButton onClick={() => setEditDialog(false)} sx={{ color: "white" }}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={6}><Typography><strong>Emp ID:</strong> {selectedRow?.empid}</Typography></Grid>
            <Grid item xs={6}><Typography><strong>Date:</strong> {selectedRow?.date}</Typography></Grid>
            <Grid item xs={6}>
              <TextField fullWidth label="Actual OT" value={selectedRow?.ot_hrs || 0} disabled size="small" />
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth label="Manager OT" value={selectedRow?.app_ot_edit || ""} onChange={(e) => setSelectedRow({ ...selectedRow, app_ot_edit: e.target.value })} size="small" />
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2">
                <strong>Manager Status:</strong> {selectedRow?.app_status === 1 ? "Approved" : "Pending"}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2">
                <strong>HR Status:</strong> {selectedRow?.hr_app_status === 1 ? "Approved" : "Pending"}
              </Typography>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setEditDialog(false)}>Cancel</Button>
          {selectedRow?.app_status === 0 && (
            <Button variant="contained" color="primary" onClick={() => {
              setSelectedRow({ ...selectedRow, app_status_edit: 1 });
              setTimeout(() => saveApproval(), 100);
            }}>
              Manager Approve
            </Button>
          )}
          {selectedRow?.app_status === 1 && selectedRow?.hr_app_status === 0 && (
            <Button variant="contained" color="success" onClick={() => {
              setSelectedRow({ ...selectedRow, hr_app_status_edit: 1 });
              setTimeout(() => saveApproval(), 100);
            }}>
              HR Approve
            </Button>
          )}
          {(selectedRow?.app_status === 1 && selectedRow?.hr_app_status === 1) && (
            <Button variant="contained" color="info" onClick={saveApproval}>
              Update OT Hrs
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default OTApproval;
