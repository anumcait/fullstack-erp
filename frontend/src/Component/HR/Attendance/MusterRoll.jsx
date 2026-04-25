import React, { useState, useEffect } from "react";
import {
  Box, Card, CardContent, Typography, Grid, TextField, Button, Table,
  TableHead, TableBody, TableRow, TableCell, LinearProgress, Chip, IconButton,
  FormControl, InputLabel, Select, MenuItem, Tooltip
} from "@mui/material";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import PrintIcon from "@mui/icons-material/Print";
import DownloadIcon from "@mui/icons-material/Download";
import RefreshIcon from "@mui/icons-material/Refresh";
import ClearIcon from "@mui/icons-material/Clear";
import axios from "axios";
import { useToast } from "../../../context/ToastContext";
import { formatDateOnly } from "../../../utils/dateUtils";

const MusterRoll = () => {
  const { showToast } = useToast();
  const [musterData, setMusterData] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    empid: ""
  });
  const [weekOffset, setWeekOffset] = useState(0);
  const [viewMode, setViewMode] = useState(0);

  useEffect(() => {
    fetchMusterData();
  }, [filters.month, filters.year, filters.empid]);

  const fetchMusterData = async () => {
    setLoading(true);
    try {
      const params = {
        month: filters.month,
        year: filters.year,
        ...(filters.empid && { empid: filters.empid })
      };
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/attendance/muster-roll`, { params });
      setMusterData(res.data);
    } catch (err) {
      console.error("Error fetching muster data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
    setWeekOffset(0);
  };

  const clearFilters = () => {
    setFilters({
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      empid: ""
    });
    setWeekOffset(0);
  };

  const months = [
    { value: 1, label: "January" }, { value: 2, label: "February" }, { value: 3, label: "March" },
    { value: 4, label: "April" }, { value: 5, label: "May" }, { value: 6, label: "June" },
    { value: 7, label: "July" }, { value: 8, label: "August" }, { value: 9, label: "September" },
    { value: 10, label: "October" }, { value: 11, label: "November" }, { value: 12, label: "December" }
  ];

  const daysInMonth = new Date(filters.year, filters.month, 0).getDate();

  const getStatusColor = (status) => {
    const colors = {
      'Present': { bg: '#c8e6c9', text: '#2e7d32' },
      'Absent': { bg: '#ffcdd2', text: '#c62828' },
      'Holiday': { bg: '#bbdefb', text: '#1565c0' },
      'W-Off': { bg: '#e1bee7', text: '#7b1fa2' },
      'EL': { bg: '#fff9c4', text: '#f57f17' },
      'SL': { bg: '#ffccbc', text: '#e64a19' },
      'CL': { bg: '#b2dfdb', text: '#00695c' },
      'ML': { bg: '#f8bbd0', text: '#c2185b' }
    };
    return colors[status] || { bg: '#f5f5f5', text: '#666' };
  };

  const getDaysForWeek = () => {
    const startDay = weekOffset * 7 + 1;
    const days = [];
    for (let i = 0; i < 7; i++) {
      const dayNum = startDay + i;
      if (dayNum <= daysInMonth) days.push(dayNum);
    }
    return days;
  };

  const weekDays = getDaysForWeek();
  const filteredData = musterData;

  return (
    <Card sx={{ m: 2 }}>
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee' }}>
        <Typography variant="h6">Muster Roll</Typography>
        <Box>
          <Button variant="outlined" startIcon={<DownloadIcon />} size="small" sx={{ mr: 1 }}>
            Export
          </Button>
          <Button variant="outlined" startIcon={<PrintIcon />} size="small">
            Print
          </Button>
        </Box>
      </Box>

      <CardContent>
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Month</InputLabel>
              <Select name="month" value={filters.month} onChange={handleFilterChange} label="Month">
                {months.map(m => <MenuItem key={m.value} value={m.value}>{m.label}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={2}>
            <TextField fullWidth size="small" label="Year" name="year" type="number" value={filters.year} onChange={handleFilterChange} />
          </Grid>
          <Grid item xs={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Employee</InputLabel>
              <Select name="empid" value={filters.empid} onChange={handleFilterChange} label="Employee" displayEmpty>
                <MenuItem value="">All Employees</MenuItem>
                {musterData.map(emp => (
                  <MenuItem key={emp.empid} value={emp.empid}>{emp.empid} - {emp.ename}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={5} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
            <Button variant="outlined" size="small" startIcon={<RefreshIcon />} onClick={fetchMusterData}>
              Refresh
            </Button>
            <Button variant="outlined" size="small" startIcon={<ClearIcon />} onClick={clearFilters}>
              Clear
            </Button>
            <IconButton onClick={() => setWeekOffset(weekOffset - 1)} disabled={weekOffset <= -5}>
              <NavigateBeforeIcon />
            </IconButton>
            <Typography variant="body2">
              Week {Math.abs(weekOffset) + 1}
            </Typography>
            <IconButton onClick={() => setWeekOffset(weekOffset + 1)} disabled={weekOffset >= Math.ceil(daysInMonth / 7) - 1}>
              <NavigateNextIcon />
            </IconButton>
          </Grid>
        </Grid>

        {loading && <LinearProgress sx={{ mb: 2 }} />}

        {filteredData.length === 0 ? (
          <Typography align="center" color="textSecondary" sx={{ py: 4 }}>
            No muster data found
          </Typography>
        ) : (
          <Table size="small" sx={{ border: '1px solid #ccc' }}>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#e3f2fd' }}>
                <TableCell sx={{ width: 120 }}><strong>Emp ID</strong></TableCell>
                <TableCell sx={{ width: 150 }}><strong>Name</strong></TableCell>
                <TableCell sx={{ width: 80 }}><strong>Dept</strong></TableCell>
                {weekDays.map(d => (
                  <TableCell key={d} align="center" sx={{ minWidth: 50 }}>
                    <strong>{d}</strong>
                  </TableCell>
                ))}
                <TableCell align="center" sx={{ minWidth: 60 }}><strong>P</strong></TableCell>
                <TableCell align="center" sx={{ minWidth: 60 }}><strong>A</strong></TableCell>
                <TableCell align="center" sx={{ minWidth: 60 }}><strong>L</strong></TableCell>
                <TableCell align="center" sx={{ minWidth: 60 }}><strong>W</strong></TableCell>
                <TableCell align="center" sx={{ minWidth: 60 }}><strong>H</strong></TableCell>
                <TableCell align="center" sx={{ minWidth: 60 }}><strong>LOP</strong></TableCell>
                <TableCell align="center" sx={{ minWidth: 60 }}><strong>Late</strong></TableCell>
                <TableCell align="center" sx={{ minWidth: 60 }}><strong>OT</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredData.map((emp) => {
                const summary = emp.summary || {};
                return (
                  <TableRow key={emp.empid} hover>
                    <TableCell>{emp.empid}</TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="500">{emp.ename}</Typography>
                    </TableCell>
                    <TableCell>{emp.department || '-'}</TableCell>
                    {weekDays.map(d => {
                      const dayData = (emp.days || [])[d - 1];
                      const color = dayData ? getStatusColor(dayData.status) : { bg: '#f5f5f5', text: '#999' };
                      return (
                        <TableCell
                          key={d}
                          sx={{ bgcolor: color.bg, textAlign: 'center', cursor: 'pointer' }}
                          onClick={() => dayData && console.log('Day details:', dayData)}
                        >
                          <Tooltip title={dayData ? `${dayData.status} | In: ${dayData.in_time || '-'} | Out: ${dayData.out_time || '-'}` : ''}>
                            <Typography variant="body2" sx={{ color: color.text, fontSize: 10, fontWeight: 'bold' }}>
                              {dayData ? dayData.status.substring(0, 2) : '-'}
                            </Typography>
                          </Tooltip>
                          {dayData?.shift && dayData.shift !== '-' && (
                            <Typography variant="caption" sx={{ color: color.text, display: 'block', fontSize: 8 }}>
                              {dayData.shift}
                            </Typography>
                          )}
                        </TableCell>
                      );
                    })}
                    <TableCell align="center" sx={{ bgcolor: '#e8f5e9' }}>
                      <Typography variant="body2" fontWeight="bold" color="success.main">{summary.present || 0}</Typography>
                    </TableCell>
                    <TableCell align="center" sx={{ bgcolor: '#ffebee' }}>
                      <Typography variant="body2" fontWeight="bold" color="error.main">{summary.absent || 0}</Typography>
                    </TableCell>
                    <TableCell align="center" sx={{ bgcolor: '#fff8e1' }}>
                      <Typography variant="body2" fontWeight="bold" color="warning.main">{summary.leave || 0}</Typography>
                    </TableCell>
                    <TableCell align="center" sx={{ bgcolor: '#f3e5f5' }}>
                      <Typography variant="body2" fontWeight="bold" color="secondary.main">{summary.woff || 0}</Typography>
                    </TableCell>
                    <TableCell align="center" sx={{ bgcolor: '#e3f2fd' }}>
                      <Typography variant="body2" fontWeight="bold" color="info.main">{summary.holiday || 0}</Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2">{summary.lop || 0}</Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2">{summary.late_hrs || 0}</Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2">{summary.ot_hrs || 0}</Typography>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}

        <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Chip label="Present" size="small" sx={{ bgcolor: '#c8e6c9', color: '#2e7d32' }} />
          <Chip label="Absent" size="small" sx={{ bgcolor: '#ffcdd2', color: '#c62828' }} />
          <Chip label="Holiday" size="small" sx={{ bgcolor: '#bbdefb', color: '#1565c0' }} />
          <Chip label="W-Off" size="small" sx={{ bgcolor: '#e1bee7', color: '#7b1fa2' }} />
          <Chip label="Leave" size="small" sx={{ bgcolor: '#fff9c4', color: '#f57f17' }} />
        </Box>
      </CardContent>
    </Card>
  );
};

export default MusterRoll;
