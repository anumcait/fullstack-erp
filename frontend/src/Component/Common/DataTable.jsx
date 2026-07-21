import React, { useState, useMemo } from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  TablePagination,
  TextField,
  Box,
  Typography,
  useTheme,
} from '@mui/material';
import { FiSearch } from 'react-icons/fi';
import ExportButtons from './ExportButtons';

// Corporate data table: sorting, per-column search, pagination, Excel/PDF export.
// columns: [{ field, header, type?, align?, render?, numeric? }]
const DataTable = ({ title, columns, rows, loading, emptyMessage = 'No records found', dense }) => {
  const theme = useTheme();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [orderBy, setOrderBy] = useState(null);
  const [order, setOrder] = useState('asc');
  const [filters, setFilters] = useState({});

  const handleSort = (field) => {
    if (orderBy === field) setOrder(order === 'asc' ? 'desc' : 'asc');
    else {
      setOrderBy(field);
      setOrder('asc');
    }
  };

  const handleFilter = (field, value) => {
    setFilters((f) => ({ ...f, [field]: value }));
    setPage(0);
  };

  const filtered = useMemo(() => {
    let data = [...rows];
    Object.entries(filters).forEach(([field, val]) => {
      if (val) {
        data = data.filter((r) => String(r[field] ?? '').toLowerCase().includes(val.toLowerCase()));
      }
    });
    if (orderBy) {
      data.sort((a, b) => {
        const av = a[orderBy];
        const bv = b[orderBy];
        if (av == null) return 1;
        if (bv == null) return -1;
        const na = parseFloat(av);
        const nb = parseFloat(bv);
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
              {columns.map((col) => (
                <TableCell key={col.field} sx={{ fontWeight: 700, bgcolor: 'grey.50', whiteSpace: 'nowrap' }} align={col.align || 'left'}>
                  <TableSortLabel active={orderBy === col.field} direction={orderBy === col.field ? order : 'asc'} onClick={() => handleSort(col.field)}>
                    {col.header}
                  </TableSortLabel>
                  <Box sx={{ mt: 0.5 }}>
                    <TextField
                      size="small"
                      placeholder="Filter"
                      value={filters[col.field] || ''}
                      onChange={(e) => handleFilter(col.field, e.target.value)}
                      sx={{ '& .MuiInputBase-root': { fontSize: 12, bgcolor: '#fff' }, width: 130 }}
                    />
                  </Box>
                </TableCell>
              ))}
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
      <TablePagination
        component="div"
        count={filtered.length}
        page={page}
        onPageChange={(e, p) => setPage(p)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
        rowsPerPageOptions={[10, 25, 50, 100]}
      />
    </Paper>
  );
};

export default DataTable;
