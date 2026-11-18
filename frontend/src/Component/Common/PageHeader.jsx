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
        mb: { xs: 1.5, sm: 2.5 },
        pb: { xs: 1, sm: 1.5 },
        borderBottom: '1px solid',
        borderColor: 'divider',
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        gap: { xs: 1.25, sm: 2 },
        alignItems: { xs: 'stretch', sm: 'flex-end' },
        justifyContent: 'space-between',
      }}
    >
      <Box sx={{ minWidth: 0 }}>
        {breadcrumbs !== false && (
          <Breadcrumbs separator={<FiChevronRight size={14} />} sx={{ mb: 0.5, '& .MuiBreadcrumbs-ol': { flexWrap: 'nowrap', overflowX: 'auto' } }}>
            {pathSegments.map((seg, i) => {
              const to = '/' + pathSegments.slice(0, i + 1).join('/');
              const label = seg.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
              const isLast = i === pathSegments.length - 1;
              return isLast ? (
                <Typography key={i} variant="caption" color="text.secondary" sx={{ textTransform: 'capitalize', whiteSpace: 'nowrap' }}>
                  {label}
                </Typography>
              ) : (
                <Link key={i} component={RouterLink} to={to} underline="hover" variant="caption" color="primary" sx={{ whiteSpace: 'nowrap' }}>
                  {label}
                </Link>
              );
            })}
          </Breadcrumbs>
        )}
        <Stack direction="row" spacing={1.25} alignItems="center">
          {icon && (
            <Box
              sx={{
                display: 'flex',
                p: { xs: 0.75, sm: 1 },
                borderRadius: 1.5,
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                boxShadow: 1,
                flexShrink: 0,
              }}
            >
              {icon}
            </Box>
          )}
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontWeight: 700, lineHeight: 1.15, color: 'text.primary', fontSize: { xs: '1.15rem', sm: '1.4rem' } }}>
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25, fontSize: { xs: '0.75rem', sm: '0.85rem' }, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: { xs: 'nowrap', sm: 'normal' } }}>
                {subtitle}
              </Typography>
            )}
          </Box>
        </Stack>
      </Box>
      {actions && <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center', justifyContent: { xs: 'flex-start', sm: 'flex-end' } }}>{actions}</Box>}
    </Box>
  );
};

export default PageHeader;
