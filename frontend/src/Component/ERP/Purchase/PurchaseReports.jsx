import React, { useEffect, useState, useCallback } from 'react';
import { Box, Tabs, Tab, Stack, TextField, MenuItem, Button } from '@mui/material';
import { FiFileText, FiBarChart2, FiTruck, FiTrendingUp, FiFilter, FiX } from 'react-icons/fi';
import axios from 'axios';
import PageHeader from '../../Common/PageHeader';
import DataTable from '../../Common/DataTable';
import { formatCurrency, formatDate, formatNumber } from '../../../utils/format';

const TABS = [
  { key: 'register', label: 'Purchase Register', icon: <FiFileText /> },
  { key: 'vendor', label: 'Vendor Spend', icon: <FiBarChart2 /> },
  { key: 'grn', label: 'GRN Summary', icon: <FiTruck /> },
  { key: 'trend', label: 'Monthly Trend', icon: <FiTrendingUp /> },
];

const STATUS_OPTIONS = ['Draft', 'Pending', 'Approved', 'Rejected', 'Closed'];

export default function PurchaseReports() {
  const [tab, setTab] = useState('register');
  const [suppliers, setSuppliers] = useState([]);
  const [filters, setFilters] = useState({ from: '', to: '', supplier_id: '', status: '', search: '' });
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    axios.get('/api/erp/purchase/suppliers').then(({ data }) => setSuppliers(data || [])).catch(() => setSuppliers([]));
  }, []);

  const fetchData = useCallback(() => {
    setLoading(true);
    let url = '';
    const params = {};
    if (filters.from) params.from = filters.from;
    if (filters.to) params.to = filters.to;
    if (filters.supplier_id) params.supplier_id = filters.supplier_id;
    if (filters.status) params.status = filters.status;
    if (filters.search) params.search = filters.search;

    if (tab === 'register') url = '/api/erp/purchase/reports/register';
    else if (tab === 'vendor') url = '/api/erp/purchase/reports/vendor-spend';
    else if (tab === 'grn') url = '/api/erp/purchase/reports/grn-summary';
    else url = '/api/erp/purchase/reports/monthly-trend';

    axios.get(url, { params }).then(({ data }) => setRows(data || [])).catch(() => setRows([])).finally(() => setLoading(false));
  }, [tab, filters]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const columns = {
    register: [
      { field: 'po_no', header: 'PO No', type: 'text' },
      { field: 'po_date', header: 'PO Date', type: 'date', render: (r) => formatDate(r.po_date) },
      { field: 'supplier_name', header: 'Vendor' },
      { field: 'status', header: 'Status', render: (r) => r.status },
      { field: 'line_items', header: 'Lines', align: 'right', numeric: true },
      { field: 'total_ordered', header: 'Ordered', align: 'right', numeric: true, render: (r) => formatNumber(r.total_ordered) },
      { field: 'total_received', header: 'Received', align: 'right', numeric: true, render: (r) => formatNumber(r.total_received) },
      { field: 'grand_total', header: 'PO Value', align: 'right', numeric: true, render: (r) => formatCurrency(r.grand_total, r.currency) },
    ],
    vendor: [
      { field: 'supplier_name', header: 'Vendor' },
      { field: 'city', header: 'City' },
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
  }[tab];

  const titles = { register: 'Purchase Order Register', vendor: 'Vendor Spend Analysis', grn: 'Goods Receipt Summary', trend: 'Monthly Purchase Trend' };

  const showSupplier = tab === 'register' || tab === 'grn';
  const showStatus = tab === 'register';
  const showSearch = tab === 'register';

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <PageHeader title="Purchase Reports" subtitle="Procurement analytics, spend analysis & compliance reporting" icon={<FiBarChart2 size={22} />} />

      <Tabs value={tab} onChange={(e, v) => setTab(v)} sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}>
        {TABS.map((t) => (
          <Tab key={t.key} value={t.key} label={t.label} icon={t.icon} iconPosition="start" />
        ))}
      </Tabs>

      <PaperFilter>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} alignItems="flex-end" flexWrap="wrap">
          <TextField label="From" type="date" size="small" value={filters.from} onChange={(e) => setFilters((f) => ({ ...f, from: e.target.value }))} InputLabelProps={{ shrink: true }} />
          <TextField label="To" type="date" size="small" value={filters.to} onChange={(e) => setFilters((f) => ({ ...f, to: e.target.value }))} InputLabelProps={{ shrink: true }} />
          {showSupplier && (
            <TextField select label="Vendor" size="small" sx={{ minWidth: 200 }} value={filters.supplier_id} onChange={(e) => setFilters((f) => ({ ...f, supplier_id: e.target.value }))}>
              <MenuItem value="">All Vendors</MenuItem>
              {suppliers.map((s) => <MenuItem key={s.id} value={s.id}>{s.supplier_name}</MenuItem>)}
            </TextField>
          )}
          {showStatus && (
            <TextField select label="Status" size="small" sx={{ minWidth: 150 }} value={filters.status} onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}>
              <MenuItem value="">All Status</MenuItem>
              {STATUS_OPTIONS.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
            </TextField>
          )}
          {showSearch && (
            <TextField label="Search PO No" size="small" value={filters.search} onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))} />
          )}
          <Button variant="contained" startIcon={<FiFilter />} onClick={fetchData}>Apply</Button>
          <Button variant="text" startIcon={<FiX />} onClick={() => { setFilters({ from: '', to: '', supplier_id: '', status: '', search: '' }); }}>Clear</Button>
        </Stack>
      </PaperFilter>

      <Box sx={{ mt: 2 }}>
        <DataTable title={titles[tab]} columns={columns} rows={rows} loading={loading} />
      </Box>
    </Box>
  );
}

const PaperFilter = ({ children }) => (
  <Box sx={{ p: 2, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>{children}</Box>
);
