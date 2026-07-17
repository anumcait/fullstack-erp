import React, { useEffect, useState, useCallback } from 'react';
import { Box, Button, Stack, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Typography, Chip } from '@mui/material';
import { FiClipboard, FiFilter, FiX } from 'react-icons/fi';
import axios from 'axios';
import PageHeader from '../../Common/PageHeader';
import DataTable from '../../Common/DataTable';
import { formatDate } from '../../../utils/format';

export default function PRAmendment() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [detail, setDetail] = useState(null);

  const fetchData = useCallback(() => {
    setLoading(true);
    const params = {};
    if (from) params.from = from;
    if (to) params.to = to;
    axios.get('/api/erp/purchase/reports/pr-amendment', { params })
      .then(({ data }) => setRows(data || []))
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, [from, to]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const columns = [
    { field: 'req_no', header: 'PR No' },
    { field: 'department', header: 'Department' },
    { field: 'status', header: 'Status' },
    { field: 'amended_by', header: 'Amended By' },
    { field: 'amendment_date', header: 'Amended On', render: (r) => formatDate(r.amendment_date) },
    { field: 'change_summary', header: 'Changes', render: (r) => (
      <Box sx={{ maxWidth: 420, whiteSpace: 'normal' }}>{r.change_summary}</Box>
    ) },
    { field: 'actions', header: 'Actions', render: (r) => <Button size="small" onClick={() => setDetail(r)}>View</Button> },
  ];

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <PageHeader title="PR Amendment" subtitle="Audit trail of purchase requisition edits" icon={<FiClipboard size={22} />} />

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} sx={{ mb: 2 }} alignItems="flex-end">
        <TextField label="From" type="date" size="small" value={from} onChange={(e) => setFrom(e.target.value)} InputLabelProps={{ shrink: true }} />
        <TextField label="To" type="date" size="small" value={to} onChange={(e) => setTo(e.target.value)} InputLabelProps={{ shrink: true }} />
        <Button variant="contained" startIcon={<FiFilter />} onClick={fetchData}>Apply</Button>
        <Button variant="text" startIcon={<FiX />} onClick={() => { setFrom(''); setTo(''); }}>Clear</Button>
      </Stack>

      <DataTable title="Amendment History" columns={columns} rows={rows} loading={loading} />

      <Dialog open={Boolean(detail)} onClose={() => setDetail(null)} maxWidth="md" fullWidth>
        <DialogTitle>
          Amendment &middot; {detail?.req_no}
          <Chip size="small" label={detail?.status} sx={{ ml: 1 }} />
        </DialogTitle>
        <DialogContent>
          {detail && (
            <>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Amended by <b>{detail.amended_by}</b> on {formatDate(detail.amendment_date)}
              </Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mt: 1 }}>Summary</Typography>
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{detail.change_summary}</Typography>

              <Typography variant="subtitle2" sx={{ fontWeight: 700, mt: 2 }}>Before</Typography>
              <Box component="pre" sx={{ bgcolor: 'action.hover', p: 1.5, borderRadius: 1, fontSize: 12, overflow: 'auto' }}>
                {JSON.stringify(detail.old_value, null, 2)}
              </Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mt: 2 }}>After</Typography>
              <Box component="pre" sx={{ bgcolor: 'action.hover', p: 1.5, borderRadius: 1, fontSize: 12, overflow: 'auto' }}>
                {JSON.stringify(detail.new_value, null, 2)}
              </Box>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetail(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
