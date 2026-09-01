import React, { useEffect, useState, useCallback } from "react";
import {
  Box, Card, CardContent, Typography, TextField, Button, Chip, LinearProgress,
  IconButton, Tooltip
} from "@mui/material";
import StandardTable from '../../../Common/StandardTable.jsx';
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import RefreshIcon from "@mui/icons-material/Refresh";
import SearchIcon from "@mui/icons-material/Search";
import axios from "axios";
import { useToast } from "../../../../context/ToastContext";
import { useNavigate } from "react-router-dom";
import { formatDate, formatCurrency } from "../../../../utils/format";

const API = "/api/erp/marketing/quotations";

const STATUS_COLORS = {
  Draft: "default", Sent: "info", Accepted: "success", Rejected: "error", Converted: "primary",
};

export default function QuotationList() {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = search ? { search } : {};
      const { data } = await axios.get(API, { params });
      setRows(data);
    } catch { showToast("Failed to load quotations", "error"); }
    finally { setLoading(false); }
  }, [search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const columns = [
    { field: "quote_no", headerName: "Quote #", width: 130 },
    { field: "customer_name", headerName: "Customer", width: 200 },
    { field: "quote_date", headerName: "Date", width: 110, renderCell: (p) => formatDate(p.value) },
    { field: "valid_until", headerName: "Valid Until", width: 110, renderCell: (p) => formatDate(p.value) },
    {
      field: "status", headerName: "Status", width: 120,
      renderCell: (p) => <Chip label={p.value} size="small" color={STATUS_COLORS[p.value] || "default"} />,
    },
    { field: "total", headerName: "Total", width: 140, renderCell: (p) => formatCurrency(p.value) },
    { field: "items", headerName: "Items", width: 70, valueGetter: (v) => (v ? v.length : 0) },
    {
      field: "actions", headerName: "Actions", width: 110, sortable: false,
      renderCell: (p) => (
        <Box>
          <Tooltip title="View"><IconButton size="small" onClick={() => navigate(`/marketing/quotes/view/${p.row.id}`)}><VisibilityIcon fontSize="small" /></IconButton></Tooltip>
          {p.row.status === "Draft" && (
            <Tooltip title="Edit"><IconButton size="small" onClick={() => navigate(`/marketing/quotes/edit/${p.row.id}`)}><EditIcon fontSize="small" /></IconButton></Tooltip>
          )}
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: "bold", color: "var(--heading-color)" }}>Quotations</Typography>
      <Card sx={{ borderRadius: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
        <CardContent>
          <Box sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap", alignItems: "center" }}>
            <TextField size="small" placeholder="Search quote # or customer..." value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{ startAdornment: <SearchIcon sx={{ mr: 1, color: "gray" }} /> }} sx={{ minWidth: 300 }} />
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate("/marketing/quotes/add")}>New Quotation</Button>
            <Button variant="outlined" startIcon={<RefreshIcon />} onClick={fetchData}>Refresh</Button>
          </Box>
          {loading && <LinearProgress sx={{ mb: 1 }} />}
          <div style={{ height: 520, width: "100%" }}>
            <StandardTable title="QuotationList" rows={rows} columns={columns} getRowId={(r) => r.id} pageSizeOptions={[10, 25, 50]}
              initialState={{ pagination: { paginationModel: { pageSize: 25 } } }} disableColumnMenu loading={loading}
              sx={{ border: 0, "& .MuiDataGrid-columnHeaders": { bgcolor: "#f2f4f7", fontWeight: 700 },
                "& .MuiDataGrid-row:hover": { bgcolor: "#f8fafc" }, "& .MuiDataGrid-cell": { fontSize: ".92rem" } }} />
          </div>
        </CardContent>
      </Card>
    </Box>
  );
}
