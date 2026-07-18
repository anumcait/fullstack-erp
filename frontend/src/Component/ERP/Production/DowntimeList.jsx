import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, Card, CardContent, Typography, TextField, Button, Chip, LinearProgress,
  IconButton, Tooltip, MenuItem
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import RefreshIcon from "@mui/icons-material/Refresh";
import SearchIcon from "@mui/icons-material/Search";
import axios from "axios";
import { useToast } from "../../../context/ToastContext";
import { formatDate } from "../../../utils/format";

const API = "/api/erp/production/downtime";
const STATUS_COLORS = { Open: "error", Resolved: "warning", Closed: "success" };
const CATEGORY_COLORS = { Breakdown: "error", Setup: "info", Maintenance: "warning", "No Material": "default", "No Operator": "default", "Power Failure": "error", Other: "default" };

export default function DowntimeList() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ from: "", to: "", category: "", status: "" });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.from) params.from = filters.from;
      if (filters.to) params.to = filters.to;
      if (filters.category) params.category = filters.category;
      if (filters.status) params.status = filters.status;
      const { data } = await axios.get(API, { params });
      setRows(data);
    } catch { showToast("Failed to load", "error"); }
    finally { setLoading(false); }
  }, [filters]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const columns = [
    { field: "downtime_date", headerName: "Date", width: 110, renderCell: (p) => formatDate(p.value) },
    { field: "machine_name", headerName: "Machine", width: 180 },
    { field: "category", headerName: "Category", width: 130, renderCell: (p) => <Chip label={p.value} size="small" color={CATEGORY_COLORS[p.value] || "default"} /> },
    { field: "duration_minutes", headerName: "Duration (min)", width: 130 },
    { field: "reason", headerName: "Reason", width: 250 },
    { field: "reported_by", headerName: "Reported By", width: 140 },
    { field: "resolved_by", headerName: "Resolved By", width: 140 },
    { field: "status", headerName: "Status", width: 110, renderCell: (p) => <Chip label={p.value} size="small" color={STATUS_COLORS[p.value] || "default"} /> },
    { field: "actions", headerName: "Actions", width: 100, sortable: false, renderCell: (p) => (
      <Box>
        <Tooltip title="View"><IconButton size="small" onClick={() => navigate(`/production/downtime/view/${p.row.id}`)}><VisibilityIcon fontSize="small" /></IconButton></Tooltip>
        <Tooltip title="Edit"><IconButton size="small" onClick={() => navigate(`/production/downtime/edit/${p.row.id}`)}><EditIcon fontSize="small" /></IconButton></Tooltip>
      </Box>
    )},
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: "bold", color: "var(--heading-color)" }}>Down-Time Entry</Typography>
      <Card sx={{ borderRadius: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
        <CardContent>
          <Box sx={{ display: "flex", gap: 1.5, mb: 2, flexWrap: "wrap", alignItems: "center" }}>
            <TextField label="From" type="date" size="small" value={filters.from} onChange={(e) => setFilters((f) => ({ ...f, from: e.target.value }))} InputLabelProps={{ shrink: true }} />
            <TextField label="To" type="date" size="small" value={filters.to} onChange={(e) => setFilters((f) => ({ ...f, to: e.target.value }))} InputLabelProps={{ shrink: true }} />
            <TextField select label="Category" size="small" sx={{ minWidth: 140 }} value={filters.category} onChange={(e) => setFilters((f) => ({ ...f, category: e.target.value }))}>
              <MenuItem value="">All</MenuItem>
              <MenuItem value="Breakdown">Breakdown</MenuItem><MenuItem value="Setup">Setup</MenuItem>
              <MenuItem value="Maintenance">Maintenance</MenuItem><MenuItem value="No Material">No Material</MenuItem>
              <MenuItem value="No Operator">No Operator</MenuItem><MenuItem value="Power Failure">Power Failure</MenuItem>
              <MenuItem value="Other">Other</MenuItem>
            </TextField>
            <TextField select label="Status" size="small" sx={{ minWidth: 100 }} value={filters.status} onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}>
              <MenuItem value="">All</MenuItem><MenuItem value="Open">Open</MenuItem><MenuItem value="Resolved">Resolved</MenuItem><MenuItem value="Closed">Closed</MenuItem>
            </TextField>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate("/production/downtime/add")}>New Entry</Button>
            <Button variant="outlined" startIcon={<RefreshIcon />} onClick={fetchData}>Refresh</Button>
          </Box>
          {loading && <LinearProgress sx={{ mb: 1 }} />}
          <div style={{ height: 520, width: "100%" }}>
            <DataGrid rows={rows} columns={columns} getRowId={(r) => r.id} pageSizeOptions={[10, 25, 50]}
              initialState={{ pagination: { paginationModel: { pageSize: 25 } } }} disableColumnMenu loading={loading}
              sx={{ border: 0, "& .MuiDataGrid-columnHeaders": { bgcolor: "#f2f4f7", fontWeight: 700 },
                "& .MuiDataGrid-row:hover": { bgcolor: "#f8fafc" }, "& .MuiDataGrid-cell": { fontSize: ".92rem" } }} />
          </div>
        </CardContent>
      </Card>
    </Box>
  );
}
