import React, { useState, useEffect } from "react";
import {
  Box, Card, CardContent, Typography, Grid, TextField, Button, Table,
  TableHead, TableBody, TableRow, TableCell, IconButton, Dialog, DialogTitle,
  DialogContent, DialogActions, FormControl, InputLabel, Select, MenuItem,
  LinearProgress, Chip, Tabs, Tab, Checkbox, FormControlLabel, InputAdornment
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import ViewWeekIcon from "@mui/icons-material/ViewWeek";
import ListIcon from "@mui/icons-material/List";
import PlaylistAddIcon from "@mui/icons-material/PlaylistAdd";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import axios from "axios";
import { useToast } from "../../../context/ToastContext";
import { formatDateOnly, formatTimeOnly } from "../../../utils/dateUtils";

const ShiftSchedule = () => {
  const { showToast } = useToast();
  const [schedules, setSchedules] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dialog, setDialog] = useState(false);
  const [weekAssignDialog, setWeekAssignDialog] = useState(false);
  const [viewMode, setViewMode] = useState(0);
  const [formData, setFormData] = useState({ empid: "", shift_date: new Date().toISOString().split('T')[0], shift_cd: "" });
  const [weekForm, setWeekForm] = useState({ startDate: "", selectAll: true, employeeIds: [] });
  const [weekShifts, setWeekShifts] = useState({ sun: "", mon: "", tue: "", wed: "", thu: "", fri: "", sat: "" });
  const [bulkMatrixDialog, setBulkMatrixDialog] = useState(false);
  const [bulkSchedules, setBulkSchedules] = useState([]);
  const [bulkData, setBulkData] = useState({}); // { empid: { date: shift_cd } }
  const [existingShifts, setExistingShifts] = useState(new Set()); // set of "empid|date" strings with existing schedules
  const [saving, setSaving] = useState(false);
  const [woffs, setWoffs] = useState([]);
  const [filters, setFilters] = useState({ month: new Date().getMonth() + 1, year: new Date().getFullYear(), empid: "" });
  const getCurrentWeekOffset = () => {
    const now = new Date();
    const yearStart = new Date(now.getFullYear(), 0, 1);
    const dayOfYear = Math.floor((now - yearStart) / (24 * 60 * 60 * 1000));
    const firstSunday = new Date(yearStart);
    firstSunday.setDate(1 - yearStart.getDay());
    const firstSundayDayOfYear = Math.floor((firstSunday - yearStart) / (24 * 60 * 60 * 1000));
    return Math.floor((dayOfYear - firstSundayDayOfYear) / 7);
  };

  const [weekOffset, setWeekOffset] = useState(getCurrentWeekOffset());
  const [empSearch, setEmpSearch] = useState("");

  const getWeekStartDate = () => {
    const currentYear = parseInt(filters.year);
    const firstDay = new Date(currentYear, 0, 1);
    const firstSunday = new Date(firstDay);
    firstSunday.setDate(firstDay.getDate() - firstDay.getDay());
    const targetDate = new Date(firstSunday);
    targetDate.setDate(firstSunday.getDate() + (weekOffset * 7));
    return targetDate;
  };

  const getOffsetForDate = (date) => {
    const currentYear = date.getFullYear();
    const firstDay = new Date(currentYear, 0, 1);
    const firstSunday = new Date(firstDay);
    firstSunday.setDate(firstDay.getDate() - firstDay.getDay());
    const diffDays = Math.floor((date - firstSunday) / (24 * 60 * 60 * 1000));
    return Math.floor(diffDays / 7);
  };

  const fetchEmployees = async () => {
    try { const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/employees`); setEmployees(res.data); }
    catch (err) { console.error("Error fetching employees:", err); }
  };

  // Initial data fetch
  useEffect(() => {
    fetchEmployees();
    fetchShifts();
    fetchWoffs();
  }, []);

  // Fetch holidays when year changes
  useEffect(() => {
    fetchHolidays();
  }, [filters.year]);

  const fetchHolidays = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/holidays?year=${filters.year}`);
      setHolidays(res.data);
    }
    catch (err) { console.error("Error fetching holidays:", err); }
  };

  const fetchShifts = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/shift/master/all`);
      setShifts(res.data);
    }
    catch (err) { console.error("Error fetching shifts:", err); }
  };

  const fetchWoffs = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/woff/all`);
      setWoffs(res.data);
    } catch (err) { console.error("Error fetching woffs:", err); }
  };

  const fetchSchedules = async () => {
    setLoading(true);
    try {
      const startDate = getWeekStartDate();
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 6);

      const startStr = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}-${String(startDate.getDate()).padStart(2, '0')}`;
      const endStr = `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, '0')}-${String(endDate.getDate()).padStart(2, '0')}`;

      console.log('Fetching schedules:', { startDate: startStr, endDate: endStr, empid: filters.empid });
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/shift/schedule/all`, {
        params: { startDate: startStr, endDate: endStr, empid: filters.empid || undefined }
      });
      console.log('Schedules response:', res.data.length, res.data);
      setSchedules(res.data);
    } catch { console.error("Error fetching schedules:"); }
    finally { setLoading(false); }
  };

  const getWeekDates = () => {
    const startDate = getWeekStartDate();
    const weekDates = [];
    const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      weekDates.push({
        date: dateStr,
        day: d.getDate(),
        dayLabel: dayLabels[d.getDay()],
        month: d.getMonth() + 1,
        year: d.getFullYear(),
        isWeekend: d.getDay() === 0
      });
    }
    return weekDates;
  };

  const getDialogWeekDates = () => {
    if (!weekForm.startDate) return [];
    const [y, m, d] = weekForm.startDate.split('-').map(Number);
    const start = new Date(y, m - 1, d);
    const weekDates = [];
    const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      weekDates.push({
        date: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
        day: d.getDate(),
        dayLabel: dayLabels[d.getDay()],
        dayName: ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][d.getDay()]
      });
    }
    return weekDates;
  };

  const getShiftForEmployeeDate = (empid, date, schedulesToUse = schedules) => {
    if (!schedulesToUse || schedulesToUse.length === 0) return null;

    const result = schedulesToUse.find(s => {
      const sEmpId = Number(s.empid);
      const searchEmpId = Number(empid);
      if (sEmpId !== searchEmpId) return false;

      if (!s.shift_date) return false;

      const sDate = new Date(s.shift_date);
      const sDateStr = `${sDate.getFullYear()}-${String(sDate.getMonth() + 1).padStart(2, '0')}-${String(sDate.getDate()).padStart(2, '0')}`;

      return sDateStr === date;
    });

    return result;
  };

  const getHolidayForDate = (date) => {
    return holidays.find(h => {
      if (!h.hdate) return false;
      const hDate = new Date(h.hdate);
      const hDateStr = `${hDate.getFullYear()}-${String(hDate.getMonth() + 1).padStart(2, '0')}-${String(hDate.getDate()).padStart(2, '0')}`;
      return hDateStr === date || h.hdate === date;
    });
  };

  const getCellColor = (schedule, isHoliday, isWeekend) => {
    if (schedule) {
      if (schedule.shift_cd === 'W') return { bg: '#c8e6c9', text: '#2e7d32', label: 'W' };
      if (schedule.shift_cd === 'H') return { bg: '#ffcdd2', text: '#c62828', label: 'H' };
      const colors = { 'G': '#bbdefb', 'A': '#e1bee7', 'B': '#ffe0b2', 'C': '#b2dfdb', '1': '#f8bbd0', '2': '#d1c4e9', '3': '#ffccbc' };
      return { bg: colors[schedule.shift_cd] || '#e3f2fd', text: '#1565c0', label: schedule.shift_cd };
    }
    if (isHoliday) return { bg: '#ffcdd2', text: '#c62828', label: 'H' };
    if (isWeekend) return { bg: '#c8e6c9', text: '#2e7d32', label: 'W' };
    return { bg: '#f5f5f5', text: '#999', label: '-' };
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);

    // Recalculate week offset for the 1st of the selected month
    const targetDate = new Date(parseInt(newFilters.year), parseInt(newFilters.month) - 1, 1);
    setWeekOffset(getOffsetForDate(targetDate));
  };
  const handleWeekShiftChange = (day, shiftCd) => setWeekShifts(prev => ({ ...prev, [day]: shiftCd }));

  const handleKeyDown = (day, e, index) => {
    const key = e.key.toUpperCase();
    const validShifts = ['G', 'A', 'B', 'C', '1', '2', '3', 'W', 'H'];
    if (validShifts.includes(key)) {
      e.preventDefault();
      e.stopPropagation();
      handleWeekShiftChange(day, key);

      // Focus next row
      const nextSelect = document.querySelector(`[data-shift-index="${index + 1}"] div[role="combobox"]`);
      if (nextSelect) {
        setTimeout(() => nextSelect.focus(), 0);
      }
    }
  };

  // Fetch schedules for the bulk matrix dialog's date range
  useEffect(() => {
    if (bulkMatrixDialog && weekForm.startDate) {
      const [y, m, d] = weekForm.startDate.split('-').map(Number);
      const start = new Date(y, m - 1, d);
      const end = new Date(start);
      end.setDate(end.getDate() + 6);

      const startStr = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}-${String(start.getDate()).padStart(2, '0')}`;
      const endStr = `${end.getFullYear()}-${String(end.getMonth() + 1).padStart(2, '0')}-${String(end.getDate()).padStart(2, '0')}`;

      axios.get(`${import.meta.env.VITE_API_URL}/api/shift/schedule/all`, {
        params: { startDate: startStr, endDate: endStr }
      }).then(res => {
        setBulkSchedules(res.data);
      }).catch(err => {
        console.error("Error fetching bulk dialog schedules:", err);
      });
    }
  }, [bulkMatrixDialog, weekForm.startDate]);

  // Auto-populate bulk data based on holidays and woff applications
  useEffect(() => {
    if (bulkMatrixDialog && weekForm.startDate) {
      const combinedSchedules = [...schedules, ...bulkSchedules];
      const initialData = {};
      const existingSet = new Set();
      const weekDates = getDialogWeekDates();
      
      employees.forEach(emp => {
        initialData[emp.empid] = {};
        weekDates.forEach(d => {
          const dateStr = d.date;

          // 1. Check Holiday
          const holiday = getHolidayForDate(dateStr);
          if (holiday) {
            initialData[emp.empid][dateStr] = 'H';
            return;
          }

          // 2. Check Woff (Approved applications)
          const hasWoff = woffs.find(w =>
            Number(w.empid) === Number(emp.empid) &&
            w.status === 'Approved' &&
            dateStr >= (w.woff_from_date?.split('T')[0] || '') &&
            dateStr <= (w.woff_to_date?.split('T')[0] || '')
          );
          if (hasWoff) {
            initialData[emp.empid][dateStr] = 'W';
            return;
          }

          // 3. Check Sunday (Weekly Off)
          if (d.dayName === 'sun') {
            initialData[emp.empid][dateStr] = 'W';
            return;
          }

          // 4. Check existing schedule if any (from both states)
          const existing = getShiftForEmployeeDate(emp.empid, dateStr, combinedSchedules);
          if (existing) {
            initialData[emp.empid][dateStr] = existing.shift_cd;
            existingSet.add(`${emp.empid}|${dateStr}`);
          }
        });
      });
      setBulkData(initialData);
      setExistingShifts(existingSet);
    }
  }, [bulkMatrixDialog, weekForm.startDate, woffs.length, holidays.length, schedules.length, bulkSchedules.length]);

  const handleBulkDataChange = (empid, date, shiftCd) => {
    setExistingShifts(prev => {
      const next = new Set(prev);
      next.delete(`${empid}|${date}`);
      return next;
    });
    setBulkData(prev => ({
      ...prev,
      [empid]: {
        ...(prev[empid] || {}),
        [date]: shiftCd
      }
    }));
  };

  const handleBulkKeyDown = (empid, date, index, empIndex, e) => {
    const key = e.key.toUpperCase();
    const validShifts = ['G', 'A', 'B', 'C', '1', '2', '3', 'W', 'H'];
    if (validShifts.includes(key)) {
      e.preventDefault();
      e.stopPropagation();

      const [y, m, d] = date.split('-').map(Number);
      const dateObj = new Date(y, m - 1, d);
      const isSunday = dateObj.getDay() === 0;
      const holiday = getHolidayForDate(date);
      const isExisting = existingShifts.has(`${empid}|${date}`);
      const existing = isExisting ? getShiftForEmployeeDate(empid, date, [...schedules, ...bulkSchedules]) : null;

      let effectiveShift = key;
      if (isSunday) {
        effectiveShift = 'W';
      } else if (holiday) {
        effectiveShift = 'H';
      } else if (existing) {
        effectiveShift = existing.shift_cd;
      }

      handleBulkDataChange(empid, date, effectiveShift);

      let nextIndex = index + 1;
      let nextEmpIndex = empIndex;
      if (nextIndex > 6) {
        nextIndex = 0;
        nextEmpIndex++;
      }

      const nextSelect = document.querySelector(`[data-bulk-emp="${nextEmpIndex}"][data-bulk-day="${nextIndex}"] div[role="combobox"]`);
      if (nextSelect) {
        setTimeout(() => nextSelect.focus(), 0);
      }
    }
  };

  const handleBulkSave = async () => {
    const schedulesToSave = [];
    Object.keys(bulkData).forEach(empid => {
      Object.keys(bulkData[empid]).forEach(date => {
        const shiftCd = bulkData[empid][date];
        if (shiftCd) {
          const shift = shifts.find(s => s.shift_cd === shiftCd);
          const isSpecial = shiftCd === 'W' || shiftCd === 'H';
          schedulesToSave.push({
            empid: parseInt(empid),
            shift_date: date,
            shift_cd: shiftCd,
            shift_start_time: isSpecial ? null : (shift?.start_time || null),
            shift_end_time: isSpecial ? null : (shift?.end_time || null),
            final_status: 0
          });
        }
      });
    });

    if (schedulesToSave.length === 0) { showToast("No changes to save", "info"); return; }
    
    setSaving(true);
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/shift/schedule/save-bulk`, schedulesToSave);
      showToast(`✅ Successfully saved ${schedulesToSave.length} shift assignments`, "success");
      setBulkMatrixDialog(false);
      setBulkData({});
      setExistingShifts(new Set());
      setBulkSchedules([]);
      fetchSchedules();
    } catch (err) {
      console.error("Error saving bulk schedules:", err);
      showToast("❌ Error saving bulk schedules", "error");
    } finally {
      setSaving(false);
    }
  };

  const fillAllDays = (shiftCd) => {
    if (!shiftCd) return;
    setWeekShifts({ sun: shiftCd, mon: shiftCd, tue: shiftCd, wed: shiftCd, thu: shiftCd, fri: shiftCd, sat: shiftCd });
  };

  const fillBulkColumn = (dateStr, shiftCd) => {
    if (!shiftCd) return;
    // If regular shift and Sunday, use W (Weekly Off)
    if (['G', 'A', 'B', 'C', '1', '2', '3'].includes(shiftCd)) {
      const [y, m, d] = dateStr.split('-').map(Number);
      const dateObj = new Date(y, m - 1, d);
      if (dateObj.getDay() === 0) {
        shiftCd = 'W';
      }
    }
    setBulkData(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(empid => {
        if (!updated[empid][dateStr]) {
          updated[empid] = { ...updated[empid], [dateStr]: shiftCd };
        }
      });
      return updated;
    });
  };

  const clearAllBulkData = () => {
    setBulkData(prev => {
      const updated = {};
      Object.keys(prev).forEach(empid => {
        updated[empid] = {};
        Object.keys(prev[empid]).forEach(date => {
          updated[empid][date] = '';
        });
      });
      return updated;
    });
  };

  const handleSave = async () => {
    if (!formData.empid || !formData.shift_date || !formData.shift_cd) { showToast("Please fill all required fields", "error"); return; }
    try {
      const selectedShift = shifts.find(s => s.shift_cd === formData.shift_cd);
      const scheduleData = { empid: parseInt(formData.empid), shift_date: formData.shift_date, shift_cd: formData.shift_cd, shift_start_time: selectedShift?.start_time || null, shift_end_time: selectedShift?.end_time || null, final_status: 0 };
      console.log('Saving:', scheduleData);
      await axios.post(`${import.meta.env.VITE_API_URL}/api/shift/schedule/save`, scheduleData);
      showToast("✅ Schedule saved successfully", "success");
      setDialog(false); setFormData({ empid: "", shift_date: new Date().toISOString().split('T')[0], shift_cd: "" });
      fetchSchedules();
    } catch { showToast("❌ Error saving schedule", "error"); }
  };

  const handleWeekAssign = async () => {
    if (!weekForm.startDate) { showToast("Please select a start date for the week", "error"); return; }
    if (!Object.values(weekShifts).some(v => v)) { showToast("Please assign at least one shift for the week", "error"); return; }
    try {
      const targetEmployees = weekForm.selectAll ? employees : employees.filter(e => weekForm.employeeIds.includes(e.empid));
      if (targetEmployees.length === 0) { showToast("Please select at least one employee", "error"); return; }
      const schedulesToSave = [];
      const dialogWeekDates = getDialogWeekDates();
      for (const emp of targetEmployees) {
        for (const dayInfo of dialogWeekDates) {
          const dayShift = weekShifts[dayInfo.dayName];
          if (dayShift) {
            const shift = shifts.find(s => s.shift_cd === dayShift);
            const isSpecial = dayShift === 'W' || dayShift === 'H';
            schedulesToSave.push({ empid: emp.empid, shift_date: dayInfo.date, shift_cd: dayShift, shift_start_time: isSpecial ? null : (shift?.start_time || null), shift_end_time: isSpecial ? null : (shift?.end_time || null), final_status: 0 });
          }
        }
      }
      if (schedulesToSave.length > 0) {
        await axios.post(`${import.meta.env.VITE_API_URL}/api/shift/schedule/save-bulk`, schedulesToSave);
        showToast(`✅ Assigned shifts to ${targetEmployees.length} employees for the week`, "success");
      }
      setWeekAssignDialog(false); setWeekForm({ startDate: "", selectAll: true, employeeIds: [] }); setWeekShifts({ sun: "", mon: "", tue: "", wed: "", thu: "", fri: "", sat: "" }); setEmpSearch(""); fetchSchedules();
    } catch (err) { showToast(`❌ Error: ${err.response?.data?.message || err.message}`, "error"); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this schedule?")) return;
    try { await axios.delete(`${import.meta.env.VITE_API_URL}/api/shift/schedule/${id}`); showToast("✅ Schedule deleted", "success"); fetchSchedules(); }
    catch { showToast("❌ Error deleting schedule", "error"); }
  };

  const months = [{ value: 1, label: "January" }, { value: 2, label: "February" }, { value: 3, label: "March" }, { value: 4, label: "April" }, { value: 5, label: "May" }, { value: 6, label: "June" }, { value: 7, label: "July" }, { value: 8, label: "August" }, { value: 9, label: "September" }, { value: 10, label: "October" }, { value: 11, label: "November" }, { value: 12, label: "December" }];

  const startDate = getWeekStartDate();
  const weekDates = getWeekDates();
  console.log('Week dates:', weekDates.map(d => d.date), 'Schedules:', schedules.length, 'Employees:', employees.length);

  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 6);
  const weekRangeText = `${formatDateOnly(startDate)} to ${formatDateOnly(endDate)}`;

  const filteredEmployees = filters.empid ? employees.filter(e => e.empid === parseInt(filters.empid)) : employees;
  console.log('Filtered employees:', filteredEmployees.length);
  const dialogFilteredEmployees = empSearch ? employees.filter(emp => emp.empid.toString().includes(empSearch) || emp.ename?.toLowerCase().includes(empSearch.toLowerCase())) : employees;
  const selectedEmpIds = weekForm.employeeIds;

  // Fetch schedules when dependencies change
  useEffect(() => {
    fetchSchedules();
  }, [filters.empid, filters.month, filters.year, weekOffset, employees.length]);

  const handlePrevWeek = () => setWeekOffset(weekOffset - 1);
  const handleNextWeek = () => setWeekOffset(weekOffset + 1);

  return (
    <Card sx={{ m: 2 }}>
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee' }}>
        <Typography variant="h6">Shift Schedule</Typography>
        <Box>
          <Button variant="contained" color="secondary" startIcon={<ViewWeekIcon />} onClick={() => {
            if (!weekForm.startDate) {
              const start = getWeekStartDate();
              setWeekForm({...weekForm, startDate: `${start.getFullYear()}-${String(start.getMonth()+1).padStart(2,'0')}-${String(start.getDate()).padStart(2,'0')}`});
            }
            setBulkMatrixDialog(true);
          }} sx={{ mr: 1 }}>Bulk Matrix Entry</Button>
          <Button variant="contained" startIcon={<PlaylistAddIcon />} onClick={() => setWeekAssignDialog(true)} sx={{ mr: 1 }}>Assign Week</Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialog(true)}>Single Entry</Button>
        </Box>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={viewMode} onChange={(e, v) => setViewMode(v)}>
          <Tab icon={<ViewWeekIcon />} label="Matrix View" />
          <Tab icon={<ListIcon />} label="List View" />
        </Tabs>
      </Box>

      <CardContent>
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={2}>
            <FormControl fullWidth size="small"><InputLabel>Month</InputLabel>
              <Select name="month" value={filters.month} onChange={handleFilterChange} label="Month">{months.map(m => <MenuItem key={m.value} value={m.value}>{m.label}</MenuItem>)}</Select>
            </FormControl>
          </Grid>
          <Grid item xs={2}><TextField fullWidth size="small" label="Year" name="year" type="number" value={filters.year} onChange={handleFilterChange} /></Grid>
          <Grid item xs={3}>
            <FormControl fullWidth size="small"><InputLabel>Employee</InputLabel>
              <Select name="empid" value={filters.empid} onChange={handleFilterChange} label="Employee" displayEmpty>
                <MenuItem value="">All Employees</MenuItem>
                {employees.map(emp => <MenuItem key={emp.empid} value={emp.empid}>{emp.empid} - {emp.ename}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={5} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
            <IconButton onClick={handlePrevWeek}><NavigateBeforeIcon /></IconButton>
            <Typography variant="body2" sx={{ minWidth: 180, textAlign: 'center' }}>{weekRangeText}</Typography>
            <IconButton onClick={handleNextWeek}><NavigateNextIcon /></IconButton>
          </Grid>
        </Grid>

        {loading && <LinearProgress sx={{ mb: 2 }} />}

        {viewMode === 0 && (
          <Table size="small" sx={{ border: '1px solid #ccc' }}>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#e3f2fd' }}>
                <TableCell sx={{ width: 150 }}><strong>Employee</strong></TableCell>
                {weekDates.map((d, i) => (
                  <TableCell key={i} align="center" sx={{ minWidth: 80, bgcolor: d.month !== parseInt(filters.month) ? '#ffecb3' : 'inherit' }}>
                    <strong>{d.dayLabel}</strong><br /><small>{d.day}</small>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredEmployees.length === 0 ? (
                <TableRow><TableCell colSpan={8} align="center" sx={{ py: 3, color: '#777' }}>No employees found</TableCell></TableRow>
              ) : (
                <React.Fragment>
                  {filteredEmployees.map(emp => (
                    <TableRow key={emp.empid}>
                      <TableCell><Typography variant="body2">{emp.empid}</Typography><Typography variant="caption" color="textSecondary">{emp.ename}</Typography></TableCell>
                      {weekDates.map((d, i) => {
                        const holiday = getHolidayForDate(d.date);
                        const schedule = getShiftForEmployeeDate(emp.empid, d.date);
                        const color = getCellColor(schedule, !!holiday, d.isWeekend);
                        return (
                          <TableCell key={i} sx={{ bgcolor: d.month !== parseInt(filters.month) ? '#fff3e0' : color.bg, textAlign: 'center', cursor: schedule ? 'pointer' : 'default' }} onClick={() => schedule && handleDelete(schedule.id)}>
                            <Typography variant="body2" sx={{ color: color.text, fontWeight: 'bold', fontSize: 12 }}>{color.label}</Typography>
                            {holiday && !schedule && <Typography variant="caption" sx={{ color: color.text, fontSize: 9 }}>{holiday.hdesc}</Typography>}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}
                </React.Fragment>
              )}
            </TableBody>
          </Table>
        )}

        {viewMode === 1 && (
          <Table size="small" sx={{ border: '1px solid #ccc' }}>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell><strong>Date</strong></TableCell><TableCell><strong>Day</strong></TableCell><TableCell><strong>Emp ID</strong></TableCell><TableCell><strong>Name</strong></TableCell><TableCell><strong>Shift</strong></TableCell><TableCell><strong>Start</strong></TableCell><TableCell><strong>End</strong></TableCell><TableCell><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {schedules.length === 0 ? (
                <TableRow><TableCell colSpan={8} align="center" sx={{ py: 3, color: '#777' }}>No schedules found</TableCell></TableRow>
              ) : (
                schedules.map(s => {
                  const dateObj = s.shift_date ? new Date(s.shift_date) : null;
                  const dayName = dateObj ? ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dateObj.getDay()] : '-';
                  return (
                    <TableRow key={s.id}>
                      <TableCell>{formatDateOnly(s.shift_date)}</TableCell><TableCell>{dayName}</TableCell><TableCell>{s.empid}</TableCell><TableCell>{s.employee?.ename || '-'}</TableCell><TableCell><strong>{s.shift_cd}</strong></TableCell><TableCell>{formatTimeOnly(s.shift_start_time)}</TableCell><TableCell>{formatTimeOnly(s.shift_end_time)}</TableCell>
                      <TableCell><IconButton size="small" color="error" onClick={() => handleDelete(s.id)}><DeleteIcon fontSize="small" /></IconButton></TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        )}

        <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Chip label="W (Weekly Off)" sx={{ bgcolor: '#c8e6c9', color: '#2e7d32' }} size="small" />
          <Chip label="H (Holiday)" sx={{ bgcolor: '#ffcdd2', color: '#c62828' }} size="small" />
          {shifts.map(s => <Chip key={s.shift_cd} label={`${s.shift_cd}`} size="small" />)}
        </Box>
      </CardContent>

      {/* Single Assignment Dialog */}
      <Dialog open={dialog} onClose={() => setDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Assign Shift to Employee</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={6}><FormControl fullWidth size="small"><InputLabel>Employee</InputLabel><Select name="empid" value={formData.empid} onChange={handleChange} label="Employee"><MenuItem value=""><em>Select Employee</em></MenuItem>{employees.map(emp => <MenuItem key={emp.empid} value={emp.empid}>{emp.empid} - {emp.ename}</MenuItem>)}</Select></FormControl></Grid>
            <Grid item xs={6}><TextField fullWidth size="small" label="Date" type="date" name="shift_date" InputLabelProps={{ shrink: true }} value={formData.shift_date} onChange={handleChange} /></Grid>
            <Grid item xs={12}><FormControl fullWidth size="small"><InputLabel>Shift</InputLabel><Select name="shift_cd" value={formData.shift_cd} onChange={handleChange} label="Shift"><MenuItem value=""><em>Select Shift</em></MenuItem>{shifts.map(s => <MenuItem key={s.shift_id} value={s.shift_cd}>{s.shift_cd} ({formatTimeOnly(s.start_time)} - {formatTimeOnly(s.end_time)})</MenuItem>)}</Select></FormControl></Grid>
          </Grid>
        </DialogContent>
        <DialogActions><Button onClick={() => setDialog(false)}>Cancel</Button><Button variant="contained" startIcon={<SaveIcon />} onClick={handleSave}>Save</Button></DialogActions>
      </Dialog>

      {/* Week Assignment Dialog */}
      <Dialog open={weekAssignDialog} onClose={() => setWeekAssignDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Assign Weekly Shift Schedule</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}><TextField fullWidth size="small" label="Week Starting Date" type="date" InputLabelProps={{ shrink: true }} value={weekForm.startDate} onChange={(e) => setWeekForm({ ...weekForm, startDate: e.target.value })} helperText="Shift will be assigned for 7 days starting from this date" /></Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>Quick Fill:</Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                <Button size="small" variant="contained" sx={{ bgcolor: '#bbdefb' }} onClick={() => fillAllDays('G')}>G</Button>
                <Button size="small" variant="contained" sx={{ bgcolor: '#e1bee7' }} onClick={() => fillAllDays('A')}>A</Button>
                <Button size="small" variant="contained" sx={{ bgcolor: '#ffe0b2' }} onClick={() => fillAllDays('B')}>B</Button>
                <Button size="small" variant="contained" sx={{ bgcolor: '#b2dfdb' }} onClick={() => fillAllDays('C')}>C</Button>
                <Button size="small" variant="contained" sx={{ bgcolor: '#f8bbd0' }} onClick={() => fillAllDays('1')}>1</Button>
                <Button size="small" variant="contained" sx={{ bgcolor: '#d1c4e9' }} onClick={() => fillAllDays('2')}>2</Button>
                <Button size="small" variant="contained" sx={{ bgcolor: '#c8e6c9', color: '#2e7d32' }} onClick={() => fillAllDays('W')}>W (Woff)</Button>
                <Button size="small" variant="contained" sx={{ bgcolor: '#ffcdd2', color: '#c62828' }} onClick={() => fillAllDays('H')}>H (Holiday)</Button>
                <Button size="small" variant="outlined" startIcon={<ClearIcon />} onClick={() => setWeekShifts({ sun: "", mon: "", tue: "", wed: "", thu: "", fri: "", sat: "" })}>Clear</Button>
              </Box>

              <Table size="small" sx={{ border: '1px solid #ddd' }}>
                <TableHead sx={{ backgroundColor: '#f5f5f5' }}><TableRow><TableCell><strong>Day</strong></TableCell><TableCell><strong>Date</strong></TableCell><TableCell><strong>Shift</strong></TableCell></TableRow></TableHead>
                <TableBody>
                  {getDialogWeekDates().map((d, index) => (
                    <TableRow key={d.dayName}>
                      <TableCell><strong>{d.dayLabel}</strong></TableCell><TableCell>{formatDateOnly(d.date)}</TableCell>
                      <TableCell>
                        <FormControl size="small" fullWidth data-shift-index={index}>
                          <Select
                            value={weekShifts[d.dayName]}
                            onChange={(e) => handleWeekShiftChange(d.dayName, e.target.value)}
                            onKeyDownCapture={(e) => handleKeyDown(d.dayName, e, index)}
                            displayEmpty
                          >
                            <MenuItem value="">- Select -</MenuItem>
                            <MenuItem value="G" sx={{ bgcolor: '#bbdefb' }}>G (General)</MenuItem>
                            <MenuItem value="A" sx={{ bgcolor: '#e1bee7' }}>A</MenuItem>
                            <MenuItem value="B" sx={{ bgcolor: '#ffe0b2' }}>B</MenuItem>
                            <MenuItem value="C" sx={{ bgcolor: '#b2dfdb' }}>C</MenuItem>
                            <MenuItem value="1" sx={{ bgcolor: '#f8bbd0' }}>1</MenuItem>
                            <MenuItem value="2" sx={{ bgcolor: '#d1c4e9' }}>2</MenuItem>
                            <MenuItem value="3" sx={{ bgcolor: '#ffccbc' }}>3</MenuItem>
                            <MenuItem value="W" sx={{ bgcolor: '#c8e6c9', fontWeight: 'bold' }}>W (Weekly Off)</MenuItem>
                            <MenuItem value="H" sx={{ bgcolor: '#ffcdd2', fontWeight: 'bold' }}>H (Holiday)</MenuItem>
                          </Select>
                        </FormControl>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel control={<Checkbox checked={weekForm.selectAll} onChange={(e) => setWeekForm({ ...weekForm, selectAll: e.target.checked, employeeIds: [] })} />} label="Assign to ALL employees" />
              {!weekForm.selectAll && (
                <Box sx={{ mt: 1 }}>
                  <TextField size="small" placeholder="Search by ID or Name..." sx={{ width: 220 }} value={empSearch} onChange={(e) => setEmpSearch(e.target.value)} InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }} />
                  <Button size="small" variant="text" onClick={() => setWeekForm(prev => ({ ...prev, employeeIds: dialogFilteredEmployees.map(e => e.empid) }))}>Select All</Button>
                  <Button size="small" variant="text" onClick={() => setWeekForm(prev => ({ ...prev, employeeIds: [] }))}>Clear</Button>
                  <Typography variant="caption" sx={{ ml: 1 }}>Selected: {weekForm.employeeIds.length}</Typography>
                  <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                    <Box sx={{ flex: 1, maxHeight: 200, overflow: 'auto', border: '1px solid #ddd', borderRadius: 1 }}>
                      <Box sx={{ p: 1, bgcolor: '#f5f5f5', borderBottom: '1px solid #ddd' }}><Typography variant="caption" fontWeight="bold">Available ({dialogFilteredEmployees.length})</Typography></Box>
                      {dialogFilteredEmployees.map(emp => <Box key={emp.empid} sx={{ p: 1, cursor: 'pointer', '&:hover': { bgcolor: '#e3f2fd' } }} onClick={() => setWeekForm(prev => ({ ...prev, employeeIds: prev.employeeIds.includes(emp.empid) ? prev.employeeIds : [...prev.employeeIds, emp.empid] }))}><Checkbox size="small" checked={weekForm.employeeIds.includes(emp.empid)} /><strong>{emp.empid}</strong> - {emp.ename}</Box>)}
                    </Box>
                    <Box sx={{ flex: 1, maxHeight: 200, overflow: 'auto', border: '1px solid #ddd', borderRadius: 1, bgcolor: '#fafafa' }}>
                      <Box sx={{ p: 1, bgcolor: '#e3f2fd', borderBottom: '1px solid #ddd' }}><Typography variant="caption" fontWeight="bold">Selected ({selectedEmpIds.length})</Typography></Box>
                      {selectedEmpIds.length === 0 ? <Typography variant="body2" sx={{ p: 2, color: 'text.secondary' }}>Click to select</Typography> : selectedEmpIds.map(empId => { const emp = employees.find(e => e.empid === empId); return emp ? <Box key={emp.empid} sx={{ p: 1, cursor: 'pointer', '&:hover': { bgcolor: '#ffcdd2' } }} onClick={() => setWeekForm(prev => ({ ...prev, employeeIds: prev.employeeIds.filter(id => id !== emp.empid) }))}><Checkbox size="small" checked /><strong>{emp.empid}</strong> - {emp.ename}</Box> : null; })}
                    </Box>
                  </Box>
                </Box>
              )}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions><Button onClick={() => setWeekAssignDialog(false)}>Cancel</Button><Button variant="contained" startIcon={<SaveIcon />} onClick={handleWeekAssign}>Assign {weekForm.selectAll ? 'All' : `${weekForm.employeeIds.length}`} Employees</Button></DialogActions>
      </Dialog>
      {/* Bulk Matrix Entry Dialog */}
      <Dialog open={bulkMatrixDialog} onClose={() => { if (bulkMatrixDialog) { setBulkMatrixDialog(false); setBulkData({}); setExistingShifts(new Set()); setBulkSchedules([]); } }} maxWidth="lg" fullWidth>
        <DialogTitle sx={{ bgcolor: '#f5f5f5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" fontWeight="bold">Bulk Shift Matrix Entry</Typography>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <TextField size="small" type="date" label="Start Date" InputLabelProps={{ shrink: true }} value={weekForm.startDate} onChange={(e) => setWeekForm({ ...weekForm, startDate: e.target.value })} />
            <TextField size="small" placeholder="Search employee..." value={empSearch} onChange={(e) => setEmpSearch(e.target.value)} />
          </Box>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 0, maxHeight: '70vh' }}>
          {!weekForm.startDate && (
            <Typography align="center" sx={{ py: 6, color: '#999' }}>Select a start date to begin.</Typography>
          )}

          {weekForm.startDate && (
            <>
              {/* Quick Actions Toolbar */}
              <Box sx={{ mb: 0, p: 1.5, bgcolor: '#e3f2fd', borderBottom: '1px solid #bbdefb', display: 'flex', flexWrap: 'wrap', gap: 1.5, alignItems: 'center' }}>
                <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#1565c0', mr: 1 }}>⚡ Quick Fill:</Typography>
                {shifts.map((sh) => (
                  <Button key={sh.shift_cd} size="small" variant="outlined" color="primary" onClick={() => {
                    getDialogWeekDates().forEach(d => fillBulkColumn(d.date, sh.shift_cd));
                  }}>
                    All {sh.shift_cd} ({sh.shift_name})
                  </Button>
                ))}
                <Button size="small" variant="outlined" color="success" onClick={() => getDialogWeekDates().forEach(d => fillBulkColumn(d.date, 'W'))}>
                  All Weekly Off
                </Button>
                <Button size="small" variant="outlined" color="error" onClick={() => getDialogWeekDates().forEach(d => fillBulkColumn(d.date, 'H'))}>
                  All Holiday
                </Button>
                <Button size="small" variant="text" color="inherit" onClick={clearAllBulkData}>
                  Clear All
                </Button>
              </Box>

              {/* Summary */}
              <Box sx={{ p: 1.5, bgcolor: '#f5f5f5', borderBottom: '1px solid #e0e0e0', display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                  Employees: {dialogFilteredEmployees.length}
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#2e7d32' }}>
                  Existing Schedules: {existingShifts.size} <span style={{ fontSize: '0.7rem' }}>🟢 = pre-existing</span>
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                  Week of: {weekForm.startDate}
                </Typography>
                <Box sx={{ ml: 'auto' }}>
                  <Typography variant="caption" sx={{ color: '#666' }}>
                    Tip: Type shift code (G, A, B, C, 1, 2, 3, W, H) for fast entry. Focus auto-moves to next cell.
                  </Typography>
                </Box>
              </Box>

              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ minWidth: 220, bgcolor: '#e3f2fd', fontWeight: 'bold', position: 'sticky', top: 0 }}>Employee</TableCell>
                    {getDialogWeekDates().map((d, idx) => (
                      <TableCell key={idx} align="center" sx={{ bgcolor: '#e3f2fd', minWidth: 100, position: 'sticky', top: 0 }}>
                        <strong>{d.dayLabel}</strong><br /><small>{formatDateOnly(d.date)}</small>
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {dialogFilteredEmployees.map((emp, empIdx) => (
                    <TableRow key={emp.empid} hover>
                      <TableCell sx={{ fontWeight: 'bold' }}>
                        {emp.empid}<br /><Typography variant="caption" color="textSecondary">{emp.ename}</Typography>
                      </TableCell>
                      {getDialogWeekDates().map((d, dayIdx) => {
                        const hasExisting = existingShifts.has(`${emp.empid}|${d.date}`);
                        const cellValue = bulkData[emp.empid]?.[d.date] || "";
                        return (
                          <TableCell key={dayIdx} sx={{ p: '2px' }}>
                            <FormControl size="small" fullWidth data-bulk-emp={empIdx} data-bulk-day={dayIdx}>
                              <Select
                                value={cellValue}
                                onChange={(e) => handleBulkDataChange(emp.empid, d.date, e.target.value)}
                                onKeyDownCapture={(e) => handleBulkKeyDown(emp.empid, d.date, dayIdx, empIdx, e)}
                                displayEmpty
                                sx={{ 
                                  fontSize: '0.8rem',
                                  bgcolor: hasExisting
                                    ? '#e8f5e9'
                                    : cellValue === 'W' ? '#c8e6c9' :
                                      cellValue === 'H' ? '#ffcdd2' : 'inherit',
                                  border: hasExisting ? '2px solid #4caf50' : '1px solid transparent',
                                  fontWeight: hasExisting ? 'bold' : 'normal',
                                }}
                              >
                                <MenuItem value="">-</MenuItem>
                                <MenuItem value="G" sx={{ bgcolor: '#bbdefb' }}>G</MenuItem>
                                <MenuItem value="A" sx={{ bgcolor: '#e1bee7' }}>A</MenuItem>
                                <MenuItem value="B" sx={{ bgcolor: '#ffe0b2' }}>B</MenuItem>
                                <MenuItem value="C" sx={{ bgcolor: '#b2dfdb' }}>C</MenuItem>
                                <MenuItem value="1" sx={{ bgcolor: '#f8bbd0' }}>1</MenuItem>
                                <MenuItem value="2" sx={{ bgcolor: '#d1c4e9' }}>2</MenuItem>
                                <MenuItem value="3" sx={{ bgcolor: '#ffccbc' }}>3</MenuItem>
                                <MenuItem value="W" sx={{ bgcolor: '#c8e6c9' }}>W</MenuItem>
                                <MenuItem value="H" sx={{ bgcolor: '#ffcdd2' }}>H</MenuItem>
                              </Select>
                            </FormControl>
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, bgcolor: '#f5f5f5', justifyContent: 'space-between' }}>
          <Typography variant="body2" sx={{ color: '#666' }}>
            {existingShifts.size > 0 && `${existingShifts.size} existing schedule(s) highlighted in green`}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button onClick={() => { setBulkMatrixDialog(false); setBulkData({}); setExistingShifts(new Set()); setBulkSchedules([]); }} disabled={saving}>Cancel</Button>
            <Button variant="contained" color="primary" startIcon={<SaveIcon />} onClick={handleBulkSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save All Changes'}
            </Button>
          </Box>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default ShiftSchedule;
