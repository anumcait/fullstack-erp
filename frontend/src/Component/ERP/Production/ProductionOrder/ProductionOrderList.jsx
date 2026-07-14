import React, { useEffect, useState, useCallback } from 'react';
import { Box, Card, CardContent, Typography, TextField, Button, Chip, LinearProgress, Tooltip, IconButton } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from '@mui/icons-material/Search';
import axios from 'axios';
import { useToast } from '../../../../context/ToastContext';
import { useNavigate } from 'react-router-dom';

const API = '/api/erp/production/orders';

const statusColors = {
  Planning: 'info', Released: 'primary', 'In Progress': 'warning',
  Completed: 'success', Cancelled: 'error',
};

export default function ProductionOrderList() {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

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

  const handleStatusChange = async (id, status, produced_qty) => {
    try {
      await axios.put(`${API}/${id}/status`, { status, produced_quantity: produced_qty });
      showToast(`Order ${status}`, 'success');
      fetchData();
    } catch { showToast('Status update failed', 'error'); }
  };

  const columns = [
    { field: 'order_no', headerName: 'Order #', width: 130 },
    { field: 'product_code', headerName: 'Product', width: 120 },
    { field: 'product_name', headerName: 'Product Name', width: 200 },
    { field: 'planned_quantity', headerName: 'Planned', width: 90 },
    { field: 'produced_quantity', headerName: 'Produced', width: 90 },
    {
      field: 'status', headerName: 'Status', width: 120,
      renderCell: (p) => <Chip label={p.value} size="small" color={statusColors[p.value] || 'default'} />,
    },
    {
      field: 'actions', headerName: 'Actions', width: 200, sortable: false,
      renderCell: (p) => (
        <>
          <Tooltip title="View"><IconButton size="small" onClick={() => navigate(`/production/orders/view/${p.row.id}`)}><VisibilityIcon fontSize="small" /></IconButton></Tooltip>
          {p.row.status === 'Planning' && (
            <Tooltip title="Release"><IconButton size="small" color="success" onClick={() => handleStatusChange(p.row.id, 'Released')}><Chip label="Release" size="small" color="success" variant="outlined" sx={{ height: 24 }} /></IconButton></Tooltip>
          )}
          {p.row.status === 'Released' && (
            <Tooltip title="Complete"><IconButton size="small" color="primary" onClick={() => handleStatusChange(p.row.id, 'Completed', p.row.planned_quantity)}><Chip label="Complete" size="small" color="primary" variant="outlined" sx={{ height: 24 }} /></IconButton></Tooltip>
          )}
        </>
      ),
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold', color: 'var(--heading-color)' }}>Production Orders</Typography>
      <Card sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <TextField size="small" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)}
              InputProps={{ startAdornment: <SearchIcon sx={{ mr: 1, color: 'gray' }} /> }} sx={{ minWidth: 300 }} />
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/production/orders/add')}>New Order</Button>
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
