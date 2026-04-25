import React from 'react';
import { Box, Grid, Card, CardContent, Typography } from '@mui/material';
import { FiActivity, FiTool, FiClock, FiSettings } from 'react-icons/fi';

const MaintenanceDashboard = () => {
  const stats = [
    { label: 'Active Breakdowns', value: '01', icon: <FiClock />, color: '#d32f2f' },
    { label: 'Total Machines', value: '12', icon: <FiTool />, color: '#455a64' },
    { label: 'Upcoming PM', value: '03', icon: <FiSettings />, color: '#1976d2' },
    { label: 'Uptime Rate', value: '96%', icon: <FiActivity />, color: '#2e7d32' }
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold', color: '#0b3c91' }}>
        Plant Maintenance
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

export default MaintenanceDashboard;
