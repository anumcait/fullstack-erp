import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Box, Stack, TextField, MenuItem, Button, FormControlLabel, Switch, Typography, Dialog, DialogTitle, DialogContent, DialogActions, Collapse, useTheme, Paper, Grid, Chip } from '@mui/material';
import { FiFileText, FiBarChart2, FiTruck, FiTrendingUp, FiClock, FiList, FiPackage, FiStar, FiBox, FiUsers, FiShield, FiGrid, FiFilter, FiX, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import axios from 'axios';
import PageHeader from '../../Common/PageHeader';
import DataTable from '../../Common/DataTable';
import ExportButtons from '../../Common/ExportButtons';
import { formatCurrency, formatDate, formatNumber } from '../../../utils/format';

const REPORTS = [
  { key: 'register', label: 'Purchase Register', icon: FiFileText },
  { key: 'po-matrix', label: 'PO Daily Matrix', icon: FiGrid },
  { key: 'vendor', label: 'Vendor Spend Analysis', icon: FiBarChart2 },
  { key: 'trend', label: 'Monthly Purchase Trend', icon: FiTrendingUp },
  { key: 'grn', label: 'GRN Summary', icon: FiTruck },
  { key: 'pending-prs', label: 'Pending PRs', icon: FiClock },
  { key: 'pending-pos', label: 'Pending POs', icon: FiClock },
  { key: 'received', label: 'Received Material', icon: FiTruck },
  { key: 'pr-details', label: 'PR Details', icon: FiList },
  { key: 'rm-inspection', label: 'RM Inspection', icon: FiShield },
  { key: 'supp-summary', label: 'Supplier Summary', icon: FiBarChart2 },
  { key: 'rm-purchase', label: 'RM Purchase', icon: FiPackage },
  { key: 'item-info', label: 'Item Information', icon: FiBox },
  { key: 'party-master', label: 'Party Master', icon: FiUsers },
  { key: 'supplier-rating', label: 'Supplier Rating', icon: FiStar },
];

const STATUS_OPTIONS = ['Draft', 'Pending', 'Approved', 'Rejected', 'Closed'];

const urlFor = (tab) => ({
  register: '/api/erp/purchase/reports/register',
  vendor: '/api/erp/purchase/reports/vendor-spend',
  grn: '/api/erp/purchase/reports/grn-summary',
  trend: '/api/erp/purchase/reports/monthly-trend',
  'pending-prs': '/api/erp/purchase/reports/pending-prs',
  'pending-pos': '/api/erp/purchase/reports/pending-pos',
  received: '/api/erp/purchase/reports/received-material',
  'pr-details': '/api/erp/purchase/reports/pr-details',
  'rm-inspection': '/api/erp/purchase/reports/raw-material-inspection',
  'supp-summary': '/api/erp/purchase/reports/supplier-summary',
  'rm-purchase': '/api/erp/purchase/reports/raw-material-purchase',
  'item-info': '/api/erp/purchase/reports/item-information',
  'party-master': '/api/erp/purchase/reports/party-master',
  'supplier-rating': '/api/erp/purchase/reports/supplier-rating',
  'po-matrix': '/api/erp/purchase/reports/po-matrix',
}[tab]);

const titleFor = {
  register: 'Purchase Order Register',
  vendor: 'Vendor Spend Analysis',
  grn: 'Goods Receipt Summary',
  trend: 'Monthly Purchase Trend',
  'pending-prs': 'Pending Purchase Requisitions',
  'pending-pos': 'Pending Purchase Orders',
  received: 'Received Material Report',
  'pr-details': 'Purchase Requisition Details',
  'rm-inspection': 'Raw Material Inspection Report',
  'supp-summary': 'Supplier Summary',
  'rm-purchase': 'Raw Material Purchase Report',
  'item-info': 'Item Information Report',
  'party-master': 'Party (Vendor) Master Report',
  'supplier-rating': 'Supplier Rating Report',
  'po-matrix': 'PO Daily Matrix',
};

export default function PurchaseReports() {
  const theme = useTheme();
  const [tab, setTab] = useState('register');
  const [suppliers, setSuppliers] = useState([]);
  const [groups, setGroups] = useState([]);
  const todayStr = () => new Date().toISOString().slice(0, 10);
  const thirtyDaysAgo = () => { const d = new Date(); d.setDate(d.getDate() - 30); return d.toISOString().slice(0, 10); };
  const [filters, setFilters] = useState({
    from: thirtyDaysAgo(), to: todayStr(), supplier_id: '', status: '', search: '',
    group_id: '', pr_id: '', taxes: 'with', raw: false,
  });
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    axios.get('/api/erp/purchase/suppliers').then(({ data }) => setSuppliers(data || [])).catch(() => setSuppliers([]));
    axios.get('/api/erp/stores/groups').then(({ data }) => setGroups(data || [])).catch(() => setGroups([]));
  }, []);

  const fetchData = useCallback(() => {
    setLoading(true);
    const params = {};
    const f = filters;
    if (f.from) params.from = f.from;
    if (f.to) params.to = f.to;
    if (f.supplier_id) params.supplier_id = f.supplier_id;
    if (f.status) params.status = f.status;
    if (f.search) params.search = f.search;
    if (f.group_id) params.group_id = f.group_id;
    if (f.pr_id) params.id = f.pr_id;
    params.taxes = f.taxes;
    params.raw = f.raw ? '1' : '0';

    axios.get(urlFor(tab), { params })
      .then(({ data }) => setRows(data || []))
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, [tab, filters]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const set = (key, val) => setFilters((f) => ({ ...f, [key]: val }));
  const clear = () => setFilters({ from: '', to: '', supplier_id: '', status: '', search: '', group_id: '', pr_id: '', taxes: 'with', raw: false });

  const columns = {
    register: [
      { field: 'po_no', header: 'PO No' },
      { field: 'po_date', header: 'PO Date', render: (r) => formatDate(r.po_date) },
      { field: 'supplier_name', header: 'Vendor' },
      { field: 'status', header: 'Status' },
      { field: 'line_items', header: 'Lines', align: 'right', numeric: true },
      { field: 'total_ordered', header: 'Ordered', align: 'right', numeric: true, render: (r) => formatNumber(r.total_ordered) },
      { field: 'total_received', header: 'Received', align: 'right', numeric: true, render: (r) => formatNumber(r.total_received) },
      { field: 'grand_total', header: 'PO Value', align: 'right', numeric: true, render: (r) => formatCurrency(r.grand_total, r.currency) },
    ],
    vendor: [
      { field: 'supplier_name', header: 'Vendor' },
      { field: 'city', header: 'City' },
      { field: 'state', header: 'State' },
      { field: 'po_count', header: 'POs', align: 'right', numeric: true },
      { field: 'po_value', header: 'PO Value', align: 'right', numeric: true, render: (r) => formatCurrency(r.po_value) },
      { field: 'grn_count', header: 'GRNs', align: 'right', numeric: true },
      { field: 'received_value', header: 'Received Value', align: 'right', numeric: true, render: (r) => formatCurrency(r.received_value) },
    ],
    grn: [
      { field: 'supplier_name', header: 'Vendor' },
      { field: 'grn_count', header: 'GRNs', align: 'right', numeric: true },
      { field: 'accepted_qty', header: 'Accepted Qty', align: 'right', numeric: true, render: (r) => formatNumber(r.accepted_qty) },
      { field: 'rejected_qty', header: 'Rejected Qty', align: 'right', numeric: true, render: (r) => formatNumber(r.rejected_qty) },
      { field: 'grn_value', header: 'GRN Value', align: 'right', numeric: true, render: (r) => formatCurrency(r.grn_value) },
    ],
    trend: [
      { field: 'month', header: 'Month' },
      { field: 'po_count', header: 'PO Count', align: 'right', numeric: true },
      { field: 'po_value', header: 'PO Value', align: 'right', numeric: true, render: (r) => formatCurrency(r.po_value) },
    ],
    'pending-prs': [
      { field: 'req_no', header: 'PR No' },
      { field: 'req_date', header: 'Date', render: (r) => formatDate(r.req_date) },
      { field: 'department', header: 'Department' },
      { field: 'priority', header: 'Priority' },
      { field: 'status', header: 'Status' },
      { field: 'lines', header: 'Items', align: 'right', numeric: true, render: (r) => (r.items ? r.items.length : 0) },
    ],
    'pending-pos': [
      { field: 'po_no', header: 'PO No' },
      { field: 'po_date', header: 'PO Date', render: (r) => formatDate(r.po_date) },
      { field: 'supplier_name', header: 'Vendor' },
      { field: 'status', header: 'Status' },
      { field: 'payment_terms', header: 'Terms' },
      { field: 'grand_total', header: 'Value', align: 'right', numeric: true, render: (r) => formatCurrency(r.grand_total) },
    ],
    received: [
      { field: 'grn_no', header: 'GRN No' },
      { field: 'grn_date', header: 'Date', render: (r) => formatDate(r.grn_date) },
      { field: 'supplier_name', header: 'Vendor' },
      { field: 'item_name', header: 'Item' },
      { field: 'accepted_qty', header: 'Accepted', align: 'right', numeric: true, render: (r) => formatNumber(r.accepted_qty) },
      { field: 'rejected_qty', header: 'Rejected', align: 'right', numeric: true, render: (r) => formatNumber(r.rejected_qty) },
      { field: 'rate', header: 'Rate', align: 'right', numeric: true, render: (r) => formatNumber(r.rate) },
      { field: 'amount', header: 'Amount', align: 'right', numeric: true, render: (r) => formatCurrency(r.amount) },
      { field: 'invoice_no', header: 'Invoice' },
    ],
    'pr-details': [
      { field: 'req_no', header: 'PR No' },
      { field: 'req_date', header: 'Date', render: (r) => formatDate(r.req_date) },
      { field: 'department', header: 'Department' },
      { field: 'priority', header: 'Priority' },
      { field: 'status', header: 'Status' },
      { field: 'lines', header: 'Items', align: 'right', numeric: true, render: (r) => (r.items ? r.items.length : 0) },
    ],
    'rm-inspection': [
      { field: 'grn_no', header: 'GRN No' },
      { field: 'grn_date', header: 'Date', render: (r) => formatDate(r.grn_date) },
      { field: 'qa_status', header: 'QA Status' },
      { field: 'supplier_name', header: 'Vendor' },
      { field: 'item_name', header: 'Item' },
      { field: 'accepted_qty', header: 'Accepted', align: 'right', numeric: true, render: (r) => formatNumber(r.accepted_qty) },
      { field: 'rejected_qty', header: 'Rejected', align: 'right', numeric: true, render: (r) => formatNumber(r.rejected_qty) },
    ],
    'supp-summary': [
      { field: 'supplier_name', header: 'Vendor' },
      { field: 'city', header: 'City' },
      { field: 'state', header: 'State' },
      { field: 'po_count', header: 'POs', align: 'right', numeric: true },
      { field: 'total_value', header: filters.taxes === 'with' ? 'Value (with tax)' : 'Value (ex-tax)', align: 'right', numeric: true, render: (r) => formatCurrency(r.total_value) },
    ],
    'rm-purchase': [
      { field: 'grn_no', header: 'GRN No' },
      { field: 'grn_date', header: 'Date', render: (r) => formatDate(r.grn_date) },
      { field: 'supplier_name', header: 'Vendor' },
      { field: 'item_name', header: 'Item' },
      { field: 'accepted_qty', header: 'Qty', align: 'right', numeric: true, render: (r) => formatNumber(r.accepted_qty) },
      { field: 'rate', header: 'Rate', align: 'right', numeric: true, render: (r) => formatNumber(r.rate) },
      { field: 'amount', header: 'Amount', align: 'right', numeric: true, render: (r) => formatCurrency(r.amount) },
    ],
    'item-info': [
      { field: 'item_code', header: 'Code' },
      { field: 'item_name', header: 'Item' },
      { field: 'hsn_code', header: 'HSN' },
      { field: 'gst_rate', header: 'GST%', align: 'right', numeric: true },
      { field: 'current_stock', header: 'Stock', align: 'right', numeric: true, render: (r) => formatNumber(r.current_stock) },
      { field: 'standard_cost', header: 'Std Cost', align: 'right', numeric: true, render: (r) => formatCurrency(r.standard_cost) },
      { field: 'moving_average_cost', header: 'Avg Cost', align: 'right', numeric: true, render: (r) => formatCurrency(r.moving_average_cost) },
      { field: 'abc_class', header: 'ABC' },
    ],
    'party-master': [
      { field: 'supplier_code', header: 'Code' },
      { field: 'supplier_name', header: 'Vendor' },
      { field: 'gstin', header: 'GSTIN' },
      { field: 'city', header: 'City' },
      { field: 'state', header: 'State' },
      { field: 'payment_terms', header: 'Terms' },
      { field: 'is_active', header: 'Active', render: (r) => (r.is_active ? 'Yes' : 'No') },
    ],
    'supplier-rating': [
      { field: 'supplier_name', header: 'Vendor' },
      { field: 'ratings', header: 'Ratings', align: 'right', numeric: true },
      { field: 'avg_quality', header: 'Quality', align: 'right', numeric: true, render: (r) => Number(r.avg_quality).toFixed(1) },
      { field: 'avg_delivery', header: 'Delivery', align: 'right', numeric: true, render: (r) => Number(r.avg_delivery).toFixed(1) },
      { field: 'avg_price', header: 'Price', align: 'right', numeric: true, render: (r) => Number(r.avg_price).toFixed(1) },
      { field: 'overall', header: 'Overall', align: 'right', numeric: true, render: (r) => Number(r.overall).toFixed(1) },
    ],
  }[tab];

  const fmt = (v) => (v === 0 ? "0" : (v ? Number(v).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "-"));

  const matrix = useMemo(() => {
    if (tab !== 'po-matrix' || !rows.length) return null;
    if (!filters.from || !filters.to) return { cols: [], suppliers: [], data: {}, partyTotals: {}, colTotals: {} };
    const dates = [];
    const start = new Date(filters.from);
    const end = new Date(filters.to);
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      dates.push(new Date(d).toISOString().slice(0, 10));
    }
    const lookup = {};
    const supplierSet = new Set();
    const idToName = {};
    rows.forEach((r) => {
      const sid = r.supplier_id;
      const s = r.supplier_name || "Unknown";
      const d = r.po_date ? r.po_date.slice(0, 10) : "";
      if (sid != null) supplierSet.add(sid);
      idToName[sid] = s;
      if (!lookup[sid]) lookup[sid] = {};
      lookup[sid][d] = (lookup[sid][d] || 0) + Number(r.amount || 0);
    });
    const suppliers = Array.from(supplierSet).sort((a, b) => (idToName[a] || '').localeCompare(idToName[b] || ''));
    const partyTotals = {};
    const colTotals = {};
    suppliers.forEach((sid) => { partyTotals[sid] = dates.reduce((sum, d) => sum + (lookup[sid]?.[d] || 0), 0); });
    dates.forEach((d) => { colTotals[d] = suppliers.reduce((sum, sid) => sum + (lookup[sid]?.[d] || 0), 0); });
    return { cols: dates, suppliers, lookup, partyTotals, colTotals, idToName };
  }, [tab, rows, filters.from, filters.to]);

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <PageHeader title="Purchase Reports" subtitle="Procurement analytics, spend analysis & compliance reporting" icon={<FiBarChart2 size={22} />} />

      <Box sx={{ mb: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 2, py: 1.5, bgcolor: '#fafbfc' }}>
          <TextField label="From" type="date" size="small" value={filters.from} onChange={(e) => set('from', e.target.value)} InputLabelProps={{ shrink: true }} sx={{ minWidth: 140 }} />
          <TextField label="To" type="date" size="small" value={filters.to} onChange={(e) => set('to', e.target.value)} InputLabelProps={{ shrink: true }} sx={{ minWidth: 140 }} />
          <Button variant="contained" startIcon={<FiFilter />} onClick={fetchData} sx={{ textTransform: 'none', fontWeight: 600, height: 36 }}>Load</Button>
          <Box sx={{ flex: 1 }} />
          <Button size="small" onClick={() => setShowFilters(!showFilters)}
            endIcon={showFilters ? <FiChevronUp /> : <FiChevronDown />}
            sx={{ textTransform: 'none', color: '#64748b', fontSize: '0.8rem' }}>
            {showFilters ? 'Less' : 'More'} Filters
          </Button>
          {showFilters && (
            <Button size="small" startIcon={<FiX />} onClick={clear} sx={{ textTransform: 'none', color: '#64748b', fontSize: '0.8rem' }}>
              Clear
            </Button>
          )}
        </Box>
        <Collapse in={showFilters}>
          <Box sx={{ px: 2, pb: 1.5, pt: 0.5, borderTop: '1px solid', borderColor: 'divider', bgcolor: '#fff' }}>
            <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap sx={{ '& > *': { minWidth: 140 } }}>
              <TextField select label="Vendor" size="small" value={filters.supplier_id} onChange={(e) => set('supplier_id', e.target.value)}>
                <MenuItem value="">All Vendors</MenuItem>
                {suppliers.map((s) => <MenuItem key={s.id} value={s.id}>{s.supplier_name}</MenuItem>)}
              </TextField>
              <TextField select label="Status" size="small" value={filters.status} onChange={(e) => set('status', e.target.value)}>
                <MenuItem value="">All Status</MenuItem>
                {STATUS_OPTIONS.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
              </TextField>
              <TextField label="Search" size="small" value={filters.search} onChange={(e) => set('search', e.target.value)} placeholder="PO No / Item" />
              <TextField select label="Item Group" size="small" value={filters.group_id} onChange={(e) => set('group_id', e.target.value)}>
                <MenuItem value="">All Groups</MenuItem>
                {groups.map((g) => <MenuItem key={g.id} value={g.id}>{g.name}</MenuItem>)}
              </TextField>
              <TextField label="PR / Req ID" size="small" value={filters.pr_id} onChange={(e) => set('pr_id', e.target.value)} placeholder="ID" />
              <TextField select label="Tax Basis" size="small" value={filters.taxes} onChange={(e) => set('taxes', e.target.value)}>
                <MenuItem value="with">With Taxes</MenuItem>
                <MenuItem value="without">Without Taxes</MenuItem>
              </TextField>
              <FormControlLabel control={<Switch checked={filters.raw} onChange={(e) => set('raw', e.target.checked)} />} label="Raw Only" sx={{ mb: 0 }} />
            </Stack>
          </Box>
        </Collapse>
      </Box>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
        {REPORTS.map((r) => {
          const Icon = r.icon;
          const active = tab === r.key;
          return (
            <Box key={r.key} onClick={() => setTab(r.key)}
              sx={{
                display: 'flex', alignItems: 'center', gap: 0.75, px: 1.5, py: 0.6, borderRadius: 1.5,
                cursor: 'pointer', userSelect: 'none', transition: 'all 0.15s',
                bgcolor: active ? theme.palette.primary.main : 'transparent',
                color: active ? '#fff' : theme.palette.text.secondary,
                fontWeight: active ? 700 : 500,
                fontSize: '0.8rem',
                border: active ? 'none' : `1px solid ${theme.palette.divider}`,
                boxShadow: active ? `0 2px 8px ${theme.palette.primary.main}33` : 'none',
                '&:hover': {
                  bgcolor: active ? theme.palette.primary.dark : theme.palette.action.hover,
                  transform: 'translateY(-1px)',
                  boxShadow: active ? `0 4px 12px ${theme.palette.primary.main}44` : 'none',
                },
              }}>
              <Icon size={13} />
              <span>{r.label}</span>
            </Box>
          );
        })}
      </Box>

      <Box sx={{ mt: 2 }}>
        {tab === 'po-matrix' && matrix ? (
          <POMatrixTable matrix={matrix} loading={loading} fmt={fmt} rows={rows} filters={filters} />
        ) : (
          <DataTable title={titleFor[tab]} columns={columns} rows={rows} loading={loading} />
        )}
      </Box>
    </Box>
  );
}

