import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Card, CardContent, Chip, LinearProgress, Button, IconButton,
  Table, TableHead, TableRow, TableCell, TableBody, Paper,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import axios from 'axios';
import { useToast } from '../../../../context/ToastContext';

const API = '/api/erp/engineering/products';
const NODE_COLORS = {
  ROOT: 'success', ASSEMBLY: 'warning', SUB_ASSEMBLY: 'warning', PHANTOM: 'secondary', SKU: 'info',
};

function bomItemsFor(node) {
  if (node?.boms && node.boms.length && node.boms[0]?.items) return node.boms[0].items;
  if (node?.items && node.items.length) return node.items;
  return [];
}

// Lazily fetches a linked sub-assembly master (by component_product_id) and renders
// its own ProductItemMaster BOM. Recurses for any nested sub-assemblies.
function SubAssemblyView({ productId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    axios.get(`${API}/${productId}`)
      .then(({ data }) => setData(data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [productId]);

  if (loading) return <LinearProgress sx={{ my: 1 }} />;
  if (!data) return <Typography variant="body2" color="gray">Sub-assembly not found.</Typography>;

  const items = data.items || [];
  return (
    <Paper elevation={0} sx={{ p: 1, border: '1px solid #e3e8ef', borderRadius: 2, bgcolor: '#f7f9fc' }}>
      <Box display="flex" alignItems="center" gap={1} mb={1} flexWrap="wrap">
        <Chip size="small" color={NODE_COLORS[data.node_type] || 'warning'} label={data.node_type || 'SUB_ASSEMBLY'} />
        <Typography variant="body2" sx={{ fontWeight: 600 }}>{data.product_code || data.product_uid}</Typography>
        <Typography variant="body2">{data.part_name}</Typography>
        <Chip size="small" variant="outlined" label={`${items.length} items`} />
      </Box>
      {items.length ? (
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, fontSize: '0.72rem' }}>S.No</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: '0.72rem' }}>Item / Component</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: '0.72rem' }}>Qty</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: '0.72rem' }}>Wastage %</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: '0.72rem' }}>Remark</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: '0.72rem' }}>Color</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((b, i) => <BomItemRow key={i} item={b} />)}
          </TableBody>
        </Table>
      ) : (
        <Typography variant="body2" color="gray">No components.</Typography>
      )}
    </Paper>
  );
}

// A single BOM row. If the item links to a reusable sub-assembly master
// (component_product_id), it becomes expandable and reveals that sub-assembly's BOM.
function BomItemRow({ item }) {
  const isSub = item.component_product_id;
  const [open, setOpen] = useState(false);
  if (!isSub) {
    return (
      <TableRow>
        <TableCell>{item.serial_no != null ? item.serial_no : ''}</TableCell>
        <TableCell>{item.item_code ? `${item.item_code} - ${item.item_name}` : item.item_name}</TableCell>
        <TableCell>{item.quantity}</TableCell>
        <TableCell>{item.wastage_percent || 0}</TableCell>
        <TableCell>{item.remark || '-'}</TableCell>
        <TableCell>{item.color || '-'}</TableCell>
      </TableRow>
    );
  }
  return (
    <React.Fragment>
      <TableRow>
        <TableCell>{item.serial_no != null ? item.serial_no : ''}</TableCell>
        <TableCell>
          <Box display="flex" alignItems="center" gap={0.5}>
            <IconButton size="small" onClick={() => setOpen((o) => !o)}>
              {open ? <ExpandMoreIcon fontSize="small" /> : <ChevronRightIcon fontSize="small" />}
            </IconButton>
            <Chip size="small" color="warning" label="SA" />
            {item.item_code ? `${item.item_code} - ${item.item_name}` : item.item_name}
          </Box>
        </TableCell>
        <TableCell>{item.quantity}</TableCell>
        <TableCell>{item.wastage_percent || 0}</TableCell>
        <TableCell>{item.remark || '-'}</TableCell>
        <TableCell>{item.color || '-'}</TableCell>
      </TableRow>
      {open && (
        <TableRow>
          <TableCell colSpan={6} sx={{ p: 0, border: 'none' }}>
            <Box sx={{ ml: 4, my: 1 }}>
              <SubAssemblyView productId={item.component_product_id} />
            </Box>
          </TableCell>
        </TableRow>
      )}
    </React.Fragment>
  );
}

