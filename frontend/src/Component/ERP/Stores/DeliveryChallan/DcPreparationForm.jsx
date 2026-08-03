import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  Box, Card, CardContent, Typography, TextField, Button, Chip, LinearProgress,
  Table, TableHead, TableRow, TableCell, TableBody, IconButton, Autocomplete,
  Grid, TableContainer, MenuItem, Alert,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SaveIcon from "@mui/icons-material/Save";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import PrintIcon from "@mui/icons-material/Print";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { useToast } from "../../../../context/ToastContext";
import ItemSelectDialog from "../ItemMaster/ItemSelectDialog";
import DeliveryChallanPreview from "./DeliveryChallanPreview";

const API = "/api/erp/stores/delivery-challans";
const ITEMS_API = "/api/erp/stores/items";

const dcTypeLabels = { L: "Replacement", R: "Repair", M: "Maintenance", J: "Jobwork", S: "Sale on Approval" };
const DEPARTMENTS = ["Production", "Maintenance", "Quality", "Stores", "Engineering", "Planning", "Marketing", "HR", "Accounts", "Purchase", "Other"];

const blankItem = () => ({ tempId: Date.now() + Math.random(), item_grp: "", wo_no: "", hs_code: "", tag: "", opn1: "", opn2: "", opn3: "", item_id: "", item_code: "", item_name: "", uom: "", unit_id: "", qty: "", rate: "", remarks: "", req_date: "" });

const toIsoUtc = (localStr) => {
  if (!localStr) return null;
  const d = new Date(localStr);
  return isNaN(d) ? null : d.toISOString();
};

const pad2 = (n) => String(n).padStart(2, "0");
// Draft reference number = next real DC number (last + 1) + current time HHMMSS
// (e.g. last real "7" + "114224" = "8114224") so it previews the number it gets on approval.
const draftRef = (lastNumber) => {
  const d = new Date();
  return `${Number(lastNumber) + 1}${pad2(d.getHours())}${pad2(d.getMinutes())}${pad2(d.getSeconds())}`;
};

const toLocalInput = (iso) => {
  const d = new Date(iso);
  if (isNaN(d)) return "";
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};

const isSameDay = (a, b) => {
  const da = new Date(a);
  const db = new Date(b);
  return !isNaN(da) && !isNaN(db) && da.getFullYear() === db.getFullYear() && da.getMonth() === db.getMonth() && da.getDate() === db.getDate();
};

const fmtNum = (v) => {
  const n = Number(v);
  if (isNaN(n)) return "0";
  return n % 1 === 0 ? String(n) : n.toFixed(2).replace(/\.?0+$/, "");
};

const fmtInput = (v) => {
  if (v === null || v === undefined || v === "") return "";
  const n = Number(v);
  return isNaN(n) ? "" : String(n);
};

const validateItems = (items, showToast) => {
  const requiredFields = { item_grp: "Item Group", wo_no: "W.O#", hs_code: "HSN Code", item_code: "Item Code", qty: "Quantity", rate: "Rate" };
  for (let i = 0; i < items.length; i++) {
    const r = items[i];
    for (const [key, label] of Object.entries(requiredFields)) {
      const raw = r[key];
      if (raw === null || raw === undefined || String(raw).trim() === "") {
        showToast(`Row ${i + 1}: ${label} cannot be empty`, "warning");
        return false;
      }
    }
  }
  return true;
};

