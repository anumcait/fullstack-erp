import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import LeaveGrid from './LeaveGrid';
import './LeaveApplication.css';
import axios from 'axios';
import { useToast } from "../../../context/ToastContext";
import {
  Box, Grid, Typography, TextField, MenuItem, Button, Paper, IconButton, Select, InputLabel, FormControl, Dialog, DialogTitle, DialogContent, Table, TableHead, TableRow, TableCell, TableBody,
  InputAdornment
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import EmployeeSelectDialog from '../Employee/EmployeeSelectDialog';

axios.defaults.baseURL = import.meta.env.VITE_API_URL;

const LeaveForm = () => {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    lappNo: '',
    date: new Date().toISOString().split('T')[0],
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
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/employees`);
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
      console.log('Fetching leave balance for empid:', emp.empid);
      // Fetch leave balances for this employee from Leave Master API
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/leave/balance/${emp.empid}`);

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
      // focus purpose after selection if possible
      if (purposeRef.current) purposeRef.current.focus();
    }, 100);
  };


  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleClose = () => {
    navigate('/leave-report');
  };

  const handleKeyDown = (e, currentFieldName) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const formElements = Array.from(document.querySelectorAll('input, select, textarea'));
      const index = formElements.findIndex(el => el.name === currentFieldName);
      if (index > -1 && index + 1 < formElements.length) {
        formElements[index + 1].focus();
      }
    }
  };

  const validateForm = () => {
    if (!formData.empId) {
      showToast('Please fill mandatory employee details', "error");
      return false;
    }
    for (let i = 0; i < leaveDetails.length; i++) {
      const row = leaveDetails[i];
      if (!row.fromDate || !row.toDate || !row.dayType || !row.noOfDays) {
        alert(`Row ${i + 1}: Please fill all fields.`);
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
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/leave/next-lno`);
      const data = await res.json();

      setFormData(prev => ({
        ...prev,
        lappNo: data.nextLno,
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

      setLeaveDetails([
        {
          dayType: 'FULL DAY',
          fromDate: '',
          toDate: '',
          noOfDays: '',
          remarks: ''
        }
      ]);
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
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/leave/apply`, {

        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ application, leaveDetails: details })
      });
      const data = await res.json();
      if (res.ok) {
        console.log(data);
        showToast(`Leave Application Saved. No: ${data.lno}`, "success");
        resetForm(); // Clear form and reload with new LNO if needed

        // navigate('/leave/report'); // ⬅️ Navigate to report
      } else {
        throw new Error(data.message || 'Failed to save leave');
      }
    } catch (error) {
      console.error('Save failed', error);
      showToast(error.message || "Error saving leave!", "error");
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
    if (purposeRef.current) {
      purposeRef.current.focus();
    }
  }, []);

  useEffect(() => {
    const handleKeyShortcuts = (e) => {
      if (e.ctrlKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener('keydown', handleKeyShortcuts);
    return () => window.removeEventListener('keydown', handleKeyShortcuts);
  }, []);



  useEffect(() => {
    resetForm();  // 👈 runs on form load or refresh
  }, []);

  return (
    <div className="leave-container">

      <div className="form-header">
        <h2>Leave Application Form</h2>
        <button className="close-btn" onClick={handleClose}>✖</button>
      </div>

      <div className="leave-form-grid" style={{ overflow: 'auto' }}>
        <div><label>LApp No</label><input value={formData.lappNo} disabled /></div>
        <div><label>Date</label><input value={formData.date} disabled /></div>

        {/* Emp Id Section - Refactored for LOV */}
        <div>
          <label>Emp Id</label>
          <TextField
            size="small"
            fullWidth
            placeholder="Select Employee"
            value={formData.empId || ""}
            onClick={loadEmpList}
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
            sx={{
              bgcolor: 'white',
              '& .MuiOutlinedInput-root': { paddingRight: 1 }
            }}
          />
        </div>

        <div><label>Ename</label><input name="ename" value={formData.ename} onChange={handleChange} onKeyDown={(e) => handleKeyDown(e, 'ename')} disabled /></div>
        <div><label>Department</label><input name="department" value={formData.department} onChange={handleChange} onKeyDown={(e) => handleKeyDown(e, 'department')} disabled /></div>
        <div><label>Designation</label><input name="designation" value={formData.designation} onChange={handleChange} onKeyDown={(e) => handleKeyDown(e, 'purpose')} disabled /></div>

        <div className="leave-summary-box" style={{ gridRow: '1 / span 3', gridColumn: '3 / 5' }}>
          <div className="summary-title">Leave Summary</div>
          <div className="summary-grid">

            <div><label>CLs Utilised</label><input value={formData.clUsed} disabled /></div>
            <div><label>ELs Utilised</label><input value={formData.elUsed} disabled /></div>
            <div><label>CLs Balance</label><input value={formData.clBalance} disabled /></div>
            <div><label>ELs Balance</label><input value={formData.elBalance} disabled /></div>
          </div>
        </div>

        <div><label>Purpose of Leave</label>
          <select ref={purposeRef} name="purpose" value={formData.purpose} onChange={handleChange} onKeyDown={(e) => handleKeyDown(e, 'purpose')}>
            <option value="PERSONAL">PERSONAL</option>
            <option value="SICK">SICK</option>
            <option value="EMERGENCY">EMERGENCY</option>
          </select>
        </div>
        <div><label>Phone Number</label><input name="phone" value={formData.phone} onChange={handleChange} onKeyDown={(e) => handleKeyDown(e, 'phone')} /></div>
        <div style={{ gridRow: '4 / span 3', gridColumn: '3 / 5' }}>
          <label>Address / Reason</label>
          <textarea name="address" value={formData.address} onChange={handleChange} onKeyDown={(e) => handleKeyDown(e, 'address')} />
        </div>
      </div>

      <div className="total-days">
        <label>Total Leave Days: </label> {totalDays}
      </div>

      <LeaveGrid
        key={gridKey}
        leaveDetails={leaveDetails}
        setLeaveDetails={setLeaveDetails}
        onValidationError={(hasError) => setIsInvalid(hasError)}
      />


      <div className="save-btn-row">
        <button className="save-btn" disabled={isInvalid} onClick={handleSave}>💾 <u>S</u>ave</button>
      </div>

      {/* Shared Employee Select Dialog */}
      <EmployeeSelectDialog
        open={showEmpPopup}
        onClose={() => setShowEmpPopup(false)}
        onSelect={selectEmployee}
        data={employeeList}
      />

    </div>

  );
};

export default LeaveForm;
