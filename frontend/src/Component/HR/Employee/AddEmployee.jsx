import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Paper, Grid, Button, Tabs, Tab, TextField, MenuItem,
  Checkbox, FormControlLabel, Typography, IconButton, Divider, Avatar, FormControl, FormLabel,
  RadioGroup, Radio, Select
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import PersonIcon from '@mui/icons-material/Person';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import { useToast } from "../../../context/ToastContext";
import axios from 'axios';
import { getErrorMessage } from "../../../utils/errorUtils";

axios.defaults.baseURL = import.meta.env.VITE_API_URL;

const states = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman & Nicobar', 'Chandigarh', 'Dadra & Nagar Haveli & Daman & Diu',
  'Delhi', 'Jammu & Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'
];
const maritalStatuses = ['Single', 'Married', 'Divorced', 'Widowed'];
const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
const empTypes = ['Permanent', 'Trainee', 'Probation'];

const departments = ['HR', 'Engineering', 'Marketing', 'Sales', 'Finance'];
const designations = ['Manager', 'Developer', 'Designer', 'Analyst', 'Tester'];
const employmentTypes = ['Permanent', 'Trainee', 'Probation'];

const tabLabels = [
  'Personal', 'Family', 'Qualification', 'Experience', 'Official', 'Salary',
  'Training', 'Promotion', 'Awards', 'Disciplinary Actions',
  'Increment', 'Canteen', 'LIC', 'Transfer',
];

// Initial State Templates
const initAddress = {
  street: '', city: '', state: '', pin: '', phone: '', mobile: '', email: ''
};
const initFamily = { sno: 1, name: '', relation: '', age: '', occupation: '' };
const initQual = { sno: 1, degree: '', discipline: '', year: '', institution: '' };
const initExp = { sno: 1, org: '', from: '', to: '', designation: '', remarks: '' };
const initPromo = { sno: 1, from: '', to: '', date: '', remarks: '' };
const initTraining = { sno: 1, name: '', institution: '', from: '', to: '', remarks: '' };
const initAward = { sno: 1, name: '', year: '', by: '', remarks: '' };
const initDisc = { sno: 1, action: '', reason: '', date: '', remarks: '' };

const initSalary = {
  basic: '',
  hra: '',
  conveyance: '',
  washingAllowance: '',
  totalSal: '',
  otherDeductions: '',
  esi: 'No',
  pf: 'No',
  ot: 'No',
  lic: 'No',
  licAmount: '',
  tdsAmount: '',
  paymentMode: '',
  remarks: ''
};
const initIncrement = { sno: 1, date: '', amount: '', remarks: '' };
const initCanteen = { sno: 1, cardno: '', from: '', to: '' };
const initLIC = { sno: 1, policyno: '', sum: '', nominee: '' };
const initTransfer = { sno: 1, from: '', to: '', date: '', remarks: '' };
// const initOfficial = { employeeId: '',  aadhar: '',  pan: '',  dateOfJoining: '',  department: '',  designation: '',  employmentType: '',
//   officialEmail: '',  location: ''
// };
// Outside your component (top of file)
const initOfficial = {
  dateOfInterview: '',
  dateOfJoining: '',
  joinedAs: '',
  probationPeriod: '',
  trainingPeriod: '',
  reportingToDept: '',
  reportingTo: '',
  designation: '',
  qualification: '',
  empStatus: '',
  pfAccountNo: '',
  esiNo: '',
  bankAccountNo: '',
  bankName: '',
  branchName: '',
  ifscCode: '',
  panNo: '',
  aadharNo: '',
  uanNo: '',
  passportNo: '',
  validity: '',
  bondExecuted: '',
  bondFromDate: '',
  bondToDate: '',
  bondYears: '',
  dojIncDate: '',
  shift: '',
  shiftDisable: false,
  regularIncDate: '',
  specialNote: '',
  incNote: '',
  weeklyOff: '',
  originalCertificates: '',
  // remarks: '',
  // employeeId: '',
  // officialEmail: '',
  // location: ''

};


