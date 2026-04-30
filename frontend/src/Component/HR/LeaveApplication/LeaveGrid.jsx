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

const LeaveGrid = ({ leaveDetails, setLeaveDetails, totalDays, onValidationError, onSave, isSaveDisabled, empId }) => {
  const { showToast } = useToast();
  const [rows, setRows] = useState([
    { dayType: "FULL DAY", fromDate: "", toDate: "", noOfDays: "", remarks: "" },
  ]);
  const [overlapIndexes, setOverlapIndexes] = useState([]);

  const getBlankRow = () => ({
    dayType: "FULL DAY",
    fromDate: "",
    toDate: "",
    noOfDays: "",
    remarks: "",
  });

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
    setRows((prev) => [...prev, getBlankRow()]);
  };

  const resetRow = (index) => {
    const updated = [...rows];
    updated[index] = getBlankRow();
    setRows(updated);
    showToast("Row reset", "info");
  };

  const deleteRow = (index) => {
    const updated = rows.filter((_, i) => i !== index);
    if (!updated.length) updated.push(getBlankRow());
    setRows(updated);
    showToast("Row deleted", "error");
  };

  const updateRow = async (index, field, value) => {
    const updated = [...rows];
    updated[index][field] = value;

    if (["fromDate", "toDate"].includes(field) && value) {
      const selectedDate = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // 1. Backdated Validation (30 days - 1 Month)
      const diffDays = Math.ceil((today - selectedDate) / (1000 * 60 * 60 * 24));
      if (diffDays > 30) {
        showToast("Cannot apply leave older than 30 days (1 month).", "error");
        updated[index][field] = "";
        setRows(updated);
        return;
      }

      // 2. Future Validation (60 days - 2 Months)
      const futureDiff = Math.ceil((selectedDate - today) / (1000 * 60 * 60 * 24));
      if (futureDiff > 60) {
        showToast("Cannot apply leave more than 60 days (2 months) in advance.", "error");
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
          const overlapRes = await axios.get(`/api/leave/check-overlap`, {
            params: { 
              empid: empId, 
              fromDate: updated[index].fromDate, 
              toDate: updated[index].toDate 
            }
          });
          if (overlapRes.data.overlapping) {
            showToast("Leave already exists for this date range in the database.", "error");
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
    const from = new Date(row.fromDate);
    const to = new Date(row.toDate);

    if (row.fromDate && row.toDate && from > to) {
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

  useEffect(() => {
    setLeaveDetails(rows);
    const indexes = [];
    for (let i = 0; i < rows.length; i++) {
      for (let j = i + 1; j < rows.length; j++) {
        if (rows[i].fromDate && rows[i].toDate && rows[j].fromDate && rows[j].toDate) {
          const fromA = new Date(rows[i].fromDate);
          const toA = new Date(rows[i].toDate);
          const fromB = new Date(rows[j].fromDate);
          const toB = new Date(rows[j].toDate);
          if (fromA <= toB && toA >= fromB) {
            indexes.push(i, j);
          }
        }
      }
    }
    setOverlapIndexes([...new Set(indexes)]);
    if (onValidationError) onValidationError(indexes.length > 0);
  }, [rows]);

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
          <Grid container spacing={0.5} alignItems="center">
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
                fullWidth
                label="From Date"
                type="date"
                size="small"
                InputLabelProps={{ shrink: true }}
                value={row.fromDate}
                onChange={(e) => updateRow(i, "fromDate", e.target.value)}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={1} sx={{ width: "130px" }}>
              <TextField
                fullWidth
                label="To Date"
                type="date"
                size="small"
                InputLabelProps={{ shrink: true }}
                value={row.toDate}
                onChange={(e) => updateRow(i, "toDate", e.target.value)}
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

            <Grid item xs={12} sm={12} md={3} sx={{ width: "90px" }}>
              <TextField
                fullWidth
                label="Remarks"
                size="small"
                value={row.remarks}
                onChange={(e) => updateRow(i, "remarks", e.target.value)}
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
            <span style={{ color: '#1976d2', marginLeft: '8px', fontSize: '1.2rem' }}>{totalDays}</span>
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
