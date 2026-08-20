import React, { useState, useEffect } from "react";
import {
  Box, Typography, TextField, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, TableFooter, Paper, IconButton, Dialog,
  DialogTitle, DialogContent, DialogActions, Grid, FormControl, InputLabel, Select, MenuItem,
  Checkbox, FormControlLabel
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import RefreshIcon from "@mui/icons-material/Refresh";
import ClearIcon from "@mui/icons-material/Clear";
import axios from "axios";
import { useToast } from "../../../context/ToastContext";
import { useCompany } from "../../../context/CompanyContext";
import { getErrorMessage } from "../../../utils/errorUtils";

const SalarySetup = () => {
  const { showToast } = useToast();
  const [employees, setEmployees] = useState([]);
  const [editDialog, setEditDialog] = useState(false);
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [salaryForm, setSalaryForm] = useState({
    basic: '', hra: '', conveyance: '', washing_allowance: '',
    IS_esi: false, IS_pf: false, IS_lic: false, IS_ot: false,
    enable_tds: false, enable_lic: false,
    tds_amount: '', lic_amount: '', pay_mode: 'Bank'
  });

  const { companyName } = useCompany();

  const defaultColSettings = {
    fixedBasic: true, fixedHra: true, fixedCa: true, fixedWa: true, fixedGross: true,
    earnedDays: true, earnedBasic: true, earnedHra: true, earnedOthers: true, earnedWa: true,
    earnedAb: true, earnedOtHrs: true, earnedOtAmt: true, earnedTotal: true,
    esi: true, pf: true, pt: true, tds: true, lic: true, otherDed: true, salAdv: true,
    totalDed: true, netAmount: true,
  };
  const [columnSettings, setColumnSettings] = useState(() => {
    try { return { ...defaultColSettings, ...JSON.parse(localStorage.getItem('payrollVisibleCols')) }; } catch { return defaultColSettings; }
  });

  useEffect(() => {
    localStorage.setItem('payrollVisibleCols', JSON.stringify(columnSettings));
  }, [columnSettings]);

  useEffect(() => {
    fetchSalaryDetails();
  }, []);

  const handleColumnToggle = (key) => {
    setColumnSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };


  const refreshData = () => {
    fetchSalaryDetails();
  };

  const fetchSalaryDetails = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/payroll/salary-details`);
      setEmployees(res.data);
    } catch (err) {
      console.error("Error fetching salary details:", err);
    }
  };

  const handleEdit = (emp) => {
    setSelectedEmp(emp);
    const s = emp.salary || {};
    setSalaryForm({
      basic: s.basic || '', hra: s.hra || '', conveyance: s.conveyance || '', washing_allowance: s.washing_allowance || '',
      IS_pf: s.IS_pf === 'Y', IS_esi: s.IS_esi === 'Y', IS_ot: s.IS_ot === 'Y',
      IS_lic: s.IS_lic === 'Y',
      enable_tds: parseFloat(s.tds_amount) > 0,
      enable_lic: parseFloat(s.lic_amount) > 0,
      tds_amount: s.tds_amount || '', lic_amount: s.lic_amount || '', pay_mode: s.pay_mode || 'Bank'
    });
    setEditDialog(true);
  };

  const handleSave = async () => {
    try {
      const data = {
        empid: selectedEmp.empid,
        basic: parseFloat(salaryForm.basic) || 0,
        hra: parseFloat(salaryForm.hra) || 0,
        conveyance: parseFloat(salaryForm.conveyance) || 0,
        washing_allowance: parseFloat(salaryForm.washing_allowance) || 0,
        tds_amount: salaryForm.enable_tds ? (parseFloat(salaryForm.tds_amount) || 0) : 0,
        lic_amount: salaryForm.enable_lic ? (parseFloat(salaryForm.lic_amount) || 0) : 0,
        IS_esi: salaryForm.IS_esi ? 'Y' : 'N',
        IS_pf: salaryForm.IS_pf ? 'Y' : 'N',
        IS_lic: salaryForm.IS_lic ? 'Y' : 'N',
        IS_ot: salaryForm.IS_ot ? 'Y' : 'N',
        pay_mode: salaryForm.pay_mode
      };
      await axios.post(`${import.meta.env.VITE_API_URL}/api/payroll/salary-details`, data);
      showToast("✅ Salary details saved successfully", "success");
      setEditDialog(false);
      fetchSalaryDetails();
    } catch (err) {
      showToast(getErrorMessage(err, "Error saving salary details"), "error");
    }
  };

  const handleChange = (e) => {
    setSalaryForm({ ...salaryForm, [e.target.name]: e.target.value });
  };

  const regularEmployees = employees.filter(emp => !emp.empid.toString().startsWith('9'));
  const traineeEmployees = employees.filter(emp => emp.empid.toString().startsWith('9'));

  const renderEmpRow = (emp, idx) => (
    <TableRow key={emp.empid}>
      <TableCell>{idx + 1}</TableCell>
      <TableCell>{emp.empid}</TableCell>
      <TableCell>{emp.ename}</TableCell>
      <TableCell>{emp.deptname}</TableCell>
      <TableCell>{emp.designation}</TableCell>
      <TableCell>{emp.salary?.basic || '-'}</TableCell>
      <TableCell>{emp.salary?.hra || '-'}</TableCell>
      <TableCell>{emp.salary?.conveyance || '-'}</TableCell>
      <TableCell>{emp.salary?.washing_allowance || '-'}</TableCell>
      <TableCell>{(parseFloat(emp.salary?.basic) || 0) + (parseFloat(emp.salary?.hra) || 0) + (parseFloat(emp.salary?.conveyance) || 0) + (parseFloat(emp.salary?.washing_allowance) || 0)}</TableCell>
      <TableCell>{emp.salary?.IS_pf === 'Y' ? 'Yes' : 'No'}</TableCell>
      <TableCell>{emp.salary?.IS_esi === 'Y' ? 'Yes' : 'No'}</TableCell>
      <TableCell>{emp.salary?.IS_ot === 'Y' ? 'Yes' : 'No'}</TableCell>
      <TableCell>{emp.salary?.tds_amount || '0'}</TableCell>
      <TableCell>{emp.salary?.lic_amount || '0'}</TableCell>
      <TableCell>
        <IconButton size="small" onClick={() => handleEdit(emp)}>
          <EditIcon fontSize="small" />
        </IconButton>
      </TableCell>
    </TableRow>
  );

  const renderTotalRow = (data, label) => {
    const totalBasic = data.reduce((sum, emp) => sum + (parseFloat(emp.salary?.basic) || 0), 0);
    const totalHra = data.reduce((sum, emp) => sum + (parseFloat(emp.salary?.hra) || 0), 0);
    const totalConv = data.reduce((sum, emp) => sum + (parseFloat(emp.salary?.conveyance) || 0), 0);
    const totalWA = data.reduce((sum, emp) => sum + (parseFloat(emp.salary?.washing_allowance) || 0), 0);
    const totalGross = data.reduce((sum, emp) => {
      const s = emp.salary || {};
      return sum + (parseFloat(s.basic) || 0) + (parseFloat(s.hra) || 0) + (parseFloat(s.conveyance) || 0) + (parseFloat(s.washing_allowance) || 0);
    }, 0);

    return (
      <TableRow sx={{ backgroundColor: '#f0f0f0', fontWeight: 'bold' }}>
        <TableCell colSpan={5} align="right"><strong>{label} Totals:</strong></TableCell>
        <TableCell><strong>{totalBasic.toFixed(0)}</strong></TableCell>
        <TableCell><strong>{totalHra.toFixed(0)}</strong></TableCell>
        <TableCell><strong>{totalConv.toFixed(0)}</strong></TableCell>
        <TableCell><strong>{totalWA.toFixed(0)}</strong></TableCell>
        <TableCell><strong>{totalGross.toFixed(0)}</strong></TableCell>
        <TableCell colSpan={6}></TableCell>
      </TableRow>
    );
  };

  return (
    <Box>
      <Box sx={{ mb: 2, textAlign: 'center' }}>
        <Typography variant="h5" color="primary" sx={{ fontWeight: 'bold', textTransform: 'uppercase' }}>
          {companyName}
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'var(--heading-color)', borderLeft: '4px solid', borderColor: 'primary.main', pl: 1.5 }}>Employee Salary Setup</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" size="small" startIcon={<RefreshIcon />} onClick={refreshData}>
            Refresh
          </Button>
          <input
            type="file"
            accept=".csv"
            id="csv-upload"
            style={{ display: 'none' }}
            onChange={async (e) => {
              const file = e.target.files[0];
              if (!file) return;

              const formData = new FormData();
              formData.append('file', file);

              try {
                const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/employees/bulk-update-salaries`, formData, {
                  headers: { 'Content-Type': 'multipart/form-data' }
                });
                showToast(`Salaries updated: ${res.data.processed} rows processed`, 'success');
                fetchSalaryDetails();
              } catch (err) {
                showToast(getErrorMessage(err, "Error importing salaries"), "error");
              }
              // Reset input
              e.target.value = '';
            }}
          />
          <Button
            variant="contained"
            size="small"
            onClick={() => document.getElementById('csv-upload').click()}
          >
            Import from CSV
          </Button>
        </Box>
      </Box>

      <Box sx={{ mb: 2, p: 1.5, bgcolor: '#f5f5ff', borderRadius: 1, border: '1px solid #d0d0ff' }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 0.5 }}>Payroll View Columns (Processed Salary Table)</Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'var(--primary-dark, #1565c0)' }}>Fixed Salary</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0 }}>
              <FormControlLabel control={<Checkbox size="small" checked={columnSettings.fixedBasic !== false} onChange={() => handleColumnToggle('fixedBasic')} />} label={<Typography variant="caption">Basic</Typography>} />
              <FormControlLabel control={<Checkbox size="small" checked={columnSettings.fixedHra !== false} onChange={() => handleColumnToggle('fixedHra')} />} label={<Typography variant="caption">HRA</Typography>} />
              <FormControlLabel control={<Checkbox size="small" checked={columnSettings.fixedCa !== false} onChange={() => handleColumnToggle('fixedCa')} />} label={<Typography variant="caption">CA/Others</Typography>} />
              <FormControlLabel control={<Checkbox size="small" checked={columnSettings.fixedWa !== false} onChange={() => handleColumnToggle('fixedWa')} />} label={<Typography variant="caption">W.A</Typography>} />
              <FormControlLabel control={<Checkbox size="small" checked={columnSettings.fixedGross !== false} onChange={() => handleColumnToggle('fixedGross')} />} label={<Typography variant="caption">Gross Salary</Typography>} />
            </Box>
          </Box>
          <Box>
            <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'var(--primary-dark, #1565c0)' }}>Earned Salary</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0 }}>
              <FormControlLabel control={<Checkbox size="small" checked={columnSettings.earnedDays !== false} onChange={() => handleColumnToggle('earnedDays')} />} label={<Typography variant="caption">No. Days</Typography>} />
              <FormControlLabel control={<Checkbox size="small" checked={columnSettings.earnedBasic !== false} onChange={() => handleColumnToggle('earnedBasic')} />} label={<Typography variant="caption">Basic</Typography>} />
              <FormControlLabel control={<Checkbox size="small" checked={columnSettings.earnedHra !== false} onChange={() => handleColumnToggle('earnedHra')} />} label={<Typography variant="caption">HRA</Typography>} />
              <FormControlLabel control={<Checkbox size="small" checked={columnSettings.earnedOthers !== false} onChange={() => handleColumnToggle('earnedOthers')} />} label={<Typography variant="caption">Others</Typography>} />
              <FormControlLabel control={<Checkbox size="small" checked={columnSettings.earnedWa !== false} onChange={() => handleColumnToggle('earnedWa')} />} label={<Typography variant="caption">W.A</Typography>} />
              <FormControlLabel control={<Checkbox size="small" checked={columnSettings.earnedAb !== false} onChange={() => handleColumnToggle('earnedAb')} />} label={<Typography variant="caption">A.B</Typography>} />
              <FormControlLabel control={<Checkbox size="small" checked={columnSettings.earnedOtHrs !== false} onChange={() => handleColumnToggle('earnedOtHrs')} />} label={<Typography variant="caption">OT Hrs</Typography>} />
              <FormControlLabel control={<Checkbox size="small" checked={columnSettings.earnedOtAmt !== false} onChange={() => handleColumnToggle('earnedOtAmt')} />} label={<Typography variant="caption">OT Amt</Typography>} />
              <FormControlLabel control={<Checkbox size="small" checked={columnSettings.earnedTotal !== false} onChange={() => handleColumnToggle('earnedTotal')} />} label={<Typography variant="caption">Total</Typography>} />
            </Box>
          </Box>
          <Box>
            <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'var(--primary-dark, #1565c0)' }}>Deduction</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0 }}>
              <FormControlLabel control={<Checkbox size="small" checked={columnSettings.esi !== false} onChange={() => handleColumnToggle('esi')} />} label={<Typography variant="caption">ESI</Typography>} />
              <FormControlLabel control={<Checkbox size="small" checked={columnSettings.pf !== false} onChange={() => handleColumnToggle('pf')} />} label={<Typography variant="caption">PF</Typography>} />
              <FormControlLabel control={<Checkbox size="small" checked={columnSettings.pt !== false} onChange={() => handleColumnToggle('pt')} />} label={<Typography variant="caption">PT</Typography>} />
              <FormControlLabel control={<Checkbox size="small" checked={columnSettings.tds !== false} onChange={() => handleColumnToggle('tds')} />} label={<Typography variant="caption">TDS</Typography>} />
              <FormControlLabel control={<Checkbox size="small" checked={columnSettings.lic !== false} onChange={() => handleColumnToggle('lic')} />} label={<Typography variant="caption">LIC</Typography>} />
              <FormControlLabel control={<Checkbox size="small" checked={columnSettings.otherDed !== false} onChange={() => handleColumnToggle('otherDed')} />} label={<Typography variant="caption">Other Ded</Typography>} />
              <FormControlLabel control={<Checkbox size="small" checked={columnSettings.salAdv !== false} onChange={() => handleColumnToggle('salAdv')} />} label={<Typography variant="caption">Sal. Adv</Typography>} />
            </Box>
          </Box>
          <Box>
            <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'var(--primary-dark, #1565c0)' }}>Summary</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0 }}>
              <FormControlLabel control={<Checkbox size="small" checked={columnSettings.totalDed !== false} onChange={() => handleColumnToggle('totalDed')} />} label={<Typography variant="caption">Total Ded</Typography>} />
              <FormControlLabel control={<Checkbox size="small" checked={columnSettings.netAmount !== false} onChange={() => handleColumnToggle('netAmount')} />} label={<Typography variant="caption">Net Amount</Typography>} />
            </Box>
          </Box>
        </Box>
      </Box>

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell><strong>S.No</strong></TableCell>
              <TableCell><strong>Emp ID</strong></TableCell>
              <TableCell><strong>Name</strong></TableCell>
              <TableCell><strong>Department</strong></TableCell>
              <TableCell><strong>Designation</strong></TableCell>
              <TableCell><strong>Basic</strong></TableCell>
              <TableCell><strong>HRA</strong></TableCell>
              <TableCell><strong>Conveyance</strong></TableCell>
              <TableCell><strong>W.A</strong></TableCell>
              <TableCell><strong>Gross</strong></TableCell>
              <TableCell><strong>PF</strong></TableCell>
              <TableCell><strong>ESI</strong></TableCell>
              <TableCell><strong>OT</strong></TableCell>
              <TableCell><strong>TDS</strong></TableCell>
              <TableCell><strong>LIC</strong></TableCell>
              <TableCell><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {/* Regular Employees Section */}
            {regularEmployees.length > 0 && (
              <>
                <TableRow sx={{ backgroundColor: '#e3f2fd' }}>
                  <TableCell colSpan={16}><strong>Regular Employees ({regularEmployees.length})</strong></TableCell>
                </TableRow>
                {regularEmployees.map((emp, idx) => renderEmpRow(emp, idx))}
                {renderTotalRow(regularEmployees, 'Regular')}
              </>
            )}

            {/* Trainee Employees (9-series) Section */}
            {traineeEmployees.length > 0 && (
              <>
                <TableRow sx={{ backgroundColor: '#fff3e0', mt: 2 }}>
                  <TableCell colSpan={16}><strong>Trainee Employees (9-Series) ({traineeEmployees.length})</strong></TableCell>
                </TableRow>
                {traineeEmployees.map((emp, idx) => renderEmpRow(emp, idx))}
                {renderTotalRow(traineeEmployees, 'Trainee')}
              </>
            )}
          </TableBody>
          <TableFooter>
            <TableRow sx={{ backgroundColor: '#333', '& .MuiTableCell-root': { color: '#fff' } }}>
              <TableCell colSpan={5} align="right"><strong>Grand Total ({employees.length}):</strong></TableCell>
              <TableCell><strong>{employees.reduce((sum, emp) => sum + (parseFloat(emp.salary?.basic) || 0), 0).toFixed(0)}</strong></TableCell>
              <TableCell><strong>{employees.reduce((sum, emp) => sum + (parseFloat(emp.salary?.hra) || 0), 0).toFixed(0)}</strong></TableCell>
              <TableCell><strong>{employees.reduce((sum, emp) => sum + (parseFloat(emp.salary?.conveyance) || 0), 0).toFixed(0)}</strong></TableCell>
              <TableCell><strong>{employees.reduce((sum, emp) => sum + (parseFloat(emp.salary?.washing_allowance) || 0), 0).toFixed(0)}</strong></TableCell>
              <TableCell><strong>{employees.reduce((sum, emp) => {
                const s = emp.salary || {};
                return sum + (parseFloat(s.basic) || 0) + (parseFloat(s.hra) || 0) + (parseFloat(s.conveyance) || 0) + (parseFloat(s.washing_allowance) || 0);
              }, 0).toFixed(0)}</strong></TableCell>
              <TableCell colSpan={6}></TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </TableContainer>

      <Dialog open={editDialog} onClose={() => setEditDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Edit Salary - {selectedEmp?.ename}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={3}>
              <TextField label="Basic Salary" name="basic" value={salaryForm.basic} onChange={handleChange} fullWidth size="small" />
            </Grid>
            <Grid item xs={3}>
              <TextField label="HRA" name="hra" value={salaryForm.hra} onChange={handleChange} fullWidth size="small" />
            </Grid>
            <Grid item xs={3}>
              <TextField label="Conveyance" name="conveyance" value={salaryForm.conveyance} onChange={handleChange} fullWidth size="small" />
            </Grid>
            <Grid item xs={3}>
              <TextField label="W.A (Washing)" name="washing_allowance" value={salaryForm.washing_allowance} onChange={handleChange} fullWidth size="small" />
            </Grid>
            <Grid item xs={3}>
              <TextField label="Gross" value={(parseFloat(salaryForm.basic) || 0) + (parseFloat(salaryForm.hra) || 0) + (parseFloat(salaryForm.conveyance) || 0) + (parseFloat(salaryForm.washing_allowance) || 0)} fullWidth size="small" InputProps={{ readOnly: true }} />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2" sx={{ mt: 1, mb: 0.5, color: 'var(--primary-dark, #1565c0)', fontWeight: 'bold' }}>Deductions</Typography>
            </Grid>
            <Grid item xs={2}>
              <FormControlLabel
                control={<Checkbox checked={salaryForm.IS_pf} onChange={(e) => setSalaryForm({ ...salaryForm, IS_pf: e.target.checked })} />}
                label="PF"
              />
            </Grid>
            <Grid item xs={2}>
              <FormControlLabel
                control={<Checkbox checked={salaryForm.IS_esi} onChange={(e) => setSalaryForm({ ...salaryForm, IS_esi: e.target.checked })} />}
                label="ESI"
              />
            </Grid>
            <Grid item xs={2}>
              <FormControlLabel
                control={<Checkbox checked={salaryForm.IS_ot} onChange={(e) => setSalaryForm({ ...salaryForm, IS_ot: e.target.checked })} />}
                label="OT"
              />
            </Grid>
            <Grid item xs={6} />
            <Grid item xs={3} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Checkbox checked={salaryForm.enable_tds} onChange={(e) => setSalaryForm({ ...salaryForm, enable_tds: e.target.checked })} />
              <TextField label="TDS Amount" name="tds_amount" value={salaryForm.tds_amount} onChange={handleChange} fullWidth size="small" disabled={!salaryForm.enable_tds} />
            </Grid>
            <Grid item xs={3} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Checkbox checked={salaryForm.enable_lic} onChange={(e) => setSalaryForm({ ...salaryForm, enable_lic: e.target.checked })} />
              <TextField label="LIC Amount" name="lic_amount" value={salaryForm.lic_amount} onChange={handleChange} fullWidth size="small" disabled={!salaryForm.enable_lic} />
            </Grid>
            <Grid item xs={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Pay Mode</InputLabel>
                <Select name="pay_mode" value={salaryForm.pay_mode} onChange={handleChange} label="Pay Mode">
                  <MenuItem value="Bank">Bank Transfer</MenuItem>
                  <MenuItem value="Cash">Cash</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog(false)}>Cancel</Button>
          <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSave}>Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SalarySetup;