export default function AddEmployee({ modalEmpId, isModal = false, onModalClose }) {
  // Main State
  const { empid: urlEmpId } = useParams();
  const navigate = useNavigate();
  const [tabIndex, setTabIndex] = useState(0);
  const { showToast } = useToast();
  const [isEdit, setIsEdit] = useState(false);

  // Resolve the empid — modal takes priority over URL param
  const resolvedEmpId = modalEmpId || urlEmpId;

  useEffect(() => {
    if (resolvedEmpId) {
      setIsEdit(true);
      fetchEmployeeData(resolvedEmpId);
    }
  }, [resolvedEmpId]);

  // Fetch employee list for Reporting To dropdown
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await axios.get('/api/employees', { withCredentials: true });
        const employees = res.data?.data || res.data || [];
        setEmployeeList(employees.map(e => ({
          empid: e.empid,
          ename: e.ename,
          deptname: e.deptname,
          designation: e.designation
        })));
      } catch (err) {
        console.error('Error fetching employee list:', err);
      }
    };
    fetchEmployees();
  }, []);

  const fetchEmployeeData = async (id) => {
    try {
      const res = await axios.get(`/api/employees/${id}/full`);
      const data = res.data;

      // Map Personal & Addresses
      setFormData({
        empid: data.empid,
        ename: data.ename,
        fname: data.fname,
        dob: data.dob ? data.dob.split('T')[0] : '',
        sex: data.gender || '',
        marital_status: data.marital_status || '',
        emptype: data.employment_status || '',
        divname: data.divname || '',
        deptname: data.deptname || '',
        secname: data.secname || '',
        pob: data.pob || '',
        bgroup: data.bgroup || '',
        mother_tounge: data.mother_tongue || '',
        idfm1: data.idfm1 || '',
        idfm2: data.idfm2 || '',
        lang_known: data.lang_known || '',
        commAddress: {
          street: data.cadd_sa || '',
          city: data.cadd_city || '',
          state: data.cadd_state || '',
          pin: data.cadd_pin || '',
          phone: data.cadd_phone || '',
          mobile: data.cadd_mobile || '',
          email: data.cadd_email || ''
        },
        permAddress: {
          street: data.padd_sa || '',
          city: data.padd_city || '',
          state: data.padd_state || '',
          pin: data.padd_pin || '',
          phone: data.padd_phone || '',
          mobile: data.padd_mobile || '',
          email: data.padd_email || ''
        },
        sameAsComm: data.cadd_sa === data.padd_sa && data.cadd_sa !== null,
        status: data.status || 'Active',
        left_date: data.left_date ? data.left_date.split('T')[0] : '',
        left_reason: data.left_reason || '',
      });

      // Map Official
      if (data.official) {
        setOfficialDetails({
          dateOfInterview: data.official.doi ? data.official.doi.split('T')[0] : '',
          dateOfJoining: data.official.doj ? data.official.doj.split('T')[0] : '',
          joinedAs: data.official.jas || '',
          probationPeriod: data.official.pp || '',
          trainingPeriod: data.official.tp || '',
          reportingToDept: data.official.rto_dept || '',
          reportingTo: data.official.rto || '',
          designation: data.official.designation || '',
          qualification: data.official.c_high_qual || '',
          empStatus: data.official.emp_status || '',
          pfAccountNo: data.official.pfacno || '',
          esiNo: data.official.esiacno || '',
          bankAccountNo: data.official.bankacno || '',
          bankName: data.official.bankname || '',
          branchName: data.official.branchname || '',
          ifscCode: data.official.ifsccode || '',
          panNo: data.official.panno || '',
          aadharNo: data.official.c_aadhar_no || '',
          uanNo: data.official.c_uan_no || '',
          passportNo: data.official.passport_no || '',
          validity: data.official.validity || '',
          bondExecuted: data.official.bond_exec || '',
          bondFromDate: data.official.bond_frmdt ? data.official.bond_frmdt.split('T')[0] : '',
          bondToDate: data.official.bond_todt ? data.official.bond_todt.split('T')[0] : '',
          bondYears: data.official.bond_yrs || '',
          dojIncDate: data.official.c_doj_inc_date ? data.official.c_doj_inc_date.split('T')[0] : '',
          shift: data.official.c_default_shift || '',
          shiftDisable: data.official.c_shift_disable ? true : false,
          regularIncDate: data.official.doinc ? data.official.doinc.split('T')[0] : '',
          specialNote: data.official.special_note || '',
          incNote: data.official.inc_note || '',
          weeklyOff: data.official.c_weekly_off || '',
          originalCertificates: data.official.oc || '',
        });
      }

      // Map Salary
      if (data.salary) {
        setSalaryDetails({
          basic: data.salary.basic || '',
          hra: data.salary.hra || '',
          conveyance: data.salary.conveyance || '',
          washingAllowance: data.salary.washing_allowance || '',
          totalSal: data.salary.total || '',
          otherDeductions: data.salary.deduct_others1 || '',
          esi: data.salary.IS_esi === 'Y' ? 'Yes' : 'No',
          pf: data.salary.IS_pf === 'Y' ? 'Yes' : 'No',
          ot: data.salary.IS_ot === 'Y' ? 'Yes' : 'No',
          lic: data.salary.IS_lic === 'Y' ? 'Yes' : 'No',
          licAmount: data.salary.lic_amount || '',
          tdsAmount: data.salary.tds_amount || '',
          paymentMode: data.salary.pay_mode || '',
          remarks: data.salary.remarks || ''
        });
      }

      // Load existing photo
      fetchPhoto(id);

      // Map Arrays
      if (data.family && data.family.length > 0) {
        setFamilyDetails(data.family.map(f => ({
          sno: f.c_sno, name: f.fname, relation: f.frel, age: f.fage, occupation: f.foccp
        })));
      }
      if (data.qualification && data.qualification.length > 0) {
        setQualDetails(data.qualification.map(q => ({
          sno: q.c_sno, degree: q.course, institution: q.noi, year: q.year
        })));
      }
      if (data.experience && data.experience.length > 0) {
        setExpDetails(data.experience.map(e => ({
          sno: e.c_sno, org: e.name, from: e.ffrom ? e.ffrom.split('T')[0] : '', to: e.tto ? e.tto.split('T')[0] : '', designation: e.designation, remarks: e.remarks || ''
        })));
      }

    } catch (err) {
      console.error("Error fetching employee details:", err);
      showToast(getErrorMessage(err, "Error loading employee data"), "error");
    }
  };

  // Personal
  const [formData, setFormData] = useState({
    empid: '', ename: '', fname: '', dob: '', sex: '', marital_status: '',
    emptype: '', divname: '', deptname: '', secname: '',
    pob: '', bgroup: '', mother_tounge: '', idfm1: '', idfm2: '',
    lang_known: '',
    commAddress: { ...initAddress },
    permAddress: { ...initAddress },
    sameAsComm: false,
    status: 'Active',
    left_date: '',
    left_reason: '',
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

  const handleOfficialChange = (name, value) => {
    setOfficialDetails(prev => ({ ...prev, [name]: value }));
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      const form = event.target.form;
      const index = Array.prototype.indexOf.call(form, event.target);
      if (index > -1 && index + 1 < form.elements.length) {
        form.elements[index + 1].focus();
      }
    }
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
  const [familyDetails, setFamilyDetails] = useState([{ ...initFamily }]);
  const [qualDetails, setQualDetails] = useState([{ ...initQual }]);
  const [expDetails, setExpDetails] = useState([{ ...initExp }]);
  const [promotionDetails, setPromotionDetails] = useState([{ ...initPromo }]);
  const [trainingDetails, setTrainingDetails] = useState([{ ...initTraining }]);
  const [awardDetails, setAwardDetails] = useState([{ ...initAward }]);
  const [discDetails, setDiscDetails] = useState([{ ...initDisc }]);
  const [salaryDetails, setSalaryDetails] = useState({ ...initSalary });
  const [incrementDetails, setIncrementDetails] = useState([{ ...initIncrement }]);
  const [canteenDetails, setCanteenDetails] = useState({ ...initCanteen });
  const [licDetails, setLICDetails] = useState([{ ...initLIC }]);
  const [transferDetails, setTransferDetails] = useState([{ ...initTransfer }]);
  const [officialDetails, setOfficialDetails] = useState({ ...initOfficial });
  const [employeeList, setEmployeeList] = useState([]);

  //Photo

  const [photoPreview, setPhotoPreview] = useState(null);
  const [currentPhoto, setCurrentPhoto] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);

  const fetchPhoto = async (id) => {
    try {
      const res = await axios.get(`/api/employees/${id}/photo`);
      if (res.data && res.data.photo) {
        setCurrentPhoto(`data:${res.data.mimeType || 'image/jpeg'};base64,${res.data.photo}`);
      } else {
        setCurrentPhoto(null);
      }
    } catch {
      setCurrentPhoto(null);
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handlePhotoUpload = async () => {
    const targetId = resolvedEmpId || formData.empid;
    if (!photoFile) {
      showToast('Please select a photo first', 'error');
      return;
    }
    if (!targetId) {
      showToast('Save the employee record before uploading a photo', 'error');
      return;
    }
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result.split(',')[1];
        await axios.put(`/api/employees/${targetId}/photo`, {
          photo: base64,
          fileName: photoFile.name,
          mimeType: photoFile.type,
        });
        showToast('Photo updated successfully!', 'success');
        setCurrentPhoto(`data:${photoFile.type};base64,${base64}`);
        setPhotoPreview(null);
        setPhotoFile(null);
      };
      reader.readAsDataURL(photoFile);
    } catch (err) {
      console.error('Photo upload failed:', err);
      showToast(getErrorMessage(err, 'Failed to update photo'), 'error');
    }
  };


  // Handlers
  const handleFDChange = e => {
    const { name, value } = e.target;
    setFormData(f => ({ ...f, [name]: value }));
  };


  // Dynamic array tab generic handler
  function genArrHandlers(details, setDetails, keys) {
    return {
      handleChange: (idx, key, val) => setDetails(prev => prev.map((row, i) =>
        i === idx ? { ...row, [key]: val } : row)),
      addRow: () => setDetails(prev => ([
        ...prev,
        {
          ...keys,
          sno: prev.length + 1,
        }
      ])),
    };
  }
  const famHandlers = genArrHandlers(familyDetails, setFamilyDetails, { ...initFamily });
  const qualHandlers = genArrHandlers(qualDetails, setQualDetails, { ...initQual });
  const expHandlers = genArrHandlers(expDetails, setExpDetails, { ...initExp });
  const promoHandlers = genArrHandlers(promotionDetails, setPromotionDetails, { ...initPromo });
  const trainHandlers = genArrHandlers(trainingDetails, setTrainingDetails, { ...initTraining });
  const awardHandlers = genArrHandlers(awardDetails, setAwardDetails, { ...initAward });
  const discHandlers = genArrHandlers(discDetails, setDiscDetails, { ...initDisc });
  const incrHandlers = genArrHandlers(incrementDetails, setIncrementDetails, { ...initIncrement });
  const transfHandlers = genArrHandlers(transferDetails, setTransferDetails, { ...initTransfer });


  // For singular detail objects (salary, canteen, etc.)
  const handleObjChange = (setter) => e => {
    const { name, value } = e.target;
    setter(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const requiredFields = [
      { field: formData.empid, name: 'Employee ID' },
      { field: formData.ename, name: 'Employee Name' },
      { field: formData.sex, name: 'Gender' },
      { field: formData.dob, name: 'Date of Birth' }
    ];

    for (let item of requiredFields) {
      if (!item.field || String(item.field).trim() === '') {
        showToast(`${item.name} is a required field.`, "error");
        return false;
      }
    }

    if (formData.status === 'Left' && (!formData.left_date || formData.left_date.trim() === '')) {
      showToast("Left Date is required when Employee Status is 'Left'.", "error");
      return false;
    }

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
      familyDetails,
      qualDetails,
      expDetails,
      officialDetails: { ...officialDetails },
      salaryDetails: { ...salaryDetails },

      // Include other details like familyDetails, qualDetails if needed here
    };
    console.log(payload);

    const resetForm = () => {
      setFormData({
        empid: '', ename: '', fname: '', dob: '', sex: '', marital_status: '',
        emptype: '', divname: '', deptname: '', secname: '', uname: '',
        pob: '', bgroup: '', mother_tounge: '', idfm1: '', idfm2: '',
        lang_known: '',
        commAddress: { ...initAddress },
        permAddress: { ...initAddress },
        sameAsComm: false,
        status: 'Active',
        left_date: '',
        left_reason: '',
      });

      setFamilyDetails([{ ...initFamily }]);
      setQualDetails([{ ...initQual }]);
      setExpDetails([{ ...initExp }]);
      setPromotionDetails([{ ...initPromo }]);
      setTrainingDetails([{ ...initTraining }]);
      setAwardDetails([{ ...initAward }]);
      setDiscDetails([{ ...initDisc }]);
      setSalaryDetails({ ...initSalary });
      setIncrementDetails([{ ...initIncrement }]);
      setCanteenDetails({ ...initCanteen });
      setLICDetails([{ ...initLIC }]);
      setTransferDetails([{ ...initTransfer }]);
      setOfficialDetails({ ...initOfficial });
      setPhotoPreview(null);
      setCurrentPhoto(null);
      setPhotoFile(null);
    };

    if (!validateForm()) return;

    try {
      const url = isEdit ? `/api/employees/${formData.empid}` : `/api/employees/add-employee`;
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(`${import.meta.env.VITE_API_URL}${url}`, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        const savedId = formData.empid || (data && data.empid) || (data && data.emp && data.emp.empid);
        if (photoFile && savedId) {
          try {
            const reader = new FileReader();
            reader.onload = async () => {
              const base64 = reader.result.split(',')[1];
              await axios.put(`/api/employees/${savedId}/photo`, {
                photo: base64,
                fileName: photoFile.name,
                mimeType: photoFile.type,
              });
            };
            reader.readAsDataURL(photoFile);
          } catch (photoErr) {
            console.error('Photo upload failed:', photoErr);
          }
        }

        showToast(isEdit ? 'Employee updated successfully!' : 'Employee saved successfully!', 'success');
        if (isModal && onModalClose) {
          onModalClose(); // close modal and refresh list
        } else if (!isEdit) {
          resetForm();
        } else {
          navigate('/employee-report');
        }
      } else {
        throw new Error(data.message || 'Failed to save employee');
      }
    } catch (error) {
      console.error('Save failed:', error);
      showToast(getErrorMessage(error, 'Error saving employee!'), 'error');
    }
  };

  const handleSectionUpdate = async (sectionPayload) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/employees/${formData.empid}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sectionPayload),
      });
      if (res.ok) {
        showToast('Section updated successfully!', 'success');
      } else {
        const data = await res.json();
        throw new Error(data.message || 'Update failed');
      }
    } catch (error) {
      showToast(getErrorMessage(error, 'Update failed'), 'error');
    }
  };

  useEffect(() => {
    const { basic = 0, hra = 0, conveyance = 0, washingAllowance = 0 } = salaryDetails;
    const totalSalary =
      Number(basic) +
      Number(hra) +
      Number(conveyance) +
      Number(washingAllowance);
    setSalaryDetails(prev => ({
      ...prev,
      totalSal: totalSalary
    }));
  }, [salaryDetails.basic, salaryDetails.hra, salaryDetails.conveyance, salaryDetails.washingAllowance]);
  // Tabs content
  function renderTabContent() {

    switch (tabIndex) {
      case 0: // Personal
        return (
          <Box sx={{ p: 1 }}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom color="primary">
              Basic Information
            </Typography>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(5, 1fr)',
                gap: 2,
                '& > *': { minWidth: 0 },
                '@media (max-width: 1200px)': { gridTemplateColumns: 'repeat(3, 1fr)' },
                '@media (max-width: 900px)': { gridTemplateColumns: 'repeat(2, 1fr)' },
                '@media (max-width: 600px)': { gridTemplateColumns: '1fr' },
              }}
            >
              <TextField required label="Employee ID" name="empid" size="small"
                fullWidth value={formData.empid}
                onChange={handleFDChange}
                onKeyDown={handleKeyDown}
                InputLabelProps={{ shrink: true }}
              />
              <TextField required label="Name" name="ename" size="small"
                fullWidth value={formData.ename}
                onChange={handleFDChange}
                onKeyDown={handleKeyDown}
                InputLabelProps={{ shrink: true }}
              />
              <TextField label="Father/Husband Name" name="fname" size="small"
                fullWidth value={formData.fname}
                onChange={handleFDChange}
                onKeyDown={handleKeyDown}
                InputLabelProps={{ shrink: true }}
              />
              <TextField select label="Employee Type" name="emptype" size="small"
                fullWidth value={formData.emptype}
                onChange={handleFDChange}
                onKeyDown={handleKeyDown}
                InputLabelProps={{ shrink: true }}
              >
                <MenuItem value="">Select</MenuItem>
                {empTypes.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
              </TextField>
              <TextField required select label="Gender" name="sex" size="small" fullWidth
                value={formData.sex}
                onChange={handleFDChange} variant="outlined"
                onKeyDown={handleKeyDown}
                InputLabelProps={{ shrink: true }}
              >
                <MenuItem value="">Select</MenuItem>
                <MenuItem value="M">Male</MenuItem>
                <MenuItem value="F">Female</MenuItem>
              </TextField>
              <TextField required label="Date of Birth" name="dob" size="small" fullWidth type="date"
                InputLabelProps={{ shrink: true }} value={formData.dob} onChange={handleFDChange} onKeyDown={handleKeyDown}
              />
              <TextField select label="Marital Status" name="marital_status" size="small"
                fullWidth value={formData.marital_status} onChange={handleFDChange} onKeyDown={handleKeyDown}
                InputLabelProps={{ shrink: true }}
              >
                <MenuItem value="">Select</MenuItem>
                {maritalStatuses.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
              </TextField>
              <TextField select label="Blood Group" name="bgroup" size="small"
                fullWidth value={formData.bgroup} onChange={handleFDChange} onKeyDown={handleKeyDown}
                InputLabelProps={{ shrink: true }}
              >
                <MenuItem value="">Select</MenuItem>
                {bloodGroups.map(bg => <MenuItem value={bg} key={bg}>{bg}</MenuItem>)}
              </TextField>
              <TextField label="Place of Birth" name="pob" size="small"
                fullWidth value={formData.pob} onChange={handleFDChange} onKeyDown={handleKeyDown}
                InputLabelProps={{ shrink: true }}
              />
              <TextField label="Mother Tongue" name="mother_tounge" size="small" fullWidth
                value={formData.mother_tounge} onChange={handleFDChange} onKeyDown={handleKeyDown}
                InputLabelProps={{ shrink: true }}
              />
              <TextField label="Languages Known" name="lang_known" size="small" fullWidth
                value={formData.lang_known} onChange={handleFDChange} onKeyDown={handleKeyDown}
                InputLabelProps={{ shrink: true }}
              />
              <TextField label="ID Mark 1" name="idfm1" size="small"
                fullWidth value={formData.idfm1} onChange={handleFDChange} onKeyDown={handleKeyDown}
                InputLabelProps={{ shrink: true }}
              />
              <TextField label="ID Mark 2" name="idfm2" size="small"
                fullWidth value={formData.idfm2} onChange={handleFDChange} onKeyDown={handleKeyDown}
                InputLabelProps={{ shrink: true }}
              />
              <TextField select label="Employee Status" name="status" size="small" fullWidth
                value={formData.status} onChange={handleFDChange} onKeyDown={handleKeyDown}
                InputLabelProps={{ shrink: true }}
              >
                <MenuItem value="Active">Active</MenuItem>
                <MenuItem value="Left">Left</MenuItem>
                <MenuItem value="Resigned">Resigned</MenuItem>
                <MenuItem value="Terminated">Terminated</MenuItem>
              </TextField>
              {['Left', 'Resigned', 'Terminated'].includes(formData.status) && (
                <>
                  <TextField label="Left Date" name="left_date" size="small" fullWidth type="date"
                    InputLabelProps={{ shrink: true }} value={formData.left_date} onChange={handleFDChange} onKeyDown={handleKeyDown}
                  />
                  <TextField label="Reason for Left" name="left_reason" size="small" fullWidth
                    value={formData.left_reason} onChange={handleFDChange} onKeyDown={handleKeyDown}
                    InputLabelProps={{ shrink: true }}
                  />
                </>
              )}
            </Box>

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle1" fontWeight="bold" gutterBottom color="primary">
              Department & Organisation
            </Typography>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: 2,
                '& > *': { minWidth: 0 },
                '@media (max-width: 900px)': { gridTemplateColumns: 'repeat(2, 1fr)' },
                '@media (max-width: 600px)': { gridTemplateColumns: '1fr' },
              }}
            >
              <TextField label="Division" name="divname" size="small" fullWidth
                value={formData.divname} onChange={handleFDChange} onKeyDown={handleKeyDown}
                InputLabelProps={{ shrink: true }}
              />
              <TextField label="Department" name="deptname" size="small" fullWidth
                value={formData.deptname} onChange={handleFDChange} onKeyDown={handleKeyDown}
                InputLabelProps={{ shrink: true }}
              />
              <TextField label="Section" name="secname" size="small" fullWidth
                value={formData.secname} onChange={handleFDChange} onKeyDown={handleKeyDown}
                InputLabelProps={{ shrink: true }}
              />
              <TextField label="Unit" name="uname" size="small" fullWidth
                value={formData.uname} onChange={handleFDChange} onKeyDown={handleKeyDown}
                InputLabelProps={{ shrink: true }}
              />
            </Box>

            <Divider sx={{ my: 3 }} />

            <Typography variant="subtitle1" fontWeight="bold" gutterBottom color="primary" sx={{ mb: 1 }}>
              Address & Communication
            </Typography>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: '1fr auto 1fr',
                gap: 1,
                alignItems: 'stretch',
                '@media (max-width: 900px)': { 
                  gridTemplateColumns: '1fr',
                  gridTemplateRows: 'auto auto auto',
                },
              }}
            >
              <Paper sx={{ p: 1.5, elevation: 1 }}>
                <Typography variant="subtitle2" fontWeight="600" gutterBottom sx={{ mb: 1 }}>Communication Address</Typography>
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: 1,
                    '@media (max-width: 600px)': { gridTemplateColumns: '1fr' },
                  }}
                >
                  <TextField name="street" label="Street" value={formData.commAddress?.street} onChange={handleCommChange} onKeyDown={handleKeyDown} fullWidth size="small" margin="dense" variant="outlined" />
                  <TextField name="city" label="City" value={formData.commAddress?.city} onChange={handleCommChange} onKeyDown={handleKeyDown} fullWidth size="small" margin="dense" variant="outlined" />
                  <TextField select name="state" label="State" value={formData.commAddress?.state} onChange={handleCommChange} onKeyDown={handleKeyDown} fullWidth size="small" margin="dense" variant="outlined">
                    <MenuItem value="">Select</MenuItem>
                    {states.map(state => (
                      <MenuItem key={state} value={state}>{state}</MenuItem>
                    ))}
                  </TextField>
                  <TextField name="phone" label="Phone" value={formData.commAddress?.phone} onChange={handleCommChange} onKeyDown={handleKeyDown} fullWidth size="small" margin="dense" variant="outlined" />
                  <TextField name="mobile" label="Mobile" value={formData.commAddress?.mobile} onChange={handleCommChange} onKeyDown={handleKeyDown} fullWidth size="small" margin="dense" variant="outlined" />
                  <TextField name="email" label="Email" value={formData.commAddress?.email} onChange={handleCommChange} onKeyDown={handleKeyDown} fullWidth size="small" margin="dense" variant="outlined" />
                </Box>
              </Paper>
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center',
                minHeight: '100%',
                '@media (max-width: 900px)': { 
                  marginY: 0.5,
                },
              }}>
                <Checkbox checked={formData.sameAsComm} onChange={toggleSame} size="small" color={formData.sameAsComm ? 'success' : 'default'} sx={{ mb: 0.25 }} />
                <Typography variant="caption" sx={{ fontWeight: 500, color: formData.sameAsComm ? '#2e7d32' : '#666', textAlign: 'center', lineHeight: 1.1, fontSize: '0.7rem' }}>
                  Same as<br />Communication
                </Typography>
              </Box>
              <Paper sx={{ p: 1.5, elevation: 1 }}>
                <Typography variant="subtitle2" fontWeight="600" gutterBottom sx={{ mb: 1 }}>Permanent Address</Typography>
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: 1,
                    '@media (max-width: 600px)': { gridTemplateColumns: '1fr' },
                  }}
                >
                  <TextField name="street" label="Street" value={formData.permAddress?.street} onChange={handlePermChange} onKeyDown={handleKeyDown} fullWidth size="small" margin="dense" variant="outlined" disabled={formData.sameAsComm} />
                  <TextField name="city" label="City" value={formData.permAddress?.city} onChange={handlePermChange} onKeyDown={handleKeyDown} fullWidth size="small" margin="dense" variant="outlined" disabled={formData.sameAsComm} />
                  <TextField select name="state" label="State" value={formData.permAddress?.state} onChange={handlePermChange} onKeyDown={handleKeyDown} fullWidth size="small" margin="dense" variant="outlined" disabled={formData.sameAsComm}>
                    <MenuItem value="">Select</MenuItem>
                    {states.map(state => (
                      <MenuItem key={state} value={state}>{state}</MenuItem>
                    ))}
                  </TextField>
                  <TextField name="phone" label="Phone" value={formData.permAddress?.phone} onChange={handlePermChange} onKeyDown={handleKeyDown} fullWidth size="small" margin="dense" variant="outlined" disabled={formData.sameAsComm} />
                  <TextField name="mobile" label="Mobile" value={formData.permAddress?.mobile} onChange={handlePermChange} onKeyDown={handleKeyDown} fullWidth size="small" margin="dense" variant="outlined" disabled={formData.sameAsComm} />
                  <TextField name="email" label="Email" value={formData.permAddress?.email} onChange={handlePermChange} onKeyDown={handleKeyDown} fullWidth size="small" margin="dense" variant="outlined" disabled={formData.sameAsComm} />
                </Box>
              </Paper>
            </Box>
            {isEdit && (
              <Box mt={3} textAlign="right">
                <Button variant="contained" color="success" onClick={() => handleSectionUpdate(formData)}>
                  Update Personal Details
                </Button>
              </Box>
            )}
            {!isEdit && tabIndex === tabLabels.length - 1 && (
              <Box mt={3} textAlign="right">
                <Button onClick={handleSubmit} variant="contained" color="primary">Save Employee</Button>
              </Box>
            )}
          </Box>
        );

      case 1: // Family
        return (
          <Box>
            <Typography fontWeight={600} fontSize={17} mb={2}>Family Details</Typography>
            {familyDetails.map((mem, idx) => (
              <Box
                key={idx}
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(5, 1fr)',
                  gap: 1,
                  mb: 1,
                  '& > *': { minWidth: 0 },
                  '@media (max-width: 1200px)': { gridTemplateColumns: 'repeat(3, 1fr)' },
                  '@media (max-width: 900px)': { gridTemplateColumns: 'repeat(2, 1fr)' },
                  '@media (max-width: 600px)': { gridTemplateColumns: '1fr' },
                }}
              >
                <TextField
                  size="small"
                  label="S.No"
                  value={mem.sno}
                  fullWidth
                  InputProps={{ readOnly: true }}
                />
                <TextField
                  size="small"
                  label="Name"
                  value={mem.name}
                  fullWidth
                  onChange={e => famHandlers.handleChange(idx, 'name', e.target.value)}
                />
                <TextField
                  size="small"
                  label="Relation"
                  value={mem.relation}
                  fullWidth
                  onChange={e => famHandlers.handleChange(idx, 'relation', e.target.value)}
                />
                <TextField
                  size="small"
                  label="Age"
                  type="number"
                  value={mem.age}
                  fullWidth
                  onChange={e => famHandlers.handleChange(idx, 'age', e.target.value)}
                />
                <TextField
                  size="small"
                  label="Occupation"
                  value={mem.occupation}
                  fullWidth
                  onChange={e => famHandlers.handleChange(idx, 'occupation', e.target.value)}
                />
              </Box>
            ))}
            <Button variant="outlined" size="small" onClick={famHandlers.addRow} startIcon={<AddIcon />}>Add Row</Button>
            {isEdit && (
              <Box mt={3} textAlign="right">
                <Button variant="contained" color="success" onClick={() => handleSectionUpdate({ familyDetails })}>
                  Update Family Details
                </Button>
              </Box>
            )}
          </Box>
        );
      case 2: // Qualification
        return (
          <Box>
            <Typography fontWeight={600} fontSize={17} mb={2}>Qualification Details</Typography>
            {qualDetails.map((q, idx) => (
              <Box
                key={idx}
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(5, 1fr)',
                  gap: 1,
                  mb: 1,
                  '& > *': { minWidth: 0 },
                  '@media (max-width: 1200px)': { gridTemplateColumns: 'repeat(3, 1fr)' },
                  '@media (max-width: 900px)': { gridTemplateColumns: 'repeat(2, 1fr)' },
                  '@media (max-width: 600px)': { gridTemplateColumns: '1fr' },
                }}
              >
                <TextField
                  size="small"
                  label="S.No"
                  value={q.sno}
                  fullWidth
                  InputProps={{ readOnly: true }}
                />
                <TextField label="Degree" size="small" value={q.degree} fullWidth onChange={e => qualHandlers.handleChange(idx, 'degree', e.target.value)} />
                <TextField label="Discipline" size="small" value={q.discipline} fullWidth onChange={e => qualHandlers.handleChange(idx, 'discipline', e.target.value)} />
                <TextField label="Year" size="small" type="number" value={q.year} fullWidth onChange={e => qualHandlers.handleChange(idx, 'year', e.target.value)} />
                <TextField label="Institution" size="small" value={q.institution} fullWidth onChange={e => qualHandlers.handleChange(idx, 'institution', e.target.value)} />
              </Box>
            ))}
            <Button variant="outlined" size="small" onClick={qualHandlers.addRow} startIcon={<AddIcon />}>Add Row</Button>
            {isEdit && (
              <Box mt={3} textAlign="right">
                <Button variant="contained" color="success" onClick={() => handleSectionUpdate({ qualDetails })}>
                  Update Qualification Details
                </Button>
              </Box>
            )}
          </Box>
        );
      case 3: // Experience
        return (
          <Box>
            <Typography fontWeight={600} fontSize={17} mb={2}>Experience Details</Typography>
            {expDetails.map((exp, idx) => (
              <Box
                key={idx}
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(6, 1fr)',
                  gap: 1,
                  mb: 1,
                  '& > *': { minWidth: 0 },
                  '@media (max-width: 1200px)': { gridTemplateColumns: 'repeat(3, 1fr)' },
                  '@media (max-width: 900px)': { gridTemplateColumns: 'repeat(2, 1fr)' },
                  '@media (max-width: 600px)': { gridTemplateColumns: '1fr' },
                }}
              >
                <TextField
                  size="small"
                  label="S.No"
                  value={exp.sno}
                  fullWidth
                  InputProps={{ readOnly: true }}
                />
                <TextField label="Organization" size="small" value={exp.org} fullWidth onChange={e => expHandlers.handleChange(idx, 'org', e.target.value)} />
                <TextField label="From" size="small" value={exp.from} type="date" InputLabelProps={{ shrink: true }} fullWidth onChange={e => expHandlers.handleChange(idx, 'from', e.target.value)} />
                <TextField label="To" size="small" value={exp.to} type="date" InputLabelProps={{ shrink: true }} fullWidth onChange={e => expHandlers.handleChange(idx, 'to', e.target.value)} />
                <TextField label="Designation" size="small" value={exp.designation} fullWidth onChange={e => expHandlers.handleChange(idx, 'designation', e.target.value)} />
                <TextField label="Remarks" size="small" value={exp.remarks} fullWidth onChange={e => expHandlers.handleChange(idx, 'remarks', e.target.value)} />
              </Box>
            ))}
            <Button variant="outlined" size="small" onClick={expHandlers.addRow} startIcon={<AddIcon />}>Add Row</Button>
            {isEdit && (
              <Box mt={3} textAlign="right">
                <Button variant="contained" color="success" onClick={() => handleSectionUpdate({ expDetails })}>
                  Update Experience Details
                </Button>
              </Box>
            )}
          </Box>
        );

      case 4: // Official Details
        return (
          <Box>
            <Typography fontWeight={600} fontSize={17} mb={2}>Official Details</Typography>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(5, 1fr)',
                gap: 2,
                '& > *': { minWidth: 0 },
                '@media (max-width: 1200px)': { gridTemplateColumns: 'repeat(3, 1fr)' },
                '@media (max-width: 900px)': { gridTemplateColumns: 'repeat(2, 1fr)' },
                '@media (max-width: 600px)': { gridTemplateColumns: '1fr' },
              }}
            >
              <TextField label="Date of Interview" type="date" fullWidth size="small" variant="outlined"
                InputLabelProps={{ shrink: true }}
                value={officialDetails.dateOfInterview}
                onChange={e => handleOfficialChange('dateOfInterview', e.target.value)}
              />
              <TextField label="Date of Joining" type="date" fullWidth size="small" variant="outlined"
                InputLabelProps={{ shrink: true }}
                value={officialDetails.dateOfJoining}
                onChange={e => handleOfficialChange('dateOfJoining', e.target.value)}
              />
              <TextField label="Joined As" fullWidth size="small" variant="outlined"
                value={officialDetails.joinedAs}
                onChange={e => handleOfficialChange('joinedAs', e.target.value)}
              />
              <TextField label="Probation Period" fullWidth size="small" variant="outlined"
                value={officialDetails.probationPeriod}
                onChange={e => handleOfficialChange('probationPeriod', e.target.value)}
              />
              <TextField label="Training Period" fullWidth size="small" variant="outlined"
                value={officialDetails.trainingPeriod}
                onChange={e => handleOfficialChange('trainingPeriod', e.target.value)}
              />
              <TextField select label="Reporting To" fullWidth size="small" variant="outlined"
                value={officialDetails.reportingTo}
                onChange={e => handleOfficialChange('reportingTo', e.target.value)}
              >
                <MenuItem value="">Select Manager</MenuItem>
                {employeeList
                  .filter(emp => emp.empid !== formData.empid)
                  .map(emp => (
                    <MenuItem key={emp.empid} value={emp.empid}>
                      {emp.ename} ({emp.empid}) - {emp.deptname || emp.designation || ''}
                    </MenuItem>
                  ))}
              </TextField>
              <TextField label="Reporting To Dept" fullWidth size="small" variant="outlined"
                value={officialDetails.reportingToDept}
                onChange={e => handleOfficialChange('reportingToDept', e.target.value)}
              />
              <TextField label="Designation" fullWidth size="small" variant="outlined"
                value={officialDetails.designation}
                onChange={e => handleOfficialChange('designation', e.target.value)}
              />
              <TextField label="Qualification" fullWidth size="small" variant="outlined"
                value={officialDetails.qualification}
                onChange={e => handleOfficialChange('qualification', e.target.value)}
              />
              <TextField label="Emp Status (S/W)" select fullWidth size="small" variant="outlined"
                value={officialDetails.empStatus}
                onChange={e => handleOfficialChange('empStatus', e.target.value)}
              >
                <MenuItem value="">Select</MenuItem>
                <MenuItem value="S">S</MenuItem>
                <MenuItem value="W">W</MenuItem>
              </TextField>
              <TextField label="PF A/C No" fullWidth size="small" variant="outlined"
                value={officialDetails.pfAccountNo}
                onChange={e => handleOfficialChange('pfAccountNo', e.target.value)}
              />
              <TextField label="ESI No" fullWidth size="small" variant="outlined"
                value={officialDetails.esiNo}
                onChange={e => handleOfficialChange('esiNo', e.target.value)}
              />
              <TextField label="Bank A/C No" fullWidth size="small" variant="outlined"
                value={officialDetails.bankAccountNo}
                onChange={e => handleOfficialChange('bankAccountNo', e.target.value)}
              />
              <TextField label="Bank Name" fullWidth size="small" variant="outlined"
                value={officialDetails.bankName}
                onChange={e => handleOfficialChange('bankName', e.target.value)}
              />
              <TextField label="Branch Name" fullWidth size="small" variant="outlined"
                value={officialDetails.branchName}
                onChange={e => handleOfficialChange('branchName', e.target.value)}
              />
              <TextField label="IFSC Code" fullWidth size="small" variant="outlined"
                value={officialDetails.ifscCode}
                onChange={e => handleOfficialChange('ifscCode', e.target.value)}
              />
              <TextField label="PAN No" fullWidth size="small" variant="outlined"
                value={officialDetails.panNo}
                onChange={e => handleOfficialChange('panNo', e.target.value)}
              />
              <TextField label="Aadhar No" type="number" fullWidth size="small" variant="outlined"
                value={officialDetails.aadharNo}
                onChange={e => handleOfficialChange('aadharNo', e.target.value)}
              />
