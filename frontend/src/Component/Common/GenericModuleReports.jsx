import React from 'react';
import { Box, Grid, Card, CardContent, Typography } from '@mui/material';
import { useLocation } from 'react-router-dom';
import { FiPieChart, FiBarChart2, FiActivity, FiFileText } from 'react-icons/fi';

const GenericModuleReports = () => {
  const location = useLocation();
  const pathParts = location.pathname.split('/');
  const moduleName = pathParts[1].toUpperCase();

  const reportList = [
    { title: `${moduleName} Summary Report`, icon: <FiPieChart /> },
    { title: `Daily Performance Report`, icon: <FiActivity /> },
    { title: `Audit & Variance Log`, icon: <FiBarChart2 /> },
    { title: `Monthly Analytics`, icon: <FiFileText /> }
  ];

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold', color: 'var(--heading-color)' }}>
        {moduleName} Reports
      </Typography>
      
      <Grid container spacing={3}>
        {reportList.map((report, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card sx={{ 
              borderRadius: '16px', 
              transition: '0.3s',
              cursor: 'pointer',
              '&:hover': { transform: 'translateY(-5px)', boxShadow: '0 8px 25px rgba(0,0,0,0.1)' }
            }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ p: 1.5, bgcolor: '#f5f5f5', color: '#666', borderRadius: '12px' }}>
                  {report.icon}
                </Box>
                <Typography variant="h6" sx={{ color: '#333' }}>{report.title}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      
      <Box sx={{ mt: 10, p: 5, bgcolor: '#fff9c4', borderRadius: '20px', border: '2px dashed #fbc02d', textAlign: 'center' }}>
        <Typography variant="h6">Reports Implementation in Progress</Typography>
        <Typography variant="body2">
          We are currently building the specific data connectors for the <b>{moduleName}</b> module. 
          The sidebar is now correctly pointing here instead of the HR module.
        </Typography>
      </Box>
    </Box>
  );
};

export default GenericModuleReports;
