import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Grid, Button, Tabs, Tab, TextField, MenuItem,
  Checkbox, FormControlLabel, Typography, IconButton, Divider, Avatar
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import { useToast } from '../../context/ToastContext';
import axios from 'axios';

axios.defaults.baseURL = import.meta.env.VITE_API_URL;

const states = ['Uttar Pradesh', 'Maharashtra', 'Bihar', 'Other'];
const maritalStatuses = ['Single', 'Married', 'Divorced', 'Widowed'];
const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
const empTypes = ['Permanent', 'Contract'];

const departments = ['HR', 'Engineering', 'Marketing', 'Sales', 'Finance'];
const designations = ['Manager', 'Developer', 'Designer', 'Analyst', 'Tester'];
const employmentTypes = ['Permanent', 'Contract', 'Intern'];

const tabLabels = [
  'Personal', 'Address', 'Family', 'Qualification', 'Experience',
  'Promotion', 'Training', 'Awards', 'Disciplinary Actions',
  'Salary', 'Increment', 'Canteen', 'LIC', 'Transfer','Official'
];

// Initial State Templates
const initAddress = {
  street: '', city: '', state: '', pin: '', phone: '', mobile: '', email: ''
};
const initFamily = { name: '', relation: '', age: '', occupation: '' };
const initQual = { degree: '', discipline: '', year: '', institution: '' };
const initExp = { org: '', from: '', to: '', designation: '', remarks: '' };
const initPromo = { from: '', to: '', date: '', remarks: '' };
const initTraining = { name: '', institution: '', from: '', to: '', remarks: '' };
const initAward = { name: '', year: '', by: '', remarks: '' };
const initDisc = { action: '', reason: '', date: '', remarks: '' };

const initSalary = { basic: '', da: '', hra: '', gross: '', deduction: '', net: '' };
const initIncrement = { date: '', amount: '', remarks: '' };
const initCanteen = { cardno: '', from: '', to: '' };
const initLIC = { policyno: '', sum: '', nominee: '' };
const initTransfer = { from: '', to: '', date: '', remarks: '' };
const initOfficial = { employeeId: '',  aadhar: '',  pan: '',  dateOfJoining: '',  department: '',  designation: '',  employmentType: '',
  officialEmail: '',  location: ''
};

export default function AddEmployee() {
  // Main State
  const [tabIndex, setTabIndex] = useState(0);
  const { showToast } = useToast();

  // Personal
 const [formData, setFormData] = useState({
  empid: '', ename: '', fname: '', dob: '', sex: '', marital_status: '',
  emptype: '', divname: '', deptname: '', secname: '',
  pob: '', bgroup: '', mother_tounge: '', idfm1: '', idfm2: '',
  lang_known: '',
  commAddress: {
    street: '', city: '', state: '', phone: '', mobile: '', email: ''
  },
  permAddress: {
    street: '', city: '', state: '', phone: '', mobile: '', email: ''
  },
  sameAsComm: false
});
  const [commAddress, setCommAddress] = useState({
  street: '',
  city: '',
  state: '',
  phone: '',
  mobile: '',
  email: '',
});
  const [permAddress, setPermAddress] = useState({
  street: '',
  city: '',
  state: '',
  phone: '',
  mobile: '',
  email: '',
});
const [sameAsComm, setSameAsComm] = useState(false);

const handleChange = (e) => {
  const { name, value } = e.target;
  setFormData(prev => ({
    ...prev,
    [name]: value
  }));
};

const handleCommChange = (e) => {
  const { name, value } = e.target;
  setFormData(prev => ({
    ...prev,
    commAddress: {
      ...prev.commAddress,
      [name]: value
    }
  }));

  // If sameAsComm is checked, also update permAddress
  if (formData.sameAsComm) {
    setFormData(prev => ({
      ...prev,
      permAddress: {
        ...prev.commAddress,
        [name]: value
      }
    }));
  }
};

const handlePermChange = (e) => {
  if (!formData.sameAsComm) {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      permAddress: {
        ...prev.permAddress,
        [name]: value
      }
    }));
  }
};

const toggleSame = (e) => {
  const checked = e.target.checked;
  setFormData(prev => ({
    ...prev,
    sameAsComm: checked,
    permAddress: checked ? { ...prev.commAddress } : { street: '', city: '', state: '', phone: '', mobile: '', email: '' }
  }));
};

  const handleOfficialChange = e => {
  const { name, value } = e.target;
  setOfficialDetails(prev => ({ ...prev, [name]: value }));
};

  // useEffect(() => { if (sameAsComm) setPermAddress(commAddress); }, [sameAsComm, commAddress]);
