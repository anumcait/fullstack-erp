import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card, CardContent, Box, Typography, Stack, Button, Divider,
  LinearProgress, Chip, Avatar, List, ListItem, Skeleton,
  Tooltip, IconButton, Table, TableHead, TableRow, TableCell, TableBody,
} from '@mui/material';
import {
  FiCalendar, FiRefreshCw, FiTrendingUp, FiCheckCircle, FiClock,
  FiPlus, FiChevronRight, FiArrowRight, FiCpu, FiSettings,
} from 'react-icons/fi';
import axios from 'axios';
import { useToast } from '../../../context/ToastContext';
import PageHeader from '../../Common/PageHeader';
import StatusChip from '../../Common/StatusChip';
import { formatDate } from '../../../utils/format';

const QUICK_LINKS = [
  { label: 'New Schedule', to: '/planning/schedule/add', icon: FiCalendar },
  { label: 'MRP Run', to: '/planning/mrp/add', icon: FiRefreshCw },
  { label: 'Capacity Plan', to: '/planning/capacity/add', icon: FiTrendingUp },
  { label: 'Schedules', to: '/planning/schedule', icon: FiClock },
  { label: 'Reports', to: '/planning/reports', icon: FiArrowRight },
  { label: 'Settings', to: '/planning/settings', icon: FiSettings },
];

const KPI_CONFIG = [
  { key: 'plannedSchedules', label: 'Planned Schedules', icon: FiCalendar, color: '#3b82f6', to: '/planning/schedule' },
  { key: 'inProgressSchedules', label: 'In Progress', icon: FiClock, color: '#f59e0b', to: '/planning/schedule' },
  { key: 'completedSchedules', label: 'Completed', icon: FiCheckCircle, color: '#10b981', to: '/planning/schedule' },
  { key: 'totalMRPRuns', label: 'MRP Runs', icon: FiRefreshCw, color: '#0ea5e9', to: '/planning/mrp' },
  { key: 'totalMRPPlanned', label: 'Planned Orders (MRP)', icon: FiTrendingUp, color: '#14b8a6', to: '/planning/mrp', format: 'num' },
  { key: 'capacityPlans', label: 'Capacity Plans', icon: FiCpu, color: '#a855f7', to: '/planning/capacity' },
  { key: 'avgLoad', label: 'Avg Load %', icon: FiTrendingUp, color: '#ed6c02', to: '/planning/capacity', format: 'pct' },
  { key: 'activeSchedules', label: 'Active Schedules', icon: FiCalendar, color: '#64748b', to: '/planning/schedule' },
];

const KpiRow = ({ config, stats, loading, onClick }) => {
  const Icon = config.icon;
  const raw = stats?.[config.key];
  const value = config.format === 'pct' ? `${Number(raw || 0).toFixed(0)}%` : (raw ?? '—');

  return (
    <Box
      onClick={onClick}
      sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 1.5, py: 1, cursor: 'pointer', borderRadius: 1, transition: 'background 0.15s', '&:hover': { bgcolor: 'action.hover' }, '&:hover .kpi-arr': { opacity: 1 } }}
    >
      <Box sx={{ width: 3, height: 28, borderRadius: 2, bgcolor: config.color, flexShrink: 0 }} />
      <Box sx={{ color: config.color, display: 'flex', flexShrink: 0 }}><Icon size={14} /></Box>
      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500, flex: 1, lineHeight: 1.2 }}>{config.label}</Typography>
      {loading ? <Skeleton width={28} height={20} /> : (
        <Typography variant="body2" sx={{ fontWeight: 700, color: config.color, fontSize: '0.9rem', flexShrink: 0 }}>{value ?? '—'}</Typography>
      )}
      <FiChevronRight size={12} className="kpi-arr" style={{ opacity: 0, color: '#94a3b8', flexShrink: 0, transition: 'opacity 0.15s' }} />
    </Box>
  );
};

