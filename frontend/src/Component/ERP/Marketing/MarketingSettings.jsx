import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, TextField, Button, Switch,
  FormControlLabel, Divider, LinearProgress, Alert, MenuItem
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import SettingsIcon from '@mui/icons-material/Settings';
import DescriptionIcon from '@mui/icons-material/Description';
import axios from 'axios';
import { useToast } from '../../../context/ToastContext';

const API = '/api/erp/marketing/settings';

const PAYMENT_TERMS = ['Immediate', '7 Days', '15 Days', '30 Days', '45 Days', '60 Days', '90 Days'];
const CURRENCIES = ['INR', 'USD', 'EUR', 'GBP', 'AED'];
const GST_RATES = [0, 3, 5, 12, 18, 28];

export default function MarketingSettings() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    lead_prefix: 'LD', quote_prefix: 'QT', order_prefix: 'SO', customer_prefix: 'CUST',
    fin_year_format: 'FY-{YYYY}-{YY}',
    default_payment_terms: '30 Days', default_currency: 'INR', default_gst_rate: 18,
    auto_generate_lead: false, auto_generate_quote: false,
    auto_generate_order: false, auto_generate_customer: false,
  });

  useEffect(() => {
    axios.get(API).then(({ data }) => {
      if (data) setForm({
        lead_prefix: data.lead_prefix || 'LD',
        quote_prefix: data.quote_prefix || 'QT',
        order_prefix: data.order_prefix || 'SO',
        customer_prefix: data.customer_prefix || 'CUST',
        fin_year_format: data.fin_year_format || 'FY-{YYYY}-{YY}',
        default_payment_terms: data.default_payment_terms || '30 Days',
        default_currency: data.default_currency || 'INR',
        default_gst_rate: parseFloat(data.default_gst_rate) || 18,
        auto_generate_lead: data.auto_generate_lead ?? false,
        auto_generate_quote: data.auto_generate_quote ?? false,
        auto_generate_order: data.auto_generate_order ?? false,
        auto_generate_customer: data.auto_generate_customer ?? false,
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
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LinearProgress />;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold', color: 'var(--heading-color)' }}>
        <SettingsIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
        Marketing Settings
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
                    <TextField label="Lead Prefix" size="small" fullWidth value={form.lead_prefix} onChange={handleChange('lead_prefix')} />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField label="Quote Prefix" size="small" fullWidth value={form.quote_prefix} onChange={handleChange('quote_prefix')} />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField label="Order Prefix" size="small" fullWidth value={form.order_prefix} onChange={handleChange('order_prefix')} />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField label="Customer Prefix" size="small" fullWidth value={form.customer_prefix} onChange={handleChange('customer_prefix')} />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField label="Financial Year Format" size="small" fullWidth value={form.fin_year_format} onChange={handleChange('fin_year_format')}
                      helperText='Use {YYYY} and {YY} placeholders. E.g. "FY-{YYYY}-{YY}" → "FY-2026-27"' />
                  </Grid>
                  <Grid item xs={6}>
                    <FormControlLabel control={<Switch checked={form.auto_generate_lead} onChange={handleChange('auto_generate_lead')} />} label="Auto-generate Lead #" />
                  </Grid>
                  <Grid item xs={6}>
                    <FormControlLabel control={<Switch checked={form.auto_generate_quote} onChange={handleChange('auto_generate_quote')} />} label="Auto-generate Quote #" />
                  </Grid>
                  <Grid item xs={6}>
                    <FormControlLabel control={<Switch checked={form.auto_generate_order} onChange={handleChange('auto_generate_order')} />} label="Auto-generate Order #" />
                  </Grid>
                  <Grid item xs={6}>
                    <FormControlLabel control={<Switch checked={form.auto_generate_customer} onChange={handleChange('auto_generate_customer')} />} label="Auto-generate Customer #" />
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
                  <Typography variant="h6" sx={{ fontWeight: 600, color: 'var(--heading-color)' }}>Default Values</Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField label="Payment Terms" select size="small" fullWidth value={form.default_payment_terms} onChange={handleChange('default_payment_terms')}>
                      {PAYMENT_TERMS.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                    </TextField>
                  </Grid>
                  <Grid item xs={6}>
                    <TextField label="Currency" select size="small" fullWidth value={form.default_currency} onChange={handleChange('default_currency')}>
                      {CURRENCIES.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                    </TextField>
                  </Grid>
                  <Grid item xs={6}>
                    <TextField label="Default GST Rate (%)" select size="small" fullWidth value={form.default_gst_rate} onChange={handleChange('default_gst_rate')}>
                      {GST_RATES.map((r) => <MenuItem key={r} value={r}>{r}%</MenuItem>)}
                    </TextField>
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
