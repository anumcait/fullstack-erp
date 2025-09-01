import React, { useState, useEffect } from "react";
import {
  TextField, Typography, Button, Grid, Box, Card, CardContent,
  Stack, IconButton, Divider, InputAdornment, FormControl, InputLabel, Select, MenuItem
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import axios from "axios";
import { useToast } from "../../context/ToastContext";
import EmployeeSelectDialog from "../Employee/EmployeeSelectDialog";
import OnDutyPreview from "./OnDutyPreview";

const OnDutyForm = () => {
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
    movement_id: "",
    movement_date: getCurrentISTDateTime(),
    empid: "",
    ename: "",
    unit: "",
    division: "",
    designation: "",
    shift: "",
    act_date: "",
    perm_ftime: "",
    perm_ttime: "",
    no_of_hrs: "",
    reason_perm: ""
  });

  const [showEmpPopup, setShowEmpPopup] = useState(false);
  const [employeeList, setEmployeeList] = useState([]);
  const [showPreview, setShowPreview] = useState(false);

  // Handle change
  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

const handleChangeTime = (e) => {
  const { name, value } = e.target;
  const updatedData = { ...formData, [name]: value };

  // Recalculate no_of_hrs only when from_time or to_time changes
  if (name === "from_time" || name === "to_time") {
    const { from_time, to_time } = updatedData;

    if (from_time && to_time) {
      const [sh, sm] = from_time.split(":").map(Number);
      const [eh, em] = to_time.split(":").map(Number);

      // convert both to minutes
      let startMinutes = sh * 60 + sm;
      let endMinutes = eh * 60 + em;

      // handle overnight case
      let diffMinutes = endMinutes - startMinutes;
      if (diffMinutes < 0) diffMinutes += 24 * 60;

      // convert back to hrs and mins
      const hours = Math.floor(diffMinutes / 60);
      const minutes = diffMinutes % 60;

      updatedData.no_of_hrs = `${hours}.${minutes.toString().padStart(2, "0")}`;
    }
  }

  setFormData(updatedData);
};

  // Auto calculate hours
  useEffect(() => {
    if (formData.perm_ftime && formData.perm_ttime) {
      const from = new Date(`1970-01-01T${formData.perm_ftime}`);
      const to = new Date(`1970-01-01T${formData.perm_ttime}`);
      const diff = (to - from) / 3600000;
      setFormData((prev) => ({ ...prev, no_of_hrs: diff.toFixed(2) }));
    }
  }, [formData.perm_ftime, formData.perm_ttime]);

  useEffect(() => { fetchNextMovementId(); }, []);

  const fetchNextMovementId = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/onduty/next-id`);
      setFormData((prev) => ({
        ...prev,
        movement_id: response.data.nextMovementId,
        movement_date: getCurrentISTDateTime(),
      }));
    } catch (error) {
      console.error("Failed to fetch next movement ID:", error);
    }
  };

  const openEmpPopup = async () => {
    const response = await axios.get(`${import.meta.env.VITE_API_URL}/employees`);
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

  const saveOnDuty = async () => {
    if (!formData.empid || !formData.act_date || !formData.perm_ftime || !formData.perm_ttime) {
      showToast("❌ Please fill all required fields.", "error");
      return;
    }
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/onduty/save`, formData);
      showToast(`✅ On Duty Saved. ID: ${response.data.movement_id}`, "success");
       setFormData({ movement_id: "",
    movement_date: getCurrentISTDateTime(),
    empid: "",
    ename: "",
    unit: "",
    division: "",
    designation: "",
    shift: "",
    act_date: "",
    perm_ftime: "",
    perm_ttime: "",
    no_of_hrs: "",
    reason_perm: ""});
      fetchNextMovementId();
    } catch (err) {
      console.error("Save error:", err);
      showToast("❌ Error saving On Duty application", "error");
    }
  };

  return (
    <Box sx={{ p: 3, bgcolor: "#f5f7fa"}}> {/*, minHeight: "100vh" */}
      <div className="p-6 max-w-4xl mx-auto bg-white border rounded-lg shadow">
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h6" fontWeight={700}>On Duty Permission</Typography>
        <IconButton><CloseIcon /></IconButton>
      </Stack>

      <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
        <CardContent>
          {/* App Info */}
  
<Grid container spacing={2}>
  <Grid item xs={6}>
    <Box display="flex" alignItems="center">
      <Typography variant="body2" color="text.secondary" sx={{ minWidth: 100 }}>
        OD App No:
      </Typography>
      <Typography fontWeight={600}>{formData.movement_id}</Typography>
    </Box>
  </Grid>

  <Grid item xs={6}>
    <Box display="flex" alignItems="center">
      <Typography variant="body2" color="text.secondary" sx={{ minWidth: 100 }}>
        Entry Date:
      </Typography>
      <Typography fontWeight={600}>
        {formData.movement_date.replace("T", " ")}
      </Typography>
    </Box>
  </Grid>
</Grid>
          <Divider sx={{ my: 2 }} />
{/* Employee Info Block */}
{/* <Box sx={{ p: 2, border: "1px solid #e0e0e0", borderRadius: 2, mb: 2 }}> */}
<Typography variant="subtitle2" sx={{ mb: 1 }}>
  Employee Details
</Typography>

  <Grid container spacing={2} alignItems="center">
    {/* Emp ID */}
    <Grid item xs={3}>
      <TextField
          label="Emp ID *"
          size="small"
          value={formData.empid || ""}
          fullWidth
      variant="outlined"
  sx={{
  
    '& .MuiOutlinedInput-root': {
      '& fieldset': {
        
        borderColor: '#333',   // default blue
        borderWidth: 1,           // thicker line
      },
      '&:hover fieldset': {
        borderColor: '#1565c0',   // darker blue on hover
      },
      '&.Mui-focused fieldset': {
        borderColor: '#1976d2',   // blue on focus
        borderWidth: 2.5,         // little thicker when focused
      },
    },
  }}
        //   InputProps={{
        //     readOnly: true,
        //     disableUnderline: true, 
            
        //     endAdornment: (
        //       <InputAdornment position="end" sx={{
        //         border: "none",
               
        //       }}>
        //         <IconButton size="small" onClick={openEmpPopup}>
        //           <SearchIcon fontSize="small" />
        //         </IconButton>
        //       </InputAdornment>
        //     ),
        //   }}
        //   onClick={openEmpPopup}
         />
    </Grid>


    {/* Details */}
    <Grid item xs={4}>
      <Typography fontWeight={600}>
        {formData.ename || ""} • {formData.unit || "--"} • {formData.division || "--"} • {formData.designation || "--"}
      </Typography>
    </Grid>
  </Grid>
{/* </Box> */}

      

          <Divider sx={{ my: 2 }} />

{/* On Duty Info */}
<Typography variant="subtitle2" sx={{ mb: 1 }}>
  On Duty Details
</Typography>

<Grid container spacing={2}>

  {/* Row 1 - all inline */}
  <Grid item sx={{ flex: "0 0 18%" }} xs={12} sm={6} md={2}>
    <TextField
     // label="Date"
      name="act_date"
      type="date"
      size="small"
      fullWidth
      value={formData.act_date}
      onChange={handleChange}
      InputLabelProps={{ shrink: true }}
    />
  </Grid>
<Grid item sx={{ flex: "0 0 18%" }} xs={12} sm={6} md={2}>
<FormControl size="small" fullWidth>
  <InputLabel id="shift-label">Shift</InputLabel>
  <Select
    labelId="shift-label"
    id="shift"
    name="shift"
    value={formData.shift}
    onChange={handleChange}
    label="Shift"   // ⬅️ this makes it float like your time field
  >
    <MenuItem value="A">A</MenuItem>
    <MenuItem value="B">B</MenuItem>
    <MenuItem value="C">C</MenuItem>
  </Select>
</FormControl>

</Grid>

  <Grid item sx={{ flex: "0 0 18%" }} xs={12} sm={6} md={2}>
    <TextField
      label="From Time"
      type="time"
      name="perm_ftime"
      size="small"
      fullWidth
      value={formData.perm_ftime}
      onChange={handleChangeTime}
      InputLabelProps={{ shrink: true }}

    />
  </Grid>

  <Grid item sx={{ flex: "0 0 18%" }} xs={12} sm={6} md={2}>
    <TextField
      label="To Time"
      type="time"
      name="perm_ttime"
      size="small"
      fullWidth
      value={formData.perm_ttime}
      onChange={handleChangeTime}
      InputLabelProps={{ shrink: true }}
    />

  </Grid>

  <Grid item sx={{ flex: "0 0 18%" }} xs={12} sm={6} md={2}>
    <TextField
      label="No of Hours"
      size="small"
      fullWidth
      disabled
      value={formData.no_of_hrs}
      InputLabelProps={{ shrink: true }}
      variant="outlined"
  sx={{
    '& .MuiOutlinedInput-root': {
      '& fieldset': {
        borderColor: '#333',   // default blue
        borderWidth: 1,           // thicker line
      },
      '&:hover fieldset': {
        borderColor: '#1565c0',   // darker blue on hover
      },
      '&.Mui-focused fieldset': {
        borderColor: '#1976d2',   // blue on focus
        borderWidth: 2.5,         // little thicker when focused
      },
    },
  }}
    />
  </Grid>

  {/* Row 2 - Reason */}
  <Grid item sx={{ flex: "0 0 100%" }} xs={12} sm={6} md={2}>
    <TextField
  label="Reason"
  name="reason_perm"
  size="small"
  fullWidth
  multiline
  minRows={2}
  value={formData.reason_perm}
  onChange={handleChange}
  InputLabelProps={{ shrink: true }}
  variant="outlined"
  sx={{
    '& .MuiOutlinedInput-root': {
      '& fieldset': {
        borderColor: '#333',   // default blue
        borderWidth: 1,           // thicker line
      },
      '&:hover fieldset': {
        borderColor: '#1565c0',   // darker blue on hover
      },
      '&.Mui-focused fieldset': {
        borderColor: '#1976d2',   // blue on focus
        borderWidth: 2.5,         // little thicker when focused
      },
    },
  }}
/>

  </Grid>

</Grid>

       
        </CardContent>

        {/* Footer */}
        <Box sx={{ p: 2, borderTop: "1px solid #e5e7eb", bgcolor: "#fafafa" }}>
          <Stack direction="row" spacing={20}>
            
            <Button variant="outlined" onClick={() => setShowPreview(true)} fullWidth>Close</Button>
            <Button variant="contained" onClick={saveOnDuty} fullWidth>Save</Button>
          </Stack>
        </Box>
      </Card>
    </div>
      {/* Employee Dialog */}
      <EmployeeSelectDialog open={showEmpPopup} onClose={() => setShowEmpPopup(false)} onSelect={selectEmployee} data={employeeList} />

      {/* Preview */}
      {showPreview && <OnDutyPreview formData={formData} onClose={() => setShowPreview(false)} />}
    </Box>

  );
};

export default OnDutyForm;
