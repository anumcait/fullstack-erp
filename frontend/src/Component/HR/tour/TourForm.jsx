import React, { useState, useEffect } from "react";
import {
  TextField, Typography, Button, Grid, Box, Divider, InputAdornment, Stack, IconButton
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import EmployeeSelectDialog from "../Employee/EmployeeSelectDialog";
import { useToast } from "../../../context/ToastContext";
import axios from "axios";
import TourPreview from "./TourPreview";
import { formatDate } from "../../../utils/dateUtils";

const RequiredLabel = ({ children }) => (
  <span>
    {children}
    <span style={{ color: 'red', marginLeft: 2 }}>*</span>
  </span>
);

const requiredStyle = {
  backgroundColor: '#fffde7'
};

const TourForm = ({ onClose }) => {
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
    estimated_amount: "",
    remarks: ""
  });

  const [showEmpPopup, setShowEmpPopup] = useState(false);
  const [employeeList, setEmployeeList] = useState([]);
  const [showPreview, setShowPreview] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  useEffect(() => { fetchNextTourId(); }, []);

  const fetchNextTourId = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/tour/next-id`);
      setFormData(prev => ({ ...prev, tour_id: response.data.nextTourId }));
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
    if (!formData.empid || !formData.tour_from_date || !formData.destination || !formData.purpose) {
      showToast("Please fill all required fields.", "error");
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
        estimated_amount: "",
        remarks: ""
      });
      fetchNextTourId();
    } catch (err) {
      console.error("Save error:", err);
      showToast("❌ Error saving Tour application", "error");
    }
  };

  return (
    <Box>
      <div className="p-6 max-w-4xl mx-auto bg-white border rounded-lg shadow">
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h6" fontWeight={700}>Tour Application</Typography>
          <IconButton onClick={onClose}><CloseIcon /></IconButton>
        </Stack>

        <Box sx={{ mb: 2, display: 'flex', gap: 4, justifyContent: 'flex-start', alignItems: 'center' }}>
          <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="body2" color="text.secondary">Tour ID:</Typography>
            <Typography fontWeight={600}>{formData.tour_id}</Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="body2" color="text.secondary">Date:</Typography>
            <Typography fontWeight={600}>{formatDate(formData.tour_date)}</Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm="auto">
            <TextField
              label={<RequiredLabel>Emp ID</RequiredLabel>}
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
                Name: {formData.ename || "--"}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Unit: {formData.unit || "--"} • Div: {formData.division || "--"} • Desig: {formData.designation || "--"}
              </Typography>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        <Grid container spacing={1} alignItems="center" wrap="nowrap" sx={{ mb: 2 }}>
          <Grid item xs={12} sm="auto" sx={{ width: { sm: '150px' } }}>
            <TextField
              label={<RequiredLabel>Place To Go</RequiredLabel>}
              name="destination"
              value={formData.destination}
              onChange={handleChange}
              fullWidth
              size="small"
              sx={requiredStyle}
            />
          </Grid>
          <Grid item xs={12} sm="auto" sx={{ width: { sm: '180px' } }}>
            <TextField
              label={<RequiredLabel>Out Time</RequiredLabel>}
              name="tour_from_date"
              type="datetime-local"
              value={formData.tour_from_date}
              onChange={handleChange}
              fullWidth
              size="small"
              sx={requiredStyle}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm="auto" sx={{ width: { sm: '180px' } }}>
            <TextField
              label="In Time"
              name="tour_to_date"
              type="datetime-local"
              value={formData.tour_to_date}
              onChange={handleChange}
              fullWidth
              size="small"
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={6} sm="auto" sx={{ width: { sm: '100px' } }}>
            <TextField
              label="Est. Amt"
              name="estimated_amount"
              value={formData.estimated_amount}
              onChange={handleChange}
              fullWidth
              size="small"
            />
          </Grid>
          <Grid item xs={6} sm sx={{ flexGrow: 1 }}>
            <TextField
              label="Remarks"
              name="remarks"
              value={formData.remarks}
              onChange={handleChange}
              fullWidth
              size="small"
            />
          </Grid>
        </Grid>

        <Grid container spacing={2} mt={2}>
          <Grid item xs={12} style={{ width: '100%' }}>
            <TextField
              label={<RequiredLabel>Purpose Of Tour</RequiredLabel>}
              name="purpose"
              value={formData.purpose}
              onChange={handleChange}
              fullWidth
              size="small"
              multiline
              rows={2}
              inputProps={{ maxLength: 200 }}
              sx={requiredStyle}
              style={{ width: '100%' }}
              helperText={`${formData.purpose?.length || 0}/200 characters`}
              FormHelperTextProps={{ sx: { bgcolor: '#fffde7', padding: '2px 8px', borderRadius: 1 } }}
            />
          </Grid>
        </Grid>

        <div className="save-btn-row" style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px', gap: '8px' }}>
          <Button variant="outlined" onClick={() => setShowPreview(true)}>Preview</Button>
          <button className="save-btn" onClick={saveTour} style={{ padding: '8px 16px', background: '#1976d2', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
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
        <TourPreview data={formData} onClose={() => setShowPreview(false)} />
      )}
    </Box>
  );
};

export default TourForm;
