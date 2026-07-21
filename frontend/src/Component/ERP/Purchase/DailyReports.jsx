import React, { useEffect, useState, useCallback } from 'react';
import { Box, Stack, TextField, Button, Paper, Typography, Tabs, Tab, Grid, Chip } from '@mui/material';
import { FiCalendar, FiFileText, FiShoppingBag, FiRefreshCw, FiChevronRight } from 'react-icons/fi';
import axios from 'axios';
import PageHeader from '../../Common/PageHeader';
import DataTable from '../../Common/DataTable';
import { formatCurrency, formatDate } from '../../../utils/format';

const today = () => new Date().toISOString().slice(0, 10);

const TABS = [
  { key: 'prs', label: 'Requisitions', icon: FiFileText, color: '#e65100' },
  { key: 'pos', label: 'Purchase Orders', icon: FiShoppingBag, color: '#1565c0' },
];

export default function DailyReports() {
  const [date, setDate] = useState(today());
  const [tab, setTab] = useState('prs');
  const [data, setData] = useState({ summary: {}, prs: [], pos: [] });
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(() => {
    setLoading(true);
    axios.get('/api/erp/purchase/reports/daily', { params: { date } })
      .then(({ data }) => setData(data || { summary: {}, prs: [], pos: [], grns: [] }))
      .catch(() => setData({ summary: {}, prs: [], pos: [], grns: [] }))
      .finally(() => setLoading(false));
  }, [date]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const s = data.summary || {};

  const prCols = [
    { field: 'req_no', header: 'PR No' },
    { field: 'requested_by', header: 'Requested By' },
    { field: 'department', header: 'Dept' },
    { field: 'priority', header: 'Priority' },
    { field: 'status', header: 'Status' },
    { field: 'items', header: 'Items', align: 'right', numeric: true },
  ];
  const poCols = [
    { field: 'po_no', header: 'PO No' },
    { field: 'supplier_name', header: 'Vendor' },
    { field: 'status', header: 'Status' },
    { field: 'payment_terms', header: 'Terms' },
    { field: 'grand_total', header: 'Value', align: 'right', numeric: true, render: (r) => formatCurrency(r.grand_total, r.currency) },
  ];

  const cards = [
    {
      label: 'Requisitions', count: s.pr_count || 0, icon: FiFileText, color: '#e65100',
      bg: 'linear-gradient(135deg, #fff5f5, #fff)',
    },
    {
      label: 'Purchase Orders', count: s.po_count || 0, icon: FiShoppingBag, color: '#1565c0',
      bg: 'linear-gradient(135deg, #f0f7ff, #fff)',
      value: formatCurrency(s.po_value || 0),
    },
  ];

  const activeTab = TABS.find((t) => t.key === tab);

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1400 }}>
      <PageHeader title="Daily Reports" subtitle="Requisitions & Purchase Orders for a selected date" icon={<FiCalendar size={22} />} />

      <Paper sx={{ p: 2.5, mb: 3, borderRadius: 2, border: '1px solid', borderColor: 'divider', bgcolor: '#fafbfc' }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ md: 'flex-end' }}>
          <TextField label="Select Date" type="date" size="small" value={date}
            onChange={(e) => setDate(e.target.value)} InputLabelProps={{ shrink: true }}
            sx={{ minWidth: 220, '& .MuiInputBase-root': { bgcolor: '#fff' } }} />
          <Button variant="contained" onClick={fetchData}
            sx={{ px: 3, height: 36, textTransform: 'none', fontWeight: 600 }}>
            Load Reports
          </Button>
          <Button variant="text" startIcon={<FiRefreshCw />} onClick={fetchData}
            sx={{ textTransform: 'none', color: 'text.secondary' }}>
            Refresh
          </Button>
        </Stack>
      </Paper>

      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <Grid item xs={12} md={6} key={c.label}>
              <Paper
                onClick={() => setTab(c.label === 'Requisitions' ? 'prs' : 'pos')}
                sx={{
                  p: 2.5, display: 'flex', alignItems: 'center', gap: 2.5,
                  borderRadius: 2, cursor: 'pointer', background: c.bg,
                  border: '1px solid', borderColor: tab === (c.label === 'Requisitions' ? 'prs' : 'pos') ? c.color : 'divider',
                  transition: 'all 0.2s',
                  '&:hover': { boxShadow: '0 4px 20px rgba(0,0,0,0.08)', transform: 'translateY(-1px)' },
                }}
              >
                <Box sx={{
                  width: 52, height: 52, borderRadius: '14px', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', background: `${c.color}12`, color: c.color, flexShrink: 0,
                }}>
                  <Icon size={24} />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500, mb: 0.25 }}>{c.label}</Typography>
                  <Stack direction="row" alignItems="baseline" spacing={1.5}>
                    <Typography variant="h3" sx={{ fontWeight: 800, lineHeight: 1, color: '#1e293b', fontSize: '2rem' }}>
                      {c.count}
                    </Typography>
                    {c.value && (
                      <Typography variant="body2" sx={{ color: c.color, fontWeight: 600 }}>{c.value}</Typography>
                    )}
                  </Stack>
                </Box>
                <FiChevronRight size={18} color="#94a3b8" />
              </Paper>
            </Grid>
          );
        })}
      </Grid>

      <Paper sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
        <Box sx={{ borderBottom: '1px solid', borderColor: 'divider', bgcolor: '#fafbfc' }}>
          <Tabs value={tab} onChange={(e, v) => setTab(v)} aria-label="Daily report tabs"
            sx={{
              minHeight: 44, px: 1.5,
              '& .MuiTab-root': { minHeight: 44, textTransform: 'none', fontWeight: 600, fontSize: '0.875rem', px: 2.5 },
              '& .Mui-selected': { color: `${activeTab?.color} !important` },
              '& .MuiTabs-indicator': { bgcolor: activeTab?.color, height: 3 },
            }}>
            {TABS.map((t) => {
              const Icon = t.icon;
              return (
                <Tab key={t.key} value={t.key} label={
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Icon size={16} />
                    <span>{t.label}</span>
                    <Chip size="small" label={t.key === 'prs' ? (s.pr_count || 0) : (s.po_count || 0)}
                      sx={{
                        fontWeight: 700, fontSize: '0.68rem', height: 20,
                        bgcolor: tab === t.key ? `${t.color}15` : '#f1f5f9',
                        color: tab === t.key ? t.color : '#64748b',
                      }} />
                  </Stack>
                } sx={{ color: tab === t.key ? t.color : 'text.secondary' }} />
              );
            })}
          </Tabs>
        </Box>

        <Box sx={{ p: 2 }}>
          {tab === 'prs' && (
            <DataTable title={`Requisitions — ${formatDate(date) || date}`} columns={prCols}
              rows={data.prs || []} loading={loading} emptyMessage="No requisitions on this date" />
          )}
          {tab === 'pos' && (
            <DataTable title={`Purchase Orders — ${formatDate(date) || date}`} columns={poCols}
              rows={data.pos || []} loading={loading} emptyMessage="No purchase orders on this date" />
          )}
        </Box>
      </Paper>
    </Box>
  );
}
