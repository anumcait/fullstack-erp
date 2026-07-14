import React, { useEffect, useState, useCallback } from 'react';
import {
  Box, Typography, Card, CardContent, Tabs, Tab, Grid, TextField, Button,
  Table, TableHead, TableRow, TableCell, TableBody, TableContainer, Paper,
  MenuItem, IconButton, Chip, Alert, LinearProgress, Divider,
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import axios from 'axios';

const API = '/api/pf';

const MONTHS = [
  { value: 4, label: 'Apr' }, { value: 5, label: 'May' }, { value: 6, label: 'Jun' },
  { value: 7, label: 'Jul' }, { value: 8, label: 'Aug' }, { value: 9, label: 'Sep' },
  { value: 10, label: 'Oct' }, { value: 11, label: 'Nov' }, { value: 12, label: 'Dec' },
  { value: 1, label: 'Jan' }, { value: 2, label: 'Feb' }, { value: 3, label: 'Mar' },
];

function currentFy() {
  const y = new Date().getFullYear();
  const m = new Date().getMonth() + 1;
  return m >= 4 ? `${y}-${String(y + 1).slice(2)}` : `${y - 1}-${String(y).slice(2)}`;
}
function currentMonth() {
  const m = new Date().getMonth() + 1;
  return m >= 4 ? m : m;
}

export default function PfAccountingDashboard() {
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const [fy, setFy] = useState(currentFy());
  const [month, setMonth] = useState(currentMonth());

  const [ledger, setLedger] = useState([]);
  const [challans, setChallans] = useState([]);

  const fetchLedger = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API}/ledger`, { params: { financial_year: fy, month } });
      setLedger(data);
    } catch (e) { console.error(e); }
  }, [fy, month]);

  const fetchChallans = useCallback(async () => {
    try { const { data } = await axios.get(`${API}/challans`); setChallans(data); } catch (e) { console.error(e); }
  }, []);

  useEffect(() => {
    if (tab === 0) { setLoading(true); fetchLedger().finally(() => setLoading(false)); }
  }, [tab, fetchLedger]);

  useEffect(() => {
    if (tab === 1) { fetchChallans(); }
  }, [tab, fetchChallans]);

  const handleGenerate = async () => {
    try {
      setLoading(true);
      const { data } = await axios.post(`${API}/generate`, { financial_year: fy, month });
      setMessage({ type: 'success', text: `Generated ${data.generated} records, ${data.skipped} skipped` });
      fetchLedger();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed' });
    } finally { setLoading(false); }
  };

  const handleGenerateChallan = async () => {
    try {
      setLoading(true);
      const { data } = await axios.post(`${API}/challans`, { financial_year: fy, month });
      setMessage({ type: 'success', text: `Challan ${data.challan?.challan_no} generated` });
      fetchChallans();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed' });
    } finally { setLoading(false); }
  };

  const updateChallanStatus = async (id, status, remitted_date) => {
    await axios.post(`${API}/challans/update`, { id, status, remitted_date });
    fetchChallans();
  };

  const totalEmpShare = ledger.reduce((s, e) => s + Number(e.employee_share), 0);
  const totalEmprShare = ledger.reduce((s, e) => s + Number(e.employer_share), 0);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold', color: 'var(--heading-color)' }}>PF Accounting</Typography>
      {loading && <LinearProgress sx={{ mb: 2 }} />}
      {message && <Alert severity={message.type} sx={{ mb: 2 }} onClose={() => setMessage(null)}>{message.text}</Alert>}

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label="Monthly PF" />
        <Tab label="Challans" />
      </Tabs>

      {/* TAB 0: MONTHLY PF */}
      {tab === 0 && (
        <Card sx={{ borderRadius: 3, p: 2 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2} flexWrap="wrap" gap={1}>
            <Box display="flex" gap={1} alignItems="center">
              <TextField label="Financial Year" size="small" value={fy} onChange={(e) => setFy(e.target.value)} sx={{ width: 120 }} />
              <TextField select label="Month" size="small" value={month} onChange={(e) => setMonth(Number(e.target.value))} sx={{ width: 100 }}>
                {MONTHS.map((m) => <MenuItem key={m.value} value={m.value}>{m.label}</MenuItem>)}
              </TextField>
              <Button variant="outlined" onClick={fetchLedger}>Refresh</Button>
            </Box>
            <Box display="flex" gap={1}>
              <Button variant="contained" startIcon={<PlayArrowIcon />} onClick={handleGenerate}>Generate PF</Button>
              <Button variant="contained" color="success" onClick={handleGenerateChallan}>Generate Challan</Button>
            </Box>
          </Box>

          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Employee</TableCell>
                  <TableCell>PF Wages</TableCell>
                  <TableCell>Employee Share (12%)</TableCell>
                  <TableCell>Employer EPS (3.67%)</TableCell>
                  <TableCell>Employer EPF (8.33%)</TableCell>
                  <TableCell>Total Employer</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {ledger.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell>{e.empid}</TableCell>
                    <TableCell>₹{Number(e.pf_wages).toLocaleString()}</TableCell>
                    <TableCell>₹{Number(e.employee_share).toLocaleString()}</TableCell>
                    <TableCell>₹{Number(e.eps_share).toLocaleString()}</TableCell>
                    <TableCell>₹{Number(e.epf_share).toLocaleString()}</TableCell>
                    <TableCell>₹{Number(e.employer_share).toLocaleString()}</TableCell>
                  </TableRow>
                ))}
                {ledger.length === 0 && <TableRow><TableCell colSpan={6} align="center">No PF data. Click "Generate PF" to create.</TableCell></TableRow>}
              </TableBody>
            </Table>
          </TableContainer>

          {ledger.length > 0 && (
            <Paper variant="outlined" sx={{ mt: 2, p: 2, bgcolor: '#e8f5e9' }}>
              <Typography variant="h6">
                Total Employee Share: ₹{totalEmpShare.toLocaleString()} | Total Employer Share: ₹{totalEmprShare.toLocaleString()}
              </Typography>
            </Paper>
          )}
        </Card>
      )}

      {/* TAB 1: CHALLANS */}
      {tab === 1 && (
        <Card sx={{ borderRadius: 3, p: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>PF Challans</Typography>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Challan No</TableCell>
                  <TableCell>FY</TableCell>
                  <TableCell>Month</TableCell>
                  <TableCell>Employees</TableCell>
                  <TableCell>Total Wages</TableCell>
                  <TableCell>Employee Share</TableCell>
                  <TableCell>Employer Share</TableCell>
                  <TableCell>Grand Total</TableCell>
                  <TableCell>Remitted</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {challans.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>{c.challan_no}</TableCell>
                    <TableCell>{c.financial_year}</TableCell>
                    <TableCell>{MONTHS.find((m) => m.value === c.month)?.label || c.month}</TableCell>
                    <TableCell>{c.total_employees}</TableCell>
                    <TableCell>₹{Number(c.total_wages).toLocaleString()}</TableCell>
                    <TableCell>₹{Number(c.total_employee_share).toLocaleString()}</TableCell>
                    <TableCell>₹{Number(c.total_employer_share).toLocaleString()}</TableCell>
                    <TableCell><strong>₹{Number(c.grand_total).toLocaleString()}</strong></TableCell>
                    <TableCell>{c.remitted_date || '-'}</TableCell>
                    <TableCell><Chip label={c.status} size="small" color={c.status === 'Remitted' ? 'success' : 'default'} /></TableCell>
                    <TableCell>
                      {c.status === 'Draft' && (
                        <Button size="small" onClick={() => {
                          const rd = prompt('Remitted date (YYYY-MM-DD):');
                          if (rd) updateChallanStatus(c.id, 'Remitted', rd);
                        }}>Mark Remitted</Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {challans.length === 0 && <TableRow><TableCell colSpan={11} align="center">No challans</TableCell></TableRow>}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}
    </Box>
  );
}
