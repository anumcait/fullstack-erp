import React, { useEffect, useState, useCallback } from "react";
import {
  Box, Card, CardContent, Typography, TextField, Button, Chip, LinearProgress,
  Table, TableHead, TableRow, TableCell, TableBody, TableContainer, IconButton,
  MenuItem, Tabs, Tab, Tooltip, TablePagination,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import SearchIcon from "@mui/icons-material/Search";
import UnfoldMoreIcon from "@mui/icons-material/UnfoldMore";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../../../context/ToastContext";
import { formatNumber, formatQty } from "../../../../utils/format";

const GRR_API = "/api/erp/stores/grn";

export default function BillingList() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [tab, setTab] = useState(0); // 0 = Outstanding, 1 = Completed
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [search, setSearch] = useState("");
  const [partyFilter, setPartyFilter] = useState("");
  const [prFilter, setPrFilter] = useState("");
  const today = new Date();
  const oneMonthAgo = new Date(today);
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
  const fmtDateInput = (d) => d.toISOString().split("T")[0];
  const [dateFrom, setDateFrom] = useState(fmtDateInput(oneMonthAgo));
  const [dateTo, setDateTo] = useState(fmtDateInput(today));
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const [sortConfig, setSortConfig] = useState({ key: "grn_no", dir: "asc" });
  const [globalSearch, setGlobalSearch] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (dateFrom) params.date_from = dateFrom;
      if (dateTo) params.date_to = dateTo;
      if (search) params.search = search;
      // For Outstanding tab, get GRRs pending billing
      // For Completed tab, get all GRRs with bill_no set
      if (tab === 0) {
        // Pending billing = Received + no bill_no
        const { data } = await axios.get(GRR_API, {
          params: { ...params, status: "Received" },
        });
        // Filter to only pending (no bill_no)
        const pending = data.filter((g) => !g.bill_no);
        setRows(pending);
      } else {
        // Completed = Received + has bill_no
        const { data } = await axios.get(GRR_API, {
          params: { ...params, status: "Received" },
        });
        const completed = data.filter((g) => !!g.bill_no);
        setRows(completed);
      }
    } catch {
      showToast("Failed to load GRR billing data", "error");
    } finally {
      setLoading(false);
    }
  }, [tab, dateFrom, dateTo, search]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Flatten GRRs into item-level rows for the table
  const flatRows = [];
  rows.forEach((grn) => {
    const items = grn.items || [];
    const supplier = grn.supplier;
    const po = grn.purchaseOrder;
    const pr = grn.purchaseRequisition;
    if (items.length === 0) {
      flatRows.push({
        grn,
        grnId: grn.id,
        grn_no: grn.grn_no,
        grn_date: grn.grn_date,
        grs_no: grn.gate_entry_no || "",
        pr_no: pr?.req_no || grn.pr_no || "",
        pr_date: pr?.req_date || "",
        pty_name: supplier?.supplier_name || "",
        pty_dc: grn.invoice_no || "",
        dc_date: grn.invoice_date || "",
        po_no: po?.po_no || grn.po_no || "",
        po_date: po?.po_date || "",
        wop: grn.ir_type || "GRR",
        item_code: "",
        item_name: "",
        qty: 0,
        city: "",
        kg: 0,
        kg_accp: 0,
        recv_qty: 0,
        recv_kg: 0,
        supp_qty: 0,
        received_by: grn.received_by || "",
        bill_no: grn.bill_no || "",
        bill_date: grn.bill_date || "",
        displayStatus: grn.bill_no ? "Billed" : "Outstanding",
        item: null,
      });
    } else {
      items.forEach((it) => {
        flatRows.push({
          grn,
          grnId: grn.id,
          grn_no: grn.grn_no,
          grn_date: grn.grn_date,
          grs_no: grn.gate_entry_no || "",
          pr_no: it.pr_no || pr?.req_no || grn.pr_no || "",
          pr_date: pr?.req_date || "",
          pty_name: supplier?.supplier_name || "",
          pty_dc: grn.invoice_no || "",
          dc_date: grn.invoice_date || "",
          po_no: it.po_no || po?.po_no || grn.po_no || "",
          po_date: po?.po_date || "",
          wop: grn.dept_cd === "PRODUCTION" ? "PROD" : grn.dept_cd === "EDP" ? "EDP" : (grn.ir_type || "GRR"),
          item_code: it.item_code || "",
          item_name: it.item_name || "",
          qty: Number(it.accepted_qty || 0),
          city: "",
          kg: Number(it.kg || 0),
          kg_accp: Number(it.accp || it.kg || 0),
          recv_qty: Number(it.received_qty || 0),
          recv_kg: Number(it.recv_kg || 0),
          supp_qty: Number(it.supp_qty || 0),
          received_by: grn.received_by || "",
          bill_no: grn.bill_no || "",
          bill_date: grn.bill_date || "",
          displayStatus: grn.bill_no ? "Billed" : "Outstanding",
          item: it,
        });
      });
    }
  });

  // Sort
  flatRows.sort((a, b) => {
    const dir = sortConfig.dir === "asc" ? 1 : -1;
    let va = a[sortConfig.key], vb = b[sortConfig.key];
    if (typeof va === "string") return dir * va.localeCompare(vb || "", undefined, { numeric: true });
    return dir * ((va || 0) - (vb || 0));
  });

  const handleSort = (key) => {
    setSortConfig((prev) => ({ key, dir: prev.key === key && prev.dir === "asc" ? "desc" : "asc" }));
  };

  const sortIcon = (key) => {
    if (sortConfig.key !== key) return React.createElement(UnfoldMoreIcon, { sx: { fontSize: 12, ml: 0.3, opacity: 0.4, verticalAlign: "middle" } });
    return sortConfig.dir === "asc"
      ? React.createElement(ArrowUpwardIcon, { sx: { fontSize: 12, ml: 0.3, verticalAlign: "middle", color: "#1565c0" } })
      : React.createElement(ArrowDownwardIcon, { sx: { fontSize: 12, ml: 0.3, verticalAlign: "middle", color: "#1565c0" } });
  };

  // Apply client-side filters
  let filtered = flatRows;
  if (globalSearch) {
    const q = globalSearch.toLowerCase();
    filtered = filtered.filter((r) =>
      [r.grn_no, r.pr_no, r.pty_name, r.pty_dc, r.po_no, r.item_code, r.item_name, r.received_by, r.bill_no]
        .some((v) => (v || "").toLowerCase().includes(q))
    );
  }
  if (partyFilter) {
    filtered = filtered.filter((r) =>
      r.pty_name.toLowerCase().includes(partyFilter.toLowerCase())
    );
  }
  if (prFilter) {
    filtered = filtered.filter((r) =>
      r.pr_no.toLowerCase().includes(prFilter.toLowerCase())
    );
  }

  const totalCount = filtered.length;
  const pagedRows = filtered.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const pad2 = (n) => String(n).padStart(2, "0");
  const fmtDateTime = (v) => {
    if (!v) return "-";
    const d = new Date(v);
    if (isNaN(d.getTime())) return String(v).split("T")[0];
    const dd = pad2(d.getDate());
    const mm = pad2(d.getMonth() + 1);
    const yy = String(d.getFullYear()).slice(-2);
    const hh = d.getHours();
    const h12 = hh % 12 || 12;
    const ampm = hh < 12 ? "AM" : "PM";
    const dateStr = dd + "-" + mm + "-" + yy;
    const timeStr = pad2(h12) + ":" + pad2(d.getMinutes()) + " " + ampm;
    return React.createElement(React.Fragment, null, dateStr, React.createElement("br"), timeStr);
  };

  const fmtDate = (v) => {
    if (!v) return "-";
    const d = new Date(v);
    return isNaN(d.getTime()) ? String(v).split("T")[0] : d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  };

  const uniqueParties = [...new Set(flatRows.map((r) => r.pty_name).filter(Boolean))];

  const thSx = {
    fontWeight: 700,
    fontSize: "0.82rem",
    py: 0.55,
    px: 0.7,
    color: "#1e293b",
    border: "1px solid #94a3b8",
    position: "sticky",
    top: 0,
    zIndex: 2,
    bgcolor: "#e2e8f0",
    whiteSpace: "nowrap",
  };

  const tdSx = {
    fontSize: "0.82rem",
    py: 0.4,
    px: 0.6,
    border: "1px solid #e2e8f0",
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
          flexWrap: "wrap",
          gap: 1,
        }}
      >
        <Typography
          variant="h4"
          sx={{ fontWeight: "bold", color: "var(--heading-color)" }}
        >
          GRR Billing Details
        </Typography>
        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={fetchData}>Refresh</Button>
        </Box>
      </Box>

      {/* Tabs */}
      <Box sx={{ mb: 2 }}>
        <Tabs
          value={tab}
          onChange={(_, v) => {
            setTab(v);
            setPage(0);
          }}
          sx={{
            "& .MuiTab-root": {
              fontWeight: 700,
              fontSize: "0.85rem",
              textTransform: "none",
              minHeight: 40,
            },
            "& .Mui-selected": { color: "#1565c0" },
            "& .MuiTabs-indicator": { backgroundColor: "#1565c0", height: 3 },
          }}
        >
          <Tab
            label={
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                GRR Billing : Outstanding
                {tab === 0 && rows.length > 0 && (
                  <Chip
                    label={rows.length}
                    size="small"
                    color="warning"
                    sx={{ height: 20, fontSize: "0.72rem" }}
                  />
                )}
              </Box>
            }
          />
          <Tab
            label={
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                GRR Billing : Completed
                {tab === 1 && rows.length > 0 && (
                  <Chip
                    label={rows.length}
                    size="small"
                    color="success"
                    sx={{ height: 20, fontSize: "0.72rem" }}
                  />
                )}
              </Box>
            }
          />
        </Tabs>
      </Box>

      {/* Filters */}
      <Card
        sx={{
          borderRadius: 3,
          mb: 2,
          boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
        }}
      >
        <CardContent sx={{ py: 1.5, "&:last-child": { pb: 1.5 } }}>
          <Box
            sx={{
              display: "flex",
              gap: 1.5,
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <TextField
              size="small"
              label="Start Date(DD-MON-YY)"
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ width: 170 }}
            />
            <TextField
              size="small"
              label="End Date(DD-MON-YY)"
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ width: 170 }}
            />
            <TextField
              size="small"
              label="GRR #"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchData()}
              sx={{ width: 130 }}
            />
            <TextField size="small" label="Search all columns" value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)} sx={{ width: 180 }}
              InputProps={{ startAdornment: React.createElement(SearchIcon, { sx: { fontSize: 18, mr: 0.5, color: "#94a3b8" } }) }} />
            <TextField
              size="small"
              select
              label="Select Party"
              value={partyFilter}
              onChange={(e) => setPartyFilter(e.target.value)}
              sx={{ minWidth: 180 }}
            >
              <MenuItem value="">All Parties</MenuItem>
              {uniqueParties.map((p) => (
                <MenuItem key={p} value={p}>
                  {p}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              size="small"
              label="PR.#"
              value={prFilter}
              onChange={(e) => setPrFilter(e.target.value)}
              sx={{ width: 100 }}
            />
            <Button
              variant="outlined"
              startIcon={<SearchIcon />}
              onClick={fetchData}
              sx={{ height: 40 }}
            >
              Go
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card
        sx={{
          borderRadius: 3,
          boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
        }}
      >
        <CardContent sx={{ p: { xs: 1.5, md: 2 } }}>
          {loading && <LinearProgress sx={{ mb: 1 }} />}
          {!loading && filtered.length === 0 && (
            <Typography
              sx={{
                textAlign: "center",
                py: 6,
                color: "#94a3b8",
                fontStyle: "italic",
              }}
            >
              {tab === 0
                ? "No pending GRRs for billing."
                : "No completed billing records found."}
            </Typography>
          )}
          {filtered.length > 0 && (
            <>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.5, px: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: "#475569" }}>
                  {tab === 0 ? "Pending GRRs awaiting billing" : "Billed GRRs"} — <Box component="span" sx={{ color: "#1565c0", fontWeight: 700 }}>{totalCount}</Box> record{totalCount !== 1 ? "s" : ""}
                </Typography>
                <Typography variant="body2" sx={{ color: "#64748b", fontWeight: 600 }}>
                  Page {page + 1} ({page * rowsPerPage + 1}–{Math.min((page + 1) * rowsPerPage, totalCount)} of {totalCount})
                </Typography>
              </Box>
              <TableContainer sx={{ maxHeight: 560, overflow: "auto" }}>
                <Table
                  size="small"
                  stickyHeader
                  sx={{
                    minWidth: 1500,
                    borderCollapse: "separate",
                    borderSpacing: 0,
                  }}
                >
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ ...thSx, width: 90 }}>Action</TableCell>
                      <TableCell sx={{ ...thSx, width: 30 }}>Sl#</TableCell>
                      <TableCell sx={{ ...thSx, width: 85, cursor: "pointer" }} onClick={() => handleSort("grn_no")}>
                        GRR #{sortIcon("grn_no")}
                      </TableCell>
                      <TableCell sx={{ ...thSx, width: 105, cursor: "pointer" }} onClick={() => handleSort("grn_date")}>
                        GRR Date{sortIcon("grn_date")}
                      </TableCell>
                      <TableCell sx={{ ...thSx, width: 75, cursor: "pointer" }} onClick={() => handleSort("pr_no")}>
                        PR #{sortIcon("pr_no")}
                      </TableCell>
                      <TableCell sx={{ ...thSx, width: 105, cursor: "pointer" }} onClick={() => handleSort("pr_date")}>
                        PR Date{sortIcon("pr_date")}
                      </TableCell>
                      <TableCell sx={{ ...thSx, width: 160, cursor: "pointer" }} onClick={() => handleSort("pty_name")}>
                        Pty Name{sortIcon("pty_name")}
                      </TableCell>
                      <TableCell sx={{ ...thSx, width: 80 }}>Pty DC #</TableCell>
                      <TableCell sx={{ ...thSx, width: 90 }}>DC Date</TableCell>
                      <TableCell sx={{ ...thSx, width: 85, cursor: "pointer" }} onClick={() => handleSort("po_no")}>
                        Po No{sortIcon("po_no")}
                      </TableCell>
                      <TableCell sx={{ ...thSx, width: 105 }}>PO Date</TableCell>
                      <TableCell sx={{ ...thSx, width: 55, textAlign: "center" }}>W.O.#</TableCell>
                      <TableCell sx={{ ...thSx, width: 85, cursor: "pointer" }} onClick={() => handleSort("item_code")}>
                        Item Code{sortIcon("item_code")}
                      </TableCell>
                      <TableCell sx={{ ...thSx, cursor: "pointer" }} onClick={() => handleSort("item_name")}>
                        Item Description{sortIcon("item_name")}
                      </TableCell>
                      <TableCell sx={{ ...thSx, width: 65, textAlign: "right", cursor: "pointer" }} onClick={() => handleSort("qty")}>
                        Qty<br />Accp{sortIcon("qty")}
                      </TableCell>
                      <TableCell sx={{ ...thSx, width: 65, textAlign: "right" }}>Qty<br />Supp</TableCell>
                      <TableCell sx={{ ...thSx, width: 65, textAlign: "right" }}>Qty<br />Rec</TableCell>
                      <TableCell sx={{ ...thSx, width: 65, textAlign: "right" }}>Kg<br />Rec</TableCell>
                      <TableCell sx={{ ...thSx, width: 65, textAlign: "right" }}>Kg<br />Accp</TableCell>
                      <TableCell sx={{ ...thSx, width: 90, cursor: "pointer" }} onClick={() => handleSort("received_by")}>
                        Recvd By{sortIcon("received_by")}
                      </TableCell>
                      {tab === 1 && (
                        <>
                          <TableCell sx={{ ...thSx, width: 85, cursor: "pointer" }} onClick={() => handleSort("bill_no")}>
                            Bill No{sortIcon("bill_no")}
                          </TableCell>
                          <TableCell sx={{ ...thSx, width: 90 }}>Bill Date</TableCell>
                        </>
                      )}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {pagedRows.map((r, idx) => (
                      <TableRow
                        key={`${r.grnId}-${r.item?.id || idx}`}
                        hover
                        sx={{
                          bgcolor: idx % 2 === 0 ? "#ffffff" : "#f1f5f9",
                          "&:hover": { bgcolor: "#dbeafe", cursor: "pointer" },
                        }}

                      >
                        <TableCell sx={{ ...tdSx, textAlign: "center" }}>
                          {r.bill_no ? (
                            <Chip label="Billed" size="small" color="success" sx={{ fontSize: "0.7rem", height: 24, fontWeight: 600 }} />
                          ) : (
                            <Button variant="contained" size="small" color="primary"
                              onClick={() => navigate("/stores/invoices/add", { state: { grn: r.grn } })}
                              sx={{ fontSize: "0.7rem", textTransform: "none", py: 0.2, px: 1.5, minWidth: 0, fontWeight: 600 }}>
                              Create Billing
                            </Button>
                          )}
                        </TableCell>
                        <TableCell sx={{ ...tdSx, textAlign: "center", fontWeight: 600, color: "#64748b" }}>{idx + 1}</TableCell>
                        <TableCell sx={{ ...tdSx, textAlign: "center", fontWeight: 600, color: "#1565c0" }}>{r.grn_no}</TableCell>
                        <TableCell sx={{ ...tdSx, textAlign: "center" }}>{fmtDateTime(r.grn_date)}</TableCell>
                        <TableCell sx={{ ...tdSx, textAlign: "center", fontWeight: 600, color: r.pr_no ? "#7c3aed" : "#94a3b8" }}>{r.pr_no || "-"}</TableCell>
                        <TableCell sx={{ ...tdSx, textAlign: "center" }}>{fmtDateTime(r.pr_date)}</TableCell>
                        <TableCell sx={{ ...tdSx, fontWeight: 600, maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          <Tooltip title={r.pty_name || "-"}><span>{r.pty_name || "-"}</span></Tooltip>
                        </TableCell>
                        <TableCell sx={{ ...tdSx, textAlign: "center" }}>{r.pty_dc || "-"}</TableCell>
                        <TableCell sx={{ ...tdSx, textAlign: "center" }}>{fmtDate(r.dc_date)}</TableCell>
                        <TableCell sx={{ ...tdSx, textAlign: "center", fontWeight: 600, color: r.po_no ? "#1565c0" : "#94a3b8" }}>{r.po_no || "-"}</TableCell>
                        <TableCell sx={{ ...tdSx, textAlign: "center" }}>{fmtDateTime(r.po_date)}</TableCell>
                        <TableCell sx={{ ...tdSx, textAlign: "center", fontWeight: 600, color: r.wop === "PROD" ? "#2e7d32" : r.wop === "EDP" ? "#e65100" : "#1565c0" }}>
                          {r.wop}
                        </TableCell>
                        <TableCell sx={{ ...tdSx, fontWeight: 600 }}>{r.item_code || "-"}</TableCell>
                        <TableCell sx={{ ...tdSx, maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          <Tooltip title={r.item_name || "-"}><span>{r.item_name || "-"}</span></Tooltip>
                        </TableCell>
                        <TableCell sx={{ ...tdSx, textAlign: "center", fontWeight: 600 }}>{r.qty > 0 ? formatQty(r.qty) : "-"}</TableCell>
                        <TableCell sx={{ ...tdSx, textAlign: "center" }}>{r.supp_qty > 0 ? formatQty(r.supp_qty) : "-"}</TableCell>
                        <TableCell sx={{ ...tdSx, textAlign: "center" }}>{r.recv_qty > 0 ? formatQty(r.recv_qty) : "-"}</TableCell>
                        <TableCell sx={{ ...tdSx, textAlign: "center" }}>{r.recv_kg > 0 ? formatNumber(r.recv_kg, 3) : "-"}</TableCell>
                        <TableCell sx={{ ...tdSx, textAlign: "center", fontWeight: 600, color: "success.dark" }}>
                          {r.kg_accp > 0 ? formatNumber(r.kg_accp, 3) : "-"}
                        </TableCell>
                        <TableCell sx={{ ...tdSx, textAlign: "center" }}>{r.received_by || "-"}</TableCell>
                        {tab === 1 && (
                          <>
                            <TableCell sx={{ ...tdSx, textAlign: "center", fontWeight: 600, color: "#2e7d32" }}>{r.bill_no || "-"}</TableCell>
                            <TableCell sx={{ ...tdSx, textAlign: "center" }}>{fmtDate(r.bill_date)}</TableCell>
                          </>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                component="div"
                count={totalCount}
                page={page}
                onPageChange={(_, p) => setPage(p)}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={(e) => {
                  setRowsPerPage(parseInt(e.target.value, 10));
                  setPage(0);
                }}
                rowsPerPageOptions={[25, 50, 100]}
                sx={{ "& .MuiTablePagination-toolbar": { minHeight: 36 } }}
              />
            </>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
