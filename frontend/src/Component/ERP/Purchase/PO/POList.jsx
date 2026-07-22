import React, { useEffect, useState, useCallback } from "react";
import { Box, Card, CardContent, Typography, TextField, Button, Chip, LinearProgress, Tooltip, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Paper, Grid, Stack } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import AddIcon from "@mui/icons-material/Add";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import RefreshIcon from "@mui/icons-material/Refresh";
import SearchIcon from "@mui/icons-material/Search";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import BlockIcon from "@mui/icons-material/Block";
import axios from "axios";
import { useToast } from "../../../../context/ToastContext";
import { useNavigate, useSearchParams } from "react-router-dom";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import { downloadPoPdf } from "./poPdf";
import { formatCurrency, formatDate, formatDateTime } from '../../../../utils/format';

const API = "/api/erp/purchase/orders";

export default function POList() {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const statusFilter = searchParams.get("status") || "";
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState(() => { const d = new Date(); const m = new Date(d); m.setMonth(m.getMonth() - 1); return m.toISOString().split("T")[0]; });
  const [dateTo, setDateTo] = useState(() => new Date().toISOString().split("T")[0]);
  const [year, setYear] = useState(() => String(new Date().getFullYear()));
  const [confirm, setConfirm] = useState({ open: false, data: null, action: 'approve' });

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
    } catch { showToast("Failed to load POs", "error"); }
    finally { setLoading(false); }
  }, [search, statusFilter, dateFrom, dateTo, year]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const validateForApproval = (po) => {
    const errors = [];
    if (!po.supplier_id) errors.push("Supplier is not selected");
    if (!po.po_no) errors.push("PO number is missing");
    if (!po.po_date) errors.push("PO date is missing");
    const items = po.items || [];
    if (items.length === 0) errors.push("At least one item is required");
    else {
      items.forEach((it, i) => {
        const name = it.item_name || it.item_code || `Item #${i + 1}`;
        if (!(Number(it.quantity) > 0)) errors.push(`${name}: quantity must be greater than 0`);
        if (!(Number(it.rate) > 0)) errors.push(`${name}: unit price must be greater than 0`);
      });
    }
    return errors;
  };

  const handleApproveClick = (id) => {
    const po = rows.find((r) => r.id === id);
    const errors = validateForApproval(po || {});
    if (errors.length) {
      showToast(`Cannot approve: ${errors[0]}`, "error");
      return;
    }
    setConfirm({ open: true, data: po, action: 'approve' });
  };

  const handleCancelClick = (id) => {
    const po = rows.find((r) => r.id === id);
    setConfirm({ open: true, data: po, action: 'cancel' });
  };

  const handleRejectClick = (id) => {
    const po = rows.find((r) => r.id === id);
    setConfirm({ open: true, data: po, action: 'reject' });
  };

  const confirmAction = async () => {
    const id = confirm.data.id;
    const action = confirm.action;
    setConfirm({ open: false, data: null });
    const statusMap = { approve: 'Approved', cancel: 'Cancelled', reject: 'Rejected' };
    try {
      await axios.put(`${API}/${id}/approve`, { status: statusMap[action] });
      showToast(`PO ${statusMap[action].toLowerCase()}`, "success");
      fetchData();
    } catch { showToast("Failed to update status", "error"); }
  };

  const handleViewPdf = async (id) => {
    const newTab = window.open("", "_blank");
    try {
      const url = await downloadPoPdf(id);
      if (newTab) newTab.location.href = url;
      else window.open(url, "_blank");
    } catch {
      if (newTab) newTab.close();
      showToast("Failed to generate PDF", "error");
    }
  };

  const statusChips = [
    { value: "", label: "All" },
    { value: "Draft", label: "Drafts" },
    { value: "Approved", label: "Approved" },
    { value: "Cancelled", label: "Cancelled" },
  ];

  const columns = [
    { field: "po_no", headerName: "PO #", width: 140 },
    { field: "po_date", headerName: "Date", width: 160, valueGetter: (v) => v ? formatDateTime(v) : "" },
    { field: "supplier", headerName: "Supplier", width: 200, valueGetter: (v) => v?.supplier_name || "" },
    { field: "status", headerName: "Status", width: 120, renderCell: (p) => (
      <Chip label={p.value} size="small" color={p.value === "Approved" ? "success" : p.value === "Draft" ? "default" : p.value === "Cancelled" ? "error" : "warning"} />
    )},
    { field: "grand_total", headerName: "Amount", width: 130, valueGetter: (v) => v ? parseFloat(v).toLocaleString("en-IN", { style: "currency", currency: "INR" }) : "" },
    { field: "payment_terms", headerName: "Payment", width: 120 },
    { field: "items", headerName: "Items", width: 70, valueGetter: (v) => v?.length || 0 },
    {
      field: "actions", headerName: "Actions", width: 170, sortable: false,
      renderCell: (p) => (
        <Box sx={{ display: "flex", gap: 0.5, alignItems: "center" }}>
          <Tooltip title="View PO">
            <Button size="small" variant="outlined" startIcon={<VisibilityIcon />} onClick={(e) => { e.stopPropagation(); navigate(`/purchase/orders/view/${p.row.id}`); }}>
              View
            </Button>
          </Tooltip>
          {p.row.status === "Draft" && (
            <Tooltip title="Edit Draft">
              <IconButton size="small" color="primary" onClick={(e) => { e.stopPropagation(); navigate(`/purchase/orders/edit/${p.row.id}`); }}><EditIcon fontSize="small" /></IconButton>
            </Tooltip>
          )}
          <Tooltip title="View PO PDF">
            <IconButton size="small" color="secondary" onClick={(e) => { e.stopPropagation(); handleViewPdf(p.row.id); }}><PictureAsPdfIcon fontSize="small" /></IconButton>
          </Tooltip>
          {p.row.status === "Draft" && (
            <Tooltip title="Approve">
              <IconButton size="small" color="success" onClick={(e) => { e.stopPropagation(); handleApproveClick(p.row.id); }}><CheckCircleIcon fontSize="small" /></IconButton>
            </Tooltip>
          )}
          {p.row.status === "Draft" && (
            <Tooltip title="Reject">
              <IconButton size="small" color="warning" onClick={(e) => { e.stopPropagation(); handleRejectClick(p.row.id); }}><BlockIcon fontSize="small" /></IconButton>
            </Tooltip>
          )}
          {(p.row.status === "Draft" || p.row.status === "Approved") && (
            <Tooltip title="Cancel">
              <IconButton size="small" color="error" onClick={(e) => { e.stopPropagation(); handleCancelClick(p.row.id); }}><CancelIcon fontSize="small" /></IconButton>
            </Tooltip>
          )}
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ p: 3, maxWidth: 1600 }}>
      {/* ── Title + Action Bar ── */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, gap: 2, flexWrap: "wrap" }}>
        <Typography variant="h4" sx={{ fontWeight: "bold", color: "var(--heading-color)" }}>
          {statusFilter === "Draft" ? "Draft Purchase Orders" : "Purchase Orders"}
        </Typography>
        <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={fetchData}>Refresh</Button>
          <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={() => navigate("/purchase/orders/add")}>New PO</Button>
        </Box>
      </Box>

      <Card sx={{ borderRadius: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
        <CardContent>
          <Box sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap", alignItems: "center" }}>
            <TextField size="small" placeholder="Search PO # or supplier..." value={search} onChange={(e) => setSearch(e.target.value)}
              InputProps={{ startAdornment: <SearchIcon sx={{ mr: 1, color: "gray" }} /> }} sx={{ minWidth: 300 }} />
            <TextField size="small" type="date" label="Date From" value={dateFrom}
              onChange={(e) => { setDateFrom(e.target.value); if (dateTo && e.target.value && new Date(dateTo) - new Date(e.target.value) > 31*24*60*60*1000) setDateTo(""); }}
              InputLabelProps={{ shrink: true }} sx={{ width: 160 }} />
            <TextField size="small" type="date" label="Date To" value={dateTo}
              onChange={(e) => { setDateTo(e.target.value); if (dateFrom && e.target.value && new Date(e.target.value) - new Date(dateFrom) > 31*24*60*60*1000) setDateFrom(""); }}
              InputLabelProps={{ shrink: true }} sx={{ width: 160 }} />
            <TextField size="small" placeholder="Year (e.g. 2026)" value={year} onChange={(e) => setYear(e.target.value.replace(/\D/g, '').slice(0, 4))} sx={{ width: 140 }} />
            {(dateFrom || dateTo) && (
              <Button size="small" variant="text" onClick={() => { const d = new Date(); const ma = new Date(d); ma.setMonth(ma.getMonth() - 1); setDateFrom(ma.toISOString().split("T")[0]); setDateTo(d.toISOString().split("T")[0]); }}>Reset</Button>
            )}
            <Box sx={{ flex: 1 }} />
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
              {statusChips.map((c) => (
                <Button key={c.value || "all"} size="small"
                  variant={statusFilter === c.value ? "contained" : "text"}
                  color={c.value === "Draft" ? "warning" : c.value === "Approved" ? "success" : c.value === "Cancelled" ? "error" : "primary"}
                  onClick={() => setSearchParams(c.value ? { status: c.value } : {})}
                  sx={{ fontSize: "0.8rem" }}>
                  {c.label}
                </Button>
              ))}
            </Box>
          </Box>
          {loading && <LinearProgress sx={{ mb: 1 }} />}
          <div style={{ height: 520, width: "100%" }}>
            <DataGrid rows={rows} columns={columns} getRowId={(r) => r.id} pageSizeOptions={[10, 25, 50]}
              onRowClick={(p) => navigate(`/purchase/orders/view/${p.row.id}`)}
              initialState={{ pagination: { paginationModel: { pageSize: 25 } } }} disableColumnMenu loading={loading}
              sx={{ border: 0, "& .MuiDataGrid-columnHeaders": { bgcolor: "#f2f4f7", fontWeight: 700 },
                "& .MuiDataGrid-row:hover": { bgcolor: "#f8fafc" }, "& .MuiDataGrid-cell": { fontSize: ".92rem" } }} />
          </div>
        </CardContent>
      </Card>
      <Dialog open={confirm.open} onClose={() => setConfirm({ open: false, data: null })} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, fontSize: '1rem', pb: 1 }}>
          {confirm.action === 'approve' ? 'Approve' : confirm.action === 'reject' ? 'Reject' : 'Cancel'} Purchase Order?
        </DialogTitle>
        <DialogContent>
          {confirm.data && (
            <Stack spacing={2} sx={{ pt: 0.5 }}>
              <Paper sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'primary.main' }}>{confirm.data.po_no}</Typography>
                  <Chip label={confirm.data.status} size="small" color="warning" />
                </Stack>
                <Grid container spacing={2} sx={{ mb: 1 }}>
                  <Grid item xs={4}>
                    <Typography variant="caption" color="text.secondary">Supplier</Typography>
                    <Typography variant="body2" fontWeight={600}>{confirm.data.supplier?.supplier_name || '—'}</Typography>
                  </Grid>
                  <Grid item xs={3}>
                    <Typography variant="caption" color="text.secondary">PO Date</Typography>
                    <Typography variant="body2" fontWeight={600}>{formatDateTime(confirm.data.po_date)}</Typography>
                  </Grid>
                  <Grid item xs={3}>
                    <Typography variant="caption" color="text.secondary">Currency</Typography>
                    <Typography variant="body2" fontWeight={600}>{confirm.data.currency || 'INR'}</Typography>
                  </Grid>
                  <Grid item xs={2}>
                    <Typography variant="caption" color="text.secondary">Items</Typography>
                    <Typography variant="body2" fontWeight={600}>{(confirm.data.items || []).length}</Typography>
                  </Grid>
                </Grid>
                {(confirm.data.payment_terms || confirm.data.delivery_terms || confirm.data.subject || confirm.data.delivery_period || confirm.data.desp_to || confirm.data.insurance || confirm.data.inspection || confirm.data.freight || confirm.data.freight_forward || confirm.data.req_yn || confirm.data.ven_code || confirm.data.rem1 || confirm.data.rem2 || confirm.data.rem3 || confirm.data.any_other_terms) && (
                  <Box sx={{ mb: 1, p: 1.5, bgcolor: '#fafafa', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ mb: 0.5, textTransform: 'uppercase', letterSpacing: 0.5 }}>Terms & Conditions</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, '& > *': { flex: '1 1 30%', minWidth: 180 } }}>
                      {confirm.data.payment_terms && <Box><Typography variant="caption" color="text.secondary">Payment Terms</Typography><Typography variant="body2">{confirm.data.payment_terms}</Typography></Box>}
                      {confirm.data.desp_to && <Box><Typography variant="caption" color="text.secondary">Desp To</Typography><Typography variant="body2">{confirm.data.desp_to}</Typography></Box>}
                      {confirm.data.insurance && <Box><Typography variant="caption" color="text.secondary">Insurance</Typography><Typography variant="body2">{confirm.data.insurance}</Typography></Box>}
                      {confirm.data.subject && <Box><Typography variant="caption" color="text.secondary">Subject</Typography><Typography variant="body2">{confirm.data.subject}</Typography></Box>}
                      {confirm.data.reference && <Box><Typography variant="caption" color="text.secondary">Reference</Typography><Typography variant="body2">{confirm.data.reference}</Typography></Box>}
                      {confirm.data.ref_date && <Box><Typography variant="caption" color="text.secondary">Ref. Date</Typography><Typography variant="body2">{confirm.data.ref_date}</Typography></Box>}
                      {confirm.data.delivery_period && <Box><Typography variant="caption" color="text.secondary">Delivery Period</Typography><Typography variant="body2">{confirm.data.delivery_period}</Typography></Box>}
                      {confirm.data.inspection && <Box><Typography variant="caption" color="text.secondary">Inspection</Typography><Typography variant="body2">{confirm.data.inspection}</Typography></Box>}
                      {confirm.data.freight && <Box><Typography variant="caption" color="text.secondary">Freight</Typography><Typography variant="body2">{confirm.data.freight}</Typography></Box>}
                      {confirm.data.freight_forward && <Box><Typography variant="caption" color="text.secondary">Freight Forward</Typography><Typography variant="body2">{confirm.data.freight_forward}</Typography></Box>}
                      {confirm.data.currency_val && <Box><Typography variant="caption" color="text.secondary">Currency Val</Typography><Typography variant="body2">{confirm.data.currency_val}</Typography></Box>}
                      {confirm.data.req_yn && <Box><Typography variant="caption" color="text.secondary">Req(Y/N)</Typography><Typography variant="body2">{confirm.data.req_yn}</Typography></Box>}
                      {confirm.data.ven_code && <Box><Typography variant="caption" color="text.secondary">Ven Code</Typography><Typography variant="body2">{confirm.data.ven_code}</Typography></Box>}
                      {confirm.data.rem1 && <Box><Typography variant="caption" color="text.secondary">Rem1</Typography><Typography variant="body2">{confirm.data.rem1}</Typography></Box>}
                      {confirm.data.rem2 && <Box><Typography variant="caption" color="text.secondary">Rem2</Typography><Typography variant="body2">{confirm.data.rem2}</Typography></Box>}
                      {confirm.data.rem3 && <Box><Typography variant="caption" color="text.secondary">Rem3</Typography><Typography variant="body2">{confirm.data.rem3}</Typography></Box>}
                      {confirm.data.delivery_terms && <Box><Typography variant="caption" color="text.secondary">Delivery Terms</Typography><Typography variant="body2">{confirm.data.delivery_terms}</Typography></Box>}
                      {confirm.data.any_other_terms && <Box><Typography variant="caption" color="text.secondary">Any Other Terms</Typography><Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{confirm.data.any_other_terms}</Typography></Box>}
                      {confirm.data.qca_req && <Box><Typography variant="caption" color="text.secondary">QCA Req</Typography><Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{confirm.data.qca_req}</Typography></Box>}
                      {confirm.data.notes && <Box><Typography variant="caption" color="text.secondary">Notes</Typography><Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{confirm.data.notes}</Typography></Box>}
                    </Box>
                  </Box>
                )}
                {confirm.data.items && confirm.data.items.length > 0 && (
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ mb: 0.5 }}>Items</Typography>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
                      <thead>
                        <tr>
                          <th style={{ textAlign: 'left', padding: '4px 8px', fontWeight: 600, borderBottom: '1px solid #e2e8f0', color: '#64748b' }}>Item</th>
                          <th style={{ textAlign: 'right', padding: '4px 8px', fontWeight: 600, borderBottom: '1px solid #e2e8f0', color: '#64748b' }}>Qty</th>
                          <th style={{ textAlign: 'right', padding: '4px 8px', fontWeight: 600, borderBottom: '1px solid #e2e8f0', color: '#64748b' }}>Rate</th>
                          <th style={{ textAlign: 'right', padding: '4px 8px', fontWeight: 600, borderBottom: '1px solid #e2e8f0', color: '#64748b' }}>Disc%</th>
                          <th style={{ textAlign: 'right', padding: '4px 8px', fontWeight: 600, borderBottom: '1px solid #e2e8f0', color: '#64748b' }}>PF%</th>
                          <th style={{ textAlign: 'right', padding: '4px 8px', fontWeight: 600, borderBottom: '1px solid #e2e8f0', color: '#64748b' }}>SGST</th>
                          <th style={{ textAlign: 'right', padding: '4px 8px', fontWeight: 600, borderBottom: '1px solid #e2e8f0', color: '#64748b' }}>CGST</th>
                          <th style={{ textAlign: 'right', padding: '4px 8px', fontWeight: 600, borderBottom: '1px solid #e2e8f0', color: '#64748b' }}>IGST</th>
                          <th style={{ textAlign: 'right', padding: '4px 8px', fontWeight: 600, borderBottom: '1px solid #e2e8f0', color: '#64748b' }}>Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {confirm.data.items.map((it, idx) => (
                          <tr key={idx}>
                            <td style={{ padding: '4px 8px', borderBottom: '1px solid #f1f5f9' }}>
                              <Typography variant="body2" fontWeight={600}>{it.item_code}</Typography>
                              <Typography variant="caption" color="text.secondary">{it.item_name}</Typography>
                            </td>
                            <td style={{ padding: '4px 8px', borderBottom: '1px solid #f1f5f9', textAlign: 'right' }}>{Number(it.quantity || it.qty).toLocaleString('en-IN')}</td>
                            <td style={{ padding: '4px 8px', borderBottom: '1px solid #f1f5f9', textAlign: 'right' }}>{formatCurrency(it.rate)}</td>
                            <td style={{ padding: '4px 8px', borderBottom: '1px solid #f1f5f9', textAlign: 'right' }}>{it.disc_percent ? `${it.disc_percent}% / ${formatCurrency(it.disc_inr || it.discount_amount)}` : '—'}</td>
                            <td style={{ padding: '4px 8px', borderBottom: '1px solid #f1f5f9', textAlign: 'right' }}>{Number(it.pf_percent || 0) > 0 ? `${it.pf_percent}% / ${formatCurrency(it.pf_inr)}` : '—'}</td>
                            <td style={{ padding: '4px 8px', borderBottom: '1px solid #f1f5f9', textAlign: 'right' }}>{Number(it.sgst_inr || 0) > 0 ? `${it.sgst_rate}% / ${formatCurrency(it.sgst_inr)}` : '—'}</td>
                            <td style={{ padding: '4px 8px', borderBottom: '1px solid #f1f5f9', textAlign: 'right' }}>{Number(it.cgst_inr || 0) > 0 ? `${it.cgst_rate}% / ${formatCurrency(it.cgst_inr)}` : '—'}</td>
                            <td style={{ padding: '4px 8px', borderBottom: '1px solid #f1f5f9', textAlign: 'right' }}>{Number(it.igst_inr || 0) > 0 ? `${it.igst_rate}% / ${formatCurrency(it.igst_inr)}` : '—'}</td>
                            <td style={{ padding: '4px 8px', borderBottom: '1px solid #f1f5f9', textAlign: 'right', fontWeight: 600 }}>{formatCurrency(it.total_value || it.amount)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </Box>
                )}
                {confirm.data.items && confirm.data.items.length > 0 && confirm.data.subtotal > 0 && (() => {
                  const taxSum = confirm.data.items.reduce((acc, it) => ({
                    sgst: acc.sgst + Number(it.sgst_inr || 0),
                    cgst: acc.cgst + Number(it.cgst_inr || 0),
                    igst: acc.igst + Number(it.igst_inr || 0),
                  }), { sgst: 0, cgst: 0, igst: 0 });
                  return (
                    <Stack direction="row" justifyContent="flex-end" spacing={3} sx={{ pr: 1 }}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">Subtotal</Typography>
                        <Typography variant="body2" textAlign="right">{formatCurrency(confirm.data.subtotal)}</Typography>
                      </Box>
                      {confirm.data.discount_amount > 0 && (
                        <Box>
                          <Typography variant="caption" color="text.secondary">Discount</Typography>
                          <Typography variant="body2" textAlign="right" color="error">-{formatCurrency(confirm.data.discount_amount)}</Typography>
                        </Box>
                      )}
                      {Number(confirm.data.pf_amount || 0) > 0 && (
                        <Box>
                          <Typography variant="caption" color="text.secondary">PF</Typography>
                          <Typography variant="body2" textAlign="right">{formatCurrency(confirm.data.pf_amount)}</Typography>
                        </Box>
                      )}
                      {taxSum.sgst > 0 && (
                        <Box>
                          <Typography variant="caption" color="text.secondary">SGST</Typography>
                          <Typography variant="body2" textAlign="right">{formatCurrency(taxSum.sgst)}</Typography>
                        </Box>
                      )}
                      {taxSum.cgst > 0 && (
                        <Box>
                          <Typography variant="caption" color="text.secondary">CGST</Typography>
                          <Typography variant="body2" textAlign="right">{formatCurrency(taxSum.cgst)}</Typography>
                        </Box>
                      )}
                      {taxSum.igst > 0 && (
                        <Box>
                          <Typography variant="caption" color="text.secondary">IGST</Typography>
                          <Typography variant="body2" textAlign="right">{formatCurrency(taxSum.igst)}</Typography>
                        </Box>
                      )}
                      {(taxSum.sgst > 0 || taxSum.cgst > 0 || taxSum.igst > 0) && (
                        <Box>
                          <Typography variant="caption" color="text.secondary" fontWeight={600}>Total Tax</Typography>
                          <Typography variant="body2" textAlign="right" fontWeight={600}>{formatCurrency(taxSum.sgst + taxSum.cgst + taxSum.igst)}</Typography>
                        </Box>
                      )}
                      <Box>
                        <Typography variant="caption" color="primary.main" fontWeight={600}>Grand Total</Typography>
                        <Typography variant="body2" textAlign="right" fontWeight={700} color="primary.main">{formatCurrency(confirm.data.grand_total, confirm.data.currency)}</Typography>
                      </Box>
                    </Stack>
                  );
                })()}
              </Paper>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirm({ open: false, data: null })}>Close</Button>
          <Button onClick={confirmAction} variant="contained"
            color={confirm.action === 'approve' ? 'success' : confirm.action === 'reject' ? 'warning' : 'error'}>
            {confirm.action === 'approve' ? 'Approve' : confirm.action === 'reject' ? 'Reject' : 'Cancel PO'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
