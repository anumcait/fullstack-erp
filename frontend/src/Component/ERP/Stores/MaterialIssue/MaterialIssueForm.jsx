import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Box, Typography, Card, CardContent, TextField, Button, Grid, IconButton,
  Table, TableHead, TableRow, TableCell, TableBody, MenuItem, LinearProgress,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import axios from 'axios';
import { useToast } from '../../../../context/ToastContext';
import CountedTextArea from '../../../Common/CountedTextArea';

const API = '/api/erp/stores/material-issues';
const MR_API = '/api/erp/stores/material-requisitions';
const STOCK_API = '/api/erp/stores/stock';

const DEPARTMENTS = ['Production', 'Assembly', 'Maintenance', 'Quality', 'Stores', 'Engineering', 'Admin'];

export default function MaterialIssueForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  const isView = location.pathname.includes('/view/');
  const isEdit = location.pathname.includes('/edit/');
  const isAdd = !id || location.pathname.includes('/add');

  const [loading, setLoading] = useState(false);
  const [mrList, setMrList] = useState([]);
  const [stockMap, setStockMap] = useState({});
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({
    issue_no: '', issue_date: new Date().toISOString().split('T')[0],
    issued_to: '', department: '', req_id: '', remarks: '', status: 'Issued',
  });

  useEffect(() => {
    axios.get(MR_API, { params: { status: 'Approved' } }).then(({ data }) => setMrList(data)).catch(() => {});
    axios.get(STOCK_API).then(({ data }) => {
      const map = {};
      data.forEach((it) => { map[it.id] = Number(it.current_stock || 0); });
      setStockMap(map);
    }).catch(() => {});
    if (id) {
      setLoading(true);
      axios.get(`${API}/${id}`).then(({ data }) => {
        setForm({
          issue_no: data.issue_no || '', issue_date: data.issue_date?.split('T')[0] || '',
          issued_to: data.issued_to || '', department: data.department || '',
          req_id: data.req_id || '', remarks: data.remarks || '', status: data.status || 'Issued',
        });
        setItems(data.items?.map((i) => ({
          tempId: Date.now() + Math.random(),
          item_id: i.item_id || '', item_code: i.item_code || '',
          item_name: i.item_name || '', quantity: i.quantity || 0,
          req_item_id: i.req_item_id || '',
          unit_id: i.unit_id || '',
        })) || []);
      }).catch(() => showToast('Failed to load', 'error'))
      .finally(() => setLoading(false));
    }
  }, [id]);

  const handleChange = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleMrSelect = async (mrId) => {
    if (!mrId) return;
    try {
      const { data } = await axios.get(`${MR_API}/${mrId}`);
      setForm((f) => ({
        ...f, req_id: mrId,
        issued_to: data.requested_by || f.issued_to,
        department: data.department || f.department,
      }));
      setItems((data.items || [])
        .filter((it) => Number(it.pending_quantity || 0) > 0)
        .map((it) => ({
          tempId: Date.now() + Math.random(),
          item_id: it.item_id, item_code: it.item_code,
          item_name: it.item_name, quantity: Number(it.pending_quantity || 0),
          req_item_id: it.id, unit_id: it.unit_id,
          max_qty: Number(it.pending_quantity || 0),
        })));
    } catch { showToast('Failed to load MR', 'error'); }
  };

  const handleQtyChange = (tempId, value) => {
    setItems((prev) => prev.map((i) => i.tempId === tempId ? { ...i, quantity: Math.min(value, i.max_qty || value) } : i));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...form, items: items.map(({ tempId, max_qty, ...it }) => it) };
      if (isEdit) {
        await axios.put(`${API}/${id}`, payload);
        showToast('Material issue updated', 'success');
      } else {
        await axios.post(API, payload);
        showToast('Material issued successfully', 'success');
      }
      navigate('/stores/material-issues');
    } catch { showToast('Failed to save issue', 'error'); }
    finally { setLoading(false); }
  };

  if (loading && !isAdd) return <LinearProgress />;
  const readOnly = isView;
  const canEdit = isAdd || isEdit;

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <IconButton onClick={() => navigate('/stores/material-issues')}><ArrowBackIcon /></IconButton>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'var(--heading-color)' }}>
          {isView ? 'View' : isEdit ? 'Edit' : 'New'} Material Issue
        </Typography>
      </Box>

      <form onSubmit={handleSubmit}>
        <Card sx={{ borderRadius: 3, mb: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={6} md={2}>
                <TextField label="Issue #" size="small" fullWidth value={form.issue_no} disabled />
              </Grid>
              <Grid item xs={6} md={2}>
                <TextField label="Date" type="date" size="small" fullWidth value={form.issue_date}
                  onChange={handleChange('issue_date')} disabled={readOnly} InputLabelProps={{ shrink: true }} />
              </Grid>
              <Grid item xs={6} md={3}>
                <TextField label="From MR" select size="small" fullWidth value={form.req_id}
                  onChange={(e) => handleMrSelect(Number(e.target.value))} disabled={readOnly}>
                  <MenuItem value=""><em>Select Approved MR</em></MenuItem>
                  {mrList.map((mr) => (
                    <MenuItem key={mr.id} value={mr.id}>{mr.req_no} - {mr.department} ({mr.requested_by})</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={6} md={2}>
                <TextField label="Issued To" size="small" fullWidth value={form.issued_to} onChange={handleChange('issued_to')} disabled={readOnly} />
              </Grid>
              <Grid item xs={6} md={2}>
                <TextField label="Department" select size="small" fullWidth value={form.department} onChange={handleChange('department')} disabled={readOnly}>
                  {DEPARTMENTS.map((d) => <MenuItem key={d} value={d}>{d}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid item xs={12} md={1}>
                <TextField label="Status" size="small" fullWidth value={form.status} disabled />
              </Grid>
              <Grid item xs={12}>
                <CountedTextArea label="Remarks" size="small" fullWidth value={form.remarks} onChange={handleChange('remarks')} disabled={readOnly} rows={2} />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Card sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Items to Issue</Typography>
            <Table size="small" sx={{ '& th': { fontWeight: 700, bgcolor: '#f5f7fa', fontSize: '0.8rem' } }}>
              <TableHead>
                <TableRow>
                  <TableCell>#</TableCell>
                  <TableCell>Item Code</TableCell>
                  <TableCell>Item Name</TableCell>
                  <TableCell>Available Stock</TableCell>
                  <TableCell>Issue Qty</TableCell>
                  <TableCell>Remarks</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.length === 0 && (
                  <TableRow><TableCell colSpan={6} align="center" sx={{ py: 4, color: 'gray' }}>Select an MR to load items pending issue.</TableCell></TableRow>
                )}
                {items.map((it, idx) => {
                  const available = stockMap[it.item_id] ?? null;
                  return (
                    <TableRow key={it.tempId}>
                      <TableCell>{idx + 1}</TableCell>
                      <TableCell>{it.item_code}</TableCell>
                      <TableCell>{it.item_name}</TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: available !== null && available < it.quantity ? 'error.main' : 'success.main' }}>
                          {available !== null ? available : '-'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {readOnly ? it.quantity : (
                          <TextField type="number" size="small" sx={{ width: 100 }}
                            value={it.quantity}
                            onChange={(e) => handleQtyChange(it.tempId, Number(e.target.value))}
                            inputProps={{ min: 0, max: it.max_qty }} />
                        )}
                      </TableCell>
                      <TableCell><Typography variant="body2">{it.remarks || it.item_name}</Typography></TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {(isAdd || isEdit) && (
          <Box mt={3} display="flex" gap={2}>
            <Button type="submit" variant="contained" startIcon={<SaveIcon />} disabled={loading}>
              {loading ? 'Saving...' : isEdit ? 'Update Issue' : 'Issue Materials'}
            </Button>
            <Button variant="outlined" onClick={() => navigate('/stores/material-issues')}>Cancel</Button>
          </Box>
        )}
      </form>
    </Box>
  );
}
