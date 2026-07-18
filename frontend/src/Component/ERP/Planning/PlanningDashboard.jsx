import React, { useEffect, useState } from 'react';
import { Box, Grid, Card, CardContent, Typography, LinearProgress } from '@mui/material';
import { FiCalendar, FiRefreshCw, FiTrendingUp, FiCheckCircle } from 'react-icons/fi';
import axios from 'axios';

const PlanningDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/erp/planning/dashboard')
      .then(({ data }) => setStats(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LinearProgress />;

  const cards = [
    { label: 'Planned Schedules', value: stats?.plannedSchedules ?? 0, icon: <FiCalendar />, color: '#1976d2' },
    { label: 'Active Schedules', value: stats?.activeSchedules ?? 0, icon: <FiCheckCircle />, color: '#2e7d32' },
    { label: 'MRP Runs', value: stats?.totalMRPRuns ?? 0, icon: <FiRefreshCw />, color: '#ed6c02' },
    { label: 'Capacity Plans', value: stats?.capacityPlans ?? 0, icon: <FiTrendingUp />, color: '#5d4037' },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold', color: 'var(--heading-color)' }}>
        Production Planning & Control
      </Typography>
      <Grid container spacing={3}>
        {cards.map((stat, i) => (
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
        <Typography variant="h6" color="textSecondary">Planning Overview</Typography>
        <Typography variant="body2" color="textSecondary">
          Manage production schedules, run MRP, and plan capacity. Use the sidebar to access each function.
        </Typography>
      </Box>
    </Box>
  );
};

export default PlanningDashboard;
