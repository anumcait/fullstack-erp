import React, { useEffect, useState } from "react";
import { Box, Card, CardContent, Typography, TextField, Button, Grid, MenuItem, LinearProgress, Divider } from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import axios from "axios";
import { useToast } from "../../../context/ToastContext";
import { useNavigate, useParams, useLocation } from "react-router-dom";

const API = "/api/erp/maintenance/assets";
const STATUSES = ["Active", "Inactive", "Disposed"];

export default function AssetForm() {
  const { id } = useParams();
  const location = useLocation();
  const isView = location.pathname.includes("/view/");
  const isEdit = Boolean(id) && !isView;
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    asset_code: "", asset_name: "", asset_type: "", department: "", location: "",
    purchase_date: "", purchase_cost: "", warranty_expiry: "", status: "Active", notes: "",
  });

  useEffect(() => {
    if (id) {
      setLoading(true);
      axios.get(`${API}/${id}`).then(({ data }) => setForm({
        asset_code: data.asset_code || "", asset_name: data.asset_name || "",
        asset_type: data.asset_type || "", department: data.department || "", location: data.location || "",
        purchase_date: data.purchase_date ? data.purchase_date.split("T")[0] : "",
        purchase_cost: data.purchase_cost || "", warranty_expiry: data.warranty_expiry ? data.warranty_expiry.split("T")[0] : "",
        status: data.status || "Active", notes: data.notes || "",
      })).catch(() => showToast("Failed to load", "error")).finally(() => setLoading(false));
    }
  }, [id]);

  const hc = (f) => (e) => setForm((p) => ({ ...p, [f]: e.target.value }));
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (id && !isView) { await axios.put(`${API}/${id}`, form); showToast("Updated", "success"); }
      else { await axios.post(API, form); showToast("Created", "success"); }
      navigate("/maintenance/assets");
    } catch (err) { showToast(err.response?.data?.error || "Failed", "error"); }
    finally { setSaving(false); }
  };
  if (loading) return <LinearProgress />;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: "bold", color: "var(--heading-color)" }}>
        {isView ? "View Asset" : isEdit ? "Edit Asset" : "New Asset"}
      </Typography>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card sx={{ borderRadius: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: "var(--heading-color)" }}>Asset Info</Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={6}><TextField label="Asset Code" size="small" fullWidth value={form.asset_code} onChange={hc("asset_code")} disabled={isView} /></Grid>
                  <Grid item xs={6}><TextField label="Asset Name" size="small" fullWidth value={form.asset_name} onChange={hc("asset_name")} disabled={isView} required /></Grid>
                  <Grid item xs={6}><TextField label="Asset Type" size="small" fullWidth value={form.asset_type} onChange={hc("asset_type")} disabled={isView} /></Grid>
                  <Grid item xs={6}><TextField label="Department" size="small" fullWidth value={form.department} onChange={hc("department")} disabled={isView} /></Grid>
                  <Grid item xs={6}><TextField label="Location" size="small" fullWidth value={form.location} onChange={hc("location")} disabled={isView} /></Grid>
                  <Grid item xs={6}><TextField label="Status" select size="small" fullWidth value={form.status} onChange={hc("status")} disabled={isView}>{STATUSES.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}</TextField></Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card sx={{ borderRadius: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: "var(--heading-color)" }}>Financial Details</Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={6}><TextField label="Purchase Date" type="date" size="small" fullWidth value={form.purchase_date} onChange={hc("purchase_date")} disabled={isView} InputLabelProps={{ shrink: true }} /></Grid>
                  <Grid item xs={6}><TextField label="Purchase Cost" type="number" size="small" fullWidth value={form.purchase_cost} onChange={hc("purchase_cost")} disabled={isView} /></Grid>
                  <Grid item xs={6}><TextField label="Warranty Expiry" type="date" size="small" fullWidth value={form.warranty_expiry} onChange={hc("warranty_expiry")} disabled={isView} InputLabelProps={{ shrink: true }} /></Grid>
                  <Grid item xs={12}><TextField label="Notes" multiline rows={3} size="small" fullWidth value={form.notes} onChange={hc("notes")} disabled={isView} /></Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
          {!isView && <Grid item xs={12}><Box display="flex" gap={2}>
            <Button type="submit" variant="contained" startIcon={<SaveIcon />} disabled={saving} size="large">{saving ? "Saving..." : id ? "Update" : "Create"}</Button>
            <Button variant="outlined" startIcon={<CancelIcon />} onClick={() => navigate("/maintenance/assets")}>Cancel</Button>
          </Box></Grid>}
        </Grid>
      </form>
    </Box>
  );
}
