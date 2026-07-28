import React, { useEffect, useState } from "react";
import { Box, Typography, Table, TableHead, TableRow, TableCell, TableBody, LinearProgress, Button } from "@mui/material";
import PrintIcon from "@mui/icons-material/Print";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { formatQty } from "../../../../utils/format";

const API = "/api/erp/stores/material-requisitions";

export default function MRPrintView() {
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
  if (!data) return <Typography sx={{ p: 3 }}>MR not found</Typography>;

  return (
    <Box sx={{ p: 3, maxWidth: 1000, margin: "0 auto",
      "@media print": {
        p: 0, maxWidth: "100%", margin: 0,
        "@page": { size: "A5 landscape", margin: "0.6cm" },
      }
    }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2, "@media print": { display: "none" } }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)}>Back</Button>
        <Button variant="contained" startIcon={<PrintIcon />} onClick={() => window.print()}>Print</Button>
      </Box>

      <Box id="print-area">
        <Typography variant="h6" sx={{ fontWeight: 700, textAlign: "center", mb: 0.5, fontSize: "1rem", "@media print": { fontSize: "11pt" } }}>MATERIAL REQUISITION</Typography>
        <Typography variant="body2" sx={{ textAlign: "center", color: "text.secondary", mb: 1.5, "@media print": { fontSize: "9pt", color: "#000", mb: 1 } }}>
          {(data.department || "").toUpperCase()}
        </Typography>

        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1.5, px: 1, "@media print": { mb: 1, px: 0.5 } }}>
          <Box>
            <Typography variant="body2" sx={{ "@media print": { fontSize: "8pt" } }}><strong>MR No:</strong> {data.req_no}</Typography>
            <Typography variant="body2" sx={{ "@media print": { fontSize: "8pt" } }}><strong>Date:</strong> {data.req_date?.split("T")[0]}</Typography>
            <Typography variant="body2" sx={{ "@media print": { fontSize: "8pt" } }}><strong>Department:</strong> {data.department}</Typography>
          </Box>
          <Box sx={{ textAlign: "right" }}>
            <Typography variant="body2" sx={{ "@media print": { fontSize: "8pt" } }}><strong>Status:</strong> {data.status}</Typography>
            <Typography variant="body2" sx={{ "@media print": { fontSize: "8pt" } }}><strong>Requested By:</strong> {data.requested_by}</Typography>
            {data.remarks && <Typography variant="body2" sx={{ "@media print": { fontSize: "8pt" } }}><strong>Remarks:</strong> {data.remarks}</Typography>}
          </Box>
        </Box>

        <Table size="small" sx={{ border: "1px solid #000", mb: 1.5, "& td, & th": { border: "1px solid #000", px: 0.75, py: 0.4, fontSize: "0.8rem", "@media print": { fontSize: "8pt", px: 0.5, py: 0.25 } } }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, bgcolor: "#f0f0f0", "@media print": { bgcolor: "#e0e0e0" } }}>#</TableCell>
              <TableCell sx={{ fontWeight: 700, bgcolor: "#f0f0f0", "@media print": { bgcolor: "#e0e0e0" } }}>Item Code</TableCell>
              <TableCell sx={{ fontWeight: 700, bgcolor: "#f0f0f0", "@media print": { bgcolor: "#e0e0e0" } }}>Item Description</TableCell>
              <TableCell sx={{ fontWeight: 700, bgcolor: "#f0f0f0", "@media print": { bgcolor: "#e0e0e0" } }}>UOM</TableCell>
              <TableCell sx={{ fontWeight: 700, bgcolor: "#f0f0f0", "@media print": { bgcolor: "#e0e0e0" } }}>Qty</TableCell>
              <TableCell sx={{ fontWeight: 700, bgcolor: "#f0f0f0", "@media print": { bgcolor: "#e0e0e0" } }}>Remarks</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(data.items || []).map((it, i) => (
              <TableRow key={i}>
                <TableCell sx={{ "@media print": { fontSize: "8pt" } }}>{i + 1}</TableCell>
                <TableCell sx={{ "@media print": { fontSize: "8pt" } }}>{it.item_code}</TableCell>
                <TableCell sx={{ "@media print": { fontSize: "8pt" } }}>{it.item_name}</TableCell>
                <TableCell sx={{ "@media print": { fontSize: "8pt" } }}>{it.uom}</TableCell>
                <TableCell sx={{ "@media print": { fontSize: "8pt" } }}>{formatQty(it.quantity)}</TableCell>
                <TableCell sx={{ "@media print": { fontSize: "8pt" } }}>{it.remarks || ""}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <Box sx={{ mt: 3, display: "flex", justifyContent: "space-between", px: 2, "@media print": { mt: 2, px: 1 } }}>
          <Box><Typography variant="body2" sx={{ "@media print": { fontSize: "8pt" } }}><strong>Prepared By</strong></Typography><Box sx={{ mt: 2, borderTop: "1px solid #000", width: 160, "@media print": { width: 140, mt: 1.5 } }} /></Box>
          <Box><Typography variant="body2" sx={{ "@media print": { fontSize: "8pt" } }}><strong>Reviewed By</strong></Typography><Box sx={{ mt: 2, borderTop: "1px solid #000", width: 160, "@media print": { width: 140, mt: 1.5 } }} /></Box>
          <Box><Typography variant="body2" sx={{ "@media print": { fontSize: "8pt" } }}><strong>Approved By</strong></Typography><Box sx={{ mt: 2, borderTop: "1px solid #000", width: 160, "@media print": { width: 140, mt: 1.5 } }} /></Box>
        </Box>
      </Box>
    </Box>
  );
}