import React, { useEffect, useState, useCallback } from 'react';
import { Box, Stack, TextField, Button, Paper, Typography, Tabs, Tab, Chip, Dialog, DialogTitle, DialogContent, DialogActions, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { FiCalendar, FiFileText, FiShoppingBag, FiClock, FiTruck, FiAlertOctagon, FiFilter, FiX, FiEye } from 'react-icons/fi';
import axios from 'axios';
import PageHeader from '../../Common/PageHeader';
import DataTable from '../../Common/DataTable';
import { formatCurrency, formatDate, formatDateTime, formatNumber } from '../../../utils/format';

const yesterday = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
};

const TABS = [
  { key: 'prs', label: 'Requisitions', icon: FiFileText, color: '#e65100' },
  { key: 'pos', label: 'Purchase Orders', icon: FiShoppingBag, color: '#1565c0' },
  { key: 'pending-prs', label: 'Pending PRs', icon: FiClock, color: '#f59e0b' },
  { key: 'pending-pos', label: 'Pending POs', icon: FiClock, color: '#dc2626' },
  { key: 'received', label: 'Received Material', icon: FiTruck, color: '#059669' },
];

const COLUMNS = {
  pos: [
    { field: 'po_no', header: 'PO No' },
    { field: 'po_date', header: 'Date', render: (r) => formatDate(r.po_date) },
    { field: 'supplier_name', header: 'Vendor' },
    { field: 'status', header: 'Status' },
    { field: 'payment_terms', header: 'Terms' },
    { field: 'grand_total', header: 'Value', align: 'right', numeric: true, render: (r) => formatCurrency(r.grand_total, r.currency) },
  ],
  'pending-prs': [
    { field: 'req_no', header: 'PR No' },
    { field: 'approved_date', header: 'Approved Date', render: (r) => r.approved_date ? formatDateTime(r.approved_date) : '-' },
    { field: 'department', header: 'Department' },
    { field: 'priority', header: 'Priority' },
    { field: 'status', header: 'Status' },
    { field: 'total_qty', header: 'Req Qty', align: 'right', numeric: true, render: (r) => formatNumber(r.items ? r.items.reduce((s, i) => s + Number(i.quantity || 0), 0) : 0) },
    { field: 'item_count', header: 'Items', align: 'right', numeric: true, render: (r) => r.items ? r.items.length : 0 },
  ],
  'pending-pos': [
    { field: 'po_no', header: 'PO No' },
    { field: 'po_date', header: 'PO Date', render: (r) => r.po_date ? formatDate(r.po_date) : '-' },
    { field: 'supplier_name', header: 'Vendor' },
    { field: 'status', header: 'Status' },
    { field: 'payment_terms', header: 'Terms' },
    { field: 'grand_total', header: 'Value', align: 'right', numeric: true, render: (r) => formatCurrency(r.grand_total) },
  ],
  received: [
    { field: 'grn_no', header: 'GRN No' },
    { field: 'grn_date', header: 'Date', render: (r) => r.grn_date ? formatDate(r.grn_date) : '-' },
    { field: 'supplier_name', header: 'Vendor' },
    { field: 'item_name', header: 'Item' },
    { field: 'accepted_qty', header: 'Accepted', align: 'right', numeric: true, render: (r) => formatNumber(r.accepted_qty) },
    { field: 'rejected_qty', header: 'Rejected', align: 'right', numeric: true, render: (r) => formatNumber(r.rejected_qty) },
    { field: 'rate', header: 'Rate', align: 'right', numeric: true, render: (r) => formatNumber(r.rate) },
    { field: 'amount', header: 'Amount', align: 'right', numeric: true, render: (r) => formatCurrency(r.amount) },
    { field: 'invoice_no', header: 'Invoice' },
  ],
};

const TITLES = {
  prs: 'Requisitions',
  pos: 'Purchase Orders',
  'pending-prs': 'Pending Purchase Requisitions',
  'pending-pos': 'Pending Purchase Orders',
  received: 'Received Material',
};

