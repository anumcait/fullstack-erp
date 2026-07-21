import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card, CardContent, Box, Typography, Stack, Button, Divider,
  LinearProgress, Chip, List, ListItem, Skeleton, Tooltip, IconButton,
  Table, TableHead, TableRow, TableCell, TableBody,
} from '@mui/material';
import {
  FiCpu, FiPlay, FiCheckCircle, FiAlertTriangle, FiClock,
  FiPlus, FiRefreshCw, FiChevronRight, FiArrowRight, FiTool,
} from 'react-icons/fi';
import axios from 'axios';
import { useToast } from '../../../context/ToastContext';
import PageHeader from '../../Common/PageHeader';
import StatusChip from '../../Common/StatusChip';
import { formatDate } from '../../../utils/format';

const QUICK_LINKS = [
  { label: 'New Job Order', to: '/purchase/job-orders/add', icon: FiPlus },
  { label: 'Daily Entry', to: '/production/daily-entry/add', icon: FiClock },
  { label: 'Downtime', to: '/production/downtime/add', icon: FiAlertTriangle },
  { label: 'Machines', to: '/production/machines', icon: FiCpu },
  { label: 'Reports', to: '/production/reports', icon: FiArrowRight },
  { label: 'Settings', to: '/production/settings', icon: FiTool },
];

const KPI_CONFIG = [
  { key: 'total_orders', label: 'Total Orders', icon: FiCpu, color: '#3b82f6', to: '/production/orders' },
  { key: 'active_orders', label: 'Active Orders', icon: FiPlay, color: '#f59e0b', to: '/production/orders' },
  { key: 'completed_orders', label: 'Completed', icon: FiCheckCircle, color: '#10b981', to: '/production/orders' },
  { key: 'active_machines', label: 'Active Machines', icon: FiCpu, color: '#0ea5e9', to: '/production/machines' },
  { key: 'today_entries', label: 'Entries Today', icon: FiClock, color: '#14b8a6', to: '/production/daily-entry' },
  { key: 'today_produced', label: 'Produced Today', icon: FiCheckCircle, color: '#22c55e', to: '/production/daily-entry', format: 'num' },
  { key: 'open_downtime', label: 'Open Downtime', icon: FiAlertTriangle, color: '#ef4444', to: '/production/downtime', alert: true },
  { key: 'total_machines', label: 'Total Machines', icon: FiCpu, color: '#64748b', to: '/production/machines' },
];

const KpiRow = ({ config, stats, loading, onClick }) => {
  const Icon = config.icon;
  const raw = stats?.[config.key];
  const value = config.format === 'num' ? Number(raw || 0).toLocaleString() : raw;
  const isAlert = config.alert && Number(raw) > 0;
  return (
    <Box onClick={onClick} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 1.5, py: 1, cursor: 'pointer', borderRadius: 1, transition: 'background 0.15s', '&:hover': { bgcolor: 'action.hover' }, '&:hover .kpi-arr': { opacity: 1 } }}>
      <Box sx={{ width: 3, height: 28, borderRadius: 2, bgcolor: config.color, flexShrink: 0 }} />
      <Box sx={{ color: config.color, display: 'flex', flexShrink: 0 }}><Icon size={14} /></Box>
      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500, flex: 1, lineHeight: 1.2 }}>{config.label}</Typography>
      {loading ? <Skeleton width={28} height={20} /> : (
        <Typography variant="body2" sx={{ fontWeight: 700, color: isAlert ? 'error.main' : config.color, fontSize: '0.9rem', flexShrink: 0 }}>{value ?? '—'}</Typography>
      )}
      <FiChevronRight size={12} className="kpi-arr" style={{ opacity: 0, color: '#94a3b8', flexShrink: 0, transition: 'opacity 0.15s' }} />
    </Box>
  );
};

