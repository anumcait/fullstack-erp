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
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import { useToast } from "../../../context/ToastContext";

const LeaveGrid = ({ leaveDetails, setLeaveDetails, onValidationError }) => {
  const { showToast } = useToast();
  const [rows, setRows] = useState([
    { dayType: "FULL DAY", fromDate: "", toDate: "", noOfDays: "", remarks: "" },
  ]);
  const inputRefs = useRef([]);
  const [overlapModal, setOverlapModal] = useState({ show: false, conflicts: [] });
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

  const updateRow = (index, field, value) => {
    const updated = [...rows];
    updated[index][field] = value;

    const row = updated[index];
    const from = new Date(row.fromDate);
    const to = new Date(row.toDate);

    if (from > to) {
      showToast("Something went wrong, check dates!", "error");
    }

    if (["fromDate", "toDate", "dayType"].includes(field)) {
      if (!isNaN(from) && !isNaN(to) && from <= to) {
        let diff =
          Math.ceil((to - from) / (1000 * 60 * 60 * 24)) + 1;
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

    // overlap check (kept same logic but simplified for demo)
    const indexes = [];
    for (let i = 0; i < rows.length; i++) {
      for (let j = i + 1; j < rows.length; j++) {
        if (
          rows[i].fromDate &&
          rows[i].toDate &&
          rows[j].fromDate &&
          rows[j].toDate
        ) {
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
    <div>
      
      {rows.map((row, i) => (
        <Paper
          key={i}
          sx={{
            p: 1,
            mb: 1,
            border: overlapIndexes.includes(i)
              ? "1px solid red"
              : "1px solid #ddd",
          }}
        >
   <Grid container spacing={0.5} alignItems="center">
  {/* Row Number */}
  <Grid item xs={12} sm={6} md={1} sx={{width:"20px"}}>
    <Typography fontWeight="bold">
      {i + 1} {isRowEdited(row) && "✳️"}
    </Typography>
  </Grid>

  {/* Day Type */}
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

  {/* From Date */}
  <Grid item xs={12} sm={6} md={1} sx={{width:"130px"}}>
       
    <TextField
      type="date"
      label="From Date"
      size="small"
      fullWidth
      InputLabelProps={{ shrink: true }}
      value={row.fromDate}
      onChange={(e) => updateRow(i, "fromDate", e.target.value)}
    />

  </Grid>

  {/* To Date */}
  <Grid item xs={12} sm={6} md={1} sx={{width:"130px"}}>
    <TextField
      type="date"
      label="To Date"
      size="small"
      fullWidth
      InputLabelProps={{ shrink: true }}
      value={row.toDate}
      onChange={(e) => updateRow(i, "toDate", e.target.value)}
    />
  </Grid>

  {/* No of Days */}
  <Grid item xs={12} sm={6} md={1} sx={{width:"100px"}}>
     
    <TextField
      type="number"
      label="No of Days"
      size="small"
      disabled
      fullWidth
      value={row.noOfDays}
      onChange={(e) => updateRow(i, "noOfDays", e.target.value)}
    />

  </Grid>

  {/* Remarks */}
  <Grid item xs={12} sm={12} md={3} sx={{width:"90px"}}>
    <TextField
      label="Remarks"
      size="small"
      fullWidth
      value={row.remarks}
      onChange={(e) => updateRow(i, "remarks", e.target.value)}
    />
  </Grid>

  {/* Actions */}
  <Grid item xs={12} sm={12} md={1} sx={{width:"80px"}} >
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

      <Button
        variant="outlined"
        onClick={addRow}
        disabled={rows.length >= 5}
      >
        + Add Row
      </Button>
    </div>
  );
};

export default LeaveGrid;
