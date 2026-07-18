import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card, CardContent, Box, Typography, Stack, Button, Divider,
  LinearProgress, Chip, Avatar, List, ListItem, Skeleton,
  Tooltip, IconButton, Table, TableHead, TableRow, TableCell, TableBody,
} from '@mui/material';
import {
  FiTool, FiCpu, FiClock, FiAlertTriangle, FiCheckCircle,
  FiCalendar, FiPlus, FiRefreshCw, FiChevronRight, FiArrowRight,
  FiSettings,
} from 'react-icons/fi';
import axios from 'axios';
import { useToast } from '../../../context/ToastContext';
import PageHeader from '../../Common/PageHeader';
import StatusChip from '../../Common/StatusChip';
import { formatDate } from '../../../utils/format';

const QUICK_LINKS = [
  { label: 'Add Machine', to: '/maintenance/machines/add', icon: FiCpu },
  { label: 'Add Asset', to: '/maintenance/assets/add', icon: FiTool },
  { label: 'Schedule PM', to: '/maintenance/schedule/add', icon: FiClock },
  { label: 'Machine List', to: '/maintenance/machines', icon: FiSettings },
  { label: 'Asset List', to: '/maintenance/assets', icon: FiTool },
  { label: 'Reports', to: '/maintenance/reports', icon: FiArrowRight },
];

const KPI_CONFIG = [
  { key: 'totalMachines', label: 'Total Machines', icon: FiCpu, color: '#3b82f6', to: '/maintenance/machines' },
  { key: 'activeMachines', label: 'Active Machines', icon: FiCheckCircle, color: '#10b981', to: '/maintenance/machines' },
  { key: 'underMaintenance', label: 'Under Maintenance', icon: FiSettings, color: '#f59e0b', to: '/maintenance/machines' },
  { key: 'totalAssets', label: 'Total Assets', icon: FiTool, color: '#0ea5e9', to: '/maintenance/assets' },
  { key: 'activeAssets', label: 'Active Assets', icon: FiCheckCircle, color: '#22c55e', to: '/maintenance/assets' },
  { key: 'pendingPM', label: 'Pending PM Tasks', icon: FiClock, color: '#a855f7', to: '/maintenance/schedule' },
  { key: 'overduePM', label: 'Overdue PM Tasks', icon: FiAlertTriangle, color: '#ef4444', to: '/maintenance/schedule', alert: true },
  { key: 'completedThisMonth', label: 'Completed (Month)', icon: FiCheckCircle, color: '#14b8a6', to: '/maintenance/schedule' },
];

