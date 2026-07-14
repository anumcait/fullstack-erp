import React, { useEffect, useState, useCallback } from "react";
import { Box, Card, CardContent, Typography, TextField, Button, Chip, LinearProgress, Tooltip, IconButton } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import AddIcon from "@mui/icons-material/Add";
import VisibilityIcon from "@mui/icons-material/Visibility";
import RefreshIcon from "@mui/icons-material/Refresh";
import SearchIcon from "@mui/icons-material/Search";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import axios from "axios";
import { useToast } from "../../../../context/ToastContext";
import { useNavigate } from "react-router-dom";

const API = "/api/erp/purchase/orders";

export default function POList() {
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
    } catch { showToast("Failed to load POs", "error"); }
    finally { setLoading(false); }
  }, [search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleApprove = async (id, status) => {
    try {
      await axios.put(`${API}/${id}/approve`, { status: status || "Approved" });
      showToast(`PO ${status || "approved"}`, "success");
      fetchData();
    } catch { showToast("Failed", "error"); }
  };

  const columns = [
    { field: "po_no", headerName: "PO #", width: 140 },
    { field: "po_date", headerName: "Date", width: 110, valueGetter: (v) => v ? v.split("T")[0] : "" },
    { field: "supplier", headerName: "Supplier", width: 200, valueGetter: (v) => v?.supplier_name || "" },
    { field: "status", headerName: "Status", width: 120, renderCell: (p) => (
      <Chip label={p.value} size="small" color={p.value === "Approved" ? "success" : p.value === "Draft" ? "default" : p.value === "Cancelled" ? "error" : "warning"} />
    )},
    { field: "grand_total", headerName: "Amount", width: 130, valueGetter: (v) => v ? parseFloat(v).toLocaleString("en-IN", { style: "currency", currency: "INR" }) : "" },
    { field: "payment_terms", headerName: "Payment", width: 120 },
    { field: "items", headerName: "Items", width: 70, valueGetter: (v) => v?.length || 0 },
    {
      field: "actions", headerName: "Actions", width: 150, sortable: false,
      renderCell: (p) => (
        <Box>
          <Tooltip title="View"><IconButton size="small" onClick={() => navigate(`/purchase/orders/view/${p.row.id}`)}><VisibilityIcon fontSize="small" /></IconButton></Tooltip>
          {p.row.status === "Draft" && (
            <>
              <Tooltip title="Approve"><IconButton size="small" color="success" onClick={() => handleApprove(p.row.id, "Approved")}><CheckCircleIcon fontSize="small" /></IconButton></Tooltip>
            </>
          )}
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: "bold", color: "var(--heading-color)" }}>Purchase Orders</Typography>
      <Card sx={{ borderRadius: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
        <CardContent>
          <Box sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap", alignItems: "center" }}>
            <TextField size="small" placeholder="Search PO # or supplier..." value={search} onChange={(e) => setSearch(e.target.value)}
              InputProps={{ startAdornment: <SearchIcon sx={{ mr: 1, color: "gray" }} /> }} sx={{ minWidth: 300 }} />
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate("/purchase/orders/add")}>New PO</Button>
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
