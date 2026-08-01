import React, { useEffect, useState, useCallback } from 'react';
import { Box, Tabs, Tab, Stack, TextField, MenuItem, Button, Typography } from '@mui/material';
import { FiBox, FiAlertTriangle, FiActivity, FiPieChart, FiFilter, FiX, FiClock, FiTrendingDown, FiTrendingUp, FiAlertOctagon, FiPackage, FiMapPin, FiLayers, FiSliders, FiDollarSign, FiShield, FiRefreshCw } from 'react-icons/fi';
import axios from 'axios';
import PageHeader from '../../Common/PageHeader';
import DataTable from '../../Common/DataTable';
import { formatCurrency, formatNumber } from '../../../utils/format';

const today = () => new Date().toISOString().slice(0, 10);

const TABS = [
  { key: 'valuation', label: 'Valuation', icon: <FiBox /> },
  { key: 'valuation_asof', label: 'Valuation As-on Date', icon: <FiClock /> },
  { key: 'lowstock', label: 'Low Stock', icon: <FiAlertTriangle /> },
  { key: 'movement', label: 'Stock Movement', icon: <FiActivity /> },
  { key: 'abc', label: 'ABC Analysis', icon: <FiPieChart /> },
  { key: 'aging', label: 'Stock Aging', icon: <FiClock /> },
  { key: 'slow', label: 'Slow Moving', icon: <FiTrendingDown /> },
  { key: 'fast', label: 'Fast Moving', icon: <FiTrendingUp /> },
  { key: 'negative', label: 'Negative Stock', icon: <FiAlertOctagon /> },
  { key: 'dead', label: 'Dead Stock', icon: <FiPackage /> },
  { key: 'warehouse', label: 'Warehouse-wise', icon: <FiMapPin /> },
  { key: 'batch', label: 'Batch Report', icon: <FiLayers /> },
  { key: 'adjustments', label: 'Adjustments', icon: <FiSliders /> },
  { key: 'pl', label: 'Item P&L', icon: <FiDollarSign /> },
  { key: 'audit', label: 'Audit Trail', icon: <FiShield /> },
  { key: 'recon', label: 'Reconciliation', icon: <FiRefreshCw /> },
];

