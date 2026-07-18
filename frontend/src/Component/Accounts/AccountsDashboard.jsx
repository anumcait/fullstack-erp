import React, { useState, useEffect } from 'react';
import { Box, Grid, Card, CardContent, Typography, Stack, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
  FiDollarSign, FiBookOpen, FiTarget, FiFileText,
  FiTrendingUp, FiPieChart, FiBarChart, FiPlus, FiList
} from 'react-icons/fi';
import PageHeader from '../Common/PageHeader';
import axios from 'axios';

const AccountsDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    axios.get('/api/accounts/dashboard').then(r => setStats(r.data)).catch(() => {});
  }, []);

  const navItems = [
    { label: 'Sales Invoice', icon: FiDollarSign, path: '/invoice/sales', color: '#1976d2' },
    { label: 'Purchase Invoice', icon: FiDollarSign, path: '/invoice/purchase', color: '#2e7d32' },
    { label: 'Payment Voucher', icon: FiList, path: '/accounts/payment', color: '#ed6c02' },
    { label: 'Receipt Voucher', icon: FiList, path: '/accounts/receipt', color: '#9c27b0' },
    { label: 'Journal Voucher', icon: FiFileText, path: '/accounts/journal', color: '#0288d1' },
    { label: 'Contra Entry', icon: FiFileText, path: '/accounts/contra', color: '#d32f2f' },
    { label: 'Chart of Accounts', icon: FiBookOpen, path: '/accounts/coa', color: '#1565c0' },
    { label: 'Budget', icon: FiTarget, path: '/accounts/budgets', color: '#2e7d32' },
  ];

  const heroStats = [
    { label: 'Total Vouchers', value: stats?.total_vouchers ?? 0, color: '#1976d2' },
    { label: 'Posted', value: stats?.posted_vouchers ?? 0, color: '#2e7d32' },
    { label: 'Drafts', value: stats?.draft_vouchers ?? 0, color: '#ed6c02' },
    { label: 'Accounts', value: stats?.total_accounts ?? 0, color: '#9c27b0' },
  ];

  const reportItems = [
    { label: 'General Ledger', icon: FiBookOpen, path: '/reports/ledger', color: '#1976d2' },
    { label: 'Day Book', icon: FiFileText, path: '/reports/daybook', color: '#2e7d32' },
    { label: 'Trial Balance', icon: FiBarChart, path: '/reports/trial-balance', color: '#ed6c02' },
    { label: 'P&L Statement', icon: FiTrendingUp, path: '/reports/pl', color: '#9c27b0' },
    { label: 'Balance Sheet', icon: FiPieChart, path: '/reports/balance-sheet', color: '#0288d1' },
    { label: 'AP / AR Aging', icon: FiFileText, path: '/reports/ap', color: '#d32f2f' },
  ];

  return (
    <Box sx={{ p: { xs: 1.5, md: 2 } }}>
      <PageHeader
        title="Accounting & Finance"
        subtitle="Manage chart of accounts, vouchers, and financial reports"
        icon={<FiDollarSign size={22} />}
        actions={
          <Stack direction="row" spacing={0.75}>
            <Button variant="contained" size="small" startIcon={<FiPlus />}
              sx={{ textTransform: 'none', borderRadius: 1.5, py: 0.5, fontSize: '0.78rem' }}
              onClick={() => navigate('/accounts/coa')}>New Account</Button>
            <Button variant="outlined" size="small" startIcon={<FiList />}
              sx={{ textTransform: 'none', borderRadius: 1.5, py: 0.5, fontSize: '0.78rem' }}
              onClick={() => navigate('/accounts/payment')}>New Voucher</Button>
          </Stack>
        }
      />

      <Card sx={{ mb: 2, boxShadow: 'none', border: '1px solid', borderColor: 'divider', borderRadius: 2, bgcolor: 'background.paper' }}>
        <Stack direction="row" divider={<Box sx={{ borderRight: '1px solid', borderColor: 'divider' }} />} sx={{ overflow: 'hidden' }}>
          {heroStats.map((s, i) => (
            <Box key={i} sx={{ flex: 1, p: 2, textAlign: 'center' }}>
              <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, color: 'text.secondary', mb: 0.5 }}>{s.label}</Typography>
              <Typography sx={{ fontSize: '1.5rem', fontWeight: 800, lineHeight: 1, letterSpacing: -0.5, color: s.color }}>{s.value}</Typography>
            </Box>
          ))}
        </Stack>
      </Card>

      <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', flexDirection: { xs: 'column', md: 'row' } }}>
        <Box sx={{ width: { xs: '100%', md: 230 }, flexShrink: 0 }}>
          <Card sx={{ borderRadius: 2, boxShadow: 'none', border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
            <Box sx={{ px: 1.5, py: 1, borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'grey.50' }}>
              <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: 'text.secondary', fontSize: '10px' }}>Quick Entry</Typography>
            </Box>
            {navItems.map((item, i) => (
              <Box key={i} onClick={() => navigate(item.path)}
                sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1.5, py: 1, cursor: 'pointer', borderBottom: '1px solid', borderColor: 'divider', '&:hover': { bgcolor: 'action.hover' } }}>
                <Box sx={{ width: 3, height: 24, borderRadius: 1, bgcolor: item.color, flexShrink: 0 }} />
                <Box component={item.icon} sx={{ fontSize: 15, color: item.color, flexShrink: 0 }} />
                <Typography variant="body2" sx={{ flex: 1, fontSize: '0.82rem', fontWeight: 500 }}>{item.label}</Typography>
                <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.7rem' }}>→</Typography>
              </Box>
            ))}
          </Card>
        </Box>

        <Box sx={{ flex: 1 }}>
          <Grid container spacing={2}>
            {stats && (
              <>
                <Grid item xs={12} sm={6} md={4}>
                  <Card sx={{ borderRadius: 2, boxShadow: 'none', border: '1px solid', borderColor: 'divider' }}>
                    <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                      <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, color: 'text.secondary', mb: 1 }}>Assets</Typography>
                      <Typography sx={{ fontSize: '1.3rem', fontWeight: 800, color: '#1976d2' }}>₹{Number(stats.total_assets || 0).toLocaleString()}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Card sx={{ borderRadius: 2, boxShadow: 'none', border: '1px solid', borderColor: 'divider' }}>
                    <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                      <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, color: 'text.secondary', mb: 1 }}>Liabilities</Typography>
                      <Typography sx={{ fontSize: '1.3rem', fontWeight: 800, color: '#d32f2f' }}>₹{Number(stats.total_liabilities || 0).toLocaleString()}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Card sx={{ borderRadius: 2, boxShadow: 'none', border: '1px solid', borderColor: 'divider' }}>
                    <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                      <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, color: 'text.secondary', mb: 1 }}>Income</Typography>
                      <Typography sx={{ fontSize: '1.3rem', fontWeight: 800, color: '#2e7d32' }}>₹{Number(stats.total_income || 0).toLocaleString()}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </>
            )}

            <Grid item xs={12}>
              <Card sx={{ borderRadius: 2, boxShadow: 'none', border: '1px solid', borderColor: 'divider' }}>
                <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'grey.50' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'var(--heading-color)', fontSize: '0.95rem' }}>Financial Reports</Typography>
                </Box>
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                  <Grid container spacing={1.5}>
                    {reportItems.map((r, i) => (
                      <Grid item xs={12} sm={6} md={4} key={i}>
                        <Box onClick={() => navigate(r.path)}
                          sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5, borderRadius: 1.5, cursor: 'pointer', border: '1px solid', borderColor: 'divider', '&:hover': { bgcolor: 'action.hover', borderColor: 'primary.main' } }}>
                          <Box sx={{ display: 'flex', p: 1, borderRadius: 1.5, bgcolor: `${r.color}15`, color: r.color }}><r.icon size={16} /></Box>
                          <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.82rem' }}>{r.label}</Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Box>
  );
};

export default AccountsDashboard;
