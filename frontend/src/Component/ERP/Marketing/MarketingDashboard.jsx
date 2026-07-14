import React from 'react';
import { Box, Grid, Card, CardContent, Typography } from '@mui/material';
import { FiTrendingUp, FiTarget, FiUserCheck, FiDollarSign } from 'react-icons/fi';

const MarketingDashboard = () => {
  const stats = [
    { label: 'New Enquiries', value: '25', icon: <FiTarget />, color: '#00897b' },
    { label: 'Quotes Sent', value: '14', icon: <FiTrendingUp />, color: '#1976d2' },
    { label: 'Orders Won', value: '06', icon: <FiUserCheck />, color: '#2e7d32' },
    { label: 'Sales Revenue', value: '₹4.2M', icon: <FiDollarSign />, color: '#ed6c02' }
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold', color: 'var(--heading-color)' }}>
        Marketing & Sales
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
    </Box>
  );
};

export default MarketingDashboard;
