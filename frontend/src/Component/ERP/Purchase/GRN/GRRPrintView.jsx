import React, { useEffect, useState } from "react";
import { Box, Typography, Table, TableHead, TableRow, TableCell, TableBody, LinearProgress, Button } from "@mui/material";
import PrintIcon from "@mui/icons-material/Print";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

const API = "/api/erp/stores/grn";

export default function GRRPrintView() {
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
  if (!data) return <Typography sx={{ p: 3 }}>GRR not found</Typography>;

  return (
    <Box sx={{ p: 3, maxWidth: 1000, margin: "0 auto" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2, "@media print": { display: "none" } }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)}>Back</Button>
        <Button variant="contained" startIcon={<PrintIcon />} onClick={() => window.print()}>Print</Button>
      </Box>

      <Box id="print-area">
        <Typography variant="h5" sx={{ fontWeight: 700, textAlign: "center", mb: 0.5 }}>GOODS RECEIVED RECORD</Typography>
        <Typography variant="body2" sx={{ textAlign: "center", color: "text.secondary", mb: 2 }}>
          {data.ir_type || "GRR"} — {data.supplier?.supplier_name || ""}
        </Typography>

        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2, px: 1 }}>
          <Box>
            <Typography variant="body2"><strong>GRR No:</strong> {data.ir_no}</Typography>
            <Typography variant="body2"><strong>Date:</strong> {data.ir_date}</Typography>
            <Typography variant="body2"><strong>PO No:</strong> {data.purchaseOrder?.po_no || "—"}</Typography>
            <Typography variant="body2"><strong>PR No:</strong> {data.purchaseRequisition?.req_no || "—"}</Typography>
          </Box>
          <Box sx={{ textAlign: "right" }}>
            <Typography variant="body2"><strong>Status:</strong> {data.status}</Typography>
            <Typography variant="body2"><strong>Approval:</strong> {data.approval_status}</Typography>
            <Typography variant="body2"><strong>Invoice:</strong> {data.invoice_no || "—"}</Typography>
            <Typography variant="body2"><strong>Gate Entry:</strong> {data.gate_entry_no || "—"}</Typography>
          </Box>
        </Box>

        {data.notes && (
          <Typography variant="body2" sx={{ mb: 1, px: 1 }}><strong>Notes:</strong> {data.notes}</Typography>
        )}

        <Table size="small" sx={{ border: "1px solid #000", mb: 2, "& td, & th": { border: "1px solid #000", px: 1, py: 0.5, fontSize: "0.8rem" } }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, bgcolor: "#f0f0f0" }}>#</TableCell>
              <TableCell sx={{ fontWeight: 700, bgcolor: "#f0f0f0" }}>Item Code</TableCell>
              <TableCell sx={{ fontWeight: 700, bgcolor: "#f0f0f0" }}>Description</TableCell>
              <TableCell sx={{ fontWeight: 700, bgcolor: "#f0f0f0" }}>Ordered</TableCell>
              <TableCell sx={{ fontWeight: 700, bgcolor: "#f0f0f0" }}>Accepted</TableCell>
              <TableCell sx={{ fontWeight: 700, bgcolor: "#f0f0f0" }}>Rejected</TableCell>
              <TableCell sx={{ fontWeight: 700, bgcolor: "#f0f0f0" }}>Rate</TableCell>
              <TableCell sx={{ fontWeight: 700, bgcolor: "#f0f0f0" }}>GST %</TableCell>
              <TableCell sx={{ fontWeight: 700, bgcolor: "#f0f0f0" }}>Amount</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(data.items || []).map((it, i) => (
              <TableRow key={i}>
                <TableCell>{i + 1}</TableCell>
                <TableCell>{it.item_code || "—"}</TableCell>
                <TableCell>{it.item_name}</TableCell>
                <TableCell>{Number(it.ordered_qty).toFixed(2)}</TableCell>
                <TableCell>{Number(it.accepted_qty).toFixed(2)}</TableCell>
                <TableCell>{Number(it.rejected_qty).toFixed(2)}</TableCell>
                <TableCell>{Number(it.rate).toFixed(2)}</TableCell>
                <TableCell>{Number(it.gst_rate).toFixed(2)}%</TableCell>
                <TableCell>{Number(it.amount).toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <Box sx={{ mt: 4, display: "flex", justifyContent: "space-between", px: 2 }}>
          <Box><Typography variant="body2"><strong>Received By</strong></Typography><Box sx={{ mt: 3, borderTop: "1px solid #000", width: 180 }} /></Box>
          <Box><Typography variant="body2"><strong>QA By</strong></Typography><Box sx={{ mt: 3, borderTop: "1px solid #000", width: 180 }} /></Box>
          <Box><Typography variant="body2"><strong>Approved By</strong></Typography><Box sx={{ mt: 3, borderTop: "1px solid #000", width: 180 }} /></Box>
        </Box>
      </Box>
    </Box>
  );
}
