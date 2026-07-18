import React, { useEffect, useState } from "react";
import {
  Box, Card, CardContent, Typography, TextField, Button, Grid,
  MenuItem, LinearProgress, Divider, IconButton
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import DeleteIcon from "@mui/icons-material/Delete";
import axios from "axios";
import { useToast } from "../../context/ToastContext";
import { useNavigate, useParams, useLocation } from "react-router-dom";

const API = "/api/erp/quality/inspections";

const INSPECTION_TYPES = ["Incoming", "In-Process", "Final"];
const STATUSES = ["Pending", "In Progress", "Passed", "Partial", "Rejected"];

export default function InspectionForm() {
  const { id } = useParams();
  const location = useLocation();
  const isView = location.pathname.includes("/view/");
  const isEdit = Boolean(id) && !isView;
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    inspection_type: "Incoming", inspection_date: new Date().toISOString().split("T")[0],
    item_code: "", item_name: "", supplier_name: "", batch_no: "",
    inspected_qty: 0, accepted_qty: 0, rejected_qty: 0,
    status: "Pending", inspector: "", result: "", remarks: "",
  });
  const [items, setItems] = useState([{ parameter: "", specification: "", method: "", observed_value: "", result: "N/A", remarks: "" }]);

  useEffect(() => {
    if (id) {
      setLoading(true);
      axios.get(`${API}/${id}`)
        .then(({ data }) => {
          setForm({
            inspection_type: data.inspection_type || "Incoming",
            inspection_date: data.inspection_date ? data.inspection_date.split("T")[0] : "",
            item_code: data.item_code || "", item_name: data.item_name || "",
            supplier_name: data.supplier_name || "", batch_no: data.batch_no || "",
            inspected_qty: data.inspected_qty || 0, accepted_qty: data.accepted_qty || 0, rejected_qty: data.rejected_qty || 0,
            status: data.status || "Pending", inspector: data.inspector || "",
            result: data.result || "", remarks: data.remarks || "",
          });
          if (data.items && data.items.length > 0) {
            setItems(data.items.map((i) => ({
              parameter: i.parameter || "", specification: i.specification || "",
              method: i.method || "", observed_value: i.observed_value || "",
              result: i.result || "N/A", remarks: i.remarks || "",
            })));
          }
        })
        .catch(() => showToast("Failed to load inspection", "error"))
        .finally(() => setLoading(false));
    }
  }, [id]);

  const handleChange = (f) => (e) => setForm((p) => ({ ...p, [f]: e.target.value }));
  const handleItemChange = (idx, field, value) => {
    setItems((prev) => { const u = [...prev]; u[idx] = { ...u[idx], [field]: value }; return u; });
  };
  const addItem = () => setItems((prev) => [...prev, { parameter: "", specification: "", method: "", observed_value: "", result: "N/A", remarks: "" }]);
  const removeItem = (idx) => setItems((prev) => prev.filter((_, i) => i !== idx));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (id && !isView) {
        await axios.put(`${API}/${id}`, { ...form, items });
        showToast("Inspection updated", "success");
      } else {
        await axios.post(API, { ...form, items });
        showToast("Inspection created", "success");
      }
      const typeRoute = { Incoming: "/quality/incoming", "In-Process": "/quality/process", Final: "/quality/final" }[form.inspection_type];
      navigate(typeRoute || "/quality/incoming");
    } catch (err) {
      showToast(err.response?.data?.error || "Failed to save", "error");
    } finally { setSaving(false); }
  };

  if (loading) return <LinearProgress />;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: "bold", color: "var(--heading-color)" }}>
        {isView ? "View Inspection" : isEdit ? "Edit Inspection" : "New Inspection"}
      </Typography>

      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card sx={{ borderRadius: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: "var(--heading-color)" }}>Inspection Details</Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField label="Inspection Type" select size="small" fullWidth value={form.inspection_type}
                      onChange={handleChange("inspection_type")} disabled={isView}>
                      {INSPECTION_TYPES.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                    </TextField>
                  </Grid>
                  <Grid item xs={6}>
                    <TextField label="Date" type="date" size="small" fullWidth value={form.inspection_date}
                      onChange={handleChange("inspection_date")} disabled={isView} InputLabelProps={{ shrink: true }} />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField label="Item Code" size="small" fullWidth value={form.item_code} onChange={handleChange("item_code")} disabled={isView} />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField label="Item Name" size="small" fullWidth value={form.item_name} onChange={handleChange("item_name")} disabled={isView} />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField label="Supplier" size="small" fullWidth value={form.supplier_name} onChange={handleChange("supplier_name")} disabled={isView} />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField label="Batch No" size="small" fullWidth value={form.batch_no} onChange={handleChange("batch_no")} disabled={isView} />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField label="Inspector" size="small" fullWidth value={form.inspector} onChange={handleChange("inspector")} disabled={isView} />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField label="Status" select size="small" fullWidth value={form.status} onChange={handleChange("status")} disabled={isView}>
                      {STATUSES.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                    </TextField>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card sx={{ borderRadius: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: "var(--heading-color)" }}>Quantities & Results</Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={4}>
                    <TextField label="Inspected Qty" type="number" size="small" fullWidth value={form.inspected_qty}
                      onChange={handleChange("inspected_qty")} disabled={isView} />
                  </Grid>
                  <Grid item xs={4}>
                    <TextField label="Accepted Qty" type="number" size="small" fullWidth value={form.accepted_qty}
                      onChange={handleChange("accepted_qty")} disabled={isView} />
                  </Grid>
                  <Grid item xs={4}>
                    <TextField label="Rejected Qty" type="number" size="small" fullWidth value={form.rejected_qty}
                      onChange={handleChange("rejected_qty")} disabled={isView} />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField label="Result / Findings" multiline rows={3} size="small" fullWidth value={form.result}
                      onChange={handleChange("result")} disabled={isView} />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField label="Remarks" multiline rows={2} size="small" fullWidth value={form.remarks}
                      onChange={handleChange("remarks")} disabled={isView} />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card sx={{ borderRadius: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: "var(--heading-color)" }}>Inspection Parameters</Typography>
                  {!isView && (
                    <Button size="small" startIcon={<AddCircleIcon />} onClick={addItem}>Add Parameter</Button>
                  )}
                </Box>
                <Divider sx={{ mb: 2 }} />
                <Box sx={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: ".875rem" }}>
                    <thead>
                      <tr style={{ background: "#f2f4f7", fontWeight: 700 }}>
                        <th style={{ padding: "8px 12px", textAlign: "left" }}>Parameter</th>
                        <th style={{ padding: "8px 12px", textAlign: "left" }}>Specification</th>
                        <th style={{ padding: "8px 12px", textAlign: "left" }}>Method</th>
                        <th style={{ padding: "8px 12px", textAlign: "left" }}>Observed Value</th>
                        <th style={{ padding: "8px 12px", textAlign: "center" }}>Result</th>
                        <th style={{ padding: "8px 12px", textAlign: "left" }}>Remarks</th>
                        {!isView && <th style={{ padding: "8px 12px", textAlign: "center" }}>Action</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item, idx) => (
                        <tr key={idx} style={{ borderTop: "1px solid #e0e0e0" }}>
                          <td style={{ padding: "6px 12px" }}>
                            <TextField size="small" fullWidth value={item.parameter}
                              onChange={(e) => handleItemChange(idx, "parameter", e.target.value)}
                              disabled={isView} placeholder="Parameter name" />
                          </td>
                          <td style={{ padding: "6px 12px" }}>
                            <TextField size="small" fullWidth value={item.specification}
                              onChange={(e) => handleItemChange(idx, "specification", e.target.value)} disabled={isView} />
                          </td>
                          <td style={{ padding: "6px 12px" }}>
                            <TextField size="small" fullWidth value={item.method}
                              onChange={(e) => handleItemChange(idx, "method", e.target.value)} disabled={isView} />
                          </td>
                          <td style={{ padding: "6px 12px" }}>
                            <TextField size="small" fullWidth value={item.observed_value}
                              onChange={(e) => handleItemChange(idx, "observed_value", e.target.value)} disabled={isView} />
                          </td>
                          <td style={{ padding: "6px 12px", textAlign: "center" }}>
                            <TextField select size="small" value={item.result}
                              onChange={(e) => handleItemChange(idx, "result", e.target.value)} disabled={isView} sx={{ minWidth: 80 }}>
                              <MenuItem value="Pass">Pass</MenuItem>
                              <MenuItem value="Fail">Fail</MenuItem>
                              <MenuItem value="N/A">N/A</MenuItem>
                            </TextField>
                          </td>
                          <td style={{ padding: "6px 12px" }}>
                            <TextField size="small" fullWidth value={item.remarks}
                              onChange={(e) => handleItemChange(idx, "remarks", e.target.value)} disabled={isView} />
                          </td>
                          {!isView && (
                            <td style={{ padding: "6px 12px", textAlign: "center" }}>
                              <IconButton size="small" color="error" onClick={() => removeItem(idx)} disabled={items.length === 1}>
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {!isView && (
            <Grid item xs={12}>
              <Box display="flex" gap={2}>
                <Button type="submit" variant="contained" startIcon={<SaveIcon />} disabled={saving} size="large">
                  {saving ? "Saving..." : id ? "Update Inspection" : "Create Inspection"}
                </Button>
                <Button variant="outlined" startIcon={<CancelIcon />} onClick={() => navigate("/quality/incoming")}>Cancel</Button>
              </Box>
            </Grid>
          )}
        </Grid>
      </form>
    </Box>
  );
}
