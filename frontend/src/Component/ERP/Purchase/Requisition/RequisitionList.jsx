import React, { useEffect, useState, useCallback } from "react";
import { Box, Card, CardContent, Typography, TextField, Button, Chip, LinearProgress, Tooltip, IconButton } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import AddIcon from "@mui/icons-material/Add";
import VisibilityIcon from "@mui/icons-material/Visibility";
import RefreshIcon from "@mui/icons-material/Refresh";
import SearchIcon from "@mui/icons-material/Search";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PrintIcon from "@mui/icons-material/Print";
import axios from "axios";
import { useToast } from "../../../../context/ToastContext";
import { useNavigate, useSearchParams } from "react-router-dom";

const API = "/api/erp/purchase/requisitions";

export default function RequisitionList() {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const statusFilter = searchParams.get("status") || "";
  const title = statusFilter === "Pending" ? "PR Authorization — Pending"
    : statusFilter === "Approved" ? "Authorized PRs"
    : "Purchase Requisitions";

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      const { data } = await axios.get(API, { params });
      setRows(data);
    } catch { showToast("Failed to load requisitions", "error"); }
    finally { setLoading(false); }
  }, [search, statusFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleApprove = async (id, status) => {
    try {
      await axios.put(`${API}/${id}/approve`, { status });
      showToast(`Requisition ${status}`, "success");
      fetchData();
    } catch { showToast("Failed to update status", "error"); }
  };

  const columns = [
    { field: "req_no", headerName: "Req #", width: 130 },
    { field: "req_date", headerName: "Date", width: 110, valueGetter: (v) => v ? v.split("T")[0] : "" },
    { field: "department", headerName: "Department", width: 140 },
    { field: "requested_by", headerName: "Requested By", width: 150 },
    { field: "indent_type", headerName: "Type", width: 100 },
    { field: "priority", headerName: "Priority", width: 100, renderCell: (p) => (
      <Chip label={p.value} size="small" color={p.value === "Urgent" ? "error" : p.value === "High" ? "warning" : "default"} />
    )},
    { field: "status", headerName: "Status", width: 120, renderCell: (p) => (
      <Chip label={p.value} size="small" color={p.value === "Approved" ? "success" : p.value === "Rejected" ? "error" : "warning"} />
    )},
    { field: "items", headerName: "Items", width: 80, valueGetter: (v) => v?.length || 0 },
    {
      field: "actions", headerName: "Actions", width: 200, sortable: false,
      renderCell: (p) => (
        <Box>
          <Tooltip title="View"><IconButton size="small" onClick={() => navigate(`/purchase/requisitions/view/${p.row.id}`)}><VisibilityIcon fontSize="small" /></IconButton></Tooltip>
          <Tooltip title="Print"><IconButton size="small" onClick={() => navigate(`/purchase/requisitions/print/${p.row.id}`)}><PrintIcon fontSize="small" /></IconButton></Tooltip>
          {p.row.status === "Pending" && (
            <>
              <Tooltip title="Approve"><IconButton size="small" color="success" onClick={() => handleApprove(p.row.id, "Approved")}><CheckCircleIcon fontSize="small" /></IconButton></Tooltip>
              <Tooltip title="Reject"><IconButton size="small" color="error" onClick={() => handleApprove(p.row.id, "Rejected")}><CheckCircleIcon fontSize="small" /></IconButton></Tooltip>
            </>
          )}
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: "bold", color: "var(--heading-color)" }}>{title}</Typography>
      <Card sx={{ borderRadius: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
        <CardContent>
          <Box sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap", alignItems: "center" }}>
            <TextField size="small" placeholder="Search requisitions..." value={search} onChange={(e) => setSearch(e.target.value)}
              InputProps={{ startAdornment: <SearchIcon sx={{ mr: 1, color: "gray" }} /> }} sx={{ minWidth: 300 }} />
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate("/purchase/requisitions/add")}>New Requisition</Button>
            <Button variant="outlined" startIcon={<RefreshIcon />} onClick={fetchData}>Refresh</Button>
            {!statusFilter && <Button size="small" variant="text" onClick={() => navigate("/purchase/requisitions?status=Pending")}>Pending</Button>}
            {!statusFilter && <Button size="small" variant="text" onClick={() => navigate("/purchase/requisitions?status=Approved")}>Approved</Button>}
            {statusFilter && <Button size="small" variant="text" onClick={() => navigate("/purchase/requisitions")}>Clear Filter</Button>}
          </Box>
          {loading && <LinearProgress sx={{ mb: 1 }} />}
          <div style={{ height: 520, width: "100%" }}>
            <DataGrid rows={rows} columns={columns} getRowId={(r) => r.id} pageSizeOptions={[10, 25, 50]}
              initialState={{ pagination: { paginationModel: { pageSize: 25 } } }} disableColumnMenu loading={loading}
              sx={{ border: 0, "& .MuiDataGrid-columnHeaders": { bgcolor: "#f2f4f7", fontWeight: 700 },
                "& .MuiDataGrid-row:hover": { bgcolor: "#f8fafc" }, "& .MuiDataGrid-cell": { fontSize: ".92rem" } }} />
          </div>
        </CardContent>
      </Card>
    </Box>
  );
}
