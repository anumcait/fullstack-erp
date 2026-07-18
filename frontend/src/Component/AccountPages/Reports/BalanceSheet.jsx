import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Card, CardContent, Table, TableHead, TableBody, TableRow, TableCell, Grid, Stack } from '@mui/material';
import { FiSearch, FiPieChart, FiDownload } from 'react-icons/fi';
import PageHeader from '../../Common/PageHeader';
import axios from 'axios';

const fsx = { "& .MuiInputBase-root": { fontSize: "0.88rem", height: 34 } };

const BalanceSheet = () => {
  const now = new Date();
  const [asOn, setAsOn] = useState(now.toISOString().slice(0, 10));
  const [plFrom, setPlFrom] = useState(`${now.getFullYear()}-04-01`);
  const [plTo, setPlTo] = useState(now.toISOString().slice(0, 10));
  const [data, setData] = useState(null);

  const search = async () => {
    const r = await axios.get('/api/accounts/reports/balance-sheet', { params: { as_on: asOn, pl_from: plFrom, pl_to: plTo } });
    setData(r.data);
  };

  return (
    <Box sx={{ p: { xs: 1.5, sm: 2, md: 3 } }}>
      <PageHeader title="Balance Sheet" subtitle="Financial position snapshot" icon={<FiPieChart size={22} />} />
      <Card sx={{ borderRadius: 2, boxShadow: "0 1px 6px rgba(0,0,0,0.05)", mb: 2.5, border: "1px solid #e2e8f0" }}>
        <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
          <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
            <TextField label="As On" type="date" size="small" value={asOn} onChange={(e) => setAsOn(e.target.value)} InputLabelProps={{ shrink: true }} sx={fsx} />
            <Typography variant="body2" sx={{ fontSize: '0.82rem', color: 'text.secondary' }}>PL Period:</Typography>
            <TextField label="From" type="date" size="small" value={plFrom} onChange={(e) => setPlFrom(e.target.value)} InputLabelProps={{ shrink: true }} sx={fsx} />
            <TextField label="To" type="date" size="small" value={plTo} onChange={(e) => setPlTo(e.target.value)} InputLabelProps={{ shrink: true }} sx={fsx} />
            <Button variant="contained" size="small" startIcon={<FiSearch />} onClick={search}
              sx={{ textTransform: 'none', borderRadius: 1.5, py: 0.5, fontSize: '0.78rem' }}>Show</Button>
            {data && <Button variant="outlined" size="small" startIcon={<FiDownload />}
              sx={{ textTransform: 'none', borderRadius: 1.5, py: 0.5, fontSize: '0.78rem' }}>Export</Button>}
          </Stack>
        </CardContent>
      </Card>

      {data && (
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Card sx={{ borderRadius: 2, boxShadow: "0 1px 6px rgba(0,0,0,0.05)", border: "1px solid #e2e8f0", height: '100%' }}>
              <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid', borderColor: 'divider', bgcolor: '#f0f4ff' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1e40af', fontSize: '0.95rem' }}>Assets</Typography>
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
                    {data.assets?.filter(a => a.balance > 0).map((r, i) => (
                      <TableRow key={i} sx={{ "&:hover": { bgcolor: "#f8fafc" } }}>
                        <TableCell sx={{ fontSize: "0.82rem", py: 0.5, borderBottom: "1px solid #f1f5f9" }}>{r.account_name}</TableCell>
                        <TableCell sx={{ fontSize: "0.82rem", py: 0.5, borderBottom: "1px solid #f1f5f9", fontFamily: 'monospace', textAlign: 'right' }}>₹{r.balance.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow sx={{ bgcolor: '#f0f4ff' }}>
                      <TableCell sx={{ fontWeight: 700, fontSize: "0.84rem", py: 0.75 }}>Total Assets</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: "0.84rem", py: 0.75, fontFamily: 'monospace', textAlign: 'right', color: '#1e40af' }}>₹{data.total_assets?.toFixed(2)}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card sx={{ borderRadius: 2, boxShadow: "0 1px 6px rgba(0,0,0,0.05)", border: "1px solid #e2e8f0", height: '100%' }}>
              <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid', borderColor: 'divider', bgcolor: '#fef2f2' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#991b1b', fontSize: '0.95rem' }}>Liabilities & Equity</Typography>
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
                    {data.liabilities?.filter(l => l.balance > 0).map((r, i) => (
                      <TableRow key={i} sx={{ "&:hover": { bgcolor: "#f8fafc" } }}>
                        <TableCell sx={{ fontSize: "0.82rem", py: 0.5, borderBottom: "1px solid #f1f5f9" }}>{r.account_name}</TableCell>
                        <TableCell sx={{ fontSize: "0.82rem", py: 0.5, borderBottom: "1px solid #f1f5f9", fontFamily: 'monospace', textAlign: 'right' }}>₹{r.balance.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                    {data.equity?.filter(e => e.balance > 0).map((r, i) => (
                      <TableRow key={i} sx={{ "&:hover": { bgcolor: "#f8fafc" } }}>
                        <TableCell sx={{ fontSize: "0.82rem", py: 0.5, borderBottom: "1px solid #f1f5f9" }}>{r.account_name}</TableCell>
                        <TableCell sx={{ fontSize: "0.82rem", py: 0.5, borderBottom: "1px solid #f1f5f9", fontFamily: 'monospace', textAlign: 'right' }}>₹{r.balance.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow sx={{ bgcolor: '#fef2f2' }}>
                      <TableCell sx={{ fontWeight: 700, fontSize: "0.84rem", py: 0.75 }}>Total Liabilities & Equity</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: "0.84rem", py: 0.75, fontFamily: 'monospace', textAlign: 'right', color: '#991b1b' }}>₹{data.total_liabilities?.toFixed(2)}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default BalanceSheet;
