import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Button, TextField, Select, MenuItem, FormControl, InputLabel, Card, CardContent, Grid, Table, TableHead, TableBody, TableRow, TableCell, IconButton, Stack } from '@mui/material';
import { FiPlus, FiTrash2, FiSave, FiX, FiDollarSign } from 'react-icons/fi';
import { useParams, useNavigate } from 'react-router-dom';
import PageHeader from '../../Common/PageHeader';
import axios from 'axios';

const VOUCHER_TYPE_MAP = {
  'sales': { id: 1, code: 'SI', title: 'Sales Invoice' },
  'purchase': { id: 2, code: 'PI', title: 'Purchase Invoice' },
  'debit-note': { id: 3, code: 'DN', title: 'Debit Note' },
  'credit-note': { id: 4, code: 'CN', title: 'Credit Note' },
  'payment': { id: 5, code: 'PV', title: 'Payment Voucher' },
  'receipt': { id: 6, code: 'RV', title: 'Receipt Voucher' },
  'journal': { id: 7, code: 'JV', title: 'Journal Voucher' },
  'contra': { id: 8, code: 'CV', title: 'Contra Voucher' },
};

const fsx = { "& .MuiInputBase-root": { fontSize: "0.88rem", height: 34 }, "& .MuiInputLabel-root": { fontSize: "0.88rem", mt: -0.25 }, "& .MuiInputLabel-shrink": { mt: 0 } };
const tfsx = { "& .MuiInputBase-root": { fontSize: "0.84rem", height: 44 } };

