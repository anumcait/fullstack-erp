import React, { useState, useEffect } from "react";
import {
  InputAdornment, TextField, Typography, Button, FormControl, Select, MenuItem, Divider,
  Grid, Box, Stack, IconButton, InputLabel
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import EmployeeSelectDialog from "../Employee/EmployeeSelectDialog";
import { useToast } from "../../../context/ToastContext";
import axios from "axios";
import WoffChangePreview from "./WoffChangePreview";
import { formatDate, formatDateOnly } from "../../../utils/dateUtils";

const RequiredLabel = ({ children }) => (
  <span>
    {children}
    <span style={{ color: 'red', marginLeft: 2 }}>*</span>
  </span>
);

const requiredStyle = {
  backgroundColor: '#fffde7'
};

const WoffChangeForm = ({ onClose }) => {
  const { showToast } = useToast();
  const [shifts, setShifts] = useState([]);

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

  useEffect(() => { fetchNextWoffId(); fetchShifts(); }, []);

  const fetchShifts = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/shift/master/all`);
      setShifts(res.data);
    } catch (err) {
      console.error("Error fetching shifts:", err);
    }
  };

  const fetchNextWoffId = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/woff/next-id`);
      setFormData(prev => ({ ...prev, woff_id: response.data.nextWoffId }));
    } catch (error) {
      console.error("Failed to fetch next woff ID:", error);
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
      department: emp.deptname || emp.department || "",
      section: emp.secname || emp.section || "",
    });
    setShowEmpPopup(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
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
    if (!formData.empid || !formData.woff_from_date || !formData.woff_to_date || !formData.shift_cd || !formData.reason) {
      showToast("❌ Please fill all required fields.", "error");
      return;
    }

    if (formData.woff_from_date === formData.woff_to_date) {
      showToast("❌ Existing date and Changed date cannot be the same.", "error");
      return;
    }

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/woff/apply`, formData);
      showToast(`✅ Woff Change Saved. ID: ${response.data.data.woff_id}`, "success");
      setFormData({
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
      fetchNextWoffId();
    } catch (err) {
      console.error("Save error:", err);
      const errorMsg = err.response?.data?.message || "Error saving woff application";
      showToast(`❌ ${errorMsg}`, "error");
    }
  };

  return (
    <Box>
      <div className="p-6 max-w-4xl mx-auto bg-white border rounded-lg shadow">
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h6" fontWeight={700}>Woff Change Request</Typography>
          <IconButton onClick={onClose}><CloseIcon /></IconButton>
        </Stack>

        <Box sx={{ mb: 2, display: 'flex', gap: 4, justifyContent: 'flex-start', alignItems: 'center' }}>
          <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="body2" color="text.secondary">Woff ID:</Typography>
            <Typography fontWeight={600}>{formData.woff_id}</Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="body2" color="text.secondary">Date:</Typography>
            <Typography fontWeight={600}>{formatDate(formData.woff_date)}</Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm="auto">
            <TextField
              label={<RequiredLabel>Emp Id</RequiredLabel>}
              name="empid"
              value={formData.empid}
              onClick={openEmpPopup}
              size="small"
              placeholder="Select Employee"
              fullWidth
              sx={{ ...requiredStyle, width: { sm: '180px' } }}
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
            />
          </Grid>
          <Grid item xs={12} sm sx={{ flexGrow: 1 }}>
            <Box sx={{ p: 1, bgcolor: '#f8f9fa', borderRadius: 1, border: '1px solid #e0e0e0', width: '100%' }}>
              <Typography fontWeight={600} variant="subtitle2">
                Name: {formData.ename || "--"} • Unit: {formData.unit || "--"} • Div: {formData.division || "--"}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Dept: {formData.department || "--"} • Sec: {formData.section || "--"} • Desig: {formData.designation || "--"}
              </Typography>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        <Grid container spacing={1} alignItems="flex-start" sx={{ mb: 2 }}>
          <Grid item xs={12} sm="auto" sx={{ width: { sm: '180px' } }}>
            <TextField
              label={<RequiredLabel>Existing Date</RequiredLabel>}
              name="woff_from_date"
              type="date"
              value={formData.woff_from_date}
              onChange={handleChange}
              size="small"
              fullWidth
              sx={requiredStyle}
              InputLabelProps={{ shrink: true }}
              helperText={formData.current_woff_day || " "}
              FormHelperTextProps={{ sx: { fontWeight: 'bold', color: 'primary.main', m: 0, mt: 0.5 } }}
            />
          </Grid>

          <Grid item xs={12} sm="auto" sx={{ width: { sm: '180px' } }}>
            <TextField
              label={<RequiredLabel>Changed Date</RequiredLabel>}
              name="woff_to_date"
              type="date"
              value={formData.woff_to_date}
              onChange={handleChange}
              size="small"
              fullWidth
              sx={requiredStyle}
              InputLabelProps={{ shrink: true }}
              helperText={formData.requested_woff_day || " "}
              FormHelperTextProps={{ sx: { fontWeight: 'bold', color: 'primary.main', m: 0, mt: 0.5 } }}
            />
          </Grid>

          <Grid item xs={12} sm="auto" sx={{ width: { sm: '180px' } }}>
            <FormControl size="small" fullWidth sx={requiredStyle}>
              <InputLabel><RequiredLabel>Select Shift</RequiredLabel></InputLabel>
              <Select
                name="shift_cd"
                value={formData.shift_cd}
                onChange={handleChange}
                label={<RequiredLabel>Select Shift</RequiredLabel>}
              >
                {shifts.map(s => (
                  <MenuItem key={s.shift_id} value={s.shift_cd}>{s.shift_cd} ({s.start_time?.slice(0, 5)}-{s.end_time?.slice(0, 5)})</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm sx={{ flexGrow: 1 }}>
             <TextField
              label="Remarks"
              name="remarks"
              value={formData.remarks}
              onChange={handleChange}
              fullWidth
              size="small"
              placeholder="Additional remarks..."
            />
          </Grid>
        </Grid>

        <Grid container spacing={2} mt={2}>
          <Grid item xs={12} style={{ width: '100%' }}>
            <TextField
              label={<RequiredLabel>Reason</RequiredLabel>}
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              fullWidth
              size="small"
              multiline
              rows={2}
              inputProps={{ maxLength: 200 }}
              sx={requiredStyle}
              style={{ width: '100%' }}
              helperText={`${formData.reason?.length || 0}/200 characters`}
              FormHelperTextProps={{ sx: { bgcolor: '#fffde7', padding: '2px 8px', borderRadius: 1 } }}
            />
          </Grid>
        </Grid>

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
