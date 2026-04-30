import React, { useState, useEffect } from "react";
import {
  TextField, Typography, Button, Grid, Box, Card, CardContent,
  Stack, IconButton, Divider, InputAdornment, FormControl, InputLabel, Select, MenuItem
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import axios from "axios";
import { useToast } from "../../../context/ToastContext";
import EmployeeSelectDialog from "../Employee/EmployeeSelectDialog";

const RequiredLabel = ({ children }) => (
  <span>
    {children}
    <span style={{ color: 'red', marginLeft: 2 }}>*</span>
  </span>
);

const requiredStyle = {
  backgroundColor: '#fffde7'
};

const ESILeaveForm = () => {
  const { showToast } = useToast();

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

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  useEffect(() => { fetchNextESILeaveId(); }, []);

  const fetchNextESILeaveId = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/esileave/next-id`);
      setFormData(prev => ({ ...prev, esi_leave_id: response.data.nextESILeaveId }));
    } catch (error) {
      console.error("Failed to fetch next ESI Leave ID:", error);
    }
  };

  const openEmpPopup = async () => {
    const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/employees`);
    setEmployeeList(response.data);
    setShowEmpPopup(true);
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

  const saveESILeave = async () => {
    if (!formData.empid || !formData.leave_from_date || !formData.leave_to_date) {
      showToast("❌ Please fill all required fields.", "error");
      return;
    }
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/esileave/save`, formData);
      showToast(`✅ ESI Leave Saved. ID: ${response.data.esi_leave_id}`, "success");
      setFormData({
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
      fetchNextESILeaveId();
    } catch (err) {
      console.error("Save error:", err);
      showToast("❌ Error saving ESI Leave application", "error");
    }
  };

  return (
    <Box>
      <div className="p-6 max-w-4xl mx-auto bg-white border rounded-lg shadow">
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h6" fontWeight={700}>ESI Leave Request</Typography>
          <IconButton onClick={() => setShowPreview(true)}><CloseIcon /></IconButton>
        </Stack>

        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Box display="flex" alignItems="center">
              <Typography variant="body2" color="text.secondary" sx={{ minWidth: 100 }}>
                ESI Leave No:
              </Typography>
              <Typography fontWeight={600}>{formData.esi_leave_id}</Typography>
            </Box>
          </Grid>

          <Grid item xs={6}>
            <Box display="flex" alignItems="center">
              <Typography variant="body2" color="text.secondary" sx={{ minWidth: 100 }}>
                Entry Date:
              </Typography>
              <Typography fontWeight={600}>
                {formData.esi_leave_date.replace("T", " ")}
              </Typography>
            </Box>
          </Grid>
        </Grid>
        <Divider sx={{ my: 2 }} />

        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={3}>
            <TextField
              label="Emp ID *"
              size="small"
              value={formData.empid || ""}
              fullWidth
              InputProps={{
                readOnly: true,
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={openEmpPopup}>
                      <SearchIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              onClick={openEmpPopup}
              sx={{ bgcolor: 'white', '& .MuiOutlinedInput-root': { paddingRight: 1 } }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography fontWeight={600}>
              Name: {formData.ename || ""} • Unit: {formData.unit || "--"} • Division: {formData.division || "--"} • Designation: {formData.designation || "--"}
            </Typography>
          </Grid>

          <Grid item xs={12} sm={3}>
            <TextField
              label="ESI No"
              name="esi_no"
              size="small"
              fullWidth
              value={formData.esi_no}
              onChange={handleChange}
            />
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <Grid item xs={12} sm={3}>
            <TextField
              label="ESI Dispencery"
              name="esi_dispencery"
              size="small"
              fullWidth
              value={formData.esi_dispencery}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={12} sm={3}>
            <TextField
              label="Hospital Name"
              name="hospital_name"
              size="small"
              fullWidth
              value={formData.hospital_name}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={12} sm={3}>
            <TextField
              label="From Date"
              name="leave_from_date"
              type="date"
              size="small"
              fullWidth
              value={formData.leave_from_date}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={12} sm={3}>
            <TextField
              label="To Date"
              name="leave_to_date"
              type="date"
              size="small"
              fullWidth
              value={formData.leave_to_date}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
        </Grid>

        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={3}>
            <TextField
              label="No of Days"
              name="no_of_days"
              type="number"
              size="small"
              fullWidth
              value={formData.no_of_days}
              disabled
            />
          </Grid>

          <Grid item xs={12} sm={9}>
            <TextField
              label="Reason"
              name="reason"
              size="small"
              fullWidth
              multiline
              rows={2}
              value={formData.reason}
              onChange={handleChange}
              inputProps={{ maxLength: 200 }}
              sx={requiredStyle}
              helperText={`${formData.reason?.length || 0}/200 characters`}
            />
          </Grid>
        </Grid>

        <div className="save-btn-row" style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px', gap: '8px' }}>
          <Button variant="outlined" onClick={() => setShowPreview(true)}>Close</Button>
          <button className="save-btn" onClick={saveESILeave} style={{ padding: '8px 16px', background: '#1976d2', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
            💾 <u>S</u>ave
          </button>
        </div>
      </div>

      <EmployeeSelectDialog open={showEmpPopup} onClose={() => setShowEmpPopup(false)} onSelect={selectEmployee} data={employeeList} />
      {showPreview && <ESILeavePreview formData={formData} onClose={() => setShowPreview(false)} />}
    </Box>
  );
};

export default ESILeaveForm;
