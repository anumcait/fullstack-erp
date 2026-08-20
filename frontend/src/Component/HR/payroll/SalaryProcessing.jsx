import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Box, Typography, Button, Grid, FormControl, InputLabel, Select, MenuItem,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  CircularProgress, Alert, Tabs, Tab
} from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import BuildIcon from "@mui/icons-material/Build";
import RefreshIcon from "@mui/icons-material/Refresh";
import ClearIcon from "@mui/icons-material/Clear";
import LockIcon from "@mui/icons-material/Lock";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import axios from "axios";
import { useToast } from "../../../context/ToastContext";
import { getErrorMessage } from "../../../utils/errorUtils";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const ScrollSyncWrapper = ({ children, maxHeight = 600 }) => {
  const topRef = useRef(null);
  const tableRef = useRef(null);
  const isScrollingRef = useRef(false);

  const updateWidth = useCallback(() => {
    const el = tableRef.current;
    if (el) {
      const w = el.scrollWidth;
      const top = topRef.current;
      if (top) {
        const inner = top.firstChild;
        if (inner) inner.style.width = w + 'px';
        top.style.overflowX = w > el.clientWidth ? 'auto' : 'hidden';
      }
    }
  }, []);

  useEffect(() => {
    updateWidth();
    const el = tableRef.current;
    if (!el) return;
    const ro = new ResizeObserver(updateWidth);
    ro.observe(el);
    return () => ro.disconnect();
  }, [children, updateWidth]);

  const handleScroll = useCallback((source, target) => {
    if (isScrollingRef.current) { isScrollingRef.current = false; return; }
    if (source.current && target.current) {
      isScrollingRef.current = true;
      target.current.scrollLeft = source.current.scrollLeft;
    }
  }, []);

  return (
    <Box>
      <Box
        ref={topRef}
        onScroll={() => handleScroll(topRef, tableRef)}
        sx={{
          overflowX: "hidden", overflowY: "hidden", width: "100%",
          height: "14px", mb: 0.5, bgcolor: "#f5f5f5",
          borderRadius: "4px", border: "1px solid #ccc",
          "&::-webkit-scrollbar": { height: "8px" },
          "&::-webkit-scrollbar-thumb": { backgroundColor: "#ccc", borderRadius: "4px" },
        }}
      >
        <Box sx={{ height: "1px" }} />
      </Box>
      <TableContainer
        ref={tableRef}
        onScroll={() => handleScroll(tableRef, topRef)}
        component={Paper}
        sx={{ maxHeight, overflowX: "auto", overflowY: "auto" }}
      >
        {children}
      </TableContainer>
    </Box>
  );
};

