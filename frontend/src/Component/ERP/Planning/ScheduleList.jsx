import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Box, Card, CardContent, Typography, TextField, Button, Chip, LinearProgress,
  IconButton, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions,
  Tabs, Tab, MenuItem, Alert
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import RefreshIcon from "@mui/icons-material/Refresh";
import SearchIcon from "@mui/icons-material/Search";
import TableChartIcon from "@mui/icons-material/TableChart";
import BarChartIcon from "@mui/icons-material/BarChart";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import axios from "axios";
import { useToast } from "../../../context/ToastContext";
import { formatDate } from "../../../utils/format";
import ScheduleGantt from "./ScheduleGantt";
import ScheduleCalendar from "./ScheduleCalendar";

const API = "/api/erp/planning/schedules";
const MACHINE_API = "/api/erp/production/machines";
const STATUS_COLORS = { Planned: "info", InProgress: "warning", Completed: "success", Cancelled: "error" };

export default function ScheduleList() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { showToast } = useToast();
  const [tab, setTab] = useState(0);
  const [rows, setRows] = useState([]);
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [machineFilter, setMachineFilter] = useState(searchParams.get("machine_id") || "");
  const [statusFilter, setStatusFilter] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [dateFilter, setDateFilter] = useState(searchParams.get("date") || "");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (machineFilter) params.machine_id = machineFilter;
      if (statusFilter) params.status = statusFilter;
      const { data } = await axios.get(API, { params });
      setRows(data);
    } catch { showToast("Failed to load schedules", "error"); }
    finally { setLoading(false); }
  }, [search, machineFilter, statusFilter]);

  const fetchMachines = useCallback(async () => {
    try {
      const { data } = await axios.get(MACHINE_API, { params: { status: "Active" } });
      setMachines(data || []);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => { fetchData(); fetchMachines(); }, [fetchData, fetchMachines]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await axios.delete(`${API}/${deleteTarget}`);
      showToast("Schedule deleted", "success");
      setDeleteTarget(null);
      fetchData();
    } catch { showToast("Failed to delete", "error"); }
  };

  const getStatusChip = (status) => (
    <Chip label={status} size="small" color={STATUS_COLORS[status] || "default"} />
  );

  const columns = [
    { field: "schedule_no", headerName: "Schedule No", width: 140 },
    {
      field: "order", headerName: "Order", width: 140,
      renderCell: (p) => p.row.order ? `${p.row.order.order_no || ""}` : p.row.order_id || "-",
      valueGetter: (p) => p?.order_no,
    },
    {
      field: "machine", headerName: "Machine", width: 140,
      renderCell: (p) => p.row.machine ? p.row.machine.machine_code : p.row.machine_id || "-",
      valueGetter: (p) => p?.machine_code,
    },
    { field: "scheduled_date", headerName: "Date", width: 120, renderCell: (p) => formatDate(p.value) },
    { field: "shift", headerName: "Shift", width: 90 },
    { field: "planned_qty", headerName: "Planned Qty", width: 100 },
    { field: "status", headerName: "Status", width: 110, renderCell: (p) => getStatusChip(p.value) },
    {
      field: "actions", headerName: "Actions", width: 140, sortable: false,
      renderCell: (p) => (
        <Box>
          <Tooltip title="View"><IconButton size="small" onClick={() => navigate(`/planning/schedule/view/${p.row.id}`)}><VisibilityIcon fontSize="small" /></IconButton></Tooltip>
          <Tooltip title="Edit"><IconButton size="small" onClick={() => navigate(`/planning/schedule/edit/${p.row.id}`)}><EditIcon fontSize="small" /></IconButton></Tooltip>
          <Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => setDeleteTarget(p.row.id)}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: "bold", color: "var(--heading-color)" }}>Production Schedule</Typography>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }} variant="scrollable">
        <Tab icon={<TableChartIcon />} label="List View" iconPosition="start" />
        <Tab icon={<BarChartIcon />} label="Gantt Chart" iconPosition="start" />
        <Tab icon={<CalendarMonthIcon />} label="Calendar" iconPosition="start" />
      </Tabs>

      {tab === 0 && (
        <Card sx={{ borderRadius: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
          <CardContent>
            <Box sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap", alignItems: "center" }}>
              <TextField size="small" placeholder="Search schedule..." value={search}
                onChange={(e) => setSearch(e.target.value)}
                InputProps={{ startAdornment: <SearchIcon sx={{ mr: 1, color: "gray" }} /> }} sx={{ minWidth: 200 }} />
              <TextField select size="small" label="Machine" value={machineFilter}
                onChange={(e) => setMachineFilter(e.target.value)} sx={{ minWidth: 160 }}>
                <MenuItem value="">All Machines</MenuItem>
                {machines.map((m) => <MenuItem key={m.id} value={m.id}>{m.machine_code} - {m.machine_name}</MenuItem>)}
              </TextField>
              <TextField select size="small" label="Status" value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)} sx={{ minWidth: 130 }}>
                <MenuItem value="">All Statuses</MenuItem>
                {Object.keys(STATUS_COLORS).map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
              </TextField>
              <TextField label="Date" type="date" size="small" value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)} InputLabelProps={{ shrink: true }}
                sx={{ minWidth: 150 }} />
              <Button variant="contained" startIcon={<AddIcon />}
                onClick={() => navigate("/planning/schedule/add")}>New Schedule</Button>
              <Button variant="outlined" startIcon={<RefreshIcon />} onClick={fetchData}>Refresh</Button>
            </Box>

            {loading && <LinearProgress sx={{ mb: 1 }} />}

            <div style={{ height: 520, width: "100%" }}>
              <DataGrid rows={rows} columns={columns} getRowId={(r) => r.id} pageSizeOptions={[10, 25, 50]}
                initialState={{ pagination: { paginationModel: { pageSize: 25 } } }} disableColumnMenu loading={loading}
                sx={{
                  border: 0,
                  "& .MuiDataGrid-columnHeaders": { bgcolor: "#f2f4f7", fontWeight: 700 },
                  "& .MuiDataGrid-row:hover": { bgcolor: "#f8fafc" },
                  "& .MuiDataGrid-cell": { fontSize: ".92rem" },
                }} />
            </div>
          </CardContent>
        </Card>
      )}

      {tab === 1 && (
        <Card sx={{ borderRadius: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
          <CardContent>
            <ScheduleGantt machineFilter={machineFilter} />
          </CardContent>
        </Card>
      )}

      {tab === 2 && (
        <Card sx={{ borderRadius: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
          <CardContent>
            <ScheduleCalendar />
          </CardContent>
        </Card>
      )}

      <Dialog open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)}>
        <DialogTitle>Delete Schedule</DialogTitle>
        <DialogContent>Are you sure you want to delete this schedule?</DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button onClick={handleDelete} color="error">Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
