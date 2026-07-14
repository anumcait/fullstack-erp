import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Box, Typography, Card, CardContent, TextField, Button, Grid, IconButton,
  Table, TableHead, TableRow, TableCell, TableBody, MenuItem, LinearProgress,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import axios from 'axios';
import { useToast } from '../../../../context/ToastContext';

const API = '/api/erp/stores/material-requisitions';
const ITEMS_API = '/api/erp/stores/items';
const STOCK_API = '/api/erp/stores/stock';

const DEPARTMENTS = ['Production', 'Assembly', 'Maintenance', 'Quality', 'Stores', 'Engineering', 'Admin'];

export default function MaterialRequisitionForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  const isView = location.pathname.includes('/view/');
  const isEdit = location.pathname.includes('/edit/');
  const isAdd = !id || location.pathname.includes('/add');

  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [stockMap, setStockMap] = useState({});
  const [form, setForm] = useState({
    req_no: '', req_date: new Date().toISOString().split('T')[0],
    department: '', requested_by: '', remarks: '', status: 'Draft',
  });

  const [itemMasterList, setItemMasterList] = useState([]);

  useEffect(() => {
    axios.get(ITEMS_API).then(({ data }) => setItemMasterList(data)).catch(() => {});
    axios.get(STOCK_API).then(({ data }) => {
      const map = {};
      data.forEach((it) => { map[it.id] = Number(it.current_stock || 0); });
      setStockMap(map);
    }).catch(() => {});
    if (id && !isAdd) {
      setLoading(true);
      axios.get(`${API}/${id}`).then(({ data }) => {
        setForm({
          req_no: data.req_no || '', req_date: data.req_date?.split('T')[0] || '',
          department: data.department || '', requested_by: data.requested_by || '',
          remarks: data.remarks || '', status: data.status || 'Draft',
        });
        setItems(data.items?.map((i) => ({
          tempId: Date.now() + Math.random(),
          item_id: i.item_id || '', item_code: i.item_code || '',
          item_name: i.item_name || '', quantity: i.quantity || 0,
          issued_quantity: i.issued_quantity || 0, unit_id: i.unit_id || '',
          remarks: i.remarks || '',
        })) || []);
      }).catch(() => showToast('Failed to load', 'error'))
      .finally(() => setLoading(false));
    }
  }, [id]);

  const handleChange = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const addItem = () => {
    setItems((prev) => [...prev, { tempId: Date.now(), item_id: '', item_code: '', item_name: '', quantity: 1, issued_quantity: 0, unit_id: '', remarks: '' }]);
  };

  const removeItem = (tempId) => setItems((prev) => prev.filter((i) => i.tempId !== tempId));

  const handleItemChange = (tempId, field, value) => {
    setItems((prev) => prev.map((i) => {
      if (i.tempId !== tempId) return i;
      const updated = { ...i, [field]: value };
      if (field === 'item_id') {
        const selected = itemMasterList.find((im) => im.id === value);
        if (selected) {
          updated.item_code = selected.item_code;
          updated.item_name = selected.item_name;
          updated.unit_id = selected.unit_id;
        }
      }
      return updated;
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const payload = { ...form, items };
    try {
      if (isEdit) await axios.put(`${API}/${id}`, payload);
      else await axios.post(API, payload);
      showToast(`Requisition ${isEdit ? 'updated' : 'created'}`, 'success');
      navigate('/stores/material-requisitions');
    } catch {
      showToast('Failed to save', 'error');
    } finally { setLoading(false); }
  };

  if (loading && !isAdd) return <LinearProgress />;

  const readOnly = isView || (form.status !== 'Draft' && !isAdd);

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <IconButton onClick={() => navigate('/stores/material-requisitions')}><ArrowBackIcon /></IconButton>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'var(--heading-color)' }}>
          {isView ? 'View' : isEdit ? 'Edit' : 'New'} Material Requisition
        </Typography>
      </Box>

      <form onSubmit={handleSubmit}>
        <Card sx={{ borderRadius: 3, mb: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={6} md={2}>
                <TextField label="MR #" size="small" fullWidth value={form.req_no} onChange={handleChange('req_no')}
                  disabled={readOnly || isEdit} helperText="Leave blank to auto-generate" />
              </Grid>
              <Grid item xs={6} md={2}>
                <TextField label="Date" type="date" size="small" fullWidth value={form.req_date} onChange={handleChange('req_date')}
                  disabled={readOnly} InputLabelProps={{ shrink: true }} />
              </Grid>
              <Grid item xs={6} md={2}>
                <TextField label="Department" select size="small" fullWidth value={form.department} onChange={handleChange('department')} disabled={readOnly}>
                  {DEPARTMENTS.map((d) => <MenuItem key={d} value={d}>{d}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid item xs={6} md={2}>
                <TextField label="Requested By" size="small" fullWidth value={form.requested_by} onChange={handleChange('requested_by')} disabled={readOnly} />
              </Grid>
              <Grid item xs={6} md={2}>
                <TextField label="Status" size="small" fullWidth value={form.status} disabled />
              </Grid>
              <Grid item xs={12} md={2}>
                <TextField label="Remarks" size="small" fullWidth value={form.remarks} onChange={handleChange('remarks')} disabled={readOnly} />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Card sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>Items</Typography>
              {!readOnly && <Button startIcon={<AddIcon />} onClick={addItem} size="small" variant="outlined">Add Item</Button>}
            </Box>
            <Table size="small" sx={{ '& th': { fontWeight: 700, bgcolor: '#f5f7fa', fontSize: '0.8rem' } }}>
              <TableHead>
                <TableRow>
                  <TableCell>#</TableCell>
                  <TableCell>Item Code</TableCell>
                  <TableCell sx={{ minWidth: 200 }}>Item Name</TableCell>
                  <TableCell>Stock</TableCell>
                  <TableCell>Req Qty</TableCell>
                  <TableCell>Issued</TableCell>
                  <TableCell>Pending</TableCell>
                  <TableCell>Remarks</TableCell>
                  {!readOnly && <TableCell>Action</TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {items.length === 0 && (
                  <TableRow><TableCell colSpan={9} align="center" sx={{ py: 4, color: 'gray' }}>No items. Click "Add Item" to add.</TableCell></TableRow>
                )}
                {items.map((it, idx) => {
                  const available = stockMap[it.item_id] ?? null;
                  const requested = Number(it.quantity || 0);
                  const sufficient = available !== null && available >= requested;
                  return (
                    <TableRow key={it.tempId}>
                      <TableCell>{idx + 1}</TableCell>
                      <TableCell>
                        {readOnly ? it.item_code : (
                          <TextField select size="small" fullWidth value={it.item_id} onChange={(e) => handleItemChange(it.tempId, 'item_id', Number(e.target.value))}>
                            <MenuItem value=""><em>Select</em></MenuItem>
                            {itemMasterList.map((im) => (
                              <MenuItem key={im.id} value={im.id}>
                                {im.item_code} {stockMap[im.id] !== undefined ? `(Stock: ${stockMap[im.id]})` : ''}
                              </MenuItem>
                            ))}
                          </TextField>
                        )}
                      </TableCell>
                      <TableCell>
                        {readOnly ? it.item_name : (
                          <TextField size="small" fullWidth value={it.item_name} onChange={(e) => handleItemChange(it.tempId, 'item_name', e.target.value)} />
                        )}
                      </TableCell>
                      <TableCell>
                        {available !== null ? (
                          <Typography variant="body2" sx={{
                            fontWeight: 600,
                            color: available === 0 ? 'error.main' : available < requested ? 'warning.main' : 'success.main',
                          }}>
                            {available}
                          </Typography>
                        ) : '-'}
                      </TableCell>
                      <TableCell>
                        <TextField type="number" size="small" sx={{ width: 80 }} value={it.quantity} disabled={readOnly}
                          onChange={(e) => handleItemChange(it.tempId, 'quantity', Number(e.target.value))} />
                      </TableCell>
                      <TableCell><Typography variant="body2">{it.issued_quantity}</Typography></TableCell>
                      <TableCell><Typography variant="body2">{(it.quantity || 0) - (it.issued_quantity || 0)}</Typography></TableCell>
                      <TableCell>
                        <TextField size="small" sx={{ width: 120 }} value={it.remarks} disabled={readOnly}
                          onChange={(e) => handleItemChange(it.tempId, 'remarks', e.target.value)} />
                      </TableCell>
                      {!readOnly && (
                        <TableCell>
                          <IconButton size="small" color="error" onClick={() => removeItem(it.tempId)}><DeleteIcon fontSize="small" /></IconButton>
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {!readOnly && (
          <Box mt={3} display="flex" gap={2}>
            <Button type="submit" variant="contained" startIcon={<SaveIcon />} disabled={loading}>Save</Button>
            <Button variant="outlined" onClick={() => navigate('/stores/material-requisitions')}>Cancel</Button>
          </Box>
        )}
      </form>
    </Box>
  );
}
