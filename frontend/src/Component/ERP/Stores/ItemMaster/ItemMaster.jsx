import React, { useEffect, useState, useCallback } from "react";
import {
  Box, Card, CardContent, Typography, TextField, Button,
  Dialog, DialogTitle, DialogContent, DialogActions,
  IconButton, Tooltip, Chip, LinearProgress, Alert
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import RefreshIcon from "@mui/icons-material/Refresh";
import SearchIcon from "@mui/icons-material/Search";
import axios from "axios";
import { useToast } from "../../../../context/ToastContext";
import { useNavigate } from "react-router-dom";

const API = "/api/erp/stores/items";

export default function ItemMaster() {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const params = search ? { search } : {};
      const { data } = await axios.get(API, { params });
      setItems(data);
    } catch (err) {
      showToast("Failed to load items", "error");
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await axios.delete(`${API}/${deleteTarget}`);
      showToast("Item deactivated", "success");
      setDeleteTarget(null);
      fetchItems();
    } catch (err) {
      showToast(err.response?.data?.error || "Failed to delete", "error");
    }
  };

  const columns = [
    { field: "item_code", headerName: "Item Code", width: 130 },
    { field: "item_name", headerName: "Item Name", width: 220 },
    {
      field: "category",
      headerName: "Category",
      width: 150,
      valueGetter: (params) => params?.name || "-",
    },
    {
      field: "unit",
      headerName: "Unit",
      width: 100,
      valueGetter: (params) => params?.short_name || params?.name || "-",
    },
    { field: "current_stock", headerName: "Stock", width: 100, type: "number" },
    { field: "rate", headerName: "Rate", width: 110, type: "number" },
    { field: "gst_rate", headerName: "GST %", width: 90, type: "number" },
    { field: "hsn_code", headerName: "HSN", width: 110 },
    {
      field: "is_active",
      headerName: "Status",
      width: 100,
      renderCell: (params) => (
        <Chip
          label={params.value ? "Active" : "Inactive"}
          color={params.value ? "success" : "default"}
          size="small"
        />
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <Box>
          <Tooltip title="Edit">
            <IconButton
              size="small"
              onClick={() => navigate(`/stores/item-master/edit/${params.row.id}`)}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Deactivate">
            <IconButton
              size="small"
              color="error"
              onClick={() => setDeleteTarget(params.row.id)}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: "bold", color: "var(--heading-color)" }}>
        Item Master
      </Typography>

      <Card sx={{ borderRadius: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
        <CardContent>
          <Box sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap", alignItems: "center" }}>
            <TextField
              size="small"
              placeholder="Search by code, name, HSN..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{ startAdornment: <SearchIcon sx={{ mr: 1, color: "gray" }} /> }}
              sx={{ minWidth: 300 }}
            />
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate("/stores/item-master/add")}>
              Add Item
            </Button>
            <Button variant="outlined" startIcon={<RefreshIcon />} onClick={fetchItems}>
              Refresh
            </Button>
          </Box>

          {loading && <LinearProgress sx={{ mb: 1 }} />}

          <div style={{ height: 520, width: "100%" }}>
            <DataGrid
              rows={items}
              columns={columns}
              getRowId={(row) => row.id}
              pageSizeOptions={[10, 25, 50]}
              initialState={{ pagination: { paginationModel: { pageSize: 25 } } }}
              disableColumnMenu
              loading={loading}
              sx={{
                border: 0,
                "& .MuiDataGrid-columnHeaders": { bgcolor: "#f2f4f7", fontWeight: 700 },
                "& .MuiDataGrid-row:hover": { bgcolor: "#f8fafc" },
                "& .MuiDataGrid-cell": { fontSize: ".92rem" },
              }}
            />
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)}>
        <DialogTitle>Deactivate Item?</DialogTitle>
        <DialogContent>
          <Typography>This will mark the item as inactive. Are you sure?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">Deactivate</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
