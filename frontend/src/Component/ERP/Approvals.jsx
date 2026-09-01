import React, { useEffect, useState, useCallback } from "react";
import {
  Box, Card, CardContent, Typography, Chip, Button, Stack, TextField,
  LinearProgress, Dialog, DialogTitle, DialogContent, DialogActions,
  Avatar, Tooltip, IconButton, Badge,
} from "@mui/material";
import StandardTable from '../Common/StandardTable.jsx';
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import VisibilityIcon from "@mui/icons-material/Visibility";
import RefreshIcon from "@mui/icons-material/Refresh";
import ApprovalIcon from "@mui/icons-material/FactCheck";
import axios from "axios";
import { useToast } from "../../context/ToastContext";
import { useNavigate } from "react-router-dom";
import PageHeader from "../Common/PageHeader";
import CountedTextArea from "../Common/CountedTextArea";
import { formatCompactCurrency, formatDate } from "../../utils/format";

const TYPE_META = {
  MR: { label: "Material Req.", color: "#ed6c02" },
  PR: { label: "Purchase Req.", color: "#00796b" },
  PO: { label: "Purchase Order", color: "#1565c0" },
  AUDIT: { label: "Stock Audit", color: "#7b1fa2" },
  GRN: { label: "Goods Receipt", color: "#388e3c" },
};

export default function Approvals() {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("ALL");
  const [rejectTarget, setRejectTarget] = useState(null);
  const [remarks, setRemarks] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get("/api/erp/purchase/approvals");
      setRows(data.items || []);
    } catch {
      showToast("Failed to load approvals", "error");
    } finally { setLoading(false); }
  }, [showToast]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const act = async (item, status) => {
    try {
      await axios.put(item.approveEndpoint, {
        status,
        approved_by: localStorage.getItem("empName") || localStorage.getItem("userName"),
        remarks: status === "Rejected" ? remarks : undefined,
      });
      showToast(`${item.typeLabel} ${item.docNo} ${status.toLowerCase()}`, "success");
      setRejectTarget(null); setRemarks("");
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.error || "Action failed", "error");
    }
  };

  const moduleContext = localStorage.getItem("lastActiveModule") || "PURCHASE";
  const allowedTypes = moduleContext === "STORES" ? ["MR", "AUDIT", "GRN"] : ["PR", "PO"];
  const filteredRows = rows.filter((r) => allowedTypes.includes(r.type));

  const visible = filter === "ALL" ? filteredRows : filteredRows.filter((r) => r.type === filter);
  const counts = filteredRows.reduce((a, r) => { a[r.type] = (a[r.type] || 0) + 1; return a; }, {});

  const columns = [
    {
      field: "type", headerName: "Type", width: 150,
      renderCell: (p) => {
        const m = TYPE_META[p.value] || { label: p.value, color: "#546e7a" };
        return <Chip label={m.label} size="small" sx={{ bgcolor: m.color, color: "#fff", fontWeight: 600 }} />;
      },
    },
    { field: "docNo", headerName: "Document #", width: 150, renderCell: (p) => <Typography variant="body2" sx={{ fontWeight: 600 }}>{p.value}</Typography> },
    { field: "date", headerName: "Date", width: 120, valueGetter: (v) => v ? formatDate(v) : "" },
    { field: "party", headerName: "Party / By", width: 200 },
    { field: "department", headerName: "Dept / Loc", width: 150 },
    {
      field: "amount", headerName: "Amount", width: 140,
      valueGetter: (v) => (v ? parseFloat(v).toLocaleString("en-IN", { style: "currency", currency: "INR" }) : "—"),
    },
    {
      field: "status", headerName: "Status", width: 120,
      renderCell: (p) => <Chip label={p.value} size="small" color={p.value === "Approved" ? "success" : p.value === "Rejected" ? "error" : "warning"} />,
    },
    {
      field: "actions", headerName: "Actions", width: 180, sortable: false,
      renderCell: (p) => (
        <Stack direction="row" spacing={0.5}>
          <Tooltip title="Approve"><IconButton size="small" color="success" onClick={() => act(p.row, "Approved")}><CheckCircleIcon fontSize="small" /></IconButton></Tooltip>
          <Tooltip title="Reject"><IconButton size="small" color="error" onClick={() => setRejectTarget(p.row)}><CancelIcon fontSize="small" /></IconButton></Tooltip>
          <Tooltip title="View"><IconButton size="small" onClick={() => navigate(p.row.viewPath)}><VisibilityIcon fontSize="small" /></IconButton></Tooltip>
        </Stack>
      ),
    },
  ];

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <PageHeader
        title="Approvals"
        subtitle="Unified inbox — material requisitions, indents, orders, receipts & audits awaiting your decision"
        icon={<ApprovalIcon size={22} />}
        actions={
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={fetchData}>Refresh</Button>
        }
      />

      <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: "wrap", gap: 1 }}>
        {["ALL", ...allowedTypes].map((t) => (
          <Chip
            key={t}
            label={t === "ALL" ? `All (${filteredRows.length})` : `${TYPE_META[t]?.label || t} (${counts[t] || 0})`}
            onClick={() => setFilter(t)}
            color={filter === t ? "primary" : "default"}
            variant={filter === t ? "filled" : "outlined"}
          />
        ))}
      </Stack>

      <Card sx={{ borderRadius: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
        <CardContent>
          {loading && <LinearProgress sx={{ mb: 1 }} />}
          <Box sx={{ height: 560, width: "100%" }}>
            <StandardTable title="Approvals"
              rows={visible} columns={columns} getRowId={(r) => `${r.type}-${r.id}`}
              pageSizeOptions={[10, 25, 50]} initialState={{ pagination: { paginationModel: { pageSize: 25 } } }}
              disableColumnMenu loading={loading}
              sx={{ border: 0, "& .MuiDataGrid-columnHeaders": { bgcolor: "#f2f4f7", fontWeight: 700 }, "& .MuiDataGrid-row:hover": { bgcolor: "#f8fafc" } }}
            />
          </Box>
        </CardContent>
      </Card>

      <Dialog open={Boolean(rejectTarget)} onClose={() => setRejectTarget(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Reject {rejectTarget?.typeLabel} {rejectTarget?.docNo}</DialogTitle>
        <DialogContent>
          <CountedTextArea fullWidth minRows={3} label="Remarks (optional)" value={remarks}
            onChange={(e) => setRemarks(e.target.value)} sx={{ mt: 1 }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectTarget(null)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={() => rejectTarget && act(rejectTarget, "Rejected")}>Reject</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
