import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card, CardContent, Box, Typography, Stack, Button, Divider,
  LinearProgress, TextField, Tabs, Tab, Chip, Avatar, List,
  ListItem, Skeleton, Tooltip, IconButton, alpha,
} from '@mui/material';
import {
  FiBox, FiAlertTriangle, FiLayers, FiArrowUpRight, FiActivity,
  FiTruck, FiArchive, FiPlus, FiRefreshCw, FiChevronRight,
  FiArrowRight, FiClipboard, FiCheckCircle, FiXCircle,
} from 'react-icons/fi';
import axios from 'axios';
import PageHeader from '../../Common/PageHeader';
import DataTable from '../../Common/DataTable';
import StatusChip from '../../Common/StatusChip';
import { formatCompactCurrency, formatCurrency, formatDate, formatSmartDateTime } from '../../../utils/format';

const today = () => new Date().toISOString().slice(0, 10);

const QUICK_LINKS = [
  { label: 'Material Requisition', to: '/stores/material-requisitions/add', icon: FiArrowUpRight },
  { label: 'Material Issue', to: '/stores/material-issues/add', icon: FiActivity },
  { label: 'Goods Receipt', to: '/stores/grr/add', icon: FiTruck },
  { label: 'Item Master', to: '/stores/item-master', icon: FiBox },
  { label: 'Item Groups', to: '/stores/item-groups', icon: FiLayers },
  { label: 'Reports', to: '/stores/reports', icon: FiArrowRight },
];

const KPI_CONFIG = [
  { key: 'total_items', label: 'Total Items', icon: FiBox, color: '#10b981', to: '/stores/item-master' },
  { key: 'total_stock_value', label: 'Inventory Value', icon: FiArchive, color: '#3b82f6', to: '/stores/reports', format: 'currency' },
  { key: 'low_stock', label: 'Low Stock', icon: FiAlertTriangle, color: '#ef4444', to: '/stores/reports', alert: true },
  { key: 'total_categories', label: 'Categories', icon: FiLayers, color: '#0ea5e9', to: '/stores/item-groups' },
  { key: 'pending_mrs', label: 'Pending MRs', icon: FiArrowUpRight, color: '#f59e0b', to: '/stores/material-requisitions' },
  { key: 'pending_issues', label: 'Pending Issues', icon: FiActivity, color: '#a855f7', to: '/stores/material-issues' },
  { key: 'recent_grns', label: 'GRNs (30d)', icon: FiTruck, color: '#22c55e', to: '/stores/grr' },
  { key: 'warehouses', label: 'Warehouses', icon: FiArchive, color: '#64748b', static: 1 },
];

