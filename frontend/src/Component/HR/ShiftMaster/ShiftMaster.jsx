import React, { useState, useEffect } from "react";
import {
  Box, Card, CardContent, Typography, Grid, TextField, Button, Table,
  TableHead, TableBody, TableRow, TableCell, IconButton, Dialog, DialogTitle,
  DialogContent, DialogActions, FormControl, InputLabel, Select, MenuItem,
  LinearProgress
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import axios from "axios";
import { useToast } from "../../../context/ToastContext";
import { formatTimeOnly } from "../../../utils/dateUtils";

const ShiftMaster = () => {
  const { showToast } = useToast();
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dialog, setDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    shift_id: "",
    shift_cd: "",
    start_time: "",
    end_time: "",
    lunch_start_time: "",
    lunch_end_time: "",
    c_eff_date: "",
    c_status: "A",
    c_shift_status: "A"
  });

  const shiftCodes = ["G", "A", "B", "C", "1", "2", "3", "4", "5", "6"];

  useEffect(() => {
    fetchShifts();
  }, []);

  const fetchShifts = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/shift/master/all`);
      setShifts(res.data);
    } catch (err) {
      console.error("Error fetching shifts:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleOpenDialog = async (shift = null) => {
    if (shift) {
      const formatTime = (t) => {
        if (!t) return "";
        if (typeof t === 'string') return t.slice(0, 5);
        const d = new Date(t);
        return d.toTimeString().slice(0, 5);
      };
      setFormData({
        ...shift,
        start_time: formatTime(shift.start_time),
        end_time: formatTime(shift.end_time),
        lunch_start_time: formatTime(shift.lunch_start_time),
        lunch_end_time: formatTime(shift.lunch_end_time),
        c_eff_date: shift.c_eff_date ? shift.c_eff_date.split('T')[0] : ""
      });
      setEditMode(true);
    } else {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/shift/master/next-id`);
        setFormData({
          shift_id: res.data.shift_id,
          shift_cd: "",
          start_time: "",
          end_time: "",
          lunch_start_time: "",
          lunch_end_time: "",
          u1: "N", u2: "N", u3: "N", u4: "N", u5: "N", u6: "N",
          c_eff_date: new Date().toISOString().split('T')[0],
          c_status: "A",
          c_shift_status: "A"
        });
        setEditMode(false);
      } catch (err) {
        showToast("Error getting next shift ID", "error");
        return;
      }
    }
    setDialog(true);
  };

  const handleSave = async () => {
    if (!formData.shift_cd || !formData.start_time || !formData.end_time) {
      showToast("Please fill required fields (Shift Code, Start Time, End Time)", "error");
      return;
    }
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/shift/master/save`, formData);
      showToast("✅ Shift saved successfully", "success");
      setDialog(false);
      fetchShifts();
    } catch (err) {
      showToast("❌ Error saving shift", "error");
    }
  };

  const handleDelete = async (shift_id) => {
    if (!window.confirm("Delete this shift?")) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/shift/master/${shift_id}`);
      showToast("✅ Shift deleted", "success");
      fetchShifts();
    } catch (err) {
      showToast("❌ Error deleting shift", "error");
    }
  };

  return (
    <Card sx={{ m: 2 }}>
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee' }}>
        <Typography variant="h6">Shift Master</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
          Add Shift
        </Button>
      </Box>

      <CardContent>
        {loading && <LinearProgress sx={{ mb: 2 }} />}

        <Table size="small" sx={{ border: '1px solid #ccc' }}>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell><strong>ID</strong></TableCell>
              <TableCell><strong>Code</strong></TableCell>
              <TableCell><strong>Start</strong></TableCell>
              <TableCell><strong>End</strong></TableCell>
              <TableCell><strong>Lunch Start</strong></TableCell>
              <TableCell><strong>Lunch End</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
              <TableCell><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {shifts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 3, color: '#777' }}>
                  No shifts found
                </TableCell>
              </TableRow>
            ) : (
              shifts.map((s) => (
                <TableRow key={s.shift_id}>
                  <TableCell>{s.shift_id}</TableCell>
                  <TableCell><strong>{s.shift_cd}</strong></TableCell>
                  <TableCell>{formatTimeOnly(s.start_time)}</TableCell>
                  <TableCell>{formatTimeOnly(s.end_time)}</TableCell>
                  <TableCell>{formatTimeOnly(s.lunch_start_time)}</TableCell>
                  <TableCell>{formatTimeOnly(s.lunch_end_time)}</TableCell>
                  <TableCell>{s.c_status === 'A' ? 'Active' : 'Inactive'}</TableCell>
                  <TableCell>
                    <IconButton size="small" onClick={() => handleOpenDialog(s)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => handleDelete(s.shift_id)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>

      <Dialog open={dialog} onClose={() => setDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>{editMode ? 'Edit Shift' : 'Add Shift'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={3}>
              <TextField fullWidth size="small" label="Shift ID" name="shift_id" value={formData.shift_id} disabled />
            </Grid>
            <Grid item xs={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Shift Code</InputLabel>
                <Select name="shift_cd" value={formData.shift_cd} onChange={handleChange} label="Shift Code">
                  {shiftCodes.map(code => <MenuItem key={code} value={code}>{code}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={3}>
              <TextField fullWidth size="small" label="Start Time" type="time" name="start_time" InputLabelProps={{ shrink: true }} value={formData.start_time} onChange={handleChange} />
            </Grid>
            <Grid item xs={3}>
              <TextField fullWidth size="small" label="End Time" type="time" name="end_time" InputLabelProps={{ shrink: true }} value={formData.end_time} onChange={handleChange} />
            </Grid>
            <Grid item xs={3}>
              <TextField fullWidth size="small" label="Lunch Start" type="time" name="lunch_start_time" InputLabelProps={{ shrink: true }} value={formData.lunch_start_time} onChange={handleChange} />
            </Grid>
            <Grid item xs={3}>
              <TextField fullWidth size="small" label="Lunch End" type="time" name="lunch_end_time" InputLabelProps={{ shrink: true }} value={formData.lunch_end_time} onChange={handleChange} />
            </Grid>
            <Grid item xs={3}>
              <TextField fullWidth size="small" label="Effective Date" type="date" name="c_eff_date" InputLabelProps={{ shrink: true }} value={formData.c_eff_date} onChange={handleChange} />
            </Grid>
            <Grid item xs={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select name="c_status" value={formData.c_status} onChange={handleChange} label="Status">
                  <MenuItem value="A">Active</MenuItem>
                  <MenuItem value="I">Inactive</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialog(false)}>Cancel</Button>
          <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSave}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default ShiftMaster;
