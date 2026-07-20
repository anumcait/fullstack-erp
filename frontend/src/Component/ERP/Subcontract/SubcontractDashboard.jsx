import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card, CardContent, Box, Typography, Stack, Button, Divider,
  LinearProgress, Tabs, Tab, Chip, Skeleton, Tooltip, IconButton,
} from '@mui/material';
import {
  FiBriefcase, FiCalendar, FiShare, FiRotateCcw, FiFileText,
  FiPlus, FiSettings, FiArrowRight, FiRefreshCw, FiChevronRight,
} from 'react-icons/fi';
import axios from 'axios';
import PageHeader from '../../Common/PageHeader';
import DataTable from '../../Common/DataTable';
import StatusChip from '../../Common/StatusChip';
import { formatCompactCurrency, formatDate } from '../../../utils/format';

const QUICK_LINKS = [
  { label: 'New Job Work Order', to: '/subcontract/orders/add', icon: FiPlus },
  { label: 'Material Issue', to: '/subcontract/issue/add', icon: FiShare },
  { label: 'Material Receipt', to: '/subcontract/receipt/add', icon: FiRotateCcw },
  { label: 'Reports', to: '/subcontract/reports', icon: FiArrowRight },
  { label: 'Settings', to: '/subcontract/settings', icon: FiSettings },
];

const KPI_CONFIG = [
  { key: 'activeOrders', label: 'Active Orders', icon: FiBriefcase, color: '#ed6c02', to: '/subcontract/orders' },
  { key: 'totalOrders', label: 'Total Orders', icon: FiFileText, color: '#1976d2', to: '/subcontract/orders' },
  { key: 'thisMonthOrders', label: 'This Month', icon: FiCalendar, color: '#0ea5e9', to: '/subcontract/orders' },
  { key: 'pendingIssues', label: 'Pending Issues', icon: FiShare, color: '#d32f2f', to: '/subcontract/issue', alert: true },
  { key: 'pendingReceipts', label: 'Pending Receipts', icon: FiRotateCcw, color: '#2e7d32', to: '/subcontract/receipt', alert: true },
  { key: 'totalIssues', label: 'Total Issues', icon: FiShare, color: '#a855f7', to: '/subcontract/issue' },
  { key: 'totalReceipts', label: 'Total Receipts', icon: FiRotateCcw, color: '#0891b2', to: '/subcontract/receipt' },
];

/* ─── KPI List Row (sidebar) ─────────────────────────────────── */
const KpiRow = ({ config, stats, loading, onClick }) => {
  const Icon = config.icon;
  const raw = stats?.[config.key];
  const isAlert = config.alert && Number(raw) > 0;

  return (
    <Box
      onClick={onClick}
      sx={{
        display: 'flex', alignItems: 'center', gap: 1.5,
        px: 1.5, py: 1, cursor: 'pointer', borderRadius: 1,
        transition: 'background 0.15s',
        '&:hover': { bgcolor: 'action.hover' },
        '&:hover .kpi-arr': { opacity: 1 },
      }}
    >
      <Box sx={{ width: 3, height: 28, borderRadius: 2, bgcolor: config.color, flexShrink: 0 }} />
      <Box sx={{ color: config.color, display: 'flex', flexShrink: 0 }}>
        <Icon size={14} />
      </Box>
      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500, flex: 1, lineHeight: 1.2 }}>
        {config.label}
      </Typography>
      {loading ? (
        <Skeleton width={28} height={20} />
      ) : (
        <Typography variant="body2" sx={{ fontWeight: 700, color: isAlert ? 'error.main' : config.color, fontSize: '0.9rem', flexShrink: 0 }}>
          {raw ?? '—'}
        </Typography>
      )}
      <FiChevronRight size={12} className="kpi-arr" style={{ opacity: 0, color: '#94a3b8', flexShrink: 0, transition: 'opacity 0.15s' }} />
    </Box>
  );
};

/* ─── Health bar ─────────────────────────────────────────────── */
const HealthBar = ({ label, value, total, color, sublabel }) => (
  <Box>
    <Stack direction="row" justifyContent="space-between" alignItems="baseline">
      <Typography variant="caption" color="text.secondary">{label}</Typography>
      <Typography variant="caption" sx={{ fontWeight: 700, color }}>{value}{sublabel ? ` · ${sublabel}` : ''}</Typography>
    </Stack>
    <Box sx={{ height: 6, borderRadius: 3, bgcolor: 'action.hover', mt: 0.5 }}>
      <Box sx={{ height: '100%', width: `${Math.min(100, (value / (total || 1)) * 100)}%`, borderRadius: 3, bgcolor: color, transition: 'width 0.4s ease' }} />
    </Box>
  </Box>
);

