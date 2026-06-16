import React, { useState, useEffect } from "react";
import {
  TextField, Typography, Button, Grid, Box, Divider, InputAdornment, FormControl, InputLabel, Select, MenuItem, Stack, IconButton, FormHelperText
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import axios from "axios";
import { useToast } from "../../../context/ToastContext";
import { useNavigationGuard } from "../../../context/NavigationGuardContext";
import EmployeeSelectDialog from "../Employee/EmployeeSelectDialog";
import OnDutyPreview from "./OnDutyPreview";
import { formatDate, formatDateOnly, formatDateTimeAMPM } from "../../../utils/dateUtils";
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

const OnDutyForm = ({ onClose }) => {
  const empIdRef = React.useRef(null);
  const dateInputRef = React.useRef(null);
  const shiftInputRef = React.useRef(null);
  const permFTimeRef = React.useRef(null);
  const permTTimeRef = React.useRef(null);
  const reasonRef = React.useRef(null);
  const saveBtnRef = React.useRef(null);

  const [shiftOpen, setShiftOpen] = useState(false);

  // Map field names to refs for easy focus handling
  const fieldRefs = {
    empid: empIdRef,
    act_date: dateInputRef,
    shift: shiftInputRef,
    perm_ftime: permFTimeRef,
    perm_ttime: permTTimeRef,
    reason_perm: reasonRef,
  };

  const handleKeyDown = (e, currentField, nextRef, isSelect = false, isOpen = false) => {
    if (e.key === 'Enter' || e.key === 'Tab') {
      if (isSelect && isOpen) {
        return;
      }

      // Run validation before allowing navigation
      const isValid = validateField(currentField);
      if (!isValid) {
        e.preventDefault();
        return; // validateField already handles the focus lock
      }

      if (e.key === 'Enter') {
        e.preventDefault();
        if (nextRef && nextRef.current) {
          nextRef.current.focus();
        } else if (currentField === 'reason_perm') {
          saveOnDuty();
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
      case 'act_date':
        if (!value) error = "Please enter the date";
        break;
      case 'shift':
        if (!value) error = "Please select a shift";
        break;
      case 'perm_ftime':
      case 'perm_ttime':
        const input = fieldRefs[name].current;
        if (!value || (input && input.validity && !input.validity.valid)) {
          error = "Please enter a complete time";
        }
        break;
      case 'reason_perm':
        if (!value) error = "Please specify a reason";
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

    // Special cross-field check for times
    if ((name === 'perm_ftime' || name === 'perm_ttime') && formData.perm_ftime && formData.perm_ttime) {
      if (formData.perm_ftime === formData.perm_ttime) {
        setFieldErrors(prev => ({ ...prev, perm_ttime: "To Time cannot be the same as From Time" }));
        setTimeout(() => permTTimeRef.current?.focus(), 10);
        return false;
      }
    }

    setFieldErrors(prev => ({ ...prev, [name]: null }));
    return true;
  };

  const { showToast } = useToast();
  const { setIsDirty } = useNavigationGuard();
  const [shifts, setShifts] = useState([]);
  const [fieldErrors, setFieldErrors] = useState({});
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
    movement_id: "",
    movement_date: getCurrentISTDateTime(),
    empid: "",
    ename: "",
    unit: "",
    division: "",
    designation: "",
    shift: "",
    act_date: "",
    perm_ftime: "",
    perm_ttime: "",
    no_of_hrs: "",
    reason_perm: ""
  });

  const [showEmpPopup, setShowEmpPopup] = useState(false);
  const [employeeList, setEmployeeList] = useState([]);
  const [showPreview, setShowPreview] = useState(false);

  const calculateHours = (fromTime, toTime) => {
    if (!fromTime || !toTime) return "";
    try {
      const [fH, fM] = fromTime.split(':').map(Number);
      const [tH, tM] = toTime.split(':').map(Number);
      let diff = (tH * 60 + tM) - (fH * 60 + fM);
      if (diff < 0) diff += 24 * 60;
      const h = Math.floor(diff / 60);
      const m = diff % 60;
      return `${h}.${m.toString().padStart(2, '0')}`;
    } catch (e) { return ""; }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setIsDirty(true);
    setFieldErrors(prev => ({ ...prev, [name]: null }));

    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      if (name === 'perm_ftime' || name === 'perm_ttime') {
        newData.no_of_hrs = calculateHours(newData.perm_ftime, newData.perm_ttime);
      }
      return newData;
    });
  };

  const validateTimes = (e) => {
    const { name, value } = e.target;
    const isInvalid = e.target.validity && !e.target.validity.valid;

    if (!value || isInvalid) {
      setFieldErrors(prev => ({ ...prev, [name]: "Please enter a complete time" }));
      setTimeout(() => {
        if (e.target) e.target.focus();
      }, 10);
      return false;
    }

    // Check for zero-hour conflict
    if (formData.perm_ftime && formData.perm_ttime && formData.perm_ftime === formData.perm_ttime) {
      setFieldErrors(prev => ({ ...prev, perm_ttime: "To Time cannot be the same as From Time" }));
      setTimeout(() => {
        if (permTTimeRef.current) permTTimeRef.current.focus();
      }, 10);
      return false;
    }

    setFieldErrors(prev => ({ ...prev, [name]: null, perm_ttime: formData.perm_ftime === formData.perm_ttime ? "To Time cannot be the same as From Time" : null }));
    return true;
  };

  const checkPayslipStatus = async (date, empid) => {
    if (!date) return;
    try {
      const dObj = new Date(date);
      const y = dObj.getFullYear();
      const m = dObj.getMonth() + 1;

      if (isNaN(y) || y < 1900) {
        const errorMsg = y < 1900 ? "Invalid Year (must be after 1900)" : "Invalid Date";
        setFieldErrors(prev => ({ ...prev, act_date: errorMsg }));
        if (dateInputRef.current) dateInputRef.current.focus();
        return;
      }

      // 🛑 Sync manual entry with calendar limits
      if (date < minDateLimit || date > maxDateLimit) {
        // Inline formatting safety
        const fmt = (s) => s ? s.split('-').reverse().join('-') : "";
        const errorMsg = `Date must be between ${fmt(minDateLimit)} and ${fmt(maxDateLimit)}`;
        setFieldErrors(prev => ({ ...prev, act_date: errorMsg }));
        showToast(errorMsg, "error");
        if (dateInputRef.current) dateInputRef.current.focus();
        return;
      }

      // Clear previous error before checking new date
      setFieldErrors(prev => ({ ...prev, act_date: null }));

      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/payroll/check-status`, {
        params: { empid, year: y, month: m }
      });

      if (res.data.generated) {
        const { C_MONTH, C_YEAR } = res.data.details || {};
        const msg = `Payroll already processed up to ${C_MONTH} ${C_YEAR}. Backdated entries not allowed.`;
        setFieldErrors(prev => ({ ...prev, act_date: msg }));
        if (dateInputRef.current) dateInputRef.current.focus();
      } else {
        setFieldErrors(prev => ({ ...prev, act_date: null }));
        // Successful validation: move to next field
        if (shiftInputRef.current) shiftInputRef.current.focus();
      }
    } catch (err) {
      console.error("Error checking payslip status:", err);
      const msg = getErrorMessage(err, "Server error checking status.");
      setFieldErrors(prev => ({ ...prev, act_date: msg }));
    }
  };

  const resetForm = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/onduty/next-id`);

      const loggedInEmpId = localStorage.getItem('empId') || "";
      const loggedInEmpName = localStorage.getItem('empName') || "";
      const loggedInDept = localStorage.getItem('deptname') || "";
      const loggedInDesig = localStorage.getItem('designation') || "";

      setFormData({
        movement_id: response.data.nextMovementId,
        movement_date: getCurrentISTDateTime(),
        empid: loggedInEmpId,
        ename: loggedInEmpName,
        unit: "",
        division: "",
        designation: loggedInDesig,
        shift: "",
        act_date: "",
        perm_ftime: "",
        perm_ttime: "",
        no_of_hrs: "",
        reason_perm: ""
      });
      setFieldErrors({});

      if (loggedInEmpId) {
        axios.get(`${import.meta.env.VITE_API_URL}/api/employees/${loggedInEmpId}`)
          .then((empRes) => {
            const emp = empRes.data;
            setFormData(prev => ({
              ...prev,
              ename: emp.ename,
              unit: emp.uname || prev.unit,
              division: emp.divname || prev.division,
              designation: emp.designation || prev.designation,
            }));
          })
          .catch((error) => {
            console.error("Failed to fetch employee master details", error);
          });
      }
    } catch (error) {
      console.error("Failed to fetch next movement ID:", error);
    }
  };

  useEffect(() => { resetForm(); fetchShifts(); }, []);

  const fetchShifts = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/shift/master/all`);
      setShifts(res.data);
    } catch (err) {
      console.error("Error fetching shifts:", err);
    }
  };

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
      ename: emp.ename,
      unit: emp.uname,
      division: emp.divname,
      designation: emp.designation,
    });
    setFieldErrors(prev => ({ ...prev, empid: null }));
    setShowEmpPopup(false);
    // After selection, focus on Date field
    setTimeout(() => {
      if (dateInputRef.current) dateInputRef.current.focus();
    }, 100);
  };

  const saveOnDuty = async () => {
    let hasError = false;
    const newErrors = { ...fieldErrors };
    let firstRef = null;

    if (!formData.empid) { newErrors.empid = "Please select an employee"; hasError = true; }
    if (!formData.act_date) { newErrors.act_date = "Please enter the date"; hasError = true; if (!firstRef) firstRef = dateInputRef; }
    if (!formData.shift) { newErrors.shift = "Please select a shift"; hasError = true; if (!firstRef) firstRef = shiftInputRef; }
    if (!formData.perm_ftime) { newErrors.perm_ftime = "Please enter from time"; hasError = true; if (!firstRef) firstRef = permFTimeRef; }
    if (!formData.perm_ttime) { newErrors.perm_ttime = "Please enter to time"; hasError = true; if (!firstRef) firstRef = permTTimeRef; }
    if (!formData.reason_perm) { newErrors.reason_perm = "Please specify a reason"; hasError = true; if (!firstRef) firstRef = reasonRef; }

    if (formData.perm_ftime && formData.perm_ttime && formData.perm_ftime === formData.perm_ttime) {
      newErrors.perm_ttime = "To Time cannot be the same as From Time";
      hasError = true;
      if (!firstRef) firstRef = permTTimeRef;
    }

    if (hasError) {
      setFieldErrors(newErrors);
      const firstError = Object.values(newErrors).find(msg => typeof msg === 'string');
      showToast(firstError || "Please fill all required fields.", "error");
      if (firstRef && firstRef.current) firstRef.current.focus();
      return;
    }
    if (fieldErrors.act_date) {
      if (dateInputRef.current) dateInputRef.current.focus();
      return;
    }
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/onduty/save`, formData);
      showToast(`On Duty Saved. ID: ${response.data.movement_id}`, "success");
      setIsDirty(false);
      resetForm();
    } catch (err) {
      console.error("Save error:", err);
      showToast(getErrorMessage(err, "Error saving On Duty application"), "error");
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
          <Typography variant="h6" fontWeight={700}>On Duty Permission</Typography>
          <IconButton onClick={() => { setIsDirty(false); onClose(); }}><CloseIcon /></IconButton>
        </Stack>

        <Box sx={{ mb: 2, display: 'flex', gap: 4, justifyContent: 'flex-start', alignItems: 'center' }}>
          <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="body2" color="text.secondary">OD App No:</Typography>
            <Typography fontWeight={600}>{formData.movement_id}</Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="body2" color="text.secondary">Entry Date:</Typography>
            <Typography fontWeight={600}>{formatDateTimeAMPM(formData.movement_date)}</Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
          <TextField
            label={<RequiredLabel>Emp Id</RequiredLabel>}
            name="empid"
            inputRef={empIdRef}
            value={formData.empid}
            onClick={isAdmin ? openEmpPopup : undefined}
            onKeyDown={(e) => handleKeyDown(e, 'empid', dateInputRef)}
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
              Name: {formData.ename || ""}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Dept: {formData.unit || ""} • Div: {formData.division || ""} • Desig: {formData.designation || ""}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ display: 'flex', gap: 1.5, mb: 2, alignItems: 'flex-start', flexWrap: 'nowrap' }}>
          <Box sx={{ width: '180px' }} style={{ pointerEvents: 'auto' }}>
            <TextField
              label={<RequiredLabel>Date</RequiredLabel>}
              name="act_date"
              type="date"
              size="small"
              fullWidth
              inputRef={dateInputRef}
              onKeyDown={(e) => handleKeyDown(e, 'act_date', shiftInputRef)}
              sx={requiredStyle}
              value={formData.act_date}
              onChange={handleChange}
              onBlur={() => {
                if (validateField('act_date')) {
                  checkPayslipStatus(formData.act_date, formData.empid);
                }
              }}
              error={!!fieldErrors.act_date}
              InputLabelProps={{ shrink: true }}
              inputProps={{
                max: maxDateLimit,
                min: minDateLimit
              }}
            />
            {fieldErrors.act_date && (
              <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block', fontWeight: 500, fontSize: '0.7rem', lineHeight: 1.1 }}>
                {fieldErrors.act_date}
              </Typography>
            )}
          </Box>
          <FormControl size="small" sx={{ ...requiredStyle, width: '130px' }}>
            <InputLabel><RequiredLabel>Shift</RequiredLabel></InputLabel>
            <Select
              name="shift"
              inputRef={shiftInputRef}
              open={shiftOpen}
              onOpen={() => setShiftOpen(true)}
              onClose={() => setShiftOpen(false)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !shiftOpen) {
                  e.preventDefault();
                  permFTimeRef.current?.focus();
                }
              }}
              value={formData.shift}
              onChange={(e) => {
                handleChange(e);
                setTimeout(() => permFTimeRef.current?.focus(), 100);
              }}
              label={<RequiredLabel>Shift</RequiredLabel>}
              error={!!fieldErrors.shift}
            >
              {shifts.map(s => (
                <MenuItem key={s.shift_id} value={s.shift_cd}>{s.shift_cd}</MenuItem>
              ))}
            </Select>
            {fieldErrors.shift && <FormHelperText error sx={{ fontSize: '0.7rem' }}>{fieldErrors.shift}</FormHelperText>}
          </FormControl>
          <TextField
            label={<RequiredLabel>From</RequiredLabel>}
            type="time"
            name="perm_ftime"
            inputRef={permFTimeRef}
            onKeyDown={(e) => handleKeyDown(e, 'perm_ftime', permTTimeRef)}
            onBlur={() => validateField('perm_ftime')}
            size="small"
            sx={{ ...requiredStyle, width: '125px' }}
            value={formData.perm_ftime}
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
            error={!!fieldErrors.perm_ftime}
            helperText={fieldErrors.perm_ftime}
          />
          <TextField
            label={<RequiredLabel>To</RequiredLabel>}
            type="time"
            name="perm_ttime"
            inputRef={permTTimeRef}
            onKeyDown={(e) => handleKeyDown(e, 'perm_ttime', reasonRef)}
            onBlur={() => validateField('perm_ttime')}
            size="small"
            sx={{ ...requiredStyle, width: '125px' }}
            value={formData.perm_ttime}
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
            error={!!fieldErrors.perm_ttime}
            helperText={fieldErrors.perm_ttime}
          />
          <TextField
            label="Hours"
            name="no_of_hrs"
            value={formData.no_of_hrs}
            size="small"
            disabled
            sx={{ width: '85px', bgcolor: '#f5f5f5' }}
            InputLabelProps={{ shrink: true }}
          />
        </Box>

        <Box sx={{ mt: 2 }}>
          <TextField
            label={<RequiredLabel>Reason for On Duty</RequiredLabel>}
            name="reason_perm"
            inputRef={reasonRef}
            onKeyDown={(e) => handleKeyDown(e, 'reason_perm', null)}
            size="small"
            fullWidth
            multiline
            rows={2}
            placeholder="Enter reason for on duty..."
            value={formData.reason_perm}
            onChange={handleChange}
            inputProps={{ maxLength: 200 }}
            sx={requiredStyle}
            error={!!fieldErrors.reason_perm}
            helperText={fieldErrors.reason_perm || `${formData.reason_perm?.length || 0}/200 characters`}
          />
        </Box>

        <div className="save-btn-row" style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
          <button className="save-btn"
            ref={saveBtnRef}
            onClick={saveOnDuty}
            style={{ padding: '8px 16px', background: '#1976d2', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
            Save
          </button>
        </div>
      </div>

      <EmployeeSelectDialog open={showEmpPopup} onClose={() => setShowEmpPopup(false)} onSelect={selectEmployee} data={employeeList} />
      {showPreview && <OnDutyPreview formData={formData} onClose={() => setShowPreview(false)} />}
    </Box>
  );
};

export default OnDutyForm;