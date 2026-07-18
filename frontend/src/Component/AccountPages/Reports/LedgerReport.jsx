import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, TextField, FormControl, InputLabel, Select, MenuItem, Button, Card, CardContent, Table, TableHead, TableBody, TableRow, TableCell, TableContainer, Stack } from '@mui/material';
import { FiSearch, FiBookOpen, FiDownload } from 'react-icons/fi';
import PageHeader from '../../Common/PageHeader';
import axios from 'axios';

const fsx = { "& .MuiInputBase-root": { fontSize: "0.88rem", height: 34 }, "& .MuiInputLabel-root": { fontSize: "0.88rem", mt: -0.25 } };

const LedgerReport = () => {
  const [accounts, setAccounts] = useState([]);
  const [accountId, setAccountId] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [data, setData] = useState(null);

  const fetchAccounts = useCallback(async () => {
    const r = await axios.get('/api/accounts/coa');
    setAccounts(r.data.filter(a => !a.is_group));
  }, []);

  useEffect(() => { fetchAccounts(); }, [fetchAccounts]);

  const search = async () => {
    if (!accountId) return;
    const params = { account_id: accountId };
    if (from) params.from = from;
    if (to) params.to = to;
    const r = await axios.get('/api/accounts/ledger', { params });
    setData(r.data);
  };

  return (
    <Box sx={{ p: { xs: 1.5, sm: 2, md: 3 } }}>
      <PageHeader title="General Ledger" subtitle="View account-wise transaction history" icon={<FiBookOpen size={22} />} />
      <Card sx={{ borderRadius: 2, boxShadow: "0 1px 6px rgba(0,0,0,0.05)", mb: 2.5, border: "1px solid #e2e8f0" }}>
        <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
          <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
            <FormControl size="small" sx={{ minWidth: 250 }}>
              <InputLabel sx={{ fontSize: '0.88rem' }}>Account</InputLabel>
              <Select value={accountId} label="Account" onChange={(e) => setAccountId(e.target.value)} sx={{ fontSize: '0.88rem' }}>
                {accounts.map((a) => <MenuItem key={a.id} value={a.id} sx={{ fontSize: '0.88rem' }}>{a.account_code} - {a.account_name}</MenuItem>)}
              </Select>
            </FormControl>
            <TextField label="From" type="date" size="small" value={from} onChange={(e) => setFrom(e.target.value)} InputLabelProps={{ shrink: true }} sx={fsx} />
            <TextField label="To" type="date" size="small" value={to} onChange={(e) => setTo(e.target.value)} InputLabelProps={{ shrink: true }} sx={fsx} />
            <Button variant="contained" size="small" startIcon={<FiSearch />} onClick={search}
              sx={{ textTransform: 'none', borderRadius: 1.5, py: 0.5, fontSize: '0.78rem' }}>Show</Button>
            {data && <Button variant="outlined" size="small" startIcon={<FiDownload />}
              sx={{ textTransform: 'none', borderRadius: 1.5, py: 0.5, fontSize: '0.78rem' }}>Export</Button>}
          </Stack>
        </CardContent>
      </Card>

      {data && (
        <Card sx={{ borderRadius: 2, boxShadow: "0 1px 6px rgba(0,0,0,0.05)", border: "1px solid #e2e8f0" }}>
          <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'grey.50' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'var(--heading-color)', fontSize: '0.95rem' }}>
              {data.account?.account_name} ({data.account?.account_code})
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
              Opening Balance: {data.opening_balance} {data.opening_balance_type}
            </Typography>
          </Box>
          <CardContent sx={{ p: 0, "&:last-child": { pb: 0 } }}>
            <TableContainer sx={{ maxHeight: 500, overflow: "auto" }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow sx={{ bgcolor: "#f1f5f9", "& th": { fontWeight: 700, fontSize: "0.84rem", py: 0.75, color: "#475569", borderBottom: "2px solid #e2e8f0", position: "sticky", top: 0, zIndex: 2, bgcolor: "#f1f5f9" } }}>
                    <TableCell>Date</TableCell>
                    <TableCell>Voucher</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Narration</TableCell>
                    <TableCell>Against</TableCell>
                    <TableCell>Debit</TableCell>
                    <TableCell>Credit</TableCell>
                    <TableCell>Balance</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow sx={{ bgcolor: '#f8fafc' }}>
                    <TableCell sx={{ fontSize: "0.82rem", py: 0.75, borderBottom: "1px solid #f1f5f9" }} colSpan={5}><Typography variant="caption" sx={{ fontWeight: 600, fontStyle: 'italic' }}>Opening Balance</Typography></TableCell>
                    <TableCell sx={{ fontSize: "0.82rem", py: 0.75, borderBottom: "1px solid #f1f5f9" }}>-</TableCell>
                    <TableCell sx={{ fontSize: "0.82rem", py: 0.75, borderBottom: "1px solid #f1f5f9" }}>-</TableCell>
                    <TableCell sx={{ fontSize: "0.82rem", py: 0.75, borderBottom: "1px solid #f1f5f9", fontFamily: 'monospace', fontWeight: 600 }}>{data.opening_balance} {data.opening_balance_type}</TableCell>
                  </TableRow>
                  {data.entries?.map((e, i) => (
                    <TableRow key={i} sx={{ "&:hover": { bgcolor: "#eef2ff" }, bgcolor: i % 2 === 0 ? "#ffffff" : "#f8fafc" }}>
                      <TableCell sx={{ fontSize: "0.82rem", py: 0.75, borderBottom: "1px solid #f1f5f9" }}>{e.date}</TableCell>
                      <TableCell sx={{ fontSize: "0.82rem", py: 0.75, borderBottom: "1px solid #f1f5f9", fontFamily: 'monospace' }}>{e.voucher_no}</TableCell>
                      <TableCell sx={{ fontSize: "0.82rem", py: 0.75, borderBottom: "1px solid #f1f5f9" }}>{e.voucher_type}</TableCell>
                      <TableCell sx={{ fontSize: "0.82rem", py: 0.75, borderBottom: "1px solid #f1f5f9", maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.narration}</TableCell>
                      <TableCell sx={{ fontSize: "0.82rem", py: 0.75, borderBottom: "1px solid #f1f5f9" }}>{e.against}</TableCell>
                      <TableCell sx={{ fontSize: "0.82rem", py: 0.75, borderBottom: "1px solid #f1f5f9", fontFamily: 'monospace' }}>{e.debit?.toFixed(2)}</TableCell>
                      <TableCell sx={{ fontSize: "0.82rem", py: 0.75, borderBottom: "1px solid #f1f5f9", fontFamily: 'monospace' }}>{e.credit?.toFixed(2)}</TableCell>
                      <TableCell sx={{ fontSize: "0.82rem", py: 0.75, borderBottom: "1px solid #f1f5f9", fontFamily: 'monospace', fontWeight: 600 }}>{e.balance?.toFixed(2)} {e.balance_type}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default LedgerReport;
