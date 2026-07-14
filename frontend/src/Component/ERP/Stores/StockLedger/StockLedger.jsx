import React, { useEffect, useState, useCallback } from 'react';
import { Box, Card, CardContent, Typography, TextField, Button, LinearProgress, MenuItem } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import RefreshIcon from '@mui/icons-material/Refresh';
import axios from 'axios';
import { useToast } from '../../../../context/ToastContext';

const API = '/api/erp/stores/stock-ledger';

export default function StockLedger() {
  const { showToast } = useToast();
  const [ledger, setLedger] = useState([]);
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedItem) params.item_id = selectedItem;
      if (fromDate) params.from_date = fromDate;
      if (toDate) params.to_date = toDate;
      const { data } = await axios.get(API, { params });
      setLedger(data.ledger || []);
      if (!selectedItem) setItems(data.items || []);
    } catch {
      showToast('Failed to load', 'error');
    } finally {
      setLoading(false);
    }
  }, [selectedItem, fromDate, toDate]);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    if (!selectedItem && items.length === 0) fetchData();
  }, []);

  const columns = [
    { field: 'date', headerName: 'Date', width: 110 },
    { field: 'ref_type', headerName: 'Ref Type', width: 130 },
    { field: 'ref_no', headerName: 'Ref #', width: 140 },
    { field: 'item_code', headerName: 'Item Code', width: 120 },
    { field: 'item_name', headerName: 'Item Name', width: 200 },
    {
      field: 'inward_qty', headerName: 'Inward', width: 100, type: 'number',
      cellClassName: (p) => p.value > 0 ? 'text-success' : '',
    },
    {
      field: 'outward_qty', headerName: 'Outward', width: 100, type: 'number',
      cellClassName: (p) => p.value > 0 ? 'text-danger' : '',
    },
    { field: 'balance_qty', headerName: 'Balance', width: 100, type: 'number', cellClassName: 'text-primary' },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold', color: 'var(--heading-color)' }}>Stock Ledger</Typography>
      <Card sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.08)', mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <TextField select size="small" label="Item" value={selectedItem} onChange={(e) => setSelectedItem(e.target.value)} sx={{ minWidth: 250 }}>
              <MenuItem value="">-- All Items --</MenuItem>
              {items.map((it) => (
                <MenuItem key={it.id} value={it.id}>{it.item_code} - {it.item_name}</MenuItem>
              ))}
            </TextField>
            <TextField size="small" type="date" label="From" value={fromDate} onChange={(e) => setFromDate(e.target.value)} InputLabelProps={{ shrink: true }} />
            <TextField size="small" type="date" label="To" value={toDate} onChange={(e) => setToDate(e.target.value)} InputLabelProps={{ shrink: true }} />
            <Button variant="contained" startIcon={<RefreshIcon />} onClick={fetchData}>Refresh</Button>
          </Box>
        </CardContent>
      </Card>
      {loading && <LinearProgress sx={{ mb: 1 }} />}
      <Card sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
        <CardContent>
          <Box sx={{ height: 520, width: '100%' }}>
            <DataGrid rows={ledger} columns={columns} getRowId={(r, i) => i} pageSizeOptions={[10, 25, 50]}
              initialState={{ pagination: { paginationModel: { pageSize: 25 } } }} disableColumnMenu loading={loading}
              sx={{ border: 0, '& .MuiDataGrid-columnHeaders': { bgcolor: '#f2f4f7', fontWeight: 700 } }} />
          </Box>
        </CardContent>
      </Card>
      <style>{`
        .text-success { color: #2e7d32 !important; font-weight: 600; }
        .text-danger { color: #d32f2f !important; font-weight: 600; }
        .text-primary { color: #1565c0 !important; font-weight: 600; }
      `}</style>
    </Box>
  );
}
