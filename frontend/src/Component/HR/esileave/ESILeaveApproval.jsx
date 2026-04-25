import React, { useEffect, useMemo, useState } from "react";
import {
  Box, Card, CardContent, Typography, Tabs, Tab, TextField, InputAdornment,
  IconButton, Button, Stack, Drawer, Avatar, Tooltip,
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

export default function ESILeaveApprovalPage() {
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

  const fetchPendingESILeaves = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/esileave/pending`);
      console.log("API Response:", res.data);
      setRows(res.data);
    } catch (err) {
      console.error("Failed to load ESI leave applications", err);
    }
  };

  useEffect(() => {
    fetchPendingESILeaves();
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
    {
      field: "approve",
      headerName: "Approve",
      width: 110,
      sortable: false,
      renderCell: (params) => (
        <Button size="small" variant="text" onClick={() => openDrawer(params.row)}>
          Approve
        </Button>
      ),
    },
    { field: "esi_leave_id", headerName: "ESI Leave App #", width: 160 },
    { field: "esi_leave_date", headerName: "Date", width: 160 },
    { field: "empid", headerName: "Employee ID", width: 100 },
    { field: "ename", headerName: "Employee Name", width: 200 },
    { field: "unit", headerName: "Unit", width: 90 },
    { field: "designation", headerName: "Designation", width: 150 },
    { field: "esi_leave_from", headerName: "From Date", width: 120 },
    { field: "esi_leave_to", headerName: "To Date", width: 120 },
    { field: "no_of_days", headerName: "No. of Days", width: 100 },
    { field: "reason", headerName: "Reason", width: 200 },
    { field: "status", headerName: "Status", width: 100 },
  ], []);

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
  };

  const onApprove = async () => {
    if (!selected || !selected.esi_leave_id) {
      alert("No ESI leave application selected.");
      return;
    }

    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/esileave/approve`, {
        esi_leave_id: selected.esi_leave_id,
        status: "Approved",
        remarks: sanction.remarks,
      });

      showToast("ESI leave application approved successfully ✅", "success");
      await fetchPendingESILeaves();
      closeDrawer();
    } catch (err) {
      console.error("Approval failed:", err);
      const errorMessage = err.response?.data?.message || err.message;
      showToast(errorMessage, "error");
    }
  };

  const onReject = async () => {
    if (!selected || !selected.esi_leave_id) {
      alert("No ESI leave application selected.");
      return;
    }

    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/esileave/approve`, {
        esi_leave_id: selected.esi_leave_id,
        status: "Rejected",
        remarks: sanction.remarks,
      });

      showToast("ESI leave application rejected successfully", "success");
      await fetchPendingESILeaves();
      closeDrawer();
    } catch (err) {
      console.error("Rejection failed:", err);
      const errorMessage = err.response?.data?.message || err.message;
      showToast(errorMessage, "error");
    }
  };

  const filtered = useMemo(() => {
    return rows.filter(r => {
      const inDate =
        (!filters.start || new Date(r.esi_leave_date) >= new Date(filters.start)) &&
        (!filters.end || new Date(r.esi_leave_date) <= new Date(filters.end));
      const matchApp = !filters.appNo || String(r.esi_leave_id).includes(filters.appNo.trim());
      const matchEmp = !filters.empId || String(r.empid).includes(filters.empId.trim());
      const q = filters.q.toLowerCase();
      const matchQ = !q || [r.ename, r.unit, r.designation, r.reason].some(v => v.toLowerCase().includes(q));
      return inDate && matchApp && matchEmp && matchQ && r.status === "Pending";
    });
  }, [filters, rows]);

  const dedupedRows = React.useMemo(() => {
    const seen = new Set();
    return filtered.filter(row => {
      if (seen.has(row.esi_leave_id)) return false;
      seen.add(row.esi_leave_id);
      return true;
    });
  }, [filtered]);

  return (
    <Box sx={{ p: 3, bgcolor: "#f5f7fa", minHeight: "100vh" }}>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 2 }}>
        ESI Leave Approval
      </Typography>

      <Card sx={{ borderRadius: 2, boxShadow: "0 2px 12px rgba(16,24,40,0.06)", mb: 2 }}>
        <CardContent sx={{ pb: 1.5 }}>
          <Stack direction="row" spacing={2} flexWrap="wrap">
            <TextField label="Select Start Date" type="date" value={filters.start}
              onChange={(e) => setFilters(s => ({ ...s, start: e.target.value }))}
              InputLabelProps={{ shrink: true }} size="small" />
            <TextField label="Select End Date" type="date" value={filters.end}
              onChange={(e) => setFilters(s => ({ ...s, end: e.target.value }))}
              InputLabelProps={{ shrink: true }} size="small" />
            <TextField label="Application No" value={filters.appNo}
              onChange={(e) => setFilters(s => ({ ...s, appNo: e.target.value }))} size="small" />
            <TextField label="Employee Id" value={filters.empId}
              onChange={(e) => setFilters(s => ({ ...s, empId: e.target.value }))} size="small" />
            <TextField label="Search" value={filters.q}
              onChange={(e) => setFilters(s => ({ ...s, q: e.target.value }))} size="small"
              InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }} />
            <Tooltip title="More filters"><IconButton size="small"><FilterListIcon fontSize="small" /></IconButton></Tooltip>
            <Button variant="outlined" size="small" startIcon={<RefreshIcon />} onClick={fetchPendingESILeaves}>Refresh</Button>
            <Button variant="outlined" size="small" startIcon={<ClearIcon />} onClick={clearFilters}>Clear</Button>
          </Stack>

          <Tabs value={tab} onChange={(_, v) => setTab(v)} textColor="primary" indicatorColor="primary" sx={{ mt: 2 }}>
            <Tab value="pending" label="Pending ESI Leave Approval Details" />
            <Tab value="completed" label="Completed ESI Leave Approval Details" />
            <Tab value="cancelled" label="Cancelled ESI Leave Applications" />
          </Tabs>
        </CardContent>
      </Card>

      <Card sx={{ borderRadius: 2, boxShadow: "0 2px 12px rgba(16,24,40,0.06)" }}>
        <Box sx={{ px: 2, py: 1.5, bgcolor: "#02AAB0", color: "#fff", borderTopLeftRadius: 8, borderTopRightRadius: 8 }}>
          <Typography fontWeight={700}>Pending ESI Leave Approval Details</Typography>
        </Box>
        <CardContent sx={{ pt: 1 }}>
          <div style={{ height: 520, width: "100%" }}>
            <DataGrid
              rows={dedupedRows}
              columns={columns}
              getRowId={(row) => `${row.esi_leave_id}_${row.esi_leave_date}`}
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

      <Drawer anchor="right" open={drawerOpen} onClose={closeDrawer}
        sx={{ zIndex: (theme) => theme.zIndex.drawer + 100 }}
        PaperProps={{ sx: { width: 520, borderLeft: "1px solid #e5e7eb", display: "flex", flexDirection: "column", height: "100vh" } }}>
        <Box sx={{ p: 2, display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #e5e7eb", flexShrink: 0 }}>
          <Typography variant="h6" fontWeight={700}>ESI Leave Approval</Typography>
          <IconButton onClick={closeDrawer}><CloseIcon /></IconButton>
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
                  <Typography fontWeight={700} sx={{ mb: 1 }}>ESI Leave Details</Typography>
                  <Stack direction="column" spacing={1}>
                    <Typography><b>Application No:</b> {selected.esi_leave_id}</Typography>
                    <Typography><b>Date:</b> {formatDateDMY(selected.esi_leave_date)}</Typography>
                    <Typography><b>Employee:</b> {selected.ename} (ID: {selected.empid})</Typography>
                    <Typography><b>Unit:</b> {selected.unit}</Typography>
                    <Typography><b>Designation:</b> {selected.designation}</Typography>
                    <Typography><b>From Date:</b> {formatDateDMY(selected.esi_leave_from)}</Typography>
                    <Typography><b>To Date:</b> {formatDateDMY(selected.esi_leave_to)}</Typography>
                    <Typography><b>No. of Days:</b> {selected.no_of_days}</Typography>
                    <Typography><b>Reason:</b> {selected.reason}</Typography>
                    <Typography><b>Status:</b> {selected.status}</Typography>
                  </Stack>
                </CardContent>
              </Card>

              <Card variant="outlined" sx={{ mb: 2 }}>
                <CardContent sx={{ py: 1.5 }}>
                  <Typography fontWeight={700} sx={{ mb: 1 }}>Approval Remarks</Typography>
                  <TextField label="Remarks (optional)" value={sanction.remarks}
                    onChange={(e) => setSanction({ remarks: e.target.value })} multiline rows={4} sx={{ width: "100%" }} />
                </CardContent>
              </Card>
            </>
          )}
        </Box>

        <Box sx={{ p: 2, borderTop: "1px solid #e5e7eb", backgroundColor: "#fff", flexShrink: 0 }}>
          <Stack direction="row" spacing={1}>
            <Button variant="contained" color="success" startIcon={<CheckCircleIcon />} fullWidth onClick={onApprove}>Approve</Button>
            <Button variant="outlined" color="error" startIcon={<CancelIcon />} fullWidth onClick={onReject}>Reject</Button>
          </Stack>
        </Box>
      </Drawer>
    </Box>
  );
}
