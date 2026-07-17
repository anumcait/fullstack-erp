import React, { useEffect, useState } from "react";
import { Box, Typography, Table, TableHead, TableRow, TableCell, TableBody, LinearProgress, Button } from "@mui/material";
import PrintIcon from "@mui/icons-material/Print";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

const API = "/api/erp/purchase/requisitions";

export default function PRPrintView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    axios.get(`${API}/${id}`)
      .then(({ data }) => setData(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LinearProgress />;
  if (!data) return <Typography sx={{ p: 3 }}>PR not found</Typography>;

  return (
    <Box sx={{ p: 3, maxWidth: 1000, margin: "0 auto" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2, "@media print": { display: "none" } }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)}>Back</Button>
        <Button variant="contained" startIcon={<PrintIcon />} onClick={() => window.print()}>Print</Button>
      </Box>

      {/* ── Printable content ── */}
      <Box id="print-area">
        <Typography variant="h5" sx={{ fontWeight: 700, textAlign: "center", mb: 0.5 }}>PURCHASE REQUISITION</Typography>
        <Typography variant="body2" sx={{ textAlign: "center", color: "text.secondary", mb: 2 }}>
          {(data.department || "").toUpperCase()}{data.sub_department ? ` / ${data.sub_department.toUpperCase()}` : ""}
        </Typography>

        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2, px: 1 }}>
          <Box>
            <Typography variant="body2"><strong>PR No:</strong> {data.req_no}</Typography>
            <Typography variant="body2"><strong>Date:</strong> {data.req_date?.split("T")[0]}</Typography>
            <Typography variant="body2"><strong>Indent Type:</strong> {data.indent_type}</Typography>
            <Typography variant="body2"><strong>Priority:</strong> {data.priority}</Typography>
          </Box>
          <Box sx={{ textAlign: "right" }}>
            <Typography variant="body2"><strong>Status:</strong> {data.status}</Typography>
            <Typography variant="body2"><strong>Requested By:</strong> {data.requested_by}</Typography>
            {data.notes && <Typography variant="body2"><strong>Notes:</strong> {data.notes}</Typography>}
          </Box>
        </Box>

        <Table size="small" sx={{ border: "1px solid #000", mb: 2, "& td, & th": { border: "1px solid #000", px: 1, py: 0.5, fontSize: "0.8rem" } }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, bgcolor: "#f0f0f0" }}>#</TableCell>
              <TableCell sx={{ fontWeight: 700, bgcolor: "#f0f0f0" }}>Item Code</TableCell>
              <TableCell sx={{ fontWeight: 700, bgcolor: "#f0f0f0" }}>Item Description</TableCell>
              <TableCell sx={{ fontWeight: 700, bgcolor: "#f0f0f0" }}>UOM</TableCell>
              <TableCell sx={{ fontWeight: 700, bgcolor: "#f0f0f0" }}>Qty</TableCell>
              <TableCell sx={{ fontWeight: 700, bgcolor: "#f0f0f0" }}>Purpose</TableCell>
              <TableCell sx={{ fontWeight: 700, bgcolor: "#f0f0f0" }}>Mat. Code</TableCell>
              <TableCell sx={{ fontWeight: 700, bgcolor: "#f0f0f0" }}>Est Cost</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(data.items || []).map((it, i) => (
              <TableRow key={i}>
                <TableCell>{i + 1}</TableCell>
                <TableCell>{it.item_code}</TableCell>
                <TableCell>{it.item_name}{it.mat_desc ? ` / ${it.mat_desc}` : ""}</TableCell>
                <TableCell>{it.uom}</TableCell>
                <TableCell>{it.quantity}</TableCell>
                <TableCell>{it.purpose}</TableCell>
                <TableCell>{it.mat_code}</TableCell>
                <TableCell>{it.est_cost ? Number(it.est_cost).toFixed(2) : "—"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <Box sx={{ mt: 4, display: "flex", justifyContent: "space-between", px: 2 }}>
          <Box><Typography variant="body2"><strong>Prepared By</strong></Typography><Box sx={{ mt: 3, borderTop: "1px solid #000", width: 180 }} /></Box>
          <Box><Typography variant="body2"><strong>Authorized By</strong></Typography><Box sx={{ mt: 3, borderTop: "1px solid #000", width: 180 }} /></Box>
          <Box><Typography variant="body2"><strong>Approved By</strong></Typography><Box sx={{ mt: 3, borderTop: "1px solid #000", width: 180 }} /></Box>
        </Box>
      </Box>
    </Box>
  );
}
