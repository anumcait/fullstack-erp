import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, TextField, Button, Switch,
  FormControlLabel, Divider, LinearProgress, Alert, MenuItem, Tab, Tabs,
  Accordion, AccordionSummary, AccordionDetails
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import SettingsIcon from '@mui/icons-material/Settings';
import axios from 'axios';
import { useToast } from '../../../context/ToastContext';

const API = '/api/erp/stores/settings';

const VALUATION_METHODS = ['WEIGHTED_AVERAGE', 'FIFO', 'LIFO', 'STANDARD'];
const UOM_OPTIONS = [
  { id: null, name: '-- Select UOM --' },
  { id: 1, name: 'NOS' },
  { id: 2, name: 'KG' },
  { id: 3, name: 'MTR' },
];

const DEFAULT_FORM = {
  // Document Prefixes (blank/null = plain sequential numbers)
  mr_prefix: '', mi_prefix: '', grn_prefix: '', pr_prefix: '', po_prefix: '',
  rfq_prefix: '', ir_prefix: '', ge_prefix_in: '', ge_prefix_out: '',
  bill_prefix: '', qc_prefix_iqc: '', qc_prefix_ipc: '', qc_prefix_fqc: '',
  audit_prefix: '', stock_adj_prefix: '', transfer_prefix: '', voucher_prefix: '',

  // Delivery Challan Prefixes
  dc_prefix_sale_approval: 'SA', dc_prefix_labour: 'DCL',
  dc_prefix_repair: 'DCR', dc_prefix_maintenance: 'DCM',
  dc_prefix_jobwork: 'DCJ', dc_prefix_nonreturn: 'DCN',

  // Document Start Numbers (Zoho-style)
  mr_start_no: 1, mi_start_no: 1, grn_start_no: 1, pr_start_no: 1,
  po_start_no: 1, rfq_start_no: 1, ir_start_no: 1, ge_start_no: 1,
  audit_start_no: 1, bill_start_no: 1, adj_start_no: 1, transfer_start_no: 1, voucher_start_no: 1,

  // Auto-Generate
  auto_generate_mr: false, auto_generate_mi: false, auto_generate_grn: false,
  auto_generate_pr: false, auto_generate_po: false, auto_generate_rfq: false,
  auto_generate_dc: false, auto_generate_ir: false, auto_generate_bill: false,
  auto_generate_qc: false, auto_generate_audit: false, auto_generate_adj: false,
  auto_generate_transfer: false, auto_generate_voucher: false,

  // Warehouse & Bins
  default_warehouse: 'Main Store', bin_location_required: true,
  enforce_bin_on_receipt: false, enforce_bin_on_issue: false,
  allow_multi_warehouse: true,

  // Valuation & Costing
  valuation_method: 'WEIGHTED_AVERAGE',
  standard_cost_update_on_grn: false,
  decimal_precision_qty: 3, decimal_precision_cost: 4,

  // Batch / Serial
  batch_tracking_enabled: false,
  enforce_batch_on_receipt: false, enforce_batch_on_issue: false,
  enforce_fefo_on_issue: false, expiry_warning_days: 30,
  serial_tracking_enabled: false, enforce_serial_on_issue: false,

  // Stock Rules
  negative_stock_allowed: false,
  allow_backdated_entries: false, max_backdate_days: 30,
  low_stock_alert: true, reorder_auto_create_pr: false,
  stock_reservation_enabled: false,

  // Approval Workflows
  grn_requires_qa: false, grn_requires_approval: true,
  mi_requires_approval: false, dc_requires_approval: false,
  stock_adj_requires_approval: true, stock_adj_approval_limit: 0,

  // Aging & Analysis
  aging_bucket_days: 30, slow_moving_months: 3, dead_stock_days: 90,

  // Item Defaults
  default_min_stock: 0, default_reorder_level: 0, default_max_stock: 0,
  default_uom_id: null,
};

