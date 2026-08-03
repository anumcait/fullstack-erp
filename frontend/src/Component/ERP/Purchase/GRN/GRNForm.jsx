import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
import {
  Box, Card, CardContent, Typography, TextField, Button, Grid, MenuItem,
  IconButton, LinearProgress, Table, TableHead, TableRow, TableCell, TableBody,
  InputAdornment, Tooltip, Chip, Stack, Fade, useTheme
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import SendIcon from "@mui/icons-material/Send";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import DoubleArrowIcon from "@mui/icons-material/DoubleArrow";
import AddIcon from "@mui/icons-material/Add";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import FactCheckOutlinedIcon from "@mui/icons-material/FactCheckOutlined";
import PlaylistAddCheckIcon from "@mui/icons-material/PlaylistAddCheck";
import KeyboardIcon from "@mui/icons-material/Keyboard";
import axios from "axios";
import { useToast } from "../../../../context/ToastContext";
import { useNavigate, useParams, useLocation } from "react-router-dom";

const stripPrefix = (val) => (val || "").replace(/^[A-Z]+[-\s]/i, "");
const fmt = (v, d) => {
  const n = parseFloat(v);
  if (isNaN(n) || n === 0) return "";
  if (d !== undefined) return n.toFixed(d);
  return n % 1 === 0 ? String(n) : n.toFixed(2);
};
const fmtTotal = (v, d) => {
  const n = parseFloat(v);
  if (isNaN(n)) return "0";
  if (d !== undefined) return n.toFixed(d);
  return n % 1 === 0 ? String(n) : n.toFixed(2);
};
const API = "/api/erp/stores/grn";
const PO_API = "/api/erp/purchase/orders";
const PR_API = "/api/erp/purchase/requisitions";
const SUPPLIER_API = "/api/erp/purchase/suppliers";
const SANCTIONS_API = "/api/erp/purchase/sanctions";

const DEPARTMENTS = [
  "GENERAL", "PRODUCTION", "MAINTENANCE", "QUALITY", "STORES",
  "ENGINEERING", "PLANNING", "MARKETING", "HR", "ACCOUNTS", "PURCHASE",
];

const nowLocal = () => {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()) + "T" + pad(d.getHours()) + ":" + pad(d.getMinutes());
};

