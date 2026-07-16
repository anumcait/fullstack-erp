import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Grid, Card, CardContent, Box, Typography, Stack, Button, Divider, Avatar, List, ListItem, ListItemText } from '@mui/material';
import {
  FiBox,
  FiAlertTriangle,
  FiLayers,
  FiArrowUpRight,
  FiActivity,
  FiTruck,
  FiArchive,
  FiPlus,
  FiArrowRight,
} from 'react-icons/fi';
import axios from 'axios';
import PageHeader from '../../Common/PageHeader';
import KpiCard from '../../Common/KpiCard';
import StatusChip from '../../Common/StatusChip';
import { formatCompactCurrency } from '../../../utils/format';

const QUICK_LINKS = [
  { label: 'Material Requisition', to: '/stores/material-requisitions/add', icon: <FiArrowUpRight /> },
  { label: 'Material Issue', to: '/stores/material-issues/add', icon: <FiActivity /> },
  { label: 'Goods Receipt', to: '/stores/grr/add', icon: <FiTruck /> },
  { label: 'Item Master', to: '/stores/item-master', icon: <FiBox /> },
  { label: 'Stock Ledger', to: '/inventory/ledger', icon: <FiArchive /> },
  { label: 'Reports', to: '/stores/reports', icon: <FiLayers /> },
];

const StoresDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get('/api/erp/stores/dashboard')
      .then(({ data }) => setStats(data))
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, []);

  const kpis = stats
    ? [
        { label: 'Total Items', value: stats.total_items, icon: <FiBox />, color: '#2e7d32', to: '/stores/item-master' },
        { label: 'Inventory Value', value: `₹${formatCompactCurrency(stats.total_stock_value)}`, icon: <FiArchive />, color: '#1565c0', to: '/stores/reports' },
        { label: 'Low Stock Items', value: stats.low_stock, icon: <FiAlertTriangle />, color: '#d32f2f', to: '/stores/reports', subtitle: 'Below reorder level' },
        { label: 'Categories', value: stats.total_categories, icon: <FiLayers />, color: '#0288d1', to: '/stores/item-groups' },
        { label: 'Pending MRs', value: stats.pending_mrs, icon: <FiArrowUpRight />, color: '#ed6c02', to: '/stores/material-requisitions' },
        { label: 'Pending Issues', value: stats.pending_issues, icon: <FiActivity />, color: '#7b1fa2', to: '/stores/material-issues' },
        { label: 'GRNs (30d)', value: stats.recent_grns, icon: <FiTruck />, color: '#388e3c', to: '/stores/grr' },
        { label: 'Warehouses', value: 1, icon: <FiArchive />, color: '#546e7a', subtitle: 'Main Store' },
      ]
    : [];

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <PageHeader
        title="Stores & Inventory"
        subtitle="Real-time stock control — receipts, issues, valuation & replenishment"
        icon={<FiBox size={22} />}
        actions={
          <Button variant="contained" startIcon={<FiPlus />} onClick={() => navigate('/stores/material-requisitions/add')}>
            New Requisition
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
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5 }}>Inventory Health Overview</Typography>
              {stats && (
                <Stack spacing={2}>
                  <HealthBar label="Stocked Items" value={Number(stats.total_items)} total={Number(stats.total_items)} color="#2e7d32" />
                  <HealthBar label="Low Stock (reorder)" value={Number(stats.low_stock)} total={Number(stats.total_items) || 1} color="#d32f2f" />
                  <HealthBar label="Pending Requisitions" value={Number(stats.pending_mrs)} total={(Number(stats.pending_mrs) + Number(stats.pending_issues)) || 1} color="#ed6c02" />
                  <HealthBar label="Pending Issues" value={Number(stats.pending_issues)} total={(Number(stats.pending_mrs) + Number(stats.pending_issues)) || 1} color="#7b1fa2" />
                </Stack>
              )}
              <Button sx={{ mt: 2 }} endIcon={<FiArrowRight />} onClick={() => navigate('/stores/reports')}>
                Open Stores Reports
              </Button>
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
    </Box>
  );
};

const HealthBar = ({ label, value, total, color }) => (
  <Box>
    <Stack direction="row" justifyContent="space-between">
      <Typography variant="body2" color="text.secondary">{label}</Typography>
      <Typography variant="body2" sx={{ fontWeight: 600 }}>{value}</Typography>
    </Stack>
    <Box sx={{ height: 8, borderRadius: 4, bgcolor: 'action.hover', mt: 0.5 }}>
      <Box sx={{ height: '100%', width: `${Math.min(100, (value / (total || 1)) * 100)}%`, borderRadius: 4, bgcolor: color }} />
    </Box>
  </Box>
);

export default StoresDashboard;
