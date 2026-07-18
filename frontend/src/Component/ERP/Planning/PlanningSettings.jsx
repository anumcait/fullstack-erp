import React, { useEffect, useState } from 'react';
import { Box, Card, CardContent, Typography, TextField, Button, Grid, LinearProgress } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import axios from 'axios';
import { useToast } from '../../../context/ToastContext';

const PlanningSettings = () => {
  const { showToast } = useToast();
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    axios.get('/api/erp/planning/settings')
      .then(({ data }) => setSettings(data.length ? data : [
        { setting_key: 'default_lead_time_days', setting_value: '7', category: 'General' },
        { setting_key: 'mrp_horizon_days', setting_value: '90', category: 'MRP' },
        { setting_key: 'capacity_utilization_target', setting_value: '85', category: 'Capacity' },
        { setting_key: 'schedule_prefix', setting_value: 'SCH', category: 'Naming' },
        { setting_key: 'mrp_prefix', setting_value: 'MRP', category: 'Naming' },
        { setting_key: 'capacity_prefix', setting_value: 'CAP', category: 'Naming' },
      ]))
      .catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleChange = (idx) => (e) => {
    const updated = [...settings];
    updated[idx] = { ...updated[idx], setting_value: e.target.value };
    setSettings(updated);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.put('/api/erp/planning/settings', { settings });
      showToast('Settings saved', 'success');
    } catch { showToast('Failed to save', 'error'); }
    finally { setSaving(false); }
  };

  if (loading) return <LinearProgress />;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold', color: 'var(--heading-color)' }}>Planning Settings</Typography>
      <Card sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>Configuration</Typography>
            <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save All'}</Button>
          </Box>
          <Grid container spacing={2}>
            {settings.map((s, idx) => (
              <Grid item xs={12} sm={6} md={4} key={idx}>
                <TextField size="small" fullWidth label={s.setting_key} value={s.setting_value} onChange={handleChange(idx)} />
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default PlanningSettings;
