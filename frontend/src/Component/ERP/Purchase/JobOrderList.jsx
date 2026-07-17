import React, { useEffect, useState, useCallback } from 'react';
import { Box, Button, Stack, TextField } from '@mui/material';
import { FiPlus, FiBriefcase, FiFilter } from 'react-icons/fi';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../Common/PageHeader';
import DataTable from '../../Common/DataTable';

const statusColors = {
  Planning: 'info', Released: 'primary', 'In Progress': 'warning',
  Completed: 'success', Cancelled: 'error',
};

export default function JobOrderList() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const fetchData = useCallback(() => {
    setLoading(true);
    const params = { order_type: 'Job Order' };
    if (from) params.from = from;
    if (to) params.to = to;
    axios.get('/api/erp/production/orders', { params })
      .then(({ data }) => setRows(data || []))
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, [from, to]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const columns = [
    { field: 'order_no', header: 'Job Order #' },
    { field: 'product_code', header: 'Product' },
    { field: 'product_name', header: 'Product Name' },
    { field: 'planned_quantity', header: 'Planned', align: 'right', numeric: true },
    { field: 'produced_quantity', header: 'Produced', align: 'right', numeric: true },
    { field: 'department', header: 'Dept' },
    { field: 'status', header: 'Status', render: (r) => <StatusPill status={r.status} /> },
    { field: 'actions', header: 'Actions', render: (r) => <Button size="small" onClick={() => navigate(`/production/orders/view/${r.id}`)}>View</Button> },
  ];

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <PageHeader
        title="Job Order"
        subtitle="Production job orders released against BOMs"
        icon={<FiBriefcase size={22} />}
        actions={<Button variant="contained" startIcon={<FiPlus />} onClick={() => navigate('/production/orders/add')}>New Job Order</Button>}
      />
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} sx={{ mb: 2 }} alignItems="flex-end">
        <TextField label="From" type="date" size="small" value={from} onChange={(e) => setFrom(e.target.value)} InputLabelProps={{ shrink: true }} />
        <TextField label="To" type="date" size="small" value={to} onChange={(e) => setTo(e.target.value)} InputLabelProps={{ shrink: true }} />
        <Button variant="contained" startIcon={<FiFilter />} onClick={fetchData}>Apply</Button>
      </Stack>
      <DataTable title="Job Orders" columns={columns} rows={rows} loading={loading} />
    </Box>
  );
}

function StatusPill({ status }) {
  const color = statusColors[status] || 'default';
  return <Box component="span" sx={{ px: 1, py: 0.25, borderRadius: 1, fontSize: 12, fontWeight: 700, color: `${color}.main`, bgcolor: `${color}.lighter`, border: `1px solid`, borderColor: `${color}.main` }}>{status}</Box>;
}
