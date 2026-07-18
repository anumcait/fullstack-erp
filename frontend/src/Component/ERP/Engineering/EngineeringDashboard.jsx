import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Grid, Card, CardContent, Box, Typography, Stack, Button, LinearProgress, Skeleton,
} from '@mui/material';
import {
  FiLayout, FiBox, FiGrid, FiStar, FiPlus, FiTrendingUp,
  FiSettings, FiFileText,
} from 'react-icons/fi';
import axios from 'axios';
import { useToast } from '../../../context/ToastContext';
import PageHeader from '../../Common/PageHeader';
import DataTable from '../../Common/DataTable';
import StatusChip from '../../Common/StatusChip';
import { formatDate } from '../../../utils/format';

const KPI_CONFIG = [
  { key: 'product_count', label: 'Products', icon: FiStar, color: '#3b82f6', to: '/engineering/products' },
  { key: 'bom_count', label: 'Active BOMs', icon: FiLayout, color: '#10b981', to: '/engineering/bom' },
  { key: 'category_count', label: 'Categories', icon: FiGrid, color: '#f59e0b', to: '/engineering/categories' },
];

const QUICK_LINKS = [
  { label: 'New Product', to: '/engineering/products/add', icon: FiPlus },
  { label: 'New BOM', to: '/engineering/bom/add', icon: FiFileText },
  { label: 'Categories', to: '/engineering/categories', icon: FiGrid },
  { label: 'Reports', to: '/engineering/reports', icon: FiTrendingUp },
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
          <Typography sx={{ fontWeight: 700, fontSize: '.95rem', lineHeight: 1.3 }}>{value ?? '—'}</Typography>
        )}
      </Box>
    </Box>
  );
};

export default function EngineeringDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [boms, setBoms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      axios.get('/api/erp/engineering/products').catch(() => ({ data: [] })),
      axios.get('/api/erp/engineering/bom').catch(() => ({ data: [] })),
      axios.get('/api/erp/engineering/categories').catch(() => ({ data: [] })),
    ]).then(([prodRes, bomRes, catRes]) => {
      const products = prodRes.data || [];
      const boms = bomRes.data || [];
      const cats = catRes.data || [];
      setStats({
        product_count: products.length,
        bom_count: boms.filter((b) => b.status === 'Active').length,
        category_count: cats.length,
      });
      setProducts(products.slice(0, 10));
      setBoms(boms.slice(0, 10));
    }).finally(() => setLoading(false));
  }, []);

  const prodColumns = [
    { field: 'product_code', header: 'Code' },
    { field: 'part_name', header: 'Part Name' },
    { field: 'product_type', header: 'Type', render: (r) => <StatusChip status={r.product_type} /> },
    { field: 'color', header: 'Color' },
  ];

  const bomColumns = [
    { field: 'bom_no', header: 'BOM #' },
    { field: 'bom_name', header: 'Name' },
    { field: 'product_name', header: 'Product' },
    { field: 'version', header: 'Ver' },
    { field: 'status', header: 'Status', render: (r) => <StatusChip status={r.status} /> },
  ];

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <PageHeader title="Engineering Dashboard" subtitle="Products, BOMs & design data" icon={<FiLayout size={22} />}
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
                { label: 'Total Products', value: stats?.product_count, color: '#3b82f6', to: '/engineering/products' },
                { label: 'Active BOMs', value: stats?.bom_count, color: '#10b981', to: '/engineering/bom' },
                { label: 'Categories', value: stats?.category_count, color: '#f59e0b', to: '/engineering/categories' },
              ].map((h) => (
                <Grid item xs={6} md={4} key={h.label}>
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
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1.5, fontSize: '.9rem' }}>Recent Products</Typography>
                <DataTable columns={prodColumns} rows={products} loading={loading} dense emptyMessage="No products yet" />
              </CardContent>
            </Card>

            <Card sx={{ borderRadius: 2, boxShadow: '0 1px 6px rgba(0,0,0,0.08)' }}>
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1.5, fontSize: '.9rem' }}>Recent BOMs</Typography>
                <DataTable columns={bomColumns} rows={boms} loading={loading} dense emptyMessage="No BOMs yet" />
              </CardContent>
            </Card>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
}
