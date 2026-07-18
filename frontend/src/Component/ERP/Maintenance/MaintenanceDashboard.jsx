import React, { useEffect, useState } from 'react';
import { Box, Grid, Card, CardContent, Typography, LinearProgress } from '@mui/material';
import { FiTool, FiCpu, FiClock, FiAlertTriangle } from 'react-icons/fi';
import axios from 'axios';

const MaintenanceDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/erp/maintenance/dashboard')
      .then(({ data }) => setStats(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LinearProgress />;

  const cards = [
    { label: 'Total Machines', value: stats?.totalMachines ?? 0, icon: <FiCpu />, color: '#455a64' },
    { label: 'Active Machines', value: stats?.activeMachines ?? 0, icon: <FiTool />, color: '#2e7d32' },
    { label: 'Pending PM Tasks', value: stats?.pendingPM ?? 0, icon: <FiClock />, color: '#ed6c02' },
    { label: 'Overdue PM Tasks', value: stats?.overduePM ?? 0, icon: <FiAlertTriangle />, color: '#d32f2f' },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold', color: 'var(--heading-color)' }}>
        Plant Maintenance
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
        <Typography variant="h6" color="textSecondary">Maintenance Overview</Typography>
        <Typography variant="body2" color="textSecondary">
          Active Assets: {stats?.activeAssets ?? 0} | Track machine uptime, schedule preventive maintenance, and manage asset register.
        </Typography>
      </Box>
    </Box>
  );
};

export default MaintenanceDashboard;
