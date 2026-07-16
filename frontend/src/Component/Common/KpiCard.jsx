import React from 'react';
import { Card, CardContent, Box, Typography, LinearProgress, useTheme } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

// Corporate KPI card with icon, label, big value, optional trend & link.
const KpiCard = ({
  label,
  value,
  icon,
  color = '#1976d2',
  subtitle,
  trend,
  to,
  loading,
  progress,
}) => {
  const theme = useTheme();
  const inner = (
    <CardContent sx={{ p: 2.25 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box sx={{ minWidth: 0 }}>
          <Typography
            variant="overline"
            color="text.secondary"
            sx={{ fontWeight: 600, letterSpacing: 0.5, display: 'block', lineHeight: 1.2 }}
          >
            {label}
          </Typography>
          {loading ? (
            <Box sx={{ height: 36, width: 90, bgcolor: 'action.hover', borderRadius: 1, mt: 1 }} />
          ) : (
            <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary', lineHeight: 1.1, mt: 0.5 }}>
              {value}
            </Typography>
          )}
          {subtitle && (
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
              {subtitle}
            </Typography>
          )}
        </Box>
        {icon && (
          <Box
            sx={{
              display: 'flex',
              p: 1.25,
              borderRadius: 2,
              color,
              bgcolor: `${color}1a`,
              flexShrink: 0,
            }}
          >
            {icon}
          </Box>
        )}
      </Box>
      {trend && (
        <Typography
          variant="caption"
          sx={{ mt: 1, display: 'inline-flex', alignItems: 'center', gap: 0.5, color: trend.up ? 'success.main' : 'error.main', fontWeight: 600 }}
        >
          {trend.label}
        </Typography>
      )}
      {progress !== undefined && (
        <LinearProgress
          variant="determinate"
          value={Math.min(100, Math.max(0, progress))}
          sx={{ mt: 1.5, height: 6, borderRadius: 3, [`& .MuiLinearProgress-bar`]: { bgcolor: color } }}
        />
      )}
    </CardContent>
  );

  if (to) {
    return (
      <Card
        component={RouterLink}
        to={to}
        sx={{
          textDecoration: 'none',
          borderLeft: `4px solid ${color}`,
          transition: 'transform .15s, box-shadow .15s',
          '&:hover': { transform: 'translateY(-3px)', boxShadow: theme.shadows[6] },
        }}
      >
        {inner}
      </Card>
    );
  }

  return <Card sx={{ borderLeft: `4px solid ${color}` }}>{inner}</Card>;
};

export default KpiCard;
