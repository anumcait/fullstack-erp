import React, { useEffect, useState, useCallback } from 'react';
import { Box, Tabs, Tab, Stack, TextField, MenuItem, Button, Typography } from '@mui/material';
import { FiBox, FiAlertTriangle, FiActivity, FiPieChart, FiFilter, FiX } from 'react-icons/fi';
import axios from 'axios';
import PageHeader from '../../Common/PageHeader';
import DataTable from '../../Common/DataTable';
import { formatCurrency, formatNumber } from '../../../utils/format';

const TABS = [
  { key: 'valuation', label: 'Inventory Valuation', icon: <FiBox /> },
  { key: 'lowstock', label: 'Low Stock / Shortage', icon: <FiAlertTriangle /> },
  { key: 'movement', label: 'Stock Movement', icon: <FiActivity /> },
  { key: 'abc', label: 'ABC Analysis', icon: <FiPieChart /> },
];

export default function StoresReports() {
  const [tab, setTab] = useState('valuation');
  const [groups, setGroups] = useState([]);
  const [filters, setFilters] = useState({ from: '', to: '', group_id: '', level: 'reorder', zero: false });
  const [data, setData] = useState({ items: [], rows: [], total_value: 0 });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    axios.get('/api/erp/stores/groups').then(({ data }) => setGroups(data || [])).catch(() => setGroups([]));
  }, []);

  const fetchData = useCallback(() => {
    setLoading(true);
    let url = '';
    const params = {};
    if (tab === 'valuation') {
      url = '/api/erp/stores/reports/valuation';
      if (filters.group_id) params.group_id = filters.group_id;
      if (filters.zero) params.zero_stock = '1';
    } else if (tab === 'lowstock') {
      url = '/api/erp/stores/reports/low-stock';
      params.level = filters.level;
    } else if (tab === 'movement') {
      url = '/api/erp/stores/reports/stock-movement';
      if (filters.from) params.from = filters.from;
      if (filters.to) params.to = filters.to;
    } else {
      url = '/api/erp/stores/reports/abc';
    }
    axios.get(url, { params })
      .then(({ data: d }) => setData({ items: d.items || [], rows: d.rows || d || [], total_value: d.total_value || 0, totals: d.totals || {} }))
      .catch(() => setData({ items: [], rows: [], total_value: 0 }))
      .finally(() => setLoading(false));
  }, [tab, filters]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const columns = {
    valuation: [
      { field: 'item_code', header: 'Item Code' },
      { field: 'item_name', header: 'Item Name' },
      { field: 'group_name', header: 'Group' },
      { field: 'current_stock', header: 'Stock', align: 'right', numeric: true, render: (r) => formatNumber(r.current_stock) },
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
    ],
    abc: [
      { field: 'class', header: 'Class' },
      { field: 'item_count', header: 'Item Count', align: 'right', numeric: true },
      { field: 'class_value', header: 'Value', align: 'right', numeric: true, render: (r) => formatCurrency(r.class_value) },
    ],
  }[tab];

  const titles = {
    valuation: 'Inventory Valuation',
    lowstock: 'Low Stock & Shortage Analysis',
    movement: 'Stock Movement (Inward / Outward)',
    abc: 'ABC Classification',
  };

  const rows = tab === 'valuation' ? data.items : data.rows;
  const showGroup = tab === 'valuation';
  const showLevel = tab === 'lowstock';
  const showDates = tab === 'movement';

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <PageHeader title="Stores Reports" subtitle="Inventory valuation, replenishment & stock movement analytics" icon={<FiBox size={22} />} />

      <Tabs value={tab} onChange={(e, v) => setTab(v)} sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}>
        {TABS.map((t) => (
          <Tab key={t.key} value={t.key} label={t.label} icon={t.icon} iconPosition="start" />
        ))}
      </Tabs>

      <Box sx={{ p: 2, mb: 2, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} alignItems="flex-end" flexWrap="wrap">
          {showGroup && (
            <TextField select label="Item Group" size="small" sx={{ minWidth: 200 }} value={filters.group_id} onChange={(e) => setFilters((f) => ({ ...f, group_id: e.target.value }))}>
              <MenuItem value="">All Groups</MenuItem>
              {groups.map((g) => <MenuItem key={g.id} value={g.id}>{g.name}</MenuItem>)}
            </TextField>
          )}
          {showGroup && (
            <Button variant={filters.zero ? 'contained' : 'outlined'} onClick={() => setFilters((f) => ({ ...f, zero: !f.zero }))}>
              Include Zero Stock
            </Button>
          )}
          {showLevel && (
            <TextField select label="Threshold" size="small" sx={{ minWidth: 180 }} value={filters.level} onChange={(e) => setFilters((f) => ({ ...f, level: e.target.value }))}>
              <MenuItem value="reorder">At / Below Reorder Level</MenuItem>
              <MenuItem value="min">At / Below Min Stock</MenuItem>
            </TextField>
          )}
          {showDates && (
            <>
              <TextField label="From" type="date" size="small" value={filters.from} onChange={(e) => setFilters((f) => ({ ...f, from: e.target.value }))} InputLabelProps={{ shrink: true }} />
              <TextField label="To" type="date" size="small" value={filters.to} onChange={(e) => setFilters((f) => ({ ...f, to: e.target.value }))} InputLabelProps={{ shrink: true }} />
            </>
          )}
          <Button variant="contained" startIcon={<FiFilter />} onClick={fetchData}>Apply</Button>
          <Button variant="text" startIcon={<FiX />} onClick={() => setFilters({ from: '', to: '', group_id: '', level: 'reorder', zero: false })}>Clear</Button>
        </Stack>
      </Box>

      {tab === 'valuation' && (
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
          Total Inventory Value: {formatCurrency(data.total_value, 'INR')}
        </Typography>
      )}
      {tab === 'movement' && data.totals && (
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
          Inward: {formatCurrency(data.totals.inward_value)} | Outward Qty: {formatNumber(data.totals.outward_qty)}
        </Typography>
      )}

      <DataTable title={titles[tab]} columns={columns} rows={rows} loading={loading} />
    </Box>
  );
}
