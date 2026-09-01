import React, { useEffect, useState, useCallback } from 'react';
import { Box, Card, CardContent, Typography, TextField, Button, Chip, LinearProgress, Tooltip, IconButton, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions, Table, TableHead, TableRow, TableCell, TableBody } from '@mui/material';
import StandardTable from '../../../../Component/Common/StandardTable';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from '@mui/icons-material/Search';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import PrintIcon from '@mui/icons-material/Print';
import EditIcon from '@mui/icons-material/Edit';
import TransformIcon from '@mui/icons-material/Transform';
import axios from 'axios';
import { useToast } from '../../../../context/ToastContext';
import { useNavigate } from 'react-router-dom';
import { formatQty } from '../../../../utils/format';
import PRConversionDialog from '../MaterialRequisition/PRConversionDialog';

const API = '/api/erp/stores/material-issues';

const statusColors = { Draft: 'default', Issued: 'primary', Cancelled: 'error' };

export default function MaterialIssueList() {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const urlType = new URLSearchParams(window.location.search).get('type');
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState(urlType || '');
  const [prDlg, setPrDlg] = useState({ open: false, id: null });
  const [detailsDlg, setDetailsDlg] = useState({ open: false, data: null });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      if (typeFilter) params.issue_type = typeFilter;
      const { data } = await axios.get(API, { params });
      setRows(data);
    } catch { showToast('Failed to load', 'error'); }
    finally { setLoading(false); }
  }, [search, statusFilter, typeFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleConvertToPR = useCallback((id) => {
    setPrDlg({ open: true, id });
  }, []);

  const handleDetails = useCallback(async (id) => {
    try {
      const { data } = await axios.get(API + '/' + id);
      setDetailsDlg({ open: true, data });
    } catch { showToast('Failed to load details', 'error'); }
  }, []);

  const columns = [
    { field: 'id', headerName: 'ID', width: 60, sortable: false, filterable: false, disableColumnMenu: true },
    { field: 'issue_no', headerName: 'Issue #', width: 130 },
    {
      field: 'issue_type', headerName: 'Type', width: 90,
      renderCell: (p) => <Chip label={p.value || 'General'} size="small" color={p.value === 'GRR' ? 'primary' : p.value === 'PR' ? 'warning' : 'default'} />,
    },
    { field: 'issue_date', headerName: 'Date', width: 110, valueGetter: (v) => v ? v.split('T')[0] : '' },
    { field: 'issued_to', headerName: 'Issued To', width: 150 },
    { field: 'department', headerName: 'Department', width: 130 },
    {
      field: 'requisition', headerName: 'MR #', width: 120,
      valueGetter: (p) => p?.req_no || '-',
    },
    { field: 'items', headerName: 'Items', width: 80, valueGetter: (v) => v?.length || 0 },
    {
      field: 'status', headerName: 'Status', width: 110,
      renderCell: (p) => <Chip label={p.value} size="small" color={statusColors[p.value] || 'default'} />,
    },
    {
      field: 'actions', headerName: 'Actions', width: 220, sortable: false,
      renderCell: (p) => (
        <Box>
          <Tooltip title="View Details">
            <IconButton size="small" onClick={() => handleDetails(p.row.id)}><KeyboardArrowDownIcon fontSize="small" /></IconButton>
          </Tooltip>
          <Tooltip title="Print">
            <IconButton size="small" color="default" onClick={() => navigate(`/stores/material-issues/view/${p.row.id}`)}><PrintIcon fontSize="small" /></IconButton>
          </Tooltip>
          {p.row.status === 'Draft' && (
            <Tooltip title="Edit">
              <IconButton size="small" color="primary" onClick={() => navigate(`/stores/material-issues/edit/${p.row.id}`)}><EditIcon fontSize="small" /></IconButton>
            </Tooltip>
          )}
          {p.row.status === 'Issued' && (
            <Tooltip title="Create PR for Short Items">
              <IconButton size="small" color="warning" onClick={() => handleConvertToPR(p.row.id)}><TransformIcon fontSize="small" /></IconButton>
            </Tooltip>
          )}
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold', color: 'var(--heading-color)' }}>Material Issues</Typography>
      <Card sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 1.5, mb: 2, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'flex-end' }}>
            <TextField size="small" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)}
              InputProps={{ startAdornment: <SearchIcon sx={{ mr: 1, color: 'gray' }} /> }} sx={{ minWidth: 220 }} />
            <TextField select size="small" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} sx={{ minWidth: 140 }}>
              <MenuItem value="">All Types</MenuItem>
              <MenuItem value="GRR">GRR</MenuItem>
              <MenuItem value="PR">PR</MenuItem>
              <MenuItem value="General">General</MenuItem>
            </TextField>
            <TextField select size="small" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} sx={{ minWidth: 130 }}>
              <MenuItem value="">All Status</MenuItem>
              <MenuItem value="Draft">Draft</MenuItem>
              <MenuItem value="Issued">Issued</MenuItem>
              <MenuItem value="Cancelled">Cancelled</MenuItem>
            </TextField>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate(`/stores/material-issues/add${typeFilter ? `?type=${typeFilter}` : ''}`)}>New Issue</Button>
            <Button variant="outlined" startIcon={<RefreshIcon />} onClick={fetchData}>Refresh</Button>
          </Box>
          {loading && <LinearProgress sx={{ mb: 1 }} />}
          <Box sx={{ height: 520, width: '100%' }}>
            <StandardTable
              title="Material Issue"
              rows={rows}
              columns={columns}
              getRowId={(r) => r.id}
              loading={loading}
            />
          </Box>

          <PRConversionDialog open={prDlg.open} onClose={() => setPrDlg({ open: false, id: null })}
            title="Create Purchase Requisition from Material Issue"
            previewApi={prDlg.id ? `${API}/${prDlg.id}/pr-preview` : null}
            createApi={prDlg.id ? `${API}/${prDlg.id}/create-pr` : null}
            onSuccess={() => fetchData()} />
        </CardContent>
      </Card>

      <Dialog open={detailsDlg.open} onClose={() => setDetailsDlg({ open: false, data: null })} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, fontSize: '1rem', pb: 1 }}>
          Material Issue Details
        </DialogTitle>
        {detailsDlg.data && (
          <DialogContent dividers>
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 2 }}>
              <Typography variant="body2"><strong>Issue #:</strong> {detailsDlg.data.issue_no}</Typography>
              <Typography variant="body2"><strong>Date:</strong> {detailsDlg.data.issue_date?.replace("T", " ").slice(0, 16)}</Typography>
              <Typography variant="body2"><strong>Department:</strong> {detailsDlg.data.department}</Typography>
              <Typography variant="body2"><strong>Issued To:</strong> {detailsDlg.data.issued_to}</Typography>
              <Typography variant="body2"><strong>Status:</strong> <Chip label={detailsDlg.data.status} size="small" color={statusColors[detailsDlg.data.status] || 'default'} /></Typography>
              {detailsDlg.data.requisition && (
                <Typography variant="body2"><strong>MR #:</strong> {detailsDlg.data.requisition.req_no}</Typography>
              )}
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
                  <TableCell sx={{ fontWeight: 700, bgcolor: "#f5f5f5" }}>Qty</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(detailsDlg.data.items || []).map((it, i) => (
                  <TableRow key={i} hover>
                    <TableCell>{i + 1}</TableCell>
                    <TableCell>{it.item_code}</TableCell>
                    <TableCell>{it.item_name}</TableCell>
                    <TableCell>{formatQty(it.quantity)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </DialogContent>
        )}
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={() => setDetailsDlg({ open: false, data: null })}>Close</Button>
          <Button variant="contained" onClick={() => { const id = detailsDlg.data?.id; setDetailsDlg({ open: false, data: null }); navigate(`/stores/material-issues/view/${id}`); }}>Full View</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
