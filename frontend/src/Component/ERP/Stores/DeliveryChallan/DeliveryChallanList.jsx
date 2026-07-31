import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  Box, Typography, Card, CardContent, TextField, Button, Chip, LinearProgress,
  Table, TableHead, TableRow, TableCell, TableBody, TableContainer, IconButton,
  Tooltip, TablePagination, Tabs, Tab, alpha,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import AddIcon from "@mui/icons-material/Add";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import SendIcon from "@mui/icons-material/Send";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import UnfoldMoreIcon from "@mui/icons-material/UnfoldMore";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import InventoryIcon from "@mui/icons-material/Inventory";
import SendOutlinedIcon from "@mui/icons-material/SendOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../../../context/ToastContext";

const API = "/api/erp/stores/delivery-challans";

const statusColor = { Draft: "default", Issued: "primary", Returned: "success", Cancelled: "error", Billed: "success" };
const statusBg = { Draft: "#f1f5f9", Issued: "#eef2ff", Returned: "#e8f5e9", Cancelled: "#fef2f2", Billed: "#e8f5e9" };
const typeLabels = { L: "Replacement", R: "Repair", M: "Maintenance", J: "Jobwork", S: "Sale on Approval" };
const typeColors = { L: "#f97316", R: "#8b5cf6", M: "#06b6d4", J: "#f59e0b", S: "#1565c0" };

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
    issued: rows.filter((r) => r.status === "Issued").length,
    billed: rows.filter((r) => r.status === "Billed").length,
    returned: rows.filter((r) => r.status === "Returned").length,
  }), [rows]);

  const issue = async (id) => {
    if (!window.confirm("Issue this challan? Stock will be reduced.")) return;
    try { await axios.post(`${API}/${id}/issue`); showToast("Issued", "success"); fetchData(); }
    catch (e) { showToast(e.response?.data?.error || "Failed", "error"); }
  };
  const remove = async (id) => {
    if (!window.confirm("Delete this challan?")) return;
    try { await axios.delete(`${API}/${id}`); showToast("Deleted", "success"); fetchData(); }
    catch (e) { showToast(e.response?.data?.error || "Failed", "error"); }
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

  const thSx = { fontWeight: 700, fontSize: "0.78rem", color: "#1e293b", border: "1px solid #cbd5e1", position: "sticky", top: 0, zIndex: 2, bgcolor: "#e8edf4", whiteSpace: "nowrap", py: 0.6, px: 0.7, lineHeight: 1.2 };
  const tdSx = { fontSize: "0.8rem", py: 0.4, px: 0.6, border: "1px solid #e2e8f0" };
  const activeTypeColor = typeColors[typeTabs[dcTypeTab]?.code] || "#1565c0";

  return (
    <Box sx={{ p: 3, bgcolor: "#f8fafc", minHeight: "100vh" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2.5, flexWrap: "wrap", gap: 1.5 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box sx={{ width: 40, height: 40, borderRadius: 2.5, bgcolor: alpha(activeTypeColor, 0.1), display: "flex", alignItems: "center", justifyContent: "center" }}>
            <DescriptionOutlinedIcon sx={{ fontSize: 24, color: activeTypeColor }} />
          </Box>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, color: "#0f172a", letterSpacing: "-0.3px", lineHeight: 1.2 }}>Delivery Challans</Typography>
            <Typography variant="caption" sx={{ color: "#94a3b8", fontWeight: 500 }}>{typeTabs[dcTypeTab].label} · {totalCount} records</Typography>
          </Box>
        </Box>
        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
          <Button variant="contained" startIcon={<AddIcon />}
            onClick={() => navigate("/stores/delivery-challans/prepare/" + typeTabs[dcTypeTab].code)}
            sx={{ borderRadius: 2, textTransform: "none", fontWeight: 700, px: 2.5, bgcolor: activeTypeColor, "&:hover": { bgcolor: alpha(activeTypeColor, 0.85) }, boxShadow: `0 4px 14px ${alpha(activeTypeColor, 0.25)}` }}>
            {typeTabs[dcTypeTab].label}
          </Button>
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={fetchData} sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600, borderColor: "#cbd5e1", color: "#475569", minWidth: 40 }} />
        </Box>
      </Box>

      <Box sx={{ display: "flex", gap: 1.5, mb: 2.5, flexWrap: "wrap" }}>
        {[
          { label: "Total", value: stats.total, icon: ArticleOutlinedIcon, color: "#1e293b", bg: "#f1f5f9" },
          { label: "Draft", value: stats.draft, icon: DescriptionOutlinedIcon, color: "#64748b", bg: "#f1f5f9" },
          { label: "Issued", value: stats.issued, icon: SendOutlinedIcon, color: "#1565c0", bg: "#eef2ff" },
          { label: "Billed", value: stats.billed, icon: CheckCircleOutlineIcon, color: "#2e7d32", bg: "#e8f5e9" },
          { label: "Returned", value: stats.returned, icon: InventoryIcon, color: "#2e7d32", bg: "#e8f5e9" },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <Box key={s.label} sx={{ px: 2, py: 1.2, borderRadius: 2.5, bgcolor: s.bg, minWidth: 90, textAlign: "center", border: `1px solid ${alpha(s.color, 0.08)}`, transition: "transform 0.15s, box-shadow 0.15s", "&:hover": { transform: "translateY(-1px)", boxShadow: `0 4px 12px ${alpha(s.color, 0.12)}` } }}>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0.5 }}>
                <Icon sx={{ fontSize: 14, color: alpha(s.color, 0.6) }} />
                <Typography sx={{ fontSize: "1.15rem", fontWeight: 800, color: s.color, lineHeight: 1.2 }}>{s.value}</Typography>
              </Box>
              <Typography sx={{ fontSize: "0.62rem", color: alpha(s.color, 0.7), fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.8px", mt: 0.2 }}>{s.label}</Typography>
            </Box>
          );
        })}
      </Box>

      <Card sx={{ borderRadius: 2.5, mb: 2, boxShadow: "0 1px 8px rgba(0,0,0,0.06)", border: "1px solid #e8edf4" }}>
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
              {["", "Draft", "Issued", "Billed", "Returned", "Cancelled"].map((s) => (
                <Chip key={s || "all"} label={s || "All"} size="small"
                  variant={status === s ? "filled" : "outlined"}
                  color={status === s ? (statusColor[s] || "default") : "default"}
                  onClick={() => { setStatus(s); setPage(0); }}
                  sx={{ fontWeight: 600, cursor: "pointer", borderRadius: 1.5, fontSize: "0.65rem", "&:hover": { opacity: 0.8 } }} />
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
              <Box sx={{ px: 0.7, py: 0.1, borderRadius: 1, fontSize: "0.6rem", fontWeight: 700, bgcolor: dcTypeTab === i ? alpha(typeColors[t.code], 0.12) : "#f1f5f9", color: dcTypeTab === i ? typeColors[t.code] : "#64748b" }}>{t.code}</Box>
            </Box>} />
          ))}
        </Tabs>
      </Box>

      <Card sx={{ borderRadius: 2.5, boxShadow: "0 1px 8px rgba(0,0,0,0.06)", border: "1px solid #e8edf4", overflow: "hidden" }}>
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
                onClick={() => navigate("/stores/delivery-challans/prepare/" + typeTabs[dcTypeTab].code)}>Create {typeTabs[dcTypeTab].label}</Button>
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
                      <TableRow key={r.id} hover
                        onDoubleClick={() => navigate(`/stores/delivery-challans/view/${r.id}`)}
                        sx={{ bgcolor: idx % 2 === 0 ? "#fff" : alpha("#f8fafc", 0.7), "&:hover": { bgcolor: alpha(activeTypeColor, 0.04) }, transition: "background 0.12s", cursor: "pointer" }}>
                        <TableCell sx={{ ...tdSx, textAlign: "center", whiteSpace: "nowrap" }}>
                          <Tooltip title="View"><IconButton size="small" sx={{ p: 0.3, color: "#64748b", "&:hover": { color: activeTypeColor } }} onClick={() => navigate(`/stores/delivery-challans/view/${r.id}`)}><VisibilityIcon sx={{ fontSize: 15 }} /></IconButton></Tooltip>
                          {r.status === "Draft" && (
                            <>
                              <Tooltip title="Edit"><IconButton size="small" sx={{ p: 0.3, color: "#64748b", "&:hover": { color: "#f59e0b" } }} onClick={() => navigate(`/stores/delivery-challans/edit/${r.id}`)}><EditIcon sx={{ fontSize: 15 }} /></IconButton></Tooltip>
                              <Tooltip title="Issue"><IconButton size="small" sx={{ p: 0.3, color: "#64748b", "&:hover": { color: "#1565c0" } }} onClick={() => issue(r.id)}><SendIcon sx={{ fontSize: 15 }} /></IconButton></Tooltip>
                              <Tooltip title="Delete"><IconButton size="small" sx={{ p: 0.3, color: "#64748b", "&:hover": { color: "#dc2626" } }} onClick={() => remove(r.id)}><DeleteIcon sx={{ fontSize: 15 }} /></IconButton></Tooltip>
                            </>
                          )}
                        </TableCell>
                        <TableCell sx={{ ...tdSx, textAlign: "center", fontWeight: 600, color: "#94a3b8", fontSize: "0.72rem" }}>{idx + 1}</TableCell>
                        <TableCell sx={{ ...tdSx, textAlign: "center", fontWeight: 700, color: activeTypeColor, fontFamily: "monospace", fontSize: "0.82rem" }}>{r.dc_no}</TableCell>
                        <TableCell sx={{ ...tdSx, textAlign: "center", whiteSpace: "nowrap", fontSize: "0.78rem" }}>{fmtDateTime(r.dc_date)}</TableCell>
                        <TableCell sx={{ ...tdSx, fontWeight: 600, maxWidth: 170, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: "0.78rem" }}>
                          <Tooltip title={r.party_name || "-"}><span>{r.party_name || "-"}</span></Tooltip>
                        </TableCell>
                        <TableCell sx={{ ...tdSx, textAlign: "center" }}>
                          <Box sx={{ px: 0.8, py: 0.15, borderRadius: 1, fontSize: "0.62rem", fontWeight: 700, display: "inline-block", bgcolor: alpha(typeColors[r.dc_type] || "#94a3b8", 0.1), color: typeColors[r.dc_type] || "#64748b" }}>
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
    </Box>
  );
}
