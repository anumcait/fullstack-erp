import React from 'react';
import { Box, Typography, Grid, Card, CardContent } from '@mui/material';
import { FiSettings, FiUserPlus, FiShield } from 'react-icons/fi';

const PurchaseSettings = () => {
  const settings = [
    { title: 'Vendor Categories', desc: 'Manage vendor grouping.', icon: <FiUserPlus /> },
    { title: 'Approval Workflow', desc: 'Set PO approval limits.', icon: <FiShield /> },
    { title: 'Tax Configurations', desc: 'Configure GST/Tax for items.', icon: <FiSettings /> }
  ];

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold', color: '#0b3c91' }}>Purchase Settings</Typography>
      <Grid container spacing={3}>
        {settings.map((s, i) => (
          <Grid item xs={12} sm={6} key={i}>
            <Card sx={{ borderRadius: '16px', border: '1px solid #eee' }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: '12px' }}>{s.icon}</Box>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{s.title}</Typography>
                  <Typography variant="body2" color="textSecondary">{s.desc}</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default PurchaseSettings;
