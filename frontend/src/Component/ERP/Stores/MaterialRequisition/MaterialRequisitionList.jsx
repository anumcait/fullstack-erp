import React, { useEffect, useState, useCallback } from 'react';
import { Box, Card, CardContent, Typography, TextField, Button, Chip, LinearProgress, Tooltip, IconButton, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions, Table, TableHead, TableRow, TableCell, TableBody, Checkbox } from '@mui/material';
import StandardTable from '../../../../Component/Common/StandardTable';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from '@mui/icons-material/Search';
import ReadMoreIcon from '@mui/icons-material/ReadMore';
import PrintIcon from '@mui/icons-material/Print';
import EditIcon from '@mui/icons-material/Edit';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BlockIcon from '@mui/icons-material/Block';
import InventoryIcon from '@mui/icons-material/Inventory';
import SendIcon from '@mui/icons-material/Send';
import axios from 'axios';
import { useToast } from '../../../../context/ToastContext';
import { useNavigate } from 'react-router-dom';
import { formatQty } from '../../../../utils/format';
import PRConversionDialog from './PRConversionDialog';

const API = '/api/erp/stores/material-requisitions';

const statusColors = {
  Draft: 'default', Pending: 'info', Approved: 'success',
  'Partially Issued': 'warning', Issued: 'primary', Closed: 'secondary', Cancelled: 'error',
};

