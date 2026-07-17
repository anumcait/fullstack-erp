import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Grid, Card, CardContent, Box, Typography, Stack, Button,
  Avatar, List, ListItem, ListItemText, Chip, Table,
  TableHead, TableRow, TableCell, TableBody, LinearProgress, TextField,
  Tabs, Tab, Tooltip, IconButton, Skeleton, Divider,
} from '@mui/material';
import {
  FiShoppingCart, FiFileText, FiTruck, FiClock, FiCheckCircle,
  FiTrendingUp, FiUsers, FiPackage, FiPlus, FiArrowRight,
  FiMail, FiRefreshCw, FiExternalLink, FiChevronRight,
} from 'react-icons/fi';
import axios from 'axios';
import { useToast } from '../../../context/ToastContext';
import PageHeader from '../../Common/PageHeader';
import DataTable from '../../Common/DataTable';
import { AreaTrendChart } from '../../Common/Charts';
import StatusChip from '../../Common/StatusChip';
import { formatCompactCurrency, formatCurrency, formatDate } from '../../../utils/format';

const today = () => new Date().toISOString().slice(0, 10);

const QUICK_LINKS = [
  { label: 'New Indent', to: '/purchase/requisitions/add', icon: FiFileText },
  { label: 'New PO', to: '/purchase/orders/add', icon: FiShoppingCart },
  { label: 'New RFQ', to: '/purchase/rfq/add', icon: FiMail },
  { label: 'Goods Receipt', to: '/stores/grr/add', icon: FiTruck },
  { label: 'Vendors', to: '/purchase/vendors', icon: FiUsers },
  { label: 'Reports', to: '/purchase/reports', icon: FiTrendingUp },
];

const KPI_CONFIG = [
  { key: 'open_indents', label: 'Open Indents', icon: FiFileText, color: '#3b82f6', to: '/purchase/requisitions' },
  { key: 'pending_pos', label: 'Pending POs', icon: FiClock, color: '#f59e0b', valueKey: 'pending_po_value', to: '/purchase/orders' },
  { key: 'approved_pos', label: 'Approved POs', icon: FiCheckCircle, color: '#10b981', valueKey: 'approved_po_value', to: '/purchase/orders' },
  { key: 'po_this_month', label: 'PO This Month', icon: FiTrendingUp, color: '#0ea5e9', to: '/purchase/orders' },
  { key: 'grn_today', label: 'GRN Today', icon: FiTruck, color: '#22c55e', valueKey: 'grn_value_this_month', to: '/stores/grr' },
  { key: 'active_vendors', label: 'Active Vendors', icon: FiUsers, color: '#a855f7', to: '/purchase/vendors' },
  { key: 'total_rfq', label: 'Total RFQs', icon: FiMail, color: '#64748b', to: '/purchase/rfq' },
  { key: 'pr_this_month', label: 'PR This Month', icon: FiFileText, color: '#14b8a6', to: '/purchase/requisitions' },
];

/* ─── Left sidebar KPI list row ───────────────────────────────── */
const KpiRow = ({ config, stats, loading, onClick }) => {
  const Icon = config.icon;
  const value = stats?.[config.key];
  const sub = config.valueKey ? stats?.[config.valueKey] : null;

  return (
    <Box
      onClick={onClick}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        px: 1.5,
        py: 1,
        cursor: 'pointer',
        borderRadius: 1,
        transition: 'background 0.15s',
        '&:hover': { bgcolor: 'action.hover' },
        '&:hover .kpi-arrow': { opacity: 1 },
      }}
    >
      {/* color dot */}
      <Box sx={{ width: 3, height: 28, borderRadius: 2, bgcolor: config.color, flexShrink: 0 }} />
      {/* icon */}
      <Box sx={{ color: config.color, display: 'flex', flexShrink: 0 }}>
        <Icon size={14} />
      </Box>
      {/* label */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500, display: 'block', lineHeight: 1.2 }}>
          {config.label}
        </Typography>
        {sub != null && !loading && (
          <Typography variant="caption" sx={{ color: config.color, fontSize: '0.65rem' }}>
            {formatCompactCurrency(sub)}
          </Typography>
        )}
      </Box>
      {/* value badge */}
      {loading ? (
        <Skeleton width={28} height={20} />
      ) : (
        <Typography variant="body2" sx={{ fontWeight: 700, color: config.color, fontSize: '0.9rem', flexShrink: 0 }}>
          {value ?? '—'}
        </Typography>
      )}
      <FiChevronRight size={12} className="kpi-arrow" style={{ opacity: 0, color: '#94a3b8', flexShrink: 0, transition: 'opacity 0.15s' }} />
    </Box>
  );
};

