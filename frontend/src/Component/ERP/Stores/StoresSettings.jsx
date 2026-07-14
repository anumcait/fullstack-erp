import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, TextField, Button, Switch,
  FormControlLabel, Divider, LinearProgress, Alert, MenuItem
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import axios from 'axios';
import { useToast } from '../../../context/ToastContext';

const API = '/api/erp/stores/settings';

const VALUATION_METHODS = ['FIFO', 'LIFO', 'Weighted Average', 'Standard Cost'];
const WAREHOUSES = ['Main Store', 'Raw Material Store', 'Finished Goods Store', 'Scrap Yard', 'Substore A', 'Substore B'];

export default function StoresSettings() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    mr_prefix: 'MR', mi_prefix: 'MI',
    default_warehouse: 'Main Store', valuation_method: 'FIFO',
    bin_location_required: true, batch_tracking_enabled: false,
    auto_generate_mr: false, auto_generate_mi: false,
    negative_stock_allowed: false, low_stock_alert: true,
  });

  useEffect(() => {
    axios.get(API)
      .then(({ data }) => setForm(data))
      .catch(() => showToast('Failed to load settings', 'error'))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  const handleSwitch = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.checked }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.put(API, form);
      showToast('Settings saved', 'success');
    } catch {
      showToast('Failed to save', 'error');
    } finally { setSaving(false); }
  };

  if (loading) return <LinearProgress />;

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold', color: 'var(--heading-color)' }}>Stores Settings</Typography>

      <Card sx={{ borderRadius: 3, mb: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Document Numbering</Typography>
          <Grid container spacing={2}>
            <Grid item xs={6} md={3}>
              <TextField label="MR Prefix" size="small" fullWidth value={form.mr_prefix} onChange={handleChange('mr_prefix')} />
            </Grid>
            <Grid item xs={6} md={3}>
              <TextField label="MI Prefix" size="small" fullWidth value={form.mi_prefix} onChange={handleChange('mi_prefix')} />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card sx={{ borderRadius: 3, mb: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Default Values</Typography>
          <Grid container spacing={2}>
            <Grid item xs={6} md={3}>
              <TextField label="Default Warehouse" select size="small" fullWidth value={form.default_warehouse} onChange={handleChange('default_warehouse')}>
                {WAREHOUSES.map((w) => <MenuItem key={w} value={w}>{w}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={6} md={3}>
              <TextField label="Valuation Method" select size="small" fullWidth value={form.valuation_method} onChange={handleChange('valuation_method')}>
                {VALUATION_METHODS.map((v) => <MenuItem key={v} value={v}>{v}</MenuItem>)}
              </TextField>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card sx={{ borderRadius: 3, mb: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Configuration</Typography>
          <Grid container spacing={2}>
            <Grid item xs={6} md={3}>
              <FormControlLabel control={<Switch checked={form.bin_location_required} onChange={handleSwitch('bin_location_required')} />} label="Bin Location Required" />
            </Grid>
            <Grid item xs={6} md={3}>
              <FormControlLabel control={<Switch checked={form.batch_tracking_enabled} onChange={handleSwitch('batch_tracking_enabled')} />} label="Batch Tracking" />
            </Grid>
            <Grid item xs={6} md={3}>
              <FormControlLabel control={<Switch checked={form.auto_generate_mr} onChange={handleSwitch('auto_generate_mr')} />} label="Auto-generate MR" />
            </Grid>
            <Grid item xs={6} md={3}>
              <FormControlLabel control={<Switch checked={form.auto_generate_mi} onChange={handleSwitch('auto_generate_mi')} />} label="Auto-generate MI" />
            </Grid>
            <Grid item xs={6} md={3}>
              <FormControlLabel control={<Switch checked={form.negative_stock_allowed} onChange={handleSwitch('negative_stock_allowed')} />} label="Allow Negative Stock" />
            </Grid>
            <Grid item xs={6} md={3}>
              <FormControlLabel control={<Switch checked={form.low_stock_alert} onChange={handleSwitch('low_stock_alert')} />} label="Low Stock Alert" />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Box mt={3}>
        <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </Box>
    </Box>
  );
}
