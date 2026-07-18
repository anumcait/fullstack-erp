import React, { useEffect, useState, useCallback } from 'react';
import { Box, Tabs, Tab, Stack, TextField, MenuItem, Button, FormControlLabel, Switch } from '@mui/material';
import { FiBarChart2, FiTarget, FiTrendingUp, FiShoppingBag, FiFilter, FiX, FiMail } from 'react-icons/fi';
import axios from 'axios';
import PageHeader from '../../Common/PageHeader';
import DataTable from '../../Common/DataTable';
import { formatCurrency, formatDate, formatNumber } from '../../../utils/format';

const TABS = [
  { key: 'lead-pipeline', label: 'Lead Pipeline', icon: <FiTarget />, filters: ['from', 'to'] },
  { key: 'quote-conversion', label: 'Quote Conversion', icon: <FiMail />, filters: ['from', 'to'] },
  { key: 'order-summary', label: 'Order Summary', icon: <FiShoppingBag />, filters: ['from', 'to', 'status'] },
];

const STATUS_OPTIONS = ['Draft', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

const urlFor = (tab) => ({
  'lead-pipeline': '/api/erp/marketing/reports/lead-pipeline',
  'quote-conversion': '/api/erp/marketing/reports/quote-conversion',
  'order-summary': '/api/erp/marketing/reports/order-summary',
}[tab]);

const titleFor = {
  'lead-pipeline': 'Lead Pipeline Report',
  'quote-conversion': 'Quotation Conversion Report',
  'order-summary': 'Sales Order Summary',
};

export default function MarketingReports() {
  const [tab, setTab] = useState('lead-pipeline');
  const [filters, setFilters] = useState({ from: '', to: '', status: '' });
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(() => {
    setLoading(true);
    const params = {};
    if (filters.from) params.from = filters.from;
    if (filters.to) params.to = filters.to;
    if (filters.status) params.status = filters.status;

    axios.get(urlFor(tab), { params })
      .then(({ data }) => setRows(data || []))
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, [tab, filters]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const set = (key, val) => setFilters((f) => ({ ...f, [key]: val }));

  const columns = {
    'lead-pipeline': [
      { field: 'status', header: 'Status' },
      { field: 'count', header: 'Count', align: 'right', numeric: true, render: (r) => formatNumber(r.count, 0) },
      { field: 'total_value', header: 'Total Value', align: 'right', numeric: true, render: (r) => formatCurrency(r.total_value) },
    ],
    'quote-conversion': [
      { field: 'period', header: 'Period' },
      { field: 'quotes_sent', header: 'Quotes Sent', align: 'right', numeric: true, render: (r) => formatNumber(r.quotes_sent, 0) },
      { field: 'converted', header: 'Converted', align: 'right', numeric: true, render: (r) => formatNumber(r.converted, 0) },
      { field: 'conversion_rate', header: 'Rate (%)', align: 'right', numeric: true, render: (r) => formatNumber(r.conversion_rate, 1) },
    ],
    'order-summary': [
      { field: 'status', header: 'Status' },
      { field: 'count', header: 'Count', align: 'right', numeric: true, render: (r) => formatNumber(r.count, 0) },
      { field: 'total_value', header: 'Total Value', align: 'right', numeric: true, render: (r) => formatCurrency(r.total_value) },
    ],
  }[tab];

  const cur = TABS.find((t) => t.key === tab);
  const has = (f) => cur.filters.includes(f);

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <PageHeader title="Marketing Reports" subtitle="Pipeline analysis, conversion tracking & order summaries" icon={<FiBarChart2 size={22} />} />

      <Tabs value={tab} onChange={(e, v) => setTab(v)} variant="scrollable" scrollButtons="auto" sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}>
        {TABS.map((t) => (
          <Tab key={t.key} value={t.key} label={t.label} icon={t.icon} iconPosition="start" />
        ))}
      </Tabs>

      {cur.filters.length > 0 && (
        <Box sx={{ p: 2, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', borderRadius: 2, mb: 2 }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} alignItems="flex-end" flexWrap="wrap">
            {has('from') && (
              <TextField label="From" type="date" size="small" value={filters.from} onChange={(e) => set('from', e.target.value)} InputLabelProps={{ shrink: true }} />
            )}
            {has('to') && (
              <TextField label="To" type="date" size="small" value={filters.to} onChange={(e) => set('to', e.target.value)} InputLabelProps={{ shrink: true }} />
            )}
            {has('status') && (
              <TextField select label="Status" size="small" sx={{ minWidth: 150 }} value={filters.status} onChange={(e) => set('status', e.target.value)}>
                <MenuItem value="">All Status</MenuItem>
                {STATUS_OPTIONS.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
              </TextField>
            )}
            <Button variant="contained" startIcon={<FiFilter />} onClick={fetchData}>Apply</Button>
            <Button variant="text" startIcon={<FiX />} onClick={() => setFilters({ from: '', to: '', status: '' })}>Clear</Button>
          </Stack>
        </Box>
      )}

      <Box sx={{ mt: 2 }}>
        <DataTable title={titleFor[tab]} columns={columns} rows={rows} loading={loading} />
      </Box>
    </Box>
  );
}
