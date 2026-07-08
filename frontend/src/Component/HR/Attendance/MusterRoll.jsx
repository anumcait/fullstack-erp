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

  const topScrollRef = React.useRef(null);
  const tableContainerRef = React.useRef(null);
  const [contentWidth, setContentWidth] = useState(0);

  // Sync scroll width dynamically
  useEffect(() => {
    if (tableContainerRef.current) {
      // Small timeout to guarantee DOM is updated before measurement
      setTimeout(() => {
        if (tableContainerRef.current) {
          setContentWidth(tableContainerRef.current.scrollWidth);
        }
      }, 100);
    }
  }, [musterData, loading]);

  const isScrollingRef = React.useRef(false);

  const handleScroll = (source, target) => {
    if (isScrollingRef.current) {
      isScrollingRef.current = false;
      return;
    }
    if (source.current && target.current) {
      isScrollingRef.current = true;
      target.current.scrollLeft = source.current.scrollLeft;
    }
  };

  const handleTopScroll = () => {
    handleScroll(topScrollRef, tableContainerRef);
  };

  const handleTableScroll = () => {
    handleScroll(tableContainerRef, topScrollRef);
  };

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

  const getShortStatus = (status) => {
    if (!status) return "";
    if (status === 'Present') return "P";
    if (status === 'Half Day') return "F";
    if (status === 'Absent') return "A";
    if (status.startsWith('W-Off')) return "W";
    if (status.startsWith('Holiday')) return "H";
    return status; // CL, EL, SL, ML, Leave etc.
  };

  const getStatusColor = (status) => {
    const colors = {
      'P': { bg: '#e8f5e9', text: '#2e7d32' },
      'F': { bg: '#fff3e0', text: '#e65100' },
      'A': { bg: '#ffebee', text: '#c62828' },
      'H': { bg: '#e3f2fd', text: '#1565c0' },
      'W': { bg: '#f3e5f5', text: '#7b1fa2' },
      'CL': { bg: '#fff8e1', text: '#f57f17' },
      'EL': { bg: '#e0f2f1', text: '#00695c' },
      'SL': { bg: '#fbe9e7', text: '#d84315' },
      'Leave': { bg: '#fffde7', text: '#f57f17' },
      'L': { bg: '#fffde7', text: '#f57f17' }
    };
    const short = getShortStatus(status);
    return colors[short] || { bg: '#ffffff', text: '#333' };
  };

  const filteredData = musterData;

  return (
    <Card sx={{ m: 2, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e0e0e0', bgcolor: '#f8f9fa' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1976d2' }}>Muster Roll</Typography>
          {filteredData.length > 0 && (
            <Chip label={`${filteredData.length} Employees`} size="small" color="primary" sx={{ fontWeight: 'bold' }} />
          )}
        </Box>
        <Box>
          <Button variant="outlined" startIcon={<DownloadIcon />} size="small" sx={{ mr: 1 }}>
            Export
          </Button>
          <Button variant="outlined" startIcon={<PrintIcon />} size="small">
            Print
          </Button>
        </Box>
      </Box>

      <CardContent sx={{ p: 2 }}>
        <Grid container spacing={2} sx={{ mb: 3, alignItems: 'center' }}>
          <Grid item xs={12} sm={3} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Month</InputLabel>
              <Select name="month" value={filters.month} onChange={handleFilterChange} label="Month">
                {months.map(m => <MenuItem key={m.value} value={m.value}>{m.label}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={2} md={1.5}>
            <TextField fullWidth size="small" label="Year" name="year" type="number" value={filters.year} onChange={handleFilterChange} />
          </Grid>
          <Grid item xs={12} sm={4} md={3}>
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
          <Grid item xs={12} sm={3} md={5.5} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
            <Button variant="outlined" size="small" startIcon={<RefreshIcon />} onClick={fetchMusterData}>
              Refresh
            </Button>
            <Button variant="outlined" size="small" startIcon={<ClearIcon />} onClick={clearFilters}>
              Clear
            </Button>
          </Grid>
        </Grid>

        {loading && <LinearProgress sx={{ mb: 2 }} />}

        {filteredData.length === 0 ? (
          <Typography align="center" color="textSecondary" sx={{ py: 6, border: '1px dashed #ccc', borderRadius: 1 }}>
            No muster data found. Try selecting June (Jun) to view bulk entries.
          </Typography>
        ) : (
          <>
            {/* Top scrollbar synchronization helper */}
            <Box
              ref={topScrollRef}
              onScroll={handleTopScroll}
              sx={{
                overflowX: 'auto',
                overflowY: 'hidden',
                width: '100%',
                height: '14px',
                mb: 1,
                bgcolor: '#f5f5f5',
                borderRadius: '4px',
                border: '1px solid #ccc',
                '&::-webkit-scrollbar': {
                  height: '8px'
                },
                '&::-webkit-scrollbar-thumb': {
                  backgroundColor: '#ccc',
                  borderRadius: '4px'
                }
              }}
            >
              <Box sx={{ width: `${contentWidth}px`, height: '1px' }} />
            </Box>

            <Box
              ref={tableContainerRef}
              onScroll={handleTableScroll}
              sx={{ overflowX: 'auto', width: '100%', border: '1px solid #ccc', borderRadius: '4px' }}
            >
              <Table size="small" sx={{
                minWidth: 1200,
                borderCollapse: 'collapse',
                '& th, & td': {
                  border: '1px solid #ccc',
                  padding: '4px 6px',
                  fontSize: '11px'
                }
              }}>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#eeeeee' }}>
                    <TableCell rowSpan={2} align="center" sx={{ fontWeight: 'bold', width: 40 }}>S.No</TableCell>
                    <TableCell rowSpan={2} align="center" sx={{ fontWeight: 'bold', width: 60 }}>ID No</TableCell>
                    <TableCell rowSpan={2} sx={{ fontWeight: 'bold', minWidth: 160 }}>Name</TableCell>
                    <TableCell rowSpan={2} sx={{ fontWeight: 'bold', minWidth: 120 }}>Dept</TableCell>
                    <TableCell rowSpan={2} align="center" sx={{ fontWeight: 'bold', width: 45 }}></TableCell>
                    {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(d => (
                      <TableCell key={d} align="center" sx={{ fontWeight: 'bold', minWidth: 40, bgcolor: '#f5f5f5' }}>
                        {String(d).padStart(2, '0')}-{months.find(m => m.value === filters.month)?.label.substring(0, 3)}
                      </TableCell>
                    ))}
                    <TableCell rowSpan={2} align="center" sx={{ fontWeight: 'bold', bgcolor: '#e8f5e9', minWidth: 50 }}>PRESENT</TableCell>
                    <TableCell rowSpan={2} align="center" sx={{ fontWeight: 'bold', bgcolor: '#e3f2fd', minWidth: 40 }}>H/W</TableCell>
                    <TableCell rowSpan={2} align="center" sx={{ fontWeight: 'bold', bgcolor: '#fff8e1', minWidth: 40 }}>CL</TableCell>
                    <TableCell rowSpan={2} align="center" sx={{ fontWeight: 'bold', bgcolor: '#e0f2f1', minWidth: 40 }}>EL</TableCell>
                    <TableCell rowSpan={2} align="center" sx={{ fontWeight: 'bold', bgcolor: '#ffcdd2', minWidth: 45 }}>LOP</TableCell>
                    <TableCell rowSpan={2} align="center" sx={{ fontWeight: 'bold', bgcolor: '#eceff1', minWidth: 50 }}>TOTAL</TableCell>
                    <TableCell rowSpan={2} align="center" sx={{ fontWeight: 'bold', bgcolor: '#fff9c4', minWidth: 45 }}>OT</TableCell>
                    <TableCell rowSpan={2} align="center" sx={{ fontWeight: 'bold', minWidth: 50 }}>Bonus</TableCell>
                  </TableRow>
                  <TableRow sx={{ backgroundColor: '#eeeeee' }}>
                    {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(d => {
                      const dayOfWeek = new Date(filters.year, filters.month - 1, d).getDay();
                      const dayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dayOfWeek];
                      const isSunday = dayOfWeek === 0;
                      return (
                        <TableCell key={d} align="center" sx={{
                          color: isSunday ? '#d32f2f' : 'inherit',
                          fontWeight: 'bold',
                          fontSize: '9px',
                          bgcolor: isSunday ? '#ffebee' : '#f5f5f5'
                        }}>
                          {dayName}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredData.map((emp, idx) => {
                    const days = emp.days || [];
                    let presentDays = 0;
                    let holidays = 0;
                    let cl = 0;
                    let el = 0;
                    let leave = 0;
                    let woffCount = 0;
                    let totalOT = 0;

                    days.forEach(day => {
                      const status = day.status;
                      const short = getShortStatus(status);

                      if (short === 'P') presentDays++;
                      else if (short === 'F') presentDays += 0.5;
                      else if (status === 'Holiday+OT' || status === 'W-Off+OT') presentDays++;

                      if (short === 'H') holidays++;
                      else if (status === 'Holiday+OT') holidays++;

                      if (short === 'CL') cl++;
                      else if (short === 'EL') el++;
                      else if (['SL', 'ML', 'Leave', 'L'].includes(short)) leave++;

                      if (short === 'W') woffCount++;
                      else if (status === 'W-Off+OT') woffCount++;

                      if (day.ot_hrs) totalOT += Number(day.ot_hrs);
                    });

                    // Pay Days = Present + Holiday + Weekly Off + Paid Leaves
                    const totalPaidDays = presentDays + holidays + woffCount + cl + el + leave;

                    return (
                      <React.Fragment key={emp.empid}>
                        {/* Row 1: Attendance status */}
                        <TableRow hover>
                          <TableCell rowSpan={2} align="center" sx={{ fontWeight: 'bold', bgcolor: '#fafafa' }}>{idx + 1}</TableCell>
                          <TableCell rowSpan={2} align="center" sx={{ fontWeight: 'bold', bgcolor: '#fafafa' }}>{emp.empid}</TableCell>
                          <TableCell rowSpan={2} sx={{ fontWeight: '500', color: '#333', bgcolor: '#fafafa' }}>{emp.ename}</TableCell>
                          <TableCell rowSpan={2} sx={{ color: 'text.secondary', bgcolor: '#fafafa' }}>{emp.department || '-'}</TableCell>
                          <TableCell align="center" sx={{
                            fontWeight: 'bold',
                            color: '#1565c0',
                            bgcolor: '#e3f2fd',
                            verticalAlign: 'middle'
                          }}>Attn</TableCell>

                          {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(d => {
                            const dayData = days[d - 1];
                            const status = dayData ? dayData.status : '';
                            const short = getShortStatus(status);
                            const color = getStatusColor(status);
                            const dayOfWeek = new Date(filters.year, filters.month - 1, d).getDay();
                            const isSunday = dayOfWeek === 0;

                            return (
                              <TableCell
                                key={d}
                                align="center"
                                sx={{
                                  bgcolor: color.bg || (isSunday ? '#fff8e1' : '#ffffff'),
                                  color: color.text,
                                  fontWeight: short ? 'bold' : 'normal',
                                  cursor: 'default'
                                }}
                              >
                                <Tooltip title={dayData && status ? `${status} | In: ${dayData.in_time || '-'} | Out: ${dayData.out_time || '-'}` : ''} arrow>
                                  <span>{short || '-'}</span>
                                </Tooltip>
                              </TableCell>
                            );
                          })}

                          <TableCell rowSpan={2} align="center" sx={{ bgcolor: '#e8f5e9', color: '#2e7d32', fontWeight: 'bold', fontSize: '12px' }}>{presentDays}</TableCell>
                          <TableCell rowSpan={2} align="center" sx={{ bgcolor: '#e3f2fd', color: '#1565c0', fontWeight: 'bold', fontSize: '12px' }}>{holidays + woffCount}</TableCell>
                          <TableCell rowSpan={2} align="center" sx={{ bgcolor: '#fff8e1', color: '#f57f17', fontWeight: 'bold', fontSize: '12px' }}>{cl}</TableCell>
                          <TableCell rowSpan={2} align="center" sx={{ bgcolor: '#e0f2f1', color: '#00695c', fontWeight: 'bold', fontSize: '12px' }}>{el}</TableCell>
                          <TableCell rowSpan={2} align="center" sx={{ bgcolor: '#ffcdd2', color: '#c62828', fontWeight: 'bold', fontSize: '12px' }}>{Math.max(0, daysInMonth - (presentDays + holidays + woffCount + cl + el + leave))}</TableCell>
                          <TableCell rowSpan={2} align="center" sx={{ bgcolor: '#eceff1', color: '#37474f', fontWeight: 'bold', fontSize: '12px' }}>{totalPaidDays}</TableCell>
                          <TableCell rowSpan={2} align="center" sx={{ bgcolor: '#fff9c4', color: '#f57f17', fontWeight: 'bold', fontSize: '12px' }}>{totalOT > 0 ? totalOT.toFixed(1) : '0.0'}</TableCell>
                          <TableCell rowSpan={2} align="center" sx={{ fontWeight: '500' }}>-</TableCell>
                        </TableRow>

                        {/* Row 2: OT hours */}
                        <TableRow hover>
                          <TableCell align="center" sx={{
                            fontWeight: 'bold',
                            color: '#e65100',
                            bgcolor: '#fff3e0'
                          }}>OT</TableCell>
                          {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(d => {
                            const dayData = days[d - 1];
                            const ot = dayData && dayData.ot_hrs ? Number(dayData.ot_hrs) : 0;
                            const dayOfWeek = new Date(filters.year, filters.month - 1, d).getDay();
                            const isSunday = dayOfWeek === 0;
                            return (
                              <TableCell
                                key={d}
                                align="center"
                                sx={{
                                  color: '#e65100',
                                  bgcolor: ot > 0 ? '#ffe0b2' : (isSunday ? '#fffde7' : 'inherit'),
                                  fontSize: '10px'
                                }}
                              >
                                {ot > 0 ? ot.toFixed(1) : ''}
                              </TableCell>
                            );
                          })}
                        </TableRow>
                      </React.Fragment>
                    );
                  })}
                </TableBody>
              </Table>
            </Box>
          </>
        )}

        <Box sx={{ mt: 3, display: 'flex', gap: 1, flexWrap: 'wrap', p: 1.5, bgcolor: '#f8f9fa', borderRadius: 1, border: '1px solid #e0e0e0' }}>
          <Typography variant="body2" sx={{ mr: 1, fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>Legend:</Typography>
          <Chip label="P: Present" size="small" sx={{ bgcolor: '#e8f5e9', color: '#2e7d32', fontWeight: '500' }} />
          <Chip label="F: Half Day" size="small" sx={{ bgcolor: '#fff3e0', color: '#e65100', fontWeight: '500' }} />
          <Chip label="A: Absent" size="small" sx={{ bgcolor: '#ffebee', color: '#c62828', fontWeight: '500' }} />
          <Chip label="H: Holiday" size="small" sx={{ bgcolor: '#e3f2fd', color: '#1565c0', fontWeight: '500' }} />
          <Chip label="W: Weekly Off" size="small" sx={{ bgcolor: '#f3e5f5', color: '#7b1fa2', fontWeight: '500' }} />
          <Chip label="CL: Casual Leave" size="small" sx={{ bgcolor: '#fff8e1', color: '#f57f17', fontWeight: '500' }} />
          <Chip label="EL: Earned Leave" size="small" sx={{ bgcolor: '#e0f2f1', color: '#00695c', fontWeight: '500' }} />
          <Chip label="SL/ML: Medical/Special Leave" size="small" sx={{ bgcolor: '#fbe9e7', color: '#d84315', fontWeight: '500' }} />
        </Box>
      </CardContent>
    </Card>
  );
};

export default MusterRoll;
