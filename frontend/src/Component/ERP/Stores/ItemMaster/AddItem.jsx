import React, { useEffect, useState } from "react";
import {
  Box, Grid, Tabs, Tab, TextField, Button, MenuItem, LinearProgress,
  IconButton, Checkbox, FormControlLabel, Switch, Divider, Typography,
  Dialog, DialogTitle, DialogContent, DialogActions, InputAdornment
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import axios from "axios";
import { useToast } from "../../../../context/ToastContext";
import { useNavigate, useParams } from "react-router-dom";
import ItemSelectDialog from "./ItemSelectDialog";
import CountedTextArea from "../../../Common/CountedTextArea";
import "./EditItem.css";

const CATEGORIES_API = "/api/erp/stores/categories";
const UNITS_API = "/api/erp/stores/units";
const ITEMTYPES_API = "/api/erp/stores/item-types";
const ITEMS_API = "/api/erp/stores/items";
const NEXT_CODE_API = "/api/erp/stores/items/next-code";

const TAB_LABELS = [
  "Item Details", "Adv. Config", "Alt. Units", "Inv. Control",
  "Tax Details", "Price List", "Attr", "Attachments",
  "E-commerce", "Barcode Details"
];

const VALUATION_METHODS = ["FIFO", "Weighted Average", "Moving Average"];
const ABC_CLASSES = ["A", "B", "C"];
const BARCODE_TYPES = ["EAN-13", "UPC-A", "CODE128", "QR"];

const emptyEcom = { short_desc: "", seo_title: "", meta_keywords: "", status: "Disabled", featured: false };

// Hoisted (module scope) so they are NOT re-created on every render.
// Defining these inside the component caused React to remount the subtree
// on each keystroke, which made the input lose focus (cursor "jumping").
const Field = ({ label, children }) => (
  <div className="form-row">
    <label>{label}</label>
    <div style={{ flex: 1 }}>{children}</div>
  </div>
);

const NumField = ({ label, value, onChange, step }) => (
  <Field label={label}>
    <TextField size="small" fullWidth type="number" value={value} onChange={onChange} inputProps={{ step: step || 1 }} />
  </Field>
);

// Reusable classification picker: a read-only display field with a small
// "Add" button and a magnifier inside the box on the right (HR ItemEdit style).
// Selection happens in a separate dialog list, not a dropdown.
const LookupField = ({ display, onAdd, onLookup, placeholder }) => (
  <TextField
    size="small"
    fullWidth
    placeholder={placeholder}
    value={display || ""}
    InputProps={{
      readOnly: true,
      endAdornment: (
        <InputAdornment position="end">
          <IconButton
            size="small"
            type="button"
            onClick={(e) => { e.stopPropagation(); onLookup(); }}
            title="Search"
            sx={{ mr: 0.5 }}
          >
            <SearchIcon fontSize="small" />
          </IconButton>
          <Button
            size="small"
            type="button"
            variant="contained"
            color="primary"
            onClick={(e) => { e.stopPropagation(); onAdd(); }}
            sx={{
              whiteSpace: "nowrap",
              boxShadow: "none",
              "&:hover": { boxShadow: "none" },
              px: 1,
              py: 0.25,
              fontSize: "0.75rem",
              minWidth: 0,
            }}
          >
            Add
          </Button>
        </InputAdornment>
      ),
    }}
    onClick={onLookup}
    sx={{ cursor: "pointer", bgcolor: "#fff" }}
  />
);

const BannerPicker = ({ label, display, onAdd, onLookup }) => (
  <div className="banner-picker">
    <label>{label}</label>
    <LookupField display={display} onAdd={onAdd} onLookup={onLookup} placeholder={`Select ${label}`} />
  </div>
);

export default function AddItem() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [tabIndex, setTabIndex] = useState(0);
  const [addOpen, setAddOpen] = useState(null);
  const [addForm, setAddForm] = useState({ name: "", description: "", short_name: "", parent_id: "", code: "" });
  const [addSaving, setAddSaving] = useState(false);
  const [lookup, setLookup] = useState(null);
  const [categories, setCategories] = useState([]);
  const [subgroups, setSubgroups] = useState([]);
  const [subtypes, setSubtypes] = useState([]);
  const [units, setUnits] = useState([]);
  const [itemTypes, setItemTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    item_code: "",
    item_name: "",
    item_description: "",
    category_id: "",
    subgroup_id: "",
    subtype_id: "",
    type_id: "",
    unit_id: "",
    criticality: "",
    brand: "",
    stock_category: "",
    valuation_method: "FIFO",
    lead_time_days: 0,
    min_order_qty: 0,
    reorder_qty: 0,
    standard_cost: 0,
    abc_class: "A",
    default_location: "",
    track_serial: false,
    track_batch: false,
    opening_stock: 0,
    min_stock: 0,
    max_stock: 0,
    reorder_level: 0,
    hsn_code: "",
    gst_rate: 0,
    rate: 0,
    mrp: 0,
    purchase_price: 0,
    discount_percent: 0,
    barcode: "",
    barcode_type: "CODE128",
    alt_units: [],
    attributes: [],
    attachments: [],
    ecommerce: { ...emptyEcom },
  });

  useEffect(() => {
    const loadMasterData = async () => {
      try {
        const [catRes, subRes, subTypeRes, unitRes, typeRes] = await Promise.all([
          axios.get(CATEGORIES_API),
          axios.get("/api/erp/stores/subgroups"),
          axios.get("/api/erp/stores/subtypes"),
          axios.get(UNITS_API),
          axios.get(ITEMTYPES_API),
        ]);
        setCategories(catRes.data);
        setSubgroups(subRes.data);
        setSubtypes(subTypeRes.data);
        setUnits(unitRes.data);
        setItemTypes(typeRes.data);
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
            category_id: data.category?.id || "",
            subgroup_id: data.subGroup?.id || "",
            subtype_id: data.subType?.id || "",
            type_id: data.type?.id || "",
            unit_id: data.unit_id || "",
            criticality: data.criticality || "",
            brand: data.brand || "",
            stock_category: data.stock_category || "",
            valuation_method: data.valuation_method || "FIFO",
            lead_time_days: data.lead_time_days || 0,
            min_order_qty: data.min_order_qty || 0,
            reorder_qty: data.reorder_qty || 0,
            standard_cost: data.standard_cost || 0,
            abc_class: data.abc_class || "A",
            default_location: data.default_location || "",
            track_serial: Boolean(data.track_serial),
            track_batch: Boolean(data.track_batch),
            opening_stock: data.opening_stock || 0,
            min_stock: data.min_stock || 0,
            max_stock: data.max_stock || 0,
            reorder_level: data.reorder_level || 0,
            hsn_code: data.hsn_code || "",
            gst_rate: data.gst_rate || 0,
            rate: data.rate || 0,
            mrp: data.mrp || 0,
            purchase_price: data.purchase_price || 0,
            discount_percent: data.discount_percent || 0,
            barcode: data.barcode || "",
            barcode_type: data.barcode_type || "CODE128",
            alt_units: Array.isArray(data.alt_units) ? data.alt_units : [],
            attributes: Array.isArray(data.attributes) ? data.attributes : [],
            attachments: Array.isArray(data.attachments) ? data.attachments : [],
            ecommerce: { ...emptyEcom, ...(data.ecommerce || {}) },
          });
        })
        .catch(() => showToast("Failed to load item", "error"))
        .finally(() => setLoading(false));
    }
  }, [id, isEdit]);

  const setField = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));
  const handleChange = (field) => (e) => setField(field, e.target.value);
  const categoryLabel = (c) => (c.parent ? `${c.parent.name} / ${c.name}` : c.name);

  const applyAutoCode = async (groupId, subgroupId) => {
    if (isEdit) return;
    const grp = groupId || form.category_id || "";
    const sub = subgroupId || form.subgroup_id || "";
    if (!grp && !sub) return;
    try {
      const qs = `group_id=${grp}${sub ? `&subgroup_id=${sub}` : ""}`;
      const { data } = await axios.get(`${NEXT_CODE_API}?${qs}`);
      if (data.next_code) setField("item_code", data.next_code);
    } catch (_) { /* non-blocking */ }
  };

  const typeDisplay = itemTypes.find((t) => String(t.id) === String(form.type_id))?.name || "";
  const groupDisplay = (() => {
    const c = categories.find((x) => String(x.id) === String(form.category_id));
    return c ? categoryLabel(c) : "";
  })();
  const unitDisplay = units.find((u) => String(u.id) === String(form.unit_id))?.name || "";
  const subgroupDisplay = subgroups.find((s) => String(s.id) === String(form.subgroup_id))?.name || "";
  const sectionDisplay = subtypes.find((s) => String(s.id) === String(form.subtype_id))?.name || "";

  const groupOptions = categories;
  const subGroupOptions = subgroups.filter((s) => !form.category_id || String(s.group_id) === String(form.category_id));
  const typeOptions = itemTypes.filter((t) => !form.subgroup_id || String(t.subgroup_id) === String(form.subgroup_id));
  const sectionOptions = subtypes.filter((s) => !form.subgroup_id || (s.type && String(s.type.subgroup_id) === String(form.subgroup_id)));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.item_code || !form.item_name) {
      showToast("Item code and name are required", "warning");
      return;
    }
    setSaving(true);
    try {
      const payload = { ...form };
      if (!payload.category_id) payload.category_id = null;
      if (!payload.subgroup_id) payload.subgroup_id = null;
      if (!payload.type_id) payload.type_id = null;
      if (!payload.subtype_id) payload.subtype_id = null;
      if (!payload.unit_id) payload.unit_id = null;
      delete payload.current_stock;

      if (isEdit) {
        await axios.put(`${ITEMS_API}/${id}`, payload);
        showToast("Item updated", "success");
      } else {
        await axios.post(ITEMS_API, payload);
        showToast("Item created", "success");
      }
      navigate("/stores/item-master");
    } catch (err) {
      showToast(err.response?.data?.error || "Failed to save item", "error");
    } finally {
      setSaving(false);
    }
  };

  const updateList = (field, index, key, value) => {
    setForm((prev) => {
      const list = [...prev[field]];
      list[index] = { ...list[index], [key]: value };
      return { ...prev, [field]: list };
    });
  };
  const addRow = (field, row) => setForm((prev) => ({ ...prev, [field]: [...prev[field], row] }));
  const removeRow = (field, index) => setForm((prev) => ({ ...prev, [field]: prev[field].filter((_, i) => i !== index) }));

  const refreshList = async (api, setter) => {
    try { const { data } = await axios.get(api); setter(data); } catch (_) { /* ignore */ }
  };

  const openAdd = (type) => {
    setAddForm({ name: "", description: "", short_name: "", parent_id: type === "subgroup" ? (form.category_id || "") : "", code: "" });
    setAddOpen(type);
  };

  const handleAddSave = async () => {
    if (!addForm.name) { showToast("Name is required", "warning"); return; }
    setAddSaving(true);
    try {
      if (addOpen === "type") {
        const { data } = await axios.post(ITEMTYPES_API, { name: addForm.name, code: addForm.code, description: addForm.description });
        await refreshList(ITEMTYPES_API, setItemTypes);
        setField("type_id", data.id);
      } else if (addOpen === "unit") {
        const { data } = await axios.post(UNITS_API, { name: addForm.name, short_name: (addForm.short_name || "").toUpperCase().slice(0, 3) });
        await refreshList(UNITS_API, setUnits);
        setField("unit_id", data.id);
      } else if (addOpen === "group") {
        const { data } = await axios.post(CATEGORIES_API, { name: addForm.name, code: addForm.code, parent_id: addForm.parent_id || null });
        await refreshList(CATEGORIES_API, setCategories);
        setField("category_id", data.id);
        setField("subgroup_id", "");
      } else if (addOpen === "subgroup") {
        if (!form.category_id) { showToast("Select a Group first", "warning"); return; }
        const { data } = await axios.post("/api/erp/stores/subgroups", { name: addForm.name, group_id: form.category_id, code: addForm.code });
        await refreshList("/api/erp/stores/subgroups", setSubgroups);
        setField("subgroup_id", data.id);
        applyAutoCode(form.category_id, data.id);
      } else if (addOpen === "section") {
        if (!form.subgroup_id) { showToast("Select a Sub Group first", "warning"); return; }
        if (!addForm.parent_id) { showToast("Select a Type first", "warning"); return; }
        const { data } = await axios.post("/api/erp/stores/subtypes", { name: addForm.name, type_id: addForm.parent_id, code: addForm.code });
        await refreshList("/api/erp/stores/subtypes", setSubtypes);
        setField("subtype_id", data.id);
      }
      showToast("Created successfully", "success");
      setAddOpen(null);
    } catch (err) {
      showToast(err.response?.data?.error || "Failed to create", "error");
    } finally {
      setAddSaving(false);
    }
  };

  const generateBarcode = () => {
    const base = (form.item_code || "ITEM").replace(/[^A-Za-z0-9]/g, "").toUpperCase().slice(0, 10);
    const rand = Math.floor(100000 + Math.random() * 899999);
    setField("barcode", `${base}${rand}`.slice(0, 20));
  };

  if (loading) return <LinearProgress />;

  return (
    <Box className="item-container">
      <form onSubmit={handleSubmit}>
        <div className="item-header">
          <div className="item-title">
            <MenuIcon className="menu-icon" />
            <h2>{isEdit ? "Edit Item" : "Add Item"}</h2>
          </div>
          <div className="item-actions">
            <Button variant="contained" color="primary" size="small" type="submit" startIcon={<SaveIcon />} disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </Button>
            <Button variant="outlined" color="secondary" size="small" style={{ marginLeft: 8 }} startIcon={<CancelIcon />} onClick={() => navigate("/stores/item-master")}>
              Cancel
            </Button>
          </div>
        </div>

        <Tabs value={tabIndex} onChange={(_, v) => setTabIndex(v)} variant="scrollable" scrollButtons="auto" className="item-tabs">
          {TAB_LABELS.map((label, idx) => (<Tab key={idx} label={label} className="tab-label" />))}
        </Tabs>

        <Box className="item-class-banner">
          <Box className="banner-info">
            <Typography className="banner-title">Item Classification</Typography>
            <Typography variant="caption" className="banner-sub">Pick a Group and Sub Group to auto-generate the item code</Typography>
          </Box>
          <Box className="banner-fields">
            <BannerPicker label="Item Group" display={groupDisplay}
              onAdd={() => openAdd("group")}
              onLookup={() => setLookup("group")} />
            <BannerPicker label="Sub Group" display={subgroupDisplay}
              onAdd={() => openAdd("subgroup")}
              onLookup={() => setLookup("subgroup")} />
          </Box>
        </Box>

        {/* 0 - Item Details */}
        {tabIndex === 0 && (
          <Box className="item-form two-col">
            <Box className="col-main">
              <Field label="Item Code">
                <TextField size="small" fullWidth className="item-code-field"
                  value={form.item_code} onChange={handleChange("item_code")} required
                  placeholder="Auto-generated after Sub Group"
                  InputProps={{ readOnly: !isEdit && Boolean(form.item_code) }}
                  inputProps={{ maxLength: 50 }}
                  helperText={`${form.item_code.length} / 50  (auto-generated from ${subgroupDisplay || groupDisplay || "classification"})`}
                  FormHelperTextProps={{ sx: { mx: 0, textAlign: 'right', color: 'text.secondary', fontSize: '0.75rem' } }}
                />
              </Field>
              <Field label="Item Name">
                <TextField size="small" fullWidth value={form.item_name} onChange={handleChange("item_name")} required
                  inputProps={{ maxLength: 200 }}
                  helperText={`${form.item_name.length} / 200  (${200 - form.item_name.length} left)`}
                  FormHelperTextProps={{ sx: { mx: 0, textAlign: 'right', color: 'text.secondary' } }}
                />
              </Field>
              <div className="form-row-stacked desc-fill">
                <label>Description</label>
                <TextField placeholder="Item Description" multiline rows={4} fullWidth size="small"
                  value={form.item_description} onChange={handleChange("item_description")}
                  inputProps={{ maxLength: 2000 }}
                  helperText={`${form.item_description.length} / 2000  (${2000 - form.item_description.length} left)`}
                  FormHelperTextProps={{ sx: { mx: 0, textAlign: 'right', color: 'text.secondary' } }}
                  sx={{ width: '100%' }}
                  InputProps={{ sx: { padding: 0, '& textarea': { padding: '8px', fontSize: '0.875rem', resize: 'none' } } }} />
              </div>
            </Box>
            <Box className="col-side">
              <Field label="UOM">
                <LookupField display={unitDisplay} onAdd={() => openAdd("unit")} onLookup={() => setLookup("unit")} placeholder="Select UOM" />
              </Field>
              <Field label="Item Type">
                <LookupField display={typeDisplay} onAdd={() => openAdd("type")} onLookup={() => setLookup("type")} placeholder="Select Item Type" />
              </Field>
              <Field label="Section">
                <LookupField display={sectionDisplay} onAdd={() => openAdd("section")} onLookup={() => setLookup("section")} placeholder="Select Section" />
              </Field>
              <Field label="Criticality">
                <TextField size="small" fullWidth select value={form.criticality} onChange={handleChange("criticality")}>
                  <MenuItem value="">-- Select --</MenuItem>
                  <MenuItem value="Critical">Critical Item</MenuItem>
                  <MenuItem value="Non-Critical">Non-Critical Item</MenuItem>
                </TextField>
              </Field>
              <Field label="Brand"><TextField size="small" fullWidth value={form.brand} onChange={handleChange("brand")} /></Field>
              <Field label="Stock Category"><TextField size="small" fullWidth value={form.stock_category} onChange={handleChange("stock_category")} /></Field>
            </Box>
          </Box>
        )}

        {/* 1 - Adv. Config */}
        {tabIndex === 1 && (
          <Box className="item-form two-col">
            <Box className="col-main">
              <Field label="Valuation"><TextField size="small" fullWidth select value={form.valuation_method} onChange={handleChange("valuation_method")}>
                {VALUATION_METHODS.map((m) => (<MenuItem key={m} value={m}>{m}</MenuItem>))}
              </TextField></Field>
              <NumField label="Lead Time (days)" field="lead_time_days" value={form.lead_time_days} onChange={handleChange("lead_time_days")} />
              <NumField label="Min Order Qty" field="min_order_qty" value={form.min_order_qty} onChange={handleChange("min_order_qty")} />
              <NumField label="Reorder Qty" field="reorder_qty" value={form.reorder_qty} onChange={handleChange("reorder_qty")} />
              <NumField label="Standard Cost" field="standard_cost" step="0.01" value={form.standard_cost} onChange={handleChange("standard_cost")} />
            </Box>
            <Box className="col-side">
              <Field label="ABC Class"><TextField size="small" fullWidth select value={form.abc_class} onChange={handleChange("abc_class")}>
                {ABC_CLASSES.map((c) => (<MenuItem key={c} value={c}>{c}</MenuItem>))}
              </TextField></Field>
              <Field label="Default Location"><TextField size="small" fullWidth value={form.default_location} onChange={handleChange("default_location")} /></Field>
              <FormControlLabel control={<Switch checked={form.track_serial} onChange={(e) => setField("track_serial", e.target.checked)} />} label="Track Serial No." />
              <FormControlLabel control={<Switch checked={form.track_batch} onChange={(e) => setField("track_batch", e.target.checked)} />} label="Track Batch / Lot" />
            </Box>
          </Box>
        )}

        {/* 2 - Alt. Units */}
        {tabIndex === 2 && (
          <Box className="item-form" sx={{ p: 1 }}>
            <Button size="small" variant="outlined" startIcon={<AddIcon />} onClick={() => addRow("alt_units", { unit_id: "", unit_name: "", conversion_factor: 1, is_base: false })}>
              Add Alternative Unit
            </Button>
            <Box sx={{ mt: 2 }}>
              {form.alt_units.map((row, i) => (
                <Grid container spacing={1} key={i} alignItems="center" sx={{ mb: 1 }}>
                  <Grid item xs={4}>
                    <TextField size="small" fullWidth select label="UOM" value={row.unit_id}
                      onChange={(e) => {
                        const u = units.find((x) => String(x.id) === String(e.target.value));
                        updateList("alt_units", i, "unit_id", e.target.value);
                        updateList("alt_units", i, "unit_name", u ? u.name : "");
                      }}>
                      <MenuItem value="">-- Select --</MenuItem>
                      {units.map((u) => (<MenuItem key={u.id} value={u.id}>{u.name}</MenuItem>))}
                    </TextField>
                  </Grid>
                  <Grid item xs={3}>
                    <TextField size="small" fullWidth type="number" label="Factor" value={row.conversion_factor}
                      onChange={(e) => updateList("alt_units", i, "conversion_factor", parseFloat(e.target.value) || 0)} />
                  </Grid>
                  <Grid item xs={3}>
                    <FormControlLabel control={<Checkbox checked={Boolean(row.is_base)} onChange={(e) => updateList("alt_units", i, "is_base", e.target.checked)} />} label="Base" />
                  </Grid>
                  <Grid item xs={2}>
                    <IconButton color="error" onClick={() => removeRow("alt_units", i)}><DeleteIcon /></IconButton>
                  </Grid>
                </Grid>
              ))}
              {form.alt_units.length === 0 && <Typography variant="body2" sx={{ color: "gray" }}>No alternative units defined.</Typography>}
            </Box>
          </Box>
        )}

        {/* 3 - Inv. Control */}
        {tabIndex === 3 && (
          <Box className="item-form two-col">
            <Box className="col-main">
              <NumField label="Opening Stock" field="opening_stock" value={form.opening_stock} onChange={handleChange("opening_stock")} />
              <NumField label="Min Stock" field="min_stock" value={form.min_stock} onChange={handleChange("min_stock")} />
            </Box>
            <Box className="col-side">
              <NumField label="Max Stock" field="max_stock" value={form.max_stock} onChange={handleChange("max_stock")} />
              <NumField label="Reorder Level" field="reorder_level" value={form.reorder_level} onChange={handleChange("reorder_level")} />
            </Box>
          </Box>
        )}

        {/* 4 - Tax Details */}
        {tabIndex === 4 && (
          <Box className="item-form two-col">
            <Box className="col-main">
              <Field label="HSN Code"><TextField size="small" fullWidth value={form.hsn_code} onChange={handleChange("hsn_code")} inputProps={{ maxLength: 20 }} /></Field>
            </Box>
            <Box className="col-side">
              <NumField label="GST %" field="gst_rate" step="0.01" value={form.gst_rate} onChange={handleChange("gst_rate")} />
            </Box>
          </Box>
        )}

        {/* 5 - Price List */}
        {tabIndex === 5 && (
          <Box className="item-form two-col">
            <Box className="col-main">
              <NumField label="Selling Rate" field="rate" step="0.01" value={form.rate} onChange={handleChange("rate")} />
              <NumField label="MRP" field="mrp" step="0.01" value={form.mrp} onChange={handleChange("mrp")} />
            </Box>
            <Box className="col-side">
              <NumField label="Purchase Price" field="purchase_price" step="0.01" value={form.purchase_price} onChange={handleChange("purchase_price")} />
              <NumField label="Discount %" field="discount_percent" step="0.01" value={form.discount_percent} onChange={handleChange("discount_percent")} />
            </Box>
          </Box>
        )}

        {/* 6 - Attr */}
        {tabIndex === 6 && (
          <Box className="item-form" sx={{ p: 1 }}>
            <Button size="small" variant="outlined" startIcon={<AddIcon />} onClick={() => addRow("attributes", { name: "", value: "" })}>Add Attribute</Button>
            <Box sx={{ mt: 2 }}>
              {form.attributes.map((row, i) => (
                <Grid container spacing={1} key={i} alignItems="center" sx={{ mb: 1 }}>
                  <Grid item xs={5}><TextField size="small" fullWidth label="Name" value={row.name} onChange={(e) => updateList("attributes", i, "name", e.target.value)} /></Grid>
                  <Grid item xs={5}><TextField size="small" fullWidth label="Value" value={row.value} onChange={(e) => updateList("attributes", i, "value", e.target.value)} /></Grid>
                  <Grid item xs={2}><IconButton color="error" onClick={() => removeRow("attributes", i)}><DeleteIcon /></IconButton></Grid>
                </Grid>
              ))}
              {form.attributes.length === 0 && <Typography variant="body2" sx={{ color: "gray" }}>No attributes defined.</Typography>}
            </Box>
          </Box>
        )}

        {/* 7 - Attachments */}
        {tabIndex === 7 && (
          <Box className="item-form" sx={{ p: 1 }}>
            <Button size="small" variant="outlined" startIcon={<AddIcon />} onClick={() => addRow("attachments", { name: "", url: "" })}>Add Attachment</Button>
            <Box sx={{ mt: 2 }}>
              {form.attachments.map((row, i) => (
                <Grid container spacing={1} key={i} alignItems="center" sx={{ mb: 1 }}>
                  <Grid item xs={4}><TextField size="small" fullWidth label="Name" value={row.name} onChange={(e) => updateList("attachments", i, "name", e.target.value)} /></Grid>
                  <Grid item xs={6}><TextField size="small" fullWidth label="URL / Path" value={row.url} onChange={(e) => updateList("attachments", i, "url", e.target.value)} /></Grid>
                  <Grid item xs={2}><IconButton color="error" onClick={() => removeRow("attachments", i)}><DeleteIcon /></IconButton></Grid>
                </Grid>
              ))}
              {form.attachments.length === 0 && <Typography variant="body2" sx={{ color: "gray" }}>No attachments added.</Typography>}
            </Box>
          </Box>
        )}

        {/* 8 - E-commerce */}
        {tabIndex === 8 && (
          <Box className="item-form two-col">
            <Box className="col-main">
              <Field label="Short Desc"><CountedTextArea size="small" fullWidth rows={3} value={form.ecommerce.short_desc} onChange={(e) => setField("ecommerce", { ...form.ecommerce, short_desc: e.target.value })} /></Field>
              <Field label="SEO Title"><TextField size="small" fullWidth value={form.ecommerce.seo_title} onChange={(e) => setField("ecommerce", { ...form.ecommerce, seo_title: e.target.value })} /></Field>
              <Field label="Meta Keywords"><TextField size="small" fullWidth value={form.ecommerce.meta_keywords} onChange={(e) => setField("ecommerce", { ...form.ecommerce, meta_keywords: e.target.value })} /></Field>
            </Box>
            <Box className="col-side">
              <Field label="Status">
                <TextField size="small" fullWidth select value={form.ecommerce.status} onChange={(e) => setField("ecommerce", { ...form.ecommerce, status: e.target.value })}>
                  <MenuItem value="Disabled">Disabled</MenuItem>
                  <MenuItem value="Enabled">Enabled</MenuItem>
                </TextField>
              </Field>
              <FormControlLabel control={<Switch checked={Boolean(form.ecommerce.featured)} onChange={(e) => setField("ecommerce", { ...form.ecommerce, featured: e.target.checked })} />} label="Featured Product" />
            </Box>
          </Box>
        )}

        {/* 9 - Barcode Details */}
        {tabIndex === 9 && (
          <Box className="item-form two-col">
            <Box className="col-main">
              <Field label="Barcode"><TextField size="small" fullWidth value={form.barcode} onChange={handleChange("barcode")} inputProps={{ maxLength: 50 }} /></Field>
            </Box>
            <Box className="col-side">
              <Field label="Barcode Type">
                <TextField size="small" fullWidth select value={form.barcode_type} onChange={handleChange("barcode_type")}>
                  {BARCODE_TYPES.map((b) => (<MenuItem key={b} value={b}>{b}</MenuItem>))}
                </TextField>
              </Field>
              <Button size="small" variant="outlined" onClick={generateBarcode}>Generate Barcode</Button>
            </Box>
          </Box>
        )}

        <Dialog open={Boolean(addOpen)} onClose={() => setAddOpen(null)} maxWidth="xs" fullWidth>
          <DialogTitle>
            {addOpen === "type" && "New Item Type"}
            {addOpen === "unit" && "New Unit (UOM)"}
            {addOpen === "group" && "New Item Group"}
            {addOpen === "subgroup" && "New Sub Group"}
            {addOpen === "section" && "New Section (Sub Type)"}
          </DialogTitle>
          <DialogContent dividers>
            <TextField fullWidth size="small" label="Name" sx={{ mb: 2 }}
              value={addForm.name} onChange={(e) => setAddForm((f) => ({ ...f, name: e.target.value }))} autoFocus />
            {addOpen === "type" && (
              <>
                <TextField fullWidth size="small" label="Code" sx={{ mb: 2, textTransform: "uppercase" }}
                  inputProps={{ maxLength: 20 }}
                  helperText="Optional short code"
                  value={addForm.code}
                  onChange={(e) => setAddForm((f) => ({ ...f, code: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "") }))} />
                <TextField fullWidth size="small" select label="Parent Type (optional)" sx={{ mb: 2 }}
                  value={addForm.parent_id}
                  onChange={(e) => setAddForm((f) => ({ ...f, parent_id: e.target.value }))}>
                  <MenuItem value="">-- None (Top Type) --</MenuItem>
                  {itemTypes.filter((t) => !t.parent_id).map((t) => (
                    <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>
                  ))}
                </TextField>
                <TextField fullWidth size="small" label="Description"
                  value={addForm.description} onChange={(e) => setAddForm((f) => ({ ...f, description: e.target.value }))} />
              </>
            )}
            {addOpen === "unit" && (
              <TextField fullWidth size="small" label="Short Code" sx={{ textTransform: "uppercase" }}
                inputProps={{ maxLength: 3 }}
                helperText="Uppercase, max 3 letters (e.g. PCS, KGS)"
                value={addForm.short_name}
                onChange={(e) => setAddForm((f) => ({ ...f, short_name: e.target.value.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 3) }))} />
            )}
            {addOpen === "group" && (
              <>
                <TextField fullWidth size="small" label="Series Code" sx={{ mb: 2, textTransform: "uppercase" }}
                  inputProps={{ maxLength: 20 }}
                  helperText="Short code used for item numbering (e.g. RM, RAWMA)"
                  value={addForm.code}
                  onChange={(e) => setAddForm((f) => ({ ...f, code: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "") }))} />
                <TextField fullWidth size="small" select label="Parent Group (optional)"
                  value={addForm.parent_id}
                  onChange={(e) => setAddForm((f) => ({ ...f, parent_id: e.target.value }))}>
                  <MenuItem value="">-- None (Top Group) --</MenuItem>
                  {categories.filter((c) => !c.parent_id).map((c) => (
                    <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                  ))}
                </TextField>
              </>
            )}
            {addOpen === "subgroup" && (
              <>
                <TextField fullWidth size="small" label="Series Code" sx={{ mb: 2, textTransform: "uppercase" }}
                  inputProps={{ maxLength: 20 }}
                  helperText="Series used for item numbering (e.g. RAWMA, TFAN, VFAN)"
                  value={addForm.code}
                  onChange={(e) => setAddForm((f) => ({ ...f, code: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "") }))} />
                <TextField fullWidth size="small" select label="Parent Group" sx={{ mb: 2 }}
                  value={addForm.parent_id}
                  onChange={(e) => setAddForm((f) => ({ ...f, parent_id: e.target.value }))}>
                  <MenuItem value="">-- Select Group --</MenuItem>
                  {categories.filter((c) => !c.parent_id).map((c) => (
                    <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                  ))}
                </TextField>
              </>
            )}
            {addOpen === "section" && (
              <>
                <TextField fullWidth size="small" select label="Parent Type" sx={{ mb: 2 }}
                  value={addForm.parent_id}
                  onChange={(e) => setAddForm((f) => ({ ...f, parent_id: e.target.value }))}>
                  <MenuItem value=""><em>Select Type</em></MenuItem>
                  {itemTypes.filter((t) => !form.subgroup_id || String(t.subgroup_id) === String(form.subgroup_id)).map((t) => (
                    <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>
                  ))}
                </TextField>
                <TextField fullWidth size="small" label="Series Code" sx={{ mb: 2, textTransform: "uppercase" }}
                  inputProps={{ maxLength: 20 }}
                  helperText="Optional series for this section"
                  value={addForm.code}
                  onChange={(e) => setAddForm((f) => ({ ...f, code: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "") }))} />
              </>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setAddOpen(null)}>Cancel</Button>
            <Button variant="contained" onClick={handleAddSave} disabled={addSaving}>
              {addSaving ? "Saving..." : "Create"}
            </Button>
          </DialogActions>
        </Dialog>

        <ItemSelectDialog
          open={Boolean(lookup)}
          onClose={() => setLookup(null)}
          onSelect={(item) => {
            if (lookup === "group") {
              setField("category_id", item.id);
              setField("subgroup_id", "");
              setField("subtype_id", "");
            } else if (lookup === "subgroup") {
              setField("subgroup_id", item.id);
              setField("subtype_id", "");
              if (!isEdit) applyAutoCode(form.category_id, item.id);
            } else if (lookup === "unit") {
              setField("unit_id", item.id);
            } else if (lookup === "type") {
              setField("type_id", item.id);
            } else if (lookup === "section") {
              setField("subtype_id", item.id);
            }
            setLookup(null);
          }}
          title={
            lookup === "group" ? "Select Item Group"
              : lookup === "subgroup" ? "Select Sub Group"
                : lookup === "unit" ? "Select UOM"
                  : lookup === "type" ? "Select Item Type"
                    : "Select Section"
          }
          data={
            lookup === "group" ? categories
              : lookup === "subgroup" ? subGroupOptions
                : lookup === "unit" ? units
                  : lookup === "type" ? typeOptions
                    : sectionOptions
          }
          columns={lookup === "unit"
            ? [{ key: "short_name", label: "Code" }, { key: "name", label: "Name" }]
            : [{ key: "id", label: "ID" }, { key: "name", label: "Name" }]
          }
        />
      </form>
    </Box>
  );
}
