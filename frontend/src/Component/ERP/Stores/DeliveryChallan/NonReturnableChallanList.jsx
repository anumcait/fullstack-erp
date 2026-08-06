import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  Box, Typography, Card, CardContent, TextField, Button, Chip, LinearProgress,
  Table, TableHead, TableRow, TableCell, TableBody, TableContainer, IconButton,
  Tooltip, TablePagination, alpha, Dialog, DialogTitle, DialogContent,
  DialogActions, Select, MenuItem,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import AddIcon from "@mui/icons-material/Add";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import SendIcon from "@mui/icons-material/Send";
import SearchIcon from "@mui/icons-material/Search";
import UnfoldMoreIcon from "@mui/icons-material/UnfoldMore";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import BlockIcon from "@mui/icons-material/Block";
import PrintIcon from "@mui/icons-material/Print";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../../../context/ToastContext";
import DeliveryChallanPreview from "../DeliveryChallan/DeliveryChallanPreview";

const API = "/api/erp/stores/delivery-challans";

const statusColor = { Draft: "default", Approved: "primary", Cancelled: "error" };
const statusBg = { Draft: "#f1f5f9", Approved: "#eef2ff", Cancelled: "#fef2f2" };
const TYPECOLOR = "#6d28d9";

const fmtNum = (v) => {
  const n = Number(v);
  if (isNaN(n)) return "0";
  return n % 1 === 0 ? String(n) : n.toFixed(2).replace(/\.?0+$/, "");
};

const SummaryField = ({ label, value, wide }) => (
  <Box sx={{ gridColumn: wide ? "1 / -1" : "auto" }}>
    <Typography variant="caption" sx={{ color: "#64748b", fontSize: "0.65rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.3px" }}>{label}</Typography>
    <Typography sx={{ fontSize: "0.85rem", fontWeight: 600, color: "#1e293b", whiteSpace: "pre-wrap" }}>{value || "-"}</Typography>
  </Box>
);

const FilterSelect = ({ value, options, onChange, placeholder }) => (
  <Select size="small" value={value} displayEmpty
    onChange={(e) => onChange(e.target.value)}
    sx={{
      width: "100%", height: 28, fontSize: "0.72rem", borderRadius: 1.5,
      bgcolor: value ? alpha("#2563eb", 0.06) : "#f8fafc",
      "& .MuiSelect-select": { py: 0.4, pr: "22px !important" },
      "& .MuiOutlinedInput-notchedOutline": { borderColor: value ? alpha("#2563eb", 0.45) : "#e2e8f0" },
      "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#94a3b8" },
      color: value ? "#1e40af" : "#94a3b8",
      fontWeight: value ? 600 : 400,
    }}
    renderValue={(v) => v || placeholder || "All"}>
    <MenuItem value="" sx={{ fontSize: "0.76rem", color: "#94a3b8" }}>{placeholder || "All"}</MenuItem>
    {options.map((o) => (
      <MenuItem key={o} value={o} sx={{ fontSize: "0.76rem" }}>{o}</MenuItem>
    ))}
  </Select>
);

const datePresets = [
  { label: "Today", days: 0 },
  { label: "7 Days", days: 7 },
  { label: "30 Days", days: 30 },
  { label: "90 Days", days: 90 },
];

const fmtDDMMYYYY = (v) => {
  if (!v) return "-";
  const d = new Date(v);
  if (isNaN(d)) return String(v).slice(0, 10);
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return `${String(local.getUTCDate()).padStart(2, "0")}-${String(local.getUTCMonth() + 1).padStart(2, "0")}-${local.getUTCFullYear()}`;
};

const fmtDateTime = (v) => {
  if (!v) return "-";
  const d = new Date(v);
  if (isNaN(d)) return String(v).slice(0, 10);
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  const dd = String(local.getUTCDate()).padStart(2, "0");
  const mm = String(local.getUTCMonth() + 1).padStart(2, "0");
  const yyyy = local.getUTCFullYear();
  const hh = String(local.getUTCHours()).padStart(2, "0");
  const mi = String(local.getUTCMinutes()).padStart(2, "0");
  return `${dd}-${mm}-${yyyy} ${hh}.${mi}`;
};

const pad2 = (n) => String(n).padStart(2, "0");
const dcRef = (r) => {
  if (r?.dc_no) return r.dc_no;
  if (r?.draft_no) return r.draft_no;
  if (!r) return "DRAFT";
  const d = (r.updated_at || r.dc_date) ? new Date(r.updated_at || r.dc_date) : new Date();
  if (!isNaN(d)) {
    return `${Number(r.last_number ?? "0") + 1}${pad2(d.getHours())}${pad2(d.getMinutes())}${pad2(d.getSeconds())}`;
  }
  return "DRAFT";
};