/* ─── Main Component ─────────────────────────────────────────── */
const PurchaseDashboard = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [date, setDate] = useState(today());
  const [stats, setStats] = useState(null);
  const [daily, setDaily] = useState({ summary: {}, prs: [], pos: [], grns: [] });
  const [party, setParty] = useState([]);
  const [trend, setTrend] = useState([]);
  const [activity, setActivity] = useState({ purchase_orders: [], grns: [], requisitions: [] });
  const [loading, setLoading] = useState(true);
  const [snapTab, setSnapTab] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);
  const [pendingApprovals, setPendingApprovals] = useState([]);

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      axios.get('/api/erp/purchase/dashboard').catch(() => ({ data: null })),
      axios.get('/api/erp/purchase/reports/daily', { params: { date } }).catch(() => ({ data: { summary: {}, prs: [], pos: [], grns: [] } })),
      axios.get('/api/erp/purchase/reports/pending-by-party').catch(() => ({ data: [] })),
      axios.get('/api/erp/purchase/reports/monthly-trend').catch(() => ({ data: [] })),
      axios.get('/api/erp/purchase/recent-activity').catch(() => ({ data: { purchase_orders: [], grns: [], requisitions: [] } })),
      axios.get('/api/erp/purchase/requisitions', { params: { status: 'Pending' } }).catch(() => ({ data: [] })),
    ]).then(([s, d, p, t, a, pa]) => {
      setStats(s.data);
      setDaily(d.data || { summary: {}, prs: [], pos: [], grns: [] });
      setParty(p.data || []);
      setTrend(t.data || []);
      setActivity(a.data || { purchase_orders: [], grns: [], requisitions: [] });
      setPendingApprovals(pa.data || []);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, [date, refreshKey]);

  const s = daily.summary || {};

  const parties = useMemo(() => {
    const map = new Map();
    for (const r of party) {
      if (!map.has(r.supplier_name)) {
        map.set(r.supplier_name, { supplier_code: r.supplier_code, city: r.city, rows: [], total: 0 });
      }
      const e = map.get(r.supplier_name);
      e.rows.push(r);
      e.total += Number(r.pending_value || 0);
    }
    return Array.from(map.entries()).map(([name, v]) => ({ name, ...v })).sort((a, b) => b.total - a.total);
  }, [party]);

  const snapColumns = [
    [
      { field: 'req_no', header: 'PR No' },
      { field: 'requested_by', header: 'Requested By' },
      { field: 'department', header: 'Dept' },
      { field: 'priority', header: 'Priority' },
      { field: 'status', header: 'Status', render: (r) => <StatusChip status={r.status} /> },
    ],
    [
      { field: 'po_no', header: 'PO No' },
      { field: 'supplier_name', header: 'Vendor' },
      { field: 'status', header: 'Status', render: (r) => <StatusChip status={r.status} /> },
      { field: 'payment_terms', header: 'Terms' },
      { field: 'grand_total', header: 'Value', align: 'right', render: (r) => formatCurrency(r.grand_total, r.currency) },
    ],
    [
      { field: 'grn_no', header: 'GRN No' },
      { field: 'supplier_name', header: 'Vendor' },
      { field: 'ir_type', header: 'Type' },
      { field: 'qa_status', header: 'QA' },
      { field: 'value', header: 'Value', align: 'right', render: (r) => formatCurrency(r.value) },
    ],
  ];
  const snapRows = [daily.prs || [], daily.pos || [], daily.grns || []];
  const snapTitles = [
    `PRs — ${formatDate(date)}`,
    `POs — ${formatDate(date)}`,
    `GRNs — ${formatDate(date)}`,
  ];

  const allActivity = [...activity.purchase_orders, ...activity.grns, ...activity.requisitions].slice(0, 12);

  return (
    <Box sx={{ p: { xs: 1.5, md: 2 } }}>
      {/* ── Header ── */}
      <PageHeader
        title="Purchase Management"
        subtitle="Procurement control tower — indents, orders, vendors & receipts"
        icon={<FiShoppingCart size={20} />}
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
          onClick={() => navigate('/purchase/orders/add')}
          sx={{ textTransform: 'none', borderRadius: 1.5, py: 0.5, fontSize: '0.78rem', ml: 'auto' }}
        >
          New PO
        </Button>
      </Stack>

      {/* ── Financial Hero Strip (Theme Coordinated Card) ── */}
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
            { label: 'PO Value This Month', value: stats ? formatCompactCurrency(stats.approved_po_value) : null, sub: `${stats?.po_this_month ?? '—'} orders`, accent: 'primary.main' },
            { label: 'Pending PO Value', value: stats ? formatCompactCurrency(stats.pending_po_value) : null, sub: `${stats?.pending_pos ?? '—'} pending`, accent: '#ed6c02' },
            { label: 'GRN Value (Month)', value: stats ? formatCompactCurrency(stats.grn_value_this_month) : null, sub: `${stats?.grn_today ?? '—'} today`, accent: '#2e7d32' },
            { label: 'Active Vendors', value: stats?.active_vendors ?? null, sub: 'Registered suppliers', accent: 'secondary.main' },
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

          {/* KPI list card */}
          <Card sx={{ borderRadius: 2, boxShadow: 'none', border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
            <Box sx={{ px: 1.5, py: 1, borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'grey.50' }}>
              <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: 'text.secondary', fontSize: '10px' }}>
                Overview
              </Typography>
            </Box>
            <Stack divider={<Divider />}>
              {KPI_CONFIG.map((cfg) => (
                <KpiRow key={cfg.key} config={cfg} stats={stats} loading={loading} onClick={() => navigate(cfg.to)} />
              ))}
            </Stack>
          </Card>

          {/* Recent Activity */}
          <Card sx={{ borderRadius: 2, boxShadow: 'none', border: '1px solid', borderColor: 'divider', overflow: 'hidden', flex: 1 }}>
            <Box sx={{ px: 1.5, py: 1, borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'grey.50', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: 'text.secondary', fontSize: '10px' }}>
                Recent Activity
              </Typography>
              <Chip label={allActivity.length} size="small" variant="outlined" sx={{ height: 16, fontSize: '0.6rem' }} />
            </Box>
            {loading ? (
              <Stack spacing={0.75} sx={{ p: 1.25 }}>
                {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} height={32} />)}
              </Stack>
            ) : allActivity.length === 0 ? (
              <Box sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="caption" color="text.secondary">No recent activity</Typography>
              </Box>
            ) : (
              <List dense disablePadding sx={{ overflowY: 'auto', maxHeight: 320 }}>
                {allActivity.map((r, idx) => {
                  const label = r.po_no || r.grn_no || r.req_no || `#${idx}`;
                  const sub = r.supplier_name || r.department || '—';
                  const init = (r.supplier_name || label).charAt(0).toUpperCase();
                  return (
                    <ListItem
                      key={r.id || idx}
                      sx={{ px: 1.25, py: 0.6, borderBottom: '1px solid', borderColor: 'divider', '&:last-child': { borderBottom: 'none' }, alignItems: 'flex-start' }}
                    >
                      <Avatar sx={{ width: 24, height: 24, mr: 1, bgcolor: 'primary.light', fontSize: 10, fontWeight: 700, flexShrink: 0, mt: 0.25 }}>
                        {init}
                      </Avatar>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', lineHeight: 1.3 }}>{label}</Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sub}</Typography>
                      </Box>
                      <StatusChip status={r.status} />
                    </ListItem>
                  );
                })}
              </List>
            )}
          </Card>
        </Box>

        {/* ════ RIGHT MAIN AREA ════ */}
        <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>

          {/* Mobile KPI row (xs only) */}
          <Box sx={{ display: { xs: 'flex', md: 'none' }, gap: 1, flexWrap: 'wrap' }}>
            {KPI_CONFIG.map((cfg) => {
              const Icon = cfg.icon;
              return (
                <Box key={cfg.key} onClick={() => navigate(cfg.to)} sx={{ display: 'flex', alignItems: 'center', gap: 0.75, px: 1.25, py: 0.75, border: '1px solid', borderColor: 'divider', borderRadius: 1.5, cursor: 'pointer', minWidth: 120, flex: '1 1 120px' }}>
                  <Icon size={13} style={{ color: cfg.color }} />
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.65rem' }}>{cfg.label}</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: cfg.color, lineHeight: 1 }}>{loading ? '…' : (stats?.[cfg.key] ?? '—')}</Typography>
                  </Box>
                </Box>
              );
            })}
          </Box>

          {/* Daily Snapshot — full width */}
          <Card sx={{ borderRadius: 2, boxShadow: 'none', border: '1px solid', borderColor: 'divider' }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 2, pt: 1.25, pb: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Daily Snapshot</Typography>
                <Typography variant="caption" color="text.secondary">{formatDate(date)}</Typography>
              </Box>
              <Tabs
                value={snapTab}
                onChange={(_, v) => setSnapTab(v)}
                variant="scrollable"
                scrollButtons="auto"
                sx={{ '& .MuiTab-root': { fontSize: '0.73rem', minHeight: 34, py: 0.25, textTransform: 'none', px: 1.5 } }}
              >
                <Tab label={`PRs (${s.pr_count || 0})`} />
                <Tab label={`POs (${s.po_count || 0})`} />
                <Tab label={`GRNs (${s.grn_count || 0})`} />
              </Tabs>
            </Box>
            <Box sx={{ p: 1.5 }}>
              <DataTable
                title={snapTitles[snapTab]}
                columns={snapColumns[snapTab]}
                rows={snapRows[snapTab]}
                loading={loading}
                dense
              />
            </Box>
          </Card>

          {/* Pending PR Approvals */}
          {pendingApprovals.length > 0 && (
            <Card sx={{ borderRadius: 2, boxShadow: 'none', border: '1px solid', borderColor: 'divider', borderLeft: '4px solid #ed6c02' }}>
              <Box sx={{ px: 2, pt: 1.25, pb: 1, borderBottom: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <FiClock size={15} style={{ color: '#ed6c02' }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Pending PR Approvals</Typography>
                </Stack>
                <Chip label={`${pendingApprovals.length} awaiting you`} size="small" color="warning" sx={{ height: 18, fontSize: '0.65rem' }} />
              </Box>
              <Box sx={{ overflowX: 'auto' }}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'grey.50' }}>
                      <TableCell sx={{ fontWeight: 700, py: 0.75, fontSize: '0.73rem', color: 'text.secondary' }}>Req #</TableCell>
                      <TableCell sx={{ fontWeight: 700, py: 0.75, fontSize: '0.73rem', color: 'text.secondary' }}>Requested By</TableCell>
                      <TableCell sx={{ fontWeight: 700, py: 0.75, fontSize: '0.73rem', color: 'text.secondary' }}>Dept</TableCell>
                      <TableCell sx={{ fontWeight: 700, py: 0.75, fontSize: '0.73rem', color: 'text.secondary' }}>Items</TableCell>
                      <TableCell sx={{ fontWeight: 700, py: 0.75, fontSize: '0.73rem', color: 'text.secondary' }}>Value</TableCell>
                      <TableCell sx={{ width: 100, py: 0.75 }} />
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {pendingApprovals.slice(0, 5).map((pr) => (
                      <TableRow key={pr.id} hover>
                        <TableCell sx={{ py: 0.4, fontSize: '0.78rem', fontWeight: 600 }}>{pr.req_no}</TableCell>
                        <TableCell sx={{ py: 0.4, fontSize: '0.78rem' }}>{pr.requested_by || '—'}</TableCell>
                        <TableCell sx={{ py: 0.4, fontSize: '0.78rem' }}>{pr.department || '—'}</TableCell>
                        <TableCell sx={{ py: 0.4, fontSize: '0.78rem' }}>{pr.items?.length || 0}</TableCell>
                        <TableCell sx={{ py: 0.4, fontSize: '0.78rem' }}>
                          ₹{pr.items?.reduce((s, i) => s + (Number(i.est_cost) || 0), 0).toLocaleString()}
                        </TableCell>
                        <TableCell sx={{ py: 0.4 }}>
                          <Stack direction="row" spacing={0.5}>
                            <Button size="small" variant="contained" color="success"
                              sx={{ fontSize: '0.68rem', minWidth: 56, height: 24, textTransform: 'none' }}
                              onClick={async () => {
                                try {
                                  const emp = localStorage.getItem('empId') || '';
                                  await axios.put(`/api/erp/purchase/requisitions/${pr.id}/approve`, { status: 'Approved', approved_by: emp });
                                  setPendingApprovals((prev) => prev.filter((r) => r.id !== pr.id));
                                  setRefreshKey(k => k + 1);
                                } catch { showToast('Approve failed', 'error'); }
                              }}>
                              Approve
                            </Button>
                            <Button size="small" variant="outlined" color="error"
                              sx={{ fontSize: '0.68rem', minWidth: 48, height: 24, textTransform: 'none' }}
                              onClick={() => navigate(`/purchase/requisitions/view/${pr.id}`)}>
                              View
                            </Button>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
              {pendingApprovals.length > 5 && (
                <Box sx={{ px: 2, py: 1, textAlign: 'center', borderTop: '1px solid', borderColor: 'divider' }}>
                  <Button size="small" sx={{ textTransform: 'none', fontSize: '0.73rem' }}
                    onClick={() => navigate('/purchase/requisitions?status=Pending')}>
                    View all {pendingApprovals.length} pending approvals →
                  </Button>
                </Box>
              )}
            </Card>
          )}

          {/* Material Pending at Party */}
          <Card sx={{ borderRadius: 2, boxShadow: 'none', border: '1px solid', borderColor: 'divider' }}>
            <Box sx={{ px: 2, pt: 1.25, pb: 1, borderBottom: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <FiPackage size={15} style={{ color: '#64748b' }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Material Pending at Party</Typography>
              </Stack>
              <Chip label={`${parties.length} parties`} size="small" color="primary" variant="outlined" sx={{ height: 18, fontSize: '0.65rem' }} />
            </Box>
            {loading ? (
              <Box sx={{ p: 2 }}><LinearProgress /></Box>
            ) : parties.length === 0 ? (
              <Box sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">No pending material against any party.</Typography>
              </Box>
            ) : (
              <Box sx={{ overflowX: 'auto' }}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'grey.50' }}>
                      <TableCell sx={{ fontWeight: 700, py: 0.75, fontSize: '0.73rem', color: 'text.secondary', width: '20%' }}>Vendor</TableCell>
                      <TableCell sx={{ fontWeight: 700, py: 0.75, fontSize: '0.73rem', color: 'text.secondary' }}>PO No</TableCell>
                      <TableCell sx={{ fontWeight: 700, py: 0.75, fontSize: '0.73rem', color: 'text.secondary' }}>Item</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, py: 0.75, fontSize: '0.73rem', color: 'text.secondary' }}>Pending Qty</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, py: 0.75, fontSize: '0.73rem', color: 'text.secondary' }}>Pending Value</TableCell>
                      <TableCell sx={{ width: 28 }} />
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {parties.flatMap((p) =>
                      p.rows.map((r, i) => (
                        <TableRow
                          key={`${r.po_id}-${r.item_code}-${i}`}
                          hover
                          sx={{ cursor: 'pointer' }}
                          onClick={() => navigate(`/purchase/orders/view/${r.po_id}`)}
                        >
                          {i === 0 ? (
                            <TableCell rowSpan={p.rows.length} sx={{ verticalAlign: 'top', py: 1, borderRight: '2px solid', borderColor: 'primary.main' }}>
                              <Typography variant="body2" sx={{ fontWeight: 700, lineHeight: 1.2, fontSize: '0.8rem' }}>{p.name}</Typography>
                              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>{p.supplier_code}{p.city ? ` · ${p.city}` : ''}</Typography>
                              <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 700 }}>{formatCurrency(p.total)}</Typography>
                            </TableCell>
                          ) : null}
                          <TableCell sx={{ py: 0.4, fontSize: '0.78rem' }}>{r.po_no}</TableCell>
                          <TableCell sx={{ py: 0.4, fontSize: '0.78rem', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {r.item_name || r.item_code}
                          </TableCell>
                          <TableCell align="right" sx={{ py: 0.4, fontSize: '0.78rem' }}>{Number(r.pending_qty).toLocaleString()}</TableCell>
                          <TableCell align="right" sx={{ py: 0.4, fontSize: '0.78rem', fontWeight: 600, color: 'error.main' }}>{formatCurrency(r.pending_value)}</TableCell>
                          <TableCell sx={{ py: 0.4 }}>
                            <FiExternalLink size={12} style={{ color: '#cbd5e1' }} />
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </Box>
            )}
          </Card>

          {/* Trend Chart */}
          <Card sx={{ borderRadius: 2, boxShadow: 'none', border: '1px solid', borderColor: 'divider' }}>
            <Box sx={{ px: 2, pt: 1.25, pb: 1, borderBottom: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>PO Value Trend</Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                <Chip label="Last 12 months" size="small" variant="outlined" sx={{ height: 18, fontSize: '0.65rem' }} />
                <Button
                  size="small"
                  endIcon={<FiArrowRight size={11} />}
                  onClick={() => navigate('/purchase/reports')}
                  sx={{ textTransform: 'none', fontSize: '0.73rem', py: 0.25, minWidth: 0 }}
                >
                  Reports
                </Button>
              </Stack>
            </Box>
            <CardContent sx={{ pt: 1.5, pb: '12px !important' }}>
              {trend.length === 0 ? (
                <Box sx={{ height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography variant="body2" color="text.secondary">No purchase data available</Typography>
                </Box>
              ) : (
                <AreaTrendChart data={trend} xKey="month" yKey="po_value" height={180} valueFormatter={(v) => formatCompactCurrency(v)} />
              )}
            </CardContent>
          </Card>

        </Box>{/* end right main */}
      </Box>{/* end two-col */}
    </Box>
  );
};

export default PurchaseDashboard;
