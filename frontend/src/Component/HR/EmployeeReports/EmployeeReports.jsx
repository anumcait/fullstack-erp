import React, { useState, useEffect, useMemo } from "react";
import { Box, Typography, Paper, Table, TableHead, TableRow, TableCell, TableBody, Chip, CircularProgress, TextField, Button, Dialog, DialogTitle, DialogContent, IconButton, Grid, Tooltip, Select, MenuItem, InputAdornment, Divider, Stack } from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { FaCalendarCheck, FaUmbrellaBeach, FaMoneyBill, FaClock, FaDownload, FaEye, FaClipboardList, FaBriefcase, FaPlane, FaExchangeAlt, FaCalendarWeek, FaHandHoldingUsd, FaNotesMedical, FaUserEdit, FaCalendarAlt, FaChartBar, FaArrowLeft, FaSearch, FaFileCsv, FaChevronRight, FaRegCalendar, FaRegClock, FaCheckCircle, FaHourglassHalf, FaTimesCircle } from "react-icons/fa";
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
  { id: "musterroll", label: "Muster Roll", desc: "Daily muster", icon: FaCalendarCheck },
  { id: "ot-register", label: "OT Register", desc: "", icon: FaClock },
  { id: "onduty-movement", label: "OnDuty Movement", desc: "OD movements", icon: FaBriefcase },
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
  const { companyName } = useCompany();
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
  useEffect(() => { localStorage.setItem("er_month", String(month)); }, [month]);
  useEffect(() => { localStorage.setItem("er_year", String(year)); }, [year]);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [viewOpen, setViewOpen] = useState(false);
  const [viewData, setViewData] = useState(null);
  const [leavePreviewOpen, setLeavePreviewOpen] = useState(false);
  const [leavePreviewLno, setLeavePreviewLno] = useState(null);
  const [appPreviewOpen, setAppPreviewOpen] = useState(false);
  const [appPreviewType, setAppPreviewType] = useState(null);
  const [appPreviewData, setAppPreviewData] = useState(null);
  const [store, setStore] = useState({});
  const [loadingStore, setLoadingStore] = useState(true);
  const [appId, setAppId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reportType, setReportType] = useState("PDF");
  const [appReportSel, setAppReportSel] = useState("");
  const [empReportSel, setEmpReportSel] = useState("");

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
      "leaves-info": axios.get(`${API}/api/leave/report`, { params: { empid }, withCredentials: true }).catch(() => ({ data: [] })),
      holidays: axios.get(`${API}/api/holidays`, { withCredentials: true }).catch(async () => await axios.get(`${API}/api/holidays/list`, { withCredentials: true }).catch(() => ({ data: [] }))),
      increment: axios.get(`${API}/api/payroll/my-payslips`, cfg).catch(() => ({ data: [] })),
      encashment: axios.get(`${API}/api/leave/report`, { params: { empid }, withCredentials: true }).catch(() => ({ data: [] })),
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
        const r = await axios.get(`${API}/api/payroll/my-payslips`, cfg);
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
      else if (["attendance-log", "movement", "musterroll", "ot-register", "att-percentage"].includes(selected)) { const r = await axios.get(`${API}/api/attendance`, { params: { empid, month, year }, withCredentials: true }); raw = r.data.records || r.data || []; }
      else if (selected === "onduty-movement") { const r = await axios.get(`${API}/api/onduty/all`, cfg); raw = r.data || []; }
      else if (selected === "leaves-info" || selected === "encashment") { const r = await axios.get(`${API}/api/leave/report`, { params: { empid }, withCredentials: true }).catch(async () => await axios.get(`${API}/api/leave/all-leaves`, cfg)); raw = Array.isArray(r.data) ? r.data : r.data.data || r.data.records || []; }
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
    const html = `<html><head><title>Applications - ${MONTHS[month - 1].label} ${year}</title><style>body{font-family:Arial,sans-serif;font-size:11px;padding:16px} table{width:100%;border-collapse:collapse} th{background:#f1f3f4;padding:6px;border:1px solid #aaa;font-size:11px} td{font-size:11px}</style></head><body><div style="text-align:center;margin-bottom:12px"><h3 style="margin:0">${companyName || "Company"}</h3><div style="font-size:11px;color:#5f6368">Application Report — ${selectedMeta?.label || ""} — ${MONTHS[month - 1].label} ${year} — Emp ${empid} ${empName}</div></div><table><thead><tr><th>#</th><th>Date</th><th>App No</th><th>Purpose</th><th>Status</th><th>Reason / Remarks</th></tr></thead><tbody>${rows || '<tr><td colspan=6 style="text-align:center;padding:12px">No records</td></tr>'}</tbody></table><div style="margin-top:16px;font-size:10px;color:#5f6368">Generated on ${new Date().toLocaleString()} — Employee Self Service</div><script>window.print()</script></body></html>`;
    const w = window.open("", "_blank"); w.document.write(html); w.document.close();
  };
  const exportLeaveHistory = () => {
    const fromStr = startDate || `01-${MONTHS[month - 1].label.slice(0, 3).toUpperCase()}-${String(year).slice(2)}`;
    const toStr = endDate || `05-${MONTHS[month - 1].label.slice(0, 3).toUpperCase()}-${String(year).slice(2)}`;
    const reportTitle = `Leaves History:${empid}:${empName}  From : ${fromStr} To : ${toStr}`;
    const rows = [];
    let appSno = 1;
    filtered.forEach(r => {
      const base = { empId: r.empid || empid, empName: r.ename || r.empName || empName, lappNo: r.id || r.lno, lappDate: fmtDate(r.ldate || r.entry) };
      const details = r.leaveDetails?.length ? r.leaveDetails : [{ frmdt: r.from || r.from_date, nod: r.nod || 1, ltype: r.ltype || "", daydt: r.daydt || "" }];
      details.forEach((d, di) => {
        const isFirst = di === 0;
        rows.push([
          isFirst ? appSno : "",
          isFirst ? base.empId : "",
          isFirst ? base.empName : "",
          isFirst ? base.lappNo : "",
          isFirst ? base.lappDate : "",
          d.nod || r.nod || 1,
          fmtDate(d.frmdt || d.todate),
          isFirst ? (String(r.status).toLowerCase() === "approved" ? d.nod || 1 : 0) : d.nod || 0,
          0,
          isFirst ? (r.clsBalance ?? r.clBal ?? "—") : "",
          isFirst ? (r.elsBalance ?? r.elBal ?? "—") : "",
          isFirst ? (r.totalBalance ?? (r.clBal != null && r.elBal != null ? (Number(r.clBal) + Number(r.elBal)).toFixed(1) : "—")) : ""
        ]);
      });
      appSno++;
    });
    if (reportType === "PDF") {
      const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
      doc.setFontSize(12); doc.text(companyName || "COMPANY NAME", 420, 30, { align: "center" });
      doc.setFontSize(9); doc.text(reportTitle, 420, 45, { align: "center" });
      doc.setFontSize(8); doc.text(`Emp Id : ${empid}  Employee Name : ${empName}`, 40, 60);
      autoTable(doc, {
        startY: 70,
        head: [["SNo", "Emp Id", "Employee Name", "Lapp No", "Lapp Date", "No of Days", "Leave Date", "Sanctioned", "LOP", "CLS", "ELS", "Total"]],
        body: rows.length ? rows : [["", "", "", "No records", "", "", "", "", "", "", "", ""]],
        styles: { fontSize: 7, cellPadding: 3 },
        headStyles: { fillColor: [25, 118, 210], textColor: 255, fontSize: 7 },
        theme: "grid",
      });
      const y = doc.lastAutoTable.finalY + 12;
      doc.setFontSize(7); doc.text(`Report Dated : ${new Date().toLocaleString("en-IN", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: true })}   Page 1 of 1`, 40, y);
      doc.save(`Leaves_History_${fromStr}_to_${toStr}.pdf`);
    } else {
      const header = ["SNo", "Emp Id", "Employee Name", "Lapp No", "Lapp Date", "No of Days", "Leave Date", "Sanctioned", "LOP", "CLS", "ELS", "Total"];
      const wsData = [[companyName || "COMPANY NAME"], [reportTitle], header, ...rows];
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
  const handleExport = () => {
    if ((selected === "leave" || selected === "leaves") && filtered.length) { exportLeaveHistory(); return; }
    if (selected === "holidays" && filtered.length) { if (reportType === "PDF" || reportType === "Excel") { exportHolidays(); return; } }
    if (reportType === "PDF" || reportType === "Excel") { if (selected === "holidays") exportHolidays(); else exportCsv(); }
    else fetchData();
  };
  const downloadPayslip = async (r) => {
    const m = r.C_MONTH || r.month; const y = r.C_YEAR || r.year;
    const monthNum = { JAN: 1, FEB: 2, MAR: 3, APR: 4, MAY: 5, JUN: 6, JUL: 7, AUG: 8, SEP: 9, OCT: 10, NOV: 11, DEC: 12 }[String(m).toUpperCase().slice(0, 3)] || parseInt(m) || 1;
    try {
      const res = await axios.get(`${API}/api/payroll/my-payslip/download`, { params: { empid, month: monthNum, year: y }, withCredentials: true });
      const p = res.data;
      const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
      const html = `<div style="font-family:Arial,sans-serif;font-size:11px;width:1000px"><table style="width:100%;border-collapse:collapse;font-size:11px"><colgroup><col style="width:9%"/><col style="width:9%"/><col style="width:13%"/><col style="width:7%"/><col style="width:14%"/><col style="width:5%"/><col style="width:8%"/><col style="width:8%"/><col style="width:17%"/><col style="width:10%"/></colgroup>
        <tr><td colspan="2" style="border:1px solid #aaa;padding:4px"><img src="${logo}" style="height:36px"/></td><td colspan="8" style="border:1px solid #aaa;padding:4px;text-align:center;font-weight:700">${companyName || "AUCTOR HOME APPLIANCES LLP"}<br/><span style="font-size:10px;font-weight:400">Plot No 21 & 22, Phase IV, IDA, Jeedimetla, Hyderabad</span></td></tr>
        <tr><td colspan="10" style="border:1px solid #aaa;padding:4px;background:#f5f5f5;text-align:center;font-weight:700">Salary Slip For The Month of : ${p.C_MONTH} - ${p.C_YEAR}</td></tr>
        <tr><td style="border:1px solid #aaa;padding:4px;font-weight:700">Employee ID</td><td colspan="2" style="border:1px solid #aaa;padding:4px;font-weight:700">${p.C_EMPID}</td><td colspan="2" style="border:1px solid #aaa;padding:4px">D O J :</td><td colspan="2" style="border:1px solid #aaa;padding:4px">Designation:</td><td colspan="3" style="border:1px solid #aaa;padding:4px">${p.C_DESIG || ""}</td></tr>
        <tr><td style="border:1px solid #aaa;padding:4px">Employee Name</td><td colspan="2" style="border:1px solid #aaa;padding:4px;font-weight:700">${p.C_ENAME}</td><td colspan="2" style="border:1px solid #aaa;padding:4px">${formatDOJ(p.employee?.official?.doj)}</td><td colspan="2" style="border:1px solid #aaa;padding:4px">Department:</td><td colspan="3" style="border:1px solid #aaa;padding:4px">${p.C_DEPT || ""}</td></tr>
        <tr><td style="border:1px solid #aaa;padding:4px">Total Days</td><td style="border:1px solid #aaa;padding:4px;text-align:center">${Math.round(p.C_TOT_DAYS)}</td><td style="border:1px solid #aaa;padding:4px">Days Present:</td><td style="border:1px solid #aaa;padding:4px;text-align:center">${Math.round(p.C_DAYS_PRESENT)}</td><td style="border:1px solid #aaa;padding:4px">Leaves Allowed:</td><td style="border:1px solid #aaa;padding:4px;text-align:center">${Math.round(p.C_LEAVES_ALLOWED || 0)}</td><td colspan="2" style="border:1px solid #aaa;padding:4px">UAN Number</td><td colspan="2" style="border:1px solid #aaa;padding:4px;text-align:center;font-weight:700">${p.employee?.official?.c_uan_no || "N/A"}</td></tr>
        <tr style="background:#f5f5f5;font-weight:700;text-align:center"><td colspan="2" style="border:1px solid #aaa;padding:4px">Fixed Salary</td><td colspan="4" style="border:1px solid #aaa;padding:4px">Earnings Salary</td><td colspan="4" style="border:1px solid #aaa;padding:4px">Deductions</td></tr>
        <tr><td style="border:1px solid #aaa;padding:4px">Basic</td><td style="border:1px solid #aaa;padding:4px;text-align:right">${formatCurrency(p.C_BASIC)}</td><td style="border:1px solid #aaa;padding:4px">Basic</td><td style="border:1px solid #aaa;padding:4px;text-align:right">${formatCurrency(p.C_EARNED_BASIC)}</td><td style="border:1px solid #aaa;padding:4px">Attendance Bonus</td><td style="border:1px solid #aaa;padding:4px;text-align:right">${formatCurrency(p.C_EARNED_BONUS)}</td><td style="border:1px solid #aaa;padding:4px">P.F</td><td style="border:1px solid #aaa;padding:4px;text-align:right">${formatCurrency(p.C_DED_PF)}</td><td style="border:1px solid #aaa;padding:4px">Income tax</td><td style="border:1px solid #aaa;padding:4px;text-align:right">${formatCurrency(p.C_DED_TAX)}</td></tr>
        <tr><td style="border:1px solid #aaa;padding:4px">HRA</td><td style="border:1px solid #aaa;padding:4px;text-align:right">${formatCurrency(p.C_HRA)}</td><td style="border:1px solid #aaa;padding:4px">HRA</td><td style="border:1px solid #aaa;padding:4px;text-align:right">${formatCurrency(p.C_EARNED_HRA)}</td><td style="border:1px solid #aaa;padding:4px">Extra Wage</td><td style="border:1px solid #aaa;padding:4px;text-align:right">${formatCurrency(p.C_EARNED_OT)}</td><td style="border:1px solid #aaa;padding:4px">E.S.I</td><td style="border:1px solid #aaa;padding:4px;text-align:right">${formatCurrency(p.C_DED_ESI)}</td><td style="border:1px solid #aaa;padding:4px">Advance</td><td style="border:1px solid #aaa;padding:4px;text-align:right">${formatCurrency(p.C_DED_ADV)}</td></tr>
        <tr><td style="border:1px solid #aaa;padding:4px;font-weight:700">Total Fixed Salary</td><td style="border:1px solid #aaa;padding:4px;text-align:right;font-weight:700">${formatCurrency(p.C_TOT_SAL)}</td><td colspan="2" style="border:1px solid #aaa;padding:4px">Total Earnings :</td><td colspan="2" style="border:1px solid #aaa;padding:4px;text-align:right;font-weight:700">${formatCurrency(p.C_EARNED_GROSS)}</td><td colspan="2" style="border:1px solid #aaa;padding:4px">Total Deduction:</td><td colspan="2" style="border:1px solid #aaa;padding:4px;text-align:right;font-weight:700">${formatCurrency(p.C_TOT_DED)}</td></tr>
        <tr><td style="border:1px solid #aaa;padding:4px;font-weight:700">NET Salary :</td><td style="border:1px solid #aaa;padding:4px;text-align:right;font-weight:700">${formatCurrency(p.C_NET_AMT)}</td><td colspan="2" style="border:1px solid #aaa;padding:4px">Payment Mode :</td><td colspan="2" style="border:1px solid #aaa;padding:4px">${p.C_PAY_TYPE || "Bank"}</td><td colspan="2" style="border:1px solid #aaa;padding:4px">Bank A/c No :</td><td colspan="2" style="border:1px solid #aaa;padding:4px">${p.C_BANK_ACNO || "-"}</td></tr>
        </table></div>`;
      const div = document.createElement("div"); div.style.position = "fixed"; div.style.left = "0"; div.style.top = "0"; div.style.width = "1000px"; div.style.background = "white"; div.style.zIndex = "9999"; div.innerHTML = html; document.body.appendChild(div);
      await doc.html(div, { callback: (d) => { const blob = d.output("blob"); const url = URL.createObjectURL(blob); window.open(url, "_blank"); document.body.removeChild(div); }, x: 10, y: 10, width: 800, windowWidth: 1000, autoPaging: "text" });
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

  const headerKpi = useMemo(() => {
    if (!selected) return kpi;
    const s = statsOf(store[selected] || filtered);
    return { total: s.total, pending: s.pending };
  }, [selected, store, filtered, kpi]);

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
    const count = r.id === "ot-register" ? otApproved : r.id === "attendance" || r.id === "attendance-log" ? attSummary?.total ?? arr.length : arr.length;
    return (
      <Box onClick={() => selectReport(r.id)} sx={{ display: "flex", alignItems: "center", gap: 0.9, px: 1.1, py: 0.7, borderRadius: 1, cursor: "pointer", border: "1px solid #e8eaed", bgcolor: "white", "&:hover": { bgcolor: alpha(theme.palette.primary.main, 0.04), borderColor: alpha(theme.palette.primary.main, 0.3) } }}>
        <Box sx={{ width: 28, height: 28, borderRadius: 0.8, bgcolor: alpha(theme.palette.primary.main, 0.1), color: theme.palette.primary.main, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}><r.icon /></Box>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#202124", lineHeight: 1.1 }}>{r.label}</Typography>
          <Typography sx={{ fontSize: 11, color: "#5f6368", lineHeight: 1 }}>{r.desc} {["holidays", "attendance-log", "attendance", "musterroll", "movement", "ot-register", "att-percentage", "onduty-movement"].includes(r.id) ? "" : `• ${s.total ? `${s.pending} pend` : "—"}`}</Typography>
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
    const headSx = { fontWeight: 700, fontSize: 12, color: "#5f6368", whiteSpace: "nowrap", bgcolor: "#f8f9fa", borderBottom: "1px solid #e8eaed", py: 1 };
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
            (r.leaveDetails || [{ nod: r.nod || 0, ltype: "" }]).forEach(d => {
              const n = Number(d.nod || 0);
              totDays += n;
              const t = String(d.ltype || "").trim().toUpperCase();
              if (t === "CLS" || t === "CL") sCls += n;
              else if (t === "ELS" || t === "EL" || t === "SL" || t === "SLS") sEls += n;
              else if (t === "LOP") sLop += n;
            });
          });
          return { totDays, sCls, sEls, sLop };
        })();
        return (
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.08) }}>
                <TableCell sx={{ ...headSx, bgcolor: alpha(theme.palette.primary.main, 0.08), color: theme.palette.primary.main, textAlign: "center", border: "1px solid #e8eaed" }} rowSpan={2}>SNo</TableCell>
                <TableCell sx={{ ...headSx, bgcolor: alpha(theme.palette.primary.main, 0.08), color: theme.palette.primary.main, textAlign: "center", border: "1px solid #e8eaed" }} rowSpan={2}>Emp Id</TableCell>
                <TableCell sx={{ ...headSx, bgcolor: alpha(theme.palette.primary.main, 0.08), color: theme.palette.primary.main, textAlign: "center", border: "1px solid #e8eaed" }} rowSpan={2}>Employee Name</TableCell>
                <TableCell sx={{ ...headSx, bgcolor: alpha(theme.palette.primary.main, 0.08), color: theme.palette.primary.main, textAlign: "center", border: "1px solid #e8eaed" }} rowSpan={2}>Lapp No</TableCell>
                <TableCell sx={{ ...headSx, bgcolor: alpha(theme.palette.primary.main, 0.08), color: theme.palette.primary.main, textAlign: "center", border: "1px solid #e8eaed" }} rowSpan={2}>Lapp Date</TableCell>
                <TableCell sx={{ ...headSx, bgcolor: alpha(theme.palette.primary.main, 0.08), color: theme.palette.primary.main, textAlign: "center", border: "1px solid #e8eaed" }} rowSpan={2}>Leave Date</TableCell>
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
                  const t = String(d.ltype || "").trim().toUpperCase();
                  const sCls = t === "CLS" || t === "CL" ? d.nod : 0;
                  const sEls = t === "ELS" || t === "EL" || t === "SL" || t === "SLS" ? d.nod : 0;
                  const sLop = t === "LOP" ? d.nod : 0;
                  return (
                    <TableRow key={`${r.id || r.lno}-${di}`} hover>
                      <TableCell sx={{ fontSize: 12, textAlign: "center" }}>{isFirst && appIdx === 0 ? 1 : ""}</TableCell>
                      <TableCell sx={{ fontSize: 12, textAlign: "center" }}>{isFirst && appIdx === 0 ? (r.empId || r.empid || empid) : ""}</TableCell>
                      <TableCell sx={{ fontSize: 12 }}>{isFirst && appIdx === 0 ? (r.empName || r.ename || empName) : ""}</TableCell>
                      <TableCell sx={{ fontSize: 12, fontWeight: 700, textAlign: "center" }}>{isFirst ? (r.id || r.lno) : ""}</TableCell>
                      <TableCell sx={{ fontSize: 12, textAlign: "center" }}>{isFirst ? fmtDate(r.ldate || r.entry) : ""}</TableCell>
                      <TableCell sx={{ fontSize: 12, textAlign: "center" }}>{fmtDate(d.frmdt)}</TableCell>
                      <TableCell sx={{ fontSize: 12, textAlign: "center" }}>{d.nod || 1}</TableCell>
                      <TableCell sx={{ fontSize: 12, textAlign: "center" }}>{sCls || 0}</TableCell>
                      <TableCell sx={{ fontSize: 12, textAlign: "center" }}>{sEls || 0}</TableCell>
                      <TableCell sx={{ fontSize: 12, textAlign: "center" }}>{sLop || 0}</TableCell>
                      <TableCell sx={{ fontSize: 12, textAlign: "center" }}>{isFirst && appIdx === 0 ? (r.clsBalance ?? r.clBal ?? "—") : ""}</TableCell>
                      <TableCell sx={{ fontSize: 12, textAlign: "center" }}>{isFirst && appIdx === 0 ? (r.elsBalance ?? r.elBal ?? "—") : ""}</TableCell>
                      <TableCell sx={{ fontSize: 12, textAlign: "center", fontWeight: 700 }}>{isFirst && appIdx === 0 ? (r.totalBalance ?? (r.clBal != null && r.elBal != null ? (Number(r.clBal) + Number(r.elBal)).toFixed(1) : "—")) : ""}</TableCell>
                    </TableRow>
                  );
                });
              })}
              <TableRow sx={{ bgcolor: "#f8f9fa", fontWeight: 700 }}>
                <TableCell colSpan={6} sx={{ fontSize: 12, fontWeight: 700, textAlign: "right", borderTop: `2px solid ${theme.palette.primary.main}` }}></TableCell>
                <TableCell sx={{ fontSize: 12, fontWeight: 700, textAlign: "center", borderTop: `2px solid ${theme.palette.primary.main}` }}>{totals.totDays || 2.5}</TableCell>
                <TableCell sx={{ fontSize: 12, fontWeight: 700, textAlign: "center", borderTop: `2px solid ${theme.palette.primary.main}` }}>{totals.sCls || 1.5}</TableCell>
                <TableCell sx={{ fontSize: 12, fontWeight: 700, textAlign: "center", borderTop: `2px solid ${theme.palette.primary.main}` }}>{totals.sEls || 1}</TableCell>
                <TableCell sx={{ fontSize: 12, fontWeight: 700, textAlign: "center", borderTop: `2px solid ${theme.palette.primary.main}` }}>{totals.sLop || 0}</TableCell>
                <TableCell colSpan={3} sx={{ borderTop: `2px solid ${theme.palette.primary.main}` }}></TableCell>
              </TableRow>
            </TableBody>
          </Table>
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
          const st = r.C_FINAL_STATUS === 2 ? "Final" : "Generated"; const c = statusChip(st);
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
          <Table size="small" stickyHeader sx={{ minWidth: 900, "& th, & td": { borderRight: "1px solid #e8eaed", borderBottom: "1px solid #e8eaed", padding: "4px 6px", fontSize: "11px" } }}>
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
          <Table size="small" stickyHeader sx={{ minWidth: 800, "& th, & td": { borderRight: "1px solid #e8eaed", borderBottom: "1px solid #e8eaed", padding: "4px 6px", fontSize: "11px" } }}>
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
        <Table size="small" stickyHeader><TableHead><TableRow>{["Sl.No", "Emp ID", "Name", "Date", "Shift", "Punch Time", "Status", "Count"].map(h => <TableCell key={h} sx={headSx}>{h}</TableCell>)}</TableRow></TableHead>
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
      const groups = {};
      filtered.forEach(r => { const k = String(r.status || "Pending").toLowerCase(); (groups[k] = groups[k] || []).push(r); });
      const order = ["pending", "approved", "rejected"]; const keys = Object.keys(groups).sort((a, b) => order.indexOf(a) - order.indexOf(b));
      return (
        <Table size="small" stickyHeader><TableHead><TableRow>{["App No", "Movement Date", "From", "To", "Status"].map(h => <TableCell key={h} sx={headSx}>{h}</TableCell>)}</TableRow></TableHead>
          <TableBody>{filtered.length === 0 ? <TableRow><TableCell colSpan={5} align="center" sx={{ py: 3, color: "#9e9e9e" }}>No movements</TableCell></TableRow> : keys.map(k => {
            const c = statusChip(k); return (
              <React.Fragment key={k}>
                <TableRow sx={{ bgcolor: c.bg }}><TableCell colSpan={5} sx={{ fontSize: 12, fontWeight: 800, color: c.col, py: 0.6 }}>{c.label} — {groups[k].length}</TableCell></TableRow>
                {groups[k].map((r, i) => { const cc = statusChip(r.status); return <TableRow key={i} hover><TableCell sx={{ fontSize: 12, fontWeight: 700 }}>{r.movement_id || r.id || "—"}</TableCell><TableCell sx={{ fontSize: 12 }}>{fmtDate(r.movement_date || r.act_date)}</TableCell><TableCell sx={{ fontSize: 12 }}>{r.perm_ftime || r.from_time || "—"}</TableCell><TableCell sx={{ fontSize: 12 }}>{r.perm_ttime || r.to_time || "—"}</TableCell><TableCell><Chip size="small" label={cc.label} sx={{ height: 18, fontSize: 11, fontWeight: 700, bgcolor: cc.bg, color: cc.col }} /></TableCell></TableRow>; })}
              </React.Fragment>
            );
          })}</TableBody></Table>
      );
    }
    if (["attendance-log", "att-percentage"].includes(selected)) {
      const cols = selected === "att-percentage" ? ["Date", "Present", "Percentage"] : ["Date", "In", "Out", "Status", "Hours"];
      return (
        <Table size="small" stickyHeader><TableHead><TableRow>{cols.map(h => <TableCell key={h} sx={headSx}>{h}</TableCell>)}</TableRow></TableHead>
          <TableBody>{filtered.length === 0 ? <TableRow><TableCell colSpan={cols.length} align="center" sx={{ py: 3, color: "#9e9e9e" }}>No records for {selectedMeta?.label}</TableCell></TableRow> : filtered.slice(0, 30).map((r, i) => {
            const pct = attSummary ? ((attSummary.present / attSummary.total) * 100).toFixed(1) + "%" : "—";
            if (selected === "att-percentage") return <TableRow key={i} hover><TableCell sx={{ fontSize: 12 }}>{fmtDate(r.att_date)}</TableCell><TableCell sx={{ fontSize: 12 }}>{r.status || "—"}</TableCell><TableCell sx={{ fontSize: 12, fontWeight: 700 }}>{pct}</TableCell></TableRow>;
            return <TableRow key={i} hover><TableCell sx={{ fontSize: 12 }}>{fmtDate(r.att_date)}</TableCell><TableCell sx={{ fontSize: 12 }}>{r.in_time?.slice(0, 5) || "—"}</TableCell><TableCell sx={{ fontSize: 12 }}>{r.out_time?.slice(0, 5) || "—"}</TableCell><TableCell><Chip size="small" label={r.status || "—"} sx={{ height: 18, fontSize: 11 }} /></TableCell><TableCell sx={{ fontSize: 12 }}>{r.work_hrs || r.ot_hrs || "—"}</TableCell></TableRow>;
          })}</TableBody></Table>
      );
    }
    if (["leaves-info", "encashment"].includes(selected)) {
      const groups = {};
      filtered.forEach(r => { const k = String(r.ltype || r.leave_type || "Other").toUpperCase(); (groups[k] = groups[k] || []).push(r); });
      const keys = Object.keys(groups).sort();
      return (
        <Table size="small" stickyHeader><TableHead><TableRow>{["Leave Type", "Eligible", "Availed", "Balance", "Status"].map(h => <TableCell key={h} sx={headSx}>{h}</TableCell>)}</TableRow></TableHead>
          <TableBody>{filtered.length === 0 ? <TableRow><TableCell colSpan={5} align="center" sx={{ py: 3, color: "#9e9e9e" }}>No leave info</TableCell></TableRow> : keys.map(k => {
            const arr = groups[k]; const totEl = arr.reduce((s, r) => s + (Number(r.eligible || r.cls_eligible || 0)), 0); const totAv = arr.reduce((s, r) => s + (Number(r.utilised || r.cls_utilised || 0)), 0); const totBal = arr.reduce((s, r) => s + (Number(r.balance || r.cls_balance || r.clBal || 0)), 0);
            return (
              <React.Fragment key={k}>
                <TableRow sx={{ bgcolor: "#f8f9fa" }}><TableCell sx={{ fontSize: 12, fontWeight: 800, color: theme.palette.primary.main }}>{k} — {arr.length}</TableCell><TableCell sx={{ fontSize: 12, fontWeight: 700 }}>{totEl || "—"}</TableCell><TableCell sx={{ fontSize: 12, fontWeight: 700 }}>{totAv || "—"}</TableCell><TableCell sx={{ fontSize: 12, fontWeight: 800 }}>{totBal || "—"}</TableCell><TableCell><Chip size="small" label={`${arr.length} rec`} sx={{ height: 18, fontSize: 11 }} /></TableCell></TableRow>
                {arr.slice(0, 20).map((r, i) => <TableRow key={i} hover><TableCell sx={{ fontSize: 12, pl: 3 }}>{r.ltype || r.leave_type || k}</TableCell><TableCell sx={{ fontSize: 12 }}>{r.eligible || r.cls_eligible || "—"}</TableCell><TableCell sx={{ fontSize: 12 }}>{r.utilised || r.cls_utilised || "—"}</TableCell><TableCell sx={{ fontSize: 12 }}>{r.balance || r.cls_balance || r.clBal || "—"}</TableCell><TableCell><Chip size="small" label={r.status || "Info"} sx={{ height: 18, fontSize: 11 }} /></TableCell></TableRow>)}
              </React.Fragment>
            );
          })}</TableBody></Table>
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
                  <Paper elevation={0} sx={{ px: 1.4, py: 0.7, borderRadius: 1, border: "1px solid #fbbc04", bgcolor: "#fef7e0", display: "flex", alignItems: "center", gap: 1 }}>
                    <Box sx={{ width: 26, height: 26, borderRadius: 1, bgcolor: "white", border: "1px solid #fdd663", display: "flex", alignItems: "center", justifyContent: "center", color: "#7a6500" }}><FaHourglassHalf size={11} /></Box>
                    <Box><Typography sx={{ fontSize: 14, fontWeight: 700, color: "#202124", lineHeight: 1 }}>{headerKpi.pending}</Typography><Typography sx={{ fontSize: 11, fontWeight: 700, color: "#5f6368", textTransform: "uppercase" }}>Pending</Typography></Box>
                  </Paper>
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
                <Box sx={{ p: 1.2, borderRadius: 1, border: "1px solid #e8eaed", bgcolor: "#ffffff" }}>
                  <Typography sx={{ fontSize: 11, fontWeight: 800, color: theme.palette.primary.main, letterSpacing: 0.6, textTransform: "uppercase", mb: 0.8, display: "flex", alignItems: "center", gap: 0.6 }}><FaCalendarAlt size={10} /> Period & Employee</Typography>
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                    <Box sx={{ display: "flex", gap: 0.6, minWidth: 0 }}>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#202124", mb: 0.4, whiteSpace: "nowrap" }}>Starting Date</Typography>
                        <TextField fullWidth size="small" type="date" value={(() => { const d = parseDDMONRR(startDate); return d ? d.toISOString().slice(0, 10) : ""; })()} onChange={e => { const v = e.target.value; if (!v) { setStartDate(""); return; } const d = new Date(v); const s = `${String(d.getDate()).padStart(2, "0")}-${["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"][d.getMonth()]}-${String(d.getFullYear()).slice(2)}`; setStartDate(s); }} InputLabelProps={{ shrink: true }} InputProps={{ endAdornment: <InputAdornment position="end"><FaCalendarAlt size={12} color="#5f6368" /></InputAdornment> }} helperText={startDate ? startDate : "DD-MON-RR"} FormHelperTextProps={{ sx: { fontSize: 9, m: 0, color: "#80868b", whiteSpace: "nowrap" } }} sx={{ "& input": { height: 18, fontSize: 11, px: 0.5 }, "& .MuiOutlinedInput-root": { borderRadius: 1, bgcolor: "white", minWidth: 0 }, "& input::-webkit-calendar-picker-indicator": { opacity: 1, cursor: "pointer", marginLeft: 4 } }} />
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#202124", mb: 0.4, whiteSpace: "nowrap" }}>Ending Date</Typography>
                        <TextField fullWidth size="small" type="date" value={(() => { const d = parseDDMONRR(endDate); return d ? d.toISOString().slice(0, 10) : ""; })()} onChange={e => { const v = e.target.value; if (!v) { setEndDate(""); return; } const d = new Date(v); const s = `${String(d.getDate()).padStart(2, "0")}-${["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"][d.getMonth()]}-${String(d.getFullYear()).slice(2)}`; setEndDate(s); }} InputLabelProps={{ shrink: true }} InputProps={{ endAdornment: <InputAdornment position="end"><FaCalendarAlt size={12} color="#5f6368" /></InputAdornment> }} helperText={endDate ? endDate : "DD-MON-RR"} FormHelperTextProps={{ sx: { fontSize: 9, m: 0, color: "#80868b", whiteSpace: "nowrap" } }} sx={{ "& input": { height: 18, fontSize: 11, px: 0.5 }, "& .MuiOutlinedInput-root": { borderRadius: 1, bgcolor: "white", minWidth: 0 }, "& input::-webkit-calendar-picker-indicator": { opacity: 1, cursor: "pointer", marginLeft: 4 } }} />
                      </Box>
                    </Box>
                    <Box sx={{ display: "flex", gap: 0.8 }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#202124", mb: 0.4 }}>Month</Typography>
                        <Select fullWidth size="small" value={month} onChange={e => setMonth(e.target.value)} sx={{ height: 34, fontSize: 12, bgcolor: "white", borderRadius: 1 }}>{MONTHS.map(m => <MenuItem key={m.value} value={m.value} sx={{ fontSize: 12 }}>{m.label.slice(0, 3)}</MenuItem>)}</Select>
                      </Box>
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
                  <Button fullWidth size="small" variant="contained" startIcon={reportType === "PDF" ? <FaDownload size={11} /> : <FaEye size={11} />} onClick={handleExport} disabled={isPayslipGenerated && APP_REPORTS.some(r => r.id === selected)} sx={{ fontSize: 12, fontWeight: 700, height: 32, borderRadius: 1 }}>Run</Button>
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
                      {isMonthly && selected !== "holidays" && <Box sx={{ display: "flex", gap: 0.5, alignItems: "center", bgcolor: "white", border: "1px solid #e8eaed", borderRadius: 1, px: 0.6, py: 0.3 }}><Select size="small" value={month} onChange={e => setMonth(e.target.value)} variant="standard" disableUnderline sx={{ fontSize: 12, fontWeight: 700, minWidth: 90 }}>{MONTHS.map(m => <MenuItem key={m.value} value={m.value} sx={{ fontSize: 12 }}>{m.label.slice(0, 3)}</MenuItem>)}</Select><Divider orientation="vertical" flexItem sx={{ mx: 0.4 }} /><Select size="small" value={year} onChange={e => setYear(e.target.value)} variant="standard" disableUnderline sx={{ fontSize: 12, fontWeight: 700, minWidth: 64 }}>{[2023, 2024, 2025, 2026, 2027].map(y => <MenuItem key={y} value={y} sx={{ fontSize: 12 }}>{y}</MenuItem>)}</Select><Button size="small" onClick={fetchData} sx={{ minWidth: 0, px: 1, height: 24, fontSize: 11, fontWeight: 800, bgcolor: theme.palette.primary.main, color: "white" }}>Go</Button></Box>}
                      <TextField size="small" placeholder="Search…" value={search} onChange={e => setSearch(e.target.value)} InputProps={{ startAdornment: <InputAdornment position="start"><FaSearch size={11} color="#9aa0a6" /></InputAdornment>, sx: { height: 30, fontSize: 12, bgcolor: "white", borderRadius: 1 } }} sx={{ width: 150 }} />
                      <Tooltip title="Export"><IconButton size="small" onClick={handleExport} sx={{ width: 30, height: 30, bgcolor: "white", border: "1px solid #e8eaed" }}><FaFileCsv size={12} color={theme.palette.primary.main} /></IconButton></Tooltip>
                      <IconButton size="small" onClick={fetchData} sx={{ width: 30, height: 30, bgcolor: "white", border: "1px solid #e8eaed" }}><RefreshIcon sx={{ fontSize: 15, color: "#5f6368" }} /></IconButton>
                    </Box>
                  </Box>
                  <Box>{renderTable()}</Box>
                  <Box sx={{ px: 1.4, py: 0.8, bgcolor: "#f8f9fa", borderTop: "1px solid #e8eaed", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <Typography sx={{ fontSize: 11, color: "#5f6368" }}>Showing {filtered.length} of {data.length}{selected !== "holidays" ? ` • ${MONTHS[month - 1].label} ${year}` : ""}</Typography>
                    <Button size="small" startIcon={<FaArrowLeft size={10} />} onClick={() => { setSelected(null); navigate("/my-reports", { replace: true }); }} sx={{ fontSize: 12, fontWeight: 700, height: 26, borderRadius: 1 }}>Back to Reports</Button>
                  </Box>
                </Paper>
              )}
            </Box>
          </Grid>
        </Grid>
      </Box>
      <Dialog open={viewOpen} onClose={() => setViewOpen(false)} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 1, maxHeight: "90vh" } }}>
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13, fontWeight: 700, py: 1.2 }}>Payslip — {viewData?.C_ENAME} ({viewData?.C_EMPID}) — {viewData?.C_MONTH} {viewData?.C_YEAR} <IconButton size="small" onClick={() => setViewOpen(false)} sx={{ bgcolor: "#f1f3f4" }}><CloseIcon sx={{ fontSize: 16 }} /></IconButton></DialogTitle>
        <DialogContent dividers sx={{ p: 1, bgcolor: "#f8f9fa" }}>
          {viewData && (() => {
            const p = viewData; const emp = p.employee || {}; const off = emp.official || {}; return (
              <Box id="my-payslip-print" sx={{ fontSize: 11, bgcolor: "white", p: 1, borderRadius: 1 }}>
                <table className="payslip-table payslip-outer-border" style={{ width: "100%", borderCollapse: "collapse" }}>
                  <colgroup><col style={{ width: "9%" }} /><col style={{ width: "9%" }} /><col style={{ width: "13%" }} /><col style={{ width: "7%" }} /><col style={{ width: "14%" }} /><col style={{ width: "5%" }} /><col style={{ width: "8%" }} /><col style={{ width: "8%" }} /><col style={{ width: "17%" }} /><col style={{ width: "10%" }} /></colgroup>
                  <tbody>
                    <tr><td className="payslip-logo-cell" colSpan={2} style={{ border: "1px solid #aaa", padding: 4 }}><img src={logo} alt="logo" style={{ height: 36 }} /></td><td className="payslip-company-cell" colSpan={8} style={{ border: "1px solid #aaa", padding: 4, textAlign: "center", fontWeight: 700 }}>{companyName || "AUCTOR HOME APPLIANCES LLP"}<br /><span style={{ fontSize: 10, fontWeight: 400 }}>Plot No 21 & 22, Phase IV, IDA, Jeedimetla, Hyderabad</span></td></tr>
                    <tr><td colSpan={10} style={{ border: "1px solid #aaa", padding: 4, background: "#f5f5f5", textAlign: "center", fontWeight: 700 }}>Salary Slip For The Month of : {p.C_MONTH} - {p.C_YEAR}</td></tr>
                    <tr><td style={{ border: "1px solid #aaa", padding: 4, fontWeight: 700 }}>Employee ID</td><td colSpan={2} style={{ border: "1px solid #aaa", padding: 4, fontWeight: 700 }}>{p.C_EMPID}</td><td colSpan={2} style={{ border: "1px solid #aaa", padding: 4 }}>D O J :</td><td colSpan={2} style={{ border: "1px solid #aaa", padding: 4 }}>Designation:</td><td colSpan={3} style={{ border: "1px solid #aaa", padding: 4 }}>{p.C_DESIG}</td></tr>
                    <tr><td style={{ border: "1px solid #aaa", padding: 4 }}>Employee Name</td><td colSpan={2} style={{ border: "1px solid #aaa", padding: 4, fontWeight: 700 }}>{p.C_ENAME}</td><td colSpan={2} style={{ border: "1px solid #aaa", padding: 4 }}>{formatDOJ(off.doj)}</td><td colSpan={2} style={{ border: "1px solid #aaa", padding: 4 }}>Department:</td><td colSpan={3} style={{ border: "1px solid #aaa", padding: 4 }}>{p.C_DEPT}</td></tr>
                    <tr><td style={{ border: "1px solid #aaa", padding: 4 }}>Total Days</td><td style={{ border: "1px solid #aaa", padding: 4, textAlign: "center" }}>{Math.round(p.C_TOT_DAYS)}</td><td style={{ border: "1px solid #aaa", padding: 4 }}>Days Present:</td><td style={{ border: "1px solid #aaa", padding: 4, textAlign: "center" }}>{Math.round(p.C_DAYS_PRESENT)}</td><td style={{ border: "1px solid #aaa", padding: 4 }}>Leaves Allowed:</td><td style={{ border: "1px solid #aaa", padding: 4, textAlign: "center" }}>{Math.round(p.C_LEAVES_ALLOWED || 0)}</td><td colSpan={2} style={{ border: "1px solid #aaa", padding: 4 }}>UAN Number</td><td colSpan={2} style={{ border: "1px solid #aaa", padding: 4, textAlign: "center", fontWeight: 700 }}>{off.c_uan_no || "N/A"}</td></tr>
                    <tr className="payslip-bg-grey" style={{ background: "#f5f5f5", fontWeight: 700, textAlign: "center" }}><td colSpan={2} style={{ border: "1px solid #aaa", padding: 4 }}>Fixed Salary</td><td colSpan={4} style={{ border: "1px solid #aaa", padding: 4 }}>Earnings Salary</td><td colSpan={4} style={{ border: "1px solid #aaa", padding: 4 }}>Deductions</td></tr>
                    <tr><td style={{ border: "1px solid #aaa", padding: 4 }}>Basic</td><td style="border:1px solid #aaa" style={{ border: "1px solid #aaa", padding: 4, textAlign: "right" }}>{formatCurrency(p.C_BASIC)}</td><td style={{ border: "1px solid #aaa", padding: 4 }}>Basic</td><td style={{ border: "1px solid #aaa", padding: 4, textAlign: "right" }}>{formatCurrency(p.C_EARNED_BASIC)}</td><td style={{ border: "1px solid #aaa", padding: 4 }}>Attendance Bonus</td><td style={{ border: "1px solid #aaa", padding: 4, textAlign: "right" }}>{formatCurrency(p.C_EARNED_BONUS)}</td><td style={{ border: "1px solid #aaa", padding: 4 }}>P.F</td><td style={{ border: "1px solid #aaa", padding: 4, textAlign: "right" }}>{formatCurrency(p.C_DED_PF)}</td><td style={{ border: "1px solid #aaa", padding: 4 }}>Income tax</td><td style={{ border: "1px solid #aaa", padding: 4, textAlign: "right" }}>{formatCurrency(p.C_DED_TAX)}</td></tr>
                    <tr><td style={{ border: "1px solid #aaa", padding: 4 }}>HRA</td><td style={{ border: "1px solid #aaa", padding: 4, textAlign: "right" }}>{formatCurrency(p.C_HRA)}</td><td style={{ border: "1px solid #aaa", padding: 4 }}>HRA</td><td style={{ border: "1px solid #aaa", padding: 4, textAlign: "right" }}>{formatCurrency(p.C_EARNED_HRA)}</td><td style={{ border: "1px solid #aaa", padding: 4 }}>Extra Wage</td><td style={{ border: "1px solid #aaa", padding: 4, textAlign: "right" }}>{formatCurrency(p.C_EARNED_OT)}</td><td style={{ border: "1px solid #aaa", padding: 4 }}>E.S.I</td><td style={{ border: "1px solid #aaa", padding: 4, textAlign: "right" }}>{formatCurrency(p.C_DED_ESI)}</td><td style={{ border: "1px solid #aaa", padding: 4 }}>Advance</td><td style={{ border: "1px solid #aaa", padding: 4, textAlign: "right" }}>{formatCurrency(p.C_DED_ADV)}</td></tr>
                    <tr><td style={{ border: "1px solid #aaa", padding: 4, fontWeight: 700 }}>Total Fixed Salary</td><td style={{ border: "1px solid #aaa", padding: 4, textAlign: "right", fontWeight: 700 }}>{formatCurrency(p.C_TOT_SAL)}</td><td colSpan={2} style={{ border: "1px solid #aaa", padding: 4 }}>Total Earnings :</td><td colSpan={2} style={{ border: "1px solid #aaa", padding: 4, textAlign: "right", fontWeight: 700 }}>{formatCurrency(p.C_EARNED_GROSS)}</td><td colSpan={2} style={{ border: "1px solid #aaa", padding: 4 }}>Total Deduction:</td><td colSpan={2} style={{ border: "1px solid #aaa", padding: 4, textAlign: "right", fontWeight: 700 }}>{formatCurrency(p.C_TOT_DED)}</td></tr>
                    <tr><td style={{ border: "1px solid #aaa", padding: 4, fontWeight: 700 }}>NET Salary :</td><td style={{ border: "1px solid #aaa", padding: 4, textAlign: "right", fontWeight: 700 }}>{formatCurrency(p.C_NET_AMT)}</td><td colSpan={2} style={{ border: "1px solid #aaa", padding: 4 }}>Payment Mode :</td><td colSpan={2} style={{ border: "1px solid #aaa", padding: 4 }}>{p.C_PAY_TYPE || "Bank"}</td><td colSpan={2} style={{ border: "1px solid #aaa", padding: 4 }}>Bank A/c No :</td><td colSpan={2} style={{ border: "1px solid #aaa", padding: 4 }}>{p.C_BANK_ACNO || "-"}</td></tr>
                  </tbody>
                </table>
              </Box>
            );
          })()}
        </DialogContent>
        <Box sx={{ p: 1.2, display: "flex", justifyContent: "flex-end", gap: 1, bgcolor: "white" }}><Button variant="outlined" startIcon={<PrintIcon />} onClick={() => window.print()} sx={{ borderRadius: 1, fontWeight: 700 }}>Print</Button><Button variant="contained" startIcon={<FaDownload />} onClick={() => downloadPayslip(viewData)} sx={{ borderRadius: 1, fontWeight: 700 }}>Download</Button><Button variant="text" onClick={() => setViewOpen(false)} sx={{ fontWeight: 700 }}>Close</Button></Box>
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
