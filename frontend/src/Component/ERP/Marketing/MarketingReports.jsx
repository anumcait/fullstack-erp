import React from 'react';
import { Box, Typography, Grid, Card, CardContent } from '@mui/material';
import { FiTrendingUp, FiTarget } from 'react-icons/fi';

const MarketingReports = () => (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold', color: '#0b3c91' }}>Marketing Reports</Typography>
      <Grid container spacing={3}>
        {[{ title: 'Sales Funnel', icon: <FiTarget /> }, { title: 'Quotation Success Rate', icon: <FiTrendingUp /> }].map((r, i) => (
          <Grid item xs={12} sm={6} md={4} key={i}>
            <Card sx={{ borderRadius: '16px' }}><CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}><Box sx={{ p: 1.5, bgcolor: '#e0f2f1', color: '#00695c', borderRadius: '12px' }}>{r.icon}</Box><Typography variant="h6">{r.title}</Typography></CardContent></Card>
          </Grid>
        ))}
      </Grid>
    </Box>
);

export default MarketingReports;
