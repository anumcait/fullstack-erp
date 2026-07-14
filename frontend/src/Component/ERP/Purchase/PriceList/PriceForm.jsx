import React, { useEffect, useState } from "react";
import { Box, Card, CardContent, Typography, TextField, Button, Grid, MenuItem, LinearProgress } from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import axios from "axios";
import { useToast } from "../../../../context/ToastContext";
import { useNavigate, useParams, useLocation } from "react-router-dom";

const API = "/api/erp/purchase/price-list";
const SUPPLIER_API = "/api/erp/purchase/suppliers";
const ITEM_API = "/api/erp/stores/items";

export default function PriceForm() {
  const { id } = useParams();
  const location = useLocation();
  const isView = location.pathname.includes("/view/");
  const isEdit = Boolean(id) && !isView;
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [suppliers, setSuppliers] = useState([]);
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({
    supplier_id: "", item_id: "", rate: "", gst_rate: "", currency: "INR",
    effective_from: "", effective_to: "", moq: "", lead_days: "",
  });

  useEffect(() => {
    Promise.all([
      axios.get(SUPPLIER_API, { params: { is_active: true } }),
      axios.get(ITEM_API, { params: { is_active: true } }),
    ]).then(([sRes, iRes]) => {
      setSuppliers(sRes.data);
      setItems(iRes.data);
    }).catch(() => {});

    if (id) {
      setLoading(true);
      axios.get(`${API}/${id}`).then(({ data }) => {
        setForm({
          supplier_id: data.supplier_id || "", item_id: data.item_id || "",
          rate: data.rate || "", gst_rate: data.gst_rate || "", currency: data.currency || "INR",
          effective_from: data.effective_from?.split("T")[0] || "",
          effective_to: data.effective_to?.split("T")[0] || "",
          moq: data.moq || "", lead_days: data.lead_days || "",
        });
      }).catch(() => showToast("Failed to load", "error")).finally(() => setLoading(false));
    }
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.supplier_id || !form.item_id || !form.rate) {
      showToast("Supplier, item, and rate are required", "warning"); return;
    }
    setSaving(true);
    try {
      const payload = { ...form, supplier_id: parseInt(form.supplier_id), item_id: parseInt(form.item_id), rate: parseFloat(form.rate) };
      if (isEdit) { await axios.put(`${API}/${id}`, payload); showToast("Updated", "success"); }
      else { await axios.post(API, payload); showToast("Created", "success"); }
      navigate("/purchase/prices");
    } catch (err) { showToast(err.response?.data?.error || "Failed", "error"); }
    finally { setSaving(false); }
  };

  if (loading) return <LinearProgress />;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: "bold", color: "var(--heading-color)" }}>{isView ? "Price Details" : isEdit ? "Edit Price" : "Add Vendor Price"}</Typography>
      <form onSubmit={handleSubmit}>
        <Card sx={{ borderRadius: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.08)", mb: 3 }}>
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <TextField label="Supplier *" select size="small" fullWidth value={form.supplier_id} onChange={(e) => setForm({ ...form, supplier_id: e.target.value })} required disabled={isView}>
                  <MenuItem value="">-- Select --</MenuItem>
                  {suppliers.map((s) => <MenuItem key={s.id} value={s.id}>{s.supplier_name}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField label="Item *" select size="small" fullWidth value={form.item_id} onChange={(e) => setForm({ ...form, item_id: e.target.value })} required disabled={isView}>
                  <MenuItem value="">-- Select --</MenuItem>
                  {items.map((i) => <MenuItem key={i.id} value={i.id}>{i.item_name} ({i.item_code})</MenuItem>)}
                </TextField>
              </Grid>
              <Grid item xs={12} md={2}>
                <TextField label="Rate *" type="number" size="small" fullWidth value={form.rate} onChange={(e) => setForm({ ...form, rate: e.target.value })} required disabled={isView} />
              </Grid>
              <Grid item xs={12} md={2}>
                <TextField label="GST %" type="number" size="small" fullWidth value={form.gst_rate} onChange={(e) => setForm({ ...form, gst_rate: e.target.value })} disabled={isView} />
              </Grid>
              <Grid item xs={12} md={1}>
                <TextField label="Currency" size="small" fullWidth value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} disabled={isView} />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField label="Effective From" type="date" size="small" fullWidth value={form.effective_from} onChange={(e) => setForm({ ...form, effective_from: e.target.value })} InputLabelProps={{ shrink: true }} disabled={isView} />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField label="Effective To" type="date" size="small" fullWidth value={form.effective_to} onChange={(e) => setForm({ ...form, effective_to: e.target.value })} InputLabelProps={{ shrink: true }} disabled={isView} />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField label="MOQ" type="number" size="small" fullWidth value={form.moq} onChange={(e) => setForm({ ...form, moq: e.target.value })} disabled={isView} />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField label="Lead Days" type="number" size="small" fullWidth value={form.lead_days} onChange={(e) => setForm({ ...form, lead_days: e.target.value })} disabled={isView} />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
        {!isView && (
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button type="submit" variant="contained" startIcon={<SaveIcon />} disabled={saving} size="large">{saving ? "Saving..." : "Save Price"}</Button>
            <Button variant="outlined" startIcon={<CancelIcon />} onClick={() => navigate("/purchase/prices")} size="large">Cancel</Button>
          </Box>
        )}
      </form>
    </Box>
  );
}
