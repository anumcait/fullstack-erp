import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, Card, CardContent, Typography, TextField, Button, Chip, LinearProgress,
  IconButton, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions,
  MenuItem, Select, FormControl, InputLabel
} from "@mui/material";
import StandardTable from '../../../Component/Common/StandardTable';
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import RefreshIcon from "@mui/icons-material/Refresh";
import SearchIcon from "@mui/icons-material/Search";
import axios from "axios";
import { useToast } from "../../../context/ToastContext";
import { formatDate } from "../../../utils/format";
import { useSubcontractLookups } from "./lookups";

const API = "/api/erp/subcontract/receipts";
const STATUSES = ["Draft", "Received", "Completed"];
const STATUS_COLORS = { Draft: "default", Received: "info", Completed: "success" };

export default function ReceiptList() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [vendor, setVendor] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const { vendors } = useSubcontractLookups();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (status) params.status = status;
      if (vendor) params.vendor = vendor;
      const { data } = await axios.get(API, { params });
      setRows(data);
    } catch { showToast("Failed to load receipts", "error"); }
    finally { setLoading(false); }
  }, [search, status, vendor]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await axios.delete(`${API}/${deleteTarget}`);
      showToast("Receipt deleted", "success");
      setDeleteTarget(null);
      fetchData();
    } catch { showToast("Failed to delete", "error"); }
  };

  const columns = [
    { field: "receipt_no", headerName: "Receipt No", width: 150 },
    { field: "order_no", headerName: "Order No", width: 130, valueGetter: (p) => p.row.order?.order_no || "" },
    { field: "vendor_name", headerName: "Vendor", width: 200 },
    { field: "receipt_date", headerName: "Receipt Date", width: 120, renderCell: (p) => formatDate(p.value) },
    { field: "status", headerName: "Status", width: 130, renderCell: (p) => <Chip label={p.value} size="small" color={STATUS_COLORS[p.value] || "default"} /> },
    { field: "actions", headerName: "Actions", width: 140, sortable: false, renderCell: (p) => (
      <Box>
        <Tooltip title="View"><IconButton size="small" onClick={() => navigate(`/subcontract/receipt/view/${p.row.id}`)}><VisibilityIcon fontSize="small" /></IconButton></Tooltip>
        <Tooltip title="Edit"><IconButton size="small" onClick={() => navigate(`/subcontract/receipt/edit/${p.row.id}`)}><EditIcon fontSize="small" /></IconButton></Tooltip>
        <Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => setDeleteTarget(p.row.id)}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
      </Box>
    )},
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: "bold", color: "var(--heading-color)" }}>Material Receipt from Vendor</Typography>
      <Card sx={{ borderRadius: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
        <CardContent>
          <Box sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap", alignItems: "center" }}>
            <TextField size="small" placeholder="Search by receipt no or vendor..." value={search} onChange={(e) => setSearch(e.target.value)}
              InputProps={{ startAdornment: <SearchIcon sx={{ mr: 1, color: "gray" }} /> }} sx={{ minWidth: 300 }} />
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel>Status</InputLabel>
              <Select label="Status" value={status} onChange={(e) => setStatus(e.target.value)}>
                <MenuItem value="">All</MenuItem>
                {STATUSES.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Sub-Contractor</InputLabel>
              <Select label="Sub-Contractor" value={vendor} onChange={(e) => setVendor(e.target.value)}>
                <MenuItem value="">All</MenuItem>
                {vendors.map((v) => <MenuItem key={v.id} value={v.supplier_name}>{v.supplier_name}</MenuItem>)}
              </Select>
            </FormControl>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate("/subcontract/receipt/add")}>New Receipt</Button>
            <Button variant="outlined" startIcon={<RefreshIcon />} onClick={fetchData}>Refresh</Button>
          </Box>
          {loading && <LinearProgress sx={{ mb: 1 }} />}
          <div style={{ height: 520, width: "100%" }}>
            <StandardTable
              title="Subcontract Receipts"
              rows={rows}
              columns={columns}
              getRowId={(r) => r.id}
              loading={loading}
            />
          </div>
        </CardContent>
      </Card>
      <Dialog open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)}>
        <DialogTitle>Delete Receipt</DialogTitle>
        <DialogContent>Are you sure?</DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button onClick={handleDelete} color="error">Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
