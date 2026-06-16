import React, { useState, useEffect, useRef } from "react";
import LeaveGrid from "./LeaveGrid";
import "./LeaveApplication.css";
import axios from "axios";
import { useToast } from "../../../context/ToastContext";
import { useNavigationGuard } from "../../../context/NavigationGuardContext";
import { formatDate } from "../../../utils/dateUtils";
import { getErrorMessage } from "../../../utils/errorUtils";
import {
  TextField, Typography, Button, Grid, Box, Paper,
  Stack, IconButton, Divider, InputAdornment, FormControl, InputLabel, Select, MenuItem
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import EmployeeSelectDialog from "../Employee/EmployeeSelectDialog";

axios.defaults.baseURL = import.meta.env.VITE_API_URL;

const RequiredLabel = ({ label }) => (
  <span>
    {label} <span style={{ color: 'red', marginLeft: 2 }}>*</span>
  </span>
);

// Helper to get user role and admin status
const getUserRole = () => localStorage.getItem('userRole') || '';
const isAdminUser = () => getUserRole().toLowerCase() === 'admin';

const getCurrentISTDateTime = () => {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const hh = String(now.getHours()).padStart(2, '0');
  const min = String(now.getMinutes()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
};

const LeaveApplication = ({ onClose }) => {
  const { showToast } = useToast();
  const [isDirty, setIsDirty] = useState(false);
  const [isAdmin, setIsAdmin] = useState(isAdminUser());
  const [formData, setFormData] = useState({
    lappNo: "",
    date: getCurrentISTDateTime(),
    empId: "",
    ename: "",
    department: "",
    designation: "",
    purpose: "",
    address: "",
    phone: "",
    clUsed: 0,
    clBalance: 0,
    elUsed: 0,
    elBalance: 0,
  });

  const purposeRef = useRef(null);
  const phoneRef = useRef(null);
  const addressRef = useRef(null);
  const empIdRef = useRef(null);

  const fieldRefs = {
    purpose: purposeRef,
    phone: phoneRef,
    address: addressRef,
    empId: empIdRef,
  };

  // Duplicate getCurrentISTDateTime removed

  const formatDateTimeAMPM = (dateInput) => {
    if (!dateInput) return "";
    const date = new Date(dateInput);
    if (isNaN(date)) return dateInput;
    const d = String(date.getDate()).padStart(2, '0');
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const y = date.getFullYear();
    let hours = date.getHours();
    const mins = String(date.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${d}-${m}-${y} ${hours}:${mins} ${ampm}`;
  };

  // Removed duplicate formData initialization – keep the earlier one.

  const [leaveDetails, setLeaveDetails] = useState([
    { dayType: "FULL DAY", fromDate: "", toDate: "", noOfDays: "", remarks: "" },
  ]);

  const [employeeList, setEmployeeList] = useState([]);
  const [showEmpPopup, setShowEmpPopup] = useState(false);
  const [totalDays, setTotalDays] = useState(0);
  const [isInvalid, setIsInvalid] = useState(false);
  const [gridKey, setGridKey] = useState(Date.now());
  const [fieldErrors, setFieldErrors] = useState({});

  const handleEnter = (e, nextRef) => {
    if (e.key === "Enter") {
      e.preventDefault();
      nextRef?.current?.focus();
    }
  };

  const loadEmpList = async () => {
    if (!isAdmin) return;
    try {
      const res = await axios.get('/api/employees');
      setEmployeeList(res.data);
      setShowEmpPopup(true);
    } catch (error) {
      showToast(getErrorMessage(error, "Failed to load employee list"), "error");
    }
  };

  const selectEmployee = async (emp) => {
    const address = [emp.cadd_sa, emp.cadd_city, emp.cadd_state].filter(Boolean).join(', ').slice(0, 100);
    const phone = (emp.cadd_mobile || emp.cadd_phone || '').replace(/\D/g, "").slice(0, 10);

    setFormData((prev) => ({
      ...prev,
      empId: emp.empid,
      ename: emp.ename,
      department: emp.deptname || emp.department || "",
      designation: emp.designation,
      address: address,
      phone: phone,
      clUsed: 0,
      clBalance: 0,
      elUsed: 0,
      elBalance: 0,
    }));
    setShowEmpPopup(false);

    try {
      const res = await axios.get(`/api/leave/balance/${emp.empid}`);
      setFormData((prev) => ({
        ...prev,
        clUsed: res.data.cls_utilised || 0,
        clBalance: res.data.cls_balance || 0,
        elUsed: res.data.els_utilised || 0,
        elBalance: res.data.els_balance || 0,
      }));
    } catch (error) {
      showToast(getErrorMessage(error, "Failed to fetch leave balance"), "error");
    }

    setTimeout(() => {
      if (purposeRef.current) purposeRef.current.focus();
    }, 100);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setIsDirty(true);

    if (name === "phone") {
      // Only allow numbers and max 10 digits
      const cleaned = value.replace(/\D/g, "").slice(0, 10);
      setFormData({ ...formData, [name]: cleaned });
    } else {
      setFormData({ ...formData, [name]: value });
    }
    setFieldErrors(prev => ({ ...prev, [name]: null }));
  };

  const resetForm = async () => {
    try {
      const res = await axios.get(`/api/leave/next-lno`);

      const loggedInEmpId = localStorage.getItem('empId') || "";
      const loggedInEmpName = localStorage.getItem('empName') || "";
      const loggedInDept = localStorage.getItem('deptname') || "";
      const loggedInDesig = localStorage.getItem('designation') || "";

      setFormData((prev) => ({
        ...prev,
        lappNo: res.data.nextLno,
        date: getCurrentISTDateTime(),
        empId: loggedInEmpId,
        ename: loggedInEmpName,
        department: loggedInDept,
        designation: loggedInDesig,
        purpose: "",
        address: "",
        phone: "",
        clUsed: 0,
        clBalance: 0,
        elUsed: 0,
        elBalance: 0,
      }));
      setLeaveDetails([{ dayType: "FULL DAY", fromDate: "", toDate: "", noOfDays: "", remarks: "" }]);
      setGridKey(Date.now());

      if (loggedInEmpId) {
        // Fetch employee master details to get address and phone
        axios.get(`/api/employees/${loggedInEmpId}`)
          .then((empRes) => {
            const emp = empRes.data;
            const address = [emp.cadd_sa, emp.cadd_city, emp.cadd_state].filter(Boolean).join(', ').slice(0, 100);
            const phone = (emp.cadd_mobile || emp.cadd_phone || '').replace(/\D/g, "").slice(0, 10);

            setFormData((prev) => ({
              ...prev,
              ename: emp.ename,
              department: emp.deptname || emp.department || prev.department,
              designation: emp.designation || prev.designation,
              address: address,
              phone: phone,
            }));
          })
          .catch((error) => {
            console.error("Failed to fetch employee master details", error);
          });

        axios.get(`/api/leave/balance/${loggedInEmpId}`)
          .then((balRes) => {
            setFormData((prev) => ({
              ...prev,
              clUsed: balRes.data.cls_utilised || 0,
              clBalance: balRes.data.cls_balance || 0,
              elUsed: balRes.data.els_utilised || 0,
              elBalance: balRes.data.els_balance || 0,
            }));
          })
          .catch((error) => {
            showToast(getErrorMessage(error, "Failed to fetch leave balance"), "error");
          });
      }

    } catch (error) {
      showToast(getErrorMessage(error, "Failed to fetch next leave number"), "error");
    }
  };

  const handleSave = async () => {
    let hasError = false;
    const newErrors = {};
    let firstRef = null;

    // Employee selection mandatory only for admin users
    if (isAdmin && !formData.empId) {
      newErrors.empId = "Employee selection is mandatory";
      hasError = true;
      if (!firstRef) firstRef = empIdRef;
    }

    if (!formData.purpose) {
      newErrors.purpose = "Required";
      hasError = true;
      if (!firstRef) firstRef = purposeRef;
    }
    if (!formData.phone) {
      newErrors.phone = "Required";
      hasError = true;
      if (!firstRef) firstRef = phoneRef;
    } else if (formData.phone.length !== 10) {
      newErrors.phone = "Must be 10 digits";
      hasError = true;
      if (!firstRef) firstRef = phoneRef;
    }
    if (!formData.address) {
      newErrors.address = "Required";
      hasError = true;
      if (!firstRef) firstRef = addressRef;
    }

    if (hasError) {
      setFieldErrors(newErrors);
      showToast("Please fill all required fields.", "error");
      if (firstRef && firstRef.current) firstRef.current.focus();
      return;
    }

    // Overlap check (same as original)
    if (formData.empId && leaveDetails.length > 0) {
      try {
        for (const row of leaveDetails) {
          if (!row.fromDate || !row.toDate) continue;
          const res = await axios.post('/api/leave/check-overlap', {
            empid: formData.empId,
            fromDate: row.fromDate,
            toDate: row.toDate,
          });
          if (res.data.overlap) {
            showToast(`⚠️ Overlap detected! Leave already exists for: ${res.data.overlapDate}`,
              "error");
            return;
          }
        }
      } catch (err) {
        console.error("Overlap check failed", err);
      }
    }

    // Ensure all grid rows have dates
    const incompleteRow = leaveDetails.find(item => !item.fromDate || !item.toDate);
    if (incompleteRow) {
      showToast("Please fill all From and To dates in the leave grid.", "error");
      return;
    }

    // Build payload
    const application = {
      lno: parseInt(formData.lappNo),
      ldate: new Date().toISOString(),
      empid: parseInt(formData.empId),
      ename: formData.ename,
      designation: formData.designation,
      department: formData.department,
      pofl: formData.purpose,
      address: formData.address,
      phno: formData.phone || null,
      c_unit: "UNIT1",
      c_gempid: localStorage.getItem('empId') || "admin",
      status: "Pending"
    };
    const details = leaveDetails.map(item => ({
      daydt: item.dayType,
      frmdt: item.fromDate,
      todate: item.toDate,
      nod: parseFloat(item.noOfDays) || 0,
      remarks: item.remarks,
      empno: parseInt(formData.empId),
      c_unit: "UNIT1",
      c_gempid: localStorage.getItem('empId') || "admin",
    }));

    try {
      const res = await axios.post(`/api/leave/apply`, { application, leaveDetails: details });
      if (res.status === 200 || res.status === 201) {
        showToast(res.data.message || `Leave Application Saved. No: ${res.data.lno}`,
          "success");
        setIsDirty(false);
        resetForm();
      }
    } catch (error) {
      showToast(getErrorMessage(error, "Error saving leave application"), "error");
    }
  };


  useEffect(() => {
    const total = leaveDetails.reduce((sum, row) => {
      const val = parseFloat(row.noOfDays);
      return sum + (isNaN(val) ? 0 : val);
    }, 0);
    setTotalDays(total);
  }, [leaveDetails]);

  const [minDateLimit, setMinDateLimit] = useState(() => {
    const currentYear = new Date().getFullYear();
    return `${currentYear - 1}-01-01`;
  });

  useEffect(() => {
    const fetchLatestProcessed = async () => {
      try {
        const res = await axios.get(`/api/payroll/latest-processed`);
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
      }
    };
    fetchLatestProcessed();
  }, []);

  const maxDateLimit = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 90); // Allow up to 90 days for leave application
    return d.toISOString().split('T')[0];
  })();

  useEffect(() => {
    resetForm();
  }, []);

  return (
    <Box>
      <div className="p-6 max-w-6xl mx-auto bg-white border rounded-lg shadow">
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h6" fontWeight={700}>Leave Application</Typography>
          <IconButton onClick={() => { setIsDirty(false); onClose(); }}><CloseIcon /></IconButton>
        </Stack>

        {/* Standardized Header: Left aligned ID and Date with Time */}
        <Box sx={{ mb: 2, display: 'flex', gap: 4, justifyContent: 'flex-start', alignItems: 'center' }}>
          <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="body2" color="text.secondary">Leave ID:</Typography>
            <Typography fontWeight={600}>{formData.lappNo}</Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="body2" color="text.secondary">Date:</Typography>
            <Typography fontWeight={600}>{formatDateTimeAMPM(formData.date)}</Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Two-panel layout: Left = Employee Details, Right = Leave Summary */}
        <Box sx={{ display: 'flex', gap: 1.5, flexDirection: { xs: 'column', md: 'row' }, mb: 1 }}>

          {/* ── DIV 1: Employee Details ── */}
          <Box component="fieldset" sx={{ flex: 7, border: '1px solid #e0e0e0', borderRadius: 1, p: 1.5, bgcolor: '#fafafa', m: 0, display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Typography component="legend" variant="subtitle2" fontWeight={700} color="primary.main" sx={{ px: 1 }}>
              Employee Details
            </Typography>
            {/* Row 1: Emp ID + Name/Dept/Desig */}
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: { xs: 'wrap', sm: 'nowrap' } }}>
              <TextField
                label={<RequiredLabel label="Emp Id" />}
                name="empId"
                value={formData.empId}
                onClick={isAdmin ? loadEmpList : undefined}
                size="small"
                placeholder={isAdmin ? "Select" : ""}
                sx={{
                  width: '140px',
                  minWidth: '140px',
                  bgcolor: isAdmin ? '#fffde7' : '#f5f5f5',
                  cursor: isAdmin ? 'pointer' : 'default'
                }}
                InputProps={{
                  readOnly: true,
                  endAdornment: isAdmin ? (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={loadEmpList}>
                        <SearchIcon fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  ) : null,
                }}
              />
              <Box sx={{ flex: 1, py: 0.5, px: 1, bgcolor: '#fff', borderRadius: 1, border: '1px solid #e0e0e0', display: 'flex', alignItems: 'center', minHeight: '36px' }}>
                <Typography fontWeight={600} variant="body2">
                  {formData.ename || "--"} &nbsp;•&nbsp; {formData.department || "--"} &nbsp;•&nbsp; {formData.designation || "--"}
                </Typography>
              </Box>
            </Box>
            {/* Row 2: Purpose + Phone */}
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: { xs: 'wrap', sm: 'nowrap' } }}>
              <FormControl size="small" sx={{ width: '140px', minWidth: '140px', bgcolor: '#fffde7' }}>
                <InputLabel><RequiredLabel label="Purpose" /></InputLabel>
                <Select
                  name="purpose"
                  value={formData.purpose}
                  onChange={handleChange}
                  label={<RequiredLabel label="Purpose" />}
                  inputRef={purposeRef}
                  onKeyDown={(e) => handleEnter(e, phoneRef)}
                  error={!!fieldErrors.purpose}
                >
                  <MenuItem value="PERSONAL">PERSONAL</MenuItem>
                  <MenuItem value="SICK">SICK</MenuItem>
                  <MenuItem value="EMERGENCY">EMERGENCY</MenuItem>
                </Select>
              </FormControl>
              <TextField
                label={<RequiredLabel label="Phone" />}
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                size="small"
                sx={{ flex: 1 }}
                inputRef={phoneRef}
                onKeyDown={(e) => handleEnter(e, addressRef)}
                error={!!fieldErrors.phone}
                helperText={fieldErrors.phone}
                inputProps={{
                  maxLength: 10,
                  inputMode: 'numeric',
                  pattern: '[0-9]*'
                }}
              />
            </Box>
            {/* Row 3: Address (full width) */}
            <TextField
              label={<RequiredLabel label="Address / Reason" />}
              name="address"
              value={formData.address}
              onChange={handleChange}
              size="small"
              fullWidth
              placeholder="Address or reason..."
              inputProps={{ maxLength: 100 }}
              inputRef={addressRef}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  // End of main fields
                }
              }}
              error={!!fieldErrors.address}
              helperText={fieldErrors.address || `${formData.address?.length || 0}/100 characters`}
            />
          </Box>

          {/* ── DIV 2: Leave Summary ── */}
          <Box component="fieldset" sx={{ flex: 4, border: '1px solid #e0e0e0', borderRadius: 1, p: 1.5, bgcolor: '#fafafa', m: 0, display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Typography component="legend" variant="subtitle2" fontWeight={700} color="primary.main" sx={{ px: 1 }}>
              Leave Summary
            </Typography>
            {/* Row 1: Utilised */}
            <Box>
              <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ mb: 0.5, display: 'block', textTransform: 'uppercase', letterSpacing: 1, fontSize: '0.7rem' }}>
                Utilised
              </Typography>
              <Stack direction="row" spacing={0.75}>
                <Paper elevation={1} sx={{ flex: 1, py: 0.5, px: 1, bgcolor: '#fff3e0', borderLeft: '3px solid #ef6c00', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ color: '#e65100', fontWeight: 600 }}>CL</Typography>
                  <Typography variant="subtitle1" fontWeight="bold" color="#e65100">{parseFloat(formData.clUsed) || 0}</Typography>
                </Paper>
                <Paper elevation={1} sx={{ flex: 1, py: 0.5, px: 1, bgcolor: '#fff3e0', borderLeft: '3px solid #ef6c00', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ color: '#e65100', fontWeight: 600 }}>EL</Typography>
                  <Typography variant="subtitle1" fontWeight="bold" color="#e65100">{parseFloat(formData.elUsed) || 0}</Typography>
                </Paper>
                <Paper elevation={1} sx={{ flex: 1, py: 0.5, px: 1, bgcolor: '#ffe0b2', borderLeft: '3px solid #e65100', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ color: '#bf360c', fontWeight: 600 }}>Total</Typography>
                  <Typography variant="subtitle1" fontWeight="bold" color="#bf360c">{(Number(formData.clUsed) + Number(formData.elUsed)) || 0}</Typography>
                </Paper>
              </Stack>
            </Box>
            {/* Row 2: Balance */}
            <Box>
              <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ mb: 0.5, display: 'block', textTransform: 'uppercase', letterSpacing: 1, fontSize: '0.7rem' }}>
                Balance
              </Typography>
              <Stack direction="row" spacing={0.75}>
                <Paper elevation={1} sx={{ flex: 1, py: 0.5, px: 1, bgcolor: '#e8f5e9', borderLeft: '3px solid #2e7d32', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ color: '#1b5e20', fontWeight: 600 }}>CL</Typography>
                  <Typography variant="subtitle1" fontWeight="bold" color="#1b5e20">{parseFloat(formData.clBalance) || 0}</Typography>
                </Paper>
                <Paper elevation={1} sx={{ flex: 1, py: 0.5, px: 1, bgcolor: '#e8f5e9', borderLeft: '3px solid #2e7d32', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ color: '#1b5e20', fontWeight: 600 }}>EL</Typography>
                  <Typography variant="subtitle1" fontWeight="bold" color="#1b5e20">{parseFloat(formData.elBalance) || 0}</Typography>
                </Paper>
                <Paper elevation={2} sx={{ flex: 1, py: 0.5, px: 1, bgcolor: '#c8e6c9', borderLeft: '3px solid #1b5e20', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ color: '#1b5e20', fontWeight: 600 }}>Total</Typography>
                  <Typography variant="subtitle1" fontWeight="bold" color="#1b5e20">{parseFloat(Number(formData.clBalance) + Number(formData.elBalance)) || 0}</Typography>
                </Paper>
              </Stack>
            </Box>
          </Box>

        </Box>

        <LeaveGrid
          key={gridKey}
          leaveDetails={leaveDetails}
          setLeaveDetails={setLeaveDetails}
          totalDays={totalDays}
          onValidationError={(hasError) => setIsInvalid(hasError)}
          onSave={handleSave}
          isSaveDisabled={isInvalid}
          empId={formData.empId}
          onDirty={() => setIsDirty(true)}
          minDateLimit={minDateLimit}
          maxDateLimit={maxDateLimit}
        />
      </div>

      <EmployeeSelectDialog
        open={showEmpPopup}
        onClose={() => setShowEmpPopup(false)}
        onSelect={selectEmployee}
        data={employeeList}
      />
    </Box>
  );
};

export default LeaveApplication;
