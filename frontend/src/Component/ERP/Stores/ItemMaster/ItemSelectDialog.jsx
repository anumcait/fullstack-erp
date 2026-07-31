import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Table, TableHead, TableRow, TableCell, TableBody,
  TextField
} from '@mui/material';

export default function ItemSelectDialog({ open, onClose, onSelect, title, data, columns }) {
  const [search, setSearch] = useState("");
  const [selectedIdx, setSelectedIdx] = useState(0);
  const selectedRef = useRef(0);
  const filteredRef = useRef([]);
  useEffect(() => { if (open) setSelectedIdx(0); }, [open]);

  useEffect(() => { selectedRef.current = selectedIdx; }, [selectedIdx]);

  const cols = useMemo(() => columns || [
    { key: 'id', label: 'Code' },
    { key: 'name', label: 'Name' },
  ], [columns]);

  const filtered = useMemo(() => {
    const sorted = [...(data || [])].sort((a, b) => (a.id || 0) - (b.id || 0));
    const q = search.trim().toLowerCase();
    if (!q) return sorted;
    return sorted.filter((row) =>
      cols.some((c) => String(row[c.key] || "").toLowerCase().includes(q))
    );
  }, [search, data, cols]);

  useEffect(() => { filteredRef.current = filtered; }, [filtered]);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      const f = filteredRef.current;
      const idx = selectedRef.current;
      if (e.key === "ArrowDown") { e.preventDefault(); setSelectedIdx((i) => Math.min(i + 1, f.length - 1)); }
      if (e.key === "ArrowUp") { e.preventDefault(); setSelectedIdx((i) => Math.max(i - 1, 0)); }
      if (e.key === "Enter" && f[idx]) { e.preventDefault(); onSelect(f[idx]); }
      if (e.key === "Escape") { onClose(); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onSelect, onClose]);

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
          onChange={(e) => { setSearch(e.target.value); setSelectedIdx(0); }}
          autoFocus
        />
        <Table size="small">
          <TableHead>
            <TableRow>
              {cols.map((c) => (<TableCell key={c.key}>{c.label}</TableCell>))}
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map((item, i) => (
              <TableRow
                key={item.id}
                hover
                selected={i === selectedIdx}
                style={{ cursor: 'pointer' }}
                onClick={() => onSelect(item)}
                onMouseEnter={() => setSelectedIdx(i)}
                sx={i === selectedIdx ? { "&.Mui-selected": { bgcolor: "#e0f2fe" }, "&.Mui-selected:hover": { bgcolor: "#bae6fd" } } : {}}
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
