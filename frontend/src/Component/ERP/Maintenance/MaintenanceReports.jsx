import React, { useEffect, useState } from 'react';
import { Box, Card, CardContent, Typography, Grid, LinearProgress } from '@mui/material';
import StandardTable from '../../Common/StandardTable.jsx';
import { FiTool, FiCalendar } from 'react-icons/fi';
import axios from 'axios';

const MaintenanceReports = () => {
  const [machineStatus, setMachineStatus] = useState([]);
  const [scheduleStatus, setScheduleStatus] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      axios.get('/api/erp/maintenance/reports/machine-status'),
      axios.get('/api/erp/maintenance/reports/schedule-status'),
    ]).then(([ms, ss]) => {
      setMachineStatus(ms.data);
      setScheduleStatus(ss.data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <LinearProgress />;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold', color: 'var(--heading-color)' }}>Maintenance Reports</Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <FiTool /> <Typography variant="h6">Machine Status Summary</Typography>
              </Box>
              <div style={{ height: 300 }}>
                <StandardTable title="MaintenanceReports" rows={machineStatus} columns={[
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
                <FiCalendar /> <Typography variant="h6">Schedule Status Summary</Typography>
              </Box>
              <div style={{ height: 300 }}>
                <StandardTable title="MaintenanceReports" rows={scheduleStatus} columns={[
                  { field: 'status', headerName: 'Status', flex: 1 },
                  { field: 'count', headerName: 'Count', flex: 1 },
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

export default MaintenanceReports;
