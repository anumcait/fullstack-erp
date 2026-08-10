import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card, CardContent, Box, Typography, Stack, Button, Divider,
  LinearProgress, TextField, Tabs, Tab, Chip, Avatar, List,
  ListItem, Skeleton, Tooltip, IconButton, alpha, useTheme,
  Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow,
} from '@mui/material';
import {
  FiBox, FiAlertTriangle, FiLayers, FiArrowUpRight, FiActivity,
  FiTruck, FiArchive, FiPlus, FiRefreshCw, FiChevronRight, FiChevronDown,
  FiArrowRight, FiClipboard, FiCheckCircle, FiXCircle, FiTrendingUp,
  FiDollarSign, FiCreditCard, FiTool, FiCalendar, FiFileText, FiSettings,
  FiShoppingBag, FiSearch,
} from 'react-icons/fi';
import axios from 'axios';
import PageHeader from '../../Common/PageHeader';
import StatusChip from '../../Common/StatusChip';
import { formatCompactCurrency, formatCurrency, formatDate, formatQty, formatSmartDateTime } from '../../../utils/format';

const today = () => new Date().toISOString().slice(0, 10);

const QUICK_LINKS = [
  { label: 'Material Requisition', to: '/stores/material-requisitions/add', icon: FiArrowUpRight },
  { label: 'Material Issue', to: '/stores/material-issues/add', icon: FiActivity },
  { label: 'Goods Receipt', to: '/stores/grr/add', icon: FiTruck },
  { label: 'Repair Billing', to: '/stores/repair-billing', icon: FiTool },
  { label: 'Misc / Voucher', to: '/stores/misc-voucher-billing', icon: FiCreditCard },
  { label: 'Item Master', to: '/stores/item-master', icon: FiBox },
  { label: 'Reports', to: '/stores/reports', icon: FiArrowRight },
];

const KPI_CONFIG = [
  { key: 'total_items', label: 'Total Items', icon: FiBox, color: '#10b981', to: '/stores/item-master' },
  { key: 'total_stock_value', label: 'Inventory Value', icon: FiArchive, color: '#3b82f6', to: '/stores/reports', format: 'currency' },
  { key: 'low_stock', label: 'Low Stock', icon: FiAlertTriangle, color: '#ef4444', to: '/stores/reports', alert: true },
  { key: 'total_categories', label: 'Categories', icon: FiLayers, color: '#0ea5e9', to: '/stores/item-groups' },
  { key: 'pending_mrs', label: 'Pending MRs', icon: FiArrowUpRight, color: '#f59e0b', to: '/stores/material-requisitions' },
  { key: 'pending_issues', label: 'Pending Issues', icon: FiActivity, color: '#a855f7', to: '/stores/material-issues' },
  { key: 'recent_grns', label: 'GRNs (30d)', icon: FiTruck, color: '#22c55e', to: '/stores/grr' },
  { key: 'warehouses', label: 'Warehouses', icon: FiArchive, color: '#64748b', static: 1 },
];

/* ─── KPI List Row (sidebar) ─────────────────────────────────── */
const KpiRow = ({ config, stats, loading, onClick }) => {
  const Icon = config.icon;
  const raw = config.static ?? stats?.[config.key];
  const value = config.format === 'currency' ? formatCompactCurrency(raw) : raw;
  const isAlert = config.alert && Number(raw) > 0;

  return (
    <Box
      onClick={onClick}
      sx={{
        display: 'flex', alignItems: 'center', gap: 1.5,
        px: 1.5, py: 1, cursor: 'pointer', borderRadius: 1,
        transition: 'background 0.15s',
        '&:hover': { bgcolor: 'action.hover' },
        '&:hover .kpi-arr': { opacity: 1, transform: 'translateX(1px)' },
      }}
    >
      <Box sx={{ width: 3, height: 28, borderRadius: 2, bgcolor: config.color, flexShrink: 0 }} />
      <Box sx={{ color: config.color, display: 'flex', flexShrink: 0 }}>
        <Icon size={14} />
      </Box>
      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500, flex: 1, lineHeight: 1.2 }}>
        {config.label}
      </Typography>
      {loading ? (
        <Skeleton width={28} height={20} />
      ) : (
        <Typography variant="body2" sx={{ fontWeight: 700, color: isAlert ? 'error.main' : config.color, fontSize: '1rem', flexShrink: 0 }}>
          {value ?? '—'}
        </Typography>
      )}
      <FiChevronRight size={12} className="kpi-arr" style={{ opacity: 0, color: '#94a3b8', flexShrink: 0, transition: 'opacity 0.15s, transform 0.15s' }} />
    </Box>
  );
};

/* ─── Health bar ─────────────────────────────────────────────── */
const HealthBar = ({ label, value, total, color, sublabel }) => (
  <Box>
    <Stack direction="row" justifyContent="space-between" alignItems="baseline">
      <Typography variant="caption" color="text.secondary">{label}</Typography>
      <Typography variant="caption" sx={{ fontWeight: 700, color }}>{value}{sublabel ? ` · ${sublabel}` : ''}</Typography>
    </Stack>
    <Box sx={{ height: 6, borderRadius: 3, bgcolor: 'action.hover', mt: 0.5 }}>
      <Box sx={{ height: '100%', width: `${Math.min(100, (value / (total || 1)) * 100)}%`, borderRadius: 3, bgcolor: color, transition: 'width 0.4s ease' }} />
    </Box>
  </Box>
);