function POMatrixTable({ matrix, loading, fmt, rows: apiRows, filters }) {
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailData, setDetailData] = useState([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailTitle, setDetailTitle] = useState('');

  if (loading) return null;
  const { cols, suppliers, lookup, partyTotals, colTotals, idToName } = matrix;
  const grandTotal = suppliers.reduce((s, sid) => s + (partyTotals[sid] || 0), 0);

  const shortDate = (iso) => {
    if (!iso) return "";
    const d = new Date(iso + "T00:00:00");
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${months[d.getMonth()]}-${String(d.getDate()).padStart(2, "0")}`;
  };

  const openDetail = async (supplierId, date, supplierName) => {
    setDetailTitle(`${supplierName} — ${shortDate(date)}`);
    setDetailLoading(true);
    setDetailOpen(true);
    try {
      const { data } = await axios.get('/api/erp/purchase/reports/po-matrix-detail', {
        params: { supplier_id: supplierId, date },
      });
      setDetailData(data || []);
    } catch {
      setDetailData([]);
    } finally {
      setDetailLoading(false);
    }
  };

  const exportCols = [
    { field: 'supplier', header: 'Party' },
    ...cols.map((d) => ({ field: d, header: shortDate(d), type: 'numeric' })),
    { field: '_total', header: 'Total', type: 'numeric' },
  ];

  const exportRows = suppliers.map((sid) => {
    const row = { supplier: idToName[sid] || `#${sid}` };
    cols.forEach((d) => { row[d] = lookup[sid]?.[d] || 0; });
    row._total = partyTotals[sid] || 0;
    return row;
  });

  const cellSx = { p: "3px 6px", fontSize: "0.78rem", whiteSpace: "nowrap", textAlign: "right", border: "1px solid #e2e8f0", minWidth: 80 };
  const headerSx = { ...cellSx, fontWeight: 700, bgcolor: "#f1f5f9", position: "sticky", top: 0, zIndex: 2, textAlign: "center" };
  const stickySx = (isTotal) => ({
    ...cellSx, textAlign: "left", position: "sticky", left: 0, zIndex: isTotal ? 3 : 1,
    bgcolor: isTotal ? "#f8fafc" : "#fff", fontWeight: 600,
    minWidth: 180, maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis",
    boxShadow: "2px 0 6px rgba(0,0,0,0.06)",
  });
  const totalRowSx = { ...cellSx, fontWeight: 700, bgcolor: "#f8fafc", borderTop: "2px solid #94a3b8" };

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
        <ExportButtons title="PO Daily Matrix" columns={exportCols} rows={exportRows} fileName={`PO_Matrix_${filters.from}_${filters.to}`} />
      </Box>
      <Box sx={{ border: "1px solid #e2e8f0", borderRadius: 2, overflow: "auto", maxHeight: "calc(100vh - 340px)" }}>
        <table style={{ borderCollapse: "collapse", width: "max-content", minWidth: "100%" }}>
          <thead>
            <tr>
              <th style={{ ...headerSx, textAlign: "left", left: 0, zIndex: 3, minWidth: 180, maxWidth: 180, boxShadow: "2px 0 6px rgba(0,0,0,0.06)" }}>Party</th>
              {cols.map((d) => <th key={d} style={headerSx}>{shortDate(d)}</th>)}
              <th style={{ ...headerSx, minWidth: 100, bgcolor: "#e2e8f0" }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {suppliers.map((sid) => {
              const name = idToName[sid] || `#${sid}`;
              return (
                <tr key={sid}>
                  <td style={stickySx(false)} title={name}>{name}</td>
                  {cols.map((d) => (
                    <td key={d}
                      onClick={() => lookup[sid]?.[d] ? openDetail(sid, d, name) : null}
                      style={{ ...cellSx, cursor: lookup[sid]?.[d] ? 'pointer' : 'default', color: lookup[sid]?.[d] ? "#1e293b" : "#cbd5e1" }}
                      onMouseEnter={(e) => { if (lookup[sid]?.[d]) e.currentTarget.style.background = '#eff6ff'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = ''; }}>
                      {fmt(lookup[sid]?.[d])}
                    </td>
                  ))}
                  <td style={{ ...cellSx, fontWeight: 700, bgcolor: "#f1f5f9" }}>{fmt(partyTotals[sid])}</td>
                </tr>
              );
            })}
            <tr>
              <td style={{ ...stickySx(true), left: 0, zIndex: 3, boxShadow: "2px 0 6px rgba(0,0,0,0.06)" }}>Total</td>
              {cols.map((d) => <td key={d} style={totalRowSx}>{fmt(colTotals[d])}</td>)}
              <td style={{ ...totalRowSx, bgcolor: "#e2e8f0" }}>{fmt(grandTotal)}</td>
            </tr>
          </tbody>
        </table>
      </Box>

      <Dialog open={detailOpen} onClose={() => setDetailOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, fontSize: '1rem', pb: 1 }}>{detailTitle}</DialogTitle>
        <DialogContent>
          {detailLoading ? (
            <Typography sx={{ py: 4, textAlign: 'center', color: 'text.secondary' }}>Loading...</Typography>
          ) : detailData.length === 0 ? (
            <Typography sx={{ py: 4, textAlign: 'center', color: 'text.secondary' }}>No PO details found</Typography>
          ) : (
            <Stack spacing={2} sx={{ pt: 0.5 }}>
              {detailData.map((po, i) => (
                <Paper key={i} sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'primary.main' }}>{po.po_no}</Typography>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography variant="caption" color="text.secondary">{formatDate(po.po_date)}</Typography>
                      <Chip label={po.status} size="small" color={po.status === 'Approved' ? 'success' : po.status === 'Draft' ? 'default' : 'warning'} />
                    </Stack>
                  </Stack>

                  <Grid container spacing={2} sx={{ mb: 1.5 }}>
                    <Grid item xs={4}>
                      <Typography variant="caption" color="text.secondary" display="block">Vendor</Typography>
                      <Typography variant="body2" fontWeight={600}>{po.supplier_name}</Typography>
                    </Grid>
                    <Grid item xs={2}>
                      <Typography variant="caption" color="text.secondary" display="block">Req Date</Typography>
                      <Typography variant="body2" fontWeight={600}>{formatDate(po.req_date) || '—'}</Typography>
                    </Grid>
                    <Grid item xs={2}>
                      <Typography variant="caption" color="text.secondary" display="block">Currency</Typography>
                      <Typography variant="body2" fontWeight={600}>{po.currency || 'INR'}</Typography>
                    </Grid>
                    <Grid item xs={4}>
                      <Typography variant="caption" color="text.secondary" display="block">Grand Total</Typography>
                      <Typography variant="body2" fontWeight={700} color="primary.main">{formatCurrency(po.grand_total, po.currency)}</Typography>
                    </Grid>
                  </Grid>

                  {(po.payment_terms || po.delivery_terms) && (
                    <Grid container spacing={2} sx={{ mb: 1.5 }}>
                      {po.payment_terms && (
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary" display="block" fontWeight={600}>Payment Terms</Typography>
                          <Typography variant="body2">{po.payment_terms}</Typography>
                        </Grid>
                      )}
                      {po.delivery_terms && (
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary" display="block" fontWeight={600}>Delivery Terms</Typography>
                          <Typography variant="body2">{po.delivery_terms}</Typography>
                        </Grid>
                      )}
                    </Grid>
                  )}

                  {po.items && po.items.length > 0 && (
                    <Box sx={{ mb: 1.5 }}>
                      <Typography variant="caption" color="text.secondary" display="block" fontWeight={600} sx={{ mb: 0.5 }}>Items</Typography>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
                        <thead>
                          <tr>
                            <th style={{ textAlign: 'left', padding: '4px 8px', fontWeight: 600, borderBottom: '1px solid #e2e8f0', color: '#64748b' }}>Item</th>
                            <th style={{ textAlign: 'right', padding: '4px 8px', fontWeight: 600, borderBottom: '1px solid #e2e8f0', color: '#64748b' }}>Qty</th>
                            <th style={{ textAlign: 'right', padding: '4px 8px', fontWeight: 600, borderBottom: '1px solid #e2e8f0', color: '#64748b' }}>Rate</th>
                            <th style={{ textAlign: 'right', padding: '4px 8px', fontWeight: 600, borderBottom: '1px solid #e2e8f0', color: '#64748b' }}>Disc%</th>
                            <th style={{ textAlign: 'right', padding: '4px 8px', fontWeight: 600, borderBottom: '1px solid #e2e8f0', color: '#64748b' }}>GST%</th>
                            <th style={{ textAlign: 'right', padding: '4px 8px', fontWeight: 600, borderBottom: '1px solid #e2e8f0', color: '#64748b' }}>SGST</th>
                            <th style={{ textAlign: 'right', padding: '4px 8px', fontWeight: 600, borderBottom: '1px solid #e2e8f0', color: '#64748b' }}>CGST</th>
                            <th style={{ textAlign: 'right', padding: '4px 8px', fontWeight: 600, borderBottom: '1px solid #e2e8f0', color: '#64748b' }}>IGST</th>
                            <th style={{ textAlign: 'right', padding: '4px 8px', fontWeight: 600, borderBottom: '1px solid #e2e8f0', color: '#64748b' }}>Amount</th>
                          </tr>
                        </thead>
                        <tbody>
                          {po.items.map((it, idx) => (
                            <tr key={idx}>
                              <td style={{ padding: '4px 8px', borderBottom: '1px solid #f1f5f9' }}>
                                <Typography variant="body2" fontWeight={600}>{it.item_code}</Typography>
                                <Typography variant="caption" color="text.secondary">{it.item_name}</Typography>
                              </td>
                              <td style={{ padding: '4px 8px', borderBottom: '1px solid #f1f5f9', textAlign: 'right' }}>{Number(it.qty).toLocaleString('en-IN')}</td>
                              <td style={{ padding: '4px 8px', borderBottom: '1px solid #f1f5f9', textAlign: 'right' }}>{formatCurrency(it.rate)}</td>
                              <td style={{ padding: '4px 8px', borderBottom: '1px solid #f1f5f9', textAlign: 'right' }}>{it.disc_percent ? `${it.disc_percent}%` : '—'}</td>
                              <td style={{ padding: '4px 8px', borderBottom: '1px solid #f1f5f9', textAlign: 'right' }}>{Number(it.gst_rate || 0) > 0 ? `${it.gst_rate}%` : '—'}</td>
                              <td style={{ padding: '4px 8px', borderBottom: '1px solid #f1f5f9', textAlign: 'right' }}>{Number(it.sgst_inr || 0) > 0 ? formatCurrency(it.sgst_inr) : '—'}</td>
                              <td style={{ padding: '4px 8px', borderBottom: '1px solid #f1f5f9', textAlign: 'right' }}>{Number(it.cgst_inr || 0) > 0 ? formatCurrency(it.cgst_inr) : '—'}</td>
                              <td style={{ padding: '4px 8px', borderBottom: '1px solid #f1f5f9', textAlign: 'right' }}>{Number(it.igst_inr || 0) > 0 ? formatCurrency(it.igst_inr) : '—'}</td>
                              <td style={{ padding: '4px 8px', borderBottom: '1px solid #f1f5f9', textAlign: 'right', fontWeight: 600 }}>{formatCurrency(it.total_value)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </Box>
                  )}

                  {po.subtotal > 0 && (
                    <Stack direction="row" justifyContent="flex-end" spacing={3} sx={{ mb: 0.5, pr: 1 }}>
                      <Box>
                        <Typography variant="caption" color="text.secondary" display="block">Subtotal</Typography>
                        <Typography variant="body2" textAlign="right">{formatCurrency(po.subtotal)}</Typography>
                      </Box>
                      {po.discount_amount > 0 && (
                        <Box>
                          <Typography variant="caption" color="text.secondary" display="block">Discount ({po.discount_percent || 0}%)</Typography>
                          <Typography variant="body2" textAlign="right" color="error">-{formatCurrency(po.discount_amount)}</Typography>
                        </Box>
                      )}
                      {po.tax_amount > 0 && (
                        <Box>
                          <Typography variant="caption" color="text.secondary" display="block">Tax</Typography>
                          <Typography variant="body2" textAlign="right">{formatCurrency(po.tax_amount)}</Typography>
                        </Box>
                      )}
                      <Box>
                        <Typography variant="caption" color="primary.main" display="block" fontWeight={600}>Total</Typography>
                        <Typography variant="body2" textAlign="right" fontWeight={700} color="primary.main">{formatCurrency(po.grand_total, po.currency)}</Typography>
                      </Box>
                    </Stack>
                  )}

                  {po.notes && (
                    <Box sx={{ mt: 0.5, p: 1, bgcolor: '#f8fafc', borderRadius: 1 }}>
                      <Typography variant="caption" color="text.secondary" fontWeight={600}>Notes</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>{po.notes}</Typography>
                    </Box>
                  )}
                </Paper>
              ))}
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailOpen(false)} variant="contained" sx={{ textTransform: 'none' }}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
