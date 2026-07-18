import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Button, Dialog, TextField, Select, MenuItem, FormControl, InputLabel, Switch, FormControlLabel, Card, CardContent, Table, TableHead, TableBody, TableRow, TableCell, TableContainer, Stack, Chip } from '@mui/material';
import { FiPlus, FiEdit2, FiTrash2, FiBookOpen, FiSearch } from 'react-icons/fi';
import PageHeader from '../../Common/PageHeader';
import axios from 'axios';

const API = '/api/accounts/coa';
const ACCOUNT_TYPES = ['Asset', 'Liability', 'Equity', 'Income', 'Expense'];
const fsx = { "& .MuiInputBase-root": { fontSize: "0.88rem", height: 34 }, "& .MuiInputLabel-root": { fontSize: "0.88rem", mt: -0.25 }, "& .MuiInputLabel-shrink": { mt: 0 } };

const ChartOfAccounts = () => {
  const [rows, setRows] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState(null);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ account_code: '', account_name: '', account_type: 'Asset', parent_id: '', is_group: false, opening_balance: 0, opening_balance_type: 'Dr', notes: '' });

  const fetch = useCallback(async () => {
    const r = await axios.get(API);
    setRows(r.data);
    setAccounts(r.data);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const handleSave = async () => {
    const payload = { ...form, parent_id: form.parent_id || null };
    if (edit) await axios.put(`${API}/${edit.id}`, payload);
    else await axios.post(API, payload);
    setOpen(false); setEdit(null); fetch();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this account?')) return;
    await axios.delete(`${API}/${id}`);
    fetch();
  };

  const openEdit = (row) => {
    setEdit(row);
    setForm({ account_code: row.account_code, account_name: row.account_name, account_type: row.account_type, parent_id: row.parent_id || '', is_group: row.is_group, opening_balance: row.opening_balance, opening_balance_type: row.opening_balance_type || 'Dr', notes: row.notes || '' });
    setOpen(true);
  };

  const filtered = rows.filter(r =>
    !search || r.account_code?.toLowerCase().includes(search.toLowerCase()) || r.account_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box sx={{ p: { xs: 1.5, sm: 2, md: 3 } }}>
      <PageHeader title="Chart of Accounts" subtitle="Manage your accounting ledger structure" icon={<FiBookOpen size={22} />} />
      <Box sx={{ display: 'flex', gap: { xs: 1, sm: 2 }, mb: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        <TextField placeholder="Search accounts..." size="small" value={search} onChange={(e) => setSearch(e.target.value)}
          sx={{ minWidth: 260, "& .MuiInputBase-root": { fontSize: "0.88rem", height: 34 } }}
          InputProps={{ startAdornment: <FiSearch size={14} style={{ marginRight: 6, color: '#94a3b8' }} /> }} />
        <Box sx={{ flex: 1 }} />
        <Button variant="contained" size="small" startIcon={<FiPlus />} onClick={() => { setEdit(null); setForm({ account_code: '', account_name: '', account_type: 'Asset', parent_id: '', is_group: false, opening_balance: 0, opening_balance_type: 'Dr', notes: '' }); setOpen(true); }}
          sx={{ textTransform: 'none', borderRadius: 1.5, py: 0.5, fontSize: '0.78rem' }}>New Account</Button>
      </Box>
      <Card sx={{ borderRadius: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
        <CardContent sx={{ p: 0, "&:last-child": { pb: 0 } }}>
          <TableContainer sx={{ maxHeight: 560, overflow: "auto" }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow sx={{ bgcolor: "#f1f5f9", "& th": { fontWeight: 700, fontSize: "0.9rem", py: 0.85, color: "#334155", borderBottom: "2px solid #e2e8f0" } }}>
                  <TableCell>Code</TableCell>
                  <TableCell>Account Name</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Group</TableCell>
                  <TableCell>Opening</TableCell>
                  <TableCell>Dr/Cr</TableCell>
                  <TableCell sx={{ width: 100 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map((r, i) => (
                  <TableRow key={r.id} sx={{ "&:hover": { bgcolor: "#eef2ff" }, bgcolor: i % 2 === 0 ? "#ffffff" : "#f8fafc" }}>
                    <TableCell sx={{ fontSize: "0.82rem", py: 0.75, borderBottom: "1px solid #f1f5f9", fontFamily: 'monospace', fontWeight: 600 }}>{r.account_code}</TableCell>
                    <TableCell sx={{ fontSize: "0.82rem", py: 0.75, borderBottom: "1px solid #f1f5f9" }}>
                      {r.account_name}
                      {r.parent && <Typography variant="caption" sx={{ ml: 1, color: 'text.disabled', fontSize: '0.7rem' }}>→ {r.parent.account_name}</Typography>}
                    </TableCell>
                    <TableCell sx={{ fontSize: "0.82rem", py: 0.75, borderBottom: "1px solid #f1f5f9" }}>
                      <Chip label={r.account_type} size="small" variant="outlined" sx={{ fontSize: '0.7rem', fontWeight: 600 }} />
                    </TableCell>
                    <TableCell sx={{ fontSize: "0.82rem", py: 0.75, borderBottom: "1px solid #f1f5f9" }}>
                      {r.is_group ? <Chip label="Group" size="small" color="primary" variant="outlined" sx={{ fontSize: '0.7rem' }} /> : <Chip label="Ledger" size="small" sx={{ fontSize: '0.7rem' }} />}
                    </TableCell>
                    <TableCell sx={{ fontSize: "0.82rem", py: 0.75, borderBottom: "1px solid #f1f5f9" }}>{Number(r.opening_balance || 0).toFixed(2)}</TableCell>
                    <TableCell sx={{ fontSize: "0.82rem", py: 0.75, borderBottom: "1px solid #f1f5f9" }}>{r.opening_balance_type || 'Dr'}</TableCell>
                    <TableCell sx={{ py: 0.5, borderBottom: "1px solid #f1f5f9" }}>
                      <Stack direction="row" spacing={0.25}>
                        <Button size="small" onClick={() => openEdit(r)} sx={{ minWidth: 28, p: 0.5, color: 'primary.main' }}><FiEdit2 size={14} /></Button>
                        <Button size="small" color="error" onClick={() => handleDelete(r.id)} sx={{ minWidth: 28, p: 0.5 }}><FiTrash2 size={14} /></Button>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow><TableCell colSpan={7} align="center" sx={{ py: 4, color: 'text.secondary', fontSize: '0.9rem' }}>No accounts found</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: 'var(--heading-color)' }}>{edit ? 'Edit Account' : 'New Account'}</Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField label="Account Code" value={form.account_code} onChange={(e) => setForm({ ...form, account_code: e.target.value })} required size="small" sx={fsx} />
            <TextField label="Account Name" value={form.account_name} onChange={(e) => setForm({ ...form, account_name: e.target.value })} required size="small" sx={fsx} />
            <FormControl size="small" fullWidth>
              <InputLabel sx={{ fontSize: '0.88rem' }}>Account Type</InputLabel>
              <Select value={form.account_type} label="Account Type" onChange={(e) => setForm({ ...form, account_type: e.target.value })} sx={{ fontSize: '0.88rem' }}>
                {ACCOUNT_TYPES.map((t) => <MenuItem key={t} value={t} sx={{ fontSize: '0.88rem' }}>{t}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl size="small" fullWidth>
              <InputLabel sx={{ fontSize: '0.88rem' }}>Parent Account</InputLabel>
              <Select value={form.parent_id} label="Parent Account" onChange={(e) => setForm({ ...form, parent_id: e.target.value })} sx={{ fontSize: '0.88rem' }}>
                <MenuItem value="" sx={{ fontSize: '0.88rem' }}>None</MenuItem>
                {accounts.filter(a => a.is_group).map((a) => <MenuItem key={a.id} value={a.id} sx={{ fontSize: '0.88rem' }}>{a.account_code} - {a.account_name}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControlLabel control={<Switch checked={form.is_group} onChange={(e) => setForm({ ...form, is_group: e.target.checked })} />} label="Is Group" />
            <TextField label="Opening Balance" type="number" size="small" value={form.opening_balance} onChange={(e) => setForm({ ...form, opening_balance: e.target.value })} sx={fsx} />
            <FormControl size="small" fullWidth>
              <InputLabel sx={{ fontSize: '0.88rem' }}>Dr/Cr</InputLabel>
              <Select value={form.opening_balance_type} label="Dr/Cr" onChange={(e) => setForm({ ...form, opening_balance_type: e.target.value })} sx={{ fontSize: '0.88rem' }}>
                <MenuItem value="Dr" sx={{ fontSize: '0.88rem' }}>Dr</MenuItem>
                <MenuItem value="Cr" sx={{ fontSize: '0.88rem' }}>Cr</MenuItem>
              </Select>
            </FormControl>
            <TextField label="Notes" multiline rows={2} size="small" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} sx={fsx} />
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', mt: 1 }}>
              <Button variant="outlined" size="small" onClick={() => setOpen(false)} sx={{ textTransform: 'none', borderRadius: 1.5 }}>Cancel</Button>
              <Button variant="contained" size="small" onClick={handleSave} sx={{ textTransform: 'none', borderRadius: 1.5 }}>{edit ? 'Update' : 'Create'}</Button>
            </Box>
          </Box>
        </Box>
      </Dialog>
    </Box>
  );
};

export default ChartOfAccounts;
