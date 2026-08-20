import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import {
  Box, Card, CardContent, Typography, Grid, TextField, Button,
  FormControl, InputLabel, Select, MenuItem, Switch, FormControlLabel,
  Divider, IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
  List, ListItem, ListItemText, ListItemSecondaryAction, Chip, Tabs, Tab
} from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import SecurityIcon from "@mui/icons-material/Security";
import NotificationsIcon from "@mui/icons-material/Notifications";
import PaletteIcon from "@mui/icons-material/Palette";
import BackupIcon from "@mui/icons-material/Backup";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import SaveIcon from "@mui/icons-material/Save";
import axios from "axios";
import { useToast } from "../../context/ToastContext";
import { useCompany } from "../../context/CompanyContext";

const settingsSections = [
  { id: "company", title: "Company Settings", icon: "🏢", description: "Company name, address, logo, contact info" },
  { id: "payroll", title: "Payroll Settings", icon: "💰", description: "Salary rules, deductions, OT rates" },
  { id: "attendance", title: "Attendance Settings", icon: "📅", description: "Shift timings, grace period, late rules" },
  { id: "leave", title: "Leave Settings", icon: "📋", description: "Leave types, limits, carry forward rules" },
  { id: "email", title: "Email Settings", icon: "📧", description: "SMTP configuration, notifications" },
  { id: "backup", title: "Backup & Restore", icon: "💾", description: "Database backup, data export" }
];

