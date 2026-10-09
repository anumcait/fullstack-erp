import React, { useState, useEffect, useRef } from "react";
import {
  Paper,
  TextField,
  Select,
  MenuItem,
  IconButton,
  Button,
  Typography,
  FormControl,
  Box,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import { useToast } from "../../../context/ToastContext";
import axios from "axios";
import { InputAdornment } from "@mui/material";

// One shared column definition for the header row and every data row, so all
// rows line up exactly. Previously each row was its own Grid container mixing
// fractional `md` widths with hardcoded pixel widths, which fought each other.
const GRID_COLS = "34px 124px 172px 172px 104px minmax(190px, 1fr) 86px";
const GRID_MIN_WIDTH = 940;

const HEAD_CELL = {
  fontSize: "11px",
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: 0.4,
  color: "text.secondary",
  px: 0.5,
};

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
    <Box sx={{ mt: 0.5 }}>
      {/* Scrolls sideways on narrow screens instead of squashing the columns */}
      <Box sx={{ overflowX: "auto", pb: 0.5 }}>
        <Box sx={{ minWidth: GRID_MIN_WIDTH }}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: GRID_COLS,
              gap: 1,
              alignItems: "center",
              px: 1,
              pb: 0.5,
            }}
          >
            <Box sx={HEAD_CELL} />
            <Box sx={HEAD_CELL}>Day Type</Box>
            <Box sx={HEAD_CELL}>From Date</Box>
            <Box sx={HEAD_CELL}>To Date</Box>
            <Box sx={{ ...HEAD_CELL, textAlign: "center" }}>Days</Box>
            <Box sx={HEAD_CELL}>Remarks</Box>
            <Box sx={HEAD_CELL} />
          </Box>

          {rows.map((row, i) => (
        <Paper
          key={i}
          sx={{
            py: 0.75,
            px: 1,
            mb: 0.75,
            border: overlapIndexes.includes(i) ? "1.5px solid #ef4444" : "1px solid #e2e8f0",
            borderRadius: '10px',
            bgcolor: overlapIndexes.includes(i) ? '#fef2f2' : '#ffffff',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
            transition:'all 0.2s',
            '&:hover':{ boxShadow:'0 4px 12px rgba(0,0,0,0.08)', borderColor: overlapIndexes.includes(i) ? '#ef4444' : '#cbd5e1' }
          }}
        >
          <Box sx={{ display: "grid", gridTemplateColumns: GRID_COLS, gap: 1, alignItems: "center" }}>
            <Box sx={{ display:'flex', justifyContent:'center' }}>
              <Box sx={{ width:26, height:26, borderRadius:'50%', bgcolor: isRowEdited(row) ? 'primary.main' : '#f1f5f9', color: isRowEdited(row) ? '#fff' : '#64748b', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:11, border: overlapIndexes.includes(i) ? '2px solid #ef4444' : '1px solid #e2e8f0' }}>{i + 1}</Box>
            </Box>

            <Box>
              <FormControl size="small" fullWidth sx={{ '& .MuiOutlinedInput-root':{borderRadius:'10px', bgcolor:'#fff'} }}>
                <Select
                  fullWidth
                  size="small"
                  value={row.dayType}
                  onChange={(e) => updateRow(i, "dayType", e.target.value)}
                  inputProps={{ 'aria-label': 'Day Type' }}
                  sx={{ borderRadius:'10px' }}
                >
                  <MenuItem value="FULL DAY">FULL DAY</MenuItem>
                  <MenuItem value="HALF DAY">HALF DAY</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Box>
              <TextField
                key={`from-${i}-${row.fromDate}`}
                fullWidth
                type="text"
                placeholder="DD-MM-YYYY"
                size="small"
                inputProps={{ maxLength: 10, id: `from-${i}`, 'aria-label': 'From Date', style:{ fontWeight:600 } }}
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
            </Box>

            <Box>
              <TextField
                key={`to-${i}-${row.toDate}`}
                fullWidth
                type="text"
                placeholder="DD-MM-YYYY"
                size="small"
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
                inputProps={{ maxLength: 10, id: `to-${i}`, 'aria-label': 'To Date', style:{ fontWeight:600 } }}
                sx={{ '& .MuiOutlinedInput-root':{ borderRadius:'10px', bgcolor:'#fff', '&.Mui-focused fieldset':{ borderColor:'primary.main', borderWidth:'1.5px' } } }}
              />
            </Box>

            <Box>
              <TextField
                fullWidth
                size="small"
                value={row.noOfDays}
                inputProps={{ readOnly: true, 'aria-label': 'No of Days' }}
                InputProps={{ readOnly: true }}
                sx={{ bgcolor: "#f5f5f5" }}
              />
            </Box>

            <Box>
              <TextField
                fullWidth
                size="small"
                value={row.remarks}
                onChange={(e) => updateRow(i, "remarks", e.target.value)}
                inputProps={{ maxLength: 150, id: `remarks-${i}`, 'aria-label': 'Remarks' }}
              />
            </Box>

            <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
              <IconButton size="small" onClick={() => deleteRow(i)} color="error">
                <DeleteIcon fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                onClick={() => resetRow(i)}
                disabled={!isRowEdited(row)}
              >
                <RestartAltIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>
        </Paper>
          ))}
        </Box>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1.5 }}>
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
