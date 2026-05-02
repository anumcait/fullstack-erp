import React, { useEffect, useMemo, useState } from "react";
import {
  Box, Card, CardContent, Typography, Tabs, Tab, TextField, InputAdornment,
  IconButton, Button, Stack, Drawer, Avatar, Tooltip, Chip,
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

export default function TourApprovalPage() {
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
  const [sanction, setSanction] = useState({ approval_remark: "" });
  const [rows, setRows] = useState([]);

  const fetchPendingTours = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/tour/all`);
      console.log("API Response:", res.data);
      setRows(res.data);
    } catch (err) {
      console.error("Failed to load tour applications", err);
    }
  };

  useEffect(() => {
    fetchPendingTours();
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
    { field: "tour_id", headerName: "Tour App #", width: 130 },
    { field: "tour_date", headerName: "Entry Date", width: 140,
      valueGetter: (value) => value ? formatDateDMYHM(value) : ""
    },
    { field: "empid", headerName: "Employee ID", width: 100 },
    { field: "ename", headerName: "Employee Name", width: 200 },
    { field: "purpose", headerName: "Purpose", width: 200 },
    { field: "tour_from_date", headerName: "Tour From", width: 140,
      valueGetter: (value) => value ? formatDateDMYHM(value) : ""
    },
    { field: "tour_to_date", headerName: "Tour To", width: 140,
      valueGetter: (value) => value ? formatDateDMYHM(value) : ""
    },
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
    { field: "approval_remark", headerName: "HR Remarks", flex: 1, minWidth: 150 },
    { field: "unit", headerName: "Unit", width: 90 },
    { field: "division", headerName: "Division", width: 90 },
    { field: "designation", headerName: "Designation", width: 150 },
    { field: "destination", headerName: "Destination", width: 150 },
    { field: "estimated_amount", headerName: "Est. Amount", width: 120, type: "number" },
  ], [tab]);

  function formatDateDMY(dateStr) {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  }

  function formatDateDMYHM(dateStr) {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = String(d.getFullYear()).slice(-2);
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    return `${day}-${month}-${year} ${hours}.${minutes}`;
  }

  const openDrawer = (row) => {
    setSelected(row);
    setSanction({ approval_remark: "" });
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setSelected(null);
  };

  const onApprove = async () => {
    if (!selected || !selected.tour_id) {
      alert("No tour application selected.");
      return;
    }

    try {
      const res = await axios.put(`${import.meta.env.VITE_API_URL}/api/tour/approve/${selected.tour_id}`, {
        status: "Approved",
        approval_remark: sanction.approval_remark,
      });

      showToast("Tour application approved successfully", "success");
      await fetchPendingTours();
      closeDrawer();
    } catch (err) {
      console.error("Approval failed:", err);
      const errorMessage = err.response?.data?.message || err.message;
      showToast(errorMessage, "error");
    }
  };
  const onReject = async () => {
    if (!selected || !selected.tour_id) {
      alert("No tour application selected.");
      return;
    }

    try {
      const res = await axios.put(`${import.meta.env.VITE_API_URL}/api/tour/approve/${selected.tour_id}`, {
        status: "Rejected",
        approval_remark: sanction.approval_remark,
      });

      showToast("Tour application rejected successfully", "success");
      await fetchPendingTours();
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
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/tour/cancel`, {
        tour_id: row.tour_id,
        remarks: reason
      });
      if (res.data.success) {
        showToast("Tour approval cancelled", "success");
        await fetchPendingTours();
      } else {
        showToast(res.data.message, "error");
      }
    } catch (err) {
      console.error("Cancel failed:", err);
      showToast("Error cancelling Tour", "error");
    }
  };

  const handleReopen = async (row) => {
    if (!window.confirm(`Are you sure you want to re-process Tour #${row.tour_id}?`)) return;
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/tour/reopen`, {
        tour_id: row.tour_id
      });
      if (res.data.success) {
        showToast("Application reopened", "success");
        await fetchPendingTours();
      } else {
        showToast(res.data.message, "error");
      }
    } catch (err) {
      console.error("Reopen failed:", err);
      showToast("Error reopening application", "error");
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
      const appliedDate = toYMD(r.tour_date);
      const inDate =
        (!filters.start || appliedDate >= filters.start) &&
        (!filters.end || appliedDate <= filters.end);
      const matchApp = !filters.appNo || String(r.tour_id).includes(filters.appNo.trim());
      const matchEmp = !filters.empId || String(r.empid).includes(filters.empId.trim());
      const q = filters.q.toLowerCase();
      const matchQ = !q || [r.ename, r.unit, r.division, r.designation, r.purpose, r.destination].some((v) => v && v.toLowerCase().includes(q));
      
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
      if (seen.has(row.tour_id)) return false;
      seen.add(row.tour_id);
      return true;
    });
  }, [filtered]);

  return (
    <Box sx={{ p: 1, bgcolor: "#f5f7fa", minHeight: "100vh" }}>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 2 }}>
        Tour Approval
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
            <Button variant="outlined" size="small" startIcon={<RefreshIcon />} onClick={fetchPendingTours}>
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
          <Typography fontWeight={700}>Pending Tour Approval Details</Typography>
        </Box>
        <CardContent sx={{ pt: 1 }}>
          <div style={{ height: 520, width: "100%" }}>
            <DataGrid
              rows={dedupedRows}
              columns={columns}
              getRowId={(row) => `${row.tour_id}_${row.tour_date}`}
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
            Tour Approval
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
                    Tour Details
                  </Typography>
                  <Stack direction="column" spacing={1}>
                    <Typography>
                      <b>Application No:</b> {selected.tour_id}
                    </Typography>
                    <Typography>
                      <b>Application Date:</b> {formatDateDMYHM(selected.tour_date)}
                    </Typography>
                    <Typography>
                      <b>Employee:</b> {selected.ename} (ID: {selected.empid})
                    </Typography>
                    <Typography>
                      <b>Unit/Division:</b> {selected.unit} / {selected.division}
                    </Typography>
                    <Typography>
                      <b>Designation:</b> {selected.designation}
                    </Typography>
                    <Typography>
                      <b>Tour From:</b> {formatDateDMY(selected.tour_from_date)}
                    </Typography>
                    <Typography>
                      <b>Tour To:</b> {formatDateDMY(selected.tour_to_date)}
                    </Typography>
                    <Typography>
                      <b>Purpose:</b> {selected.purpose}
                    </Typography>
                    <Typography>
                      <b>Destination:</b> {selected.destination}
                    </Typography>
                    <Typography>
                      <b>Estimated Amount:</b> {selected.estimated_amount}
                    </Typography>
                    <Typography>
                      <b>Status:</b> {selected.status}
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>

              <Card variant="outlined" sx={{ mb: 2 }}>
                <CardContent sx={{ py: 1.5 }}>
                  <Typography fontWeight={700} sx={{ mb: 1 }}>
                    Approval Remarks
                  </Typography>
                  <TextField
                    label="Remarks (optional)"
                    value={sanction.approval_remark}
                    onChange={(e) => setSanction({ approval_remark: e.target.value })}
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
