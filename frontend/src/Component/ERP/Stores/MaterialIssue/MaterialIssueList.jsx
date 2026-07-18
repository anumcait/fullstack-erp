import React, { useEffect, useState, useCallback } from 'react';
import { Box, Card, CardContent, Typography, TextField, Button, Chip, LinearProgress, Tooltip, IconButton } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from '@mui/icons-material/Search';
import axios from 'axios';
import { useToast } from '../../../../context/ToastContext';
import { useNavigate } from 'react-router-dom';

const API = '/api/erp/stores/material-issues';

const statusColors = { Draft: 'default', Issued: 'primary', Cancelled: 'error' };

export default function MaterialIssueList() {
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
    { field: 'issue_no', headerName: 'Issue #', width: 130 },
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
      field: 'actions', headerName: 'Actions', width: 140, sortable: false,
      renderCell: (p) => (
        <Box>
          <Tooltip title="View"><IconButton size="small" onClick={() => navigate(`/stores/material-issues/view/${p.row.id}`)}><VisibilityIcon fontSize="small" /></IconButton></Tooltip>
          {p.row.status === 'Draft' && (
            <Tooltip title="Edit"><IconButton size="small" color="primary" onClick={() => navigate(`/stores/material-issues/edit/${p.row.id}`)}><EditIcon fontSize="small" /></IconButton></Tooltip>
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
          <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <TextField size="small" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)}
              InputProps={{ startAdornment: <SearchIcon sx={{ mr: 1, color: 'gray' }} /> }} sx={{ minWidth: 300 }} />
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/stores/material-issues/add')}>New Issue</Button>
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
