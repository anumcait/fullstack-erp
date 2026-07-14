import React, { useEffect, useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  TextField, LinearProgress, List, ListItem, ListItemButton, ListItemText, Chip, Box,
} from '@mui/material';
import axios from 'axios';

const API = '/api/erp/engineering/bom';

export default function BOMSelectDialog({ open, onClose, onSelect, excludeId }) {
  const [boms, setBoms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    axios.get(API, { params: search ? { search } : {} })
      .then(({ data }) => setBoms(data.filter((b) => b.id !== Number(excludeId) && b.status === 'Active')))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [open, search, excludeId]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Select Sub-Assembly BOM</DialogTitle>
      <DialogContent>
        <TextField size="small" fullWidth placeholder="Search BOMs..." value={search}
          onChange={(e) => setSearch(e.target.value)} sx={{ mb: 2, mt: 1 }} />
        {loading && <LinearProgress />}
        <List dense sx={{ maxHeight: 400, overflow: 'auto' }}>
          {boms.map((bom) => (
            <ListItem key={bom.id} disablePadding>
              <ListItemButton onClick={() => onSelect(bom)}>
                <ListItemText
                  primary={`${bom.bom_no} - ${bom.bom_name}`}
                  secondary={`Product: ${bom.product_code} - ${bom.product_name} (v${bom.version})`}
                />
                <Chip label={`${bom.items?.length || 0} items`} size="small" />
              </ListItemButton>
            </ListItem>
          ))}
          {!loading && boms.length === 0 && (
            <Box sx={{ py: 4, textAlign: 'center', color: 'gray' }}>No active BOMs found</Box>
          )}
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
      </DialogActions>
    </Dialog>
  );
}
