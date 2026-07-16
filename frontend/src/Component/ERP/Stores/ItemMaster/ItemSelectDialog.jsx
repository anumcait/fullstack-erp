import React, { useState, useMemo } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Table, TableHead, TableRow, TableCell, TableBody,
  TextField
} from '@mui/material';

export default function ItemSelectDialog({ open, onClose, onSelect, title, data, columns }) {
  const [search, setSearch] = useState("");
  const cols = columns || [
    { key: 'id', label: 'Code' },
    { key: 'name', label: 'Name' },
  ];

  const filtered = useMemo(() => {
    const sorted = [...(data || [])].sort((a, b) => (a.id || 0) - (b.id || 0));
    const q = search.trim().toLowerCase();
    if (!q) return sorted;
    return sorted.filter((row) =>
      cols.some((c) => String(row[c.key] || "").toLowerCase().includes(q))
    );
  }, [search, data, cols]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent dividers>
        <TextField
          fullWidth
          placeholder="Search..."
          size="small"
          sx={{ mb: 2 }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          autoFocus
        />
        <Table size="small">
          <TableHead>
            <TableRow>
              {cols.map((c) => (<TableCell key={c.key}>{c.label}</TableCell>))}
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map((item) => (
              <TableRow
                key={item.id}
                hover
                style={{ cursor: 'pointer' }}
                onClick={() => onSelect(item)}
              >
                {cols.map((c) => (<TableCell key={c.key}>{item[c.key] || "—"}</TableCell>))}
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={cols.length} align="center" sx={{ color: 'gray', py: 2 }}>
                  No matches found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
