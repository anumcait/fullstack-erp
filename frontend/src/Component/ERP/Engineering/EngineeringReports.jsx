import React, { useEffect, useState, useCallback } from 'react';
import { Box, Tabs, Tab, Stack, TextField, Button, Typography, Grid, Card, CardContent } from '@mui/material';
import { FiBarChart2, FiLayout, FiBox, FiFilter, FiX } from 'react-icons/fi';
import axios from 'axios';
import PageHeader from '../../Common/PageHeader';
import DataTable from '../../Common/DataTable';
import { formatCurrency, formatNumber } from '../../../utils/format';

const TABS = [
  { key: 'products', label: 'Product Master', icon: <FiBox />, filters: ['search'] },
  { key: 'boms', label: 'BOM Register', icon: <FiLayout />, filters: ['search', 'status'] },
];

const titleFor = {
  products: 'Product Master Report',
  boms: 'BOM Register Report',
};

export default function EngineeringReports() {
  const [tab, setTab] = useState('products');
  const [filters, setFilters] = useState({ search: '', status: '' });
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(() => {
    setLoading(true);
    if (tab === 'products') {
      const params = {};
      if (filters.search) params.search = filters.search;
      axios.get('/api/erp/engineering/products', { params })
        .then(({ data }) => setRows(data || []))
        .catch(() => setRows([]))
        .finally(() => setLoading(false));
    } else {
      const params = {};
      if (filters.search) params.search = filters.search;
      if (filters.status) params.status = filters.status;
      axios.get('/api/erp/engineering/bom', { params })
        .then(({ data }) => setRows(data || []))
        .catch(() => setRows([]))
        .finally(() => setLoading(false));
    }
  }, [tab, filters]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const set = (key, val) => setFilters((f) => ({ ...f, [key]: val }));

  const columns = {
    products: [
      { field: 'product_code', header: 'Code' },
      { field: 'part_name', header: 'Part Name' },
      { field: 'product_type', header: 'Type' },
      { field: 'color', header: 'Color' },
      { field: 'is_active', header: 'Active', render: (r) => r.is_active ? 'Yes' : 'No' },
    ],
    boms: [
      { field: 'bom_no', header: 'BOM #' },
      { field: 'bom_name', header: 'Name' },
      { field: 'product_name', header: 'Product' },
      { field: 'output_quantity', header: 'Output Qty', render: (r) => formatNumber(r.output_quantity) },
      { field: 'version', header: 'Version' },
      { field: 'status', header: 'Status' },
    ],
  }[tab];

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <PageHeader title="Engineering Reports" subtitle="Product & BOM registers" icon={<FiBarChart2 size={22} />} />

      <Tabs value={tab} onChange={(e, v) => setTab(v)} variant="scrollable" scrollButtons="auto" sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}>
        {TABS.map((t) => (
          <Tab key={t.key} value={t.key} label={t.label} icon={t.icon} iconPosition="start" />
        ))}
      </Tabs>

      <Box sx={{ p: 2, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', borderRadius: 2, mb: 2 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} alignItems="flex-end" flexWrap="wrap">
          <TextField label="Search" size="small" value={filters.search}
            onChange={(e) => set('search', e.target.value)} sx={{ minWidth: 250 }} />
          {tab === 'boms' && (
            <TextField select label="Status" size="small" sx={{ minWidth: 150 }} value={filters.status}
              onChange={(e) => set('status', e.target.value)}>
              <option value="">All</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Draft">Draft</option>
            </TextField>
          )}
          <Button variant="contained" startIcon={<FiFilter />} onClick={fetchData}>Apply</Button>
          <Button variant="text" startIcon={<FiX />} onClick={() => setFilters({ search: '', status: '' })}>Clear</Button>
        </Stack>
      </Box>

      <Box sx={{ mt: 2 }}>
        <DataTable title={titleFor[tab]} columns={columns} rows={rows} loading={loading} />
      </Box>
    </Box>
  );
}
