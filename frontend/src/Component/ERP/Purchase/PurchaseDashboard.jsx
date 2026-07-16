import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Grid, Card, CardContent, Box, Typography, Stack, Button, Divider, Avatar, List, ListItem, ListItemText, Chip } from '@mui/material';
import {
  FiShoppingCart,
  FiFileText,
  FiTruck,
  FiClock,
  FiCheckCircle,
  FiTrendingUp,
  FiUsers,
  FiPlus,
  FiArrowRight,
} from 'react-icons/fi';
import axios from 'axios';
import PageHeader from '../../Common/PageHeader';
import KpiCard from '../../Common/KpiCard';
import { AreaTrendChart } from '../../Common/Charts';
import StatusChip from '../../Common/StatusChip';
import { formatCompactCurrency, formatDate } from '../../../utils/format';

const QUICK_LINKS = [
  { label: 'New Indent', to: '/purchase/requisitions/add', icon: <FiFileText /> },
  { label: 'New Purchase Order', to: '/purchase/orders/add', icon: <FiShoppingCart /> },
  { label: 'New RFQ', to: '/purchase/rfq/add', icon: <FiFileText /> },
  { label: 'Goods Receipt', to: '/stores/grr/add', icon: <FiTruck /> },
  { label: 'Vendors', to: '/purchase/vendors', icon: <FiUsers /> },
  { label: 'Reports', to: '/purchase/reports', icon: <FiTrendingUp /> },
];

const PurchaseDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [trend, setTrend] = useState([]);
  const [activity, setActivity] = useState({ purchase_orders: [], grns: [], requisitions: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      axios.get('/api/erp/purchase/dashboard').catch(() => ({ data: null })),
      axios.get('/api/erp/purchase/reports/monthly-trend').catch(() => ({ data: [] })),
      axios.get('/api/erp/purchase/recent-activity').catch(() => ({ data: { purchase_orders: [], grns: [], requisitions: [] } })),
    ]).then(([s, t, a]) => {
      setStats(s.data);
      setTrend(t.data || []);
      setActivity(a.data || { purchase_orders: [], grns: [], requisitions: [] });
    }).finally(() => setLoading(false));
  }, []);

  const kpis = stats
    ? [
        { label: 'Open Indents', value: stats.open_indents, icon: <FiFileText />, color: '#1976d2', to: '/purchase/requisitions' },
        { label: 'Pending POs', value: stats.pending_pos, icon: <FiClock />, color: '#ed6c02', subtitle: `₹${formatCompactCurrency(stats.pending_po_value)} value`, to: '/purchase/orders' },
        { label: 'Approved POs', value: stats.approved_pos, icon: <FiCheckCircle />, color: '#2e7d32', subtitle: `₹${formatCompactCurrency(stats.approved_po_value)} value`, to: '/purchase/orders' },
        { label: 'PO This Month', value: stats.po_this_month, icon: <FiTrendingUp />, color: '#0288d1', to: '/purchase/orders' },
        { label: 'GRN Today', value: stats.grn_today, icon: <FiTruck />, color: '#388e3c', subtitle: `₹${formatCompactCurrency(stats.grn_value_this_month)} this month`, to: '/stores/grr' },
        { label: 'Active Vendors', value: stats.active_vendors, icon: <FiUsers />, color: '#9c27b0', to: '/purchase/vendors' },
        { label: 'Total RFQs', value: stats.total_rfq, icon: <FiFileText />, color: '#546e7a', to: '/purchase/rfq' },
        { label: 'PR This Month', value: stats.pr_this_month, icon: <FiFileText />, color: '#00796b', to: '/purchase/requisitions' },
      ]
    : [];

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <PageHeader
        title="Purchase Management"
        subtitle="Procurement control tower — indents, orders, vendors & receipts"
        icon={<FiShoppingCart size={22} />}
        actions={
          <Button variant="contained" startIcon={<FiPlus />} onClick={() => navigate('/purchase/orders/add')}>
            New Purchase Order
          </Button>
        }
      />

      <Grid container spacing={2.5}>
        {kpis.map((k) => (
          <Grid item xs={12} sm={6} md={3} key={k.label}>
            <KpiCard {...k} loading={loading} />
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={2.5} sx={{ mt: 0.5 }}>
        <Grid item xs={12} lg={8}>
          <Card sx={{ borderRadius: 2 }}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>Purchase Order Value Trend</Typography>
                <Chip label="Last 12 months" size="small" variant="outlined" />
              </Stack>
              {trend.length === 0 ? (
                <Box sx={{ height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'text.secondary' }}>
                  No purchase data available
                </Box>
              ) : (
                <AreaTrendChart data={trend} xKey="month" yKey="po_value" valueFormatter={(v) => `₹${formatCompactCurrency(v)}`} />
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Card sx={{ borderRadius: 2, height: '100%' }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5 }}>Quick Actions</Typography>
              <Grid container spacing={1.5}>
                {QUICK_LINKS.map((q) => (
                  <Grid item xs={6} key={q.label}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={q.icon}
                      onClick={() => navigate(q.to)}
                      sx={{ justifyContent: 'flex-start', textTransform: 'none', py: 1 }}
                    >
                      {q.label}
                    </Button>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={2.5} sx={{ mt: 0.5 }}>
        {[
          { title: 'Recent Purchase Orders', rows: activity.purchase_orders, to: '/purchase/orders', render: (r) => (<><Typography variant="body2" sx={{ fontWeight: 600 }}>{r.po_no}</Typography><Typography variant="caption" color="text.secondary">{formatDate(r.po_date)}</Typography></>) },
          { title: 'Recent Goods Receipts', rows: activity.grns, to: '/stores/grr', render: (r) => (<><Typography variant="body2" sx={{ fontWeight: 600 }}>{r.grn_no}</Typography><Typography variant="caption" color="text.secondary">{formatDate(r.grn_date)}</Typography></>) },
          { title: 'Recent Indents', rows: activity.requisitions, to: '/purchase/requisitions', render: (r) => (<><Typography variant="body2" sx={{ fontWeight: 600 }}>{r.req_no}</Typography><Typography variant="caption" color="text.secondary">{formatDate(r.req_date)}</Typography></>) },
        ].map((panel) => (
          <Grid item xs={12} md={4} key={panel.title}>
            <Card sx={{ borderRadius: 2, height: '100%' }}>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{panel.title}</Typography>
                  <Button size="small" endIcon={<FiArrowRight />} onClick={() => navigate(panel.to)}>View</Button>
                </Stack>
                <Divider />
                <List dense>
                  {panel.rows.length === 0 ? (
                    <ListItem><ListItemText primary={<Typography variant="body2" color="text.secondary">No records</Typography>} /></ListItem>
                  ) : (
                    panel.rows.map((r) => (
                      <ListItem key={r.id} sx={{ px: 0 }}>
                        <Avatar sx={{ width: 32, height: 32, mr: 1.5, bgcolor: 'primary.light', fontSize: 14 }}>
                          {r.supplier_name ? r.supplier_name.charAt(0) : (r.po_no || r.grn_no || r.req_no || '').charAt(0)}
                        </Avatar>
                        <ListItemText primary={panel.render(r)} secondary={r.supplier_name || r.status} />
                        <StatusChip status={r.status} />
                      </ListItem>
                    ))
                  )}
                </List>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default PurchaseDashboard;
