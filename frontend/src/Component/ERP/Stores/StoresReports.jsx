import React from 'react';
import { Box, Typography, Grid, Card, CardContent } from '@mui/material';
import { FiBox, FiActivity } from 'react-icons/fi';

const StoresReports = () => {
  const reports = [
    { title: 'Stock Ledger', icon: <FiBox /> },
    { title: 'Inventory Valuation', icon: <FiBox /> },
    { title: 'Shortage Analysis', icon: <FiActivity /> }
  ];

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold', color: 'var(--heading-color)' }}>Stores Reports</Typography>
      <Grid container spacing={3}>
        {reports.map((r, i) => (
          <Grid item xs={12} sm={6} md={4} key={i}>
            <Card sx={{ borderRadius: '16px' }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ p: 1.5, bgcolor: '#e8f5e9', color: '#2e7d32', borderRadius: '12px' }}>{r.icon}</Box>
                <Typography variant="h6">{r.title}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default StoresReports;
