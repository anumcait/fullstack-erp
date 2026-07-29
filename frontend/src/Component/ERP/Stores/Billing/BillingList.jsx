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
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../../../context/ToastContext";
import { formatNumber } from "../../../../utils/format";

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
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(50);

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
        wop: grn.ir_type || "GRR",
        item_code: "",
        item_name: "",
        qty: 0,
        city: "",
        kg: 0,
        kg_accp: 0,
        recv_qty: 0,
        recv_kg: 0,
        bill_no: grn.bill_no || "",
        bill_date: grn.bill_date || "",
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
          wop: grn.dept_cd === "PRODUCTION" ? "PROD" : grn.dept_cd === "EDP" ? "EDP" : (grn.ir_type || "GRR"),
          item_code: it.item_code || "",
          item_name: it.item_name || "",
          qty: Number(it.accepted_qty || 0),
          city: "",
          kg: Number(it.kg || 0),
          kg_accp: Number(it.accp || it.kg || 0),
          recv_qty: Number(it.received_qty || 0),
          recv_kg: Number(it.recv_kg || 0),
          bill_no: grn.bill_no || "",
          bill_date: grn.bill_date || "",
          item: it,
        });
      });
    }
  });

  // Apply client-side filters
  let filtered = flatRows;
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

  const fmtDate = (v) => {
    if (!v) return "-";
    const d = new Date(v);
    return isNaN(d.getTime())
      ? String(v).split("T")[0]
      : d.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
  };

  const uniqueParties = [...new Set(flatRows.map((r) => r.pty_name).filter(Boolean))];

  const thSx = {
    fontWeight: 700,
    fontSize: "0.72rem",
    py: 0.6,
    px: 0.75,
    color: "#334155",
    borderBottom: "2px solid #e2e8f0",
    position: "sticky",
    top: 0,
    zIndex: 2,
    bgcolor: "#f1f5f9",
    whiteSpace: "nowrap",
  };

  const tdSx = {
    fontSize: "0.76rem",
    py: 0.45,
    px: 0.75,
    borderBottom: "1px solid #f1f5f9",
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
          <Button
            variant="contained"
            color="success"
            startIcon={<ReceiptLongIcon />}
            onClick={() => navigate("/stores/invoices/add")}
          >
            Bill GRRs
          </Button>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchData}
          >
            Refresh
          </Button>
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
            <TextField
              size="small"
              label="Pty DC#"
              value=""
              sx={{ width: 120 }}
            />
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
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "flex-end",
                  mb: 0.5,
                  pr: 1,
                }}
              >
                <Typography
                  variant="caption"
                  sx={{ color: "#64748b", fontWeight: 600 }}
                >
                  {page * rowsPerPage + 1} -{" "}
                  {Math.min((page + 1) * rowsPerPage, totalCount)} of{" "}
                  {totalCount}
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
                      <TableCell sx={{ ...thSx, width: 90 }}>
                        Action
                      </TableCell>
                      <TableCell sx={{ ...thSx, width: 75 }}>GRR #</TableCell>
                      <TableCell sx={{ ...thSx, width: 90 }}>GRR Date</TableCell>
                      <TableCell sx={{ ...thSx, width: 60 }}>GRS #</TableCell>
                      <TableCell sx={{ ...thSx, width: 70 }}>PR No</TableCell>
                      <TableCell sx={{ ...thSx, width: 90 }}>PR Date</TableCell>
                      <TableCell sx={{ ...thSx, width: 160 }}>Pty Name</TableCell>
                      <TableCell sx={{ ...thSx, width: 80 }}>Pty DC</TableCell>
                      <TableCell sx={{ ...thSx, width: 90 }}>DC Date</TableCell>
                      <TableCell sx={{ ...thSx, width: 50 }}>Sl#</TableCell>
                      <TableCell sx={{ ...thSx, width: 55, textAlign: "center" }}>
                        W.O.P
                      </TableCell>
                      <TableCell sx={{ ...thSx, width: 85 }}>Item Code</TableCell>
                      <TableCell sx={{ ...thSx }}>Item Description</TableCell>
                      <TableCell
                        sx={{ ...thSx, width: 60, textAlign: "right" }}
                      >
                        Qty
                      </TableCell>
                      <TableCell
                        sx={{ ...thSx, width: 60, textAlign: "right" }}
                      >
                        Kg
                      </TableCell>
                      <TableCell
                        sx={{ ...thSx, width: 65, textAlign: "right" }}
                      >
                        Kg Accp
                      </TableCell>
                      <TableCell
                        sx={{ ...thSx, width: 65, textAlign: "right" }}
                      >
                        Recv Qty
                      </TableCell>
                      <TableCell
                        sx={{ ...thSx, width: 65, textAlign: "right" }}
                      >
                        Recv Kg
                      </TableCell>
                      {tab === 1 && (
                        <>
                          <TableCell sx={{ ...thSx, width: 85 }}>
                            Bill No
                          </TableCell>
                          <TableCell sx={{ ...thSx, width: 90 }}>
                            Bill Date
                          </TableCell>
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
                          bgcolor: idx % 2 === 0 ? "#ffffff" : "#f8fafc",
                          "&:hover": { bgcolor: "#eef2ff" },
                        }}
                      >
                        <TableCell sx={tdSx}>
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() =>
                              navigate("/stores/invoices/add", { state: { grn: r.grn } })
                            }
                            sx={{
                              fontSize: "0.68rem",
                              textTransform: "none",
                              py: 0.15,
                              px: 1,
                              minWidth: 0,
                              borderColor: "#1976d2",
                              color: "#1976d2",
                            }}
                          >
                            Create Billing
                          </Button>
                        </TableCell>
                        <TableCell sx={{ ...tdSx, fontWeight: 600, color: "#1565c0" }}>
                          {r.grn_no}
                        </TableCell>
                        <TableCell sx={tdSx}>{fmtDate(r.grn_date)}</TableCell>
                        <TableCell sx={tdSx}>{r.grs_no || "-"}</TableCell>
                        <TableCell
                          sx={{
                            ...tdSx,
                            fontWeight: 600,
                            color: r.pr_no ? "#7c3aed" : "#94a3b8",
                          }}
                        >
                          {r.pr_no || "-"}
                        </TableCell>
                        <TableCell sx={tdSx}>{fmtDate(r.pr_date)}</TableCell>
                        <TableCell
                          sx={{
                            ...tdSx,
                            fontWeight: 600,
                            maxWidth: 160,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          <Tooltip title={r.pty_name || "-"}>
                            <span>{r.pty_name || "-"}</span>
                          </Tooltip>
                        </TableCell>
                        <TableCell sx={tdSx}>{r.pty_dc || "-"}</TableCell>
                        <TableCell sx={tdSx}>{fmtDate(r.dc_date)}</TableCell>
                        <TableCell sx={{ ...tdSx, textAlign: "center" }}>
                          {r.item ? 1 : "-"}
                        </TableCell>
                        <TableCell
                          sx={{
                            ...tdSx,
                            textAlign: "center",
                            fontWeight: 600,
                            color: r.wop === "PROD" ? "#2e7d32" : r.wop === "EDP" ? "#e65100" : "#1565c0",
                          }}
                        >
                          {r.wop}
                        </TableCell>
                        <TableCell sx={{ ...tdSx, fontWeight: 600 }}>
                          {r.item_code || "-"}
                        </TableCell>
                        <TableCell
                          sx={{
                            ...tdSx,
                            maxWidth: 200,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          <Tooltip title={r.item_name || "-"}>
                            <span>{r.item_name || "-"}</span>
                          </Tooltip>
                        </TableCell>
                        <TableCell
                          sx={{
                            ...tdSx,
                            textAlign: "right",
                            fontWeight: 600,
                          }}
                        >
                          {r.qty > 0 ? formatNumber(r.qty) : "-"}
                        </TableCell>
                        <TableCell sx={{ ...tdSx, textAlign: "right" }}>
                          {r.kg > 0 ? formatNumber(r.kg, 3) : "-"}
                        </TableCell>
                        <TableCell
                          sx={{
                            ...tdSx,
                            textAlign: "right",
                            fontWeight: 600,
                            color: "success.dark",
                          }}
                        >
                          {r.kg_accp > 0 ? formatNumber(r.kg_accp, 3) : "-"}
                        </TableCell>
                        <TableCell sx={{ ...tdSx, textAlign: "right" }}>
                          {r.recv_qty > 0 ? formatNumber(r.recv_qty) : "-"}
                        </TableCell>
                        <TableCell sx={{ ...tdSx, textAlign: "right" }}>
                          {r.recv_kg > 0 ? formatNumber(r.recv_kg, 3) : "-"}
                        </TableCell>
                        {tab === 1 && (
                          <>
                            <TableCell
                              sx={{
                                ...tdSx,
                                fontWeight: 600,
                                color: "#2e7d32",
                              }}
                            >
                              {r.bill_no || "-"}
                            </TableCell>
                            <TableCell sx={tdSx}>
                              {fmtDate(r.bill_date)}
                            </TableCell>
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
