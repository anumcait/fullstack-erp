import React, { useEffect, useState } from "react";
import { Box, Typography, Table, TableHead, TableRow, TableCell, TableBody, LinearProgress, Button, Card, CardContent } from "@mui/material";
import PrintIcon from "@mui/icons-material/Print";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { formatDate, formatDateTime } from "../../../../utils/format";

const API = "/api/erp/purchase/requisitions";

const compareKeys = ["item_code", "item_name", "quantity", "uom", "mat_code", "purpose", "est_cost", "kg", "len", "cost_center"];

function ItemTable({ label, items, otherItems }) {
  const isAfter = label === "AFTER AMENDMENT";

  function rowBg(i) {
    const it = items?.[i];
    const ot = otherItems?.[i];
    if (!it && ot) return "#fff0f0";
    if (it && !ot) return "#f0fff0";
    return "inherit";
  }

  function changedStyle(it, ot, k) {
    if (!isAfter || !ot) return {};
    const n = (v) => { const c = Number(v); return isNaN(c) ? String(v ?? '').trim() : c; };
    return n(it[k]) !== n(ot[k]) ? { fontWeight: 700, color: "#d32f2f" } : {};
  }

  return (
    <Card sx={{ borderRadius: 2, border: "1px solid #000", boxShadow: "none", height: "100%" }}>
      <Box sx={{ bgcolor: isAfter ? "#e8f5e9" : "#ffebee", px: 2, py: 0.75, borderBottom: "1px solid #000" }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 800, textAlign: "center", fontSize: "0.85rem" }}>{label}</Typography>
      </Box>
      <CardContent sx={{ p: 0, "&:last-child": { pb: 0 } }}>
        <Table size="small" sx={{ "& td, & th": { border: "1px solid #000", px: 0.75, py: 0.4, fontSize: "0.75rem" } }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, bgcolor: "#f5f5f5", textAlign: "center", width: 28 }}>#</TableCell>
              <TableCell sx={{ fontWeight: 700, bgcolor: "#f5f5f5", textAlign: "center" }}>Item Code</TableCell>
              <TableCell sx={{ fontWeight: 700, bgcolor: "#f5f5f5", textAlign: "center" }}>Description</TableCell>
              <TableCell sx={{ fontWeight: 700, bgcolor: "#f5f5f5", textAlign: "center", width: 40 }}>UOM</TableCell>
              <TableCell sx={{ fontWeight: 700, bgcolor: "#f5f5f5", textAlign: "center", width: 65 }}>Qty</TableCell>
              <TableCell sx={{ fontWeight: 700, bgcolor: "#f5f5f5", textAlign: "center", width: 50 }}>Mat Code</TableCell>
              <TableCell sx={{ fontWeight: 700, bgcolor: "#f5f5f5", textAlign: "center", width: 55 }}>Est Cost</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(!items || items.length === 0) ? (
              <TableRow><TableCell colSpan={7} sx={{ textAlign: "center", fontStyle: "italic", py: 1 }}>No items</TableCell></TableRow>
            ) : items.map((it, i) => {
              const ot = otherItems?.[i];
              return (
                <TableRow key={i} sx={{ bgcolor: rowBg(i) }}>
                  <TableCell sx={{ textAlign: "center", fontWeight: 600 }}>{i + 1}</TableCell>
                  <TableCell sx={{ ...changedStyle(it, ot, "item_code") }}>{it.item_code || "—"}</TableCell>
                  <TableCell sx={{ ...changedStyle(it, ot, "item_name") }}>{it.item_name || "—"}</TableCell>
                  <TableCell sx={{ textAlign: "center", ...changedStyle(it, ot, "uom") }}>{it.uom || "—"}</TableCell>
                  <TableCell sx={{ textAlign: "center", ...changedStyle(it, ot, "quantity") }}>{it.quantity ?? "—"}</TableCell>
                  <TableCell sx={{ textAlign: "center", ...changedStyle(it, ot, "mat_code") }}>{it.mat_code || "—"}</TableCell>
                  <TableCell sx={{ textAlign: "center", ...changedStyle(it, ot, "est_cost") }}>{it.est_cost ? Number(it.est_cost).toFixed(2) : "—"}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

export default function PRAmendmentCompare() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pr, setPr] = useState(null);
  const [amendment, setAmendment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      axios.get(`${API}/${id}`),
      axios.get(`${API}/${id}/amendments`),
    ])
      .then(([prRes, amdRes]) => {
        setPr(prRes.data);
        const amd = amdRes.data?.[0];
        if (amd) setAmendment(amd);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LinearProgress />;
  if (!pr || !amendment) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <Typography variant="h6">No amendment data available.</Typography>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate("/purchase/requisitions")} sx={{ mt: 2 }}>Back to PR List</Button>
      </Box>
    );
  }

  const oldData = amendment.old_value || { header: {}, items: [] };
  const newData = amendment.new_value || { header: {}, items: [] };
  const oldItems = oldData.items || [];
  const newItems = newData.items || [];

  return (
    <Box sx={{ p: 3, maxWidth: 1100, margin: "0 auto" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2, "@media print": { display: "none" } }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate("/purchase/requisitions")}>Back to PR List</Button>
        <Button variant="contained" startIcon={<PrintIcon />} onClick={() => window.print()}>Print / PDF</Button>
      </Box>

      <Box id="print-area-amend" sx={{ fontSize: "0.85rem" }}>
        <Typography variant="h5" sx={{ fontWeight: 800, textAlign: "center", mb: 0.25 }}>PR AMENDMENT</Typography>
        <Typography variant="body2" sx={{ textAlign: "center", color: "text.secondary", mb: 2, fontSize: "0.8rem" }}>
          {pr.department || ""}{pr.sub_department ? ` / ${pr.sub_department}` : ""}
        </Typography>

        <Box sx={{ border: "1px solid #000", p: 1.5, mb: 2, display: "flex", justifyContent: "space-between" }}>
          <Box>
            <Typography variant="body2"><strong>AMD #:</strong> {amendment.id}</Typography>
            <Typography variant="body2"><strong>PR No:</strong> {amendment.req_no || pr.req_no}</Typography>
            <Typography variant="body2"><strong>PR Date:</strong> {pr.req_date ? formatDateTime(pr.req_date) : "—"}</Typography>
          </Box>
          <Box sx={{ textAlign: "right" }}>
            <Typography variant="body2"><strong>Status:</strong> {pr.status}</Typography>
            <Typography variant="body2"><strong>Requested By:</strong> {pr.requested_by || "—"}</Typography>
            <Typography variant="body2"><strong>Indent Type:</strong> {pr.indent_type || "—"}</Typography>
          </Box>
        </Box>

        <Box sx={{ border: "1px solid #000", p: 1.5, mb: 2, bgcolor: "#fffde7" }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>Amendment Details</Typography>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Box>
              <Typography variant="body2"><strong>Amended By:</strong> {amendment.amended_by || "—"}</Typography>
              <Typography variant="body2"><strong>Amended On:</strong> {amendment.amendment_date ? formatDateTime(amendment.amendment_date) : "—"}</Typography>
            </Box>
            {amendment.change_summary && (
              <Box sx={{ maxWidth: "55%" }}>
                <Typography variant="body2"><strong>Change Summary:</strong></Typography>
                <Typography variant="body2" sx={{ fontSize: "0.78rem", whiteSpace: "pre-wrap" }}>{amendment.change_summary}</Typography>
              </Box>
            )}
          </Box>
        </Box>

        <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
          <Box sx={{ flex: 1 }}>
            <ItemTable label="BEFORE AMENDMENT" items={oldItems} otherItems={newItems} />
          </Box>
          <Box sx={{ flex: 1 }}>
            <ItemTable label="AFTER AMENDMENT" items={newItems} otherItems={oldItems} />
          </Box>
        </Box>

        <Box sx={{ mt: 4, display: "flex", justifyContent: "space-between", px: 2 }}>
          <Box><Typography variant="body2"><strong>Prepared By</strong></Typography><Box sx={{ mt: 3, borderTop: "1px solid #000", width: 180 }} /></Box>
          <Box><Typography variant="body2"><strong>Checked By</strong></Typography><Box sx={{ mt: 3, borderTop: "1px solid #000", width: 180 }} /></Box>
          <Box><Typography variant="body2"><strong>Approved By</strong></Typography><Box sx={{ mt: 3, borderTop: "1px solid #000", width: 180 }} /></Box>
        </Box>
      </Box>
    </Box>
  );
}