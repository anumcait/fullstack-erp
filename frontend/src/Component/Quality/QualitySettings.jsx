import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, TextField, Button, Switch,
  FormControlLabel, Divider, LinearProgress, MenuItem
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import SettingsIcon from '@mui/icons-material/Settings';
import DescriptionIcon from '@mui/icons-material/Description';
import axios from 'axios';
import { useToast } from '../../context/ToastContext';

const API = '/api/erp/quality/settings';

export default function QualitySettings() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    inspection_prefix_iqc: 'IQC', inspection_prefix_ipc: 'IPC', inspection_prefix_fqc: 'FQC',
    nc_prefix: 'NC', defect_tolerance_percent: '2',
    sampling_plan: 'AQL 2.5', inspection_parameters: '',
  });

  useEffect(() => {
    axios.get(API).then(({ data }) => {
      if (data) setForm({
        inspection_prefix_iqc: data.inspection_prefix_iqc || 'IQC',
        inspection_prefix_ipc: data.inspection_prefix_ipc || 'IPC',
        inspection_prefix_fqc: data.inspection_prefix_fqc || 'FQC',
        nc_prefix: data.nc_prefix || 'NC',
        defect_tolerance_percent: data.defect_tolerance_percent || '2',
        sampling_plan: data.sampling_plan || 'AQL 2.5',
        inspection_parameters: data.inspection_parameters || '',
      });
    }).catch(() => showToast('Failed to load settings', 'error'))
    .finally(() => setLoading(false));
  }, []);

  const handleChange = (field) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [field]: val }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await axios.put(API, form);
      showToast('Settings saved', 'success');
    } catch {
      showToast('Failed to save settings', 'error');
    } finally { setSaving(false); }
  };

  if (loading) return <LinearProgress />;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold', color: 'var(--heading-color)' }}>
        <SettingsIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
        Quality Settings
      </Typography>

      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.08)', height: '100%' }}>
              <CardContent>
                <Box display="flex" alignItems="center" gap={1} mb={2}>
                  <DescriptionIcon color="primary" />
                  <Typography variant="h6" sx={{ fontWeight: 600, color: 'var(--heading-color)' }}>Document Numbering</Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField label="Incoming Inspection Prefix" size="small" fullWidth value={form.inspection_prefix_iqc}
                      onChange={handleChange('inspection_prefix_iqc')} />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField label="In-Process Inspection Prefix" size="small" fullWidth value={form.inspection_prefix_ipc}
                      onChange={handleChange('inspection_prefix_ipc')} />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField label="Final QC Prefix" size="small" fullWidth value={form.inspection_prefix_fqc}
                      onChange={handleChange('inspection_prefix_fqc')} />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField label="NC Prefix" size="small" fullWidth value={form.nc_prefix}
                      onChange={handleChange('nc_prefix')} />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.08)', height: '100%' }}>
              <CardContent>
                <Box display="flex" alignItems="center" gap={1} mb={2}>
                  <SettingsIcon color="primary" />
                  <Typography variant="h6" sx={{ fontWeight: 600, color: 'var(--heading-color)' }}>Quality Parameters</Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField label="Defect Tolerance (%)" type="number" size="small" fullWidth value={form.defect_tolerance_percent}
                      onChange={handleChange('defect_tolerance_percent')} />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField label="Sampling Plan" select size="small" fullWidth value={form.sampling_plan}
                      onChange={handleChange('sampling_plan')}>
                      <MenuItem value="AQL 1.0">AQL 1.0</MenuItem>
                      <MenuItem value="AQL 2.5">AQL 2.5</MenuItem>
                      <MenuItem value="AQL 4.0">AQL 4.0</MenuItem>
                      <MenuItem value="100% Inspection">100% Inspection</MenuItem>
                    </TextField>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField label="Default Inspection Parameters (comma separated)" multiline rows={3} size="small" fullWidth
                      value={form.inspection_parameters} onChange={handleChange('inspection_parameters')}
                      helperText="E.g. Dimensions, Visual, Hardness, Weight" />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Box display="flex" gap={2}>
              <Button type="submit" variant="contained" startIcon={<SaveIcon />} disabled={saving} size="large">
                {saving ? 'Saving...' : 'Save Settings'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>
    </Box>
  );
}
