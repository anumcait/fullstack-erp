import React, { useEffect, useState, useCallback } from "react";
import { Box, Card, CardContent, Typography, TextField, Button, Chip, LinearProgress, Tooltip, IconButton, Table, TableHead, TableRow, TableCell, TableBody, Collapse, TableContainer, Dialog, DialogTitle, DialogContent, DialogActions, Divider } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import VisibilityIcon from "@mui/icons-material/Visibility";
import RefreshIcon from "@mui/icons-material/Refresh";
import SearchIcon from "@mui/icons-material/Search";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import PrintIcon from "@mui/icons-material/Print";
import EditIcon from "@mui/icons-material/Edit";
import HistoryIcon from "@mui/icons-material/History";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import axios from "axios";
import { useToast } from "../../../../context/ToastContext";
import { useNavigate, useSearchParams } from "react-router-dom";
import { formatDate } from '../../../../utils/format';
import GppMaybeIcon from '@mui/icons-material/GppMaybe';

const API = "/api/erp/purchase/requisitions";

function ItemsTable({ items, reqNo }) {
  if (!items || items.length === 0) return <Typography variant="body2" sx={{ p: 1.5, color: "text.secondary" }}>No items</Typography>;
  return (
    <Box sx={{ border: "1px solid #e2e8f0", borderRadius: 2, overflow: "hidden" }}>
      <Box sx={{ px: 2, py: 0.75, bgcolor: "#f1f5f9", display: "flex", alignItems: "center", gap: 1 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "var(--heading-color)", fontSize: "0.9rem" }}>
          Items — {reqNo}
        </Typography>
        <Chip label={`${items.length} item(s)`} size="small" sx={{ fontSize: "0.78rem" }} />
      </Box>
      <Box sx={{ maxHeight: 240, overflow: "auto", "&::-webkit-scrollbar": { width: 5 }, "&::-webkit-scrollbar-thumb": { bgcolor: "#cbd5e1", borderRadius: 2 } }}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: "#f8fafc" }}>
              <TableCell sx={{ fontWeight: 700, fontSize: "0.82rem", py: 0.6, color: "#475569", width: 34 }}>#</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: "0.82rem", py: 0.6, color: "#475569" }}>Item Code</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: "0.82rem", py: 0.6, color: "#475569" }}>Description</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: "0.82rem", py: 0.6, color: "#475569", width: 60 }}>UOM</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: "0.82rem", py: 0.6, color: "#475569", width: 60 }}>Qty</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: "0.82rem", py: 0.6, color: "#475569", width: 100 }}>Req. Date</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: "0.82rem", py: 0.6, color: "#475569" }}>Purpose</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: "0.82rem", py: 0.6, color: "#475569", width: 60 }}>Kgs</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: "0.82rem", py: 0.6, color: "#475569", width: 85 }}>Mat. Code</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: "0.82rem", py: 0.6, color: "#475569", width: 85 }}>Est Cost</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((it, i) => (
              <TableRow key={i} hover>
                <TableCell sx={{ fontSize: "0.82rem", py: 0.4 }}>{i + 1}</TableCell>
                <TableCell sx={{ fontSize: "0.82rem", py: 0.4 }}>{it.item_code || "—"}</TableCell>
                <TableCell sx={{ fontSize: "0.82rem", py: 0.4 }}>{it.item_name || "—"}</TableCell>
                <TableCell sx={{ fontSize: "0.82rem", py: 0.4 }}>{it.uom || "—"}</TableCell>
                <TableCell sx={{ fontSize: "0.82rem", py: 0.4 }}>{it.quantity != null ? parseFloat(it.quantity) : "—"}</TableCell>



                <TableCell sx={{ fontSize: "0.82rem", py: 0.35 }}>{it.quantity != null ? parseFloat(it.quantity) : "—"}</TableCell>
                <TableCell sx={{ fontSize: "0.82rem", py: 0.35 }}>{it.est_cost ? `₹${parseFloat(it.est_cost)}` : "—"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
    </Box>
  );
}

