import React, { useState, useEffect, useRef } from "react";
import {
  Grid,
  Paper,
  TextField,
  Select,
  MenuItem,
  IconButton,
  Button,
  Typography,
  FormControl,
  InputLabel,
  Box,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import { useToast } from "../../../context/ToastContext";
import axios from "axios";
import { InputAdornment } from "@mui/material";

const LeaveGrid = ({ leaveDetails, setLeaveDetails, totalDays, onValidationError, onSave, isSaveDisabled, empId, onDirty, minDateLimit, maxDateLimit }) => {
  const { showToast } = useToast();
  const getBlankRow = () => ({
    dayType: "FULL DAY",
    fromDate: "",
    toDate: "",
    noOfDays: "",
    remarks: "",
  });
  const [rows, setRows] = useState(() => [getBlankRow()]);
  const [overlapIndexes, setOverlapIndexes] = useState([]);

  const isRowValid = (row) => row.dayType && row.fromDate && row.toDate;
  const isRowEdited = (row) =>
    row.fromDate || row.toDate || row.noOfDays || row.remarks;

  const addRow = () => {
    if (rows.length >= 5) {
      showToast("Only 5 rows allowed in Leave Application", "error");
      return;
    }
    const lastRow = rows[rows.length - 1];
    if (!isRowValid(lastRow)) {
      showToast("Please fill the current row before adding a new one.", "error");
      return;
    }
    if (onDirty) onDirty();
    setRows((prev) => [...prev, getBlankRow()]);
  };

  const resetRow = (index) => {
    const updated = [...rows];
    updated[index] = getBlankRow();
    setRows(updated);
    if (onDirty) onDirty();
    showToast("Row reset", "info");
  };

  const deleteRow = (index) => {
    const updated = rows.filter((_, i) => i !== index);
    if (!updated.length) updated.push(getBlankRow());
    setRows(updated);
    if (onDirty) onDirty();
    showToast("Row deleted", "error");
  };

  const updateRow = async (index, field, value) => {
    let newValue = value;
    if (["fromDate", "toDate"].includes(field) && value && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
      const parts = value.split("-");
      let y = parts[0] || "";
      if (y.length > 4) y = y.slice(-4);
      if (y.startsWith("00") && y.length === 4) y = "20" + y.slice(2);
      else if (y.length === 2) y = "20" + y;
      else if (y.length === 1) y = "200" + y;
      y = y.padStart(4, "0").slice(-4);
      if (y !== parts[0]) {
        parts[0] = y;
        newValue = parts.join("-");
      }
    }
    if (onDirty) onDirty();
    setRows(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: newValue };
      const row = updated[index];
      const from = row.fromDate ? new Date(row.fromDate + "T00:00:00") : new Date(NaN);
      const to = row.toDate ? new Date(row.toDate + "T00:00:00") : new Date(NaN);
      if (row.fromDate && row.toDate && !isNaN(from) && !isNaN(to) && from > to) {
        updated[index].toDate = "";
        updated[index].noOfDays = "";
      } else if (["fromDate", "toDate", "dayType"].includes(field)) {
        if (!isNaN(from) && !isNaN(to) && from <= to) {
          let diff = Math.ceil((to - from) / (1000 * 60 * 60 * 24)) + 1;
          if (row.dayType === "HALF DAY") diff *= 0.5;
          updated[index].noOfDays = diff;
        } else {
          updated[index].noOfDays = "";
        }
      }
      return updated;
    });
    if (!["fromDate", "toDate"].includes(field) || !newValue || !/^\d{4}-\d{2}-\d{2}$/.test(newValue)) return;
    const updated = [...rows];
    updated[index][field] = newValue;

    if (["fromDate", "toDate"].includes(field) && newValue && /^\d{4}-\d{2}-\d{2}$/.test(newValue)) {
      const selectedDate = new Date(newValue + "T00:00:00");
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const curYear = new Date().getFullYear();
      const yNum = parseInt(newValue.split("-")[0], 10);
      if (yNum < curYear || yNum > curYear + 1) {
        showToast(`Year must be ${curYear} or ${curYear + 1} only`, "error");
        updated[index][field] = "";
        updated[index].noOfDays = "";
        setRows(updated);
        return;
      }

      if (minDateLimit && newValue < minDateLimit) {
        const fmt = (s) => s ? s.split('-').reverse().join('-') : "";
        showToast(`Cannot apply leave before ${fmt(minDateLimit)} (Payroll processed).`, "error");
        updated[index][field] = "";
        setRows(updated);
        return;
      }

      if (maxDateLimit && newValue > maxDateLimit) {
        const fmt = (s) => s ? s.split('-').reverse().join('-') : "";
        showToast(`Cannot apply leave after ${fmt(maxDateLimit)}.`, "error");
        updated[index][field] = "";
        setRows(updated);
        return;
      }

      // 3. Payslip Validation
      if (empId) {
        try {
          const year = selectedDate.getFullYear();
          const month = selectedDate.getMonth() + 1;
          const res = await axios.get(`/api/payroll/check-status`, {
            params: { empid: empId, year, month }
          });
          if (res.data.generated) {
            showToast(`Payslip already generated for ${selectedDate.toLocaleString('default', { month: 'long' })} ${year}. Cannot apply leave.`, "error");
            updated[index][field] = "";
            setRows(updated);
            return;
          }
        } catch (error) {
          console.error("Error checking payslip status", error);
        }
      }

      // 4. Database Overlap Check
      if (empId && updated[index].fromDate && updated[index].toDate) {
        try {
          const overlapRes = await axios.post(`/api/leave/check-overlap`, {
            empid: empId, 
            fromDate: updated[index].fromDate, 
            toDate: updated[index].toDate 
          });
          if (overlapRes.data.overlap) {
            showToast(`Leave already exists for ${new Date(overlapRes.data.overlapDate).toLocaleDateString('en-GB').replace(/\//g, '-')} (Application #${overlapRes.data.lno})`, "error");
            updated[index][field] = "";
            setRows(updated);
            return;
          }
        } catch (error) {
          console.error("Error checking database overlap", error);
        }
      }
    }

    const row = updated[index];
    const from = row.fromDate && /^\d{4}-\d{2}-\d{2}$/.test(row.fromDate) ? new Date(row.fromDate + "T00:00:00") : new Date(NaN);
    const to = row.toDate && /^\d{4}-\d{2}-\d{2}$/.test(row.toDate) ? new Date(row.toDate + "T00:00:00") : new Date(NaN);

    if (false && row.fromDate && row.toDate && from > to) {
      showToast("To Date cannot be before From Date!", "error");
      updated[index].toDate = "";
      updated[index].noOfDays = "";
    } else if (["fromDate", "toDate", "dayType"].includes(field)) {
      if (!isNaN(from) && !isNaN(to) && from <= to) {
        let diff = Math.ceil((to - from) / (1000 * 60 * 60 * 24)) + 1;
        if (row.dayType === "HALF DAY") diff *= 0.5;
        updated[index].noOfDays = diff;
      } else {
        updated[index].noOfDays = "";
      }
    }

    setRows(updated);
  };

  const handleBlur = (index) => {
    const row = rows[index];
    if (!row.fromDate || !row.toDate) return;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(row.fromDate) || !/^\d{4}-\d{2}-\d{2}$/.test(row.toDate)) return;
    const from = new Date(row.fromDate + "T00:00:00");
    const to = new Date(row.toDate + "T00:00:00");
    if (!isNaN(from) && !isNaN(to) && from > to) {
      showToast("To Date cannot be before From Date!", "error");
    }
  };

  useEffect(() => {
    setLeaveDetails(rows);
    const indexes = [];
    for (let i = 0; i < rows.length; i++) {
      for (let j = i + 1; j < rows.length; j++) {
        if (rows[i].fromDate && rows[i].toDate && rows[j].fromDate && rows[j].toDate) {
          const fromA = new Date(rows[i].fromDate + "T00:00:00");
          const toA = new Date(rows[i].toDate + "T00:00:00");
          const fromB = new Date(rows[j].fromDate + "T00:00:00");
          const toB = new Date(rows[j].toDate + "T00:00:00");
          if (fromA <= toB && toA >= fromB) {
            indexes.push(i, j);
          }
        }
      }
    }
    setOverlapIndexes([...new Set(indexes)]);
    if (onValidationError) onValidationError(indexes.length > 0);

    // Re-validate all rows against DB when empId changes
    const checkAllOverlaps = async () => {
      if (!empId) return;
      for (let i = 0; i < rows.length; i++) {
        const r = rows[i];
        if (r.fromDate && r.toDate) {
          try {
            const res = await axios.post(`/api/leave/check-overlap`, {
              empid: empId, fromDate: r.fromDate, toDate: r.toDate
            });
            if (res.data.overlap) {
              showToast(`Row ${i+1}: Leave already exists for ${new Date(res.data.overlapDate).toLocaleDateString('en-GB').replace(/\//g, '-')} (#${res.data.lno})`, "error");
              const updated = [...rows];
              updated[i].fromDate = "";
              updated[i].toDate = "";
              updated[i].noOfDays = "";
              setRows(updated);
            }
          } catch (err) {}
        }
      }
    };
    checkAllOverlaps();
  }, [rows, empId]);

  return (
    <Box sx={{ mt: 1 }}>
      {rows.map((row, i) => (
        <Paper
          key={i}
          sx={{
            p: 1.2,
            mb: 1.2,
            border: overlapIndexes.includes(i) ? "1.5px solid #ef4444" : "1px solid #e2e8f0",
            borderRadius: '12px',
            bgcolor: overlapIndexes.includes(i) ? '#fef2f2' : '#ffffff',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
            transition:'all 0.2s',
            '&:hover':{ boxShadow:'0 4px 12px rgba(0,0,0,0.08)', borderColor: overlapIndexes.includes(i) ? '#ef4444' : '#cbd5e1' }
          }}
        >
          <Grid container spacing={1} alignItems="center" sx={{ flexWrap: "wrap" }}>
            <Grid item xs={12} sm={6} md={0.5} sx={{ display:'flex', justifyContent:'center' }}>
              <Box sx={{ width:28, height:28, borderRadius:'50%', bgcolor: isRowEdited(row) ? 'primary.main' : '#f1f5f9', color: isRowEdited(row) ? '#fff' : '#64748b', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:12, border: overlapIndexes.includes(i) ? '2px solid #ef4444' : '1px solid #e2e8f0' }}>{i + 1}</Box>
            </Grid>

            <Grid item xs={12} sm={6} md={1.2}>
              <FormControl size="small" fullWidth sx={{ '& .MuiOutlinedInput-root':{borderRadius:'10px', bgcolor:'#fff'} }}>
                <InputLabel>Day Type</InputLabel>
                <Select
                  fullWidth
                  label="Day Type"
                  size="small"
                  value={row.dayType}
                  onChange={(e) => updateRow(i, "dayType", e.target.value)}
                  sx={{ borderRadius:'10px' }}
                >
                  <MenuItem value="FULL DAY">FULL DAY</MenuItem>
                  <MenuItem value="HALF DAY">HALF DAY</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={1.7}>
              <TextField
                key={`from-${i}-${row.fromDate}`}
                fullWidth
                label="From Date"
                type="text"
                placeholder="DD-MM-YYYY"
                size="small"
                InputLabelProps={{ shrink: true }}
                defaultValue={row.fromDate ? `${row.fromDate.slice(8,10)}-${row.fromDate.slice(5,7)}-${row.fromDate.slice(0,4)}` : ""}
                onChange={(e) => {
                  let v = e.target.value.replace(/[^0-9-]/g, "");
                  if (v.length > 10) v = v.slice(0,10);
                  e.target.value = v;
                }}
                onBlur={(e) => {
                  let raw = e.target.value.trim();
                  let v = raw.replace(/\D/g, "");
                  if (!v && !raw) { handleBlur(i); return; }
                  let iso = null;
                  if (raw.includes("-") && /^\d{2}-\d{2}-\d{4}$/.test(raw)) {
                    const [d,m,yRaw] = raw.split("-");
                    let y = yRaw;
                    if (y.length === 2) y = "20"+y;
                    else if (y.startsWith("00")) y = "20"+y.slice(2);
                    iso = `${y}-${m}-${d}`;
                  } else if (v.length === 6) iso = `20${v.slice(4)}-${v.slice(2,4)}-${v.slice(0,2)}`;
                  else if (v.length === 8) {
                    let y = v.slice(4);
                    if (y.startsWith("00")) y = "20" + y.slice(2);
                    iso = `${y}-${v.slice(2,4)}-${v.slice(0,2)}`;
                  } else if (v.length === 4) {
                    showToast("Enter full date DD-MM-YYYY (e.g. 12082026)", "error");
                    return;
                  } else if (v.length > 0) {
                    showToast("Invalid date", "error");
                    return;
                  }
                  if (iso && /^\d{4}-\d{2}-\d{2}$/.test(iso)) {
                    const [y,m,d] = iso.split("-");
                    const dt = new Date(`${y}-${m}-${d}T00:00:00`);
                    if (isNaN(dt) || dt.getDate() != parseInt(d) || dt.getMonth()+1 != parseInt(m)) {
                      showToast("Invalid date", "error");
                      return;
                    }
                    const curYear = new Date().getFullYear();
                    const yNum = parseInt(y,10);
                    if (yNum < curYear || yNum > curYear+1) {
                      showToast(`Year must be ${curYear} or ${curYear+1} only`, "error");
                      e.target.value = "";
                      return;
                    }
                    e.target.value = `${d}-${m}-${y}`;
                    updateRow(i, "fromDate", iso);
                  }
                  handleBlur(i);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    e.target.blur();
                    setTimeout(()=>document.getElementById(`to-${i}`)?.focus(),50);
                  }
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton size="small" sx={{ p:0.5, bgcolor:'#f8fafc', border:'1px solid #e2e8f0' }} onClick={()=>{
                        const hidden = document.getElementById(`native-from-${i}`);
                        if (hidden?.showPicker) hidden.showPicker(); else hidden?.click();
                      }}><CalendarTodayIcon sx={{ fontSize:14, color:'primary.main' }}/></IconButton>
                      <Box component="input" id={`native-from-${i}`} type="date" onChange={(ev)=>{
                        if(ev.target.value){
                          const [y,m,d]=ev.target.value.split("-");
                          const txt = `${d}-${m}-${y}`;
                          const inp = document.getElementById(`from-${i}`);
                          if(inp){ inp.value=txt; inp.dispatchEvent(new Event('change',{bubbles:true})); }
                          updateRow(i,"fromDate", ev.target.value);
                        }
                      }} sx={{ position:'absolute', opacity:0, width:0, height:0, pointerEvents:'none' }} />
                    </InputAdornment>
                  ),
                }}
                inputProps={{ maxLength: 10, id: `from-${i}`, style:{ fontWeight:600 } }}
                sx={{ '& .MuiOutlinedInput-root':{ borderRadius:'10px', bgcolor:'#fff', '&.Mui-focused fieldset':{ borderColor:'primary.main', borderWidth:'1.5px' } } }}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={1.7}>
              <TextField
                key={`to-${i}-${row.toDate}`}
                fullWidth
                label="To Date"
                type="text"
                placeholder="DD-MM-YYYY"
                size="small"
                InputLabelProps={{ shrink: true }}
                defaultValue={row.toDate ? `${row.toDate.slice(8,10)}-${row.toDate.slice(5,7)}-${row.toDate.slice(0,4)}` : ""}
                onChange={(e) => {
                  let v = e.target.value.replace(/[^0-9-]/g, "");
                  if (v.length > 10) v = v.slice(0,10);
                  e.target.value = v;
                }}
                onBlur={(e) => {
                  let raw = e.target.value.trim();
                  let v = raw.replace(/\D/g, "");
                  if (!v && !raw) { handleBlur(i); return; }
                  let iso = null;
                  if (raw.includes("-") && /^\d{2}-\d{2}-\d{4}$/.test(raw)) {
                    const [d,m,yRaw] = raw.split("-");
                    let y = yRaw;
                    if (y.length === 2) y = "20"+y;
                    else if (y.startsWith("00")) y = "20"+y.slice(2);
                    iso = `${y}-${m}-${d}`;
                  } else if (v.length === 6) iso = `20${v.slice(4)}-${v.slice(2,4)}-${v.slice(0,2)}`;
                  else if (v.length === 8) {
                    let y = v.slice(4);
                    if (y.startsWith("00")) y = "20" + y.slice(2);
                    iso = `${y}-${v.slice(2,4)}-${v.slice(0,2)}`;
                  } else if (v.length === 4) {
                    showToast("Enter full date DD-MM-YYYY (e.g. 12082026)", "error");
                    return;
                  } else if (v.length > 0) {
                    showToast("Invalid date", "error");
                    return;
                  }
                  if (iso && /^\d{4}-\d{2}-\d{2}$/.test(iso)) {
                    const [y,m,d] = iso.split("-");
                    const dt = new Date(`${y}-${m}-${d}T00:00:00`);
                    if (isNaN(dt) || dt.getDate() != parseInt(d) || dt.getMonth()+1 != parseInt(m)) {
                      showToast("Invalid date", "error");
                      return;
                    }
                    const curYear = new Date().getFullYear();
                    const yNum = parseInt(y,10);
                    if (yNum < curYear || yNum > curYear+1) {
                      showToast(`Year must be ${curYear} or ${curYear+1} only`, "error");
                      e.target.value = "";
                      return;
                    }
                    e.target.value = `${d}-${m}-${y}`;
                    updateRow(i, "toDate", iso);
                  }
                  handleBlur(i);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    e.target.blur();
                    setTimeout(()=>document.getElementById(`remarks-${i}`)?.focus(),50);
                  }
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton size="small" sx={{ p:0.5, bgcolor:'#f8fafc', border:'1px solid #e2e8f0' }} onClick={()=>{
                        const hidden = document.getElementById(`native-to-${i}`);
                        if (hidden?.showPicker) hidden.showPicker(); else hidden?.click();
                      }}><CalendarTodayIcon sx={{ fontSize:14, color:'primary.main' }}/></IconButton>
                      <Box component="input" id={`native-to-${i}`} type="date" onChange={(ev)=>{
                        if(ev.target.value){
                          const [y,m,d]=ev.target.value.split("-");
                          const txt = `${d}-${m}-${y}`;
                          const inp = document.getElementById(`to-${i}`);
                          if(inp){ inp.value=txt; inp.dispatchEvent(new Event('change',{bubbles:true})); }
                          updateRow(i,"toDate", ev.target.value);
                        }
                      }} sx={{ position:'absolute', opacity:0, width:0, height:0, pointerEvents:'none' }} />
                    </InputAdornment>
                  ),
                }}
                inputProps={{ maxLength: 10, id: `to-${i}`, style:{ fontWeight:600 } }}
                sx={{ '& .MuiOutlinedInput-root':{ borderRadius:'10px', bgcolor:'#fff', '&.Mui-focused fieldset':{ borderColor:'primary.main', borderWidth:'1.5px' } } }}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={1} sx={{ width: "100px" }}>
              <TextField
                fullWidth
                label="No of Days"
                size="small"
                value={row.noOfDays}
                InputProps={{ readOnly: true }}
                sx={{ bgcolor: "#f5f5f5" }}
              />
            </Grid>

            <Grid item xs={12} sm={12} md={4} sx={{ minWidth: "180px" }}>
              <TextField
                fullWidth
                label="Remarks"
                size="small"
                value={row.remarks}
                onChange={(e) => updateRow(i, "remarks", e.target.value)}
                inputProps={{ maxLength: 150, id: `remarks-${i}` }}
              />
            </Grid>

            <Grid item xs={12} sm={12} md={1} sx={{ width: "80px" }}>
              <IconButton onClick={() => deleteRow(i)} color="error">
                <DeleteIcon />
              </IconButton>
              <IconButton
                onClick={() => resetRow(i)}
                disabled={!isRowEdited(row)}
              >
                <RestartAltIcon />
              </IconButton>
            </Grid>
          </Grid>
        </Paper>
      ))}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
        <Button
          variant="outlined"
          onClick={addRow}
          disabled={rows.length >= 5}
          sx={{ textTransform: 'none', fontWeight: 'bold' }}
        >
          + Add Row
        </Button>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="subtitle1" fontWeight={800} color="text.secondary">
            Total Leaves: 
            <span style={{ color: 'var(--primary-main)', marginLeft: '8px', fontSize: '1.2rem' }}>{totalDays}</span>
          </Typography>

          <Button
            variant="contained"
            color="primary"
            onClick={onSave}
            disabled={isSaveDisabled}
            sx={{ px: 4, fontWeight: 'bold', textTransform: 'none' }}
          >
            Save Request
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default LeaveGrid;
