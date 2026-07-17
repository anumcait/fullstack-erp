import React, { useEffect, useState, useCallback } from 'react';
import { Box, Tabs, Tab, Stack, TextField, MenuItem, Button, FormControlLabel, Switch } from '@mui/material';
import { FiFileText, FiBarChart2, FiTruck, FiTrendingUp, FiFilter, FiX, FiClock, FiList, FiPackage, FiStar, FiBox, FiUsers, FiShield } from 'react-icons/fi';
import axios from 'axios';
import PageHeader from '../../Common/PageHeader';
import DataTable from '../../Common/DataTable';
import { formatCurrency, formatDate, formatNumber } from '../../../utils/format';

const TABS = [
  { key: 'register', label: 'Purchase Register', icon: <FiFileText />, filters: ['from', 'to', 'supplier', 'status', 'search'] },
  { key: 'vendor', label: 'Vendor Spend', icon: <FiBarChart2 />, filters: ['from', 'to'] },
  { key: 'grn', label: 'GRN Summary', icon: <FiTruck />, filters: ['from', 'to', 'supplier'] },
  { key: 'trend', label: 'Monthly Trend', icon: <FiTrendingUp />, filters: ['from', 'to'] },
  { key: 'pending-prs', label: 'Pending PRs', icon: <FiClock />, filters: [] },
  { key: 'pending-pos', label: 'Pending POs', icon: <FiClock />, filters: [] },
  { key: 'received', label: 'Received Material', icon: <FiTruck />, filters: ['from', 'to', 'supplier'] },
  { key: 'pr-details', label: 'PR Details', icon: <FiList />, filters: ['pr'] },
  { key: 'rm-inspection', label: 'RM Inspection', icon: <FiShield />, filters: ['from', 'to'] },
  { key: 'supp-summary', label: 'Supplier Summary', icon: <FiBarChart2 />, filters: ['from', 'to', 'taxes', 'raw'] },
  { key: 'rm-purchase', label: 'RM Purchase', icon: <FiPackage />, filters: ['from', 'to', 'supplier'] },
  { key: 'item-info', label: 'Item Information', icon: <FiBox />, filters: ['group', 'search'] },
  { key: 'party-master', label: 'Party Master', icon: <FiUsers />, filters: [] },
  { key: 'supplier-rating', label: 'Supplier Rating', icon: <FiStar />, filters: [] },
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
  'supp-summary': 'Supplier Summary (with / without taxes)',
  'rm-purchase': 'Raw Material Purchase Report',
  'item-info': 'Item Information Report',
  'party-master': 'Party (Vendor) Master Report',
  'supplier-rating': 'Supplier Rating Report',
};

export default function PurchaseReports() {
  const [tab, setTab] = useState('register');
  const [suppliers, setSuppliers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [filters, setFilters] = useState({
    from: '', to: '', supplier_id: '', status: '', search: '',
    group_id: '', pr_id: '', taxes: 'with', raw: false,
  });
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

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
    if (tab === 'supp-summary') {
      params.taxes = f.taxes;
      params.raw = f.raw ? '1' : '0';
    }

    axios.get(urlFor(tab), { params })
      .then(({ data }) => setRows(data || []))
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, [tab, filters]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const set = (key, val) => setFilters((f) => ({ ...f, [key]: val }));

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
      { field: 'total_value', header: tab === 'supp-summary' && filters.taxes === 'with' ? 'Value (with tax)' : 'Value (ex-tax)', align: 'right', numeric: true, render: (r) => formatCurrency(r.total_value) },
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

  const cur = TABS.find((t) => t.key === tab);
  const has = (f) => cur.filters.includes(f);

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <PageHeader title="Purchase Reports" subtitle="Procurement analytics, spend analysis & compliance reporting" icon={<FiBarChart2 size={22} />} />

      <Tabs value={tab} onChange={(e, v) => setTab(v)} variant="scrollable" scrollButtons="auto" sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}>
        {TABS.map((t) => (
          <Tab key={t.key} value={t.key} label={t.label} icon={t.icon} iconPosition="start" />
        ))}
      </Tabs>

      {cur.filters.length > 0 && (
        <PaperFilter>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} alignItems="flex-end" flexWrap="wrap">
            {has('from') && (
              <TextField label="From" type="date" size="small" value={filters.from} onChange={(e) => set('from', e.target.value)} InputLabelProps={{ shrink: true }} />
            )}
            {has('to') && (
              <TextField label="To" type="date" size="small" value={filters.to} onChange={(e) => set('to', e.target.value)} InputLabelProps={{ shrink: true }} />
            )}
            {has('supplier') && (
              <TextField select label="Vendor" size="small" sx={{ minWidth: 200 }} value={filters.supplier_id} onChange={(e) => set('supplier_id', e.target.value)}>
                <MenuItem value="">All Vendors</MenuItem>
                {suppliers.map((s) => <MenuItem key={s.id} value={s.id}>{s.supplier_name}</MenuItem>)}
              </TextField>
            )}
            {has('status') && (
              <TextField select label="Status" size="small" sx={{ minWidth: 150 }} value={filters.status} onChange={(e) => set('status', e.target.value)}>
                <MenuItem value="">All Status</MenuItem>
                {STATUS_OPTIONS.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
              </TextField>
            )}
            {has('search') && tab === 'register' && (
              <TextField label="Search PO No" size="small" value={filters.search} onChange={(e) => set('search', e.target.value)} />
            )}
            {has('search') && tab === 'item-info' && (
              <TextField label="Search Item" size="small" value={filters.search} onChange={(e) => set('search', e.target.value)} />
            )}
            {has('group') && (
              <TextField select label="Item Group" size="small" sx={{ minWidth: 180 }} value={filters.group_id} onChange={(e) => set('group_id', e.target.value)}>
                <MenuItem value="">All Groups</MenuItem>
                {groups.map((g) => <MenuItem key={g.id} value={g.id}>{g.name}</MenuItem>)}
              </TextField>
            )}
            {has('pr') && (
              <TextField label="PR / Req ID" size="small" value={filters.pr_id} onChange={(e) => set('pr_id', e.target.value)} />
            )}
            {has('taxes') && (
              <TextField select label="Tax Basis" size="small" sx={{ minWidth: 160 }} value={filters.taxes} onChange={(e) => set('taxes', e.target.value)}>
                <MenuItem value="with">With Taxes</MenuItem>
                <MenuItem value="without">Without Taxes</MenuItem>
              </TextField>
            )}
            {has('raw') && (
              <FormControlLabel control={<Switch checked={filters.raw} onChange={(e) => set('raw', e.target.checked)} />} label="Raw Material Only" />
            )}
            <Button variant="contained" startIcon={<FiFilter />} onClick={fetchData}>Apply</Button>
            <Button variant="text" startIcon={<FiX />} onClick={() => setFilters({ from: '', to: '', supplier_id: '', status: '', search: '', group_id: '', pr_id: '', taxes: 'with', raw: false })}>Clear</Button>
          </Stack>
        </PaperFilter>
      )}

      <Box sx={{ mt: 2 }}>
        <DataTable title={titleFor[tab]} columns={columns} rows={rows} loading={loading} />
      </Box>
    </Box>
  );
}

const PaperFilter = ({ children }) => (
  <Box sx={{ p: 2, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>{children}</Box>
);
