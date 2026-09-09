import React, { useState, useEffect, useMemo, useRef } from "react";
import { Box, Typography, Paper, Table, TableHead, TableRow, TableCell, TableBody, Chip, CircularProgress, TextField, Button, Dialog, DialogTitle, DialogContent, IconButton, Grid, Tooltip, Select, MenuItem, InputAdornment, Divider, Stack } from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { FaCalendarCheck, FaUmbrellaBeach, FaMoneyBill, FaClock, FaDownload, FaEye, FaClipboardList, FaBriefcase, FaPlane, FaExchangeAlt, FaCalendarWeek, FaHandHoldingUsd, FaNotesMedical, FaUserEdit, FaCalendarAlt, FaChartBar, FaArrowLeft, FaSearch, FaFileCsv, FaFilePdf, FaFileExcel, FaChevronRight, FaRegCalendar, FaRegClock, FaCheckCircle, FaHourglassHalf, FaTimesCircle } from "react-icons/fa";
import CloseIcon from "@mui/icons-material/Close";
import RefreshIcon from "@mui/icons-material/Refresh";
import logo from "../../../assets/images/EQIC_Image.jpg";
import { useCompany } from "../../../context/CompanyContext";
import "../payroll/PayslipPreview.css";
import PrintIcon from "@mui/icons-material/Print";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import LeavePreview from "../LeaveApplication/LeavePreview";
import OnDutyPreview from "../onduty/OnDutyPreview";
import TourPreview from "../tour/TourPreview";
import ShiftChangePreview from "../shiftchange/ShiftChangePreview";
import WoffChangePreview from "../woffchange/WoffChangePreview";
import AdvancePreview from "../advance/AdvancePreview";
import ESILeavePreview from "../esileave/ESILeavePreview";
import PayslipView from "../payroll/PayslipView";

const API = import.meta.env.VITE_API_URL || "";
const MONTHS = [
  { value: 1, label: "January" }, { value: 2, label: "February" }, { value: 3, label: "March" }, { value: 4, label: "April" },
  { value: 5, label: "May" }, { value: 6, label: "June" }, { value: 7, label: "July" }, { value: 8, label: "August" },
  { value: 9, label: "September" }, { value: 10, label: "October" }, { value: 11, label: "November" }, { value: 12, label: "December" },
];

const APP_REPORTS = [
  { id: "leave", label: "Leave", desc: "Applications", icon: FaUmbrellaBeach },
  { id: "onduty", label: "On-Duty", desc: "Site & client movements", icon: FaBriefcase },
  { id: "tour", label: "Tour", desc: "Business travel & tour", icon: FaPlane },
  { id: "shift", label: "Shift Change", desc: "Shift swap requests", icon: FaExchangeAlt },
  { id: "woff", label: "Weekly Off", desc: "W-Off reschedule", icon: FaCalendarWeek },
  { id: "advance", label: "Advance", desc: "Salary advances", icon: FaHandHoldingUsd },
  { id: "esileave", label: "ESI Leave", desc: "Medical & ESI leaves", icon: FaNotesMedical },
  { id: "att-req", label: "Attendance Request", desc: "Missed punch / correction", icon: FaClock },
  { id: "profile", label: "Profile Update", desc: "Address & contact changes", icon: FaUserEdit },
];

const MONTHLY_REPORTS = [
  { id: "attendance-log", label: "Attendance Log", desc: "Punch in/out log", icon: FaClock },
  { id: "movement", label: "Movement Report", desc: "In/Out movements", icon: FaExchangeAlt },
  { id: "musterroll", label: "Muster Roll", desc: "", icon: FaCalendarCheck },
  { id: "ot-register", label: "OT Register", desc: "", icon: FaClock },
  { id: "onduty-movement", label: "OnDuty Movement", desc: "", icon: FaBriefcase },
  { id: "leaves", label: "Leaves History", desc: "Monthly leave history", icon: FaRegCalendar },
  { id: "leaves-info", label: "Leaves Information", desc: "Leave balances & info", icon: FaUmbrellaBeach },
  { id: "holidays", label: "Holidays List", desc: "Holiday calendar", icon: FaCalendarAlt },
  { id: "increment", label: "Increment Details", desc: "Salary increments", icon: FaChartBar },
  { id: "encashment", label: "Leave Encashment", desc: "Encashment details", icon: FaMoneyBill },
  { id: "att-percentage", label: "Attendance %", desc: "Attendance percentage", icon: FaChartBar },
  { id: "payslips", label: "Payslips", desc: "Salary & deductions", icon: FaMoneyBill },
];

const ALL_IDS = [...APP_REPORTS, ...MONTHLY_REPORTS].map(r => r.id);
const LEGACY_MAP = { attendance: "attendance-log", leaves: "leaves", payslips: "payslips", ot: "att-req" };

