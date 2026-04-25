import React from 'react';
import { Box, Typography, Grid, Card, CardContent } from '@mui/material';
import { FiSettings, FiTool } from 'react-icons/fi';

const MaintenanceSettings = () => (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold', color: '#0b3c91' }}>Maintenance Settings</Typography>
      <Grid container spacing={3}>
        {[{ title: 'Machine Categories', desc: 'Manage assets.', icon: <FiTool /> }, { title: 'PM Checklists', desc: 'Manage preventive maintenance.', icon: <FiSettings /> }].map((s, i) => (
          <Grid item xs={12} sm={6} key={i}>
            <Card sx={{ borderRadius: '16px', border: '1px solid #eee' }}><CardContent sx={{ display: 'flex', alignItems: 'center', gap: 3 }}><Box sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: '12px' }}>{s.icon}</Box><Box><Typography variant="h6" sx={{ fontWeight: 'bold' }}>{s.title}</Typography><Typography variant="body2" color="textSecondary">{s.desc}</Typography></Box></CardContent></Card>
          </Grid>
        ))}
      </Grid>
    </Box>
);

export default MaintenanceSettings;
