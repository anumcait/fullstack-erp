import React, { useState, useEffect } from "react";
import {
  Box, Typography, Grid, FormControl, InputLabel, Select, MenuItem,
  Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Dialog, DialogTitle, DialogContent, IconButton, TextField, Alert
} from "@mui/material";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import CloseIcon from "@mui/icons-material/Close";
import PrintIcon from "@mui/icons-material/Print";
import AddIcon from "@mui/icons-material/Add";
import RefreshIcon from "@mui/icons-material/Refresh";
import ClearIcon from "@mui/icons-material/Clear";
import axios from "axios";
import { useToast } from "../../../context/ToastContext";

const PayslipList = () => {
  const { showToast } = useToast();
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [salaryData, setSalaryData] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedPayslip, setSelectedPayslip] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedEmpId, setSelectedEmpId] = useState("");
  const [creating, setCreating] = useState(false);

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
    setSelectedEmpId("");
  };

  const refreshData = () => {
    fetchSalaryRegister();
    fetchEmployees();
  };

  useEffect(() => {
    fetchSalaryRegister();
    fetchEmployees();
  }, [year, month]);

  const fetchSalaryRegister = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/payroll/register?year=${year}&month=${month}`);
      setSalaryData(res.data);
    } catch (err) {
      console.error("Error fetching salary register:", err);
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/payroll/employees`);
      setEmployees(res.data);
    } catch (err) {
      console.error("Error fetching employees:", err);
    }
  };

  const viewPayslip = (row) => {
    setSelectedPayslip(row);
    setDialogOpen(true);
  };

  const createPayslip = async () => {
    if (!selectedEmpId) {
      showToast("Please select an employee", "error");
      return;
    }
    setCreating(true);
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/payroll/create`, {
        empid: parseInt(selectedEmpId),
        year,
        month
      });
      showToast("Payslip created successfully", "success");
      setCreateDialogOpen(false);
      setSelectedEmpId("");
      fetchSalaryRegister();
    } catch (err) {
      showToast(err.response?.data?.message || "Error creating payslip", "error");
    } finally {
      setCreating(false);
    }
  };

  const formatCurrency = (value) => {
    if (value === null || value === undefined) return '0.00';
    return Number(value).toLocaleString('en-IN', { minimumFractionDigits: 2 });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>Payslip View / Create</Typography>
      
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={2}>
          <FormControl fullWidth size="small">
            <InputLabel>Year</InputLabel>
            <Select value={year} onChange={(e) => setYear(e.target.value)} label="Year">
              {[2023, 2024, 2025, 2026].map(y => (
                <MenuItem key={y} value={y}>{y}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={2}>
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
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => setCreateDialogOpen(true)}
          >
            Create Payslip
          </Button>
        </Grid>
        <Grid item xs={2}>
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={refreshData}>
            Refresh
          </Button>
        </Grid>
        <Grid item xs={2}>
          <Button variant="outlined" color="secondary" startIcon={<ClearIcon />} onClick={clearFilters}>
            Clear
          </Button>
        </Grid>
      </Grid>

      {salaryData.length === 0 && (
        <Alert severity="info">No payslip data found for {months[month-1].label} {year}. Click "Create Payslip" to generate.</Alert>
      )}

      {salaryData.length > 0 && (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell><strong>Emp ID</strong></TableCell>
                <TableCell><strong>Name</strong></TableCell>
                <TableCell><strong>Department</strong></TableCell>
                <TableCell><strong>Days Present</strong></TableCell>
                <TableCell><strong>LOP</strong></TableCell>
                <TableCell><strong>WOFF/Holiday</strong></TableCell>
                {salaryData.some(r => r.C_OT_EXIST === 'Y') && <TableCell><strong>OT Hrs</strong></TableCell>}
                <TableCell><strong>Gross</strong></TableCell>
                <TableCell><strong>Deductions</strong></TableCell>
                <TableCell><strong>Net Salary</strong></TableCell>
                <TableCell><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {salaryData.map((row) => (
                <TableRow key={`${row.C_EMPID}-${row.C_MONTH}`}>
                  <TableCell>{row.C_EMPID}</TableCell>
                  <TableCell>{row.C_ENAME}</TableCell>
                  <TableCell>{row.C_DEPT}</TableCell>
                  <TableCell>{row.C_DAYS_PRESENT}</TableCell>
                  <TableCell>{row.C_ABSENT_DAYS || '0'}</TableCell>
                  <TableCell>{row.C_WOFF_HOL || '0'}</TableCell>
                  {salaryData.some(r => r.C_OT_EXIST === 'Y') && (
                    <TableCell>{row.C_OT_EXIST === 'Y' ? (row.C_OT_HRS || '0') : '0'}</TableCell>
                  )}
                  <TableCell>{formatCurrency(row.C_EARNED_GROSS)}</TableCell>
                  <TableCell>{formatCurrency(row.C_TOT_DED)}</TableCell>
                  <TableCell><strong>{formatCurrency(row.C_NET_AMT)}</strong></TableCell>
                  <TableCell>
                    <Button 
                      size="small" 
                      variant="outlined" 
                      onClick={() => viewPayslip(row)}
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Create Payslip Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Create Payslip
          <IconButton onClick={() => setCreateDialogOpen(false)}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Employee</InputLabel>
                <Select 
                  value={selectedEmpId} 
                  onChange={(e) => setSelectedEmpId(e.target.value)} 
                  label="Employee"
                >
                  {employees.map(emp => (
                    <MenuItem key={emp.empid} value={emp.empid}>
                      {emp.empid} - {emp.ename}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <Button 
                variant="contained" 
                onClick={createPayslip}
                disabled={creating}
                fullWidth
              >
                {creating ? "Creating..." : "Generate Payslip"}
              </Button>
            </Grid>
          </Grid>
        </DialogContent>
      </Dialog>

      {/* View Payslip Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Payslip - {selectedPayslip?.C_ENAME}
          <IconButton onClick={() => setDialogOpen(false)}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent>
          {selectedPayslip && (
            <div className="payslip-container" style={{ padding: '20px' }}>
              <div style={{ textAlign: 'center', marginBottom: '20px', borderBottom: '2px solid #333', paddingBottom: '10px' }}>
                <h2 style={{ margin: 0 }}>AUCTOR HOME APPLIANCES LLP</h2>
                <h4 style={{ margin: '5px 0' }}>PAYSLIP FOR {months[month-1].label.toUpperCase()} {year}</h4>
              </div>
              
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={4}><strong>Emp ID:</strong> {selectedPayslip.C_EMPID}</Grid>
                <Grid item xs={4}><strong>Name:</strong> {selectedPayslip.C_ENAME}</Grid>
                <Grid item xs={4}><strong>Designation:</strong> {selectedPayslip.C_DESIG}</Grid>
                <Grid item xs={4}><strong>Department:</strong> {selectedPayslip.C_DEPT}</Grid>
                <Grid item xs={4}><strong>Unit:</strong> {selectedPayslip.C_UNIT || '-'}</Grid>
                <Grid item xs={4}><strong>Bank A/C:</strong> {selectedPayslip.C_BANK_ACNO || '-'}</Grid>
              </Grid>

              <Typography variant="subtitle2" sx={{ mb: 1, mt: 2 }}>Attendance Summary</Typography>
              <Grid container spacing={1} sx={{ mb: 2 }}>
                <Grid item xs={2}><strong>Total Days:</strong> {selectedPayslip.C_TOT_DAYS}</Grid>
                <Grid item xs={2}><strong>Present:</strong> {selectedPayslip.C_DAYS_PRESENT}</Grid>
                <Grid item xs={2}><strong>Absent:</strong> {selectedPayslip.C_ABSENT_DAYS}</Grid>
                <Grid item xs={2}><strong>Leaves:</strong> {selectedPayslip.C_LEAVES_ALLOWED || 0}</Grid>
                <Grid item xs={2}><strong>Late Ded:</strong> {formatCurrency(selectedPayslip.C_LATE_DED_AMT)}</Grid>
                <Grid item xs={2}><strong>OT Hrs:</strong> {selectedPayslip.C_OT_HRS || 0}</Grid>
              </Grid>

              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#eee' }}>
                      <TableCell colSpan={2}><strong>Earnings</strong></TableCell>
                      <TableCell colSpan={2}><strong>Deductions</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell>Basic</TableCell>
                      <TableCell align="right">{formatCurrency(selectedPayslip.C_EARNED_BASIC)}</TableCell>
                      <TableCell>PF</TableCell>
                      <TableCell align="right">{formatCurrency(selectedPayslip.C_DED_PF)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>HRA</TableCell>
                      <TableCell align="right">{formatCurrency(selectedPayslip.C_EARNED_HRA)}</TableCell>
                      <TableCell>ESI</TableCell>
                      <TableCell align="right">{formatCurrency(selectedPayslip.C_DED_ESI)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Others (Conv)</TableCell>
                      <TableCell align="right">{formatCurrency(selectedPayslip.C_EARNED_CONV)}</TableCell>
                      <TableCell>PT</TableCell>
                      <TableCell align="right">{formatCurrency(selectedPayslip.C_DED_PT)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>W.A</TableCell>
                      <TableCell align="right">{formatCurrency(selectedPayslip.C_EARNED_OTHERS)}</TableCell>
                      <TableCell>TDS</TableCell>
                      <TableCell align="right">{formatCurrency(selectedPayslip.C_DED_TAX)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>A.B</TableCell>
                      <TableCell align="right">{formatCurrency(selectedPayslip.C_EARNED_AB)}</TableCell>
                      <TableCell>LIC</TableCell>
                      <TableCell align="right">{formatCurrency(selectedPayslip.C_DED_LIC)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>OT Amt</TableCell>
                      <TableCell align="right">{formatCurrency(selectedPayslip.C_EARNED_OT)}</TableCell>
                      <TableCell>Other Ded</TableCell>
                      <TableCell align="right">{formatCurrency(selectedPayslip.C_LATE_DED_AMT)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell></TableCell>
                      <TableCell></TableCell>
                      <TableCell>Advance</TableCell>
                      <TableCell align="right">{formatCurrency(selectedPayslip.C_DED_ADV)}</TableCell>
                    </TableRow>
                    <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                      <TableCell><strong>Gross Earnings</strong></TableCell>
                      <TableCell align="right"><strong>{formatCurrency(selectedPayslip.C_EARNED_GROSS)}</strong></TableCell>
                      <TableCell><strong>Total Deductions</strong></TableCell>
                      <TableCell align="right"><strong>{formatCurrency(selectedPayslip.C_TOT_DED)}</strong></TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={3}><strong>NET SALARY</strong></TableCell>
                      <TableCell align="right"><strong style={{ fontSize: '16px' }}>{formatCurrency(selectedPayslip.C_NET_AMT)}</strong></TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>

              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                <Button variant="contained" startIcon={<PrintIcon />} onClick={handlePrint}>Print Payslip</Button>
              </Box>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default PayslipList;
