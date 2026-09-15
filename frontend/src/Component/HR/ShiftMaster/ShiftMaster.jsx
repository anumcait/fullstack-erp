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

  const shiftOrder = { G: 0, A: 1, B: 2, C: 3, '1': 4, '2': 5, '3': 6, '4': 7, '5': 8, '6': 9 };
  const shiftNames = { G: 'General', A: 'Day (12H)', B: 'Night (12H)', '1': 'Morning', '2': 'Afternoon', '3': 'Night', '4': 'Shift 4', '5': 'Shift 5', '6': 'Shift 6' };
  const fetchShifts = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/shift/master/all`);
      const sorted = [...(res.data || [])].sort((a, b) => (shiftOrder[a.shift_cd] ?? 99) - (shiftOrder[b.shift_cd] ?? 99));
      setShifts(sorted);
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
        <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'var(--heading-color)', borderLeft: '4px solid', borderColor: 'primary.main', pl: 1.5, lineHeight: 1.2 }}>Shift Master</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
          Add Shift
        </Button>
      </Box>

      <CardContent sx={{ p: 0 }}>
        {loading && <LinearProgress sx={{ mb: 2 }} />}
        <Box sx={{ overflowX: 'auto' }}>
        <Table size="small" sx={{ minWidth: 900, border: '1px solid #ccc', '& .MuiTableCell-root': { px: 2, py: 1.2, fontSize: '13px', fontWeight: 500, whiteSpace: 'nowrap' } }}>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#e3f2fd' }}>
              <TableCell sx={{ width: 70, fontWeight: 900, color: 'primary.dark', borderBottom: '2px solid #90caf9' }}><Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}><strong>ID</strong></Box></TableCell>
              <TableCell sx={{ width: 140, fontWeight: 900, color: 'primary.dark', borderBottom: '2px solid #90caf9' }}><Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}><strong>Code</strong> <Box component="span" sx={{ fontSize: 11, color: '#666', fontWeight: 600, bgcolor: '#fff', px: 1, py: 0.2, borderRadius: 1, border: '1px solid #90caf9' }}>(Name)</Box></Box></TableCell>
              <TableCell sx={{ width: 130, fontWeight: 900, color: 'primary.dark', borderBottom: '2px solid #90caf9' }}><Box sx={{ display: 'flex', alignItems: 'center' }}><strong>Start</strong></Box></TableCell>
              <TableCell sx={{ width: 130, fontWeight: 900, color: 'primary.dark', borderBottom: '2px solid #90caf9' }}><Box sx={{ display: 'flex', alignItems: 'center' }}><strong>End</strong></Box></TableCell>
              <TableCell sx={{ width: 140, fontWeight: 900, color: 'primary.dark', borderBottom: '2px solid #90caf9' }}><Box sx={{ display: 'flex', alignItems: 'center' }}><strong>Lunch Start</strong></Box></TableCell>
              <TableCell sx={{ width: 140, fontWeight: 900, color: 'primary.dark', borderBottom: '2px solid #90caf9' }}><Box sx={{ display: 'flex', alignItems: 'center' }}><strong>Lunch End</strong></Box></TableCell>
              <TableCell sx={{ width: 110, fontWeight: 900, color: 'primary.dark', borderBottom: '2px solid #90caf9' }}><Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><strong>Status</strong></Box></TableCell>
              <TableCell sx={{ width: 140, fontWeight: 900, color: 'primary.dark', borderBottom: '2px solid #90caf9' }}><Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><strong>Actions</strong></Box></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {shifts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 3, color: '#777' }}>
                  No shifts found
                </TableCell>
              </TableRow>
            ) : (
              shifts.map((s) => (
                <TableRow key={s.shift_id} sx={{ '&:hover': { bgcolor: '#f5f5f5' } }}>
                  <TableCell>{s.shift_id}</TableCell>
                  <TableCell><Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}><strong>{s.shift_cd}</strong> <Box component="span" sx={{ fontSize: 11, color: '#555', bgcolor: '#e3f2fd', px: 1, py: 0.2, borderRadius: 1 }}>{shiftNames[s.shift_cd] || s.shift_cd}</Box></Box></TableCell>
                  <TableCell>{formatTimeOnly(s.start_time)}</TableCell>
                  <TableCell>{formatTimeOnly(s.end_time)}</TableCell>
                  <TableCell>{formatTimeOnly(s.lunch_start_time) || '-'}</TableCell>
                  <TableCell>{formatTimeOnly(s.lunch_end_time) || '-'}</TableCell>
                  <TableCell align="center">{s.c_status === 'A' ? 'Active' : 'Inactive'}</TableCell>
                  <TableCell align="center">
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
        </Box>
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
