import React, { useEffect, useState } from "react";
import {
  Box, Card, CardContent, Typography, TextField, Button, Grid,
  MenuItem, LinearProgress, Divider
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import axios from "axios";
import { useToast } from "../../../../context/ToastContext";
import { useNavigate, useParams, useLocation } from "react-router-dom";

const API = "/api/erp/marketing/leads";

const STATUSES = ["New", "Contacted", "Qualified", "Proposal", "Negotiation", "Closed Won", "Closed Lost"];
const PRIORITIES = ["Low", "Medium", "High"];
const SOURCES = ["Website", "Referral", "Cold Call", "Email", "Trade Show", "Social Media", "Walk-in", "Other"];

export default function LeadForm() {
  const { id } = useParams();
  const location = useLocation();
  const isView = location.pathname.includes("/view/");
  const isEdit = Boolean(id) && !isView;
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    lead_no: "", company_name: "", contact_person: "", email: "", phone: "", mobile: "",
    status: "New", priority: "Medium", source: "", expected_value: "",
    description: "", address: "",
  });

  useEffect(() => {
    if (id) {
      setLoading(true);
      axios.get(`${API}/${id}`)
        .then(({ data }) => setForm({
          lead_no: data.lead_no || "", company_name: data.company_name || "",
          contact_person: data.contact_person || "", email: data.email || "",
          phone: data.phone || "", mobile: data.mobile || "",
          status: data.status || "New", priority: data.priority || "Medium",
          source: data.source || "", expected_value: data.expected_value || "",
          description: data.description || "", address: data.address || "",
        }))
        .catch(() => showToast("Failed to load lead", "error"))
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
        showToast("Lead updated", "success");
      } else {
        await axios.post(API, form);
        showToast("Lead created", "success");
      }
      navigate("/marketing/leads");
    } catch (err) {
      showToast(err.response?.data?.error || "Failed to save", "error");
    } finally { setSaving(false); }
  };

  if (loading) return <LinearProgress />;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: "bold", color: "var(--heading-color)" }}>
        {isView ? "View Lead" : isEdit ? "Edit Lead" : "New Lead"}
      </Typography>

      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card sx={{ borderRadius: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: "var(--heading-color)" }}>Lead Details</Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField label="Lead #" size="small" fullWidth value={form.lead_no} onChange={handleChange("lead_no")} disabled={isView} />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField label="Company Name" size="small" fullWidth value={form.company_name} onChange={handleChange("company_name")} disabled={isView} required />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField label="Contact Person" size="small" fullWidth value={form.contact_person} onChange={handleChange("contact_person")} disabled={isView} />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField label="Email" size="small" fullWidth value={form.email} onChange={handleChange("email")} disabled={isView} />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField label="Phone" size="small" fullWidth value={form.phone} onChange={handleChange("phone")} disabled={isView} />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField label="Mobile" size="small" fullWidth value={form.mobile} onChange={handleChange("mobile")} disabled={isView} />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField label="Source" select size="small" fullWidth value={form.source} onChange={handleChange("source")} disabled={isView}>
                      {SOURCES.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                    </TextField>
                  </Grid>
                  <Grid item xs={6}>
                    <TextField label="Expected Value" type="number" size="small" fullWidth value={form.expected_value}
                      onChange={handleChange("expected_value")} disabled={isView} />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card sx={{ borderRadius: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: "var(--heading-color)" }}>Pipeline & Tracking</Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField label="Status" select size="small" fullWidth value={form.status} onChange={handleChange("status")} disabled={isView}>
                      {STATUSES.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                    </TextField>
                  </Grid>
                  <Grid item xs={6}>
                    <TextField label="Priority" select size="small" fullWidth value={form.priority} onChange={handleChange("priority")} disabled={isView}>
                      {PRIORITIES.map((p) => <MenuItem key={p} value={p}>{p}</MenuItem>)}
                    </TextField>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField label="Description / Notes" multiline rows={4} size="small" fullWidth value={form.description}
                      onChange={handleChange("description")} disabled={isView} />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField label="Address" multiline rows={3} size="small" fullWidth value={form.address}
                      onChange={handleChange("address")} disabled={isView} />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {!isView && (
            <Grid item xs={12}>
              <Box display="flex" gap={2}>
                <Button type="submit" variant="contained" startIcon={<SaveIcon />} disabled={saving} size="large">
                  {saving ? "Saving..." : id ? "Update Lead" : "Create Lead"}
                </Button>
                <Button variant="outlined" startIcon={<CancelIcon />} onClick={() => navigate("/marketing/leads")}>Cancel</Button>
              </Box>
            </Grid>
          )}
        </Grid>
      </form>
    </Box>
  );
}
