import React from 'react';
import { Box, Grid, Card, CardContent, Typography } from '@mui/material';
import { FiLayout, FiBox, FiCpu, FiSettings } from 'react-icons/fi';

const EngineeringDashboard = () => (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold', color: '#0b3c91' }}>Engineering & BOM</Typography>
      <Grid container spacing={3}>
        {[
          { label: 'Active BOMs', value: '85', icon: <FiLayout />, color: '#0288d1' },
          { label: 'New Designs', value: '12', icon: <FiCpu />, color: '#7b1fa2' }
        ].map((stat, i) => (
          <Grid item xs={12} sm={6} md={3} key={i}>
            <Card sx={{ borderRadius: '12px', borderLeft: `5px solid ${stat.color}` }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box><Typography color="textSecondary" variant="overline">{stat.label}</Typography><Typography variant="h4" sx={{ fontWeight: 'bold' }}>{stat.value}</Typography></Box>
                  <Box sx={{ p: 1, backgroundColor: `${stat.color}22`, borderRadius: '8px', color: stat.color }}>{stat.icon}</Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
);

export default EngineeringDashboard;
