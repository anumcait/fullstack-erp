import React, { useEffect, useState, useCallback } from 'react';
import {
  Box, Typography, Card, CardContent, Tabs, Tab, Grid, TextField, Button,
  Table, TableHead, TableRow, TableCell, TableBody, TableContainer, Paper,
  MenuItem, IconButton, Chip, Dialog, DialogTitle, DialogContent, DialogActions,
  LinearProgress, Alert,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import axios from 'axios';

const API = '/api/recruitment';

const STATUS_COLORS = {
  Draft: 'default', Open: 'info', Closed: 'error', Cancelled: 'default',
  New: 'default', Shortlisted: 'info', 'Interview Scheduled': 'warning',
  Selected: 'success', Rejected: 'error', Offered: 'info', Joined: 'success',
  Scheduled: 'warning', Completed: 'success',
  Sent: 'info', Accepted: 'success', Declined: 'error', Withdrawn: 'default',
};

const DEPARTMENTS = ['Production', 'Engineering', 'Quality', 'Marketing', 'Purchase', 'Stores', 'HR', 'Accounts', 'IT', 'Maintenance', 'Planning'];

export default function RecruitmentDashboard() {
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [dashboard, setDashboard] = useState(null);

  // Requisitions
  const [requisitions, setRequisitions] = useState([]);
  const [reqForm, setReqForm] = useState({ open: false, edit: null });
  const [reqData, setReqData] = useState({ position_title: '', department: '', no_of_positions: 1, qualification: '', experience_years: '', location: '', salary_range: '', description: '', requested_by: '' });

  // Candidates
  const [candidates, setCandidates] = useState([]);
  const [canForm, setCanForm] = useState({ open: false, edit: null });
  const [canData, setCanData] = useState({ requisition_id: '', name: '', email: '', phone: '', current_company: '', experience_years: '', qualification: '', source: 'Portal', applied_date: '', remarks: '' });

  // Interviews
  const [interviews, setInterviews] = useState([]);
  const [intForm, setIntForm] = useState({ open: false });
  const [intData, setIntData] = useState({ candidate_id: '', requisition_id: '', round: 1, interview_date: '', interviewer: '', mode: 'In-person', feedback: '', rating: '' });

  // Offers
  const [offers, setOffers] = useState([]);
  const [offForm, setOffForm] = useState({ open: false });
  const [offData, setOffData] = useState({ candidate_id: '', position_title: '', department: '', ctc: '', joining_date: '', remarks: '' });

  const fetchDashboard = useCallback(async () => {
    try { const { data } = await axios.get(`${API}/dashboard`); setDashboard(data); } catch (e) { console.error(e); }
  }, []);

  const fetchRequisitions = useCallback(async () => {
    try { const { data } = await axios.get(`${API}/requisitions`); setRequisitions(data); } catch (e) { console.error(e); }
  }, []);

  const fetchCandidates = useCallback(async () => {
    try { const { data } = await axios.get(`${API}/candidates`); setCandidates(data); } catch (e) { console.error(e); }
  }, []);

  const fetchInterviews = useCallback(async (candidateId) => {
    try { const params = candidateId ? { candidate_id: candidateId } : {}; const { data } = await axios.get(`${API}/interviews`, { params }); setInterviews(data); } catch (e) { console.error(e); }
  }, []);

  const fetchOffers = useCallback(async () => {
    try { const { data } = await axios.get(`${API}/offers`); setOffers(data); } catch (e) { console.error(e); }
  }, []);

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchDashboard(), fetchRequisitions(), fetchCandidates(), fetchInterviews(), fetchOffers()])
      .finally(() => setLoading(false));
  }, [fetchDashboard, fetchRequisitions, fetchCandidates, fetchInterviews, fetchOffers]);

  // ---- Requisition ----
  const openReqForm = (edit = null) => {
    setReqData(edit || { position_title: '', department: '', no_of_positions: 1, qualification: '', experience_years: '', location: '', salary_range: '', description: '', requested_by: '' });
    setReqForm({ open: true, edit });
  };

  const saveRequisition = async () => {
    try {
      if (reqForm.edit) await axios.post(`${API}/requisitions`, { ...reqData, id: reqForm.edit.id });
      else await axios.post(`${API}/requisitions`, reqData);
      setReqForm({ open: false, edit: null });
      fetchRequisitions();
    } catch (e) { console.error(e); }
  };

  const approveRequisition = async (id, status, approved_by = 'System') => {
    await axios.post(`${API}/requisitions/approve`, { id, status, approved_by });
    fetchRequisitions();
  };

  // ---- Candidate ----
  const openCanForm = (edit = null) => {
    setCanData(edit || { requisition_id: '', name: '', email: '', phone: '', current_company: '', experience_years: '', qualification: '', source: 'Portal', applied_date: new Date().toISOString().slice(0, 10), remarks: '' });
    setCanForm({ open: true, edit });
  };

  const saveCandidate = async () => {
    try {
      if (canForm.edit) await axios.post(`${API}/candidates`, { ...canData, id: canForm.edit.id });
      else await axios.post(`${API}/candidates`, canData);
      setCanForm({ open: false, edit: null });
      fetchCandidates();
    } catch (e) { console.error(e); }
  };

  const updateCandidateStatus = async (id, status) => {
    await axios.post(`${API}/candidates/status`, { id, status });
    fetchCandidates();
  };

  // ---- Interview ----
  const openIntForm = (candidate) => {
    setIntData({ candidate_id: candidate?.id || '', requisition_id: candidate?.requisition_id || '', round: 1, interview_date: '', interviewer: '', mode: 'In-person', feedback: '', rating: '' });
    setIntForm({ open: true });
  };

  const saveInterview = async () => {
    try {
      await axios.post(`${API}/interviews`, intData);
      setIntForm({ open: false });
      fetchInterviews();
      fetchCandidates();
    } catch (e) { console.error(e); }
  };

  // ---- Offer ----
  const openOffForm = (candidate) => {
    setOffData({ candidate_id: candidate?.id || '', position_title: '', department: '', ctc: '', joining_date: '', remarks: '' });
    setOffForm({ open: true });
  };

  const saveOffer = async () => {
    try {
      await axios.post(`${API}/offers`, offData);
      setOffForm({ open: false });
      fetchOffers();
      fetchCandidates();
    } catch (e) { console.error(e); }
  };

  const updateOfferStatus = async (id, status) => {
    await axios.post(`${API}/offers/status`, { id, status });
    fetchOffers();
    fetchCandidates();
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold', color: 'var(--heading-color)' }}>Recruitment</Typography>
      {loading && <LinearProgress sx={{ mb: 2 }} />}

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label="Dashboard" />
        <Tab label="Requisitions" />
        <Tab label="Candidates" />
        <Tab label="Interviews" />
        <Tab label="Offers" />
      </Tabs>

      {/* ========== TAB 0: DASHBOARD ========== */}
      {tab === 0 && dashboard && (
        <Grid container spacing={2}>
          {[
            { label: 'Open Requisitions', value: dashboard.openReqs, color: '#1976d2' },
            { label: 'Total Candidates', value: dashboard.totalCandidates, color: '#388e3c' },
            { label: 'Pending Interviews', value: dashboard.pendingInterviews, color: '#f57c00' },
            { label: 'Pending Offers', value: dashboard.pendingOffers, color: '#7b1fa2' },
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
              <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>Recent Requisitions</Typography>
              {dashboard.recentRequisitions?.map((r) => (
                <Box key={r.id} display="flex" justifyContent="space-between" alignItems="center" sx={{ py: 0.5, borderBottom: '1px solid #eee' }}>
                  <Typography variant="body2">{r.req_no} — {r.position_title}</Typography>
                  <Chip label={r.status} size="small" color={STATUS_COLORS[r.status] || 'default'} />
                </Box>
              ))}
            </Card>
          </Grid>
        </Grid>
      )}

      {/* ========== TAB 1: REQUISITIONS ========== */}
      {tab === 1 && (
        <Card sx={{ borderRadius: 3, p: 2 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>Job Requisitions</Typography>
            <Button startIcon={<AddIcon />} variant="contained" onClick={() => openReqForm()}>New Requisition</Button>
          </Box>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Req No</TableCell>
                  <TableCell>Position</TableCell>
                  <TableCell>Department</TableCell>
                  <TableCell>Positions</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {requisitions.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>{r.req_no}</TableCell>
                    <TableCell>{r.position_title}</TableCell>
                    <TableCell>{r.department}</TableCell>
                    <TableCell>{r.no_of_positions}</TableCell>
                    <TableCell><Chip label={r.status} size="small" color={STATUS_COLORS[r.status] || 'default'} /></TableCell>
                    <TableCell>
                      <IconButton size="small" onClick={() => openReqForm(r)}><EditIcon fontSize="small" /></IconButton>
                      {r.status === 'Draft' && (
                        <IconButton size="small" color="success" onClick={() => approveRequisition(r.id, 'Open')}>
                          <CheckCircleIcon fontSize="small" />
                        </IconButton>
                      )}
                      {r.status === 'Open' && (
                        <IconButton size="small" color="error" onClick={() => approveRequisition(r.id, 'Closed')}>
                          <CancelIcon fontSize="small" />
                        </IconButton>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {requisitions.length === 0 && (
                  <TableRow><TableCell colSpan={6} align="center">No requisitions found</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}

      {/* ========== TAB 2: CANDIDATES ========== */}
      {tab === 2 && (
        <Card sx={{ borderRadius: 3, p: 2 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>Candidates</Typography>
            <Button startIcon={<AddIcon />} variant="contained" onClick={() => openCanForm()}>Add Candidate</Button>
          </Box>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Company</TableCell>
                  <TableCell>Experience</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {candidates.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>{c.name}</TableCell>
                    <TableCell>{c.email}</TableCell>
                    <TableCell>{c.current_company}</TableCell>
                    <TableCell>{c.experience_years ? `${c.experience_years}y` : '-'}</TableCell>
                    <TableCell><Chip label={c.status} size="small" color={STATUS_COLORS[c.status] || 'default'} /></TableCell>
                    <TableCell>
                      <IconButton size="small" onClick={() => openIntForm(c)} title="Schedule Interview"><AddIcon fontSize="small" /></IconButton>
                      <IconButton size="small" onClick={() => openOffForm(c)} title="Create Offer"><CheckCircleIcon fontSize="small" /></IconButton>
                      {c.status === 'New' && <IconButton size="small" color="info" onClick={() => updateCandidateStatus(c.id, 'Shortlisted')} title="Shortlist"><CheckCircleIcon fontSize="small" /></IconButton>}
                      {c.status === 'Shortlisted' && <IconButton size="small" color="error" onClick={() => updateCandidateStatus(c.id, 'Rejected')} title="Reject"><CancelIcon fontSize="small" /></IconButton>}
                    </TableCell>
                  </TableRow>
                ))}
                {candidates.length === 0 && (
                  <TableRow><TableCell colSpan={6} align="center">No candidates found</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}

      {/* ========== TAB 3: INTERVIEWS ========== */}
      {tab === 3 && (
        <Card sx={{ borderRadius: 3, p: 2 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Interviews</Typography>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Candidate ID</TableCell>
                  <TableCell>Round</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Interviewer</TableCell>
                  <TableCell>Mode</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Rating</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {interviews.map((i) => (
                  <TableRow key={i.id}>
                    <TableCell>{i.candidate_id}</TableCell>
                    <TableCell>Round {i.round}</TableCell>
                    <TableCell>{i.interview_date ? new Date(i.interview_date).toLocaleString() : '-'}</TableCell>
                    <TableCell>{i.interviewer}</TableCell>
                    <TableCell>{i.mode}</TableCell>
                    <TableCell><Chip label={i.status} size="small" color={STATUS_COLORS[i.status] || 'default'} /></TableCell>
                    <TableCell>{i.rating || '-'}</TableCell>
                  </TableRow>
                ))}
                {interviews.length === 0 && (
                  <TableRow><TableCell colSpan={7} align="center">No interviews scheduled</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}

      {/* ========== TAB 4: OFFERS ========== */}
      {tab === 4 && (
        <Card sx={{ borderRadius: 3, p: 2 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Offer Letters</Typography>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Offer No</TableCell>
                  <TableCell>Candidate ID</TableCell>
                  <TableCell>Position</TableCell>
                  <TableCell>CTC</TableCell>
                  <TableCell>Joining Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {offers.map((o) => (
                  <TableRow key={o.id}>
                    <TableCell>{o.offer_no}</TableCell>
                    <TableCell>{o.candidate_id}</TableCell>
                    <TableCell>{o.position_title}</TableCell>
                    <TableCell>{o.ctc ? `₹${Number(o.ctc).toLocaleString()}` : '-'}</TableCell>
                    <TableCell>{o.joining_date || '-'}</TableCell>
                    <TableCell><Chip label={o.status} size="small" color={STATUS_COLORS[o.status] || 'default'} /></TableCell>
                    <TableCell>
                      {o.status === 'Sent' && (
                        <>
                          <IconButton size="small" color="success" onClick={() => updateOfferStatus(o.id, 'Accepted')} title="Accept"><CheckCircleIcon fontSize="small" /></IconButton>
                          <IconButton size="small" color="error" onClick={() => updateOfferStatus(o.id, 'Declined')} title="Decline"><CancelIcon fontSize="small" /></IconButton>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {offers.length === 0 && (
                  <TableRow><TableCell colSpan={7} align="center">No offers generated</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}

      {/* ====== REQUISITION DIALOG ====== */}
      <Dialog open={reqForm.open} onClose={() => setReqForm({ open: false, edit: null })} maxWidth="md" fullWidth>
        <DialogTitle>{reqForm.edit ? 'Edit Requisition' : 'New Requisition'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={6}><TextField label="Position Title" fullWidth size="small" value={reqData.position_title} onChange={(e) => setReqData({ ...reqData, position_title: e.target.value })} /></Grid>
            <Grid item xs={3}><TextField select label="Department" fullWidth size="small" value={reqData.department} onChange={(e) => setReqData({ ...reqData, department: e.target.value })}>{DEPARTMENTS.map((d) => <MenuItem key={d} value={d}>{d}</MenuItem>)}</TextField></Grid>
            <Grid item xs={3}><TextField label="No. of Positions" type="number" fullWidth size="small" value={reqData.no_of_positions} onChange={(e) => setReqData({ ...reqData, no_of_positions: Number(e.target.value) })} /></Grid>
            <Grid item xs={4}><TextField label="Qualification" fullWidth size="small" value={reqData.qualification} onChange={(e) => setReqData({ ...reqData, qualification: e.target.value })} /></Grid>
            <Grid item xs={2}><TextField label="Experience (yrs)" type="number" fullWidth size="small" value={reqData.experience_years} onChange={(e) => setReqData({ ...reqData, experience_years: Number(e.target.value) })} /></Grid>
            <Grid item xs={3}><TextField label="Location" fullWidth size="small" value={reqData.location} onChange={(e) => setReqData({ ...reqData, location: e.target.value })} /></Grid>
            <Grid item xs={3}><TextField label="Salary Range" fullWidth size="small" value={reqData.salary_range} onChange={(e) => setReqData({ ...reqData, salary_range: e.target.value })} /></Grid>
            <Grid item xs={6}><TextField label="Requested By" fullWidth size="small" value={reqData.requested_by} onChange={(e) => setReqData({ ...reqData, requested_by: e.target.value })} /></Grid>
            <Grid item xs={12}><TextField label="Description" fullWidth size="small" multiline rows={3} value={reqData.description} onChange={(e) => setReqData({ ...reqData, description: e.target.value })} /></Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReqForm({ open: false, edit: null })}>Cancel</Button>
          <Button variant="contained" onClick={saveRequisition}>Save</Button>
        </DialogActions>
      </Dialog>

      {/* ====== CANDIDATE DIALOG ====== */}
      <Dialog open={canForm.open} onClose={() => setCanForm({ open: false, edit: null })} maxWidth="sm" fullWidth>
        <DialogTitle>{canForm.edit ? 'Edit Candidate' : 'Add Candidate'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={6}><TextField select label="Requisition" fullWidth size="small" value={canData.requisition_id} onChange={(e) => setCanData({ ...canData, requisition_id: e.target.value })}>{requisitions.filter((r) => r.status === 'Open').map((r) => <MenuItem key={r.id} value={r.id}>{r.req_no} — {r.position_title}</MenuItem>)}</TextField></Grid>
            <Grid item xs={6}><TextField select label="Source" fullWidth size="small" value={canData.source} onChange={(e) => setCanData({ ...canData, source: e.target.value })}>{['Portal', 'Reference', 'Walk-in', 'Consultant', 'Other'].map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}</TextField></Grid>
            <Grid item xs={6}><TextField label="Name" fullWidth size="small" value={canData.name} onChange={(e) => setCanData({ ...canData, name: e.target.value })} /></Grid>
            <Grid item xs={6}><TextField label="Email" fullWidth size="small" value={canData.email} onChange={(e) => setCanData({ ...canData, email: e.target.value })} /></Grid>
            <Grid item xs={4}><TextField label="Phone" fullWidth size="small" value={canData.phone} onChange={(e) => setCanData({ ...canData, phone: e.target.value })} /></Grid>
            <Grid item xs={4}><TextField label="Current Company" fullWidth size="small" value={canData.current_company} onChange={(e) => setCanData({ ...canData, current_company: e.target.value })} /></Grid>
            <Grid item xs={2}><TextField label="Experience" type="number" fullWidth size="small" value={canData.experience_years} onChange={(e) => setCanData({ ...canData, experience_years: e.target.value })} /></Grid>
            <Grid item xs={2}><TextField label="Applied Date" type="date" fullWidth size="small" value={canData.applied_date} onChange={(e) => setCanData({ ...canData, applied_date: e.target.value })} InputLabelProps={{ shrink: true }} /></Grid>
            <Grid item xs={6}><TextField label="Qualification" fullWidth size="small" value={canData.qualification} onChange={(e) => setCanData({ ...canData, qualification: e.target.value })} /></Grid>
            <Grid item xs={12}><TextField label="Remarks" fullWidth size="small" multiline rows={2} value={canData.remarks} onChange={(e) => setCanData({ ...canData, remarks: e.target.value })} /></Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCanForm({ open: false, edit: null })}>Cancel</Button>
          <Button variant="contained" onClick={saveCandidate}>Save</Button>
        </DialogActions>
      </Dialog>

      {/* ====== INTERVIEW DIALOG ====== */}
      <Dialog open={intForm.open} onClose={() => setIntForm({ open: false })} maxWidth="sm" fullWidth>
        <DialogTitle>Schedule Interview</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={6}><TextField label="Candidate ID" type="number" fullWidth size="small" value={intData.candidate_id} onChange={(e) => setIntData({ ...intData, candidate_id: Number(e.target.value) })} /></Grid>
            <Grid item xs={3}><TextField label="Round" type="number" fullWidth size="small" value={intData.round} onChange={(e) => setIntData({ ...intData, round: Number(e.target.value) })} /></Grid>
            <Grid item xs={3}><TextField select label="Mode" fullWidth size="small" value={intData.mode} onChange={(e) => setIntData({ ...intData, mode: e.target.value })}>{['In-person', 'Video', 'Telephonic'].map((m) => <MenuItem key={m} value={m}>{m}</MenuItem>)}</TextField></Grid>
            <Grid item xs={6}><TextField label="Interviewer" fullWidth size="small" value={intData.interviewer} onChange={(e) => setIntData({ ...intData, interviewer: e.target.value })} /></Grid>
            <Grid item xs={6}><TextField label="Date & Time" type="datetime-local" fullWidth size="small" value={intData.interview_date} onChange={(e) => setIntData({ ...intData, interview_date: e.target.value })} InputLabelProps={{ shrink: true }} /></Grid>
            <Grid item xs={12}><TextField label="Feedback" fullWidth size="small" multiline rows={2} value={intData.feedback} onChange={(e) => setIntData({ ...intData, feedback: e.target.value })} /></Grid>
            <Grid item xs={3}><TextField label="Rating (1-5)" type="number" fullWidth size="small" value={intData.rating} onChange={(e) => setIntData({ ...intData, rating: Number(e.target.value) })} inputProps={{ min: 1, max: 5 }} /></Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIntForm({ open: false })}>Cancel</Button>
          <Button variant="contained" onClick={saveInterview}>Save</Button>
        </DialogActions>
      </Dialog>

      {/* ====== OFFER DIALOG ====== */}
      <Dialog open={offForm.open} onClose={() => setOffForm({ open: false })} maxWidth="sm" fullWidth>
        <DialogTitle>Create Offer Letter</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={6}><TextField label="Candidate ID" type="number" fullWidth size="small" value={offData.candidate_id} onChange={(e) => setOffData({ ...offData, candidate_id: Number(e.target.value) })} /></Grid>
            <Grid item xs={6}><TextField label="Department" fullWidth size="small" value={offData.department} onChange={(e) => setOffData({ ...offData, department: e.target.value })} /></Grid>
            <Grid item xs={6}><TextField label="Position Title" fullWidth size="small" value={offData.position_title} onChange={(e) => setOffData({ ...offData, position_title: e.target.value })} /></Grid>
            <Grid item xs={6}><TextField label="CTC (Annual)" type="number" fullWidth size="small" value={offData.ctc} onChange={(e) => setOffData({ ...offData, ctc: Number(e.target.value) })} /></Grid>
            <Grid item xs={6}><TextField label="Joining Date" type="date" fullWidth size="small" value={offData.joining_date} onChange={(e) => setOffData({ ...offData, joining_date: e.target.value })} InputLabelProps={{ shrink: true }} /></Grid>
            <Grid item xs={12}><TextField label="Remarks" fullWidth size="small" multiline rows={2} value={offData.remarks} onChange={(e) => setOffData({ ...offData, remarks: e.target.value })} /></Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOffForm({ open: false })}>Cancel</Button>
          <Button variant="contained" onClick={saveOffer}>Save & Send</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