const PREFIX_FIELDS = [
  { key: 'mr_prefix', label: 'MR Prefix' },
  { key: 'mi_prefix', label: 'MI Prefix' },
  { key: 'grn_prefix', label: 'GRR Prefix' },
  { key: 'pr_prefix', label: 'PR Prefix' },
  { key: 'po_prefix', label: 'PO Prefix' },
  { key: 'rfq_prefix', label: 'RFQ Prefix' },
  { key: 'ir_prefix', label: 'Inward Register Prefix' },
  { key: 'ge_prefix_in', label: 'Gate Entry IN Prefix' },
  { key: 'ge_prefix_out', label: 'Gate Entry OUT Prefix' },
  { key: 'bill_prefix', label: 'Bill / Invoice Prefix' },
  { key: 'voucher_prefix', label: 'Misc / Petty Cash Voucher Prefix' },
  { key: 'qc_prefix_iqc', label: 'QC Incoming Prefix' },
  { key: 'qc_prefix_ipc', label: 'QC In-Process Prefix' },
  { key: 'qc_prefix_fqc', label: 'QC Final Prefix' },
  { key: 'audit_prefix', label: 'Stock Audit Prefix' },
  { key: 'stock_adj_prefix', label: 'Stock Adjustment Prefix' },
  { key: 'transfer_prefix', label: 'Stock Transfer Prefix' },
];

const DC_PREFIX_FIELDS = [
  { key: 'dc_prefix_sale_approval', label: 'Sale on Approval (SA)' },
  { key: 'dc_prefix_labour', label: 'Labour Challan (DC-L)' },
  { key: 'dc_prefix_repair', label: 'Repair Challan (DC-R)' },
  { key: 'dc_prefix_maintenance', label: 'Maintenance Challan (DC-M)' },
  { key: 'dc_prefix_jobwork', label: 'Jobwork Challan (DC-J)' },
  { key: 'dc_prefix_nonreturn', label: 'Non-Returnable (DC-N)' },
];

const AUTO_GEN_FIELDS = [
  { key: 'auto_generate_mr', label: 'Material Requisition #' },
  { key: 'auto_generate_mi', label: 'Material Issue #' },
  { key: 'auto_generate_grn', label: 'GRR #' },
  { key: 'auto_generate_pr', label: 'Purchase Requisition #' },
  { key: 'auto_generate_po', label: 'Purchase Order #' },
  { key: 'auto_generate_rfq', label: 'RFQ #' },
  { key: 'auto_generate_dc', label: 'Delivery Challan #' },
  { key: 'auto_generate_ir', label: 'Inward Register #' },
  { key: 'auto_generate_bill', label: 'Bill #' },
  { key: 'auto_generate_voucher', label: 'Voucher #' },
  { key: 'auto_generate_qc', label: 'QC Inspection #' },
  { key: 'auto_generate_audit', label: 'Stock Audit #' },
  { key: 'auto_generate_adj', label: 'Stock Adjustment #' },
  { key: 'auto_generate_transfer', label: 'Stock Transfer #' },
];

const START_NO_FIELDS = [
  { key: 'mr_start_no', label: 'Material Requisition Start No.' },
  { key: 'mi_start_no', label: 'Material Issue Start No.' },
  { key: 'grn_start_no', label: 'GRR Start No.' },
  { key: 'pr_start_no', label: 'Purchase Requisition Start No.' },
  { key: 'po_start_no', label: 'Purchase Order Start No.' },
  { key: 'rfq_start_no', label: 'RFQ Start No.' },
  { key: 'ir_start_no', label: 'Inward Register Start No.' },
  { key: 'ge_start_no', label: 'Gate Entry Start No.' },
  { key: 'audit_start_no', label: 'Stock Audit Start No.' },
  { key: 'bill_start_no', label: 'Bill Start No.' },
  { key: 'voucher_start_no', label: 'Voucher Start No.' },
  { key: 'adj_start_no', label: 'Stock Adjustment Start No.' },
  { key: 'transfer_start_no', label: 'Stock Transfer Start No.' },
];

