import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Chip, Button, IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import SmartTable from '../../../Common/SmartTable';
import axios from 'axios';
import { useToast } from '../../../../context/ToastContext';

const API = '/api/erp/engineering/products';

const colorSwatch = (name) => {
  const map = { white: '#ffffff', black: '#222222', brown: '#8b5a2b', grey: '#9e9e9e', gray: '#9e9e9e', blue: '#1976d2', red: '#d32f2f' };
  return map[(name || '').toString().toLowerCase()] || '#bbbbbb';
};

const NODE_COLORS = { ROOT: 'success', ASSEMBLY: 'warning', SUB_ASSEMBLY: 'warning', PHANTOM: 'secondary', SKU: 'info' };
const NODE_LABELS = {
  ROOT: 'Finished Product', ASSEMBLY: 'Assembly', SUB_ASSEMBLY: 'Sub Assembly', PHANTOM: 'Phantom', SKU: 'SKU',
};

function BomPanel({ row }) {
  const [items, setItems] = useState(row.items || []);
  const [loading, setLoading] = useState(!row.items || row.items.length === 0);
  const [expanded, setExpanded] = useState({});
  const [subData, setSubData] = useState({});

  useEffect(() => {
    if (row.items && row.items.length) return;
    setLoading(true);
    axios.get(`${API}/${row.id}`)
      .then(({ data }) => setItems(data.items || []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [row.id]);

  const loadSub = (pid) => {
    if (subData[pid] !== undefined) return;
    setSubData((s) => ({ ...s, [pid]: { loading: true, items: [] } }));
    axios.get(`${API}/${pid}`)
      .then(({ data }) => setSubData((s) => ({
        ...s,
        [pid]: { loading: false, items: data.items || [], code: data.product_code || data.product_uid || '', name: data.part_name || '' },
      }),
      ))
      .catch(() => setSubData((s) => ({ ...s, [pid]: { loading: false, items: [], code: '', name: '' } })));
  };

  const bySerial = (a, b) => ((a.serial_no != null ? a.serial_no : Infinity) - (b.serial_no != null ? b.serial_no : Infinity));

  const renderList = (list, pid, depth, prefix) =>
    list.filter((it) => (it.parent_item_id || null) === pid).sort(bySerial)
      .map((it, idx) => renderNode(list, it, depth, prefix, idx + 1));

  const renderNode = (list, it, depth, prefix, fallback) => {
    const hasSub = !!it.component_product_id && !!it.is_subassembly;
    const ek = `${prefix}#${it.id}`;
    const open = !!expanded[ek];
    const sub = hasSub ? subData[it.component_product_id] : undefined;
    const toggle = () => {
      if (!hasSub) return;
      if (!open) loadSub(it.component_product_id);
      setExpanded((e) => ({ ...e, [ek]: !open }));
    };
    const code = it.item?.item_code || it.item_code || (hasSub && sub ? sub.code : '') || '-';
    return (
      <React.Fragment key={ek}>
        <tr>
          <td style={{ padding: '5px 10px', borderBottom: '1px solid #eee', paddingLeft: 10 + depth * 22, whiteSpace: 'nowrap' }}>
            {depth > 0 && <span style={{ color: '#1976d2' }}>↳ </span>}
            {fallback}
          </td>
          <td style={{ padding: '5px 10px', borderBottom: '1px solid #eee', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            <Box display="flex" alignItems="center" gap={0.25}>
              {hasSub && (
                <IconButton size="small" sx={{ p: 0.1 }} onClick={toggle}>
                  {open ? <ExpandMoreIcon fontSize="small" /> : <ChevronRightIcon fontSize="small" />}
                </IconButton>
              )}
              <span>{code}</span>
            </Box>
          </td>
          <td style={{ padding: '5px 10px', borderBottom: '1px solid #eee', wordBreak: 'break-word' }}>
            {it.is_subassembly && <Chip size="small" color="warning" label="SA" sx={{ mr: 1, height: 18 }} />}
            {it.item?.item_name || it.item_name || (hasSub && sub ? sub.name : '') || '-'}
          </td>
          <td style={{ padding: '5px 10px', borderBottom: '1px solid #eee', wordBreak: 'break-word' }}>
            {it.item_description || it.item?.item_description || '-'}
          </td>
          <td style={{ padding: '5px 10px', borderBottom: '1px solid #eee', textAlign: 'right', whiteSpace: 'nowrap' }}>{Number(it.quantity)}</td>
          <td style={{ padding: '5px 10px', borderBottom: '1px solid #eee', textAlign: 'right', whiteSpace: 'nowrap' }}>{Number(it.wastage_percent || 0)}</td>
          <td style={{ padding: '5px 10px', borderBottom: '1px solid #eee', wordBreak: 'break-word' }}>{it.remark || '-'}</td>
          <td style={{ padding: '5px 10px', borderBottom: '1px solid #eee', whiteSpace: 'nowrap' }}>{it.color || '-'}</td>
        </tr>
        {hasSub && open && (
          sub && sub.loading
            ? <tr><td colSpan={8} style={{ padding: '5px 10px', paddingLeft: 10 + (depth + 1) * 22, color: 'gray' }}>Loading sub-assembly…</td></tr>
            : sub && sub.items.length
              ? renderList(sub.items, null, depth + 1, `${it.component_product_id}#`)
              : <tr><td colSpan={8} style={{ padding: '5px 10px', paddingLeft: 10 + (depth + 1) * 22, color: 'gray' }}>No components.</td></tr>
        )}
        {renderList(list, it.id, depth + 1, prefix)}
      </React.Fragment>
    );
  };

  if (loading) return <Typography variant="body2" sx={{ p: 2, color: 'gray' }}>Loading components…</Typography>;
  if (!items.length) return <Typography variant="body2" sx={{ p: 2, color: 'gray' }}>No components.</Typography>;
  return (
    <Box sx={{ p: 2, maxHeight: 340, overflowY: 'auto' }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>Components ({items.length})</Typography>
      <Box component="table" sx={{ fontSize: 13, borderCollapse: 'collapse', width: 'auto', tableLayout: 'auto' }}>
        <colgroup>
          <col style={{ width: 40 }} />
          <col style={{ width: 130 }} />
          <col />
          <col style={{ width: 160 }} />
          <col style={{ width: 55 }} />
          <col style={{ width: 80 }} />
          <col style={{ width: 150 }} />
          <col style={{ width: 80 }} />
        </colgroup>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', padding: '6px 10px', borderBottom: '2px solid #cdd5df', color: '#445', fontWeight: 700, whiteSpace: 'nowrap' }}>S.No</th>
            <th style={{ textAlign: 'left', padding: '6px 10px', borderBottom: '2px solid #cdd5df', color: '#445', fontWeight: 700, whiteSpace: 'nowrap' }}>Code</th>
            <th style={{ textAlign: 'left', padding: '6px 10px', borderBottom: '2px solid #cdd5df', color: '#445', fontWeight: 700, whiteSpace: 'nowrap' }}>Part Name</th>
            <th style={{ textAlign: 'left', padding: '6px 10px', borderBottom: '2px solid #cdd5df', color: '#445', fontWeight: 700, whiteSpace: 'nowrap' }}>Description</th>
            <th style={{ textAlign: 'right', padding: '6px 10px', borderBottom: '2px solid #cdd5df', color: '#445', fontWeight: 700, whiteSpace: 'nowrap' }}>Qty</th>
            <th style={{ textAlign: 'right', padding: '6px 10px', borderBottom: '2px solid #cdd5df', color: '#445', fontWeight: 700, whiteSpace: 'nowrap' }}>Wastage %</th>
            <th style={{ textAlign: 'left', padding: '6px 10px', borderBottom: '2px solid #cdd5df', color: '#445', fontWeight: 700, whiteSpace: 'nowrap' }}>Remark</th>
            <th style={{ textAlign: 'left', padding: '6px 10px', borderBottom: '2px solid #cdd5df', color: '#445', fontWeight: 700, whiteSpace: 'nowrap' }}>Color</th>
          </tr>
        </thead>
        <tbody>
          {renderList(items, null, 0, '')}
        </tbody>
      </Box>
    </Box>
  );
}

export default function ProductMasterList() {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchData = () => {
    setLoading(true);
    axios.get(API)
      .then(({ data }) => {
        const list = Array.isArray(data) ? data : (data?.rows || []);
        setRows(list.map((r) => ({
          ...r,
          category_path: r.category ? `${r.category.parent ? r.category.parent.name + ' / ' : ''}${r.category.name}` : '-',
          components: r.componentsCount != null ? Number(r.componentsCount) : 0,
        })));
      })
      .catch(() => showToast('Failed to load', 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const toggle = (row) => setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, _expanded: !r._expanded } : r)));

  const columns = [
    { field: 'product_uid', header: 'UID' },
    {
      field: 'product_code', header: 'Code',
      render: (r) => (
        <Box display="flex" alignItems="center" gap={0.5}>
          <IconButton size="small" sx={{ p: 0.25 }} onClick={(e) => { e.stopPropagation(); toggle(r); }}>
            {r._expanded ? <ExpandMoreIcon fontSize="small" /> : <ChevronRightIcon fontSize="small" />}
          </IconButton>
          <span>{r.product_code || '-'}</span>
        </Box>
      ),
    },
    { field: 'part_name', header: 'Part Name' },
    { field: 'description', header: 'Description', expandable: true },
    { field: 'product_type', header: 'Type' },
    {
      field: 'node_type', header: 'Node',
      render: (r) => <Chip size="small" color={NODE_COLORS[r.node_type] || 'default'} label={NODE_LABELS[r.node_type] || r.node_type || 'SKU'} />,
    },
    { field: 'category_path', header: 'Category' },
    {
      field: 'color', header: 'Color',
      render: (r) => r.color
        ? <Chip size="small" label={r.color} variant="outlined" icon={<span style={{ width: 12, height: 12, borderRadius: '50%', background: colorSwatch(r.color), border: '1px solid #ccc', display: 'inline-block' }} />} />
        : <span style={{ color: 'gray' }}>-</span>,
    },
    { field: 'drawing_no', header: 'Drawing' },
    { field: 'revision', header: 'Rev' },
    {
      field: 'components', header: 'Components',
      render: (r) => <Chip size="small" variant="outlined" label={r.components} />,
    },
    {
      field: 'is_active', header: 'Active',
      render: (r) => <Chip size="small" label={r.is_active ? 'Yes' : 'No'} color={r.is_active ? 'success' : 'default'} />,
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <SmartTable
        title="Product Master"
        columns={columns}
        data={rows}
        loading={loading}
        headerAction={
          <Box display="flex" gap={1}>
            <Button variant="outlined" startIcon={<AddIcon />} onClick={() => navigate('/engineering/products/add?node=SUB_ASSEMBLY')}>
              New Sub-Assembly
            </Button>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/engineering/products/add')}>
              New Product
            </Button>
          </Box>
        }
        onPreview={(row) => navigate(`/engineering/products/view/${row.id}`)}
        onEdit={(row) => navigate(`/engineering/products/edit/${row.id}`)}
        disableExpand
        renderExpanded={(row) => <BomPanel row={row} />}
      />
    </Box>
  );
}
