import React from 'react';
import { Box, Grid, Card, CardContent, Typography } from '@mui/material';
import { FiShield, FiCheckSquare, FiAlertCircle, FiSettings } from 'react-icons/fi';

const QualityDashboard = () => {
  const stats = [
    { label: 'Inspections', value: '120', icon: <FiCheckSquare />, color: '#2e7d32' },
    { label: 'NC Reports', value: '03', icon: <FiAlertCircle />, color: '#d32f2f' },
    { label: 'Pass Rate', value: '98.5%', icon: <FiShield />, color: '#1976d2' },
    { label: 'Pending Audits', value: '02', icon: <FiSettings />, color: '#ed6c02' }
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold', color: 'var(--heading-color)' }}>
        Quality Assurance
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

export default QualityDashboard;