const COLUMNS = {
  valuation: [
    { field: 'item_code', header: 'Item Code' },
    { field: 'item_name', header: 'Item Name' },
    { field: 'group_name', header: 'Group' },
    { field: 'current_stock', header: 'Stock', align: 'right', numeric: true, render: (r) => formatNumber(r.current_stock) },
    { field: 'unit', header: 'UoM' },
    { field: 'unit_cost', header: 'Unit Cost', align: 'right', numeric: true, render: (r) => formatCurrency(r.unit_cost) },
    { field: 'stock_value', header: 'Stock Value', align: 'right', numeric: true, render: (r) => formatCurrency(r.stock_value) },
  ],
  valuation_asof: [
    { field: 'item_code', header: 'Item Code' },
    { field: 'item_name', header: 'Item Name' },
    { field: 'group_name', header: 'Group' },
    { field: 'on_hand', header: 'On Hand', align: 'right', numeric: true, render: (r) => formatNumber(r.on_hand) },
    { field: 'unit', header: 'UoM' },
    { field: 'unit_cost', header: 'Unit Cost', align: 'right', numeric: true, render: (r) => formatCurrency(r.unit_cost) },
    { field: 'stock_value', header: 'Stock Value', align: 'right', numeric: true, render: (r) => formatCurrency(r.stock_value) },
  ],
  lowstock: [
    { field: 'item_code', header: 'Item Code' },
    { field: 'item_name', header: 'Item Name' },
    { field: 'group_name', header: 'Group' },
    { field: 'current_stock', header: 'On Hand', align: 'right', numeric: true, render: (r) => formatNumber(r.current_stock) },
    { field: 'reorder_level', header: 'Reorder', align: 'right', numeric: true, render: (r) => formatNumber(r.reorder_level) },
    { field: 'min_stock', header: 'Min', align: 'right', numeric: true, render: (r) => formatNumber(r.min_stock) },
    { field: 'shortfall', header: 'Shortfall', align: 'right', numeric: true, render: (r) => formatNumber(r.shortfall) },
  ],
  movement: [
    { field: 'item_code', header: 'Item Code' },
    { field: 'item_name', header: 'Item Name' },
    { field: 'inward_qty', header: 'Inward Qty', align: 'right', numeric: true, render: (r) => formatNumber(r.inward_qty) },
    { field: 'inward_value', header: 'Inward Value', align: 'right', numeric: true, render: (r) => formatCurrency(r.inward_value) },
    { field: 'outward_qty', header: 'Outward Qty', align: 'right', numeric: true, render: (r) => formatNumber(r.outward_qty) },
    { field: 'outward_rows', header: 'Issue Details', align: 'left', render: (r) => {
      if (!r.outward_rows || r.outward_rows.length === 0) return '—';
      return r.outward_rows.map((o, i) => {
        const d = o.issue_date ? new Date(o.issue_date).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '';
        return <div key={i} style={{ fontSize: '0.75rem', lineHeight: '1.7', borderBottom: i < r.outward_rows.length - 1 ? '1px dashed #e0e0e0' : 'none', padding: '2px 0' }}>
          <strong>{o.issue_no}</strong> — {d} — {formatNumber(o.outward_qty)} qty
        </div>;
      });
    } },
  ],
  abc: [
    { field: 'class', header: 'Class' },
    { field: 'item_count', header: 'Item Count', align: 'right', numeric: true },
    { field: 'class_value', header: 'Value', align: 'right', numeric: true, render: (r) => formatCurrency(r.class_value) },
  ],
  aging: [
    { field: 'item_code', header: 'Item Code' },
    { field: 'item_name', header: 'Item Name' },
    { field: 'group_name', header: 'Group' },
    { field: 'on_hand', header: 'On Hand', align: 'right', numeric: true, render: (r) => formatNumber(r.on_hand) },
    { field: 'last_inward', header: 'Last Inward', render: (r) => r.last_inward ? new Date(r.last_inward).toISOString().slice(0, 10) : '—' },
    { field: 'age_days', header: 'Age (days)', align: 'right', numeric: true },
  ],
  slow: [
    { field: 'item_code', header: 'Item Code' },
    { field: 'item_name', header: 'Item Name' },
    { field: 'group_name', header: 'Group' },
    { field: 'on_hand', header: 'On Hand', align: 'right', numeric: true, render: (r) => formatNumber(r.on_hand) },
    { field: 'issued_qty', header: 'Issued', align: 'right', numeric: true, render: (r) => formatNumber(r.issued_qty) },
    { field: 'days_of_supply', header: 'Days of Supply', align: 'right', numeric: true },
  ],
  fast: [
    { field: 'item_code', header: 'Item Code' },
    { field: 'item_name', header: 'Item Name' },
    { field: 'group_name', header: 'Group' },
    { field: 'on_hand', header: 'On Hand', align: 'right', numeric: true, render: (r) => formatNumber(r.on_hand) },
    { field: 'issued_qty', header: 'Issued', align: 'right', numeric: true, render: (r) => formatNumber(r.issued_qty) },
    { field: 'daily_usage', header: 'Daily Usage', align: 'right', numeric: true, render: (r) => formatNumber(r.daily_usage) },
  ],
  negative: [
    { field: 'item_code', header: 'Item Code' },
    { field: 'item_name', header: 'Item Name' },
    { field: 'group_name', header: 'Group' },
    { field: 'on_hand', header: 'Ledger Qty', align: 'right', numeric: true, render: (r) => <span style={{ color: '#d32f2f', fontWeight: 700 }}>{formatNumber(r.on_hand)}</span> },
    { field: 'current_stock', header: 'System Qty', align: 'right', numeric: true },
    { field: 'reorder_level', header: 'Reorder', align: 'right', numeric: true },
  ],
  dead: [
    { field: 'item_code', header: 'Item Code' },
    { field: 'item_name', header: 'Item Name' },
    { field: 'group_name', header: 'Group' },
    { field: 'on_hand', header: 'On Hand', align: 'right', numeric: true, render: (r) => formatNumber(r.on_hand) },
    { field: 'stock_value', header: 'Value', align: 'right', numeric: true, render: (r) => formatCurrency(r.stock_value) },
    { field: 'last_move', header: 'Last Movement', render: (r) => r.last_move ? new Date(r.last_move).toISOString().slice(0, 10) : '—' },
    { field: 'idle_days', header: 'Idle Days', align: 'right', numeric: true },
  ],
  warehouse: [
    { field: 'warehouse_code', header: 'Code' },
    { field: 'warehouse_name', header: 'Warehouse' },
    { field: 'item_count', header: 'Items', align: 'right', numeric: true },
    { field: 'on_hand_qty', header: 'On Hand Qty', align: 'right', numeric: true, render: (r) => formatNumber(r.on_hand_qty) },
    { field: 'stock_value', header: 'Stock Value', align: 'right', numeric: true, render: (r) => formatCurrency(r.stock_value) },
  ],
  batch: [
    { field: 'batch_no', header: 'Batch No' },
    { field: 'item_code', header: 'Item Code' },
    { field: 'item_name', header: 'Item Name' },
    { field: 'quantity', header: 'Qty', align: 'right', numeric: true, render: (r) => formatNumber(r.quantity) },
    { field: 'unit', header: 'UoM' },
    { field: 'mfg_date', header: 'Mfg Date' },
    { field: 'exp_date', header: 'Expiry' },
  ],
  adjustments: [
    { field: 'ledger_date', header: 'Date', render: (r) => r.ledger_date ? new Date(r.ledger_date).toISOString().slice(0, 10) : '—' },
    { field: 'doc_no', header: 'Doc No' },
    { field: 'item_code', header: 'Item Code' },
    { field: 'item_name', header: 'Item Name' },
    { field: 'warehouse_name', header: 'Warehouse' },
    { field: 'qty_in', header: 'Qty In', align: 'right', numeric: true, render: (r) => formatNumber(r.qty_in) },
    { field: 'qty_out', header: 'Qty Out', align: 'right', numeric: true, render: (r) => formatNumber(r.qty_out) },
    { field: 'remarks', header: 'Remarks' },
    { field: 'created_by', header: 'User' },
  ],
  pl: [
    { field: 'item_code', header: 'Item Code' },
    { field: 'item_name', header: 'Item Name' },
    { field: 'group_name', header: 'Group' },
    { field: 'sold_qty', header: 'Sold Qty', align: 'right', numeric: true, render: (r) => formatNumber(r.sold_qty) },
    { field: 'sales_value', header: 'Sales', align: 'right', numeric: true, render: (r) => formatCurrency(r.sales_value) },
    { field: 'cogs_value', header: 'COGS', align: 'right', numeric: true, render: (r) => formatCurrency(r.cogs_value) },
    { field: 'gross_profit', header: 'Gross P&L', align: 'right', numeric: true, render: (r) => <span style={{ color: r.gross_profit >= 0 ? '#2e7d32' : '#d32f2f', fontWeight: 700 }}>{formatCurrency(r.gross_profit)}</span> },
  ],
  audit: [
    { field: 'ledger_date', header: 'Date/Time', render: (r) => r.ledger_date ? new Date(r.ledger_date).toLocaleString('en-IN') : '—' },
    { field: 'ref_type', header: 'Type' },
    { field: 'doc_no', header: 'Doc No' },
    { field: 'item_code', header: 'Item' },
    { field: 'warehouse_name', header: 'Warehouse' },
    { field: 'qty_in', header: 'In', align: 'right', numeric: true },
    { field: 'qty_out', header: 'Out', align: 'right', numeric: true },
    { field: 'created_by', header: 'User' },
    { field: 'remarks', header: 'Remarks' },
  ],
  recon: [
    { field: 'item_code', header: 'Item Code' },
    { field: 'item_name', header: 'Item Name' },
    { field: 'ledger_qty', header: 'Ledger Qty', align: 'right', numeric: true, render: (r) => formatNumber(r.ledger_qty) },
    { field: 'current_stock', header: 'System Qty', align: 'right', numeric: true, render: (r) => formatNumber(r.current_stock) },
    { field: 'variance', header: 'Variance', align: 'right', numeric: true, render: (r) => <span style={{ color: Math.abs(r.variance) > 0.001 ? '#d32f2f' : '#2e7d32', fontWeight: 700 }}>{formatNumber(r.variance)}</span> },
  ],
};

