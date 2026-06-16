import React, { useState, useEffect } from "react";
import {
  Box, Typography, TextField, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, TableFooter, Paper, IconButton, Dialog,
  DialogTitle, DialogContent, DialogActions, Grid, FormControl, InputLabel, Select, MenuItem
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
    IS_esi: 'N', IS_pf: 'N', IS_lic: 'N', IS_ot: 'N',
    tds_amount: '', lic_amount: '', pay_mode: 'Bank'
  });

  const { companyName } = useCompany();

  useEffect(() => {
    fetchSalaryDetails();
  }, []);


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
    setSalaryForm(emp.salary || {
      basic: '', hra: '', conveyance: '', washing_allowance: '',
      IS_esi: 'N', IS_pf: 'N', IS_lic: 'N', IS_ot: 'N',
      tds_amount: '', lic_amount: '', pay_mode: 'Bank'
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
        tds_amount: parseFloat(salaryForm.tds_amount) || 0,
        lic_amount: parseFloat(salaryForm.lic_amount) || 0,
        IS_esi: salaryForm.IS_esi,
        IS_pf: salaryForm.IS_pf,
        IS_lic: salaryForm.IS_lic,
        IS_ot: salaryForm.IS_ot,
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
        <TableCell colSpan={4}></TableCell>
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
        <Typography variant="h6">Employee Salary Setup</Typography>
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
              <TableCell><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {/* Regular Employees Section */}
            {regularEmployees.length > 0 && (
              <>
                <TableRow sx={{ backgroundColor: '#e3f2fd' }}>
                  <TableCell colSpan={14}><strong>Regular Employees ({regularEmployees.length})</strong></TableCell>
                </TableRow>
                {regularEmployees.map((emp, idx) => renderEmpRow(emp, idx))}
                {renderTotalRow(regularEmployees, 'Regular')}
              </>
            )}

            {/* Trainee Employees (9-series) Section */}
            {traineeEmployees.length > 0 && (
              <>
                <TableRow sx={{ backgroundColor: '#fff3e0', mt: 2 }}>
                  <TableCell colSpan={14}><strong>Trainee Employees (9-Series) ({traineeEmployees.length})</strong></TableCell>
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
              <TableCell colSpan={4}></TableCell>
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
            <Grid item xs={3}>
              <FormControl fullWidth size="small">
                <InputLabel>PF</InputLabel>
                <Select name="IS_pf" value={salaryForm.IS_pf} onChange={handleChange} label="PF">
                  <MenuItem value="Y">Yes</MenuItem>
                  <MenuItem value="N">No</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={3}>
              <FormControl fullWidth size="small">
                <InputLabel>ESI</InputLabel>
                <Select name="IS_esi" value={salaryForm.IS_esi} onChange={handleChange} label="ESI">
                  <MenuItem value="Y">Yes</MenuItem>
                  <MenuItem value="N">No</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={3}>
              <FormControl fullWidth size="small">
                <InputLabel>OT</InputLabel>
                <Select name="IS_ot" value={salaryForm.IS_ot} onChange={handleChange} label="OT">
                  <MenuItem value="Y">Yes</MenuItem>
                  <MenuItem value="N">No</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={3}>
              <TextField label="TDS" name="tds_amount" value={salaryForm.tds_amount} onChange={handleChange} fullWidth size="small" />
            </Grid>
            <Grid item xs={3}>
              <TextField label="LIC" name="lic_amount" value={salaryForm.lic_amount} onChange={handleChange} fullWidth size="small" />
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
