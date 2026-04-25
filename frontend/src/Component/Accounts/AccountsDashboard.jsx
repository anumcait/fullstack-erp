import React from 'react';
import { Box, Grid, Card, CardContent, Typography, IconButton } from '@mui/material';
import { 
  FaFileInvoiceDollar, 
  FaReceipt, 
  FaBook, 
  FaChartLine, 
  FaWallet,
  FaFileAlt
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const AccountsDashboard = () => {
  const navigate = useNavigate();

  const accountsModules = [
    { 
      title: 'Sales Invoicing', 
      icon: <FaFileInvoiceDollar size={40} color="#1976d2" />, 
      path: '/invoice/sales',
      desc: 'Create and manage sales invoices'
    },
    { 
      title: 'Payment Vouchers', 
      icon: <FaReceipt size={40} color="#2e7d32" />, 
      path: '/accounts/payment',
      desc: 'Record outgoing payments'
    },
    { 
      title: 'General Ledger', 
      icon: <FaBook size={40} color="#ed6c02" />, 
      path: '/reports/ledger',
      desc: 'View all account transactions'
    },
    { 
      title: 'Profit & Loss', 
      icon: <FaChartLine size={40} color="#9c27b0" />, 
      path: '/reports/pl',
      desc: 'Financial performance summary'
    },
    { 
      title: 'Receipt Vouchers', 
      icon: <FaWallet size={40} color="#0288d1" />, 
      path: '/accounts/receipt',
      desc: 'Record incoming payments'
    },
    { 
      title: 'Day Book', 
      icon: <FaFileAlt size={40} color="#d32f2f" />, 
      path: '/reports/daybook',
      desc: 'Daily transaction summary'
    }
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold', color: '#0b3c91' }}>
        Accounting & Finance Dashboard
      </Typography>

      <Grid container spacing={3}>
        {accountsModules.map((module, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card 
              sx={{ 
                height: '100%', 
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: 6,
                  borderColor: '#1976d2'
                },
                border: '1px solid #e0e0e0',
                borderRadius: '16px'
              }}
              onClick={() => navigate(module.path)}
            >
              <CardContent sx={{ textAlign: 'center', py: 4 }}>
                <Box sx={{ mb: 2 }}>{module.icon}</Box>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {module.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {module.desc}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default AccountsDashboard;