const VoucherForm = () => {
  const { type, id } = useParams();
  const navigate = useNavigate();
  const vtype = VOUCHER_TYPE_MAP[type] || VOUCHER_TYPE_MAP.journal;
  const [accounts, setAccounts] = useState([]);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [referenceNo, setReferenceNo] = useState('');
  const [referenceDate, setReferenceDate] = useState('');
  const [narration, setNarration] = useState('');
  const [items, setItems] = useState([{ account_id: '', debit: 0, credit: 0, against_account_id: '', narration: '' }]);

  const fetchAccounts = useCallback(async () => {
    const r = await axios.get('/api/accounts/coa');
    setAccounts(r.data.filter(a => !a.is_group));
  }, []);

  useEffect(() => { fetchAccounts(); if (id) fetchVoucher(); }, [id, fetchAccounts]);

  const fetchVoucher = async () => {
    const r = await axios.get(`/api/accounts/vouchers/${id}`);
    const v = r.data;
    setDate(v.date);
    setReferenceNo(v.reference_no || '');
    setReferenceDate(v.reference_date || '');
    setNarration(v.narration || '');
    setItems(v.items.map(i => ({ account_id: i.account_id, debit: i.debit, credit: i.credit, against_account_id: i.against_account_id || '', narration: i.narration || '' })));
  };

  const addRow = () => setItems([...items, { account_id: '', debit: 0, credit: 0, against_account_id: '', narration: '' }]);
  const removeRow = (i) => { if (items.length > 1) setItems(items.filter((_, idx) => idx !== i)); };
  const updateItem = (i, field, value) => { const copy = [...items]; copy[i][field] = value; setItems(copy); };

  const totalDebit = items.reduce((s, i) => s + parseFloat(i.debit || 0), 0);
  const totalCredit = items.reduce((s, i) => s + parseFloat(i.credit || 0), 0);
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01;

  const handleSubmit = async (status) => {
    const payload = {
      voucher_type_id: vtype.id, date,
      reference_no: referenceNo || undefined, reference_date: referenceDate || undefined,
      narration: narration || undefined,
      items: items.map(i => ({ account_id: i.account_id, debit: parseFloat(i.debit || 0), credit: parseFloat(i.credit || 0), against_account_id: i.against_account_id || null, narration: i.narration || null })),
    };
    if (id) await axios.put(`/api/accounts/vouchers/${id}`, payload);
    else await axios.post('/api/accounts/vouchers', payload);
    navigate(type === 'sales' || type === 'purchase' || type === 'debit-note' || type === 'credit-note' ? `/invoice/${type}` : `/accounts/${type}`);
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1600, fontSize: "0.95rem" }}>
      <PageHeader title={vtype.title} subtitle={`Enter ${vtype.title.toLowerCase()} details`} icon={<FiDollarSign size={22} />}
        actions={
          <Stack direction="row" spacing={0.75}>
            <Button variant="outlined" size="small" startIcon={<FiX />} onClick={() => navigate(-1)}
              sx={{ textTransform: 'none', borderRadius: 1.5, py: 0.5, fontSize: '0.78rem' }}>Cancel</Button>
            <Button variant="contained" size="small" startIcon={<FiSave />} onClick={() => handleSubmit('Posted')} disabled={!isBalanced}
              sx={{ textTransform: 'none', borderRadius: 1.5, py: 0.5, fontSize: '0.78rem' }}>Save & Post</Button>
          </Stack>
        } />

      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1, p: 1, borderRadius: 1.5, mb: 2, bgcolor: "#f8fafc", border: "1px solid #e2e8f0", borderLeft: "3px solid #3b82f6" }}>
        <Typography variant="body2" sx={{ fontSize: '0.82rem', color: '#475569' }}>
          {isBalanced
            ? `Total Debit: ₹${totalDebit.toFixed(2)} = Total Credit: ₹${totalCredit.toFixed(2)} — Balanced ✓`
            : `Debit: ₹${totalDebit.toFixed(2)} | Credit: ₹${totalCredit.toFixed(2)} — Not balanced`}
        </Typography>
      </Box>

      <Card sx={{ borderRadius: 2, boxShadow: "0 1px 6px rgba(0,0,0,0.05)", mb: 2.5, border: "1px solid #e2e8f0" }}>
        <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
          <Typography variant="subtitle2" sx={{ mb: 1.5, color: "var(--heading-color)", fontWeight: 700, fontSize: "1rem" }}>Header Details</Typography>
          <Grid container spacing={1}>
            <Grid item xs={12} sm={6} sx={{ width: 200, flex: "0 0 auto" }}>
              <TextField label="Date" type="date" size="small" value={date} onChange={(e) => setDate(e.target.value)} InputLabelProps={{ shrink: true }} sx={fsx} fullWidth />
            </Grid>
            <Grid item xs={12} sm={6} sx={{ width: 200, flex: "0 0 auto" }}>
              <TextField label="Reference No" size="small" value={referenceNo} onChange={(e) => setReferenceNo(e.target.value)} sx={fsx} />
            </Grid>
            <Grid item xs={12} sm={6} sx={{ width: 200, flex: "0 0 auto" }}>
              <TextField label="Reference Date" type="date" size="small" value={referenceDate} onChange={(e) => setReferenceDate(e.target.value)} InputLabelProps={{ shrink: true }} sx={fsx} />
            </Grid>
            <Grid item xs={12} sm={6} sx={{ width: 400, flex: "0 0 auto" }}>
              <TextField label="Narration" size="small" value={narration} onChange={(e) => setNarration(e.target.value)} sx={fsx} fullWidth />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card sx={{ borderRadius: 2, boxShadow: "0 1px 6px rgba(0,0,0,0.05)", mb: 2.5, border: "1px solid #e2e8f0" }}>
        <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
            <Typography variant="subtitle2" sx={{ color: "var(--heading-color)", fontWeight: 700, fontSize: "1rem" }}>Accounting Entries</Typography>
            <Button size="small" variant="outlined" startIcon={<FiPlus />} onClick={addRow}
              sx={{ textTransform: 'none', borderRadius: 1.5, py: 0.25, fontSize: '0.75rem' }}>Add Row</Button>
          </Box>
          <Box sx={{ overflowX: "auto" }}>
            <Table size="small" sx={{ minWidth: 900 }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, whiteSpace: "nowrap", fontSize: "0.84rem", py: 0.75, color: "#475569" }}>Account</TableCell>
                  <TableCell sx={{ fontWeight: 700, whiteSpace: "nowrap", fontSize: "0.84rem", py: 0.75, color: "#475569" }}>Debit</TableCell>
                  <TableCell sx={{ fontWeight: 700, whiteSpace: "nowrap", fontSize: "0.84rem", py: 0.75, color: "#475569" }}>Credit</TableCell>
                  <TableCell sx={{ fontWeight: 700, whiteSpace: "nowrap", fontSize: "0.84rem", py: 0.75, color: "#475569" }}>Against</TableCell>
                  <TableCell sx={{ fontWeight: 700, whiteSpace: "nowrap", fontSize: "0.84rem", py: 0.75, color: "#475569" }}>Narration</TableCell>
                  <TableCell sx={{ width: 40 }}></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.map((item, i) => (
                  <TableRow key={i}>
                    <TableCell sx={{ minWidth: 200 }}>
                      <FormControl fullWidth size="small">
                        <Select value={item.account_id} onChange={(e) => updateItem(i, 'account_id', e.target.value)} displayEmpty sx={{ fontSize: '0.84rem' }}>
                          <MenuItem value="" disabled sx={{ fontSize: '0.84rem' }}>Select account</MenuItem>
                          {accounts.map((a) => <MenuItem key={a.id} value={a.id} sx={{ fontSize: '0.84rem' }}>{a.account_code} - {a.account_name}</MenuItem>)}
                        </Select>
                      </FormControl>
                    </TableCell>
                    <TableCell sx={{ minWidth: 120 }}><TextField type="number" size="small" value={item.debit} onChange={(e) => updateItem(i, 'debit', e.target.value)} sx={tfsx} /></TableCell>
                    <TableCell sx={{ minWidth: 120 }}><TextField type="number" size="small" value={item.credit} onChange={(e) => updateItem(i, 'credit', e.target.value)} sx={tfsx} /></TableCell>
                    <TableCell sx={{ minWidth: 180 }}>
                      <FormControl fullWidth size="small">
                        <Select value={item.against_account_id} onChange={(e) => updateItem(i, 'against_account_id', e.target.value)} displayEmpty sx={{ fontSize: '0.84rem' }}>
                          <MenuItem value="" sx={{ fontSize: '0.84rem' }}>None</MenuItem>
                          {accounts.map((a) => <MenuItem key={a.id} value={a.id} sx={{ fontSize: '0.84rem' }}>{a.account_code}</MenuItem>)}
                        </Select>
                      </FormControl>
                    </TableCell>
                    <TableCell sx={{ minWidth: 160 }}><TextField size="small" value={item.narration} onChange={(e) => updateItem(i, 'narration', e.target.value)} sx={tfsx} /></TableCell>
                    <TableCell><IconButton onClick={() => removeRow(i)} size="small" color="error" sx={{ p: 0.5 }}><FiTrash2 size={14} /></IconButton></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default VoucherForm;