/* ─── Main Component ─────────────────────────────────────────── */
const SubcontractDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      axios.get('/api/erp/subcontract/dashboard').catch(() => ({ data: null })),
      axios.get('/api/erp/subcontract/orders').catch(() => ({ data: [] })),
    ]).then(([s, orders]) => {
      setStats(s.data);
      setRecentOrders((orders.data || []).slice(0, 5));
    }).finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, [refreshKey]);

  const orderColumns = [
    { field: 'order_no', header: 'Order No' },
    { field: 'vendor_name', header: 'Vendor' },
    { field: 'order_date', header: 'Date', render: (r) => formatDate(r.order_date) },
    { field: 'status', header: 'Status', render: (r) => <StatusChip status={r.status} /> },
    { field: 'total_qty', header: 'Qty', align: 'right' },
    { field: 'total_amount', header: 'Amount', align: 'right', render: (r) => formatCompactCurrency(r.total_amount) },
  ];

  return (
    <Box sx={{ p: { xs: 1.5, md: 2 } }}>
      {/* ── Header ── */}
      <PageHeader
        title="Subcontract Management"
        subtitle="Job work orders, material issues & receipts with vendor tracking"
        icon={<FiBriefcase size={20} />}
        actions={
          <Stack direction="row" spacing={1} alignItems="center">
            <Tooltip title="Refresh">
              <span>
                <IconButton size="small" onClick={() => setRefreshKey(k => k + 1)} disabled={loading}>
                  <FiRefreshCw size={15} />
                </IconButton>
              </span>
            </Tooltip>
            <Button
              variant="contained"
              startIcon={<FiPlus size={14} />}
              onClick={() => navigate('/subcontract/orders/add')}
              sx={{ textTransform: 'none', borderRadius: 1.5, py: 0.5 }}
            >
              New Order
            </Button>
          </Stack>
        }
      />

      {/* ── Quick Actions (horizontal) ── */}
      <Stack direction="row" spacing={0.75} sx={{ mb: 2, flexWrap: 'wrap', gap: 0.75 }}>
        {QUICK_LINKS.map((q) => {
          const Icon = q.icon;
          return (
            <Button
              key={q.label}
              size="small"
              variant="outlined"
              startIcon={<Icon size={13} />}
              onClick={() => navigate(q.to)}
              sx={{ textTransform: 'none', borderRadius: 1.5, py: 0.5, fontSize: '0.78rem', color: 'text.secondary', borderColor: 'divider', '&:hover': { borderColor: 'primary.main', color: 'primary.main' } }}
            >
              {q.label}
            </Button>
          );
        })}
      </Stack>

      {/* ── Hero Strip ── */}
      <Card sx={{ mb: 2, boxShadow: 'none', border: '1px solid', borderColor: 'divider', borderRadius: 2, bgcolor: 'background.paper' }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, p: 2, gap: { xs: 2, sm: 0 } }}>
          {[
            { label: 'Active Orders', value: stats?.activeOrders ?? null, sub: `${stats?.totalOrders ?? '—'} total orders`, accent: '#ed6c02' },
            { label: 'This Month', value: stats?.thisMonthOrders ?? null, sub: 'Orders created', accent: '#0ea5e9' },
            { label: 'Pending Issues', value: stats?.pendingIssues ?? null, sub: 'Material to issue', accent: Number(stats?.pendingIssues) > 0 ? 'error.main' : 'success.main' },
            { label: 'Pending Receipts', value: stats?.pendingReceipts ?? null, sub: 'Awaiting receipt', accent: Number(stats?.pendingReceipts) > 0 ? 'error.main' : 'success.main' },
          ].map((item, i, arr) => (
            <Box
              key={item.label}
              sx={{
                flex: 1,
                px: { xs: 1, sm: 2.5 },
                borderRight: { xs: 'none', sm: i < arr.length - 1 ? '1px solid' : 'none' },
                borderColor: 'divider',
              }}
            >
              <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, color: 'text.secondary', mb: 0.5 }}>
                {item.label}
              </Typography>
              {loading ? (
                <Skeleton width={60} height={32} />
              ) : (
                <Typography sx={{ fontSize: '1.5rem', fontWeight: 800, lineHeight: 1, color: item.accent, letterSpacing: -0.5 }}>
                  {item.value ?? '—'}
                </Typography>
              )}
              <Typography sx={{ fontSize: '0.7rem', color: 'text.secondary', mt: 0.4 }}>{item.sub}</Typography>
            </Box>
          ))}
        </Box>
      </Card>

      {/* ── Two-column layout ── */}
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>

        {/* ════ LEFT SIDEBAR ════ */}
        <Box sx={{ width: 230, flexShrink: 0, display: { xs: 'none', md: 'flex' }, flexDirection: 'column', gap: 1.5 }}>

          {/* KPI list */}
          <Card sx={{ borderRadius: 2, boxShadow: 'none', border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
            <Box sx={{ px: 1.5, py: 1, borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'grey.50' }}>
              <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: 'text.secondary', fontSize: '10px' }}>
                Overview
              </Typography>
            </Box>
            <Stack divider={<Divider />}>
              {KPI_CONFIG.map((cfg) => (
                <KpiRow key={cfg.key} config={cfg} stats={stats} loading={loading} onClick={() => cfg.to && navigate(cfg.to)} />
              ))}
            </Stack>
          </Card>

          {/* Health panel */}
          <Card sx={{ borderRadius: 2, boxShadow: 'none', border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
            <Box sx={{ px: 1.5, py: 1, borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'grey.50' }}>
              <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: 'text.secondary', fontSize: '10px' }}>
                Health
              </Typography>
            </Box>
            <Box sx={{ p: 1.5 }}>
              {loading ? (
                <Stack spacing={1}>{[1, 2, 3].map(i => <Skeleton key={i} height={28} />)}</Stack>
              ) : stats ? (
                <Stack spacing={1.5}>
                  <HealthBar label="Active Orders" value={Number(stats.activeOrders)} total={Number(stats.totalOrders) || 1} color="#ed6c02" />
                  <HealthBar label="Pending Issues" value={Number(stats.pendingIssues)} total={(Number(stats.pendingIssues) + Number(stats.totalIssues)) || 1} color="#d32f2f" />
                  <HealthBar label="Pending Receipts" value={Number(stats.pendingReceipts)} total={(Number(stats.pendingReceipts) + Number(stats.totalReceipts)) || 1} color="#2e7d32" />
                </Stack>
              ) : (
                <Typography variant="caption" color="text.secondary">No data</Typography>
              )}
              <Button
                size="small"
                endIcon={<FiArrowRight size={12} />}
                onClick={() => navigate('/subcontract/reports')}
                sx={{ mt: 1.5, textTransform: 'none', fontSize: '0.73rem', p: 0 }}
              >
                Subcontract Reports
              </Button>
            </Box>
          </Card>

        </Box>{/* end sidebar */}

        {/* ════ RIGHT MAIN AREA ════ */}
        <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>

          {/* Mobile KPI chips */}
          <Box sx={{ display: { xs: 'flex', md: 'none' }, gap: 1, flexWrap: 'wrap' }}>
            {KPI_CONFIG.map((cfg) => {
              const Icon = cfg.icon;
              const val = stats?.[cfg.key];
              return (
                <Box key={cfg.key} onClick={() => navigate(cfg.to)} sx={{ display: 'flex', alignItems: 'center', gap: 0.75, px: 1.25, py: 0.75, border: '1px solid', borderColor: 'divider', borderRadius: 1.5, cursor: 'pointer', minWidth: 110, flex: '1 1 110px' }}>
                  <Icon size={13} style={{ color: cfg.color }} />
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.65rem' }}>{cfg.label}</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: cfg.color, lineHeight: 1 }}>{loading ? '…' : (val ?? '—')}</Typography>
                  </Box>
                </Box>
              );
            })}
          </Box>

          {/* Recent Orders */}
          <Card sx={{ borderRadius: 2, boxShadow: 'none', border: '1px solid', borderColor: 'divider' }}>
            <Box sx={{ px: 2, pt: 1.25, pb: 1, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Recent Job Work Orders</Typography>
                <Typography variant="caption" color="text.secondary">Latest 5 orders</Typography>
              </Box>
              <Button size="small" endIcon={<FiArrowRight size={12} />} onClick={() => navigate('/subcontract/orders')} sx={{ textTransform: 'none', fontSize: '0.73rem', p: 0 }}>
                View All
              </Button>
            </Box>
            <Box sx={{ p: 1.5 }}>
              <DataTable
                title="Recent Job Work Orders"
                columns={orderColumns}
                rows={recentOrders}
                loading={loading}
                dense
              />
            </Box>
          </Card>

          {/* Pending Receipts alert banner */}
          {!loading && stats && Number(stats.pendingReceipts) > 0 && (
            <Box
              sx={{
                display: 'flex', alignItems: 'center', gap: 1.5,
                px: 2, py: 1, borderRadius: 2,
                bgcolor: '#fef2f2', border: '1px solid #fecaca', cursor: 'pointer',
              }}
              onClick={() => navigate('/subcontract/receipt')}
            >
              <FiRotateCcw size={16} style={{ color: '#ef4444', flexShrink: 0 }} />
              <Typography variant="body2" sx={{ color: '#b91c1c', fontWeight: 600 }}>
                {stats.pendingReceipts} receipt{Number(stats.pendingReceipts) !== 1 ? 's' : ''} awaiting completion
              </Typography>
              <Button size="small" sx={{ ml: 'auto', textTransform: 'none', color: '#ef4444', fontSize: '0.75rem', py: 0.25 }} endIcon={<FiArrowRight size={12} />}>
                View Receipts
              </Button>
            </Box>
          )}

        </Box>{/* end right */}
      </Box>{/* end two-col */}
    </Box>
  );
};

export default SubcontractDashboard;
