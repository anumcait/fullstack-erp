import React, { useState, useEffect } from "react";
import {
  Box, Card, CardContent, Typography, Grid, Button, Dialog, DialogTitle,
  DialogContent, FormControl, InputLabel, Select, MenuItem, TextField,
  Table, TableHead, TableBody, TableRow, TableCell, TableContainer, Paper, IconButton,
  Chip, Tabs, Tab
} from "@mui/material";
import axios from "axios";
import { useToast } from "../../context/ToastContext";
import PrintIcon from "@mui/icons-material/Print";
import DownloadIcon from "@mui/icons-material/Download";
import CloseIcon from "@mui/icons-material/Close";
import RefreshIcon from "@mui/icons-material/Refresh";
import ClearIcon from "@mui/icons-material/Clear";
import SearchIcon from "@mui/icons-material/Search";

const leftReports = [
  { id: "shift-change", title: "Shift Change Reports", icon: "🔄" },
  { id: "woff-change", title: "Weekly Off Change Reports", icon: "📅" },
  { id: "ot", title: "OT Reports", icon: "⏰" },
  { id: "tour", title: "Tour Reports", icon: "✈️" },
  { id: "late-coming", title: "Late Coming Reports", icon: "⏱️" },
  { id: "advance", title: "Advance Reports", icon: "💵" },
  { id: "leave", title: "Leave Reports", icon: "📋" }
];

const rightReports = [
  { id: "employee", title: "Employee Reports", icon: "👥" },
  { id: "attendance", title: "Attendance Reports", icon: "📅" },
  { id: "salary", title: "Salary Reports", icon: "💰" },
  { id: "appraisal", title: "Appraisal Reports", icon: "📊" },
  { id: "meals-coupon", title: "Meals Coupon Report", icon: "🍽️" },
  { id: "other-earnings", title: "Other Earnings And Deduction Report", icon: "📝" },
  { id: "pt", title: "PT Report", icon: "📄" },
  { id: "pf", title: "PF Reports", icon: "🏦" }
];

