import React, { useEffect, useState, useCallback } from "react";
import { Box, Card, CardContent, Typography, TextField, Button, Chip, LinearProgress, Tooltip, IconButton, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import AddIcon from "@mui/icons-material/Add";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import RefreshIcon from "@mui/icons-material/Refresh";
import SearchIcon from "@mui/icons-material/Search";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import axios from "axios";
import { useToast } from "../../../../context/ToastContext";
import { useNavigate, useSearchParams } from "react-router-dom";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import { downloadPoPdf } from "./poPdf";

const API = "/api/erp/purchase/orders";

export default function POList() {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const statusFilter = searchParams.get("status") || "";
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [confirm, setConfirm] = useState({ open: false, id: null });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      const { data } = await axios.get(API, { params });
      setRows(data);
    } catch { showToast("Failed to load POs", "error"); }
    finally { setLoading(false); }
  }, [search, statusFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const validateForApproval = (po) => {
    const errors = [];
    if (!po.supplier_id) errors.push("Supplier is not selected");
    if (!po.po_no) errors.push("PO number is missing");
    if (!po.po_date) errors.push("PO date is missing");
    const items = po.items || [];
    if (items.length === 0) errors.push("At least one item is required");
    else {
      items.forEach((it, i) => {
        const name = it.item_name || it.item_code || `Item #${i + 1}`;
        if (!(Number(it.quantity) > 0)) errors.push(`${name}: quantity must be greater than 0`);
        if (!(Number(it.rate) > 0)) errors.push(`${name}: unit price must be greater than 0`);
      });
    }
    return errors;
  };

  const handleApproveClick = (id) => {
    const po = rows.find((r) => r.id === id);
    const errors = validateForApproval(po || {});
    if (errors.length) {
      showToast(`Cannot approve: ${errors[0]}`, "error");
      return;
    }
    setConfirm({ open: true, id });
  };

  const confirmApprove = async () => {
    const id = confirm.id;
    setConfirm({ open: false, id: null });
    try {
      await axios.put(`${API}/${id}/approve`, { status: "Approved" });
      showToast("PO approved", "success");
      fetchData();
    } catch { showToast("Failed to approve", "error"); }
  };

  const handleViewPdf = async (id) => {
    const newTab = window.open("", "_blank");
    try {
      const url = await downloadPoPdf(id);
      if (newTab) newTab.location.href = url;
      else window.open(url, "_blank");
    } catch {
      if (newTab) newTab.close();
      showToast("Failed to generate PDF", "error");
    }
  };

  const statusChips = [
    { value: "", label: "All" },
    { value: "Draft", label: "Drafts" },
    { value: "Approved", label: "Approved" },
    { value: "Cancelled", label: "Cancelled" },
  ];

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
      field: "actions", headerName: "Actions", width: 170, sortable: false,
      renderCell: (p) => (
        <Box sx={{ display: "flex", gap: 0.5, alignItems: "center" }}>
          <Tooltip title="View PO">
            <Button size="small" variant="outlined" startIcon={<VisibilityIcon />} onClick={(e) => { e.stopPropagation(); navigate(`/purchase/orders/view/${p.row.id}`); }}>
              View
            </Button>
          </Tooltip>
          {p.row.status === "Draft" && (
            <Tooltip title="Edit Draft">
              <IconButton size="small" color="primary" onClick={(e) => { e.stopPropagation(); navigate(`/purchase/orders/edit/${p.row.id}`); }}><EditIcon fontSize="small" /></IconButton>
            </Tooltip>
          )}
          <Tooltip title="View PO PDF">
            <IconButton size="small" color="secondary" onClick={(e) => { e.stopPropagation(); handleViewPdf(p.row.id); }}><PictureAsPdfIcon fontSize="small" /></IconButton>
          </Tooltip>
          {p.row.status === "Draft" && (
            <Tooltip title="Approve">
              <IconButton size="small" color="success" onClick={(e) => { e.stopPropagation(); handleApproveClick(p.row.id); }}><CheckCircleIcon fontSize="small" /></IconButton>
            </Tooltip>
          )}
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ p: 3, maxWidth: 1600 }}>
      {/* ── Title + Action Bar ── */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, gap: 2, flexWrap: "wrap" }}>
        <Typography variant="h4" sx={{ fontWeight: "bold", color: "var(--heading-color)" }}>
          {statusFilter === "Draft" ? "Draft Purchase Orders" : "Purchase Orders"}
        </Typography>
        <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={fetchData}>Refresh</Button>
          <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={() => navigate("/purchase/orders/add")}>New PO</Button>
        </Box>
      </Box>

      <Card sx={{ borderRadius: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
        <CardContent>
          <Box sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap", alignItems: "center" }}>
            <TextField size="small" placeholder="Search PO # or supplier..." value={search} onChange={(e) => setSearch(e.target.value)}
              InputProps={{ startAdornment: <SearchIcon sx={{ mr: 1, color: "gray" }} /> }} sx={{ minWidth: 300 }} />
            <Box sx={{ flex: 1 }} />
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
              {statusChips.map((c) => (
                <Button key={c.value || "all"} size="small"
                  variant={statusFilter === c.value ? "contained" : "text"}
                  color={c.value === "Draft" ? "warning" : c.value === "Approved" ? "success" : c.value === "Cancelled" ? "error" : "primary"}
                  onClick={() => setSearchParams(c.value ? { status: c.value } : {})}
                  sx={{ fontSize: "0.8rem" }}>
                  {c.label}
                </Button>
              ))}
            </Box>
          </Box>
          {loading && <LinearProgress sx={{ mb: 1 }} />}
          <div style={{ height: 520, width: "100%" }}>
            <DataGrid rows={rows} columns={columns} getRowId={(r) => r.id} pageSizeOptions={[10, 25, 50]}
              onRowClick={(p) => navigate(`/purchase/orders/view/${p.row.id}`)}
              initialState={{ pagination: { paginationModel: { pageSize: 25 } } }} disableColumnMenu loading={loading}
              sx={{ border: 0, "& .MuiDataGrid-columnHeaders": { bgcolor: "#f2f4f7", fontWeight: 700 },
                "& .MuiDataGrid-row:hover": { bgcolor: "#f8fafc" }, "& .MuiDataGrid-cell": { fontSize: ".92rem" } }} />
          </div>
        </CardContent>
      </Card>
      <Dialog open={confirm.open} onClose={() => setConfirm({ open: false, id: null })}>
        <DialogTitle>Approve Purchase Order?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to approve this purchase order? Approved POs are locked from further editing.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirm({ open: false, id: null })}>Cancel</Button>
          <Button onClick={confirmApprove} variant="contained" color="success">Approve</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
