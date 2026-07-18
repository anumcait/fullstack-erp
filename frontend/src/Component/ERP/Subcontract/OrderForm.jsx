import React, { useEffect, useState } from "react";
import { Box, Card, CardContent, Typography, TextField, Button, Grid, MenuItem, LinearProgress, Divider, IconButton } from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import axios from "axios";
import { useToast } from "../../../context/ToastContext";
import { useNavigate, useParams, useLocation } from "react-router-dom";

const API = "/api/erp/subcontract/orders";
const STATUSES = ["Draft", "Issued", "InProgress", "Completed", "Closed"];

export default function OrderForm() {
  const { id } = useParams();
  const location = useLocation();
  const isView = location.pathname.includes("/view/");
  const isEdit = Boolean(id) && !isView;
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    order_no: "", vendor_name: "", order_date: "", expected_date: "", status: "Draft", notes: "",
  });
  const [items, setItems] = useState([]);

  useEffect(() => {
    if (id) {
      setLoading(true);
      axios.get(`${API}/${id}`).then(({ data }) => {
        setForm({
          order_no: data.order_no || "", vendor_name: data.vendor_name || "",
          order_date: data.order_date ? data.order_date.split("T")[0] : "",
          expected_date: data.expected_date ? data.expected_date.split("T")[0] : "",
          status: data.status || "Draft", notes: data.notes || "",
        });
        setItems((data.items || []).map((it) => ({
          item_name: it.item_name || "", quantity: it.quantity || "", uom: it.uom || "",
          rate: it.rate || "", amount: it.amount || 0, notes: it.notes || "",
        })));
      }).catch(() => showToast("Failed to load", "error")).finally(() => setLoading(false));
    }
  }, [id]);

  const hc = (f) => (e) => setForm((p) => ({ ...p, [f]: e.target.value }));
  const handleItemChange = (idx, field) => (e) => {
    const newItems = [...items];
    newItems[idx] = { ...newItems[idx], [field]: e.target.value };
    if (field === "quantity" || field === "rate") {
      const qty = parseFloat(newItems[idx].quantity) || 0;
      const rate = parseFloat(newItems[idx].rate) || 0;
      newItems[idx].amount = qty * rate;
    }
    setItems(newItems);
  };
  const addItem = () => setItems([...items, { item_name: "", quantity: 0, uom: "", rate: 0, amount: 0, notes: "" }]);
  const removeItem = (idx) => setItems(items.filter((_, i) => i !== idx));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const total_qty = items.reduce((s, it) => s + (parseFloat(it.quantity) || 0), 0);
    const total_amount = items.reduce((s, it) => s + (parseFloat(it.amount) || 0), 0);
    const payload = { ...form, items, total_qty, total_amount };
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
        {isView ? "View Order" : isEdit ? "Edit Order" : "New Order"}
      </Typography>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card sx={{ borderRadius: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: "var(--heading-color)" }}>Order Info</Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={4}><TextField label="Order No" size="small" fullWidth value={form.order_no} onChange={hc("order_no")} disabled={isView} /></Grid>
                  <Grid item xs={4}><TextField label="Vendor Name" size="small" fullWidth value={form.vendor_name} onChange={hc("vendor_name")} disabled={isView} required /></Grid>
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
                {items.length === 0 && <Typography color="textSecondary">No items added.</Typography>}
                {items.map((it, idx) => (
                  <Grid container spacing={1} key={idx} sx={{ mb: 1, alignItems: "center" }}>
                    <Grid item xs={3}><TextField size="small" fullWidth label="Item Name" value={it.item_name} onChange={handleItemChange(idx, "item_name")} disabled={isView} /></Grid>
                    <Grid item xs={1.5}><TextField size="small" fullWidth label="Qty" type="number" value={it.quantity} onChange={handleItemChange(idx, "quantity")} disabled={isView} /></Grid>
                    <Grid item xs={1}><TextField size="small" fullWidth label="UOM" value={it.uom} onChange={handleItemChange(idx, "uom")} disabled={isView} /></Grid>
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
