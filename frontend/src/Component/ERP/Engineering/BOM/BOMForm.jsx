import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Box, Typography, Card, CardContent, TextField, Button, Grid, IconButton,
  Table, TableHead, TableRow, TableCell, TableBody, MenuItem, LinearProgress,
  Dialog, DialogTitle, DialogContent, DialogActions, Chip, Tooltip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import IndeterminateCheckBoxIcon from '@mui/icons-material/IndeterminateCheckBox';
import AddBoxIcon from '@mui/icons-material/AddBox';
import SubdirectoryArrowRightIcon from '@mui/icons-material/SubdirectoryArrowRight';
import SubdirectoryArrowLeftIcon from '@mui/icons-material/SubdirectoryArrowLeft';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import axios from 'axios';
import { useToast } from '../../../../context/ToastContext';
import CountedTextArea from '../../../Common/CountedTextArea';
import BOMSelectDialog from './BOMSelectDialog';
import ItemSelectDialog from '../../Stores/ItemMaster/ItemSelectDialog';

const API = '/api/erp/engineering/bom';
const ITEMS_API = '/api/erp/stores/items';
const PRODUCTS_API = '/api/erp/engineering/products';
const STATUS_OPTS = ['Draft', 'Active', 'Inactive'];

let idCounter = Date.now();
const newId = () => ++idCounter;

