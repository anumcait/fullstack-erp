import React, { useEffect, useState, useMemo, useCallback, useRef } from "react";
import {
  Box, Typography, Card, CardContent, TextField, Button, Chip, LinearProgress,
  Table, TableHead, TableRow, TableCell, TableBody, TableContainer, IconButton,
  Tooltip, TablePagination, Tabs, Tab, alpha, Dialog, DialogTitle, DialogContent,
  DialogActions, Select, MenuItem,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import PrintIcon from "@mui/icons-material/Print";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import BlockIcon from "@mui/icons-material/Block";
import SendIcon from "@mui/icons-material/Send";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import SearchIcon from "@mui/icons-material/Search";
import UnfoldMoreIcon from "@mui/icons-material/UnfoldMore";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ScheduleIcon from "@mui/icons-material/Schedule";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import axios from "axios";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "../../../../context/ToastContext";
import InwardRegisterPreview from "./InwardRegisterPreview";

const API = "/api/erp/stores/inward-registers";

const typeTabs = [
  { label: "Replacement", code: "L" },
  { label: "Repair", code: "R" },
  { label: "Maintenance", code: "M" },
  { label: "Jobwork", code: "J" },
  { label: "Sale On Approval", code: "S" },
];
const SUB_TABS = [
  { label: "Pending DCs", value: "pending" },
  { label: "Completed", value: "completed" },
];
const typeColors = { L: "#0f766e", R: "#be185d", M: "#155e75", J: "#4338ca", S: "#1565c0" };
const typeLabels = { L: "Replacement", R: "Repair", M: "Maintenance", J: "Jobwork", S: "Sale on Approval" };

const statusColor = { Received: "primary", Approved: "success", Cancelled: "error" };
const statusBg = { Received: "#e0f2fe", Approved: "#dcfce7", Cancelled: "#fee2e2" };

const fmtNum = (v) => {
  const n = Number(v);
  if (isNaN(n)) return "0";
  return n % 1 === 0 ? String(n) : n.toFixed(2).replace(/\.?0+$/, "");
};
const fmtDateTime = (v) => {
  if (!v) return "-";
  const d = new Date(v);
  if (isNaN(d)) return String(v).slice(0, 10);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${dd}-${mm}-${d.getFullYear()} ${String(d.getHours()).padStart(2, "0")}.${String(d.getMinutes()).padStart(2, "0")}`;
};
const fmtDDMMYYYY = (v) => {
  if (!v) return "-";
  const d = new Date(v);
  if (isNaN(d)) return String(v).slice(0, 10);
  return `${String(d.getDate()).padStart(2, "0")}-${String(d.getMonth() + 1).padStart(2, "0")}-${d.getFullYear()}`;
};
const fmtSmartDateTime = (v) => {
  if (!v) return "-";
  const d = new Date(v);
  if (isNaN(d)) return String(v).slice(0, 10);
  const raw = String(v).trim();
  const isDateOnly = /^\d{4}-\d{2}-\d{2}$/.test(raw.slice(0, 10)) && raw.length === 10;
  return isDateOnly ? fmtDDMMYYYY(v) : fmtDateTime(v);
};

const SummaryField = ({ label, value, wide }) => (
  <Box sx={{ gridColumn: wide ? "1 / -1" : "auto" }}>
    <Typography variant="caption" sx={{ color: "#64748b", fontSize: "0.65rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.3px" }}>{label}</Typography>
    <Typography sx={{ fontSize: "0.85rem", fontWeight: 600, color: "#1e293b", whiteSpace: "pre-wrap" }}>{value || "-"}</Typography>
  </Box>
);

const FilterSelect = ({ value, options, onChange, placeholder }) => (
  <Select size="small" value={value} displayEmpty onChange={(e) => onChange(e.target.value)}
    sx={{
      width: "100%", height: 28, fontSize: "0.8rem", borderRadius: 1.5,
      bgcolor: value ? alpha("#2563eb", 0.06) : "#f8fafc",
      "& .MuiSelect-select": { py: 0.4, pr: "22px !important" },
      "& .MuiOutlinedInput-notchedOutline": { borderColor: value ? alpha("#2563eb", 0.45) : "#e2e8f0" },
      "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#94a3b8" },
      color: value ? "#1e40af" : "#94a3b8", fontWeight: value ? 600 : 400,
    }}
    renderValue={(v) => v || placeholder || "All"}>
    <MenuItem value="" sx={{ fontSize: "0.76rem", color: "#94a3b8" }}>{placeholder || "All"}</MenuItem>
    {options.map((o) => <MenuItem key={o} value={o} sx={{ fontSize: "0.76rem" }}>{o}</MenuItem>)}
  </Select>
);

const datePresets = [
  { label: "Today", days: 0 },
  { label: "7 Days", days: 7 },
  { label: "30 Days", days: 30 },
  { label: "90 Days", days: 90 },
];

const distinctValues = (rows, key) => {
  const set = new Set();
  rows.forEach((r) => {
    const v = key === "party_name" ? (r.supplier?.supplier_name || r.party_name) : key === "status" ? r.status : key === "prepared_by" ? r.prepared_by : key === "received_by" ? r.received_by : r[key];
    if (v !== null && v !== undefined && String(v).trim() !== "") set.add(String(v));
  });
  return [...set].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
};

export default function InwardRegisterList() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { showToast } = useToast();

  const dcTypeTab = useMemo(() => {
    const t = searchParams.get("type");
    return typeTabs.findIndex((x) => x.code === t) >= 0 ? t : "L";
  }, [searchParams]);
  const view = searchParams.get("view") || "pending";
  const activeTypeColor = typeColors[dcTypeTab] || "#059669";
  const tabIndex = typeTabs.findIndex((t) => t.code === dcTypeTab);
  const viewIndex = SUB_TABS.findIndex((s) => s.value === view);

  const [rows, setRows] = useState([]);
  const [pendingRows, setPendingRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pendingLoading, setPendingLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [colFilters, setColFilters] = useState({});
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const [sortConfig, setSortConfig] = useState({ key: "ir_date", dir: "desc" });
  const [previewIr, setPreviewIr] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [expandedData, setExpandedData] = useState(null);
  const [expandLoading, setExpandLoading] = useState(false);
  const [pendingExpand, setPendingExpand] = useState(null);
  const [confirmDel, setConfirmDel] = useState(null);
  const [approveIr, setApproveIr] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [cancelMode, setCancelMode] = useState(false);
  const [cancelRemarks, setCancelRemarks] = useState("");
  const [colWidth, setColWidth] = useState({});
  const resizingCol = useRef(null);
  const colWidthOf = (key) => colWidth[key] || 100;
  const startResize = (e, key) => {
    e.preventDefault();
    e.stopPropagation();
    resizingCol.current = { key, startX: e.clientX, startW: colWidthOf(key) };
    const onMove = (ev) => {
      if (!resizingCol.current) return;
      const { key: k, startX, startW } = resizingCol.current;
      setColWidth((prev) => ({ ...prev, [k]: Math.max(50, startW + (ev.clientX - startX)) }));
    };
    const onUp = () => {
      resizingCol.current = null;
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };
  const ResizeHandle = (props) => (
    <Box onMouseDown={props.onStart} sx={{ position: "absolute", top: 0, right: -3, width: 7, height: "100%", cursor: "col-resize", zIndex: 3, "&::after": { content: '""', position: "absolute", top: 8, bottom: 8, right: 2, width: 2, borderRadius: 2, bgcolor: alpha(activeTypeColor, 0.3), transition: "all 0.15s" }, "&:hover::after": { bgcolor: activeTypeColor, right: 0, width: 3 } }} />
  );

  const today = new Date();
  const oneMonthAgo = new Date(today);
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
  const fmtDateInput = (d) => d.toISOString().split("T")[0];

  useEffect(() => {
    if (!dateFrom && !dateTo) {
      setDateFrom(fmtDateInput(oneMonthAgo));
      setDateTo(fmtDateInput(today));
    }
  }, []);

  const applyPreset = (days) => {
    const to = new Date();
    const from = new Date(to);
    from.setDate(from.getDate() - days);
    setDateFrom(fmtDateInput(from));
    setDateTo(fmtDateInput(to));
    setPage(0);
  };

  const changeType = (code) => {
    const next = new URLSearchParams(searchParams);
    next.set("type", code);
    setSearchParams(next);
    setPage(0);
    setPendingExpand(null);
  };
  const changeView = (v) => {
    const next = new URLSearchParams(searchParams);
    next.set("view", v);
    setSearchParams(next);
    setPage(0);
  };

  const fetchPending = useCallback(() => {
    setPendingLoading(true);
    const params = { dc_type: dcTypeTab };
    if (search) params.search = search;
    if (dateFrom) params.date_from = dateFrom;
    if (dateTo) params.date_to = dateTo;
    axios.get(`${API}/pending-dcs`, { params })
      .then(({ data }) => setPendingRows(Array.isArray(data) ? data : []))
      .catch(() => showToast("Failed to load pending DCs", "error"))
      .finally(() => setPendingLoading(false));
  }, [dcTypeTab, search, dateFrom, dateTo]);

  const fetchData = useCallback(() => {
    setLoading(true);
    const params = { dc_type: dcTypeTab };
    if (search) params.search = search;
    if (status) params.status = status;
    if (dateFrom) params.date_from = dateFrom;
    if (dateTo) params.date_to = dateTo;
    axios.get(API, { params })
      .then(({ data }) => setRows(Array.isArray(data) ? data : []))
      .catch(() => showToast("Failed to load", "error"))
      .finally(() => setLoading(false));
  }, [search, status, dcTypeTab, dateFrom, dateTo]);

  const applySearch = () => {
    if (view === "pending") fetchPending();
    else fetchData();
  };

  useEffect(() => {
    fetchPending();
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dcTypeTab]);

  const stats = useMemo(() => ({
    total: rows.length,
    received: rows.filter((r) => r.status === "Received").length,
    approved: rows.filter((r) => r.status === "Approved").length,
    cancelled: rows.filter((r) => r.status === "Cancelled").length,
  }), [rows]);

  const statusCounts = useMemo(() => ({
    "": stats.total,
    Received: stats.received,
    Approved: stats.approved,
    Cancelled: stats.cancelled,
  }), [stats]);

  const filteredRows = useMemo(() => {
    const active = Object.entries(colFilters).filter(([, v]) => v);
    if (active.length === 0) return rows;
    return rows.filter((r) => active.every(([key, val]) => {
      if (key === "party_name") return (r.supplier?.supplier_name || r.party_name || "") === val;
      if (key === "status") return r.status === val;
      if (key === "prepared_by") return (r.prepared_by || "") === val;
      if (key === "received_by") return (r.received_by || "") === val;
      return String(r[key] ?? "") === String(val);
    }));
  }, [rows, colFilters]);

  const sorted = [...filteredRows].sort((a, b) => {
    const dir = sortConfig.dir === "asc" ? 1 : -1;
    let va = a[sortConfig.key], vb = b[sortConfig.key];
    if (typeof va === "string") return dir * (va || "").localeCompare(vb || "", undefined, { numeric: true });
    return dir * ((va || 0) - (vb || 0));
  });

  const handleSort = (key) => setSortConfig((prev) => ({ key, dir: prev.key === key && prev.dir === "asc" ? "desc" : "asc" }));
  const sortIcon = (key) => {
    if (sortConfig.key !== key) return React.createElement(UnfoldMoreIcon, { sx: { fontSize: 11, ml: 0.2, opacity: 0.3, verticalAlign: "middle" } });
    return sortConfig.dir === "asc"
      ? React.createElement(ArrowUpwardIcon, { sx: { fontSize: 11, ml: 0.2, verticalAlign: "middle", color: "#1565c0" } })
      : React.createElement(ArrowDownwardIcon, { sx: { fontSize: 11, ml: 0.2, verticalAlign: "middle", color: "#1565c0" } });
  };

  const totalCount = sorted.length;
  const pagedRows = sorted.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const openPreview = async (id) => {
    try {
      const { data } = await axios.get(`${API}/${id}`);
      setPreviewIr(data);
    } catch { showToast("Failed to load preview", "error"); }
  };

  const toggleExpand = async (id) => {
    if (expandedId === id) { setExpandedId(null); setExpandedData(null); return; }
    setExpandLoading(true);
    try {
      const { data } = await axios.get(`${API}/${id}`);
      setExpandedData(data);
      setExpandedId(id);
    } catch { showToast("Failed to load details", "error"); }
    finally { setExpandLoading(false); }
  };

  const openAction = async (id) => {
    setActionLoading(true);
    try {
      const { data } = await axios.get(`${API}/${id}`);
      setApproveIr(data);
    } catch { showToast("Failed to load details", "error"); }
    finally { setActionLoading(false); }
  };

  const confirmApprove = async () => {
    if (!approveIr) return;
    setActionLoading(true);
    try {
      await axios.post(`${API}/${approveIr.id}/approve`, { approved_by: localStorage.getItem("empId") || null });
      showToast("IR approved", "success");
      setApproveIr(null);
      fetchData();
      fetchPending();
    } catch (e) {
      showToast(e.response?.data?.error || "Failed to approve", "error");
    } finally { setActionLoading(false); }
  };

  const confirmCancel = async () => {
    if (!approveIr) return;
    setActionLoading(true);
    try {
      await axios.post(`${API}/${approveIr.id}/cancel`, {
        cancel_remarks: cancelRemarks || null,
        cancel_by: localStorage.getItem("empId") || null,
        cancel_date: new Date().toISOString(),
      });
      showToast("IR cancelled", "success");
      setApproveIr(null);
      setCancelMode(false);
      setCancelRemarks("");
      fetchData();
      fetchPending();
    } catch (e) {
      showToast(e.response?.data?.error || "Failed", "error");
    } finally { setActionLoading(false); }
  };

  const handleDelete = async () => {
    if (!confirmDel) return;
    try {
      await axios.delete(`${API}/${confirmDel.id}`);
      showToast("IR deleted", "success");
      setConfirmDel(null);
      fetchData();
      fetchPending();
    } catch (e) {
      showToast(e.response?.data?.error || "Failed to delete", "error");
      setConfirmDel(null);
    }
  };

  const dcPendingQty = (dc) => (dc.items || []).reduce((s, it) => s + Number(it.qty_pending >= 0 ? it.qty_pending : 0), 0);
  const dcTotalQty = (dc) => (dc.items || []).reduce((s, it) => s + Number(it.quantity || 0), 0);
  const totalPendingQty = pendingRows.reduce((s, d) => s + dcPendingQty(d), 0);

  const thSx = { fontWeight: 700, fontSize: "0.9rem", color: "#0f172a", border: "1px solid #cbd5e1", position: "sticky", top: 0, zIndex: 2, bgcolor: alpha(activeTypeColor, 0.1), whiteSpace: "nowrap", py: 0.7, px: 0.8, lineHeight: 1.2 };
  const thFilterSx = { ...thSx, fontWeight: 600, fontSize: "0.78rem", bgcolor: "#fff", borderTop: "2px solid #e2e8f0", py: 0.5 };
  const tdSx = { fontSize: "0.85rem", py: 0.5, px: 0.7, border: "1px solid #eef2f7" };

  const viewPath = (r) => `/stores/inward-registers/view/${r.id}?type=${r.dc_type || dcTypeTab}`;
  const editPath = (r) => `/stores/inward-registers/edit/${r.id}?type=${r.dc_type || dcTypeTab}`;

  return (
    <Box sx={{ p: 3, minHeight: "100vh", background: "linear-gradient(180deg, #f0f4fa 0%, #f8fafc 30%, #fbfcfe 100%)" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2.5, flexWrap: "wrap", gap: 1.5 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box sx={{ width: 44, height: 44, borderRadius: 3, bgcolor: alpha(activeTypeColor, 0.12), display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 6px 16px ${alpha(activeTypeColor, 0.18)}` }}>
            <DescriptionOutlinedIcon sx={{ fontSize: 24, color: activeTypeColor }} />
          </Box>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, color: "#0f172a", letterSpacing: "-0.3px", lineHeight: 1.2 }}>Inward Registers</Typography>
            <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 600, fontSize: "0.8rem" }}>
              {typeTabs[tabIndex]?.label} · {view === "pending" ? `${pendingRows.length} DCs awaiting IR` : `${totalCount} IR records`}
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: "flex", gap: 1, alignItems: "center", flexWrap: "wrap" }}>
          <Tooltip title="Refresh"><Button variant="outlined" startIcon={<RefreshIcon />} onClick={view === "pending" ? fetchPending : fetchData}
            sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600, borderColor: "#cbd5e1", color: "#475569", bgcolor: "#fff", minWidth: 40, "&:hover": { bgcolor: "#f8fafc", borderColor: "#94a3b8" } }} /></Tooltip>
        </Box>
      </Box>

      {/* ── Full-width filter bar (common across all tabs) ── */}
      <Card sx={{ borderRadius: 3, mb: 2, boxShadow: "0 6px 20px rgba(15,23,42,0.06)", border: "1px solid #e8edf4", bgcolor: "rgba(255,255,255,0.9)" }}>
        <CardContent sx={{ py: 1.5, "&:last-child": { pb: 1.5 } }}>
          <Box sx={{ display: "flex", gap: 0.8, flexWrap: "wrap", alignItems: "center", mb: 1.5 }}>
            {datePresets.map((p) => {
              const isActive = dateFrom === fmtDateInput(new Date(Date.now() - p.days * 86400000));
              return (
                <Chip key={p.label} label={p.label} size="small"
                  variant={isActive ? "filled" : "outlined"}
                  onClick={() => applyPreset(p.days)}
                  sx={{ fontWeight: 700, cursor: "pointer", borderRadius: 1.5, fontSize: "0.7rem", bgcolor: isActive ? alpha(activeTypeColor, 0.1) : "transparent", borderColor: isActive ? alpha(activeTypeColor, 0.3) : "#e2e8f0", color: isActive ? activeTypeColor : "#64748b", "&:hover": { bgcolor: alpha(activeTypeColor, 0.06) } }} />
              );
            })}
            <Box sx={{ flex: 1 }} />
            <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
              {["", "Received", "Approved", "Cancelled"].map((s) => (
                <Chip key={s || "all"} size="small"
                  variant={status === s ? "filled" : "outlined"}
                  color={status === s ? (statusColor[s] || "default") : "default"}
                  onClick={() => { setStatus(s); setPage(0); }}
                  label={<Box component="span" sx={{ display: "inline-flex", alignItems: "center", gap: 0.5 }}>
                    {s || "All"}
                    <Box component="span" sx={{
                      px: 0.55, py: 0.05, borderRadius: 1, fontSize: "0.6rem", fontWeight: 800, lineHeight: 1.3,
                      bgcolor: status === s ? "rgba(255,255,255,0.28)" : alpha(activeTypeColor, 0.1), color: status === s ? "inherit" : activeTypeColor,
                    }}>{statusCounts[s] ?? 0}</Box>
                  </Box>}
                  sx={{ fontWeight: 600, cursor: "pointer", borderRadius: 1.5, fontSize: "0.68rem", py: 0.4, "&:hover": { opacity: 0.85 } }} />
              ))}
            </Box>
          </Box>
          <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", alignItems: "center" }}>
            <TextField size="small" label="From" type="date" value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)} InputLabelProps={{ shrink: true }} sx={{ width: 150, "& .MuiInputBase-root": { fontSize: "0.78rem", borderRadius: 1.5 } }} />
            <TextField size="small" label="To" type="date" value={dateTo}
              onChange={(e) => setDateTo(e.target.value)} InputLabelProps={{ shrink: true }} sx={{ width: 150, "& .MuiInputBase-root": { fontSize: "0.78rem", borderRadius: 1.5 } }} />
            <TextField size="small" placeholder="Search DC#, IR#, Party..." value={search}
              onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === "Enter" && applySearch()} sx={{ width: 200, "& .MuiInputBase-root": { fontSize: "0.78rem", borderRadius: 1.5 } }}
              InputProps={{ startAdornment: React.createElement(SearchIcon, { sx: { fontSize: 17, mr: 0.5, color: "#94a3b8" } }) }} />
            <Button variant="outlined" startIcon={<SearchIcon />} onClick={applySearch}
              sx={{ borderRadius: 1.5, textTransform: "none", fontWeight: 600, height: 40, borderColor: "#cbd5e1", color: "#475569" }}>Search</Button>
          </Box>
        </CardContent>
      </Card>

      {/* Type tabs */}
      <Box sx={{ mb: 0.5, borderBottom: 1, borderColor: "#e2e8f0" }}>
        <Tabs value={tabIndex} onChange={(_, v) => changeType(typeTabs[v]?.code)} variant="scrollable" scrollButtons="auto"
          sx={{ "& .MuiTab-root": { fontWeight: 600, fontSize: "0.8rem", textTransform: "none", minHeight: 38, py: 0.5, color: "#64748b", transition: "color 0.2s" },
            "& .Mui-selected": { color: activeTypeColor, fontWeight: 700 },
            "& .MuiTabs-indicator": { backgroundColor: activeTypeColor, height: 2.5 } }}>
          {typeTabs.map((t, i) => (
            <Tab key={i} label={<Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
              {t.label}
              <Box sx={{ px: 0.7, py: 0.15, borderRadius: 1, fontSize: "0.62rem", fontWeight: 800, bgcolor: tabIndex === i ? typeColors[t.code] : "#f1f5f9", color: tabIndex === i ? "#fff" : "#64748b" }}>{t.code}</Box>
            </Box>} />
          ))}
        </Tabs>
      </Box>

      {/* Sub tabs: Pending DCs / Completed */}
      <Box sx={{ mb: 2, display: "flex", gap: 1, flexWrap: "wrap", alignItems: "center" }}>
        <Box sx={{ display: "inline-flex", bgcolor: "#eef2f7", borderRadius: 2.5, p: 0.35, gap: 0.4, boxShadow: "inset 0 1px 3px rgba(15,23,42,0.06)" }}>
          {SUB_TABS.map((s, i) => {
            const active = viewIndex === i;
            const count = s.value === "pending" ? pendingRows.length : stats.total;
            return (
              <Box key={s.value} onClick={() => changeView(s.value)}
                sx={{
                  display: "flex", alignItems: "center", gap: 0.9, px: 2.2, py: 0.65, borderRadius: 2, cursor: "pointer", userSelect: "none",
                  bgcolor: active ? "#fff" : "transparent", color: active ? activeTypeColor : "#64748b",
                  border: active ? `1px solid ${alpha(activeTypeColor, 0.3)}` : "1px solid transparent",
                  fontWeight: active ? 700 : 600, fontSize: "0.8rem", whiteSpace: "nowrap",
                  boxShadow: active ? "0 2px 8px rgba(15,23,42,0.12)" : "none",
                  transition: "all 0.18s", "&:hover": { color: activeTypeColor },
                }}>
                {s.value === "pending" ? <ScheduleIcon sx={{ fontSize: 17 }} /> : <CheckCircleOutlineIcon sx={{ fontSize: 17 }} />}
                {s.label}
                <Box sx={{ px: 0.75, py: 0.12, borderRadius: 1.25, fontSize: "0.66rem", fontWeight: 800, lineHeight: 1.4,
                  bgcolor: active ? alpha(activeTypeColor, 0.15) : "#e2e8f0", color: active ? activeTypeColor : "#64748b" }}>
                  {count}
                </Box>
              </Box>
            );
          })}
        </Box>
        {view === "pending" && !pendingLoading && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.6, px: 1, py: 0.6, borderRadius: 2, bgcolor: alpha(activeTypeColor, 0.08), border: `1px solid ${alpha(activeTypeColor, 0.25)}` }}>
            <Box component="span" sx={{ fontSize: "0.7rem", fontWeight: 800, color: activeTypeColor }}>{fmtNum(totalPendingQty)}</Box>
            <Box component="span" sx={{ fontSize: "0.8rem", color: "#64748b", fontWeight: 600 }}>qty pending</Box>
          </Box>
        )}
      </Box>

      {view === "pending" ? (
        /* ════ PENDING DCs ════ */
        <Card sx={{ borderRadius: 3, boxShadow: "0 6px 20px rgba(15,23,42,0.06)", border: "1px solid #e8edf4", bgcolor: "rgba(255,255,255,0.9)", overflow: "hidden" }}>
          <CardContent sx={{ p: { xs: 1.5, md: 2 }, "&:last-child": { pb: 2 } }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5, px: 0.5, flexWrap: "wrap", gap: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: "#475569", fontSize: "0.8rem" }}>
                <Box component="span" sx={{ color: activeTypeColor, fontWeight: 800 }}>{pendingRows.length}</Box> approved challans awaiting inward receipt
              </Typography>
              <Typography variant="body2" sx={{ color: "#94a3b8", fontWeight: 500, fontSize: "0.84rem" }}>
                Select a DC below to create its Inward Register
              </Typography>
            </Box>
            {pendingLoading && <LinearProgress sx={{ mb: 1, borderRadius: 1, height: 3 }} />}
            {!pendingLoading && pendingRows.length === 0 && (
              <Box sx={{ textAlign: "center", py: 8, color: "#94a3b8" }}>
                <Box sx={{ width: 72, height: 72, borderRadius: 4, bgcolor: alpha(activeTypeColor, 0.06), display: "flex", alignItems: "center", justifyContent: "center", mx: "auto", mb: 2 }}>
                  <DescriptionOutlinedIcon sx={{ fontSize: 36, opacity: 0.3 }} />
                </Box>
                <Typography sx={{ fontWeight: 700, fontSize: "1.1rem", color: "#64748b" }}>No pending DCs</Typography>
                <Typography sx={{ fontSize: "0.85rem", mt: 0.5, color: "#94a3b8" }}>All approved {typeLabels[dcTypeTab] || ""} challans have been fully received.</Typography>
              </Box>
            )}
            {pendingRows.length > 0 && (
              <TableContainer sx={{ maxHeight: 560, overflow: "auto", borderRadius: 1.5, border: "1px solid #e8edf4" }}>
                <Table size="small" stickyHeader sx={{ minWidth: 980, borderCollapse: "separate", borderSpacing: 0 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ ...thSx, width: 28, textAlign: "center" }}></TableCell>
                      <TableCell sx={{ ...thSx, width: 120, textAlign: "center" }}>Actions</TableCell>
                      <TableCell sx={{ ...thSx, width: 28, textAlign: "center" }}>#</TableCell>
                      <TableCell sx={{ ...thSx, width: 120, textAlign: "center" }}>DC #</TableCell>
                      <TableCell sx={{ ...thSx, width: 130, textAlign: "center" }}>Date</TableCell>
                      <TableCell sx={{ ...thSx, width: 170 }}>Party Name</TableCell>
                      <TableCell sx={{ ...thSx, width: 60, textAlign: "center" }}>Items</TableCell>
                      <TableCell sx={{ ...thSx, width: 80, textAlign: "center" }}>DC Qty</TableCell>
                      <TableCell sx={{ ...thSx, width: 100, textAlign: "center" }}>Pending Qty</TableCell>
                      <TableCell sx={{ ...thSx, width: 85, textAlign: "center" }}>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {pendingRows.map((dc, idx) => {
                      const pending = dcPendingQty(dc);
                      const isExpanded = pendingExpand === dc.id;
                      return (
                        <React.Fragment key={dc.id}>
                          <TableRow hover
                            onDoubleClick={() => navigate(`/stores/inward-registers/add?type=${dc.dc_type || dcTypeTab}&prefill_dc=${dc.id}`)}
                            sx={{ bgcolor: idx % 2 === 0 ? "#fff" : "#f8fafc", "&:hover": { bgcolor: alpha(activeTypeColor, 0.05) }, cursor: "pointer" }}>
                            <TableCell sx={{ ...tdSx, textAlign: "center" }}>
                              <Tooltip title={isExpanded ? "Collapse" : "Show items"}>
                                <IconButton size="small" sx={{ p: 0.3, color: "#64748b", "&:hover": { color: activeTypeColor } }} onClick={() => setPendingExpand(isExpanded ? null : dc.id)}>
                                  {isExpanded ? <ExpandMoreIcon sx={{ fontSize: 17 }} /> : <ChevronRightIcon sx={{ fontSize: 17 }} />}
                                </IconButton>
                              </Tooltip>
                            </TableCell>
                            <TableCell sx={{ ...tdSx, textAlign: "center", whiteSpace: "nowrap" }}>
                              <Tooltip title="Make IR"><Button size="small" startIcon={<AddShoppingCartIcon sx={{ fontSize: 14 }} />} variant="contained"
                                onClick={() => navigate(`/stores/inward-registers/add?type=${dc.dc_type || dcTypeTab}&prefill_dc=${dc.id}`)}
                                sx={{ borderRadius: 1.5, textTransform: "none", fontWeight: 700, fontSize: "0.68rem", px: 1, py: 0.3, bgcolor: activeTypeColor, "&:hover": { bgcolor: alpha(activeTypeColor, 0.85) } }}>
                                Make IR
                              </Button></Tooltip>
                            </TableCell>
                            <TableCell sx={{ ...tdSx, textAlign: "center", fontWeight: 600, color: "#94a3b8", fontSize: "0.8rem" }}>{idx + 1}</TableCell>
                            <TableCell sx={{ ...tdSx, textAlign: "center", fontWeight: 700, color: activeTypeColor, fontFamily: "monospace", fontSize: "0.82rem" }}>{dc.dc_no || dc.draft_no}</TableCell>
                            <TableCell sx={{ ...tdSx, textAlign: "center", whiteSpace: "nowrap", fontSize: "0.78rem" }}>{fmtSmartDateTime(dc.dc_date)}</TableCell>
                            <TableCell sx={{ ...tdSx, fontWeight: 600, maxWidth: 170, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: "0.78rem" }}>
                              <Tooltip title={dc.party_name || "-"}><span>{dc.party_name || "-"}</span></Tooltip>
                            </TableCell>
                            <TableCell sx={{ ...tdSx, textAlign: "center", fontSize: "0.78rem" }}>{(dc.items || []).length}</TableCell>
                            <TableCell sx={{ ...tdSx, textAlign: "center", fontWeight: 600, fontSize: "0.78rem", color: "#64748b" }}>{fmtNum(dcTotalQty(dc))}</TableCell>
                            <TableCell sx={{ ...tdSx, textAlign: "center" }}>
                              <Box sx={{ px: 0.9, py: 0.15, borderRadius: 1.5, fontSize: "0.68rem", fontWeight: 800, display: "inline-block", bgcolor: pending > 0 ? "#fef3c7" : "#f1f5f9", color: pending > 0 ? "#b45309" : "#94a3b8" }}>{fmtNum(pending)}</Box>
                            </TableCell>
                            <TableCell sx={{ ...tdSx, textAlign: "center" }}>
                              <Box sx={{ px: 1, py: 0.2, borderRadius: 1.5, fontSize: "0.65rem", fontWeight: 700, display: "inline-block", bgcolor: "#dcfce7", color: "#2e7d32" }}>Approved</Box>
                            </TableCell>
                          </TableRow>
                          {isExpanded && (
                            <TableRow sx={{ bgcolor: "#f8fafc" }}>
                              <TableCell colSpan={10} sx={{ p: 0, border: "1px solid #e2e8f0", borderTop: "2px solid #cbd5e1" }}>
                                <Box sx={{ p: 1.5 }}>
                                  <TableContainer sx={{ border: "1px solid #e2e8f0", borderRadius: 1 }}>
                                    <Table size="small" sx={{ borderCollapse: "separate", borderSpacing: 0 }}>
                                      <TableHead>
                                        <TableRow>
                                          {["#", "Item Code", "Description", "UOM", "DC Qty", "Received", "Pending"].map((l, i) => (
                                            <TableCell key={l} sx={{ fontWeight: 700, fontSize: "0.8rem", color: "#1e293b", bgcolor: "#e8edf4", border: "1px solid #cbd5e1", whiteSpace: "nowrap", textAlign: i === 0 || i >= 3 ? "center" : "left" }}>{l}</TableCell>
                                          ))}
                                        </TableRow>
                                      </TableHead>
                                      <TableBody>
                                        {(dc.items || []).map((it, i) => {
                                          const qty = Number(it.quantity || 0);
                                          const recv = Number(it.qty_received || 0);
                                          const pend = Number(it.qty_pending >= 0 ? it.qty_pending : qty - recv);
                                          return (
                                            <TableRow key={it.id || i}>
                                              <TableCell sx={{ fontSize: "0.84rem", textAlign: "center", border: "1px solid #e2e8f0" }}>{i + 1}</TableCell>
                                              <TableCell sx={{ fontSize: "0.84rem", fontWeight: 600, border: "1px solid #e2e8f0" }}>{it.item_code}</TableCell>
                                              <TableCell sx={{ fontSize: "0.84rem", border: "1px solid #e2e8f0" }}>{it.item_name}</TableCell>
                                              <TableCell sx={{ fontSize: "0.84rem", textAlign: "center", border: "1px solid #e2e8f0" }}>{it.unit || it.item?.unit?.short_name || ""}</TableCell>
                                              <TableCell sx={{ fontSize: "0.84rem", textAlign: "center", border: "1px solid #e2e8f0" }}>{fmtNum(qty)}</TableCell>
                                              <TableCell sx={{ fontSize: "0.84rem", textAlign: "center", color: "#64748b", border: "1px solid #e2e8f0" }}>{fmtNum(recv)}</TableCell>
                                              <TableCell sx={{ fontSize: "0.84rem", textAlign: "center", fontWeight: 700, color: pend > 0 ? "#b45309" : "#16a34a", border: "1px solid #e2e8f0" }}>{fmtNum(pend)}</TableCell>
                                            </TableRow>
                                          );
                                        })}
                                      </TableBody>
                                    </Table>
                                  </TableContainer>
                                </Box>
                              </TableCell>
                            </TableRow>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      ) : (
        /* ════ COMPLETED IRs ════ */
        <>
          <Card sx={{ borderRadius: 3, boxShadow: "0 6px 20px rgba(15,23,42,0.06)", border: "1px solid #e8edf4", bgcolor: "rgba(255,255,255,0.9)", overflow: "hidden" }}>
            <CardContent sx={{ p: { xs: 1.5, md: 2 }, "&:last-child": { pb: 2 } }}>
              {totalCount > 0 && (
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5, px: 0.5, flexWrap: "wrap", gap: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: "#475569", fontSize: "0.8rem" }}>
                    <Box component="span" sx={{ color: activeTypeColor, fontWeight: 800 }}>{totalCount}</Box> inward registers ·{" "}
                    <Box component="span" sx={{ color: "#0369a1", fontWeight: 700 }}>{stats.received}</Box> received ·{" "}
                    <Box component="span" sx={{ color: "#2e7d32", fontWeight: 700 }}>{stats.approved}</Box> approved ·{" "}
                    <Box component="span" sx={{ color: "#dc2626", fontWeight: 700 }}>{stats.cancelled}</Box> cancelled
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#94a3b8", fontWeight: 500, fontSize: "0.84rem" }}>
                    Page {page + 1} · {page * rowsPerPage + 1}-{Math.min((page + 1) * rowsPerPage, totalCount)}
                  </Typography>
                </Box>
              )}
              {loading && <LinearProgress sx={{ mb: 1, borderRadius: 1, height: 3 }} />}
              {!loading && totalCount === 0 && (
                <Box sx={{ textAlign: "center", py: 8, color: "#94a3b8" }}>
                  <Box sx={{ width: 72, height: 72, borderRadius: 4, bgcolor: alpha(activeTypeColor, 0.06), display: "flex", alignItems: "center", justifyContent: "center", mx: "auto", mb: 2 }}>
                    <DescriptionOutlinedIcon sx={{ fontSize: 36, opacity: 0.3 }} />
                  </Box>
                  <Typography sx={{ fontWeight: 700, fontSize: "1.1rem", color: "#64748b" }}>No inward registers found</Typography>
                  <Typography sx={{ fontSize: "0.85rem", mt: 0.5, color: "#94a3b8" }}>Create IRs from the Pending DCs tab (Approved challans).</Typography>
                </Box>
              )}
              {totalCount > 0 && (
                <>
                  <TableContainer sx={{ maxHeight: 520, overflow: "auto", borderRadius: 1.5, border: "1px solid #e8edf4" }}>
                    <Table size="small" stickyHeader sx={{ minWidth: 1120, borderCollapse: "separate", borderSpacing: 0 }}>
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ ...thSx, width: colWidthOf("expand"), minWidth: 28, textAlign: "center", position: "relative" }}><ResizeHandle onStart={(e) => startResize(e, "expand")} /></TableCell>
                          <TableCell sx={{ ...thSx, width: colWidthOf("actions"), minWidth: 90, textAlign: "center", position: "relative" }}>Actions<ResizeHandle onStart={(e) => startResize(e, "actions")} /></TableCell>
                          <TableCell sx={{ ...thSx, width: colWidthOf("num"), minWidth: 28, textAlign: "center", position: "relative" }}>#<ResizeHandle onStart={(e) => startResize(e, "num")} /></TableCell>
                          <TableCell sx={{ ...thSx, width: colWidthOf("ir_no"), minWidth: 90, textAlign: "center", cursor: "pointer", position: "relative" }} onClick={() => handleSort("ir_no")}>IR # {sortIcon("ir_no")}<ResizeHandle onStart={(e) => startResize(e, "ir_no")} /></TableCell>
                          <TableCell sx={{ ...thSx, width: colWidthOf("ir_date"), minWidth: 110, textAlign: "center", cursor: "pointer", position: "relative" }} onClick={() => handleSort("ir_date")}>Date{sortIcon("ir_date")}<ResizeHandle onStart={(e) => startResize(e, "ir_date")} /></TableCell>
                          <TableCell sx={{ ...thSx, width: colWidthOf("party"), minWidth: 130, cursor: "pointer", position: "relative" }} onClick={() => handleSort("party_name")}>Party{sortIcon("party_name")}<ResizeHandle onStart={(e) => startResize(e, "party")} /></TableCell>
                          <TableCell sx={{ ...thSx, width: colWidthOf("items"), minWidth: 60, textAlign: "center", position: "relative" }}>Items<ResizeHandle onStart={(e) => startResize(e, "items")} /></TableCell>
                          <TableCell sx={{ ...thSx, width: colWidthOf("qty"), minWidth: 60, textAlign: "center", position: "relative" }}>Qty<ResizeHandle onStart={(e) => startResize(e, "qty")} /></TableCell>
                          <TableCell sx={{ ...thSx, width: colWidthOf("status"), minWidth: 70, textAlign: "center", cursor: "pointer", position: "relative" }} onClick={() => handleSort("status")}>Status{sortIcon("status")}<ResizeHandle onStart={(e) => startResize(e, "status")} /></TableCell>
                          <TableCell sx={{ ...thSx, width: colWidthOf("prepared"), minWidth: 100, textAlign: "center", cursor: "pointer", position: "relative" }} onClick={() => handleSort("prepared_by")}>Prepared By{sortIcon("prepared_by")}<ResizeHandle onStart={(e) => startResize(e, "prepared")} /></TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ ...thFilterSx, width: colWidthOf("expand") }}></TableCell>
                          <TableCell sx={{ ...thFilterSx, width: colWidthOf("actions") }}></TableCell>
                          <TableCell sx={{ ...thFilterSx, width: colWidthOf("num") }}></TableCell>
                          <TableCell sx={{ ...thFilterSx, width: colWidthOf("ir_no") }}></TableCell>
                          <TableCell sx={{ ...thFilterSx, width: colWidthOf("ir_date") }}></TableCell>
                          <TableCell sx={{ ...thFilterSx, width: colWidthOf("party") }}>
                            <FilterSelect value={colFilters.party_name || ""} options={distinctValues(rows, "party_name")} onChange={(v) => setColFilters((f) => ({ ...f, party_name: v }))} placeholder="All Parties" />
                          </TableCell>
                          <TableCell sx={{ ...thFilterSx, width: colWidthOf("items") }}></TableCell>
                          <TableCell sx={{ ...thFilterSx, width: colWidthOf("qty") }}></TableCell>
                          <TableCell sx={{ ...thFilterSx, width: colWidthOf("status") }}>
                            <FilterSelect value={colFilters.status || ""} options={distinctValues(rows, "status")} onChange={(v) => setColFilters((f) => ({ ...f, status: v }))} placeholder="All Status" />
                          </TableCell>
                          <TableCell sx={{ ...thFilterSx, width: colWidthOf("prepared") }}>
                            <FilterSelect value={colFilters.prepared_by || ""} options={distinctValues(rows, "prepared_by")} onChange={(v) => setColFilters((f) => ({ ...f, prepared_by: v }))} placeholder="All" />
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {pagedRows.map((r, idx) => (
                          <React.Fragment key={r.id}>
                            <TableRow hover
                              onDoubleClick={() => navigate(viewPath(r))}
                              sx={{ bgcolor: idx % 2 === 0 ? "#fff" : "#f8fafc", "&:hover": { bgcolor: alpha(activeTypeColor, 0.05) }, transition: "background 0.15s", cursor: "pointer" }}>
                              <TableCell sx={{ ...tdSx, textAlign: "center" }}>
                                <Tooltip title="Expand details"><IconButton size="small" sx={{ p: 0.3, color: "#64748b", "&:hover": { color: activeTypeColor } }} onClick={(e) => { e.stopPropagation(); toggleExpand(r.id); }}>{expandedId === r.id ? <ExpandMoreIcon sx={{ fontSize: 17 }} /> : <ChevronRightIcon sx={{ fontSize: 17 }} />}</IconButton></Tooltip>
                              </TableCell>
                              <TableCell sx={{ ...tdSx, textAlign: "center", whiteSpace: "nowrap" }}>
                                <Tooltip title="Preview / Print"><IconButton size="small" sx={{ p: 0.3, color: "#64748b", "&:hover": { color: activeTypeColor } }} onClick={() => openPreview(r.id)}><PrintIcon sx={{ fontSize: 15 }} /></IconButton></Tooltip>
                                <Tooltip title="View"><IconButton size="small" sx={{ p: 0.3, color: "#64748b", "&:hover": { color: activeTypeColor } }} onClick={() => navigate(viewPath(r))}><VisibilityIcon sx={{ fontSize: 15 }} /></IconButton></Tooltip>
                                {r.status === "Received" && (
                                  <>
                                    <Tooltip title="Edit"><IconButton size="small" sx={{ p: 0.3, color: "#64748b", "&:hover": { color: "#f59e0b" } }} onClick={() => navigate(editPath(r))}><EditIcon sx={{ fontSize: 15 }} /></IconButton></Tooltip>
                                    <Tooltip title="Approve / Cancel"><IconButton size="small" sx={{ p: 0.3, color: "#64748b", "&:hover": { color: "#1565c0" } }} onClick={() => openAction(r.id)}><SendIcon sx={{ fontSize: 15 }} /></IconButton></Tooltip>
                                  </>
                                )}
                                {r.status === "Approved" && (
                                  <Tooltip title="Cancel"><IconButton size="small" sx={{ p: 0.3, color: "#64748b", "&:hover": { color: "#dc2626" } }} onClick={() => openAction(r.id)}><BlockIcon sx={{ fontSize: 15 }} /></IconButton></Tooltip>
                                )}
                                {r.status !== "Approved" && (
                                  <Tooltip title="Delete"><IconButton size="small" sx={{ p: 0.3, color: "#64748b", "&:hover": { color: "#dc2626" } }} onClick={() => setConfirmDel(r)}><BlockIcon sx={{ fontSize: 15 }} /></IconButton></Tooltip>
                                )}
                              </TableCell>
                              <TableCell sx={{ ...tdSx, textAlign: "center", fontWeight: 600, color: "#94a3b8", fontSize: "0.8rem" }}>{idx + 1 + page * rowsPerPage}</TableCell>
                              <TableCell sx={{ ...tdSx, textAlign: "center", fontWeight: 700, color: activeTypeColor, fontFamily: "monospace", fontSize: "0.82rem" }}>{r.ir_no || "-"}</TableCell>
                              <TableCell sx={{ ...tdSx, textAlign: "center", whiteSpace: "nowrap", fontSize: "0.78rem" }}>{fmtSmartDateTime(r.ir_date)}</TableCell>
                              <TableCell sx={{ ...tdSx, fontWeight: 600, maxWidth: 170, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: "0.78rem" }}>
                                <Tooltip title={r.supplier?.supplier_name || r.party_name || "-"}><span>{r.supplier?.supplier_name || r.party_name || "-"}</span></Tooltip>
                              </TableCell>
                              <TableCell sx={{ ...tdSx, textAlign: "center", fontSize: "0.78rem" }}>{r.items?.length || 0}</TableCell>
                              <TableCell sx={{ ...tdSx, textAlign: "center", fontWeight: 600, fontSize: "0.78rem" }}>{fmtNum(r.items?.reduce((s, i) => s + Number(i.qty_supplied || 0), 0) || 0)}</TableCell>
                              <TableCell sx={{ ...tdSx, textAlign: "center" }}>
                                <Box sx={{ px: 1, py: 0.2, borderRadius: 1.5, fontSize: "0.65rem", fontWeight: 700, display: "inline-block", bgcolor: alpha(statusBg[r.status] || "#f1f5f9", 0.8), color: r.status === "Approved" ? "#2e7d32" : r.status === "Cancelled" ? "#dc2626" : "#0369a1" }}>
                                  {r.status}
                                </Box>
                              </TableCell>
                              <TableCell sx={{ ...tdSx, textAlign: "center", fontSize: "0.78rem" }}>{r.prepared_by || "-"}</TableCell>
                            </TableRow>
                            {expandedId === r.id && (
                              <TableRow sx={{ bgcolor: "#f8fafc" }}>
                                <TableCell colSpan={10} sx={{ p: 0, border: "1px solid #e2e8f0", borderTop: "2px solid #cbd5e1" }}>
                                  <Box sx={{ p: 1.5 }}>
                                    {expandLoading ? <LinearProgress sx={{ height: 3, borderRadius: 1 }} /> : (
                                      <TableContainer sx={{ border: "1px solid #e2e8f0", borderRadius: 1 }}>
                                        <Table size="small" sx={{ borderCollapse: "separate", borderSpacing: 0 }}>
                                          <TableHead>
                                            <TableRow>
                                              {["#", "DC#", "Item Code", "Description", "UOM", "DC Qty", "Qty Supplied", "Remarks"].map((l, i) => (
                                                <TableCell key={l} sx={{ fontWeight: 700, fontSize: "0.8rem", color: "#1e293b", bgcolor: "#e8edf4", border: "1px solid #cbd5e1", whiteSpace: "nowrap", textAlign: i === 0 || i >= 3 ? "center" : "left" }}>{l}</TableCell>
                                              ))}
                                            </TableRow>
                                          </TableHead>
                                          <TableBody>
                                            {(expandedData?.items || []).map((it, i) => {
                                              const dc = expandedData.deliveryChallans?.find((d) => d.id === it.dc_id);
                                              return (
                                                <TableRow key={it.id || i}>
                                                  <TableCell sx={{ fontSize: "0.84rem", textAlign: "center", border: "1px solid #e2e8f0" }}>{i + 1}</TableCell>
                                                  <TableCell sx={{ fontSize: "0.84rem", fontWeight: 600, border: "1px solid #e2e8f0", fontFamily: "monospace" }}>{dc?.dc_no || dc?.draft_no || "-"}</TableCell>
                                                  <TableCell sx={{ fontSize: "0.84rem", border: "1px solid #e2e8f0" }}>{it.item_code || "-"}</TableCell>
                                                  <TableCell sx={{ fontSize: "0.84rem", border: "1px solid #e2e8f0" }}>{it.item_name || "-"}</TableCell>
                                                  <TableCell sx={{ fontSize: "0.84rem", textAlign: "center", border: "1px solid #e2e8f0" }}>{it.uom || "-"}</TableCell>
                                                  <TableCell sx={{ fontSize: "0.84rem", textAlign: "center", border: "1px solid #e2e8f0" }}>{fmtNum(it.dc_qty || it.orderd_qty || it.quantity)}</TableCell>
                                                  <TableCell sx={{ fontSize: "0.84rem", textAlign: "center", fontWeight: 600, color: "#059669", border: "1px solid #e2e8f0" }}>{fmtNum(it.qty_supplied)}</TableCell>
                                                  <TableCell sx={{ fontSize: "0.84rem", border: "1px solid #e2e8f0" }}>{it.remarks || "-"}</TableCell>
                                                </TableRow>
                                              );
                                            })}
                                            {(expandedData?.items || []).length === 0 && !expandLoading && (
                                              <TableRow><TableCell colSpan={8} sx={{ fontSize: "0.84rem", textAlign: "center", color: "#94a3b8", py: 2 }}>No items</TableCell></TableRow>
                                            )}
                                          </TableBody>
                                        </Table>
                                      </TableContainer>
                                    )}
                                  </Box>
                                </TableCell>
                              </TableRow>
                            )}
                          </React.Fragment>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  <TablePagination component="div" count={totalCount} page={page}
                    onPageChange={(_, p) => setPage(p)} rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
                    rowsPerPageOptions={[25, 50, 100]}
                    sx={{ "& .MuiTablePagination-toolbar": { minHeight: 34 }, "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows": { fontSize: "0.84rem" } }} />
                </>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {previewIr && <InwardRegisterPreview data={previewIr} onClose={() => setPreviewIr(null)} />}

      {/* Approve / Cancel dialog */}
      <Dialog open={Boolean(approveIr)} onClose={() => !actionLoading && (setApproveIr(null), setCancelMode(false), setCancelRemarks(""))} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, fontSize: "1rem", display: "flex", justifyContent: "space-between", alignItems: "center", pr: 3 }}>
          <Box>Inward Register — {approveIr?.ir_no || "-"}</Box>
          {approveIr && <Chip label={approveIr.status} size="small" color={approveIr.status === "Approved" ? "primary" : statusColor[approveIr.status] || "default"} sx={{ fontSize: "0.7rem", height: 22, fontWeight: 600 }} />}
        </DialogTitle>
        <DialogContent dividers>
          {actionLoading && !approveIr ? (
            <LinearProgress />
          ) : approveIr ? (
            <Box>
              <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 1.5, mb: 2 }}>
                <SummaryField label="IR #" value={approveIr.ir_no} />
                <SummaryField label="Date" value={fmtDateTime(approveIr.ir_date)} />
                <SummaryField label="Type" value={typeLabels[approveIr.dc_type] || approveIr.dc_type || "-"} />
                <SummaryField label="Party" value={approveIr.party_name} />
                <SummaryField label="Inward Date" value={fmtDDMMYYYY(approveIr.inward_date)} />
                <SummaryField label="Prepared By" value={approveIr.prepared_by} />
                <SummaryField label="Requested By" value={approveIr.requested_by} />
                <SummaryField label="Department" value={approveIr.department} />
                <SummaryField label="Vehicle No" value={approveIr.vehicle_no} />
                <SummaryField label="Driver" value={approveIr.driver_name} />
                {approveIr.notes ? <SummaryField label="Remarks" value={approveIr.notes} wide /> : null}
                {approveIr.cancel_remarks ? <SummaryField label="Cancel Remarks" value={approveIr.cancel_remarks} wide /> : null}
                {approveIr.cancel_by ? <SummaryField label="Cancelled By" value={approveIr.cancel_by} /> : null}
                {approveIr.cancel_date ? <SummaryField label="Cancelled On" value={fmtDateTime(approveIr.cancel_date)} /> : null}
              </Box>
              <TableContainer sx={{ maxHeight: 300, border: "1px solid #e2e8f0", borderRadius: 1 }}>
                <Table size="small" stickyHeader sx={{ borderCollapse: "separate", borderSpacing: 0 }}>
                  <TableHead>
                    <TableRow>
                      {["#", "DC#", "Item Code", "Description", "UOM", "DC Qty", "Qty Supplied", "Remarks"].map((l, i) => (
                        <TableCell key={l} sx={{ fontWeight: 700, fontSize: "0.8rem", color: "#1e293b", bgcolor: "#e8edf4", borderBottom: "1px solid #cbd5e1", whiteSpace: "nowrap", textAlign: i === 0 || i >= 4 ? "center" : "left" }}>{l}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(approveIr.items || []).map((it, i) => {
                      const dc = approveIr.deliveryChallans?.find((d) => d.id === it.dc_id);
                      return (
                        <TableRow key={it.id || i}>
                          <TableCell sx={{ fontSize: "0.84rem", textAlign: "center" }}>{i + 1}</TableCell>
                          <TableCell sx={{ fontSize: "0.84rem", textAlign: "center", fontFamily: "monospace" }}>{dc?.dc_no || dc?.draft_no || "-"}</TableCell>
                          <TableCell sx={{ fontSize: "0.84rem", fontWeight: 600 }}>{it.item_code}</TableCell>
                          <TableCell sx={{ fontSize: "0.84rem" }}>{it.item_name}</TableCell>
                          <TableCell sx={{ fontSize: "0.84rem", textAlign: "center" }}>{it.uom || ""}</TableCell>
                          <TableCell sx={{ fontSize: "0.84rem", textAlign: "right" }}>{fmtNum(it.dc_qty)}</TableCell>
                          <TableCell sx={{ fontSize: "0.84rem", textAlign: "right" }}>{fmtNum(it.qty_supplied)}</TableCell>
                          <TableCell sx={{ fontSize: "0.84rem" }}>{it.remarks || ""}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
              {!cancelMode && approveIr.status === "Received" && (
                <Typography variant="caption" sx={{ color: "#dc2626", fontWeight: 600, display: "block", mt: 1.5 }}>
                  Approving this IR will add stock for the listed items.
                </Typography>
              )}
              {cancelMode && (
                <>
                  {approveIr.status === "Approved" && (
                    <Typography variant="caption" sx={{ color: "#dc2626", fontWeight: 600, display: "block", mt: 1.5 }}>
                      Cancelling this approved IR will reverse stock movements for the listed items.
                    </Typography>
                  )}
                  {approveIr.status === "Cancelled" && (
                    <Box sx={{ mb: 1.5, p: 1.5, bgcolor: "#fef2f2", borderRadius: 1, border: "1px solid #fecaca" }}>
                      <Typography variant="caption" sx={{ color: "#b91c1c", fontWeight: 600, display: "block", mb: 0.5 }}>Already Cancelled</Typography>
                      <Typography variant="body2" sx={{ color: "#7f1d1d" }}>Remarks: {approveIr.cancel_remarks || "-"}</Typography>
                      <Typography variant="body2" sx={{ color: "#7f1d1d" }}>Cancelled By: {approveIr.cancel_by || "-"}</Typography>
                      <Typography variant="body2" sx={{ color: "#7f1d1d" }}>Cancelled On: {approveIr.cancel_date ? fmtDateTime(approveIr.cancel_date) : "-"}</Typography>
                    </Box>
                  )}
                  <TextField size="small" fullWidth multiline minRows={2} label="Cancel Remarks" value={cancelRemarks}
                    onChange={(e) => setCancelRemarks(e.target.value)} sx={{ mt: 1.5 }} error={cancelMode && approveIr.status !== "Cancelled" && !cancelRemarks.trim()} helperText={cancelMode && approveIr.status !== "Cancelled" && !cancelRemarks.trim() ? "Cancel remarks are required" : `${cancelRemarks.length}/500`} inputProps={{ maxLength: 500 }} />
                </>
              )}
            </Box>
          ) : null}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 1.5 }}>
          {!cancelMode ? (
            <>
              <Button onClick={() => (setApproveIr(null), setCancelMode(false), setCancelRemarks(""))} disabled={actionLoading}>Close</Button>
              <Button variant="outlined" color="error" startIcon={<BlockIcon />} onClick={() => setCancelMode(true)} disabled={actionLoading}>Cancel IR</Button>
              {approveIr?.status === "Received" && (
                <Button variant="contained" color="primary" startIcon={<SendIcon />} onClick={confirmApprove} disabled={actionLoading || !approveIr}>
                  {actionLoading ? "Approving..." : "Approve"}
                </Button>
              )}
            </>
          ) : (
            <>
              <Button onClick={() => setCancelMode(false)} disabled={actionLoading}>Back</Button>
              <Button variant="contained" color="error" startIcon={<BlockIcon />} onClick={confirmCancel} disabled={actionLoading || !approveIr || (approveIr.status !== "Cancelled" && !cancelRemarks.trim())}>
                {actionLoading ? "Cancelling..." : "Confirm Cancel"}
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>

      {/* Delete confirm */}
      <Dialog open={Boolean(confirmDel)} onClose={() => setConfirmDel(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, fontSize: "1rem" }}>Delete IR {confirmDel?.ir_no}?</DialogTitle>
        <DialogContent>Are you sure you want to delete this inward register? This action cannot be undone.</DialogContent>
        <DialogActions sx={{ px: 3, py: 1.5 }}>
          <Button onClick={() => setConfirmDel(null)} color="inherit">Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDelete}>Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
