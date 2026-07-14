import React, { useEffect, useState } from 'react';
import { Box, Card, CardContent, Typography, TextField, Button, MenuItem, IconButton, Grid, LinearProgress } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import axios from 'axios';
import { useToast } from '../../../../context/ToastContext';
import { useNavigate, useParams } from 'react-router-dom';

const API = '/api/erp/stores/material-returns';
const ITEMS_API = '/api/erp/stores/items';

export default function MaterialReturnForm() {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const { id } = useParams();
  const isView = window.location.pathname.includes('/view/');

  const [header, setHeader] = useState({
    return_date: new Date().toISOString().split('T')[0],
    return_type: 'To Store',
    party_name: '',
    reference_type: '',
    reference_no: '',
    returned_by: '',
    received_by: '',
    status: 'Draft',
    remarks: '',
  });
  const [items, setItems] = useState([]);
  const [allItems, setAllItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    axios.get(ITEMS_API).then(({ data }) => setAllItems(data)).catch(() => {});
    if (id) {
      setLoading(true);
      axios.get(`${API}/${id}`).then(({ data }) => {
        setHeader({
          return_date: data.return_date?.split('T')[0] || '',
          return_type: data.return_type || 'To Store',
          party_name: data.party_name || '',
          reference_type: data.reference_type || '',
          reference_no: data.reference_no || '',
          returned_by: data.returned_by || '',
          received_by: data.received_by || '',
          status: data.status || 'Draft',
          remarks: data.remarks || '',
        });
        setItems((data.items || []).map((it) => ({
          ...it,
          item_id: it.item_id || '',
          item_code: it.item_code || '',
          item_name: it.item_name || '',
          quantity: parseFloat(it.quantity || 0),
          unit_id: it.unit_id || '',
          batch_no: it.batch_no || '',
          remarks: it.remarks || '',
        })));
      }).catch(() => showToast('Failed to load', 'error'))
        .finally(() => setLoading(false));
    }
  }, [id]);

  const handleHeaderChange = (e) => setHeader({ ...header, [e.target.name]: e.target.value });

  const addRow = () => {
    setItems([...items, { item_id: '', item_code: '', item_name: '', quantity: 0, unit_id: '', batch_no: '', remarks: '' }]);
  };

  const removeRow = (idx) => setItems(items.filter((_, i) => i !== idx));

  const handleItemChange = (idx, field, value) => {
    const updated = [...items];
    if (field === 'item_id') {
      const sel = allItems.find((it) => it.id === parseInt(value));
      updated[idx] = {
        ...updated[idx],
        item_id: parseInt(value),
        item_code: sel?.item_code || '',
        item_name: sel?.item_name || '',
        unit_id: sel?.unit_id || '',
      };
    } else {
      updated[idx][field] = value;
    }
    setItems(updated);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = { ...header, items: items.map(({ id, ...rest }) => rest) };
      await axios.post(API, payload);
      showToast('Return created successfully', 'success');
      navigate('/stores/material-returns');
    } catch { showToast('Failed to save', 'error'); }
    finally { setSaving(false); }
  };

  if (loading) return <LinearProgress />;

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <IconButton onClick={() => navigate('/stores/material-returns')}><ArrowBackIcon /></IconButton>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'var(--heading-color)' }}>
          {isView ? 'View Material Return' : 'New Material Return'}
        </Typography>
      </Box>
      <Card sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.08)', mb: 3 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <TextField fullWidth size="small" type="date" label="Return Date" name="return_date" value={header.return_date} onChange={handleHeaderChange} InputLabelProps={{ shrink: true }} disabled={isView} />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField fullWidth size="small" select label="Return Type" name="return_type" value={header.return_type} onChange={handleHeaderChange} disabled={isView}>
                <MenuItem value="To Supplier">To Supplier</MenuItem>
                <MenuItem value="To Store">To Store</MenuItem>
                <MenuItem value="To Production">To Production</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField fullWidth size="small" label="Party Name" name="party_name" value={header.party_name} onChange={handleHeaderChange} disabled={isView} />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField fullWidth size="small" label="Reference Type" name="reference_type" value={header.reference_type} onChange={handleHeaderChange} disabled={isView} />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField fullWidth size="small" label="Reference No" name="reference_no" value={header.reference_no} onChange={handleHeaderChange} disabled={isView} />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField fullWidth size="small" label="Returned By" name="returned_by" value={header.returned_by} onChange={handleHeaderChange} disabled={isView} />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField fullWidth size="small" label="Received By" name="received_by" value={header.received_by} onChange={handleHeaderChange} disabled={isView} />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField fullWidth size="small" label="Status" value={header.status} disabled />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth size="small" label="Remarks" name="remarks" value={header.remarks} onChange={handleHeaderChange} multiline rows={2} disabled={isView} />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>Return Items</Typography>
            {!isView && <Button startIcon={<AddIcon />} variant="outlined" size="small" onClick={addRow}>Add Item</Button>}
          </Box>
          {items.map((row, idx) => (
            <Grid container spacing={1} key={idx} sx={{ mb: 1, alignItems: 'center' }}>
              <Grid item xs={12} sm={3}>
                <TextField select size="small" fullWidth label="Item" value={row.item_id} onChange={(e) => handleItemChange(idx, 'item_id', e.target.value)} disabled={isView}>
                  {allItems.map((it) => (
                    <MenuItem key={it.id} value={it.id}>{it.item_code} - {it.item_name}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={6} sm={2}>
                <TextField size="small" fullWidth label="Item Code" value={row.item_code} disabled />
              </Grid>
              <Grid item xs={6} sm={2}>
                <TextField size="small" fullWidth label="Qty" type="number" value={row.quantity} onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)} disabled={isView} />
              </Grid>
              <Grid item xs={6} sm={2}>
                <TextField size="small" fullWidth label="Batch No" value={row.batch_no} onChange={(e) => handleItemChange(idx, 'batch_no', e.target.value)} disabled={isView} />
              </Grid>
              <Grid item xs={6} sm={2}>
                <TextField size="small" fullWidth label="Remarks" value={row.remarks} onChange={(e) => handleItemChange(idx, 'remarks', e.target.value)} disabled={isView} />
              </Grid>
              {!isView && (
                <Grid item xs={12} sm={1}>
                  <IconButton color="error" onClick={() => removeRow(idx)}><DeleteIcon /></IconButton>
                </Grid>
              )}
            </Grid>
          ))}
          {items.length === 0 && <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>No items added.</Typography>}
        </CardContent>
      </Card>

      {!isView && (
        <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
          <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
          <Button variant="outlined" onClick={() => navigate('/stores/material-returns')}>Cancel</Button>
        </Box>
      )}
    </Box>
  );
}
