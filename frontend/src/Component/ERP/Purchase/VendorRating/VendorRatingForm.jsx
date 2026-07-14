import React, { useEffect, useState } from "react";
import { Box, Card, CardContent, Typography, TextField, Button, Grid, MenuItem, LinearProgress, Slider } from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import axios from "axios";
import { useToast } from "../../../../context/ToastContext";
import { useNavigate } from "react-router-dom";

const API = "/api/erp/purchase/vendor-ratings";
const SUPPLIER_API = "/api/erp/purchase/suppliers";

export default function VendorRatingForm() {
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [saving, setSaving] = useState(false);
  const [suppliers, setSuppliers] = useState([]);
  const [form, setForm] = useState({
    supplier_id: "", po_id: "", quality_score: 5, delivery_score: 5,
    price_score: 5, service_score: 5, remarks: "", rating_date: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    axios.get(SUPPLIER_API, { params: { is_active: true } }).then(({ data }) => setSuppliers(data)).catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.supplier_id) { showToast("Select a supplier", "warning"); return; }
    setSaving(true);
    try {
      await axios.post(API, { ...form, supplier_id: parseInt(form.supplier_id), po_id: form.po_id ? parseInt(form.po_id) : null });
      showToast("Rating saved", "success");
      navigate("/purchase/rating");
    } catch (err) { showToast("Failed to save", "error"); }
    finally { setSaving(false); }
  };

  const avg = ((parseFloat(form.quality_score) || 0) + (parseFloat(form.delivery_score) || 0) + (parseFloat(form.price_score) || 0) + (parseFloat(form.service_score) || 0)) / 4;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: "bold", color: "var(--heading-color)" }}>Rate Vendor</Typography>
      <form onSubmit={handleSubmit}>
        <Card sx={{ borderRadius: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.08)", mb: 3 }}>
          <CardContent>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField label="Supplier *" select size="small" fullWidth value={form.supplier_id} onChange={(e) => setForm({ ...form, supplier_id: e.target.value })} required>
                  <MenuItem value="">-- Select --</MenuItem>
                  {suppliers.map((s) => <MenuItem key={s.id} value={s.id}>{s.supplier_name}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField label="Rating Date" type="date" size="small" fullWidth value={form.rating_date} onChange={(e) => setForm({ ...form, rating_date: e.target.value })} InputLabelProps={{ shrink: true }} />
              </Grid>
              <Grid item xs={12} md={3}>
                <Typography gutterBottom>Quality Score (0-10)</Typography>
                <Slider value={parseFloat(form.quality_score) || 5} min={0} max={10} step={0.5}
                  onChange={(_, v) => setForm({ ...form, quality_score: v })} valueLabelDisplay="auto" />
              </Grid>
              <Grid item xs={12} md={3}>
                <Typography gutterBottom>Delivery Score (0-10)</Typography>
                <Slider value={parseFloat(form.delivery_score) || 5} min={0} max={10} step={0.5}
                  onChange={(_, v) => setForm({ ...form, delivery_score: v })} valueLabelDisplay="auto" />
              </Grid>
              <Grid item xs={12} md={3}>
                <Typography gutterBottom>Price Score (0-10)</Typography>
                <Slider value={parseFloat(form.price_score) || 5} min={0} max={10} step={0.5}
                  onChange={(_, v) => setForm({ ...form, price_score: v })} valueLabelDisplay="auto" />
              </Grid>
              <Grid item xs={12} md={3}>
                <Typography gutterBottom>Service Score (0-10)</Typography>
                <Slider value={parseFloat(form.service_score) || 5} min={0} max={10} step={0.5}
                  onChange={(_, v) => setForm({ ...form, service_score: v })} valueLabelDisplay="auto" />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h5" color="primary" sx={{ textAlign: "center" }}>
                  Overall: {avg.toFixed(1)} / 10
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <TextField label="Remarks" size="small" fullWidth multiline rows={3} value={form.remarks}
                  onChange={(e) => setForm({ ...form, remarks: e.target.value })} />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button type="submit" variant="contained" startIcon={<SaveIcon />} disabled={saving} size="large">{saving ? "Saving..." : "Save Rating"}</Button>
          <Button variant="outlined" startIcon={<CancelIcon />} onClick={() => navigate("/purchase/rating")} size="large">Cancel</Button>
        </Box>
      </form>
    </Box>
  );
}
