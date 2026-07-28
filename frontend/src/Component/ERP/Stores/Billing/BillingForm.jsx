import React, { useEffect, useState, useCallback, useMemo } from "react";
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
const thSx = { fontWeight: 700, fontSize: "0.68rem", color: "#475569", whiteSpace: "nowrap", py: 0.3 };

export default function BillingForm() {
  var navigate = useNavigate();
  var location = useLocation();
  var { showToast } = useToast();
  var isView = location.pathname.includes("/view");
  var [loading, setLoading] = useState(false);
  var [saving, setSaving] = useState(false);
  var [suppliers, setSuppliers] = useState([]);
  var [pendingGrrs, setPendingGrrs] = useState([]);
  var [allPos, setAllPos] = useState([]);
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
      var { data } = await axios.get("/api/erp/purchases/pos/all");
      setAllPos(data);
    } catch (e) { /* non-critical */ }
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
    var maps = { byId: {}, byGroupId: {}, byPoAndCode: {} };
    function addPoItems(po) {
      if (po && po.items) {
        po.items.forEach(function (poi) {
          var detail = { po_no: po.po_no, ...poi };
          maps.byId[poi.id] = detail;
          if (poi.item_id) maps.byGroupId[poi.item_id] = detail;
          if (poi.item_code) maps.byPoAndCode[po.po_no + ":" + poi.item_code] = detail;
        });
      }
    }
    filteredGrrs.forEach(function (grn) { addPoItems(grn.purchaseOrder); });
    if (allPos) allPos.forEach(function (po) { addPoItems(po); });
    return maps;
  }, [filteredGrrs, allPos]);

  function findPOItem(it, grn) {
    if (it.po_item_id && poItemMap.byId[it.po_item_id]) return poItemMap.byId[it.po_item_id];
    if (it.item_id && poItemMap.byGroupId[it.item_id]) return poItemMap.byGroupId[it.item_id];
    var poNo = it.po_no || grn.po_no;
    if (poNo && it.item_code && poItemMap.byPoAndCode[poNo + ":" + it.item_code]) return poItemMap.byPoAndCode[poNo + ":" + it.item_code];
    if (grn.purchaseOrder?.items) return grn.purchaseOrder.items.find(function (poi) { return poi.item_code === it.item_code || poi.item_id === it.item_id; });
    return null;
  }

  var computeItemDetails = useCallback(function (it, grn) {
    var poi = findPOItem(it, grn);
    var rate = Number(poi?.rate || it.rate || 0);
    var poDiscPercent = Number(poi?.discount_percent || 0);
    var poDiscInr = Number(poi?.discount_inr || 0);
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

  // On mount, if we received GRNs via location state, load them directly
  useEffect(function () {
    if (initialLoaded || !location.state) return;
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
          po_no: computed.po_no, pr_no: it.pr_no || "",
          item_code: it.item_code, item_name: it.item_name, uom: it.uom,
          po_item_id: it.po_item_id, accepted_qty: it.accepted_qty || 0,
          rate: computed.rate, gst_rate: it.gst_rate || 0,
          kg: it.kg || 0, accp: it.accp || 0,
          discount_percent: computed.discPercent, discount_inr: computed.discInr,
          pf_percent: computed.pfPercent, pf_inr: computed.pfInr,
          cgst_rate: computed.cgstRate, sgst_rate: computed.sgstRate, igst_rate: computed.igstRate,
          selected: true,
        });
      });
    });
    if (items.length > 0) { setBillItems(items); setShuttleChecked(allKeys); }
  }, [location.state, pendingGrrs, allPos, initialLoaded, computeItemDetails]);

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
        po_no: computed.po_no, pr_no: it.pr_no || "",
        item_code: it.item_code, item_name: it.item_name, uom: it.uom,
        po_item_id: it.po_item_id, accepted_qty: it.accepted_qty || 0,
        rate: computed.rate, gst_rate: it.gst_rate || 0,
        kg: it.kg || 0, accp: it.accp || 0,
        discount_percent: computed.discPercent, discount_inr: computed.discInr,
        pf_percent: computed.pfPercent, pf_inr: computed.pfInr,
        cgst_rate: computed.cgstRate, sgst_rate: computed.sgstRate, igst_rate: computed.igstRate,
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
    setBillItems(function (prev) { return prev.map(function (it, i) { return i === idx ? { ...it, [field]: value } : it; }); });
  }

  var summary = useMemo(function () {
    var qty = 0, kg = 0, basic = 0, cgst = 0, sgst = 0, igst = 0;
    billItems.forEach(function (it) {
      var accp = Number(it.accepted_qty || 0);
      var kgVal = Number(it.kg || 0);
      var rate = Number(it.rate || 0);
      var discPer = Number(it.discount_percent || 0);
      var discInr = Number(it.discount_inr || 0);
      var pfPer = Number(it.pf_percent || 0);
      var pfInr = Number(it.pf_inr || 0);
      var cgstPer = Number(it.cgst_rate || 0);
      var sgstPer = Number(it.sgst_rate || 0);
      var igstPer = Number(it.igst_rate || 0);
      var taxable = accp * rate - discInr;
      var pfVal = pfInr + taxable * (pfPer / 100);
      var cgstVal = (taxable + pfVal) * (cgstPer / 100);
      var sgstVal = (taxable + pfVal) * (sgstPer / 100);
      var igstVal = (taxable + pfVal) * (igstPer / 100);
      qty += accp; kg += kgVal;
      basic += taxable + pfVal;
      cgst += cgstVal; sgst += sgstVal; igst += igstVal;
    });
    return { qty: r2(qty), kg: r2(kg), basic: r2(basic), cgst: r2(cgst), sgst: r2(sgst), igst: r2(igst), total: r2(basic + cgst + sgst + igst) };
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

  function fmtDate(d) {
    return d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "-";
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
            sx={{ mb: 1.5, maxWidth: 420 }}
          />

          {loading && <LinearProgress sx={{ mb: 1 }} />}

          {selectedGrns.length > 0 && allShuttleItems.length > 0 && (
            <>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                <Button size="small" variant="outlined" onClick={function () { setShuttleOpen(function (p) { return !p; }); }}
                  sx={{ textTransform: "none", fontSize: "0.72rem", minWidth: 0 }}>
                  {shuttleOpen ? "Hide Item Selector" : "Show Item Selector"} ({allShuttleItems.length} items)
                </Button>
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
            </>
          )}
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
            <Box sx={{ maxHeight: 380, overflow: "auto", mb: 2, border: "1px solid #e2e8f0", borderRadius: 2 }}>
              <Table size="small" sx={{ "& td, & th": { border: "1px solid #e0e0e0", px: 0.35, py: 0.25, fontSize: "0.68rem" } }}>
                <TableHead>
                  <TableRow sx={{ bgcolor: "#f1f5f9" }}>
                    <TableCell sx={{ ...thSx, width: 28 }}></TableCell>
                    <TableCell sx={{ ...thSx, width: 28, textAlign: "center" }}>Sl#</TableCell>
                    <TableCell sx={thSx}>GRR #</TableCell>
                    <TableCell sx={thSx}>PO #</TableCell>
                    <TableCell sx={thSx}>PR #</TableCell>
                    <TableCell sx={thSx}>Item Code</TableCell>
                    <TableCell sx={{ ...thSx, minWidth: 140 }}>Description</TableCell>
                    <TableCell sx={{ ...thSx, textAlign: "right" }}>Accp Qty</TableCell>
                    <TableCell sx={{ ...thSx, textAlign: "right" }}>KG</TableCell>
                    <TableCell sx={{ ...thSx, textAlign: "right" }}>Rate</TableCell>
                    <TableCell sx={{ ...thSx, textAlign: "right" }}>Disc%</TableCell>
                    <TableCell sx={{ ...thSx, textAlign: "right" }}>Disc Amt</TableCell>
                    <TableCell sx={{ ...thSx, textAlign: "right" }}>PF%</TableCell>
                    <TableCell sx={{ ...thSx, textAlign: "right" }}>PF Amt</TableCell>
                    <TableCell sx={{ ...thSx, textAlign: "right" }}>CGST%</TableCell>
                    <TableCell sx={{ ...thSx, textAlign: "right" }}>SGST%</TableCell>
                    <TableCell sx={{ ...thSx, textAlign: "right" }}>IGST%</TableCell>
                    <TableCell sx={{ ...thSx, textAlign: "right" }}>Amount</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {billItems.map(function (it, idx) {
                    var accp = Number(it.accepted_qty || 0);
                    var rate = Number(it.rate || 0);
                    var discInr = Number(it.discount_inr || 0);
                    var pfPer = Number(it.pf_percent || 0);
                    var pfInr = Number(it.pf_inr || 0);
                    var cgstPer = Number(it.cgst_rate || 0);
                    var sgstPer = Number(it.sgst_rate || 0);
                    var igstPer = Number(it.igst_rate || 0);
                    var taxable = accp * rate - discInr;
                    var pfVal = pfInr + taxable * (pfPer / 100);
                    var amount = taxable + pfVal + (taxable + pfVal) * ((cgstPer + sgstPer + igstPer) / 100);

                    return (
                      <TableRow key={idx} hover>
                        <TableCell sx={{ textAlign: "center", py: 0.25 }}>
                          {!isView && (
                            <IconButton size="small" onClick={function () { removeBillItem(idx); }} sx={{ p: 0.2, color: "#ef4444" }}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          )}
                        </TableCell>
                        <TableCell sx={{ textAlign: "center", fontWeight: 600, fontSize: "0.68rem", py: 0.25, color: "#64748b" }}>{idx + 1}</TableCell>
                        <TableCell sx={{ fontWeight: 600, fontSize: "0.68rem", py: 0.25 }}>{it.grn_no}</TableCell>
                        <TableCell sx={{ fontSize: "0.68rem", py: 0.25 }}>{it.po_no || "-"}</TableCell>
                        <TableCell sx={{ fontSize: "0.68rem", py: 0.25 }}>{it.pr_no || "-"}</TableCell>
                        <TableCell sx={{ fontWeight: 600, fontSize: "0.68rem", py: 0.25 }}>{it.item_code}</TableCell>
                        <TableCell sx={{ fontSize: "0.68rem", py: 0.25, maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis" }}>{it.item_name}</TableCell>
                        <TableCell sx={{ textAlign: "right", fontWeight: 600, fontSize: "0.68rem", py: 0.25 }}>{accp.toFixed(2)}</TableCell>
                        <TableCell sx={{ textAlign: "right", fontSize: "0.68rem", py: 0.25 }}>{Number(it.kg || 0).toFixed(2)}</TableCell>
                        <TableCell sx={{ textAlign: "right", py: 0.25 }}>
                          <input type="number" value={rate} disabled={isView}
                            onChange={function (e) { handleFieldChange(idx, "rate", Number(e.target.value) || 0); }}
                            style={{ width: 70, textAlign: "right", fontSize: "0.68rem", border: "none", borderBottom: "1px solid #cbd5e1", padding: "2px 4px", background: "transparent" }} />
                        </TableCell>
                        <TableCell sx={{ textAlign: "right", py: 0.25 }}>
                          <input type="number" value={it.discount_percent || 0} disabled={isView}
                            onChange={function (e) { handleFieldChange(idx, "discount_percent", Number(e.target.value) || 0); }}
                            style={{ width: 50, textAlign: "right", fontSize: "0.68rem", border: "none", borderBottom: "1px solid #cbd5e1", padding: "2px 4px", background: "transparent" }} />
                        </TableCell>
                        <TableCell sx={{ textAlign: "right", py: 0.25 }}>
                          <input type="number" value={discInr} disabled={isView}
                            onChange={function (e) { handleFieldChange(idx, "discount_inr", Number(e.target.value) || 0); }}
                            style={{ width: 65, textAlign: "right", fontSize: "0.68rem", border: "none", borderBottom: "1px solid #cbd5e1", padding: "2px 4px", background: "transparent" }} />
                        </TableCell>
                        <TableCell sx={{ textAlign: "right", py: 0.25 }}>
                          <input type="number" value={pfPer} disabled={isView}
                            onChange={function (e) { handleFieldChange(idx, "pf_percent", Number(e.target.value) || 0); }}
                            style={{ width: 50, textAlign: "right", fontSize: "0.68rem", border: "none", borderBottom: "1px solid #cbd5e1", padding: "2px 4px", background: "transparent" }} />
                        </TableCell>
                        <TableCell sx={{ textAlign: "right", py: 0.25 }}>
                          <input type="number" value={pfInr} disabled={isView}
                            onChange={function (e) { handleFieldChange(idx, "pf_inr", Number(e.target.value) || 0); }}
                            style={{ width: 65, textAlign: "right", fontSize: "0.68rem", border: "none", borderBottom: "1px solid #cbd5e1", padding: "2px 4px", background: "transparent" }} />
                        </TableCell>
                        <TableCell sx={{ textAlign: "right", py: 0.25 }}>
                          <input type="number" value={cgstPer} disabled={isView}
                            onChange={function (e) { handleFieldChange(idx, "cgst_rate", Number(e.target.value) || 0); }}
                            style={{ width: 55, textAlign: "right", fontSize: "0.68rem", border: "none", borderBottom: "1px solid #cbd5e1", padding: "2px 4px", background: "transparent" }} />
                        </TableCell>
                        <TableCell sx={{ textAlign: "right", py: 0.25 }}>
                          <input type="number" value={sgstPer} disabled={isView}
                            onChange={function (e) { handleFieldChange(idx, "sgst_rate", Number(e.target.value) || 0); }}
                            style={{ width: 55, textAlign: "right", fontSize: "0.68rem", border: "none", borderBottom: "1px solid #cbd5e1", padding: "2px 4px", background: "transparent" }} />
                        </TableCell>
                        <TableCell sx={{ textAlign: "right", py: 0.25 }}>
                          <input type="number" value={igstPer} disabled={isView}
                            onChange={function (e) { handleFieldChange(idx, "igst_rate", Number(e.target.value) || 0); }}
                            style={{ width: 55, textAlign: "right", fontSize: "0.68rem", border: "none", borderBottom: "1px solid #cbd5e1", padding: "2px 4px", background: "transparent" }} />
                        </TableCell>
                        <TableCell sx={{ textAlign: "right", fontWeight: 700, fontSize: "0.7rem", py: 0.25, color: "#1565c0" }}>
                          {formatNumber(amount)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Box>

            {/* Summary Row */}
            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, px: 1, py: 0.75, bgcolor: "#f1f5f9", borderRadius: 2, flexWrap: "wrap" }}>
              <SummaryChip label="Qty Accp" value={summary.qty} />
              <SummaryChip label="KG Accp" value={summary.kg} />
              <SummaryChip label="Basic Amt" value={summary.basic} />
              <SummaryChip label="CGST" value={summary.cgst} />
              <SummaryChip label="SGST" value={summary.sgst} />
              <SummaryChip label="IGST" value={summary.igst} />
              <SummaryChip label="Freight" value="0" />
              <Box sx={{ bgcolor: "#16a34a", color: "#fff", borderRadius: 2, px: 1.25, py: 0.25, display: "flex", alignItems: "center", gap: 0.5, fontWeight: 700, fontSize: "0.78rem" }}>
                <Typography variant="caption" sx={{ opacity: 0.85, fontWeight: 500 }}>Total Value</Typography>
                <span>&#8377;{formatNumber(summary.total)}</span>
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
      `}</style>
    </Box>
  );
}

function SummaryChip({ label, value }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, bgcolor: "#fff", borderRadius: 2, px: 1.25, py: 0.25, border: "1px solid #e2e8f0" }}>
      <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 500, fontSize: "0.72rem" }}>{label}</Typography>
      <Typography variant="body2" sx={{ fontWeight: 700, color: "#0f172a", fontSize: "0.78rem" }}>&#8377;{formatNumber(value)}</Typography>
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

  var num = function (v) { return Number(v || 0).toFixed(2); };

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