const distinctValues = (rows, key) => {
  const set = new Set();
  rows.forEach((r) => {
    let v;
    if (key === "ref") v = dcRef(r);
    else if (key === "status") v = r.status;
    else if (key === "party_name") v = r.party_name;
    else if (key === "purpose") v = r.non_returnable_type;
    else if (key === "requested_by") v = r.requested_by;
    else if (key === "prepared_by") v = r.prepared_by;
    else v = r[key];
    if (v !== null && v !== undefined && String(v).trim() !== "") set.add(String(v));
  });
  return [...set].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
};

export default function NonReturnableChallanList() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [colFilters, setColFilters] = useState({});
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const [sortConfig, setSortConfig] = useState({ key: "dc_date", dir: "desc" });
  const [approveDc, setApproveDc] = useState(null);
  const [approveLoading, setApproveLoading] = useState(false);
  const [cancelMode, setCancelMode] = useState(false);
  const [cancelRemarks, setCancelRemarks] = useState("");
  const [previewDc, setPreviewDc] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [expandedData, setExpandedData] = useState(null);
  const [expandLoading, setExpandLoading] = useState(false);

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

  const fetchData = useCallback(() => {
    setLoading(true);
    const params = { dc_type: "N" };
    if (search) params.search = search;
    if (status) params.status = status;
    if (dateFrom) params.date_from = dateFrom;
    if (dateTo) params.date_to = dateTo;
    axios.get(API, { params })
      .then(({ data }) => setRows(data))
      .catch(() => showToast("Failed to load", "error"))
      .finally(() => setLoading(false));
  }, [search, status, dateFrom, dateTo]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const stats = useMemo(() => ({
    total: rows.length, draft: rows.filter((r) => r.status === "Draft").length,
    approved: rows.filter((r) => r.status === "Approved").length,
    cancelled: rows.filter((r) => r.status === "Cancelled").length,
  }), [rows]);

  const statusCounts = useMemo(() => ({
    "": stats.total, Draft: stats.draft, Approved: stats.approved, Cancelled: stats.cancelled,
  }), [stats]);

  const openApprove = async (id) => {
    setApproveLoading(true);
    try {
      const { data } = await axios.get(`${API}/${id}`);
      setApproveDc(data);
    } catch {
      showToast("Failed to load details", "error");
    } finally {
      setApproveLoading(false);
    }
  };
  const openPreview = async (id) => {
    try {
      const { data } = await axios.get(`${API}/${id}`);
      setPreviewDc(data);
    } catch {
      showToast("Failed to load preview", "error");
    }
  };
  const toggleExpand = async (id) => {
    if (expandedId === id) {
      setExpandedId(null);
      setExpandedData(null);
      return;
    }
    setExpandLoading(true);
    try {
      const { data } = await axios.get(`${API}/${id}`);
      setExpandedData(data);
      setExpandedId(id);
    } catch {
      showToast("Failed to load details", "error");
    } finally {
      setExpandLoading(false);
    }
  };
  const confirmCancel = async () => {
    if (!approveDc) return;
    setApproveLoading(true);
    try {
      await axios.post(`${API}/${approveDc.id}/cancel`, {
        cancel_remarks: cancelRemarks || null,
        cancel_by: localStorage.getItem("empId") || null,
        cancel_date: new Date().toISOString(),
      });
      showToast("Cancelled", "success");
      setApproveDc(null);
      setCancelMode(false);
      setCancelRemarks("");
      fetchData();
    } catch (e) {
      showToast(e.response?.data?.error || "Failed", "error");
    } finally {
      setApproveLoading(false);
    }
  };
  const confirmApprove = async () => {
    if (!approveDc) return;
    setApproveLoading(true);
    try {
      await axios.post(`${API}/${approveDc.id}/approve`, { approved_by: localStorage.getItem("empId") || null });
      showToast("Approved", "success");
      setApproveDc(null);
      fetchData();
    } catch (e) {
      showToast(e.response?.data?.error || "Failed", "error");
    } finally {
      setApproveLoading(false);
    }
  };

  const filteredRows = useMemo(() => {
    const active = Object.entries(colFilters).filter(([, v]) => v);
    if (active.length === 0) return rows;
    return rows.filter((r) => {
      const ref = dcRef(r);
      return active.every(([key, val]) => {
        if (key === "ref") return ref === val;
        if (key === "status") return r.status === val;
        if (key === "party_name") return (r.party_name || "") === val;
        if (key === "purpose") return (r.non_returnable_type || "") === val;
        if (key === "requested_by") return (r.requested_by || "") === val;
        if (key === "prepared_by") return (r.prepared_by || "") === val;
        return String(r[key] ?? "") === String(val);
      });
    });
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

  const thSx = { fontWeight: 700, fontSize: "0.85rem", color: "#0f172a", border: "1px solid #cbd5e1", position: "sticky", top: 0, zIndex: 2, bgcolor: alpha(TYPECOLOR, 0.1), whiteSpace: "nowrap", py: 0.7, px: 0.8, lineHeight: 1.2 };
  const thFilterSx = { ...thSx, fontWeight: 600, fontSize: "0.72rem", bgcolor: "#fff", borderTop: "2px solid #e2e8f0", py: 0.5 };
  const tdSx = { fontSize: "0.8rem", py: 0.5, px: 0.7, border: "1px solid #eef2f7" };

  const newPath = "/stores/non-returnable-gate-passes/new";
  const viewPath = (r) => `/stores/non-returnable-gate-passes/view/${r.id}`;
  const editPath = (r) => `/stores/non-returnable-gate-passes/edit/${r.id}`;

  return (
    <Box sx={{ p: 3, minHeight: "100vh", background: "linear-gradient(180deg, #f0f4fa 0%, #f8fafc 30%, #fbfcfe 100%)" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2.5, flexWrap: "wrap", gap: 1.5 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box sx={{ width: 44, height: 44, borderRadius: 3, bgcolor: alpha(TYPECOLOR, 0.12), display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 6px 16px ${alpha(TYPECOLOR, 0.18)}` }}>
            <DescriptionOutlinedIcon sx={{ fontSize: 24, color: TYPECOLOR }} />
          </Box>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, color: "#0f172a", letterSpacing: "-0.3px", lineHeight: 1.2 }}>Non Returnable Gate Pass (NRGP)</Typography>
            <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 600, fontSize: "0.72rem" }}>Non Returnable · {totalCount} records</Typography>
          </Box>
        </Box>
        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
          <Button variant="contained" startIcon={<AddIcon />}
            onClick={() => navigate(newPath)}
            sx={{ borderRadius: 2, textTransform: "none", fontWeight: 700, px: 2.5, bgcolor: TYPECOLOR, "&:hover": { bgcolor: alpha(TYPECOLOR, 0.85), transform: "translateY(-1px)" }, boxShadow: `0 6px 16px ${alpha(TYPECOLOR, 0.3)}`, transition: "all 0.15s" }}>
            Non Returnable
          </Button>
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={fetchData} sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600, borderColor: "#cbd5e1", color: "#475569", bgcolor: "#fff", minWidth: 40, "&:hover": { bgcolor: "#f8fafc", borderColor: "#94a3b8" } }} />
        </Box>
      </Box>

      <Card sx={{ borderRadius: 3, mb: 2, boxShadow: "0 6px 20px rgba(15,23,42,0.06)", border: "1px solid #e8edf4", bgcolor: "rgba(255,255,255,0.9)" }}>
        <CardContent sx={{ py: 1.5, "&:last-child": { pb: 1.5 } }}>
          <Box sx={{ display: "flex", gap: 0.8, flexWrap: "wrap", alignItems: "center", mb: 1.5 }}>
            {datePresets.map((p) => {
              const isActive = dateFrom === fmtDateInput(new Date(Date.now() - p.days * 86400000));
              return (
                <Chip key={p.label} label={p.label} size="small"
                  variant={isActive ? "filled" : "outlined"}
                  onClick={() => applyPreset(p.days)}
                  sx={{ fontWeight: 700, cursor: "pointer", borderRadius: 1.5, fontSize: "0.7rem", bgcolor: isActive ? alpha(TYPECOLOR, 0.1) : "transparent", borderColor: isActive ? alpha(TYPECOLOR, 0.3) : "#e2e8f0", color: isActive ? TYPECOLOR : "#64748b", "&:hover": { bgcolor: alpha(TYPECOLOR, 0.06) } }} />
              );
            })}
            <Box sx={{ flex: 1 }} />
            <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
              {["", "Draft", "Approved", "Cancelled"].map((s) => (
                <Chip key={s || "all"} size="small"
                  variant={status === s ? "filled" : "outlined"}
                  color={status === s ? (statusColor[s] || "default") : "default"}
                  onClick={() => { setStatus(s); setPage(0); }}
                  label={<Box component="span" sx={{ display: "inline-flex", alignItems: "center", gap: 0.5 }}>
                    {s || "All"}
                    <Box component="span" sx={{
                      px: 0.55, py: 0.05, borderRadius: 1, fontSize: "0.6rem", fontWeight: 800, lineHeight: 1.3,
                      bgcolor: status === s ? "rgba(255,255,255,0.28)" : alpha(TYPECOLOR, 0.1), color: status === s ? "inherit" : TYPECOLOR,
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
            <TextField size="small" placeholder="Search NRGP#, Party..." value={search}
              onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === "Enter" && fetchData()} sx={{ width: 220, "& .MuiInputBase-root": { fontSize: "0.78rem", borderRadius: 1.5 } }}
              InputProps={{ startAdornment: React.createElement(SearchIcon, { sx: { fontSize: 17, mr: 0.5, color: "#94a3b8" } }) }} />
            <Button variant="outlined" startIcon={<SearchIcon />} onClick={fetchData}
              sx={{ borderRadius: 1.5, textTransform: "none", fontWeight: 600, height: 40, borderColor: "#cbd5e1", color: "#475569" }}>Search</Button>
          </Box>
        </CardContent>
      </Card>

      <Card sx={{ borderRadius: 3, boxShadow: "0 6px 20px rgba(15,23,42,0.06)", border: "1px solid #e8edf4", bgcolor: "rgba(255,255,255,0.9)", overflow: "hidden" }}>
        <CardContent sx={{ p: { xs: 1.5, md: 2 }, "&:last-child": { pb: 2 } }}>
          {loading && <LinearProgress sx={{ mb: 1, borderRadius: 1, height: 3 }} />}
          {!loading && totalCount === 0 && (
            <Box sx={{ textAlign: "center", py: 8, color: "#94a3b8" }}>
              <Box sx={{ width: 72, height: 72, borderRadius: 4, bgcolor: alpha(TYPECOLOR, 0.06), display: "flex", alignItems: "center", justifyContent: "center", mx: "auto", mb: 2 }}>
                <DescriptionOutlinedIcon sx={{ fontSize: 36, opacity: 0.3 }} />
              </Box>
              <Typography sx={{ fontWeight: 700, fontSize: "1.1rem", color: "#64748b" }}>No non returnable gate passes found</Typography>
              <Typography sx={{ fontSize: "0.85rem", mt: 0.5, color: "#94a3b8" }}>Create a non returnable gate pass to dispatch goods permanently.</Typography>
              <Button variant="contained" startIcon={<AddIcon />} sx={{ mt: 2.5, borderRadius: 2, textTransform: "none", fontWeight: 700, px: 3, bgcolor: TYPECOLOR, "&:hover": { bgcolor: alpha(TYPECOLOR, 0.85) } }}
                onClick={() => navigate(newPath)}>Create Non Returnable</Button>
            </Box>
          )}
          {totalCount > 0 && (
            <>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1, px: 0.5 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: "#475569", fontSize: "0.78rem" }}>
                  <Box component="span" sx={{ color: TYPECOLOR, fontWeight: 800 }}>{totalCount}</Box> records
                </Typography>
                <Typography variant="body2" sx={{ color: "#94a3b8", fontWeight: 500, fontSize: "0.75rem" }}>
                  Page {page + 1} · {page * rowsPerPage + 1}–{Math.min((page + 1) * rowsPerPage, totalCount)}
                </Typography>
              </Box>
              <TableContainer sx={{ maxHeight: 520, overflow: "auto", borderRadius: 1.5, border: "1px solid #e8edf4" }}>
                <Table size="small" stickyHeader sx={{ minWidth: 1040, borderCollapse: "separate", borderSpacing: 0 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ ...thSx, width: 28, textAlign: "center" }}></TableCell>
                      <TableCell sx={{ ...thSx, width: 95, textAlign: "center" }}>Actions</TableCell>
                      <TableCell sx={{ ...thSx, width: 28, textAlign: "center" }}>#</TableCell>
                      <TableCell sx={{ ...thSx, width: 110, textAlign: "center", cursor: "pointer" }} onClick={() => handleSort("dc_no")}>NRGP # {sortIcon("dc_no")}</TableCell>
                      <TableCell sx={{ ...thSx, width: 170, textAlign: "center", cursor: "pointer" }} onClick={() => handleSort("dc_date")}>Date{sortIcon("dc_date")}</TableCell>
                      <TableCell sx={{ ...thSx, width: 150, cursor: "pointer" }} onClick={() => handleSort("party_name")}>Party{sortIcon("party_name")}</TableCell>
                      <TableCell sx={{ ...thSx, width: 130, textAlign: "center" }}>Purpose</TableCell>
                      <TableCell sx={{ ...thSx, width: 85, textAlign: "center", cursor: "pointer" }} onClick={() => handleSort("status")}>Status{sortIcon("status")}</TableCell>
                      <TableCell sx={{ ...thSx, width: 100, textAlign: "center" }}>Requestor</TableCell>
                      <TableCell sx={{ ...thSx, width: 100, textAlign: "center" }}>Prepared By</TableCell>
                      <TableCell sx={{ ...thSx, width: 90, textAlign: "center" }}>Req. Date</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ ...thFilterSx, width: 28 }}></TableCell>
                      <TableCell sx={{ ...thFilterSx, width: 95 }}></TableCell>
                      <TableCell sx={{ ...thFilterSx, width: 28 }}></TableCell>
                      <TableCell sx={{ ...thFilterSx, width: 110 }}>
                        <FilterSelect value={colFilters.ref || ""} options={distinctValues(rows, "ref")}
                          onChange={(v) => setColFilters((f) => ({ ...f, ref: v }))} placeholder="All NRGP #" />
                      </TableCell>
                      <TableCell sx={{ ...thFilterSx, width: 170 }}></TableCell>
                      <TableCell sx={{ ...thFilterSx, width: 150 }}>
                        <FilterSelect value={colFilters.party_name || ""} options={distinctValues(rows, "party_name")}
                          onChange={(v) => setColFilters((f) => ({ ...f, party_name: v }))} placeholder="All Parties" />
                      </TableCell>
                      <TableCell sx={{ ...thFilterSx, width: 130 }}>
                        <FilterSelect value={colFilters.purpose || ""} options={distinctValues(rows, "purpose")}
                          onChange={(v) => setColFilters((f) => ({ ...f, purpose: v }))} placeholder="All" />
                      </TableCell>
                      <TableCell sx={{ ...thFilterSx, width: 85 }}>
                        <FilterSelect value={colFilters.status || ""} options={distinctValues(rows, "status")}
                          onChange={(v) => setColFilters((f) => ({ ...f, status: v }))} placeholder="All Status" />
                      </TableCell>
                      <TableCell sx={{ ...thFilterSx, width: 100 }}>
                        <FilterSelect value={colFilters.requested_by || ""} options={distinctValues(rows, "requested_by")}
                          onChange={(v) => setColFilters((f) => ({ ...f, requested_by: v }))} placeholder="All" />
                      </TableCell>
                      <TableCell sx={{ ...thFilterSx, width: 100 }}>
                        <FilterSelect value={colFilters.prepared_by || ""} options={distinctValues(rows, "prepared_by")}
                          onChange={(v) => setColFilters((f) => ({ ...f, prepared_by: v }))} placeholder="All" />
                      </TableCell>
                      <TableCell sx={{ ...thFilterSx, width: 90 }}></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {pagedRows.map((r, idx) => (
                      <React.Fragment key={r.id}>
                      <TableRow hover
                        onDoubleClick={() => navigate(viewPath(r))}
                        sx={{ bgcolor: idx % 2 === 0 ? "#fff" : "#f8fafc", "&:hover": { bgcolor: alpha(TYPECOLOR, 0.05) }, transition: "background 0.15s", cursor: "pointer" }}>
                        <TableCell sx={{ ...tdSx, textAlign: "center" }}>
                          <Tooltip title={expandedId === r.id ? "Collapse" : "Expand details"}>
                            <IconButton size="small" sx={{ p: 0.3, color: "#64748b", "&:hover": { color: TYPECOLOR } }} onClick={(e) => { e.stopPropagation(); toggleExpand(r.id); }}>
                              {expandedId === r.id ? <ExpandMoreIcon sx={{ fontSize: 17 }} /> : <ChevronRightIcon sx={{ fontSize: 17 }} />}
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                        <TableCell sx={{ ...tdSx, textAlign: "center", whiteSpace: "nowrap" }}>
                          <Tooltip title="Preview / Print"><IconButton size="small" sx={{ p: 0.3, color: "#64748b", "&:hover": { color: "#0f172a" } }} onClick={() => openPreview(r.id)}><PrintIcon sx={{ fontSize: 15 }} /></IconButton></Tooltip>
                          <Tooltip title="View"><IconButton size="small" sx={{ p: 0.3, color: "#64748b", "&:hover": { color: TYPECOLOR } }} onClick={() => navigate(viewPath(r))}><VisibilityIcon sx={{ fontSize: 15 }} /></IconButton></Tooltip>
                          {r.status === "Draft" && (
                            <>
                              <Tooltip title="Edit"><IconButton size="small" sx={{ p: 0.3, color: "#64748b", "&:hover": { color: "#f59e0b" } }} onClick={() => navigate(editPath(r))}><EditIcon sx={{ fontSize: 15 }} /></IconButton></Tooltip>
                              <Tooltip title="Approve / Cancel"><IconButton size="small" sx={{ p: 0.3, color: "#64748b", "&:hover": { color: "#1565c0" } }} onClick={() => openApprove(r.id)}><SendIcon sx={{ fontSize: 15 }} /></IconButton></Tooltip>
                            </>
                          )}
                          {r.status === "Approved" && (
                            <Tooltip title="Cancel"><IconButton size="small" sx={{ p: 0.3, color: "#64748b", "&:hover": { color: "#dc2626" } }} onClick={() => openApprove(r.id)}><BlockIcon sx={{ fontSize: 15 }} /></IconButton></Tooltip>
                          )}
                        </TableCell>
                        <TableCell sx={{ ...tdSx, textAlign: "center", fontWeight: 700, color: "#0f172a", fontSize: "0.72rem" }}>{idx + 1}</TableCell>
                        <TableCell sx={{ ...tdSx, textAlign: "center", fontWeight: 800, color: TYPECOLOR, fontFamily: "monospace", fontSize: "0.82rem" }}>{dcRef(r)}</TableCell>
                        <TableCell sx={{ ...tdSx, textAlign: "center", whiteSpace: "nowrap", fontSize: "0.78rem", fontWeight: 600, color: "#0f172a" }}>{fmtDateTime(r.dc_date)}</TableCell>
                        <TableCell sx={{ ...tdSx, fontWeight: 700, color: "#0f172a", maxWidth: 170, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: "0.78rem" }}>
                          <Tooltip title={r.party_name || "-"}><span>{r.party_name || "-"}</span></Tooltip>
                        </TableCell>
                        <TableCell sx={{ ...tdSx, textAlign: "center" }}>
                          <Box sx={{ px: 0.9, py: 0.2, borderRadius: 1, fontSize: "0.65rem", fontWeight: 800, display: "inline-block", bgcolor: alpha(TYPECOLOR, 0.12), color: TYPECOLOR, border: `1px solid ${alpha(TYPECOLOR, 0.35)}` }}>
                            {r.non_returnable_type || r.dc_type || "NR"}
                          </Box>
                        </TableCell>
                        <TableCell sx={{ ...tdSx, textAlign: "center" }}>
                          {r.status === "Cancelled" && r.cancel_remarks ? (
                            <Tooltip title={[
                              `Remarks: ${r.cancel_remarks}`,
                              r.cancel_by && `By: ${r.cancel_by}`,
                              r.cancel_date && `On: ${fmtDateTime(r.cancel_date)}`,
                            ].filter(Boolean).join("\n")}>
                              <Box sx={{ px: 1, py: 0.2, borderRadius: 1.5, fontSize: "0.65rem", fontWeight: 700, display: "inline-block", bgcolor: "#fef2f2", color: "#dc2626" }}>{r.status}</Box>
                            </Tooltip>
                          ) : (
                            <Box sx={{ px: 1, py: 0.2, borderRadius: 1.5, fontSize: "0.65rem", fontWeight: 700, display: "inline-block", bgcolor: r.status === "Approved" ? "#eef2ff" : "#f1f5f9", color: r.status === "Approved" ? "#1565c0" : "#475569" }}>{r.status || "Draft"}</Box>
                          )}
                        </TableCell>
                        <TableCell sx={{ ...tdSx, textAlign: "center", fontSize: "0.78rem" }}>{r.requested_by || "-"}</TableCell>
                        <TableCell sx={{ ...tdSx, textAlign: "center", fontSize: "0.78rem" }}>{r.prepared_by || "-"}</TableCell>
                        <TableCell sx={{ ...tdSx, textAlign: "center", whiteSpace: "nowrap", fontSize: "0.78rem" }}>{fmtDDMMYYYY(r.req_date)}</TableCell>
                      </TableRow>
                      {expandedId === r.id && (
                        <TableRow sx={{ bgcolor: "#f8fafc" }}>
                          <TableCell colSpan={11} sx={{ p: 0, border: "1px solid #e2e8f0", borderTop: "2px solid #cbd5e1" }}>
                            <Box sx={{ p: 1.5 }}>
                              {expandLoading ? <LinearProgress sx={{ height: 3, borderRadius: 1 }} /> : (
                                <TableContainer sx={{ border: "1px solid #e2e8f0", borderRadius: 1 }}>
                                  <Table size="small" sx={{ borderCollapse: "separate", borderSpacing: 0 }}>
                                    <TableHead>
                                      <TableRow>
                                        {["#", "Item Code", "Description", "UOM", "Qty", "Rate", "Value", "Remarks"].map((l, i) => (
                                          <TableCell key={l} sx={{ fontWeight: 700, fontSize: "0.72rem", color: "#1e293b", bgcolor: "#e8edf4", border: "1px solid #cbd5e1", whiteSpace: "nowrap", textAlign: i === 0 || i >= 3 ? "center" : "left" }}>{l}</TableCell>
                                        ))}
                                      </TableRow>
                                    </TableHead>
                                    <TableBody>
                                      {(expandedData?.items || []).map((it, i) => (
                                        <TableRow key={it.id || i}>
                                          <TableCell sx={{ fontSize: "0.75rem", textAlign: "center", border: "1px solid #e2e8f0" }}>{i + 1}</TableCell>
                                          <TableCell sx={{ fontSize: "0.75rem", fontWeight: 600, border: "1px solid #e2e8f0" }}>{it.item_code}</TableCell>
                                          <TableCell sx={{ fontSize: "0.75rem", border: "1px solid #e2e8f0" }}>{it.item_name}</TableCell>
                                          <TableCell sx={{ fontSize: "0.75rem", textAlign: "center", border: "1px solid #e2e8f0" }}>{it.unit || it.item?.unit?.short_name || ""}</TableCell>
                                          <TableCell sx={{ fontSize: "0.75rem", textAlign: "center", border: "1px solid #e2e8f0" }}>{fmtNum(it.quantity)}</TableCell>
                                          <TableCell sx={{ fontSize: "0.75rem", textAlign: "center", border: "1px solid #e2e8f0" }}>{fmtNum(it.rate)}</TableCell>
                                          <TableCell sx={{ fontSize: "0.75rem", textAlign: "center", fontWeight: 700, color: "#059669", border: "1px solid #e2e8f0" }}>{fmtNum((Number(it.quantity) || 0) * (Number(it.rate) || 0))}</TableCell>
                                          <TableCell sx={{ fontSize: "0.75rem", border: "1px solid #e2e8f0" }}>{it.remarks || ""}</TableCell>
                                        </TableRow>
                                      ))}
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
                sx={{ "& .MuiTablePagination-toolbar": { minHeight: 34 }, "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows": { fontSize: "0.75rem" } }} />
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={Boolean(approveDc)} onClose={() => !approveLoading && (setApproveDc(null), setCancelMode(false), setCancelRemarks(""))} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, fontSize: "1rem", display: "flex", justifyContent: "space-between", alignItems: "center", pr: 3 }}>
          <Box>Non Returnable Gate Pass — {dcRef(approveDc)}</Box>
          {approveDc && <Chip label={approveDc.status} size="small" color={approveDc.status === "Approved" ? "primary" : statusColor[approveDc.status] || "default"} sx={{ fontSize: "0.7rem", height: 22, fontWeight: 600 }} />}
        </DialogTitle>
        <DialogContent dividers>
          {approveLoading && !approveDc ? (
            <LinearProgress />
          ) : approveDc ? (
            <Box>
              <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 1.5, mb: 2 }}>
                <SummaryField label="NRGP #" value={dcRef(approveDc)} />
                <SummaryField label="Date" value={fmtDateTime(approveDc.dc_date)} />
                <SummaryField label="Purpose" value={approveDc.non_returnable_type} />
                <SummaryField label="Party" value={approveDc.party_name} />
                <SummaryField label="Department" value={approveDc.department} />
                <SummaryField label="Through" value={approveDc.through} />
                <SummaryField label="Requested By" value={approveDc.requested_by} />
                <SummaryField label="Prepared By" value={approveDc.prepared_by} />
                <SummaryField label="Req. Date" value={fmtDDMMYYYY(approveDc.req_date)} />
                {approveDc.reference_no ? <SummaryField label="Reference" value={approveDc.reference_no} /> : null}
                {approveDc.remarks ? <SummaryField label="Remarks" value={approveDc.remarks} wide /> : null}
                {approveDc.cancel_remarks ? <SummaryField label="Cancel Remarks" value={approveDc.cancel_remarks} wide /> : null}
                {approveDc.cancel_by ? <SummaryField label="Cancelled By" value={approveDc.cancel_by} /> : null}
                {approveDc.cancel_date ? <SummaryField label="Cancelled On" value={fmtDateTime(approveDc.cancel_date)} /> : null}
              </Box>
              <TableContainer sx={{ maxHeight: 300, border: "1px solid #e2e8f0", borderRadius: 1 }}>
                <Table size="small" stickyHeader sx={{ borderCollapse: "separate", borderSpacing: 0 }}>
                  <TableHead>
                    <TableRow>
                      {["#", "Item Code", "Description", "UOM", "Qty", "Rate", "Value", "Remarks"].map((l, i) => (
                        <TableCell key={l} sx={{ fontWeight: 700, fontSize: "0.72rem", color: "#1e293b", bgcolor: "#e8edf4", borderBottom: "1px solid #cbd5e1", whiteSpace: "nowrap", textAlign: i === 0 || i >= 4 ? "center" : "left" }}>{l}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(approveDc.items || []).map((it, i) => (
                      <TableRow key={it.id || i}>
                        <TableCell sx={{ fontSize: "0.75rem", textAlign: "center" }}>{i + 1}</TableCell>
                        <TableCell sx={{ fontSize: "0.75rem", fontWeight: 600 }}>{it.item_code}</TableCell>
                        <TableCell sx={{ fontSize: "0.75rem" }}>{it.item_name}</TableCell>
                        <TableCell sx={{ fontSize: "0.75rem" }}>{it.unit || it.item?.unit?.short_name || ""}</TableCell>
                        <TableCell sx={{ fontSize: "0.75rem", textAlign: "right" }}>{fmtNum(it.quantity)}</TableCell>
                        <TableCell sx={{ fontSize: "0.75rem", textAlign: "right" }}>{fmtNum(it.rate)}</TableCell>
                        <TableCell sx={{ fontSize: "0.75rem", textAlign: "right", fontWeight: 700, color: "#059669" }}>{fmtNum((Number(it.quantity) || 0) * (Number(it.rate) || 0))}</TableCell>
                        <TableCell sx={{ fontSize: "0.75rem" }}>{it.remarks || ""}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              {!cancelMode && approveDc.status === "Draft" && (
                <Typography variant="caption" sx={{ color: "#dc2626", fontWeight: 600, display: "block", mt: 1.5 }}>
                  Approving this gate pass will permanently reduce stock for the listed items and cannot be received back.
                </Typography>
              )}
              {cancelMode && (
                <>
                  {approveDc.status === "Approved" && (
                    <Typography variant="caption" sx={{ color: "#dc2626", fontWeight: 600, display: "block", mt: 1.5 }}>
                      Cancelling this approved gate pass will restore stock for the listed items.
                    </Typography>
                  )}
                  <TextField size="small" fullWidth multiline minRows={2} label="Cancel Remarks" value={cancelRemarks}
                    onChange={(e) => setCancelRemarks(e.target.value)} sx={{ mt: 1.5 }} error={cancelMode && approveDc.status !== "Cancelled" && !cancelRemarks.trim()} helperText={cancelMode && approveDc.status !== "Cancelled" && !cancelRemarks.trim() ? "Cancel remarks are required" : `${cancelRemarks.length}/500`} inputProps={{ maxLength: 500 }} />
                </>
              )}
            </Box>
          ) : null}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 1.5 }}>
          {!cancelMode ? (
            <>
              <Button onClick={() => (setApproveDc(null), setCancelMode(false), setCancelRemarks(""))} disabled={approveLoading}>Close</Button>
              <Button variant="outlined" color="error" startIcon={<BlockIcon />} onClick={() => setCancelMode(true)} disabled={approveLoading}>Cancel Gate Pass</Button>
              {approveDc?.status === "Draft" && (
                <Button variant="contained" color="primary" startIcon={<SendIcon />} onClick={confirmApprove} disabled={approveLoading || !approveDc}>
                  {approveLoading ? "Approving..." : "Approve"}
                </Button>
              )}
            </>
          ) : (
            <>
              <Button onClick={() => setCancelMode(false)} disabled={approveLoading}>Back</Button>
              <Button variant="contained" color="error" startIcon={<BlockIcon />} onClick={confirmCancel} disabled={approveLoading || !approveDc || (approveDc.status !== "Cancelled" && !cancelRemarks.trim())}>
                {approveLoading ? "Cancelling..." : "Confirm Cancel"}
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>

      {previewDc && <DeliveryChallanPreview data={previewDc} onClose={() => setPreviewDc(null)} />}
    </Box>
  );
}