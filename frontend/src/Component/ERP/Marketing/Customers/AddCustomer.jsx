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

const API = "/api/erp/marketing/customers";

const PAYMENT_TERMS = ["Immediate", "7 Days", "15 Days", "30 Days", "45 Days", "60 Days", "90 Days"];

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
  "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Andaman & Nicobar", "Chandigarh", "Dadra & Nagar Haveli & Daman & Diu",
  "Delhi", "Jammu & Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
];

export default function AddCustomer() {
  const { id } = useParams();
  const location = useLocation();
  const isView = location.pathname.includes("/view/");
  const isEdit = Boolean(id) && !isView;
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    customer_code: "", customer_name: "", contact_person: "", email: "", phone: "", mobile: "",
    address_line1: "", address_line2: "", city: "", state: "", pincode: "",
    gstin: "", gst_registration_type: "", pan_no: "",
    msme_reg_no: "", msme_type: "", payment_terms: "",
  });

  useEffect(() => {
    if (id) {
      setLoading(true);
      axios.get(`${API}/${id}`)
        .then(({ data }) => setForm({
          customer_code: data.customer_code || "", customer_name: data.customer_name || "",
          contact_person: data.contact_person || "", email: data.email || "",
          phone: data.phone || "", mobile: data.mobile || "",
          address_line1: data.address_line1 || "", address_line2: data.address_line2 || "",
          city: data.city || "", state: data.state || "", pincode: data.pincode || "",
          gstin: data.gstin || "", gst_registration_type: data.gst_registration_type || "",
          pan_no: data.pan_no || "", msme_reg_no: data.msme_reg_no || "",
          msme_type: data.msme_type || "", payment_terms: data.payment_terms || "",
        }))
        .catch(() => showToast("Failed to load customer", "error"))
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
        showToast("Customer updated", "success");
      } else {
        await axios.post(API, form);
        showToast("Customer created", "success");
      }
      navigate("/marketing/customers");
    } catch (err) {
      showToast(err.response?.data?.error || "Failed to save", "error");
    } finally { setSaving(false); }
  };

  if (loading) return <LinearProgress />;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: "bold", color: "var(--heading-color)" }}>
        {isView ? "View Customer" : isEdit ? "Edit Customer" : "New Customer"}
      </Typography>

      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card sx={{ borderRadius: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: "var(--heading-color)" }}>Basic Info</Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField label="Customer Code" size="small" fullWidth value={form.customer_code} onChange={handleChange("customer_code")}
                      disabled={isView} required />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField label="Customer Name" size="small" fullWidth value={form.customer_name} onChange={handleChange("customer_name")}
                      disabled={isView} required />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField label="Contact Person" size="small" fullWidth value={form.contact_person} onChange={handleChange("contact_person")}
                      disabled={isView} />
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
                    <TextField label="Payment Terms" select size="small" fullWidth value={form.payment_terms}
                      onChange={handleChange("payment_terms")} disabled={isView}>
                      {PAYMENT_TERMS.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                    </TextField>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card sx={{ borderRadius: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: "var(--heading-color)" }}>Address</Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField label="Address Line 1" size="small" fullWidth value={form.address_line1} onChange={handleChange("address_line1")} disabled={isView} />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField label="Address Line 2" size="small" fullWidth value={form.address_line2} onChange={handleChange("address_line2")} disabled={isView} />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField label="City" size="small" fullWidth value={form.city} onChange={handleChange("city")} disabled={isView} />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField label="State" select size="small" fullWidth value={form.state} onChange={handleChange("state")} disabled={isView}>
                      {INDIAN_STATES.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                    </TextField>
                  </Grid>
                  <Grid item xs={6}>
                    <TextField label="Pincode" size="small" fullWidth value={form.pincode} onChange={handleChange("pincode")} disabled={isView} />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card sx={{ borderRadius: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: "var(--heading-color)" }}>Tax & Regulatory</Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={6} md={3}>
                    <TextField label="GSTIN" size="small" fullWidth value={form.gstin} onChange={handleChange("gstin")} disabled={isView} />
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <TextField label="GST Registration Type" select size="small" fullWidth value={form.gst_registration_type}
                      onChange={handleChange("gst_registration_type")} disabled={isView}>
                      <MenuItem value="">None</MenuItem>
                      <MenuItem value="Regular">Regular</MenuItem>
                      <MenuItem value="Composition">Composition</MenuItem>
                      <MenuItem value="Unregistered">Unregistered</MenuItem>
                    </TextField>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <TextField label="PAN No" size="small" fullWidth value={form.pan_no} onChange={handleChange("pan_no")} disabled={isView} />
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <TextField label="MSME Reg No" size="small" fullWidth value={form.msme_reg_no} onChange={handleChange("msme_reg_no")} disabled={isView} />
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <TextField label="MSME Type" select size="small" fullWidth value={form.msme_type} onChange={handleChange("msme_type")} disabled={isView}>
                      <MenuItem value="">None</MenuItem>
                      <MenuItem value="Micro">Micro</MenuItem>
                      <MenuItem value="Small">Small</MenuItem>
                      <MenuItem value="Medium">Medium</MenuItem>
                    </TextField>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {!isView && (
            <Grid item xs={12}>
              <Box display="flex" gap={2}>
                <Button type="submit" variant="contained" startIcon={<SaveIcon />} disabled={saving} size="large">
                  {saving ? "Saving..." : id ? "Update Customer" : "Create Customer"}
                </Button>
                <Button variant="outlined" startIcon={<CancelIcon />} onClick={() => navigate("/marketing/customers")}>Cancel</Button>
              </Box>
            </Grid>
          )}
        </Grid>
      </form>
    </Box>
  );
}
