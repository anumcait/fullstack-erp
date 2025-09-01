// import React, { useState } from 'react';
// import axios from 'axios';
// import './AddEmployee.css';

// const AddEmployeeForm = () => {
//   const [activeTab, setActiveTab] = useState("personal");
//   const [formData, setFormData] = useState({
//     empid: 1020,
//     emptype: '', uno: 0, divno: 0, deptno: 0, secno: 0, sex: '', marital_status: '',
//     ename: '', fname: '', dob: new Date().toISOString().slice(0, 10), pob: '', bgroup: '', mother_toungue: '', idfm1: '', idfm2: '',
//     lang_known: '', cadd_sa: '', cadd_city: '', cadd_state: '', cadd_phone: '', cadd_mobile: '',
//     cadd_pin: '', cadd_email: '', padd_sa: '', padd_city: '', padd_state: '', padd_phone: '',
//     padd_mobile: '', padd_pin: '', padd_email: '', uname: '', divname: '', deptname: '', secname: '',
//     sameAsComm: false, created_by: 'admin', created: new Date().toISOString().slice(0, 10)
//   });

//   const [familyDetails, setFamilyDetails] = useState([]);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData({ ...formData, [name]: value });
//   };

//   const handleFamilyChange = (index, field, value) => {
//     const updated = [...familyDetails];
//     updated[index][field] = value;
//     setFamilyDetails(updated);
//   };

//   const addFamilyRow = () => {
//     setFamilyDetails([...familyDetails, { name: '', relation: '', age: '', occupation: '' }]);
//   };

