import React, { useEffect, useState, useCallback } from "react";
import { Box, Card, CardContent, Typography, TextField, Button, Chip, LinearProgress, Tooltip, IconButton } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import RefreshIcon from "@mui/icons-material/Refresh";
import SearchIcon from "@mui/icons-material/Search";
import axios from "axios";
import { useToast } from "../../../../context/ToastContext";
import { useNavigate } from "react-router-dom";

const API = "/api/erp/purchase/price-list";

export default function PriceList() {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(API);
      setRows(data);
    } catch { showToast("Failed to load price list", "error"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleDelete = async (id) => {
    if (!window.confirm("Deactivate this price entry?")) return;
    try { await axios.delete(`${API}/${id}`); showToast("Deactivated", "success"); fetchData(); }
    catch { showToast("Failed", "error"); }
  };

  const columns = [
    { field: "supplier", headerName: "Supplier", width: 200, valueGetter: (v) => v?.supplier_name || "" },
    { field: "item", headerName: "Item", width: 200, valueGetter: (v) => v?.item_name || "" },
    { field: "rate", headerName: "Rate", width: 120, valueGetter: (v) => parseFloat(v || 0).toLocaleString("en-IN", { style: "currency", currency: "INR" }) },
    { field: "currency", headerName: "Currency", width: 90 },
    { field: "effective_from", headerName: "From", width: 110, valueGetter: (v) => v ? v.split("T")[0] : "" },
    { field: "effective_to", headerName: "To", width: 110, valueGetter: (v) => v ? v.split("T")[0] : "" },
    { field: "moq", headerName: "MOQ", width: 80 },
    { field: "lead_days", headerName: "Lead Days", width: 100 },
    { field: "is_active", headerName: "Status", width: 90, renderCell: (p) => (
      <Chip label={p.value ? "Active" : "Inactive"} color={p.value ? "success" : "default"} size="small" />
    )},
    { field: "actions", headerName: "Actions", width: 100, sortable: false, renderCell: (p) => (
      <Box>
        <Tooltip title="Edit"><IconButton size="small" onClick={() => navigate(`/purchase/prices/edit/${p.row.id}`)}><EditIcon fontSize="small" /></IconButton></Tooltip>
        <Tooltip title="Deactivate"><IconButton size="small" color="error" onClick={() => handleDelete(p.row.id)}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
      </Box>
    )},
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: "bold", color: "var(--heading-color)" }}>Vendor Price List</Typography>
      <Card sx={{ borderRadius: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
        <CardContent>
          <Box sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap", alignItems: "center" }}>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate("/purchase/prices/add")}>Add Price</Button>
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
