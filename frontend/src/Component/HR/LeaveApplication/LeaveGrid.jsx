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
import { useToast } from "../../../context/ToastContext";
import axios from "axios";

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
      if (parts[0] && (parts[0].length !== 4 || parts[0].startsWith("00"))) {
        let y = parts[0];
        if (y.length > 4) y = y.slice(-4);
        if (y.startsWith("00")) y = "20" + y.slice(2);
        y = y.padStart(4, "0").slice(-4);
        parts[0] = y;
        newValue = parts.join("-");
      }
    } else {
      newValue = value;
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

    if (["fromDate", "toDate"].includes(field) && value && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
      const selectedDate = new Date(value + "T00:00:00");
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // 1. Dynamic Boundary Validation (skip while typing year with leading zeros)
      if (newValue.startsWith("0") || newValue.startsWith("000") || newValue.startsWith("00-")) {
        setRows(updated);
        return;
      }
      if (newValue.startsWith("00")) {
        setRows(updated);
        return;
      }
      if (minDateLimit && value < minDateLimit) {
        const fmt = (s) => s ? s.split('-').reverse().join('-') : "";
        showToast(`Cannot apply leave before ${fmt(minDateLimit)} (Payroll processed).`, "error");
        updated[index][field] = "";
        setRows(updated);
        return;
      }

      if (maxDateLimit && value > maxDateLimit) {
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
            p: 1,
            mb: 1,
            border: overlapIndexes.includes(i) ? "1px solid red" : "1px solid #ddd",
            boxShadow: 'none'
          }}
        >
          <Grid container spacing={0.5} alignItems="center" sx={{ flexWrap: "wrap" }}>
            <Grid item xs={12} sm={6} md={1} sx={{ width: "20px" }}>
              <Typography fontWeight="bold">
                {i + 1} {isRowEdited(row) && "✳️"}
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6} md={1}>
              <FormControl size="small" fullWidth>
                <InputLabel>Day Type</InputLabel>
                <Select
                  fullWidth
                  label="Day Type"
                  size="small"
                  value={row.dayType}
                  onChange={(e) => updateRow(i, "dayType", e.target.value)}
                >
                  <MenuItem value="FULL DAY">FULL DAY</MenuItem>
                  <MenuItem value="HALF DAY">HALF DAY</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={1} sx={{ width: "130px" }}>
              <TextField
                key={`from-${i}-${row.fromDate}`}
                fullWidth
                label="From Date"
                type="text"
                placeholder="DD-MM-YYYY"
                size="small"
                InputLabelProps={{ shrink: true }}
                defaultValue={row.fromDate ? `${row.fromDate.slice(8, 10)}-${row.fromDate.slice(5, 7)}-${row.fromDate.slice(0, 4)}` : ""}
                onChange={(e) => {
                  let v = e.target.value.replace(/\D/g, "");
                  if (v.length > 8) v = v.slice(0, 8);
                  let out = v;
                  if (v.length === 8) out = `${v.slice(0, 2)}-${v.slice(2, 4)}-${v.slice(4)}`;
                  else if (v.length === 6) out = `${v.slice(0, 2)}-${v.slice(2, 4)}-${v.slice(4)}`;
                  else if (v.length >= 3) out = `${v.slice(0, 2)}-${v.slice(2)}`;
                  e.target.value = out;
                }}
                onBlur={(e) => {
                  const v = e.target.value.replace(/\D/g, "");
                  let iso = null;
                  if (v.length === 6) iso = `20${v.slice(4)}-${v.slice(2, 4)}-${v.slice(0, 2)}`;
                  else if (v.length === 8) iso = `${v.slice(4)}-${v.slice(2, 4)}-${v.slice(0, 2)}`;
                  else if (v.length === 10 && e.target.value.includes("-")) {
                    const p = e.target.value.split("-");
                    if (p.length === 3) iso = `${p[2]}-${p[1]}-${p[0]}`;
                  }
                  if (iso && /^\d{4}-\d{2}-\d{2}$/.test(iso)) updateRow(i, "fromDate", iso);
                  handleBlur(i);
                }}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); document.getElementById(`to-${i}`)?.focus(); } }}
                inputProps={{ maxLength: 10, placeholder: "DD-MM-YYYY", id: `from-${i}` }}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={1} sx={{ width: "130px" }}>
              <TextField
                key={`to-${i}-${row.toDate}`}
                fullWidth
                label="To Date"
                type="text"
                placeholder="DD-MM-YYYY"
                size="small"
                InputLabelProps={{ shrink: true }}
                defaultValue={row.toDate ? `${row.toDate.slice(8, 10)}-${row.toDate.slice(5, 7)}-${row.toDate.slice(0, 4)}` : ""}
                onChange={(e) => {
                  let v = e.target.value.replace(/\D/g, "");
                  if (v.length > 8) v = v.slice(0, 8);
                  let out = v;
                  if (v.length === 8) out = `${v.slice(0, 2)}-${v.slice(2, 4)}-${v.slice(4)}`;
                  else if (v.length === 6) out = `${v.slice(0, 2)}-${v.slice(2, 4)}-${v.slice(4)}`;
                  else if (v.length >= 3) out = `${v.slice(0, 2)}-${v.slice(2)}`;
                  e.target.value = out;
                }}
                onBlur={(e) => {
                  const v = e.target.value.replace(/\D/g, "");
                  let iso = null;
                  if (v.length === 6) iso = `20${v.slice(4)}-${v.slice(2, 4)}-${v.slice(0, 2)}`;
                  else if (v.length === 8) iso = `${v.slice(4)}-${v.slice(2, 4)}-${v.slice(0, 2)}`;
                  else if (v.length === 10 && e.target.value.includes("-")) {
                    const p = e.target.value.split("-");
                    if (p.length === 3) iso = `${p[2]}-${p[1]}-${p[0]}`;
                  }
                  if (iso && /^\d{4}-\d{2}-\d{2}$/.test(iso)) updateRow(i, "toDate", iso);
                  handleBlur(i);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    const v = e.target.value.replace(/\D/g, "");
                    let iso = null;
                    if (v.length === 6) iso = `20${v.slice(4)}-${v.slice(2, 4)}-${v.slice(0, 2)}`;
                    else if (v.length === 8) iso = `${v.slice(4)}-${v.slice(2, 4)}-${v.slice(0, 2)}`;
                    if (iso) updateRow(i, "toDate", iso);
                    setTimeout(() => document.getElementById(`remarks-${i}`)?.focus(), 100);
                  }
                }}
                inputProps={{ maxLength: 10, placeholder: "DD-MM-YYYY", id: `to-${i}` }}
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
