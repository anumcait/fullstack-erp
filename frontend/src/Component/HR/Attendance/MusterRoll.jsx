import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  Button,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  LinearProgress,
  Chip,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
} from "@mui/material";
import PrintIcon from "@mui/icons-material/Print";
import DownloadIcon from "@mui/icons-material/Download";
import RefreshIcon from "@mui/icons-material/Refresh";
import ClearIcon from "@mui/icons-material/Clear";
import PaymentsIcon from "@mui/icons-material/Payments";
import axios from "axios";
import { useToast } from "../../../context/ToastContext";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const hhmmToDecimalHrs = (v) => {
  const n = Number(v) || 0;
  const h = Math.floor(n);
  const m = Math.round((n - h) * 100);
  return h + m / 60;
};

const computeLateSummary = (emp) => {
  const days = emp.days || [];
  let lateCount = 0, totalLateMin = 0, halfDays = 0;
  const dayLate = days.map((d) => {
    const dec = hhmmToDecimalHrs(d.late_hrs);
    if (dec > 0) {
      lateCount++;
      totalLateMin += Math.round(dec * 60);
      if (dec > 2) halfDays += 1;
    }
    return dec;
  });
  const lh = Math.floor(totalLateMin / 60);
  const lm = totalLateMin % 60;
  const cuttingHrs = lh + lm / 100;
  const eligibleLate = Math.max(0, lateCount - 1);
  const cost = Math.round(Number(emp.late_cost) || 0);
  return { dayLate, lateCount, cuttingHrs, halfDays, eligibleLate, cost };
};

