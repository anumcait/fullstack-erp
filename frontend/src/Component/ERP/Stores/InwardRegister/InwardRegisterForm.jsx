import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Box, Card, CardContent, Typography, TextField, Button, IconButton, Table, TableHead, TableRow,
  TableCell, TableBody, TableContainer, LinearProgress, Chip, alpha,
  Autocomplete, Tooltip, Select, MenuItem, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SaveIcon from "@mui/icons-material/Save";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import InventoryIcon from "@mui/icons-material/Inventory";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import axios from "axios";
import { useNavigate, useParams, useSearchParams, useLocation } from "react-router-dom";
import { useToast } from "../../../../context/ToastContext";
import InwardShuttle from "./InwardShuttle";
import CountedTextArea from "../../../Common/CountedTextArea";

const API = "/api/erp/stores/inward-registers";
const DC_API = "/api/erp/stores/delivery-challans";
const SUPPLIERS_API = "/api/erp/purchase/suppliers";

const typeTabs = [
  { code: "L", label: "Replacement" },
  { code: "R", label: "Repair" },
  { code: "M", label: "Maintenance" },
  { code: "J", label: "Jobwork" },
  { code: "S", label: "Sale on Approval" },
];

const typeColors = { L: "#0f766e", R: "#be185d", M: "#155e75", J: "#4338ca", S: "#1565c0" };
const typeLabels = { L: "Replacement", R: "Repair", M: "Maintenance", J: "Jobwork", S: "Sale on Approval" };

const DEPARTMENTS = [
  "GENERAL", "PRODUCTION", "MAINTENANCE", "QUALITY", "STORES",
  "ENGINEERING", "PLANNING", "MARKETING", "HR", "ACCOUNTS", "PURCHASE",
];

const fsx = {
  "& label": { fontSize: "0.89rem", color: "#475569", fontWeight: 600 },
  "& .MuiInputBase-input": { fontSize: "0.95rem", color: "#334155" },
};

const localDateTime = () => new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16);
const localPrevDate = () => new Date(Date.now() - new Date().getTimezoneOffset() * 60000 - 86400000).toISOString().slice(0, 10);

const fmtNum = (v) => {
  const n = Number(v);
  return isNaN(n) ? "0" : n % 1 === 0 ? String(n) : n.toFixed(2).replace(/\.?0+$/, "");
};

const fmtDcDateTime = (d) => {
  if (!d) return "-";
  const date = new Date(d);
  if (isNaN(date)) return String(d).slice(0, 10);
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yy = String(date.getFullYear()).slice(-2);
  const hh = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  return `${dd}-${mm}-${yy} ${hh}.${min}`;
};

const rowQtyError = (it) => {  const q = Number(it.qty_supplied || 0);
  const d = Number(it.dc_qty || 0);
  const p = it.qty_pending != null && it.qty_pending >= 0 ? Number(it.qty_pending) : d;
  if (String(it.qty_supplied).trim() === "") return "";
  if (q < 0) return "Cannot be negative";
  if (q > d) return `Exceeds DC qty (${fmtNum(d)})`;
  if (q > p) return `Exceeds pending (${fmtNum(p)})`;
  return "";
};

