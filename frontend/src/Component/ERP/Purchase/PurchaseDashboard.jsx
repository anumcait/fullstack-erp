import React from 'react';
import { Box, Grid, Card, CardContent, Typography } from '@mui/material';
import { FiShoppingCart, FiFileText, FiTruck, FiClock } from 'react-icons/fi';

const PurchaseDashboard = () => {
  const stats = [
    { label: 'Open Indents', value: '12', icon: <FiFileText />, color: '#1976d2' },
    { label: 'Pending POs', value: '08', icon: <FiClock />, color: '#ed6c02' },
    { label: 'GRN Today', value: '05', icon: <FiTruck />, color: '#2e7d32' },
    { label: 'Active Vendors', value: '45', icon: <FiShoppingCart />, color: '#9c27b0' }
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold', color: '#0b3c91' }}>
        Purchase Management
      </Typography>
      <Grid container spacing={3}>
        {stats.map((stat, i) => (
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
      
      <Box sx={{ mt: 5, p: 4, bgcolor: '#f8f9fa', borderRadius: '12px', border: '1px dashed #ccc' }}>
        <Typography variant="h6" color="textSecondary">Purchase Module Overview</Typography>
        <Typography variant="body2" color="textSecondary">
          This workspace is dedicated to procurement. Use the sidebar to manage Indents, Purchase Orders, and GRN entries.
        </Typography>
      </Box>
    </Box>
  );
};

export default PurchaseDashboard;
