import React, { useEffect, useState, useCallback } from "react";
import { Box, Card, CardContent, Typography, TextField, Button, Chip, LinearProgress, Tooltip, IconButton, Rating } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import RefreshIcon from "@mui/icons-material/Refresh";
import axios from "axios";
import { useToast } from "../../../../context/ToastContext";
import { useNavigate } from "react-router-dom";

const API = "/api/erp/purchase/vendor-ratings";

export default function VendorRatingList() {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(API);
      setRows(data);
    } catch { showToast("Failed to load ratings", "error"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this rating?")) return;
    try { await axios.delete(`${API}/${id}`); showToast("Deleted", "success"); fetchData(); }
    catch { showToast("Failed", "error"); }
  };

  const columns = [
    { field: "supplier", headerName: "Supplier", width: 200, valueGetter: (v) => v?.supplier_name || "" },
    { field: "rating_date", headerName: "Date", width: 110, valueGetter: (v) => v ? v.split("T")[0] : "" },
    { field: "quality_score", headerName: "Quality", width: 100, renderCell: (p) => <Rating value={parseFloat(p.value || 0) / 2} readOnly size="small" precision={0.5} /> },
    { field: "delivery_score", headerName: "Delivery", width: 100, renderCell: (p) => <Rating value={parseFloat(p.value || 0) / 2} readOnly size="small" precision={0.5} /> },
    { field: "price_score", headerName: "Price", width: 100, renderCell: (p) => <Rating value={parseFloat(p.value || 0) / 2} readOnly size="small" precision={0.5} /> },
    { field: "service_score", headerName: "Service", width: 100, renderCell: (p) => <Rating value={parseFloat(p.value || 0) / 2} readOnly size="small" precision={0.5} /> },
    { field: "overall_score", headerName: "Overall", width: 100, renderCell: (p) => (
      <Chip label={parseFloat(p.value || 0).toFixed(1)} size="small"
        color={p.value >= 8 ? "success" : p.value >= 6 ? "warning" : "error"} />
    )},
    { field: "remarks", headerName: "Remarks", width: 200 },
    { field: "rated_by", headerName: "Rated By", width: 130 },
    { field: "actions", headerName: "Actions", width: 80, sortable: false, renderCell: (p) => (
      <Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => handleDelete(p.row.id)}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
    )},
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: "bold", color: "var(--heading-color)" }}>Vendor Ratings</Typography>
      <Card sx={{ borderRadius: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
        <CardContent>
          <Box sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap", alignItems: "center" }}>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate("/purchase/rating/add")}>Rate Vendor</Button>
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
