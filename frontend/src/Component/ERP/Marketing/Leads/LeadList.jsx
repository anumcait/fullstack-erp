import React, { useEffect, useState, useCallback } from "react";
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
import { useToast } from "../../../../context/ToastContext";
import { useNavigate } from "react-router-dom";
import { formatDate, formatCurrency } from "../../../../utils/format";

const API = "/api/erp/marketing/leads";

const STATUS_COLORS = {
  New: "info", Contacted: "warning", Qualified: "success",
  Proposal: "primary", Negotiation: "secondary", "Closed Won": "success",
  "Closed Lost": "error",
};

const PRIORITY_COLORS = { Low: "default", Medium: "warning", High: "error" };

export default function LeadList() {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      const { data } = await axios.get(API, { params });
      setRows(data);
    } catch { showToast("Failed to load leads", "error"); }
    finally { setLoading(false); }
  }, [search, statusFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const columns = [
    { field: "lead_no", headerName: "Lead #", width: 120 },
    { field: "company_name", headerName: "Company", width: 200 },
    { field: "contact_person", headerName: "Contact", width: 160 },
    { field: "email", headerName: "Email", width: 180 },
    { field: "phone", headerName: "Phone", width: 130 },
    {
      field: "status", headerName: "Status", width: 130,
      renderCell: (p) => <Chip label={p.value} size="small" color={STATUS_COLORS[p.value] || "default"} />,
    },
    {
      field: "priority", headerName: "Priority", width: 100,
      renderCell: (p) => <Chip label={p.value} size="small" color={PRIORITY_COLORS[p.value] || "default"} variant="outlined" />,
    },
    { field: "source", headerName: "Source", width: 110 },
    {
      field: "expected_value", headerName: "Expected Value", width: 140,
      renderCell: (p) => formatCurrency(p.value),
    },
    { field: "createdAt", headerName: "Created", width: 110, renderCell: (p) => formatDate(p.value) },
    {
      field: "actions", headerName: "Actions", width: 110, sortable: false,
      renderCell: (p) => (
        <Box>
          <Tooltip title="View"><IconButton size="small" onClick={() => navigate(`/marketing/leads/view/${p.row.id}`)}><VisibilityIcon fontSize="small" /></IconButton></Tooltip>
          <Tooltip title="Edit"><IconButton size="small" onClick={() => navigate(`/marketing/leads/edit/${p.row.id}`)}><EditIcon fontSize="small" /></IconButton></Tooltip>
        </Box>
      ),
    },
  ];

  const STATUS_TABS = ["", "New", "Contacted", "Qualified", "Proposal", "Negotiation", "Closed Won", "Closed Lost"];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: "bold", color: "var(--heading-color)" }}>Leads & Enquiries</Typography>

      <Tabs value={statusFilter} onChange={(e, v) => setStatusFilter(v)} variant="scrollable" scrollButtons="auto" sx={{ mb: 2 }}>
        {STATUS_TABS.map((s) => <Tab key={s} value={s} label={s || "All"} />)}
      </Tabs>

      <Card sx={{ borderRadius: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
        <CardContent>
          <Box sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap", alignItems: "center" }}>
            <TextField size="small" placeholder="Search by company, contact, email..." value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{ startAdornment: <SearchIcon sx={{ mr: 1, color: "gray" }} /> }} sx={{ minWidth: 300 }} />
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate("/marketing/leads/add")}>New Lead</Button>
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
