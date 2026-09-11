import React, { useState, useEffect } from 'react';
import {
  Box, Card, CardContent, Typography, Grid, TextField, Button, Paper,
  MenuItem, Divider, Checkbox, FormControlLabel, CircularProgress, Avatar
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import PersonIcon from '@mui/icons-material/Person';
import HomeIcon from '@mui/icons-material/Home';
import PhoneIcon from '@mui/icons-material/Phone';
import SendIcon from '@mui/icons-material/Send';
import axios from 'axios';
import { useToast } from '../../context/ToastContext';

const API = import.meta.env.VITE_API_URL || '';

const states = ['Uttar Pradesh', 'Maharashtra', 'Bihar', 'Telangana', 'Andhra Pradesh', 'Karnataka', 'Tamil Nadu', 'Other'];

export default function ProfileUpdate() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState(null);
  const [userPhoto, setUserPhoto] = useState(null);
  const [sameAsComm, setSameAsComm] = useState(false);
  const [pendingRequest, setPendingRequest] = useState(false);

  const [authInfo, setAuthInfo] = useState(null);
  const [commAddress, setCommAddress] = useState({
    street: '', city: '', state: '', phone: '', mobile: '', pin: '', email: ''
  });
  const [permAddress, setPermAddress] = useState({
    street: '', city: '', state: '', phone: '', mobile: '', pin: '', email: ''
  });
  const formatLastLogin = (d) => {
    if (!d) return 'Never';
    const dt = new Date(d);
    if (isNaN(dt.getTime())) return String(d);
    const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const day = String(dt.getDate()).padStart(2,'0');
    const mon = MONTHS[dt.getMonth()];
    const yr = dt.getFullYear();
    let h = dt.getHours();
    const m = String(dt.getMinutes()).padStart(2,'0');
    const ampm = h >= 12 ? 'pm' : 'am';
    h = h % 12 || 12;
    const hh = String(h).padStart(2,'0');
    return `${day} ${mon} ${yr}, ${hh}:${m} ${ampm}`;
  };

  useEffect(() => {
    axios.get(`${API}/api/auth/me`, { withCredentials: true }).then(r=>setAuthInfo(r.data?.user)).catch(()=>{});
    const fetchProfile = async () => {
      try {
        const empId = localStorage.getItem('empId');
        const [profileRes, photoRes, requestsRes] = await Promise.all([
          axios.get(`${API}/api/employees/me/profile`, { withCredentials: true }).catch(()=>({data:null})),
          empId ? axios.get(`${API}/api/employees/${empId}/photo`, { withCredentials: true }).catch(() => ({ data: {} })) : Promise.resolve({ data: {} }),
          axios.get(`${API}/api/employees/my-profile-requests`, { withCredentials: true }).catch(() => ({ data: [] }))
        ]);
        if (!profileRes.data || profileRes.data?.message) { setLoading(false); return; }

        const data = profileRes.data;
        setProfile(data);

        if (photoRes.data?.photo) {
          setUserPhoto(`data:${photoRes.data.mimeType || 'image/jpeg'};base64,${photoRes.data.photo}`);
        }

        const myRequests = requestsRes.data || [];
        const hasPending = myRequests.some(r => r.status === 'Pending');
        setPendingRequest(hasPending);

        setCommAddress({
          street: data.cadd_sa || '',
          city: data.cadd_city || '',
          state: data.cadd_state || '',
          phone: data.cadd_phone || '',
          mobile: data.cadd_mobile || '',
          pin: data.cadd_pin || '',
          email: data.cadd_email || '',
        });
        setPermAddress({
          street: data.padd_sa || '',
          city: data.padd_city || '',
          state: data.padd_state || '',
          phone: data.padd_phone || '',
          mobile: data.padd_mobile || '',
          pin: data.padd_pin || '',
          email: data.padd_email || '',
        });

        if (data.cadd_sa && data.cadd_sa === data.padd_sa) {
          setSameAsComm(true);
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        showToast('Failed to load profile data', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleCommChange = (e) => {
    const { name, value } = e.target;
    setCommAddress(prev => ({ ...prev, [name]: value }));
    if (sameAsComm) {
      setPermAddress(prev => ({ ...prev, [name]: value }));
    }
  };

  const handlePermChange = (e) => {
    if (!sameAsComm) {
      const { name, value } = e.target;
      setPermAddress(prev => ({ ...prev, [name]: value }));
    }
  };

  const toggleSame = (e) => {
    setSameAsComm(e.target.checked);
    if (e.target.checked) {
      setPermAddress({ ...commAddress });
    }
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      await axios.post(`${API}/api/employees/profile-request`, {
        request_type: 'both',
        commAddress,
        permAddress: sameAsComm ? commAddress : permAddress,
      }, { withCredentials: true });
      setPendingRequest(true);
      showToast('Profile update request submitted to HR for approval!', 'success');
    } catch (err) {
      console.error('Error submitting request:', err);
      showToast('Failed to submit request', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (profile === null && !loading) {
    return (
      <Box sx={{ m: 2 }}>
        <Card>
          <Box sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', p: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <PersonIcon />
            <Typography variant="h6">My Profile — {authInfo?.ename || localStorage.getItem('empName') || 'System User'}</Typography>
          </Box>
          <CardContent>
            <Paper sx={{ p: 2, mb: 2, bgcolor: '#f8fafc', border: '1px solid #e2e8f0' }}>
              <Typography variant="subtitle2" fontWeight="bold">System User (non-employee {authInfo?.role || localStorage.getItem('userRole') || ''})</Typography>
              <Typography variant="body2" color="text.secondary">Username: {authInfo?.username || localStorage.getItem('userName')}</Typography>
              {authInfo?.last_login && <Typography variant="body2" color="text.secondary">Last login: {formatLastLogin(authInfo.last_login)}</Typography>}
              {authInfo?.previous_login && <Typography variant="body2" color="text.secondary">Previous login: {formatLastLogin(authInfo.previous_login)}</Typography>}
              {authInfo?.login_count != null && <Typography variant="body2" color="text.secondary">Total logins: {authInfo.login_count}</Typography>}
            </Paper>
            <Typography variant="body2" color="text.secondary">This account is not linked to an employee record, so payroll/profile details are not applicable. Manage permissions via User Access Control.</Typography>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box sx={{ m: 2 }}>
      <Card>
        <Box sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', p: 2, display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><PersonIcon /><Typography variant="h6">My Profile</Typography></Box>
          {authInfo && <Typography variant="caption" sx={{ opacity: 0.9 }}>Last login: {formatLastLogin(authInfo.previous_login || authInfo.last_login)} {authInfo.login_count ? `• #${authInfo.login_count}` : ''}</Typography>}
        </Box>
        <CardContent>
          <Paper sx={{ p: 2, mb: 3, bgcolor: '#f5f5f5' }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={2}>
                {userPhoto ? (
                  <Avatar src={userPhoto} sx={{ width: 80, height: 80 }} />
                ) : (
                  <Avatar sx={{ width: 80, height: 80, bgcolor: 'primary.main' }}>
                    <PersonIcon sx={{ fontSize: 40 }} />
                  </Avatar>
                )}
              </Grid>
              <Grid item xs={12} sm={10}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Personal Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={3}>
                    <TextField label="Employee ID" value={profile?.empid || ''} fullWidth size="small" disabled />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <TextField label="Name" value={profile?.ename || ''} fullWidth size="small" disabled />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <TextField label="Father/Husband Name" value={profile?.fname || ''} fullWidth size="small" disabled />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <TextField label="Department" value={profile?.deptname || ''} fullWidth size="small" disabled />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              * Contact HR to update personal information (Name, DOB, etc.)
            </Typography>
          </Paper>

          {pendingRequest && (
            <Paper sx={{ p: 2, mb: 2, bgcolor: '#fff3e0', border: '1px solid #ff9800' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="warning.main" fontWeight="bold">
                    PENDING REQUEST: {pendingRequest.status}
                  </Typography>
                  <Typography variant="body2">
                    You have a pending request awaiting HR approval. You cannot submit a new request until it's processed.
                  </Typography>
                </Box>
                <Button
                  variant="outlined"
                  color="warning"
                  size="small"
                  onClick={() => window.location.href = '/dashboard'}
                >
                  View History
                </Button>
              </Box>
            </Paper>
          )}

          <Divider sx={{ my: 2 }} />

          <Typography variant="subtitle1" fontWeight="bold" gutterBottom color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <HomeIcon fontSize="small" /> Address & Contact Details
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Request changes to your address or phone number. Your request will be sent to HR for approval.
          </Typography>

          <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
            <Grid container spacing={3} alignItems="flex-start" justifyContent="center">
              <Grid item xs={12} md={5}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle2" fontWeight="bold" gutterBottom color="primary">
                    Communication Address
                  </Typography>
                  <TextField name="street" label="Street Address" value={commAddress.street}
                    onChange={handleCommChange} fullWidth size="small" margin="dense" />
                  <TextField name="city" label="City" value={commAddress.city}
                    onChange={handleCommChange} fullWidth size="small" margin="dense" />
                  <TextField select name="state" label="State" value={commAddress.state}
                    onChange={handleCommChange} fullWidth size="small" margin="dense">
                    <MenuItem value="">Select</MenuItem>
                    {states.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                  </TextField>
                  <TextField name="pin" label="PIN Code" value={commAddress.pin}
                    onChange={handleCommChange} fullWidth size="small" margin="dense" />

                  <Divider sx={{ my: 1 }} />
                  <Typography variant="caption" color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                    <PhoneIcon fontSize="small" /> Contact Numbers
                  </Typography>
                  <TextField name="phone" label="Phone" value={commAddress.phone}
                    onChange={handleCommChange} fullWidth size="small" margin="dense" />
                  <TextField name="mobile" label="Mobile" value={commAddress.mobile}
                    onChange={handleCommChange} fullWidth size="small" margin="dense" />
                  <TextField name="email" label="Email" value={commAddress.email}
                    onChange={handleCommChange} fullWidth size="small" margin="dense" />
                </Paper>
              </Grid>

              <Grid item xs={12} md={2} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', pt: { md: 8 } }}>
                <FormControlLabel
                  control={<Checkbox checked={sameAsComm} onChange={toggleSame} />}
                  label="Same as Communication"
                />
              </Grid>

              <Grid item xs={12} md={5}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle2" fontWeight="bold" gutterBottom color="primary">
                    Permanent Address
                  </Typography>
                  <TextField name="street" label="Street Address" value={permAddress.street}
                    onChange={handlePermChange} fullWidth size="small" margin="dense" disabled={sameAsComm} />
                  <TextField name="city" label="City" value={permAddress.city}
                    onChange={handlePermChange} fullWidth size="small" margin="dense" disabled={sameAsComm} />
                  <TextField select name="state" label="State" value={permAddress.state}
                    onChange={handlePermChange} fullWidth size="small" margin="dense" disabled={sameAsComm}>
                    <MenuItem value="">Select</MenuItem>
                    {states.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                  </TextField>
                  <TextField name="pin" label="PIN Code" value={permAddress.pin}
                    onChange={handlePermChange} fullWidth size="small" margin="dense" disabled={sameAsComm} />

                  <Divider sx={{ my: 1 }} />
                  <Typography variant="caption" color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                    <PhoneIcon fontSize="small" /> Contact Numbers
                  </Typography>
                  <TextField name="phone" label="Phone" value={permAddress.phone}
                    onChange={handlePermChange} fullWidth size="small" margin="dense" disabled={sameAsComm} />
                  <TextField name="mobile" label="Mobile" value={permAddress.mobile}
                    onChange={handlePermChange} fullWidth size="small" margin="dense" disabled={sameAsComm} />
                  <TextField name="email" label="Email" value={permAddress.email}
                    onChange={handlePermChange} fullWidth size="small" margin="dense" disabled={sameAsComm} />
                </Paper>
              </Grid>
            </Grid>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3, gap: 2 }}>
            <Button
              variant="contained"
              color="warning"
              startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <SendIcon />}
              onClick={handleSubmit}
              disabled={saving || pendingRequest}
            >
              {saving ? 'Submitting...' : 'Submit Request for Approval'}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}