const PlanningDashboard = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchData = () => {
    setLoading(true);
    axios.get('/api/erp/planning/dashboard')
      .then(({ data }) => setStats(data))
      .catch(() => showToast('Failed to load dashboard', 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, [refreshKey]);

  const completedPct = stats ? Math.min(100, (Number(stats.completedSchedules) / (Number(stats.activeSchedules + stats.completedSchedules) || 1)) * 100) : 0;

  return (
    <Box sx={{ p: { xs: 1.5, md: 2 } }}>
      <PageHeader
        title="Production Planning & Control"
        subtitle="Schedules, MRP runs & capacity planning — the control tower for production"
        icon={<FiCalendar size={20} />}
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
          onClick={() => navigate('/planning/schedule/add')}
          sx={{ textTransform: 'none', borderRadius: 1.5, py: 0.5, fontSize: '0.78rem', ml: 'auto' }}>
          New Schedule
        </Button>
      </Stack>

      <Card sx={{ mb: 2, boxShadow: 'none', border: '1px solid', borderColor: 'divider', borderRadius: 2, bgcolor: 'background.paper' }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, p: 2, gap: { xs: 2, sm: 0 } }}>
          {[
            { label: 'Planned Schedules', value: stats?.plannedSchedules ?? null, sub: `${stats?.activeSchedules ?? '—'} active`, accent: 'primary.main' },
            { label: 'In Progress', value: stats?.inProgressSchedules ?? null, sub: 'On the shop floor', accent: '#ed6c02' },
            { label: 'Avg Capacity Load', value: stats ? `${Number(stats.avgLoad || 0).toFixed(0)}%` : null, sub: `${stats?.capacityPlans ?? '—'} plans`, accent: Number(stats?.avgLoad) > 85 ? 'error.main' : 'success.main' },
            { label: 'MRP Runs', value: stats?.totalMRPRuns ?? null, sub: `${Number(stats?.totalMRPPlanned || 0).toLocaleString()} planned units`, accent: '#0ea5e9' },
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
              <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: 'text.secondary', fontSize: '10px' }}>Completion</Typography>
            </Box>
            <Box sx={{ p: 1.5 }}>
              {loading ? <Stack spacing={1}>{[1, 2].map(i => <Skeleton key={i} height={28} />)}</Stack> : stats ? (
                <Stack spacing={1.5}>
                  <Box>
                    <Stack direction="row" justifyContent="space-between" alignItems="baseline">
                      <Typography variant="caption" color="text.secondary">Completion Rate</Typography>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: 'success.main' }}>{completedPct.toFixed(0)}%</Typography>
                    </Stack>
                    <Box sx={{ height: 6, borderRadius: 3, bgcolor: 'action.hover', mt: 0.5 }}>
                      <Box sx={{ height: '100%', width: `${completedPct}%`, borderRadius: 3, bgcolor: '#10b981', transition: 'width 0.4s ease' }} />
                    </Box>
                  </Box>
                  <Box>
                    <Stack direction="row" justifyContent="space-between" alignItems="baseline">
                      <Typography variant="caption" color="text.secondary">Capacity Load</Typography>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: Number(stats.avgLoad) > 85 ? 'error.main' : 'primary.main' }}>{Number(stats.avgLoad || 0).toFixed(0)}%</Typography>
                    </Stack>
                    <Box sx={{ height: 6, borderRadius: 3, bgcolor: 'action.hover', mt: 0.5 }}>
                      <Box sx={{ height: '100%', width: `${Math.min(100, Number(stats.avgLoad || 0))}%`, borderRadius: 3, bgcolor: Number(stats.avgLoad) > 85 ? '#ef4444' : '#3b82f6', transition: 'width 0.4s ease' }} />
                    </Box>
                  </Box>
                </Stack>
              ) : <Typography variant="caption" color="text.secondary">No data</Typography>}
              <Button size="small" endIcon={<FiArrowRight size={12} />} onClick={() => navigate('/planning/reports')} sx={{ mt: 1.5, textTransform: 'none', fontSize: '0.73rem', p: 0 }}>Reports</Button>
            </Box>
          </Card>
        </Box>

        <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box sx={{ display: { xs: 'flex', md: 'none' }, gap: 1, flexWrap: 'wrap' }}>
            {KPI_CONFIG.map((cfg) => {
              const Icon = cfg.icon;
              const raw = stats?.[cfg.key];
              const val = cfg.format === 'pct' ? `${Number(raw || 0).toFixed(0)}%` : raw;
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

          <Card sx={{ borderRadius: 2, boxShadow: 'none', border: '1px solid', borderColor: 'divider' }}>
            <Box sx={{ px: 2, pt: 1.25, pb: 1, borderBottom: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <FiClock size={15} style={{ color: '#64748b' }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Recent Schedules</Typography>
              </Stack>
              <Chip label={stats?.recentSchedules?.length || 0} size="small" color="primary" variant="outlined" sx={{ height: 18, fontSize: '0.65rem' }} />
            </Box>
            {loading ? <Box sx={{ p: 2 }}><LinearProgress /></Box> : !stats?.recentSchedules?.length ? (
              <Box sx={{ p: 2, textAlign: 'center' }}><Typography variant="body2" color="text.secondary">No schedules yet</Typography></Box>
            ) : (
              <Box sx={{ overflowX: 'auto' }}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'grey.50' }}>
                      <TableCell sx={{ fontWeight: 700, py: 0.75, fontSize: '0.73rem', color: 'text.secondary' }}>Schedule</TableCell>
                      <TableCell sx={{ fontWeight: 700, py: 0.75, fontSize: '0.73rem', color: 'text.secondary' }}>Order</TableCell>
                      <TableCell sx={{ fontWeight: 700, py: 0.75, fontSize: '0.73rem', color: 'text.secondary' }}>Machine</TableCell>
                      <TableCell sx={{ fontWeight: 700, py: 0.75, fontSize: '0.73rem', color: 'text.secondary' }}>Date</TableCell>
                      <TableCell sx={{ fontWeight: 700, py: 0.75, fontSize: '0.73rem', color: 'text.secondary' }}>Status</TableCell>
                      <TableCell sx={{ width: 28 }} />
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {stats.recentSchedules.map((s) => (
                      <TableRow key={s.id} hover sx={{ cursor: 'pointer' }} onClick={() => navigate(`/planning/schedule/view/${s.id}`)}>
                        <TableCell sx={{ py: 0.4, fontSize: '0.78rem', fontWeight: 600 }}>{s.schedule_no}</TableCell>
                        <TableCell sx={{ py: 0.4, fontSize: '0.78rem' }}>{s.order?.order_no || s.order_id || '—'}</TableCell>
                        <TableCell sx={{ py: 0.4, fontSize: '0.78rem' }}>{s.machine?.machine_code || s.machine_id || '—'}</TableCell>
                        <TableCell sx={{ py: 0.4, fontSize: '0.78rem' }}>{s.scheduled_date ? formatDate(s.scheduled_date) : '—'}</TableCell>
                        <TableCell sx={{ py: 0.4, fontSize: '0.78rem' }}><StatusChip status={s.status} /></TableCell>
                        <TableCell sx={{ py: 0.4 }}><FiChevronRight size={12} style={{ color: '#cbd5e1' }} /></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
            )}
          </Card>

          <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
            <Card sx={{ borderRadius: 2, boxShadow: 'none', border: '1px solid', borderColor: 'divider', flex: 1 }}>
              <Box sx={{ px: 2, pt: 1.25, pb: 1, borderBottom: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <FiRefreshCw size={15} style={{ color: '#64748b' }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Recent MRP Runs</Typography>
                </Stack>
                <Chip label={stats?.recentMRP?.length || 0} size="small" color="info" variant="outlined" sx={{ height: 18, fontSize: '0.65rem' }} />
              </Box>
              {loading ? <Box sx={{ p: 2 }}><LinearProgress /></Box> : !stats?.recentMRP?.length ? (
                <Box sx={{ p: 2, textAlign: 'center' }}><Typography variant="body2" color="text.secondary">No MRP runs</Typography></Box>
              ) : (
                <Box sx={{ overflowX: 'auto' }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ bgcolor: 'grey.50' }}>
                        <TableCell sx={{ fontWeight: 700, py: 0.75, fontSize: '0.73rem', color: 'text.secondary' }}>Run No</TableCell>
                        <TableCell sx={{ fontWeight: 700, py: 0.75, fontSize: '0.73rem', color: 'text.secondary' }}>Item</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700, py: 0.75, fontSize: '0.73rem', color: 'text.secondary' }}>Net Req</TableCell>
                        <TableCell sx={{ fontWeight: 700, py: 0.75, fontSize: '0.73rem', color: 'text.secondary' }}>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {stats.recentMRP.map((m) => (
                        <TableRow key={m.id} hover sx={{ cursor: 'pointer' }} onClick={() => navigate(`/planning/mrp/view/${m.id}`)}>
                          <TableCell sx={{ py: 0.4, fontSize: '0.78rem', fontWeight: 600 }}>{m.run_no}</TableCell>
                          <TableCell sx={{ py: 0.4, fontSize: '0.78rem' }}>{m.item_name || '—'}</TableCell>
                          <TableCell align="right" sx={{ py: 0.4, fontSize: '0.78rem' }}>{Number(m.net_requirement || 0).toLocaleString()}</TableCell>
                          <TableCell sx={{ py: 0.4, fontSize: '0.78rem' }}><StatusChip status={m.status} /></TableCell>
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
                  <FiTrendingUp size={15} style={{ color: '#64748b' }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Capacity Plans</Typography>
                </Stack>
                <Chip label={stats?.recentCapacity?.length || 0} size="small" color="secondary" variant="outlined" sx={{ height: 18, fontSize: '0.65rem' }} />
              </Box>
              {loading ? <Box sx={{ p: 2 }}><LinearProgress /></Box> : !stats?.recentCapacity?.length ? (
                <Box sx={{ p: 2, textAlign: 'center' }}><Typography variant="body2" color="text.secondary">No capacity plans</Typography></Box>
              ) : (
                <Box sx={{ overflowX: 'auto' }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ bgcolor: 'grey.50' }}>
                        <TableCell sx={{ fontWeight: 700, py: 0.75, fontSize: '0.73rem', color: 'text.secondary' }}>Plan</TableCell>
                        <TableCell sx={{ fontWeight: 700, py: 0.75, fontSize: '0.73rem', color: 'text.secondary' }}>Work Center</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700, py: 0.75, fontSize: '0.73rem', color: 'text.secondary' }}>Load %</TableCell>
                        <TableCell sx={{ fontWeight: 700, py: 0.75, fontSize: '0.73rem', color: 'text.secondary' }}>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {stats.recentCapacity.map((c) => (
                        <TableRow key={c.id} hover sx={{ cursor: 'pointer' }} onClick={() => navigate(`/planning/capacity/view/${c.id}`)}>
                          <TableCell sx={{ py: 0.4, fontSize: '0.78rem', fontWeight: 600 }}>{c.plan_no}</TableCell>
                          <TableCell sx={{ py: 0.4, fontSize: '0.78rem' }}>{c.work_center || '—'}</TableCell>
                          <TableCell align="right" sx={{ py: 0.4, fontSize: '0.78rem', fontWeight: 700, color: Number(c.load_percentage) > 85 ? 'error.main' : 'text.primary' }}>{Number(c.load_percentage || 0).toFixed(0)}%</TableCell>
                          <TableCell sx={{ py: 0.4, fontSize: '0.78rem' }}><StatusChip status={c.status} /></TableCell>
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

export default PlanningDashboard;
