import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Box, Typography, Card, CardContent, TextField, Button, Grid, IconButton,
  Table, TableHead, TableRow, TableCell, TableBody, MenuItem, LinearProgress,
  Switch, FormControlLabel, Autocomplete,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import axios from 'axios';
import { useToast } from '../../../../context/ToastContext';
import CountedTextArea from '../../../Common/CountedTextArea';

const API = '/api/erp/engineering/products';
const ITEMS_API = '/api/erp/stores/items';
const CATEGORIES_API = '/api/erp/engineering/categories';

const PRODUCT_TYPES = ['FG', 'SFG', 'Assembly', 'Spare'];
const FINISH_TYPES = ['Paint', 'Powder Coat', 'Anodized', 'Polished', 'Raw', 'Galvanized'];

export default function ProductMasterForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  const isView = location.pathname.includes('/view/');
  const isEdit = location.pathname.includes('/edit/');

  const [loading, setLoading] = useState(false);
  const [itemMasterList, setItemMasterList] = useState([]);
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({
    product_uid: '', product_type: 'FG', main_category_name: '', sub_category_name: '', product_code: '', part_name: '', color: '', item_id: '',
    description: '', finish_type: '', assembly_qty: 0, qty_per_pallet: 0, is_active: true,
  });

  const mainOptions = categories.filter((c) => c.type === 'Main').map((c) => c.name);
  const subOptions = categories
    .filter((c) => c.type === 'Sub' && (!form.main_category_name || (c.parent && c.parent.name === form.main_category_name)))
    .map((c) => c.name);

  useEffect(() => {
    axios.get(ITEMS_API).then(({ data }) => setItemMasterList(data)).catch(() => {});
    axios.get(CATEGORIES_API).then(({ data }) => setCategories(data)).catch(() => {});
    if (id) {
      setLoading(true);
      axios.get(`${API}/${id}`).then(({ data }) => {
        const category = data.category;
        setForm({
          product_uid: data.product_uid || '', product_type: data.product_type || 'FG',
          main_category_name: category && category.parent ? category.parent.name : '',
          sub_category_name: category ? category.name : '',
          product_code: data.product_code || '', part_name: data.part_name || '',
          color: data.color || '', item_id: data.item_id || '', description: data.description || '', finish_type: data.finish_type || '',
          assembly_qty: data.assembly_qty || 0, qty_per_pallet: data.qty_per_pallet || 0,
          is_active: data.is_active !== false,
        });
        setItems(data.items?.map((i) => ({
          tempId: Date.now() + Math.random(),
          item_id: i.item_id || '', item_code: i.item_code || '',
          item_name: i.item_name || '', quantity: i.quantity || 1,
          unit_id: i.unit_id || '', wastage_percent: i.wastage_percent || 0,
        })) || []);
      }).catch(() => showToast('Failed to load', 'error'))
      .finally(() => setLoading(false));
    }
  }, [id]);

  const handleChange = (field) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [field]: val }));
  };

  const addItem = () => {
    setItems((prev) => [...prev, { tempId: Date.now(), item_id: '', item_code: '', item_name: '', quantity: 1, wastage_percent: 0 }]);
  };

  const removeItem = (tempId) => setItems((prev) => prev.filter((i) => i.tempId !== tempId));

  const handleItemChange = (tempId, field, value) => {
    setItems((prev) => prev.map((i) => {
      if (i.tempId !== tempId) return i;
      const updated = { ...i, [field]: value };
      if (field === 'item_id') {
        const sel = itemMasterList.find((im) => im.id === value);
        if (sel) {
          updated.item_code = sel.item_code;
          updated.item_name = sel.item_name;
          updated.unit_id = sel.unit_id;
        }
      }
      return updated;
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { product_uid, product_type, main_category_name, sub_category_name, product_code, part_name, color, item_id, description, finish_type, assembly_qty, qty_per_pallet, is_active } = form;
    const payload = {
      product_uid, product_type, main_category_name, sub_category_name, product_code, part_name, color, item_id, description, finish_type, assembly_qty, qty_per_pallet, is_active,
      items,
    };
    try {
      if (isEdit) await axios.put(`${API}/${id}`, payload);
      else await axios.post(API, payload);
      showToast(`Product ${isEdit ? 'updated' : 'created'}`, 'success');
      navigate('/engineering/products');
    } catch {
      showToast('Failed to save', 'error');
    } finally { setLoading(false); }
  };

  if (loading) return <LinearProgress />;
  const readOnly = isView;

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <IconButton onClick={() => navigate('/engineering/products')}><ArrowBackIcon /></IconButton>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'var(--heading-color)' }}>
          {isView ? 'View' : isEdit ? 'Edit' : 'New'} Product Master
        </Typography>
      </Box>

      <form onSubmit={handleSubmit}>
        <Card sx={{ borderRadius: 3, mb: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Product Details</Typography>
            <Grid container spacing={2}>
              <Grid item xs={6} md={1.5}>
                <TextField label="UID" size="small" fullWidth value={form.product_uid} onChange={handleChange('product_uid')}
                  disabled={readOnly || isEdit} helperText="Auto if blank" />
              </Grid>
              <Grid item xs={6} md={1.5}>
                <TextField label="Type" select size="small" fullWidth value={form.product_type} onChange={handleChange('product_type')} disabled={readOnly}>
                  {PRODUCT_TYPES.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid item xs={6} md={2}>
                <Autocomplete
                  size="small" freeSolo
                  options={mainOptions}
                  value={form.main_category_name || ''}
                  onChange={(e, v) => setForm((f) => ({ ...f, main_category_name: v || '' }))}
                  onInputChange={(e, v) => setForm((f) => ({ ...f, main_category_name: v || '' }))}
                  disabled={readOnly}
                  renderInput={(params) => <TextField {...params} label="Main Category" required helperText="Type to add new" />}
                />
              </Grid>
              <Grid item xs={6} md={2}>
                <Autocomplete
                  size="small" freeSolo
                  options={subOptions}
                  value={form.sub_category_name || ''}
                  onChange={(e, v) => setForm((f) => ({ ...f, sub_category_name: v || '' }))}
                  onInputChange={(e, v) => setForm((f) => ({ ...f, sub_category_name: v || '' }))}
                  disabled={readOnly}
                  renderInput={(params) => <TextField {...params} label="Sub Category" required helperText="Type to add new" />}
                />
              </Grid>
              <Grid item xs={6} md={1}>
                <TextField label="Color" size="small" fullWidth value={form.color} onChange={handleChange('color')} disabled={readOnly} helperText="e.g. White" />
              </Grid>
              <Grid item xs={6} md={1.5}>
                <TextField label="Product Code" size="small" fullWidth value={form.product_code} onChange={handleChange('product_code')} disabled={readOnly} />
              </Grid>
              <Grid item xs={6} md={2}>
                <TextField label="Part Name" size="small" fullWidth value={form.part_name} onChange={handleChange('part_name')} disabled={readOnly} required />
              </Grid>
              <Grid item xs={6} md={2}>
                <TextField label="Inventory Item" select size="small" fullWidth value={form.item_id} onChange={handleChange('item_id')} disabled={readOnly} helperText="Finished-goods stock item">
                  <MenuItem value=""><em>None</em></MenuItem>
                  {itemMasterList.map((im) => <MenuItem key={im.id} value={im.id}>{im.item_code} - {im.item_name}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid item xs={6} md={1.5}>
                <TextField label="Finish Type" select size="small" fullWidth value={form.finish_type} onChange={handleChange('finish_type')} disabled={readOnly}>
                  <MenuItem value=""><em>None</em></MenuItem>
                  {FINISH_TYPES.map((f) => <MenuItem key={f} value={f}>{f}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid item xs={6} md={1}>
                <TextField label="Assembly Qty" type="number" size="small" fullWidth value={form.assembly_qty} onChange={handleChange('assembly_qty')} disabled={readOnly} />
              </Grid>
              <Grid item xs={6} md={1}>
                <TextField label="Qty/Pallet" type="number" size="small" fullWidth value={form.qty_per_pallet} onChange={handleChange('qty_per_pallet')} disabled={readOnly} />
              </Grid>
              <Grid item xs={6} md={1}>
                <FormControlLabel control={<Switch checked={form.is_active} onChange={handleChange('is_active')} disabled={readOnly} />} label="Active" sx={{ mt: 1 }} />
              </Grid>
              <Grid item xs={12}>
                <CountedTextArea label="Description" size="small" fullWidth value={form.description} onChange={handleChange('description')} disabled={readOnly} rows={2} />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Card sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>Product Components (BOM Items)</Typography>
              {!readOnly && <Button startIcon={<AddIcon />} onClick={addItem} size="small" variant="outlined">Add Component</Button>}
            </Box>
            <Table size="small" sx={{ '& th': { fontWeight: 700, bgcolor: '#f5f7fa', fontSize: '0.8rem' } }}>
              <TableHead>
                <TableRow>
                  <TableCell>#</TableCell>
                  <TableCell>Item Code</TableCell>
                  <TableCell>Item Name</TableCell>
                  <TableCell>Qty</TableCell>
                  <TableCell>Wastage %</TableCell>
                  {!readOnly && <TableCell>Action</TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {items.length === 0 && (
                  <TableRow><TableCell colSpan={6} align="center" sx={{ py: 4, color: 'gray' }}>No components. Add items that make up this product.</TableCell></TableRow>
                )}
                {items.map((it, idx) => (
                  <TableRow key={it.tempId}>
                    <TableCell>{idx + 1}</TableCell>
                    <TableCell>
                      {readOnly ? it.item_code : (
                        <TextField select size="small" fullWidth value={it.item_id} onChange={(e) => handleItemChange(it.tempId, 'item_id', Number(e.target.value))}>
                          <MenuItem value=""><em>Select</em></MenuItem>
                          {itemMasterList.map((im) => <MenuItem key={im.id} value={im.id}>{im.item_code}</MenuItem>)}
                        </TextField>
                      )}
                    </TableCell>
                    <TableCell>{readOnly ? it.item_name : <TextField size="small" fullWidth value={it.item_name} onChange={(e) => handleItemChange(it.tempId, 'item_name', e.target.value)} />}</TableCell>
                    <TableCell><TextField type="number" size="small" sx={{ width: 80 }} value={it.quantity} disabled={readOnly} onChange={(e) => handleItemChange(it.tempId, 'quantity', Number(e.target.value))} /></TableCell>
                    <TableCell><TextField type="number" size="small" sx={{ width: 80 }} value={it.wastage_percent} disabled={readOnly} onChange={(e) => handleItemChange(it.tempId, 'wastage_percent', Number(e.target.value))} InputProps={{ endAdornment: '%' }} /></TableCell>
                    {!readOnly && (
                      <TableCell><IconButton size="small" color="error" onClick={() => removeItem(it.tempId)}><DeleteIcon fontSize="small" /></IconButton></TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {!readOnly && (
          <Box mt={3} display="flex" gap={2}>
            <Button type="submit" variant="contained" startIcon={<SaveIcon />} disabled={loading}>Save</Button>
            <Button variant="outlined" onClick={() => navigate('/engineering/products')}>Cancel</Button>
          </Box>
        )}
      </form>
    </Box>
  );
}
