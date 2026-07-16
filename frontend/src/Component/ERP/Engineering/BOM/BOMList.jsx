import React, { useEffect, useState, useCallback } from 'react';
import {
  Box, Card, CardContent, Typography, TextField, Button, Chip, LinearProgress, Grid,
  Tooltip, IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
  Table, TableHead, TableRow, TableCell, TableBody,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from '@mui/icons-material/Search';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import RequestQuoteIcon from '@mui/icons-material/RequestQuote';
import axios from 'axios';
import { useToast } from '../../../../context/ToastContext';
import { useNavigate } from 'react-router-dom';

const API = '/api/erp/engineering/bom';

const statusColors = { Active: 'success', Inactive: 'default', Draft: 'info' };

const fmt = (n) => Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function BOMList() {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [explodeOpen, setExplodeOpen] = useState(false);
  const [explodeData, setExplodeData] = useState([]);
  const [explodeLoading, setExplodeLoading] = useState(false);
  const [explodeQty, setExplodeQty] = useState(100);
  const [costingOpen, setCostingOpen] = useState(false);
  const [costingData, setCostingData] = useState(null);
  const [costingLoading, setCostingLoading] = useState(false);
  const [costingQty, setCostingQty] = useState(100);
  const [importing, setImporting] = useState(false);
  const fileRef = React.useRef(null);

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

  const handleExplode = async (bomId) => {
    setExplodeLoading(true);
    setExplodeOpen(true);
    try {
      const { data } = await axios.get(`${API}/${bomId}/explode`, { params: { quantity: explodeQty } });
      setExplodeData(data);
    } catch { showToast('Failed to explode BOM', 'error'); setExplodeOpen(false); }
    finally { setExplodeLoading(false); }
  };

  const handleCosting = async (bomId) => {
    setCostingLoading(true);
    setCostingOpen(true);
    try {
      const { data } = await axios.get(`${API}/${bomId}/costing`, { params: { quantity: costingQty } });
      setCostingData(data);
    } catch { showToast('Failed to compute costing', 'error'); setCostingOpen(false); }
    finally { setCostingLoading(false); }
  };

  const columns = [
    { field: 'bom_no', headerName: 'BOM #', width: 130 },
    { field: 'bom_name', headerName: 'Name', width: 200 },
    { field: 'product_code', headerName: 'Product Code', width: 130 },
    { field: 'product_name', headerName: 'Product Name', width: 200 },
    { field: 'product', headerName: 'Product (Master)', width: 160, valueGetter: (v) => v?.part_name || '-' },
    { field: 'output_quantity', headerName: 'Output', width: 80 },
    { field: 'version', headerName: 'Ver', width: 60 },
    { field: 'items', headerName: 'Items', width: 70, valueGetter: (v) => v?.length || 0 },
    {
      field: 'status', headerName: 'Status', width: 100,
      renderCell: (p) => <Chip label={p.value} size="small" color={statusColors[p.value] || 'default'} />,
    },
    {
      field: 'actions', headerName: 'Actions', width: 180, sortable: false,
      renderCell: (p) => (
        <>
          <Tooltip title="View"><IconButton size="small" onClick={() => navigate(`/engineering/bom/view/${p.row.id}`)}><VisibilityIcon fontSize="small" /></IconButton></Tooltip>
           <Tooltip title="Edit"><IconButton size="small" color="primary" onClick={() => navigate(`/engineering/bom/edit/${p.row.id}`)}><EditIcon fontSize="small" /></IconButton></Tooltip>
           <Tooltip title="Explode BOM"><IconButton size="small" color="info" onClick={() => handleExplode(p.row.id)}><AccountTreeIcon fontSize="small" /></IconButton></Tooltip>
           <Tooltip title="Costing"><IconButton size="small" color="success" onClick={() => handleCosting(p.row.id)}><RequestQuoteIcon fontSize="small" /></IconButton></Tooltip>
         </>
      ),
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold', color: 'var(--heading-color)' }}>Bill of Materials</Typography>
      <Card sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <TextField size="small" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)}
              InputProps={{ startAdornment: <SearchIcon sx={{ mr: 1, color: 'gray' }} /> }} sx={{ minWidth: 300 }} />
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/engineering/bom/add')}>New BOM</Button>
            <Button variant="outlined" startIcon={<UploadFileIcon />} onClick={() => fileRef.current?.click()} disabled={importing}>
              {importing ? 'Importing...' : 'Import Excel'}
            </Button>
            <input
              ref={fileRef}
              type="file"
              accept=".xlsx,.xls"
              style={{ display: 'none' }}
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                setImporting(true);
                const fd = new FormData();
                fd.append('file', file);
                try {
                  const { data } = await axios.post(`${API}/import`, fd, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                  });
                  showToast(`Imported ${data.summary.length} BOM(s)`, 'success');
                  fetchData();
                } catch (err) {
                  showToast(err.response?.data?.error || 'Import failed', 'error');
                } finally {
                  setImporting(false);
                  e.target.value = '';
                }
              }}
            />
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

      <Dialog open={explodeOpen} onClose={() => setExplodeOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={2}>
            <AccountTreeIcon /> Exploded BOM
            <TextField type="number" size="small" label="Qty" value={explodeQty}
              onChange={(e) => setExplodeQty(Number(e.target.value))} sx={{ width: 100, ml: 'auto' }} />
          </Box>
        </DialogTitle>
        <DialogContent>
          {explodeLoading ? <LinearProgress /> : (
            <Table size="small" sx={{ '& th': { fontWeight: 700, bgcolor: '#f5f7fa' } }}>
              <TableHead>
                <TableRow>
                  <TableCell>Item Code</TableCell>
                  <TableCell>Item Name</TableCell>
                  <TableCell align="right">Qty</TableCell>
                  <TableCell align="right">Effective</TableCell>
                  <TableCell align="right">With Scrap</TableCell>
                  <TableCell>Color</TableCell>
                  <TableCell>Source</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {explodeData.map((m, i) => (
                  <TableRow key={i}>
                    <TableCell>{m.item_code}</TableCell>
                    <TableCell>{m.item_name}</TableCell>
                    <TableCell align="right">{Number(m.quantity).toFixed(4)}</TableCell>
                    <TableCell align="right">{Number(m.effective_quantity).toFixed(2)}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>{Number(m.required_quantity).toFixed(2)}</TableCell>
                    <TableCell>{m.color || '-'}</TableCell>
                    <TableCell><Chip label={m.source} size="small" variant="outlined" /></TableCell>
                  </TableRow>
                ))}
                {explodeData.length === 0 && !explodeLoading && (
                  <TableRow><TableCell colSpan={7} align="center" sx={{ py: 4, color: 'gray' }}>No materials</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExplodeOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={costingOpen} onClose={() => setCostingOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={2}>
            <RequestQuoteIcon /> BOM Costing
            <TextField type="number" size="small" label="Qty" value={costingQty}
              onChange={(e) => setCostingQty(Number(e.target.value))} sx={{ width: 120, ml: 'auto' }} />
          </Box>
        </DialogTitle>
        <DialogContent>
          {costingLoading ? <LinearProgress /> : costingData && (
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>{costingData.bom_no} - {costingData.bom_name} ({costingData.product_name})</Typography>
              <Table size="small" sx={{ '& th': { fontWeight: 700, bgcolor: '#f5f7fa' }, mb: 2 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Item Code</TableCell>
                    <TableCell>Item Name</TableCell>
                    <TableCell align="right">Req Qty</TableCell>
                    <TableCell align="right">Unit Cost</TableCell>
                    <TableCell align="right">Line Cost</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {costingData.material_rows.map((m, i) => (
                    <TableRow key={i}>
                      <TableCell>{m.item_code}</TableCell>
                      <TableCell>{m.item_name}</TableCell>
                      <TableCell align="right">{Number(m.required_quantity).toFixed(4)}</TableCell>
                      <TableCell align="right">{fmt(m.unit_cost)}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>{fmt(m.line_cost)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Card variant="outlined" sx={{ bgcolor: '#fafcff' }}>
                <CardContent>
                  <Grid container spacing={1}>
                    <Grid item xs={6} md={3}><Typography variant="body2">Material Cost</Typography><Typography sx={{ fontWeight: 700 }}>₹ {fmt(costingData.summary.material_cost)}</Typography></Grid>
                    <Grid item xs={6} md={3}><Typography variant="body2">Labour Cost</Typography><Typography sx={{ fontWeight: 700 }}>₹ {fmt(costingData.summary.labour_cost)}</Typography></Grid>
                    <Grid item xs={6} md={3}><Typography variant="body2">Overhead Cost</Typography><Typography sx={{ fontWeight: 700 }}>₹ {fmt(costingData.summary.overhead_cost)}</Typography></Grid>
                    <Grid item xs={6} md={3}><Typography variant="body2">Total Cost</Typography><Typography sx={{ fontWeight: 700, color: 'primary.main' }}>₹ {fmt(costingData.summary.total_cost)}</Typography></Grid>
                    <Grid item xs={6} md={3}><Typography variant="body2">Cost / Unit</Typography><Typography sx={{ fontWeight: 700 }}>₹ {fmt(costingData.summary.cost_per_unit)}</Typography></Grid>
                    <Grid item xs={6} md={3}><Typography variant="body2">Margin %</Typography><Typography sx={{ fontWeight: 700 }}>{costingData.summary.margin_percent}%</Typography></Grid>
                    <Grid item xs={6} md={3}><Typography variant="body2">Selling Price / Unit</Typography><Typography sx={{ fontWeight: 700, color: 'green' }}>₹ {fmt(costingData.summary.selling_price)}</Typography></Grid>
                    <Grid item xs={6} md={3}><Typography variant="body2">Profit / Unit</Typography><Typography sx={{ fontWeight: 700, color: 'green' }}>₹ {fmt(costingData.summary.profit_per_unit)}</Typography></Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCostingOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
