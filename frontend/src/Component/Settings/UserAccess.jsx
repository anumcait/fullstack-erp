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
  Alert,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Chip,
  Tooltip,
  List,
  ListItemButton,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import SupervisedUserCircleIcon from '@mui/icons-material/SupervisedUserCircle';
import SearchIcon from '@mui/icons-material/Search';
import { PERMISSIONS } from '../../constants/permissions';
import { useToast } from '../../context/ToastContext';

const UserAccess = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [userRole, setUserRole] = useState('');
  const [userPermissions, setUserPermissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    role: 'USER',
    empid: '',
    isSystemUser: false
  });
  const [creating, setCreating] = useState(false);
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

  const handleUserSelect = (user) => {
    setSelectedUser(user.id);
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

  const handleCreateUser = async () => {
    if (!newUser.username || !newUser.password) {
      showToast('Username and password are required', 'error');
      return;
    }
    if (newUser.password !== newUser.confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }
    if (newUser.password.length < 6) {
      showToast('Password must be at least 6 characters', 'error');
      return;
    }
    setCreating(true);
    try {
      const payload = {
        username: newUser.username,
        password: newUser.password,
        role: newUser.role
      };
      if (newUser.isSystemUser) {
        payload.empid = null;
        payload.isSystemUser = true;
      } else if (newUser.empid) {
        payload.empid = parseInt(newUser.empid);
      }
      const res = await axios.post('/api/users/create', payload, { withCredentials: true });
      showToast(`User "${res.data.username}" created successfully`, 'success');
      setCreateDialogOpen(false);
      setNewUser({
        username: '',
        password: '',
        confirmPassword: '',
        role: 'USER',
        empid: '',
        isSystemUser: false
      });
      fetchUsers();
    } catch (err) {
      console.error('Error creating user:', err);
      showToast(err.response?.data?.message || 'Error creating user', 'error');
    } finally {
      setCreating(false);
    }
  };

  const selectedUserObj = users.find(u => u.id === selectedUser);
  const isSystemUser = selectedUserObj ? !selectedUserObj.empid : false;

  const filteredUsers = users.filter(user =>
    user.ename?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRoleChipColor = (role) => {
    switch (role?.toUpperCase()) {
      case 'ADMIN': return { bg: '#ebdcf9', color: '#6b21a8' };
      case 'HR': return { bg: '#dbeafe', color: '#1e40af' };
      case 'MANAGER': return { bg: '#d1fae5', color: '#065f46' };
      default: return { bg: '#f1f5f9', color: '#475569' };
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ color: 'var(--heading-color)', fontWeight: 'bold' }}>
        User Access Management
      </Typography>
      <Typography variant="body1" sx={{ mb: 4, color: '#666' }}>
        Manage system roles and assign custom permissions for all users.
      </Typography>

      <Box sx={{ display: 'flex', gap: 3, height: 'calc(100vh - 180px)', minHeight: '600px' }}>
        {/* Left Panel: User selection & Roles List */}
        <Paper sx={{ width: '340px', flexShrink: 0, p: 2, display: 'flex', flexDirection: 'column', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 'black', color: '#1e293b', fontSize: '15px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Users & Roles
            </Typography>
            <Button
              variant="contained"
              size="small"
              startIcon={<PersonAddIcon />}
              onClick={() => setCreateDialogOpen(true)}
              sx={{ bgcolor: '#3b82f6', textTransform: 'none', borderRadius: '8px', fontWeight: 'bold' }}
            >
              New
            </Button>
          </Box>

          <TextField
            fullWidth
            size="small"
            placeholder="Search employee..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
            InputProps={{
              startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1, fontSize: '20px' }} />
            }}
          />

          <Divider sx={{ mb: 2 }} />

          <Box sx={{ flexGrow: 1, overflowY: 'auto', '&::-webkit-scrollbar': { width: '6px' }, '&::-webkit-scrollbar-thumb': { backgroundColor: '#cbd5e1', borderRadius: '10px' } }}>
            <List disablePadding>
              {filteredUsers.map((user) => {
                const isSelected = selectedUser === user.id;
                const chipStyle = getRoleChipColor(user.role);
                return (
                  <ListItemButton
                    key={user.id}
                    selected={isSelected}
                    onClick={() => handleUserSelect(user)}
                    sx={{
                      borderRadius: '8px',
                      mb: 1,
                      border: isSelected ? '1px solid #bfdbfe' : '1px solid transparent',
                      '&.Mui-selected': {
                        bgcolor: '#eff6ff',
                        '&:hover': { bgcolor: '#dbeafe' }
                      }
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: '40px' }}>
                      <SupervisedUserCircleIcon sx={{ color: isSelected ? '#3b82f6' : '#94a3b8' }} />
                    </ListItemIcon>
                    <ListItemText
                      primary={user.ename || user.username}
                      secondary={user.ename ? user.username : 'System User'}
                      primaryTypographyProps={{ fontWeight: isSelected ? '800' : '600', fontSize: '13px', color: '#1e293b' }}
                      secondaryTypographyProps={{ fontSize: '11px', color: '#64748b' }}
                    />
                    <Chip
                      label={user.role || 'USER'}
                      size="small"
                      sx={{
                        fontSize: '9px',
                        fontWeight: '800',
                        backgroundColor: chipStyle.bg,
                        color: chipStyle.color,
                        borderRadius: '6px',
                        height: '20px'
                      }}
                    />
                  </ListItemButton>
                );
              })}
              {filteredUsers.length === 0 && (
                <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center', py: 4 }}>
                  No users found.
                </Typography>
              )}
            </List>
          </Box>
        </Paper>

        {/* Right Panel: Permissions configuration / User Access List */}
        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          {!selectedUser ? (
            <Paper sx={{ p: 4, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
              <Alert severity="info" sx={{ maxWidth: '400px', borderRadius: '8px' }}>
                Please select a user from the Left List to configure their user roles and module permissions.
              </Alert>
            </Paper>
          ) : (
            <Paper sx={{ p: 4, height: '100%', display: 'flex', flexDirection: 'column', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
              {/* Selected User Header */}
              <Box sx={{ display: 'flex', flexWrap: 'nowrap', justifyContent: 'space-between', alignItems: 'center', gap: 2, mb: 4 }}>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 'black', color: '#1e293b', letterSpacing: '-0.025em' }}>
                    Access Control: <span style={{ color: '#3b82f6' }}>{selectedUserObj?.ename || selectedUserObj?.username}</span>
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#64748b', fontWeight: '500', mt: 0.5 }}>
                    Configure system roles and granular module permissions.
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  onClick={handleSave}
                  disabled={loading}
                  sx={{ bgcolor: '#0f172a', '&:hover': { bgcolor: '#1e293b' }, height: '44px', px: 4, borderRadius: '8px', fontWeight: 'bold', textTransform: 'none' }}
                >
                  {loading ? 'Saving...' : 'Save Configuration'}
                </Button>
              </Box>

              {/* Role setting */}
              <Box sx={{ mb: 4, p: 3, bgcolor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: '800', mb: 2, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '12px' }}>
                  System Role Assignment
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth size="small">
                      <InputLabel id="role-label" sx={{ fontWeight: 'bold' }}>User Role</InputLabel>
                      <Select
                        labelId="role-label"
                        value={userRole}
                        label="User Role"
                        onChange={(e) => setUserRole(e.target.value)}
                        sx={{ bgcolor: 'white', borderRadius: '8px' }}
                      >
                        <MenuItem value="ADMIN"><span style={{ fontWeight: 'bold' }}>ADMIN</span> (Full Access)</MenuItem>
                        <MenuItem value="HR"><span style={{ fontWeight: 'bold' }}>HR</span> (HR Module Access)</MenuItem>
                        <MenuItem value="MANAGER"><span style={{ fontWeight: 'bold' }}>MANAGER</span> (Manager Dashboard)</MenuItem>
                        <MenuItem value="USER"><span style={{ fontWeight: 'bold' }}>EMPLOYEE</span> (Basic HR Access)</MenuItem>
                      </Select>
                    </FormControl>
                    {isSystemUser && (
                      <Alert severity="warning" sx={{ mt: 2, py: 0, borderRadius: '8px' }}>
                        System user (cannot access payroll/profile details).
                      </Alert>
                    )}
                  </Grid>
                </Grid>
              </Box>

              <Typography variant="subtitle2" sx={{ fontWeight: '800', mb: 2, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '12px' }}>
                Module-Level Permissions
              </Typography>

              {/* Scrollable permissions accordion tree */}
              <Box sx={{ flexGrow: 1, overflowY: 'auto', pr: 1, '&::-webkit-scrollbar': { width: '6px' }, '&::-webkit-scrollbar-thumb': { backgroundColor: '#cbd5e1', borderRadius: '10px' } }}>
                {Object.keys(PERMISSIONS).map((moduleKey) => (
                  <Accordion key={moduleKey} sx={{ mb: 1, borderRadius: '8px !important', '&:before': { display: 'none' }, border: '1px solid #e2e8f0', boxShadow: 'none' }}>
                    <AccordionSummary expandMoreIcon={<ExpandMoreIcon />} sx={{ bgcolor: '#f8fafc', borderRadius: '8px' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', pr: 2 }}>
                        <Typography sx={{ fontWeight: '800', flexGrow: 1, color: '#334155' }}>{moduleKey} Module</Typography>
                        <Button
                          size="small"
                          onClick={(e) => { e.stopPropagation(); handleSelectAllModule(moduleKey); }}
                          sx={{ color: '#3b82f6', fontSize: '11px', fontWeight: 'bold', textTransform: 'none' }}
                        >
                          Select / Deselect All
                        </Button>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails sx={{ p: 3, pt: 1 }}>
                      <Divider sx={{ mb: 2 }} />
                      <Grid container spacing={2}>
                        {PERMISSIONS[moduleKey].map((perm) => (
                          <Grid item xs={12} sm={6} md={4} key={perm.id}>
                            <FormControlLabel
                              control={
                                <Checkbox
                                  checked={userPermissions.includes(perm.id)}
                                  onChange={() => handlePermissionChange(perm.id)}
                                  size="small"
                                  sx={{ color: '#94a3b8', '&.Mui-checked': { color: '#3b82f6' } }}
                                />
                              }
                              label={
                                <Typography sx={{ fontSize: '13px', fontWeight: '600', color: '#475569' }}>
                                  {perm.label}
                                </Typography>
                              }
                            />
                          </Grid>
                        ))}
                      </Grid>
                    </AccordionDetails>
                  </Accordion>
                ))}
              </Box>
            </Paper>
          )}
        </Box>
      </Box>

      {/* Create User Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Create New User
          <IconButton onClick={() => setCreateDialogOpen(false)}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                Select user type:
              </Typography>
              <Grid container spacing={1}>
                <Grid item xs={6}>
                  <Button
                    variant={newUser.isSystemUser ? "contained" : "outlined"}
                    color="primary"
                    fullWidth
                    onClick={() => setNewUser({ ...newUser, isSystemUser: true, empid: '' })}
                    sx={{ py: 1.5 }}
                  >
                    System User
                  </Button>
                </Grid>
                <Grid item xs={6}>
                  <Button
                    variant={!newUser.isSystemUser ? "contained" : "outlined"}
                    color="primary"
                    fullWidth
                    onClick={() => setNewUser({ ...newUser, isSystemUser: false })}
                    sx={{ py: 1.5 }}
                  >
                    Employee User
                  </Button>
                </Grid>
              </Grid>
              <Alert severity="info" sx={{ mt: 1 }}>
                {newUser.isSystemUser
                  ? 'System users login with username only. They are NOT part of payroll/employee master.'
                  : 'Employee users login with username. Link their employee ID to view payroll details.'}
              </Alert>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                size="small"
                label="Username"
                value={newUser.username}
                onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                required
              />
            </Grid>
            {!newUser.isSystemUser && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  size="small"
                  label="Employee ID"
                  type="number"
                  value={newUser.empid}
                  onChange={(e) => setNewUser({ ...newUser, empid: e.target.value })}
                  placeholder="Enter Employee ID"
                />
              </Grid>
            )}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                label="Password"
                type="password"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                label="Confirm Password"
                type="password"
                value={newUser.confirmPassword}
                onChange={(e) => setNewUser({ ...newUser, confirmPassword: e.target.value })}
                required
                error={!!newUser.confirmPassword && newUser.password !== newUser.confirmPassword}
                helperText={!!newUser.confirmPassword && newUser.password !== newUser.confirmPassword ? 'Passwords do not match' : ''}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth size="small">
                <InputLabel>Default Role</InputLabel>
                <Select
                  value={newUser.role}
                  label="Default Role"
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                >
                  <MenuItem value="ADMIN">ADMIN (Full Access)</MenuItem>
                  <MenuItem value="HR">HR (HR Module Access)</MenuItem>
                  <MenuItem value="MANAGER">MANAGER (Manager Dashboard)</MenuItem>
                  <MenuItem value="USER">EMPLOYEE (Basic HR Access)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            {!newUser.isSystemUser && newUser.empid && (
              <Grid item xs={12}>
                <Chip label="Linked to Employee" color="success" size="small" icon={<PersonAddIcon />} />
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setCreateDialogOpen(false)} color="inherit">Cancel</Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleCreateUser}
            disabled={creating}
            startIcon={<AddIcon />}
          >
            {creating ? 'Creating...' : 'Create User'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserAccess;