export default function DcPreparationForm() {
  const navigate = useNavigate();
  const { dcCode, id } = useParams();
  const { showToast } = useToast();
  const [saving, setSaving] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [showPrint, setShowPrint] = useState(false);
  const [items, setItems] = useState([blankItem()]);
  const [masterItems, setMasterItems] = useState([]);
  const [picker, setPicker] = useState(null);
  const [suppliers, setSuppliers] = useState([]);
  const [supplierPicker, setSupplierPicker] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [empPicker, setEmpPicker] = useState(false);
  const reqDateRef = useRef(null);
  const [form, setForm] = useState({
    dc_type: dcCode || "S",
    dc_date: new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16),
    dc_no: "",
    requested_by: "",
    prepared_by: localStorage.getItem("empId") || "",
    department: "",
    party_name: "",
    party_id: "",
    req_date: "",
    returnable: false,
    expected_return_date: "",
  });

  const isEdit = Boolean(id) && window.location.pathname.includes('/edit/') && isSameDay(form.dc_date, new Date());
  const isView = Boolean(id) && (window.location.pathname.includes('/view/') || (window.location.pathname.includes('/edit/') && !isSameDay(form.dc_date, new Date())));
  const isDateLocked = Boolean(id) && window.location.pathname.includes('/edit/') && !isSameDay(form.dc_date, new Date());
  // Jobwork and Sale on Approval share the extended grid (W.O#, Tag, Ops, HS Code, Req. Date) layout.
  const isJobwork = form.dc_type === "J" || form.dc_type === "S";

  useEffect(() => {
    const stored = localStorage.getItem("empName") || localStorage.getItem("userName") || "";
    setForm((f) => ({ ...f, requested_by: stored }));
    const reqs = [
      axios.get(ITEMS_API, { params: { is_active: true } }).then(({ data }) => setMasterItems(data)).catch(() => []),
      axios.get("/api/erp/purchase/suppliers").then(({ data }) => setSuppliers(data)).catch(() => []),
      axios.get("/api/employees").then(({ data }) => setEmployees(Array.isArray(data) ? data : [])).catch(() => []),
    ];
    // Only new (draft) challans preview the next DC number; it is issued at approval.
    if (!id) reqs.push(axios.get(`${API}/next-number`).then(({ data }) => setForm((f) => ({ ...f, dc_no: draftRef(data.last_number ?? "0") }))).catch(() => {}));
    Promise.all(reqs).finally(() => {
      if (!id) setInitialLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!id) return;
    axios.get(`${API}/${id}`).then(({ data }) => {
      setForm({
        dc_type: data.dc_type || "S",
        dc_date: data.dc_date ? toLocalInput(data.dc_date) : new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16),
        dc_no: data.dc_no || data.draft_no || "",
        requested_by: data.requested_by || "",
        prepared_by: data.prepared_by || localStorage.getItem("empId") || "",
        department: data.department || "",
        party_name: data.party_name || "",
        party_id: String(data.party_id || ""),
        req_date: data.req_date ? data.req_date.slice(0, 10) : "",
        returnable: Boolean(data.returnable),
        expected_return_date: data.expected_return_date ? data.expected_return_date.slice(0, 10) : "",
      });
      setItems(data.items?.length ? data.items.map((i) => ({
        tempId: Date.now() + Math.random(),
        item_grp: i.item_grp || "",
        wo_no: i.wo_no || "",
        hs_code: i.hs_code || "",
        tag: i.tag || "",
        opn1: i.opn1 || "",
        opn2: i.opn2 || "",
        opn3: i.opn3 || "",
        item_id: i.item_id || "",
        item_code: i.item_code || "",
        item_name: i.item_name || "",
        uom: i.unit || i.item?.unit?.short_name || i.item?.unit?.name || "",
        unit_id: i.unit_id || null,
        qty: fmtInput(i.quantity),
        rate: fmtInput(i.rate),
        remarks: i.remarks || "",
        req_date: i.req_date || "",
      })) : [blankItem()]);
      // Drafts carry no real number until approval. Use the stored draft reference (fixed at save)
      // so it never changes when later DCs are approved; fall back to a local-time computation only
      // for legacy drafts saved before the reference was persisted.
      if (!data.dc_no && !data.draft_no) {
        const last = Number(data.last_number ?? "0") + 1;
        const raw = data.updated_at || data.dc_date;
        const d = raw ? new Date(raw) : new Date();
        const src = isNaN(d) ? new Date() : d;
        const ref = `${last}${pad2(src.getHours())}${pad2(src.getMinutes())}${pad2(src.getSeconds())}`;
        setForm((f) => ({ ...f, dc_no: ref }));
      }
    }).catch(() => {
      showToast("Failed to load DC", "error");
      navigate(`/stores/delivery-challans?type=${form.dc_type}`);
    }).finally(() => setInitialLoading(false));
  }, [id]);

  // Jobwork challans are always raised by Production — no department selection needed.
  useEffect(() => {
    if (isJobwork) setForm((f) => ({ ...f, department: f.department || "Production" }));
  }, [isJobwork]);

  useEffect(() => {
    const handler = (e) => { if ((e.ctrlKey || e.metaKey) && e.key === "Enter") { e.preventDefault(); handleSave(); } };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [form, items]);

  const handleChange = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  // Header Req. Date is propagated to every grid item (e.g. Jobwork rows).
  const handleReqDate = (e) => {
    const v = e.target.value;
    setForm((f) => ({ ...f, req_date: v }));
    setItems((prev) => prev.map((r) => ({ ...r, req_date: v })));
  };
  const updateItem = (tempId, patch) => setItems((prev) => prev.map((r) => r.tempId === tempId ? { ...r, ...patch } : r));
  const removeItem = (tempId) => setItems((prev) => prev.filter((r) => r.tempId !== tempId));
  const availStockOf = (r) => {
    const m = masterItems.find((x) => Number(x.id) === Number(r.item_id));
    return m ? Number(m.current_stock || 0) : null;
  };
  const focusNextInput = (e) => {
    const all = document.querySelectorAll('input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex="0"]:not([data-enter-skip])');
    const idx = Array.from(all).indexOf(e.target);
    if (idx >= 0 && idx < all.length - 1) { e.preventDefault(); all[idx + 1].focus(); }
  };
  const onEnter = (e) => { if (e.key === "Enter" && !e.shiftKey) focusNextInput(e); };

  const pickSupplier = (s) => {
    if (!s) return;
    setForm((f) => ({ ...f, party_id: String(s.id), party_name: s.supplier_name || "" }));
    setSupplierPicker(false);
  };

  const pickEmployee = (e) => {
    if (!e) return;
    setForm((f) => ({ ...f, requested_by: e.ename || e.emp_name || e.name || "" }));
    setEmpPicker(false);
  };

  const pickItem = (sel) => {
    if (!sel) return;
    setItems((prev) => prev.map((r) => r.tempId === picker.rowId ? {
      ...r, item_id: sel.id, item_code: sel.item_code, item_name: sel.item_name,
      uom: sel.unit?.short_name || "", unit_id: sel.unit?.id || null,
      hs_code: sel.hsn_code || "", item_grp: sel.category?.name || sel.group?.name || "",
    } : r));
    setPicker(null);
  };

  const todayStr = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  const maxDateStr = new Date(Date.now() - new Date().getTimezoneOffset() * 60000 + 365 * 24 * 60 * 60000).toISOString().slice(0, 10);
  const reqDateErr = !isView && form.req_date && (form.req_date < todayStr ? "Cannot be earlier than today" : form.req_date > maxDateStr ? "Cannot exceed 1 year" : "");
  const totalQty = items.reduce((s, r) => s + (Number(r.qty) || 0), 0);
  const totalValue = items.reduce((s, r) => s + (Number(r.rate) || 0) * (Number(r.qty) || 0), 0);
  const hsnCodesList = [...new Set(masterItems.map((m) => m.hsn_code).filter(Boolean))].sort();

  const handleSave = useCallback(async () => {
    if (isView) return;
    if (!form.party_name) { showToast("Select supplier", "warning"); return; }
    if (!form.department) { showToast("Select department", "warning"); return; }
    if (!items.some((r) => r.item_id)) { showToast("Add at least one item", "warning"); return; }
    if (!validateItems(items.filter((r) => r.item_id), showToast)) return;
    const missingItem = items.find((r) => r.item_id && availStockOf(r) !== null && (Number(r.qty) || 0) > availStockOf(r));
    if (missingItem) { showToast(`Insufficient stock for ${missingItem.item_code || missingItem.item_name}`, "error"); return; }
    setSaving(true);
    try {
      const payload = { ...form, dc_date: toIsoUtc(form.dc_date), expected_return_date: form.expected_return_date ? new Date(form.expected_return_date).toISOString() : null, party_id: Number(form.party_id) || null, dc_no: form.dc_no || undefined, draft_no: form.dc_no || undefined, items: items.filter((r) => r.item_id).map(({ tempId, uom, qty, value, ...rest }) => ({ ...rest, quantity: qty, unit: uom, req_date: rest.req_date || form.req_date || null })) };
      if (id && isEdit) {
        await axios.put(`${API}/${id}`, payload);
        showToast("DC updated", "success");
      } else {
        await axios.post(API, payload);
        showToast("DC saved as Draft", "success");
      }
      navigate(`/stores/delivery-challans?type=${form.dc_type}`);
    } catch (e) {
      showToast(e.response?.data?.error || "Failed to save", "error");
    } finally { setSaving(false); }
  }, [form, items, id, isEdit, isView]);

  if (initialLoading) return <LinearProgress />;

  const fsx = { "& .MuiInputBase-root": { fontSize: "0.88rem", height: 34, borderRadius: "6px" } };
  const tfsx = {
    "& .MuiInputBase-root": { fontSize: "0.84rem", height: 34 },
    "& .MuiOutlinedInput-notchedOutline": { border: "none" },
    "&:hover .MuiOutlinedInput-notchedOutline": { border: "none" },
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": { border: "none" },
    "& .MuiInputBase-input": { "&::selection": { bgcolor: "#bfdbfe" } },
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1600 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, flexWrap: "wrap", gap: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <IconButton onClick={() => navigate(`/stores/delivery-challans?type=${form.dc_type}`)}><ArrowBackIcon /></IconButton>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>{dcTypeLabels[form.dc_type] || "Sale on Approval"} DC</Typography>
          <Chip label={form.dc_type} size="small" color="primary" />
        </Box>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button variant="outlined" onClick={() => navigate(`/stores/delivery-challans?type=${form.dc_type}`)}>Back</Button>
          {(isView || isEdit) && (
            <Button variant="outlined" startIcon={<PrintIcon />} onClick={() => setShowPrint(true)}>Print</Button>
          )}
          {!isView && (
            <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : id && isEdit ? "Update" : "Save Draft"}
            </Button>
          )}
        </Box>
      </Box>

      {isDateLocked && (
        <Alert severity="warning" sx={{ mb: 2, borderRadius: 2 }}>
          Editing is locked — this challan's date ({form.dc_date ? form.dc_date.slice(0, 10) : ""}) has passed. You can only view and print.
        </Alert>
      )}

      <Card sx={{ borderRadius: "10px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", mb: 3, border: "1px solid #e2e8f0", overflow: "hidden" }}>
        <Box sx={{ px: 2.5, py: 1.2, bgcolor: "#f8fafc", borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: 1 }}>
          <Box sx={{ width: 3, height: 18, bgcolor: "#2563eb", borderRadius: 2 }} />
          <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: "0.85rem", color: "#1e293b", letterSpacing: "0.2px" }}>Header Information</Typography>
        </Box>
        <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
          <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", alignItems: "flex-start" }}>
            <Box sx={{ width: 150 }}>
              <Autocomplete size="small" options={DEPARTMENTS} value={form.department || null}
                onChange={(_, v) => setForm((f) => ({ ...f, department: v || "" }))}
                onKeyDown={(e) => { onEnter(e); }}
                disabled={isView || isJobwork}
                renderInput={(p) => <TextField {...p} label={isJobwork ? "Department" : "Department *"} autoFocus={!isJobwork} sx={fsx} />} />
            </Box>
            <Box sx={{ flex: "1 1 220px", minWidth: 200 }}>
              <TextField size="small" fullWidth label="Supplier *" value={form.party_name} autoFocus={isJobwork}
                onChange={(e) => setForm((f) => ({ ...f, party_name: e.target.value }))}
                onKeyDown={(e) => { if (!isView && (e.key === "F9" || e.key === "ArrowDown")) { e.preventDefault(); setSupplierPicker(true); } onEnter(e); }}
                disabled={isView}
                InputProps={{
                  endAdornment: !isView ? (
                    <IconButton size="small" data-enter-skip onClick={() => setSupplierPicker(true)} edge="end" sx={{ p: 0.3 }}><SearchIcon sx={{ fontSize: 16 }} /></IconButton>
                  ) : undefined,
                }} sx={fsx} />
              {form.party_id && ((s) => {
                if (!s) return null;
                const addr = [s.address_line1, s.address_line2, s.city, s.state, s.pincode].filter(Boolean).join(", ");
                return (
                  <Box sx={{ mt: 0.5, px: 1.5, py: 0.75, bgcolor: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                    <Typography variant="caption" sx={{ color: "#64748b", fontSize: "0.7rem", lineHeight: 1.4 }}>
                      {s.supplier_name}{s.gstin ? " | GST: " + s.gstin : ""}
                      {addr ? <><br />{addr}</> : ""}
                      {s.phone || s.mobile ? <><br />Ph: {s.phone || s.mobile}</> : ""}
                    </Typography>
                  </Box>
                );
              })(suppliers.find((x) => String(x.id) === form.party_id))}
            </Box>
            <Box sx={{ width: 130 }}>
              <TextField size="small" label="Req. Date" type="date" fullWidth value={form.req_date} onChange={handleReqDate} onKeyDown={(e) => { if (!isView && reqDateErr && (e.key === "Enter" || e.key === "Tab")) { e.preventDefault(); } else onEnter(e); }} onBlur={() => { if (reqDateErr) setTimeout(() => reqDateRef.current?.focus(), 10); }} error={Boolean(reqDateErr)} helperText={reqDateErr || " "} InputLabelProps={{ shrink: true }} inputProps={{ min: todayStr, max: maxDateStr }} inputRef={reqDateRef} disabled={isView} sx={fsx} />
            </Box>
            <Box sx={{ flex: "1 1 170px", minWidth: 150 }}>
              <TextField size="small" label="Requested By" fullWidth value={form.requested_by}
                onChange={(e) => setForm((f) => ({ ...f, requested_by: e.target.value }))}
                onKeyDown={(e) => { if (!isView && (e.key === "F9" || e.key === "ArrowDown")) { e.preventDefault(); setEmpPicker(true); } }}
                disabled={isView}
                InputProps={{
                  endAdornment: !isView ? (
                    <IconButton size="small" data-enter-skip onClick={() => setEmpPicker(true)} edge="end" sx={{ p: 0.3 }}><SearchIcon sx={{ fontSize: 16 }} /></IconButton>
                  ) : undefined,
                }} sx={fsx} />
            </Box>
            <Box sx={{ width: 110 }}>
              <TextField size="small" label="Prepared By" fullWidth value={form.prepared_by} disabled sx={fsx} />
            </Box>
            <Box sx={{ width: 80 }}>
              <TextField size="small" label="DC #" fullWidth value={form.dc_no} disabled sx={{ ...fsx, "& .Mui-disabled": { WebkitTextFillColor: "#64748b !important", fontWeight: 600 } }} />
            </Box>
            <Box sx={{ width: 200 }}>
              <TextField size="small" label="DC Date" type="datetime-local" fullWidth value={form.dc_date} disabled InputLabelProps={{ shrink: true }} sx={{ ...fsx, "& .Mui-disabled": { WebkitTextFillColor: "#64748b !important", fontWeight: 600 } }} />
            </Box>
            {form.dc_type === "S" && !isView && (
              <>
                <Box sx={{ width: 110, display: "flex", alignItems: "flex-end" }}>
                  <TextField size="small" fullWidth select label="Returnable" value={form.returnable ? "true" : "false"}
                    onChange={(e) => setForm((f) => ({ ...f, returnable: e.target.value === "true" }))} disabled={isView} sx={fsx}
                    SelectProps={{ native: true }}>
                    <option value="false">No</option>
                    <option value="true">Yes</option>
                  </TextField>
                </Box>
                <Box sx={{ width: 150 }}>
                  <TextField size="small" label="Expected Return" type="date" fullWidth value={form.expected_return_date}
                    onChange={(e) => setForm((f) => ({ ...f, expected_return_date: e.target.value }))} disabled={isView} sx={fsx} />
                </Box>
              </>
            )}
            {form.dc_type === "S" && isView && (
              <>
                <Box sx={{ width: 110 }}>
                  <TextField size="small" label="Returnable" fullWidth value={form.returnable ? "Yes" : "No"} disabled sx={fsx} />
                </Box>
                <Box sx={{ width: 150 }}>
                  <TextField size="small" label="Expected Return" type="date" fullWidth value={form.expected_return_date} disabled sx={fsx} />
                </Box>
              </>
            )}
          </Box>
        </CardContent>
      </Card>

      <Card sx={{ borderRadius: "10px", boxShadow: "0 2px 12px rgba(0,0,0,0.07)", border: "1px solid #cbd5e1", overflow: "hidden" }}>
        <Box sx={{ px: 2.5, py: 1.2, bgcolor: "#f0f4f8", borderBottom: "1px solid #cbd5e1", display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box sx={{ width: 3, height: 18, bgcolor: "#2563eb", borderRadius: 2 }} />
          <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: "0.85rem", color: "#0f172a", letterSpacing: "0.2px" }}>Item Details</Typography>
        </Box>
        <CardContent sx={{ p: "0 !important" }}>
          <TableContainer>
            <Table size="small" sx={{ borderCollapse: "collapse", minWidth: isJobwork ? 1500 : 1050 }}>
              <TableHead>
                <TableRow>
                  {isJobwork
                    ? ["#", "W.O#", "Item Code", "Description", "UOM", "Tag", "Opn1", "Opn2", "Opn3", "Qty", "Rate", "Value", "HS Code", "Req. Date", "Remarks", ""].map((label, i) => (
                        <TableCell key={label} sx={{
                          fontWeight: 700, fontSize: "0.72rem", py: 1, px: 0.7,
                          color: "#1e293b", bgcolor: "#e2e8f0", border: "1px solid #cbd5e1",
                          borderBottom: "2px solid #94a3b8",
                          width: [30, 75, 85, 130, 42, 70, 60, 60, 60, 60, 65, 70, 75, 95, 90, 28][i],
                          textAlign: ["center", "center", null, null, "center", "center", "center", "center", "center", "center", "center", "center", "center", "center", "center", "center"][i] || "left",
                          whiteSpace: "nowrap", textTransform: "uppercase", letterSpacing: "0.3px",
                        }}>{label}</TableCell>
                      ))
                    : ["#", "Grp", "W.O#", "HS", "Item Code", "Description", "UOM", "Qty", "Rate", "Value", "Remarks", ""].map((label, i) => (
                        <TableCell key={label} sx={{
                          fontWeight: 700, fontSize: "0.75rem", py: 1, px: 0.75,
                          color: "#1e293b", bgcolor: "#e2e8f0", border: "1px solid #cbd5e1",
                          borderBottom: "2px solid #94a3b8",
                          width: [30, 70, 75, 75, 85, 130, 42, 60, 65, 70, 90, 28][i],
                          textAlign: ["center", "center", "center", "center", null, null, "center", "center", "center", "center", "center", "center"][i] || "left",
                          whiteSpace: "nowrap", textTransform: "uppercase", letterSpacing: "0.3px",
                        }}>{label}</TableCell>
                      ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {items.map((r, idx) => {
                  const rowBg = idx % 2 === 0 ? "#ffffff" : "#f8fafc";
                  const cs = { py: 0.5, px: 0.6, border: "1px solid #e2e8f0", bgcolor: rowBg, fontSize: "0.84rem" };
                  const availStock = availStockOf(r);
                  const lowStock = availStock !== null && (Number(r.qty) || 0) > availStock;
                  const pickerCell = (
                    <>
                      <TableCell sx={{ ...cs, fontWeight: 600 }} onKeyDown={(e) => { if (!isView && (e.key === "F9" || e.key === "ArrowDown")) { e.preventDefault(); setPicker({ rowId: r.tempId }); } onEnter(e); }}>
                        <Box tabIndex={0} sx={{ display: "flex", alignItems: "center", gap: 0.3, minHeight: 34, cursor: "pointer", outline: "none", "&:focus": { boxShadow: "0 0 0 2px #93c5fd", borderRadius: "4px" } }}
                          onDoubleClick={() => !isView && setPicker({ rowId: r.tempId })}>
                          <Typography variant="body2" sx={{ fontSize: "0.84rem", fontWeight: 600, flex: 1 }}>{r.item_code}</Typography>
                          {!isView && (
                            <IconButton size="small" data-enter-skip sx={{ p: 0.2 }} onClick={() => setPicker({ rowId: r.tempId })}><ArrowDropDownIcon sx={{ fontSize: 18 }} /></IconButton>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell sx={cs} onKeyDown={(e) => { if (!isView && (e.key === "F9" || e.key === "ArrowDown")) { e.preventDefault(); setPicker({ rowId: r.tempId }); } }}>
                        <Box onDoubleClick={() => !isView && setPicker({ rowId: r.tempId })}
                          sx={{ minHeight: 34, lineHeight: "34px", fontSize: "0.84rem" }}>{r.item_name}</Box>
                      </TableCell>
                    </>
                  );
                  return (
                    <TableRow key={r.tempId} hover sx={{ verticalAlign: "top", "&:hover td": { bgcolor: "#f5f7fa" } }}>
                      <TableCell sx={{ ...cs, textAlign: "center", verticalAlign: "middle", fontWeight: 600, color: "#94a3b8", fontSize: "0.8rem", width: 26 }}>{idx + 1}</TableCell>
                      {isJobwork ? (
                        <>
                          <TableCell sx={cs}>
                            <TextField size="small" value={r.wo_no} onChange={(e) => updateItem(r.tempId, { wo_no: e.target.value })}
                              onKeyDown={onEnter} disabled={isView} sx={tfsx} />
                          </TableCell>
                          {pickerCell}
                          <TableCell sx={{ ...cs, textAlign: "center", color: "#64748b" }}>{r.uom}</TableCell>
                          <TableCell sx={cs}>
                            <TextField size="small" value={r.tag} onChange={(e) => updateItem(r.tempId, { tag: e.target.value })}
                              onKeyDown={onEnter} disabled={isView} sx={tfsx} />
                          </TableCell>
                          <TableCell sx={cs}>
                            <TextField size="small" value={r.opn1} onChange={(e) => updateItem(r.tempId, { opn1: e.target.value })}
                              onKeyDown={onEnter} disabled={isView} sx={tfsx} />
                          </TableCell>
                          <TableCell sx={cs}>
                            <TextField size="small" value={r.opn2} onChange={(e) => updateItem(r.tempId, { opn2: e.target.value })}
                              onKeyDown={onEnter} disabled={isView} sx={tfsx} />
                          </TableCell>
                          <TableCell sx={cs}>
                            <TextField size="small" value={r.opn3} onChange={(e) => updateItem(r.tempId, { opn3: e.target.value })}
                              onKeyDown={onEnter} disabled={isView} sx={tfsx} />
                          </TableCell>
                          <TableCell sx={{ ...cs, textAlign: "right" }}>
                            <TextField size="small" type="text" inputMode="decimal" value={r.qty} error={lowStock} onChange={(e) => updateItem(r.tempId, { qty: e.target.value })}
                              inputProps={{ style: { textAlign: "right", fontSize: "0.84rem" } }}
                              onKeyDown={onEnter} disabled={isView} sx={tfsx} />
                            {lowStock && (
                              <Typography variant="caption" sx={{ display: "block", textAlign: "right", color: "#dc2626", fontSize: "0.6rem", fontWeight: 600, mt: 0.2 }}>
                                Insufficient stock ({availStock})
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell sx={{ ...cs, textAlign: "right" }}>
                            <TextField size="small" type="text" inputMode="decimal" value={r.rate} onChange={(e) => updateItem(r.tempId, { rate: e.target.value })}
                              inputProps={{ style: { textAlign: "right", fontSize: "0.84rem" } }}
                              onKeyDown={onEnter} disabled={isView} sx={tfsx} />
                          </TableCell>
                          <TableCell sx={{ ...cs, textAlign: "right", verticalAlign: "middle", fontWeight: 700, color: "#059669" }}>
                            {fmtNum((Number(r.qty) || 0) * (Number(r.rate) || 0))}
                          </TableCell>
                          <TableCell sx={cs}>
                            <Autocomplete size="small" freeSolo options={hsnCodesList} value={r.hs_code}
                              onChange={(_, v) => updateItem(r.tempId, { hs_code: v || "" })}
                              onInputChange={(_, v) => updateItem(r.tempId, { hs_code: v || "" })}
                              disabled={isView}
                              renderInput={(p) => <TextField {...p} onKeyDown={onEnter} sx={tfsx} />} />
                          </TableCell>
                          <TableCell sx={cs}>
                            <TextField size="small" type="date" value={r.req_date} onChange={(e) => updateItem(r.tempId, { req_date: e.target.value })}
                              InputLabelProps={{ shrink: true }} disabled={isView} sx={tfsx} />
                          </TableCell>
                          <TableCell sx={cs}>
                            <TextField size="small" value={r.remarks} onChange={(e) => updateItem(r.tempId, { remarks: e.target.value })}
                              onKeyDown={onEnter} disabled={isView} sx={tfsx} />
                          </TableCell>
                        </>
                      ) : (
                        <>
                          <TableCell sx={cs}>
                            <TextField size="small" value={r.item_grp} onChange={(e) => updateItem(r.tempId, { item_grp: e.target.value })}
                              onKeyDown={onEnter} disabled={isView} sx={tfsx} />
                          </TableCell>
                          <TableCell sx={cs}>
                            <TextField size="small" value={r.wo_no} onChange={(e) => updateItem(r.tempId, { wo_no: e.target.value })}
                              onKeyDown={onEnter} disabled={isView} sx={tfsx} />
                          </TableCell>
                          <TableCell sx={cs}>
                            <Autocomplete size="small" freeSolo options={hsnCodesList} value={r.hs_code}
                              onChange={(_, v) => updateItem(r.tempId, { hs_code: v || "" })}
                              onInputChange={(_, v) => updateItem(r.tempId, { hs_code: v || "" })}
                              disabled={isView}
                              renderInput={(p) => <TextField {...p} onKeyDown={onEnter} sx={tfsx} />} />
                          </TableCell>
                          {pickerCell}
                          <TableCell sx={{ ...cs, textAlign: "center", color: "#64748b" }}>{r.uom}</TableCell>
                          <TableCell sx={{ ...cs, textAlign: "right" }}>
                            <TextField size="small" type="text" inputMode="decimal" value={r.qty} error={lowStock} onChange={(e) => updateItem(r.tempId, { qty: e.target.value })}
                              inputProps={{ style: { textAlign: "right", fontSize: "0.84rem" } }}
                              onKeyDown={onEnter} disabled={isView} sx={tfsx} />
                            {lowStock && (
                              <Typography variant="caption" sx={{ display: "block", textAlign: "right", color: "#dc2626", fontSize: "0.6rem", fontWeight: 600, mt: 0.2 }}>
                                Insufficient stock ({availStock})
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell sx={{ ...cs, textAlign: "right" }}>
                            <TextField size="small" type="text" inputMode="decimal" value={r.rate} onChange={(e) => updateItem(r.tempId, { rate: e.target.value })}
                              inputProps={{ style: { textAlign: "right", fontSize: "0.84rem" } }}
                              onKeyDown={onEnter} disabled={isView} sx={tfsx} />
                          </TableCell>
                          <TableCell sx={{ ...cs, textAlign: "right", verticalAlign: "middle", fontWeight: 700, color: "#059669" }}>
                            {fmtNum((Number(r.qty) || 0) * (Number(r.rate) || 0))}
                          </TableCell>
                          <TableCell sx={cs}>
                            <TextField size="small" value={r.remarks} onChange={(e) => updateItem(r.tempId, { remarks: e.target.value })}
                              onKeyDown={onEnter} disabled={isView} sx={tfsx} />
                          </TableCell>
                        </>
                      )}
                      <TableCell sx={{ ...cs, textAlign: "center" }}>
                        {!isView && (
                          <IconButton size="small" color="error" data-enter-skip onClick={() => removeItem(r.tempId)}><DeleteIcon sx={{ fontSize: 16 }} /></IconButton>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
              <tfoot>
                <TableRow>
                  {isJobwork ? (
                    <>
                      <TableCell colSpan={9} sx={{ fontWeight: 700, fontSize: "0.82rem", py: 0.8, px: 1, border: "1px solid #cbd5e1", borderTop: "2px solid #94a3b8", bgcolor: "#e2e8f0", color: "#0f172a" }}>TOTALS</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: "0.9rem", py: 0.8, px: 1, textAlign: "right", bgcolor: "#86efac", border: "1px solid #cbd5e1", borderTop: "2px solid #94a3b8", color: "#064e3b" }}>{totalQty}</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: "0.82rem", py: 0.8, border: "1px solid #cbd5e1", borderTop: "2px solid #94a3b8", bgcolor: "#e2e8f0" }}></TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: "0.9rem", py: 0.8, px: 1, textAlign: "right", bgcolor: "#86efac", border: "1px solid #cbd5e1", borderTop: "2px solid #94a3b8", color: "#064e3b" }}>{fmtNum(totalValue)}</TableCell>
                      <TableCell colSpan={4} sx={{ border: "1px solid #cbd5e1", borderTop: "2px solid #94a3b8", bgcolor: "#e2e8f0" }}></TableCell>
                    </>
                  ) : (
                    <>
                      <TableCell colSpan={6} sx={{ fontWeight: 700, fontSize: "0.82rem", py: 0.8, px: 1, border: "1px solid #cbd5e1", borderTop: "2px solid #94a3b8", bgcolor: "#e2e8f0", color: "#0f172a" }}>TOTALS</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: "0.82rem", py: 0.8, border: "1px solid #cbd5e1", borderTop: "2px solid #94a3b8", bgcolor: "#e2e8f0" }}></TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: "0.9rem", py: 0.8, px: 1, textAlign: "right", bgcolor: "#86efac", border: "1px solid #cbd5e1", borderTop: "2px solid #94a3b8", color: "#064e3b" }}>{totalQty}</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: "0.82rem", py: 0.8, border: "1px solid #cbd5e1", borderTop: "2px solid #94a3b8", bgcolor: "#e2e8f0" }}></TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: "0.9rem", py: 0.8, px: 1, textAlign: "right", bgcolor: "#86efac", border: "1px solid #cbd5e1", borderTop: "2px solid #94a3b8", color: "#064e3b" }}>{fmtNum(totalValue)}</TableCell>
                      <TableCell colSpan={2} sx={{ border: "1px solid #cbd5e1", borderTop: "2px solid #94a3b8", bgcolor: "#e2e8f0" }}></TableCell>
                    </>
                  )}
                </TableRow>
              </tfoot>
            </Table>
          </TableContainer>
          {!isView && (
            <Box sx={{ px: 2, py: 1.2, borderTop: "1px solid #cbd5e1", bgcolor: "#fafafa" }}>
              <Button size="small" startIcon={<AddCircleOutlineIcon />} onClick={() => { setItems((p) => [...p, { ...blankItem(), req_date: form.req_date }]); setTimeout(() => { const rows = document.querySelectorAll("tbody tr"); const last = rows[rows.length - 1]; if (last) { const inp = last.querySelector("input:not([disabled])"); inp?.focus(); } }, 50); }} sx={{ textTransform: "none", fontWeight: 600, fontSize: "0.84rem", color: "#2563eb" }}>Add Item</Button>
            </Box>
          )}
        </CardContent>
      </Card>

      <ItemSelectDialog
        open={Boolean(picker)} title="Select Item"
        data={[...masterItems].sort((a, b) => a.id - b.id).map((m) => ({ ...m, group_name: m.category?.name || m.group?.name || "-" }))}
        columns={[
          { key: "item_code", label: "Code" },
          { key: "item_name", label: "Name" },
          { key: "current_stock", label: "Stock" },
          { key: "group_name", label: "Group" },
        ]}
        onClose={() => setPicker(null)}
        onSelect={(it) => pickItem(it)}
      />
      <ItemSelectDialog
        open={supplierPicker} title="Select Supplier"
        data={suppliers}
        columns={[
          { key: "supplier_name", label: "Name" },
          { key: "gstin", label: "GST" },
          { key: "city", label: "City" },
        ]}
        onClose={() => setSupplierPicker(false)}
        onSelect={(s) => pickSupplier(s)}
      />
      <ItemSelectDialog
        open={empPicker} title="Select Employee"
        data={employees}
        columns={[
          { key: "empid", label: "Emp ID" },
          { key: "ename", label: "Name" },
          { key: "deptname", label: "Department" },
        ]}
        onClose={() => setEmpPicker(false)}
        onSelect={(e) => pickEmployee(e)}
      />
      {showPrint && <DeliveryChallanPreview data={{ ...form, items: items.filter((r) => r.item_id), supplier: suppliers.find((x) => String(x.id) === form.party_id) }} onClose={() => setShowPrint(false)} />}
    </Box>
  );
}