function PRTable({ rows, expandedId, setExpandedId, onApproveClick, onRejectClick, onTrackClick, onAmendClick, navigate, loading, canAmendPr }) {
  const tableHeaders = [
    { label: "S.No", width: 52 },
    { label: "Req #", width: 130 },
    { label: "Date", width: 110 },
    { label: "Department", width: 140 },
    { label: "Requested By", width: 150 },
    { label: "Type", width: 100 },
    { label: "Priority", width: 100 },
    { label: "Status", width: 110 },
    { label: "Items", width: 60 },
    { label: "Actions", width: 210 },
  ];

  if (loading) return <LinearProgress sx={{ mb: 1 }} />;

  if (rows.length === 0) {
    return <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", py: 3 }}>No records found.</Typography>;
  }

  return (
    <TableContainer sx={{ maxHeight: 560, overflow: "auto", "&::-webkit-scrollbar": { width: 6 }, "&::-webkit-scrollbar-thumb": { bgcolor: "#cbd5e1", borderRadius: 3 } }}>
      <Table size="small" stickyHeader sx={{ minWidth: 1100, borderCollapse: "separate", borderSpacing: 0 }}>
        <TableHead>
          <TableRow sx={{ "& th": { bgcolor: "#f1f5f9", fontWeight: 700, fontSize: "0.9rem", py: 0.85, color: "#334155", borderBottom: "2px solid #e2e8f0", position: "sticky", top: 0, zIndex: 2 } }}>
            {tableHeaders.map((h) => <TableCell key={h.label} sx={{ width: h.width }}>{h.label}</TableCell>)}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row, idx) => (
            <React.Fragment key={row.id}>
              <TableRow hover sx={{ bgcolor: idx % 2 === 0 ? "#ffffff" : "#f8fafc", transition: "background 0.1s", "&:hover": { bgcolor: "#eef2ff" }, "& td": { fontSize: "0.9rem", py: 0.75, borderBottom: "1px solid #f1f5f9" } }}>
                <TableCell sx={{ color: "#94a3b8" }}>{idx + 1}</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>{row.req_no}</TableCell>
                <TableCell>{row.req_date ? row.req_date.split("T")[0] : ""}</TableCell>
                <TableCell>{row.department}</TableCell>
                <TableCell>{row.requested_by}</TableCell>
                <TableCell>{row.indent_type}</TableCell>
                <TableCell>
                  <Chip label={row.priority} size="small" color={row.priority === "Urgent" ? "error" : row.priority === "High" ? "warning" : "default"} sx={{ fontSize: "0.72rem" }} />
                </TableCell>
                <TableCell>
                  <Chip label={row.status} size="small" color={row.status === "Approved" ? "success" : row.status === "Rejected" ? "error" : "warning"} sx={{ fontSize: "0.72rem" }} />
                </TableCell>
                <TableCell>{row.items?.length || 0}</TableCell>
                <TableCell>
                  <Box sx={{ display: "flex", gap: 0.25, alignItems: "center" }}>
                    <IconButton size="small" onClick={() => setExpandedId(expandedId === row.id ? null : row.id)}>
                      {expandedId === row.id ? <KeyboardArrowUpIcon fontSize="small" /> : <KeyboardArrowDownIcon fontSize="small" />}
                    </IconButton>
                    <Tooltip title="View"><IconButton size="small" onClick={() => navigate(`/purchase/requisitions/view/${row.id}`)}><VisibilityIcon fontSize="small" /></IconButton></Tooltip>
                    <Tooltip title="Print"><IconButton size="small" onClick={() => navigate(`/purchase/requisitions/print/${row.id}`)}><PrintIcon fontSize="small" /></IconButton></Tooltip>
                    <Tooltip title="Track Changes"><IconButton size="small" color="default" onClick={() => onTrackClick(row.id)}><HistoryIcon fontSize="small" /></IconButton></Tooltip>
                    {row.status === "Draft" && (
                      <>
                        <Tooltip title="Edit"><IconButton size="small" color="primary" onClick={() => navigate(`/purchase/requisitions/edit/${row.id}`)}><EditIcon fontSize="small" /></IconButton></Tooltip>
                        <Tooltip title="Submit for Authorization"><IconButton size="small" color="success" onClick={() => onApproveClick(row)}><CheckCircleIcon fontSize="small" /></IconButton></Tooltip>
                      </>
                    )}
                    {row.status === "Pending" && (
                      <>
                        <Tooltip title="Edit"><IconButton size="small" color="primary" onClick={() => navigate(`/purchase/requisitions/edit/${row.id}`)}><EditIcon fontSize="small" /></IconButton></Tooltip>
                        <Tooltip title="Approve"><IconButton size="small" color="success" onClick={() => onApproveClick(row)}><CheckCircleIcon fontSize="small" /></IconButton></Tooltip>
                        <Tooltip title="Reject"><IconButton size="small" color="error" onClick={() => onRejectClick(row)}><CancelIcon fontSize="small" /></IconButton></Tooltip>
                      </>
                    )}
                    {row.status === "Approved" && canAmendPr && (
                      <Tooltip title="Amend PR"><IconButton size="small" color="warning" onClick={() => onAmendClick(row)}><EditIcon fontSize="small" /></IconButton></Tooltip>
                    )}
                  </Box>
                </TableCell>
              </TableRow>
              {expandedId === row.id && (
                <TableRow>
                  <TableCell colSpan={tableHeaders.length} sx={{ py: 1, px: 2, bgcolor: "#fafcff", borderBottom: "2px solid #e2e8f0" }}>
                    <ItemsTable items={row.items} reqNo={row.req_no} />
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

function ApproveDialog({ row, open, onClose, onConfirm }) {
  if (!row) return null;
  const totalEstCost = row.items?.reduce((s, i) => s + (Number(i.est_cost) || 0), 0) || 0;
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1, color: "success.main", fontWeight: 700 }}>
        <CheckCircleIcon /> {row.status === "Draft" ? "Submit for Authorization" : "Confirm Approval"}
      </DialogTitle>
      <Divider />
      <DialogContent sx={{ pt: 2 }}>
        <Typography variant="body2" sx={{ mb: 2, color: "text.secondary" }}>
          Please verify all details before {row.status === "Draft" ? "submitting" : "approving"}:
        </Typography>
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5, mb: 2 }}>
          <Box><Typography variant="caption" color="text.secondary">Req No</Typography><Typography variant="body2" sx={{ fontWeight: 600 }}>{row.req_no}</Typography></Box>
          <Box><Typography variant="caption" color="text.secondary">Date</Typography><Typography variant="body2">{row.req_date ? row.req_date.split("T")[0] : "—"}</Typography></Box>
          <Box><Typography variant="caption" color="text.secondary">Department</Typography><Typography variant="body2">{row.department || "—"}</Typography></Box>
          <Box><Typography variant="caption" color="text.secondary">Requested By</Typography><Typography variant="body2">{row.requested_by || "—"}</Typography></Box>
          <Box><Typography variant="caption" color="text.secondary">Indent Type</Typography><Typography variant="body2">{row.indent_type || "—"}</Typography></Box>
          <Box><Typography variant="caption" color="text.secondary">Priority</Typography><Typography variant="body2">{row.priority || "—"}</Typography></Box>
        </Box>
        <Divider sx={{ mb: 1.5 }} />
        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.5 }}>
          Items ({row.items?.length || 0}) — Total Est. Cost: <strong>₹{totalEstCost.toLocaleString()}</strong>
        </Typography>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: "#f8fafc" }}>
              <TableCell sx={{ fontWeight: 700, fontSize: "0.82rem", py: 0.5, color: "#475569", width: 32 }}>#</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: "0.82rem", py: 0.5, color: "#475569" }}>Item</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: "0.82rem", py: 0.5, color: "#475569", width: 50 }}>Qty</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: "0.82rem", py: 0.5, color: "#475569", width: 65 }}>Est Cost</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {row.items?.map((it, i) => (
              <TableRow key={i}>
                <TableCell sx={{ fontSize: "0.82rem", py: 0.35 }}>{i + 1}</TableCell>
                <TableCell sx={{ fontSize: "0.82rem", py: 0.35 }}>{it.item_name || it.item_code || "—"}</TableCell>
                <TableCell sx={{ fontSize: "0.82rem", py: 0.35 }}>{it.quantity != null ? parseFloat(it.quantity) : "—"}</TableCell>
                <TableCell sx={{ fontSize: "0.82rem", py: 0.35 }}>{it.est_cost ? `₹${parseFloat(it.est_cost)}` : "—"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DialogContent>
      <Divider />
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button variant="outlined" onClick={onClose}>Cancel</Button>
        <Button variant="contained" color="success" onClick={onConfirm} startIcon={<CheckCircleIcon />}>
          {row.status === "Draft" ? "Submit for Authorization" : "Approve Requisition"}
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
        <CancelIcon /> Reject Requisition
      </DialogTitle>
      <Divider />
      <DialogContent sx={{ pt: 2 }}>
        <Typography variant="body2" sx={{ mb: 1.5, color: "text.secondary" }}>
          You are about to reject <strong>{row.req_no}</strong>. Please provide a reason for rejection:
        </Typography>
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, mb: 2 }}>
          <Box><Typography variant="caption" color="text.secondary">Req No</Typography><Typography variant="body2" sx={{ fontWeight: 600 }}>{row.req_no}</Typography></Box>
          <Box><Typography variant="caption" color="text.secondary">Department</Typography><Typography variant="body2">{row.department || "—"}</Typography></Box>
          <Box><Typography variant="caption" color="text.secondary">Requested By</Typography><Typography variant="body2">{row.requested_by || "—"}</Typography></Box>
          <Box><Typography variant="caption" color="text.secondary">Items</Typography><Typography variant="body2">{row.items?.length || 0}</Typography></Box>
        </Box>
        <TextField label="Reason for Rejection *" fullWidth multiline rows={3} value={remarks}
          onChange={onRemarksChange} placeholder="Explain why this requisition is being rejected..."
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

