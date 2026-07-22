import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, TextField, Button, Switch,
  FormControlLabel, Divider, LinearProgress, Alert
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import SettingsIcon from '@mui/icons-material/Settings';
import DescriptionIcon from '@mui/icons-material/Description';
import ApprovalIcon from '@mui/icons-material/Approval';
import axios from 'axios';
import { useToast } from '../../../context/ToastContext';

const API = '/api/erp/purchase/settings';

const PAYMENT_TERMS = ['Immediate', '7 Days', '15 Days', '30 Days', '45 Days', '60 Days', '90 Days'];
const CURRENCIES = ['INR', 'USD', 'EUR', 'GBP', 'AED'];
const GST_RATES = [0, 3, 5, 12, 18, 28];

export default function PurchaseSettings() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    pr_prefix: 'PR', po_prefix: 'PO', rfq_prefix: 'RFQ',
    fin_year_format: 'FY-{YYYY}-{YY}',
    default_payment_terms: '30 Days', default_delivery_terms: 'Ex Works',
    default_currency: 'INR', default_gst_rate: 18,
    req_approval_required: true, po_approval_required: true,
    req_approval_limit: 0, po_approval_limit: 0,
    auto_generate_pr: false, auto_generate_po: false,
    auto_generate_rfq: false,
  });

  useEffect(() => {
    axios.get(API).then(({ data }) => {
      if (data) setForm({
        pr_prefix: data.pr_prefix || 'PR',
        po_prefix: data.po_prefix || 'PO',
        rfq_prefix: data.rfq_prefix || 'RFQ',
        fin_year_format: data.fin_year_format || 'FY-{YYYY}-{YY}',
        default_payment_terms: data.default_payment_terms || '30 Days',
        default_delivery_terms: data.default_delivery_terms || 'Ex Works',
        default_currency: data.default_currency || 'INR',
        default_gst_rate: parseFloat(data.default_gst_rate) || 18,
        req_approval_required: data.req_approval_required ?? true,
        po_approval_required: data.po_approval_required ?? true,
        req_approval_limit: parseFloat(data.req_approval_limit) || 0,
        po_approval_limit: parseFloat(data.po_approval_limit) || 0,
        auto_generate_pr: data.auto_generate_pr ?? false,
        auto_generate_po: data.auto_generate_po ?? false,
        auto_generate_rfq: data.auto_generate_rfq ?? false,
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
        Purchase Settings
      </Typography>

      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          {/* Document Numbering */}
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
                    <TextField label="PR Prefix" size="small" fullWidth value={form.pr_prefix} onChange={handleChange('pr_prefix')} />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField label="PO Prefix" size="small" fullWidth value={form.po_prefix} onChange={handleChange('po_prefix')} />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField label="RFQ Prefix" size="small" fullWidth value={form.rfq_prefix} onChange={handleChange('rfq_prefix')} />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField label="Financial Year Format" size="small" fullWidth value={form.fin_year_format} onChange={handleChange('fin_year_format')}
                      helperText='Use {YYYY} and {YY} placeholders. E.g. "FY-{YYYY}-{YY}" → "FY-2026-27"' />
                  </Grid>
                  <Grid item xs={6}>
                    <FormControlLabel control={<Switch checked={form.auto_generate_pr} onChange={handleChange('auto_generate_pr')} />} label="Auto-generate PR #" />
                  </Grid>
                  <Grid item xs={6}>
                    <FormControlLabel control={<Switch checked={form.auto_generate_po} onChange={handleChange('auto_generate_po')} />} label="Auto-generate PO #" />
                  </Grid>
                  <Grid item xs={6}>
                    <FormControlLabel control={<Switch checked={form.auto_generate_rfq} onChange={handleChange('auto_generate_rfq')} />} label="Auto-generate RFQ #" />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Default Values */}
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
                      {PAYMENT_TERMS.map((t) => <option key={t} value={t}>{t}</option>)}
                    </TextField>
                  </Grid>
                  <Grid item xs={6}>
                    <TextField label="Currency" select size="small" fullWidth value={form.default_currency} onChange={handleChange('default_currency')}>
                      {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </TextField>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField label="Default Delivery Terms" size="small" fullWidth value={form.default_delivery_terms} onChange={handleChange('default_delivery_terms')} />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField label="Default GST Rate (%)" select size="small" fullWidth value={form.default_gst_rate} onChange={handleChange('default_gst_rate')}>
                      {GST_RATES.map((r) => <option key={r} value={r}>{r}%</option>)}
                    </TextField>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Approval Configuration */}
          <Grid item xs={12}>
            <Card sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
              <CardContent>
                <Box display="flex" alignItems="center" gap={1} mb={2}>
                  <ApprovalIcon color="primary" />
                  <Typography variant="h6" sx={{ fontWeight: 600, color: 'var(--heading-color)' }}>Approval Configuration</Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <FormControlLabel control={<Switch checked={form.req_approval_required} onChange={handleChange('req_approval_required')} />}
                      label="Require approval for Purchase Requisitions" />
                    {form.req_approval_required && (
                      <TextField label="Requisition Approval Limit (₹)" type="number" size="small" fullWidth sx={{ mt: 1 }}
                        value={form.req_approval_limit} onChange={handleChange('req_approval_limit')}
                        helperText="0 = no limit (all need approval)" />
                    )}
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControlLabel control={<Switch checked={form.po_approval_required} onChange={handleChange('po_approval_required')} />}
                      label="Require approval for Purchase Orders" />
                    {form.po_approval_required && (
                      <TextField label="PO Approval Limit (₹)" type="number" size="small" fullWidth sx={{ mt: 1 }}
                        value={form.po_approval_limit} onChange={handleChange('po_approval_limit')}
                        helperText="0 = no limit (all need approval)" />
                    )}
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Save */}
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
