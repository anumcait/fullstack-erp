import React, { useEffect, useState, useCallback } from 'react';
import { Box, Card, CardContent, Typography, TextField, Button, LinearProgress, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, MenuItem, Chip } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import RefreshIcon from '@mui/icons-material/Refresh';
import axios from 'axios';
import { useToast } from '../../../../context/ToastContext';

const API = '/api/erp/stores/units';

export default function UOMMaster() {
  const { showToast } = useToast();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dialog, setDialog] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', short_name: '', is_active: true });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try { const { data } = await axios.get(API); setRows(data); }
    catch { showToast('Failed to load', 'error'); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { fetchData(); }, [fetchData]);

  const openAdd = () => { setEditing(null); setForm({ name: '', short_name: '', is_active: true }); setDialog(true); };
  const openEdit = (c) => { setEditing(c); setForm({ name: c.name, short_name: c.short_name || '', is_active: c.is_active !== false }); setDialog(true); };

  const handleSave = async () => {
    try {
      if (editing) await axios.put(`${API}/${editing.id}`, form);
      else await axios.post(API, form);
      showToast(`UOM ${editing ? 'updated' : 'created'}`, 'success');
      setDialog(false); fetchData();
    } catch (e) { showToast(e.response?.data?.error || 'Failed to save', 'error'); }
  };
  const handleDelete = async (c) => {
    if (!window.confirm(`Delete ${c.name}?`)) return;
    try { await axios.delete(`${API}/${c.id}`); showToast('Deleted', 'success'); fetchData(); }
    catch (e) { showToast(e.response?.data?.error || 'Failed to delete', 'error'); }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold', color: 'var(--heading-color)' }}>UOM Master</Typography>
      <Card sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
            <Button variant="contained" startIcon={<AddIcon />} onClick={openAdd}>New UOM</Button>
            <Button variant="outlined" startIcon={<RefreshIcon />} onClick={fetchData}>Refresh</Button>
          </Box>
          {loading && <LinearProgress sx={{ mb: 1 }} />}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            {rows.map((u) => (
              <Box key={u.id} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1.5, width: 240, borderRadius: 2, bgcolor: '#f7f9fc', border: '1px solid #eef1f5' }}>
                <Box>
                  <Typography sx={{ fontWeight: 600 }}>{u.name}</Typography>
                  <Typography variant="caption" sx={{ color: 'gray' }}>Short: {u.short_name || '-'}</Typography>
                </Box>
                <Box>
                  <IconButton size="small" color="primary" onClick={() => openEdit(u)}><EditIcon fontSize="small" /></IconButton>
                  <IconButton size="small" color="error" onClick={() => handleDelete(u)}><DeleteIcon fontSize="small" /></IconButton>
                </Box>
              </Box>
            ))}
            {rows.length === 0 && <Typography sx={{ color: 'gray', py: 2 }}>No UOMs</Typography>}
          </Box>
        </CardContent>
      </Card>

      <Dialog open={dialog} onClose={() => setDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle>{editing ? 'Edit' : 'New'} UOM</DialogTitle>
        <DialogContent>
          <TextField label="Name" fullWidth size="small" sx={{ mt: 1, mb: 2 }} value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          <TextField
            label="Short Code"
            fullWidth
            size="small"
            sx={{ mb: 2 }}
            value={form.short_name}
            inputProps={{ maxLength: 3, style: { textTransform: "uppercase" } }}
            helperText="Uppercase, max 3 letters (e.g. PCS, KGS)"
            onChange={(e) => setForm((f) => ({ ...f, short_name: e.target.value.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 3) }))}
          />
          <TextField label="Status" select fullWidth size="small" value={form.is_active ? 'true' : 'false'} onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.value === 'true' }))}>
            <MenuItem value="true">Active</MenuItem>
            <MenuItem value="false">Inactive</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={!form.name}>Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
