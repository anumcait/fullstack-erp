import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Box, Typography, Card, CardContent, TextField, Button, Grid, IconButton,
  Table, TableHead, TableRow, TableCell, TableBody, Switch, FormControlLabel, LinearProgress,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import SendIcon from '@mui/icons-material/Send';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SearchIcon from '@mui/icons-material/Search';
import axios from 'axios';
import { useToast } from '../../../../context/ToastContext';
import ItemSelectDialog from '../ItemMaster/ItemSelectDialog';
import CountedTextArea from '../../../Common/CountedTextArea';

const API = '/api/erp/stores/delivery-challans';
const ITEMS_API = '/api/erp/stores/items';

const blankRow = () => ({ tempId: Date.now() + Math.random(), item_id: '', item_code: '', item_name: '', unit_id: '', unit: '', quantity: 0, remarks: '' });

export default function DeliveryChallanForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  const isView = location.pathname.includes('/view/');
  const isEdit = location.pathname.includes('/edit/');

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [items, setItems] = useState([]);
  const [masterItems, setMasterItems] = useState([]);
  const [picker, setPicker] = useState(null);
  const [form, setForm] = useState({
    dc_date: new Date().toISOString().split('T')[0],
    party_name: '', returnable: true, expected_return_date: '', reference_no: '', vehicle_no: '', driver_name: '', remarks: '',
  });
  const [rows, setRows] = useState([blankRow()]);

  useEffect(() => {
    axios.get(ITEMS_API, { params: { is_active: true } }).then(({ data }) => setMasterItems(data)).catch(() => {});
    if (id) {
      setLoading(true);
      axios.get(`${API}/${id}`).then(({ data }) => {
        setForm({
          dc_date: data.dc_date?.split('T')[0] || '',
          party_name: data.party_name || '', returnable: Boolean(data.returnable),
          expected_return_date: data.expected_return_date?.split('T')[0] || '',
          reference_no: data.reference_no || '', vehicle_no: data.vehicle_no || '',
          driver_name: data.driver_name || '', remarks: data.remarks || '',
        });
        setRows(data.items?.length ? data.items.map((i) => ({
          tempId: Date.now() + Math.random(), item_id: i.item_id || '', item_code: i.item_code || '',
          item_name: i.item_name || '', unit_id: i.unit_id || '', unit: i.unit?.short_name || '',
          quantity: i.quantity || 0, remarks: i.remarks || '',
        })) : [blankRow()]);
      }).catch(() => showToast('Failed to load', 'error')).finally(() => setLoading(false));
    }
  }, [id]);

  const handleChange = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  const updateRow = (tempId, patch) => setRows((prev) => prev.map((r) => r.tempId === tempId ? { ...r, ...patch } : r));
  const removeRow = (tempId) => setRows((prev) => prev.filter((r) => r.tempId !== tempId));

  const pickItem = (tempId) => {
    const sel = masterItems.find((m) => m.id === tempId);
    if (!sel) return;
    setRows((prev) => prev.map((r) => r.tempId === picker.rowId ? {
      ...r, item_id: sel.id, item_code: sel.item_code, item_name: sel.item_name,
      unit_id: sel.unit_id || '', unit: sel.unit?.short_name || sel.unit?.name || '',
    } : r));
    setPicker(null);
  };

  const handleSubmit = async (issue) => {
    if (!form.party_name && !rows.some((r) => r.item_id)) {
      showToast('Add at least one item', 'warning'); return;
    }
    setSaving(true);
    try {
      const payload = { ...form, items: rows.filter((r) => r.item_id).map(({ tempId, unit, ...r }) => r) };
      let saved;
      if (id && isEdit) saved = await axios.put(`${API}/${id}`, payload);
      else saved = await axios.post(API, payload);
      if (issue) await axios.post(`${API}/${saved.data.id}/issue`);
      showToast(issue ? 'Challan issued' : 'Challan saved', 'success');
      navigate('/stores/delivery-challans');
    } catch (e) {
      showToast(e.response?.data?.error || 'Failed to save', 'error');
    } finally { setSaving(false); }
  };

  if (loading && id) return <LinearProgress />;
  const readOnly = isView;

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <IconButton onClick={() => navigate('/stores/delivery-challans')}><ArrowBackIcon /></IconButton>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'var(--heading-color)' }}>
          {isView ? 'View' : isEdit ? 'Edit' : 'New'} Delivery Challan
        </Typography>
      </Box>

      <Card sx={{ borderRadius: 3, mb: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={6} md={2}>
              <TextField label="Date" type="date" size="small" fullWidth value={form.dc_date} onChange={handleChange('dc_date')} disabled={readOnly} InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={6} md={3}>
              <TextField label="Party / Customer" size="small" fullWidth value={form.party_name} onChange={handleChange('party_name')} disabled={readOnly} />
            </Grid>
            <Grid item xs={6} md={2}>
              <FormControlLabel control={<Switch checked={form.returnable} onChange={(e) => setForm((f) => ({ ...f, returnable: e.target.checked }))} disabled={readOnly} />} label="Returnable" />
            </Grid>
            <Grid item xs={6} md={2}>
              <TextField label="Expected Return" type="date" size="small" fullWidth value={form.expected_return_date} onChange={handleChange('expected_return_date')} disabled={!form.returnable || readOnly} InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={6} md={3}>
              <TextField label="Reference #" size="small" fullWidth value={form.reference_no} onChange={handleChange('reference_no')} disabled={readOnly} />
            </Grid>
            <Grid item xs={6} md={2}>
              <TextField label="Vehicle No" size="small" fullWidth value={form.vehicle_no} onChange={handleChange('vehicle_no')} disabled={readOnly} />
            </Grid>
            <Grid item xs={6} md={2}>
              <TextField label="Driver" size="small" fullWidth value={form.driver_name} onChange={handleChange('driver_name')} disabled={readOnly} />
            </Grid>
            <Grid item xs={12} md={8}>
              <CountedTextArea label="Remarks" size="small" fullWidth value={form.remarks} onChange={handleChange('remarks')} disabled={readOnly} rows={1} />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Items</Typography>
          <Table size="small" sx={{ '& th': { fontWeight: 700, bgcolor: '#f5f7fa', fontSize: '0.8rem' } }}>
            <TableHead>
              <TableRow>
                <TableCell>#</TableCell>
                <TableCell>Item</TableCell>
                <TableCell>Code</TableCell>
                <TableCell>Unit</TableCell>
                <TableCell>Quantity</TableCell>
                <TableCell>Remarks</TableCell>
                {!readOnly && <TableCell></TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((r, idx) => (
                <TableRow key={r.tempId}>
                  <TableCell>{idx + 1}</TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      <span>{r.item_name || <span style={{ color: '#aaa' }}>Select item…</span>}</span>
                      {!readOnly && (
                        <IconButton size="small" onClick={() => setPicker({ rowId: r.tempId })}><SearchIcon fontSize="small" /></IconButton>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>{r.item_code}</TableCell>
                  <TableCell>{r.unit}</TableCell>
                  <TableCell>
                    <TextField type="number" size="small" sx={{ width: 110 }} value={r.quantity}
                      onChange={(e) => updateRow(r.tempId, { quantity: Number(e.target.value) })}
                      inputProps={{ min: 0 }} disabled={readOnly} />
                  </TableCell>
                  <TableCell>
                    <TextField size="small" fullWidth value={r.remarks} onChange={(e) => updateRow(r.tempId, { remarks: e.target.value })} disabled={readOnly} />
                  </TableCell>
                  {!readOnly && (
                    <TableCell>
                      <IconButton size="small" color="error" onClick={() => removeRow(r.tempId)}><DeleteIcon fontSize="small" /></IconButton>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {!readOnly && (
            <Button size="small" variant="outlined" sx={{ mt: 2 }} onClick={() => setRows((p) => [...p, blankRow()])}>Add Item</Button>
          )}
        </CardContent>
      </Card>

      {!readOnly && (
        <Box mt={3} display="flex" gap={2}>
          <Button variant="contained" startIcon={<SaveIcon />} onClick={() => handleSubmit(false)} disabled={saving}>Save as Draft</Button>
          <Button variant="outlined" color="primary" startIcon={<SendIcon />} onClick={() => handleSubmit(true)} disabled={saving}>Save & Issue</Button>
          <Button variant="text" onClick={() => navigate('/stores/delivery-challans')}>Cancel</Button>
        </Box>
      )}

      <ItemSelectDialog
        open={Boolean(picker)}
        title="Select Item"
        data={[...masterItems].sort((a, b) => a.id - b.id).map((m) => ({ ...m, group_name: m.category?.name || '-' }))}
        columns={[{ key: 'id', label: 'ID' }, { key: 'item_code', label: 'Code' }, { key: 'item_name', label: 'Name' }, { key: 'group_name', label: 'Group' }]}
        onClose={() => setPicker(null)}
        onSelect={(it) => pickItem(it.id)}
      />
    </Box>
  );
}
