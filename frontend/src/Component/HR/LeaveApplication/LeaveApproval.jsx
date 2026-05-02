import React, { useEffect, useMemo, useState, useRef } from "react";
import axios from 'axios';
import {
  Box, Card, CardContent, Typography, Tabs, Tab, TextField, InputAdornment,
  IconButton, Button, Chip, Divider, Stack, Drawer, Avatar, Tooltip, MenuItem,
  Dialog, DialogTitle, DialogContent, DialogActions, Checkbox, FormControlLabel
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import CloseIcon from "@mui/icons-material/Close";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import RefreshIcon from "@mui/icons-material/Refresh";
import ClearIcon from "@mui/icons-material/Clear";
import { useToast } from "../../../context/ToastContext";

const toYMD = (d) => {
  if (!d) return "";
  const date = new Date(d);
  if (isNaN(date.getTime())) return "";
  return date.toISOString().split('T')[0];
};

/** ---- MOCK DATA (replace with API results) ---- */
const mockRows = [
  { id: 236977, empId: 3016, empName: "MALLIKARJUNA RAO KOTA", unit: "UNIT-1", dept: "PRODUCTION", desg: "Supervisor",
    purpose: "PERSONAL", address: "CHINTAL, HYD-500054", phone: "9441341993",
    from: "2025-08-01", to: "2025-08-03", nod: 2,
    clUsed: 4.5, elUsed: 14, clBal: 2.5, elBal: 0, status: "Pending", entry: "01-AUG-25 07.54",
    days: [
      { date: "2025-08-08", dayType: "SH", type: "", remarks: "" },
      { date: "2025-08-09", dayType: "FULL DAY", type: "", remarks: "" },
      { date: "2025-08-10", dayType: "FIRST HALF", type: "", remarks: "" }
    ]
  },
  { id: 236981, empId: 61002, empName: "MAKIREDDI LOKESH", unit: "UNIT-6", dept: "PRODUCTION", desg: "Trainee Operator",
    purpose: "PERSONAL", address: "HYDERABAD", phone: "", from: "2025-08-08", to: "2025-08-09",
     nod: 1, clUsed: 0, elUsed: 0, clBal: 4, elBal: 12, status: "Pending", entry: "01-AUG-25 10.09",
    days: [
      { date: "2025-08-08", dayType: "FULL DAY", type: "", remarks: "" },
      { date: "2025-08-09", dayType: "FULL DAY", type: "", remarks: "" },

    ]
  },
];

export default function LeaveApprovalPage() {

     const { showToast } = useToast();
  /** ---------- State ---------- */
  const [tab, setTab] = useState("pending");
  const [filters, setFilters] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    end: new Date(Date.now()).toISOString().split("T")[0],
    appNo: "",
    empId: "",
    q: "",
  });

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selected, setSelected] = useState([]);

  // sanction form state (inside drawer)
  const [sanction, setSanction] = useState({ cls: "", els: "", remarks: "" });

   // ✅ real data from backend
 const [rows, setRows] = useState([]);
