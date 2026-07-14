import React from 'react';
import { Box, Typography, Grid, Card, CardContent } from '@mui/material';
import { FiLayers, FiActivity } from 'react-icons/fi';

const PlanningReports = () => (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold', color: 'var(--heading-color)' }}>Planning Reports</Typography>
      <Grid container spacing={3}>
        {[{ title: 'MPS Fulfillment', icon: <FiLayers /> }, { title: 'MRP Variance Report', icon: <FiActivity /> }].map((r, i) => (
          <Grid item xs={12} sm={6} md={4} key={i}>
            <Card sx={{ borderRadius: '16px' }}><CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}><Box sx={{ p: 1.5, bgcolor: '#f3e5f5', color: '#7b1fa2', borderRadius: '12px' }}>{r.icon}</Box><Typography variant="h6">{r.title}</Typography></CardContent></Card>
          </Grid>
        ))}
      </Grid>
    </Box>
);

export default PlanningReports;
