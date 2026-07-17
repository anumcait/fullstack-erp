import React, { useEffect, useState, useMemo } from "react";
import {
  Box, Card, CardContent, Typography, TextField, Button, Grid, MenuItem,
  IconButton, LinearProgress, Table, TableHead, TableRow, TableCell, TableBody,
  InputAdornment, Tooltip
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import axios from "axios";
import { useToast } from "../../../../context/ToastContext";
import ItemSelectDialog from "../../Stores/ItemMaster/ItemSelectDialog";
import { useNavigate, useParams, useLocation } from "react-router-dom";


const API = "/api/erp/purchase/requisitions";
const COST_CENTERS_API = "/api/erp/purchase/cost-centers";
const ITEMS_API = "/api/erp/stores/items";
const UNITS_API = "/api/erp/stores/units";


const DEPARTMENTS = [
  "Production", "Maintenance", "Quality", "Stores", "Engineering",
  "Planning", "Marketing", "HR", "Accounts", "Purchase", "Other",
];


const INDENT_TYPES = [
  { value: "Regular", label: "Regular", desc: "Routine items for day-to-day operations (standard approval)" },
  { value: "Emergency", label: "Emergency", desc: "Urgent requirement — bypasses queue, expedited approval" },
  { value: "Capital", label: "Capital", desc: "Capital equipment / fixed assets (separate budget allocation)" },
  { value: "Service", label: "Service", desc: "Services such as AMC, consultancy, maintenance contracts" },
];


const emptyItem = () => ({
  item_code: "", item_name: "", cost_center: "", uom: "NOS",
  quantity: "", expected_date: "", purpose: "",
  len: "", item_no: "", kg: "", mat_code: "", mat_desc: "", est_cost: "",
});


export default function RequisitionForm() {
  const { id } = useParams();
  const location = useLocation();
  const isView = location.pathname.includes("/view/");
  const isEdit = Boolean(id) && !isView;
  const { showToast } = useToast();
  const navigate = useNavigate();


  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const nowLocal = () => {
    const d = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const formatDateTime = (val) => {
    if (!val) return "";
    const hasTime = val.includes("T") || val.includes(" ");
    const d = new Date(val);
    if (isNaN(d.getTime())) {
      const [datePart, timePart] = val.split("T");
      if (!datePart) return val;
      const [y, m, day] = datePart.split("-").map(Number);
      const [h, min] = timePart ? timePart.split(":").map(Number) : [0, 0];
      if (!y || !m || !day) return val;
      const d2 = new Date(y, m - 1, day, h || 0, min || 0);
      if (isNaN(d2.getTime())) return val;
      const pad = (n) => String(n).padStart(2, "0");
      if (!hasTime) return `${pad(day)}-${pad(m)}-${y}`;
      const hrs = d2.getHours(), mins = d2.getMinutes();
      const ampm = hrs >= 12 ? "PM" : "AM";
      const h12 = hrs % 12 || 12;
      return `${pad(day)}-${pad(m)}-${y} ${h12}.${pad(mins)} ${ampm}`;
    }
    const pad = (n) => String(n).padStart(2, "0");
    if (!hasTime) return `${pad(d.getDate())}-${pad(d.getMonth() + 1)}-${d.getFullYear()}`;
    const hrs = d.getHours(), mins = d.getMinutes();
    const ampm = hrs >= 12 ? "PM" : "AM";
    const h12 = hrs % 12 || 12;
    return `${pad(d.getDate())}-${pad(d.getMonth() + 1)}-${d.getFullYear()} ${h12}.${pad(mins)} ${ampm}`;
  };

  const [header, setHeader] = useState({
    req_no: "", req_date: nowLocal(),
    department: "", sub_department: "", requested_by: "",
    indent_type: "Regular", priority: "Normal", notes: "",
  });
  const [items, setItems] = useState([emptyItem()]);


  const [costCenters, setCostCenters] = useState([]);
  const [allItems, setAllItems] = useState([]);
  const [units, setUnits] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [itemSearch, setItemSearch] = useState("");


  const [costCenterDialog, setCostCenterDialog] = useState(-1);
  const [itemDialog, setItemDialog] = useState(null);


  const indentType = INDENT_TYPES.find((t) => t.value === header.indent_type);


  useEffect(() => {
    Promise.all([
      axios.get(COST_CENTERS_API).catch(() => ({ data: [] })),
      axios.get(ITEMS_API).catch(() => ({ data: [] })),
      axios.get(UNITS_API).catch(() => ({ data: [] })),
      axios.get("/api/employees").catch(() => ({ data: [] })),
    ]).then(([cc, it, u, emp]) => {
      setCostCenters(cc.data || []);
      setAllItems(it.data || []);
      setUnits(u.data || []);
      setEmployees(emp.data || []);
    });
  }, []);


  useEffect(() => {
    if (id) {
      setLoading(true);
      axios.get(`${API}/${id}`).then(({ data }) => {
        setHeader({
          req_no: data.req_no || "",
          req_date: data.req_date ? data.req_date.slice(0, 16) : "",
          department: data.department || "",
          sub_department: data.sub_department || "",
          requested_by: data.requested_by || "",
          indent_type: data.indent_type || "Regular",
          priority: data.priority || "Normal",
          notes: data.notes || "",
        });
        if (data.items) setItems(data.items.map((it) => ({
          item_code: it.item_code || "",
          item_name: it.item_name || "",
          cost_center: it.cost_center || "",
          uom: it.uom || "NOS",
          quantity: it.quantity || "",
          expected_date: it.expected_date?.split("T")[0] || "",
          purpose: it.purpose || "",
          len: it.len || "",
          item_no: it.item_no || "",
          kg: it.kg || "",
          mat_code: it.mat_code || "",
          mat_desc: it.mat_desc || "",
          est_cost: it.est_cost || "",
        })));
      }).catch(() => showToast("Failed to load requisition", "error"))
        .finally(() => setLoading(false));
    }
  }, [id]);


  const setField = (f, v) => setHeader((p) => ({ ...p, [f]: v }));
  const handleChange = (f) => (e) => setField(f, e.target.value);


  const handleItemChange = (idx, field) => (e) => {
    const updated = [...items];
    updated[idx][field] = e.target.value;
    setItems(updated);
  };


  const addItem = () => setItems([...items, emptyItem()]);
  const removeItem = (idx) => { if (items.length > 1) setItems(items.filter((_, i) => i !== idx)); };


  const filteredItems = useMemo(() => {
    const q = itemSearch.trim().toLowerCase();
    if (!q) return items;
    return items.filter((it) =>
      Object.values(it).some((v) => String(v || "").toLowerCase().includes(q))
    );
  }, [itemSearch, items]);


  const handleItemSelect = (item) => {
    if (itemDialog === null || itemDialog < 0) return;
    setItems((prev) => {
      const updated = [...prev];
      updated[itemDialog] = {
        ...updated[itemDialog],
        item_code: item.item_code || "",
        item_name: item.item_name || "",
        uom: item.uom || "NOS",
        mat_code: item.mat_code || "",
      };
      return updated;
    });
    setItemDialog(null);
  };


  const handleCostCenterSelect = (cc) => {
    if (costCenterDialog < 0) return;
    setItems((prev) => {
      const updated = [...prev];
      updated[costCenterDialog] = { ...updated[costCenterDialog], cost_center: cc.name || cc.code };
      return updated;
    });
    setCostCenterDialog(-1);
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!header.req_no || !header.req_date || !header.department) {
      showToast("Req #, date and department are required", "warning");
      return;
    }
    if (!items.some((i) => i.item_name && i.quantity)) {
      showToast("Add at least one item with name and qty", "warning");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...header,
        req_date: nowLocal(),
        items: items.map((i) => ({
          ...i,
          quantity: parseFloat(i.quantity) || 0,
          len: i.len ? parseFloat(i.len) : null,
          kg: i.kg ? parseFloat(i.kg) : null,
          est_cost: i.est_cost ? parseFloat(i.est_cost) : null,
        })),
      };
      if (isEdit) { await axios.put(`${API}/${id}`, payload); showToast("Updated", "success"); }
      else { await axios.post(API, payload); showToast("Created", "success"); }
      navigate("/purchase/requisitions");
    } catch (err) { showToast(err.response?.data?.error || "Failed to save", "error"); }
    finally { setSaving(false); }
  };


  if (loading) return <LinearProgress />;


  const fsx = {
    "& .MuiInputBase-root": { fontSize: "0.88rem", height: 34 },
    "& .MuiInputLabel-root": { fontSize: "0.88rem", mt: -0.25 },
    "& .MuiInputLabel-shrink": { mt: 0 }
  };


  const fTextAreaSx = {
    "& .MuiInputBase-root": { fontSize: "0.88rem" },
    "& .MuiInputLabel-root": { fontSize: "0.88rem" }
  };


  return (
    <Box sx={{ p: 3, maxWidth: 1600, fontSize: "0.95rem" }}>
      {/* ── Title + Action Bar ── */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: "#0f172a", fontSize: "1.4rem" }}>
          {isView ? "Requisition Details" : isEdit ? "Edit Requisition" : "New Purchase Requisition"}
        </Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          {!isView && (
            <Button variant="contained" color="primary" size="medium" onClick={handleSubmit}
              startIcon={<SaveIcon />} disabled={saving}>
              {saving ? "Saving..." : "Save Requisition"}
            </Button>
          )}
          <Button variant="outlined" color="secondary" size="medium" startIcon={<CancelIcon />}
            onClick={() => navigate("/purchase/requisitions")}>
            {isView ? "Back" : "Cancel"}
          </Button>
        </Box>
      </Box>


      {/* ── Header Information Card ── */}
      <Card sx={{ borderRadius: 2, boxShadow: "0 1px 6px rgba(0,0,0,0.05)", mb: 2.5, border: "1px solid #e2e8f0" }}>
        <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
          <Typography variant="subtitle2" sx={{ mb: 1.5, color: "#0f172a", fontWeight: 700 }}>
            Header Information
          </Typography>

          <Grid container spacing={1} sx={{ mb: 2 }}>
            <Grid item xs={12} sm={6} sx={{ width: 200, flex: "0 0 auto" }}>
              <TextField label="Department *" size="small" fullWidth select value={header.department}
                onChange={handleChange("department")} required disabled={isView}
                InputLabelProps={{ shrink: true }} sx={fsx}
                SelectProps={{ displayEmpty: true }}>
                <MenuItem value="">-- Select --</MenuItem>
                {DEPARTMENTS.map((d) => <MenuItem key={d} value={d}>{d}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} sx={{ width: 170, flex: "0 0 auto" }}>
              <TextField label="Sub Dept" size="small" fullWidth value={header.sub_department || ""}
                onChange={handleChange("sub_department")} disabled={isView} InputLabelProps={{ shrink: true }} sx={fsx} />
            </Grid>
            <Grid item xs={6} sm={3} sx={{ width: 170, flex: "0 0 auto" }}>
              <TextField label="Request By" size="small" fullWidth select value={header.requested_by || ""}
                onChange={handleChange("requested_by")} disabled={isView} InputLabelProps={{ shrink: true }} sx={fsx}
                SelectProps={{ displayEmpty: true }}>
                <MenuItem value="">-- Select --</MenuItem>
                {employees.map((emp) => <MenuItem key={emp.empid || emp.id} value={emp.ename}>{emp.ename} - {emp.empid}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={6} sm={3} sx={{ width: 140, flex: "0 0 auto" }}>
              <TextField label="Indent Type" size="small" fullWidth select value={header.indent_type || "Regular"}
                onChange={handleChange("indent_type")} disabled={isView} InputLabelProps={{ shrink: true }} sx={fsx}>
                {INDENT_TYPES.map((t) => <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={6} sm={3} sx={{ width: 120, flex: "0 0 auto" }}>
              <TextField label="Priority" size="small" fullWidth select value={header.priority || "Normal"}
                onChange={handleChange("priority")} disabled={isView} InputLabelProps={{ shrink: true }} sx={fsx}>
                <MenuItem value="Normal">Normal</MenuItem>
                <MenuItem value="High">High</MenuItem>
                <MenuItem value="Urgent">Urgent</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={6} sm={3} sx={{ width: 110, flex: "0 0 auto" }}>
              <TextField label="Req No *" size="small" fullWidth value={header.req_no || ""}
                onChange={handleChange("req_no")} required disabled={isView} InputLabelProps={{ shrink: true }} sx={fsx} />
            </Grid>
            <Grid item xs={6} sm={3} sx={{ width: 170, flex: "0 0 auto" }}>
              <TextField label="Date *" size="small" fullWidth value={formatDateTime(header.req_date)}
                InputLabelProps={{ shrink: true }} required disabled sx={fsx} />
            </Grid>
          </Grid>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField label="Notes" size="small" fullWidth multiline rows={2} value={header.notes || ""}
                onChange={handleChange("notes")} disabled={isView} placeholder="Enter any extra notes..."
                inputProps={{ maxLength: 500 }}
                helperText={`${(header.notes || "").length} / 500`}
                sx={fTextAreaSx}
                FormHelperTextProps={{ sx: { textAlign: "right", m: 0, mt: 0.25, fontSize: "0.8rem", color: (header.notes || "").length > 450 ? "error.main" : "text.secondary" } }} />
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{
                display: "flex", alignItems: "flex-start", gap: 1,
                p: 1, borderRadius: 1.5, height: "100%", boxSizing: "border-box",
                bgcolor: "#f8fafc", border: "1px solid #e2e8f0", borderLeft: "3px solid #3b82f6",
              }}>
                <InfoOutlinedIcon sx={{ fontSize: 18, color: "#3b82f6", mt: 0.15 }} />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: "#0f172a", display: "block", mb: 0.5, fontSize: "0.8rem" }}>
                    Current Type: <Box component="span" sx={{ color: "#2563eb" }}>{indentType?.label}</Box> — {indentType?.desc}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#64748b", display: "block", lineHeight: 1.35, fontSize: "0.75rem" }}>
                    Alternatives: {INDENT_TYPES.filter((t) => t.value !== header.indent_type).map((t) => t.label).join(", ")}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>


      {/* ── Item Details Card ── */}
      <Card sx={{ borderRadius: 2, boxShadow: "0 1px 6px rgba(0,0,0,0.05)", border: "1px solid #e2e8f0" }}>
        <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
            <Typography variant="subtitle2" sx={{ color: "#0f172a", fontWeight: 700 }}>
              Item Details
            </Typography>
            {!isView && (
              <Box sx={{ display: "flex", gap: 1 }}>
                <TextField size="small" placeholder="Search items..." value={itemSearch}
                  onChange={(e) => setItemSearch(e.target.value)}
                  InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
                  sx={{ "& .MuiInputBase-root": { fontSize: "0.8rem", height: 28, width: 200 } }} />
                <Button size="small" variant="outlined" startIcon={<AddIcon />} onClick={addItem} sx={{ height: 28 }}>Add Item</Button>
              </Box>
            )}
          </Box>
          <Box sx={{ overflowX: "auto" }}>
            <Table size="small" sx={{ minWidth: 1550 }}>
              <TableHead>
                <TableRow sx={{ bgcolor: "#f8fafc" }}>
                  <TableCell sx={{ fontWeight: 700, whiteSpace: "nowrap", fontSize: "0.84rem", py: 0.75, color: "#475569", width: 160 }}>Cost Center</TableCell>
                  <TableCell sx={{ fontWeight: 700, whiteSpace: "nowrap", fontSize: "0.84rem", py: 0.75, color: "#475569", width: 110 }}>Item Code</TableCell>
                  <TableCell sx={{ fontWeight: 700, whiteSpace: "nowrap", fontSize: "0.84rem", py: 0.75, color: "#475569" }}>Item Desc *</TableCell>
                  <TableCell sx={{ fontWeight: 700, whiteSpace: "nowrap", fontSize: "0.84rem", py: 0.75, color: "#475569", width: 70 }}>UOM</TableCell>
                  <TableCell sx={{ fontWeight: 700, whiteSpace: "nowrap", fontSize: "0.84rem", py: 0.75, color: "#475569", width: 70 }}>Qty *</TableCell>
                  <TableCell sx={{ fontWeight: 700, whiteSpace: "nowrap", fontSize: "0.84rem", py: 0.75, color: "#475569", width: 100 }}>Req. Date</TableCell>
                  <TableCell sx={{ fontWeight: 700, whiteSpace: "nowrap", fontSize: "0.84rem", py: 0.75, color: "#475569" }}>Purpose</TableCell>
                  <TableCell sx={{ fontWeight: 700, whiteSpace: "nowrap", fontSize: "0.84rem", py: 0.75, color: "#475569", width: 60 }}>Len</TableCell>
                  <TableCell sx={{ fontWeight: 700, whiteSpace: "nowrap", fontSize: "0.84rem", py: 0.75, color: "#475569", width: 80 }}>No of Kgs</TableCell>
                  <TableCell sx={{ fontWeight: 700, whiteSpace: "nowrap", fontSize: "0.84rem", py: 0.75, color: "#475569", width: 90 }}>Mat. Code</TableCell>
                  <TableCell sx={{ fontWeight: 700, whiteSpace: "nowrap", fontSize: "0.84rem", py: 0.75, color: "#475569" }}>Mat. Desc</TableCell>
                  <TableCell sx={{ fontWeight: 700, whiteSpace: "nowrap", fontSize: "0.84rem", py: 0.75, color: "#475569", width: 80 }}>Est Cost</TableCell>
                  {!isView && <TableCell sx={{ width: 36, py: 0.75 }} />}
                </TableRow>
              </TableHead>
              <TableBody>
                {(itemSearch ? filteredItems : items).map((it, idx) => (
                  <TableRow key={idx} sx={{ "&:hover": { bgcolor: "#f8fafc" }, verticalAlign: "top" }}>
                    {/* Cost Center */}
                    <TableCell sx={{ py: 0.5, px: 0.5, verticalAlign: "top" }}>
                      <TextField size="small" fullWidth value={it.cost_center}
                        onClick={() => !isView && setCostCenterDialog(idx)} disabled={isView}
                        InputProps={{
                          readOnly: true, endAdornment: !isView && (
                            <InputAdornment position="end"><IconButton size="small" onClick={() => setCostCenterDialog(idx)} sx={{ p: 0 }}><SearchIcon sx={{ fontSize: 14 }} /></IconButton></InputAdornment>
                          )
                        }}
                        placeholder="Select"
                        sx={{ "& .MuiInputBase-root": { fontSize: "0.84rem", height: 44, cursor: isView ? "default" : "pointer" } }} />
                    </TableCell>
                    {/* Item Code */}
                    <TableCell sx={{ py: 0.5, px: 0.5, verticalAlign: "top" }}>
                      <TextField size="small" fullWidth value={it.item_code}
                        onClick={() => !isView && setItemDialog(idx)} disabled={isView}
                        InputProps={{
                          readOnly: true, endAdornment: !isView && (
                            <InputAdornment position="end"><IconButton size="small" onClick={() => setItemDialog(idx)} sx={{ p: 0 }}><SearchIcon sx={{ fontSize: 14 }} /></IconButton></InputAdornment>
                          )
                        }}
                        placeholder="Select"
                        sx={{ "& .MuiInputBase-root": { fontSize: "0.84rem", height: 44, cursor: isView ? "default" : "pointer" } }} />
                    </TableCell>
                    {/* Item Desc (textarea rows=2) */}
                    <TableCell sx={{ py: 0.5, px: 0.5, verticalAlign: "top", minWidth: 200 }}>
                      <Tooltip title={it.item_name || ""} arrow>
                        <TextField size="small" fullWidth multiline rows={2} value={it.item_name || ""}
                          onChange={handleItemChange(idx, "item_name")} required disabled={isView}
                          placeholder="Description" inputProps={{ maxLength: 200 }}
                          sx={{
                            "& .MuiInputBase-root": { fontSize: "0.84rem", height: 44, p: "4px 8px", alignItems: "flex-start" },
                            "& .MuiInputBase-input": { height: "100% !important", overflow: "auto" }
                          }} />
                      </Tooltip>
                    </TableCell>
                    {/* UOM */}
                    <TableCell sx={{ py: 0.5, px: 0.5, verticalAlign: "top" }}>
                      <TextField size="small" fullWidth select value={it.uom} onChange={handleItemChange(idx, "uom")} disabled={isView}
                        sx={{ "& .MuiInputBase-root": { fontSize: "0.84rem", height: 44 } }}>
                        <MenuItem value="NOS">NOS</MenuItem>
                        {units.map((u) => <MenuItem key={u.id} value={u.short_name || u.name}>{u.short_name || u.name}</MenuItem>)}
                      </TextField>
                    </TableCell>
                    {/* Qty */}
                    <TableCell sx={{ py: 0.5, px: 0.5, verticalAlign: "top" }}>
                      <TextField size="small" fullWidth type="number" value={it.quantity} onChange={handleItemChange(idx, "quantity")} required disabled={isView}
                        placeholder="Qty" sx={{ "& .MuiInputBase-root": { fontSize: "0.84rem", height: 44 } }} />
                    </TableCell>
                    {/* Req. Date */}
                    <TableCell sx={{ py: 0.5, px: 0.5, verticalAlign: "top" }}>
                      <TextField type="date" size="small" fullWidth value={it.expected_date} onChange={handleItemChange(idx, "expected_date")}
                        InputLabelProps={{ shrink: true }} disabled={isView}
                        sx={{ "& .MuiInputBase-root": { fontSize: "0.84rem", height: 44 } }} />
                    </TableCell>
                    {/* Purpose (textarea rows=2) */}
                    <TableCell sx={{ py: 0.5, px: 0.5, verticalAlign: "top", minWidth: 150 }}>
                      <Tooltip title={it.purpose || ""} arrow>
                        <TextField size="small" fullWidth multiline rows={2} value={it.purpose || ""}
                          onChange={handleItemChange(idx, "purpose")} disabled={isView}
                          placeholder="Purpose" inputProps={{ maxLength: 200 }}
                          sx={{
                            "& .MuiInputBase-root": { fontSize: "0.84rem", height: 44, p: "4px 8px", alignItems: "flex-start" },
                            "& .MuiInputBase-input": { height: "100% !important", overflow: "auto" }
                          }} />
                      </Tooltip>
                    </TableCell>
                    {/* Len */}
                    <TableCell sx={{ py: 0.5, px: 0.5, verticalAlign: "top" }}>
                      <TextField size="small" fullWidth type="number" value={it.len} onChange={handleItemChange(idx, "len")} disabled={isView}
                        placeholder="0" sx={{ "& .MuiInputBase-root": { fontSize: "0.84rem", height: 44 } }} />
                    </TableCell>
                    {/* No of Kgs */}
                    <TableCell sx={{ py: 0.5, px: 0.5, verticalAlign: "top" }}>
                      <TextField size="small" fullWidth type="number" value={it.kg} onChange={handleItemChange(idx, "kg")} disabled={isView}
                        placeholder="0" sx={{ "& .MuiInputBase-root": { fontSize: "0.84rem", height: 44 } }} />
                    </TableCell>
                    {/* Mat Code */}
                    <TableCell sx={{ py: 0.5, px: 0.5, verticalAlign: "top" }}>
                      <TextField size="small" fullWidth value={it.mat_code} onChange={handleItemChange(idx, "mat_code")} disabled={isView}
                        placeholder="Mat Code" sx={{ "& .MuiInputBase-root": { fontSize: "0.84rem", height: 44 } }} />
                    </TableCell>
                    {/* Mat Desc (textarea rows=2) */}
                    <TableCell sx={{ py: 0.5, px: 0.5, verticalAlign: "top", minWidth: 150 }}>
                      <Tooltip title={it.mat_desc || ""} arrow>
                        <TextField size="small" fullWidth multiline rows={2} value={it.mat_desc || ""}
                          onChange={handleItemChange(idx, "mat_desc")} disabled={isView}
                          placeholder="Mat Desc" inputProps={{ maxLength: 200 }}
                          sx={{
                            "& .MuiInputBase-root": { fontSize: "0.84rem", height: 44, p: "4px 8px", alignItems: "flex-start" },
                            "& .MuiInputBase-input": { height: "100% !important", overflow: "auto" }
                          }} />
                      </Tooltip>
                    </TableCell>
                    {/* Est Cost */}
                    <TableCell sx={{ py: 0.5, px: 0.5, verticalAlign: "top" }}>
                      <TextField size="small" fullWidth type="number" value={it.est_cost} onChange={handleItemChange(idx, "est_cost")} disabled={isView}
                        placeholder="0.00" sx={{ "& .MuiInputBase-root": { fontSize: "0.84rem", height: 44 } }} />
                    </TableCell>
                    {/* Delete */}
                    {!isView && (
                      <TableCell sx={{ py: 0.5, px: 0.5, verticalAlign: "top" }}>
                        <IconButton size="small" color="error" onClick={() => removeItem(idx)} disabled={items.length <= 1} sx={{ height: 44 }}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
          {items.length === 0 && (
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", py: 3 }}>
              No items added. Click "Add Item" to start.
            </Typography>
          )}
        </CardContent>
      </Card>


      {/* ── Dialogs ── */}
      <ItemSelectDialog open={costCenterDialog >= 0} onClose={() => setCostCenterDialog(-1)}
        onSelect={handleCostCenterSelect} title="Select Cost Center"
        data={costCenters} columns={[{ key: "code", label: "Code" }, { key: "name", label: "Name" }]} />


      <ItemSelectDialog open={itemDialog !== null} onClose={() => setItemDialog(null)}
        onSelect={handleItemSelect} title="Select Item"
        data={allItems} columns={[
          { key: "item_code", label: "Code" },
          { key: "item_name", label: "Name" },
          { key: "item_description", label: "Description" },
        ]} />
    </Box>
  );
}