export default function InwardRegisterForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { showToast } = useToast();

  const readOnly = location.pathname.includes("/view/");
  const dcTypeTab = searchParams.get("type") || typeTabs[0].code;
  const prefillDc = searchParams.get("prefill_dc");
  const partyLocked = Boolean(prefillDc);
  const activeColor = typeColors[dcTypeTab] || "#059669";

  const [form, setForm] = useState({
    ir_no: "",
    ir_date: localDateTime(),
    inward_date: localPrevDate(),
    dc_type: dcTypeTab,
    dept_code: "",
    year: new Date().getFullYear().toString(),
    party_id: "", party_name: "",
    vehicle_no: "", driver_name: "",
    prepared_by: localStorage.getItem("empName") || "",
    requested_by: localStorage.getItem("empName") || "",
    remarks: "",
  });
  const [items, setItems] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [selectedDcs, setSelectedDcs] = useState([]);
  const [pendingDcs, setPendingDcs] = useState([]);
  const [checkedItemKeys, setCheckedItemKeys] = useState([]);
  const [loadedItemKeys, setLoadedItemKeys] = useState([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [shuttleOpen, setShuttleOpen] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const partyRef = useRef(null);
  const inwardDateRef = useRef(null);
  const dcRef = useRef(null);
  const qtyRefs = useRef({});
  const [colWidth, setColWidth] = useState({});
  const resizingCol = useRef(null);

  const colWidthOf = (key) => colWidth[key] || colMin[key] || 120;

  const startResize = (e, key) => {
    if (readOnly) return;
    e.preventDefault();
    resizingCol.current = { key, startX: e.clientX, startW: colWidthOf(key) };
    const onMove = (ev) => {
      if (!resizingCol.current) return;
      const { key: k, startX, startW } = resizingCol.current;
      const next = Math.max(colMin[k], startW + (ev.clientX - startX));
      setColWidth((prev) => ({ ...prev, [k]: next }));
    };
    const onUp = () => {
      resizingCol.current = null;
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  useEffect(() => {
    axios.get(SUPPLIERS_API).then(({ data }) => setSuppliers(Array.isArray(data) ? data : [])).catch(() => []);
  }, []);

  useEffect(() => {
    if (readOnly) return;
    const handler = (e) => {
      if (e.key.toLowerCase() === "s" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        requestSave();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form, items, id, readOnly]);

  const buildRow = (dc, it, tempId, slNo) => {
    const qty = Number(it.quantity) || 0;
    const pending = it.qty_pending != null && it.qty_pending >= 0 ? Number(it.qty_pending) : (qty - Number(it.qty_received || 0));
    return {
      tempId,
      dc_id: dc.id,
      sl_no: slNo || "",
      dc_no_display: dc.dc_no || dc.draft_no,
      dc_date: dc.dc_date,
      dc_item_id: it.id,
      item_id: it.item_id || null,
      item_code: it.item_code || "",
      work_order: it.wo_no || it.work_order || "",
      item_name: it.item_name || "",
      uom: it.unit || it.item?.unit?.short_name || "",
      unit_id: it.unit_id || null,
      dc_qty: qty,
      qty_pending: pending,
      qty_supplied: "",
      opening: "",
      rate: Number(it.rate) || 0,
      remarks: "",
    };
  };

  const addDc = (dc) => {
    if (!dc) return;
    setSelectedDcs((prev) => (prev.some((d) => d.id === dc.id) ? prev : [...prev, dc]));
    if (dc.department) {
      setForm((f) => (f.dept_code ? f : { ...f, dept_code: dc.department }));
    }
  };

  const loadDcItems = (dc) => {
    if (!dc) return;
    const rows = (dc.items || []).map((it, idx) => buildRow(dc, it, Date.now() + Math.random() + idx, String(idx + 1)));
    const keys = (dc.items || []).map((it) => `${dc.id}_${it.id}`);
    setItems((prev) => {
      const existing = new Set(prev.map((r) => `${r.dc_id}_${r.dc_item_id}`));
      return [...prev, ...rows.filter((r) => !existing.has(`${r.dc_id}_${r.dc_item_id}`))];
    });
    setLoadedItemKeys((prev) => [...new Set([...prev, ...keys])]);
  };

  const handleDcChange = (_, newVal) => {
    if (readOnly) return;
    const next = newVal || [];
    const curIds = new Set(selectedDcs.map((d) => d.id));
    const nextIds = new Set(next.map((d) => d.id));
    for (const id of nextIds) {
      if (!curIds.has(id)) {
        const dc = pendingDcs.find((d) => d.id === id) || next.find((d) => d.id === id);
        if (dc) addDc(dc);
      }
    }
    for (const id of curIds) {
      if (!nextIds.has(id)) handleRemoveDc(id);
    }
  };

  const handleRemoveDc = (dcId) => {
    setSelectedDcs((prev) => prev.filter((d) => d.id !== dcId));
    setItems((prev) => prev.filter((it) => it.dc_id !== dcId));
    setCheckedItemKeys((prev) => prev.filter((k) => !k.startsWith(`${dcId}_`)));
    setLoadedItemKeys((prev) => prev.filter((k) => !k.startsWith(`${dcId}_`)));
  };

  const handleRemoveItem = (it) => {
    const key = `${it.dc_id}_${it.dc_item_id}`;
    setItems((prev) => prev.filter((r) => r.tempId !== it.tempId));
    setLoadedItemKeys((prev) => prev.filter((k) => k !== key));
    setCheckedItemKeys((prev) => prev.filter((k) => k !== key));
  };

  const toggleItemChecked = (key) => {
    setCheckedItemKeys((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
  };

  const loadCheckedItems = () => {
    const toLoad = checkedItemKeys.filter((k) => !loadedItemKeys.includes(k));
    if (toLoad.length === 0) { showToast("Select items to load", "warning"); return; }
    const rows = [];
    const keys = [];
    let rIdx = 0;
    for (const k of toLoad) {
      const found = itemShuttleData.find((x) => x.key === k);
      if (!found) continue;
      rows.push(buildRow(found.dc, found.it, Date.now() + Math.random(), String(items.length + rIdx + 1)));
      rIdx += 1;
      keys.push(k);
    }
    if (rows.length === 0) return;
    setItems((prev) => {
      const existing = new Set(prev.map((r) => `${r.dc_id}_${r.dc_item_id}`));
      return [...prev, ...rows.filter((r) => !existing.has(`${r.dc_id}_${r.dc_item_id}`))];
    });
    setLoadedItemKeys((prev) => [...prev, ...keys]);
    setCheckedItemKeys((prev) => prev.filter((k) => !keys.includes(k)));
    showToast(`${keys.length} item(s) loaded`, "success");
  };

  useEffect(() => {
    if (id) return;
    axios.get(`${API}/next-number`).then(({ data }) => setForm((f) => ({ ...f, ir_no: data.ir_no }))).catch(() => {});
    axios.get(`${API}/pending-dcs`, { params: { dc_type: dcTypeTab } }).then(({ data }) => {
      const approved = data.filter((d) => d.status === "Approved" && d.has_pending);
      setPendingDcs(approved);
      if (!prefillDc) return;
      const dc = approved.find((d) => d.id === Number(prefillDc));
      if (dc) {
        addDc(dc);
        loadDcItems(dc);
        setForm((f) => ({ ...f, party_id: dc.party_id ? String(dc.party_id) : "", party_name: dc.party_name || "" }));
      } else {
        axios.get(`${DC_API}/${prefillDc}`).then(({ data: dc }) => {
          addDc(dc);
          loadDcItems(dc);
          setForm((f) => ({ ...f, party_id: dc.party_id ? String(dc.party_id) : "", party_name: dc.party_name || "" }));
        }).catch(() => {});
      }
    }).catch(() => []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, dcTypeTab, prefillDc]);

  useEffect(() => {
    if (!id && !readOnly) {
      const t = setTimeout(() => inwardDateRef.current?.focus?.(), 100);
      return () => clearTimeout(t);
    }
  }, [id, readOnly]);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    axios.get(`${API}/${id}`).then(({ data }) => {
      const irDcs = (data.deliveryChallans || []).map((d) => ({ ...d, is_linked: true }));
      const pendingMap = {};
      for (const dc of irDcs) {
        for (const it of (dc.items || [])) {
          pendingMap[`${dc.id}_${it.id}`] = it.qty_pending != null && it.qty_pending >= 0 ? Number(it.qty_pending) : null;
        }
      }
      const dcItems = (data.items || []).map((it) => {
        const pend = pendingMap[`${it.dc_id}_${it.dc_item_id}`];
        const cleanNum = (v) => { const n = Number(v); return isNaN(n) ? "" : String(n % 1 === 0 ? n : n); };
        return {
          ...it,
          tempId: Date.now() + Math.random(),
          qty_pending: pend != null ? pend : (Number(it.dc_qty || 0) - Number(it.qty_received || 0)),
          qty_accepted: it.qty_accepted || it.accepted_qty || it.qty_supplied || "",
          qty_supplied: cleanNum(it.qty_supplied),
          dc_qty: cleanNum(it.dc_qty),
          opening: cleanNum(it.opening),
          work_order: it.work_order || "",
        };
      });
      setForm({
        ir_no: data.ir_no || "",
        ir_date: data.ir_date ? new Date(data.ir_date).toISOString().slice(0, 16) : "",
        inward_date: data.inward_date ? data.inward_date.slice(0, 10) : localPrevDate(),
        dc_type: data.dc_type || dcTypeTab,
        dept_code: data.dept_cd || "",
        year: data.year || new Date().getFullYear().toString(),
        party_id: data.supplier_id ? String(data.supplier_id) : "",
        party_name: data.party_name || "",
        vehicle_no: data.vehicle_no || "",
        driver_name: data.driver_name || "",
        prepared_by: data.prepared_by || "",
        requested_by: data.requested_by || "",
        remarks: data.notes || "",
      });
      setItems(dcItems);
      setSelectedDcs(irDcs);
      setLoadedItemKeys(dcItems.map((it) => `${it.dc_id}_${it.dc_item_id}`));
      setCheckedItemKeys([]);
      axios.get(`${API}/pending-dcs`, { params: { dc_type: data.dc_type || dcTypeTab } }).then(({ data: dcs }) => {
        const existingIds = new Set(irDcs.map((d) => d.id));
        setPendingDcs(dcs.filter((d) => d.status === "Approved" && d.has_pending && !existingIds.has(d.id)));
      }).catch(() => []);
    }).catch(() => showToast("Failed to load IR", "error")).finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const itemShuttleData = useMemo(() => {
    const out = [];
    for (const dc of selectedDcs) {
      for (const it of (dc.items || [])) {
        const qty = Number(it.quantity) || 0;
        out.push({
          key: `${dc.id}_${it.id}`,
          dc,
          it,
          item_code: it.item_code || "",
          item_name: it.item_name || "",
          qty,
          qty_pending: it.qty_pending != null && it.qty_pending >= 0 ? Number(it.qty_pending) : (qty - Number(it.qty_received || 0)),
          uom: it.unit || it.item?.unit?.short_name || "",
          rate: Number(it.rate) || 0,
          work_order: it.wo_no || it.work_order || "",
        });
      }
    }
    return out;
  }, [selectedDcs]);

  const itemRenderRow = (it, _state) => (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.6, flex: 1, flexWrap: "wrap" }}>
      <Chip label={it.item_code || "-"} size="small" sx={{ fontSize: "0.66rem", height: 20, fontWeight: 700, bgcolor: "#e0e7ff", color: "#4338ca" }} />
      <Typography variant="body2" component="span" sx={{ fontWeight: 600, fontSize: "0.78rem", color: "#334155", flex: 1, minWidth: 140 }}>{it.item_name}</Typography>
      <Chip label={`Qty ${fmtNum(it.qty)}${it.uom ? ` ${it.uom}` : ""}`} size="small" sx={{ fontSize: "0.62rem", height: 18, bgcolor: "#eef2f7", color: "#64748b" }} />
      <Chip label={`Pend ${fmtNum(it.qty_pending)}`} size="small" sx={{ fontSize: "0.62rem", height: 18, bgcolor: it.qty_pending > 0 ? "#fef3c7" : "#f1f5f9", color: it.qty_pending > 0 ? "#b45309" : "#94a3b8" }} />
      {_state?.fixed && <Chip size="small" label="Loaded" sx={{ fontSize: "0.62rem", height: 18, bgcolor: "#dcfce7", color: "#2e7d32" }} />}
    </Box>
  );

  const updateItem = (i, patch) => setItems((prev) => prev.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));

  const validate = () => {
    const fail = (field, msg) => {
      setFieldErrors((prev) => ({ ...prev, [field]: msg }));
      showToast(msg, "error");
      const focusMap = {
        party: partyRef, inward_date: inwardDateRef, dc: dcRef,
      };
      const el = focusMap[field]?.current;
      if (el) { setTimeout(() => el.focus?.(), 60); }
      return false;
    };

    if (!form.party_name.trim() || !form.party_id) return fail("party", "Party is required");
    if (selectedDcs.length === 0) return fail("dc", "Select at least one delivery challan");
    if (items.length === 0) return fail("dc", "Load at least one item");
    if (!form.inward_date) return fail("inward_date", "Inward Date is required");
    const todayStr = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);
    if (form.inward_date > todayStr) return fail("inward_date", "Inward Date cannot be greater than today");

    const seen = new Set();
    const failQty = (rowNo, it, msg) => {
      setFieldErrors((prev) => ({ ...prev, [`qty_${rowNo}`]: msg }));
      const qtyEl = qtyRefs.current[it.tempId];
      if (qtyEl) { setTimeout(() => qtyEl.focus?.(), 60); }
      return false;
    };

    for (const [i, it] of items.entries()) {
      const rowNo = i + 1;

      const dupKey = `${it.dc_id}_${it.dc_item_id}`;
      if (seen.has(dupKey)) return fail("dc", `Row ${rowNo}: duplicate item already loaded`);
      seen.add(dupKey);

      if (!it.item_id && !it.item_code) return fail("dc", `Row ${rowNo}: item is missing`);

      const raw = String(it.qty_supplied ?? "").trim();
      if (raw === "" || raw === "-") return failQty(rowNo, it, "Qty Supp is required");
      const q = Number(it.qty_supplied);
      if (isNaN(q) || q <= 0) return failQty(rowNo, it, "Qty Supp must be greater than 0");

      const err = rowQtyError(it);
      if (err) return failQty(rowNo, it, err);
    }
    setFieldErrors({});
    return true;
  };

  const save = async () => {
    if (readOnly) return;
    setSaving(true);
    try {
      const payload = {
        ir_date: form.ir_date,
        inward_date: form.inward_date,
        dc_type: form.dc_type,
        dept_code: form.dept_code,
        year: form.year,
        party_id: Number(form.party_id) || null,
        party_name: form.party_name,
        vehicle_no: form.vehicle_no || null,
        driver_name: form.driver_name || null,
        prepared_by: form.prepared_by,
        requested_by: form.requested_by,
        remarks: form.remarks,
        dc_ids: selectedDcs.map((d) => d.id),
        items: items.map((it) => ({
          dc_id: it.dc_id, dc_item_id: it.dc_item_id, item_id: it.item_id,
          item_code: it.item_code, item_name: it.item_name, uom: it.uom, unit_id: it.unit_id,
          sl_no: it.sl_no || null,
          dc_qty: it.dc_qty, qty_supplied: it.qty_supplied || 0,
          work_order: it.work_order, opening: it.opening,
          rate: it.rate, remarks: it.remarks,
        })),
      };
      if (id) { await axios.put(`${API}/${id}`, payload); }
      else { await axios.post(API, payload); }
      showToast(id ? "IR updated" : "IR saved", "success");
      navigate(`/stores/inward-registers?type=${form.dc_type || dcTypeTab}`);
    } catch (e) {
      showToast(e.response?.data?.error || "Failed to save IR", "error");
    } finally { setSaving(false); }
  };

  const requestSave = () => {
    if (readOnly) return;
    if (!validate()) return;
    setConfirmOpen(true);
  };

  const handleConfirmSave = async () => {
    setConfirmOpen(false);
    await save();
  };

  const todayStr = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);

  const handleKeyDown = (e) => {
    if (readOnly) return;
    if ((e.key === "Enter" || e.key === "Tab") && e.target.tagName !== "TEXTAREA") {
      if (document.activeElement === inwardDateRef.current && form.inward_date && form.inward_date > todayStr) {
        e.preventDefault();
        setFieldErrors((p) => ({ ...p, inward_date: "Inward Date cannot be greater than today" }));
        return;
      }
    }
    if (e.key === "Enter" && e.target.tagName !== "TEXTAREA") {
      e.preventDefault();
      if (document.activeElement === inwardDateRef.current && items.length > 0) {
        const firstQty = qtyRefs.current[items[0].tempId];
        if (firstQty) { firstQty.focus(); }
        return;
      }
      const focusable = e.currentTarget.querySelectorAll(
        'input:not([disabled]):not([type="hidden"]):not([data-enter-skip]), select:not([disabled]), textarea:not([disabled]):not([data-enter-skip]), button:not([disabled]):not([data-enter-skip])'
      );
      const idx = Array.from(focusable).indexOf(document.activeElement);
      if (idx >= 0 && idx < focusable.length - 1) {
        focusable[idx + 1].focus();
      }
    }
  };

  const totalQty = items.reduce((sum, it) => sum + Number(it.qty_supplied || 0), 0);
  const totalNotRet = items.reduce((sum, it) => sum + Number(it.opening || 0), 0);
  const totalDcQty = items.reduce((sum, it) => sum + Number(it.dc_qty || 0), 0);
  const totalPending = items.reduce((sum, it) => sum + Number(it.qty_pending || 0), 0);

  const gridColKeys = ["sl", "dc", "date", "item", "wo", "desc", "uom", "dc_qty", "pending", "qty_supp", "qty_not_ret", "remarks"];
  const gridCols = ["SL#", "DC#", "Date", "Item Code", "W.O", "Description", "UOM", "DC Qty", "Pending", "Qty Supp", "Qty Not Ret", "Remarks"];
  const colMin = { sl: 60, dc: 70, date: 90, item: 90, wo: 60, desc: 160, uom: 50, dc_qty: 70, pending: 70, qty_supp: 90, qty_not_ret: 80, remarks: 120 };
  const tc = { border: "1.5px solid #dce1ea", textAlign: "center", fontWeight: 800, fontSize: "0.82rem", py: 0.25 };

  const deptOptions = useMemo(() => {
    if (!form.dept_code || DEPARTMENTS.includes(form.dept_code)) return DEPARTMENTS;
    return [form.dept_code, ...DEPARTMENTS];
  }, [form.dept_code]);

  // Only show DCs belonging to the selected party.
  const dcOptions = useMemo(() => {
    const pn = form.party_name.trim().toLowerCase();
    if (!pn) return pendingDcs;
    return pendingDcs.filter((d) => (d.party_name || "").trim().toLowerCase() === pn);
  }, [pendingDcs, form.party_name]);

  if (loading) return <LinearProgress sx={{ mt: 2 }} />;

  return (
    <Box sx={{ p: { xs: 1.5, md: 3 }, minHeight: "100vh", background: "linear-gradient(180deg, #f0f4fa 0%, #f8fafc 30%, #fbfcfe 100%)" }} onKeyDown={handleKeyDown}>
      {/* ── Header ── */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2.5, flexWrap: "wrap", gap: 1.5 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <IconButton onClick={() => navigate(`/stores/inward-registers?type=${form.dc_type || dcTypeTab}`)} sx={{ border: "1px solid", borderColor: "divider", bgcolor: "background.paper" }}><ArrowBackIcon /></IconButton>
          <Box sx={{ width: 44, height: 44, borderRadius: 3, bgcolor: alpha(activeColor, 0.12), display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 6px 16px ${alpha(activeColor, 0.18)}` }}>
            <InventoryIcon sx={{ fontSize: 24, color: activeColor }} />
          </Box>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, color: "#0f172a", letterSpacing: "-0.3px", lineHeight: 1.2 }}>Inward Register</Typography>
            <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 600, fontSize: "0.72rem" }}>
              {typeLabels[form.dc_type] || typeLabels[dcTypeTab]} · {form.ir_no ? `IR #${form.ir_no}` : "New"} · {readOnly ? "View" : id ? "Edit" : "New"}
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: "flex", gap: 1, alignItems: "center", flexWrap: "wrap" }}>
          <Box sx={{ display: "flex", gap: 1, alignItems: "center", mr: 0.5, px: 1.5, py: 0.6, borderRadius: 2, bgcolor: alpha(activeColor, 0.08), border: `1px solid ${alpha(activeColor, 0.25)}` }}>
            <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: activeColor }} />
            <Typography sx={{ fontSize: "0.8rem", fontWeight: 700, color: activeColor }}>
              {typeLabels[form.dc_type] || typeLabels[dcTypeTab]}
            </Typography>
          </Box>
          {!readOnly && (
            <>
              <Button variant="contained" startIcon={<SaveIcon />} onClick={requestSave} disabled={saving}
                sx={{ borderRadius: 2, textTransform: "none", fontWeight: 700, bgcolor: activeColor, "&:hover": { bgcolor: alpha(activeColor, 0.85), transform: "translateY(-1px)" }, boxShadow: `0 6px 16px ${alpha(activeColor, 0.3)}`, transition: "all 0.15s" }}>
                {saving ? "Saving..." : (id ? "Update IR" : (<span><u>S</u>ave IR</span>))}
              </Button>
            </>
          )}
        </Box>
      </Box>

      {/* ── Header Information ── */}
      <Card sx={{ borderRadius: 3, mb: 2, boxShadow: "0 6px 20px rgba(15,23,42,0.06)", border: "1px solid #e8edf4", bgcolor: "rgba(255,255,255,0.9)" }}>
        <Box sx={{ px: 2, py: 0.8, bgcolor: "#f8fafc", borderBottom: "1px solid #eef2f7", display: "flex", alignItems: "center", gap: 1 }}>
          <Box sx={{ width: 3, height: 14, bgcolor: activeColor, borderRadius: 2 }} />
          <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: "0.8rem", color: "#0f172a" }}>Header Information</Typography>
          <Box sx={{ flex: 1 }} />
          {selectedDcs.length > 0 && (
            <Chip size="small" label={`${selectedDcs.length} DC${selectedDcs.length > 1 ? "s" : ""} selected`}
              sx={{ fontSize: "0.68rem", fontWeight: 700, bgcolor: alpha(activeColor, 0.1), color: activeColor }} />
          )}
        </Box>
        <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(6, 1fr)" }, gap: 1.5, alignItems: "start" }}>
            {/* Row 1 — Party, IR#, IR Date, Year, Prepared By */}
            <Autocomplete
              size="small"
              options={suppliers}
              getOptionLabel={(o) => o.supplier_code ? `${o.supplier_code} - ${o.supplier_name || o.name}` : (o.supplier_name || o.name || "")}
              value={suppliers.find((s) => (s.supplier_name || s.name) === form.party_name) || null}
              onChange={(_, v) => { setFieldErrors((p) => ({ ...p, party: "" })); setForm((f) => ({ ...f, party_id: v?.id ? String(v.id) : "", party_name: v?.supplier_name || v?.name || "" })); }}
              renderInput={(p) => <TextField {...p} label="Party *" error={Boolean(fieldErrors.party)} helperText={fieldErrors.party || ""} inputRef={partyRef} />}
              disabled={readOnly || partyLocked}
              sx={{ ...fsx, gridColumn: { md: "span 2" } }}
            />
            <TextField size="small" label="IR #" value={form.ir_no} disabled sx={{ ...fsx, "& .Mui-disabled": { WebkitTextFillColor: "#334155 !important", fontWeight: 600 } }} />
            <TextField size="small" label="IR Date" type="datetime-local" value={form.ir_date} disabled InputLabelProps={{ shrink: true }} sx={{ ...fsx, "& .Mui-disabled": { WebkitTextFillColor: "#334155 !important" } }} />
            <TextField size="small" label="Year" value={form.year} disabled sx={{ ...fsx, "& .Mui-disabled": { WebkitTextFillColor: "#334155 !important", fontWeight: 600 } }} />
            <TextField size="small" label="Prepared By" value={form.prepared_by} disabled sx={{ ...fsx, "& .Mui-disabled": { WebkitTextFillColor: "#334155 !important", fontWeight: 600 } }} />

            {/* Row 2 — Dept Code (non-navigable), Inward Date, Delivery Challans, Vehicle, Driver, Remarks */}
            <TextField select size="small" label="Dept Code" value={form.dept_code} disabled={readOnly} onChange={(e) => setForm((f) => ({ ...f, dept_code: e.target.value }))} sx={{ ...fsx, "& .MuiInputBase-input": { ...fsx["& .MuiInputBase-input"], fontWeight: 600 } }}>
              {deptOptions.map((d) => <MenuItem key={d} value={d}>{d}</MenuItem>)}
            </TextField>
            <TextField size="small" label="Inward Date" type="date" value={form.inward_date}
              onChange={(e) => {
                const v = e.target.value;
                const err = v && v > todayStr ? "Inward Date cannot be greater than today" : "";
                setFieldErrors((p) => ({ ...p, inward_date: err }));
                setForm((f) => ({ ...f, inward_date: v }));
              }}
              onBlur={() => {
                if (form.inward_date && form.inward_date > todayStr) {
                  setFieldErrors((p) => ({ ...p, inward_date: "Inward Date cannot be greater than today" }));
                  setTimeout(() => inwardDateRef.current?.focus?.(), 0);
                }
              }}
              InputLabelProps={{ shrink: true }} disabled={readOnly} error={Boolean(fieldErrors.inward_date)} helperText={fieldErrors.inward_date || ""} inputRef={inwardDateRef} sx={fsx} />
            <Autocomplete
              size="small"
              multiple
              options={dcOptions}
              value={selectedDcs}
              onChange={handleDcChange}
              getOptionLabel={(d) => `${d.dc_no || d.draft_no || "DC"} · ${d.party_name || ""}`}
              isOptionEqualToValue={(o, v) => o.id === v.id}
              renderOption={(props, d) => (
                <li {...props}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, width: "100%", py: 0.2 }}>
                    <Chip label={d.dc_no || d.draft_no || "-"} size="small" sx={{ fontSize: "0.66rem", height: 20, fontWeight: 700, fontFamily: "monospace", bgcolor: alpha(activeColor, 0.1), color: activeColor }} />
                    <Typography variant="caption" sx={{ color: "#334155", fontSize: "0.76rem", fontWeight: 600, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {d.party_name || "-"}
                    </Typography>
                  </Box>
                </li>
              )}
              renderTags={(tags, getTagProps) =>
                tags.map((d, i) => (
                  <Chip size="small" label={`${d.dc_no || d.draft_no}`} {...getTagProps({ index: i })}
                    sx={{ fontSize: "0.64rem", height: 20, fontWeight: 700, bgcolor: alpha(activeColor, 0.1), color: activeColor, "& .MuiChip-deleteIcon": { color: activeColor, "&:hover": { color: "#dc2626" } } }} />
                ))
              }
              renderInput={(p) => <TextField {...p} label="Delivery Challans" placeholder={selectedDcs.length === 0 ? "Select DCs..." : ""} error={Boolean(fieldErrors.dc)} helperText={fieldErrors.dc || ""} inputRef={dcRef} />}
              disabled={readOnly}
              sx={{ ...fsx, gridColumn: { md: "span 1" } }}
            />
            <TextField size="small" label="Vehicle No" value={form.vehicle_no} onChange={(e) => setForm((f) => ({ ...f, vehicle_no: e.target.value }))} disabled={readOnly} sx={fsx} />
            <TextField size="small" label="Driver" value={form.driver_name} onChange={(e) => setForm((f) => ({ ...f, driver_name: e.target.value }))} disabled={readOnly} sx={fsx} />
            <CountedTextArea label="Remarks" size="small" value={form.remarks}
              onChange={(e) => setForm((f) => ({ ...f, remarks: e.target.value }))} disabled={readOnly} rows={1}
              sx={{ gridColumn: { md: "span 1" } }} />
          </Box>
        </CardContent>
      </Card>

      {/* ── Select Items (shuttle) ── */}
      {selectedDcs.length > 0 && (
        <Card sx={{ borderRadius: 3, mb: 2, boxShadow: "0 6px 20px rgba(15,23,42,0.06)", border: "1px solid #e8edf4", bgcolor: "rgba(255,255,255,0.9)" }}>
          <Box sx={{ px: 2, py: 0.8, bgcolor: "#f8fafc", borderBottom: "1px solid #eef2f7", display: "flex", alignItems: "center", gap: 1 }}>
            <Box sx={{ width: 3, height: 14, bgcolor: activeColor, borderRadius: 2 }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: "0.8rem", color: "#0f172a" }}>Select Items</Typography>
            <Chip size="small" label={`${itemShuttleData.length} available`} sx={{ fontSize: "0.66rem", fontWeight: 700, bgcolor: alpha(activeColor, 0.08), color: activeColor }} />
            <Tooltip title={shuttleOpen ? "Collapse" : "Expand"}>
              <IconButton size="small" onClick={() => setShuttleOpen((v) => !v)} sx={{ ml: 0.5 }}>
                {shuttleOpen ? <ExpandLessIcon sx={{ fontSize: 20, color: activeColor }} /> : <ExpandMoreIcon sx={{ fontSize: 20, color: activeColor }} />}
              </IconButton>
            </Tooltip>
            <Box sx={{ flex: 1 }} />
            {!readOnly && checkedItemKeys.length > 0 && shuttleOpen && (
              <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={loadCheckedItems}
                sx={{ borderRadius: 1.5, textTransform: "none", fontWeight: 700, bgcolor: activeColor, "&:hover": { bgcolor: alpha(activeColor, 0.85) }, boxShadow: `0 6px 16px ${alpha(activeColor, 0.3)}` }}>
                Load Items ({checkedItemKeys.filter((k) => !loadedItemKeys.includes(k)).length})
              </Button>
            )}
          </Box>
          {shuttleOpen && (
          <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
            <InwardShuttle
              items={itemShuttleData}
              rightKeys={[...checkedItemKeys, ...loadedItemKeys]}
              fixedKeys={loadedItemKeys}
              onToggle={toggleItemChecked}
              renderRow={itemRenderRow}
              getSearchText={(x) => `${x.item_code} ${x.item_name} ${x.dc.dc_no || x.dc.draft_no}`}
              accent={activeColor}
              leftTitle="Available Items"
              rightTitle="Selected / Loaded"
              emptyLeft="No items to load"
              emptyRight="No items selected"
              disabled={readOnly}
            />
            <Typography variant="caption" sx={{ display: "block", mt: 1, color: "#94a3b8", fontSize: "0.7rem" }}>
              Qty supplied is capped at the pending qty of each item.
            </Typography>
          </CardContent>
          )}
        </Card>
      )}

      {/* ── DC Details ── */}
      <Card sx={{ borderRadius: 3, boxShadow: "0 6px 20px rgba(15,23,42,0.06)", border: "1px solid #e8edf4", bgcolor: "rgba(255,255,255,0.9)", mb: 2, overflow: "hidden" }}>
        <Box sx={{ px: 2, py: 0.8, bgcolor: "#f8fafc", borderBottom: "1px solid #eef2f7", display: "flex", alignItems: "center", gap: 1 }}>
          <Box sx={{ width: 3, height: 14, bgcolor: activeColor, borderRadius: 2 }} />
          <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: "0.8rem", color: "#0f172a" }}>DC Details</Typography>
          <Box sx={{ flex: 1 }} />
          {items.length > 0 && (
            <Typography sx={{ fontSize: "0.72rem", fontWeight: 600, color: "#64748b" }}>
              {items.length} item{items.length > 1 ? "s" : ""}
            </Typography>
          )}
        </Box>
        <CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}>
          {items.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 5, color: "#94a3b8" }}>
              <Box sx={{ width: 56, height: 56, borderRadius: 3, bgcolor: alpha(activeColor, 0.06), display: "flex", alignItems: "center", justifyContent: "center", mx: "auto", mb: 1.5 }}>
                <AddIcon sx={{ fontSize: 28, opacity: 0.4 }} />
              </Box>
              <Typography sx={{ fontWeight: 700, fontSize: "0.95rem", color: "#64748b" }}>No items loaded yet</Typography>
              <Typography sx={{ fontSize: "0.8rem", mt: 0.5 }}>Select Approved challans above and load their items to build this register.</Typography>
            </Box>
          ) : (
            <TableContainer sx={{ border: "1px solid #e8edf4", borderRadius: 1.5, boxShadow: "0 2px 10px rgba(15,23,42,0.04)" }}>
              <Table size="small" sx={{ width: "100%", borderCollapse: "collapse" }}>
                <TableHead>
                  <TableRow sx={{ bgcolor: alpha(activeColor, 0.07) }}>
                    {gridCols.map((l, i) => (
                      <TableCell key={l} sx={{ fontSize: "0.82rem", fontWeight: 800, letterSpacing: "0.02em", borderBottom: `2px solid ${alpha(activeColor, 0.35)}`, borderLeft: "1.5px solid #d3dae3", borderRight: "1.5px solid #d3dae3", textAlign: i === 0 || i === 1 || i === 2 || i >= 6 ? "center" : "left", py: 0.6, whiteSpace: "nowrap", color: "#334155", width: colWidthOf(gridColKeys[i]), minWidth: colMin[gridColKeys[i]], position: "relative", userSelect: "none" }}>
                        {l}
                        <Box onClick={(e) => e.stopPropagation()} onMouseDown={(e) => startResize(e, gridColKeys[i])} sx={{ position: "absolute", top: 0, right: -3, width: 7, height: "100%", cursor: "col-resize", zIndex: 3, "&::after": { content: '""', position: "absolute", top: 8, bottom: 8, right: 2, width: 2, borderRadius: 2, bgcolor: alpha(activeColor, 0.35), transition: "all 0.15s" }, "&:hover::after": { bgcolor: activeColor, right: 0, width: 3 } }} />
                      </TableCell>
                    ))}
                    {!readOnly && <TableCell sx={{ fontSize: "0.82rem", fontWeight: 800, borderBottom: `2px solid ${alpha(activeColor, 0.35)}`, borderLeft: "1.5px solid #d3dae3", borderRight: "1.5px solid #d3dae3", textAlign: "center", py: 0.6, width: 36 }}></TableCell>}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {items.map((it, i) => {
                    const qtyErr = rowQtyError(it);
                    const maxPending = it.qty_pending != null && it.qty_pending >= 0 ? it.qty_pending : it.dc_qty;
                    return (
                      <TableRow key={it.tempId || i} hover sx={{ bgcolor: i % 2 === 0 ? "#ffffff" : "#f8fafc", "&:hover": { bgcolor: alpha(activeColor, 0.04) } }}>
                        <TableCell sx={{ border: "1.5px solid #dce1ea", bgcolor: "#fffbeb", width: colWidthOf("sl"), minWidth: colMin.sl, py: 0.25 }}>
                          <TextField size="small" variant="standard" value={it.sl_no || (i + 1)}
                            onChange={(e) => updateItem(i, { sl_no: e.target.value })}
                            disabled={readOnly}
                            InputProps={{ disableUnderline: true }}
                            inputProps={{ "data-enter-skip": true }}
                            sx={{ ...fsx, "& .MuiInputBase-input": { fontSize: "0.88rem", textAlign: "center", p: "3px" } }} />
                        </TableCell>
                        <TableCell sx={{ border: "1.5px solid #dce1ea", textAlign: "center", fontSize: "0.86rem", fontFamily: "monospace", fontWeight: 700, color: activeColor, py: 0.25, width: colWidthOf("dc"), minWidth: colMin.dc }}>{it.dc_no_display || "-"}</TableCell>
                        <TableCell sx={{ border: "1.5px solid #dce1ea", textAlign: "center", fontSize: "0.84rem", whiteSpace: "nowrap", fontWeight: 700, color: "#0b1120", fontFamily: "monospace", py: 0.25, width: colWidthOf("date") }}>{it.dc_date ? fmtDcDateTime(it.dc_date) : "-"}</TableCell>
                        <TableCell sx={{ border: "1.5px solid #dce1ea", fontSize: "0.82rem", fontWeight: 700, color: "#0f172a", py: 0.25, width: colWidthOf("item") }}>{it.item_code || "-"}</TableCell>
                        <TableCell sx={{ border: "1.5px solid #dce1ea", fontSize: "0.82rem", fontWeight: 600, color: "#0f172a", py: 0.25, width: colWidthOf("wo") }}>{it.work_order || "-"}</TableCell>
                        <TableCell sx={{ border: "1.5px solid #dce1ea", fontSize: "0.84rem", fontWeight: 600, color: "#0f172a", py: 0.25, width: colWidthOf("desc"), minWidth: colMin.desc }}>{it.item_name || "-"}</TableCell>
                        <TableCell sx={{ border: "1.5px solid #dce1ea", textAlign: "center", fontSize: "0.82rem", fontWeight: 600, color: "#0f172a", py: 0.25, width: colWidthOf("uom") }}>{it.uom || "-"}</TableCell>
                        <TableCell sx={{ border: "1.5px solid #dce1ea", textAlign: "center", fontSize: "0.82rem", fontWeight: 700, color: "#0f172a", py: 0.25, width: colWidthOf("dc_qty") }}>{fmtNum(it.dc_qty)}</TableCell>
                        <TableCell sx={{ border: "1.5px solid #dce1ea", textAlign: "center", py: 0.25, width: colWidthOf("pending") }}>
                          <Box sx={{ px: 0.8, py: 0.1, borderRadius: 1.2, fontSize: "0.76rem", fontWeight: 800, display: "inline-block", bgcolor: Number(it.qty_pending) > 0 ? "#fef3c7" : "#f1f5f9", color: Number(it.qty_pending) > 0 ? "#b45309" : "#94a3b8" }}>{fmtNum(it.qty_pending)}</Box>
                        </TableCell>
                        <TableCell sx={{ border: "1.5px solid #dce1ea", bgcolor: qtyErr ? "#fef2f2" : "#fffbeb", width: colWidthOf("qty_supp"), minWidth: colMin.qty_supp, py: 0.25 }}>
                          <TextField size="small" variant="standard" type="number" value={it.qty_supplied}
                            onChange={(e) => { setFieldErrors((p) => ({ ...p, [`qty_${i + 1}`]: "" })); updateItem(i, { qty_supplied: e.target.value }); }}
                            disabled={readOnly}
                            error={Boolean(qtyErr || fieldErrors[`qty_${i + 1}`])}
                            inputRef={(el) => { qtyRefs.current[it.tempId] = el; }}
                            helperText={fieldErrors[`qty_${i + 1}`] || qtyErr || ""}
                            InputProps={{ disableUnderline: true }}
                            sx={{ ...fsx, "& input[type=number]::-webkit-outer-spin-button, & input[type=number]::-webkit-inner-spin-button": { WebkitAppearance: "none", margin: 0 }, "& input[type=number]": { MozAppearance: "textfield" }, "& .MuiInputBase-input": { fontSize: "0.9rem", textAlign: "center", fontWeight: 700, p: "3px", color: qtyErr ? "#dc2626" : "#1e293b" }, "& .MuiFormHelperText-root": { fontSize: "0.6rem", margin: 0, whiteSpace: "nowrap", lineHeight: 1.2 } }}
                            inputProps={{ min: 0, max: maxPending }}
                            title={qtyErr || ""} />
                        </TableCell>
                        <TableCell sx={{ border: "1.5px solid #dce1ea", bgcolor: "#fffbeb", width: colWidthOf("qty_not_ret"), py: 0.25 }}>
                          <TextField size="small" variant="standard" type="number" value={it.opening || ""}
                            onChange={(e) => updateItem(i, { opening: e.target.value })}
                            disabled={readOnly}
                            InputProps={{ disableUnderline: true }}
                            inputProps={{ min: 0, "data-enter-skip": true }}
                            sx={{ ...fsx, "& input[type=number]::-webkit-outer-spin-button, & input[type=number]::-webkit-inner-spin-button": { WebkitAppearance: "none", margin: 0 }, "& input[type=number]": { MozAppearance: "textfield" }, "& .MuiInputBase-input": { fontSize: "0.88rem", textAlign: "center", p: "3px" } }}
                          />
                        </TableCell>
                        <TableCell sx={{ border: "1.5px solid #dce1ea", bgcolor: "#fffbeb", py: 0.25, width: colWidthOf("remarks") }}>
                          <TextField size="small" variant="standard" value={it.remarks}
                            onChange={(e) => updateItem(i, { remarks: e.target.value })}
                            disabled={readOnly}
                            InputProps={{ disableUnderline: true }}
                            inputProps={{ "data-enter-skip": true }}
                            sx={{ ...fsx, "& .MuiInputBase-input": { fontSize: "0.82rem", p: "3px" } }} />
                        </TableCell>
                        {!readOnly && (
                          <TableCell sx={{ border: "1.5px solid #dce1ea", textAlign: "center", py: 0.25 }}>
                            <Tooltip title="Remove items of this DC">
                              <IconButton size="small" color="error" data-enter-skip onClick={() => handleRemoveItem(it)}><DeleteIcon sx={{ fontSize: 15 }} /></IconButton>
                            </Tooltip>
                          </TableCell>
                        )}
                      </TableRow>
                    );
                  })}
                  <TableRow sx={{ bgcolor: "#f8fafc" }}>
                    <TableCell colSpan={7} sx={{ border: "1.5px solid #dce1ea", fontWeight: 800, textAlign: "right", padding: "6px 10px", fontSize: "0.82rem", color: "#475569", letterSpacing: "0.02em" }}>Total :</TableCell>
                    <TableCell sx={{ ...tc, color: "#1e40af" }}>{fmtNum(totalDcQty)}</TableCell>
                    <TableCell sx={{ ...tc, color: "#b45309" }}>{fmtNum(totalPending)}</TableCell>
                    <TableCell sx={{ ...tc, color: "#059669" }}>{fmtNum(totalQty)}</TableCell>
                    <TableCell sx={{ ...tc, color: "#dc2626" }}>{fmtNum(totalNotRet)}</TableCell>
                    <TableCell sx={{ border: "1.5px solid #dce1ea" }} colSpan={readOnly ? 2 : 3}></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontSize: "1rem", fontWeight: 700 }}>Confirm Save</DialogTitle>
        <DialogContent>
          <DialogContentText>Do you want to save this Inward Register?</DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setConfirmOpen(false)} sx={{ textTransform: "none", fontWeight: 700, color: "#64748b" }}>Cancel</Button>
          <Button variant="contained" onClick={handleConfirmSave} sx={{ textTransform: "none", fontWeight: 700, bgcolor: activeColor, "&:hover": { bgcolor: alpha(activeColor, 0.85) } }}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
