import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Grid, Card, CardContent, Box, Typography, Stack, Button, LinearProgress, Skeleton,
} from '@mui/material';
import {
  FiShield, FiCheckCircle, FiXCircle, FiAlertTriangle,
  FiPlus, FiTrendingUp, FiActivity, FiFileText,
} from 'react-icons/fi';
import axios from 'axios';
import PageHeader from '../Common/PageHeader';
import DataTable from '../Common/DataTable';
import StatusChip from '../Common/StatusChip';
import { formatDate } from '../../utils/format';

const KPI_CONFIG = [
  { key: 'total_inspections', label: 'Total Inspections', icon: FiShield, color: '#3b82f6', to: '/quality/incoming' },
  { key: 'pass_rate', label: 'Pass Rate', icon: FiCheckCircle, color: '#10b981', to: '/quality/incoming', suffix: '%' },
  { key: 'open_nc', label: 'Open NCs', icon: FiAlertTriangle, color: '#f59e0b', to: '/quality/non-conformances' },
  { key: 'rejected', label: 'Rejected', icon: FiXCircle, color: '#ef4444', to: '/quality/incoming' },
];

const QUICK_LINKS = [
  { label: 'New Inspection', to: '/quality/inspections/add', icon: FiPlus },
  { label: 'Incoming', to: '/quality/incoming', icon: FiActivity },
  { label: 'NC Report', to: '/quality/non-conformances/add', icon: FiAlertTriangle },
  { label: 'Reports', to: '/quality/reports', icon: FiTrendingUp },
];

const KpiRow = ({ config, stats, loading, onClick }) => {
  const Icon = config.icon;
  const value = stats?.[config.key];
  const display = value != null ? (config.suffix ? `${value}${config.suffix}` : value) : '—';
  return (
    <Box onClick={onClick} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 1.5, py: 1, cursor: 'pointer', borderRadius: 1,
      transition: 'all 0.15s', '&:hover': { bgcolor: 'action.hover' } }}>
      <Box sx={{ p: 1, borderRadius: 1.5, bgcolor: `${config.color}18`, color: config.color, display: 'flex' }}>
        <Icon size={18} />
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '.7rem', lineHeight: 1 }}>{config.label}</Typography>
        {loading ? <Skeleton width={60} height={22} /> : (
          <Typography sx={{ fontWeight: 700, fontSize: '.95rem', lineHeight: 1.3 }}>{display}</Typography>
        )}
      </Box>
    </Box>
  );
};

export default function QualityDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      axios.get('/api/erp/quality/dashboard').catch(() => ({ data: null })),
    ]).then(([res]) => {
      if (res.data) {
        setStats(res.data);
        setRecent(res.data.recent_inspections || []);
      }
    }).finally(() => setLoading(false));
  }, []);

  const inspColumns = [
    { field: 'inspection_no', header: 'Inspection #' },
    { field: 'item_name', header: 'Item' },
    { field: 'inspection_type', header: 'Type', render: (r) => <StatusChip status={r.inspection_type} /> },
    { field: 'status', header: 'Status', render: (r) => <StatusChip status={r.status} /> },
    { field: 'inspector', header: 'Inspector' },
    { field: 'inspection_date', header: 'Date', render: (r) => formatDate(r.inspection_date) },
  ];

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <PageHeader title="Quality Dashboard" subtitle="Inspections, NC reports & quality metrics" icon={<FiShield size={22} />}
        actions={QUICK_LINKS.map((l) => (
          <Button key={l.label} variant="contained" size="small" startIcon={<l.icon />} onClick={() => navigate(l.to)}>
            {l.label}
          </Button>
        ))}
      />

      <Grid container spacing={2.5}>
        <Grid item xs={12} md={3}>
          <Card sx={{ borderRadius: 2, boxShadow: '0 1px 6px rgba(0,0,0,0.08)' }}>
            <CardContent sx={{ p: '8px !important' }}>
              <Stack spacing={0.25}>
                {KPI_CONFIG.map((k) => (
                  <KpiRow key={k.key} config={k} stats={stats} loading={loading} onClick={() => navigate(k.to)} />
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={9}>
          <Stack spacing={2.5}>
            <Grid container spacing={2}>
              {[
                { label: 'Passed', value: stats?.passed, color: '#10b981', to: '/quality/incoming' },
                { label: 'Partial', value: stats?.partial, color: '#f59e0b', to: '/quality/incoming' },
                { label: 'Pending', value: stats?.pending, color: '#6b7280', to: '/quality/incoming' },
                { label: 'Total NCs', value: stats?.total_nc, color: '#ef4444', to: '/quality/non-conformances' },
              ].map((h) => (
                <Grid item xs={6} md={3} key={h.label}>
                  <Card sx={{ borderRadius: 2, boxShadow: '0 1px 6px rgba(0,0,0,0.08)', cursor: 'pointer',
                    borderLeft: `3px solid ${h.color}`, '&:hover': { boxShadow: '0 4px 16px rgba(0,0,0,0.12)' } }}
                    onClick={() => navigate(h.to)}>
                    <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '.7rem' }}>{h.label}</Typography>
                      {loading ? <Skeleton width={60} height={28} /> : (
                        <Typography sx={{ fontWeight: 700, fontSize: '1.25rem' }}>{h.value ?? '—'}</Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            <Card sx={{ borderRadius: 2, boxShadow: '0 1px 6px rgba(0,0,0,0.08)' }}>
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1.5, fontSize: '.9rem' }}>Recent Inspections</Typography>
                <DataTable columns={inspColumns} rows={recent} loading={loading} dense emptyMessage="No inspections yet" />
              </CardContent>
            </Card>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
}
