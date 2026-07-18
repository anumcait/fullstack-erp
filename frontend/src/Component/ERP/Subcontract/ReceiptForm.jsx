import React, { useEffect, useState } from "react";
import { Box, Card, CardContent, Typography, TextField, Button, Grid, MenuItem, LinearProgress, Divider, IconButton } from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import axios from "axios";
import { useToast } from "../../../context/ToastContext";
import { useNavigate, useParams, useLocation } from "react-router-dom";

const API = "/api/erp/subcontract/receipts";
const STATUSES = ["Draft", "Received", "Completed"];

export default function ReceiptForm() {
  const { id } = useParams();
  const location = useLocation();
  const isView = location.pathname.includes("/view/");
  const isEdit = Boolean(id) && !isView;
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    receipt_no: "", order_id: "", vendor_name: "", receipt_date: "", status: "Draft", notes: "",
  });
  const [items, setItems] = useState([]);

  useEffect(() => {
    if (id) {
      setLoading(true);
      axios.get(`${API}/${id}`).then(({ data }) => {
        setForm({
          receipt_no: data.receipt_no || "", order_id: data.order_id || "", vendor_name: data.vendor_name || "",
          receipt_date: data.receipt_date ? data.receipt_date.split("T")[0] : "",
          status: data.status || "Draft", notes: data.notes || "",
        });
        setItems((data.items || []).map((it) => ({
          item_name: it.item_name || "", quantity: it.quantity || "", uom: it.uom || "", notes: it.notes || "",
        })));
      }).catch(() => showToast("Failed to load", "error")).finally(() => setLoading(false));
    }
  }, [id]);

  const hc = (f) => (e) => setForm((p) => ({ ...p, [f]: e.target.value }));
  const handleItemChange = (idx, field) => (e) => {
    const newItems = [...items];
    newItems[idx] = { ...newItems[idx], [field]: e.target.value };
    setItems(newItems);
  };
  const addItem = () => setItems([...items, { item_name: "", quantity: 0, uom: "", notes: "" }]);
  const removeItem = (idx) => setItems(items.filter((_, i) => i !== idx));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (id && !isView) { await axios.put(`${API}/${id}`, { ...form, items }); showToast("Updated", "success"); }
      else { await axios.post(API, { ...form, items }); showToast("Created", "success"); }
      navigate("/subcontract/receipt");
    } catch (err) { showToast(err.response?.data?.error || "Failed", "error"); }
    finally { setSaving(false); }
  };

  if (loading) return <LinearProgress />;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: "bold", color: "var(--heading-color)" }}>
        {isView ? "View Receipt" : isEdit ? "Edit Receipt" : "New Material Receipt"}
      </Typography>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card sx={{ borderRadius: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: "var(--heading-color)" }}>Receipt Info</Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={4}><TextField label="Receipt No" size="small" fullWidth value={form.receipt_no} onChange={hc("receipt_no")} disabled={isView} /></Grid>
                  <Grid item xs={4}><TextField label="Order ID" type="number" size="small" fullWidth value={form.order_id} onChange={hc("order_id")} disabled={isView} /></Grid>
                  <Grid item xs={4}><TextField label="Status" select size="small" fullWidth value={form.status} onChange={hc("status")} disabled={isView}>{STATUSES.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}</TextField></Grid>
                  <Grid item xs={4}><TextField label="Vendor Name" size="small" fullWidth value={form.vendor_name} onChange={hc("vendor_name")} disabled={isView} /></Grid>
                  <Grid item xs={4}><TextField label="Receipt Date" type="date" size="small" fullWidth value={form.receipt_date} onChange={hc("receipt_date")} disabled={isView} InputLabelProps={{ shrink: true }} required /></Grid>
                  <Grid item xs={12}><TextField label="Notes" multiline rows={2} size="small" fullWidth value={form.notes} onChange={hc("notes")} disabled={isView} /></Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12}>
            <Card sx={{ borderRadius: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: "var(--heading-color)" }}>Receipt Items</Typography>
                  {!isView && <Button size="small" startIcon={<AddIcon />} onClick={addItem} variant="outlined">Add Item</Button>}
                </Box>
                <Divider sx={{ mb: 2 }} />
                {items.length === 0 && <Typography color="textSecondary">No items added.</Typography>}
                {items.map((it, idx) => (
                  <Grid container spacing={1} key={idx} sx={{ mb: 1, alignItems: "center" }}>
                    <Grid item xs={4}><TextField size="small" fullWidth label="Item Name" value={it.item_name} onChange={handleItemChange(idx, "item_name")} disabled={isView} /></Grid>
                    <Grid item xs={2}><TextField size="small" fullWidth label="Qty" type="number" value={it.quantity} onChange={handleItemChange(idx, "quantity")} disabled={isView} /></Grid>
                    <Grid item xs={1.5}><TextField size="small" fullWidth label="UOM" value={it.uom} onChange={handleItemChange(idx, "uom")} disabled={isView} /></Grid>
                    <Grid item xs={4}><TextField size="small" fullWidth label="Notes" value={it.notes} onChange={handleItemChange(idx, "notes")} disabled={isView} /></Grid>
                    {!isView && <Grid item xs={0.5}><IconButton color="error" onClick={() => removeItem(idx)}><DeleteIcon /></IconButton></Grid>}
                  </Grid>
                ))}
              </CardContent>
            </Card>
          </Grid>
          {!isView && <Grid item xs={12}><Box display="flex" gap={2}>
            <Button type="submit" variant="contained" startIcon={<SaveIcon />} disabled={saving} size="large">{saving ? "Saving..." : id ? "Update" : "Create"}</Button>
            <Button variant="outlined" startIcon={<CancelIcon />} onClick={() => navigate("/subcontract/receipt")}>Cancel</Button>
          </Box></Grid>}
        </Grid>
      </form>
    </Box>
  );
}
