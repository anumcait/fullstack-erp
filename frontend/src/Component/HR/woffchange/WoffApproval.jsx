import React, { useEffect, useMemo, useState } from "react";
import {
  Box, Card, CardContent, Typography, Tabs, Tab, TextField, InputAdornment,
  IconButton, Button, Stack, Drawer, Avatar, Tooltip, Chip, Divider, Alert,
  Accordion, AccordionSummary, AccordionDetails, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Menu, MenuItem
} from "@mui/material";
import { DataGrid, GridToolbarExport } from "@mui/x-data-grid";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import CloseIcon from "@mui/icons-material/Close";
import RefreshIcon from "@mui/icons-material/Refresh";
import ClearIcon from "@mui/icons-material/Clear";
import PrintIcon from "@mui/icons-material/Print";
import DownloadIcon from "@mui/icons-material/Download";
import HistoryIcon from "@mui/icons-material/History";
import CheckIcon from "@mui/icons-material/Check";
import AddIcon from "@mui/icons-material/Add";
import { useToast } from "../../../context/ToastContext";
import axios from 'axios';

export default function WoffApprovalPage() {
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
  const [sanction, setSanction] = useState({ remarks: "" });
  const [rows, setRows] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchPendingWoffs = async () => {
    setLoading(true);
    try {
      const _res = await axios.get(`${import.meta.env.VITE_API_URL}/api/woff/all`);
      setRows(_res.data);
    } catch (err) {
      console.error("Failed to load woff applications", err);
      showToast("Failed to load applications", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingWoffs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [anchorEl, setAnchorEl] = useState(null);
  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const exportToCSV = () => {
    // CSV export handled by DataGrid toolbar
  };

  const columns = useMemo(() => [
    ...(tab === "pending" ? [{
      field: "approve",
      headerName: "Action",
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Button size="small" variant="contained" color="success" startIcon={<CheckIcon />} 
            onClick={() => openDrawer(params.row)} disabled={loading}>Approve</Button>
        </Box>
      ),
    }] : []),
    ...(tab === "completed" ? [{
      field: "cancel",
      headerName: "Action",
      width: 140,
      sortable: false,
      renderCell: (params) => (
        <Button size="small" variant="outlined" color="error" startIcon={<CancelIcon />} onClick={() => handleCancel(params.row)}>Cancel Approval</Button>
      ),
    }] : []),
    ...(tab === "cancelled" ? [{
      field: "reopen",
      headerName: "Action",
      width: 140,
      sortable: false,
      renderCell: (params) => (
        <Button size="small" variant="outlined" color="primary" startIcon={<AddIcon />} onClick={() => handleReopen(params.row)}>Re-process</Button>
      ),
    }] : []),
    { field: "woff_id", headerName: "App #", width: 100 },
    { field: "woff_date", headerName: "Entry Date", width: 140,
      valueGetter: (value) => value ? formatDateTime24Dot(value) : ""
    },
    { field: "empid", headerName: "Emp ID", width: 90 },
    { field: "ename", headerName: "Employee Name", width: 200 },
    { field: "status", headerName: "Status", width: 130,
      renderCell: (params) => (
        <Chip 
          label={params.value} 
          size="small" 
          color={params.value === "Approved" ? "success" : ["Cancelled", "Rejected"].includes(params.value) ? "error" : "warning"}
          variant="filled"
        />
      )
    },
    { field: "unit", headerName: "Unit", width: 90 },
    { field: "division", headerName: "Division", width: 110 },
    { field: "designation", headerName: "Designation", width: 150 },
    { field: "current_woff_day", headerName: "Current Day", width: 120 },
    { field: "requested_woff_day", headerName: "Requested Day", width: 120 },
    { field: "woff_from_date", headerName: "From Date", width: 110,
      valueGetter: (value) => value ? formatDateDMY(value) : ""
    },
    { field: "woff_to_date", headerName: "To Date", width: 110,
      valueGetter: (value) => value ? formatDateDMY(value) : ""
    },
    { field: "reason", headerName: "Reason", flex: 1, minWidth: 180 },
    { field: "remarks", headerName: "HR Remarks", width: 180 },
    { field: "approved_by", headerName: "Approved By", width: 120 },
    { field: "approved_date", headerName: "Approved On", width: 140,
      valueGetter: (value) => value ? formatDateTime24Dot(value) : ""
    },
  ], [tab, loading]);

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

  const openDrawer = (row) => {
    setSelected(row);
    setSanction({ remarks: "" });
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setSelected(null);
    setSanction({ remarks: "" });
  };

  const onApprove = async () => {
    if (!selected || !selected.woff_id) {
      alert("No woff application selected.");
      return;
    }

    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/woff/approve`, {
        woff_id: selected.woff_id,
        status: "Approved",
        remarks: sanction.remarks,
      });

      showToast("Woff application approved successfully ✅", "success");
      await fetchPendingWoffs();
      closeDrawer();
    } catch (err) {
      console.error("Approval failed:", err);
      const errorMessage = err.response?.data?.message || err.message;
      showToast(errorMessage, "error");
    }
  };

  const onReject = async () => {
    if (!selected || !selected.woff_id) {
      alert("No woff application selected.");
      return;
    }
    if (!sanction.remarks?.trim()) {
      showToast("Rejection reason is mandatory", "error");
      return;
    }

    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/woff/approve`, {
        woff_id: selected.woff_id,
        status: "Rejected",
        remarks: sanction.remarks,
      });

      showToast("Woff application rejected", "success");
      await fetchPendingWoffs();
      closeDrawer();
    } catch (err) {
      console.error("Rejection failed:", err);
      const errorMessage = err.response?.data?.message || err.message;
      showToast(errorMessage, "error");
    }
  };

  const handleCancel = async (row) => {
    const reason = window.prompt("Enter reason for cancellation:");
    if (reason === null) return;
    try {
      const _res = await axios.post(`${import.meta.env.VITE_API_URL}/api/woff/cancel`, {
        woff_id: row.woff_id,
        remarks: reason
      });
      if (_res.data.success) {
        showToast("Woff approval cancelled", "success");
        await fetchPendingWoffs();
      } else {
        showToast(_res.data.message, "error");
      }
    } catch (err) {
      console.error("Cancel failed:", err);
      showToast("Error cancelling Woff", "error");
    }
  };

  const handleReopen = async (row) => {
    if (!window.confirm(`Are you sure you want to re-process Woff #${row.woff_id}?`)) return;
    try {
      const _res = await axios.post(`${import.meta.env.VITE_API_URL}/api/woff/reopen`, {
        woff_id: row.woff_id
      });
      if (_res.data.success) {
        showToast("Application reopened", "success");
        await fetchPendingWoffs();
      } else {
        showToast(_res.data.message, "error");
      }
    } catch (err) {
      console.error("Reopen failed:", err);
      showToast("Error reopening application", "error");
    }
  };

  const handleBulkApprove = async () => {
    if (!selectedRows.length) return;
    if (!window.confirm(`Approve ${selectedRows.length} applications?`)) return;
    try {
      for (const id of selectedRows) {
        await axios.post(`${import.meta.env.VITE_API_URL}/api/woff/approve`, {
          woff_id: id,
          status: "Approved",
          remarks: "Bulk approved"
        });
      }
      showToast(`${selectedRows.length} applications approved`, "success");
      setSelectedRows([]);
      await fetchPendingWoffs();
    } catch (error) {
      console.error("Bulk approval failed:", error);
      showToast("Bulk approval failed", "error");
    }
  };

  const handleBulkReject = async () => {
    if (!selectedRows.length) return;
    const reason = prompt("Rejection reason (required for bulk):");
    if (!reason) return;
    try {
      for (const id of selectedRows) {
        await axios.post(`${import.meta.env.VITE_API_URL}/api/woff/approve`, {
          woff_id: id,
          status: "Rejected",
          remarks: reason
        });
      }
      showToast(`${selectedRows.length} applications rejected`, "success");
      setSelectedRows([]);
      await fetchPendingWoffs();
    } catch (error) {
      console.error("Bulk rejection failed:", error);
      showToast("Bulk rejection failed", "error");
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
    return rows.filter(r => {
      const appliedDate = toYMD(r.woff_date);
      const inDate =
        (!filters.start || appliedDate >= filters.start) &&
        (!filters.end || appliedDate <= filters.end);
      const matchApp = !filters.appNo || String(r.woff_id).includes(filters.appNo.trim());
      const matchEmp = !filters.empId || String(r.empid).includes(filters.empId.trim());
      const q = filters.q.toLowerCase();
      const matchQ = !q || [r.ename, r.unit, r.division, r.designation, r.reason].some(v => v && v.toLowerCase().includes(q));
      
      const targetStatuses = 
        tab === "pending" ? ["Pending"] : 
        tab === "completed" ? ["Approved"] : 
        ["Cancelled", "Rejected"];

      return inDate && matchApp && matchEmp && matchQ && targetStatuses.includes(r.status);
    });
  }, [filters, rows, tab]);

  const dedupedRows = React.useMemo(() => {
    const seen = new Set();
    return filtered.filter(row => {
      if (seen.has(row.woff_id)) return false;
      seen.add(row.woff_id);
      return true;
    });
  }, [filtered]);

  const getApprovalStep = (status) => {
    if (status === "Approved") return 3;
    if (status === "Rejected") return 2;
    if (status === "Cancelled") return 1;
    return 0; // Pending
  };

  return (
    <Box sx={{ p: 2, bgcolor: "#f5f7fa", minHeight: "100vh" }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" fontWeight={700} color="#1e293b">
          Weekly Off Change Approval
        </Typography>
        {tab === "pending" && selectedRows.length > 0 && (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button variant="contained" color="success" startIcon={<CheckIcon />} size="small" onClick={handleBulkApprove}>Approve Selected ({selectedRows.length})</Button>
            <Button variant="outlined" color="error" startIcon={<CancelIcon />} size="small" onClick={handleBulkReject}>Reject Selected</Button>
          </Box>
        )}
      </Box>

      <Card sx={{ borderRadius: 2, boxShadow: "0 2px 12px rgba(16,24,40,0.06)", mb: 2 }}>
        <CardContent sx={{ pb: 1.5 }}>
          <Stack direction="row" spacing={2} flexWrap="wrap" sx={{ mb: 2 }}>
            <TextField label="From Date" type="date" value={filters.start}
              onChange={(e) => setFilters(s => ({ ...s, start: e.target.value }))}
              InputLabelProps={{ shrink: true }} size="small" />
            <TextField label="To Date" type="date" value={filters.end}
              onChange={(e) => setFilters(s => ({ ...s, end: e.target.value }))}
              InputLabelProps={{ shrink: true }} size="small" />
            <TextField label="App #" value={filters.appNo}
              onChange={(e) => setFilters(s => ({ ...s, appNo: e.target.value }))} size="small" />
            <TextField label="Emp ID" value={filters.empId}
              onChange={(e) => setFilters(s => ({ ...s, empId: e.target.value }))} size="small" />
            <TextField label="Search" value={filters.q}
              onChange={(e) => setFilters(s => ({ ...s, q: e.target.value }))} size="small"
              InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }} />
            <Tooltip title="More filters"><IconButton size="small" onClick={handleMenuOpen}><FilterListIcon fontSize="small" /></IconButton></Tooltip>
            <Button variant="outlined" size="small" startIcon={<RefreshIcon />} onClick={fetchPendingWoffs} disabled={loading}>Refresh</Button>
          </Stack>

          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose} transformOrigin={{ horizontal: 'right', vertical: 'top' }} anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}>
            <MenuItem onClick={() => { setFilters(f => ({ ...f, start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], end: new Date().toISOString().split("T")[0] })); handleMenuClose(); }}>Last 7 Days</MenuItem>
            <MenuItem onClick={() => { setFilters(f => ({ ...f, start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], end: new Date().toISOString().split("T")[0] })); handleMenuClose(); }}>Last 30 Days</MenuItem>
            <MenuItem onClick={() => { setFilters(f => ({ ...f, start: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], end: new Date().toISOString().split("T")[0] })); handleMenuClose(); }}>Last 90 Days</MenuItem>
            <Divider />
            <MenuItem onClick={() => { setFilters({ start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], end: new Date().toISOString().split("T")[0], appNo: "", empId: "", q: "" }); handleMenuClose(); }}><ClearIcon fontSize="small" sx={{ mr: 1 }} />Clear All Filters</MenuItem>
          </Menu>

          <Tabs value={tab} onChange={(e, v) => setTab(v)} sx={{ mt: 1 }} variant="fullWidth" indicatorColor="primary" textColor="primary">
            <Tab value="pending" label={`Pending (${counts.pending})`} icon={<HistoryIcon />} />
            <Tab value="completed" label={`Completed (${counts.completed})`} icon={<CheckCircleIcon />} />
            <Tab value="cancelled" label={`Cancelled (${counts.cancelled})`} icon={<CancelIcon />} />
          </Tabs>
        </CardContent>
      </Card>

      <Card sx={{ borderRadius: 2, boxShadow: "0 2px 12px rgba(16,24,40,0.06)" }}>
        <Box sx={{ px: 2, py: 1.5, bgcolor: "#02AAB0", color: "#fff", borderTopLeftRadius: 8, borderTopRightRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography fontWeight={700} variant="h6">Applications List</Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Export CSV"><IconButton size="small" color="inherit" onClick={exportToCSV}><DownloadIcon /></IconButton></Tooltip>
            <Tooltip title="Print"><IconButton size="small" color="inherit"><PrintIcon /></IconButton></Tooltip>
          </Box>
        </Box>
        <CardContent sx={{ pt: 1 }}>
          {dedupedRows.length === 0 ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 6, color: '#9ca3af' }}>
              <HistoryIcon sx={{ fontSize: 48, mb: 1, opacity: 0.5 }} />
              <Typography variant="h6">No applications found</Typography>
              <Typography variant="body2">Adjust filters or check back later</Typography>
            </Box>
          ) : (
            <div style={{ height: 520, width: "100%" }}>
              <DataGrid
                rows={dedupedRows}
                columns={columns}
                getRowId={(row) => `${row.woff_id}_${row.woff_date}`}
                pageSizeOptions={[10, 25, 50]}
                initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
                disableColumnMenu
                checkboxSelection
                onRowSelectionModelChange={(model) => setSelectedRows(Array.isArray(model) ? model : (model?.ids ? Array.from(model.ids) : []))}
                sx={{
                  border: 0,
                  "& .MuiDataGrid-columnHeaders": { bgcolor: "#f2f4f7", fontWeight: 700 },
                  "& .MuiDataGrid-row:hover": { bgcolor: "#f8fafc" },
                  "& .MuiDataGrid-cell": { fontSize: ".92rem" },
                  "& .MuiDataGrid-row.Mui-selected": { bgcolor: "#e0f2f1 !important" },
                }}
                components={{ Toolbar: GridToolbarExport }}
              />
            </div>
          )}
        </CardContent>
      </Card>

      <Drawer anchor="right" open={drawerOpen} onClose={closeDrawer}
        sx={{ zIndex: (theme) => theme.zIndex.drawer + 100 }}
        PaperProps={{ sx: { width: 580, borderLeft: "1px solid #e5e7eb", display: "flex", flexDirection: "column", height: "100vh" } }}>
        <Box sx={{ p: 2, display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #e5e7eb", flexShrink: 0, bgcolor: '#fff' }}>
          <Typography variant="h6" fontWeight={700} color="#1e293b">Approval Workflow</Typography>
          <IconButton onClick={closeDrawer}><CloseIcon /></IconButton>
        </Box>

        <Box sx={{ flex: 1, overflowY: "auto", p: 2, bgcolor: '#fafafa' }}>
          {selected && (
            <>
              <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                <Avatar sx={{ bgcolor: "#02AAB0", width: 48, height: 48 }}>{selected.ename?.[0]}</Avatar>
                <Box>
                  <Typography variant="h6" fontWeight={700} color="#1e293b">{selected.ename}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Emp ID: {selected.empid} • {selected.designation || '-'} • {selected.unit || '-'} / {selected.division || '-'}
                  </Typography>
                </Box>
              </Stack>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, px: 1 }}>
                {(() => {
                  const st = selected.status || 'Pending';
                  const step = getApprovalStep(st);
                  const labels = ['Submitted', 'Under Review', 'Approved', 'Rejected/Cancelled'];
                  const colors = ['#9e9e9e', '#9e9e9e', '#2e7d32', '#c62828'];
                  return labels.map((lab, i) => (
                    <Box key={i} sx={{ flex: 1, textAlign: 'center', position: 'relative' }}>
                      {i < labels.length - 1 && (
                        <Box sx={{ position: 'absolute', top: 14, left: '50%', width: '100%', height: 2, bgcolor: i < step ? '#2e7d32' : '#e0e0e0', zIndex: 0 }} />
                      )}
                      <Box sx={{
                        width: 28, height: 28, borderRadius: '50%', mx: 'auto', position: 'relative', zIndex: 1,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        bgcolor: i <= step ? (i === 3 ? '#c62828' : '#2e7d32') : '#e0e0e0',
                        color: '#fff', fontSize: 12, fontWeight: 700
                      }}>{i + 1}</Box>
                      <Typography variant="caption" sx={{ color: i <= step ? colors[i] : '#9e9e9e', fontWeight: i <= step ? 700 : 400, display: 'block', mt: 0.5 }}>
                        {lab}
                      </Typography>
                    </Box>
                  ));
                })()}
              </Box>

              <Card variant="outlined" sx={{ mb: 2, border: selected.status === "Approved" ? "2px solid #2e7d32" : selected.status === "Rejected" ? "2px solid #c62828" : "1px solid #e5e7eb" }}>
                <CardContent sx={{ py: 1.5 }}>
                  <Typography fontWeight={700} sx={{ mb: 1.5, color: '#1e293b' }}>Application Details</Typography>
                  <Table size="small">
                    <TableBody>
                      <TableRow><TableCell width="180"><b>Application No:</b></TableCell><TableCell>{selected.woff_id}</TableCell></TableRow>
                      <TableRow><TableCell><b>Entry Date:</b></TableCell><TableCell>{formatDateDMY(selected.woff_date)}</TableCell></TableRow>
                      <TableRow><TableCell><b>Employee:</b></TableCell><TableCell>{selected.ename} (ID: {selected.empid})</TableCell></TableRow>
                      <TableRow><TableCell><b>Unit/Division:</b></TableCell><TableCell>{selected.unit || '-'} / {selected.division || '-'}</TableCell></TableRow>
                      <TableRow><TableCell><b>Designation:</b></TableCell><TableCell>{selected.designation || '-'}</TableCell></TableRow>
                      <TableRow><TableCell><b>Current Woff Day:</b></TableCell><TableCell><Chip label={selected.current_woff_day} size="small" color="primary" variant="outlined" /></TableCell></TableRow>
                      <TableRow><TableCell><b>Requested Woff Day:</b></TableCell><TableCell><Chip label={selected.requested_woff_day} size="small" color="success" variant="outlined" /></TableCell></TableRow>
                      <TableRow><TableCell><b>From Date:</b></TableCell><TableCell>{formatDateDMY(selected.woff_from_date)}</TableCell></TableRow>
                      <TableRow><TableCell><b>To Date:</b></TableCell><TableCell>{formatDateDMY(selected.woff_to_date)}</TableCell></TableRow>
                      <TableRow><TableCell><b>Reason:</b></TableCell><TableCell>{selected.reason || '-'}</TableCell></TableRow>
                      <TableRow><TableCell><b>Current Status:</b></TableCell><TableCell>
                        <Chip 
                          label={selected.status} 
                          size="small" 
                          color={selected.status === "Approved" ? "success" : ["Cancelled", "Rejected"].includes(selected.status) ? "error" : "warning"}
                          variant="filled"
                        />
                      </TableCell></TableRow>
                      {selected.approved_by && (
                        <TableRow><TableCell><b>Approved By:</b></TableCell><TableCell>{selected.approved_by}</TableCell></TableRow>
                      )}
                      {selected.approved_date && (
                        <TableRow><TableCell><b>Approved On:</b></TableCell><TableCell>{formatDateTime24Dot(selected.approved_date)}</TableCell></TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <Card variant="outlined" sx={{ mb: 2 }}>
                <CardContent sx={{ py: 1.5 }}>
                  <Typography fontWeight={700} sx={{ mb: 1, color: '#1e293b' }}>Approval Decision</Typography>
                  <Stack direction="column" spacing={1.5}>
                    <TextField 
                      label={selected.status === "Pending" ? "Remarks (required for rejection)" : "Remarks"} 
                      value={sanction.remarks}
                      onChange={(e) => setSanction({ remarks: e.target.value })} multiline rows={4} sx={{ width: "100%" }} 
                      required={selected.status === "Pending"}
                      helperText={selected.status === "Pending" ? "Required when rejecting" : ""}
                    />
                  </Stack>
                </CardContent>
              </Card>

              <Card variant="outlined" sx={{ mb: 2, bgcolor: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                <CardContent sx={{ py: 1.5 }}>
                  <Typography fontWeight={700} sx={{ mb: 1, color: '#1e293b' }}>Policy Reminder</Typography>
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                    <b>Policy:</b> WOFF changes require 24-hour advance notice. Approved changes reflect in shift schedules immediately.
                    Approved by HR/Department Head. Rejected applications require mandatory remarks.
                  </Typography>
                </CardContent>
              </Card>
            </>
          )}
        </Box>

        <Box sx={{ p: 2, borderTop: "1px solid #e5e7eb", backgroundColor: "#fff", flexShrink: 0 }}>
          <Stack direction="row" spacing={1}>
            <Button variant="contained" color="success" startIcon={<CheckCircleIcon />} fullWidth onClick={onApprove} disabled={!selected || loading}>Approve</Button>
            <Button variant="outlined" color="error" startIcon={<CancelIcon />} fullWidth onClick={onReject} disabled={!selected || loading}>Reject</Button>
          </Stack>
        </Box>
      </Drawer>
    </Box>
  );
}
