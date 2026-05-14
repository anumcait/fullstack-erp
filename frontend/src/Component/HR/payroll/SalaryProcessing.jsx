import React, { useState, useEffect } from "react";
import {
  Box, Typography, Button, Grid, FormControl, InputLabel, Select, MenuItem,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  CircularProgress, Alert, Tabs, Tab
} from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import BuildIcon from "@mui/icons-material/Build";
import RefreshIcon from "@mui/icons-material/Refresh";
import ClearIcon from "@mui/icons-material/Clear";
import axios from "axios";
import { useToast } from "../../../context/ToastContext";
import { getErrorMessage } from "../../../utils/errorUtils";

const SalaryProcessing = () => {
  const { showToast } = useToast();
  const [year, setYear] = useState(2026);
  const [month, setMonth] = useState(3);
  const [processing, setProcessing] = useState(false);
  const [salaryData, setSalaryData] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [attSummary, setAttSummary] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [attendanceDetails, setAttendanceDetails] = useState({});

const months = [
    { value: 1, label: "January" }, { value: 2, label: "February" },
    { value: 3, label: "March" }, { value: 4, label: "April" },
    { value: 5, label: "May" }, { value: 6, label: "June" },
    { value: 7, label: "July" }, { value: 8, label: "August" },
    { value: 9, label: "September" }, { value: 10, label: "October" },
    { value: 11, label: "November" }, { value: 12, label: "December" }
  ];

  const clearFilters = () => {
    setYear(new Date().getFullYear());
    setMonth(new Date().getMonth() + 1);
    setActiveTab(0);
  };

  const refreshData = () => {
    fetchSalaryRegister();
    fetchAttSummary();
  };

  const fetchSalaryRegister = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/payroll/register?year=${year}&month=${month}`);
      setSalaryData(res.data);
      setLoaded(true);
    } catch (err) {
      console.error("Error fetching salary register:", err);
      setLoaded(true);
    }
  };

  const processSalary = async () => {
    setProcessing(true);
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/payroll/process`, { year, month });
      showToast(`✅ Payslip processed for ${months[month - 1].label} ${year}`, "success");
      fetchSalaryRegister();
    } catch (err) {
      showToast(getErrorMessage(err, "Error processing payslip"), "error");
    } finally {
      setProcessing(false);
    }
  };

  const generateMarch2026Data = async () => {
    if (!window.confirm(`This will create ${months[month - 1].label} ${year} shift schedules, attendance, and set fixed salaries. Continue?`)) return;
    setGenerating(true);
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/shift/generate-monthly`, { year, month });
      showToast(`✅ Generated: ${res.data.shiftsCreated} shifts, ${res.data.attendanceCreated} attendance - Salaries set from prompt.md`, "success");
      fetchAttSummary();
    } catch (err) {
      if (err.response?.status === 400) {
        const regenerate = window.confirm(`${err.response.data.message}. Click OK to regenerate (overwrite), or Cancel to keep existing.`);
        if (regenerate) {
          const res2 = await axios.post(`${import.meta.env.VITE_API_URL}/api/shift/generate-monthly`, { year, month, regenerate: true });
          showToast(`✅ Regenerated: ${res2.data.shiftsCreated} records`, "success");
          fetchAttSummary();
        }
      } else {
        showToast(getErrorMessage(err, "Error generating data"), "error");
      }
    } finally {
      setGenerating(false);
    }
  };

  const formatCurrency = (value) => {
    if (value === null || value === undefined) return '0.00';
    return Number(value).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const renderBasicData = () => (
    <TableContainer component={Paper}>
      <Table size="small">
        <TableHead>
          <TableRow sx={{ backgroundColor: '#1565c0', color: 'white' }}>
            <TableCell sx={{ color: 'white' }}><strong>S.No</strong></TableCell>
            <TableCell sx={{ color: 'white' }}><strong>ID</strong></TableCell>
            <TableCell sx={{ color: 'white' }}><strong>Employee Name</strong></TableCell>
            <TableCell sx={{ color: 'white' }}><strong>Basic</strong></TableCell>
            <TableCell sx={{ color: 'white' }}><strong>HRA</strong></TableCell>
            <TableCell sx={{ color: 'white' }}><strong>Conveyance</strong></TableCell>
            <TableCell sx={{ color: 'white' }}><strong>Washing</strong></TableCell>
            <TableCell sx={{ color: 'white' }}><strong>Total Gross</strong></TableCell>
            <TableCell sx={{ color: 'white' }}><strong>PF</strong></TableCell>
            <TableCell sx={{ color: 'white' }}><strong>ESI</strong></TableCell>
            {salaryData.some(r => r.C_OT_EXIST === 'Y') && <TableCell sx={{ color: 'white' }}><strong>OT</strong></TableCell>}
          </TableRow>
        </TableHead>
        <TableBody>
          {salaryData.map((row, idx) => (
            <TableRow key={row.C_EMPID}>
              <TableCell>{idx + 1}</TableCell>
              <TableCell>{row.C_EMPID}</TableCell>
              <TableCell>{row.C_ENAME}</TableCell>
              <TableCell>{formatCurrency(row.C_BASIC)}</TableCell>
              <TableCell>{formatCurrency(row.C_HRA)}</TableCell>
              <TableCell>{formatCurrency(row.C_CONV)}</TableCell>
              <TableCell>{formatCurrency(row.C_OTHERS)}</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>{formatCurrency(row.C_TOT_SAL)}</TableCell>
              <TableCell>{row.C_PF_EXIST === 'Y' ? 'Yes' : 'No'}</TableCell>
              <TableCell>{row.C_ESI_EXIST === 'Y' ? 'Yes' : 'No'}</TableCell>
              {salaryData.some(r => r.C_OT_EXIST === 'Y') && (
                <TableCell>{row.C_OT_EXIST === 'Y' ? 'Yes' : 'No'}</TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const renderAttendanceData = () => (
    <TableContainer component={Paper}>
      <Table size="small">
        <TableHead>
          <TableRow sx={{ backgroundColor: '#2e7d32', color: 'white' }}>
            <TableCell sx={{ color: 'white' }}><strong>S.No</strong></TableCell>
            <TableCell sx={{ color: 'white' }}><strong>ID</strong></TableCell>
            <TableCell sx={{ color: 'white' }}><strong>Employee Name</strong></TableCell>
            <TableCell sx={{ color: 'white' }}><strong>Month Days</strong></TableCell>
            <TableCell sx={{ color: 'white' }}><strong>Physical</strong></TableCell>
            <TableCell sx={{ color: 'white' }}><strong>Woffs</strong></TableCell>
            <TableCell sx={{ color: 'white' }}><strong>Holidays</strong></TableCell>
            <TableCell sx={{ color: 'white' }}><strong>Leaves</strong></TableCell>
            <TableCell sx={{ color: 'white' }}><strong>Tour</strong></TableCell>
            <TableCell sx={{ color: 'white' }}><strong>Absent</strong></TableCell>
            <TableCell sx={{ color: 'white' }}><strong>LOP</strong></TableCell>
            <TableCell sx={{ color: 'white' }}><strong>Total Paid</strong></TableCell>
            <TableCell sx={{ color: 'white' }}><strong>OT Hrs</strong></TableCell>
            <TableCell sx={{ color: 'white' }}><strong>Late Times</strong></TableCell>
            <TableCell sx={{ color: 'white' }}><strong>Half Days</strong></TableCell>
            <TableCell sx={{ color: 'white' }}><strong>Half Hrs</strong></TableCell>
            <TableCell sx={{ color: 'white' }}><strong>Late Ded</strong></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {salaryData.map((row, idx) => {
            const att = attendanceDetails[String(row.C_EMPID)] || {};
            const totalPaid = (att.physical || 0) + (att.woffs || 0) + (att.holidays || 0) + (att.leaves || 0) + (att.tour || 0);
            return (
              <TableRow key={row.C_EMPID}>
                <TableCell>{idx + 1}</TableCell>
                <TableCell>{row.C_EMPID}</TableCell>
                <TableCell>{row.C_ENAME}</TableCell>
                <TableCell>{row.C_TOT_DAYS}</TableCell>
                <TableCell>{att.physical || 0}</TableCell>
                <TableCell>{att.woffs || 0}</TableCell>
                <TableCell>{att.holidays || 0}</TableCell>
                <TableCell>{att.leaves || 0}</TableCell>
                <TableCell>{att.tour || 0}</TableCell>
                <TableCell>{att.absent || 0}</TableCell>
                <TableCell>{att.lop || 0}</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#2e7d32' }}>{totalPaid}</TableCell>
                <TableCell>{(att.ot || 0).toFixed(1)}</TableCell>
                <TableCell>{att.lateTimes || 0}</TableCell>
                <TableCell>{att.lateHalfDays || 0}</TableCell>
                <TableCell>{att.lateHalfHours || 0}</TableCell>
                <TableCell>{formatCurrency(att.lateDed || 0)}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const renderProcessedData = () => (
    <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
      <Table size="small">
        <TableHead>
          <TableRow sx={{ backgroundColor: '#1565c0', color: 'white' }}>
            <TableCell rowSpan={2} sx={{ color: 'white', verticalAlign: 'bottom' }}><strong>S.No</strong></TableCell>
            <TableCell rowSpan={2} sx={{ color: 'white', verticalAlign: 'bottom' }}><strong>ID.No</strong></TableCell>
            <TableCell rowSpan={2} sx={{ color: 'white', verticalAlign: 'bottom' }}><strong>Name of Employee</strong></TableCell>
            <TableCell colSpan={5} sx={{ color: 'white', textAlign: 'center' }}><strong>Fixed Salary</strong></TableCell>
            <TableCell colSpan={9} sx={{ color: 'white', textAlign: 'center' }}><strong>Earned Salary</strong></TableCell>
            <TableCell colSpan={7} sx={{ color: 'white', textAlign: 'center' }}><strong>Deduction</strong></TableCell>
            <TableCell rowSpan={2} sx={{ color: 'white', verticalAlign: 'bottom' }}><strong>Net Amount</strong></TableCell>
          </TableRow>
          <TableRow sx={{ backgroundColor: '#1976d2', color: 'white' }}>
            <TableCell sx={{ color: 'white' }}><strong>Basic</strong></TableCell>
            <TableCell sx={{ color: 'white' }}><strong>HRA</strong></TableCell>
            <TableCell sx={{ color: 'white' }}><strong>CA/Others</strong></TableCell>
            <TableCell sx={{ color: 'white' }}><strong>W.A</strong></TableCell>
            <TableCell sx={{ color: 'white' }}><strong>Gross Salary</strong></TableCell>
            <TableCell sx={{ color: 'white' }}><strong>No. Days</strong></TableCell>
            <TableCell sx={{ color: 'white' }}><strong>Basic</strong></TableCell>
            <TableCell sx={{ color: 'white' }}><strong>HRA</strong></TableCell>
            <TableCell sx={{ color: 'white' }}><strong>Others</strong></TableCell>
            <TableCell sx={{ color: 'white' }}><strong>W.A</strong></TableCell>
            <TableCell sx={{ color: 'white' }}><strong>A.B</strong></TableCell>
            <TableCell sx={{ color: 'white' }}><strong>OT Hrs</strong></TableCell>
            <TableCell sx={{ color: 'white' }}><strong>OT Amt</strong></TableCell>
            <TableCell sx={{ color: 'white' }}><strong>Total</strong></TableCell>
            <TableCell sx={{ color: 'white' }}><strong>ESI</strong></TableCell>
            <TableCell sx={{ color: 'white' }}><strong>PF</strong></TableCell>
            <TableCell sx={{ color: 'white' }}><strong>PT</strong></TableCell>
            <TableCell sx={{ color: 'white' }}><strong>TDS</strong></TableCell>
            <TableCell sx={{ color: 'white' }}><strong>LIC</strong></TableCell>
            <TableCell sx={{ color: 'white' }}><strong>Other Ded</strong></TableCell>
            <TableCell sx={{ color: 'white' }}><strong>Sal. Adv</strong></TableCell>
            <TableCell sx={{ color: 'white' }}><strong>Total Ded</strong></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {salaryData.map((row, idx) => (
            <TableRow key={row.C_EMPID}>
              <TableCell>{idx + 1}</TableCell>
              <TableCell>{row.C_EMPID}</TableCell>
              <TableCell>{row.C_ENAME}</TableCell>
              <TableCell>{formatCurrency(row.C_BASIC)}</TableCell>
              <TableCell>{formatCurrency(row.C_HRA)}</TableCell>
              <TableCell>{formatCurrency(row.C_CONV)}</TableCell>
              <TableCell>{formatCurrency(row.C_OTHERS)}</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>{formatCurrency(row.C_TOT_SAL)}</TableCell>
              <TableCell>{row.C_DAYS_PRESENT}</TableCell>
              <TableCell>{formatCurrency(row.C_EARNED_BASIC)}</TableCell>
              <TableCell>{formatCurrency(row.C_EARNED_HRA)}</TableCell>
              <TableCell>{formatCurrency(row.C_EARNED_CONV)}</TableCell>
              <TableCell>{formatCurrency(row.C_EARNED_OTHERS)}</TableCell>
              <TableCell>{formatCurrency(row.C_EARNED_AB)}</TableCell>
              <TableCell>{row.C_OT_EXIST === 'Y' ? (row.C_OT_HRS || 0) : '0.00'}</TableCell>
              <TableCell>{row.C_OT_EXIST === 'Y' ? formatCurrency(row.C_EARNED_OT) : '0.00'}</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: '#2e7d32' }}>{formatCurrency(row.C_EARNED_GROSS)}</TableCell>
              <TableCell>{formatCurrency(row.C_DED_ESI)}</TableCell>
              <TableCell>{formatCurrency(row.C_DED_PF)}</TableCell>
              <TableCell>{formatCurrency(row.C_DED_PT)}</TableCell>
              <TableCell>{formatCurrency(row.C_DED_TAX)}</TableCell>
              <TableCell>{formatCurrency(row.C_DED_LIC)}</TableCell>
              <TableCell>{formatCurrency(row.C_LATE_DED_AMT)}</TableCell>
              <TableCell>{formatCurrency(row.C_DED_ADV)}</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: '#c62828' }}>{formatCurrency(row.C_TOT_DED)}</TableCell>
              <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#fff3e0' }}>{formatCurrency(row.C_NET_AMT)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
);

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>Monthly Payslip Processing</Typography>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={3}>
          <FormControl fullWidth size="small">
            <InputLabel>Year</InputLabel>
            <Select value={year} onChange={(e) => setYear(e.target.value)} label="Year">
              {[2023, 2024, 2025, 2026].map(y => (
                <MenuItem key={y} value={y}>{y}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={3}>
          <FormControl fullWidth size="small">
            <InputLabel>Month</InputLabel>
            <Select value={month} onChange={(e) => setMonth(e.target.value)} label="Month">
              {months.map(m => (
                <MenuItem key={m.value} value={m.value}>{m.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={3}>
          <Button
            variant="contained"
            startIcon={processing ? <CircularProgress size={20} color="inherit" /> : <PlayArrowIcon />}
            onClick={processSalary}
            disabled={processing}
          >
            {processing ? "Processing..." : "Process Payslip"}
          </Button>
        </Grid>
        <Grid item xs={3}>
          <Button
            variant="outlined"
            color="warning"
            startIcon={generating ? <CircularProgress size={20} color="inherit" /> : <BuildIcon />}
            onClick={generateMarch2026Data}
            disabled={generating}
          >
            {generating ? "Generating..." : `Generate ${months[month - 1].label} ${year} Data`}
          </Button>
        </Grid>
        <Grid item xs={3}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={refreshData}
          >
            Refresh
          </Button>
        </Grid>
        <Grid item xs={3}>
          <Button
            variant="outlined"
            color="secondary"
            startIcon={<ClearIcon />}
            onClick={clearFilters}
          >
            Clear
          </Button>
        </Grid>
      </Grid>

      {attSummary && (
        <Box sx={{ mb: 2, p: 2, bgcolor: '#e3f2fd', borderRadius: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
            Attendance Summary for {months[month - 1].label} {year}:
          </Typography>
          <Typography variant="body2">
            Total OT Hours: <b>{attSummary.totalOt.toFixed(1)}</b> |
            Employees eligible for ₹500 Bonus (25+ days): <b>{attSummary.bonusEligible}</b>
          </Typography>
        </Box>
      )}

      {salaryData.length === 0 && loaded && (
        <Alert severity="info">No payslip data found for {months[month - 1].label} {year}. Click "Process Payslip" to generate.</Alert>
      )}

      {salaryData.length > 0 && (
        <>
          <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}>
            <Tab label="1. Basic Data" />
            <Tab label="2. Attendance Details" />
            <Tab label="3. Processed Salary" />
          </Tabs>

          {activeTab === 0 && renderBasicData()}
          {activeTab === 1 && renderAttendanceData()}
          {activeTab === 2 && renderProcessedData()}
        </>
      )}
    </Box>
  );
};

export default SalaryProcessing;