//   const handleCheckboxChange = (e) => {
//     const checked = e.target.checked;
//     if (checked) {
//       setFormData(prev => ({
//         ...prev,
//         sameAsComm: true,
//         padd_sa: prev.cadd_sa,
//         padd_city: prev.cadd_city,
//         padd_state: prev.cadd_state,
//         padd_phone: prev.cadd_phone,
//         padd_mobile: prev.cadd_mobile,
//         padd_pin: prev.cadd_pin,
//         padd_email: prev.cadd_email
//       }));
//     } else {
//       setFormData(prev => ({
//         ...prev,
//         sameAsComm: false,
//         padd_sa: '', padd_city: '', padd_state: '', padd_phone: '', padd_mobile: '', padd_pin: '', padd_email: ''
//       }));
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     try {
//       const payload = { ...formData, familyDetails };
//       await axios.post('http://localhost:5000/api/employees/add-employee', payload, {
//         headers: { 'Content-Type': 'application/json' }
//       });
//       alert('Employee and family details added successfully.');
//     } catch (error) {
//       console.error('Error submitting form:', error);
//       alert('Error submitting form.');
//     }
//   };

//   return (
//     <div className="employee-master-container">
//       <div className="tab-container">
//         <button className={`tab-button ${activeTab === 'personal' ? 'active' : ''}`} onClick={() => setActiveTab('personal')}>Personal</button>
//         <button className={`tab-button ${activeTab === 'family' ? 'active' : ''}`} onClick={() => setActiveTab('family')}>Family</button>
//       </div>

//       <form onSubmit={handleSubmit}>
        // {activeTab === 'personal' && (
        //   <div className="issue-section">
        //     <div className="issue-header">Add Employee</div>
        //     <div className="form-row">
        //       <input type="number" name="empid" value={formData.empid} onChange={handleChange} placeholder="Employee ID" />
        //       <input type="text" name="ename" value={formData.ename} onChange={handleChange} placeholder="Employee Name" />
        //       <input type="text" name="emptype" value={formData.emptype} onChange={handleChange} placeholder="Employee Type" />
        //       <input type="number" name="uno" value={formData.uno} onChange={handleChange} placeholder="UNO" />
        //       <input type="number" name="divno" value={formData.divno} onChange={handleChange} placeholder="Division No" />
        //     </div>
        //     {/* Other rows ... */}
        //     <div className="address-section">
        //       <h3>Address Details</h3>
        //       <div className="address-grid">
        //         <div className="address-block">
        //           <h4>Communication Address</h4>
        //           <input type="text" name="cadd_sa" placeholder="Street" value={formData.cadd_sa} onChange={handleChange} />
        //           <input type="text" name="cadd_city" placeholder="City" value={formData.cadd_city} onChange={handleChange} />
        //           <input type="text" name="cadd_state" placeholder="State" value={formData.cadd_state} onChange={handleChange} />
        //           <input type="text" name="cadd_phone" placeholder="Phone" value={formData.cadd_phone} onChange={handleChange} />
        //           <input type="text" name="cadd_mobile" placeholder="Mobile" value={formData.cadd_mobile} onChange={handleChange} />
        //           <input type="text" name="cadd_pin" placeholder="PIN" value={formData.cadd_pin} onChange={handleChange} />
        //           <input type="email" name="cadd_email" placeholder="Email" value={formData.cadd_email} onChange={handleChange} />
        //         </div>

        //         <div className="address-checkbox">
        //           <label>
        //             <input type="checkbox" checked={formData.sameAsComm} onChange={handleCheckboxChange} />
        //             Same as Communication Address
        //           </label>
        //         </div>

        //         <div className="address-block">
        //           <h4>Permanent Address</h4>
        //           <input type="text" name="padd_sa" placeholder="Street" value={formData.padd_sa} onChange={handleChange} />
        //           <input type="text" name="padd_city" placeholder="City" value={formData.padd_city} onChange={handleChange} />
        //           <input type="text" name="padd_state" placeholder="State" value={formData.padd_state} onChange={handleChange} />
        //           <input type="text" name="padd_phone" placeholder="Phone" value={formData.padd_phone} onChange={handleChange} />
        //           <input type="text" name="padd_mobile" placeholder="Mobile" value={formData.padd_mobile} onChange={handleChange} />
        //           <input type="text" name="padd_pin" placeholder="PIN" value={formData.padd_pin} onChange={handleChange} />
        //           <input type="email" name="padd_email" placeholder="Email" value={formData.padd_email} onChange={handleChange} />
        //         </div>
        //       </div>
        //     </div>
        //   </div>
//         )}

//         {activeTab === 'family' && (
//           <div className="issue-section">
//             <div className="issue-header">Family Details</div>
//             {familyDetails.map((member, index) => (
//               <div key={index} className="form-row">
//                 <input type="text" placeholder="Name" value={member.name} onChange={(e) => handleFamilyChange(index, 'name', e.target.value)} />
//                 <input type="text" placeholder="Relation" value={member.relation} onChange={(e) => handleFamilyChange(index, 'relation', e.target.value)} />
//                 <input type="number" placeholder="Age" value={member.age} onChange={(e) => handleFamilyChange(index, 'age', e.target.value)} />
//                 <input type="text" placeholder="Occupation" value={member.occupation} onChange={(e) => handleFamilyChange(index, 'occupation', e.target.value)} />
//               </div>
//             ))}
//             <button type="button" className="go-btn" onClick={addFamilyRow}>+ Add Row</button>
//           </div>
//         )}

//         <div className="form-row">
//           <button type="submit" className="go-btn">Save</button>
//         </div>
//       </form>
//     </div>
//   );
// };

// export default AddEmployeeForm;

import React, { useState, useEffect } from 'react';
import {
  Box, Grid, Paper, Button, Tabs, Tab, TextField, MenuItem,
  Checkbox, FormControlLabel, Typography, IconButton, Divider
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import './AddEmployee.css';

const tabLabels = [
  "General", "Family", "Education", "Experience", "Salary", "Official", "Extra"
];

const states = ['Uttar Pradesh', 'Maharashtra', 'Bihar', 'Other'];
const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

const initAddress = {
  street: '', city: '', state: '', pin: '',
  phone: '', mobile: '', email: '',
};

export default function AddEmployee() {
  const [tabIndex, setTabIndex] = useState(0);
  const [commAddress, setCommAddress] = useState(initAddress);
  const [permAddress, setPermAddress] = useState(initAddress);
  const [sameAsComm, setSameAsComm] = useState(false);

  useEffect(() => {
    if (sameAsComm) setPermAddress(commAddress);
  }, [sameAsComm, commAddress]);

  const handleCommChange = (key, value) =>
    setCommAddress(prev => ({ ...prev, [key]: value }));

  const handlePermChange = (key, value) => {
    if (!sameAsComm) setPermAddress(prev => ({ ...prev, [key]: value }));
  };

  return (
    <Box className="employee-container">
      {/* Header */}
      <div className="employee-header">
        <div className="employee-title">
          <MenuIcon className="menu-icon" />
          <h2>Edit Employee</h2>
        </div>
        <div className="employee-actions">
          <Button variant="contained" color="primary" size="small">Save</Button>
          <Button variant="outlined" color="secondary" size="small" style={{ marginLeft: '8px' }}>Cancel</Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        value={tabIndex}
        onChange={(_, newValue) => setTabIndex(newValue)}
        variant="scrollable"
        scrollButtons="auto"
        className="employee-tabs"
      >
        {tabLabels.map((label, idx) => (
          <Tab key={idx} label={label} className="tab-label" />
        ))}
      </Tabs>

      <Paper elevation={1} className="employee-form" style={{ padding: 16, marginTop: 12 }}>
        {tabIndex === 0 && (
          <>
            {/* Personal Info */}
            <Grid container spacing={1}>
              <Grid item xs={12} md={9}>
                <Grid container spacing={1}>
                  <Grid item xs={12} md={4}><TextField fullWidth size="small" label="Name" /></Grid>
                  <Grid item xs={12} md={4}><TextField fullWidth size="small" label="Unit" /></Grid>
                  <Grid item xs={12} md={4}><TextField fullWidth size="small" label="Division" /></Grid>
                  <Grid item xs={12} md={4}><TextField fullWidth size="small" label="Section" /></Grid>
                  <Grid item xs={12} md={4}>
                    <TextField fullWidth size="small" label="Gender" select>
                      <MenuItem value="">Select</MenuItem>
                      <MenuItem value="Male">Male</MenuItem>
                      <MenuItem value="Female">Female</MenuItem>
                    </TextField>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField fullWidth size="small" label="Date of Birth" type="date" InputLabelProps={{ shrink: true }} />
                  </Grid>
                  <Grid item xs={12} md={4}><TextField fullWidth size="small" label="Father/Husband Name" /></Grid>
                  <Grid item xs={12} md={4}>
                    <TextField fullWidth size="small" label="Blood Group" select>
                      <MenuItem value="">Select</MenuItem>
                      {bloodGroups.map(bg => <MenuItem key={bg} value={bg}>{bg}</MenuItem>)}
                    </TextField>
                  </Grid>
                  <Grid item xs={12} md={4}><TextField fullWidth size="small" label="Id Marks 1" /></Grid>
                  <Grid item xs={12} md={4}><TextField fullWidth size="small" label="Id Marks 2" /></Grid>
                </Grid>
              </Grid>

              <Grid item xs={12} md={3}>
                <Grid container spacing={1}>
                  <Grid item xs={12}><TextField fullWidth size="small" label="Department" /></Grid>
                  <Grid item xs={12}><TextField fullWidth size="small" label="Place of Birth" /></Grid>
                  <Grid item xs={12}><TextField fullWidth size="small" label="Languages Known" /></Grid>
                  <Grid item xs={12}><TextField fullWidth size="small" label="Marital Status" select>
                    <MenuItem value="Single">Single</MenuItem>
                    <MenuItem value="Married">Married</MenuItem>
                  </TextField></Grid>
                </Grid>
              </Grid>
            </Grid>

            {/* Address Section */}
            <Grid container spacing={2} sx={{ marginTop: 2 }}>
              {/* Communication Address */}
              <Grid item xs={12} md={5.8}>
                <Paper className="address-section" elevation={0}>
                  <Typography className="addr-title">Communication Address</Typography>
                  <TextField fullWidth multiline rows={2} label="Street" value={commAddress.street}
                    onChange={e => handleCommChange('street', e.target.value)} size="small" />
                  <Grid container spacing={1}>
                    <Grid item xs={6}><TextField fullWidth label="City" size="small" value={commAddress.city}
                      onChange={e => handleCommChange('city', e.target.value)} /></Grid>
                    <Grid item xs={6}><TextField fullWidth label="State" select size="small" value={commAddress.state}
                      onChange={e => handleCommChange('state', e.target.value)}>
                      <MenuItem value="">Select</MenuItem>
                      {states.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                    </TextField></Grid>
                    <Grid item xs={6}><TextField fullWidth label="Pincode" size="small" value={commAddress.pin}
                      onChange={e => handleCommChange('pin', e.target.value)} /></Grid>
                    <Grid item xs={6}><TextField fullWidth label="Phone" size="small" value={commAddress.phone}
                      onChange={e => handleCommChange('phone', e.target.value)} /></Grid>
                    <Grid item xs={6}><TextField fullWidth label="Mobile" size="small" value={commAddress.mobile}
                      onChange={e => handleCommChange('mobile', e.target.value)} /></Grid>
                    <Grid item xs={6}><TextField fullWidth label="Email" size="small" value={commAddress.email}
                      onChange={e => handleCommChange('email', e.target.value)} /></Grid>
                  </Grid>
                </Paper>
              </Grid>

              {/* Checkbox */}
              <Grid item xs={12} md={0.4} display="flex" justifyContent="center" alignItems="center">
                <FormControlLabel control={<Checkbox checked={sameAsComm}
                  onChange={e => setSameAsComm(e.target.checked)} />} label="Same" />
              </Grid>

              {/* Permanent Address */}
              <Grid item xs={12} md={5.8}>
                <Paper className="address-section" elevation={0}>
                  <Typography className="addr-title">Permanent Address</Typography>
                  <TextField fullWidth multiline rows={2} label="Street" value={permAddress.street}
                    onChange={e => handlePermChange('street', e.target.value)} size="small" disabled={sameAsComm} />
                  <Grid container spacing={1}>
                    <Grid item xs={6}><TextField fullWidth label="City" size="small" value={permAddress.city}
                      onChange={e => handlePermChange('city', e.target.value)} disabled={sameAsComm} /></Grid>
                    <Grid item xs={6}><TextField fullWidth label="State" select size="small" value={permAddress.state}
                      onChange={e => handlePermChange('state', e.target.value)} disabled={sameAsComm}>
                      <MenuItem value="">Select</MenuItem>
                      {states.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                    </TextField></Grid>
                    <Grid item xs={6}><TextField fullWidth label="Pincode" size="small" value={permAddress.pin}
                      onChange={e => handlePermChange('pin', e.target.value)} disabled={sameAsComm} /></Grid>
                    <Grid item xs={6}><TextField fullWidth label="Phone" size="small" value={permAddress.phone}
                      onChange={e => handlePermChange('phone', e.target.value)} disabled={sameAsComm} /></Grid>
                    <Grid item xs={6}><TextField fullWidth label="Mobile" size="small" value={permAddress.mobile}
                      onChange={e => handlePermChange('mobile', e.target.value)} disabled={sameAsComm} /></Grid>
                    <Grid item xs={6}><TextField fullWidth label="Email" size="small" value={permAddress.email}
                      onChange={e => handlePermChange('email', e.target.value)} disabled={sameAsComm} /></Grid>
                  </Grid>
                </Paper>
              </Grid>
            </Grid>
          </>
        )}

        {/* Other Tabs */}
        {tabIndex !== 0 && (
          <Box mt={2}>
            <Typography variant="h6">{tabLabels[tabIndex]} Section</Typography>
            {/* Placeholder for sub-tabs or component injection */}
          </Box>
        )}
      </Paper>
    </Box>
  );
}


// import React from 'react';
// import Grid from '@mui/material/Grid';
// import Paper from '@mui/material/Paper'; // Optional: for visual separation

// function AddEmployee() {
//   return (
//     <Grid container spacing={2}> {/* spacing prop adds space between items */}
//       <Grid item xs={12} sm={6} md={4}> {/* Responsive sizing: full width on extra small, half on small, third on medium and up */}
//         <Paper style={{ padding: 16, textAlign: 'center' }}>Column 1</Paper>
//       </Grid>
//       <Grid item xs={12} sm={6} md={4}>
//         <Paper style={{ padding: 16, textAlign: 'center' }}>Column 2</Paper>
//       </Grid>
//       <Grid item xs={12} sm={6} md={4}>
//         <Paper style={{ padding: 16, textAlign: 'center' }}>Column 3</Paper>
//       </Grid>
//     </Grid>
//   );
// }

// export default AddEmployee;