const overduePrCols = [
  { field: 'req_no', header: 'PR No' },
  { field: 'req_date', header: 'Req Date', render: (r) => r.req_date ? formatDate(r.req_date) : '-' },
  { field: 'department', header: 'Dept' },
  { field: 'item_code', header: 'Item Code' },
  { field: 'item_name', header: 'Item Name' },
  { field: 'quantity', header: 'Req Qty', align: 'right', numeric: true, render: (r) => formatNumber(r.quantity) },
  { field: 'received_qty', header: 'Received', align: 'right', numeric: true, render: (r) => formatNumber(r.received_qty) },
  { field: 'expected_date', header: 'Expected By', render: (r) => r.expected_date ? formatDate(r.expected_date) : '-' },
];

const delayedPoCols = [
  { field: 'po_no', header: 'PO No' },
  { field: 'supplier_name', header: 'Vendor' },
  { field: 'item_code', header: 'Item Code' },
  { field: 'item_name', header: 'Item Name' },
  { field: 'quantity', header: 'Qty', align: 'right', numeric: true, render: (r) => formatNumber(r.quantity) },
  { field: 'received_quantity', header: 'Received', align: 'right', numeric: true, render: (r) => formatNumber(r.received_quantity) },
  { field: 'delivery_date', header: 'Delivery Date', render: (r) => r.delivery_date ? formatDate(r.delivery_date) : '-' },
  { field: 'delay_days', header: 'Delay (Days)', align: 'right', numeric: true, render: (r) => r.delay_days != null ? r.delay_days : '-' },
];

