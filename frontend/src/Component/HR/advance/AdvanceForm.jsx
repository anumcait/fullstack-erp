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

const RequiredLabel = ({ children }) => (
  <span>
    {children}
    <span style={{ color: 'red', marginLeft: 2 }}>*</span>
  </span>
);

const requiredStyle = {
  backgroundColor: '#fffde7'
};

const AdvanceForm = ({ onClose }) => {
  const { showToast } = useToast();
  const { setIsDirty } = useNavigationGuard();
  const userRole = localStorage.getItem('userRole');
  const loggedInEmpId = localStorage.getItem('empId');

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
    monthly_installment: ""
  });

  const [showEmpPopup, setShowEmpPopup] = useState(false);
  const [employeeList, setEmployeeList] = useState([]);
  const [showPreview, setShowPreview] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setIsDirty(true);
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

  useEffect(() => { 
    fetchNextAdvanceId();
    fetchAllEmployees();
  }, []);

  const fetchNextAdvanceId = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/advance/next-id`);
      setFormData(prev => ({ ...prev, advance_id: response.data.nextAdvanceId }));
    } catch (error) {
      console.error("Failed to fetch next advance ID:", error);
    }
  };

  const fetchAllEmployees = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/employees`);
      setEmployeeList(response.data);
      
      // If regular user, pre-fill their own data
      if (userRole !== 'Admin' && userRole !== 'HR' && loggedInEmpId) {
        const currentUser = response.data.find(emp => String(emp.empid) === String(loggedInEmpId));
        if (currentUser) {
          selectEmployee(currentUser);
        }
      }
    } catch (error) {
      console.error("Failed to fetch employees:", error);
    }
  };

  const openEmpPopup = () => {
    if (userRole === 'Admin' || userRole === 'HR') {
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
      gross_salary: gross
    }));
    setShowEmpPopup(false);
  };

  const saveAdvance = async () => {
    if (!formData.empid || !formData.advance_type || !formData.advance_amount || !formData.no_of_installments || !formData.reason) {
      showToast("❌ Please fill all required fields.", "error");
      return;
    }
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/advance/save`, formData);
      showToast(`✅ Advance Saved. ID: ${response.data.advance_id}`, "success");
      setIsDirty(false);
      onClose();
    } catch (err) {
      console.error("Save error:", err);
      showToast("❌ Error saving Advance application", "error");
    }
  };

  const canSelectEmployee = userRole === 'Admin' || userRole === 'HR';

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
            <Typography fontWeight={600}>{formData.advance_date.replace("T", " ")}</Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
          <TextField
            label="Emp Id"
            name="empid"
            value={formData.empid}
            onClick={openEmpPopup}
            size="small"
            placeholder={canSelectEmployee ? "Select Employee" : "Logged in User"}
            sx={{ width: '150px', bgcolor: canSelectEmployee ? 'white' : '#f5f5f5' }}
            InputProps={{
              readOnly: true,
              endAdornment: canSelectEmployee && (
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
              value={formData.advance_type}
              onChange={handleChange}
              label={<RequiredLabel>Advance Type</RequiredLabel>}
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
            type="number"
            size="small"
            sx={{ flex: '1 1 150px', ...requiredStyle }}
            value={formData.advance_amount}
            onChange={handleChange}
          />
        </Box>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
          <FormControl size="small" sx={{ flex: '1 1 150px', ...requiredStyle }}>
            <InputLabel><RequiredLabel>Installments</RequiredLabel></InputLabel>
            <Select
              name="no_of_installments"
              value={formData.no_of_installments}
              onChange={handleChange}
              label={<RequiredLabel>Installments</RequiredLabel>}
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
            size="small"
            sx={{ flex: '1 1 300px', ...requiredStyle }}
            multiline
            rows={1}
            value={formData.reason}
            onChange={handleChange}
            inputProps={{ maxLength: 200 }}
            helperText={`${formData.reason?.length || 0}/200 characters`}
          />
        </Box>

        <div className="save-btn-row" style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px', gap: '8px' }}>
          <Button variant="outlined" onClick={() => setShowPreview(true)}>Preview</Button>
          <button className="save-btn" onClick={saveAdvance} style={{ padding: '8px 16px', background: '#1976d2', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
            💾 Save Application
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