/* ─── KPI List Row (sidebar) ─────────────────────────────────── */
const KpiRow = ({ config, stats, loading, onClick }) => {
  const Icon = config.icon;
  const raw = config.static ?? stats?.[config.key];
  const value = config.format === 'currency' ? formatCompactCurrency(raw) : raw;
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
          {value ?? '—'}
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
const StoresDashboard = () => {
  const navigate = useNavigate();
  const [date, setDate] = useState(today());
  const [stats, setStats] = useState(null);
  const [daily, setDaily] = useState({ summary: {}, prs: [], pos: [], grns: [] });
  const [loading, setLoading] = useState(true);
  const [actTab, setActTab] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);
  const [irRows, setIrRows] = useState([]);
  const [irPendingDcs, setIrPendingDcs] = useState([]);
  const [irLoading, setIrLoading] = useState(true);

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      axios.get('/api/erp/stores/dashboard').catch(() => ({ data: null })),
      axios.get('/api/erp/purchase/reports/daily', { params: { date } }).catch(() => ({ data: { summary: {}, prs: [], pos: [], grns: [] } })),
    ]).then(([s, d]) => {
      setStats(s.data);
      setDaily(d.data || { summary: {}, prs: [], pos: [], grns: [] });
    }).finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, [date, refreshKey]);

  useEffect(() => {
    let active = true;
    setIrLoading(true);
    const from = new Date(date);
    from.setMonth(from.getMonth() - 3);
    Promise.all([
      axios.get('/api/erp/stores/inward-registers', { params: { date_from: from.toISOString().slice(0, 10), date_to: date } }).catch(() => ({ data: [] })),
      axios.get('/api/erp/stores/inward-registers/pending-dcs').catch(() => ({ data: [] })),
    ]).then(([irRes, dcRes]) => {
      if (!active) return;
      setIrRows(Array.isArray(irRes.data) ? irRes.data : []);
      setIrPendingDcs(Array.isArray(dcRes.data) ? dcRes.data : []);
    }).finally(() => active && setIrLoading(false));
    return () => { active = false; };
  }, [date, refreshKey]);

  const irStats = useMemo(() => {
    const s = { total: irRows.length, received: 0, approved: 0, cancelled: 0, value: 0 };
    irRows.forEach((r) => {
      if (r.status === 'Received') s.received++;
      else if (r.status === 'Approved') s.approved++;
      else if (r.status === 'Cancelled') s.cancelled++;
      s.value += (r.items || []).reduce((sum, i) => sum + (Number(i.qty_supplied || 0) * Number(i.rate || 0)), 0);
    });
    return s;
  }, [irRows]);

  const irPendingBalance = useMemo(() => irPendingDcs.reduce((sum, d) => sum + (d.items || []).reduce((s, it) => s + Number(it.qty_pending >= 0 ? it.qty_pending : 0), 0), 0), [irPendingDcs]);

  const s = daily.summary || {};

  const actColumns = [
    [
      { field: 'ir_no', header: 'GRN No' },
      { field: 'supplier_name', header: 'Vendor' },
      { field: 'ir_type', header: 'Type' },
      { field: 'qa_status', header: 'QA' },
      { field: 'approval_status', header: 'Approval', render: (r) => <StatusChip status={r.approval_status} /> },
      { field: 'value', header: 'Value', align: 'right', render: (r) => formatCurrency(r.value) },
    ],
    [
      { field: 'req_no', header: 'PR No' },
      { field: 'requested_by', header: 'Requested By' },
      { field: 'department', header: 'Dept' },
      { field: 'priority', header: 'Priority' },
      { field: 'status', header: 'Status', render: (r) => <StatusChip status={r.status} /> },
      { field: 'items', header: 'Items', align: 'right' },
    ],
    [
      { field: 'po_no', header: 'PO No' },
      { field: 'supplier_name', header: 'Vendor' },
      { field: 'status', header: 'Status', render: (r) => <StatusChip status={r.status} /> },
      { field: 'payment_terms', header: 'Terms' },
      { field: 'grand_total', header: 'Value', align: 'right', render: (r) => formatCurrency(r.grand_total, r.currency) },
    ],
  ];
  const actRows = [daily.grns || [], daily.prs || [], daily.pos || []];
  const actTitles = [`GRNs — ${formatDate(date)}`, `PRs — ${formatDate(date)}`, `POs — ${formatDate(date)}`];

  const lowStockPct = stats ? Math.min(100, (Number(stats.low_stock) / (Number(stats.total_items) || 1)) * 100) : 0;

  return (
    <Box sx={{ p: { xs: 1.5, md: 2 } }}>
      {/* ── Header ── */}
      <PageHeader
        title="Stores & Inventory"
        subtitle="Real-time stock control — receipts, issues, valuation & replenishment"
        icon={<FiBox size={20} />}
        actions={
          <Stack direction="row" spacing={1} alignItems="center">
            <TextField
              label="As of Date"
              type="date"
              size="small"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ bgcolor: 'background.paper', borderRadius: 1, width: 148 }}
            />
            <Tooltip title="Refresh">
              <span>
                <IconButton size="small" onClick={() => setRefreshKey(k => k + 1)} disabled={loading}>
                  <FiRefreshCw size={15} />
                </IconButton>
              </span>
            </Tooltip>
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
        <Button
          size="small"
          variant="contained"
          startIcon={<FiPlus size={13} />}
          onClick={() => navigate('/stores/material-requisitions/add')}
          sx={{ textTransform: 'none', borderRadius: 1.5, py: 0.5, fontSize: '0.78rem', ml: 'auto' }}
        >
          New Requisition
        </Button>
      </Stack>
      {/* ── Inventory Hero Strip (Theme Coordinated Card) ── */}
      <Card
        sx={{
          mb: 2,
          boxShadow: 'none',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
          bgcolor: 'background.paper',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            p: 2,
            gap: { xs: 2, sm: 0 },
          }}
        >
          {[
            { label: 'Total Stock Value', value: stats ? formatCompactCurrency(stats.total_stock_value) : null, sub: `${stats?.total_items ?? '—'} items tracked`, accent: 'primary.main' },
            { label: 'Low Stock Items', value: stats?.low_stock ?? null, sub: 'Below reorder level', accent: Number(stats?.low_stock) > 0 ? 'error.main' : 'success.main' },
            { label: 'Pending MRs', value: stats?.pending_mrs ?? null, sub: `${stats?.pending_issues ?? '—'} issues pending`, accent: '#ed6c02' },
            { label: 'GRNs This Month', value: stats?.recent_grns ?? null, sub: 'Material received', accent: 'success.main' },
          ].map((item, i, arr) => (
            <Box
              key={item.label}
              sx={{
                flex: 1,
                px: { xs: 1, sm: 2.5 },
                borderRight: {
                  xs: 'none',
                  sm: i < arr.length - 1 ? '1px solid' : 'none',
                },
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

          {/* Inventory Health panel */}
          <Card sx={{ borderRadius: 2, boxShadow: 'none', border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
            <Box sx={{ px: 1.5, py: 1, borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'grey.50', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: 'text.secondary', fontSize: '10px' }}>
                Health
              </Typography>
              {lowStockPct > 0 && (
                <Chip label={`${lowStockPct.toFixed(0)}% low`} size="small" color="error" variant="outlined" sx={{ height: 16, fontSize: '0.6rem' }} />
              )}
            </Box>
            <Box sx={{ p: 1.5 }}>
              {loading ? (
                <Stack spacing={1}>{[1, 2, 3, 4].map(i => <Skeleton key={i} height={28} />)}</Stack>
              ) : stats ? (
                <Stack spacing={1.5}>
                  <HealthBar label="Total Items" value={Number(stats.total_items)} total={Number(stats.total_items)} color="#10b981" />
                  <HealthBar label="Low Stock" value={Number(stats.low_stock)} total={Number(stats.total_items) || 1} color="#ef4444" sublabel="reorder" />
                  <HealthBar label="Pending MRs" value={Number(stats.pending_mrs)} total={(Number(stats.pending_mrs) + Number(stats.pending_issues)) || 1} color="#f59e0b" />
                  <HealthBar label="Pending Issues" value={Number(stats.pending_issues)} total={(Number(stats.pending_mrs) + Number(stats.pending_issues)) || 1} color="#a855f7" />
                </Stack>
              ) : (
                <Typography variant="caption" color="text.secondary">No data</Typography>
              )}
              <Button
                size="small"
                endIcon={<FiArrowRight size={12} />}
                onClick={() => navigate('/stores/reports')}
                sx={{ mt: 1.5, textTransform: 'none', fontSize: '0.73rem', p: 0 }}
              >
                Stores Reports
              </Button>
            </Box>
          </Card>

        </Box>{/* end sidebar */}

        {/* ════ RIGHT MAIN AREA ════ */}
        <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>

          {/* Mobile KPI chips */}
          <Box sx={{ display: { xs: 'flex', md: 'none' }, gap: 1, flexWrap: 'wrap' }}>
            {KPI_CONFIG.filter(c => c.to).map((cfg) => {
              const Icon = cfg.icon;
              const raw = cfg.static ?? stats?.[cfg.key];
              const val = cfg.format === 'currency' ? formatCompactCurrency(raw) : raw;
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

          {/* Daily Activity — full width */}
          <Card sx={{ borderRadius: 2, boxShadow: 'none', border: '1px solid', borderColor: 'divider' }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 2, pt: 1.25, pb: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Store Activity</Typography>
                <Typography variant="caption" color="text.secondary">{formatDate(date)}</Typography>
              </Box>
              <Tabs
                value={actTab}
                onChange={(_, v) => setActTab(v)}
                variant="scrollable"
                scrollButtons="auto"
                sx={{ '& .MuiTab-root': { fontSize: '0.73rem', minHeight: 34, py: 0.25, textTransform: 'none', px: 1.5 } }}
              >
                <Tab label={`GRNs (${s.grn_count || 0})`} />
                <Tab label={`PRs (${s.pr_count || 0})`} />
                <Tab label={`POs (${s.po_count || 0})`} />
              </Tabs>
            </Box>
            <Box sx={{ p: 1.5 }}>
              <DataTable
                title={actTitles[actTab]}
                columns={actColumns[actTab]}
                rows={actRows[actTab]}
                loading={loading}
                dense
              />
            </Box>
          </Card>

          {/* Low Stock Alert banner (only when there are low stock items) */}
          {!loading && stats && Number(stats.low_stock) > 0 && (
            <Box
              sx={{
                display: 'flex', alignItems: 'center', gap: 1.5,
                px: 2, py: 1, borderRadius: 2,
                bgcolor: '#fef2f2', border: '1px solid #fecaca',
                cursor: 'pointer',
              }}
              onClick={() => navigate('/stores/reports')}
            >
              <FiAlertTriangle size={16} style={{ color: '#ef4444', flexShrink: 0 }} />
              <Typography variant="body2" sx={{ color: '#b91c1c', fontWeight: 600 }}>
                {stats.low_stock} item{Number(stats.low_stock) !== 1 ? 's' : ''} below reorder level
              </Typography>
              <Button size="small" sx={{ ml: 'auto', textTransform: 'none', color: '#ef4444', fontSize: '0.75rem', py: 0.25 }} endIcon={<FiArrowRight size={12} />}>
                View Report
              </Button>
            </Box>
          )}

          {/* ════ Inward Registers ════ */}
          <Card sx={{ borderRadius: 2, boxShadow: 'none', border: '1px solid', borderColor: 'divider' }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 2, pt: 1.25, pb: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Inward Registers</Typography>
                <Typography variant="caption" color="text.secondary">Receipts against delivery challans · Last 3 months</Typography>
              </Box>
              <Stack direction="row" spacing={0.75} alignItems="center">
                {irPendingDcs.length > 0 && (
                  <Chip label={`${irPendingBalance} qty awaiting IR`} size="small" color="warning" variant="outlined" sx={{ height: 18, fontSize: '0.62rem' }} />
                )}
                <Button size="small" endIcon={<FiArrowRight size={12} />} onClick={() => navigate('/stores/inward-registers')} sx={{ textTransform: 'none', fontSize: '0.73rem' }}>
                  View All
                </Button>
              </Stack>
            </Box>

            {/* IR KPI strip */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(5, 1fr)' }, gap: 1, px: 2, pt: 1.5 }}>
              {[
                { label: 'Total IRs', value: irStats.total, sub: 'Last 3 months', color: '#2563eb', icon: FiClipboard },
                { label: 'Received', value: irStats.received, sub: 'Pending approval', color: '#ea580c', icon: FiTruck },
                { label: 'Approved', value: irStats.approved, sub: 'Stock posted', color: '#059669', icon: FiCheckCircle },
                { label: 'Cancelled', value: irStats.cancelled, sub: 'Reversed', color: '#dc2626', icon: FiXCircle },
                { label: 'Receipt Value', value: irLoading ? '—' : formatCompactCurrency(irStats.value), sub: 'Qty × rate', color: '#7c3aed', icon: FiArrowUpRight },
              ].map((k) => {
                const Icon = k.icon;
                return (
                  <Box key={k.label} sx={{ px: 1, py: 0.9, borderRadius: 1.5, border: '1px solid', borderColor: 'divider', bgcolor: 'grey.50' }}>
                    <Stack direction="row" alignItems="center" spacing={0.75}>
                      <Avatar variant="rounded" sx={{ width: 26, height: 26, bgcolor: `${k.color}1a`, color: k.color }}>
                        <Icon size={13} />
                      </Avatar>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography sx={{ fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.4, color: 'text.secondary' }}>{k.label}</Typography>
                        {irLoading ? <Skeleton width={40} height={20} /> : (
                          <Typography sx={{ fontSize: '1.05rem', fontWeight: 800, lineHeight: 1.15, color: '#0f172a', letterSpacing: '-0.3px' }}>{k.value ?? '—'}</Typography>
                        )}
                      </Box>
                    </Stack>
                  </Box>
                );
              })}
            </Box>

            {/* IR two-column: pending DCs + recent IRs */}
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', p: 2, flexDirection: { xs: 'column', lg: 'row' } }}>
              {/* Pending DCs */}
              <Box sx={{ width: { lg: 320 }, flexShrink: 0, border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}>
                <Box sx={{ px: 1.5, py: 1, borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'grey.50', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: 'text.secondary', fontSize: '10px' }}>DCs Awaiting IR</Typography>
                </Box>
                <Box sx={{ p: 1.25 }}>
                  {irLoading ? (
                    <Stack spacing={1}>{[1, 2, 3].map((i) => <Skeleton key={i} height={40} />)}</Stack>
                  ) : irPendingDcs.length === 0 ? (
                    <Typography variant="caption" color="text.secondary">No approved DCs with pending balance.</Typography>
                  ) : (
                    <Stack spacing={0.5}>
                      {irPendingDcs.slice(0, 6).map((d) => {
                        const balance = (d.items || []).reduce((s, it) => s + Number(it.qty_pending >= 0 ? it.qty_pending : 0), 0);
                        return (
                          <Box key={d.id}
                            onClick={() => navigate(`/stores/inward-registers/add?type=${d.dc_type || 'L'}&prefill_dc=${d.id}`)}
                            sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1.25, py: 0.75, borderRadius: 1.5, border: '1px solid', borderColor: 'divider', cursor: 'pointer', transition: 'all .15s', '&:hover': { borderColor: '#f59e0b', bgcolor: alpha('#f59e0b', 0.05) } }}>
                            <Box sx={{ width: 3, height: 26, borderRadius: 2, bgcolor: '#f59e0b', flexShrink: 0 }} />
                            <Box sx={{ minWidth: 0, flex: 1 }}>
                              <Typography sx={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.76rem', color: '#0f172a' }}>{d.dc_no || d.draft_no}</Typography>
                              <Typography sx={{ fontSize: '0.68rem', color: 'text.secondary', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.party_name || '-'} · {formatSmartDateTime(d.dc_date)}</Typography>
                            </Box>
                            <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
                              <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, color: '#d97706' }}>{balance}</Typography>
                              <Typography sx={{ fontSize: '0.6rem', color: 'text.secondary' }}>qty</Typography>
                            </Box>
                            <FiArrowRight size={13} style={{ color: '#94a3b8', flexShrink: 0 }} />
                          </Box>
                        );
                      })}
                    </Stack>
                  )}
                  {!irLoading && irPendingDcs.length > 0 && (
                    <Button size="small" endIcon={<FiArrowRight size={12} />} onClick={() => navigate('/stores/inward-registers')} sx={{ mt: 1.5, textTransform: 'none', fontSize: '0.73rem', p: 0 }}>
                      View all pending DCs
                    </Button>
                  )}
                </Box>
              </Box>

              {/* Recent IRs */}
              <Box sx={{ flex: 1, minWidth: 0, border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}>
                <Box sx={{ px: 1.5, py: 1, borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'grey.50' }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: 'text.secondary', fontSize: '10px' }}>Recent Inward Registers</Typography>
                </Box>
                {irLoading ? (
                  <Box sx={{ p: 2 }}><LinearProgress sx={{ borderRadius: 1 }} /></Box>
                ) : irRows.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 5, color: '#94a3b8' }}>
                    <FiClipboard size={22} style={{ opacity: 0.4, marginBottom: 8 }} />
                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#64748b', fontSize: '0.85rem' }}>No IRs yet</Typography>
                    <Typography variant="caption" sx={{ display: 'block', mt: 0.25 }}>Create an IR from an approved delivery challan.</Typography>
                  </Box>
                ) : (
                  <Box sx={{ overflowX: 'auto' }}>
                    <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse', minWidth: 640 }}>
                      <Box component="thead">
                        <Box component="tr" sx={{ bgcolor: 'grey.50' }}>
                          {['IR #', 'Date', 'Party', 'Qty', 'Value', 'Status'].map((h) => (
                            <Box component="th" key={h} sx={{ textAlign: 'left', fontSize: '0.66rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.4, color: 'text.secondary', px: 1.5, py: 0.9, borderBottom: '1px solid', borderColor: 'divider', whiteSpace: 'nowrap' }}>{h}</Box>
                          ))}
                        </Box>
                      </Box>
                      <Box component="tbody">
                        {irRows.slice(0, 6).map((r) => {
                          const statusC = r.status === 'Approved' ? '#059669' : r.status === 'Cancelled' ? '#dc2626' : '#d97706';
                          const statusB = r.status === 'Approved' ? '#dcfce7' : r.status === 'Cancelled' ? '#fee2e2' : '#fef3c7';
                          return (
                            <Box component="tr" key={r.id} onClick={() => navigate(`/stores/inward-registers/view/${r.id}?type=${r.dc_type || 'L'}`)} sx={{ cursor: 'pointer', transition: 'background 0.12s', '&:hover': { bgcolor: 'action.hover' } }}>
                              <Box component="td" sx={{ px: 1.5, py: 0.8, borderBottom: '1px solid', borderColor: 'divider', fontFamily: 'monospace', fontWeight: 700, fontSize: '0.78rem', color: '#1565c0' }}>{r.ir_no || '-'}</Box>
                              <Box component="td" sx={{ px: 1.5, py: 0.8, borderBottom: '1px solid', borderColor: 'divider', fontSize: '0.75rem', whiteSpace: 'nowrap' }}>{formatSmartDateTime(r.ir_date)}</Box>
                              <Box component="td" sx={{ px: 1.5, py: 0.8, borderBottom: '1px solid', borderColor: 'divider', fontSize: '0.75rem', fontWeight: 600 }}>{r.party_name || '-'}</Box>
                              <Box component="td" sx={{ px: 1.5, py: 0.8, borderBottom: '1px solid', borderColor: 'divider', fontSize: '0.75rem', textAlign: 'center' }}>{(r.items || []).reduce((s, i) => s + Number(i.qty_supplied || 0), 0)}</Box>
                              <Box component="td" sx={{ px: 1.5, py: 0.8, borderBottom: '1px solid', borderColor: 'divider', fontSize: '0.75rem', fontWeight: 700, color: '#059669' }}>{formatCompactCurrency((r.items || []).reduce((s, i) => s + (Number(i.qty_supplied || 0) * Number(i.rate || 0)), 0))}</Box>
                              <Box component="td" sx={{ px: 1.5, py: 0.8, borderBottom: '1px solid', borderColor: 'divider' }}>
                                <Box component="span" sx={{ px: 0.9, py: 0.15, borderRadius: 1.5, fontSize: '0.65rem', fontWeight: 700, bgcolor: statusB, color: statusC }}>{r.status}</Box>
                              </Box>
                            </Box>
                          );
                        })}
                      </Box>
                    </Box>
                  </Box>
                )}
              </Box>
            </Box>
          </Card>

        </Box>{/* end right */}
      </Box>{/* end two-col */}
    </Box>
  );
};

export default StoresDashboard;
