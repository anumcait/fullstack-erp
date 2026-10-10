import React, { useState, useEffect, useMemo } from "react";
import {
  Box, Card, CardContent, Grid, TextField, MenuItem, Typography, Button, Stack,
  Alert, Divider, CircularProgress, Switch, FormControlLabel, Table, TableBody,
  TableCell, TableRow, Chip, LinearProgress, Stepper, Step, StepLabel, Paper
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import PersonSearchIcon from "@mui/icons-material/PersonSearch";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import axios from "axios";
import { useToast } from "../../../context/ToastContext";
import { getErrorMessage } from "../../../utils/errorUtils";
import EmployeeSelectDialog from "../Employee/EmployeeSelectDialog";

const API = import.meta.env.VITE_API_URL;
const MONTHS = [
  { v: 1, l: "January" }, { v: 2, l: "February" }, { v: 3, l: "March" }, { v: 4, l: "April" },
  { v: 5, l: "May" }, { v: 6, l: "June" }, { v: 7, l: "July" }, { v: 8, l: "August" },
  { v: 9, l: "September" }, { v: 10, l: "October" }, { v: 11, l: "November" }, { v: 12, l: "December" }
];
const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 8 }, (_, i) => CURRENT_YEAR - 2 + i);

// Only the main heads are shared out; the Others 1-9 buckets stay untouched
// unless they are revised from the salary master directly.
const HEADS = [
  { key: "basic", label: "Basic", hint: "Base pay" },
  { key: "hra", label: "HRA", hint: "House rent" },
  { key: "conveyance", label: "Conveyance", hint: "Travel" },
  { key: "washing_allowance", label: "Washing Allowance", hint: "Uniform" }
];

const money = (v) => `₹${Number(v || 0).toLocaleString("en-IN")}`;
const round = (v) => Math.round(Number(v) || 0);

