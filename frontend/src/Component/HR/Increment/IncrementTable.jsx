import React, { useState, useEffect, useCallback } from "react";
import {
  Box, Card, CardContent, Table, TableBody, TableCell, TableHead, TableRow,
  Typography, Chip, Stack, Button, CircularProgress, Alert, TextField, MenuItem
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import EditIcon from "@mui/icons-material/Edit";
import axios from "axios";

const API = import.meta.env.VITE_API_URL;
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const COMPONENT_LABELS = {
  basic: "Basic", hra: "HRA", conveyance: "Conveyance", washing_allowance: "Washing",
  others1: "Others 1", others2: "Others 2", others3: "Others 3", others4: "Others 4",
  others5: "Others 5", others6: "Others 6", others7: "Others 7", others8: "Others 8",
  others9: "Others 9"
};

const money = (v) => `₹${Number(v || 0).toLocaleString("en-IN")}`;
const fmtDate = (d) => (d ? new Date(d).toISOString().slice(0, 10) : "-");
const effLabel = (r) => `${MONTHS[(r.effective_month || 1) - 1]} ${r.effective_year}`;

const statusColor = (s) =>
  s === "Approved" ? "success" : s === "Rejected" ? "error" : "warning";

// One line per salary head; "+2 heads" keeps wide grids readable in a list.
const summarise = (lines = []) => {
  if (!lines.length) return "-";
  return lines.map(l => {
    const label = COMPONENT_LABELS[l.component] || l.component;
    return `${label} ${l.inc_type === "PERCENT" ? `${l.inc_value}%` : `+${money(l.inc_value)}`}`;
  }).join(", ");
};

const IncrementTable = ({ onNew, onEdit }) => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [empid, setEmpid] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (status) params.status = status;
      if (empid) params.empid = empid;
      const r = await axios.get(`${API}/api/increment`, { params });
      setRows(Array.isArray(r.data) ? r.data : []);
    } catch (err) {
      console.error("Failed to load increments:", err);
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [status, empid]);

  useEffect(() => { fetchData(); }, [fetchData]);

  return (
    <Box>
      <Card>
        <CardContent>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}
            flexWrap="wrap" gap={1}>
            <Typography fontWeight={700}>Increment List</Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              <TextField select size="small" label="Status" value={status} sx={{ minWidth: 140 }}
                onChange={e => setStatus(e.target.value)}>
                <MenuItem value="">All</MenuItem>
                <MenuItem value="Pending">Pending</MenuItem>
                <MenuItem value="Approved">Approved</MenuItem>
                <MenuItem value="Rejected">Rejected</MenuItem>
              </TextField>
              <TextField size="small" label="Employee ID" value={empid} sx={{ width: 130 }}
                onChange={e => setEmpid(e.target.value)} onKeyDown={e => e.key === "Enter" && fetchData()} />
              <Button size="small" variant="outlined" startIcon={<RefreshIcon />} onClick={fetchData}>Refresh</Button>
              {onNew && <Button size="small" variant="contained" onClick={onNew}>+ New Increment</Button>}
            </Stack>
          </Stack>

          {loading ? (
            <Box sx={{ textAlign: "center", py: 4 }}><CircularProgress size={30} /></Box>
          ) : rows.length === 0 ? (
            <Alert severity="info">No increments found.</Alert>
          ) : (
            <Box sx={{ overflowX: "auto" }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Employee</TableCell>
                    <TableCell>Applied</TableCell>
                    <TableCell>Effective</TableCell>
                    <TableCell>Salary Heads</TableCell>
                    <TableCell>Arrears</TableCell>
                    <TableCell>Reason</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map(r => (
                    <TableRow key={r.increment_id} hover>
                      <TableCell>{r.increment_id}</TableCell>
                      <TableCell>{r.empid} - {r.ename}</TableCell>
                      <TableCell>{fmtDate(r.applied_date)}</TableCell>
                      <TableCell>{effLabel(r)}</TableCell>
                      <TableCell sx={{ maxWidth: 280 }}>{summarise(r.lines)}</TableCell>
                      <TableCell>
                        {r.has_arrears
                          ? `${r.arrears_months || 0} mo`
                          : <Typography variant="caption" color="text.disabled">-</Typography>}
                      </TableCell>
                      <TableCell sx={{ maxWidth: 200 }}>{r.reason || "-"}</TableCell>
                      <TableCell>
                        <Chip size="small" label={r.status} color={statusColor(r.status)} />
                      </TableCell>
                      <TableCell align="right">
                        {r.status === "Pending" && !r.applied_to_salary ? (
                          <Button size="small" variant="outlined" startIcon={<EditIcon />} onClick={() => onEdit && onEdit(r)}>
                            Edit
                          </Button>
                        ) : (
                          <Typography variant="caption" color="text.disabled">Locked</Typography>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default IncrementTable;