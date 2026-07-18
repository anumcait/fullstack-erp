import React, { useEffect, useState, useCallback } from 'react';
import { Box, Tabs, Tab, Stack, TextField, Button } from '@mui/material';
import { FiBarChart2, FiShield, FiAlertTriangle, FiFilter, FiX } from 'react-icons/fi';
import axios from 'axios';
import PageHeader from '../Common/PageHeader';
import DataTable from '../Common/DataTable';
import { formatCurrency, formatNumber } from '../../utils/format';

const TABS = [
  { key: 'inspection-summary', label: 'Inspection Summary', icon: <FiShield />, filters: ['from', 'to'] },
  { key: 'rejection-analysis', label: 'Rejection Analysis', icon: <FiBarChart2 />, filters: ['from', 'to'] },
  { key: 'nc-summary', label: 'NC Summary', icon: <FiAlertTriangle />, filters: ['from', 'to'] },
];

const urlFor = (tab) => ({
  'inspection-summary': '/api/erp/quality/reports/inspection-summary',
  'rejection-analysis': '/api/erp/quality/reports/rejection-analysis',
  'nc-summary': '/api/erp/quality/reports/nc-summary',
}[tab]);

const titleFor = {
  'inspection-summary': 'Inspection Summary',
  'rejection-analysis': 'Rejection Analysis',
  'nc-summary': 'Non-Conformance Summary',
};

export default function QualityReports() {
  const [tab, setTab] = useState('inspection-summary');
  const [filters, setFilters] = useState({ from: '', to: '' });
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(() => {
    setLoading(true);
    const params = {};
    if (filters.from) params.from = filters.from;
    if (filters.to) params.to = filters.to;

    axios.get(urlFor(tab), { params })
      .then(({ data }) => {
        if (tab === 'rejection-analysis') {
          setRows(data.by_type || []);
        } else if (tab === 'nc-summary') {
          setRows(data.by_status || []);
        } else {
          setRows(data || []);
        }
      })
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, [tab, filters]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const set = (key, val) => setFilters((f) => ({ ...f, [key]: val }));

  const columns = {
    'inspection-summary': [
      { field: 'status', header: 'Status' },
      { field: 'count', header: 'Count', align: 'right', numeric: true, render: (r) => formatNumber(r.count, 0) },
    ],
    'rejection-analysis': [
      { field: 'inspection_type', header: 'Inspection Type' },
      { field: 'count', header: 'Inspections', align: 'right', numeric: true, render: (r) => formatNumber(r.count, 0) },
      { field: 'total_rejected', header: 'Total Rejected', align: 'right', numeric: true, render: (r) => formatNumber(r.total_rejected, 0) },
    ],
    'nc-summary': [
      { field: 'status', header: 'Status' },
      { field: 'count', header: 'Count', align: 'right', numeric: true, render: (r) => formatNumber(r.count, 0) },
    ],
  }[tab];

  const cur = TABS.find((t) => t.key === tab);

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <PageHeader title="Quality Reports" subtitle="Inspection analysis & non-conformance tracking" icon={<FiBarChart2 size={22} />} />

      <Tabs value={tab} onChange={(e, v) => setTab(v)} variant="scrollable" scrollButtons="auto" sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}>
        {TABS.map((t) => (
          <Tab key={t.key} value={t.key} label={t.label} icon={t.icon} iconPosition="start" />
        ))}
      </Tabs>

      {cur.filters.length > 0 && (
        <Box sx={{ p: 2, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', borderRadius: 2, mb: 2 }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} alignItems="flex-end" flexWrap="wrap">
            <TextField label="From" type="date" size="small" value={filters.from} onChange={(e) => set('from', e.target.value)} InputLabelProps={{ shrink: true }} />
            <TextField label="To" type="date" size="small" value={filters.to} onChange={(e) => set('to', e.target.value)} InputLabelProps={{ shrink: true }} />
            <Button variant="contained" startIcon={<FiFilter />} onClick={fetchData}>Apply</Button>
            <Button variant="text" startIcon={<FiX />} onClick={() => setFilters({ from: '', to: '' })}>Clear</Button>
          </Stack>
        </Box>
      )}

      <Box sx={{ mt: 2 }}>
        <DataTable title={titleFor[tab]} columns={columns} rows={rows} loading={loading} />
      </Box>
    </Box>
  );
}
