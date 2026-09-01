import React, { useEffect, useState, useCallback } from 'react';
import { Box, Card, CardContent, Typography, TextField, Button, Chip, LinearProgress, Tooltip, IconButton, MenuItem } from '@mui/material';
import StandardTable from '../../../Common/StandardTable.jsx';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from '@mui/icons-material/Search';
import axios from 'axios';
import { useToast } from '../../../../context/ToastContext';
import { useNavigate } from 'react-router-dom';

const API = '/api/erp/stores/gate-entry';

const statusColors = { Open: 'info', Closed: 'success', Cancelled: 'error' };
const typeColors = { Inward: 'primary', Outward: 'warning' };

export default function GateEntryList() {
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

  const columns = [
    { field: 'entry_no', headerName: 'Entry #', width: 140 },
    { field: 'entry_date', headerName: 'Date', width: 110, valueGetter: (v) => v ? v.split('T')[0] : '' },
    {
      field: 'entry_type', headerName: 'Type', width: 100,
      renderCell: (p) => <Chip label={p.value} size="small" color={typeColors[p.value] || 'default'} />,
    },
    { field: 'party_name', headerName: 'Party', width: 200 },
    { field: 'vehicle_no', headerName: 'Vehicle', width: 130 },
    { field: 'transporter', headerName: 'Transporter', width: 150 },
    {
      field: 'status', headerName: 'Status', width: 110,
      renderCell: (p) => <Chip label={p.value} size="small" color={statusColors[p.value] || 'default'} />,
    },
    {
      field: 'actions', headerName: 'Actions', width: 100, sortable: false,
      renderCell: (p) => (
        <Tooltip title="View"><IconButton size="small" onClick={() => navigate(`/stores/gate-entry/view/${p.row.id}`)}><VisibilityIcon fontSize="small" /></IconButton></Tooltip>
      ),
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold', color: 'var(--heading-color)' }}>Gate Entry</Typography>
      <Card sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <TextField size="small" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)}
              InputProps={{ startAdornment: <SearchIcon sx={{ mr: 1, color: 'gray' }} /> }} sx={{ minWidth: 300 }} />
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/stores/gate-entry/add')}>New Entry</Button>
            <Button variant="outlined" startIcon={<RefreshIcon />} onClick={fetchData}>Refresh</Button>
          </Box>
          {loading && <LinearProgress sx={{ mb: 1 }} />}
          <Box sx={{ height: 520, width: '100%' }}>
            <StandardTable title="GateEntryList" rows={rows} columns={columns} getRowId={(r) => r.id} pageSizeOptions={[10, 25, 50]}
              initialState={{ pagination: { paginationModel: { pageSize: 25 } } }} disableColumnMenu loading={loading}
              sx={{ border: 0, '& .MuiDataGrid-columnHeaders': { bgcolor: '#f2f4f7', fontWeight: 700 } }} />
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
