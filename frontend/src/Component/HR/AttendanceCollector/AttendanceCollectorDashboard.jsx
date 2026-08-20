import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  Box, Typography, Card, CardContent, Tabs, Tab, Grid, TextField, Button,
  Table, TableHead, TableRow, TableCell, TableBody, TableContainer, Paper,
  MenuItem, IconButton, Chip, Alert, LinearProgress,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import axios from 'axios';

const API = '/api/attendance-collector';
const EMP_API = '/api/employees';

export default function AttendanceCollectorDashboard() {
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [punches, setPunches] = useState([]);
  const [batches, setBatches] = useState([]);
  const [message, setMessage] = useState(null);
  const fileRef = useRef();
  const [filterDate, setFilterDate] = useState(new Date().toISOString().slice(0, 10));

  // Manual entry
  const [manualData, setManualData] = useState({ empid: '', punch_date: new Date().toISOString().slice(0, 10), punch_in: '', punch_out: '' });

  // Process
  const [processDate, setProcessDate] = useState(new Date().toISOString().slice(0, 10));

  useEffect(() => {
    axios.get(EMP_API).then(({ data }) => setEmployees(data)).catch(() => {});
  }, []);

  const fetchPunches = useCallback(async () => {
    try {
      const params = { date: filterDate, limit: 50 };
      const { data } = await axios.get(`${API}/punches`, { params });
      setPunches(data.data || []);
    } catch (e) { console.error(e); }
  }, [filterDate]);

  const fetchBatches = useCallback(async () => {
    try { const { data } = await axios.get(`${API}/batches`); setBatches(data); } catch (e) { console.error(e); }
  }, []);

  useEffect(() => {
    if (tab === 0) { setLoading(true); Promise.all([fetchPunches(), fetchBatches()]).finally(() => setLoading(false)); }
  }, [tab, fetchPunches, fetchBatches]);

  const handleCsvUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    try {
      setLoading(true);
      const { data } = await axios.post(`${API}/import-csv`, formData);
      setMessage({ type: 'success', text: `Imported ${data.imported} records (batch: ${data.batch_id})` });
      fetchPunches();
      fetchBatches();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Import failed' });
    } finally { setLoading(false); }
    e.target.value = '';
  };

  const handleManualEntry = async () => {
    try {
      const { data } = await axios.post(`${API}/manual`, manualData);
      setMessage({ type: 'success', text: `${data.created} punch(es) created` });
      fetchPunches();
    } catch {
      setMessage({ type: 'error', text: 'Failed' });
    }
  };

  const handleProcess = async () => {
    try {
      setLoading(true);
      const { data } = await axios.post(`${API}/process`, { date: processDate });
      setMessage({ type: 'success', text: `Processed ${data.processed} punches for ${data.date}` });
      fetchPunches();
      fetchBatches();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Processing failed' });
    } finally { setLoading(false); }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold', color: 'var(--heading-color)', borderLeft: '4px solid', borderColor: 'primary.main', pl: 1.5 }}>Attendance Data Collector</Typography>
      {loading && <LinearProgress sx={{ mb: 2 }} />}
      {message && <Alert severity={message.type} sx={{ mb: 2 }} onClose={() => setMessage(null)}>{message.text}</Alert>}

      <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" scrollButtons="auto" textColor="primary" indicatorColor="primary" sx={{ mb: 2 }}>
        <Tab label="Import" />
        <Tab label="Manual Entry" />
        <Tab label="Raw Punches" />
        <Tab label="Process" />
      </Tabs>

      {/* TAB 0: IMPORT */}
      {tab === 0 && (
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Card sx={{ borderRadius: 3, p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>CSV Upload</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Upload a CSV file exported from your biometric device. Expected columns: empid, punch_time (or Date+Time), direction (IN/OUT).
              </Typography>
              <input ref={fileRef} type="file" accept=".csv" hidden onChange={handleCsvUpload} />
              <Button variant="contained" startIcon={<CloudUploadIcon />} onClick={() => fileRef.current?.click()}>
                Select CSV File
              </Button>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card sx={{ borderRadius: 3, p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>API Push</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Biometric software can push data to:
              </Typography>
              <Paper variant="outlined" sx={{ p: 1.5, bgcolor: '#f5f5f5' }}>
                <Typography variant="caption" sx={{ fontFamily: 'monospace', display: 'block' }}>
                  POST {API}/push
                </Typography>
                <Typography variant="caption" sx={{ fontFamily: 'monospace', display: 'block' }}>
                  Body: {'{'} "empid", "punch_time", "direction" {'}'}
                </Typography>
                <Typography variant="caption" sx={{ fontFamily: 'monospace', display: 'block', mt: 1 }}>
                  POST {API}/bulk-push
                </Typography>
                <Typography variant="caption" sx={{ fontFamily: 'monospace', display: 'block' }}>
                  Body: {'{'} "punches": [...] {'}'}
                </Typography>
              </Paper>
            </Card>
          </Grid>
          <Grid item xs={12}>
            <Card sx={{ borderRadius: 3, p: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>Import History</Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Batch ID</TableCell>
                      <TableCell>Source</TableCell>
                      <TableCell>Filename</TableCell>
                      <TableCell>Total</TableCell>
                      <TableCell>Processed</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Date</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {batches.map((b) => (
                      <TableRow key={b.id}>
                        <TableCell>{b.batch_id}</TableCell>
                        <TableCell>{b.source}</TableCell>
                        <TableCell>{b.filename || '-'}</TableCell>
                        <TableCell>{b.total_records}</TableCell>
                        <TableCell>{b.processed_records}</TableCell>
                        <TableCell><Chip label={b.status} size="small" color={b.status === 'Processed' ? 'success' : 'default'} /></TableCell>
                        <TableCell>{b.created_at ? new Date(b.created_at).toLocaleString() : '-'}</TableCell>
                      </TableRow>
                    ))}
                    {batches.length === 0 && <TableRow><TableCell colSpan={7} align="center">No imports yet</TableCell></TableRow>}
                  </TableBody>
                </Table>
              </TableContainer>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* TAB 1: MANUAL ENTRY */}
      {tab === 1 && (
        <Card sx={{ borderRadius: 3, p: 3, maxWidth: 600 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Manual Punch Entry</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField select label="Employee" fullWidth size="small" value={manualData.empid} onChange={(e) => setManualData({ ...manualData, empid: Number(e.target.value) })}>
                {employees.map((e) => <MenuItem key={e.empid} value={e.empid}>{e.ename} ({e.empid})</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={4}>
              <TextField label="Date" type="date" fullWidth size="small" value={manualData.punch_date} onChange={(e) => setManualData({ ...manualData, punch_date: e.target.value })} InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={4}>
              <TextField label="In Time" type="time" fullWidth size="small" value={manualData.punch_in} onChange={(e) => setManualData({ ...manualData, punch_in: e.target.value })} InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={4}>
              <TextField label="Out Time" type="time" fullWidth size="small" value={manualData.punch_out} onChange={(e) => setManualData({ ...manualData, punch_out: e.target.value })} InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12}>
              <Button variant="contained" onClick={handleManualEntry}>Save Punches</Button>
            </Grid>
          </Grid>
        </Card>
      )}

      {/* TAB 2: RAW PUNCHES */}
      {tab === 2 && (
        <Card sx={{ borderRadius: 3, p: 2 }}>
          <Box display="flex" alignItems="center" gap={2} mb={2}>
            <TextField label="Date" type="date" size="small" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} InputLabelProps={{ shrink: true }} />
            <Button variant="outlined" onClick={fetchPunches}>Refresh</Button>
          </Box>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Employee</TableCell>
                  <TableCell>Punch Time</TableCell>
                  <TableCell>Direction</TableCell>
                  <TableCell>Device</TableCell>
                  <TableCell>Mode</TableCell>
                  <TableCell>Source</TableCell>
                  <TableCell>Processed</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {punches.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>{p.id}</TableCell>
                    <TableCell>{p.empid}</TableCell>
                    <TableCell>{new Date(p.punch_time).toLocaleString()}</TableCell>
                    <TableCell><Chip label={p.direction} size="small" color={p.direction === 'IN' ? 'info' : 'warning'} /></TableCell>
                    <TableCell>{p.device_name || p.device_id || '-'}</TableCell>
                    <TableCell>{p.mode}</TableCell>
                    <TableCell>{p.source}</TableCell>
                    <TableCell>{p.processed ? <Chip label="Yes" size="small" color="success" /> : <Chip label="No" size="small" color="default" />}</TableCell>
                  </TableRow>
                ))}
                {punches.length === 0 && <TableRow><TableCell colSpan={8} align="center">No punches found</TableCell></TableRow>}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}

      {/* TAB 3: PROCESS */}
      {tab === 3 && (
        <Card sx={{ borderRadius: 3, p: 3, maxWidth: 500 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Process Raw Punches → Attendance</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Converts raw punch data into attendance records. First IN punch becomes in_time, last OUT becomes out_time.
          </Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={6}>
              <TextField label="Date" type="date" size="small" fullWidth value={processDate} onChange={(e) => setProcessDate(e.target.value)} InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={6}>
              <Button variant="contained" color="success" startIcon={<PlayArrowIcon />} onClick={handleProcess} fullWidth>
                Process Punches
              </Button>
            </Grid>
          </Grid>
        </Card>
      )}
    </Box>
  );
}
