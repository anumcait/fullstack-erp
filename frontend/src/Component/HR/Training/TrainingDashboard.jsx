import React, { useEffect, useState, useCallback } from 'react';
import {
  Box, Typography, Card, CardContent, Tabs, Tab, Grid, TextField, Button,
  Table, TableHead, TableRow, TableCell, TableBody, TableContainer, Paper,
  MenuItem, IconButton, Chip, Dialog, DialogTitle, DialogContent, DialogActions,
  LinearProgress, Select,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';

const API = '/api/training';
const EMP_API = '/api/employees';

export default function TrainingDashboard() {
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [dashboard, setDashboard] = useState(null);
  const [employees, setEmployees] = useState([]);

  // Courses
  const [courses, setCourses] = useState([]);
  const [courseForm, setCourseForm] = useState({ open: false, edit: null });
  const [courseData, setCourseData] = useState({ course_name: '', category: '', duration_hours: '', vendor: '', description: '' });

  // Sessions
  const [sessions, setSessions] = useState([]);
  const [sessionForm, setSessionForm] = useState({ open: false });
  const [sessionData, setSessionData] = useState({ course_id: '', trainer: '', mode: 'Classroom', location: '', start_date: '', end_date: '', start_time: '', end_time: '' });
  const [participants, setParticipants] = useState([]);
  const [participantForm, setParticipantForm] = useState({ open: false, session_id: null });

  // Certifications
  const [certs, setCerts] = useState([]);
  const [certForm, setCertForm] = useState({ open: false });
  const [certData, setCertData] = useState({ empid: '', certification_name: '', issued_by: '', issued_date: '', expiry_date: '', credential_url: '' });

  // Skills
  const [skills, setSkills] = useState([]);
  const [skillForm, setSkillForm] = useState({ open: false });
  const [skillData, setSkillData] = useState({ empid: '', skill_name: '', category: '', proficiency: 1, years_experience: '', last_used: '' });

  const [skillEmpId, setSkillEmpId] = useState('');
  const [certEmpId, setCertEmpId] = useState('');

  useEffect(() => {
    axios.get(EMP_API).then(({ data }) => setEmployees(data)).catch(() => {});
  }, []);

  const fetchDashboard = useCallback(async () => {
    try { const { data } = await axios.get(`${API}/dashboard`); setDashboard(data); } catch (e) { console.error(e); }
  }, []);

  const fetchCourses = useCallback(async () => {
    try { const { data } = await axios.get(`${API}/courses`); setCourses(data); } catch (e) { console.error(e); }
  }, []);

  const fetchSessions = useCallback(async () => {
    try { const { data } = await axios.get(`${API}/sessions`); setSessions(data); } catch (e) { console.error(e); }
  }, []);

  const fetchParticipants = useCallback(async (sessionId) => {
    if (!sessionId) return;
    try { const { data } = await axios.get(`${API}/participants`, { params: { session_id: sessionId } }); setParticipants(data); } catch (e) { console.error(e); }
  }, []);

  const fetchCertifications = useCallback(async (empid) => {
    if (!empid) return;
    try { const { data } = await axios.get(`${API}/certifications`, { params: { empid } }); setCerts(data); } catch (e) { console.error(e); }
  }, []);

  const fetchSkills = useCallback(async (empid) => {
    if (!empid) return;
    try { const { data } = await axios.get(`${API}/skills`, { params: { empid } }); setSkills(data); } catch (e) { console.error(e); }
  }, []);

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchDashboard(), fetchCourses(), fetchSessions()]).finally(() => setLoading(false));
  }, [fetchDashboard, fetchCourses, fetchSessions]);

  useEffect(() => { fetchCertifications(certEmpId); }, [certEmpId, fetchCertifications]);
  useEffect(() => { fetchSkills(skillEmpId); }, [skillEmpId, fetchSkills]);

  // ---- Course CRUD ----
  const openCourseForm = (edit = null) => {
    setCourseData(edit || { course_name: '', category: '', duration_hours: '', vendor: '', description: '' });
    setCourseForm({ open: true, edit });
  };

  const saveCourse = async () => {
    try {
      const payload = courseForm.edit ? { ...courseData, id: courseForm.edit.id } : courseData;
      await axios.post(`${API}/courses`, payload);
      setCourseForm({ open: false, edit: null });
      fetchCourses();
    } catch (e) { console.error(e); }
  };

  // ---- Session CRUD ----
  const openSessionForm = () => {
    setSessionData({ course_id: courses[0]?.id || '', trainer: '', mode: 'Classroom', location: '', start_date: '', end_date: '', start_time: '', end_time: '' });
    setSessionForm({ open: true });
  };

  const saveSession = async () => {
    try {
      await axios.post(`${API}/sessions`, sessionData);
      setSessionForm({ open: false });
      fetchSessions();
    } catch (e) { console.error(e); }
  };

  const openParticipantForm = (sessionId) => {
    setParticipantForm({ open: true, session_id: sessionId });
    fetchParticipants(sessionId);
  };

  const saveParticipants = async (sessionId, empids) => {
    await axios.post(`${API}/participants`, { session_id: sessionId, empids });
    fetchParticipants(sessionId);
  };

  // ---- Certifications ----
  const openCertForm = () => {
    setCertData({ empid: certEmpId, certification_name: '', issued_by: '', issued_date: '', expiry_date: '', credential_url: '' });
    setCertForm({ open: true });
  };

  const saveCert = async () => {
    try {
      await axios.post(`${API}/certifications`, certForm.edit ? { ...certData, id: certForm.edit.id } : certData);
      setCertForm({ open: false, edit: null });
      fetchCertifications(certEmpId);
    } catch (e) { console.error(e); }
  };

  const deleteCert = async (id) => {
    await axios.delete(`${API}/certifications/${id}`);
    fetchCertifications(certEmpId);
  };

  // ---- Skills ----
  const openSkillForm = (edit = null) => {
    setSkillData(edit || { empid: skillEmpId, skill_name: '', category: '', proficiency: 1, years_experience: '', last_used: '' });
    setSkillForm({ open: true, edit });
  };

  const saveSkill = async () => {
    try {
      const payload = skillForm.edit ? { ...skillData, id: skillForm.edit.id } : skillData;
      await axios.post(`${API}/skills`, payload);
      setSkillForm({ open: false, edit: null });
      fetchSkills(skillEmpId);
    } catch (e) { console.error(e); }
  };

  const deleteSkill = async (id) => {
    await axios.delete(`${API}/skills/${id}`);
    fetchSkills(skillEmpId);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold', color: 'var(--heading-color)' }}>Training & Specialization</Typography>
      {loading && <LinearProgress sx={{ mb: 2 }} />}

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label="Dashboard" />
        <Tab label="Courses" />
        <Tab label="Sessions" />
        <Tab label="Certifications" />
        <Tab label="Skills" />
      </Tabs>

      {/* TAB 0: DASHBOARD */}
      {tab === 0 && dashboard && (
        <Grid container spacing={2}>
          {[
            { label: 'Active Courses', value: dashboard.totalCourses, color: 'var(--primary-main)' },
            { label: 'Upcoming Sessions', value: dashboard.upcomingSessions, color: '#388e3c' },
            { label: 'Total Participants', value: dashboard.totalParticipants, color: '#f57c00' },
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
              <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>Recent Sessions</Typography>
              {dashboard.recentSessions?.map((s) => (
                <Box key={s.id} display="flex" justifyContent="space-between" sx={{ py: 0.5, borderBottom: '1px solid #eee' }}>
                  <Typography variant="body2">{s.session_code} — {s.trainer}</Typography>
                  <Chip label={s.status} size="small" />
                </Box>
              ))}
            </Card>
          </Grid>
        </Grid>
      )}

      {/* TAB 1: COURSES */}
      {tab === 1 && (
        <Card sx={{ borderRadius: 3, p: 2 }}>
          <Box display="flex" justifyContent="space-between" mb={2}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>Training Courses</Typography>
            <Button startIcon={<AddIcon />} variant="contained" onClick={() => openCourseForm()}>Add Course</Button>
          </Box>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Code</TableCell>
                  <TableCell>Course Name</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Duration (hrs)</TableCell>
                  <TableCell>Vendor</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {courses.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>{c.course_code}</TableCell>
                    <TableCell>{c.course_name}</TableCell>
                    <TableCell>{c.category}</TableCell>
                    <TableCell>{c.duration_hours}</TableCell>
                    <TableCell>{c.vendor}</TableCell>
                    <TableCell>
                      <IconButton size="small" onClick={() => openCourseForm(c)}><EditIcon /></IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {courses.length === 0 && <TableRow><TableCell colSpan={6} align="center">No courses</TableCell></TableRow>}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}

      {/* TAB 2: SESSIONS */}
      {tab === 2 && (
        <Card sx={{ borderRadius: 3, p: 2 }}>
          <Box display="flex" justifyContent="space-between" mb={2}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>Training Sessions</Typography>
            <Button startIcon={<AddIcon />} variant="contained" onClick={openSessionForm}>New Session</Button>
          </Box>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Code</TableCell>
                  <TableCell>Course</TableCell>
                  <TableCell>Trainer</TableCell>
                  <TableCell>Mode</TableCell>
                  <TableCell>Start</TableCell>
                  <TableCell>End</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sessions.map((s) => {
                  const course = courses.find((c) => c.id === s.course_id);
                  return (
                    <TableRow key={s.id}>
                      <TableCell>{s.session_code}</TableCell>
                      <TableCell>{course?.course_name || s.course_id}</TableCell>
                      <TableCell>{s.trainer}</TableCell>
                      <TableCell>{s.mode}</TableCell>
                      <TableCell>{s.start_date}</TableCell>
                      <TableCell>{s.end_date}</TableCell>
                      <TableCell><Chip label={s.status} size="small" /></TableCell>
                      <TableCell>
                        <Button size="small" onClick={() => openParticipantForm(s.id)}>Participants</Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {sessions.length === 0 && <TableRow><TableCell colSpan={8} align="center">No sessions</TableCell></TableRow>}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}

      {/* TAB 3: CERTIFICATIONS */}
      {tab === 3 && (
        <Card sx={{ borderRadius: 3, p: 2 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Employee Certifications</Typography>
          <Box display="flex" gap={2} mb={2}>
            <TextField select label="Employee" value={certEmpId} onChange={(e) => setCertEmpId(e.target.value)} sx={{ minWidth: 250 }}>
              {employees.map((e) => <MenuItem key={e.empid} value={e.empid}>{e.ename} ({e.empid})</MenuItem>)}
            </TextField>
            {certEmpId && <Button startIcon={<AddIcon />} variant="contained" onClick={openCertForm}>Add Certification</Button>}
          </Box>
          {certEmpId && (
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Certification</TableCell>
                    <TableCell>Issued By</TableCell>
                    <TableCell>Issued Date</TableCell>
                    <TableCell>Expiry</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {certs.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell>{c.certification_name}</TableCell>
                      <TableCell>{c.issued_by}</TableCell>
                      <TableCell>{c.issued_date}</TableCell>
                      <TableCell>{c.expiry_date || '-'}</TableCell>
                      <TableCell>
                        <IconButton size="small" color="error" onClick={() => deleteCert(c.id)}><DeleteIcon /></IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                  {certs.length === 0 && <TableRow><TableCell colSpan={5} align="center">No certifications</TableCell></TableRow>}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Card>
      )}

      {/* TAB 4: SKILLS */}
      {tab === 4 && (
        <Card sx={{ borderRadius: 3, p: 2 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Skill Matrix</Typography>
          <Box display="flex" gap={2} mb={2}>
            <TextField select label="Employee" value={skillEmpId} onChange={(e) => setSkillEmpId(e.target.value)} sx={{ minWidth: 250 }}>
              {employees.map((e) => <MenuItem key={e.empid} value={e.empid}>{e.ename} ({e.empid})</MenuItem>)}
            </TextField>
            {skillEmpId && <Button startIcon={<AddIcon />} variant="contained" onClick={() => openSkillForm()}>Add Skill</Button>}
          </Box>
          {skillEmpId && (
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Skill</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>Proficiency (1-5)</TableCell>
                    <TableCell>Experience (yrs)</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {skills.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell>{s.skill_name}</TableCell>
                      <TableCell>{s.category}</TableCell>
                      <TableCell>{'⭐'.repeat(s.proficiency)}</TableCell>
                      <TableCell>{s.years_experience || '-'}</TableCell>
                      <TableCell>
                        <IconButton size="small" onClick={() => openSkillForm(s)}><EditIcon /></IconButton>
                        <IconButton size="small" color="error" onClick={() => deleteSkill(s.id)}><DeleteIcon /></IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                  {skills.length === 0 && <TableRow><TableCell colSpan={5} align="center">No skills recorded</TableCell></TableRow>}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Card>
      )}

      {/* ===== COURSE DIALOG ===== */}
      <Dialog open={courseForm.open} onClose={() => setCourseForm({ open: false, edit: null })} maxWidth="sm" fullWidth>
        <DialogTitle>{courseForm.edit ? 'Edit Course' : 'New Course'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={8}><TextField label="Course Name" fullWidth size="small" value={courseData.course_name} onChange={(e) => setCourseData({ ...courseData, course_name: e.target.value })} /></Grid>
            <Grid item xs={4}><TextField label="Category" fullWidth size="small" value={courseData.category} onChange={(e) => setCourseData({ ...courseData, category: e.target.value })} /></Grid>
            <Grid item xs={4}><TextField label="Duration (hours)" type="number" fullWidth size="small" value={courseData.duration_hours} onChange={(e) => setCourseData({ ...courseData, duration_hours: Number(e.target.value) })} /></Grid>
            <Grid item xs={8}><TextField label="Vendor" fullWidth size="small" value={courseData.vendor} onChange={(e) => setCourseData({ ...courseData, vendor: e.target.value })} /></Grid>
            <Grid item xs={12}><TextField label="Description" fullWidth size="small" multiline rows={3} value={courseData.description} onChange={(e) => setCourseData({ ...courseData, description: e.target.value })} /></Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCourseForm({ open: false, edit: null })}>Cancel</Button>
          <Button variant="contained" onClick={saveCourse}>Save</Button>
        </DialogActions>
      </Dialog>

      {/* ===== SESSION DIALOG ===== */}
      <Dialog open={sessionForm.open} onClose={() => setSessionForm({ open: false })} maxWidth="sm" fullWidth>
        <DialogTitle>New Training Session</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={6}>
              <TextField select label="Course" fullWidth size="small" value={sessionData.course_id} onChange={(e) => setSessionData({ ...sessionData, course_id: Number(e.target.value) })}>
                {courses.map((c) => <MenuItem key={c.id} value={c.id}>{c.course_name}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={6}><TextField select label="Mode" fullWidth size="small" value={sessionData.mode} onChange={(e) => setSessionData({ ...sessionData, mode: e.target.value })}>{['Classroom', 'Online', 'Virtual', 'On-the-job'].map((m) => <MenuItem key={m} value={m}>{m}</MenuItem>)}</TextField></Grid>
            <Grid item xs={6}><TextField label="Trainer" fullWidth size="small" value={sessionData.trainer} onChange={(e) => setSessionData({ ...sessionData, trainer: e.target.value })} /></Grid>
            <Grid item xs={6}><TextField label="Location" fullWidth size="small" value={sessionData.location} onChange={(e) => setSessionData({ ...sessionData, location: e.target.value })} /></Grid>
            <Grid item xs={3}><TextField label="Start Date" type="date" fullWidth size="small" value={sessionData.start_date} onChange={(e) => setSessionData({ ...sessionData, start_date: e.target.value })} InputLabelProps={{ shrink: true }} /></Grid>
            <Grid item xs={3}><TextField label="End Date" type="date" fullWidth size="small" value={sessionData.end_date} onChange={(e) => setSessionData({ ...sessionData, end_date: e.target.value })} InputLabelProps={{ shrink: true }} /></Grid>
            <Grid item xs={3}><TextField label="Start Time" type="time" fullWidth size="small" value={sessionData.start_time} onChange={(e) => setSessionData({ ...sessionData, start_time: e.target.value })} InputLabelProps={{ shrink: true }} /></Grid>
            <Grid item xs={3}><TextField label="End Time" type="time" fullWidth size="small" value={sessionData.end_time} onChange={(e) => setSessionData({ ...sessionData, end_time: e.target.value })} InputLabelProps={{ shrink: true }} /></Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSessionForm({ open: false })}>Cancel</Button>
          <Button variant="contained" onClick={saveSession}>Create</Button>
        </DialogActions>
      </Dialog>

      {/* ===== PARTICIPANTS DIALOG ===== */}
      <Dialog open={participantForm.open} onClose={() => setParticipantForm({ open: false })} maxWidth="sm" fullWidth>
        <DialogTitle>Manage Participants</DialogTitle>
        <DialogContent>
          <Box mb={2}>
            <Button
              variant="outlined" size="small"
              onClick={async () => {
                const empids = employees.map((e) => e.empid);
                await saveParticipants(participantForm.session_id, empids);
              }}
            >
              Add All Employees
            </Button>
          </Box>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Employee ID</TableCell>
                  <TableCell>Attendance</TableCell>
                  <TableCell>Score</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {participants.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>{p.empid}</TableCell>
                    <TableCell>
                      <Select size="small" value={p.attendance} onChange={async (e) => {
                        await axios.post(`${API}/participants/attendance`, { id: p.id, attendance: e.target.value });
                        fetchParticipants(participantForm.session_id);
                      }}>
                        {['Pending', 'Present', 'Absent'].map((a) => <MenuItem key={a} value={a}>{a}</MenuItem>)}
                      </Select>
                    </TableCell>
                    <TableCell>
                      <TextField type="number" size="small" sx={{ width: 80 }} value={p.score || ''} onChange={async (e) => {
                        await axios.post(`${API}/participants/attendance`, { id: p.id, score: Number(e.target.value) });
                      }} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setParticipantForm({ open: false })}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* ===== CERTIFICATION DIALOG ===== */}
      <Dialog open={certForm.open} onClose={() => setCertForm({ open: false, edit: null })} maxWidth="sm" fullWidth>
        <DialogTitle>Add Certification</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={8}><TextField label="Certification Name" fullWidth size="small" value={certData.certification_name} onChange={(e) => setCertData({ ...certData, certification_name: e.target.value })} /></Grid>
            <Grid item xs={4}><TextField label="Issued By" fullWidth size="small" value={certData.issued_by} onChange={(e) => setCertData({ ...certData, issued_by: e.target.value })} /></Grid>
            <Grid item xs={4}><TextField label="Issued Date" type="date" fullWidth size="small" value={certData.issued_date} onChange={(e) => setCertData({ ...certData, issued_date: e.target.value })} InputLabelProps={{ shrink: true }} /></Grid>
            <Grid item xs={4}><TextField label="Expiry Date" type="date" fullWidth size="small" value={certData.expiry_date} onChange={(e) => setCertData({ ...certData, expiry_date: e.target.value })} InputLabelProps={{ shrink: true }} /></Grid>
            <Grid item xs={4}><TextField label="Credential URL" fullWidth size="small" value={certData.credential_url} onChange={(e) => setCertData({ ...certData, credential_url: e.target.value })} /></Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCertForm({ open: false, edit: null })}>Cancel</Button>
          <Button variant="contained" onClick={saveCert}>Save</Button>
        </DialogActions>
      </Dialog>

      {/* ===== SKILL DIALOG ===== */}
      <Dialog open={skillForm.open} onClose={() => setSkillForm({ open: false, edit: null })} maxWidth="sm" fullWidth>
        <DialogTitle>{skillForm.edit ? 'Edit Skill' : 'Add Skill'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={6}><TextField label="Skill Name" fullWidth size="small" value={skillData.skill_name} onChange={(e) => setSkillData({ ...skillData, skill_name: e.target.value })} /></Grid>
            <Grid item xs={6}><TextField label="Category" fullWidth size="small" value={skillData.category} onChange={(e) => setSkillData({ ...skillData, category: e.target.value })} /></Grid>
            <Grid item xs={4}><TextField label="Proficiency (1-5)" type="number" fullWidth size="small" value={skillData.proficiency} onChange={(e) => setSkillData({ ...skillData, proficiency: Number(e.target.value) })} inputProps={{ min: 1, max: 5 }} /></Grid>
            <Grid item xs={4}><TextField label="Experience (yrs)" type="number" fullWidth size="small" value={skillData.years_experience} onChange={(e) => setSkillData({ ...skillData, years_experience: e.target.value })} /></Grid>
            <Grid item xs={4}><TextField label="Last Used" type="date" fullWidth size="small" value={skillData.last_used} onChange={(e) => setSkillData({ ...skillData, last_used: e.target.value })} InputLabelProps={{ shrink: true }} /></Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSkillForm({ open: false, edit: null })}>Cancel</Button>
          <Button variant="contained" onClick={saveSkill}>Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
