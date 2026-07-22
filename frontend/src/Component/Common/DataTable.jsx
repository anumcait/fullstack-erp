import React, { useState, useMemo } from 'react';
import {
  Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TableSortLabel, TablePagination, TextField, Select, MenuItem, Box, Typography,
  useTheme, Checkbox, ListItemText,
} from '@mui/material';
import ExportButtons from './ExportButtons';

function getDistinct(rows, field) {
  const vals = new Set();
  rows.forEach((r) => {
    const v = r[field];
    if (v != null && v !== '') vals.add(String(v));
  });
  return Array.from(vals).sort();
}

const DataTable = ({ title, columns, rows, loading, emptyMessage = 'No records found', dense }) => {
  const theme = useTheme();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [orderBy, setOrderBy] = useState(null);
  const [order, setOrder] = useState('asc');
  const [filters, setFilters] = useState({});

  const distinctValues = useMemo(() => {
    if (!columns || !rows) return {};
    const map = {};
    columns.forEach((col) => {
      if (!col.numeric && col.field !== 'actions') {
        map[col.field] = getDistinct(rows, col.field);
      }
    });
    return map;
  }, [rows, columns]);

  const handleSort = (field) => {
    if (orderBy === field) setOrder(order === 'asc' ? 'desc' : 'asc');
    else { setOrderBy(field); setOrder('asc'); }
  };

  const handleFilter = (field, value) => {
    setFilters((f) => ({ ...f, [field]: value }));
    setPage(0);
  };

  const filtered = useMemo(() => {
    let data = [...rows];
    Object.entries(filters).forEach(([field, val]) => {
      if (!val || (Array.isArray(val) && val.length === 0)) return;
      if (Array.isArray(val)) {
        data = data.filter((r) => val.includes(String(r[field] ?? '')));
      } else {
        data = data.filter((r) => String(r[field] ?? '').toLowerCase().includes(val.toLowerCase()));
      }
    });
    if (orderBy) {
      data.sort((a, b) => {
        const av = a[orderBy], bv = b[orderBy];
        if (av == null) return 1; if (bv == null) return -1;
        const na = parseFloat(av), nb = parseFloat(bv);
        const bothNum = !Number.isNaN(na) && !Number.isNaN(nb) && av !== '' && bv !== '';
        const cmp = bothNum ? na - nb : String(av).localeCompare(String(bv));
        return order === 'asc' ? cmp : -cmp;
      });
    }
    return data;
  }, [rows, filters, orderBy, order]);

  const paged = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  if (!columns) return null;
  const exportCols = columns.map((c) => ({ field: c.field, header: c.header, type: c.type }));

  return (
    <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}>
      <Box sx={{ p: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid', borderColor: 'divider' }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{title}</Typography>
        <ExportButtons title={title} columns={exportCols} rows={filtered} />
      </Box>
      <TableContainer sx={{ maxHeight: 'calc(100vh - 280px)' }}>
        <Table stickyHeader size={dense ? 'small' : 'medium'}>
          <TableHead>
            <TableRow>
              {columns.map((col) => {
                const distinct = distinctValues[col.field] || [];
                const isSelect = distinct.length > 0 && distinct.length <= 50 && col.field !== 'actions';
                return (
                  <TableCell key={col.field} sx={{ fontWeight: 700, bgcolor: 'grey.50', whiteSpace: 'nowrap' }} align={col.align || 'left'}>
                    <TableSortLabel active={orderBy === col.field} direction={orderBy === col.field ? order : 'asc'} onClick={() => handleSort(col.field)}>
                      {col.header}
                    </TableSortLabel>
                    <Box sx={{ mt: 0.5 }}>
                      {isSelect ? (
                        <Select multiple size="small" displayEmpty
                          value={filters[col.field] || []}
                          onChange={(e) => handleFilter(col.field, e.target.value)}
                          renderValue={(selected) => selected.length === 0 ? 'Filter' : selected.length === 1 ? selected[0] : `${selected.length} selected`}
                          sx={{ fontSize: 12, width: 130, '& .MuiSelect-select': { py: 0.5 } }}>
                          {distinct.map((v) => (
                            <MenuItem key={v} value={v} dense>
                              <Checkbox checked={(filters[col.field] || []).includes(v)} size="small" />
                              <ListItemText primary={v} />
                            </MenuItem>
                          ))}
                        </Select>
                      ) : col.field !== 'actions' ? (
                        <TextField size="small" placeholder="Filter" value={filters[col.field] || ''}
                          onChange={(e) => handleFilter(col.field, e.target.value)}
                          sx={{ '& .MuiInputBase-root': { fontSize: 12, bgcolor: '#fff' }, width: 130 }} />
                      ) : null}
                    </Box>
                  </TableCell>
                );
              })}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={columns.length} align="center" sx={{ py: 6 }}>Loading…</TableCell></TableRow>
            ) : paged.length === 0 ? (
              <TableRow><TableCell colSpan={columns.length} align="center" sx={{ py: 6, color: 'text.secondary' }}>{emptyMessage}</TableCell></TableRow>
            ) : (
              paged.map((row, i) => (
                <TableRow key={row.id ?? i} hover sx={{ '&:hover': { bgcolor: theme.palette.action.hover } }}>
                  {columns.map((col) => (
                    <TableCell key={col.field} align={col.align || 'left'} sx={{ whiteSpace: 'nowrap' }}>
                      {col.render ? col.render(row) : row[col.field] ?? '—'}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination component="div" count={filtered.length} page={page}
        onPageChange={(e, p) => setPage(p)} rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
        rowsPerPageOptions={[10, 25, 50, 100]} />
    </Paper>
  );
};

export default DataTable;
