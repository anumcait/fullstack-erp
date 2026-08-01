import React, { useEffect, useState, useCallback } from 'react';
import { Box, Card, CardContent, Typography, TextField, Button, LinearProgress, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Autocomplete, Table, TableHead, TableBody, TableRow, TableCell } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import RefreshIcon from '@mui/icons-material/Refresh';
import axios from 'axios';
import { useToast } from '../../../../context/ToastContext';

const API = '/api/erp/stores/batches';
const ITEM_API = '/api/erp/stores/items';

export default function BatchMaster() {
  const { showToast } = useToast();
  const [rows, setRows] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dialog, setDialog] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ item_id: null, batch_no: '', quantity: 0, mfg_date: '', exp_date: '' });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try { const { data } = await axios.get(API); setRows(data); }
    catch { showToast('Failed to load', 'error'); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => {
    axios.get(ITEM_API).then(({ data }) => setItems(data)).catch(() => {});
  }, []);

  const openAdd = () => { setEditing(null); setForm({ item_id: null, batch_no: '', quantity: 0, mfg_date: '', exp_date: '' }); setDialog(true); };
  const openEdit = (b) => { setEditing(b); setForm({ item_id: b.item_id, batch_no: b.batch_no, quantity: b.quantity || 0, mfg_date: b.mfg_date || '', exp_date: b.exp_date || '' }); setDialog(true); };

  const handleSave = async () => {
    try {
      if (editing) await axios.put(`${API}/${editing.id}`, form);
      else await axios.post(API, form);
      showToast(`Batch ${editing ? 'updated' : 'created'}`, 'success');
      setDialog(false); fetchData();
    } catch (e) { showToast(e.response?.data?.error || 'Failed to save', 'error'); }
  };
  const handleDelete = async (b) => {
    if (!window.confirm(`Deactivate batch ${b.batch_no}?`)) return;
    try { await axios.delete(`${API}/${b.id}`); showToast('Deactivated', 'success'); fetchData(); }
    catch (e) { showToast(e.response?.data?.error || 'Failed', 'error'); }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold', color: 'var(--heading-color)' }}>Batch Master</Typography>
      <Card sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
            <Button variant="contained" startIcon={<AddIcon />} onClick={openAdd}>New Batch</Button>
            <Button variant="outlined" startIcon={<RefreshIcon />} onClick={fetchData}>Refresh</Button>
          </Box>
          {loading && <LinearProgress sx={{ mb: 1 }} />}
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Batch No</TableCell><TableCell>Item Code</TableCell><TableCell>Item Name</TableCell><TableCell align="right">Qty</TableCell><TableCell>Mfg Date</TableCell><TableCell>Exp Date</TableCell><TableCell>Status</TableCell><TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((b) => (
                <TableRow key={b.id}>
                  <TableCell>{b.batch_no}</TableCell>
                  <TableCell>{b.item?.item_code || '-'}</TableCell>
                  <TableCell>{b.item?.item_name || '-'}</TableCell>
                  <TableCell align="right">{b.quantity}</TableCell>
                  <TableCell>{b.mfg_date || '-'}</TableCell>
                  <TableCell>{b.exp_date || '-'}</TableCell>
                  <TableCell>{b.is_active ? <span style={{ color: 'green' }}>Active</span> : <span style={{ color: 'gray' }}>Inactive</span>}</TableCell>
                  <TableCell align="right">
                    <IconButton size="small" color="primary" onClick={() => openEdit(b)}><EditIcon fontSize="small" /></IconButton>
                    <IconButton size="small" color="error" onClick={() => handleDelete(b)}><DeleteIcon fontSize="small" /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {rows.length === 0 && !loading && (
                <TableRow><TableCell colSpan={8}><Typography sx={{ color: 'gray', py: 1 }}>No batches.</Typography></TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={dialog} onClose={() => setDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle>{editing ? 'Edit' : 'New'} Batch</DialogTitle>
        <DialogContent>
          <Autocomplete
            size="small" sx={{ mt: 1, mb: 2 }}
            options={items}
            getOptionLabel={(o) => (typeof o === 'string' ? o : `${o.item_code} - ${o.item_name}`)}
            value={items.find((i) => i.id === form.item_id) || null}
            isOptionEqualToValue={(o, v) => o?.id === v?.id}
            onChange={(_, v) => setForm((f) => ({ ...f, item_id: v?.id || null }))}
            renderInput={(p) => <TextField {...p} label="Item" fullWidth />}
          />
          <TextField label="Batch Number" fullWidth size="small" sx={{ mb: 2 }} value={form.batch_no} onChange={(e) => setForm((f) => ({ ...f, batch_no: e.target.value }))} />
          <TextField label="Quantity" type="number" fullWidth size="small" sx={{ mb: 2 }} value={form.quantity} onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))} />
          <TextField label="Mfg Date" type="date" fullWidth size="small" sx={{ mb: 2 }} InputLabelProps={{ shrink: true }} value={form.mfg_date} onChange={(e) => setForm((f) => ({ ...f, mfg_date: e.target.value }))} />
          <TextField label="Expiry Date" type="date" fullWidth size="small" InputLabelProps={{ shrink: true }} value={form.exp_date} onChange={(e) => setForm((f) => ({ ...f, exp_date: e.target.value }))} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={!form.item_id || !form.batch_no}>Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
