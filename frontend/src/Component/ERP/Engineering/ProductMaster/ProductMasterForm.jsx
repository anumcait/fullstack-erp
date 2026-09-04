import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { useParams, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import {
  Box, Typography, Card, CardContent, TextField, Button, IconButton,
  MenuItem, LinearProgress, Switch, FormControlLabel, Autocomplete, Chip,
  Alert, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions,
  Tabs, Tab, Grid, Divider, Paper
} from '@mui/material';
import { createFilterOptions } from '@mui/material/Autocomplete';
import '../../../Common/SmartTable.css';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LayersIcon from '@mui/icons-material/Layers';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import SettingsIcon from '@mui/icons-material/Settings';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import PrecisionManufacturingIcon from '@mui/icons-material/PrecisionManufacturing';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

import axios from 'axios';
import { useToast } from '../../../../context/ToastContext';
import CountedTextArea from '../../../Common/CountedTextArea';

const API = '/api/erp/engineering/products';
const ITEMS_API = '/api/erp/stores/items';
const CATEGORIES_API = '/api/erp/engineering/categories';
const BOM_API = '/api/erp/engineering/bom';

const PRODUCT_TYPES = ['FG', 'SFG', 'Assembly', 'Spare'];
const FINISH_TYPES = ['Paint', 'Powder Coat', 'Anodized', 'Polished', 'Raw', 'Galvanized'];

// Cap the item-code dropdown to 50 matches and search by code + name so the
// (potentially large) item master doesn't get re-filtered/rendered on every render.
const ITEM_FILTER = createFilterOptions({ stringify: (o) => `${o.item_code} ${o.item_name} ${o.item_description || ''}` });
const cap = (opts, state) => ITEM_FILTER(opts, state).slice(0, 50);
const PRODUCT_FILTER = createFilterOptions({ stringify: (o) => `${o.product_code || o.product_uid || ''} ${o.part_name || ''}` });
const capProduct = (opts, state) => PRODUCT_FILTER(opts, state).slice(0, 50);
const NODE_TYPES = [
  { value: 'ROOT', label: 'ROOT (Finished Product)' },
  { value: 'ASSEMBLY', label: 'ASSEMBLY (Manufactured)' },
  { value: 'SUB_ASSEMBLY', label: 'SUB ASSEMBLY' },
  { value: 'PHANTOM', label: 'PHANTOM (Non-stocked)' },
  { value: 'SKU', label: 'SKU (Leaf)' },
];

/* ── Custom Styled Components & Styles ── */
const gradientHeader = {
  background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
  color: '#0f172a',
  p: 3,
  borderRadius: 3,
  mb: 3,
  boxShadow: '0 4px 15px rgba(100,116,139,0.06)',
  border: '1px solid #e2e8f0',
  borderLeft: '6px solid var(--primary-color, #0b3c91)',
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: 2,
};

const guideCard = {
  background: '#f0f9ff',
  border: '1px solid #bae6fd',
  borderRadius: 3,
  p: 2.5,
  mb: 3.5,
};

const cardLayout = {
  borderRadius: 2,
  boxShadow: 'none',
  border: '1px solid #e2e8f0',
  overflow: 'hidden',
  mb: 3,
};

export default function ProductMasterForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { showToast } = useToast();

  const isView = location.pathname.includes('/view/');
  const isEdit = location.pathname.includes('/edit/');
  const presetNodeType = ['ROOT', 'ASSEMBLY', 'SUB_ASSEMBLY', 'PHANTOM', 'SKU'].includes(searchParams.get('node'))
    ? searchParams.get('node') : 'SKU';

  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [showGuide, setShowGuide] = useState(false);
  // Tracks unsaved edits so we can warn before leaving and prevent silent data loss.
  const [dirty, setDirty] = useState(false);
  // Refs for dual-scrollbar (top + bottom) on the BOM table.
  const topScrollRef = useRef(null);
  const bomScrollRef = useRef(null);
  const bomTableRef = useRef(null);
  const [bomPage, setBomPage] = useState(0);
  const [bomRowsPerPage, setBomRowsPerPage] = useState(25);
  const [bomCollapsed, setBomCollapsed] = useState({});
  const [bomFilters, setBomFilters] = useState({});

  const [itemMasterList, setItemMasterList] = useState([]);

  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [productList, setProductList] = useState([]);
  const [bomOptions, setBomOptions] = useState([]);
  const [usedIn, setUsedIn] = useState([]);
  const [itemDialog, setItemDialog] = useState({ open: false, targetTempId: null, code: '', name: '', make_buy: 'Buy', description: '', unit_id: '', hsn_code: '', gst_rate: '', saving: false, error: '' });
  const [editItemDialog, setEditItemDialog] = useState({ open: false, id: null, code: '', name: '', description: '', unit_id: '', hsn_code: '', gst_rate: '', saving: false, error: '' });
  const [units, setUnits] = useState([]);
  const [groups, setGroups] = useState([]);

  const [form, setForm] = useState({
    product_uid: '', product_type: 'FG', main_category_name: '', sub_category_name: '',
    product_code: '', part_name: '', color: '', item_id: '', description: '', finish_type: '',
    assembly_qty: 1, qty_per_pallet: 0, is_active: true,
    node_type: presetNodeType, parent_id: '', sort_order: 0, drawing_no: '', revision: '',
    default_bom_id: '',
  });

  // Tree of item codes belonging to *linked* sub-assemblies (component_product_id),
  // fetched on demand so a sub-assembly's own components render inline (recursively).
  const [linkedTrees, setLinkedTrees] = useState({});

  const fetchLinkedTree = (productId) => {
    if (!productId || linkedTrees[productId]) return;
    axios.get(`${API}/${productId}/bom-tree`)
      .then(({ data }) => setLinkedTrees((m) => ({ ...m, [productId]: Array.isArray(data) ? data : [] })))
      .catch(() => { });
  };

  useEffect(() => {
    const ids = items.map((i) => i.component_product_id).filter(Boolean).map(Number);
    [...new Set(ids)].forEach(fetchLinkedTree);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  // Warn the browser before an accidental unload (close tab / refresh) with unsaved edits.
  useEffect(() => {
    if (!dirty) return undefined;
    const handler = (e) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [dirty]);

  // Sync the top mirror scrollbar width to actual table scroll-width.
  useEffect(() => {
    if (bomTableRef.current && topScrollRef.current) {
      const inner = topScrollRef.current.querySelector('.smart-table-top-scroll-inner');
      if (inner) inner.style.width = `${bomTableRef.current.scrollWidth}px`;
    }
  });
  const syncBomTopScroll = useCallback(() => {
    if (bomScrollRef.current) bomScrollRef.current.scrollLeft = topScrollRef.current.scrollLeft;
  }, []);
  const syncBomBottomScroll = useCallback(() => {
    if (topScrollRef.current) topScrollRef.current.scrollLeft = bomScrollRef.current.scrollLeft;
  }, []);

  const isSubAssembly = ['SUB_ASSEMBLY', 'PHANTOM'].includes(form.node_type);
  const readOnly = isView;
  const titlePrefix = isView ? 'View' : isEdit ? 'Edit' : 'New';

  const mainOptions = categories.filter((c) => c.type === 'Main').map((c) => c.name);
  const subOptions = categories
    .filter((c) => c.type === 'Sub' && (!form.main_category_name || (c.parent && c.parent.name === form.main_category_name)))
    .map((c) => c.name);
  const subAssemblyProducts = productList.filter(
    (p) => ['SUB_ASSEMBLY', 'PHANTOM'].includes(p.node_type) && String(p.id) !== String(id)
  );

  /* Make items choices search-friendly — hide inactive duplicates */
  const itemOptions = useMemo(() =>
    itemMasterList.filter((im) => im.is_active !== false).map((im) => ({
      id: im.id,
      label: `${im.item_code} — ${im.item_name} ${im.unit?.short_name ? `(${im.unit.short_name})` : ''}`,
      item_code: im.item_code,
      item_name: im.item_name,
      item_description: im.item_description || '',
      unit_id: im.unit_id,
    })),
    [itemMasterList]);

  useEffect(() => {
    axios.get(ITEMS_API).then(({ data }) => setItemMasterList(data)).catch(() => { });
    axios.get(CATEGORIES_API).then(({ data }) => setCategories(data)).catch(() => { });
    axios.get(API).then(({ data }) => setProductList(Array.isArray(data) ? data : (data?.rows || []))).catch(() => { });

    if (id) {
      setLoading(true);
      axios.get(`${API}/${id}`).then(({ data }) => {
        const category = data.category;
        setForm({
          product_uid: data.product_uid || '', product_type: data.product_type || 'FG',
          main_category_name: category && category.parent ? category.parent.name : '',
          sub_category_name: category ? category.name : '',
          product_code: data.product_code || '', part_name: data.part_name || '',
          color: data.color || '', item_id: data.item_id || '', description: data.description || '',
          finish_type: data.finish_type || '', assembly_qty: data.assembly_qty || 0,
          qty_per_pallet: data.qty_per_pallet || 0, is_active: data.is_active !== false,
          node_type: data.node_type || 'SKU', parent_id: data.parent_id || '',
          sort_order: data.sort_order || 0, drawing_no: data.drawing_no || '',
          revision: data.revision || '', default_bom_id: data.default_bom_id || '',
        });

        // Map server components to visual nested tree rows
        const dbToTemp = {};
        let ctr = Date.now();
        const loaded = (data.items || []).map((i) => {
          const t = 't' + (ctr++);
          dbToTemp[i.id] = t;
          return {
            tempId: t, parentTempId: null,
            serial_no: i.serial_no != null ? i.serial_no : null,
            item_id: i.item_id || '', item_code: i.item_code || '', item_name: i.item_name || '',
            quantity: i.quantity || 1, unit_id: i.unit_id || '', wastage_percent: i.wastage_percent || 0,
            is_subassembly: !!i.is_subassembly, component_product_id: i.component_product_id || '',
            remark: i.remark || '', color: i.color || '', item_description: i.item_description || '',
          };
        });
        loaded.forEach((n, idx) => {
          const p = data.items[idx] && data.items[idx].parent_item_id;
          if (p && dbToTemp[p]) n.parentTempId = dbToTemp[p];
        });
        setItems(loaded);
      }).catch(() => showToast('Failed to load product details', 'error'))
        .finally(() => setLoading(false));

      axios.get(`${BOM_API}?product_id=${id}`).then(({ data }) => {
        const list = Array.isArray(data) ? data : (data?.rows || []);
        setBomOptions(list.filter((b) => String(b.product_id) === String(id)));
      }).catch(() => { });
    }
  }, [id]);

  useEffect(() => {
    if (id && isSubAssembly) {
      axios.get(`${API}/${id}/used-in`).then(({ data }) => setUsedIn(Array.isArray(data) ? data : [])).catch(() => setUsedIn([]));
    } else {
      setUsedIn([]);
    }
  }, [id, isSubAssembly]);

  const handleChange = (field) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [field]: val }));
    setDirty(true);
  };

  const [compDialog, setCompDialog] = useState({ open: false, mode: 'add', targetTempId: null, parentTempId: null, draft: null });

  const blankDraft = (parentTempId) => ({
    tempId: Date.now() + Math.random(),
    parentTempId: parentTempId ?? null,
    serial_no: parentTempId == null ? items.filter((p) => p.parentTempId == null).length + 1 : null,
    item_id: '', item_code: '', item_name: '', quantity: 1, wastage_percent: 0,
    is_subassembly: false, component_product_id: '', remark: '', color: '', item_description: '',
  });

  const openAddComponent = (parentTempId = null) =>
    setCompDialog({ open: true, mode: 'add', targetTempId: null, parentTempId, draft: blankDraft(parentTempId) });

  const openEditComponent = (it) =>
    setCompDialog({ open: true, mode: 'edit', targetTempId: it.tempId, parentTempId: it.parentTempId, draft: { ...it } });

  const saveComponent = () => {
    const d = compDialog.draft;
    // Duplicate check within the same group: same item (or same linked sub-assembly)
    // already present -> warn and do not add a redundant row.
    const dup = items.some((i) => {
      if (compDialog.mode === 'edit' && i.tempId === compDialog.targetTempId) return false;
      if ((i.parentTempId ?? null) !== (d.parentTempId ?? null)) return false;
      if (d.component_product_id) {
        return String(i.component_product_id) === String(d.component_product_id);
      }
      return !!d.item_id && String(i.item_id) === String(d.item_id);
    });
    if (dup) {
      showToast('This item is already added to this group. Use a different item or remove the existing one.', 'warning');
      return;
    }
    const resequence = (arr) => {
      const byParent = {};
      arr.forEach((it) => { const k = it.parentTempId ?? '__root'; (byParent[k] = byParent[k] || []).push(it); });
      Object.values(byParent).forEach((grp) => {
        grp.sort((a, b) => (a.serial_no ?? Infinity) - (b.serial_no ?? Infinity) || String(a.tempId).localeCompare(String(b.tempId)));
        let dup = grp.some((it, idx) => idx > 0 && it.serial_no != null && it.serial_no === grp[idx - 1].serial_no);
        let hasNull = grp.some((it) => it.serial_no == null);
        let gap = grp.some((it, idx) => it.serial_no != null && it.serial_no !== idx + 1);
        if (dup || hasNull || gap) grp.forEach((it, idx) => { it.serial_no = idx + 1; });
      });
      return arr;
    };
    if (compDialog.mode === 'edit') {
      setItems((prev) => resequence(prev.map((i) => (i.tempId === compDialog.targetTempId ? { ...i, ...d } : i))));
    } else {
      setItems((prev) => resequence([...prev, d]));
    }
    setCompDialog((cd) => ({ ...cd, open: false }));
    setDirty(true);
  };

  const removeItem = (tempId) => {
    const toRemove = new Set([tempId]);
    let changed = true;
    while (changed) {
      changed = false;
      for (const it of items) {
        if (it.parentTempId && toRemove.has(it.parentTempId) && !toRemove.has(it.tempId)) {
          toRemove.add(it.tempId); changed = true;
        }
      }
    }
    setItems((prev) => prev.filter((i) => !toRemove.has(i.tempId)));
    setDirty(true);
  };

  const handleItemChange = (tempId, field, value) => {
    setItems((prev) => prev.map((i) => {
      if (i.tempId !== tempId) return i;
      const updated = { ...i, [field]: value };
      if (field === 'item_id') {
        const sel = itemMasterList.find((im) => String(im.id) === String(value));
        if (sel) {
          updated.item_code = sel.item_code;
          updated.item_name = sel.item_name;
          updated.item_description = sel.item_description || '';
          updated.unit_id = sel.unit_id;
        }
      }
      if (field === 'component_product_id') {
        const sub = productList.find((p) => String(p.id) === String(value));
        if (sub) {
          updated.component_product_id = value ? Number(value) : '';
          updated.item_code = sub.product_code || sub.product_uid || '';
          updated.item_name = sub.part_name || '';
          updated.is_subassembly = true;
          if (value) fetchLinkedTree(Number(value));
          if (sub.item_id) {
            const sel = itemMasterList.find((im) => String(im.id) === String(sub.item_id));
            if (sel) {
              updated.item_id = sel.id;
              updated.item_description = sel.item_description || '';
              updated.unit_id = sel.unit_id;
            }
          } else {
            updated.item_id = '';
            updated.item_description = '';
            updated.unit_id = '';
          }
        }
      }
      return updated;
    }));
    setDirty(true);
  };

  const openItemDialog = (targetTempId = null) => {
    if (!units.length) axios.get('/api/erp/stores/units').then(({ data }) => setUnits(data)).catch(() => { });
    if (!groups.length) axios.get('/api/erp/stores/groups').then(({ data }) => setGroups(data)).catch(() => { });
    setItemDialog({ open: true, targetTempId, code: '', name: '', make_buy: 'Buy', description: '', unit_id: '', hsn_code: '', gst_rate: '', saving: false, error: '' });
  };

  const openEditItemDialog = async (itemId) => {
    if (!itemId) return;
    if (!units.length) axios.get('/api/erp/stores/units').then(({ data }) => setUnits(data)).catch(() => { });
    try {
      const { data } = await axios.get(`${ITEMS_API}/${itemId}`);
      setEditItemDialog({ open: true, id: data.id, code: data.item_code || '', name: data.item_name || '', description: data.item_description || '', unit_id: data.unit_id || '', hsn_code: data.hsn_code || '', gst_rate: data.gst_rate ?? '', saving: false, error: '' });
    } catch {
      const fallback = itemMasterList.find((im) => String(im.id) === String(itemId));
      if (fallback) setEditItemDialog({ open: true, id: fallback.id, code: fallback.item_code || '', name: fallback.item_name || '', description: fallback.item_description || '', unit_id: fallback.unit_id || '', hsn_code: fallback.hsn_code || '', gst_rate: fallback.gst_rate ?? '', saving: false, error: '' });
      else showToast('Failed to load item details', 'error');
    }
  };

  const handleUpdateItem = async () => {
    const name = String(editItemDialog.name || '').trim();
    if (!name || name.length < 2) return setEditItemDialog((d) => ({ ...d, error: 'Item name is too short' }));
    const codeStr = String(editItemDialog.code || '').trim();
    if (codeStr && !/^[A-Z0-9][A-Z0-9-]*$/.test(codeStr.toUpperCase())) return setEditItemDialog((d) => ({ ...d, error: 'Code must be uppercase letters/numbers with hyphens' }));
    setEditItemDialog((d) => ({ ...d, saving: true, error: '' }));
    try {
      const payload = { item_name: name };
      if (codeStr) payload.item_code = codeStr.toUpperCase();
      payload.item_description = String(editItemDialog.description || '').trim() || null;
      if (editItemDialog.unit_id) payload.unit_id = Number(editItemDialog.unit_id);
      const hsnStr = String(editItemDialog.hsn_code || '').trim();
      if (hsnStr) payload.hsn_code = hsnStr;
      if (editItemDialog.gst_rate !== '' && editItemDialog.gst_rate !== null && editItemDialog.gst_rate !== undefined) payload.gst_rate = Number(editItemDialog.gst_rate) || 0;
      const { data } = await axios.put(`${ITEMS_API}/${editItemDialog.id}`, payload);
      const updated = data.item || data;
      setItemMasterList((prev) => prev.map((im) => String(im.id) === String(updated.id) ? { ...im, ...updated } : im));
      setItems((prev) => prev.map((it) => String(it.item_id) === String(updated.id) ? { ...it, item_code: updated.item_code ?? it.item_code, item_name: updated.item_name ?? it.item_name, item_description: updated.item_description ?? it.item_description, unit_id: updated.unit_id ?? it.unit_id } : it));
      setCompDialog((cd) => cd.draft && String(cd.draft.item_id) === String(updated.id) ? { ...cd, draft: { ...cd.draft, item_code: updated.item_code ?? cd.draft.item_code, item_name: updated.item_name ?? cd.draft.item_name, item_description: updated.item_description ?? cd.draft.item_description } } : cd);
      axios.get(ITEMS_API).then(({ data: list }) => setItemMasterList(list)).catch(() => { });
      setEditItemDialog((d) => ({ ...d, open: false, saving: false }));
      showToast('Item updated — BOM refreshed instantly', 'success');
    } catch (e) {
      setEditItemDialog((d) => ({ ...d, saving: false, error: e?.response?.data?.error || e?.response?.data?.errors?.[0] || 'Failed to update item' }));
    }
  };

  const handleCreateItem = async () => {
    const code = itemDialog.code.trim().toUpperCase();
    const name = itemDialog.name.trim();
    if (!code) return setItemDialog((d) => ({ ...d, error: 'Item code is required' }));
    if (code && !/^[A-Z0-9][A-Z0-9-]*$/.test(code)) return setItemDialog((d) => ({ ...d, error: 'Code must be uppercase letters/numbers with optional hyphens' }));
    if (name.length < 2) return setItemDialog((d) => ({ ...d, error: 'Item name is too short' }));
    setItemDialog((d) => ({ ...d, saving: true, error: '' }));
    try {
      const payload = { item_code: code, item_name: name, make_buy: itemDialog.make_buy };
      if (itemDialog.description.trim()) payload.item_description = itemDialog.description.trim();
      if (itemDialog.unit_id) payload.unit_id = Number(itemDialog.unit_id);
      if (itemDialog.hsn_code.trim()) payload.hsn_code = itemDialog.hsn_code.trim();
      if (itemDialog.gst_rate !== '') payload.gst_rate = Number(itemDialog.gst_rate) || 0;
      const { data } = await axios.post(ITEMS_API, payload);
      axios.get(ITEMS_API).then(({ data }) => setItemMasterList(data)).catch(() => { });
      if (itemDialog.targetTempId) handleItemChange(itemDialog.targetTempId, 'item_id', data.id);
      setItemDialog((d) => ({ ...d, open: false, saving: false }));
      showToast('Item code created successfully', 'success');
    } catch (e) {
      setItemDialog((d) => ({ ...d, saving: false, error: e?.response?.data?.error || 'Failed to create item' }));
    }
  };

  const childItems = (parentTempId) =>
    items.filter((it) => it.parentTempId === parentTempId)
      .sort((a, b) => ((a.serial_no ?? Infinity) - (b.serial_no ?? Infinity)));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const payload = {
      ...form,
      parent_id: form.parent_id ? Number(form.parent_id) : null,
      item_id: form.item_id ? Number(form.item_id) : null,
      sort_order: Number(form.sort_order) || 0,
      drawing_no: form.drawing_no || null,
      revision: form.revision || null,
      default_bom_id: form.default_bom_id ? Number(form.default_bom_id) : null,
      items,
    };
    try {
      if (isEdit) await axios.put(`${API}/${id}`, payload);
      else await axios.post(API, payload);
      setDirty(false);
      showToast(`Product ${isEdit ? 'updated' : 'created'} successfully`, 'success');
      navigate('/engineering/products');
    } catch {
      showToast('Failed to save product details', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Flatten the recursive BOM (inline children + linked sub-assembly children) into a
  // single grid dataset. Linked rows are read-only; editable rows keep their tempId.
  const gridRows = useMemo(() => {
    const resolve = (entry) => {
      const opt = entry.item_id ? itemOptions.find((o) => String(o.id) === String(entry.item_id)) : null;
      return {
        item_code: opt ? opt.item_code : (entry.item_code || '—'),
        item_name: opt ? opt.item_name : (entry.item_name || '—'),
        item_description: opt ? (opt.item_description || entry.item_description || '—') : (entry.item_description || '—'),
      };
    };
    const rows = [];
    let seq = 0;
    const walkLinked = (nodes, level) => {
      (nodes || []).forEach((n) => {
        const isLinked = !!n.component_product_id;
        const r = resolve(n);
        rows.push({
          id: `L-${n.id}-${level}-${rows.length}`,
          tempId: null,
          item_id: n.item_id || null,
          level,
          sno: ++seq,
          serial_no: n.serial_no,
          item_code: r.item_code,
          item_name: r.item_name,
          item_description: r.item_description,
          quantity: Number(n.quantity),
          wastage_percent: Number(n.wastage_percent || 0),
          color: n.color || '',
          type: isLinked ? 'Linked Sub-Assembly' : (n.is_subassembly ? 'Sub-Assembly' : 'Item'),
          component_product_id: isLinked ? Number(n.component_product_id) : null,
          is_subassembly: n.is_subassembly || isLinked,
          remark: n.remark || '',
          readOnly: true,
        });
        if (n.children && n.children.length) walkLinked(n.children, level + 1);
      });
    };
    const walk = (list, level) => {
      list.forEach((it) => {
        const isLinked = !!it.component_product_id;
        const r = resolve(it);
        rows.push({
          id: it.tempId,
          tempId: it.tempId,
          item_id: it.item_id || null,
          level,
          sno: ++seq,
          serial_no: it.serial_no,
          item_code: r.item_code,
          item_name: r.item_name,
          item_description: r.item_description,
          quantity: Number(it.quantity),
          wastage_percent: Number(it.wastage_percent || 0),
          color: it.color || '',
          type: isLinked ? 'Linked Sub-Assembly' : (it.is_subassembly ? 'Sub-Assembly' : 'Item'),
          component_product_id: isLinked ? Number(it.component_product_id) : null,
          is_subassembly: it.is_subassembly,
          remark: it.remark || '',
          readOnly: false,
        });
        const kids = childItems(it.tempId);
        if (kids.length) walk(kids, level + 1);
        if (isLinked) walkLinked(linkedTrees[it.component_product_id] || [], level + 1);
      });
    };
    walk(childItems(null), 0);
    return rows;
  }, [items, linkedTrees, itemOptions]);

  // Keep the top scrollbar's content width in sync whenever the grid's row
  // dataset changes (e.g. linked sub-assembly rows stream in after load),
  // since those additions can widen the grid beyond the initial scrollWidth.
  useEffect(() => {
    if (bomTableRef.current && topScrollRef.current) {
      const inner = topScrollRef.current.querySelector('.smart-table-top-scroll-inner');
      if (inner) inner.style.width = `${bomTableRef.current.scrollWidth}px`;
    }
  }, [gridRows]);

  const [bomColWidths, setBomColWidths] = useState({
    serial_no: 60,
    item_code: 120,
    item_name: 180,
    item_description: 170,
    quantity: 60,
    wastage_percent: 75,
    color: 75,
    type: 120,
    remark: 120,
  });

  const handleColResize = (e, field) => {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX;
    const startW = bomColWidths[field];
    const onMouseMove = (moveE) => {
      if (!moveE.clientX) return;
      const diff = moveE.clientX - startX;
      setBomColWidths((prev) => ({
        ...prev,
        [field]: Math.max(30, startW + diff),
      }));
    };
    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  const bomColumns = useMemo(() => [
    { field: 'serial_no', header: 'S.No', width: bomColWidths.serial_no },
    { field: 'item_code', header: 'Item Code', width: bomColWidths.item_code },
    { field: 'item_name', header: 'Part Name', width: bomColWidths.item_name },
    { field: 'item_description', header: 'Description', width: bomColWidths.item_description },
    { field: 'quantity', header: 'Qty', width: bomColWidths.quantity, align: 'right' },
    { field: 'wastage_percent', header: 'Wastage %', width: bomColWidths.wastage_percent, align: 'right' },
    { field: 'color', header: 'Color', width: bomColWidths.color },
    { field: 'type', header: 'Type', width: bomColWidths.type },
    { field: 'remark', header: 'Remark', width: bomColWidths.remark },
  ], [bomColWidths]);

  const bomTableWidth = useMemo(() => {
    const colsSum = Object.values(bomColWidths).reduce((acc, w) => acc + w, 0);
    return colsSum + 150;
  }, [bomColWidths]);

  // Mark rows that have child rows, and filter based on expand/collapse state.
  // By default all rows are EXPANDED; bomCollapsed tracks explicitly collapsed nodes.
  const visibleGridRows = useMemo(() => {
    // Mark which rows have children (next row has a deeper level)
    const marked = gridRows.map((r, idx) => ({
      ...r,
      hasChildren: idx + 1 < gridRows.length && gridRows[idx + 1].level > r.level,
    }));
    // Filter: iterate and track collapse-by-level
    const visible = [];
    let collapseAtLevel = Infinity;
    for (const r of marked) {
      if (r.level >= collapseAtLevel) continue; // hidden under a collapsed parent
      collapseAtLevel = Infinity; // this row is visible, reset
      visible.push(r);
      // If this row has children and IS collapsed, hide all deeper rows
      if (r.hasChildren && bomCollapsed[r.id]) {
        collapseAtLevel = r.level + 1;
      }
    }
    return visible;
  }, [gridRows, bomCollapsed]);

  const filteredGridRows = useMemo(() => {
    return visibleGridRows.filter((row) => {
      return Object.entries(bomFilters).every(([field, value]) => {
        if (!value) return true;
        const valStr = row[field]?.toString().toLowerCase() || '';
        return valStr.includes(value.toLowerCase());
      });
    });
  }, [visibleGridRows, bomFilters]);

  const bomPagedRows = useMemo(() => {
    const start = bomPage * bomRowsPerPage;
    return filteredGridRows.slice(start, start + bomRowsPerPage);
  }, [filteredGridRows, bomPage, bomRowsPerPage]);
  const bomTotalPages = Math.max(1, Math.ceil(filteredGridRows.length / bomRowsPerPage));

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1440, mx: 'auto' }}>
      {/* ── Gradient Header ── */}
      <Box sx={gradientHeader}>
        <Box display="flex" alignItems="center" gap={2.5}>
          <IconButton onClick={() => {
            if (dirty && !window.confirm('You have unsaved changes. Leave without saving?')) return;
            navigate('/engineering/products');
          }} sx={{
            bgcolor: '#f1f5f9', color: '#0f172a', '&:hover': { bgcolor: '#e2e8f0' },
          }}>
            <ArrowBackIcon />
          </IconButton>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: '-0.02em', mb: 0.5, color: '#0f172a' }}>
              {titlePrefix} {isSubAssembly ? 'Sub-Assembly Component' : 'Finished Product'}
            </Typography>
            <Box display="flex" gap={1.25} flexWrap="wrap" alignItems="center">
              <Chip size="small"
                label={form.node_type || 'SKU'}
                sx={{
                  bgcolor: '#e0f2fe', color: '#0369a1', fontWeight: 700,
                  border: '1px solid #bae6fd', fontSize: '.72rem',
                }}
              />
              {form.product_uid ? (
                <Chip size="small" label={`UID: ${form.product_uid}`} sx={{ bgcolor: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0', fontSize: '.72rem' }} />
              ) : (
                <Chip size="small" label="Auto-generating UID" sx={{ bgcolor: '#fef3c7', color: '#d97706', border: '1px solid #fde68a', fontStyle: 'italic', fontSize: '.72rem' }} />
              )}
            </Box>
          </Box>
        </Box>

        <Box display="flex" alignItems="center" gap={1.5}>
          {!readOnly && (
            <Button
              type="submit" form="product-master-form" variant="contained"
              startIcon={<SaveIcon />}
              disabled={loading}
              sx={{
                fontWeight: 700, textTransform: 'none',
                background: 'linear-gradient(135deg, #1e40af 0%, #1d4ed8 100%)',
                boxShadow: '0 2px 8px rgba(29, 78, 216, 0.3)',
                '&:hover': { background: 'linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)' }
              }}
            >
              {isEdit ? 'Update' : 'Save'}
            </Button>
          )}
          <Button
            variant="outlined"
            onClick={() => {
              if (dirty && !window.confirm('You have unsaved changes. Leave without saving?')) return;
              navigate('/engineering/products');
            }}
            sx={{ textTransform: 'none', fontWeight: 600, borderColor: '#cbd5e1', color: '#334155', '&:hover': { bgcolor: '#f8fafc' } }}
          >
            {readOnly ? 'Close' : 'Cancel'}
          </Button>
          <Button
            variant="outlined"
            onClick={() => setShowGuide(!showGuide)}
            startIcon={<HelpOutlineIcon />}
            sx={{ color: '#0b3c91', borderColor: '#0b3c91', textTransform: 'none', fontWeight: 600, '&:hover': { bgcolor: 'rgba(11,60,145,0.04)' } }}
          >
            Guide
          </Button>
          <FormControlLabel
            control={
              <Switch size="small" checked={form.is_active} onChange={handleChange('is_active')} disabled={readOnly}
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': { color: '#0ebf7a' },
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#0ebf7a' },
                }}
              />
            }
            label={
              <Typography variant="body2" sx={{ fontWeight: 700, color: form.is_active ? '#0d9488' : '#64748b' }}>
                {form.is_active ? 'Active' : 'Inactive'}
              </Typography>
            }
            sx={{ m: 0 }}
          />
        </Box>
      </Box>

      {/* ── Section Concepts Guide ── */}
      {showGuide && (
        <Paper sx={guideCard} elevation={0}>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
            <Box display="flex" alignItems="center" gap={1.25}>
              <InfoOutlinedIcon color="primary" sx={{ fontSize: 24 }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1e293b' }}>
                Engineering Product Master Foundations
              </Typography>
            </Box>
            <Button size="small" onClick={() => setShowGuide(false)} sx={{ textTransform: 'none' }}>
              Dismiss
            </Button>
          </Box>
          <Grid container spacing={2.5}>
            <Grid item xs={12} md={4}>
              <Box sx={{ p: 1.5, height: '100%', bgcolor: '#fff', borderRadius: 2, border: '1px solid #e2e8f0' }}>
                <Box display="flex" gap={1} alignItems="center" mb={1} color="primary.main">
                  <AssignmentIcon sx={{ fontSize: 18 }} />
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>1. Basic Identity Information</Typography>
                </Box>
                <Typography variant="caption" color="text.secondary" component="p">
                  Standardizes nomenclature, categories, finish models, and links the design directly with active stock inventory items to trace unit costs and quantities.
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ p: 1.5, height: '100%', bgcolor: '#fff', borderRadius: 2, border: '1px solid #e2e8f0' }}>
                <Box display="flex" gap={1} alignItems="center" mb={1} color="warning.main">
                  <AccountTreeIcon sx={{ fontSize: 18 }} />
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>2. Structural Node Tree Role</Typography>
                </Box>
                <Typography variant="caption" color="text.secondary" component="p">
                  Configures BOM relation (ROOT to SKU). Specifies if this item operates as a **Phantom** (inline assembly with direct component blow-out) or independent **Sub-Assembly**.
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ p: 1.5, height: '100%', bgcolor: '#fff', borderRadius: 2, border: '1px solid #e2e8f0' }}>
                <Box display="flex" gap={1} alignItems="center" mb={1} color="success.main">
                  <PrecisionManufacturingIcon sx={{ fontSize: 18 }} />
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>3. Engineering &amp; Planning version</Typography>
                </Box>
                <Typography variant="caption" color="text.secondary" component="p">
                  Specifies Drawing Numbers, revisions, yields, and pallet packing details. It establishes standard output boundaries for production lines.
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* ── Tabs Navigation ── */}
      <Tabs
        value={activeTab}
        onChange={(_, val) => setActiveTab(val)}
        sx={{
          mb: 3, borderBottom: '1px solid #e2e8f0',
          '& .MuiTabs-indicator': { height: 3, borderRadius: '3px 3px 0 0' },
        }}
      >
        <Tab icon={<AssignmentIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="1. Basic & Identity" sx={{ fontWeight: 700, textTransform: 'none', py: 1.5 }} />
        <Tab icon={<PrecisionManufacturingIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="2. Structure & Planning Params" sx={{ fontWeight: 700, textTransform: 'none', py: 1.5 }} />
        <Tab icon={<AccountTreeIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="3. Component BOM Tree" sx={{ fontWeight: 700, textTransform: 'none', py: 1.5 }} />
      </Tabs>

      {/* ── Form Body ── */}
      <form id="product-master-form" onSubmit={handleSubmit}>
        {/* TAB 1: BASIC INFORMATION */}
        {activeTab === 0 && (
          <Card sx={cardLayout}>
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>

              {/* Row 1 — Name, Code, Type, Finish, Color, Qty */}
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mb: 1.5 }}>
                <Box sx={{ flex: '2 1 260px' }}>
                  <TextField
                    label="Part Name *" size="small" fullWidth required
                    value={form.part_name} onChange={handleChange('part_name')}
                    disabled={readOnly} placeholder="e.g. TOWER FAN - NORMAL MODEL"
                    inputProps={{ maxLength: 255 }}
                  />
                </Box>
                <Box sx={{ flex: '1 1 160px' }}>
                  <TextField
                    label="Product Code" size="small" fullWidth
                    value={form.product_code} onChange={handleChange('product_code')}
                    disabled={readOnly} placeholder="Auto-generated if blank"
                    inputProps={{ maxLength: 100 }}
                  />
                </Box>
                <Box sx={{ flex: '0 0 140px' }}>
                  <TextField
                    label="Product Type" select size="small" fullWidth
                    value={form.product_type} onChange={handleChange('product_type')}
                    disabled={readOnly}
                  >
                    {PRODUCT_TYPES.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                  </TextField>
                </Box>
                <Box sx={{ flex: '0 0 150px' }}>
                  <TextField
                    label="Finish Type" select size="small" fullWidth
                    value={form.finish_type} onChange={handleChange('finish_type')}
                    disabled={readOnly}
                  >
                    <MenuItem value=""><em>None</em></MenuItem>
                    {FINISH_TYPES.map((f) => <MenuItem key={f} value={f}>{f}</MenuItem>)}
                  </TextField>
                </Box>
                <Box sx={{ flex: '0 0 140px' }}>
                  <TextField
                    label="Color" size="small" fullWidth
                    value={form.color} onChange={handleChange('color')}
                    disabled={readOnly} placeholder="White, Black..."
                    inputProps={{ maxLength: 100 }}
                  />
                </Box>
                <Box sx={{ flex: '0 0 110px' }}>
                  <TextField
                    label="Assembly Qty" type="number" size="small" fullWidth
                    value={form.assembly_qty} onChange={handleChange('assembly_qty')}
                    disabled={readOnly}
                  />
                </Box>
              </Box>

              {/* Row 2 — Main Cat, Sub Cat, Linked Item, Description */}
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                <Box sx={{ flex: '1 1 180px' }}>
                  <Autocomplete
                    fullWidth size="small" freeSolo
                    options={mainOptions}
                    value={form.main_category_name || ''}
                    onChange={(_, v) => setForm((f) => ({ ...f, main_category_name: v || '' }))}
                    onInputChange={(_, v) => setForm((f) => ({ ...f, main_category_name: v || '' }))}
                    disabled={readOnly}
                    renderInput={(params) => <TextField {...params} label="Main Category *" placeholder="Select or type..." />}
                  />
                </Box>
                <Box sx={{ flex: '1 1 180px' }}>
                  <Autocomplete
                    fullWidth size="small" freeSolo
                    options={subOptions}
                    value={form.sub_category_name || ''}
                    onChange={(_, v) => setForm((f) => ({ ...f, sub_category_name: v || '' }))}
                    onInputChange={(_, v) => setForm((f) => ({ ...f, sub_category_name: v || '' }))}
                    disabled={readOnly}
                    renderInput={(params) => <TextField {...params} label="Sub Category *" placeholder="Select or type..." />}
                  />
                </Box>
                <Box sx={{ flex: '1 1 200px', display: 'flex', gap: 0.5, alignItems: 'flex-start' }}>
                  <TextField
                    label="Linked Inventory Item" select size="small" fullWidth
                    value={form.item_id} onChange={handleChange('item_id')}
                    disabled={readOnly}
                  >
                    <MenuItem value=""><em>Not Linked</em></MenuItem>
                    {itemMasterList.filter((im) => im.is_active !== false).map((im) => (
                      <MenuItem key={im.id} value={im.id}>
                        {im.item_code} - {im.item_name} {im.unit?.short_name ? `(${im.unit.short_name})` : ''}
                      </MenuItem>
                    ))}
                  </TextField>
                  <Box display="flex" flexDirection="column" gap={0.25}>
                    <Tooltip title={form.item_id ? "Edit linked Item Master" : "Add new Item Master"}>
                      <IconButton size="small" onClick={() => form.item_id ? openEditItemDialog(form.item_id) : openItemDialog(null)}
                        sx={{ bgcolor: form.item_id ? '#eff6ff' : '#f0fdf4', color: form.item_id ? '#2563eb' : '#16a34a', border: '1px solid #e2e8f0', width: 30, height: 30 }}>
                        {form.item_id ? <EditIcon sx={{ fontSize: 16 }} /> : <AddIcon sx={{ fontSize: 16 }} />}
                      </IconButton>
                    </Tooltip>
                    {form.item_id && (
                      <Tooltip title="Create new Item">
                        <IconButton size="small" onClick={() => openItemDialog(null)} sx={{ bgcolor: '#f0fdf4', color: '#16a34a', border: '1px solid #e2e8f0', width: 30, height: 22 }}><AddIcon sx={{ fontSize: 14 }} /></IconButton>
                      </Tooltip>
                    )}
                  </Box>
                </Box>
                <Box sx={{ flex: '2 1 260px' }}>
                  <CountedTextArea
                    label="Description / Engineering Notes"
                    size="small" fullWidth
                    value={form.description} onChange={handleChange('description')}
                    disabled={readOnly} rows={2}
                    placeholder="Material composition, assembly parameters, tooling notes..."
                  />
                </Box>
              </Box>

            </CardContent>
          </Card>
        )}

        {/* TAB 2: STRUCTURE & PLANNING PARAMS */}
        {activeTab === 1 && (
          <Card sx={cardLayout}>
            <CardContent sx={{ p: 3 }}>
              <Grid container spacing={3.25}>
                {/* Structure / Role Section */}
                <Grid item xs={12}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <AccountTreeIcon fontSize="small" color="primary" /> Hierarchy &amp; Role parameters
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Structural Tree Node Role"
                    select size="small" fullWidth
                    value={form.node_type}
                    onChange={handleChange('node_type')}
                    disabled={readOnly}
                    helperText="ROOT: Top-level item. SKU: single parts/sales unit. PHANTOM: direct collapse"
                  >
                    {NODE_TYPES.map((n) => <MenuItem key={n.value} value={n.value}>{n.label}</MenuItem>)}
                  </TextField>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Immediate Parent Assembly Product"
                    select size="small" fullWidth
                    value={form.parent_id}
                    onChange={handleChange('parent_id')}
                    disabled={readOnly}
                    helperText="Define parent element if this belongs to a larger top-level assembly structure"
                  >
                    <MenuItem value=""><em>None (Top Level Root)</em></MenuItem>
                    {productList.filter((p) => String(p.id) !== String(id)).map((p) => (
                      <MenuItem key={p.id} value={p.id}>
                        {p.product_code || p.product_uid} — {p.part_name}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                {/* Drawing & Versions Section */}
                <Grid item xs={12} sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <PrecisionManufacturingIcon fontSize="small" color="secondary" /> Version Control &amp; Reference Drawings
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                </Grid>

                <Grid item xs={12} sm={4}>
                  <TextField
                    label="Engineering Drawing Reference Number"
                    size="small" fullWidth
                    value={form.drawing_no}
                    onChange={handleChange('drawing_no')}
                    disabled={readOnly}
                    placeholder="e.g. DWG-206-TF-012"
                    inputProps={{ maxLength: 100 }}
                  />
                </Grid>

                <Grid item xs={12} sm={4}>
                  <TextField
                    label="Revision Control Level"
                    size="small" fullWidth
                    value={form.revision}
                    onChange={handleChange('revision')}
                    disabled={readOnly}
                    placeholder="e.g. Rev A.2"
                    inputProps={{ maxLength: 50 }}
                  />
                </Grid>

                <Grid item xs={12} sm={4}>
                  <TextField
                    label="Default Locked Version BOM"
                    select size="small" fullWidth
                    value={form.default_bom_id}
                    onChange={handleChange('default_bom_id')}
                    disabled={readOnly}
                    helperText="Binds assembly processes to specific revisions"
                  >
                    <MenuItem value=""><em>Latest Active Iteration</em></MenuItem>
                    {bomOptions.map((b) => (
                      <MenuItem key={b.id} value={b.id}>{b.bom_no} (Version {b.version})</MenuItem>
                    ))}
                  </TextField>
                </Grid>

                {/* Logistics planning */}
                <Grid item xs={12} sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <LocalShippingIcon fontSize="small" color="success" /> Warehouse &amp; Dispatch Logistics
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Quantity Allocation per standard shipping pallet"
                    type="number" size="small" fullWidth
                    value={form.qty_per_pallet}
                    onChange={handleChange('qty_per_pallet')}
                    disabled={readOnly}
                    placeholder="e.g. 50"
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Sequential UI Display Order"
                    type="number" size="small" fullWidth
                    value={form.sort_order}
                    onChange={handleChange('sort_order')}
                    disabled={readOnly}
                    helperText="Controls list sort ranking position"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        )}

        {/* TAB 3: COMPONENT BOM TREE */}
        {activeTab === 2 && (
          <Card sx={cardLayout}>
            {/* Header toolbar */}
            <Box sx={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              px: 3, py: 2.25, borderBottom: '1px solid #e2e8f0', bgcolor: '#f8fafc',
            }}>
              <Box display="flex" alignItems="center" gap={1.5}>
                <Typography sx={{ fontWeight: 700, color: '#0f172a' }}>
                  {isSubAssembly ? 'Sub-Assembly Component Parts list' : 'Bill of Materials (BOM) Tree'}
                </Typography>
                <Chip size="small" label={`${items.length} columns allocated`} color="primary" sx={{ fontWeight: 700 }} />
              </Box>
              {!readOnly && (
                <Box display="flex" gap={1.25}>
                  <Button startIcon={<AddIcon />} onClick={() => openAddComponent()} size="small" variant="contained"
                    sx={{ textTransform: 'none', fontWeight: 700, boxShadow: 'none' }}>
                    Add Component Column
                  </Button>
                  <Button startIcon={<AddIcon />} onClick={() => openItemDialog(null)} size="small" variant="text"
                    sx={{ textTransform: 'none', fontWeight: 600 }}>
                    New Item Code Info
                  </Button>
                </Box>
              )}
            </Box>

            {/* BOM Report Table — SmartTable-style with dual scrollbar */}
            {gridRows.length === 0 ? (
              <Box sx={{ py: 6, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>
                <Typography variant="body2" color="text.disabled" sx={{ fontStyle: 'italic', fontWeight: 500 }}>
                  No child items configured in this BOM tree structure yet.
                </Typography>
                {!readOnly && (
                  <Button startIcon={<AddIcon />} variant="outlined" size="small" onClick={() => openAddComponent()}>
                    Insert First Component
                  </Button>
                )}
              </Box>
            ) : (
              <>
                {/* Top mirror scrollbar */}
                <div className="smart-table-top-scroll" ref={topScrollRef} onScroll={syncBomTopScroll}>
                  <div className="smart-table-top-scroll-inner" />
                </div>
                {/* Scrollable table container */}
                <div className="smart-table-container" ref={bomScrollRef} onScroll={syncBomBottomScroll}>
                  <table className="smart-table" ref={bomTableRef} style={{ tableLayout: 'fixed', width: bomTableWidth }}>
                    <thead>
                      <tr>
                        {bomColumns.map((col) => (
                          <th key={col.field} style={{ width: col.width, minWidth: col.width, textAlign: col.align || 'left', verticalAlign: 'top', position: 'relative' }}>
                            <div>{col.header}</div>
                            <input
                              type="text"
                              placeholder="Filter"
                              value={bomFilters[col.field] || ""}
                              onChange={(e) => {
                                setBomFilters((prev) => ({ ...prev, [col.field]: e.target.value }));
                                setBomPage(0);
                              }}
                              style={{ width: '100%', fontSize: '11px', marginTop: '4px', padding: '2px 4px', border: '1px solid #cbd5e1', borderRadius: '4px', fontWeight: 'normal' }}
                            />
                            {/* Draggable resize handle */}
                            <div
                              onMouseDown={(e) => handleColResize(e, col.field)}
                              style={{
                                position: 'absolute',
                                top: 0,
                                right: 0,
                                width: '4px',
                                bottom: 0,
                                cursor: 'col-resize',
                                zIndex: 10,
                                backgroundColor: 'transparent',
                              }}
                              onMouseOver={(e) => { e.target.style.backgroundColor = '#3b82f6'; }}
                              onMouseOut={(e) => { e.target.style.backgroundColor = 'transparent'; }}
                            />
                          </th>
                        ))}
                        <th style={{ width: 150, minWidth: 150, verticalAlign: 'top' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bomPagedRows.map((r) => (
                        <tr key={r.id} style={{ background: r.readOnly ? '#fefce8' : undefined }}>
                          {/* S.No */}
                          <td style={{ width: bomColumns[0].width, minWidth: bomColumns[0].width, paddingLeft: 8 + r.level * 22, fontWeight: 600, whiteSpace: 'nowrap' }}>
                            {r.level > 0 && <span style={{ color: '#1976d2' }}>↳ </span>}
                            {r.serial_no != null ? r.serial_no : r.sno}
                          </td>
                          {/* Item Code with expand/collapse chevron */}
                          <td style={{ width: bomColumns[1].width, minWidth: bomColumns[1].width, fontFamily: 'monospace', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            <Box display="flex" alignItems="center" gap={0.25}>
                              {r.hasChildren ? (
                                <IconButton size="small" sx={{ p: 0.1 }} onClick={() => setBomCollapsed((e) => ({ ...e, [r.id]: !e[r.id] }))}>
                                  {bomCollapsed[r.id] ? <ChevronRightIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
                                </IconButton>
                              ) : (
                                <span style={{ width: 24, display: 'inline-block' }} />
                              )}
                              <span>{r.item_code || '—'}</span>
                            </Box>
                          </td>
                          {/* Part Name */}
                          <td style={{ width: bomColumns[2].width, minWidth: bomColumns[2].width, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            <Tooltip title={r.item_name || ''} arrow enterDelay={200}>
                              <Box display="flex" alignItems="center" gap={0.5}>
                                {r.is_subassembly && <Chip size="small" color="warning" label="SA" sx={{ height: 18, fontSize: '.68rem', fontWeight: 700 }} />}
                                <span>{r.item_name || '—'}</span>
                              </Box>
                            </Tooltip>
                          </td>
                          {/* Description */}
                          <td style={{ width: bomColumns[3].width, minWidth: bomColumns[3].width, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            <Tooltip title={r.item_description || ''} arrow enterDelay={200}>
                              <span>{r.item_description || '—'}</span>
                            </Tooltip>
                          </td>
                          {/* Qty */}
                          <td style={{ width: bomColumns[4].width, minWidth: bomColumns[4].width, textAlign: 'right' }}>{r.quantity}</td>
                          {/* Wastage % */}
                          <td style={{ width: bomColumns[5].width, minWidth: bomColumns[5].width, textAlign: 'right' }}>{r.wastage_percent}</td>
                          {/* Color */}
                          <td style={{ width: bomColumns[6].width, minWidth: bomColumns[6].width, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.color || '-'}</td>
                          {/* Type */}
                          <td style={{ width: bomColumns[7].width, minWidth: bomColumns[7].width, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.type}</td>
                          {/* Remark */}
                          <td style={{ width: bomColumns[8].width, minWidth: bomColumns[8].width, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            <Tooltip title={r.remark || ''} arrow enterDelay={200}>
                              <span>{r.remark || '—'}</span>
                            </Tooltip>
                          </td>
                          {/* Actions — Item Master edit always available even in View mode */}
                          <td>
                            {r.readOnly ? (
                              <Box display="flex" gap={0.5} justifyContent="center">
                                {r.item_id && (
                                  <Tooltip title="Edit Item Master (fix description)">
                                    <IconButton size="small" onClick={() => openEditItemDialog(r.item_id)} sx={{ bgcolor: '#fff7ed', color: '#ea580c', '&:hover': { bgcolor: '#ffedd5' } }}><SettingsIcon sx={{ fontSize: 14 }} /></IconButton>
                                  </Tooltip>
                                )}
                                {r.component_product_id ? (
                                  <Button size="small" variant="text" sx={{ textTransform: 'none', fontSize: 12 }} onClick={() => navigate(`/engineering/products/edit/${r.component_product_id}`)}>Open</Button>
                                ) : null}
                              </Box>
                            ) : (
                              <Box display="flex" gap={0.5} justifyContent="center">
                                {r.is_subassembly && r.level === 0 && (
                                  <Tooltip title="Add sub-component">
                                    <IconButton size="small" onClick={() => openAddComponent(r.tempId)} sx={{ bgcolor: '#f0fdf4', color: 'success.main', '&:hover': { bgcolor: '#dcfce7' } }}><LayersIcon sx={{ fontSize: 16 }} /></IconButton>
                                  </Tooltip>
                                )}
                                {r.item_id && (
                                  <Tooltip title="Edit Item Master — fix wrong description/name">
                                    <IconButton size="small" onClick={() => openEditItemDialog(r.item_id)} sx={{ bgcolor: '#fff7ed', color: '#ea580c', '&:hover': { bgcolor: '#ffedd5' } }}><SettingsIcon sx={{ fontSize: 16 }} /></IconButton>
                                  </Tooltip>
                                )}
                                <Tooltip title="Edit component line (qty/remark)">
                                  <IconButton size="small" color="primary" onClick={() => openEditComponent(items.find((i) => i.tempId === r.tempId))} sx={{ bgcolor: '#eff6ff', '&:hover': { bgcolor: '#dbeafe' } }}><EditIcon sx={{ fontSize: 16 }} /></IconButton>
                                </Tooltip>
                                <Tooltip title="Remove">
                                  <IconButton size="small" color="error" onClick={() => removeItem(r.tempId)} sx={{ bgcolor: '#fef2f2', '&:hover': { bgcolor: '#fee2e2' } }}><DeleteIcon sx={{ fontSize: 16 }} /></IconButton>
                                </Tooltip>
                              </Box>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {/* Pagination */}
                  <div className="pagination-row">
                    <div className="pagination-controls">
                      <label className="rows-per-page">
                        <select value={bomRowsPerPage} onChange={(e) => { setBomRowsPerPage(Number(e.target.value)); setBomPage(0); }}>
                          {[10, 25, 50, 100].map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </label>
                      <button disabled={bomPage === 0} onClick={() => setBomPage(bomPage - 1)}>Prev</button>
                      <span>Page <strong>{bomPage + 1}</strong> of <strong>{bomTotalPages}</strong></span>
                      <button disabled={bomPage + 1 >= bomTotalPages} onClick={() => setBomPage(bomPage + 1)}>Next</button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </Card>
        )}

        {/* ── Linked Usage Info Section (sub-assembly component only) ── */}
        {isSubAssembly && id && (
          <Card sx={cardLayout}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>
                Usage Mapping (Referenced Assemblies / Products)
              </Typography>
              {usedIn.length === 0 ? (
                <Typography variant="body2" color="text.disabled" sx={{ fontStyle: 'italic' }}>
                  This specific sub-assembly configuration has not been referenced inside parent product BOM structures yet.
                </Typography>
              ) : (
                <Box display="flex" flexWrap="wrap" gap={1.25}>
                  {usedIn.map((p) => (
                    <Chip
                      key={p.id} color="warning" variant="outlined"
                      onClick={() => navigate(`/engineering/products/edit/${p.id}`)}
                      sx={{ cursor: 'pointer', fontWeight: 700, '&:hover': { bgcolor: '#fffbeb' } }}
                      label={`${p.product_code || p.product_uid} — ${p.part_name}`}
                    />
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        )}

        {/* Quick tab shift shortcuts */}
        {!readOnly && activeTab < 2 && (
          <Box mt={2} display="flex" justifyContent="flex-end">
            <Button
              onClick={() => setActiveTab(activeTab + 1)}
              sx={{ textTransform: 'none', fontWeight: 700 }}
              endIcon={<ChevronRightIcon />}
            >
              Proceed to Next Tab
            </Button>
          </Box>
        )}
      </form>

      {/* ── New Item code creation Dialog ── */}
      <Dialog open={itemDialog.open} onClose={() => setItemDialog((d) => ({ ...d, open: false }))} maxWidth="sm" fullWidth
        PaperProps={{ sx: { borderRadius: 3, p: 1 } }}>
        <DialogTitle sx={{ fontWeight: 800, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Create New Item Code
          <Button size="small" onClick={() => window.open('/stores/item-master/add', '_blank')} sx={{ textTransform: 'none' }}>Open Full Item Master →</Button>
        </DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} sx={{ mt: 1.5 }}>
            <Box display="flex" gap={2}>
              <TextField label="Item Code *" size="small" fullWidth value={itemDialog.code}
                onChange={(e) => setItemDialog((d) => ({ ...d, code: e.target.value }))}
                inputProps={{ maxLength: 50 }} helperText="A-Z 0-9 -" />
              <TextField label="Make / Buy" select size="small" fullWidth value={itemDialog.make_buy}
                onChange={(e) => setItemDialog((d) => ({ ...d, make_buy: e.target.value }))}>
                <MenuItem value="Buy">Buy</MenuItem>
                <MenuItem value="Make">Make</MenuItem>
                <MenuItem value="Phantom">Phantom</MenuItem>
              </TextField>
            </Box>
            <TextField label="Item Name *" size="small" fullWidth value={itemDialog.name}
              onChange={(e) => setItemDialog((d) => ({ ...d, name: e.target.value }))}
              inputProps={{ maxLength: 200 }} />
            <TextField label="Description" size="small" fullWidth multiline rows={2} value={itemDialog.description}
              onChange={(e) => setItemDialog((d) => ({ ...d, description: e.target.value }))} placeholder="Optional detailed description" />
            <Box display="flex" gap={2}>
              <TextField label="UOM" select size="small" fullWidth value={itemDialog.unit_id}
                onChange={(e) => setItemDialog((d) => ({ ...d, unit_id: e.target.value }))}>
                <MenuItem value=""><em>None</em></MenuItem>
                {units.map((u) => <MenuItem key={u.id} value={u.id}>{u.short_name || u.name}</MenuItem>)}
              </TextField>
              <TextField label="HSN Code" size="small" fullWidth value={itemDialog.hsn_code}
                onChange={(e) => setItemDialog((d) => ({ ...d, hsn_code: e.target.value }))} inputProps={{ maxLength: 20 }} />
              <TextField label="GST %" type="number" size="small" fullWidth value={itemDialog.gst_rate}
                onChange={(e) => setItemDialog((d) => ({ ...d, gst_rate: e.target.value }))} />
            </Box>
            <Alert severity="info" sx={{ py: 0.5 }}>Quick create saves core fields. Use <b>Open Full Item Master</b> for Group, Valuation, Stock & attachments (10 tabs).</Alert>
            {itemDialog.error && <Alert severity="error">{itemDialog.error}</Alert>}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setItemDialog((d) => ({ ...d, open: false }))} sx={{ textTransform: 'none' }}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateItem} disabled={itemDialog.saving}
            sx={{ fontWeight: 700, px: 3, textTransform: 'none' }}>Create Record</Button>
        </DialogActions>
      </Dialog>

      {/* ── Item Master Quick Edit (fix wrong description from Product) ── */}
      <Dialog open={editItemDialog.open} onClose={() => setEditItemDialog((d) => ({ ...d, open: false }))} maxWidth="sm" fullWidth
        PaperProps={{ sx: { borderRadius: 3, p: 1 } }}>
        <DialogTitle sx={{ fontWeight: 800, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Edit Item Master
          <Chip size="small" label={editItemDialog.code} sx={{ fontFamily: 'monospace', fontWeight: 700 }} />
        </DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} sx={{ mt: 1.5 }}>
            <TextField label="Item Code" size="small" fullWidth value={editItemDialog.code}
              onChange={(e) => setEditItemDialog((d) => ({ ...d, code: e.target.value }))} inputProps={{ maxLength: 50 }} helperText="Leave blank to keep existing code" />
            <TextField label="Item Name *" size="small" fullWidth value={editItemDialog.name}
              onChange={(e) => setEditItemDialog((d) => ({ ...d, name: e.target.value }))} inputProps={{ maxLength: 200 }} />
            <TextField label="Description — fix wrong description here" size="small" fullWidth multiline rows={3} value={editItemDialog.description}
              onChange={(e) => setEditItemDialog((d) => ({ ...d, description: e.target.value }))} placeholder="Correct the description shown in BOM" inputProps={{ maxLength: 2000 }} />
            <Box display="flex" gap={2}>
              <TextField label="UOM" select size="small" fullWidth value={editItemDialog.unit_id}
                onChange={(e) => setEditItemDialog((d) => ({ ...d, unit_id: e.target.value }))}>
                <MenuItem value=""><em>None</em></MenuItem>
                {units.map((u) => <MenuItem key={u.id} value={u.id}>{u.short_name || u.name}</MenuItem>)}
              </TextField>
              <TextField label="HSN" size="small" fullWidth value={editItemDialog.hsn_code}
                onChange={(e) => setEditItemDialog((d) => ({ ...d, hsn_code: e.target.value }))} inputProps={{ maxLength: 20 }} />
              <TextField label="GST %" type="number" size="small" fullWidth value={editItemDialog.gst_rate}
                onChange={(e) => setEditItemDialog((d) => ({ ...d, gst_rate: e.target.value }))} />
            </Box>
            <Alert severity="info" sx={{ py: 0.5 }}>Saving updates Item Master globally — all Products using this item will show the new description.</Alert>
            {editItemDialog.error && <Alert severity="error">{editItemDialog.error}</Alert>}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setEditItemDialog((d) => ({ ...d, open: false }))} sx={{ textTransform: 'none' }}>Cancel</Button>
          <Button size="small" variant="outlined" onClick={() => window.open(`/stores/item-master/edit/${editItemDialog.id}`, '_blank')} sx={{ textTransform: 'none' }}>Full Edit →</Button>
          <Button variant="contained" onClick={handleUpdateItem} disabled={editItemDialog.saving}
            sx={{ fontWeight: 700, px: 3, textTransform: 'none' }}>{editItemDialog.saving ? 'Saving...' : 'Update Item'}</Button>
        </DialogActions>
      </Dialog>

      {/* ── Component (BOM item) Edit Dialog ── */}
      <Dialog open={compDialog.open} onClose={() => setCompDialog((d) => ({ ...d, open: false }))} maxWidth="sm" fullWidth
        PaperProps={{ sx: { borderRadius: 3, p: 1 } }}>
        <DialogTitle sx={{ fontWeight: 800 }}>
          {compDialog.mode === 'edit' ? 'Edit Component' : (compDialog.parentTempId ? 'Add Sub-Component' : 'Add Component')}
        </DialogTitle>
        <DialogContent>
          {compDialog.draft && (
            <Box display="flex" flexDirection="column" gap={2.25} sx={{ mt: 1.5 }}>
              <Box display="flex" gap={1} alignItems="center">
                <Box sx={{ flex: 1 }}>
                  <Autocomplete size="small" fullWidth
                    options={itemOptions}
                    getOptionLabel={(o) => typeof o === 'string' ? o : o.item_code || ''}
                    isOptionEqualToValue={(o, v) => String(o.id) === String(v.id)}
                    filterOptions={cap}
                    value={itemOptions.find((o) => String(o.id) === String(compDialog.draft.item_id)) || null}
                    onChange={(_, val) => setCompDialog((cd) => {
                      const d = { ...cd.draft, item_id: val ? String(val.id) : '' };
                      if (val) {
                        d.item_code = val.item_code;
                        d.item_name = val.item_name;
                        d.item_description = val.item_description || '';
                        d.unit_id = val.unit_id;
                      }
                      return { ...cd, draft: d };
                    })}
                    renderOption={(props, option) => (
                      <Box component="li" {...props} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', py: 0.75, borderBottom: '1px solid #f1f5f9' }}>
                        <Typography variant="body2" sx={{ fontWeight: 700, fontFamily: 'monospace', color: '#1e293b' }}>{option.item_code}</Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>{option.item_name}</Typography>
                        <Typography variant="caption" sx={{ color: '#94a3b8' }}>{option.item_description || '—'}</Typography>
                      </Box>
                    )}
                    renderInput={(params) => <TextField {...params} label="Item Code" />}
                  />
                </Box>
                <Tooltip title={compDialog.draft.item_id ? "Edit Item Master (wrong description?)" : "Create new Item Master"}>
                  <IconButton size="small" onClick={() => compDialog.draft.item_id ? openEditItemDialog(compDialog.draft.item_id) : openItemDialog(compDialog.draft.tempId)}
                    sx={{ bgcolor: compDialog.draft.item_id ? '#fff7ed' : '#f0fdf4', color: compDialog.draft.item_id ? '#ea580c' : '#16a34a', border: '1px solid #e2e8f0' }}>
                    {compDialog.draft.item_id ? <EditIcon sx={{ fontSize: 18 }} /> : <AddIcon sx={{ fontSize: 18 }} />}
                  </IconButton>
                </Tooltip>
              </Box>
              <Box display="flex" gap={1}>
                <Button size="small" variant="text" onClick={() => openItemDialog(compDialog.draft.tempId)} sx={{ textTransform: 'none', fontSize: 12 }}>+ New Item Master</Button>
                {compDialog.draft.item_id && <Button size="small" variant="text" onClick={() => window.open(`/stores/item-master/edit/${compDialog.draft.item_id}`, '_blank')} sx={{ textTransform: 'none', fontSize: 12 }}>Full Edit →</Button>}
              </Box>
              {compDialog.draft && compDialog.draft.item_id && (() => {
                const sel = itemOptions.find((o) => String(o.id) === String(compDialog.draft.item_id));
                return sel ? (
                  <Typography variant="caption" sx={{ color: 'text.secondary', ml: 0.5 }}>
                    {sel.item_description ? `Item Description: ${sel.item_description}` : 'No item description available.'}
                  </Typography>
                ) : null;
              })()}
              <TextField size="small" fullWidth label="Component Name" value={compDialog.draft.item_name || ''}
                onChange={(e) => setCompDialog((cd) => ({ ...cd, draft: { ...cd.draft, item_name: e.target.value } }))} />
              <Box display="flex" gap={2}>
                <TextField type="number" size="small" fullWidth label="Serial No"
                  value={compDialog.draft.serial_no != null ? compDialog.draft.serial_no : ''}
                  onChange={(e) => setCompDialog((cd) => ({ ...cd, draft: { ...cd.draft, serial_no: e.target.value === '' ? null : Number(e.target.value) } }))} />
                <TextField type="number" size="small" fullWidth label="Qty" value={Number(compDialog.draft.quantity)}
                  onChange={(e) => setCompDialog((cd) => ({ ...cd, draft: { ...cd.draft, quantity: Number(e.target.value) } }))} />
                <TextField type="number" size="small" fullWidth label="Wastage %" value={Number(compDialog.draft.wastage_percent || 0)}
                  onChange={(e) => setCompDialog((cd) => ({ ...cd, draft: { ...cd.draft, wastage_percent: Number(e.target.value) } }))} />
              </Box>
              <TextField size="small" fullWidth label="Color" value={compDialog.draft.color || ''}
                onChange={(e) => setCompDialog((cd) => ({ ...cd, draft: { ...cd.draft, color: e.target.value } }))} />
              <FormControlLabel
                control={
                  <Switch
                    size="small"
                    checked={!!compDialog.draft.is_subassembly}
                    onChange={(e) => setCompDialog((cd) => ({ ...cd, draft: { ...cd.draft, is_subassembly: e.target.checked } }))}
                  />
                }
                label={<Typography variant="caption" sx={{ fontSize: '.72rem', fontWeight: 600 }}>Sub-Assembly (leave link empty for an inline group)</Typography>}
              />
              {compDialog.draft.is_subassembly && (
                <Autocomplete size="small" fullWidth
                  options={subAssemblyProducts}
                  getOptionLabel={(p) => typeof p === 'string' ? p : p.product_code || p.product_uid || ''}
                  isOptionEqualToValue={(o, v) => String(o.id) === String(v.id)}
                  filterOptions={capProduct}
                  value={subAssemblyProducts.find((p) => String(p.id) === String(compDialog.draft.component_product_id)) || null}
                  onChange={(_, val) => setCompDialog((cd) => {
                    const d = { ...cd.draft, component_product_id: val ? String(val.id) : '' };
                    if (val) {
                      d.item_code = val.product_code || val.product_uid || '';
                      d.item_name = val.part_name || '';
                      if (val.item_id) {
                        const sel = itemMasterList.find((im) => String(im.id) === String(val.item_id));
                        if (sel) { d.item_id = sel.id; d.item_description = sel.item_description || ''; d.unit_id = sel.unit_id; }
                      } else { d.item_id = ''; d.item_description = ''; d.unit_id = ''; }
                    }
                    return { ...cd, draft: d };
                  })}
                  renderOption={(props, option) => (
                    <Box component="li" {...props} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', py: 0.75, borderBottom: '1px solid #f1f5f9' }}>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: '#d97706', fontFamily: 'monospace' }}>{option.product_code || option.product_uid}</Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>{option.part_name}</Typography>
                    </Box>
                  )}
                  renderInput={(params) => <TextField {...params} label="Link existing Sub-Assembly (reusable)" />}
                />
              )}
              <TextField size="small" fullWidth label="Remark" value={compDialog.draft.remark || ''}
                onChange={(e) => setCompDialog((cd) => ({ ...cd, draft: { ...cd.draft, remark: e.target.value } }))} />
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setCompDialog((d) => ({ ...d, open: false }))} sx={{ textTransform: 'none' }}>Cancel</Button>
          <Button variant="contained" onClick={saveComponent} sx={{ fontWeight: 700, px: 3, textTransform: 'none' }}>Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
