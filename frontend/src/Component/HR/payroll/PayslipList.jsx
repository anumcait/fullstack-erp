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
import { useCompany } from "../../../context/CompanyContext";
import logo from "../../../assets/images/EQIC_Image.jpg";


const PayslipList = () => {
  const { showToast } = useToast();
  const { companyName } = useCompany();
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1;
  const maxSelectableYear = 2026;
  const defaultYear = currentYear > maxSelectableYear ? maxSelectableYear : currentYear;
  const [year, setYear] = useState(defaultYear);
  const [month, setMonth] = useState(currentMonth);
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


  const selectableYears = [2023, 2024, 2025, 2026].filter(y => y <= currentYear);
  const isFutureMonth = (y, m) => y > currentYear || (y === currentYear && m > currentMonth);


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
    if (value === null || value === undefined || value === '') return '0';
    const n = Number(value);
    if (isNaN(n)) return '0';
    return n % 1 === 0
      ? n.toLocaleString('en-IN')
      : n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };


  const MONTHS3 = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const formatDOJ = (d) => {
    if (!d) return 'N/A';
    const dt = new Date(d);
    if (isNaN(dt)) return 'N/A';
    return `${dt.getDate()}-${MONTHS3[dt.getMonth()]}-${String(dt.getFullYear()).slice(2)}`;
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
            <Select value={year} onChange={(e) => {
              const y = Number(e.target.value);
              setYear(y);
              if (y === currentYear && month > currentMonth) setMonth(currentMonth);
            }} label="Year">
              {selectableYears.map(y => (
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
                <MenuItem key={m.value} value={m.value} disabled={isFutureMonth(year, m.value)}>{m.label}</MenuItem>
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
        <Alert severity="info">No payslip data found for {months[month - 1].label} {year}. Click "Create Payslip" to generate.</Alert>
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
          {selectedPayslip && (() => {
            const p = selectedPayslip;
            const emp = p.employee || {};
            const off = emp.official || {};
            const cellLabel = { fontWeight: 600, color: '#333', whiteSpace: 'nowrap', border: '1px solid #ccc', backgroundColor: '#f7f7f7', px: 1, py: 0.5 };
            const cellVal = { border: '1px solid #ccc', px: 1, py: 0.5 };


            const fixedRows = [
              ['Basic', p.C_BASIC],
              ['HRA', p.C_HRA],
              ['Conveyance', p.C_CONV],
              ['Washing Allowance', p.C_OTHERS],
            ];
            const fixedTotal = ['Total Fixed Salary', p.C_TOT_SAL];
            const earnedMatrix = [
              [['Basic', p.C_EARNED_BASIC], ['Attendance Bonus', p.C_EARNED_BONUS]],
              [['HRA', p.C_EARNED_HRA], ['Extra Wage', p.C_EARNED_OT]],
              [['Conveyance', p.C_EARNED_CONV], ['Lunch Allowance', p.C_EARNED_LUNCH]],
              [['Washing Allowance', p.C_EARNED_OTHERS], null],
            ];
            const earnedTotal = ['Total Earnings Salary', p.C_EARNED_GROSS];
            const otherDed = Math.ceil(Number(p.C_DED_OTH) || 0);
            const dedMatrix = [
              [['P.F', p.C_DED_PF], ['Income tax', p.C_DED_TAX]],
              [['E.S.I', p.C_DED_ESI], ['Advance', p.C_DED_ADV]],
              [['P.T', p.C_DED_PT], ['Canteen', p.C_DED_MEALS]],
              [['L.I.C', p.C_DED_LIC], ['Other Deduction', otherDed]],
            ];
            const dedTotal = ['Total Deduction', p.C_TOT_DED];


            return (
              <div className="payslip-container" style={{ padding: '20px', fontSize: '13px' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1.5, borderBottom: '2px solid #333', pb: 1 }}>
                  <img src={logo} alt="Logo" style={{ height: '46px', width: 'auto' }} />
                  <Box sx={{ textAlign: 'left' }}>
                    <h2 style={{ margin: 0, textTransform: 'uppercase' }}>{companyName}</h2>
                    <div style={{ fontSize: '12px' }}>Plot No 21 &amp; 22, Phase IV, IDA, Jeedimetla, Hyderabad</div>
                    <h4 style={{ margin: '6px 0 0' }}>Salary Slip For The Month of : {months[month - 1].label.toUpperCase()} - {year}</h4>
                  </Box>
                </Box>


                <Table size="small" sx={{ borderCollapse: 'collapse', mb: 2, '& td': { border: '1px solid #ccc', fontSize: '12px' } }}>
                  <TableBody>
                    <TableRow>
                      <TableCell sx={cellLabel}>Employee ID</TableCell>
                      <TableCell sx={cellVal}>{p.C_EMPID}</TableCell>
                      <TableCell sx={cellLabel}>D O J</TableCell>
                      <TableCell sx={cellVal}>{formatDOJ(off.doj)}</TableCell>
                      <TableCell sx={cellLabel}>Designation</TableCell>
                      <TableCell sx={cellVal}>{p.C_DESIG}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={cellLabel}>Employee Name</TableCell>
                      <TableCell sx={cellVal} colSpan={5}>{p.C_ENAME}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={cellLabel}>Department</TableCell>
                      <TableCell sx={cellVal}>{p.C_DEPT}</TableCell>
                      <TableCell sx={cellLabel}>Total Days</TableCell>
                      <TableCell sx={cellVal}>{formatCurrency(p.C_TOT_DAYS)}</TableCell>
                      <TableCell sx={cellLabel}>Days Present</TableCell>
                      <TableCell sx={cellVal}>{formatCurrency(p.C_DAYS_PRESENT)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={cellLabel}>Absent Days</TableCell>
                      <TableCell sx={cellVal}>{formatCurrency(p.C_ABSENT_DAYS)}</TableCell>
                      <TableCell sx={cellLabel}>Late Hrs</TableCell>
                      <TableCell sx={cellVal}>{formatCurrency(p.C_LATE_HOURS || 0)}</TableCell>
                      <TableCell sx={cellLabel}>Leaves Allowed</TableCell>
                      <TableCell sx={cellVal}>{formatCurrency(p.C_LEAVES_ALLOWED || 0)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={cellLabel}>UAN Number</TableCell>
                      <TableCell sx={cellVal}>{off.c_uan_no || 'N/A'}</TableCell>
                      <TableCell sx={cellLabel}>ESI Number</TableCell>
                      <TableCell sx={cellVal} colSpan={3}>{p.C_ESI_NUM || off.esiacno || 'N/A'}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>


                <Table size="small" sx={{ borderCollapse: 'collapse', mb: 1, '& td': { border: '1px solid #ccc', fontSize: '12px' }, '& th': { border: '1px solid #ccc', fontSize: '12px', backgroundColor: '#eee' } }}>
                  <TableHead>
                    <TableRow>
                      <TableCell colSpan={2} align="center"><strong>Fixed Salary</strong></TableCell>
                      <TableCell colSpan={4} align="center"><strong>Earnings Salary</strong></TableCell>
                      <TableCell colSpan={4} align="center"><strong>Deductions</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {[0, 1, 2, 3].map((r) => (
                      <TableRow key={r}>
                        <TableCell>{fixedRows[r][0]}</TableCell>
                        <TableCell align="right">{formatCurrency(fixedRows[r][1])}</TableCell>
                        {earnedMatrix[r].map((pair, ci) => pair ? (
                          <React.Fragment key={ci}>
                            <TableCell>{pair[0]}</TableCell>
                            <TableCell align="right">{formatCurrency(pair[1])}</TableCell>
                          </React.Fragment>
                        ) : (
                          <React.Fragment key={ci}><TableCell></TableCell><TableCell></TableCell></React.Fragment>
                        ))}
                        {dedMatrix[r].map((pair, ci) => pair ? (
                          <React.Fragment key={ci}>
                            <TableCell>{pair[0]}</TableCell>
                            <TableCell align="right">{formatCurrency(pair[1])}</TableCell>
                          </React.Fragment>
                        ) : (
                          <React.Fragment key={ci}><TableCell></TableCell><TableCell></TableCell></React.Fragment>
                        ))}
                      </TableRow>
                    ))}
                    <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                      <TableCell sx={{ fontWeight: 700 }}>{fixedTotal[0]}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>{formatCurrency(fixedTotal[1])}</TableCell>
                      <TableCell colSpan={3} sx={{ fontWeight: 700 }}>{earnedTotal[0]}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>{formatCurrency(earnedTotal[1])}</TableCell>
                      <TableCell colSpan={3} sx={{ fontWeight: 700 }}>{dedTotal[0]}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>{formatCurrency(dedTotal[1])}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>


                <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1, mt: 1, fontSize: '13px' }}>
                  <strong>NET Salary : {formatCurrency(p.C_NET_AMT)}</strong>
                  <span>Payment Mode : {p.C_PAY_TYPE || 'Bank'}</span>
                  <span>Bank A/c No : {p.C_BANK_ACNO || '-'}</span>
                </Box>


                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                  <Button variant="contained" startIcon={<PrintIcon />} onClick={handlePrint}>Print Payslip</Button>
                </Box>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>
    </Box>
  );
};


export default PayslipList; 