import React, { useEffect, useState, useCallback } from 'react';
import {
  Box, Typography, Card, CardContent, Tabs, Tab, Grid, TextField, Button,
  Table, TableHead, TableRow, TableCell, TableBody, TableContainer, Paper,
  MenuItem, IconButton, Chip, Dialog, DialogTitle, DialogContent, DialogActions,
  LinearProgress, Alert,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import axios from 'axios';

const API = '/api/pms';
const EMP_API = '/api/employees';

const STATUS_COLORS = { Pending: 'warning', Submitted: 'info', Approved: 'success', Rejected: 'error', Open: 'info', Closed: 'default' };
const CYCLE_TYPES = ['Annual', 'Half-yearly', 'Quarterly', 'Monthly'];

export default function PMSDashboard() {
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [dashboard, setDashboard] = useState(null);
  const [employees, setEmployees] = useState([]);

  // Templates
  const [templates, setTemplates] = useState([]);
  const [tmplForm, setTmplForm] = useState({ open: false, edit: null });
  const [tmplData, setTmplData] = useState({ template_name: '', department: '', designation: '', financial_year: '' });
  const [tmplItems, setTmplItems] = useState([]);

  // Cycles
  const [cycles, setCycles] = useState([]);
  const [cycleForm, setCycleForm] = useState({ open: false });
  const [cycleData, setCycleData] = useState({ cycle_name: '', cycle_type: 'Annual', financial_year: '', start_date: '', end_date: '' });

  // Appraisals
  const [appraisals, setAppraisals] = useState([]);
  const [apprForm, setApprForm] = useState({ open: false, view: null });
  const [apprData, setApprData] = useState(null);
  const [apprRatings, setApprRatings] = useState([]);
  const [apprTemplate, setApprTemplate] = useState(null);
  const [bulkCycleId, setBulkCycleId] = useState('');
  const [bulkTemplateId, setBulkTemplateId] = useState('');

  const [selCycle, setSelCycle] = useState('');

  useEffect(() => {
    axios.get(EMP_API).then(({ data }) => setEmployees(data)).catch(() => {});
  }, []);

  const fetchDashboard = useCallback(async () => {
    try { const { data } = await axios.get(`${API}/dashboard`); setDashboard(data); } catch (e) { console.error(e); }
  }, []);

  const fetchTemplates = useCallback(async () => {
    try { const { data } = await axios.get(`${API}/templates`); setTemplates(data); } catch (e) { console.error(e); }
  }, []);

  const fetchCycles = useCallback(async () => {
    try { const { data } = await axios.get(`${API}/cycles`); setCycles(data); } catch (e) { console.error(e); }
  }, []);

  const fetchAppraisals = useCallback(async () => {
    try {
      const params = selCycle ? { cycle_id: selCycle } : {};
      const { data } = await axios.get(`${API}/appraisals`, { params });
      setAppraisals(data);
    } catch (e) { console.error(e); }
  }, [selCycle]);

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchDashboard(), fetchTemplates(), fetchCycles(), fetchAppraisals()]).finally(() => setLoading(false));
  }, [fetchDashboard, fetchTemplates, fetchCycles, fetchAppraisals]);

  // ---- Templates ----
  const openTmplForm = (edit = null) => {
    if (edit) {
      setTmplData(edit);
      setTmplItems(edit.items || []);
    } else {
      const fy = `${new Date().getFullYear()}-${String(new Date().getFullYear() + 1).slice(2)}`;
      setTmplData({ template_name: '', department: '', designation: '', financial_year: fy });
      setTmplItems([{ kpi_name: '', weightage: 0, target: '', measurement_unit: '', description: '' }]);
    }
    setTmplForm({ open: true, edit });
  };

  const addKpi = () => setTmplItems([...tmplItems, { kpi_name: '', weightage: 0, target: '', measurement_unit: '', description: '' }]);
  const removeKpi = (i) => setTmplItems(tmplItems.filter((_, idx) => idx !== i));
  const updateKpi = (i, field, value) => setTmplItems(tmplItems.map((item, idx) => idx === i ? { ...item, [field]: value } : item));

  const saveTemplate = async () => {
    const payload = tmplForm.edit ? { ...tmplData, id: tmplForm.edit.id, items: tmplItems } : { ...tmplData, items: tmplItems };
    await axios.post(`${API}/templates`, payload);
    setTmplForm({ open: false, edit: null });
    fetchTemplates();
  };

  // ---- Cycles ----
  const openCycleForm = () => {
    setCycleData({ cycle_name: '', cycle_type: 'Annual', financial_year: '', start_date: '', end_date: '' });
    setCycleForm({ open: true });
  };

  const saveCycle = async () => {
    await axios.post(`${API}/cycles`, cycleData);
    setCycleForm({ open: false });
    fetchCycles();
  };

  // ---- Appraisals ----
  const viewAppraisal = async (a) => {
    try {
      const { data } = await axios.get(`${API}/appraisals/${a.id}`);
      setApprData(data.appraisal);
      setApprRatings(data.ratings);
      setApprTemplate(data.template);
      setApprForm({ open: true, view: a });
    } catch (e) { console.error(e); }
  };

  const updateRating = (idx, field, value) => {
    setApprRatings((prev) => prev.map((r, i) => i === idx ? { ...r, [field]: value } : r));
  };

  const submitAppraisal = async () => {
    await axios.post(`${API}/appraisals/submit`, { id: apprData.id, reviewer: 'Manager' });
    alert('Appraisal submitted!');
    setApprForm({ open: false, view: null });
    fetchAppraisals();
    fetchDashboard();
  };

  const approveAppraisal = async (id, status) => {
    await axios.post(`${API}/appraisals/approve`, { id, status });
    if (apprForm.open) setApprForm({ open: false, view: null });
    fetchAppraisals();
    fetchDashboard();
  };

  const bulkInitiate = async () => {
    if (!bulkCycleId || !bulkTemplateId) return alert('Select cycle and template');
    const empids = employees.map((e) => e.empid);
    const { data } = await axios.post(`${API}/appraisals/bulk-initiate`, { cycle_id: Number(bulkCycleId), template_id: Number(bulkTemplateId), empids });
    alert(`Created ${data.created} appraisals, skipped ${data.skipped}`);
    fetchAppraisals();
    fetchDashboard();
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold', color: 'var(--heading-color)' }}>Performance Management</Typography>
      {loading && <LinearProgress sx={{ mb: 2 }} />}

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label="Dashboard" />
        <Tab label="KRA Templates" />
        <Tab label="Appraisal Cycles" />
        <Tab label="Appraisals" />
      </Tabs>

      {/* TAB 0: DASHBOARD */}
      {tab === 0 && dashboard && (
        <Grid container spacing={2}>
          {[
            { label: 'Active Cycles', value: dashboard.activeCycles, color: 'var(--primary-main)' },
            { label: 'Pending Appraisals', value: dashboard.pendingAppraisals, color: '#f57c00' },
            { label: 'Submitted', value: dashboard.submittedAppraisals, color: '#7b1fa2' },
            { label: 'Approved', value: dashboard.approvedAppraisals, color: '#388e3c' },
          ].map((s) => (
            <Grid item xs={12} sm={6} md={3} key={s.label}>
              <Card sx={{ borderRadius: 3, textAlign: 'center', py: 3 }}>
                <Typography variant="h3" sx={{ fontWeight: 700, color: s.color }}>{s.value}</Typography>
                <Typography variant="body2" color="textSecondary">{s.label}</Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* TAB 1: KRA TEMPLATES */}
      {tab === 1 && (
        <Card sx={{ borderRadius: 3, p: 2 }}>
          <Box display="flex" justifyContent="space-between" mb={2}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>KRA Templates</Typography>
            <Button startIcon={<AddIcon />} variant="contained" onClick={() => openTmplForm()}>New Template</Button>
          </Box>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Template Name</TableCell>
                  <TableCell>Department</TableCell>
                  <TableCell>Designation</TableCell>
                  <TableCell>FY</TableCell>
                  <TableCell>KPIs</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {templates.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell>{t.template_name}</TableCell>
                    <TableCell>{t.department}</TableCell>
                    <TableCell>{t.designation}</TableCell>
                    <TableCell>{t.financial_year}</TableCell>
                    <TableCell>{t.items?.length || 0}</TableCell>
                    <TableCell>
                      <IconButton size="small" onClick={() => openTmplForm(t)}><EditIcon /></IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {templates.length === 0 && <TableRow><TableCell colSpan={6} align="center">No templates</TableCell></TableRow>}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}

      {/* TAB 2: CYCLES */}
      {tab === 2 && (
        <Card sx={{ borderRadius: 3, p: 2 }}>
          <Box display="flex" justifyContent="space-between" mb={2}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>Appraisal Cycles</Typography>
            <Button startIcon={<AddIcon />} variant="contained" onClick={openCycleForm}>New Cycle</Button>
          </Box>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>FY</TableCell>
                  <TableCell>Start Date</TableCell>
                  <TableCell>End Date</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {cycles.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>{c.cycle_name}</TableCell>
                    <TableCell>{c.cycle_type}</TableCell>
                    <TableCell>{c.financial_year}</TableCell>
                    <TableCell>{c.start_date}</TableCell>
                    <TableCell>{c.end_date}</TableCell>
                    <TableCell><Chip label={c.status} size="small" color={STATUS_COLORS[c.status] || 'default'} /></TableCell>
                  </TableRow>
                ))}
                {cycles.length === 0 && <TableRow><TableCell colSpan={6} align="center">No cycles</TableCell></TableRow>}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}

      {/* TAB 3: APPRAISALS */}
      {tab === 3 && (
        <Card sx={{ borderRadius: 3, p: 2 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2} flexWrap="wrap" gap={1}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>Appraisals</Typography>
            <Box display="flex" gap={1} alignItems="center">
              <TextField select label="Cycle" size="small" value={selCycle} onChange={(e) => setSelCycle(e.target.value)} sx={{ minWidth: 150 }}>
                <MenuItem value="">All Cycles</MenuItem>
                {cycles.map((c) => <MenuItem key={c.id} value={c.id}>{c.cycle_name}</MenuItem>)}
              </TextField>
              <Button variant="contained" onClick={async () => {
                if (!bulkCycleId || !bulkTemplateId) return alert('Select cycle and template below first');
                await bulkInitiate();
              }}>Bulk Initiate</Button>
            </Box>
          </Box>
          <Box display="flex" gap={1} mb={2}>
            <TextField select label="Bulk Cycle" size="small" value={bulkCycleId} onChange={(e) => setBulkCycleId(e.target.value)} sx={{ minWidth: 150 }}>
              {cycles.filter((c) => c.status === 'Open').map((c) => <MenuItem key={c.id} value={c.id}>{c.cycle_name}</MenuItem>)}
            </TextField>
            <TextField select label="Bulk Template" size="small" value={bulkTemplateId} onChange={(e) => setBulkTemplateId(e.target.value)} sx={{ minWidth: 200 }}>
              {templates.map((t) => <MenuItem key={t.id} value={t.id}>{t.template_name}</MenuItem>)}
            </TextField>
          </Box>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Employee ID</TableCell>
                  <TableCell>Cycle</TableCell>
                  <TableCell>Self Score</TableCell>
                  <TableCell>Manager Score</TableCell>
                  <TableCell>Rating</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {appraisals.map((a) => {
                  const cycle = cycles.find((c) => c.id === a.cycle_id);
                  return (
                    <TableRow key={a.id} hover sx={{ cursor: 'pointer' }} onClick={() => viewAppraisal(a)}>
                      <TableCell>{a.empid}</TableCell>
                      <TableCell>{cycle?.cycle_name || a.cycle_id}</TableCell>
                      <TableCell>{a.self_final_score || '-'}</TableCell>
                      <TableCell>{a.manager_final_score || '-'}</TableCell>
                      <TableCell><strong>{a.overall_rating || '-'}</strong></TableCell>
                      <TableCell><Chip label={a.status} size="small" color={STATUS_COLORS[a.status] || 'default'} /></TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        {a.status === 'Submitted' && (
                          <IconButton size="small" color="success" onClick={() => approveAppraisal(a.id, 'Approved')} title="Approve"><CheckCircleIcon /></IconButton>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
                {appraisals.length === 0 && <TableRow><TableCell colSpan={7} align="center">No appraisals</TableCell></TableRow>}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}

      {/* ===== TEMPLATE DIALOG ===== */}
      <Dialog open={tmplForm.open} onClose={() => setTmplForm({ open: false, edit: null })} maxWidth="md" fullWidth>
        <DialogTitle>{tmplForm.edit ? 'Edit Template' : 'New KRA Template'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={6}><TextField label="Template Name" fullWidth size="small" value={tmplData.template_name} onChange={(e) => setTmplData({ ...tmplData, template_name: e.target.value })} /></Grid>
            <Grid item xs={3}><TextField label="Department" fullWidth size="small" value={tmplData.department} onChange={(e) => setTmplData({ ...tmplData, department: e.target.value })} /></Grid>
            <Grid item xs={3}><TextField label="Designation" fullWidth size="small" value={tmplData.designation} onChange={(e) => setTmplData({ ...tmplData, designation: e.target.value })} /></Grid>
          </Grid>
          <Typography variant="subtitle2" sx={{ mt: 2, mb: 1, fontWeight: 600 }}>KRA / KPI Items</Typography>
          {tmplItems.map((item, i) => (
            <Grid container spacing={1} key={i} sx={{ mb: 1 }}>
              <Grid item xs={3}><TextField label="KPI Name" size="small" fullWidth value={item.kpi_name} onChange={(e) => updateKpi(i, 'kpi_name', e.target.value)} /></Grid>
              <Grid item xs={1}><TextField label="Weight %" type="number" size="small" fullWidth value={item.weightage} onChange={(e) => updateKpi(i, 'weightage', Number(e.target.value))} /></Grid>
              <Grid item xs={2}><TextField label="Target" size="small" fullWidth value={item.target} onChange={(e) => updateKpi(i, 'target', e.target.value)} /></Grid>
              <Grid item xs={2}><TextField label="Unit" size="small" fullWidth value={item.measurement_unit} onChange={(e) => updateKpi(i, 'measurement_unit', e.target.value)} /></Grid>
              <Grid item xs={3}><TextField label="Description" size="small" fullWidth value={item.description} onChange={(e) => updateKpi(i, 'description', e.target.value)} /></Grid>
              <Grid item xs={1}><IconButton color="error" onClick={() => removeKpi(i)}><DeleteIcon /></IconButton></Grid>
            </Grid>
          ))}
          <Button startIcon={<AddIcon />} size="small" onClick={addKpi}>Add KPI</Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTmplForm({ open: false, edit: null })}>Cancel</Button>
          <Button variant="contained" onClick={saveTemplate}>Save</Button>
        </DialogActions>
      </Dialog>

      {/* ===== CYCLE DIALOG ===== */}
      <Dialog open={cycleForm.open} onClose={() => setCycleForm({ open: false })} maxWidth="sm" fullWidth>
        <DialogTitle>New Appraisal Cycle</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={6}><TextField label="Cycle Name" fullWidth size="small" value={cycleData.cycle_name} onChange={(e) => setCycleData({ ...cycleData, cycle_name: e.target.value })} /></Grid>
            <Grid item xs={6}><TextField select label="Type" fullWidth size="small" value={cycleData.cycle_type} onChange={(e) => setCycleData({ ...cycleData, cycle_type: e.target.value })}>{CYCLE_TYPES.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}</TextField></Grid>
            <Grid item xs={4}><TextField label="Financial Year" fullWidth size="small" value={cycleData.financial_year} onChange={(e) => setCycleData({ ...cycleData, financial_year: e.target.value })} /></Grid>
            <Grid item xs={4}><TextField label="Start Date" type="date" fullWidth size="small" value={cycleData.start_date} onChange={(e) => setCycleData({ ...cycleData, start_date: e.target.value })} InputLabelProps={{ shrink: true }} /></Grid>
            <Grid item xs={4}><TextField label="End Date" type="date" fullWidth size="small" value={cycleData.end_date} onChange={(e) => setCycleData({ ...cycleData, end_date: e.target.value })} InputLabelProps={{ shrink: true }} /></Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCycleForm({ open: false })}>Cancel</Button>
          <Button variant="contained" onClick={saveCycle}>Create</Button>
        </DialogActions>
      </Dialog>

      {/* ===== APPRAISAL VIEW DIALOG ===== */}
      <Dialog open={apprForm.open} onClose={() => setApprForm({ open: false, view: null })} maxWidth="md" fullWidth>
        <DialogTitle>Appraisal — Employee #{apprData?.empid}</DialogTitle>
        <DialogContent>
          {apprTemplate && (
            <>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>Template: {apprTemplate.template_name}</Typography>
              <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>KPI</TableCell>
                      <TableCell>Weight</TableCell>
                      <TableCell>Target</TableCell>
                      <TableCell>Self Score</TableCell>
                      <TableCell>Manager Score</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {apprTemplate.items?.map((item) => {
                      const rating = apprRatings.find((r) => r.template_item_id === item.id);
                      const idx = apprRatings.findIndex((r) => r.template_item_id === item.id);
                      return (
                        <TableRow key={item.id}>
                          <TableCell>{item.kpi_name}</TableCell>
                          <TableCell>{item.weightage}%</TableCell>
                          <TableCell>{item.target}</TableCell>
                          <TableCell>
                            {apprData?.status === 'Pending' ? (
                              <TextField type="number" size="small" sx={{ width: 80 }}
                                value={rating?.self_score || ''}
                                onChange={(e) => updateRating(idx >= 0 ? idx : 0, 'self_score', Number(e.target.value))} />
                            ) : (rating?.self_score || '-')}
                          </TableCell>
                          <TableCell>
                            {(apprData?.status === 'Pending' || apprData?.status === 'Submitted') ? (
                              <TextField type="number" size="small" sx={{ width: 80 }}
                                value={rating?.manager_score || ''}
                                onChange={(e) => updateRating(idx >= 0 ? idx : 0, 'manager_score', Number(e.target.value))} />
                            ) : (rating?.manager_score || '-')}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
              <Box display="flex" gap={2} alignItems="center">
                <Typography variant="h6">
                  Overall: <strong>{apprData?.overall_rating || 'Not computed'}</strong>
                </Typography>
                <Chip label={apprData?.status} color={STATUS_COLORS[apprData?.status] || 'default'} />
              </Box>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setApprForm({ open: false, view: null })}>Close</Button>
          {apprData?.status === 'Pending' && (
            <Button variant="contained" onClick={submitAppraisal}>Submit Appraisal</Button>
          )}
          {apprData?.status === 'Submitted' && (
            <Button variant="contained" color="success" onClick={() => approveAppraisal(apprData.id, 'Approved')}>Approve</Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
}