const Reports = () => {
  const { showToast } = useToast();
  const [selectedReport, setSelectedReport] = useState(null);
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [tabValue, setTabValue] = useState(0);
  const [filters, setFilters] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    empid: "",
    department: "",
    status: "",
    fromDate: "",
    toDate: ""
  });

  const months = [
    { value: 1, label: "January" }, { value: 2, label: "February" },
    { value: 3, label: "March" }, { value: 4, label: "April" },
    { value: 5, label: "May" }, { value: 6, label: "June" },
    { value: 7, label: "July" }, { value: 8, label: "August" },
    { value: 9, label: "September" }, { value: 10, label: "October" },
    { value: 11, label: "November" }, { value: 12, label: "December" }
  ];

  const handleReportClick = (report) => {
    setSelectedReport(report);
    setDialogOpen(true);
    fetchReportData(report.id);
  };

  const fetchReportData = async (reportId) => {
    setLoading(true);
    try {
      let url = "";
      let params = {};
      
      const dateParams = {
        startDate: filters.fromDate || `${filters.year}-${String(filters.month).padStart(2, '0')}-01`,
        endDate: filters.toDate || `${filters.year}-${String(filters.month).padStart(2, '0')}-31`
      };
      
      switch (reportId) {
        case "employee":
          url = `${import.meta.env.VITE_API_URL}/api/employees`;
          break;
        case "leave":
          url = `${import.meta.env.VITE_API_URL}/api/leave/report`;
          params = dateParams;
          break;
        case "attendance":
          url = `${import.meta.env.VITE_API_URL}/api/attendance`;
          params = dateParams;
          break;
        case "muster":
          url = `${import.meta.env.VITE_API_URL}/api/attendance/muster-roll`;
          params = { month: filters.month, year: filters.year };
          break;
        case "ot":
          url = `${import.meta.env.VITE_API_URL}/api/attendance/ot-approval`;
          params = { month: filters.month, year: filters.year };
          break;
        case "shift-change":
          url = `${import.meta.env.VITE_API_URL}/api/shift/change-report`;
          params = dateParams;
          break;
        case "woff-change":
          url = `${import.meta.env.VITE_API_URL}/api/woff/report`;
          params = dateParams;
          break;
        case "tour":
          url = `${import.meta.env.VITE_API_URL}/api/tour/report`;
          params = dateParams;
          break;
        case "late-coming":
          url = `${import.meta.env.VITE_API_URL}/api/attendance/late-report`;
          params = { month: filters.month, year: filters.year, lateOnly: true };
          break;
        case "advance":
          url = `${import.meta.env.VITE_API_URL}/api/advance/report`;
          params = dateParams;
          break;
        case "salary":
          url = `${import.meta.env.VITE_API_URL}/api/payroll/register`;
          params = { month: filters.month, year: filters.year };
          break;
        case "pf":
          url = `${import.meta.env.VITE_API_URL}/api/payroll/pf-report`;
          params = { month: filters.month, year: filters.year };
          break;
        case "pt":
          url = `${import.meta.env.VITE_API_URL}/api/payroll/pt-report`;
          params = { month: filters.month, year: filters.year };
          break;
        case "shift":
          url = `${import.meta.env.VITE_API_URL}/api/shift/schedules`;
          params = { month: filters.month, year: filters.year };
          break;
        case "holiday":
          url = `${import.meta.env.VITE_API_URL}/api/holidays`;
          params = { year: filters.year };
          break;
        case "meals-coupon":
          url = `${import.meta.env.VITE_API_URL}/api/employees/meals-coupon`;
          params = { month: filters.month, year: filters.year };
          break;
        case "appraisal":
          url = `${import.meta.env.VITE_API_URL}/api/employees/appraisal`;
          params = { year: filters.year };
          break;
        case "other-earnings":
          url = `${import.meta.env.VITE_API_URL}/api/payroll/earnings-deductions`;
          params = { month: filters.month, year: filters.year };
          break;
        default:
          url = `${import.meta.env.VITE_API_URL}/api/employees`;
      }

      const res = await axios.get(url, { params });
      setReportData(Array.isArray(res.data) ? res.data : (res.data.data || []));
    } catch (err) {
      console.error("Error fetching report:", err);
      showToast("Error fetching report data", "error");
      setReportData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = (format) => {
    if (reportData.length === 0) {
      showToast("No data to export", "warning");
      return;
    }

    if (format === "csv") {
      exportToCSV();
    } else if (format === "print") {
      window.print();
    }
  };

  const exportToCSV = () => {
    if (reportData.length === 0) return;
    
    const headers = Object.keys(reportData[0]);
    const csvContent = [
      headers.join(","),
      ...reportData.map(row => 
        headers.map(h => {
          const val = row[h];
          if (val === null || val === undefined) return "";
          const str = String(val);
          return str.includes(",") || str.includes('"') 
            ? `"${str.replace(/"/g, '""')}"` 
            : str;
        }).join(",")
      )
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${selectedReport?.title?.replace(/\s+/g, "_")}_${filters.year}_${filters.month}.csv`;
    link.click();
    showToast("Report exported successfully", "success");
  };

  const clearFilters = () => {
    setFilters({
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      empid: "",
      department: "",
      status: "",
      fromDate: "",
      toDate: ""
    });
    setSearchText("");
  };

  const refreshData = () => {
    if (selectedReport) {
      fetchReportData(selectedReport.id);
    }
  };

  const filteredData = reportData.filter(row => {
    if (!searchText) return true;
    return Object.values(row).some(val => 
      String(val).toLowerCase().includes(searchText.toLowerCase())
    );
  });

  const getColumns = (reportId) => {
    switch (reportId) {
      case "employee":
        return ["Emp ID", "Name", "Department", "Designation", "DOJ", "Status"];
      case "leave":
        return ["App No", "Date", "Emp ID", "Name", "Leave Type", "From", "To", "Days", "Status"];
      case "attendance":
        return ["Date", "Emp ID", "Name", "In Time", "Out Time", "Status", "Late Hrs", "OT Hrs"];
      case "ot":
        return ["Date", "Emp ID", "Name", "Actual OT", "Manager OT", "HR OT", "Status"];
      case "shift-change":
        return ["App No", "Date", "Emp ID", "Name", "Current Shift", "Requested Shift", "Reason", "Status"];
      case "woff-change":
        return ["App No", "Date", "Emp ID", "Name", "Current Woff", "Requested Woff", "Reason", "Status"];
      case "tour":
        return ["App No", "Date", "Emp ID", "Name", "From", "To", "Destination", "Purpose", "Status"];
      case "late-coming":
        return ["Date", "Emp ID", "Name", "In Time", "Shift Start", "Late Minutes", "Deduction"];
      case "advance":
        return ["App No", "Date", "Emp ID", "Name", "Amount", "Reason", "Status", "Approval Date"];
      case "salary":
        return ["Emp ID", "Name", "Basic", "HRA", "Gross", "Deductions", "Net Pay"];
      case "pf":
        return ["Emp ID", "Name", "PF Number", "Basic Salary", "PF Contribution", "Employee Share", "Employer Share"];
      case "pt":
        return ["Emp ID", "Name", "PAN No", "Gross Salary", "PT Amount"];
      case "shift":
        return ["Emp ID", "Name", "Date", "Shift Code", "Start Time", "End Time"];
      case "holiday":
        return ["Date", "Holiday Name", "Optional?", "Year"];
      case "meals-coupon":
        return ["Emp ID", "Name", "Department", "Month", "Coupons Issued", "Value"];
      case "appraisal":
        return ["Emp ID", "Name", "Department", "Review Period", "Rating", "Remarks"];
      case "other-earnings":
        return ["Emp ID", "Name", "Earning Type", "Amount", "Deduction Type", "Amount"];
      default:
        return [];
    }
  };

  const formatRowData = (reportId, row) => {
    switch (reportId) {
      case "employee":
        return [row.empid, row.ename, row.deptname, row.desgname, row.doj, row.is_active ? "Active" : "Inactive"];
      case "leave":
        return [row.lno, row.ldate, row.empid, row.ename, row.ltype, row.fromdate, row.todate, row.nod, row.status];
      case "attendance":
        return [row.att_date, row.empid, row.ename, row.in_time, row.out_time, row.status, row.late_hrs, row.ot_hrs];
      case "ot":
        return [row.att_date, row.empid, row.ename, row.ot_hrs, row.app_ot, row.hr_app_ot, row.app_status];
      case "late-coming":
        return [row.att_date, row.empid, row.ename, row.in_time, row.shift_start, row.late_hrs, row.late_ded];
      case "advance":
        return [row.advance_id, row.advance_date, row.empid, row.ename, row.amount, row.reason, row.status, row.approval_date];
      case "salary":
        return [row.C_EMPID, row.C_ENAME, row.C_BASIC, row.C_HRA, row.C_TOT_SAL, row.C_TOT_DED, row.C_NET_AMT];
      case "pf":
        return [row.empid, row.ename, row.pf_no, row.basic, row.pf_contribution, row.emp_share, row.employer_share];
      case "pt":
        return [row.empid, row.ename, row.pan_no, row.gross_salary, row.pt_amount];
      case "meals-coupon":
        return [row.empid, row.ename, row.deptname, row.month, row.coupons, row.value];
      default:
        return Object.values(row);
    }
  };

  const getStatusColor = (status) => {
    if (!status) return "default";
    const s = String(status).toLowerCase();
    if (s.includes("approved") || s.includes("active") || s.includes("present")) return "success";
    if (s.includes("pending")) return "warning";
    if (s.includes("rejected") || s.includes("absent")) return "error";
    return "default";
  };

  return (
    <Box sx={{ m: 2 }}>
      <Card>
        <Box sx={{ bgcolor: "#1976d2", color: "white", p: 2 }}>
          <Typography variant="h6">Reports Center</Typography>
        </Box>
        <CardContent>
          <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ mb: 3 }}>
            <Tab label="Daily Reports" />
            <Tab label="Salary Reports" />
          </Tabs>

          {tabValue === 0 && (
            <Grid container spacing={3}>
              {leftReports.map((report) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={report.id}>
                  <Card 
                    sx={{ 
                      cursor: "pointer", 
                      transition: "0.3s",
                      "&:hover": { boxShadow: 6, transform: "translateY(-2px)" }
                    }}
                    onClick={() => handleReportClick(report)}
                  >
                    <CardContent>
                      <Typography variant="h4" sx={{ mb: 1 }}>{report.icon}</Typography>
                      <Typography variant="subtitle1" fontWeight="bold">{report.title}</Typography>
                      <Button size="small" sx={{ mt: 2 }}>View Report →</Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}

          {tabValue === 1 && (
            <Grid container spacing={3}>
              {rightReports.map((report) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={report.id}>
                  <Card 
                    sx={{ 
                      cursor: "pointer", 
                      transition: "0.3s",
                      "&:hover": { boxShadow: 6, transform: "translateY(-2px)" }
                    }}
                    onClick={() => handleReportClick(report)}
                  >
                    <CardContent>
                      <Typography variant="h4" sx={{ mb: 1 }}>{report.icon}</Typography>
                      <Typography variant="subtitle1" fontWeight="bold">{report.title}</Typography>
                      <Button size="small" sx={{ mt: 2 }}>View Report →</Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", bgcolor: "#1976d2", color: "white" }}>
          <Typography variant="h6">{selectedReport?.title}</Typography>
          <IconButton onClick={() => setDialogOpen(false)} sx={{ color: "white" }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2, mt: 1 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>From Date</InputLabel>
                  <TextField type="date" size="small" label="From Date" 
                    value={filters.fromDate} onChange={(e) => setFilters({...filters, fromDate: e.target.value})}
                    InputLabelProps={{ shrink: true }} />
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>To Date</InputLabel>
                  <TextField type="date" size="small" label="To Date" 
                    value={filters.toDate} onChange={(e) => setFilters({...filters, toDate: e.target.value})}
                    InputLabelProps={{ shrink: true }} />
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Month</InputLabel>
                  <Select value={filters.month} label="Month" onChange={(e) => setFilters({...filters, month: e.target.value})}>
                    {months.map(m => (
                      <MenuItem key={m.value} value={m.value}>{m.label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Year</InputLabel>
                  <Select value={filters.year} label="Year" onChange={(e) => setFilters({...filters, year: e.target.value})}>
                    {[2023, 2024, 2025, 2026].map(y => (
                      <MenuItem key={y} value={y}>{y}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={2}>
                <Button variant="contained" fullWidth onClick={refreshData}>Apply</Button>
              </Grid>
            </Grid>
          </Box>

          <Box sx={{ mb: 2, display: "flex", gap: 2, alignItems: "center", flexWrap: "wrap" }}>
            <TextField
              size="small"
              placeholder="Search in table..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1 }} />
              }}
            />
            <Button variant="outlined" size="small" startIcon={<RefreshIcon />} onClick={refreshData}>
              Refresh
            </Button>
            <Button variant="outlined" size="small" color="secondary" startIcon={<ClearIcon />} onClick={clearFilters}>
              Clear
            </Button>
            <Button variant="contained" size="small" startIcon={<DownloadIcon />} onClick={() => handleExport("csv")}>
              Export CSV
            </Button>
            <Button variant="outlined" size="small" startIcon={<PrintIcon />} onClick={() => handleExport("print")}>
              Print
            </Button>
          </Box>

          {loading ? (
            <Typography align="center" sx={{ py: 4 }}>Loading...</Typography>
          ) : filteredData.length === 0 ? (
            <Typography align="center" color="textSecondary" sx={{ py: 4 }}>
              No data found for the selected filters
            </Typography>
          ) : (
            <TableContainer component={Paper} sx={{ maxHeight: 500, overflow: "auto" }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow sx={{ bgcolor: "#1976d2" }}>
                    {getColumns(selectedReport?.id).map((col, idx) => (
                      <TableCell key={idx} sx={{ color: "white", fontWeight: "bold", whiteSpace: "nowrap" }}>{col}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredData.map((row, rowIdx) => (
                    <TableRow key={rowIdx} hover>
                      {formatRowData(selectedReport?.id, row).map((cell, cellIdx) => (
                        <TableCell key={cellIdx}>
                          {cell && typeof cell === 'string' && cell.includes("Approved") ? (
                            <Chip label={cell} color="success" size="small" />
                          ) : cell && typeof cell === 'string' && cell.includes("Pending") ? (
                            <Chip label={cell} color="warning" size="small" />
                          ) : cell && typeof cell === 'string' && cell.includes("Rejected") ? (
                            <Chip label={cell} color="error" size="small" />
                          ) : (
                            String(cell ?? "-")
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
          
          {!loading && filteredData.length > 0 && (
            <Typography variant="body2" sx={{ mt: 2, textAlign: "right" }}>
              Total Records: {filteredData.length}
            </Typography>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default Reports;