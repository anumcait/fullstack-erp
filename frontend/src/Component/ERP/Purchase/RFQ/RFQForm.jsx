import React, { useEffect, useState } from "react";
import { Box, Card, CardContent, Typography, TextField, Button, Grid, MenuItem, IconButton, LinearProgress, Chip } from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import axios from "axios";
import { useToast } from "../../../../context/ToastContext";
import CountedTextArea from "../../../Common/CountedTextArea";
import { useNavigate, useParams, useLocation } from "react-router-dom";

const API = "/api/erp/purchase/rfq";
const SUPPLIER_API = "/api/erp/purchase/suppliers";

export default function RFQForm() {
  const { id } = useParams();
  const location = useLocation();
  const isView = location.pathname.includes("/view/");
  const isEdit = Boolean(id) && !isView;
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [suppliers, setSuppliers] = useState([]);
  const [header, setHeader] = useState({
    rfq_no: "", rfq_date: new Date().toISOString().split("T")[0],
    subject: "", status: "Open", closing_date: "", remarks: "",
  });
  const [items, setItems] = useState([{ item_name: "", quantity: "", gst_rate: "" }]);
  const [vendors, setVendors] = useState([{ supplier_id: "" }]);

  useEffect(() => {
    axios.get(SUPPLIER_API, { params: { is_active: true } }).then(({ data }) => setSuppliers(data)).catch(() => {});
    if (id) {
      setLoading(true);
      axios.get(`${API}/${id}`).then(({ data }) => {
        setHeader({
          rfq_no: data.rfq_no || "", rfq_date: data.rfq_date?.split("T")[0] || "",
          subject: data.subject || "", status: data.status || "Open",
          closing_date: data.closing_date?.split("T")[0] || "", remarks: data.remarks || "",
        });
        if (data.items) setItems(data.items.map((it) => ({ item_id: it.item_id, item_code: it.item_code, item_name: it.item_name, quantity: it.quantity, unit_id: it.unit_id, gst_rate: it.gst_rate || "" })));
        if (data.vendors) setVendors(data.vendors.map((v) => ({ rfq_vendor_id: v.id, supplier_id: v.supplier_id, quoted_amount: v.quoted_amount, gst_rate: v.gst_rate, gst_amount: v.gst_amount, total_amount: v.total_amount, delivery_days: v.delivery_days, is_selected: v.is_selected })));
      }).catch(() => showToast("Failed to load RFQ", "error")).finally(() => setLoading(false));
    }
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!header.rfq_no) { showToast("RFQ # is required", "warning"); return; }
    setSaving(true);
    try {
      const payload = {
        ...header,
        items: items.map((i) => ({ ...i, quantity: parseFloat(i.quantity) || 0, gst_rate: parseFloat(i.gst_rate) || 0 })),
        vendors: vendors.filter((v) => v.supplier_id).map((v) => ({ supplier_id: parseInt(v.supplier_id), quoted_amount: parseFloat(v.quoted_amount) || 0, gst_rate: parseFloat(v.gst_rate) || 0, gst_amount: parseFloat(v.gst_amount) || 0, total_amount: parseFloat(v.total_amount) || 0, delivery_days: parseInt(v.delivery_days) || 0 })),
      };
      if (isEdit) { await axios.put(`${API}/${id}`, payload); showToast("Updated", "success"); }
      else { await axios.post(API, payload); showToast("Created", "success"); }
      navigate("/purchase/rfq");
    } catch (err) { showToast(err.response?.data?.error || "Failed", "error"); }
    finally { setSaving(false); }
  };

  if (loading) return <LinearProgress />;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: "bold", color: "var(--heading-color)" }}>
        {isView ? "RFQ Details" : isEdit ? "Edit RFQ" : "New RFQ / Enquiry"}
      </Typography>
      <form onSubmit={handleSubmit}>
        <Card sx={{ borderRadius: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.08)", mb: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2, color: "var(--heading-color)", fontWeight: 600 }}>Header</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={3}><TextField label="RFQ No *" size="small" fullWidth value={header.rfq_no} onChange={(e) => setHeader({ ...header, rfq_no: e.target.value })} required disabled={isView} /></Grid>
              <Grid item xs={12} md={3}><TextField label="Date *" type="date" size="small" fullWidth value={header.rfq_date} onChange={(e) => setHeader({ ...header, rfq_date: e.target.value })} InputLabelProps={{ shrink: true }} required disabled={isView} /></Grid>
              <Grid item xs={12} md={3}>
                <TextField label="Status" select size="small" fullWidth value={header.status} onChange={(e) => setHeader({ ...header, status: e.target.value })} disabled={isView}>
                  <MenuItem value="Open">Open</MenuItem>
                  <MenuItem value="Closed">Closed</MenuItem>
                  <MenuItem value="Cancelled">Cancelled</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} md={3}><TextField label="Closing Date" type="date" size="small" fullWidth value={header.closing_date} onChange={(e) => setHeader({ ...header, closing_date: e.target.value })} InputLabelProps={{ shrink: true }} disabled={isView} /></Grid>
              <Grid item xs={12}><TextField label="Subject" size="small" fullWidth value={header.subject} onChange={(e) => setHeader({ ...header, subject: e.target.value })} disabled={isView} /></Grid>
              <Grid item xs={12}><CountedTextArea label="Remarks" size="small" fullWidth rows={2} value={header.remarks} onChange={(e) => setHeader({ ...header, remarks: e.target.value })} disabled={isView} /></Grid>
            </Grid>
          </CardContent>
        </Card>

        <Card sx={{ borderRadius: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.08)", mb: 3 }}>
          <CardContent>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
              <Typography variant="h6" sx={{ color: "var(--heading-color)", fontWeight: 600 }}>Items</Typography>
              {!isView && <Button size="small" startIcon={<AddIcon />} onClick={() => setItems([...items, { item_name: "", quantity: "" }])}>Add Item</Button>}
            </Box>
            {items.map((it, idx) => (
              <Grid container spacing={1} key={idx} sx={{ mb: 1, pb: 1, borderBottom: "1px solid #eee", alignItems: "center" }}>
                <Grid item xs={4}><TextField label="Item Name" size="small" fullWidth value={it.item_name} onChange={(e) => { const u = [...items]; u[idx].item_name = e.target.value; setItems(u); }} disabled={isView} /></Grid>
                <Grid item xs={2}><TextField label="Qty" type="number" size="small" fullWidth value={it.quantity} onChange={(e) => { const u = [...items]; u[idx].quantity = e.target.value; setItems(u); }} disabled={isView} /></Grid>
                <Grid item xs={2}><TextField label="GST %" type="number" size="small" fullWidth value={it.gst_rate} onChange={(e) => { const u = [...items]; u[idx].gst_rate = e.target.value; setItems(u); }} disabled={isView} /></Grid>
                {!isView && <Grid item xs={1}><IconButton size="small" color="error" onClick={() => { if (items.length > 1) setItems(items.filter((_, i) => i !== idx)); }}><DeleteIcon /></IconButton></Grid>}
              </Grid>
            ))}
          </CardContent>
        </Card>

        <Card sx={{ borderRadius: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.08)", mb: 3 }}>
          <CardContent>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
              <Typography variant="h6" sx={{ color: "var(--heading-color)", fontWeight: 600 }}>Vendors</Typography>
              {!isView && <Button size="small" startIcon={<AddIcon />} onClick={() => setVendors([...vendors, { supplier_id: "" }])}>Add Vendor</Button>}
            </Box>
            {vendors.map((v, idx) => (
              <Grid container spacing={1} key={idx} sx={{ mb: 1, pb: 1, borderBottom: "1px solid #eee", alignItems: "center" }}>
                <Grid item xs={3}>
                  <TextField label="Supplier" select size="small" fullWidth value={v.supplier_id} onChange={(e) => { const u = [...vendors]; u[idx].supplier_id = e.target.value; setVendors(u); }} disabled={isView}>
                    <MenuItem value="">-- Select --</MenuItem>
                    {suppliers.map((s) => <MenuItem key={s.id} value={s.id}>{s.supplier_name}</MenuItem>)}
                  </TextField>
                </Grid>
                {isView && (
                  <>
                    <Grid item xs={1.5}><TextField label="Quote" size="small" fullWidth value={v.quoted_amount || ""} InputProps={{ readOnly: true }} /></Grid>
                    <Grid item xs={1}><TextField label="GST %" size="small" fullWidth value={v.gst_rate || ""} InputProps={{ readOnly: true }} /></Grid>
                    <Grid item xs={1.5}><TextField label="GST Amt" size="small" fullWidth value={v.gst_amount || ""} InputProps={{ readOnly: true }} /></Grid>
                    <Grid item xs={1.5}><TextField label="Total" size="small" fullWidth value={v.total_amount || ""} InputProps={{ readOnly: true }} /></Grid>
                    <Grid item xs={1.5}><TextField label="Delivery (days)" size="small" fullWidth value={v.delivery_days || ""} InputProps={{ readOnly: true }} /></Grid>
                    <Grid item xs={1}>{v.is_selected && <Chip label="Selected" color="success" size="small" />}</Grid>
                  </>
                )}
                {!isView && (
                  <>
                    <Grid item xs={1.5}><TextField label="Quote" type="number" size="small" fullWidth value={v.quoted_amount || ""} onChange={(e) => { const u = [...vendors]; u[idx].quoted_amount = e.target.value; setVendors(u); }} /></Grid>
                    <Grid item xs={1}><TextField label="GST %" type="number" size="small" fullWidth value={v.gst_rate || ""} onChange={(e) => { const u = [...vendors]; u[idx].gst_rate = e.target.value; setVendors(u); }} /></Grid>
                    <Grid item xs={1.5}><TextField label="GST Amt" type="number" size="small" fullWidth value={v.gst_amount || ""} onChange={(e) => { const u = [...vendors]; u[idx].gst_amount = e.target.value; setVendors(u); }} /></Grid>
                    <Grid item xs={1.5}><TextField label="Total" type="number" size="small" fullWidth value={v.total_amount || ""} onChange={(e) => { const u = [...vendors]; u[idx].total_amount = e.target.value; setVendors(u); }} /></Grid>
                    <Grid item xs={1.5}><TextField label="Delivery (days)" type="number" size="small" fullWidth value={v.delivery_days || ""} onChange={(e) => { const u = [...vendors]; u[idx].delivery_days = e.target.value; setVendors(u); }} /></Grid>
                    <Grid item xs={1}><IconButton size="small" color="error" onClick={() => setVendors(vendors.filter((_, i) => i !== idx))}><DeleteIcon /></IconButton></Grid>
                  </>
                )}
              </Grid>
            ))}
          </CardContent>
        </Card>

        {!isView && (
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button type="submit" variant="contained" startIcon={<SaveIcon />} disabled={saving} size="large">{saving ? "Saving..." : "Save RFQ"}</Button>
            <Button variant="outlined" startIcon={<CancelIcon />} onClick={() => navigate("/purchase/rfq")} size="large">Cancel</Button>
          </Box>
        )}
      </form>
    </Box>
  );
}
