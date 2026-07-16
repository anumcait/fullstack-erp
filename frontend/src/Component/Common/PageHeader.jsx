import React from 'react';
import { Box, Typography, Breadcrumbs, Link, Stack } from '@mui/material';
import { useLocation, Link as RouterLink } from 'react-router-dom';
import { FiChevronRight } from 'react-icons/fi';

// Corporate page header: icon + title + subtitle on the left, actions on the right.
const PageHeader = ({ title, subtitle, icon, actions, breadcrumbs }) => {
  const location = useLocation();
  const pathSegments = location.pathname.split('/').filter(Boolean);

  return (
    <Box
      sx={{
        mb: 3,
        pb: 2,
        borderBottom: '1px solid',
        borderColor: 'divider',
        display: 'flex',
        flexWrap: 'wrap',
        gap: 2,
        alignItems: 'flex-end',
        justifyContent: 'space-between',
      }}
    >
      <Box>
        {breadcrumbs !== false && (
          <Breadcrumbs separator={<FiChevronRight size={14} />} sx={{ mb: 0.5 }}>
            {pathSegments.map((seg, i) => {
              const to = '/' + pathSegments.slice(0, i + 1).join('/');
              const label = seg.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
              const isLast = i === pathSegments.length - 1;
              return isLast ? (
                <Typography key={i} variant="caption" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
                  {label}
                </Typography>
              ) : (
                <Link key={i} component={RouterLink} to={to} underline="hover" variant="caption" color="primary">
                  {label}
                </Link>
              );
            })}
          </Breadcrumbs>
        )}
        <Stack direction="row" spacing={1.5} alignItems="center">
          {icon && (
            <Box
              sx={{
                display: 'flex',
                p: 1,
                borderRadius: 2,
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                boxShadow: 2,
              }}
            >
              {icon}
            </Box>
          )}
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, lineHeight: 1.1, color: 'text.primary' }}>
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
                {subtitle}
              </Typography>
            )}
          </Box>
        </Stack>
      </Box>
      {actions && <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>{actions}</Box>}
    </Box>
  );
};

export default PageHeader;