const SalaryProcessing = () => {
  const { showToast } = useToast();
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1;
  const prevYear = currentMonth === 1 ? currentYear - 1 : currentYear;

  const [year, setYear] = useState(prevYear);
  const [month, setMonth] = useState(prevMonth);
  const [processing, setProcessing] = useState(false);
  const [salaryData, setSalaryData] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [attSummary, setAttSummary] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [attendanceDetails, setAttendanceDetails] = useState({});
  const [finalized, setFinalized] = useState(false);
  const [finalizing, setFinalizing] = useState(false);
  const canProcess = year === prevYear && month === prevMonth;

const months = [
    { value: 1, label: "January" }, { value: 2, label: "February" },
    { value: 3, label: "March" }, { value: 4, label: "April" },
    { value: 5, label: "May" }, { value: 6, label: "June" },
    { value: 7, label: "July" }, { value: 8, label: "August" },
    { value: 9, label: "September" }, { value: 10, label: "October" },
    { value: 11, label: "November" }, { value: 12, label: "December" }
  ];

  const clearFilters = () => {
    setYear(prevYear);
    setMonth(prevMonth);
    setActiveTab(0);
  };

  const refreshData = () => {
    fetchSalaryRegister();
  };

  const fetchSalaryRegister = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/payroll/register?year=${year}&month=${month}`);
      setSalaryData(res.data);
      // Build attendance details from payslip data
      const details = {};
      res.data.forEach((row) => {
        const lop = row.C_LOP_AMT ? Math.round(parseFloat(row.C_LOP_AMT) / (parseFloat(row.C_BASIC) / (row.C_TOT_DAYS || 1))) : 0;
        details[String(row.C_EMPID)] = {
          paidDays: row.C_DAYS_PRESENT,
          woffs: row.C_WOFF_HOL,
          holidays: 0,
          leaves: row.C_LEAVES_ALLOWED,
          tour: 0,
          absent: row.C_ABSENT_DAYS,
          lop: lop,
          ot: parseFloat(row.C_OT_HRS) || 0,
          lateTimes: row.C_LATE_TIMES || 0,
          lateHalfDays: row.C_LATE_HALF_DAYS || 0,
          lateHalfHours: row.C_LATE_HALF_HOURS || 0,
          lateDed: parseFloat(row.C_LATE_DED_AMT) || 0,
        };
      });
      setAttendanceDetails(details);
      // Build summary
      const totalOt = res.data.reduce((s, r) => s + (parseFloat(r.C_OT_HRS) || 0), 0);
      const bonusEligible = res.data.filter((r) => r.C_EARNED_AB > 0).length;

      // Staff vs Trainee breakdown
      const staff = res.data.filter(r => r.employee?.employment_status !== 'Trainee');
      const trainee = res.data.filter(r => r.employee?.employment_status === 'Trainee');
      const calc = (arr) => ({
        count: arr.length,
        totalOt: arr.reduce((s, r) => s + (parseFloat(r.C_OT_HRS) || 0), 0),
        bonusEligible: arr.filter((r) => r.C_EARNED_AB > 0).length,
      });

      setAttSummary({
        totalOt, bonusEligible,
        staff: calc(staff),
        trainee: calc(trainee),
      });
      setLoaded(true);
    } catch (err) {
      console.error("Error fetching salary register:", err);
      setLoaded(true);
    }
  };

  const checkFinalizeStatus = useCallback(async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/payroll/finalize-status?month=${month}&year=${year}`);
      setFinalized(res.data.finalized);
    } catch {
      setFinalized(false);
    }
  }, [month, year]);

  const finalizeSalary = async () => {
    if (!window.confirm(`Are you sure you want to finalize salary for ${months[month - 1].label} ${year}? This will lock all transactions for this month and require special approval for any changes.`)) return;
    setFinalizing(true);
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/payroll/finalize`, { month, year });
      setFinalized(true);
      showToast(`✅ Salary finalized for ${months[month - 1].label} ${year}`, "success");
    } catch (err) {
      showToast(getErrorMessage(err, "Error finalizing salary"), "error");
    } finally {
      setFinalizing(false);
    }
  };

  useEffect(() => {
    fetchSalaryRegister();
  }, [year, month]);

  useEffect(() => {
    checkFinalizeStatus();
  }, [year, month, checkFinalizeStatus]);

  const processSalary = async () => {
    setProcessing(true);
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/payroll/process`, { year, month });
      showToast(`✅ Payslip processed for ${months[month - 1].label} ${year}`, "success");
      fetchSalaryRegister();
    } catch (err) {
      showToast(getErrorMessage(err, "Error processing payslip"), "error");
    } finally {
      setProcessing(false);
    }
  };

  const generateMarch2026Data = async () => {
    if (!window.confirm(`This will create ${months[month - 1].label} ${year} shift schedules, attendance, and set fixed salaries. Continue?`)) return;
    setGenerating(true);
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/shift/generate-monthly`, { year, month });
      showToast(`✅ Generated: ${res.data.shiftsCreated} shifts, ${res.data.attendanceCreated} attendance - Salaries set from prompt.md`, "success");
    } catch (err) {
      if (err.response?.status === 400) {
        const regenerate = window.confirm(`${err.response.data.message}. Click OK to regenerate (overwrite), or Cancel to keep existing.`);
        if (regenerate) {
          const res2 = await axios.post(`${import.meta.env.VITE_API_URL}/api/shift/generate-monthly`, { year, month, regenerate: true });
          showToast(`✅ Regenerated: ${res2.data.shiftsCreated} records`, "success");
        }
      } else {
        showToast(getErrorMessage(err, "Error generating data"), "error");
      }
    } finally {
      setGenerating(false);
    }
  };

  const stickyWidths = [40, 60, 180];
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
    ...extra,
  });

  const fmt = (value) => {
    if (value === null || value === undefined) return '0';
    const num = Number(value);
    return Number.isInteger(num) ? String(num) : String(num);
  };
  const formatCurrency = (value) => {
    if (value === null || value === undefined) return '0';
    const num = Number(value);
    if (Number.isInteger(num)) return num.toLocaleString('en-IN');
    return num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const staffData = salaryData.filter(r => r.employee?.employment_status !== 'Trainee');
  const traineeData = salaryData.filter(r => r.employee?.employment_status === 'Trainee');

  const renderBasicData = () => (
    <ScrollSyncWrapper>
      <Table size="small" sx={{ '& .MuiTableCell-root': { borderRight: '1px solid #e0e0e0' } }}>
        <TableHead sx={{ position: 'sticky', top: 0, zIndex: 8 }}>
          <TableRow sx={{ backgroundColor: 'rgba(25, 118, 210, 0.08)', color: 'primary.dark' }}>
            <TableCell sx={stickyCellSx(0, { color: 'primary.dark', bgcolor: 'rgba(25, 118, 210, 0.08)', zIndex: 12 })}><strong>S.No</strong></TableCell>
            <TableCell sx={stickyCellSx(1, { color: 'primary.dark', bgcolor: 'rgba(25, 118, 210, 0.08)', zIndex: 12 })}><strong>ID</strong></TableCell>
            <TableCell sx={stickyCellSx(2, { color: 'primary.dark', bgcolor: 'rgba(25, 118, 210, 0.08)', zIndex: 12 })}><strong>Employee Name</strong></TableCell>
            <TableCell sx={{ color: 'primary.dark' }}><strong>Basic</strong></TableCell>
            <TableCell sx={{ color: 'primary.dark' }}><strong>HRA</strong></TableCell>
            <TableCell sx={{ color: 'primary.dark' }}><strong>Conveyance</strong></TableCell>
            <TableCell sx={{ color: 'primary.dark' }}><strong>Washing</strong></TableCell>
            <TableCell sx={{ color: 'primary.dark' }}><strong>Total Gross</strong></TableCell>
            <TableCell sx={{ color: 'primary.dark' }}><strong>PF</strong></TableCell>
            <TableCell sx={{ color: 'primary.dark' }}><strong>ESI</strong></TableCell>
            {salaryData.some(r => r.C_OT_EXIST === 'Y') && <TableCell sx={{ color: 'primary.dark' }}><strong>OT</strong></TableCell>}
          </TableRow>
        </TableHead>
        {[staffData, traineeData].map((group, gi) => {
          const label = gi === 0 ? 'Staff' : 'Trainee';
          if (!group.length) return null;
          return (
            <TableBody key={label}>
              <TableRow>
                <TableCell colSpan={99} sx={{ fontWeight: 'bold', bgcolor: '#e8eaf6', py: 0.5 }}>{label} ({group.length})</TableCell>
              </TableRow>
              {group.map((row, idx) => (
                <TableRow key={row.C_EMPID}>
                  <TableCell sx={stickyCellSx(0)}>{idx + 1}</TableCell>
                  <TableCell sx={stickyCellSx(1)}>{row.C_EMPID}</TableCell>
                  <TableCell sx={stickyCellSx(2)}>{row.C_ENAME}</TableCell>
                  <TableCell>{formatCurrency(row.C_BASIC)}</TableCell>
                  <TableCell>{formatCurrency(row.C_HRA)}</TableCell>
                  <TableCell>{formatCurrency(row.C_CONV)}</TableCell>
                  <TableCell>{formatCurrency(row.C_OTHERS)}</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>{formatCurrency(row.C_TOT_SAL)}</TableCell>
                  <TableCell>{row.C_PF_EXIST === 'Y' ? 'Yes' : 'No'}</TableCell>
                  <TableCell>{row.C_ESI_EXIST === 'Y' ? 'Yes' : 'No'}</TableCell>
                  {salaryData.some(r => r.C_OT_EXIST === 'Y') && (
                    <TableCell>{row.C_OT_EXIST === 'Y' ? 'Yes' : 'No'}</TableCell>
                  )}
                </TableRow>
              ))}
              <TableRow sx={{ '& .MuiTableCell-root': { fontWeight: 'bold', bgcolor: '#e8eaf6', borderTop: '2px solid primary.main' } }}>
                <TableCell colSpan={3} sx={{ textAlign: 'right', pr: 2 }}>{label} Total →</TableCell>
                <TableCell>{formatCurrency(group.reduce((s, r) => s + (parseFloat(r.C_BASIC) || 0), 0))}</TableCell>
                <TableCell>{formatCurrency(group.reduce((s, r) => s + (parseFloat(r.C_HRA) || 0), 0))}</TableCell>
                <TableCell>{formatCurrency(group.reduce((s, r) => s + (parseFloat(r.C_CONV) || 0), 0))}</TableCell>
                <TableCell>{formatCurrency(group.reduce((s, r) => s + (parseFloat(r.C_OTHERS) || 0), 0))}</TableCell>
                <TableCell>{formatCurrency(group.reduce((s, r) => s + (parseFloat(r.C_TOT_SAL) || 0), 0))}</TableCell>
                <TableCell colSpan={salaryData.some(r => r.C_OT_EXIST === 'Y') ? 3 : 2}></TableCell>
              </TableRow>
            </TableBody>
          );
        })}
        <TableBody sx={{ '& .MuiTableCell-root': { borderTop: '2px solid primary.main', fontWeight: 'bold', backgroundColor: '#e3f2fd' } }}>
          <TableRow>
            <TableCell colSpan={3} sx={{ fontWeight: 'bold', backgroundColor: '#e3f2fd', borderTop: '2px solid primary.main', textAlign: 'right', pr: 2 }}>
              <strong>Grand Total →</strong>
            </TableCell>
            <TableCell>{formatCurrency(salaryData.reduce((s, r) => s + (parseFloat(r.C_BASIC) || 0), 0))}</TableCell>
            <TableCell>{formatCurrency(salaryData.reduce((s, r) => s + (parseFloat(r.C_HRA) || 0), 0))}</TableCell>
            <TableCell>{formatCurrency(salaryData.reduce((s, r) => s + (parseFloat(r.C_CONV) || 0), 0))}</TableCell>
            <TableCell>{formatCurrency(salaryData.reduce((s, r) => s + (parseFloat(r.C_OTHERS) || 0), 0))}</TableCell>
            <TableCell>{formatCurrency(salaryData.reduce((s, r) => s + (parseFloat(r.C_TOT_SAL) || 0), 0))}</TableCell>
            <TableCell colSpan={salaryData.some(r => r.C_OT_EXIST === 'Y') ? 3 : 2}></TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </ScrollSyncWrapper>
  );

  const attSum = (arr, field) => arr.reduce((s, r) => s + (parseFloat(attendanceDetails[String(r.C_EMPID)]?.[field]) || 0), 0);
  const renderAttendanceData = () => (
    <ScrollSyncWrapper>
      <Table size="small" sx={{ '& .MuiTableCell-root': { borderRight: '1px solid #e0e0e0' } }}>
        <TableHead sx={{ position: 'sticky', top: 0, zIndex: 8 }}>
          <TableRow sx={{ backgroundColor: 'rgba(25, 118, 210, 0.08)', color: 'primary.dark' }}>
            <TableCell sx={stickyCellSx(0, { color: 'primary.dark', bgcolor: 'rgba(25, 118, 210, 0.08)', zIndex: 12 })}><strong>S.No</strong></TableCell>
            <TableCell sx={stickyCellSx(1, { color: 'primary.dark', bgcolor: 'rgba(25, 118, 210, 0.08)', zIndex: 12 })}><strong>ID</strong></TableCell>
            <TableCell sx={stickyCellSx(2, { color: 'primary.dark', bgcolor: 'rgba(25, 118, 210, 0.08)', zIndex: 12 })}><strong>Employee Name</strong></TableCell>
            <TableCell sx={{ color: 'primary.dark' }}><strong>Month Days</strong></TableCell>
            <TableCell sx={{ color: 'primary.dark' }}><strong>Paid Days</strong></TableCell>
            <TableCell sx={{ color: 'primary.dark' }}><strong>W-Off/Hol</strong></TableCell>
            <TableCell sx={{ color: 'primary.dark' }}><strong>Leaves</strong></TableCell>
            <TableCell sx={{ color: 'primary.dark' }}><strong>Absent</strong></TableCell>
            <TableCell sx={{ color: 'primary.dark' }}><strong>LOP</strong></TableCell>
            <TableCell sx={{ color: 'primary.dark' }}><strong>Total Paid</strong></TableCell>
            <TableCell sx={{ color: 'primary.dark' }}><strong>OT Hrs</strong></TableCell>
            <TableCell sx={{ color: 'primary.dark' }}><strong>Late Times</strong></TableCell>
            <TableCell sx={{ color: 'primary.dark' }}><strong>Half Days</strong></TableCell>
            <TableCell sx={{ color: 'primary.dark' }}><strong>Hour Ded</strong></TableCell>
            <TableCell sx={{ color: 'primary.dark' }}><strong>Late Ded</strong></TableCell>
          </TableRow>
        </TableHead>
        {[staffData, traineeData].map((group, gi) => {
          const label = gi === 0 ? 'Staff' : 'Trainee';
          if (!group.length) return null;
          return (
            <TableBody key={label}>
              <TableRow>
                <TableCell colSpan={99} sx={{ fontWeight: 'bold', bgcolor: '#e8f5e9', py: 0.5 }}>{label} ({group.length})</TableCell>
              </TableRow>
              {group.map((row, idx) => {
                const att = attendanceDetails[String(row.C_EMPID)] || {};
                return (
                  <TableRow key={row.C_EMPID}>
                    <TableCell sx={stickyCellSx(0)}>{idx + 1}</TableCell>
                    <TableCell sx={stickyCellSx(1)}>{row.C_EMPID}</TableCell>
                    <TableCell sx={stickyCellSx(2)}>{row.C_ENAME}</TableCell>
                    <TableCell>{row.C_TOT_DAYS}</TableCell>
                    <TableCell>{att.paidDays || 0}</TableCell>
                    <TableCell>{att.woffs || 0}</TableCell>
                    <TableCell>{att.leaves || 0}</TableCell>
                    <TableCell>{att.absent || 0}</TableCell>
                    <TableCell>{att.lop || 0}</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#2e7d32' }}>{fmt(row.C_DAYS_PRESENT || 0)}</TableCell>
                    <TableCell>{fmt(att.ot || 0)}</TableCell>
                    <TableCell>{att.lateTimes || 0}</TableCell>
                    <TableCell>{att.lateHalfDays || 0}</TableCell>
                    <TableCell>{Math.max(0, (att.lateTimes || 0) - 1 - (att.lateHalfDays || 0))}</TableCell>
                    <TableCell>{formatCurrency(att.lateDed || 0)}</TableCell>
                  </TableRow>
                );
              })}
              <TableRow sx={{ '& .MuiTableCell-root': { fontWeight: 'bold', bgcolor: '#e8f5e9', borderTop: '2px solid #2e7d32' } }}>
                <TableCell colSpan={3} sx={{ textAlign: 'right', pr: 2 }}>{label} Total →</TableCell>
                <TableCell>{group.reduce((s, r) => s + (parseFloat(r.C_TOT_DAYS) || 0), 0)}</TableCell>
                <TableCell>{attSum(group, 'paidDays')}</TableCell>
                <TableCell>{attSum(group, 'woffs')}</TableCell>
                <TableCell>{attSum(group, 'leaves')}</TableCell>
                <TableCell>{attSum(group, 'absent')}</TableCell>
                <TableCell>{attSum(group, 'lop')}</TableCell>
                <TableCell>{group.reduce((s, r) => s + (parseFloat(r.C_DAYS_PRESENT) || 0), 0)}</TableCell>
                <TableCell>{fmt(attSum(group, 'ot'))}</TableCell>
                <TableCell>{attSum(group, 'lateTimes')}</TableCell>
                <TableCell>{attSum(group, 'lateHalfDays')}</TableCell>
                <TableCell>{group.reduce((s, r) => { const a = attendanceDetails[String(r.C_EMPID)] || {}; return s + Math.max(0, (a.lateTimes||0) - 1 - (a.lateHalfDays||0)); }, 0)}</TableCell>
                <TableCell>{formatCurrency(attSum(group, 'lateDed'))}</TableCell>
              </TableRow>
            </TableBody>
          );
        })}
        <TableBody sx={{ '& .MuiTableCell-root': { borderTop: '2px solid #2e7d32', fontWeight: 'bold', backgroundColor: '#c8e6c9' } }}>
          <TableRow>
            <TableCell colSpan={3} sx={{ fontWeight: 'bold', backgroundColor: '#c8e6c9', borderTop: '2px solid #2e7d32', textAlign: 'right', pr: 2 }}><strong>Grand Total →</strong></TableCell>
            <TableCell>{salaryData.reduce((s, r) => s + (parseFloat(r.C_TOT_DAYS) || 0), 0)}</TableCell>
            <TableCell>{attSum(salaryData, 'paidDays')}</TableCell>
            <TableCell>{attSum(salaryData, 'woffs')}</TableCell>
            <TableCell>{attSum(salaryData, 'leaves')}</TableCell>
            <TableCell>{attSum(salaryData, 'absent')}</TableCell>
            <TableCell>{attSum(salaryData, 'lop')}</TableCell>
            <TableCell sx={{ color: '#2e7d32' }}>{salaryData.reduce((s, r) => s + (parseFloat(r.C_DAYS_PRESENT) || 0), 0)}</TableCell>
            <TableCell>{fmt(attSum(salaryData, 'ot'))}</TableCell>
            <TableCell>{attSum(salaryData, 'lateTimes')}</TableCell>
            <TableCell>{attSum(salaryData, 'lateHalfDays')}</TableCell>
            <TableCell>{salaryData.reduce((s, r) => { const a = attendanceDetails[String(r.C_EMPID)] || {}; return s + Math.max(0, (a.lateTimes||0) - 1 - (a.lateHalfDays||0)); }, 0)}</TableCell>
            <TableCell>{formatCurrency(attSum(salaryData, 'lateDed'))}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </ScrollSyncWrapper>
  );

  const sum = (arr, f) => formatCurrency(arr.reduce((s, r) => s + (parseFloat(r[f]) || 0), 0));
  const sumN = (arr, f) => arr.reduce((s, r) => s + (parseFloat(r[f]) || 0), 0);

  const defaultCols = {
    fixedBasic: true, fixedHra: true, fixedCa: true, fixedWa: true, fixedGross: true,
    earnedDays: true, earnedBasic: true, earnedHra: true, earnedOthers: true, earnedWa: true,
    earnedAb: true, earnedOtHrs: true, earnedOtAmt: true, earnedTotal: true,
    esi: true, pf: true, pt: true, tds: true, lic: true, otherDed: true, salAdv: true,
    totalDed: true, netAmount: true,
  };
  const getSavedCols = () => {
    try { return { ...defaultCols, ...JSON.parse(localStorage.getItem('payrollVisibleCols')) }; } catch { return defaultCols; }
  };
  const [visibleCols] = useState(getSavedCols);

  const showFixedBasic = visibleCols.fixedBasic;
  const showFixedHra = visibleCols.fixedHra;
  const showFixedCa = visibleCols.fixedCa;
  const showFixedWa = visibleCols.fixedWa;
  const showFixedGross = visibleCols.fixedGross;
  const showEarnedDays = visibleCols.earnedDays;
  const showEarnedBasic = visibleCols.earnedBasic;
  const showEarnedHra = visibleCols.earnedHra;
  const showEarnedOthers = visibleCols.earnedOthers;
  const showEarnedWa = visibleCols.earnedWa;
  const showEarnedAb = visibleCols.earnedAb;
  const showEarnedOtHrs = visibleCols.earnedOtHrs;
  const showEarnedOtAmt = visibleCols.earnedOtAmt;
  const showEarnedTotal = visibleCols.earnedTotal;
  const showEsi = visibleCols.esi;
  const showPf = visibleCols.pf;
  const showPt = visibleCols.pt;
  const showTds = visibleCols.tds;
  const showLic = visibleCols.lic;
  const showOtherDed = visibleCols.otherDed;
  const showSalAdv = visibleCols.salAdv;
  const showTotalDed = visibleCols.totalDed;
  const showNetAmount = visibleCols.netAmount;

  const visibleFixedCols = [showFixedBasic, showFixedHra, showFixedCa, showFixedWa, showFixedGross].filter(Boolean).length;
  const visibleEarnedCols = [showEarnedDays, showEarnedBasic, showEarnedHra, showEarnedOthers, showEarnedWa, showEarnedAb, showEarnedOtHrs, showEarnedOtAmt, showEarnedTotal].filter(Boolean).length;
  const visibleDedCols = [showEsi, showPf, showPt, showTds, showLic, showOtherDed, showSalAdv].filter(Boolean).length;

  const renderProcessedData = () => (
    <ScrollSyncWrapper>
      <Table size="small" sx={{ '& .MuiTableCell-root': { borderRight: '1px solid #e0e0e0' } }}>
        <TableHead sx={{ position: 'sticky', top: 0, zIndex: 8 }}>
          <TableRow sx={{ backgroundColor: 'rgba(25, 118, 210, 0.08)', color: 'primary.dark' }}>
            <TableCell rowSpan={2} sx={stickyCellSx(0, { color: 'white', bgcolor: 'primary.main', zIndex: 12, verticalAlign: 'bottom' })}><strong>S.No</strong></TableCell>
            <TableCell rowSpan={2} sx={stickyCellSx(1, { color: 'white', bgcolor: 'primary.main', zIndex: 12, verticalAlign: 'bottom' })}><strong>ID.No</strong></TableCell>
            <TableCell rowSpan={2} sx={stickyCellSx(2, { color: 'white', bgcolor: 'primary.main', zIndex: 12, verticalAlign: 'bottom' })}><strong>Name of Employee</strong></TableCell>
            {visibleFixedCols > 0 && <TableCell colSpan={visibleFixedCols} sx={{ color: 'white', textAlign: 'center' }}><strong>Fixed Salary</strong></TableCell>}
            {visibleEarnedCols > 0 && <TableCell colSpan={visibleEarnedCols} sx={{ color: 'white', textAlign: 'center' }}><strong>Earned Salary</strong></TableCell>}
            {visibleDedCols > 0 && <TableCell colSpan={visibleDedCols} sx={{ color: 'white', textAlign: 'center' }}><strong>Deduction</strong></TableCell>}
            {showTotalDed && <TableCell rowSpan={2} sx={{ color: 'white', verticalAlign: 'bottom' }}><strong>Total Ded</strong></TableCell>}
            {showNetAmount && <TableCell rowSpan={2} sx={{ color: 'white', verticalAlign: 'bottom' }}><strong>Net Amount</strong></TableCell>}
          </TableRow>
          <TableRow sx={{ backgroundColor: 'rgba(25, 118, 210, 0.08)', color: 'primary.dark' }}>
            {showFixedBasic && <TableCell sx={{ color: 'primary.dark' }}><strong>Basic</strong></TableCell>}
            {showFixedHra && <TableCell sx={{ color: 'primary.dark' }}><strong>HRA</strong></TableCell>}
            {showFixedCa && <TableCell sx={{ color: 'primary.dark' }}><strong>CA/Others</strong></TableCell>}
            {showFixedWa && <TableCell sx={{ color: 'primary.dark' }}><strong>W.A</strong></TableCell>}
            {showFixedGross && <TableCell sx={{ color: 'primary.dark' }}><strong>Gross Salary</strong></TableCell>}
            {showEarnedDays && <TableCell sx={{ color: 'primary.dark' }}><strong>No. Days</strong></TableCell>}
            {showEarnedBasic && <TableCell sx={{ color: 'primary.dark' }}><strong>Basic</strong></TableCell>}
            {showEarnedHra && <TableCell sx={{ color: 'primary.dark' }}><strong>HRA</strong></TableCell>}
            {showEarnedOthers && <TableCell sx={{ color: 'primary.dark' }}><strong>Others</strong></TableCell>}
            {showEarnedWa && <TableCell sx={{ color: 'primary.dark' }}><strong>W.A</strong></TableCell>}
            {showEarnedAb && <TableCell sx={{ color: 'primary.dark' }}><strong>A.B</strong></TableCell>}
            {showEarnedOtHrs && <TableCell sx={{ color: 'primary.dark' }}><strong>OT Hrs</strong></TableCell>}
            {showEarnedOtAmt && <TableCell sx={{ color: 'primary.dark' }}><strong>OT Amt</strong></TableCell>}
            {showEarnedTotal && <TableCell sx={{ color: 'primary.dark' }}><strong>Total</strong></TableCell>}
            {showEsi && <TableCell sx={{ color: 'primary.dark' }}><strong>ESI</strong></TableCell>}
            {showPf && <TableCell sx={{ color: 'primary.dark' }}><strong>PF</strong></TableCell>}
            {showPt && <TableCell sx={{ color: 'primary.dark' }}><strong>PT</strong></TableCell>}
            {showTds && <TableCell sx={{ color: 'primary.dark' }}><strong>TDS</strong></TableCell>}
            {showLic && <TableCell sx={{ color: 'primary.dark' }}><strong>LIC</strong></TableCell>}
            {showOtherDed && <TableCell sx={{ color: 'primary.dark' }}><strong>Other Ded</strong></TableCell>}
            {showSalAdv && <TableCell sx={{ color: 'primary.dark' }}><strong>Sal. Adv</strong></TableCell>}
          </TableRow>
        </TableHead>
        {[staffData, traineeData].map((group, gi) => {
          const label = gi === 0 ? 'Staff' : 'Trainee';
          if (!group.length) return null;
          return (
            <TableBody key={label}>
              <TableRow>
                <TableCell colSpan={99} sx={{ fontWeight: 'bold', bgcolor: '#e8eaf6', py: 0.5 }}>{label} ({group.length})</TableCell>
              </TableRow>
              {group.map((row, idx) => (
                <TableRow key={row.C_EMPID}>
                  <TableCell sx={stickyCellSx(0)}>{idx + 1}</TableCell>
                  <TableCell sx={stickyCellSx(1)}>{row.C_EMPID}</TableCell>
                  <TableCell sx={stickyCellSx(2)}>{row.C_ENAME}</TableCell>
                  {showFixedBasic && <TableCell>{formatCurrency(row.C_BASIC)}</TableCell>}
                  {showFixedHra && <TableCell>{formatCurrency(row.C_HRA)}</TableCell>}
                  {showFixedCa && <TableCell>{formatCurrency(row.C_CONV)}</TableCell>}
                  {showFixedWa && <TableCell>{formatCurrency(row.C_OTHERS)}</TableCell>}
                  {showFixedGross && <TableCell sx={{ fontWeight: 'bold' }}>{formatCurrency(row.C_TOT_SAL)}</TableCell>}
                  {showEarnedDays && <TableCell>{fmt(row.C_DAYS_PRESENT)}</TableCell>}
                  {showEarnedBasic && <TableCell>{formatCurrency(row.C_EARNED_BASIC)}</TableCell>}
                  {showEarnedHra && <TableCell>{formatCurrency(row.C_EARNED_HRA)}</TableCell>}
                  {showEarnedOthers && <TableCell>{formatCurrency(row.C_EARNED_CONV)}</TableCell>}
                  {showEarnedWa && <TableCell>{formatCurrency(row.C_EARNED_OTHERS)}</TableCell>}
                  {showEarnedAb && <TableCell>{formatCurrency(row.C_EARNED_AB)}</TableCell>}
                  {showEarnedOtHrs && <TableCell>{row.C_OT_EXIST === 'Y' ? fmt(row.C_OT_HRS || 0) : '0'}</TableCell>}
                  {showEarnedOtAmt && <TableCell>{row.C_OT_EXIST === 'Y' ? formatCurrency(row.C_EARNED_OT) : '0'}</TableCell>}
                  {showEarnedTotal && <TableCell sx={{ fontWeight: 'bold', color: '#2e7d32' }}>{formatCurrency(row.C_EARNED_GROSS)}</TableCell>}
                  {showEsi && <TableCell>{formatCurrency(row.C_DED_ESI)}</TableCell>}
                  {showPf && <TableCell>{formatCurrency(row.C_DED_PF)}</TableCell>}
                  {showPt && <TableCell>{formatCurrency(row.C_DED_PT)}</TableCell>}
                  {showTds && <TableCell>{formatCurrency(row.C_DED_TAX)}</TableCell>}
                  {showLic && <TableCell>{formatCurrency(row.C_DED_LIC)}</TableCell>}
                  {showOtherDed && <TableCell>{formatCurrency(row.C_LATE_DED_AMT)}</TableCell>}
                  {showSalAdv && <TableCell>{formatCurrency(row.C_DED_ADV)}</TableCell>}
                  {showTotalDed && <TableCell sx={{ fontWeight: 'bold', color: '#c62828' }}>{formatCurrency(row.C_TOT_DED)}</TableCell>}
                  {showNetAmount && <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#fff3e0' }}>{formatCurrency(row.C_NET_AMT)}</TableCell>}
                </TableRow>
              ))}
              <TableRow sx={{ '& .MuiTableCell-root': { fontWeight: 'bold', bgcolor: '#e8eaf6', borderTop: '2px solid primary.main' } }}>
                <TableCell colSpan={3} sx={{ textAlign: 'right', pr: 2 }}>{label} Total →</TableCell>
                {showFixedBasic && <TableCell>{sum(group, 'C_BASIC')}</TableCell>}
                {showFixedHra && <TableCell>{sum(group, 'C_HRA')}</TableCell>}
                {showFixedCa && <TableCell>{sum(group, 'C_CONV')}</TableCell>}
                {showFixedWa && <TableCell>{sum(group, 'C_OTHERS')}</TableCell>}
                {showFixedGross && <TableCell>{sum(group, 'C_TOT_SAL')}</TableCell>}
                {showEarnedDays && <TableCell>{sumN(group, 'C_DAYS_PRESENT')}</TableCell>}
                {showEarnedBasic && <TableCell>{sum(group, 'C_EARNED_BASIC')}</TableCell>}
                {showEarnedHra && <TableCell>{sum(group, 'C_EARNED_HRA')}</TableCell>}
                {showEarnedOthers && <TableCell>{sum(group, 'C_EARNED_CONV')}</TableCell>}
                {showEarnedWa && <TableCell>{sum(group, 'C_EARNED_OTHERS')}</TableCell>}
                {showEarnedAb && <TableCell>{sum(group, 'C_EARNED_AB')}</TableCell>}
                {showEarnedOtHrs && <TableCell>{fmt(sumN(group, 'C_OT_HRS'))}</TableCell>}
                {showEarnedOtAmt && <TableCell>{sum(group, 'C_EARNED_OT')}</TableCell>}
                {showEarnedTotal && <TableCell>{sum(group, 'C_EARNED_GROSS')}</TableCell>}
                {showEsi && <TableCell>{sum(group, 'C_DED_ESI')}</TableCell>}
                {showPf && <TableCell>{sum(group, 'C_DED_PF')}</TableCell>}
                {showPt && <TableCell>{sum(group, 'C_DED_PT')}</TableCell>}
                {showTds && <TableCell>{sum(group, 'C_DED_TAX')}</TableCell>}
                {showLic && <TableCell>{sum(group, 'C_DED_LIC')}</TableCell>}
                {showOtherDed && <TableCell>{sum(group, 'C_LATE_DED_AMT')}</TableCell>}
                {showSalAdv && <TableCell>{sum(group, 'C_DED_ADV')}</TableCell>}
                {showTotalDed && <TableCell>{sum(group, 'C_TOT_DED')}</TableCell>}
                {showNetAmount && <TableCell>{sum(group, 'C_NET_AMT')}</TableCell>}
              </TableRow>
            </TableBody>
          );
        })}
        <TableBody sx={{ '& .MuiTableCell-root': { borderTop: '2px solid primary.main', fontWeight: 'bold', backgroundColor: '#e3f2fd' } }}>
          <TableRow>
            <TableCell colSpan={3} sx={{ fontWeight: 'bold', backgroundColor: '#e3f2fd', borderTop: '2px solid primary.main', textAlign: 'right', pr: 2 }}><strong>Grand Total →</strong></TableCell>
            {showFixedBasic && <TableCell>{sum(salaryData, 'C_BASIC')}</TableCell>}
            {showFixedHra && <TableCell>{sum(salaryData, 'C_HRA')}</TableCell>}
            {showFixedCa && <TableCell>{sum(salaryData, 'C_CONV')}</TableCell>}
            {showFixedWa && <TableCell>{sum(salaryData, 'C_OTHERS')}</TableCell>}
            {showFixedGross && <TableCell>{sum(salaryData, 'C_TOT_SAL')}</TableCell>}
            {showEarnedDays && <TableCell>{sumN(salaryData, 'C_DAYS_PRESENT')}</TableCell>}
            {showEarnedBasic && <TableCell>{sum(salaryData, 'C_EARNED_BASIC')}</TableCell>}
            {showEarnedHra && <TableCell>{sum(salaryData, 'C_EARNED_HRA')}</TableCell>}
            {showEarnedOthers && <TableCell>{sum(salaryData, 'C_EARNED_CONV')}</TableCell>}
            {showEarnedWa && <TableCell>{sum(salaryData, 'C_EARNED_OTHERS')}</TableCell>}
            {showEarnedAb && <TableCell>{sum(salaryData, 'C_EARNED_AB')}</TableCell>}
            {showEarnedOtHrs && <TableCell>{fmt(sumN(salaryData, 'C_OT_HRS'))}</TableCell>}
            {showEarnedOtAmt && <TableCell>{sum(salaryData, 'C_EARNED_OT')}</TableCell>}
            {showEarnedTotal && <TableCell>{sum(salaryData, 'C_EARNED_GROSS')}</TableCell>}
            {showEsi && <TableCell>{sum(salaryData, 'C_DED_ESI')}</TableCell>}
            {showPf && <TableCell>{sum(salaryData, 'C_DED_PF')}</TableCell>}
            {showPt && <TableCell>{sum(salaryData, 'C_DED_PT')}</TableCell>}
            {showTds && <TableCell>{sum(salaryData, 'C_DED_TAX')}</TableCell>}
            {showLic && <TableCell>{sum(salaryData, 'C_DED_LIC')}</TableCell>}
            {showOtherDed && <TableCell>{sum(salaryData, 'C_LATE_DED_AMT')}</TableCell>}
            {showSalAdv && <TableCell>{sum(salaryData, 'C_DED_ADV')}</TableCell>}
            {showTotalDed && <TableCell>{sum(salaryData, 'C_TOT_DED')}</TableCell>}
            {showNetAmount && <TableCell>{sum(salaryData, 'C_NET_AMT')}</TableCell>}
          </TableRow>
        </TableBody>
      </Table>
    </ScrollSyncWrapper>
  );

  const tableRefs = useRef({});

  const buildBasicDataExcel = () => {
    const rows = [];
    const header = ['S.No', 'ID', 'Employee Name', 'Basic', 'HRA', 'Conveyance', 'Washing', 'Total Gross', 'PF', 'ESI'];
    if (salaryData.some(r => r.C_OT_EXIST === 'Y')) header.push('OT');
    rows.push([`${months[month - 1].label} ${year} - Basic Salary Data`, ...header.slice(1).fill('')]);
    rows[0][0] = `${months[month - 1].label} ${year} - Basic Salary Data`;
    rows.push(header);
    [staffData, traineeData].forEach((group, gi) => {
      const label = gi === 0 ? 'Staff' : 'Trainee';
      if (!group.length) return;
      rows.push([label]);
      group.forEach((row, idx) => {
        const r = [idx + 1, row.C_EMPID, row.C_ENAME, parseFloat(row.C_BASIC)||0, parseFloat(row.C_HRA)||0, parseFloat(row.C_CONV)||0, parseFloat(row.C_OTHERS)||0, parseFloat(row.C_TOT_SAL)||0, row.C_PF_EXIST === 'Y' ? 'Yes' : 'No', row.C_ESI_EXIST === 'Y' ? 'Yes' : 'No'];
        if (salaryData.some(e => e.C_OT_EXIST === 'Y')) r.push(row.C_OT_EXIST === 'Y' ? 'Yes' : 'No');
        rows.push(r);
      });
      const totals = ['', '', `${label} Total`, group.reduce((s, r) => s + (parseFloat(r.C_BASIC)||0), 0), group.reduce((s, r) => s + (parseFloat(r.C_HRA)||0), 0), group.reduce((s, r) => s + (parseFloat(r.C_CONV)||0), 0), group.reduce((s, r) => s + (parseFloat(r.C_OTHERS)||0), 0), group.reduce((s, r) => s + (parseFloat(r.C_TOT_SAL)||0), 0)];
      rows.push(totals);
    });
    const gt = ['', '', 'Grand Total', salaryData.reduce((s, r) => s + (parseFloat(r.C_BASIC)||0), 0), salaryData.reduce((s, r) => s + (parseFloat(r.C_HRA)||0), 0), salaryData.reduce((s, r) => s + (parseFloat(r.C_CONV)||0), 0), salaryData.reduce((s, r) => s + (parseFloat(r.C_OTHERS)||0), 0), salaryData.reduce((s, r) => s + (parseFloat(r.C_TOT_SAL)||0), 0)];
    rows.push(gt);
    return rows;
  };

  const buildAttendanceDataExcel = () => {
    const rows = [];
    rows.push([`${months[month - 1].label} ${year} - Attendance Details`]);
    rows.push(['S.No', 'ID', 'Employee Name', 'Month Days', 'Paid Days', 'W-Off/Hol', 'Leaves', 'Absent', 'LOP', 'Total Paid', 'OT Hrs', 'Late Times', 'Half Days', 'Hour Ded', 'Late Ded']);
    [staffData, traineeData].forEach((group, gi) => {
      const label = gi === 0 ? 'Staff' : 'Trainee';
      if (!group.length) return;
      rows.push([label]);
      group.forEach((row, idx) => {
        const att = attendanceDetails[String(row.C_EMPID)] || {};
        rows.push([idx + 1, row.C_EMPID, row.C_ENAME, row.C_TOT_DAYS, att.paidDays||0, att.woffs||0, att.leaves||0, att.absent||0, att.lop||0, parseFloat(row.C_DAYS_PRESENT)||0, att.ot||0, att.lateTimes||0, att.lateHalfDays||0, Math.max(0, (att.lateTimes||0)-1-(att.lateHalfDays||0)), att.lateDed||0]);
      });
      const hourDedTotal = group.reduce((s, r) => { const a = attendanceDetails[String(r.C_EMPID)] || {}; return s + Math.max(0, (a.lateTimes||0) - 1 - (a.lateHalfDays||0)); }, 0);
      rows.push(['', '', `${label} Total`, group.reduce((s, r) => s + (parseFloat(r.C_TOT_DAYS)||0), 0), attSum(group, 'paidDays'), attSum(group, 'woffs'), attSum(group, 'leaves'), attSum(group, 'absent'), attSum(group, 'lop'), group.reduce((s, r) => s + (parseFloat(r.C_DAYS_PRESENT)||0), 0), attSum(group, 'ot'), attSum(group, 'lateTimes'), attSum(group, 'lateHalfDays'), hourDedTotal, attSum(group, 'lateDed')]);
    });
    const grandHourDed = salaryData.reduce((s, r) => { const a = attendanceDetails[String(r.C_EMPID)] || {}; return s + Math.max(0, (a.lateTimes||0) - 1 - (a.lateHalfDays||0)); }, 0);
    rows.push(['', '', 'Grand Total', salaryData.reduce((s, r) => s + (parseFloat(r.C_TOT_DAYS)||0), 0), attSum(salaryData, 'paidDays'), attSum(salaryData, 'woffs'), attSum(salaryData, 'leaves'), attSum(salaryData, 'absent'), attSum(salaryData, 'lop'), salaryData.reduce((s, r) => s + (parseFloat(r.C_DAYS_PRESENT)||0), 0), attSum(salaryData, 'ot'), attSum(salaryData, 'lateTimes'), attSum(salaryData, 'lateHalfDays'), grandHourDed, attSum(salaryData, 'lateDed')]);
    return rows;
  };

  const buildProcessedDataExcel = () => {
    const rows = [];
    const header1 = ['S.No', 'ID', 'Employee Name'];
    if (showFixedBasic) header1.push('Basic');
    if (showFixedHra) header1.push('HRA');
    if (showFixedCa) header1.push('CA/Others');
    if (showFixedWa) header1.push('W.A');
    if (showFixedGross) header1.push('Gross Salary');
    if (showEarnedDays) header1.push('No. Days');
    if (showEarnedBasic) header1.push('Basic');
    if (showEarnedHra) header1.push('HRA');
    if (showEarnedOthers) header1.push('Others');
    if (showEarnedWa) header1.push('W.A');
    if (showEarnedAb) header1.push('A.B');
    if (showEarnedOtHrs) header1.push('OT Hrs');
    if (showEarnedOtAmt) header1.push('OT Amt');
    if (showEarnedTotal) header1.push('Total');
    if (showEsi) header1.push('ESI');
    if (showPf) header1.push('PF');
    if (showPt) header1.push('PT');
    if (showTds) header1.push('TDS');
    if (showLic) header1.push('LIC');
    if (showOtherDed) header1.push('Other Ded');
    if (showSalAdv) header1.push('Sal. Adv');
    if (showTotalDed) header1.push('Total Ded');
    if (showNetAmount) header1.push('Net Amount');
    rows.push([`${months[month - 1].label} ${year} - Processed Salary`]);
    rows.push(header1);
    [staffData, traineeData].forEach((group, gi) => {
      const label = gi === 0 ? 'Staff' : 'Trainee';
      if (!group.length) return;
      rows.push([label]);
      group.forEach((row, idx) => {
        const r = [idx + 1, row.C_EMPID, row.C_ENAME];
        if (showFixedBasic) r.push(parseFloat(row.C_BASIC)||0);
        if (showFixedHra) r.push(parseFloat(row.C_HRA)||0);
        if (showFixedCa) r.push(parseFloat(row.C_CONV)||0);
        if (showFixedWa) r.push(parseFloat(row.C_OTHERS)||0);
        if (showFixedGross) r.push(parseFloat(row.C_TOT_SAL)||0);
        if (showEarnedDays) r.push(parseFloat(row.C_DAYS_PRESENT)||0);
        if (showEarnedBasic) r.push(parseFloat(row.C_EARNED_BASIC)||0);
        if (showEarnedHra) r.push(parseFloat(row.C_EARNED_HRA)||0);
        if (showEarnedOthers) r.push(parseFloat(row.C_EARNED_CONV)||0);
        if (showEarnedWa) r.push(parseFloat(row.C_EARNED_OTHERS)||0);
        if (showEarnedAb) r.push(parseFloat(row.C_EARNED_AB)||0);
        if (showEarnedOtHrs) r.push(row.C_OT_EXIST === 'Y' ? (parseFloat(row.C_OT_HRS)||0) : 0);
        if (showEarnedOtAmt) r.push(row.C_OT_EXIST === 'Y' ? (parseFloat(row.C_EARNED_OT)||0) : 0);
        if (showEarnedTotal) r.push(parseFloat(row.C_EARNED_GROSS)||0);
        if (showEsi) r.push(parseFloat(row.C_DED_ESI)||0);
        if (showPf) r.push(parseFloat(row.C_DED_PF)||0);
        if (showPt) r.push(parseFloat(row.C_DED_PT)||0);
        if (showTds) r.push(parseFloat(row.C_DED_TAX)||0);
        if (showLic) r.push(parseFloat(row.C_DED_LIC)||0);
        if (showOtherDed) r.push(parseFloat(row.C_LATE_DED_AMT)||0);
        if (showSalAdv) r.push(parseFloat(row.C_DED_ADV)||0);
        if (showTotalDed) r.push(parseFloat(row.C_TOT_DED)||0);
        if (showNetAmount) r.push(parseFloat(row.C_NET_AMT)||0);
        rows.push(r);
      });
      const totals = ['', '', `${label} Total`];
      if (showFixedBasic) totals.push(sumN(group, 'C_BASIC'));
      if (showFixedHra) totals.push(sumN(group, 'C_HRA'));
      if (showFixedCa) totals.push(sumN(group, 'C_CONV'));
      if (showFixedWa) totals.push(sumN(group, 'C_OTHERS'));
      if (showFixedGross) totals.push(sumN(group, 'C_TOT_SAL'));
      if (showEarnedDays) totals.push(sumN(group, 'C_DAYS_PRESENT'));
      if (showEarnedBasic) totals.push(sumN(group, 'C_EARNED_BASIC'));
      if (showEarnedHra) totals.push(sumN(group, 'C_EARNED_HRA'));
      if (showEarnedOthers) totals.push(sumN(group, 'C_EARNED_CONV'));
      if (showEarnedWa) totals.push(sumN(group, 'C_EARNED_OTHERS'));
      if (showEarnedAb) totals.push(sumN(group, 'C_EARNED_AB'));
      if (showEarnedOtHrs) totals.push(sumN(group, 'C_OT_HRS'));
      if (showEarnedOtAmt) totals.push(sumN(group, 'C_EARNED_OT'));
      if (showEarnedTotal) totals.push(sumN(group, 'C_EARNED_GROSS'));
      if (showEsi) totals.push(sumN(group, 'C_DED_ESI'));
      if (showPf) totals.push(sumN(group, 'C_DED_PF'));
      if (showPt) totals.push(sumN(group, 'C_DED_PT'));
      if (showTds) totals.push(sumN(group, 'C_DED_TAX'));
      if (showLic) totals.push(sumN(group, 'C_DED_LIC'));
      if (showOtherDed) totals.push(sumN(group, 'C_LATE_DED_AMT'));
      if (showSalAdv) totals.push(sumN(group, 'C_DED_ADV'));
      if (showTotalDed) totals.push(sumN(group, 'C_TOT_DED'));
      if (showNetAmount) totals.push(sumN(group, 'C_NET_AMT'));
      rows.push(totals);
    });
    const gt = ['', '', 'Grand Total'];
    if (showFixedBasic) gt.push(sumN(salaryData, 'C_BASIC'));
    if (showFixedHra) gt.push(sumN(salaryData, 'C_HRA'));
    if (showFixedCa) gt.push(sumN(salaryData, 'C_CONV'));
    if (showFixedWa) gt.push(sumN(salaryData, 'C_OTHERS'));
    if (showFixedGross) gt.push(sumN(salaryData, 'C_TOT_SAL'));
    if (showEarnedDays) gt.push(sumN(salaryData, 'C_DAYS_PRESENT'));
    if (showEarnedBasic) gt.push(sumN(salaryData, 'C_EARNED_BASIC'));
    if (showEarnedHra) gt.push(sumN(salaryData, 'C_EARNED_HRA'));
    if (showEarnedOthers) gt.push(sumN(salaryData, 'C_EARNED_CONV'));
    if (showEarnedWa) gt.push(sumN(salaryData, 'C_EARNED_OTHERS'));
    if (showEarnedAb) gt.push(sumN(salaryData, 'C_EARNED_AB'));
    if (showEarnedOtHrs) gt.push(sumN(salaryData, 'C_OT_HRS'));
    if (showEarnedOtAmt) gt.push(sumN(salaryData, 'C_EARNED_OT'));
    if (showEarnedTotal) gt.push(sumN(salaryData, 'C_EARNED_GROSS'));
    if (showEsi) gt.push(sumN(salaryData, 'C_DED_ESI'));
    if (showPf) gt.push(sumN(salaryData, 'C_DED_PF'));
    if (showPt) gt.push(sumN(salaryData, 'C_DED_PT'));
    if (showTds) gt.push(sumN(salaryData, 'C_DED_TAX'));
    if (showLic) gt.push(sumN(salaryData, 'C_DED_LIC'));
    if (showOtherDed) gt.push(sumN(salaryData, 'C_LATE_DED_AMT'));
    if (showSalAdv) gt.push(sumN(salaryData, 'C_DED_ADV'));
    if (showTotalDed) gt.push(sumN(salaryData, 'C_TOT_DED'));
    if (showNetAmount) gt.push(sumN(salaryData, 'C_NET_AMT'));
    rows.push(gt);
    return rows;
  };

  const exportToExcel = () => {
    let data, name;
    if (activeTab === 0) { data = buildBasicDataExcel(); name = 'Basic_Salary'; }
    else if (activeTab === 1) { data = buildAttendanceDataExcel(); name = 'Attendance_Details'; }
    else { data = buildProcessedDataExcel(); name = 'Processed_Salary'; }
    const ws = XLSX.utils.aoa_to_sheet(data);
    ws['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: data[1]?.length - 1 || 0 } }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, name);
    const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    saveAs(new Blob([buf], { type: 'application/octet-stream' }), `Salary_${name}_${month}_${year}.xlsx`);
    showToast('✅ Excel exported successfully', 'success');
  };

  const exportToPDF = () => {
    const el = tableRefs.current[activeTab];
    if (!el) return;
    const parent = el.closest('[data-salary-scroll]') || el;
    const origOverflow = parent.style.overflow;
    const origMaxHeight = parent.style.maxHeight;
    parent.style.overflow = 'visible';
    parent.style.maxHeight = 'none';
    requestAnimationFrame(() => {
      html2canvas(parent, { scale: 2, useCORS: true, logging: false, width: parent.scrollWidth, height: parent.scrollHeight }).then((canvas) => {
        parent.style.overflow = origOverflow;
        parent.style.maxHeight = origMaxHeight;
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('l', 'mm', 'a3');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        const names = ['Basic_Salary', 'Attendance_Details', 'Processed_Salary'];
        pdf.save(`Salary_${names[activeTab]}_${month}_${year}.pdf`);
        showToast('✅ PDF exported successfully', 'success');
      });
    });
  };

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Monthly Payslip Processing
        {finalized && (
          <Typography component="span" variant="body2" sx={{ ml: 2, color: '#c62828', fontWeight: 'bold', verticalAlign: 'middle' }}>
            <LockIcon sx={{ fontSize: 18, verticalAlign: 'middle', mr: 0.5 }} />
            FINALIZED
          </Typography>
        )}
      </Typography>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={3}>
          <FormControl fullWidth size="small">
            <InputLabel>Year</InputLabel>
            <Select value={year} onChange={(e) => {
              const newYear = e.target.value;
              if (newYear > currentYear) return;
              setYear(newYear);
              if (newYear === currentYear && month >= currentMonth) {
                setMonth(Math.max(1, currentMonth - 1));
              }
            }} label="Year">
              {[2023, 2024, 2025, 2026].filter(y => y <= currentYear).map(y => (
                <MenuItem key={y} value={y}>{y}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={3}>
          <FormControl fullWidth size="small">
            <InputLabel>Month</InputLabel>
            <Select value={month} onChange={(e) => setMonth(e.target.value)} label="Month">
              {months.filter(m => {
                if (year < currentYear) return true;
                if (year > currentYear) return false;
                return m.value < currentMonth;
              }).map(m => (
                <MenuItem key={m.value} value={m.value}>{m.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={3}>
          <Button
            variant="contained"
            startIcon={processing ? <CircularProgress size={20} color="inherit" /> : <PlayArrowIcon />}
            onClick={processSalary}
            disabled={processing || !canProcess}
          >
            {processing ? "Processing..." : "Process Payslip"}
          </Button>
        </Grid>
        <Grid item xs={3}>
          <Button
            variant="contained"
            color="error"
            startIcon={finalizing ? <CircularProgress size={20} color="inherit" /> : finalized ? <LockIcon /> : <LockOpenIcon />}
            onClick={finalizeSalary}
            disabled={finalizing || !canProcess || salaryData.length === 0 || finalized}
          >
            {finalizing ? "Finalizing..." : finalized ? "Finalized" : "Finalize Salary"}
          </Button>
        </Grid>
        <Grid item xs={3}>
          <Button
            variant="outlined"
            color="warning"
            startIcon={generating ? <CircularProgress size={20} color="inherit" /> : <BuildIcon />}
            onClick={generateMarch2026Data}
            disabled={generating || !canProcess}
          >
            {generating ? "Generating..." : `Generate ${months[month - 1].label} ${year} Data`}
          </Button>
        </Grid>
        <Grid item xs={2}>
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={refreshData}>Refresh</Button>
        </Grid>
        <Grid item xs={2}>
          <Button variant="outlined" color="secondary" startIcon={<ClearIcon />} onClick={clearFilters}>Clear</Button>
        </Grid>
        <Grid item xs={2}>
          <Button variant="contained" color="success" startIcon={<FileDownloadIcon />} onClick={exportToExcel} disabled={salaryData.length === 0}>Export Excel</Button>
        </Grid>
        <Grid item xs={2}>
          <Button variant="contained" color="error" startIcon={<PictureAsPdfIcon />} onClick={exportToPDF} disabled={salaryData.length === 0}>Export PDF</Button>
        </Grid>
      </Grid>

      {salaryData.length === 0 && loaded && (
        <Alert severity="info">No payslip data found for {months[month - 1].label} {year}. Click "Process Payslip" to generate.</Alert>
      )}

      {salaryData.length > 0 && (
        <>
          <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} sx={{ mb: 1, borderBottom: 1, borderColor: 'divider' }}>
            <Tab label="1. Basic Data" />
            <Tab label="2. Attendance Details" />
            <Tab label="3. Processed Salary" />
          </Tabs>

          <Box ref={(el) => { if (el) tableRefs.current[0] = el; }} data-salary-scroll>
            {activeTab === 0 && renderBasicData()}
          </Box>
          <Box ref={(el) => { if (el) tableRefs.current[1] = el; }} data-salary-scroll>
            {activeTab === 1 && renderAttendanceData()}
          </Box>
          <Box ref={(el) => { if (el) tableRefs.current[2] = el; }} data-salary-scroll>
            {activeTab === 2 && renderProcessedData()}
          </Box>
        </>
      )}
    </Box>
  );
};

export default SalaryProcessing;
