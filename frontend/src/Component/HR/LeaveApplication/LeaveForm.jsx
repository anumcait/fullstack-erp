import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import LeaveGrid from './LeaveGrid';
import './LeaveApplication.css';
import axios from 'axios';
import { useToast } from "../../../context/ToastContext";
import { formatDate } from "../../../utils/dateUtils";
import {
  Box, Grid, Typography, TextField, MenuItem, Button, Stack, IconButton, Select, InputLabel, FormControl, InputAdornment, Divider
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import EmployeeSelectDialog from '../Employee/EmployeeSelectDialog';

axios.defaults.baseURL = import.meta.env.VITE_API_URL;

const LeaveForm = ({ onClose }) => {
  const { showToast } = useToast();
  const navigate = useNavigate();

  const getCurrentISTDateTime = () => {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const hh = String(now.getHours()).padStart(2, '0');
    const min = String(now.getMinutes()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
  };

  const [formData, setFormData] = useState({
    lappNo: '',
    date: getCurrentISTDateTime(),
    empId: '',
    ename: '',
    department: '',
    designation: '',
    purpose: 'PERSONAL',
    clUsed: 0,
    clBalance: 0,
    elUsed: 0,
    elBalance: 0,
    address: '',
    phone: ''
  });

  const [leaveDetails, setLeaveDetails] = useState([
    { dayType: 'FULL DAY', fromDate: '', toDate: '', noOfDays: '', remarks: '' }
  ]);

  const [employeeList, setEmployeeList] = useState([]);
  const [showEmpPopup, setShowEmpPopup] = useState(false);
  const [totalDays, setTotalDays] = useState(0);
  const [isInvalid, setIsInvalid] = useState(false);
  const [gridKey, setGridKey] = useState(Date.now());
  const purposeRef = useRef(null);

  const loadEmpList = async () => {
    try {
      const res = await axios.get(`/api/employees`);
      setEmployeeList(res.data);
      setShowEmpPopup(true);
    } catch (err) {
      showToast('Failed to load employee list', 'error');
      console.error(err);
    }
  };

  const selectEmployee = async (emp) => {
    setFormData(prev => ({
      ...prev,
      empId: emp.empid,
      ename: emp.ename,
      department: emp.department,
      designation: emp.designation,
      clUsed: 0,
      clBalance: 0,
      elUsed: 0,
      elBalance: 0,
    }));
    setShowEmpPopup(false);
    try {
      const res = await axios.get(`/api/leave/balance/${emp.empid}`);
      setFormData(prev => ({
        ...prev,
        clUsed: res.data.clUsed,
        clBalance: res.data.clBalance,
        elUsed: res.data.elUsed,
        elBalance: res.data.elBalance,
      }));
    } catch (error) {
      console.error('Failed to fetch leave balance:', error);
      showToast('Failed to fetch leave balance', 'error');
    }

    setTimeout(() => {
      if (purposeRef.current) purposeRef.current.focus();
    }, 100);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleClose = () => {
    if (onClose) onClose();
    else navigate('/leave-report');
  };

  const validateForm = () => {
    if (!formData.empId) {
      showToast('Please fill mandatory employee details', "error");
      return false;
    }
    for (let i = 0; i < leaveDetails.length; i++) {
      const row = leaveDetails[i];
      if (!row.fromDate || !row.toDate || !row.dayType || !row.noOfDays) {
        showToast(`Row ${i + 1}: Please fill all fields.`, "error");
        return false;
      }
      if (new Date(row.fromDate) > new Date(row.toDate)) {
        showToast(`Row ${i + 1}: From date should be before or equal to To date.`, "error");
        return false;
      }
    }
    return true;
  };

  const resetForm = async () => {
    try {
      const res = await axios.get(`/api/leave/next-lno`);
      setFormData(prev => ({
        ...prev,
        lappNo: res.data.nextLno,
        date: getCurrentISTDateTime(),
        empId: '',
        ename: '',
        department: '',
        designation: '',
        purpose: 'PERSONAL',
        address: '',
        phone: '',
        clUsed: 0,
        clBalance: 0,
        elUsed: 0,
        elBalance: 0,
      }));
      setLeaveDetails([{ dayType: 'FULL DAY', fromDate: '', toDate: '', noOfDays: '', remarks: '' }]);
      setGridKey(Date.now());
    } catch (error) {
      console.error('Failed to fetch next leave number:', error);
    }
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    const application = {
      lno: parseInt(formData.lappNo),
      ldate: new Date(),
      empid: parseInt(formData.empId),
      ename: formData.ename,
      designation: formData.designation,
      department: formData.department,
      pofl: formData.purpose,
      address: formData.address,
      phno: formData.phone,
      c_unit: 'UNIT1',
      c_gempid: 'admin'
    };
    const details = leaveDetails.map((item) => ({
      daydt: item.dayType,
      frmdt: item.fromDate,
      todate: item.toDate,
      nod: parseFloat(item.noOfDays),
      remarks: item.remarks,
      empno: parseInt(formData.empId),
      c_unit: 'UNIT1',
      c_gempid: 'admin'
    }));
    try {
      const res = await axios.post(`/api/leave/apply`, { application, leaveDetails: details });
      if (res.status === 200) {
        showToast(`Leave Application Saved. No: ${res.data.lno}`, "success");
        resetForm();
      }
    } catch (error) {
      console.error('Save failed', error);
      showToast(error.response?.data?.message || "Error saving leave!", "error");
    }
  };

  useEffect(() => {
    const total = leaveDetails.reduce((sum, row) => {
      const val = parseFloat(row.noOfDays);
      return sum + (isNaN(val) ? 0 : val);
    }, 0);
    setTotalDays(total);
  }, [leaveDetails]);

  useEffect(() => {
    resetForm();
  }, []);

  return (
    <Box sx={{ p: 2 }}>
      <div className="p-6 max-w-4xl mx-auto bg-white border rounded-lg shadow">
        {/* Standard Header: Left aligned App No and Date with Time */}
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h6" fontWeight={700}>Leave Application Form</Typography>
          <IconButton onClick={handleClose}><CloseIcon /></IconButton>
        </Stack>

        <Box sx={{ mb: 2, display: 'flex', gap: 4, justifyContent: 'flex-start', alignItems: 'center' }}>
          <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="body2" color="text.secondary">Leave ID:</Typography>
            <Typography fontWeight={600}>{formData.lappNo}</Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="body2" color="text.secondary">Date:</Typography>
            <Typography fontWeight={600}>{formatDate(formData.date)}</Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="body2" color="text.secondary">Application Date:</Typography>
            <Typography fontWeight={600} sx={{ color: 'primary.main' }}>{formatDate(formData.date)}</Typography>
          </Box>
        </Box>

        <Divider sx={{ mb: 2 }} />

        {/* User's Original Layout Split (sm=8 for inputs, sm=4 for summary) */ }
        <Grid container spacing={2}>
          <Grid item xs={12} sm={8}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm="auto">
                <TextField
                  label="Emp Id"
                  name="empId"
                  value={formData.empId}
                  onClick={loadEmpList}
                  size="small"
                  placeholder="Select Employee"
                  fullWidth
                  sx={{ width: { sm: '180px' } }}
                  InputProps={{
                    readOnly: true,
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton size="small" onClick={loadEmpList}>
                          <SearchIcon fontSize="small" />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} sm sx={{ flexGrow: 1 }}>
                <Box sx={{ p: 1, bgcolor: '#f8f9fa', borderRadius: 1, border: '1px solid #e0e0e0', width: '100%' }}>
                  <Typography fontWeight={600} variant="subtitle2">
                    Name: {formData.ename || "--"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Dept: {formData.department || "--"} • Desig: {formData.designation || "--"}
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl size="small" fullWidth>
                  <InputLabel>Purpose of Leave</InputLabel>
                  <Select
                    name="purpose"
                    value={formData.purpose}
                    onChange={handleChange}
                    label="Purpose of Leave"
                    inputRef={purposeRef}
                  >
                    <MenuItem value="PERSONAL">PERSONAL</MenuItem>
                    <MenuItem value="SICK">SICK</MenuItem>
                    <MenuItem value="EMERGENCY">EMERGENCY</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Phone Number"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  size="small"
                  fullWidth
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Address / Reason"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  fullWidth
                  size="small"
                  multiline
                  rows={2}
                  placeholder="Enter address or reason for leave..."
                />
              </Grid>
            </Grid>
          </Grid>

           {/* Leave Summary Section Reverted to Old Layout */}
           <Box component="fieldset" sx={{ border: '1px solid #e0e0e0', borderRadius: 1, p: 2, mb: 2, bgcolor: '#fafafa' }}>
             <Typography component="legend" variant="subtitle2" fontWeight={700} color="primary.main" sx={{ px: 1 }}>
               Leave Summary
             </Typography>
             <Grid container spacing={2} justifyContent="flex-start">
               <Grid item xs={12} sm={6} md={2.4}>
                 <Paper sx={{ p: 1, textAlign: "center", bgcolor: "#e3f2fd" }}>
                   <Typography variant="body2">CLs Utilised</Typography>
                   <Typography variant="h6" fontWeight="bold">{formData.clUsed}</Typography>
                 </Paper>
               </Grid>
               <Grid item xs={12} sm={6} md={2.4}>
                 <Paper sx={{ p: 1, textAlign: "center", bgcolor: "#f1f8e9" }}>
                   <Typography variant="body2">ELs Utilised</Typography>
                   <Typography variant="h6" fontWeight="bold">{formData.elUsed}</Typography>
                 </Paper>
               </Grid>
               <Grid item xs={12} sm={6} md={2.4}>
                 <Paper sx={{ p: 1, textAlign: "center", bgcolor: "#ede7f6" }}>
                   <Typography variant="body2">CLs Balance</Typography>
                   <Typography variant="h6" fontWeight="bold">{formData.clBalance}</Typography>
                 </Paper>
               </Grid>
               <Grid item xs={12} sm={6} md={2.4}>
                 <Paper sx={{ p: 1, textAlign: "center", bgcolor: "#ede7f6" }}>
                   <Typography variant="body2">ELs Balance</Typography>
                   <Typography variant="h6" fontWeight="bold">{formData.elBalance}</Typography>
                 </Paper>
               </Grid>
               <Grid item xs={12} sm={6} md={2.4}>
                 <Paper sx={{ p: 1, textAlign: "center", bgcolor: "orange" }}>
                   <Typography variant="body2">Total Leaves Applied</Typography>
                   <Typography variant="h6" fontWeight="bold">{totalDays}</Typography>
                 </Paper>
               </Grid>
             </Grid>
           </Box>
        </Grid>



        <LeaveGrid
          key={gridKey}
          leaveDetails={leaveDetails}
          setLeaveDetails={setLeaveDetails}
          onValidationError={(hasError) => setIsInvalid(hasError)}
        />

        <div className="save-btn-row" style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
          <button className="save-btn" disabled={isInvalid} onClick={handleSave} style={{ padding: '8px 16px', background: '#1976d2', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
            Save
          </button>
        </div>
      </div >

  <EmployeeSelectDialog
    open={showEmpPopup}
    onClose={() => setShowEmpPopup(false)}
    onSelect={selectEmployee}
    data={employeeList}
  />
    </Box >
  );
};

export default LeaveForm;
