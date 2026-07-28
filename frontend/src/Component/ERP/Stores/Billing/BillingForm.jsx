import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  Box, Card, CardContent, Typography, TextField, Button, Chip, LinearProgress,
  Table, TableHead, TableRow, TableCell, TableBody, TableContainer, IconButton,
  MenuItem, Checkbox, Autocomplete,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CancelIcon from "@mui/icons-material/Cancel";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DeleteIcon from "@mui/icons-material/Delete";
import AddCircleIcon from "@mui/icons-material/AddCircle";
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
  var [expandedGrrs, setExpandedGrrs] = useState({});
  var [selectedItems, setSelectedItems] = useState({});
  var [selectedGrnIds, setSelectedGrnIds] = useState([]);
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
  var totalItems = selectedGrns.reduce(function (s, g) { return s + (g.items || []).length; }, 0);
  var selCount = Object.values(selectedItems).filter(Boolean).length;

  function getItemKey(grnId, itemId) { return grnId + ":" + (itemId || Math.random()); }

  function toggleSelectItem(grnId, itemId) {
    var key = getItemKey(grnId, itemId);
    setSelectedItems(function (prev) { return { ...prev, [key]: !prev[key] }; });
  }

  function toggleSelectGrn(grnId) {
    var grn = filteredGrrs.find(function (g) { return g.id === grnId; });
    if (!grn) return;
    var items = grn.items || [];
    var allSelected = items.every(function (it) { return selectedItems[getItemKey(grnId, it.id || it.item_id)]; });
    setSelectedItems(function (prev) {
      var next = { ...prev };
      items.forEach(function (it) { next[getItemKey(grnId, it.id || it.item_id)] = !allSelected; });
      return next;
    });
  }

  function selectAllGRRItems() {
    if (selCount === totalItems) { setSelectedItems({}); return; }
    var all = {};
    selectedGrns.forEach(function (g) {
      (g.items || []).forEach(function (it) { all[getItemKey(g.id, it.id || it.item_id)] = true; });
    });
    setSelectedItems(all);
  }

  function toggleExpand(grnId) {
    setExpandedGrrs(function (prev) { return { ...prev, [grnId]: !prev[grnId] }; });
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

  // On mount, if we received GRNs via location state, load them directly
  useEffect(function () {
    if (initialLoaded || !location.state) return;
    var grns = location.state.grns || (location.state.grn ? [location.state.grn] : null);
    if (!grns || grns.length === 0) return;
    setInitialLoaded(true);
    setSelectedGrnIds(grns.map(function (g) { return g.id; }));
    setForm(function (f) { return { ...f, supplier_name: grns[0]?.supplier?.supplier_name || "", party_name: grns[0]?.supplier?.supplier_name || "" }; });
    var allKeys = {};
    var items = [];
    grns.forEach(function (grn) {
      (grn.items || []).forEach(function (it) {
        var computed = computeItemDetails(it, grn);
        allKeys[getItemKey(grn.id, it.id || it.item_id)] = true;
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
    if (items.length > 0) { setBillItems(items); setSelectedItems(allKeys); }
  }, [location.state, pendingGrrs, allPos, initialLoaded, computeItemDetails]);

  // Load selected items from GRRs into billing grid
  function handleGrrListSelection() {
    var newItems = [];
    selectedGrns.forEach(function (grn) {
      (grn.items || []).forEach(function (it) {
        var key = getItemKey(grn.id, it.id || it.item_id);
        if (!selectedItems[key]) return;
        if (billItems.some(function (bi) { return bi.grn_id === grn.id && bi.id === it.id; })) return;
        var computed = computeItemDetails(it, grn);
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
          selected: true,
        });
      });
    });
    if (newItems.length === 0) { showToast("No new items to load", "info"); return; }
    setBillItems(function (prev) { return [...prev, ...newItems]; });
    showToast(newItems.length + " item(s) loaded", "success");
  }

  function toggleItemSelect(idx) {
    if (billItems[idx]?.selected) removeBillItem(idx);
  }

  function selectAllItems() {
    var allSelected = billItems.every(function (it) { return it.selected; });
    setBillItems(function (prev) { return prev.map(function (it) { return { ...it, selected: !allSelected }; }); });
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
          onChange={function (e) { setForm(function (f) { return { ...f, supplier_name: e.target.value, party_name: e.target.value }; }); setSelectedItems({}); setBillItems([]); }}
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

      {/* Select GRRs — Multi-select dropdown with item picker */}
      <Card id="grr-selection-card" sx={{ borderRadius: 2, mb: 1.5, boxShadow: "0 1px 6px rgba(0,0,0,0.06)" }}>
        <CardContent sx={{ p: "8px!important" }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "var(--heading-color)", fontSize: "0.82rem" }}>
              Select GRRs
            </Typography>
            <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
              {selCount > 0 && (
                <Chip label={selCount + " item(s) selected"} size="small" color="primary" onDelete={function () { setSelectedItems({}); }} />
              )}
              <Button variant="contained" color="success" size="small"
                onClick={handleGrrListSelection} disabled={selCount === 0}
                sx={{ textTransform: "none", fontSize: "0.75rem" }}>
                Load Selected ({selCount})
              </Button>
            </Box>
          </Box>

          <Autocomplete
            multiple
            size="small"
            options={filteredGrrs}
            value={selectedGrns}
            onChange={function (_, newVal) { setSelectedGrnIds(newVal.map(function (g) { return g.id; })); }}
            getOptionLabel={function (option) { return option.grn_no + " (" + (option.supplier?.supplier_name || "-") + ")"; }}
            renderInput={function (params) {
              return <TextField {...params} label="Search & Select GRR Numbers" placeholder="Type to search..." sx={{ "& .MuiInputBase-root": { fontSize: "0.78rem" } }} />;
            }}
            renderTags={function (tagValue, getTagProps) {
              return tagValue.map(function (option, index) {
                return <Chip label={option.grn_no} size="small" {...getTagProps({ index })} />;
              });
            }}
            sx={{ mb: 1, maxWidth: 420 }}
          />

          {loading && <LinearProgress sx={{ mb: 1 }} />}

          {selectedGrns.length > 0 && (
            <Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                <Checkbox size="small" checked={selCount === totalItems && totalItems > 0}
                  indeterminate={selCount > 0 && selCount < totalItems}
                  onChange={selectAllGRRItems} />
                <Typography variant="caption" sx={{ fontWeight: 600, color: "#475569" }}>
                  Select all items ({totalItems} items)
                </Typography>
              </Box>
              <Box sx={{ maxHeight: 320, overflow: "auto" }}>
                {selectedGrns.map(function (grn) {
                  var items = grn.items || [];
                  var isExpanded = expandedGrrs[grn.id];
                  var grnItemKeys = items.map(function (it) { return getItemKey(grn.id, it.id || it.item_id); });
                  var selInGrn = grnItemKeys.filter(function (k) { return selectedItems[k]; }).length;
                  var isSelected = selInGrn === 0 ? false : selInGrn === grnItemKeys.length ? true : "partial";
                  return (
                    <Box key={grn.id} sx={{ mb: 0.5, border: "1px solid #e2e8f0", borderRadius: 2, overflow: "hidden" }}>
                      <Box
                        sx={{
                          display: "flex", alignItems: "center", gap: 1, px: 1.5, py: 0.75,
                          bgcolor: isSelected ? "#e3f2fd" : "#f8fafc",
                          cursor: "pointer", "&:hover": { bgcolor: isSelected ? "#bbdefb" : "#eef2ff" },
                        }}
                        onClick={function () { toggleExpand(grn.id); }}
                      >
                        <Checkbox size="small" checked={isSelected}
                          indeterminate={items.length > 0 && isSelected === "partial"}
                          onChange={function (e) { e.stopPropagation(); toggleSelectGrn(grn.id); }} />
                        <IconButton size="small" sx={{ p: 0.3 }}>
                          {isExpanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
                        </IconButton>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: "#1565c0", minWidth: 120, fontSize: "0.82rem" }}>
                          {grn.grn_no}
                        </Typography>
                        <Typography variant="body2" sx={{ color: "#64748b", minWidth: 100, fontSize: "0.78rem" }}>
                          {fmtDate(grn.grn_date)}
                        </Typography>
                        <Typography variant="body2" sx={{ color: "#334155", fontSize: "0.78rem" }}>
                          {grn.supplier?.supplier_name || "-"}
                        </Typography>
                        <Chip label={items.length + " item(s)"} size="small" sx={{ ml: "auto", fontSize: "0.7rem" }} />
                      </Box>

                      {isExpanded && (
                        <Box sx={{ px: 1.5, py: 0.5, bgcolor: "#fafcff" }}>
                          <Table size="small" sx={{ "& td, & th": { border: "1px solid #e0e0e0", px: 0.35, py: 0.2, fontSize: "0.68rem" } }}>
                            <TableHead>
                              <TableRow sx={{ bgcolor: "#f1f5f9" }}>
                                <TableCell sx={{ ...thSx, textAlign: "center", width: 28 }}>#</TableCell>
                                <TableCell sx={{ ...thSx, width: 28 }}></TableCell>
                                <TableCell sx={thSx}>Item Code</TableCell>
                                <TableCell sx={thSx}>Description</TableCell>
                                <TableCell sx={{ ...thSx, textAlign: "right" }}>Accp Qty</TableCell>
                                <TableCell sx={{ ...thSx, textAlign: "center" }}>UOM</TableCell>
                                <TableCell sx={{ ...thSx, textAlign: "right" }}>Rate</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {items.map(function (it, ii) {
                                var comp = computeItemDetails(it, grn);
                                var itemKey = getItemKey(grn.id, it.id || it.item_id);
                                var itemSel = Boolean(selectedItems[itemKey]);
                                return (
                                  <TableRow key={it.id || ii} hover sx={{ bgcolor: itemSel ? "#e8f5e9" : "inherit" }}>
                                    <TableCell sx={{ textAlign: "center", fontSize: "0.68rem", py: 0.2 }}>{ii + 1}</TableCell>
                                    <TableCell sx={{ textAlign: "center", py: 0.2 }}>
                                      <Checkbox size="small" checked={itemSel}
                                        onChange={function () { toggleSelectItem(grn.id, it.id || it.item_id); }} />
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 600, fontSize: "0.68rem", py: 0.2 }}>{it.item_code || "-"}</TableCell>
                                    <TableCell sx={{ fontSize: "0.68rem", py: 0.2 }}>{it.item_name || "-"}</TableCell>
                                    <TableCell sx={{ textAlign: "right", fontWeight: 600, fontSize: "0.68rem", py: 0.2 }}>{comp.qty.toFixed(2)}</TableCell>
                                    <TableCell sx={{ textAlign: "center", fontSize: "0.68rem", py: 0.2 }}>{it.uom || "-"}</TableCell>
                                    <TableCell sx={{ textAlign: "right", fontSize: "0.68rem", py: 0.2 }}>{comp.rate.toFixed(2)}</TableCell>
                                  </TableRow>
                                );
                              })}
                            </TableBody>
                          </Table>
                        </Box>
                      )}
                    </Box>
                  );
                })}
              </Box>
            </Box>
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
              <Button size="small" variant="outlined" startIcon={<AddCircleIcon />}
                onClick={function () { document.getElementById("grr-selection-card")?.scrollIntoView({ behavior: "smooth" }); }}
                sx={{ textTransform: "none", fontSize: "0.78rem" }}>
                Add More Items
              </Button>
            </Box>
            <Box sx={{ maxHeight: 380, overflow: "auto", mb: 2, border: "1px solid #e2e8f0", borderRadius: 2 }}>
              <Table size="small" sx={{ "& td, & th": { border: "1px solid #e0e0e0", px: 0.35, py: 0.25, fontSize: "0.68rem" } }}>
                <TableHead>
                  <TableRow sx={{ bgcolor: "#f1f5f9" }}>
                    <TableCell sx={{ ...thSx, width: 28 }}></TableCell>
                    <TableCell sx={{ ...thSx, width: 32 }}>
                      <Checkbox size="small" checked={billItems.every(function (it) { return it.selected; })} onChange={selectAllItems} />
                    </TableCell>
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
                      <TableRow key={idx} hover sx={{ bgcolor: it.selected ? "#f0fdf4" : "inherit" }}>
                        <TableCell sx={{ textAlign: "center", py: 0.25 }}>
                          {!isView && (
                            <IconButton size="small" onClick={function () { removeBillItem(idx); }} sx={{ p: 0.2, color: "#ef4444" }}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          )}
                        </TableCell>
                        <TableCell sx={{ textAlign: "center", py: 0.25 }}>
                          <Checkbox size="small" checked={it.selected} onChange={function () { if (!isView) { if (it.selected) removeBillItem(idx); else toggleItemSelect(idx); } }} />
                        </TableCell>
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