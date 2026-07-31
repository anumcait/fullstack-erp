import React, { useEffect, useState, useCallback } from "react";
import {
  Box, Card, CardContent, Typography, TextField, Button, Chip, LinearProgress,
  Table, TableHead, TableRow, TableCell, TableBody, TableContainer,
  MenuItem, Tabs, Tab, Tooltip, TablePagination, Dialog, DialogTitle,
  DialogContent, DialogActions,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import SearchIcon from "@mui/icons-material/Search";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../../../context/ToastContext";

const API = "/api/erp/stores/delivery-challans";

const typeTabs = [
  { label: "Replacement", code: "L" },
  { label: "Repair", code: "R" },
  { label: "Maintenance", code: "M" },
  { label: "Jobwork", code: "J" },
  { label: "Sale on Approval", code: "S" },
];
const statusColor = { Draft: "default", Issued: "primary", Returned: "success", Cancelled: "error", Billed: "success" };

export default function DcBillingList() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [typeTab, setTypeTab] = useState(0);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const [billDc, setBillDc] = useState(null);
  const [billNo, setBillNo] = useState("");

  const years = [];
  const cy = new Date().getFullYear();
  for (let y = cy; y >= cy - 5; y--) years.push(String(y));

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = { year };
      if (search) params.search = search;
      params.dc_type = typeTabs[typeTab].code;
      const { data } = await axios.get(API, { params });
      setRows(data);
    } catch {
      showToast("Failed to load DC billing data", "error");
    } finally {
      setLoading(false);
    }
  }, [typeTab, search, year]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filtered = rows;
  const totalCount = filtered.length;
  const pagedRows = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const handleBill = async () => {
    if (!billDc || !billNo.trim()) return;
    try {
      await axios.post(`${API}/bill`, { ids: [billDc.id], bill_no: billNo.trim(), bill_date: new Date().toISOString().split("T")[0] });
      showToast(`DC ${billDc.dc_no} billed successfully`, "success");
      setBillDc(null);
      setBillNo("");
      fetchData();
    } catch (e) {
      showToast(e.response?.data?.error || "Failed to bill DC", "error");
    }
  };

  const thSx = {
    fontWeight: 700, fontSize: "0.82rem", py: 0.55, px: 0.7, color: "#1e293b",
    border: "1px solid #94a3b8", position: "sticky", top: 0, zIndex: 2,
    bgcolor: "#e2e8f0", whiteSpace: "nowrap",
  };

  const tdSx = {
    fontSize: "0.82rem", py: 0.4, px: 0.6, border: "1px solid #e2e8f0",
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2, flexWrap: "wrap", gap: 1 }}>
        <Typography variant="h4" sx={{ fontWeight: "bold", color: "var(--heading-color)" }}>
          Sale On Approval
        </Typography>
        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={fetchData}>Refresh</Button>
        </Box>
      </Box>

      <Box sx={{ mb: 2 }}>
        <Tabs value={typeTab} onChange={(_, v) => { setTypeTab(v); setPage(0); }} variant="scrollable" scrollButtons="auto"
          sx={{ "& .MuiTab-root": { fontWeight: 700, fontSize: "0.85rem", textTransform: "none", minHeight: 40 },
            "& .Mui-selected": { color: "#1565c0" }, "& .MuiTabs-indicator": { backgroundColor: "#1565c0", height: 3 } }}>
          {typeTabs.map((t, i) => (
            <Tab key={t.code} label={<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              {t.label}<Chip label={t.code} size="small" color="primary" variant="outlined" sx={{ height: 18, fontSize: "0.65rem", fontWeight: 700 }} />
            </Box>} />
          ))}
        </Tabs>
      </Box>

      <Card sx={{ borderRadius: 3, mb: 2, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
        <CardContent sx={{ py: 1.5, "&:last-child": { pb: 1.5 } }}>
          <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", alignItems: "center" }}>
            <TextField size="small" label="Year" select value={year} onChange={(e) => setYear(e.target.value)} sx={{ width: 100 }}>
              {years.map((y) => <MenuItem key={y} value={y}>{y}</MenuItem>)}
            </TextField>
            <TextField size="small" label="DC # / Party" value={search}
              onChange={(e) => setSearch(e.target.value)} sx={{ width: 200 }} />
            <Button variant="outlined" startIcon={<SearchIcon />} onClick={fetchData} sx={{ height: 40 }}>Show Report</Button>
          </Box>
        </CardContent>
      </Card>

      <Card sx={{ borderRadius: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
        <CardContent sx={{ p: { xs: 1.5, md: 2 } }}>
          {loading && <LinearProgress sx={{ mb: 1 }} />}
          {!loading && totalCount === 0 && (
            <Typography sx={{ textAlign: "center", py: 6, color: "#94a3b8", fontStyle: "italic" }}>
              No records found.
            </Typography>
          )}
          {totalCount > 0 && (
            <>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.5, px: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: "#475569" }}>
                  <Box component="span" sx={{ color: "#1565c0", fontWeight: 700 }}>{totalCount}</Box> record{totalCount !== 1 ? "s" : ""}
                </Typography>
                <Typography variant="body2" sx={{ color: "#64748b", fontWeight: 600 }}>
                  Page {page + 1} ({page * rowsPerPage + 1}–{Math.min((page + 1) * rowsPerPage, totalCount)} of {totalCount})
                </Typography>
              </Box>
              <TableContainer sx={{ maxHeight: 560, overflow: "auto" }}>
                <Table size="small" stickyHeader
                  sx={{ minWidth: 1200, borderCollapse: "separate", borderSpacing: 0 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ ...thSx, width: 90, textAlign: "center" }}>Action</TableCell>
                      <TableCell sx={{ ...thSx, width: 30, textAlign: "center" }}>Sl#</TableCell>
                      <TableCell sx={{ ...thSx, width: 100, textAlign: "center" }}>DC #</TableCell>
                      <TableCell sx={{ ...thSx, width: 95, textAlign: "center" }}>DC Date</TableCell>
                      <TableCell sx={{ ...thSx, width: 160 }}>Party Name</TableCell>
                      <TableCell sx={{ ...thSx, width: 100, textAlign: "center" }}>DC Type</TableCell>
                      <TableCell sx={{ ...thSx, width: 80, textAlign: "center" }}>Status</TableCell>
                      <TableCell sx={{ ...thSx, width: 100, textAlign: "center" }}>Requested By</TableCell>
                      <TableCell sx={{ ...thSx, width: 95, textAlign: "center" }}>Req. Date</TableCell>
                      <TableCell sx={{ ...thSx, width: 85, textAlign: "center" }}>Bill No</TableCell>
                      <TableCell sx={{ ...thSx, width: 90, textAlign: "center" }}>Bill Date</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {pagedRows.map((r, idx) => (
                      <TableRow key={r.id} hover
                        sx={{ bgcolor: idx % 2 === 0 ? "#ffffff" : "#f1f5f9", "&:hover": { bgcolor: "#dbeafe" } }}>
                        <TableCell sx={{ ...tdSx, textAlign: "center" }}>
                          {r.bill_no ? (
                            <Chip label="Billed" size="small" color="success" sx={{ fontSize: "0.7rem", height: 24, fontWeight: 600 }} />
                          ) : (
                            <Button variant="contained" size="small" color="primary"
                              onClick={() => { setBillDc(r); setBillNo(""); }}
                              sx={{ fontSize: "0.7rem", textTransform: "none", py: 0.2, px: 1.5, minWidth: 0, fontWeight: 600 }}>
                              Create Billing
                            </Button>
                          )}
                        </TableCell>
                        <TableCell sx={{ ...tdSx, textAlign: "center", fontWeight: 600, color: "#64748b" }}>{idx + 1}</TableCell>
                        <TableCell sx={{ ...tdSx, textAlign: "center", fontWeight: 600, color: "#1565c0" }}>{r.dc_no}</TableCell>
                        <TableCell sx={{ ...tdSx, textAlign: "center" }}>{r.dc_date || "-"}</TableCell>
                        <TableCell sx={{ ...tdSx, fontWeight: 600, maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          <Tooltip title={r.party_name || "-"}><span>{r.party_name || "-"}</span></Tooltip>
                        </TableCell>
                        <TableCell sx={{ ...tdSx, textAlign: "center", fontWeight: 600 }}>
                          {({ L: "Replacement", R: "Repair", M: "Maintenance", J: "Jobwork", S: "Sale on Approval" })[r.dc_type] || r.dc_type || "Sale on Approval"}
                        </TableCell>
                        <TableCell sx={{ ...tdSx, textAlign: "center" }}>
                          <Chip size="small" label={r.status} color={statusColor[r.status] || "default"} sx={{ fontSize: "0.7rem", height: 22, fontWeight: 600 }} />
                        </TableCell>
                        <TableCell sx={{ ...tdSx, textAlign: "center" }}>{r.requested_by || "-"}</TableCell>
                        <TableCell sx={{ ...tdSx, textAlign: "center" }}>{r.req_date || "-"}</TableCell>
                        <TableCell sx={{ ...tdSx, textAlign: "center", fontWeight: 600, color: r.bill_no ? "#2e7d32" : "#94a3b8" }}>
                          {r.bill_no || "-"}
                        </TableCell>
                        <TableCell sx={{ ...tdSx, textAlign: "center" }}>{r.bill_date || "-"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination component="div" count={totalCount} page={page}
                onPageChange={(_, p) => setPage(p)} rowsPerPage={rowsPerPage}
                onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
                rowsPerPageOptions={[25, 50, 100]}
                sx={{ "& .MuiTablePagination-toolbar": { minHeight: 36 } }} />
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!billDc} onClose={() => setBillDc(null)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, fontSize: "1rem" }}>Create Billing for {billDc?.dc_no}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
            <TextField size="small" label="Party" value={billDc?.party_name || ""} InputProps={{ readOnly: true }} />
            <TextField size="small" label="DC Type" value={({ L: "Replacement", R: "Repair", M: "Maintenance", J: "Jobwork", S: "Sale on Approval" })[billDc?.dc_type] || billDc?.dc_type || "Sale on Approval"} InputProps={{ readOnly: true }} />
            <TextField size="small" label="Bill Number" value={billNo} onChange={(e) => setBillNo(e.target.value)} autoFocus
              helperText="Enter the sale bill/invoice number" />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBillDc(null)}>Cancel</Button>
          <Button variant="contained" onClick={handleBill} disabled={!billNo.trim()}>Save Bill</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
