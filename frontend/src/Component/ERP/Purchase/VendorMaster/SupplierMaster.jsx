import React, { useEffect, useState, useCallback } from "react";
import {
  Box, Card, CardContent, Typography, TextField, Button,
  Dialog, DialogTitle, DialogContent, DialogActions,
  IconButton, Tooltip, Chip, LinearProgress, Tabs, Tab,
} from "@mui/material";
import StandardTable from '../../../../Component/Common/StandardTable';
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

function naturalCompare(a, b) {
  const am = String(a).match(/(\d+)|(\D+)/g) || [];
  const bm = String(b).match(/(\d+)|(\D+)/g) || [];
  for (let i = 0; i < Math.min(am.length, bm.length); i++) {
    const x = am[i], y = bm[i];
    const xn = /^\d+$/.test(x), yn = /^\d+$/.test(y);
    if (xn && yn) {
      const diff = Number(x) - Number(y);
      if (diff !== 0) return diff;
    } else if (xn !== yn) {
      return xn ? -1 : 1;
    } else {
      const c = x.localeCompare(y);
      if (c !== 0) return c;
    }
  }
  return am.length - bm.length;
}

export default function SupplierMaster() {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [partyType, setPartyType] = useState("Supplier");

  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 350);
    return () => clearTimeout(t);
  }, [searchInput]);

  const fetchSuppliers = useCallback(async () => {
    setLoading(true);
    try {
      const params = { party_type: partyType };
      if (search) params.search = search;
      const { data } = await axios.get(API, { params });
      data.sort((a, b) => naturalCompare(a.supplier_code, b.supplier_code));
      setSuppliers(data);
    } catch {
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
    { field: "supplier_code", headerName: "Code", width: 120, sortComparator: (a, b) => naturalCompare(a, b) },
    { field: "supplier_name", headerName: "Name", width: 260 },
    { field: "contact_person", headerName: "Contact", width: 160 },
    { field: "email", headerName: "Email", width: 200 },
    { field: "phone", headerName: "Phone", width: 130 },
    { field: "mobile", headerName: "Mobile", width: 130 },
    { field: "address_line1", headerName: "Address 1", width: 200, hide: true },
    { field: "address_line2", headerName: "Address 2", width: 200, hide: true },
    { field: "city", headerName: "City", width: 130 },
    { field: "state", headerName: "State", width: 150 },
    { field: "pincode", headerName: "Pincode", width: 100 },
    { field: "gstin", headerName: "GSTIN", width: 150 },
    { field: "pan_no", headerName: "PAN", width: 130 },
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
            <IconButton size="small" onClick={(e) => { e.stopPropagation(); navigate(`/purchase/vendors/view/${params.row.id}`); }}>
              <VisibilityIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit">
            <IconButton size="small" onClick={(e) => { e.stopPropagation(); navigate(`/purchase/vendors/edit/${params.row.id}`); }}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Deactivate">
            <IconButton size="small" color="error" onClick={(e) => { e.stopPropagation(); setDeleteTarget(params.row.id); }}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", mb: 1.5, flexWrap: "wrap", gap: 1.5 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: "var(--heading-color)", lineHeight: 1.2 }}>
            Party Master
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {suppliers.length} {partyType.toLowerCase()}{suppliers.length === 1 ? "" : "s"} listed
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1, alignItems: "center", flexWrap: "wrap" }}>
          <TextField
            size="small"
            placeholder="Search code, name, city, GSTIN..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            InputProps={{ startAdornment: <SearchIcon sx={{ mr: 1, color: "gray" }} /> }}
            sx={{ minWidth: 280 }}
          />
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={fetchSuppliers}>
            Refresh
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate("/purchase/vendors/add")}>
            Add {partyType}
          </Button>
        </Box>
      </Box>

      <Tabs value={partyType} onChange={(e, v) => setPartyType(v)} sx={{ mb: 1.5 }}>
        {PARTY_TYPES.map((t) => <Tab key={t} value={t} label={t === "Sub-Contractor" ? "Sub-Contractors" : `${t}s`} />)}
      </Tabs>

      <Card sx={{ borderRadius: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.08)", overflow: "hidden" }}>
        <StandardTable
          title="Party Master"
          rows={suppliers}
          columns={columns}
          getRowId={(row) => row.id}
          loading={loading}
          onRowClick={(row) => navigate(`/purchase/vendors/view/${row.id}`)}
        />
        {loading && <LinearProgress />}
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
