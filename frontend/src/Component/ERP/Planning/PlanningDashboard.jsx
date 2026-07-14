import React from 'react';
import { Box, Grid, Card, CardContent, Typography } from '@mui/material';
import { FiLayout, FiLayers, FiTool, FiActivity } from 'react-icons/fi';

const PlanningDashboard = () => (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold', color: 'var(--heading-color)' }}>Production Planning</Typography>
      <Grid container spacing={3}>
        {[
          { label: 'MPS Orders', value: '15', icon: <FiLayers />, color: '#9c27b0' },
          { label: 'MRP Runs', value: '04', icon: <FiActivity />, color: '#1976d2' }
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

export default PlanningDashboard;