export default function MaterialRequisitionList() {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [confirm, setConfirm] = useState({ open: false, data: null, action: 'approve' });
  const [rejectReason, setRejectReason] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);
  const [actionLoading, setActionLoading] = useState(false);
  const [stockDlg, setStockDlg] = useState({ open: false, data: null });
  const [submitDlg, setSubmitDlg] = useState({ open: false, data: null });
  const [submitLoading, setSubmitLoading] = useState(false);
  const [detailsDlg, setDetailsDlg] = useState({ open: false, data: null });
  const [prDlg, setPrDlg] = useState({ open: false, id: null });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      const { data } = await axios.get(API, { params });
      setRows(data.map(function (r, i) { return { ...r, sl_no: i + 1 }; }));
    } catch { showToast('Failed to load', 'error'); }
    finally { setLoading(false); }
  }, [search, statusFilter]);

  const handleSubmitForApproval = async (id) => {
    try {
      const { data } = await axios.get(`${API}/${id}`);
      setSubmitDlg({ open: true, data });
    } catch { showToast('Failed to load details', 'error'); }
  };

  const confirmSubmit = async () => {
    if (!submitDlg.data) return;
    setSubmitLoading(true);
    try {
      await axios.put(`${API}/${submitDlg.data.id}/submit`);
      showToast('Submitted for approval', 'success');
      setSubmitDlg({ open: false, data: null });
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to submit', 'error');
    } finally { setSubmitLoading(false); }
  };

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleConvertToPR = (id) => {
    setPrDlg({ open: true, id });
  };

  const handleApproveClick = async (id, action) => {
    try {
      const { data } = await axios.get(`${API}/${id}`);
      setConfirm({ open: true, data, action });
      setRejectReason('');
      setSelectedItems((data.items || []).map(function (it) { return it.id; }));
    } catch { showToast('Failed to load details', 'error'); }
  };

  const confirmAction = async () => {
    setActionLoading(true);
    try {
      if (confirm.action === 'approve') {
        const items = (confirm.data.items || []).filter(function (it) { return selectedItems.includes(it.id); }).map(function (it) { return { id: it.id, item_status: 'Approved' }; });
        const rejectedItems = (confirm.data.items || []).filter(function (it) { return !selectedItems.includes(it.id); }).map(function (it) { return { id: it.id, item_status: 'Cancelled', remarks: 'Rejected during approval' }; });
        await axios.put(`${API}/${confirm.data.id}/approve-items`, { items: items.concat(rejectedItems) });
        showToast('Items approved', 'success');
      } else {
        if (!rejectReason.trim()) { showToast('Please provide a rejection reason', 'warning'); setActionLoading(false); return; }
        const items = (confirm.data.items || []).filter(function (it) { return selectedItems.includes(it.id); }).map(function (it) { return { id: it.id, item_status: 'Cancelled', remarks: rejectReason.trim() }; });
        await axios.put(`${API}/${confirm.data.id}/approve-items`, { items });
        showToast('Items rejected', 'success');
      }
      setConfirm({ open: false, data: null });
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed', 'error');
    } finally { setActionLoading(false); }
  };

  const columns = [
    { field: 'sl_no', headerName: 'SL#', width: 60, sortable: false, filterable: false, disableColumnMenu: true },
    { field: 'req_no', headerName: 'MR #', width: 130 },
    { field: 'req_date', headerName: 'Date', width: 160, valueGetter: (v) => v ? v.replace('T', ' ').slice(0, 16) : '' },
    { field: 'department', headerName: 'Department', width: 140 },
    { field: 'requested_by', headerName: 'Requested By', width: 140 },
    { field: 'items', headerName: 'Items', width: 80, valueGetter: (v) => v?.length || 0 },
    {
      field: 'status', headerName: 'Status', width: 140,
      renderCell: (p) => <Chip label={p.value} size="small" color={statusColors[p.value] || 'default'} />,
    },
    {
      field: 'actions', headerName: 'Actions', width: 370, sortable: false,
      renderCell: (p) => (
        <>
          <Tooltip title="View Details">
            <IconButton size="small" onClick={async function () {
              try { var res = await axios.get(API + '/' + p.row.id); setDetailsDlg({ open: true, data: res.data }); }
              catch { showToast('Failed to load details', 'error'); }
            }}>
              <KeyboardArrowDownIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Print / PDF"><IconButton size="small" color="default" onClick={() => navigate(`/stores/material-requisitions/print/${p.row.id}`)}><PrintIcon fontSize="small" /></IconButton></Tooltip>
          <Tooltip title="Check Stock">
            <IconButton size="small" color="info" onClick={() => handleStockCheck(p.row.id)}><InventoryIcon fontSize="small" /></IconButton>
          </Tooltip>
          {p.row.status && p.row.status.toLowerCase() === 'draft' && (
            <>
              <Tooltip title="Edit">
                <IconButton size="small" color="primary" onClick={() => navigate(`/stores/material-requisitions/edit/${p.row.id}`)}><EditIcon fontSize="small" /></IconButton>
              </Tooltip>
              <Tooltip title="Submit for Approval">
                <IconButton size="small" color="warning" onClick={() => handleSubmitForApproval(p.row.id)}><SendIcon fontSize="small" /></IconButton>
              </Tooltip>
            </>
          )}
          {p.row.status && p.row.status.toLowerCase() === 'pending' && (
            <>
              <Tooltip title="Approve">
                <IconButton size="small" color="success" onClick={() => handleApproveClick(p.row.id, 'approve')}><CheckCircleIcon fontSize="small" /></IconButton>
              </Tooltip>
              <Tooltip title="Reject">
                <IconButton size="small" color="error" onClick={() => handleApproveClick(p.row.id, 'reject')}><BlockIcon fontSize="small" /></IconButton>
              </Tooltip>
            </>
          )}
          {p.row.status && p.row.status.toLowerCase() === 'approved' && (
            <Tooltip title="Convert to PR (insufficient stock only)">
              <IconButton size="small" color="primary" onClick={() => handleConvertToPR(p.row.id)}><ReadMoreIcon fontSize="small" /></IconButton>
            </Tooltip>
          )}
        </>
      ),
    },
  ];

  const handleStockCheck = async (id) => {
    try {
      const { data } = await axios.get(`${API}/${id}/stock-check`);
      setStockDlg({ open: true, data });
    } catch {
      showToast('Stock check failed', 'error');
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold', color: 'var(--heading-color)' }}>Material Requisitions</Typography>
      <Card sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
        <CardContent>
          <Box sx={{ display: "flex", gap: 1.5, mb: 2, flexWrap: "wrap", alignItems: "center", justifyContent: "flex-end" }}>
            <TextField size="small" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)}
              InputProps={{ startAdornment: <SearchIcon sx={{ mr: 1, color: 'gray' }} /> }} sx={{ minWidth: 220 }} />
            <TextField select size="small" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} sx={{ minWidth: 130 }}>
              <MenuItem value="">All Status</MenuItem>
              <MenuItem value="Draft">Draft</MenuItem>
              <MenuItem value="Pending">Pending</MenuItem>
              <MenuItem value="Approved">Approved</MenuItem>
              <MenuItem value="Closed">Closed</MenuItem>
            </TextField>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/stores/material-requisitions/add')}>New Requisition</Button>
            <Button variant="outlined" startIcon={<RefreshIcon />} onClick={fetchData}>Refresh</Button>
          </Box>
          {loading && <LinearProgress sx={{ mb: 1 }} />}
          <Box sx={{ height: 520, width: '100%' }}>
            <StandardTable
              title="Material Requisition"
              rows={rows}
              columns={columns}
              getRowId={(r) => r.id}
              loading={loading}
            />
          </Box>
        </CardContent>
      </Card>

      <Dialog open={detailsDlg.open} onClose={() => setDetailsDlg({ open: false, data: null })} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, fontSize: '1rem', pb: 1 }}>
          Material Requisition Details
        </DialogTitle>
        {detailsDlg.data && (
          <DialogContent dividers>
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 2 }}>
              <Typography variant="body2"><strong>MR #:</strong> {detailsDlg.data.req_no}</Typography>
              <Typography variant="body2"><strong>Date:</strong> {detailsDlg.data.req_date?.replace("T", " ").slice(0, 16)}</Typography>
              <Typography variant="body2"><strong>Department:</strong> {detailsDlg.data.department}</Typography>
              <Typography variant="body2"><strong>Requested By:</strong> {detailsDlg.data.requested_by}</Typography>
              <Typography variant="body2"><strong>Status:</strong> <Chip label={detailsDlg.data.status} size="small" color={statusColors[detailsDlg.data.status] || 'default'} /></Typography>
            </Box>
            {detailsDlg.data.remarks && (
              <Typography variant="body2" sx={{ mb: 2 }}><strong>Remarks:</strong> {detailsDlg.data.remarks}</Typography>
            )}
            <Table size="small" sx={{ border: "1px solid #e0e0e0", "& td, & th": { border: "1px solid #e0e0e0", px: 1, py: 0.5, fontSize: "0.8rem" } }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, bgcolor: "#f5f5f5" }}>#</TableCell>
                  <TableCell sx={{ fontWeight: 700, bgcolor: "#f5f5f5" }}>Item Code</TableCell>
                  <TableCell sx={{ fontWeight: 700, bgcolor: "#f5f5f5" }}>Description</TableCell>
                  <TableCell sx={{ fontWeight: 700, bgcolor: "#f5f5f5" }}>UOM</TableCell>
                  <TableCell sx={{ fontWeight: 700, bgcolor: "#f5f5f5" }}>Qty</TableCell>
                  <TableCell sx={{ fontWeight: 700, bgcolor: "#f5f5f5" }}>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(detailsDlg.data.items || []).map((it, i) => (
                  <TableRow key={i} hover>
                    <TableCell>{i + 1}</TableCell>
                    <TableCell>{it.item_code}</TableCell>
                    <TableCell>{it.item_name}</TableCell>
                    <TableCell>{it.uom}</TableCell>
                    <TableCell>{formatQty(it.quantity)}</TableCell>
                    <TableCell><Chip label={it.item_status || 'Draft'} size="small" color={it.item_status === 'Pending' ? 'info' : 'default'} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </DialogContent>
        )}
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={() => setDetailsDlg({ open: false, data: null })}>Close</Button>
          <Button variant="contained" onClick={() => { const id = detailsDlg.data?.id; setDetailsDlg({ open: false, data: null }); navigate(`/stores/material-requisitions/print/${id}`); }}>Print</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={confirm.open} onClose={() => setConfirm({ open: false, data: null })} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, fontSize: '1rem', pb: 1 }}>
          {confirm.action === 'approve' ? 'Approve' : 'Reject'} Material Requisition
        </DialogTitle>
        {confirm.data && (
          <DialogContent dividers>
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 2 }}>
              <Typography variant="body2"><strong>MR #:</strong> {confirm.data.req_no}</Typography>
              <Typography variant="body2"><strong>Date:</strong> {confirm.data.req_date?.split("T")[0]}</Typography>
              <Typography variant="body2"><strong>Department:</strong> {confirm.data.department}</Typography>
              <Typography variant="body2"><strong>Requested By:</strong> {confirm.data.requested_by}</Typography>
              <Typography variant="body2"><strong>Status:</strong> {confirm.data.status}</Typography>
            </Box>
            {confirm.data.remarks && (
              <Typography variant="body2" sx={{ mb: 2 }}><strong>Remarks:</strong> {confirm.data.remarks}</Typography>
            )}
            <Typography variant="caption" sx={{ display: 'block', mb: 1, color: 'text.secondary' }}>
              {selectedItems.length} of {(confirm.data.items || []).length} items selected
            </Typography>
            <Table size="small" sx={{ border: "1px solid #e0e0e0", mb: 2, "& td, & th": { border: "1px solid #e0e0e0", px: 1, py: 0.5, fontSize: "0.8rem" } }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, bgcolor: "#f5f5f5", textAlign: "center" }}>
                    <Checkbox size="small" checked={selectedItems.length === (confirm.data.items || []).length && (confirm.data.items || []).length > 0}
                      indeterminate={selectedItems.length > 0 && selectedItems.length < (confirm.data.items || []).length}
                      onChange={function () {
                        if (selectedItems.length === (confirm.data.items || []).length) setSelectedItems([]);
                        else setSelectedItems((confirm.data.items || []).map(function (it) { return it.id; }));
                      }} />
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, bgcolor: "#f5f5f5" }}>#</TableCell>
                  <TableCell sx={{ fontWeight: 700, bgcolor: "#f5f5f5" }}>Item Code</TableCell>
                  <TableCell sx={{ fontWeight: 700, bgcolor: "#f5f5f5" }}>Description</TableCell>
                  <TableCell sx={{ fontWeight: 700, bgcolor: "#f5f5f5" }}>UOM</TableCell>
                  <TableCell sx={{ fontWeight: 700, bgcolor: "#f5f5f5" }}>Qty</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(confirm.data.items || []).map((it, i) => (
                  <TableRow key={i} hover sx={{ bgcolor: selectedItems.includes(it.id) ? '#f0fdf4' : '#fff' }}>
                    <TableCell sx={{ textAlign: "center" }}>
                      <Checkbox size="small" checked={selectedItems.includes(it.id)}
                        onChange={function () {
                          setSelectedItems(function (prev) {
                            if (prev.includes(it.id)) return prev.filter(function (id) { return id !== it.id; });
                            return prev.concat([it.id]);
                          });
                        }} />
                    </TableCell>
                    <TableCell>{i + 1}</TableCell>
                    <TableCell>{it.item_code}</TableCell>
                    <TableCell>{it.item_name}</TableCell>
                    <TableCell>{it.uom}</TableCell>
                    <TableCell>{formatQty(it.quantity)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {confirm.action === 'reject' && (
              <TextField label="Rejection Reason *" size="small" fullWidth multiline rows={2}
                value={rejectReason} onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Enter reason for rejection..." sx={{ mt: 1 }} />
            )}
          </DialogContent>
        )}
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={() => setConfirm({ open: false, data: null })}>Close</Button>
          <Button onClick={confirmAction} variant="contained"
            color={confirm.action === 'approve' ? 'success' : 'error'}
            disabled={actionLoading || selectedItems.length === 0}>
            {actionLoading ? "Processing..." : confirm.action === 'approve' ? `Approve (${selectedItems.length})` : `Reject (${selectedItems.length})`}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={submitDlg.open} onClose={() => setSubmitDlg({ open: false, data: null })} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, fontSize: '1rem', pb: 1 }}>
          Submit for Approval
        </DialogTitle>
        {submitDlg.data && (
          <DialogContent dividers>
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 2 }}>
              <Typography variant="body2"><strong>MR #:</strong> {submitDlg.data.req_no}</Typography>
              <Typography variant="body2"><strong>Date:</strong> {submitDlg.data.req_date?.split("T")[0]}</Typography>
              <Typography variant="body2"><strong>Department:</strong> {submitDlg.data.department}</Typography>
              <Typography variant="body2"><strong>Requested By:</strong> {submitDlg.data.requested_by}</Typography>
              <Typography variant="body2"><strong>Status:</strong> {submitDlg.data.status}</Typography>
            </Box>
            {submitDlg.data.remarks && (
              <Typography variant="body2" sx={{ mb: 2 }}><strong>Remarks:</strong> {submitDlg.data.remarks}</Typography>
            )}
            <Table size="small" sx={{ border: "1px solid #e0e0e0", "& td, & th": { border: "1px solid #e0e0e0", px: 1, py: 0.5, fontSize: "0.8rem" } }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, bgcolor: "#f5f5f5" }}>#</TableCell>
                  <TableCell sx={{ fontWeight: 700, bgcolor: "#f5f5f5" }}>Item Code</TableCell>
                  <TableCell sx={{ fontWeight: 700, bgcolor: "#f5f5f5" }}>Description</TableCell>
                  <TableCell sx={{ fontWeight: 700, bgcolor: "#f5f5f5" }}>UOM</TableCell>
                  <TableCell sx={{ fontWeight: 700, bgcolor: "#f5f5f5" }}>Qty</TableCell>
                  <TableCell sx={{ fontWeight: 700, bgcolor: "#f5f5f5" }}>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(submitDlg.data.items || []).map((it, i) => (
                  <TableRow key={i} hover>
                    <TableCell>{i + 1}</TableCell>
                    <TableCell>{it.item_code}</TableCell>
                    <TableCell>{it.item_name}</TableCell>
                    <TableCell>{it.uom}</TableCell>
                    <TableCell>{formatQty(it.quantity)}</TableCell>
                    <TableCell><Chip label={it.item_status || 'Draft'} size="small" color={it.item_status === 'Pending' ? 'info' : 'default'} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </DialogContent>
        )}
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={() => setSubmitDlg({ open: false, data: null })}>Cancel</Button>
          <Button onClick={confirmSubmit} variant="contained" color="warning" disabled={submitLoading}>
            {submitLoading ? 'Submitting...' : 'Submit for Approval'}
          </Button>
        </DialogActions>
      </Dialog>

      <PRConversionDialog open={prDlg.open} onClose={() => setPrDlg({ open: false, id: null })}
        title="Create Purchase Requisition from MR"
        previewApi={prDlg.id ? `${API}/${prDlg.id}/pr-preview` : null}
        createApi={prDlg.id ? `${API}/${prDlg.id}/create-pr` : null}
        onSuccess={() => fetchData()} />

      <Dialog open={stockDlg.open} onClose={() => setStockDlg({ open: false, data: null })} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Stock Availability</DialogTitle>
        {stockDlg.data && (
          <DialogContent dividers>
            <Table size="small" sx={{ border: "1px solid #e0e0e0", "& td, & th": { border: "1px solid #e0e0e0", px: 1, py: 0.5, fontSize: "0.8rem" } }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, bgcolor: "#f5f5f5" }}>Item Code</TableCell>
                  <TableCell sx={{ fontWeight: 700, bgcolor: "#f5f5f5" }}>Description</TableCell>
                  <TableCell sx={{ fontWeight: 700, bgcolor: "#f5f5f5" }}>Requested</TableCell>
                  <TableCell sx={{ fontWeight: 700, bgcolor: "#f5f5f5" }}>Available</TableCell>
                  <TableCell sx={{ fontWeight: 700, bgcolor: "#f5f5f5" }}>Shortfall</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(stockDlg.data.items || []).map((it, i) => (
                  <TableRow key={i} sx={{ bgcolor: it.shortfall > 0 ? '#fff0f0' : '#f0fff0' }}>
                    <TableCell>{it.item_code}</TableCell>
                    <TableCell>{it.item_name}</TableCell>
                    <TableCell>{it.requested}</TableCell>
                    <TableCell>{it.available}</TableCell>
                    <TableCell sx={{ color: it.shortfall > 0 ? 'error.main' : 'success.main', fontWeight: 600 }}>
                      {it.shortfall > 0 ? it.shortfall : 'Sufficient'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Typography variant="caption" sx={{ display: 'block', mt: 1.5, color: stockDlg.data.allSufficient ? 'success.main' : 'warning.main', fontWeight: 600 }}>
              {stockDlg.data.allSufficient ? 'All items have sufficient stock.' : 'Some items have insufficient stock.'}
            </Typography>
          </DialogContent>
        )}
        <DialogActions>
          <Button onClick={() => setStockDlg({ open: false, data: null })}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}