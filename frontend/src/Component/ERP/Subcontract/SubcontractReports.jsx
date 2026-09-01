import React, { useEffect, useState } from 'react';
import { Box, Card, CardContent, Typography, Grid, LinearProgress } from '@mui/material';
import StandardTable from '../../Common/StandardTable.jsx';
import { FiPieChart, FiUsers, FiTrendingUp } from 'react-icons/fi';
import axios from 'axios';

const SubcontractReports = () => {
  const [orderStatus, setOrderStatus] = useState([]);
  const [vendorSummary, setVendorSummary] = useState([]);
  const [monthlyTrend, setMonthlyTrend] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      axios.get('/api/erp/subcontract/reports/order-status'),
      axios.get('/api/erp/subcontract/reports/vendor-summary'),
      axios.get('/api/erp/subcontract/reports/monthly-trend'),
    ]).then(([os, vs, mt]) => {
      setOrderStatus(os.data);
      setVendorSummary(vs.data);
      setMonthlyTrend(mt.data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <LinearProgress />;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold', color: 'var(--heading-color)' }}>Subcontract Reports</Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <FiPieChart /> <Typography variant="h6">Order Status</Typography>
              </Box>
              <div style={{ height: 250 }}>
                <StandardTable title="SubcontractReports" rows={orderStatus} columns={[
                  { field: 'status', headerName: 'Status', flex: 1 },
                  { field: 'count', headerName: 'Count', flex: 1 },
                ]} getRowId={(r, i) => i} hideFooter disableColumnMenu
                  sx={{ border: 0, '& .MuiDataGrid-columnHeaders': { bgcolor: '#f2f4f7', fontWeight: 700 } }} />
              </div>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <FiUsers /> <Typography variant="h6">Vendor Summary</Typography>
              </Box>
              <div style={{ height: 250 }}>
                <StandardTable title="SubcontractReports" rows={vendorSummary} columns={[
                  { field: 'vendor_name', headerName: 'Vendor', flex: 1 },
                  { field: 'order_count', headerName: 'Orders', width: 80 },
                  { field: 'total_amount', headerName: 'Total Amt', flex: 1 },
                ]} getRowId={(r, i) => i} hideFooter disableColumnMenu
                  sx={{ border: 0, '& .MuiDataGrid-columnHeaders': { bgcolor: '#f2f4f7', fontWeight: 700 } }} />
              </div>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <FiTrendingUp /> <Typography variant="h6">Monthly Trend</Typography>
              </Box>
              <div style={{ height: 250 }}>
                <StandardTable title="SubcontractReports" rows={monthlyTrend} columns={[
                  { field: 'month', headerName: 'Month', flex: 1 },
                  { field: 'count', headerName: 'Orders', width: 100 },
                ]} getRowId={(r, i) => i} hideFooter disableColumnMenu
                  sx={{ border: 0, '& .MuiDataGrid-columnHeaders': { bgcolor: '#f2f4f7', fontWeight: 700 } }} />
              </div>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SubcontractReports;
