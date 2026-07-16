import React, { useEffect, useState, useCallback } from 'react';
import { Box, Card, CardContent, Typography, TextField, Button, MenuItem, LinearProgress, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, InputAdornment } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from '@mui/icons-material/Search';
import axios from 'axios';
import { useToast } from '../../../../context/ToastContext';

const API = '/api/erp/stores/item-types';

export default function ItemTypeMaster() {
  const { showToast } = useToast();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dialog, setDialog] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', parent_id: '', description: '' });
  const [typeSearch, setTypeSearch] = useState('');
  const [subSearch, setSubSearch] = useState('');
  const [confirmRow, setConfirmRow] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try { const { data } = await axios.get(API); setRows(data); }
    catch { showToast('Failed to load', 'error'); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { fetchData(); }, [fetchData]);

  const groups = rows.filter((c) => !c.parent_id);
  const subs = rows.filter((c) => c.parent_id);
  const nameOf = (id) => (rows.find((r) => r.id === id) || {}).name || '-';

  const openAdd = (type) => { setEditing(null); setForm({ name: '', parent_id: type === 'Sub' ? (groups[0]?.id || '') : '', description: '' }); setDialog(true); };
  const openEdit = (c) => { setEditing(c); setForm({ name: c.name, parent_id: c.parent_id || '', description: c.description || '' }); setDialog(true); };

  const handleSave = async () => {
    try {
      if (editing) await axios.put(`${API}/${editing.id}`, form);
      else await axios.post(API, form);
      showToast(`Item Type ${editing ? 'updated' : 'created'}`, 'success');
      setDialog(false); fetchData();
    } catch (e) { showToast(e.response?.data?.error || 'Failed to save', 'error'); }
  };

  const confirmDelete = async () => {
    if (!confirmRow) return;
    try { await axios.delete(`${API}/${confirmRow.id}`); showToast('Deleted', 'success'); fetchData(); }
    catch (e) { showToast(e.response?.data?.error || 'Failed to delete', 'error'); }
    finally { setConfirmRow(null); }
  };

  const filteredGroups = groups.filter((c) =>
    c.name.toLowerCase().includes(typeSearch.trim().toLowerCase()));
  const filteredSubs = subs.filter((c) => {
    const q = subSearch.trim().toLowerCase();
    if (!q) return true;
    return (
      c.name.toLowerCase().includes(q) ||
      (nameOf(c.parent_id) || '').toLowerCase().includes(q)
    );
  });

  const renderCard = (title, list, type, search, setSearch) => (
    <Card sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.08)', flex: 1, minWidth: 320 }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {title}{' '}
            <Typography component="span" variant="caption" sx={{ color: 'gray' }}>({list.length})</Typography>
          </Typography>
          <Button size="small" variant="outlined" startIcon={<AddIcon />} onClick={() => openAdd(type)}>Add</Button>
        </Box>
        <TextField
          size="small" fullWidth sx={{ mb: 2 }}
          placeholder={`Search ${title.toLowerCase()}...`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" sx={{ color: 'gray' }} />
              </InputAdornment>
            ),
          }}
        />
        {list.length === 0 && (
          <Typography sx={{ color: 'gray', py: 2 }}>
            {search.trim() ? 'No matches found' : 'No entries'}
          </Typography>
        )}
        <Box sx={{ maxHeight: 380, overflowY: 'auto', pr: 0.5 }}>
          {list.map((c) => (
            <Box key={c.id} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1.5, mb: 1, borderRadius: 2, bgcolor: '#f7f9fc', border: '1px solid #eef1f5' }}>
              <Box>
                <Typography sx={{ fontWeight: 600 }}>{c.name}</Typography>
                <Typography variant="caption" sx={{ color: 'gray' }}>{type === 'Sub' ? `Type: ${nameOf(c.parent_id)}` : ''} {c.description ? `• ${c.description}` : ''}</Typography>
              </Box>
              <Box>
                <IconButton size="small" color="primary" onClick={() => openEdit(c)}><EditIcon fontSize="small" /></IconButton>
                <IconButton size="small" color="error" onClick={() => setConfirmRow(c)}><DeleteIcon fontSize="small" /></IconButton>
              </Box>
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold', color: 'var(--heading-color)' }}>Item Type Master</Typography>
      <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', mb: 2, alignItems: 'center' }}>
        <Button variant="outlined" startIcon={<RefreshIcon />} onClick={fetchData}>Refresh</Button>
      </Box>
      {loading && <LinearProgress sx={{ mb: 1 }} />}
      <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
        {renderCard('Types', filteredGroups, 'Type', typeSearch, setTypeSearch)}
        {renderCard('Sub Types', filteredSubs, 'Sub', subSearch, setSubSearch)}
      </Box>

      <Dialog open={dialog} onClose={() => setDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editing ? 'Edit' : 'New'} {form.parent_id ? 'Sub Type' : 'Type'}</DialogTitle>
        <DialogContent>
          {!editing && (
            <TextField label="Type" select fullWidth size="small" sx={{ mt: 1, mb: 2 }} value={form.parent_id ? 'Sub' : 'Type'} onChange={(e) => setForm((f) => ({ ...f, parent_id: e.target.value === 'Sub' ? (groups[0]?.id || '') : '' }))}>
              <MenuItem value="Type">Type</MenuItem>
              <MenuItem value="Sub">Sub Type</MenuItem>
            </TextField>
          )}
          {form.parent_id ? (
            <TextField label="Type" select fullWidth size="small" sx={{ mb: 2 }} value={form.parent_id} onChange={(e) => setForm((f) => ({ ...f, parent_id: e.target.value }))}>
              <MenuItem value=""><em>None</em></MenuItem>
              {groups.map((g) => <MenuItem key={g.id} value={g.id}>{g.name}</MenuItem>)}
            </TextField>
          ) : null}
          <TextField label="Name" fullWidth size="small" sx={{ mb: 2 }} value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          <TextField label="Description" fullWidth size="small" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={!form.name}>Save</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(confirmRow)} onClose={() => setConfirmRow(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Delete {confirmRow ? confirmRow.name : ''}?</DialogTitle>
        <DialogContent dividers>
          <Typography>
            This action cannot be undone. Are you sure you want to delete this{' '}
            {confirmRow?.parent_id ? 'sub type' : 'type'}?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmRow(null)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={confirmDelete}>Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
