import React, { useState } from 'react';
import { Box, Typography, Button, FormControl, InputLabel, Select, MenuItem, Card, CardContent, Table, TableHead, TableBody, TableRow, TableCell, TableContainer, Stack } from '@mui/material';
import { FiSearch, FiFileText } from 'react-icons/fi';
import PageHeader from '../../Common/PageHeader';
import axios from 'axios';

const APReport = () => {
  const [type, setType] = useState('payable');
  const [rows, setRows] = useState([]);

  const search = async () => {
    const r = await axios.get('/api/accounts/reports/aging', { params: { type } });
    setRows(r.data);
  };

  return (
    <Box sx={{ p: { xs: 1.5, sm: 2, md: 3 } }}>
      <PageHeader title={type === 'payable' ? 'Accounts Payable' : 'Accounts Receivable'}
        subtitle="Aging analysis of payables and receivables" icon={<FiFileText size={22} />} />
      <Card sx={{ borderRadius: 2, boxShadow: "0 1px 6px rgba(0,0,0,0.05)", mb: 2.5, border: "1px solid #e2e8f0" }}>
        <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <FormControl size="small" sx={{ minWidth: 220 }}>
              <InputLabel sx={{ fontSize: '0.88rem' }}>Report Type</InputLabel>
              <Select value={type} label="Report Type" onChange={(e) => setType(e.target.value)} sx={{ fontSize: '0.88rem' }}>
                <MenuItem value="payable" sx={{ fontSize: '0.88rem' }}>Accounts Payable</MenuItem>
                <MenuItem value="receivable" sx={{ fontSize: '0.88rem' }}>Accounts Receivable</MenuItem>
              </Select>
            </FormControl>
            <Button variant="contained" size="small" startIcon={<FiSearch />} onClick={search}
              sx={{ textTransform: 'none', borderRadius: 1.5, py: 0.5, fontSize: '0.78rem' }}>Show</Button>
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
                    <TableCell>Balance</TableCell>
                    <TableCell>0-30 Days</TableCell>
                    <TableCell>31-60 Days</TableCell>
                    <TableCell>61-90 Days</TableCell>
                    <TableCell>90+ Days</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((r, i) => (
                    <TableRow key={i} sx={{ "&:hover": { bgcolor: "#eef2ff" }, bgcolor: i % 2 === 0 ? "#ffffff" : "#f8fafc" }}>
                      <TableCell sx={{ fontSize: "0.82rem", py: 0.75, borderBottom: "1px solid #f1f5f9", fontWeight: 600 }}>{r.account_name}</TableCell>
                      <TableCell sx={{ fontSize: "0.82rem", py: 0.75, borderBottom: "1px solid #f1f5f9", fontFamily: 'monospace', fontWeight: 600, color: r.balance > 0 ? '#d32f2f' : '#2e7d32' }}>₹{r.balance?.toFixed(2)}</TableCell>
                      <TableCell sx={{ fontSize: "0.82rem", py: 0.75, borderBottom: "1px solid #f1f5f9", fontFamily: 'monospace' }}>₹{r.aging?.['0-30']?.toFixed(2)}</TableCell>
                      <TableCell sx={{ fontSize: "0.82rem", py: 0.75, borderBottom: "1px solid #f1f5f9", fontFamily: 'monospace' }}>₹{r.aging?.['31-60']?.toFixed(2)}</TableCell>
                      <TableCell sx={{ fontSize: "0.82rem", py: 0.75, borderBottom: "1px solid #f1f5f9", fontFamily: 'monospace' }}>₹{r.aging?.['61-90']?.toFixed(2)}</TableCell>
                      <TableCell sx={{ fontSize: "0.82rem", py: 0.75, borderBottom: "1px solid #f1f5f9", fontFamily: 'monospace', color: r.aging?.['90+'] > 0 ? '#d32f2f' : 'inherit' }}>₹{r.aging?.['90+']?.toFixed(2)}</TableCell>
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

export default APReport;
