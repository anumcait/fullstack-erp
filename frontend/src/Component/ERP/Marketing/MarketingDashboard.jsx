import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Grid, Card, CardContent, Box, Typography, Stack, Button,
  LinearProgress, Tabs, Tab, Skeleton,
} from '@mui/material';
import {
  FiTrendingUp, FiTarget, FiDollarSign, FiShoppingBag,
  FiMail, FiFileText, FiUsers, FiPlus, FiClock, FiCheckCircle, FiXCircle,
} from 'react-icons/fi';
import axios from 'axios';
import { useToast } from '../../../context/ToastContext';
import PageHeader from '../../Common/PageHeader';
import DataTable from '../../Common/DataTable';
import StatusChip from '../../Common/StatusChip';
import { formatCompactCurrency, formatCurrency, formatDate } from '../../../utils/format';

const KPI_CONFIG = [
  { key: 'total_leads', label: 'Total Leads', icon: FiTarget, color: '#3b82f6', to: '/marketing/leads' },
  { key: 'qualified_leads', label: 'Qualified Leads', icon: FiMail, color: '#f59e0b', to: '/marketing/leads' },
  { key: 'quotes_sent', label: 'Quotes Sent', icon: FiFileText, color: '#0ea5e9', to: '/marketing/quotes' },
  { key: 'orders_won', label: 'Orders Won', icon: FiShoppingBag, color: '#10b981', to: '/marketing/orders' },
  { key: 'total_revenue', label: 'Total Revenue', icon: FiDollarSign, color: '#22c55e', to: '/marketing/orders' },
  { key: 'conversion_rate', label: 'Conversion Rate', icon: FiTrendingUp, color: '#a855f7', valueKey: null, suffix: '%' },
];

const KpiRow = ({ config, stats, loading, onClick }) => {
  const Icon = config.icon;
  const value = stats?.[config.key];
  return (
    <Box onClick={onClick} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 1.5, py: 1, cursor: 'pointer', borderRadius: 1,
      transition: 'all 0.15s', '&:hover': { bgcolor: 'action.hover' } }}>
      <Box sx={{ p: 1, borderRadius: 1.5, bgcolor: `${config.color}18`, color: config.color, display: 'flex' }}>
        <Icon size={18} />
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '.7rem', lineHeight: 1 }}>{config.label}</Typography>
        {loading ? <Skeleton width={60} height={22} /> : (
          <Typography sx={{ fontWeight: 700, fontSize: '.95rem', lineHeight: 1.3 }}>
            {config.key === 'conversion_rate' ? `${value ?? '—'}%` : formatCompactCurrency(value ?? '—')}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

const QUICK_LINKS = [
  { label: 'New Lead', to: '/marketing/leads/add', icon: FiPlus },
  { label: 'New Quote', to: '/marketing/quotes/add', icon: FiFileText },
  { label: 'New Order', to: '/marketing/orders/add', icon: FiShoppingBag },
  { label: 'Customers', to: '/marketing/customers', icon: FiUsers },
  { label: 'Reports', to: '/marketing/reports', icon: FiTrendingUp },
];

export default function MarketingDashboard() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [stats, setStats] = useState(null);
  const [leads, setLeads] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      axios.get('/api/erp/marketing/dashboard').catch(() => ({ data: null })),
      axios.get('/api/erp/marketing/leads', { params: { limit: 5 } }).catch(() => ({ data: [] })),
      axios.get('/api/erp/marketing/orders', { params: { limit: 5 } }).catch(() => ({ data: [] })),
    ]).then(([statsRes, leadsRes, ordersRes]) => {
      setStats(statsRes.data);
      setLeads(leadsRes.data || []);
      setOrders(ordersRes.data || []);
    }).finally(() => setLoading(false));
  }, []);

  const leadColumns = [
    { field: 'lead_no', header: 'Lead #' },
    { field: 'company_name', header: 'Company' },
    { field: 'contact_person', header: 'Contact' },
    { field: 'status', header: 'Status', render: (r) => <StatusChip status={r.status} /> },
    { field: 'priority', header: 'Priority', render: (r) => <StatusChip status={r.priority} /> },
    { field: 'expected_value', header: 'Value', render: (r) => formatCurrency(r.expected_value) },
  ];

  const orderColumns = [
    { field: 'order_no', header: 'Order #' },
    { field: 'customer_name', header: 'Customer' },
    { field: 'order_date', header: 'Date', render: (r) => formatDate(r.order_date) },
    { field: 'status', header: 'Status', render: (r) => <StatusChip status={r.status} /> },
    { field: 'total', header: 'Total', render: (r) => formatCurrency(r.total) },
  ];

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <PageHeader title="Marketing & Sales Dashboard" subtitle="Leads, quotations, orders & pipeline overview" icon={<FiTrendingUp size={22} />}
        actions={QUICK_LINKS.map((l) => (
          <Button key={l.label} variant="contained" size="small" startIcon={<l.icon />} onClick={() => navigate(l.to)}>
            {l.label}
          </Button>
        ))}
      />

      <Grid container spacing={2.5}>
        {/* KPI Sidebar */}
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

        {/* Main Content */}
        <Grid item xs={12} md={9}>
          <Stack spacing={2.5}>
            {/* Hero Stats */}
            <Grid container spacing={2}>
              {[
                { label: 'Open Leads', value: stats?.total_leads, color: '#3b82f6', to: '/marketing/leads' },
                { label: 'Pending Quotes', value: stats?.quotes_sent, color: '#0ea5e9', to: '/marketing/quotes' },
                { label: 'Active Orders', value: stats?.orders_won, color: '#10b981', to: '/marketing/orders' },
                { label: 'Revenue (MTD)', value: stats?.total_revenue, color: '#f59e0b', to: '/marketing/orders' },
              ].map((h) => (
                <Grid item xs={6} md={3} key={h.label}>
                  <Card sx={{ borderRadius: 2, boxShadow: '0 1px 6px rgba(0,0,0,0.08)', cursor: 'pointer',
                    borderLeft: `3px solid ${h.color}`, '&:hover': { boxShadow: '0 4px 16px rgba(0,0,0,0.12)' } }}
                    onClick={() => navigate(h.to)}>
                    <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '.7rem' }}>{h.label}</Typography>
                      {loading ? <Skeleton width={80} height={28} /> : (
                        <Typography sx={{ fontWeight: 700, fontSize: '1.25rem' }}>
                          {h.label === 'Revenue (MTD)' ? formatCompactCurrency(h.value) : h.value ?? '—'}
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {/* Recent Leads */}
            <Card sx={{ borderRadius: 2, boxShadow: '0 1px 6px rgba(0,0,0,0.08)' }}>
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1.5, fontSize: '.9rem' }}>Recent Leads</Typography>
                <DataTable columns={leadColumns} rows={leads} loading={loading} dense emptyMessage="No leads yet" />
              </CardContent>
            </Card>

            {/* Recent Orders */}
            <Card sx={{ borderRadius: 2, boxShadow: '0 1px 6px rgba(0,0,0,0.08)' }}>
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1.5, fontSize: '.9rem' }}>Recent Orders</Typography>
                <DataTable columns={orderColumns} rows={orders} loading={loading} dense emptyMessage="No orders yet" />
              </CardContent>
            </Card>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
}