//  useEffect(() => {
//    axios.get(`${import.meta.env.VITE_API_URL}/leave/pendingleaves`)
//      .then(res => {
//        console.log("API Response:", res.data);
//        setRows(res.data);
//      })
//      .catch(err => console.error("Failed to load leave apps", err));
//  }, []);

  const fetchPendingLeaves = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/leave/all-leaves`);
      console.log("API Response:", res.data);
      setRows(res.data);
    } catch (err) {
      console.error("Failed to load leaves", err);
    }
  };

// Run once on mount
useEffect(() => {
  fetchPendingLeaves();
}, []);

const clearFilters = () => {
  setFilters({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    end: new Date(Date.now()).toISOString().split("T")[0],
    appNo: "",
    empId: "",
    q: "",
  });
};
  /** ---------- Grid Columns ---------- */
  const columns = useMemo(() => [
    ...(tab === "pending" ? [{
      field: "approve",
      headerName: "Approve",
      width: 110,
      sortable: false,
      renderCell: (params) => (
        <Button
          size="small"
          variant="text"
          onClick={() => openDrawer(params.row)}
        >
          Approve
        </Button>
      ),
    }] : []),
    ...(tab === "completed" ? [{
      field: "cancelApproval",
      headerName: "Action",
      width: 140,
      sortable: false,
      renderCell: (params) => (
        <Button
          size="small"
          variant="outlined"
          color="error"
          onClick={() => handleCancelApproval(params.row)}
        >
          Cancel Approval
        </Button>
      ),
    }] : []),
    ...(tab === "cancelled" ? [{
      field: "reopen",
      headerName: "Action",
      width: 140,
      sortable: false,
      renderCell: (params) => (
        <Button
          size="small"
          variant="outlined"
          color="primary"
          onClick={() => handleReopen(params.row)}
        >
          Re-process
        </Button>
      ),
    }] : []),
    { field: "id", headerName: "Leave App #", width: 160 },
    { field: "ldate", headerName: "Entry Date", width: 180,
      valueGetter: (value) => value ? new Date(value).toLocaleString() : ""
    },
    { field: "unit", headerName: "Unit", width: 90 },
    {
      field: "empDetails",
      headerName: "Employee Name",
      flex: 1,
      minWidth: 220,
      valueGetter: (value, row) => `${row.empId ?? ""} - ${row.empName ?? ""}`,
    },
    { field: "desg", headerName: "Designation", width: 160 },
    { field: "dept", headerName: "Department", width: 150 },
    { field: "purpose", headerName: "Purpose", width: 120 },
    { field: "address", headerName: "Address/ Purpose", flex: 1.2, minWidth: 220 },
    { field: "phone", headerName: "Phone No", width: 130 },
    { field: "clBal", headerName: "CLs Balance", width: 120, type: "number", align: "center", headerAlign: "center" },
    { field: "elBal", headerName: "ELs Balance", width: 120, type: "number", align: "center", headerAlign: "center" },
    { field: "status", headerName: "Status", width: 120,
      renderCell: (params) => (
        <Chip 
          label={params.value} 
          size="small" 
          color={params.value === "Approved" ? "success" : params.value === "Cancelled" ? "error" : "primary"}
          variant="outlined"
        />
      )
    },
    { field: "remarks", headerName: "HR Remarks", flex: 1, minWidth: 150 },
  ], [tab]);


   // ✅ calculate here inside the component
  const totalCLs = (sanction.days || []).reduce((total, d) => {
    if (d.type === "CL") {
      if (d.dayType === "FULL DAY") {
        total += 1;
      } else if (d.dayType === "FIRST HALF" || d.dayType === "SECOND HALF" || d.dayType === "HALF DAY") {
        total += 0.5;
      }
    }
    return total;
  }, 0);

  const totalELs = (sanction.days || []).reduce((total, d) => {
    if (d.type === "EL") {
      if (d.dayType === "FULL DAY") {
        total += 1;
      } else if (d.dayType === "FIRST HALF" || d.dayType === "SECOND HALF" || d.dayType === "HALF DAY") {
        total += 0.5;
      }
    }
    return total;
  }, 0);

  const totalLOP = (sanction.days || []).reduce((total, d) => {
    if (d.type === "LOP") {
      if (d.dayType === "FULL DAY") {
        total += 1;
      } else if (d.dayType === "FIRST HALF" || d.dayType === "SECOND HALF" || d.dayType === "HALF DAY") {
        total += 0.5;
      }
    }
    return total;
  }, 0);

  function formatDateDMY(dateStr) {
  const d = new Date(dateStr);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
}


function formatDateDMYHM(dateStr) {
  const d = new Date(dateStr);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();

  let hours = d.getHours();                  // Use d here, not dateStr
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;                  // convert 0 to 12 for 12 AM

  return `${day}-${month}-${year} ${hours}:${minutes} ${ampm}`;
}

function sortDays(days) {
  return [...days].sort((a, b) => new Date(a.date) - new Date(b.date));
}

  /** ---------- Handlers ---------- */
  // const openDrawer = (row) => {
  //   //const relatedRows = rows.filter(r => r.id === row.id); // or appNo if that’s your grouping
  // //setSelected(relatedRows);
  //   setSelected(row);
  //   setSanction({ cls: "", els: "", remarks: "" });
  //   setDrawerOpen(true);
  // };

  const openDrawer = (row) => {
  const sortedDays = sortDays(row.days || generateDays(row.from, row.to, row.dayType));
  setSelected({ ...row, days: sortedDays });
  setSanction({ days: sortedDays, cls: "", els: "", remarks: "" });
  setDrawerOpen(true);
};

  const closeDrawer = () => {
    setDrawerOpen(false);
    setSelected(null);
  };
 const leaveRefs = useRef([]);
  const onApprove = async () => {
    // Basic validations: numeric, non-negative, not exceeding balances, and not exceeding nod total

 
    const cls = Number(totalCLs || 0);
    const els = Number(totalELs || 0);
    const lop = Number(totalLOP || 0);
   

    const days = sanction.days || selected.days || [];
    if (!days.length) {
      showToast("No leave days available to approve.", "error");
      return;
    }

    const invalidIndex = days.findIndex(d => !d.type);

    if (invalidIndex !== -1) {
      showToast(`Please select Leave Type for row ${invalidIndex + 1}`, "error");
      leaveRefs.current[invalidIndex]?.focus();
      return;
    }

    if (cls === 0 && els === 0 && lop === 0) {
      showToast("You are not approving any leave", "warning");
      return;
    }

    if (cls > (selected?.clBal ?? 0)) {
      showToast("CLs sanction exceeds available CL balance.", "error");
      return;
    }
    if (els > (selected?.elBal ?? 0)) {
      showToast("ELs sanction exceeds available EL balance.", "error");
      return;
    }
    if (cls + els + lop > (selected?.nod ?? 0)) {
      showToast("Total sanction cannot exceed No. of Days.", "error");
      return;
    }

    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/leave/approve`, {
        lno: selected.id,
        empid: selected.empId,
        frmdt: selected.from,
        todate: selected.to,
        nod: selected.nod,
        cl_sanction: cls,
        el_sanction: els,
        app_remarks: sanction.remarks,
        unit: selected.unit,
        days: sanction.days || selected.days || [],
      });

      if (res.data.success) {
        showToast("Leave approved successfully ✅", "success");
        await fetchPendingLeaves();
        closeDrawer();
      } else {
        showToast(res.data.message, "error");
      }
    } catch (err) {
      console.error("Approval failed:", err);
      const errorMessage = err.response?.data?.message || err.message;
      showToast(errorMessage, "error");
    }
  };

  const onReject = async () => {
    if (!selected) return;
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/leave/reject`, {
        lno: selected.id,
        app_remarks: sanction.remarks
      });
      if (res.data.success) {
        showToast("Leave rejected successfully", "success");
        await fetchPendingLeaves();
        closeDrawer();
      } else {
        showToast(res.data.message, "error");
      }
    } catch (err) {
      console.error("Rejection failed:", err);
      showToast("Error rejecting leave", "error");
    }
  };
  const [leaveType, setLeaveType] = useState('');

  // Handle the change event when selecting CL or EL
  const handleLeaveTypeChange = (e) => {
    const selectedLeaveType = e.target.value;
    setLeaveType(selectedLeaveType);
    console.log('Selected Leave Type:', selectedLeaveType); // Log the selection
  };

  const [cancelDialog, setCancelDialog] = useState({ open: false, row: null, selectedDates: [], remarks: "" });

  const handleCancelApproval = (row) => {
    console.log("Cancelling approval for row:", row);
    setCancelDialog({ 
      open: true, 
      row: row, 
      selectedDates: row.days?.map(d => new Date(d.date).toISOString().split('T')[0]) || [], 
      remarks: "" 
    });
  };

  const handleConfirmCancel = async () => {
    if (cancelDialog.selectedDates.length === 0) {
      showToast("Please select at least one date to cancel", "warning");
      return;
    }
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/leave/cancel-partial`, {
        lno: cancelDialog.row.id,
        dates: cancelDialog.selectedDates,
        remarks: cancelDialog.remarks
      });
      if (res.data.success) {
        showToast(res.data.message, "success");
        setCancelDialog({ open: false, row: null, selectedDates: [], remarks: "" });
        await fetchPendingLeaves();
      } else {
        showToast(res.data.message, "error");
      }
    } catch (err) {
      console.error("Cancel failed:", err);
      showToast("Error during cancellation", "error");
    }
  };

  const toggleDateSelection = (date) => {
    const formattedDate = toYMD(date);
    setCancelDialog(prev => ({
      ...prev,
      selectedDates: prev.selectedDates.includes(formattedDate)
        ? prev.selectedDates.filter(d => d !== formattedDate)
        : [...prev.selectedDates, formattedDate]
    }));
  };

  const handleReopen = async (row) => {
    if (!window.confirm(`Are you sure you want to re-process LApp #${row.id}? It will move back to Pending.`)) return;
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/leave/reopen`, {
        lno: row.id
      });
      if (res.data.success) {
        showToast("Leave application reopened for approval", "success");
        await fetchPendingLeaves();
      } else {
        showToast(res.data.message, "error");
      }
    } catch (err) {
      console.error("Reopen failed:", err);
      showToast("Error reopening leave", "error");
    }
  };

  const counts = useMemo(() => {
    return {
      pending: rows.filter(r => r.status === "Pending").length,
      completed: rows.filter(r => r.status === "Approved").length,
      cancelled: rows.filter(r => ["Cancelled", "Rejected"].includes(r.status)).length
    };
  }, [rows]);

  /** ---------- Filtering (client side demo) ---------- */
  const filtered = useMemo(() => {
    return rows.filter(r => {
      const entryDate = toYMD(r.ldate);
      const inDate =
        (!filters.start || entryDate >= filters.start) &&
        (!filters.end || entryDate <= filters.end);
      const matchApp = !filters.appNo || String(r.id).includes(filters.appNo.trim());
      const matchEmp = !filters.empId || String(r.empId).includes(filters.empId.trim());
      const q = filters.q.toLowerCase();
      const matchQ = !q || [r.empName, r.dept, r.desg, r.purpose, r.address].some(v => v && v.toLowerCase().includes(q));
      
      const targetStatuses = 
        tab === "pending" ? ["Pending"] : 
        tab === "completed" ? ["Approved"] : 
        ["Cancelled", "Rejected"];

      return inDate && matchApp && matchEmp && matchQ && targetStatuses.includes(r.status);
    });
  }, [filters, rows, tab]);


  const dedupedRows = React.useMemo(() => {
  const seen = new Set();
  return filtered.filter(row => {
    if (seen.has(row.id)) {
      return false; // skip duplicate
    } else {
      seen.add(row.id);
      return true; // keep first occurrence
    }
  });
}, [filtered]);


// Utility to generate individual days between from/to
const generateDays = (from, to, daytype) => {
  const days = [];
  let current = new Date(from);
  const end = new Date(to);
  while (current <= end) {
    days.push({ date: current.toISOString().split("T")[0], dayType:daytype,type: "", remarks: "" });
    current.setDate(current.getDate() + 1);
  }
  return days;
};


  /** ---------- UI ---------- */
  return (
    <Box sx={{ p: 1, bgcolor: "#f5f7fa", minHeight: "100vh" }}>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 2 }}>
        Leave Approval
      </Typography>

      {/* Filters + Tabs */}
      <Card sx={{ borderRadius: 2, boxShadow: "0 2px 12px rgba(16,24,40,0.06)", mb: 2 }}>
        <CardContent sx={{ pb: 1.5 }}>
          <Stack direction="row" spacing={2} flexWrap="wrap">
            <TextField
              label="Select Start Date"
              type="date"
              value={filters.start}
              onChange={(e) => setFilters(s => ({ ...s, start: e.target.value }))}
              InputLabelProps={{ shrink: true }}
              size="small"
            />
            <TextField
              label="Select End Date"
              type="date"
              value={filters.end}
              onChange={(e) => setFilters(s => ({ ...s, end: e.target.value }))}
              InputLabelProps={{ shrink: true }}
              size="small"
            />
            <TextField
              label="Application No"
              value={filters.appNo}
              onChange={(e) => setFilters(s => ({ ...s, appNo: e.target.value }))}
              size="small"
            />
            <TextField
              label="Employee Id"
              value={filters.empId}
              onChange={(e) => setFilters(s => ({ ...s, empId: e.target.value }))}
              size="small"
            />
            <TextField
              label="Search"
              value={filters.q}
              onChange={(e) => setFilters(s => ({ ...s, q: e.target.value }))}
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
            <Tooltip title="More filters">
              <IconButton size="small"><FilterListIcon fontSize="small" /></IconButton>
            </Tooltip>
            <Button variant="outlined" size="small" startIcon={<RefreshIcon />} onClick={fetchPendingLeaves}>
              Refresh
            </Button>
            <Button variant="outlined" size="small" startIcon={<ClearIcon />} onClick={clearFilters}>
              Clear
            </Button>
          </Stack>

          <Tabs value={tab} onChange={(e, v) => setTab(v)} sx={{ mt: 2 }}>
            <Tab value="pending" label={`Pending (${counts.pending})`} />
            <Tab value="completed" label={`Completed (${counts.completed})`} />
            <Tab value="cancelled" label={`Cancelled (${counts.cancelled})`} />
          </Tabs>
        </CardContent>
      </Card>

      {/* Pending Grid (demo shows only pending) */}
      <Card sx={{ borderRadius: 2, boxShadow: "0 2px 12px rgba(16,24,40,0.06)" }}>
        <Box sx={{ px: 2, py: 1.5, bgcolor: "#02AAB0", color: "#fff", borderTopLeftRadius: 8, borderTopRightRadius: 8 }}>
          <Typography fontWeight={700}>Pending Leave Approval Details</Typography>
        </Box>
        <CardContent sx={{ pt: 1 }}>
          <div style={{ height: 520, width: "100%" }}>
            <DataGrid
              rows={dedupedRows}
              columns={columns}
              getRowId={(row) => `${row.id}_${row.from}_${row.to}`}
              pageSizeOptions={[10, 25, 50]}
              initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
              disableColumnMenu
              sx={{
                border: 0,
                "& .MuiDataGrid-columnHeaders": {
                  bgcolor: "#f2f4f7",
                  fontWeight: 700,
                },
                "& .MuiDataGrid-row:hover": {
                  bgcolor: "#f8fafc",
                },
                "& .MuiDataGrid-cell": { fontSize: ".92rem" },
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* ---------- Right Drawer: Approval Details ---------- */}
   <Drawer
  anchor="right"
  open={drawerOpen}
  onClose={closeDrawer}
  sx={{
    zIndex: (theme) => theme.zIndex.drawer + 100,
    // zIndex: (theme) => theme.zIndex.drawer
  }}
  PaperProps={{
    sx: {
      width: 520,
      borderLeft: "1px solid #e5e7eb",
      display: "flex",
      flexDirection: "column",
      height: "100vh",
    },
  }}
>
  {/* Drawer Header */}
  <Box
    sx={{
      p: 2,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      borderBottom: "1px solid #e5e7eb",
      flexShrink: 0,
    }}
  >
    <Typography variant="h6" fontWeight={700}>
      Leave Approval
    </Typography>
    <IconButton onClick={closeDrawer}>
      <CloseIcon />
    </IconButton>
  </Box>

  {/* Scrollable Content */}
  <Box sx={{ flex: 1, overflowY: "auto", p: 2 }}>
    
  {selected && (
    <>
      {/* Employee Info */}
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
        <Avatar sx={{ bgcolor: "#0ea5e9" }}>
          {selected.empName?.[0]}
        </Avatar>
        <Box>
          <Typography fontWeight={700}>{selected.empName}</Typography>
          <Typography variant="body2" color="text.secondary">
            Emp ID: {selected.empId} • {selected.desg} • {selected.dept}
          </Typography>
        </Box>
      </Stack>

      {/* Leave Info */}
      <Card variant="outlined" sx={{ mb: 2 }}>
        <CardContent sx={{ py: 1.5 }}>
          <GridRow label="LApp No" value={selected.id} />
          <GridRow label="Date" value={formatDateDMYHM(selected.entry)} />
          <GridRow label="Purpose" value={selected.purpose} />
          <GridRow label="Phone" value={selected.phone || "—"} />
          <GridRow label="Address / Reason" value={selected.address} />
        </CardContent>
      </Card>

      {/* Balances */}
      <Stack direction="row" spacing={1.5} sx={{ mb: 2 }}>
        <StatTile title="CLs Balance" value={selected.clBal} color="#1e3a8a" bg="#dbeafe" />
        <StatTile title="ELs Balance" value={selected.elBal} color="#064e3b" bg="#d1fae5" />
        <StatTile title="Requested Days" value={selected.nod} color="#991b1b" bg="#fee2e2" />
      </Stack>

      {/* Day-wise Approval Grid */}
    <Card variant="outlined" sx={{ mb: 2 }}>
  <CardContent sx={{ py: 1.5 }}>
    <Typography fontWeight={700} sx={{ mb: 1 }}>
      Day-wise Approval
    </Typography>

    <Stack spacing={1}>
      {(sanction.days || selected.days || generateDays(selected.from, selected.to,selected.dayType)).map((day, index) => (

        <Stack direction="row" spacing={1.5} alignItems="center" key={index}>
          {/* Date */}
          <Typography sx={{ width: 80 }}>{formatDateDMY(day.date)}</Typography>

          {/* Day Type */}
          <TextField
            select
            label="Day Type"
            value={day.dayType || ""}
            onChange={(e) => {
              const newDayType = e.target.value;
   
            setSanction((s) => {
              const updated = [...(s.days || selected.days || generateDays(selected.from, selected.to))];
              updated[index] = { ...updated[index], type: leaveType };
              return { ...s, days: sortDays(updated) };
            });
            }}
            size="small"
            sx={{ flex: 1 }}
          >
            <MenuItem value="FULL DAY">FULL DAY</MenuItem>
            <MenuItem value="HALF DAY">FIRST HALF</MenuItem>
            <MenuItem value="SECOND HALF">SECOND HALF</MenuItem>
          </TextField>

          {/* Leave Type */}
          <TextField
            select
            label="Leave Type"
            value={day.type || ""}
            onChange={(e) => {
              const leaveType = e.target.value;
              setSanction((s) => {
                const updated = [...(s.days || selected.days || generateDays(selected.from, selected.to))];
                updated[index] = { ...updated[index], type: leaveType };
                return { ...s,days: sortDays(updated) };
              });
            }}
            size="small"
            sx={{ flex: 1 }}
            required
            inputRef={(el) => (leaveRefs.current[index] = el)}
  //error={!day.type}  👈 highlights red if empty
//  helperText={!day.type ? "Leave type required" : ""}  👈 shows error message
          >
            <MenuItem value="CL">CL</MenuItem>
            <MenuItem value="EL">EL</MenuItem>
            <MenuItem value="LOP">LOP</MenuItem>
          </TextField>

          {/* Remarks */}
          <TextField
            label="Remarks"
            value={day.remarks || ""}
            onChange={(e) => {
              const remarks = e.target.value;
              setSanction((s) => {
                const updated = [...(s.days || selected.days || generateDays(selected.from, selected.to))];
                updated[index] = { ...updated[index], remarks };
                return { ...s,days: sortDays(updated) };
              });
            }}
            size="small"
            sx={{ flex: 2 }}
          />
        </Stack>
      ))}
    </Stack>
  </CardContent>
</Card>

{/* Totals */}






<Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 1.5, mb: 2 }}>
  <CompactTotal
    label="Total CLs"
    value={totalCLs}
    color="primary"
  />
  <CompactTotal
    label="Total ELs"
    value={totalELs}
    color="success"
  />
  <CompactTotal
    label="Total LOP"
    value={totalLOP}
    color="warning"
  />
</Box>


      {/* Totals 
      <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5, mb: 2 }}>
        <CompactTotal
          label="Total CLs"
          value={sanction.days?.filter(d => d.type === "CL").length || 0}
        />
        <CompactTotal
          label="Total ELs"
          value={sanction.days?.filter(d => d.type === "EL").length || 0}
        />
        <CompactTotal
          label="Total LOP"
          value={sanction.days?.filter(d => d.type === "EL").length || 0}
        />
      </Box>*/}
    </>
  )}
</Box>

  {/* Sticky Action Buttons */}
  <Box
    sx={{
      p: 2,
      borderTop: "1px solid #e5e7eb",
      backgroundColor: "#fff",
      flexShrink: 0,
    }}
  >
    <Stack direction="row" spacing={1}>
      <Button
        variant="contained"
        color="success"
        startIcon={<CheckCircleIcon />}
        fullWidth
        onClick={onApprove}
      >
        Approve
      </Button>
      <Button
        variant="outlined"
        color="error"
        startIcon={<CancelIcon />}
        fullWidth
        onClick={onReject}
      >
        Reject
      </Button>
    </Stack>
  </Box>
</Drawer>


    {/* Cancellation Dialog */}
    <Dialog open={cancelDialog.open} onClose={() => setCancelDialog(prev => ({ ...prev, open: false }))} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ bgcolor: "#fef2f2", color: "#b91c1c", fontWeight: 700 }}>
        Cancel Leave Approval
      </DialogTitle>
      <DialogContent sx={{ mt: 1 }}>
        <Typography variant="subtitle2" gutterBottom>Select dates to cancel (balances will be reverted for these days):</Typography>
        <Stack spacing={1} sx={{ my: 2 }}>
          {(!cancelDialog.row?.days || cancelDialog.row.days.length === 0) ? (
             <Typography color="text.secondary">No dates found for this application.</Typography>
          ) : (
            cancelDialog.row.days.map((day, idx) => (
              <FormControlLabel
                key={idx}
                control={
                  <Checkbox
                    checked={cancelDialog.selectedDates.includes(toYMD(day.date))}
                    onChange={() => toggleDateSelection(day.date)}
                    color="error"
                  />
                }
                label={`${day.date ? new Date(day.date).toLocaleDateString() : 'Invalid Date'} - ${day.dayType} (${day.type})`}
              />
            ))
          )}
        </Stack>
        <TextField
          label="Reason for Cancellation"
          fullWidth
          multiline
          rows={3}
          value={cancelDialog.remarks}
          onChange={(e) => setCancelDialog(prev => ({ ...prev, remarks: e.target.value }))}
          placeholder="Enter reason for reverting this approval..."
          sx={{ mt: 1 }}
        />
      </DialogContent>
      <DialogActions sx={{ p: 2, bgcolor: "#f9fafb" }}>
        <Button onClick={() => setCancelDialog(prev => ({ ...prev, open: false }))}>Keep Approved</Button>
        <Button variant="contained" color="error" onClick={handleConfirmCancel}>Confirm Cancellation</Button>
      </DialogActions>
    </Dialog>

    </Box>
  );
}

/** ---------- Small presentational helpers ---------- */
function GridRow({ label, value }) {
  return (
    <Box sx={{
      display: "grid",
      gridTemplateColumns: "160px 1fr",
      alignItems: "center",
      py: .25
    }}>
      <Typography variant="body2" color="text.secondary">{label}</Typography>
      <Typography variant="body2">{String(value || "—")}</Typography>
    </Box>
  );
}
function SmallRow({ headers, values }) {
  return (
    <Box sx={{
      border: "1px solid #e5e7eb",
      borderRadius: 1,
      overflow: "hidden",
      fontSize: 14,
    }}>
      <Box sx={{ display: "grid", gridTemplateColumns: "70px 1fr 1fr 1fr 110px", bgcolor: "#f9fafb", fontWeight: 700 }}>
        {headers.map((h, i) => <Box key={i} sx={{ p: .75, borderRight: i < headers.length - 1 ? "1px solid #e5e7eb" : 0 }}>{h}</Box>)}
      </Box>
      <Box sx={{ display: "grid", gridTemplateColumns: "70px 1fr 1fr 1fr 110px" }}>
        {values.map((v, i) => <Box key={i} sx={{ p: .75, borderRight: i < values.length - 1 ? "1px solid #e5e7eb" : 0 }}>{v}</Box>)}
      </Box>

    </Box>
  );
}
function StatTile({ title, value, color, bg }) {
  const displayValue = (value !== undefined && value !== null) ? parseFloat(value) : "—";
  return (
    <Box sx={{ p: 1.25, px: 1.75, borderRadius: 1.25, bgcolor: bg, minWidth: 120 }}>
      <Typography variant="caption" color="text.secondary">{title}</Typography>
      <Typography variant="h6" fontWeight={800} sx={{ color, lineHeight: 1 }}>{displayValue}</Typography>
    </Box>
  );
}
function CompactTotal({ label, value, color = "default" }) {
  const displayValue = (value !== undefined && value !== null) ? parseFloat(value) : 0;
  return (
    <Card variant="outlined">
      <CardContent sx={{ py: 1, px: 1.5, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="body2" color="text.secondary">{label}</Typography>
        <Chip label={displayValue} size="small" color={color} sx={{ fontWeight: 'bold' }} />
      </CardContent>
    </Card>
  );
}
