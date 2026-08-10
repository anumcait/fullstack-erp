import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  Box, Card, CardContent, Typography, TextField, Button, Chip, LinearProgress,
  Table, TableHead, TableRow, TableCell, TableBody, IconButton, Autocomplete,
  TableContainer, Alert, alpha,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SaveIcon from "@mui/icons-material/Save";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import PrintIcon from "@mui/icons-material/Print";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { useToast } from "../../../../context/ToastContext";
import ItemSelectDialog from "../ItemMaster/ItemSelectDialog";
import DeliveryChallanPreview from "./DeliveryChallanPreview";

const API = "/api/erp/stores/delivery-challans";
const ITEMS_API = "/api/erp/stores/items";
const NRGP_LIST = "/stores/non-returnable-gate-passes";
const MARKETING_ORDERS_API = "/api/erp/marketing/orders";
const QUALITY_INSPECTIONS_API = "/api/erp/quality/inspections";
const PRODUCTION_ENTRIES_API = "/api/erp/production/daily-entries";
const SUBCONTRACT_ORDERS_API = "/api/erp/subcontract/orders";

const DEPARTMENTS = ["Production", "Maintenance", "Quality", "Stores", "Engineering", "Planning", "Marketing", "HR", "Accounts", "Purchase", "Other"];
const NON_RETURN_TYPES = ["Sale", "Scrap", "Purchase Return", "Sample", "Donation", "Write-off", "Internal Transfer", "CSP", "Jobwork"];

// Non Returnable DCs use their own numeric numbering series (no prefix).
const DRAFT_PREFIX = "";

const blankItem = () => ({ tempId: Date.now() + Math.random(), wo_no: "", hs_code: "", item_id: "", item_code: "", item_name: "", uom: "", unit_id: "", qty: "", order_prod_qty: "", rate: "", remarks: "" });

const toIsoUtc = (localStr) => {
  if (!localStr) return null;
  const d = new Date(localStr);
  return isNaN(d) ? null : d.toISOString();
};

const toLocalInput = (iso) => {
  const d = new Date(iso);
  if (isNaN(d)) return "";
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};

const isSameDay = (a, b) => {
  const da = new Date(a);
  const db = new Date(b);
  return !isNaN(da) && !isNaN(db) && da.getFullYear() === db.getFullYear() && da.getMonth() === db.getMonth() && da.getDate() === db.getDate();
};

const fmtNum = (v) => {
  const n = Number(v);
  if (isNaN(n)) return "0";
  return n % 1 === 0 ? String(n) : n.toFixed(2).replace(/\.?0+$/, "");
};

const fmtInput = (v) => {
  if (v === null || v === undefined || v === "") return "";
  const n = Number(v);
  return isNaN(n) ? "" : String(n);
};

const pad2 = (n) => String(n).padStart(2, "0");
// Draft reference number = next real DC number (last + 1) + current time HHMMSS.
const draftRef = (lastNumber) => {
  const d = new Date();
  return `${DRAFT_PREFIX}${Number(lastNumber) + 1}${pad2(d.getHours())}${pad2(d.getMinutes())}${pad2(d.getSeconds())}`;
};

const validateItems = (items, showToast) => {
  const requiredFields = { wo_no: "Order No", hs_code: "HS Code", item_code: "Item Code", qty: "DC Qty", rate: "Rate" };
  for (let i = 0; i < items.length; i++) {
    const r = items[i];
    for (const [key, label] of Object.entries(requiredFields)) {
      const raw = r[key];
      if (raw === null || raw === undefined || String(raw).trim() === "") {
        showToast(`Row ${i + 1}: ${label} cannot be empty`, "warning");
        return false;
      }
    }
  }
  return true;
};

