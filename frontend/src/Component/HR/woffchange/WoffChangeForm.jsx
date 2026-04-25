import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  InputAdornment, TextField, Typography, Button, FormControl, Select, MenuItem, Divider,
  Grid, Box
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import EmployeeSelectDialog from "../Employee/EmployeeSelectDialog";
import { useToast } from "../../../context/ToastContext";
import axios from "axios";
import WoffChangePreview from "./WoffChangePreview";

const WoffChangeForm = () => {
  const { showToast } = useToast();
  const navigate = useNavigate();

  const getCurrentISTDateTime = () => {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const woffDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  const [formData, setFormData] = useState({
    woff_id: "",
    woff_date: getCurrentISTDateTime(),
    empid: "",
    ename: "",
    unit: "",
    division: "",
    designation: "",
    current_woff_day: "",
    requested_woff_day: "",
    woff_from_date: "",
    woff_to_date: "",
    reason: ""
  });

  const [showEmpPopup, setShowEmpPopup] = useState(false);
  const [employeeList, setEmployeeList] = useState([]);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => { fetchNextWoffId(); }, []);

  const fetchNextWoffId = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/woff/next-id`);
      setFormData(prev => ({ ...prev, woff_id: response.data.nextId }));
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
    });
    setShowEmpPopup(false);
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const saveWoffChange = async () => {
    if (!formData.empid || !formData.requested_woff_day || !formData.woff_from_date) {
      showToast("❌ Please fill all required fields.", "error");
      return;
    }
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/woff/apply`, formData);
      showToast(`✅ Woff Change Saved. ID: ${response.data.data.woff_id}`, "success");
      setFormData({
        woff_id: "",
        woff_date: getCurrentISTDateTime(),
        empid: "",
        ename: "",
        unit: "",
        division: "",
        designation: "",
        current_woff_day: "",
        requested_woff_day: "",
        woff_from_date: "",
        woff_to_date: "",
        reason: ""
      });
      fetchNextWoffId();
    } catch (err) {
      console.error("Save error:", err);
      showToast("❌ Error saving woff application", "error");
    }
  };

  return (
    <Box sx={{ p: 2, bgcolor: "#f5f7fa" }}>
      <Box sx={{
        maxWidth: 800, mx: "auto", bgcolor: "#fff",
        borderRadius: 3, boxShadow: 3, mt: 1, px: 4, py: 3
      }}>
        <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
          Woff Change Request
        </Typography>

        <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <Grid item xs={4}>
            <Typography fontWeight={500}>
              Woff ID: <span style={{ fontWeight: 700 }}>{formData.woff_id}</span>
            </Typography>
          </Grid>
          <Grid item xs={8}>
            <Typography fontWeight={500}>
              Date: <span style={{ fontWeight: 700 }}>{formData.woff_date}</span>
            </Typography>
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        <Typography fontWeight={600} variant="body2" sx={{ mb: 1 }}>
          Employee Details
        </Typography>

        <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <Grid item sx={{ width: 140 }}>
            <TextField
              label="Emp ID *"
              name="empid"
              value={formData.empid}
              size="small"
              onClick={openEmpPopup}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <SearchIcon onClick={openEmpPopup} style={{ cursor: 'pointer' }} />
                  </InputAdornment>
                ),
              }}
              required
            />
          </Grid>
          <Grid item xs>
            <TextField
              label="Name"
              name="ename"
              value={formData.ename}
              fullWidth
              size="small"
              disabled
            />
          </Grid>
          <Grid item xs={3}>
            <TextField
              label="Unit"
              name="unit"
              value={formData.unit}
              fullWidth
              size="small"
              disabled
            />
          </Grid>
        </Grid>

        <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <Grid item xs={3}>
            <TextField
              label="Division"
              name="division"
              value={formData.division}
              fullWidth
              size="small"
              disabled
            />
          </Grid>
          <Grid item xs={3}>
            <TextField
              label="Designation"
              name="designation"
              value={formData.designation}
              fullWidth
              size="small"
              disabled
            />
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        <Typography fontWeight={600} variant="body2" sx={{ mb: 1 }}>
          Woff Change Details
        </Typography>

        <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <Grid item xs={3}>
            <FormControl size="small" fullWidth>
              <Select
                name="current_woff_day"
                value={formData.current_woff_day}
                onChange={handleChange}
                displayEmpty
              >
                <MenuItem value="">Current Woff Day</MenuItem>
                {woffDays.map((day) => (
                  <MenuItem key={day} value={day}>{day}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={3}>
            <FormControl size="small" fullWidth>
              <Select
                name="requested_woff_day"
                value={formData.requested_woff_day}
                onChange={handleChange}
                displayEmpty
              >
                <MenuItem value="">Requested Woff Day</MenuItem>
                {woffDays.map((day) => (
                  <MenuItem key={day} value={day}>{day}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <Grid item xs={3}>
            <TextField
              label="From Date"
              name="woff_from_date"
              type="date"
              value={formData.woff_from_date}
              onChange={handleChange}
              fullWidth
              size="small"
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={3}>
            <TextField
              label="To Date"
              name="woff_to_date"
              type="date"
              value={formData.woff_to_date}
              onChange={handleChange}
              fullWidth
              size="small"
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
        </Grid>

        <TextField
          label="Reason"
          name="reason"
          value={formData.reason}
          onChange={handleChange}
          fullWidth
          size="small"
          multiline
          rows={2}
          sx={{ mb: 2 }}
        />

        <Box display="flex" justifyContent="flex-end" gap={2} mt={2}>
          <Button variant="outlined" onClick={() => setShowPreview(true)}>Preview</Button>
          <Button variant="outlined" color="primary" onClick={() => navigate('/woffchange')}>Close</Button>
          <Button variant="contained" color="primary" onClick={saveWoffChange}>Save</Button>
        </Box>
      </Box>

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