function SourceShuttle({ items, shuttleChecked, loadedIds, toggleShuttle }) {
  var t = useTheme();
  var c2 = { border: t.palette.divider, textMuted: t.palette.text.secondary, textBody: t.palette.text.primary, bgSoft: t.palette.action.hover };
  const [leftSearch, setLeftSearch] = useState("");
  const [rightSearch, setRightSearch] = useState("");

  const checkedSet = useMemo(() => new Set(shuttleChecked), [shuttleChecked]);
  const loadedSet = useMemo(() => new Set(loadedIds), [loadedIds]);

  const leftItems = useMemo(() => {
    const q = leftSearch.toLowerCase();
    return items.filter(
      (d) => !checkedSet.has(d.id) && !loadedSet.has(d.id) && (!q || d.itemName.toLowerCase().includes(q) || d.itemCode.toLowerCase().includes(q) || d.prNo.toLowerCase().includes(q) || d.poNo.toLowerCase().includes(q))
    );
  }, [items, checkedSet, loadedSet, leftSearch]);

  const rightItems = useMemo(() => {
    const q = rightSearch.toLowerCase();
    return items.filter(
      (d) => (checkedSet.has(d.id) || loadedSet.has(d.id)) && (!q || d.itemName.toLowerCase().includes(q) || d.itemCode.toLowerCase().includes(q) || d.prNo.toLowerCase().includes(q) || d.poNo.toLowerCase().includes(q))
    );
  }, [items, checkedSet, loadedSet, rightSearch]);

  const leftIds = useMemo(() => new Set(leftItems.map((d) => d.id)), [leftItems]);

  const [selected, setSelected] = useState([]);

  const toggleSelect = useCallback((id) => {
    setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  }, []);

  const moveSelectedRight = useCallback(() => {
    const toMove = selected.filter((sid) => leftIds.has(sid));
    toMove.forEach((sid) => toggleShuttle(sid));
    setSelected([]);
  }, [selected, leftIds, toggleShuttle]);

  const moveSelectedLeft = useCallback(() => {
    const toMove = selected.filter((sid) => !leftIds.has(sid) && !loadedSet.has(sid));
    toMove.forEach((sid) => toggleShuttle(sid));
    setSelected([]);
  }, [selected, leftIds, loadedSet, toggleShuttle]);

  const moveAllRight = useCallback(() => {
    leftItems.forEach((d) => { if (!checkedSet.has(d.id)) toggleShuttle(d.id); });
    setSelected([]);
  }, [leftItems, checkedSet, toggleShuttle]);

  const moveAllLeft = useCallback(() => {
    shuttleChecked.forEach((sid) => { if (!loadedSet.has(sid)) toggleShuttle(sid); });
    setSelected([]);
  }, [shuttleChecked, loadedSet, toggleShuttle]);

  const searchFieldSx = {
    "& .MuiOutlinedInput-root": { fontSize: "0.8rem", borderRadius: "8px", transition: "all 0.2s" },
    "& .MuiOutlinedInput-input": { py: 0.75 },
    mb: 0.75,
  };

  const listSx = {
    border: "1px solid " + c2.border, borderRadius: "12px", minHeight: 240, maxHeight: 400,
    overflow: "auto", bgcolor: "#fff",
    "&::-webkit-scrollbar": { width: 5, height: 5 },
    "&::-webkit-scrollbar-thumb": { bgcolor: c2.border, borderRadius: 8 },
    "&::-webkit-scrollbar-track": { bgcolor: "transparent" },
  };

  const rowSx = (isSelected) => ({
    display: "flex", alignItems: "center", gap: 1,
    px: 1.25, py: 0.6, cursor: "pointer", userSelect: "none",
    borderBottom: "1px solid #f1f5f9",
    bgcolor: isSelected ? "#eef2ff" : "transparent",
    transition: "all 0.15s ease",
    "&:hover": { bgcolor: isSelected ? "#dbeafe" : "#f8fafc", transform: "translateX(2px)" },
  });

  return (
    <Stack direction="row" spacing={1} alignItems="stretch">
      <Box sx={{ flex: 1 }}>
        <Typography variant="caption" sx={{ fontWeight: 700, color: c2.textMuted, textTransform: "uppercase", letterSpacing: 0.5, mb: 0.5, display: "block", fontSize: "0.7rem" }}>
          Available ({leftItems.length})
        </Typography>
        <TextField size="small" placeholder="Search items..." variant="outlined" fullWidth
          value={leftSearch} onChange={(e) => setLeftSearch(e.target.value)} sx={searchFieldSx} />
        <Box sx={listSx}>
          {leftItems.length === 0 && (
            <Typography variant="body2" sx={{ p: 2, color: "text.secondary", textAlign: "center", fontStyle: "italic" }}>
              {leftSearch ? "No match" : "All selected \u2192"}
            </Typography>
          )}
          {leftItems.map((d) => {
            const isSelected = selected.includes(d.id);
            return (
              <Box key={d.id} sx={rowSx(isSelected)} onClick={() => toggleSelect(d.id)}
                onDoubleClick={() => { toggleShuttle(d.id); setSelected((prev) => prev.filter((x) => x !== d.id)); }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, flexWrap: "wrap", fontSize: "0.8rem" }}>
                  <Chip label={d.itemCode} size="small" sx={{ fontSize: "0.7rem", height: 20, fontWeight: 700, bgcolor: "#e0e7ff", color: "#4338ca", borderRadius: "8px" }} />
                  <Typography variant="body2" component="span" sx={{ fontWeight: 600, color: c2.textBody }}>{d.itemName}</Typography>
                  <Chip label={"Qty " + d.qty} size="small" sx={{ fontSize: "0.65rem", height: 18, bgcolor: "#fce7f3", color: "#9d174d", borderRadius: "8px" }} />
                  <Chip label={"PR No " + d.prNo.replace(/^PR[-\s]/i, "")} size="small" sx={{ fontSize: "0.65rem", height: 18, bgcolor: "#fef3c7", color: "#92400e", borderRadius: "8px" }} />
                  {d.poNo && <Chip label={"PO No " + d.poNo.replace(/^PO[-\s]/i, "")} size="small" sx={{ fontSize: "0.65rem", height: 18, bgcolor: "#dbeafe", color: "#1e40af", borderRadius: "8px" }} />}
                  {d.matCode && <Chip label={"Mat Cd " + d.matCode} size="small" sx={{ fontSize: "0.65rem", height: 18, bgcolor: "#f0fdf4", color: "#166534", borderRadius: "8px" }} />}
                </Box>
              </Box>
            );
          })}
        </Box>
      </Box>

      <Stack spacing={0.5} justifyContent="center" alignItems="center" sx={{ px: 0.5 }}>
        <Tooltip title="Move selected to right" placement="right">
          <IconButton size="small" onClick={moveSelectedRight}
            disabled={selected.length === 0 || leftItems.every((d) => !selected.includes(d.id))}
            sx={{ border: "1px solid " + c2.border, borderRadius: "8px", transition: "all 0.2s", "&:hover": { bgcolor: "#dbeafe", borderColor: "#93c5fd" } }}>
            <ChevronRightIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>
        <Tooltip title="Move all to right" placement="right">
          <IconButton size="small" onClick={moveAllRight} disabled={leftItems.length === 0}
            sx={{ border: "1px solid " + c2.border, borderRadius: "8px", transition: "all 0.2s", "&:hover": { bgcolor: "#dbeafe", borderColor: "#93c5fd" } }}>
            <DoubleArrowIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>
        <Tooltip title="Move all to left" placement="right">
          <IconButton size="small" onClick={moveAllLeft}
            disabled={shuttleChecked.filter((sid) => !loadedSet.has(sid)).length === 0}
            sx={{ border: "1px solid " + c2.border, borderRadius: "8px", transition: "all 0.2s", "&:hover": { bgcolor: "#fef2f2", borderColor: "#fca5a5" } }}>
            <DoubleArrowIcon sx={{ fontSize: 18, transform: "scaleX(-1)" }} />
          </IconButton>
        </Tooltip>
        <Tooltip title="Move selected to left" placement="right">
          <IconButton size="small" onClick={moveSelectedLeft}
            disabled={selected.length === 0 || rightItems.every((d) => !selected.includes(d.id))}
            sx={{ border: "1px solid " + c2.border, borderRadius: "8px", transition: "all 0.2s", "&:hover": { bgcolor: "#fef2f2", borderColor: "#fca5a5" } }}>
            <ChevronLeftIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>
      </Stack>

      <Box sx={{ flex: 1 }}>
        <Typography variant="caption" sx={{ fontWeight: 700, color: c2.textMuted, textTransform: "uppercase", letterSpacing: 0.5, mb: 0.5, display: "block", fontSize: "0.7rem" }}>
          Selected ({rightItems.length})
        </Typography>
        <TextField size="small" placeholder="Search items..." variant="outlined" fullWidth
          value={rightSearch} onChange={(e) => setRightSearch(e.target.value)} sx={searchFieldSx} />
        <Box sx={listSx}>
          {rightItems.length === 0 && (
            <Typography variant="body2" sx={{ p: 2, color: "text.secondary", textAlign: "center", fontStyle: "italic" }}>
              {rightSearch ? "No match" : "\u2190 Select items"}
            </Typography>
          )}
          {rightItems.map((d) => {
            const alreadyLoaded = loadedSet.has(d.id);
            const isSelected = selected.includes(d.id);
            return (
              <Box key={d.id}
                sx={{ ...rowSx(isSelected), ...(alreadyLoaded ? { opacity: 0.6, cursor: "not-allowed" } : {}) }}
                onClick={() => !alreadyLoaded && toggleSelect(d.id)}
                onDoubleClick={() => { if (!alreadyLoaded) { toggleShuttle(d.id); setSelected((prev) => prev.filter((x) => x !== d.id)); } }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, flexWrap: "wrap", fontSize: "0.8rem", flex: 1 }}>
                  <Chip label={d.itemCode} size="small" sx={{ fontSize: "0.7rem", height: 20, fontWeight: 700, bgcolor: "#e0e7ff", color: "#4338ca", borderRadius: "8px" }} />
                  <Typography variant="body2" component="span" sx={{ fontWeight: 600, color: c2.textBody }}>{d.itemName}</Typography>
                  <Chip label={"Qty " + d.qty} size="small" sx={{ fontSize: "0.65rem", height: 18, bgcolor: "#fce7f3", color: "#9d174d", borderRadius: "8px" }} />
                  <Chip label={"PR No " + d.prNo.replace(/^PR[-\s]/i, "")} size="small" sx={{ fontSize: "0.65rem", height: 18, bgcolor: "#fef3c7", color: "#92400e", borderRadius: "8px" }} />
                  {d.poNo && <Chip label={"PO No " + d.poNo.replace(/^PO[-\s]/i, "")} size="small" sx={{ fontSize: "0.65rem", height: 18, bgcolor: "#dbeafe", color: "#1e40af", borderRadius: "8px" }} />}
                  {d.matCode && <Chip label={"Mat Cd " + d.matCode} size="small" sx={{ fontSize: "0.65rem", height: 18, bgcolor: "#f0fdf4", color: "#166534", borderRadius: "8px" }} />}
                </Box>
                {alreadyLoaded && <Chip size="small" label="Loaded" color="success" variant="outlined" sx={{ fontSize: "0.65rem", height: 18, ml: "auto", borderRadius: "8px" }} />}
              </Box>
            );
          })}
        </Box>
      </Box>
    </Stack>
  );
}

