import React from 'react';
import { Box, Grid, Card, CardContent, Typography } from '@mui/material';
import { FiTool, FiCpu, FiPlay, FiCheckCircle } from 'react-icons/fi';

const ProductionDashboard = () => {
  const stats = [
    { label: 'Active Jobs', value: '18', icon: <FiPlay />, color: '#ed6c02' },
    { label: 'Production Today', value: '450', icon: <FiCpu />, color: '#1976d2' },
    { label: 'OEE Status', value: '78%', icon: <FiCheckCircle />, color: '#2e7d32' },
    { label: 'Rejections', value: '02', icon: <FiTool />, color: '#d32f2f' }
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold', color: '#0b3c91' }}>
        Production & Shop Floor
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
        <Typography variant="h6" color="textSecondary">Shop Floor Operations</Typography>
        <Typography variant="body2" color="textSecondary">
          Track real-time production data. Use the sidebar to log daily entries and monitor WIP (Work in Progress) status.
        </Typography>
      </Box>
    </Box>
  );
};

export default ProductionDashboard;
