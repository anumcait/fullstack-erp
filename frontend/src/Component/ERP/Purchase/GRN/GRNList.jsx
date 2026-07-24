import React, { useEffect, useState, useCallback } from "react";
import { Box, Card, CardContent, Typography, TextField, Button, Chip, LinearProgress, Tooltip, IconButton, Table, TableHead, TableRow, TableCell, TableBody, Collapse, TableContainer, Dialog, DialogTitle, DialogContent, DialogActions, Divider } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import RefreshIcon from "@mui/icons-material/Refresh";
import SearchIcon from "@mui/icons-material/Search";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import PrintIcon from "@mui/icons-material/Print";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import axios from "axios";
import { useToast } from "../../../../context/ToastContext";
import { useNavigate, useSearchParams } from "react-router-dom";
import { formatDate } from '../../../../utils/format';

const stripPrefix = (val) => (val || "").replace(/^[A-Z]+[-\s]/i, "");
const API = "/api/erp/stores/grn";

function ItemsTable({ items, grrNo }) {
  if (!items || items.length === 0) return <Typography variant="body2" sx={{ p: 1.5, color: "text.secondary" }}>No items</Typography>;
  return (
    <Box sx={{ border: "1px solid #e2e8f0", borderRadius: 2, overflow: "hidden" }}>
      <Box sx={{ px: 2, py: 0.75, bgcolor: "#f1f5f9", display: "flex", alignItems: "center", gap: 1 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "var(--heading-color)", fontSize: "0.9rem" }}>
          Items — {grrNo}
        </Typography>
        <Chip label={`${items.length} item(s)`} size="small" sx={{ fontSize: "0.78rem" }} />
      </Box>
      <Box sx={{ maxHeight: 240, overflow: "auto" }}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: "#f8fafc" }}>
              <TableCell sx={{ fontWeight: 700, fontSize: "0.82rem", py: 0.6, color: "#475569", width: 34 }}>#</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: "0.82rem", py: 0.6, color: "#475569" }}>Item Code</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: "0.82rem", py: 0.6, color: "#475569" }}>Description</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: "0.82rem", py: 0.6, color: "#475569", width: 70 }}>Ordered</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: "0.82rem", py: 0.6, color: "#475569", width: 70 }}>Accepted</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: "0.82rem", py: 0.6, color: "#475569", width: 70 }}>Rejected</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: "0.82rem", py: 0.6, color: "#475569", width: 70 }}>Rate</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: "0.82rem", py: 0.6, color: "#475569", width: 85 }}>Amount</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((it, i) => (
              <TableRow key={i} hover>
                <TableCell sx={{ fontSize: "0.82rem", py: 0.4 }}>{i + 1}</TableCell>
                <TableCell sx={{ fontSize: "0.82rem", py: 0.4 }}>{it.item_code || "—"}</TableCell>
                <TableCell sx={{ fontSize: "0.82rem", py: 0.4 }}>{it.item_name || "—"}</TableCell>
                <TableCell sx={{ fontSize: "0.82rem", py: 0.4 }}>{Number(it.ordered_qty || 0).toFixed(2)}</TableCell>
                <TableCell sx={{ fontSize: "0.82rem", py: 0.4, fontWeight: 600, color: "success.dark" }}>{Number(it.accepted_qty || 0).toFixed(2)}</TableCell>
                <TableCell sx={{ fontSize: "0.82rem", py: 0.4, color: it.rejected_qty > 0 ? "error.main" : "inherit" }}>{Number(it.rejected_qty || 0).toFixed(2)}</TableCell>
                <TableCell sx={{ fontSize: "0.82rem", py: 0.4 }}>{Number(it.rate || 0).toFixed(2)}</TableCell>
                <TableCell sx={{ fontSize: "0.82rem", py: 0.4, fontWeight: 600 }}>₹{Number(it.amount || 0).toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
    </Box>
  );
}

