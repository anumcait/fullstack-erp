import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Card, CardContent, Tabs, Tab, Grid, TextField, Button,
  Table, TableHead, TableRow, TableCell, TableBody, MenuItem, LinearProgress,
  Chip, IconButton, Alert,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import CalculateIcon from '@mui/icons-material/Calculate';
import DownloadIcon from '@mui/icons-material/Download';
import axios from 'axios';
import { useToast } from '../../../context/ToastContext';

const TAX_API = '/api/tax';
const EMP_API = '/api/employees';

const SECTIONS = [
  { section: '80C', label: '80C (PPF, ELSS, LIC, NSC, Tuition Fee)', maxAmount: 150000 },
  { section: '80CCC', label: '80CCC Pension Funds', maxAmount: 50000 },
  { section: '80CCD(1)', label: '80CCD(1) NPS Employee Contribution', maxAmount: 50000 },
  { section: '80CCD(1B)', label: '80CCD(1B) NPS Additional (50k)', maxAmount: 50000 },
  { section: '80D', label: '80D Medical Insurance Premium', maxAmount: 25000 },
  { section: '80DD', label: '80DD Disabled Dependent', maxAmount: 75000 },
  { section: '80E', label: '80E Education Loan Interest', maxAmount: null },
  { section: '80G', label: '80G Donations', maxAmount: null },
  { section: '80TTA', label: '80TTA Savings Account Interest', maxAmount: 10000 },
  { section: '80TTB', label: '80TTB Senior Citizens Interest', maxAmount: 50000 },
  { section: '24B', label: 'Sec 24(b) Home Loan Interest', maxAmount: 200000 },
  { section: 'HRA', label: 'HRA Exemption (if metro)', maxAmount: null },
];

