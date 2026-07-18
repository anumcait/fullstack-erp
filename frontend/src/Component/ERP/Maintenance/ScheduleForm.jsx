import React, { useEffect, useState } from "react";
import { Box, Card, CardContent, Typography, TextField, Button, Grid, MenuItem, LinearProgress, Divider } from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import axios from "axios";
import { useToast } from "../../../context/ToastContext";
import { useNavigate, useParams, useLocation } from "react-router-dom";

const API = "/api/erp/maintenance/schedules";
const FREQUENCIES = ["Daily", "Weekly", "Monthly", "Quarterly", "Yearly"];
const STATUSES = ["Pending", "Overdue", "Completed"];

export default function ScheduleForm() {
  const { id } = useParams();
  const location = useLocation();
  const isView = location.pathname.includes("/view/");
  const isEdit = Boolean(id) && !isView;
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    schedule_no: "", machine_id: "", asset_id: "", task_name: "", frequency: "Monthly",
    last_done_date: "", next_due_date: "", assigned_to: "", status: "Pending", notes: "",
  });

  useEffect(() => {
    if (id) {
      setLoading(true);
      axios.get(`${API}/${id}`).then(({ data }) => setForm({
        schedule_no: data.schedule_no || "", machine_id: data.machine_id || "", asset_id: data.asset_id || "",
        task_name: data.task_name || "", frequency: data.frequency || "Monthly",
        last_done_date: data.last_done_date ? data.last_done_date.split("T")[0] : "",
        next_due_date: data.next_due_date ? data.next_due_date.split("T")[0] : "",
        assigned_to: data.assigned_to || "", status: data.status || "Pending", notes: data.notes || "",
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
      navigate("/maintenance/schedule");
    } catch (err) { showToast(err.response?.data?.error || "Failed", "error"); }
    finally { setSaving(false); }
  };
  if (loading) return <LinearProgress />;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: "bold", color: "var(--heading-color)" }}>
        {isView ? "View Schedule" : isEdit ? "Edit Schedule" : "New PM Schedule"}
      </Typography>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card sx={{ borderRadius: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: "var(--heading-color)" }}>Schedule Info</Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={4}><TextField label="Schedule No" size="small" fullWidth value={form.schedule_no} onChange={hc("schedule_no")} disabled={isView} /></Grid>
                  <Grid item xs={4}><TextField label="Task Name" size="small" fullWidth value={form.task_name} onChange={hc("task_name")} disabled={isView} required /></Grid>
                  <Grid item xs={4}><TextField label="Frequency" select size="small" fullWidth value={form.frequency} onChange={hc("frequency")} disabled={isView}>{FREQUENCIES.map((f) => <MenuItem key={f} value={f}>{f}</MenuItem>)}</TextField></Grid>
                  <Grid item xs={3}><TextField label="Machine ID" type="number" size="small" fullWidth value={form.machine_id} onChange={hc("machine_id")} disabled={isView} /></Grid>
                  <Grid item xs={3}><TextField label="Asset ID" type="number" size="small" fullWidth value={form.asset_id} onChange={hc("asset_id")} disabled={isView} /></Grid>
                  <Grid item xs={3}><TextField label="Status" select size="small" fullWidth value={form.status} onChange={hc("status")} disabled={isView}>{STATUSES.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}</TextField></Grid>
                  <Grid item xs={3}><TextField label="Assigned To" size="small" fullWidth value={form.assigned_to} onChange={hc("assigned_to")} disabled={isView} /></Grid>
                  <Grid item xs={3}><TextField label="Last Done Date" type="date" size="small" fullWidth value={form.last_done_date} onChange={hc("last_done_date")} disabled={isView} InputLabelProps={{ shrink: true }} /></Grid>
                  <Grid item xs={3}><TextField label="Next Due Date" type="date" size="small" fullWidth value={form.next_due_date} onChange={hc("next_due_date")} disabled={isView} InputLabelProps={{ shrink: true }} /></Grid>
                  <Grid item xs={12}><TextField label="Notes" multiline rows={2} size="small" fullWidth value={form.notes} onChange={hc("notes")} disabled={isView} /></Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
          {!isView && <Grid item xs={12}><Box display="flex" gap={2}>
            <Button type="submit" variant="contained" startIcon={<SaveIcon />} disabled={saving} size="large">{saving ? "Saving..." : id ? "Update" : "Create"}</Button>
            <Button variant="outlined" startIcon={<CancelIcon />} onClick={() => navigate("/maintenance/schedule")}>Cancel</Button>
          </Box></Grid>}
        </Grid>
      </form>
    </Box>
  );
}
