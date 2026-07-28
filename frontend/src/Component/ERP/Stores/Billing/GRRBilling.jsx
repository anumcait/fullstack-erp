import React, { useEffect, useState, useCallback } from "react";
import {
  Box, Card, CardContent, Typography, TextField, Button, Chip, LinearProgress,
  Table, TableHead, TableRow, TableCell, TableBody, TableContainer, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, Tooltip, Stack, Divider,
  Grid, Checkbox,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import CancelIcon from "@mui/icons-material/Cancel";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import axios from "axios";
import { useToast } from "../../../../context/ToastContext";
import { formatNumber } from "../../../../utils/format";

const API = "/api/erp/stores/grn";
const r2 = (v) => Number(Number(v || 0).toFixed(2));

export default function GRRBilling() {
  const { showToast } = useToast();
  const [rows, setRows] = useState([]);
  const [allPos, setAllPos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [selected, setSelected] = useState({});
  const [billDlg, setBillDlg] = useState({ open: false, data: [] });
  const [billItems, setBillItems] = useState([]);
  const [billing, setBilling] = useState(false);
  const [form, setForm] = useState({ bill_no: "", bill_date: new Date().toISOString().slice(0, 10), invoice_no: "", invoice_date: "", remarks: "" });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(API + "/pending-billing");
      setRows(data);
      try {
        const { data: posData } = await axios.get("/api/erp/purchase/orders");
        setAllPos(posData || []);
      } catch (err) {
        console.error("Failed to load backup PO list:", err);
      }
    } catch { showToast("Failed to load", "error"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  var selCount = Object.values(selected).filter(Boolean).length;
  var selectedGrns = rows.filter(function (r) { return selected[r.id]; });

  var toggleSelect = function (id) {
    setSelected(function (prev) {
      var next = { ...prev, [id]: !prev[id] };
      return next;
    });
  };

  var selectAll = function () {
    if (selCount === rows.length) { setSelected({}); return; }
    var all = {};
    rows.forEach(function (r) { all[r.id] = true; });
    setSelected(all);
  };

  var openBillDlg = function () {
    if (selCount === 0) { showToast("Select at least one GRR", "warning"); return; }
    setForm({
      bill_no: "",
      bill_date: new Date().toISOString().slice(0, 10),
      invoice_no: "",
      invoice_date: "",
      remarks: "",
    });
    var poItemMap = {};
    var poItemByCodeMap = {}; // mapping by po_no and item_code

    var addPoItems = function (po) {
      if (po && po.items) {
        po.items.forEach(function (poi) {
          poItemMap[poi.id] = { po_no: po.po_no, ...poi };
          if (poi.item_id) poItemMap["item_" + poi.item_id] = { po_no: po.po_no, ...poi };
          if (poi.item_code) {
            poItemByCodeMap[po.po_no + ":" + poi.item_code] = { po_no: po.po_no, ...poi };
          }
        });
      }
    };

    // 1. Add from selected GRRs' nested purchaseOrders
    selectedGrns.forEach(function (grn) {
      addPoItems(grn.purchaseOrder);
    });

    // 2. Add from allPos backup list
    if (allPos) {
      allPos.forEach(function (po) {
        addPoItems(po);
      });
    }

    var items = [];
    selectedGrns.forEach(function (grn) {
      (grn.items || []).forEach(function (it) {
        // Search first by po_item_id
        var poi = it.po_item_id ? poItemMap[it.po_item_id] : null;
        // Fallback by item_id
        if (!poi && it.item_id) {
          poi = poItemMap["item_" + it.item_id];
        }
        // Fallback by po_no and item_code
        if (!poi && it.po_no && it.item_code) {
          poi = poItemByCodeMap[it.po_no + ":" + it.item_code];
        }
        // Fallback by just item_code across the PO items of this GRR
        if (!poi && it.item_code && grn.purchaseOrder && grn.purchaseOrder.items) {
          poi = grn.purchaseOrder.items.find(function (x) { return x.item_code === it.item_code; });
        }
        // Fallback by item_code on the PO in allPos that matches it.po_no
        if (!poi && it.item_code && it.po_no && allPos) {
          var matchedPo = allPos.find(function (po) { return po.po_no === it.po_no; });
          if (matchedPo && matchedPo.items) {
            var matched = matchedPo.items.find(function (x) { return x.item_code === it.item_code; });
            if (matched) poi = { po_no: matchedPo.po_no, ...matched };
          }
        }

        var defaultGst = Number(it.gst_rate || 0) / 2;
        items.push({
          grn_id: grn.id, grn_no: grn.grn_no, id: it.id,
          po_no: poi ? (poi.po_no || grn.purchaseOrder?.po_no || "") : (it.po_no || ""),
          pr_no: it.pr_no || "",
          item_code: it.item_code, item_name: it.item_name, uom: it.uom,
          po_item_id: it.po_item_id,
          accepted_qty: it.accepted_qty || 0,
          rate: poi ? Number(poi.rate || 0) : (it.rate || 0),
          gst_rate: it.gst_rate || 0, kg: it.kg || 0, accp: it.accp || 0,
          discount_percent: poi ? Number(poi.disc_percent || 0) : 0,
          discount_inr: poi ? Number(poi.disc_inr || 0) : 0,
          pf_percent: poi ? Number(poi.pf_percent || 0) : 0,
          pf_inr: poi ? Number(poi.pf_inr || 0) : 0,
          cgst_rate: poi ? Number(poi.cgst_rate || 0) : defaultGst,
          sgst_rate: poi ? Number(poi.sgst_rate || 0) : defaultGst,
          igst_rate: poi ? Number(poi.igst_rate || 0) : 0,
        });
      });
    });
    setBillItems(items);
    setBillDlg({ open: true, data: selectedGrns });
  };

  var updateBillItem = function (idx, field, value) {
    setBillItems(function (prev) {
      return prev.map(function (it, i) { return i === idx ? { ...it, [field]: value } : it; });
    });
  };

  var recalcItem = function (idx, changedField) {
    setBillItems(function (prev) {
      return prev.map(function (it, i) {
        if (i !== idx) return it;
        var qty = Number(it.accepted_qty) || 0;
        var rate = Number(it.rate) || 0;
        var gross = r2(qty * rate);
        if ((changedField === "discount_percent" || changedField === "rate") && gross > 0) {
          it.discount_inr = r2(gross * Number(it.discount_percent || 0) / 100);
        } else if (changedField === "discount_inr" && gross > 0) {
          it.discount_percent = r2((Number(it.discount_inr || 0) / gross) * 100);
        }
        var discInr = Number(it.discount_inr) || 0;
        var discPct = Number(it.discount_percent) || 0;
        var discAmt = discInr > 0 ? discInr : r2(gross * discPct / 100);
        var afterDisc = r2(gross - discAmt);
        if (changedField === "pf_percent" || changedField === "rate" || changedField === "discount_percent" || changedField === "discount_inr") {
          it.pf_inr = r2(afterDisc * Number(it.pf_percent || 0) / 100);
        } else if (changedField === "pf_inr" && afterDisc > 0) {
          it.pf_percent = r2((Number(it.pf_inr || 0) / afterDisc) * 100);
        }
        if (changedField === "cgst_rate" || changedField === "sgst_rate") {
          if (Number(it.cgst_rate) > 0 || Number(it.sgst_rate) > 0) {
            it.igst_rate = 0;
          }
        }
        if (changedField === "igst_rate") {
          if (Number(it.igst_rate) > 0) {
            it.cgst_rate = 0;
            it.sgst_rate = 0;
          }
        }
        return it;
      });
    });
  };

  var computeRow = function (r) {
    var qty = Number(r.accepted_qty) || 0;
    var rate = Number(r.rate) || 0;
    var gross = r2(qty * rate);
    var discInr = Number(r.discount_inr) || 0;
    var discPct = Number(r.discount_percent) || 0;
    var discAmt = discInr > 0 ? discInr : r2(gross * discPct / 100);
    var afterDisc = r2(gross - discAmt);
    var pfInr = Number(r.pf_inr) || 0;
    var pfPct = Number(r.pf_percent) || 0;
    var pfAmt = pfInr > 0 ? pfInr : r2(afterDisc * pfPct / 100);
    var taxable = r2(afterDisc + pfAmt);
    var cgstRate = Number(r.cgst_rate) || 0;
    var sgstRate = Number(r.sgst_rate) || 0;
    var igstRate = Number(r.igst_rate) || 0;
    var cgst = r2(taxable * cgstRate / 100);
    var sgst = r2(taxable * sgstRate / 100);
    var igst = r2(taxable * igstRate / 100);
    var totalGst = r2(cgst + sgst + igst);
    var total = r2(taxable + totalGst);
    return { gross: gross, disc_amt: discAmt, after_disc: afterDisc, pf_amt: pfAmt, taxable: taxable, cgst_rate: cgstRate, sgst_rate: sgstRate, igst_rate: igstRate, cgst: cgst, sgst: sgst, igst: igst, total_gst: totalGst, total: total };
  };

  var totals = (function () {
    var t = { gross: 0, disc_amt: 0, after_disc: 0, pf_amt: 0, taxable: 0, cgst: 0, sgst: 0, igst: 0, grand: 0, qty: 0 };
    billItems.forEach(function (it) {
      var c = computeRow(it);
      t.gross += c.gross;
      t.disc_amt += c.disc_amt;
      t.after_disc += c.after_disc;
      t.pf_amt += c.pf_amt;
      t.taxable += c.taxable;
      t.cgst += c.cgst;
      t.sgst += c.sgst;
      t.igst += c.igst;
      t.grand += c.total;
      t.qty += Number(it.accepted_qty) || 0;
    });
    t.gross = r2(t.gross);
    t.disc_amt = r2(t.disc_amt);
    t.after_disc = r2(t.after_disc);
    t.pf_amt = r2(t.pf_amt);
    t.taxable = r2(t.taxable);
    t.cgst = r2(t.cgst);
    t.sgst = r2(t.sgst);
    t.igst = r2(t.igst);
    t.grand = r2(t.grand);
    return t;
  })();

  const handleBill = useCallback(async () => {
    if (!form.bill_no.trim()) { showToast("Bill number required", "warning"); return; }
    if (!form.bill_date) { showToast("Bill date required", "warning"); return; }
    setBilling(true);
    try {
      var payload = {
        bill_no: form.bill_no, bill_date: form.bill_date,
        invoice_no: form.invoice_no, invoice_date: form.invoice_date,
        remarks: form.remarks,
        items: billItems,
      };
      var ids = billDlg.data.map(function (g) { return g.id; });
      await axios.put(API + "/batch-mark-billed", { ids: ids, ...payload });
      showToast(ids.length + " GRR(s) billed successfully", "success");
      setBillDlg({ open: false, data: [] });
      setSelected({});
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.error || "Failed to bill", "error");
    } finally { setBilling(false); }
  }, [form, billDlg, billItems, fetchData]);

  var fmtDate = function (v) {
    if (!v) return "-";
    var d = new Date(v);
    return isNaN(d.getTime()) ? String(v).split("T")[0] : d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  };
  var fmt = function (v) { return Number(v || 0).toFixed(2); };
  var fv = function (v) { var n = Number(v); return n === 0 ? "" : n; };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, flexWrap: "wrap", gap: 1 }}>
        <Typography variant="h4" sx={{ fontWeight: "bold", color: "var(--heading-color)" }}>
          GRR Billing
        </Typography>
        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
          {selCount > 0 && (
            <Chip label={selCount + " selected"} color="primary" size="small" onDelete={function () { setSelected({}); }} />
          )}
          <Button variant="contained" color="success" startIcon={<ReceiptLongIcon />}
            onClick={openBillDlg} disabled={selCount === 0}>
            Bill Selected ({selCount})
          </Button>
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={fetchData}>Refresh</Button>
        </Box>
      </Box>

      <Card sx={{ borderRadius: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
        <CardContent sx={{ p: { xs: 1.5, md: 2.5 } }}>
          {loading && <LinearProgress sx={{ mb: 1 }} />}
          {!loading && rows.length === 0 && (
            <Typography sx={{ textAlign: "center", py: 6, color: "#94a3b8", fontStyle: "italic" }}>
              No pending GRRs for billing. All GRRs have been billed.
            </Typography>
          )}
          {rows.length > 0 && (
            <TableContainer sx={{ maxHeight: 560, overflow: "auto" }}>
              <Table size="small" stickyHeader sx={{ minWidth: 1200, borderCollapse: "separate", borderSpacing: 0 }}>
                <TableHead>
                  <TableRow sx={{ "& th": { bgcolor: "#f1f5f9", fontWeight: 700, fontSize: "0.85rem", py: 0.85, color: "#334155", borderBottom: "2px solid #e2e8f0", position: "sticky", top: 0, zIndex: 2 } }}>
                    <TableCell sx={{ width: 36 }}><Checkbox size="small" checked={selCount === rows.length && rows.length > 0} indeterminate={selCount > 0 && selCount < rows.length} onChange={selectAll} /></TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>GRR #</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Supplier</TableCell>
                    <TableCell sx={{ fontWeight: 700, textAlign: "center", width: 50 }}>Items</TableCell>
                    <TableCell sx={{ fontWeight: 700, textAlign: "right", width: 70 }}>Qty</TableCell>
                    <TableCell sx={{ fontWeight: 700, textAlign: "right", width: 70 }}>Kg</TableCell>
                    <TableCell sx={{ fontWeight: 700, textAlign: "right", width: 95 }}>Taxable</TableCell>
                    <TableCell sx={{ fontWeight: 700, textAlign: "right", width: 70 }}>GST</TableCell>
                    <TableCell sx={{ fontWeight: 700, textAlign: "right", width: 100 }}>Total</TableCell>
                    <TableCell sx={{ width: 36 }}></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map(function (grn, idx) {
                    var items = grn.items || [];
                    var qty = items.reduce(function (s, i) { return s + (parseFloat(i.accepted_qty) || 0); }, 0);
                    var amt = items.reduce(function (s, i) { return s + (parseFloat(i.amount) || 0); }, 0);
                    var gst = items.reduce(function (s, i) { return s + (parseFloat(i.gst_amount) || 0); }, 0);
                    var kg = items.reduce(function (s, i) { return s + (parseFloat(i.kg) || 0); }, 0);
                    var taxable = Math.max(0, amt - gst);
                    var isExpanded = expandedId === grn.id;
                    return (
                      <React.Fragment key={grn.id}>
                        <TableRow hover sx={{ bgcolor: idx % 2 === 0 ? "#ffffff" : "#f8fafc", "&:hover": { bgcolor: "#eef2ff" }, "& td": { fontSize: "0.88rem", py: 0.75, borderBottom: "1px solid #f1f5f9" } }}>
                          <TableCell><Checkbox size="small" checked={Boolean(selected[grn.id])} onChange={function () { toggleSelect(grn.id); }} /></TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>{grn.grn_no}</TableCell>
                          <TableCell>{fmtDate(grn.grn_date)}</TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 600, fontSize: "0.85rem" }}>{grn.supplier?.supplier_name || "-"}</Typography>
                            {grn.supplier?.gstin && <Typography variant="caption" sx={{ color: "#94a3b8", fontSize: "0.7rem" }}>GSTIN: {grn.supplier.gstin}</Typography>}
                          </TableCell>
                          <TableCell sx={{ textAlign: "center" }}>{items.length}</TableCell>
                          <TableCell sx={{ textAlign: "right", fontWeight: 600 }}>{formatNumber(qty)}</TableCell>
                          <TableCell sx={{ textAlign: "right", fontWeight: 600 }}>{formatNumber(kg, 3)}</TableCell>
                          <TableCell sx={{ textAlign: "right", fontWeight: 600 }}>{formatNumber(taxable, 2)}</TableCell>
                          <TableCell sx={{ textAlign: "right", color: "#7c3aed", fontWeight: 600 }}>{formatNumber(gst, 2)}</TableCell>
                          <TableCell sx={{ textAlign: "right", fontWeight: 700, color: "#1565c0" }}>{formatNumber(amt, 2)}</TableCell>
                          <TableCell><IconButton size="small" onClick={() => setExpandedId(isExpanded ? null : grn.id)}>{isExpanded ? <KeyboardArrowUpIcon fontSize="small" /> : <KeyboardArrowDownIcon fontSize="small" />}</IconButton></TableCell>
                        </TableRow>
                        {isExpanded && (
                          <TableRow>
                            <TableCell colSpan={11} sx={{ py: 1, px: 2, bgcolor: "#fafcff", borderBottom: "2px solid #e2e8f0" }}>
                              <Box sx={{ border: "1px solid #e2e8f0", borderRadius: 2, overflow: "hidden" }}>
                                <Box sx={{ px: 2, py: 0.75, bgcolor: "#f1f5f9", display: "flex", alignItems: "center", gap: 1 }}>
                                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "var(--heading-color)", fontSize: "0.9rem" }}>Items — {grn.grn_no}</Typography>
                                  <Chip label={items.length + " item(s)"} size="small" sx={{ fontSize: "0.78rem" }} />
                                </Box>
                                <Box sx={{ maxHeight: 260, overflow: "auto" }}>
                                  <Table size="small">
                                    <TableHead>
                                      <TableRow sx={{ bgcolor: "#f8fafc" }}>
                                        {["#", "Code", "Description", "UOM", "Ordered", "Received", "Accepted", "Rejected", "Rate", "GST%", "GST Amt", "Amount", "Kg", "Recv Kg", "Accp"].map(function (h) {
                                          return <TableCell key={h} sx={{ fontWeight: 700, fontSize: "0.72rem", py: 0.5, color: "#475569", textAlign: ["#", "UOM"].includes(h) ? "center" : (h !== "Code" && h !== "Description" ? "right" : "left"), width: ["#", "UOM"].includes(h) ? 36 : 70 }}>{h}</TableCell>;
                                        })}
                                      </TableRow>
                                    </TableHead>
                                    <TableBody>
                                      {items.map(function (it, i) {
                                        return (
                                          <TableRow key={it.id || i} hover>
                                            <TableCell sx={{ fontSize: "0.72rem", py: 0.3, textAlign: "center" }}>{i + 1}</TableCell>
                                            <TableCell sx={{ fontSize: "0.72rem", py: 0.3 }}>{it.item_code || "-"}</TableCell>
                                            <TableCell sx={{ fontSize: "0.72rem", py: 0.3 }}>{it.item_name || "-"}</TableCell>
                                            <TableCell sx={{ fontSize: "0.72rem", py: 0.3, textAlign: "center" }}>{it.uom || "-"}</TableCell>
                                            <TableCell sx={{ fontSize: "0.72rem", py: 0.3, textAlign: "right" }}>{Number(it.ordered_qty || 0).toFixed(2)}</TableCell>
                                            <TableCell sx={{ fontSize: "0.72rem", py: 0.3, textAlign: "right" }}>{Number(it.received_qty || 0).toFixed(2)}</TableCell>
                                            <TableCell sx={{ fontSize: "0.72rem", py: 0.3, textAlign: "right", fontWeight: 600, color: "success.dark" }}>{Number(it.accepted_qty || 0).toFixed(2)}</TableCell>
                                            <TableCell sx={{ fontSize: "0.72rem", py: 0.3, textAlign: "right", color: it.rejected_qty > 0 ? "error.main" : "inherit" }}>{Number(it.rejected_qty || 0).toFixed(2)}</TableCell>
                                            <TableCell sx={{ fontSize: "0.72rem", py: 0.3, textAlign: "right" }}>{Number(it.rate || 0).toFixed(2)}</TableCell>
                                            <TableCell sx={{ fontSize: "0.72rem", py: 0.3, textAlign: "right" }}>{it.gst_rate ? Number(it.gst_rate).toFixed(1) + "%" : "-"}</TableCell>
                                            <TableCell sx={{ fontSize: "0.72rem", py: 0.3, textAlign: "right", color: "#7c3aed" }}>{Number(it.gst_amount || 0).toFixed(2)}</TableCell>
                                            <TableCell sx={{ fontSize: "0.72rem", py: 0.3, textAlign: "right", fontWeight: 600 }}>{Number(it.amount || 0).toFixed(2)}</TableCell>
                                            <TableCell sx={{ fontSize: "0.72rem", py: 0.3, textAlign: "right" }}>{Number(it.kg || 0).toFixed(3)}</TableCell>
                                            <TableCell sx={{ fontSize: "0.72rem", py: 0.3, textAlign: "right" }}>{Number(it.recv_kg || 0).toFixed(3)}</TableCell>
                                            <TableCell sx={{ fontSize: "0.72rem", py: 0.3, textAlign: "right" }}>{Number(it.accp || 0).toFixed(3)}</TableCell>
                                          </TableRow>
                                        );
                                      })}
                                    </TableBody>
                                  </Table>
                                </Box>
                              </Box>
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      <Dialog open={billDlg.open} onClose={function () { setBillDlg({ open: false, data: [] }); }} maxWidth="lg" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, fontSize: "1rem", pb: 1, display: "flex", alignItems: "center", gap: 1 }}>
          <ReceiptLongIcon color="success" /> Bill {billDlg.data.length} GRR(s)
        </DialogTitle>
        {billDlg.data.length > 0 && (
          <DialogContent dividers>
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 2, p: 1.5, bgcolor: "#f8fafc", borderRadius: 2, border: "1px solid #e2e8f0" }}>
              <Typography variant="body2"><strong>GRRs:</strong> {billDlg.data.map(function (g) { return g.grn_no; }).join(", ")}</Typography>
              <Typography variant="body2"><strong>Items:</strong> {billItems.length}</Typography>
              <Typography variant="body2"><strong>Qty:</strong> {formatNumber(totals.qty)}</Typography>
              <Typography variant="body2"><strong>Grand Total:</strong> ₹{fmt(totals.grand)}</Typography>
            </Box>

            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, fontSize: "0.9rem" }}>Billing Items — Edit Disc, P&amp;F, Tax as needed</Typography>
            <Box sx={{ maxHeight: 360, overflow: "auto", mb: 2, border: "1px solid #e2e8f0", borderRadius: 2 }}>
              <Table size="small" sx={{ "& td, & th": { border: "1px solid #e0e0e0", px: 0.35, py: 0.25, fontSize: "0.68rem" } }}>
                <TableHead>
                  <TableRow sx={{ bgcolor: "#f1f5f9" }}>
                    <TableCell sx={{ fontWeight: 700, color: "#475569", width: 50 }}>GRR #</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: "#475569", width: 70 }}>Item Code</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: "#475569" }}>Description</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: "#475569", textAlign: "center", width: 50 }}>PO #</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: "#475569", textAlign: "center", width: 50 }}>PR #</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: "#475569", textAlign: "right", width: 36 }}>UOM</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: "#475569", textAlign: "right", width: 45 }}>Accp</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: "#475569", textAlign: "right", width: 50 }}>Kg Accp</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: "#475569", textAlign: "right", width: 52 }}>Rate</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: "#475569", textAlign: "right", width: 58 }}>Gross</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: "#475569", textAlign: "right", width: 40 }}>Disc%</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: "#475569", textAlign: "right", width: 50 }}>Disc Amt</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: "#475569", textAlign: "right", width: 52 }}>After Disc</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: "#475569", textAlign: "right", width: 40 }}>PF%</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: "#475569", textAlign: "right", width: 50 }}>PF Amt</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: "#475569", textAlign: "right", width: 58 }}>Taxable</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: "#475569", textAlign: "right", width: 40 }}>CGST%</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: "#475569", textAlign: "right", width: 50 }}>CGST</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: "#475569", textAlign: "right", width: 40 }}>SGST%</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: "#475569", textAlign: "right", width: 50 }}>SGST</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: "#475569", textAlign: "right", width: 40 }}>IGST%</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: "#475569", textAlign: "right", width: 50 }}>IGST</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: "#475569", textAlign: "right", width: 58 }}>Amount</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {billItems.map(function (it, i) {
                    var c = computeRow(it);
                    return (
                      <TableRow key={it.id || i} hover>
                        <TableCell sx={{ fontWeight: 600, color: "#1565c0" }}>{it.grn_no}</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>{it.item_code || "-"}</TableCell>
                        <TableCell sx={{ fontSize: "0.68rem" }}>{it.item_name}</TableCell>
                        <TableCell sx={{ textAlign: "center", fontSize: "0.68rem", fontWeight: 600, color: it.po_no ? "#7c3aed" : "#94a3b8" }}>{it.po_no || "—"}</TableCell>
                        <TableCell sx={{ textAlign: "center", fontSize: "0.68rem", fontWeight: 600, color: it.pr_no ? "#0288d1" : "#94a3b8" }}>{it.pr_no || "—"}</TableCell>
                        <TableCell sx={{ textAlign: "center" }}>{it.uom || "-"}</TableCell>
                        <TableCell sx={{ textAlign: "right", fontWeight: 600, color: "success.dark" }}>{Number(it.accepted_qty || 0).toFixed(2)}</TableCell>
                        <TableCell sx={{ textAlign: "right" }}>{it.accp ? Number(it.accp).toFixed(3) : it.kg ? Number(it.kg).toFixed(3) : "-"}</TableCell>
                        <TableCell sx={{ textAlign: "right", p: 0.15 }}>
                          <TextField type="number" size="small" variant="standard" value={fv(it.rate)}
                            onChange={function (e) { updateBillItem(i, "rate", e.target.value === "" ? 0 : Number(e.target.value)); recalcItem(i, "rate"); }}
                            sx={{ width: 50, "& input": { textAlign: "right", fontSize: "0.68rem", py: 0.1 } }} />
                        </TableCell>
                        <TableCell sx={{ textAlign: "right", fontWeight: 600 }}>{fmt(c.gross)}</TableCell>
                        <TableCell sx={{ textAlign: "right", p: 0.15 }}>
                          <TextField type="number" size="small" variant="standard" value={fv(it.discount_percent)}
                            onChange={function (e) { updateBillItem(i, "discount_percent", e.target.value === "" ? 0 : Number(e.target.value)); recalcItem(i, "discount_percent"); }}
                            sx={{ width: 38, "& input": { textAlign: "right", fontSize: "0.68rem", py: 0.1 } }} />
                        </TableCell>
                        <TableCell sx={{ textAlign: "right", p: 0.15 }}>
                          <TextField type="number" size="small" variant="standard" value={fv(it.discount_inr)}
                            onChange={function (e) { updateBillItem(i, "discount_inr", e.target.value === "" ? 0 : Number(e.target.value)); recalcItem(i, "discount_inr"); }}
                            sx={{ width: 48, "& input": { textAlign: "right", fontSize: "0.68rem", py: 0.1 } }} />
                        </TableCell>
                        <TableCell sx={{ textAlign: "right", fontWeight: 600 }}>{fmt(c.after_disc)}</TableCell>
                        <TableCell sx={{ textAlign: "right", p: 0.15 }}>
                          <TextField type="number" size="small" variant="standard" value={fv(it.pf_percent)}
                            onChange={function (e) { updateBillItem(i, "pf_percent", e.target.value === "" ? 0 : Number(e.target.value)); recalcItem(i, "pf_percent"); }}
                            sx={{ width: 38, "& input": { textAlign: "right", fontSize: "0.68rem", py: 0.1 } }} />
                        </TableCell>
                        <TableCell sx={{ textAlign: "right", p: 0.15 }}>
                          <TextField type="number" size="small" variant="standard" value={fv(it.pf_inr)}
                            onChange={function (e) { updateBillItem(i, "pf_inr", e.target.value === "" ? 0 : Number(e.target.value)); recalcItem(i, "pf_inr"); }}
                            sx={{ width: 48, "& input": { textAlign: "right", fontSize: "0.68rem", py: 0.1 } }} />
                        </TableCell>
                        <TableCell sx={{ textAlign: "right", fontWeight: 700 }}>{fmt(c.taxable)}</TableCell>
                        <TableCell sx={{ textAlign: "right", p: 0.15 }}>
                          <TextField type="number" size="small" variant="standard" value={fv(it.cgst_rate)}
                            onChange={function (e) { updateBillItem(i, "cgst_rate", e.target.value === "" ? 0 : Number(e.target.value)); recalcItem(i, "cgst_rate"); }}
                            sx={{ width: 38, "& input": { textAlign: "right", fontSize: "0.68rem", py: 0.1 } }} />
                        </TableCell>
                        <TableCell sx={{ textAlign: "right", color: "#1565c0", fontWeight: 600 }}>{fmt(c.cgst)}</TableCell>
                        <TableCell sx={{ textAlign: "right", p: 0.15 }}>
                          <TextField type="number" size="small" variant="standard" value={fv(it.sgst_rate)}
                            onChange={function (e) { updateBillItem(i, "sgst_rate", e.target.value === "" ? 0 : Number(e.target.value)); recalcItem(i, "sgst_rate"); }}
                            sx={{ width: 38, "& input": { textAlign: "right", fontSize: "0.68rem", py: 0.1 } }} />
                        </TableCell>
                        <TableCell sx={{ textAlign: "right", color: "#1565c0", fontWeight: 600 }}>{fmt(c.sgst)}</TableCell>
                        <TableCell sx={{ textAlign: "right", p: 0.15 }}>
                          <TextField type="number" size="small" variant="standard" value={fv(it.igst_rate)}
                            onChange={function (e) { updateBillItem(i, "igst_rate", e.target.value === "" ? 0 : Number(e.target.value)); recalcItem(i, "igst_rate"); }}
                            sx={{ width: 38, "& input": { textAlign: "right", fontSize: "0.68rem", py: 0.1 } }} />
                        </TableCell>
                        <TableCell sx={{ textAlign: "right", color: "#1565c0", fontWeight: 600 }}>{fmt(c.igst)}</TableCell>
                        <TableCell sx={{ textAlign: "right", fontWeight: 700, color: "#2e7d32" }}>{fmt(c.total)}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Box>

            <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
              <Box sx={{ minWidth: 340, bgcolor: "#f8fafc", borderRadius: 2, border: "1px solid #e2e8f0", p: 1.5 }}>
                <Grid container spacing={0.75}>
                  <Grid item xs={7}><Typography variant="body2" sx={{ fontWeight: 600, fontSize: "0.82rem" }}>Total Gross</Typography></Grid>
                  <Grid item xs={5}><Typography variant="body2" sx={{ fontWeight: 600, fontSize: "0.82rem", textAlign: "right" }}>₹ {fmt(totals.gross)}</Typography></Grid>
                  <Grid item xs={7}><Typography variant="body2" sx={{ fontSize: "0.82rem" }}>Total Discount</Typography></Grid>
                  <Grid item xs={5}><Typography variant="body2" sx={{ fontSize: "0.82rem", textAlign: "right", color: "#d32f2f" }}>- ₹ {fmt(totals.disc_amt)}</Typography></Grid>
                  <Grid item xs={7}><Typography variant="body2" sx={{ fontWeight: 600, fontSize: "0.82rem" }}>After Discount</Typography></Grid>
                  <Grid item xs={5}><Typography variant="body2" sx={{ fontWeight: 600, fontSize: "0.82rem", textAlign: "right" }}>₹ {fmt(totals.after_disc)}</Typography></Grid>
                  <Grid item xs={7}><Typography variant="body2" sx={{ fontSize: "0.82rem" }}>P&amp;F Charges</Typography></Grid>
                  <Grid item xs={5}><Typography variant="body2" sx={{ fontSize: "0.82rem", textAlign: "right", color: "#e65100" }}>₹ {fmt(totals.pf_amt)}</Typography></Grid>
                  <Grid item xs={7}><Typography variant="body2" sx={{ fontWeight: 700, fontSize: "0.82rem" }}>Taxable Value</Typography></Grid>
                  <Grid item xs={5}><Typography variant="body2" sx={{ fontWeight: 700, fontSize: "0.82rem", textAlign: "right" }}>₹ {fmt(totals.taxable)}</Typography></Grid>
                  <Grid item xs={12}><Divider sx={{ borderColor: "#cbd5e1" }} /></Grid>
                  <Grid item xs={7}><Typography variant="body2" sx={{ fontSize: "0.82rem" }}>CGST @ {billItems.length > 0 ? fmt(billItems[0].cgst_rate) : "0"}%</Typography></Grid>
                  <Grid item xs={5}><Typography variant="body2" sx={{ fontSize: "0.82rem", textAlign: "right", color: "#1565c0" }}>₹ {fmt(totals.cgst)}</Typography></Grid>
                  <Grid item xs={7}><Typography variant="body2" sx={{ fontSize: "0.82rem" }}>SGST @ {billItems.length > 0 ? fmt(billItems[0].sgst_rate) : "0"}%</Typography></Grid>
                  <Grid item xs={5}><Typography variant="body2" sx={{ fontSize: "0.82rem", textAlign: "right", color: "#1565c0" }}>₹ {fmt(totals.sgst)}</Typography></Grid>
                  <Grid item xs={7}><Typography variant="body2" sx={{ fontSize: "0.82rem" }}>IGST @ {billItems.length > 0 ? fmt(billItems[0].igst_rate) : "0"}%</Typography></Grid>
                  <Grid item xs={5}><Typography variant="body2" sx={{ fontSize: "0.82rem", textAlign: "right", color: "#1565c0" }}>₹ {fmt(totals.igst)}</Typography></Grid>
                  <Grid item xs={12}><Divider sx={{ borderColor: "#94a3b8", borderWidth: 2 }} /></Grid>
                  <Grid item xs={7}><Typography variant="subtitle1" sx={{ fontWeight: 800, fontSize: "1rem" }}>Grand Total</Typography></Grid>
                  <Grid item xs={5}><Typography variant="subtitle1" sx={{ fontWeight: 800, fontSize: "1rem", textAlign: "right", color: "#1565c0" }}>₹ {fmt(totals.grand)}</Typography></Grid>
                </Grid>
              </Box>
            </Box>

            <Divider sx={{ mb: 2 }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5, fontSize: "0.9rem" }}>Billing Details</Typography>
            <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", alignItems: "flex-start" }}>
              <Box sx={{ width: 180 }}><TextField label="Bill No *" size="small" fullWidth value={form.bill_no} onChange={function (e) { setForm(function (f) { return { ...f, bill_no: e.target.value }; }); }} placeholder="e.g. BILL-001" InputLabelProps={{ shrink: true }} sx={{ "& .MuiInputBase-root": { fontSize: "0.88rem", borderRadius: "8px" } }} /></Box>
              <Box sx={{ width: 160 }}><TextField label="Bill Date *" type="date" size="small" fullWidth value={form.bill_date} onChange={function (e) { setForm(function (f) { return { ...f, bill_date: e.target.value }; }); }} InputLabelProps={{ shrink: true }} sx={{ "& .MuiInputBase-root": { fontSize: "0.88rem", borderRadius: "8px" } }} /></Box>
              <Box sx={{ width: 180 }}><TextField label="Supplier Invoice No" size="small" fullWidth value={form.invoice_no} onChange={function (e) { setForm(function (f) { return { ...f, invoice_no: e.target.value }; }); }} placeholder="Supplier invoice/DC" InputLabelProps={{ shrink: true }} sx={{ "& .MuiInputBase-root": { fontSize: "0.88rem", borderRadius: "8px" } }} /></Box>
              <Box sx={{ width: 160 }}><TextField label="Supplier Invoice Date" type="date" size="small" fullWidth value={form.invoice_date} onChange={function (e) { setForm(function (f) { return { ...f, invoice_date: e.target.value }; }); }} InputLabelProps={{ shrink: true }} sx={{ "& .MuiInputBase-root": { fontSize: "0.88rem", borderRadius: "8px" } }} /></Box>
              <Box sx={{ minWidth: 250, flex: 1 }}><TextField label="Remarks" size="small" fullWidth value={form.remarks} onChange={function (e) { setForm(function (f) { return { ...f, remarks: e.target.value }; }); }} placeholder="Any notes..." InputLabelProps={{ shrink: true }} multiline rows={1} sx={{ "& .MuiInputBase-root": { fontSize: "0.88rem", borderRadius: "8px" } }} /></Box>
            </Box>
          </DialogContent>
        )}
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button variant="outlined" color="secondary" startIcon={<CancelIcon />} onClick={function () { setBillDlg({ open: false, data: [] }); }}>Cancel</Button>
          <Button variant="contained" color="success" onClick={handleBill} startIcon={<CheckCircleIcon />} disabled={billing}>
            {billing ? "Billing..." : "Mark " + billDlg.data.length + " GRR(s) as Billed"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
