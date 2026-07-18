import React, { useEffect, useState } from "react";
import {
  Box, Card, CardContent, Typography, TextField, Button, Grid,
  MenuItem, LinearProgress, Divider, IconButton,
  Table, TableHead, TableBody, TableRow, TableCell
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import DeleteIcon from "@mui/icons-material/Delete";
import axios from "axios";
import { useToast } from "../../../../context/ToastContext";
import { useNavigate, useParams, useLocation } from "react-router-dom";

const API = "/api/erp/marketing/orders";
const CUST_API = "/api/erp/marketing/customers";

const STATUSES = ["Draft", "Confirmed", "Processing", "Shipped", "Delivered", "Cancelled"];
const TAX_TYPES = ["None", "GST 5%", "GST 12%", "GST 18%", "GST 28%"];

export default function SalesOrderForm() {
  const { id } = useParams();
  const location = useLocation();
  const isView = location.pathname.includes("/view/");
  const isEdit = Boolean(id) && !isView;
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [form, setForm] = useState({
    order_no: "", customer_id: "", order_date: new Date().toISOString().split("T")[0],
    delivery_date: "", status: "Draft", tax_type: "GST 18%",
    notes: "", shipping_address: "",
  });
  const [items, setItems] = useState([{ description: "", qty: 1, rate: 0, amount: 0 }]);

  useEffect(() => {
    axios.get(CUST_API, { params: { is_active: true } }).then(({ data }) => setCustomers(data || [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (id) {
      setLoading(true);
      axios.get(`${API}/${id}`)
        .then(({ data }) => {
          setForm({
            order_no: data.order_no || "", customer_id: data.customer_id || "",
            order_date: data.order_date ? data.order_date.split("T")[0] : "",
            delivery_date: data.delivery_date ? data.delivery_date.split("T")[0] : "",
            status: data.status || "Draft", tax_type: data.tax_type || "GST 18%",
            notes: data.notes || "", shipping_address: data.shipping_address || "",
          });
          if (data.items && data.items.length > 0) {
            setItems(data.items.map((i) => ({
              id: i.id, description: i.description || i.item_name || "",
              qty: i.qty || i.quantity || 1, rate: i.rate || 0, amount: i.amount || 0,
            })));
          }
        })
        .catch(() => showToast("Failed to load order", "error"))
        .finally(() => setLoading(false));
    }
  }, [id]);

  const handleChange = (f) => (e) => setForm((p) => ({ ...p, [f]: e.target.value }));

  const handleItemChange = (idx, field, value) => {
    setItems((prev) => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], [field]: value };
      if (field === "qty" || field === "rate") {
        updated[idx].amount = (parseFloat(updated[idx].qty) || 0) * (parseFloat(updated[idx].rate) || 0);
      }
      return updated;
    });
  };

  const addItem = () => setItems((prev) => [...prev, { description: "", qty: 1, rate: 0, amount: 0 }]);
  const removeItem = (idx) => setItems((prev) => prev.filter((_, i) => i !== idx));
  const calcTotal = () => items.reduce((sum, i) => sum + (i.amount || 0), 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.customer_id) { showToast("Please select a customer", "warning"); return; }
    if (items.length === 0 || !items[0].description) { showToast("Add at least one item", "warning"); return; }
    setSaving(true);
    const payload = { ...form, items: items.map(({ id, ...rest }) => ({ ...rest, quantity: rest.qty })) };
    try {
      if (id && !isView) {
        await axios.put(`${API}/${id}`, payload);
        showToast("Order updated", "success");
      } else {
        await axios.post(API, payload);
        showToast("Order created", "success");
      }
      navigate("/marketing/orders");
    } catch (err) {
      showToast(err.response?.data?.error || "Failed to save", "error");
    } finally { setSaving(false); }
  };

  if (loading) return <LinearProgress />;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: "bold", color: "var(--heading-color)" }}>
        {isView ? "View Sales Order" : isEdit ? "Edit Sales Order" : "New Sales Order"}
      </Typography>

      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card sx={{ borderRadius: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: "var(--heading-color)" }}>Order Info</Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField label="Order #" size="small" fullWidth value={form.order_no} onChange={handleChange("order_no")} disabled={isView} />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField label="Customer" select size="small" fullWidth value={form.customer_id}
                      onChange={handleChange("customer_id")} disabled={isView} required>
                      <MenuItem value="">Select Customer</MenuItem>
                      {customers.map((c) => <MenuItem key={c.id} value={c.id}>{c.customer_name}</MenuItem>)}
                    </TextField>
                  </Grid>
                  <Grid item xs={6}>
                    <TextField label="Order Date" type="date" size="small" fullWidth value={form.order_date}
                      onChange={handleChange("order_date")} disabled={isView} InputLabelProps={{ shrink: true }} />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField label="Delivery Date" type="date" size="small" fullWidth value={form.delivery_date}
                      onChange={handleChange("delivery_date")} disabled={isView} InputLabelProps={{ shrink: true }} />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField label="Status" select size="small" fullWidth value={form.status} onChange={handleChange("status")} disabled={isView}>
                      {STATUSES.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                    </TextField>
                  </Grid>
                  <Grid item xs={6}>
                    <TextField label="Tax Type" select size="small" fullWidth value={form.tax_type} onChange={handleChange("tax_type")} disabled={isView}>
                      {TAX_TYPES.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                    </TextField>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card sx={{ borderRadius: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: "var(--heading-color)" }}>Shipping & Notes</Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField label="Shipping Address" multiline rows={3} size="small" fullWidth value={form.shipping_address}
                      onChange={handleChange("shipping_address")} disabled={isView} />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField label="Notes" multiline rows={3} size="small" fullWidth value={form.notes}
                      onChange={handleChange("notes")} disabled={isView} />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card sx={{ borderRadius: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: "var(--heading-color)" }}>Order Items</Typography>
                  {!isView && (
                    <Button size="small" startIcon={<AddCircleIcon />} onClick={addItem}>Add Item</Button>
                  )}
                </Box>
                <Divider sx={{ mb: 2 }} />
                <Table size="small" sx={{ "& th": { fontWeight: 700, bgcolor: "#f2f4f7" } }}>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ width: "40%" }}>Description</TableCell>
                      <TableCell sx={{ width: "15%" }} align="right">Qty</TableCell>
                      <TableCell sx={{ width: "17%" }} align="right">Rate</TableCell>
                      <TableCell sx={{ width: "18%" }} align="right">Amount</TableCell>
                      {!isView && <TableCell sx={{ width: "10%" }} align="center">Action</TableCell>}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {items.map((item, idx) => (
                      <TableRow key={idx}>
                        <TableCell>
                          <TextField size="small" fullWidth value={item.description}
                            onChange={(e) => handleItemChange(idx, "description", e.target.value)}
                            disabled={isView} placeholder="Item description" />
                        </TableCell>
                        <TableCell>
                          <TextField type="number" size="small" fullWidth value={item.qty}
                            onChange={(e) => handleItemChange(idx, "qty", Math.max(0, parseFloat(e.target.value) || 0))}
                            disabled={isView} inputProps={{ min: 0 }} />
                        </TableCell>
                        <TableCell>
                          <TextField type="number" size="small" fullWidth value={item.rate}
                            onChange={(e) => handleItemChange(idx, "rate", Math.max(0, parseFloat(e.target.value) || 0))}
                            disabled={isView} inputProps={{ min: 0, step: 0.01 }} />
                        </TableCell>
                        <TableCell align="right">
                          <Typography sx={{ fontWeight: 600 }}>{(item.amount || 0).toLocaleString("en-IN", { style: "currency", currency: "INR" })}</Typography>
                        </TableCell>
                        {!isView && (
                          <TableCell align="center">
                            <IconButton size="small" color="error" onClick={() => removeItem(idx)} disabled={items.length === 1}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell colSpan={3} align="right" sx={{ fontWeight: 700, borderBottom: "none" }}>Total</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, fontSize: "1rem", borderBottom: "none" }}>
                        {(calcTotal()).toLocaleString("en-IN", { style: "currency", currency: "INR" })}
                      </TableCell>
                      {!isView && <TableCell />}
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </Grid>

          {!isView && (
            <Grid item xs={12}>
              <Box display="flex" gap={2}>
                <Button type="submit" variant="contained" startIcon={<SaveIcon />} disabled={saving} size="large">
                  {saving ? "Saving..." : id ? "Update Order" : "Create Order"}
                </Button>
                <Button variant="outlined" startIcon={<CancelIcon />} onClick={() => navigate("/marketing/orders")}>Cancel</Button>
              </Box>
            </Grid>
          )}
        </Grid>
      </form>
    </Box>
  );
}
