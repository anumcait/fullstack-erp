import React from 'react';
import { Box, Typography, Grid, Card, CardContent } from '@mui/material';
import { FiTruck, FiRefreshCw } from 'react-icons/fi';

const SubcontractReports = () => (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold', color: '#0b3c91' }}>Subcontract Reports</Typography>
      <Grid container spacing={3}>
        {[{ title: 'Pending Job Work', icon: <FiTruck /> }, { title: 'Material Return Status', icon: <FiRefreshCw /> }].map((r, i) => (
          <Grid item xs={12} sm={6} md={4} key={i}>
            <Card sx={{ borderRadius: '16px' }}><CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}><Box sx={{ p: 1.5, bgcolor: '#efebe9', color: '#5d4037', borderRadius: '12px' }}>{r.icon}</Box><Typography variant="h6">{r.title}</Typography></CardContent></Card>
          </Grid>
        ))}
      </Grid>
    </Box>
);

export default SubcontractReports;
