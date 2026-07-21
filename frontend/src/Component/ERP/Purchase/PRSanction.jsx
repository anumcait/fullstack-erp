import React, { useEffect, useState } from "react";
import { Box, Card, CardContent, Typography, TextField, Button, MenuItem, Grid, Table, TableHead, TableBody, TableRow, TableCell, LinearProgress, Chip, Stack, Divider } from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import axios from "axios";
import { useToast } from "../../../context/ToastContext";
import { useNavigate } from "react-router-dom";

const REQUISITION_API = "/api/erp/purchase/requisitions";
const SANCTION_API = "/api/erp/purchase/sanctions";
const SUPPLIER_API = "/api/erp/purchase/suppliers";

// Indian Financial Year (Apr–Mar)
function fyOf(dateStr) {
  const d = new Date(dateStr);
  if (isNaN(d)) return "";
  const y = d.getFullYear();
  const m = d.getMonth() + 1;
  const start = m >= 4 ? y : y - 1;
  return `${start}-${String(start + 1).slice(2)}`;
}
function fyOptions() {
  const y = new Date().getFullYear();
  return [y + 1, y, y - 1, y - 2].map((s) => `${s}-${String(s + 1).slice(2)}`);
}

export default function PRSanction() {
  const { showToast } = useToast();
  const [prs, setPrs] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [fy, setFy] = useState(fyOf(new Date().toISOString()));
  const [selectedPr, setSelectedPr] = useState("");
  const [pr, setPr] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [bulkParty, setBulkParty] = useState("");
  const [rows, setRows] = useState([]);

  useEffect(() => {
    axios.get(REQUISITION_API, { params: { status: "Approved" } }).then(({ data }) => setPrs(data || [])).catch(() => { });
    axios.get(SUPPLIER_API, { params: { is_active: true } }).then(({ data }) => setSuppliers(data || [])).catch(() => { });
  }, []);

  const filteredPrs = prs.filter((p) => fyOf(p.req_date) === fy);

  const loadPr = (id) => {
    setSelectedPr(id);
    setBulkParty("");
    if (!id) { setPr(null); setRows([]); return; }
    setLoading(true);
    axios.get(`${REQUISITION_API}/${id}`).then(async ({ data }) => {
      setPr(data);
      let existing = [];
      try {
        const { data: sanc } = await axios.get(SANCTION_API, { params: { requisition_id: id } });
        existing = sanc || [];
      } catch { existing = []; }
      const byItem = {};
      existing.forEach((s) => { byItem[s.pr_item_id] = s; });
      setRows((data.items || []).map((it) => {
        const s = byItem[it.id];
        return {
          pr_item_id: it.id,
          item_name: it.item_name,
          item_code: it.item_code || "",
          quantity: Number(it.quantity) || 0,
          uom: it.uom || "",
          supplier_id: s ? String(s.supplier_id) : "",
          sanctioned_qty: s ? (Number(s.sanctioned_qty) || Number(it.quantity) || 0) : Number(it.quantity) || 0,
          rate: s ? (Number(s.rate) || 0) : Number(it.est_cost) || 0,
        };
      }));
    }).catch(() => showToast("Failed to load PR", "error")).finally(() => setLoading(false));
  };

  const applyBulkParty = (e) => {
    const v = e.target.value;
    setBulkParty(v);
    setRows((prev) => prev.map((r) => ({ ...r, supplier_id: v })));
  };

  const handleRow = (idx, field) => (e) => {
    const v = e.target.value;
    setRows((prev) => prev.map((r, i) => (i === idx ? { ...r, [field]: v } : r)));
  };

  const save = async () => {
    const lines = rows
      .filter((r) => r.supplier_id && Number(r.sanctioned_qty) > 0)
      .map((r) => ({
        pr_item_id: r.pr_item_id,
        supplier_id: Number(r.supplier_id),
        sanctioned_qty: Number(r.sanctioned_qty),
        rate: Number(r.rate) || null,
      }));
    if (lines.length === 0) { showToast("Assign at least one item to a vendor with qty > 0", "warning"); return; }
    setSaving(true);
    try {
      await axios.post(SANCTION_API, { requisition_id: Number(selectedPr), lines });
      showToast("PR sanctioned successfully", "success");
    } catch (err) {
      showToast(err.response?.data?.error || "Failed to sanction", "error");
    } finally { setSaving(false); }
  };

  const navigate = useNavigate();

  const fsx = {
    "& .MuiInputBase-root": { fontSize: "0.88rem", height: 34 },
    "& .MuiInputLabel-root": { fontSize: "0.88rem", mt: -0.25 },
    "& .MuiInputLabel-shrink": { mt: 0 },
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* ── Title + Action Bar ── */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: "bold", color: "var(--heading-color)" }}>PR Sanction</Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button variant="contained" color="primary" size="medium" onClick={save} startIcon={<SaveIcon />} disabled={saving || loading || !pr}>
            {saving ? "Saving..." : "Save Sanction"}
          </Button>
          <Button variant="outlined" color="secondary" size="medium" onClick={() => navigate("/purchase/requisitions")} startIcon={<CancelIcon />}>
            Cancel
          </Button>
        </Box>
      </Box>
      <Card sx={{ borderRadius: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.08)", mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="end">
            <Grid item xs={12} sm={6} sx={{ width: 200, flex: "0 0 auto" }}>
              <TextField label="Financial Year" select size="small" fullWidth value={fy} onChange={(e) => setFy(e.target.value)} sx={fsx}>
                {fyOptions().map((f) => <MenuItem key={f} value={f}>{f}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} sx={{ width: 340, flex: "0 0 auto" }}>
              <TextField label="Select PR Number" select size="small" fullWidth value={selectedPr} onChange={(e) => loadPr(e.target.value)} sx={fsx}>
                <MenuItem value="">-- Select --</MenuItem>
                {filteredPrs.map((p) => (
                  <MenuItem key={p.id} value={String(p.id)}>
                    {p.req_no} {p.department ? `· ${p.department}` : ""} {p.requested_by ? `· ${p.requested_by}` : ""}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} sx={{ width: 340, flex: "0 0 auto" }}>
              <TextField label="Party (Vendor) - sanction all items to this vendor" select size="small" fullWidth value={bulkParty} onChange={applyBulkParty} sx={fsx}>
                <MenuItem value="">-- Select Party --</MenuItem>
                {suppliers.map((s) => <MenuItem key={s.id} value={String(s.id)}>{s.supplier_name}</MenuItem>)}
              </TextField>
            </Grid>
          </Grid>

          {loading && <LinearProgress sx={{ mt: 2 }} />}

          {pr && !loading && (
            <>
              <Divider sx={{ my: 2 }} />
              <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ md: "center" }} sx={{ mb: 2 }}>
                <Chip label={`PR: ${pr.req_no}`} color="primary" />
                <Chip label={`Items: ${pr.items?.length || 0}`} variant="outlined" />
              </Stack>

              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: "#f2f4f7" }}>
                    <TableCell><strong>Item</strong></TableCell>
                    <TableCell><strong>Code</strong></TableCell>
                    <TableCell align="right"><strong>PR Qty</strong></TableCell>
                    <TableCell><strong>UOM</strong></TableCell>
                    <TableCell sx={{ minWidth: 240 }}><strong>Party (Sanction To)</strong></TableCell>
                    <TableCell align="right"><strong>Sanctioned Qty</strong></TableCell>
                    <TableCell align="right"><strong>Rate</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((r, idx) => (
                    <TableRow key={r.pr_item_id}>
                      <TableCell>{r.item_name}</TableCell>
                      <TableCell>{r.item_code}</TableCell>
                      <TableCell align="right">{r.quantity}</TableCell>
                      <TableCell>{r.uom}</TableCell>
                      <TableCell>
                        <TextField select size="small" fullWidth value={r.supplier_id} onChange={handleRow(idx, "supplier_id")}>
                          <MenuItem value="">-- Select --</MenuItem>
                          {suppliers.map((s) => <MenuItem key={s.id} value={String(s.id)}>{s.supplier_name}</MenuItem>)}
                        </TextField>
                      </TableCell>
                      <TableCell>
                        <TextField type="number" size="small" value={r.sanctioned_qty} onChange={handleRow(idx, "sanctioned_qty")} sx={{ width: 110 }} />
                      </TableCell>
                      <TableCell>
                        <TextField type="number" size="small" value={r.rate} onChange={handleRow(idx, "rate")} sx={{ width: 110 }} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
