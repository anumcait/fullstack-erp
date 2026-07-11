import React, { useEffect, useMemo, useState } from "react";
import {
  Box, Card, CardContent, Typography, Tabs, Tab, TextField, InputAdornment,
  IconButton, Button, Stack, Drawer, Avatar, Tooltip, Chip,
  FormControl, InputLabel, Select, MenuItem, Grid
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import CloseIcon from "@mui/icons-material/Close";
import RefreshIcon from "@mui/icons-material/Refresh";
import ClearIcon from "@mui/icons-material/Clear";
import { useToast } from "../../../context/ToastContext";
import axios from 'axios';
import { getErrorMessage } from "../../../utils/errorUtils";

export default function AdvanceApprovalPage() {
  const { showToast } = useToast();
  
  const [tab, setTab] = useState("pending");
  const [filters, setFilters] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    end: new Date(Date.now()).toISOString().split("T")[0],
    appNo: "",
    empId: "",
    q: "",
  });

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const months = [
    { value: 1, label: "January" }, { value: 2, label: "February" },
    { value: 3, label: "March" }, { value: 4, label: "April" },
    { value: 5, label: "May" }, { value: 6, label: "June" },
    { value: 7, label: "July" }, { value: 8, label: "August" },
    { value: 9, label: "September" }, { value: 10, label: "October" },
    { value: 11, label: "November" }, { value: 12, label: "December" }
  ];
  const [sanction, setSanction] = useState({ remarks: "" });
  const [rows, setRows] = useState([]);

  const fetchPendingAdvances = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/advance/all`);
      console.log("API Response:", res.data);
      setRows(res.data);
    } catch (err) {
      console.error("Failed to load advance applications", err);
    }
  };

  useEffect(() => {
    fetchPendingAdvances();
  }, []);

  const clearFilters = () => {
    setFilters({
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      end: new Date(Date.now()).toISOString().split("T")[0],
      appNo: "",
      empId: "",
      q: "",
    });
  };

  const columns = useMemo(() => [
    ...(tab === "pending" ? [{
      field: "approve",
      headerName: "Action",
      width: 110,
      sortable: false,
      renderCell: (params) => (
        <Button size="small" variant="text" onClick={() => openDrawer(params.row)}>
          Approve
        </Button>
      ),
    }] : []),
    ...(tab === "completed" ? [{
      field: "cancel",
      headerName: "Action",
      width: 140,
      sortable: false,
      renderCell: (params) => (
        <Button size="small" variant="outlined" color="error" onClick={() => handleCancel(params.row)}>
          Cancel Approval
        </Button>
      ),
    }] : []),
    ...(tab === "cancelled" ? [{
      field: "reopen",
      headerName: "Action",
      width: 140,
      sortable: false,
      renderCell: (params) => (
        <Button size="small" variant="outlined" color="primary" onClick={() => handleReopen(params.row)}>
          Re-process
        </Button>
      ),
    }] : []),
    { field: "advance_id", headerName: "Advance App #", width: 130 },
    { field: "advance_date", headerName: "Entry Date", width: 140,
      valueGetter: (value) => value ? formatDateTime24Dot(value) : ""
    },
    { field: "empid", headerName: "Employee ID", width: 100 },
    { field: "ename", headerName: "Employee Name", width: 200 },
    { field: "reason", headerName: "Reason", width: 200 },
    { field: "gross_salary", headerName: "Gross Salary", width: 130, type: "number" },
    { field: "advance_amount", headerName: "Advance Amount", width: 140, type: "number" },
    { field: "status", headerName: "Status", width: 120,
      renderCell: (params) => (
        <Chip 
          label={params.value} 
          size="small" 
          color={params.value === "Approved" ? "success" : ["Cancelled", "Rejected"].includes(params.value) ? "error" : "primary"}
          variant="outlined"
        />
      )
    },
    { field: "remarks", headerName: "HR Remarks", flex: 1, minWidth: 150 },
    { field: "unit", headerName: "Unit", width: 90 },
    { field: "designation", headerName: "Designation", width: 150 },
  ], [tab]);

  function formatDateTime24Dot(dateStr) {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    let hours = d.getHours();
    const minutes = String(d.getMinutes()).padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    return `${day}-${month}-${year} ${hours}:${minutes} ${ampm}`;
  }

  function formatDateDMY(dateStr) {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  }

  const generateSchedule = (fromMonth, fromYear, installments, totalAmount) => {
    const amt = parseFloat(totalAmount) || 0;
    const inst = parseInt(installments) || 1;
    if (!fromMonth || !fromYear || inst < 1) return [];
    const base = Math.floor(amt / inst);
    const rem = amt - base * inst;
    const sched = [];
    let m = parseInt(fromMonth), y = parseInt(fromYear);
    for (let i = 0; i < inst; i++) {
      sched.push({ month: m, year: y, amount: i === inst - 1 ? base + rem : base });
      m++;
      if (m > 12) { m = 1; y++; }
    }
    return sched;
  };

  const updateScheduleAmount = (index, newValue) => {
    const newSchedule = [...sanction.schedule];
    newSchedule[index] = { ...newSchedule[index], amount: parseFloat(newValue) || 0 };
    const totalNeeded = parseFloat(selected?.advance_amount) || 0;
    const fixedSum = newSchedule.slice(0, index + 1).reduce((s, e) => s + (parseFloat(e.amount) || 0), 0);
    const remainingMonths = newSchedule.length - index - 1;
    if (remainingMonths > 0) {
      const remainingAmount = Math.max(0, totalNeeded - fixedSum);
      const base = Math.floor(remainingAmount / remainingMonths);
      const rem = remainingAmount - base * remainingMonths;
      for (let i = index + 1; i < newSchedule.length; i++) {
        newSchedule[i] = { ...newSchedule[i], amount: i === newSchedule.length - 1 ? base + rem : base };
      }
    }
    setSanction(prev => ({ ...prev, schedule: newSchedule }));
  };

  const openDrawer = (row) => {
    setSelected(row);
    const now = new Date();
    let nextMonth = now.getMonth() + 2;
    let nextYear = now.getFullYear();
    if (nextMonth > 12) { nextMonth = 1; nextYear++; }
    const inst = parseInt(row.no_of_installments) || 1;
    const schedule = generateSchedule(nextMonth, nextYear, inst, row.advance_amount);
    setSanction({ remarks: "", schedule, editInstallments: inst, editFromMonth: nextMonth, editFromYear: nextYear });
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setSelected(null);
  };

  const onApprove = async () => {
    if (!selected || !selected.advance_id) {
      alert("No advance application selected.");
      return;
    }
    if (!sanction.schedule || sanction.schedule.length === 0) {
      showToast("Please configure the deduction schedule.", "error");
      return;
    }
    const total = sanction.schedule.reduce((s, e) => s + (parseFloat(e.amount) || 0), 0);
    if (Math.abs(total - parseFloat(selected.advance_amount)) > 1) {
      showToast(`Schedule total (₹${total}) must match advance amount (₹${selected.advance_amount})`, "error");
      return;
    }
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/advance/approve`, {
        advance_id: selected.advance_id,
        status: "Approved",
        remarks: sanction.remarks,
        deduction_schedule: sanction.schedule,
      });

      showToast("Advance application approved successfully", "success");
      await fetchPendingAdvances();
      closeDrawer();
    } catch (err) {
      console.error("Approval failed:", err);
      showToast(getErrorMessage(err, "Approval failed"), "error");
    }
  };

  const onReject = async () => {
    if (!selected || !selected.advance_id) {
      alert("No advance application selected.");
      return;
    }

    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/advance/approve`, {
        advance_id: selected.advance_id,
        status: "Rejected",
        remarks: sanction.remarks,
      });

      showToast("Advance application rejected successfully", "success");
      await fetchPendingAdvances();
      closeDrawer();
    } catch (err) {
      console.error("Rejection failed:", err);
      showToast(getErrorMessage(err, "Rejection failed"), "error");
    }
  };

  const handleCancel = async (row) => {
    const reason = window.prompt("Enter reason for cancellation:");
    if (reason === null) return;
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/advance/cancel`, {
        advance_id: row.advance_id,
        remarks: reason
      });
      if (res.data.success) {
        showToast("Advance approval cancelled", "success");
        await fetchPendingAdvances();
      } else {
        showToast(res.data.message, "error");
      }
    } catch (err) {
      console.error("Cancel failed:", err);
      showToast(getErrorMessage(err, "Error cancelling Advance"), "error");
    }
  };

  const handleReopen = async (row) => {
    if (!window.confirm(`Are you sure you want to re-process Advance #${row.advance_id}?`)) return;
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/advance/reopen`, {
        advance_id: row.advance_id
      });
      if (res.data.success) {
        showToast("Application reopened", "success");
        await fetchPendingAdvances();
      } else {
        showToast(res.data.message, "error");
      }
    } catch (err) {
      console.error("Reopen failed:", err);
      showToast(getErrorMessage(err, "Error reopening application"), "error");
    }
  };

  const toYMD = (d) => {
    if (!d) return "";
    const date = new Date(d);
    if (isNaN(date.getTime())) return "";
    return date.toISOString().split('T')[0];
  };

  const counts = useMemo(() => {
    return {
      pending: rows.filter(r => r.status === "Pending").length,
      completed: rows.filter(r => r.status === "Approved").length,
      cancelled: rows.filter(r => ["Cancelled", "Rejected"].includes(r.status)).length
    };
  }, [rows]);

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      const appliedDate = toYMD(r.advance_date);
      const inDate =
        (!filters.start || appliedDate >= filters.start) &&
        (!filters.end || appliedDate <= filters.end);
      const matchApp = !filters.appNo || String(r.advance_id).includes(filters.appNo.trim());
      const matchEmp = !filters.empId || String(r.empid).includes(filters.empId.trim());
      const q = filters.q.toLowerCase();
      const matchQ = !q || [r.ename, r.unit, r.designation, r.reason].some((v) => v && v.toLowerCase().includes(q));
      
      const targetStatuses = 
        tab === "pending" ? ["Pending"] : 
        tab === "completed" ? ["Approved"] : 
        ["Cancelled", "Rejected"];

      return inDate && matchApp && matchEmp && matchQ && targetStatuses.includes(r.status);
    });
  }, [filters, rows, tab]);

  const dedupedRows = React.useMemo(() => {
    const seen = new Set();
    return filtered.filter((row) => {
      if (seen.has(row.advance_id)) return false;
      seen.add(row.advance_id);
      return true;
    });
  }, [filtered]);

  return (
    <Box sx={{ p: 3, bgcolor: "#f5f7fa", minHeight: "100vh" }}>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 2 }}>
        Advance Approval
      </Typography>

      <Card sx={{ borderRadius: 2, boxShadow: "0 2px 12px rgba(16,24,40,0.06)", mb: 2 }}>
        <CardContent sx={{ pb: 1.5 }}>
          <Stack direction="row" spacing={2} flexWrap="wrap">
            <TextField
              label="Select Start Date"
              type="date"
              value={filters.start}
              onChange={(e) => setFilters((s) => ({ ...s, start: e.target.value }))}
              InputLabelProps={{ shrink: true }}
              size="small"
            />
            <TextField
              label="Select End Date"
              type="date"
              value={filters.end}
              onChange={(e) => setFilters((s) => ({ ...s, end: e.target.value }))}
              InputLabelProps={{ shrink: true }}
              size="small"
            />
            <TextField
              label="Application No"
              value={filters.appNo}
              onChange={(e) => setFilters((s) => ({ ...s, appNo: e.target.value }))}
              size="small"
            />
            <TextField
              label="Employee Id"
              value={filters.empId}
              onChange={(e) => setFilters((s) => ({ ...s, empId: e.target.value }))}
              size="small"
            />
            <TextField
              label="Search"
              value={filters.q}
              onChange={(e) => setFilters((s) => ({ ...s, q: e.target.value }))}
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
            <Tooltip title="More filters">
              <IconButton size="small">
                <FilterListIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Button variant="outlined" size="small" startIcon={<RefreshIcon />} onClick={fetchPendingAdvances}>
              Refresh
            </Button>
            <Button variant="outlined" size="small" startIcon={<ClearIcon />} onClick={clearFilters}>
              Clear
            </Button>
          </Stack>

          <Tabs value={tab} onChange={(e, v) => setTab(v)} sx={{ mt: 2 }}>
            <Tab value="pending" label={`Pending (${counts.pending})`} />
            <Tab value="completed" label={`Completed (${counts.completed})`} />
            <Tab value="cancelled" label={`Cancelled (${counts.cancelled})`} />
          </Tabs>
        </CardContent>
      </Card>

      <Card sx={{ borderRadius: 2, boxShadow: "0 2px 12px rgba(16,24,40,0.06)" }}>
        <Box
          sx={{
            px: 2,
            py: 1.5,
            bgcolor: "#02AAB0",
            color: "#fff",
            borderTopLeftRadius: 8,
            borderTopRightRadius: 8,
          }}
        >
          <Typography fontWeight={700}>Pending Advance Approval Details</Typography>
        </Box>
        <CardContent sx={{ pt: 1 }}>
          <div style={{ height: 520, width: "100%" }}>
            <DataGrid
              rows={dedupedRows}
              columns={columns}
              getRowId={(row) => `${row.advance_id}_${row.advance_date}`}
              pageSizeOptions={[10, 25, 50]}
              initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
              disableColumnMenu
              sx={{
                border: 0,
                "& .MuiDataGrid-columnHeaders": { bgcolor: "#f2f4f7", fontWeight: 700 },
                "& .MuiDataGrid-row:hover": { bgcolor: "#f8fafc" },
                "& .MuiDataGrid-cell": { fontSize: ".92rem" },
              }}
            />
          </div>
        </CardContent>
      </Card>

      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={closeDrawer}
        sx={{ zIndex: (theme) => theme.zIndex.drawer + 100 }}
        PaperProps={{
          sx: {
            width: 520,
            borderLeft: "1px solid #e5e7eb",
            display: "flex",
            flexDirection: "column",
            height: "100vh",
          },
        }}
      >
        <Box
          sx={{
            p: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid #e5e7eb",
            flexShrink: 0,
          }}
        >
          <Typography variant="h6" fontWeight={700}>
            Advance Approval
          </Typography>
          <IconButton onClick={closeDrawer}>
            <CloseIcon />
          </IconButton>
        </Box>

        <Box sx={{ flex: 1, overflowY: "auto", p: 2 }}>
          {selected && (
            <>
              <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                <Avatar sx={{ bgcolor: "#0ea5e9" }}>{selected.ename?.[0]}</Avatar>
                <Box>
                  <Typography fontWeight={700}>{selected.ename}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Emp ID: {selected.empid} • {selected.designation} • {selected.unit}
                  </Typography>
                </Box>
              </Stack>

              <Card variant="outlined" sx={{ mb: 2 }}>
                <CardContent sx={{ py: 1.5 }}>
                  <Typography fontWeight={700} sx={{ mb: 1 }}>
                    Advance Details
                  </Typography>
                  <Stack direction="column" spacing={1}>
                    <Typography>
                      <b>Application No:</b> {selected.advance_id}
                    </Typography>
                    <Typography>
                      <b>Date:</b> {formatDateDMY(selected.advance_date)}
                    </Typography>
                    <Typography>
                      <b>Employee:</b> {selected.ename} (ID: {selected.empid})
                    </Typography>
                    <Typography>
                      <b>Unit:</b> {selected.unit}
                    </Typography>
                    <Typography>
                      <b>Designation:</b> {selected.designation}
                    </Typography>
                    <Typography>
                      <b>Advance Amount:</b> {selected.advance_amount}
                    </Typography>
                    <Typography>
                      <b>Reason:</b> {selected.reason}
                    </Typography>
                    <Typography>
                      <b>Status:</b> {selected.status}
                    </Typography>
                    <Typography>
                      <b>Installments:</b> {selected.no_of_installments} × ₹{Number(selected.monthly_installment || 0).toLocaleString('en-IN')}
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>

              <Card variant="outlined" sx={{ mb: 2, border: '1px solid #e0e0e0' }}>
                <CardContent sx={{ py: 1.5 }}>
                  <Typography fontWeight={700} sx={{ mb: 1, color: '#1565c0', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Box component="span" sx={{ width: 4, height: 16, bgcolor: '#1565c0', borderRadius: 0.5, display: 'inline-block' }} />
                    Deduction Schedule
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                    Configure monthly deduction installments. Adjust amounts if needed — total must match advance amount.
                  </Typography>
                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={4}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Installments</InputLabel>
                        <Select
                          value={sanction.editInstallments}
                          label="Installments"
                          onChange={(e) => {
                            const v = e.target.value;
                            const sched = generateSchedule(sanction.editFromMonth, sanction.editFromYear, v, selected.advance_amount);
                            setSanction(prev => ({ ...prev, editInstallments: v, schedule: sched }));
                          }}
                        >
                          {[1, 2, 3, 4, 5, 6].map(n => (
                            <MenuItem key={n} value={n}>{n} month{n > 1 ? 's' : ''}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={4}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Start Month</InputLabel>
                        <Select
                          value={sanction.editFromMonth}
                          label="Start Month"
                          onChange={(e) => {
                            const v = e.target.value;
                            const sched = generateSchedule(v, sanction.editFromYear, sanction.editInstallments, selected.advance_amount);
                            setSanction(prev => ({ ...prev, editFromMonth: v, schedule: sched }));
                          }}
                        >
                          {months.map(m => (
                            <MenuItem key={m.value} value={m.value}>{m.label}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={4}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Start Year</InputLabel>
                        <Select
                          value={sanction.editFromYear}
                          label="Start Year"
                          onChange={(e) => {
                            const v = e.target.value;
                            const sched = generateSchedule(sanction.editFromMonth, v, sanction.editInstallments, selected.advance_amount);
                            setSanction(prev => ({ ...prev, editFromYear: v, schedule: sched }));
                          }}
                        >
                          {[2024, 2025, 2026, 2027, 2028, 2029, 2030].map(y => (
                            <MenuItem key={y} value={y}>{y}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>
                  {sanction.schedule.length > 0 && (
                    <>
                      <Box sx={{ border: '1px solid #e0e0e0', borderRadius: 1, overflow: 'hidden' }}>
                        <Box sx={{ display: 'flex', bgcolor: '#f5f5f5', borderBottom: '1px solid #e0e0e0', px: 1.5, py: 0.75 }}>
                          <Box sx={{ width: 40, fontWeight: 600, fontSize: 12, color: '#666' }}>#</Box>
                          <Box sx={{ flex: 1, fontWeight: 600, fontSize: 12, color: '#666' }}>Month</Box>
                          <Box sx={{ flex: 1, fontWeight: 600, fontSize: 12, color: '#666' }}>Year</Box>
                          <Box sx={{ flex: 1, fontWeight: 600, fontSize: 12, color: '#666', textAlign: 'right' }}>Amount (₹)</Box>
                        </Box>
                        {sanction.schedule.map((entry, i) => (
                          <Box key={i} sx={{ display: 'flex', alignItems: 'center', px: 1.5, py: 0.5, borderBottom: i < sanction.schedule.length - 1 ? '1px solid #f0f0f0' : 'none', bgcolor: i % 2 === 0 ? 'white' : '#fafafa' }}>
                            <Box sx={{ width: 40, fontSize: 13, color: '#666' }}>{i + 1}</Box>
                            <Box sx={{ flex: 1, fontSize: 13 }}>{months.find(m => m.value === entry.month)?.label}</Box>
                            <Box sx={{ flex: 1, fontSize: 13 }}>{entry.year}</Box>
                            <Box sx={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
                              <TextField
                                size="small"
                                type="number"
                                value={entry.amount}
                                onChange={(e) => updateScheduleAmount(i, e.target.value)}
                                sx={{ width: 120, '& .MuiInputBase-input': { textAlign: 'right', fontSize: 13, py: 0.5 } }}
                              />
                            </Box>
                          </Box>
                        ))}
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1, gap: 2 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          Total: ₹{sanction.schedule.reduce((s, e) => s + (parseFloat(e.amount) || 0), 0).toLocaleString('en-IN')}
                        </Typography>
                        <Typography variant="body2" sx={{
                          fontWeight: 600,
                          color: Math.abs(sanction.schedule.reduce((s, e) => s + (parseFloat(e.amount) || 0), 0) - parseFloat(selected.advance_amount)) <= 1 ? '#2e7d32' : '#c62828'
                        }}>
                          {Math.abs(sanction.schedule.reduce((s, e) => s + (parseFloat(e.amount) || 0), 0) - parseFloat(selected.advance_amount)) <= 1 ? '✓ Balanced' : '✗ Mismatch'}
                        </Typography>
                      </Box>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card variant="outlined" sx={{ mb: 2 }}>
                <CardContent sx={{ py: 1.5 }}>
                  <Typography fontWeight={700} sx={{ mb: 1 }}>
                    Approval Remarks
                  </Typography>
                  <TextField
                    label="Remarks (optional)"
                    value={sanction.remarks}
                    onChange={(e) => setSanction({ remarks: e.target.value })}
                    multiline
                    rows={4}
                    sx={{ width: "100%" }}
                  />
                </CardContent>
              </Card>
            </>
          )}
        </Box>

        <Box
          sx={{
            p: 2,
            borderTop: "1px solid #e5e7eb",
            backgroundColor: "#fff",
            flexShrink: 0,
          }}
        >
          <Stack direction="row" spacing={1}>
            <Button
              variant="contained"
              color="success"
              startIcon={<CheckCircleIcon />}
              fullWidth
              onClick={onApprove}
            >
              Approve
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<CancelIcon />}
              fullWidth
              onClick={onReject}
            >
              Reject
            </Button>
          </Stack>
        </Box>
      </Drawer>
    </Box>
  );
}