const Settings = () => {
  const { showToast } = useToast();
  const { refreshCompanySettings } = useCompany();
  const [activeSection, setActiveSection] = useState("company");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editData, setEditData] = useState({});

  const [companySettings, setCompanySettings] = useState({
    company_name: "",
    short_name: "",
    address: "",
    phone: "",
    email: "",
    website: "",
    gstin: "",
    cin: "",
    pan: "",
    pf_number: "",
    esi_number: "",
    logo_url: "",
    favicon_url: ""
  });

  React.useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/settings/company`);
      if (res.data) {
        setCompanySettings(res.data);
      }
    } catch (e) {
      console.error("Error fetching company settings", e);
    }
  };

  const [payrollSettings, setPayrollSettings] = useState({
    ptRate: 200,
    professionalTax: 200,
    otRateMultiplier: 1.5,
    daPercentage: 0,
    hraPercentage: 40,
    conveyanceAmount: 1600,
    washingAllowance: 300,
    pfEmployeeRate: 12,
    pfEmployerRate: 12,
    esiEmployeeRate: 0.75,
    esiEmployerRate: 3.75,
    bonusEligibilityDays: 25,
    bonusAmount: 500,
    lateDeductionPerHour: 100,
    lateGraceMinutes: 0
  });

  const [attendanceSettings, setAttendanceSettings] = useState({
    defaultShiftStart: "09:00",
    defaultShiftEnd: "18:00",
    gracePeriod: 0,
    lateDeductionType: "hourly",
    halfDayThreshold: 240,
    maxOtHoursPerDay: 4,
    weeklyOff1: "Sunday",
    weeklyOff2: "",
    workingDaysPerWeek: 6
  });

  const [leaveSettings, setLeaveSettings] = useState({
    clPerYear: 12,
    elPerYear: 12,
    slPerYear: 6,
    mlPerYear: 90,
    clCarryForward: 0,
    elCarryForward: 30,
    leaveEncashmentDays: 15,
    noticePeriodDays: 30
  });

  const [emailSettings, setEmailSettings] = useState({
    smtpHost: "",
    smtpPort: 587,
    smtpUser: "",
    smtpPassword: "",
    fromEmail: "",
    fromName: "HRMS System",
    notifyOnLeave: true,
    notifyOnPayroll: true,
    notifyOnOt: true
  });
  const [editCompanyName, setEditCompanyName] = useState(false);
  const location = useLocation();

  const handleSave = async (section) => {
    if (section === "company") {
      try {
        await axios.post(`/api/settings/company`, companySettings);
        refreshCompanySettings();
        setEditCompanyName(false);
        showToast("Company settings saved successfully", "success");
      } catch (err) {
        showToast("Error saving company settings", "error");
      }
    } else {
      showToast(`${section} settings saved successfully`, "success");
    }
    setDialogOpen(false);
  };

  const handleExport = () => {
    showToast("Data export initiated", "info");
  };

  const handleBackup = () => {
    showToast("Backup started - this may take a few minutes", "info");
  };

  const getCurrentSettings = () => {
    switch (activeSection) {
      case "company": return companySettings;
      case "payroll": return payrollSettings;
      case "attendance": return attendanceSettings;
      case "leave": return leaveSettings;
      case "email": return emailSettings;
      default: return {};
    }
  };

  const setCurrentSettings = (data) => {
    switch (activeSection) {
      case "company": setCompanySettings(data); break;
      case "payroll": setPayrollSettings(data); break;
      case "attendance": setAttendanceSettings(data); break;
      case "leave": setLeaveSettings(data); break;
      case "email": setEmailSettings(data); break;
    }
  };

  const actionButtons = (
    <Box sx={{ p: 0, display: "flex", justifyContent: "flex-end", gap: 2 }}>
      <Button variant="outlined" onClick={() => setActiveSection(activeSection)}>
        Reset
      </Button>
      <Button variant="contained" startIcon={<SaveIcon />} onClick={() => handleSave(activeSection)}>
        Save Settings
      </Button>
    </Box>
  );

  const renderSettingsForm = () => {
    const settings = getCurrentSettings();
    switch (activeSection) {
      case "company":
        return (

          <Box sx={{ width: '100%' }}>
            {/* Row 1: 3 Columns Stretched */}
            <Box
              sx={{
                display: "flex",
                gap: 2,
                mb: 1,
                flexDirection: { xs: "column", md: "row" }, // 👈 key change
              }}
            >

              {/* LEFT: Company + Address */}
              <Box
                sx={{
                  flex: 1,
                  display: "flex",
                  gap: 2,
                  flexDirection: "column",
                }}
              >

                {/* Top row: Company Name (locked) | Short Name | Top Bar Title */}
                <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", alignItems: "flex-start", mb: 1.5 }}>
                  <Box sx={{ flex: "2 1 260px", display: "flex", gap: 1, alignItems: "flex-start" }}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Company Name"
                      value={companySettings.company_name || ""}
                      disabled={!editCompanyName && !!companySettings.company_name}
                      onChange={(e) =>
                        setCompanySettings({
                          ...companySettings,
                          company_name: e.target.value,
                        })
                      }
                      inputProps={{ style: { fontWeight: "bold" } }}
                      helperText={!editCompanyName && companySettings.company_name ? "Locked after setup. Click Edit to change." : ""}
                    />
                    {companySettings.company_name && (
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => setEditCompanyName(v => !v)}
                        sx={{ flexShrink: 0, mt: 0.5, whiteSpace: "nowrap" }}
                      >
                        {editCompanyName ? "Lock" : "Edit"}
                      </Button>
                    )}
                  </Box>
                  <TextField
                    size="small"
                    label="Short Name (brand)"
                    placeholder="e.g. ACME"
                    value={companySettings.short_name || ""}
                    onChange={(e) =>
                      setCompanySettings({
                        ...companySettings,
                        short_name: e.target.value,
                      })
                    }
                    sx={{ flex: "1 1 160px" }}
                  />
                  <TextField
                    size="small"
                    label="Top Bar Title"
                    placeholder="e.g. ACME ERP"
                    value={companySettings.title || ""}
                    onChange={(e) =>
                      setCompanySettings({
                        ...companySettings,
                        title: e.target.value,
                      })
                    }
                    helperText="Shown to the right of the logo in the top bar."
                    sx={{ flex: "1 1 160px" }}
                  />
                </Box>

                {/* Address — second row, directly below Company Name row */}
                <TextField
                  fullWidth
                  size="small"
                  label="Registered Address"
                  multiline
                  rows={2}
                  value={companySettings.address || ""}
                  onChange={(e) =>
                    setCompanySettings({
                      ...companySettings,
                      address: e.target.value,
                    })
                  }
                  sx={{ mb: 1.5 }}
                />

                {/* Contact & statutory details — below address */}
                <Grid container spacing={1} sx={{ mb: 1.5 }}>
                  <Grid item xs={6} sm={4} md={2}>
                    <TextField
                      fullWidth
                      label="Phone"
                      size="small"
                      value={companySettings.phone || ""}
                      onChange={(e) => setCompanySettings({ ...companySettings, phone: e.target.value })}
                    />
                  </Grid>
                  <Grid item xs={6} sm={4} md={2}>
                    <TextField
                      fullWidth
                      label="Email"
                      size="small"
                      value={companySettings.email || ""}
                      onChange={(e) => setCompanySettings({ ...companySettings, email: e.target.value })}
                    />
                  </Grid>
                  <Grid item xs={6} sm={4} md={2}>
                    <TextField
                      fullWidth
                      label="Website"
                      size="small"
                      value={companySettings.website || ""}
                      onChange={(e) => setCompanySettings({ ...companySettings, website: e.target.value })}
                    />
                  </Grid>
                  <Grid item xs={6} sm={4} md={2}>
                    <TextField
                      fullWidth
                      label="GSTIN"
                      size="small"
                      value={companySettings.gstin || ""}
                      onChange={(e) => setCompanySettings({ ...companySettings, gstin: e.target.value })}
                    />
                  </Grid>
                  <Grid item xs={6} sm={4} md={2}>
                    <TextField
                      fullWidth
                      label="CIN"
                      size="small"
                      value={companySettings.cin || ""}
                      onChange={(e) => setCompanySettings({ ...companySettings, cin: e.target.value })}
                    />
                  </Grid>
                  <Grid item xs={6} sm={4} md={2}>
                    <TextField
                      fullWidth
                      label="PAN"
                      size="small"
                      value={companySettings.pan || ""}
                      onChange={(e) => setCompanySettings({ ...companySettings, pan: e.target.value })}
                    />
                  </Grid>
                  <Grid item xs={6} sm={4} md={2}>
                    <TextField
                      fullWidth
                      label="PF Number"
                      size="small"
                      value={companySettings.pf_number || ""}
                      onChange={(e) => setCompanySettings({ ...companySettings, pf_number: e.target.value })}
                    />
                  </Grid>
                  <Grid item xs={6} sm={4} md={2}>
                    <TextField
                      fullWidth
                      label="ESI Number"
                      size="small"
                      value={companySettings.esi_number || ""}
                      onChange={(e) => setCompanySettings({ ...companySettings, esi_number: e.target.value })}
                    />
                  </Grid>
                </Grid>

              </Box>

              {/* Logo + Favicon (stacked vertically to save horizontal space) */}
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                  flexShrink: 0,
                }}
              >
              <Box
                sx={{
                  width: { xs: "100%", md: 140 },
                  height: 56,
                  border: "1px dashed #bbb",
                  borderRadius: 1,
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 1,
                  bgcolor: "#fafafa",
                  px: 1,
                  flexShrink: 0,
                }}
              >
                {companySettings.logo_url ? (
                  <img
                    src={companySettings.logo_url}
                    alt="Logo"
                    style={{ maxHeight: 36, maxWidth: 60, objectFit: "contain" }}
                  />
                ) : (
                  <Box sx={{ fontSize: "1.2rem", lineHeight: 1 }}>🖼️</Box>
                )}
                 <Button
                   size="small"
                   variant="outlined"
                   component="label"
                   sx={{ fontSize: "0.65rem", py: 0.3, px: 1, minWidth: 0, whiteSpace: "nowrap" }}
                 >
                   Upload
                   <input
                     type="file"
                     hidden
                     accept="image/*"
                     onChange={(e) => {
                       const file = e.target.files?.[0];
                       if (!file) return;
                       const reader = new FileReader();
                       reader.onload = () => {
                         setCompanySettings({ ...companySettings, logo_url: reader.result });
                       };
                       reader.readAsDataURL(file);
                     }}
                   />
                  </Button>
               </Box>

              {/* Favicon (browser tab icon) */}
              <Box
                sx={{
                  width: { xs: "100%", md: 200 },
                  border: "1px dashed #bbb",
                  borderRadius: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 1,
                  bgcolor: "#fafafa",
                  p: 1.5,
                  flexShrink: 0,
                }}
              >
                <Box sx={{ fontSize: "0.7rem", fontWeight: 600, color: "#555", textAlign: "center" }}>
                  Browser Tab Icon (favicon)
                </Box>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    border: "1px solid #ddd",
                    borderRadius: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: "#fff",
                    overflow: "hidden",
                  }}
                >
                  {companySettings.favicon_url ? (
                    <img
                      src={companySettings.favicon_url}
                      alt="Favicon"
                      style={{ width: 40, height: 40, objectFit: "contain" }}
                    />
                  ) : companySettings.logo_url ? (
                    <img
                      src={companySettings.logo_url}
                      alt="Logo as favicon"
                      style={{ width: 40, height: 40, objectFit: "contain" }}
                    />
                  ) : (
                    <Box sx={{ fontSize: "1.1rem", lineHeight: 1 }}>🖼️</Box>
                  )}
                </Box>
                <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap", justifyContent: "center" }}>
                  <Button
                    size="small"
                    variant="outlined"
                    component="label"
                    sx={{ fontSize: "0.65rem", py: 0.3, px: 1, minWidth: 0, whiteSpace: "nowrap" }}
                  >
                    Upload
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = () => {
                          setCompanySettings({ ...companySettings, favicon_url: reader.result });
                        };
                        reader.readAsDataURL(file);
                      }}
                    />
                  </Button>
                  <Button
                    size="small"
                    variant="text"
                    sx={{ fontSize: "0.65rem", py: 0.3, px: 1, minWidth: 0, whiteSpace: "nowrap" }}
                    onClick={() =>
                      setCompanySettings({ ...companySettings, favicon_url: companySettings.logo_url || "" })
                    }
                  >
                    Use Logo
                  </Button>
                  {companySettings.favicon_url && (
                    <Button
                      size="small"
                      variant="text"
                      color="error"
                      sx={{ fontSize: "0.65rem", py: 0.3, px: 1, minWidth: 0, whiteSpace: "nowrap" }}
                      onClick={() => setCompanySettings({ ...companySettings, favicon_url: "" })}
                    >
                      Clear
                    </Button>
                  )}
                </Box>
                <Box sx={{ fontSize: "0.6rem", color: "#888", textAlign: "center" }}>
                  Small square icon recommended. Falls back to logo when empty.
                </Box>
              </Box>

              {actionButtons}
              </Box>

            </Box>


          </Box>
        );

      case "payroll":
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <TextField fullWidth type="number" label="Professional Tax (₹)" value={payrollSettings.professionalTax}
                onChange={(e) => setPayrollSettings({ ...payrollSettings, professionalTax: e.target.value })} />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth type="number" label="OT Rate Multiplier" value={payrollSettings.otRateMultiplier}
                onChange={(e) => setPayrollSettings({ ...payrollSettings, otRateMultiplier: e.target.value })} />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth type="number" label="HRA %" value={payrollSettings.hraPercentage}
                onChange={(e) => setPayrollSettings({ ...payrollSettings, hraPercentage: e.target.value })} />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth type="number" label="Conveyance (₹)" value={payrollSettings.conveyanceAmount}
                onChange={(e) => setPayrollSettings({ ...payrollSettings, conveyanceAmount: e.target.value })} />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth type="number" label="PF Employee %" value={payrollSettings.pfEmployeeRate}
                onChange={(e) => setPayrollSettings({ ...payrollSettings, pfEmployeeRate: e.target.value })} />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth type="number" label="ESI Employee %" value={payrollSettings.esiEmployeeRate}
                onChange={(e) => setPayrollSettings({ ...payrollSettings, esiEmployeeRate: e.target.value })} />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth type="number" label="Bonus Eligibility (days)" value={payrollSettings.bonusEligibilityDays}
                onChange={(e) => setPayrollSettings({ ...payrollSettings, bonusEligibilityDays: e.target.value })} />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth type="number" label="Bonus Amount (₹)" value={payrollSettings.bonusAmount}
                onChange={(e) => setPayrollSettings({ ...payrollSettings, bonusAmount: e.target.value })} />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth type="number" label="Late Deduction/Hour (₹)" value={payrollSettings.lateDeductionPerHour}
                onChange={(e) => setPayrollSettings({ ...payrollSettings, lateDeductionPerHour: e.target.value })} />
            </Grid>
          </Grid>
        );

      case "attendance":
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField fullWidth type="time" label="Default Shift Start" value={attendanceSettings.defaultShiftStart}
                onChange={(e) => setAttendanceSettings({ ...attendanceSettings, defaultShiftStart: e.target.value })} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth type="time" label="Default Shift End" value={attendanceSettings.defaultShiftEnd}
                onChange={(e) => setAttendanceSettings({ ...attendanceSettings, defaultShiftEnd: e.target.value })} />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth type="number" label="Grace Period (minutes)" value={attendanceSettings.gracePeriod}
                onChange={(e) => setAttendanceSettings({ ...attendanceSettings, gracePeriod: e.target.value })} />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth type="number" label="Max OT Hours/Day" value={attendanceSettings.maxOtHoursPerDay}
                onChange={(e) => setAttendanceSettings({ ...attendanceSettings, maxOtHoursPerDay: e.target.value })} />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth type="number" label="Working Days/Week" value={attendanceSettings.workingDaysPerWeek}
                onChange={(e) => setAttendanceSettings({ ...attendanceSettings, workingDaysPerWeek: e.target.value })} />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>First Weekly Off</InputLabel>
                <Select value={attendanceSettings.weeklyOff1} label="First Weekly Off"
                  onChange={(e) => setAttendanceSettings({ ...attendanceSettings, weeklyOff1: e.target.value })}>
                  <MenuItem value="Sunday">Sunday</MenuItem>
                  <MenuItem value="Monday">Monday</MenuItem>
                  <MenuItem value="Saturday">Saturday</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Second Weekly Off</InputLabel>
                <Select value={attendanceSettings.weeklyOff2} label="Second Weekly Off"
                  onChange={(e) => setAttendanceSettings({ ...attendanceSettings, weeklyOff2: e.target.value })}>
                  <MenuItem value="">None</MenuItem>
                  <MenuItem value="Sunday">Sunday</MenuItem>
                  <MenuItem value="Monday">Monday</MenuItem>
                  <MenuItem value="Saturday">Saturday</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        );

      case "leave":
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <TextField fullWidth type="number" label="CL Per Year" value={leaveSettings.clPerYear}
                onChange={(e) => setLeaveSettings({ ...leaveSettings, clPerYear: e.target.value })} />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth type="number" label="EL Per Year" value={leaveSettings.elPerYear}
                onChange={(e) => setLeaveSettings({ ...leaveSettings, elPerYear: e.target.value })} />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth type="number" label="SL Per Year" value={leaveSettings.slPerYear}
                onChange={(e) => setLeaveSettings({ ...leaveSettings, slPerYear: e.target.value })} />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth type="number" label="ML Per Year" value={leaveSettings.mlPerYear}
                onChange={(e) => setLeaveSettings({ ...leaveSettings, mlPerYear: e.target.value })} />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth type="number" label="EL Carry Forward Max" value={leaveSettings.elCarryForward}
                onChange={(e) => setLeaveSettings({ ...leaveSettings, elCarryForward: e.target.value })} />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth type="number" label="Leave Encashment Days" value={leaveSettings.leaveEncashmentDays}
                onChange={(e) => setLeaveSettings({ ...leaveSettings, leaveEncashmentDays: e.target.value })} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth type="number" label="Notice Period (Days)" value={leaveSettings.noticePeriodDays}
                onChange={(e) => setLeaveSettings({ ...leaveSettings, noticePeriodDays: e.target.value })} />
            </Grid>
          </Grid>
        );

      case "email":
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="SMTP Host" value={emailSettings.smtpHost}
                onChange={(e) => setEmailSettings({ ...emailSettings, smtpHost: e.target.value })} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth type="number" label="SMTP Port" value={emailSettings.smtpPort}
                onChange={(e) => setEmailSettings({ ...emailSettings, smtpPort: e.target.value })} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="SMTP Username" value={emailSettings.smtpUser}
                onChange={(e) => setEmailSettings({ ...emailSettings, smtpUser: e.target.value })} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth type="password" label="SMTP Password" value={emailSettings.smtpPassword}
                onChange={(e) => setEmailSettings({ ...emailSettings, smtpPassword: e.target.value })} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="From Email" value={emailSettings.fromEmail}
                onChange={(e) => setEmailSettings({ ...emailSettings, fromEmail: e.target.value })} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="From Name" value={emailSettings.fromName}
                onChange={(e) => setEmailSettings({ ...emailSettings, fromName: e.target.value })} />
            </Grid>
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2" sx={{ mb: 2 }}>Notification Settings</Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControlLabel control={
                <Switch checked={emailSettings.notifyOnLeave}
                  onChange={(e) => setEmailSettings({ ...emailSettings, notifyOnLeave: e.target.checked })} />
              } label="Notify on Leave Application" />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControlLabel control={
                <Switch checked={emailSettings.notifyOnPayroll}
                  onChange={(e) => setEmailSettings({ ...emailSettings, notifyOnPayroll: e.target.checked })} />
              } label="Notify on Payroll Processing" />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControlLabel control={
                <Switch checked={emailSettings.notifyOnOt}
                  onChange={(e) => setEmailSettings({ ...emailSettings, notifyOnOt: e.target.checked })} />
              } label="Notify on OT Approval" />
            </Grid>
          </Grid>
        );

      case "backup":
        return (
          <Box>
            <Card sx={{ bgcolor: "#f5f5f5", mb: 3 }}>
              <CardContent>
                <Typography variant="subtitle1" sx={{ mb: 2 }}>Database Backup</Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                  Create a backup of your database. This will download all your data in a compressed file.
                </Typography>
                <Button variant="contained" startIcon={<BackupIcon />} onClick={handleBackup}>
                  Create Backup Now
                </Button>
              </CardContent>
            </Card>

            <Card sx={{ bgcolor: "#f5f5f5", mb: 3 }}>
              <CardContent>
                <Typography variant="subtitle1" sx={{ mb: 2 }}>Export Data</Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                  Export employee data, attendance records, and payroll data to Excel/CSV format.
                </Typography>
                <Button variant="outlined" startIcon={<BackupIcon />} onClick={handleExport}>
                  Export All Data
                </Button>
              </CardContent>
            </Card>

            <Card sx={{ bgcolor: "#fff3e0" }}>
              <CardContent>
                <Typography variant="subtitle1" sx={{ mb: 2, color: "orange" }}>Last Backup Info</Typography>
                <Typography variant="body2">
                  Last Backup: Not available
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Backups are recommended weekly or before major system changes.
                </Typography>
              </CardContent>
            </Card>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Box sx={{ m: 1 }}>
      <Card>
        <Box sx={{ p: 1.5, borderBottom: "1px solid #eee" }}>
          <Typography variant="h4" sx={{ fontWeight: "bold", color: "var(--heading-color)" }}>
            {location.pathname.startsWith("/hr") ? "HR Settings" : "Settings"}
          </Typography>
        </Box>
        <CardContent sx={{ p: 1.5 }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 1, bgcolor: '#f8f9fa' }}>
            <Tabs
              value={activeSection}
              onChange={(e, val) => setActiveSection(val)}
              variant="scrollable"
              scrollButtons="auto"
              textColor="primary"
              indicatorColor="primary"
            >
              {settingsSections.map((section) => (
                <Tab
                  key={section.id}
                  value={section.id}
                  label={section.title}
                  icon={<span>{section.icon}</span>}
                  iconPosition="start"
                  sx={{ minHeight: 64, fontWeight: 'bold' }}
                />
              ))}
            </Tabs>
          </Box>

          <Card variant="outlined">
            <Box sx={{ p: 1.5, bgcolor: "#fbfbfb", borderBottom: "1px solid #eee" }}>
              <Typography variant="subtitle2" fontWeight="bold" color="primary">
                {settingsSections.find(s => s.id === activeSection)?.title}
              </Typography>
            </Box>
            <CardContent sx={{ p: 2 }}>
              {renderSettingsForm()}
            </CardContent>
            {activeSection !== "backup" && activeSection !== "company" && (
              <Box sx={{ p: 2, display: "flex", justifyContent: "flex-end", gap: 2 }}>
                <Button variant="outlined" onClick={() => setActiveSection(activeSection)}>
                  Reset
                </Button>
                <Button variant="contained" startIcon={<SaveIcon />} onClick={() => handleSave(activeSection)}>
                  Save Settings
                </Button>
              </Box>
            )}
          </Card>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Settings;