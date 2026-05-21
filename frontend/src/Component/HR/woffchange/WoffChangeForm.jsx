import React, { useState, useEffect } from "react";
import {
  InputAdornment, TextField, Typography, Button, FormControl, Select, MenuItem, Divider,
  Box, Stack, IconButton, InputLabel, FormHelperText
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import EmployeeSelectDialog from "../Employee/EmployeeSelectDialog";
import { useToast } from "../../../context/ToastContext";
import { useNavigationGuard } from "../../../context/NavigationGuardContext";
import axios from "axios";
import WoffChangePreview from "./WoffChangePreview";
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

const WoffChangeForm = ({ onClose }) => {
  const dateInputRef = React.useRef(null);
  const toDateRef = React.useRef(null);
  const shiftRef = React.useRef(null);
  const remarksRef = React.useRef(null);
  const reasonRef = React.useRef(null);
  const [shiftOpen, setShiftOpen] = useState(false);

  const fieldRefs = {
    woff_from_date: dateInputRef,
    woff_to_date: toDateRef,
    shift_cd: shiftRef,
    remarks: remarksRef,
    reason: reasonRef,
  };

  const { showToast } = useToast();
  const { setIsDirty } = useNavigationGuard();
  const [shifts, setShifts] = useState([]);
  const [fieldErrors, setFieldErrors] = useState({ woff_from_date: null });
  const [isAdmin, setIsAdmin] = useState(isAdminUser());

  const [formData, setFormData] = useState({
    woff_id: "",
    woff_date: new Date().toISOString(),
    empid: "",
    ename: "",
    unit: "",
    division: "",
    designation: "",
    department: "",
    section: "",
    current_woff_day: "",
    requested_woff_day: "",
    woff_from_date: "",
    woff_to_date: "",
    shift_cd: "",
    reason: "",
    remarks: ""
  });

  const [showEmpPopup, setShowEmpPopup] = useState(false);
  const [employeeList, setEmployeeList] = useState([]);
  const [showPreview, setShowPreview] = useState(false);

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
        } else if (currentField === 'reason') {
          saveWoffChange();
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
      case 'woff_from_date':
        if (!value) error = "Please select existing date";
        break;
      case 'woff_to_date':
        if (!value) error = "Please select changed date";
        else if (formData.woff_from_date && value === formData.woff_from_date) {
          error = "Existing date and Changed date cannot be the same";
        }
        break;
      case 'shift_cd':
        if (!value) error = "Please select a shift";
        break;
      case 'reason':
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

    setFieldErrors(prev => ({ ...prev, [name]: null }));
    return true;
  };

  const checkPayslipStatus = async (date, empid, fieldName, currentRef, nextRef) => {
    if (!date) return;
    try {
      const dObj = new Date(date);
      const y = dObj.getFullYear();
      const m = dObj.getMonth() + 1;

      if (isNaN(y) || y < 1900) {
        const errorMsg = y < 1900 ? "Invalid Year (must be after 1900)" : "Invalid Date";
        setFieldErrors(prev => ({ ...prev, [fieldName]: errorMsg }));
        if (currentRef.current) currentRef.current.focus();
        return;
      }

      if (date < minDateLimit || date > maxDateLimit) {
        const fmt = (s) => s ? s.split('-').reverse().join('-') : "";
        const errorMsg = `Date must be between ${fmt(minDateLimit)} and ${fmt(maxDateLimit)}`;
        setFieldErrors(prev => ({ ...prev, [fieldName]: errorMsg }));
        showToast(errorMsg, "error");
        if (currentRef.current) currentRef.current.focus();
        return;
      }

      setFieldErrors(prev => ({ ...prev, [fieldName]: null }));

      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/payroll/check-status`, {
        params: { empid, year: y, month: m }
      });

      if (res.data.generated) {
        const { C_MONTH, C_YEAR } = res.data.details || {};
        const msg = `Payroll already processed up to ${C_MONTH} ${C_YEAR}. Backdated entries not allowed.`;
        setFieldErrors(prev => ({ ...prev, [fieldName]: msg }));
        if (currentRef.current) currentRef.current.focus();
      } else {
        setFieldErrors(prev => ({ ...prev, [fieldName]: null }));
        if (nextRef && nextRef.current) nextRef.current.focus();
      }
    } catch (err) {
      console.error("Error checking payslip status:", err);
      const msg = getErrorMessage(err, "Server error checking status.");
      setFieldErrors(prev => ({ ...prev, [fieldName]: msg }));
    }
  };

  const resetForm = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/woff/next-id`);
      
      const loggedInEmpId = localStorage.getItem('empId') || "";
      const loggedInEmpName = localStorage.getItem('empName') || "";
      const loggedInDept = localStorage.getItem('deptname') || "";
      const loggedInDesig = localStorage.getItem('designation') || "";

      setFormData({
        woff_id: response.data.nextWoffId,
        woff_date: new Date().toISOString(),
        empid: loggedInEmpId,
        ename: loggedInEmpName,
        unit: "",
        division: "",
        designation: loggedInDesig,
        department: loggedInDept,
        section: "",
        current_woff_day: "",
        requested_woff_day: "",
        woff_from_date: "",
        woff_to_date: "",
        shift_cd: "",
        reason: "",
        remarks: ""
      });
      setFieldErrors({ woff_from_date: null });

      if (loggedInEmpId) {
        axios.get(`${import.meta.env.VITE_API_URL}/api/employees/${loggedInEmpId}`)
          .then((empRes) => {
            const emp = empRes.data;
            setFormData(prev => ({
              ...prev,
              ename: emp.ename,
              unit: emp.uname || prev.unit,
              division: emp.divname || prev.division,
              department: emp.deptname || emp.department || prev.department,
              section: emp.secname || emp.section || prev.section,
              designation: emp.designation || prev.designation,
            }));
          })
          .catch((error) => {
            console.error("Failed to fetch employee master details", error);
          });
      }
    } catch (error) {
      console.error("Failed to fetch next woff ID:", error);
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
      department: emp.deptname || emp.department || "",
      section: emp.secname || emp.section || "",
    });
    setFieldErrors(prev => ({ ...prev, empid: null }));
    setShowEmpPopup(false);
    setTimeout(() => {
      if (dateInputRef.current) dateInputRef.current.focus();
    }, 100);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setIsDirty(true);
    setFieldErrors(prev => ({ ...prev, [name]: null }));
    let updatedData = { ...formData, [name]: value };

    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    if (name === "woff_from_date" && value) {
      const date = new Date(value);
      updatedData.current_woff_day = days[date.getDay()];
    }

    if (name === "woff_to_date" && value) {
      const date = new Date(value);
      updatedData.requested_woff_day = days[date.getDay()];
    }

    setFormData(updatedData);
  };

  const saveWoffChange = async () => {
    let hasError = false;
    const newErrors = { ...fieldErrors };
    let firstRef = null;

    if (!formData.empid) { newErrors.empid = "Please select an employee"; hasError = true; }
    if (!formData.woff_from_date) { newErrors.woff_from_date = "Please select existing date"; hasError = true; if (!firstRef) firstRef = dateInputRef; }
    if (!formData.woff_to_date) { newErrors.woff_to_date = "Please select changed date"; hasError = true; if (!firstRef) firstRef = toDateRef; }
    if (!formData.shift_cd) { newErrors.shift_cd = "Please select a shift"; hasError = true; if (!firstRef) firstRef = shiftRef; }
    if (!formData.reason) { newErrors.reason = "Please specify a reason"; hasError = true; if (!firstRef) firstRef = reasonRef; }

    if (hasError) {
      setFieldErrors(newErrors);
      const firstError = Object.values(newErrors).find(msg => typeof msg === 'string');
      showToast(firstError || "Please fill all required fields.", "error");
      if (firstRef && firstRef.current) firstRef.current.focus();
      return;
    }
    if (fieldErrors.woff_from_date) {
      if (dateInputRef.current) dateInputRef.current.focus();
      return;
    }

    if (formData.woff_from_date === formData.woff_to_date) {
      showToast("❌ Existing date and Changed date cannot be the same.", "error");
      return;
    }

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/woff/apply`, formData);
      showToast(`✅ Woff Change Saved. ID: ${response.data.data.woff_id}`, "success");
      setIsDirty(false);
      resetForm();
    } catch (err) {
      console.error("Save error:", err);
      showToast(getErrorMessage(err, "Error saving woff application"), "error");
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
          <Typography variant="h6" fontWeight={700}>Woff Change Request</Typography>
          <IconButton onClick={() => { setIsDirty(false); onClose(); }}><CloseIcon /></IconButton>
        </Stack>

        <Box sx={{ mb: 2, display: 'flex', gap: 4, justifyContent: 'flex-start', alignItems: 'center' }}>
          <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="body2" color="text.secondary">Woff ID:</Typography>
            <Typography fontWeight={600}>{formData.woff_id}</Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="body2" color="text.secondary">Entry Date:</Typography>
            <Typography fontWeight={600}>{formatDateTimeAMPM(formData.woff_date)}</Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
          <TextField
            label={<RequiredLabel>Emp Id</RequiredLabel>}
            name="empid"
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
              Name: {formData.ename || "--"} • Unit: {formData.unit || "--"} • Div: {formData.division || "--"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Dept: {formData.department || "--"} • Sec: {formData.section || "--"} • Desig: {formData.designation || "--"}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ display: 'flex', gap: 1.5, mb: 2, alignItems: 'flex-start' }}>
          <Box sx={{ width: '150px' }} style={{ pointerEvents: 'auto' }}>
            <TextField
              label={<RequiredLabel>Existing Date</RequiredLabel>}
              name="woff_from_date"
              type="date"
              inputRef={dateInputRef}
              value={formData.woff_from_date}
              onChange={handleChange}
              onKeyDown={(e) => handleKeyDown(e, 'woff_from_date', toDateRef)}
              onBlur={() => {
                if (validateField('woff_from_date')) {
                  checkPayslipStatus(formData.woff_from_date, formData.empid, 'woff_from_date', dateInputRef, toDateRef);
                }
              }}
              size="small"
              fullWidth
              sx={requiredStyle}
              InputLabelProps={{ shrink: true }}
              helperText={fieldErrors.woff_from_date || formData.current_woff_day || " "}
              error={!!fieldErrors.woff_from_date}
              inputProps={{
                max: maxDateLimit,
                min: minDateLimit
              }}
              FormHelperTextProps={{ sx: { fontWeight: 'bold', color: fieldErrors.woff_from_date ? 'error.main' : 'primary.main', m: 0, mt: 0.5, fontSize: '0.7rem' } }}
            />
          </Box>
          <TextField
            label={<RequiredLabel>Changed Date</RequiredLabel>}
            name="woff_to_date"
            type="date"
            inputRef={toDateRef}
            onKeyDown={(e) => handleKeyDown(e, 'woff_to_date', shiftRef)}
            onBlur={() => {
              if (validateField('woff_to_date')) {
                checkPayslipStatus(formData.woff_to_date, formData.empid, 'woff_to_date', toDateRef, shiftRef);
              }
            }}
            value={formData.woff_to_date}
            onChange={handleChange}
            size="small"
            sx={{ ...requiredStyle, width: '150px' }}
            InputLabelProps={{ shrink: true }}
            error={!!fieldErrors.woff_to_date}
            helperText={fieldErrors.woff_to_date || formData.requested_woff_day || " "}
            FormHelperTextProps={{ sx: { fontWeight: 'bold', color: fieldErrors.woff_to_date ? 'error.main' : 'primary.main', m: 0, mt: 0.5, fontSize: '0.7rem' } }}
            inputProps={{
              max: maxDateLimit,
              min: minDateLimit
            }}
          />
          <FormControl size="small" sx={{ ...requiredStyle, width: '160px' }}>
            <InputLabel><RequiredLabel>Select Shift</RequiredLabel></InputLabel>
            <Select
              name="shift_cd"
              inputRef={shiftRef}
              open={shiftOpen}
              onOpen={() => setShiftOpen(true)}
              onClose={() => setShiftOpen(false)}
              onKeyDown={(e) => handleKeyDown(e, 'shift_cd', remarksRef, true, shiftOpen)}
              onBlur={() => validateField('shift_cd')}
              value={formData.shift_cd}
              onChange={(e) => {
                handleChange(e);
                setTimeout(() => remarksRef.current?.focus(), 100);
              }}
              label={<RequiredLabel>Select Shift</RequiredLabel>}
              error={!!fieldErrors.shift_cd}
            >
              {shifts.map(s => (
                <MenuItem key={s.shift_id} value={s.shift_cd}>{s.shift_cd} ({s.start_time?.slice(0, 5)}-{s.end_time?.slice(0, 5)})</MenuItem>
              ))}
            </Select>
            {fieldErrors.shift_cd && <FormHelperText error sx={{ fontSize: '0.7rem' }}>{fieldErrors.shift_cd}</FormHelperText>}
          </FormControl>
          <TextField
            label="Remarks"
            name="remarks"
            inputRef={remarksRef}
            onKeyDown={(e) => handleKeyDown(e, 'remarks', reasonRef)}
            value={formData.remarks}
            onChange={handleChange}
            size="small"
            sx={{ flex: 1 }}
            placeholder="Additional remarks..."
            inputProps={{ maxLength: 200 }}
          />
        </Box>

        <Box sx={{ mt: 2 }}>
          <TextField
            label={<RequiredLabel>Reason</RequiredLabel>}
            name="reason"
            inputRef={reasonRef}
            onKeyDown={(e) => handleKeyDown(e, 'reason', null)}
            onBlur={() => validateField('reason')}
            value={formData.reason}
            onChange={handleChange}
            fullWidth
            size="small"
            multiline
            rows={2}
            inputProps={{ maxLength: 200 }}
            sx={requiredStyle}
            error={!!fieldErrors.reason}
            helperText={fieldErrors.reason || `${formData.reason?.length || 0}/200 characters`}
          />
        </Box>

        <div className="save-btn-row" style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px', gap: '8px' }}>
          <Button variant="outlined" onClick={() => setShowPreview(true)}>Preview</Button>
          <button className="save-btn" onClick={saveWoffChange} style={{ padding: '8px 16px', background: '#1976d2', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
            Save
          </button>
        </div>
      </div>

      {showEmpPopup && (
        <EmployeeSelectDialog
          open={showEmpPopup}
          onClose={() => setShowEmpPopup(false)}
          onSelect={selectEmployee}
          data={employeeList}
        />
      )}

      {showPreview && (
        <WoffChangePreview data={formData} onClose={() => setShowPreview(false)} />
      )}
    </Box>
  );
};

export default WoffChangeForm;