function ApproveDialog({ row, open, onClose, onConfirm }) {
  if (!row) return null;
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1, color: "success.main", fontWeight: 700 }}>
        <CheckCircleIcon /> {row.status === "Draft" ? "Submit for Approval" : "Confirm Approval"}
      </DialogTitle>
      <Divider />
      <DialogContent sx={{ pt: 2 }}>
        <Typography variant="body2" sx={{ mb: 2, color: "text.secondary" }}>
          Please verify all details before {row.status === "Draft" ? "submitting" : "approving"}:
        </Typography>
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5, mb: 2 }}>
          <Box><Typography variant="caption" color="text.secondary">GRR No</Typography><Typography variant="body2" sx={{ fontWeight: 600 }}>{row.grn_no}</Typography></Box>
          <Box><Typography variant="caption" color="text.secondary">Date</Typography><Typography variant="body2">{row.grn_date ? formatDate(row.grn_date) : "—"}</Typography></Box>
          <Box><Typography variant="caption" color="text.secondary">IR Type</Typography><Typography variant="body2">{row.ir_type || "GRR"}</Typography></Box>
          <Box><Typography variant="caption" color="text.secondary">Supplier</Typography><Typography variant="body2">{row.supplier?.supplier_name || "—"}</Typography></Box>
          <Box><Typography variant="caption" color="text.secondary">PO No</Typography><Typography variant="body2">{row.purchaseOrder?.po_no || "—"}</Typography></Box>
          <Box><Typography variant="caption" color="text.secondary">Invoice</Typography><Typography variant="body2">{row.invoice_no || "—"}</Typography></Box>
        </Box>
        <Divider sx={{ mb: 1.5 }} />
        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.5 }}>
          Items ({row.items?.length || 0})
        </Typography>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: "#f8fafc" }}>
              <TableCell sx={{ fontWeight: 700, fontSize: "0.82rem", py: 0.5, color: "#475569", width: 32 }}>#</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: "0.82rem", py: 0.5, color: "#475569" }}>Item</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: "0.82rem", py: 0.5, color: "#475569", width: 60 }}>Accepted</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: "0.82rem", py: 0.5, color: "#475569", width: 65 }}>Amount</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {row.items?.map((it, i) => (
              <TableRow key={i}>
                <TableCell sx={{ fontSize: "0.82rem", py: 0.35 }}>{i + 1}</TableCell>
                <TableCell sx={{ fontSize: "0.82rem", py: 0.35 }}>{it.item_name || it.item_code || "—"}</TableCell>
                <TableCell sx={{ fontSize: "0.82rem", py: 0.35 }}>{Number(it.accepted_qty || 0).toFixed(2)}</TableCell>
                <TableCell sx={{ fontSize: "0.82rem", py: 0.35 }}>₹{Number(it.amount || 0).toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DialogContent>
      <Divider />
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button variant="outlined" onClick={onClose}>Cancel</Button>
        <Button variant="contained" color="success" onClick={onConfirm} startIcon={<CheckCircleIcon />}>
          {row.status === "Draft" ? "Submit for Approval" : "Approve GRR"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function RejectDialog({ row, open, onClose, remarks, onRemarksChange, onConfirm }) {
  if (!row) return null;
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1, color: "error.main", fontWeight: 700 }}>
        <CancelIcon /> Reject GRR
      </DialogTitle>
      <Divider />
      <DialogContent sx={{ pt: 2 }}>
        <Typography variant="body2" sx={{ mb: 1.5, color: "text.secondary" }}>
          You are about to reject <strong>{row.grn_no}</strong>. Please provide a reason:
        </Typography>
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, mb: 2 }}>
          <Box><Typography variant="caption" color="text.secondary">GRR No</Typography><Typography variant="body2" sx={{ fontWeight: 600 }}>{row.grn_no}</Typography></Box>
          <Box><Typography variant="caption" color="text.secondary">Supplier</Typography><Typography variant="body2">{row.supplier?.supplier_name || "—"}</Typography></Box>
          <Box><Typography variant="caption" color="text.secondary">PO No</Typography><Typography variant="body2">{row.purchaseOrder?.po_no || "—"}</Typography></Box>
          <Box><Typography variant="caption" color="text.secondary">Items</Typography><Typography variant="body2">{row.items?.length || 0}</Typography></Box>
        </Box>
        <TextField label="Reason for Rejection *" fullWidth multiline rows={3} value={remarks}
          onChange={onRemarksChange} placeholder="Explain why this GRR is being rejected..."
          inputProps={{ maxLength: 500 }}
          helperText={`${remarks.length} / 500`}
          FormHelperTextProps={{ sx: { textAlign: "right", m: 0, mt: 0.25, fontSize: "0.75rem", color: remarks.length > 450 ? "error.main" : "text.secondary" } }} />
      </DialogContent>
      <Divider />
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button variant="outlined" onClick={onClose}>Cancel</Button>
        <Button variant="contained" color="error" onClick={onConfirm} disabled={!remarks.trim()} startIcon={<CancelIcon />}>Reject</Button>
      </DialogActions>
    </Dialog>
  );
}

