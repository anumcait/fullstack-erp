import React, { useEffect, useRef, useState, useMemo } from "react";
import {
  Box, Card, CardContent, Typography, TextField, Button, Grid, MenuItem, IconButton,
  LinearProgress, Tabs, Tab,
  Table, TableHead, TableBody, TableRow, TableCell, TableContainer, Tooltip, Chip, Stack
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import DoubleArrowIcon from "@mui/icons-material/DoubleArrow";
import PrintIcon from "@mui/icons-material/PictureAsPdf";
import axios from "axios";
import { useToast } from "../../../../context/ToastContext";
import CountedTextArea from "../../../Common/CountedTextArea";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { downloadJoPdf } from "../../Purchase/PO/joPdf";

const API = "/api/erp/production/job-orders";
const SUPPLIER_API = "/api/erp/purchase/suppliers";

const PAYMENT_TERMS = ["Immediate", "7 Days", "15 Days", "30 Days", "45 Days", "60 Days", "90 Days"];
const DEPARTMENTS = ["Purchase", "Maintenance", "Production", "Stores", "Quality", "Engineering", "Planning", "Marketing", "HR", "Finance", "IT", "Admin"];

function DCShuttle({ deliveryChallans, shuttleChecked, addedDCIds, toggleShuttle, num }) {
  const [leftSearch, setLeftSearch] = useState("");
  const [rightSearch, setRightSearch] = useState("");
  const [selected, setSelected] = useState([]);

  const checkedSet = useMemo(() => new Set(shuttleChecked), [shuttleChecked]);
  const addedSet = useMemo(() => new Set(addedDCIds), [addedDCIds]);

  const available = useMemo(() => deliveryChallans.filter((d) => !addedSet.has(d.id)), [deliveryChallans, addedSet]);

  const leftItems = useMemo(() => {
    const q = leftSearch.toLowerCase();
    return available.filter((d) => !checkedSet.has(d.id) && (!q || (d.challan_no || "").toLowerCase().includes(q) || (d.item_name || "").toLowerCase().includes(q) || (d.item_code || "").toLowerCase().includes(q)));
  }, [available, checkedSet, leftSearch]);

  const rightItems = useMemo(() => {
    const q = rightSearch.toLowerCase();
    return deliveryChallans.filter((d) => (checkedSet.has(d.id) || addedSet.has(d.id)) && (!q || (d.challan_no || "").toLowerCase().includes(q) || (d.item_name || "").toLowerCase().includes(q) || (d.item_code || "").toLowerCase().includes(q)));
  }, [deliveryChallans, checkedSet, addedSet, rightSearch]);

  const leftIds = useMemo(() => new Set(leftItems.map((d) => d.id)), [leftItems]);

  const toggleSelect = (id) => setSelected((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id]);
  const moveSelectedRight = () => { const m = selected.filter((sid) => leftIds.has(sid)); m.forEach((sid) => toggleShuttle(sid)); setSelected([]); };
  const moveSelectedLeft = () => { const m = selected.filter((sid) => !leftIds.has(sid) && !addedSet.has(sid)); m.forEach((sid) => toggleShuttle(sid)); setSelected([]); };
  const moveAllRight = () => { available.filter((d) => !checkedSet.has(d.id)).forEach((d) => toggleShuttle(d.id)); setSelected([]); };
  const moveAllLeft = () => { shuttleChecked.forEach((sid) => { if (!addedSet.has(sid)) toggleShuttle(sid); }); setSelected([]); };

  const searchFieldSx = { "& .MuiOutlinedInput-root": { fontSize: "0.8rem" }, "& .MuiOutlinedInput-input": { py: 0.75 }, mb: 0.75 };
  const listSx = { border: "1px solid #e2e8f0", borderRadius: 2, minHeight: 240, maxHeight: 400, overflow: "auto", bgcolor: "#fff" };
  const rowSx = (isSelected) => ({
    display: "flex", alignItems: "center", gap: 1, px: 1.25, py: 0.6, cursor: "pointer", userSelect: "none",
    borderBottom: "1px solid #f1f5f9", bgcolor: isSelected ? "#eff6ff" : "transparent", transition: "background 0.1s",
    "&:hover": { bgcolor: isSelected ? "#dbeafe" : "#f8fafc" },
  });

  return (
    <Stack direction="row" spacing={1} alignItems="stretch">
      <Box sx={{ flex: 1 }}>
        <Typography variant="caption" sx={{ fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: 0.5, mb: 0.5, display: "block" }}>
          Available ({leftItems.length})
        </Typography>
        <TextField size="small" placeholder="Search DC items..." variant="outlined" fullWidth value={leftSearch} onChange={(e) => setLeftSearch(e.target.value)} sx={searchFieldSx} />
        <Box sx={listSx}>
          {leftItems.length === 0 && <Typography variant="body2" sx={{ p: 2, color: "text.secondary", textAlign: "center", fontStyle: "italic" }}>{leftSearch ? "No items match" : "All items selected \u2192"}</Typography>}
          {leftItems.map((d) => {
            const isSelected = selected.includes(d.id);
            return (
              <Box key={d.id} sx={rowSx(isSelected)} onClick={() => toggleSelect(d.id)}>
                <Typography variant="body2" sx={{ fontSize: "0.8rem", color: "#1e293b", lineHeight: 1.4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  <Box component="span" sx={{ fontWeight: 700, color: "#475569", mr: 0.5 }}>{d.item_code || "---"}</Box>
                  <Box component="span" sx={{ fontWeight: 600 }}>{d.item_name}</Box>
                  <Box component="span" sx={{ color: "#64748b", ml: 0.5 }}>&middot; DC: {d.challan_no} &middot; Qty: {num(d.quantity)} &middot; &#x20B9;{num(d.rate)}</Box>
                </Typography>
              </Box>
            );
          })}
        </Box>
      </Box>

      <Stack spacing={0.5} justifyContent="center" alignItems="center" sx={{ px: 0.5 }}>
        <Tooltip title="Move selected to right"><IconButton size="small" onClick={moveSelectedRight} disabled={selected.length === 0 || leftItems.every((d) => !selected.includes(d.id))} sx={{ border: "1px solid #cbd5e1", borderRadius: 1, "&:hover": { bgcolor: "#dbeafe" } }}><ChevronRightIcon sx={{ fontSize: 18 }} /></IconButton></Tooltip>
        <Tooltip title="Move all to right"><IconButton size="small" onClick={moveAllRight} disabled={leftItems.length === 0} sx={{ border: "1px solid #cbd5e1", borderRadius: 1, "&:hover": { bgcolor: "#dbeafe" } }}><DoubleArrowIcon sx={{ fontSize: 18 }} /></IconButton></Tooltip>
        <Tooltip title="Move all to left"><IconButton size="small" onClick={moveAllLeft} disabled={shuttleChecked.filter((sid) => !addedSet.has(sid)).length === 0} sx={{ border: "1px solid #cbd5e1", borderRadius: 1, "&:hover": { bgcolor: "#fef2f2" } }}><DoubleArrowIcon sx={{ fontSize: 18, transform: "scaleX(-1)" }} /></IconButton></Tooltip>
        <Tooltip title="Move selected to left"><IconButton size="small" onClick={moveSelectedLeft} disabled={selected.length === 0 || rightItems.every((d) => !selected.includes(d.id))} sx={{ border: "1px solid #cbd5e1", borderRadius: 1, "&:hover": { bgcolor: "#fef2f2" } }}><ChevronLeftIcon sx={{ fontSize: 18 }} /></IconButton></Tooltip>
      </Stack>

      <Box sx={{ flex: 1 }}>
        <Typography variant="caption" sx={{ fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: 0.5, mb: 0.5, display: "block" }}>
          Selected ({rightItems.length})
        </Typography>
        <TextField size="small" placeholder="Search items..." variant="outlined" fullWidth value={rightSearch} onChange={(e) => setRightSearch(e.target.value)} sx={searchFieldSx} />
        <Box sx={listSx}>
          {rightItems.length === 0 && <Typography variant="body2" sx={{ p: 2, color: "text.secondary", textAlign: "center", fontStyle: "italic" }}>{rightSearch ? "No items match" : "\u2190 Move DC items here"}</Typography>}
          {rightItems.map((d) => {
            const alreadyAdded = addedSet.has(d.id);
            const isSelected = selected.includes(d.id);
            return (
              <Box key={d.id} sx={{ ...rowSx(isSelected), ...(alreadyAdded ? { opacity: 0.6, cursor: "default" } : {}) }} onClick={() => !alreadyAdded && toggleSelect(d.id)}>
                <Typography variant="body2" sx={{ fontSize: "0.8rem", color: "#1e293b", lineHeight: 1.4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>
                  <Box component="span" sx={{ fontWeight: 700, color: "#475569", mr: 0.5 }}>{d.item_code || "---"}</Box>
                  <Box component="span" sx={{ fontWeight: 600 }}>{d.item_name}</Box>
                  <Box component="span" sx={{ color: "#64748b", ml: 0.5 }}>&middot; DC: {d.challan_no} &middot; Qty: {num(d.quantity)} &middot; &#x20B9;{num(d.rate)}</Box>
                </Typography>
                {alreadyAdded && <Chip size="small" label="Added" color="success" variant="outlined" sx={{ fontSize: "0.65rem", height: 18, ml: "auto" }} />}
              </Box>
            );
          })}
        </Box>
      </Box>
    </Stack>
  );
}

export default function JobOrderForm() {
  const { id } = useParams();
  const location = useLocation();
  const isView = location.pathname.includes("/view/");
  const isEdit = Boolean(id) && !isView;
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [printing, setPrinting] = useState(false);

  const handlePrint = async () => {
    if (!id) return;
    setPrinting(true);
    const newTab = window.open("", "_blank");
    try {
      const url = await downloadJoPdf(id);
      if (newTab) newTab.location.href = url;
      else window.open(url, "_blank");
    } catch {
      if (newTab) newTab.close();
      showToast("Failed to generate PDF", "error");
    } finally { setPrinting(false); }
  };
  const [suppliers, setSuppliers] = useState([]);
  const [deliveryChallans, setDeliveryChallans] = useState([]);
  const [addedDCIds, setAddedDCIds] = useState([]);
  const [shuttleChecked, setShuttleChecked] = useState([]);
  const [header, setHeader] = useState({
    order_no: "", jo_date: new Date().toISOString().slice(0, 10), req_date: new Date().toISOString().slice(0, 10),
    party_id: "", party_name: "", department: "", payment_terms: "", delivery_terms: "", currency: "INR",
    subtotal: 0, discount_percent: 0, discount_amount: 0, tax_amount: 0, grand_total: 0, notes: "",
    subject: "", reference: "", qtn_no: "", ref_date: "",
    old_jo_no: "", jo_year: "",
    insurance: "", inspection: "", freight: "", freight_forward: "",
    delivery_period: "", desp_to: "", any_other_terms: "",
  });
  const [items, setItems] = useState([]);
  const [tab, setTab] = useState(0);
  const [activeRow, setActiveRow] = useState(-1);
  const [supplierState, setSupplierState] = useState("");
  const tableRef = useRef(null);
  const pendingFocusRef = useRef(null);

  useEffect(() => {
    axios.get(SUPPLIER_API, { params: { is_active: true } }).then(({ data }) => setSuppliers(data)).catch(() => {});
    if (id) {
      setLoading(true);
      axios.get(`${API}/${id}`).then(({ data }) => {
        setHeader({
          order_no: data.order_no || "", jo_date: data.jo_date ? data.jo_date : new Date().toISOString().slice(0, 10),
          req_date: data.req_date ? data.req_date : new Date().toISOString().slice(0, 10),
          party_id: data.party_id || "", party_name: data.party_name || "", department: data.department || "",
          payment_terms: data.payment_terms || "", delivery_terms: data.delivery_terms || "", currency: data.currency || "INR",
          subtotal: Number(data.subtotal) || 0, discount_percent: Number(data.discount_percent) || 0,
          discount_amount: Number(data.discount_amount) || 0, tax_amount: Number(data.tax_amount) || 0,
          grand_total: Number(data.grand_total) || 0, notes: data.notes || "",
          subject: data.subject || "", reference: data.reference || "", qtn_no: data.qtn_no || "",
          ref_date: data.ref_date ? data.ref_date.split("T")[0] : "",
          old_jo_no: data.old_jo_no || "", jo_year: data.jo_year || "",
          insurance: data.insurance || "", inspection: data.inspection || "",
          freight: data.freight || "", freight_forward: data.freight_forward || "",
          delivery_period: data.delivery_period || "", desp_to: data.desp_to || "",
          any_other_terms: data.any_other_terms || "",
        });
        if (data.party_id) loadDCForParty(data.party_id);
        if (data.items && data.items.length) setItems(data.items.map((it) => ({
          item_id: it.item_id, item_code: it.item_code || "",
          item_name: it.item_name, quantity: Number(it.quantity || it.required_quantity) || 0, unit_id: it.unit_id,
          rate: Number(it.rate) || 0, amount: Number(it.amount) || 0,
          disc_percent: Number(it.disc_percent) || 0, disc_inr: Number(it.disc_inr) || 0,
          after_disc: Number(it.after_disc) || 0, pf_percent: Number(it.pf_percent) || 0, pf_inr: Number(it.pf_inr) || 0,
          taxable_value: Number(it.taxable_value) || 0,
          sgst_rate: Number(it.sgst_rate) || 0, sgst_inr: Number(it.sgst_inr) || 0,
          cgst_rate: Number(it.cgst_rate) || 0, cgst_inr: Number(it.cgst_inr) || 0,
          igst_rate: Number(it.igst_rate) || 0, igst_inr: Number(it.igst_inr) || 0,
          total_value: Number(it.total_value) || 0, remarks: it.remarks || "",
        })));
      }).catch(() => showToast("Failed to load", "error")).finally(() => setLoading(false));
    }
  }, [id]);

  const loadDCForParty = (partyId) => {
    if (!partyId) { setDeliveryChallans([]); setAddedDCIds([]); setShuttleChecked([]); return; }
    axios.get(`/api/erp/stores/delivery-challans/by-party/${partyId}`)
      .then(({ data }) => {
        const dedup = (data || []).filter((d, i, a) => a.findIndex((x) => x.item_id === d.item_id) === i);
        setDeliveryChallans(dedup);
        setAddedDCIds([]);
        setShuttleChecked([]);
      }).catch(() => setDeliveryChallans([]));
  };

  const computeLine = (it, discSource) => {
    const qty = parseFloat(it.quantity) || 0;
    const rate = parseFloat(it.rate) || 0;
    const amount = qty * rate;
    let disc_percent = parseFloat(it.disc_percent) || 0;
    let disc_inr = parseFloat(it.disc_inr) || 0;
    if (discSource === "disc_inr") {
      disc_inr = parseFloat(it.disc_inr) || 0;
      disc_percent = amount > 0 ? (disc_inr / amount) * 100 : 0;
    } else {
      disc_percent = parseFloat(it.disc_percent) || 0;
      disc_inr = (amount * disc_percent) / 100;
    }
    const after_disc = amount - disc_inr;
    const pf_inr = (after_disc * (parseFloat(it.pf_percent) || 0)) / 100;
    const taxable = after_disc + pf_inr;
    const sgst_inr = (taxable * (parseFloat(it.sgst_rate) || 0)) / 100;
    const cgst_inr = (taxable * (parseFloat(it.cgst_rate) || 0)) / 100;
    const igst_inr = (taxable * (parseFloat(it.igst_rate) || 0)) / 100;
    const total_value = taxable + sgst_inr + cgst_inr + igst_inr;
    return { ...it, amount, disc_percent, disc_inr, after_disc, pf_inr, taxable_value: taxable, sgst_inr, cgst_inr, igst_inr, total_value };
  };

  const recalcItem = (idx, discSource) => {
    setItems((prev) => { const u = [...prev]; u[idx] = computeLine(u[idx], discSource); return u; });
  };

  useEffect(() => {
    const subtotal = items.reduce((s, i) => s + (parseFloat(i.amount) || 0), 0);
    const discAmt = items.reduce((s, i) => s + (parseFloat(i.disc_inr) || 0), 0);
    const pfAmt = items.reduce((s, i) => s + (parseFloat(i.pf_inr) || 0), 0);
    const sgstAmt = items.reduce((s, i) => s + (parseFloat(i.sgst_inr) || 0), 0);
    const cgstAmt = items.reduce((s, i) => s + (parseFloat(i.cgst_inr) || 0), 0);
    const igstAmt = items.reduce((s, i) => s + (parseFloat(i.igst_inr) || 0), 0);
    const tax = sgstAmt + cgstAmt + igstAmt;
    const grand = items.reduce((s, i) => s + (parseFloat(i.total_value) || 0), 0);
    setHeader((h) => ({ ...h, subtotal, discount_amount: discAmt, pf_amount: pfAmt, sgst_amount: sgstAmt, cgst_amount: cgstAmt, igst_amount: igstAmt, tax_amount: tax, grand_total: grand }));
  }, [items]);

  const handleItemChange = (idx, field) => (e) => {
    setItems((prev) => { const u = [...prev]; u[idx][field] = e.target.value; return u; });
    if (["quantity", "rate", "disc_percent", "disc_inr", "pf_percent", "sgst_rate", "cgst_rate", "igst_rate"].includes(field)) recalcItem(idx, field === "disc_inr" ? "disc_inr" : undefined);
  };

  const removeItem = (idx) => {
    const removed = items[idx];
    setItems((prev) => prev.filter((_, i) => i !== idx));
    if (removed?.dc_id) setAddedDCIds((a) => a.filter((sid) => sid !== removed.dc_id));
    setActiveRow(-1);
  };

  useEffect(() => {
    if (!pendingFocusRef.current || !tableRef.current) return;
    const { row, col } = pendingFocusRef.current;
    pendingFocusRef.current = null;
    requestAnimationFrame(() => {
      const tr = tableRef.current?.querySelector(`tbody tr:nth-child(${row + 1})`);
      if (!tr) return;
      const cells = tr.querySelectorAll("td");
      const targetCell = cells[col];
      const input = targetCell?.querySelector("input");
      if (input) { input.focus(); input.select(); }
    });
  });

  const handlePartyChange = (e) => {
    const val = e.target.value;
    const s = suppliers.find((x) => x.id === Number(val));
    setHeader((h) => ({ ...h, party_id: val, party_name: s?.supplier_name || "" }));
    setSupplierState(s?.state || "");
    loadDCForParty(val);
  };

  const toggleShuttle = (sid) => setShuttleChecked((prev) => (prev.includes(sid) ? prev.filter((x) => x !== sid) : [...prev, sid]));

  const addDCToJO = () => {
    const addedSet = new Set(addedDCIds);
    const source = deliveryChallans.filter((d) => shuttleChecked.includes(d.id) && !addedSet.has(d.id));
    if (source.length === 0) { showToast("Select DC items to add", "warning"); return; }
    const isIntraState = supplierState?.toUpperCase() === "TELANGANA";
    const mapped = source.map((d) => ({
      dc_id: d.id, item_id: d.item_id, item_code: d.item_code || "", item_name: d.item_name,
      quantity: Number(d.quantity) || 0, unit_id: d.unit_id, rate: Number(d.rate) || 0,
      amount: 0, disc_percent: 0, disc_inr: 0, after_disc: 0, pf_percent: 0, pf_inr: 0, taxable_value: 0,
      sgst_rate: isIntraState ? 9 : 0, sgst_inr: 0, cgst_rate: isIntraState ? 9 : 0, cgst_inr: 0, igst_rate: 0, igst_inr: 0, total_value: 0,
      remarks: "",
    }));
    setItems((prev) => {
      const next = [...prev];
      mapped.forEach((m) => {
        const exists = next.find((x) => x.item_id ? x.item_id === m.item_id : x.item_name === m.item_name);
        if (!exists) next.push(computeLine(m));
        else { exists.quantity = m.quantity; }
      });
      return next;
    });
    setAddedDCIds((prev) => Array.from(new Set([...prev, ...source.map((d) => d.id)])));
    setShuttleChecked([]);
    showToast(`${mapped.length} DC item(s) added to JO`, "success");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!header.party_id) { showToast("Party is required", "warning"); return; }
    setSaving(true);
    try {
      const payload = {
        ...header, party_id: parseInt(header.party_id),
        items: items.filter((i) => i.item_name).map((i) => ({
          item_id: i.item_id, item_code: i.item_code, item_name: i.item_name,
          quantity: parseFloat(i.quantity) || 0, unit_id: i.unit_id, rate: parseFloat(i.rate) || 0,
          remarks: i.remarks || "",
        })),
      };
      if (isEdit) {
        await axios.put(`${API}/${id}`, payload);
        showToast("Job Order updated", "success");
      } else {
        await axios.post(API, payload);
        showToast("Job Order created", "success");
      }
      navigate("/purchase/job-orders");
    } catch (err) { showToast(err.response?.data?.error || "Failed to save", "error"); }
    finally { setSaving(false); }
  };

  const num = (v) => Number(v || 0).toFixed(2).replace(/\.00$/, "");
  const fmtDate = (v) => {
    if (!v) return "";
    const d = new Date(v);
    if (isNaN(d)) return "";
    const p = (n) => String(n).padStart(2, "0");
    return `${p(d.getDate())}-${p(d.getMonth() + 1)}-${d.getFullYear()}`;
  };

  const cellSx = {
    p: "2px 4px",
    "& .MuiInputBase-root": { fontSize: "0.82rem", height: 30, bgcolor: "transparent" },
    "& .MuiOutlinedInput-notchedOutline": { border: "1px solid transparent" },
    "& .MuiInputBase-root:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#cbd5e1" },
    "& .MuiInputBase-root.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "var(--primary-main, #2563eb)", borderWidth: 1.5 },
    "& input": { p: "4px 6px", textAlign: "inherit" },
  };
  const fsx = {
    "& .MuiInputBase-root": { fontSize: "0.88rem", height: 34 },
    "& .MuiInputLabel-root": { fontSize: "0.88rem", mt: -0.25 },
    "& .MuiInputLabel-shrink": { mt: 0 },
  };

  const COLUMNS = [
    { type: "index", label: "#", width: 36 },
    { type: "text", field: "item_code", label: "Item Code", width: 90 },
    { type: "text", field: "item_name", label: "Item Description", width: 180 },
    { type: "num", field: "quantity", label: "Qty", width: 64 },
    { type: "num", field: "rate", label: "Rate", width: 80 },
    { type: "calc", field: "amount", label: "Amount", width: 90 },
    { type: "num", field: "disc_percent", label: "Disc%", width: 56 },
    { type: "num", field: "disc_inr", label: "Disc(INR)", width: 80 },
    { type: "calc", field: "after_disc", label: "After Disc", width: 90 },
    { type: "num", field: "pf_percent", label: "PF%", width: 52 },
    { type: "calc", field: "pf_inr", label: "PF(INR)", width: 75 },
    { type: "calc", field: "taxable_value", label: "Taxable Val", width: 95 },
    { type: "num", field: "sgst_rate", label: "SGST%", width: 58 },
    { type: "calc", field: "sgst_inr", label: "SGST(INR)", width: 78 },
    { type: "num", field: "cgst_rate", label: "CGST%", width: 58 },
    { type: "calc", field: "cgst_inr", label: "CGST(INR)", width: 78 },
    { type: "num", field: "igst_rate", label: "IGST%", width: 58 },
    { type: "calc", field: "igst_inr", label: "IGST(INR)", width: 78 },
    { type: "calc", field: "total_value", label: "Total", width: 100, emphasize: true },
    { type: "text", field: "remarks", label: "Remarks", width: 120 },
    { type: "action", label: "", width: 36 },
  ];

  const editableCols = COLUMNS.reduce((acc, col, i) => {
    if (["text", "num", "date"].includes(col.type)) acc.push(i);
    return acc;
  }, []);

  const handleGridKeyDown = (rowIdx, colIdx) => (e) => {
    if (e.key === "Enter" || (e.key === "Tab" && !e.shiftKey)) {
      e.preventDefault();
      const curEditIdx = editableCols.indexOf(colIdx);
      if (curEditIdx < editableCols.length - 1) {
        const nextCol = editableCols[curEditIdx + 1];
        const td = tableRef.current?.querySelector(`tbody tr:nth-child(${rowIdx + 1}) td:nth-child(${nextCol + 1})`);
        const inp = td?.querySelector("input");
        if (inp) { inp.focus(); inp.select(); }
      } else if (rowIdx < items.length - 1) {
        const nextCol = editableCols[0];
        const td = tableRef.current?.querySelector(`tbody tr:nth-child(${rowIdx + 2}) td:nth-child(${nextCol + 1})`);
        const inp = td?.querySelector("input");
        if (inp) { inp.focus(); inp.select(); }
      }
    } else if (e.key === "Tab" && e.shiftKey) {
      e.preventDefault();
      const curEditIdx = editableCols.indexOf(colIdx);
      if (curEditIdx > 0) {
        const prevCol = editableCols[curEditIdx - 1];
        const td = tableRef.current?.querySelector(`tbody tr:nth-child(${rowIdx + 1}) td:nth-child(${prevCol + 1})`);
        const inp = td?.querySelector("input");
        if (inp) { inp.focus(); inp.select(); }
      } else if (rowIdx > 0) {
        const prevCol = editableCols[editableCols.length - 1];
        const td = tableRef.current?.querySelector(`tbody tr:nth-child(${rowIdx}) td:nth-child(${prevCol + 1})`);
        const inp = td?.querySelector("input");
        if (inp) { inp.focus(); inp.select(); }
      }
    }
  };

  const EditableText = (idx, field, width, placeholder, colIdx) => (
    <TableCell sx={{ ...cellSx, width }}>
      <TextField size="small" fullWidth value={items[idx][field] ?? ""} placeholder={placeholder}
        onChange={handleItemChange(idx, field)} disabled={isView}
        onKeyDown={handleGridKeyDown(idx, colIdx)} onFocus={() => setActiveRow(idx)} />
    </TableCell>
  );
  const EditableNum = (idx, field, width, colIdx) => (
    <TableCell sx={{ ...cellSx, width }} align="right">
      <TextField type="number" size="small" fullWidth value={items[idx][field] ?? 0}
        onChange={handleItemChange(idx, field)} disabled={isView}
        onKeyDown={handleGridKeyDown(idx, colIdx)} onFocus={() => setActiveRow(idx)}
        inputProps={{ style: { textAlign: "right" } }} />
    </TableCell>
  );
  const CalcCell = (idx, field, width, emphasize) => (
    <TableCell sx={{ width, p: "2px 6px", bgcolor: "#f8fafc", ...(emphasize ? { fontWeight: 700, color: "var(--primary-main, #0077cc)" } : { fontWeight: 600, color: "#334155" }), whiteSpace: "nowrap", fontSize: "0.82rem" }} align="right">
      {num(items[idx][field])}
    </TableCell>
  );

  const [colWidths, setColWidths] = useState(COLUMNS.map((c) => c.width));
  const resizing = useRef(null);
  useEffect(() => {
    const onMove = (e) => {
      if (!resizing.current) return;
      const { idx, startX, startW } = resizing.current;
      setColWidths((prev) => { const n = [...prev]; n[idx] = Math.max(40, startW + (e.clientX - startX)); return n; });
    };
    const onUp = () => { if (resizing.current) { resizing.current = null; document.body.style.cursor = ""; } };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
  }, []);

  const startResize = (idx) => (e) => {
    e.preventDefault(); e.stopPropagation();
    resizing.current = { idx, startX: e.clientX, startW: colWidths[idx] };
    document.body.style.cursor = "col-resize";
  };

  const visibleCols = (isView ? COLUMNS.filter((c) => c.type !== "action") : COLUMNS).map((c) => ({ ...c, __i: COLUMNS.indexOf(c) }));

  const renderCell = (col, rowIdx) => {
    switch (col.type) {
      case "index": return <TableCell sx={{ fontWeight: 600, color: "#94a3b8", p: "2px 6px", fontSize: "0.8rem", textAlign: "center" }}>{rowIdx + 1}</TableCell>;
      case "text": return EditableText(rowIdx, col.field, colWidths[col.__i], col.placeholder, col.__i);
      case "num": return EditableNum(rowIdx, col.field, colWidths[col.__i], col.__i);
      case "calc": return CalcCell(rowIdx, col.field, colWidths[col.__i], col.emphasize);
      case "action":
        return (
          <TableCell align="center" sx={{ p: "2px" }}>
            <Tooltip title="Remove"><IconButton size="small" color="error" onClick={() => removeItem(rowIdx)} sx={{ opacity: 0.5, "&:hover": { opacity: 1 } }}><DeleteIcon sx={{ fontSize: 16 }} /></IconButton></Tooltip>
          </TableCell>
        );
      default: return null;
    }
  };

  if (loading) return <LinearProgress />;

  return (
    <Box sx={{ p: 3, maxWidth: 1600 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, gap: 2, flexWrap: "wrap" }}>
        <Typography variant="h4" sx={{ fontWeight: "bold", color: "var(--heading-color)" }}>
          {isView ? "Job Order Details" : isEdit ? "Edit Job Order" : "New Job Order"}
        </Typography>
        <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
          {isView ? (
            <>
              <Button variant="outlined" onClick={() => navigate("/purchase/job-orders")}>Back to List</Button>
              <Button variant="contained" color="info" onClick={() => navigate(`/purchase/job-orders/edit/${id}`)}>Edit</Button>
              <Button variant="contained" color="secondary" startIcon={<PrintIcon />} onClick={handlePrint} disabled={printing}>{printing ? "Generating..." : "View JO PDF"}</Button>
            </>
          ) : (
            <>
              <Button variant="outlined" startIcon={<CancelIcon />} onClick={() => navigate("/purchase/job-orders")} size="large">Cancel</Button>
              <Button type="submit" form="jo-form" variant="contained" startIcon={<SaveIcon />} disabled={saving} size="large">
                {saving ? "Saving..." : (isEdit ? "Update" : "Save")}
              </Button>
            </>
          )}
        </Box>
      </Box>

      <form id="jo-form" onSubmit={handleSubmit}>
        <Card sx={{ borderRadius: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.08)", mb: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2, color: "var(--heading-color)", fontWeight: 600 }}>JO Header</Typography>
            <Grid container spacing={2} alignItems="end">
              <Grid item xs={12} sm={6} sx={{ width: 340, flex: "0 0 auto" }}>
                <TextField label="Party (Supplier) *" select size="small" fullWidth value={header.party_id} sx={fsx}
                  onChange={handlePartyChange} required disabled={isView}>
                  <MenuItem value="">-- Select --</MenuItem>
                  {suppliers.map((s) => <MenuItem key={s.id} value={s.id}>{s.supplier_name} ({s.supplier_code})</MenuItem>)}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6} sx={{ width: 200, flex: "0 0 auto" }}>
                <TextField label="Department" select size="small" fullWidth value={header.department} sx={fsx}
                  onChange={(e) => setHeader({ ...header, department: e.target.value })} disabled={isView}>
                  <MenuItem value="">-- Select --</MenuItem>
                  {DEPARTMENTS.map((d) => <MenuItem key={d} value={d}>{d}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6} sx={{ width: 200, flex: "0 0 auto" }}>
                <TextField label="Req Date" size="small" fullWidth type={isView ? "text" : "date"}
                  value={isView ? fmtDate(header.req_date) : header.req_date} sx={fsx}
                  onChange={(e) => setHeader({ ...header, req_date: e.target.value })}
                  InputLabelProps={{ shrink: true }} disabled={isView} />
              </Grid>
              <Grid item xs={12} sm={6} sx={{ width: 200, flex: "0 0 auto" }}>
                <TextField label="JO Number" size="small" fullWidth value={header.order_no} sx={fsx}
                  placeholder="Auto-generated" InputLabelProps={{ shrink: true }} disabled />
              </Grid>
              <Grid item xs={12} sm={6} sx={{ width: 200, flex: "0 0 auto" }}>
                <TextField label="JO Date" size="small" fullWidth type={isView ? "text" : "date"}
                  value={isView ? fmtDate(header.jo_date) : header.jo_date} sx={fsx}
                  onChange={(e) => setHeader({ ...header, jo_date: e.target.value })}
                  InputLabelProps={{ shrink: true }} disabled={isView} />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
          <Tabs value={tab} onChange={(e, v) => setTab(v)} variant="scrollable" scrollButtons="auto" allowScrollButtonsMobile>
            <Tab label="Items" />
            <Tab label="Terms & Conditions" />
            <Tab label="Settings" />
          </Tabs>
        </Box>

        {tab === 0 && (
          <>
            {!isView && (
              <Card sx={{ borderRadius: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.08)", mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 1.5, color: "var(--heading-color)", fontWeight: 600 }}>Delivery Challan Items</Typography>
                  {!header.party_id && (
                    <Typography variant="body2" sx={{ fontStyle: "italic", color: "text.secondary" }}>No party selected — pick a Supplier to see Delivery Challan items.</Typography>
                  )}
                  {header.party_id && deliveryChallans.length === 0 && (
                    <Typography variant="body2" sx={{ fontStyle: "italic", color: "text.secondary" }}>No Delivery Challan items found for this party.</Typography>
                  )}
                  {header.party_id && deliveryChallans.length > 0 && (
                    <DCShuttle deliveryChallans={deliveryChallans} shuttleChecked={shuttleChecked} addedDCIds={addedDCIds} toggleShuttle={toggleShuttle} num={num} />
                  )}
                  {header.party_id && shuttleChecked.length > 0 && (
                    <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
                      <Button variant="contained" color="success" onClick={addDCToJO} size="large" startIcon={<AddIcon />}>
                        Add to JO Items ({shuttleChecked.filter((sid) => !addedDCIds.includes(sid)).length})
                      </Button>
                    </Box>
                  )}
                </CardContent>
              </Card>
            )}

            <Card sx={{ borderRadius: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.08)", mb: 3 }}>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }} flexWrap="wrap" gap={1}>
                  <Typography variant="h6" sx={{ color: "var(--heading-color)", fontWeight: 600 }}>Items ({items.filter((i) => i.item_name).length})</Typography>
                </Stack>

                <TableContainer ref={tableRef} sx={{ overflow: "auto", border: "1px solid #e2e8f0", borderRadius: 2, maxHeight: "calc(100vh - 340px)", minHeight: 200 }}>
                  <Table stickyHeader size="small" sx={{ tableLayout: "fixed", minWidth: visibleCols.reduce((s, c) => s + colWidths[c.__i], 0) }}>
                    <TableHead>
                      <TableRow sx={{ "& th": { bgcolor: "#f1f5f9", fontWeight: 700, fontSize: "0.72rem", color: "#334155", whiteSpace: "nowrap", p: "4px 6px", position: "relative", borderBottom: "2px solid #cbd5e1", userSelect: "none" } }}>
                        {visibleCols.map((col) => (
                          <TableCell key={col.__i} sx={{ width: colWidths[col.__i], minWidth: colWidths[col.__i], maxWidth: colWidths[col.__i], position: "relative", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {col.label}
                            {col.type !== "action" && (
                              <Box onMouseDown={startResize(col.__i)} sx={{ position: "absolute", right: 0, top: 0, height: "100%", width: 5, cursor: "col-resize", userSelect: "none", touchAction: "none", borderRight: "2px solid transparent", "&:hover": { borderRightColor: "var(--primary-main, #2563eb)" } }} />
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {items.map((it, rowIdx) => (
                        <TableRow key={rowIdx} hover onClick={() => setActiveRow(rowIdx)} sx={{ transition: "background 0.1s", ...(activeRow === rowIdx ? { bgcolor: "#eff6ff !important", "& td": { borderColor: "#bfdbfe" } } : {}), "&:hover": { bgcolor: "#f8fafc" } }}>
                          {visibleCols.map((col) => renderCell(col, rowIdx))}
                        </TableRow>
                      ))}
                      {items.length === 0 && (
                        <TableRow><TableCell colSpan={visibleCols.length} align="center" sx={{ py: 4, color: "text.secondary", fontStyle: "italic" }}>No items yet. Select DC items above and click "Add to JO Items".</TableCell></TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>

                <Stack direction="row" justifyContent="flex-end" spacing={3} sx={{ mt: 2, flexWrap: "wrap" }}>
                  <Box sx={{ textAlign: "right" }}><Typography variant="caption" color="textSecondary" display="block">Subtotal</Typography><Typography fontWeight="bold">{num(header.subtotal)}</Typography></Box>
                  <Box sx={{ textAlign: "right" }}><Typography variant="caption" color="textSecondary" display="block">Discount</Typography><Typography fontWeight="bold">{num(header.discount_amount)}</Typography></Box>
                  <Box sx={{ textAlign: "right" }}><Typography variant="caption" color="textSecondary" display="block">PF</Typography><Typography fontWeight="bold">{num(header.pf_amount)}</Typography></Box>
                  <Box sx={{ textAlign: "right" }}><Typography variant="caption" color="textSecondary" display="block">SGST</Typography><Typography fontWeight="bold">{num(header.sgst_amount)}</Typography></Box>
                  <Box sx={{ textAlign: "right" }}><Typography variant="caption" color="textSecondary" display="block">CGST</Typography><Typography fontWeight="bold">{num(header.cgst_amount)}</Typography></Box>
                  <Box sx={{ textAlign: "right" }}><Typography variant="caption" color="textSecondary" display="block">IGST</Typography><Typography fontWeight="bold">{num(header.igst_amount)}</Typography></Box>
                  <Box sx={{ textAlign: "right" }}><Typography variant="caption" color="textSecondary" display="block">Total Tax</Typography><Typography fontWeight="bold" color="error">{num(header.tax_amount)}</Typography></Box>
                  <Box sx={{ textAlign: "right" }}><Typography variant="caption" color="textSecondary" display="block">Grand Total</Typography><Typography fontWeight="bold" color="primary" variant="h6">{num(header.grand_total)}</Typography></Box>
                </Stack>
              </CardContent>
            </Card>
          </>
        )}

        {tab === 1 && (
          <Card sx={{ borderRadius: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.08)", mb: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, color: "var(--heading-color)", fontWeight: 600 }}>Terms & Conditions</Typography>
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <TextField label="Subject" size="small" fullWidth value={header.subject} sx={fsx}
                    onChange={(e) => setHeader({ ...header, subject: e.target.value })} disabled={isView} />
                </Grid>
                <Grid item xs={4}>
                  <TextField label="Reference" size="small" fullWidth value={header.reference} sx={fsx}
                    onChange={(e) => setHeader({ ...header, reference: e.target.value })} disabled={isView} />
                </Grid>
                <Grid item xs={4}>
                  <TextField label="Ref. Date" type="date" size="small" fullWidth value={header.ref_date} sx={fsx}
                    onChange={(e) => setHeader({ ...header, ref_date: e.target.value })}
                    InputLabelProps={{ shrink: true }} disabled={isView} />
                </Grid>
                <Grid item xs={4}>
                  <TextField label="Quotation No" size="small" fullWidth value={header.qtn_no} sx={fsx}
                    onChange={(e) => setHeader({ ...header, qtn_no: e.target.value })} disabled={isView} />
                </Grid>
                <Grid item xs={2}>
                  <TextField label="Old JO No" size="small" fullWidth value={header.old_jo_no} sx={fsx}
                    onChange={(e) => setHeader({ ...header, old_jo_no: e.target.value })} disabled={isView} />
                </Grid>
                <Grid item xs={2}>
                  <TextField label="JO Year" size="small" fullWidth value={header.jo_year} sx={fsx}
                    onChange={(e) => setHeader({ ...header, jo_year: e.target.value })} disabled={isView} />
                </Grid>
                <Grid item xs={12}>
                  <TextField label="Delivery Period" size="small" fullWidth value={header.delivery_period} sx={fsx}
                    onChange={(e) => setHeader({ ...header, delivery_period: e.target.value })} disabled={isView} />
                </Grid>
                <Grid item xs={4}>
                  <TextField label="Payment Terms" size="small" fullWidth value={header.payment_terms} sx={fsx}
                    onChange={(e) => setHeader({ ...header, payment_terms: e.target.value })} disabled={isView} />
                </Grid>
                <Grid item xs={4}>
                  <TextField label="Desp To" size="small" fullWidth value={header.desp_to} sx={fsx}
                    onChange={(e) => setHeader({ ...header, desp_to: e.target.value })} disabled={isView} />
                </Grid>
                <Grid item xs={4}>
                  <TextField label="Delivery Terms" size="small" fullWidth value={header.delivery_terms} sx={fsx}
                    onChange={(e) => setHeader({ ...header, delivery_terms: e.target.value })} disabled={isView} />
                </Grid>
                <Grid item xs={4}>
                  <TextField label="Insurance" size="small" fullWidth value={header.insurance} sx={fsx}
                    onChange={(e) => setHeader({ ...header, insurance: e.target.value })} disabled={isView} />
                </Grid>
                <Grid item xs={4}>
                  <TextField label="Inspection" size="small" fullWidth value={header.inspection} sx={fsx}
                    onChange={(e) => setHeader({ ...header, inspection: e.target.value })} disabled={isView} />
                </Grid>
                <Grid item xs={4}>
                  <TextField label="Freight" size="small" fullWidth value={header.freight} sx={fsx}
                    onChange={(e) => setHeader({ ...header, freight: e.target.value })} disabled={isView} />
                </Grid>
                <Grid item xs={4}>
                  <TextField label="Freight Forward" size="small" fullWidth value={header.freight_forward} sx={fsx}
                    onChange={(e) => setHeader({ ...header, freight_forward: e.target.value })} disabled={isView} />
                </Grid>
                <Grid item xs={12}>
                  <CountedTextArea label="Any Other Terms" size="small" fullWidth rows={2} value={header.any_other_terms}
                    onChange={(e) => setHeader({ ...header, any_other_terms: e.target.value })} disabled={isView} />
                </Grid>
                <Grid item xs={12}>
                  <CountedTextArea label="Notes" size="small" fullWidth rows={2} value={header.notes}
                    onChange={(e) => setHeader({ ...header, notes: e.target.value })} disabled={isView} />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        )}

        {tab === 2 && (
          <Card sx={{ borderRadius: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.08)", mb: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, color: "var(--heading-color)", fontWeight: 600 }}>Settings</Typography>
              <Grid container spacing={2} alignItems="end">
                <Grid item xs={12} sm={6} sx={{ width: 150, flex: "0 0 auto" }}>
                  <TextField label="Currency" select size="small" fullWidth value={header.currency} sx={fsx}
                    onChange={(e) => setHeader({ ...header, currency: e.target.value })} disabled={isView}>
                    {["INR", "USD", "EUR", "GBP", "AED"].map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                  </TextField>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        )}
      </form>
    </Box>
  );
}
