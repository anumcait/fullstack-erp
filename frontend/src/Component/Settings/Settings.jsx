import React, { useState } from "react";
import {
  Box, Card, CardContent, Typography, Grid, TextField, Button,
  FormControl, InputLabel, Select, MenuItem, Switch, FormControlLabel,
  Divider, IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
  List, ListItem, ListItemText, ListItemSecondaryAction, Chip
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
import { useToast } from "../../context/ToastContext";

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
  const [activeSection, setActiveSection] = useState("company");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editData, setEditData] = useState({});

  const [companySettings, setCompanySettings] = useState({
    companyName: "AUCTOR ENGINEERING PVT LTD",
    address: "IDA Jeedimetla, Hyderabad - 500055",
    phone: "+91 40 27565789",
    email: "info@auctor.co.in",
    website: "www.auctor.co.in",
    gstin: "36AABCA1234P1ZX",
    pfNumber: "AP/TD/123456/789",
    esiNumber: "12-34567-89"
  });

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

  const handleSave = (section) => {
    showToast(`${section} settings saved successfully`, "success");
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

  const renderSettingsForm = () => {
    const settings = getCurrentSettings();
    
    switch (activeSection) {
      case "company":
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Company Name" value={companySettings.companyName}
                onChange={(e) => setCompanySettings({...companySettings, companyName: e.target.value})} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Phone" value={companySettings.phone}
                onChange={(e) => setCompanySettings({...companySettings, phone: e.target.value})} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Address" multiline rows={2} value={companySettings.address}
                onChange={(e) => setCompanySettings({...companySettings, address: e.target.value})} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Email" value={companySettings.email}
                onChange={(e) => setCompanySettings({...companySettings, email: e.target.value})} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Website" value={companySettings.website}
                onChange={(e) => setCompanySettings({...companySettings, website: e.target.value})} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="GSTIN" value={companySettings.gstin}
                onChange={(e) => setCompanySettings({...companySettings, gstin: e.target.value})} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="PF Number" value={companySettings.pfNumber}
                onChange={(e) => setCompanySettings({...companySettings, pfNumber: e.target.value})} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="ESI Number" value={companySettings.esiNumber}
                onChange={(e) => setCompanySettings({...companySettings, esiNumber: e.target.value})} />
            </Grid>
          </Grid>
        );

      case "payroll":
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <TextField fullWidth type="number" label="Professional Tax (₹)" value={payrollSettings.professionalTax}
                onChange={(e) => setPayrollSettings({...payrollSettings, professionalTax: e.target.value})} />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth type="number" label="OT Rate Multiplier" value={payrollSettings.otRateMultiplier}
                onChange={(e) => setPayrollSettings({...payrollSettings, otRateMultiplier: e.target.value})} />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth type="number" label="HRA %" value={payrollSettings.hraPercentage}
                onChange={(e) => setPayrollSettings({...payrollSettings, hraPercentage: e.target.value})} />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth type="number" label="Conveyance (₹)" value={payrollSettings.conveyanceAmount}
                onChange={(e) => setPayrollSettings({...payrollSettings, conveyanceAmount: e.target.value})} />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth type="number" label="PF Employee %" value={payrollSettings.pfEmployeeRate}
                onChange={(e) => setPayrollSettings({...payrollSettings, pfEmployeeRate: e.target.value})} />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth type="number" label="ESI Employee %" value={payrollSettings.esiEmployeeRate}
                onChange={(e) => setPayrollSettings({...payrollSettings, esiEmployeeRate: e.target.value})} />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth type="number" label="Bonus Eligibility (days)" value={payrollSettings.bonusEligibilityDays}
                onChange={(e) => setPayrollSettings({...payrollSettings, bonusEligibilityDays: e.target.value})} />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth type="number" label="Bonus Amount (₹)" value={payrollSettings.bonusAmount}
                onChange={(e) => setPayrollSettings({...payrollSettings, bonusAmount: e.target.value})} />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth type="number" label="Late Deduction/Hour (₹)" value={payrollSettings.lateDeductionPerHour}
                onChange={(e) => setPayrollSettings({...payrollSettings, lateDeductionPerHour: e.target.value})} />
            </Grid>
          </Grid>
        );

      case "attendance":
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField fullWidth type="time" label="Default Shift Start" value={attendanceSettings.defaultShiftStart}
                onChange={(e) => setAttendanceSettings({...attendanceSettings, defaultShiftStart: e.target.value})} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth type="time" label="Default Shift End" value={attendanceSettings.defaultShiftEnd}
                onChange={(e) => setAttendanceSettings({...attendanceSettings, defaultShiftEnd: e.target.value})} />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth type="number" label="Grace Period (minutes)" value={attendanceSettings.gracePeriod}
                onChange={(e) => setAttendanceSettings({...attendanceSettings, gracePeriod: e.target.value})} />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth type="number" label="Max OT Hours/Day" value={attendanceSettings.maxOtHoursPerDay}
                onChange={(e) => setAttendanceSettings({...attendanceSettings, maxOtHoursPerDay: e.target.value})} />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth type="number" label="Working Days/Week" value={attendanceSettings.workingDaysPerWeek}
                onChange={(e) => setAttendanceSettings({...attendanceSettings, workingDaysPerWeek: e.target.value})} />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>First Weekly Off</InputLabel>
                <Select value={attendanceSettings.weeklyOff1} label="First Weekly Off"
                  onChange={(e) => setAttendanceSettings({...attendanceSettings, weeklyOff1: e.target.value})}>
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
                  onChange={(e) => setAttendanceSettings({...attendanceSettings, weeklyOff2: e.target.value})}>
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
                onChange={(e) => setLeaveSettings({...leaveSettings, clPerYear: e.target.value})} />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth type="number" label="EL Per Year" value={leaveSettings.elPerYear}
                onChange={(e) => setLeaveSettings({...leaveSettings, elPerYear: e.target.value})} />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth type="number" label="SL Per Year" value={leaveSettings.slPerYear}
                onChange={(e) => setLeaveSettings({...leaveSettings, slPerYear: e.target.value})} />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth type="number" label="ML Per Year" value={leaveSettings.mlPerYear}
                onChange={(e) => setLeaveSettings({...leaveSettings, mlPerYear: e.target.value})} />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth type="number" label="EL Carry Forward Max" value={leaveSettings.elCarryForward}
                onChange={(e) => setLeaveSettings({...leaveSettings, elCarryForward: e.target.value})} />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth type="number" label="Leave Encashment Days" value={leaveSettings.leaveEncashmentDays}
                onChange={(e) => setLeaveSettings({...leaveSettings, leaveEncashmentDays: e.target.value})} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth type="number" label="Notice Period (Days)" value={leaveSettings.noticePeriodDays}
                onChange={(e) => setLeaveSettings({...leaveSettings, noticePeriodDays: e.target.value})} />
            </Grid>
          </Grid>
        );

      case "email":
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="SMTP Host" value={emailSettings.smtpHost}
                onChange={(e) => setEmailSettings({...emailSettings, smtpHost: e.target.value})} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth type="number" label="SMTP Port" value={emailSettings.smtpPort}
                onChange={(e) => setEmailSettings({...emailSettings, smtpPort: e.target.value})} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="SMTP Username" value={emailSettings.smtpUser}
                onChange={(e) => setEmailSettings({...emailSettings, smtpUser: e.target.value})} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth type="password" label="SMTP Password" value={emailSettings.smtpPassword}
                onChange={(e) => setEmailSettings({...emailSettings, smtpPassword: e.target.value})} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="From Email" value={emailSettings.fromEmail}
                onChange={(e) => setEmailSettings({...emailSettings, fromEmail: e.target.value})} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="From Name" value={emailSettings.fromName}
                onChange={(e) => setEmailSettings({...emailSettings, fromName: e.target.value})} />
            </Grid>
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2" sx={{ mb: 2 }}>Notification Settings</Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControlLabel control={
                <Switch checked={emailSettings.notifyOnLeave}
                  onChange={(e) => setEmailSettings({...emailSettings, notifyOnLeave: e.target.checked})} />
              } label="Notify on Leave Application" />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControlLabel control={
                <Switch checked={emailSettings.notifyOnPayroll}
                  onChange={(e) => setEmailSettings({...emailSettings, notifyOnPayroll: e.target.checked})} />
              } label="Notify on Payroll Processing" />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControlLabel control={
                <Switch checked={emailSettings.notifyOnOt}
                  onChange={(e) => setEmailSettings({...emailSettings, notifyOnOt: e.target.checked})} />
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
    <Box sx={{ m: 2 }}>
      <Card>
        <Box sx={{ bgcolor: "#1976d2", color: "white", p: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="h6">Settings</Typography>
        </Box>
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={3}>
              <Card sx={{ bgcolor: "#f8f9fa" }}>
                <List>
                  {settingsSections.map((section) => (
                    <ListItem
                      key={section.id}
                      button
                      selected={activeSection === section.id}
                      onClick={() => setActiveSection(section.id)}
                      sx={{
                        cursor: "pointer",
                        "&.Mui-selected": { bgcolor: "#e3f2fd" },
                        "&:hover": { bgcolor: "#e3f2fd" }
                      }}
                    >
                      <Box sx={{ mr: 2, fontSize: "1.5rem" }}>{section.icon}</Box>
                      <ListItemText
                        primary={section.title}
                        secondary={section.description}
                        primaryTypographyProps={{ variant: "body2", fontWeight: "bold" }}
                        secondaryTypographyProps={{ variant: "caption" }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Card>
            </Grid>

            <Grid item xs={12} md={9}>
              <Card>
                <Box sx={{ p: 2, bgcolor: "#f5f5f5", borderBottom: "1px solid #ddd" }}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {settingsSections.find(s => s.id === activeSection)?.title}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {settingsSections.find(s => s.id === activeSection)?.description}
                  </Typography>
                </Box>
                <CardContent>
                  {renderSettingsForm()}
                </CardContent>
                {activeSection !== "backup" && (
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
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Settings;