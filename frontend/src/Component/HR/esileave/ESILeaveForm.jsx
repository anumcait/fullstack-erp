import React, { useState, useEffect } from "react";
import {
  TextField, Typography, Button, Box, Stack, IconButton, Divider, InputAdornment
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import axios from "axios";
import { useToast } from "../../../context/ToastContext";
import { useNavigationGuard } from "../../../context/NavigationGuardContext";
import EmployeeSelectDialog from "../Employee/EmployeeSelectDialog";
import ESILeavePreview from "./ESILeavePreview";
import { formatDateTimeAMPM } from "../../../utils/dateUtils";
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

const ESILeaveForm = ({ onClose }) => {
  const dateInputRef = React.useRef(null);
  const toDateRef = React.useRef(null);
  const { showToast } = useToast();
  const { setIsDirty } = useNavigationGuard();
  const [fieldErrors, setFieldErrors] = useState({ leave_from_date: null });
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
    esi_leave_id: "",
    esi_leave_date: getCurrentISTDateTime(),
    empid: "",
    ename: "",
    unit: "",
    division: "",
    designation: "",
    esi_no: "",
    esi_dispencery: "",
    hospital_name: "",
    leave_from_date: "",
    leave_to_date: "",
    no_of_days: "",
    reason: ""
  });

  const [showEmpPopup, setShowEmpPopup] = useState(false);
  const [employeeList, setEmployeeList] = useState([]);
  const [showPreview, setShowPreview] = useState(false);

  const handleChange = (e) => {
    setIsDirty(true);
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setFieldErrors(prev => ({ ...prev, [e.target.name]: null }));
  };

  const resetForm = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/esileave/next-id`);
      
      const loggedInEmpId = localStorage.getItem('empId') || "";
      const loggedInEmpName = localStorage.getItem('empName') || "";
      const loggedInDept = localStorage.getItem('deptname') || "";
      const loggedInDesig = localStorage.getItem('designation') || "";

      setFormData({
        esi_leave_id: response.data.nextESILeaveId,
        esi_leave_date: getCurrentISTDateTime(),
        empid: loggedInEmpId,
        ename: loggedInEmpName,
        unit: "",
        division: "",
        designation: loggedInDesig,
        esi_no: "",
        esi_dispencery: "",
        hospital_name: "",
        leave_from_date: "",
        leave_to_date: "",
        no_of_days: "",
        reason: ""
      });
      setFieldErrors({ leave_from_date: null });

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
              esi_no: emp.esiNo || prev.esi_no || ""
            }));
          })
          .catch((error) => {
            console.error("Failed to fetch employee master details", error);
          });
      }
    } catch (error) {
      console.error("Failed to fetch next ESI Leave ID:", error);
    }
  };

  useEffect(() => { resetForm(); }, []);

  const openEmpPopup = async () => {
    if (!isAdmin) return;
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/employees`);
      setEmployeeList(response.data);
      setShowEmpPopup(true);
    } catch (error) {
      showToast(getErrorMessage(error, "Failed to fetch employees"), "error");
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
      esi_no: emp.esiNo || ""
    });
    setShowEmpPopup(false);
  };

  useEffect(() => {
    if (formData.leave_from_date && formData.leave_to_date) {
      const from = new Date(formData.leave_from_date);
      const to = new Date(formData.leave_to_date);
      const diffTime = Math.abs(to - from);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      setFormData(prev => ({ ...prev, no_of_days: diffDays }));
    }
  }, [formData.leave_from_date, formData.leave_to_date]);
  const checkPayslipStatus = async (date, empid) => {
    if (!date) return;
    try {
      const dObj = new Date(date);
      const y = dObj.getFullYear();
      const m = dObj.getMonth() + 1;
      if (isNaN(y) || y < 1900) return;

      if (y > 2099 || y < 2000) {
        setFieldErrors(prev => ({ ...prev, leave_from_date: "Invalid Year (Range: 2000-2099)" }));
        if (dateInputRef.current) dateInputRef.current.focus();
        return;
      }

      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/payroll/check-status`, {
        params: { empid, year: y, month: m }
      });

      if (res.data.generated) {
        const { C_MONTH, C_YEAR } = res.data.details || {};
        const msg = `Payroll already processed up to ${C_MONTH} ${C_YEAR}. Backdated entries not allowed.`;
        setFieldErrors(prev => ({ ...prev, leave_from_date: msg }));
        if (dateInputRef.current) dateInputRef.current.focus();
      } else {
        setFieldErrors(prev => ({ ...prev, leave_from_date: null }));
        // Successful validation: move to next field
        if (toDateRef.current) toDateRef.current.focus();
      }
    } catch (err) {
      console.error("Error checking payslip status:", err);
      setFieldErrors(prev => ({ ...prev, leave_from_date: "Server error checking status." }));
    }
  };

  useEffect(() => {
    if (formData.leave_from_date) {
      checkPayslipStatus(formData.leave_from_date, formData.empid);
    }
  }, [formData.leave_from_date, formData.empid]);

  const saveESILeave = async () => {
    let hasError = false;
    const newErrors = { ...fieldErrors };
    let firstRef = null;

    if (!formData.empid) { newErrors.empid = "Please select an employee"; hasError = true; }
    if (!formData.leave_from_date) { newErrors.leave_from_date = "Please select from date"; hasError = true; if (!firstRef) firstRef = dateInputRef; }
    if (!formData.leave_to_date) { newErrors.leave_to_date = "Please select to date"; hasError = true; if (!firstRef) firstRef = toDateRef; }
    if (!formData.reason) { newErrors.reason = "Please specify a reason"; hasError = true; }

    if (hasError) {
      setFieldErrors(newErrors);
      showToast("❌ Please fill all required fields.", "error");
      if (firstRef && firstRef.current) firstRef.current.focus();
      return;
    }
    if (fieldErrors.leave_from_date) {
      if (dateInputRef.current) dateInputRef.current.focus();
      return;
    }
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/esileave/save`, formData);
      showToast(`✅ ESI Leave Saved. ID: ${response.data.esi_leave_id}`, "success");
      setIsDirty(false);
      resetForm();
    } catch (err) {
      console.error("Save error:", err);
      showToast(getErrorMessage(err, "Error saving ESI Leave application"), "error");
    }
  };

  const handleGlobalFocus = (e) => {
    if (fieldErrors.leave_from_date && dateInputRef.current && e.target !== dateInputRef.current) {
      e.stopPropagation();
      dateInputRef.current.focus();
    }
  };

  return (
    <Box onFocusCapture={handleGlobalFocus}>
      <div className="p-6 max-w-4xl mx-auto bg-white border rounded-lg shadow"
        style={fieldErrors.leave_from_date ? { pointerEvents: 'none' } : {}}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'var(--heading-color)', borderLeft: '4px solid', borderColor: 'primary.main', pl: 1.5, lineHeight: 1.2 }}>ESI Leave Request</Typography>
          <IconButton onClick={() => { setIsDirty(false); onClose(); }}><CloseIcon /></IconButton>
        </Stack>

        <Box sx={{ display: 'flex', gap: 4, mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" color="text.secondary">ESI Leave No:</Typography>
            <Typography fontWeight={600}>{formData.esi_leave_id}</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" color="text.secondary">Entry Date:</Typography>
            <Typography fontWeight={600}>{formatDateTimeAMPM(formData.esi_leave_date)}</Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
          <TextField
            label={<RequiredLabel>Emp ID</RequiredLabel>}
            name="empid"
            value={formData.empid}
            onClick={isAdmin ? openEmpPopup : undefined}
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
              {formData.ename || "Select Employee"}
              {formData.ename && ` • ${formData.unit || "--"} • ${formData.division || "--"} • ${formData.designation || "--"}`}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
          <TextField
            label="ESI No"
            name="esi_no"
            size="small"
            sx={{ flex: '1 1 180px' }}
            value={formData.esi_no}
            onChange={handleChange}
          />
          <TextField
            label="ESI Dispencery"
            name="esi_dispencery"
            size="small"
            sx={{ flex: '1 1 180px' }}
            value={formData.esi_dispencery}
            onChange={handleChange}
          />
          <TextField
            label="Hospital Name"
            name="hospital_name"
            size="small"
            sx={{ flex: '1 1 180px' }}
            value={formData.hospital_name}
            onChange={handleChange}
          />
        </Box>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
          <Box sx={{ flex: '1 1 180px' }} style={{ pointerEvents: 'auto' }}>
            <TextField
              label={<RequiredLabel>From Date</RequiredLabel>}
              name="leave_from_date"
              type="date"
              inputRef={dateInputRef}
              size="small"
              fullWidth
              sx={requiredStyle}
              value={formData.leave_from_date}
              onChange={handleChange}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !fieldErrors.leave_from_date) {
                  e.preventDefault();
                  if (toDateRef.current) toDateRef.current.focus();
                } else if ((e.key === 'Tab' || e.key === 'Enter') && fieldErrors.leave_from_date) {
                  e.preventDefault();
                  if (dateInputRef.current) dateInputRef.current.focus();
                }
              }}
              onBlur={() => checkPayslipStatus(formData.leave_from_date, formData.empid)}
              InputLabelProps={{ shrink: true }}
              error={!!fieldErrors.leave_from_date}
              inputProps={{
                max: "2099-12-31",
                min: "2000-01-01"
              }}
            />
            {fieldErrors.leave_from_date && (
              <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block', fontWeight: 500 }}>
                {fieldErrors.leave_from_date}
              </Typography>
            )}
          </Box>
          <TextField
            label={<RequiredLabel>To Date</RequiredLabel>}
            name="leave_to_date"
            type="date"
            inputRef={toDateRef}
            size="small"
            sx={{ ...requiredStyle, flex: '1 1 180px' }}
            value={formData.leave_to_date}
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
            error={!!fieldErrors.leave_to_date}
            helperText={fieldErrors.leave_to_date}
          />
          <TextField
            label="No of Days"
            name="no_of_days"
            type="number"
            size="small"
            sx={{ flex: '1 1 180px' }}
            value={formData.no_of_days}
            disabled
          />
        </Box>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
          <TextField
            label={<RequiredLabel>Reason</RequiredLabel>}
            name="reason"
            size="small"
            sx={{ flex: '1 1 400px', ...requiredStyle }}
            value={formData.reason}
            onChange={handleChange}
            inputProps={{ maxLength: 200 }}
            helperText={fieldErrors.reason || `${formData.reason?.length || 0}/200 characters`}
            error={!!fieldErrors.reason}
          />
        </Box>

        <div className="save-btn-row" style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px', gap: '8px' }}>
          <Button variant="outlined" onClick={() => setShowPreview(true)}>Preview</Button>
          <button className="save-btn" onClick={saveESILeave} style={{ padding: '8px 16px', background: 'var(--primary-main)', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
            💾 <u>S</u>ave
          </button>
        </div>
      </div>

      <EmployeeSelectDialog open={showEmpPopup} onClose={() => setShowEmpPopup(false)} onSelect={selectEmployee} data={employeeList} />
      {showPreview && <ESILeavePreview data={formData} onClose={() => setShowPreview(false)} />}
    </Box>
  );
};

export default ESILeaveForm;
