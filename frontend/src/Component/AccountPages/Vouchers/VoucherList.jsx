import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Button, Card, CardContent, Table, TableHead, TableBody, TableRow, TableCell, TableContainer, TextField, Stack } from '@mui/material';
import { FiPlus, FiEye, FiTrash2, FiSearch, FiDollarSign, FiList, FiFileText } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../Common/PageHeader';
import StatusChip from '../../Common/StatusChip';
import axios from 'axios';

const TYPES = {
  'sales': { id: 1, title: 'Sales Invoices', icon: FiDollarSign, color: '#1976d2' },
  'purchase': { id: 2, title: 'Purchase Invoices', icon: FiDollarSign, color: '#2e7d32' },
  'debit-note': { id: 3, title: 'Debit Notes', icon: FiFileText, color: '#ed6c02' },
  'credit-note': { id: 4, title: 'Credit Notes', icon: FiFileText, color: '#9c27b0' },
  'payment': { id: 5, title: 'Payment Vouchers', icon: FiList, color: '#0288d1' },
  'receipt': { id: 6, title: 'Receipt Vouchers', icon: FiList, color: '#d32f2f' },
  'journal': { id: 7, title: 'Journal Vouchers', icon: FiFileText, color: '#1565c0' },
  'contra': { id: 8, title: 'Contra Entries', icon: FiFileText, color: '#7b1fa2' },
};

const VoucherList = ({ type }) => {
  const navigate = useNavigate();
  const vtype = TYPES[type] || TYPES.journal;
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState('');

  const fetch = useCallback(async () => {
    const r = await axios.get(`/api/accounts/vouchers?voucher_type_id=${vtype.id}`);
    setRows(r.data);
  }, [vtype.id]);

  useEffect(() => { fetch(); }, [fetch]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this voucher?')) return;
    await axios.delete(`/api/accounts/vouchers/${id}`);
    fetch();
  };

  const filtered = rows.filter(r =>
    !search || r.voucher_no?.toLowerCase().includes(search.toLowerCase()) || r.narration?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box sx={{ p: { xs: 1.5, sm: 2, md: 3 } }}>
      <PageHeader title={vtype.title} subtitle="View and manage transactions" icon={<vtype.icon size={22} />}
        actions={<Button variant="contained" size="small" startIcon={<FiPlus />}
          onClick={() => navigate(`/accounts/voucher/${type}/add`)}
          sx={{ textTransform: 'none', borderRadius: 1.5, py: 0.5, fontSize: '0.78rem' }}>New {vtype.title.slice(0, -1)}</Button>} />
      <Box sx={{ display: 'flex', gap: { xs: 1, sm: 2 }, mb: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        <TextField placeholder={`Search ${vtype.title}...`} size="small" value={search} onChange={(e) => setSearch(e.target.value)}
          sx={{ minWidth: 260, "& .MuiInputBase-root": { fontSize: "0.88rem", height: 34 } }}
          InputProps={{ startAdornment: <FiSearch size={14} style={{ marginRight: 6, color: '#94a3b8' }} /> }} />
      </Box>
      <Card sx={{ borderRadius: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
        <CardContent sx={{ p: 0, "&:last-child": { pb: 0 } }}>
          <TableContainer sx={{ maxHeight: 560, overflow: "auto" }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow sx={{ bgcolor: "#f1f5f9", "& th": { fontWeight: 700, fontSize: "0.9rem", py: 0.85, color: "#334155", borderBottom: "2px solid #e2e8f0" } }}>
                  <TableCell>Voucher No</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Reference</TableCell>
                  <TableCell>Narration</TableCell>
                  <TableCell>Debit</TableCell>
                  <TableCell>Credit</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell sx={{ width: 90 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map((r, i) => (
                  <TableRow key={r.id} sx={{ "&:hover": { bgcolor: "#eef2ff" }, bgcolor: i % 2 === 0 ? "#ffffff" : "#f8fafc" }}>
                    <TableCell sx={{ fontSize: "0.82rem", py: 0.75, borderBottom: "1px solid #f1f5f9", fontFamily: 'monospace', fontWeight: 600 }}>{r.voucher_no}</TableCell>
                    <TableCell sx={{ fontSize: "0.82rem", py: 0.75, borderBottom: "1px solid #f1f5f9" }}>{r.date}</TableCell>
                    <TableCell sx={{ fontSize: "0.82rem", py: 0.75, borderBottom: "1px solid #f1f5f9" }}>{r.reference_no || '-'}</TableCell>
                    <TableCell sx={{ fontSize: "0.82rem", py: 0.75, borderBottom: "1px solid #f1f5f9", maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.narration || '-'}</TableCell>
                    <TableCell sx={{ fontSize: "0.82rem", py: 0.75, borderBottom: "1px solid #f1f5f9", fontFamily: 'monospace' }}>{Number(r.total_debit || 0).toFixed(2)}</TableCell>
                    <TableCell sx={{ fontSize: "0.82rem", py: 0.75, borderBottom: "1px solid #f1f5f9", fontFamily: 'monospace' }}>{Number(r.total_credit || 0).toFixed(2)}</TableCell>
                    <TableCell sx={{ py: 0.5, borderBottom: "1px solid #f1f5f9" }}><StatusChip status={r.status} /></TableCell>
                    <TableCell sx={{ py: 0.5, borderBottom: "1px solid #f1f5f9" }}>
                      <Stack direction="row" spacing={0.25}>
                        <Button size="small" onClick={() => navigate(`/accounts/voucher/${type}/${r.id}`)} sx={{ minWidth: 28, p: 0.5, color: 'primary.main' }}><FiEye size={14} /></Button>
                        <Button size="small" color="error" onClick={() => handleDelete(r.id)} sx={{ minWidth: 28, p: 0.5 }}><FiTrash2 size={14} /></Button>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow><TableCell colSpan={8} align="center" sx={{ py: 4, color: 'text.secondary', fontSize: '0.9rem' }}>No {vtype.title.toLowerCase()} found</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
};

export default VoucherList;
