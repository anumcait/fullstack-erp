import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, Card, CardContent, Typography, TextField, Button, Chip, LinearProgress,
  IconButton, Tooltip
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import RefreshIcon from "@mui/icons-material/Refresh";
import SearchIcon from "@mui/icons-material/Search";
import axios from "axios";
import { useToast } from "../../context/ToastContext";
import { formatDate } from "../../utils/format";

const API = "/api/erp/quality/non-conformances";

const STATUS_COLORS = { Open: "error", "In Progress": "warning", Resolved: "info", Closed: "success" };
const TYPE_COLORS = { Critical: "error", Major: "warning", Minor: "info" };

export default function NonConformanceList() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = search ? { search } : {};
      const { data } = await axios.get(API, { params });
      setRows(data);
    } catch { showToast("Failed to load NCs", "error"); }
    finally { setLoading(false); }
  }, [search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const columns = [
    { field: "nc_no", headerName: "NC #", width: 120 },
    {
      field: "nc_type", headerName: "Type", width: 100,
      renderCell: (p) => <Chip label={p.value} size="small" color={TYPE_COLORS[p.value] || "default"} />,
    },
    { field: "description", headerName: "Description", width: 300 },
    {
      field: "status", headerName: "Status", width: 120,
      renderCell: (p) => <Chip label={p.value} size="small" color={STATUS_COLORS[p.value] || "default"} />,
    },
    { field: "reported_by", headerName: "Reported By", width: 140 },
    { field: "assigned_to", headerName: "Assigned To", width: 140 },
    { field: "resolution_date", headerName: "Resolution Date", width: 120, renderCell: (p) => formatDate(p.value) },
    { field: "inspection", headerName: "Inspection", width: 120, valueGetter: (v) => v?.inspection_no || "" },
    {
      field: "actions", headerName: "Actions", width: 110, sortable: false,
      renderCell: (p) => (
        <Box>
          <Tooltip title="View"><IconButton size="small" onClick={() => navigate(`/quality/non-conformances/view/${p.row.id}`)}><VisibilityIcon fontSize="small" /></IconButton></Tooltip>
          <Tooltip title="Edit"><IconButton size="small" onClick={() => navigate(`/quality/non-conformances/edit/${p.row.id}`)}><EditIcon fontSize="small" /></IconButton></Tooltip>
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: "bold", color: "var(--heading-color)" }}>Non-Conformance Reports</Typography>
      <Card sx={{ borderRadius: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
        <CardContent>
          <Box sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap", alignItems: "center" }}>
            <TextField size="small" placeholder="Search NC #, description, reporter..." value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{ startAdornment: <SearchIcon sx={{ mr: 1, color: "gray" }} /> }} sx={{ minWidth: 300 }} />
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate("/quality/non-conformances/add")}>New NC Report</Button>
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
