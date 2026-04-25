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
import ESILeavePreview from "./ESILeavePreview";

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
    <Box sx={{ p: 3, bgcolor: "#f5f7fa" }}>
      <div className="p-6 max-w-4xl mx-auto bg-white border rounded-lg shadow">
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h6" fontWeight={700}>ESI Leave Request</Typography>
          <IconButton><CloseIcon /></IconButton>
        </Stack>

        <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
          <CardContent>
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

            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Employee Details
            </Typography>

            <Grid container spacing={2} alignItems="center">
              <Grid item xs={3}>
                <TextField
                  label="Emp ID *"
                  size="small"
                  value={formData.empid || ""}
                  fullWidth
                  variant="outlined"
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
                />
              </Grid>

              <Grid item xs={4}>
                <Typography fontWeight={600}>
                  {formData.ename || ""} • {formData.unit || "--"} • {formData.division || "--"} • {formData.designation || "--"}
                </Typography>
              </Grid>

              <Grid item xs={3}>
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

            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              ESI Leave Details
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  label="ESI Dispencery"
                  name="esi_dispencery"
                  size="small"
                  fullWidth
                  value={formData.esi_dispencery}
                  onChange={handleChange}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  label="Hospital Name"
                  name="hospital_name"
                  size="small"
                  fullWidth
                  value={formData.hospital_name}
                  onChange={handleChange}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
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

              <Grid item xs={12} sm={6} md={3}>
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

              <Grid item xs={12} sm={6} md={3}>
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

              <Grid item xs={12}>
                <TextField
                  label="Reason"
                  name="reason"
                  size="small"
                  fullWidth
                  multiline
                  minRows={2}
                  value={formData.reason}
                  onChange={handleChange}
                />
              </Grid>
            </Grid>
          </CardContent>

          <Box sx={{ p: 2, borderTop: "1px solid #e5e7eb", bgcolor: "#fafafa" }}>
            <Stack direction="row" spacing={20}>
              <Button variant="outlined" onClick={() => setShowPreview(true)} fullWidth>Close</Button>
              <Button variant="contained" onClick={saveESILeave} fullWidth>Save</Button>
            </Stack>
          </Box>
        </Card>
      </div>

      <EmployeeSelectDialog open={showEmpPopup} onClose={() => setShowEmpPopup(false)} onSelect={selectEmployee} data={employeeList} />
      {showPreview && <ESILeavePreview formData={formData} onClose={() => setShowPreview(false)} />}
    </Box>
  );
};

export default ESILeaveForm;
