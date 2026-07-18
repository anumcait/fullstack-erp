import React, { useEffect, useState } from "react";
import {
  Box, Card, CardContent, Typography, TextField, Button, Grid,
  MenuItem, LinearProgress, Divider
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import axios from "axios";
import { useToast } from "../../context/ToastContext";
import { useNavigate, useParams, useLocation } from "react-router-dom";

const API = "/api/erp/quality/non-conformances";
const INSP_API = "/api/erp/quality/inspections";

const NC_TYPES = ["Critical", "Major", "Minor"];
const SEVERITIES = ["Low", "Medium", "High", "Critical"];
const STATUSES = ["Open", "In Progress", "Resolved", "Closed"];

export default function NonConformanceForm() {
  const { id } = useParams();
  const location = useLocation();
  const isView = location.pathname.includes("/view/");
  const isEdit = Boolean(id) && !isView;
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [inspections, setInspections] = useState([]);
  const [form, setForm] = useState({
    inspection_id: "", nc_type: "Minor", description: "", root_cause: "",
    corrective_action: "", preventive_action: "", status: "Open",
    severity: "Medium", reported_by: "", assigned_to: "", resolution_date: "", remarks: "",
  });

  useEffect(() => {
    axios.get(INSP_API).then(({ data }) => setInspections(data || [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (id) {
      setLoading(true);
      axios.get(`${API}/${id}`)
        .then(({ data }) => setForm({
          inspection_id: data.inspection_id || "", nc_type: data.nc_type || "Minor",
          description: data.description || "", root_cause: data.root_cause || "",
          corrective_action: data.corrective_action || "", preventive_action: data.preventive_action || "",
          status: data.status || "Open", severity: data.severity || "Medium",
          reported_by: data.reported_by || "", assigned_to: data.assigned_to || "",
          resolution_date: data.resolution_date ? data.resolution_date.split("T")[0] : "",
          remarks: data.remarks || "",
        }))
        .catch(() => showToast("Failed to load NC", "error"))
        .finally(() => setLoading(false));
    }
  }, [id]);

  const handleChange = (f) => (e) => setForm((p) => ({ ...p, [f]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (id && !isView) {
        await axios.put(`${API}/${id}`, form);
        showToast("NC updated", "success");
      } else {
        await axios.post(API, form);
        showToast("NC created", "success");
      }
      navigate("/quality/non-conformances");
    } catch (err) {
      showToast(err.response?.data?.error || "Failed to save", "error");
    } finally { setSaving(false); }
  };

  if (loading) return <LinearProgress />;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: "bold", color: "var(--heading-color)" }}>
        {isView ? "View NC Report" : isEdit ? "Edit NC Report" : "New NC Report"}
      </Typography>

      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card sx={{ borderRadius: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: "var(--heading-color)" }}>NC Details</Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField label="NC Type" select size="small" fullWidth value={form.nc_type}
                      onChange={handleChange("nc_type")} disabled={isView} required>
                      {NC_TYPES.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                    </TextField>
                  </Grid>
                  <Grid item xs={6}>
                    <TextField label="Severity" select size="small" fullWidth value={form.severity}
                      onChange={handleChange("severity")} disabled={isView}>
                      {SEVERITIES.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                    </TextField>
                  </Grid>
                  <Grid item xs={6}>
                    <TextField label="Status" select size="small" fullWidth value={form.status}
                      onChange={handleChange("status")} disabled={isView}>
                      {STATUSES.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                    </TextField>
                  </Grid>
                  <Grid item xs={6}>
                    <TextField label="Related Inspection" select size="small" fullWidth value={form.inspection_id}
                      onChange={handleChange("inspection_id")} disabled={isView}>
                      <MenuItem value="">None</MenuItem>
                      {inspections.map((i) => <MenuItem key={i.id} value={i.id}>{i.inspection_no} - {i.item_name}</MenuItem>)}
                    </TextField>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField label="Description" multiline rows={3} size="small" fullWidth value={form.description}
                      onChange={handleChange("description")} disabled={isView} required />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField label="Reported By" size="small" fullWidth value={form.reported_by}
                      onChange={handleChange("reported_by")} disabled={isView} />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField label="Assigned To" size="small" fullWidth value={form.assigned_to}
                      onChange={handleChange("assigned_to")} disabled={isView} />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField label="Resolution Date" type="date" size="small" fullWidth value={form.resolution_date}
                      onChange={handleChange("resolution_date")} disabled={isView} InputLabelProps={{ shrink: true }} />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card sx={{ borderRadius: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: "var(--heading-color)" }}>Root Cause & Actions</Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField label="Root Cause" multiline rows={3} size="small" fullWidth value={form.root_cause}
                      onChange={handleChange("root_cause")} disabled={isView} />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField label="Corrective Action" multiline rows={3} size="small" fullWidth value={form.corrective_action}
                      onChange={handleChange("corrective_action")} disabled={isView} />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField label="Preventive Action" multiline rows={3} size="small" fullWidth value={form.preventive_action}
                      onChange={handleChange("preventive_action")} disabled={isView} />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField label="Remarks" multiline rows={2} size="small" fullWidth value={form.remarks}
                      onChange={handleChange("remarks")} disabled={isView} />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {!isView && (
            <Grid item xs={12}>
              <Box display="flex" gap={2}>
                <Button type="submit" variant="contained" startIcon={<SaveIcon />} disabled={saving} size="large">
                  {saving ? "Saving..." : id ? "Update NC" : "Create NC"}
                </Button>
                <Button variant="outlined" startIcon={<CancelIcon />} onClick={() => navigate("/quality/non-conformances")}>Cancel</Button>
              </Box>
            </Grid>
          )}
        </Grid>
      </form>
    </Box>
  );
}
