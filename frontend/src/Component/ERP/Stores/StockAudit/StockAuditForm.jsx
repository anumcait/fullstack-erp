import React, { useEffect, useState } from 'react';
import { Box, Card, CardContent, Typography, TextField, Button, MenuItem, IconButton, Grid, LinearProgress } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import axios from 'axios';
import { useToast } from '../../../../context/ToastContext';
import CountedTextArea from '../../../Common/CountedTextArea';
import { useNavigate, useParams } from 'react-router-dom';

const API = '/api/erp/stores/stock-audit';
const ITEMS_API = '/api/erp/stores/items';

export default function StockAuditForm() {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const { id } = useParams();
  const isView = window.location.pathname.includes('/view/');
  const isEdit = !!id && !isView;

  const [header, setHeader] = useState({
    audit_date: new Date().toISOString().split('T')[0],
    warehouse: '',
    auditor: '',
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
          audit_date: data.audit_date?.split('T')[0] || '',
          warehouse: data.warehouse || '',
          auditor: data.auditor || '',
          status: data.status || 'Draft',
          remarks: data.remarks || '',
        });
        setItems((data.items || []).map((it) => ({
          ...it,
          item_id: it.item_id || '',
          item_code: it.item_code || '',
          item_name: it.item_name || '',
          system_qty: parseFloat(it.system_qty || 0),
          physical_qty: parseFloat(it.physical_qty || 0),
          variance_qty: parseFloat(it.variance_qty || 0),
          unit_id: it.unit_id || '',
          remarks: it.remarks || '',
        })));
      }).catch(() => showToast('Failed to load', 'error'))
        .finally(() => setLoading(false));
    }
  }, [id]);

  const handleHeaderChange = (e) => setHeader({ ...header, [e.target.name]: e.target.value });

  const addRow = () => {
    setItems([...items, {
      item_id: '', item_code: '', item_name: '', system_qty: 0,
      physical_qty: 0, variance_qty: 0, unit_id: '', remarks: '',
    }]);
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
        system_qty: parseFloat(sel?.current_stock || 0),
        unit_id: sel?.unit_id || '',
      };
      updated[idx].variance_qty = parseFloat(updated[idx].physical_qty || 0) - parseFloat(updated[idx].system_qty || 0);
    } else if (field === 'physical_qty') {
      updated[idx].physical_qty = parseFloat(value) || 0;
      updated[idx].variance_qty = (parseFloat(value) || 0) - parseFloat(updated[idx].system_qty || 0);
    } else {
      updated[idx][field] = value;
    }
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
      navigate('/stores/stock-audit');
    } catch { showToast('Failed to save', 'error'); }
    finally { setSaving(false); }
  };

  const handleApprove = async () => {
    if (!window.confirm('Approve this audit? This will update stock quantities.')) return;
    setSaving(true);
    try {
      await axios.put(`${API}/${id}/approve`);
      showToast('Approved and stock updated', 'success');
      navigate('/stores/stock-audit');
    } catch { showToast('Failed to approve', 'error'); }
    finally { setSaving(false); }
  };

  if (loading) return <LinearProgress />;

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <IconButton onClick={() => navigate('/stores/stock-audit')}><ArrowBackIcon /></IconButton>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'var(--heading-color)' }}>
          {isView ? 'View Stock Audit' : isEdit ? 'Edit Stock Audit' : 'New Stock Audit'}
        </Typography>
      </Box>
      <Card sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.08)', mb: 3 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <TextField fullWidth size="small" type="date" label="Audit Date" name="audit_date" value={header.audit_date} onChange={handleHeaderChange} InputLabelProps={{ shrink: true }} disabled={isView} />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField fullWidth size="small" label="Warehouse" name="warehouse" value={header.warehouse} onChange={handleHeaderChange} disabled={isView} />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField fullWidth size="small" label="Auditor" name="auditor" value={header.auditor} onChange={handleHeaderChange} disabled={isView} />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField fullWidth size="small" label="Status" value={header.status} disabled />
            </Grid>
            <Grid item xs={12}>
              <CountedTextArea fullWidth size="small" label="Remarks" name="remarks" value={header.remarks} onChange={handleHeaderChange} rows={2} disabled={isView} />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>Audit Items</Typography>
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
                <TextField size="small" fullWidth label="System Qty" type="number" value={row.system_qty} disabled />
              </Grid>
              <Grid item xs={6} sm={2}>
                <TextField size="small" fullWidth label="Physical Qty" type="number" value={row.physical_qty} onChange={(e) => handleItemChange(idx, 'physical_qty', e.target.value)} disabled={isView} />
              </Grid>
              <Grid item xs={6} sm={2}>
                <TextField size="small" fullWidth label="Variance" type="number" value={row.variance_qty} disabled
                  sx={{ '& .MuiInputBase-input': { color: row.variance_qty !== 0 ? '#d32f2f' : 'inherit', fontWeight: row.variance_qty !== 0 ? 700 : 400 } }} />
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
          {items.length === 0 && <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>No items added. Click "Add Item" to start.</Typography>}
        </CardContent>
      </Card>

      {!isView && (
        <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
          <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
          {isEdit && header.status === 'Draft' && (
            <Button variant="contained" color="success" startIcon={<CheckCircleIcon />} onClick={handleApprove}>Approve & Update Stock</Button>
          )}
          <Button variant="outlined" onClick={() => navigate('/stores/stock-audit')}>Cancel</Button>
        </Box>
      )}
    </Box>
  );
}
