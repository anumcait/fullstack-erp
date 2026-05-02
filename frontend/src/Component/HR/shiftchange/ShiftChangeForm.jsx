import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, Grid, Button, Divider, InputAdornment, FormControl, Select, MenuItem, Stack, IconButton, InputLabel } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import EmployeeSelectDialog from "../Employee/EmployeeSelectDialog";
import { useToast } from "../../../context/ToastContext";
import { useNavigationGuard } from "../../../context/NavigationGuardContext";
import axios from 'axios';
import { formatDate } from "../../../utils/dateUtils";

const RequiredLabel = ({ children }) => (
  <span>
    {children}
    <span style={{ color: 'red', marginLeft: 2 }}>*</span>
  </span>
);

const requiredStyle = {
  backgroundColor: '#fffde7'
};

const ShiftChangeForm = ({ onClose }) => {
  const { showToast } = useToast();
  const { setIsDirty } = useNavigationGuard();
  const [shifts, setShifts] = useState([]);

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
    schange_no: '151031',
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

  const openEmpPopup = async () => {
    const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/employees`);
    setEmployeeList(response.data);
    setShowEmpPopup(true);
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

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "F9" || e.keyCode === 120) {
        e.preventDefault();
        setShowEmpPopup(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => { fetchShifts(); fetchNextSchangeId(); }, []);

  const fetchNextSchangeId = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/shift/next-id`);
      setFormData(prev => ({ ...prev, schange_no: String(res.data.nextSchangeId) }));
    } catch (err) {
      console.error("Error fetching next ID:", err);
    }
  };

  const fetchShifts = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/shift/master/all`);
      setShifts(res.data);
    } catch (err) {
      console.error("Error fetching shifts:", err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setIsDirty(true);
    let updatedData = { ...formData, [name]: value };

    if (name === 'schange_from' && value && updatedData.schange_to) {
      const from = new Date(value);
      const to = new Date(updatedData.schange_to);
      const diffDays = Math.ceil((to - from) / (1000 * 60 * 60 * 24)) + 1;
      if (diffDays > 0) {
        updatedData.no_of_hrs = String(diffDays);
      }
    }

    if (name === 'schange_to' && value && updatedData.schange_from) {
      const from = new Date(updatedData.schange_from);
      const to = new Date(value);
      const diffDays = Math.ceil((to - from) / (1000 * 60 * 60 * 24)) + 1;
      if (diffDays > 0) {
        updatedData.no_of_hrs = String(diffDays);
      }
    }

    setFormData(updatedData);

    if (name === 'actual_shift' && value) {
      const selectedShift = shifts.find(s => s.shift_cd === value);
      if (selectedShift) {
        setFormData(prev => ({
          ...prev,
          act_start_time: selectedShift.start_time ? selectedShift.start_time.slice(0, 5) : '',
          act_end_time: selectedShift.end_time ? selectedShift.end_time.slice(0, 5) : ''
        }));
      }
    }

    if (name === 'change_shift' && value) {
      const selectedShift = shifts.find(s => s.shift_cd === value);
      if (selectedShift) {
        setFormData(prev => ({
          ...prev,
          cha_start_time: selectedShift.start_time ? selectedShift.start_time.slice(0, 5) : '',
          cha_end_time: selectedShift.end_time ? selectedShift.end_time.slice(0, 5) : ''
        }));
      }
    }
  };

  const saveShiftChange = async () => {
    if (!formData.empid || !formData.actual_shift || !formData.change_shift || !formData.purpose) {
      showToast("Please fill all required fields.", "error");
      return;
    }
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/shift/save`, formData);
      showToast(`Shift Change Saved! ID: ${response.data.movement_id}`, "success");
      setIsDirty(false);
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
      showToast("Error saving Shift Change", "error");
    }
  };

  return (
    <Box>
      <div className="p-6 max-w-4xl mx-auto bg-white border rounded-lg shadow">
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h6" fontWeight={700}>Shift Change Request</Typography>
          <IconButton onClick={() => { setIsDirty(false); onClose(); }}><CloseIcon /></IconButton>
        </Stack>

        <Box sx={{ mb: 2, display: 'flex', gap: 4, justifyContent: 'flex-start', alignItems: 'center' }}>
          <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="body2" color="text.secondary">Shift Change No:</Typography>
            <Typography fontWeight={600}>{formData.schange_no}</Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="body2" color="text.secondary">Date:</Typography>
            <Typography fontWeight={600}>{formatDate(formData.schange_date)}</Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
          <TextField
            label={<RequiredLabel>Emp Id</RequiredLabel>}
            name="empid"
            value={formData.empid}
            onClick={openEmpPopup}
            size="small"
            placeholder="Select Employee"
            sx={{ ...requiredStyle, width: '180px' }}
            InputProps={{
              readOnly: true,
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={openEmpPopup}>
                    <SearchIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <Box sx={{ p: 1, bgcolor: '#f8f9fa', borderRadius: 1, border: '1px solid #e0e0e0', flex: 1 }}>
            <Typography fontWeight={600} variant="subtitle2">
              Name: {formData.empname || "--"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Dept: {formData.department || "--"} • Desig: {formData.designation || "--"}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
          <Box sx={{ display: 'flex', gap: 1, flex: '1 1 300px', alignItems: 'center' }}>
            <FormControl size="small" sx={{ flex: 1, ...requiredStyle }}>
              <InputLabel><RequiredLabel>Actual Shift</RequiredLabel></InputLabel>
              <Select
                name="actual_shift"
                value={formData.actual_shift}
                onChange={handleChange}
                label={<RequiredLabel>Actual Shift</RequiredLabel>}
              >
                {shifts.map(s => (
                  <MenuItem key={s.shift_id} value={s.shift_cd}>{s.shift_cd}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField label="Start" value={formData.act_start_time} size="small" disabled sx={{ width: '70px' }} InputLabelProps={{ shrink: true }} />
            <TextField label="End" value={formData.act_end_time} size="small" disabled sx={{ width: '70px' }} InputLabelProps={{ shrink: true }} />
          </Box>

          <Box sx={{ display: 'flex', gap: 1, flex: '1 1 300px', alignItems: 'center' }}>
            <FormControl size="small" sx={{ flex: 1, ...requiredStyle }}>
              <InputLabel><RequiredLabel>Change Shift</RequiredLabel></InputLabel>
              <Select
                name="change_shift"
                value={formData.change_shift}
                onChange={handleChange}
                label={<RequiredLabel>Change Shift</RequiredLabel>}
              >
                {shifts.map(s => (
                  <MenuItem key={s.shift_id} value={s.shift_cd}>{s.shift_cd}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField label="Start" value={formData.cha_start_time} size="small" disabled sx={{ width: '70px' }} InputLabelProps={{ shrink: true }} />
            <TextField label="End" value={formData.cha_end_time} size="small" disabled sx={{ width: '70px' }} InputLabelProps={{ shrink: true }} />
          </Box>
        </Box>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
          <TextField
            label={<RequiredLabel>Change From</RequiredLabel>}
            name="schange_from"
            type="date"
            value={formData.schange_from}
            onChange={handleChange}
            size="small"
            sx={{ ...requiredStyle, width: '180px' }}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label={<RequiredLabel>To Date</RequiredLabel>}
            name="schange_to"
            type="date"
            value={formData.schange_to}
            onChange={handleChange}
            size="small"
            sx={{ ...requiredStyle, width: '180px' }}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Remarks"
            name="remarks"
            value={formData.remarks}
            onChange={handleChange}
            size="small"
            sx={{ flex: 1 }}
            placeholder="Additional remarks..."
          />
        </Box>

        <Box sx={{ mt: 2 }}>
          <TextField
            label={<RequiredLabel>Purpose</RequiredLabel>}
            name="purpose"
            value={formData.purpose}
            onChange={handleChange}
            fullWidth
            size="small"
            multiline
            rows={2}
            inputProps={{ maxLength: 200 }}
            sx={requiredStyle}
            helperText={`${formData.purpose?.length || 0}/200 characters`}
          />
        </Box>d>

        <div className="save-btn-row" style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
          <button className="save-btn" onClick={saveShiftChange} style={{ padding: '8px 16px', background: '#1976d2', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
            Save
          </button>
        </div>
      </div>

      <EmployeeSelectDialog open={showEmpPopup} onClose={() => setShowEmpPopup(false)} onSelect={selectEmployee} data={employeeList} />
    </Box>
  );
};

export default ShiftChangeForm;