export default function GRNForm() {
  const theme = useTheme();
  const { id } = useParams();
  const location = useLocation();
  const isView = location.pathname.includes("/view/");
  const isEdit = Boolean(id) && !isView;
  const { showToast } = useToast();
  const navigate = useNavigate();

  const cl = {
    border: theme.palette.divider,
    bgSoft: theme.palette.action.hover,
    bgCard: theme.palette.background.paper,
    textMuted: theme.palette.text.secondary,
    textBody: theme.palette.text.primary,
    primary: theme.palette.primary.main,
    success: theme.palette.success.main,
    error: theme.palette.error.main,
    warning: theme.palette.warning.main,
    secondary: theme.palette.secondary.main,
    primaryLight: theme.palette.primary.light,
    primaryDark: theme.palette.primary.dark,
    successLight: theme.palette.success.light,
    errorLight: theme.palette.error.light,
    chipBlue: theme.palette.primary.light,
    chipBlueText: theme.palette.primary.dark,
    chipPink: "#fce7f3",
    chipPinkText: "#9d174d",
    chipAmber: "#fef3c7",
    chipAmberText: "#92400e",
    chipGreen: "#f0fdf4",
    chipGreenText: "#166534",
    shuttleIcon: theme.palette.secondary.main,
    shuttleBg: "#ede7f6",
    accentBlue: "#dbeafe",
    accentGreen: "#e8f5e9",
    accentGreenTotal: "#c8e6c9",
    accentBlueTotal: "#90caf9",
    totalsBg: "#e8eefc",
    rowActive: theme.palette.action.selected,
    rowHover: theme.palette.action.hover,
    tableBorder: theme.palette.divider,
    tableHeaderBg: theme.palette.action.hover,
    summaryBg: "#f8fafc",
    gradientStart: theme.palette.primary.dark,
    gradientEnd: theme.palette.primary.main,
  };

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [allPOs, setAllPOs] = useState([]);
  const [allPRs, setAllPRs] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [filterText, setFilterText] = useState("");
  const [sanctions, setSanctions] = useState([]);
  const [shuttleChecked, setShuttleChecked] = useState([]);
  const [loadedSanctionIds, setLoadedSanctionIds] = useState([]);
  const [prFilter, setPrFilter] = useState("");
  const [poFilter, setPoFilter] = useState("");

  const [header, setHeader] = useState({
    ir_no: "", ir_date: nowLocal(), year: String(new Date().getFullYear()),
    dept_cd: "", supplier_id: "", pr_id: "", po_id: "",
    invoice_no: "", invoice_date: "", inward_date: "",
    status: "Draft", received_by: "", notes: "",
    approval_status: "Pending", approved_by: "", approved_date: "", approval_remarks: "",
    qa_status: "Pending", qa_by: "", qa_date: "", qa_remarks: "",
  });
  const [items, setItems] = useState([]);
  const tableRef = useRef(null);
  const [activeRow, setActiveRow] = useState(null);
  const [errors, setErrors] = useState({});

  const GRID_COLS = [
    { label: "SL#", width: 40 },
    { label: "PR#", width: 40 },
    { label: "PO#", width: 40 },
    { label: "Item Code", width: 70 },
    { label: "Item Description", width: 200 },
    { label: "UOM", width: 45 },
    { label: "Qty", width: 40 },
    { label: "UT Rep#", width: 50 },
    { label: "Dia", width: 50 },
    { label: "Len", width: 50 },
    { label: "Wid", width: 50 },
    { label: "Thk", width: 50 },
    { label: "KG Recv.", width: 60 },
    { label: "KG Accp", width: 60 },
    { label: "Phy Wt", width: 60 },
    { label: "Rec Qty", width: 60 },
    { label: "Supp Qty", width: 60 },
    { label: "Accp Qty", width: 60 },
    { label: "Rej<br>Qty", width: 55 },
    { label: "Remarks", width: 100 },
  ];
  const EDITABLE_COLS = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 19];
  const colWidths = useRef(GRID_COLS.map(function (c) { return c.width; }));
  const [, bump] = useState(0);

  const handleColResize = useCallback(function (colIdx) {
    return function (e) {
      e.preventDefault();
      e.stopPropagation();
      var startX = e.clientX;
      var startWidth = colWidths.current[colIdx];
      var onMouseMove = function (me) {
        var newWidth = Math.max(20, startWidth + me.clientX - startX);
        colWidths.current[colIdx] = newWidth;
        bump(function (n) { return n + 1; });
      };
      var onMouseUp = function () {
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      };
      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    };
  }, []);

  useEffect(function () {
    Promise.all([
      axios.get(PO_API).catch(function () { return { data: [] }; }),
      axios.get(PR_API, { params: { status: "Approved" } }).catch(function () { return { data: [] }; }),
      axios.get(SUPPLIER_API, { params: { is_active: true } }).catch(function () { return { data: [] }; }),
    ]).then(function (results) {
      setAllPOs(results[0].data || []);
      setAllPRs(results[1].data || []);
      setSuppliers(results[2].data || []);
    });
  }, []);

  useEffect(function () {
    var sid = Number(header.supplier_id);
    if (sid) {
      axios.get(SANCTIONS_API, { params: { supplier_id: sid } }).then(function (resp) {
        setSanctions(resp.data || []);
      }).catch(function () { setSanctions([]); });
    } else {
      setSanctions([]);
    }
  }, [header.supplier_id]);

  var fetchNextGRN = useCallback(function () {
    if (id) return;
    axios.get(API + "/next-number").then(function (resp) {
      setHeader(function (h) { return { ...h, ir_no: resp.data.ir_no || "" }; });
    }).catch(function () { });
  }, [id]);

  useEffect(function () {
    fetchNextGRN();
  }, [fetchNextGRN]);

  useEffect(function () {
    if (id) {
      setLoading(true);
      axios.get(API + "/" + id).then(function (resp) {
        var data = resp.data;
        setHeader({
          ir_no: data.ir_no || "", ir_date: data.ir_date ? data.ir_date.slice(0, 16) : nowLocal(),
          year: data.year || String(new Date().getFullYear()),
          dept_cd: data.dept_cd || "", supplier_id: data.supplier_id || "",
          pr_id: data.pr_id || "", po_id: data.po_id || "",
          invoice_no: data.invoice_no || "", invoice_date: data.invoice_date ? data.invoice_date.split("T")[0] : "",
          inward_date: data.inward_date ? data.inward_date.split("T")[0] : "",
          status: data.status || "Draft", received_by: data.received_by || "", notes: data.notes || "",
          approval_status: data.approval_status || "Pending", approved_by: data.approved_by || "",
          approved_date: data.approved_date ? data.approved_date.split("T")[0] : "", approval_remarks: data.approval_remarks || "",
          qa_status: data.qa_status || "Pending", qa_by: data.qa_by || "",
          qa_date: data.qa_date ? data.qa_date.split("T")[0] : "", qa_remarks: data.qa_remarks || "",
        });
        if (data.items) setItems(data.items.map(function (it) {
          return {
            po_item_id: it.po_item_id, pr_item_id: it.pr_item_id,
            item_id: it.item_id, item_code: it.item_code || "", item_name: it.item_name || "",
            pr_no: it.pr_no || "", po_no: it.po_no || "",
            rep: it.rep || "", dia: parseFloat(it.dia || 0), len: parseFloat(it.len || 0),
            wid: parseFloat(it.wid || 0), thk: parseFloat(it.thk || 0), uom: it.uom || "NOS",
            kg: parseFloat(it.kg || 0), recv_kg: parseFloat(it.recv_kg || 0),
            accp: parseFloat(it.accp || 0), phy: parseFloat(it.phy || 0),
            weight: parseFloat(it.weight || 0),
            ordered_qty: parseFloat(it.ordered_qty || 0), received_qty: parseFloat(it.received_qty || 0),
            accepted_qty: parseFloat(it.accepted_qty || 0), rejected_qty: parseFloat(it.rejected_qty || 0),
            supp_qty: parseFloat(it.supp_qty || 0), reject_reason: it.reject_reason || "",
            rate: parseFloat(it.rate || 0), gst_rate: parseFloat(it.gst_rate || 0),
            gst_amount: parseFloat(it.gst_amount || 0), amount: parseFloat(it.amount || 0),
          };
        }));
      }).catch(function () { showToast("Failed to load GRR", "error"); }).finally(function () { setLoading(false); });
    }
  }, [id]);

  var handleHeaderChange = useCallback(function (field) {
    return function (e) {
      var v = e.target.value;
      setHeader(function (h) { return { ...h, [field]: v }; });
      setErrors(function (prev) { return { ...prev, [field]: "" }; });
    };
  }, []);

  var removeItem = useCallback(function (idx) {
    var removed = items[idx];
    setItems(function (prev) { return prev.filter(function (_, i) { return i !== idx; }); });
    if (removed && removed.pr_item_id) {
      var sanction = sanctions.find(function (s) { return s.pr_item_id === removed.pr_item_id; });
      if (sanction) setLoadedSanctionIds(function (prev) { return prev.filter(function (sid) { return sid !== sanction.id; }); });
    }
  }, [items, sanctions]);

  var handleItemChange = useCallback(function (idx, field) {
    return function (e) {
      setItems(function (prev) {
        var updated = prev.slice();
        updated[idx][field] = e.target.value;
        if (["accepted_qty", "rate", "gst_rate", "ordered_qty"].indexOf(field) >= 0) {
          var accepted = parseFloat(updated[idx].accepted_qty) || 0;
          var rate = parseFloat(updated[idx].rate) || 0;
          var gstRate = parseFloat(updated[idx].gst_rate) || 0;
          updated[idx].received_qty = accepted;
          updated[idx].amount = accepted * rate;
          updated[idx].gst_amount = updated[idx].amount * gstRate / 100;
        }
        return updated;
      });
    };
  }, []);

  var canEdit = header.status === "Draft" && !isView;
  var canSubmit = header.status === "Draft" && items.some(function (i) { return parseFloat(i.accepted_qty) > 0; });

  var validate = useCallback(function () {
    var errs = {};
    if (!header.ir_no) errs.ir_no = "Required";
    if (!header.ir_date) errs.ir_date = "Required";
    if (!header.supplier_id) errs.supplier_id = "Select a party";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }, [header]);

  var save = useCallback(function (status, e) {
    if (e) e.preventDefault();
    if (!validate()) { showToast("Please fill required fields", "warning"); return; }
    if (items.length === 0) { showToast("Add at least one item", "warning"); return; }
    if (status === "Received" && !items.some(function (i) { return parseFloat(i.accepted_qty) > 0; })) {
      showToast("Add at least one item with accepted qty > 0", "warning"); return;
    }
    setSaving(true);
    var saveWithNumber = function (grnNumber) {
      var payload = {
        ...header, ir_type: "GRR", status,
        ir_no: grnNumber || header.ir_no,

        received_by: header.received_by || localStorage.getItem("empName") || "",
        supplier_id: parseInt(header.supplier_id) || null,
        po_id: null, pr_id: null,
        items: items.map(function (i) {
          return {
            po_item_id: i.po_item_id || null, pr_item_id: i.pr_item_id || null, item_id: i.item_id || null,
            item_code: i.item_code || "", item_name: i.item_name || "",
            pr_no: i.pr_no || "", po_no: i.po_no || "",
            rep: i.rep || "", dia: parseFloat(i.dia) || 0, len: parseFloat(i.len) || 0,
            wid: parseFloat(i.wid) || 0, thk: parseFloat(i.thk) || 0, uom: i.uom || "NOS",
            kg: parseFloat(i.kg) || 0, recv_kg: parseFloat(i.recv_kg) || 0,
            accp: parseFloat(i.accp) || 0, phy: parseFloat(i.phy) || 0, weight: parseFloat(i.weight) || 0,
            ordered_qty: parseFloat(i.ordered_qty) || 0, received_qty: parseFloat(i.received_qty) || 0,
            accepted_qty: parseFloat(i.accepted_qty) || 0, rejected_qty: parseFloat(i.rejected_qty) || 0,
            supp_qty: parseFloat(i.supp_qty) || 0, reject_reason: i.reject_reason || "",
            rate: parseFloat(i.rate) || 0, gst_rate: parseFloat(i.gst_rate) || 0,
            gst_amount: parseFloat(i.gst_amount) || 0, amount: parseFloat(i.amount) || 0,
          };
        }),
      };
      var request;
      if (isEdit) {
        request = axios.put(API + "/" + id, payload);
      } else {
        request = axios.post(API, payload);
      }
      request.then(function () {
        showToast(isEdit ? "Updated" : "Created", "success");
        navigate("/stores/grr");
      }).catch(function (err) {
        showToast((err.response && err.response.data && err.response.data.error) || "Failed", "error");
      }).finally(function () {
        setSaving(false);
      });
    };
    if (!id && !isEdit) {
      axios.get(API + "/next-number").then(function (resp) {
        saveWithNumber(resp.data.ir_no);
      }).catch(function () { saveWithNumber(header.ir_no); });
    } else {
      saveWithNumber(header.ir_no);
    }
  }, [header, items, isEdit, id, validate, showToast, navigate]);

  var handleSubmit = useCallback(function (status) {
    return function (e) { save(status, e); };
  }, [save]);

  var toggleShuttle = useCallback(function (sid) {
    setShuttleChecked(function (prev) {
      return prev.includes(sid) ? prev.filter(function (x) { return x !== sid; }) : prev.concat([sid]);
    });
  }, []);

  var uniquePrIds = useMemo(function () {
    var ids = new Set();
    sanctions.forEach(function (s) { if (s.requisition && s.requisition.id) ids.add(s.requisition.id); });
    return Array.from(ids);
  }, [sanctions]);

  var filteredSanctions = useMemo(function () {
    var result = sanctions.slice();
    if (prFilter) result = result.filter(function (s) { return s.requisition && s.requisition.id === Number(prFilter); });
    if (poFilter) {
      var po = allPOs.find(function (p) { return p.id === Number(poFilter); });
      if (po) {
        var poPrNos = new Set((po.items || []).map(function (i) { return i.pr_no; }).filter(Boolean));
        result = result.filter(function (s) { return s.requisition && poPrNos.has(s.requisition.req_no); });
      }
    }
    return result;
  }, [sanctions, prFilter, poFilter, allPOs]);

  var shuttleItems = useMemo(function () {
    var poByPrNo = {};
    allPOs.filter(function (po) { return po.supplier_id === Number(header.supplier_id); }).forEach(function (po) {
      (po.items || []).forEach(function (poi) {
        if (poi.pr_no) poByPrNo[poi.pr_no] = po.po_no || "PO#" + po.id;
      });
    });
    return filteredSanctions.map(function (s) {
      return {
        id: s.id,
        itemCode: (s.prItem && s.prItem.item_code) || "---",
        itemName: (s.prItem && s.prItem.item_name) || "",
        qty: Number(s.sanctioned_qty || 0),
        rate: Number(s.rate || 0).toFixed(2),
        prNo: (s.requisition && s.requisition.req_no) || "---",
        poNo: poByPrNo[s.requisition && s.requisition.req_no] || "",
        matCode: (s.prItem && (s.prItem.material_item_code || s.prItem.alt_code)) || "",
        prId: s.requisition && s.requisition.id,
        prItemId: s.pr_item_id,
        itemId: (s.prItem && (s.prItem.item_id || s.prItem.id)),
        uom: (s.prItem && s.prItem.uom) || "NOS",
      };
    });
  }, [filteredSanctions, allPOs, header.supplier_id]);

  var loadItemsFromSources = useCallback(function () {
    var toLoad = shuttleChecked.filter(function (sid) { return loadedSanctionIds.indexOf(sid) < 0; });
    if (toLoad.length === 0) { showToast("Select items to load", "warning"); return; }
    var poByPrNo = {};
    var poItemByPrItem = {};
    allPOs.filter(function (po) { return po.supplier_id === Number(header.supplier_id); }).forEach(function (po) {
      (po.items || []).forEach(function (poi) {
        if (poi.pr_no) {
          poByPrNo[poi.pr_no] = po.po_no || "PO#" + po.id;
          if (poi.item_id) {
            poItemByPrItem[poi.pr_no + ":" + poi.item_id] = poi;
          }
        }
      });
    });
    var newItems = toLoad.map(function (sid) {
      var s = sanctions.find(function (san) { return san.id === sid; });
      if (!s) return null;
      var it = s.prItem || {};
      var reqNo = (s.requisition && s.requisition.req_no) || "";
      var itemId = it.item_id || it.id || null;
      var poItem = poItemByPrItem[reqNo + ":" + itemId];
      return {
        po_item_id: poItem ? poItem.id : null, pr_item_id: s.pr_item_id, item_id: itemId,
        item_code: it.item_code || "", item_name: it.item_name || "",
        pr_no: reqNo, po_no: poByPrNo[reqNo] || "",
        rep: "", dia: 0, len: 0, wid: 0, thk: 0, uom: it.uom || "NOS",
        kg: 0, recv_kg: 0, accp: 0, phy: 0, weight: 0,
        ordered_qty: Number(s.sanctioned_qty || 0), received_qty: 0, accepted_qty: 0, rejected_qty: 0,
        supp_qty: 0, reject_reason: "",
        rate: poItem ? Number(poItem.rate || 0) : Number(s.rate || 0),
        gst_rate: poItem ? Number(poItem.gst_rate || 0) : 0,
        gst_amount: 0, amount: 0,
      };
    }).filter(Boolean);
    if (newItems.length === 0) { showToast("No items to load", "warning"); return; }
    setItems(function (prev) { return prev.concat(newItems); });
    setLoadedSanctionIds(function (prev) { return Array.from(new Set(prev.concat(toLoad))); });
    setShuttleChecked(function (prev) { return prev.filter(function (sid) { return toLoad.indexOf(sid) < 0; }); });
    showToast(newItems.length + " item(s) loaded", "success");
  }, [shuttleChecked, loadedSanctionIds, allPOs, header.supplier_id, sanctions, showToast]);

  useEffect(function () {
    if (id && items.length > 0 && sanctions.length > 0) {
      var matched = items.map(function (it) {
        var s = sanctions.find(function (san) { return san.pr_item_id === it.pr_item_id; });
        return s && s.id;
      }).filter(Boolean);
      setLoadedSanctionIds(function (prev) { return Array.from(new Set(prev.concat(matched))); });
    }
  }, [id, items, sanctions]);

  var handleGridKeyDown = useCallback(function (e) {
    if (!canEdit) return;
    var isForward = e.key === "Enter" || (e.key === "Tab" && !e.shiftKey);
    var isBackward = e.key === "Tab" && e.shiftKey;
    if (!isForward && !isBackward) return;
    e.preventDefault();
    var inp = e.currentTarget.querySelector("input") || document.activeElement;
    if (!inp) return;
    var row = inp.closest("tr");
    if (!row) return;
    var inputs = row.querySelectorAll("input");
    var curIdx = Array.prototype.indexOf.call(inputs, inp);
    if (curIdx < 0) return;
    if (isForward) {
      if (curIdx < inputs.length - 1) {
        inputs[curIdx + 1].focus();
        inputs[curIdx + 1].select();
      } else {
        var nextRow = row.nextElementSibling;
        if (nextRow) {
          var nextInputs = nextRow.querySelectorAll("input");
          if (nextInputs.length > 0) { nextInputs[0].focus(); nextInputs[0].select(); }
        }
      }
    } else {
      if (curIdx > 0) {
        inputs[curIdx - 1].focus();
        inputs[curIdx - 1].select();
      } else {
        var prevRow = row.previousElementSibling;
        if (prevRow) {
          var prevInputs = prevRow.querySelectorAll("input");
          if (prevInputs.length > 0) { prevInputs[prevInputs.length - 1].focus(); prevInputs[prevInputs.length - 1].select(); }
        }
      }
    }
  }, [canEdit]);

  var fsx = {
    "& .MuiInputBase-root": { fontSize: "0.88rem", height: 34, borderRadius: "8px", transition: "all 0.2s" },
    "& .MuiInputLabel-root": { fontSize: "0.88rem", mt: -0.25 },
    "& .MuiInputLabel-shrink": { mt: 0 }
  };

  var cellInputSx = {
    "& .MuiInputBase-root": { fontSize: "0.85rem", height: 30, borderRadius: "6px" },
    "& .MuiInputBase-input": { px: 0.75 },
    "& input[type=number]": { MozAppearance: "textfield" },
    "& input[type=number]::-webkit-outer-spin-button, & input[type=number]::-webkit-inner-spin-button": { WebkitAppearance: "none", margin: 0 },
  };

  var filteredItems = useMemo(function () {
    var q = filterText.trim().toLowerCase();
    if (!q) return items;
    return items.filter(function (it) {
      return Object.values(it).some(function (v) { return String(v || "").toLowerCase().indexOf(q) >= 0; });
    });
  }, [items, filterText]);

  var totals = useMemo(function () {
    return items.reduce(function (a, i) {
      return {
        kr: a.kr + (parseFloat(i.recv_kg) || 0),
        ka: a.ka + (parseFloat(i.accp) || 0),
        pw: a.pw + (parseFloat(i.phy) || 0),
        qr: a.qr + (parseFloat(i.received_qty) || 0),
        qs: a.qs + (parseFloat(i.supp_qty) || 0),
        qa: a.qa + (parseFloat(i.accepted_qty) || 0),
      };
    }, { kr: 0, ka: 0, pw: 0, qr: 0, qs: 0, qa: 0 });
  }, [items]);

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <LinearProgress sx={{ height: 4, borderRadius: 2, mb: 1 }} />
        <Typography variant="body2" sx={{ color: "text.secondary", textAlign: "center", mt: 2 }}>Loading GRR...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 1.5, md: 3 }, maxWidth: 1600, fontSize: "0.95rem" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, flexWrap: "wrap", gap: 1 }}>
        <Typography variant="h4" sx={{ fontWeight: "bold", color: "var(--heading-color)" }}>
          {isView ? "GRR Details" : isEdit ? "Edit GRR" : "GRR Entry"}
          {header.status && (
            <Chip label={header.status} size="small" sx={{ ml: 1.5, verticalAlign: "middle" }}
              color={header.status === "Received" ? "success" : header.status === "Draft" ? "default" : "primary"} />
          )}
        </Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          {canEdit && (
            <>
              <Button variant="contained" color="primary" size="medium" onClick={handleSubmit("Draft")}
                startIcon={<SaveIcon />} disabled={saving}>
                {saving ? "Saving..." : "Save as Draft"}
              </Button>
              <Button variant="contained" color="success" size="medium"
                startIcon={<SendIcon />} disabled={saving || !canSubmit}
                onClick={handleSubmit("Received")}>
                {saving ? "Saving..." : "Submit & Receive"}
              </Button>
            </>
          )}
          <Button variant="outlined" color="secondary" size="medium" startIcon={<CancelIcon />}
            onClick={function () { navigate("/stores/grr"); }}>
            {isView ? "Back" : "Cancel"}
          </Button>
        </Box>
      </Box>

      <Fade in timeout={500}>
        <Card sx={{ borderRadius: "16px", boxShadow: "0 1px 8px rgba(0,0,0,0.06)", mb: 2.5, border: "1px solid " + cl.border, overflow: "visible", transition: "box-shadow 0.3s", "&:hover": { boxShadow: "0 4px 16px rgba(0,0,0,0.08)" } }}>
          <CardContent sx={{ p: { xs: 1.5, md: 2.5 }, "&:last-child": { pb: { xs: 1.5, md: 2.5 } } }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
              <Box sx={{ width: 32, height: 32, borderRadius: "10px", bgcolor: "#dbeafe", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <InfoOutlinedIcon sx={{ fontSize: 18, color: "#1976d2" }} />
              </Box>
              <Typography variant="subtitle2" sx={{ color: cl.textBody, fontWeight: 700, fontSize: "1.05rem" }}>
                Header Information
              </Typography>
            </Box>
            <Box sx={{ display: "flex", gap: 1.5, mb: 1.5, flexWrap: "wrap", alignItems: "flex-start" }}>
              <Box sx={{ width: 160 }}>
                <TextField label="GRR #" size="small" fullWidth value={header.ir_no}
                  disabled error={Boolean(errors.ir_no)} helperText={errors.ir_no}
                  InputLabelProps={{ shrink: true }} sx={fsx} />
              </Box>
              <Box sx={{ width: 200 }}>
                <TextField label="GRR Date" type="datetime-local" size="small" fullWidth value={header.ir_date}
                  disabled error={Boolean(errors.ir_date)} helperText={errors.ir_date}
                  InputLabelProps={{ shrink: true }} sx={fsx} />
              </Box>
              <Box sx={{ width: 135 }}>
                <TextField label="Year" size="small" fullWidth value={header.year}
                  disabled InputLabelProps={{ shrink: true }} sx={fsx} />
              </Box>
              <Box sx={{ width: 220, minWidth: 220 }}>
                <TextField select size="small" fullWidth label="Dept Cd" value={header.dept_cd}
                  onChange={handleHeaderChange("dept_cd")} disabled={isView} InputLabelProps={{ shrink: true }}
                  SelectProps={{ displayEmpty: true }} sx={fsx}>
                  <MenuItem value="">-- Select --</MenuItem>
                  {DEPARTMENTS.map(function (d) { return <MenuItem key={d} value={d}>{d}</MenuItem>; })}
                </TextField>
              </Box>
            </Box>
            <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", alignItems: "flex-start" }}>
              <Box sx={{ width: 520, maxWidth: "100%" }}>
                <TextField select size="small" fullWidth label="Party Name" value={header.supplier_id}
                  onChange={function (e) {
                    var v = e.target.value;
                    setHeader(function (h) { return { ...h, supplier_id: v }; });
                    setShuttleChecked([]);
                    setLoadedSanctionIds([]);
                    setItems([]);
                    setPrFilter("");
                    setPoFilter("");
                  }}
                  disabled={isView} InputLabelProps={{ shrink: true }}
                  error={Boolean(errors.supplier_id)} helperText={errors.supplier_id}
                  SelectProps={{ displayEmpty: true }} sx={fsx}>
                  <MenuItem value="">-- Select Party --</MenuItem>
                  {suppliers.map(function (s) { return <MenuItem key={s.id} value={s.id}>{s.supplier_name}</MenuItem>; })}
                </TextField>
                {function () {
                  var s = suppliers.find(function (x) { return Number(x.id) === Number(header.supplier_id); });
                  if (!s) return null;
                  var addr = [s.address_line1, s.address_line2, s.city, s.state, s.pincode].filter(Boolean).join(", ");
                  return (
                    <Box sx={{ mt: 0.5, px: 1.5, py: 0.75, bgcolor: cl.bgSoft, borderRadius: "8px", border: "1px solid " + cl.border }}>
                      <Typography variant="caption" sx={{ color: cl.textMuted, fontSize: "0.7rem", lineHeight: 1.4 }}>
                        {s.supplier_name}{s.gstin ? " | GST: " + s.gstin : ""}
                        {addr ? <><br />{addr}</> : ""}
                        {s.phone || s.mobile ? <><br />Ph: {s.phone || s.mobile}</> : ""}
                      </Typography>
                    </Box>
                  );
                }()}
              </Box>
              <Box sx={{ width: 140 }}>
                <TextField select size="small" fullWidth label="PR No" value={prFilter}
                  onChange={function (e) { setPrFilter(e.target.value); }}
                  disabled={isView || !header.supplier_id} InputLabelProps={{ shrink: true }}
                  SelectProps={{ displayEmpty: true }} sx={fsx}>
                  <MenuItem value="">-- All PRs --</MenuItem>
                  {allPRs.filter(function (pr) { return uniquePrIds.indexOf(pr.id) >= 0; }).map(function (pr) {
                    return <MenuItem key={pr.id} value={String(pr.id)}>{pr.req_no}</MenuItem>;
                  })}
                </TextField>
              </Box>
              <Box sx={{ width: 140 }}>
                <TextField select size="small" fullWidth label="PO No" value={poFilter}
                  onChange={function (e) { setPoFilter(e.target.value); }}
                  disabled={isView || !header.supplier_id} InputLabelProps={{ shrink: true }}
                  SelectProps={{ displayEmpty: true }} sx={fsx}>
                  <MenuItem value="">-- All POs --</MenuItem>
                  {allPOs.filter(function (po) { return po.supplier_id === Number(header.supplier_id); }).map(function (po) {
                    return <MenuItem key={po.id} value={String(po.id)}>{po.po_no}</MenuItem>;
                  })}
                </TextField>
              </Box>
              <Box sx={{ width: 130 }}>
                <TextField label="Supplier DC#" size="small" fullWidth value={header.invoice_no}
                  onChange={handleHeaderChange("invoice_no")} disabled={isView} InputLabelProps={{ shrink: true }} sx={fsx} />
              </Box>
              <Box sx={{ width: 130 }}>
                <TextField label="DC Date" type="date" size="small" fullWidth value={header.invoice_date}
                  onChange={handleHeaderChange("invoice_date")} disabled={isView} InputLabelProps={{ shrink: true }} sx={fsx} />
              </Box>
              <Box sx={{ width: 130 }}>
                <TextField label="Inward Date" type="date" size="small" fullWidth value={header.inward_date}
                  onChange={handleHeaderChange("inward_date")} disabled={isView} InputLabelProps={{ shrink: true }} sx={fsx} />
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Fade>

      {canEdit && Boolean(header.supplier_id) && (
        <Fade in timeout={400}>
          <Card sx={{ borderRadius: "16px", boxShadow: "0 1px 8px rgba(0,0,0,0.06)", mb: 2.5, border: "1px solid " + cl.border, transition: "box-shadow 0.3s", "&:hover": { boxShadow: "0 4px 16px rgba(0,0,0,0.08)" } }}>
            <CardContent sx={{ p: { xs: 1.5, md: 2.5 }, "&:last-child": { pb: { xs: 1.5, md: 2.5 } } }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                <Box sx={{ width: 32, height: 32, borderRadius: "10px", bgcolor: "#ede7f6", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Inventory2OutlinedIcon sx={{ fontSize: 18, color: "#9c27b0" }} />
                </Box>
                <Typography variant="subtitle2" sx={{ color: cl.textBody, fontWeight: 700, fontSize: "1.05rem" }}>
                  Sanctioned Items
                </Typography>
                {sanctions.length > 0 && (
                  <Chip label={sanctions.length + " total"} size="small"
                    sx={{ fontSize: "0.7rem", height: 20, fontWeight: 600, borderRadius: "8px", bgcolor: "#f3e8ff", color: "#7c3aed" }} />
                )}
              </Box>
              {sanctions.length === 0 && (
                <Box sx={{ textAlign: "center", py: 4, color: "#94a3b8" }}>
                  <Inventory2OutlinedIcon sx={{ fontSize: 40, mb: 1, opacity: 0.4 }} />
                  <Typography variant="body2" sx={{ fontStyle: "italic" }}>
                    No sanctioned items found for this party.
                  </Typography>
                </Box>
              )}
              {sanctions.length > 0 && filteredSanctions.length === 0 && prFilter && (
                <Box sx={{ textAlign: "center", py: 3, color: "#94a3b8" }}>
                  <SearchIcon sx={{ fontSize: 32, mb: 1, opacity: 0.4 }} />
                  <Typography variant="body2" sx={{ fontStyle: "italic" }}>
                    No items match the selected filter.
                  </Typography>
                </Box>
              )}
              {shuttleItems.length > 0 && (
                <SourceShuttle
                  items={shuttleItems}
                  shuttleChecked={shuttleChecked}
                  loadedIds={loadedSanctionIds}
                  toggleShuttle={toggleShuttle}
                />
              )}
              {shuttleChecked.length > 0 && (
                <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
                  <Button variant="contained" color="success" onClick={loadItemsFromSources}
                    startIcon={<AddIcon />}
                    sx={{ borderRadius: "10px", px: 3, fontWeight: 600, boxShadow: "0 2px 12px rgba(46,125,50,0.25)" }}>
                    Load Items ({shuttleChecked.filter(function (sid) { return loadedSanctionIds.indexOf(sid) < 0; }).length})
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Fade>
      )}

      <Fade in timeout={600}>
        <Card sx={{ borderRadius: "16px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", border: "1px solid " + cl.border, transition: "box-shadow 0.3s", "&:hover": { boxShadow: "0 4px 20px rgba(0,0,0,0.08)" } }}>
          <CardContent sx={{ p: { xs: 1.5, md: 2.5 }, "&:last-child": { pb: { xs: 1.5, md: 2.5 } } }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2, flexWrap: "wrap", gap: 1.5 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Box sx={{ width: 32, height: 32, borderRadius: "10px", bgcolor: "#e8f5e9", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <FactCheckOutlinedIcon sx={{ fontSize: 18, color: "#2e7d32" }} />
                </Box>
                <Typography variant="subtitle1" sx={{ color: cl.textBody, fontWeight: 700, fontSize: "1.1rem" }}>
                  GRR Selected Details
                </Typography>
                {items.length > 0 && (
                  <Chip label={filteredItems.length + " of " + items.length} size="small"
                    sx={{ fontSize: "0.7rem", height: 20, fontWeight: 600, borderRadius: "8px", bgcolor: "#e8f5e9", color: "#2e7d32" }} />
                )}
              </Box>
              <Box sx={{ display: "flex", gap: 1.5, alignItems: "center", flexWrap: "wrap" }}>
                <TextField size="small" placeholder="Search items..." value={filterText} onChange={function (e) { setFilterText(e.target.value); }}
                  InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" color="action" /></InputAdornment> }}
                  sx={{ "& .MuiInputBase-root": { fontSize: "0.8rem", height: 32, width: 220, borderRadius: "8px", bgcolor: "#f8fafc", transition: "all 0.2s", "&:hover": { bgcolor: cl.bgSoft }, "&.Mui-focused": { width: 260 } } }} />
              </Box>
            </Box>
            <Box sx={{ overflowX: "auto" }} ref={tableRef}>
              <Table size="small" sx={{ borderCollapse: "collapse", tableLayout: "fixed", width: "100%" }}>
                <TableHead>
                  <TableRow>
                    {GRID_COLS.map(function (c, i) {
                      var parts = c.label.split("<br>");
                      return (
                        <TableCell key={c.label} sx={{ fontWeight: 700, fontSize: "0.75rem", py: 0.75, px: 0.75, color: cl.textBody, bgcolor: cl.bgSoft, width: colWidths.current[i], minWidth: colWidths.current[i], border: "1px solid " + cl.border, position: "relative", whiteSpace: "normal", wordBreak: "break-word" }}>
                          {parts.length > 1 ? parts.map(function (p, pi) { return pi > 0 ? <React.Fragment key={pi}><br />{p}</React.Fragment> : p; }) : c.label}
                          <Box sx={{ position: "absolute", right: 0, top: 0, bottom: 0, width: 5, cursor: "col-resize", transition: "background 0.2s", "&:hover": { bgcolor: "primary.main", opacity: 0.8 } }} onMouseDown={handleColResize(i)} />
                        </TableCell>
                      );
                    })}
                    {canEdit && <TableCell sx={{ width: 45, py: 0.85, bgcolor: cl.bgSoft, border: "1px solid " + cl.border }} />}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredItems.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={canEdit ? GRID_COLS.length + 1 : GRID_COLS.length} align="center" sx={{ py: 5, border: "1px solid " + cl.border }}>
                        <Box sx={{ textAlign: "center", color: "#94a3b8" }}>
                          <PlaylistAddCheckIcon sx={{ fontSize: 36, mb: 1, opacity: 0.4 }} />
                          <Typography variant="body2" sx={{ fontStyle: "italic" }}>
                            {items.length === 0 ? "No GRR Details Found — Select items from the Sanctioned Items panel above" : "No items match your search"}
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  )}
                  {filteredItems.map(function (it, idx) {
                    return (
                      <TableRow key={idx} hover sx={{
                        verticalAlign: "top",
                        bgcolor: activeRow === idx ? "#e8f0fe" : idx % 2 === 0 ? "#ffffff" : "#fafcff",
                        transition: "background 0.15s",
                        "& td": { py: 0.5, px: 0.5, border: "1px solid " + cl.border, transition: "background 0.15s" },
                        "&:hover td": { bgcolor: activeRow === idx ? "#e8f0fe" : cl.bgSoft }
                      }}>
                        <TableCell sx={{ fontSize: "0.75rem", color: "#94a3b8", textAlign: "center" }}>{idx + 1}</TableCell>
                        <TableCell sx={{ fontSize: "0.75rem", color: "#334155", textAlign: "center" }}>{stripPrefix(it.pr_no)}</TableCell>
                        <TableCell sx={{ fontSize: "0.75rem", color: "#334155", textAlign: "center" }}>{stripPrefix(it.po_no)}</TableCell>
                        <TableCell sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155", px: 0.5 }}>{it.item_code}</TableCell>
                        <TableCell sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155", px: 0.5 }}>{it.item_name || ""}</TableCell>
                        <TableCell sx={{ fontSize: "0.75rem", px: 0.5, textAlign: "center" }}>{it.uom}</TableCell>
                        <TableCell sx={{ fontSize: "0.75rem", fontWeight: 700, px: 0.5, textAlign: "center" }}>{fmt(it.ordered_qty)}</TableCell>
                        <TableCell sx={{ px: 0.5, whiteSpace: "nowrap" }}>
                          <TextField size="small" value={it.rep}
                            onChange={handleItemChange(idx, "rep")} disabled={isView}
                            placeholder="UT Rep#" onKeyDown={handleGridKeyDown} onFocus={function () { setActiveRow(idx); }}
                            sx={{ "& .MuiInputBase-root": { fontSize: "0.8rem", height: 30, borderRadius: "6px", width: "100%" }, "& .MuiInputBase-input": { px: 0.75 } }} />
                        </TableCell>
                        <TableCell sx={{ px: 0.5 }}><TextField size="small" type="number" value={it.dia || ""} onChange={handleItemChange(idx, "dia")} disabled={isView} onKeyDown={handleGridKeyDown} onFocus={function () { setActiveRow(idx); }} sx={{ ...cellInputSx }} /></TableCell>
                        <TableCell sx={{ px: 0.5 }}><TextField size="small" type="number" value={it.len || ""} onChange={handleItemChange(idx, "len")} disabled={isView} onKeyDown={handleGridKeyDown} onFocus={function () { setActiveRow(idx); }} sx={{ ...cellInputSx }} /></TableCell>
                        <TableCell sx={{ px: 0.5 }}><TextField size="small" type="number" value={it.wid || ""} onChange={handleItemChange(idx, "wid")} disabled={isView} onKeyDown={handleGridKeyDown} onFocus={function () { setActiveRow(idx); }} sx={{ ...cellInputSx }} /></TableCell>
                        <TableCell sx={{ px: 0.5 }}><TextField size="small" type="number" value={it.thk || ""} onChange={handleItemChange(idx, "thk")} disabled={isView} onKeyDown={handleGridKeyDown} onFocus={function () { setActiveRow(idx); }} sx={{ ...cellInputSx }} /></TableCell>
                        <TableCell sx={{ px: 0.5 }}>
                          <TextField size="small" type="number" value={it.recv_kg || ""} onChange={handleItemChange(idx, "recv_kg")} disabled={isView}
                            onKeyDown={handleGridKeyDown} onFocus={function () { setActiveRow(idx); }}
                            sx={{ "& .MuiInputBase-root": { fontSize: "0.8rem", height: 30, borderRadius: "6px", fontWeight: 600, color: "#1565c0" }, "& .MuiInputBase-input": { px: 0.75 }, "& input[type=number]": { MozAppearance: "textfield" }, "& input[type=number]::-webkit-outer-spin-button, & input[type=number]::-webkit-inner-spin-button": { WebkitAppearance: "none", margin: 0 } }} />
                        </TableCell>
                        <TableCell sx={{ px: 0.5, bgcolor: "#e3f2fd" }}><TextField size="small" type="number" value={it.accp || ""} onChange={handleItemChange(idx, "accp")} disabled={isView} onKeyDown={handleGridKeyDown} onFocus={function () { setActiveRow(idx); }} sx={{ ...cellInputSx, "& .MuiInputBase-root": { fontSize: "0.8rem", height: 30, borderRadius: "6px", bgcolor: "transparent", color: "#1565c0" } }} /></TableCell>
                        <TableCell sx={{ px: 0.5 }}>
                          <TextField size="small" type="number" value={it.phy || ""} onChange={handleItemChange(idx, "phy")} disabled={isView} onKeyDown={handleGridKeyDown} onFocus={function () { setActiveRow(idx); }} sx={{ ...cellInputSx }} />
                        </TableCell>
                        <TableCell sx={{ px: 0.5, bgcolor: "#e8f5e9" }}><TextField size="small" type="number" value={it.received_qty || ""} onChange={handleItemChange(idx, "received_qty")} disabled={isView} onKeyDown={handleGridKeyDown} onFocus={function () { setActiveRow(idx); }} sx={{ ...cellInputSx, "& .MuiInputBase-root": { fontSize: "0.8rem", height: 30, borderRadius: "6px", bgcolor: "transparent", color: "#2e7d32" } }} /></TableCell>
                        <TableCell sx={{ px: 0.5 }}><TextField size="small" type="number" value={it.supp_qty || ""} onChange={handleItemChange(idx, "supp_qty")} disabled={isView} onKeyDown={handleGridKeyDown} onFocus={function () { setActiveRow(idx); }} sx={{ ...cellInputSx, "& .MuiInputBase-root": { fontSize: "0.9rem", height: 34, borderRadius: "6px", fontWeight: 600 } }} /></TableCell>
                        <TableCell sx={{ px: 0.5, bgcolor: "#e8f5e9" }}><TextField size="small" type="number" value={it.accepted_qty || ""} onChange={handleItemChange(idx, "accepted_qty")} disabled={isView}
                          onKeyDown={handleGridKeyDown} onFocus={function () { setActiveRow(idx); }}
                          sx={{ "& .MuiInputBase-root": { fontSize: "0.9rem", height: 34, borderRadius: "6px", fontWeight: 600, color: "#2e7d32", bgcolor: "transparent" }, "& .MuiInputBase-input": { px: 0.75 }, "& input[type=number]": { MozAppearance: "textfield" }, "& input[type=number]::-webkit-outer-spin-button, & input[type=number]::-webkit-inner-spin-button": { WebkitAppearance: "none", margin: 0 } }} />
                        </TableCell>
                        <TableCell sx={{ px: 0.5 }}><TextField size="small" type="number" value={it.rejected_qty || ""} onChange={handleItemChange(idx, "rejected_qty")} disabled={isView} onKeyDown={handleGridKeyDown} onFocus={function () { setActiveRow(idx); }} sx={{ ...cellInputSx, "& .MuiInputBase-root": { fontSize: "0.9rem", height: 34, borderRadius: "6px", color: "#d32f2f", fontWeight: 600 } }} /></TableCell>
                        <TableCell sx={{ px: 0.5 }}><TextField size="small" value={it.reject_reason} onChange={handleItemChange(idx, "reject_reason")} disabled={isView} onKeyDown={handleGridKeyDown} onFocus={function () { setActiveRow(idx); }} sx={{ ...cellInputSx, "& .MuiInputBase-root": { fontSize: "0.7rem", height: 28, borderRadius: "6px" } }} /></TableCell>
                        {canEdit && (
                          <TableCell sx={{ px: 0.5, textAlign: "center" }}>
                            <IconButton size="small" color="error" onClick={function () { removeItem(idx); }} sx={{ p: 0.25, transition: "all 0.2s", "&:hover": { transform: "scale(1.15)", bgcolor: "#fef2f2" } }}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                        )}
                      </TableRow>
                    );
                  })}
                  {items.length > 0 && (
                    <TableRow sx={{ bgcolor: "#e8eefc" }}>
                      <TableCell colSpan={7} sx={{ fontWeight: 700, fontSize: "0.75rem", py: 0.75, px: 1, border: "1px solid " + cl.border, bgcolor: "#dbeafe" }}>TOTALS</TableCell>
                      {[7, 8, 9, 10, 11].map(function (i) {
                        return <TableCell key={i} sx={{ border: "1px solid " + cl.border, bgcolor: "#dbeafe", width: colWidths.current[i], minWidth: colWidths.current[i] }} />;
                      })}
                      <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem", py: 0.75, textAlign: "right", border: "1px solid " + cl.border, width: colWidths.current[12], minWidth: colWidths.current[12] }}>{fmtTotal(totals.kr, 3)}</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem", py: 0.75, textAlign: "right", color: "#1565c0", border: "1px solid " + cl.border, bgcolor: "#90caf9", width: colWidths.current[13], minWidth: colWidths.current[13] }}>{fmtTotal(totals.ka, 3)}</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem", py: 0.75, textAlign: "right", border: "1px solid " + cl.border, width: colWidths.current[14], minWidth: colWidths.current[14] }}>{fmtTotal(totals.pw, 3)}</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem", py: 0.75, textAlign: "right", border: "1px solid " + cl.border, bgcolor: "#dbeafe", width: colWidths.current[15], minWidth: colWidths.current[15] }}>{fmtTotal(totals.qr)}</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem", py: 0.75, textAlign: "right", border: "1px solid " + cl.border, bgcolor: "#dbeafe", width: colWidths.current[16], minWidth: colWidths.current[16] }}>{fmtTotal(totals.qs)}</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem", py: 0.75, textAlign: "right", color: "#2e7d32", border: "1px solid " + cl.border, bgcolor: "#c8e6c9", width: colWidths.current[17], minWidth: colWidths.current[17] }}>{fmtTotal(totals.qa)}</TableCell>
                      {[18, 19].map(function (i) {
                        return <TableCell key={i} sx={{ border: "1px solid " + cl.border, bgcolor: "#dbeafe", width: colWidths.current[i], minWidth: colWidths.current[i] }} />;
                      })}
                      {canEdit && <TableCell sx={{ border: "1px solid " + cl.border, bgcolor: "#dbeafe", width: 45, minWidth: 45 }} />}
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Box>
            {items.length > 0 && (
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: 2, flexWrap: "wrap", gap: 1 }}>
                {canEdit && (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <KeyboardIcon sx={{ fontSize: 13, color: cl.textMuted }} />
                    <Typography variant="caption" sx={{ color: cl.textMuted, fontStyle: "italic", fontSize: "0.68rem" }}>
                      <strong>Enter</strong>/<strong>Tab</strong> | Dbl-click | Drag borders
                    </Typography>
                  </Box>
                )}
                <Stack direction="row" spacing={2} flexWrap="wrap">
                  <Box sx={{ textAlign: "right" }}><Typography variant="caption" color="textSecondary" display="block" sx={{ fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: 0.5 }}>KG Recv</Typography><Typography fontWeight="bold" sx={{ color: cl.primary, fontSize: "0.9rem" }}>{fmtTotal(totals.kr, 3)}</Typography></Box>
                  <Box sx={{ textAlign: "right" }}><Typography variant="caption" color="textSecondary" display="block" sx={{ fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: 0.5 }}>KG Accp</Typography><Typography fontWeight="bold" sx={{ color: cl.success, fontSize: "0.9rem" }}>{fmtTotal(totals.ka, 3)}</Typography></Box>
                  <Box sx={{ textAlign: "right" }}><Typography variant="caption" color="textSecondary" display="block" sx={{ fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: 0.5 }}>Phy Wt</Typography><Typography fontWeight="bold" sx={{ fontSize: "0.9rem" }}>{fmtTotal(totals.pw, 3)}</Typography></Box>
                  <Box sx={{ textAlign: "right" }}><Typography variant="caption" color="textSecondary" display="block" sx={{ fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: 0.5 }}>Rec Qty</Typography><Typography fontWeight="bold" sx={{ fontSize: "0.9rem" }}>{fmtTotal(totals.qr)}</Typography></Box>
                  <Box sx={{ textAlign: "right" }}><Typography variant="caption" color="textSecondary" display="block" sx={{ fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: 0.5 }}>Supp Qty</Typography><Typography fontWeight="bold" sx={{ fontSize: "0.9rem" }}>{fmtTotal(totals.qs)}</Typography></Box>
                  <Box sx={{ textAlign: "right" }}><Typography variant="caption" color="textSecondary" display="block" sx={{ fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: 0.5 }}>Accp Qty</Typography><Typography fontWeight="bold" sx={{ color: cl.primary, fontSize: "0.9rem" }}>{fmtTotal(totals.qa)}</Typography></Box>
                </Stack>
              </Stack>
            )}
          </CardContent>
        </Card>
      </Fade>
    </Box>
  );
}