const IncrementForm = ({ onClose, onSaved, editRow }) => {
  const { showToast } = useToast();
  const isEdit = !!editRow;

  const now = new Date();
  const [employeeList, setEmployeeList] = useState([]);
  const [empDialog, setEmpDialog] = useState(false);
  const [emp, setEmp] = useState(null);
  const [salary, setSalary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const [effMonth, setEffMonth] = useState(now.getMonth() + 1);
  const [effYear, setEffYear] = useState(CURRENT_YEAR);
  const [totalAmount, setTotalAmount] = useState("");
  const [shares, setShares] = useState({ basic: "", hra: "", conveyance: "", washing_allowance: "" });
  const [amounts, setAmounts] = useState({ basic: "", hra: "", conveyance: "", washing_allowance: "" });
  const [reason, setReason] = useState("");

  const [hasArrears, setHasArrears] = useState(false);
  const [arrFromMonth, setArrFromMonth] = useState(now.getMonth() + 1);
  const [arrFromYear, setArrFromYear] = useState(CURRENT_YEAR);
  const [arrToMonth, setArrToMonth] = useState(now.getMonth() + 1);
  const [arrToYear, setArrToYear] = useState(CURRENT_YEAR);
  const [step, setStep] = useState(0);

  const monthSpan = (fy, fm, ty, tm) => (ty * 12 + tm) - (fy * 12 + fm) + 1;
  const arrearsMonths = hasArrears ? monthSpan(arrFromYear, arrFromMonth, arrToYear, arrToMonth) : 0;

  useEffect(() => {
    axios.get(`${API}/api/employees`)
      .then(r => setEmployeeList(Array.isArray(r.data) ? r.data : []))
      .catch(() => showToast("Could not load employees", "error"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Salary shown is the one in force for the chosen effective month.
  const loadSalary = async (empid) => {
    setLoading(true);
    try {
      const r = await axios.get(`${API}/api/increment/form-data`, { params: { empid, month: effMonth, year: effYear } });
      const row = (r.data.data.rows || []).find(x => String(x.empid) === String(empid));
      if (!row || !row.has_salary) {
        setSalary(null);
        showToast("No salary master record for this employee", "error");
        return;
      }
      setSalary(row);
      setShares({ basic: "", hra: "", conveyance: "", washing_allowance: "" });
    } catch (err) {
      setSalary(null);
      showToast(getErrorMessage(err, "Could not load salary"), "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (emp) loadSalary(emp.empid);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [emp?.empid, effMonth, effYear]);

  // Editing an existing entry: restore its period, reason, arrears and the
  // per-head amounts so the grid opens showing what is already saved.
  useEffect(() => {
    if (!editRow) return;
    const blank = { basic: "", hra: "", conveyance: "", washing_allowance: "" };

    setEmp({
      empid: editRow.empid,
      ename: editRow.ename,
      department: editRow.department,
      designation: editRow.designation
    });
    setEffMonth(editRow.effective_month);
    setEffYear(editRow.effective_year);
    setReason(editRow.reason || "");

    setHasArrears(!!editRow.has_arrears);
    if (editRow.has_arrears) {
      setArrFromMonth(editRow.arrears_from_month || editRow.effective_month);
      setArrFromYear(editRow.arrears_from_year || editRow.effective_year);
      setArrToMonth(editRow.arrears_to_month || editRow.effective_month);
      setArrToYear(editRow.arrears_to_year || editRow.effective_year);
    }

    const amt = { ...blank };
    (editRow.lines || []).forEach(l => {
      if (l.component in amt) amt[l.component] = String(Math.round(Number(l.inc_value) || 0));
    });
    setAmounts(amt);
    setShares({ ...blank });
    const total = Object.values(amt).reduce((sum, v) => sum + (Number(v) || 0), 0);
    setTotalAmount(total > 0 ? String(total) : "");
    setStep(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editRow]);

  const totalNum = Number(totalAmount) || 0;

  const posNum = (v) => {
    const n = Number(v);
    return v === "" || v === null || v === undefined || !Number.isFinite(n) || n <= 0 ? 0 : n;
  };

  // Either input may be typed: a percentage works out the rupees, a rupee
  // amount works back to the percentage it represents. Neither re-triggers the
  // other, so the pair cannot oscillate.
  const setShare = (key, v) => {
    setShares(prev => ({ ...prev, [key]: v }));
    if (totalNum > 0) {
      const p = posNum(v);
      setAmounts(prev => ({ ...prev, [key]: p > 0 ? String(round((totalNum * p) / 100)) : "" }));
    }
  };

  const setAmount = (key, v) => {
    setAmounts(prev => ({ ...prev, [key]: v }));
    if (totalNum > 0) {
      const a = posNum(v);
      setShares(prev => ({ ...prev, [key]: a > 0 ? String(Math.round((a / totalNum) * 10000) / 100) : "" }));
    }
  };

  const clearAll = () => {
    const blank = { basic: "", hra: "", conveyance: "", washing_allowance: "" };
    setShares(blank);
    setAmounts(blank);
    setTotalAmount("");
  };

  // The rupee amount is authoritative for a head; the percentage is derived
  // from it whenever the amount was typed directly.
  const rows = useMemo(() => HEADS.map(h => {
    const current = salary ? Number(salary.components?.[h.key] ?? 0) : 0;
    const typedAmount = posNum(amounts[h.key]);
    const typedShare = posNum(shares[h.key]);

    let amount = typedAmount;
    if (amount === 0 && typedShare > 0 && totalNum > 0) amount = round((totalNum * typedShare) / 100);

    let share = typedShare;
    if (typedAmount > 0 && totalNum > 0) share = Math.round((typedAmount / totalNum) * 10000) / 100;

    const empty = (v) => (v === undefined ? "" : v);
    return {
      ...h,
      current,
      amount,
      share,
      shareInput: empty(shares[h.key]),
      amountInput: empty(amounts[h.key]),
      disabled: current <= 0,
      newValue: current + amount
    };
  }), [salary, shares, amounts, totalNum]);

  const totalShare = Math.round(rows.reduce((s, r) => s + r.share, 0) * 100) / 100;
  const allocated = rows.reduce((s, r) => s + r.amount, 0);
  const unallocated = Math.max(0, totalNum - allocated);
  const oldGross = salary ? Number(salary.gross || 0) : 0;
  const newGross = oldGross + allocated;

  const validate = () => {
    const e = {};
    const allocatedNow = rows.reduce((s, r) => s + r.amount, 0);
    if (!emp) e.empid = "Select an employee";
    // The full amount is the reference for turning a % into rupees, so it is
    // only optional when every head was typed in rupees.
    if (!totalNum && allocatedNow === 0) e.total = "Enter the full increment amount";
    if (allocatedNow === 0) e.shares = "Enter a percentage or an amount against at least one salary head";
    if (totalNum > 0 && allocatedNow > totalNum) {
      e.shares = `Heads add up to ${money(allocatedNow)}, which is more than the ${money(totalNum)} increment`;
    }
    if (!reason.trim()) e.reason = "Reason is mandatory";
    if (hasArrears && arrearsMonths <= 0) e.arrears = "Arrears end must not be before the start";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const save = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const components = {};
      rows.forEach(r => { if (r.amount > 0) components[r.key] = r.amount; });

      const payload = {
        effective_month: effMonth,
        effective_year: effYear,
        has_arrears: hasArrears,
        arrears_from_month: arrFromMonth,
        arrears_from_year: arrFromYear,
        arrears_to_month: arrToMonth,
        arrears_to_year: arrToYear,
        reason: reason.trim()
      };

      const res = isEdit
        ? await axios.put(`${API}/api/increment/${editRow.increment_id}`, { ...payload, components })
        : await axios.post(`${API}/api/increment/apply`, {
          ...payload,
          inc_type: 'AMOUNT',
          entries: [{ empid: emp.empid, components }]
        });
      showToast(res.data.message || (isEdit ? "Increment updated" : "Increment saved"), "success");
      onSaved && onSaved();
    } catch (err) {
      const fieldErrors = err.response?.data?.errors || {};
      if (Object.keys(fieldErrors).length) {
        setErrors(fieldErrors);
        showToast("Please correct the highlighted fields", "error");
      } else {
        showToast(getErrorMessage(err, "Error saving increment"), "error");
      }
    } finally {
      setSaving(false);
    }
  };


  const STEPS = ["Employee", "Increment", "Review"];

  const canLeaveStep0 = !!emp && !!salary && !loading;
  const canLeaveStep1 = allocated > 0 && !errors.shares;

  const goNext = () => {
    if (step === 0 && !canLeaveStep0) {
      setErrors(e => ({ ...e, empid: !emp ? "Select an employee" : e.empid }));
      return;
    }
    if (step === 1 && !canLeaveStep1) {
      validate();
      return;
    }
    setStep(s => Math.min(2, s + 1));
  };

  return (
    <Box sx={{ maxWidth: 1040, mx: "auto" }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
        <Typography variant="h6" fontWeight={700}>{isEdit ? `Edit Increment #${editRow.increment_id}` : "New Increment"}</Typography>
        {isEdit && (
          <Chip size="small" label="Not Approved — editable" color="warning" variant="outlined" sx={{ mr: 1 }} />
        )}
        <Stack direction="row" spacing={1.5} alignItems="center">
          {emp && <Typography variant="caption" color="text.secondary">{emp.empid} — {emp.ename}</Typography>}
          <Button onClick={onClose}>Close</Button>
        </Stack>
      </Stack>

      <Stepper activeStep={step} sx={{ mb: 2 }}>
        {STEPS.map(label => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {/* ---------------- Step 1: Employee ---------------- */}
      {step === 0 && (
        <Card>
          <CardContent>
            <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" useFlexGap>
<Button variant="outlined" startIcon={<PersonSearchIcon />} onClick={() => setEmpDialog(true)}
                disabled={isEdit}
                sx={{ minWidth: 260, justifyContent: "flex-start" }}>
                {emp ? `${emp.empid} — ${emp.ename}` : "Select Employee"}
              </Button>
              {isEdit && (
                <Typography variant="caption" color="text.secondary">
                  Employee cannot be changed while editing
                </Typography>
              )}
              {emp && (
                <>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Department</Typography>
                    <Typography>{emp.department || "-"}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Designation</Typography>
                    <Typography>{emp.designation || "-"}</Typography>
                  </Box>
                </>
              )}
            </Stack>

            {errors.empid && <Alert severity="error" sx={{ mt: 2 }}>{errors.empid}</Alert>}
            {loading && <Box sx={{ mt: 3, textAlign: "center" }}><CircularProgress size={26} /></Box>}

            {salary && !loading && (
              <Box sx={{ mt: 2 }}>
                <Divider sx={{ mb: 2 }} />
                <Typography variant="caption" color="text.secondary">
                  Current salary effective {MONTHS[effMonth - 1].l} {effYear}
                </Typography>
                <Stack direction="row" spacing={4} sx={{ mt: 0.5 }} flexWrap="wrap" useFlexGap>
                  {HEADS.map(h => (
                    <Box key={h.key}>
                      <Typography variant="caption" color="text.secondary">{h.label}</Typography>
                      <Typography fontWeight={600}>{money(salary.components?.[h.key])}</Typography>
                    </Box>
                  ))}
                  <Box>
                    <Typography variant="caption" color="text.secondary">Gross</Typography>
                    <Typography fontWeight={700}>{money(oldGross)}</Typography>
                  </Box>
                </Stack>
              </Box>
            )}
          </CardContent>
        </Card>
      )}

      {/* ---------------- Step 2: Increment ---------------- */}
      {step === 1 && (
        <Card>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={5} md={3}>
                <TextField select fullWidth size="small" label="Effective Month *" value={effMonth}
                  error={!!errors.effective_month} helperText={errors.effective_month}
                  onChange={e => setEffMonth(Number(e.target.value))}>
                  {MONTHS.map(m => <MenuItem key={m.v} value={m.v}>{m.l}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={5} md={2.5}>
                <TextField select fullWidth size="small" label="Effective Year *" value={effYear}
                  error={!!errors.effective_year} helperText={errors.effective_year}
                  onChange={e => setEffYear(Number(e.target.value))}>
                  {YEARS.map(y => <MenuItem key={y} value={y}>{y}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField fullWidth size="small" type="number" label="Full Increment Amount *" value={totalAmount}
                  error={!!errors.total} helperText={errors.total || " "}
                  InputProps={{ startAdornment: <Typography sx={{ mr: 1, color: "text.secondary" }}>₹</Typography> }}
                  onChange={e => setTotalAmount(e.target.value)}
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 2 }} />

            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }} flexWrap="wrap" useFlexGap>
              <Typography variant="body2" fontWeight={600}>Split across heads</Typography>
              <Typography variant="caption" color="text.secondary">
                give a % or a rupee amount for each
              </Typography>
              <Box sx={{ flex: 1 }} />
              <Button size="small" variant="text" onClick={clearAll}
                disabled={!totalNum && !totalShare}>Clear</Button>
            </Stack>

            <Grid container spacing={1.5}>
              {rows.map(r => (
                <Grid item xs={6} sm={4} md={3} key={r.key}>
                  <Box sx={{
                    p: 1.25, border: "1px solid #e3e8ef", borderRadius: 1,
                    bgcolor: r.amount > 0 ? "#f1f8f1" : "transparent"
                  }}>
                    <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.5 }}>
                      {r.label}
                    </Typography>
                    <Stack direction="row" spacing={0.75} alignItems="center">
                      <TextField
                        type="number" size="small" fullWidth disabled={r.disabled}
                        value={r.shareInput} placeholder="0"
                        onChange={e => setShare(r.key, e.target.value)}
                        InputProps={{ endAdornment: <Typography sx={{ color: "text.disabled", fontSize: 11 }}>%</Typography> }}
                        sx={{ "& input": { textAlign: "center", fontWeight: 700, py: 0.6 } }}
                      />
                      <Typography variant="caption" color="text.disabled">/</Typography>
                      <TextField
                        type="number" size="small" fullWidth disabled={r.disabled}
                        value={r.amountInput} placeholder="0"
                        onChange={e => setAmount(r.key, e.target.value)}
                        InputProps={{ startAdornment: <Typography sx={{ color: "text.disabled", fontSize: 11 }}>₹</Typography> }}
                        sx={{ "& input": { fontWeight: 700, py: 0.6 } }}
                      />
                    </Stack>
                    <Typography variant="caption" sx={{
                      display: "block", mt: 0.5,
                      color: r.amount > 0 ? "success.main" : "text.disabled"
                    }}>
                      {r.amount > 0 ? `→ ${money(r.newValue)}` : "not revised"}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>

            <Stack direction="row" spacing={2} alignItems="center" sx={{ mt: 2 }} flexWrap="wrap" useFlexGap>
              <Box sx={{ flex: 1, minWidth: 150 }}>
                <LinearProgress variant="determinate" value={Math.min(100, totalShare)}
                  color={totalShare > 100 ? "error" : totalShare === 100 ? "success" : "primary"}
                  sx={{ height: 6, borderRadius: 3 }} />
              </Box>
              <Chip size="small"
                color={totalShare === 100 ? "success" : totalShare > 100 ? "error" : "default"}
                label={`${totalShare}% allocated`} />
              <Typography variant="caption" color="text.secondary">
                {money(allocated)} allocated
                {unallocated > 0 ? ` · ${money(unallocated)} unallocated` : ""}
              </Typography>
            </Stack>

            {errors.total && <Alert severity="error" sx={{ mt: 2 }}>{errors.total}</Alert>}
            {errors.shares && <Alert severity="error" sx={{ mt: 2 }}>{errors.shares}</Alert>}
          </CardContent>
        </Card>
      )}

      {/* ---------------- Step 3: Review ---------------- */}
      {step === 2 && (
        <Card>
          <CardContent>
            <Table size="small">
              <TableBody>
                <TableRow sx={{ bgcolor: "#f4f7fb" }}>
                  <TableCell sx={{ border: 0, fontWeight: 700 }}>Head</TableCell>
                  <TableCell align="center" sx={{ border: 0, fontWeight: 700 }}>Share</TableCell>
                  <TableCell align="right" sx={{ border: 0, fontWeight: 700 }}>Increase</TableCell>
                  <TableCell align="right" sx={{ border: 0, fontWeight: 700 }}>Current</TableCell>
                  <TableCell align="right" sx={{ border: 0, fontWeight: 700 }}>New</TableCell>
                </TableRow>
                {rows.map(r => (
                  <TableRow key={r.key} sx={{ bgcolor: r.amount > 0 ? "#f1f8f1" : "transparent" }}>
                    <TableCell sx={{ border: 0, py: 0.8 }}>{r.label}</TableCell>
                    <TableCell align="center" sx={{ border: 0 }}>
                      <Typography variant="body2" color="text.secondary">
                        {r.share > 0 ? `${r.share}%` : "—"}
                      </Typography>
                    </TableCell>
                    <TableCell align="right" sx={{ border: 0 }}>
                      <Typography variant="body2" fontWeight={700}
                        color={r.amount > 0 ? "success.main" : "text.disabled"}>
                        {r.amount > 0 ? money(r.amount) : "—"}
                      </Typography>
                    </TableCell>
                    <TableCell align="right" sx={{ border: 0 }}>
                      <Typography variant="body2" color="text.secondary">{money(r.current)}</Typography>
                    </TableCell>
                    <TableCell align="right" sx={{ border: 0 }}>
                      <Typography variant="body2" fontWeight={r.amount > 0 ? 700 : 400}>
                        {money(r.newValue)}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell sx={{ border: 0, pt: 1.5 }}><Typography variant="body2" fontWeight={700}>Total</Typography></TableCell>
                  <TableCell align="center" sx={{ border: 0, pt: 1.5 }}>
                    <Typography variant="body2" fontWeight={700}>{totalShare}%</Typography>
                  </TableCell>
                  <TableCell align="right" sx={{ border: 0, pt: 1.5 }}>
                    <Typography variant="body2" fontWeight={700}
                      color={unallocated > 0 ? "warning.main" : "success.main"}>
                      {money(allocated)}
                    </Typography>
                  </TableCell>
                  <TableCell colSpan={2} align="right" sx={{ border: 0, pt: 1.5 }}>
                    <Typography variant="body2">
                      Gross {money(oldGross)} → <strong style={{ color: "#2e7d32" }}>{money(newGross)}</strong>
                    </Typography>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>

            <Divider sx={{ my: 2 }} />

            <TextField fullWidth size="small" label="Reason *" value={reason} multiline minRows={2}
              error={!!errors.reason} helperText={errors.reason || " "}
              onChange={e => setReason(e.target.value)} />

            <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 2 }}>
              <Typography fontWeight={600}>Arrears</Typography>
              <Switch checked={hasArrears} onChange={e => setHasArrears(e.target.checked)} />
              <Typography variant="body2" color="text.secondary">{hasArrears ? "Yes" : "None"}</Typography>
            </Stack>

            {hasArrears && (
              <>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid item xs={6} md={3}>
                    <TextField select fullWidth size="small" label="From Month" value={arrFromMonth}
                      onChange={e => setArrFromMonth(Number(e.target.value))}>
                      {MONTHS.map(m => <MenuItem key={m.v} value={m.v}>{m.l}</MenuItem>)}
                    </TextField>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <TextField select fullWidth size="small" label="From Year" value={arrFromYear}
                      onChange={e => setArrFromYear(Number(e.target.value))}>
                      {YEARS.map(y => <MenuItem key={y} value={y}>{y}</MenuItem>)}
                    </TextField>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <TextField select fullWidth size="small" label="To Month" value={arrToMonth}
                      onChange={e => setArrToMonth(Number(e.target.value))}>
                      {MONTHS.map(m => <MenuItem key={m.v} value={m.v}>{m.l}</MenuItem>)}
                    </TextField>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <TextField select fullWidth size="small" label="To Year" value={arrToYear}
                      onChange={e => setArrToYear(Number(e.target.value))}>
                      {YEARS.map(y => <MenuItem key={y} value={y}>{y}</MenuItem>)}
                    </TextField>
                  </Grid>
                </Grid>
                {errors.arrears && <Alert severity="error" sx={{ mt: 2 }}>{errors.arrears}</Alert>}
                <Alert severity="warning" sx={{ mt: 2 }}>
                  Arrears for <strong>{arrearsMonths > 0 ? arrearsMonths : 0} month(s)</strong> will be carried with
                  this increment. The amount is worked out during payroll processing.
                </Alert>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Persistent footer */}
      <Paper elevation={0} sx={{
        mt: 2, p: 1.5, border: "1px solid #e3e8ef", borderRadius: 1,
        position: "sticky", bottom: 0, bgcolor: "#fff", zIndex: 5
      }}>
        <Stack direction="row" alignItems="center" spacing={2} flexWrap="wrap" useFlexGap>
          <Typography variant="body2" color="text.secondary">
            {emp ? `${emp.empid} — ${emp.ename}` : "No employee selected"}
          </Typography>
          <Box sx={{ flex: 1 }} />
          {step === 2 && allocated > 0 && (
            <Typography variant="body2">
              <strong>{money(allocated)}</strong> across {rows.filter(r => r.amount > 0).length} head(s)
            </Typography>
          )}
          {step > 0 && (
            <Button startIcon={<ArrowBackIcon />} onClick={() => setStep(s => Math.max(0, s - 1))} disabled={saving}>
              Back
            </Button>
          )}
          {step < 2 ? (
            <Button variant="contained" endIcon={<ArrowForwardIcon />} onClick={goNext}>
              Next
            </Button>
          ) : (
            <Button variant="contained" startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
              onClick={save} disabled={saving}>
              {saving ? "Saving..." : "Save for Approval"}
            </Button>
          )}
        </Stack>
      </Paper>

      <EmployeeSelectDialog
        open={empDialog}
        onClose={() => setEmpDialog(false)}
        onSelect={(e) => {
          setEmpDialog(false);
          setEmp({ empid: e.empid, ename: e.ename, department: e.deptname || e.department, designation: e.designation });
          setTotalAmount("");
          const blank = { basic: "", hra: "", conveyance: "", washing_allowance: "" };
          setShares(blank);
          setAmounts(blank);
          setErrors({});
        }}
        data={employeeList}
      />
    </Box>
  );
};

export default IncrementForm;
