import React, { useEffect, useState, useCallback } from 'react';
import { Box, Card, CardContent, Typography, TextField, Button, LinearProgress, MenuItem } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import RefreshIcon from '@mui/icons-material/Refresh';
import axios from 'axios';
import { useToast } from '../../../../context/ToastContext';

const API = '/api/erp/stores/inventory/stock-ledger';

export default function StockLedger() {
  const { showToast } = useToast();
  const [ledger, setLedger] = useState([]);
  const [items, setItems] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [selectedItem, setSelectedItem] = useState('');
  const [selectedWarehouse, setSelectedWarehouse] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [opening, setOpening] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedItem) params.item_id = selectedItem;
      if (selectedWarehouse) params.warehouse_id = selectedWarehouse;
      if (fromDate) params.from = fromDate;
      if (toDate) params.to = toDate;
      const { data } = await axios.get(API, { params });
      setLedger(data.ledger || []);
      setItems(data.items || []);
      setWarehouses(data.warehouses || []);
      setOpening(data.opening_balance || 0);
    } catch {
      showToast('Failed to load', 'error');
    } finally {
      setLoading(false);
    }
  }, [selectedItem, selectedWarehouse, fromDate, toDate]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const columns = [
    { field: 'ledger_date', headerName: 'Date', width: 130, renderCell: (p) => String(p.value || '').slice(0, 10) },
    { field: 'ref_type', headerName: 'Type', width: 140 },
    { field: 'doc_no', headerName: 'Ref #', width: 130 },
    { field: 'item_code', headerName: 'Item Code', width: 120 },
    { field: 'item_name', headerName: 'Item Name', width: 200 },
    { field: 'warehouse_name', headerName: 'Warehouse', width: 130 },
    { field: 'batch_no', headerName: 'Batch', width: 100 },
    {
      field: 'qty_in', headerName: 'Inward', width: 100, type: 'number',
      renderCell: (p) => <span style={{ color: p.value > 0 ? '#2e7d32' : 'inherit', fontWeight: p.value > 0 ? 700 : 400 }}>{p.value}</span>,
    },
    {
      field: 'qty_out', headerName: 'Outward', width: 100, type: 'number',
      renderCell: (p) => <span style={{ color: p.value > 0 ? '#d32f2f' : 'inherit', fontWeight: p.value > 0 ? 700 : 400 }}>{p.value}</span>,
    },
    { field: 'balance_qty', headerName: 'Balance', width: 110, type: 'number', renderCell: (p) => <b>{p.value}</b> },
    { field: 'unit_cost', headerName: 'Cost', width: 100, type: 'number' },
    { field: 'selling_price', headerName: 'Selling Price', width: 110, type: 'number' },
    { field: 'stock_value', headerName: 'Value', width: 110, type: 'number' },
    { field: 'created_by', headerName: 'User', width: 120 },
    { field: 'remarks', headerName: 'Remarks', width: 200 },
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
            <TextField select size="small" label="Warehouse" value={selectedWarehouse} onChange={(e) => setSelectedWarehouse(e.target.value)} sx={{ minWidth: 200 }}>
              <MenuItem value="">-- All Warehouses --</MenuItem>
              {warehouses.map((w) => (
                <MenuItem key={w.id} value={w.id}>{w.warehouse_name}</MenuItem>
              ))}
            </TextField>
            <TextField size="small" type="date" label="From" value={fromDate} onChange={(e) => setFromDate(e.target.value)} InputLabelProps={{ shrink: true }} />
            <TextField size="small" type="date" label="To" value={toDate} onChange={(e) => setToDate(e.target.value)} InputLabelProps={{ shrink: true }} />
            <Button variant="contained" startIcon={<RefreshIcon />} onClick={fetchData}>Refresh</Button>
          </Box>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
            Opening Balance (before filter window): <b>{opening}</b>
          </Typography>
        </CardContent>
      </Card>
      {loading && <LinearProgress sx={{ mb: 1 }} />}
      <Card sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
        <CardContent>
          <Box sx={{ height: 560, width: '100%' }}>
            <DataGrid rows={ledger} columns={columns} getRowId={(r, i) => i} pageSizeOptions={[25, 50, 100]}
              initialState={{ pagination: { paginationModel: { pageSize: 50 } } }} disableColumnMenu loading={loading}
              sx={{ border: 0, '& .MuiDataGrid-columnHeaders': { bgcolor: '#f2f4f7', fontWeight: 700 } }} />
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
