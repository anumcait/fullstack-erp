import React, { useEffect, useState, useCallback } from 'react';
import { Box, Card, CardContent, Typography, TextField, Button, LinearProgress, MenuItem } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import RefreshIcon from '@mui/icons-material/Refresh';
import PrintIcon from '@mui/icons-material/Print';
import axios from 'axios';
import { useToast } from '../../../../context/ToastContext';

const LEDGER_API = '/api/erp/stores/inventory/stock-ledger';
const STATEMENT_API = '/api/erp/stores/inventory/statement';

export default function StockStatement() {
  const { showToast } = useToast();
  const [items, setItems] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [selectedItem, setSelectedItem] = useState('');
  const [selectedWarehouse, setSelectedWarehouse] = useState('');
  const [asOf, setAsOf] = useState(new Date().toISOString().slice(0, 10));
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Load item + warehouse pickers once
  useEffect(() => {
    axios.get(LEDGER_API, { params: { from: '1900-01-01', to: new Date().toISOString().slice(0, 10) } })
      .then(({ data: d }) => { setItems(d.items || []); setWarehouses(d.warehouses || []); })
      .catch(() => {});
  }, []);

  const fetchData = useCallback(async () => {
    if (!selectedItem) { showToast('Select an item first', 'warning'); return; }
    setLoading(true);
    try {
      const params = { item_id: selectedItem, from: '1900-01-01', to: asOf };
      if (selectedWarehouse) params.warehouse_id = selectedWarehouse;
      const { data: d } = await axios.get(STATEMENT_API, { params });
      setData(d);
    } catch { showToast('Failed to load statement', 'error'); }
    finally { setLoading(false); }
  }, [selectedItem, selectedWarehouse, asOf]);

  useEffect(() => { if (selectedItem) fetchData(); }, [selectedItem, selectedWarehouse, asOf]);

  const columns = [
    { field: 'ledger_date', headerName: 'Date', width: 130, renderCell: (p) => String(p.value || '').slice(0, 10) },
    { field: 'ledger_time', headerName: 'Time', width: 70 },
    { field: 'ref_type', headerName: 'Type', width: 140 },
    { field: 'doc_no', headerName: 'Doc No', width: 130 },
    { field: 'reference', headerName: 'Reference', width: 150 },
    { field: 'warehouse_name', headerName: 'Warehouse', width: 140 },
    { field: 'batch_no', headerName: 'Batch', width: 100 },
    { field: 'serial_no', headerName: 'Serial', width: 100 },
    {
      field: 'qty_in', headerName: 'Qty In', width: 100, type: 'number',
      renderCell: (p) => <span style={{ color: p.value > 0 ? '#2e7d32' : 'inherit', fontWeight: p.value > 0 ? 700 : 400 }}>{p.value}</span>,
    },
    {
      field: 'qty_out', headerName: 'Qty Out', width: 100, type: 'number',
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
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold', color: 'var(--heading-color)' }}>
        Stock Statement <Typography component="span" variant="body2" color="text.secondary">— like a bank statement</Typography>
      </Typography>

      <Card sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.08)', mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <TextField select size="small" label="Item *" value={selectedItem} onChange={(e) => setSelectedItem(e.target.value)} sx={{ minWidth: 260 }}>
              <MenuItem value=""><em>Select item</em></MenuItem>
              {items.map((it) => (
                <MenuItem key={it.id} value={it.id}>{it.item_code} - {it.item_name}</MenuItem>
              ))}
            </TextField>
            <TextField select size="small" label="Warehouse" value={selectedWarehouse} onChange={(e) => setSelectedWarehouse(e.target.value)} sx={{ minWidth: 200 }}>
              <MenuItem value=""><em>All Warehouses</em></MenuItem>
              {warehouses.map((w) => (
                <MenuItem key={w.id} value={w.id}>{w.warehouse_name}</MenuItem>
              ))}
            </TextField>
            <TextField size="small" type="date" label="As on Date" value={asOf} onChange={(e) => setAsOf(e.target.value)} InputLabelProps={{ shrink: true }} />
            <Button variant="contained" startIcon={<RefreshIcon />} onClick={fetchData}>Run</Button>
            <Button variant="outlined" startIcon={<PrintIcon />} onClick={() => window.print()}>Print</Button>
          </Box>
        </CardContent>
      </Card>

      {loading && <LinearProgress sx={{ mb: 1 }} />}

      {data && (
        <>
          <Card sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.08)', mb: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                <Box><Typography variant="caption" color="text.secondary">Opening Stock</Typography><Typography variant="h6">{data.opening_qty}</Typography><Typography variant="caption" color="text.secondary">Value: {data.opening_value}</Typography></Box>
                <Box><Typography variant="caption" color="text.secondary">Total Inward</Typography><Typography variant="h6" sx={{ color: '#2e7d32' }}>{data.total_inward}</Typography></Box>
                <Box><Typography variant="caption" color="text.secondary">Total Outward</Typography><Typography variant="h6" sx={{ color: '#d32f2f' }}>{data.total_outward}</Typography></Box>
                <Box><Typography variant="caption" color="text.secondary">Closing Stock</Typography><Typography variant="h6" sx={{ color: '#1565c0' }}>{data.closing_qty}</Typography></Box>
              </Box>
            </CardContent>
          </Card>
          <Card sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
            <CardContent>
              <Box sx={{ height: 560, width: '100%' }}>
                <DataGrid rows={data.ledger} columns={columns} getRowId={(r, i) => i} pageSizeOptions={[25, 50, 100]}
                  initialState={{ pagination: { paginationModel: { pageSize: 50 } } }} disableColumnMenu loading={loading}
                  sx={{ border: 0, '& .MuiDataGrid-columnHeaders': { bgcolor: '#f2f4f7', fontWeight: 700 } }} />
              </Box>
            </CardContent>
          </Card>
        </>
      )}
    </Box>
  );
}