export default function BOMForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  const isView = location.pathname.includes('/view/');
  const isEdit = location.pathname.includes('/edit/');
  const readOnly = isView;

  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [itemMasterList, setItemMasterList] = useState([]);
  const [productList, setProductList] = useState([]);
  const [bomList, setBomList] = useState([]);
  const [bomSelectOpen, setBomSelectOpen] = useState(false);
  const [itemSelectOpen, setItemSelectOpen] = useState(false);
  const [itemSelectTarget, setItemSelectTarget] = useState(null);

  const assemblyProducts = useMemo(
    () => productList.filter((p) => p.product_type === 'Assembly' || p.product_type === 'SFG'),
    [productList]
  );
  const itemPickData = useMemo(() => ([
    ...itemMasterList.map((i) => ({ ...i, _source: 'item', _type: i.group || 'Item' })),
    ...assemblyProducts.map((p) => ({ ...p, _source: 'product', item_code: p.product_code, item_name: p.part_name, _type: 'Sub Assembly' })),
  ]), [itemMasterList, assemblyProducts]);
  const [form, setForm] = useState({
    bom_no: '', bom_name: '', product_id: '', product_item_id: '', product_code: '', product_name: '', productSelect: '',
    output_quantity: 1, unit_id: '', status: 'Draft', version: '1.0', remarks: '',
    labour_cost: 0, overhead_cost: 0, overhead_is_percent: false, margin_percent: 0, selling_price: 0,
  });

  useEffect(() => {
    axios.get(ITEMS_API).then(({ data }) => setItemMasterList(data)).catch(() => {});
    axios.get(PRODUCTS_API).then(({ data }) => setProductList(data)).catch(() => {});
    axios.get(API).then(({ data }) => setBomList(data)).catch(() => {});
    if (id && !location.pathname.includes('/add')) {
      setLoading(true);
      axios.get(`${API}/${id}`).then(({ data }) => {
        setForm({
          bom_no: data.bom_no || '', bom_name: data.bom_name || '',
          product_id: data.product_id || '', product_item_id: data.product_item_id || '',
          product_code: data.product_code || '', productSelect: data.product_id ? String(data.product_id) : (data.product_item_id ? `sa:${data.product_item_id}` : ''),
          product_name: data.product_name || '', output_quantity: data.output_quantity || 1,
          unit_id: data.unit_id || '', status: data.status || 'Draft',
          version: data.version || '1.0', remarks: data.remarks || '',
          labour_cost: data.labour_cost || 0, overhead_cost: data.overhead_cost || 0,
          overhead_is_percent: !!data.overhead_is_percent, margin_percent: data.margin_percent || 0,
          selling_price: data.selling_price || 0,
        });
        const loaded = [];
        function flatten(items, parentTempId) {
          (items || []).forEach((it) => {
            const tId = newId();
            loaded.push({
              tempId: tId, parentTempId,
              item_id: it.item_id || '', item_code: it.item_code || '',
              item_name: it.item_name || '', quantity: it.quantity || 0,
              lot_quantity: it.lot_quantity || 1, unit_id: it.unit_id || '',
              wastage_percent: it.wastage_percent || 0, is_phantom: !!it.is_phantom,
              sub_bom_id: it.sub_bom_id || '', section_name: it.section_name || '',
              color: it.color || '', sort_order: it.sort_order || 0,
              unit_cost: it.unit_cost != null ? it.unit_cost : '', operation: it.operation || '',
              remarks: it.remarks || '', subBom: it.subBom || null,
            });
            if (it.children && it.children.length > 0) {
              flatten(it.children, tId);
            }
          });
        }
        flatten(data.items || [], null);
        setRows(loaded);
      }).catch(() => showToast('Failed to load', 'error'))
        .finally(() => setLoading(false));
    }
  }, [id]);

  const handleChange = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  const handleProductChange = (value) => {
    const id = Number(value);
    const sel = productList.find((p) => p.id === id);
    if (sel) setForm((f) => ({
      ...f, productSelect: value,
      product_id: sel.id,
      product_code: sel.product_code || '',
      product_name: sel.part_name || '',
      product_item_id: sel.item_id || f.product_item_id,
    }));
  };

  const addRow = (type) => {
    setRows((prev) => [...prev, {
      tempId: newId(), parentTempId: null,
      item_id: '', item_code: '', item_name: type === 'group' ? 'New Group' : '',
      quantity: type === 'group' ? 0 : 1, lot_quantity: 1, unit_id: '',
      wastage_percent: 0, is_phantom: type === 'group',
      sub_bom_id: '', section_name: type === 'group' ? 'New Group' : '',
      color: '', sort_order: prev.length, remarks: '',
      subBom: null,
    }]);
  };

  const removeRow = (tempId) => {
    const toRemove = new Set([tempId]);
    rows.forEach((r) => { if (r.parentTempId === tempId || toRemove.has(r.parentTempId)) toRemove.add(r.tempId); });
    setRows((prev) => prev.filter((r) => !toRemove.has(r.tempId)));
  };

  const indentRight = (tempId) => {
    setRows((prev) => {
      const idx = prev.findIndex((r) => r.tempId === tempId);
      if (idx <= 0) return prev;
      const parent = prev[idx - 1];
      return prev.map((r) => r.tempId === tempId ? { ...r, parentTempId: parent.tempId } : r);
    });
  };

  const indentLeft = (tempId) => {
    setRows((prev) => {
      const row = prev.find((r) => r.tempId === tempId);
      if (!row || !row.parentTempId) return prev;
      const parent = prev.find((r) => r.tempId === row.parentTempId);
      return prev.map((r) => r.tempId === tempId ? { ...r, parentTempId: parent?.parentTempId || null } : r);
    });
  };

  const addSubBom = (bom) => {
    setRows((prev) => [...prev, {
      tempId: newId(), parentTempId: null,
      item_id: bom.product_item_id || '', item_code: bom.product_code || '',
      item_name: `${bom.bom_no} - ${bom.product_name}`,
      quantity: 1, lot_quantity: 1, unit_id: '',
      wastage_percent: 0, is_phantom: false,
      sub_bom_id: bom.id, section_name: '',
      color: '', sort_order: prev.length, remarks: '',
      subBom: { id: bom.id, bom_no: bom.bom_no, bom_name: bom.bom_name },
    }]);
    setBomSelectOpen(false);
  };

  const handleRowChange = (tempId, field, value) => {
    setRows((prev) => prev.map((r) => {
      if (r.tempId !== tempId) return r;
      const upd = { ...r, [field]: value };
      if (field === 'item_id') {
        const sel = itemMasterList.find((im) => im.id === value);
        if (sel) { upd.item_code = sel.item_code; upd.item_name = sel.item_name; upd.unit_id = sel.unit_id; }
      }
      return upd;
    }));
  };

  const openItemSelect = (targetTempId) => { setItemSelectTarget(targetTempId || 'new'); setItemSelectOpen(true); };

  const handleItemPicked = (sel) => {
    setItemSelectOpen(false);
    const target = itemSelectTarget;
    let newRow;
    if (sel._source === 'product') {
      const subBom = bomList.find((b) => b.product_id === sel.id);
      newRow = {
        tempId: target === 'new' ? newId() : target,
        parentTempId: null,
        item_id: null, component_product_id: sel.id,
        item_code: sel.product_code || '', item_name: sel.part_name || '',
        quantity: 1, lot_quantity: 1, unit_id: sel.unit_id || '',
        wastage_percent: 0, is_phantom: false,
        sub_bom_id: subBom ? subBom.id : '', section_name: '', color: '', sort_order: 0, remarks: '',
        subBom: subBom ? { id: subBom.id, bom_no: subBom.bom_no, bom_name: subBom.bom_name } : null,
      };
      if (!subBom) showToast(`Sub-assembly "${sel.part_name}" has no BOM yet — create its assembly first`, 'warning');
    } else {
      newRow = {
        tempId: target === 'new' ? newId() : target,
        parentTempId: null,
        item_id: sel.id, component_product_id: null,
        item_code: sel.item_code || '', item_name: sel.item_name || '',
        quantity: 1, lot_quantity: 1, unit_id: sel.unit_id || '',
        wastage_percent: 0, is_phantom: false,
        sub_bom_id: '', section_name: '', color: '', sort_order: 0, remarks: '',
        subBom: null,
      };
    }
    if (target === 'new') {
      setRows((prev) => [...prev, { ...newRow, sort_order: prev.length }]);
    } else {
      setRows((prev) => prev.map((r) => (r.tempId === target ? { ...newRow, sort_order: r.sort_order } : r)));
    }
    setItemSelectTarget(null);
  };

  const getIndent = (tempId) => {
    let depth = 0, current = rows.find((r) => r.tempId === tempId);
    while (current && current.parentTempId) {
      depth++;
      current = rows.find((r) => r.tempId === current.parentTempId);
    }
    return depth;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (!form.productSelect) { showToast('Select a Product / Sub-Assembly', 'error'); setLoading(false); return; }
    const unlinked = rows.find((r) => !r.is_phantom && !r.sub_bom_id && !r.item_id);
    if (unlinked) { showToast('Every component must be linked to an Item Master item', 'error'); setLoading(false); return; }
    const badSub = rows.find((r) => r.component_product_id && !r.sub_bom_id);
    if (badSub) { showToast(`Sub-assembly "${badSub.item_name}" must have its BOM linked`, 'error'); setLoading(false); return; }
    const items = rows.map((r, idx) => ({
      parent_item_id: r.parentTempId ? (() => { const p = rows.find((x) => x.tempId === r.parentTempId); return rows.indexOf(p); })() : null,
      sub_bom_id: r.sub_bom_id || null,
      sort_order: idx,
      section_name: r.section_name || null,
      is_phantom: !!r.is_phantom,
      item_id: r.is_phantom ? null : (r.item_id || null),
      item_code: r.item_code || '',
      item_name: r.item_name || '',
      quantity: r.quantity || 0,
      lot_quantity: r.lot_quantity || 1,
      unit_id: r.unit_id || null,
      wastage_percent: r.wastage_percent || 0,
      color: r.color || null,
      unit_cost: r.is_phantom ? null : (r.unit_cost === '' || r.unit_cost == null ? null : Number(r.unit_cost)),
      operation: r.is_phantom ? null : (r.operation || null),
      remarks: r.remarks || '',
    }));
    const payload = { ...form, items };
    delete payload.productSelect;
    try {
      if (isEdit) await axios.put(`${API}/${id}`, payload);
      else await axios.post(API, payload);
      showToast(`BOM ${isEdit ? 'updated' : 'created'}`, 'success');
      navigate('/engineering/bom');
    } catch { showToast('Failed to save', 'error'); }
    finally { setLoading(false); }
  };

  if (loading && !location.pathname.includes('/add')) return <LinearProgress />;

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <IconButton onClick={() => navigate('/engineering/bom')}><ArrowBackIcon /></IconButton>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'var(--heading-color)' }}>
          {isView ? 'View' : isEdit ? 'Edit' : 'New'} Product Assembly Master
        </Typography>
      </Box>

      <form onSubmit={handleSubmit}>
        <Card sx={{ borderRadius: 3, mb: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Product Details</Typography>
            <Grid container spacing={2}>
              <Grid item xs={6} md={2}>
                <TextField label="BOM #" size="small" fullWidth value={form.bom_no} onChange={handleChange('bom_no')} disabled={readOnly || isEdit} helperText="Auto if blank" />
              </Grid>
              <Grid item xs={6} md={3}>
                <TextField label="BOM Name" size="small" fullWidth value={form.bom_name} onChange={handleChange('bom_name')} disabled={readOnly} required />
              </Grid>
              <Grid item xs={6} md={3}>
                <TextField label="Product / Assembly" select size="small" fullWidth value={form.productSelect} onChange={(e) => handleProductChange(e.target.value)} disabled={readOnly} required helperText="Finished Product or Sub Assembly (Product Master)">
                  <MenuItem value=""><em>Select Product / Assembly</em></MenuItem>
                  {productList.map((p) => <MenuItem key={p.id} value={p.id}>{p.product_uid || ''} - {p.part_name} ({p.product_type || 'Product'})</MenuItem>)}
                </TextField>
              </Grid>
              <Grid item xs={6} md={1}>
                <TextField label="Code" size="small" fullWidth value={form.product_code} disabled />
              </Grid>
              <Grid item xs={6} md={1}>
                <TextField label="Output Qty" type="number" size="small" fullWidth value={form.output_quantity} onChange={handleChange('output_quantity')} disabled={readOnly} />
              </Grid>
              <Grid item xs={6} md={1}>
                <TextField label="Version" size="small" fullWidth value={form.version} onChange={handleChange('version')} disabled={readOnly} />
              </Grid>
              <Grid item xs={6} md={1}>
                <TextField label="Status" select size="small" fullWidth value={form.status} onChange={handleChange('status')} disabled={readOnly}>
                  {STATUS_OPTS.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <CountedTextArea label="Remarks" size="small" fullWidth value={form.remarks} onChange={handleChange('remarks')} disabled={readOnly} rows={2} />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Card sx={{ borderRadius: 3, mb: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Costing (per output batch)</Typography>
            <Grid container spacing={2}>
              <Grid item xs={6} md={2}>
                <TextField label="Labour Cost" type="number" size="small" fullWidth value={form.labour_cost} onChange={handleChange('labour_cost')} disabled={readOnly} InputProps={{ startAdornment: '₹' }} />
              </Grid>
              <Grid item xs={6} md={2}>
                <TextField label="Overhead" type="number" size="small" fullWidth value={form.overhead_cost} onChange={handleChange('overhead_cost')} disabled={readOnly} InputProps={{ startAdornment: '₹' }} />
              </Grid>
              <Grid item xs={6} md={2} display="flex" alignItems="center">
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
                  <input type="checkbox" checked={!!form.overhead_is_percent} onChange={(e) => setForm((f) => ({ ...f, overhead_is_percent: e.target.checked }))} disabled={readOnly} /> % of Material
                </label>
              </Grid>
              <Grid item xs={6} md={2}>
                <TextField label="Margin %" type="number" size="small" fullWidth value={form.margin_percent} onChange={handleChange('margin_percent')} disabled={readOnly} InputProps={{ endAdornment: '%' }} />
              </Grid>
              <Grid item xs={6} md={2}>
                <TextField label="Selling Price" type="number" size="small" fullWidth value={form.selling_price} onChange={handleChange('selling_price')} disabled={readOnly} helperText="0 = auto from margin" InputProps={{ startAdornment: '₹' }} />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Card sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>Components</Typography>
              {!readOnly && (
                <Box display="flex" gap={1}>
                   <Button startIcon={<AddBoxIcon />} onClick={() => addRow('group')} size="small" variant="outlined" color="secondary">Add Group</Button>
                   <Button startIcon={<AddIcon />} onClick={() => openItemSelect(null)} size="small" variant="outlined">Add Item from Master</Button>
                  <Button startIcon={<AccountTreeIcon />} onClick={() => setBomSelectOpen(true)} size="small" variant="outlined" color="info">Add Sub-BOM</Button>
                </Box>
              )}
            </Box>
            <Table size="small" sx={{ '& th': { fontWeight: 700, bgcolor: '#f5f7fa', fontSize: '0.75rem' } }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ width: 40 }}>#</TableCell>
                  <TableCell sx={{ width: 50 }}>Level</TableCell>
                  <TableCell sx={{ minWidth: 180 }}>Component Name</TableCell>
                  <TableCell sx={{ width: 80 }}>Qty</TableCell>
                  <TableCell sx={{ width: 70 }}>Lot Qty</TableCell>
                   <TableCell sx={{ width: 60 }}>Scrap%</TableCell>
                   <TableCell sx={{ width: 90 }}>Unit Cost</TableCell>
                   <TableCell sx={{ width: 110 }}>Operation</TableCell>
                   <TableCell sx={{ width: 100 }}>Color</TableCell>
                   <TableCell sx={{ minWidth: 120 }}>Remarks</TableCell>
                   {!readOnly && <TableCell sx={{ width: 120 }}>Actions</TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.length === 0 && (
                  <TableRow><TableCell colSpan={9} align="center" sx={{ py: 4, color: 'gray' }}>
                    No components. Use Add Group, Add Item, or Add Sub-BOM to build the structure.
                  </TableCell></TableRow>
                )}
                {rows.map((r, idx) => {
                  const indent = getIndent(r.tempId);
                  return (
                    <TableRow key={r.tempId} sx={{
                      bgcolor: r.is_phantom ? '#f0f4ff' : r.sub_bom_id ? '#f5f0ff' : 'inherit',
                      '&:hover': { bgcolor: '#fafafa' },
                    }}>
                      <TableCell>{idx + 1}</TableCell>
                      <TableCell>
                        {!readOnly && (
                          <Box display="flex" gap={0.5}>
                            <Tooltip title="Indent right"><IconButton size="small" onClick={() => indentRight(r.tempId)} sx={{ fontSize: 14 }}><SubdirectoryArrowRightIcon fontSize="small" /></IconButton></Tooltip>
                            <Tooltip title="Indent left"><IconButton size="small" onClick={() => indentLeft(r.tempId)} sx={{ fontSize: 14 }}><SubdirectoryArrowLeftIcon fontSize="small" /></IconButton></Tooltip>
                          </Box>
                        )}
                      </TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          {indent > 0 && <span style={{ width: indent * 20, flexShrink: 0 }} />}
                          {r.is_phantom && <Chip label="GROUP" size="small" color="secondary" variant="outlined" sx={{ height: 20, fontSize: 10 }} />}
                          {r.sub_bom_id && <Chip label="BOM" size="small" color="info" variant="outlined" sx={{ height: 20, fontSize: 10 }} />}
                          {readOnly ? (
                            <Typography variant="body2" sx={{ fontWeight: r.is_phantom ? 700 : 400 }}>{r.item_name}</Typography>
                          ) : r.is_phantom ? (
                            <TextField size="small" fullWidth value={r.item_name}
                              onChange={(e) => handleRowChange(r.tempId, 'item_name', e.target.value)}
                              placeholder="Group name" />
                          ) : (
                            <Box display="flex" alignItems="center" gap={0.5}>
                              <Typography variant="body2" sx={{ flex: 1 }}>
                                {r.item_name || <span style={{ color: 'gray' }}>— pick item —</span>}
                              </Typography>
                              <IconButton size="small" onClick={() => openItemSelect(r.tempId)}><EditIcon fontSize="small" /></IconButton>
                            </Box>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        {r.is_phantom ? <Typography color="text.disabled">-</Typography> : (
                          <TextField type="number" size="small" sx={{ width: 70 }} value={r.quantity}
                            disabled={readOnly} onChange={(e) => handleRowChange(r.tempId, 'quantity', Number(e.target.value))} />
                        )}
                      </TableCell>
                      <TableCell>
                        {r.is_phantom ? <Typography color="text.disabled">-</Typography> : (
                          <TextField type="number" size="small" sx={{ width: 60 }} value={r.lot_quantity}
                            disabled={readOnly} onChange={(e) => handleRowChange(r.tempId, 'lot_quantity', Number(e.target.value))}
                            helperText={r.lot_quantity > 1 ? `${r.lot_quantity} units = 1 lot` : ''} />
                        )}
                      </TableCell>
                      <TableCell>
                        <TextField type="number" size="small" sx={{ width: 55 }} value={r.wastage_percent}
                          disabled={readOnly} onChange={(e) => handleRowChange(r.tempId, 'wastage_percent', Number(e.target.value))}
                          InputProps={{ endAdornment: '%' }} />
                      </TableCell>
                      <TableCell>
                        {r.is_phantom ? <Typography color="text.disabled">-</Typography> : (
                          <TextField type="number" size="small" sx={{ width: 80 }} value={r.unit_cost}
                            disabled={readOnly}
                            onChange={(e) => handleRowChange(r.tempId, 'unit_cost', e.target.value === '' ? '' : Number(e.target.value))}
                            placeholder={itemMasterList.find((im) => im.id === r.item_id)?.rate || ''}
                            helperText={r.unit_cost === '' ? 'uses item rate' : 'override'} />
                        )}
                      </TableCell>
                      <TableCell>
                        {r.is_phantom ? <Typography color="text.disabled">-</Typography> : (
                          <TextField size="small" sx={{ width: 100 }} value={r.operation}
                            disabled={readOnly} onChange={(e) => handleRowChange(r.tempId, 'operation', e.target.value)}
                            placeholder="e.g. Winding" />
                        )}
                      </TableCell>
                      <TableCell>
                        <TextField size="small" sx={{ width: 90 }} value={r.color}
                          disabled={readOnly} onChange={(e) => handleRowChange(r.tempId, 'color', e.target.value)}
                          placeholder="White/Black" />
                      </TableCell>
                      <TableCell>
                        <TextField size="small" sx={{ minWidth: 100 }} value={r.remarks}
                          disabled={readOnly} onChange={(e) => handleRowChange(r.tempId, 'remarks', e.target.value)}
                          placeholder={r.lot_quantity > 1 ? `Per ${r.lot_quantity} units` : ''} />
                      </TableCell>
                      {!readOnly && (
                        <TableCell>
                          <IconButton size="small" color="error" onClick={() => removeRow(r.tempId)}><DeleteIcon fontSize="small" /></IconButton>
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {!readOnly && (
          <Box mt={3} display="flex" gap={2}>
            <Button type="submit" variant="contained" startIcon={<SaveIcon />} disabled={loading}>
              {loading ? 'Saving...' : 'Save'}
            </Button>
            <Button variant="outlined" onClick={() => navigate('/engineering/bom')}>Cancel</Button>
          </Box>
        )}
      </form>

      <BOMSelectDialog open={bomSelectOpen} onClose={() => setBomSelectOpen(false)} onSelect={addSubBom} excludeId={id} />
      <ItemSelectDialog
        open={itemSelectOpen}
        onClose={() => { setItemSelectOpen(false); setItemSelectTarget(null); }}
        onSelect={handleItemPicked}
        title="Select Item or Sub-Assembly"
        data={itemPickData}
        columns={[{ key: 'item_code', label: 'Code' }, { key: 'item_name', label: 'Name' }, { key: '_type', label: 'Type' }]}
      />
    </Box>
  );
}
