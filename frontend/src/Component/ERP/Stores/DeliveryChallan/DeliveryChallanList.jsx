import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Card, CardContent, TextField, Button, Table, TableHead, TableRow, TableCell, TableBody, IconButton, Chip, LinearProgress, MenuItem } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import SendIcon from '@mui/icons-material/Send';
import ReplayIcon from '@mui/icons-material/Replay';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';
import { useToast } from '../../../../context/ToastContext';

const API = '/api/erp/stores/delivery-challans';

const statusColor = { Draft: 'default', Issued: 'primary', Returned: 'success', Cancelled: 'error' };

export default function DeliveryChallanList() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchData = () => {
    setLoading(true);
    axios.get(API, { params: { search, status } }).then(({ data }) => setRows(data)).catch(() => showToast('Failed to load', 'error')).finally(() => setLoading(false));
  };
  useEffect(fetchData, []);

  const issue = async (id) => {
    if (!window.confirm('Issue this challan? Stock will be reduced.')) return;
    try { await axios.post(`${API}/${id}/issue`); showToast('Issued', 'success'); fetchData(); }
    catch (e) { showToast(e.response?.data?.error || 'Failed', 'error'); }
  };
  const remove = async (id) => {
    if (!window.confirm('Delete this challan?')) return;
    try { await axios.delete(`${API}/${id}`); showToast('Deleted', 'success'); fetchData(); }
    catch (e) { showToast(e.response?.data?.error || 'Failed', 'error'); }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={2}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'var(--heading-color)' }}>Delivery Challans</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/stores/delivery-challans/add')}>New Challan</Button>
      </Box>
      <Card sx={{ borderRadius: 3, mb: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
        <CardContent>
          <Box display="flex" gap={2} flexWrap="wrap">
            <TextField size="small" label="Search" value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && fetchData()} sx={{ minWidth: 240 }} />
            <TextField size="small" select label="Status" value={status} onChange={(e) => setStatus(e.target.value)} sx={{ minWidth: 160 }}>
              <MenuItem value="">All</MenuItem>
              {Object.keys(statusColor).map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
            </TextField>
            <Button variant="outlined" onClick={fetchData}>Search</Button>
          </Box>
        </CardContent>
      </Card>
      {loading && <LinearProgress sx={{ mb: 1 }} />}
      <Card sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
        <CardContent>
          <Table size="small" sx={{ '& th': { fontWeight: 700, bgcolor: '#f5f7fa', fontSize: '0.8rem' } }}>
            <TableHead>
              <TableRow>
                <TableCell>DC #</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Party</TableCell>
                <TableCell>Returnable</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.length === 0 && <TableRow><TableCell colSpan={6} align="center" sx={{ py: 4, color: 'gray' }}>No challans found.</TableCell></TableRow>}
              {rows.map((r) => (
                <TableRow key={r.id} hover>
                  <TableCell sx={{ fontWeight: 600 }}>{r.dc_no}</TableCell>
                  <TableCell>{r.dc_date}</TableCell>
                  <TableCell>{r.party_name || '-'}</TableCell>
                  <TableCell>{r.returnable ? 'Yes' : 'No'}</TableCell>
                  <TableCell><Chip size="small" label={r.status} color={statusColor[r.status] || 'default'} /></TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => navigate(`/stores/delivery-challans/view/${r.id}`)}><VisibilityIcon fontSize="small" /></IconButton>
                    {r.status === 'Draft' && (
                      <>
                        <IconButton size="small" onClick={() => navigate(`/stores/delivery-challans/edit/${r.id}`)}><EditIcon fontSize="small" /></IconButton>
                        <IconButton size="small" color="primary" onClick={() => issue(r.id)}><SendIcon fontSize="small" /></IconButton>
                        <IconButton size="small" color="error" onClick={() => remove(r.id)}><DeleteIcon fontSize="small" /></IconButton>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </Box>
  );
}
