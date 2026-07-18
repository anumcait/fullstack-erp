import React, { useEffect, useState } from 'react';
import { Box, Grid, Card, CardContent, Typography, LinearProgress } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { FiBriefcase, FiCalendar, FiShare, FiRotateCcw } from 'react-icons/fi';
import axios from 'axios';
import { formatDate } from '../../../utils/format';

const SubcontractDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      axios.get('/api/erp/subcontract/dashboard'),
      axios.get('/api/erp/subcontract/orders'),
    ]).then(([statsRes, ordersRes]) => {
      setStats(statsRes.data);
      setRecentOrders(ordersRes.data.slice(0, 5));
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <LinearProgress />;

  const cards = [
    { label: 'Active Orders', value: stats?.activeOrders ?? 0, icon: <FiBriefcase />, color: '#ed6c02' },
    { label: 'This Month Orders', value: stats?.thisMonthOrders ?? 0, icon: <FiCalendar />, color: '#1976d2' },
    { label: 'Pending Issues', value: stats?.pendingIssues ?? 0, icon: <FiShare />, color: '#d32f2f' },
    { label: 'Pending Receipts', value: stats?.pendingReceipts ?? 0, icon: <FiRotateCcw />, color: '#2e7d32' },
  ];

  const columns = [
    { field: 'order_no', headerName: 'Order No', width: 140 },
    { field: 'vendor_name', headerName: 'Vendor', width: 200 },
    { field: 'order_date', headerName: 'Date', width: 110, renderCell: (p) => formatDate(p.value) },
    { field: 'status', headerName: 'Status', width: 120 },
    { field: 'total_amount', headerName: 'Amount', width: 120 },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold', color: 'var(--heading-color)' }}>
        Subcontract Management
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
      <Card sx={{ mt: 4, borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'var(--heading-color)' }}>Recent Orders</Typography>
          <div style={{ height: 280, width: '100%' }}>
            <DataGrid rows={recentOrders} columns={columns} getRowId={(r) => r.id} hideFooter
              sx={{ border: 0, '& .MuiDataGrid-columnHeaders': { bgcolor: '#f2f4f7', fontWeight: 700 } }} />
          </div>
        </CardContent>
      </Card>
    </Box>
  );
};

export default SubcontractDashboard;
