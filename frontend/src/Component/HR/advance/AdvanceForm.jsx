import React, { useState, useEffect } from "react";
import {
  TextField, Typography, Button, Box,
  Stack, IconButton, Divider, InputAdornment, FormControl, InputLabel, Select, MenuItem
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import axios from "axios";
import { useToast } from "../../../context/ToastContext";
import { useNavigationGuard } from "../../../context/NavigationGuardContext";
import EmployeeSelectDialog from "../Employee/EmployeeSelectDialog";
import AdvancePreview from "./AdvancePreview";
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
const isAdminUser = () => {
  const r = getUserRole().toLowerCase();
  return r === 'admin' || r === 'hr';
};

const AdvanceForm = ({ onClose }) => {
  const advanceTypeRef = React.useRef(null);
  const amountRef = React.useRef(null);
  const installmentsRef = React.useRef(null);
  const reasonRef = React.useRef(null);

  const fieldRefs = {
    advance_type: advanceTypeRef,
    advance_amount: amountRef,
    no_of_installments: installmentsRef,
    reason: reasonRef,
  };

  const { showToast } = useToast();
  const { setIsDirty } = useNavigationGuard();
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
    advance_id: "",
    advance_date: getCurrentISTDateTime(),
    empid: "",
    ename: "",
    unit: "",
    division: "",
    designation: "",
    advance_type: "",
    advance_amount: "",
    gross_salary: "",
    reason: "",
    no_of_installments: "",
    monthly_installment: "",
    doj: ""
  });

  const [showEmpPopup, setShowEmpPopup] = useState(false);
  const [employeeList, setEmployeeList] = useState([]);
  const [showPreview, setShowPreview] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setIsDirty(true);
    setFieldErrors(prev => ({ ...prev, [name]: null }));
    let updatedData = { ...formData, [name]: value };

    if (name === "advance_amount" || name === "no_of_installments") {
      const amount = Number(updatedData.advance_amount);
      const installments = Number(updatedData.no_of_installments);
      if (amount > 0 && installments > 0) {
        updatedData.monthly_installment = (amount / installments).toFixed(2);
      } else {
        updatedData.monthly_installment = "";
      }
    }

    setFormData(updatedData);
  };

  const resetForm = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/advance/next-id`);
      
      const loggedInEmpId = localStorage.getItem('empId') || "";
      const loggedInEmpName = localStorage.getItem('empName') || "";
      const loggedInDept = localStorage.getItem('deptname') || "";
      const loggedInDesig = localStorage.getItem('designation') || "";

      setFormData({
        advance_id: response.data.nextAdvanceId,
        advance_date: getCurrentISTDateTime(),
        empid: loggedInEmpId,
        ename: loggedInEmpName,
        unit: "",
        division: "",
        designation: loggedInDesig,
        advance_type: "",
        advance_amount: "",
        gross_salary: "",
        reason: "",
        no_of_installments: "",
        monthly_installment: "",
        doj: ""
      });
      setFieldErrors({});

      if (loggedInEmpId) {
        axios.get(`${import.meta.env.VITE_API_URL}/api/employees/${loggedInEmpId}`)
          .then((empRes) => {
            const emp = empRes.data;
            let gross = 0;
            if (emp.salary) {
              const s = emp.salary;
              gross = (Number(s.basic) || 0) + 
                      (Number(s.hra) || 0) + 
                      (Number(s.conveyance) || 0) + 
                      (Number(s.washing_allowance) || 0) +
                      (Number(s.others1) || 0) + (Number(s.others2) || 0) + (Number(s.others3) || 0) +
                      (Number(s.others4) || 0) + (Number(s.others5) || 0) + (Number(s.others6) || 0) +
                      (Number(s.others7) || 0) + (Number(s.others8) || 0) + (Number(s.others9) || 0);
            }
            setFormData(prev => ({
              ...prev,
              ename: emp.ename,
              unit: emp.uname || prev.unit,
              division: emp.divname || prev.division,
              designation: emp.designation || prev.designation,
              gross_salary: gross,
              doj: emp.doj || ""
            }));
          })
          .catch((error) => {
            console.error("Failed to fetch employee details", error);
          });
      }
    } catch (error) {
      console.error("Failed to fetch next advance ID:", error);
    }
  };

  useEffect(() => { 
    resetForm();
    if (isAdmin) {
      fetchAllEmployees();
    }
  }, []);

  const fetchAllEmployees = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/employees`);
      setEmployeeList(response.data);
    } catch (error) {
      console.error("Failed to fetch employees:", error);
    }
  };

  const openEmpPopup = () => {
    if (isAdmin) {
      setShowEmpPopup(true);
    }
  };

  const selectEmployee = (emp) => {
    let gross = 0;
    if (emp.salary) {
      const s = emp.salary;
      gross = (Number(s.basic) || 0) + 
              (Number(s.hra) || 0) + 
              (Number(s.conveyance) || 0) + 
              (Number(s.washing_allowance) || 0) +
              (Number(s.others1) || 0) + (Number(s.others2) || 0) + (Number(s.others3) || 0) +
              (Number(s.others4) || 0) + (Number(s.others5) || 0) + (Number(s.others6) || 0) +
              (Number(s.others7) || 0) + (Number(s.others8) || 0) + (Number(s.others9) || 0);
    }

    setFormData(prev => ({
      ...prev,
      empid: emp.empid,
      ename: emp.ename,
      unit: emp.uname,
      division: emp.divname,
      designation: emp.designation,
      gross_salary: gross,
      doj: emp.doj || ""
    }));
    setShowEmpPopup(false);
  };

  const saveAdvance = async () => {
    let hasError = false;
    const newErrors = {};
    let firstRef = null;

    if (!formData.empid) { newErrors.empid = "Employee is required"; hasError = true; }
    if (!formData.advance_type) { newErrors.advance_type = "Required"; hasError = true; if (!firstRef) firstRef = advanceTypeRef; }
    if (!formData.advance_amount) { newErrors.advance_amount = "Required"; hasError = true; if (!firstRef) firstRef = amountRef; }
    if (!formData.no_of_installments) { newErrors.no_of_installments = "Required"; hasError = true; if (!firstRef) firstRef = installmentsRef; }
    if (!formData.reason) { newErrors.reason = "Required"; hasError = true; if (!firstRef) firstRef = reasonRef; }

    if (hasError) {
      setFieldErrors(newErrors);
      showToast("Please fill all required fields.", "error");
      if (firstRef && firstRef.current) firstRef.current.focus();
      return;
    }

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/advance/save`, formData);
      showToast(`✅ Advance Saved. ID: ${response.data.advance_id}`, "success");
      setIsDirty(false);
      resetForm();
    } catch (err) {
      console.error("Save error:", err);
      showToast(getErrorMessage(err, "Error saving Advance application"), "error");
    }
  };

  const canSelectEmployee = isAdmin;

  return (
    <Box>
      <div className="p-6 max-w-4xl mx-auto bg-white border rounded-lg shadow">
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h6" fontWeight={700}>Advance Request</Typography>
          <IconButton onClick={() => { setIsDirty(false); onClose(); }}><CloseIcon /></IconButton>
        </Stack>

        <Box sx={{ display: 'flex', gap: 4, mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" color="text.secondary">Advance No:</Typography>
            <Typography fontWeight={600}>{formData.advance_id}</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" color="text.secondary">Entry Date:</Typography>
            <Typography fontWeight={600}>{formatDateTimeAMPM(formData.advance_date)}</Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
          <TextField
            label="Emp Id"
            name="empid"
            value={formData.empid}
            onClick={isAdmin ? openEmpPopup : undefined}
            size="small"
            placeholder={isAdmin ? "Select Employee" : ""}
            sx={{ 
              width: '150px',
              bgcolor: isAdmin ? 'white' : '#f5f5f5',
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
              Name: {formData.ename || "--"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Unit: {formData.unit || "--"} • Div: {formData.division || "--"} • Desig: {formData.designation || "--"}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
          <FormControl size="small" sx={{ flex: '1 1 200px', ...requiredStyle }}>
            <InputLabel><RequiredLabel>Advance Type</RequiredLabel></InputLabel>
            <Select
              name="advance_type"
              inputRef={advanceTypeRef}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  if (amountRef.current) amountRef.current.focus();
                }
              }}
              value={formData.advance_type}
              onChange={handleChange}
              label={<RequiredLabel>Advance Type</RequiredLabel>}
              error={!!fieldErrors.advance_type}
            >
              <MenuItem value="Salary Advance">Salary Advance</MenuItem>
              <MenuItem value="Festival Advance">Festival Advance</MenuItem>
              <MenuItem value="Medical Advance">Medical Advance</MenuItem>
              <MenuItem value="Personal Advance">Personal Advance</MenuItem>
            </Select>
          </FormControl>

          <TextField
            label="Gross Salary"
            name="gross_salary"
            type="number"
            size="small"
            sx={{ flex: '1 1 150px', bgcolor: '#f5f5f5' }}
            value={formData.gross_salary}
            InputProps={{ readOnly: true }}
          />

          <TextField
            label={<RequiredLabel>Advance Amount</RequiredLabel>}
            name="advance_amount"
            inputRef={amountRef}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                if (installmentsRef.current) installmentsRef.current.focus();
              }
            }}
            type="number"
            size="small"
            sx={{ flex: '1 1 150px', ...requiredStyle }}
            value={formData.advance_amount}
            onChange={handleChange}
            error={!!fieldErrors.advance_amount}
          />
        </Box>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
          <FormControl size="small" sx={{ flex: '1 1 150px', ...requiredStyle }}>
            <InputLabel><RequiredLabel>Installments</RequiredLabel></InputLabel>
            <Select
              name="no_of_installments"
              inputRef={installmentsRef}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  if (reasonRef.current) reasonRef.current.focus();
                }
              }}
              value={formData.no_of_installments}
              onChange={handleChange}
              label={<RequiredLabel>Installments</RequiredLabel>}
              error={!!fieldErrors.no_of_installments}
            >
              <MenuItem value={1}>1 Installment</MenuItem>
              <MenuItem value={2}>2 Installments</MenuItem>
              <MenuItem value={3}>3 Installments</MenuItem>
              <MenuItem value={4}>4 Installments</MenuItem>
            </Select>
          </FormControl>

          <TextField
            label="Monthly Repayment"
            name="monthly_installment"
            type="number"
            size="small"
            sx={{ flex: '1 1 150px', bgcolor: '#f5f5f5' }}
            value={formData.monthly_installment}
            InputProps={{ readOnly: true }}
            helperText="Auto-calculated"
          />

          <TextField
            label={<RequiredLabel>Purpose of Advance</RequiredLabel>}
            name="reason"
            inputRef={reasonRef}
            size="small"
            sx={{ flex: '1 1 300px', ...requiredStyle }}
            multiline
            rows={1}
            value={formData.reason}
            onChange={handleChange}
            inputProps={{ maxLength: 200 }}
            error={!!fieldErrors.reason}
            helperText={fieldErrors.reason || `${formData.reason?.length || 0}/200 characters`}
          />
        </Box>

        <div className="save-btn-row" style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px', gap: '8px' }}>
          <Button variant="outlined" onClick={() => setShowPreview(true)}>Preview</Button>
          <button className="save-btn" onClick={saveAdvance} style={{ padding: '8px 16px', background: '#1976d2', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
            Save Application
          </button>
        </div>
      </div>

      {canSelectEmployee && (
        <EmployeeSelectDialog open={showEmpPopup} onClose={() => setShowEmpPopup(false)} onSelect={selectEmployee} data={employeeList} />
      )}
      {showPreview && <AdvancePreview data={formData} onClose={() => setShowPreview(false)} />}
    </Box>
  );
};

export default AdvanceForm;
