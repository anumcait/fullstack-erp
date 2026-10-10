import React, { useState, useEffect, useCallback } from "react";
import {
  Box, Card, CardContent, Grid, TextField, MenuItem, Typography, Button, Stack,
  Alert, Table, TableBody, TableCell, TableHead, TableRow, Chip, CircularProgress, Divider
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import RefreshIcon from "@mui/icons-material/Refresh";
import axios from "axios";
import { useToast } from "../../../context/ToastContext";
import { getErrorMessage } from "../../../utils/errorUtils";

const API = import.meta.env.VITE_API_URL;
const MONTHS = [
  { v: 1, l: "January" }, { v: 2, l: "February" }, { v: 3, l: "March" }, { v: 4, l: "April" },
  { v: 5, l: "May" }, { v: 6, l: "June" }, { v: 7, l: "July" }, { v: 8, l: "August" },
  { v: 9, l: "September" }, { v: 10, l: "October" }, { v: 11, l: "November" }, { v: 12, l: "December" }
];
const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 8 }, (_, i) => CURRENT_YEAR - 3 + i);

const COMPONENTS = [
  { key: "PF", label: "PF" },
  { key: "ESI", label: "ESI" },
  { key: "PT", label: "Professional Tax" },
  { key: "LIC", label: "LIC" },
  { key: "TAX", label: "TDS" },
  { key: "ADV", label: "Advance" },
  { key: "OTH", label: "Other Deductions" },
  { key: "LATE_DED", label: "Late Coming" }
];

const money = (v) => `₹${Number(v || 0).toLocaleString("en-IN")}`;
const fmtDate = (d) => (d ? new Date(d).toISOString().slice(0, 10) : "-");