function AmendConfirmDialog({ row, open, onClose, onConfirm }) {
  if (!row) return null;
  const totalEstCost = row.items?.reduce((s, i) => s + (Number(i.est_cost) || 0), 0) || 0;
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1, color: "warning.main", fontWeight: 700 }}>
        <GppMaybeIcon /> Confirm PR Amendment
      </DialogTitle>
      <Divider />
      <DialogContent sx={{ pt: 2 }}>
        <Typography variant="body2" sx={{ mb: 2, color: "text.secondary" }}>
          You are about to amend an <strong>approved</strong> Purchase Requisition. This will create a tracked amendment record. Please verify:
        </Typography>
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5, mb: 2 }}>
          <Box><Typography variant="caption" color="text.secondary">Req No</Typography><Typography variant="body2" sx={{ fontWeight: 600 }}>{row.req_no}</Typography></Box>
          <Box><Typography variant="caption" color="text.secondary">Date</Typography><Typography variant="body2">{row.req_date ? formatDate(row.req_date) : "—"}</Typography></Box>
          <Box><Typography variant="caption" color="text.secondary">Department</Typography><Typography variant="body2">{row.department || "—"}</Typography></Box>
          <Box><Typography variant="caption" color="text.secondary">Requested By</Typography><Typography variant="body2">{row.requested_by || "—"}</Typography></Box>
          <Box><Typography variant="caption" color="text.secondary">Indent Type</Typography><Typography variant="body2">{row.indent_type || "—"}</Typography></Box>
          <Box><Typography variant="caption" color="text.secondary">Priority</Typography><Typography variant="body2">{row.priority || "—"}</Typography></Box>
        </Box>
        <Divider sx={{ mb: 1.5 }} />
        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.5 }}>
          Items ({row.items?.length || 0}) — Total Est. Cost: <strong>₹{totalEstCost.toLocaleString()}</strong>
        </Typography>
        <Typography variant="body2" color="warning.dark" sx={{ mt: 1, fontStyle: "italic", fontSize: "0.82rem" }}>
          A Before/After comparison PDF will be generated after saving your changes.
        </Typography>
      </DialogContent>
      <Divider />
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button variant="outlined" onClick={onClose}>Cancel</Button>
        <Button variant="contained" color="warning" onClick={onConfirm} startIcon={<EditIcon />}>
          Proceed to Amend
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function TrackDialog({ open, onClose, amendments, loading }) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1, fontWeight: 700 }}>
        <HistoryIcon /> Amendment History
      </DialogTitle>
      <Divider />
      <DialogContent sx={{ pt: 2 }}>
        {loading ? <LinearProgress /> : amendments.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", py: 3 }}>No amendments recorded.</Typography>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            {amendments.map((a, i) => (
              <Box key={a.id || i} sx={{ p: 1.5, border: "1px solid #e2e8f0", borderRadius: 2, bgcolor: i % 2 === 0 ? "#ffffff" : "#f8fafc" }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.5 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, fontSize: "0.85rem" }}>{a.amended_by || "System"}</Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.78rem" }}>
                    {a.amendment_date ? new Date(a.amendment_date).toLocaleString() : "—"}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.82rem", whiteSpace: "pre-wrap" }}>
                  {a.change_summary || "No details"}
                </Typography>
              </Box>
            ))}
          </Box>
        )}
      </DialogContent>
      <Divider />
      <DialogActions sx={{ px: 3, py: 1.5 }}>
        <Button variant="outlined" onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}

