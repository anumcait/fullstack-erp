import React, { useEffect, useState, useCallback } from 'react';
import { Box, Stack, TextField, Button, Grid, Paper, Typography } from '@mui/material';
import { FiCalendar, FiFileText, FiShoppingBag, FiTruck, FiFilter } from 'react-icons/fi';
import axios from 'axios';
import PageHeader from '../../Common/PageHeader';
import DataTable from '../../Common/DataTable';
import { formatCurrency, formatDate, formatNumber } from '../../../utils/format';

const today = () => new Date().toISOString().slice(0, 10);

export default function DailyReports() {
  const [date, setDate] = useState(today());
  const [data, setData] = useState({ summary: {}, prs: [], pos: [], grns: [] });
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
  const grnCols = [
    { field: 'grn_no', header: 'GRN No' },
    { field: 'supplier_name', header: 'Vendor' },
    { field: 'ir_type', header: 'Type' },
    { field: 'qa_status', header: 'QA' },
    { field: 'approval_status', header: 'Approval' },
    { field: 'value', header: 'Value', align: 'right', numeric: true, render: (r) => formatCurrency(r.value) },
  ];

  const cards = [
    { label: 'Requisitions', value: s.pr_count || 0, icon: <FiFileText />, color: '#ed6c02' },
    { label: 'Purchase Orders', value: s.po_count || 0, icon: <FiShoppingBag />, color: '#1976d2', sub: formatCurrency(s.po_value || 0) },
    { label: 'Goods Receipts', value: s.grn_count || 0, icon: <FiTruck />, color: '#2e7d32', sub: formatCurrency(s.grn_value || 0) },
  ];

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <PageHeader title="Daily Reports" subtitle="Procurement activity for a selected date" icon={<FiCalendar size={22} />} />

      <Paper sx={{ p: 2, mb: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} alignItems="flex-end">
          <TextField label="Date" type="date" size="small" value={date} onChange={(e) => setDate(e.target.value)} InputLabelProps={{ shrink: true }} />
          <Button variant="contained" startIcon={<FiFilter />} onClick={fetchData}>View</Button>
        </Stack>
      </Paper>

      <Grid container spacing={2} sx={{ mb: 2 }}>
        {cards.map((c) => (
          <Grid item xs={12} md={4} key={c.label}>
            <Paper sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2, borderLeft: `4px solid ${c.color}`, borderRadius: 2 }}>
              <Box sx={{ color: c.color, fontSize: 28 }}>{c.icon}</Box>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 700, lineHeight: 1 }}>{c.value}</Typography>
                <Typography variant="body2" color="text.secondary">{c.label}</Typography>
                {c.sub && <Typography variant="body2" sx={{ fontWeight: 600, color: c.color }}>{c.sub}</Typography>}
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <DataTable title={`Requisitions on ${date}`} columns={prCols} rows={data.prs || []} loading={loading} />
      <Box sx={{ height: 16 }} />
      <DataTable title={`Purchase Orders on ${date}`} columns={poCols} rows={data.pos || []} loading={loading} />
      <Box sx={{ height: 16 }} />
      <DataTable title={`Goods Receipts on ${date}`} columns={grnCols} rows={data.grns || []} loading={loading} />
    </Box>
  );
}
