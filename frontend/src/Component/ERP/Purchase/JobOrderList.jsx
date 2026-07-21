import React, { useEffect, useState, useCallback } from "react";
import { Box, Card, CardContent, Typography, TextField, Button, Chip, LinearProgress, Tooltip, IconButton, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import AddIcon from "@mui/icons-material/Add";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import RefreshIcon from "@mui/icons-material/Refresh";
import SearchIcon from "@mui/icons-material/Search";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import axios from "axios";
import { useToast } from "../../../context/ToastContext";
import { useNavigate, useSearchParams } from "react-router-dom";
import { downloadJoPdf } from "./PO/joPdf";

const API = "/api/erp/production/orders";

export default function JobOrderList() {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const statusFilter = searchParams.get("status") || "";
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [confirm, setConfirm] = useState({ open: false, id: null });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = { order_type: "Job Order" };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      const { data } = await axios.get(API, { params });
      setRows(data);
    } catch { showToast("Failed to load Job Orders", "error"); }
    finally { setLoading(false); }
  }, [search, statusFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleApproveClick = (id) => {
    setConfirm({ open: true, id });
  };

  const confirmApprove = async () => {
    const id = confirm.id;
    setConfirm({ open: false, id: null });
    try {
      await axios.put(`${API}/${id}/status`, { status: "Released" });
      showToast("Job Order released", "success");
      fetchData();
    } catch { showToast("Failed to release", "error"); }
  };

  const handleViewPdf = async (id) => {
    const newTab = window.open("", "_blank");
    try {
      const url = await downloadJoPdf(id);
      if (newTab) newTab.location.href = url;
      else window.open(url, "_blank");
    } catch {
      if (newTab) newTab.close();
      showToast("Failed to generate PDF", "error");
    }
  };

  const statusChips = [
    { value: "", label: "All" },
    { value: "Planning", label: "Planning" },
    { value: "Released", label: "Released" },
    { value: "In Progress", label: "In Progress" },
    { value: "Completed", label: "Completed" },
    { value: "Cancelled", label: "Cancelled" },
  ];

  const columns = [
    { field: "order_no", headerName: "Job Order #", width: 150 },
    { field: "jo_date", headerName: "JO Date", width: 110, valueGetter: (v) => v || "" },
    { field: "party_name", headerName: "Party", width: 200 },
    { field: "department", headerName: "Department", width: 130 },
    { field: "req_date", headerName: "Req Date", width: 110, valueGetter: (v) => v || "" },
    {
      field: "status", headerName: "Status", width: 130,
      renderCell: (p) => (
        <Chip label={p.value} size="small"
          color={p.value === "Completed" ? "success" : p.value === "Planning" ? "default" : p.value === "Cancelled" ? "error" : p.value === "Released" ? "primary" : "warning"} />
      ),
    },
    { field: "planned_quantity", headerName: "Planned Qty", width: 100, valueGetter: (v) => v ? parseFloat(v).toFixed(2) : "" },
    { field: "produced_quantity", headerName: "Produced", width: 100, valueGetter: (v) => v ? parseFloat(v).toFixed(2) : "" },
    {
      field: "actions", headerName: "Actions", width: 240, sortable: false,
      renderCell: (p) => (
        <Box sx={{ display: "flex", gap: 0.5, alignItems: "center" }}>
          <Tooltip title="View">
            <Button size="small" variant="outlined" startIcon={<VisibilityIcon />}
              onClick={(e) => { e.stopPropagation(); navigate(`/purchase/job-orders/view/${p.row.id}`); }}>
              View
            </Button>
          </Tooltip>
          {p.row.status === "Planning" && (
            <Tooltip title="Edit">
              <IconButton size="small" color="primary"
                onClick={(e) => { e.stopPropagation(); navigate(`/purchase/job-orders/edit/${p.row.id}`); }}>
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          <Tooltip title="View PDF">
            <IconButton size="small" color="secondary"
              onClick={(e) => { e.stopPropagation(); handleViewPdf(p.row.id); }}>
              <PictureAsPdfIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          {p.row.status === "Planning" && (
            <Tooltip title="Release">
              <IconButton size="small" color="success"
                onClick={(e) => { e.stopPropagation(); handleApproveClick(p.row.id); }}>
                <CheckCircleIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ p: 3, maxWidth: 1600 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, gap: 2, flexWrap: "wrap" }}>
        <Typography variant="h4" sx={{ fontWeight: "bold", color: "var(--heading-color)" }}>
          {statusFilter ? `${statusFilter} Job Orders` : "Job Orders"}
        </Typography>
        <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={fetchData}>Refresh</Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate("/purchase/job-orders/add")}>New Job Order</Button>
        </Box>
      </Box>

      <Card sx={{ borderRadius: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
        <CardContent>
          <Box sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap", alignItems: "center" }}>
            <TextField size="small" placeholder="Search order # or party..." value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{ startAdornment: <SearchIcon sx={{ mr: 1, color: "gray" }} /> }}
              sx={{ minWidth: 300 }} />
            <Box sx={{ flex: 1 }} />
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
              {statusChips.map((c) => (
                <Button key={c.value || "all"} size="small"
                  variant={statusFilter === c.value ? "contained" : "text"}
                  color={c.value === "Planning" ? "default" : c.value === "Released" ? "primary" : c.value === "Completed" ? "success" : c.value === "Cancelled" ? "error" : c.value === "In Progress" ? "warning" : "primary"}
                  onClick={() => setSearchParams(c.value ? { status: c.value } : {})}
                  sx={{ fontSize: "0.8rem" }}>
                  {c.label}
                </Button>
              ))}
            </Box>
          </Box>
          {loading && <LinearProgress sx={{ mb: 1 }} />}
          <div style={{ height: 520, width: "100%" }}>
            <DataGrid rows={rows} columns={columns} getRowId={(r) => r.id} pageSizeOptions={[10, 25, 50]}
              onRowClick={(p) => navigate(`/purchase/job-orders/view/${p.row.id}`)}
              initialState={{ pagination: { paginationModel: { pageSize: 25 } } }}
              disableColumnMenu loading={loading}
              sx={{
                border: 0,
                "& .MuiDataGrid-columnHeaders": { bgcolor: "#f2f4f7", fontWeight: 700 },
                "& .MuiDataGrid-row:hover": { bgcolor: "#f8fafc" },
                "& .MuiDataGrid-cell": { fontSize: ".92rem" },
              }} />
          </div>
        </CardContent>
      </Card>

      <Dialog open={confirm.open} onClose={() => setConfirm({ open: false, id: null })}>
        <DialogTitle>Release Job Order?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to release this Job Order? Released orders can be started for production.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirm({ open: false, id: null })}>Cancel</Button>
          <Button onClick={confirmApprove} variant="contained" color="success">Release</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
