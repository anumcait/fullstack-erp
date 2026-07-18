import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, TextField, Card, CardContent, Table, TableHead, TableBody, TableRow, TableCell, Dialog, Stack } from '@mui/material';
import { FiSave, FiPlus, FiSettings } from 'react-icons/fi';
import PageHeader from '../../Common/PageHeader';
import StatusChip from '../../Common/StatusChip';
import axios from 'axios';

const fsx = { "& .MuiInputBase-root": { fontSize: "0.88rem", height: 34 }, "& .MuiInputLabel-root": { fontSize: "0.88rem", mt: -0.25 } };

const AccountSettings = () => {
  const [settings, setSettings] = useState({});
  const [fys, setFys] = useState([]);
  const [form, setForm] = useState({ company_name: '', address: '', gstin: '', pan: '' });
  const [fyOpen, setFyOpen] = useState(false);
  const [fyForm, setFyForm] = useState({ name: '', start_date: '', end_date: '' });

  useEffect(() => {
    axios.get('/api/accounts/settings').then(r => {
      setSettings(r.data.settings);
      setFys(r.data.financial_years);
      setForm({ company_name: r.data.settings.company_name || '', address: r.data.settings.address || '', gstin: r.data.settings.gstin || '', pan: r.data.settings.pan || '' });
    });
  }, []);

  const saveSettings = async () => {
    await axios.put('/api/accounts/settings', form);
    alert('Settings saved');
  };

  const createFy = async () => {
    await axios.post('/api/accounts/financial-years', fyForm);
    setFyOpen(false); setFyForm({ name: '', start_date: '', end_date: '' });
    const r = await axios.get('/api/accounts/settings');
    setFys(r.data.financial_years);
  };

  const setActive = async (id) => {
    await axios.post(`/api/accounts/financial-years/${id}/set-active`);
    const r = await axios.get('/api/accounts/settings');
    setFys(r.data.financial_years);
  };

  return (
    <Box sx={{ p: { xs: 1.5, sm: 2, md: 3 } }}>
      <PageHeader title="Accounts Settings" subtitle="Company info and financial year configuration" icon={<FiSettings size={22} />} />

      <Card sx={{ borderRadius: 2, boxShadow: "0 1px 6px rgba(0,0,0,0.05)", mb: 2.5, border: "1px solid #e2e8f0" }}>
        <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
          <Typography variant="subtitle2" sx={{ mb: 1.5, color: "var(--heading-color)", fontWeight: 700, fontSize: "1rem" }}>Company Details</Typography>
          <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
            <TextField label="Company Name" size="small" value={form.company_name} onChange={(e) => setForm({ ...form, company_name: e.target.value })} sx={{ ...fsx, minWidth: 280 }} />
            <TextField label="GSTIN" size="small" value={form.gstin} onChange={(e) => setForm({ ...form, gstin: e.target.value })} sx={{ ...fsx, minWidth: 200 }} />
            <TextField label="PAN" size="small" value={form.pan} onChange={(e) => setForm({ ...form, pan: e.target.value })} sx={{ ...fsx, minWidth: 160 }} />
          </Stack>
          <TextField label="Address" multiline rows={2} size="small" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} sx={{ ...fsx, mt: 1.5, minWidth: 400 }} />
          <Box sx={{ mt: 1.5 }}>
            <Button variant="contained" size="small" startIcon={<FiSave />} onClick={saveSettings}
              sx={{ textTransform: 'none', borderRadius: 1.5, py: 0.5, fontSize: '0.78rem' }}>Save Settings</Button>
          </Box>
        </CardContent>
      </Card>

      <Card sx={{ borderRadius: 2, boxShadow: "0 1px 6px rgba(0,0,0,0.05)", border: "1px solid #e2e8f0" }}>
        <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'var(--heading-color)', fontSize: '0.95rem' }}>Financial Years</Typography>
          <Button size="small" variant="outlined" startIcon={<FiPlus />} onClick={() => setFyOpen(true)}
            sx={{ textTransform: 'none', borderRadius: 1.5, py: 0.25, fontSize: '0.75rem' }}>New</Button>
        </Box>
        <CardContent sx={{ p: 0, "&:last-child": { pb: 0 } }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: "#f1f5f9", "& th": { fontWeight: 700, fontSize: "0.84rem", py: 0.75, color: "#475569" } }}>
                <TableCell>Name</TableCell>
                <TableCell>Start</TableCell>
                <TableCell>End</TableCell>
                <TableCell>Status</TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {fys.map((fy) => (
                <TableRow key={fy.id} sx={{ "&:hover": { bgcolor: "#f8fafc" } }}>
                  <TableCell sx={{ fontSize: "0.82rem", py: 0.75, borderBottom: "1px solid #f1f5f9", fontWeight: 600 }}>{fy.name}</TableCell>
                  <TableCell sx={{ fontSize: "0.82rem", py: 0.75, borderBottom: "1px solid #f1f5f9" }}>{fy.start_date}</TableCell>
                  <TableCell sx={{ fontSize: "0.82rem", py: 0.75, borderBottom: "1px solid #f1f5f9" }}>{fy.end_date}</TableCell>
                  <TableCell sx={{ py: 0.5, borderBottom: "1px solid #f1f5f9" }}>
                    {fy.is_active ? <StatusChip status="active" /> : fy.is_closed ? <StatusChip status="closed" /> : <StatusChip status="open" />}
                  </TableCell>
                  <TableCell sx={{ py: 0.5, borderBottom: "1px solid #f1f5f9" }}>
                    {!fy.is_active && <Button size="small" onClick={() => setActive(fy.id)}
                      sx={{ textTransform: 'none', fontSize: '0.75rem', borderRadius: 1.5 }}>Set Active</Button>}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={fyOpen} onClose={() => setFyOpen(false)} maxWidth="sm" fullWidth>
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: 'var(--heading-color)' }}>New Financial Year</Typography>
          <Stack direction="column" spacing={2}>
            <TextField label="Name (e.g. 2025-26)" size="small" value={fyForm.name} onChange={(e) => setFyForm({ ...fyForm, name: e.target.value })} sx={fsx} />
            <TextField label="Start Date" type="date" size="small" value={fyForm.start_date} onChange={(e) => setFyForm({ ...fyForm, start_date: e.target.value })} InputLabelProps={{ shrink: true }} sx={fsx} />
            <TextField label="End Date" type="date" size="small" value={fyForm.end_date} onChange={(e) => setFyForm({ ...fyForm, end_date: e.target.value })} InputLabelProps={{ shrink: true }} sx={fsx} />
            <Stack direction="row" spacing={1} justifyContent="flex-end">
              <Button variant="outlined" size="small" onClick={() => setFyOpen(false)} sx={{ textTransform: 'none', borderRadius: 1.5 }}>Cancel</Button>
              <Button variant="contained" size="small" onClick={createFy} sx={{ textTransform: 'none', borderRadius: 1.5 }}>Create</Button>
            </Stack>
          </Stack>
        </Box>
      </Dialog>
    </Box>
  );
};

export default AccountSettings;
