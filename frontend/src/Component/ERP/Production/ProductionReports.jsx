import React from 'react';
import { Box, Typography, Grid, Card, CardContent } from '@mui/material';
import { FiTool, FiActivity } from 'react-icons/fi';

const ProductionReports = () => {
  const reports = [
    { title: 'Daily Production Summary', icon: <FiTool /> },
    { title: 'Machine Down-time Analysis', icon: <FiActivity /> },
    { title: 'Efficiency Reports', icon: <FiActivity /> }
  ];

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold', color: 'var(--heading-color)' }}>Production Reports</Typography>
      <Grid container spacing={3}>
        {reports.map((r, i) => (
          <Grid item xs={12} sm={6} md={4} key={i}>
            <Card sx={{ borderRadius: '16px' }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ p: 1.5, bgcolor: '#fff3e0', color: '#ef6c00', borderRadius: '12px' }}>{r.icon}</Box>
                <Typography variant="h6">{r.title}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default ProductionReports;
