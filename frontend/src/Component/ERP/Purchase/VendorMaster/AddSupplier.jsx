import React, { useEffect, useState } from "react";
import {
  Box, Card, CardContent, Typography, TextField, Button, Grid,
  MenuItem, LinearProgress, Tabs, Tab, Chip, Divider, IconButton, Tooltip, Alert,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import StarIcon from "@mui/icons-material/Star";
import SearchIcon from "@mui/icons-material/Search";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import axios from "axios";
import { useToast } from "../../../../context/ToastContext";
import { useNavigate, useParams, useLocation } from "react-router-dom";

const API = "/api/erp/purchase/suppliers";
const RATING_API = "/api/erp/purchase/vendor-ratings";

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

function TabPanel({ children, value, index }) {
  return value === index ? <Box sx={{ pt: 3 }}>{children}</Box> : null;
}

function ScoreCard({ label, value }) {
  return (
    <Box sx={{ textAlign: "center", p: 2, bgcolor: "#f8fafc", borderRadius: 2, border: "1px solid #e0e7ef" }}>
      <Typography variant="h4" sx={{ fontWeight: 700, color: "var(--heading-color)" }}>{value || "—"}</Typography>
      <Typography variant="caption" color="textSecondary">{label}</Typography>
    </Box>
  );
}

export default function AddSupplier() {
  const { id } = useParams();
  const location = useLocation();
  const isView = location.pathname.includes("/view/");
  const isEdit = Boolean(id) && !isView;
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState(0);
  const [ratings, setRatings] = useState([]);
  const [ratingSummary, setRatingSummary] = useState(null);
  const [dataSource, setDataSource] = useState(null);

  const [form, setForm] = useState({
    party_type: "Supplier", supplier_code: "", supplier_name: "",
    contact_person: "", email: "", phone: "", mobile: "",
    address_line1: "", address_line2: "", city: "", state: "", pincode: "",
    gstin: "", gst_registration_type: "", pan_no: "",
    msme_reg_no: "", msme_type: "", payment_terms: "",
  });

  useEffect(() => {
    if (id) {
      setLoading(true);
      axios.get(`${API}/${id}`)
        .then(({ data }) => {
          setForm({
            party_type: data.party_type || "Supplier",
            supplier_code: data.supplier_code || "",
            supplier_name: data.supplier_name || "",
            contact_person: data.contact_person || "",
            email: data.email || "",
            phone: data.phone || "",
            mobile: data.mobile || "",
            address_line1: data.address_line1 || "",
            address_line2: data.address_line2 || "",
            city: data.city || "",
            state: data.state || "",
            pincode: data.pincode || "",
            gstin: data.gstin || "",
            gst_registration_type: data.gst_registration_type || "",
            pan_no: data.pan_no || "",
            msme_reg_no: data.msme_reg_no || "",
            msme_type: data.msme_type || "",
            payment_terms: data.payment_terms || "",
          });
        })
        .catch(() => showToast("Failed to load party", "error"))
        .finally(() => setLoading(false));
    }
  }, [id]);

  const fetchRatings = async () => {
    if (!id) return;
    try {
      const [listRes, summaryRes] = await Promise.all([
        axios.get(RATING_API, { params: { supplier_id: id } }),
        axios.get(`${RATING_API}/supplier/${id}`),
      ]);
      setRatings(listRes.data);
      setRatingSummary(summaryRes.data);
    } catch { /* ignore */ }
  };

  useEffect(() => {
    if (id && tab === 3) fetchRatings();
  }, [id, tab]);

  const lookupGSTIN = async () => {
    const gstin = form.gstin?.trim();
    if (!gstin || gstin.length < 15) {
      showToast("Enter a valid 15-character GSTIN", "warning");
      return;
    }
    try {
      const { data } = await axios.get(`/api/erp/purchase/suppliers/lookup/gstin/${gstin}`);
      if (data.found) {
        setDataSource(data.source);
        // Parse address: "..., City, State — Pincode"
        let addrLine1 = data.address || '';
        let addrCity = data.city || '';
        let addrState = data.state || '';
        let addrPincode = data.pincode || '';
        if (addrLine1 && !addrCity && addrLine1.includes(' — ')) {
          const parts = addrLine1.split(' — ');
          const before = parts[0] || '';
          addrPincode = parts[1] || '';
          const commaParts = before.split(', ');
          addrCity = commaParts.length > 1 ? commaParts[commaParts.length - 2] || '' : '';
          addrLine1 = commaParts.slice(0, -2).join(', ') || before;
        }
        setForm((prev) => ({
          ...prev,
          supplier_name: data.supplier_name || prev.supplier_name,
          supplier_code: data.supplier_code || prev.supplier_code,
          pan_no: data.pan_no || prev.pan_no,
          state: addrState || prev.state,
          address_line1: addrLine1 || prev.address_line1,
          city: addrCity || prev.city,
          pincode: addrPincode || prev.pincode,
          gst_registration_type: data.gst_registration_type || prev.gst_registration_type,
        }));
        const label = data.source === 'mock' ? '[DEMO] ' : '';
        showToast(`${label}Fetched: ${data.supplier_name}`, data.source === 'mock' ? 'warning' : 'success');
      } else {
        const pan = gstin.substring(0, 10);
        setForm((prev) => ({
          ...prev,
          pan_no: pan,
          supplier_code: prev.supplier_code || pan,
        }));
        showToast("GSTIN not found. PAN auto-filled.", "info");
      }
    } catch {
      showToast("Failed to lookup GSTIN", "error");
    }
  };

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.supplier_code || !form.supplier_name) {
      showToast("Code and name are required", "warning");
      return;
    }
    setSaving(true);
    try {
      if (isEdit) {
        await axios.put(`${API}/${id}`, form);
        showToast("Updated", "success");
      } else {
        await axios.post(API, form);
        showToast("Created", "success");
      }
      navigate("/purchase/vendors");
    } catch (err) {
      showToast(err.response?.data?.error || "Failed to save", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LinearProgress />;

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
        <Tooltip title="Back to Party Master">
          <IconButton onClick={() => navigate("/purchase/vendors")} sx={{ mr: 0.5 }}>
            <ArrowBackIcon />
          </IconButton>
        </Tooltip>
        <Typography variant="h4" sx={{ fontWeight: "bold", color: "var(--heading-color)" }}>
          {isView ? form.party_type : isEdit ? `Edit ${form.party_type}` : `New ${form.party_type}`}
        </Typography>
      </Box>
      <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
        {form.supplier_code && `${form.supplier_code} • `}{form.supplier_name || "Enter details below"}
      </Typography>

      {dataSource === 'mock' && (
        <Alert severity="warning" sx={{ mb: 2, borderRadius: 2 }}
          action={
            <Button color="inherit" size="small" onClick={() => window.open('https://gstverify.co.in/dev-api', '_blank')}>
              Get Free Key
            </Button>
          }
        >
          Demo data — name is auto-generated. <strong>2-minute fix:</strong> Sign up at gstverify.co.in with Google, paste the free API key in <code>backend/.env</code> as <code>GST_API_KEY</code>.
        </Alert>
      )}

      <Card sx={{ borderRadius: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
        <Box sx={{ borderBottom: 1, borderColor: "divider", px: 2 }}>
          <Tabs value={tab} onChange={(e, v) => setTab(v)} textColor="primary" indicatorColor="primary">
            <Tab label="Basic Info" />
            <Tab label="Address" />
            <Tab label="Tax & Compliance" />
            <Tab label="Vendor Rating" />
            <Tab label="Commercial" />
          </Tabs>
        </Box>

        <CardContent>
          <form onSubmit={handleSubmit}>
            <TabPanel value={tab} index={0}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={3}>
                  <TextField label="Party Type" size="small" fullWidth select value={form.party_type} onChange={handleChange("party_type")} required disabled={isView}>
                    <MenuItem value="Supplier">Supplier</MenuItem>
                    <MenuItem value="Sub-Contractor">Sub-Contractor</MenuItem>
                    <MenuItem value="Customer">Customer</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField label="Code *" size="small" fullWidth value={form.supplier_code} onChange={handleChange("supplier_code")} required disabled={isView} />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField label="Name *" size="small" fullWidth value={form.supplier_name} onChange={handleChange("supplier_name")} required disabled={isView} />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField label="Contact Person" size="small" fullWidth value={form.contact_person} onChange={handleChange("contact_person")} disabled={isView} />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField label="Email" size="small" fullWidth type="email" value={form.email} onChange={handleChange("email")} disabled={isView} />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField label="Mobile" size="small" fullWidth value={form.mobile} onChange={handleChange("mobile")} disabled={isView} />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField label="Phone" size="small" fullWidth value={form.phone} onChange={handleChange("phone")} disabled={isView} />
                </Grid>
              </Grid>
            </TabPanel>

            <TabPanel value={tab} index={1}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField label="Address Line 1" size="small" fullWidth value={form.address_line1} onChange={handleChange("address_line1")} disabled={isView} />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField label="Address Line 2" size="small" fullWidth value={form.address_line2} onChange={handleChange("address_line2")} disabled={isView} />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField label="City" size="small" fullWidth value={form.city} onChange={handleChange("city")} disabled={isView} />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField label="State" size="small" fullWidth select value={form.state} onChange={handleChange("state")} disabled={isView}>
                    <MenuItem value="">-- Select --</MenuItem>
                    {INDIAN_STATES.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                  </TextField>
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField label="Pincode" size="small" fullWidth value={form.pincode} onChange={handleChange("pincode")} disabled={isView} />
                </Grid>
              </Grid>
            </TabPanel>

            <TabPanel value={tab} index={2}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <TextField label="GSTIN" size="small" fullWidth value={form.gstin} onChange={handleChange("gstin")} inputProps={{ maxLength: 15 }} disabled={isView}
                    InputProps={{
                      endAdornment: !isView && (
                        <Box sx={{ display: "flex", gap: 0.5 }}>
                          <Tooltip title="Fetch from GSTIN">
                            <IconButton size="small" onClick={lookupGSTIN}><SearchIcon /></IconButton>
                          </Tooltip>
                          <Tooltip title="Search on GST Portal">
                            <IconButton size="small" onClick={() => window.open(`https://services.gst.gov.in/services/search?gstin=${form.gstin}`, '_blank')}>
                              <OpenInNewIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField label="GST Registration Type" size="small" fullWidth select value={form.gst_registration_type} onChange={handleChange("gst_registration_type")} disabled={isView}>
                    <MenuItem value="">-- Select --</MenuItem>
                    <MenuItem value="Regular">Regular</MenuItem>
                    <MenuItem value="Composition">Composition</MenuItem>
                    <MenuItem value="Unregistered">Unregistered</MenuItem>
                    <MenuItem value="SEZ">SEZ</MenuItem>
                    <MenuItem value="Deemed Export">Deemed Export</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField label="PAN No." size="small" fullWidth value={form.pan_no} onChange={handleChange("pan_no")} inputProps={{ maxLength: 10 }} disabled={isView} />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField label="MSME Registration No." size="small" fullWidth value={form.msme_reg_no} onChange={handleChange("msme_reg_no")} disabled={isView} />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField label="MSME Type" size="small" fullWidth select value={form.msme_type} onChange={handleChange("msme_type")} disabled={isView}>
                    <MenuItem value="">-- Select --</MenuItem>
                    <MenuItem value="Micro">Micro</MenuItem>
                    <MenuItem value="Small">Small</MenuItem>
                    <MenuItem value="Medium">Medium</MenuItem>
                  </TextField>
                </Grid>
              </Grid>
            </TabPanel>

            <TabPanel value={tab} index={3}>
              {!id ? (
                <Typography color="textSecondary">Save the party first to view ratings.</Typography>
              ) : (
                <>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: "var(--heading-color)" }}>
                    Rating Summary
                  </Typography>
                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    {[
                      { label: "Quality", key: "avg_quality" },
                      { label: "Delivery", key: "avg_delivery" },
                      { label: "Price", key: "avg_price" },
                      { label: "Service", key: "avg_service" },
                      { label: "Overall", key: "avg_overall" },
                    ].map(({ label, key }) => (
                      <Grid item xs={6} md={2.4} key={key}>
                        <ScoreCard label={label} value={ratingSummary?.[key] ? parseFloat(ratingSummary[key]).toFixed(1) : "—"} />
                      </Grid>
                    ))}
                    <Grid item xs={12} md={2.4}>
                      <Box sx={{ textAlign: "center", p: 2, bgcolor: "#eaf3ff", borderRadius: 2, border: "1px solid #c4d8f0" }}>
                        <Typography variant="h4" sx={{ fontWeight: 700, color: "var(--heading-color)" }}>{ratingSummary?.total_ratings || 0}</Typography>
                        <Typography variant="caption" color="textSecondary">Total Ratings</Typography>
                      </Box>
                    </Grid>
                  </Grid>

                  <Divider sx={{ my: 2 }} />

                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, color: "var(--heading-color)" }}>Recent Ratings</Typography>
                    {!isView && (
                      <Button size="small" variant="outlined" onClick={() => navigate(`/purchase/rating/add`)}>
                        Add Rating
                      </Button>
                    )}
                  </Box>

                  {ratings.length === 0 ? (
                    <Typography color="textSecondary" variant="body2">No ratings yet.</Typography>
                  ) : (
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                      {ratings.slice(0, 10).map((r) => (
                        <Box key={r.id} sx={{ display: "flex", alignItems: "center", gap: 2, p: 1.5, bgcolor: "#f8fafc", borderRadius: 2, border: "1px solid #e0e7ef" }}>
                          <Box sx={{ display: "flex", gap: 0.5 }}>
                            {[1, 2, 3, 4, 5].map((s) => (
                              <StarIcon key={s} fontSize="small" sx={{ color: s <= Math.round(r.overall_score || 0) ? "#f5a623" : "#ddd" }} />
                            ))}
                          </Box>
                          <Box><Typography variant="body2" sx={{ fontWeight: 600 }}>{r.overall_score}</Typography></Box>
                          <Chip label={`Q:${r.quality_score} D:${r.delivery_score} P:${r.price_score} S:${r.service_score}`} size="small" variant="outlined" />
                          <Typography variant="caption" color="textSecondary">{r.rating_date?.split("T")[0]}</Typography>
                          <Typography variant="caption" color="textSecondary">by {r.rated_by}</Typography>
                        </Box>
                      ))}
                    </Box>
                  )}
                </>
              )}
            </TabPanel>

            <TabPanel value={tab} index={4}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <TextField label="Payment Terms" size="small" fullWidth select value={form.payment_terms} onChange={handleChange("payment_terms")} disabled={isView}>
                    <MenuItem value="">-- Select --</MenuItem>
                    {PAYMENT_TERMS.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                  </TextField>
                </Grid>
              </Grid>
            </TabPanel>

            {!isView && (
              <Box sx={{ display: "flex", gap: 2, mt: 3, pt: 3, borderTop: "1px solid #e0e7ef" }}>
                <Button type="submit" variant="contained" startIcon={<SaveIcon />} disabled={saving} size="large">
                  {saving ? "Saving..." : `Save ${form.party_type}`}
                </Button>
                <Button variant="outlined" startIcon={<CancelIcon />} onClick={() => navigate("/purchase/vendors")} size="large">
                  Cancel
                </Button>
              </Box>
            )}
          </form>
        </CardContent>
      </Card>
    </Box>
  );
}