/* ─── Store Activity table cell styles ────────────────────────── */
const actThSx = { fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.4, color: '#475569', borderBottom: '1px solid', borderColor: 'divider', py: 0.9, px: 1.2, whiteSpace: 'nowrap' };
const actThFilterSx = { borderBottom: '1px solid', borderColor: 'divider', py: 0.5, px: 1.2 };
const actTdSx = { fontSize: '0.875rem', borderBottom: '1px solid', borderColor: 'divider', py: 0.75, px: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' };
const detThSx = { fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.4, color: '#1e293b', borderBottom: '1px solid', borderColor: '#cbd5e1', py: 0.6, px: 1, whiteSpace: 'nowrap' };
const detTdSx = { fontSize: '0.875rem', borderBottom: '1px solid', borderColor: '#e2e8f0', py: 0.6, px: 1, whiteSpace: 'nowrap' };

const ItemDetailGrid = ({ rows, columns }) => (
  <Box sx={{ p: 1.25, bgcolor: '#f8fafc', overflow: 'auto' }}>
    {rows.length === 0 ? (
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', py: 3, color: '#94a3b8' }}>No items</Typography>
    ) : (
      <Table size="small" sx={{ borderCollapse: 'separate', borderSpacing: 0 }}>
        <TableHead>
          <TableRow sx={{ bgcolor: '#e8edf4' }}>
            <TableCell sx={detThSx} width={30}>#</TableCell>
            {columns.map((c) => (
              <TableCell key={c.label} align={c.align || 'left'} sx={detThSx}>{c.label}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((it, i) => (
            <TableRow key={it.item_id || i}>
              <TableCell sx={{ ...detTdSx, textAlign: 'center', fontWeight: 700, color: '#64748b' }}>{i + 1}</TableCell>
              {columns.map((c) => (
                <TableCell
                  key={c.label}
                  align={c.align || 'left'}
                  sx={{
                    ...detTdSx,
                    ...(c.accent ? { fontWeight: 700, color: c.accent } : {}),
                    ...(c.mono ? { fontFamily: 'monospace', color: '#1565c0' } : {}),
                  }}
                >
                  {c.value ? c.value(it) : (it[c.field] != null ? String(it[c.field]) : '—')}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    )}
  </Box>
);

/* ─── Main Component ─────────────────────────────────────────── */
const StoresDashboard = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [date, setDate] = useState(today());
  const [stats, setStats] = useState(null);
  const [daily, setDaily] = useState({ summary: {}, prs: [], pos: [], grns: [] });
  const [loading, setLoading] = useState(true);
  const [actTab, setActTab] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);
  const [irRows, setIrRows] = useState([]);
  const [irPendingDcs, setIrPendingDcs] = useState([]);
  const [irLoading, setIrLoading] = useState(true);
  const [billing, setBilling] = useState({ repair: [], maint: [], vouchers: [], sale: [], grr: [] });
  const [billingLoading, setBillingLoading] = useState(true);
  const [colSearch, setColSearch] = useState({});
  const [actSearch, setActSearch] = useState('');
  const [sortState, setSortState] = useState({ field: null, dir: 'asc' });
  const [expandedActId, setExpandedActId] = useState(null);
  const [actPage, setActPage] = useState(0);
  const [actPageSize, setActPageSize] = useState(10);

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      axios.get('/api/erp/stores/dashboard').catch(() => ({ data: null })),
      axios.get('/api/erp/purchase/reports/daily', { params: { date } }).catch(() => ({ data: { summary: {}, prs: [], pos: [], grns: [] } })),
    ]).then(([s, d]) => {
      setStats(s.data);
      setDaily(d.data || { summary: {}, prs: [], pos: [], grns: [] });
    }).finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, [date, refreshKey]);

  useEffect(() => {
    let active = true;
    setBillingLoading(true);
    Promise.all([
      axios.get('/api/erp/stores/inward-registers/pending-billing', { params: { dc_type: 'R' } }).catch(() => ({ data: [] })),
      axios.get('/api/erp/stores/inward-registers/pending-billing', { params: { dc_type: 'M' } }).catch(() => ({ data: [] })),
      axios.get('/api/erp/stores/misc-vouchers', { params: { status: 'Draft' } }).catch(() => ({ data: [] })),
      axios.get('/api/erp/stores/inward-registers/pending-billing', { params: { dc_type: 'J' } }).catch(() => ({ data: [] })),
      axios.get('/api/erp/stores/inward-registers/pending-billing', { params: { dc_type: 'S' } }).catch(() => ({ data: [] })),
      axios.get('/api/erp/stores/grn', { params: { status: 'Received' } }).catch(() => ({ data: [] })),
    ]).then(([r, m, v, j, s, g]) => {
      if (!active) return;
      const grnRows = Array.isArray(g.data) ? g.data : [];
      setBilling({
        repair: Array.isArray(r.data) ? r.data : [],
        maint: Array.isArray(m.data) ? m.data : [],
        vouchers: Array.isArray(v.data) ? v.data : [],
        sale: [...(Array.isArray(j.data) ? j.data : []), ...(Array.isArray(s.data) ? s.data : [])],
        grr: grnRows.filter((x) => !x.bill_no),
      });
    }).finally(() => active && setBillingLoading(false));
    return () => { active = false; };
  }, [refreshKey]);

  useEffect(() => {
    let active = true;
    setIrLoading(true);
    const from = new Date(date);
    from.setMonth(from.getMonth() - 3);
    Promise.all([
      axios.get('/api/erp/stores/inward-registers', { params: { date_from: from.toISOString().slice(0, 10), date_to: date } }).catch(() => ({ data: [] })),
      axios.get('/api/erp/stores/inward-registers/pending-dcs').catch(() => ({ data: [] })),
    ]).then(([irRes, dcRes]) => {
      if (!active) return;
      setIrRows(Array.isArray(irRes.data) ? irRes.data : []);
      setIrPendingDcs(Array.isArray(dcRes.data) ? dcRes.data : []);
    }).finally(() => active && setIrLoading(false));
    return () => { active = false; };
  }, [date, refreshKey]);

  const irStats = useMemo(() => {
    const s = { total: irRows.length, received: 0, approved: 0, cancelled: 0, value: 0 };
    irRows.forEach((r) => {
      if (r.status === 'Received') s.received++;
      else if (r.status === 'Approved') s.approved++;
      else if (r.status === 'Cancelled') s.cancelled++;
      s.value += (r.items || []).reduce((sum, i) => sum + (Number(i.qty_supplied || 0) * Number(i.rate || 0)), 0);
    });
    return s;
  }, [irRows]);

  const irPendingBalance = useMemo(() => irPendingDcs.reduce((sum, d) => sum + (d.items || []).reduce((s, it) => s + Number(it.qty_pending >= 0 ? it.qty_pending : 0), 0), 0), [irPendingDcs]);

  const s = daily.summary || {};

  const masterCols = [
    [
      { field: 'ir_no', header: 'GRN #', mono: true },
      { field: 'ir_date', header: 'Date', render: (r) => (r.ir_date ? formatDate(r.ir_date) : '—') },
      { field: 'supplier_name', header: 'Supplier' },
      { field: 'ir_type', header: 'Type' },
      { field: 'invoice_no', header: 'Invoice' },
      { field: 'qa_status', header: 'QA', chip: true },
      { field: 'approval_status', header: 'Approval', chip: true },
      { field: 'received_by', header: 'Received By' },
      { field: 'items', header: 'Items', align: 'center', render: (r) => (r.items ? r.items.length : 0) },
    ],
    [
      { field: 'req_no', header: 'PR #', mono: true },
      { field: 'req_date', header: 'Date', render: (r) => (r.req_date ? formatDate(r.req_date) : '—') },
      { field: 'requested_by', header: 'Requested By' },
      { field: 'department', header: 'Department' },
      { field: 'sub_department', header: 'Sub Dept' },
      { field: 'priority', header: 'Priority', chip: true },
      { field: 'status', header: 'Status', chip: true },
      { field: 'items', header: 'Items', align: 'center', render: (r) => (r.items ? r.items.length : 0) },
    ],
    [
      { field: 'po_no', header: 'PO #', mono: true },
      { field: 'po_date', header: 'Date', render: (r) => (r.po_date ? formatDate(r.po_date) : '—') },
      { field: 'supplier_name', header: 'Supplier' },
      { field: 'status', header: 'Status', chip: true },
      { field: 'payment_terms', header: 'Payment' },
      { field: 'grand_total', header: 'Total', align: 'right', render: (r) => (r.grand_total ? formatCurrency(r.grand_total, r.currency) : '—') },
      { field: 'items', header: 'Items', align: 'center', render: (r) => (r.items ? r.items.length : 0) },
    ],
  ];

  const itemCols = [
    [
      { label: 'Item Code', value: (it) => it.item_code, mono: true },
      { label: 'Description', value: (it) => it.item_name || it.item_code },
      { label: 'Qty', value: (it) => formatQty(it.accepted_qty), align: 'center' },
      { label: 'Rejected', value: (it) => formatQty(it.rejected_qty), align: 'center' },
      { label: 'Rate', value: (it) => (it.rate ? formatCurrency(it.rate) : '—'), align: 'center' },
      { label: 'Amount', value: (it) => (it.amount ? formatCurrency(it.amount) : '—'), align: 'center', accent: '#059669' },
    ],
    [
      { label: 'Item Code', value: (it) => it.item_code, mono: true },
      { label: 'Description', value: (it) => it.item_name || it.item_code },
      { label: 'UOM', value: (it) => it.uom || '—', align: 'center' },
      { label: 'Qty', value: (it) => formatQty(it.quantity), align: 'center' },
      { label: 'Expected', value: (it) => (it.expected_date ? formatDate(it.expected_date) : '—'), align: 'center' },
      { label: 'Cost Center', value: (it) => it.cost_center || '—' },
    ],
    [
      { label: 'Item Code', value: (it) => it.item_code, mono: true },
      { label: 'Description', value: (it) => it.item_name || it.item_code },
      { label: 'Ordered', value: (it) => formatQty(it.quantity), align: 'center' },
      { label: 'Received', value: (it) => formatQty(it.received_quantity), align: 'center' },
      { label: 'Rate', value: (it) => (it.rate ? formatCurrency(it.rate) : '—'), align: 'center' },
      { label: 'Value', value: (it) => formatCurrency((Number(it.quantity) || 0) * (Number(it.rate) || 0)), align: 'center', accent: '#059669' },
      { label: 'Delivery', value: (it) => (it.delivery_date ? formatDate(it.delivery_date) : '—'), align: 'center' },
    ],
  ];

  const renderMasterCell = (col, row) => {
    if (col.chip) return <StatusChip status={row[col.field]} />;
    if (col.mono) return <Typography sx={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.85rem', color: '#1565c0' }}>{row[col.field] ?? '—'}</Typography>;
    if (col.render) return col.render(row);
    const v = row[col.field];
    return v != null && v !== '' ? String(v) : '—';
  };
  const actGroups = useMemo(() => {
    const group = (rows, key) => {
      const map = new Map();
      rows.forEach((r) => {
        const id = r[key];
        if (!map.has(id)) map.set(id, { ...r, items: [] });
        map.get(id).items.push(r);
      });
      return Array.from(map.values());
    };
    return {
      grns: group(daily.grns || [], 'grn_id'),
      prs: group(daily.prs || [], 'req_id'),
      pos: group(daily.pos || [], 'po_id'),
    };
  }, [daily]);

  const actRows = [actGroups.grns, actGroups.prs, actGroups.pos];
  const actCounts = [s.grn_count || 0, s.pr_count || 0, s.po_count || 0];

  const actSummary = useMemo(() => {
    const rows = actRows[actTab] || [];
    if (actTab === 0) {
      const value = rows.reduce((a, r) => a + (r.items || []).reduce((x, it) => x + Number(it.amount || 0), 0), 0);
      const lines = rows.reduce((a, r) => a + (r.items || []).length, 0);
      return [
        { label: 'Receipts', value: rows.length, color: '#0891b2', icon: FiTruck },
        { label: 'Lines', value: lines, color: '#2563eb', icon: FiClipboard },
        { label: 'Value', value: formatCompactCurrency(value), color: '#059669', icon: FiDollarSign },
      ];
    }
    if (actTab === 1) {
      const qty = rows.reduce((a, r) => a + (r.items || []).reduce((x, it) => x + Number(it.quantity || 0), 0), 0);
      const lines = rows.reduce((a, r) => a + (r.items || []).length, 0);
      return [
        { label: 'PRs', value: rows.length, color: '#2563eb', icon: FiClipboard },
        { label: 'Lines', value: lines, color: '#7c3aed', icon: FiFileText },
        { label: 'Qty', value: formatQty(qty), color: '#0891b2', icon: FiArrowUpRight },
      ];
    }
    const value = rows.reduce((a, r) => a + Number(r.grand_total || 0), 0);
    const openQty = rows.reduce((a, r) => a + (r.items || []).reduce((x, it) => x + (Number(it.quantity || 0) - Number(it.received_quantity || 0)), 0), 0);
    const lines = rows.reduce((a, r) => a + (r.items || []).length, 0);
    return [
      { label: 'POs', value: rows.length, color: '#7c3aed', icon: FiShoppingBag },
      { label: 'Lines', value: lines, color: '#2563eb', icon: FiClipboard },
      { label: 'Value', value: formatCompactCurrency(value), color: '#ea580c', icon: FiDollarSign },
      { label: 'Open Qty', value: formatQty(openQty), color: '#0d9488', icon: FiArrowUpRight },
    ];
  }, [actRows, actTab]);

  const filteredActRows = useMemo(() => {
    const rows = actRows[actTab] || [];
    const q = (actSearch || '').trim().toLowerCase();
    let out = rows;
    if (q) {
      const cols = masterCols[actTab];
      out = rows.filter((r) => cols.some((c) => String(r[c.field] ?? '').toLowerCase().includes(q)));
    }
    const active = Object.entries(colSearch).filter(([, v]) => String(v || '').trim() !== '');
    if (active.length) {
      out = out.filter((r) =>
        active.every(([field, qq]) => String(r[field] ?? '').toLowerCase().includes(String(qq).toLowerCase()))
      );
    }
    return out;
  }, [actRows, actTab, actSearch, colSearch]);

  const sortedActRows = useMemo(() => {
    const rows = [...filteredActRows];
    if (sortState.field) {
      const { field, dir } = sortState;
      rows.sort((a, b) => {
        const av = a[field], bv = b[field];
        if (av == null) return 1;
        if (bv == null) return -1;
        const na = parseFloat(av), nb = parseFloat(bv);
        const bothNum = !Number.isNaN(na) && !Number.isNaN(nb) && av !== '' && bv !== '';
        const cmp = bothNum ? na - nb : String(av).localeCompare(String(bv));
        return dir === 'asc' ? cmp : -cmp;
      });
    }
    return rows;
  }, [filteredActRows, sortState]);

  const pagedActRows = sortedActRows.slice(actPage * actPageSize, actPage * actPageSize + actPageSize);

  const handleActTabChange = (_, v) => {
    setActTab(v);
    setColSearch({});
    setActSearch('');
    setSortState({ field: null, dir: 'asc' });
    setExpandedActId(null);
    setActPage(0);
  };

  const docId = (r) => r.grn_id ?? r.req_id ?? r.po_id;

  const toggleExpand = (r) => {
    const id = docId(r);
    setExpandedActId((prev) => (prev === id ? null : id));
  };

  const handleSort = (field) => {
    setSortState((prev) => {
      if (prev.field !== field) return { field, dir: 'asc' };
      if (prev.dir === 'asc') return { field, dir: 'desc' };
      return { field: null, dir: 'asc' };
    });
    setActPage(0);
  };

  const lowStockPct = stats ? Math.min(100, (Number(stats.low_stock) / (Number(stats.total_items) || 1)) * 100) : 0;

  const heroStats = [
    { label: 'Total Stock Value', value: stats ? formatCompactCurrency(stats.total_stock_value) : null, sub: `${stats?.total_items ?? '—'} items tracked`, accent: theme.palette.primary.main, icon: FiDollarSign, to: '/stores/reports' },
    { label: 'Low Stock Items', value: stats?.low_stock ?? null, sub: 'Below reorder level', accent: Number(stats?.low_stock) > 0 ? '#ef4444' : '#10b981', icon: FiAlertTriangle, to: '/stores/reports' },
    { label: 'Pending MRs', value: stats?.pending_mrs ?? null, sub: `${stats?.pending_issues ?? '—'} issues pending`, accent: '#ed6c02', icon: FiTrendingUp, to: '/stores/material-requisitions' },
    { label: 'GRNs This Month', value: stats?.recent_grns ?? null, sub: 'Material received', accent: '#10b981', icon: FiTruck, to: '/stores/grr' },
  ];

  return (
    <Box sx={{ p: { xs: 1.5, md: 2 } }}>
      {/* ── Header ── */}
      <PageHeader
        title="Stores & Inventory"
        subtitle="Real-time stock control — receipts, issues, valuation & replenishment"
        icon={<FiBox size={20} />}
        actions={
          <Stack direction="row" spacing={1} alignItems="center">
            <TextField
              label="As of Date"
              type="date"
              size="small"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ bgcolor: 'background.paper', borderRadius: 1, width: 148 }}
            />
            <Tooltip title="Refresh">
              <span>
                <IconButton size="small" onClick={() => setRefreshKey(k => k + 1)} disabled={loading}>
                  <FiRefreshCw size={15} />
                </IconButton>
              </span>
            </Tooltip>
          </Stack>
        }
      />

      {/* ── Quick Actions (horizontal) ── */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 0.75, mb: 2 }}>
        {QUICK_LINKS.map((q) => {
          const Icon = q.icon;
          return (
            <Button
              key={q.label}
              size="small"
              variant="outlined"
              startIcon={<Icon size={13} />}
              onClick={() => navigate(q.to)}
              sx={{ textTransform: 'none', borderRadius: 1.5, py: 0.5, fontSize: '0.875rem', color: 'text.secondary', borderColor: 'divider', '&:hover': { borderColor: 'primary.main', color: 'primary.main', bgcolor: alpha(theme.palette.primary.main, 0.04) } }}
            >
              {q.label}
            </Button>
          );
        })}
        <Button
          size="small"
          variant="contained"
          startIcon={<FiPlus size={13} />}
          onClick={() => navigate('/stores/material-requisitions/add')}
          sx={{ textTransform: 'none', borderRadius: 1.5, py: 0.5, fontSize: '0.875rem', ml: 'auto' }}
        >
          New Requisition
        </Button>
      </Box>

      {/* ── Hero: 4 summary tiles ── */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: { xs: 0.75, sm: 1 }, mb: 2 }}>
        {heroStats.map((item) => (
          <Card
            key={item.label}
            onClick={item.to ? () => navigate(item.to) : null}
            sx={{
              px: 1.5, py: 1.5, borderRadius: 2, cursor: item.to ? 'pointer' : 'default',
              boxShadow: 'none', border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper',
              transition: 'all 0.15s',
              '&:hover': item.to ? { borderColor: alpha(item.accent, 0.5), boxShadow: `0 2px 10px ${alpha(item.accent, 0.12)}`, transform: 'translateY(-1px)' } : {},
            }}
          >
            <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1} sx={{ mb: 1 }}>
              <Avatar variant="rounded" sx={{ width: 34, height: 34, bgcolor: alpha(item.accent, 0.12), color: item.accent }}>
                <item.icon size={17} />
              </Avatar>
              {loading ? <Skeleton width={56} height={24} /> : (
                <Typography sx={{ fontSize: '1.5rem', fontWeight: 800, lineHeight: 1, color: item.accent, letterSpacing: -0.5 }}>
                  {item.value ?? '—'}
                </Typography>
              )}
            </Stack>
            <Typography sx={{ fontSize: '0.8125rem', fontWeight: 700, color: 'text.primary', textTransform: 'uppercase', letterSpacing: 0.4 }}>
              {item.label}
            </Typography>
            <Typography sx={{ fontSize: '0.8125rem', color: 'text.secondary', mt: 0.25, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {item.sub}
            </Typography>
          </Card>
        ))}
      </Box>

      {/* ── Two-column layout ── */}
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>

        {/* ════ LEFT SIDEBAR ════ */}
        <Box sx={{ width: 230, flexShrink: 0, display: { xs: 'none', md: 'flex' }, flexDirection: 'column', gap: 1.5 }}>

          {/* KPI list */}
          <Card sx={{ borderRadius: 2, boxShadow: 'none', border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
            <Box sx={{ px: 1.5, py: 1, borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'grey.50', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: 'text.secondary', fontSize: '0.75rem' }}>
                Overview
              </Typography>
              <FiBox size={12} style={{ color: theme.palette.text.disabled }} />
            </Box>
            <Stack divider={<Divider />}>
              {KPI_CONFIG.map((cfg) => (
                <KpiRow key={cfg.key} config={cfg} stats={stats} loading={loading} onClick={() => cfg.to && navigate(cfg.to)} />
              ))}
            </Stack>
          </Card>

          {/* Inventory Health panel */}
          <Card sx={{ borderRadius: 2, boxShadow: 'none', border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
            <Box sx={{ px: 1.5, py: 1, borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'grey.50', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: 'text.secondary', fontSize: '0.75rem' }}>
                Health
              </Typography>
              {lowStockPct > 0 && (
                <Chip label={`${lowStockPct.toFixed(0)}% low`} size="small" color="error" variant="outlined" sx={{ height: 16, fontSize: '0.7rem' }} />
              )}
            </Box>
            <Box sx={{ p: 1.5 }}>
              {loading ? (
                <Stack spacing={1}>{[1, 2, 3, 4].map(i => <Skeleton key={i} height={28} />)}</Stack>
              ) : stats ? (
                <Stack spacing={1.5}>
                  <HealthBar label="Total Items" value={Number(stats.total_items)} total={Number(stats.total_items)} color="#10b981" />
                  <HealthBar label="Low Stock" value={Number(stats.low_stock)} total={Number(stats.total_items) || 1} color="#ef4444" sublabel="reorder" />
                  <HealthBar label="Pending MRs" value={Number(stats.pending_mrs)} total={(Number(stats.pending_mrs) + Number(stats.pending_issues)) || 1} color="#f59e0b" />
                  <HealthBar label="Pending Issues" value={Number(stats.pending_issues)} total={(Number(stats.pending_mrs) + Number(stats.pending_issues)) || 1} color="#a855f7" />
                </Stack>
              ) : (
                <Typography variant="caption" color="text.secondary">No data</Typography>
              )}
              <Button
                size="small"
                endIcon={<FiArrowRight size={12} />}
                onClick={() => navigate('/stores/reports')}
                sx={{ mt: 1.5, textTransform: 'none', fontSize: '0.85rem', p: 0, color: 'primary.main' }}
              >
                Stores Reports
              </Button>
            </Box>
          </Card>

        </Box>{/* end sidebar */}

        {/* ════ RIGHT MAIN AREA ════ */}
        <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>

          {/* Mobile KPI chips */}
          <Box sx={{ display: { xs: 'flex', md: 'none' }, gap: 1, flexWrap: 'wrap' }}>
            {KPI_CONFIG.filter(c => c.to).map((cfg) => {
              const Icon = cfg.icon;
              const raw = cfg.static ?? stats?.[cfg.key];
              const val = cfg.format === 'currency' ? formatCompactCurrency(raw) : raw;
              return (
                <Box key={cfg.key} onClick={() => navigate(cfg.to)} sx={{ display: 'flex', alignItems: 'center', gap: 0.75, px: 1.25, py: 0.75, border: '1px solid', borderColor: 'divider', borderRadius: 1.5, cursor: 'pointer', minWidth: 110, flex: '1 1 110px', '&:hover': { borderColor: cfg.color, bgcolor: alpha(cfg.color, 0.04) } }}>
                  <Icon size={13} style={{ color: cfg.color }} />
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.75rem' }}>{cfg.label}</Typography>
                    <Typography variant="body2" sx={{ fontSize: '0.875rem', fontWeight: 700, color: cfg.color, lineHeight: 1 }}>{loading ? '…' : (val ?? '—')}</Typography>
                  </Box>
                </Box>
              );
            })}
          </Box>

          {/* Daily Activity — full width */}
          <Card sx={{ borderRadius: 2, boxShadow: 'none', border: '1px solid', borderColor: 'divider' }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 2, pt: 1.25, pb: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Store Activity</Typography>
                <Typography variant="caption" color="text.secondary">{formatDate(date)}</Typography>
              </Box>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <TextField
                  size="small"
                  placeholder="Search documents…"
                  value={actSearch}
                  onChange={(e) => { setActSearch(e.target.value); setActPage(0); }}
                  InputProps={{ startAdornment: <FiSearch size={13} style={{ marginRight: 6, color: '#94a3b8' }} /> }}
                  sx={{ width: 200, '& .MuiInputBase-root': { fontSize: '0.875rem' } }}
                />
                <Tabs
                  value={actTab}
                  onChange={handleActTabChange}
                  variant="scrollable"
                  scrollButtons="auto"
                  sx={{ '& .MuiTab-root': { fontSize: '0.85rem', minHeight: 34, py: 0.25, textTransform: 'none', px: 1.5 } }}
                >
                  <Tab label={`GRNs (${actCounts[0]})`} />
                  <Tab label={`PRs (${actCounts[1]})`} />
                  <Tab label={`POs (${actCounts[2]})`} />
                </Tabs>
              </Stack>
            </Box>
            <Box sx={{ px: 2, py: 1, display: 'flex', gap: 1, flexWrap: 'wrap', borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'grey.50' }}>
              {actSummary.map((item) => {
                const Icon = item.icon;
                return (
                  <Box key={item.label} sx={{ display: 'flex', alignItems: 'center', gap: 0.75, px: 1.25, py: 0.6, borderRadius: 1.5, bgcolor: alpha(item.color, 0.08), border: '1px solid', borderColor: alpha(item.color, 0.15) }}>
                    <Icon size={13} style={{ color: item.color }} />
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: 'text.secondary' }}>{item.label}</Typography>
                    <Typography sx={{ fontSize: '1rem', fontWeight: 800, color: item.color, lineHeight: 1 }}>{item.value}</Typography>
                  </Box>
                );
              })}
            </Box>
            <Box sx={{ p: 1.5 }}>
              <TableContainer sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#f8fafc' }}>
                      <TableCell sx={actThSx} width={38}>#</TableCell>
                      {masterCols[actTab].map((c) => (
                        <TableCell
                          key={c.field}
                          sx={{ ...actThSx, ...(c.align ? { textAlign: c.align } : {}) }}
                          onClick={() => c.field && !c.chip && c.field !== 'items' && handleSort(c.field)}
                          style={{ cursor: c.field && !c.chip && c.field !== 'items' ? 'pointer' : 'default' }}
                        >
                          <Stack direction="row" alignItems="center" spacing={0.5}>
                            <Typography noWrap sx={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.4, color: '#475569' }}>{c.header}</Typography>
                            {sortState.field === c.field && (
                              <Typography sx={{ fontSize: '0.7rem', fontWeight: 800, color: '#2563eb', flexShrink: 0 }}>{sortState.dir === 'asc' ? '↑' : '↓'}</Typography>
                            )}
                          </Stack>
                        </TableCell>
                      ))}
                    </TableRow>
                    <TableRow>
                      <TableCell sx={actThFilterSx} width={38} />
                      {masterCols[actTab].map((c) => (
                        <TableCell key={c.field} sx={actThFilterSx}>
                          <TextField
                            size="small"
                            placeholder="Search…"
                            value={colSearch[c.field] || ''}
                            onChange={(e) => setColSearch((p) => ({ ...p, [c.field]: e.target.value }))}
                            onClick={(e) => e.stopPropagation()}
                            sx={{ width: '100%', minWidth: 70, '& .MuiInputBase-root': { fontSize: '0.8125rem' } }}
                          />
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {loading ? (
                      [...Array(6)].map((_, i) => (
                        <TableRow key={i}>
                          <TableCell colSpan={masterCols[actTab].length + 1}><Skeleton height={36} sx={{ borderRadius: 1 }} /></TableCell>
                        </TableRow>
                      ))
                    ) : pagedActRows.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={masterCols[actTab].length + 1} sx={{ textAlign: 'center', py: 5, color: '#94a3b8' }}>
                          <FiClipboard size={22} style={{ opacity: 0.4, marginBottom: 6 }} />
                          <Typography variant="body2" sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#0f172a' }}>No documents for this date</Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      pagedActRows.map((r, i) => {
                        const rid = docId(r);
                        return (
                          <React.Fragment key={rid ?? i}>
                            <TableRow
                              hover
                              sx={{ cursor: 'pointer', ...((actPage * actPageSize + i) % 2 === 1 ? { bgcolor: '#f9fbfd' } : {}) }}
                              onClick={() => toggleExpand(r)}
                            >
                              <TableCell sx={actTdSx} align="center">
                                <Tooltip title={expandedActId === rid ? 'Collapse' : 'Expand items'}>
                                  <IconButton size="small" sx={{ p: 0.3, color: '#64748b', '&:hover': { color: '#0f172a' } }} onClick={(e) => { e.stopPropagation(); toggleExpand(r); }}>
                                    {expandedActId === rid ? <FiChevronDown size={15} /> : <FiChevronRight size={15} />}
                                  </IconButton>
                                </Tooltip>
                              </TableCell>
                              {masterCols[actTab].map((c) => (
                                <TableCell key={c.field} sx={actTdSx} noWrap>{renderMasterCell(c, r)}</TableCell>
                              ))}
                            </TableRow>
                            {expandedActId === rid && (
                              <TableRow>
                                <TableCell colSpan={masterCols[actTab].length + 1} sx={{ p: 0, borderTop: 'none', borderBottom: 'none' }}>
                                  <ItemDetailGrid rows={r.items || []} columns={itemCols[actTab]} />
                                </TableCell>
                              </TableRow>
                            )}
                          </React.Fragment>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                component="div"
                count={filteredActRows.length}
                page={actPage}
                onPageChange={(_, p) => setActPage(p)}
                rowsPerPage={actPageSize}
                onRowsPerPageChange={(e) => { setActPageSize(parseInt(e.target.value, 10)); setActPage(0); }}
                rowsPerPageOptions={[10, 25, 50]}
                sx={{ '& .MuiTablePagination-toolbar': { minHeight: 36 }, '& .MuiTablePagination-input': { fontSize: '0.875rem' } }}
              />
            </Box>
          </Card>

          {/* Pending Billing */}
          <Card sx={{ borderRadius: 2, boxShadow: 'none', border: '1px solid', borderColor: 'divider' }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 2, pt: 1.25, pb: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Avatar variant="rounded" sx={{ width: 30, height: 30, bgcolor: alpha('#1976d2', 0.12), color: '#1976d2' }}>
                  <FiCreditCard size={15} />
                </Avatar>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Pending Billing</Typography>
                  <Typography variant="caption" color="text.secondary">Invoices & vouchers awaiting processing</Typography>
                </Box>
              </Stack>
              <Button size="small" endIcon={<FiArrowRight size={12} />} onClick={() => navigate('/stores/invoices')} sx={{ textTransform: 'none', fontSize: '0.85rem' }}>
                All Billing
              </Button>
            </Box>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', md: 'repeat(5, 1fr)' }, gap: 1, p: 1.5 }}>
              {[
                { label: 'GRR Billing', value: billingLoading ? null : (billing.grr?.length ?? 0), sub: 'Received GRRs pending bill', color: '#0891b2', icon: FiTruck, to: '/stores/invoices' },
                { label: 'Repair Billing', value: billingLoading ? null : (billing.repair?.length ?? 0), sub: 'Approved R IRs pending bill', color: '#2563eb', icon: FiTool, to: '/stores/repair-billing' },
                { label: 'Maintenance Billing', value: billingLoading ? null : (billing.maint?.length ?? 0), sub: 'Approved M IRs pending bill', color: '#7c3aed', icon: FiSettings, to: '/stores/maintenance-billing' },
                { label: 'Vouchers (Draft)', value: billingLoading ? null : (billing.vouchers?.length ?? 0), sub: 'Misc / petty cash to approve', color: '#ea580c', icon: FiFileText, to: '/stores/misc-voucher-billing' },
                { label: 'Jobwork Billing', value: billingLoading ? null : (billing.sale?.length ?? 0), sub: 'Approved J & S IRs pending bill', color: '#0d9488', icon: FiShoppingBag, to: '/stores/sale-approval' },
              ].map((k) => {
                const Icon = k.icon;
                return (
                  <Box key={k.label} onClick={() => navigate(k.to)} sx={{ px: 1.25, py: 1.1, borderRadius: 2, border: '1px solid', borderColor: 'divider', cursor: 'pointer', transition: 'all 0.15s', '&:hover': { borderColor: k.color, bgcolor: alpha(k.color, 0.04), transform: 'translateY(-1px)' } }}>
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.75 }}>
                      <Avatar variant="rounded" sx={{ width: 28, height: 28, bgcolor: alpha(k.color, 0.12), color: k.color }}>
                        <Icon size={14} />
                      </Avatar>
                      <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.4, color: 'text.secondary', lineHeight: 1.2 }}>{k.label}</Typography>
                    </Stack>
                    {billingLoading ? <Skeleton width={40} height={24} /> : (
                      <Typography sx={{ fontSize: '1.4rem', fontWeight: 800, lineHeight: 1.1, color: k.color, letterSpacing: '-0.3px' }}>{k.value ?? '—'}</Typography>
                    )}
                    <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary', mt: 0.2 }}>{k.sub}</Typography>
                  </Box>
                );
              })}
            </Box>
          </Card>

          {/* Low Stock Alert banner */}
          {!loading && stats && Number(stats.low_stock) > 0 && (
            <Box
              sx={{
                display: 'flex', alignItems: 'center', gap: 1.5,
                px: 2, py: 1, borderRadius: 2,
                bgcolor: '#fef2f2', border: '1px solid #fecaca',
                cursor: 'pointer',
                '&:hover': { bgcolor: '#fee2e2' },
              }}
              onClick={() => navigate('/stores/reports')}
            >
              <FiAlertTriangle size={16} style={{ color: '#ef4444', flexShrink: 0 }} />
              <Typography variant="body2" sx={{ fontSize: '0.875rem', color: '#b91c1c', fontWeight: 600 }}>
                {stats.low_stock} item{Number(stats.low_stock) !== 1 ? 's' : ''} below reorder level
              </Typography>
                <Button size="small" sx={{ ml: 'auto', textTransform: 'none', color: '#ef4444', fontSize: '0.8125rem', py: 0.25 }} endIcon={<FiArrowRight size={12} />}>
                View Report
              </Button>
            </Box>
          )}

          {/* ════ Inward Registers ════ */}
          <Card sx={{ borderRadius: 2, boxShadow: 'none', border: '1px solid', borderColor: 'divider' }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 2, pt: 1.25, pb: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Inward Registers</Typography>
                <Typography variant="caption" color="text.secondary">Receipts against delivery challans · Last 3 months</Typography>
              </Box>
              <Stack direction="row" spacing={0.75} alignItems="center">
                {irPendingDcs.length > 0 && (
                  <Chip label={`${irPendingBalance} qty awaiting IR`} size="small" color="warning" variant="outlined" sx={{ height: 18, fontSize: '0.75rem' }} />
                )}
                <Button size="small" endIcon={<FiArrowRight size={12} />} onClick={() => navigate('/stores/inward-registers')} sx={{ textTransform: 'none', fontSize: '0.85rem' }}>
                  View All
                </Button>
              </Stack>
            </Box>

            {/* IR KPI strip */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(5, 1fr)' }, gap: 1, px: 2, pt: 1.5 }}>
              {[
                { label: 'Total IRs', value: irStats.total, sub: 'Last 3 months', color: '#2563eb', icon: FiClipboard },
                { label: 'Received', value: irStats.received, sub: 'Pending approval', color: '#ea580c', icon: FiTruck },
                { label: 'Approved', value: irStats.approved, sub: 'Stock posted', color: '#059669', icon: FiCheckCircle },
                { label: 'Cancelled', value: irStats.cancelled, sub: 'Reversed', color: '#dc2626', icon: FiXCircle },
                { label: 'Receipt Value', value: irLoading ? '—' : formatCompactCurrency(irStats.value), sub: 'Qty × rate', color: '#7c3aed', icon: FiArrowUpRight },
              ].map((k) => {
                const Icon = k.icon;
                return (
                  <Box key={k.label} sx={{ px: 1, py: 0.9, borderRadius: 1.5, border: '1px solid', borderColor: 'divider', bgcolor: 'grey.50' }}>
                    <Stack direction="row" alignItems="center" spacing={0.75}>
                      <Avatar variant="rounded" sx={{ width: 26, height: 26, bgcolor: alpha(k.color, 0.12), color: k.color }}>
                        <Icon size={13} />
                      </Avatar>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.4, color: 'text.secondary' }}>{k.label}</Typography>
                        {irLoading ? <Skeleton width={40} height={20} /> : (
                          <Typography sx={{ fontSize: '1.2rem', fontWeight: 800, lineHeight: 1.15, color: '#0f172a', letterSpacing: '-0.3px' }}>{k.value ?? '—'}</Typography>
                        )}
                      </Box>
                    </Stack>
                  </Box>
                );
              })}
            </Box>

            {/* IR two-column: pending DCs + recent IRs */}
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', p: 2, flexDirection: { xs: 'column', lg: 'row' } }}>
              {/* Pending DCs */}
              <Box sx={{ width: { lg: 320 }, flexShrink: 0, border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}>
                <Box sx={{ px: 1.5, py: 1, borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'grey.50', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: 'text.secondary', fontSize: '0.75rem' }}>DCs Awaiting IR</Typography>
                </Box>
                <Box sx={{ p: 1.25 }}>
                  {irLoading ? (
                    <Stack spacing={1}>{[1, 2, 3].map((i) => <Skeleton key={i} height={40} />)}</Stack>
                  ) : irPendingDcs.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 4, color: '#94a3b8' }}>
                      <FiCheckCircle size={20} style={{ opacity: 0.4, marginBottom: 6 }} />
                      <Typography variant="caption">No approved DCs with pending balance.</Typography>
                    </Box>
                  ) : (
                    <Stack spacing={0.5}>
                      {irPendingDcs.slice(0, 6).map((d) => {
                        const balance = (d.items || []).reduce((s, it) => s + Number(it.qty_pending >= 0 ? it.qty_pending : 0), 0);
                        return (
                          <Box key={d.id}
                            onClick={() => navigate(`/stores/inward-registers/add?type=${d.dc_type || 'L'}&prefill_dc=${d.id}`)}
                            sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1.25, py: 0.75, borderRadius: 1.5, border: '1px solid', borderColor: 'divider', cursor: 'pointer', transition: 'all .15s', '&:hover': { borderColor: '#f59e0b', bgcolor: alpha('#f59e0b', 0.05) } }}>
                            <Box sx={{ width: 3, height: 26, borderRadius: 2, bgcolor: '#f59e0b', flexShrink: 0 }} />
                            <Box sx={{ minWidth: 0, flex: 1 }}>
                              <Typography sx={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.76rem', color: '#0f172a' }}>{d.dc_no || d.draft_no}</Typography>
                              <Typography sx={{ fontSize: '0.78rem', color: 'text.secondary', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.party_name || '-'} · {formatSmartDateTime(d.dc_date)}</Typography>
                            </Box>
                            <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
                              <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, color: '#d97706' }}>{balance}</Typography>
                              <Typography sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>qty</Typography>
                            </Box>
                            <FiArrowRight size={13} style={{ color: '#94a3b8', flexShrink: 0 }} />
                          </Box>
                        );
                      })}
                    </Stack>
                  )}
                  {!irLoading && irPendingDcs.length > 0 && (
                    <Button size="small" endIcon={<FiArrowRight size={12} />} onClick={() => navigate('/stores/inward-registers')} sx={{ mt: 1.5, textTransform: 'none', fontSize: '0.85rem', p: 0 }}>
                      View all pending DCs
                    </Button>
                  )}
                </Box>
              </Box>

              {/* Recent IRs */}
              <Box sx={{ flex: 1, minWidth: 0, border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}>
                <Box sx={{ px: 1.5, py: 1, borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'grey.50', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: 'text.secondary', fontSize: '0.75rem' }}>Recent Inward Registers</Typography>
                  {irRows.length > 0 && (
                    <Chip label={`${irRows.length} this period`} size="small" color="default" variant="outlined" sx={{ height: 16, fontSize: '0.7rem' }} />
                  )}
                </Box>
                {irLoading ? (
                  <Box sx={{ p: 2 }}><LinearProgress sx={{ borderRadius: 1 }} /></Box>
                ) : irRows.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 5, color: '#94a3b8' }}>
                    <FiClipboard size={22} style={{ opacity: 0.4, marginBottom: 8 }} />
                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#64748b', fontSize: '0.85rem' }}>No IRs yet</Typography>
                    <Typography variant="caption" sx={{ display: 'block', mt: 0.25 }}>Create an IR from an approved delivery challan.</Typography>
                  </Box>
                ) : (
                  <Box sx={{ overflowX: 'auto' }}>
                    <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse', minWidth: 640 }}>
                      <Box component="thead">
                        <Box component="tr" sx={{ bgcolor: 'grey.50' }}>
                          {['IR #', 'Date', 'Party', 'Qty', 'Value', 'Status'].map((h) => (
                            <Box component="th" key={h} sx={{ textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.4, color: 'text.secondary', px: 1.5, py: 0.9, borderBottom: '1px solid', borderColor: 'divider', whiteSpace: 'nowrap' }}>{h}</Box>
                          ))}
                        </Box>
                      </Box>
                      <Box component="tbody">
                        {irRows.slice(0, 6).map((r) => {
                          const statusC = r.status === 'Approved' ? '#059669' : r.status === 'Cancelled' ? '#dc2626' : '#d97706';
                          const statusB = r.status === 'Approved' ? '#dcfce7' : r.status === 'Cancelled' ? '#fee2e2' : '#fef3c7';
                          return (
                            <Box component="tr" key={r.id} onClick={() => navigate(`/stores/inward-registers/view/${r.id}?type=${r.dc_type || 'L'}`)} sx={{ cursor: 'pointer', transition: 'background 0.12s', '&:hover': { bgcolor: 'action.hover' } }}>
                              <Box component="td" sx={{ px: 1.5, py: 0.8, borderBottom: '1px solid', borderColor: 'divider', fontFamily: 'monospace', fontWeight: 700, fontSize: '0.875rem', color: '#1565c0' }}>{r.ir_no || '-'}</Box>
                              <Box component="td" sx={{ px: 1.5, py: 0.8, borderBottom: '1px solid', borderColor: 'divider', fontSize: '0.875rem', whiteSpace: 'nowrap' }}>{formatSmartDateTime(r.ir_date)}</Box>
                              <Box component="td" sx={{ px: 1.5, py: 0.8, borderBottom: '1px solid', borderColor: 'divider', fontSize: '0.875rem', fontWeight: 600 }}>{r.party_name || '-'}</Box>
                              <Box component="td" sx={{ px: 1.5, py: 0.8, borderBottom: '1px solid', borderColor: 'divider', fontSize: '0.875rem', textAlign: 'center' }}>{(r.items || []).reduce((s, i) => s + Number(i.qty_supplied || 0), 0)}</Box>
                              <Box component="td" sx={{ px: 1.5, py: 0.8, borderBottom: '1px solid', borderColor: 'divider', fontSize: '0.875rem', fontWeight: 700, color: '#059669' }}>{formatCompactCurrency((r.items || []).reduce((s, i) => s + (Number(i.qty_supplied || 0) * Number(i.rate || 0)), 0))}</Box>
                              <Box component="td" sx={{ px: 1.5, py: 0.8, borderBottom: '1px solid', borderColor: 'divider' }}>
                                <Box component="span" sx={{ px: 0.9, py: 0.15, borderRadius: 1.5, fontSize: '0.75rem', fontWeight: 700, bgcolor: statusB, color: statusC }}>{r.status}</Box>
                              </Box>
                            </Box>
                          );
                        })}
                      </Box>
                    </Box>
                  </Box>
                )}
              </Box>
            </Box>
          </Card>

        </Box>{/* end right */}
      </Box>{/* end two-col */}
    </Box>
  );
};

export default StoresDashboard;