const ProductionDashboard = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchData = () => {
    setLoading(true);
    axios.get('/api/erp/production/dashboard')
      .then(({ data }) => setStats(data))
      .catch(() => showToast('Failed to load dashboard', 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, [refreshKey]);

  const planned = Number(stats?.planned_qty || 0);
  const produced = Number(stats?.produced_qty || 0);
  const achievementPct = planned > 0 ? Math.min(100, (produced / planned) * 100) : 0;
  const downtimeHrs = stats ? (Number(stats.total_downtime_min || 0) / 60).toFixed(1) : 0;

  return (
    <Box sx={{ p: { xs: 1.5, md: 2 } }}>
      <PageHeader
        title="Production & Shop Floor"
        subtitle="Orders, machines, daily output & downtime — real-time shop floor control"
        icon={<FiCpu size={20} />}
        actions={
          <Stack direction="row" spacing={1} alignItems="center">
            <Tooltip title="Refresh">
              <span>
                <IconButton size="small" onClick={() => setRefreshKey(k => k + 1)} disabled={loading}><FiRefreshCw size={15} /></IconButton>
              </span>
            </Tooltip>
          </Stack>
        }
      />

      <Stack direction="row" spacing={0.75} sx={{ mb: 2, flexWrap: 'wrap', gap: 0.75 }}>
        {QUICK_LINKS.map((q) => {
          const Icon = q.icon;
          return (
            <Button key={q.label} size="small" variant="outlined" startIcon={<Icon size={13} />}
              onClick={() => navigate(q.to)}
              sx={{ textTransform: 'none', borderRadius: 1.5, py: 0.5, fontSize: '0.78rem', color: 'text.secondary', borderColor: 'divider', '&:hover': { borderColor: 'primary.main', color: 'primary.main' } }}>
              {q.label}
            </Button>
          );
        })}
        <Button size="small" variant="contained" startIcon={<FiPlus size={13} />}
          onClick={() => navigate('/purchase/job-orders/add')}
          sx={{ textTransform: 'none', borderRadius: 1.5, py: 0.5, fontSize: '0.78rem', ml: 'auto' }}>
          New Job Order
        </Button>
      </Stack>

      <Card sx={{ mb: 2, boxShadow: 'none', border: '1px solid', borderColor: 'divider', borderRadius: 2, bgcolor: 'background.paper' }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, p: 2, gap: { xs: 2, sm: 0 } }}>
          {[
            { label: 'Total Orders', value: stats?.total_orders ?? null, sub: `${stats?.active_orders ?? '—'} active`, accent: 'primary.main' },
            { label: 'Achievement', value: stats ? `${achievementPct.toFixed(0)}%` : null, sub: `${produced.toLocaleString()} / ${planned.toLocaleString()} units`, accent: achievementPct > 80 ? 'success.main' : achievementPct > 50 ? '#ed6c02' : 'error.main' },
            { label: 'Produced Today', value: stats ? Number(stats.today_produced || 0).toLocaleString() : null, sub: `${Number(stats?.today_rejected || 0).toLocaleString()} rejected`, accent: 'success.main' },
            { label: 'Downtime', value: stats ? `${downtimeHrs}h` : null, sub: `${stats?.open_downtime ?? '—'} open`, accent: Number(stats?.open_downtime) > 0 ? 'error.main' : 'text.secondary' },
          ].map((item, i, arr) => (
            <Box key={item.label} sx={{ flex: 1, px: { xs: 1, sm: 2.5 }, borderRight: { xs: 'none', sm: i < arr.length - 1 ? '1px solid' : 'none' }, borderColor: 'divider' }}>
              <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, color: 'text.secondary', mb: 0.5 }}>{item.label}</Typography>
              {loading ? <Skeleton width={60} height={32} /> : (
                <Typography sx={{ fontSize: '1.5rem', fontWeight: 800, lineHeight: 1, color: item.accent, letterSpacing: -0.5 }}>{item.value ?? '—'}</Typography>
              )}
              <Typography sx={{ fontSize: '0.7rem', color: 'text.secondary', mt: 0.4 }}>{item.sub}</Typography>
            </Box>
          ))}
        </Box>
      </Card>

      <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
        <Box sx={{ width: 230, flexShrink: 0, display: { xs: 'none', md: 'flex' }, flexDirection: 'column', gap: 1.5 }}>
          <Card sx={{ borderRadius: 2, boxShadow: 'none', border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
            <Box sx={{ px: 1.5, py: 1, borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'grey.50' }}>
              <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: 'text.secondary', fontSize: '10px' }}>Overview</Typography>
            </Box>
            <Stack divider={<Divider />}>
              {KPI_CONFIG.map((cfg) => <KpiRow key={cfg.key} config={cfg} stats={stats} loading={loading} onClick={() => cfg.to && navigate(cfg.to)} />)}
            </Stack>
          </Card>

          <Card sx={{ borderRadius: 2, boxShadow: 'none', border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
            <Box sx={{ px: 1.5, py: 1, borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'grey.50', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: 'text.secondary', fontSize: '10px' }}>Health</Typography>
              {Number(stats?.open_downtime) > 0 && <Chip label={`${stats.open_downtime} open`} size="small" color="error" variant="outlined" sx={{ height: 16, fontSize: '0.6rem' }} />}
            </Box>
            <Box sx={{ p: 1.5 }}>
              {loading ? <Stack spacing={1}>{[1, 2, 3].map(i => <Skeleton key={i} height={28} />)}</Stack> : stats ? (
                <Stack spacing={1.5}>
                  <Box>
                    <Stack direction="row" justifyContent="space-between" alignItems="baseline">
                      <Typography variant="caption" color="text.secondary">Order Achievement</Typography>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: achievementPct > 80 ? 'success.main' : '#ed6c02' }}>{achievementPct.toFixed(0)}%</Typography>
                    </Stack>
                    <Box sx={{ height: 6, borderRadius: 3, bgcolor: 'action.hover', mt: 0.5 }}>
                      <Box sx={{ height: '100%', width: `${achievementPct}%`, borderRadius: 3, bgcolor: achievementPct > 80 ? '#10b981' : achievementPct > 50 ? '#f59e0b' : '#ef4444', transition: 'width 0.4s ease' }} />
                    </Box>
                  </Box>
                  <Box>
                    <Stack direction="row" justifyContent="space-between" alignItems="baseline">
                      <Typography variant="caption" color="text.secondary">Machine Uptime</Typography>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main' }}>{stats.active_machines}/{stats.total_machines}</Typography>
                    </Stack>
                    <Box sx={{ height: 6, borderRadius: 3, bgcolor: 'action.hover', mt: 0.5 }}>
                      <Box sx={{ height: '100%', width: `${stats.total_machines ? (stats.active_machines / stats.total_machines) * 100 : 0}%`, borderRadius: 3, bgcolor: '#3b82f6', transition: 'width 0.4s ease' }} />
                    </Box>
                  </Box>
                  <Box>
                    <Stack direction="row" justifyContent="space-between" alignItems="baseline">
                      <Typography variant="caption" color="text.secondary">Open Downtime</Typography>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: Number(stats.open_downtime) > 0 ? 'error.main' : 'success.main' }}>{stats.open_downtime}</Typography>
                    </Stack>
                    <Box sx={{ height: 6, borderRadius: 3, bgcolor: 'action.hover', mt: 0.5 }}>
                      <Box sx={{ height: '100%', width: `${Math.min(100, Number(stats.open_downtime) * 10)}%`, borderRadius: 3, bgcolor: '#ef4444', transition: 'width 0.4s ease' }} />
                    </Box>
                  </Box>
                </Stack>
              ) : <Typography variant="caption" color="text.secondary">No data</Typography>}
              <Button size="small" endIcon={<FiArrowRight size={12} />} onClick={() => navigate('/production/reports')} sx={{ mt: 1.5, textTransform: 'none', fontSize: '0.73rem', p: 0 }}>Reports</Button>
            </Box>
          </Card>
        </Box>

        <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box sx={{ display: { xs: 'flex', md: 'none' }, gap: 1, flexWrap: 'wrap' }}>
            {KPI_CONFIG.map((cfg) => {
              const Icon = cfg.icon;
              const raw = stats?.[cfg.key];
              const val = cfg.format === 'num' ? Number(raw || 0).toLocaleString() : raw;
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

          {Number(stats?.open_downtime) > 0 && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 2, py: 1, borderRadius: 2, bgcolor: '#fef2f2', border: '1px solid #fecaca', cursor: 'pointer' }} onClick={() => navigate('/production/downtime')}>
              <FiAlertTriangle size={16} style={{ color: '#ef4444', flexShrink: 0 }} />
              <Typography variant="body2" sx={{ color: '#b91c1c', fontWeight: 600 }}>{stats.open_downtime} open downtime incident{Number(stats.open_downtime) !== 1 ? 's' : ''} — action required</Typography>
              <Button size="small" sx={{ ml: 'auto', textTransform: 'none', color: '#ef4444', fontSize: '0.75rem', py: 0.25 }} endIcon={<FiArrowRight size={12} />}>View</Button>
            </Box>
          )}

          <Card sx={{ borderRadius: 2, boxShadow: 'none', border: '1px solid', borderColor: 'divider' }}>
            <Box sx={{ px: 2, pt: 1.25, pb: 1, borderBottom: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <FiCpu size={15} style={{ color: '#64748b' }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Recent Production Orders</Typography>
              </Stack>
              <Chip label={stats?.recentOrders?.length || 0} size="small" color="primary" variant="outlined" sx={{ height: 18, fontSize: '0.65rem' }} />
            </Box>
            {loading ? <Box sx={{ p: 2 }}><LinearProgress /></Box> : !stats?.recentOrders?.length ? (
              <Box sx={{ p: 2, textAlign: 'center' }}><Typography variant="body2" color="text.secondary">No production orders yet</Typography></Box>
            ) : (
              <Box sx={{ overflowX: 'auto' }}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'grey.50' }}>
                      <TableCell sx={{ fontWeight: 700, py: 0.75, fontSize: '0.73rem', color: 'text.secondary' }}>Order</TableCell>
                      <TableCell sx={{ fontWeight: 700, py: 0.75, fontSize: '0.73rem', color: 'text.secondary' }}>Product</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, py: 0.75, fontSize: '0.73rem', color: 'text.secondary' }}>Produced / Plan</TableCell>
                      <TableCell sx={{ fontWeight: 700, py: 0.75, fontSize: '0.73rem', color: 'text.secondary' }}>Status</TableCell>
                      <TableCell sx={{ width: 28 }} />
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {stats.recentOrders.map((o) => (
                      <TableRow key={o.id} hover sx={{ cursor: 'pointer' }} onClick={() => navigate(`/purchase/job-orders/view/${o.id}`)}>
                        <TableCell sx={{ py: 0.4, fontSize: '0.78rem', fontWeight: 600 }}>{o.order_no}</TableCell>
                        <TableCell sx={{ py: 0.4, fontSize: '0.78rem' }}>{o.product_name || '—'}</TableCell>
                        <TableCell align="right" sx={{ py: 0.4, fontSize: '0.78rem' }}>{Number(o.produced_quantity || 0).toLocaleString()} / {Number(o.planned_quantity || 0).toLocaleString()}</TableCell>
                        <TableCell sx={{ py: 0.4, fontSize: '0.78rem' }}><StatusChip status={o.status} /></TableCell>
                        <TableCell sx={{ py: 0.4 }}><FiChevronRight size={12} style={{ color: '#cbd5e1' }} /></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
            )}
            <Box sx={{ px: 2, py: 1, textAlign: 'center', borderTop: '1px solid', borderColor: 'divider' }}>
              <Button size="small" sx={{ textTransform: 'none', fontSize: '0.73rem' }} onClick={() => navigate('/production/orders')}>View All Orders →</Button>
            </Box>
          </Card>

          <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
            <Card sx={{ borderRadius: 2, boxShadow: 'none', border: '1px solid', borderColor: 'divider', flex: 1 }}>
              <Box sx={{ px: 2, pt: 1.25, pb: 1, borderBottom: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <FiClock size={15} style={{ color: '#64748b' }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Today's Entries</Typography>
                </Stack>
                <Chip label={stats?.todayEntriesList?.length || 0} size="small" color="info" variant="outlined" sx={{ height: 18, fontSize: '0.65rem' }} />
              </Box>
              {loading ? <Box sx={{ p: 2 }}><LinearProgress /></Box> : !stats?.todayEntriesList?.length ? (
                <Box sx={{ p: 2, textAlign: 'center' }}><Typography variant="body2" color="text.secondary">No entries today</Typography></Box>
              ) : (
                <Box sx={{ overflowX: 'auto' }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ bgcolor: 'grey.50' }}>
                        <TableCell sx={{ fontWeight: 700, py: 0.75, fontSize: '0.73rem', color: 'text.secondary' }}>Machine</TableCell>
                        <TableCell sx={{ fontWeight: 700, py: 0.75, fontSize: '0.73rem', color: 'text.secondary' }}>Order</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700, py: 0.75, fontSize: '0.73rem', color: 'text.secondary' }}>Prod</TableCell>
                        <TableCell sx={{ fontWeight: 700, py: 0.75, fontSize: '0.73rem', color: 'text.secondary' }}>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {stats.todayEntriesList.map((e) => (
                        <TableRow key={e.id} hover>
                          <TableCell sx={{ py: 0.4, fontSize: '0.78rem', fontWeight: 600 }}>{e.machine_code || '—'}</TableCell>
                          <TableCell sx={{ py: 0.4, fontSize: '0.78rem' }}>{e.order_no || '—'}</TableCell>
                          <TableCell align="right" sx={{ py: 0.4, fontSize: '0.78rem' }}>{Number(e.produced_qty || 0).toLocaleString()}</TableCell>
                          <TableCell sx={{ py: 0.4, fontSize: '0.78rem' }}><StatusChip status={e.status} /></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Box>
              )}
            </Card>

            <Card sx={{ borderRadius: 2, boxShadow: 'none', border: '1px solid', borderColor: 'divider', flex: 1 }}>
              <Box sx={{ px: 2, pt: 1.25, pb: 1, borderBottom: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <FiAlertTriangle size={15} style={{ color: '#64748b' }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Recent Downtime</Typography>
                </Stack>
                <Chip label={stats?.recentDowntime?.length || 0} size="small" color="warning" variant="outlined" sx={{ height: 18, fontSize: '0.65rem' }} />
              </Box>
              {loading ? <Box sx={{ p: 2 }}><LinearProgress /></Box> : !stats?.recentDowntime?.length ? (
                <Box sx={{ p: 2, textAlign: 'center' }}><Typography variant="body2" color="text.secondary">No downtime logged</Typography></Box>
              ) : (
                <Box sx={{ overflowX: 'auto' }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ bgcolor: 'grey.50' }}>
                        <TableCell sx={{ fontWeight: 700, py: 0.75, fontSize: '0.73rem', color: 'text.secondary' }}>Machine</TableCell>
                        <TableCell sx={{ fontWeight: 700, py: 0.75, fontSize: '0.73rem', color: 'text.secondary' }}>Category</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700, py: 0.75, fontSize: '0.73rem', color: 'text.secondary' }}>Min</TableCell>
                        <TableCell sx={{ fontWeight: 700, py: 0.75, fontSize: '0.73rem', color: 'text.secondary' }}>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {stats.recentDowntime.map((d) => (
                        <TableRow key={d.id} hover sx={{ cursor: 'pointer' }} onClick={() => navigate('/production/downtime')}>
                          <TableCell sx={{ py: 0.4, fontSize: '0.78rem', fontWeight: 600 }}>{d.machine_code || '—'}</TableCell>
                          <TableCell sx={{ py: 0.4, fontSize: '0.78rem' }}>{d.category || '—'}</TableCell>
                          <TableCell align="right" sx={{ py: 0.4, fontSize: '0.78rem' }}>{d.duration_minutes}</TableCell>
                          <TableCell sx={{ py: 0.4, fontSize: '0.78rem' }}><StatusChip status={d.status} /></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Box>
              )}
            </Card>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default ProductionDashboard;