export default function DailyReports() {
  const [dateFrom, setDateFrom] = useState(yesterday());
  const [dateTo, setDateTo] = useState(yesterday());
  const [year, setYear] = useState(() => String(new Date().getFullYear()));
  const [tab, setTab] = useState('prs');
  const [data, setData] = useState({ summary: {}, prs: [], pos: [] });
  const [pendingPrs, setPendingPrs] = useState([]);
  const [pendingPos, setPendingPos] = useState([]);
  const [received, setReceived] = useState([]);
  const [loading, setLoading] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailPr, setDetailPr] = useState(null);
  const [detailItems, setDetailItems] = useState([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [overduePrs, setOverduePrs] = useState([]);
  const [delayedPos, setDelayedPos] = useState([]);
  const [overduePrOpen, setOverduePrOpen] = useState(false);
  const [delayedPoOpen, setDelayedPoOpen] = useState(false);

  const fetchData = useCallback(() => {
    setLoading(true);
    const dateParams = { from: dateFrom, to: dateTo, year };
    Promise.all([
      axios.get('/api/erp/purchase/reports/daily', { params: { date: dateFrom } }).catch(() => ({ data: { summary: {}, prs: [], pos: [] } })),
      axios.get('/api/erp/purchase/reports/pending-prs').catch(() => ({ data: [] })),
      axios.get('/api/erp/purchase/reports/pending-pos').catch(() => ({ data: [] })),
      axios.get('/api/erp/purchase/reports/received-material', { params: dateParams }).catch(() => ({ data: [] })),
      axios.get('/api/erp/purchase/reports/overdue-pr-items').catch(() => ({ data: [] })),
      axios.get('/api/erp/purchase/reports/delayed-pos').catch(() => ({ data: [] })),
    ]).then(([d, pprs, ppos, rec, ovpr, dpo]) => {
      setData(d.data || { summary: {}, prs: [], pos: [] });
      setPendingPrs(pprs.data || []);
      setPendingPos(ppos.data || []);
      setReceived(rec.data || []);
      setOverduePrs(ovpr.data || []);
      setDelayedPos(dpo.data || []);
    }).finally(() => setLoading(false));
  }, [dateFrom, dateTo, year]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openDetail = async (pr) => {
    setDetailPr(pr);
    setDetailLoading(true);
    setDetailOpen(true);
    try {
      const { data } = await axios.get('/api/erp/purchase/reports/pr-details', { params: { id: pr.id } });
      setDetailItems(data?.[0]?.items || []);
    } catch { setDetailItems([]); }
    finally { setDetailLoading(false); }
  };

  const prsColumns = [
    { field: 'req_no', header: 'PR No' },
    { field: 'req_date', header: 'Date', render: (r) => formatDate(r.req_date) },
    { field: 'requested_by', header: 'Requested By' },
    { field: 'department', header: 'Dept' },
    { field: 'priority', header: 'Priority' },
    { field: 'status', header: 'Status' },
    { field: 'actions', header: '', render: (r) => (
      <Button size="small" variant="outlined" startIcon={<FiEye />} onClick={() => openDetail(r)}
        sx={{ textTransform: 'none', fontSize: '0.75rem' }}>Details</Button>
    )},
  ];

  const activeTab = TABS.find((t) => t.key === tab);

  const tabData = {
    prs: data.prs || [],
    pos: data.pos || [],
    'pending-prs': pendingPrs,
    'pending-pos': pendingPos,
    received: received,
  };

  const resetDate = () => {
    const y = yesterday();
    setDateFrom(y);
    setDateTo(y);
  };

  const itemCols = [
    { field: '#', header: '#', render: (r, idx) => idx + 1 },
    { field: 'item_code', header: 'Code' },
    { field: 'item_name', header: 'Item Name' },
    { field: 'quantity', header: 'Qty', align: 'right', numeric: true, render: (r) => formatNumber(r.quantity) },
    { field: 'uom', header: 'UOM' },
    { field: 'expected_date', header: 'Expected Date', render: (r) => r.expected_date ? formatDate(r.expected_date) : '-' },
    { field: 'remarks', header: 'Remarks' },
  ];

  const renderTable = (cols, rows, emptyMsg) => (
    <TableContainer sx={{ maxHeight: 400 }}>
      <Table stickyHeader size="small">
        <TableHead>
          <TableRow>
            {cols.map((c) => (
              <TableCell key={c.field} sx={{ fontWeight: 700, bgcolor: '#f8fafc', whiteSpace: 'nowrap' }} align={c.align || 'left'}>{c.header}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow><TableCell colSpan={cols.length} align="center" sx={{ py: 4, color: 'text.secondary' }}>{emptyMsg || 'No items'}</TableCell></TableRow>
          ) : rows.map((row, idx) => (
            <TableRow key={row.id || idx} hover>
              {cols.map((c) => (
                <TableCell key={c.field} align={c.align || 'left'} sx={{ whiteSpace: 'nowrap' }}>
                  {c.render ? c.render(row, idx) : row[c.field] ?? '-'}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const Ribbon = ({ count, label, color, bgcolor, icon: Icon, onClick }) => (
    <Paper onClick={count > 0 ? onClick : undefined}
      sx={{ p: 1.5, mb: 1.5, borderRadius: 2, border: `1px solid ${color}${count > 0 ? '' : '40'}`, bgcolor: count > 0 ? bgcolor : '#f8fafc', cursor: count > 0 ? 'pointer' : 'default', display: 'flex', alignItems: 'center', gap: 1.5, opacity: count > 0 ? 1 : 0.55 }}>
      <Icon size={20} color={count > 0 ? color : '#94a3b8'} />
      <Typography variant="body2" sx={{ fontWeight: 600, color: count > 0 ? color : '#94a3b8', flex: 1 }}>
        {count} {label}
      </Typography>
      {count > 0 && <Typography variant="caption" sx={{ color, fontWeight: 600 }}>View Details →</Typography>}
    </Paper>
  );

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1400 }}>
      <PageHeader title="Daily Reports" subtitle="Requisitions, Purchase Orders, Pending items & Receipts" icon={<FiCalendar size={22} />} />

      <Paper sx={{ p: 2, mb: 3, borderRadius: 2, border: '1px solid', borderColor: 'divider', bgcolor: '#fafbfc' }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} alignItems={{ md: 'flex-end' }}>
          <TextField label="Date From" type="date" size="small" value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)} InputLabelProps={{ shrink: true }} sx={{ minWidth: 160, bgcolor: '#fff', borderRadius: 1 }} />
          <TextField label="Date To" type="date" size="small" value={dateTo}
            onChange={(e) => setDateTo(e.target.value)} InputLabelProps={{ shrink: true }} sx={{ minWidth: 160, bgcolor: '#fff', borderRadius: 1 }} />
          <TextField label="Year" type="number" size="small" value={year}
            onChange={(e) => setYear(e.target.value)} InputLabelProps={{ shrink: true }} sx={{ width: 100, bgcolor: '#fff', borderRadius: 1 }} inputProps={{ min: 2020, max: 2099 }} />
          <Button variant="contained" startIcon={<FiFilter />} onClick={fetchData}
            sx={{ height: 36, textTransform: 'none', fontWeight: 600 }}>
            Load
          </Button>
          <Button size="small" variant="text" startIcon={<FiX />} onClick={resetDate}
            sx={{ textTransform: 'none', color: 'text.secondary' }}>Reset</Button>
        </Stack>
      </Paper>

      <Ribbon count={overduePrs.length} label="Overdue PR item(s) — expected date passed" color="#e11d48" bgcolor="#fff1f2" icon={FiAlertOctagon} onClick={() => setOverduePrOpen(true)} />
      <Ribbon count={delayedPos.length} label="Delayed PO(s) — issued after PR date" color="#9333ea" bgcolor="#faf5ff" icon={FiAlertOctagon} onClick={() => setDelayedPoOpen(true)} />

      <Paper sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
        <Box sx={{ borderBottom: '1px solid', borderColor: 'divider', bgcolor: '#fafbfc' }}>
          <Tabs value={tab} onChange={(e, v) => setTab(v)} variant="scrollable" scrollButtons="auto"
            sx={{
              minHeight: 44, px: 1.5,
              '& .MuiTab-root': { minHeight: 44, textTransform: 'none', fontWeight: 600, fontSize: '0.875rem', px: 2.5 },
              '& .Mui-selected': { color: `${activeTab?.color} !important` },
              '& .MuiTabs-indicator': { bgcolor: activeTab?.color, height: 3 },
            }}>
            {TABS.map((t) => {
              const Icon = t.icon;
              const cnt = tabData[t.key]?.length || 0;
              return (
                <Tab key={t.key} value={t.key} label={
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Icon size={16} />
                    <span>{t.label}</span>
                    <Chip size="small" label={cnt}
                      sx={{ fontWeight: 700, fontSize: '0.68rem', height: 20, bgcolor: tab === t.key ? `${t.color}15` : '#f1f5f9', color: tab === t.key ? t.color : '#64748b' }} />
                  </Stack>
                } sx={{ color: tab === t.key ? t.color : 'text.secondary' }} />
              );
            })}
          </Tabs>
        </Box>
        <Box sx={{ p: 2 }}>
          <DataTable title={`${TITLES[tab]} — ${dateFrom.split('-').reverse().join('-')}${dateTo !== dateFrom ? ` to ${dateTo.split('-').reverse().join('-')}` : ''}`}
            columns={tab === 'prs' ? prsColumns : COLUMNS[tab]} rows={tabData[tab]}
            loading={loading} emptyMessage={`No ${TITLES[tab].toLowerCase()} found`} />
        </Box>
      </Paper>

      <Dialog open={overduePrOpen} onClose={() => setOverduePrOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, fontSize: '1rem', color: '#e11d48' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FiAlertOctagon size={20} /> Overdue PR Items ({overduePrs.length})
          </Box>
        </DialogTitle>
        <DialogContent>
          {renderTable(overduePrCols, overduePrs, 'No overdue PR items')}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOverduePrOpen(false)} variant="contained" sx={{ textTransform: 'none' }}>Close</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={delayedPoOpen} onClose={() => setDelayedPoOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, fontSize: '1rem', color: '#9333ea' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FiAlertOctagon size={20} /> Delayed Purchase Orders ({delayedPos.length})
          </Box>
        </DialogTitle>
        <DialogContent>
          {renderTable(delayedPoCols, delayedPos, 'No delayed POs')}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDelayedPoOpen(false)} variant="contained" sx={{ textTransform: 'none' }}>Close</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={detailOpen} onClose={() => setDetailOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, fontSize: '1rem' }}>
          PR {detailPr?.req_no} — Items
        </DialogTitle>
        <DialogContent>
          {detailPr && (
            <Box sx={{ mb: 2, display: 'flex', gap: 3, flexWrap: 'wrap' }}>
              <Typography variant="body2"><strong>Dept:</strong> {detailPr.department || '-'}</Typography>
              <Typography variant="body2"><strong>Date:</strong> {detailPr.req_date ? formatDate(detailPr.req_date) : '-'}</Typography>
              <Typography variant="body2"><strong>Priority:</strong> {detailPr.priority || '-'}</Typography>
              <Typography variant="body2"><strong>Status:</strong> {detailPr.status || '-'}</Typography>
              <Typography variant="body2"><strong>Requested By:</strong> {detailPr.requested_by || '-'}</Typography>
            </Box>
          )}
          {renderTable(itemCols, detailItems, 'No items')}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailOpen(false)} variant="contained" sx={{ textTransform: 'none' }}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
