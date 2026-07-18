import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, TextField, Button, Switch,
  FormControlLabel, Divider, LinearProgress, MenuItem
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import SettingsIcon from '@mui/icons-material/Settings';
import DescriptionIcon from '@mui/icons-material/Description';
import axios from 'axios';
import { useToast } from '../../../context/ToastContext';

const API = '/api/erp/engineering/settings';

export default function EngineeringSettings() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    bom_prefix: 'BOM', product_prefix: 'PRD', fin_year_format: 'FY-{YYYY}-{YY}',
    default_version: '1.0', bom_hierarchy_levels: '5',
    default_output_unit: 'Nos', enable_bom_approval: false,
  });

  useEffect(() => {
    axios.get(API).then(({ data }) => {
      if (data) setForm({
        bom_prefix: data.bom_prefix || 'BOM',
        product_prefix: data.product_prefix || 'PRD',
        fin_year_format: data.fin_year_format || 'FY-{YYYY}-{YY}',
        default_version: data.default_version || '1.0',
        bom_hierarchy_levels: data.bom_hierarchy_levels || '5',
        default_output_unit: data.default_output_unit || 'Nos',
        enable_bom_approval: data.enable_bom_approval === 'true',
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
        Engineering Settings
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
                    <TextField label="BOM Prefix" size="small" fullWidth value={form.bom_prefix} onChange={handleChange('bom_prefix')} />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField label="Product Prefix" size="small" fullWidth value={form.product_prefix} onChange={handleChange('product_prefix')} />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField label="Financial Year Format" size="small" fullWidth value={form.fin_year_format} onChange={handleChange('fin_year_format')}
                      helperText='Use {YYYY} and {YY} placeholders' />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField label="Default BOM Version" size="small" fullWidth value={form.default_version} onChange={handleChange('default_version')} />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField label="BOM Hierarchy Levels" type="number" size="small" fullWidth value={form.bom_hierarchy_levels}
                      onChange={handleChange('bom_hierarchy_levels')} />
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
                  <Typography variant="h6" sx={{ fontWeight: 600, color: 'var(--heading-color)' }}>Defaults</Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField label="Default Output Unit" size="small" fullWidth value={form.default_output_unit}
                      onChange={handleChange('default_output_unit')} />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControlLabel control={<Switch checked={form.enable_bom_approval} onChange={handleChange('enable_bom_approval')} />}
                      label="Enable BOM Approval Workflow" />
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
