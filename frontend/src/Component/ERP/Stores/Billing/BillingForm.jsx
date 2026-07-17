import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Box, Typography, Card, CardContent, TextField, Button, Grid, IconButton,
  Table, TableHead, TableRow, TableCell, TableBody, LinearProgress, MenuItem, Chip,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import ReceiptIcon from '@mui/icons-material/Receipt';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SearchIcon from '@mui/icons-material/Search';
import axios from 'axios';
import { useToast } from '../../../../context/ToastContext';
import ItemSelectDialog from '../ItemMaster/ItemSelectDialog';
import CountedTextArea from '../../../Common/CountedTextArea';

const API = '/api/erp/stores/invoices';
const ITEMS_API = '/api/erp/stores/items';
const GRR_API = '/api/erp/stores/grn';

const r2 = (v) => Number(Number(v || 0).toFixed(2));
const blankRow = () => ({ tempId: Date.now() + Math.random(), item_id: '', item_code: '', item_name: '', hsn_code: '', unit_id: '', unit: '', quantity: 1, rate: 0, discount_percent: 0, cgst_rate: 9, sgst_rate: 9, igst_rate: 0 });

export default function BillingForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  const isView = location.pathname.includes('/view/');
  const isEdit = location.pathname.includes('/edit/');

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [masterItems, setMasterItems] = useState([]);
  const [grrList, setGrrList] = useState([]);
  const [grrIds, setGrrIds] = useState([]);
  const [picker, setPicker] = useState(null);
  const [form, setForm] = useState({
    invoice_date: new Date().toISOString().split('T')[0],
    party_name: '', party_gstin: '', address: '', place_of_supply: '', dc_no: '', remarks: '',
  });
  const [rows, setRows] = useState([blankRow()]);

  useEffect(() => {
    axios.get(ITEMS_API, { params: { is_active: true } }).then(({ data }) => setMasterItems(data)).catch(() => {});
    axios.get(GRR_API).then(({ data }) => setGrrList(data)).catch(() => {});
    if (id) {
      setLoading(true);
      axios.get(`${API}/${id}`).then(({ data }) => {
        setForm({
          invoice_date: data.invoice_date?.split('T')[0] || '', party_name: data.party_name || '',
          party_gstin: data.party_gstin || '', address: data.address || '', place_of_supply: data.place_of_supply || '',
          dc_no: data.dc_no || '', remarks: data.remarks || '',
        });
        setRows(data.items?.length ? data.items.map((i) => ({
          tempId: Date.now() + Math.random(), item_id: i.item_id || '', item_code: i.item_code || '',
          item_name: i.item_name || '', hsn_code: i.hsn_code || '', unit_id: i.unit_id || '', unit: i.unit?.short_name || '',
          quantity: i.quantity || 0, rate: i.rate || 0, discount_percent: i.discount_percent || 0,
          cgst_rate: i.cgst_rate || 0, sgst_rate: i.sgst_rate || 0, igst_rate: i.igst_rate || 0,
        })) : [blankRow()]);
      }).catch(() => showToast('Failed to load', 'error')).finally(() => setLoading(false));
    }
  }, [id]);

  const handleChange = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleGrrChange = (e) => {
    const ids = e.target.value;
    setGrrIds(ids);
    const sel = grrList.filter((g) => ids.includes(g.id));
    const nos = sel.map((g) => g.grn_no).join(', ');
    const party = sel.find((g) => g.supplier && g.supplier.supplier_name)?.supplier?.supplier_name || '';
    setForm((f) => ({ ...f, dc_no: nos, party_name: f.party_name || party }));
  };
  const updateRow = (tempId, patch) => setRows((prev) => prev.map((r) => r.tempId === tempId ? { ...r, ...patch } : r));
  const removeRow = (tempId) => setRows((prev) => prev.filter((r) => r.tempId !== tempId));

  const pickItem = (selId) => {
    const sel = masterItems.find((m) => m.id === selId);
    if (!sel) return;
    setRows((prev) => prev.map((r) => r.tempId === picker.rowId ? {
      ...r, item_id: sel.id, item_code: sel.item_code, item_name: sel.item_name,
      hsn_code: sel.hsn_code || '', unit_id: sel.unit_id || '', unit: sel.unit?.short_name || sel.unit?.name || '',
      rate: sel.rate || 0,
    } : r));
    setPicker(null);
  };

  const computeRow = (r) => {
    const qty = Number(r.quantity) || 0, rate = Number(r.rate) || 0, disc = Number(r.discount_percent) || 0;
    const taxable = r2(qty * rate * (1 - disc / 100));
    const cgst = r2(taxable * (Number(r.cgst_rate) || 0) / 100);
    const sgst = r2(taxable * (Number(r.sgst_rate) || 0) / 100);
    const igst = r2(taxable * (Number(r.igst_rate) || 0) / 100);
    return { taxable, cgst, sgst, igst, amount: r2(taxable + cgst + sgst + igst) };
  };
  const totals = rows.filter((r) => r.item_id).reduce((acc, r) => {
    const c = computeRow(r);
    acc.subtotal += c.taxable; acc.cgst += c.cgst; acc.sgst += c.sgst; acc.igst += c.igst; acc.grand += c.amount;
    return acc;
  }, { subtotal: 0, cgst: 0, sgst: 0, igst: 0, grand: 0 });
  const fmt = (v) => Number(v || 0).toFixed(2);

  const handleSubmit = async (bill) => {
    if (!rows.some((r) => r.item_id)) { showToast('Add at least one item', 'warning'); return; }
    setSaving(true);
    try {
      const payload = { ...form, grr_ids: grrIds, items: rows.filter((r) => r.item_id).map(({ tempId, unit, ...r }) => r) };
      let saved;
      if (id && isEdit) saved = await axios.put(`${API}/${id}`, payload);
      else saved = await axios.post(API, payload);
      if (bill) await axios.post(`${API}/${saved.data.id}/bill`);
      showToast(bill ? 'Invoice billed' : 'Invoice saved', 'success');
      navigate('/stores/invoices');
    } catch (e) { showToast(e.response?.data?.error || 'Failed to save', 'error'); }
    finally { setSaving(false); }
  };

  if (loading && id) return <LinearProgress />;
  const readOnly = isView;

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <IconButton onClick={() => navigate('/stores/invoices')}><ArrowBackIcon /></IconButton>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'var(--heading-color)' }}>
          {isView ? 'View' : isEdit ? 'Edit' : 'New'} GRR Billing
        </Typography>
      </Box>

      <Card sx={{ borderRadius: 3, mb: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={6} md={2}><TextField label="Date" type="date" size="small" fullWidth value={form.invoice_date} onChange={handleChange('invoice_date')} disabled={readOnly} InputLabelProps={{ shrink: true }} /></Grid>
            <Grid item xs={6} md={3}><TextField label="Party / Customer" size="small" fullWidth value={form.party_name} onChange={handleChange('party_name')} disabled={readOnly} /></Grid>
            <Grid item xs={6} md={2}><TextField label="GSTIN" size="small" fullWidth value={form.party_gstin} onChange={handleChange('party_gstin')} disabled={readOnly} /></Grid>
            <Grid item xs={6} md={2}><TextField label="Place of Supply" size="small" fullWidth value={form.place_of_supply} onChange={handleChange('place_of_supply')} disabled={readOnly} /></Grid>
            <Grid item xs={12} md={4}>
              <TextField label="GRR Numbers" select size="small" fullWidth value={grrIds} onChange={handleGrrChange} disabled={readOnly}
                SelectProps={{ multiple: true, renderValue: (sel) => sel.map((id) => grrList.find((g) => g.id === id)?.grn_no).filter(Boolean).join(', ') || '' }}>
                {grrList.map((g) => (
                  <MenuItem key={g.id} value={g.id}>{g.grn_no}{g.supplier?.supplier_name ? ` (${g.supplier.supplier_name})` : ''}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}><CountedTextArea label="Address" size="small" fullWidth value={form.address} onChange={handleChange('address')} disabled={readOnly} rows={1} /></Grid>
            <Grid item xs={12} md={6}><CountedTextArea label="Remarks" size="small" fullWidth value={form.remarks} onChange={handleChange('remarks')} disabled={readOnly} rows={1} /></Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Invoice Items</Typography>
          <Table size="small" sx={{ '& th': { fontWeight: 700, bgcolor: '#f5f7fa', fontSize: '0.78rem' } }}>
            <TableHead>
              <TableRow>
                <TableCell>#</TableCell>
                <TableCell>Item</TableCell>
                <TableCell>HSN</TableCell>
                <TableCell>Qty</TableCell>
                <TableCell>Rate</TableCell>
                <TableCell>Disc%</TableCell>
                <TableCell>CGST%</TableCell>
                <TableCell>SGST%</TableCell>
                <TableCell>IGST%</TableCell>
                <TableCell>Amount</TableCell>
                {!readOnly && <TableCell></TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((r, idx) => {
                const c = computeRow(r);
                return (
                  <TableRow key={r.tempId}>
                    <TableCell>{idx + 1}</TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <span>{r.item_name || <span style={{ color: '#aaa' }}>Select item…</span>}</span>
                        {!readOnly && <IconButton size="small" onClick={() => setPicker({ rowId: r.tempId })}><SearchIcon fontSize="small" /></IconButton>}
                      </Box>
                      {r.item_code && <span style={{ fontSize: '0.7rem', color: '#888' }}>{r.item_code} • {r.unit}</span>}
                    </TableCell>
                    <TableCell><TextField size="small" sx={{ width: 70 }} value={r.hsn_code} onChange={(e) => updateRow(r.tempId, { hsn_code: e.target.value })} disabled={readOnly} /></TableCell>
                    <TableCell><TextField type="number" size="small" sx={{ width: 70 }} value={r.quantity} onChange={(e) => updateRow(r.tempId, { quantity: Number(e.target.value) })} disabled={readOnly} /></TableCell>
                    <TableCell><TextField type="number" size="small" sx={{ width: 90 }} value={r.rate} onChange={(e) => updateRow(r.tempId, { rate: Number(e.target.value) })} disabled={readOnly} /></TableCell>
                    <TableCell><TextField type="number" size="small" sx={{ width: 60 }} value={r.discount_percent} onChange={(e) => updateRow(r.tempId, { discount_percent: Number(e.target.value) })} disabled={readOnly} /></TableCell>
                    <TableCell><TextField type="number" size="small" sx={{ width: 60 }} value={r.cgst_rate} onChange={(e) => updateRow(r.tempId, { cgst_rate: Number(e.target.value) })} disabled={readOnly} /></TableCell>
                    <TableCell><TextField type="number" size="small" sx={{ width: 60 }} value={r.sgst_rate} onChange={(e) => updateRow(r.tempId, { sgst_rate: Number(e.target.value) })} disabled={readOnly} /></TableCell>
                    <TableCell><TextField type="number" size="small" sx={{ width: 60 }} value={r.igst_rate} onChange={(e) => updateRow(r.tempId, { igst_rate: Number(e.target.value) })} disabled={readOnly} /></TableCell>
                    <TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>{fmt(c.amount)}</TableCell>
                    {!readOnly && <TableCell><IconButton size="small" color="error" onClick={() => removeRow(r.tempId)}><DeleteIcon fontSize="small" /></IconButton></TableCell>}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          {!readOnly && <Button size="small" variant="outlined" sx={{ mt: 2 }} onClick={() => setRows((p) => [...p, blankRow()])}>Add Item</Button>}
        </CardContent>
      </Card>

      <Card sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.08)', mt: 3 }}>
        <CardContent>
          <Grid container justifyContent="flex-end">
            <Grid item xs={12} md={4}>
              <Box display="flex" justifyContent="space-between" py={0.5}><Typography>Taxable: ₹ {fmt(totals.subtotal)}</Typography></Box>
              <Box display="flex" justifyContent="space-between" py={0.5}><Typography>CGST: ₹ {fmt(totals.cgst)}</Typography></Box>
              <Box display="flex" justifyContent="space-between" py={0.5}><Typography>SGST: ₹ {fmt(totals.sgst)}</Typography></Box>
              <Box display="flex" justifyContent="space-between" py={0.5}><Typography>IGST: ₹ {fmt(totals.igst)}</Typography></Box>
              <Box display="flex" justifyContent="space-between" py={0.5}><Typography variant="h6" sx={{ fontWeight: 800 }}>Grand Total: ₹ {fmt(totals.grand)}</Typography></Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {!readOnly && (
        <Box mt={3} display="flex" gap={2}>
          <Button variant="contained" startIcon={<SaveIcon />} onClick={() => handleSubmit(false)} disabled={saving}>Save as Draft</Button>
          <Button variant="outlined" color="primary" startIcon={<ReceiptIcon />} onClick={() => handleSubmit(true)} disabled={saving}>Save & Bill</Button>
          <Button variant="text" onClick={() => navigate('/stores/invoices')}>Cancel</Button>
        </Box>
      )}

      <ItemSelectDialog
        open={Boolean(picker)}
        title="Select Item"
        data={[...masterItems].sort((a, b) => a.id - b.id).map((m) => ({ ...m, group_name: m.category?.name || '-' }))}
        columns={[{ key: 'id', label: 'ID' }, { key: 'item_code', label: 'Code' }, { key: 'item_name', label: 'Name' }, { key: 'group_name', label: 'Group' }]}
        onClose={() => setPicker(null)}
        onSelect={(it) => pickItem(it.id)}
      />
    </Box>
  );
}
