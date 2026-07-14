import React, { useEffect, useState } from "react";
import {
  Box, Card, CardContent, Typography, TextField, Button, Grid,
  MenuItem, LinearProgress, Alert
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import axios from "axios";
import { useToast } from "../../../../context/ToastContext";
import { useNavigate, useParams } from "react-router-dom";

const CATEGORIES_API = "/api/erp/stores/categories";
const UNITS_API = "/api/erp/stores/units";
const ITEMS_API = "/api/erp/stores/items";

export default function AddItem() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    item_code: "",
    item_name: "",
    item_description: "",
    category_id: "",
    unit_id: "",
    opening_stock: 0,
    min_stock: 0,
    max_stock: 0,
    reorder_level: 0,
    rate: 0,
    gst_rate: 0,
    hsn_code: "",
  });

  useEffect(() => {
    const loadMasterData = async () => {
      try {
        const [catRes, unitRes] = await Promise.all([
          axios.get(CATEGORIES_API),
          axios.get(UNITS_API),
        ]);
        setCategories(catRes.data);
        setUnits(unitRes.data);
      } catch (err) {
        showToast("Failed to load master data", "error");
      }
    };
    loadMasterData();
  }, []);

  useEffect(() => {
    if (isEdit) {
      setLoading(true);
      axios.get(`${ITEMS_API}/${id}`)
        .then(({ data }) => {
          setForm({
            item_code: data.item_code || "",
            item_name: data.item_name || "",
            item_description: data.item_description || "",
            category_id: data.category_id || "",
            unit_id: data.unit_id || "",
            opening_stock: data.opening_stock || 0,
            min_stock: data.min_stock || 0,
            max_stock: data.max_stock || 0,
            reorder_level: data.reorder_level || 0,
            rate: data.rate || 0,
            gst_rate: data.gst_rate || 0,
            hsn_code: data.hsn_code || "",
          });
        })
        .catch(() => showToast("Failed to load item", "error"))
        .finally(() => setLoading(false));
    }
  }, [id, isEdit]);

  const handleChange = (field) => (e) => {
    const value = e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.item_code || !form.item_name) {
      showToast("Item code and name are required", "warning");
      return;
    }
    setSaving(true);
    try {
      if (isEdit) {
        await axios.put(`${ITEMS_API}/${id}`, form);
        showToast("Item updated", "success");
      } else {
        await axios.post(ITEMS_API, form);
        showToast("Item created", "success");
      }
      navigate("/stores/item-master");
    } catch (err) {
      showToast(err.response?.data?.error || "Failed to save item", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LinearProgress />;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: "bold", color: "var(--heading-color)" }}>
        {isEdit ? "Edit Item" : "Add New Item"}
      </Typography>

      <Card sx={{ borderRadius: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Item Code *"
                  size="small"
                  fullWidth
                  value={form.item_code}
                  onChange={handleChange("item_code")}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Item Name *"
                  size="small"
                  fullWidth
                  value={form.item_name}
                  onChange={handleChange("item_name")}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Description"
                  size="small"
                  fullWidth
                  multiline
                  rows={2}
                  value={form.item_description}
                  onChange={handleChange("item_description")}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  label="Category"
                  size="small"
                  fullWidth
                  select
                  value={form.category_id}
                  onChange={handleChange("category_id")}
                >
                  <MenuItem value="">-- Select --</MenuItem>
                  {categories.map((cat) => (
                    <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  label="Unit"
                  size="small"
                  fullWidth
                  select
                  value={form.unit_id}
                  onChange={handleChange("unit_id")}
                >
                  <MenuItem value="">-- Select --</MenuItem>
                  {units.map((u) => (
                    <MenuItem key={u.id} value={u.id}>{u.name} ({u.short_name})</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  label="HSN Code"
                  size="small"
                  fullWidth
                  value={form.hsn_code}
                  onChange={handleChange("hsn_code")}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  label="Opening Stock"
                  size="small"
                  fullWidth
                  type="number"
                  value={form.opening_stock}
                  onChange={handleChange("opening_stock")}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  label="Min Stock"
                  size="small"
                  fullWidth
                  type="number"
                  value={form.min_stock}
                  onChange={handleChange("min_stock")}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  label="Max Stock"
                  size="small"
                  fullWidth
                  type="number"
                  value={form.max_stock}
                  onChange={handleChange("max_stock")}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  label="Reorder Level"
                  size="small"
                  fullWidth
                  type="number"
                  value={form.reorder_level}
                  onChange={handleChange("reorder_level")}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  label="Rate"
                  size="small"
                  fullWidth
                  type="number"
                  value={form.rate}
                  onChange={handleChange("rate")}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  label="GST %"
                  size="small"
                  fullWidth
                  type="number"
                  value={form.gst_rate}
                  onChange={handleChange("gst_rate")}
                />
              </Grid>
            </Grid>

            <Box sx={{ mt: 3, display: "flex", gap: 2 }}>
              <Button
                type="submit"
                variant="contained"
                startIcon={<SaveIcon />}
                disabled={saving}
              >
                {saving ? "Saving..." : "Save"}
              </Button>
              <Button
                variant="outlined"
                startIcon={<CancelIcon />}
                onClick={() => navigate("/stores/item-master")}
              >
                Cancel
              </Button>
            </Box>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
}
