import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
import {
  Box, Card, CardContent, Typography, TextField, Button, Chip, LinearProgress,
  Table, TableHead, TableRow, TableCell, TableBody, IconButton,
  MenuItem, Checkbox, Autocomplete, Stack, Tooltip,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CancelIcon from "@mui/icons-material/Cancel";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DeleteIcon from "@mui/icons-material/Delete";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import DoubleArrowIcon from "@mui/icons-material/DoubleArrow";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { useToast } from "../../../../context/ToastContext";
import { formatNumber } from "../../../../utils/format";

const GRR_API = "/api/erp/stores/grn";
const r2 = (v) => Number(Number(v || 0).toFixed(2));
const fieldSx = { "& .MuiInputBase-root": { fontSize: "0.78rem" }, "& .MuiInputLabel-root": { fontSize: "0.78rem" } };
const thSx = { fontWeight: 700, fontSize: "0.8rem", color: "#475569", whiteSpace: "nowrap", py: 0.4, px: 0.5, position: "relative" };

// 19 Sticky columns + 20 Scrollable columns
const INITIAL_COL_WIDTHS = [
  30, 30, 50, 75, 35, 35, 75, 50, 75, 50, 60, 110, 35, 35, 35, 35, 50, 50, 65,  // Sticky (0-18)
  55, 45, 55, 55, 45, 50, 65, 45, 50, 45, 50, 45, 50, 45, 50, 45, 50, 45, 50, 70 // Scrollable (19-38)
];

export default function BillingForm() {
  var navigate = useNavigate();
  var location = useLocation();
  var { showToast } = useToast();
  var isView = location.pathname.includes("/view");
  var [loading, setLoading] = useState(false);
  var [saving, setSaving] = useState(false);
  var [colWidths, setColWidths] = useState(INITIAL_COL_WIDTHS);
  var prevColKey = useRef(JSON.stringify(INITIAL_COL_WIDTHS));
  useEffect(function () {
    var key = JSON.stringify(INITIAL_COL_WIDTHS);
    if (prevColKey.current !== key) {
      prevColKey.current = key;
      setColWidths([...INITIAL_COL_WIDTHS]);
    }
  }, [JSON.stringify(INITIAL_COL_WIDTHS)]);

  var FZ = useMemo(function () {
    return colWidths.slice(0, 19).reduce(function (acc, w, i) {
      acc.push(i === 0 ? 0 : acc[i - 1] + colWidths[i - 1]);
      return acc;
    }, []);
  }, [colWidths]);

  var wTh = function (col, extra) {
    var isSt = col < 19;
    return { width: colWidths[col], minWidth: colWidths[col], maxWidth: colWidths[col], position: isSt ? "sticky" : "relative", left: isSt ? FZ[col] : undefined, zIndex: isSt ? 4 : 1, bgcolor: isSt ? "#f1f5f9" : "inherit", overflow: "visible", ...extra };
  };
  var wTd = function (col, extra) {
    var isSt = col < 19;
    return { width: colWidths[col], minWidth: colWidths[col], maxWidth: colWidths[col], position: isSt ? "sticky" : "relative", left: isSt ? FZ[col] : undefined, zIndex: isSt ? 2 : 1, bgcolor: isSt ? "#fff" : "inherit", ...extra };
  };
  var wFt = function (col, extra) {
    var isSt = col < 19;
    return { width: colWidths[col], minWidth: colWidths[col], maxWidth: colWidths[col], position: isSt ? "sticky" : "relative", left: isSt ? FZ[col] : undefined, zIndex: isSt ? 3 : 1, bgcolor: isSt ? "#e8f4fd" : "inherit", ...extra };
  };

  var handleColResize = function (e, colIdx) {
    e.preventDefault();
    e.stopPropagation();
    var startX = e.clientX;
    var startW = colWidths[colIdx];
    var onMouseMove = function (moveE) {
      if (!moveE.clientX) return;
      var diff = moveE.clientX - startX;
      setColWidths(function (prev) {
        var next = [...prev];
        next[colIdx] = Math.max(20, startW + diff);
        return next;
      });
    };
    var onMouseUp = function () {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };

  var TH = function ({ idx, textAlign = "center", bgcolor, children }) {
    var wthSx = wTh(idx, { bgcolor });
    return (
      <TableCell sx={{ ...thSx, textAlign: textAlign, ...wthSx }}>
        {children}
        <Box onMouseDown={function (e) { handleColResize(e, idx); }}
          sx={{ position: "absolute", top: 0, right: -2, width: 8, bottom: 0, cursor: "col-resize", zIndex: 10, "&:hover": { bgcolor: "#94a3b8" } }} />
      </TableCell>
    );
  };

  var [suppliers, setSuppliers] = useState([]);
  var [pendingGrrs, setPendingGrrs] = useState([]);
  var [allPos, setAllPos] = useState([]);
  var [posLoaded, setPosLoaded] = useState(false);
  var [billItems, setBillItems] = useState([]);
  var [selectedGrnIds, setSelectedGrnIds] = useState([]);
  var [shuttleChecked, setShuttleChecked] = useState([]);
  var [shuttleOpen, setShuttleOpen] = useState(false);
  var [form, setForm] = useState({
    supplier_name: "",
    state: "",
    bill_no: "",
    bill_date: localDatetime(),
    party_name: "",
    invoice_no: "",
    invoice_date: "",
    remarks: "",
  });
  var [initialLoaded, setInitialLoaded] = useState(false);

  function localDatetime() {
    var now = new Date();
    return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  }

  // Keep bill_date current on every mount
  useEffect(function () {
    function updateDate() { setForm(function (f) { return { ...f, bill_date: localDatetime() }; }); }
    updateDate();
    var timer = setInterval(updateDate, 30000);
    return function () { clearInterval(timer); };
  }, []);

  var fetchPending = useCallback(async function () {
    try {
      setLoading(true);
      var { data } = await axios.get(GRR_API + "/pending-billing");
      setPendingGrrs(data);
      var supSet = {};
      data.forEach(function (g) { if (g.supplier?.supplier_name) supSet[g.supplier.supplier_name] = true; });
      setSuppliers(Object.keys(supSet).sort());
    } catch (e) {
      showToast("Failed to load GRRs: " + (e.response?.data?.error || e.message), "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  var fetchAllPos = useCallback(async function () {
    try {
      var { data } = await axios.get("/api/erp/purchase/orders");
      setAllPos(data);
    } catch (e) { /* non-critical */ }
    finally {
      setPosLoaded(true);
    }
  }, []);

  useEffect(function () { fetchPending(); fetchAllPos(); }, [fetchPending, fetchAllPos]);

  var filteredGrrs = form.supplier_name
    ? pendingGrrs.filter(function (g) { return g.supplier?.supplier_name === form.supplier_name; })
    : pendingGrrs;

  var selectedGrns = filteredGrrs.filter(function (g) { return selectedGrnIds.includes(g.id); });

  function getItemKey(grnId, itemId) { return grnId + ":" + (itemId || Math.random()); }

  function toggleShuttle(key) {
    setShuttleChecked(function (prev) {
      return prev.includes(key) ? prev.filter(function (x) { return x !== key; }) : prev.concat([key]);
    });
  }

  var poItemMap = useMemo(function () {
    var maps = { byId: {}, byGroupId: {}, byPoAndCode: {}, byPoAndId: {} };
    function addPoItems(po) {
      if (po && po.items) {
        var poNoClean = (po.po_no || "").trim().toUpperCase();
        po.items.forEach(function (poi) {
          var detail = { po_no: po.po_no, ...poi };
          maps.byId[poi.id] = detail;
          if (poi.item_id) {
            maps.byGroupId[poi.item_id] = detail;
            if (poNoClean) {
              maps.byPoAndId[poNoClean + ":" + poi.item_id] = detail;
            }
          }
          if (poi.item_code && poNoClean) {
            var codeClean = poi.item_code.trim().toUpperCase();
            maps.byPoAndCode[poNoClean + ":" + codeClean] = detail;
          }
        });
      }
    }
    filteredGrrs.forEach(function (grn) { addPoItems(grn.purchaseOrder); });
    if (allPos) allPos.forEach(function (po) { addPoItems(po); });
    return maps;
  }, [filteredGrrs, allPos]);

  function findPOItem(it, grn) {
    if (it.po_item_id && poItemMap.byId[it.po_item_id]) return poItemMap.byId[it.po_item_id];
    var poNo = it.po_no || grn.po_no;
    if (poNo) {
      var poNoClean = poNo.trim().toUpperCase();
      var codeClean = (it.item_code || "").trim().toUpperCase();
      if (codeClean && poItemMap.byPoAndCode[poNoClean + ":" + codeClean]) {
        return poItemMap.byPoAndCode[poNoClean + ":" + codeClean];
      }
      if (it.item_id && poItemMap.byPoAndId[poNoClean + ":" + it.item_id]) {
        return poItemMap.byPoAndId[poNoClean + ":" + it.item_id];
      }
    }
    if (grn.purchaseOrder?.items) {
      var match = grn.purchaseOrder.items.find(function (poi) {
        return (poi.item_code && it.item_code && poi.item_code.trim().toUpperCase() === it.item_code.trim().toUpperCase()) ||
          (poi.item_id && it.item_id && poi.item_id === it.item_id);
      });
      if (match) return { po_no: grn.purchaseOrder.po_no, ...match };
    }
    if (it.item_id && poItemMap.byGroupId[it.item_id]) return poItemMap.byGroupId[it.item_id];
    return null;
  }

  var computeItemDetails = useCallback(function (it, grn) {
    var poi = findPOItem(it, grn);
    var rate = Number(poi?.rate || it.rate || 0);
    var poDiscPercent = Number(poi?.disc_percent || 0);
    var poDiscInr = Number(poi?.disc_inr || 0);
    var poPfPercent = Number(poi?.pf_percent || 0);
    var poPfInr = Number(poi?.pf_inr || 0);
    var poCgstRate = Number(poi?.cgst_rate || 0);
    var poSgstRate = Number(poi?.sgst_rate || 0);
    var poIgstRate = Number(poi?.igst_rate || 0);
    var qty = Number(it.accepted_qty || it.qty || 0);
    var discAmt = qty * rate * (poDiscPercent / 100);
    var pfAmt = (qty * rate - discAmt) * (poPfPercent / 100);
    return {
      po_no: poi?.po_no || it.po_no || grn.po_no || "",
      pr_no: poi?.pr_no || it.pr_no || "",
      qty: qty, rate: rate,
      discPercent: poDiscPercent, discInr: poDiscInr,
      pfPercent: poPfPercent, pfInr: poPfInr,
      cgstRate: poCgstRate, sgstRate: poSgstRate, igstRate: poIgstRate,
      pfAmt: pfAmt, discAmt: discAmt,
    };
  }, [poItemMap]);

  // All items from selected GRRs that can appear in the shuttle
  var allShuttleItems = useMemo(function () {
    var result = [];
    selectedGrns.forEach(function (grn) {
      (grn.items || []).forEach(function (it) {
        var computed = computeItemDetails(it, grn);
        result.push({
          key: getItemKey(grn.id, it.id || it.item_id),
          grn: grn,
          item: it,
          computed: computed,
        });
      });
    });
    return result;
  }, [selectedGrns, computeItemDetails]);

  // On mount, if we received GRNs via location state and allPos is loaded, load them directly
  useEffect(function () {
    if (initialLoaded || !posLoaded || !location.state) return;
    var grns = location.state.grns || (location.state.grn ? [location.state.grn] : null);
    if (!grns || grns.length === 0) return;
    setInitialLoaded(true);
    setSelectedGrnIds(grns.map(function (g) { return g.id; }));
    setForm(function (f) { return { ...f, supplier_name: grns[0]?.supplier?.supplier_name || "", party_name: grns[0]?.supplier?.supplier_name || "" }; });
    var items = [];
    var allKeys = [];
    grns.forEach(function (grn) {
      (grn.items || []).forEach(function (it) {
        var computed = computeItemDetails(it, grn);
        allKeys.push(getItemKey(grn.id, it.id || it.item_id));
        items.push({
          grn_id: grn.id, grn_no: grn.grn_no, id: it.id,
          grn_date: grn.grn_date,
          pr_date: grn.purchaseRequisition?.req_date,
          supp_dc_no: grn.invoice_no,
          supp_dc_date: grn.invoice_date,
          wo_no: it.wo_no,
          po_no: computed.po_no, pr_no: computed.pr_no,
          item_code: it.item_code, item_name: it.item_name, uom: it.uom,
          po_item_id: it.po_item_id, accepted_qty: it.accepted_qty || 0,
          rate: computed.rate, gst_rate: it.gst_rate || 0,
          kg: it.kg || 0, accp: it.accp || 0,
          dia: it.dia || 0, len: it.len || 0, wid: it.wid || 0, thk: it.thk || 0,
          discount_percent: computed.discPercent, discount_inr: computed.discInr,
          pf_percent: computed.pfPercent, pf_inr: computed.pfInr,
          cgst_rate: computed.cgstRate, sgst_rate: computed.sgstRate, igst_rate: computed.igstRate,
          fre_percent: 0, fre_inr: 0, oth_percent: 0, oth_inr: 0, tcs_percent: 0,
          grr_sl: it.id,
          selected: true,
        });
      });
    });
    if (items.length > 0) { setBillItems(items); setShuttleChecked(allKeys); }
  }, [location.state, pendingGrrs, allPos, posLoaded, initialLoaded, computeItemDetails]);

  // Load checked items from shuttle into billing grid
  function handleGrrListSelection() {
    var checkedSet = new Set(shuttleChecked);
    var loadedSet = new Set(billItems.map(function (bi) { return getItemKey(bi.grn_id, bi.id); }));
    var newItems = [];
    allShuttleItems.forEach(function (si) {
      if (!checkedSet.has(si.key)) return;
      if (loadedSet.has(si.key)) return;
      var it = si.item;
      var computed = si.computed;
      var grn = si.grn;
      newItems.push({
        grn_id: grn.id, grn_no: grn.grn_no, id: it.id,
        grn_date: grn.grn_date,
        pr_date: grn.purchaseRequisition?.req_date,
        supp_dc_no: grn.invoice_no,
        supp_dc_date: grn.invoice_date,
        wo_no: it.wo_no,
        po_no: computed.po_no, pr_no: computed.pr_no,
        item_code: it.item_code, item_name: it.item_name, uom: it.uom,
        po_item_id: it.po_item_id, accepted_qty: it.accepted_qty || 0,
        rate: computed.rate, gst_rate: it.gst_rate || 0,
        kg: it.kg || 0, accp: it.accp || 0,
        dia: it.dia || 0, len: it.len || 0, wid: it.wid || 0, thk: it.thk || 0,
        discount_percent: computed.discPercent, discount_inr: computed.discInr,
        pf_percent: computed.pfPercent, pf_inr: computed.pfInr,
        cgst_rate: computed.cgstRate, sgst_rate: computed.sgstRate, igst_rate: computed.igstRate,
        fre_percent: 0, fre_inr: 0, oth_percent: 0, oth_inr: 0, tcs_percent: 0,
        grr_sl: it.id,
      });
    });
    if (newItems.length === 0) { showToast("No new items to load", "info"); return; }
    setBillItems(function (prev) { return [...prev, ...newItems]; });
    setShuttleChecked([]);
    showToast(newItems.length + " item(s) loaded", "success");
  }

  function removeBillItem(idx) {
    if (isView) return;
    setBillItems(function (prev) { return prev.filter(function (_, i) { return i !== idx; }); });
  }

  function handleFieldChange(idx, field, value) {
    setBillItems(function (prev) {
      return prev.map(function (it, i) {
        if (i !== idx) return it;
        var updated = { ...it, [field]: value };
        if (field === "cgst_rate" || field === "sgst_rate") {
          if (Number(value) > 0) {
            updated.igst_rate = 0;
          }
        } else if (field === "igst_rate") {
          if (Number(value) > 0) {
            updated.cgst_rate = 0;
            updated.sgst_rate = 0;
          }
        }
        return updated;
      });
    });
  }

  var displayVal = function (val) {
    if (val === undefined || val === null || val === "" || Number(val) === 0) return "";
    var n = Number(val);
    return n % 1 === 0 ? n.toLocaleString("en-IN") : n.toLocaleString("en-IN", { maximumFractionDigits: 2 });
  };

  var displayTotalVal = function (val) {
    var n = Number(val || 0);
    return n % 1 === 0 ? n.toLocaleString("en-IN") : n.toLocaleString("en-IN", { maximumFractionDigits: 2 });
  };

  var summary = useMemo(function () {
    var qty = 0, kg = 0, gross = 0, disc = 0, pf = 0, basic = 0, cgst = 0, sgst = 0, igst = 0, tcs = 0, fre = 0, oth = 0, afterDiscTotal = 0;
    billItems.forEach(function (it) {
      var accp = Number(it.accepted_qty || 0);
      var kgVal = Number(it.kg || 0);
      var rate = Number(it.rate || 0);
      var grossVal = r2(accp * rate);
      var discPer = Number(it.discount_percent || 0);
      var discInr = Number(it.discount_inr || 0);
      var discAmt = discPer > 0 ? r2(grossVal * discPer / 100) : discInr;
      var afterDisc = r2(grossVal - discAmt);
      var pfPer = Number(it.pf_percent || 0);
      var pfInr = Number(it.pf_inr || 0);
      var pfAmt = pfPer > 0 ? r2(afterDisc * pfPer / 100) : pfInr;
      var taxable = r2(afterDisc + pfAmt);
      var cgstPer = Number(it.cgst_rate || 0);
      var sgstPer = Number(it.sgst_rate || 0);
      var igstPer = Number(it.igst_rate || 0);
      var cgstVal = r2(taxable * cgstPer / 100);
      var sgstVal = r2(taxable * sgstPer / 100);
      var igstVal = r2(taxable * igstPer / 100);
      var tcsPer = Number(it.tcs_percent || 0);
      var tcsVal = r2((taxable + cgstVal + sgstVal + igstVal) * tcsPer / 100);
      var frePer = Number(it.fre_percent || 0);
      var freInr = Number(it.fre_inr || 0);
      var freVal = frePer > 0 ? r2(taxable * frePer / 100) : freInr;
      var othPer = Number(it.oth_percent || 0);
      var othInr = Number(it.oth_inr || 0);
      var othVal = othPer > 0 ? r2(taxable * othPer / 100) : othInr;

      qty += accp;
      kg += kgVal;
      gross += grossVal;
      disc += discAmt;
      afterDiscTotal += afterDisc;
      pf += pfAmt;
      basic += taxable;
      cgst += cgstVal;
      sgst += sgstVal;
      igst += igstVal;
      tcs += tcsVal;
      fre += freVal;
      oth += othVal;
    });
    return {
      qty: r2(qty),
      kg: r2(kg),
      gross: r2(gross),
      disc: r2(disc),
      afterDisc: r2(afterDiscTotal),
      pf: r2(pf),
      basic: r2(basic),
      cgst: r2(cgst),
      sgst: r2(sgst),
      igst: r2(igst),
      tcs: r2(tcs),
      fre: r2(fre),
      oth: r2(oth),
      total: r2(basic + cgst + sgst + igst + tcs),
      totalValue: r2(basic + cgst + sgst + igst + tcs + fre + oth)
    };
  }, [billItems]);

  async function handleSubmit() {
    if (!form.supplier_name && billItems.length === 0) {
      showToast("Select supplier and load items", "warning"); return;
    }
    if (!form.bill_no) { showToast("Bill number required", "warning"); return; }
    if (!form.bill_date) { showToast("Bill date required", "warning"); return; }
    try {
      setSaving(true);
      await axios.post("/api/erp/stores/bills/create", {
        ...form,
        items: billItems.map(function (it) { return { ...it, selected: undefined }; }),
      });
      showToast("Bill created successfully", "success");
      navigate("/stores/invoices");
    } catch (e) {
      showToast("Failed to create bill: " + (e.response?.data?.error || e.message), "error");
    } finally { setSaving(false); }
  }

  function fmtDate(d, showTime) {
    if (!d) return "";
    var dt = new Date(d);
    var dd = String(dt.getDate()).padStart(2, "0");
    var mm = String(dt.getMonth() + 1).padStart(2, "0");
    var yy = String(dt.getFullYear()).slice(-2);
    var dateStr = dd + "-" + mm + "-" + yy;
    var h = dt.getHours(), m = dt.getMinutes();
    if (showTime && (h || m)) {
      var timeStr = String(h).padStart(2, "0") + ":" + String(m).padStart(2, "0");
      return React.createElement(React.Fragment, null, dateStr, React.createElement("br"), timeStr);
    }
    return dateStr;
  }

  return (
    <Box sx={{ p: 2, maxWidth: 1400, mx: "auto" }}>
      {/* Top Bar */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <IconButton onClick={function () { navigate("/stores/invoices"); }} size="small"><ArrowBackIcon /></IconButton>
          <Typography variant="h6" sx={{ fontWeight: 700, color: "var(--heading-color)" }}>Billing Entry Form</Typography>
        </Box>
        {!isView && (
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button variant="outlined" color="secondary" size="small"
              onClick={function () { navigate("/stores/invoices"); }} startIcon={<CancelIcon />}
              sx={{ textTransform: "none" }}>Cancel</Button>
            <Button variant="contained" color="success" size="small"
              onClick={handleSubmit} disabled={saving} startIcon={<CheckCircleIcon />}
              sx={{ textTransform: "none" }}>{saving ? "Saving..." : "Submit"}</Button>
          </Box>
        )}
      </Box>

      {/* Form Header — flat compact layout */}
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 1.5, p: 1.5, bgcolor: "#f8fafc", borderRadius: 2, border: "1px solid #e2e8f0", alignItems: "center" }}>
        <TextField select size="small" label="Supplier" sx={fieldSx} value={form.supplier_name}
          onChange={function (e) { setForm(function (f) { return { ...f, supplier_name: e.target.value, party_name: e.target.value }; }); setBillItems([]); }}
          disabled={isView} SelectProps={{ sx: { fontSize: "0.78rem" } }}>
          <MenuItem value="">All</MenuItem>
          {suppliers.map(function (s) { return <MenuItem key={s} value={s} sx={{ fontSize: "0.78rem" }}>{s}</MenuItem>; })}
        </TextField>
        <TextField size="small" label="State" sx={{ ...fieldSx, width: 110 }} value={form.state}
          onChange={function (e) { setForm(function (f) { return { ...f, state: e.target.value }; }); }} disabled={isView} placeholder="TELANGANA" />
        <TextField size="small" label="Supp Bill No" sx={{ ...fieldSx, width: 130 }} value={form.invoice_no}
          onChange={function (e) { setForm(function (f) { return { ...f, invoice_no: e.target.value }; }); }} disabled={isView} placeholder="Supplier DC" />
        <TextField size="small" label="Supp Bill Dt" type="date" sx={{ ...fieldSx, width: 140 }} value={form.invoice_date}
          onChange={function (e) { setForm(function (f) { return { ...f, invoice_date: e.target.value }; }); }} disabled={isView} InputLabelProps={{ shrink: true }} />
        <TextField size="small" label="Bill No *" sx={{ ...fieldSx, width: 130 }} value={form.bill_no}
          onChange={function (e) { setForm(function (f) { return { ...f, bill_no: e.target.value }; }); }} disabled={isView} placeholder="BILL-001" InputLabelProps={{ shrink: true }} />
        <TextField size="small" label="Bill Date *" type="datetime-local" sx={{ ...fieldSx, width: 190 }} value={form.bill_date}
          onChange={function (e) { setForm(function (f) { return { ...f, bill_date: e.target.value }; }); }} disabled InputLabelProps={{ shrink: true }} />
        <TextField size="small" label="Remarks" sx={{ ...fieldSx, minWidth: 180, flex: 1 }} value={form.remarks}
          onChange={function (e) { setForm(function (f) { return { ...f, remarks: e.target.value }; }); }} disabled={isView} placeholder="Any notes..." multiline rows={1} />
      </Box>

      {/* Select GRRs — Autocomplete + Shuttle */}
      <Card id="grr-selection-card" sx={{ borderRadius: 2, mb: 1.5, boxShadow: "0 1px 6px rgba(0,0,0,0.06)" }}>
        <CardContent sx={{ p: "8px!important" }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "var(--heading-color)", fontSize: "0.82rem", mb: 1 }}>
            Select GRRs
          </Typography>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
            <Autocomplete
              multiple
              size="small"
              options={filteredGrrs}
              value={selectedGrns}
              onChange={function (_, newVal) {
                setSelectedGrnIds(newVal.map(function (g) { return g.id; }));
                setShuttleChecked([]);
              }}
              getOptionLabel={function (option) { return option.grn_no + " (" + (option.supplier?.supplier_name || "-") + ")"; }}
              renderInput={function (params) {
                return <TextField {...params} label="Search & Select GRR Numbers" placeholder="Type to search..." sx={{ "& .MuiInputBase-root": { fontSize: "0.78rem" } }} />;
              }}
              renderTags={function (tagValue, getTagProps) {
                return tagValue.map(function (option, index) {
                  return <Chip label={option.grn_no} size="small" {...getTagProps({ index })} />;
                });
              }}
              sx={{ flex: 1, maxWidth: 420 }}
            />
            {selectedGrns.length > 0 && allShuttleItems.length > 0 && (
              <Button size="small" variant="outlined" onClick={function () { setShuttleOpen(function (p) { return !p; }); }}
                sx={{ textTransform: "none", fontSize: "0.72rem", whiteSpace: "nowrap", minWidth: 0 }}>
                {shuttleOpen ? "Hide" : "Show"} Item Selector ({allShuttleItems.length})
              </Button>
            )}
          </Box>
          {shuttleOpen && (<>
            <GrnItemShuttle
              items={allShuttleItems}
              shuttleChecked={shuttleChecked}
              loadedKeys={new Set(billItems.map(function (bi) { return getItemKey(bi.grn_id, bi.id); }))}
              toggleShuttle={toggleShuttle}
            />
            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}>
              <Button variant="contained" color="success" size="small"
                onClick={handleGrrListSelection}
                disabled={shuttleChecked.length === 0}
                sx={{ textTransform: "none", fontSize: "0.78rem" }}>
                Load Items ({shuttleChecked.length})
              </Button>
            </Box>
          </>)}
        </CardContent>
      </Card>

      {/* Billing Items */}
      {billItems.length > 0 && (
        <Card sx={{ borderRadius: 2, mb: 1.5, boxShadow: "0 1px 6px rgba(0,0,0,0.06)" }}>
          <CardContent sx={{ p: "8px!important" }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "var(--heading-color)", fontSize: "0.82rem" }}>
                Billing Items — Edit Disc, P&amp;F, Tax as needed
              </Typography>
            </Box>
            <Box className="billing-table-container" sx={{ maxHeight: 480, overflow: "auto", mb: 2, border: "1px solid #e2e8f0", borderRadius: 2, "--sticky-width": (FZ[18] + colWidths[18]) + "px", bgcolor: "#fff" }}>
              <Table size="small" stickyHeader sx={{ tableLayout: "fixed", "& td, & th": { border: "1px solid #e0e0e0", px: 0.5, py: 0.3, fontSize: "0.8rem" }, minWidth: 1600 }}>
                <TableHead>
                  <TableRow sx={{ bgcolor: "#f1f5f9" }}>
                    <TH idx={0} />
                    <TH idx={1}>Sl#</TH>
                    <TH idx={2}>GRR #</TH>
                    <TH idx={3}>GRR<br />Date</TH>
                    <TH idx={4}>PO</TH>
                    <TH idx={5}>PR</TH>
                    <TH idx={6}>PR<br />Date</TH>
                    <TH idx={7}>Supp<br />DC#</TH>
                    <TH idx={8}>Supp<br />DC Date</TH>
                    <TH idx={9}>W.O</TH>
                    <TH idx={10} textAlign="left">Item<br />Code</TH>
                    <TH idx={11} textAlign="left">Description</TH>
                    <TH idx={12}>Dia</TH>
                    <TH idx={13}>Len</TH>
                    <TH idx={14}>Wid</TH>
                    <TH idx={15}>Thk</TH>
                    <TH idx={16}>KG<br />Accp</TH>
                    <TH idx={17}>Qty<br />Accp</TH>
                    <TH idx={18} bgcolor="#fff9c4">Rate</TH>
                    <TH idx={19}>Basic<br />Amt</TH>
                    <TH idx={20} bgcolor="#fff9c4">Disc<br />%</TH>
                    <TH idx={21} bgcolor="#fff9c4">Disc<br />Amt</TH>
                    <TH idx={22}>After<br />Disc</TH>
                    <TH idx={23} bgcolor="#fff9c4">P&amp;F<br />%</TH>
                    <TH idx={24} bgcolor="#fff9c4">P&amp;F<br />Amt</TH>
                    <TH idx={25}>Taxable</TH>
                    <TH idx={26} bgcolor="#fff9c4">SGST<br />%</TH>
                    <TH idx={27}>SGST<br />Amt</TH>
                    <TH idx={28} bgcolor="#fff9c4">CGST<br />%</TH>
                    <TH idx={29}>CGST<br />Amt</TH>
                    <TH idx={30} bgcolor="#fff9c4">IGST<br />%</TH>
                    <TH idx={31}>IGST<br />Amt</TH>
                    <TH idx={32} bgcolor="#fff9c4">TCS<br />%</TH>
                    <TH idx={33}>TCS<br />Amt</TH>
                    <TH idx={34} bgcolor="#fff9c4">Fre<br />%</TH>
                    <TH idx={35}>Fre<br />Val</TH>
                    <TH idx={36} bgcolor="#fff9c4">Oth<br />%</TH>
                    <TH idx={37}>Oth<br />Val</TH>
                    <TH idx={38} bgcolor="#bbdefb">Total<br />Value</TH>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {billItems.map(function (it, idx) {
                    var accp = Number(it.accepted_qty || 0);
                    var rate = Number(it.rate || 0);
                    var gross = r2(accp * rate);
                    var discPer = Number(it.discount_percent || 0);
                    var discInr = Number(it.discount_inr || 0);
                    var discAmt = discPer > 0 ? r2(gross * discPer / 100) : discInr;
                    var afterDisc = r2(gross - discAmt);
                    var pfPer = Number(it.pf_percent || 0);
                    var pfInr = Number(it.pf_inr || 0);
                    var pfAmt = pfPer > 0 ? r2(afterDisc * pfPer / 100) : pfInr;
                    var taxable = r2(afterDisc + pfAmt);
                    var cgstPer = Number(it.cgst_rate || 0);
                    var sgstPer = Number(it.sgst_rate || 0);
                    var igstPer = Number(it.igst_rate || 0);
                    var cgstAmt = r2(taxable * cgstPer / 100);
                    var sgstAmt = r2(taxable * sgstPer / 100);
                    var igstAmt = r2(taxable * igstPer / 100);
                    var tcsPer = Number(it.tcs_percent || 0);
                    var tcsAmt = r2((taxable + cgstAmt + sgstAmt + igstAmt) * tcsPer / 100);
                    var frePer = Number(it.fre_percent || 0);
                    var freInr = Number(it.fre_inr || 0);
                    var freVal = frePer > 0 ? r2(taxable * frePer / 100) : freInr;
                    var othPer = Number(it.oth_percent || 0);
                    var othInr = Number(it.oth_inr || 0);
                    var othVal = othPer > 0 ? r2(taxable * othPer / 100) : othInr;
                    var totalVal = r2(taxable + cgstAmt + sgstAmt + igstAmt + tcsAmt);
                    var totalWithFreOth = r2(totalVal + freVal + othVal);
                    var editSx = { textAlign: "center", fontSize: "0.8rem", border: "none", padding: "2px 4px", background: "#fffde7", outline: "none" };
                    var roSx = { textAlign: "center", fontSize: "0.8rem", py: 0.3, color: "#374151" };

                    return (
                      <TableRow key={idx} hover>
                        <TableCell sx={{ textAlign: "center", py: 0.3, px: 0.5, ...wTd(0) }}>
                          {!isView && (
                            <IconButton size="small" onClick={function () { removeBillItem(idx); }} sx={{ p: 0.2, color: "#ef4444" }}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          )}
                        </TableCell>
                        <TableCell sx={{ textAlign: "center", fontWeight: 600, py: 0.3, px: 0.5, color: "#64748b", ...wTd(1) }}>{idx + 1}</TableCell>
                        <TableCell sx={{ textAlign: "center", fontWeight: 600, py: 0.3, px: 0.5, ...wTd(2) }}>{it.grn_no}</TableCell>
                        <TableCell sx={{ textAlign: "center", py: 0.3, px: 0.5, ...wTd(3) }}>{fmtDate(it.grn_date, true)}</TableCell>
                        <TableCell sx={{ textAlign: "center", py: 0.3, px: 0.5, ...wTd(4) }}>{it.po_no || ""}</TableCell>
                        <TableCell sx={{ textAlign: "center", py: 0.3, px: 0.5, ...wTd(5) }}>{it.pr_no || ""}</TableCell>
                        <TableCell sx={{ textAlign: "center", py: 0.3, px: 0.5, ...wTd(6) }}>{fmtDate(it.pr_date, true)}</TableCell>
                        <TableCell sx={{ textAlign: "center", py: 0.3, px: 0.5, ...wTd(7) }}>{it.supp_dc_no || ""}</TableCell>
                        <TableCell sx={{ textAlign: "center", py: 0.3, px: 0.5, ...wTd(8) }}>{fmtDate(it.supp_dc_date)}</TableCell>
                        <TableCell sx={{ textAlign: "center", py: 0.3, px: 0.5, ...wTd(9) }}>{it.wo_no || ""}</TableCell>
                        <TableCell title={it.item_code} sx={{ fontWeight: 600, py: 0.3, px: 0.5, ...wTd(10) }}>{it.item_code}</TableCell>
                        <TableCell sx={{ py: 0.3, px: 0.5, maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", ...wTd(11) }}>
                          <Tooltip title={it.item_name} placement="bottom-start"><span>{it.item_name}</span></Tooltip>
                        </TableCell>                        <TableCell sx={{ textAlign: "center", py: 0.3, px: 0.5, ...wTd(12) }}>{Number(it.dia) || ""}</TableCell>
                        <TableCell sx={{ textAlign: "center", py: 0.3, px: 0.5, ...wTd(13) }}>{Number(it.len) || ""}</TableCell>
                        <TableCell sx={{ textAlign: "center", py: 0.3, px: 0.5, ...wTd(14) }}>{Number(it.wid) || ""}</TableCell>
                        <TableCell sx={{ textAlign: "center", py: 0.3, px: 0.5, ...wTd(15) }}>{Number(it.thk) || ""}</TableCell>
                        <TableCell sx={{ textAlign: "center", py: 0.3, px: 0.5, ...wTd(16) }}>{Number(it.kg || 0) || ""}</TableCell>
                        <TableCell sx={{ textAlign: "center", fontWeight: 600, py: 0.3, px: 0.5, ...wTd(17) }}>{accp || ""}</TableCell>
                        {/* Rate - yellow editable */}
                        <TableCell sx={{ py: 0.3, px: 0.5, ...wTd(18, { bgcolor: "#fffde7" }) }}>
                          <input type="number" value={rate || ""} disabled={isView}
                            onChange={function (e) { handleFieldChange(idx, "rate", Number(e.target.value) || 0); }}
                            style={{ ...editSx, width: "100%", boxSizing: "border-box" }} />
                        </TableCell>

                        {/* Scrollable Columns */}
                        <TableCell sx={{ ...roSx, ...wTd(19) }}>{displayVal(gross)}</TableCell>
                        <TableCell sx={{ py: 0.3, px: 0.5, ...wTd(20, { bgcolor: "#fffde7" }) }}>
                          <input type="number" value={discPer || ""} disabled={isView}
                            onChange={function (e) { handleFieldChange(idx, "discount_percent", Number(e.target.value) || 0); handleFieldChange(idx, "discount_inr", 0); }}
                            style={{ ...editSx, width: "100%", boxSizing: "border-box" }} />
                        </TableCell>
                        <TableCell sx={{ py: 0.3, px: 0.5, ...wTd(21, { bgcolor: "#fffde7" }) }}>
                          <input type="number" value={discAmt || ""} disabled={isView}
                            onChange={function (e) { handleFieldChange(idx, "discount_inr", Number(e.target.value) || 0); handleFieldChange(idx, "discount_percent", 0); }}
                            style={{ ...editSx, width: "100%", boxSizing: "border-box" }} />
                        </TableCell>
                        <TableCell sx={{ ...roSx, ...wTd(22) }}>{displayVal(afterDisc)}</TableCell>
                        <TableCell sx={{ py: 0.3, px: 0.5, ...wTd(23, { bgcolor: "#fffde7" }) }}>
                          <input type="number" value={pfPer || ""} disabled={isView}
                            onChange={function (e) { handleFieldChange(idx, "pf_percent", Number(e.target.value) || 0); handleFieldChange(idx, "pf_inr", 0); }}
                            style={{ ...editSx, width: "100%", boxSizing: "border-box" }} />
                        </TableCell>
                        <TableCell sx={{ py: 0.3, px: 0.5, ...wTd(24, { bgcolor: "#fffde7" }) }}>
                          <input type="number" value={pfAmt || ""} disabled={isView}
                            onChange={function (e) { handleFieldChange(idx, "pf_inr", Number(e.target.value) || 0); handleFieldChange(idx, "pf_percent", 0); }}
                            style={{ ...editSx, width: "100%", boxSizing: "border-box" }} />
                        </TableCell>
                        <TableCell sx={{ ...roSx, fontWeight: 700, color: "#1565c0", ...wTd(25) }}>{displayVal(taxable)}</TableCell>
                        <TableCell sx={{ py: 0.3, px: 0.5, ...wTd(26, { bgcolor: "#fffde7" }) }}>
                          <input type="number" value={sgstPer || ""} disabled={isView}
                            onChange={function (e) { handleFieldChange(idx, "sgst_rate", Number(e.target.value) || 0); }}
                            style={{ ...editSx, width: "100%", boxSizing: "border-box" }} />
                        </TableCell>
                        <TableCell sx={{ ...roSx, ...wTd(27) }}>{displayVal(sgstAmt)}</TableCell>
                        <TableCell sx={{ py: 0.3, px: 0.5, ...wTd(28, { bgcolor: "#fffde7" }) }}>
                          <input type="number" value={cgstPer || ""} disabled={isView}
                            onChange={function (e) { handleFieldChange(idx, "cgst_rate", Number(e.target.value) || 0); }}
                            style={{ ...editSx, width: "100%", boxSizing: "border-box" }} />
                        </TableCell>
                        <TableCell sx={{ ...roSx, ...wTd(29) }}>{displayVal(cgstAmt)}</TableCell>
                        <TableCell sx={{ py: 0.3, px: 0.5, ...wTd(30, { bgcolor: "#fffde7" }) }}>
                          <input type="number" value={igstPer || ""} disabled={isView}
                            onChange={function (e) { handleFieldChange(idx, "igst_rate", Number(e.target.value) || 0); }}
                            style={{ ...editSx, width: "100%", boxSizing: "border-box" }} />
                        </TableCell>
                        <TableCell sx={{ ...roSx, ...wTd(31) }}>{displayVal(igstAmt)}</TableCell>
                        <TableCell sx={{ py: 0.3, px: 0.5, ...wTd(32, { bgcolor: "#fffde7" }) }}>
                          <input type="number" value={tcsPer || ""} disabled={isView}
                            onChange={function (e) { handleFieldChange(idx, "tcs_percent", Number(e.target.value) || 0); }}
                            style={{ ...editSx, width: "100%", boxSizing: "border-box" }} />
                        </TableCell>
                        <TableCell sx={{ ...roSx, ...wTd(33) }}>{displayVal(tcsAmt)}</TableCell>
                        <TableCell sx={{ py: 0.3, px: 0.5, ...wTd(34, { bgcolor: "#fffde7" }) }}>
                          <input type="number" value={frePer || ""} disabled={isView}
                            onChange={function (e) { handleFieldChange(idx, "fre_percent", Number(e.target.value) || 0); handleFieldChange(idx, "fre_inr", 0); }}
                            style={{ ...editSx, width: "100%", boxSizing: "border-box" }} />
                        </TableCell>
                        <TableCell sx={{ py: 0.3, px: 0.5, ...wTd(35, { bgcolor: "#fffde7" }) }}>
                          <input type="number" value={freVal || ""} disabled={isView}
                            onChange={function (e) { handleFieldChange(idx, "fre_inr", Number(e.target.value) || 0); handleFieldChange(idx, "fre_percent", 0); }}
                            style={{ ...editSx, width: "100%", boxSizing: "border-box" }} />
                        </TableCell>
                        <TableCell sx={{ py: 0.3, px: 0.5, ...wTd(36, { bgcolor: "#fffde7" }) }}>
                          <input type="number" value={othPer || ""} disabled={isView}
                            onChange={function (e) { handleFieldChange(idx, "oth_percent", Number(e.target.value) || 0); handleFieldChange(idx, "oth_inr", 0); }}
                            style={{ ...editSx, width: "100%", boxSizing: "border-box" }} />
                        </TableCell>
                        <TableCell sx={{ py: 0.3, px: 0.5, ...wTd(37, { bgcolor: "#fffde7" }) }}>
                          <input type="number" value={othVal || ""} disabled={isView}
                            onChange={function (e) { handleFieldChange(idx, "oth_inr", Number(e.target.value) || 0); handleFieldChange(idx, "oth_percent", 0); }}
                            style={{ ...editSx, width: "100%", boxSizing: "border-box" }} />
                        </TableCell>
                        <TableCell sx={{ textAlign: "center", fontWeight: 700, fontSize: "0.82rem", py: 0.3, px: 0.5, color: "#0f172a", ...wTd(38) }}>
                          {displayVal(totalWithFreOth)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {/* ── Totals Row ── */}
                  {billItems.length > 0 && (function () {
                    var t = summary;
                    var ftSx = { textAlign: "center", fontWeight: 700, fontSize: "0.8rem", py: 0.4, color: "#0f172a", bgcolor: "#e8f4fd", borderTop: "2px solid #93c5fd" };
                    return (
                      <TableRow>
                        <TableCell sx={{ ...wFt(0), borderTop: "2px solid #93c5fd" }} />
                        <TableCell sx={{ ...wFt(1), borderTop: "2px solid #93c5fd" }} />
                        <TableCell sx={{ ...wFt(2), fontWeight: 800, fontSize: "0.8rem", color: "#1e40af", borderTop: "2px solid #93c5fd" }}>TOTAL</TableCell>
                        <TableCell sx={{ ...wFt(3), borderTop: "2px solid #93c5fd" }} />
                        <TableCell sx={{ ...wFt(4), borderTop: "2px solid #93c5fd" }} />
                        <TableCell sx={{ ...wFt(5), borderTop: "2px solid #93c5fd" }} />
                        <TableCell sx={{ ...wFt(6), borderTop: "2px solid #93c5fd" }} />
                        <TableCell sx={{ ...wFt(7), borderTop: "2px solid #93c5fd" }} />
                        <TableCell sx={{ ...wFt(8), borderTop: "2px solid #93c5fd" }} />
                        <TableCell sx={{ ...wFt(9), borderTop: "2px solid #93c5fd" }} />
                        <TableCell sx={{ ...wFt(10), borderTop: "2px solid #93c5fd" }} />
                        <TableCell sx={{ ...wFt(11), borderTop: "2px solid #93c5fd" }} />
                        <TableCell sx={{ ...wFt(12), borderTop: "2px solid #93c5fd" }} />
                        <TableCell sx={{ ...wFt(13), borderTop: "2px solid #93c5fd" }} />
                        <TableCell sx={{ ...wFt(14), borderTop: "2px solid #93c5fd" }} />
                        <TableCell sx={{ ...wFt(15), borderTop: "2px solid #93c5fd" }} />
                        <TableCell sx={{ ...ftSx, px: 0.5, ...wFt(16) }}>{displayTotalVal(t.kg)}</TableCell>
                        <TableCell sx={{ ...ftSx, px: 0.5, ...wFt(17) }}>{displayTotalVal(t.qty)}</TableCell>
                        <TableCell sx={{ ...ftSx, px: 0.5, ...wFt(18, { bgcolor: "#fff9c4" }) }}></TableCell>
                        <TableCell sx={{ ...ftSx, ...wFt(19) }}>{displayTotalVal(t.gross)}</TableCell>
                        <TableCell sx={{ ...ftSx, ...wFt(20, { bgcolor: "#fffde7" }) }}></TableCell>
                        <TableCell sx={{ ...ftSx, ...wFt(21) }}>{displayTotalVal(t.disc)}</TableCell>
                        <TableCell sx={{ ...ftSx, ...wFt(22) }}>{displayTotalVal(t.afterDisc)}</TableCell>
                        <TableCell sx={{ ...ftSx, ...wFt(23, { bgcolor: "#fffde7" }) }}></TableCell>
                        <TableCell sx={{ ...ftSx, ...wFt(24) }}>{displayTotalVal(t.pf)}</TableCell>
                        <TableCell sx={{ ...ftSx, color: "#1565c0", ...wFt(25) }}>{displayTotalVal(t.basic)}</TableCell>
                        <TableCell sx={{ ...ftSx, ...wFt(26, { bgcolor: "#fffde7" }) }}></TableCell>
                        <TableCell sx={{ ...ftSx, ...wFt(27) }}>{displayTotalVal(t.sgst)}</TableCell>
                        <TableCell sx={{ ...ftSx, ...wFt(28, { bgcolor: "#fffde7" }) }}></TableCell>
                        <TableCell sx={{ ...ftSx, ...wFt(29) }}>{displayTotalVal(t.cgst)}</TableCell>
                        <TableCell sx={{ ...ftSx, ...wFt(30, { bgcolor: "#fffde7" }) }}></TableCell>
                        <TableCell sx={{ ...ftSx, ...wFt(31) }}>{displayTotalVal(t.igst)}</TableCell>
                        <TableCell sx={{ ...ftSx, ...wFt(32, { bgcolor: "#fffde7" }) }}></TableCell>
                        <TableCell sx={{ ...ftSx, ...wFt(33) }}>{displayTotalVal(t.tcs)}</TableCell>
                        <TableCell sx={{ ...ftSx, ...wFt(34, { bgcolor: "#fffde7" }) }}></TableCell>
                        <TableCell sx={{ ...ftSx, ...wFt(35) }}>{displayTotalVal(t.fre)}</TableCell>
                        <TableCell sx={{ ...ftSx, ...wFt(36, { bgcolor: "#fffde7" }) }}></TableCell>
                        <TableCell sx={{ ...ftSx, ...wFt(37) }}>{displayTotalVal(t.oth)}</TableCell>
                        <TableCell sx={{ ...ftSx, bgcolor: "#bbdefb", ...wFt(38) }}>{displayTotalVal(t.totalValue)}</TableCell>
                      </TableRow>
                    );
                  })()}
                </TableBody>
              </Table>
            </Box>

            {/* Summary chips - compact totals strip */}
            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1.5, px: 1, py: 0.75, bgcolor: "#f1f5f9", borderRadius: 2, flexWrap: "wrap", alignItems: "center" }}>
              <SummaryChip label="Qty" value={summary.qty} plain />
              <SummaryChip label="Basic Amt" value={summary.gross} />
              <SummaryChip label="Disc" value={summary.disc} />
              <SummaryChip label="After Disc" value={summary.afterDisc} />
              <SummaryChip label="P&amp;F" value={summary.pf} />
              <SummaryChip label="Taxable" value={summary.basic} />
              <SummaryChip label="SGST" value={summary.sgst} />
              <SummaryChip label="CGST" value={summary.cgst} />
              <SummaryChip label="IGST" value={summary.igst} />
              <SummaryChip label="TCS" value={summary.tcs} />
              <SummaryChip label="Fre" value={summary.fre} />
              <SummaryChip label="Oth" value={summary.oth} />
              <Box sx={{ bgcolor: "#1565c0", color: "#fff", borderRadius: 2, px: 1.25, py: 0.35, display: "flex", alignItems: "center", gap: 0.5, fontWeight: 700, fontSize: "0.8rem" }}>
                <Typography variant="caption" sx={{ opacity: 0.85, fontWeight: 500 }}>Total Value</Typography>
                <span>&#8377;{summary.totalValue ? displayVal(summary.totalValue) : "0"}</span>
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}

      <style>{`
        input[type=datetime-local]::-webkit-inner-spin-button,
        input[type=datetime-local]::-webkit-outer-spin-button,
        input[type=number]::-webkit-inner-spin-button,
        input[type=number]::-webkit-outer-spin-button {
          -webkit-appearance: none; margin: 0;
        }
        input[type=datetime-local] { -moz-appearance: textfield; }
        input[type=number] { -moz-appearance: textfield; }
        .billing-table-container::-webkit-scrollbar {
          height: 12px;
        }
        .billing-table-container::-webkit-scrollbar-track {
          background: #f8fafc;
          border-radius: 4px;
          margin-left: var(--sticky-width, 0px);
        }
        .billing-table-container::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
        }
        .billing-table-container::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </Box>
  );
}

function SummaryChip({ label, value, plain }) {
  var valNum = Number(value || 0);
  var display = valNum % 1 === 0 ? valNum.toLocaleString("en-IN") : valNum.toLocaleString("en-IN", { maximumFractionDigits: 2 });
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, bgcolor: "#fff", borderRadius: 2, px: 1.25, py: 0.25, border: "1px solid #e2e8f0" }}>
      <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 500, fontSize: "0.72rem" }}>{label}</Typography>
      <Typography variant="body2" sx={{ fontWeight: 700, color: "#0f172a", fontSize: "0.78rem" }}>
        {!plain && <span style={{ marginRight: "2px" }}>&#8377;</span>}
        {display}
      </Typography>
    </Box>
  );
}

function GrnItemShuttle({ items, shuttleChecked, loadedKeys, toggleShuttle }) {
  var [leftSearch, setLeftSearch] = useState("");
  var [rightSearch, setRightSearch] = useState("");
  var [selected, setSelected] = useState([]);

  var checkedSet = useMemo(function () { return new Set(shuttleChecked); }, [shuttleChecked]);

  var leftItems = useMemo(function () {
    var q = leftSearch.toLowerCase();
    return items.filter(function (s) {
      return !checkedSet.has(s.key) && !loadedKeys.has(s.key) && (!q || (s.item.item_name || "").toLowerCase().includes(q) || (s.item.item_code || "").toLowerCase().includes(q) || (s.grn.grn_no || "").toLowerCase().includes(q));
    });
  }, [items, checkedSet, loadedKeys, leftSearch]);

  var rightItems = useMemo(function () {
    var q = rightSearch.toLowerCase();
    return items.filter(function (s) {
      return (checkedSet.has(s.key) || loadedKeys.has(s.key)) && (!q || (s.item.item_name || "").toLowerCase().includes(q) || (s.item.item_code || "").toLowerCase().includes(q) || (s.grn.grn_no || "").toLowerCase().includes(q));
    });
  }, [items, checkedSet, loadedKeys, rightSearch]);

  var leftIds = useMemo(function () { return new Set(leftItems.map(function (s) { return s.key; })); }, [leftItems]);

  function shuttleToggleSelect(id) {
    setSelected(function (prev) { return prev.includes(id) ? prev.filter(function (x) { return x !== id; }) : prev.concat([id]); });
  }

  function moveSelectedRight() {
    var toMove = selected.filter(function (sid) { return leftIds.has(sid); });
    toMove.forEach(function (sid) { toggleShuttle(sid); });
    setSelected([]);
  }

  function moveSelectedLeft() {
    var toMove = selected.filter(function (sid) { return !leftIds.has(sid) && !loadedKeys.has(sid); });
    toMove.forEach(function (sid) { toggleShuttle(sid); });
    setSelected([]);
  }

  function moveAllRight() {
    leftItems.forEach(function (s) { toggleShuttle(s.key); });
    setSelected([]);
  }

  function moveAllLeft() {
    shuttleChecked.forEach(function (key) { if (!loadedKeys.has(key)) toggleShuttle(key); });
    setSelected([]);
  }

  var num = function (v) {
    if (!v) return "0";
    var n = Number(v);
    return n % 1 === 0 ? n.toString() : n.toLocaleString("en-IN", { maximumFractionDigits: 2 });
  };

  var searchSx = {
    "& .MuiOutlinedInput-root": { fontSize: "0.8rem" },
    "& .MuiOutlinedInput-input": { py: 0.75 },
    mb: 0.75,
  };

  var listSx = {
    border: "1px solid #e2e8f0", borderRadius: 2, minHeight: 200, maxHeight: 320,
    overflow: "auto", bgcolor: "#fff",
  };

  var rowSx = function (isSel) {
    return {
      display: "flex", alignItems: "center", gap: 1,
      px: 1.25, py: 0.6, cursor: "pointer", userSelect: "none",
      borderBottom: "1px solid #f1f5f9",
      bgcolor: isSel ? "#eff6ff" : "transparent",
      transition: "background 0.1s",
      "&:hover": { bgcolor: isSel ? "#dbeafe" : "#f8fafc" },
    };
  };

  return (
    <Stack direction="row" spacing={1} alignItems="stretch">
      <Box sx={{ flex: 1 }}>
        <Typography variant="caption" sx={{ fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: 0.5, mb: 0.5, display: "block" }}>
          Available ({leftItems.length})
        </Typography>
        <TextField size="small" placeholder="Search items..." variant="outlined" fullWidth
          value={leftSearch} onChange={function (e) { setLeftSearch(e.target.value); }} sx={searchSx} />
        <Box sx={listSx}>
          {leftItems.length === 0 && (
            <Typography variant="body2" sx={{ p: 2, color: "text.secondary", textAlign: "center", fontStyle: "italic" }}>
              {leftSearch ? "No items match your search" : "All items selected \u2192"}
            </Typography>
          )}
          {leftItems.map(function (s) {
            var isSel = selected.includes(s.key);
            return (
              <Box key={s.key} sx={rowSx(isSel)} onClick={function () { shuttleToggleSelect(s.key); }} onDoubleClick={function () { toggleShuttle(s.key); }}>
                <Typography variant="body2" sx={{ fontSize: "0.8rem", color: "#1e293b", lineHeight: 1.4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  <Box component="span" sx={{ fontWeight: 700, color: "#475569", mr: 0.5 }}>{s.item.item_code || "---"}</Box>
                  <Box component="span" sx={{ fontWeight: 600 }}>{s.item.item_name}</Box>
                  <Box component="span" sx={{ color: "#64748b", ml: 0.5 }}>
                    &middot; {s.grn.grn_no} &middot; Qty: {num(s.item.accepted_qty)} &middot; &#x20B9;{num(s.computed.rate)}
                  </Box>
                </Typography>
              </Box>
            );
          })}
        </Box>
      </Box>

      <Stack spacing={0.5} justifyContent="center" alignItems="center" sx={{ px: 0.5 }}>
        <Tooltip title="Move selected to right" placement="right">
          <IconButton size="small" onClick={moveSelectedRight}
            disabled={selected.length === 0 || leftItems.every(function (s) { return !selected.includes(s.key); })}
            sx={{ border: "1px solid #cbd5e1", borderRadius: 1, "&:hover": { bgcolor: "#dbeafe" } }}>
            <ChevronRightIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>
        <Tooltip title="Move all to right" placement="right">
          <IconButton size="small" onClick={moveAllRight} disabled={leftItems.length === 0}
            sx={{ border: "1px solid #cbd5e1", borderRadius: 1, "&:hover": { bgcolor: "#dbeafe" } }}>
            <DoubleArrowIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>
        <Tooltip title="Move all to left" placement="right">
          <IconButton size="small" onClick={moveAllLeft}
            disabled={shuttleChecked.filter(function (k) { return !loadedKeys.has(k); }).length === 0}
            sx={{ border: "1px solid #cbd5e1", borderRadius: 1, "&:hover": { bgcolor: "#fef2f2" } }}>
            <DoubleArrowIcon sx={{ fontSize: 18, transform: "scaleX(-1)" }} />
          </IconButton>
        </Tooltip>
        <Tooltip title="Move selected to left" placement="right">
          <IconButton size="small" onClick={moveSelectedLeft}
            disabled={selected.length === 0 || rightItems.every(function (s) { return !selected.includes(s.key); })}
            sx={{ border: "1px solid #cbd5e1", borderRadius: 1, "&:hover": { bgcolor: "#fef2f2" } }}>
            <ChevronLeftIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>
      </Stack>

      <Box sx={{ flex: 1 }}>
        <Typography variant="caption" sx={{ fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: 0.5, mb: 0.5, display: "block" }}>
          Selected ({rightItems.length})
        </Typography>
        <TextField size="small" placeholder="Search items..." variant="outlined" fullWidth
          value={rightSearch} onChange={function (e) { setRightSearch(e.target.value); }} sx={searchSx} />
        <Box sx={listSx}>
          {rightItems.length === 0 && (
            <Typography variant="body2" sx={{ p: 2, color: "text.secondary", textAlign: "center", fontStyle: "italic" }}>
              {rightSearch ? "No items match your search" : "\u2190 Move items from left"}
            </Typography>
          )}
          {rightItems.map(function (s) {
            var alreadyLoaded = loadedKeys.has(s.key);
            var isSel = selected.includes(s.key);
            return (
              <Box key={s.key}
                sx={{ ...rowSx(isSel), ...(alreadyLoaded ? { opacity: 0.6, cursor: "default" } : {}) }}
                onClick={function () { if (!alreadyLoaded) shuttleToggleSelect(s.key); }}
                onDoubleClick={function () { if (!alreadyLoaded) toggleShuttle(s.key); }}>
                <Typography variant="body2" sx={{ fontSize: "0.8rem", color: "#1e293b", lineHeight: 1.4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>
                  <Box component="span" sx={{ fontWeight: 700, color: "#475569", mr: 0.5 }}>{s.item.item_code || "---"}</Box>
                  <Box component="span" sx={{ fontWeight: 600 }}>{s.item.item_name}</Box>
                  <Box component="span" sx={{ color: "#64748b", ml: 0.5 }}>
                    &middot; {s.grn.grn_no} &middot; Qty: {num(s.item.accepted_qty)} &middot; &#x20B9;{num(s.computed.rate)}
                  </Box>
                </Typography>
                {alreadyLoaded && <Chip size="small" label="Loaded" color="success" variant="outlined" sx={{ fontSize: "0.65rem", height: 18, ml: "auto" }} />}
              </Box>
            );
          })}
        </Box>
      </Box>
    </Stack>
  );
}