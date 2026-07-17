import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Box, Typography, Card, CardContent, TextField, Button, Grid, IconButton,
  Table, TableHead, TableRow, TableCell, TableBody, MenuItem, LinearProgress,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import axios from 'axios';
import { useToast } from '../../../../context/ToastContext';
import CountedTextArea from '../../../Common/CountedTextArea';

const API = '/api/erp/production/orders';
const BOM_API = '/api/erp/engineering/bom';

const STATUS_OPTS = ['Planning', 'Released', 'In Progress', 'Completed', 'Cancelled'];

export default function ProductionOrderForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  const isView = location.pathname.includes('/view/');
  const isAdd = !id || location.pathname.includes('/add');

  const [loading, setLoading] = useState(false);
  const [bomList, setBomList] = useState([]);
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({
    order_no: '', bom_id: '', planned_quantity: 1, produced_quantity: 0,
    status: 'Planning', start_date: '', end_date: '', department: '', remarks: '',
  });

  useEffect(() => {
    axios.get(BOM_API).then(({ data }) => setBomList(data.filter((b) => b.status === 'Active'))).catch(() => {});
    if (id && !isAdd) {
      setLoading(true);
      axios.get(`${API}/${id}`).then(({ data }) => {
        setForm({
          order_no: data.order_no || '', bom_id: data.bom_id || '',
          planned_quantity: data.planned_quantity || 1, produced_quantity: data.produced_quantity || 0,
          status: data.status || 'Planning',
          start_date: data.start_date || '', end_date: data.end_date || '',
          department: data.department || '', remarks: data.remarks || '',
        });
        setItems(data.items || []);
      }).catch(() => showToast('Failed to load', 'error'))
      .finally(() => setLoading(false));
    }
  }, [id]);

  const handleChange = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleBomChange = (bomId) => {
    const bom = bomList.find((b) => b.id === bomId);
    if (bom) {
      setForm((f) => ({
        ...f, bom_id: bomId,
        product_item_id: bom.product_item_id, product_code: bom.product_code, product_name: bom.product_name,
      }));
      const multiplier = Number(form.planned_quantity || 1) / Number(bom.output_quantity || 1);
      setItems((bom.items || []).map((it) => ({
        ...it, required_quantity: Number(it.quantity || 0) * multiplier,
      })));
    }
  };

  const handleQtyChange = (qty) => {
    setForm((f) => ({ ...f, planned_quantity: qty }));
    const bom = bomList.find((b) => b.id === form.bom_id);
    if (bom) {
      const multiplier = Number(qty || 1) / Number(bom.output_quantity || 1);
      setItems((bom.items || []).map((it) => ({
        ...it, required_quantity: Number(it.quantity || 0) * multiplier,
      })));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(API, form);
      showToast('Production order created', 'success');
      navigate('/production/orders');
    } catch {
      showToast('Failed to create', 'error');
    } finally { setLoading(false); }
  };

  if (loading && !isAdd) return <LinearProgress />;
  const readOnly = isView;

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <IconButton onClick={() => navigate('/production/orders')}><ArrowBackIcon /></IconButton>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'var(--heading-color)' }}>
          {isView ? 'View' : 'New'} Production Order
        </Typography>
      </Box>

      <form onSubmit={handleSubmit}>
        <Card sx={{ borderRadius: 3, mb: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={6} md={2}>
                <TextField label="Order #" size="small" fullWidth value={form.order_no} disabled />
              </Grid>
              <Grid item xs={6} md={3}>
                <TextField label="BOM" select size="small" fullWidth value={form.bom_id}
                  onChange={(e) => handleBomChange(Number(e.target.value))} disabled={readOnly || !isAdd} required>
                  <MenuItem value=""><em>Select BOM</em></MenuItem>
                  {bomList.map((b) => <MenuItem key={b.id} value={b.id}>{b.bom_no} - {b.product_name}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid item xs={6} md={1}>
                <TextField label="Product Code" size="small" fullWidth value={form.product_code || ''} disabled />
              </Grid>
              <Grid item xs={6} md={2}>
                <TextField label="Product Name" size="small" fullWidth value={form.product_name || ''} disabled />
              </Grid>
              <Grid item xs={6} md={1}>
                <TextField label="Plan Qty" type="number" size="small" fullWidth value={form.planned_quantity}
                  onChange={(e) => handleQtyChange(Number(e.target.value))} disabled={readOnly || !isAdd} />
              </Grid>
              <Grid item xs={6} md={1}>
                <TextField label="Status" select size="small" fullWidth value={form.status} onChange={handleChange('status')} disabled>
                  {STATUS_OPTS.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid item xs={6} md={2}>
                <TextField label="Department" size="small" fullWidth value={form.department} onChange={handleChange('department')} disabled={readOnly} />
              </Grid>
              <Grid item xs={6} md={2}>
                <TextField label="Start Date" type="date" size="small" fullWidth value={form.start_date} onChange={handleChange('start_date')} disabled={readOnly} InputLabelProps={{ shrink: true }} />
              </Grid>
              <Grid item xs={12}>
                <CountedTextArea label="Remarks" size="small" fullWidth value={form.remarks} onChange={handleChange('remarks')} disabled={readOnly} rows={2} />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Card sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Materials Required</Typography>
            <Table size="small" sx={{ '& th': { fontWeight: 700, bgcolor: '#f5f7fa', fontSize: '0.8rem' } }}>
              <TableHead>
                <TableRow>
                  <TableCell>#</TableCell>
                  <TableCell>Item Code</TableCell>
                  <TableCell>Item Name</TableCell>
                  <TableCell>Required Qty</TableCell>
                  <TableCell>Issued Qty</TableCell>
                  <TableCell>Remarks</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.length === 0 && (
                  <TableRow><TableCell colSpan={6} align="center" sx={{ py: 4, color: 'gray' }}>Select a BOM to see required materials.</TableCell></TableRow>
                )}
                {items.map((it, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{idx + 1}</TableCell>
                    <TableCell>{it.item_code}</TableCell>
                    <TableCell>{it.item_name}</TableCell>
                    <TableCell>{Number(it.required_quantity || it.quantity || 0).toFixed(2)}</TableCell>
                    <TableCell>{Number(it.issued_quantity || 0).toFixed(2)}</TableCell>
                    <TableCell>{it.remarks || '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {isAdd && (
          <Box mt={3} display="flex" gap={2}>
            <Button type="submit" variant="contained" startIcon={<SaveIcon />} disabled={loading}>Create Order</Button>
            <Button variant="outlined" onClick={() => navigate('/production/orders')}>Cancel</Button>
          </Box>
        )}
      </form>
    </Box>
  );
}
