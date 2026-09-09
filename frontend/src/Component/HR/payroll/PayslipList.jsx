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
import "./PayslipPreview.css";


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
    // Return empty string when no value — as requested by user
    if (!d) return '';
    try {
      let dateString = '';
      if (d instanceof Date) {
        dateString = d.toISOString().split('T')[0];
      } else if (typeof d === 'string') {
        dateString = d.split('T')[0];
      } else {
        dateString = new Date(d).toISOString().split('T')[0];
      }

      const parts = dateString.split('-');
      if (parts.length === 3) {
        const yearStr = parts[0];
        const monthIndex = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);
        // If year looks like a DOB year (before 2000), return empty
        if (parseInt(yearStr, 10) < 2000) return '';
        if (monthIndex >= 0 && monthIndex < 12) {
          return `${day}-${MONTHS3[monthIndex]}-${yearStr.substring(2)}`;
        }
      }
    } catch (e) {
      console.error("Error formatting DOJ:", e);
    }
    const dt = new Date(d);
    if (isNaN(dt) || dt.getFullYear() < 2000) return '';
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
            const otherDed = Math.ceil(Number(p.C_DED_OTH) || 0);

            return (
              <div className="payslip-print-container" id="payslip-modal-content">

                {/* Unified 10-Column Table Layout */}
                <table className="payslip-table payslip-outer-border">
                  <colgroup>
                    <col style={{ width: '14%' }} />
                    <col style={{ width: '9%' }} />
                    <col style={{ width: '13%' }} />
                    <col style={{ width: '7%' }} />
                    <col style={{ width: '14%' }} />
                    <col style={{ width: '5%' }} />
                    <col style={{ width: '8%' }} />
                    <col style={{ width: '8%' }} />
                    <col style={{ width: '12%' }} />
                    <col style={{ width: '10%' }} />
                  </colgroup>
                  <tbody>

                    {/* Header: Logo and Company Title */}
                    <tr>
                      <td colSpan={10} style={{ position: 'relative', textAlign: 'center', padding: '5px', border: '1px solid #000', height: '52px' }}>
                        <img src={logo} alt="Logo" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', maxHeight: '42px' }} />
                        <h2 className="payslip-company-title" style={{ margin: 0, textAlign: 'center' }}>{companyName || "AUCTOR HOME APPLIANCES LLP"}</h2>
                      </td>
                    </tr>

                    {/* Address Line */}
                    <tr className="payslip-bg-grey payslip-text-center payslip-address-row">
                      <td colSpan={10}>
                        Plot No 21 &amp; 22, Phase IV, IDA, Jeedimetla, Hyderabad
                      </td>
                    </tr>

                    {/* Month Title */}
                    <tr className="payslip-text-center payslip-title-row">
                      <td colSpan={10}>
                        Salary Slip For The Month of : {(p.C_MONTH || '').toUpperCase()} - {p.C_YEAR}
                      </td>
                    </tr>

                    {/* Employee Info Row 1: EmpID | value | D O J: (2cols) | Designation: | value */}
                    <tr>
                      <td className="payslip-bold" colSpan={1}>Employee ID</td>
                      <td className="payslip-bold" colSpan={2}>{p.C_EMPID}</td>
                      <td colSpan={2}>D O J :</td>
                      <td colSpan={2}>Designation:</td>
                      <td colSpan={3}>{p.C_DESIG}</td>
                    </tr>

                    {/* Employee Info Row 2: EmpName | value | DOJ-value | (continues) | Department: | value */}
                    <tr>
                      <td colSpan={1}>Employee Name</td>
                      <td className="payslip-bold" colSpan={2}>{p.C_ENAME}</td>
                      <td colSpan={2}>{formatDOJ(off.doj)}</td>
                      <td colSpan={2}>Department:</td>
                      <td colSpan={3}>{p.C_DEPT}</td>
                    </tr>

                    {/* Stats Row 1 */}
                    <tr>
                      <td colSpan={1}>Total Days</td>
                      <td className="payslip-text-center" colSpan={1}>{Math.round(p.C_TOT_DAYS)}</td>
                      <td colSpan={1}>Days Present:</td>
                      <td className="payslip-text-center" colSpan={1}>{Math.round(p.C_DAYS_PRESENT)}</td>
                      <td colSpan={1}>Leaves Allowed:</td>
                      <td className="payslip-text-center" colSpan={1}>{Math.round(p.C_LEAVES_ALLOWED || 0)}</td>
                      <td colSpan={2}>UAN Number</td>
                      <td className="payslip-bold payslip-text-center" colSpan={2}>{off.c_uan_no || 'N/A'}</td>
                    </tr>

                    {/* Stats Row 2 */}
                    <tr>
                      <td colSpan={1}>Absent Days</td>
                      <td className="payslip-text-center" colSpan={1}>{Number(p.C_ABSENT_DAYS).toFixed(1)}</td>
                      <td colSpan={1}>Late Hrs</td>
                      <td className="payslip-text-center" colSpan={1}>{p.C_LATE_HOURS || 0}</td>
                      <td colSpan={1}>Late: D:</td>
                      <td className="payslip-text-center" colSpan={1}>{p.C_LATE_HALF_DAYS || 0}</td>
                      <td colSpan={2}>ESI Number</td>
                      <td className="payslip-text-center" colSpan={2}>{p.C_ESI_NUM || off.esiacno || 'N/A'}</td>
                    </tr>

                    {/* Salary Section Headers */}
                    <tr className="payslip-bg-grey payslip-bold payslip-text-center">
                      <td colSpan={2}>Fixed Salary</td>
                      <td colSpan={4}>Earnings Salary</td>
                      <td colSpan={4}>Deductions</td>
                    </tr>

                    {/* Salary Breakdown Row 1 */}
                    <tr>
                      <td>Basic</td>
                      <td className="payslip-text-right">{formatCurrency(p.C_BASIC)}</td>
                      <td>Basic</td>
                      <td className="payslip-text-right">{formatCurrency(p.C_EARNED_BASIC)}</td>
                      <td>Attendance Bonus</td>
                      <td className="payslip-text-right">{formatCurrency(p.C_EARNED_BONUS)}</td>
                      <td>P.F</td>
                      <td className="payslip-text-right">{formatCurrency(p.C_DED_PF)}</td>
                      <td>Income tax</td>
                      <td className="payslip-text-right">{formatCurrency(p.C_DED_TAX)}</td>
                    </tr>

                    {/* Salary Breakdown Row 2 */}
                    <tr>
                      <td>HRA</td>
                      <td className="payslip-text-right">{formatCurrency(p.C_HRA)}</td>
                      <td>HRA</td>
                      <td className="payslip-text-right">{formatCurrency(p.C_EARNED_HRA)}</td>
                      <td>Extra Wage</td>
                      <td className="payslip-text-right">{formatCurrency(p.C_EARNED_OT)}</td>
                      <td>E.S.I</td>
                      <td className="payslip-text-right">{formatCurrency(p.C_DED_ESI)}</td>
                      <td>Advance</td>
                      <td className="payslip-text-right">{formatCurrency(p.C_DED_ADV)}</td>
                    </tr>

                    {/* Salary Breakdown Row 3 */}
                    <tr>
                      <td>Conveyance</td>
                      <td className="payslip-text-right">{formatCurrency(p.C_CONV)}</td>
                      <td>Conveyance</td>
                      <td className="payslip-text-right">{formatCurrency(p.C_EARNED_CONV)}</td>
                      <td>Lunch Allowance</td>
                      <td className="payslip-text-right">{formatCurrency(p.C_EARNED_LUNCH || 0)}</td>
                      <td>P.T</td>
                      <td className="payslip-text-right">{formatCurrency(p.C_DED_PT)}</td>
                      <td>Canteen</td>
                      <td className="payslip-text-right">{formatCurrency(p.C_DED_MEALS || 0)}</td>
                    </tr>

                    {/* Salary Breakdown Row 4 */}
                    <tr>
                      <td>Washing Allowance</td>
                      <td className="payslip-text-right">{formatCurrency(p.C_OTHERS)}</td>
                      <td>Washing Allowance</td>
                      <td className="payslip-text-right">{formatCurrency(p.C_EARNED_OTHERS)}</td>
                      <td></td>
                      <td></td>
                      <td>L.I.C</td>
                      <td className="payslip-text-right">{formatCurrency(p.C_DED_LIC)}</td>
                      <td>Other Deduction</td>
                      <td className="payslip-text-right">{formatCurrency(otherDed)}</td>
                    </tr>

                    {/* Totals Row */}
                    <tr className="payslip-bold">
                      <td>Total Fixed Salary</td>
                      <td className="payslip-text-right">{formatCurrency(p.C_TOT_SAL)}</td>
                      <td colSpan={2}>Total Earnings Salary :</td>
                      <td className="payslip-text-right" colSpan={2}>{formatCurrency(p.C_EARNED_GROSS)}</td>
                      <td colSpan={2}>Total Deduction:</td>
                      <td className="payslip-text-right" colSpan={2}>{formatCurrency(p.C_TOT_DED)}</td>
                    </tr>

                    {/* Net Salary & Bank Info Bar */}
                    <tr className="payslip-bold">
                      <td>NET Salary :</td>
                      <td className="payslip-text-right">{formatCurrency(p.C_NET_AMT)}</td>
                      <td colSpan={2} className="payslip-bold" style={{ fontWeight: 'normal' }}>Payment Mode :</td>
                      <td colSpan={2}>{p.C_PAY_TYPE || 'Bank'}</td>
                      <td colSpan={2} className="payslip-bold" style={{ fontWeight: 'normal' }}>Bank A/c No :</td>
                      <td colSpan={2}>{p.C_BANK_ACNO || '-'}</td>
                    </tr>

                  </tbody>
                </table>

                <div className="payslip-actions-bar">
                  <Button variant="contained" startIcon={<PrintIcon />} onClick={handlePrint}>Print Payslip</Button>
                </div>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>
    </Box>
  );
};


export default PayslipList; 