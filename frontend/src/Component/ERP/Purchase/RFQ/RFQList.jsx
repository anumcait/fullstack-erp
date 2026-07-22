import React, { useEffect, useState, useCallback } from "react";
import { Box, Card, CardContent, Typography, TextField, Button, Chip, LinearProgress, Tooltip, IconButton } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import AddIcon from "@mui/icons-material/Add";
import VisibilityIcon from "@mui/icons-material/Visibility";
import RefreshIcon from "@mui/icons-material/Refresh";
import SearchIcon from "@mui/icons-material/Search";
import axios from "axios";
import { useToast } from "../../../../context/ToastContext";
import { useNavigate } from "react-router-dom";
import { formatDate } from '../../../../utils/format';

const API = "/api/erp/purchase/rfq";

export default function RFQList() {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState(() => { const d = new Date(); const m = new Date(d); m.setMonth(m.getMonth() - 1); return m.toISOString().split("T")[0]; });
  const [dateTo, setDateTo] = useState(() => new Date().toISOString().split("T")[0]);
  const [year, setYear] = useState(() => String(new Date().getFullYear()));

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = search ? { search } : {};
      if (dateFrom) params.date_from = dateFrom;
      if (dateTo) params.date_to = dateTo;
      if (year) params.year = year;
      const { data } = await axios.get(API, { params });
      setRows(data);
    } catch { showToast("Failed to load RFQs", "error"); }
    finally { setLoading(false); }
  }, [search, dateFrom, dateTo, year]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const columns = [
    { field: "rfq_no", headerName: "RFQ #", width: 130 },
    { field: "rfq_date", headerName: "Date", width: 120, valueGetter: (v) => v ? formatDate(v) : "" },
    { field: "subject", headerName: "Subject", width: 250 },
    { field: "status", headerName: "Status", width: 110, renderCell: (p) => (
      <Chip label={p.value} size="small" color={p.value === "Closed" ? "success" : p.value === "Cancelled" ? "error" : "warning"} />
    )},
    { field: "closing_date", headerName: "Closing", width: 120, valueGetter: (v) => v ? formatDate(v) : "" },
    { field: "vendors", headerName: "Vendors", width: 80, valueGetter: (v) => v?.length || 0 },
    { field: "items", headerName: "Items", width: 70, valueGetter: (v) => v?.length || 0 },
    {
      field: "actions", headerName: "Actions", width: 100, sortable: false,
      renderCell: (p) => (
        <Tooltip title="View"><IconButton size="small" onClick={() => navigate(`/purchase/rfq/view/${p.row.id}`)}><VisibilityIcon fontSize="small" /></IconButton></Tooltip>
      ),
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: "bold", color: "var(--heading-color)" }}>Enquiries / RFQ</Typography>
      <Card sx={{ borderRadius: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
        <CardContent>
          <Box sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap", alignItems: "center" }}>
            <TextField size="small" placeholder="Search RFQ..." value={search} onChange={(e) => setSearch(e.target.value)}
              InputProps={{ startAdornment: <SearchIcon sx={{ mr: 1, color: "gray" }} /> }} sx={{ minWidth: 300 }} />
            <TextField size="small" type="date" label="Date From" value={dateFrom}
              onChange={(e) => { setDateFrom(e.target.value); if (dateTo && e.target.value && new Date(dateTo) - new Date(e.target.value) > 31*24*60*60*1000) setDateTo(""); }}
              InputLabelProps={{ shrink: true }} sx={{ width: 160 }} />
            <TextField size="small" type="date" label="Date To" value={dateTo}
              onChange={(e) => { setDateTo(e.target.value); if (dateFrom && e.target.value && new Date(e.target.value) - new Date(dateFrom) > 31*24*60*60*1000) setDateFrom(""); }}
              InputLabelProps={{ shrink: true }} sx={{ width: 160 }} />
            {(dateFrom || dateTo) && (
              <Button size="small" variant="text" onClick={() => { const d = new Date(); const ma = new Date(d); ma.setMonth(ma.getMonth() - 1); setDateFrom(ma.toISOString().split("T")[0]); setDateTo(d.toISOString().split("T")[0]); }}>Reset</Button>
            )}
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate("/purchase/rfq/add")}>New RFQ</Button>
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
