import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, Grid, Button, Divider, InputAdornment, FormControl, Select, MenuItem, Stack, IconButton, InputLabel, FormHelperText } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import EmployeeSelectDialog from "../Employee/EmployeeSelectDialog";
import { useToast } from "../../../context/ToastContext";
import { useNavigationGuard } from "../../../context/NavigationGuardContext";
import axios from 'axios';
import { formatDateOnly, formatDateTimeAMPM } from "../../../utils/dateUtils";
import { getErrorMessage } from "../../../utils/errorUtils";

const RequiredLabel = ({ children }) => (
  <span>
    {children}
    <span style={{ color: 'red', marginLeft: 2 }}>*</span>
  </span>
);

const requiredStyle = {
  backgroundColor: '#fffde7'
};

const getUserRole = () => localStorage.getItem('userRole') || '';
const isAdminUser = () => getUserRole().toLowerCase() === 'admin';

const ShiftChangeForm = ({ onClose }) => {
  const dateInputRef = React.useRef(null);
  const toDateRef = React.useRef(null);
  const remarksRef = React.useRef(null);
  const purposeRef = React.useRef(null);
  const actualShiftRef = React.useRef(null);
  const changeShiftRef = React.useRef(null);

  const [actualShiftOpen, setActualShiftOpen] = useState(false);
  const [changeShiftOpen, setChangeShiftOpen] = useState(false);

  const fieldRefs = {
    schange_from: dateInputRef,
    schange_to: toDateRef,
    remarks: remarksRef,
    purpose: purposeRef,
    actual_shift: actualShiftRef,
    change_shift: changeShiftRef
  };

  const { showToast } = useToast();
  const { setIsDirty } = useNavigationGuard();
  const [shifts, setShifts] = useState([]);
  const [fieldErrors, setFieldErrors] = useState({ schange_from: null, schange_to: null });
  const [isAdmin, setIsAdmin] = useState(isAdminUser());

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
    if (!isAdmin) return;
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/employees`);
      setEmployeeList(response.data);
      setShowEmpPopup(true);
    } catch (err) {
      showToast(getErrorMessage(err, "Error fetching employees"), "error");
    }
  };

  const selectEmployee = (emp) => {
    setFormData({
      ...formData,
      empid: emp.empid,
      empname: emp.ename,
      unit: emp.uname,
      division: emp.divname,
      department: emp.department,
      designation: emp.designation
    });
    setFieldErrors(prev => ({ ...prev, empid: null }));
    setShowEmpPopup(false);
  };

  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if (isAdmin && (e.key === "F9" || e.keyCode === 120)) {
        e.preventDefault();
        openEmpPopup();
      }
    };
    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [isAdmin]);

  const resetForm = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/shift/next-id`);
      
      const loggedInEmpId = localStorage.getItem('empId') || "";
      const loggedInEmpName = localStorage.getItem('empName') || "";
      const loggedInDept = localStorage.getItem('deptname') || "";
      const loggedInDesig = localStorage.getItem('designation') || "";

      setFormData({
        schange_no: String(res.data.nextSchangeId),
        schange_date: getCurrentISTDateTime(),
        empid: loggedInEmpId,
        empname: loggedInEmpName,
        department: loggedInDept,
        designation: loggedInDesig,
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
      setFieldErrors({ schange_from: null, schange_to: null });

      if (loggedInEmpId) {
        axios.get(`${import.meta.env.VITE_API_URL}/api/employees/${loggedInEmpId}`)
          .then((empRes) => {
            const emp = empRes.data;
            setFormData(prev => ({
              ...prev,
              empname: emp.ename,
              department: emp.deptname || emp.department || prev.department,
              designation: emp.designation || prev.designation,
            }));
          })
          .catch((error) => {
            console.error("Failed to fetch employee master details", error);
          });
      }
    } catch (err) {
      console.error("Error fetching next ID:", err);
    }
  };

  useEffect(() => {
    fetchShifts();
    resetForm();
  }, []);

  const fetchShifts = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/shift/master/all`);
      setShifts(res.data);
    } catch (err) {
      console.error("Error fetching shifts:", err);
    }
  };

  const handleKeyDown = (e, currentField, nextRef, isSelect = false, isOpen = false) => {
    if (e.key === "Enter" || e.key === "Tab") {
      if (isSelect && isOpen) return;

      // Run validation before allowing navigation
      const isValid = validateField(currentField);
      if (!isValid) {
        e.preventDefault();
        return; // validateField already handles the focus lock
      }

      if (e.key === "Enter") {
        e.preventDefault();
        if (nextRef && nextRef.current) {
          nextRef.current.focus();
        } else if (currentField === 'purpose') {
          saveShiftChange();
        }
      }
    }
  };

  const validateField = (name) => {
    let error = null;
    const value = formData[name];

    switch (name) {
      case 'empid':
        if (!value) error = "Please select an employee";
        break;
      case 'actual_shift':
        if (!value) error = "Please select actual shift";
        break;
      case 'change_shift':
        if (!value) error = "Please select changed shift";
        else if (formData.actual_shift && value === formData.actual_shift) {
          error = "Actual shift and Change shift cannot be the same";
        }
        break;
      case 'schange_from':
        if (!value) error = "Please enter from date";
        break;
      case 'schange_to':
        if (!value) error = "Please enter to date";
        else if (formData.schange_from && new Date(value) < new Date(formData.schange_from)) {
          error = "To Date cannot be earlier than From Date";
        }
        break;
      case 'purpose':
        if (!value) error = "Please specify the purpose";
        break;
      default:
        break;
    }

    if (error) {
      setFieldErrors(prev => ({ ...prev, [name]: error }));
      setTimeout(() => {
        if (fieldRefs[name] && fieldRefs[name].current) {
          fieldRefs[name].current.focus();
        }
      }, 10);
      return false;
    }

    setFieldErrors(prev => ({ ...prev, [name]: null }));
    return true;
  };

  // Generic payroll validation for any date field
  const checkDatePayslipStatus = async (date, empid, fieldName, refToFocus, nextRef) => {
    if (!date) return;
    try {
      const dObj = new Date(date);
      const y = dObj.getFullYear();
      const m = dObj.getMonth() + 1;
      
      if (isNaN(y) || y < 1900) {
        const errorMsg = y < 1900 ? "Invalid Year (must be after 1900)" : "Invalid Date";
        setFieldErrors(prev => ({ ...prev, [fieldName]: errorMsg }));
        if (refToFocus.current) refToFocus.current.focus();
        return;
      }

      // 🛑 Sync manual entry with calendar limits
      if (date < minDateLimit || date > maxDateLimit) {
        const fmt = (s) => s ? s.split('-').reverse().join('-') : "";
        const errorMsg = `Date must be between ${fmt(minDateLimit)} and ${fmt(maxDateLimit)}`;
        setFieldErrors(prev => ({ ...prev, [fieldName]: errorMsg }));
        showToast(errorMsg, "error");
        if (refToFocus.current) refToFocus.current.focus();
        return;
      }

      // Clear previous error before checking new date
      setFieldErrors(prev => ({ ...prev, [fieldName]: null }));

      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/payroll/check-status`, {
        params: { empid, year: y, month: m }
      });

      if (res.data.generated) {
        const { C_MONTH, C_YEAR } = res.data.details || {};
        const msg = `Payroll already processed up to ${C_MONTH} ${C_YEAR}. Backdated entries not allowed.`;
        setFieldErrors(prev => ({ ...prev, [fieldName]: msg }));
        if (refToFocus.current) refToFocus.current.focus();
      } else {
        setFieldErrors(prev => ({ ...prev, [fieldName]: null }));
        // Successful validation: move to next field
        if (nextRef && nextRef.current) nextRef.current.focus();
      }
    } catch (err) {
      console.error("Error checking payslip status:", err);
      setFieldErrors(prev => ({ ...prev, [fieldName]: "Server error checking status." }));
    }
  };

  const [officialShift, setOfficialShift] = useState(null);

  useEffect(() => {
    const validateShift = async () => {
      if (formData.empid && formData.schange_from) {
        try {
          const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/shift/schedule/by-date`, {
            params: { empid: formData.empid, date: formData.schange_from }
          });
          const shift = res.data;
          const formatTimeStr = (val) => {
            if (!val) return '';
            if (val.includes('T')) return val.split('T')[1].slice(0, 5); // Handles ISO 2000-01-01T09:00...
            return val.slice(0, 5); // Handles 09:00:00
          };

          setOfficialShift(shift.shift_cd);
          if (formData.change_shift && shift.shift_cd === formData.change_shift) {
            showToast(`Official shift (${shift.shift_cd}) and Change shift cannot be the same. Clearing selection.`, "error");
            setFormData(prev => ({
              ...prev,
              actual_shift: '', act_start_time: '', act_end_time: '',
              change_shift: '', cha_start_time: '', cha_end_time: ''
            }));
          } else {
            setFormData(prev => ({
              ...prev,
              actual_shift: shift.shift_cd,
              act_start_time: formatTimeStr(shift.start_time),
              act_end_time: formatTimeStr(shift.end_time)
            }));
            // Clear any previous shift errors
            setFieldErrors(prev => {
              if (prev.schange_from?.includes("No shift scheduled")) {
                return { ...prev, schange_from: null };
              }
              return prev;
            });
          }
        } catch (err) {
          setOfficialShift(null);
          if (err.response?.status === 404) {
            const msg = `No shift scheduled for ${formData.empname || "employee"} on ${formData.schange_from}.`;
            setFieldErrors(prev => ({ ...prev, schange_from: msg }));
            setFormData(prev => ({ ...prev, actual_shift: '', act_start_time: '', act_end_time: '' }));
          } else {
            showToast(getErrorMessage(err, "Error verifying scheduled shift"), "error");
          }
        }
      }
    };
    validateShift();
  }, [formData.empid, formData.schange_from]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setIsDirty(true);
    setFieldErrors(prev => ({ ...prev, [name]: null }));
    let updatedData = { ...formData, [name]: value };

    if (name === 'schange_from' && value && updatedData.schange_to) {
      const from = new Date(value);
      const to = new Date(updatedData.schange_to);
      const diffDays = Math.ceil((to - from) / (1000 * 60 * 60 * 24)) + 1;
      if (diffDays > 30) {
        setFieldErrors(prev => ({ ...prev, [name]: "Maximum allowed range is 30 days" }));
        showToast("Date range cannot exceed 30 days.", "error");
        updatedData.no_of_hrs = "";
      } else if (diffDays > 0) {
        updatedData.no_of_hrs = String(diffDays);
      }
    }

    if (name === 'schange_to' && value && updatedData.schange_from) {
      const from = new Date(updatedData.schange_from);
      const to = new Date(value);
      const diffDays = Math.ceil((to - from) / (1000 * 60 * 60 * 24)) + 1;
      if (diffDays > 30) {
        setFieldErrors(prev => ({ ...prev, [name]: "Maximum allowed range is 30 days" }));
        showToast("Date range cannot exceed 30 days.", "error");
        updatedData.no_of_hrs = "";
      } else if (diffDays > 0) {
        updatedData.no_of_hrs = String(diffDays);
      }
    }

    setFormData(updatedData);

    if (name === 'actual_shift' && value) {
      if (formData.change_shift && value === formData.change_shift) {
        showToast("Actual shift and Change shift cannot be the same.", "error");
        setFormData(prev => ({ ...prev, actual_shift: '', act_start_time: '', act_end_time: '' }));
        return;
      }
      if (officialShift && value !== officialShift) {
        showToast(`Warning: Selected shift (${value}) does not match scheduled shift (${officialShift}).`, "warning");
      }
      const selectedShift = shifts.find(s => s.shift_cd === value);
      if (selectedShift) {
        setFormData(prev => ({
          ...prev,
          actual_shift: value,
          act_start_time: selectedShift.start_time ? (selectedShift.start_time.includes('T') ? selectedShift.start_time.split('T')[1].slice(0, 5) : selectedShift.start_time.slice(0, 5)) : '',
          act_end_time: selectedShift.end_time ? (selectedShift.end_time.includes('T') ? selectedShift.end_time.split('T')[1].slice(0, 5) : selectedShift.end_time.slice(0, 5)) : ''
        }));
      }
    }

    if (name === 'change_shift' && value) {
      if (formData.actual_shift && value === formData.actual_shift) {
        showToast("Change shift and Actual shift cannot be the same.", "error");
        setFormData(prev => ({ ...prev, change_shift: '', cha_start_time: '', cha_end_time: '' }));
        return;
      }
      const selectedShift = shifts.find(s => s.shift_cd === value);
      if (selectedShift) {
        setFormData(prev => ({
          ...prev,
          change_shift: value,
          cha_start_time: selectedShift.start_time ? (selectedShift.start_time.includes('T') ? selectedShift.start_time.split('T')[1].slice(0, 5) : selectedShift.start_time.slice(0, 5)) : '',
          cha_end_time: selectedShift.end_time ? (selectedShift.end_time.includes('T') ? selectedShift.end_time.split('T')[1].slice(0, 5) : selectedShift.end_time.slice(0, 5)) : ''
        }));
      }
    }
  };

  const saveShiftChange = async () => {
    let hasError = false;
    const newErrors = { ...fieldErrors };
    let firstRef = null;

    if (!formData.empid) { newErrors.empid = "Please select an employee"; hasError = true; }
    if (!formData.actual_shift) { newErrors.actual_shift = "Please select actual shift"; hasError = true; }
    if (!formData.change_shift) { newErrors.change_shift = "Please select changed shift"; hasError = true; }
    if (!formData.schange_from) { newErrors.schange_from = "Please enter from date"; hasError = true; if (!firstRef) firstRef = dateInputRef; }
    if (!formData.schange_to) { newErrors.schange_to = "Please enter to date"; hasError = true; if (!firstRef) firstRef = toDateRef; }
    if (!formData.purpose) { newErrors.purpose = "Please specify the purpose"; hasError = true; if (!firstRef) firstRef = purposeRef; }

    // Check if there are any existing validation errors
    const existingErrors = Object.values(fieldErrors).filter(val => typeof val === 'string' && val.length > 0);
    
    if (hasError || existingErrors.length > 0) {
      setFieldErrors(newErrors);
      const firstErrorMessage = existingErrors[0] || Object.values(newErrors).find(msg => typeof msg === 'string') || "Please fill all required fields.";
      showToast(firstErrorMessage, "error");

      if (firstRef && firstRef.current) {
        firstRef.current.focus();
      } else if (newErrors.schange_from && dateInputRef.current) {
        dateInputRef.current.focus();
      } else if (newErrors.schange_to && toDateRef.current) {
        toDateRef.current.focus();
      }
      return;
    }

    try {
      const fromDate = new Date(formData.schange_from);
      const toDate = new Date(formData.schange_to);

      if (toDate < fromDate) {
        showToast("To Date cannot be earlier than From Date.", "error");
        return;
      }

      // 1. Range Validation: Check if all dates in range have the correct 'actual_shift' scheduled
      const resSchedule = await axios.get(`${import.meta.env.VITE_API_URL}/api/shift/schedule/all`, {
        params: {
          empid: formData.empid,
          startDate: formData.schange_from,
          endDate: formData.schange_to
        }
      });

      const schedules = resSchedule.data;
      const totalDaysRequested = Number(formData.no_of_hrs);

      if (schedules.length < totalDaysRequested) {
        showToast(`Validation Failed: Only ${schedules.length} out of ${totalDaysRequested} days have a scheduled shift in the system.`, "error");
        return;
      }

      const mismatches = schedules.filter(s => s.shift_cd !== formData.actual_shift);
      if (mismatches.length > 0) {
        const mismatchDates = mismatches.map(m => formatDateOnly(m.shift_date)).join(', ');
        showToast(`The shift ${formData.actual_shift} is not scheduled on: ${mismatchDates}. (Found: ${mismatches.map(m => m.shift_cd).join(', ')})`, "error");
        return;
      }

      // 2. Proceed with save
      const payload = {
        ...formData,
        act_shift: formData.actual_shift,
        act_sstart_time: formData.act_start_time,
        act_send_time: formData.act_end_time,
        cha_sstart_time: formData.cha_start_time,
        cha_send_time: formData.cha_end_time,
        app_status: 'Pending'
      };
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/shift/save`, payload);
      showToast(`Shift Change Saved! ID: ${response.data.movement_id}`, "success");
      setIsDirty(false);
      resetForm();
    } catch (err) {
      console.error("Save error:", err);
      showToast(getErrorMessage(err, "Error saving Shift Change"), "error");
    }
  };

  const [minDateLimit, setMinDateLimit] = useState(() => {
    const currentYear = new Date().getFullYear();
    return `${currentYear - 1}-01-01`;
  });

  useEffect(() => {
    const fetchLatestProcessed = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/payroll/latest-processed`);
        if (res.data && res.data.year && res.data.month) {
          let nextMonth = res.data.month + 1;
          let nextYear = res.data.year;
          if (nextMonth > 12) {
            nextMonth = 1;
            nextYear += 1;
          }
          const minDateStr = `${nextYear}-${String(nextMonth).padStart(2, '0')}-01`;
          setMinDateLimit(minDateStr);
        }
      } catch (err) {
        console.error("Error fetching latest processed date:", err);
      }
    };
    fetchLatestProcessed();
  }, []);

  const maxDateLimit = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split('T')[0];
  })();

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
            <Typography variant="body2" color="text.secondary">Entry Date:</Typography>
            <Typography fontWeight={600}>{formatDateTimeAMPM(formData.schange_date)}</Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
          <TextField
            label={<RequiredLabel>Emp Id</RequiredLabel>}
            name="empid"
            value={formData.empid}
            onClick={isAdmin ? openEmpPopup : undefined}
            onKeyDown={(e) => handleKeyDown(e, 'empid', actualShiftRef)}
            size="small"
            placeholder={isAdmin ? "Select Employee" : ""}
            sx={{ 
              ...requiredStyle, 
              width: '180px',
              bgcolor: isAdmin ? '#fffde7' : '#f5f5f5',
              cursor: isAdmin ? 'pointer' : 'default'
            }}
            InputProps={{
              readOnly: true,
              endAdornment: isAdmin ? (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={openEmpPopup}>
                    <SearchIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ) : null,
            }}
            error={!!fieldErrors.empid}
            helperText={fieldErrors.empid}
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
                inputRef={actualShiftRef}
                open={actualShiftOpen}
                onOpen={() => setActualShiftOpen(true)}
                onClose={() => setActualShiftOpen(false)}
                onKeyDown={(e) => handleKeyDown(e, 'actual_shift', changeShiftRef, true, actualShiftOpen)}
                onBlur={() => validateField('actual_shift')}
                value={formData.actual_shift}
                onChange={(e) => {
                  handleChange(e);
                  setTimeout(() => changeShiftRef.current?.focus(), 100);
                }}
                label={<RequiredLabel>Actual Shift</RequiredLabel>}
                error={!!fieldErrors.actual_shift}
              >
                {shifts.map(s => (
                  <MenuItem key={s.shift_id} value={s.shift_cd}>{s.shift_cd}</MenuItem>
                ))}
              </Select>
              {fieldErrors.actual_shift && <FormHelperText error>{fieldErrors.actual_shift}</FormHelperText>}
            </FormControl>
            <TextField label="Start" value={formData.act_start_time} size="small" disabled sx={{ width: '70px' }} InputLabelProps={{ shrink: true }} />
            <TextField label="End" value={formData.act_end_time} size="small" disabled sx={{ width: '70px' }} InputLabelProps={{ shrink: true }} />
          </Box>
 
          <Box sx={{ display: 'flex', gap: 1, flex: '1 1 300px', alignItems: 'center' }}>
            <FormControl size="small" sx={{ flex: 1, ...requiredStyle }}>
              <InputLabel><RequiredLabel>Change Shift</RequiredLabel></InputLabel>
              <Select
                name="change_shift"
                inputRef={changeShiftRef}
                open={changeShiftOpen}
                onOpen={() => setChangeShiftOpen(true)}
                onClose={() => setChangeShiftOpen(false)}
                onKeyDown={(e) => handleKeyDown(e, 'change_shift', dateInputRef, true, changeShiftOpen)}
                onBlur={() => validateField('change_shift')}
                value={formData.change_shift}
                onChange={(e) => {
                  handleChange(e);
                  setTimeout(() => dateInputRef.current?.focus(), 100);
                }}
                label={<RequiredLabel>Change Shift</RequiredLabel>}
                error={!!fieldErrors.change_shift}
              >
                {shifts.map(s => (
                  <MenuItem key={s.shift_id} value={s.shift_cd}>{s.shift_cd}</MenuItem>
                ))}
              </Select>
              {fieldErrors.change_shift && <FormHelperText error>{fieldErrors.change_shift}</FormHelperText>}
            </FormControl>
            <TextField label="Start" value={formData.cha_start_time} size="small" disabled sx={{ width: '70px' }} InputLabelProps={{ shrink: true }} />
            <TextField label="End" value={formData.cha_end_time} size="small" disabled sx={{ width: '70px' }} InputLabelProps={{ shrink: true }} />
          </Box>
        </Box>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
          <Box sx={{ width: '180px' }} style={{ pointerEvents: 'auto' }}>
            <TextField
              label={<RequiredLabel>Change From</RequiredLabel>}
              name="schange_from"
              type="date"
              inputRef={dateInputRef}
              value={formData.schange_from}
              onChange={handleChange}
              onKeyDown={(e) => handleKeyDown(e, 'schange_from', toDateRef)}
              onBlur={() => {
                if (validateField('schange_from')) {
                  checkDatePayslipStatus(formData.schange_from, formData.empid, 'schange_from', dateInputRef, toDateRef);
                }
              }}
              size="small"
              fullWidth
              sx={requiredStyle}
              InputLabelProps={{ shrink: true }}
              error={!!fieldErrors.schange_from}
              inputProps={{
                max: maxDateLimit,
                min: minDateLimit
              }}
            />
            {fieldErrors.schange_from && (
              <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block', fontWeight: 500, fontSize: '0.7rem', lineHeight: 1.1 }}>
                {fieldErrors.schange_from}
              </Typography>
            )}
          </Box>

          <Box sx={{ width: '180px' }} style={{ pointerEvents: 'auto' }}>
            <TextField
              label={<RequiredLabel>To Date</RequiredLabel>}
              name="schange_to"
              type="date"
              inputRef={toDateRef}
              value={formData.schange_to}
              onChange={handleChange}
              onKeyDown={(e) => handleKeyDown(e, 'schange_to', remarksRef)}
              onBlur={() => {
                if (validateField('schange_to')) {
                  checkDatePayslipStatus(formData.schange_to, formData.empid, 'schange_to', toDateRef, remarksRef);
                }
              }}
              size="small"
              fullWidth
              sx={requiredStyle}
              InputLabelProps={{ shrink: true }}
              error={!!fieldErrors.schange_to}
              inputProps={{
                max: maxDateLimit,
                min: minDateLimit
              }}
            />
            {fieldErrors.schange_to && (
              <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block', fontWeight: 500, fontSize: '0.7rem', lineHeight: 1.1 }}>
                {fieldErrors.schange_to}
              </Typography>
            )}
          </Box>

          <TextField
            label="No. of Days"
            name="no_of_hrs"
            value={formData.no_of_hrs}
            size="small"
            disabled
            sx={{ width: '100px', bgcolor: '#f5f5f5' }}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Remarks"
            name="remarks"
            inputRef={remarksRef}
            value={formData.remarks}
            onChange={handleChange}
            onKeyDown={(e) => handleKeyDown(e, 'remarks', purposeRef)}
            size="small"
            sx={{ flex: 1 }}
            placeholder="Additional remarks..."
            inputProps={{ maxLength: 150 }}
          />
        </Box>

        <Box sx={{ mt: 2 }}>
          <TextField
            label={<RequiredLabel>Purpose</RequiredLabel>}
            name="purpose"
            inputRef={purposeRef}
            onKeyDown={(e) => handleKeyDown(e, 'purpose', null)}
            onBlur={() => validateField('purpose')}
            value={formData.purpose}
            onChange={handleChange}
            fullWidth
            size="small"
            multiline
            rows={2}
            inputProps={{ maxLength: 150 }}
            sx={requiredStyle}
            error={!!fieldErrors.purpose}
            helperText={fieldErrors.purpose || `${formData.purpose?.length || 0}/150 characters`}
          />
        </Box>

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