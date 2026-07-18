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
import { formatDate, formatNumber } from "../../../utils/format";

const API = "/api/erp/production/daily-entry";
const MACHINE_API = "/api/erp/production/machines";
const STATUS_COLORS = { Pending: "default", Completed: "success", Approved: "primary" };

export default function DailyEntryList() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [rows, setRows] = useState([]);
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ entry_date: "", machine_id: "", shift: "" });

  useEffect(() => {
    axios.get(MACHINE_API, { params: { is_active: true } }).then(({ data }) => setMachines(data || [])).catch(() => {});
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.entry_date) params.entry_date = filters.entry_date;
      if (filters.machine_id) params.machine_id = filters.machine_id;
      if (filters.shift) params.shift = filters.shift;
      const { data } = await axios.get(API, { params });
      setRows(data);
    } catch { showToast("Failed to load", "error"); }
    finally { setLoading(false); }
  }, [filters]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const columns = [
    { field: "entry_date", headerName: "Date", width: 110, renderCell: (p) => formatDate(p.value) },
    { field: "shift", headerName: "Shift", width: 80 },
    { field: "machine_name", headerName: "Machine", width: 180 },
    { field: "order_no", headerName: "Order #", width: 130 },
    { field: "product_name", headerName: "Product", width: 180 },
    { field: "operator_name", headerName: "Operator", width: 140 },
    { field: "planned_qty", headerName: "Planned", width: 90, renderCell: (p) => formatNumber(p.value, 0) },
    { field: "produced_qty", headerName: "Produced", width: 90, renderCell: (p) => formatNumber(p.value, 0) },
    { field: "rejected_qty", headerName: "Rejected", width: 90, renderCell: (p) => formatNumber(p.value, 0) },
    { field: "downtime_minutes", headerName: "DT (min)", width: 90 },
    { field: "status", headerName: "Status", width: 110, renderCell: (p) => <Chip label={p.value} size="small" color={STATUS_COLORS[p.value] || "default"} /> },
    { field: "actions", headerName: "Actions", width: 100, sortable: false, renderCell: (p) => (
      <Box>
        <Tooltip title="View"><IconButton size="small" onClick={() => navigate(`/production/daily-entry/view/${p.row.id}`)}><VisibilityIcon fontSize="small" /></IconButton></Tooltip>
        <Tooltip title="Edit"><IconButton size="small" onClick={() => navigate(`/production/daily-entry/edit/${p.row.id}`)}><EditIcon fontSize="small" /></IconButton></Tooltip>
      </Box>
    )},
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: "bold", color: "var(--heading-color)" }}>Daily Production Entry</Typography>
      <Card sx={{ borderRadius: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
        <CardContent>
          <Box sx={{ display: "flex", gap: 1.5, mb: 2, flexWrap: "wrap", alignItems: "center" }}>
            <TextField label="Date" type="date" size="small" value={filters.entry_date} onChange={(e) => setFilters((f) => ({ ...f, entry_date: e.target.value }))} InputLabelProps={{ shrink: true }} />
            <TextField select label="Machine" size="small" sx={{ minWidth: 180 }} value={filters.machine_id} onChange={(e) => setFilters((f) => ({ ...f, machine_id: e.target.value }))}>
              <MenuItem value="">All Machines</MenuItem>
              {machines.map((m) => <MenuItem key={m.id} value={m.id}>{m.machine_name}</MenuItem>)}
            </TextField>
            <TextField select label="Shift" size="small" sx={{ minWidth: 100 }} value={filters.shift} onChange={(e) => setFilters((f) => ({ ...f, shift: e.target.value }))}>
              <MenuItem value="">All</MenuItem>
              <MenuItem value="General">General</MenuItem>
              <MenuItem value="A">A</MenuItem>
              <MenuItem value="B">B</MenuItem>
              <MenuItem value="C">C</MenuItem>
            </TextField>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate("/production/daily-entry/add")}>New Entry</Button>
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
