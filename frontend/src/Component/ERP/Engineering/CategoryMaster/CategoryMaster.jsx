import React, { useEffect, useState, useCallback } from 'react';
import { Box, Card, CardContent, Typography, TextField, Button, LinearProgress, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, MenuItem, Chip } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import RefreshIcon from '@mui/icons-material/Refresh';
import axios from 'axios';
import { useToast } from '../../../../context/ToastContext';

const API = '/api/erp/engineering/categories';

export default function CategoryMaster() {
  const { showToast } = useToast();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dialog, setDialog] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', type: 'Main', parent_id: '', description: '' });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(API);
      setRows(data);
    } catch { showToast('Failed to load', 'error'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const mains = rows.filter((c) => c.type === 'Main');
  const subs = rows.filter((c) => c.type === 'Sub');
  const nameOf = (id) => (rows.find((r) => r.id === id) || {}).name || '-';

  const openAdd = (type) => { setEditing(null); setForm({ name: '', type: type || 'Main', parent_id: '', description: '' }); setDialog(true); };
  const openEdit = (c) => { setEditing(c); setForm({ name: c.name, type: c.type, parent_id: c.parent_id || '', description: c.description || '' }); setDialog(true); };

  const handleSave = async () => {
    try {
      if (editing) await axios.put(`${API}/${editing.id}`, form);
      else await axios.post(API, form);
      showToast(`Category ${editing ? 'updated' : 'created'}`, 'success');
      setDialog(false);
      fetchData();
    } catch (e) { showToast(e.response?.data?.error || 'Failed to save', 'error'); }
  };

  const handleDelete = async (c) => {
    if (!window.confirm(`Delete ${c.name}?`)) return;
    try { await axios.delete(`${API}/${c.id}`); showToast('Deleted', 'success'); fetchData(); }
    catch (e) { showToast(e.response?.data?.error || 'Failed to delete', 'error'); }
  };

  const renderCard = (title, list, type) => (
    <Card sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.08)', flex: 1, minWidth: 320 }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>{title}</Typography>
          <Button size="small" variant="outlined" startIcon={<AddIcon />} onClick={() => openAdd(type)}>Add</Button>
        </Box>
        {list.length === 0 && <Typography sx={{ color: 'gray', py: 2 }}>No entries</Typography>}
        {list.map((c) => (
          <Box key={c.id} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1.5, mb: 1, borderRadius: 2, bgcolor: '#f7f9fc', border: '1px solid #eef1f5' }}>
            <Box>
              <Typography sx={{ fontWeight: 600 }}>{c.name}</Typography>
              <Typography variant="caption" sx={{ color: 'gray' }}>
                {type === 'Sub' ? `Main: ${nameOf(c.parent_id)}` : ''} {c.description ? `• ${c.description}` : ''}
              </Typography>
            </Box>
            <Box>
              <IconButton size="small" color="primary" onClick={() => openEdit(c)}><EditIcon fontSize="small" /></IconButton>
              <IconButton size="small" color="error" onClick={() => handleDelete(c)}><DeleteIcon fontSize="small" /></IconButton>
            </Box>
          </Box>
        ))}
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold', color: 'var(--heading-color)' }}>Category Master</Typography>
      <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', mb: 2, alignItems: 'center' }}>
        <Button variant="outlined" startIcon={<RefreshIcon />} onClick={fetchData}>Refresh</Button>
      </Box>
      {loading && <LinearProgress sx={{ mb: 1 }} />}
      <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
        {renderCard('Main Categories', mains, 'Main')}
        {renderCard('Sub Categories', subs, 'Sub')}
      </Box>

      <Dialog open={dialog} onClose={() => setDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editing ? 'Edit' : 'New'} {form.type === 'Main' ? 'Main' : 'Sub'} Category</DialogTitle>
        <DialogContent>
          <TextField label="Type" select fullWidth size="small" sx={{ mt: 1, mb: 2 }} value={form.type}
            onChange={(e) => setForm((f) => ({ ...f, type: e.target.value, parent_id: '' }))}>
            <MenuItem value="Main">Main</MenuItem>
            <MenuItem value="Sub">Sub</MenuItem>
          </TextField>
          {form.type === 'Sub' && (
            <TextField label="Main Category" select fullWidth size="small" sx={{ mb: 2 }} value={form.parent_id}
              onChange={(e) => setForm((f) => ({ ...f, parent_id: e.target.value }))}>
              <MenuItem value=""><em>None</em></MenuItem>
              {mains.map((m) => <MenuItem key={m.id} value={m.id}>{m.name}</MenuItem>)}
            </TextField>
          )}
          <TextField label="Name" fullWidth size="small" sx={{ mb: 2 }} value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          <TextField label="Description" fullWidth size="small" value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={!form.name}>Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