<TextField label="UAN" type="number" fullWidth size="small" variant="outlined"
                value={officialDetails.uanNo}
                onChange={e => handleOfficialChange('uanNo', e.target.value)}
              />
              <TextField label="Passport No" fullWidth size="small" variant="outlined"
                value={officialDetails.passportNo}
                onChange={e => handleOfficialChange('passportNo', e.target.value)}
              />
              <TextField label="Validity" type="date" fullWidth size="small" variant="outlined"
                InputLabelProps={{ shrink: true }}
                value={officialDetails.validity}
                onChange={e => handleOfficialChange('validity', e.target.value)}
              />
              <TextField label="Original Certificates (Y/N)" select fullWidth size="small" variant="outlined"
                value={officialDetails.originalCertificates}
                onChange={e => handleOfficialChange('originalCertificates', e.target.value)}
              >
                <MenuItem value="">Select</MenuItem>
                <MenuItem value="Y">Yes</MenuItem>
                <MenuItem value="N">No</MenuItem>
              </TextField>
              <TextField label="Bond From Dt" type="date" fullWidth size="small" variant="outlined" InputLabelProps={{ shrink: true }}
                value={officialDetails.bondFromDate}
                onChange={e => handleOfficialChange('bondFromDate', e.target.value)}
              />
              <TextField label="Bond To Dt" type="date" fullWidth size="small" variant="outlined" InputLabelProps={{ shrink: true }}
                value={officialDetails.bondToDate}
                onChange={e => handleOfficialChange('bondToDate', e.target.value)}
              />
              <TextField label="Bond Executed (Y/N)" select fullWidth size="small" variant="outlined"
                value={officialDetails.bondExecuted}
                onChange={e => handleOfficialChange('bondExecuted', e.target.value)}
              >
                <MenuItem value="">Select</MenuItem>
                <MenuItem value="Y">Yes</MenuItem>
                <MenuItem value="N">No</MenuItem>
              </TextField>
              <TextField label="Bond Yrs" type="number" fullWidth size="small" variant="outlined"
                value={officialDetails.bondYears}
                onChange={e => handleOfficialChange('bondYears', e.target.value)}
              />
              <TextField label="Weekly Off" select fullWidth size="small" variant="outlined"
                value={officialDetails.weeklyOff}
                onChange={e => handleOfficialChange('weeklyOff', e.target.value)}
              >
                <MenuItem value="">Select</MenuItem>
                <MenuItem value="Sunday">Sunday</MenuItem>
                <MenuItem value="Saturday">Saturday</MenuItem>
              </TextField>
              <TextField label="Shift" select fullWidth size="small" variant="outlined"
                value={officialDetails.shift}
                onChange={e => handleOfficialChange('shift', e.target.value)}
              >
                <MenuItem value="">Select</MenuItem>
                <MenuItem value="A">A</MenuItem>
                <MenuItem value="B">B</MenuItem>
                <MenuItem value="C">C</MenuItem>
                <MenuItem value="G">G</MenuItem>
              </TextField>
              <TextField label="Regular Inc Date" type="date" fullWidth size="small" variant="outlined"
                InputLabelProps={{ shrink: true }}
                value={officialDetails.regularIncDate}
                onChange={e => handleOfficialChange('regularIncDate', e.target.value)}
              />
              <TextField label="DOJ Inc Date" type="date" fullWidth size="small" variant="outlined"
                InputLabelProps={{ shrink: true }}
                value={officialDetails.dojIncDate}
                onChange={e => handleOfficialChange('dojIncDate', e.target.value)}
              />
              <TextField label="Inc Note" fullWidth size="small" variant="outlined"
                value={officialDetails.incNote}
                onChange={e => handleOfficialChange('incNote', e.target.value)}
                sx={{ gridColumn: 'span 2' }}
              />
              <TextField label="Special Note" fullWidth size="small" variant="outlined"
                value={officialDetails.specialNote}
                onChange={e => handleOfficialChange('specialNote', e.target.value)}
                sx={{ gridColumn: 'span 2' }}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={officialDetails.shiftDisable || false}
                    onChange={e => handleOfficialChange('shiftDisable', e.target.checked)}
                  />
                }
                label="Shift Disable"
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                  marginLeft: 0,
                  width: '215px'
                }}
              />
