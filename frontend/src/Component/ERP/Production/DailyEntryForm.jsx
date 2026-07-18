import React, { useEffect, useState } from "react";
import { Box, Card, CardContent, Typography, TextField, Button, Grid, MenuItem, LinearProgress, Divider } from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import axios from "axios";
import { useToast } from "../../../context/ToastContext";
import { useNavigate, useParams, useLocation } from "react-router-dom";

const API = "/api/erp/production/daily-entry";
const MACHINE_API = "/api/erp/production/machines";
const ORDER_API = "/api/erp/production/orders";
const SHIFTS = ["General", "A", "B", "C"];
const STATUSES = ["Pending", "Completed", "Approved"];

export default function DailyEntryForm() {
  const { id } = useParams();
  const location = useLocation();
  const isView = location.pathname.includes("/view/");
  const isEdit = Boolean(id) && !isView;
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [machines, setMachines] = useState([]);
  const [orders, setOrders] = useState([]);
  const [form, setForm] = useState({
    entry_date: new Date().toISOString().split("T")[0], shift: "General",
    machine_id: "", order_id: "", operator_name: "",
    planned_qty: 0, produced_qty: 0, rejected_qty: 0,
    downtime_minutes: 0, downtime_reason: "", notes: "", status: "Pending", recorded_by: "",
  });

  useEffect(() => {
    Promise.all([
      axios.get(MACHINE_API).then(({ data }) => setMachines(data || [])).catch(() => {}),
      axios.get(ORDER_API).then(({ data }) => setOrders(data || [])).catch(() => {}),
    ]);
  }, []);

  useEffect(() => {
    if (id) {
      setLoading(true);
      axios.get(`${API}/${id}`).then(({ data }) => setForm({
        entry_date: data.entry_date ? data.entry_date.split("T")[0] : "",
        shift: data.shift || "General", machine_id: data.machine_id || "",
        order_id: data.order_id || "", operator_name: data.operator_name || "",
        planned_qty: data.planned_qty || 0, produced_qty: data.produced_qty || 0,
        rejected_qty: data.rejected_qty || 0, downtime_minutes: data.downtime_minutes || 0,
        downtime_reason: data.downtime_reason || "", notes: data.notes || "",
        status: data.status || "Pending", recorded_by: data.recorded_by || "",
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
      navigate("/production/daily-entry");
    } catch (err) { showToast(err.response?.data?.error || "Failed", "error"); }
    finally { setSaving(false); }
  };
  if (loading) return <LinearProgress />;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: "bold", color: "var(--heading-color)" }}>
        {isView ? "View Entry" : isEdit ? "Edit Entry" : "New Daily Entry"}
      </Typography>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card sx={{ borderRadius: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: "var(--heading-color)" }}>Entry Info</Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={6}><TextField label="Date" type="date" size="small" fullWidth value={form.entry_date} onChange={hc("entry_date")} disabled={isView} InputLabelProps={{ shrink: true }} /></Grid>
                  <Grid item xs={6}><TextField label="Shift" select size="small" fullWidth value={form.shift} onChange={hc("shift")} disabled={isView}>{SHIFTS.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}</TextField></Grid>
                  <Grid item xs={6}><TextField label="Machine" select size="small" fullWidth value={form.machine_id} onChange={hc("machine_id")} disabled={isView}>
                    <MenuItem value="">Select</MenuItem>
                    {machines.map((m) => <MenuItem key={m.id} value={m.id}>{m.machine_code} - {m.machine_name}</MenuItem>)}
                  </TextField></Grid>
                  <Grid item xs={6}><TextField label="Order #" select size="small" fullWidth value={form.order_id} onChange={hc("order_id")} disabled={isView}>
                    <MenuItem value="">Select</MenuItem>
                    {orders.map((o) => <MenuItem key={o.id} value={o.id}>{o.order_no} - {o.product_name}</MenuItem>)}
                  </TextField></Grid>
                  <Grid item xs={6}><TextField label="Operator" size="small" fullWidth value={form.operator_name} onChange={hc("operator_name")} disabled={isView} /></Grid>
                  <Grid item xs={6}><TextField label="Recorded By" size="small" fullWidth value={form.recorded_by} onChange={hc("recorded_by")} disabled={isView} /></Grid>
                  <Grid item xs={6}><TextField label="Status" select size="small" fullWidth value={form.status} onChange={hc("status")} disabled={isView}>{STATUSES.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}</TextField></Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card sx={{ borderRadius: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: "var(--heading-color)" }}>Production & Downtime</Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={4}><TextField label="Planned Qty" type="number" size="small" fullWidth value={form.planned_qty} onChange={hc("planned_qty")} disabled={isView} /></Grid>
                  <Grid item xs={4}><TextField label="Produced Qty" type="number" size="small" fullWidth value={form.produced_qty} onChange={hc("produced_qty")} disabled={isView} /></Grid>
                  <Grid item xs={4}><TextField label="Rejected Qty" type="number" size="small" fullWidth value={form.rejected_qty} onChange={hc("rejected_qty")} disabled={isView} /></Grid>
                  <Grid item xs={6}><TextField label="Downtime (min)" type="number" size="small" fullWidth value={form.downtime_minutes} onChange={hc("downtime_minutes")} disabled={isView} /></Grid>
                  <Grid item xs={6}><TextField label="Downtime Reason" size="small" fullWidth value={form.downtime_reason} onChange={hc("downtime_reason")} disabled={isView} /></Grid>
                  <Grid item xs={12}><TextField label="Notes" multiline rows={2} size="small" fullWidth value={form.notes} onChange={hc("notes")} disabled={isView} /></Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
          {!isView && <Grid item xs={12}><Box display="flex" gap={2}>
            <Button type="submit" variant="contained" startIcon={<SaveIcon />} disabled={saving} size="large">{saving ? "Saving..." : id ? "Update" : "Create"}</Button>
            <Button variant="outlined" startIcon={<CancelIcon />} onClick={() => navigate("/production/daily-entry")}>Cancel</Button>
          </Box></Grid>}
        </Grid>
      </form>
    </Box>
  );
}
