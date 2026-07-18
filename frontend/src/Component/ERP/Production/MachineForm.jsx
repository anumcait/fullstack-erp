import React, { useEffect, useState } from "react";
import { Box, Card, CardContent, Typography, TextField, Button, Grid, MenuItem, LinearProgress, Divider } from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import axios from "axios";
import { useToast } from "../../../context/ToastContext";
import { useNavigate, useParams, useLocation } from "react-router-dom";

const API = "/api/erp/production/machines";
const STATUSES = ["Active", "Inactive", "Under Maintenance", "Retired"];

export default function MachineForm() {
  const { id } = useParams();
  const location = useLocation();
  const isView = location.pathname.includes("/view/");
  const isEdit = Boolean(id) && !isView;
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    machine_code: "", machine_name: "", machine_type: "", department: "", location: "",
    manufacturer: "", model_no: "", serial_no: "", installation_date: "",
    capacity_per_hour: "", power_rating: "", status: "Active",
    last_maintenance_date: "", next_maintenance_date: "", notes: "", is_active: true,
  });

  useEffect(() => {
    if (id) {
      setLoading(true);
      axios.get(`${API}/${id}`).then(({ data }) => setForm({
        machine_code: data.machine_code || "",
        machine_name: data.machine_name || "", machine_type: data.machine_type || "",
        department: data.department || "", location: data.location || "",
        manufacturer: data.manufacturer || "", model_no: data.model_no || "",
        serial_no: data.serial_no || "",
        installation_date: data.installation_date ? data.installation_date.split("T")[0] : "",
        capacity_per_hour: data.capacity_per_hour || "",
        power_rating: data.power_rating || "", status: data.status || "Active",
        last_maintenance_date: data.last_maintenance_date ? data.last_maintenance_date.split("T")[0] : "",
        next_maintenance_date: data.next_maintenance_date ? data.next_maintenance_date.split("T")[0] : "",
        notes: data.notes || "", is_active: data.is_active ?? true,
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
      navigate("/production/machines");
    } catch (err) { showToast(err.response?.data?.error || "Failed", "error"); }
    finally { setSaving(false); }
  };
  if (loading) return <LinearProgress />;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: "bold", color: "var(--heading-color)" }}>
        {isView ? "View Machine" : isEdit ? "Edit Machine" : "New Machine"}
      </Typography>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card sx={{ borderRadius: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: "var(--heading-color)" }}>General Info</Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={6}><TextField label="Machine Code" size="small" fullWidth value={form.machine_code} onChange={hc("machine_code")} disabled={isView} /></Grid>
                  <Grid item xs={6}><TextField label="Machine Name" size="small" fullWidth value={form.machine_name} onChange={hc("machine_name")} disabled={isView} required /></Grid>
                  <Grid item xs={6}><TextField label="Machine Type" size="small" fullWidth value={form.machine_type} onChange={hc("machine_type")} disabled={isView} /></Grid>
                  <Grid item xs={6}><TextField label="Department" size="small" fullWidth value={form.department} onChange={hc("department")} disabled={isView} /></Grid>
                  <Grid item xs={6}><TextField label="Location" size="small" fullWidth value={form.location} onChange={hc("location")} disabled={isView} /></Grid>
                  <Grid item xs={6}><TextField label="Status" select size="small" fullWidth value={form.status} onChange={hc("status")} disabled={isView}>{STATUSES.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}</TextField></Grid>
                  <Grid item xs={6}><TextField label="Installation Date" type="date" size="small" fullWidth value={form.installation_date} onChange={hc("installation_date")} disabled={isView} InputLabelProps={{ shrink: true }} /></Grid>
                  <Grid item xs={6}><TextField label="Capacity (per hour)" type="number" size="small" fullWidth value={form.capacity_per_hour} onChange={hc("capacity_per_hour")} disabled={isView} /></Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card sx={{ borderRadius: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: "var(--heading-color)" }}>Specifications & Maintenance</Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={6}><TextField label="Manufacturer" size="small" fullWidth value={form.manufacturer} onChange={hc("manufacturer")} disabled={isView} /></Grid>
                  <Grid item xs={6}><TextField label="Model No" size="small" fullWidth value={form.model_no} onChange={hc("model_no")} disabled={isView} /></Grid>
                  <Grid item xs={6}><TextField label="Serial No" size="small" fullWidth value={form.serial_no} onChange={hc("serial_no")} disabled={isView} /></Grid>
                  <Grid item xs={6}><TextField label="Power Rating" size="small" fullWidth value={form.power_rating} onChange={hc("power_rating")} disabled={isView} /></Grid>
                  <Grid item xs={6}><TextField label="Last Maintenance" type="date" size="small" fullWidth value={form.last_maintenance_date} onChange={hc("last_maintenance_date")} disabled={isView} InputLabelProps={{ shrink: true }} /></Grid>
                  <Grid item xs={6}><TextField label="Next Maintenance" type="date" size="small" fullWidth value={form.next_maintenance_date} onChange={hc("next_maintenance_date")} disabled={isView} InputLabelProps={{ shrink: true }} /></Grid>
                  <Grid item xs={12}><TextField label="Notes" multiline rows={3} size="small" fullWidth value={form.notes} onChange={hc("notes")} disabled={isView} /></Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
          {!isView && <Grid item xs={12}><Box display="flex" gap={2}>
            <Button type="submit" variant="contained" startIcon={<SaveIcon />} disabled={saving} size="large">{saving ? "Saving..." : id ? "Update" : "Create"}</Button>
            <Button variant="outlined" startIcon={<CancelIcon />} onClick={() => navigate("/production/machines")}>Cancel</Button>
          </Box></Grid>}
        </Grid>
      </form>
    </Box>
  );
}
