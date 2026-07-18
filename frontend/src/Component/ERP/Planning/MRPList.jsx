import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, Card, CardContent, Typography, TextField, Button, Chip, LinearProgress,
  IconButton, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import RefreshIcon from "@mui/icons-material/Refresh";
import SearchIcon from "@mui/icons-material/Search";
import axios from "axios";
import { useToast } from "../../../context/ToastContext";
import { formatDate } from "../../../utils/format";

const API = "/api/erp/planning/mrp";

export default function MRPList() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = search ? { search } : {};
      const { data } = await axios.get(API, { params });
      setRows(data);
    } catch { showToast("Failed to load MRP data", "error"); }
    finally { setLoading(false); }
  }, [search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await axios.delete(`${API}/${deleteTarget}`);
      showToast("MRP entry deleted", "success");
      setDeleteTarget(null);
      fetchData();
    } catch { showToast("Failed to delete", "error"); }
  };

  const columns = [
    { field: "run_no", headerName: "Run No", width: 140 },
    { field: "run_date", headerName: "Run Date", width: 110, renderCell: (p) => formatDate(p.value) },
    { field: "item_code", headerName: "Item Code", width: 110 },
    { field: "item_name", headerName: "Item Name", width: 180 },
    { field: "gross_requirement", headerName: "Gross Req", width: 110 },
    { field: "scheduled_receipts", headerName: "Sched Rec", width: 110 },
    { field: "net_requirement", headerName: "Net Req", width: 110 },
    { field: "planned_orders", headerName: "Planned Orders", width: 130 },
    { field: "status", headerName: "Status", width: 110, renderCell: (p) => <Chip label={p.value} size="small" color={p.value === "Generated" ? "success" : "default"} /> },
    { field: "actions", headerName: "Actions", width: 140, sortable: false, renderCell: (p) => (
      <Box>
        <Tooltip title="View"><IconButton size="small" onClick={() => navigate(`/planning/mrp/view/${p.row.id}`)}><VisibilityIcon fontSize="small" /></IconButton></Tooltip>
        <Tooltip title="Edit"><IconButton size="small" onClick={() => navigate(`/planning/mrp/edit/${p.row.id}`)}><EditIcon fontSize="small" /></IconButton></Tooltip>
        <Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => setDeleteTarget(p.row.id)}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
      </Box>
    )},
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: "bold", color: "var(--heading-color)" }}>MRP Run</Typography>
      <Card sx={{ borderRadius: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
        <CardContent>
          <Box sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap", alignItems: "center" }}>
            <TextField size="small" placeholder="Search by run no or item..." value={search} onChange={(e) => setSearch(e.target.value)}
              InputProps={{ startAdornment: <SearchIcon sx={{ mr: 1, color: "gray" }} /> }} sx={{ minWidth: 300 }} />
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate("/planning/mrp/add")}>New MRP Run</Button>
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
      <Dialog open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)}>
        <DialogTitle>Delete MRP Entry</DialogTitle>
        <DialogContent>Are you sure?</DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button onClick={handleDelete} color="error">Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
