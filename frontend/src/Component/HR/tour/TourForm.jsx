import React, { useState, useEffect } from "react";
import {
  TextField, Typography, Button, Grid, Box, Divider, InputAdornment, Stack, IconButton
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import EmployeeSelectDialog from "../Employee/EmployeeSelectDialog";
import { useToast } from "../../../context/ToastContext";
import { useNavigationGuard } from "../../../context/NavigationGuardContext";
import axios from "axios";
import TourPreview from "./TourPreview";
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

const TourForm = ({ onClose }) => {
  const destinationRef = React.useRef(null);
  const dateInputRef = React.useRef(null);
  const toDateRef = React.useRef(null);
  const amountRef = React.useRef(null);
  const remarksRef = React.useRef(null);
  const purposeRef = React.useRef(null);

  const fieldRefs = {
    destination: destinationRef,
    tour_from_date: dateInputRef,
    tour_to_date: toDateRef,
    estimated_amount: amountRef,
    remarks: remarksRef,
    purpose: purposeRef,
  };

  const { showToast } = useToast();
  const { setIsDirty } = useNavigationGuard();
  const [fieldErrors, setFieldErrors] = useState({ tour_from_date: null });
  const [isAdmin, setIsAdmin] = useState(isAdminUser());

  const getCurrentISTDateTime = () => {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    const hh = String(now.getHours()).padStart(2, "0");
    const min = String(now.getMinutes()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
  };

  const [formData, setFormData] = useState({
    tour_id: "",
    tour_date: getCurrentISTDateTime(),
    empid: "",
    ename: "",
    unit: "",
    division: "",
    designation: "",
    tour_from_date: "",
    tour_to_date: "",
    destination: "",
    purpose: "",
    estimated_amount: "",
    remarks: ""
  });

  const [showEmpPopup, setShowEmpPopup] = useState(false);
  const [employeeList, setEmployeeList] = useState([]);
  const [showPreview, setShowPreview] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setIsDirty(true);
    setFieldErrors(prev => ({ ...prev, [name]: null }));

    setFormData(prev => {
      const newData = { ...prev, [name]: value };

      // Validate date range if both are present
      if ((name === 'tour_from_date' || name === 'tour_to_date') && newData.tour_from_date && newData.tour_to_date) {
        if (new Date(newData.tour_to_date) < new Date(newData.tour_from_date)) {
          setFieldErrors(errors => ({ ...errors, tour_to_date: "In Time cannot be earlier than Out Time" }));
        } else {
          setFieldErrors(errors => ({ ...errors, tour_to_date: null }));
        }
      }
      return newData;
    });
  };

  const handleKeyDown = (e, currentField, nextRef) => {
    if (e.key === "Enter" || e.key === "Tab") {
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
          saveTour();
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
      case 'destination':
        if (!value) error = "Please specify place to go";
        break;
      case 'tour_from_date':
        if (!value) error = "Please enter out time";
        break;
      case 'tour_to_date':
        if (formData.tour_from_date && value && new Date(value) < new Date(formData.tour_from_date)) {
          error = "In Time cannot be earlier than Out Time";
        }
        break;
      case 'purpose':
        if (!value) error = "Please specify the purpose of tour";
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

  const checkPayslipStatus = async (date, empid) => {
    if (!date) return;
    try {
      const dateOnly = date.split('T')[0];
      const dObj = new Date(dateOnly);
      const y = dObj.getFullYear();
      const m = dObj.getMonth() + 1;

      if (isNaN(y) || y < 1900) {
        const errorMsg = y < 1900 ? "Invalid Year (must be after 1900)" : "Invalid Date";
        setFieldErrors(prev => ({ ...prev, tour_from_date: errorMsg }));
        if (dateInputRef.current) dateInputRef.current.focus();
        return;
      }

      // 🛑 Sync manual entry with calendar limits
      if (dateOnly < minDateLimit || dateOnly > maxDateLimit) {
        const fmt = (s) => s ? s.split('-').reverse().join('-') : "";
        const errorMsg = `Date must be between ${fmt(minDateLimit)} and ${fmt(maxDateLimit)}`;
        setFieldErrors(prev => ({ ...prev, tour_from_date: errorMsg }));
        showToast(errorMsg, "error");
        if (dateInputRef.current) dateInputRef.current.focus();
        return;
      }

      // Clear previous error before checking new date
      setFieldErrors(prev => ({ ...prev, tour_from_date: null }));

      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/payroll/check-status`, {
        params: { empid, year: y, month: m }
      });

      if (res.data.generated) {
        const { C_MONTH, C_YEAR } = res.data.details || {};
        const msg = `Payroll already processed up to ${C_MONTH} ${C_YEAR}. Backdated entries not allowed.`;
        setFieldErrors(prev => ({ ...prev, tour_from_date: msg }));
        if (dateInputRef.current) dateInputRef.current.focus();
      } else {
        setFieldErrors(prev => ({ ...prev, tour_from_date: null }));
        // Successful validation: move to next field
        if (toDateRef.current) toDateRef.current.focus();
      }
    } catch (err) {
      console.error("Error checking payslip status:", err);
      const msg = getErrorMessage(err, "Server error checking status.");
      setFieldErrors(prev => ({ ...prev, tour_from_date: msg }));
    }
  };

  const resetForm = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/tour/next-id`);

      const loggedInEmpId = localStorage.getItem('empId') || "";
      const loggedInEmpName = localStorage.getItem('empName') || "";
      const loggedInDept = localStorage.getItem('deptname') || "";
      const loggedInDesig = localStorage.getItem('designation') || "";

      setFormData({
        tour_id: response.data.nextTourId,
        tour_date: getCurrentISTDateTime(),
        empid: loggedInEmpId,
        ename: loggedInEmpName,
        unit: "",
        division: "",
        designation: loggedInDesig,
        tour_from_date: "",
        tour_to_date: "",
        destination: "",
        purpose: "",
        estimated_amount: "",
        remarks: ""
      });
      setFieldErrors({ tour_from_date: null });

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
      console.error("Failed to fetch next tour ID:", error);
    }
  };

  useEffect(() => { resetForm(); }, []);

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
    // After selection, focus on first input
    setTimeout(() => {
      if (destinationRef.current) destinationRef.current.focus();
    }, 100);
  };

  const saveTour = async () => {
    let hasError = false;
    const newErrors = { ...fieldErrors };
    let firstRef = null;

    if (!formData.empid) { newErrors.empid = "Please select an employee"; hasError = true; }
    if (!formData.tour_from_date) { newErrors.tour_from_date = "Please enter out time"; hasError = true; if (!firstRef) firstRef = dateInputRef; }
    if (!formData.destination) { newErrors.destination = "Please specify place to go"; hasError = true; if (!firstRef) firstRef = destinationRef; }
    if (!formData.purpose) { newErrors.purpose = "Please specify the purpose of tour"; hasError = true; if (!firstRef) firstRef = purposeRef; }

    if (hasError || fieldErrors.tour_to_date) {
      setFieldErrors(newErrors);
      const firstError = fieldErrors.tour_to_date || Object.values(newErrors).find(msg => typeof msg === 'string');
      showToast(firstError || "Please fill all required fields.", "error");
      if (fieldErrors.tour_to_date && toDateRef.current) {
        toDateRef.current.focus();
      } else if (firstRef && firstRef.current) {
        firstRef.current.focus();
      }
      return;
    }
    if (fieldErrors.tour_from_date) {
      if (dateInputRef.current) dateInputRef.current.focus();
      return;
    }
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/tour/apply`, formData);
      showToast(`✅ Tour Application Saved. ID: ${response.data.data.tour_id}`, "success");
      setIsDirty(false);
      resetForm();
    } catch (err) {
      console.error("Save error:", err);
      showToast(getErrorMessage(err, "Error saving Tour application"), "error");
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
          <Typography variant="h6" fontWeight={700}>Tour Application</Typography>
          <IconButton onClick={() => { setIsDirty(false); onClose(); }}><CloseIcon /></IconButton>
        </Stack>

        <Box sx={{ mb: 2, display: 'flex', gap: 4, justifyContent: 'flex-start', alignItems: 'center' }}>
          <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="body2" color="text.secondary">Tour ID:</Typography>
            <Typography fontWeight={600}>{formData.tour_id}</Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="body2" color="text.secondary">Entry Date:</Typography>
            <Typography fontWeight={600}>{formatDateTimeAMPM(formData.tour_date)}</Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
          <TextField
            label={<RequiredLabel>Emp ID</RequiredLabel>}
            name="empid"
            value={formData.empid}
            onClick={isAdmin ? openEmpPopup : undefined}
            onKeyDown={(e) => handleKeyDown(e, 'empid', destinationRef)}
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
              Unit: {formData.unit || ""} • Div: {formData.division || ""} • Desig: {formData.designation || ""}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ display: 'flex', gap: 1.5, mb: 2, alignItems: 'flex-start' }}>
          <TextField
            label={<RequiredLabel>Place To Go</RequiredLabel>}
            name="destination"
            inputRef={destinationRef}
            onKeyDown={(e) => handleKeyDown(e, 'destination', dateInputRef)}
            onBlur={() => validateField('destination')}
            value={formData.destination}
            onChange={handleChange}
            size="small"
            sx={{ ...requiredStyle, width: '150px' }}
            inputProps={{ maxLength: 200 }}
            error={!!fieldErrors.destination}
            helperText={fieldErrors.destination}
          />
          <Box sx={{ width: '175px' }} style={{ pointerEvents: 'auto' }}>
            <TextField
              label={<RequiredLabel>Out Time</RequiredLabel>}
              name="tour_from_date"
              type="datetime-local"
              inputRef={dateInputRef}
              value={formData.tour_from_date}
              onChange={handleChange}
              onKeyDown={(e) => handleKeyDown(e, 'tour_from_date', toDateRef)}
              onBlur={() => checkPayslipStatus(formData.tour_from_date, formData.empid)}
              size="small"
              fullWidth
              sx={requiredStyle}
              InputLabelProps={{ shrink: true }}
              error={!!fieldErrors.tour_from_date}
              inputProps={{
                max: `${maxDateLimit}T23:59`,
                min: `${minDateLimit}T00:00`
              }}
            />
            {fieldErrors.tour_from_date && (
              <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block', fontWeight: 500, fontSize: '0.7rem', lineHeight: 1.1 }}>
                {fieldErrors.tour_from_date}
              </Typography>
            )}
          </Box>
          <TextField
            label="In Time"
            name="tour_to_date"
            type="datetime-local"
            inputRef={toDateRef}
            onKeyDown={(e) => handleKeyDown(e, 'tour_to_date', amountRef)}
            onBlur={() => {
              if (validateField('tour_to_date')) {
                checkPayslipStatus(formData.tour_to_date, formData.empid, 'tour_to_date', toDateRef, amountRef);
              }
            }}
            value={formData.tour_to_date}
            onChange={handleChange}
            size="small"
            sx={{ width: '175px' }}
            InputLabelProps={{ shrink: true }}
            error={!!fieldErrors.tour_to_date}
            helperText={fieldErrors.tour_to_date}
            inputProps={{
              max: `${maxDateLimit}T23:59`,
              min: `${minDateLimit}T00:00`
            }}
          />
          <TextField
            label="Est. Amt"
            name="estimated_amount"
            inputRef={amountRef}
            onKeyDown={(e) => handleKeyDown(e, 'estimated_amount', remarksRef)}
            value={formData.estimated_amount}
            onChange={handleChange}
            size="small"
            sx={{ width: '100px' }}
          />
          <TextField
            label="Remarks"
            name="remarks"
            inputRef={remarksRef}
            onKeyDown={(e) => handleKeyDown(e, 'remarks', purposeRef)}
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
            label={<RequiredLabel>Purpose Of Tour</RequiredLabel>}
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
            inputProps={{ maxLength: 200 }}
            sx={requiredStyle}
            error={!!fieldErrors.purpose}
            helperText={fieldErrors.purpose || `${formData.purpose?.length || 0}/200 characters`}
          />
        </Box>

        <div className="save-btn-row" style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px', gap: '8px' }}>
          <Button variant="outlined" onClick={() => setShowPreview(true)}>Preview</Button>
          <button className="save-btn" onClick={saveTour} style={{ padding: '8px 16px', background: '#1976d2', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
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
        <TourPreview data={formData} onClose={() => setShowPreview(false)} />
      )}
    </Box>
  );
};

export default TourForm;
