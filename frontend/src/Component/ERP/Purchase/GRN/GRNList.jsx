import React, { useEffect, useState, useCallback } from "react";
import { Box, Card, CardContent, Typography, TextField, Button, Chip, LinearProgress, Tooltip, IconButton } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import AddIcon from "@mui/icons-material/Add";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import RefreshIcon from "@mui/icons-material/Refresh";
import SearchIcon from "@mui/icons-material/Search";
import axios from "axios";
import { useToast } from "../../../../context/ToastContext";
import { useNavigate } from "react-router-dom";

const API = "/api/erp/stores/grn";

export default function GRNList() {
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
    } catch { showToast("Failed to load GRRs", "error"); }
    finally { setLoading(false); }
  }, [search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const columns = [
    { field: "grn_no", headerName: "GRR #", width: 130 },
    { field: "ir_type", headerName: "IR Type", width: 130, valueGetter: (v) => v || "GRR" },
    { field: "grn_date", headerName: "Date", width: 110, valueGetter: (v) => v ? v.split("T")[0] : "" },
    { field: "purchaseOrder", headerName: "PO #", width: 130, valueGetter: (v) => v?.po_no || "" },
    { field: "supplier", headerName: "Supplier", width: 200, valueGetter: (v) => v?.supplier_name || "" },
    { field: "invoice_no", headerName: "Invoice #", width: 130 },
    { field: "invoice_date", headerName: "Inv Date", width: 110, valueGetter: (v) => v ? v.split("T")[0] : "" },
    { field: "status", headerName: "Status", width: 110, renderCell: (p) => {
      const c = p.value === "Received" ? "success" : p.value === "Draft" ? "default" : "warning";
      return <Chip label={p.value} size="small" color={c} />;
    }},
    { field: "approval_status", headerName: "Approval", width: 110, renderCell: (p) => {
      const c = p.value === "Approved" ? "success" : p.value === "Rejected" ? "error" : "warning";
      return <Chip label={p.value || "Pending"} size="small" color={c} />;
    }},
    { field: "qa_status", headerName: "QA", width: 100, renderCell: (p) => {
      const c = p.value === "Passed" ? "success" : p.value === "Rejected" ? "error" : p.value === "Partial" ? "info" : "warning";
      return <Chip label={p.value || "Pending"} size="small" color={c} />;
    }},
    { field: "received_by", headerName: "Received By", width: 140 },
    {
      field: "actions", headerName: "Actions", width: 140, sortable: false,
      renderCell: (p) => (
        <Box>
          <Tooltip title="View"><IconButton size="small" onClick={() => navigate(`/stores/grr/view/${p.row.id}`)}><VisibilityIcon fontSize="small" /></IconButton></Tooltip>
          {p.row.status === "Draft" && (
            <Tooltip title="Edit"><IconButton size="small" color="primary" onClick={() => navigate(`/stores/grr/edit/${p.row.id}`)}><EditIcon fontSize="small" /></IconButton></Tooltip>
          )}
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: "bold", color: "var(--heading-color)" }}>GRR</Typography>
      <Card sx={{ borderRadius: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
        <CardContent>
          <Box sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap", alignItems: "center" }}>
            <TextField size="small" placeholder="Search GRR..." value={search} onChange={(e) => setSearch(e.target.value)}
              InputProps={{ startAdornment: <SearchIcon sx={{ mr: 1, color: "gray" }} /> }} sx={{ minWidth: 300 }} />
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate("/stores/grr/add")}>New GRR</Button>
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
