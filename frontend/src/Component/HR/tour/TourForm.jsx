import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  TextField, Typography, Button, Grid, Box, Divider, InputAdornment
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import EmployeeSelectDialog from "../Employee/EmployeeSelectDialog";
import { useToast } from "../../../context/ToastContext";
import axios from "axios";
import TourPreview from "./TourPreview";

const TourForm = () => {
  const { showToast } = useToast();

  const getCurrentISTDateTime = () => {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const [formData, setFormData] = useState({
    tour_id: "",
    tour_date: getCurrentISTDateTime(),
    empid: "",
    ename: "",
    unit: "",
    division: "",
    designation: "",
    tour_from_date: "",
    tour_to_date: "",
    destination: "",
    purpose: "",
    estimated_amount: ""
  });

  const [showEmpPopup, setShowEmpPopup] = useState(false);
  const [employeeList, setEmployeeList] = useState([]);
  const [showPreview, setShowPreview] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  useEffect(() => { fetchNextTourId(); }, []);

  const fetchNextTourId = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/tour/next-id`);
      setFormData(prev => ({ ...prev, tour_id: response.data.nextId }));
    } catch (error) {
      console.error("Failed to fetch next tour ID:", error);
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

  const saveTour = async () => {
    if (!formData.empid || !formData.tour_from_date || !formData.tour_to_date || !formData.destination) {
      showToast("❌ Please fill all required fields.", "error");
      return;
    }
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/tour/apply`, formData);
      showToast(`✅ Tour Application Saved. ID: ${response.data.data.tour_id}`, "success");
      setFormData({
        tour_id: "",
        tour_date: getCurrentISTDateTime(),
        empid: "",
        ename: "",
        unit: "",
        division: "",
        designation: "",
        tour_from_date: "",
        tour_to_date: "",
        destination: "",
        purpose: "",
        estimated_amount: ""
      });
      fetchNextTourId();
    } catch (err) {
      console.error("Save error:", err);
      showToast("❌ Error saving Tour application", "error");
    }
  };

  return (
    <Box sx={{ p: 2, bgcolor: "#f5f7fa" }}>
      <Box sx={{
        maxWidth: 800, mx: "auto", bgcolor: "#fff",
        borderRadius: 3, boxShadow: 3, mt: 1, px: 4, py: 3
      }}>
        <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
          Tour Application
        </Typography>

        <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <Grid item xs={4}>
            <Typography fontWeight={500}>
              Tour ID: <span style={{ fontWeight: 700 }}>{formData.tour_id}</span>
            </Typography>
          </Grid>
          <Grid item xs={8}>
            <Typography fontWeight={500}>
              Date: <span style={{ fontWeight: 700 }}>{formData.tour_date}</span>
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
          Tour Details
        </Typography>

        <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <Grid item xs={3}>
            <TextField
              label="From Date"
              name="tour_from_date"
              type="date"
              value={formData.tour_from_date}
              onChange={handleChange}
              fullWidth
              size="small"
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={3}>
            <TextField
              label="To Date"
              name="tour_to_date"
              type="date"
              value={formData.tour_to_date}
              onChange={handleChange}
              fullWidth
              size="small"
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={3}>
            <TextField
              label="Estimated Amount"
              name="estimated_amount"
              type="number"
              value={formData.estimated_amount}
              onChange={handleChange}
              fullWidth
              size="small"
              InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }}
            />
          </Grid>
        </Grid>

        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12}>
            <TextField
              label="Destination"
              name="destination"
              value={formData.destination}
              onChange={handleChange}
              fullWidth
              size="small"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Purpose"
              name="purpose"
              value={formData.purpose}
              onChange={handleChange}
              fullWidth
              size="small"
              multiline
              rows={2}
            />
          </Grid>
        </Grid>

        <Box display="flex" justifyContent="flex-end" gap={2} mt={2}>
          <Button variant="outlined" onClick={() => setShowPreview(true)}>Preview</Button>
          <Button variant="outlined" color="primary" onClick={() => navigate('/tour')}>Close</Button>
          <Button variant="contained" color="primary" onClick={saveTour}>Save</Button>
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
        <TourPreview data={formData} onClose={() => setShowPreview(false)} />
      )}
    </Box>
  );
};

export default TourForm;
