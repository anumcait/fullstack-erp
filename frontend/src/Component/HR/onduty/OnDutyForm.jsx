import React, { useState, useEffect } from "react";
import {
  TextField, Typography, Button, Grid, Box, Divider, InputAdornment, FormControl, InputLabel, Select, MenuItem, Stack, IconButton
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import axios from "axios";
import { useToast } from "../../../context/ToastContext";
import { useNavigationGuard } from "../../../context/NavigationGuardContext";
import EmployeeSelectDialog from "../Employee/EmployeeSelectDialog";
import OnDutyPreview from "./OnDutyPreview";
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

const OnDutyForm = ({ onClose }) => {
  const { showToast } = useToast();
  const { setIsDirty } = useNavigationGuard();
  const [shifts, setShifts] = useState([]);

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

  const handleChange = (e) => {
    setIsDirty(true);
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleChangeTime = (e) => {
    const { name, value } = e.target;
    setIsDirty(true);
    const updatedData = { ...formData, [name]: value };

    if (name === "perm_ftime" || name === "perm_ttime") {
      const { perm_ftime, perm_ttime } = updatedData;
      if (perm_ftime && perm_ttime) {
        const [sh, sm] = perm_ftime.split(":").map(Number);
        const [eh, em] = perm_ttime.split(":").map(Number);
        let startMinutes = sh * 60 + sm;
        let endMinutes = eh * 60 + em;
        let diffMinutes = endMinutes - startMinutes;
        if (diffMinutes < 0) diffMinutes += 24 * 60;
        const hours = Math.floor(diffMinutes / 60);
        const minutes = diffMinutes % 60;
        updatedData.no_of_hrs = `${hours}.${minutes.toString().padStart(2, "0")}`;
      }
    }
    setFormData(updatedData);
  };

  useEffect(() => {
    if (formData.perm_ftime && formData.perm_ttime) {
      const from = new Date(`1970-01-01T${formData.perm_ftime}`);
      const to = new Date(`1970-01-01T${formData.perm_ttime}`);
      const diff = (to - from) / 3600000;
      setFormData((prev) => ({ ...prev, no_of_hrs: diff.toFixed(2) }));
    }
  }, [formData.perm_ftime, formData.perm_ttime]);

  useEffect(() => { fetchNextMovementId(); }, []);
  useEffect(() => { fetchShifts(); }, []);

  const fetchShifts = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/shift/master/all`);
      setShifts(res.data);
    } catch (err) {
      console.error("Error fetching shifts:", err);
    }
  };

  const fetchNextMovementId = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/onduty/next-id`);
      setFormData(prev => ({ ...prev, movement_id: response.data.nextMovementId }));
    } catch (error) {
      console.error("Failed to fetch next movement ID:", error);
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

  const saveOnDuty = async () => {
    if (!formData.empid || !formData.act_date || !formData.shift || !formData.perm_ftime || !formData.perm_ttime || !formData.reason_perm) {
      showToast("Please fill all required fields.", "error");
      return;
    }
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/onduty/save`, formData);
      showToast(`On Duty Saved. ID: ${response.data.movement_id}`, "success");
      setIsDirty(false);
      setFormData({
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
      fetchNextMovementId();
    } catch (err) {
      console.error("Save error:", err);
      showToast("Error saving On Duty application", "error");
    }
  };

  return (
    <Box>
      <div className="p-6 max-w-4xl mx-auto bg-white border rounded-lg shadow">
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h6" fontWeight={700}>On Duty Permission</Typography>
          <IconButton onClick={() => { setIsDirty(false); onClose(); }}><CloseIcon /></IconButton>
        </Stack>

        <Box sx={{ mb: 2, display: 'flex', gap: 4, justifyContent: 'flex-start', alignItems: 'center' }}>
          <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="body2" color="text.secondary">OD App No:</Typography>
            <Typography fontWeight={600}>{formData.movement_id}</Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="body2" color="text.secondary">Entry Date:</Typography>
            <Typography fontWeight={600}>{formatDate(formData.movement_date)}</Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
          <TextField
            label={<RequiredLabel>Emp Id</RequiredLabel>}
            name="empid"
            value={formData.empid}
            onClick={openEmpPopup}
            size="small"
            placeholder="Select Employee"
            sx={{ ...requiredStyle, width: '180px' }}
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
          <Box sx={{ p: 1, bgcolor: '#f8f9fa', borderRadius: 1, border: '1px solid #e0e0e0', flex: 1 }}>
            <Typography fontWeight={600} variant="subtitle2">
              Name: {formData.ename || "--"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Dept: {formData.unit || "--"} • Div: {formData.division || "--"} • Desig: {formData.designation || "--"}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
          <TextField
            label={<RequiredLabel>Date</RequiredLabel>}
            name="act_date"
            type="date"
            size="small"
            sx={{ ...requiredStyle, width: '180px' }}
            value={formData.act_date}
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
          />
          <FormControl size="small" sx={{ ...requiredStyle, flex: '1 1 150px' }}>
            <InputLabel><RequiredLabel>Shift</RequiredLabel></InputLabel>
            <Select
              name="shift"
              value={formData.shift}
              onChange={handleChange}
              label={<RequiredLabel>Shift</RequiredLabel>}
            >
              {shifts.map(s => (
                <MenuItem key={s.shift_id} value={s.shift_cd}>{s.shift_cd}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label={<RequiredLabel>From Time</RequiredLabel>}
            type="time"
            name="perm_ftime"
            size="small"
            sx={{ ...requiredStyle, width: '120px' }}
            value={formData.perm_ftime}
            onChange={handleChangeTime}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label={<RequiredLabel>To Time</RequiredLabel>}
            type="time"
            name="perm_ttime"
            size="small"
            sx={{ ...requiredStyle, width: '120px' }}
            value={formData.perm_ttime}
            onChange={handleChangeTime}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Hours"
            size="small"
            sx={{ width: '100px' }}
            disabled
            value={formData.no_of_hrs}
          />
        </Box>

        <Box sx={{ mt: 2 }}>
          <TextField
            label={<RequiredLabel>Reason for On Duty</RequiredLabel>}
            name="reason_perm"
            size="small"
            fullWidth
            multiline
            rows={2}
            placeholder="Enter reason for on duty..."
            value={formData.reason_perm}
            onChange={handleChange}
            inputProps={{ maxLength: 200 }}
            sx={requiredStyle}
            helperText={`${formData.reason_perm?.length || 0}/200 characters`}
          />
        </Box>

        <div className="save-btn-row" style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
          <button className="save-btn" onClick={saveOnDuty} style={{ padding: '8px 16px', background: '#1976d2', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
            Save
          </button>
        </div>
      </div>

      <EmployeeSelectDialog open={showEmpPopup} onClose={() => setShowEmpPopup(false)} onSelect={selectEmployee} data={employeeList} />
      {showPreview && <OnDutyPreview formData={formData} onClose={() => setShowPreview(false)} />}
    </Box>
  );
};

export default OnDutyForm;