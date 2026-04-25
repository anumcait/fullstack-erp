import React, { useState } from 'react';
import { Grid, Paper, Typography, TextField, MenuItem, Box, Checkbox, FormControlLabel } from '@mui/material';

const states = ['Uttar Pradesh', 'Maharashtra', 'Bihar', 'Other'];

export default function AddressSectionControlledWidth() {
  const [commAddress, setCommAddress] = useState({
    street: '', city: '', state: '', phone: '', mobile: '', email: ''
  });
  const [permAddress, setPermAddress] = useState({
    street: '', city: '', state: '', phone: '', mobile: '', email: ''
  });
  const [sameAsComm, setSameAsComm] = useState(false);

  const handleCommChange = e => setCommAddress({...commAddress, [e.target.name]: e.target.value});
  const handlePermChange = e => !sameAsComm && setPermAddress({...permAddress, [e.target.name]: e.target.value});
  const toggleSame = e => {
    setSameAsComm(e.target.checked);
    if (e.target.checked) {
      setPermAddress(commAddress);
    }
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      <Grid container spacing={3} alignItems="center" justifyContent="center">

        {/* Communication Address */}
        <Grid
          item
          xs={12}
          md={4}
          sx={{ maxWidth: 400, width: '100%' }}  // Limit max width even on md+
        >
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Communication Address</Typography>
            <TextField name="street" label="Street" value={commAddress.street} onChange={handleCommChange} fullWidth size="small" margin="dense" />
            <TextField name="city" label="City" value={commAddress.city} onChange={handleCommChange} fullWidth size="small" margin="dense" />
            <TextField
              select
              name="state"
              label="State"
              value={commAddress.state}
              onChange={handleCommChange}
              fullWidth
              size="small"
              margin="dense"
            >
              <MenuItem value="">Select</MenuItem>
              {states.map(state => (
                <MenuItem key={state} value={state}>{state}</MenuItem>
              ))}
            </TextField>
            <TextField name="phone" label="Phone" value={commAddress.phone} onChange={handleCommChange} fullWidth size="small" margin="dense" />
            <TextField name="mobile" label="Mobile" value={commAddress.mobile} onChange={handleCommChange} fullWidth size="small" margin="dense" />
            <TextField name="email" label="Email" value={commAddress.email} onChange={handleCommChange} fullWidth size="small" margin="dense" />
          </Paper>
        </Grid>

        {/* Checkbox - centered */}
        <Grid
          item
          xs={12}
          md={1}
          sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', maxWidth: 150 }}
        >
          <FormControlLabel
            control={<Checkbox checked={sameAsComm} onChange={toggleSame} />}
            label="Same as Communication"
          />
        </Grid>

        {/* Permanent Address */}
        <Grid
          item
          xs={12}
          md={6}
          sx={{ maxWidth: 400, width: '100%' }}
        >
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Permanent Address</Typography>
            <TextField
              name="street"
              label="Street"
              value={permAddress.street}
              onChange={handlePermChange}
              fullWidth
              size="small"
              margin="dense"
              disabled={sameAsComm}
            />
            <TextField
              name="city"
              label="City"
              value={permAddress.city}
              onChange={handlePermChange}
              fullWidth
              size="small"
              margin="dense"
              disabled={sameAsComm}
            />
            <TextField
              select
              name="state"
              label="State"
              value={permAddress.state}
              onChange={handlePermChange}
              fullWidth
              size="small"
              margin="dense"
              disabled={sameAsComm}
            >
              <MenuItem value="">Select</MenuItem>
              {states.map(state => (
                <MenuItem key={state} value={state}>{state}</MenuItem>
              ))}
            </TextField>
            <TextField
              name="phone"
              label="Phone"
              value={permAddress.phone}
              onChange={handlePermChange}
              fullWidth
              size="small"
              margin="dense"
              disabled={sameAsComm}
            />
            <TextField
              name="mobile"
              label="Mobile"
              value={permAddress.mobile}
              onChange={handlePermChange}
              fullWidth
              size="small"
              margin="dense"
              disabled={sameAsComm}
            />
            <TextField
              name="email"
              label="Email"
              value={permAddress.email}
              onChange={handlePermChange}
              fullWidth
              size="small"
              margin="dense"
              disabled={sameAsComm}
            />
          </Paper>
        </Grid>

      </Grid>
    </Box>
  );
}
