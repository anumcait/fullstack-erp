import React, { useEffect, useState } from "react";
import { Box, Card, CardContent, Typography, TextField, Button, Grid, MenuItem, LinearProgress, Divider, IconButton } from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import SendIcon from "@mui/icons-material/Send";
import PrintIcon from "@mui/icons-material/Print";
import axios from "axios";
import { useToast } from "../../../context/ToastContext";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useSubcontractLookups, toItemOption } from "./lookups";
import { downloadSubcontractPdf } from "./pdf";

const API = "/api/erp/subcontract/orders";
const STATUSES = ["Draft", "Issued", "InProgress", "Completed", "Closed"];
const todayStr = () => new Date().toISOString().slice(0, 10);
const addDaysStr = (n) => { const d = new Date(); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); };

export default function OrderForm() {
  const { id } = useParams();
  const location = useLocation();
  const isView = location.pathname.includes("/view/");
  const isEdit = Boolean(id) && !isView;
  const { showToast } = useToast();
  const navigate = useNavigate();
  const { vendors, items } = useSubcontractLookups();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    order_no: "", vendor_id: "", vendor_name: "", order_date: "", expected_date: "", status: "Draft", notes: "",
  });
  const [itemRows, setItemRows] = useState([]);

  useEffect(() => {
    if (id) {
      setLoading(true);
      axios.get(`${API}/${id}`).then(({ data }) => {
        setForm({
          order_no: data.order_no || "", vendor_id: data.vendor_id || "", vendor_name: data.vendor_name || "",
          order_date: data.order_date ? data.order_date.split("T")[0] : "",
          expected_date: data.expected_date ? data.expected_date.split("T")[0] : "",
          status: data.status || "Draft", notes: data.notes || "",
        });
        setItemRows((data.items || []).map((it) => ({
          item_id: it.item_id || "", item_code: it.item_code || "", item_name: it.item_name || "",
          quantity: it.quantity || "", uom: it.uom || "", rate: it.rate || "", amount: it.amount || 0, notes: it.notes || "",
        })));
      }).catch(() => showToast("Failed to load", "error")).finally(() => setLoading(false));
    } else {
      // Add mode: auto-suggest the next document number and default dates (no manual entry).
      axios.get(`${API.replace(/\/orders$/, "")}/next-numbers`).then(({ data }) => {
        setForm((p) => ({
          ...p,
          order_no: data.order_no || "",
          order_date: todayStr(),
          expected_date: addDaysStr(30),
        }));
      }).catch(() => setForm((p) => ({ ...p, order_date: todayStr(), expected_date: addDaysStr(30) })));
    }
  }, [id]);

  const hc = (f) => (e) => setForm((p) => ({ ...p, [f]: e.target.value }));
  const handleVendorChange = (e) => {
    const v = vendors.find((x) => String(x.id) === String(e.target.value));
    setForm((p) => ({ ...p, vendor_id: v ? v.id : "", vendor_name: v ? v.supplier_name : "" }));
  };
  const handleItemChange = (idx, field) => (e) => {
    const newRows = [...itemRows];
    newRows[idx] = { ...newRows[idx], [field]: e.target.value };
    if (field === "item_id") {
      const it = items.find((x) => String(x.id) === String(e.target.value));
      if (it) {
        const opt = toItemOption(it);
        const qty = parseFloat(newRows[idx].quantity) || 0;
        newRows[idx] = { ...newRows[idx], item_id: opt.id, item_code: opt.code, item_name: opt.name, uom: opt.uom, rate: opt.rate, amount: qty * opt.rate };
      }
    }
    if (field === "quantity" || field === "rate") {
      const qty = parseFloat(newRows[idx].quantity) || 0;
      const rate = parseFloat(newRows[idx].rate) || 0;
      newRows[idx].amount = qty * rate;
    }
    setItemRows(newRows);
  };
  const addItem = () => setItemRows([...itemRows, { item_id: "", item_code: "", item_name: "", quantity: 0, uom: "", rate: 0, amount: 0, notes: "" }]);
  const removeItem = (idx) => setItemRows(itemRows.filter((_, i) => i !== idx));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const total_qty = itemRows.reduce((s, it) => s + (parseFloat(it.quantity) || 0), 0);
    const total_amount = itemRows.reduce((s, it) => s + (parseFloat(it.amount) || 0), 0);
    const payload = { ...form, items: itemRows, total_qty, total_amount };
    try {
      if (id && !isView) { await axios.put(`${API}/${id}`, payload); showToast("Updated", "success"); }
      else { await axios.post(API, payload); showToast("Created", "success"); }
      navigate("/subcontract/orders");
    } catch (err) { showToast(err.response?.data?.error || "Failed", "error"); }
    finally { setSaving(false); }
  };

  if (loading) return <LinearProgress />;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: "bold", color: "var(--heading-color)" }}>
        {isView ? "View Order" : isEdit ? "Edit Order" : "New Job Work Order"}
      </Typography>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card sx={{ borderRadius: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: "var(--heading-color)" }}>Order Info</Typography>
                  {isView && (
                    <Box display="flex" gap={1}>
                      <Button size="small" variant="contained" startIcon={<SendIcon />} onClick={() => navigate(`/subcontract/issue/add?orderId=${id}`)}>
                        Create Issue
                      </Button>
                      <Button size="small" variant="outlined" startIcon={<PrintIcon />} onClick={() => downloadSubcontractPdf({ type: "order", form, items: itemRows })}>
                        Print PDF
                      </Button>
                    </Box>
                  )}
                </Box>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={4}><TextField label="Order No" size="small" fullWidth value={form.order_no} onChange={hc("order_no")} disabled={isView || !id} helperText={!id ? "Auto-generated" : ""} /></Grid>
                  <Grid item xs={4}>
                    <TextField label="Sub-Contractor" select size="small" fullWidth value={form.vendor_id} onChange={handleVendorChange} disabled={isView || vendors.length === 0} required>
                      {vendors.map((v) => <MenuItem key={v.id} value={v.id}>{v.supplier_name}</MenuItem>)}
                    </TextField>
                  </Grid>
                  <Grid item xs={4}><TextField label="Status" select size="small" fullWidth value={form.status} onChange={hc("status")} disabled={isView}>{STATUSES.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}</TextField></Grid>
                  <Grid item xs={4}><TextField label="Order Date" type="date" size="small" fullWidth value={form.order_date} onChange={hc("order_date")} disabled={isView} InputLabelProps={{ shrink: true }} required /></Grid>
                  <Grid item xs={4}><TextField label="Expected Date" type="date" size="small" fullWidth value={form.expected_date} onChange={hc("expected_date")} disabled={isView} InputLabelProps={{ shrink: true }} /></Grid>
                  <Grid item xs={12}><TextField label="Notes" multiline rows={2} size="small" fullWidth value={form.notes} onChange={hc("notes")} disabled={isView} /></Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12}>
            <Card sx={{ borderRadius: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: "var(--heading-color)" }}>Order Items</Typography>
                  {!isView && <Button size="small" startIcon={<AddIcon />} onClick={addItem} variant="outlined">Add Item</Button>}
                </Box>
                <Divider sx={{ mb: 2 }} />
                {itemRows.length === 0 && <Typography color="textSecondary">No items added.</Typography>}
                {itemRows.map((it, idx) => (
                  <Grid container spacing={1} key={idx} sx={{ mb: 1, alignItems: "center" }}>
                    <Grid item xs={3}>
                      <TextField size="small" fullWidth select label="Item" value={it.item_id} onChange={handleItemChange(idx, "item_id")} disabled={isView || items.length === 0}>
                        {items.map((opt) => <MenuItem key={opt.id} value={opt.id}>{opt.item_name} ({opt.item_code})</MenuItem>)}
                      </TextField>
                    </Grid>
                    <Grid item xs={1.5}><TextField size="small" fullWidth label="Qty" type="number" value={it.quantity} onChange={handleItemChange(idx, "quantity")} disabled={isView} /></Grid>
                    <Grid item xs={1}><TextField size="small" fullWidth label="UOM" value={it.uom} disabled /></Grid>
                    <Grid item xs={1.5}><TextField size="small" fullWidth label="Rate" type="number" value={it.rate} onChange={handleItemChange(idx, "rate")} disabled={isView} /></Grid>
                    <Grid item xs={1.5}><TextField size="small" fullWidth label="Amount" type="number" value={it.amount} disabled /></Grid>
                    <Grid item xs={3}><TextField size="small" fullWidth label="Notes" value={it.notes} onChange={handleItemChange(idx, "notes")} disabled={isView} /></Grid>
                    {!isView && <Grid item xs={0.5}><IconButton color="error" onClick={() => removeItem(idx)}><DeleteIcon /></IconButton></Grid>}
                  </Grid>
                ))}
              </CardContent>
            </Card>
          </Grid>
          {!isView && <Grid item xs={12}><Box display="flex" gap={2}>
            <Button type="submit" variant="contained" startIcon={<SaveIcon />} disabled={saving} size="large">{saving ? "Saving..." : id ? "Update" : "Create"}</Button>
            <Button variant="outlined" startIcon={<CancelIcon />} onClick={() => navigate("/subcontract/orders")}>Cancel</Button>
          </Box></Grid>}
        </Grid>
      </form>
    </Box>
  );
}
