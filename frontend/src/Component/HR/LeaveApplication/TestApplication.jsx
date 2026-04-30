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
        clUsed: res.data.clUsed,
        clBalance: res.data.clBalance,
        elUsed: res.data.elUsed,
        elBalance: res.data.elBalance,
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

        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm="auto">
            <TextField
              label={<RequiredLabel label="Emp Id" />}
              name="empId"
              value={formData.empId}
              onClick={loadEmpList}
              size="small"
              placeholder="Select Employee"
              fullWidth
              sx={{ width: { sm: '180px' }, bgcolor: '#fffde7' }}
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
          </Grid>
          <Grid item xs={12} sm sx={{ flexGrow: 1 }}>
            <Box sx={{ p: 1, bgcolor: '#f8f9fa', borderRadius: 1, border: '1px solid #e0e0e0', width: '100%' }}>
              <Typography fontWeight={600} variant="subtitle2">
                Name: {formData.ename || "--"} • Dept: {formData.department || "--"} • Desig: {formData.designation || "--"}
              </Typography>
            </Box>
          </Grid>
        </Grid>

        <Grid container spacing={1} alignItems="flex-start" wrap="nowrap" sx={{ mt: 1 }}>
          <Grid item sx={{ width: '180px', minWidth: '180px' }}>
            <FormControl fullWidth size="small" sx={{ bgcolor: '#fffde7' }}>
              <InputLabel><RequiredLabel label="Purpose" /></InputLabel>
              <Select
                name="purpose"
                value={formData.purpose}
                onChange={handleChange}
                label={<RequiredLabel label="Purpose" />}
                inputRef={purposeRef}
              >
                <MenuItem value="PERSONAL">PERSONAL</MenuItem>
                <MenuItem value="SICK">SICK</MenuItem>
                <MenuItem value="EMERGENCY">EMERGENCY</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item sx={{ ml: 1, width: '160px', minWidth: '160px' }}>
            <TextField
              label={<RequiredLabel label="Phone" />}
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              size="small"
              fullWidth
            />
          </Grid>
          <Grid item sx={{ flexGrow: 1 }}>
            <TextField
              label={<RequiredLabel label="Address / Reason" />}
              name="address"
              value={formData.address}
              onChange={handleChange}
              size="small"
              fullWidth
              placeholder="Address or reason..."
              inputProps={{ maxLength: 200 }}
              helperText={`${formData.address?.length || 0}/200 characters`}
              FormHelperTextProps={{
                sx: {
                  bgcolor: '#fffde7',
                  padding: '2px 8px',
                  borderRadius: 1,
                  fontSize: '0.65rem',
                  display: 'flex',
                  justifyContent: 'flex-end',
                  mx: 0,
                  width: '100%'
                }
              }}
            />
          </Grid>
        </Grid>

        {/* Leave Summary Section Reverted to Old Layout */}
        <Box component="fieldset" sx={{ border: '1px solid #e0e0e0', borderRadius: 1, p: 1, mb: 0, bgcolor: '#fafafa' }}>
          <Typography component="legend" variant="subtitle2" fontWeight={700} color="primary.main" sx={{ px: 1 }}>
            Leave Summary
          </Typography>
          <Stack direction="row" spacing={1.5} flexWrap="nowrap" justifyContent="space-between" sx={{ py: 0.5 }}>
            {/* Utilised Group */}
            <Paper elevation={3} sx={{ p: 1.5, textAlign: "center", bgcolor: "#e3f2fd", flex: 1, minWidth: 0, borderTop: '4px solid #2196f3' }}>
              <Typography variant="caption" sx={{ display: 'block', color: 'primary.main', fontWeight: 700, whiteSpace: 'nowrap' }}>CL Util</Typography>
              <Typography variant="h6" fontWeight="bold">{parseFloat(formData.clUsed) || 0}</Typography>
            </Paper>

            <Paper elevation={3} sx={{ p: 1.5, textAlign: "center", bgcolor: "#f1f8e9", flex: 1, minWidth: 0, borderTop: '4px solid #4caf50' }}>
              <Typography variant="caption" sx={{ display: 'block', color: 'success.main', fontWeight: 700, whiteSpace: 'nowrap' }}>EL Util</Typography>
              <Typography variant="h6" fontWeight="bold">{parseFloat(formData.elUsed) || 0}</Typography>
            </Paper>

            <Paper elevation={3} sx={{ p: 1.5, textAlign: "center", bgcolor: "#e0f2f1", flex: 1, minWidth: 0, borderTop: '4px solid #009688' }}>
              <Typography variant="caption" sx={{ display: 'block', color: 'teal', fontWeight: 700, whiteSpace: 'nowrap' }}>Tot Util</Typography>
              <Typography variant="h6" fontWeight="bold">{parseFloat(Number(formData.clUsed) + Number(formData.elUsed)) || 0}</Typography>
            </Paper>

            {/* Balance Group */}
            <Paper elevation={3} sx={{ p: 1.5, textAlign: "center", bgcolor: "#f3e5f5", flex: 1, minWidth: 0, borderTop: '4px solid #9c27b0' }}>
              <Typography variant="caption" sx={{ display: 'block', color: 'secondary.main', fontWeight: 700, whiteSpace: 'nowrap' }}>CL Bal</Typography>
              <Typography variant="h6" fontWeight="bold">{parseFloat(formData.clBalance) || 0}</Typography>
            </Paper>

            <Paper elevation={3} sx={{ p: 1.5, textAlign: "center", bgcolor: "#e8eaf6", flex: 1, minWidth: 0, borderTop: '4px solid #3f51b5' }}>
              <Typography variant="caption" sx={{ display: 'block', color: 'indigo', fontWeight: 700, whiteSpace: 'nowrap' }}>EL Bal</Typography>
              <Typography variant="h6" fontWeight="bold">{parseFloat(formData.elBalance) || 0}</Typography>
            </Paper>

            <Paper elevation={3} sx={{ p: 1.5, textAlign: "center", bgcolor: "#fff3e0", flex: 1, minWidth: 0, borderTop: '4px solid #ff9800' }}>
              <Typography variant="caption" sx={{ display: 'block', color: '#e65100', fontWeight: 700, whiteSpace: 'nowrap' }}>Tot Bal</Typography>
              <Typography variant="h6" fontWeight="bold" color="#e65100">{parseFloat(Number(formData.clBalance) + Number(formData.elBalance)) || 0}</Typography>
            </Paper>
          </Stack>
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
