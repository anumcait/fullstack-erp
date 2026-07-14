import React, { useEffect, useState, useCallback } from 'react';
import { Box, Card, CardContent, Typography, TextField, Button, Chip, LinearProgress, Tooltip, IconButton } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from '@mui/icons-material/Search';
import ReadMoreIcon from '@mui/icons-material/ReadMore';
import InventoryIcon from '@mui/icons-material/Inventory';
import axios from 'axios';
import { useToast } from '../../../../context/ToastContext';
import { useNavigate } from 'react-router-dom';

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
  const [stockCheckLoading, setStockCheckLoading] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = search ? { search } : {};
      const { data } = await axios.get(API, { params });
      setRows(data);
    } catch { showToast('Failed to load', 'error'); }
    finally { setLoading(false); }
  }, [search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleConvertToPR = async (id) => {
    try {
      const { data } = await axios.post(`${API}/${id}/convert-to-pr`);
      showToast(data.message, 'success');
      fetchData();
    } catch (err) {
      const msg = err.response?.data?.error || 'Conversion failed';
      showToast(msg, 'error');
    }
  };

  const handleStockCheck = async (id) => {
    setStockCheckLoading(id);
    try {
      const { data } = await axios.get(`${API}/${id}/stock-check`);
      const msgs = data.items.map((it) =>
        `${it.item_code}: req ${it.requested}, avail ${it.available}${it.shortfall > 0 ? `, shortfall ${it.shortfall}` : ', sufficient'}`
      );
      showToast(msgs.join(' | '), data.allSufficient ? 'success' : 'warning');
    } catch {
      showToast('Stock check failed', 'error');
    } finally { setStockCheckLoading(null); }
  };

  const columns = [
    { field: 'req_no', headerName: 'MR #', width: 130 },
    { field: 'req_date', headerName: 'Date', width: 110, valueGetter: (v) => v ? v.split('T')[0] : '' },
    { field: 'department', headerName: 'Department', width: 140 },
    { field: 'requested_by', headerName: 'Requested By', width: 140 },
    { field: 'items', headerName: 'Items', width: 80, valueGetter: (v) => v?.length || 0 },
    {
      field: 'status', headerName: 'Status', width: 140,
      renderCell: (p) => <Chip label={p.value} size="small" color={statusColors[p.value] || 'default'} />,
    },
    {
      field: 'actions', headerName: 'Actions', width: 200, sortable: false,
      renderCell: (p) => (
        <>
          <Tooltip title="View"><IconButton size="small" onClick={() => navigate(`/stores/material-requisitions/view/${p.row.id}`)}><VisibilityIcon fontSize="small" /></IconButton></Tooltip>
          <Tooltip title="Check Stock">
            <IconButton size="small" color="info" onClick={() => handleStockCheck(p.row.id)} disabled={stockCheckLoading === p.row.id}>
              <InventoryIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          {p.row.status === 'Approved' && (
            <Tooltip title="Convert to PR (insufficient stock only)">
              <IconButton size="small" color="primary" onClick={() => handleConvertToPR(p.row.id)}><ReadMoreIcon fontSize="small" /></IconButton>
            </Tooltip>
          )}
        </>
      ),
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold', color: 'var(--heading-color)' }}>Material Requisitions</Typography>
      <Card sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <TextField size="small" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)}
              InputProps={{ startAdornment: <SearchIcon sx={{ mr: 1, color: 'gray' }} /> }} sx={{ minWidth: 300 }} />
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/stores/material-requisitions/add')}>New Requisition</Button>
            <Button variant="outlined" startIcon={<RefreshIcon />} onClick={fetchData}>Refresh</Button>
          </Box>
          {loading && <LinearProgress sx={{ mb: 1 }} />}
          <Box sx={{ height: 520, width: '100%' }}>
            <DataGrid rows={rows} columns={columns} getRowId={(r) => r.id} pageSizeOptions={[10, 25, 50]}
              initialState={{ pagination: { paginationModel: { pageSize: 25 } } }} disableColumnMenu loading={loading}
              sx={{ border: 0, '& .MuiDataGrid-columnHeaders': { bgcolor: '#f2f4f7', fontWeight: 700 } }} />
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
