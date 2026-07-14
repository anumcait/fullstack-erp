import React, { useEffect, useState } from 'react';
import { Box, Card, CardContent, Typography, TextField, Button, MenuItem, IconButton, Grid, LinearProgress } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import axios from 'axios';
import { useToast } from '../../../../context/ToastContext';
import { useNavigate, useParams } from 'react-router-dom';

const API = '/api/erp/stores/gate-entry';

export default function GateEntryForm() {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const { id } = useParams();
  const isView = window.location.pathname.includes('/view/');
  const isEdit = !!id && !isView;

  const [header, setHeader] = useState({
    entry_date: new Date().toISOString().split('T')[0],
    entry_type: 'Inward',
    reference_type: '',
    reference_no: '',
    party_name: '',
    vehicle_no: '',
    driver_name: '',
    transporter: '',
    remarks: '',
    status: 'Open',
  });
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (id) {
      setLoading(true);
      axios.get(`${API}/${id}`).then(({ data }) => {
        setHeader({
          entry_date: data.entry_date?.split('T')[0] || '',
          entry_type: data.entry_type || 'Inward',
          reference_type: data.reference_type || '',
          reference_no: data.reference_no || '',
          party_name: data.party_name || '',
          vehicle_no: data.vehicle_no || '',
          driver_name: data.driver_name || '',
          transporter: data.transporter || '',
          remarks: data.remarks || '',
          status: data.status || 'Open',
        });
        setItems((data.items || []).map((it) => ({
          ...it,
          item_description: it.item_description || '',
          quantity: parseFloat(it.quantity || 0),
          unit: it.unit || '',
          remarks: it.remarks || '',
        })));
      }).catch(() => showToast('Failed to load', 'error'))
        .finally(() => setLoading(false));
    }
  }, [id]);

  const handleHeaderChange = (e) => setHeader({ ...header, [e.target.name]: e.target.value });

  const addRow = () => {
    setItems([...items, { item_description: '', quantity: 0, unit: '', remarks: '' }]);
  };

  const removeRow = (idx) => setItems(items.filter((_, i) => i !== idx));

  const handleItemChange = (idx, field, value) => {
    const updated = [...items];
    updated[idx][field] = value;
    setItems(updated);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = { ...header, items: items.map(({ id, ...rest }) => rest) };
      if (isEdit) {
        await axios.put(`${API}/${id}`, payload);
        showToast('Updated successfully', 'success');
      } else {
        await axios.post(API, payload);
        showToast('Created successfully', 'success');
      }
      navigate('/stores/gate-entry');
    } catch { showToast('Failed to save', 'error'); }
    finally { setSaving(false); }
  };

  if (loading) return <LinearProgress />;

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <IconButton onClick={() => navigate('/stores/gate-entry')}><ArrowBackIcon /></IconButton>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'var(--heading-color)' }}>
          {isView ? 'View Gate Entry' : isEdit ? 'Edit Gate Entry' : 'New Gate Entry'}
        </Typography>
      </Box>
      <Card sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.08)', mb: 3 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <TextField fullWidth size="small" type="date" label="Entry Date" name="entry_date" value={header.entry_date} onChange={handleHeaderChange} InputLabelProps={{ shrink: true }} disabled={isView} />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField fullWidth size="small" select label="Entry Type" name="entry_type" value={header.entry_type} onChange={handleHeaderChange} disabled={isView}>
                <MenuItem value="Inward">Inward</MenuItem>
                <MenuItem value="Outward">Outward</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField fullWidth size="small" label="Reference Type" name="reference_type" value={header.reference_type} onChange={handleHeaderChange} disabled={isView} />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField fullWidth size="small" label="Reference No" name="reference_no" value={header.reference_no} onChange={handleHeaderChange} disabled={isView} />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField fullWidth size="small" label="Party Name" name="party_name" value={header.party_name} onChange={handleHeaderChange} disabled={isView} />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField fullWidth size="small" label="Vehicle No" name="vehicle_no" value={header.vehicle_no} onChange={handleHeaderChange} disabled={isView} />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField fullWidth size="small" label="Driver Name" name="driver_name" value={header.driver_name} onChange={handleHeaderChange} disabled={isView} />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField fullWidth size="small" label="Transporter" name="transporter" value={header.transporter} onChange={handleHeaderChange} disabled={isView} />
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
            <Typography variant="h6" sx={{ fontWeight: 600 }}>Items</Typography>
            {!isView && <Button startIcon={<AddIcon />} variant="outlined" size="small" onClick={addRow}>Add Item</Button>}
          </Box>
          {items.map((row, idx) => (
            <Grid container spacing={1} key={idx} sx={{ mb: 1, alignItems: 'center' }}>
              <Grid item xs={12} sm={5}>
                <TextField size="small" fullWidth label="Description" value={row.item_description} onChange={(e) => handleItemChange(idx, 'item_description', e.target.value)} disabled={isView} />
              </Grid>
              <Grid item xs={6} sm={2}>
                <TextField size="small" fullWidth label="Quantity" type="number" value={row.quantity} onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)} disabled={isView} />
              </Grid>
              <Grid item xs={6} sm={2}>
                <TextField size="small" fullWidth label="Unit" value={row.unit} onChange={(e) => handleItemChange(idx, 'unit', e.target.value)} disabled={isView} />
              </Grid>
              <Grid item xs={6} sm={2}>
                <TextField size="small" fullWidth label="Remarks" value={row.remarks} onChange={(e) => handleItemChange(idx, 'remarks', e.target.value)} disabled={isView} />
              </Grid>
              {!isView && (
                <Grid item xs={6} sm={1}>
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
          <Button variant="outlined" onClick={() => navigate('/stores/gate-entry')}>Cancel</Button>
        </Box>
      )}
    </Box>
  );
}
