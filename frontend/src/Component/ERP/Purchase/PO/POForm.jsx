import React, { useEffect, useState } from "react";
import { Box, Card, CardContent, Typography, TextField, Button, Grid, MenuItem, IconButton, LinearProgress, Autocomplete } from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import axios from "axios";
import { useToast } from "../../../../context/ToastContext";
import { useNavigate, useParams, useLocation } from "react-router-dom";

const API = "/api/erp/purchase/orders";
const SUPPLIER_API = "/api/erp/purchase/suppliers";

const PAYMENT_TERMS = ["Immediate", "7 Days", "15 Days", "30 Days", "45 Days", "60 Days", "90 Days"];

export default function POForm() {
  const { id } = useParams();
  const location = useLocation();
  const isView = location.pathname.includes("/view/");
  const isEdit = Boolean(id) && !isView;
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [suppliers, setSuppliers] = useState([]);
  const [header, setHeader] = useState({
    po_no: "", po_date: new Date().toISOString().split("T")[0],
    supplier_id: "", payment_terms: "", delivery_terms: "", currency: "INR",
    subtotal: 0, discount_percent: 0, discount_amount: 0, tax_amount: 0, grand_total: 0, notes: "",
  });
  const [items, setItems] = useState([{ item_name: "", quantity: 1, rate: 0, amount: 0, gst_rate: 0, gst_amount: 0, total: 0, delivery_date: "" }]);

  useEffect(() => {
    axios.get(SUPPLIER_API, { params: { is_active: true } }).then(({ data }) => setSuppliers(data)).catch(() => {});
    if (id) {
      setLoading(true);
      axios.get(`${API}/${id}`).then(({ data }) => {
        setHeader({
          po_no: data.po_no || "", po_date: data.po_date?.split("T")[0] || "",
          supplier_id: data.supplier_id || "", payment_terms: data.payment_terms || "",
          delivery_terms: data.delivery_terms || "", currency: data.currency || "INR",
          subtotal: data.subtotal || 0, discount_percent: data.discount_percent || 0,
          discount_amount: data.discount_amount || 0, tax_amount: data.tax_amount || 0,
          grand_total: data.grand_total || 0, notes: data.notes || "",
        });
        if (data.items) setItems(data.items.map((it) => ({
          po_item_id: it.id, item_id: it.item_id, item_code: it.item_code,
          item_name: it.item_name, quantity: it.quantity, unit_id: it.unit_id,
          rate: it.rate, amount: it.amount, gst_rate: it.gst_rate,
          gst_amount: it.gst_amount, total: it.total, delivery_date: it.delivery_date?.split("T")[0] || "",
        })));
      }).catch(() => showToast("Failed to load PO", "error")).finally(() => setLoading(false));
    }
  }, [id]);

  const recalcItem = (idx) => {
    const updated = [...items];
    const qty = parseFloat(updated[idx].quantity) || 0;
    const rate = parseFloat(updated[idx].rate) || 0;
    const gst = parseFloat(updated[idx].gst_rate) || 0;
    updated[idx].amount = qty * rate;
    updated[idx].gst_amount = (qty * rate * gst) / 100;
    updated[idx].total = updated[idx].amount + updated[idx].gst_amount;
    setItems(updated);
    recalcHeader();
  };

  const recalcHeader = () => {
    const subtotal = items.reduce((s, i) => s + (parseFloat(i.amount) || 0), 0);
    const tax = items.reduce((s, i) => s + (parseFloat(i.gst_amount) || 0), 0);
    const discPct = parseFloat(header.discount_percent) || 0;
    const discAmt = (subtotal * discPct) / 100;
    setHeader((h) => ({ ...h, subtotal, tax_amount: tax, discount_amount: discAmt, grand_total: subtotal + tax - discAmt }));
  };

  const handleItemChange = (idx, field) => (e) => {
    const updated = [...items];
    updated[idx][field] = e.target.value;
    setItems(updated);
    if (["quantity", "rate", "gst_rate"].includes(field)) recalcItem(idx);
  };

  const addItem = () => setItems([...items, { item_name: "", quantity: 1, rate: 0, amount: 0, gst_rate: 0, gst_amount: 0, total: 0, delivery_date: "" }]);
  const removeItem = (idx) => { if (items.length > 1) setItems(items.filter((_, i) => i !== idx)); recalcHeader(); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!header.po_no || !header.supplier_id) { showToast("PO # and supplier are required", "warning"); return; }
    setSaving(true);
    try {
      const payload = { ...header, supplier_id: parseInt(header.supplier_id), items: items.map((i) => ({ ...i, quantity: parseFloat(i.quantity) || 0, rate: parseFloat(i.rate) || 0 })) };
      if (isEdit) { await axios.put(`${API}/${id}`, payload); showToast("Updated", "success"); }
      else { await axios.post(API, payload); showToast("Created", "success"); }
      navigate("/purchase/orders");
    } catch (err) { showToast(err.response?.data?.error || "Failed to save", "error"); }
    finally { setSaving(false); }
  };

  if (loading) return <LinearProgress />;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: "bold", color: "var(--heading-color)" }}>
        {isView ? "Purchase Order Details" : isEdit ? "Edit Purchase Order" : "New Purchase Order"}
      </Typography>
      <form onSubmit={handleSubmit}>
        <Card sx={{ borderRadius: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.08)", mb: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2, color: "var(--heading-color)", fontWeight: 600 }}>PO Header</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={3}>
                <TextField label="PO No *" size="small" fullWidth value={header.po_no} onChange={(e) => setHeader({ ...header, po_no: e.target.value })} required disabled={isView} />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField label="Date *" type="date" size="small" fullWidth value={header.po_date} onChange={(e) => setHeader({ ...header, po_date: e.target.value })} InputLabelProps={{ shrink: true }} required disabled={isView} />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField label="Supplier *" select size="small" fullWidth value={header.supplier_id} onChange={(e) => setHeader({ ...header, supplier_id: e.target.value })} required disabled={isView}>
                  <MenuItem value="">-- Select --</MenuItem>
                  {suppliers.map((s) => <MenuItem key={s.id} value={s.id}>{s.supplier_name} ({s.supplier_code})</MenuItem>)}
                </TextField>
              </Grid>
              <Grid item xs={12} md={2}>
                <TextField label="Currency" size="small" fullWidth value={header.currency} onChange={(e) => setHeader({ ...header, currency: e.target.value })} disabled={isView} />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField label="Payment Terms" select size="small" fullWidth value={header.payment_terms} onChange={(e) => setHeader({ ...header, payment_terms: e.target.value })} disabled={isView}>
                  <MenuItem value="">-- Select --</MenuItem>
                  {PAYMENT_TERMS.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid item xs={12} md={9}>
                <TextField label="Delivery Terms" size="small" fullWidth value={header.delivery_terms} onChange={(e) => setHeader({ ...header, delivery_terms: e.target.value })} disabled={isView} />
              </Grid>
              <Grid item xs={12}>
                <TextField label="Notes" size="small" fullWidth multiline rows={2} value={header.notes} onChange={(e) => setHeader({ ...header, notes: e.target.value })} disabled={isView} />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Card sx={{ borderRadius: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.08)", mb: 3 }}>
          <CardContent>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
              <Typography variant="h6" sx={{ color: "var(--heading-color)", fontWeight: 600 }}>Items</Typography>
              {!isView && <Button size="small" startIcon={<AddIcon />} onClick={addItem}>Add Item</Button>}
            </Box>
            {items.map((it, idx) => (
              <Grid container spacing={1} key={idx} sx={{ mb: 1, pb: 1, borderBottom: "1px solid #eee", alignItems: "center" }}>
                <Grid item xs={12} md={3}>
                  <TextField label="Item *" size="small" fullWidth value={it.item_name} onChange={handleItemChange(idx, "item_name")} required disabled={isView} />
                </Grid>
                <Grid item xs={3} md={1}>
                  <TextField label="Qty" type="number" size="small" fullWidth value={it.quantity} onChange={handleItemChange(idx, "quantity")} disabled={isView} />
                </Grid>
                <Grid item xs={3} md={1.5}>
                  <TextField label="Rate" type="number" size="small" fullWidth value={it.rate} onChange={handleItemChange(idx, "rate")} disabled={isView} />
                </Grid>
                <Grid item xs={3} md={1.5}>
                  <TextField label="Amount" size="small" fullWidth value={it.amount.toFixed(2)} InputProps={{ readOnly: true }} disabled={isView} />
                </Grid>
                <Grid item xs={3} md={1}>
                  <TextField label="GST%" type="number" size="small" fullWidth value={it.gst_rate} onChange={handleItemChange(idx, "gst_rate")} disabled={isView} />
                </Grid>
                <Grid item xs={3} md={1.5}>
                  <TextField label="GST Amt" size="small" fullWidth value={it.gst_amount.toFixed(2)} InputProps={{ readOnly: true }} disabled={isView} />
                </Grid>
                <Grid item xs={3} md={1.5}>
                  <TextField label="Total" size="small" fullWidth value={it.total.toFixed(2)} InputProps={{ readOnly: true }} disabled={isView} />
                </Grid>
                <Grid item xs={6} md={1.5}>
                  <TextField label="Delivery" type="date" size="small" fullWidth value={it.delivery_date} onChange={handleItemChange(idx, "delivery_date")} InputLabelProps={{ shrink: true }} disabled={isView} />
                </Grid>
                {!isView && (
                  <Grid item xs={2} md={0.5}>
                    <IconButton size="small" color="error" onClick={() => removeItem(idx)} disabled={items.length <= 1}><DeleteIcon fontSize="small" /></IconButton>
                  </Grid>
                )}
              </Grid>
            ))}

            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2, gap: 3 }}>
              <Box><Typography variant="body2" color="textSecondary">Subtotal:</Typography><Typography fontWeight="bold">{header.subtotal.toFixed(2)}</Typography></Box>
              <Box><Typography variant="body2" color="textSecondary">Discount %:</Typography>
                <TextField type="number" size="small" value={header.discount_percent} onChange={(e) => { setHeader({ ...header, discount_percent: e.target.value }); setTimeout(recalcHeader, 50); }} sx={{ width: 80 }} disabled={isView} />
              </Box>
              <Box><Typography variant="body2" color="textSecondary">Tax:</Typography><Typography fontWeight="bold">{header.tax_amount.toFixed(2)}</Typography></Box>
              <Box><Typography variant="body2" color="textSecondary">Grand Total:</Typography><Typography fontWeight="bold" color="primary" variant="h6">{header.grand_total.toFixed(2)}</Typography></Box>
            </Box>
          </CardContent>
        </Card>

        {!isView && (
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button type="submit" variant="contained" startIcon={<SaveIcon />} disabled={saving} size="large">{saving ? "Saving..." : "Save PO"}</Button>
            <Button variant="outlined" startIcon={<CancelIcon />} onClick={() => navigate("/purchase/orders")} size="large">Cancel</Button>
          </Box>
        )}
      </form>
    </Box>
  );
}
