import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Card, CardContent, Table, TableHead, TableBody, TableRow, TableCell, TableContainer, Stack } from '@mui/material';
import { FiSearch, FiFileText, FiDownload } from 'react-icons/fi';
import PageHeader from '../../Common/PageHeader';
import axios from 'axios';

const fsx = { "& .MuiInputBase-root": { fontSize: "0.88rem", height: 34 }, "& .MuiInputLabel-root": { fontSize: "0.88rem", mt: -0.25 } };

const DayBook = () => {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [rows, setRows] = useState([]);

  const search = async () => {
    const params = {};
    if (from && to) { params.from = from; params.to = to; }
    else params.date = date;
    const r = await axios.get('/api/accounts/daybook', { params });
    setRows(r.data);
  };

  const totalDr = rows.reduce((s, r) => s + parseFloat(r.total_debit || 0), 0);
  const totalCr = rows.reduce((s, r) => s + parseFloat(r.total_credit || 0), 0);

  return (
    <Box sx={{ p: { xs: 1.5, sm: 2, md: 3 } }}>
      <PageHeader title="Day Book" subtitle="Daily transaction summary" icon={<FiFileText size={22} />} />
      <Card sx={{ borderRadius: 2, boxShadow: "0 1px 6px rgba(0,0,0,0.05)", mb: 2.5, border: "1px solid #e2e8f0" }}>
        <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
          <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
            <TextField label="Date" type="date" size="small" value={date} onChange={(e) => setDate(e.target.value)} InputLabelProps={{ shrink: true }} sx={fsx} />
            <Typography variant="body2" sx={{ fontSize: '0.82rem', color: 'text.secondary' }}>or Range:</Typography>
            <TextField label="From" type="date" size="small" value={from} onChange={(e) => setFrom(e.target.value)} InputLabelProps={{ shrink: true }} sx={fsx} />
            <TextField label="To" type="date" size="small" value={to} onChange={(e) => setTo(e.target.value)} InputLabelProps={{ shrink: true }} sx={fsx} />
            <Button variant="contained" size="small" startIcon={<FiSearch />} onClick={search}
              sx={{ textTransform: 'none', borderRadius: 1.5, py: 0.5, fontSize: '0.78rem' }}>Show</Button>
            {rows.length > 0 && <Button variant="outlined" size="small" startIcon={<FiDownload />}
              sx={{ textTransform: 'none', borderRadius: 1.5, py: 0.5, fontSize: '0.78rem' }}>Export</Button>}
          </Stack>
        </CardContent>
      </Card>

      <Card sx={{ borderRadius: 2, boxShadow: "0 1px 6px rgba(0,0,0,0.05)", border: "1px solid #e2e8f0" }}>
        <CardContent sx={{ p: 0, "&:last-child": { pb: 0 } }}>
          <TableContainer sx={{ maxHeight: 500, overflow: "auto" }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow sx={{ bgcolor: "#f1f5f9", "& th": { fontWeight: 700, fontSize: "0.84rem", py: 0.75, color: "#475569", borderBottom: "2px solid #e2e8f0" } }}>
                  <TableCell>Voucher No</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Narration</TableCell>
                  <TableCell>Debit</TableCell>
                  <TableCell>Credit</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((v, i) => (
                  <TableRow key={v.id} sx={{ "&:hover": { bgcolor: "#eef2ff" }, bgcolor: i % 2 === 0 ? "#ffffff" : "#f8fafc" }}>
                    <TableCell sx={{ fontSize: "0.82rem", py: 0.75, borderBottom: "1px solid #f1f5f9", fontFamily: 'monospace', fontWeight: 600 }}>{v.voucher_no}</TableCell>
                    <TableCell sx={{ fontSize: "0.82rem", py: 0.75, borderBottom: "1px solid #f1f5f9" }}>{v.date}</TableCell>
                    <TableCell sx={{ fontSize: "0.82rem", py: 0.75, borderBottom: "1px solid #f1f5f9" }}>{v.voucherType?.code}</TableCell>
                    <TableCell sx={{ fontSize: "0.82rem", py: 0.75, borderBottom: "1px solid #f1f5f9", maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v.narration}</TableCell>
                    <TableCell sx={{ fontSize: "0.82rem", py: 0.75, borderBottom: "1px solid #f1f5f9", fontFamily: 'monospace' }}>{parseFloat(v.total_debit || 0).toFixed(2)}</TableCell>
                    <TableCell sx={{ fontSize: "0.82rem", py: 0.75, borderBottom: "1px solid #f1f5f9", fontFamily: 'monospace' }}>{parseFloat(v.total_credit || 0).toFixed(2)}</TableCell>
                  </TableRow>
                ))}
                {rows.length > 0 && (
                  <TableRow sx={{ bgcolor: '#f1f5f9' }}>
                    <TableCell colSpan={4} sx={{ fontWeight: 700, fontSize: "0.84rem", py: 0.75 }}>Total</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: "0.84rem", py: 0.75, fontFamily: 'monospace' }}>{totalDr.toFixed(2)}</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: "0.84rem", py: 0.75, fontFamily: 'monospace' }}>{totalCr.toFixed(2)}</TableCell>
                  </TableRow>
                )}
                {rows.length === 0 && (
                  <TableRow><TableCell colSpan={6} align="center" sx={{ py: 4, color: 'text.secondary', fontSize: '0.9rem' }}>No entries for this date</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
};

export default DayBook;
