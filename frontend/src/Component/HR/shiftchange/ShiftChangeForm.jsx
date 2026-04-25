import React, { useState, useEffect } from 'react';
import {
  InputAdornment, TextField, Typography, Button, FormControl, Select, MenuItem,Divider, 
  Grid, Box, Dialog
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import EmployeeSelectDialog from "../Employee/EmployeeSelectDialog";
import { useToast } from "../../../context/ToastContext";
import axios from 'axios';

const ShiftChangeForm = () => {
  const { showToast } = useToast();
  // Mock: assign these dynamically from backend
  const getCurrentISTDateTime = () => {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const hh = String(now.getHours()).padStart(2, '0');
    const min = String(now.getMinutes()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
  };

  const [formData, setFormData] = useState({
    schange_no: '151031',            // Assigned from backend
    schange_date: getCurrentISTDateTime(),
    empid: '',
    empname: '',
    department: '',
    designation: '',
    actual_shift: '',
    act_start_time: '',
    act_end_time: '',
    change_shift: '',
    cha_start_time: '',
    cha_end_time: '',
    schange_from: '',
    schange_to: '',
    no_of_hrs: '',
    remarks: '',
    purpose: ''
  });

  const [showEmpPopup, setShowEmpPopup] = useState(false);
  const [employeeList, setEmployeeList] = useState([]);

  // Call backend for employee list
  const openEmpPopup = async () => {
    const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/employees`);
     setEmployeeList(response.data);
  setShowEmpPopup(true);
  //  const data = await response.json();
   // setEmployeeList(data);
   // setShowEmpPopup(true);
  };

    const selectEmployee = (emp) => {
    setFormData({
      ...formData,
      empid: emp.empid,
      empname: emp.ename,
      unit: emp.uname,
      division: emp.divname,
      designation: emp.designation
    });
    setShowEmpPopup(false);
  };

  // F9 keyboard shortcut
useEffect(() => {
  const handleKeyDown = (e) => {
    if (e.key === "F9" || e.keyCode === 120) {
      e.preventDefault();    // prevent any default action
      setShowEmpPopup(true); // open employee popup
    }
  };

  window.addEventListener("keydown", handleKeyDown);

  return () => {
    window.removeEventListener("keydown", handleKeyDown);
  };
}, []);

  // Calculate hours automatically
  useEffect(() => {
    if (formData.cha_start_time && formData.cha_end_time) {
      const from = new Date(`1970-01-01T${formData.cha_start_time}`);
      const to = new Date(`1970-01-01T${formData.cha_end_time}`);
      let diff = (to - from) / 3600000;
      if (diff < 0) diff += 24; // overnight
      setFormData(prev => ({ ...prev, no_of_hrs: diff.toFixed(2) }));
    }
  }, [formData.cha_start_time, formData.cha_end_time]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  // Save logic
  const saveShiftChange = async () => {
    if (!formData.empid || !formData.actual_shift || !formData.change_shift) {
      showToast("❌ Please fill all required fields.", "error");
      return;
    }
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/shift/save`, formData);
      showToast(`✅ Shift Change Saved! ID: ${response.data.movement_id}`, "success");
      setFormData({
        schange_no: String(Number(formData.schange_no) + 1),
        schange_date: getCurrentISTDateTime(),
        empid: '',
        empname: '',
        department: '',
        designation: '',
        actual_shift: '',
        act_start_time: '',
        act_end_time: '',
        change_shift: '',
        cha_start_time: '',
        cha_end_time: '',
        schange_from: '',
        schange_to: '',
        no_of_hrs: '',
        remarks: '',
        purpose: ''
      });
    } catch (err) {
      console.error("Save error:", err);
      showToast("❌ Error saving Shift Change", "error");
    }
  };

  return (
    <Box sx={{ p: 2, bgcolor: "#f5f7fa" }}>
      <Box sx={{
        maxWidth: 800, mx: "auto", bgcolor: "#fff",
        borderRadius: 3, boxShadow: 3, mt: 1, px: 4, py: 3
      }}>
        <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
          Shift Change Request
        </Typography>
        {/* Header info row */}
        <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <Grid item xs={4}>
            <Typography fontWeight={500}>
              Shift Change No:&nbsp;
              <span style={{ fontWeight: 700 }}>{formData.schange_no}</span>
            </Typography>
          </Grid>
          <Grid item xs={8}>
            <Typography fontWeight={500}>
              Date:&nbsp; <span style={{ fontWeight: 700 }}>{formData.schange_date}</span>
            </Typography>
          </Grid>
        </Grid>
        <Divider sx={{ my: 2 }} />
        {/* Employee Info */}
        <Typography fontWeight={600} variant="body2" sx={{ mb: 1 }}>
          Employee Details
        </Typography>
       <Grid container spacing={2} alignItems="center"  wrap="nowrap" sx={{ mb: 2 }}>
  <Grid item sx={{ width: 140 }}>
    {/* Emp ID smaller fixed width */}
  <TextField
  label="Emp ID *"
  name="empid"
  value={formData.empid}
  size="small"
  variant="outlined"
  onClick={openEmpPopup}
  InputProps={{
    endAdornment: (
      <InputAdornment position="end">
        <SearchIcon onClick={openEmpPopup} style={{ cursor: 'pointer' }} />
      </InputAdornment>
    ),
  }}
  sx={{
    '& .MuiOutlinedInput-notchedOutline': {
      border: 'none',
    },
  }}
  required
/>

  </Grid>

  <Grid item xs>
    {/* Name takes up the remaining space */}
    <TextField
      label="Name"
      name="empname"
      value={formData.empname}
      fullWidth
      size="small"
      variant="outlined"
      disabled
    />
  </Grid>

  <Grid item xs={3}>
    <TextField
      label="Department"
      name="department"
      value={formData.department}
      fullWidth
      size="small"
      variant="outlined"
      disabled
    />
  </Grid>

  <Grid item xs={3}>
    <TextField
      label="Designation"
      name="designation"
      value={formData.designation}
      fullWidth
      size="small"
      variant="outlined"
      disabled
    />
  </Grid>
</Grid>
{/* 

          <Grid container spacing={2} alignItems="center" wrap="nowrap" sx={{ mb: 2 }}>
<Grid item xs={1} sx={{ flexGrow: 0.5 }}>
    <TextField
      label="Emp ID *"
      name="empid"
      value={formData.empid}
      fullWidth
      size="small"
      onClick={openEmpPopup}
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <SearchIcon onClick={openEmpPopup} style={{ cursor: 'pointer' }} />
          </InputAdornment>
        ),
      }}
      variant="outlined"
      required
    />
  </Grid>
<Grid item xs={4} sx={{ flexGrow: 2 }}>
    <TextField
      label="Name"
      name="empname"
      value={formData.empname}
      fullWidth
      size="small"
      variant="outlined"
      disabled
    />
  </Grid>
  <Grid item xs={3}>
    <TextField
      label="Department"
      name="department"
      value={formData.department}
      fullWidth
      size="small"
      variant="outlined"
      disabled
    />
  </Grid>
  <Grid item xs={3}>
    <TextField
      label="Designation"
      name="designation"
      value={formData.designation}
      fullWidth
      size="small"
      variant="outlined"
      disabled
    />
  </Grid>
</Grid> */}
          <Divider sx={{ my: 2 }} />
        {/* Shift Details */}
        <Typography fontWeight={600} variant="body2" sx={{ mb: 1 }}>
          Shift Change Details
        </Typography>
        <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
          {/* Actual Shift row */}
          <Grid item xs={2} sx={{ width: 100 }}>
            <FormControl size="small" fullWidth>
              <Select
                name="actual_shift"
                value={formData.actual_shift}
                onChange={handleChange}
                displayEmpty
              >
                <MenuItem value="">
                  Actual Shift
                </MenuItem>
                <MenuItem value="A">A</MenuItem>
                <MenuItem value="B">B</MenuItem>
                <MenuItem value="C">C</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={2}>
            <TextField
              label="Start Time"
              name="act_start_time"
              type="time"
              value={formData.act_start_time}
              onChange={handleChange}
              fullWidth size="small"
              disabled
            />
          </Grid>
          <Grid item xs={2}>
            <TextField
              label="End Time"
              name="act_end_time"
              type="time"
              value={formData.act_end_time}
              onChange={handleChange}
              fullWidth size="small"
              disabled
            />
          </Grid>
          {/* Change Shift row */}
          <Grid item xs={2} sx = {{ width:100 }}>
            <FormControl size="small" fullWidth>
              <Select
                name="change_shift"
                value={formData.change_shift}
                onChange={handleChange}
                displayEmpty
              >
                <MenuItem value="">
                  Change Shift
                </MenuItem>
                <MenuItem value="A">A</MenuItem>
                <MenuItem value="B">B</MenuItem>
                <MenuItem value="C">C</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={2}>
            <TextField
              label="Start Time"
              name="cha_start_time"
              type="time"
              value={formData.cha_start_time}
              onChange={handleChange}
              fullWidth size="small"
            />
          </Grid>
          <Grid item xs={2}>
            <TextField
              label="End Time"
              name="cha_end_time"
              type="time"
              value={formData.cha_end_time}
              onChange={handleChange}
              fullWidth size="small"
            />
          </Grid>
        </Grid>
        {/* Date range, hours, remarks */}
        <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <Grid item xs={3}>
            <TextField
              label="Change From"
              name="schange_from"
              type="date"
              value={formData.schange_from}
              onChange={handleChange}
              fullWidth size="small"
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={3}>
            <TextField
              label="To Date"
              name="schange_to"
              type="date"
              value={formData.schange_to}
              onChange={handleChange}
              fullWidth size="small"
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={3}>
            <TextField
              label="No of Hours"
              name="no_of_hrs"
              value={formData.no_of_hrs}
              disabled
              fullWidth size="small"
              variant="outlined"
            />
          </Grid>
          <Grid item xs={3}>
            <TextField
              label="Remarks"
              name="remarks"
              value={formData.remarks}
              onChange={handleChange}
              fullWidth size="small"
              variant="outlined"
            />
          </Grid>
        </Grid>
        <TextField
          label="Purpose"
          name="purpose"
          value={formData.purpose}
          onChange={handleChange}
          fullWidth
          size="small"
          multiline
          minRows={2}
          sx={{ mb: 2 }}
        />
        {/* Action buttons */}
        <Box display="flex" justifyContent="flex-end" gap={2} mt={2}>
          <Button variant="outlined" color="primary" onClick={() => { /* close logic */ }}>
            Close
          </Button>
          <Button variant="contained" color="primary" onClick={saveShiftChange}>
            Save
          </Button>
        </Box>
      </Box>
      {/* Employee select popup */}
      <EmployeeSelectDialog
        open={showEmpPopup}
        onClose={() => setShowEmpPopup(false)}
        onSelect={selectEmployee}
        data={employeeList}
      />
    </Box>
  );
};

export default ShiftChangeForm;