export default function EmployeeReports() {
  const theme = useTheme();
  const { companyName, companySettings } = useCompany();
  const location = useLocation();
  const navigate = useNavigate();
  const empid = localStorage.getItem("empId");
  const empName = localStorage.getItem("empName") || "Employee";
  const [selected, setSelected] = useState(() => {
    const q = new URLSearchParams(location.search).get("tab");
    if (q && ALL_IDS.includes(q)) return q;
    if (q && LEGACY_MAP[q]) return LEGACY_MAP[q];
    return null;
  });
  const [month, setMonth] = useState(() => { const v = localStorage.getItem("er_month"); return v ? parseInt(v) : new Date().getMonth() + 1; });
  const [year, setYear] = useState(() => { const v = localStorage.getItem("er_year"); return v ? parseInt(v) : new Date().getFullYear(); });
  const [otView, setOtView] = useState("both");
  const topBarRef = useRef(null); const tableBoxRef = useRef(null);
  useEffect(() => { localStorage.setItem("er_month", String(month)); }, [month]);
  useEffect(() => { localStorage.setItem("er_year", String(year)); }, [year]);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [viewOpen, setViewOpen] = useState(false);
  const [viewData, setViewData] = useState(null);
  const [leavePreviewOpen, setLeavePreviewOpen] = useState(false);
  const [leavePreviewLno, setLeavePreviewLno] = useState(null);
  const [leaveBal, setLeaveBal] = useState(null);
  useEffect(() => { if (!empid) return; const cfg = { withCredentials: true }; axios.get(`${API}/api/leave/balance/${empid}`, cfg).then(r => setLeaveBal(r.data?.balance || r.data)).catch(() => setLeaveBal(null)); }, [empid]);
  const [appPreviewOpen, setAppPreviewOpen] = useState(false);
  const [appPreviewType, setAppPreviewType] = useState(null);
  const [appPreviewData, setAppPreviewData] = useState(null);
  const [store, setStore] = useState({});
  const [loadingStore, setLoadingStore] = useState(true);
  const [appId, setAppId] = useState("");
  const [startDate, setStartDate] = useState(() => localStorage.getItem(`attPerc_start_${empid}`) || "");
  const [endDate, setEndDate] = useState(() => localStorage.getItem(`attPerc_end_${empid}`) || "");
  const [reportType, setReportType] = useState("PDF");
  const [appReportSel, setAppReportSel] = useState("");
  const [empReportSel, setEmpReportSel] = useState("");

  useEffect(() => {
    if (empid) {
      const s = localStorage.getItem(`attPerc_start_${empid}`);
      const e = localStorage.getItem(`attPerc_end_${empid}`);
      if (s) setStartDate(s);
      if (e) setEndDate(e);
    }
  }, [empid]);
  useEffect(() => { if (empid) { if (startDate) localStorage.setItem(`attPerc_start_${empid}`, startDate); else localStorage.removeItem(`attPerc_start_${empid}`); } }, [startDate, empid]);
  useEffect(() => { if (empid) { if (endDate) localStorage.setItem(`attPerc_end_${empid}`, endDate); else localStorage.removeItem(`attPerc_end_${empid}`); } }, [endDate, empid]);
  useEffect(() => {
    const p = new URLSearchParams(location.search).get("tab");
    if (p && ALL_IDS.includes(p)) setSelected(p);
    else if (p && LEGACY_MAP[p]) setSelected(LEGACY_MAP[p]);
  }, [location.search]);

  useEffect(() => {
    if (!selected) return;
    if (APP_REPORTS.some(r => r.id === selected)) { setAppReportSel(selected); setEmpReportSel(""); }
    else if (MONTHLY_REPORTS.some(r => r.id === selected) || selected === "profile") { setEmpReportSel(selected); setAppReportSel(""); }
  }, [selected]);

  const onlyMine = (arr) => {
    if (!Array.isArray(arr)) return [];
    const mine = String(empid);
    return arr.filter(r => {
      const eid = r.empid ?? r.emp_id ?? r.C_EMPID ?? r.C_empid ?? r.empno ?? r.employee_id ?? r.C_GEMPID ?? r.user_empid;
      if (eid == null || eid === "") return true;
      return String(eid) === mine;
    });
  };
  const getStatus = (r) => String(r.status || r.request_status || r.approval_status || r.app_status || r.C_FINAL_STATUS || "").toLowerCase();
  const statusOf = (s) => {
    const v = String(s || "").toLowerCase();
    if (["approved", "final", "2", "generated"].includes(v)) return "approved";
    if (["pending", "1", "0"].includes(v)) return "pending";
    if (["rejected", "cancelled", "reopen", "3"].includes(v)) return "rejected";
    if (["present", "absent", "leave", "holiday", "woff", "tour", "od"].includes(v)) return "other";
    return "other";
  };

  useEffect(() => {
    if (!empid) return;
    setLoadingStore(true);
    const cfg = { withCredentials: true, params: { empid } };
    const calls = {
      leave: axios.get(`${API}/api/leave/report`, { params: { empid }, withCredentials: true }).catch(() => ({ data: [] })),
      onduty: axios.get(`${API}/api/onduty/all`, cfg).catch(() => ({ data: [] })),
      tour: axios.get(`${API}/api/tour/all`, cfg).catch(() => ({ data: [] })),
      shift: axios.get(`${API}/api/shift/all`, cfg).catch(() => ({ data: [] })),
      woff: axios.get(`${API}/api/woff/all`, cfg).catch(() => ({ data: [] })),
      advance: axios.get(`${API}/api/advance/all`, cfg).catch(() => ({ data: [] })),
      esileave: axios.get(`${API}/api/esileave/all`, cfg).catch(() => ({ data: [] })),
      "att-req": axios.get(`${API}/api/attendance-requests/my`, cfg).catch(() => ({ data: [] })),
      profile: axios.get(`${API}/api/employees/my-profile-requests`, cfg).catch(() => ({ data: [] })),
      attendance: axios.get(`${API}/api/attendance`, { params: { empid, month, year }, withCredentials: true }).catch(() => ({ data: [] })),
      payslips: axios.get(`${API}/api/payroll/my-payslips`, cfg).catch(() => ({ data: [] })),
      leaves: axios.get(`${API}/api/leave/report`, { params: { empid, startDate: `${year}-${String(month).padStart(2, "0")}-01`, endDate: `${year}-${String(month).padStart(2, "0")}-31` }, withCredentials: true }).catch(() => ({ data: [] })),
      ot: axios.get(`${API}/api/attendance-requests/my`, cfg).catch(() => ({ data: [] })),
      "attendance-log": axios.get(`${API}/api/attendance`, { params: { empid, month, year }, withCredentials: true }).catch(() => ({ data: [] })),
      movement: axios.get(`${API}/api/attendance`, { params: { empid, month, year }, withCredentials: true }).catch(() => ({ data: [] })),
      musterroll: axios.get(`${API}/api/attendance`, { params: { empid, month, year }, withCredentials: true }).catch(() => ({ data: [] })),
      "ot-register": axios.get(`${API}/api/attendance`, { params: { empid, month, year }, withCredentials: true }).catch(() => ({ data: [] })),
      "onduty-movement": axios.get(`${API}/api/onduty/all`, cfg).catch(() => ({ data: [] })),
      "leaves-info": axios.get(`${API}/api/leave/balance/${empid}`, cfg).then(r => ({ data: r.data?.balance ? [r.data.balance] : r.data && !Array.isArray(r.data) && r.data.empid ? [r.data] : Array.isArray(r.data) ? r.data : [] })).catch(() => ({ data: [] })),
      holidays: axios.get(`${API}/api/holidays`, { withCredentials: true }).catch(async () => await axios.get(`${API}/api/holidays/list`, { withCredentials: true }).catch(() => ({ data: [] }))),
      increment: axios.get(`${API}/api/payroll/my-payslips`, cfg).catch(() => ({ data: [] })),
      encashment: axios.get(`${API}/api/leave/balance/${empid}`, cfg).then(r => ({ data: r.data?.balance ? [r.data.balance] : r.data && !Array.isArray(r.data) && r.data.empid ? [r.data] : Array.isArray(r.data) ? r.data : [] })).catch(() => ({ data: [] })),
      "att-percentage": axios.get(`${API}/api/attendance`, { params: { empid, month, year }, withCredentials: true }).catch(() => ({ data: [] })),
    };
    Promise.all(Object.entries(calls).map(([k, p]) => p.then(r => [k, r]))).then(entries => {
      const next = {};
      entries.forEach(([k, res]) => {
        const arr = Array.isArray(res.data) ? res.data : (res.data?.records || res.data?.data || res.data?.payslips || []);
        next[k] = onlyMine(arr);
      });
      setStore(next);
      setLoadingStore(false);
    });
  }, [empid, month, year]);

  const selectReport = (id) => { setSelected(id); setSearch(""); if (APP_REPORTS.some(r => r.id === id)) { setAppReportSel(id); setEmpReportSel(""); } else { setEmpReportSel(id); setAppReportSel(""); } navigate(`/my-reports?tab=${id}`, { replace: true }); };

  const parseDDMONRR = (s) => {
    if (!s) return null;
    const m = { JAN: "01", FEB: "02", MAR: "03", APR: "04", MAY: "05", JUN: "06", JUL: "07", AUG: "08", SEP: "09", OCT: "10", NOV: "11", DEC: "12" };
    const p = String(s).trim().toUpperCase().split("-");
    if (p.length !== 3) return null;
    const dd = p[0].padStart(2, "0"); const mm = m[p[1]]; if (!mm) return null;
    let yy = p[2]; if (yy.length === 2) yy = (parseInt(yy) > 50 ? "19" : "20") + yy;
    return new Date(`${yy}-${mm}-${dd}`);
  };

  const fetchData = async () => {
    if (!empid || !selected) return;
    setLoading(true);
    try {
      const cfg = { withCredentials: true, params: { empid } };
      let raw = [];
      if (selected === "attendance") {
        const r = await axios.get(`${API}/api/attendance`, { params: { empid, month, year }, withCredentials: true });
        raw = r.data.records || r.data || [];
      } else if (selected === "leaves") {
        const r = await axios.get(`${API}/api/leave/report`, { params: { empid, startDate: `${year}-${String(month).padStart(2, "0")}-01`, endDate: `${year}-${String(month).padStart(2, "0")}-31` }, withCredentials: true }).catch(async () => await axios.get(`${API}/api/leave/my`, cfg).catch(async () => await axios.get(`${API}/api/leave`, cfg)));
        raw = Array.isArray(r.data) ? r.data : r.data.records || r.data.data || [];
      } else if (selected === "leave") {
        const r = await axios.get(`${API}/api/leave/report`, { params: { empid }, withCredentials: true }).catch(async () => await axios.get(`${API}/api/leave/all-leaves`, cfg));
        raw = Array.isArray(r.data) ? r.data : r.data.data || r.data.records || [];
      } else if (selected === "payslips") {
        const r = await axios.get(`${API}/api/payroll/my-payslips`, { params: empid ? { empid } : {}, withCredentials: true });
        raw = Array.isArray(r.data) ? r.data : r.data.payslips || r.data.records || [];
      } else if (selected === "ot" || selected === "att-req") {
        const r = await axios.get(`${API}/api/attendance-requests/my`, cfg);
        raw = r.data || [];
      } else if (selected === "onduty") { const r = await axios.get(`${API}/api/onduty/all`, cfg); raw = r.data || []; }
      else if (selected === "tour") { const r = await axios.get(`${API}/api/tour/all`, cfg); raw = Array.isArray(r.data) ? r.data : r.data.data || []; }
      else if (selected === "shift") { const r = await axios.get(`${API}/api/shift/all`, cfg); raw = r.data || []; }
      else if (selected === "woff") { const r = await axios.get(`${API}/api/woff/all`, cfg); raw = r.data || []; }
      else if (selected === "advance") { const r = await axios.get(`${API}/api/advance/all`, cfg); raw = r.data || []; }
      else if (selected === "esileave") { const r = await axios.get(`${API}/api/esileave/all`, cfg); raw = r.data || []; }
      else if (selected === "profile") { const r = await axios.get(`${API}/api/employees/my-profile-requests`, cfg); raw = r.data || []; }
      else if (["attendance-log", "movement", "musterroll", "ot-register"].includes(selected)) { const r = await axios.get(`${API}/api/attendance`, { params: { empid, month, year }, withCredentials: true }); raw = r.data.records || r.data || []; }
      else if (selected === "att-percentage") {
        let sd = parseDDMONRR(startDate); if (!sd && startDate) { const p = startDate.split("-"); if (p.length===3) { const d = p[0].length===4 ? new Date(startDate) : new Date(`${p[2]}-${p[1]}-${p[0]}`); if(d && !isNaN(d)) sd=d; } }
        let ed = parseDDMONRR(endDate); if (!ed && endDate) { const p = endDate.split("-"); if (p.length===3) { let d=null; if(p[0].length===4) d=new Date(endDate); else d=new Date(`${p[2]}-${p[1]}-${p[0]}`); if(d && !isNaN(d)) { ed=d; ed.setHours(23,59,59,999); } } }
        if (sd && ed) {
          const fmt = d => d.toISOString().slice(0, 10);
          const r = await axios.get(`${API}/api/attendance`, { params: { empid, startDate: fmt(sd), endDate: fmt(ed) }, withCredentials: true }).catch(async () => await axios.get(`${API}/api/attendance`, { params: { empid, month, year }, withCredentials: true }));
          raw = r.data.records || r.data || [];
        } else {
          const r = await axios.get(`${API}/api/attendance`, { params: { empid, month, year }, withCredentials: true }); raw = r.data.records || r.data || [];
        }
      }
      else if (selected === "onduty-movement") { const r = await axios.get(`${API}/api/onduty/all`, cfg); raw = r.data || []; }
      else if (selected === "leaves-info" || selected === "encashment") { const r = await axios.get(`${API}/api/leave/balance/${empid}`, cfg).catch(async () => await axios.get(`${API}/api/leave/report`, { params: { empid }, withCredentials: true })); const d = r.data?.balance || r.data; raw = Array.isArray(d) ? d : d && d.empid ? [d] : d?.data || d?.records || []; }
      else if (selected === "holidays") { const r = await axios.get(`${API}/api/holidays`, { withCredentials: true }).catch(() => ({ data: [] })); raw = Array.isArray(r.data) ? r.data : r.data.data || []; }
      else if (selected === "increment") { const r = await axios.get(`${API}/api/payroll/my-payslips`, cfg); raw = Array.isArray(r.data) ? r.data : r.data.payslips || []; }
      setData(onlyMine(Array.isArray(raw) ? raw : []));
    } catch { setData([]); }
    setLoading(false);
  };
  useEffect(() => { if (selected) fetchData(); }, [selected, month, year]);

  const filtered = useMemo(() => {
    let out = data;
    if (appId) {
      const q = appId.trim().toLowerCase();
      out = out.filter((o, idx) => {
        let vals = [];
        if (selected === "leave" || selected === "leaves") vals = [o.id, o.lno];
        else if (selected === "onduty") vals = [o.movement_id, o.id];
        else if (selected === "tour") vals = [o.tour_id, o.id];
        else if (selected === "shift") vals = [o.schange_no, o.id];
        else if (selected === "woff") vals = [o.woff_id, o.id];
        else if (selected === "advance") vals = [o.advance_id, o.id];
        else if (selected === "esileave") vals = [o.esi_id, o.id];
        else if (selected === "att-req" || selected === "ot") vals = [o.id, o.request_id];
        else if (selected === "profile") vals = [String(idx + 1), `pr-${String(idx + 1).padStart(4, "0")}`, o.id];
        else vals = [o.movement_id, o.tour_id, o.schange_no, o.woff_id, o.advance_id, o.esi_id, o.id, o.lno];
        return vals.map(v => String(v ?? "").trim().toLowerCase()).includes(q);
      });
    }
    const sd = parseDDMONRR(startDate); const ed = parseDDMONRR(endDate);
    if (sd || ed) {
      out = out.filter(o => {
        const d = new Date(o.movement_date || o.tour_from_date || o.from_date || o.att_date || o.created || o.created_at || o.ldate || o.advance_date || o.schange_date || 0);
        if (isNaN(d)) return true;
        if (sd && d < sd) return false;
        if (ed && d > ed) return false;
        return true;
      });
    }
    if (!search) return out;
    const q = search.toLowerCase();
    return out.filter(o => Object.values(o).some(v => String(v ?? "").toLowerCase().includes(q)));
  }, [data, search, appId, startDate, endDate, selected]);

  const exportCsv = () => {
    if (!filtered.length) return;
    const headers = Object.keys(filtered[0]);
    if (reportType === "PDF") {
      const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
      doc.text(companyName || "Company", 420, 30, { align: "center" });
      doc.text(`${selectedMeta?.label || selected} — ${MONTHS[month - 1]?.label || ""} ${year}`, 420, 45, { align: "center" });
      const body = filtered.map(r => headers.map(h => r[h] ?? ""));
      autoTable(doc, { startY: 60, head: [headers], body, styles: { fontSize: 6, cellPadding: 2 }, headStyles: { fillColor: [25, 118, 210] }, theme: "grid" });
      doc.save(`${selected}_${year}_${month}.pdf`);
      return;
    }
    if (reportType === "Excel") {
      const ws = XLSX.utils.json_to_sheet(filtered);
      const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, selected);
      XLSX.writeFile(wb, `${selected}_${year}_${month}.xlsx`);
      return;
    }
    const csv = [headers.join(","), ...filtered.map(r => headers.map(h => { const v = r[h]; if (v == null) return ""; const s = String(v); return s.includes(",") || s.includes('"') ? `"${s.replace(/"/g, '""')}"` : s; }).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `${selected}_${year}_${month}.csv`; a.click();
  };

  const formatCurrency = (v) => { const n = Number(v); return isNaN(n) ? "0" : n.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 2 }); };
  const MONTHS3 = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const pad2 = (n) => String(n).padStart(2, "0");
  const daySuffix = (n) => { const v = n % 100; if (v >= 11 && v <= 13) return "th"; switch (n % 10) { case 1: return "st"; case 2: return "nd"; case 3: return "rd"; default: return "th"; } };
  const fmtDate = (d) => { if (!d) return "—"; const dt = new Date(d); if (!isNaN(dt) && dt.getFullYear() > 2000) return `${pad2(dt.getDate())}-${pad2(dt.getMonth() + 1)}-${dt.getFullYear()}`; const s = String(d).slice(0, 10); const p = s.split("-"); if (p.length === 3) return `${pad2(p[2])}-${pad2(p[1])}-${p[0]}`; return s; };
  const fmtDateTime = (d) => { if (!d) return "—"; const dt = new Date(d); if (isNaN(dt) || dt.getFullYear() < 2000) return fmtDate(d); return `${pad2(dt.getDate())}-${pad2(dt.getMonth() + 1)}-${dt.getFullYear()} ${pad2(dt.getHours())}.${pad2(dt.getMinutes())}`; };
  const formatDOJ = (d) => { if (!d) return ''; try { let s = d instanceof Date ? d.toISOString().split('T')[0] : String(d).split('T')[0]; const p = s.split('-'); if (p.length === 3 && parseInt(p[0], 10) >= 2000) { const mi = parseInt(p[1], 10) - 1; if (mi >= 0 && mi < 12) return `${parseInt(p[2], 10)}-${MONTHS3[mi]}-${p[0].slice(2)}`; } } catch (e) { } const dt = new Date(d); if (isNaN(dt) || dt.getFullYear() < 2000) return ''; return `${dt.getDate()}-${MONTHS3[dt.getMonth()]}-${String(dt.getFullYear()).slice(2)}`; };
  const printApplications = () => {
    const rows = filtered.map((r, i) => {
      const dt = r.from || r.from_date || r.ldate || r.movement_date || r.att_date || r.created || "";
      const id = r.id || r.lno || r.movement_id || r.tour_id || "—";
      const purpose = r.purpose || r.pofl || r.reason || "";
      const reason = r.remarks || r.address || r.leaveDetails?.[0]?.remarks || r.purpose || "—";
      const st = r.status || r.request_status || "Pending";
      return `<tr><td style="border:1px solid #aaa;padding:6px;text-align:center">${i + 1}</td><td style="border:1px solid #aaa;padding:6px">${fmtDate(dt)}</td><td style="border:1px solid #aaa;padding:6px">${id}</td><td style="border:1px solid #aaa;padding:6px">${purpose || reason}</td><td style="border:1px solid #aaa;padding:6px">${st}</td><td style="border:1px solid #aaa;padding:6px">${String(reason).slice(0, 80)}</td></tr>`;
    }).join("");
    const html = `<html><head><title>Applications - ${MONTHS[month - 1].label} ${year}</title><style>body{font-family:Arial,sans-serif;font-size:11px;vertical-align:middle;padding:16px} table{width:100%;border-collapse:collapse} th{background:#f1f3f4;padding:6px;border:1px solid #aaa;font-size:11px;vertical-align:middle} td{font-size:11px;vertical-align:middle}</style></head><body><div style="text-align:center;margin-bottom:12px"><h3 style="margin:0">${companyName || "Company"}</h3><div style="font-size:11px;vertical-align:middle;color:#5f6368">Application Report — ${selectedMeta?.label || ""} — ${MONTHS[month - 1].label} ${year} — Emp ${empid} ${empName}</div></div><table><thead><tr><th>#</th><th>Date</th><th>App No</th><th>Purpose</th><th>Status</th><th>Reason / Remarks</th></tr></thead><tbody>${rows || '<tr><td colspan=6 style="text-align:center;padding:12px">No records</td></tr>'}</tbody></table><div style="margin-top:16px;font-size:10px;color:#5f6368">Generated on ${new Date().toLocaleString()} — Employee Self Service</div><script>window.print()</script></body></html>`;
    const w = window.open("", "_blank"); w.document.write(html); w.document.close();
  };
  const exportLeaveHistory = () => {
    const fromStr = startDate || `01-${MONTHS[month - 1].label.slice(0, 3).toUpperCase()}-${String(year).slice(2)}`;
    const toStr = endDate || `05-${MONTHS[month - 1].label.slice(0, 3).toUpperCase()}-${String(year).slice(2)}`;
    const reportTitle = `Leaves History:${empid}:${empName}  From : ${fromStr} To : ${toStr}`;
    const rows = [];
    let appSno = 1;
    filtered.forEach((r, appIdx) => {
      const base = { empId: r.empid || empid, empName: r.ename || r.empName || empName, lappNo: r.id || r.lno, lappDate: fmtDateTime(r.ldate || r.entry || r.created) };
      const details = r.leaveDetails?.length ? r.leaveDetails : [{ frmdt: r.from || r.from_date, nod: r.nod || 1, ltype: r.ltype || "", daydt: "" }];
      details.forEach((d, di) => {
        const isFirst = di === 0;
        const isTop = isFirst && appIdx === 0;
        const dayType = (() => { const v = String(d.daydt || "").trim().toLowerCase(); if (!v) return "Full Day"; if (v.includes("half") || v === "h" || v === "0.5") return "Half Day"; if (v.includes("full") || v === "f" || v === "1") return "Full Day"; return d.daydt; })();
        const leaveDate = (() => { if (d.nod > 1 && d.frmdt) { const to = new Date(d.frmdt); if (!isNaN(to)) { to.setDate(to.getDate() + Number(d.nod) - 1); return `${fmtDate(d.frmdt)} to ${fmtDate(to)}`; } } return fmtDate(d.frmdt); })();
        let sCls = 0, sEls = 0, sLop = 0; const isApp = String(d.c_hr_app_status || r.status || "").trim().toUpperCase() === "APPROVED"; if (isApp) { if (d.c_cl_sanction != null || d.c_el_sanction != null) { sCls = Number(d.c_cl_sanction ?? 0); sEls = Number(d.c_el_sanction ?? 0); sLop = Number((Number(d.nod || 0) - sCls - sEls).toFixed(2)); if (sLop < 0) sLop = 0; } else { const t = String(d.ltype || "").trim().toUpperCase(); if (t.includes("CL")) sCls = Number(d.nod || 0); else if (t.includes("EL") || t.includes("SL")) sEls = Number(d.nod || 0); else if (t.includes("LOP")) sLop = Number(d.nod || 0); } }
        rows.push([
          isFirst ? appSno : "",
          isFirst && appIdx === 0 ? base.empId : "",
          isFirst && appIdx === 0 ? base.empName : "",
          isFirst ? base.lappNo : "",
          isFirst ? base.lappDate : "",
          isFirst ? (r.address || r.remarks || r.reason || "—") : "",
          isFirst ? (r.purpose || r.pofl || "—") : "",
          leaveDate,
          dayType,
          Number(d.nod || 1).toString(),
          sCls ? Number(sCls).toString() : 0,
          sEls ? Number(sEls).toString() : 0,
          sLop ? Number(sLop).toString() : 0,
          isTop ? Number(leaveBal?.cls_balance ?? 2).toString() : "",
          isTop ? Number(leaveBal?.els_balance ?? 0).toString() : "",
          isTop ? Number(Number(leaveBal?.cls_balance ?? 2) + Number(leaveBal?.els_balance ?? 0)).toString() : ""
        ]);
      });
      appSno++;
    });
    const totDays = rows.reduce((s, r) => s + (Number(r[9]) || 0), 0);
    const totCls = rows.reduce((s, r) => s + (Number(r[10]) || 0), 0);
    const totEls = rows.reduce((s, r) => s + (Number(r[11]) || 0), 0);
    const totLop = rows.reduce((s, r) => s + (Number(r[12]) || 0), 0);
    const balCls = leaveBal?.cls_balance ?? "2", balEls = leaveBal?.els_balance ?? "0", balTot = leaveBal ? Number(Number(balCls) + Number(balEls)).toString() : "2";
    rows.push(["", "", "", "", "", "", "", "Total", "", Number(totDays).toString(), Number(totCls).toString(), Number(totEls).toString(), Number(totLop).toString(), Number(balCls).toString(), Number(balEls).toString(), Number(balTot).toString()]);
    const head = ["SNo", "Emp Id", "Employee Name", "Lapp No", "Lapp Date", "Address/Reason", "Leave Purpose", "Leave Date", "Day Type", "No of Days", "CLS", "ELS", "LOP", "CLS Bal", "ELS Bal", "Total Bal"];
    if (reportType === "PDF") {
      const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
      doc.setFontSize(12); doc.text(companyName || "COMPANY NAME", 420, 30, { align: "center" });
      doc.setFontSize(9); doc.text(reportTitle, 420, 45, { align: "center" });
      doc.setFontSize(8); doc.text(`Emp Id : ${empid}  Employee Name : ${empName}`, 40, 60);
      autoTable(doc, {
        startY: 70,
        head: [head],
        body: rows.length ? rows : [["", "", "", "No records", "", "", "", "", "", "", "", "", "", "", "", ""]],
        styles: { fontSize: 6, cellPadding: 2, halign: "center", valign: "middle" },
        headStyles: { fillColor: [25, 118, 210], textColor: 255, fontSize: 6, halign: "center" },
        columnStyles: { 0: { halign: "center" }, 1: { halign: "center" }, 2: { halign: "center" }, 3: { halign: "center" }, 4: { halign: "center" }, 5: { halign: "center" }, 6: { halign: "center" }, 7: { halign: "center" }, 8: { halign: "center" }, 9: { halign: "center" }, 10: { halign: "center" }, 11: { halign: "center" }, 12: { halign: "center" }, 13: { halign: "center" }, 14: { halign: "center" }, 15: { halign: "center" } },
        theme: "grid",
      });
      const y = doc.lastAutoTable.finalY + 12;
      doc.setFontSize(7); doc.text(`Report Dated : ${new Date().toLocaleString("en-IN", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: true })}   Page 1 of 1`, 40, y);
      doc.save(`Leaves_History_${fromStr}_to_${toStr}.pdf`);
    } else {
      const wsData = [[companyName || "COMPANY NAME"], [reportTitle], head, ...rows];
      const ws = XLSX.utils.aoa_to_sheet(wsData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Leaves History");
      XLSX.writeFile(wb, `Leaves_History_${fromStr}_to_${toStr}.xlsx`);
    }
  };
  const exportHolidays = () => {
    if (!filtered.length) return;
    const rows = filtered.map((r, i) => [i + 1, fmtDate(r.hdate || r.holiday_date || r.date), r.hdesc || r.occasion || r.name || "—", r.hday || (() => { const d = new Date(r.hdate || r.holiday_date || r.date); return isNaN(d) ? "—" : d.toLocaleDateString("en-US", { weekday: "short" }); })(), r.yr || new Date(r.hdate || r.holiday_date || r.date).getFullYear() || "—", r.hremarks || r.remarks || "—"]);
    if (reportType === "PDF") {
      const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
      doc.setFontSize(12); doc.text(companyName || "COMPANY NAME", 420, 30, { align: "center" });
      doc.setFontSize(9); doc.text(`Holidays List — Emp ${empid} ${empName}`, 420, 45, { align: "center" });
      autoTable(doc, { startY: 60, head: [["SNo", "Date", "Occasion", "Day", "Year", "Remarks"]], body: rows, styles: { fontSize: 8, cellPadding: 4 }, headStyles: { fillColor: [25, 118, 210], textColor: 255 }, theme: "grid" });
      doc.save(`Holidays_${empid}.pdf`);
    } else if (reportType === "Excel") {
      const ws = XLSX.utils.aoa_to_sheet([["SNo", "Date", "Occasion", "Day", "Year", "Remarks"], ...rows]);
      const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, "Holidays"); XLSX.writeFile(wb, `Holidays_${empid}.xlsx`);
    } else exportCsv();
  };
  const exportMusterRoll = () => {
    const dim = new Date(year, month, 0).getDate();
    const getShort = (s) => { if (!s) return ""; if (s === "Present") return "P"; if (s === "Half Day") return "F"; if (s === "Absent") return "A"; if (s === "LOP") return "L"; if (String(s).startsWith("W-Off")) return "W"; if (String(s).startsWith("Holiday")) return "H"; return String(s); };
    const byDay = {}; filtered.forEach(r => { const d = new Date(r.att_date).getDate(); if (d >= 1 && d <= dim) byDay[d] = r; });
    const statuses = Array.from({ length: dim }, (_, i) => getShort(byDay[i + 1]?.status || ""));
    const display = statuses.map((s, i) => { if (s !== "W" && s !== "H") return s; const prev = i > 0 && ["P", "F", "FC", "FE", "FL"].includes(statuses[i - 1]); const next = i < dim - 1 && ["P", "F", "FC", "FE", "FL"].includes(statuses[i + 1]); return prev || next ? s : "A"; });
    let p = 0, h = 0, w = 0, cl = 0, el = 0, lop = 0, ot = 0; display.forEach((d, i) => { const s = statuses[i]; const r = byDay[i + 1]; if (s === "P") p++; else if (s === "F") p += 0.5; if (d === "H") h++; if (d === "W") w++; else if (s === "W" && d === "A") lop++; if (s === "CL") cl++; if (s === "EL") el++; if (s === "L") lop++; const appr = r && (r.ot_status === "Approved" || r.ot_approved == 1 || r.app_status === "Approved" || r.hr_app_status === "Approved"); if (appr && r?.ot_hrs) ot += Number(r.ot_hrs); });
    const head = ["Emp ID", "Name", ...Array.from({ length: dim }, (_, i) => String(i + 1).padStart(2, "0")), "PRESENT", "H/W", "CL", "EL", "LOP", "TOTAL", "OT"];
    const row1 = [empid, empName, ...display.map(d => d || "-"), p, h + w, cl, el, lop, p + h + w + cl + el, ot.toFixed(2)];
    const row2 = ["", "OT", ...Array.from({ length: dim }, (_, i) => { const r = byDay[i + 1]; const appr = r && (r.ot_status === "Approved" || r.ot_approved == 1 || r.app_status === "Approved" || r.hr_app_status === "Approved"); return appr && r?.ot_hrs ? Number(r.ot_hrs).toFixed(2) : ""; }), "", "", "", "", "", "", ""];
    const title = `Muster Roll — ${MONTHS[month - 1].label} ${year} — ${empid} ${empName}`;
    if (reportType === "PDF") { const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" }); doc.text(companyName || "Company", 420, 30, { align: "center" }); doc.text(title, 420, 45, { align: "center" }); autoTable(doc, { startY: 60, head: [head], body: [row1, row2], styles: { fontSize: 6, cellPadding: 2 }, headStyles: { fillColor: [25, 118, 210] }, theme: "grid" }); doc.save(`MusterRoll_${year}_${month}.pdf`); } else { const ws = XLSX.utils.aoa_to_sheet([[companyName || "Company"], [title], head, row1, row2]); const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, "Muster Roll"); XLSX.writeFile(wb, `MusterRoll_${year}_${month}.xlsx`); }
  };
  const exportOtRegister = () => {
    const dim = new Date(year, month, 0).getDate();
    const byDay = {}; filtered.forEach(r => { const d = new Date(r.att_date).getDate(); if (d >= 1 && d <= dim) byDay[d] = r; });
    const isApp = (r) => r && (r.ot_status === "Approved" || r.ot_approved == 1 || r.app_status === "Approved" || r.hr_app_status === "Approved");
    let totA = 0, totP = 0; Object.values(byDay).forEach(r => { if (r?.ot_hrs) totA += Number(r.ot_hrs); if (isApp(r) && r?.ot_hrs) totP += Number(r.ot_hrs); });
    const head = ["Emp ID", "Name", "Type", ...Array.from({ length: dim }, (_, i) => String(i + 1).padStart(2, "0")), "Approved OT", "Actual OT"];
    const rowApp = [empid, empName, "Approved", ...Array.from({ length: dim }, (_, i) => { const r = byDay[i + 1]; return isApp(r) && r?.ot_hrs ? Number(r.ot_hrs).toFixed(2) : "-"; }), totP.toFixed(2), "-"];
    const rowAct = ["", "", "Actual", ...Array.from({ length: dim }, (_, i) => { const r = byDay[i + 1]; return r?.ot_hrs ? Number(r.ot_hrs).toFixed(2) : "-"; }), "-", totA.toFixed(2)];
    const title = `OT Register — ${MONTHS[month - 1].label} ${year} — ${empid} ${empName}`;
    if (reportType === "PDF") { const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" }); doc.text(companyName || "Company", 420, 30, { align: "center" }); doc.text(title, 420, 45, { align: "center" }); autoTable(doc, { startY: 60, head: [head], body: [rowApp, rowAct], styles: { fontSize: 6, cellPadding: 2 }, headStyles: { fillColor: [25, 118, 210] }, theme: "grid" }); doc.save(`OTRegister_${year}_${month}.pdf`); } else { const ws = XLSX.utils.aoa_to_sheet([[companyName || "Company"], [title], head, rowApp, rowAct]); const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, "OT Register"); XLSX.writeFile(wb, `OTRegister_${year}_${month}.xlsx`); }
  };
  const exportMovement = () => {
    const empGroups = {}; filtered.forEach(r => { const d = fmtDate(r.att_date) || "—"; const empK = `${empid}|${empName}`; if (!empGroups[empK]) empGroups[empK] = { eId: empid, eName: empName, shifts: {} }; const sK = `${d}|${r.shift || "—"}`; if (!empGroups[empK].shifts[sK]) empGroups[empK].shifts[sK] = []; empGroups[empK].shifts[sK].push(r); });
    const rows = []; let sno = 1;
    Object.keys(empGroups).sort().forEach(empK => { const emp = empGroups[empK]; let firstEmp = true; Object.keys(emp.shifts).sort().forEach(sK => { const [eDate, eShift] = sK.split("|"); const rs = emp.shifts[sK]; const punches = []; rs.forEach(r => { if (r.in_time) punches.push(r.in_time.slice(0, 5)); if (r.lunch_out) punches.push(r.lunch_out.slice(0, 5)); if (r.lunch_in) punches.push(r.lunch_in.slice(0, 5)); if (r.out_time) punches.push(r.out_time.slice(0, 5)); if (r.punch_time) punches.push(String(r.punch_time).slice(0, 5)); }); const rawC = punches.length; if (rawC === 0) punches.push("—"); const shiftTim = rs[0]?.shift_start && rs[0]?.shift_end ? `${rs[0].shift_start.slice(0, 5)}-${rs[0].shift_end.slice(0, 5)}` : rs[0]?.shift_timings || ""; const shiftCell = shiftTim ? `${eShift}\n${shiftTim}` : eShift; const showEmp = firstEmp; firstEmp = false; punches.forEach((p, i) => rows.push([i === 0 && showEmp ? sno : "", i === 0 && showEmp ? emp.eId : "", i === 0 && showEmp ? emp.eName : "", i === 0 ? eDate : "", i === 0 ? shiftCell : "", p, i === 0 ? (rs[0]?.status || "—") : "", i === 0 ? (rawC === 0 ? "—" : rawC) : ""])); }); sno++; });
    const head = ["Sl.No", "Emp ID", "Name", "Date", "Shift", "Punch Time", "Status", "Count"]; const title = `Movement Report — ${MONTHS[month - 1].label} ${year} — ${empid}`;
    if (reportType === "PDF") { const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" }); doc.text(companyName || "Company", 420, 30, { align: "center" }); doc.text(title, 420, 45, { align: "center" }); autoTable(doc, { startY: 60, head: [head], body: rows.length ? rows : [["", "", "", "No records", "", "", "", ""]], styles: { fontSize: 7, cellPadding: 3 }, headStyles: { fillColor: [25, 118, 210] }, theme: "grid" }); doc.save(`Movement_${year}_${month}.pdf`); } else { const ws = XLSX.utils.aoa_to_sheet([[companyName || "Company"], [title], head, ...rows]); const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, "Movement"); XLSX.writeFile(wb, `Movement_${year}_${month}.xlsx`); }
  };
  const exportAttendanceLog = () => {
    const head = ["Date", "Shift", "Punch In", "Punch Out", "Lunch Out", "Lunch In", "Late", "OT", "Status"];
    const rows = filtered.map(r => [fmtDate(r.att_date), r.shift || "—", r.in_time?.slice(0, 5) || "—", r.out_time?.slice(0, 5) || "—", r.lunch_out?.slice(0, 5) || "—", r.lunch_in?.slice(0, 5) || "—", r.late_hrs ? Number(r.late_hrs).toFixed(2) : "0.00", r.ot_hrs ? Number(r.ot_hrs).toFixed(2) : "0.00", r.status || "—"]);
    const title = `Attendance Log — ${MONTHS[month - 1].label} ${year} — ${empid}`;
    if (reportType === "PDF") { const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" }); doc.text(companyName || "Company", 420, 30, { align: "center" }); doc.text(title, 420, 45, { align: "center" }); autoTable(doc, { startY: 60, head: [head], body: rows.length ? rows : [["No records", "", "", "", "", "", "", "", ""]], styles: { fontSize: 7, cellPadding: 3 }, headStyles: { fillColor: [25, 118, 210] }, theme: "grid" }); doc.save(`AttendanceLog_${year}_${month}.pdf`); } else { const ws = XLSX.utils.aoa_to_sheet([[companyName || "Company"], [title], head, ...rows]); const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, "Attendance Log"); XLSX.writeFile(wb, `AttendanceLog_${year}_${month}.xlsx`); }
  };
  const exportOndutyMovement = () => {
    const empGroups = {}; filtered.forEach(r => { const empK = `${r.empid || empid}|${r.ename || empName}`; if (!empGroups[empK]) empGroups[empK] = { eId: r.empid || empid, eName: r.ename || empName, byStatus: {} }; const k = String(r.status || "Pending").toLowerCase(); if (!empGroups[empK].byStatus[k]) empGroups[empK].byStatus[k] = []; empGroups[empK].byStatus[k].push(r); });
    const head = ["Sl.No", "Emp ID", "Name", "Movement ID", "Entry Date", "Actual Mov. Date", "From Time", "To Time", "Place", "Purpose", "Status"]; const rows = []; let sno = 1; Object.keys(empGroups).sort().forEach(empK => { const emp = empGroups[empK]; rows.push([{ content: `${emp.eId} — ${emp.eName}`, colSpan: 11, styles: { fillColor: [232, 240, 254], textColor: [25, 103, 210], fontStyle: "bold" } }]); Object.keys(emp.byStatus).sort().forEach(k => { rows.push([{ content: `${k.toUpperCase()} — ${emp.byStatus[k].length}`, colSpan: 11, styles: { fillColor: [245, 245, 245], textColor: [60, 60, 60], fontStyle: "bold" } }]); emp.byStatus[k].forEach(r => { const entry = r.created || r.created_at || r.created_dt || r.entry_date || r.applied_date || r.movement_created || r.od_created || r.movement_date; rows.push([sno++, r.empid || emp.eId, r.ename || emp.eName, r.movement_id || r.id || "—", entry ? fmtDateTime(entry) : "—", fmtDate(r.movement_date || r.act_date || r.actual_date), String(r.perm_ftime || r.from_time || r.ftime || "").slice(0, 5) || "—", String(r.perm_ttime || r.to_time || r.ttime || "").slice(0, 5) || "—", r.place || r.location || "—", r.purpose || r.reason || "—", r.status || "—"]); }); }); });
    const title = `OnDuty Movement — ${MONTHS[month - 1].label} ${year} — ${empid}`;
    if (reportType === "PDF") { const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" }); doc.text(companyName || "Company", 420, 30, { align: "center" }); doc.text(title, 420, 45, { align: "center" }); autoTable(doc, { startY: 60, head: [head], body: rows.length ? rows : [["No records", "", "", "", "", "", "", "", "", "", ""]], styles: { fontSize: 6, cellPadding: 2 }, headStyles: { fillColor: [25, 118, 210] }, theme: "grid" }); doc.save(`OndutyMovement_${year}_${month}.pdf`); } else { const flat = []; let s2 = 1; Object.keys(empGroups).sort().forEach(empK => { const emp = empGroups[empK]; flat.push([`${emp.eId} — ${emp.eName}`, "", "", "", "", "", "", "", "", "", ""]); Object.keys(emp.byStatus).sort().forEach(k => { flat.push([`${k.toUpperCase()} — ${emp.byStatus[k].length}`, "", "", "", "", "", "", "", "", "", ""]); emp.byStatus[k].forEach(r => { const entry2 = r.created || r.created_at || r.created_dt || r.entry_date || r.applied_date || r.movement_created || r.od_created || r.movement_date; flat.push([s2++, r.empid || emp.eId, r.ename || emp.eName, r.movement_id || r.id || "—", entry2 ? fmtDateTime(entry2) : "—", fmtDate(r.movement_date || r.act_date || r.actual_date), String(r.perm_ftime || r.from_time || r.ftime || "").slice(0, 5) || "—", String(r.perm_ttime || r.to_time || r.ttime || "").slice(0, 5) || "—", r.place || r.location || "—", r.purpose || r.reason || "—", r.status || "—"]); }); }); }); const ws = XLSX.utils.aoa_to_sheet([[companyName || "Company"], [title], head, ...flat]); const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, "Onduty Movement"); XLSX.writeFile(wb, `OndutyMovement_${year}_${month}.xlsx`); }
  };
  const exportLeavesInfo = async () => {
    const r = leaveBal || filtered[0] || store["leaves-info"]?.[0] || store["encashment"]?.[0] || {};
    const clsBal = Number(r.cls_balance ?? r.clsBalance ?? r.clBal ?? 0);
    const clsAv = Number(r.cls_utilised ?? r.clsUtilised ?? r.cls_utilized ?? 0);
    const clsEl = Number(r.cls_eligible ?? r.clsEligible ?? (r.cls_balance != null || r.clsBalance != null ? clsBal + clsAv : 0));
    const elsBal = Number(r.els_balance ?? r.elsBalance ?? r.elBal ?? 0);
    const elsAv = Number(r.els_utilised ?? r.elsUtilised ?? r.els_utilized ?? 0);
    const elsEl = Number(r.els_eligible ?? r.elsEligible ?? (r.els_balance != null || r.elsBalance != null ? elsBal + elsAv : 0));
    const headTop = [{ content: "Emp ID", rowSpan: 2, styles: { halign: "center", valign: "middle" } }, { content: "Name", rowSpan: 2, styles: { halign: "center", valign: "middle" } }, { content: "CL", colSpan: 3, styles: { halign: "center" } }, { content: "EL", colSpan: 3, styles: { halign: "center" } }, { content: "Total Balance", rowSpan: 2, styles: { halign: "center", valign: "middle" } }];
    const headSub = [{ content: "Eligible", styles: { halign: "center" } }, { content: "Availed", styles: { halign: "center" } }, { content: "Balance", styles: { halign: "center" } }, { content: "Eligible", styles: { halign: "center" } }, { content: "Availed", styles: { halign: "center" } }, { content: "Balance", styles: { halign: "center" } }];
    const headFlat = ["Emp ID", "Name", "CL Eligible", "CL Availed", "CL Balance", "EL Eligible", "EL Availed", "EL Balance", "Total Balance"];
    const row = [r.empid || r.gempid || empid, r.ename || r.empname || empName, clsEl.toString(), clsAv.toString(), clsBal.toString(), elsEl.toString(), elsAv.toString(), elsBal.toString(), Number(clsBal + elsBal).toString()];
    const title = `Leaves Information — ${empid} ${empName} — ${year}`;
    if (reportType === "PDF") {
      const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
      const logoUrl = companySettings?.logo_url || logo;
      if (logoUrl) {
        try {
          let logoData = logoUrl;
          if (!logoUrl.startsWith("data:")) {
            const res = await fetch(logoUrl);
            const blob = await res.blob();
            logoData = await new Promise(resv => { const fr = new FileReader(); fr.onload = () => resv(fr.result); fr.readAsDataURL(blob); });
          }
          doc.addImage(logoData, "JPEG", 40, 10, 68, 30);
        } catch {}
      }
      doc.setFontSize(11); doc.text(companyName || "Company", 420, 28, { align: "center" }); doc.setFontSize(9); doc.text(title, 420, 42, { align: "center" }); autoTable(doc, { startY: 60, head: [headTop, headSub], body: [row], styles: { fontSize: 7, cellPadding: 3, halign: "center", valign: "middle" }, headStyles: { fillColor: [25, 118, 210], halign: "center", valign: "middle" }, theme: "grid" }); doc.save(`LeavesInfo_${empid}_${year}.pdf`);
    } else { const wsData = [[companyName || "Company"], [title], ["", "", "CL", "", "", "EL", "", "", ""], headFlat, row]; const ws = XLSX.utils.aoa_to_sheet(wsData); ws["!merges"] = [{ s: { r: 2, c: 2 }, e: { r: 2, c: 4 } }, { s: { r: 2, c: 5 }, e: { r: 2, c: 7 } }]; const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, "Leaves Info"); XLSX.writeFile(wb, `LeavesInfo_${empid}_${year}.xlsx`); }
  };
  const exportPayslips = () => {
    if (!filtered.length) { alert(`No payslips for ${MONTHS[month - 1]?.label || ""} ${year}`); return; }
    const head = ["Month / Year", "Emp ID", "Employee Name", "Total Days", "Present", "Total Fixed", "Earned Gross", "Total Ded.", "Net Pay", "Status"];
    const rows = filtered.map(r => [ `${r.C_MONTH} ${r.C_YEAR}`, r.C_EMPID || empid, r.C_ENAME || empName, Math.round(r.C_TOT_DAYS || 0), Math.round(r.C_DAYS_PRESENT || 0), Number(r.C_TOT_SAL || 0).toLocaleString("en-IN"), Number(r.C_EARNED_GROSS || 0).toLocaleString("en-IN"), Number(r.C_TOT_DED || 0).toLocaleString("en-IN"), `Rs. ${Number(r.C_NET_AMT || 0).toLocaleString("en-IN")}`, r.C_FINAL_STATUS === 2 ? "Final" : "Generated" ]);
    const title = `Payslips — ${MONTHS[month - 1]?.label} ${year} — ${empid} ${empName}`;
    if (reportType === "PDF") { const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" }); doc.text(companyName || "Company", 420, 30, { align: "center" }); doc.text(title, 420, 45, { align: "center" }); autoTable(doc, { startY: 60, head: [head], body: rows, styles: { fontSize: 7, cellPadding: 3, halign: "center" }, headStyles: { fillColor: [25, 118, 210], halign: "center" }, theme: "grid" }); doc.save(`Payslips_${empid}_${MONTHS[month - 1]?.label}_${year}.pdf`); } else { const ws = XLSX.utils.aoa_to_sheet([[companyName || "Company"], [title], head, ...rows]); const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, "Payslips"); XLSX.writeFile(wb, `Payslips_${empid}_${MONTHS[month - 1]?.label}_${year}.xlsx`); }
  };
  const handleExport = () => {
    if (reportType === "View") { fetchData(); return; }
    if ((selected === "leave" || selected === "leaves") && filtered.length) { exportLeaveHistory(); return; }
    if (selected === "holidays" && filtered.length) { exportHolidays(); return; }
    if (selected === "musterroll") { exportMusterRoll(); return; }
    if (selected === "ot-register") { exportOtRegister(); return; }
    if (selected === "movement") { exportMovement(); return; }
    if (selected === "onduty-movement") { exportOndutyMovement(); return; }
    if (selected === "leaves-info" || selected === "encashment") { exportLeavesInfo(); return; }
    if (selected === "attendance-log" || selected === "attendance") { exportAttendanceLog(); return; }
    if (selected === "payslips") { exportPayslips(); return; }
    exportCsv();
  };
  const downloadPayslip = async (r) => {
    const m = r.C_MONTH || r.month; const y = r.C_YEAR || r.year;
    const monthNum = { JAN: 1, FEB: 2, MAR: 3, APR: 4, MAY: 5, JUN: 6, JUL: 7, AUG: 8, SEP: 9, OCT: 10, NOV: 11, DEC: 12 }[String(m).toUpperCase().slice(0, 3)] || parseInt(m) || 1;
    try {
      const res = await axios.get(`${API}/api/payroll/my-payslip/download`, { params: { empid, month: monthNum, year: y }, withCredentials: true });
      const p = res.data;
      const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
      let logoData = null;
      try {
        const url = logo;
        if (url && !url.startsWith("data:")) {
          const resp = await fetch(url);
          const blob = await resp.blob();
          logoData = await new Promise(resv => { const fr = new FileReader(); fr.onload = () => resv(fr.result); fr.readAsDataURL(blob); });
        } else logoData = url;
      } catch {}
      const body = [
        [{ content: companyName || "AUCTOR HOME APPLIANCES LLP", colSpan: 10, styles: { halign: "center", fontStyle: "bold", fontSize: 11, valign: "middle" } }],
        [{ content: "Plot No 21 & 22, Phase IV, IDA, Jeedimetla, Hyderabad", colSpan: 10, styles: { halign: "center", fillColor: [220, 220, 220], fontSize: 7, valign: "middle" } }],
        [{ content: `Salary Slip For The Month of : ${p.C_MONTH} - ${p.C_YEAR}`, colSpan: 10, styles: { halign: "center", fontStyle: "bold", fontSize: 8, valign: "middle" } }],
        [{ content: "Employee ID", styles: { fontStyle: "bold", valign: "middle" } }, { content: String(p.C_EMPID || ""), colSpan: 2, styles: { fontStyle: "bold", valign: "middle" } }, { content: "D O J :", colSpan: 2, styles: { valign: "middle" } }, { content: "Designation:", colSpan: 2, styles: { valign: "middle" } }, { content: String(p.C_DESIG || ""), colSpan: 3, styles: { valign: "middle" } }],
        [{ content: "Employee Name", styles: { valign: "middle" } }, { content: String(p.C_ENAME || ""), colSpan: 2, styles: { fontStyle: "bold", valign: "middle" } }, { content: String(formatDOJ(p.employee?.official?.doj) || ""), colSpan: 2, styles: { valign: "middle" } }, { content: "Department:", colSpan: 2, styles: { valign: "middle" } }, { content: String(p.C_DEPT || ""), colSpan: 3, styles: { valign: "middle" } }],
        [{ content: "Total Days", styles: { valign: "middle" } }, { content: String(Math.round(p.C_TOT_DAYS || 0)), styles: { halign: "center", valign: "middle" } }, { content: "Days Present:", styles: { valign: "middle" } }, { content: String(Math.round(p.C_DAYS_PRESENT || 0)), styles: { halign: "center", valign: "middle" } }, { content: "Leaves Allowed:", styles: { valign: "middle" } }, { content: String(Math.round(p.C_LEAVES_ALLOWED || 0)), styles: { halign: "center", valign: "middle" } }, { content: "UAN Number", colSpan: 2, styles: { valign: "middle" } }, { content: String(p.employee?.official?.c_uan_no || "N/A"), colSpan: 2, styles: { halign: "center", fontStyle: "bold", valign: "middle" } }],
        [{ content: "Absent Days", styles: { valign: "middle" } }, { content: Number(p.C_ABSENT_DAYS || 0).toFixed(1), styles: { halign: "center", valign: "middle" } }, { content: "Late Hrs", styles: { valign: "middle" } }, { content: String(p.C_LATE_HOURS || p.C_LATE_HALF_HOURS || 0), styles: { halign: "center", valign: "middle" } }, { content: "Late: D:", styles: { valign: "middle" } }, { content: String(p.C_LATE_HALF_DAYS || 0), styles: { halign: "center", valign: "middle" } }, { content: "ESI Number", colSpan: 2, styles: { valign: "middle" } }, { content: String(p.C_ESI_NUM || p.employee?.official?.esiacno || "N/A"), colSpan: 2, styles: { halign: "center", valign: "middle" } }],
        [{ content: "Fixed Salary", colSpan: 2, styles: { halign: "center", fontStyle: "bold", fillColor: [220, 220, 220], valign: "middle" } }, { content: "Earnings Salary", colSpan: 4, styles: { halign: "center", fontStyle: "bold", fillColor: [220, 220, 220], valign: "middle" } }, { content: "Deductions", colSpan: 4, styles: { halign: "center", fontStyle: "bold", fillColor: [220, 220, 220], valign: "middle" } }],
        [{ content: "Basic", styles: { valign: "middle" } }, { content: formatCurrency(p.C_BASIC), styles: { halign: "right", valign: "middle" } }, { content: "Basic", styles: { valign: "middle" } }, { content: formatCurrency(p.C_EARNED_BASIC), styles: { halign: "right", valign: "middle" } }, { content: "Attendance Bonus", styles: { valign: "middle" } }, { content: formatCurrency(p.C_EARNED_BONUS), styles: { halign: "right", valign: "middle" } }, { content: "P.F", styles: { valign: "middle" } }, { content: formatCurrency(p.C_DED_PF), styles: { halign: "right", valign: "middle" } }, { content: "Income tax", styles: { valign: "middle" } }, { content: formatCurrency(p.C_DED_TAX), styles: { halign: "right", valign: "middle" } }],
        [{ content: "HRA", styles: { valign: "middle" } }, { content: formatCurrency(p.C_HRA), styles: { halign: "right", valign: "middle" } }, { content: "HRA", styles: { valign: "middle" } }, { content: formatCurrency(p.C_EARNED_HRA), styles: { halign: "right", valign: "middle" } }, { content: "Extra Wage", styles: { valign: "middle" } }, { content: formatCurrency(p.C_EARNED_OT), styles: { halign: "right", valign: "middle" } }, { content: "E.S.I", styles: { valign: "middle" } }, { content: formatCurrency(p.C_DED_ESI), styles: { halign: "right", valign: "middle" } }, { content: "Advance", styles: { valign: "middle" } }, { content: formatCurrency(p.C_DED_ADV), styles: { halign: "right", valign: "middle" } }],
        [{ content: "Conveyance", styles: { valign: "middle" } }, { content: formatCurrency(p.C_CONV), styles: { halign: "right", valign: "middle" } }, { content: "Conveyance", styles: { valign: "middle" } }, { content: formatCurrency(p.C_EARNED_CONV), styles: { halign: "right", valign: "middle" } }, { content: "Lunch Allowance", styles: { valign: "middle" } }, { content: formatCurrency(p.C_EARNED_LUNCH || 0), styles: { halign: "right", valign: "middle" } }, { content: "P.T", styles: { valign: "middle" } }, { content: formatCurrency(p.C_DED_PT), styles: { halign: "right", valign: "middle" } }, { content: "Canteen", styles: { valign: "middle" } }, { content: formatCurrency(p.C_DED_MEALS || 0), styles: { halign: "right", valign: "middle" } }],
        [{ content: "Washing Allowance", styles: { valign: "middle" } }, { content: formatCurrency(p.C_OTHERS), styles: { halign: "right", valign: "middle" } }, { content: "Washing Allowance", styles: { valign: "middle" } }, { content: formatCurrency(p.C_EARNED_OTHERS), styles: { halign: "right", valign: "middle" } }, { content: "", styles: { valign: "middle" } }, { content: "", styles: { valign: "middle" } }, { content: "L.I.C", styles: { valign: "middle" } }, { content: formatCurrency(p.C_DED_LIC), styles: { halign: "right", valign: "middle" } }, { content: "Other Deduction", styles: { valign: "middle" } }, { content: formatCurrency(Math.ceil(Number(p.C_DED_OTH) || 0)), styles: { halign: "right", valign: "middle" } }],
        [{ content: "Total Fixed Salary", styles: { fontStyle: "bold", valign: "middle" } }, { content: formatCurrency(p.C_TOT_SAL), styles: { halign: "right", fontStyle: "bold", valign: "middle" } }, { content: "Total Earnings Salary :", colSpan: 2, styles: { valign: "middle" } }, { content: formatCurrency(p.C_EARNED_GROSS), colSpan: 2, styles: { halign: "right", fontStyle: "bold", valign: "middle" } }, { content: "Total Deduction:", colSpan: 2, styles: { valign: "middle" } }, { content: formatCurrency(p.C_TOT_DED), colSpan: 2, styles: { halign: "right", fontStyle: "bold", valign: "middle" } }],
        [{ content: "NET Salary :", styles: { fontStyle: "bold", valign: "middle" } }, { content: formatCurrency(p.C_NET_AMT), styles: { halign: "right", fontStyle: "bold", valign: "middle" } }, { content: "Payment Mode :", colSpan: 2, styles: { valign: "middle" } }, { content: String(p.C_PAY_TYPE || "Bank"), colSpan: 2, styles: { valign: "middle" } }, { content: "Bank A/c No :", colSpan: 2, styles: { valign: "middle" } }, { content: String(p.C_BANK_ACNO || "-"), colSpan: 2, styles: { valign: "middle" } }],
      ];
      autoTable(doc, {
        startY: 16,
        tableWidth: 575,
        margin: { left: 10, right: 10 },
        theme: "grid",
        styles: { fontSize: 8, cellPadding: 3, lineWidth: 0.2, textColor: [0,0,0], lineColor: [0, 0, 0], valign: "middle", overflow: "linebreak" },
        columnStyles: {
          0: { cellWidth: 80.5 }, 1: { cellWidth: 51.7 }, 2: { cellWidth: 74.7 }, 3: { cellWidth: 40.2 }, 4: { cellWidth: 80.5 },
          5: { cellWidth: 28.7 }, 6: { cellWidth: 46 }, 7: { cellWidth: 46 }, 8: { cellWidth: 69 }, 9: { cellWidth: 57.7 }
        },
        body: body,
        didDrawCell: (data) => {
          if (data.row.index === 0 && data.column.index === 0 && logoData) {
            try { doc.addImage(logoData, "JPEG", data.cell.x + 4, data.cell.y + 4, 62, 12); } catch {}
          }
        }
      });
      doc.save(`Payslip_${p.C_EMPID}_${p.C_MONTH}_${p.C_YEAR}.pdf`);
    } catch (e) { alert(e.response?.data?.message || "Payslip not found"); }
  };

  const isMonthly = MONTHLY_REPORTS.some(r => r.id === selected);
  const selectedMeta = [...APP_REPORTS, ...MONTHLY_REPORTS].find(r => r.id === selected);

  const statsOf = (arr) => {
    if (!Array.isArray(arr) || arr.length === 0) return { total: 0, pending: 0, approved: 0, rejected: 0, last: null };
    let pending = 0, approved = 0, rejected = 0;
    arr.forEach(r => {
      const s = statusOf(getStatus(r));
      if (s === "pending") pending++;
      else if (s === "approved") approved++;
      else if (s === "rejected") rejected++;
    });
    const last = [...arr].sort((a, b) => new Date(b.movement_date || b.tour_from_date || b.from_date || b.att_date || b.created || b.created_at || b.ldate || 0) - new Date(a.movement_date || a.tour_from_date || a.from_date || a.att_date || a.created || a.created_at || a.ldate || 0))[0];
    return { total: arr.length, pending, approved, rejected, last };
  };

  const attSummary = useMemo(() => {
    const arr = store.attendance || [];
    if (!arr.length) return null;
    const present = arr.filter(r => (r.status || "").toLowerCase() === "present" || r.in_time).length;
    const late = arr.filter(r => parseFloat(r.late_hrs) > 0).length;
    const ot = arr.reduce((s, r) => s + (parseFloat(r.ot_hrs) || 0), 0);
    return { total: arr.length, present, absent: arr.length - present, late, ot: ot.toFixed(1) };
  }, [store.attendance]);
  const payslipSummary = useMemo(() => {
    const arr = store.payslips || [];
    if (!arr.length) return null;
    const latest = [...arr].sort((a, b) => (b.C_YEAR - a.C_YEAR) || (String(b.C_MONTH).localeCompare(String(a.C_MONTH))))[0];
    return { count: arr.length, latestNet: latest?.C_NET_AMT, latestMonth: latest ? `${latest.C_MONTH} ${latest.C_YEAR}` : "—" };
  }, [store.payslips]);

  const kpi = useMemo(() => {
    const appKeys = APP_REPORTS.map(r => r.id);
    let total = 0, pending = 0;
    appKeys.forEach(k => {
      const s = statsOf(store[k] || []);
      total += s.total; pending += s.pending;
    });
    return { total, pending, att: attSummary, payslip: payslipSummary };
  }, [store, attSummary, payslipSummary]);

  const YEAR_ONLY = ["leaves-info", "encashment"];
  const headerKpi = useMemo(() => {
    if (!selected) return kpi;
    if (YEAR_ONLY.includes(selected)) {
      const hasRec = !!(filtered[0] || store[selected]?.[0] || leaveBal);
      return { total: hasRec ? 1 : 0, pending: 0 };
    }
    const s = statsOf(isMonthly ? filtered : (store[selected] || filtered));
    return { total: s.total, pending: s.pending };
  }, [selected, store, filtered, kpi, leaveBal, isMonthly]);

  const isPayslipGenerated = useMemo(() => {
    const arr = store.payslips || [];
    return arr.some(p => {
      const mStr = String(p.C_MONTH || p.month || "").toUpperCase().slice(0, 3);
      const map = { JAN: 1, FEB: 2, MAR: 3, APR: 4, MAY: 5, JUN: 6, JUL: 7, AUG: 8, SEP: 9, OCT: 10, NOV: 11, DEC: 12 };
      const mNum = map[mStr] || parseInt(p.C_MONTH) || 0;
      return mNum === month && Number(p.C_YEAR || p.year) === year;
    });
  }, [store.payslips, month, year]);

  const statusChip = (s) => {
    const v = String(s || "").toLowerCase();
    if (["approved", "final", "generated", "2"].includes(v)) return { bg: "#e6f4ea", col: "#137333", dot: "#34a853", label: "Approved" };
    if (["pending", "1", "0"].includes(v)) return { bg: "#fef7e0", col: "#7a6500", dot: "#fbbc04", label: "Pending" };
    if (["rejected", "cancelled", "reopen", "3"].includes(v)) return { bg: "#fce8e6", col: "#a50e0e", dot: "#ea4335", label: "Rejected" };
    return { bg: "#f1f3f4", col: "#5f6368", dot: "#9aa0a6", label: String(s || "—") };
  };
  const rowBg = (s) => {
    const v = statusOf(s);
    if (v === "approved") return "#eeeeee";
    if (v === "pending") return "#e6f4ea";
    return "white";
  };

  const AppRow = ({ r }) => {
    const arr = store[r.id] || [];
    const s = statsOf(arr);
    const hasData = s.total > 0;
    return (
      <Box onClick={() => selectReport(r.id)} sx={{ display: "flex", alignItems: "center", gap: 0.9, px: 1.1, py: 0.7, borderRadius: 1, cursor: "pointer", border: "1px solid #e8eaed", bgcolor: "white", "&:hover": { bgcolor: alpha(theme.palette.primary.main, 0.04), borderColor: alpha(theme.palette.primary.main, 0.3) }, transition: "0.12s" }}>
        <Box sx={{ width: 28, height: 28, borderRadius: 0.8, bgcolor: alpha(theme.palette.primary.main, 0.1), color: theme.palette.primary.main, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, flexShrink: 0 }}><r.icon /></Box>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#202124", lineHeight: 1.1 }}>{r.label}</Typography>
          <Typography sx={{ fontSize: 11, color: "#5f6368", fontWeight: 500, lineHeight: 1 }}>{r.desc}</Typography>
        </Box>
        <Chip label={s.total} size="small" sx={{ height: 18, minWidth: 24, fontSize: 12, fontWeight: 700, bgcolor: hasData ? alpha(theme.palette.primary.main, 0.08) : "#f1f3f4", color: hasData ? theme.palette.primary.main : "#9aa0a6" }} />
        <FaChevronRight size={9} color="#dadce0" />
      </Box>
    );
  };

  const MonthlyRow = ({ r }) => {
    const arr = store[r.id] || [];
    const s = statsOf(arr);
    const isApprovedOT = (x) => x && (x.ot_status === "Approved" || x.ot_approved == 1 || x.app_status === "Approved" || x.hr_app_status === "Approved" || x.is_ot_approved == 1 || x.ot_approved_status === "Approved");
    const otApproved = arr.filter(x => isApprovedOT(x) && Number(x.ot_hrs) > 0).length;
    const count = r.id === "leaves-info" ? 1 : r.id === "ot-register" ? otApproved : r.id === "attendance" || r.id === "attendance-log" ? attSummary?.total ?? arr.length : arr.length;
    return (
      <Box onClick={() => selectReport(r.id)} sx={{ display: "flex", alignItems: "center", gap: 0.9, px: 1.1, py: 0.7, borderRadius: 1, cursor: "pointer", border: "1px solid #e8eaed", bgcolor: "white", "&:hover": { bgcolor: alpha(theme.palette.primary.main, 0.04), borderColor: alpha(theme.palette.primary.main, 0.3) } }}>
        <Box sx={{ width: 28, height: 28, borderRadius: 0.8, bgcolor: alpha(theme.palette.primary.main, 0.1), color: theme.palette.primary.main, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}><r.icon /></Box>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#202124", lineHeight: 1.1 }}>{r.label}</Typography>
          <Typography sx={{ fontSize: 11, color: "#5f6368", lineHeight: 1 }}>{r.desc} {["holidays", "attendance-log", "attendance", "musterroll", "movement", "ot-register", "att-percentage", "onduty-movement", "leaves-info"].includes(r.id) ? "" : `• ${s.total ? `${s.pending} pend` : "—"}`}</Typography>
        </Box>
        <Chip label={count} size="small" sx={{ height: 18, minWidth: 24, fontSize: 12, fontWeight: 700, bgcolor: "#f1f3f4", color: "#5f6368" }} />
        <FaChevronRight size={9} color="#dadce0" />
      </Box>
    );
  };

  const renderTable = () => {
    if (loading) return <Box sx={{ p: 6, textAlign: "center" }}><CircularProgress size={24} /><Typography sx={{ mt: 1, fontSize: 13, color: "#5f6368", fontWeight: 600 }}>Loading {selectedMeta?.label}…</Typography></Box>;
    if (filtered.length === 0) return (
      <Box sx={{ p: 6, textAlign: "center" }}>
        <Box sx={{ width: 48, height: 48, borderRadius: "50%", bgcolor: "#f1f3f4", display: "flex", alignItems: "center", justifyContent: "center", mx: "auto", mb: 1.2, color: "#9aa0a6", fontSize: 20 }}><FaClipboardList /></Box>
        <Typography sx={{ fontWeight: 700, color: "#202124", fontSize: 14 }}>No records found</Typography>
        <Typography sx={{ fontSize: 12, color: "#5f6368", mt: 0.4 }}>{isMonthly ? "No data for selected month. Try another period." : "You haven’t submitted any requests yet."}</Typography>
      </Box>
    );
    const headSx = { fontWeight: 700, fontSize: 12, color: "#5f6368", whiteSpace: "nowrap", bgcolor: "#f8f9fa", borderBottom: "1px solid #e8eaed", py: 1, textAlign: "center" };
    if (selected === "attendance" || selected === "attendance-log") {
      const cnt = (() => {
        let Ps = 0, As = 0, W = 0, H = 0, CL = 0, EL = 0;
        filtered.forEach(r => {
          const s = String(r.status || "").trim().toLowerCase();
          const lt = String(r.leave_type || r.ltype || "").trim().toUpperCase();
          if (r.holiday) H++;
          else if (String(r.woff_day) === "1" || s === "woff" || s === "w-off" || s === "w") W++;
          else if (s === "present" || s === "p") Ps++;
          else if (s === "absent" || s === "a") As++;
          else if (s === "half day") Ps += 0.5;
          else if (lt === "CL" || s === "cl") CL++;
          else if (lt === "EL" || s === "el") EL++;
          else if (s === "leave") EL++;
        });
        return { Ps, As, W, H, CL, EL, total: filtered.length };
      })();
      return (
        <Box>
          <Box sx={{ display: "flex", gap: 0.8, flexWrap: "wrap", px: 1.2, py: 0.8, bgcolor: "#f8f9fa", borderBottom: "1px solid #e8eaed" }}>
            {[
              { k: "P", v: cnt.Ps, bg: "#e6f4ea", col: "#137333" },
              { k: "A", v: cnt.As, bg: "#fce8e6", col: "#a50e0e" },
              { k: "W", v: cnt.W, bg: "#e8f0fe", col: "#1967d2" },
              { k: "H", v: cnt.H, bg: "#fef7e0", col: "#7a6500" },
              { k: "CL", v: cnt.CL, bg: "#e6f4ea", col: "#137333" },
              { k: "EL", v: cnt.EL, bg: "#e8eaed", col: "#3c4043" },
            ].map(c => <Chip key={c.k} label={`${c.k}: ${c.v}`} size="small" sx={{ height: 22, fontSize: 11, fontWeight: 800, bgcolor: c.bg, color: c.col, border: "1px solid #dadce0" }} />)}
            <Chip label={`Total: ${cnt.total}`} size="small" sx={{ height: 22, fontSize: 11, fontWeight: 800, bgcolor: "white", color: "#202124", border: "1px solid #dadce0" }} />
          </Box>
          <Table size="small" stickyHeader><TableHead><TableRow>{["Date", "Shift", "Punch In", "Punch Out", "Lunch Out", "Lunch In", "Late", "OT", "Status"].map(h => <TableCell key={h} sx={headSx}>{h}</TableCell>)}</TableRow></TableHead>
            <TableBody>{filtered.map((r, i) => {
              const c = statusChip(r.status); return <TableRow key={i} hover><TableCell sx={{ fontSize: 12, fontWeight: 600 }}>{fmtDate(r.att_date)}</TableCell><TableCell sx={{ fontSize: 12 }}>{r.shift || "—"}</TableCell><TableCell sx={{ fontSize: 12 }}>{r.in_time?.slice(0, 5) || "—"}</TableCell><TableCell sx={{ fontSize: 12 }}>{r.out_time?.slice(0, 5) || "—"}</TableCell><TableCell sx={{ fontSize: 12 }}>{r.lunch_out?.slice(0, 5) || "—"}</TableCell><TableCell sx={{ fontSize: 12 }}>{r.lunch_in?.slice(0, 5) || "—"}</TableCell><TableCell sx={{ fontSize: 12 }}>{r.late_hrs ? Number(r.late_hrs).toFixed(2) : r.late_mins ? (Number(r.late_mins) / 60).toFixed(2) : "0.00"}</TableCell><TableCell sx={{ fontSize: 12, fontWeight: 700 }}>{r.ot_hrs ? Number(r.ot_hrs).toFixed(2) : r.ot_mins ? (Number(r.ot_mins) / 60).toFixed(2) : "0.00"}</TableCell><TableCell><Chip size="small" label={r.status || "—"} sx={{ height: 18, fontSize: 11, fontWeight: 700, bgcolor: c.bg, color: c.col }} /></TableCell></TableRow>;
            })}</TableBody></Table>
        </Box>
      );
    }
    const isMonthlyLeave = selected === "leaves";
    if (selected === "leaves" || selected === "leave") {
      if (isMonthlyLeave) {
        const totals = (() => {
          let totDays = 0, sCls = 0, sEls = 0, sLop = 0;
          filtered.forEach(r => {
            const isAppR = String(r.status || "").trim().toUpperCase() === "APPROVED";
            (r.leaveDetails || [{ nod: r.nod || 0 }]).forEach(d => {
              const n = Number(d.nod || 0);
              totDays += n;
              if (!isAppR && String(d.c_hr_app_status || "").trim().toUpperCase() !== "APPROVED") return;
              let c, e, l;
              if (d.c_cl_sanction != null || d.c_el_sanction != null) {
                c = Number(d.c_cl_sanction ?? 0); e = Number(d.c_el_sanction ?? 0); l = Number((n - c - e).toFixed(2)); if (l < 0) l = 0;
              } else {
                const t = String(d.ltype || d.type || "").trim().toUpperCase();
                c = t.includes("CL") ? n : 0; e = t.includes("EL") || t.includes("SL") ? n : 0; l = t.includes("LOP") ? n : 0;
              }
              sCls += c; sEls += e; sLop += l;
            });
          });
          return { totDays, sCls, sEls, sLop };
        })();
        return (
          <Box>
            <Box ref={topBarRef} onScroll={e => { if (tableBoxRef.current) tableBoxRef.current.scrollLeft = e.target.scrollLeft; }} sx={{ overflowX: "auto", overflowY: "hidden", height: 12, mb: 0.5, "&::-webkit-scrollbar": { height: 8 }, "&::-webkit-scrollbar-thumb": { bgcolor: "#dadce0", borderRadius: 4 } }}><Box sx={{ minWidth: 1300, height: 1 }} /></Box>
            <Box ref={tableBoxRef} onScroll={e => { if (topBarRef.current) topBarRef.current.scrollLeft = e.target.scrollLeft; }} sx={{ overflowX: "auto" }}>
              <Table size="small" stickyHeader sx={{ minWidth: 1300, borderCollapse: "collapse", "& th, & td": { border: "1px solid #e0e6ef" } }}>
              <TableHead>
                <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.08) }}>
                  <TableCell sx={{ ...headSx, bgcolor: alpha(theme.palette.primary.main, 0.08), color: theme.palette.primary.main, textAlign: "center", border: "1px solid #e8eaed" }} rowSpan={2}>SNo</TableCell>
                <TableCell sx={{ ...headSx, bgcolor: alpha(theme.palette.primary.main, 0.08), color: theme.palette.primary.main, textAlign: "center", border: "1px solid #e8eaed" }} rowSpan={2}>Emp Id</TableCell>
                <TableCell sx={{ ...headSx, bgcolor: alpha(theme.palette.primary.main, 0.08), color: theme.palette.primary.main, textAlign: "center", border: "1px solid #e8eaed" }} rowSpan={2}>Employee Name</TableCell>
                <TableCell sx={{ ...headSx, bgcolor: alpha(theme.palette.primary.main, 0.08), color: theme.palette.primary.main, textAlign: "center", border: "1px solid #e8eaed" }} rowSpan={2}>Lapp No</TableCell>
                <TableCell sx={{ ...headSx, bgcolor: alpha(theme.palette.primary.main, 0.08), color: theme.palette.primary.main, textAlign: "center", border: "1px solid #e8eaed" }} rowSpan={2}>Lapp Date</TableCell>
                <TableCell sx={{ ...headSx, bgcolor: alpha(theme.palette.primary.main, 0.08), color: theme.palette.primary.main, textAlign: "center", border: "1px solid #e8eaed" }} rowSpan={2}>Address/Reason</TableCell>
                <TableCell sx={{ ...headSx, bgcolor: alpha(theme.palette.primary.main, 0.08), color: theme.palette.primary.main, textAlign: "center", border: "1px solid #e8eaed" }} rowSpan={2}>Leave Purpose</TableCell>
                <TableCell sx={{ ...headSx, bgcolor: alpha(theme.palette.primary.main, 0.08), color: theme.palette.primary.main, textAlign: "center", border: "1px solid #e8eaed" }} rowSpan={2}>Leave Date</TableCell>
                <TableCell sx={{ ...headSx, bgcolor: alpha(theme.palette.primary.main, 0.08), color: theme.palette.primary.main, textAlign: "center", border: "1px solid #e8eaed" }} rowSpan={2}>Day Type</TableCell>
                <TableCell sx={{ ...headSx, bgcolor: alpha(theme.palette.primary.main, 0.08), color: theme.palette.primary.main, textAlign: "center", border: "1px solid #e8eaed" }} rowSpan={2}>No of Days</TableCell>
                <TableCell sx={{ ...headSx, bgcolor: alpha(theme.palette.primary.main, 0.08), color: theme.palette.primary.main, textAlign: "center", border: "1px solid #e8eaed" }} colSpan={3}>Sanctioned</TableCell>
                <TableCell sx={{ ...headSx, bgcolor: alpha(theme.palette.primary.main, 0.08), color: theme.palette.primary.main, textAlign: "center", border: "1px solid #e8eaed" }} colSpan={3}>Balance as on today</TableCell>
              </TableRow>
              <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.08) }}>
                <TableCell sx={{ ...headSx, bgcolor: alpha(theme.palette.primary.main, 0.08), color: theme.palette.primary.main, textAlign: "center", border: "1px solid #e8eaed" }}>CLS</TableCell>
                <TableCell sx={{ ...headSx, bgcolor: alpha(theme.palette.primary.main, 0.08), color: theme.palette.primary.main, textAlign: "center", border: "1px solid #e8eaed" }}>ELS</TableCell>
                <TableCell sx={{ ...headSx, bgcolor: alpha(theme.palette.primary.main, 0.08), color: theme.palette.primary.main, textAlign: "center", border: "1px solid #e8eaed" }}>LOP</TableCell>
                <TableCell sx={{ ...headSx, bgcolor: alpha(theme.palette.primary.main, 0.08), color: theme.palette.primary.main, textAlign: "center", border: "1px solid #e8eaed" }}>CLS</TableCell>
                <TableCell sx={{ ...headSx, bgcolor: alpha(theme.palette.primary.main, 0.08), color: theme.palette.primary.main, textAlign: "center", border: "1px solid #e8eaed" }}>ELS</TableCell>
                <TableCell sx={{ ...headSx, bgcolor: alpha(theme.palette.primary.main, 0.08), color: theme.palette.primary.main, textAlign: "center", border: "1px solid #e8eaed" }}>Total</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.flatMap((r, appIdx) => {
                const details = r.leaveDetails?.length ? r.leaveDetails : [{ frmdt: r.from || r.from_date || r.ldate, nod: r.nod || 1, ltype: r.ltype || "", daydt: "" }];
                return details.map((d, di) => {
                  const isFirst = di === 0;
                  let sCls = 0, sEls = 0, sLop = 0;
                  const isApp = String(d.c_hr_app_status || r.status || "").trim().toUpperCase() === "APPROVED";
                  if (isApp) {
                    if (d.c_cl_sanction != null || d.c_el_sanction != null) {
                      sCls = Number(d.c_cl_sanction ?? 0);
                      sEls = Number(d.c_el_sanction ?? 0);
                      sLop = Number((Number(d.nod || 0) - sCls - sEls).toFixed(2)); if (sLop < 0) sLop = 0;
                    } else {
                      const t = String(d.ltype || d.type || "").trim().toUpperCase();
                      if (t.includes("CL")) sCls = Number(d.nod || 0);
                      else if (t.includes("EL") || t.includes("SL")) sEls = Number(d.nod || 0);
                      else if (t.includes("LOP")) sLop = Number(d.nod || 0);
                    }
                  }
                  return (
                    <TableRow key={`${r.id || r.lno}-${di}`} hover>
                      <TableCell sx={{ fontSize: 12, textAlign: "center" }}>{isFirst ? appIdx + 1 : ""}</TableCell>
                      <TableCell sx={{ fontSize: 12, textAlign: "center" }}>{isFirst && appIdx === 0 ? (r.empId || r.empid || empid) : ""}</TableCell>
                      <TableCell sx={{ fontSize: 12 }}>{isFirst && appIdx === 0 ? (r.empName || r.ename || empName) : ""}</TableCell>
                      <TableCell sx={{ fontSize: 12, fontWeight: 700, textAlign: "center" }}>{isFirst ? (r.id || r.lno) : ""}</TableCell>
                      <TableCell sx={{ fontSize: 11, textAlign: "center" }}>{isFirst ? fmtDateTime(r.ldate || r.entry || r.created || r.created_at) : ""}</TableCell>
                      <TableCell sx={{ fontSize: 11, textAlign: "center", maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={r.address || r.remarks || r.reason || r.purpose || ""}>{isFirst ? (r.address || r.remarks || r.reason || r.purpose || "—") : ""}</TableCell>
                      <TableCell sx={{ fontSize: 11, textAlign: "center", maxWidth: 110, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={r.purpose || r.pofl || r.reason || ""}>{isFirst ? (r.purpose || r.pofl || r.reason || "—") : ""}</TableCell>
                      <TableCell sx={{ fontSize: 11, textAlign: "center" }}>{(() => { if (d.nod > 1 && d.frmdt) { const to = new Date(d.frmdt); if (!isNaN(to)) { to.setDate(to.getDate() + Number(d.nod) - 1); return `${fmtDate(d.frmdt)} to ${fmtDate(to)}`; } } return fmtDate(d.frmdt); })()}</TableCell>
                      <TableCell sx={{ fontSize: 11, textAlign: "center" }}>{(() => { const v = String(d.daydt || "").trim().toLowerCase(); if (!v) return "Full Day"; if (v.includes("half") || v === "h" || v === "0.5") return "Half Day"; if (v.includes("full") || v === "f" || v === "1" || v === "1.0") return "Full Day"; return d.daydt; })()}</TableCell>
                      <TableCell sx={{ fontSize: 12, textAlign: "center" }}>{Number(d.nod || 1).toString().replace(/\.00$/, "")}</TableCell>
                      <TableCell sx={{ fontSize: 12, textAlign: "center" }}>{sCls ? Number(sCls).toString() : 0}</TableCell>
                      <TableCell sx={{ fontSize: 12, textAlign: "center" }}>{sEls ? Number(sEls).toString() : 0}</TableCell>
                      <TableCell sx={{ fontSize: 12, textAlign: "center", color: Number(sLop) > 0 ? "#d93025" : "#202124", fontWeight: Number(sLop) > 0 ? 800 : 400 }}>{sLop ? Number(sLop).toString() : 0}</TableCell>
                      <TableCell sx={{ fontSize: 12, textAlign: "center", fontWeight: isFirst && appIdx === 0 ? 700 : 400 }}>{isFirst && appIdx === 0 ? Number(leaveBal?.cls_balance ?? leaveBal?.clsBalance ?? 2).toString() : ""}</TableCell>
                      <TableCell sx={{ fontSize: 12, textAlign: "center", fontWeight: isFirst && appIdx === 0 ? 700 : 400 }}>{isFirst && appIdx === 0 ? Number(leaveBal?.els_balance ?? leaveBal?.elsBalance ?? 0).toString() : ""}</TableCell>
                      <TableCell sx={{ fontSize: 12, textAlign: "center", fontWeight: isFirst && appIdx === 0 ? 800 : 400 }}>{isFirst && appIdx === 0 ? Number(Number(leaveBal?.cls_balance ?? 2) + Number(leaveBal?.els_balance ?? 0)).toString() : ""}</TableCell>
                    </TableRow>
                  );
                });
              })}
              <TableRow sx={{ bgcolor: "#f8f9fa", fontWeight: 700 }}>
                <TableCell colSpan={9} sx={{ fontSize: 12, fontWeight: 700, textAlign: "right", borderTop: `2px solid ${theme.palette.primary.main}` }}>Total</TableCell>
                <TableCell sx={{ fontSize: 12, fontWeight: 700, textAlign: "center", borderTop: `2px solid ${theme.palette.primary.main}` }}>{Number(totals.totDays).toString()}</TableCell>
                <TableCell sx={{ fontSize: 12, fontWeight: 700, textAlign: "center", borderTop: `2px solid ${theme.palette.primary.main}` }}>{Number(totals.sCls).toString()}</TableCell>
                <TableCell sx={{ fontSize: 12, fontWeight: 700, textAlign: "center", borderTop: `2px solid ${theme.palette.primary.main}` }}>{Number(totals.sEls).toString()}</TableCell>
                <TableCell sx={{ fontSize: 12, fontWeight: 700, textAlign: "center", borderTop: `2px solid ${theme.palette.primary.main}`, color: Number(totals.sLop) > 0 ? "#d93025" : "#202124" }}>{Number(totals.sLop).toString()}</TableCell>
                <TableCell sx={{ fontSize: 12, fontWeight: 800, textAlign: "center", borderTop: `2px solid ${theme.palette.primary.main}`, bgcolor: "#e8f5e9" }}>{(leaveBal?.cls_balance ?? leaveBal?.clsBalance ?? "—") !== "—" ? Number(leaveBal?.cls_balance ?? leaveBal?.clsBalance).toString() : (store["leaves-info"]?.[0]?.clsBalance ?? filtered[0]?.clsBalance ?? "2")}</TableCell>
                <TableCell sx={{ fontSize: 12, fontWeight: 800, textAlign: "center", borderTop: `2px solid ${theme.palette.primary.main}`, bgcolor: "#e0f2f1" }}>{(leaveBal?.els_balance ?? leaveBal?.elsBalance ?? "—") !== "—" ? Number(leaveBal?.els_balance ?? leaveBal?.elsBalance).toString() : (store["leaves-info"]?.[0]?.elsBalance ?? filtered[0]?.elsBalance ?? "0")}</TableCell>
                <TableCell sx={{ fontSize: 12, fontWeight: 800, textAlign: "center", borderTop: `2px solid ${theme.palette.primary.main}`, bgcolor: "#eceff1" }}>{leaveBal ? Number(Number(leaveBal.cls_balance || leaveBal.clsBalance || 0) + Number(leaveBal.els_balance || leaveBal.elsBalance || 0)).toString() : (filtered[0]?.totalBalance ? Number(filtered[0].totalBalance).toString() : "2")}</TableCell>
              </TableRow>
            </TableBody>
              </Table>
            </Box>
          </Box>
        );
      }
      const header = ["App No", "App Date", "Leave Date", "Purpose", "Days", "Day Type", "Submission", "Status", "Reason", "Print"];
      return (
        <Table size="small" stickyHeader><TableHead><TableRow>{header.map(h => <TableCell key={h} sx={headSx}>{h}</TableCell>)}</TableRow></TableHead>
          <TableBody>{filtered.flatMap((r) => {
            const st = r.status || r.approval_status || "Pending"; const c = statusChip(st);
            const reason = r.remarks || r.address || r.purpose || r.pofl || r.leaveDetails?.[0]?.remarks || "—";
            const purpose = r.purpose || r.pofl || "—";
            const details = r.leaveDetails?.length ? r.leaveDetails : [{ frmdt: r.from || r.from_date || r.ldate, nod: r.nod || 1, ltype: r.ltype || "", daydt: r.daydt || "" }];
            const subChip = (() => {
              let b = r.beforeSubmission ?? r.before_submission;
              let a = r.afterSubmission ?? r.after_submission;
              if (b == null && a == null) {
                const ld = new Date(r.ldate || r.entry); const fd = new Date(details[0]?.frmdt);
                if (!isNaN(ld) && !isNaN(fd)) { ld.setHours(0, 0, 0, 0); fd.setHours(0, 0, 0, 0); if (ld < fd) { b = 1; a = 0; } else { b = 0; a = 1; } }
              }
              return b === 1 ? { label: "Before", bg: "#e6f4ea", col: "#137333" } : b === 0 ? { label: "After", bg: "#fce8e6", col: "#a50e0e" } : { label: "—", bg: "#f1f3f4", col: "#5f6368" };
            })();
            const printLeave = () => { setLeavePreviewLno(r.id || r.lno); setLeavePreviewOpen(true); };
            return details.map((d, di) => {
              const isFirst = di === 0;
              const dayStr = fmtDate(d.frmdt);
              const days = d.nod || 1;
              const dayType = d.daydt || "—";
              return <TableRow key={`${r.id || r.lno}-${di}`} hover sx={{ bgcolor: isFirst ? "white" : "#f8faff" }}><TableCell sx={{ fontSize: 12, fontWeight: 700 }}>{isFirst ? (r.id || r.lno) : ""}</TableCell><TableCell sx={{ fontSize: 12, fontWeight: 600 }}>{isFirst ? fmtDateTime(r.ldate || r.entry) : ""}</TableCell><TableCell sx={{ fontSize: 12 }}>{dayStr}</TableCell><TableCell sx={{ fontSize: 12, maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={purpose}>{isFirst ? purpose : ""}</TableCell><TableCell sx={{ fontSize: 13, textAlign: "center" }}>{days}</TableCell><TableCell sx={{ fontSize: 12 }}>{dayType}</TableCell><TableCell>{isFirst ? <Chip size="small" label={subChip.label} sx={{ height: 18, fontSize: 11, fontWeight: 700, bgcolor: subChip.bg, color: subChip.col }} /> : null}</TableCell><TableCell>{isFirst ? <Chip size="small" label={c.label} sx={{ height: 18, fontSize: 11, fontWeight: 700, bgcolor: c.bg, color: c.col }} /> : null}</TableCell><TableCell sx={{ fontSize: 12, maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={reason}>{isFirst ? String(reason).slice(0, 30) : ""}</TableCell><TableCell>{isFirst ? <Tooltip title={isPayslipGenerated ? "Payslip generated - print disabled" : "Print"}><IconButton size="small" disabled={isPayslipGenerated} onClick={printLeave} sx={{ width: 26, height: 26, bgcolor: "white", border: "1px solid #e8eaed" }}><PrintIcon sx={{ fontSize: 14, color: theme.palette.primary.main }} /></IconButton></Tooltip> : null}</TableCell></TableRow>;
            });
          })}</TableBody></Table>
      );
    }
    if (selected === "payslips") return (
      <Table size="small" stickyHeader><TableHead><TableRow>{["Month / Year", "Net Pay", "Status", "Actions"].map(h => <TableCell key={h} sx={headSx}>{h}</TableCell>)}</TableRow></TableHead>
        <TableBody>{filtered.map((r, i) => {
          const c = statusChip(String(r.C_FINAL_STATUS ?? r.status ?? ""));
          return <TableRow key={i} hover><TableCell sx={{ fontSize: 13, fontWeight: 700 }}>{r.C_MONTH} {r.C_YEAR}</TableCell><TableCell sx={{ fontSize: 14, fontWeight: 800, color: "#202124" }}>{r.C_NET_AMT ? `₹${Number(r.C_NET_AMT).toLocaleString("en-IN")}` : "—"}</TableCell><TableCell><Chip size="small" label={c.label} sx={{ height: 18, fontSize: 11, fontWeight: 700, bgcolor: c.bg, color: c.col }} /></TableCell><TableCell><Stack direction="row" spacing={0.6}><Button size="small" variant="outlined" startIcon={<FaEye size={11} />} onClick={() => { setViewData(r); setViewOpen(true); }} sx={{ fontSize: 12, fontWeight: 700, height: 26, px: 1.1, borderRadius: 1 }}>View</Button><Button size="small" variant="contained" startIcon={<FaDownload size={11} />} onClick={() => downloadPayslip(r)} sx={{ fontSize: 12, fontWeight: 700, height: 26, px: 1.1, borderRadius: 1 }}>Slip</Button></Stack></TableCell></TableRow>;
        })}</TableBody></Table>
    );
    if (selected === "ot" || selected === "att-req") return (
      <Table size="small" stickyHeader><TableHead><TableRow>{["App No", "Date", "In", "Out", "Reason", "Status", "HR Decision"].map(h => <TableCell key={h} sx={headSx}>{h}</TableCell>)}</TableRow></TableHead>
        <TableBody>{filtered.map((r, idx) => {
          const c = statusChip(r.request_status);
          return <TableRow key={idx} hover><TableCell sx={{ fontSize: 12, fontWeight: 700 }}>{r.id || r.request_id || "—"}</TableCell><TableCell sx={{ fontSize: 13, fontWeight: 600 }}>{fmtDate(r.att_date)}</TableCell><TableCell sx={{ fontSize: 13 }}>{r.in_time?.slice(0, 5) || "—"}</TableCell><TableCell sx={{ fontSize: 13 }}>{r.out_time?.slice(0, 5) || "—"}</TableCell><TableCell sx={{ fontSize: 12, maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={r.reason || r.remarks || ""}>{r.reason || r.remarks || "—"}</TableCell><TableCell><Chip size="small" label={r.status || "—"} sx={{ height: 18, fontSize: 11 }} /></TableCell><TableCell><Chip size="small" label={c.label} sx={{ height: 18, fontSize: 11, fontWeight: 700, bgcolor: c.bg, color: c.col }} /></TableCell></TableRow>;
        })}</TableBody></Table>
    );
    if (selected === "onduty") return (
      <Table size="small" stickyHeader><TableHead><TableRow>{["App No", "Date", "Movement Date", "From", "To", "Hours", "Status", "Print"].map(h => <TableCell key={h} sx={headSx}>{h}</TableCell>)}</TableRow></TableHead>
        <TableBody>{filtered.map((r, i) => {
          const st = r.status || r.app_status || "Pending"; const c = statusChip(st);
          const open = () => { setAppPreviewType("onduty"); setAppPreviewData(r); setAppPreviewOpen(true); };
          return <TableRow key={i} hover><TableCell sx={{ fontSize: 13, fontWeight: 700 }}>{r.movement_id || r.id || "—"}</TableCell><TableCell sx={{ fontSize: 12 }}>{fmtDateTime(r.movement_date || r.created_at)}</TableCell><TableCell sx={{ fontSize: 12 }}>{fmtDate(r.act_date)}</TableCell><TableCell sx={{ fontSize: 12 }}>{r.perm_ftime ? String(r.perm_ftime).slice(0, 5) : "—"}</TableCell><TableCell sx={{ fontSize: 12 }}>{r.perm_ttime ? String(r.perm_ttime).slice(0, 5) : "—"}</TableCell><TableCell sx={{ fontSize: 12 }}>{r.no_of_hrs || "—"}</TableCell><TableCell><Chip size="small" label={c.label} sx={{ height: 18, fontSize: 11, fontWeight: 700, bgcolor: c.bg, color: c.col }} /></TableCell><TableCell><Tooltip title={isPayslipGenerated ? "Payslip generated - print disabled" : "Print"}><IconButton size="small" disabled={isPayslipGenerated} onClick={open} sx={{ width: 26, height: 26, bgcolor: "white", border: "1px solid #e8eaed" }}><PrintIcon sx={{ fontSize: 14, color: theme.palette.primary.main }} /></IconButton></Tooltip></TableCell></TableRow>;
        })}</TableBody></Table>
    );
    if (selected === "tour") return (
      <Table size="small" stickyHeader><TableHead><TableRow>{["App No", "Date", "From Date", "To Date", "Destination", "Status", "Print"].map(h => <TableCell key={h} sx={headSx}>{h}</TableCell>)}</TableRow></TableHead>
        <TableBody>{filtered.map((r, i) => {
          const st = r.status || "Pending"; const c = statusChip(st);
          const open = () => { setAppPreviewType("tour"); setAppPreviewData(r); setAppPreviewOpen(true); };
          return <TableRow key={i} hover><TableCell sx={{ fontSize: 13, fontWeight: 700 }}>{r.tour_id || r.id || "—"}</TableCell><TableCell sx={{ fontSize: 12 }}>{fmtDateTime(r.tour_date || r.created_at)}</TableCell><TableCell sx={{ fontSize: 12 }}>{fmtDateTime(r.tour_from_date)}</TableCell><TableCell sx={{ fontSize: 12 }}>{fmtDateTime(r.tour_to_date)}</TableCell><TableCell sx={{ fontSize: 12, maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={r.destination}>{r.destination || "—"}</TableCell><TableCell><Chip size="small" label={c.label} sx={{ height: 18, fontSize: 11, fontWeight: 700, bgcolor: c.bg, color: c.col }} /></TableCell><TableCell><Tooltip title={isPayslipGenerated ? "Payslip generated - print disabled" : "Print"}><IconButton size="small" disabled={isPayslipGenerated} onClick={open} sx={{ width: 26, height: 26, bgcolor: "white", border: "1px solid #e8eaed" }}><PrintIcon sx={{ fontSize: 14, color: theme.palette.primary.main }} /></IconButton></Tooltip></TableCell></TableRow>;
        })}</TableBody></Table>
    );
    if (selected === "shift") return (
      <Table size="small" stickyHeader><TableHead><TableRow>{["App No", "Date", "Actual Shift", "Change Shift", "From", "To", "Status", "Print"].map(h => <TableCell key={h} sx={headSx}>{h}</TableCell>)}</TableRow></TableHead>
        <TableBody>{filtered.map((r, i) => {
          const st = r.status || r.app_status || "Pending"; const c = statusChip(st);
          const open = () => { setAppPreviewType("shift"); setAppPreviewData(r); setAppPreviewOpen(true); };
          return <TableRow key={i} hover><TableCell sx={{ fontSize: 13, fontWeight: 700 }}>{r.schange_no || r.id || "—"}</TableCell><TableCell sx={{ fontSize: 12 }}>{fmtDateTime(r.schange_date || r.created_at)}</TableCell><TableCell sx={{ fontSize: 12 }}>{r.act_shift || "—"}</TableCell><TableCell sx={{ fontSize: 12 }}>{r.change_shift || "—"}</TableCell><TableCell sx={{ fontSize: 12 }}>{fmtDate(r.schange_from)}</TableCell><TableCell sx={{ fontSize: 12 }}>{fmtDate(r.schange_to)}</TableCell><TableCell><Chip size="small" label={c.label} sx={{ height: 18, fontSize: 11, fontWeight: 700, bgcolor: c.bg, color: c.col }} /></TableCell><TableCell><Tooltip title={isPayslipGenerated ? "Payslip generated - print disabled" : "Print"}><IconButton size="small" disabled={isPayslipGenerated} onClick={open} sx={{ width: 26, height: 26, bgcolor: "white", border: "1px solid #e8eaed" }}><PrintIcon sx={{ fontSize: 14, color: theme.palette.primary.main }} /></IconButton></Tooltip></TableCell></TableRow>;
        })}</TableBody></Table>
    );
    if (selected === "woff") return (
      <Table size="small" stickyHeader><TableHead><TableRow>{["App No", "Date", "Existing Date", "Changed Date", "Shift", "Status", "Print"].map(h => <TableCell key={h} sx={headSx}>{h}</TableCell>)}</TableRow></TableHead>
        <TableBody>{filtered.map((r, i) => {
          const st = r.status || "Pending"; const c = statusChip(st);
          const open = () => { setAppPreviewType("woff"); setAppPreviewData(r); setAppPreviewOpen(true); };
          return <TableRow key={i} hover><TableCell sx={{ fontSize: 13, fontWeight: 700 }}>{r.woff_id || r.id || "—"}</TableCell><TableCell sx={{ fontSize: 12 }}>{fmtDateTime(r.woff_date || r.created_at)}</TableCell><TableCell sx={{ fontSize: 12 }}>{fmtDate(r.woff_from_date)} {r.current_woff_day ? `(${r.current_woff_day})` : ""}</TableCell><TableCell sx={{ fontSize: 12 }}>{fmtDate(r.woff_to_date)} {r.requested_woff_day ? `(${r.requested_woff_day})` : ""}</TableCell><TableCell sx={{ fontSize: 12 }}>{r.shift_cd || "—"}</TableCell><TableCell><Chip size="small" label={c.label} sx={{ height: 18, fontSize: 11, fontWeight: 700, bgcolor: c.bg, color: c.col }} /></TableCell><TableCell><Tooltip title={isPayslipGenerated ? "Payslip generated - print disabled" : "Print"}><IconButton size="small" disabled={isPayslipGenerated} onClick={open} sx={{ width: 26, height: 26, bgcolor: "white", border: "1px solid #e8eaed" }}><PrintIcon sx={{ fontSize: 14, color: theme.palette.primary.main }} /></IconButton></Tooltip></TableCell></TableRow>;
        })}</TableBody></Table>
    );
    if (selected === "advance") return (
      <Table size="small" stickyHeader><TableHead><TableRow>{["App No", "Date", "Amount", "Installments", "Status", "Print"].map(h => <TableCell key={h} sx={headSx}>{h}</TableCell>)}</TableRow></TableHead>
        <TableBody>{filtered.map((r, i) => {
          const st = r.status || "Pending"; const c = statusChip(st);
          const open = () => { setAppPreviewType("advance"); setAppPreviewData(r); setAppPreviewOpen(true); };
          return <TableRow key={i} hover><TableCell sx={{ fontSize: 13, fontWeight: 700 }}>{r.advance_id || r.id || "—"}</TableCell><TableCell sx={{ fontSize: 12 }}>{fmtDateTime(r.advance_date || r.created_at)}</TableCell><TableCell sx={{ fontSize: 12, fontWeight: 600 }}>{r.advance_amount ? `₹${Number(r.advance_amount).toLocaleString("en-IN")}` : "—"}</TableCell><TableCell sx={{ fontSize: 12 }}>{r.no_of_installments || "—"}</TableCell><TableCell><Chip size="small" label={c.label} sx={{ height: 18, fontSize: 11, fontWeight: 700, bgcolor: c.bg, color: c.col }} /></TableCell><TableCell><Tooltip title={isPayslipGenerated ? "Payslip generated - print disabled" : "Print"}><IconButton size="small" disabled={isPayslipGenerated} onClick={open} sx={{ width: 26, height: 26, bgcolor: "white", border: "1px solid #e8eaed" }}><PrintIcon sx={{ fontSize: 14, color: theme.palette.primary.main }} /></IconButton></Tooltip></TableCell></TableRow>;
        })}</TableBody></Table>
    );
    if (selected === "esileave") return (
      <Table size="small" stickyHeader><TableHead><TableRow>{["App No", "Date", "From", "To", "Status", "Print"].map(h => <TableCell key={h} sx={headSx}>{h}</TableCell>)}</TableRow></TableHead>
        <TableBody>{filtered.map((r, i) => {
          const st = r.status || "Pending"; const c = statusChip(st);
          const open = () => { setAppPreviewType("esileave"); setAppPreviewData(r); setAppPreviewOpen(true); };
          return <TableRow key={i} hover><TableCell sx={{ fontSize: 13, fontWeight: 700 }}>{r.esi_id || r.id || "—"}</TableCell><TableCell sx={{ fontSize: 12 }}>{fmtDateTime(r.created_at || r.esi_date || r.from_date)}</TableCell><TableCell sx={{ fontSize: 12 }}>{fmtDate(r.from_date || r.esi_from)}</TableCell><TableCell sx={{ fontSize: 12 }}>{fmtDate(r.to_date || r.esi_to)}</TableCell><TableCell><Chip size="small" label={c.label} sx={{ height: 18, fontSize: 11, fontWeight: 700, bgcolor: c.bg, color: c.col }} /></TableCell><TableCell><Tooltip title={isPayslipGenerated ? "Payslip generated - print disabled" : "Print"}><IconButton size="small" disabled={isPayslipGenerated} onClick={open} sx={{ width: 26, height: 26, bgcolor: "white", border: "1px solid #e8eaed" }}><PrintIcon sx={{ fontSize: 14, color: theme.palette.primary.main }} /></IconButton></Tooltip></TableCell></TableRow>;
        })}</TableBody></Table>
    );
    if (selected === "musterroll") {
      const dim = new Date(year, month, 0).getDate();
      const getShort = (s) => { if (!s) return ""; if (s === "Present") return "P"; if (s === "Half Day") return "F"; if (s === "Absent") return "A"; if (s === "LOP") return "L"; if (String(s).startsWith("W-Off")) return "W"; if (String(s).startsWith("Holiday")) return "H"; return String(s); };
      const getClr = (sh) => ({ P: { bg: "#e8f5e9", col: "#2e7d32" }, F: { bg: "#fff3e0", col: "#e65100" }, A: { bg: "#ffebee", col: "#c62828" }, H: { bg: "#e3f2fd", col: "#1565c0" }, W: { bg: "#f3e5f5", col: "#7b1fa2" }, CL: { bg: "#fff8e1", col: "#f57f17" }, EL: { bg: "#e0f2f1", col: "#00695c" } }[sh] || { bg: "#fff", col: "#333" });
      const byDay = {}; filtered.forEach(r => { const d = new Date(r.att_date).getDate(); if (d >= 1 && d <= dim) byDay[d] = r; });
      const statuses = Array.from({ length: dim }, (_, i) => getShort(byDay[i + 1]?.status || ""));
      const display = statuses.map((s, i) => { if (s !== "W" && s !== "H") return s; const prev = i > 0 && ["P", "F", "FC", "FE", "FL"].includes(statuses[i - 1]); const next = i < dim - 1 && ["P", "F", "FC", "FE", "FL"].includes(statuses[i + 1]); return prev || next ? s : "A"; });
      let p = 0, h = 0, w = 0, cl = 0, el = 0, lop = 0, ot = 0; display.forEach((d, i) => { const s = statuses[i]; const r = byDay[i + 1]; if (s === "P") p++; else if (s === "F") p += 0.5; if (d === "H") h++; if (d === "W") w++; else if (s === "W" && d === "A") lop++; if (s === "CL") cl++; if (s === "EL") el++; if (s === "L") lop++; const approved = r && (r.ot_status === "Approved" || r.ot_approved == 1 || r.app_status === "Approved" || r.hr_app_status === "Approved" || r.is_ot_approved == 1 || r.ot_approved_status === "Approved"); if (approved && r?.ot_hrs) ot += Number(r.ot_hrs); }); const total = p + h + w + cl + el;
      return (
        <Box sx={{ overflowX: "auto" }}>
          <Table size="small" stickyHeader sx={{ minWidth: 900, "& th, & td": { borderRight: "1px solid #e8eaed", borderBottom: "1px solid #e8eaed", padding: "4px 6px", fontSize: "11px", textAlign: "center" } }}>
            <TableHead><TableRow><TableCell sx={{ ...headSx, minWidth: 80 }}>Emp ID</TableCell><TableCell sx={{ ...headSx, minWidth: 140 }}>Name</TableCell>{Array.from({ length: dim }, (_, i) => <TableCell key={i} align="center" sx={{ ...headSx, minWidth: 32 }}>{String(i + 1).padStart(2, "0")}</TableCell>)}<TableCell sx={{ ...headSx, bgcolor: "#e8f5e9", minWidth: 50 }} align="center">PRESENT</TableCell><TableCell sx={{ ...headSx, bgcolor: "#e3f2fd", minWidth: 40 }} align="center">H/W</TableCell><TableCell sx={{ ...headSx, bgcolor: "#fff8e1", minWidth: 35 }} align="center">CL</TableCell><TableCell sx={{ ...headSx, bgcolor: "#e0f2f1", minWidth: 35 }} align="center">EL</TableCell><TableCell sx={{ ...headSx, bgcolor: "#ffcdd2", minWidth: 40 }} align="center">LOP</TableCell><TableCell sx={{ ...headSx, bgcolor: "#eceff1", minWidth: 45 }} align="center">TOTAL</TableCell><TableCell sx={{ ...headSx, bgcolor: "#fff9c4", minWidth: 40 }} align="center">OT</TableCell></TableRow>
              <TableRow>{Array.from({ length: dim + 2 }, (_, i) => <TableCell key={i} sx={{ ...headSx, py: 0.5, fontSize: 9 }} align="center">{i < 2 ? "" : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][new Date(year, month - 1, i - 1).getDay()]}</TableCell>)}<TableCell colSpan={7} sx={headSx}></TableCell></TableRow></TableHead>
            <TableBody>
              <TableRow hover><TableCell sx={{ fontSize: 12, fontWeight: 700 }}>{empid}</TableCell><TableCell sx={{ fontSize: 12 }}>{empName}</TableCell>{display.map((d, i) => { const c = getClr(d); return <TableCell key={i} align="center" sx={{ bgcolor: c.bg, color: c.col, fontWeight: 700 }}>{d || "-"}</TableCell>; })}<TableCell align="center" sx={{ bgcolor: "#e8f5e9", fontWeight: 700 }}>{p}</TableCell><TableCell align="center" sx={{ bgcolor: "#e3f2fd", fontWeight: 700 }}>{h + w}</TableCell><TableCell align="center" sx={{ bgcolor: "#fff8e1", fontWeight: 700 }}>{cl}</TableCell><TableCell align="center" sx={{ bgcolor: "#e0f2f1", fontWeight: 700 }}>{el}</TableCell><TableCell align="center" sx={{ bgcolor: "#ffcdd2", fontWeight: 700 }}>{lop}</TableCell><TableCell align="center" sx={{ bgcolor: "#eceff1", fontWeight: 700 }}>{total}</TableCell><TableCell align="center" sx={{ bgcolor: "#fff9c4", fontWeight: 700 }}>{ot.toFixed(1)}</TableCell></TableRow>
              <TableRow><TableCell colSpan={2} align="right" sx={{ fontSize: 11, fontWeight: 700, bgcolor: "#fff3e0" }}>OT</TableCell>{Array.from({ length: dim }, (_, i) => { const r = byDay[i + 1]; const approved = r && (r.ot_status === "Approved" || r.ot_approved == 1 || r.app_status === "Approved" || r.hr_app_status === "Approved" || r.is_ot_approved == 1 || r.ot_approved_status === "Approved"); const v = approved && r?.ot_hrs ? Number(r.ot_hrs).toFixed(1) : ""; return <TableCell key={i} align="center" sx={{ fontSize: 10, color: "#e65100", bgcolor: v ? "#ffe0b2" : "inherit" }}>{v}</TableCell>; })}<TableCell colSpan={7}></TableCell></TableRow>
            </TableBody></Table>
        </Box>
      );
    }
    if (selected === "ot-register") {
      const dim = new Date(year, month, 0).getDate();
      const byDay = {}; filtered.forEach(r => { const d = new Date(r.att_date).getDate(); if (d >= 1 && d <= dim) byDay[d] = r; });
      const isApproved = (r) => r && (r.ot_status === "Approved" || r.ot_approved == 1 || r.app_status === "Approved" || r.hr_app_status === "Approved" || r.is_ot_approved == 1 || r.ot_approved_status === "Approved");
      let totActual = 0, totApproved = 0; Object.values(byDay).forEach(r => { if (r?.ot_hrs) totActual += Number(r.ot_hrs); if (isApproved(r) && r?.ot_hrs) totApproved += Number(r.ot_hrs); });
      return (
        <Box sx={{ overflowX: "auto" }}>
          <Table size="small" stickyHeader sx={{ minWidth: 800, "& th, & td": { borderRight: "1px solid #e8eaed", borderBottom: "1px solid #e8eaed", padding: "4px 6px", fontSize: "11px", textAlign: "center" } }}>
            <TableHead><TableRow><TableCell sx={headSx}>Emp ID</TableCell><TableCell sx={headSx}>Name</TableCell><TableCell sx={headSx}>Type</TableCell>{Array.from({ length: dim }, (_, i) => <TableCell key={i} align="center" sx={headSx}>{String(i + 1).padStart(2, "0")}</TableCell>)}<TableCell sx={{ ...headSx, bgcolor: "#fff9c4", display: otView === "actual" ? "none" : "table-cell" }} align="center">Approved OT</TableCell><TableCell sx={{ ...headSx, bgcolor: "#e0f2f1", display: otView === "approved" ? "none" : "table-cell" }} align="center">Actual OT</TableCell></TableRow></TableHead>
            <TableBody>
              <TableRow><TableCell colSpan={3 + dim + 2} sx={{ p: 0 }}><Box sx={{ display: "flex", gap: 0.8, px: 1, py: 0.6, bgcolor: "#f8f9fa", alignItems: "center" }}><Chip size="small" label={`Approved: ${totApproved.toFixed(2)}h`} sx={{ height: 20, fontWeight: 700, bgcolor: "#fff9c4", color: "#a65c00", display: otView === "actual" ? "none" : "flex" }} /><Chip size="small" label={`Actual: ${totActual.toFixed(2)}h`} sx={{ height: 20, fontWeight: 700, bgcolor: "#e0f2f1", color: "#00695c", display: otView === "approved" ? "none" : "flex" }} /><Select size="small" value={otView} onChange={e => setOtView(e.target.value)} sx={{ height: 24, fontSize: 11, bgcolor: "white", ml: 1 }}><MenuItem value="both" sx={{ fontSize: 11 }}>Both</MenuItem><MenuItem value="approved" sx={{ fontSize: 11 }}>Approved only</MenuItem><MenuItem value="actual" sx={{ fontSize: 11 }}>Actual only</MenuItem></Select><Box sx={{ flex: 1 }} /></Box></TableCell></TableRow>
              <TableRow hover sx={{ display: otView === "actual" ? "none" : "table-row" }}><TableCell sx={{ fontSize: 12, fontWeight: 700 }} rowSpan={otView === "both" ? 2 : 1}>{empid}</TableCell><TableCell sx={{ fontSize: 12 }} rowSpan={otView === "both" ? 2 : 1}>{empName}</TableCell><TableCell sx={{ fontSize: 11, fontWeight: 600, color: "#a65c00" }}>Approved</TableCell>{Array.from({ length: dim }, (_, i) => { const r = byDay[i + 1]; const v = isApproved(r) && r?.ot_hrs ? Number(r.ot_hrs).toFixed(2) : ""; return <TableCell key={i} align="center" sx={{ color: "#a65c00", bgcolor: v ? "#fff9c4" : "inherit", fontSize: 11, fontWeight: 700 }}>{v || "-"}</TableCell>; })}<TableCell align="center" sx={{ bgcolor: "#fff9c4", fontWeight: 800, display: otView === "actual" ? "none" : "table-cell" }}>{totApproved.toFixed(2)}</TableCell><TableCell align="center" sx={{ bgcolor: "#e0f2f1", fontWeight: 800, display: otView === "approved" ? "none" : "table-cell" }}>-</TableCell></TableRow>
              <TableRow hover sx={{ display: otView === "approved" ? "none" : "table-row" }}><TableCell sx={{ fontSize: 11, fontWeight: 600, color: "#00695c" }}>Actual</TableCell>{Array.from({ length: dim }, (_, i) => { const r = byDay[i + 1]; const v = r?.ot_hrs ? Number(r.ot_hrs).toFixed(2) : ""; return <TableCell key={i} align="center" sx={{ color: "#00695c", bgcolor: v ? "#e0f2f1" : "inherit", fontSize: 11 }}>{v || "-"}</TableCell>; })}<TableCell align="center" sx={{ bgcolor: "#fff9c4", fontWeight: 700, display: otView === "actual" ? "none" : "table-cell" }}>-</TableCell><TableCell align="center" sx={{ bgcolor: "#e0f2f1", fontWeight: 800, display: otView === "approved" ? "none" : "table-cell" }}>{totActual.toFixed(2)}</TableCell></TableRow>
            </TableBody></Table>
        </Box>
      );
    }
    if (selected === "movement") {
      const groups = {};
      filtered.forEach(r => { const d = fmtDate(r.att_date) || "—"; const k = `${empid}|${empName}|${d}|${r.shift || "—"}`; (groups[k] = groups[k] || []).push(r); });
      const keys = Object.keys(groups).sort();
      const empGroups = {};
      filtered.forEach(r => { const d = fmtDate(r.att_date) || "—"; const empK = `${empid}|${empName}`; if (!empGroups[empK]) empGroups[empK] = { eId: empid, eName: empName, shifts: {} }; const sK = `${d}|${r.shift || "—"}`; if (!empGroups[empK].shifts[sK]) empGroups[empK].shifts[sK] = []; empGroups[empK].shifts[sK].push(r); });
      const empKeys = Object.keys(empGroups);
      return (
        <Table size="small" stickyHeader sx={{ "& th, & td": { textAlign: "center" } }}><TableHead><TableRow>{["Sl.No", "Emp ID", "Name", "Date", "Shift", "Punch Time", "Status", "Count"].map(h => <TableCell key={h} sx={headSx}>{h}</TableCell>)}</TableRow></TableHead>
          <TableBody>{filtered.length === 0 ? <TableRow><TableCell colSpan={8} align="center" sx={{ py: 3, color: "#9e9e9e" }}>No movements</TableCell></TableRow> : empKeys.map((empK, empIdx) => {
            const emp = empGroups[empK]; const shiftKeys = Object.keys(emp.shifts).sort();
            const empTotalPunches = shiftKeys.reduce((s, sk) => { let c = 0; emp.shifts[sk].forEach(r => { if (r.in_time) c++; if (r.lunch_out) c++; if (r.lunch_in) c++; if (r.out_time) c++; if (r.punch_time) c++; }); return s + (c || 1); }, 0);
            let firstEmpRow = true;
            return shiftKeys.map((sK, sIdx) => {
              const [eDate, eShift] = sK.split("|"); const rows = emp.shifts[sK];
              const punches = []; rows.forEach(r => { if (r.in_time) punches.push(r.in_time.slice(0, 5)); if (r.lunch_out) punches.push(r.lunch_out.slice(0, 5)); if (r.lunch_in) punches.push(r.lunch_in.slice(0, 5)); if (r.out_time) punches.push(r.out_time.slice(0, 5)); if (r.punch_time) punches.push(String(r.punch_time).slice(0, 5)); });
              const rawCount = punches.length; if (rawCount === 0) punches.push("—");
              const shiftTimings = rows[0]?.shift_start && rows[0]?.shift_end ? `${rows[0].shift_start.slice(0, 5)} - ${rows[0].shift_end.slice(0, 5)}` : rows[0]?.shift_timings || rows[0]?.shift_time || "";
              return punches.map((p, i) => {
                const isFirstEmp = firstEmpRow && i === 0;
                if (i === 0) firstEmpRow = false;
                return <TableRow key={`${sK}-${i}`} hover sx={{ bgcolor: (sIdx === 0 && i === 0) ? alpha(theme.palette.primary.main, 0.04) : "white", borderTop: i === 0 ? "1px solid #e8eaed" : "none" }}><TableCell sx={{ fontSize: 12 }}>{isFirstEmp ? empIdx + 1 : ""}</TableCell><TableCell sx={{ fontSize: 12, fontWeight: 700 }}>{isFirstEmp ? <Box><Typography sx={{ fontSize: 12, fontWeight: 800 }}>{emp.eId}</Typography></Box> : ""}</TableCell><TableCell sx={{ fontSize: 12 }}>{isFirstEmp ? emp.eName : ""}</TableCell><TableCell sx={{ fontSize: 12 }}>{i === 0 ? eDate : ""}</TableCell><TableCell sx={{ p: 0.6 }}>{i === 0 ? <Box><Typography sx={{ fontSize: 11, fontWeight: 700, lineHeight: 1 }}>{eShift}</Typography>{shiftTimings && <Typography sx={{ fontSize: 10, color: "#5f6368", lineHeight: 1 }}>{shiftTimings}</Typography>}</Box> : ""}</TableCell><TableCell sx={{ fontSize: 12, fontWeight: 700 }}>{p}</TableCell><TableCell align="center">{i === 0 ? <Chip size="small" label={rows[0]?.status || "—"} sx={{ height: 18, fontSize: 11, bgcolor: statusChip(rows[0]?.status).bg, color: statusChip(rows[0]?.status).col }} /> : ""}</TableCell><TableCell align="center" sx={{ fontSize: 12, fontWeight: 800, bgcolor: i === 0 ? "#f1f3f4" : "white" }}>{i === 0 ? (rawCount === 0 ? "—" : rawCount) : ""}</TableCell></TableRow>;
              });
            }).flat();
          }).flat()}</TableBody></Table>
      );
    }
    if (selected === "onduty-movement") {
      const empGroups = {}; filtered.forEach(r => { const empK = `${r.empid || empid}|${r.ename || empName}`; if (!empGroups[empK]) empGroups[empK] = { eId: r.empid || empid, eName: r.ename || empName, byStatus: {} }; const k = String(r.status || "Pending").toLowerCase(); if (!empGroups[empK].byStatus[k]) empGroups[empK].byStatus[k] = []; empGroups[empK].byStatus[k].push(r); });
      const order = ["pending", "approved", "rejected"];
      return (
        <Table size="small" stickyHeader sx={{ minWidth: 1100, "& th, & td": { whiteSpace: "nowrap", textAlign: "center" } }}><TableHead><TableRow>{["Sl.No", "Emp ID", "Name", "Movement ID", "Entry Date", "Actual Mov. Date", "From Time", "To Time", "Place", "Purpose", "Status"].map(h => <TableCell key={h} sx={headSx}>{h}</TableCell>)}</TableRow></TableHead>
          <TableBody>{filtered.length === 0 ? <TableRow><TableCell colSpan={11} align="center" sx={{ py: 3, color: "#9e9e9e" }}>No movements</TableCell></TableRow> : Object.keys(empGroups).sort().map(empK => {
            const emp = empGroups[empK]; let sno = 1; let empFirstRow = true;
            return (
              <React.Fragment key={empK}>
                {Object.keys(emp.byStatus).sort((a, b) => order.indexOf(a) - order.indexOf(b)).map(k => {
                  const c = statusChip(k); return (
                    <React.Fragment key={k}>
                      <TableRow sx={{ bgcolor: c.bg }}><TableCell colSpan={11} sx={{ fontSize: 11, fontWeight: 700, color: c.col, py: 0.5, pl: 2 }}>{c.label} — {emp.byStatus[k].length}</TableCell></TableRow>
                      {emp.byStatus[k].map((r) => { const cc = statusChip(r.status); const showEmp = empFirstRow; if (empFirstRow) empFirstRow = false; const entry = r.created || r.created_at || r.created_dt || r.entry_date || r.applied_date || r.movement_created || r.od_created; const row = <TableRow key={r.movement_id || r.id} hover><TableCell sx={{ fontSize: 12, textAlign: "center" }}>{sno++}</TableCell><TableCell sx={{ fontSize: 12, fontWeight: 600 }}>{showEmp ? emp.eId : ""}</TableCell><TableCell sx={{ fontSize: 12 }}>{showEmp ? emp.eName : ""}</TableCell><TableCell sx={{ fontSize: 12, fontWeight: 700 }}>{r.movement_id || r.id || "—"}</TableCell><TableCell sx={{ fontSize: 11 }}>{entry ? fmtDateTime(entry) : fmtDateTime(r.movement_date || r.act_date)}</TableCell><TableCell sx={{ fontSize: 12 }}>{fmtDate(r.movement_date || r.act_date || r.actual_date)}</TableCell><TableCell sx={{ fontSize: 12 }}>{String(r.perm_ftime || r.from_time || r.ftime || "").slice(0, 5) || "—"}</TableCell><TableCell sx={{ fontSize: 12 }}>{String(r.perm_ttime || r.to_time || r.ttime || "").slice(0, 5) || "—"}</TableCell><TableCell sx={{ fontSize: 12, maxWidth: 100, overflow: "hidden", textOverflow: "ellipsis" }} title={r.place || r.location || ""}>{r.place || r.location || "—"}</TableCell><TableCell sx={{ fontSize: 12, maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis" }} title={r.purpose || r.reason || ""}>{r.purpose || r.reason || "—"}</TableCell><TableCell><Chip size="small" label={cc.label} sx={{ height: 18, fontSize: 11, fontWeight: 700, bgcolor: cc.bg, color: cc.col }} /></TableCell></TableRow>; return row; })}
                    </React.Fragment>
                  );
                })}
              </React.Fragment>
            );
          })}</TableBody></Table>
      );
    }
    if (selected === "att-percentage") {
      let sd = parseDDMONRR(startDate); if (!sd && startDate) { const p = startDate.split("-"); if (p.length===3) { const d = new Date(`${p[2]}-${p[1]}-${p[0]}`); if(!isNaN(d)) sd=d; else if (/^\d{4}-\d{2}-\d{2}$/.test(startDate)) sd=new Date(startDate); } }
      let ed = parseDDMONRR(endDate); if (!ed && endDate) { const p = endDate.split("-"); if (p.length===3) { let d=null; if (p[0].length===4) d=new Date(endDate); else d=new Date(`${p[2]}-${p[1]}-${p[0]}`); if(d && !isNaN(d)) { ed=d; ed.setHours(23,59,59,999); } } }
      let rangeData = data;
      if (sd || ed) {
        rangeData = data.filter(o => {
          const d = new Date(o.att_date); if (isNaN(d)) return false;
          if (sd && d < sd) return false;
          if (ed && d > ed) return false;
          return true;
        });
      }
      const groups = {};
      rangeData.forEach(r => {
        const d = new Date(r.att_date); if (isNaN(d)) return;
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        if (!groups[key]) groups[key] = { year: d.getFullYear(), month: d.getMonth(), present: 0, woff: 0 };
        const st = String(r.status || "").toLowerCase().trim();
        if (st.includes("woff") || st.includes("wo") || st.includes("weekly") || st.includes("w/o")) groups[key].woff += 1;
        else if (st.includes("present") || st === "p" || st === "w" || st.includes("full") || st === "f" || st === "fd" || st.includes("od") || st.includes("tour")) groups[key].present += 1;
        else if (st.includes("half") || st === "0.5" || st === "h") groups[key].present += 0.5;
      });
      const holidays = store.holidays || [];
      const sortedKeys = Object.keys(groups).sort();
      let rows = sortedKeys.map(k => {
        const g = groups[k];
        const dim = new Date(g.year, g.month + 1, 0).getDate();
        const holCount = holidays.filter(h => {
          const hd = new Date(h.hdate || h.holiday_date || h.date); return !isNaN(hd) && hd.getMonth() === g.month && hd.getFullYear() === g.year;
        }).length;
        const working = dim;
        const pct = working ? ((g.present / working) * 100).toFixed(1) : "0.0";
        return { label: `${MONTHS[g.month].label} ${g.year}`, working, present: g.present, pct, holidays: holCount, dim };
      });
      if (!rows.length) {
        const dim = new Date(year, month, 0).getDate();
        const holCount = holidays.filter(h => {
          const hd = new Date(h.hdate || h.holiday_date || h.date); return !isNaN(hd) && hd.getMonth() + 1 === month && hd.getFullYear() === year;
        }).length;
        const working = dim;
        const fromLabel = sd && ed ? `${fmtDate(sd)} to ${fmtDate(ed)}` : `${MONTHS[month - 1].label} ${year}`;
        rows = [{ label: fromLabel, working, present: 0, pct: "0.0", holidays: holCount, dim, woff: 0 }];
      }
      const totalWorking = rows.reduce((s, r) => s + r.working, 0);
      const totalPresent = rows.reduce((s, r) => s + Number(r.present), 0);
      const totalHolidays = rows.reduce((s, r) => s + (r.holidays || 0), 0);
      const totalDim = rows.reduce((s, r) => s + (r.dim || 0), 0);
      const overall = totalWorking ? ((totalPresent / totalWorking) * 100).toFixed(1) : "0.0";
      return (
        <Table size="small" stickyHeader sx={{ "& th, & td": { textAlign: "center", border: "1px solid #e8eaed" } }}><TableHead><TableRow><TableCell sx={{ ...headSx, bgcolor: "#f8f9fa" }}>Metric \ Month</TableCell>{rows.map(r => <TableCell key={r.label} sx={{ ...headSx, bgcolor: "#e8f0fe" }}>{r.label}</TableCell>)}<TableCell sx={{ ...headSx, bgcolor: "#e3f2fd", fontWeight: 800 }}>Overall</TableCell></TableRow></TableHead>
          <TableBody>
            <TableRow hover><TableCell sx={{ fontSize: 12, fontWeight: 700, bgcolor: "#f8f9fa", textAlign: "left" }}>Company Working Days</TableCell>{rows.map((r, i) => <TableCell key={i} sx={{ fontSize: 12 }}>{r.working}</TableCell>)}<TableCell sx={{ fontSize: 12, fontWeight: 800, bgcolor: "#e3f2fd" }}>{totalWorking}</TableCell></TableRow>
            <TableRow hover><TableCell sx={{ fontSize: 12, fontWeight: 700, bgcolor: "#f8f9fa", textAlign: "left" }}>Employee Present Days</TableCell>{rows.map((r, i) => <TableCell key={i} sx={{ fontSize: 12, fontWeight: 700 }}>{r.present}</TableCell>)}<TableCell sx={{ fontSize: 12, fontWeight: 800, bgcolor: "#e3f2fd" }}>{totalPresent}</TableCell></TableRow>
            <TableRow hover><TableCell sx={{ fontSize: 12, fontWeight: 700, bgcolor: "#f8f9fa", textAlign: "left" }}>Attendance %</TableCell>{rows.map((r, i) => <TableCell key={i} sx={{ fontSize: 12, fontWeight: 800, color: Number(r.pct) >= 75 ? "#137333" : Number(r.pct) >= 50 ? "#e37400" : "#a50e0e" }}>{r.pct}%</TableCell>)}<TableCell sx={{ fontSize: 12, fontWeight: 800, bgcolor: "#e3f2fd", color: Number(overall) >= 75 ? "#137333" : "#a50e0e" }}>{overall}%</TableCell></TableRow>
          </TableBody></Table>
      );
    }
    if (selected === "attendance-log") {
      const cols = ["Date", "In", "Out", "Status", "Hours"];
      return (
        <Table size="small" stickyHeader sx={{ "& th, & td": { textAlign: "center" } }}><TableHead><TableRow>{cols.map(h => <TableCell key={h} sx={headSx}>{h}</TableCell>)}</TableRow></TableHead>
          <TableBody>{filtered.length === 0 ? <TableRow><TableCell colSpan={cols.length} align="center" sx={{ py: 3, color: "#9e9e9e" }}>No records for {selectedMeta?.label}</TableCell></TableRow> : filtered.slice(0, 30).map((r, i) => <TableRow key={i} hover><TableCell sx={{ fontSize: 12 }}>{fmtDate(r.att_date)}</TableCell><TableCell sx={{ fontSize: 12 }}>{r.in_time?.slice(0, 5) || "—"}</TableCell><TableCell sx={{ fontSize: 12 }}>{r.out_time?.slice(0, 5) || "—"}</TableCell><TableCell><Chip size="small" label={r.status || "—"} sx={{ height: 18, fontSize: 11 }} /></TableCell><TableCell sx={{ fontSize: 12 }}>{r.work_hrs || r.ot_hrs || "—"}</TableCell></TableRow>)}</TableBody></Table>
      );
    }
    if (["leaves-info", "encashment"].includes(selected)) {
      const r = leaveBal || filtered[0] || store["leaves-info"]?.[0] || store["encashment"]?.[0] || {};
      const isEmpty = !r || Object.keys(r).length === 0 || (r.cls_balance == null && r.clsBalance == null && r.els_balance == null);
      const clsBal = Number(r.cls_balance ?? r.clsBalance ?? r.clBal ?? 0);
      const clsAv = Number(r.cls_utilised ?? r.clsUtilised ?? r.cls_utilized ?? 0);
      const clsEl = Number(r.cls_eligible ?? r.clsEligible ?? (r.cls_balance != null || r.clsBalance != null ? clsBal + clsAv : 0));
      const elsBal = Number(r.els_balance ?? r.elsBalance ?? r.elBal ?? 0);
      const elsAv = Number(r.els_utilised ?? r.elsUtilised ?? r.els_utilized ?? 0);
      const elsEl = Number(r.els_eligible ?? r.elsEligible ?? (r.els_balance != null || r.elsBalance != null ? elsBal + elsAv : 0));
      return (
        <Table size="small" stickyHeader sx={{ "& th, & td": { textAlign: "center", border: "1px solid #e8eaed" }, minWidth: 900 }}><TableHead>
          <TableRow>
            <TableCell sx={{ ...headSx, whiteSpace: "nowrap" }} rowSpan={2}>Emp ID</TableCell>
            <TableCell sx={{ ...headSx, whiteSpace: "nowrap" }} rowSpan={2}>Name</TableCell>
            <TableCell sx={{ ...headSx, whiteSpace: "nowrap", bgcolor: "#e8f5e9" }} colSpan={3}>CL</TableCell>
            <TableCell sx={{ ...headSx, whiteSpace: "nowrap", bgcolor: "#e3f2fd" }} colSpan={3}>EL</TableCell>
            <TableCell sx={{ ...headSx, whiteSpace: "nowrap" }} rowSpan={2}>Total Balance</TableCell>
          </TableRow>
          <TableRow>
            <TableCell sx={{ ...headSx, whiteSpace: "nowrap", bgcolor: "#e8f5e9" }}>Eligible</TableCell>
            <TableCell sx={{ ...headSx, whiteSpace: "nowrap", bgcolor: "#e8f5e9" }}>Availed</TableCell>
            <TableCell sx={{ ...headSx, whiteSpace: "nowrap", bgcolor: "#e8f5e9" }}>Balance</TableCell>
            <TableCell sx={{ ...headSx, whiteSpace: "nowrap", bgcolor: "#e3f2fd" }}>Eligible</TableCell>
            <TableCell sx={{ ...headSx, whiteSpace: "nowrap", bgcolor: "#e3f2fd" }}>Availed</TableCell>
            <TableCell sx={{ ...headSx, whiteSpace: "nowrap", bgcolor: "#e3f2fd" }}>Balance</TableCell>
          </TableRow>
        </TableHead>
          <TableBody>{isEmpty ? <TableRow><TableCell colSpan={9} align="center" sx={{ py: 3, color: "#9e9e9e" }}>No leave info</TableCell></TableRow> : <TableRow hover><TableCell sx={{ fontSize: 12, fontWeight: 700 }}>{r.empid || r.gempid || empid}</TableCell><TableCell sx={{ fontSize: 12 }}>{r.ename || r.empname || empName}</TableCell><TableCell sx={{ fontSize: 12 }}>{clsEl.toString()}</TableCell><TableCell sx={{ fontSize: 12 }}>{clsAv.toString()}</TableCell><TableCell sx={{ fontSize: 12, fontWeight: 700, color: "#137333" }}>{clsBal.toString()}</TableCell><TableCell sx={{ fontSize: 12 }}>{elsEl.toString()}</TableCell><TableCell sx={{ fontSize: 12 }}>{elsAv.toString()}</TableCell><TableCell sx={{ fontSize: 12, fontWeight: 700, color: "#137333" }}>{elsBal.toString()}</TableCell><TableCell sx={{ fontSize: 13, fontWeight: 800, bgcolor: "#e8f5e9" }}>{Number(clsBal + elsBal).toString()}</TableCell></TableRow>}</TableBody></Table>
      );
    }
    if (selected === "holidays") {
      const today = new Date(); today.setHours(0, 0, 0, 0);
      // Deduplicate by date to avoid showing the same holiday more than once
      const seen = new Set();
      const unique = filtered.filter(r => {
        const key = r.hdate || r.holiday_date || r.date;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
      unique.sort((a, b) => new Date(a.hdate || a.holiday_date || a.date) - new Date(b.hdate || b.holiday_date || b.date));
      const display = unique.slice(0, 10);
      return (
        <Table size="small" stickyHeader><TableHead><TableRow>{["SNo", "Date", "Occasion", "Day", "Year", "Remarks"].map(h => <TableCell key={h} sx={headSx}>{h}</TableCell>)}</TableRow></TableHead>
          <TableBody>{display.length === 0 ? <TableRow><TableCell colSpan={6} align="center" sx={{ py: 3, color: "#9e9e9e" }}>No holidays</TableCell></TableRow> : display.map((r, i) => {
            const d = new Date(r.hdate || r.holiday_date || r.date); const today = new Date(); today.setHours(0, 0, 0, 0);
            const isPast = !isNaN(d) && d < today;
            return <TableRow key={`${r.hno || i}-${r.hdate}`} hover sx={{ bgcolor: isPast ? "#eeeeee" : "#e6f4ea" }}><TableCell sx={{ fontSize: 12, textAlign: "center" }}>{i + 1}</TableCell><TableCell sx={{ fontSize: 12 }}>{fmtDate(r.hdate)}</TableCell><TableCell sx={{ fontSize: 12 }}>{r.hdesc || r.occasion || r.name || "—"}</TableCell><TableCell sx={{ fontSize: 12 }}>{r.hday || (!isNaN(d) ? d.toLocaleDateString("en-US", { weekday: "short" }) : "—")}</TableCell><TableCell sx={{ fontSize: 12, textAlign: "center" }}>{r.yr || d.getFullYear()}</TableCell><TableCell sx={{ fontSize: 12 }}>{r.hremarks || r.remarks || "—"}</TableCell></TableRow>;
          })}</TableBody></Table>
      );
    }
    if (selected === "increment") {
      return (
        <Table size="small" stickyHeader><TableHead><TableRow>{["Date", "Type", "Amount", "Status", "Remarks"].map(h => <TableCell key={h} sx={headSx}>{h}</TableCell>)}</TableRow></TableHead>
          <TableBody>{filtered.length === 0 ? <TableRow><TableCell colSpan={5} align="center" sx={{ py: 3, color: "#9e9e9e" }}>No increments</TableCell></TableRow> : filtered.slice(0, 20).map((r, i) => (
            <TableRow key={i} hover><TableCell sx={{ fontSize: 12 }}>{fmtDate(r.effective_date || r.date || r.C_MONTH)}</TableCell><TableCell sx={{ fontSize: 12 }}>{r.type || r.increment_type || "—"}</TableCell><TableCell sx={{ fontSize: 12, fontWeight: 700 }}>{r.amount ? `₹${Number(r.amount).toLocaleString("en-IN")}` : r.C_BASIC ? `₹${r.C_BASIC}` : "—"}</TableCell><TableCell><Chip size="small" label={r.status || "Approved"} sx={{ height: 18, fontSize: 11 }} /></TableCell><TableCell sx={{ fontSize: 12 }}>{r.remarks || "—"}</TableCell></TableRow>
          ))}</TableBody></Table>
      );
    }
    if (selected === "onduty-movement") {
      return (
        <Table size="small" stickyHeader><TableHead><TableRow>{["App No", "Movement Date", "From", "To", "Status"].map(h => <TableCell key={h} sx={headSx}>{h}</TableCell>)}</TableRow></TableHead>
          <TableBody>{filtered.length === 0 ? <TableRow><TableCell colSpan={5} align="center" sx={{ py: 3, color: "#9e9e9e" }}>No movements</TableCell></TableRow> : filtered.map((r, i) => {
            const c = statusChip(r.status); return <TableRow key={i} hover><TableCell sx={{ fontSize: 12, fontWeight: 700 }}>{r.movement_id || r.id || "—"}</TableCell><TableCell sx={{ fontSize: 12 }}>{fmtDate(r.movement_date || r.act_date)}</TableCell><TableCell sx={{ fontSize: 12 }}>{r.perm_ftime || "—"}</TableCell><TableCell sx={{ fontSize: 12 }}>{r.perm_ttime || "—"}</TableCell><TableCell><Chip size="small" label={c.label} sx={{ height: 18, fontSize: 11, fontWeight: 700, bgcolor: c.bg, color: c.col }} /></TableCell></TableRow>;
          })}</TableBody></Table>
      );
    }
    if (selected === "profile") return (
      <Table size="small" stickyHeader><TableHead><TableRow>{["App No", "Date", "Field", "Old Value", "New Value", "Type", "Status", "HR Remarks"].map(h => <TableCell key={h} sx={headSx}>{h}</TableCell>)}</TableRow></TableHead>
        <TableBody>{filtered.map((r, i) => {
          const c = statusChip(r.status);
          const origIdx = (store.profile || []).findIndex(x => x.id === r.id);
          const appNo = String((origIdx >= 0 ? origIdx : i) + 1);
          const pairs = [
            { label: "Comm Address", old: r.old_comm_address, ne: r.new_comm_address },
            { label: "Comm Phone", old: r.old_comm_phone, ne: r.new_comm_phone },
            { label: "Comm Mobile", old: r.old_comm_mobile, ne: r.new_comm_mobile },
            { label: "Perm Address", old: r.old_perm_address, ne: r.new_perm_address },
            { label: "Perm Phone", old: r.old_perm_phone, ne: r.new_perm_phone },
            { label: "Perm Mobile", old: r.old_perm_mobile, ne: r.new_perm_mobile },
          ];
          const changed = pairs.filter(p => p.ne && String(p.ne).trim() !== "" && String(p.old || "") !== String(p.ne));
          const field = changed.length ? changed.map(p => p.label).join(", ") : (r.field_name || r.request_type || "Profile");
          const oldVal = changed.length ? changed.map(p => p.old || "—").join(" | ") : (r.old_value || r.old_comm_address || "—");
          const newVal = changed.length ? changed.map(p => p.ne).join(" | ") : (r.new_value || r.new_comm_address || "—");
          return <TableRow key={i} hover><TableCell sx={{ fontSize: 12, fontWeight: 700 }} title={r.id}>{appNo}</TableCell><TableCell sx={{ fontSize: 12 }}>{fmtDateTime(r.created || r.created_at)}</TableCell><TableCell sx={{ fontSize: 12, maxWidth: 160 }} title={field}>{field}</TableCell><TableCell sx={{ fontSize: 12, maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={oldVal}>{oldVal ? String(oldVal).slice(0, 40) : "—"}</TableCell><TableCell sx={{ fontSize: 12, maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={newVal}>{newVal ? String(newVal).slice(0, 40) : "—"}</TableCell><TableCell sx={{ fontSize: 12 }}>{r.request_type || "Update"}</TableCell><TableCell><Chip size="small" label={c.label} sx={{ height: 18, fontSize: 11, fontWeight: 700, bgcolor: c.bg, color: c.col }} /></TableCell><TableCell sx={{ fontSize: 12, maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={r.hr_remarks || ""}>{r.hr_remarks || "—"}</TableCell></TableRow>;
        })}</TableBody></Table>
    );
    return null;
  };

  return (
    <Box sx={{ bgcolor: "#f1f3f4", pb: 1 }}>
      <Box sx={{ bgcolor: "white", borderBottom: "1px solid #dadce0", px: { xs: 1, md: 1.2 }, py: 1.2 }}>
        <Box sx={{ maxWidth: "100%" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.4 }}>
            <Box sx={{ width: 36, height: 36, borderRadius: 1, bgcolor: theme.palette.primary.main, color: "white", display: "flex", alignItems: "center", justifyContent: "center" }}><FaChartBar size={15} /></Box>
            <Box>
              <Typography sx={{ fontSize: 16, fontWeight: 700, color: "#202124", lineHeight: 1.1 }}>Employee Reports</Typography>
              <Typography sx={{ fontSize: 12, color: "#5f6368", fontWeight: 400 }}>{empName} — Self service report center</Typography>
            </Box>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ ml: "auto" }}>
              {selected === "holidays" ? (
                <Box sx={{ display: "flex", gap: 1, ml: "auto" }}>
                  <Paper elevation={0} sx={{ px: 1.6, py: 0.6, borderRadius: 1, border: "1px solid #dadce0", bgcolor: "white", textAlign: "center", minWidth: 92 }}>
                    <Typography sx={{ fontSize: 14, fontWeight: 800, color: "#202124", lineHeight: 1 }}>{(() => { const s = new Set(); filtered.forEach(r => s.add(r.hdate || r.holiday_date || r.date)); return s.size || 10; })()} HOLIDAYS</Typography>
                    <Typography sx={{ fontSize: 10, fontWeight: 700, color: "#5f6368", letterSpacing: 0.5 }}>TOTAL</Typography>
                  </Paper>
                  <Paper elevation={0} sx={{ px: 1.6, py: 0.6, borderRadius: 1, border: "1px solid #a8dab5", bgcolor: "#e6f4ea", textAlign: "center", minWidth: 92 }}>
                    <Typography sx={{ fontSize: 14, fontWeight: 800, color: "#137333", lineHeight: 1 }}>{(() => { const t = new Date(); t.setHours(0, 0, 0, 0); const s = new Set(); filtered.forEach(r => { const d = new Date(r.hdate || r.holiday_date || r.date); if (!isNaN(d) && d >= t) s.add(r.hdate || r.holiday_date || r.date); }); const c = s.size; return c || 5; })()} UPCOMING</Typography>
                    <Typography sx={{ fontSize: 10, fontWeight: 700, color: "#137333", letterSpacing: 0.5 }}>PENDING</Typography>
                  </Paper>
                </Box>
              ) : (
                <>
                  <Box sx={{ textAlign: "right", mr: 0.5, display: { xs: "none", sm: "block" } }}><Typography sx={{ fontSize: 11, fontWeight: 700, color: "#5f6368", textTransform: "uppercase", letterSpacing: 0.5, lineHeight: 1 }}>Report Center</Typography><Typography sx={{ fontSize: 11, color: "#80868b" }}>Only your records • Live data</Typography></Box>
                  <Paper elevation={0} sx={{ px: 1.4, py: 0.7, borderRadius: 1, border: "1px solid #dadce0", bgcolor: "#f8f9fa", display: "flex", alignItems: "center", gap: 1 }}>
                    <Box sx={{ width: 26, height: 26, borderRadius: 1, bgcolor: "white", border: "1px solid #dadce0", display: "flex", alignItems: "center", justifyContent: "center", color: theme.palette.primary.main }}><FaClipboardList size={11} /></Box>
                    <Box><Typography sx={{ fontSize: 14, fontWeight: 700, color: "#202124", lineHeight: 1 }}>{headerKpi.total}</Typography><Typography sx={{ fontSize: 11, fontWeight: 700, color: "#5f6368", textTransform: "uppercase" }}>{selected ? selectedMeta?.label : "Requests"}</Typography></Box>
                  </Paper>
                  {!YEAR_ONLY.includes(selected) && <Paper elevation={0} sx={{ px: 1.4, py: 0.7, borderRadius: 1, border: "1px solid #fbbc04", bgcolor: "#fef7e0", display: "flex", alignItems: "center", gap: 1 }}>
                    <Box sx={{ width: 26, height: 26, borderRadius: 1, bgcolor: "white", border: "1px solid #fdd663", display: "flex", alignItems: "center", justifyContent: "center", color: "#7a6500" }}><FaHourglassHalf size={11} /></Box>
                    <Box><Typography sx={{ fontSize: 14, fontWeight: 700, color: "#202124", lineHeight: 1 }}>{headerKpi.pending}</Typography><Typography sx={{ fontSize: 11, fontWeight: 700, color: "#5f6368", textTransform: "uppercase" }}>Pending</Typography></Box>
                  </Paper>}
                </>
              )}
            </Stack>
          </Box>
        </Box>
      </Box>
      <Box sx={{ maxWidth: "100%", px: { xs: 0.5, md: 0.8 }, pt: 1.2 }}>
        <Grid container spacing={1.2} alignItems="flex-start" wrap="nowrap" sx={{ flexWrap: { xs: "wrap", md: "nowrap" } }}>
          <Grid item xs={12} sm={12} md={2.5} sx={{ minWidth: 0, flexShrink: 0, flexBasis: { md: "22%" }, maxWidth: { md: "22%" } }}>
            <Paper elevation={0} sx={{ border: "1px solid #dadce0", borderRadius: 1, overflow: "hidden", bgcolor: "white", position: { md: "sticky" }, top: 12 }}>
              <Box sx={{ px: 1.4, py: 1, bgcolor: "#f8f9fa", borderBottom: "1px solid #dadce0", display: "flex", alignItems: "center", gap: 1 }}>
                <Box sx={{ width: 22, height: 22, borderRadius: 0.7, bgcolor: theme.palette.primary.main, color: "white", display: "flex", alignItems: "center", justifyContent: "center" }}><FaSearch size={10} /></Box>
                <Typography sx={{ fontSize: 12, fontWeight: 700, color: "#202124" }}>Lookup</Typography>
                <Typography sx={{ fontSize: 11, color: "#5f6368", ml: 0.3 }}>— Filters</Typography>
              </Box>
              <Box sx={{ p: 1.2, display: "flex", flexDirection: "column", gap: 1.2 }}>
                <Box sx={{ p: 1.2, borderRadius: 1, border: "1px solid #e8eaed", bgcolor: "#f8faff" }}>
                  <Typography sx={{ fontSize: 11, fontWeight: 800, color: theme.palette.primary.main, letterSpacing: 0.6, textTransform: "uppercase", mb: 0.8, display: "flex", alignItems: "center", gap: 0.6 }}><FaClipboardList size={10} /> Application</Typography>
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                    <Box sx={{ display: "flex", gap: 0.8, alignItems: "flex-start" }}>
                      <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
                        <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#202124", mb: 0.4, lineHeight: 1, height: 14, display: "flex", alignItems: "center" }}>Application ID No :</Typography>
                        <TextField fullWidth size="small" placeholder="e.g. LV-1023" value={appId} onChange={e => setAppId(e.target.value)} sx={{ "& input": { height: 18, fontSize: 12, py: 0.7 }, "& .MuiOutlinedInput-root": { borderRadius: 1, bgcolor: "white", height: 34 } }} />
                      </Box>
                      <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
                        <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#202124", mb: 0.4, lineHeight: 1, height: 14, display: "flex", alignItems: "center" }}>Employee Id <Box component="span" sx={{ color: "#d93025", ml: 0.3 }}>*</Box></Typography>
                        <TextField fullWidth size="small" value={empid || "1020"} InputProps={{ readOnly: true, sx: { bgcolor: "#f1f3f4", fontWeight: 700, fontSize: 12, borderRadius: 1 } }} sx={{ "& input": { height: 18, fontSize: 12, py: 0.7 }, "& .MuiOutlinedInput-root": { borderRadius: 1, height: 34 } }} />
                      </Box>
                    </Box>
                    <Box>
                      <Typography sx={{ fontSize: 12, fontWeight: 700, color: "#202124", mb: 0.4, display: "flex", alignItems: "center", gap: 0.6 }}><FaClipboardList color={theme.palette.primary.main} size={10} /> Application Reports :</Typography>
                      <Select fullWidth size="small" value={appReportSel} onChange={e => { setAppReportSel(e.target.value); if (e.target.value) { setEmpReportSel(""); selectReport(e.target.value); } }} displayEmpty sx={{ height: 34, fontSize: 12, bgcolor: appReportSel ? "#e8f0fe" : "white", borderRadius: 1, fontWeight: appReportSel ? 700 : 400 }}><MenuItem value=""><em>-Select-</em></MenuItem>{APP_REPORTS.map(o => <MenuItem key={o.id} value={o.id} sx={{ fontSize: 12 }}>{o.label} Application</MenuItem>)}</Select>
                    </Box>
                  </Box>
                </Box>
                <Box id="lookupSection" onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); const sel = '#lookupSection input, #lookupSection select, #lookupSection [role="combobox"], #lookupSection button'; const els = Array.from(document.querySelectorAll(sel)).filter(el => !el.disabled && el.offsetParent !== null); const idx = els.indexOf(document.activeElement); if (idx > -1 && els[idx + 1]) els[idx + 1].focus(); } }} sx={{ p: 1.2, borderRadius: 1, border: "1px solid #e8eaed", bgcolor: "#ffffff" }}>
                  <Typography sx={{ fontSize: 11, fontWeight: 800, color: theme.palette.primary.main, letterSpacing: 0.6, textTransform: "uppercase", mb: 0.8, display: "flex", alignItems: "center", gap: 0.6 }}><FaCalendarAlt size={10} /> Period & Employee</Typography>
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                    <Box sx={{ display: "flex", gap: 0.6, minWidth: 0 }}>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#202124", mb: 0.4, whiteSpace: "nowrap" }}>Starting Date</Typography>
                        <TextField fullWidth size="small" type="text" placeholder="01-AUG-26" value={startDate} onChange={e => { let v = e.target.value.trim().toUpperCase(); if (!v) { setStartDate(""); return; } if (/^\d{6}$/.test(v)) { const dd = v.slice(0, 2), mm = v.slice(2, 4), yy = v.slice(4, 6); const mons = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"]; const mi = parseInt(mm, 10) - 1; if (mi >= 0 && mi < 12) { setStartDate(`${dd}-${mons[mi]}-${yy}`); return; } } setStartDate(v); }} onBlur={e => { const v = e.target.value.trim(); if (/^\d{6}$/.test(v)) { const dd = v.slice(0, 2), mm = v.slice(2, 4), yy = v.slice(4, 6); const mons = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"]; const mi = parseInt(mm, 10) - 1; if (mi >= 0 && mi < 12) setStartDate(`${dd}-${mons[mi]}-${yy}`); } }} InputProps={{ endAdornment: <InputAdornment position="end"><FaCalendarAlt size={12} color="#5f6368" /></InputAdornment>, sx: { bgcolor: "white", borderRadius: 1.5, height: 36, fontSize: 12, fontWeight: 600 } }} helperText={startDate ? startDate : "DD-MON-YY"} FormHelperTextProps={{ sx: { fontSize: 10, m: 0, color: "#80868b" } }} sx={{ "& input": { px: 1, py: 0.8 } }} />
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#202124", mb: 0.4, whiteSpace: "nowrap" }}>Ending Date</Typography>
                        <TextField fullWidth size="small" type="text" placeholder="10-AUG-26" value={endDate} onChange={e => { let v = e.target.value.trim().toUpperCase(); if (!v) { setEndDate(""); return; } if (/^\d{6}$/.test(v)) { const dd = v.slice(0, 2), mm = v.slice(2, 4), yy = v.slice(4, 6); const mons = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"]; const mi = parseInt(mm, 10) - 1; if (mi >= 0 && mi < 12) { setEndDate(`${dd}-${mons[mi]}-${yy}`); return; } } setEndDate(v); }} onBlur={e => { const v = e.target.value.trim(); if (/^\d{6}$/.test(v)) { const dd = v.slice(0, 2), mm = v.slice(2, 4), yy = v.slice(4, 6); const mons = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"]; const mi = parseInt(mm, 10) - 1; if (mi >= 0 && mi < 12) setEndDate(`${dd}-${mons[mi]}-${yy}`); } }} InputProps={{ endAdornment: <InputAdornment position="end"><FaCalendarAlt size={12} color="#5f6368" /></InputAdornment>, sx: { bgcolor: "white", borderRadius: 1.5, height: 36, fontSize: 12, fontWeight: 600 } }} helperText={endDate ? endDate : "DD-MON-YY"} FormHelperTextProps={{ sx: { fontSize: 10, m: 0, color: "#80868b" } }} sx={{ "& input": { px: 1, py: 0.8 } }} />
                      </Box>
                    </Box>
                    <Box sx={{ display: "flex", gap: 0.8 }}>
                      {!YEAR_ONLY.includes(selected) && <Box sx={{ flex: 1 }}>
                        <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#202124", mb: 0.4 }}>Month</Typography>
                        <Select id="monthSelect" fullWidth size="small" value={month} onChange={e => setMonth(e.target.value)} sx={{ height: 34, fontSize: 12, bgcolor: "white", borderRadius: 1 }}>{MONTHS.map(m => <MenuItem key={m.value} value={m.value} sx={{ fontSize: 12 }}>{m.label.slice(0, 3)}</MenuItem>)}</Select>
                      </Box>}
                      <Box sx={{ flex: 1 }}>
                        <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#202124", mb: 0.4 }}>Year</Typography>
                        <TextField fullWidth size="small" type="number" value={year} onChange={e => setYear(parseInt(e.target.value) || 2026)} sx={{ "& input": { height: 18, fontSize: 12 }, "& .MuiOutlinedInput-root": { borderRadius: 1, bgcolor: "white" } }} />
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#202124", mb: 0.4 }}>Report Type</Typography>
                        <Select fullWidth size="small" value={reportType} onChange={e => setReportType(e.target.value)} sx={{ height: 34, fontSize: 12, bgcolor: "white", borderRadius: 1 }}><MenuItem value="PDF">PDF</MenuItem><MenuItem value="Excel">Excel</MenuItem><MenuItem value="View">View</MenuItem></Select>
                      </Box>
                    </Box>
                    <Box>
                      <Typography sx={{ fontSize: 12, fontWeight: 700, color: "#202124", mb: 0.4, display: "flex", alignItems: "center", gap: 0.6 }}><FaCalendarAlt color={theme.palette.primary.main} size={10} /> Employee Reports :</Typography>
                      <Select fullWidth size="small" value={empReportSel} onChange={e => { setEmpReportSel(e.target.value); if (e.target.value) { setAppReportSel(""); selectReport(e.target.value); } }} displayEmpty sx={{ height: 34, fontSize: 12, bgcolor: empReportSel ? "#e8f0fe" : "white", borderRadius: 1, fontWeight: empReportSel ? 700 : 400 }}><MenuItem value=""><em>-Select-</em></MenuItem>{MONTHLY_REPORTS.map(o => <MenuItem key={o.id} value={o.id} sx={{ fontSize: 12 }}>{o.label}</MenuItem>)}</Select>
                    </Box>
                  </Box>
                </Box>
                <Box sx={{ display: "flex", gap: 0.8 }}>
                  <Button fullWidth size="small" variant="outlined" onClick={() => { setAppId(""); setStartDate(""); setEndDate(""); setReportType("PDF"); setAppReportSel(""); setEmpReportSel(""); setSearch(""); setSelected(null); navigate("/my-reports", { replace: true }); }} sx={{ fontSize: 12, fontWeight: 700, height: 32, borderRadius: 1, color: "#5f6368", borderColor: "#dadce0" }}>Reset</Button>
                  <Button id="lookupRefreshBtn" fullWidth size="small" variant="contained" startIcon={<RefreshIcon sx={{ fontSize: 14 }} />} onClick={() => { if (selected) { fetchData(); } else { setLoadingStore(true); const t = setTimeout(() => setLoadingStore(false), 800); } }} sx={{ fontSize: 12, fontWeight: 700, height: 32, borderRadius: 1 }}>Refresh</Button>
                  <Button fullWidth size="small" variant="outlined" startIcon={reportType === "PDF" ? <FaDownload size={11} /> : <FaEye size={11} />} onClick={handleExport} disabled={isPayslipGenerated && APP_REPORTS.some(r => r.id === selected)} sx={{ fontSize: 12, fontWeight: 700, height: 32, borderRadius: 1 }}>Export</Button>
                </Box>
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={12} md={9.5} sx={{ minWidth: 0, flexBasis: { md: "78%" }, maxWidth: { md: "78%" } }}>
            {!selected && (
              <Box sx={{ mb: 1.2 }}>
                <Grid container spacing={1.2}>
                  <Grid item xs={6} sm={3}><Paper elevation={0} sx={{ p: 1.2, border: "1px solid #e8eaed", borderRadius: 1, display: "flex", alignItems: "center", gap: 1, bgcolor: "white" }}><Box sx={{ width: 32, height: 32, borderRadius: 1, bgcolor: alpha(theme.palette.primary.main, 0.1), color: theme.palette.primary.main, display: "flex", alignItems: "center", justifyContent: "center" }}><FaClipboardList size={14} /></Box><Box><Typography sx={{ fontSize: 12, fontWeight: 700, color: "#5f6368", textTransform: "uppercase", letterSpacing: 0.4 }}>Total</Typography><Typography sx={{ fontSize: 14, fontWeight: 800, color: "#202124" }}>{headerKpi.total} applications</Typography></Box></Paper></Grid>
                  <Grid item xs={6} sm={3}><Paper elevation={0} sx={{ p: 1.2, border: "1px solid #e8eaed", borderRadius: 1, display: "flex", alignItems: "center", gap: 1, bgcolor: "white" }}><Box sx={{ width: 32, height: 32, borderRadius: 1, bgcolor: "#fef7e0", color: "#7a6500", display: "flex", alignItems: "center", justifyContent: "center" }}><FaHourglassHalf size={13} /></Box><Box><Typography sx={{ fontSize: 12, fontWeight: 700, color: "#5f6368", textTransform: "uppercase", letterSpacing: 0.4 }}>Pending</Typography><Typography sx={{ fontSize: 14, fontWeight: 800, color: "#202124" }}>{headerKpi.pending} awaiting</Typography></Box></Paper></Grid>
                  <Grid item xs={6} sm={3}><Paper elevation={0} sx={{ p: 1.2, border: "1px solid #e8eaed", borderRadius: 1, display: "flex", alignItems: "center", gap: 1, bgcolor: "white" }}><Box sx={{ width: 32, height: 32, borderRadius: 1, bgcolor: "#e6f4ea", color: "#137333", display: "flex", alignItems: "center", justifyContent: "center" }}><FaCalendarCheck size={13} /></Box><Box><Typography sx={{ fontSize: 12, fontWeight: 700, color: "#5f6368", textTransform: "uppercase", letterSpacing: 0.4 }}>{MONTHS[month - 1].label}</Typography><Typography sx={{ fontSize: 13, fontWeight: 800, color: "#202124" }}>{attSummary ? `${attSummary.present}/${attSummary.total} present` : "No data"}</Typography></Box></Paper></Grid>
                  <Grid item xs={6} sm={3}><Paper elevation={0} sx={{ p: 1.2, border: "1px solid #e8eaed", borderRadius: 1, display: "flex", alignItems: "center", gap: 1, bgcolor: "white" }}><Box sx={{ width: 32, height: 32, borderRadius: 1, bgcolor: "#e8f0fe", color: theme.palette.primary.main, display: "flex", alignItems: "center", justifyContent: "center" }}><FaMoneyBill size={13} /></Box><Box><Typography sx={{ fontSize: 12, fontWeight: 700, color: "#5f6368", textTransform: "uppercase", letterSpacing: 0.4 }}>Salary</Typography><Typography sx={{ fontSize: 13, fontWeight: 800, color: "#202124" }}>{payslipSummary?.latestNet ? `₹${Number(payslipSummary.latestNet).toLocaleString("en-IN")}` : "No payslip"}</Typography></Box></Paper></Grid>
                </Grid>
              </Box>
            )}
            <Box sx={{}}>
              {!selected ? (
                <Grid container spacing={1.5} alignItems="stretch">
                  <Grid item xs={12} md={6}>
                    <Paper elevation={0} sx={{ borderRadius: 1, border: "1px solid #e8eaed", overflow: "hidden", bgcolor: "white", height: "100%", display: "flex", flexDirection: "column" }}>
                      <Box sx={{ px: 1.4, py: 1, bgcolor: "#f8f9fa", borderBottom: "1px solid #e8eaed", display: "flex", alignItems: "center", gap: 1 }}>
                        <Box sx={{ width: 22, height: 22, borderRadius: 0.7, bgcolor: theme.palette.primary.main, color: "white", display: "flex", alignItems: "center", justifyContent: "center" }}><FaClipboardList size={10} /></Box>
                        <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#202124" }}>My Applications</Typography>
                        <Chip label={`${APP_REPORTS.length}`} size="small" sx={{ ml: "auto", height: 18, fontSize: 11, fontWeight: 700, bgcolor: theme.palette.primary.main, color: "white" }} />
                      </Box>
                      <Box sx={{ p: 0.8, display: "flex", flexDirection: "column", gap: 0.6, bgcolor: "#f8faff" }}>
                        {loadingStore ? <Box sx={{ p: 2, textAlign: "center" }}><CircularProgress size={18} /></Box> : APP_REPORTS.map(r => <AppRow key={r.id} r={r} />)}
                      </Box>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Paper elevation={0} sx={{ borderRadius: 1, border: "1px solid #e8eaed", overflow: "hidden", bgcolor: "white", height: "100%", display: "flex", flexDirection: "column" }}>
                      <Box sx={{ px: 1.4, py: 1, bgcolor: "#f8f9fa", borderBottom: "1px solid #e8eaed", display: "flex", alignItems: "center", gap: 1 }}>
                        <Box sx={{ width: 22, height: 22, borderRadius: 0.7, bgcolor: theme.palette.primary.main, color: "white", display: "flex", alignItems: "center", justifyContent: "center" }}><FaCalendarAlt size={10} /></Box>
                        <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#202124" }}>Monthly Statements</Typography>
                        <Chip label="4" size="small" sx={{ ml: "auto", height: 18, fontSize: 11, fontWeight: 700, bgcolor: theme.palette.primary.main, color: "white" }} />
                      </Box>
                      <Box sx={{ p: 0.8, bgcolor: "#f8faff" }}>
                        {loadingStore ? <Box sx={{ p: 2, textAlign: "center" }}><CircularProgress size={18} /></Box> : <Grid container spacing={0.8}>{MONTHLY_REPORTS.map(r => <Grid item xs={12} sm={6} key={r.id}><MonthlyRow r={r} /></Grid>)}</Grid>}
                      </Box>
                    </Paper>
                  </Grid>
                </Grid>
              ) : (
                <Paper elevation={0} sx={{ borderRadius: 1, border: "1px solid #e8eaed", overflow: "hidden", bgcolor: "white" }}>
                  <Box sx={{ px: 1.4, py: 1, display: "flex", alignItems: "center", gap: 1, bgcolor: "#f8f9fa", borderBottom: "1px solid #e8eaed" }}>
                    <IconButton size="small" onClick={() => { setSelected(null); navigate("/my-reports", { replace: true }); }} sx={{ bgcolor: "white", border: "1px solid #e8eaed", width: 26, height: 26 }}><FaArrowLeft size={10} /></IconButton>
                    <Box sx={{ width: 30, height: 30, borderRadius: 1, bgcolor: theme.palette.primary.main, color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}><selectedMeta.icon /></Box>
                    <Box><Typography sx={{ fontSize: 13, fontWeight: 700, color: "#202124" }}>{(selected === "leave" || selected === "leaves") ? `Leaves History:${empid}:${empName}` : selected === "holidays" ? selectedMeta.label : `${selectedMeta.label} ${selectedMeta.desc || ""}`}</Typography><Typography sx={{ fontSize: 11, color: "#5f6368" }}>{selected === "holidays" ? `${filtered.length} records` : `${selectedMeta.desc} • ${filtered.length} records`}</Typography></Box>
                    <Box sx={{ ml: "auto", display: "flex", alignItems: "center", gap: 0.8, flexWrap: "wrap" }}>
                      {selected === "att-percentage" ? <Box sx={{ display: "flex", gap: 0.5, alignItems: "center", bgcolor: "white", border: "1px solid #e8eaed", borderRadius: 1, px: 0.6, py: 0.3 }}><TextField size="small" type="date" value={(() => { if (!startDate) return ""; const p = startDate.split("-"); if (p.length === 3) { if (p[0].length === 4) return startDate; if (p[2].length === 4) return `${p[2]}-${p[1]}-${p[0]}`; } const d = parseDDMONRR(startDate); return d ? d.toISOString().slice(0, 10) : ""; })()} onChange={e => { const v = e.target.value; if (!v) setStartDate(""); else { const p = v.split("-"); setStartDate(`${p[2]}-${p[1]}-${p[0]}`); } }} InputLabelProps={{ shrink: true }} label="From" sx={{ width: 145 }} inputProps={{ style: { fontSize: 12, padding: "4px 6px" } }} /><TextField size="small" type="date" value={(() => { if (!endDate) return ""; const p = endDate.split("-"); if (p.length === 3) { if (p[0].length === 4) return endDate; if (p[2].length === 4) return `${p[2]}-${p[1]}-${p[0]}`; } const d = parseDDMONRR(endDate); return d ? d.toISOString().slice(0, 10) : ""; })()} onChange={e => { const v = e.target.value; if (!v) setEndDate(""); else { const p = v.split("-"); setEndDate(`${p[2]}-${p[1]}-${p[0]}`); } }} InputLabelProps={{ shrink: true }} label="To" sx={{ width: 145 }} inputProps={{ style: { fontSize: 12, padding: "4px 6px" } }} /><Button size="small" onClick={fetchData} sx={{ minWidth: 0, px: 1, height: 24, fontSize: 11, fontWeight: 800, bgcolor: theme.palette.primary.main, color: "white" }}>Go</Button></Box> : isMonthly && selected !== "holidays" && !YEAR_ONLY.includes(selected) && <Box sx={{ display: "flex", gap: 0.5, alignItems: "center", bgcolor: "white", border: "1px solid #e8eaed", borderRadius: 1, px: 0.6, py: 0.3 }}><Select size="small" value={month} onChange={e => setMonth(e.target.value)} variant="standard" disableUnderline sx={{ fontSize: 12, fontWeight: 700, minWidth: 90 }}>{MONTHS.map(m => <MenuItem key={m.value} value={m.value} sx={{ fontSize: 12 }}>{m.label.slice(0, 3)}</MenuItem>)}</Select><Divider orientation="vertical" flexItem sx={{ mx: 0.4 }} /><Select size="small" value={year} onChange={e => setYear(e.target.value)} variant="standard" disableUnderline sx={{ fontSize: 12, fontWeight: 700, minWidth: 64 }}>{[2023, 2024, 2025, 2026, 2027].map(y => <MenuItem key={y} value={y} sx={{ fontSize: 12 }}>{y}</MenuItem>)}</Select><Button size="small" onClick={fetchData} sx={{ minWidth: 0, px: 1, height: 24, fontSize: 11, fontWeight: 800, bgcolor: theme.palette.primary.main, color: "white" }}>Go</Button></Box>}
                      {selected !== "att-percentage" && isMonthly && YEAR_ONLY.includes(selected) && <Box sx={{ display: "flex", gap: 0.5, alignItems: "center", bgcolor: "white", border: "1px solid #e8eaed", borderRadius: 1, px: 0.6, py: 0.3 }}><Select size="small" value={year} onChange={e => setYear(e.target.value)} variant="standard" disableUnderline sx={{ fontSize: 12, fontWeight: 700, minWidth: 64 }}>{[2023, 2024, 2025, 2026, 2027].map(y => <MenuItem key={y} value={y} sx={{ fontSize: 12 }}>{y}</MenuItem>)}</Select><Button size="small" onClick={fetchData} sx={{ minWidth: 0, px: 1, height: 24, fontSize: 11, fontWeight: 800, bgcolor: theme.palette.primary.main, color: "white" }}>Go</Button></Box>}
                      <TextField size="small" placeholder="Search…" value={search} onChange={e => setSearch(e.target.value)} InputProps={{ startAdornment: <InputAdornment position="start"><FaSearch size={11} color="#9aa0a6" /></InputAdornment>, sx: { height: 30, fontSize: 12, bgcolor: "white", borderRadius: 1 } }} sx={{ width: 150 }} />
                      {selected !== "payslips" && <Tooltip title={reportType === "PDF" ? "Export PDF" : reportType === "Excel" ? "Export Excel" : "Refresh"}><IconButton size="small" onClick={handleExport} sx={{ width: 30, height: 30, bgcolor: "white", border: "1px solid #e8eaed" }}>{reportType === "PDF" ? <FaFilePdf size={13} color="#d93025" /> : reportType === "Excel" ? <FaFileExcel size={13} color="#188038" /> : <FaEye size={12} color={theme.palette.primary.main} />}</IconButton></Tooltip>}
                      <IconButton size="small" onClick={fetchData} sx={{ width: 30, height: 30, bgcolor: "white", border: "1px solid #e8eaed" }}><RefreshIcon sx={{ fontSize: 15, color: "#5f6368" }} /></IconButton>
                    </Box>
                  </Box>
                  <Box>{renderTable()}</Box>
                  <Box sx={{ px: 1.4, py: 0.8, bgcolor: "#f8f9fa", borderTop: "1px solid #e8eaed", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <Typography sx={{ fontSize: 11, color: "#5f6368" }}>Showing {YEAR_ONLY.includes(selected) ? 1 : filtered.length} of {YEAR_ONLY.includes(selected) ? 1 : data.length}{selected === "holidays" ? "" : YEAR_ONLY.includes(selected) ? ` • ${year}` : ` • ${MONTHS[month - 1].label} ${year}`}</Typography>
                    <Button size="small" startIcon={<FaArrowLeft size={10} />} onClick={() => { setSelected(null); navigate("/my-reports", { replace: true }); }} sx={{ fontSize: 12, fontWeight: 700, height: 26, borderRadius: 1 }}>Back to Reports</Button>
                  </Box>
                </Paper>
              )}
            </Box>
          </Grid>
        </Grid>
      </Box>
      <Dialog open={viewOpen} onClose={() => setViewOpen(false)} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 1, maxHeight: "95vh", maxWidth: "860px", overflow: "auto" } }}>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1 }}>
          Payslip - {viewData?.C_ENAME} — {viewData?.C_MONTH} {viewData?.C_YEAR}
          <IconButton onClick={() => setViewOpen(false)}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 2, bgcolor: "white", overflow: "auto", display: "flex", justifyContent: "center" }}>
          {viewData && <PayslipView data={viewData} onClose={() => setViewOpen(false)} />}
        </DialogContent>
      </Dialog>
      <Dialog open={leavePreviewOpen} onClose={() => setLeavePreviewOpen(false)} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 1, maxHeight: "90vh" } }}>
        <DialogContent sx={{ p: 0, bgcolor: "white" }}>
          {leavePreviewLno && <LeavePreview data={{ lno: leavePreviewLno }} onClose={() => setLeavePreviewOpen(false)} />}
        </DialogContent>
      </Dialog>
      <Dialog open={appPreviewOpen} onClose={() => setAppPreviewOpen(false)} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 1, maxHeight: "90vh" } }}>
        <DialogContent sx={{ p: 0, bgcolor: "white" }}>
          {appPreviewType === "onduty" && appPreviewData && <OnDutyPreview data={appPreviewData} onClose={() => setAppPreviewOpen(false)} />}
          {appPreviewType === "tour" && appPreviewData && <TourPreview data={appPreviewData} onClose={() => setAppPreviewOpen(false)} />}
          {appPreviewType === "shift" && appPreviewData && <ShiftChangePreview data={appPreviewData} onClose={() => setAppPreviewOpen(false)} />}
          {appPreviewType === "woff" && appPreviewData && <WoffChangePreview data={appPreviewData} onClose={() => setAppPreviewOpen(false)} />}
          {appPreviewType === "advance" && appPreviewData && <AdvancePreview data={appPreviewData} onClose={() => setAppPreviewOpen(false)} />}
          {appPreviewType === "esileave" && appPreviewData && <ESILeavePreview data={appPreviewData} onClose={() => setAppPreviewOpen(false)} />}
        </DialogContent>
      </Dialog>
    </Box>
  );
}
