import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Card, CardContent, Table, TableHead, TableBody, TableRow, TableCell, TableContainer, Stack } from '@mui/material';
import { FiSearch, FiBarChart, FiDownload } from 'react-icons/fi';
import PageHeader from '../../Common/PageHeader';
import StatusChip from '../../Common/StatusChip';
import axios from 'axios';

const fsx = { "& .MuiInputBase-root": { fontSize: "0.88rem", height: 34 } };

const TrialBalance = () => {
  const [asOn, setAsOn] = useState(new Date().toISOString().slice(0, 10));
  const [rows, setRows] = useState([]);

  const search = async () => {
    const r = await axios.get('/api/accounts/trial-balance', { params: { as_on: asOn } });
    setRows(r.data);
  };

  const totalDr = rows.reduce((s, r) => s + r.debit + (r.opening_type === 'Dr' ? r.opening : 0), 0);
  const totalCr = rows.reduce((s, r) => s + r.credit + (r.opening_type === 'Cr' ? r.opening : 0), 0);

  return (
    <Box sx={{ p: { xs: 1.5, sm: 2, md: 3 } }}>
      <PageHeader title="Trial Balance" subtitle="Check debit/credit balances as on a date" icon={<FiBarChart size={22} />} />
      <Card sx={{ borderRadius: 2, boxShadow: "0 1px 6px rgba(0,0,0,0.05)", mb: 2.5, border: "1px solid #e2e8f0" }}>
        <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <TextField label="As On" type="date" size="small" value={asOn} onChange={(e) => setAsOn(e.target.value)} InputLabelProps={{ shrink: true }} sx={fsx} />
            <Button variant="contained" size="small" startIcon={<FiSearch />} onClick={search}
              sx={{ textTransform: 'none', borderRadius: 1.5, py: 0.5, fontSize: '0.78rem' }}>Show</Button>
            {rows.length > 0 && <Button variant="outlined" size="small" startIcon={<FiDownload />}
              sx={{ textTransform: 'none', borderRadius: 1.5, py: 0.5, fontSize: '0.78rem' }}>Export</Button>}
          </Stack>
        </CardContent>
      </Card>
      {rows.length > 0 && (
        <Card sx={{ borderRadius: 2, boxShadow: "0 1px 6px rgba(0,0,0,0.05)", border: "1px solid #e2e8f0" }}>
          <CardContent sx={{ p: 0, "&:last-child": { pb: 0 } }}>
            <TableContainer sx={{ maxHeight: 500, overflow: "auto" }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow sx={{ bgcolor: "#f1f5f9", "& th": { fontWeight: 700, fontSize: "0.84rem", py: 0.75, color: "#475569", borderBottom: "2px solid #e2e8f0" } }}>
                    <TableCell>Account</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Opening</TableCell>
                    <TableCell>Debit</TableCell>
                    <TableCell>Credit</TableCell>
                    <TableCell>Closing</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((r, i) => (
                    <TableRow key={i} sx={{ "&:hover": { bgcolor: "#eef2ff" }, bgcolor: i % 2 === 0 ? "#ffffff" : "#f8fafc" }}>
                      <TableCell sx={{ fontSize: "0.82rem", py: 0.75, borderBottom: "1px solid #f1f5f9" }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.82rem' }}>{r.account_name}</Typography>
                        <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '0.7rem' }}>{r.account_code}</Typography>
                      </TableCell>
                      <TableCell sx={{ fontSize: "0.82rem", py: 0.75, borderBottom: "1px solid #f1f5f9" }}><StatusChip status={r.account_type} /></TableCell>
                      <TableCell sx={{ fontSize: "0.82rem", py: 0.75, borderBottom: "1px solid #f1f5f9", fontFamily: 'monospace' }}>{r.opening} {r.opening_type}</TableCell>
                      <TableCell sx={{ fontSize: "0.82rem", py: 0.75, borderBottom: "1px solid #f1f5f9", fontFamily: 'monospace' }}>{r.debit?.toFixed(2)}</TableCell>
                      <TableCell sx={{ fontSize: "0.82rem", py: 0.75, borderBottom: "1px solid #f1f5f9", fontFamily: 'monospace' }}>{r.credit?.toFixed(2)}</TableCell>
                      <TableCell sx={{ fontSize: "0.82rem", py: 0.75, borderBottom: "1px solid #f1f5f9", fontFamily: 'monospace', fontWeight: 600 }}>{r.closing?.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow sx={{ bgcolor: '#f1f5f9' }}>
                    <TableCell colSpan={3} sx={{ fontWeight: 700, fontSize: "0.84rem", py: 0.75 }}>Total</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: "0.84rem", py: 0.75, fontFamily: 'monospace' }}>{totalDr.toFixed(2)}</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: "0.84rem", py: 0.75, fontFamily: 'monospace' }}>{totalCr.toFixed(2)}</TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default TrialBalance;
