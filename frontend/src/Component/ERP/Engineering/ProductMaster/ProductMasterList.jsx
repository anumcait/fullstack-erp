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

const API = '/api/erp/engineering/products';

export default function ProductMasterList() {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [categories, setCategories] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (categoryFilter) params.category_id = categoryFilter;
      const { data } = await axios.get(API, { params });
      setRows(data);
    } catch { showToast('Failed to load', 'error'); }
    finally { setLoading(false); }
  }, [search, categoryFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    axios.get('/api/erp/engineering/categories').then(({ data }) => setCategories(data)).catch(() => {});
  }, []);

  const colorSwatch = (name) => {
    const map = { white: '#ffffff', black: '#222222', brown: '#8b5a2b', grey: '#9e9e9e', gray: '#9e9e9e', blue: '#1976d2', red: '#d32f2f' };
    return map[(name || '').toString().toLowerCase()] || '#bbbbbb';
  };

  const columns = [
    { field: 'product_uid', headerName: 'UID', width: 100 },
    { field: 'product_code', headerName: 'Code', width: 120 },
    { field: 'part_name', headerName: 'Part Name', width: 180 },
    { field: 'product_type', headerName: 'Type', width: 90 },
    { field: 'category', headerName: 'Category Path', width: 220, valueGetter: (v) => (v ? `${v.parent ? v.parent.name + ' / ' : ''}${v.name}` : '-') },
    { field: 'color', headerName: 'Color', width: 140, renderCell: (p) => p.value
      ? <Chip size="small" label={p.value} variant="outlined" icon={<span style={{ width: 12, height: 12, borderRadius: '50%', background: colorSwatch(p.value), border: '1px solid #ccc', display: 'inline-block' }} />} />
      : <span style={{ color: 'gray' }}>-</span> },
    { field: 'items', headerName: 'Components', width: 120, valueGetter: (v) => v?.length || 0 },
    {
      field: 'is_active', headerName: 'Active', width: 90,
      renderCell: (p) => <Chip label={p.value ? 'Yes' : 'No'} size="small" color={p.value ? 'success' : 'default'} />,
    },
    {
      field: 'actions', headerName: 'Actions', width: 130, sortable: false,
      renderCell: (p) => (
        <>
          <Tooltip title="View"><IconButton size="small" onClick={() => navigate(`/engineering/products/view/${p.row.id}`)}><VisibilityIcon fontSize="small" /></IconButton></Tooltip>
          <Tooltip title="Edit"><IconButton size="small" color="primary" onClick={() => navigate(`/engineering/products/edit/${p.row.id}`)}><EditIcon fontSize="small" /></IconButton></Tooltip>
        </>
      ),
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold', color: 'var(--heading-color)' }}>Product Master</Typography>
      <Card sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <TextField size="small" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)}
              InputProps={{ startAdornment: <SearchIcon sx={{ mr: 1, color: 'gray' }} /> }} sx={{ minWidth: 300 }} />
            <TextField size="small" select label="Category" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} sx={{ minWidth: 200 }} SelectProps={{ native: true }}>
              <option value="">All</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.parent ? c.parent.name + ' / ' : ''}{c.name}</option>)}
            </TextField>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/engineering/products/add')}>New Product</Button>
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
