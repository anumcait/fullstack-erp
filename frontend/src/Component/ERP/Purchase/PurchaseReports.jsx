import React from 'react';
import { Box, Typography, Grid, Card, CardContent } from '@mui/material';
import { FiFileText, FiBarChart2 } from 'react-icons/fi';

const PurchaseReports = () => {
  const reports = [
    { title: 'Pending Indent Report', icon: <FiFileText /> },
    { title: 'PO Register', icon: <FiFileText /> },
    { title: 'Vendor Rating Report', icon: <FiBarChart2 /> },
    { title: 'GRN Summary', icon: <FiFileText /> }
  ];

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold', color: 'var(--heading-color)' }}>Purchase Reports</Typography>
      <Grid container spacing={3}>
        {reports.map((r, i) => (
          <Grid item xs={12} sm={6} md={4} key={i}>
            <Card sx={{ borderRadius: '16px', '&:hover': { boxShadow: '0 8px 25px rgba(0,0,0,0.1)' } }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ p: 1.5, bgcolor: '#e3f2fd', color: '#1976d2', borderRadius: '12px' }}>{r.icon}</Box>
                <Typography variant="h6">{r.title}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default PurchaseReports;
