import React, { useEffect, useState } from "react";
import { Box, Card, CardContent, Typography, TextField, Button, Grid, MenuItem, LinearProgress, Divider } from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import axios from "axios";
import { useToast } from "../../../context/ToastContext";
import { useNavigate, useParams, useLocation } from "react-router-dom";

const API = "/api/erp/production/downtime";
const MACHINE_API = "/api/erp/production/machines";
const CATEGORIES = ["Breakdown", "Setup", "Maintenance", "No Material", "No Operator", "Power Failure", "Other"];
const STATUSES = ["Open", "Resolved", "Closed"];

export default function DowntimeForm() {
  const { id } = useParams();
  const location = useLocation();
  const isView = location.pathname.includes("/view/");
  const isEdit = Boolean(id) && !isView;
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [machines, setMachines] = useState([]);
  const [form, setForm] = useState({
    machine_id: "", downtime_date: new Date().toISOString().split("T")[0],
    start_time: "", end_time: "", duration_minutes: 0,
    category: "Breakdown", reason: "", action_taken: "",
    reported_by: "", resolved_by: "", status: "Open",
  });

  useEffect(() => {
    axios.get(MACHINE_API).then(({ data }) => setMachines(data || [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (id) {
      setLoading(true);
      axios.get(`${API}/${id}`).then(({ data }) => setForm({
        machine_id: data.machine_id || "",
        downtime_date: data.downtime_date ? data.downtime_date.split("T")[0] : "",
        start_time: data.start_time || "", end_time: data.end_time || "",
        duration_minutes: data.duration_minutes || 0, category: data.category || "Breakdown",
        reason: data.reason || "", action_taken: data.action_taken || "",
        reported_by: data.reported_by || "", resolved_by: data.resolved_by || "",
        status: data.status || "Open",
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
      navigate("/production/downtime");
    } catch (err) { showToast(err.response?.data?.error || "Failed", "error"); }
    finally { setSaving(false); }
  };
  if (loading) return <LinearProgress />;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: "bold", color: "var(--heading-color)" }}>
        {isView ? "View Downtime" : isEdit ? "Edit Downtime" : "New Downtime Entry"}
      </Typography>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card sx={{ borderRadius: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: "var(--heading-color)" }}>Downtime Details</Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={6}><TextField label="Date" type="date" size="small" fullWidth value={form.downtime_date} onChange={hc("downtime_date")} disabled={isView} InputLabelProps={{ shrink: true }} /></Grid>
                  <Grid item xs={6}><TextField label="Machine" select size="small" fullWidth value={form.machine_id} onChange={hc("machine_id")} disabled={isView} required>
                    <MenuItem value="">Select</MenuItem>
                    {machines.map((m) => <MenuItem key={m.id} value={m.id}>{m.machine_code} - {m.machine_name}</MenuItem>)}
                  </TextField></Grid>
                  <Grid item xs={6}><TextField label="Category" select size="small" fullWidth value={form.category} onChange={hc("category")} disabled={isView}>{CATEGORIES.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}</TextField></Grid>
                  <Grid item xs={6}><TextField label="Status" select size="small" fullWidth value={form.status} onChange={hc("status")} disabled={isView}>{STATUSES.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}</TextField></Grid>
                  <Grid item xs={6}><TextField label="Start Time" type="time" size="small" fullWidth value={form.start_time} onChange={hc("start_time")} disabled={isView} InputLabelProps={{ shrink: true }} /></Grid>
                  <Grid item xs={6}><TextField label="End Time" type="time" size="small" fullWidth value={form.end_time} onChange={hc("end_time")} disabled={isView} InputLabelProps={{ shrink: true }} /></Grid>
                  <Grid item xs={6}><TextField label="Duration (min)" type="number" size="small" fullWidth value={form.duration_minutes} onChange={hc("duration_minutes")} disabled={isView} /></Grid>
                  <Grid item xs={6}><TextField label="Reported By" size="small" fullWidth value={form.reported_by} onChange={hc("reported_by")} disabled={isView} /></Grid>
                  <Grid item xs={6}><TextField label="Resolved By" size="small" fullWidth value={form.resolved_by} onChange={hc("resolved_by")} disabled={isView} /></Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card sx={{ borderRadius: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: "var(--heading-color)" }}>Description & Actions</Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={12}><TextField label="Reason" multiline rows={3} size="small" fullWidth value={form.reason} onChange={hc("reason")} disabled={isView} /></Grid>
                  <Grid item xs={12}><TextField label="Action Taken" multiline rows={3} size="small" fullWidth value={form.action_taken} onChange={hc("action_taken")} disabled={isView} /></Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
          {!isView && <Grid item xs={12}><Box display="flex" gap={2}>
            <Button type="submit" variant="contained" startIcon={<SaveIcon />} disabled={saving} size="large">{saving ? "Saving..." : id ? "Update" : "Create"}</Button>
            <Button variant="outlined" startIcon={<CancelIcon />} onClick={() => navigate("/production/downtime")}>Cancel</Button>
          </Box></Grid>}
        </Grid>
      </form>
    </Box>
  );
}