const KpiRow = ({ config, stats, loading, onClick }) => {
  const Icon = config.icon;
  const value = stats?.[config.key];
  const isAlert = config.alert && Number(value) > 0;

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

const MaintenanceDashboard = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchData = () => {
    setLoading(true);
    axios.get('/api/erp/maintenance/dashboard')
      .then(({ data }) => setStats(data))
      .catch(() => showToast('Failed to load dashboard', 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, [refreshKey]);

  const overduePct = stats ? Math.min(100, (Number(stats.overduePM) / (Number(stats.totalSchedules) || 1)) * 100) : 0;
  const pendingPct = stats ? Math.min(100, (Number(stats.pendingPM) / (Number(stats.totalSchedules) || 1)) * 100) : 0;
  const machineUtilPct = stats ? Math.min(100, (Number(stats.activeMachines) / (Number(stats.totalMachines) || 1)) * 100) : 0;

  return (
    <Box sx={{ p: { xs: 1.5, md: 2 } }}>
      <PageHeader
        title="Plant Maintenance"
        subtitle="Machine health, asset register, preventive maintenance & task tracking"
        icon={<FiSettings size={20} />}
        actions={
          <Stack direction="row" spacing={1} alignItems="center">
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
          onClick={() => navigate('/maintenance/schedule/add')}
          sx={{ textTransform: 'none', borderRadius: 1.5, py: 0.5, fontSize: '0.78rem', ml: 'auto' }}
        >
          New PM Task
        </Button>
      </Stack>

      <Card sx={{ mb: 2, boxShadow: 'none', border: '1px solid', borderColor: 'divider', borderRadius: 2, bgcolor: 'background.paper' }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, p: 2, gap: { xs: 2, sm: 0 } }}>
          {[
            { label: 'Total Machines', value: stats?.totalMachines ?? null, sub: `${stats?.activeMachines ?? '—'} active`, accent: 'primary.main' },
            { label: 'Utilization', value: stats ? `${machineUtilPct.toFixed(0)}%` : null, sub: `${stats?.underMaintenance ?? '—'} under maintenance`, accent: machineUtilPct > 80 ? 'success.main' : machineUtilPct > 50 ? '#ed6c02' : 'error.main' },
            { label: 'Pending PM Tasks', value: stats?.pendingPM ?? null, sub: `${stats?.overduePM ?? '—'} overdue`, accent: Number(stats?.overduePM) > 0 ? 'error.main' : '#ed6c02' },
            { label: 'Completed This Month', value: stats?.completedThisMonth ?? null, sub: `${stats?.totalSchedules ?? '—'} total tasks`, accent: 'success.main' },
          ].map((item, i, arr) => (
            <Box key={item.label} sx={{ flex: 1, px: { xs: 1, sm: 2.5 }, borderRight: { xs: 'none', sm: i < arr.length - 1 ? '1px solid' : 'none' }, borderColor: 'divider' }}>
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

      <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
        <Box sx={{ width: 230, flexShrink: 0, display: { xs: 'none', md: 'flex' }, flexDirection: 'column', gap: 1.5 }}>
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

          <Card sx={{ borderRadius: 2, boxShadow: 'none', border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
            <Box sx={{ px: 1.5, py: 1, borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'grey.50', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: 'text.secondary', fontSize: '10px' }}>
                Schedule Health
              </Typography>
              {Number(stats?.overduePM) > 0 && (
                <Chip label={`${stats.overduePM} overdue`} size="small" color="error" variant="outlined" sx={{ height: 16, fontSize: '0.6rem' }} />
              )}
            </Box>
            <Box sx={{ p: 1.5 }}>
              {loading ? (
                <Stack spacing={1}>{[1, 2, 3].map(i => <Skeleton key={i} height={28} />)}</Stack>
              ) : stats ? (
                <Stack spacing={1.5}>
                  <Box>
                    <Stack direction="row" justifyContent="space-between" alignItems="baseline">
                      <Typography variant="caption" color="text.secondary">Machine Utilization</Typography>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main' }}>{machineUtilPct.toFixed(0)}%</Typography>
                    </Stack>
                    <Box sx={{ height: 6, borderRadius: 3, bgcolor: 'action.hover', mt: 0.5 }}>
                      <Box sx={{ height: '100%', width: `${machineUtilPct}%`, borderRadius: 3, bgcolor: machineUtilPct > 80 ? '#10b981' : machineUtilPct > 50 ? '#f59e0b' : '#ef4444', transition: 'width 0.4s ease' }} />
                    </Box>
                  </Box>
                  <Box>
                    <Stack direction="row" justifyContent="space-between" alignItems="baseline">
                      <Typography variant="caption" color="text.secondary">Overdue Tasks</Typography>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: 'error.main' }}>{overduePct.toFixed(0)}%</Typography>
                    </Stack>
                    <Box sx={{ height: 6, borderRadius: 3, bgcolor: 'action.hover', mt: 0.5 }}>
                      <Box sx={{ height: '100%', width: `${overduePct}%`, borderRadius: 3, bgcolor: '#ef4444', transition: 'width 0.4s ease' }} />
                    </Box>
                  </Box>
                  <Box>
                    <Stack direction="row" justifyContent="space-between" alignItems="baseline">
                      <Typography variant="caption" color="text.secondary">Pending Tasks</Typography>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: '#a855f7' }}>{pendingPct.toFixed(0)}%</Typography>
                    </Stack>
                    <Box sx={{ height: 6, borderRadius: 3, bgcolor: 'action.hover', mt: 0.5 }}>
                      <Box sx={{ height: '100%', width: `${pendingPct}%`, borderRadius: 3, bgcolor: '#a855f7', transition: 'width 0.4s ease' }} />
                    </Box>
                  </Box>
                </Stack>
              ) : (
                <Typography variant="caption" color="text.secondary">No data</Typography>
              )}
              <Button
                size="small"
                endIcon={<FiArrowRight size={12} />}
                onClick={() => navigate('/maintenance/reports')}
                sx={{ mt: 1.5, textTransform: 'none', fontSize: '0.73rem', p: 0 }}
              >
                Maintenance Reports
              </Button>
            </Box>
          </Card>
        </Box>

        <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box sx={{ display: { xs: 'flex', md: 'none' }, gap: 1, flexWrap: 'wrap' }}>
            {KPI_CONFIG.filter(c => c.to).map((cfg) => {
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

          {Number(stats?.overduePM) > 0 && (
            <Box
              sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 2, py: 1, borderRadius: 2, bgcolor: '#fef2f2', border: '1px solid #fecaca', cursor: 'pointer' }}
              onClick={() => navigate('/maintenance/schedule')}
            >
              <FiAlertTriangle size={16} style={{ color: '#ef4444', flexShrink: 0 }} />
              <Typography variant="body2" sx={{ color: '#b91c1c', fontWeight: 600 }}>
                {stats.overduePM} overdue PM task{Number(stats.overduePM) !== 1 ? 's' : ''} — action required
              </Typography>
              <Button size="small" sx={{ ml: 'auto', textTransform: 'none', color: '#ef4444', fontSize: '0.75rem', py: 0.25 }} endIcon={<FiArrowRight size={12} />}>
                View
              </Button>
            </Box>
          )}

          <Card sx={{ borderRadius: 2, boxShadow: 'none', border: '1px solid', borderColor: 'divider' }}>
            <Box sx={{ px: 2, pt: 1.25, pb: 1, borderBottom: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <FiCalendar size={15} style={{ color: '#64748b' }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Upcoming PM Tasks</Typography>
              </Stack>
              <Chip label={stats?.upcomingSchedules?.length || 0} size="small" color="primary" variant="outlined" sx={{ height: 18, fontSize: '0.65rem' }} />
            </Box>
            {loading ? (
              <Box sx={{ p: 2 }}><LinearProgress /></Box>
            ) : !stats?.upcomingSchedules?.length ? (
              <Box sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">No upcoming PM tasks</Typography>
              </Box>
            ) : (
              <Box sx={{ overflowX: 'auto' }}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'grey.50' }}>
                      <TableCell sx={{ fontWeight: 700, py: 0.75, fontSize: '0.73rem', color: 'text.secondary' }}>Task</TableCell>
                      <TableCell sx={{ fontWeight: 700, py: 0.75, fontSize: '0.73rem', color: 'text.secondary' }}>Machine</TableCell>
                      <TableCell sx={{ fontWeight: 700, py: 0.75, fontSize: '0.73rem', color: 'text.secondary' }}>Due Date</TableCell>
                      <TableCell sx={{ fontWeight: 700, py: 0.75, fontSize: '0.73rem', color: 'text.secondary' }}>Assigned To</TableCell>
                      <TableCell sx={{ fontWeight: 700, py: 0.75, fontSize: '0.73rem', color: 'text.secondary' }}>Status</TableCell>
                      <TableCell sx={{ width: 28 }} />
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {stats.upcomingSchedules.map((s) => (
                      <TableRow key={s.id} hover sx={{ cursor: 'pointer' }} onClick={() => navigate(`/maintenance/schedule/view/${s.id}`)}>
                        <TableCell sx={{ py: 0.4, fontSize: '0.78rem', fontWeight: 600 }}>{s.task_name}</TableCell>
                        <TableCell sx={{ py: 0.4, fontSize: '0.78rem' }}>{s.machine?.machine_code || s.machine_id || '—'}</TableCell>
                        <TableCell sx={{ py: 0.4, fontSize: '0.78rem' }}>{s.next_due_date ? formatDate(s.next_due_date) : '—'}</TableCell>
                        <TableCell sx={{ py: 0.4, fontSize: '0.78rem' }}>{s.assigned_to || '—'}</TableCell>
                        <TableCell sx={{ py: 0.4, fontSize: '0.78rem' }}>
                          <StatusChip status={s.status} />
                        </TableCell>
                        <TableCell sx={{ py: 0.4 }}>
                          <FiChevronRight size={12} style={{ color: '#cbd5e1' }} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
            )}
            <Box sx={{ px: 2, py: 1, textAlign: 'center', borderTop: '1px solid', borderColor: 'divider' }}>
              <Button size="small" sx={{ textTransform: 'none', fontSize: '0.73rem' }} onClick={() => navigate('/maintenance/schedule')}>
                View All Schedules →
              </Button>
            </Box>
          </Card>

          <Card sx={{ borderRadius: 2, boxShadow: 'none', border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
            <Box sx={{ px: 2, pt: 1.25, pb: 1, borderBottom: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <FiClock size={15} style={{ color: '#64748b' }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Recent Activity</Typography>
              </Stack>
              <Chip label={stats?.recentActivity?.length || 0} size="small" variant="outlined" sx={{ height: 16, fontSize: '0.6rem' }} />
            </Box>
            {loading ? (
              <Stack spacing={0.75} sx={{ p: 1.25 }}>
                {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} height={32} />)}
              </Stack>
            ) : !stats?.recentActivity?.length ? (
              <Box sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="caption" color="text.secondary">No recent activity</Typography>
              </Box>
            ) : (
              <List dense disablePadding sx={{ overflowY: 'auto', maxHeight: 320 }}>
                {stats.recentActivity.map((r, idx) => {
                  const label = r.schedule_no || r.task_name || `#${idx}`;
                  const sub = r.machine?.machine_code || '—';
                  const init = (r.task_name || label).charAt(0).toUpperCase();
                  return (
                    <ListItem
                      key={r.id || idx}
                      sx={{ px: 1.25, py: 0.6, borderBottom: '1px solid', borderColor: 'divider', '&:last-child': { borderBottom: 'none' }, alignItems: 'flex-start', cursor: 'pointer' }}
                      onClick={() => navigate(`/maintenance/schedule/view/${r.id}`)}
                    >
                      <Avatar sx={{ width: 24, height: 24, mr: 1, bgcolor: r.status === 'Completed' ? '#10b981' : r.status === 'Overdue' ? '#ef4444' : '#f59e0b', fontSize: 10, fontWeight: 700, flexShrink: 0, mt: 0.25 }}>
                        {init}
                      </Avatar>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', lineHeight: 1.3 }}>{label}</Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sub} · {r.assigned_to || 'Unassigned'}</Typography>
                      </Box>
                      <StatusChip status={r.status} />
                    </ListItem>
                  );
                })}
              </List>
            )}
          </Card>
        </Box>
      </Box>
    </Box>
  );
};

export default MaintenanceDashboard;