export default function StoresSettings() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [warehouses, setWarehouses] = useState(['Main Store']);
  const [tab, setTab] = useState(0);
  const [form, setForm] = useState(DEFAULT_FORM);

  useEffect(() => {
    axios.get(API)
      .then(({ data }) => {
        if (data) setForm({ ...DEFAULT_FORM, ...data });
      })
      .catch(() => showToast('Failed to load settings', 'error'))
      .finally(() => setLoading(false));

    axios.get('/api/erp/stores/warehouses')
      .then(({ data }) => {
        if (Array.isArray(data) && data.length > 0) {
          setWarehouses(data.map((w) => w.warehouse_name));
        }
      })
      .catch(() => { /* keep default warehouses */ });
  }, []);

  const handleChange = (field) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [field]: val }));
  };

  const handleNumber = (field) => (e) => {
    const val = parseFloat(e.target.value);
    setForm((f) => ({ ...f, [field]: isNaN(val) ? 0 : val }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.put(API, form);
      showToast('Settings saved', 'success');
    } catch {
      showToast('Failed to save settings', 'error');
    } finally { setSaving(false); }
  };

  if (loading) return <LinearProgress />;

  const renderPrefixGrid = (fields) => (
    <Grid container spacing={2}>
      {fields.map(({ key, label }) => (
        <Grid item xs={6} md={3} key={key}>
          <TextField label={label} size="small" fullWidth value={form[key] || ''} onChange={handleChange(key)} />
        </Grid>
      ))}
    </Grid>
  );

  const renderSwitchGrid = (fields) => (
    <Grid container spacing={1}>
      {fields.map(({ key, label }) => (
        <Grid item xs={6} md={4} key={key}>
          <FormControlLabel control={<Switch checked={Boolean(form[key])} onChange={handleChange(key)} />} label={label} />
        </Grid>
      ))}
    </Grid>
  );

  const renderNumberGrid = (fields) => (
    <Grid container spacing={2}>
      {fields.map(({ key, label }) => (
        <Grid item xs={6} md={3} key={key}>
          <TextField label={label} type="number" size="small" fullWidth value={form[key] ?? 1} onChange={handleNumber(key)} />
        </Grid>
      ))}
    </Grid>
  );

  const sectionCard = (title, children, subtitle) => (
    <Card sx={{ borderRadius: 3, mb: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
      <CardContent>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>{title}</Typography>
        {subtitle && <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{subtitle}</Typography>}
        {children}
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" sx={{ mb: 1, fontWeight: 'bold', color: 'var(--heading-color)' }}>
        <SettingsIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
        Stores Settings
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Central configuration for all stores / inventory operations. Values here drive numbering,
        validation and behaviour across every stores form.
      </Typography>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" scrollButtons="auto" sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}>
        <Tab label="Document Numbering" />
        <Tab label="Auto-Generate" />
        <Tab label="Warehouse & Bins" />
        <Tab label="Valuation & Costing" />
        <Tab label="Batch & Serial" />
        <Tab label="Stock Rules" />
        <Tab label="Approval Workflows" />
        <Tab label="Aging & Analysis" />
        <Tab label="Item Defaults" />
      </Tabs>

      {tab === 0 && (
        <>
          {sectionCard('Numbering Series (Prefix + Start No.)',
            <>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Set the starting number for each document series (Zoho-style). Leave the prefix
                blank to use plain sequential numbers (e.g. 1001, 1002…).
              </Typography>
              {renderPrefixGrid(PREFIX_FIELDS)}
              <Divider sx={{ my: 2 }} />
              {renderNumberGrid(START_NO_FIELDS)}
            </>,
            'Prefixes used for auto-numbering each stores / inventory document.')}
          {sectionCard('Delivery Challan Prefixes', renderPrefixGrid(DC_PREFIX_FIELDS),
            'Each DC sub-type keeps its own numbering series.')}
        </>
      )}

      {tab === 1 && (
        sectionCard('Auto-Generate Document Numbers',
          renderSwitchGrid(AUTO_GEN_FIELDS),
          'When enabled, the document number is assigned automatically using its prefix + sequence. Otherwise the user must enter it manually.')
      )}

      {tab === 2 && (
        <>
          {sectionCard('Warehouse Defaults', (
            <Grid container spacing={2}>
              <Grid item xs={6} md={3}>
                <TextField label="Default Warehouse" select size="small" fullWidth value={form.default_warehouse || ''} onChange={handleChange('default_warehouse')}>
                  {warehouses.map((w) => <MenuItem key={w} value={w}>{w}</MenuItem>)}
                </TextField>
              </Grid>
            </Grid>
          ))}
          {sectionCard('Bin Location Control',
            renderSwitchGrid([
              { key: 'bin_location_required', label: 'Bin Location Tracking' },
              { key: 'enforce_bin_on_receipt', label: 'Enforce Bin on Receipt' },
              { key: 'enforce_bin_on_issue', label: 'Enforce Bin on Issue' },
              { key: 'allow_multi_warehouse', label: 'Allow Multiple Warehouses' },
            ]))}
        </>
      )}

      {tab === 3 && (
        <>
          {sectionCard('Valuation Method', (
            <Grid container spacing={2}>
              <Grid item xs={6} md={3}>
                <TextField label="Valuation Method" select size="small" fullWidth value={form.valuation_method} onChange={handleChange('valuation_method')}>
                  {VALUATION_METHODS.map((v) => <MenuItem key={v} value={v}>{v}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid item xs={6} md={3}>
                <TextField label="Qty Decimal Precision" type="number" size="small" fullWidth value={form.decimal_precision_qty} onChange={handleNumber('decimal_precision_qty')} />
              </Grid>
              <Grid item xs={6} md={3}>
                <TextField label="Cost Decimal Precision" type="number" size="small" fullWidth value={form.decimal_precision_cost} onChange={handleNumber('decimal_precision_cost')} />
              </Grid>
            </Grid>
          ))}
          {sectionCard('Costing Behaviour',
            renderSwitchGrid([
              { key: 'standard_cost_update_on_grn', label: 'Update Std Cost on GRN' },
            ]))}
        </>
      )}

      {tab === 4 && (
        <>
          {sectionCard('Batch Tracking',
            renderSwitchGrid([
              { key: 'batch_tracking_enabled', label: 'Enable Batch Tracking' },
              { key: 'enforce_batch_on_receipt', label: 'Require Batch on Receipt' },
              { key: 'enforce_batch_on_issue', label: 'Require Batch on Issue' },
              { key: 'enforce_fefo_on_issue', label: 'FEFO on Issue (Expiry first)' },
            ]))}
          {sectionCard('Expiry Management', (
            <Grid container spacing={2}>
              <Grid item xs={6} md={3}>
                <TextField label="Expiry Warning (days)" type="number" size="small" fullWidth value={form.expiry_warning_days} onChange={handleNumber('expiry_warning_days')} />
              </Grid>
            </Grid>
          ))}
          {sectionCard('Serial Number Tracking',
            renderSwitchGrid([
              { key: 'serial_tracking_enabled', label: 'Enable Serial Tracking' },
              { key: 'enforce_serial_on_issue', label: 'Require Serial on Issue' },
            ]))}
        </>
      )}

      {tab === 5 && (
        <>
          {sectionCard('Stock Rules',
            renderSwitchGrid([
              { key: 'negative_stock_allowed', label: 'Allow Negative Stock' },
              { key: 'allow_backdated_entries', label: 'Allow Backdated Entries' },
              { key: 'low_stock_alert', label: 'Low Stock Alert' },
              { key: 'reorder_auto_create_pr', label: 'Auto-create PR on Reorder Level' },
              { key: 'stock_reservation_enabled', label: 'Stock Reservation (MR)' },
            ]))}
          {sectionCard('Backdate Limit', (
            <Grid container spacing={2}>
              <Grid item xs={6} md={3}>
                <TextField label="Max Backdate (days)" type="number" size="small" fullWidth value={form.max_backdate_days} onChange={handleNumber('max_backdate_days')} />
              </Grid>
            </Grid>
          ))}
        </>
      )}

      {tab === 6 && (
        sectionCard('Approval Workflows',
          <Grid container spacing={1}>
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Require an approval step before a document is posted to stock.
              </Typography>
            </Grid>
            {[
              { key: 'grn_requires_qa', label: 'GRN requires QA' },
              { key: 'grn_requires_approval', label: 'GRN requires Approval' },
              { key: 'mi_requires_approval', label: 'Material Issue requires Approval' },
              { key: 'dc_requires_approval', label: 'Delivery Challan requires Approval' },
              { key: 'stock_adj_requires_approval', label: 'Stock Adjustment requires Approval' },
            ].map(({ key, label }) => (
              <Grid item xs={6} md={4} key={key}>
                <FormControlLabel control={<Switch checked={Boolean(form[key])} onChange={handleChange(key)} />} label={label} />
              </Grid>
            ))}
            <Grid item xs={6} md={3} sx={{ mt: 2 }}>
              <TextField label="Adjustment Approval Limit (₹)" type="number" size="small" fullWidth value={form.stock_adj_approval_limit} onChange={handleNumber('stock_adj_approval_limit')} />
            </Grid>
          </Grid>)
      )}

      {tab === 7 && (
        sectionCard('Stock Aging & Analysis Thresholds', (
          <Grid container spacing={2}>
            <Grid item xs={6} md={3}>
              <TextField label="Aging Bucket (days)" type="number" size="small" fullWidth value={form.aging_bucket_days} onChange={handleNumber('aging_bucket_days')} />
            </Grid>
            <Grid item xs={6} md={3}>
              <TextField label="Slow-Moving (months)" type="number" size="small" fullWidth value={form.slow_moving_months} onChange={handleNumber('slow_moving_months')} />
            </Grid>
            <Grid item xs={6} md={3}>
              <TextField label="Dead Stock (days)" type="number" size="small" fullWidth value={form.dead_stock_days} onChange={handleNumber('dead_stock_days')} />
            </Grid>
          </Grid>
        ))
      )}

      {tab === 8 && (
        sectionCard('Defaults for New Items', (
          <Grid container spacing={2}>
            <Grid item xs={6} md={3}>
              <TextField label="Default Min Stock" type="number" size="small" fullWidth value={form.default_min_stock} onChange={handleNumber('default_min_stock')} />
            </Grid>
            <Grid item xs={6} md={3}>
              <TextField label="Default Reorder Level" type="number" size="small" fullWidth value={form.default_reorder_level} onChange={handleNumber('default_reorder_level')} />
            </Grid>
            <Grid item xs={6} md={3}>
              <TextField label="Default Max Stock" type="number" size="small" fullWidth value={form.default_max_stock} onChange={handleNumber('default_max_stock')} />
            </Grid>
            <Grid item xs={6} md={3}>
              <TextField label="Default UOM" select size="small" fullWidth value={form.default_uom_id ?? ''} onChange={handleChange('default_uom_id')}>
                {UOM_OPTIONS.map((u) => <MenuItem key={u.id ?? 'none'} value={u.id ?? ''}>{u.name}</MenuItem>)}
              </TextField>
            </Grid>
          </Grid>
        ))
      )}

      <Box mt={3}>
        <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </Box>
    </Box>
  );
}
