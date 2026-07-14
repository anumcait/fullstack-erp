import React from 'react';
import { Box, Grid, Card, CardContent, Typography, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { FiFileText, FiBarChart2, FiPieChart, FiTrendingUp } from 'react-icons/fi';
import { NavLink } from 'react-router-dom';

const AccountsReports = () => {
  const reports = [
    { title: 'General Ledger', path: '/reports/ledger', icon: <FiFileText /> },
    { title: 'Day Book', path: '/reports/daybook', icon: <FiFileText /> },
    { title: 'Trial Balance', path: '/reports/trial-balance', icon: <FiBarChart2 /> },
    { title: 'Profit & Loss Statement', path: '/reports/pl', icon: <FiTrendingUp /> },
    { title: 'Balance Sheet', path: '/reports/balance-sheet', icon: <FiPieChart /> },
    { title: 'Accounts Payable', path: '/reports/ap', icon: <FiFileText /> },
    { title: 'Accounts Receivable', path: '/reports/ar', icon: <FiFileText /> }
  ];

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold', color: 'var(--heading-color)' }}>
        Financial Reports
      </Typography>
      
      <Grid container spacing={3}>
        {reports.map((report, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <NavLink to={report.path} style={{ textDecoration: 'none' }}>
              <Card sx={{ 
                borderRadius: '16px', 
                transition: '0.3s',
                '&:hover': { transform: 'translateY(-5px)', boxShadow: '0 8px 25px rgba(0,0,0,0.1)' }
              }}>
                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ p: 1.5, bgcolor: '#e3f2fd', color: '#1976d2', borderRadius: '12px' }}>
                    {report.icon}
                  </Box>
                  <Typography variant="h6" sx={{ color: '#333' }}>{report.title}</Typography>
                </CardContent>
              </Card>
            </NavLink>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default AccountsReports;
