import React from 'react';
import { Table, TableBody, TableRow, TableCell, Box, Typography, Link, CircularProgress } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Link as RouterLink } from 'react-router-dom';

// Compact KPI table — minimal vertical space, metric on the left, value on the right.
const KpiTable = ({ items = [], loading }) => {
  const theme = useTheme();

  if (loading) {
    return (
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress size={22} />
      </Box>
    );
  }

  return (
    <Table size="small" sx={{ '& td': { py: 1, borderColor: 'divider' } }}>
      <TableBody>
        {items.map((k) => {
          const cell = (
            <TableRow
              hover={!!k.to}
              component={k.to ? RouterLink : 'tr'}
              to={k.to}
              sx={{
                textDecoration: 'none',
                '&:hover': k.to ? { bgcolor: 'action.hover' } : {},
                cursor: k.to ? 'pointer' : 'default',
              }}
            >
              <TableCell sx={{ borderLeft: `3px solid ${k.color || theme.palette.primary.main}`, width: 8, py: 0.75 }} />
              <TableCell sx={{ minWidth: 0 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                  {k.icon}
                  <Typography variant="body2" sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>{k.label}</Typography>
                </Box>
                {k.subtitle && (
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', pl: 0.5, mt: 0.25 }}>
                    {k.subtitle}
                  </Typography>
                )}
              </TableCell>
              <TableCell align="right">
                <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary', lineHeight: 1 }}>
                  {k.value}
                </Typography>
              </TableCell>
            </TableRow>
          );
          return <React.Fragment key={k.label}>{cell}</React.Fragment>;
        })}
      </TableBody>
    </Table>
  );
};

export default KpiTable;