useEffect(() => {
  if (formData.sameAsComm) {
    setFormData(prev => ({
      ...prev,
      permAddress: { ...prev.commAddress }
    }));
  }
}, [formData.sameAsComm, formData.commAddress]);

  // Other tabs - as dynamic row arrays
  const [familyDetails, setFamilyDetails] = useState([ {...initFamily} ]);
  const [qualDetails, setQualDetails] = useState([ {...initQual} ]);
  const [expDetails, setExpDetails] = useState([ {...initExp} ]);
  const [promotionDetails, setPromotionDetails] = useState([ {...initPromo} ]);
  const [trainingDetails, setTrainingDetails] = useState([ {...initTraining} ]);
  const [awardDetails, setAwardDetails] = useState([ {...initAward} ]);
  const [discDetails, setDiscDetails] = useState([ {...initDisc} ]);
  const [salaryDetails, setSalaryDetails] = useState({...initSalary});
  const [incrementDetails, setIncrementDetails] = useState([ {...initIncrement} ]);
  const [canteenDetails, setCanteenDetails] = useState({...initCanteen});
  const [licDetails, setLICDetails] = useState({...initLIC});
  const [transferDetails, setTransferDetails] = useState([ {...initTransfer} ]);
  const [officialDetails, setOfficialDetails] = useState([ {...initOfficial} ]);

//Photo

 const [photoPreview, setPhotoPreview] = useState(null);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoPreview(URL.createObjectURL(file));
    }
  };


  // Handlers
  const handleFDChange = e => {
    const {name, value} = e.target;
    setFormData(f => ({...f, [name]: value}));
  };


  // Dynamic array tab generic handler
  function genArrHandlers(details, setDetails, keys) {
    return {
      handleChange: (idx, key, val) => setDetails(prev => prev.map((row, i) =>
        i === idx ? {...row, [key]: val} : row)),
      addRow: () => setDetails(prev => ([...prev, keys])),
    };
  }
  const famHandlers = genArrHandlers(familyDetails, setFamilyDetails, {...initFamily});
  const qualHandlers = genArrHandlers(qualDetails, setQualDetails, {...initQual});
  const expHandlers = genArrHandlers(expDetails, setExpDetails, {...initExp});
  const promoHandlers = genArrHandlers(promotionDetails, setPromotionDetails, {...initPromo});
  const trainHandlers = genArrHandlers(trainingDetails, setTrainingDetails, {...initTraining});
  const awardHandlers = genArrHandlers(awardDetails, setAwardDetails, {...initAward});
  const discHandlers = genArrHandlers(discDetails, setDiscDetails, {...initDisc});
  const incrHandlers = genArrHandlers(incrementDetails, setIncrementDetails, {...initIncrement});
  const transfHandlers = genArrHandlers(transferDetails, setTransferDetails, {...initTransfer});
  

  // For singular detail objects (salary, canteen, etc.)
  const handleObjChange = (setter) => e => {
    const {name, value} = e.target;
    setter(prev => ({...prev, [name]: value}));
  };

