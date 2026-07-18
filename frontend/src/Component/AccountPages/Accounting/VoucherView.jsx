import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Card, CardContent, Table, TableHead, TableBody, TableRow, TableCell, Stack } from '@mui/material';
import { FiArrowLeft, FiCheck, FiDollarSign } from 'react-icons/fi';
import { useParams, useNavigate } from 'react-router-dom';
import PageHeader from '../../Common/PageHeader';
import StatusChip from '../../Common/StatusChip';
import axios from 'axios';

const VoucherView = () => {
  const { type, id } = useParams();
  const navigate = useNavigate();
  const [v, setV] = useState(null);

  useEffect(() => {
    if (id) axios.get(`/api/accounts/vouchers/${id}`).then(r => setV(r.data));
  }, [id]);

  if (!v) return <Box sx={{ p: 3 }}><Typography>Loading...</Typography></Box>;

  return (
    <Box sx={{ p: { xs: 1.5, sm: 2, md: 3 } }}>
      <PageHeader title={`${v.voucherType?.name || 'Voucher'} #${v.voucher_no}`}
        subtitle={`Date: ${v.date}${v.reference_no ? ` | Ref: ${v.reference_no}` : ''}`}
        icon={<FiDollarSign size={22} />}
        actions={
          <Stack direction="row" spacing={0.75}>
            <Button variant="outlined" size="small" startIcon={<FiArrowLeft />} onClick={() => navigate(-1)}
              sx={{ textTransform: 'none', borderRadius: 1.5, py: 0.5, fontSize: '0.78rem' }}>Back</Button>
            {v.status === 'Draft' && (
              <Button variant="contained" size="small" startIcon={<FiCheck />}
                onClick={async () => { await axios.post(`/api/accounts/vouchers/${v.id}/post`); navigate(0); }}
                sx={{ textTransform: 'none', borderRadius: 1.5, py: 0.5, fontSize: '0.78rem' }}>Post</Button>
            )}
          </Stack>
        } />

      <Card sx={{ borderRadius: 2, boxShadow: "0 1px 6px rgba(0,0,0,0.05)", mb: 2.5, border: "1px solid #e2e8f0" }}>
        <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
          <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
            <Box sx={{ bgcolor: "#f0f4ff", border: "1px solid #d0d9f0", borderRadius: 1, px: 1.5, py: 0.5, height: 34, display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <Typography variant="caption" sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>Status</Typography>
              <StatusChip status={v.status} />
            </Box>
            <Box sx={{ bgcolor: "#f0f4ff", border: "1px solid #d0d9f0", borderRadius: 1, px: 1.5, py: 0.5 }}>
              <Typography variant="caption" sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>Total Debit</Typography>
              <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', fontFamily: 'monospace' }}>₹{parseFloat(v.total_debit || 0).toFixed(2)}</Typography>
            </Box>
            <Box sx={{ bgcolor: "#f0f4ff", border: "1px solid #d0d9f0", borderRadius: 1, px: 1.5, py: 0.5 }}>
              <Typography variant="caption" sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>Total Credit</Typography>
              <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', fontFamily: 'monospace' }}>₹{parseFloat(v.total_credit || 0).toFixed(2)}</Typography>
            </Box>
          </Box>
          {v.narration && (
            <Box sx={{ mt: 1.5, p: 1, borderRadius: 1, bgcolor: '#f8fafc', border: '1px solid #e2e8f0', borderLeft: '3px solid #3b82f6' }}>
              <Typography variant="body2" sx={{ fontSize: '0.82rem', fontStyle: 'italic' }}>{v.narration}</Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      <Card sx={{ borderRadius: 2, boxShadow: "0 1px 6px rgba(0,0,0,0.05)", border: "1px solid #e2e8f0" }}>
        <CardContent sx={{ p: 0, "&:last-child": { pb: 0 } }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: '#f1f5f9', "& th": { fontWeight: 700, fontSize: "0.84rem", py: 0.75, color: "#475569" } }}>
                <TableCell>Account</TableCell>
                <TableCell>Debit</TableCell>
                <TableCell>Credit</TableCell>
                <TableCell>Against</TableCell>
                <TableCell>Narration</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {v.items?.map((item, i) => (
                <TableRow key={i} sx={{ "&:hover": { bgcolor: "#f8fafc" } }}>
                  <TableCell sx={{ fontSize: "0.82rem", py: 0.75, borderBottom: "1px solid #f1f5f9" }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.82rem' }}>{item.account?.account_name}</Typography>
                    <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '0.7rem' }}>{item.account?.account_code}</Typography>
                  </TableCell>
                  <TableCell sx={{ fontSize: "0.82rem", py: 0.75, borderBottom: "1px solid #f1f5f9", fontFamily: 'monospace' }}>{parseFloat(item.debit || 0).toFixed(2)}</TableCell>
                  <TableCell sx={{ fontSize: "0.82rem", py: 0.75, borderBottom: "1px solid #f1f5f9", fontFamily: 'monospace' }}>{parseFloat(item.credit || 0).toFixed(2)}</TableCell>
                  <TableCell sx={{ fontSize: "0.82rem", py: 0.75, borderBottom: "1px solid #f1f5f9" }}>{item.againstAccount?.account_name || '-'}</TableCell>
                  <TableCell sx={{ fontSize: "0.82rem", py: 0.75, borderBottom: "1px solid #f1f5f9" }}>{item.narration || '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </Box>
  );
};

export default VoucherView;
