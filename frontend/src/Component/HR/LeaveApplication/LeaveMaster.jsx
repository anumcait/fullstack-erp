import React, { useEffect, useState } from "react";
import {
  Box, Card, CardContent, Typography, Grid, TextField, Button,
  Table, TableHead, TableBody, TableRow, TableCell, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, FormControl,
  InputLabel, Select, MenuItem, LinearProgress, Alert
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import axios from "axios";
import { useToast } from "../../../context/ToastContext";
import { formatDateOnly } from "../../../utils/dateUtils";

const LeaveMaster = () => {
  const { showToast } = useToast();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dialog, setDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    empid: "",
    cls_balance: 0,
    cls_utilised: 0,
    els_balance: 0,
    els_utilised: 0,
    yr: new Date().getFullYear(),
    remarks: "",
    final_status: "0"
  });

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/employees`);
      const empWithLeave = res.data.map((emp, idx) => ({
        id: emp.empid,
        sno: idx + 1,
        empid: emp.empid,
        ename: emp.ename,
        deptname: emp.deptname || "-",
        division: emp.divname || "-",
        unit: emp.unit_id || "-",
        cls_balance: emp.LeaveMaster?.cls_balance || 0,
        cls_utilised: emp.LeaveMaster?.cls_utilised || 0,
        els_balance: emp.LeaveMaster?.els_balance || 0,
        els_utilised: emp.LeaveMaster?.els_utilised || 0,
        yr: emp.LeaveMaster?.yr || new Date().getFullYear(),
        final_status: emp.LeaveMaster?.final_status || "0"
      }));
      setEmployees(empWithLeave);
    } catch (err) {
      console.error("Error fetching employees:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (emp = null) => {
    if (emp) {
      setFormData({
        empid: emp.empid,
        cls_balance: emp.cls_balance,
        cls_utilised: emp.cls_utilised,
        els_balance: emp.els_balance,
        els_utilised: emp.els_utilised,
        yr: emp.yr,
        remarks: "",
        final_status: emp.final_status
      });
      setEditMode(true);
    } else {
      setFormData({
        empid: "",
        cls_balance: 0,
        cls_utilised: 0,
        els_balance: 0,
        els_utilised: 0,
        yr: new Date().getFullYear(),
        remarks: "",
        final_status: "0"
      });
      setEditMode(false);
    }
    setDialog(true);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (!formData.empid) {
      showToast("Please select an employee", "error");
      return;
    }
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/leave/master/save`, {
        empid: parseInt(formData.empid),
        cls_balance: parseFloat(formData.cls_balance) || 0,
        cls_utilised: parseFloat(formData.cls_utilised) || 0,
        els_balance: parseFloat(formData.els_balance) || 0,
        els_utilised: parseFloat(formData.els_utilised) || 0,
        yr: formData.yr,
        remarks: formData.remarks,
        final_status: formData.final_status
      });
      showToast("✅ Leave master saved successfully", "success");
      setDialog(false);
      fetchEmployees();
    } catch (err) {
      showToast("❌ Error saving leave master", "error");
    }
  };

  return (
    <Card sx={{ m: 2 }}>
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee' }}>
        <Typography variant="h6">Leave Master</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
          Add Leave Config
        </Button>
      </Box>

      <CardContent>
        {loading && <LinearProgress sx={{ mb: 2 }} />}

        <Table size="small" sx={{ border: '1px solid #ccc' }}>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell><strong>S.No</strong></TableCell>
              <TableCell><strong>Emp ID</strong></TableCell>
              <TableCell><strong>Name</strong></TableCell>
              <TableCell><strong>Department</strong></TableCell>
              <TableCell><strong>CL Balance</strong></TableCell>
              <TableCell><strong>CL Utilized</strong></TableCell>
              <TableCell><strong>EL Balance</strong></TableCell>
              <TableCell><strong>EL Utilized</strong></TableCell>
              <TableCell><strong>Year</strong></TableCell>
              <TableCell><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {employees.length === 0 ? (
              <TableRow>
                <TableCell colSpan={11} align="center" sx={{ py: 3, color: '#777' }}>
                  No employees found
                </TableCell>
              </TableRow>
            ) : (
              employees.map((emp) => (
                <TableRow key={emp.empid}>
                  <TableCell>{emp.sno}</TableCell>
                  <TableCell>{emp.empid}</TableCell>
                  <TableCell>{emp.ename}</TableCell>
                  <TableCell>{emp.deptname}</TableCell>
                  <TableCell>{emp.cls_balance}</TableCell>
                  <TableCell>{emp.cls_utilised}</TableCell>
                  <TableCell>{emp.els_balance}</TableCell>
                  <TableCell>{emp.els_utilised}</TableCell>
                  <TableCell>{emp.yr}</TableCell>
                  <TableCell>
                    <IconButton size="small" onClick={() => handleOpenDialog(emp)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>

      <Dialog open={dialog} onClose={() => setDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editMode ? 'Edit Leave Configuration' : 'Add Leave Configuration'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth size="small">
                <InputLabel>Employee</InputLabel>
                <Select
                  name="empid"
                  value={formData.empid}
                  onChange={handleChange}
                  label="Employee"
                  disabled={editMode}
                >
                  <MenuItem value=""><em>Select Employee</em></MenuItem>
                  {employees.map(emp => (
                    <MenuItem key={emp.empid} value={emp.empid}>
                      {emp.empid} - {emp.ename}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth size="small" label="CL Balance" type="number" name="cls_balance" value={formData.cls_balance} onChange={handleChange} />
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth size="small" label="CL Utilized" type="number" name="cls_utilised" value={formData.cls_utilised} onChange={handleChange} />
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth size="small" label="EL Balance" type="number" name="els_balance" value={formData.els_balance} onChange={handleChange} />
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth size="small" label="EL Utilized" type="number" name="els_utilised" value={formData.els_utilised} onChange={handleChange} />
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth size="small" label="Year" type="number" name="yr" value={formData.yr} onChange={handleChange} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialog(false)}>Cancel</Button>
          <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSave}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default LeaveMaster;