export default function RequisitionList() {
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
  const [trackTarget, setTrackTarget] = useState(null);
  const [amendments, setAmendments] = useState([]);
  const [trackLoading, setTrackLoading] = useState(false);
  const [amendConfirm, setAmendConfirm] = useState(null);

  const userRole = localStorage.getItem('userRole');
  const userPermissions = JSON.parse(localStorage.getItem('userPermissions') || '[]');
  const canAmendPr = userRole === 'ADMIN' || userPermissions.includes('PUR_PR_AMEND');

  const statusFilter = searchParams.get("status") || "";
  const title = statusFilter === "Draft" ? "PR Draft"
    : statusFilter === "Pending" ? "PR Authorization"
    : statusFilter === "Approved" ? "Approved PRs"
    : "Purchase Requisitions";

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
    } catch { showToast("Failed to load requisitions", "error"); }
    finally { setLoading(false); }
  }, [search, statusFilter, dateFrom, dateTo, year]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleConfirmApprove = async () => {
    if (!approveTarget) return;
    const target = approveTarget;
    setApproveTarget(null);
    try {
      const status = target.status === "Draft" ? "Pending" : "Approved";
      await axios.put(`${API}/${target.id}/approve`, { status });
      showToast(`Requisition ${status}`, "success");
      fetchData();
    } catch (err) { showToast(err.response?.data?.error || "Failed to update status", "error"); }
  };

  const handleTrack = async (id) => {
    setTrackTarget(id);
    setTrackLoading(true);
    try {
      const { data } = await axios.get(`${API}/${id}/amendments`);
      setAmendments(data || []);
    } catch { setAmendments([]); }
    finally { setTrackLoading(false); }
  };

  const handleConfirmReject = async () => {
    if (!rejectTarget || !rejectRemarks.trim()) return;
    const target = rejectTarget;
    setRejectTarget(null);
    setRejectRemarks("");
    try {
      await axios.put(`${API}/${target.id}/approve`, { status: "Rejected", remarks: rejectRemarks.trim() });
      showToast("Requisition Rejected", "success");
      fetchData();
    } catch (err) { showToast(err.response?.data?.error || "Failed to reject", "error"); }
  };

  const draftRows = rows.filter((r) => r.status === "Draft");
  const pendingRows = rows.filter((r) => r.status === "Pending");
  const completedRows = rows.filter((r) => r.status !== "Draft" && r.status !== "Pending");

  const filterBar = (
    <Box sx={{ display: "flex", gap: { xs: 1, sm: 2 }, mb: 2, flexWrap: "wrap", alignItems: "center" }}>
      <TextField size="small" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)}
        InputProps={{ startAdornment: <SearchIcon sx={{ mr: 0.5, color: "gray" }} /> }} sx={{ minWidth: { xs: 180, sm: 260, md: 300 }, flex: { xs: "1 1 100%", sm: "0 1 auto" } }} />
      <TextField size="small" type="date" label="Date From" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
        InputLabelProps={{ shrink: true }} sx={{ width: 150 }} />
      <TextField size="small" type="date" label="Date To" value={dateTo} onChange={(e) => setDateTo(e.target.value)}
        InputLabelProps={{ shrink: true }} sx={{ width: 150 }} />
      <TextField size="small" placeholder="Year" value={year} onChange={(e) => setYear(e.target.value.replace(/\D/g, '').slice(0, 4))} sx={{ width: 100 }} />
      {(dateFrom || dateTo) && (
        <Button size="small" variant="text" onClick={() => { const d = new Date(); const ma = new Date(d); ma.setMonth(ma.getMonth() - 1); setDateFrom(ma.toISOString().split("T")[0]); setDateTo(d.toISOString().split("T")[0]); }}>Reset</Button>
      )}
      <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={() => navigate("/purchase/requisitions/add")} sx={{ whiteSpace: "nowrap", fontSize: { xs: "0.78rem", sm: "0.82rem" } }}>New Requisition</Button>
      <Button variant="outlined" size="small" startIcon={<RefreshIcon />} onClick={fetchData} sx={{ whiteSpace: "nowrap", fontSize: { xs: "0.78rem", sm: "0.82rem" } }}>Refresh</Button>
      {!statusFilter && <Button size="small" variant="text" onClick={() => navigate("/purchase/requisitions?status=Draft")} sx={{ fontSize: { xs: "0.75rem", sm: "0.82rem" } }}>Drafts</Button>}
      {!statusFilter && <Button size="small" variant="text" onClick={() => navigate("/purchase/requisitions?status=Pending")} sx={{ fontSize: { xs: "0.75rem", sm: "0.82rem" } }}>Authorization</Button>}
      {!statusFilter && <Button size="small" variant="text" onClick={() => navigate("/purchase/requisitions?status=Approved")} sx={{ fontSize: { xs: "0.75rem", sm: "0.82rem" } }}>Approved</Button>}
      {statusFilter && <Button size="small" variant="text" onClick={() => navigate("/purchase/requisitions")} sx={{ fontSize: { xs: "0.75rem", sm: "0.82rem" } }}>Clear Filter</Button>}
    </Box>
  );

  return (
    <Box sx={{ p: { xs: 1.5, sm: 2, md: 3 } }}>
      <Typography variant="h4" sx={{ mb: { xs: 1.5, sm: 2, md: 3 }, fontWeight: "bold", color: "var(--heading-color)", fontSize: { xs: "1.2rem", sm: "1.3rem", md: "1.5rem" } }}>{title}</Typography>

      {statusFilter ? (
        <>
          <Card sx={{ borderRadius: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
            <CardContent>
              {filterBar}
              <PRTable rows={rows} expandedId={expandedId} setExpandedId={setExpandedId}
                onApproveClick={(r) => setApproveTarget(r)} onRejectClick={(r) => { setRejectTarget(r); setRejectRemarks(""); }}
                onTrackClick={handleTrack} onAmendClick={(r) => setAmendConfirm(r)}
                navigate={navigate} loading={loading} canAmendPr={canAmendPr} />
            </CardContent>
          </Card>
        </>
      ) : (
        <>
          <Card sx={{ borderRadius: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.08)", mb: 3 }}>
            <CardContent>
              {filterBar}
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "var(--heading-color)", fontSize: { xs: "0.85rem", sm: "0.95rem" }, mb: 1 }}>
                PRs in Draft ({draftRows.length})
              </Typography>
              <PRTable rows={draftRows} expandedId={expandedId} setExpandedId={setExpandedId}
                onApproveClick={(r) => setApproveTarget(r)} onRejectClick={(r) => { setRejectTarget(r); setRejectRemarks(""); }}
                onTrackClick={handleTrack} onAmendClick={(r) => setAmendConfirm(r)}
                navigate={navigate} loading={loading} canAmendPr={canAmendPr} />
            </CardContent>
          </Card>

          {pendingRows.length > 0 && (
            <Card sx={{ borderRadius: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.08)", mb: 3, borderLeft: "4px solid #f59e0b" }}>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "var(--heading-color)", fontSize: { xs: "0.85rem", sm: "0.95rem" } }}>
                    Authorization Pending
                  </Typography>
                  <Chip label={`${pendingRows.length} pending`} size="small" color="warning" sx={{ fontSize: "0.72rem" }} />
                </Box>
                <PRTable rows={pendingRows} expandedId={expandedId} setExpandedId={setExpandedId}
                  onApproveClick={(r) => setApproveTarget(r)} onRejectClick={(r) => { setRejectTarget(r); setRejectRemarks(""); }}
                  onTrackClick={handleTrack} onAmendClick={(r) => setAmendConfirm(r)}
                  navigate={navigate} loading={loading} canAmendPr={canAmendPr} />
              </CardContent>
            </Card>
          )}

          <Card sx={{ borderRadius: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "var(--heading-color)", fontSize: { xs: "0.85rem", sm: "0.95rem" } }}>
                  Completed / Approved
                </Typography>
                <Chip label={`${completedRows.length} record(s)`} size="small" color="success" sx={{ fontSize: "0.72rem" }} />
              </Box>
              <PRTable rows={completedRows} expandedId={expandedId} setExpandedId={setExpandedId}
                onApproveClick={(r) => setApproveTarget(r)} onRejectClick={(r) => { setRejectTarget(r); setRejectRemarks(""); }}
                onTrackClick={handleTrack} onAmendClick={(r) => setAmendConfirm(r)}
                navigate={navigate} loading={loading} canAmendPr={canAmendPr} />
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

      <TrackDialog open={Boolean(trackTarget)} onClose={() => setTrackTarget(null)}
        amendments={amendments} loading={trackLoading} />

      <AmendConfirmDialog row={amendConfirm} open={Boolean(amendConfirm)}
        onClose={() => setAmendConfirm(null)}
        onConfirm={() => { const r = amendConfirm; setAmendConfirm(null); if (r) navigate(`/purchase/requisitions/edit/${r.id}?mode=amend`); }} />
    </Box>
  );
}
