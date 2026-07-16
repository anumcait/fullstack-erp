import React from 'react';
import { Chip } from '@mui/material';

const STATUS_COLORS = {
  draft: 'default',
  pending: 'warning',
  approved: 'success',
  rejected: 'error',
  received: 'success',
  issued: 'info',
  closed: 'default',
  partial: 'warning',
  passed: 'success',
  fail: 'error',
  active: 'success',
  inactive: 'default',
  open: 'warning',
  completed: 'success',
  cancelled: 'error',
};

const StatusChip = ({ status }) => {
  const key = String(status || '').toLowerCase();
  const color = STATUS_COLORS[key] || 'default';
  return (
    <Chip
      label={status}
      size="small"
      color={color}
      variant={color === 'default' ? 'outlined' : 'filled'}
      sx={{ fontWeight: 600, textTransform: 'capitalize', minWidth: 84 }}
    />
  );
};

export default StatusChip;
