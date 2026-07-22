import React, { useEffect, useState, useCallback } from 'react';
import { Box, Button, Stack, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Typography, Chip, Card, CardContent, Table, TableHead, TableRow, TableCell, TableBody } from '@mui/material';
import { FiClipboard, FiFilter, FiX, FiPrinter } from 'react-icons/fi';
import axios from 'axios';
import PageHeader from '../../Common/PageHeader';
import DataTable from '../../Common/DataTable';
import { formatDate, formatDateTime } from '../../../utils/format';

function AmendDetailTable({ label, items, otherItems }) {
  const isAfter = label === "AFTER";
  const dKeys = ["item_code", "item_name", "quantity", "uom"];

  function chgStyle(it, ot, k) {
    if (!isAfter || !ot) return {};
    const n = (v) => { const c = Number(v); return isNaN(c) ? String(v ?? '').trim() : c; };
    return n(it[k]) !== n(ot[k]) ? { fontWeight: 700, color: "#d32f2f" } : {};
  }

  return (
    <Card sx={{ borderRadius: 1.5, border: "1px solid #000", boxShadow: "none", mb: 1.5, width: "48%" }}>
      <Box sx={{ bgcolor: isAfter ? "#e8f5e9" : "#ffebee", px: 1.5, py: 0.5, borderBottom: "1px solid #000" }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 800, fontSize: "0.82rem" }}>{label} AMENDMENT</Typography>
      </Box>
      <CardContent sx={{ p: 0, "&:last-child": { pb: 0 } }}>
        <Table size="small" sx={{ "& td, & th": { border: "1px solid #000", px: 0.75, py: 0.35, fontSize: "0.72rem" } }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, bgcolor: "#f5f5f5", textAlign: "center", width: 26 }}>#</TableCell>
              <TableCell sx={{ fontWeight: 700, bgcolor: "#f5f5f5" }}>Item Code</TableCell>
              <TableCell sx={{ fontWeight: 700, bgcolor: "#f5f5f5" }}>Description</TableCell>
              <TableCell sx={{ fontWeight: 700, bgcolor: "#f5f5f5", textAlign: "center", width: 38 }}>UOM</TableCell>
              <TableCell sx={{ fontWeight: 700, bgcolor: "#f5f5f5", textAlign: "center", width: 55 }}>Qty</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(!items || items.length === 0) ? (
              <TableRow><TableCell colSpan={5} sx={{ textAlign: "center", fontStyle: "italic", py: 1 }}>No items</TableCell></TableRow>
            ) : items.map((it, i) => {
              const ot = otherItems?.[i];
              const bg = !it && ot ? "#fff0f0" : it && !ot ? "#f0fff0" : "inherit";
              return (
                <TableRow key={i} sx={{ bgcolor: bg }}>
                  <TableCell sx={{ textAlign: "center" }}>{i + 1}</TableCell>
                  <TableCell sx={{ fontWeight: 600, ...chgStyle(it, ot, "item_code") }}>{it.item_code || "—"}</TableCell>
                  <TableCell sx={{ ...chgStyle(it, ot, "item_name") }}>{it.item_name || "—"}</TableCell>
                  <TableCell sx={{ textAlign: "center", ...chgStyle(it, ot, "uom") }}>{it.uom || "—"}</TableCell>
                  <TableCell sx={{ textAlign: "center", ...chgStyle(it, ot, "quantity") }}>{it.quantity ?? "—"}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

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
    { field: 'amd_id', header: 'AMD #' },
    { field: 'amendment_date', header: 'AMD Date', render: (r) => formatDateTime(r.amendment_date) },
    { field: 'req_no', header: 'PR No' },
    { field: 'req_date', header: 'PR Date', render: (r) => r.req_date ? formatDate(r.req_date) : '—' },
    { field: 'department', header: 'Dept', render: (r) => r.sub_department ? `${r.department} / ${r.sub_department}` : r.department },
    { field: 'requested_by', header: 'Requested By' },
    { field: 'indent_type', header: 'Type' },
    { field: 'priority', header: 'Priority' },
    { field: 'amended_by', header: 'Amended By' },
    { field: 'status', header: 'Status' },
    { field: 'change_summary', header: 'Changes', render: (r) => (
      <Box sx={{ maxWidth: 320, whiteSpace: 'normal', fontSize: '0.78rem' }}>{r.change_summary}</Box>
    ) },
    { field: 'actions', header: 'Actions', render: (r) => (
      <Button size="small" variant="outlined" onClick={() => window.location.href = `/purchase/requisitions/amend-compare/${r.requisition_id}`}>View / Print</Button>
    ) },
  ];

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <PageHeader title="PR Amendment" subtitle="List of purchase requisition amendments" icon={<FiClipboard size={22} />} />

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} sx={{ mb: 2 }} alignItems="flex-end">
        <TextField label="From" type="date" size="small" value={from} onChange={(e) => setFrom(e.target.value)} InputLabelProps={{ shrink: true }} />
        <TextField label="To" type="date" size="small" value={to} onChange={(e) => setTo(e.target.value)} InputLabelProps={{ shrink: true }} />
        <Button variant="contained" startIcon={<FiFilter />} onClick={fetchData}>Apply</Button>
        <Button variant="text" startIcon={<FiX />} onClick={() => { setFrom(''); setTo(''); }}>Clear</Button>
      </Stack>


      <DataTable title="PR Amendment List" columns={columns} rows={rows} loading={loading} />

      <Dialog open={Boolean(detail)} onClose={() => setDetail(null)} maxWidth="lg" fullWidth>
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <FiClipboard size={20} /> Amendment &middot; {detail?.req_no}
            <Chip size="small" label={detail?.status} sx={{ ml: 1 }} />
          </Box>
        </DialogTitle>
        <DialogContent>
          {detail && (
            <>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2, px: 0.5 }}>
                <Typography variant="body2" color="text.secondary">
                  Amended by <b>{detail.amended_by}</b> on {formatDateTime(detail.amendment_date)}
                </Typography>
                {detail.change_summary && (
                  <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 400 }}>
                    <b>Summary:</b> {detail.change_summary}
                  </Typography>
                )}
              </Box>

              {detail.old_value || detail.new_value ? (
                <Box sx={{ display: "flex", gap: 2, justifyContent: "space-between" }}>
                  <AmendDetailTable label="BEFORE" items={detail.old_value?.items} otherItems={detail.new_value?.items} />
                  <AmendDetailTable label="AFTER" items={detail.new_value?.items} otherItems={detail.old_value?.items} />
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", py: 2 }}>
                  No snapshot data available for this amendment entry.
                </Typography>
              )}
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
