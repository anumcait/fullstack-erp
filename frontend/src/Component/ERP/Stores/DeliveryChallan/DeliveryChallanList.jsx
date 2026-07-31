import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  Box, Typography, Card, CardContent, TextField, Button, Chip, LinearProgress,
  Table, TableHead, TableRow, TableCell, TableBody, TableContainer, IconButton,
  Tooltip, TablePagination, Tabs, Tab, alpha, Dialog, DialogTitle, DialogContent,
  DialogActions,
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
import DeliveryChallanPreview from "./DeliveryChallanPreview";

const API = "/api/erp/stores/delivery-challans";

const statusColor = { Draft: "default", Approved: "primary", Returned: "success", Cancelled: "error", Billed: "success" };
const statusBg = { Draft: "#f1f5f9", Approved: "#eef2ff", Returned: "#e8f5e9", Cancelled: "#fef2f2", Billed: "#e8f5e9" };
const typeLabels = { L: "Replacement", R: "Repair", M: "Maintenance", J: "Jobwork", S: "Sale on Approval" };
const typeColors = { L: "#0d9488", R: "#ec4899", M: "#0e7490", J: "#475569", S: "#1565c0" };

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

export default function DeliveryChallanList() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [dcTypeTab, setDcTypeTab] = useState(0);

  const typeTabs = [
    { label: "Replacement", code: "L" },
    { label: "Repair", code: "R" },
    { label: "Maintenance", code: "M" },
    { label: "Jobwork", code: "J" },
    { label: "Sale on Approval", code: "S" },
  ];
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
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
    const params = {};
    if (search) params.search = search;
    if (status) params.status = status;
    if (typeTabs[dcTypeTab].code) params.dc_type = typeTabs[dcTypeTab].code;
    if (dateFrom) params.date_from = dateFrom;
    if (dateTo) params.date_to = dateTo;
    axios.get(API, { params })
      .then(({ data }) => setRows(data))
      .catch(() => showToast("Failed to load", "error"))
      .finally(() => setLoading(false));
  }, [search, status, dcTypeTab, dateFrom, dateTo]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const stats = useMemo(() => ({
    total: rows.length, draft: rows.filter((r) => r.status === "Draft").length,
    approved: rows.filter((r) => r.status === "Approved").length,
    billed: rows.filter((r) => r.status === "Billed").length,
    returned: rows.filter((r) => r.status === "Returned").length,
    cancelled: rows.filter((r) => r.status === "Cancelled").length,
  }), [rows]);

  const statusCounts = useMemo(() => ({
    "": stats.total,
    Draft: stats.draft,
    Approved: stats.approved,
    Billed: stats.billed,
    Returned: stats.returned,
    Cancelled: stats.cancelled,
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
  const sorted = [...rows].sort((a, b) => {
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

  const thSx = { fontWeight: 700, fontSize: "0.78rem", color: "#0f172a", border: "1px solid #cbd5e1", position: "sticky", top: 0, zIndex: 2, bgcolor: "#eef2f7", whiteSpace: "nowrap", py: 0.7, px: 0.8, lineHeight: 1.2 };
  const tdSx = { fontSize: "0.8rem", py: 0.5, px: 0.7, border: "1px solid #eef2f7" };
  const activeTypeColor = typeColors[typeTabs[dcTypeTab]?.code] || "#1565c0";
  const typeRoute = (code) => code === "R" ? "repair" : code === "M" ? "maintenance" : null;
  const newPath = (() => {
    const t = typeRoute(typeTabs[dcTypeTab].code);
    return t ? `/stores/delivery-challans/${t}/new` : "/stores/delivery-challans/prepare/" + typeTabs[dcTypeTab].code;
  })();
  const viewPath = (r) => {
    const t = typeRoute(r.dc_type);
    return t ? `/stores/delivery-challans/${t}/view/${r.id}` : `/stores/delivery-challans/view/${r.id}`;
  };
  const editPath = (r) => {
    const t = typeRoute(r.dc_type);
    return t ? `/stores/delivery-challans/${t}/edit/${r.id}` : `/stores/delivery-challans/edit/${r.id}`;
  };

  return (
    <Box sx={{ p: 3, minHeight: "100vh", background: "linear-gradient(180deg, #f0f4fa 0%, #f8fafc 30%, #fbfcfe 100%)" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2.5, flexWrap: "wrap", gap: 1.5 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box sx={{ width: 44, height: 44, borderRadius: 3, bgcolor: alpha(activeTypeColor, 0.12), display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 6px 16px ${alpha(activeTypeColor, 0.18)}` }}>
            <DescriptionOutlinedIcon sx={{ fontSize: 24, color: activeTypeColor }} />
          </Box>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, color: "#0f172a", letterSpacing: "-0.3px", lineHeight: 1.2 }}>Delivery Challans</Typography>
            <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 600, fontSize: "0.72rem" }}>{typeTabs[dcTypeTab].label} · {totalCount} records</Typography>
          </Box>
        </Box>
        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
          <Button variant="contained" startIcon={<AddIcon />}
            onClick={() => navigate(newPath)}
            sx={{ borderRadius: 2, textTransform: "none", fontWeight: 700, px: 2.5, bgcolor: activeTypeColor, "&:hover": { bgcolor: alpha(activeTypeColor, 0.85), transform: "translateY(-1px)" }, boxShadow: `0 6px 16px ${alpha(activeTypeColor, 0.3)}`, transition: "all 0.15s" }}>
            {typeTabs[dcTypeTab].label}
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
                  sx={{ fontWeight: 700, cursor: "pointer", borderRadius: 1.5, fontSize: "0.7rem", bgcolor: isActive ? alpha(activeTypeColor, 0.1) : "transparent", borderColor: isActive ? alpha(activeTypeColor, 0.3) : "#e2e8f0", color: isActive ? activeTypeColor : "#64748b", "&:hover": { bgcolor: alpha(activeTypeColor, 0.06) } }} />
              );
            })}
            <Box sx={{ flex: 1 }} />
            <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
              {["", "Draft", "Approved", "Billed", "Returned", "Cancelled"].map((s) => (
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
            <TextField size="small" placeholder="Search DC#, Party..." value={search}
              onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === "Enter" && fetchData()} sx={{ width: 200, "& .MuiInputBase-root": { fontSize: "0.78rem", borderRadius: 1.5 } }}
              InputProps={{ startAdornment: React.createElement(SearchIcon, { sx: { fontSize: 17, mr: 0.5, color: "#94a3b8" } }) }} />
            <Button variant="outlined" startIcon={<SearchIcon />} onClick={fetchData}
              sx={{ borderRadius: 1.5, textTransform: "none", fontWeight: 600, height: 40, borderColor: "#cbd5e1", color: "#475569" }}>Search</Button>
          </Box>
        </CardContent>
      </Card>

      <Box sx={{ mb: 0.5, borderBottom: 1, borderColor: "#e2e8f0" }}>
        <Tabs value={dcTypeTab} onChange={(_, v) => { setDcTypeTab(v); setPage(0); }} variant="scrollable" scrollButtons="auto"
          sx={{ "& .MuiTab-root": { fontWeight: 600, fontSize: "0.8rem", textTransform: "none", minHeight: 38, py: 0.5, color: "#64748b", transition: "color 0.2s" },
            "& .Mui-selected": { color: activeTypeColor, fontWeight: 700 },
            "& .MuiTabs-indicator": { backgroundColor: activeTypeColor, height: 2.5 } }}>
          {typeTabs.map((t, i) => (
            <Tab key={i} label={<Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
              {t.label}
              <Box sx={{ px: 0.7, py: 0.15, borderRadius: 1, fontSize: "0.62rem", fontWeight: 800, bgcolor: dcTypeTab === i ? typeColors[t.code] : "#f1f5f9", color: dcTypeTab === i ? "#fff" : "#64748b" }}>{t.code}</Box>
            </Box>} />
          ))}
        </Tabs>
      </Box>

      <Card sx={{ borderRadius: 3, boxShadow: "0 6px 20px rgba(15,23,42,0.06)", border: "1px solid #e8edf4", bgcolor: "rgba(255,255,255,0.9)", overflow: "hidden" }}>
        <CardContent sx={{ p: { xs: 1.5, md: 2 }, "&:last-child": { pb: 2 } }}>
          {loading && <LinearProgress sx={{ mb: 1, borderRadius: 1, height: 3 }} />}
          {!loading && totalCount === 0 && (
            <Box sx={{ textAlign: "center", py: 8, color: "#94a3b8" }}>
              <Box sx={{ width: 72, height: 72, borderRadius: 4, bgcolor: alpha(activeTypeColor, 0.06), display: "flex", alignItems: "center", justifyContent: "center", mx: "auto", mb: 2 }}>
                <DescriptionOutlinedIcon sx={{ fontSize: 36, opacity: 0.3 }} />
              </Box>
              <Typography sx={{ fontWeight: 700, fontSize: "1.1rem", color: "#64748b" }}>No challans found</Typography>
              <Typography sx={{ fontSize: "0.85rem", mt: 0.5, color: "#94a3b8" }}>Adjust filters or create a new {typeTabs[dcTypeTab].label} challan.</Typography>
              <Button variant="contained" startIcon={<AddIcon />} sx={{ mt: 2.5, borderRadius: 2, textTransform: "none", fontWeight: 700, px: 3, bgcolor: activeTypeColor, "&:hover": { bgcolor: alpha(activeTypeColor, 0.85) } }}
                onClick={() => navigate(newPath)}>Create {typeTabs[dcTypeTab].label}</Button>
            </Box>
          )}
          {totalCount > 0 && (
            <>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1, px: 0.5 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: "#475569", fontSize: "0.78rem" }}>
                  <Box component="span" sx={{ color: activeTypeColor, fontWeight: 800 }}>{totalCount}</Box> records
                </Typography>
                <Typography variant="body2" sx={{ color: "#94a3b8", fontWeight: 500, fontSize: "0.75rem" }}>
                  Page {page + 1} · {page * rowsPerPage + 1}–{Math.min((page + 1) * rowsPerPage, totalCount)}
                </Typography>
              </Box>
              <TableContainer sx={{ maxHeight: 520, overflow: "auto", borderRadius: 1.5, border: "1px solid #e8edf4" }}>
                <Table size="small" stickyHeader sx={{ minWidth: 1120, borderCollapse: "separate", borderSpacing: 0 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ ...thSx, width: 28, textAlign: "center" }}></TableCell>
                      <TableCell sx={{ ...thSx, width: 95, textAlign: "center" }}>Actions</TableCell>
                      <TableCell sx={{ ...thSx, width: 28, textAlign: "center" }}>#</TableCell>
                      <TableCell sx={{ ...thSx, width: 115, textAlign: "center", cursor: "pointer" }} onClick={() => handleSort("dc_no")}>DC # {sortIcon("dc_no")}</TableCell>
                      <TableCell sx={{ ...thSx, width: 170, textAlign: "center", cursor: "pointer" }} onClick={() => handleSort("dc_date")}>Date{sortIcon("dc_date")}</TableCell>
                      <TableCell sx={{ ...thSx, width: 160, cursor: "pointer" }} onClick={() => handleSort("party_name")}>Party{sortIcon("party_name")}</TableCell>
                      <TableCell sx={{ ...thSx, width: 95, textAlign: "center" }}>Type</TableCell>
                      <TableCell sx={{ ...thSx, width: 85, textAlign: "center", cursor: "pointer" }} onClick={() => handleSort("status")}>Status{sortIcon("status")}</TableCell>
                      <TableCell sx={{ ...thSx, width: 105, textAlign: "center" }}>Requestor</TableCell>
                      <TableCell sx={{ ...thSx, width: 100, textAlign: "center" }}>Prepared By</TableCell>
                      <TableCell sx={{ ...thSx, width: 90, textAlign: "center" }}>Req. Date</TableCell>
                      <TableCell sx={{ ...thSx, width: 90, textAlign: "center" }}>Bill #</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {pagedRows.map((r, idx) => (
                      <React.Fragment key={r.id}>
                      <TableRow hover
                        onDoubleClick={() => navigate(viewPath(r))}
                        sx={{ bgcolor: idx % 2 === 0 ? "#fff" : alpha("#f8fafc", 0.7), "&:hover": { bgcolor: alpha(activeTypeColor, 0.04) }, transition: "background 0.12s", cursor: "pointer" }}>
                        <TableCell sx={{ ...tdSx, textAlign: "center" }}>
                          <Tooltip title={expandedId === r.id ? "Collapse" : "Expand details"}>
                            <IconButton size="small" sx={{ p: 0.3, color: "#64748b", "&:hover": { color: activeTypeColor } }} onClick={(e) => { e.stopPropagation(); toggleExpand(r.id); }}>
                              {expandedId === r.id ? <ExpandMoreIcon sx={{ fontSize: 17 }} /> : <ChevronRightIcon sx={{ fontSize: 17 }} />}
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                        <TableCell sx={{ ...tdSx, textAlign: "center", whiteSpace: "nowrap" }}>
                          <Tooltip title="Preview / Print"><IconButton size="small" sx={{ p: 0.3, color: "#64748b", "&:hover": { color: "#0f172a" } }} onClick={() => openPreview(r.id)}><PrintIcon sx={{ fontSize: 15 }} /></IconButton></Tooltip>
                          <Tooltip title="View"><IconButton size="small" sx={{ p: 0.3, color: "#64748b", "&:hover": { color: activeTypeColor } }} onClick={() => navigate(viewPath(r))}><VisibilityIcon sx={{ fontSize: 15 }} /></IconButton></Tooltip>
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
                        <TableCell sx={{ ...tdSx, textAlign: "center", fontWeight: 600, color: "#94a3b8", fontSize: "0.72rem" }}>{idx + 1}</TableCell>
                        <TableCell sx={{ ...tdSx, textAlign: "center", fontWeight: 700, color: activeTypeColor, fontFamily: "monospace", fontSize: "0.82rem" }}>{r.dc_no}</TableCell>
                        <TableCell sx={{ ...tdSx, textAlign: "center", whiteSpace: "nowrap", fontSize: "0.78rem" }}>{fmtDateTime(r.dc_date)}</TableCell>
                        <TableCell sx={{ ...tdSx, fontWeight: 600, maxWidth: 170, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: "0.78rem" }}>
                          <Tooltip title={r.party_name || "-"}><span>{r.party_name || "-"}</span></Tooltip>
                        </TableCell>
                        <TableCell sx={{ ...tdSx, textAlign: "center" }}>
                          <Box sx={{ px: 0.9, py: 0.2, borderRadius: 1, fontSize: "0.65rem", fontWeight: 800, display: "inline-block", bgcolor: alpha(typeColors[r.dc_type] || "#94a3b8", 0.16), color: typeColors[r.dc_type] || "#64748b", border: `1px solid ${alpha(typeColors[r.dc_type] || "#94a3b8", 0.4)}` }}>
                            {typeLabels[r.dc_type] || r.dc_type || "SA"}
                          </Box>
                        </TableCell>
                        <TableCell sx={{ ...tdSx, textAlign: "center" }}>
                          <Box sx={{ px: 1, py: 0.2, borderRadius: 1.5, fontSize: "0.65rem", fontWeight: 700, display: "inline-block", bgcolor: alpha(statusBg[r.status] || "#f1f5f9", 0.8), color: statusColor[r.status] === "success" ? "#2e7d32" : statusColor[r.status] === "primary" ? "#1565c0" : statusColor[r.status] === "error" ? "#dc2626" : "#475569" }}>
                            {r.status}
                          </Box>
                        </TableCell>
                        <TableCell sx={{ ...tdSx, textAlign: "center", fontSize: "0.78rem" }}>{r.requested_by || "-"}</TableCell>
                        <TableCell sx={{ ...tdSx, textAlign: "center", fontSize: "0.78rem" }}>{r.prepared_by || "-"}</TableCell>
                        <TableCell sx={{ ...tdSx, textAlign: "center", whiteSpace: "nowrap", fontSize: "0.78rem" }}>{fmtDDMMYYYY(r.req_date)}</TableCell>
                        <TableCell sx={{ ...tdSx, textAlign: "center", fontWeight: 600, fontSize: "0.78rem", color: r.bill_no ? "#2e7d32" : "#cbd5e1" }}>{r.bill_no || "-"}</TableCell>
                      </TableRow>
                      {expandedId === r.id && (
                        <TableRow sx={{ bgcolor: "#f8fafc" }}>
                          <TableCell colSpan={12} sx={{ p: 0, border: "1px solid #e2e8f0", borderTop: "2px solid #cbd5e1" }}>
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
                                      {(expandedData?.items || []).length === 0 && !expandLoading && (
                                        <TableRow><TableCell colSpan={8} sx={{ fontSize: "0.75rem", textAlign: "center", color: "#94a3b8", py: 2 }}>No items</TableCell></TableRow>
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
                sx={{ "& .MuiTablePagination-toolbar": { minHeight: 34 }, "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows": { fontSize: "0.75rem" } }} />
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={Boolean(approveDc)} onClose={() => !approveLoading && (setApproveDc(null), setCancelMode(false), setCancelRemarks(""))} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, fontSize: "1rem", display: "flex", justifyContent: "space-between", alignItems: "center", pr: 3 }}>
          <Box>Delivery Challan — {approveDc?.dc_no}</Box>
          {approveDc && <Chip label={approveDc.status} size="small" color={approveDc.status === "Approved" ? "primary" : statusColor[approveDc.status] || "default"} sx={{ fontSize: "0.7rem", height: 22, fontWeight: 600 }} />}
        </DialogTitle>
        <DialogContent dividers>
          {approveLoading && !approveDc ? (
            <LinearProgress />
          ) : approveDc ? (
            <Box>
              <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 1.5, mb: 2 }}>
                <SummaryField label="DC #" value={approveDc.dc_no} />
                <SummaryField label="Date" value={fmtDateTime(approveDc.dc_date)} />
                <SummaryField label="Type" value={typeLabels[approveDc.dc_type] || approveDc.dc_type || "-"} />
                <SummaryField label="Party" value={approveDc.party_name} />
                <SummaryField label="Department" value={approveDc.department} />
                <SummaryField label="Requested By" value={approveDc.requested_by} />
                <SummaryField label="Prepared By" value={approveDc.prepared_by} />
                <SummaryField label="Req. Date" value={fmtDDMMYYYY(approveDc.req_date)} />
                {approveDc.reference_no ? <SummaryField label="Job Reference" value={approveDc.reference_no} /> : null}
                {approveDc.maintenance_type ? <SummaryField label="Maintenance Type" value={approveDc.maintenance_type} /> : null}
                {approveDc.expected_return_date ? <SummaryField label="Expected Return" value={fmtDDMMYYYY(approveDc.expected_return_date)} /> : null}
                {approveDc.remarks ? <SummaryField label="Remarks" value={approveDc.remarks} wide /> : null}
                {approveDc.cancel_remarks ? <SummaryField label="Cancel Remarks" value={approveDc.cancel_remarks} wide /> : null}
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
                  Approving this challan will reduce stock for the listed items.
                </Typography>
              )}
              {cancelMode && (
                <>
                  {approveDc.status === "Approved" && (
                    <Typography variant="caption" sx={{ color: "#dc2626", fontWeight: 600, display: "block", mt: 1.5 }}>
                      Cancelling this approved challan will restore stock for the listed items.
                    </Typography>
                  )}
                  <TextField size="small" fullWidth multiline minRows={2} label="Cancel Remarks" value={cancelRemarks}
                    onChange={(e) => setCancelRemarks(e.target.value)} sx={{ mt: 1.5 }} />
                </>
              )}
            </Box>
          ) : null}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 1.5 }}>
          {!cancelMode ? (
            <>
              <Button onClick={() => (setApproveDc(null), setCancelMode(false), setCancelRemarks(""))} disabled={approveLoading}>Close</Button>
              <Button variant="outlined" color="error" startIcon={<BlockIcon />} onClick={() => setCancelMode(true)} disabled={approveLoading}>Cancel Challan</Button>
              {approveDc?.status === "Draft" && (
                <Button variant="contained" color="primary" startIcon={<SendIcon />} onClick={confirmApprove} disabled={approveLoading || !approveDc}>
                  {approveLoading ? "Approving..." : "Approve"}
                </Button>
              )}
            </>
          ) : (
            <>
              <Button onClick={() => setCancelMode(false)} disabled={approveLoading}>Back</Button>
              <Button variant="contained" color="error" startIcon={<BlockIcon />} onClick={confirmCancel} disabled={approveLoading || !approveDc}>
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
