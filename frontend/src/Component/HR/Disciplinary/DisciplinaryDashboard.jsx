import React, { useEffect, useState, useCallback } from 'react';
import {
  Box, Typography, Card, CardContent, Tabs, Tab, Grid, TextField, Button,
  Table, TableHead, TableRow, TableCell, TableBody, TableContainer, Paper,
  MenuItem, IconButton, Chip, Dialog, DialogTitle, DialogContent, DialogActions,
  LinearProgress,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import axios from 'axios';

const API = '/api/disciplinary';
const EMP_API = '/api/employees';

const STATUS_COLORS = { Open: 'error', 'Show Cause Issued': 'warning', Closed: 'default' };
const SEVERITIES = ['Low', 'Medium', 'High', 'Critical'];
const NATURES = ['Misconduct', 'Attendance', 'Performance', 'Policy Violation', 'Harassment', 'Fraud', 'Other'];
const ACTION_TYPES = ['Verbal Warning', 'Written Warning', 'Final Warning', 'Suspension', 'Fine', 'Demotion', 'Termination'];

export default function DisciplinaryDashboard() {
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [dashboard, setDashboard] = useState(null);
  const [employees, setEmployees] = useState([]);

  const [cases, setCases] = useState([]);
  const [caseForm, setCaseForm] = useState({ open: false });
  const [caseData, setCaseData] = useState({ empid: '', incident_date: '', reported_date: '', nature: '', severity: 'Medium', description: '', reported_by: '' });

  const [viewCase, setViewCase] = useState(null);
  const [showCauses, setShowCauses] = useState([]);
  const [actions, setActions] = useState([]);

  const [scForm, setScForm] = useState({ open: false });
  const [scData, setScData] = useState({ case_id: '', issued_date: '', response_deadline: '', charges: '' });

  const [actionForm, setActionForm] = useState({ open: false });
  const [actionData, setActionData] = useState({ case_id: '', action_type: '', action_date: '', description: '', effective_from: '', effective_to: '', approved_by: '' });

  useEffect(() => {
    axios.get(EMP_API).then(({ data }) => setEmployees(data)).catch(() => {});
  }, []);

  const fetchDashboard = useCallback(async () => {
    try { const { data } = await axios.get(`${API}/dashboard`); setDashboard(data); } catch (e) { console.error(e); }
  }, []);

  const fetchCases = useCallback(async () => {
    try { const { data } = await axios.get(`${API}/cases`); setCases(data); } catch (e) { console.error(e); }
  }, []);

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchDashboard(), fetchCases()]).finally(() => setLoading(false));
  }, [fetchDashboard, fetchCases]);

  const viewCaseDetails = async (c) => {
    try {
      const { data } = await axios.get(`${API}/cases/${c.id}`);
      setViewCase(data.case);
      setShowCauses(data.showCauses);
      setActions(data.actions);
    } catch (e) { console.error(e); }
  };

  const saveCase = async () => {
    try {
      await axios.post(`${API}/cases`, caseData);
      setCaseForm({ open: false });
      fetchCases();
      fetchDashboard();
    } catch (e) { console.error(e); }
  };

  const saveShowCause = async () => {
    try {
      await axios.post(`${API}/show-cause`, scData);
      setScForm({ open: false });
      viewCaseDetails(viewCase);
      fetchCases();
      fetchDashboard();
    } catch (e) { console.error(e); }
  };

  const saveAction = async () => {
    try {
      await axios.post(`${API}/actions`, actionData);
      setActionForm({ open: false });
      viewCaseDetails(viewCase);
      fetchCases();
      fetchDashboard();
    } catch (e) { console.error(e); }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold', color: 'var(--heading-color)' }}>Disciplinary Management</Typography>
      {loading && <LinearProgress sx={{ mb: 2 }} />}

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label="Dashboard" />
        <Tab label="Cases" />
        <Tab label="Case Details" />
      </Tabs>

      {/* TAB 0: DASHBOARD */}
      {tab === 0 && dashboard && (
        <Grid container spacing={2}>
          {[
            { label: 'Open Cases', value: dashboard.openCases, color: '#d32f2f' },
            { label: 'Total Cases', value: dashboard.totalCases, color: '#1976d2' },
            { label: 'Pending SC Responses', value: dashboard.pendingResponses, color: '#f57c00' },
          ].map((s) => (
            <Grid item xs={12} sm={4} key={s.label}>
              <Card sx={{ borderRadius: 3, textAlign: 'center', py: 3 }}>
                <Typography variant="h3" sx={{ fontWeight: 700, color: s.color }}>{s.value}</Typography>
                <Typography variant="body2" color="textSecondary">{s.label}</Typography>
              </Card>
            </Grid>
          ))}
          <Grid item xs={12}>
            <Card sx={{ borderRadius: 3, p: 2 }}>
              <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>Recent Cases</Typography>
              {dashboard.recent?.map((c) => (
                <Box key={c.id} display="flex" justifyContent="space-between" sx={{ py: 0.5, borderBottom: '1px solid #eee' }}>
                  <Typography variant="body2">{c.case_no} — {c.nature}</Typography>
                  <Chip label={c.status} size="small" color={STATUS_COLORS[c.status] || 'default'} />
                </Box>
              ))}
            </Card>
          </Grid>
        </Grid>
      )}

      {/* TAB 1: CASES LIST */}
      {tab === 1 && (
        <Card sx={{ borderRadius: 3, p: 2 }}>
          <Box display="flex" justifyContent="space-between" mb={2}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>Disciplinary Cases</Typography>
            <Button startIcon={<AddIcon />} variant="contained" onClick={() => {
              setCaseData({ empid: '', incident_date: '', reported_date: new Date().toISOString().slice(0, 10), nature: '', severity: 'Medium', description: '', reported_by: '' });
              setCaseForm({ open: true });
            }}>New Case</Button>
          </Box>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Case No</TableCell>
                  <TableCell>Employee</TableCell>
                  <TableCell>Nature</TableCell>
                  <TableCell>Severity</TableCell>
                  <TableCell>Incident Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {cases.map((c) => (
                  <TableRow key={c.id} hover sx={{ cursor: 'pointer' }} onClick={() => { viewCaseDetails(c); setTab(2); }}>
                    <TableCell>{c.case_no}</TableCell>
                    <TableCell>{c.empid}</TableCell>
                    <TableCell>{c.nature}</TableCell>
                    <TableCell><Chip label={c.severity} size="small" color={c.severity === 'Critical' ? 'error' : c.severity === 'High' ? 'warning' : 'default'} /></TableCell>
                    <TableCell>{c.incident_date}</TableCell>
                    <TableCell><Chip label={c.status} size="small" color={STATUS_COLORS[c.status] || 'default'} /></TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      {c.status === 'Open' && (
                        <Button size="small" onClick={() => {
                          setScData({ case_id: c.id, issued_date: new Date().toISOString().slice(0, 10), response_deadline: '', charges: '' });
                          setScForm({ open: true });
                        }}>Show Cause</Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {cases.length === 0 && <TableRow><TableCell colSpan={7} align="center">No cases</TableCell></TableRow>}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}

      {/* TAB 2: CASE DETAILS */}
      {tab === 2 && viewCase && (
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Card sx={{ borderRadius: 3, p: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>{viewCase.case_no} — {viewCase.nature}</Typography>
              <Typography variant="body2" color="textSecondary">Employee: {viewCase.empid} | Severity: {viewCase.severity} | Status: {viewCase.status}</Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>{viewCase.description}</Typography>
              {viewCase.status === 'Open' && (
                <Box mt={2}>
                  <Button variant="contained" size="small" sx={{ mr: 1 }} onClick={() => {
                    setScData({ case_id: viewCase.id, issued_date: new Date().toISOString().slice(0, 10), response_deadline: '', charges: '' });
                    setScForm({ open: true });
                  }}>Issue Show Cause</Button>
                </Box>
              )}
            </Card>
          </Grid>

          {showCauses.length > 0 && (
            <Grid item xs={12} md={6}>
              <Card sx={{ borderRadius: 3, p: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>Show Cause Notices</Typography>
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Notice No</TableCell>
                        <TableCell>Issued</TableCell>
                        <TableCell>Deadline</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Response</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {showCauses.map((sc) => (
                        <TableRow key={sc.id}>
                          <TableCell>{sc.notice_no}</TableCell>
                          <TableCell>{sc.issued_date}</TableCell>
                          <TableCell>{sc.response_deadline}</TableCell>
                          <TableCell><Chip label={sc.status} size="small" /></TableCell>
                          <TableCell>
                            {sc.employee_response ? (
                              <Typography variant="caption">{sc.employee_response}</Typography>
                            ) : '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Card>
            </Grid>
          )}

          <Grid item xs={12} md={showCauses.length > 0 ? 6 : 12}>
            <Card sx={{ borderRadius: 3, p: 2 }}>
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Actions Taken</Typography>
                <Button size="small" startIcon={<AddIcon />} onClick={() => {
                  setActionData({ case_id: viewCase.id, action_type: '', action_date: new Date().toISOString().slice(0, 10), description: '', effective_from: '', effective_to: '', approved_by: '' });
                  setActionForm({ open: true });
                }}>Add Action</Button>
              </Box>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Type</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell>Approved By</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {actions.map((a) => (
                      <TableRow key={a.id}>
                        <TableCell>{a.action_type}</TableCell>
                        <TableCell>{a.action_date}</TableCell>
                        <TableCell>{a.description}</TableCell>
                        <TableCell>{a.approved_by}</TableCell>
                      </TableRow>
                    ))}
                    {actions.length === 0 && <TableRow><TableCell colSpan={4} align="center">No actions taken</TableCell></TableRow>}
                  </TableBody>
                </Table>
              </TableContainer>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* NEW CASE DIALOG */}
      <Dialog open={caseForm.open} onClose={() => setCaseForm({ open: false })} maxWidth="sm" fullWidth>
        <DialogTitle>New Disciplinary Case</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={6}>
              <TextField select label="Employee" fullWidth size="small" value={caseData.empid} onChange={(e) => setCaseData({ ...caseData, empid: Number(e.target.value) })}>
                {employees.map((e) => <MenuItem key={e.empid} value={e.empid}>{e.ename} ({e.empid})</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={6}>
              <TextField select label="Severity" fullWidth size="small" value={caseData.severity} onChange={(e) => setCaseData({ ...caseData, severity: e.target.value })}>
                {SEVERITIES.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={6}>
              <TextField select label="Nature" fullWidth size="small" value={caseData.nature} onChange={(e) => setCaseData({ ...caseData, nature: e.target.value })}>
                {NATURES.map((n) => <MenuItem key={n} value={n}>{n}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={6}><TextField label="Reported By" fullWidth size="small" value={caseData.reported_by} onChange={(e) => setCaseData({ ...caseData, reported_by: e.target.value })} /></Grid>
            <Grid item xs={6}><TextField label="Incident Date" type="date" fullWidth size="small" value={caseData.incident_date} onChange={(e) => setCaseData({ ...caseData, incident_date: e.target.value })} InputLabelProps={{ shrink: true }} /></Grid>
            <Grid item xs={6}><TextField label="Reported Date" type="date" fullWidth size="small" value={caseData.reported_date} onChange={(e) => setCaseData({ ...caseData, reported_date: e.target.value })} InputLabelProps={{ shrink: true }} /></Grid>
            <Grid item xs={12}><TextField label="Description" fullWidth size="small" multiline rows={3} value={caseData.description} onChange={(e) => setCaseData({ ...caseData, description: e.target.value })} /></Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCaseForm({ open: false })}>Cancel</Button>
          <Button variant="contained" onClick={saveCase}>Save</Button>
        </DialogActions>
      </Dialog>

      {/* SHOW CAUSE DIALOG */}
      <Dialog open={scForm.open} onClose={() => setScForm({ open: false })} maxWidth="sm" fullWidth>
        <DialogTitle>Issue Show Cause Notice</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={6}><TextField label="Issued Date" type="date" fullWidth size="small" value={scData.issued_date} onChange={(e) => setScData({ ...scData, issued_date: e.target.value })} InputLabelProps={{ shrink: true }} /></Grid>
            <Grid item xs={6}><TextField label="Response Deadline" type="date" fullWidth size="small" value={scData.response_deadline} onChange={(e) => setScData({ ...scData, response_deadline: e.target.value })} InputLabelProps={{ shrink: true }} /></Grid>
            <Grid item xs={12}><TextField label="Charges" fullWidth size="small" multiline rows={4} value={scData.charges} onChange={(e) => setScData({ ...scData, charges: e.target.value })} /></Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setScForm({ open: false })}>Cancel</Button>
          <Button variant="contained" onClick={saveShowCause}>Issue</Button>
        </DialogActions>
      </Dialog>

      {/* ACTION DIALOG */}
      <Dialog open={actionForm.open} onClose={() => setActionForm({ open: false })} maxWidth="sm" fullWidth>
        <DialogTitle>Take Disciplinary Action</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={6}>
              <TextField select label="Action Type" fullWidth size="small" value={actionData.action_type} onChange={(e) => setActionData({ ...actionData, action_type: e.target.value })}>
                {ACTION_TYPES.map((a) => <MenuItem key={a} value={a}>{a}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={6}><TextField label="Action Date" type="date" fullWidth size="small" value={actionData.action_date} onChange={(e) => setActionData({ ...actionData, action_date: e.target.value })} InputLabelProps={{ shrink: true }} /></Grid>
            <Grid item xs={6}><TextField label="Effective From" type="date" fullWidth size="small" value={actionData.effective_from} onChange={(e) => setActionData({ ...actionData, effective_from: e.target.value })} InputLabelProps={{ shrink: true }} /></Grid>
            <Grid item xs={6}><TextField label="Effective To" type="date" fullWidth size="small" value={actionData.effective_to} onChange={(e) => setActionData({ ...actionData, effective_to: e.target.value })} InputLabelProps={{ shrink: true }} /></Grid>
            <Grid item xs={6}><TextField label="Approved By" fullWidth size="small" value={actionData.approved_by} onChange={(e) => setActionData({ ...actionData, approved_by: e.target.value })} /></Grid>
            <Grid item xs={12}><TextField label="Description" fullWidth size="small" multiline rows={2} value={actionData.description} onChange={(e) => setActionData({ ...actionData, description: e.target.value })} /></Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setActionForm({ open: false })}>Cancel</Button>
          <Button variant="contained" onClick={saveAction}>Apply Action</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
