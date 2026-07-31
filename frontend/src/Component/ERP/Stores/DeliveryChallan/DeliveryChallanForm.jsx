import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Box, Typography, Card, CardContent, TextField, Button, Grid, IconButton, MenuItem,
  Table, TableHead, TableRow, TableCell, TableBody, Switch, FormControlLabel, LinearProgress,
  Autocomplete, TableContainer, Chip,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import SendIcon from '@mui/icons-material/Send';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SearchIcon from '@mui/icons-material/Search';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import InventoryIcon from '@mui/icons-material/Inventory';
import axios from 'axios';
import { useToast } from '../../../../context/ToastContext';
import ItemSelectDialog from '../ItemMaster/ItemSelectDialog';
import CountedTextArea from '../../../Common/CountedTextArea';

const API = '/api/erp/stores/delivery-challans';
const ITEMS_API = '/api/erp/stores/items';

const dcTypeLabels = { L: "Replacement", R: "Repair", M: "Maintenance", J: "Jobwork", S: "Sale on Approval" };

const cellInputSx = {
  '& .MuiInputBase-root': { fontSize: '0.75rem' },
  '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
  '&:hover .MuiOutlinedInput-notchedOutline': { border: 'none' },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { border: 'none' },
};

const blankRow = () => ({ tempId: Date.now() + Math.random(), item_id: '', item_code: '', item_name: '', item_grp: '', wo_no: '', hs_code: '', unit_id: '', unit: '', quantity: 0, rate: 0, remarks: '', req_date: '' });

const toIsoUtc = (localStr) => {
  if (!localStr) return null;
  const d = new Date(localStr);
  return isNaN(d) ? null : d.toISOString();
};

const fmtNum = (v) => {
  const n = Number(v);
  if (isNaN(n)) return "0";
  return n % 1 === 0 ? String(n) : n.toFixed(2).replace(/\.?0+$/, "");
};

const toLocalInput = (v) => {
  const d = new Date(v);
  if (isNaN(d)) return '';
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};

const validateItems = (items, showToast) => {
  const requiredFields = { item_grp: 'Item Group', wo_no: 'W.O#', hs_code: 'HSN Code', item_code: 'Item Code', quantity: 'Quantity', rate: 'Rate' };
  for (let i = 0; i < items.length; i++) {
    const r = items[i];
    for (const [key, label] of Object.entries(requiredFields)) {
      const raw = r[key];
      if (raw === null || raw === undefined || String(raw).trim() === '') {
        showToast(`Row ${i + 1}: ${label} cannot be empty`, 'warning');
        return false;
      }
    }
  }
  return true;
};