function GRRTable({ rows, expandedId, setExpandedId, onApproveClick, onRejectClick, navigate, loading }) {
  const uniquePrNos = (items) => [...new Set((items || []).map((i) => stripPrefix(i.pr_no)).filter(Boolean))].join(", ");
  const uniquePoNos = (items) => [...new Set((items || []).map((i) => stripPrefix(i.po_no)).filter(Boolean))].join(", ");
  const tableHeaders = [
    { label: "S.No", width: 52 },
    { label: "GRR #", width: 130 },
    { label: "Date", width: 110 },
    { label: "IR Type", width: 100 },
    { label: "PO #", width: 120 },
    { label: "PR #", width: 120 },
    { label: "Supplier", width: 180 },
    { label: "Invoice", width: 120 },
    { label: "Status", width: 100 },
    { label: "QA", width: 90 },
    { label: "Actions", width: 200 },
  ];

  if (loading) return <LinearProgress sx={{ mb: 1 }} />;
  if (rows.length === 0) {
    return <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", py: 3 }}>No records found.</Typography>;
  }

  return (
    <TableContainer sx={{ maxHeight: 560, overflow: "auto" }}>
      <Table size="small" stickyHeader sx={{ minWidth: 1200, borderCollapse: "separate", borderSpacing: 0 }}>
        <TableHead>
          <TableRow sx={{ "& th": { bgcolor: "#f1f5f9", fontWeight: 700, fontSize: "0.9rem", py: 0.85, color: "#334155", borderBottom: "2px solid #e2e8f0", position: "sticky", top: 0, zIndex: 2 } }}>
            {tableHeaders.map((h) => <TableCell key={h.label} sx={{ width: h.width }}>{h.label}</TableCell>)}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row, idx) => (
            <React.Fragment key={row.id}>
              <TableRow hover sx={{ bgcolor: idx % 2 === 0 ? "#ffffff" : "#f8fafc", "&:hover": { bgcolor: "#eef2ff" }, "& td": { fontSize: "0.9rem", py: 0.75, borderBottom: "1px solid #f1f5f9" } }}>
                <TableCell sx={{ color: "#94a3b8" }}>{idx + 1}</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>{row.grn_no}</TableCell>
                <TableCell>{row.grn_date ? formatDate(row.grn_date) : ""}</TableCell>
                <TableCell><Chip label={row.ir_type || "GRR"} size="small" variant="outlined" sx={{ fontSize: "0.72rem" }} /></TableCell>
                <TableCell>{uniquePoNos(row.items) || stripPrefix(row.purchaseOrder?.po_no) || "—"}</TableCell>
                <TableCell>{uniquePrNos(row.items) || stripPrefix(row.purchaseRequisition?.req_no) || "—"}</TableCell>
                <TableCell>{row.supplier?.supplier_name || "—"}</TableCell>
                <TableCell>{row.invoice_no || "—"}</TableCell>
                <TableCell>
                  <Chip label={row.status} size="small"
                    color={row.status === "Received" ? "success" : row.status === "Draft" ? "default" : "warning"}
                    sx={{ fontSize: "0.72rem" }} />
                </TableCell>
                <TableCell>
                  <Chip label={row.qa_status || "Pending"} size="small"
                    color={row.qa_status === "Passed" ? "success" : row.qa_status === "Rejected" ? "error" : "warning"}
                    sx={{ fontSize: "0.72rem" }} />
                </TableCell>
                <TableCell>
                  <Box sx={{ display: "flex", gap: 0.25, alignItems: "center" }}>
                    <IconButton size="small" onClick={() => setExpandedId(expandedId === row.id ? null : row.id)}>
                      {expandedId === row.id ? <KeyboardArrowUpIcon fontSize="small" /> : <KeyboardArrowDownIcon fontSize="small" />}
                    </IconButton>
                    <Tooltip title="View"><IconButton size="small" onClick={() => navigate(`/stores/grr/view/${row.id}`)}><VisibilityIcon fontSize="small" /></IconButton></Tooltip>
                    <Tooltip title="Print"><IconButton size="small" onClick={() => navigate(`/stores/grr/print/${row.id}`)}><PrintIcon fontSize="small" /></IconButton></Tooltip>
                    {row.status === "Draft" && (
                      <>
                        <Tooltip title="Edit"><IconButton size="small" color="primary" onClick={() => navigate(`/stores/grr/edit/${row.id}`)}><EditIcon fontSize="small" /></IconButton></Tooltip>
                        <Tooltip title="Submit for Approval"><IconButton size="small" color="success" onClick={() => onApproveClick(row)}><CheckCircleIcon fontSize="small" /></IconButton></Tooltip>
                      </>
                    )}
                    {row.status === "Received" && row.approval_status === "Pending" && (
                      <>
                        <Tooltip title="Approve"><IconButton size="small" color="success" onClick={() => onApproveClick(row)}><CheckCircleIcon fontSize="small" /></IconButton></Tooltip>
                        <Tooltip title="Reject"><IconButton size="small" color="error" onClick={() => onRejectClick(row)}><CancelIcon fontSize="small" /></IconButton></Tooltip>
                      </>
                    )}
                  </Box>
                </TableCell>
              </TableRow>
              {expandedId === row.id && (
                <TableRow>
                  <TableCell colSpan={tableHeaders.length} sx={{ py: 1, px: 2, bgcolor: "#fafcff", borderBottom: "2px solid #e2e8f0" }}>
                    <ItemsTable items={row.items} grrNo={row.grn_no} />
                  </TableCell>
                </TableRow>
              )}
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default function GRNList() {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState(() => { const d = new Date(); const m = new Date(d); m.setMonth(m.getMonth() - 1); return m.toISOString().split("T")[0]; });
  const [dateTo, setDateTo] = useState(() => new Date().toISOString().split("T")[0]);
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [expandedId, setExpandedId] = useState(null);
  const [approveTarget, setApproveTarget] = useState(null);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejectRemarks, setRejectRemarks] = useState("");

  const statusFilter = searchParams.get("status") || "";
  const title = statusFilter === "Draft" ? "GRR Draft"
    : statusFilter === "Received" ? "Received GRRs"
    : "GRR (Goods Received Record)";

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      if (dateFrom) params.date_from = dateFrom;
      if (dateTo) params.date_to = dateTo;
      if (year) params.year = year;
      const { data } = await axios.get(API, { params });
      setRows(data);
    } catch { showToast("Failed to load GRRs", "error"); }
    finally { setLoading(false); }
  }, [search, statusFilter, dateFrom, dateTo, year]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleConfirmApprove = async () => {
    if (!approveTarget) return;
    const target = approveTarget;
    setApproveTarget(null);
    try {
      if (target.status === "Draft") {
        await axios.put(`${API}/${target.id}/approve`, { status: "Received", approved_by: localStorage.getItem('empName') || localStorage.getItem('userName') || 'System' });
      } else {
        await axios.put(`${API}/${target.id}/approve`, { status: "Approved", approved_by: localStorage.getItem('empName') || localStorage.getItem('userName') || 'System' });
      }
      showToast("GRR updated successfully", "success");
      fetchData();
    } catch (err) { showToast(err.response?.data?.error || "Failed to update", "error"); }
  };

  const handleConfirmReject = async () => {
    if (!rejectTarget || !rejectRemarks.trim()) return;
    const target = rejectTarget;
    setRejectTarget(null);
    setRejectRemarks("");
    try {
      await axios.put(`${API}/${target.id}/approve`, {
        status: "Rejected",
        approved_by: localStorage.getItem('empName') || localStorage.getItem('userName') || 'System',
        remarks: rejectRemarks.trim(),
      });
      showToast("GRR Rejected", "success");
      fetchData();
    } catch (err) { showToast(err.response?.data?.error || "Failed to reject", "error"); }
  };

  const draftRows = rows.filter((r) => r.status === "Draft");
  const receivedRows = rows.filter((r) => r.status === "Received");

  const filterBar = (
    <Box sx={{ display: "flex", gap: { xs: 1, sm: 2 }, mb: 2, flexWrap: "wrap", alignItems: "center" }}>
      <TextField size="small" placeholder="Search GRR..." value={search} onChange={(e) => setSearch(e.target.value)}
        InputProps={{ startAdornment: <SearchIcon sx={{ mr: 0.5, color: "gray" }} /> }} sx={{ minWidth: { xs: 180, sm: 260, md: 300 }, flex: { xs: "1 1 100%", sm: "0 1 auto" } }} />
      <TextField size="small" type="date" label="Date From" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
        InputLabelProps={{ shrink: true }} sx={{ width: 150 }} />
      <TextField size="small" type="date" label="Date To" value={dateTo} onChange={(e) => setDateTo(e.target.value)}
        InputLabelProps={{ shrink: true }} sx={{ width: 150 }} />
      <TextField size="small" placeholder="Year" value={year} onChange={(e) => setYear(e.target.value.replace(/\D/g, '').slice(0, 4))} sx={{ width: 100 }} />
      {(dateFrom || dateTo) && (
        <Button size="small" variant="text" onClick={() => { const d = new Date(); const ma = new Date(d); ma.setMonth(ma.getMonth() - 1); setDateFrom(ma.toISOString().split("T")[0]); setDateTo(d.toISOString().split("T")[0]); }}>Reset</Button>
      )}
      <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={() => navigate("/stores/grr/add")} sx={{ whiteSpace: "nowrap" }}>New GRR</Button>
      <Button variant="outlined" size="small" startIcon={<RefreshIcon />} onClick={fetchData} sx={{ whiteSpace: "nowrap" }}>Refresh</Button>
      {!statusFilter && <Button size="small" variant="text" onClick={() => navigate("/stores/grr?status=Draft")}>Drafts</Button>}
      {!statusFilter && <Button size="small" variant="text" onClick={() => navigate("/stores/grr?status=Received")}>Received</Button>}
      {statusFilter && <Button size="small" variant="text" onClick={() => navigate("/stores/grr")}>Clear Filter</Button>}
    </Box>
  );

  return (
    <Box sx={{ p: { xs: 1.5, sm: 2, md: 3 } }}>
      <Typography variant="h4" sx={{ mb: { xs: 1.5, sm: 2, md: 3 }, fontWeight: "bold", color: "var(--heading-color)", fontSize: { xs: "1.2rem", sm: "1.3rem", md: "1.5rem" } }}>{title}</Typography>

      {statusFilter ? (
        <Card sx={{ borderRadius: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
          <CardContent>
            {filterBar}
            <GRRTable rows={rows} expandedId={expandedId} setExpandedId={setExpandedId}
              onApproveClick={(r) => setApproveTarget(r)} onRejectClick={(r) => { setRejectTarget(r); setRejectRemarks(""); }}
              navigate={navigate} loading={loading} />
          </CardContent>
        </Card>
      ) : (
        <>
          <Card sx={{ borderRadius: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.08)", mb: 3 }}>
            <CardContent>
              {filterBar}
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "var(--heading-color)", fontSize: { xs: "0.85rem", sm: "0.95rem" }, mb: 1 }}>
                Draft GRRs ({draftRows.length})
              </Typography>
              <GRRTable rows={draftRows} expandedId={expandedId} setExpandedId={setExpandedId}
                onApproveClick={(r) => setApproveTarget(r)} onRejectClick={(r) => { setRejectTarget(r); setRejectRemarks(""); }}
                navigate={navigate} loading={loading} />
            </CardContent>
          </Card>

          {receivedRows.filter(r => r.approval_status === "Pending").length > 0 && (
            <Card sx={{ borderRadius: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.08)", mb: 3, borderLeft: "4px solid #f59e0b" }}>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "var(--heading-color)", fontSize: { xs: "0.85rem", sm: "0.95rem" } }}>
                    Approval Pending
                  </Typography>
                  <Chip label={`${receivedRows.filter(r => r.approval_status === "Pending").length} pending`} size="small" color="warning" sx={{ fontSize: "0.72rem" }} />
                </Box>
                <GRRTable rows={receivedRows.filter(r => r.approval_status === "Pending")} expandedId={expandedId} setExpandedId={setExpandedId}
                  onApproveClick={(r) => setApproveTarget(r)} onRejectClick={(r) => { setRejectTarget(r); setRejectRemarks(""); }}
                  navigate={navigate} loading={loading} />
              </CardContent>
            </Card>
          )}

          <Card sx={{ borderRadius: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "var(--heading-color)", fontSize: { xs: "0.85rem", sm: "0.95rem" } }}>
                  Completed / Approved
                </Typography>
                <Chip label={`${receivedRows.filter(r => r.approval_status === "Approved").length} record(s)`} size="small" color="success" sx={{ fontSize: "0.72rem" }} />
              </Box>
              <GRRTable rows={receivedRows.filter(r => r.approval_status === "Approved")} expandedId={expandedId} setExpandedId={setExpandedId}
                onApproveClick={(r) => setApproveTarget(r)} onRejectClick={(r) => { setRejectTarget(r); setRejectRemarks(""); }}
                navigate={navigate} loading={loading} />
            </CardContent>
          </Card>
        </>
      )}

      <ApproveDialog row={approveTarget} open={Boolean(approveTarget)}
        onClose={() => setApproveTarget(null)} onConfirm={handleConfirmApprove} />

      <RejectDialog row={rejectTarget} open={Boolean(rejectTarget)}
        onClose={() => { setRejectTarget(null); setRejectRemarks(""); }}
        remarks={rejectRemarks} onRemarksChange={(e) => setRejectRemarks(e.target.value)}
        onConfirm={handleConfirmReject} />
    </Box>
  );
}