export default function NonReturnableChallanForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { showToast } = useToast();
  const [saving, setSaving] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [showPrint, setShowPrint] = useState(false);
  const [items, setItems] = useState([blankItem()]);
  const [masterItems, setMasterItems] = useState([]);
  const [marketingOrders, setMarketingOrders] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [qualityInspections, setQualityInspections] = useState([]);
  const [productionEntries, setProductionEntries] = useState([]);
  const [subcontractOrders, setSubcontractOrders] = useState([]);
  const [orderPicker, setOrderPicker] = useState(null);
  const [picker, setPicker] = useState(null);
  const [suppliers, setSuppliers] = useState([]);
  const [supplierPicker, setSupplierPicker] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [empPicker, setEmpPicker] = useState(false);
  const [focusedRow, setFocusedRow] = useState(null);
  const [focusedCol, setFocusedCol] = useState(null);
  const formRef = useRef(null);
  const gridRef = useRef(null);
  const pageRef = useRef(null);
  const [form, setForm] = useState({
    dc_type: "N",
    dc_date: new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16),
    dc_no: "",
    department: "",
    party_name: "",
    party_id: "",
    non_returnable_type: "",
    through: "",
    reference_no: "",
    authorization_ref: "",
    transfer_location: "",
    requested_by: "",
    prepared_by: localStorage.getItem("empId") || "",
  });

  const isEdit = Boolean(id) && window.location.pathname.includes('/edit/') && isSameDay(form.dc_date, new Date());
  const isView = Boolean(id) && (window.location.pathname.includes('/view/') || (window.location.pathname.includes('/edit/') && !isSameDay(form.dc_date, new Date())));
  const isDateLocked = Boolean(id) && window.location.pathname.includes('/edit/') && !isSameDay(form.dc_date, new Date());

  useEffect(() => {
    const stored = localStorage.getItem("empName") || localStorage.getItem("userName") || "";
    setForm((f) => ({ ...f, requested_by: stored }));
    const reqs = [
      axios.get(ITEMS_API, { params: { is_active: true } }).then(({ data }) => setMasterItems(data)).catch(() => []),
      axios.get("/api/erp/purchase/suppliers").then(({ data }) => setSuppliers(data)).catch(() => []),
      axios.get("/api/employees").then(({ data }) => setEmployees(Array.isArray(data) ? data : [])).catch(() => []),
      axios.get(MARKETING_ORDERS_API).then(({ data }) => setMarketingOrders(Array.isArray(data) ? data : [])).catch(() => []),
      axios.get("/api/erp/purchase/orders").then(({ data }) => setPurchaseOrders(Array.isArray(data) ? data : [])).catch(() => []),
      axios.get(QUALITY_INSPECTIONS_API).then(({ data }) => setQualityInspections(Array.isArray(data) ? data : [])).catch(() => []),
      axios.get(PRODUCTION_ENTRIES_API).then(({ data }) => setProductionEntries(Array.isArray(data) ? data : [])).catch(() => []),
      axios.get(SUBCONTRACT_ORDERS_API).then(({ data }) => setSubcontractOrders(Array.isArray(data) ? data : [])).catch(() => []),
    ];
    if (!id) reqs.push(axios.get(`${API}/next-number?dc_type=N`).then(({ data }) => setForm((f) => ({ ...f, dc_no: draftRef(data.last_number ?? "0") }))).catch(() => { }));
    Promise.all(reqs).finally(() => {
      if (!id) setInitialLoading(false);
    });
  }, []);

  // Field navigation with Tab / Enter / Arrow keys
  useEffect(() => {
    const handleKeyDown = (e) => {
      const active = document.activeElement;
      const isInput = active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.isContentEditable || active.getAttribute('tabindex') === '0';
      const dialogOpen = supplierPicker || empPicker || Boolean(picker) || Boolean(orderPicker);

      // Check if any Autocomplete dropdown is open - MUI uses portals with various selectors
      const autocompleteOpen = document.querySelector('[role="listbox"]') !== null ||
                               document.querySelector('.MuiAutocomplete-listbox') !== null ||
                               document.querySelector('.MuiAutocomplete-popper') !== null ||
                               document.querySelector('[data-mui-autocomplete-listbox]') !== null;

      // Check if active element is an Autocomplete input (more robust)
      const isAutocompleteInput = active?.closest('.MuiAutocomplete-root') !== null ||
                                  active?.getAttribute('role') === 'combobox' ||
                                  active?.classList.contains('MuiAutocomplete-input') ||
                                  active?.closest('[data-mui-autocomplete]') !== null;

      if (dialogOpen) return;
      if (autocompleteOpen) return; // Let Autocomplete handle keys for its open menu

      // If active is autocomplete input, let it handle ArrowUp/Down to avoid interfering with option navigation
      if (isAutocompleteInput && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
        return;
      }

      // Compute orderSrc dynamically
      const getOrderSrc = () => {
        const t = form.non_returnable_type;
        if (t === "Sale") return marketingOrders.length ? { rows: marketingOrders } : null;
        if (t === "Purchase Return") return purchaseOrders.length ? { rows: purchaseOrders } : null;
        if (t === "Scrap") return (qualityInspections.length || productionEntries.length) ? { rows: [] } : null;
        if (t === "Sample") return qualityInspections.length ? { rows: qualityInspections } : null;
        if (t === "CSP") return marketingOrders.length ? { rows: marketingOrders } : null;
        if (t === "Jobwork") return subcontractOrders.length ? { rows: subcontractOrders } : null;
        return null;
      };

      // F9 - open context picker
      if (e.key === 'F9') {
        e.preventDefault();
        if (focusedCol === 'party_name') setSupplierPicker(true);
        else if (focusedCol === 'item_code' || focusedCol === 'item_name') setPicker({ rowId: focusedRow });
        else if (focusedCol === 'requested_by') setEmpPicker(true);
        else if (focusedCol === 'wo_no' && getOrderSrc()) setOrderPicker({ rowId: focusedRow });
        return;
      }

      // Enter - move to next field (like Tab)
      if (e.key === 'Enter' && !e.shiftKey && isInput) {
        // Skip if active element is Autocomplete input - let it handle Enter for option selection
        if (isAutocompleteInput) return;
        
        e.preventDefault();
        const focusables = pageRef.current?.querySelectorAll(
          'input:not([disabled]):not([type="hidden"]), select:not([disabled]), button:not([disabled]):not([data-enter-skip]), [tabindex]:not([tabindex^="-"]):not([data-enter-skip]), textarea:not([disabled])'
        );
        if (focusables) {
          const idx = Array.from(focusables).findIndex(el => el === active || el.contains(active) || (el.shadowRoot && el.shadowRoot.contains(active)));
          if (idx >= 0 && idx < focusables.length - 1) {
            (focusables[idx + 1]).focus();
          }
        }
      }

      // Shift+Enter - move to previous field
      if (e.key === 'Enter' && e.shiftKey && isInput) {
        if (isAutocompleteInput) return;
        
        e.preventDefault();
        const focusables = pageRef.current?.querySelectorAll(
          'input:not([disabled]):not([type="hidden"]), select:not([disabled]), button:not([disabled]):not([data-enter-skip]), [tabindex]:not([tabindex^="-"]):not([data-enter-skip]), textarea:not([disabled])'
        );
        if (focusables) {
          const idx = Array.from(focusables).findIndex(el => el === active || el.contains(active) || (el.shadowRoot && el.shadowRoot.contains(active)));
          if (idx > 0) {
            (focusables[idx - 1]).focus();
          }
        }
      }

      // Grid row navigation with Arrow Down/Up (preserves column selection index)
      if (gridRef.current && (e.key === 'ArrowDown' || e.key === 'ArrowUp') && focusedRow) {
        const active = document.activeElement;
        const isInGrid = active.closest('tbody') !== null;
        const autocompleteOpen = document.querySelector('[role="listbox"]') !== null ||
                                 document.querySelector('.MuiAutocomplete-listbox') !== null ||
                                 document.querySelector('.MuiAutocomplete-popper') !== null ||
                                 document.querySelector('[data-mui-autocomplete-listbox]') !== null;
        if (!isInGrid || autocompleteOpen) return;
        
        const rows = gridRef.current.querySelectorAll('tbody tr[data-row-id]');
        if (rows.length) {
          e.preventDefault();
          const idx = Array.from(rows).findIndex(r => r.dataset.rowId === focusedRow);
          const nextIdx = e.key === 'ArrowDown' ? idx + 1 : idx - 1;
          if (nextIdx >= 0 && nextIdx < rows.length) {
            const nextRow = rows[nextIdx];
            const currentCell = active.closest('td');
            if (currentCell) {
              const currentCells = Array.from(active.closest('tr').querySelectorAll('td'));
              const colIdx = currentCells.indexOf(currentCell);
              if (colIdx >= 0) {
                const targetCell = nextRow.querySelectorAll('td')[colIdx];
                const nextInput = targetCell?.querySelector('input:not([disabled]), button:not([disabled]), [tabindex="0"]');
                if (nextInput) {
                  nextInput.focus();
                  setFocusedRow(nextRow.dataset.rowId);
                  return;
                }
              }
            }
            // Fallback to first focusable element of the row
            const nextInput = nextRow.querySelector('input:not([disabled]), button:not([disabled]), [tabindex="0"]');
            if (nextInput) {
              nextInput.focus();
              setFocusedRow(nextRow.dataset.rowId);
            }
          }
        }
      }

      // F2 - add new row
      if (e.key === 'F2' && !isView) {
        e.preventDefault();
        setItems(p => [...p, blankItem()]);
      }

      // Delete - remove focused row
      if (e.key === 'Delete' && !isView && focusedRow && active.closest('tbody')) {
        e.preventDefault();
        removeItem(focusedRow);
      }

      // Escape - close pickers
      if (e.key === 'Escape') {
        setSupplierPicker(false);
        setEmpPicker(false);
        setPicker(null);
        setOrderPicker(null);
      }
    };

    document.addEventListener('keydown', handleKeyDown, true); // capture phase
    return () => document.removeEventListener('keydown', handleKeyDown, true);
  }, [supplierPicker, empPicker, picker, orderPicker, focusedRow, focusedCol, isView, items, form.non_returnable_type]);

  useEffect(() => {
    if (!id) return;
    axios.get(`${API}/${id}`).then(({ data }) => {
      setForm({
        dc_type: "N",
        dc_date: data.dc_date ? toLocalInput(data.dc_date) : new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16),
        dc_no: data.dc_no || data.draft_no || "",
        department: data.department || "",
        party_name: data.party_name || "",
        party_id: String(data.party_id || ""),
        non_returnable_type: data.non_returnable_type || "",
        through: data.through || "",
        reference_no: data.reference_no || "",
        authorization_ref: data.authorization_ref || "",
        transfer_location: data.transfer_location || "",
        requested_by: data.requested_by || "",
        prepared_by: data.prepared_by || localStorage.getItem("empId") || "",
      });
      setItems(data.items?.length ? data.items.map((i) => ({
        tempId: Date.now() + Math.random(),
        wo_no: i.wo_no || "",
        hs_code: i.hs_code || "",
        item_id: i.item_id || "",
        item_code: i.item_code || "",
        item_name: i.item_name || "",
        uom: i.unit?.short_name || i.unit?.name || i.item?.unit?.short_name || i.item?.unit?.name || "",
        unit_id: i.unit_id || null,
        qty: fmtInput(i.quantity),
        order_prod_qty: fmtInput(i.order_prod_qty),
        rate: fmtInput(i.rate),
        remarks: i.remarks || "",
        auth_ref: i.auth_ref || i.authorization_ref || "",
      })) : [blankItem()]);
      if (!data.dc_no && !data.draft_no) {
        const last = Number(data.last_number ?? "0") + 1;
        const raw = data.updated_at || data.dc_date;
        const d = raw ? new Date(raw) : new Date();
        const src = isNaN(d) ? new Date() : d;
        setForm((f) => ({ ...f, dc_no: `${DRAFT_PREFIX}${last}${pad2(src.getHours())}${pad2(src.getMinutes())}${pad2(src.getSeconds())}` }));
      }
    }).catch(() => {
      showToast("Failed to load Non Returnable DC", "error");
      navigate(NRGP_LIST);
    }).finally(() => setInitialLoading(false));
  }, [id]);

  useEffect(() => {
    const handler = (e) => { if ((e.ctrlKey || e.metaKey) && e.key === "Enter") { e.preventDefault(); handleSave(); } };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [form, items]);

  const handleChange = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  const updateItem = (tempId, patch) => setItems((prev) => prev.map((r) => r.tempId === tempId ? { ...r, ...patch } : r));
  const removeItem = (tempId) => setItems((prev) => prev.filter((r) => r.tempId !== tempId));

  const pickSupplier = (s) => {
    if (!s) return;
    setForm((f) => ({ ...f, party_id: String(s.id), party_name: s.supplier_name || "" }));
    setSupplierPicker(false);
  };

  const pickEmployee = (e) => {
    if (!e) return;
    setForm((f) => ({ ...f, requested_by: e.ename || e.emp_name || e.name || "" }));
    setEmpPicker(false);
  };

  const pickItem = (sel) => {
    if (!sel) return;
    setItems((prev) => prev.map((r) => r.tempId === picker.rowId ? {
      ...r, item_id: sel.id, item_code: sel.item_code, item_name: sel.item_name,
      uom: sel.unit?.short_name || "", unit_id: sel.unit?.id || null,
      hs_code: sel.hsn_code || "",
    } : r));
    setPicker(null);
  };

  const applyOrder = (order) => {
    if (!order) { setOrderPicker(null); return; }
    const num = order.order_no || order.po_no || order.inspection_no || order.entry_no || "";
    const rows = (order.items || []).map((it) => ({
      ...blankItem(),
      wo_no: num,
      item_id: it.item_id || "",
      item_code: it.item_code || "",
      hs_code: it.hs_code || it.hsn_code || "",
      item_name: it.item_name || it.item_description || "",
      uom: it.unit?.short_name || it.unit?.name || it.unit || "",
      unit_id: it.unit_id || null,
      qty: fmtInput(it.quantity ?? it.rejected_qty ?? it.sample_qty ?? 0),
      order_prod_qty: fmtInput(it.quantity ?? it.rejected_qty ?? it.sample_qty ?? 0),
      rate: fmtInput(it.rate ?? it.unit_price ?? it.net_price ?? 0),
      auth_ref: (form.non_returnable_type === "Donation" || form.non_returnable_type === "Write-off") ? num : "",
    }));
    setItems(rows.length ? rows : [blankItem()]);
    setForm((f) => ({ ...f, reference_no: num }));
    setOrderPicker(null);
  };

  // The grid's "Order No" list selection is source-dependent on the DC purpose:
  const orderSrc = form.non_returnable_type === "Sale"
    ? {
      title: "Select Marketing PO / Order",
      rows: marketingOrders.map((o) => ({
        ...o, order_no: o.order_no || o.po_no,
        detail: o.customer?.customer_name || o.customer?.name || "",
      })),
      columns: [{ key: "order_no", label: "Order No" }, { key: "detail", label: "Customer" }],
    }
    : form.non_returnable_type === "Purchase Return"
      ? {
        title: "Select Purchase Order",
        rows: purchaseOrders.map((o) => ({
          ...o, order_no: o.po_no || o.order_no,
          detail: o.Supplier?.supplier_name || o.supplier_name || "",
        })),
        columns: [{ key: "order_no", label: "PO No" }, { key: "detail", label: "Supplier" }],
      }
      : form.non_returnable_type === "Scrap"
        ? {
          title: "Select Scrap Source (Quality Rejections + Production Rejections)",
          rows: [
            ...qualityInspections
              .filter((q) => Number(q.rejected_qty || 0) > 0)
              .map((q) => ({
                ...q,
                order_no: q.inspection_no,
                detail: `${q.inspection_type} · ${q.item_name} · Rejected: ${q.rejected_qty}`,
                items: [{
                  item_id: q.item_id,
                  item_code: q.item_code,
                  item_name: q.item_name,
                  unit: q.unit || "",
                  rejected_qty: q.rejected_qty,
                  hs_code: q.hsn_code || "",
                }],
              })),
            ...productionEntries
              .filter((p) => Number(p.rejected_qty || 0) > 0)
              .map((p) => ({
                ...p,
                order_no: `PROD-${p.id}`,
                detail: `${p.machine_name} · ${p.product_name} · Rejected: ${p.rejected_qty}`,
                items: [{
                  item_id: p.product_id || "",
                  item_code: p.product_code,
                  item_name: p.product_name,
                  unit: p.unit || "",
                  rejected_qty: p.rejected_qty,
                  hs_code: "",
                }],
              })),
          ],
          columns: [{ key: "order_no", label: "Source No" }, { key: "detail", label: "Details" }],
        }
        : form.non_returnable_type === "Sample"
          ? {
            title: "Select Sample Source (Quality Inspections)",
            rows: qualityInspections
              .filter((q) => q.inspection_type === "Incoming" || q.inspection_type === "Final")
              .map((q) => ({
                ...q,
                order_no: q.inspection_no,
                detail: `${q.inspection_type} · ${q.item_name} · Sample Qty: ${q.inspected_qty}`,
                items: [{
                  item_id: q.item_id,
                  item_code: q.item_code,
                  item_name: q.item_name,
                  unit: q.unit || "",
                  sample_qty: Math.min(1, q.inspected_qty || 1),
                  hs_code: q.hsn_code || "",
                }],
              })),
            columns: [{ key: "order_no", label: "Inspection No" }, { key: "detail", label: "Details" }],
          }
          : form.non_returnable_type === "Donation"
          ? {
              title: "Select Donation Approval",
              rows: marketingOrders
                .filter((o) => o.customer_supplied_parts || o.csp_flag)
                .map((o) => ({
                  ...o,
                  order_no: o.order_no,
                  detail: `${o.customer?.customer_name || o.customer?.name || ""} · Donation Approved`,
                  items: (o.items || []).map((it) => ({
                    item_id: it.item_id || "",
                    item_code: it.item_code || "",
                    item_name: it.item_description || it.item_name || "",
                    unit: it.unit || "",
                    quantity: it.quantity,
                    hs_code: it.hsn_code || "",
                  })),
                })),
              columns: [{ key: "order_no", label: "Approval No" }, { key: "detail", label: "Customer / Details" }],
            }
          : form.non_returnable_type === "Write-off"
            ? {
                title: "Select Write-off Approval",
                rows: marketingOrders
                  .filter((o) => o.customer_supplied_parts || o.csp_flag)
                  .map((o) => ({
                    ...o,
                    order_no: o.order_no,
                    detail: `${o.customer?.customer_name || o.customer?.name || ""} · Write-off Approved`,
                    items: (o.items || []).map((it) => ({
                      item_id: it.item_id || "",
                      item_code: it.item_code || "",
                      item_name: it.item_description || it.item_name || "",
                      unit: it.unit || "",
                      quantity: it.quantity,
                      hs_code: it.hsn_code || "",
                    })),
                  })),
                columns: [{ key: "order_no", label: "Approval No" }, { key: "detail", label: "Customer / Details" }],
              }
            : form.non_returnable_type === "CSP"
            ? {
              title: "Select Customer-Supplied Parts Source (Sales Orders)",
              rows: marketingOrders
                .filter((o) => o.customer_supplied_parts || o.csp_flag)
                .map((o) => ({
                  ...o,
                  order_no: o.order_no,
                  detail: `${o.customer?.customer_name || o.customer?.name || ""} · Parts Supplied`,
                  items: (o.items || []).map((it) => ({
                    item_id: it.item_id || "",
                    item_code: it.item_code || "",
                    item_name: it.item_description || it.item_name || "",
                    unit: it.unit || "",
                    quantity: it.quantity,
                    hs_code: it.hsn_code || "",
                  })),
                })),
              columns: [{ key: "order_no", label: "Order No" }, { key: "detail", label: "Customer / Details" }],
            }
            : form.non_returnable_type === "Jobwork"
              ? {
                title: "Select Jobwork Order (Subcontract Orders)",
                rows: subcontractOrders
                  .filter((o) => o.status !== "Closed")
                  .map((o) => ({
                    ...o,
                    order_no: o.order_no,
                    detail: `${o.vendor_name || ""} · Qty: ${o.total_qty}`,
                    items: (o.items || []).map((it) => ({
                      item_id: it.item_id || "",
                      item_code: it.item_code || "",
                      item_name: it.item_name || "",
                      unit: it.uom || "",
                      quantity: it.quantity,
                      hs_code: "",
                    })),
                  })),
                columns: [{ key: "order_no", label: "Subcontract Order No" }, { key: "detail", label: "Vendor / Details" }],
              }
              : null;

  const totalQty = items.reduce((s, r) => s + (Number(r.qty) || 0), 0);
  const totalValue = items.reduce((s, r) => s + (Number(r.rate) || 0) * (Number(r.qty) || 0), 0);
  const hsnCodesList = [...new Set(masterItems.map((m) => m.hsn_code).filter(Boolean))].sort();
  const accent = "#6d28d9";

  const handleSave = useCallback(async () => {
    if (isView) return;
    if (!form.department) { showToast("Select Dept Code", "warning"); return; }
    if (!form.party_name) { showToast("Select Party Name", "warning"); return; }
    if (!form.non_returnable_type) { showToast("Select Type", "warning"); return; }
    if (form.non_returnable_type === "Sale" && !form.reference_no) { showToast("Select Marketing PO / Order for Sale type", "warning"); return; }
    if ((form.non_returnable_type === "CSP" || form.non_returnable_type === "Jobwork") && !form.reference_no) { showToast(`Select ${form.non_returnable_type === "CSP" ? "Sales Order" : "Subcontract Order"} for ${form.non_returnable_type} type`, "warning"); return; }
    if ((form.non_returnable_type === "Donation" || form.non_returnable_type === "Write-off") && !items.some((r) => r.item_id && r.wo_no)) { showToast(`Select Order Reference for ${form.non_returnable_type === "Donation" ? "Donation" : "Write-off"} type`, "warning"); return; }
    if (form.non_returnable_type === "Internal Transfer" && !form.transfer_location) { showToast("Enter Transfer Target Location", "warning"); return; }
    if (!items.some((r) => r.item_id)) { showToast("Add at least one item", "warning"); return; }
    if (!validateItems(items.filter((r) => r.item_id), showToast)) return;
    setSaving(true);
    try {
      const payload = {
        ...form,
        dc_date: toIsoUtc(form.dc_date),
        party_id: Number(form.party_id) || null,
        dc_no: form.dc_no || undefined,
        draft_no: form.dc_no || undefined,
        non_returnable_type: form.non_returnable_type || null,
        through: form.through || null,
        reference_no: form.reference_no || null,
        authorization_ref: null,
        transfer_location: form.transfer_location || null,
        items: items.filter((r) => r.item_id).map(({ tempId, uom, qty, value, ...rest }) => ({ ...rest, quantity: qty, unit: uom })),
      };
      if (id && isEdit) {
        await axios.put(`${API}/${id}`, payload);
        showToast("Non Returnable DC updated", "success");
      } else {
        await axios.post(API, payload);
        showToast("Non Returnable DC saved as Draft", "success");
      }
      navigate(NRGP_LIST);
    } catch (e) {
      showToast(e.response?.data?.error || "Failed to save", "error");
    } finally { setSaving(false); }
  }, [form, items, id, isEdit, isView]);

  if (initialLoading) return <LinearProgress />;

const fsx = { "& .MuiInputBase-root": { fontSize: "0.88rem", height: 36, borderRadius: "6px" } };
  const tfsx = {
    "& .MuiInputBase-root": { fontSize: "0.82rem", height: 30 },
    "& .MuiOutlinedInput-notchedOutline": { border: "none" },
    "&:hover .MuiOutlinedInput-notchedOutline": { border: "none" },
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": { border: "none" },
  };

  const cardSx = {
    borderRadius: "10px",
    boxShadow: "0 2px 10px rgba(15,23,42,0.06)",
    border: "1px solid #cbd5e1",
    overflow: "hidden",
  };

  const ItemCellInput = ({ value, onChange, type = "text", align = "left", disabled, placeholder, tabIndex, onFocus }) => (
    <TextField size="small" type={type} inputMode={type === "text" ? undefined : "decimal"} value={value}
      onChange={onChange}
      inputProps={{ style: { textAlign: align, fontSize: "0.84rem" }, tabIndex: tabIndex ?? 0 }}
      disabled={disabled} placeholder={placeholder}
      onFocus={onFocus}
      sx={tfsx} />
  );

  const colWidths = [36, 170, 130, 95, 95, 200, 45, 75, 90, 80, 80, 85, 100, 32];

  return (
    <Box ref={pageRef} sx={{ p: 3, maxWidth: 1650, mx: "auto" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, flexWrap: "wrap", gap: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <IconButton onClick={() => navigate(NRGP_LIST)}><ArrowBackIcon /></IconButton>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>Non Returnable DC</Typography>
          <Chip label="N" size="small" sx={{ bgcolor: alpha(accent, 0.12), color: accent, fontWeight: 700 }} />
        </Box>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button variant="outlined" onClick={() => navigate(NRGP_LIST)}>Back</Button>
          {(isView || isEdit) && (
            <Button variant="outlined" startIcon={<PrintIcon />} onClick={() => setShowPrint(true)}>Print</Button>
          )}
          {!isView && (
            <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : id && isEdit ? "Update" : "Save Draft"}
            </Button>
          )}
        </Box>
      </Box>

      {isDateLocked && (
        <Alert severity="warning" sx={{ mb: 2, borderRadius: 2 }}>
          Editing is locked — this challan's date ({form.dc_date ? form.dc_date.slice(0, 10) : ""}) has passed. You can only view and print.
        </Alert>
      )}

<Card sx={cardSx}>
        <Box sx={{ px: 2.5, py: 1.2, bgcolor: "#f0f4f8", borderBottom: "1px solid #cbd5e1", display: "flex", alignItems: "center", gap: 1 }}>
          <Box sx={{ width: 3, height: 18, bgcolor: accent, borderRadius: 2 }} />
          <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: "0.85rem", color: "#0f172a", letterSpacing: "0.2px" }}>Header Information</Typography>
        </Box>
        <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }} ref={formRef}>
          <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", alignItems: "flex-start" }}>
            <Box sx={{ width: 180 }}>
              <Autocomplete size="small" options={DEPARTMENTS} value={form.department || ""}
                onChange={(_, v) => { setForm((f) => ({ ...f, department: v || "" })); setTimeout(() => { var el = document.querySelector('[tabIndex="2"]'); if (el) el.focus(); }, 0); }}
                disabled={isView}
                isOptionEqualToValue={(a, b) => a === b}
                getOptionLabel={(opt) => opt}
                renderInput={(p) => <TextField {...p} label="Department *" autoFocus sx={fsx} inputProps={{ ...p.inputProps, tabIndex: 1 }} onFocus={(e) => { p.onFocus?.(e); setFocusedCol('department'); setFocusedRow(null); }} />} />
            </Box>
            <Box sx={{ flex: "1 1 220px", minWidth: 200 }}>
              <TextField size="small" fullWidth label="Supplier *" value={form.party_name}
                onChange={(e) => setForm((f) => ({ ...f, party_name: e.target.value }))}
                onKeyDown={(e) => { if (!isView && (e.key === "F9" || e.key === "ArrowDown")) { e.preventDefault(); setSupplierPicker(true); } }}
                disabled={isView}
                InputProps={{
                  endAdornment: !isView ? (
                    <IconButton size="small" data-enter-skip onClick={() => setSupplierPicker(true)} edge="end" sx={{ p: 0.3 }}><SearchIcon sx={{ fontSize: 16 }} /></IconButton>
                  ) : undefined,
                }} sx={fsx} inputProps={{ tabIndex: 2 }} onFocus={() => { setFocusedCol('party_name'); setFocusedRow(null); }} />
              {form.party_id && ((s) => {
                if (!s) return null;
                const addr = [s.address_line1, s.address_line2, s.city, s.state, s.pincode].filter(Boolean).join(", ");
                return (
                  <Box sx={{ mt: 0.5, px: 1.5, py: 0.75, bgcolor: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                    <Typography variant="caption" sx={{ color: "#64748b", fontSize: "0.7rem", lineHeight: 1.4 }}>
                      {s.supplier_name}{s.gstin ? " | GST: " + s.gstin : ""}
                      {addr ? <><br />{addr}</> : ""}
                      {s.phone || s.mobile ? <><br />Ph: {s.phone || s.mobile}</> : ""}
                    </Typography>
                  </Box>
                );
              })(suppliers.find((x) => String(x.id) === form.party_id))}
            </Box>
            <Box sx={{ width: 110 }}>
              <TextField size="small" label="DC #" fullWidth value={form.dc_no} disabled sx={{ ...fsx, "& .Mui-disabled": { WebkitTextFillColor: "#64748b !important", fontWeight: 600, bgcolor: "#f8fafc" } }} inputProps={{ tabIndex: -1 }} />
            </Box>
            <Box sx={{ width: 180 }}>
              <TextField size="small" label="DC Date" type="datetime-local" fullWidth value={form.dc_date} disabled InputLabelProps={{ shrink: true }} sx={{ ...fsx, "& .Mui-disabled": { WebkitTextFillColor: "#64748b !important", fontWeight: 600, bgcolor: "#f8fafc" } }} inputProps={{ tabIndex: -1 }} onFocus={() => { setFocusedCol('dc_date'); setFocusedRow(null); }} />
            </Box>
            <Box sx={{ flex: "1 1 150px", minWidth: 130 }}>
              <TextField size="small" label="Requested By" fullWidth value={form.requested_by}
                onChange={(e) => setForm((f) => ({ ...f, requested_by: e.target.value }))}
                onKeyDown={(e) => { if (!isView && (e.key === "F9" || e.key === "ArrowDown")) { e.preventDefault(); setEmpPicker(true); } }}
                disabled={isView}
                InputProps={{
                  endAdornment: !isView ? (
                    <IconButton size="small" data-enter-skip onClick={() => setEmpPicker(true)} edge="end" sx={{ p: 0.3 }}><SearchIcon sx={{ fontSize: 16 }} /></IconButton>
                  ) : undefined,
                }} sx={fsx} inputProps={{ tabIndex: -1 }} data-enter-skip onFocus={() => { setFocusedCol('requested_by'); setFocusedRow(null); }} />
            </Box>
            <Box sx={{ width: 120 }}>
              <TextField size="small" label="Prepared By" fullWidth value={form.prepared_by} disabled sx={fsx} inputProps={{ tabIndex: -1 }} onFocus={() => { setFocusedCol('prepared_by'); setFocusedRow(null); }} />
            </Box>
          </Box>
          <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", alignItems: "flex-start", mt: 2 }}>
            <Box sx={{ width: 180 }}>
              <Autocomplete size="small" options={NON_RETURN_TYPES} value={form.non_returnable_type || ""}
                onChange={(_, v) => { 
                  setForm((f) => {
                    const nextForm = { ...f, non_returnable_type: v || "" };
                    return nextForm;
                  }); 
                  setTimeout(() => { const nextTab = (v === "Donation" || v === "Write-off" || v === "Internal Transfer") ? 4 : 5; var el = document.querySelector(`[tabIndex="${nextTab}"]`); if (el) el.focus(); }, 0); 
                }}
                disabled={isView}
                isOptionEqualToValue={(a, b) => a === b}
                getOptionLabel={(opt) => opt}
                renderInput={(p) => <TextField {...p} label="Type *" sx={fsx} inputProps={{ ...p.inputProps, tabIndex: 3 }} onFocus={(e) => { p.onFocus?.(e); setFocusedCol('non_returnable_type'); setFocusedRow(null); }} />} />
            </Box>
            {form.non_returnable_type === "Internal Transfer" && (
              <Box sx={{ width: 220 }}>
                <TextField size="small" label="Transfer To Location" fullWidth value={form.transfer_location || ""}
                  onChange={(e) => setForm((f) => ({ ...f, transfer_location: e.target.value }))} disabled={isView} sx={fsx} inputProps={{ tabIndex: 4 }}
                  placeholder="Target Warehouse/Location" onFocus={() => { setFocusedCol('transfer_location'); setFocusedRow(null); }} />
              </Box>
            )}
            <Box sx={{ width: 220 }}>
              <TextField size="small" label="Through" fullWidth value={form.through}
                onChange={handleChange("through")} disabled={isView} sx={fsx} inputProps={{ tabIndex: 5 }}
                placeholder="Through whom/by" onFocus={() => { setFocusedCol('through'); setFocusedRow(null); }} />
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Card sx={{ borderRadius: "10px", boxShadow: "0 2px 12px rgba(0,0,0,0.07)", border: "1px solid #cbd5e1", overflow: "hidden" }}>
        <Box sx={{ px: 2.5, py: 1.2, bgcolor: "#f0f4f8", borderBottom: "1px solid #cbd5e1", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box sx={{ width: 3, height: 18, bgcolor: accent, borderRadius: 2 }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: "0.85rem", color: "#0f172a", letterSpacing: "0.2px" }}>Item Details</Typography>
          </Box>
          <Typography variant="caption" sx={{ color: "#94a3b8", fontSize: "0.7rem" }}>
            {isView ? "View Only" : "F9 / double-click on Code/Desc to pick item"}
          </Typography>
        </Box>
        <CardContent sx={{ p: "0 !important" }}>
          <TableContainer ref={gridRef} sx={{ maxHeight: 480, overflow: "auto" }}>
            <Table size="small" stickyHeader sx={{ borderCollapse: "separate", borderSpacing: 0 }}>
              <TableHead>
                <TableRow>
                  {["No", "Order No", "Order Ref", "HS Code", "Item Code", "Item Description", "Uom", "DC Qty", "Order/Prod Qty", "Remain Qty", "Rate", "Value", "Rmks", ""].map((label, i) => (
                    <TableCell key={label} sx={{
                      fontWeight: 700, fontSize: "0.72rem", py: 0.8, px: 0.6,
                      color: "#1e293b", bgcolor: "#e2e8f0", border: "1px solid #cbd5e1",
                      borderBottom: "2px solid #94a3b8", position: "sticky", top: 0, zIndex: 2,
                      width: colWidths[i], minWidth: colWidths[i], whiteSpace: "nowrap",
                      textTransform: "uppercase", letterSpacing: "0.3px",
                      textAlign: i === 0 || i === 3 || i === 4 || i === 11 ? "left" : "center",
                      verticalAlign: "middle",
                    }}>{label}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {items.map((r, idx) => {
                  const rowBg = idx % 2 === 0 ? "#ffffff" : "#f8fafc";
                  const cs = { py: 0.4, px: 0.4, border: "1px solid #e2e8f0", bgcolor: rowBg, fontSize: "0.84rem", verticalAlign: "middle" };
                  const remain = (Number(r.order_prod_qty) || 0) - (Number(r.qty) || 0);
                  return (
                    <TableRow key={r.tempId} hover sx={{ verticalAlign: "top" }} data-row-id={r.tempId}
                      onMouseEnter={() => setFocusedRow(r.tempId)} onFocus={() => setFocusedRow(r.tempId)}>
                      <TableCell sx={{ ...cs, textAlign: "center", verticalAlign: "middle", fontWeight: 600, color: "#64748b", fontSize: "0.8rem" }}>{idx + 1}</TableCell>
                      <TableCell sx={{ ...cs, whiteSpace: "nowrap" }}>
                        {orderSrc ? (
                          <Box tabIndex={isView ? -1 : (idx === 0 ? 6 : 0)}
                            onFocus={() => { setFocusedCol('wo_no'); setFocusedRow(r.tempId); }}
                            sx={{ display: "flex", alignItems: "center", gap: 0.3, minHeight: 30, cursor: "pointer", outline: "none", "&:focus": { boxShadow: "0 0 0 2px #c4b5fd", borderRadius: "4px" } }}
                            onKeyDown={(e) => { if (!isView && (e.key === "F9" || e.key === "ArrowDown")) { e.preventDefault(); setOrderPicker({ rowId: r.tempId }); } }}
                            onDoubleClick={() => !isView && setOrderPicker({ rowId: r.tempId })}>
                            <Typography variant="body2" noWrap sx={{ flex: 1, fontSize: "0.84rem", fontWeight: 600, color: r.wo_no ? "inherit" : "#94a3b8" }}>
                              {r.wo_no || "Select"}
                            </Typography>
                            {!isView && (
                              <IconButton size="small" data-enter-skip sx={{ p: 0.2 }} onClick={() => setOrderPicker({ rowId: r.tempId })}><ArrowDropDownIcon sx={{ fontSize: 18 }} /></IconButton>
                            )}
                          </Box>
                        ) : (
                          <ItemCellInput value={r.wo_no} onChange={(e) => updateItem(r.tempId, { wo_no: e.target.value })} disabled={isView} placeholder="WO#/CSM/MRR" onFocus={() => { setFocusedCol('wo_no'); setFocusedRow(r.tempId); }} tabIndex={idx === 0 ? 6 : 0} />
                        )}
                      </TableCell>
                      <TableCell sx={{ ...cs, textAlign: "center", fontWeight: 600, color: (form.non_returnable_type === "Donation" || form.non_returnable_type === "Write-off") ? "#1e293b" : "#94a3b8" }}>
                        {(form.non_returnable_type === "Donation" || form.non_returnable_type === "Write-off") ? r.wo_no || "—" : "—"}
                      </TableCell>
                      <TableCell sx={cs}>
                        <Autocomplete size="small" freeSolo options={hsnCodesList} value={r.hs_code}
                          onChange={(_, v) => updateItem(r.tempId, { hs_code: v || "" })}
                          onInputChange={(_, v) => updateItem(r.tempId, { hs_code: v || "" })} disabled={isView}
                          renderInput={(p) => <TextField {...p} sx={tfsx} onFocus={() => { setFocusedCol('hs_code'); setFocusedRow(r.tempId); }} />} />
                      </TableCell>
                      <TableCell sx={{ ...cs, fontWeight: 600 }} onKeyDown={(e) => { if (!isView && (e.key === "F9" || e.key === "ArrowDown")) { e.preventDefault(); setPicker({ rowId: r.tempId }); } }}>
                        <Box tabIndex={isView ? -1 : 0}
                          onFocus={() => { setFocusedCol('item_code'); setFocusedRow(r.tempId); }}
                          sx={{ display: "flex", alignItems: "center", gap: 0.3, minHeight: 30, cursor: "pointer", outline: "none", "&:focus": { boxShadow: "0 0 0 2px #c4b5fd", borderRadius: "4px" } }}
                          onDoubleClick={() => !isView && setPicker({ rowId: r.tempId })}>
                          <Typography variant="body2" sx={{ fontSize: "0.84rem", fontWeight: 600, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.item_code}</Typography>
                          {!isView && (
                            <IconButton size="small" data-enter-skip sx={{ p: 0.2 }} onClick={() => setPicker({ rowId: r.tempId })}><ArrowDropDownIcon sx={{ fontSize: 18 }} /></IconButton>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell sx={cs} onKeyDown={(e) => { if (!isView && (e.key === "F9" || e.key === "ArrowDown")) { e.preventDefault(); setPicker({ rowId: r.tempId }); } }}>
                        <Box tabIndex={isView ? -1 : 0}
                          onFocus={() => { setFocusedCol('item_name'); setFocusedRow(r.tempId); }}
                          sx={{ minHeight: 30, lineHeight: "30px", fontSize: "0.84rem", outline: "none", "&:focus": { boxShadow: "0 0 0 2px #c4b5fd", borderRadius: "4px" } }}
                          onDoubleClick={() => !isView && setPicker({ rowId: r.tempId })}>{r.item_name || "-"}</Box>
                      </TableCell>
                      <TableCell sx={{ ...cs, textAlign: "center", color: "#475569" }}>{r.uom}</TableCell>
                      <TableCell sx={{ ...cs, textAlign: "right" }}>
                        <ItemCellInput type="number" align="right" value={r.qty} onChange={(e) => updateItem(r.tempId, { qty: e.target.value })} disabled={isView} onFocus={() => { setFocusedCol('qty'); setFocusedRow(r.tempId); }} />
                      </TableCell>
                      <TableCell sx={{ ...cs, textAlign: "right" }}>
                        <ItemCellInput type="number" align="right" value={r.order_prod_qty} onChange={(e) => updateItem(r.tempId, { order_prod_qty: e.target.value })} disabled={isView} onFocus={() => { setFocusedCol('order_prod_qty'); setFocusedRow(r.tempId); }} />
                      </TableCell>
                      <TableCell sx={{ ...cs, textAlign: "right", verticalAlign: "middle", fontWeight: 600, color: remain < 0 ? "#dc2626" : "#0f172a" }}>
                        {fmtNum(remain)}
                      </TableCell>
                      <TableCell sx={{ ...cs, textAlign: "right" }}>
                        <ItemCellInput type="number" align="right" value={r.rate} onChange={(e) => updateItem(r.tempId, { rate: e.target.value })} disabled={isView} onFocus={() => { setFocusedCol('rate'); setFocusedRow(r.tempId); }} />
                      </TableCell>
                      <TableCell sx={{ ...cs, textAlign: "right", verticalAlign: "middle", fontWeight: 700, color: "#059669" }}>
                        {fmtNum((Number(r.qty) || 0) * (Number(r.rate) || 0))}
                      </TableCell>
                      <TableCell sx={cs}>
                        <ItemCellInput value={r.remarks} onChange={(e) => updateItem(r.tempId, { remarks: e.target.value })} disabled={isView} placeholder="Remarks" onFocus={() => { setFocusedCol('remarks'); setFocusedRow(r.tempId); }} />
                      </TableCell>
                      <TableCell sx={{ ...cs, textAlign: "center" }}>
                        {!isView && (
                          <IconButton size="small" color="error" data-enter-skip onClick={() => removeItem(r.tempId)}><DeleteIcon sx={{ fontSize: 16 }} /></IconButton>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 3, px: 2, py: 1, bgcolor: "#f0f4f8", borderTop: "1px solid #cbd5e1" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.8, px: 1.5, py: 0.5, bgcolor: "#dcfce7", borderRadius: "6px", border: "1px solid #86efac" }}>
              <Typography variant="body2" sx={{ fontWeight: 700, fontSize: "0.85rem", color: "#065f46" }}>Total Qty</Typography>
              <Typography variant="h6" sx={{ fontWeight: 800, fontSize: "1.1rem", color: "#052e16", fontFamily: "monospace", minWidth: 100, textAlign: "right" }}>{fmtNum(totalQty)}</Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.8, px: 1.5, py: 0.5, bgcolor: "#dbeafe", borderRadius: "6px", border: "1px solid #93c5fd" }}>
              <Typography variant="body2" sx={{ fontWeight: 700, fontSize: "0.85rem", color: "#1e40af" }}>Total Value</Typography>
              <Typography variant="h6" sx={{ fontWeight: 800, fontSize: "1.1rem", color: "#172554", fontFamily: "monospace", minWidth: 120, textAlign: "right" }}>{fmtNum(totalValue)}</Typography>
            </Box>
          </Box>
          {!isView && (
            <Box sx={{ px: 2, py: 1, borderTop: "1px solid #e2e8f0", bgcolor: "#fafafa" }}>
              <Button size="small" startIcon={<AddCircleOutlineIcon />} onClick={() => setItems((p) => [...p, blankItem()])}
                sx={{ textTransform: "none", fontWeight: 600, fontSize: "0.84rem", color: accent }}>Add Item</Button>
            </Box>
          )}
        </CardContent>
      </Card>

      <ItemSelectDialog
        open={Boolean(picker)} title="Select Item"
        data={[...masterItems].sort((a, b) => a.id - b.id).map((m) => ({ ...m, group_name: m.category?.name || m.group?.name || "-" }))}
        columns={[
          { key: "item_code", label: "Code" },
          { key: "item_name", label: "Name" },
          { key: "current_stock", label: "Stock" },
          { key: "group_name", label: "Group" },
        ]}
        onClose={() => setPicker(null)}
        onSelect={(it) => pickItem(it)}
      />
      <ItemSelectDialog
        open={supplierPicker} title="Select Supplier"
        data={suppliers}
        columns={[
          { key: "supplier_name", label: "Name" },
          { key: "gstin", label: "GST" },
          { key: "city", label: "City" },
        ]}
        onClose={() => setSupplierPicker(false)}
        onSelect={(s) => pickSupplier(s)}
      />
      <ItemSelectDialog
        open={empPicker} title="Select Employee"
        data={employees}
        columns={[
          { key: "empid", label: "Emp ID" },
          { key: "ename", label: "Name" },
          { key: "deptname", label: "Department" },
        ]}
        onClose={() => setEmpPicker(false)}
        onSelect={(e) => pickEmployee(e)}
      />
      {orderSrc && (
        <ItemSelectDialog
          open={Boolean(orderPicker)} title={orderSrc.title}
          data={orderSrc.rows}
          columns={orderSrc.columns}
          onClose={() => setOrderPicker(null)}
          onSelect={(o) => applyOrder(o)}
        />
      )}
      {showPrint && <DeliveryChallanPreview data={{ ...form, items: items.filter((r) => r.item_id), supplier: suppliers.find((x) => String(x.id) === form.party_id) }} onClose={() => setShowPrint(false)} />}
    </Box>
  );
}