const MusterRoll = () => {
  const { showToast } = useToast();
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1;
  const prevYear = currentMonth === 1 ? currentYear - 1 : currentYear;

  const [musterData, setMusterData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    month: prevMonth,
    year: prevYear,
    empid: "",
  });

  const [tab, setTab] = useState("muster");


  const topScrollRef = React.useRef(null);
  const tableContainerRef = React.useRef(null);
  const [contentWidth, setContentWidth] = useState(0);
  const isScrollingRef = React.useRef(false);

  const months = [
    { value: 1, label: "January" },
    { value: 2, label: "February" },
    { value: 3, label: "March" },
    { value: 4, label: "April" },
    { value: 5, label: "May" },
    { value: 6, label: "June" },
    { value: 7, label: "July" },
    { value: 8, label: "August" },
    { value: 9, label: "September" },
    { value: 10, label: "October" },
    { value: 11, label: "November" },
    { value: 12, label: "December" },
  ];

  const daysInMonth = new Date(filters.year, filters.month, 0).getDate();

  const stickyWidths = [40, 60, 160, 120, 45];
  const stickyLeft = stickyWidths.reduce((acc, w, i) => {
    acc.push((acc[i - 1] || 0) + (i > 0 ? stickyWidths[i - 1] : 0));
    return acc;
  }, []);

  const stickyCellSx = (index, extra = {}) => {
    const isLast = index === 4;
    return {
      position: "sticky",
      left: stickyLeft[index],
      width: stickyWidths[index],
      minWidth: stickyWidths[index],
      zIndex: 5,
      bgcolor: "#fafafa",
      borderRight: isLast ? "2px solid #aaa" : "none",
      borderBottom: "none",
      ...(index >= 2 && index <= 3 ? { overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" } : {}),
      ...extra,
    };
  };

  const handleScroll = (source, target) => {
    if (isScrollingRef.current) {
      isScrollingRef.current = false;
      return;
    }
    if (source.current && target.current) {
      isScrollingRef.current = true;
      target.current.scrollLeft = source.current.scrollLeft;
    }
  };

  const handleTopScroll = () => handleScroll(topScrollRef, tableContainerRef);
  const handleTableScroll = () => handleScroll(tableContainerRef, topScrollRef);

  useEffect(() => {
    if (tableContainerRef.current) {
      setTimeout(() => {
        if (tableContainerRef.current) {
          setContentWidth(tableContainerRef.current.scrollWidth);
        }
      }, 100);
    }
  }, [musterData, loading, filters.month, filters.year]);

  useEffect(() => {
    fetchMusterData();
    checkPayslipStatus();
  }, [filters.month, filters.year, filters.empid]);

  const checkPayslipStatus = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/payroll/register`, {
        params: { year: filters.year, month: filters.month }
      });
      setPayslipProcessed(res.data.length > 0);
    } catch {
      setPayslipProcessed(false);
    }
  };

  const canProceedToPayslip = filters.year === prevYear && filters.month === prevMonth && musterData.length > 0;

  const fetchMusterData = async () => {
    setLoading(true);
    try {
      const params = {
        month: filters.month,
        year: filters.year,
        ...(filters.empid && { empid: filters.empid }),
      };
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/attendance/muster-roll`,
        { params }
      );
      const data = res.data;
      setMusterData(data.employees || data || []);
    } catch (err) {
      console.error("Error fetching muster data:", err);
      showToast?.("Error fetching muster data", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const [savingSummary, setSavingSummary] = useState(false);
  const [payslipProcessed, setPayslipProcessed] = useState(false);

  const proceedToPayslip = async () => {
    setSavingSummary(true);
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/attendance/save-muster-summary`,
        { month: filters.month, year: filters.year }
      );
      showToast?.(`✅ ${res.data.message}`, "success");
    } catch (err) {
      console.error("Error saving muster summary:", err);
      showToast?.(err.response?.data?.message || "Error saving muster summary for payslip", "error");
    } finally {
      setSavingSummary(false);
    }
  };

  const clearFilters = () => {
    setFilters({
      month: prevMonth,
      year: prevYear,
      empid: "",
    });
  };

  const getShortStatus = (status) => {
    if (!status) return "";
    if (status === "Present") return "P";
    if (status === "Half Day") return "F";
    if (status === "Absent") return "A";
    if (status === "LOP") return "L";
    if (status.startsWith("W-Off")) return "W";
    if (status.startsWith("Holiday")) return "H";
    return status;
  };

  const getStatusColor = (status) => {
    const colors = {
      P: { bg: "#e8f5e9", text: "#2e7d32" },
      F: { bg: "#fff3e0", text: "#e65100" },
      FC: { bg: "#e8f5e9", text: "#e65100" },
      FE: { bg: "#e0f2f1", text: "#e65100" },
      FL: { bg: "#ffebee", text: "#e65100" },
      A: { bg: "#ffebee", text: "#c62828" },
      H: { bg: "#e3f2fd", text: "var(--primary-dark, #1565c0)" },
      W: { bg: "#f3e5f5", text: "#7b1fa2" },
      CL: { bg: "#fff8e1", text: "#f57f17" },
      EL: { bg: "#e0f2f1", text: "#00695c" },
      SL: { bg: "#fbe9e7", text: "#d84315" },
      Leave: { bg: "#fffde7", text: "#f57f17" },
      L: { bg: "#fffde7", text: "#f57f17" },
    };
    const short = getShortStatus(status);
    return colors[short] || { bg: "#ffffff", text: "#333" };
  };

  const filteredData = musterData;

  const tableRef = useRef(null);

  const buildExcelData = () => {
    const monthLabel = months.find((m) => m.value === filters.month)?.label || "";
    const rows = [];

    const totalCols = 5 + daysInMonth + 8;

    // Title row
    rows.push([`Muster Roll - ${monthLabel} ${filters.year}`]);

    // Blank row
    rows.push([]);

    // Header row 1
    const header1 = ["S.No", "ID No", "Name", "Dept", ""];
    for (let d = 1; d <= daysInMonth; d++) header1.push(`${String(d).padStart(2, "0")}`);
    header1.push("PRESENT", "H/W", "CL", "EL", "LOP", "TOTAL", "OT", "Bonus");
    rows.push(header1);

    // Day-of-week row
    const header2 = ["", "", "", "", ""];
    for (let d = 1; d <= daysInMonth; d++) {
      const dayOfWeek = new Date(filters.year, filters.month - 1, d).getDay();
      header2.push(["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][dayOfWeek]);
    }
    header2.push(...Array(8).fill(""));
    rows.push(header2);

    let globalIdx = 0;
    let grandTotalDays = 0, grandTotalOT = 0, grandTotalBonus = 0;

    for (const prefix of ["1", "9"]) {
      const catEmployees = filteredData.filter((e) => String(e.empid).startsWith(prefix));
      if (catEmployees.length === 0) continue;

      const catLabel = prefix === "1" ? "Staff" : "Trainee";
      const catRow = [catLabel];
      for (let i = 1; i < totalCols; i++) catRow.push("");
      rows.push(catRow);

      let catTotalDays = 0, catTotalOT = 0, catBonusCount = 0;

      for (const emp of catEmployees) {
        globalIdx++;
        const days = emp.days || [];
        let presentDays = 0, holidays = 0, cl = 0, el = 0, leave = 0, woffCount = 0, totalOT = 0, lopCount = 0;

        const dayStatuses = days.map((d) => {
          const s = d.status;
          if (!s) return "";
          if (s === "Present") return "P";
          if (s === "Half Day") return "F";
          if (s === "Absent") return "A";
          if (s === "LOP") return "L";
          if (s.startsWith("W-Off")) return "W";
          if (s.startsWith("Holiday")) return "H";
          return s;
        });

        const dayDisplay = dayStatuses.map((s, i) => {
          if (s !== "W" && s !== "H") return s;
          const prevP = i > 0 && ["P", "F", "FC", "FE", "FL"].includes(dayStatuses[i - 1]);
          const nextP = i < dayStatuses.length - 1 && ["P", "F", "FC", "FE", "FL"].includes(dayStatuses[i + 1]);
          return prevP || nextP ? s : "A";
        });

        days.forEach((day, i) => {
          const s = dayStatuses[i];
          const d = dayDisplay[i];
          if (s === "P") presentDays++;
          else if (s === "F") presentDays += 0.5;
          else if (s === "FC" || s === "FE" || s === "FL") presentDays += 0.5;
          else if (day.status === "Holiday+OT" || day.status === "W-Off+OT") presentDays++;
          if (s === "H") holidays++;
          else if (day.status === "Holiday+OT") holidays++;
          if (s === "CL") cl++;
          else if (s === "FC") cl += 0.5;
          if (s === "EL") el++;
          else if (s === "FE") el += 0.5;
          if (s === "L") lopCount++;
          else if (s === "FL") { presentDays += 0.5; lopCount += 0.5; }
          else if (day.lop) lopCount += Number(day.lop);
          else if (s && !["P", "F", "H", "A", "W", "CL", "EL", "L", "FC", "FE", "FL"].includes(s)) leave++;
          if (s === "W") {
            if (d === "W") woffCount++;
            else lopCount++;
          }
          if (day.ot_hrs) totalOT += Number(day.ot_hrs);
        });

        const totalPaidDays = presentDays + holidays + woffCount + cl + el + leave;
        const hasBonus = lopCount === 0 && cl === 0 && el === 0 && leave === 0 && !days.some((d) => d.status === "Absent");

        const row = [globalIdx, emp.empid, emp.ename, emp.department || "-", "Attn"];
        for (let d = 0; d < daysInMonth; d++) row.push(dayDisplay[d] || "");
        row.push(presentDays, holidays + woffCount, cl, el, lopCount, totalPaidDays, totalOT > 0 ? totalOT.toFixed(1) : "0.0", hasBonus ? "500" : "");
        rows.push(row);

        const otRow = ["", "", "", "", "OT"];
        for (let d = 0; d < daysInMonth; d++) {
          const dayData = days[d];
          const ot = dayData && dayData.ot_hrs ? Number(dayData.ot_hrs) : 0;
          otRow.push(ot > 0 ? ot.toFixed(1) : "");
        }
        otRow.push(...Array(8).fill(""));
        rows.push(otRow);

        catTotalDays += totalPaidDays;
        catTotalOT += totalOT;
        if (hasBonus) catBonusCount++;
      }

      // Subtotal row
      const subRow = [`${catLabel} Subtotal`];
      for (let i = 1; i < 5 + daysInMonth; i++) subRow.push("");
      subRow.push("", "", "", "", "");
      subRow.push(Math.round(catTotalDays * 100) / 100);
      subRow.push(Math.round(catTotalOT * 100) / 100);
      subRow.push(catBonusCount * 500);
      rows.push(subRow);

      grandTotalDays += catTotalDays;
      grandTotalOT += catTotalOT;
      grandTotalBonus += catBonusCount * 500;
    }

    // Grand total row
    const grandRow = ["Grand Total"];
    for (let i = 1; i < 5 + daysInMonth; i++) grandRow.push("");
    grandRow.push("", "", "", "", "");
    grandRow.push(Math.round(grandTotalDays * 100) / 100);
    grandRow.push(Math.round(grandTotalOT * 100) / 100);
    grandRow.push(grandTotalBonus);
    rows.push(grandRow);

    return rows;
  };

  const exportToExcel = () => {
    const ws = XLSX.utils.aoa_to_sheet(buildExcelData());
    ws["!cols"] = [{ wch: 5 }, { wch: 8 }, { wch: 22 }, { wch: 14 }, { wch: 5 }];
    for (let d = 0; d < daysInMonth; d++) ws["!cols"].push({ wch: 5 });
    ws["!cols"].push({ wch: 8 }, { wch: 6 }, { wch: 5 }, { wch: 5 }, { wch: 5 }, { wch: 7 }, { wch: 6 }, { wch: 7 });

    // Merge title row
    ws["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 4 + daysInMonth + 7 } }];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "MusterRoll");
    const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([buf], { type: "application/octet-stream" }), `Muster_Roll_${filters.month}_${filters.year}.xlsx`);
  };

  const exportToPDF = () => {
    const outer = tableRef.current;
    const scrollBox = outer?.querySelector('[data-muster-scroll]');
    if (!outer || !scrollBox) return;

    // Expand to full width temporarily so html2canvas captures all columns
    const origOverflow = scrollBox.style.overflow;
    const origMaxHeight = scrollBox.style.maxHeight;
    scrollBox.style.overflow = "visible";
    scrollBox.style.maxHeight = "none";

    // Wait for reflow, then capture, then restore
    requestAnimationFrame(() => {
      html2canvas(outer, { scale: 2, useCORS: true, logging: false, width: scrollBox.scrollWidth, height: scrollBox.scrollHeight }).then((canvas) => {
        scrollBox.style.overflow = origOverflow;
        scrollBox.style.maxHeight = origMaxHeight;
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("l", "mm", "a3");
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
        pdf.save(`Muster_Roll_${filters.month}_${filters.year}.pdf`);
      });
    });
  };

  const exportLateExcel = () => {
    const monthLabel = months.find((m) => m.value === filters.month)?.label || "";
    const header = ["S.No", "ID No", "Name", "Dept"];
    for (let d = 1; d <= daysInMonth; d++) header.push(String(d).padStart(2, "0"));
    header.push("Late Count", "Actual Hrs", "Total late Hrs", "Half Days", "Cost (Rs)");

    const rows = [[`Late Coming Report - ${monthLabel} ${filters.year}`], []];
    rows.push(header);

    let gLate = 0, gElg = 0, gCut = 0, gHalf = 0, gCost = 0, globalIdx = 0;

    for (const cat of [{ label: "Staff", prefix: "1" }, { label: "Trainee", prefix: "9" }]) {
      const catEmps = filteredData.filter((e) => String(e.empid).startsWith(cat.prefix));
      if (catEmps.length === 0) continue;

      rows.push([cat.label, ...Array(header.length - 1).fill("")]);

      let cLate = 0, cElg = 0, cCut = 0, cHalf = 0, cCost = 0;
      for (const emp of catEmps) {
        globalIdx++;
        const sm = computeLateSummary(emp);
        const row = [globalIdx, emp.empid, emp.ename, emp.department || "-"];
        for (let d = 0; d < daysInMonth; d++) {
          const dec = sm.dayLate[d] || 0;
          row.push(dec > 0 ? Number((emp.days[d] && emp.days[d].late_hrs) || 0).toFixed(2) : "");
        }
        row.push(sm.lateCount, sm.eligibleLate, sm.cuttingHrs.toFixed(2), sm.halfDays, sm.cost);
        rows.push(row);
        cLate += sm.lateCount; cElg += sm.eligibleLate; cCut += sm.cuttingHrs; cHalf += sm.halfDays; cCost += sm.cost;
      }

      const sub = Array(header.length).fill("");
      sub[0] = `${cat.label} Subtotal`;
      sub[header.length - 5] = cLate;
      sub[header.length - 4] = cElg;
      sub[header.length - 3] = cCut.toFixed(2);
      sub[header.length - 2] = cHalf;
      sub[header.length - 1] = cCost;
      rows.push(sub);

      gLate += cLate; gElg += cElg; gCut += cCut; gHalf += cHalf; gCost += cCost;
    }

    const grand = Array(header.length).fill("");
    grand[0] = "Grand Total";
    grand[header.length - 5] = gLate;
    grand[header.length - 4] = gElg;
    grand[header.length - 3] = gCut.toFixed(2);
    grand[header.length - 2] = gHalf;
    grand[header.length - 1] = gCost;
    rows.push(grand);

    const ws = XLSX.utils.aoa_to_sheet(rows);
    ws["!cols"] = [{ wch: 5 }, { wch: 8 }, { wch: 22 }, { wch: 14 }];
    for (let d = 0; d < daysInMonth; d++) ws["!cols"].push({ wch: 6 });
    ws["!cols"].push({ wch: 10 }, { wch: 11 }, { wch: 9 }, { wch: 9 });
    ws["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: header.length - 1 } }];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "LateComing");
    const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([buf], { type: "application/octet-stream" }), `Late_Coming_${filters.month}_${filters.year}.xlsx`);
  };

  return (
    <Card sx={{ m: 2, boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
      <Box
        sx={{
          p: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid #e0e0e0",
          bgcolor: "#f8f9fa",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography variant="h5" sx={{ fontWeight: "bold", color: "var(--heading-color)", borderLeft: "4px solid", borderColor: "primary.main", pl: 1.5 }}>
            {tab === "late" ? "Late Coming Report" : "Muster Roll"}
          </Typography>
          {filteredData.length > 0 && (
            <Chip
              label={`${filteredData.length} Employees`}
              size="small"
              color="primary"
              sx={{ fontWeight: "bold" }}
            />
          )}
        </Box>
        <Box>
          {tab === "muster" ? (
            <>
              <Button variant="outlined" startIcon={<DownloadIcon />} size="small" sx={{ mr: 1 }} onClick={exportToExcel}>
                Export Excel
              </Button>
              <Button variant="outlined" startIcon={<PrintIcon />} size="small" onClick={exportToPDF}>
                Export PDF
              </Button>
              <Button
                variant="contained"
                color="success"
                startIcon={<PaymentsIcon />}
                size="small"
                onClick={proceedToPayslip}
                disabled={savingSummary || !canProceedToPayslip || payslipProcessed}
                sx={{ ml: 1 }}
              >
                {savingSummary ? "Saving..." : "Proceed for Payslip"}
              </Button>
              {payslipProcessed && (
                <Typography variant="caption" color="error" sx={{ ml: 1, fontWeight: 600 }}>
                  Salary already processed/finalized for this month — summary is locked.
                </Typography>
              )}
            </>
          ) : (
            <Button variant="outlined" startIcon={<DownloadIcon />} size="small" onClick={exportLateExcel}>
              Export Late Report
            </Button>
          )}
        </Box>
      </Box>

      <CardContent sx={{ p: 2 }}>
        <Grid container spacing={2} sx={{ mb: 3, alignItems: "center" }}>
          <Grid item xs={12} sm={3} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Month</InputLabel>
              <Select name="month" value={filters.month} onChange={handleFilterChange} label="Month">
                {months.filter(m => {
                  if (filters.year < currentYear) return true;
                  if (filters.year > currentYear) return false;
                  return m.value <= currentMonth;
                }).map((m) => (
                  <MenuItem key={m.value} value={m.value}>
                    {m.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={2} md={1.5}>
            <FormControl fullWidth size="small">
              <InputLabel>Year</InputLabel>
              <Select name="year" value={filters.year} onChange={(e) => {
                const newYear = Number(e.target.value);
                if (newYear > currentYear) return;
                setFilters(prev => {
                  const next = { ...prev, year: newYear };
                  if (newYear === currentYear && next.month > currentMonth) {
                    next.month = currentMonth;
                  }
                  return next;
                });
              }} label="Year">
                {[2023, 2024, 2025, 2026].filter(y => y <= currentYear).map(y => (
                  <MenuItem key={y} value={y}>{y}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={4} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Employee</InputLabel>
              <Select
                name="empid"
                value={filters.empid}
                onChange={handleFilterChange}
                label="Employee"
                displayEmpty
              >
                <MenuItem value="">All Employees</MenuItem>
                {musterData.map((emp) => (
                  <MenuItem key={emp.empid} value={emp.empid}>
                    {emp.empid} - {emp.ename}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid
            item
            xs={12}
            sm={3}
            md={5.5}
            sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 1 }}
          >
            <Button variant="outlined" size="small" startIcon={<RefreshIcon />} onClick={fetchMusterData}>
              Refresh
            </Button>
            <Button variant="outlined" size="small" startIcon={<ClearIcon />} onClick={clearFilters}>
              Clear
            </Button>
          </Grid>
        </Grid>

        <Tabs
          value={tab}
          onChange={(e, v) => setTab(v)}
          sx={{ mb: 2, borderBottom: "1px solid #e0e0e0", minHeight: 0 }}
        >
          <Tab label="Muster Roll" value="muster" sx={{ textTransform: "none", fontWeight: "bold", fontSize: 14 }} />
          <Tab label="Late Coming Report" value="late" sx={{ textTransform: "none", fontWeight: "bold", fontSize: 14 }} />
        </Tabs>

        {loading && <LinearProgress sx={{ mb: 2 }} />}

        {tab === "muster" && (filteredData.length === 0 ? (
          <Typography
            align="center"
            color="textSecondary"
            sx={{ py: 6, border: "1px dashed #ccc", borderRadius: 1 }}
          >
            No muster data found. Try selecting June (Jun) to view bulk entries.
          </Typography>
        ) : (
          <>
            <Box
              ref={tableRef}
              id="muster-roll-table"
              sx={{ width: "100%" }}
            >
              <Box
                ref={topScrollRef}
                onScroll={handleTopScroll}
                sx={{
                  overflowX: "auto",
                  overflowY: "hidden",
                  width: "100%",
                  height: "14px",
                  mb: 1,
                  bgcolor: "#f5f5f5",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                  "&::-webkit-scrollbar": { height: "8px" },
                  "&::-webkit-scrollbar-thumb": {
                    backgroundColor: "#ccc",
                    borderRadius: "4px",
                  },
                }}
              >
                <Box sx={{ width: `${contentWidth}px`, height: "1px" }} />
              </Box>

              <Box
                ref={tableContainerRef}
                data-muster-scroll
                onScroll={handleTableScroll}
                sx={{
                  overflowX: "auto",
                  overflowY: "auto",
                  maxHeight: "75vh",
                  width: "100%",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                }}
              >
                <Table
                  size="small"
                  sx={{
                    minWidth: 1200,
                    borderCollapse: "separate",
                    borderSpacing: 0,
                    "& th, & td": {
                      borderRight: "1px solid #ccc",
                      borderBottom: "1px solid #ccc",
                      padding: "4px 6px",
                      fontSize: "11px",
                      whiteSpace: "nowrap",
                    },
                  }}
                >
                  <TableHead sx={{ position: "sticky", top: 0, zIndex: 10 }}>
                    <TableRow sx={{ backgroundColor: "#eeeeee" }}>
                      <TableCell
                        rowSpan={2}
                        align="center"
                        sx={stickyCellSx(0, { fontWeight: "bold", bgcolor: "#eeeeee", zIndex: 12 })}
                      >
                        S.No
                      </TableCell>
                      <TableCell
                        rowSpan={2}
                        align="center"
                        sx={stickyCellSx(1, { fontWeight: "bold", bgcolor: "#eeeeee", zIndex: 12 })}
                      >
                        ID No
                      </TableCell>
                      <TableCell
                        rowSpan={2}
                        sx={stickyCellSx(2, { fontWeight: "bold", bgcolor: "#eeeeee", zIndex: 12 })}
                      >
                        Name
                      </TableCell>
                      <TableCell
                        rowSpan={2}
                        sx={stickyCellSx(3, { fontWeight: "bold", bgcolor: "#eeeeee", zIndex: 12 })}
                      >
                        Dept
                      </TableCell>
                      <TableCell
                        rowSpan={2}
                        align="center"
                        sx={stickyCellSx(4, { fontWeight: "bold", bgcolor: "#eeeeee", zIndex: 12 })}
                      ></TableCell>

                      {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => (
                        <TableCell
                          key={d}
                          align="center"
                          sx={{ fontWeight: "bold", minWidth: 40, bgcolor: "#f5f5f5" }}
                        >
                          {String(d).padStart(2, "0")}-{months.find((m) => m.value === filters.month)?.label.substring(0, 3)}
                        </TableCell>
                      ))}

                      <TableCell rowSpan={2} align="center" sx={{ fontWeight: "bold", bgcolor: "#e8f5e9", minWidth: 50 }}>
                        PRESENT
                      </TableCell>
                      <TableCell rowSpan={2} align="center" sx={{ fontWeight: "bold", bgcolor: "#e3f2fd", minWidth: 40 }}>
                        H/W
                      </TableCell>
                      <TableCell rowSpan={2} align="center" sx={{ fontWeight: "bold", bgcolor: "#fff8e1", minWidth: 40 }}>
                        CL
                      </TableCell>
                      <TableCell rowSpan={2} align="center" sx={{ fontWeight: "bold", bgcolor: "#e0f2f1", minWidth: 40 }}>
                        EL
                      </TableCell>
                      <TableCell rowSpan={2} align="center" sx={{ fontWeight: "bold", bgcolor: "#ffcdd2", minWidth: 45 }}>
                        LOP
                      </TableCell>
                      <TableCell rowSpan={2} align="center" sx={{ fontWeight: "bold", bgcolor: "#eceff1", minWidth: 50 }}>
                        TOTAL
                      </TableCell>
                      <TableCell rowSpan={2} align="center" sx={{ fontWeight: "bold", bgcolor: "#fff9c4", minWidth: 45 }}>
                        OT
                      </TableCell>
                      <TableCell rowSpan={2} align="center" sx={{ fontWeight: "bold", minWidth: 80, whiteSpace: "pre-line" }}>
                        Attendance{"\n"}<span style={{ fontSize: '10px' }}>Bonus</span>
                      </TableCell>
                    </TableRow>

                    <TableRow sx={{ backgroundColor: "#eeeeee" }}>
                      {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => {
                        const dayOfWeek = new Date(filters.year, filters.month - 1, d).getDay();
                        const dayName = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][dayOfWeek];
                        const isSunday = dayOfWeek === 0;

                        return (
                          <TableCell
                            key={d}
                            align="center"
                            sx={{
                              color: isSunday ? "#d32f2f" : "inherit",
                              fontWeight: "bold",
                              fontSize: "9px",
                              bgcolor: isSunday ? "#ffebee" : "#f5f5f5",
                            }}
                          >
                            {dayName}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {(() => {
                      const categories = [
                        { label: "Staff", prefix: "1" },
                        { label: "Trainee", prefix: "9" },
                      ];

                      let globalIdx = 0;
                      let grandTotalDays = 0;
                      let grandTotalOT = 0;
                      let grandTotalBonus = 0;
                      const rows = [];

                      for (const cat of categories) {
                        const catEmployees = filteredData.filter((e) => String(e.empid).startsWith(cat.prefix));
                        if (catEmployees.length === 0) continue;

                        let catTotalDays = 0;
                        let catTotalOT = 0;
                        let catBonusCount = 0;

                        rows.push(
                          <TableRow key={`cat-heading-${cat.label}`} sx={{ bgcolor: "#e8eaf6" }}>
                            <TableCell colSpan={13 + daysInMonth} sx={{ fontWeight: "bold", fontSize: "13px", py: "6px", color: "#283593" }}>
                              {cat.label}
                            </TableCell>
                          </TableRow>
                        );

                        for (const emp of catEmployees) {
                          globalIdx++;
                          const days = emp.days || [];
                          let presentDays = 0;
                          let holidays = 0;
                          let cl = 0;
                          let el = 0;
                          let leave = 0;
                          let woffCount = 0;
                          let totalOT = 0;
                          let lopCount = 0;

                          const dayStatuses = days.map(d => getShortStatus(d.status));
        const dayDisplay = dayStatuses.map((s, i) => {
          if (s !== "W" && s !== "H") return s;
          const prevP = i > 0 && ["P", "F", "FC", "FE", "FL"].includes(dayStatuses[i - 1]);
          const nextP = i < dayStatuses.length - 1 && ["P", "F", "FC", "FE", "FL"].includes(dayStatuses[i + 1]);
          return prevP || nextP ? s : "A";
        });

                          days.forEach((day, dayIdx) => {
                            const status = day.status;
                            const short = dayStatuses[dayIdx];
                            const display = dayDisplay[dayIdx];

                            if (short === "P") presentDays++;
                            else if (short === "F") presentDays += 0.5;
                            else if (short === "FC" || short === "FE" || short === "FL") presentDays += 0.5;
                            else if (status === "Holiday+OT" || status === "W-Off+OT") presentDays++;

                            if (short === "H") holidays++;
                            else if (status === "Holiday+OT") holidays++;

                            if (short === "CL") cl++;
                            else if (short === "FC") cl += 0.5;

                            if (short === "EL") el++;
                            else if (short === "FE") el += 0.5;

                            if (short === "L") {
                              lopCount++;
                            } else if (short === "FL") {
                              presentDays += 0.5;
                              lopCount += 0.5;
                            } else if (day.lop) {
                              lopCount += Number(day.lop);
                            } else if (short && !["P", "F", "H", "A", "W", "CL", "EL", "L", "FC", "FE", "FL"].includes(short)) {
                              leave++;
                            }

                            if (short === "W") {
                              if (display === "W") {
                                woffCount++;
                              } else {
                                lopCount++;
                              }
                            }

                            if (day.ot_hrs) totalOT += Number(day.ot_hrs);
                          });

                          const totalPaidDays = presentDays + holidays + woffCount + cl + el + leave;
                          const hasBonus = lopCount === 0 && cl === 0 && el === 0 && leave === 0 && !days.some((d) => d.status === "Absent");

                          catTotalDays += totalPaidDays;
                          catTotalOT += totalOT;
                          if (hasBonus) catBonusCount++;

                          rows.push(
                            <React.Fragment key={emp.empid}>
                              <TableRow hover>
                                <TableCell rowSpan={2} align="center" sx={stickyCellSx(0, { fontWeight: "bold", bgcolor: "#fafafa", zIndex: 6 })}>
                                  {globalIdx}
                                </TableCell>
                                <TableCell rowSpan={2} align="center" sx={stickyCellSx(1, { fontWeight: "bold", bgcolor: "#fafafa", zIndex: 6 })}>
                                  {emp.empid}
                                </TableCell>
                                <TableCell rowSpan={2} sx={stickyCellSx(2, { fontWeight: "500", color: "#333", bgcolor: "#fafafa", zIndex: 6 })}>
                                  {emp.ename}
                                </TableCell>
                                <TableCell rowSpan={2} sx={stickyCellSx(3, { color: "text.secondary", bgcolor: "#fafafa", zIndex: 6 })}>
                                  {emp.department || "-"}
                                </TableCell>
                                <TableCell align="center" sx={stickyCellSx(4, { fontWeight: "bold", color: "var(--primary-dark, #1565c0)", bgcolor: "#e3f2fd", verticalAlign: "middle", zIndex: 6 })}>
                                  Attn
                                </TableCell>

                                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => {
                                  const dayData = days[d - 1];
                                  const status = dayData ? dayData.status : "";
                                  const short = dayDisplay[d - 1] || getShortStatus(status);
                                  const color = getStatusColor(status);
                                  const displayColor = short !== getShortStatus(status) ? getStatusColor(short) : color;
                                  const dayOfWeek = new Date(filters.year, filters.month - 1, d).getDay();
                                  const isSunday = dayOfWeek === 0;

                                  return (
                                    <TableCell
                                      key={d}
                                      align="center"
                                      sx={{
                                        bgcolor: displayColor.bg || (isSunday ? "#fff8e1" : "#ffffff"),
                                        color: displayColor.text,
                                        fontWeight: short ? "bold" : "normal",
                                        cursor: "default",
                                      }}
                                    >
                                      <Tooltip title={dayData && status ? `${status} | In: ${dayData.in_time || "-"} | Out: ${dayData.out_time || "-"}` : ""} arrow>
                                        <span>{short || "-"}</span>
                                      </Tooltip>
                                    </TableCell>
                                  );
                                })}

                                <TableCell rowSpan={2} align="center" sx={{ bgcolor: "#e8f5e9", color: "#2e7d32", fontWeight: "bold", fontSize: "12px" }}>
                                  {presentDays}
                                </TableCell>
                                <TableCell rowSpan={2} align="center" sx={{ bgcolor: "#e3f2fd", color: "var(--primary-dark, #1565c0)", fontWeight: "bold", fontSize: "12px" }}>
                                  {holidays + woffCount}
                                </TableCell>
                                <TableCell rowSpan={2} align="center" sx={{ bgcolor: "#fff8e1", color: "#f57f17", fontWeight: "bold", fontSize: "12px" }}>
                                  {cl}
                                </TableCell>
                                <TableCell rowSpan={2} align="center" sx={{ bgcolor: "#e0f2f1", color: "#00695c", fontWeight: "bold", fontSize: "12px" }}>
                                  {el}
                                </TableCell>
                                <TableCell rowSpan={2} align="center" sx={{ bgcolor: "#ffcdd2", color: "#c62828", fontWeight: "bold", fontSize: "12px" }}>
                                  {lopCount}
                                </TableCell>
                                <TableCell rowSpan={2} align="center" sx={{ bgcolor: "#eceff1", color: "#37474f", fontWeight: "bold", fontSize: "12px" }}>
                                  {totalPaidDays}
                                </TableCell>
                                <TableCell rowSpan={2} align="center" sx={{ bgcolor: "#fff9c4", color: "#f57f17", fontWeight: "bold", fontSize: "12px" }}>
                                  {totalOT > 0 ? totalOT.toFixed(1) : "0.0"}
                                </TableCell>
                                <TableCell rowSpan={2} align="center" sx={{ fontWeight: "bold", fontSize: "12px", bgcolor: hasBonus ? "#e8f5e9" : "inherit", color: hasBonus ? "#2e7d32" : "inherit" }}>
                                  {hasBonus ? "500" : ""}
                                </TableCell>
                              </TableRow>

                              <TableRow hover>
                                <TableCell align="center" sx={stickyCellSx(4, { fontWeight: "bold", color: "#e65100", bgcolor: "#fff3e0", zIndex: 6 })}>
                                  OT
                                </TableCell>

                                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => {
                                  const dayData = days[d - 1];
                                  const ot = dayData && dayData.ot_hrs ? Number(dayData.ot_hrs) : 0;
                                  const dayOfWeek = new Date(filters.year, filters.month - 1, d).getDay();
                                  const isSunday = dayOfWeek === 0;

                                  return (
                                    <TableCell
                                      key={d}
                                      align="center"
                                      sx={{
                                        color: "#e65100",
                                        bgcolor: ot > 0 ? "#ffe0b2" : isSunday ? "#fffde7" : "inherit",
                                        fontSize: "10px",
                                      }}
                                    >
                                      {ot > 0 ? ot.toFixed(1) : ""}
                                    </TableCell>
                                  );
                                })}
                              </TableRow>
                            </React.Fragment>
                          );
                        }

                        rows.push(
                          <TableRow key={`subtotal-${cat.label}`} sx={{ bgcolor: "#e3f2fd" }}>
                            <TableCell colSpan={5 + daysInMonth} sx={{ fontWeight: "bold", fontSize: "12px", py: "6px" }}>
                              {cat.label} Subtotal
                            </TableCell>
                            <TableCell />
                            <TableCell />
                            <TableCell />
                            <TableCell />
                            <TableCell />
                            <TableCell align="center" sx={{ fontWeight: "bold", fontSize: "12px", color: "var(--primary-dark, #1565c0)", py: "6px" }}>
                              {Math.round(catTotalDays * 100) / 100}
                            </TableCell>
                            <TableCell align="center" sx={{ fontWeight: "bold", fontSize: "12px", color: "#e65100", py: "6px" }}>
                              {Math.round(catTotalOT * 100) / 100}
                            </TableCell>
                            <TableCell align="center" sx={{ fontWeight: "bold", fontSize: "12px", color: "#2e7d32", py: "6px" }}>
                              {catBonusCount * 500}
                            </TableCell>
                          </TableRow>
                        );

                        grandTotalDays += catTotalDays;
                        grandTotalOT += catTotalOT;
                        grandTotalBonus += catBonusCount * 500;
                      }

                      rows.push(
                        <TableRow key="grand-total" sx={{ bgcolor: "#bbdefb" }}>
                          <TableCell colSpan={5 + daysInMonth} sx={{ fontWeight: "bold", fontSize: "13px", py: "8px" }}>
                            Grand Total
                          </TableCell>
                          <TableCell />
                          <TableCell />
                          <TableCell />
                          <TableCell />
                          <TableCell />
                          <TableCell align="center" sx={{ fontWeight: "bold", fontSize: "13px", color: "#0d47a1", py: "8px" }}>
                            {Math.round(grandTotalDays * 100) / 100}
                          </TableCell>
                          <TableCell align="center" sx={{ fontWeight: "bold", fontSize: "13px", color: "#bf360c", py: "8px" }}>
                            {Math.round(grandTotalOT * 100) / 100}
                          </TableCell>
                          <TableCell align="center" sx={{ fontWeight: "bold", fontSize: "13px", color: "#1b5e20", py: "8px" }}>
                            {grandTotalBonus.toLocaleString()}
                          </TableCell>
              </TableRow>
                );
      
                      return rows;
                    })()}
                  </TableBody>
                </Table>
              </Box>
            </Box>
            <Box
              sx={{
                mt: 3,
                display: "flex",
                gap: 1,
                flexWrap: "wrap",
                p: 1.5,
                bgcolor: "#f8f9fa",
                borderRadius: 1,
                border: "1px solid #e0e0e0",
              }}
            >
              <Typography variant="body2" sx={{ mr: 1, fontWeight: "bold", display: "flex", alignItems: "center" }}>
                Legend:
              </Typography>
              <Chip label="P: Present" size="small" sx={{ bgcolor: "#e8f5e9", color: "#2e7d32", fontWeight: "500" }} />
              <Chip label="F: Half Day" size="small" sx={{ bgcolor: "#fff3e0", color: "#e65100", fontWeight: "500" }} />
              <Chip label="A: Absent" size="small" sx={{ bgcolor: "#ffebee", color: "#c62828", fontWeight: "500" }} />
              <Chip label="H: Holiday" size="small" sx={{ bgcolor: "#e3f2fd", color: "var(--primary-dark, #1565c0)", fontWeight: "500" }} />
              <Chip label="W: Weekly Off" size="small" sx={{ bgcolor: "#f3e5f5", color: "#7b1fa2", fontWeight: "500" }} />
              <Chip label="CL: Casual Leave" size="small" sx={{ bgcolor: "#fff8e1", color: "#f57f17", fontWeight: "500" }} />
              <Chip label="EL: Earned Leave" size="small" sx={{ bgcolor: "#e0f2f1", color: "#00695c", fontWeight: "500" }} />
              <Chip label="SL/ML: Medical/Special Leave" size="small" sx={{ bgcolor: "#fbe9e7", color: "#d84315", fontWeight: "500" }} />
            </Box>
          </>
        ))}
        {tab === "late" && (
          <LateComingReport musterData={filteredData} daysInMonth={daysInMonth} filters={filters} months={months} />
        )}
      </CardContent>
    </Card>
  );
};

export default MusterRoll;

function LateComingReport({ musterData, daysInMonth, filters, months }) {
  const { showToast } = useToast();
  const topScrollRef = React.useRef(null);
  const tableContainerRef = React.useRef(null);
  const [contentWidth, setContentWidth] = useState(0);
  const isScrollingRef = React.useRef(false);

  const monthLabel = months.find((m) => m.value === filters.month)?.label || "";

  const stickyWidths = [40, 60, 170, 120];
  const stickyLeft = stickyWidths.reduce((acc, w, i) => {
    acc.push((acc[i - 1] || 0) + (i > 0 ? stickyWidths[i - 1] : 0));
    return acc;
  }, []);
  const stickyCellSx = (index, extra = {}) => ({
    position: "sticky",
    left: stickyLeft[index],
    width: stickyWidths[index],
    minWidth: stickyWidths[index],
    zIndex: 5,
    bgcolor: "#fafafa",
    borderRight: index === 3 ? "2px solid #aaa" : "none",
    ...extra,
  });

  const handleScroll = (source, target) => {
    if (isScrollingRef.current) { isScrollingRef.current = false; return; }
    if (source.current && target.current) { isScrollingRef.current = true; target.current.scrollLeft = source.current.scrollLeft; }
  };
  const handleTopScroll = () => handleScroll(topScrollRef, tableContainerRef);
  const handleTableScroll = () => handleScroll(tableContainerRef, topScrollRef);

  useEffect(() => {
    if (tableContainerRef.current) {
      setTimeout(() => { if (tableContainerRef.current) setContentWidth(tableContainerRef.current.scrollWidth); }, 100);
    }
  }, [musterData, filters.month, filters.year]);

  if (musterData.length === 0) {
    return (
      <Typography align="center" color="textSecondary" sx={{ py: 6, border: "1px dashed #ccc", borderRadius: 1 }}>
        No attendance data found for the selected month. Try selecting a month with records.
      </Typography>
    );
  }

  const summaryCols = [
    { key: "lateCount", label: "Late\nCount", bg: "#ffebee", color: "#c62828" },
    { key: "eligibleLate", label: "Actual\nHrs", bg: "#e8f5e9", color: "#2e7d32" },
    { key: "cuttingHrs", label: "Total late\nHrs", bg: "#fff3e0", color: "#e65100" },
    { key: "halfDays", label: "Half\nDays", bg: "#fff8e1", color: "#f57f17" },
    { key: "cost", label: "Cost\n(Rs)", bg: "#ede7f6", color: "#4527a0" },
  ];

  return (
    <Box>
      <Box
        sx={{
          mb: 2,
          p: 1.5,
          bgcolor: "#fff8e1",
          borderRadius: 1,
          border: "1px solid #ffe082",
          fontSize: "12px",
          color: "#6d4c41",
        }}
      >
        <strong>Late Coming Criteria:</strong> Late is calculated from shift start time (grace 0 min).
        Late minutes shown per date in HH.MM format (e.g. 0.05 = 5 min, 1.30 = 1h 30m).
        Late &gt; 2h → Half Day. The first late of the month is exempt, so Actual Hrs = Late Count − 1
        (e.g. 5 lates → 4 actual). Cost = late deduction per payroll rule (≤10 min → 1 hr basic; else → ½ day basic).
      </Box>

      <Box ref={topScrollRef} onScroll={handleTopScroll} sx={{ overflowX: "auto", overflowY: "hidden", width: "100%", height: "14px", mb: 1, bgcolor: "#f5f5f5", borderRadius: "4px", border: "1px solid #ccc" }}>
        <Box sx={{ width: `${contentWidth}px`, height: "1px" }} />
      </Box>

      <Box
        ref={tableContainerRef}
        data-late-scroll
        onScroll={handleTableScroll}
        sx={{ overflowX: "auto", overflowY: "auto", maxHeight: "72vh", width: "100%", border: "1px solid #ccc", borderRadius: "4px" }}
      >
        <Table
          size="small"
          sx={{
            minWidth: 1000,
            borderCollapse: "separate",
            borderSpacing: 0,
            "& th, & td": { borderRight: "1px solid #ccc", borderBottom: "1px solid #ccc", padding: "4px 6px", fontSize: "11px", whiteSpace: "nowrap" },
          }}
        >
          <TableHead sx={{ position: "sticky", top: 0, zIndex: 10 }}>
            <TableRow sx={{ backgroundColor: "#eeeeee" }}>
              <TableCell rowSpan={2} align="center" sx={stickyCellSx(0, { fontWeight: "bold", bgcolor: "#eeeeee", zIndex: 12 })}>S.No</TableCell>
              <TableCell rowSpan={2} align="center" sx={stickyCellSx(1, { fontWeight: "bold", bgcolor: "#eeeeee", zIndex: 12 })}>ID No</TableCell>
              <TableCell rowSpan={2} sx={stickyCellSx(2, { fontWeight: "bold", bgcolor: "#eeeeee", zIndex: 12 })}>Name</TableCell>
              <TableCell rowSpan={2} sx={stickyCellSx(3, { fontWeight: "bold", bgcolor: "#eeeeee", zIndex: 12 })}>Dept</TableCell>
              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => {
                const dayOfWeek = new Date(filters.year, filters.month - 1, d).getDay();
                const isSunday = dayOfWeek === 0;
                return (
                  <TableCell key={d} align="center" sx={{ fontWeight: "bold", minWidth: 42, bgcolor: isSunday ? "#ffebee" : "#f5f5f5", color: isSunday ? "#d32f2f" : "inherit" }}>
                    {String(d).padStart(2, "0")}
                  </TableCell>
                );
              })}
              {summaryCols.map((c) => (
                <TableCell key={c.key} rowSpan={2} align="center" sx={{ fontWeight: "bold", bgcolor: c.bg, color: c.color, minWidth: 55, whiteSpace: "pre-line" }}>
                  {c.label}
                </TableCell>
              ))}
            </TableRow>
            <TableRow sx={{ backgroundColor: "#eeeeee" }}>
              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => {
                const dayOfWeek = new Date(filters.year, filters.month - 1, d).getDay();
                const dayName = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][dayOfWeek];
                return (
                  <TableCell key={`d-${d}`} align="center" sx={{ fontSize: "9px", fontWeight: "bold", bgcolor: dayOfWeek === 0 ? "#ffebee" : "#f5f5f5" }}>
                    {dayName}
                  </TableCell>
                );
              })}
            </TableRow>
          </TableHead>

          <TableBody>
            {(() => {
              const categories = [
                { label: "Staff", prefix: "1" },
                { label: "Trainee", prefix: "9" },
              ];
              let globalIdx = 0, gLate = 0, gElg = 0, gCut = 0, gHalf = 0, gCost = 0;
              const rows = [];

              for (const cat of categories) {
                const catEmployees = musterData.filter((e) => String(e.empid).startsWith(cat.prefix));
                if (catEmployees.length === 0) continue;

                rows.push(
                  <TableRow key={`cat-${cat.label}`} sx={{ bgcolor: "#e8eaf6" }}>
                    <TableCell colSpan={4 + daysInMonth} sx={{ fontWeight: "bold", fontSize: "13px", py: "6px", color: "#283593" }}>
                      {cat.label}
                    </TableCell>
                    {summaryCols.map((c) => (
                      <TableCell key={`cat-${c.key}`} sx={{ bgcolor: "#e8eaf6" }} />
                    ))}
                  </TableRow>
                );

                let cLate = 0, cCut = 0, cHalf = 0, cElg = 0, cCost = 0;

                for (const emp of catEmployees) {
                  globalIdx++;
                  const sm = computeLateSummary(emp);
                  cLate += sm.lateCount; cCut += sm.cuttingHrs; cHalf += sm.halfDays; cElg += sm.eligibleLate; cCost += sm.cost;

                  rows.push(
                    <TableRow key={emp.empid} hover>
                      <TableCell align="center" sx={stickyCellSx(0, { fontWeight: "bold", bgcolor: "#fafafa", zIndex: 6 })}>{globalIdx}</TableCell>
                      <TableCell align="center" sx={stickyCellSx(1, { fontWeight: "bold", bgcolor: "#fafafa", zIndex: 6 })}>{emp.empid}</TableCell>
                      <TableCell sx={stickyCellSx(2, { fontWeight: "500", color: "#333", bgcolor: "#fafafa", zIndex: 6 })}>{emp.ename}</TableCell>
                      <TableCell sx={stickyCellSx(3, { color: "text.secondary", bgcolor: "#fafafa", zIndex: 6 })}>{emp.department || "-"}</TableCell>
                      {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => {
                        const dec = sm.dayLate[d - 1] || 0;
                        const dayData = emp.days && emp.days[d - 1];
                        const val = dayData && dayData.late_hrs ? Number(dayData.late_hrs).toFixed(2) : "";
                        return (
                          <TableCell
                            key={d}
                            align="center"
                            sx={{ color: dec > 2 ? "#e65100" : dec > 0 ? "#f57f17" : "inherit", fontWeight: dec > 0 ? "bold" : "normal", bgcolor: dec > 0 ? "#fff3e0" : "inherit" }}
                          >
                            {val}
                          </TableCell>
                        );
                      })}
                      <TableCell align="center" sx={{ bgcolor: "#ffebee", color: "#c62828", fontWeight: "bold" }}>{sm.lateCount}</TableCell>
                      <TableCell align="center" sx={{ bgcolor: "#e8f5e9", color: "#2e7d32", fontWeight: "bold" }}>{sm.eligibleLate}</TableCell>
                      <TableCell align="center" sx={{ bgcolor: "#fff3e0", color: "#e65100", fontWeight: "bold" }}>{sm.cuttingHrs.toFixed(2)}</TableCell>
                      <TableCell align="center" sx={{ bgcolor: "#fff8e1", color: "#f57f17", fontWeight: "bold" }}>{sm.halfDays}</TableCell>
                      <TableCell align="center" sx={{ bgcolor: "#ede7f6", color: "#4527a0", fontWeight: "bold" }}>{sm.cost}</TableCell>
                    </TableRow>
                  );
                }

                rows.push(
                  <TableRow key={`sub-${cat.label}`} sx={{ bgcolor: "#e3f2fd" }}>
                    <TableCell colSpan={4 + daysInMonth} sx={{ fontWeight: "bold", fontSize: "12px", py: "6px" }}>{cat.label} Subtotal</TableCell>
                    <TableCell align="center" sx={{ fontWeight: "bold", color: "#c62828" }}>{cLate}</TableCell>
                    <TableCell align="center" sx={{ fontWeight: "bold", color: "#2e7d32" }}>{cElg}</TableCell>
                    <TableCell align="center" sx={{ fontWeight: "bold", color: "#e65100" }}>{cCut.toFixed(2)}</TableCell>
                    <TableCell align="center" sx={{ fontWeight: "bold", color: "#f57f17" }}>{cHalf}</TableCell>
                    <TableCell align="center" sx={{ fontWeight: "bold", color: "#4527a0" }}>{cCost}</TableCell>
                  </TableRow>
                );

                gLate += cLate; gCut += cCut; gHalf += cHalf; gElg += cElg; gCost += cCost;
              }

              rows.push(
                <TableRow key="grand-total" sx={{ bgcolor: "#bbdefb" }}>
                  <TableCell colSpan={4 + daysInMonth} sx={{ fontWeight: "bold", fontSize: "13px", py: "8px" }}>Grand Total</TableCell>
                  <TableCell align="center" sx={{ fontWeight: "bold", fontSize: "13px", color: "#c62828" }}>{gLate}</TableCell>
                  <TableCell align="center" sx={{ fontWeight: "bold", fontSize: "13px", color: "#2e7d32" }}>{gElg}</TableCell>
                  <TableCell align="center" sx={{ fontWeight: "bold", fontSize: "13px", color: "#bf360c" }}>{gCut.toFixed(2)}</TableCell>
                  <TableCell align="center" sx={{ fontWeight: "bold", fontSize: "13px", color: "#e65100" }}>{gHalf}</TableCell>
                  <TableCell align="center" sx={{ fontWeight: "bold", fontSize: "13px", color: "#4527a0" }}>{gCost}</TableCell>
                </TableRow>
              );

              return rows;
            })()}
          </TableBody>
        </Table>
      </Box>
    </Box>
  );
}