const validateForm = () => {
  // Example validation - check required fields in formData
  if (!formData.empid || !formData.ename) {
    alert('Employee ID and Name are required.');
    return false;
  }
  // Add other validations as needed
  return true;
};
  // SUBMIT!
 const handleSubmit = async (e) => {
  e.preventDefault();

  // Destructure personal fields and nested addresses from formData
  const {
    empid, ename, fname, dob, sex, marital_status, emptype,
    divname, deptname, secname, pob, bgroup, mother_tounge,
    idfm1, idfm2, lang_known, commAddress, permAddress, sameAsComm
  } = formData;

  const payload = {
    ...formData,
    commAddress,
    permAddress,
    sameAsComm,
    // Include other details like familyDetails, qualDetails if needed here
  };
//const payload = { ...formData };
// console.log(formData);
//    const payload = {
//      personal:formData,
    // commAddress,
    // permAddress,
    // sameAsComm,
    // familyDetails,
    // qualDetails,
    // expDetails,
    // promotionDetails,
    // trainingDetails,
    // awardDetails,
    // discDetails,
    // salaryDetails,
    // incrementDetails,
    // canteenDetails,
    // licDetails,
    // transferDetails,
    // officialDetails,
   //};

  const resetForm = () => {
  setFormData({
    empid: '',
    ename: '',
    fname: '',
    dob: '',
    sex: '',
    marital_status: '',
    emptype: '',
    divname: '', deptname: '', secname: '',
    pob: '', bgroup: '', mother_tounge: '', idfm1: '', idfm2: '',
    lang_known: ''
    // ... other personal fields
  });

  setCommAddress({
    address: '',
    city: '',
    state: '',
    zip: ''
    // ... other comm address fields
  });

  setPermAddress({
    address: '',
    city: '',
    state: '',
    zip: ''
    // ... other perm address fields
  });

  setSameAsComm(false);

  setFamilyDetails([]); // Clear all family members grid
  setQualDetails([]);   // Clear qualifications
  setExpDetails([]);    // Clear experiences
  setPromotionDetails([]);
  setTrainingDetails([]);
  setAwardDetails([]);
  setDiscDetails([]);
  setSalaryDetails([]);
  setIncrementDetails([]);
  setCanteenDetails([]);
  setLICDetails([]);
  setTransferDetails([]);
  setOfficialDetails([]);
};

  if (!validateForm()) return;

console.log("📦 Payload JSON string:", JSON.stringify(payload));
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/employees/add-employee`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (res.ok) {
      showToast('Employee saved successfully!', 'success');
      resetForm(); // Clear form or refresh UI
    } else {
      console.log('Data here is ',data);
      throw new Error(data.message || 'Failed to save employee');
    }
  } catch (error) {

    console.error('Save failed:', error);
    showToast('Error saving employee!', 'error');
  }
};


  // Tabs content
  function renderTabContent() {
    
    switch(tabIndex) {
      case 0: // Personal
        return (
           <>
  <Grid container spacing={2}>
    {/* Personal Fields */}
    <Grid item xs={12} md={3}>
      <TextField label="Employee ID" name="empid" size="small" fullWidth value={formData.empid} onChange={handleFDChange} />
    </Grid>
    <Grid item xs={12} md={3}>
      <TextField label="Name" name="ename" size="small" fullWidth value={formData.ename} onChange={handleFDChange} />
    </Grid>
    <Grid item xs={12} md={3}>
      <TextField label="Father/Husband Name" name="fname" size="small" fullWidth value={formData.fname} onChange={handleFDChange} />
    </Grid>
    <Grid item xs={12} md={3}>
      <TextField select label="Employee Type" name="emptype" size="small" fullWidth value={formData.emptype} onChange={handleFDChange}>
        <MenuItem value="">Select</MenuItem>
        {empTypes.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
      </TextField>
    </Grid>
    <Grid item xs={12} md={3}>
      <TextField select label="Gender" name="sex" size="small" fullWidth value={formData.sex} onChange={handleFDChange}>
        <MenuItem value="">Select</MenuItem>
        <MenuItem value="M">Male</MenuItem>
        <MenuItem value="F">Female</MenuItem>
      </TextField>
    </Grid>
    <Grid item xs={12} md={3}>
      <TextField label="Date of Birth" name="dob" size="small" fullWidth type="date" InputLabelProps={{ shrink: true }} value={formData.dob} onChange={handleFDChange} />
    </Grid>
    <Grid item xs={12} md={3}>
      <TextField select label="Marital Status" name="marital_status" size="small" fullWidth value={formData.marital_status} onChange={handleFDChange}>
        <MenuItem value="">Select</MenuItem>
        {maritalStatuses.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
      </TextField>
    </Grid>
    <Grid item xs={12} md={3}>
      <TextField select label="Blood Group" name="bgroup" size="small" fullWidth value={formData.bgroup} onChange={handleFDChange}>
        <MenuItem value="">Select</MenuItem>
        {bloodGroups.map(bg => <MenuItem value={bg} key={bg}>{bg}</MenuItem>)}
      </TextField>
    </Grid>
    <Grid item xs={12} md={3}>
      <TextField label="Place of Birth" name="pob" size="small" fullWidth value={formData.pob} onChange={handleFDChange} />
    </Grid>
    <Grid item xs={12} md={3}>
      <TextField label="Mother Tongue" name="mother_tounge" size="small" fullWidth value={formData.mother_tounge} onChange={handleFDChange} />
    </Grid>
    <Grid item xs={12} md={3}>
      <TextField label="Languages Known" name="lang_known" size="small" fullWidth value={formData.lang_known} onChange={handleFDChange} />
    </Grid>
    <Grid item xs={12} md={3}>
      <TextField label="ID Mark 1" name="idfm1" size="small" fullWidth value={formData.idfm1} onChange={handleFDChange} />
    </Grid>
    <Grid item xs={12} md={3}>
      <TextField label="ID Mark 2" name="idfm2" size="small" fullWidth value={formData.idfm2} onChange={handleFDChange} />
    </Grid>
  </Grid>

  <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
    <Grid container spacing={3} alignItems="center" justifyContent="center">

      {/* Communication Address */}
      <Grid item xs={12} md={4} sx={{ maxWidth: 400, width: '100%' }}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>Communication Address</Typography>
          <TextField name="street" label="Street" value={formData.commAddress.street} onChange={handleCommChange} fullWidth size="small" margin="dense" />
          <TextField name="city" label="City" value={formData.commAddress.city} onChange={handleCommChange} fullWidth size="small" margin="dense" />
          <TextField select name="state" label="State" value={formData.commAddress.state} onChange={handleCommChange} fullWidth size="small" margin="dense">
            <MenuItem value="">Select</MenuItem>
            {states.map(state => (
              <MenuItem key={state} value={state}>{state}</MenuItem>
            ))}
          </TextField>
          <TextField name="phone" label="Phone" value={formData.commAddress.phone} onChange={handleCommChange} fullWidth size="small" margin="dense" />
          <TextField name="mobile" label="Mobile" value={formData.commAddress.mobile} onChange={handleCommChange} fullWidth size="small" margin="dense" />
          <TextField name="email" label="Email" value={formData.commAddress.email} onChange={handleCommChange} fullWidth size="small" margin="dense" />
        </Paper>
      </Grid>

      {/* Checkbox - centered */}
      <Grid item xs={12} md={1} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', maxWidth: 150 }}>
        <FormControlLabel
          control={<Checkbox checked={formData.sameAsComm} onChange={toggleSame} />}
          label="Same as Communication"
        />
      </Grid>

      {/* Permanent Address */}
      <Grid item xs={12} md={6} sx={{ maxWidth: 400, width: '100%' }}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>Permanent Address</Typography>
          <TextField name="street" label="Street" value={formData.permAddress.street} onChange={handlePermChange} fullWidth size="small" margin="dense" disabled={formData.sameAsComm} />
          <TextField name="city" label="City" value={formData.permAddress.city} onChange={handlePermChange} fullWidth size="small" margin="dense" disabled={formData.sameAsComm} />
          <TextField select name="state" label="State" value={formData.permAddress.state} onChange={handlePermChange} fullWidth size="small" margin="dense" disabled={formData.sameAsComm}>
            <MenuItem value="">Select</MenuItem>
            {states.map(state => (
              <MenuItem key={state} value={state}>{state}</MenuItem>
            ))}
          </TextField>
          <TextField name="phone" label="Phone" value={formData.permAddress.phone} onChange={handlePermChange} fullWidth size="small" margin="dense" disabled={formData.sameAsComm} />
          <TextField name="mobile" label="Mobile" value={formData.permAddress.mobile} onChange={handlePermChange} fullWidth size="small" margin="dense" disabled={formData.sameAsComm} />
          <TextField name="email" label="Email" value={formData.permAddress.email} onChange={handlePermChange} fullWidth size="small" margin="dense" disabled={formData.sameAsComm} />
        </Paper>
      </Grid>

    </Grid>
  </Box>
</>

        );
      // case 1: // Address
      //   return (
         

      //   );
      case 2: // Family
        return (
          <Box>
            <Typography fontWeight={600} fontSize={17} mb={2}>Family Details</Typography>
            {familyDetails.map((mem, idx) => (
                <Grid container spacing={1} key={idx} sx={{mb:1}}>
                  <Grid item xs={12} md={3}><TextField size="small" label="Name" value={mem.name} fullWidth onChange={e=>famHandlers.handleChange(idx,'name',e.target.value)} /></Grid>
                  <Grid item xs={12} md={3}><TextField size="small" label="Relation" value={mem.relation} fullWidth onChange={e=>famHandlers.handleChange(idx,'relation',e.target.value)} /></Grid>
                  <Grid item xs={12} md={2}><TextField size="small" label="Age" type="number" value={mem.age} fullWidth onChange={e=>famHandlers.handleChange(idx,'age',e.target.value)} /></Grid>
                  <Grid item xs={12} md={3}><TextField size="small" label="Occupation" value={mem.occupation} fullWidth onChange={e=>famHandlers.handleChange(idx,'occupation',e.target.value)} /></Grid>
                </Grid>
            ))}
            <Button variant="outlined" size="small" onClick={famHandlers.addRow} startIcon={<AddIcon/>}>Add Row</Button>
          </Box>
        );
      case 3: // Qualification
        return (
          <Box>
            <Typography fontWeight={600} fontSize={17} mb={2}>Qualification Details</Typography>
            {qualDetails.map((q, idx)=>(
              <Grid container spacing={1} key={idx} sx={{mb:1}}>
                <Grid item xs={12} md={3}><TextField label="Degree" size="small" value={q.degree} fullWidth onChange={e=>qualHandlers.handleChange(idx,'degree',e.target.value)} /></Grid>
                <Grid item xs={12} md={3}><TextField label="Discipline" size="small" value={q.discipline} fullWidth onChange={e=>qualHandlers.handleChange(idx,'discipline',e.target.value)} /></Grid>
                <Grid item xs={12} md={2}><TextField label="Year" size="small" type="number" value={q.year} fullWidth onChange={e=>qualHandlers.handleChange(idx,'year',e.target.value)}/></Grid>
                <Grid item xs={12} md={4}><TextField label="Institution" size="small" value={q.institution} fullWidth onChange={e=>qualHandlers.handleChange(idx,'institution',e.target.value)} /></Grid>
              </Grid>
            ))}
            <Button variant="outlined" size="small" onClick={qualHandlers.addRow} startIcon={<AddIcon/>}>Add Row</Button>
          </Box>
        );
      case 4: // Experience
        return (
          <Box>
            <Typography fontWeight={600} fontSize={17} mb={2}>Experience Details</Typography>
            {expDetails.map((exp, idx)=>(
              <Grid container spacing={1} key={idx} sx={{mb:1}}>
                <Grid item xs={12} md={3}><TextField label="Organization" size="small" value={exp.org} fullWidth onChange={e=>expHandlers.handleChange(idx,'org',e.target.value)}/></Grid>
                <Grid item xs={12} md={2}><TextField label="From" size="small" value={exp.from} type="date" InputLabelProps={{shrink:true}} fullWidth onChange={e=>expHandlers.handleChange(idx,'from',e.target.value)}/></Grid>
                <Grid item xs={12} md={2}><TextField label="To" size="small" value={exp.to} type="date" InputLabelProps={{shrink:true}} fullWidth onChange={e=>expHandlers.handleChange(idx,'to',e.target.value)}/></Grid>
                <Grid item xs={12} md={3}><TextField label="Designation" size="small" value={exp.designation} fullWidth onChange={e=>expHandlers.handleChange(idx,'designation',e.target.value)}/></Grid>
                <Grid item xs={12} md={2}><TextField label="Remarks" size="small" value={exp.remarks} fullWidth onChange={e=>expHandlers.handleChange(idx,'remarks',e.target.value)}/></Grid>
              </Grid>
            ))}
            <Button variant="outlined" size="small" onClick={expHandlers.addRow} startIcon={<AddIcon/>}>Add Row</Button>
          </Box>
        );
      case 5: // Promotion
        return (
          <Box>
            <Typography fontWeight={600} fontSize={17} mb={2}>Promotions</Typography>
            {promotionDetails.map((p, idx)=>(
              <Grid container spacing={1} key={idx} sx={{mb:1}}>
                <Grid item xs={12} md={2}><TextField label="From Post" size="small" value={p.from} fullWidth onChange={e=>promoHandlers.handleChange(idx,'from',e.target.value)}/></Grid>
                <Grid item xs={12} md={2}><TextField label="To Post" size="small" value={p.to} fullWidth onChange={e=>promoHandlers.handleChange(idx,'to',e.target.value)}/></Grid>
                <Grid item xs={12} md={3}><TextField label="Date" size="small" type="date" InputLabelProps={{shrink:true}} value={p.date} fullWidth onChange={e=>promoHandlers.handleChange(idx,'date',e.target.value)}/></Grid>
                <Grid item xs={12} md={5}><TextField label="Remarks" size="small" value={p.remarks} fullWidth onChange={e=>promoHandlers.handleChange(idx,'remarks',e.target.value)}/></Grid>
              </Grid>
            ))}
            <Button variant="outlined" size="small" onClick={promoHandlers.addRow} startIcon={<AddIcon/>}>Add Row</Button>
          </Box>
        );
      case 6: // Training
        return (
          <Box>
            <Typography fontWeight={600} fontSize={17} mb={2}>Training Details</Typography>
            {trainingDetails.map((t, idx)=>(
              <Grid container spacing={1} key={idx} sx={{mb:1}}>
                <Grid item xs={12} md={3}><TextField label="Name" size="small" value={t.name} fullWidth onChange={e=>trainHandlers.handleChange(idx,'name',e.target.value)}/></Grid>
                <Grid item xs={12} md={3}><TextField label="Institution" size="small" value={t.institution} fullWidth onChange={e=>trainHandlers.handleChange(idx,'institution',e.target.value)}/></Grid>
                <Grid item xs={12} md={2}><TextField label="From" size="small" value={t.from} type="date" InputLabelProps={{shrink:true}} fullWidth onChange={e=>trainHandlers.handleChange(idx,'from',e.target.value)}/></Grid>
                <Grid item xs={12} md={2}><TextField label="To" size="small" value={t.to} type="date" InputLabelProps={{shrink:true}} fullWidth onChange={e=>trainHandlers.handleChange(idx,'to',e.target.value)}/></Grid>
                <Grid item xs={12} md={2}><TextField label="Remarks" size="small" value={t.remarks} fullWidth onChange={e=>trainHandlers.handleChange(idx,'remarks',e.target.value)}/></Grid>
              </Grid>
            ))}
            <Button variant="outlined" size="small" onClick={trainHandlers.addRow} startIcon={<AddIcon/>}>Add Row</Button>
          </Box>
        );
      case 7: // Awards
        return (
          <Box>
            <Typography fontWeight={600} fontSize={17} mb={2}>Awards / Rewards</Typography>
            {awardDetails.map((a, idx)=>(
              <Grid container spacing={1} key={idx} sx={{mb:1}}>
                <Grid item xs={12} md={3}><TextField label="Award Name" size="small" value={a.name} fullWidth onChange={e=>awardHandlers.handleChange(idx,'name',e.target.value)}/></Grid>
                <Grid item xs={12} md={2}><TextField label="Year" type="number" size="small" value={a.year} fullWidth onChange={e=>awardHandlers.handleChange(idx,'year',e.target.value)}/></Grid>
                <Grid item xs={12} md={3}><TextField label="Awarded By" size="small" value={a.by} fullWidth onChange={e=>awardHandlers.handleChange(idx,'by',e.target.value)}/></Grid>
                <Grid item xs={12} md={4}><TextField label="Remarks" size="small" value={a.remarks} fullWidth onChange={e=>awardHandlers.handleChange(idx,'remarks',e.target.value)}/></Grid>
              </Grid>
            ))}
            <Button variant="outlined" size="small" onClick={awardHandlers.addRow} startIcon={<AddIcon/>}>Add Row</Button>
          </Box>
        );
      case 8: // Disciplinary Actions
        return (
          <Box>
            <Typography fontWeight={600} fontSize={17} mb={2}>Disciplinary Actions</Typography>
            {discDetails.map((d, idx)=>(
              <Grid container spacing={1} key={idx} sx={{mb:1}}>
                <Grid item xs={12} md={2}><TextField label="Action" size="small" value={d.action} fullWidth onChange={e=>discHandlers.handleChange(idx,'action',e.target.value)}/></Grid>
                <Grid item xs={12} md={3}><TextField label="Reason" size="small" value={d.reason} fullWidth onChange={e=>discHandlers.handleChange(idx,'reason',e.target.value)}/></Grid>
                <Grid item xs={12} md={2}><TextField label="Date" size="small" type="date" InputLabelProps={{shrink:true}} value={d.date} fullWidth onChange={e=>discHandlers.handleChange(idx,'date',e.target.value)}/></Grid>
                <Grid item xs={12} md={5}><TextField label="Remarks" size="small" value={d.remarks} fullWidth onChange={e=>discHandlers.handleChange(idx,'remarks',e.target.value)}/></Grid>
              </Grid>
            ))}
            <Button variant="outlined" size="small" onClick={discHandlers.addRow} startIcon={<AddIcon/>}>Add Row</Button>
          </Box>
        );
      case 9: // Salary
        return (
          <Grid container spacing={2}>
            <Grid item xs={12} md={2}><TextField label="Basic" name="basic" size="small" value={salaryDetails.basic} onChange={handleObjChange(setSalaryDetails)} fullWidth /></Grid>
            <Grid item xs={12} md={2}><TextField label="DA" name="da" size="small" value={salaryDetails.da} onChange={handleObjChange(setSalaryDetails)} fullWidth /></Grid>
            <Grid item xs={12} md={2}><TextField label="HRA" name="hra" size="small" value={salaryDetails.hra} onChange={handleObjChange(setSalaryDetails)} fullWidth /></Grid>
            <Grid item xs={12} md={2}><TextField label="Gross" name="gross" size="small" value={salaryDetails.gross} onChange={handleObjChange(setSalaryDetails)} fullWidth /></Grid>
            <Grid item xs={12} md={2}><TextField label="Deduction" name="deduction" size="small" value={salaryDetails.deduction} onChange={handleObjChange(setSalaryDetails)} fullWidth /></Grid>
            <Grid item xs={12} md={2}><TextField label="Net" name="net" size="small" value={salaryDetails.net} onChange={handleObjChange(setSalaryDetails)} fullWidth /></Grid>
          </Grid>
        );
      case 10: // Increment
        return (
          <Box>
            <Typography fontWeight={600} fontSize={17} mb={2}>Increments</Typography>
            {incrementDetails.map((inc, idx)=>(
              <Grid container spacing={1} key={idx} sx={{mb:1}}>
                <Grid item xs={12} md={3}><TextField label="Date" size="small" type="date" InputLabelProps={{shrink:true}} value={inc.date} fullWidth onChange={e=>incrHandlers.handleChange(idx,'date',e.target.value)}/></Grid>
                <Grid item xs={12} md={3}><TextField label="Amount" size="small" value={inc.amount} fullWidth onChange={e=>incrHandlers.handleChange(idx,'amount',e.target.value)}/></Grid>
                <Grid item xs={12} md={6}><TextField label="Remarks" size="small" value={inc.remarks} fullWidth onChange={e=>incrHandlers.handleChange(idx,'remarks',e.target.value)}/></Grid>
              </Grid>
            ))}
            <Button variant="outlined" size="small" onClick={incrHandlers.addRow} startIcon={<AddIcon/>}>Add Row</Button>
          </Box>
        );
      case 11: // Canteen
        return (
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}><TextField label="Canteen Card No" name="cardno" size="small" value={canteenDetails.cardno} onChange={handleObjChange(setCanteenDetails)} fullWidth /></Grid>
            <Grid item xs={12} md={4}><TextField label="Valid From" name="from" type="date" size="small" InputLabelProps={{shrink:true}} value={canteenDetails.from} onChange={handleObjChange(setCanteenDetails)} fullWidth /></Grid>
            <Grid item xs={12} md={4}><TextField label="To" name="to" type="date" size="small" InputLabelProps={{shrink:true}} value={canteenDetails.to} onChange={handleObjChange(setCanteenDetails)} fullWidth /></Grid>
          </Grid>
        );
      case 12: // LIC
        return (
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}><TextField label="Policy No." name="policyno" size="small" value={licDetails.policyno} onChange={handleObjChange(setLICDetails)} fullWidth /></Grid>
            <Grid item xs={12} md={4}><TextField label="Sum Insured" name="sum" size="small" value={licDetails.sum} onChange={handleObjChange(setLICDetails)} fullWidth /></Grid>
            <Grid item xs={12} md={4}><TextField label="Nominee" name="nominee" size="small" value={licDetails.nominee} onChange={handleObjChange(setLICDetails)} fullWidth /></Grid>
          </Grid>
        );
      case 13: // Transfer
        return (
          <Box>
            <Typography fontWeight={600} fontSize={17} mb={2}>Transfer Details</Typography>
            {transferDetails.map((t, idx)=>(
              <Grid container spacing={1} key={idx} sx={{mb:1}}>
                <Grid item xs={12} md={3}><TextField label="From Unit" size="small" value={t.from} fullWidth onChange={e=>transfHandlers.handleChange(idx,'from',e.target.value)}/></Grid>
                <Grid item xs={12} md={3}><TextField label="To Unit" size="small" value={t.to} fullWidth onChange={e=>transfHandlers.handleChange(idx,'to',e.target.value)}/></Grid>
                <Grid item xs={12} md={3}><TextField label="Date" size="small" type="date" InputLabelProps={{shrink:true}} value={t.date} fullWidth onChange={e=>transfHandlers.handleChange(idx,'date',e.target.value)}/></Grid>
                <Grid item xs={12} md={3}><TextField label="Remarks" size="small" value={t.remarks} fullWidth onChange={e=>transfHandlers.handleChange(idx,'remarks',e.target.value)}/></Grid>
              </Grid>
            ))}
            <Button variant="outlined" size="small" onClick={transfHandlers.addRow} startIcon={<AddIcon/>}>Add Row</Button>
          </Box>
        );
        case 14: // Official Details
  return (
   <Box>
      <Typography fontWeight={600} fontSize={17} mb={2}>Official Details</Typography>
      {officialDetails.map((item, idx) => (
        <Grid container spacing={2} key={idx} sx={{ mb: 1 }}>
          <Grid item xs={12} md={3}>
            <TextField 
              size="small" 
              label="Employee ID" 
              fullWidth 
              value={item.employeeId || ''} 
              onChange={e => handleChange(idx, 'employeeId', e.target.value)} 
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField 
              size="small" 
              label="Date of Joining" 
              type="date" 
              InputLabelProps={{ shrink: true }}
              fullWidth 
              value={item.dateOfJoining || ''} 
              onChange={e => handleChange(idx, 'dateOfJoining', e.target.value)} 
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              size="small"
              label="Department"
              fullWidth
              select
              value={item.department || ''}
              onChange={e => handleChange(idx, 'department', e.target.value)}
            >
              <option value="">Select</option>
              {departments.map(d => <option key={d} value={d}>{d}</option>)}
            </TextField>
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              size="small"
              label="Designation"
              fullWidth
              select
              value={item.designation || ''}
              onChange={e => handleChange(idx, 'designation', e.target.value)}
            >
              <option value="">Select</option>
              {designations.map(d => <option key={d} value={d}>{d}</option>)}
            </TextField>
          </Grid>

          {/* Next row */}
          <Grid item xs={12} md={4}>
            <TextField size="small" label="Employment Type" fullWidth select value={item.employmentType || ''} onChange={e => handleChange(idx, 'employmentType', e.target.value)}>
              <option value="">Select</option>
              {employmentTypes.map(t => <option key={t} value={t}>{t}</option>)}
            </TextField>
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField size="small" label="Official Email" fullWidth value={item.officialEmail || ''} onChange={e => handleChange(idx, 'officialEmail', e.target.value)} />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField size="small" label="Location" fullWidth value={item.location || ''} onChange={e => handleChange(idx, 'location', e.target.value)} />
          </Grid>

          {/* Add Aadhaar and PAN if needed */}
          <Grid item xs={12} md={6}>
            <TextField size="small" label="Aadhar Number" fullWidth value={item.aadhar || ''} onChange={e => handleChange(idx, 'aadhar', e.target.value)} />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField size="small" label="PAN Number" fullWidth value={item.pan || ''} onChange={e => handleChange(idx, 'pan', e.target.value)} />
          </Grid>
        </Grid>
      ))}

   
    </Box>
  );

      default: return null;
    }
  }

  // -- UI Layout --
  return (
    <Box sx={{ background: '#f6f9fa', minHeight: '100vh', py: 3 }}>
        
      <Paper elevation={2} sx={{ maxWidth: 1250, mx: 'auto', borderRadius: 2, p: 2, boxShadow: '0 4px 16px #dde8eb7f' }}>
        {/* Header */}
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Box display="flex" alignItems="center">
            <Typography variant="h5" fontWeight={500} color="primary.main">Add Employee</Typography>
            <IconButton size="small" sx={{ml:1}}><SearchIcon/></IconButton>
          </Box>
          <div>
            {/* <input type="file" style={{display:'none'}} id="emp-upload" accept="image/*" /> */}
          
               <Box display="flex" alignItems="center">
               <Avatar
                 src={photoPreview}
                 alt="Employee Photo"
                 sx={{ width: 100, height: 100, marginRight: 2, bgcolor: "#eee", fontSize: 32 }}
                 variant="rounded"
               >
                 {!photoPreview && "No Photo"}
               </Avatar>
               <div>
                 <input
                   type="file"
                   accept="image/*"
                   style={{ display: 'none' }}
                   id="emp-upload"
                   onChange={handlePhotoChange}
                 />
                 <label htmlFor="emp-upload">
                   <Button size="small" component="span" variant="outlined">
                     Upload Photo
                   </Button>
                 </label>
               </div>
             </Box>
       
          </div>
        </Box>
        <Divider sx={{mb:2}} />

        <Tabs
          value={tabIndex}
          onChange={(_, v) => setTabIndex(v)}
          indicatorColor="primary"
          textColor="primary"
          sx={{ borderBottom:1, mb:2 }}
          variant="scrollable"
          scrollButtons="auto"
        >
          {tabLabels.map((t, i) => <Tab key={i} label={t} />)}
        </Tabs>

        <form onSubmit={handleSubmit} autoComplete="off">
          {renderTabContent()}
          <Box mt={3} textAlign="right">
            <Button type="submit" variant="contained" color="primary" size="large">Save</Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
}
