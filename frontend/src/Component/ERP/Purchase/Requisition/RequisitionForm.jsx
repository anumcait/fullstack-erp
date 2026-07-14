import React, { useEffect, useState } from "react";
import { Box, Card, CardContent, Typography, TextField, Button, Grid, MenuItem, IconButton, LinearProgress } from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import axios from "axios";
import { useToast } from "../../../../context/ToastContext";
import { useNavigate, useParams, useLocation } from "react-router-dom";

const API = "/api/erp/purchase/requisitions";

export default function RequisitionForm() {
  const { id } = useParams();
  const location = useLocation();
  const isView = location.pathname.includes("/view/");
  const isEdit = Boolean(id) && !isView;
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [header, setHeader] = useState({
    req_no: "", req_date: new Date().toISOString().split("T")[0],
    department: "", requested_by: "", indent_type: "Regular",
    priority: "Normal", notes: "",
  });
  const [items, setItems] = useState([{ item_name: "", quantity: "", remarks: "" }]);

  useEffect(() => {
    if (id) {
      setLoading(true);
      axios.get(`${API}/${id}`).then(({ data }) => {
        setHeader({
          req_no: data.req_no || "", req_date: data.req_date?.split("T")[0] || "",
          department: data.department || "", requested_by: data.requested_by || "",
          indent_type: data.indent_type || "Regular", priority: data.priority || "Normal",
          notes: data.notes || "",
        });
        if (data.items) setItems(data.items.map((it) => ({
          item_id: it.item_id, item_code: it.item_code,
          item_name: it.item_name, quantity: it.quantity, unit_id: it.unit_id,
          expected_date: it.expected_date?.split("T")[0] || "", remarks: it.remarks || "",
        })));
      }).catch(() => showToast("Failed to load requisition", "error"))
      .finally(() => setLoading(false));
    }
  }, [id]);

  const handleItemChange = (idx, field) => (e) => {
    const updated = [...items];
    updated[idx][field] = e.target.value;
    setItems(updated);
  };

  const addItem = () => setItems([...items, { item_name: "", quantity: "", remarks: "" }]);
  const removeItem = (idx) => { if (items.length > 1) setItems(items.filter((_, i) => i !== idx)); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!header.req_no || !header.req_date) { showToast("Req # and date are required", "warning"); return; }
    if (!items.some((i) => i.item_name && i.quantity)) { showToast("Add at least one item", "warning"); return; }
    setSaving(true);
    try {
      const payload = { ...header, items: items.map((i) => ({ ...i, quantity: parseFloat(i.quantity) || 0 })) };
      if (isEdit) { await axios.put(`${API}/${id}`, payload); showToast("Updated", "success"); }
      else { await axios.post(API, payload); showToast("Created", "success"); }
      navigate("/purchase/requisitions");
    } catch (err) { showToast(err.response?.data?.error || "Failed to save", "error"); }
    finally { setSaving(false); }
  };

  if (loading) return <LinearProgress />;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: "bold", color: "var(--heading-color)" }}>
        {isView ? "Requisition Details" : isEdit ? "Edit Requisition" : "New Purchase Requisition"}
      </Typography>
      <form onSubmit={handleSubmit}>
        <Card sx={{ borderRadius: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.08)", mb: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2, color: "var(--heading-color)", fontWeight: 600 }}>Header</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={3}>
                <TextField label="Req No *" size="small" fullWidth value={header.req_no}
                  onChange={(e) => setHeader({ ...header, req_no: e.target.value })} required disabled={isView} />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField label="Date *" type="date" size="small" fullWidth value={header.req_date}
                  onChange={(e) => setHeader({ ...header, req_date: e.target.value })} InputLabelProps={{ shrink: true }} required disabled={isView} />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField label="Department" size="small" fullWidth value={header.department}
                  onChange={(e) => setHeader({ ...header, department: e.target.value })} disabled={isView} />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField label="Requested By" size="small" fullWidth value={header.requested_by}
                  onChange={(e) => setHeader({ ...header, requested_by: e.target.value })} disabled={isView} />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField label="Indent Type" size="small" fullWidth select value={header.indent_type}
                  onChange={(e) => setHeader({ ...header, indent_type: e.target.value })} disabled={isView}>
                  <MenuItem value="Regular">Regular</MenuItem>
                  <MenuItem value="Emergency">Emergency</MenuItem>
                  <MenuItem value="Capital">Capital</MenuItem>
                  <MenuItem value="Service">Service</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField label="Priority" size="small" fullWidth select value={header.priority}
                  onChange={(e) => setHeader({ ...header, priority: e.target.value })} disabled={isView}>
                  <MenuItem value="Normal">Normal</MenuItem>
                  <MenuItem value="High">High</MenuItem>
                  <MenuItem value="Urgent">Urgent</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <TextField label="Notes" size="small" fullWidth multiline rows={2} value={header.notes}
                  onChange={(e) => setHeader({ ...header, notes: e.target.value })} disabled={isView} />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Card sx={{ borderRadius: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.08)", mb: 3 }}>
          <CardContent>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
              <Typography variant="h6" sx={{ color: "var(--heading-color)", fontWeight: 600 }}>Items</Typography>
              {!isView && <Button size="small" startIcon={<AddIcon />} onClick={addItem}>Add Item</Button>}
            </Box>
            {items.map((it, idx) => (
              <Grid container spacing={2} key={idx} sx={{ mb: 1.5, pb: 1.5, borderBottom: "1px solid #eee" }}>
                <Grid item xs={12} md={4}>
                  <TextField label="Item Name *" size="small" fullWidth value={it.item_name}
                    onChange={handleItemChange(idx, "item_name")} required disabled={isView} />
                </Grid>
                <Grid item xs={6} md={2}>
                  <TextField label="Qty *" type="number" size="small" fullWidth value={it.quantity}
                    onChange={handleItemChange(idx, "quantity")} required disabled={isView} />
                </Grid>
                <Grid item xs={6} md={2}>
                  <TextField label="Expected Date" type="date" size="small" fullWidth value={it.expected_date}
                    onChange={handleItemChange(idx, "expected_date")} InputLabelProps={{ shrink: true }} disabled={isView} />
                </Grid>
                <Grid item xs={10} md={3}>
                  <TextField label="Remarks" size="small" fullWidth value={it.remarks}
                    onChange={handleItemChange(idx, "remarks")} disabled={isView} />
                </Grid>
                {!isView && (
                  <Grid item xs={2} md={1} sx={{ display: "flex", alignItems: "center" }}>
                    <IconButton size="small" color="error" onClick={() => removeItem(idx)} disabled={items.length <= 1}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Grid>
                )}
              </Grid>
            ))}
          </CardContent>
        </Card>

        {!isView && (
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button type="submit" variant="contained" startIcon={<SaveIcon />} disabled={saving} size="large">
              {saving ? "Saving..." : "Save Requisition"}
            </Button>
            <Button variant="outlined" startIcon={<CancelIcon />} onClick={() => navigate("/purchase/requisitions")} size="large">Cancel</Button>
          </Box>
        )}
      </form>
    </Box>
  );
}
