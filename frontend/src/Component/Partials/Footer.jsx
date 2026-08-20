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
    <Box sx={{ width: '100%', bgcolor: '#f1f5f9', color: 'text.primary', boxShadow: '0 -4px 12px rgba(0,0,0,0.08)', flexShrink: 0, borderTop: '3px solid transparent', borderImage: 'linear-gradient(90deg, var(--primary-main), #60a5fa, var(--accent)) 1' }}>
      <Box onClick={toggleFooter} sx={{
        textAlign: 'center', py: 0.8, bgcolor: '#e2e8f0', cursor: 'pointer', fontWeight: 600,
        letterSpacing: '0.5px', '&:hover': { bgcolor: 'var(--footer-toggle-hover)' },
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1
      }}>
        {showFooter ? <ExpandMore fontSize="small" /> : <ExpandLess fontSize="small" />}
        <Typography variant="body2" sx={{ fontWeight: 600 }}>{showFooter ? 'Hide Footer' : 'Show Footer'}</Typography>
      </Box>

      <Collapse in={showFooter}>
        <Divider sx={{ bgcolor: 'rgba(0,0,0,0.1)' }} />
        <Container maxWidth="xl" sx={{ py: 3, pb: 4 }}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Box display="flex" alignItems="center" gap={2} mb={1.5}>
                {companySettings.logo_url && (
                  <Box component="img" src={companySettings.logo_url} alt="Logo" sx={{
                    height: 56, width: 'auto', maxWidth: 160, objectFit: 'contain',
                    bgcolor: 'var(--primary-main)', borderRadius: 1.5, p: 0.5, boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                  }} />
                )}
                <Typography variant="h4" fontWeight={800} sx={{ letterSpacing: 2 }}>{brand}</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6, mb: 1.5, fontSize: '0.82rem' }}>
                Complete business management platform with Purchase, Inventory, Production, HRMS and more. GST-compliant enterprise solution.
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                <LocationOn fontSize="small" sx={{ color: 'var(--primary-main)' }} />
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>{companySettings.address || 'Address not configured'}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                <Email fontSize="small" sx={{ color: 'var(--primary-main)' }} />
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>{companySettings.email || 'email@company.com'}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                <Phone fontSize="small" sx={{ color: 'var(--primary-main)' }} />
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>{companySettings.phone || '+91 00000 00000'}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box component="a" href={companySettings.website ? `https://${companySettings.website.replace(/^https?:\/\//, '')}` : '#'} target="_blank" rel="noopener" sx={{ color: 'var(--primary-main)', fontSize: '0.8rem', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                  {companySettings.website || 'www.yourcompany.com'}
                </Box>
              </Box>
            </Grid>

            <Grid size={{ xs: 6, md: 2 }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: 'var(--primary-main)', display: 'block', mb: 1, textTransform: 'uppercase', letterSpacing: 1 }}>Operations</Typography>
              <Box component={Link} to="/purchase" sx={{ color: 'var(--primary-main)', textDecoration: 'none', fontSize: '0.82rem', display: 'block', py: 0.3, '&:hover': { color: 'var(--primary-dark, #1565c0)' } }}>Purchase</Box>
              <Box component={Link} to="/stores" sx={{ color: 'var(--primary-main)', textDecoration: 'none', fontSize: '0.82rem', display: 'block', py: 0.3, '&:hover': { color: 'var(--primary-dark, #1565c0)' } }}>Stores</Box>
              <Box component={Link} to="/production" sx={{ color: 'var(--primary-main)', textDecoration: 'none', fontSize: '0.82rem', display: 'block', py: 0.3, '&:hover': { color: 'var(--primary-dark, #1565c0)' } }}>Production</Box>
              <Box component={Link} to="/planning" sx={{ color: 'var(--primary-main)', textDecoration: 'none', fontSize: '0.82rem', display: 'block', py: 0.3, '&:hover': { color: 'var(--primary-dark, #1565c0)' } }}>Planning</Box>
              <Box component={Link} to="/engineering" sx={{ color: 'var(--primary-main)', textDecoration: 'none', fontSize: '0.82rem', display: 'block', py: 0.3, '&:hover': { color: 'var(--primary-dark, #1565c0)' } }}>Engineering</Box>
            </Grid>

            <Grid size={{ xs: 6, md: 2 }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: 'var(--primary-main)', display: 'block', mb: 1, textTransform: 'uppercase', letterSpacing: 1 }}>Support</Typography>
              <Box component={Link} to="/quality" sx={{ color: 'var(--primary-main)', textDecoration: 'none', fontSize: '0.82rem', display: 'block', py: 0.3, '&:hover': { color: 'var(--primary-dark, #1565c0)' } }}>Quality</Box>
              <Box component={Link} to="/marketing" sx={{ color: 'var(--primary-main)', textDecoration: 'none', fontSize: '0.82rem', display: 'block', py: 0.3, '&:hover': { color: 'var(--primary-dark, #1565c0)' } }}>Marketing</Box>
              <Box component={Link} to="/subcontract" sx={{ color: 'var(--primary-main)', textDecoration: 'none', fontSize: '0.82rem', display: 'block', py: 0.3, '&:hover': { color: 'var(--primary-dark, #1565c0)' } }}>Sub-Contract</Box>
              <Box component={Link} to="/maintenance" sx={{ color: 'var(--primary-main)', textDecoration: 'none', fontSize: '0.82rem', display: 'block', py: 0.3, '&:hover': { color: 'var(--primary-dark, #1565c0)' } }}>Maintenance</Box>
              <Box component={Link} to="/accounts" sx={{ color: 'var(--primary-main)', textDecoration: 'none', fontSize: '0.82rem', display: 'block', py: 0.3, '&:hover': { color: 'var(--primary-dark, #1565c0)' } }}>Accounts</Box>
            </Grid>

            <Grid size={{ xs: 6, md: 2 }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: 'var(--primary-main)', display: 'block', mb: 1, textTransform: 'uppercase', letterSpacing: 1 }}>HRMS</Typography>
              <Box component={Link} to="/employees" sx={{ color: 'var(--primary-main)', textDecoration: 'none', fontSize: '0.82rem', display: 'block', py: 0.3, '&:hover': { color: 'var(--primary-dark, #1565c0)' } }}>Employees</Box>
              <Box component={Link} to="/leave" sx={{ color: 'var(--primary-main)', textDecoration: 'none', fontSize: '0.82rem', display: 'block', py: 0.3, '&:hover': { color: 'var(--primary-dark, #1565c0)' } }}>Leaves</Box>
              <Box component={Link} to="/payroll" sx={{ color: 'var(--primary-main)', textDecoration: 'none', fontSize: '0.82rem', display: 'block', py: 0.3, '&:hover': { color: 'var(--primary-dark, #1565c0)' } }}>Payroll</Box>
              <Box component={Link} to="/attendance-mod" sx={{ color: 'var(--primary-main)', textDecoration: 'none', fontSize: '0.82rem', display: 'block', py: 0.3, '&:hover': { color: 'var(--primary-dark, #1565c0)' } }}>Attendance</Box>
              <Box component={Link} to="/useraccess" sx={{ color: 'var(--primary-main)', textDecoration: 'none', fontSize: '0.82rem', display: 'block', py: 0.3, '&:hover': { color: 'var(--primary-dark, #1565c0)' } }}>User Access</Box>
            </Grid>

            <Grid size={{ xs: 6, md: 2 }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: 'var(--primary-main)', display: 'block', mb: 1, textTransform: 'uppercase', letterSpacing: 1 }}>Quick Links</Typography>
              <Box component={Link} to="/dashboard" sx={{ color: 'var(--primary-main)', textDecoration: 'none', fontSize: '0.82rem', display: 'block', py: 0.3, '&:hover': { color: 'var(--primary-dark, #1565c0)' } }}>Dashboard</Box>
              <Box component={Link} to="/purchase/reports" sx={{ color: 'var(--primary-main)', textDecoration: 'none', fontSize: '0.82rem', display: 'block', py: 0.3, '&:hover': { color: 'var(--primary-dark, #1565c0)' } }}>Reports</Box>
              <Box component={Link} to="/purchase/settings" sx={{ color: 'var(--primary-main)', textDecoration: 'none', fontSize: '0.82rem', display: 'block', py: 0.3, '&:hover': { color: 'var(--primary-dark, #1565c0)' } }}>Settings</Box>
              <Box component={Link} to="/profile" sx={{ color: 'var(--primary-main)', textDecoration: 'none', fontSize: '0.82rem', display: 'block', py: 0.3, '&:hover': { color: 'var(--primary-dark, #1565c0)' } }}>My Profile</Box>
              <Box component={Link} to="/change-password" sx={{ color: 'var(--primary-main)', textDecoration: 'none', fontSize: '0.82rem', display: 'block', py: 0.3, '&:hover': { color: 'var(--primary-dark, #1565c0)' } }}>Change Password</Box>
            </Grid>
          </Grid>

          <Box mt={3} textAlign="center" sx={{ borderTop: '1px solid rgba(0,0,0,0.1)', pt: 1.5 }}>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
              <Copyright fontSize="inherit" /> {new Date().getFullYear()} {brand}{companyShortName ? ' ERP' : ''}. All rights reserved.
            </Typography>
          </Box>
        </Container>
      </Collapse>
    </Box>
  );
};

export default Footer;
