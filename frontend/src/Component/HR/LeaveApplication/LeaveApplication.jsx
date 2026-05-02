import React, { useState, useEffect, useRef } from "react";
import LeaveGrid from "./LeaveGrid";
import "./LeaveApplication.css";
import axios from "axios";
import { useToast } from "../../../context/ToastContext";
import { formatDate } from "../../../utils/dateUtils";
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
    {label} <span style={{ color: "red" }}>*</span>
  </span>
);

const TestApplication = ({ onClose }) => {
  const { showToast } = useToast();

  const getCurrentISTDateTime = () => {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const hh = String(now.getHours()).padStart(2, '0');
    const min = String(now.getMinutes()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
  };

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

  const [formData, setFormData] = useState({
    lappNo: "",
    date: getCurrentISTDateTime(),
    empId: "",
    ename: "",
    department: "",
    designation: "",
    purpose: "",
    clUsed: 0,
    clBalance: 0,
    elUsed: 0,
    elBalance: 0,
    address: "",
    phone: "",
  });

  const [leaveDetails, setLeaveDetails] = useState([
    { dayType: "FULL DAY", fromDate: "", toDate: "", noOfDays: "", remarks: "" },
  ]);

  const [employeeList, setEmployeeList] = useState([]);
  const [showEmpPopup, setShowEmpPopup] = useState(false);
  const [totalDays, setTotalDays] = useState(0);
  const [isInvalid, setIsInvalid] = useState(false);
  const [gridKey, setGridKey] = useState(Date.now());
  const purposeRef = useRef(null);
  const phoneRef = useRef(null);
  const addressRef = useRef(null);

  const handleEnter = (e, nextRef) => {
    if (e.key === "Enter") {
      e.preventDefault();
      nextRef?.current?.focus();
    }
  };

  const loadEmpList = async () => {
    try {
      const res = await axios.get(`/api/employees`);
      setEmployeeList(res.data);
      setShowEmpPopup(true);
    } catch (err) {
      showToast("Failed to load employee list", "error");
    }
  };

  const selectEmployee = async (emp) => {
    setFormData((prev) => ({
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
      setFormData((prev) => ({
        ...prev,
        clUsed: res.data.cls_utilised || 0,
        clBalance: res.data.cls_balance || 0,
        elUsed: res.data.els_utilised || 0,
        elBalance: res.data.els_balance || 0,
      }));
    } catch (error) {
      showToast("Failed to fetch leave balance", "error");
    }

    setTimeout(() => {
      if (purposeRef.current) purposeRef.current.focus();
    }, 100);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const resetForm = async () => {
    try {
      const res = await axios.get(`/api/leave/next-lno`);
      setFormData((prev) => ({
        ...prev,
        lappNo: res.data.nextLno,
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
      }));
      setLeaveDetails([{ dayType: "FULL DAY", fromDate: "", toDate: "", noOfDays: "", remarks: "" }]);
      setGridKey(Date.now());
    } catch (error) {
      showToast("Failed to fetch next leave number", "error");
    }
  };

  const handleSave = async () => {
    if (!formData.empId) {
      showToast("Employee selection is mandatory", "error");
      return;
    }
    if (!formData.purpose) {
      showToast("Purpose of leave is mandatory", "error");
      return;
    }
    if (!formData.phone) {
      showToast("Phone number is mandatory", "error");
      return;
    }
    if (!formData.address) {
      showToast("Address/Reason is mandatory", "error");
      return;
    }

    // Validate that all rows have dates
    const incompleteRow = leaveDetails.find(item => !item.fromDate || !item.toDate);
    if (incompleteRow) {
      showToast("Please fill all From and To dates in the leave grid.", "error");
      return;
    }

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
      c_gempid: "admin",
    };

    const details = leaveDetails.map((item) => ({
      daydt: item.dayType,
      frmdt: item.fromDate,
      todate: item.toDate,
      nod: parseFloat(item.noOfDays) || 0,
      remarks: item.remarks,
      empno: parseInt(formData.empId),
      c_unit: "UNIT1",
      c_gempid: "admin",
    }));

    try {
      const res = await axios.post(`/api/leave/apply`, { application, leaveDetails: details });
      if (res.status === 200 || res.status === 201) {
        showToast(res.data.message || `Leave Application Saved. No: ${res.data.lno}`, "success");
        resetForm();
      }
    } catch (error) {
      const errMsg = error.response?.data?.message || error.message || "Error saving leave!";
      showToast(errMsg, "error");
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
    <Box>
      <div className="p-6 max-w-4xl mx-auto bg-white border rounded-lg shadow">
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h6" fontWeight={700}>Leave Application</Typography>
          <IconButton onClick={onClose}><CloseIcon /></IconButton>
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
                onClick={loadEmpList}
                size="small"
                placeholder="Select"
                sx={{ width: '140px', minWidth: '140px', bgcolor: '#fffde7' }}
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
              inputProps={{ maxLength: 200 }}
              inputRef={addressRef}
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

export default TestApplication;