const PayrollAdjustments = () => {
  const { showToast } = useToast();

  const now = new Date();
  const [month, setMonth] = useState(now.getMonth());
  const [year, setYear] = useState(CURRENT_YEAR);

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ empid: "", component: "PF", amount: "", reason: "" });
  const [errors, setErrors] = useState({});

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const r = await axios.get(`${API}/api/payroll/adjustments`, { params: { month: month + 1, year } });
      setRows(Array.isArray(r.data) ? r.data : []);
    } catch (err) {
      console.error("Failed to load adjustments:", err);
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [month, year]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openNew = () => {
    setForm({ empid: "", component: "PF", amount: "", reason: "" });
    setErrors({});
    setOpen(true);
  };

  const openEdit = (r) => {
    setForm({
      empid: String(r.empid),
      component: r.component,
      amount: String(r.amount),
      reason: r.reason || ""
    });
    setErrors({});
    setOpen(true);
  };

  const save = async () => {
    setSaving(true);
    setErrors({});
    try {
      const res = await axios.post(`${API}/api/payroll/adjustments`, {
        empid: form.empid,
        component: form.component,
        amount: form.amount,
        reason: form.reason,
        month: month + 1,
        year
      });
      showToast(res.data.message || "Adjustment saved", "success");
      setOpen(false);
      fetchData();
    } catch (err) {
      const fieldErrors = err.response?.data?.errors || {};
      if (Object.keys(fieldErrors).length) setErrors(fieldErrors);
      else showToast(getErrorMessage(err, "Could not save adjustment"), "error");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (row) => {
    if (!window.confirm(`Remove the ${row.component} correction for emp ${row.empid}?`)) return;
    try {
      const res = await axios.delete(`${API}/api/payroll/adjustments/${row.id}`);
      showToast(res.data.message || "Adjustment removed", "success");
      fetchData();
    } catch (err) {
      showToast(getErrorMessage(err, "Could not remove adjustment"), "error");
    }
  };

  const label = (key) => (COMPONENTS.find(c => c.key === key) || {}).label || key;

  return (
    <Box sx={{ maxWidth: 1100, mx: "auto" }}>
      <Card>
        <CardContent>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }} flexWrap="wrap" gap={1}>
            <Box>
              <Typography fontWeight={700}>Payroll Adjustments</Typography>
              <Typography variant="caption" color="text.secondary">
                Correct a deduction line after the month is processed. The correction is stored, so re-processing
                the month keeps it.
              </Typography>
            </Box>
            <Stack direction="row" spacing={1} alignItems="center">
              <TextField select size="small" label="Month" value={month} sx={{ minWidth: 130 }}
                onChange={e => setMonth(Number(e.target.value))}>
                {MONTHS.map(m => <MenuItem key={m.v} value={m.v - 1}>{m.l}</MenuItem>)}
              </TextField>
              <TextField select size="small" label="Year" value={year} sx={{ width: 110 }}
                onChange={e => setYear(Number(e.target.value))}>
                {YEARS.map(y => <MenuItem key={y} value={y}>{y}</MenuItem>)}
              </TextField>
              <Button size="small" variant="outlined" startIcon={<RefreshIcon />} onClick={fetchData}>Refresh</Button>
              <Button size="small" variant="contained" onClick={openNew}>+ Add Adjustment</Button>
            </Stack>
          </Stack>

          {open && (
            <>
              <Divider sx={{ my: 2 }} />
              <Typography fontWeight={600} sx={{ mb: 1 }}>
                {form.empid ? `Edit adjustment - emp ${form.empid}, ${label(form.component)}` : "New adjustment"}
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField fullWidth size="small" label="Employee ID *" value={form.empid}
                    error={!!errors.empid} helperText={errors.empid}
                    onChange={e => setForm(f => ({ ...f, empid: e.target.value }))} />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField select fullWidth size="small" label="Component *" value={form.component}
                    error={!!errors.component} helperText={errors.component}
                    onChange={e => setForm(f => ({ ...f, component: e.target.value }))}>
                    {COMPONENTS.map(c => <MenuItem key={c.key} value={c.key}>{c.label}</MenuItem>)}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField fullWidth size="small" type="number" label="Corrected Amount *" value={form.amount}
                    error={!!errors.amount} helperText={errors.amount}
                    onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} />
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField fullWidth size="small" label={`Reason * (${MONTHS[month].l} ${year})`} value={form.reason}
                    error={!!errors.reason} helperText={errors.reason}
                    onChange={e => setForm(f => ({ ...f, reason: e.target.value }))} />
                </Grid>
              </Grid>
              <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                <Button variant="contained" onClick={save} disabled={saving}>
                  {saving ? <CircularProgress size={20} color="inherit" /> : "Save Adjustment"}
                </Button>
                <Button onClick={() => setOpen(false)} disabled={saving}>Cancel</Button>
              </Stack>
            </>
          )}

          <Divider sx={{ my: 2 }} />

          {loading ? (
            <Box sx={{ textAlign: "center", py: 4 }}><CircularProgress size={28} /></Box>
          ) : rows.length === 0 ? (
            <Alert severity="info">
              No adjustments for {MONTHS[month].l} {year}.
            </Alert>
          ) : (
            <Box sx={{ overflowX: "auto" }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Employee</TableCell>
                    <TableCell>Component</TableCell>
                    <TableCell align="right">Previous</TableCell>
                    <TableCell align="right">Corrected</TableCell>
                    <TableCell>Reason</TableCell>
                    <TableCell>By</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell align="right">Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map(r => (
                    <TableRow key={r.id} hover>
                      <TableCell>{r.empid} - {r.ename}</TableCell>
                      <TableCell><Chip size="small" label={label(r.component)} color="warning" variant="outlined" /></TableCell>
                      <TableCell align="right">{money(r.previous_amount)}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>{money(r.amount)}</TableCell>
                      <TableCell sx={{ maxWidth: 260 }}>{r.reason}</TableCell>
                      <TableCell>{r.created_by || "-"}</TableCell>
                      <TableCell>{fmtDate(r.created_date)}</TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                          <Button size="small" startIcon={<EditIcon />} onClick={() => openEdit(r)}>Edit</Button>
                          <Button size="small" color="error" startIcon={<DeleteIcon />} onClick={() => remove(r)}>Remove</Button>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default PayrollAdjustments;