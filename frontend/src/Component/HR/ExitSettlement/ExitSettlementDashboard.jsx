import React, { useEffect, useState, useCallback } from 'react';
import {
  Box, Typography, Card, CardContent, Tabs, Tab, Grid, TextField, Button,
  Table, TableHead, TableRow, TableCell, TableBody, TableContainer, Paper,
  MenuItem, IconButton, Chip, Dialog, DialogTitle, DialogContent, DialogActions,
  LinearProgress, Divider,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import CalculateIcon from '@mui/icons-material/Calculate';
import axios from 'axios';

const API = '/api/exit';
const EMP_API = '/api/employees';

const STATUS_COLORS = {
  Submitted: 'info', Approved: 'success', Rejected: 'error', Cancelled: 'default',
  Pending: 'warning', Cleared: 'success', 'Not Applicable': 'default',
  Draft: 'default', Paid: 'success',
};

const EXIT_TYPES = ['Resignation', 'Termination', 'Retirement', 'Mutual Separation'];
const CLEARANCE_DEPTS = ['IT', 'HR', 'Accounts', 'Stores', 'Admin', 'Security'];

export default function ExitSettlementDashboard() {
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [dashboard, setDashboard] = useState(null);

  // Exit Applications
  const [exits, setExits] = useState([]);
  const [exitForm, setExitForm] = useState({ open: false, edit: null, view: null });
  const [exitData, setExitData] = useState({ empid: '', empname: '', resignation_date: '', last_working_day: '', reason: '', type: 'Resignation', remarks: '' });

  // Clearance
  const [clearance, setClearance] = useState([]);
  const [selectedExitId, setSelectedExitId] = useState(null);

  // Settlement
  const [settlement, setSettlement] = useState(null);

  // Employee lookup
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    axios.get(EMP_API).then(({ data }) => setEmployees(data)).catch(() => {});
  }, []);

  const fetchDashboard = useCallback(async () => {
    try { const { data } = await axios.get(`${API}/dashboard`); setDashboard(data); } catch (e) { console.error(e); }
  }, []);

  const fetchExits = useCallback(async () => {
    try { const { data } = await axios.get(`${API}/exits`); setExits(data); } catch (e) { console.error(e); }
  }, []);

  const fetchClearance = useCallback(async (exitId) => {
    if (!exitId) return;
    try {
      const { data } = await axios.get(`${API}/clearance`, { params: { exit_application_id: exitId } });
      setClearance(data);
    } catch (e) { console.error(e); }
  }, []);

  const fetchSettlement = useCallback(async (exitId) => {
    if (!exitId) return;
    try {
      const { data } = await axios.get(`${API}/settlement`, { params: { exit_application_id: exitId } });
      setSettlement(data?.id ? data : null);
    } catch (e) { console.error(e); }
  }, []);

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchDashboard(), fetchExits()]).finally(() => setLoading(false));
  }, [fetchDashboard, fetchExits]);

  useEffect(() => {
    if (selectedExitId) {
      fetchClearance(selectedExitId);
      fetchSettlement(selectedExitId);
    }
  }, [selectedExitId, fetchClearance, fetchSettlement]);

  // ---- Exit Application ----
  const openExitForm = (edit = null) => {
    setExitData(edit || { empid: '', empname: '', resignation_date: new Date().toISOString().slice(0, 10), last_working_day: '', reason: '', type: 'Resignation', remarks: '' });
    setExitForm({ open: true, edit, view: null });
  };

  const openExitView = async (exit) => {
    setExitData(exit);
    setExitForm({ open: true, edit: exit, view: exit });
    setSelectedExitId(exit.id);
  };

  const saveExit = async () => {
    try {
      if (exitForm.edit?.id) await axios.post(`${API}/exits`, { ...exitData, id: exitForm.edit.id });
      else await axios.post(`${API}/exits`, exitData);
      setExitForm({ open: false, edit: null });
      fetchExits();
      fetchDashboard();
    } catch (e) { console.error(e); }
  };

  const approveExit = async (id, status) => {
    await axios.post(`${API}/exits/approve`, { id, status, approved_by: 'HR' });
    fetchExits();
    fetchDashboard();
  };

  const onEmployeeSelect = (empid) => {
    const emp = employees.find((e) => e.empid === Number(empid));
    setExitData({ ...exitData, empid: Number(empid), empname: emp?.ename || '' });
  };

  // ---- Clearance ----
  const updateClearance = async (id, status) => {
    await axios.post(`${API}/clearance`, { id, status, cleared_by: 'HR User' });
    fetchClearance(selectedExitId);
    fetchDashboard();
  };

  // ---- Settlement ----
  const calculateSettlement = async () => {
    try {
      const { data } = await axios.post(`${API}/settlement/calculate`, { exit_application_id: selectedExitId });
      setSettlement(data.settlement);
    } catch (e) { console.error(e); }
  };

  const saveSettlement = async () => {
    try {
      if (settlement?.id) await axios.post(`${API}/settlement`, { ...settlement, id: settlement.id });
      else await axios.post(`${API}/settlement`, { ...settlement, exit_application_id: selectedExitId });
      fetchSettlement(selectedExitId);
    } catch (e) { console.error(e); }
  };

  const approveSettlement = async (id, status) => {
    await axios.post(`${API}/settlement/approve`, { id, status });
    fetchSettlement(selectedExitId);
    fetchDashboard();
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold', color: 'var(--heading-color)' }}>Exit & Final Settlement</Typography>
      {loading && <LinearProgress sx={{ mb: 2 }} />}

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label="Dashboard" />
        <Tab label="Exit Applications" />
        <Tab label="Clearance" />
        <Tab label="Settlement" />
      </Tabs>

      {/* ====== TAB 0: DASHBOARD ====== */}
      {tab === 0 && dashboard && (
        <Grid container spacing={2}>
          {[
            { label: 'Pending Exits', value: dashboard.pendingExits, color: '#f57c00' },
            { label: 'Approved Exits', value: dashboard.approvedExits, color: '#388e3c' },
            { label: 'Pending Clearance', value: dashboard.pendingClearance, color: 'var(--primary-main)' },
            { label: 'Pending Settlements', value: dashboard.pendingSettlements, color: '#7b1fa2' },
          ].map((s) => (
            <Grid item xs={12} sm={6} md={3} key={s.label}>
              <Card sx={{ borderRadius: 3, textAlign: 'center', py: 3 }}>
                <Typography variant="h3" sx={{ fontWeight: 700, color: s.color }}>{s.value}</Typography>
                <Typography variant="body2" color="textSecondary">{s.label}</Typography>
              </Card>
            </Grid>
          ))}
          <Grid item xs={12}>
            <Card sx={{ borderRadius: 3, p: 2 }}>
              <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>Recent Exits</Typography>
              {dashboard.recent?.map((r) => (
                <Box key={r.id} display="flex" justifyContent="space-between" sx={{ py: 0.5, borderBottom: '1px solid #eee' }}>
                  <Typography variant="body2">{r.empname} ({r.empid}) — {r.type}</Typography>
                  <Chip label={r.status} size="small" color={STATUS_COLORS[r.status] || 'default'} />
                </Box>
              ))}
            </Card>
          </Grid>
        </Grid>
      )}

      {/* ====== TAB 1: EXIT APPLICATIONS ====== */}
      {tab === 1 && (
        <Card sx={{ borderRadius: 3, p: 2 }}>
          <Box display="flex" justifyContent="space-between" mb={2}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>Exit Applications</Typography>
            <Button variant="contained" onClick={() => openExitForm()}>New Exit</Button>
          </Box>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Employee</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Resign Date</TableCell>
                  <TableCell>Last Working Day</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {exits.map((e) => (
                  <TableRow key={e.id} hover sx={{ cursor: 'pointer' }} onClick={() => openExitView(e)}>
                    <TableCell>{e.empname} ({e.empid})</TableCell>
                    <TableCell>{e.type}</TableCell>
                    <TableCell>{e.resignation_date}</TableCell>
                    <TableCell>{e.last_working_day}</TableCell>
                    <TableCell><Chip label={e.status} size="small" color={STATUS_COLORS[e.status] || 'default'} /></TableCell>
                    <TableCell onClick={(ev) => ev.stopPropagation()}>
                      {e.status === 'Submitted' && (
                        <>
                          <IconButton size="small" color="success" onClick={() => approveExit(e.id, 'Approved')} title="Approve"><CheckCircleIcon /></IconButton>
                          <IconButton size="small" color="error" onClick={() => approveExit(e.id, 'Rejected')} title="Reject"><CancelIcon /></IconButton>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {exits.length === 0 && <TableRow><TableCell colSpan={6} align="center">No exit applications</TableCell></TableRow>}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}

      {/* ====== TAB 2: CLEARANCE ====== */}
      {tab === 2 && (
        <Card sx={{ borderRadius: 3, p: 2 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Exit Clearance</Typography>
          <TextField select label="Select Exit Application" value={selectedExitId || ''} onChange={(e) => setSelectedExitId(Number(e.target.value))} sx={{ minWidth: 350, mb: 2 }}>
            {exits.filter((ex) => ex.status === 'Approved').map((ex) => (
              <MenuItem key={ex.id} value={ex.id}>{ex.empname} ({ex.empid}) — {ex.type}</MenuItem>
            ))}
          </TextField>
          {selectedExitId && (
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Department</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Cleared By</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {clearance.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell><strong>{c.department}</strong></TableCell>
                      <TableCell><Chip label={c.status} size="small" color={STATUS_COLORS[c.status] || 'default'} /></TableCell>
                      <TableCell>{c.cleared_by || '-'}</TableCell>
                      <TableCell>{c.cleared_date || '-'}</TableCell>
                      <TableCell>
                        {c.status === 'Pending' && (
                          <>
                            <IconButton size="small" color="success" onClick={() => updateClearance(c.id, 'Cleared')} title="Clear"><CheckCircleIcon /></IconButton>
                            <IconButton size="small" onClick={() => updateClearance(c.id, 'Not Applicable')} title="Not Applicable"><CancelIcon /></IconButton>
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Card>
      )}

      {/* ====== TAB 3: SETTLEMENT ====== */}
      {tab === 3 && (
        <Card sx={{ borderRadius: 3, p: 2 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Final Settlement</Typography>
          <TextField select label="Select Exit Application" value={selectedExitId || ''} onChange={(e) => setSelectedExitId(Number(e.target.value))} sx={{ minWidth: 350, mb: 2 }}>
            {exits.filter((ex) => ex.status === 'Approved').map((ex) => (
              <MenuItem key={ex.id} value={ex.id}>{ex.empname} ({ex.empid})</MenuItem>
            ))}
          </TextField>
          {selectedExitId && (
            <>
              <Box display="flex" gap={1} mb={2}>
                <Button variant="contained" startIcon={<CalculateIcon />} onClick={calculateSettlement}>Auto Calculate</Button>
                {settlement?.id && settlement.status === 'Draft' && (
                  <Button variant="contained" color="success" onClick={() => approveSettlement(settlement.id, 'Approved')}>Approve Settlement</Button>
                )}
              </Box>
              {settlement ? (
                <Box>
                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={4}><TextField label="Employee" size="small" fullWidth value={settlement.full_name || ''} InputProps={{ readOnly: true }} /></Grid>
                    <Grid item xs={4}><TextField label="Designation" size="small" fullWidth value={settlement.designation || ''} InputProps={{ readOnly: true }} /></Grid>
                    <Grid item xs={4}><TextField label="Department" size="small" fullWidth value={settlement.department || ''} InputProps={{ readOnly: true }} /></Grid>
                    <Grid item xs={3}><TextField label="Date of Joining" size="small" fullWidth value={settlement.date_of_joining || ''} InputProps={{ readOnly: true }} /></Grid>
                    <Grid item xs={3}><TextField label="Last Working Day" size="small" fullWidth value={settlement.last_working_day || ''} InputProps={{ readOnly: true }} /></Grid>
                    <Grid item xs={3}><TextField label="Tenure (Years)" size="small" fullWidth value={settlement.total_tenure_years || ''} InputProps={{ readOnly: true }} /></Grid>
                    <Grid item xs={3}><Chip label={settlement.status} color={STATUS_COLORS[settlement.status] || 'default'} /></Grid>
                  </Grid>
                  <Divider sx={{ mb: 2 }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>Earnings</Typography>
                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={3}>
                      <TextField label="Leave Encashment" type="number" size="small" fullWidth
                        value={settlement.leave_encashment_amount || 0}
                        onChange={(e) => setSettlement({ ...settlement, leave_encashment_amount: Number(e.target.value) })} />
                    </Grid>
                    <Grid item xs={3}>
                      <TextField label="Gratuity Amount" type="number" size="small" fullWidth
                        value={settlement.gratuity_amount || 0}
                        onChange={(e) => setSettlement({ ...settlement, gratuity_amount: Number(e.target.value) })} />
                    </Grid>
                    <Grid item xs={3}>
                      <TextField label="Salary Due Amount" type="number" size="small" fullWidth
                        value={settlement.salary_due_amount || 0}
                        onChange={(e) => setSettlement({ ...settlement, salary_due_amount: Number(e.target.value) })} />
                    </Grid>
                    <Grid item xs={3}>
                      <TextField label="Other Earnings" type="number" size="small" fullWidth
                        value={settlement.other_earnings || 0}
                        onChange={(e) => setSettlement({ ...settlement, other_earnings: Number(e.target.value) })} />
                    </Grid>
                  </Grid>
                  <Divider sx={{ mb: 2 }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>Deductions</Typography>
                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={3}>
                      <TextField label="Notice Period Amount" type="number" size="small" fullWidth
                        value={settlement.notice_period_amount || 0}
                        onChange={(e) => setSettlement({ ...settlement, notice_period_amount: Number(e.target.value) })} />
                    </Grid>
                    <Grid item xs={3}>
                      <TextField label="TDS Deducted" type="number" size="small" fullWidth
                        value={settlement.tds_deducted || 0}
                        onChange={(e) => setSettlement({ ...settlement, tds_deducted: Number(e.target.value) })} />
                    </Grid>
                    <Grid item xs={3}>
                      <TextField label="Other Deductions" type="number" size="small" fullWidth
                        value={settlement.other_deductions || 0}
                        onChange={(e) => setSettlement({ ...settlement, other_deductions: Number(e.target.value) })} />
                    </Grid>
                  </Grid>
                  <Divider sx={{ mb: 2 }} />
                  <Card variant="outlined" sx={{ p: 2, bgcolor: '#e8f5e9' }}>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: '#2e7d32' }}>
                      Net Payable: ₹{Number(settlement.gross_payable - settlement.tds_deducted - settlement.other_deductions).toLocaleString()}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Gross: ₹{Number(settlement.gross_payable || 0).toLocaleString()} | TDS: ₹{Number(settlement.tds_deducted || 0).toLocaleString()}
                    </Typography>
                  </Card>
                  <Box mt={2}>
                    <Button variant="contained" onClick={saveSettlement}>Save Settlement</Button>
                  </Box>
                </Box>
              ) : (
                <Typography color="textSecondary">No settlement calculated. Select an exit and click "Auto Calculate".</Typography>
              )}
            </>
          )}
        </Card>
      )}

      {/* ====== EXIT FORM DIALOG ====== */}
      <Dialog open={exitForm.open} onClose={() => setExitForm({ open: false, edit: null, view: null })} maxWidth="sm" fullWidth>
        <DialogTitle>{exitForm.view ? 'Exit Details' : exitForm.edit?.id ? 'Edit Exit' : 'New Exit Application'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {exitForm.view ? (
              <>
                <Grid item xs={6}><TextField label="Employee" fullWidth size="small" value={`${exitData.empname} (${exitData.empid})`} InputProps={{ readOnly: true }} /></Grid>
                <Grid item xs={6}><TextField label="Type" fullWidth size="small" value={exitData.type} InputProps={{ readOnly: true }} /></Grid>
                <Grid item xs={6}><TextField label="Resignation Date" fullWidth size="small" value={exitData.resignation_date} InputProps={{ readOnly: true }} /></Grid>
                <Grid item xs={6}><TextField label="Last Working Day" fullWidth size="small" value={exitData.last_working_day} InputProps={{ readOnly: true }} /></Grid>
                <Grid item xs={12}><TextField label="Reason" fullWidth size="small" multiline rows={3} value={exitData.reason} InputProps={{ readOnly: true }} /></Grid>
                <Grid item xs={12}><TextField label="Remarks" fullWidth size="small" multiline rows={2} value={exitData.remarks} InputProps={{ readOnly: true }} /></Grid>
              </>
            ) : (
              <>
                <Grid item xs={6}>
                  <TextField select label="Employee" fullWidth size="small" value={exitData.empid} onChange={(e) => onEmployeeSelect(e.target.value)}>
                    {employees.map((emp) => <MenuItem key={emp.empid} value={emp.empid}>{emp.ename} ({emp.empid})</MenuItem>)}
                  </TextField>
                </Grid>
                <Grid item xs={6}>
                  <TextField select label="Exit Type" fullWidth size="small" value={exitData.type} onChange={(e) => setExitData({ ...exitData, type: e.target.value })}>
                    {EXIT_TYPES.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                  </TextField>
                </Grid>
                <Grid item xs={6}><TextField label="Employee Name" fullWidth size="small" value={exitData.empname} onChange={(e) => setExitData({ ...exitData, empname: e.target.value })} /></Grid>
                <Grid item xs={6}><TextField label="Resignation Date" type="date" fullWidth size="small" value={exitData.resignation_date} onChange={(e) => setExitData({ ...exitData, resignation_date: e.target.value })} InputLabelProps={{ shrink: true }} /></Grid>
                <Grid item xs={6}><TextField label="Last Working Day" type="date" fullWidth size="small" value={exitData.last_working_day} onChange={(e) => setExitData({ ...exitData, last_working_day: e.target.value })} InputLabelProps={{ shrink: true }} /></Grid>
                <Grid item xs={12}><TextField label="Reason" fullWidth size="small" multiline rows={3} value={exitData.reason} onChange={(e) => setExitData({ ...exitData, reason: e.target.value })} /></Grid>
                <Grid item xs={12}><TextField label="Remarks" fullWidth size="small" multiline rows={2} value={exitData.remarks} onChange={(e) => setExitData({ ...exitData, remarks: e.target.value })} /></Grid>
              </>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExitForm({ open: false, edit: null, view: null })}>Close</Button>
          {!exitForm.view && <Button variant="contained" onClick={saveExit}>{exitForm.edit?.id ? 'Update' : 'Submit'}</Button>}
        </DialogActions>
      </Dialog>
    </Box>
  );
}
