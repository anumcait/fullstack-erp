import React from 'react';
import { Box, Grid, Card, CardContent, Typography } from '@mui/material';
import { FiBox, FiArchive, FiActivity, FiArrowUpRight } from 'react-icons/fi';

const StoresDashboard = () => {
  const stats = [
    { label: 'Total Items', value: '1,240', icon: <FiBox />, color: '#2e7d32' },
    { label: 'Low Stock', value: '15', icon: <FiActivity />, color: '#d32f2f' },
    { label: 'Pending Issues', value: '24', icon: <FiArrowUpRight />, color: '#0288d1' },
    { label: 'Warehouse Load', value: '82%', icon: <FiArchive />, color: '#ed6c02' }
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold', color: '#0b3c91' }}>
        Stores & Inventory
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
        <Typography variant="h6" color="textSecondary">Inventory Control Center</Typography>
        <Typography variant="body2" color="textSecondary">
          Monitor your material flow. Use the sidebar to manage the Item Master, track Stock levels, and process Material Issues.
        </Typography>
      </Box>
    </Box>
  );
};

export default StoresDashboard;
