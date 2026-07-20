import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Box, 
  Typography, 
  Paper, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Grid, 
  Checkbox, 
  FormControlLabel, 
  Button, 
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { PERMISSIONS } from '../../constants/permissions';
import { useToast } from '../../context/ToastContext';

const UserAccess = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [userRole, setUserRole] = useState('');
  const [userPermissions, setUserPermissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/api/users', { withCredentials: true });
      setUsers(response.data);
    } catch (err) {
      console.error('Error fetching users:', err);
      showToast('Error fetching users', 'error');
    }
  };

  const handleUserChange = (event) => {
    const userId = event.target.value;
    setSelectedUser(userId);
    const user = users.find(u => u.id === userId);
    setUserRole(user?.role || 'USER');
    setUserPermissions(user?.permissions || []);
  };

  const handlePermissionChange = (permId) => {
    setUserPermissions(prev => 
      prev.includes(permId) 
        ? prev.filter(p => p !== permId) 
        : [...prev, permId]
    );
  };

  const handleSelectAllModule = (moduleKey) => {
    const modulePerms = PERMISSIONS[moduleKey].map(p => p.id);
    const allSelected = modulePerms.every(id => userPermissions.includes(id));
    
    if (allSelected) {
      setUserPermissions(prev => prev.filter(id => !modulePerms.includes(id)));
    } else {
      setUserPermissions(prev => [...new Set([...prev, ...modulePerms])]);
    }
  };

  const handleSave = async () => {
    if (!selectedUser) return;
    setLoading(true);
    try {
      await axios.put(`/api/users/${selectedUser}/permissions`, {
        permissions: userPermissions,
        role: userRole
      }, { withCredentials: true });
      showToast('User access and role updated successfully', 'success');
      // Update local state for users
      setUsers(prev => prev.map(u => u.id === selectedUser ? { ...u, permissions: userPermissions, role: userRole } : u));
    } catch (err) {
      console.error('Error saving permissions:', err);
      showToast('Error saving user access', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ color: 'var(--heading-color)', fontWeight: 'bold' }}>
        User Access Management
      </Typography>
      <Typography variant="body1" sx={{ mb: 4, color: '#666' }}>
        Assign module and menu-level access to specific employees.
      </Typography>

      <Paper sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Select Employee / User</InputLabel>
              <Select
                value={selectedUser}
                label="Select Employee / User"
                onChange={handleUserChange}
              >
                {users.map(user => (
                  <MenuItem key={user.id} value={user.id}>
                    {user.ename} ({user.username})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>User Role</InputLabel>
              <Select
                value={userRole}
                label="User Role"
                onChange={(e) => setUserRole(e.target.value)}
              >
                <MenuItem value="ADMIN">ADMIN (Full Access)</MenuItem>
                <MenuItem value="USER">USER / EMPLOYEE (Restricted)</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <Button 
              variant="contained" 
              fullWidth
              onClick={handleSave} 
              disabled={!selectedUser || loading}
              sx={{ bgcolor: 'var(--heading-color)', height: '56px' }}
            >
              {loading ? 'Saving...' : 'Save Access & Role'}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {!selectedUser ? (
        <Alert severity="info">Please select a user to manage their module access and system role.</Alert>
      ) : (
        <Box>
          {Object.keys(PERMISSIONS).map((moduleKey) => (
            <Accordion key={moduleKey} sx={{ mb: 1, border: '1px solid #e0e0e0', boxShadow: 'none' }}>
              <AccordionSummary expandMoreIcon={<ExpandMoreIcon />}>
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', pr: 2 }}>
                  <Typography sx={{ fontWeight: 'bold', flexGrow: 1 }}>{moduleKey} Module</Typography>
                  <Button 
                    size="small" 
                    onClick={(e) => { e.stopPropagation(); handleSelectAllModule(moduleKey); }}
                    sx={{ color: '#2563eb' }}
                  >
                    Select/Deselect All
                  </Button>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  {PERMISSIONS[moduleKey].map((perm) => (
                    <Grid item xs={12} sm={6} md={4} key={perm.id}>
                      <FormControlLabel
                        control={
                          <Checkbox 
                            checked={userPermissions.includes(perm.id)} 
                            onChange={() => handlePermissionChange(perm.id)}
                            sx={{ color: 'var(--heading-color)', '&.Mui-checked': { color: 'var(--heading-color)' } }}
                          />
                        }
                        label={perm.label}
                      />
                    </Grid>
                  ))}
                </Grid>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default UserAccess;
