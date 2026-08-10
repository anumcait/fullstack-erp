import React, { useEffect, useState, useCallback } from "react";
import {
  Box, Card, CardContent, Typography, TextField, Button, Chip, LinearProgress,
  Table, TableHead, TableRow, TableCell, TableBody, TableContainer,
  MenuItem, IconButton, TablePagination, Dialog, DialogTitle, DialogContent,
  DialogActions, Grid,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import axios from "axios";
import { useToast } from "../../../../context/ToastContext";

const API = "/api/erp/stores/misc-vouchers";
const today = () => new Date().toISOString().split("T")[0];

const typeColor = { Miscellaneous: "info", "Petty Cash": "warning" };

const emptyLine = () => ({ description: "", amount: "", remarks: "" });

export default function MiscVoucherBilling() {
  const { showToast } = useToast();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const [statusFilter, setStatusFilter] = useState("");

  const [open, setOpen] = useState(false);
  const [voucherDate, setVoucherDate] = useState(today());
  const [voucherType, setVoucherType] = useState("Miscellaneous");
  const [partyName, setPartyName] = useState("");
  const [remarks, setRemarks] = useState("");
  const [lines, setLines] = useState([emptyLine()]);
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      const { data } = await axios.get(API, { params });
      setRows(data);
    } catch {
      showToast("Failed to load vouchers", "error");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, showToast]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const totalCount = rows.length;
  const pagedRows = rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const updateLine = (idx, field, value) => {
    setLines((prev) => prev.map((l, i) => (i === idx ? { ...l, [field]: value } : l)));
  };

  const removeLine = (idx) => {
    setLines((prev) => (prev.length === 1 ? prev : prev.filter((_, i) => i !== idx)));
  };

  const lineTotal = lines.reduce((s, l) => s + (Number(l.amount) || 0), 0);

  const openDialog = () => {
    setVoucherDate(today());
    setVoucherType("Miscellaneous");
    setPartyName("");
    setRemarks("");
    setLines([emptyLine()]);
    setOpen(true);
  };

  const handleSave = async () => {
    const validLines = lines.filter((l) => l.description && l.description.trim());
    if (validLines.length === 0) {
      showToast("Add at least one line item with a description", "error");
      return;
    }
    if (validLines.some((l) => !Number(l.amount) || Number(l.amount) <= 0)) {
      showToast("Each line needs a valid amount", "error");
      return;
    }
    setSaving(true);
    try {
      await axios.post(API, {
        voucher_date: voucherDate,
        voucher_type: voucherType,
        party_name: partyName || null,
        remarks: remarks || null,
        items: validLines.map((l) => ({ description: l.description.trim(), amount: Number(l.amount), remarks: l.remarks || null })),
      });
      showToast("Voucher created successfully", "success");
      setOpen(false);
      fetchData();
    } catch (e) {
      showToast(e.response?.data?.error || "Failed to create voucher", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleApprove = async (v) => {
    try {
      await axios.post(`${API}/${v.id}/approve`);
      showToast(`Voucher ${v.voucher_no} approved`, "success");
      fetchData();
    } catch (e) {
      showToast(e.response?.data?.error || "Failed to approve voucher", "error");
    }
  };

  const handleDelete = async (v) => {
    if (!window.confirm(`Delete voucher ${v.voucher_no}?`)) return;
    try {
      await axios.delete(`${API}/${v.id}`);
      showToast("Voucher deleted", "success");
      fetchData();
    } catch (e) {
      showToast(e.response?.data?.error || "Failed to delete voucher", "error");
    }
  };

  const thSx = {
    fontWeight: 700, fontSize: "0.82rem", py: 0.55, px: 0.7, color: "#1e293b",
    border: "1px solid #94a3b8", position: "sticky", top: 0, zIndex: 2,
    bgcolor: "#e2e8f0", whiteSpace: "nowrap",
  };

  const tdSx = {
    fontSize: "0.82rem", py: 0.4, px: 0.6, border: "1px solid #e2e8f0",
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2, flexWrap: "wrap", gap: 1 }}>
        <Typography variant="h4" sx={{ fontWeight: "bold", color: "var(--heading-color)" }}>
          Miscellaneous / Voucher Billing
        </Typography>
        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
          <TextField size="small" label="Status" select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }} sx={{ width: 130 }}>
            <MenuItem value="">All</MenuItem>
            <MenuItem value="Draft">Draft</MenuItem>
            <MenuItem value="Approved">Approved</MenuItem>
            <MenuItem value="Cancelled">Cancelled</MenuItem>
          </TextField>
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={fetchData}>Refresh</Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={openDialog}>New Voucher</Button>
        </Box>
      </Box>

      <Card sx={{ borderRadius: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
        <CardContent sx={{ p: { xs: 1.5, md: 2 } }}>
          {loading && <LinearProgress sx={{ mb: 1 }} />}
          {!loading && totalCount === 0 && (
            <Typography sx={{ textAlign: "center", py: 6, color: "#94a3b8", fontStyle: "italic" }}>
              No vouchers found.
            </Typography>
          )}
          {totalCount > 0 && (
            <>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.5, px: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: "#475569" }}>
                  <Box component="span" sx={{ color: "#1565c0", fontWeight: 700 }}>{totalCount}</Box> record{totalCount !== 1 ? "s" : ""}
                </Typography>
                <Typography variant="body2" sx={{ color: "#64748b", fontWeight: 600 }}>
                  Page {page + 1} ({page * rowsPerPage + 1}–{Math.min((page + 1) * rowsPerPage, totalCount)} of {totalCount})
                </Typography>
              </Box>
              <TableContainer sx={{ maxHeight: 560, overflow: "auto" }}>
                <Table size="small" stickyHeader
                  sx={{ minWidth: 1000, borderCollapse: "separate", borderSpacing: 0 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ ...thSx, width: 140, textAlign: "center" }}>Actions</TableCell>
                      <TableCell sx={{ ...thSx, width: 30, textAlign: "center" }}>Sl#</TableCell>
                      <TableCell sx={{ ...thSx, width: 130, textAlign: "center" }}>Voucher #</TableCell>
                      <TableCell sx={{ ...thSx, width: 100, textAlign: "center" }}>Date</TableCell>
                      <TableCell sx={{ ...thSx, width: 120, textAlign: "center" }}>Type</TableCell>
                      <TableCell sx={{ ...thSx, width: 160 }}>Party</TableCell>
                      <TableCell sx={{ ...thSx, width: 110, textAlign: "right" }}>Amount</TableCell>
                      <TableCell sx={{ ...thSx, width: 90, textAlign: "center" }}>Status</TableCell>
                      <TableCell sx={{ ...thSx }}>Remarks</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {pagedRows.map((r, idx) => (
                      <TableRow key={r.id} hover
                        sx={{ bgcolor: idx % 2 === 0 ? "#ffffff" : "#f1f5f9", "&:hover": { bgcolor: "#dbeafe" } }}>
                        <TableCell sx={{ ...tdSx, textAlign: "center" }}>
                          <Box sx={{ display: "flex", gap: 0.5, justifyContent: "center" }}>
                            {r.status === "Draft" && (
                              <Button size="small" variant="contained" color="success"
                                onClick={() => handleApprove(r)}
                                sx={{ fontSize: "0.68rem", textTransform: "none", py: 0.2, px: 1, minWidth: 0, fontWeight: 600 }}>
                                Approve
                              </Button>
                            )}
                            {r.status !== "Approved" && (
                              <IconButton size="small" color="error" onClick={() => handleDelete(r)}>
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            )}
                          </Box>
                        </TableCell>
                        <TableCell sx={{ ...tdSx, textAlign: "center", fontWeight: 600, color: "#64748b" }}>{idx + 1}</TableCell>
                        <TableCell sx={{ ...tdSx, textAlign: "center", fontWeight: 600, color: "#1565c0" }}>{r.voucher_no}</TableCell>
                        <TableCell sx={{ ...tdSx, textAlign: "center" }}>{r.voucher_date || "-"}</TableCell>
                        <TableCell sx={{ ...tdSx, textAlign: "center" }}>
                          <Chip size="small" label={r.voucher_type} color={typeColor[r.voucher_type] || "default"} sx={{ fontSize: "0.7rem", height: 22, fontWeight: 600 }} />
                        </TableCell>
                        <TableCell sx={{ ...tdSx, fontWeight: 600 }}>{r.party_name || "-"}</TableCell>
                        <TableCell sx={{ ...tdSx, textAlign: "right", fontWeight: 700 }}>{Number(r.total_amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</TableCell>
                        <TableCell sx={{ ...tdSx, textAlign: "center" }}>
                          <Chip size="small" label={r.status} color={r.status === "Approved" ? "success" : r.status === "Cancelled" ? "error" : "default"} sx={{ fontSize: "0.7rem", height: 22, fontWeight: 600 }} />
                        </TableCell>
                        <TableCell sx={{ ...tdSx }}>{r.remarks || "-"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination component="div" count={totalCount} page={page}
                onPageChange={(_, p) => setPage(p)} rowsPerPage={rowsPerPage}
                onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
                rowsPerPageOptions={[25, 50, 100]}
                sx={{ "& .MuiTablePagination-toolbar": { minHeight: 36 } }} />
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, fontSize: "1rem" }}>New Miscellaneous / Petty Cash Voucher</DialogTitle>
        <DialogContent>
          <Grid container spacing={1.5} sx={{ pt: 1 }}>
            <Grid item xs={6} sm={3}>
              <TextField size="small" fullWidth label="Date" type="date" value={voucherDate} onChange={(e) => setVoucherDate(e.target.value)} />
            </Grid>
            <Grid item xs={6} sm={3}>
              <TextField size="small" fullWidth select label="Type" value={voucherType} onChange={(e) => setVoucherType(e.target.value)}>
                <MenuItem value="Miscellaneous">Miscellaneous</MenuItem>
                <MenuItem value="Petty Cash">Petty Cash</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField size="small" fullWidth label="Party / Vendor" value={partyName} onChange={(e) => setPartyName(e.target.value)} />
            </Grid>
            <Grid item xs={12}>
              <TextField size="small" fullWidth label="Remarks" value={remarks} onChange={(e) => setRemarks(e.target.value)} />
            </Grid>
          </Grid>

          <Typography variant="subtitle2" sx={{ fontWeight: 700, mt: 2, mb: 1, color: "#1e293b" }}>
            Line Items (manual entry)
          </Typography>
          <Table size="small" sx={{ borderCollapse: "separate", borderSpacing: 0 }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ ...thSx, width: 30, textAlign: "center" }}>#</TableCell>
                <TableCell sx={{ ...thSx }}>Description</TableCell>
                <TableCell sx={{ ...thSx, width: 180, textAlign: "right" }}>Amount</TableCell>
                <TableCell sx={{ ...thSx }}>Remarks</TableCell>
                <TableCell sx={{ ...thSx, width: 40, textAlign: "center" }}></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {lines.map((l, idx) => (
                <TableRow key={idx}>
                  <TableCell sx={{ ...tdSx, textAlign: "center", fontWeight: 600, color: "#64748b" }}>{idx + 1}</TableCell>
                  <TableCell sx={{ ...tdSx, p: 0.2 }}>
                    <TextField size="small" fullWidth variant="standard" placeholder="Expense description"
                      value={l.description} onChange={(e) => updateLine(idx, "description", e.target.value)} />
                  </TableCell>
                  <TableCell sx={{ ...tdSx, p: 0.2 }}>
                    <TextField size="small" fullWidth variant="standard" type="number" placeholder="0.00"
                      value={l.amount} onChange={(e) => updateLine(idx, "amount", e.target.value)} />
                  </TableCell>
                  <TableCell sx={{ ...tdSx, p: 0.2 }}>
                    <TextField size="small" fullWidth variant="standard" placeholder="Notes"
                      value={l.remarks} onChange={(e) => updateLine(idx, "remarks", e.target.value)} />
                  </TableCell>
                  <TableCell sx={{ ...tdSx, textAlign: "center" }}>
                    <IconButton size="small" color="error" onClick={() => removeLine(idx)} disabled={lines.length === 1}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell colSpan={5} sx={{ border: "none", pt: 1 }}>
                  <Button size="small" startIcon={<AddIcon />} onClick={() => setLines((prev) => [...prev, emptyLine()])}
                    sx={{ textTransform: "none", fontWeight: 600 }}>
                    Add Line Item
                  </Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>

          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1.5 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: "#1565c0" }}>
              Total: ₹{lineTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving}>Save Voucher</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
