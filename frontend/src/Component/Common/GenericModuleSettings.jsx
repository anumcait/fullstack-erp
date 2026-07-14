import React from 'react';
import { Box, Grid, Card, CardContent, Typography } from '@mui/material';
import { useLocation } from 'react-router-dom';
import { FiSettings, FiLock, FiUser, FiDatabase } from 'react-icons/fi';

const GenericModuleSettings = () => {
  const location = useLocation();
  const pathParts = location.pathname.split('/');
  const moduleName = pathParts[1].toUpperCase();

  const settingList = [
    { title: `${moduleName} Configuration`, desc: 'Manage module-specific parameters.', icon: <FiSettings /> },
    { title: `User Access Control`, desc: 'Manage permissions for this module.', icon: <FiLock /> },
    { title: `Master Data Sync`, desc: 'Configure data integration rules.', icon: <FiDatabase /> },
    { title: `Profile Settings`, desc: 'Update your personal module preferences.', icon: <FiUser /> }
  ];

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold', color: 'var(--heading-color)' }}>
        {moduleName} Settings
      </Typography>
      
      <Grid container spacing={3}>
        {settingList.map((setting, index) => (
          <Grid item xs={12} sm={6} key={index}>
            <Card sx={{ 
              borderRadius: '16px', 
              transition: '0.3s',
              cursor: 'pointer',
              border: '1px solid #eee',
              '&:hover': { backgroundColor: '#fcfcfc', boxShadow: '0 8px 25px rgba(0,0,0,0.05)' }
            }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <Box sx={{ p: 2, bgcolor: '#f5f5f5', color: '#333', borderRadius: '12px' }}>
                  {setting.icon}
                </Box>
                <Box>
                  <Typography variant="h6" sx={{ color: '#333', fontWeight: 'bold' }}>{setting.title}</Typography>
                  <Typography variant="body2" color="textSecondary">{setting.desc}</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      
      <Box sx={{ mt: 8, p: 5, bgcolor: '#e8f5e9', borderRadius: '20px', border: '2px dashed #4caf50', textAlign: 'center' }}>
        <Typography variant="h6" color="#2e7d32">Modular Settings Active</Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
          You are now in the <b>{moduleName}</b> configuration panel. 
          Settings changed here will only apply to this module.
        </Typography>
      </Box>
    </Box>
  );
};

export default GenericModuleSettings;