export default function EmployeeTax() {
  const { showToast } = useToast();
  const [tab, setTab] = useState(0);
  const [employees, setEmployees] = useState([]);
  const [selectedEmp, setSelectedEmp] = useState('');
  const [fy, setFy] = useState(() => {
    const y = new Date().getFullYear();
    const m = new Date().getMonth() + 1;
    const start = m >= 4 ? y : y - 1;
    return `${start}-${String(start + 1).slice(2)}`;
  });
  const [loading, setLoading] = useState(false);
  const [regime, setRegime] = useState('new');
  const [investments, setInvestments] = useState([]);
  const [computation, setComputation] = useState(null);

  useEffect(() => {
    axios.get(EMP_API).then(({ data }) => setEmployees(data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedEmp) return;
    setLoading(true);
    Promise.all([
      axios.get(`${TAX_API}/regime`, { params: { empid: selectedEmp, fy } }).then(({ data }) => setRegime(data.regime || 'new')).catch(() => {}),
      axios.get(`${TAX_API}/investments`, { params: { empid: selectedEmp, fy } }).then(({ data }) => setInvestments(data)).catch(() => {}),
      axios.get(`${TAX_API}/computation`, { params: { empid: selectedEmp, fy } }).then(({ data }) => setComputation(data.id ? data : null)).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, [selectedEmp, fy]);

  const handleSaveRegime = async () => {
    await axios.post(`${TAX_API}/regime`, { empid: selectedEmp, financial_year: fy, regime });
    showToast('Regime saved', 'success');
  };

  const addInvestment = () => setInvestments((p) => [...p, { section: '80C', description: '', amount: 0, proof_attached: false }]);

  const updateInvestment = (idx, field, value) => {
    setInvestments((p) => p.map((i, n) => n === idx ? { ...i, [field]: value } : i));
  };

  const removeInvestment = (idx) => setInvestments((p) => p.filter((_, n) => n !== idx));

  const handleSaveInvestments = async () => {
    const items = investments.map(({ id, declared_at, updated_at, ...rest }) => rest);
    await axios.post(`${TAX_API}/investments`, { empid: selectedEmp, financial_year: fy, items });
    showToast('Investments saved', 'success');
  };

  const handleCompute = async () => {
    try {
      const { data } = await axios.post(`${TAX_API}/compute`, { empid: selectedEmp, financial_year: fy });
      setComputation(data);
      showToast('Tax computed', 'success');
    } catch { showToast('Computation failed', 'error'); }
  };

  const emp = employees.find((e) => e.empid === selectedEmp);

  if (!selectedEmp) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold', color: 'var(--heading-color)' }}>Employee Tax</Typography>
        <Card sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
          <Typography variant="h6" color="textSecondary" sx={{ mb: 3 }}>Select an employee to manage tax</Typography>
          <TextField select label="Employee" value={selectedEmp} onChange={(e) => setSelectedEmp(e.target.value)} sx={{ minWidth: 350 }}>
            {employees.map((e) => <MenuItem key={e.empid} value={e.empid}>{e.ename} ({e.empid})</MenuItem>)}
          </TextField>
          <Box mt={2}>
            <TextField label="Financial Year" value={fy} onChange={(e) => setFy(e.target.value)} sx={{ minWidth: 200 }} />
          </Box>
        </Card>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'var(--heading-color)', borderLeft: '4px solid', borderColor: 'primary.main', pl: 1.5, lineHeight: 1.2 }}>
          Tax — {emp?.ename} ({emp?.empid})
        </Typography>
        <Box display="flex" gap={2} alignItems="center">
          <TextField select label="Employee" size="small" value={selectedEmp} onChange={(e) => setSelectedEmp(e.target.value)} sx={{ minWidth: 200 }}>
            {employees.map((e) => <MenuItem key={e.empid} value={e.empid}>{e.ename}</MenuItem>)}
          </TextField>
          <TextField label="FY" size="small" value={fy} onChange={(e) => setFy(e.target.value)} sx={{ width: 120 }} />
        </Box>
      </Box>

      {loading && <LinearProgress sx={{ mb: 2 }} />}

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label="Tax Regime" />
        <Tab label="Investment Declaration" />
        <Tab label="Tax Computation" />
      </Tabs>

      {/* Tab 1: Regime */}
      {tab === 0 && (
        <Card sx={{ borderRadius: 3, p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Select Tax Regime</Typography>
          <Alert severity="info" sx={{ mb: 2 }}>
            Old regime allows deductions (80C, 80D, HRA, etc.). New regime has lower rates but no deductions.
          </Alert>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField select label="Regime" fullWidth value={regime} onChange={(e) => setRegime(e.target.value)}>
                <MenuItem value="new">New Regime (Default — Lower Rates, No Deductions)</MenuItem>
                <MenuItem value="old">Old Regime (Higher Rates, With Deductions)</MenuItem>
              </TextField>
            </Grid>
            <Grid item>
              <Button variant="contained" onClick={handleSaveRegime}>Save Regime</Button>
            </Grid>
          </Grid>
        </Card>
      )}

      {/* Tab 2: Investments */}
      {tab === 1 && (
        <Card sx={{ borderRadius: 3, p: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>Investment Declarations</Typography>
            <Button startIcon={<AddIcon />} onClick={addInvestment} size="small" variant="outlined">Add</Button>
          </Box>
          {regime === 'new' ? (
            <Alert severity="warning">New Regime selected. Investment declarations are not applicable under New Tax Regime.</Alert>
          ) : (
            <>
              <Table size="small" sx={{ '& th': { fontWeight: 700, bgcolor: '#f5f7fa' } }}>
                <TableHead>
                  <TableRow>
                    <TableCell>#</TableCell>
                    <TableCell>Section</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Amount (₹)</TableCell>
                    <TableCell>Proof</TableCell>
                    <TableCell>Max Limit</TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {investments.map((inv, idx) => {
                    const sectionDef = SECTIONS.find((s) => s.section === inv.section);
                    return (
                      <TableRow key={idx}>
                        <TableCell>{idx + 1}</TableCell>
                        <TableCell>
                          <TextField select size="small" value={inv.section} onChange={(e) => updateInvestment(idx, 'section', e.target.value)} sx={{ minWidth: 100 }}>
                            {SECTIONS.map((s) => <MenuItem key={s.section} value={s.section}>{s.section}</MenuItem>)}
                          </TextField>
                        </TableCell>
                        <TableCell>
                          <TextField size="small" fullWidth value={inv.description} onChange={(e) => updateInvestment(idx, 'description', e.target.value)} />
                        </TableCell>
                        <TableCell>
                          <TextField type="number" size="small" sx={{ width: 120 }} value={inv.amount} onChange={(e) => updateInvestment(idx, 'amount', Number(e.target.value))} />
                        </TableCell>
                        <TableCell>
                          <Chip label={inv.proof_attached ? 'Yes' : 'No'} size="small" color={inv.proof_attached ? 'success' : 'default'}
                            onClick={() => updateInvestment(idx, 'proof_attached', !inv.proof_attached)} clickable />
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption">{sectionDef?.maxAmount ? `₹${sectionDef.maxAmount.toLocaleString()}` : 'No limit'}</Typography>
                        </TableCell>
                        <TableCell>
                          <IconButton size="small" color="error" onClick={() => removeInvestment(idx)}><DeleteIcon fontSize="small" /></IconButton>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              {investments.length > 0 && (
                <Box mt={2}>
                  <Button variant="contained" onClick={handleSaveInvestments}>Save Declarations</Button>
                </Box>
              )}
            </>
          )}
        </Card>
      )}

      {/* Tab 3: Computation */}
      {tab === 2 && (
        <Card sx={{ borderRadius: 3, p: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>Tax Computation</Typography>
            <Button variant="contained" startIcon={<CalculateIcon />} onClick={handleCompute}>Compute Tax</Button>
          </Box>
          {computation ? (
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Card variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle2" color="textSecondary">Gross Income</Typography>
                  <Typography variant="h5">₹ {Number(computation.gross_income).toLocaleString()}</Typography>
                </Card>
              </Grid>
              <Grid item xs={6} md={3}>
                <Card variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle2" color="textSecondary">Standard Deduction</Typography>
                  <Typography variant="h6">₹ {Number(computation.standard_deduction).toLocaleString()}</Typography>
                </Card>
              </Grid>
              <Grid item xs={6} md={3}>
                <Card variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle2" color="textSecondary">Total Deductions</Typography>
                  <Typography variant="h6">₹ {Number(computation.total_deductions).toLocaleString()}</Typography>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card variant="outlined" sx={{ p: 2, bgcolor: '#fff3e0' }}>
                  <Typography variant="subtitle2" color="textSecondary">Taxable Income</Typography>
                  <Typography variant="h5" color="error">₹ {Number(computation.taxable_income).toLocaleString()}</Typography>
                </Card>
              </Grid>
              <Grid item xs={6} md={2}>
                <Card variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle2" color="textSecondary">Tax Before Cess</Typography>
                  <Typography variant="h6">₹ {Number(computation.tax_before_cess).toLocaleString()}</Typography>
                </Card>
              </Grid>
              <Grid item xs={6} md={2}>
                <Card variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle2" color="textSecondary">Rebate 87A</Typography>
                  <Typography variant="h6" color="success">₹ {Number(computation.rebate_87a).toLocaleString()}</Typography>
                </Card>
              </Grid>
              <Grid item xs={6} md={2}>
                <Card variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle2" color="textSecondary">Education Cess</Typography>
                  <Typography variant="h6">₹ {Number(computation.education_cess).toLocaleString()}</Typography>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card variant="outlined" sx={{ p: 2, bgcolor: '#e8f5e9' }}>
                  <Typography variant="subtitle2" color="textSecondary">Total Tax Payable</Typography>
                  <Typography variant="h5" color="primary">₹ {Number(computation.total_tax).toLocaleString()}</Typography>
                </Card>
              </Grid>
              <Grid item xs={6} md={4}>
                <Card variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle2" color="textSecondary">TDS Already Deducted</Typography>
                  <Typography variant="h6">₹ {Number(computation.tds_deducted).toLocaleString()}</Typography>
                </Card>
              </Grid>
              <Grid item xs={6} md={4}>
                <Card variant="outlined" sx={{ p: 2, bgcolor: Number(computation.tax_due) > 0 ? '#fce4ec' : '#e8f5e9' }}>
                  <Typography variant="subtitle2" color="textSecondary">Tax Due / Refund</Typography>
                  <Typography variant="h5" color={Number(computation.tax_due) > 0 ? 'error' : 'success'}>
                    ₹ {Number(computation.tax_due).toLocaleString()}
                    {Number(computation.tax_due) <= 0 ? ' (Refund)' : ' (Due)'}
                  </Typography>
                </Card>
              </Grid>
            </Grid>
          ) : (
            <Typography color="textSecondary" sx={{ py: 4, textAlign: 'center' }}>
              No computation found. Click "Compute Tax" to calculate.
            </Typography>
          )}
        </Card>
      )}
    </Box>
  );
}
