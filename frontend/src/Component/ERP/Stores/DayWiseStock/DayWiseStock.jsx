import React, { useEffect, useState, useCallback } from 'react';
import { Box, Typography, TextField, Button, LinearProgress, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton } from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';
import RefreshIcon from '@mui/icons-material/Refresh';
import axios from 'axios';
import { useToast } from '../../../../context/ToastContext';

const API = '/api/erp/stores/day-wise-stock';

const todayStr = () => new Date().toISOString().slice(0, 10);

const num = (v) => (v == null ? 0 : v);

export default function DayWiseStock() {
  const { showToast } = useToast();
  const [date, setDate] = useState(todayStr());
  const [data, setData] = useState({ date: '', groups: [], totals: {} });
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { data: res } = await axios.get(API, { params: { date } });
      setData(res);
    } catch {
      showToast('Failed to load day-wise stock', 'error');
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const groups = data.groups || [];
  const totals = data.totals || {};

  return (
    <Box sx={{ p: 3 }} className="print-area">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }} className="no-print">
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'var(--heading-color)' }}>Day-wise Stock Ledger</Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField size="small" type="date" label="As on Date" value={date} onChange={(e) => setDate(e.target.value)} InputLabelProps={{ shrink: true }} />
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={fetchData}>Refresh</Button>
          <Button variant="contained" startIcon={<PrintIcon />} onClick={() => window.print()}>Print</Button>
        </Box>
      </Box>

      <Paper sx={{ p: 2, borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.08)', mb: 2 }} className="no-print">
        <Typography variant="body2" sx={{ color: 'gray' }}>
          Statement of stock movement for <b>{data.date || date}</b>. Opening = stock at start of day, Balance = closing stock.
        </Typography>
      </Paper>

      {loading && <LinearProgress sx={{ mb: 1 }} />}

      {groups.length === 0 && !loading && (
        <Typography sx={{ color: 'gray', py: 4, textAlign: 'center' }}>No stock records found.</Typography>
      )}

      {groups.map((g) => (
        <TableContainer component={Paper} key={g.group} sx={{ mb: 3, borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
          <Box sx={{ bgcolor: 'var(--primary-main, #1976d2)', color: '#fff', px: 2, py: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, letterSpacing: 0.5 }}>{g.group}</Typography>
          </Box>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow sx={{ bgcolor: '#f2f4f7' }}>
                <TableCell sx={{ fontWeight: 700 }}>S.NO</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>PRODUCT NAME</TableCell>
                <TableCell sx={{ fontWeight: 700, textAlign: 'right' }}>OPENING STOCK</TableCell>
                <TableCell sx={{ fontWeight: 700, textAlign: 'right' }}>CONSUME</TableCell>
                <TableCell sx={{ fontWeight: 700, textAlign: 'right' }}>RECEIVED</TableCell>
                <TableCell sx={{ fontWeight: 700, textAlign: 'right' }}>BALANCE</TableCell>
                <TableCell sx={{ fontWeight: 700, textAlign: 'right' }}>REJECTION</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {g.items.map((it) => (
                <TableRow key={it.item_id} hover>
                  <TableCell>{it.sno}</TableCell>
                  <TableCell>
                    <div style={{ fontWeight: 600 }}>{it.item_name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#777' }}>{it.item_code}{it.unit ? ` • ${it.unit}` : ''}</div>
                  </TableCell>
                  <TableCell sx={{ textAlign: 'right' }}>{num(it.opening)}</TableCell>
                  <TableCell sx={{ textAlign: 'right', color: '#d32f2f' }}>{num(it.consume)}</TableCell>
                  <TableCell sx={{ textAlign: 'right', color: '#2e7d32' }}>{num(it.received)}</TableCell>
                  <TableCell sx={{ textAlign: 'right', fontWeight: 700, color: '#1565c0' }}>{num(it.balance)}</TableCell>
                  <TableCell sx={{ textAlign: 'right', color: '#ed6c02' }}>{num(it.rejection)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ))}

      {groups.length > 0 && (
        <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
          <Table size="small">
            <TableBody>
              <TableRow sx={{ bgcolor: '#eef2f7' }}>
                <TableCell sx={{ fontWeight: 800, fontSize: '0.95rem' }} colSpan={2}>GRAND TOTAL</TableCell>
                <TableCell sx={{ textAlign: 'right', fontWeight: 800 }}>{num(totals.opening)}</TableCell>
                <TableCell sx={{ textAlign: 'right', fontWeight: 800, color: '#d32f2f' }}>{num(totals.consume)}</TableCell>
                <TableCell sx={{ textAlign: 'right', fontWeight: 800, color: '#2e7d32' }}>{num(totals.received)}</TableCell>
                <TableCell sx={{ textAlign: 'right', fontWeight: 800, color: '#1565c0' }}>{num(totals.balance)}</TableCell>
                <TableCell sx={{ textAlign: 'right', fontWeight: 800, color: '#ed6c02' }}>{num(totals.rejection)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: #fff; }
          .print-area { padding: 0 !important; }
          .MuiPaper-root { box-shadow: none !important; border: 1px solid #ddd; }
        }
      `}</style>
    </Box>
  );
}
