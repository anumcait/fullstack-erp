import React, { useEffect, useState } from "react";
import {
  Box, Dialog, DialogContent, DialogTitle, IconButton, Typography, Table, TableHead, TableRow, TableCell, TableBody,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import PrintIcon from "@mui/icons-material/Print";
import axios from "axios";

const API = "/api/erp/stores/inward-registers";
const SUPPLIERS_API = "/api/erp/purchase/suppliers";

const fmtNum = (v) => {
  const n = Number(v);
  return isNaN(n) ? "0" : n % 1 === 0 ? String(n) : n.toFixed(2);
};

const fmtDate = (d) => (!d ? "-" : new Date(d).toLocaleDateString("en-GB"));

const fmtDateTime = (d) => (!d ? "-" : new Date(d).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }));

export default function InwardRegisterPreview({ data, onClose }) {
  const [supplier, setSupplier] = useState(null);

  useEffect(() => {
    if (data.party_id) {
      axios.get(`${SUPPLIERS_API}/${data.party_id}`).then(({ data: s }) => setSupplier(s)).catch(() => {});
    }
  }, [data.party_id]);

  const items = data.items || [];
  const totalQty = items.reduce((s, i) => s + Number(i.qty_supplied || 0), 0);

  const handlePrint = () => {
    const printWin = window.open("", "_blank");
    if (!printWin) return;
    const html = document.getElementById("ir-print-content").innerHTML;
    printWin.document.write(`
      <html><head><title>IR #${data.ir_no || "-"}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        body { font-family: 'Inter', sans-serif; margin: 0; padding: 20px; color: #1e293b; }
        table { width: 100%; border-collapse: collapse; font-size: 10px; }
        th, td { border: 1px solid #cbd5e1; padding: 4px 6px; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #059669; padding-bottom: 12px; margin-bottom: 16px; }
        .company { font-size: 14px; font-weight: 700; }
        h1 { font-size: 14px; font-weight: 700; margin: 0; }
        .meta { font-size: 10px; color: #475569; }
        .label { font-size: 9px; color: #64748b; text-transform: uppercase; font-weight: 600; }
        .value { font-size: 10px; font-weight: 600; }
      </style>
      </head>
      <body>${html}</body></html>
    `);
    printWin.document.close();
    printWin.focus();
    printWin.print();
  };

  return (
    <Dialog open={true} onClose={onClose} maxWidth="lg" fullWidth
      PaperProps={{ sx: { borderRadius: 3, bgcolor: "#fff" } }}>
      <DialogTitle sx={{ fontWeight: 700, fontSize: "1rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span>Inward Register #{data.ir_no || "-"} — Preview</span>
        <Box sx={{ display: "flex", gap: 1 }}>
          <IconButton size="small" onClick={handlePrint} sx={{ color: "#64748b", "&:hover": { color: "#059669" } }}><PrintIcon /></IconButton>
          <IconButton size="small" onClick={onClose} sx={{ color: "#64748b" }}><CloseIcon /></IconButton>
        </Box>
      </DialogTitle>
      <DialogContent dividers sx={{ p: 3, "&:last-child": { pb: 3 } }}>
        <Box id="ir-print-content">
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "2px solid #059669", pb: 1.5, mb: 2 }}>
            <Box>
              <Typography className="company" sx={{ fontSize: "14px", fontWeight: 700, color: "#0f172a" }}>AUCTOR HOME APPLIANCES LLP</Typography>
              <Typography sx={{ fontSize: "9px", color: "#64748b", mt: 0.25 }}>
                Inward Register
              </Typography>
            </Box>
            <Box sx={{ textAlign: "right" }}>
              <Typography sx={{ fontSize: "14px", fontWeight: 700, color: "#059669" }}>INWARD REGISTER</Typography>
              <Typography className="meta" sx={{ fontSize: "9px", color: "#64748b" }}>
                IR #: {data.ir_no || "-"} | Date: {fmtDate(data.ir_date)}
              </Typography>
              <Typography className="meta" sx={{ fontSize: "9px", color: "#64748b" }}>
                Party: {data.party_name || "-"}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
            <Box>
              <Typography sx={{ fontSize: "9px", color: "#64748b", textTransform: "uppercase", fontWeight: 600 }}>Party Details</Typography>
              <Box sx={{ mt: 0.5, fontSize: "9px", color: "#475569" }}>
                {supplier?.supplier_name || data.party_name || "-"}
                {supplier?.address_line1 ? <><br />{supplier.address_line1}</> : ""}
                {supplier?.phone ? <br />`Ph: ${supplier.phone}` : ""}
              </Box>
            </Box>
            <Box sx={{ textAlign: "right" }}>
              <Typography sx={{ fontSize: "9px", color: "#64748b", textTransform: "uppercase", fontWeight: 600 }}>Document Details</Typography>
              <Box sx={{ mt: 0.5, fontSize: "9px", color: "#475569" }}>
                Vehicle: {data.vehicle_no || "-"}
                <br />Driver: {data.driver_name || "-"}
                <br />Inward Date: {data.inward_date ? new Date(data.inward_date).toLocaleDateString("en-GB") : "-"}
              </Box>
            </Box>
          </Box>

          <Table sx={{ width: "100%", borderCollapse: "collapse", fontSize: "10px" }}>
            <TableHead>
              <TableRow sx={{ bgcolor: "#f0f4f8" }}>
                <TableCell sx={{ fontSize: "8px", fontWeight: 700, border: "1px solid #cbd5e1", textAlign: "center" }}>Sl#</TableCell>
                <TableCell sx={{ fontSize: "8px", fontWeight: 700, border: "1px solid #cbd5e1", textAlign: "center" }}>DC#</TableCell>
                <TableCell sx={{ fontSize: "8px", fontWeight: 700, border: "1px solid #cbd5e1" }}>Item Code</TableCell>
                <TableCell sx={{ fontSize: "8px", fontWeight: 700, border: "1px solid #cbd5e1" }}>Description</TableCell>
                <TableCell sx={{ fontSize: "8px", fontWeight: 700, border: "1px solid #cbd5e1", textAlign: "center" }}>UOM</TableCell>
                <TableCell sx={{ fontSize: "8px", fontWeight: 700, border: "1px solid #cbd5e1", textAlign: "center" }}>DC Qty</TableCell>
                <TableCell sx={{ fontSize: "8px", fontWeight: 700, border: "1px solid #cbd5e1", textAlign: "center" }}>Qty Supplied</TableCell>
                <TableCell sx={{ fontSize: "8px", fontWeight: 700, border: "1px solid #cbd5e1" }}>Remarks</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
               {items.map((it, i) => {
                 const dc = data.deliveryChallans?.find((d) => d.id === it.dc_id);
                 return (
                 <TableRow key={it.id || i}>
                   <TableCell sx={{ fontSize: "9px", border: "1px solid #e2e8f0", textAlign: "center" }}>{i + 1}</TableCell>
                   <TableCell sx={{ fontSize: "9px", border: "1px solid #e2e8f0", textAlign: "center", fontFamily: "monospace" }}>{dc?.dc_no || dc?.draft_no || "-"}</TableCell>
                   <TableCell sx={{ fontSize: "9px", border: "1px solid #e2e8f0" }}>{it.item_code || "-"}</TableCell>
                   <TableCell sx={{ fontSize: "9px", border: "1px solid #e2e8f0" }}>{it.item_name || "-"}</TableCell>
                   <TableCell sx={{ fontSize: "9px", border: "1px solid #e2e8f0", textAlign: "center" }}>{it.uom || "-"}</TableCell>
                   <TableCell sx={{ fontSize: "9px", border: "1px solid #e2e8f0", textAlign: "center" }}>{fmtNum(it.dc_qty)}</TableCell>
                   <TableCell sx={{ fontSize: "9px", border: "1px solid #e2e8f0", textAlign: "center", fontWeight: 600 }}>{fmtNum(it.qty_supplied)}</TableCell>
                   <TableCell sx={{ fontSize: "9px", border: "1px solid #e2e8f0" }}>{it.remarks || "-"}</TableCell>
                 </TableRow>
                 );})}
               <TableRow sx={{ bgcolor: "#f8fafc" }}>
                 <TableCell colSpan={6} sx={{ fontSize: "9px", fontWeight: 700, border: "1px solid #cbd5e1", textAlign: "right" }}>Total :</TableCell>
                 <TableCell sx={{ fontSize: "9px", fontWeight: 700, border: "1px solid #cbd5e1", textAlign: "center", color: "#059669" }}>{fmtNum(totalQty)}</TableCell>
                 <TableCell sx={{ border: "1px solid #cbd5e1" }}></TableCell>
               </TableRow>
            </TableBody>
          </Table>

          {data.status === "Cancelled" && data.cancel_remarks ? (
            <Box sx={{ mt: 2, p: 1.5, bgcolor: "#fef2f2", borderRadius: 1, border: "1px solid #fecaca" }}>
              <Typography sx={{ fontSize: "9px", fontWeight: 700, color: "#b91c1c" }}>Cancellation Remarks :</Typography>
              <Typography sx={{ fontSize: "9px", color: "#7f1d1d" }}>{data.cancel_remarks}</Typography>
              <Typography sx={{ fontSize: "9px", color: "#7f1d1d", mt: 0.25 }}>Cancelled By: {data.cancel_by || "-"} | On: {fmtDateTime(data.cancel_date)}</Typography>
            </Box>
          ) : null}

          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", mt: 3, borderTop: "2px solid #059669", pt: 1.5 }}>
            <Box sx={{ textAlign: "left" }}>
              <Typography sx={{ fontSize: "9px", fontWeight: 700, color: "#64748b" }}>Remarks</Typography>
              <Typography sx={{ fontSize: "9px", color: "#475569", mt: 0.5, minHeight: "24px" }}>{data.remarks || "-"}</Typography>
            </Box>
            <Box sx={{ textAlign: "right", minWidth: 180 }}>
              <Typography variant="caption" sx={{ color: "#64748b", display: "block" }}>Prepared By</Typography>
              <Typography sx={{ fontSize: "10px", fontWeight: 600 }}>{data.prepared_by || "-"}</Typography>
              <Typography variant="caption" sx={{ color: "#64748b", display: "block", mt: 1 }}>Date</Typography>
              <Typography sx={{ fontSize: "10px", fontWeight: 600 }}>{fmtDate(data.ir_date)}</Typography>
            </Box>
            <Box sx={{ textAlign: "right", minWidth: 180 }}>
              <Typography variant="caption" sx={{ color: "#64748b", display: "block" }}>{data.status === "Cancelled" ? "Cancelled By" : "Checked By / Authorized Signatory"}</Typography>
              <Typography sx={{ fontSize: "10px", fontWeight: 600, mt: 1 }}>{data.status === "Cancelled" ? (data.cancel_by || "-") : "-"}</Typography>
              <Typography variant="caption" sx={{ color: "#64748b", display: "block", mt: 1 }}>{data.status === "Cancelled" ? "Date" : ""}</Typography>
              <Typography sx={{ fontSize: "10px", fontWeight: 600 }}>{data.status === "Cancelled" ? fmtDate(data.cancel_date) : ""}</Typography>
            </Box>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