export default function DeliveryChallanForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  const isView = location.pathname.includes('/view/');
  const isEdit = location.pathname.includes('/edit/');

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [masterItems, setMasterItems] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [picker, setPicker] = useState(null);
  const [form, setForm] = useState({
    dc_date: toLocalInput(new Date()),
    party_name: '', returnable: true, dc_type: 'S', expected_return_date: '', reference_no: '',
    vehicle_no: '', driver_name: '', department: '', requested_by: '', prepared_by: localStorage.getItem('empId') || '', req_date: '', remarks: '',
  });
  const [rows, setRows] = useState([blankRow()]);

  useEffect(() => {
    Promise.all([
      axios.get(ITEMS_API, { params: { is_active: true } }).then(({ data }) => setMasterItems(data)).catch(() => []),
      axios.get('/api/erp/stores/groups').then(({ data }) => setDepartments(data)).catch(() => []),
      axios.get('/api/purchase/suppliers').then(({ data }) => setSuppliers(data)).catch(() => []),
    ]).finally(() => {
      if (!id) setInitialLoading(false);
    });

    if (id) {
      setLoading(true);
      axios.get(`${API}/${id}`).then(({ data }) => {
        setForm({
          dc_date: data.dc_date ? toLocalInput(data.dc_date) : '',
          party_name: data.party_name || '', returnable: Boolean(data.returnable),
          dc_type: data.dc_type || 'S',
          expected_return_date: data.expected_return_date?.split('T')[0] || '',
          reference_no: data.reference_no || '', vehicle_no: data.vehicle_no || '',
          driver_name: data.driver_name || '', department: data.department || '',
          requested_by: data.requested_by || '',
          prepared_by: data.prepared_by || localStorage.getItem('empId') || '',
          req_date: data.req_date?.split('T')[0] || '', remarks: data.remarks || '',
        });
        setRows(data.items?.length ? data.items.map((i) => ({
          tempId: Date.now() + Math.random(), item_id: i.item_id || '', item_code: i.item_code || '',
          item_name: i.item_name || '', item_grp: i.item_grp || '', wo_no: i.wo_no || '',
          hs_code: i.hs_code || '', unit_id: i.unit_id || '', unit: i.unit || i.item?.unit?.short_name || i.item?.unit?.name || '',
          quantity: i.quantity || 0, rate: i.rate || 0, remarks: i.remarks || '', req_date: i.req_date || '',
        })) : [blankRow()]);
      }).catch(() => showToast('Failed to load', 'error'))
        .finally(() => { setLoading(false); setInitialLoading(false); });
    }
  }, [id]);

  useEffect(() => {
    const handler = (e) => { if ((e.ctrlKey || e.metaKey) && e.key === "Enter") { e.preventDefault(); if (!readOnly) handleSubmit(false); } };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [form, rows]);

  const handleChange = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  const updateRow = (tempId, patch) => setRows((prev) => prev.map((r) => r.tempId === tempId ? { ...r, ...patch } : r));
  const deleteRow = (tempId) => setRows((prev) => prev.filter((r) => r.tempId !== tempId));

  const pickItem = (sel) => {
    if (!sel) return;
    setRows((prev) => prev.map((r) => r.tempId === picker.rowId ? {
      ...r, item_id: sel.id, item_code: sel.item_code, item_name: sel.item_name,
      unit_id: sel.unit?.id || null, unit: sel.unit?.short_name || sel.unit?.name || '',
      hs_code: sel.hsn_code || '', item_grp: sel.category?.name || sel.group?.name || '',
    } : r));
    setPicker(null);
  };

  const totalQty = rows.reduce((s, r) => s + (Number(r.quantity) || 0), 0);
  const totalValue = rows.reduce((s, r) => s + (Number(r.rate) || 0) * (Number(r.quantity) || 0), 0);

  const handleSubmit = useCallback(async (issue) => {
    if (!form.party_name && !rows.some((r) => r.item_id)) {
      showToast('Add at least one item', 'warning'); return;
    }
    if (!validateItems(rows.filter((r) => r.item_id), showToast)) return;
    setSaving(true);
    try {
      const payload = { ...form, dc_date: toIsoUtc(form.dc_date), dc_type: form.dc_type, requested_by: form.requested_by, req_date: form.req_date, items: rows.filter((r) => r.item_id).map(({ tempId, ...r }) => r) };
      let saved;
      if (id && isEdit) saved = await axios.put(`${API}/${id}`, payload);
      else saved = await axios.post(API, payload);
      if (issue) await axios.post(`${API}/${saved.data.id}/issue`);
      showToast(issue ? 'Challan issued' : 'Challan saved', 'success');
      navigate('/stores/delivery-challans');
    } catch (e) {
      showToast(e.response?.data?.error || 'Failed to save', 'error');
    } finally { setSaving(false); }
  }, [form, rows, id, isEdit]);

  if (initialLoading) return <LinearProgress />;
  const readOnly = isView;

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" alignItems="center" gap={1.5} mb={2}>
        <IconButton onClick={() => navigate('/stores/delivery-challans')}><ArrowBackIcon /></IconButton>
        <InventoryIcon sx={{ color: "#1565c0", fontSize: 28 }} />
        <Typography variant="h5" sx={{ fontWeight: 700, color: '#1e293b' }}>
          {isView ? 'View' : isEdit ? 'Edit' : 'New'} Delivery Challan
        </Typography>
        <Chip label={dcTypeLabels[form.dc_type] || form.dc_type} size="small" color="primary" sx={{ fontWeight: 700, height: 22 }} />
        {!readOnly && (
          <Box sx={{ ml: "auto", display: "flex", gap: 1, alignItems: "center" }}>
            <Typography variant="caption" sx={{ color: "#94a3b8" }}>Ctrl+Enter</Typography>
            <Button variant="contained" startIcon={<SaveIcon />} onClick={() => handleSubmit(false)} disabled={saving} size="small">{saving ? 'Saving...' : 'Save as Draft'}</Button>
            <Button variant="outlined" color="primary" startIcon={<SendIcon />} onClick={() => handleSubmit(true)} disabled={saving} size="small">Save & Issue</Button>
            <Button variant="text" size="small" onClick={() => navigate('/stores/delivery-challans')}>Cancel</Button>
          </Box>
        )}
      </Box>

      {loading && <LinearProgress sx={{ mb: 2 }} />}

      <Card sx={{ borderRadius: 3, mb: 2, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
        <CardContent sx={{ py: 1.5, "&:last-child": { pb: 1.5 } }}>
          <Grid container spacing={2}>
            <Grid item xs={6} md={2}>
              <TextField label="Date *" type="datetime-local" size="small" fullWidth value={form.dc_date} onChange={handleChange('dc_date')} disabled={readOnly} InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={6} md={2}>
              <TextField label="DC Type" select size="small" fullWidth value={form.dc_type}
                onChange={(e) => setForm((f) => ({ ...f, dc_type: e.target.value }))}
                disabled={readOnly}>
                <MenuItem value="S">Sale on Approval</MenuItem>
                <MenuItem value="R">Repair</MenuItem>
                <MenuItem value="M">Maintenance</MenuItem>
                <MenuItem value="J">Jobwork</MenuItem>
                <MenuItem value="L">Replacement</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={6} md={1}>
              <Autocomplete size="small" options={departments} getOptionLabel={(o) => o.name || o}
                value={departments.find((d) => (d.name || d) === form.department) || null}
                onChange={(_, v) => setForm((f) => ({ ...f, department: v?.name || v || "" }))}
                renderInput={(p) => <TextField {...p} label="Department" />} disabled={readOnly} />
            </Grid>
            <Grid item xs={6} md={3}>
              <Autocomplete size="small" options={suppliers} getOptionLabel={(o) => o.supplier_name || o.name || o}
                value={suppliers.find((s) => (s.supplier_name || s.name) === form.party_name) || null}
                onChange={(_, v) => setForm((f) => ({ ...f, party_name: v?.supplier_name || v?.name || v || "", party_id: v?.id || "" }))}
                renderInput={(p) => <TextField {...p} label="Party / Customer *" />} disabled={readOnly} />
            </Grid>
            <Grid item xs={6} md={3}>
              <TextField label="Requested By" size="small" fullWidth value={form.requested_by} onChange={handleChange('requested_by')} disabled={readOnly} />
            </Grid>
            <Grid item xs={6} md={2}>
              <TextField label="Req. Date" type="date" size="small" fullWidth value={form.req_date} onChange={handleChange('req_date')} disabled={readOnly} InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={6} md={2}>
              <TextField label="Prepared By" size="small" fullWidth value={form.prepared_by} disabled />
            </Grid>
            <Grid item xs={6} md={2}>
              <FormControlLabel control={<Switch checked={form.returnable} onChange={(e) => setForm((f) => ({ ...f, returnable: e.target.checked }))} disabled={form.dc_type !== 'S' || readOnly} />} label="Returnable" />
            </Grid>
            <Grid item xs={6} md={2}>
              <TextField label="Expected Return" type="date" size="small" fullWidth value={form.expected_return_date} onChange={handleChange('expected_return_date')} disabled={!form.returnable || readOnly} InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={6} md={2}>
              <TextField label="Reference #" size="small" fullWidth value={form.reference_no} onChange={handleChange('reference_no')} disabled={readOnly} />
            </Grid>
            <Grid item xs={6} md={2}>
              <TextField label="Vehicle No" size="small" fullWidth value={form.vehicle_no} onChange={handleChange('vehicle_no')} disabled={readOnly} />
            </Grid>
            <Grid item xs={6} md={2}>
              <TextField label="Driver" size="small" fullWidth value={form.driver_name} onChange={handleChange('driver_name')} disabled={readOnly} />
            </Grid>
            <Grid item xs={12}>
              <CountedTextArea label="Remarks" size="small" fullWidth value={form.remarks} onChange={handleChange('remarks')} disabled={readOnly} rows={1} />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
        <CardContent sx={{ py: 1.5, "&:last-child": { pb: 1.5 } }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#475569", fontSize: "0.82rem", display: "flex", alignItems: "center", gap: 1 }}>
              <InventoryIcon sx={{ fontSize: 18, color: "#1565c0" }} />
              Item Details
            </Typography>
            <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
              <Box sx={{ textAlign: "right" }}>
                <Typography sx={{ fontSize: "0.7rem", color: "#64748b", fontWeight: 600 }}>Total Qty</Typography>
                <Typography sx={{ fontWeight: 700, fontSize: "0.9rem", color: "#1565c0" }}>{totalQty}</Typography>
              </Box>
              <Box sx={{ textAlign: "right" }}>
                <Typography sx={{ fontSize: "0.7rem", color: "#64748b", fontWeight: 600 }}>Total Value</Typography>
                <Typography sx={{ fontWeight: 700, fontSize: "0.9rem", color: "#2e7d32" }}>{fmtNum(totalValue)}</Typography>
              </Box>
            </Box>
          </Box>
          <TableContainer>
            <Table size="small" sx={{ '& th': { fontWeight: 700, bgcolor: '#f5f7fa', fontSize: '0.78rem', whiteSpace: 'nowrap', border: '1px solid #e2e8f0' }, '& td': { fontSize: '0.78rem', border: '1px solid #e2e8f0' }, minWidth: 1200 }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ width: 30, textAlign: 'center' }}>#</TableCell>
                  <TableCell sx={{ width: 70, textAlign: 'center' }}>Item Grp</TableCell>
                  <TableCell sx={{ width: 80, textAlign: 'center' }}>W.O#/MC#</TableCell>
                  <TableCell sx={{ width: 65, textAlign: 'center' }}>Hs Code</TableCell>
                  <TableCell sx={{ width: 85 }}>Item Code</TableCell>
                  <TableCell>Item Description</TableCell>
                  <TableCell sx={{ width: 50, textAlign: 'center' }}>Unit</TableCell>
                  <TableCell sx={{ width: 70, textAlign: 'center' }}>Qty</TableCell>
                  <TableCell sx={{ width: 70, textAlign: 'center' }}>Rate</TableCell>
                  <TableCell sx={{ width: 80, textAlign: 'center' }}>Value</TableCell>
                  <TableCell sx={{ width: 80, textAlign: 'center' }}>Remarks</TableCell>
                  {!readOnly && <TableCell sx={{ width: 30 }}></TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((r, idx) => (
                  <TableRow key={r.tempId} hover sx={{ bgcolor: idx % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                    <TableCell sx={{ textAlign: 'center', verticalAlign: 'middle', fontWeight: 600, color: '#64748b' }}>{idx + 1}</TableCell>
                    <TableCell>
                      <TextField size="small" value={r.item_grp} onChange={(e) => updateRow(r.tempId, { item_grp: e.target.value })} disabled={readOnly}
                        sx={cellInputSx} />
                    </TableCell>
                    <TableCell>
                      <TextField size="small" value={r.wo_no} onChange={(e) => updateRow(r.tempId, { wo_no: e.target.value })} disabled={readOnly}
                        sx={cellInputSx} />
                    </TableCell>
                    <TableCell>
                      <TextField size="small" value={r.hs_code} onChange={(e) => updateRow(r.tempId, { hs_code: e.target.value })} disabled={readOnly}
                        sx={cellInputSx} />
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>
                      <Box display="flex" alignItems="center" gap={0.5}>
                        <span>{r.item_code || <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Select</span>}</span>
                        {!readOnly && (
                          <IconButton size="small" sx={{ p: 0.2, color: '#1565c0' }} onClick={() => setPicker({ rowId: r.tempId })}><SearchIcon sx={{ fontSize: 15 }} /></IconButton>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>{r.item_name || '-'}</TableCell>
                    <TableCell>{r.unit}</TableCell>
                    <TableCell>
                      <TextField type="number" size="small" sx={{ width: 80, ...cellInputSx }} value={r.quantity}
                        onChange={(e) => updateRow(r.tempId, { quantity: Number(e.target.value) })}
                        inputProps={{ min: 0, style: { textAlign: 'right', fontSize: '0.75rem' } }} disabled={readOnly} />
                    </TableCell>
                    <TableCell>
                      <TextField type="number" size="small" sx={{ width: 80, ...cellInputSx }} value={r.rate}
                        onChange={(e) => updateRow(r.tempId, { rate: Number(e.target.value) })}
                        inputProps={{ min: 0, style: { textAlign: 'right', fontSize: '0.75rem' } }} disabled={readOnly} />
                    </TableCell>
                    <TableCell sx={{ textAlign: 'right', verticalAlign: 'middle', fontWeight: 600, color: '#2e7d32' }}>
                      {fmtNum((Number(r.quantity) || 0) * (Number(r.rate) || 0))}
                    </TableCell>
                    <TableCell>
                      <TextField size="small" fullWidth value={r.remarks} onChange={(e) => updateRow(r.tempId, { remarks: e.target.value })} disabled={readOnly}
                        sx={cellInputSx} />
                    </TableCell>
                    {!readOnly && (
                      <TableCell>
                        <IconButton size="small" color="error" onClick={() => deleteRow(r.tempId)}><DeleteIcon sx={{ fontSize: 16 }} /></IconButton>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          {!readOnly && (
            <Button size="small" variant="outlined" startIcon={<AddCircleOutlineIcon />} sx={{ mt: 1, fontSize: '0.75rem' }}
              onClick={() => setRows((p) => [...p, blankRow()])}>Add Item</Button>
          )}
        </CardContent>
      </Card>

      <ItemSelectDialog
        open={Boolean(picker)}
        title="Select Item"
        data={[...masterItems].sort((a, b) => a.id - b.id).map((m) => ({ ...m, group_name: m.category?.name || m.group?.name || '-' }))}
        columns={[{ key: 'item_code', label: 'Code' }, { key: 'item_name', label: 'Name' }, { key: 'current_stock', label: 'Stock' }, { key: 'group_name', label: 'Group' }]}
        onClose={() => setPicker(null)}
        onSelect={(it) => pickItem(it)}
      />
    </Box>
  );
}
