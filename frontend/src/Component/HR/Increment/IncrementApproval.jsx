import React, { useState, useEffect, useCallback } from "react";
import {
  Box, Card, CardContent, Table, TableBody, TableCell, TableHead, TableRow,
  Typography, Chip, Stack, Button, CircularProgress, Alert, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Checkbox, IconButton, Tooltip
} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import RefreshIcon from "@mui/icons-material/Refresh";
import axios from "axios";
import { useToast } from "../../../context/ToastContext";
import { getErrorMessage } from "../../../utils/errorUtils";

const API = import.meta.env.VITE_API_URL;
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const COMPONENT_LABELS = {
  basic: "Basic", hra: "HRA", conveyance: "Conveyance", washing_allowance: "Washing",
  others1: "Others 1", others2: "Others 2", others3: "Others 3", others4: "Others 4",
  others5: "Others 5", others6: "Others 6", others7: "Others 7", others8: "Others 8",
  others9: "Others 9"
};

const money = (v) => `₹${Number(v || 0).toLocaleString("en-IN")}`;
const effLabel = (r) => `${MONTHS[(r.effective_month || 1) - 1]} ${r.effective_year}`;

const IncrementApproval = () => {
  const { showToast } = useToast();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState([]);
  const [target, setTarget] = useState(null);
  const [rejecting, setRejecting] = useState(false);
  const [remark, setRemark] = useState("");
  const [busy, setBusy] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const r = await axios.get(`${API}/api/increment`, { params: { status: "Pending" } });
      setRows(Array.isArray(r.data) ? r.data : []);
      setSelected([]);
    } catch (err) {
      console.error("Failed to load pending increments:", err);
      showToast(getErrorMessage(err, "Failed to load increments"), "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const toggleAll = (checked) => setSelected(checked ? rows.map(r => r.increment_id) : []);
  const toggleOne = (id) =>
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const openApprove = (row) => { setTarget(row); setRejecting(false); setRemark(""); };
  const openReject = (row) => { setTarget(row); setRejecting(true); setRemark(""); };
  const closeDialog = () => { setTarget(null); setRemark(""); };

  const act = async () => {
    if (rejecting && !remark.trim()) {
      showToast("Rejection reason is mandatory", "error");
      return;
    }
    setBusy(true);
    try {
      const r = await axios.post(`${API}/api/increment/${rejecting ? "reject" : "approve"}`, {
        increment_id: target.increment_id,
        approval_remark: remark.trim()
      });
      showToast(r.data.message || "Done", "success");
      closeDialog();
      fetchData();
    } catch (err) {
      showToast(getErrorMessage(err, rejecting ? "Error rejecting increment" : "Error approving increment"), "error");
    } finally {
      setBusy(false);
    }
  };

  const bulkApprove = async () => {
    if (!selected.length) return;
    setBusy(true);
    let ok = 0;
    const failed = [];
    for (const id of selected) {
      try {
        await axios.post(`${API}/api/increment/approve`, { increment_id: id });
        ok++;
      } catch (err) {
        failed.push(`#${id}: ${getErrorMessage(err, "failed")}`);
      }
    }
    setBusy(false);
    showToast(ok ? `${ok} increment(s) approved and applied to salary master` : "None approved", failed.length ? "warning" : "success");
    if (failed.length) console.warn("Bulk approve failures:", failed);
    fetchData();
  };

  return (
    <Box>
      <Card>
        <CardContent>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
            <Typography fontWeight={700}>Pending Increment Approvals</Typography>
            <Stack direction="row" spacing={1}>
              <Button size="small" variant="outlined" startIcon={<RefreshIcon />} onClick={fetchData}>Refresh</Button>
              <Button size="small" variant="contained" startIcon={<CheckIcon />}
                onClick={bulkApprove} disabled={busy || !selected.length}>
                Approve Selected ({selected.length})
              </Button>
            </Stack>
          </Stack>

          {loading ? (
            <Box sx={{ textAlign: "center", py: 4 }}><CircularProgress size={30} /></Box>
          ) : rows.length === 0 ? (
            <Alert severity="success">No pending increments.</Alert>
          ) : (
            <Box sx={{ overflowX: "auto" }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell padding="checkbox">
                      <Checkbox checked={selected.length === rows.length && rows.length > 0}
                        indeterminate={selected.length > 0 && selected.length < rows.length}
                        onChange={e => toggleAll(e.target.checked)} />
                    </TableCell>
                    <TableCell>ID</TableCell>
                    <TableCell>Employee</TableCell>
                    <TableCell>Effective</TableCell>
                    <TableCell>Salary Heads</TableCell>
                    <TableCell>Arrears</TableCell>
                    <TableCell>Reason</TableCell>
                    <TableCell align="center">Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map(r => (
                    <TableRow key={r.increment_id} hover selected={selected.includes(r.increment_id)}>
                      <TableCell padding="checkbox">
                        <Checkbox checked={selected.includes(r.increment_id)} onChange={() => toggleOne(r.increment_id)} />
                      </TableCell>
                      <TableCell>{r.increment_id}</TableCell>
                      <TableCell>{r.empid} - {r.ename}</TableCell>
                      <TableCell>{effLabel(r)}</TableCell>
                      <TableCell sx={{ maxWidth: 300 }}>
                        {(r.lines || []).map(l => (
                          <Typography key={l.id} variant="body2">
                            {COMPONENT_LABELS[l.component] || l.component}:{" "}
                            <strong>{money(l.old_value)}</strong> → <strong>{money(l.new_value)}</strong>{" "}
                            <Typography component="span" variant="caption" color="text.secondary">
                              ({l.inc_type === "PERCENT" ? `${l.inc_value}%` : `+${money(l.inc_value)}`})
                            </Typography>
                          </Typography>
                        ))}
                        {(!r.lines || !r.lines.length) && <Typography variant="caption" color="error">No lines</Typography>}
                      </TableCell>
                      <TableCell>{r.has_arrears ? `${r.arrears_months || 0} mo` : "-"}</TableCell>
                      <TableCell sx={{ maxWidth: 200 }}>{r.reason || "-"}</TableCell>
                      <TableCell align="center">
                        <Tooltip title="Approve and apply to salary master">
                          <IconButton size="small" color="success" onClick={() => openApprove(r)}>
                            <CheckIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Reject">
                          <IconButton size="small" color="error" onClick={() => openReject(r)}>
                            <CloseIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!target} onClose={closeDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: rejecting ? "error.main" : "success.main", color: "#fff" }}>
          {rejecting ? "Reject Increment" : "Approve Increment"}
        </DialogTitle>
        <DialogContent sx={{ p: 2 }}>
          {target && (
            <>
              <Alert severity={rejecting ? "error" : "warning"} sx={{ mb: 2 }}>
                {rejecting
                  ? "Rejecting will not change the salary master."
                  : "Approving writes the new value to the salary master immediately and records a version effective from the selected month."}
              </Alert>
              <Typography variant="body2" color="text.secondary">
                Employee: <strong>{target.empid} - {target.ename}</strong>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Effective from: <strong>{effLabel(target)}</strong>
              </Typography>
              <Box sx={{ mt: 1 }}>
                <Typography variant="subtitle2">Salary heads</Typography>
                {(target.lines || []).map(l => (
                  <Typography key={l.id} variant="body2" color="text.secondary">
                    {COMPONENT_LABELS[l.component] || l.component}: {money(l.old_value)} →{" "}
                    <strong>{money(l.new_value)}</strong>{" "}
                    ({l.inc_type === "PERCENT" ? `${l.inc_value}%` : `+${money(l.inc_value)}`})
                  </Typography>
                ))}
              </Box>
              {target.has_arrears && (
                <Typography variant="body2" color="text.secondary">
                  Arrears: <strong>{target.arrears_months || 0} month(s)</strong>
                </Typography>
              )}
              <TextField
                fullWidth multiline minRows={2} sx={{ mt: 2 }}
                label={rejecting ? "Rejection Reason *" : "Approval Remark"}
                value={remark} onChange={e => setRemark(e.target.value)}
              />
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 2, pb: 2 }}>
          <Button onClick={closeDialog} disabled={busy}>Cancel</Button>
          <Button variant="contained" color={rejecting ? "error" : "success"}
            startIcon={busy ? <CircularProgress size={16} color="inherit" /> : rejecting ? <CloseIcon /> : <CheckIcon />}
            onClick={act} disabled={busy || (rejecting && !remark.trim())}>
            {busy ? "Working..." : rejecting ? "Reject" : "Approve"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default IncrementApproval;