function NodeView({ node, depth }) {
  const [open, setOpen] = useState(depth < 2);
  const children = node.children || [];
  const bomItems = bomItemsFor(node);
  const hasChildren = children.length > 0;
  return (
    <Box sx={{ ml: depth * 2.2, borderLeft: depth ? '2px solid #e3e8ef' : 'none', pl: depth ? 1.5 : 0, mt: 1 }}>
      <Paper elevation={0} sx={{ p: 1, bgcolor: depth % 2 ? '#fafbfc' : '#fff', borderRadius: 2 }}>
        <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
          {hasChildren ? (
            <IconButton size="small" onClick={() => setOpen((o) => !o)}>
              {open ? <ExpandMoreIcon fontSize="small" /> : <ChevronRightIcon fontSize="small" />}
            </IconButton>
          ) : <Box sx={{ width: 32 }} />}
          <Chip size="small" color={NODE_COLORS[node.node_type] || 'default'} label={node.node_type || 'SKU'} />
          <Typography variant="body2" sx={{ fontWeight: 600 }}>{node.product_code || node.product_uid}</Typography>
          <Typography variant="body2">{node.part_name}</Typography>
          {node.drawing_no && <Chip size="small" variant="outlined" label={`DWG ${node.drawing_no}`} />}
          {node.revision && <Chip size="small" variant="outlined" label={`Rev ${node.revision}`} />}
          {Number(node.assembly_qty) ? <Typography variant="caption" sx={{ color: 'gray' }}>×{node.assembly_qty}</Typography> : null}
          {bomItems.length > 0 && <Chip size="small" variant="outlined" color="primary" label={`${bomItems.length} BOM items`} />}
        </Box>
        {open && bomItems.length > 0 && (
          <Table size="small" sx={{ mt: 1, ml: 4, width: 'calc(100% - 32px)' }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.72rem' }}>S.No</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.72rem' }}>Item / Component</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.72rem' }}>Qty</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.72rem' }}>Wastage %</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.72rem' }}>Remark</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.72rem' }}>Color</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {bomItems.map((b, i) => <BomItemRow key={i} item={b} />)}
            </TableBody>
          </Table>
        )}
      </Paper>
      {open && children.map((c) => <NodeView key={c.id} node={c} depth={depth + 1} />)}
    </Box>
  );
}

export default function AssemblyTree() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [tree, setTree] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    axios.get(`${API}/${id}/assembly-tree`)
      .then(({ data }) => setTree(data))
      .catch(() => showToast('Failed to load assembly tree', 'error'))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <IconButton onClick={() => navigate('/engineering/products')}><ArrowBackIcon /></IconButton>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'var(--heading-color)' }}>Product Assembly Tree</Typography>
      </Box>
      {loading ? <LinearProgress /> : !tree ? (
        <Typography color="gray">Product not found.</Typography>
      ) : (
        <Card sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
          <CardContent>
            <Box display="flex" gap={1} flexWrap="wrap" mb={2}>
              <Chip color="success" label="ROOT = Finished Product" />
              <Chip color="warning" label="ASSEMBLY / SUB_ASSEMBLY = Manufactured" />
              <Chip color="secondary" label="PHANTOM = Non-stocked" />
              <Chip color="info" label="SKU = Leaf" />
              <Chip color="warning" label="SA = Linked Sub-Assembly (expand to see its BOM)" />
            </Box>
            <NodeView node={tree} depth={0} />
            <Box mt={2}>
              <Button variant="outlined" onClick={() => navigate(`/engineering/products/edit/${id}`)}>Edit Product</Button>
            </Box>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
