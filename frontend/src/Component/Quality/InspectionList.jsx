import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box, Card, CardContent, Typography, TextField, Button, Chip, LinearProgress,
  IconButton, Tooltip, Tabs, Tab
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

const API = "/api/erp/quality/inspections";

const STATUS_COLORS = {
  Pending: "default", "In Progress": "info", Passed: "success",
  Partial: "warning", Rejected: "error",
};

const INSPECTION_TYPES = [
  { key: "Incoming", label: "Incoming Inspection", route: "/quality/incoming" },
  { key: "In-Process", label: "In-Process Inspection", route: "/quality/process" },
  { key: "Final", label: "Final QC / PDI", route: "/quality/final" },
];

export default function InspectionList() {
  const { type: routeType } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const pathType = INSPECTION_TYPES.find((t) => window.location.pathname === t.route);
  const inspectionType = pathType?.key || "Incoming";

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = { inspection_type: inspectionType };
      if (search) params.search = search;
      const { data } = await axios.get(API, { params });
      setRows(data);
    } catch { showToast("Failed to load inspections", "error"); }
    finally { setLoading(false); }
  }, [inspectionType, search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const columns = [
    { field: "inspection_no", headerName: "Inspection #", width: 140 },
    { field: "item_name", headerName: "Item", width: 200 },
    { field: "supplier_name", headerName: "Supplier", width: 180 },
    { field: "inspection_date", headerName: "Date", width: 110, renderCell: (p) => formatDate(p.value) },
    {
      field: "status", headerName: "Status", width: 120,
      renderCell: (p) => <Chip label={p.value} size="small" color={STATUS_COLORS[p.value] || "default"} />,
    },
    { field: "inspected_qty", headerName: "Inspected", width: 100 },
    { field: "accepted_qty", headerName: "Accepted", width: 100 },
    { field: "rejected_qty", headerName: "Rejected", width: 100 },
    { field: "inspector", headerName: "Inspector", width: 140 },
    {
      field: "actions", headerName: "Actions", width: 110, sortable: false,
      renderCell: (p) => (
        <Box>
          <Tooltip title="View"><IconButton size="small" onClick={() => navigate(`/quality/inspections/view/${p.row.id}`)}><VisibilityIcon fontSize="small" /></IconButton></Tooltip>
          <Tooltip title="Edit"><IconButton size="small" onClick={() => navigate(`/quality/inspections/edit/${p.row.id}`)}><EditIcon fontSize="small" /></IconButton></Tooltip>
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: "bold", color: "var(--heading-color)" }}>
        {pathType?.label || "Inspections"}
      </Typography>

      <Tabs value={inspectionType} onChange={(e, v) => {
        const t = INSPECTION_TYPES.find((i) => i.key === v);
        if (t) navigate(t.route);
      }} sx={{ mb: 2 }}>
        {INSPECTION_TYPES.map((t) => <Tab key={t.key} value={t.key} label={t.label} />)}
      </Tabs>

      <Card sx={{ borderRadius: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
        <CardContent>
          <Box sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap", alignItems: "center" }}>
            <TextField size="small" placeholder="Search by item, supplier, inspector..." value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{ startAdornment: <SearchIcon sx={{ mr: 1, color: "gray" }} /> }} sx={{ minWidth: 300 }} />
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate("/quality/inspections/add")}>New Inspection</Button>
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
