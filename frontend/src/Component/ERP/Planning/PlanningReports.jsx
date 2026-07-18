import React, { useEffect, useState } from 'react';
import { Box, Card, CardContent, Typography, Grid, LinearProgress } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { FiCalendar, FiRefreshCw } from 'react-icons/fi';
import axios from 'axios';

const PlanningReports = () => {
  const [scheduleStatus, setScheduleStatus] = useState([]);
  const [mrpSummary, setMrpSummary] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      axios.get('/api/erp/planning/reports/schedule-status'),
      axios.get('/api/erp/planning/reports/mrp-summary'),
    ]).then(([ss, ms]) => {
      setScheduleStatus(ss.data);
      setMrpSummary(ms.data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <LinearProgress />;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold', color: 'var(--heading-color)' }}>Planning Reports</Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <FiCalendar /> <Typography variant="h6">Schedule Status</Typography>
              </Box>
              <div style={{ height: 300 }}>
                <DataGrid rows={scheduleStatus} columns={[
                  { field: 'status', headerName: 'Status', flex: 1 },
                  { field: 'count', headerName: 'Count', flex: 1 },
                ]} getRowId={(r, i) => i} hideFooter disableColumnMenu
                  sx={{ border: 0, '& .MuiDataGrid-columnHeaders': { bgcolor: '#f2f4f7', fontWeight: 700 } }} />
              </div>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <FiRefreshCw /> <Typography variant="h6">MRP Run Summary</Typography>
              </Box>
              <div style={{ height: 300 }}>
                <DataGrid rows={mrpSummary} columns={[
                  { field: 'run_no', headerName: 'Run No', flex: 1 },
                  { field: 'run_date', headerName: 'Date', flex: 1 },
                  { field: 'item_count', headerName: 'Items', flex: 1 },
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

export default PlanningReports;
