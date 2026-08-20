import React, { useState, useEffect } from "react";
import {
  Box, Card, CardContent, Typography, Grid, TextField, Button, Table,
  TableHead, TableBody, TableRow, TableCell, IconButton, Dialog, DialogTitle,
  DialogContent, DialogActions, Alert, LinearProgress
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import RefreshIcon from "@mui/icons-material/Refresh";
import axios from "axios";
import { useToast } from "../../../context/ToastContext";
import { getErrorMessage } from "../../../utils/errorUtils";
import { formatDateOnly } from "../../../utils/dateUtils";

const HolidayMaster = () => {
  const { showToast } = useToast();
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(false);
  const [year, setYear] = useState(new Date().getFullYear());
  const [dialog, setDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    hno: "",
    hdate: "",
    hdesc: "",
    hday: "",
    yr: new Date().getFullYear(),
    hremarks: ""
  });

  useEffect(() => {
    fetchHolidays();
  }, [year]);

  const fetchHolidays = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/holidays?year=${year}`);
      setHolidays(res.data);
    } catch (err) {
      console.error("Error fetching holidays:", err);
      showToast(getErrorMessage(err, "Error fetching holidays"), "error");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleOpenDialog = (holiday = null) => {
    if (holiday) {
      setFormData({
        hno: holiday.hno,
        hdate: holiday.hdate,
        hdesc: holiday.hdesc || "",
        hday: holiday.hday || "",
        yr: holiday.yr,
        hremarks: holiday.hremarks || ""
      });
      setEditMode(true);
    } else {
      setFormData({
        hno: "",
        hdate: "",
        hdesc: "",
        hday: "",
        yr: year,
        hremarks: ""
      });
      setEditMode(false);
    }
    setDialog(true);
  };

  const handleSave = async () => {
    if (!formData.hdate || !formData.yr) {
      showToast("Please fill required fields (Date and Year)", "error");
      return;
    }
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/holidays/save`, formData);
      showToast("✅ Holiday saved successfully", "success");
      setDialog(false);
      fetchHolidays();
    } catch (err) {
      showToast(getErrorMessage(err, "Error saving holiday"), "error");
    }
  };

  const handleDelete = async (hno) => {
    if (!window.confirm("Delete this holiday?")) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/holidays/${hno}`);
      showToast("✅ Holiday deleted", "success");
      fetchHolidays();
    } catch (err) {
      showToast(getErrorMessage(err, "Error deleting holiday"), "error");
    }
  };

  const getDayName = (dateStr) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const d = new Date(dateStr);
    return days[d.getDay()];
  };

  const isPastHoliday = (d) => {
    const now = new Date(); now.setHours(0,0,0,0);
    const dt = new Date(d); dt.setHours(0,0,0,0);
    return dt < now;
  };

  return (
    <Card sx={{ m: 2 }}>
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee' }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'var(--heading-color)', borderLeft: '4px solid', borderColor: 'primary.main', pl: 1.5, lineHeight: 1.2 }}>Holiday Master</Typography>
        <Box>
          <TextField
            size="small"
            type="number"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            sx={{ width: 100, mr: 1 }}
            label="Year"
          />
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={fetchHolidays} sx={{ mr: 1 }}>
            Refresh
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
            Add Holiday
          </Button>
        </Box>
      </Box>

      <CardContent>
        {loading && <LinearProgress sx={{ mb: 2 }} />}

        <Table size="small" sx={{
          tableLayout: 'fixed',
          width: '100%',
          border: '1px solid #ccc',
          '& .MuiTableCell-root': {
            px: 1,
            py: 0.5,
            fontSize: '12px',
            fontWeight: 500
          }
        }}>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f1f1f1' }}>
              <TableCell sx={{ width: '50px' }}><strong>Sl.No</strong></TableCell>
              <TableCell sx={{ width: '100px' }}><strong>Date</strong></TableCell>
              <TableCell sx={{ width: '100px' }}><strong>Day</strong></TableCell>
              <TableCell sx={{ minWidth: '300px' }}><strong>Description</strong></TableCell>
              <TableCell sx={{ width: '70px' }} align="center"><strong>Year</strong></TableCell>
              <TableCell sx={{ minWidth: '150px' }}><strong>Remarks</strong></TableCell>
              <TableCell sx={{ width: '90px' }} align="center"><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {holidays.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 3, color: '#777' }}>
                  No holidays found for {year}
                </TableCell>
              </TableRow>
            ) : (
              holidays.map((h, idx) => (
                <TableRow key={h.hno} sx={{ bgcolor: isPastHoliday(h.hdate) ? '#f0f0f0' : '#e8f5e9' }}>
                  <TableCell sx={{ color: isPastHoliday(h.hdate) ? '#999' : '#2e7d32' }}>{idx + 1}</TableCell>
                  <TableCell sx={{ color: isPastHoliday(h.hdate) ? '#999' : '#2e7d32' }}>{formatDateOnly(h.hdate)}</TableCell>
                  <TableCell sx={{ color: isPastHoliday(h.hdate) ? '#999' : '#2e7d32' }}>{h.hday || getDayName(h.hdate)}</TableCell>
                  <TableCell sx={{ color: isPastHoliday(h.hdate) ? '#999' : '#2e7d32' }}>{h.hdesc}</TableCell>
                  <TableCell sx={{ color: isPastHoliday(h.hdate) ? '#999' : '#2e7d32' }}>{h.yr}</TableCell>
                  <TableCell sx={{ color: isPastHoliday(h.hdate) ? '#999' : '#2e7d32' }}>{h.hremarks || '-'}</TableCell>
                  <TableCell>
                    <IconButton size="small" onClick={() => handleOpenDialog(h)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => handleDelete(h.hno)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              )))
            }
          </TableBody>
        </Table>
      </CardContent>

      <Dialog open={dialog} onClose={() => setDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editMode ? 'Edit Holiday' : 'Add Holiday'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={6}>
              <TextField
                fullWidth
                size="small"
                label="Date"
                type="date"
                name="hdate"
                InputLabelProps={{ shrink: true }}
                value={formData.hdate}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                size="small"
                label="Year"
                type="number"
                name="yr"
                value={formData.yr}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                size="small"
                label="Holiday Description"
                name="hdesc"
                value={formData.hdesc}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                size="small"
                label="Day"
                name="hday"
                value={formData.hday}
                onChange={handleChange}
                placeholder="e.g., Sunday, Monday"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                size="small"
                label="Remarks"
                name="hremarks"
                value={formData.hremarks}
                onChange={handleChange}
              />
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

export default HolidayMaster;
