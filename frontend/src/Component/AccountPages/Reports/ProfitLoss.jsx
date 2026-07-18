import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Card, CardContent, Table, TableHead, TableBody, TableRow, TableCell, TableContainer, Grid, Stack } from '@mui/material';
import { FiSearch, FiTrendingUp, FiDownload } from 'react-icons/fi';
import PageHeader from '../../Common/PageHeader';
import axios from 'axios';

const fsx = { "& .MuiInputBase-root": { fontSize: "0.88rem", height: 34 } };

const ProfitLoss = () => {
  const now = new Date();
  const [from, setFrom] = useState(`${now.getFullYear()}-04-01`);
  const [to, setTo] = useState(now.toISOString().slice(0, 10));
  const [data, setData] = useState(null);

  const search = async () => {
    const r = await axios.get('/api/accounts/reports/profit-loss', { params: { from, to } });
    setData(r.data);
  };

  return (
    <Box sx={{ p: { xs: 1.5, sm: 2, md: 3 } }}>
      <PageHeader title="Profit & Loss Statement" subtitle="Financial performance summary" icon={<FiTrendingUp size={22} />} />
      <Card sx={{ borderRadius: 2, boxShadow: "0 1px 6px rgba(0,0,0,0.05)", mb: 2.5, border: "1px solid #e2e8f0" }}>
        <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
          <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
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
        <>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Card sx={{ borderRadius: 2, boxShadow: "0 1px 6px rgba(0,0,0,0.05)", border: "1px solid #e2e8f0", height: '100%' }}>
                <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid', borderColor: 'divider', bgcolor: '#f0fdf4' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#166534', fontSize: '0.95rem' }}>Income</Typography>
                </Box>
                <CardContent sx={{ p: 0, "&:last-child": { pb: 0 } }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ bgcolor: "#f1f5f9", "& th": { fontWeight: 600, fontSize: "0.78rem", py: 0.5, color: "#475569" } }}>
                        <TableCell>Account</TableCell>
                        <TableCell align="right">Amount</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {data.income?.filter(i => i.amount > 0).map((r, i) => (
                        <TableRow key={i} sx={{ "&:hover": { bgcolor: "#f8fafc" } }}>
                          <TableCell sx={{ fontSize: "0.82rem", py: 0.5, borderBottom: "1px solid #f1f5f9" }}>{r.account_name}</TableCell>
                          <TableCell sx={{ fontSize: "0.82rem", py: 0.5, borderBottom: "1px solid #f1f5f9", fontFamily: 'monospace', textAlign: 'right' }}>₹{r.amount.toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                      <TableRow sx={{ bgcolor: '#f0fdf4' }}>
                        <TableCell sx={{ fontWeight: 700, fontSize: "0.84rem", py: 0.75 }}>Total Income</TableCell>
                        <TableCell sx={{ fontWeight: 700, fontSize: "0.84rem", py: 0.75, fontFamily: 'monospace', textAlign: 'right', color: '#166534' }}>₹{data.total_income?.toFixed(2)}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card sx={{ borderRadius: 2, boxShadow: "0 1px 6px rgba(0,0,0,0.05)", border: "1px solid #e2e8f0", height: '100%' }}>
                <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid', borderColor: 'divider', bgcolor: '#fef2f2' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#991b1b', fontSize: '0.95rem' }}>Expenses</Typography>
                </Box>
                <CardContent sx={{ p: 0, "&:last-child": { pb: 0 } }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ bgcolor: "#f1f5f9", "& th": { fontWeight: 600, fontSize: "0.78rem", py: 0.5, color: "#475569" } }}>
                        <TableCell>Account</TableCell>
                        <TableCell align="right">Amount</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {data.expenses?.filter(i => i.amount > 0).map((r, i) => (
                        <TableRow key={i} sx={{ "&:hover": { bgcolor: "#f8fafc" } }}>
                          <TableCell sx={{ fontSize: "0.82rem", py: 0.5, borderBottom: "1px solid #f1f5f9" }}>{r.account_name}</TableCell>
                          <TableCell sx={{ fontSize: "0.82rem", py: 0.5, borderBottom: "1px solid #f1f5f9", fontFamily: 'monospace', textAlign: 'right' }}>₹{r.amount.toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                      <TableRow sx={{ bgcolor: '#fef2f2' }}>
                        <TableCell sx={{ fontWeight: 700, fontSize: "0.84rem", py: 0.75 }}>Total Expenses</TableCell>
                        <TableCell sx={{ fontWeight: 700, fontSize: "0.84rem", py: 0.75, fontFamily: 'monospace', textAlign: 'right', color: '#991b1b' }}>₹{data.total_expenses?.toFixed(2)}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Card sx={{ mt: 2, borderRadius: 2, boxShadow: "0 1px 6px rgba(0,0,0,0.05)", border: "1px solid #e2e8f0" }}>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h5" sx={{ fontWeight: 800, color: data.net_profit >= 0 ? '#166534' : '#991b1b' }}>
                {data.net_profit >= 0 ? 'Net Profit' : 'Net Loss'}: ₹{Math.abs(data.net_profit).toFixed(2)}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>For period {from} to {to}</Typography>
            </CardContent>
          </Card>
        </>
      )}
    </Box>
  );
};

export default ProfitLoss;
