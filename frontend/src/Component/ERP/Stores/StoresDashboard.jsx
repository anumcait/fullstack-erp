import React, { useEffect, useState } from 'react';
import { Box, Grid, Card, CardContent, Typography, CircularProgress } from '@mui/material';
import { FiBox, FiArchive, FiActivity, FiArrowUpRight, FiAlertTriangle, FiLayers, FiTruck } from 'react-icons/fi';
import axios from 'axios';

const StoresDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/erp/stores/dashboard')
      .then(({ data }) => setStats(data))
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, []);

  const cards = stats ? [
    { label: 'Total Items', value: stats.total_items, icon: <FiBox />, color: '#2e7d32' },
    { label: 'Low Stock Items', value: stats.low_stock, icon: <FiAlertTriangle />, color: '#d32f2f' },
    { label: 'Categories', value: stats.total_categories, icon: <FiLayers />, color: '#0288d1' },
    { label: 'Pending MRs', value: stats.pending_mrs, icon: <FiArrowUpRight />, color: '#ed6c02' },
    { label: 'Pending Issues', value: stats.pending_issues, icon: <FiActivity />, color: '#7b1fa2' },
    { label: 'GRN (30 days)', value: stats.recent_grns, icon: <FiTruck />, color: '#388e3c' },
    { label: 'Warehouse Load', value: '—', icon: <FiArchive />, color: '#546e7a' },
  ] : [];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold', color: 'var(--heading-color)' }}>
        Stores & Inventory
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
        <Typography variant="h6" color="textSecondary">Inventory Control Center</Typography>
        <Typography variant="body2" color="textSecondary">
          Monitor stock levels, process Material Requisitions, manage Item Master, and track Goods Receipt.
        </Typography>
      </Box>
    </Box>
  );
};

export default StoresDashboard;
