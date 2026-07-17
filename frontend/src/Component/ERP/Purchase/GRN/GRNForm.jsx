import React, { useEffect, useState } from "react";
import { Box, Card, CardContent, Typography, TextField, Button, Grid, MenuItem, IconButton, LinearProgress, Autocomplete } from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import axios from "axios";
import { useToast } from "../../../../context/ToastContext";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import CountedTextArea from "../../../Common/CountedTextArea";

const API = "/api/erp/stores/grn";
const PO_API = "/api/erp/purchase/orders";
const SUPPLIER_API = "/api/erp/purchase/suppliers";
const GATE_API = "/api/erp/stores/gate-entry";

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
  const [header, setHeader] = useState({
    grn_no: "", grn_date: new Date().toISOString().split("T")[0],
    po_id: "", supplier_id: "", invoice_no: "", invoice_date: "", gate_entry_no: "",
    status: "Received", received_by: "", notes: "",
    approval_status: "Pending", approved_by: "", approved_date: "", approval_remarks: "",
    qa_status: "Pending", qa_by: "", qa_date: "", qa_remarks: "",
    ir_type: "GRR",
  });
  const [items, setItems] = useState([]);

  useEffect(() => {
    axios.get(SUPPLIER_API, { params: { is_active: true } }).then(({ data }) => setSuppliers(data)).catch(() => {});
    axios.get(PO_API).then(({ data }) => setPos(data)).catch(() => {});
    axios.get(GATE_API, { params: { entry_type: "Inward" } }).then(({ data }) => setGateEntries(data)).catch(() => {});
    if (id) {
      setLoading(true);
      axios.get(`${API}/${id}`).then(({ data }) => {
        setHeader({
          grn_no: data.grn_no || "", grn_date: data.grn_date?.split("T")[0] || "",
          po_id: data.po_id || "", supplier_id: data.supplier_id || "",
          invoice_no: data.invoice_no || "", invoice_date: data.invoice_date?.split("T")[0] || "",
          gate_entry_no: data.gate_entry_no || "", status: data.status || "Received",
          received_by: data.received_by || "", notes: data.notes || "",
          approval_status: data.approval_status || "Pending", approved_by: data.approved_by || "",
          approved_date: data.approved_date?.split("T")[0] || "", approval_remarks: data.approval_remarks || "",
          qa_status: data.qa_status || "Pending", qa_by: data.qa_by || "",
          qa_date: data.qa_date?.split("T")[0] || "", qa_remarks: data.qa_remarks || "",
          ir_type: data.ir_type || "GRR",
        });
        if (data.items) setItems(data.items.map((it) => ({
          po_item_id: it.po_item_id, item_id: it.item_id, item_code: it.item_code,
          item_name: it.item_name, ordered_qty: it.ordered_qty, received_qty: it.received_qty,
          accepted_qty: it.accepted_qty, rejected_qty: it.rejected_qty,
          reject_reason: it.reject_reason || "", rate: it.rate, amount: it.amount,
          gst_rate: it.gst_rate, gst_amount: it.gst_amount,
        })));
      }).catch(() => showToast("Failed to load GRR", "error")).finally(() => setLoading(false));
    }
  }, [id]);

  const loadPOItems = async (poId) => {
    if (!poId) { setItems([]); return; }
    try {
      const { data } = await axios.get(`${PO_API}/${poId}`);
      setHeader((h) => ({ ...h, supplier_id: data.supplier_id || h.supplier_id }));
      if (data.items) setItems(data.items.map((it) => ({
        po_item_id: it.id, item_id: it.item_id, item_code: it.item_code,
        item_name: it.item_name, ordered_qty: it.quantity,
        received_qty: 0, accepted_qty: 0, rejected_qty: 0, reject_reason: "",
        rate: it.rate, amount: it.amount,
        gst_rate: it.gst_rate, gst_amount: it.gst_amount,
      })));
    } catch { showToast("Failed to load PO", "error"); }
  };

  const handleItemChange = (idx, field) => (e) => {
    const updated = [...items];
    updated[idx][field] = e.target.value;
    if (field === "accepted_qty") {
      const accepted = parseFloat(e.target.value) || 0;
      const ordered = parseFloat(updated[idx].ordered_qty) || 0;
      updated[idx].rejected_qty = Math.max(0, ordered - accepted);
      updated[idx].received_qty = accepted;
      updated[idx].amount = accepted * (parseFloat(updated[idx].rate) || 0);
    }
    setItems(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!header.grn_no || !header.po_id) { showToast("GRR # and PO are required", "warning"); return; }
    setSaving(true);
    try {
      const payload = {
        ...header,
        supplier_id: parseInt(header.supplier_id),
        po_id: parseInt(header.po_id),
        items: items.map((i) => ({
          ...i, po_item_id: i.po_item_id || null,
          ordered_qty: parseFloat(i.ordered_qty) || 0,
          received_qty: parseFloat(i.received_qty) || 0,
          accepted_qty: parseFloat(i.accepted_qty) || 0,
          rejected_qty: parseFloat(i.rejected_qty) || 0,
          rate: parseFloat(i.rate) || 0,
          amount: parseFloat(i.amount) || 0,
          gst_rate: parseFloat(i.gst_rate) || 0,
          gst_amount: parseFloat(i.gst_amount) || 0,
        })),
      };
      if (isEdit) { await axios.put(`${API}/${id}`, payload); showToast("Updated", "success"); }
      else { await axios.post(API, payload); showToast("Created", "success"); }
      navigate("/stores/grr");
    } catch (err) { showToast(err.response?.data?.error || "Failed", "error"); }
    finally { setSaving(false); }
  };

  if (loading) return <LinearProgress />;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: "bold", color: "var(--heading-color)" }}>
        {isView ? "GRR Details" : isEdit ? "Edit GRR" : "New GRR"}
      </Typography>
      <form onSubmit={handleSubmit}>
        <Card sx={{ borderRadius: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.08)", mb: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2, color: "var(--heading-color)", fontWeight: 600 }}>Header</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={3}><TextField label="GRR No *" size="small" fullWidth value={header.grn_no} onChange={(e) => setHeader({ ...header, grn_no: e.target.value })} required disabled={isView} /></Grid>
              <Grid item xs={12} md={3}><TextField label="Date *" type="date" size="small" fullWidth value={header.grn_date} onChange={(e) => setHeader({ ...header, grn_date: e.target.value })} InputLabelProps={{ shrink: true }} required disabled={isView} /></Grid>
              <Grid item xs={12} md={3}>
                <TextField label="IR Type" select size="small" fullWidth value={header.ir_type}
                  onChange={(e) => setHeader({ ...header, ir_type: e.target.value })} disabled={isView}>
                  <MenuItem value="GRR">GRR</MenuItem>
                  <MenuItem value="Jobwork">Jobwork</MenuItem>
                  <MenuItem value="Resharpening">Resharpening</MenuItem>
                  <MenuItem value="Loan">Loan</MenuItem>
                  <MenuItem value="Maintenance">Maintenance</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} md={3}><TextField label="Received By" size="small" fullWidth value={header.received_by} onChange={(e) => setHeader({ ...header, received_by: e.target.value })} disabled={isView} /></Grid>

              <Grid item xs={12}>
                <Autocomplete
                  options={pos}
                  getOptionLabel={(o) => o.po_no || ""}
                  isOptionEqualToValue={(o, v) => o.id === v.id}
                  value={pos.find((p) => p.id === Number(header.po_id)) || null}
                  disabled={isView}
                  onChange={(e, val) => {
                    setHeader({ ...header, po_id: val ? val.id : "" });
                    if (val) loadPOItems(val.id);
                  }}
                  renderInput={(params) => (
                    <TextField {...params} label="PO Reference *" size="small" fullWidth required
                      InputProps={{ ...params.InputProps, startAdornment: <SearchIcon sx={{ mr: 1, color: "gray" }} /> }} />
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Autocomplete
                  options={suppliers}
                  getOptionLabel={(o) => o.supplier_name || ""}
                  isOptionEqualToValue={(o, v) => o.id === v.id}
                  value={suppliers.find((s) => s.id === Number(header.supplier_id)) || null}
                  disabled={isView}
                  onChange={(e, val) => setHeader({ ...header, supplier_id: val ? val.id : "" })}
                  renderInput={(params) => (
                    <TextField {...params} label="Supplier" size="small" fullWidth
                      InputProps={{ ...params.InputProps, startAdornment: <SearchIcon sx={{ mr: 1, color: "gray" }} /> }} />
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Autocomplete
                  options={gateEntries.filter((g) => g.entry_type === "Inward")}
                  getOptionLabel={(o) => `${o.entry_no}${o.party_name ? " — " + o.party_name : ""}`}
                  isOptionEqualToValue={(o, v) => o.entry_no === v.entry_no}
                  value={gateEntries.find((g) => g.entry_no === header.gate_entry_no) || null}
                  disabled={isView}
                  onChange={(e, val) => setHeader({ ...header, gate_entry_no: val ? val.entry_no : "" })}
                  renderInput={(params) => (
                    <TextField {...params} label="Gate Entry" size="small" fullWidth
                      InputProps={{ ...params.InputProps, startAdornment: <SearchIcon sx={{ mr: 1, color: "gray" }} /> }} />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={3}><TextField label="Invoice No" size="small" fullWidth value={header.invoice_no} onChange={(e) => setHeader({ ...header, invoice_no: e.target.value })} disabled={isView} /></Grid>
              <Grid item xs={12} md={3}><TextField label="Invoice Date" type="date" size="small" fullWidth value={header.invoice_date} onChange={(e) => setHeader({ ...header, invoice_date: e.target.value })} InputLabelProps={{ shrink: true }} disabled={isView} /></Grid>
              <Grid item xs={12}><CountedTextArea label="Notes" size="small" fullWidth rows={2} value={header.notes} onChange={(e) => setHeader({ ...header, notes: e.target.value })} disabled={isView} /></Grid>
            </Grid>
          </CardContent>
        </Card>

        <Card sx={{ borderRadius: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.08)", mb: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2, color: "var(--heading-color)", fontWeight: 600 }}>Items</Typography>
            {items.length === 0 && <Typography color="textSecondary">Select a PO to load items</Typography>}
            {items.map((it, idx) => (
              <Grid container spacing={1} key={idx} sx={{ mb: 1, pb: 1, borderBottom: "1px solid #eee", alignItems: "center" }}>
                <Grid item xs={12} md={3}><TextField label="Item" size="small" fullWidth value={it.item_name} InputProps={{ readOnly: true }} /></Grid>
                <Grid item xs={3} md={1.5}><TextField label="Ordered" type="number" size="small" fullWidth value={it.ordered_qty} InputProps={{ readOnly: true }} /></Grid>
                <Grid item xs={3} md={1.5}><TextField label="Accepted *" type="number" size="small" fullWidth value={it.accepted_qty} onChange={handleItemChange(idx, "accepted_qty")} disabled={isView} /></Grid>
                <Grid item xs={3} md={1.5}><TextField label="Rejected" size="small" fullWidth value={it.rejected_qty} InputProps={{ readOnly: true }} /></Grid>
                <Grid item xs={6} md={2.5}><TextField label="Reject Reason" size="small" fullWidth value={it.reject_reason} onChange={handleItemChange(idx, "reject_reason")} disabled={isView} /></Grid>
                <Grid item xs={3} md={1}><TextField label="Rate" size="small" fullWidth value={it.rate} InputProps={{ readOnly: true }} /></Grid>
                <Grid item xs={3} md={1}><TextField label="GST %" size="small" fullWidth value={it.gst_rate} InputProps={{ readOnly: true }} /></Grid>
                <Grid item xs={3} md={1.5}><TextField label="GST Amt" size="small" fullWidth value={it.gst_amount} InputProps={{ readOnly: true }} /></Grid>
              </Grid>
            ))}
          </CardContent>
        </Card>

        <Card sx={{ borderRadius: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.08)", mb: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2, color: "var(--heading-color)", fontWeight: 600 }}>Approval</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={3}>
                <TextField label="Approval Status" select size="small" fullWidth value={header.approval_status}
                  onChange={(e) => setHeader({ ...header, approval_status: e.target.value })} disabled={isView}>
                  <MenuItem value="Pending">Pending</MenuItem>
                  <MenuItem value="Approved">Approved</MenuItem>
                  <MenuItem value="Rejected">Rejected</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} md={3}><TextField label="Approved By" size="small" fullWidth value={header.approved_by} onChange={(e) => setHeader({ ...header, approved_by: e.target.value })} disabled={isView} /></Grid>
              <Grid item xs={12} md={3}><TextField label="Approved Date" type="date" size="small" fullWidth value={header.approved_date} onChange={(e) => setHeader({ ...header, approved_date: e.target.value })} InputLabelProps={{ shrink: true }} disabled={isView} /></Grid>
              <Grid item xs={12} md={3}><TextField label="Approval Remarks" size="small" fullWidth value={header.approval_remarks} onChange={(e) => setHeader({ ...header, approval_remarks: e.target.value })} disabled={isView} /></Grid>
            </Grid>
          </CardContent>
        </Card>

        <Card sx={{ borderRadius: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.08)", mb: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2, color: "var(--heading-color)", fontWeight: 600 }}>Quality Check (QA)</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={3}>
                <TextField label="QA Status" select size="small" fullWidth value={header.qa_status}
                  onChange={(e) => setHeader({ ...header, qa_status: e.target.value })} disabled={isView}>
                  <MenuItem value="Pending">Pending</MenuItem>
                  <MenuItem value="Passed">Passed</MenuItem>
                  <MenuItem value="Partial">Partial</MenuItem>
                  <MenuItem value="Rejected">Rejected</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} md={3}><TextField label="QA By" size="small" fullWidth value={header.qa_by} onChange={(e) => setHeader({ ...header, qa_by: e.target.value })} disabled={isView} /></Grid>
              <Grid item xs={12} md={3}><TextField label="QA Date" type="date" size="small" fullWidth value={header.qa_date} onChange={(e) => setHeader({ ...header, qa_date: e.target.value })} InputLabelProps={{ shrink: true }} disabled={isView} /></Grid>
              <Grid item xs={12} md={3}><TextField label="QA Remarks" size="small" fullWidth value={header.qa_remarks} onChange={(e) => setHeader({ ...header, qa_remarks: e.target.value })} disabled={isView} /></Grid>
            </Grid>
          </CardContent>
        </Card>

        {!isView && (
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button type="submit" variant="contained" startIcon={<SaveIcon />} disabled={saving} size="large">{saving ? "Saving..." : "Save GRR"}</Button>
            <Button variant="outlined" startIcon={<CancelIcon />} onClick={() => navigate("/stores/grr")} size="large">Cancel</Button>
          </Box>
        )}
      </form>
    </Box>
  );
}
