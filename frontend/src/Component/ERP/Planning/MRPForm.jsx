import React, { useEffect, useState } from "react";
import { Box, Card, CardContent, Typography, TextField, Button, Grid, LinearProgress, Divider } from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import axios from "axios";
import { useToast } from "../../../context/ToastContext";
import { useNavigate, useParams, useLocation } from "react-router-dom";

const API = "/api/erp/planning/mrp";

export default function MRPForm() {
  const { id } = useParams();
  const location = useLocation();
  const isView = location.pathname.includes("/view/");
  const isEdit = Boolean(id) && !isView;
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    run_no: "", run_date: "", item_code: "", item_name: "",
    gross_requirement: "", scheduled_receipts: "", net_requirement: "", planned_orders: "", status: "Generated",
  });

  useEffect(() => {
    if (id) {
      setLoading(true);
      axios.get(`${API}/${id}`).then(({ data }) => setForm({
        run_no: data.run_no || "", run_date: data.run_date ? data.run_date.split("T")[0] : "",
        item_code: data.item_code || "", item_name: data.item_name || "",
        gross_requirement: data.gross_requirement || "", scheduled_receipts: data.scheduled_receipts || "",
        net_requirement: data.net_requirement || "", planned_orders: data.planned_orders || "",
        status: data.status || "Generated",
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
      navigate("/planning/mrp");
    } catch (err) { showToast(err.response?.data?.error || "Failed", "error"); }
    finally { setSaving(false); }
  };
  if (loading) return <LinearProgress />;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: "bold", color: "var(--heading-color)" }}>
        {isView ? "View MRP Run" : isEdit ? "Edit MRP Run" : "New MRP Run"}
      </Typography>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card sx={{ borderRadius: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: "var(--heading-color)" }}>MRP Details</Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={4}><TextField label="Run No" size="small" fullWidth value={form.run_no} onChange={hc("run_no")} disabled={isView} /></Grid>
                  <Grid item xs={4}><TextField label="Run Date" type="date" size="small" fullWidth value={form.run_date} onChange={hc("run_date")} disabled={isView} InputLabelProps={{ shrink: true }} /></Grid>
                  <Grid item xs={4}><TextField label="Status" size="small" fullWidth value={form.status} onChange={hc("status")} disabled={isView} /></Grid>
                  <Grid item xs={4}><TextField label="Item Code" size="small" fullWidth value={form.item_code} onChange={hc("item_code")} disabled={isView} /></Grid>
                  <Grid item xs={8}><TextField label="Item Name" size="small" fullWidth value={form.item_name} onChange={hc("item_name")} disabled={isView} /></Grid>
                  <Grid item xs={3}><TextField label="Gross Requirement" type="number" size="small" fullWidth value={form.gross_requirement} onChange={hc("gross_requirement")} disabled={isView} /></Grid>
                  <Grid item xs={3}><TextField label="Scheduled Receipts" type="number" size="small" fullWidth value={form.scheduled_receipts} onChange={hc("scheduled_receipts")} disabled={isView} /></Grid>
                  <Grid item xs={3}><TextField label="Net Requirement" type="number" size="small" fullWidth value={form.net_requirement} onChange={hc("net_requirement")} disabled={isView} /></Grid>
                  <Grid item xs={3}><TextField label="Planned Orders" type="number" size="small" fullWidth value={form.planned_orders} onChange={hc("planned_orders")} disabled={isView} /></Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
          {!isView && <Grid item xs={12}><Box display="flex" gap={2}>
            <Button type="submit" variant="contained" startIcon={<SaveIcon />} disabled={saving} size="large">{saving ? "Saving..." : id ? "Update" : "Create"}</Button>
            <Button variant="outlined" startIcon={<CancelIcon />} onClick={() => navigate("/planning/mrp")}>Cancel</Button>
          </Box></Grid>}
        </Grid>
      </form>
    </Box>
  );
}
