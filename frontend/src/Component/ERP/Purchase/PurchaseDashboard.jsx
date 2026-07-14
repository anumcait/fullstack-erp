import React, { useEffect, useState } from 'react';
import { Box, Grid, Card, CardContent, Typography, CircularProgress } from '@mui/material';
import { FiShoppingCart, FiFileText, FiTruck, FiClock, FiCheckCircle, FiTrendingUp, FiUsers } from 'react-icons/fi';
import axios from 'axios';

const PurchaseDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/erp/purchase/dashboard')
      .then(({ data }) => setStats(data))
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, []);

  const cards = stats ? [
    { label: 'Open Indents', value: stats.open_indents, icon: <FiFileText />, color: '#1976d2' },
    { label: 'Pending POs', value: stats.pending_pos, icon: <FiClock />, color: '#ed6c02' },
    { label: 'Approved POs', value: stats.approved_pos, icon: <FiCheckCircle />, color: '#2e7d32' },
    { label: 'PR This Month', value: stats.pr_this_month, icon: <FiTrendingUp />, color: '#0288d1' },
    { label: 'PO This Month', value: stats.po_this_month, icon: <FiShoppingCart />, color: '#7b1fa2' },
    { label: 'GRN Today', value: stats.grn_today, icon: <FiTruck />, color: '#388e3c' },
    { label: 'Active Vendors', value: stats.active_vendors, icon: <FiUsers />, color: '#9c27b0' },
    { label: 'Total RFQs', value: stats.total_rfq, icon: <FiFileText />, color: '#546e7a' },
  ] : [];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold', color: 'var(--heading-color)' }}>
        Purchase Management
      </Typography>
      {loading ? <CircularProgress /> : (
        <Grid container spacing={3}>
          {cards.map((stat, i) => (
            <Grid item xs={12} sm={6} md={3} key={i}>
              <Card sx={{ borderRadius: '12px', borderLeft: `5px solid ${stat.color}` }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography color="textSecondary" variant="overline">{stat.label}</Typography>
                      <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{stat.value}</Typography>
                    </Box>
                    <Box sx={{ p: 1, backgroundColor: `${stat.color}22`, borderRadius: '8px', color: stat.color }}>
                      {stat.icon}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
      <Box sx={{ mt: 5, p: 4, bgcolor: '#f8f9fa', borderRadius: '12px', border: '1px dashed #ccc' }}>
        <Typography variant="h6" color="textSecondary">Quick Actions</Typography>
        <Typography variant="body2" color="textSecondary">
          Manage Requisitions, Purchase Orders, RFQs, Goods Receipt, and Vendor Master from the sidebar.
        </Typography>
      </Box>
    </Box>
  );
};

export default PurchaseDashboard;
