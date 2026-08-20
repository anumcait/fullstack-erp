import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Box, Container, Grid, Typography, Collapse, Divider
} from '@mui/material';
import {
  ExpandLess, ExpandMore, LocationOn, Email, Phone, Copyright
} from '@mui/icons-material';
import { useCompany } from '../../context/CompanyContext';

const Footer = () => {
  const [showFooter, setShowFooter] = useState(false);
  const { companyShortName, companySettings } = useCompany();
  const brand = (companyShortName || 'ERP').trim();
  const toggleFooter = () => setShowFooter((prev) => !prev);

  return (
    <Box sx={{ width: '100%', bgcolor: 'var(--footer-bg)', color: 'white', boxShadow: '0 -4px 12px rgba(0,0,0,0.15)', flexShrink: 0 }}>
      <Box onClick={toggleFooter} sx={{
        textAlign: 'center', py: 0.8, bgcolor: 'var(--footer-toggle-bg)', cursor: 'pointer', fontWeight: 600,
        letterSpacing: '0.5px', '&:hover': { bgcolor: 'var(--footer-toggle-hover)' },
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1
      }}>
        {showFooter ? <ExpandMore fontSize="small" /> : <ExpandLess fontSize="small" />}
        <Typography variant="body2" sx={{ fontWeight: 600 }}>{showFooter ? 'Hide Footer' : 'Show Footer'}</Typography>
      </Box>

      <Collapse in={showFooter}>
        <Divider sx={{ bgcolor: '#ffffff33' }} />
        <Container maxWidth="xl" sx={{ py: 3, pb: 4 }}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Box display="flex" alignItems="center" gap={2} mb={1.5}>
                {companySettings.logo_url && (
                  <Box component="img" src={companySettings.logo_url} alt="Logo" sx={{
                    height: 56, width: 'auto', maxWidth: 160, objectFit: 'contain',
                    bgcolor: 'white', borderRadius: 1.5, p: 0.5, boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                  }} />
                )}
                <Typography variant="h4" fontWeight={800} sx={{ letterSpacing: 2 }}>{brand}</Typography>
              </Box>
              <Typography variant="body2" color="grey.300" sx={{ lineHeight: 1.6, mb: 1.5, fontSize: '0.82rem' }}>
                Complete business management platform with Purchase, Inventory, Production, HRMS and more. GST-compliant enterprise solution.
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                <LocationOn fontSize="small" sx={{ color: 'var(--footer-icon)' }} />
                <Typography variant="body2" color="grey.300" sx={{ fontSize: '0.8rem' }}>{companySettings.address || 'Address not configured'}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                <Email fontSize="small" sx={{ color: 'var(--footer-icon)' }} />
                <Typography variant="body2" color="grey.300" sx={{ fontSize: '0.8rem' }}>{companySettings.email || 'email@company.com'}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                <Phone fontSize="small" sx={{ color: 'var(--footer-icon)' }} />
                <Typography variant="body2" color="grey.300" sx={{ fontSize: '0.8rem' }}>{companySettings.phone || '+91 00000 00000'}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box component="a" href={companySettings.website ? `https://${companySettings.website.replace(/^https?:\/\//, '')}` : '#'} target="_blank" rel="noopener" sx={{ color: 'var(--footer-icon)', fontSize: '0.8rem', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                  {companySettings.website || 'www.yourcompany.com'}
                </Box>
              </Box>
            </Grid>

            <Grid size={{ xs: 6, md: 2 }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: 'var(--footer-section-title)', display: 'block', mb: 1, textTransform: 'uppercase', letterSpacing: 1 }}>Operations</Typography>
              <Box component={Link} to="/purchase" sx={{ color: 'white', textDecoration: 'none', fontSize: '0.82rem', display: 'block', py: 0.3, '&:hover': { color: 'var(--footer-link-hover)' } }}>Purchase</Box>
              <Box component={Link} to="/stores" sx={{ color: 'white', textDecoration: 'none', fontSize: '0.82rem', display: 'block', py: 0.3, '&:hover': { color: 'var(--footer-link-hover)' } }}>Stores</Box>
              <Box component={Link} to="/production" sx={{ color: 'white', textDecoration: 'none', fontSize: '0.82rem', display: 'block', py: 0.3, '&:hover': { color: 'var(--footer-link-hover)' } }}>Production</Box>
              <Box component={Link} to="/planning" sx={{ color: 'white', textDecoration: 'none', fontSize: '0.82rem', display: 'block', py: 0.3, '&:hover': { color: 'var(--footer-link-hover)' } }}>Planning</Box>
              <Box component={Link} to="/engineering" sx={{ color: 'white', textDecoration: 'none', fontSize: '0.82rem', display: 'block', py: 0.3, '&:hover': { color: 'var(--footer-link-hover)' } }}>Engineering</Box>
            </Grid>

            <Grid size={{ xs: 6, md: 2 }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: 'var(--footer-section-title)', display: 'block', mb: 1, textTransform: 'uppercase', letterSpacing: 1 }}>Support</Typography>
              <Box component={Link} to="/quality" sx={{ color: 'white', textDecoration: 'none', fontSize: '0.82rem', display: 'block', py: 0.3, '&:hover': { color: 'var(--footer-link-hover)' } }}>Quality</Box>
              <Box component={Link} to="/marketing" sx={{ color: 'white', textDecoration: 'none', fontSize: '0.82rem', display: 'block', py: 0.3, '&:hover': { color: 'var(--footer-link-hover)' } }}>Marketing</Box>
              <Box component={Link} to="/subcontract" sx={{ color: 'white', textDecoration: 'none', fontSize: '0.82rem', display: 'block', py: 0.3, '&:hover': { color: 'var(--footer-link-hover)' } }}>Sub-Contract</Box>
              <Box component={Link} to="/maintenance" sx={{ color: 'white', textDecoration: 'none', fontSize: '0.82rem', display: 'block', py: 0.3, '&:hover': { color: 'var(--footer-link-hover)' } }}>Maintenance</Box>
              <Box component={Link} to="/accounts" sx={{ color: 'white', textDecoration: 'none', fontSize: '0.82rem', display: 'block', py: 0.3, '&:hover': { color: 'var(--footer-link-hover)' } }}>Accounts</Box>
            </Grid>

            <Grid size={{ xs: 6, md: 2 }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: 'var(--footer-section-title)', display: 'block', mb: 1, textTransform: 'uppercase', letterSpacing: 1 }}>HRMS</Typography>
              <Box component={Link} to="/employees" sx={{ color: 'white', textDecoration: 'none', fontSize: '0.82rem', display: 'block', py: 0.3, '&:hover': { color: 'var(--footer-link-hover)' } }}>Employees</Box>
              <Box component={Link} to="/leave" sx={{ color: 'white', textDecoration: 'none', fontSize: '0.82rem', display: 'block', py: 0.3, '&:hover': { color: 'var(--footer-link-hover)' } }}>Leaves</Box>
              <Box component={Link} to="/payroll" sx={{ color: 'white', textDecoration: 'none', fontSize: '0.82rem', display: 'block', py: 0.3, '&:hover': { color: 'var(--footer-link-hover)' } }}>Payroll</Box>
              <Box component={Link} to="/attendance-mod" sx={{ color: 'white', textDecoration: 'none', fontSize: '0.82rem', display: 'block', py: 0.3, '&:hover': { color: 'var(--footer-link-hover)' } }}>Attendance</Box>
              <Box component={Link} to="/useraccess" sx={{ color: 'white', textDecoration: 'none', fontSize: '0.82rem', display: 'block', py: 0.3, '&:hover': { color: 'var(--footer-link-hover)' } }}>User Access</Box>
            </Grid>

            <Grid size={{ xs: 6, md: 2 }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: 'var(--footer-section-title)', display: 'block', mb: 1, textTransform: 'uppercase', letterSpacing: 1 }}>Quick Links</Typography>
              <Box component={Link} to="/dashboard" sx={{ color: 'white', textDecoration: 'none', fontSize: '0.82rem', display: 'block', py: 0.3, '&:hover': { color: 'var(--footer-link-hover)' } }}>Dashboard</Box>
              <Box component={Link} to="/purchase/reports" sx={{ color: 'white', textDecoration: 'none', fontSize: '0.82rem', display: 'block', py: 0.3, '&:hover': { color: 'var(--footer-link-hover)' } }}>Reports</Box>
              <Box component={Link} to="/purchase/settings" sx={{ color: 'white', textDecoration: 'none', fontSize: '0.82rem', display: 'block', py: 0.3, '&:hover': { color: 'var(--footer-link-hover)' } }}>Settings</Box>
              <Box component={Link} to="/profile" sx={{ color: 'white', textDecoration: 'none', fontSize: '0.82rem', display: 'block', py: 0.3, '&:hover': { color: 'var(--footer-link-hover)' } }}>My Profile</Box>
              <Box component={Link} to="/change-password" sx={{ color: 'white', textDecoration: 'none', fontSize: '0.82rem', display: 'block', py: 0.3, '&:hover': { color: 'var(--footer-link-hover)' } }}>Change Password</Box>
            </Grid>
          </Grid>

          <Box mt={3} textAlign="center" sx={{ borderTop: '1px solid #ffffff33', pt: 1.5 }}>
            <Typography variant="caption" color="grey.400" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
              <Copyright fontSize="inherit" /> {new Date().getFullYear()} {brand}{companyShortName ? ' ERP' : ''}. All rights reserved.
            </Typography>
          </Box>
        </Container>
      </Collapse>
    </Box>
  );
};

export default Footer;