const FILTERS = {
  valuation: ['group', 'zero'],
  valuation_asof: ['as_of', 'group', 'zero'],
  lowstock: ['level'],
  movement: ['from', 'to'],
  abc: [],
  aging: ['bucket'],
  slow: ['months'],
  fast: ['months'],
  negative: [],
  dead: ['days'],
  warehouse: ['as_of'],
  batch: [],
  adjustments: ['from', 'to'],
  pl: ['from', 'to'],
  audit: ['from', 'to'],
  recon: [],
};

const TITLES = {
  valuation: 'Inventory Valuation',
  valuation_asof: 'Inventory Valuation as on a Date',
  lowstock: 'Low Stock & Shortage Analysis',
  movement: 'Stock Movement (Inward / Outward)',
  abc: 'ABC Classification',
  aging: 'Stock Aging',
  slow: 'Slow Moving Items',
  fast: 'Fast Moving Items',
  negative: 'Negative Stock',
  dead: 'Dead Stock (No Movement)',
  warehouse: 'Warehouse-wise Stock',
  batch: 'Batch Report',
  adjustments: 'Stock Adjustment Report',
  pl: 'Item Profit & Loss',
  audit: 'Stock Audit Trail',
  recon: 'Ledger vs System Reconciliation',
};

export default function StoresReports() {
  const [tab, setTab] = useState('valuation');
  const [groups, setGroups] = useState([]);
  const [filters, setFilters] = useState({ from: '', to: '', as_of: today(), group_id: '', level: 'reorder', zero: false, months: 3, days: 90, bucket: 30 });
  const [data, setData] = useState({ items: [], rows: [], total_value: 0, totals: {} });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    axios.get('/api/erp/stores/groups').then(({ data }) => setGroups(data || [])).catch(() => setGroups([]));
  }, []);

  const fetchData = useCallback(() => {
    setLoading(true);
    const params = {};
    let url = '';
    switch (tab) {
      case 'valuation':
        url = '/api/erp/stores/reports/valuation';
        if (filters.group_id) params.group_id = filters.group_id;
        if (filters.zero) params.zero_stock = '1';
        break;
      case 'valuation_asof':
        url = '/api/erp/stores/inventory/valuation';
        params.as_of = filters.as_of || today();
        if (filters.group_id) params.group_id = filters.group_id;
        if (filters.zero) params.zero_stock = '1';
        break;
      case 'lowstock':
        url = '/api/erp/stores/reports/low-stock';
        params.level = filters.level;
        break;
      case 'movement':
        url = '/api/erp/stores/reports/stock-movement';
        if (filters.from) params.from = filters.from;
        if (filters.to) params.to = filters.to;
        break;
      case 'abc':
        url = '/api/erp/stores/reports/abc';
        break;
      case 'aging':
        url = '/api/erp/stores/inventory/aging';
        params.bucket_days = filters.bucket;
        break;
      case 'slow':
      case 'fast':
        url = `/api/erp/stores/inventory/${tab === 'slow' ? 'slow-moving' : 'fast-moving'}`;
        params.months = filters.months;
        break;
      case 'negative':
        url = '/api/erp/stores/inventory/negative-stock';
        break;
      case 'dead':
        url = '/api/erp/stores/inventory/dead-stock';
        params.days = filters.days;
        break;
      case 'warehouse':
        url = '/api/erp/stores/inventory/warehouse-wise';
        params.as_of = filters.as_of || today();
        break;
      case 'batch':
        url = '/api/erp/stores/inventory/batches';
        break;
      case 'adjustments':
        url = '/api/erp/stores/inventory/adjustments';
        if (filters.from) params.from = filters.from;
        if (filters.to) params.to = filters.to;
        break;
      case 'pl':
        url = '/api/erp/stores/inventory/profit-loss';
        if (filters.from) params.from = filters.from;
        if (filters.to) params.to = filters.to;
        break;
      case 'audit':
        url = '/api/erp/stores/inventory/audit-trail';
        if (filters.from) params.from = filters.from;
        if (filters.to) params.to = filters.to;
        break;
      case 'recon':
        url = '/api/erp/stores/inventory/reconciliation';
        break;
      default:
        url = '/api/erp/stores/reports/valuation';
    }
    axios.get(url, { params })
      .then(({ data: d }) => setData({ items: d.items || [], rows: d.items || d.rows || (Array.isArray(d) ? d : []), total_value: d.total_value || 0, totals: d.totals || {} }))
      .catch(() => setData({ items: [], rows: [], total_value: 0 }))
      .finally(() => setLoading(false));
  }, [tab, filters]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filtersNeeded = FILTERS[tab] || [];
  const rows = ['valuation', 'valuation_asof'].includes(tab) ? data.items : data.rows;
  const cols = COLUMNS[tab];

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <PageHeader title="Stores Reports" subtitle="Inventory valuation, replenishment, movement & analytics" icon={<FiBox size={22} />} />

      <Tabs value={tab} onChange={(e, v) => setTab(v)} variant="scrollable" scrollButtons="auto" sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}>
        {TABS.map((t) => (
          <Tab key={t.key} value={t.key} label={t.label} icon={t.icon} iconPosition="start" />
        ))}
      </Tabs>

      {filtersNeeded.length > 0 && (
        <Box sx={{ p: 2, mb: 2, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} alignItems="flex-end" flexWrap="wrap">
            {filtersNeeded.includes('group') && (
              <TextField select label="Item Group" size="small" sx={{ minWidth: 200 }} value={filters.group_id} onChange={(e) => setFilters((f) => ({ ...f, group_id: e.target.value }))}>
                <MenuItem value="">All Groups</MenuItem>
                {groups.map((g) => <MenuItem key={g.id} value={g.id}>{g.name}</MenuItem>)}
              </TextField>
            )}
            {filtersNeeded.includes('zero') && (
              <Button variant={filters.zero ? 'contained' : 'outlined'} onClick={() => setFilters((f) => ({ ...f, zero: !f.zero }))}>
                Include Zero Stock
              </Button>
            )}
            {filtersNeeded.includes('as_of') && (
              <TextField label="As on Date" type="date" size="small" value={filters.as_of} onChange={(e) => setFilters((f) => ({ ...f, as_of: e.target.value }))} InputLabelProps={{ shrink: true }} />
            )}
            {filtersNeeded.includes('from') && (
              <TextField label="From" type="date" size="small" value={filters.from} onChange={(e) => setFilters((f) => ({ ...f, from: e.target.value }))} InputLabelProps={{ shrink: true }} />
            )}
            {filtersNeeded.includes('to') && (
              <TextField label="To" type="date" size="small" value={filters.to} onChange={(e) => setFilters((f) => ({ ...f, to: e.target.value }))} InputLabelProps={{ shrink: true }} />
            )}
            {filtersNeeded.includes('level') && (
              <TextField select label="Threshold" size="small" sx={{ minWidth: 180 }} value={filters.level} onChange={(e) => setFilters((f) => ({ ...f, level: e.target.value }))}>
                <MenuItem value="reorder">At / Below Reorder Level</MenuItem>
                <MenuItem value="min">At / Below Min Stock</MenuItem>
              </TextField>
            )}
            {filtersNeeded.includes('months') && (
              <TextField label="Months" type="number" size="small" sx={{ width: 120 }} value={filters.months} onChange={(e) => setFilters((f) => ({ ...f, months: e.target.value }))} />
            )}
            {filtersNeeded.includes('days') && (
              <TextField label="Idle Days" type="number" size="small" sx={{ width: 120 }} value={filters.days} onChange={(e) => setFilters((f) => ({ ...f, days: e.target.value }))} />
            )}
            {filtersNeeded.includes('bucket') && (
              <TextField label="Age Bucket (days)" type="number" size="small" sx={{ width: 150 }} value={filters.bucket} onChange={(e) => setFilters((f) => ({ ...f, bucket: e.target.value }))} />
            )}
            <Button variant="contained" startIcon={<FiFilter />} onClick={fetchData}>Apply</Button>
            <Button variant="text" startIcon={<FiX />} onClick={() => setFilters({ from: '', to: '', as_of: today(), group_id: '', level: 'reorder', zero: false, months: 3, days: 90, bucket: 30 })}>Clear</Button>
          </Stack>
        </Box>
      )}

      {['valuation', 'valuation_asof'].includes(tab) && data.total_value > 0 && (
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
          Total Inventory Value: {formatCurrency(data.total_value, 'INR')}
        </Typography>
      )}
      {tab === 'movement' && data.totals && (
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
          Inward: {formatCurrency(data.totals.inward_value)} | Outward Qty: {formatNumber(data.totals.outward_qty)}
        </Typography>
      )}
      {tab === 'pl' && data.totals && (
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
          Sales: {formatCurrency(data.totals.sales_value)} | COGS: {formatCurrency(data.totals.cogs_value)} | Gross Profit: <span style={{ color: data.totals.gross_profit >= 0 ? '#2e7d32' : '#d32f2f' }}>{formatCurrency(data.totals.gross_profit)}</span>
        </Typography>
      )}
      {tab === 'dead' && data.total_value > 0 && (
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
          Dead Stock Value: {formatCurrency(data.total_value, 'INR')}
        </Typography>
      )}
      {tab === 'recon' && data.mismatched_count !== undefined && (
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1, color: data.mismatched_count > 0 ? '#d32f2f' : '#2e7d32' }}>
          {data.mismatched_count > 0 ? `⚠ ${data.mismatched_count} item(s) out of balance` : '✅ Ledger and system stock are in balance'}
        </Typography>
      )}

      <DataTable title={TITLES[tab]} columns={cols} rows={rows} loading={loading} />
    </Box>
  );
}