</Box>
            {isEdit && (
              <Box mt={3} textAlign="right">
                <Button variant="contained" color="success" onClick={() => handleSectionUpdate({ officialDetails })}>
                  Update Official Details
                </Button>
              </Box>
            )}
          </Box>
        );


      case 5: // Salary
        return (
          <Paper elevation={3} sx={{ p: 2, background: "#fafbfc" }}>
            {/* Salary Breakup */}
            <Box mb={2}>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(6, 1fr)',
                  gap: 2,
                  '& > *': { minWidth: 0 },
                  '@media (max-width: 1200px)': { gridTemplateColumns: 'repeat(3, 1fr)' },
                  '@media (max-width: 900px)': { gridTemplateColumns: 'repeat(2, 1fr)' },
                  '@media (max-width: 600px)': { gridTemplateColumns: '1fr' },
                }}
              >
                <TextField label="Basic" name="basic" size="small" value={salaryDetails.basic} onChange={handleObjChange(setSalaryDetails)} fullWidth />
                <TextField label="HRA" name="hra" size="small" value={salaryDetails.hra} onChange={handleObjChange(setSalaryDetails)} fullWidth />
                <TextField label="Conveyance" name="conveyance" size="small" value={salaryDetails.conveyance} onChange={handleObjChange(setSalaryDetails)} fullWidth />
                <TextField label="Washing Allowance" name="washingAllowance" size="small" value={salaryDetails.washingAllowance} onChange={handleObjChange(setSalaryDetails)} fullWidth />
                <TextField label="Total Sal" name="totalSal" size="small" value={salaryDetails.totalSal} onChange={handleObjChange(setSalaryDetails)} fullWidth />
                <TextField label="Other Deductions" name="otherDeductions" size="small" value={salaryDetails.otherDeductions} onChange={handleObjChange(setSalaryDetails)} fullWidth />
              </Box>
            </Box>
            <Divider sx={{ my: 2 }} />

            {/* Deductions */}
            <Box mb={2}>
              <Typography variant="subtitle1" sx={{ mb: 1, color: '#155fa0' }}>Deductions</Typography>

              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(6, 1fr)',
                  gap: 2,
                  '& > *': { minWidth: 0 },
                  '@media (max-width: 1200px)': { gridTemplateColumns: 'repeat(3, 1fr)' },
                  '@media (max-width: 900px)': { gridTemplateColumns: 'repeat(2, 1fr)' },
                  '@media (max-width: 600px)': { gridTemplateColumns: '1fr' },
                }}
              >
                {[
                  { label: "ESI", name: "esi" },
                  { label: "PF", name: "pf" },
                  { label: "OT", name: "ot" },
                  { label: "LIC", name: "lic" }
                ].map(({ label, name }) => (
                  <FormControl component="fieldset" key={name} fullWidth>
                    <FormLabel component="legend" sx={{ fontSize: '0.8rem' }}>{label}</FormLabel>
                    <RadioGroup row name={name} value={salaryDetails[name]} onChange={handleObjChange(setSalaryDetails)}>
                      <FormControlLabel value="Yes" control={<Radio size="small" />} label="Yes" />
                      <FormControlLabel value="No" control={<Radio size="small" />} label="No" />
                    </RadioGroup>
                  </FormControl>
                ))}
                <TextField label="LIC Amount" name="licAmount" size="small" value={salaryDetails.licAmount} onChange={handleObjChange(setSalaryDetails)} fullWidth />
                <TextField label="TDS Amount" name="tdsAmount" size="small" value={salaryDetails.tdsAmount} onChange={handleObjChange(setSalaryDetails)} fullWidth />
                <FormControl fullWidth size="small">
                  <FormLabel sx={{ fontSize: '0.8rem' }}>Payment Mode</FormLabel>
                  <Select value={salaryDetails.paymentMode} name="paymentMode" onChange={handleObjChange(setSalaryDetails)} displayEmpty>
                    <MenuItem value="">Select</MenuItem>
                    <MenuItem value="Cash">Cash</MenuItem>
                    <MenuItem value="Bank">Bank</MenuItem>
                  </Select>
                </FormControl>
                <TextField label="Remarks" name="remarks" multiline rows={2} value={salaryDetails.remarks} onChange={handleObjChange(setSalaryDetails)} fullWidth sx={{ gridColumn: 'span 3' }} />
              </Box>
            </Box>
            {isEdit && (
              <Box mt={3} textAlign="right">
                <Button variant="contained" color="success" onClick={() => handleSectionUpdate({ salaryDetails })}>
                  Update Salary Details
                </Button>
              </Box>
            )}
          </Paper>
        );

      case 6: // Training
        return (
          <Box>
            <Typography fontWeight={600} fontSize={17} mb={2}>Training Details</Typography>
            {trainingDetails.map((t, idx) => (
              <Box
                key={idx}
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(6, 1fr)',
                  gap: 1,
                  mb: 1,
                  '& > *': { minWidth: 0 },
                  '@media (max-width: 1200px)': { gridTemplateColumns: 'repeat(3, 1fr)' },
                  '@media (max-width: 900px)': { gridTemplateColumns: 'repeat(2, 1fr)' },
                  '@media (max-width: 600px)': { gridTemplateColumns: '1fr' },
                }}
              >
                <TextField
                  size="small"
                  label="S.No"
                  value={t.sno}
                  fullWidth
                  InputProps={{ readOnly: true }}
                />
                <TextField label="Name" size="small" value={t.name} fullWidth onChange={e => trainHandlers.handleChange(idx, 'name', e.target.value)} />
                <TextField label="Institution" size="small" value={t.institution} fullWidth onChange={e => trainHandlers.handleChange(idx, 'institution', e.target.value)} />
                <TextField label="From" size="small" value={t.from} type="date" InputLabelProps={{ shrink: true }} fullWidth onChange={e => trainHandlers.handleChange(idx, 'from', e.target.value)} />
                <TextField label="To" size="small" value={t.to} type="date" InputLabelProps={{ shrink: true }} fullWidth onChange={e => trainHandlers.handleChange(idx, 'to', e.target.value)} />
                <TextField label="Remarks" size="small" value={t.remarks} fullWidth onChange={e => trainHandlers.handleChange(idx, 'remarks', e.target.value)} />
              </Box>
            ))}
            <Button variant="outlined" size="small" onClick={trainHandlers.addRow} startIcon={<AddIcon />}>Add Row</Button>
          </Box>
        );

      case 7: // Promotion
        return (
          <Box>
            <Typography fontWeight={600} fontSize={17} mb={2}>Promotions</Typography>
            {promotionDetails.map((p, idx) => (
              <Box
                key={idx}
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(5, 1fr)',
                  gap: 1,
                  mb: 1,
                  '& > *': { minWidth: 0 },
                  '@media (max-width: 1200px)': { gridTemplateColumns: 'repeat(3, 1fr)' },
                  '@media (max-width: 900px)': { gridTemplateColumns: 'repeat(2, 1fr)' },
                  '@media (max-width: 600px)': { gridTemplateColumns: '1fr' },
                }}
              >
                <TextField
                  size="small"
                  label="S.No"
                  value={p.sno}
                  fullWidth
                  InputProps={{ readOnly: true }}
                />
                <TextField label="From Post" size="small" value={p.from} fullWidth onChange={e => promoHandlers.handleChange(idx, 'from', e.target.value)} />
                <TextField label="To Post" size="small" value={p.to} fullWidth onChange={e => promoHandlers.handleChange(idx, 'to', e.target.value)} />
                <TextField label="Date" size="small" type="date" InputLabelProps={{ shrink: true }} value={p.date} fullWidth onChange={e => promoHandlers.handleChange(idx, 'date', e.target.value)} />
                <TextField label="Remarks" size="small" value={p.remarks} fullWidth onChange={e => promoHandlers.handleChange(idx, 'remarks', e.target.value)} sx={{ gridColumn: 'span 2' }} />
              </Box>
            ))}
            <Button variant="outlined" size="small" onClick={promoHandlers.addRow} startIcon={<AddIcon />}>Add Row</Button>
          </Box>
        );

      case 8: // Awards
        return (
          <Box>
            <Typography fontWeight={600} fontSize={17} mb={2}>Awards / Rewards</Typography>
            {awardDetails.map((a, idx) => (
              <Box
                key={idx}
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(5, 1fr)',
                  gap: 1,
                  mb: 1,
                  '& > *': { minWidth: 0 },
                  '@media (max-width: 1200px)': { gridTemplateColumns: 'repeat(3, 1fr)' },
                  '@media (max-width: 900px)': { gridTemplateColumns: 'repeat(2, 1fr)' },
                  '@media (max-width: 600px)': { gridTemplateColumns: '1fr' },
                }}
              >
                <TextField
                  size="small"
                  label="S.No"
                  value={a.sno}
                  fullWidth
                  InputProps={{ readOnly: true }}
                />
                <TextField label="Award Name" size="small" value={a.name} fullWidth onChange={e => awardHandlers.handleChange(idx, 'name', e.target.value)} />
                <TextField label="Year" type="number" size="small" value={a.year} fullWidth onChange={e => awardHandlers.handleChange(idx, 'year', e.target.value)} />
                <TextField label="Awarded By" size="small" value={a.by} fullWidth onChange={e => awardHandlers.handleChange(idx, 'by', e.target.value)} />
                <TextField label="Remarks" size="small" value={a.remarks} fullWidth onChange={e => awardHandlers.handleChange(idx, 'remarks', e.target.value)} sx={{ gridColumn: 'span 2' }} />
              </Box>
            ))}
            <Button variant="outlined" size="small" onClick={awardHandlers.addRow} startIcon={<AddIcon />}>Add Row</Button>
          </Box>
        );
      case 9: // Disciplinary Actions
        return (
          <Box>
            <Typography fontWeight={600} fontSize={17} mb={2}>Disciplinary Actions</Typography>
            {discDetails.map((d, idx) => (
              <Box
                key={idx}
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(5, 1fr)',
                  gap: 1,
                  mb: 1,
                  '& > *': { minWidth: 0 },
                  '@media (max-width: 1200px)': { gridTemplateColumns: 'repeat(3, 1fr)' },
                  '@media (max-width: 900px)': { gridTemplateColumns: 'repeat(2, 1fr)' },
                  '@media (max-width: 600px)': { gridTemplateColumns: '1fr' },
                }}
              >
                <TextField
                  size="small"
                  label="S.No"
                  value={d.sno}
                  fullWidth
                  InputProps={{ readOnly: true }}
                />
                <TextField label="Action" size="small" value={d.action} fullWidth onChange={e => discHandlers.handleChange(idx, 'action', e.target.value)} />
                <TextField label="Reason" size="small" value={d.reason} fullWidth onChange={e => discHandlers.handleChange(idx, 'reason', e.target.value)} sx={{ gridColumn: 'span 2' }} />
                <TextField label="Date" size="small" type="date" InputLabelProps={{ shrink: true }} value={d.date} fullWidth onChange={e => discHandlers.handleChange(idx, 'date', e.target.value)} />
                <TextField label="Remarks" size="small" value={d.remarks} fullWidth onChange={e => discHandlers.handleChange(idx, 'remarks', e.target.value)} sx={{ gridColumn: 'span 2' }} />
              </Box>
            ))}
            <Button variant="outlined" size="small" onClick={discHandlers.addRow} startIcon={<AddIcon />}>Add Row</Button>
          </Box>
        );

      case 10: // Increment
        return (
          <Box>
            <Typography fontWeight={600} fontSize={17} mb={2}>Increments</Typography>
            {incrementDetails.map((inc, idx) => (
              <Box
                key={idx}
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: 1,
                  mb: 1,
                  '& > *': { minWidth: 0 },
                  '@media (max-width: 1200px)': { gridTemplateColumns: 'repeat(2, 1fr)' },
                  '@media (max-width: 600px)': { gridTemplateColumns: '1fr' },
                }}
              >
                <TextField
                  size="small"
                  label="S.No"
                  value={inc.sno}
                  fullWidth
                  InputProps={{ readOnly: true }}
                />
                <TextField label="Date" size="small" type="date" InputLabelProps={{ shrink: true }} value={inc.date} fullWidth onChange={e => incrHandlers.handleChange(idx, 'date', e.target.value)} />
                <TextField label="Amount" size="small" value={inc.amount} fullWidth onChange={e => incrHandlers.handleChange(idx, 'amount', e.target.value)} />
                <TextField label="Remarks" size="small" value={inc.remarks} fullWidth onChange={e => incrHandlers.handleChange(idx, 'remarks', e.target.value)} sx={{ gridColumn: 'span 2' }} />
              </Box>
            ))}
            <Button variant="outlined" size="small" onClick={incrHandlers.addRow} startIcon={<AddIcon />}>Add Row</Button>
          </Box>
        );
      case 11: // Canteen
        return (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 2,
              '& > *': { minWidth: 0 },
              '@media (max-width: 900px)': { gridTemplateColumns: 'repeat(2, 1fr)' },
              '@media (max-width: 600px)': { gridTemplateColumns: '1fr' },
            }}
          >
            <TextField
              size="small"
              label="S.No"
              value={canteenDetails.sno}
              fullWidth
              InputProps={{ readOnly: true }}
            />
            <TextField label="Canteen Card No" name="cardno" size="small" value={canteenDetails.cardno} onChange={handleObjChange(setCanteenDetails)} fullWidth />
            <TextField label="Valid From" name="from" type="date" size="small" InputLabelProps={{ shrink: true }} value={canteenDetails.from} onChange={handleObjChange(setCanteenDetails)} fullWidth />
            <TextField label="To" name="to" type="date" size="small" InputLabelProps={{ shrink: true }} value={canteenDetails.to} onChange={handleObjChange(setCanteenDetails)} fullWidth />
          </Box>
        );
      case 12: // LIC
        return (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 2,
              '& > *': { minWidth: 0 },
              '@media (max-width: 900px)': { gridTemplateColumns: 'repeat(2, 1fr)' },
              '@media (max-width: 600px)': { gridTemplateColumns: '1fr' },
            }}
          >

            <TextField
              size="small"
              label="S.No"
              value={licDetails.sno}
              fullWidth
              InputProps={{ readOnly: true }}
            />
            <TextField label="Policy No." name="policyno" size="small" value={licDetails.policyno} onChange={handleObjChange(setLICDetails)} fullWidth />
            <TextField label="Sum Insured" name="sum" size="small" value={licDetails.sum} onChange={handleObjChange(setLICDetails)} fullWidth />
            <TextField label="Nominee" name="nominee" size="small" value={licDetails.nominee} onChange={handleObjChange(setLICDetails)} fullWidth />
          </Box>
        );
      // case 12: // Transfer
      //   return (
      //     <Box>
      //       <Typography fontWeight={600} fontSize={17} mb={2}>Transfer Details</Typography>
      //       {transferDetails.map((t, idx)=>(
      //         <Grid container spacing={1} key={idx} sx={{mb:1}}>
      //            <Grid item xs={12} md={2}>
      //     <TextField
      //       size="small"
      //       label="S.No"
      //       value={mem.sno}
      //       fullWidth
      //       InputProps={{ readOnly: true }}
      //     />
      //   </Grid>
      //           <Grid item xs={12} md={3}><TextField label="From Unit" size="small" value={t.from} fullWidth onChange={e=>transfHandlers.handleChange(idx,'from',e.target.value)}/></Grid>
      //           <Grid item xs={12} md={3}><TextField label="To Unit" size="small" value={t.to} fullWidth onChange={e=>transfHandlers.handleChange(idx,'to',e.target.value)}/></Grid>
      //           <Grid item xs={12} md={3}><TextField label="Date" size="small" type="date" InputLabelProps={{shrink:true}} value={t.date} fullWidth onChange={e=>transfHandlers.handleChange(idx,'date',e.target.value)}/></Grid>
      //           <Grid item xs={12} md={3}><TextField label="Remarks" size="small" value={t.remarks} fullWidth onChange={e=>transfHandlers.handleChange(idx,'remarks',e.target.value)}/></Grid>
      //         </Grid>
      //       ))}
      //       <Button variant="outlined" size="small" onClick={transfHandlers.addRow} startIcon={<AddIcon/>}>Add Row</Button>
      //     </Box>
      //   );

      default: return null;
    }
  }

  // -- UI Layout --
  return (
    <Box sx={{
      background: isModal ? 'transparent' : '#f4f7f9',
      height: isModal ? '100%' : 'auto',
      minHeight: isModal ? 'auto' : '100vh',
      p: isModal ? 0 : 3,
      display: 'flex',
      flexDirection: 'column'
    }}>
      <Box sx={{
        maxWidth: 1250,
        width: '100%',
        mx: 'auto',
        bgcolor: 'white',
        borderRadius: isModal ? 0 : 2,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        flexGrow: 1,
        boxShadow: isModal ? 'none' : '0 8px 32px rgba(0,0,0,0.08)'
      }}>

        {/* Sticky Header */}
        <Box sx={{
          p: 2.5,
          borderBottom: '1px solid #edf2f7',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          bgcolor: 'white',
          position: 'sticky',
          top: 0,
          zIndex: 10
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar
              src={photoPreview || currentPhoto}
              sx={{ width: 56, height: 56, boxShadow: 1 }}
              variant="rounded"
            >
              {!photoPreview && !currentPhoto && <PersonIcon />}
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight="bold" color="text.primary">
                {isEdit ? `Editing: ${formData.ename || 'Employee'}` : 'New Employee'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {formData.empid ? `EMP ID: ${formData.empid}` : 'Draft Profile'}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <input
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              id="emp-upload"
              onChange={handlePhotoChange}
            />
            <label htmlFor="emp-upload">
              <Button component="span" size="small" variant="outlined" startIcon={<PhotoCameraIcon />}>
                Photo
              </Button>
            </label>
            <Button
              size="small"
              variant="contained"
              color="secondary"
              onClick={handlePhotoUpload}
            >
              Update Photo
            </Button>
            {!isModal && (
              <Button
                variant="contained"
                color="primary"
                startIcon={<SaveIcon />}
                onClick={handleSubmit}
              >
                Save Record
              </Button>
            )}
            {isModal && (
              <IconButton onClick={onModalClose} color="inherit" sx={{ ml: 1 }}>
                <CloseIcon />
              </IconButton>
            )}
          </Box>
        </Box>

        {/* Sticky Tabs */}
        <Box sx={{
          bgcolor: '#f8fafc',
          borderBottom: '1px solid #edf2f7',
          position: 'sticky',
          top: isModal ? 80 : 0, // adjust if header height differs
          zIndex: 9
        }}>
          <Tabs
            value={tabIndex}
            onChange={(_, v) => setTabIndex(v)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              px: 2,
              '& .MuiTab-root': {
                minHeight: 48,
                textTransform: 'none',
                fontWeight: 500,
                fontSize: '0.9rem'
              }
            }}
          >
            {tabLabels.map((t, i) => <Tab key={i} label={t} />)}
          </Tabs>
        </Box>

        {/* Form Content Area */}
        <Box sx={{
          p: 3,
          flexGrow: 1,
          overflowY: 'auto',
          bgcolor: 'white',
          '&::-webkit-scrollbar': { width: '8px' },
          '&::-webkit-scrollbar-thumb': { bgcolor: '#e2e8f0', borderRadius: '4px' }
        }}>
          <form autoComplete="off">
            {renderTabContent()}
          </form>
        </Box>
      </Box>
    </Box>
  );
}
