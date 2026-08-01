import React, { useEffect, useState, useCallback } from 'react';
import { Box, Card, CardContent, Typography, TextField, Button, LinearProgress, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, MenuItem, Table, TableHead, TableBody, TableRow, TableCell } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import RefreshIcon from '@mui/icons-material/Refresh';
import axios from 'axios';
import { useToast } from '../../../../context/ToastContext';

const API = '/api/erp/stores/warehouses';

export default function WarehouseMaster() {
  const { showToast } = useToast();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dialog, setDialog] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ warehouse_code: '', warehouse_name: '', location: '', is_active: true });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try { const { data } = await axios.get(API); setRows(data); }
    catch { showToast('Failed to load', 'error'); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { fetchData(); }, [fetchData]);

  const openAdd = () => { setEditing(null); setForm({ warehouse_code: '', warehouse_name: '', location: '', is_active: true }); setDialog(true); };
  const openEdit = (w) => { setEditing(w); setForm({ warehouse_code: w.warehouse_code, warehouse_name: w.warehouse_name, location: w.location || '', is_active: w.is_active !== false }); setDialog(true); };

  const handleSave = async () => {
    try {
      if (editing) await axios.put(`${API}/${editing.id}`, form);
      else await axios.post(API, form);
      showToast(`Warehouse ${editing ? 'updated' : 'created'}`, 'success');
      setDialog(false); fetchData();
    } catch (e) { showToast(e.response?.data?.error || 'Failed to save', 'error'); }
  };
  const handleDelete = async (w) => {
    if (!window.confirm(`Deactivate ${w.warehouse_name}?`)) return;
    try { await axios.delete(`${API}/${w.id}`); showToast('Deactivated', 'success'); fetchData(); }
    catch (e) { showToast(e.response?.data?.error || 'Failed', 'error'); }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold', color: 'var(--heading-color)' }}>Warehouse Master</Typography>
      <Card sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
            <Button variant="contained" startIcon={<AddIcon />} onClick={openAdd}>New Warehouse</Button>
            <Button variant="outlined" startIcon={<RefreshIcon />} onClick={fetchData}>Refresh</Button>
          </Box>
          {loading && <LinearProgress sx={{ mb: 1 }} />}
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Code</TableCell><TableCell>Name</TableCell><TableCell>Location</TableCell><TableCell>Status</TableCell><TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((w) => (
                <TableRow key={w.id}>
                  <TableCell>{w.warehouse_code}</TableCell>
                  <TableCell>{w.warehouse_name}</TableCell>
                  <TableCell>{w.location || '-'}</TableCell>
                  <TableCell>{w.is_active ? <span style={{ color: 'green' }}>Active</span> : <span style={{ color: 'gray' }}>Inactive</span>}</TableCell>
                  <TableCell align="right">
                    <IconButton size="small" color="primary" onClick={() => openEdit(w)}><EditIcon fontSize="small" /></IconButton>
                    <IconButton size="small" color="error" onClick={() => handleDelete(w)}><DeleteIcon fontSize="small" /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {rows.length === 0 && !loading && (
                <TableRow><TableCell colSpan={5}><Typography sx={{ color: 'gray', py: 1 }}>No warehouses. Add one to enable warehouse-wise stock tracking.</Typography></TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={dialog} onClose={() => setDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle>{editing ? 'Edit' : 'New'} Warehouse</DialogTitle>
        <DialogContent>
          <TextField label="Warehouse Code" fullWidth size="small" sx={{ mt: 1, mb: 2 }} value={form.warehouse_code} onChange={(e) => setForm((f) => ({ ...f, warehouse_code: e.target.value }))} />
          <TextField label="Warehouse Name" fullWidth size="small" sx={{ mb: 2 }} value={form.warehouse_name} onChange={(e) => setForm((f) => ({ ...f, warehouse_name: e.target.value }))} />
          <TextField label="Location" fullWidth size="small" sx={{ mb: 2 }} value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} />
          <TextField label="Status" select fullWidth size="small" value={form.is_active ? 'true' : 'false'} onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.value === 'true' }))}>
            <MenuItem value="true">Active</MenuItem>
            <MenuItem value="false">Inactive</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={!form.warehouse_code || !form.warehouse_name}>Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
