import React, { useEffect, useState } from "react";
import { Box, Card, CardContent, Typography, TextField, Button, Grid, MenuItem, LinearProgress, Divider, Alert, Chip } from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import axios from "axios";
import { useToast } from "../../../context/ToastContext";
import { useNavigate, useParams, useLocation } from "react-router-dom";

const API = "/api/erp/planning/schedules";
const MACHINE_API = "/api/erp/production/machines";
const ORDER_API = "/api/erp/production/orders";
const SHIFTS = ["Day", "Evening", "Night"];
const STATUSES = ["Planned", "InProgress", "Completed", "Cancelled"];

export default function ScheduleForm() {
  const { id } = useParams();
  const location = useLocation();
  const pathname = location.pathname;
  const isView = pathname.includes("/view/");
  const isEdit = Boolean(id) && !isView;
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [machines, setMachines] = useState([]);
  const [orders, setOrders] = useState([]);
  const [conflicts, setConflicts] = useState([]);
  const [form, setForm] = useState({
    schedule_no: "", order_id: "", machine_id: "", scheduled_date: "", shift: "Day",
    planned_qty: "", status: "Planned", notes: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [machRes, orderRes] = await Promise.all([
          axios.get(MACHINE_API, { params: { status: "Active" } }),
          axios.get(ORDER_API),
        ]);
        setMachines(machRes.data || []);
        setOrders(orderRes.data || []);
      } catch { /* ignore */ }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (id) {
      setLoading(true);
      axios.get(`${API}/${id}`).then(({ data }) => {
        setForm({
          schedule_no: data.schedule_no || "",
          order_id: data.order_id || "",
          machine_id: data.machine_id || "",
          scheduled_date: data.scheduled_date ? data.scheduled_date.split("T")[0] : "",
          shift: data.shift || "Day",
          planned_qty: data.planned_qty || "",
          status: data.status || "Planned",
          notes: data.notes || "",
        });
      }).catch(() => showToast("Failed to load", "error")).finally(() => setLoading(false));
    }
  }, [id]);

  const hc = (f) => (e) => {
    const val = e.target.value;
    setForm((p) => ({ ...p, [f]: val }));

    if ((f === "machine_id" || f === "scheduled_date" || f === "shift") && e.target.value) {
      checkConflicts({ ...form, [f]: e.target.value });
    }
  };

  const checkConflicts = async (checkForm) => {
    const { machine_id, scheduled_date, shift } = checkForm;
    if (!machine_id || !scheduled_date || !shift) return;
    try {
      const params = { machine_id, scheduled_date, shift };
      if (id) params.exclude_id = id;
      const { data } = await axios.get(`${API}/conflicts`, { params });
      setConflicts(data || []);
    } catch { /* ignore */ }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form };

      if (id && !isView) {
        await axios.put(`${API}/${id}`, payload);
        showToast("Updated", "success");
      } else {
        await axios.post(API, payload);
        showToast("Created", "success");
      }
      navigate("/planning/schedule");
    } catch (err) { showToast(err.response?.data?.error || "Failed", "error"); }
    finally { setSaving(false); }
  };

  if (loading) return <LinearProgress />;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: "bold", color: "var(--heading-color)" }}>
        {isView ? "View Schedule" : isEdit ? "Edit Schedule" : "New Schedule"}
      </Typography>

      {conflicts.length > 0 && (
        <Alert severity="warning" sx={{ mb: 2 }} onClose={() => setConflicts([])}>
          <Typography variant="body2" fontWeight={600}>Scheduling Conflict Detected</Typography>
           {conflicts.map((c) => (
             <Typography key={c.id} variant="caption" display="block">
               • {c.schedule_no} — {c.shift} shift on {c.scheduled_date} ({c.machine?.machine_code})
             </Typography>
           ))}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card sx={{ borderRadius: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: "var(--heading-color)" }}>Schedule Details</Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={4}>
                    <TextField label="Schedule No" size="small" fullWidth value={form.schedule_no}
                      onChange={hc("schedule_no")} disabled={isView} />
                  </Grid>
                  <Grid item xs={4}>
                    <TextField select label="Production Order" size="small" fullWidth value={form.order_id}
                      onChange={hc("order_id")} disabled={isView}>
                      <MenuItem value="">-- Select Order --</MenuItem>
                      {orders.map((o) => (
                        <MenuItem key={o.id} value={o.id}>{o.order_no} - {o.product_name}</MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid item xs={4}>
                    <TextField select label="Machine" size="small" fullWidth value={form.machine_id}
                      onChange={hc("machine_id")} disabled={isView}>
                      <MenuItem value="">-- Select Machine --</MenuItem>
                      {machines.map((m) => (
                        <MenuItem key={m.id} value={m.id}>{m.machine_code} - {m.machine_name}</MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid item xs={3}>
                    <TextField label="Date" type="date" size="small" fullWidth value={form.scheduled_date}
                      onChange={hc("scheduled_date")} disabled={isView} InputLabelProps={{ shrink: true }} />
                  </Grid>
                  <Grid item xs={3}>
                    <TextField label="Shift" select size="small" fullWidth value={form.shift}
                      onChange={hc("shift")} disabled={isView}>
                      {SHIFTS.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                    </TextField>
                  </Grid>
                  <Grid item xs={3}>
                    <TextField label="Planned Qty" type="number" size="small" fullWidth value={form.planned_qty}
                      onChange={hc("planned_qty")} disabled={isView} />
                  </Grid>
                  <Grid item xs={3}>
                    <TextField label="Status" select size="small" fullWidth value={form.status}
                      onChange={hc("status")} disabled={isView}>
                      {STATUSES.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                    </TextField>
                  </Grid>
                  <Grid item xs={6}>
                    <TextField label="Notes" multiline rows={2} size="small" fullWidth value={form.notes}
                      onChange={hc("notes")} disabled={isView} />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
          {!isView && (
            <Grid item xs={12}>
              <Box display="flex" gap={2}>
                <Button type="submit" variant="contained" startIcon={<SaveIcon />} disabled={saving} size="large">
                  {saving ? "Saving..." : id ? "Update" : "Create"}
                </Button>
                <Button variant="outlined" startIcon={<CancelIcon />} onClick={() => navigate("/planning/schedule")}>
                  Cancel
                </Button>
              </Box>
            </Grid>
          )}
        </Grid>
      </form>
    </Box>
  );
}
