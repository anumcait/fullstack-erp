import React, { useEffect, useState, useCallback } from 'react';
import { Box, Card, CardContent, Typography, TextField, Button, MenuItem, LinearProgress, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, InputAdornment } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from '@mui/icons-material/Search';
import axios from 'axios';
import { useToast } from '../../../../context/ToastContext';

const GROUPS_API = '/api/erp/stores/groups';
const SUBGROUPS_API = '/api/erp/stores/subgroups';

export default function ItemGroupMaster() {
  const { showToast } = useToast();
  const [groups, setGroups] = useState([]);
  const [subs, setSubs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dialog, setDialog] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', parent_id: '', code: '', description: '' });
  const [groupSearch, setGroupSearch] = useState('');
  const [subSearch, setSubSearch] = useState('');
  const [confirmRow, setConfirmRow] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [gRes, sRes] = await Promise.all([axios.get(GROUPS_API), axios.get(SUBGROUPS_API)]);
      setGroups(gRes.data);
      setSubs(sRes.data);
    } catch { showToast('Failed to load', 'error'); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { fetchData(); }, [fetchData]);

  const groupNameOf = (id) => (groups.find((g) => g.id === id) || {}).name || '-';

  const openAdd = (type) => {
    setEditing(null);
    setForm({ name: '', parent_id: type === 'Sub' ? (groups[0]?.id || '') : '', code: '', description: '' });
    setDialog(type);
  };
  const openEdit = (type, row) => {
    setEditing(row);
    setForm({
      name: row.name,
      parent_id: row.group_id != null ? row.group_id : (row.parent_id || ''),
      code: row.code || '',
      description: row.description || '',
    });
    setDialog(type);
  };

  const handleSave = async () => {
    try {
      if (dialog === 'Group') {
        const payload = { name: form.name, code: form.code, description: form.description };
        if (editing) await axios.put(`${GROUPS_API}/${editing.id}`, payload);
        else await axios.post(GROUPS_API, payload);
        showToast(`Group ${editing ? 'updated' : 'created'}`, 'success');
        fetchData();
      } else {
        const payload = { name: form.name, code: form.code, group_id: form.parent_id || null, description: form.description };
        if (editing) await axios.put(`${SUBGROUPS_API}/${editing.id}`, payload);
        else await axios.post(SUBGROUPS_API, payload);
        showToast(`Sub Group ${editing ? 'updated' : 'created'}`, 'success');
        fetchData();
      }
      setDialog(false);
    } catch (e) { showToast(e.response?.data?.error || 'Failed to save', 'error'); }
  };

  const confirmDelete = async () => {
    if (!confirmRow) return;
    try {
      const api = confirmRow.type === 'Group' ? GROUPS_API : SUBGROUPS_API;
      await axios.delete(`${api}/${confirmRow.row.id}`);
      showToast('Deleted', 'success');
      fetchData();
    } catch (e) { showToast(e.response?.data?.error || 'Failed to delete', 'error'); }
    finally { setConfirmRow(null); }
  };

  const filteredGroups = groups.filter((g) =>
    g.name.toLowerCase().includes(groupSearch.trim().toLowerCase()));
  const filteredSubs = subs.filter((s) => {
    const q = subSearch.trim().toLowerCase();
    if (!q) return true;
    return (
      s.name.toLowerCase().includes(q) ||
      (groupNameOf(s.group_id) || '').toLowerCase().includes(q)
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
          {list.map((row) => (
            <Box key={row.id} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1.5, mb: 1, borderRadius: 2, bgcolor: '#f7f9fc', border: '1px solid #eef1f5' }}>
              <Box>
                <Typography sx={{ fontWeight: 600 }}>
                  {row.name}
                  {row.code && (
                    <Typography component="span" variant="caption" sx={{ ml: 1, px: 0.75, py: 0.25, borderRadius: 1, bgcolor: 'primary.main', color: '#fff' }}>
                      {row.code}
                    </Typography>
                  )}
                </Typography>
                <Typography variant="caption" sx={{ color: 'gray' }}>
                  {type === 'Sub' ? `Group: ${groupNameOf(row.group_id)}` : ''} {row.description ? `• ${row.description}` : ''}
                </Typography>
              </Box>
              <Box>
                <IconButton size="small" color="primary" onClick={() => openEdit(type, row)}><EditIcon fontSize="small" /></IconButton>
                <IconButton size="small" color="error" onClick={() => setConfirmRow({ type, row })}><DeleteIcon fontSize="small" /></IconButton>
              </Box>
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 1, fontWeight: 'bold', color: 'var(--heading-color)' }}>Item Group Master</Typography>
      <Typography variant="body2" sx={{ mb: 3, color: 'gray' }}>
        Define the item classification and the series code used to auto-generate item codes (e.g. Group "Raw Material" → Sub Group "Tower Fan" with code "TFAN" produces TFAN-0001).
      </Typography>
      <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', mb: 2, alignItems: 'center' }}>
        <Button variant="outlined" startIcon={<RefreshIcon />} onClick={fetchData}>Refresh</Button>
      </Box>
      {loading && <LinearProgress sx={{ mb: 1 }} />}
      <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
        {renderCard('Groups', filteredGroups, 'Group', groupSearch, setGroupSearch)}
        {renderCard('Sub Groups', filteredSubs, 'Sub', subSearch, setSubSearch)}
      </Box>

      <Dialog open={Boolean(dialog)} onClose={() => setDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editing ? 'Edit' : 'New'} {dialog === 'Group' ? 'Group' : 'Sub Group'}</DialogTitle>
        <DialogContent dividers>
          {dialog === 'Sub' && (
            <TextField label="Group" select fullWidth size="small" sx={{ mb: 2 }} value={form.parent_id}
              onChange={(e) => setForm((f) => ({ ...f, parent_id: e.target.value }))}>
              <MenuItem value=""><em>Select Group</em></MenuItem>
              {groups.map((g) => <MenuItem key={g.id} value={g.id}>{g.name}</MenuItem>)}
            </TextField>
          )}
          <TextField label="Name" fullWidth size="small" sx={{ mb: 2 }} autoFocus
            value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          <TextField label="Series Code" fullWidth size="small" sx={{ mb: 2, textTransform: 'uppercase' }}
            inputProps={{ maxLength: 20 }}
            helperText="Prefix used for item numbering (e.g. RAWMA, TFAN, VFAN)"
            value={form.code}
            onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '') }))} />
          <TextField label="Description" fullWidth size="small"
            value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={!form.name}>{editing ? 'Update' : 'Create'}</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(confirmRow)} onClose={() => setConfirmRow(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Delete {confirmRow ? confirmRow.row.name : ''}?</DialogTitle>
        <DialogContent dividers>
          <Typography>
            This action cannot be undone. Are you sure you want to delete this{' '}
            {confirmRow?.type === 'Group' ? 'group' : 'sub group'}?
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
