import React, { useEffect, useState, useCallback } from "react";
import {
  Box, Card, CardContent, Typography, TextField, Button, Grid, MenuItem,
  IconButton, LinearProgress, Table, TableHead, TableRow, TableCell, TableBody,
  InputAdornment, Tooltip, Chip
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import SendIcon from "@mui/icons-material/Send";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import axios from "axios";
import { useToast } from "../../../../context/ToastContext";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import ItemSelectDialog from "../../Stores/ItemMaster/ItemSelectDialog";
import CountedTextArea from "../../../Common/CountedTextArea";

const API = "/api/erp/stores/grn";
const PO_API = "/api/erp/purchase/orders";
const ITEMS_API = "/api/erp/stores/items";
const SUPPLIER_API = "/api/erp/purchase/suppliers";
const GATE_API = "/api/erp/stores/gate-entry";

const IR_TYPES = [
  { value: "GRR", label: "GRR", desc: "Goods Receipt Record — standard material receipt against PO" },
  { value: "Jobwork", label: "Jobwork", desc: "Jobwork return / receipt from third-party processor" },
  { value: "Resharpening", label: "Resharpening", desc: "Tool resharpening return" },
  { value: "Loan", label: "Loan", desc: "Loan / temporary material receipt" },
  { value: "Maintenance", label: "Maintenance", desc: "Maintenance / spare parts receipt" },
];

const emptyItem = () => ({
  po_item_id: null, item_id: "", item_code: "", item_name: "",
  ordered_qty: 0, received_qty: 0, accepted_qty: 0, rejected_qty: 0,
  reject_reason: "", rate: 0, gst_rate: 0, gst_amount: 0, amount: 0,
});

export default function GRNForm() {
  const { id } = useParams();
  const location = useLocation();
  const isView = location.pathname.includes("/view/");
  const isEdit = Boolean(id) && !isView;
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [pos, setPos] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [gateEntries, setGateEntries] = useState([]);
  const [allItems, setAllItems] = useState([]);
  const [itemDialog, setItemDialog] = useState(null);

  const [header, setHeader] = useState({
    grn_no: "", grn_date: new Date().toISOString().split("T")[0],
    po_id: "", supplier_id: "", invoice_no: "", invoice_date: "", gate_entry_no: "",
    status: "Draft", received_by: "", notes: "",
    approval_status: "Pending", approved_by: "", approved_date: "", approval_remarks: "",
    qa_status: "Pending", qa_by: "", qa_date: "", qa_remarks: "",
    ir_type: "GRR",
  });
  const [items, setItems] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([
      axios.get(PO_API).catch(() => ({ data: [] })),
      axios.get(SUPPLIER_API, { params: { is_active: true } }).catch(() => ({ data: [] })),
      axios.get(GATE_API, { params: { entry_type: "Inward" } }).catch(() => ({ data: [] })),
      axios.get(ITEMS_API).catch(() => ({ data: [] })),
    ]).then(([po, sup, gate, itemsRes]) => {
      setPos(po.data || []);
      setSuppliers(sup.data || []);
      setGateEntries(gate.data || []);
      setAllItems(itemsRes.data || []);
    });
  }, []);

  useEffect(() => {
    if (!id) {
      setHeader((p) => ({ ...p, grn_no: '' }));
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      setLoading(true);
      axios.get(`${API}/${id}`).then(({ data }) => {
        setHeader({
          grn_no: data.grn_no || "", grn_date: data.grn_date?.split("T")[0] || "",
          po_id: data.po_id || "", supplier_id: data.supplier_id || "",
          invoice_no: data.invoice_no || "", invoice_date: data.invoice_date?.split("T")[0] || "",
          gate_entry_no: data.gate_entry_no || "", status: data.status || "Draft",
          received_by: data.received_by || "", notes: data.notes || "",
          approval_status: data.approval_status || "Pending", approved_by: data.approved_by || "",
          approved_date: data.approved_date?.split("T")[0] || "", approval_remarks: data.approval_remarks || "",
          qa_status: data.qa_status || "Pending", qa_by: data.qa_by || "",
          qa_date: data.qa_date?.split("T")[0] || "", qa_remarks: data.qa_remarks || "",
          ir_type: data.ir_type || "GRR",
        });
        if (data.items) setItems(data.items.map((it) => ({
          po_item_id: it.po_item_id, item_id: it.item_id, item_code: it.item_code || "",
          item_name: it.item_name || "", ordered_qty: parseFloat(it.ordered_qty || 0),
          received_qty: parseFloat(it.received_qty || 0), accepted_qty: parseFloat(it.accepted_qty || 0),
          rejected_qty: parseFloat(it.rejected_qty || 0), reject_reason: it.reject_reason || "",
          rate: parseFloat(it.rate || 0), gst_rate: parseFloat(it.gst_rate || 0),
          gst_amount: parseFloat(it.gst_amount || 0), amount: parseFloat(it.amount || 0),
        })));
      }).catch(() => showToast("Failed to load GRR", "error")).finally(() => setLoading(false));
    }
  }, [id]);

  const loadPOItems = useCallback(async (poId) => {
    if (!poId) { setItems([]); return; }
    try {
      const { data } = await axios.get(`${PO_API}/${poId}`);
      setHeader((h) => ({ ...h, supplier_id: data.supplier_id || h.supplier_id }));
      if (data.items) setItems(data.items.map((it) => ({
        po_item_id: it.id, item_id: it.item_id || "", item_code: it.item_code || "",
        item_name: it.item_name || "", ordered_qty: parseFloat(it.quantity || 0),
        received_qty: 0, accepted_qty: 0, rejected_qty: 0, reject_reason: "",
        rate: parseFloat(it.rate || 0), gst_rate: parseFloat(it.gst_rate || 0),
        gst_amount: parseFloat(it.gst_amount || 0), amount: parseFloat(it.amount || 0),
      })));
    } catch { showToast("Failed to load PO", "error"); }
  }, [showToast]);

  const handleHeaderChange = (field) => (e) => setHeader((h) => ({ ...h, [field]: e.target.value }));

  const addItem = () => setItems((prev) => [...prev, emptyItem()]);
  const removeItem = (idx) => { if (items.length > 1) setItems((prev) => prev.filter((_, i) => i !== idx)); };

  const handleItemChange = (idx, field) => (e) => {
    setItems((prev) => {
      const updated = [...prev];
      updated[idx][field] = e.target.value;
      if (field === "accepted_qty" || field === "rate" || field === "gst_rate") {
        const accepted = parseFloat(updated[idx].accepted_qty) || 0;
        const ordered = parseFloat(updated[idx].ordered_qty) || 0;
        const rate = parseFloat(updated[idx].rate) || 0;
        const gstRate = parseFloat(updated[idx].gst_rate) || 0;
        updated[idx].rejected_qty = Math.max(0, ordered - accepted);
        updated[idx].received_qty = accepted;
        updated[idx].amount = accepted * rate;
        updated[idx].gst_amount = updated[idx].amount * gstRate / 100;
      }
      return updated;
    });
  };

  const handleItemSelect = (item) => {
    if (itemDialog === null || itemDialog < 0) return;
    setItems((prev) => {
      const updated = [...prev];
      updated[itemDialog] = {
        ...updated[itemDialog],
        item_id: item.id,
        item_code: item.item_code || "",
        item_name: item.item_name || "",
      };
      return updated;
    });
    setItemDialog(null);
  };

  const canEdit = header.status === "Draft" && !isView;
  const canSubmit = header.status === "Draft" && items.some((i) => parseFloat(i.accepted_qty) > 0);

  const save = async (status, e) => {
    if (e) e.preventDefault();
    if (!header.grn_no || !header.grn_date) { showToast("GRR # and Date are required", "warning"); return; }
    if (status === "Received" && !items.some((i) => parseFloat(i.accepted_qty) > 0)) {
      showToast("Add at least one item with accepted qty > 0", "warning"); return;
    }
    setSaving(true);
    try {
      const payload = {
        ...header, status,
        supplier_id: parseInt(header.supplier_id) || null,
        po_id: parseInt(header.po_id) || null,
        items: items.map((i) => ({
          po_item_id: i.po_item_id || null,
          item_id: i.item_id || null,
          item_code: i.item_code || "", item_name: i.item_name || "",
          ordered_qty: parseFloat(i.ordered_qty) || 0,
          received_qty: parseFloat(i.received_qty) || 0,
          accepted_qty: parseFloat(i.accepted_qty) || 0,
          rejected_qty: parseFloat(i.rejected_qty) || 0,
          reject_reason: i.reject_reason || "",
          rate: parseFloat(i.rate) || 0,
          gst_rate: parseFloat(i.gst_rate) || 0,
          gst_amount: parseFloat(i.gst_amount) || 0,
          amount: parseFloat(i.amount) || 0,
        })),
      };
      if (isEdit) { await axios.put(`${API}/${id}`, payload); showToast("Updated", "success"); }
      else { await axios.post(API, payload); showToast("Created", "success"); }
      navigate("/stores/grr");
    } catch (err) { showToast(err.response?.data?.error || "Failed", "error"); }
    finally { setSaving(false); }
  };

  const handleSubmit = (e) => save(submitting ? "Received" : "Draft", e);

  if (loading) return <LinearProgress />;

  const fsx = {
    "& .MuiInputBase-root": { fontSize: "0.88rem", height: 34 },
    "& .MuiInputLabel-root": { fontSize: "0.88rem", mt: -0.25 },
    "& .MuiInputLabel-shrink": { mt: 0 }
  };

  const fTextAreaSx = {
    "& .MuiInputBase-root": { fontSize: "0.88rem" },
    "& .MuiInputLabel-root": { fontSize: "0.88rem" }
  };

  const irType = IR_TYPES.find((t) => t.value === header.ir_type);
  const poObj = pos.find((p) => p.id === Number(header.po_id));
  const supplierObj = suppliers.find((s) => s.id === Number(header.supplier_id));

  const totals = items.reduce((acc, it) => ({
    ordered: acc.ordered + (parseFloat(it.ordered_qty) || 0),
    accepted: acc.accepted + (parseFloat(it.accepted_qty) || 0),
    rejected: acc.rejected + (parseFloat(it.rejected_qty) || 0),
    amount: acc.amount + (parseFloat(it.amount) || 0),
    gst: acc.gst + (parseFloat(it.gst_amount) || 0),
  }), { ordered: 0, accepted: 0, rejected: 0, amount: 0, gst: 0 });

  return (
    <Box sx={{ p: 3, maxWidth: 1600, fontSize: "0.95rem" }}>
      {/* Title + Action Bar */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, flexWrap: "wrap", gap: 1 }}>
        <Typography variant="h4" sx={{ fontWeight: "bold", color: "var(--heading-color)" }}>
          {isView ? "GRR Details" : isEdit ? "Edit GRR" : "New GRR"}
          {header.status && (
            <Chip label={header.status} size="small" sx={{ ml: 1.5, verticalAlign: "middle" }}
              color={header.status === "Received" ? "success" : header.status === "Draft" ? "default" : "primary"} />
          )}
        </Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          {canEdit && (
            <>
              <Button variant="contained" color="primary" size="medium" onClick={handleSubmit}
                startIcon={<SaveIcon />} disabled={saving}>
                {saving ? "Saving..." : "Save as Draft"}
              </Button>
              <Button variant="contained" color="success" size="medium"
                startIcon={<SendIcon />} disabled={saving || !canSubmit}
                onClick={() => { setSubmitting(true); setTimeout(() => handleSubmit(), 0); }}>
                {saving ? "Saving..." : "Submit & Receive"}
              </Button>
            </>
          )}
          <Button variant="outlined" color="secondary" size="medium" startIcon={<CancelIcon />}
            onClick={() => navigate("/stores/grr")}>
            {isView ? "Back" : "Cancel"}
          </Button>
        </Box>
      </Box>

      {/* Header Information */}
      <Card sx={{ borderRadius: 2, boxShadow: "0 1px 6px rgba(0,0,0,0.05)", mb: 2.5, border: "1px solid #e2e8f0" }}>
        <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
          <Typography variant="subtitle2" sx={{ mb: 1.5, color: "var(--heading-color)", fontWeight: 700, fontSize: "1rem" }}>
            Header Information
          </Typography>
          <Grid container spacing={1} sx={{ mb: 1 }}>
            <Grid item xs={12} sm={6} md={2} sx={{ width: 160, flex: "0 0 auto" }}>
              <TextField label="GRR No *" size="small" fullWidth value={header.grn_no}
                onChange={handleHeaderChange("grn_no")} required disabled={isView || isEdit}
                InputLabelProps={{ shrink: true }} sx={fsx} />
            </Grid>
            <Grid item xs={6} sm={3} md={2} sx={{ width: 150, flex: "0 0 auto" }}>
              <TextField label="Date *" type="date" size="small" fullWidth value={header.grn_date}
                onChange={handleHeaderChange("grn_date")} InputLabelProps={{ shrink: true }} required disabled={isView} sx={fsx} />
            </Grid>
            <Grid item xs={6} sm={3} md={2} sx={{ width: 150, flex: "0 0 auto" }}>
              <TextField label="IR Type" select size="small" fullWidth value={header.ir_type}
                onChange={handleHeaderChange("ir_type")} disabled={isView} InputLabelProps={{ shrink: true }} sx={fsx}>
                {IR_TYPES.map((t) => <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={6} sm={3} md={2} sx={{ width: 150, flex: "0 0 auto" }}>
              <TextField label="Received By" size="small" fullWidth value={header.received_by}
                onChange={handleHeaderChange("received_by")} disabled={isView} InputLabelProps={{ shrink: true }} sx={fsx} />
            </Grid>
            <Grid item xs={6} sm={3} md={2} sx={{ width: 160, flex: "0 0 auto" }}>
              <TextField label="Status" size="small" fullWidth value={header.status} disabled InputLabelProps={{ shrink: true }} sx={fsx} />
            </Grid>
          </Grid>

          <Grid container spacing={2}>
            {/* PO Autocomplete */}
            <Grid item xs={12} md={6}>
              <TextField select size="small" fullWidth label="PO Reference *" value={header.po_id}
                onChange={(e) => { const val = e.target.value; setHeader((h) => ({ ...h, po_id: val })); if (val) loadPOItems(val); }}
                disabled={isView || isEdit} required InputLabelProps={{ shrink: true }} sx={fsx}
                SelectProps={{ displayEmpty: true }}>
                <MenuItem value="">-- Select PO --</MenuItem>
                {pos.map((po) => (
                  <MenuItem key={po.id} value={po.id}>{po.po_no} — {po.supplier?.supplier_name || "N/A"} ({po.po_date?.split("T")[0] || ""})</MenuItem>
                ))}
              </TextField>
            </Grid>
            {/* Supplier */}
            <Grid item xs={12} md={6}>
              <TextField select size="small" fullWidth label="Supplier" value={header.supplier_id}
                onChange={handleHeaderChange("supplier_id")} disabled={isView} InputLabelProps={{ shrink: true }} sx={fsx}
                SelectProps={{ displayEmpty: true }}>
                <MenuItem value="">-- Select --</MenuItem>
                {suppliers.map((s) => (
                  <MenuItem key={s.id} value={s.id}>{s.supplier_code} — {s.supplier_name}</MenuItem>
                ))}
              </TextField>
            </Grid>
            {/* Gate Entry */}
            <Grid item xs={12} md={4}>
              <TextField select size="small" fullWidth label="Gate Entry" value={header.gate_entry_no}
                onChange={handleHeaderChange("gate_entry_no")} disabled={isView} InputLabelProps={{ shrink: true }} sx={fsx}
                SelectProps={{ displayEmpty: true }}>
                <MenuItem value="">-- Select --</MenuItem>
                {gateEntries.filter((g) => g.entry_type === "Inward").map((g) => (
                  <MenuItem key={g.entry_no} value={g.entry_no}>{g.entry_no}{g.party_name ? ` — ${g.party_name}` : ""}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField label="Invoice No" size="small" fullWidth value={header.invoice_no}
                onChange={handleHeaderChange("invoice_no")} disabled={isView} InputLabelProps={{ shrink: true }} sx={fsx} />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField label="Invoice Date" type="date" size="small" fullWidth value={header.invoice_date}
                onChange={handleHeaderChange("invoice_date")} disabled={isView} InputLabelProps={{ shrink: true }} sx={fsx} />
            </Grid>
            {/* Notes + Info Box side by side */}
            <Grid item xs={12} md={6}>
              <TextField label="Notes" size="small" fullWidth multiline rows={2} value={header.notes || ""}
                onChange={handleHeaderChange("notes")} disabled={isView} placeholder="Enter any extra notes..."
                inputProps={{ maxLength: 500 }}
                helperText={`${(header.notes || "").length} / 500`}
                sx={fTextAreaSx}
                FormHelperTextProps={{ sx: { textAlign: "right", m: 0, mt: 0.25, fontSize: "0.8rem", color: (header.notes || "").length > 450 ? "error.main" : "text.secondary" } }} />
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{
                display: "flex", alignItems: "flex-start", gap: 1,
                p: 1, borderRadius: 1.5, height: "100%", boxSizing: "border-box",
                bgcolor: "#f8fafc", border: "1px solid #e2e8f0", borderLeft: "3px solid #3b82f6",
              }}>
                <SearchIcon sx={{ fontSize: 18, color: "#3b82f6", mt: 0.15 }} />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: "#0f172a", display: "block", mb: 0.5, fontSize: "0.8rem" }}>
                    IR Type: <Box component="span" sx={{ color: "#2563eb" }}>{irType?.label}</Box> — {irType?.desc}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#64748b", display: "block", lineHeight: 1.35, fontSize: "0.75rem" }}>
                    {poObj ? `PO: ${poObj.po_no} | Supplier: ${supplierObj?.supplier_name || "—"}` : "Select a PO to load items"}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Item Details */}
      <Card sx={{ borderRadius: 2, boxShadow: "0 1px 6px rgba(0,0,0,0.05)", mb: 2.5, border: "1px solid #e2e8f0" }}>
        <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
            <Typography variant="subtitle2" sx={{ color: "var(--heading-color)", fontWeight: 700, fontSize: "1rem" }}>
              Item Details
            </Typography>
            {canEdit && (
              <Button size="small" variant="contained" startIcon={<AddIcon />} onClick={addItem} sx={{ height: 28 }}>Add Item</Button>
            )}
          </Box>
          <Box sx={{ overflowX: "auto" }}>
            <Table size="small" sx={{ minWidth: 1400 }}>
              <TableHead>
                <TableRow sx={{ bgcolor: "#f8fafc" }}>
                  <TableCell sx={{ fontWeight: 700, whiteSpace: "nowrap", fontSize: "0.84rem", py: 0.75, color: "#475569", width: 60 }}>#</TableCell>
                  <TableCell sx={{ fontWeight: 700, whiteSpace: "nowrap", fontSize: "0.84rem", py: 0.75, color: "#475569", width: 110 }}>Item Code</TableCell>
                  <TableCell sx={{ fontWeight: 700, whiteSpace: "nowrap", fontSize: "0.84rem", py: 0.75, color: "#475569" }}>Description *</TableCell>
                  <TableCell sx={{ fontWeight: 700, whiteSpace: "nowrap", fontSize: "0.84rem", py: 0.75, color: "#475569", width: 80 }}>Ordered</TableCell>
                  <TableCell sx={{ fontWeight: 700, whiteSpace: "nowrap", fontSize: "0.84rem", py: 0.75, color: "#475569", width: 80 }}>Accepted *</TableCell>
                  <TableCell sx={{ fontWeight: 700, whiteSpace: "nowrap", fontSize: "0.84rem", py: 0.75, color: "#475569", width: 80 }}>Rejected</TableCell>
                  <TableCell sx={{ fontWeight: 700, whiteSpace: "nowrap", fontSize: "0.84rem", py: 0.75, color: "#475569", width: 130 }}>Reject Reason</TableCell>
                  <TableCell sx={{ fontWeight: 700, whiteSpace: "nowrap", fontSize: "0.84rem", py: 0.75, color: "#475569", width: 80 }}>Rate</TableCell>
                  <TableCell sx={{ fontWeight: 700, whiteSpace: "nowrap", fontSize: "0.84rem", py: 0.75, color: "#475569", width: 70 }}>GST %</TableCell>
                  <TableCell sx={{ fontWeight: 700, whiteSpace: "nowrap", fontSize: "0.84rem", py: 0.75, color: "#475569", width: 100 }}>GST Amt</TableCell>
                  <TableCell sx={{ fontWeight: 700, whiteSpace: "nowrap", fontSize: "0.84rem", py: 0.75, color: "#475569", width: 100 }}>Amount</TableCell>
                  {canEdit && <TableCell sx={{ width: 36, py: 0.75 }} />}
                </TableRow>
              </TableHead>
              <TableBody>
                {items.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={canEdit ? 13 : 12} align="center" sx={{ py: 4, color: "gray" }}>
                      Select a PO to load items, or click "Add Item" to enter manually.
                    </TableCell>
                  </TableRow>
                )}
                {items.map((it, idx) => (
                  <TableRow key={idx} sx={{ "&:hover": { bgcolor: "#f8fafc" }, verticalAlign: "top" }}>
                    <TableCell sx={{ py: 0.5, px: 0.5, verticalAlign: "top" }}>
                      <Typography variant="body2" sx={{ fontSize: "0.84rem", pt: 1, textAlign: "center" }}>{idx + 1}</Typography>
                    </TableCell>
                    {/* Item Code (selectable via dialog) */}
                    <TableCell sx={{ py: 0.5, px: 0.5, verticalAlign: "top" }}>
                      <TextField size="small" fullWidth value={it.item_code}
                        onClick={() => canEdit && setItemDialog(idx)}
                        InputProps={{
                          readOnly: true,
                          endAdornment: canEdit && (
                            <InputAdornment position="end">
                              <IconButton size="small" onClick={() => setItemDialog(idx)} sx={{ p: 0 }}>
                                <SearchIcon sx={{ fontSize: 14 }} />
                              </IconButton>
                            </InputAdornment>
                          )
                        }}
                        disabled={isView}
                        placeholder={canEdit ? "Select" : ""}
                        sx={{ "& .MuiInputBase-root": { fontSize: "0.84rem", height: 44, cursor: canEdit ? "pointer" : "default" } }} />
                    </TableCell>
                    {/* Description */}
                    <TableCell sx={{ py: 0.5, px: 0.5, verticalAlign: "top", minWidth: 180 }}>
                      <Tooltip title={it.item_name || ""} arrow>
                        <TextField size="small" fullWidth multiline rows={2} value={it.item_name || ""}
                          onChange={handleItemChange(idx, "item_name")} required disabled={isView}
                          placeholder="Description"
                          sx={{
                            "& .MuiInputBase-root": { fontSize: "0.84rem", height: 44, p: "4px 8px", alignItems: "flex-start" },
                            "& .MuiInputBase-input": { height: "100% !important", overflow: "auto" }
                          }} />
                      </Tooltip>
                    </TableCell>
                    {/* Ordered */}
                    <TableCell sx={{ py: 0.5, px: 0.5, verticalAlign: "top" }}>
                      <TextField size="small" fullWidth type="number" value={it.ordered_qty}
                        InputProps={{ readOnly: true }}
                        sx={{ "& .MuiInputBase-root": { fontSize: "0.84rem", height: 44, bgcolor: "#f8fafc" } }} />
                    </TableCell>
                    {/* Accepted */}
                    <TableCell sx={{ py: 0.5, px: 0.5, verticalAlign: "top" }}>
                      <TextField size="small" fullWidth type="number" value={it.accepted_qty}
                        onChange={handleItemChange(idx, "accepted_qty")} disabled={isView}
                        placeholder="0" sx={{ "& .MuiInputBase-root": { fontSize: "0.84rem", height: 44 } }} />
                    </TableCell>
                    {/* Rejected (auto) */}
                    <TableCell sx={{ py: 0.5, px: 0.5, verticalAlign: "top" }}>
                      <TextField size="small" fullWidth type="number" value={it.rejected_qty}
                        InputProps={{ readOnly: true }}
                        sx={{ "& .MuiInputBase-root": { fontSize: "0.84rem", height: 44, bgcolor: "#fff0f0", color: "#d32f2f" } }} />
                    </TableCell>
                    {/* Reject Reason */}
                    <TableCell sx={{ py: 0.5, px: 0.5, verticalAlign: "top" }}>
                      <TextField size="small" fullWidth value={it.reject_reason}
                        onChange={handleItemChange(idx, "reject_reason")} disabled={isView}
                        placeholder="Reason" sx={{ "& .MuiInputBase-root": { fontSize: "0.84rem", height: 44 } }} />
                    </TableCell>
                    {/* Rate */}
                    <TableCell sx={{ py: 0.5, px: 0.5, verticalAlign: "top" }}>
                      <TextField size="small" fullWidth type="number" value={it.rate}
                        onChange={handleItemChange(idx, "rate")} disabled={isView}
                        placeholder="0.00" sx={{ "& .MuiInputBase-root": { fontSize: "0.84rem", height: 44 } }} />
                    </TableCell>
                    {/* GST % */}
                    <TableCell sx={{ py: 0.5, px: 0.5, verticalAlign: "top" }}>
                      <TextField size="small" fullWidth type="number" value={it.gst_rate}
                        onChange={handleItemChange(idx, "gst_rate")} disabled={isView}
                        placeholder="0" sx={{ "& .MuiInputBase-root": { fontSize: "0.84rem", height: 44 } }} />
                    </TableCell>
                    {/* GST Amt */}
                    <TableCell sx={{ py: 0.5, px: 0.5, verticalAlign: "top" }}>
                      <TextField size="small" fullWidth type="number" value={it.gst_amount}
                        InputProps={{ readOnly: true }}
                        sx={{ "& .MuiInputBase-root": { fontSize: "0.84rem", height: 44, bgcolor: "#f8fafc" } }} />
                    </TableCell>
                    {/* Amount */}
                    <TableCell sx={{ py: 0.5, px: 0.5, verticalAlign: "top" }}>
                      <TextField size="small" fullWidth type="number" value={it.amount}
                        InputProps={{ readOnly: true }}
                        sx={{ "& .MuiInputBase-root": { fontSize: "0.84rem", height: 44, bgcolor: "#f8fafc", fontWeight: 700 } }} />
                    </TableCell>
                    {/* Delete */}
                    {canEdit && (
                      <TableCell sx={{ py: 0.5, px: 0.5, verticalAlign: "top" }}>
                        <IconButton size="small" color="error" onClick={() => removeItem(idx)}
                          disabled={items.length <= 1} sx={{ height: 44 }}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
                {/* Totals row */}
                {items.length > 0 && (
                  <TableRow sx={{ bgcolor: "#f0f4ff" }}>
                    <TableCell colSpan={3} sx={{ fontWeight: 700, fontSize: "0.84rem", py: 0.75 }}>TOTALS</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: "0.84rem", py: 0.75, textAlign: "right" }}>{Number(totals.ordered).toFixed(2)}</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: "0.84rem", py: 0.75, textAlign: "right" }}>{Number(totals.accepted).toFixed(2)}</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: "0.84rem", py: 0.75, textAlign: "right", color: "#d32f2f" }}>{Number(totals.rejected).toFixed(2)}</TableCell>
                    <TableCell />
                    <TableCell />
                    <TableCell />
                    <TableCell sx={{ fontWeight: 700, fontSize: "0.84rem", py: 0.75, textAlign: "right" }}>{Number(totals.gst).toFixed(2)}</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: "0.84rem", py: 0.75, textAlign: "right", color: "#1565c0" }}>{Number(totals.amount).toFixed(2)}</TableCell>
                    {canEdit && <TableCell />}
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Box>
        </CardContent>
      </Card>

      {/* Quality Check (QA) */}
      <Card sx={{ borderRadius: 2, boxShadow: "0 1px 6px rgba(0,0,0,0.05)", mb: 2.5, border: "1px solid #e2e8f0" }}>
        <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
          <Typography variant="subtitle2" sx={{ mb: 1.5, color: "var(--heading-color)", fontWeight: 700, fontSize: "1rem" }}>
            Quality Check (QA)
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <TextField label="QA Status" select size="small" fullWidth value={header.qa_status}
                onChange={handleHeaderChange("qa_status")} disabled={isView} InputLabelProps={{ shrink: true }} sx={fsx}>
                <MenuItem value="Pending">Pending</MenuItem>
                <MenuItem value="Passed">Passed</MenuItem>
                <MenuItem value="Partial">Partial</MenuItem>
                <MenuItem value="Rejected">Rejected</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField label="QA By" size="small" fullWidth value={header.qa_by}
                onChange={handleHeaderChange("qa_by")} disabled={isView} InputLabelProps={{ shrink: true }} sx={fsx} />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField label="QA Date" type="date" size="small" fullWidth value={header.qa_date}
                onChange={handleHeaderChange("qa_date")} disabled={isView} InputLabelProps={{ shrink: true }} sx={fsx} />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField label="QA Remarks" size="small" fullWidth value={header.qa_remarks}
                onChange={handleHeaderChange("qa_remarks")} disabled={isView} InputLabelProps={{ shrink: true }} sx={fsx} />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Approval */}
      <Card sx={{ borderRadius: 2, boxShadow: "0 1px 6px rgba(0,0,0,0.05)", mb: 2.5, border: "1px solid #e2e8f0" }}>
        <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
          <Typography variant="subtitle2" sx={{ mb: 1.5, color: "var(--heading-color)", fontWeight: 700, fontSize: "1rem" }}>
            Approval
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <TextField label="Approval Status" select size="small" fullWidth value={header.approval_status}
                onChange={handleHeaderChange("approval_status")} disabled={isView} InputLabelProps={{ shrink: true }} sx={fsx}>
                <MenuItem value="Pending">Pending</MenuItem>
                <MenuItem value="Approved">Approved</MenuItem>
                <MenuItem value="Rejected">Rejected</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField label="Approved By" size="small" fullWidth value={header.approved_by}
                onChange={handleHeaderChange("approved_by")} disabled={isView} InputLabelProps={{ shrink: true }} sx={fsx} />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField label="Approved Date" type="date" size="small" fullWidth value={header.approved_date}
                onChange={handleHeaderChange("approved_date")} disabled={isView} InputLabelProps={{ shrink: true }} sx={fsx} />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField label="Approval Remarks" size="small" fullWidth value={header.approval_remarks}
                onChange={handleHeaderChange("approval_remarks")} disabled={isView} InputLabelProps={{ shrink: true }} sx={fsx} />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Item Select Dialog */}
      <ItemSelectDialog
        open={itemDialog !== null}
        onClose={() => setItemDialog(null)}
        onSelect={handleItemSelect}
        title="Select Item"
        data={allItems}
        columns={[
          { key: "item_code", label: "Code" },
          { key: "item_name", label: "Name" },
          { key: "item_description", label: "Description" },
        ]}
      />
    </Box>
  );
}
