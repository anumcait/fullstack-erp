import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Button, TextField, FormControl, InputLabel, Select, MenuItem, Dialog, Card, CardContent, Table, TableHead, TableBody, TableRow, TableCell, TableContainer } from '@mui/material';
import { FiPlus, FiTrash2, FiTarget } from 'react-icons/fi';
import { DataGrid } from '@mui/x-data-grid';
import PageHeader from '../../Common/PageHeader';
import axios from 'axios';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTH_KEYS = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'];
const fsx = { "& .MuiInputBase-root": { fontSize: "0.88rem", height: 34 }, "& .MuiInputLabel-root": { fontSize: "0.88rem", mt: -0.25 } };

const BudgetPage = () => {
  const [fys, setFys] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [rows, setRows] = useState([]);
  const [fyId, setFyId] = useState('');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ account_id: '', monthly: Array(12).fill(0) });

  const fetch = useCallback(async () => {
    const params = fyId ? { financial_year_id: fyId } : {};
    const r = await axios.get('/api/accounts/budgets', { params });
    setRows(r.data);
  }, [fyId]);

  useEffect(() => {
    axios.get('/api/accounts/settings').then(r => setFys(r.data.financial_years));
    axios.get('/api/accounts/coa').then(r => setAccounts(r.data.filter(a => !a.is_group)));
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const handleSave = async () => {
    await axios.post('/api/accounts/budgets', { financial_year_id: fyId, account_id: form.account_id, monthly_amounts: form.monthly });
    setOpen(false); fetch();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this budget?')) return;
    await axios.delete(`/api/accounts/budgets/${id}`);
    fetch();
  };

  const columns = [
    { field: 'account_name', headerName: 'Account', flex: 1, valueGetter: (p) => p.row.account?.account_name },
    ...MONTH_KEYS.map((m) => ({ field: m, headerName: m.charAt(0).toUpperCase() + m.slice(1), width: 80, type: 'number' })),
    { field: 'actions', headerName: '', width: 80, sortable: false,
      renderCell: (p) => <Button size="small" color="error" onClick={() => handleDelete(p.row.id)} sx={{ minWidth: 28, p: 0.5 }}><FiTrash2 size={14} /></Button>,
    },
  ];

  return (
    <Box sx={{ p: { xs: 1.5, sm: 2, md: 3 } }}>
      <PageHeader title="Budget Management" subtitle="Set monthly budget targets for accounts" icon={<FiTarget size={22} />}
        actions={
          <Button variant="contained" size="small" startIcon={<FiPlus />} disabled={!fyId}
            onClick={() => { setForm({ account_id: '', monthly: Array(12).fill(0) }); setOpen(true); }}
            sx={{ textTransform: 'none', borderRadius: 1.5, py: 0.5, fontSize: '0.78rem' }}>Add Budget</Button>
        } />
      <Box sx={{ display: 'flex', gap: { xs: 1, sm: 2 }, mb: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        <FormControl size="small" sx={{ minWidth: 220 }}>
          <InputLabel sx={{ fontSize: '0.88rem' }}>Financial Year</InputLabel>
          <Select value={fyId} label="Financial Year" onChange={(e) => setFyId(e.target.value)} sx={{ fontSize: '0.88rem' }}>
            <MenuItem value="" sx={{ fontSize: '0.88rem' }}>All</MenuItem>
            {fys.map((fy) => <MenuItem key={fy.id} value={fy.id} sx={{ fontSize: '0.88rem' }}>{fy.name}</MenuItem>)}
          </Select>
        </FormControl>
      </Box>
      <Card sx={{ borderRadius: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
        <CardContent sx={{ p: 0, "&:last-child": { pb: 0 } }}>
          <DataGrid rows={rows} columns={columns} getRowId={(r) => r.id} autoHeight pageSizeOptions={[25]} initialState={{ pagination: { paginationModel: { pageSize: 25 } } }}
            sx={{ border: 'none', "& .MuiDataGrid-cell": { fontSize: '0.82rem' }, "& .MuiDataGrid-columnHeaderTitle": { fontWeight: 700, fontSize: '0.78rem' } }} />
        </CardContent>
      </Card>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: 'var(--heading-color)' }}>Budget Entry</Typography>
          <FormControl size="small" fullWidth sx={{ mb: 2 }}>
            <InputLabel sx={{ fontSize: '0.88rem' }}>Account</InputLabel>
            <Select value={form.account_id} label="Account" onChange={(e) => setForm({ ...form, account_id: e.target.value })} sx={{ fontSize: '0.88rem' }}>
              {accounts.map((a) => <MenuItem key={a.id} value={a.id} sx={{ fontSize: '0.88rem' }}>{a.account_code} - {a.account_name}</MenuItem>)}
            </Select>
          </FormControl>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1 }}>
            {MONTHS.map((m, i) => (
              <TextField key={m} label={m} type="number" size="small" value={form.monthly[i]}
                onChange={(e) => { const copy = [...form.monthly]; copy[i] = parseFloat(e.target.value) || 0; setForm({ ...form, monthly: copy }); }} sx={fsx} />
            ))}
          </Box>
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', mt: 2 }}>
            <Button variant="outlined" size="small" onClick={() => setOpen(false)} sx={{ textTransform: 'none', borderRadius: 1.5 }}>Cancel</Button>
            <Button variant="contained" size="small" onClick={handleSave} sx={{ textTransform: 'none', borderRadius: 1.5 }}>Save</Button>
          </Box>
        </Box>
      </Dialog>
    </Box>
  );
};

export default BudgetPage;
