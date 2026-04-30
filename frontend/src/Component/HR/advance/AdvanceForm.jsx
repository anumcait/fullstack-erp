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

const AdvanceForm = () => {
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
    advance_id: "",
    advance_date: getCurrentISTDateTime(),
    empid: "",
    ename: "",
    unit: "",
    division: "",
    designation: "",
    advance_type: "",
    advance_amount: "",
    reason: "",
    advance_from_date: "",
    advance_to_date: "",
    no_of_installments: "",
    monthly_installment: ""
  });

  const [showEmpPopup, setShowEmpPopup] = useState(false);
  const [employeeList, setEmployeeList] = useState([]);
  const [showPreview, setShowPreview] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  useEffect(() => { fetchNextAdvanceId(); }, []);

  const fetchNextAdvanceId = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/advance/next-id`);
      setFormData(prev => ({ ...prev, advance_id: response.data.nextAdvanceId }));
    } catch (error) {
      console.error("Failed to fetch next advance ID:", error);
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
    });
    setShowEmpPopup(false);
  };

  const saveAdvance = async () => {
    if (!formData.empid || !formData.advance_type || !formData.advance_amount) {
      showToast("❌ Please fill all required fields.", "error");
      return;
    }
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/advance/save`, formData);
      showToast(`✅ Advance Saved. ID: ${response.data.advance_id}`, "success");
      setFormData({
        advance_id: "",
        advance_date: getCurrentISTDateTime(),
        empid: "",
        ename: "",
        unit: "",
        division: "",
        designation: "",
        advance_type: "",
        advance_amount: "",
        reason: "",
        advance_from_date: "",
        advance_to_date: "",
        no_of_installments: "",
        monthly_installment: ""
      });
      fetchNextAdvanceId();
    } catch (err) {
      console.error("Save error:", err);
      showToast("❌ Error saving Advance application", "error");
    }
  };

  return (
    <Box>
      <div className="p-6 max-w-4xl mx-auto bg-white border rounded-lg shadow">
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h6" fontWeight={700}>Advance Request</Typography>
          <IconButton onClick={() => setShowPreview(true)}><CloseIcon /></IconButton>
        </Stack>

        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Box display="flex" alignItems="center">
              <Typography variant="body2" color="text.secondary" sx={{ minWidth: 100 }}>
                Advance No:
              </Typography>
              <Typography fontWeight={600}>{formData.advance_id}</Typography>
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box display="flex" alignItems="center">
              <Typography variant="body2" color="text.secondary" sx={{ minWidth: 100 }}>
                Entry Date:
              </Typography>
              <Typography fontWeight={600}>
                {formData.advance_date.replace("T", " ")}
              </Typography>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={3}>
            <TextField
              label="Emp Id"
              name="empid"
              value={formData.empid}
              onClick={openEmpPopup}
              size="small"
              placeholder="Select Employee"
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
              sx={{ bgcolor: 'white', '& .MuiOutlinedInput-root': { paddingRight: 1 } }}
            />
          </Grid>
          <Grid item xs={12} sm={9}>
            <Typography fontWeight={600}>
              Name: {formData.ename || "--"} • Unit: {formData.unit || "--"} • Division: {formData.division || "--"} • Designation: {formData.designation || "--"}
            </Typography>
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <Grid item xs={12} sm={3}>
            <FormControl size="small" fullWidth>
              <InputLabel>Advance Type</InputLabel>
              <Select
                name="advance_type"
                value={formData.advance_type}
                onChange={handleChange}
                label="Advance Type"
              >
                <MenuItem value="Salary Advance">Salary Advance</MenuItem>
                <MenuItem value="Festival Advance">Festival Advance</MenuItem>
                <MenuItem value="Emergency Advance">Emergency Advance</MenuItem>
                <MenuItem value="Travel Advance">Travel Advance</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              label="Advance Amount"
              name="advance_amount"
              type="number"
              size="small"
              fullWidth
              value={formData.advance_amount}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              label="From Date"
              name="advance_from_date"
              type="date"
              size="small"
              fullWidth
              value={formData.advance_from_date}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              label="To Date"
              name="advance_to_date"
              type="date"
              size="small"
              fullWidth
              value={formData.advance_to_date}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
        </Grid>

        <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <Grid item xs={12} sm={3}>
            <TextField
              label="No of Installments"
              name="no_of_installments"
              type="number"
              size="small"
              fullWidth
              value={formData.no_of_installments}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              label="Monthly Installment"
              name="monthly_installment"
              type="number"
              size="small"
              fullWidth
              value={formData.monthly_installment}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
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
          <button className="save-btn" onClick={saveAdvance} style={{ padding: '8px 16px', background: '#1976d2', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
            💾 <u>S</u>ave
          </button>
        </div>
      </div>

      <EmployeeSelectDialog open={showEmpPopup} onClose={() => setShowEmpPopup(false)} onSelect={selectEmployee} data={employeeList} />
      {showPreview && <AdvancePreview formData={formData} onClose={() => setShowPreview(false)} />}
    </Box>
  );
};

export default AdvanceForm;
