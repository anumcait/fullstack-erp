import React from 'react';
import { Box, Grid, Card, CardContent, Typography } from '@mui/material';
import { FiTruck, FiBriefcase, FiRefreshCw, FiClipboard } from 'react-icons/fi';

const SubcontractDashboard = () => {
  const stats = [
    { label: 'Active Job Works', value: '08', icon: <FiBriefcase />, color: '#5d4037' },
    { label: 'Pending Indents', value: '04', icon: <FiClipboard />, color: '#1976d2' },
    { label: 'Materials at Vendor', value: '150', icon: <FiTruck />, color: '#ed6c02' },
    { label: 'Return Items Today', value: '12', icon: <FiRefreshCw />, color: '#2e7d32' }
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold', color: 'var(--heading-color)' }}>
        Subcontract Management
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

export default SubcontractDashboard;
