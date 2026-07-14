import React, { useEffect, useState, useCallback } from "react";
import {
  Box, Card, CardContent, Typography, TextField, Button,
  Dialog, DialogTitle, DialogContent, DialogActions,
  IconButton, Tooltip, Chip, LinearProgress, Tabs, Tab
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import RefreshIcon from "@mui/icons-material/Refresh";
import SearchIcon from "@mui/icons-material/Search";
import axios from "axios";
import { useToast } from "../../../../context/ToastContext";
import { useNavigate } from "react-router-dom";

const API = "/api/erp/purchase/suppliers";

const PARTY_TYPES = ["Supplier", "Sub-Contractor", "Customer"];

export default function SupplierMaster() {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [partyType, setPartyType] = useState("Supplier");

  const fetchSuppliers = useCallback(async () => {
    setLoading(true);
    try {
      const params = { party_type: partyType };
      if (search) params.search = search;
      const { data } = await axios.get(API, { params });
      setSuppliers(data);
    } catch (err) {
      showToast("Failed to load", "error");
    } finally {
      setLoading(false);
    }
  }, [search, partyType]);

  useEffect(() => { fetchSuppliers(); }, [fetchSuppliers]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await axios.delete(`${API}/${deleteTarget}`);
      showToast("Deactivated", "success");
      setDeleteTarget(null);
      fetchSuppliers();
    } catch (err) {
      showToast(err.response?.data?.error || "Failed to delete", "error");
    }
  };

  const columns = [
    { field: "party_type", headerName: "Type", width: 130, renderCell: (p) => (
      <Chip label={p.value} size="small" color={p.value === "Supplier" ? "primary" : p.value === "Customer" ? "success" : "warning"} variant="outlined" />
    )},
    { field: "supplier_code", headerName: "Code", width: 120 },
    { field: "supplier_name", headerName: "Name", width: 240 },
    { field: "contact_person", headerName: "Contact", width: 160 },
    { field: "email", headerName: "Email", width: 200 },
    { field: "phone", headerName: "Phone", width: 130 },
    { field: "mobile", headerName: "Mobile", width: 130 },
    { field: "city", headerName: "City", width: 130 },
    { field: "gstin", headerName: "GSTIN", width: 150 },
    { field: "gst_registration_type", headerName: "GST Reg Type", width: 140 },
    { field: "msme_reg_no", headerName: "MSME Reg No", width: 140 },
    { field: "msme_type", headerName: "MSME Type", width: 100 },
    { field: "payment_terms", headerName: "Payment Terms", width: 130 },
    {
      field: "is_active", headerName: "Status", width: 100,
      renderCell: (params) => (
        <Chip label={params.value ? "Active" : "Inactive"} color={params.value ? "success" : "default"} size="small" />
      ),
    },
    {
      field: "actions", headerName: "Actions", width: 150, sortable: false,
      renderCell: (params) => (
        <Box>
          <Tooltip title="View">
            <IconButton size="small" onClick={() => navigate(`/purchase/vendors/view/${params.row.id}`)}>
              <VisibilityIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit">
            <IconButton size="small" onClick={() => navigate(`/purchase/vendors/edit/${params.row.id}`)}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Deactivate">
            <IconButton size="small" color="error" onClick={() => setDeleteTarget(params.row.id)}>
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
        Party Master — {partyType}s
      </Typography>

      <Tabs value={partyType} onChange={(e, v) => setPartyType(v)} sx={{ mb: 2 }}>
        {PARTY_TYPES.map((t) => <Tab key={t} value={t} label={t === "Sub-Contractor" ? "Sub-Contractors" : `${t}s`} />)}
      </Tabs>

      <Card sx={{ borderRadius: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
        <CardContent>
          <Box sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap", alignItems: "center" }}>
            <TextField
              size="small"
              placeholder="Search by code, name, city, GSTIN..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{ startAdornment: <SearchIcon sx={{ mr: 1, color: "gray" }} /> }}
              sx={{ minWidth: 320 }}
            />
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate("/purchase/vendors/add")}>
              Add {partyType}
            </Button>
            <Button variant="outlined" startIcon={<RefreshIcon />} onClick={fetchSuppliers}>
              Refresh
            </Button>
          </Box>

          {loading && <LinearProgress sx={{ mb: 1 }} />}

          <div style={{ height: 520, width: "100%" }}>
            <DataGrid
              rows={suppliers}
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
        <DialogTitle>Deactivate?</DialogTitle>
        <DialogContent>
          <Typography>This will mark the party as inactive. Are you sure?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">Deactivate</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
