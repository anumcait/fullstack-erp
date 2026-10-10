import React, { useState, useEffect, useCallback } from "react";
import {
  Card, CardContent, Table, TableBody, TableCell, TableHead, TableRow,
  Typography, Chip, Stack, Alert, CircularProgress, Box, Tooltip,
  TextField, MenuItem
} from "@mui/material";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
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

/**
 * Approved increments for one employee, shown inside Employee Master.
 * Gives the "added date" and the effective month/year the increment applies from.
 */
const EmployeeIncrements = ({ empid: initialEmpid }) => {
  const [empid, setEmpid] = useState(initialEmpid || null);
const [employeeList, setEmployeeList] = useState([]);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => { setEmpid(initialEmpid || null); }, [initialEmpid]);

  useEffect(() => {
    axios.get(`${API}/api/employees`)
      .then(r => setEmployeeList(Array.isArray(r.data) ? r.data : []))
      .catch(() => setEmployeeList([]));
  }, []);

  const fetchData = useCallback(async () => {
    if (!empid) { setRows([]); return; }
    setLoading(true);
    try {
      const r = await axios.get(`${API}/api/increment/employee/${empid}`);
      setRows(Array.isArray(r.data) ? r.data : []);
    } catch (err) {
      console.error("Failed to load employee increments:", err);
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [empid]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const selected = employeeList.find(e => String(e.empid) === String(empid));

  return (
    <Card>
      <CardContent>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }} flexWrap="wrap" useFlexGap>
          <TrendingUpIcon color="primary" />
          <Typography fontWeight={700}>Approved Increments</Typography>
          {rows.length > 0 && <Chip size="small" label={rows.length} color="primary" />}
          <Box sx={{ flex: 1 }} />
          <TextField
            select size="small" label="Employee" value={empid || ""} sx={{ minWidth: 260 }}
            onChange={e => setEmpid(Number(e.target.value) || null)}
          >
            {employeeList.map(e => (
              <MenuItem key={e.empid} value={e.empid}>{e.empid} - {e.ename}</MenuItem>
            ))}
          </TextField>
        </Stack>

        {loading ? (
          <Box sx={{ textAlign: "center", py: 3 }}><CircularProgress size={26} /></Box>
        ) : !empid ? (
          <Alert severity="info">Select an employee to view their increments.</Alert>
        ) : rows.length === 0 ? (
          <Alert severity="info">
            No approved increments for {selected ? `${selected.empid} - ${selected.ename}` : `employee ${empid}`}.
          </Alert>
        ) : (
          <Box sx={{ overflowX: "auto" }}>
            <Table size="small">
<TableHead>
                <TableRow>
                  <TableCell>Increment ID</TableCell>
                  <TableCell>Added Date</TableCell>
                  <TableCell>Effective Month</TableCell>
                  <TableCell>Salary Heads</TableCell>
                  <TableCell align="right">New Gross</TableCell>
                  <TableCell>Arrears</TableCell>
                  <TableCell>Approved By</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map(r => (
                  <TableRow key={r.increment_id} hover>
                    <TableCell>{r.increment_id}</TableCell>
                    <TableCell>{fmtDate(r.applied_date)}</TableCell>
                    <TableCell>{effLabel(r)}</TableCell>
                    <TableCell sx={{ maxWidth: 340 }}>
                      {(r.lines || []).map(l => {
                        const delta = Number(l.new_value || 0) - Number(l.old_value || 0);
                        return (
                          <Typography key={l.id} variant="body2">
                            {COMPONENT_LABELS[l.component] || l.component}:{" "}
                            {money(l.old_value)} → <strong>{money(l.new_value)}</strong>{" "}
                            <Typography component="span" variant="caption" sx={{ color: "#2e7d32", fontWeight: 600 }}>
                              (+{money(delta)})
                            </Typography>
                          </Typography>
                        );
                      })}
                      {(!r.lines || !r.lines.length) && (
                        <Typography variant="caption" color="text.disabled">No component lines</Typography>
                      )}
                    </TableCell>
                    <TableCell align="right">
                      {(r.lines || []).length > 0 && (
                        <strong>
                          {money(
                            (r.lines || []).reduce(
                              (sum, l) => sum + Number(l.new_value || 0) - Number(l.old_value || 0), 0
                            )
                          )}
                        </strong>
                      )}
                    </TableCell>
                    <TableCell>
                      {r.has_arrears ? (
                        <Tooltip title={`Arrears ${r.arrears_months || 0} month(s)`}>
                          <Chip size="small" color="warning" label={`${r.arrears_months || 0} mo`} />
                        </Tooltip>
                      ) : <Typography variant="caption" color="text.disabled">-</Typography>}
                    </TableCell>
                    <TableCell>{r.approved_by || "-"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};
export default EmployeeIncrements;
