import React, { useState, useEffect } from "react";
import {
  Box, Typography, TextField, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, IconButton, Dialog,
  DialogTitle, DialogContent, DialogActions, Grid, FormControl, InputLabel, Select, MenuItem
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import RefreshIcon from "@mui/icons-material/Refresh";
import ClearIcon from "@mui/icons-material/Clear";
import axios from "axios";
import { useToast } from "../../../context/ToastContext";
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

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6">Employee Salary Setup</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" size="small" startIcon={<RefreshIcon />} onClick={refreshData}>
            Refresh
          </Button>
          <Button variant="contained" size="small" onClick={async () => {
            if (!window.confirm('Import salaries from CSV? This will update all employee salaries.')) return;
            try {
              await axios.post(`${import.meta.env.VITE_API_URL}/api/employees/bulk-update-salaries`);
              showToast('Salaries imported successfully', 'success');
              fetchSalaryDetails();
            } catch (err) {
              showToast(getErrorMessage(err, "Error importing salaries"), "error");
            }
          }}>
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
            {employees.map((emp, idx) => (
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
            ))}
          </TableBody>
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
